import {
	CryptographyKey,
	Ed25519PublicKey,
	Ed25519SecretKey,
	SodiumPlus,
	X25519PublicKey, X25519SecretKey
} from "sodium-plus";
import {
	KeyDerivationFunction,
	blakeKdf,
	SymmetricEncryptionInterface,
	SymmetricCrypto
} from "./lib/symmetric";
import {
	DefaultSessionKeyManager,
	SessionKeyManagerInterface,
	IdentityKeyManagerInterface,
	DefaultIdentityKeyManager,
	PreKeyPair,
} from "./lib/persistence";
import {
	concat,
	generateKeyPair,
	generateBundle,
	signBundle,
	verifyBundle,
	wipe
} from "./lib/util";
import { Buffer } from "buffer";
import { Dump, Store } from "../cryptolib/secureIDBStorage";
/**
 * Initial server info.
 *
 * Contains the information necessary to complete
 * the X3DH handshake from a sender's side.
 */
export type InitServerInfo = {
	IdentityKey: string,
	SignedPreKey: {
		Signature: string,
		PreKey: string
	},
	OneTimeKey?: string
};

/**
 * Initial information about a sender
 */
export type InitSenderInfo = {
	Sender: string,
	IdentityKey: string,
	EphemeralKey: string,
	OneTimeKey?: string | null,
	CipherText: string
};

/**
 * Send a network request to the server to obtain the public keys needed
 * to complete the sender's handshake.
 */
export type InitClientFunction = (id: string) => Promise<InitServerInfo>;

/**
 * Signed key bundle.
 */
export type SignedBundle = { signature: string, bundle: string[] };

/**
 * Initialization information for receiving a handshake message.
 */
type RecipientInitWithSK = {
	IK: Ed25519PublicKey,
	EK: X25519PublicKey,
	SK: CryptographyKey,
	OTK?: string | null
};


/**
 * Pluggable X3DH implementation, powered by libsodium.
 */
export class X3DH {
	encryptor: SymmetricEncryptionInterface;
	kdf: KeyDerivationFunction;
	identityKeyManager: IdentityKeyManagerInterface;
	sessionKeyManager: SessionKeyManagerInterface;
	sodium!: SodiumPlus;
	keyStore!: Store;
	constructor(
		identityKeyManager?: IdentityKeyManagerInterface,
		sessionKeyManager?: SessionKeyManagerInterface,
		encryptor?: SymmetricEncryptionInterface,
		kdf?: KeyDerivationFunction
	) {
		if (!sessionKeyManager) {
			sessionKeyManager = new DefaultSessionKeyManager();
		}
		if (!identityKeyManager) {
			identityKeyManager = new DefaultIdentityKeyManager();
		}
		if (!encryptor) {
			encryptor = new SymmetricCrypto();
		}
		if (!kdf) {
			kdf = blakeKdf;
		}
		this.encryptor = encryptor;
		this.kdf = kdf;
		this.sessionKeyManager = sessionKeyManager;
		this.identityKeyManager = identityKeyManager;
	}

	/**
	 * Initialize the key store.
	 * @returns {Promise<void>}
	*/

	async initKeyStore(): Promise<void> {
		const identityString = await this.identityKeyManager.getMyIdentityString();
		this.keyStore = new Store(identityString, "x3dh");
		await this.keyStore.init();
	}


	/**
	 * Destroy the key store.
	 * @returns {Promise<void>}
	 */
	async destroyKeyStore(): Promise<void> {
		await this.keyStore.init();
		await this.keyStore.destroy();
	}

	/**
	 * Exports the encrypted key store to a dump object.
	 * @returns {Promise<Dump>}
	 */

	async exportKeyStore(): Promise<Dump> {
		await this.keyStore.init();
		return await this.keyStore.export();
	}

	/**
	 * Imports the encrypted key store from a dump object.
	 * @param dump
	 * @returns {Promise<void>} 
	 */

