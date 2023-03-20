import { SodiumPlus, Ed25519PublicKey, Ed25519SecretKey, CryptographyKey } from "sodium-plus";
import { X3DH, PreKeyPair, InitServerInfo, InitSenderInfo, SignedBundle, InitClientFunction, IdentityKeyPair } from "../cryptolib/x3dh";
import { Buffer } from "buffer";


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
    }

    returnIdentityString = async (): Promise<string> => {
        const identityString = await this.x3dh.identityKeyManager.getMyIdentityString();
        return identityString;
    }

    destroyIdentityKeyStore = async () => {
        await this.x3dh.destoryKeyStore();
    }

    hexEncodeIdentityPublic = async (identityPublic: Ed25519PublicKey): Promise<string> => {
        if (!this.sodium) this.sodium = await SodiumPlus.auto();
        const identityPublicBuffer: Buffer = identityPublic.getBuffer();
        //console.log(identityPublicBuffer)
        const hexEncodedIdentityPublic = await this.sodium.sodium_bin2hex(identityPublicBuffer)
        //console.log(hexEncodedIdentityPublic)

        return hexEncodedIdentityPublic
    }

    decodeIdentityKeyfromHexEncodedString = async (identityKey: string): Promise<Ed25519PublicKey> => {
        if (!this.sodium)
            this.sodium = await SodiumPlus.auto();

        const identityPublic = new Ed25519PublicKey(
            await this.sodium.sodium_hex2bin(identityKey)
        )
        return identityPublic;
    }

    generateNonce = async (): Promise<Buffer> => {
        if (!this.sodium) this.sodium = await SodiumPlus.auto();
        const nonce = await this.sodium.randombytes_buf(24);
        return nonce;
    }

    returnHexEncodedNonce = async (): Promise<string> => {
        if (!this.sodium) this.sodium = await SodiumPlus.auto();
        const nonce = await this.generateNonce();
        const hexEncodedNonce = await this.sodium.sodium_bin2hex(nonce);
        return hexEncodedNonce;
    }

    generateGroupKey = async (): Promise<Buffer> => {
        if (!this.sodium) this.sodium = await SodiumPlus.auto();
        const groupKey = await this.sodium.crypto_aead_xchacha20poly1305_ietf_keygen();
        return groupKey.getBuffer();
    }

    returnHexEncodedGroupKey = async (): Promise<string> => {
        if (!this.sodium) this.sodium = await SodiumPlus.auto();
        const groupKey = await this.generateGroupKey();
        const hexEncodedGroupKey = await this.sodium.sodium_bin2hex(groupKey);
        return hexEncodedGroupKey;
    }

    generateAndsaveIdentityKeysToIDB = async () => {
        if (!this.sodium) this.sodium = await SodiumPlus.auto();
        if (!this.x3dh.keyStore)
            await this.x3dh.initKeyStore();
        const identityKeys = await this.x3dh.identityKeyManager.generateIdentityKeypair();
        await this.x3dh.identityKeyManager.saveIdentityKeypair(identityKeys, this.x3dh.keyStore);
        return identityKeys;
    }

    loadIdentityKeysFromIDB = async (): Promise<IdentityKeyPair> => {
        if (!this.sodium)
            this.sodium = await SodiumPlus.auto();
        const identityKeys: IdentityKeyPair = await this.x3dh.identityKeyManager.getIdentityKeypair(this.x3dh.keyStore);
        return identityKeys;
    }

    generatePreKeyBundle = async (): Promise<InitServerInfo> => {
        const identityKeys: IdentityKeyPair = await this.generateAndsaveIdentityKeysToIDB();
        const signedPreKeyBundle: SignedBundle = await this.x3dh.generateOneTimeKeys(identityKeys.identitySecret, 1);
        const encodededIdentityPublic = await this.hexEncodeIdentityPublic(identityKeys.identityPublic)
        // console.log(`Hex encoded Identity Public key being sent: `)
        // console.log(encodededIdentityPublic)
        const preKeyBundle: InitServerInfo = {
            IdentityKey: encodededIdentityPublic,
            SignedPreKey: {
                Signature: signedPreKeyBundle.signature,
                PreKey: signedPreKeyBundle.bundle.join('')
            },
        }
        return preKeyBundle;
    }

    returnPreKeyBundleAsPromise = async (): Promise<InitServerInfo> => {
        return this.preKeyBundleFromParticipant;
    }

    establishSharedKeyAndEncryptFirstMessage = async (recipientID: string, preKeyBundle: InitServerInfo, message: string) => {
        this.preKeyBundleFromParticipant = preKeyBundle;
        this.preKeyBundleFromLeader = await this.x3dh.initSend(recipientID, this.returnPreKeyBundleAsPromise, message);
        return this.preKeyBundleFromLeader;
    }

    establishSharedKeyAndDecryptFirstMessage = async (senderInfo: InitSenderInfo): Promise<(string | Buffer)[]> => {
        const decryptedData = await this.x3dh.initRecv(senderInfo);
        return decryptedData;
    }

    encryptGroupMessage = async (message: string): Promise<string> => {
        if (!this.sodium) this.sodium = await SodiumPlus.auto();
        const nonce = await this.sodium.sodium_hex2bin(this.groupKeyStore.nonce);
        const groupKey = new CryptographyKey(await this.sodium.sodium_hex2bin(this.groupKeyStore.groupKey));
        const encryptedMessage = await this.sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(message, nonce, groupKey);
        const encodedEncryptedMessage = await this.sodium.sodium_bin2hex(encryptedMessage);
        return encodedEncryptedMessage;
    }

    decryptGroupMessage = async (encryptedMessage: string): Promise<string> => {
        if (!this.sodium) this.sodium = await SodiumPlus.auto();
        const nonce = await this.sodium.sodium_hex2bin(this.groupKeyStore.nonce);
        const groupKey = new CryptographyKey(await this.sodium.sodium_hex2bin(this.groupKeyStore.groupKey));
        const decodedMessage = await this.sodium.sodium_hex2bin(encryptedMessage);
        const decryptedMessage = await this.sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(decodedMessage, nonce, groupKey);
        return decryptedMessage.toString();
    }


}






