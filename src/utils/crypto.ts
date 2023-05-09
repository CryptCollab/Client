import { SodiumPlus, Ed25519PublicKey, CryptographyKey } from "sodium-plus";
import { X3DH, InitServerInfo, InitSenderInfo, SignedBundle, IdentityKeyPair, PreKeyPair } from "../cryptolib/x3dh";
import { Buffer } from "buffer";
import { Dump, Store } from "../cryptolib/secureIDBStorage";
import { _genRandomBuffer, decrypt, encrypt, genEncryptedMasterKey, decryptMasterKey, genAESKey } from "easy-web-crypto";


export type GroupKeyStore = {
	groupKey: string,
	nonce: string,
}
export class CryptoUtils {
	preKeyBundleFromParticipant!: InitServerInfo;
	preKeyBundleFromLeader!: InitSenderInfo;
	sodium!: SodiumPlus;
	x3dh!: X3DH;
	groupKeyStore!: GroupKeyStore;
	constructor() {
		this.x3dh = new X3DH();
	}

	setIdentity = async (id: string) => {
		await this.x3dh.identityKeyManager.setMyIdentityString(id);
	};

	returnIdentityString = async (): Promise<string> => {
		const identityString = await this.x3dh.identityKeyManager.getMyIdentityString();
		return identityString;
	};

	destroyIdentityKeyStore = async () => {
		await this.x3dh.destroyKeyStore();
	};

	hexEncodeIdentityPublic = async (identityPublic: Ed25519PublicKey): Promise<string> => {
		if (!this.sodium) this.sodium = await SodiumPlus.auto();
		const identityPublicBuffer: Buffer = identityPublic.getBuffer();
		//console.log(identityPublicBuffer)
		const hexEncodedIdentityPublic = await this.sodium.sodium_bin2hex(identityPublicBuffer);
		//console.log(hexEncodedIdentityPublic)

		return hexEncodedIdentityPublic;
	};

	decodeIdentityKeyfromHexEncodedString = async (identityKey: string): Promise<Ed25519PublicKey> => {
		if (!this.sodium)
			this.sodium = await SodiumPlus.auto();

		const identityPublic = new Ed25519PublicKey(
			await this.sodium.sodium_hex2bin(identityKey)
		);
		return identityPublic;
	};

	generateNonce = async (): Promise<Buffer> => {
		if (!this.sodium) this.sodium = await SodiumPlus.auto();
		const nonce = await this.sodium.randombytes_buf(24);
		return nonce;
	};

	returnHexEncodedNonce = async (): Promise<string> => {
		if (!this.sodium) this.sodium = await SodiumPlus.auto();
		const nonce = await this.generateNonce();
		const hexEncodedNonce = await this.sodium.sodium_bin2hex(nonce);
		return hexEncodedNonce;
	};

	generateGroupKey = async (): Promise<Buffer> => {
		if (!this.sodium) this.sodium = await SodiumPlus.auto();
		const groupKey = await this.sodium.crypto_aead_xchacha20poly1305_ietf_keygen();
		return groupKey.getBuffer();
	};

	returnHexEncodedGroupKey = async (): Promise<string> => {
		if (!this.sodium) this.sodium = await SodiumPlus.auto();
		const groupKey = await this.generateGroupKey();
		const hexEncodedGroupKey = await this.sodium.sodium_bin2hex(groupKey);
		return hexEncodedGroupKey;
	};

	generateAndsaveIdentityKeysToIDB = async () => {
		if (!this.sodium) this.sodium = await SodiumPlus.auto();
		if (!this.x3dh.keyStore)
			await this.x3dh.initKeyStore();
		const identityKeys = await this.x3dh.identityKeyManager.generateIdentityKeypair();
		await this.x3dh.identityKeyManager.saveIdentityKeypair(identityKeys, this.x3dh.keyStore);
		return identityKeys;
	};

	loadIdentityKeysFromIDB = async (): Promise<IdentityKeyPair> => {
		if (!this.sodium)
			this.sodium = await SodiumPlus.auto();
		const identityKeys: IdentityKeyPair = await this.x3dh.identityKeyManager.getIdentityKeypair(this.x3dh.keyStore);
		return identityKeys;
	};

	generateGroupKeys = async () => {
		// if (!this.x3dh.keyStore)
		// 	await this.x3dh.initKeyStore();
		this.groupKeyStore = {
			nonce: await this.returnHexEncodedNonce(),
			groupKey: await this.returnHexEncodedGroupKey(),
		};
		return this.groupKeyStore;

	};

	saveGroupKeysToIDB = async (groupKeyStore: GroupKeyStore, documentID: string) => {
		if (!this.x3dh.keyStore)
			await this.x3dh.initKeyStore();
		await this.x3dh.keyStore.init();
		await this.x3dh.keyStore.set(documentID, groupKeyStore);
	};