	async importKeyStore(dump: Dump): Promise<void> {
		await this.initKeyStore();
		await this.keyStore.init();
		await this.keyStore.import(dump);
	}


	/**
	 * @returns {SodiumPlus}
	 */
	async getSodium(): Promise<SodiumPlus> {
		if (!this.sodium) {
			this.sodium = await SodiumPlus.auto();
		}
		return this.sodium;
	}
	/**
	 * Generates and signs a bundle of one-time keys.
	 *
	 * Useful for pushing more OTKs to the server.
	 *
	 * @param {Ed25519SecretKey} signingKey
	 * @param {number} numKeys
	 */
	async generateOneTimeKeys(
		signingKey: Ed25519SecretKey,
		numKeys: number
	): Promise<SignedBundle> {
		const sodium = await this.getSodium();
		const bundle = await generateBundle(numKeys);
		const publicKeys = bundle.map(x => x.publicKey);
		const signature = await signBundle(signingKey, publicKeys);
		await this.identityKeyManager.persistOneTimeKeys(bundle);
		if (numKeys == 1) {
			const prekeyPair: PreKeyPair = {
				preKeyPublic: bundle[0].publicKey,
				preKeySecret: bundle[0].secretKey
			};
			//this.keyStore.preKeyPair = prekeyPair;
			await this.identityKeyManager.savePreKeyPair(prekeyPair, this.keyStore);
		}
		// Hex-encode all the public keys
		const encodedBundle: string[] = [];
		for (const pk of publicKeys) {
			encodedBundle.push(await sodium.sodium_bin2hex(pk.getBuffer()));
		}

		return {
			"signature": await sodium.sodium_bin2hex(signature),
			"bundle": encodedBundle
		};
	}




	/**
	 * Get the shared key when sending an initial message.
	 *
	 * @param {InitServerInfo} res
	 * @param {Ed25519SecretKey} senderKey
	 */
	async initSenderGetSK(
		res: InitServerInfo,
		senderKey: Ed25519SecretKey
	): Promise<RecipientInitWithSK> {
		const sodium = await this.getSodium();
		const identityKey = new Ed25519PublicKey(
			await sodium.sodium_hex2bin(res.IdentityKey)
		);
		const signedPreKey = new X25519PublicKey(
			await sodium.sodium_hex2bin(res.SignedPreKey.PreKey)
		);
		const signature = await sodium.sodium_hex2bin(res.SignedPreKey.Signature);

		// Check signature
		const valid = await verifyBundle(identityKey, [signedPreKey], signature);
		if (!valid) {
			throw new Error("Invalid signature");
		}
		const ephemeral = await generateKeyPair();
		const ephSecret = ephemeral.secretKey;
		const ephPublic = ephemeral.publicKey;

		// Turn the Ed25519 keys into X25519 keys for X3DH:
		const senderX = await sodium.crypto_sign_ed25519_sk_to_curve25519(senderKey);
		const recipientX = await sodium.crypto_sign_ed25519_pk_to_curve25519(identityKey);

		// See the X3DH specification to really understand this part:
		const DH1 = await sodium.crypto_scalarmult(senderX, signedPreKey);
		const DH2 = await sodium.crypto_scalarmult(ephSecret, recipientX);
		const DH3 = await sodium.crypto_scalarmult(ephSecret, signedPreKey);
		let SK: CryptographyKey;
		if (res.OneTimeKey) {
			const DH4 = await sodium.crypto_scalarmult(
				ephSecret,
				new X25519PublicKey(await sodium.sodium_hex2bin(res.OneTimeKey))
			);
			SK = new CryptographyKey(
				Buffer.from(await this.kdf(
					concat(
						DH1.getBuffer(),
						DH2.getBuffer(),
						DH3.getBuffer(),
						DH4.getBuffer()
					)
				))
			);
			await wipe(DH4);
		} else {
			SK = new CryptographyKey(
				Buffer.from(await this.kdf(
					concat(
						DH1.getBuffer(),
						DH2.getBuffer(),
						DH3.getBuffer()
					)
				))
			);
		}

		// Wipe DH keys since we have SK
		await wipe(DH1);
		await wipe(DH2);
		await wipe(DH3);
		await wipe(ephSecret);
		await wipe(senderX);
		const recipientPayload: RecipientInitWithSK = {
			IK: identityKey,
			EK: ephPublic,
			SK: SK,
			// eslint-disable-next-line no-constant-condition
			OTK: typeof res.OneTimeKey ? res.OneTimeKey : null
		};
		return recipientPayload;
	}