// /**
//     * Encodes the public identity key to a hex string
//     * @param {identityPublic} Ed25519PublicKey 
//     * @returns {hexEncodedIdentityPublic} string
// */

// export async function hexEncodeIdentityPublic(
//     identityPublic: Ed25519PublicKey
// ): Promise<string> {
//     if (!sodium) sodium = await SodiumPlus.auto();
//     const identityPublicBuffer: Buffer = identityPublic.getBuffer();
//     //console.log(identityPublicBuffer)
//     const hexEncodedIdentityPublic = await sodium.sodium_bin2hex(identityPublicBuffer)
//     //console.log(hexEncodedIdentityPublic)

//     return hexEncodedIdentityPublic
// }


// export async function encryptGroupMessage(groupKeyStore: GroupKeyStore, message: string): Promise<string> {
//     if (!sodium) sodium = await SodiumPlus.auto();
//     const nonce = await sodium.sodium_hex2bin(groupKeyStore.nonce);
//     const groupKey = new CryptographyKey(await sodium.sodium_hex2bin(groupKeyStore.groupKey));
//     const encryptedMessage = await sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(message, nonce, groupKey);
//     const encodedEncryptedMessage = await sodium.sodium_bin2hex(encryptedMessage);
//     return encodedEncryptedMessage;
// }

// export async function decryptGroupMessage(groupKeyStore: GroupKeyStore, encryptedMessage: string): Promise<string> {
//     if (!sodium) sodium = await SodiumPlus.auto();
//     const nonce = await sodium.sodium_hex2bin(groupKeyStore.nonce);
//     const groupKey = new CryptographyKey(await sodium.sodium_hex2bin(groupKeyStore.groupKey));
//     const decodedMessage = await sodium.sodium_hex2bin(encryptedMessage);
//     const decryptedMessage = await sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(decodedMessage, nonce, groupKey);
//     return decryptedMessage.toString();
// }


// async function generateNonce(): Promise<Buffer> {
//     if (!sodium) sodium = await SodiumPlus.auto();
//     const nonce = await sodium.randombytes_buf(24);
//     return nonce;
// }