	loadGroupKeyStoreFromIDB = async (documentID: string): Promise<GroupKeyStore> => {
		if (!this.x3dh.keyStore) {
			throw new Error("KeyStore not initialized");
		}
		await this.x3dh.keyStore.init();
		const groupKeyStore: GroupKeyStore = await this.x3dh.keyStore.get(documentID);
		return groupKeyStore;
	};

	generateGroupKeyStoreBundle = async (documentID: string): Promise<string> => {
		const groupKeyStore: GroupKeyStore = await this.loadGroupKeyStoreFromIDB(documentID);
		const groupKeyStoreBundle = groupKeyStore.nonce+groupKeyStore.groupKey;
		return groupKeyStoreBundle;
	};

	generatePreKeyBundle = async (): Promise<InitServerInfo> => {
		const identityKeys: IdentityKeyPair = await this.generateAndsaveIdentityKeysToIDB();
		const signedPreKeyBundle: SignedBundle = await this.x3dh.generateOneTimeKeys(identityKeys.identitySecret, 1);
		const encodededIdentityPublic = await this.hexEncodeIdentityPublic(identityKeys.identityPublic);
		// console.log(`Hex encoded Identity Public key being sent: `)
		// console.log(encodededIdentityPublic)
		const preKeyBundle: InitServerInfo = {
			IdentityKey: encodededIdentityPublic,
			SignedPreKey: {
				Signature: signedPreKeyBundle.signature,
				PreKey: signedPreKeyBundle.bundle.join("")
			},
		};
		return preKeyBundle;
	};

	returnPreKeyBundleAsPromise = async (): Promise<InitServerInfo> => {
		return this.preKeyBundleFromParticipant;
	};

	returnPreKeyPair = async (): Promise<PreKeyPair> => {
		const preKeyPair = await this.x3dh.identityKeyManager.getPreKeypair(this.x3dh.keyStore);
		return preKeyPair;
	};

	establishSharedKeyAndEncryptFirstMessage = async (recipientID: string, preKeyBundle: InitServerInfo, message: string) => {
		this.preKeyBundleFromParticipant = preKeyBundle;
		this.preKeyBundleFromLeader = await this.x3dh.initSend(recipientID, this.returnPreKeyBundleAsPromise, message);
		return this.preKeyBundleFromLeader;
	};

	establishSharedKeyAndDecryptFirstMessage = async (senderInfo: InitSenderInfo): Promise<(string | Buffer)[]> => {
		const decryptedData = await this.x3dh.initRecv(senderInfo);
		return decryptedData;
	};

	encryptGroupMessage = async (message: string): Promise<string> => {
		if (!this.sodium) this.sodium = await SodiumPlus.auto();
		const nonce = await this.sodium.sodium_hex2bin(this.groupKeyStore.nonce);
		const groupKey = new CryptographyKey(await this.sodium.sodium_hex2bin(this.groupKeyStore.groupKey));
		const encryptedMessage = await this.sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(message, nonce, groupKey);
		const encodedEncryptedMessage = await this.sodium.sodium_bin2hex(encryptedMessage);
		return encodedEncryptedMessage;
	};

	decryptGroupMessage = async (encryptedMessage: string): Promise<string> => {
		if (!this.sodium) this.sodium = await SodiumPlus.auto();
		const nonce = await this.sodium.sodium_hex2bin(this.groupKeyStore.nonce);
		const groupKey = new CryptographyKey(await this.sodium.sodium_hex2bin(this.groupKeyStore.groupKey));
		const decodedMessage = await this.sodium.sodium_hex2bin(encryptedMessage);
		const decryptedMessage = await this.sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(decodedMessage, nonce, groupKey);
		return decryptedMessage.toString();
	};

	setIdentityAndReturnPreKeyBundle = async (identity: string): Promise<InitServerInfo> => {
		await this.setIdentity(identity);
		const preKeyBundle: InitServerInfo = await this.generatePreKeyBundle();
		return preKeyBundle;
	};

	returnKeyStoreAsDump = async (): Promise<Dump> => {
		if (!this.x3dh.keyStore) {
			throw new Error("KeyStore not initialized");
		}
		const encryptedKeyStore = await this.x3dh.exportKeyStore();
		return encryptedKeyStore;
	}

	initKeyStoreFromDump = async (dump: Dump) => {
		await this.x3dh.importKeyStore(dump);
	}

	initialiseKeyStore = async () => {
		await this.x3dh.initKeyStore();
	}

	doesKeyStoreExist = (): boolean => {
		return this.x3dh.keyStore !== undefined;
	}

	returnFromKeyStore = async (key: string): Promise<any> => {
		if (!this.x3dh.keyStore) {
			throw new Error("KeyStore not initialized");
		}
		await this.x3dh.keyStore.init();
		const value = await this.x3dh.keyStore.get(key as string);
		return value;
	}

	setIdentityAndReferenceKeyStore = async (identity: string) => {
		await this.setIdentity(identity);
		await this.initialiseKeyStore();
		await this.x3dh.keyStore.init();
	}

	importIntoStore = async (dump: Dump) => {
		await this.x3dh.keyStore.init();
		await this.x3dh.keyStore.import(dump);
	}

}