	/**
	 * Initialize for sending.
	 *
	 * @param {string} recipientIdentity
	 * @param {InitClientFunction} getServerResponse
	 * @param {string|Buffer} message
	 */
	async initSend(
		recipientIdentity: string,
		getServerResponse: InitClientFunction,
		message: string | Buffer
	): Promise<InitSenderInfo> {
		const sodium = await this.getSodium();

		// Get the identity key for the sender:
		const senderIdentity = await this.identityKeyManager.getMyIdentityString();
		const identity = await this.identityKeyManager.getIdentityKeypair(this.keyStore);
		const senderSecretKey = identity.identitySecret;
		const senderPublicKey: Ed25519PublicKey = identity.identityPublic;
		//console.log(`Identity public being sent: `, senderPublicKey.getBuffer());
		// Stub out a call to get the server response:
		const response = await getServerResponse(recipientIdentity);
		// Get the shared symmetric key (and other handshake data):
		const { IK, EK, SK, OTK } = await this.initSenderGetSK(response, senderSecretKey);
		// console.log(`Shared symmetric key at sender side: `)
		// console.log(SK.getBuffer());
		// Get the assocData for AEAD:
		const assocData = await sodium.sodium_bin2hex(
			Buffer.concat([senderPublicKey.getBuffer(), IK.getBuffer()])
		);

		// Set the session key (as a sender):
		//console.log(`Recipient identity: ${recipientIdentity}`)
		await this.sessionKeyManager.setSessionKey(recipientIdentity, SK, false);
		await this.sessionKeyManager.setAssocData(recipientIdentity, assocData);
		return {
			"Sender": senderIdentity,
			"IdentityKey": await sodium.sodium_bin2hex(senderPublicKey.getBuffer()),
			"EphemeralKey": await sodium.sodium_bin2hex(EK.getBuffer()),
			"OneTimeKey": OTK,
			"CipherText": await this.encryptor.encrypt(
				message,
				await this.sessionKeyManager.getEncryptionKey(recipientIdentity, false),
				assocData
			)
		};
	}

	/**
	 * Get the shared key when receiving an initial message.
	 *
	 * @param {InitSenderInfo} req
	 * @param {Ed25519SecretKey} identitySecret
	 * @param preKeySecret
	 */
	async initRecvGetSk(
		req: InitSenderInfo,
		identitySecret: Ed25519SecretKey,
		preKeySecret: X25519SecretKey
	) {
		const sodium = await this.getSodium();

		// Decode strings
		const senderIdentityKey = new Ed25519PublicKey(
			await sodium.sodium_hex2bin(req.IdentityKey),
		);
		//console.log(`Sender identity key: `, senderIdentityKey.getBuffer());
		const ephemeral = new X25519PublicKey(
			await sodium.sodium_hex2bin(req.EphemeralKey),
		);

		// Ed25519 -> X25519
		const senderX = await sodium.crypto_sign_ed25519_pk_to_curve25519(senderIdentityKey);
		const recipientX = await sodium.crypto_sign_ed25519_sk_to_curve25519(identitySecret);

		// See the X3DH specification to really understand this part:
		const DH1 = await sodium.crypto_scalarmult(preKeySecret, senderX);
		const DH2 = await sodium.crypto_scalarmult(recipientX, ephemeral);
		const DH3 = await sodium.crypto_scalarmult(preKeySecret, ephemeral);

		let SK: CryptographyKey;
		if (req.OneTimeKey) {
			const DH4 = await sodium.crypto_scalarmult(
				await this.identityKeyManager.fetchAndWipeOneTimeSecretKey(req.OneTimeKey),
				ephemeral
			);
			SK = new CryptographyKey(
				Buffer.from(await this.kdf(
					concat(
						DH1.getBuffer(),
						DH2.getBuffer(),
						DH3.getBuffer(),
						DH4.getBuffer()
					)
				))
			);
			await wipe(DH4);
		} else {
			SK = new CryptographyKey(
				Buffer.from(await this.kdf(
					concat(
						DH1.getBuffer(),
						DH2.getBuffer(),
						DH3.getBuffer()
					)
				))
			);
		}
		// Wipe DH keys since we have SK
		await wipe(DH1);
		await wipe(DH2);
		await wipe(DH3);
		await wipe(recipientX);
		return {
			Sender: req.Sender,
			SK: SK,
			IK: senderIdentityKey
		};
	}