// export async function returnHexEncodedNonce(): Promise<string> {
//     if (!sodium) sodium = await SodiumPlus.auto();
//     const nonce = await generateNonce();
//     const hexEncodedNonce = await sodium.sodium_bin2hex(nonce);
//     return hexEncodedNonce;
// }

// async function generateGroupKey(): Promise<Buffer> {
//     if (!sodium) sodium = await SodiumPlus.auto();
//     const groupKey = await sodium.crypto_aead_xchacha20poly1305_ietf_keygen();
//     return groupKey.getBuffer();
// }

// export async function returnHexEncodedGroupKey(): Promise<string> {
//     if (!sodium) sodium = await SodiumPlus.auto();
//     const groupKey = await generateGroupKey();
//     const hexEncodedGroupKey = await sodium.sodium_bin2hex(groupKey);
//     return hexEncodedGroupKey;
// }


// export async function setIdentity(id: string) {
//     await x3dh.identityKeyManager.setMyIdentityString(id);
// }


// export async function generateAndsaveIdentityKeysToIDB(): Promise<IdentityKeyPair> {
//     if (!sodium)
//         sodium = await SodiumPlus.auto();
//     if (!x3dh.keyStore)
//         await x3dh.initKeyStore();
//     const identityKeys: IdentityKeyPair = await x3dh.identityKeyManager.generateIdentityKeypair();
//     await x3dh.identityKeyManager.saveIdentityKeypair(identityKeys, x3dh.keyStore);
//     return identityKeys;
// }

// export async function loadIdentityKeysFromIDB(): Promise<IdentityKeyPair> {
//     if (!sodium)
//     sodium = await SodiumPlus.auto();
//     const identityKeys: IdentityKeyPair = await x3dh.identityKeyManager.getIdentityKeypair(x3dh.keyStore);
//     return identityKeys;
// }


// export async function generatePreKeyBundle(): Promise<InitServerInfo> {
//     const identityKeys: IdentityKeyPair = await generateAndsaveIdentityKeysToIDB();
//     const signedPreKeyBundle: SignedBundle = await x3dh.generateOneTimeKeys(identityKeys.identitySecret, 1);
//     const encodededIdentityPublic = await hexEncodeIdentityPublic(identityKeys.identityPublic)
//     // console.log(`Hex encoded Identity Public key being sent: `)
//     // console.log(encodededIdentityPublic)
//     const preKeyBundle: InitServerInfo = {
//         IdentityKey: encodededIdentityPublic,
//         SignedPreKey: {
//             Signature: signedPreKeyBundle.signature,
//             PreKey: signedPreKeyBundle.bundle.join('')
//         },
//     }
//     return preKeyBundle;
// }


// async function returnPreKeyBundleAsPromise(): Promise<InitServerInfo> {
//     return preKeyBundleFromServer;
// }

// export async function establishSharedKeyAndEncryptFirstMessage(recipientID: string, preKeyBundle: InitServerInfo, message: string) {
//     preKeyBundleFromServer = preKeyBundle;
//     const firstMessageBundle: InitSenderInfo = await x3dh.initSend(recipientID, returnPreKeyBundleAsPromise, message);
//     return firstMessageBundle;
// }


// export async function establishSharedKeyAndDecryptFirstMessage(senderInfo: InitSenderInfo) {
//     const decryptedData = await x3dh.initRecv(senderInfo);
//     return decryptedData;
// }


// export async function decodeIdentityKeyfromHexEncodedString(identityKey: string): Promise<Ed25519PublicKey> {
//     if (!sodium)
//         sodium = await SodiumPlus.auto();

//     const identityPublic = new Ed25519PublicKey(
//         await sodium.sodium_hex2bin(identityKey)
//     )
//     return identityPublic;
// }

// export async function destroyIdentityKeyStore() {
//     await x3dh.destoryKeyStore();
// }


// export async function returnIdentityString(): Promise<string> {
//     const identityString = await x3dh.identityKeyManager.getMyIdentityString();
//     return identityString;
// }