	/**
	 * Initialize keys for receiving an initial message.
	 * Returns the initial plaintext message on success.
	 * Throws on failure.
	 *
	 * @param {InitSenderInfo} req
	 * @returns {(string|Buffer)[]}
	 */
	async initRecv(req: InitSenderInfo): Promise<(string | Buffer)[]> {
		const sodium = await this.getSodium();
		const { identitySecret, identityPublic } = await this.identityKeyManager.getIdentityKeypair(this.keyStore);
		const { preKeySecret } = await this.identityKeyManager.getPreKeypair(this.keyStore);
		const { Sender, SK, IK } = await this.initRecvGetSk(
			req,
			identitySecret,
			preKeySecret
		);
		
		// console.log("Shared symmetric key at recipient side: ")
		// console.log(SK.getBuffer())
		const assocData = await sodium.sodium_bin2hex(
			Buffer.from(concat(IK.getBuffer(), identityPublic.getBuffer()))
		);
		//console.log(assocData)
		try {
			await this.sessionKeyManager.setSessionKey(Sender, SK, true);
			await this.sessionKeyManager.setAssocData(Sender, assocData);
			return [
				await this.encryptor.decrypt(
					req.CipherText,
					await this.sessionKeyManager.getEncryptionKey(Sender, true),
					assocData
				)
			];
		} catch (e) {
			// Decryption failure! Destroy the session.
			await this.sessionKeyManager.destroySessionKey(Sender);
			throw e;
		}
	}

	/**
	 * Encrypt the next message to send to the recipient.
	 *
	 * @param {string} recipient
	 * @param {string|Buffer} message
	 * @returns {string}
	 */
	async encryptNext(recipient: string, message: string | Buffer): Promise<string> {
		return this.encryptor.encrypt(
			message,
			await this.sessionKeyManager.getEncryptionKey(recipient, false),
			await this.sessionKeyManager.getAssocData(recipient)
		);
	}

	/**
	 * Decrypt the next message received by the sender.
	 *
	 * @param {string} sender
	 * @param {string} encrypted
	 * @returns {string|Buffer}
	 */
	async decryptNext(sender: string, encrypted: string) {
		return this.encryptor.decrypt(
			encrypted,
			await this.sessionKeyManager.getEncryptionKey(sender, true),
			await this.sessionKeyManager.getAssocData(sender)
		);
	}

	/**
	 * Sets the identity string for the current user.
	 *
	 * @param {string} id
	 */
	async setIdentityString(id: string): Promise<void> {
		return this.identityKeyManager.setMyIdentityString(id);
	}
}

/* Let's make sure we export the interfaces/etc. we use. */
export * from "./lib/symmetric";
export * from "./lib/persistence";
export * from "./lib/util";