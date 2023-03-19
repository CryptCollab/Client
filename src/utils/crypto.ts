import { SodiumPlus, Ed25519PublicKey, Ed25519SecretKey, CryptographyKey } from "sodium-plus";
import { X3DH, PreKeyPair, InitServerInfo, InitSenderInfo, SignedBundle, InitClientFunction } from "../cryptolib/x3dh";
import { Buffer } from "buffer";

let preKeyBundleFromServer: InitServerInfo;
let sodium: SodiumPlus;
const x3dh = new X3DH();
type IdentityKeyPair = { identitySecret: Ed25519SecretKey, identityPublic: Ed25519PublicKey }
export type GroupKeyStore = { groupKey: string, nonce: string }

/**
    * Encodes the public identity key to a hex string
    * @param {identityPublic} Ed25519PublicKey 
    * @returns {hexEncodedIdentityPublic} string
*/

export async function hexEncodeIdentityPublic(
    identityPublic: Ed25519PublicKey
): Promise<string> {
    if (!sodium) sodium = await SodiumPlus.auto();
    const identityPublicBuffer: Buffer = identityPublic.getBuffer();
    //console.log(identityPublicBuffer)
    const hexEncodedIdentityPublic = await sodium.sodium_bin2hex(identityPublicBuffer)
    //console.log(hexEncodedIdentityPublic)

    return hexEncodedIdentityPublic
}


export async function encryptGroupMessage(groupKeyStore: GroupKeyStore, message: string): Promise<Buffer> {
    if (!sodium) sodium = await SodiumPlus.auto();
    const nonce = await sodium.sodium_hex2bin(groupKeyStore.nonce);
    const groupKey = new CryptographyKey(await sodium.sodium_hex2bin(groupKeyStore.groupKey));
    const encryptedMessage = await sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(message, nonce, groupKey);
    return encryptedMessage;
}

export async function decryptGroupMessage(groupKeyStore: GroupKeyStore, encryptedMessage: Buffer): Promise<string> {
    if (!sodium) sodium = await SodiumPlus.auto();
    const nonce = await sodium.sodium_hex2bin(groupKeyStore.nonce);
    const groupKey = new CryptographyKey(await sodium.sodium_hex2bin(groupKeyStore.groupKey));
    const decryptedMessage = await sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(encryptedMessage, nonce, groupKey);
    return decryptedMessage.toString();
}


async function generateNonce(): Promise<Buffer> {
    if (!sodium) sodium = await SodiumPlus.auto();
    const nonce = await sodium.randombytes_buf(24);
    return nonce;
}

export async function returnHexEncodedNonce(): Promise<string> {
    if (!sodium) sodium = await SodiumPlus.auto();
    const nonce = await generateNonce();
    const hexEncodedNonce = await sodium.sodium_bin2hex(nonce);
    return hexEncodedNonce;
}

async function generateGroupKey(): Promise<Buffer> {
    if (!sodium) sodium = await SodiumPlus.auto();
    const groupKey = await sodium.crypto_aead_xchacha20poly1305_ietf_keygen();
    return groupKey.getBuffer();
}

export async function returnHexEncodedGroupKey(): Promise<string> {
    if (!sodium) sodium = await SodiumPlus.auto();
    const groupKey = await generateGroupKey();
    const hexEncodedGroupKey = await sodium.sodium_bin2hex(groupKey);
    return hexEncodedGroupKey;
}


export async function setIdentity(id: string) {
    await x3dh.identityKeyManager.setMyIdentityString(id);
}


export async function generateAndsaveIdentityKeysToIDB(): Promise<IdentityKeyPair> {
    if (!sodium)
        sodium = await SodiumPlus.auto();
    if (!x3dh.keyStore)
        await x3dh.initKeyStore();
    const identityKeys: IdentityKeyPair = await x3dh.identityKeyManager.generateIdentityKeypair();
    await x3dh.identityKeyManager.saveIdentityKeypair(identityKeys, x3dh.keyStore);
    return identityKeys;
}

export async function loadIdentityKeysFromIDB(): Promise<IdentityKeyPair> {
    if (!sodium)
    sodium = await SodiumPlus.auto();
    const identityKeys: IdentityKeyPair = await x3dh.identityKeyManager.getIdentityKeypair(x3dh.keyStore);
    return identityKeys;
}


export async function generatePreKeyBundle(): Promise<InitServerInfo> {
    const identityKeys: IdentityKeyPair = await generateAndsaveIdentityKeysToIDB();
    const signedPreKeyBundle: SignedBundle = await x3dh.generateOneTimeKeys(identityKeys.identitySecret, 1);
    const encodededIdentityPublic = await hexEncodeIdentityPublic(identityKeys.identityPublic)
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


async function returnPreKeyBundleAsPromise(): Promise<InitServerInfo> {
    return preKeyBundleFromServer;
}

export async function establishSharedKeyAndEncryptFirstMessage(recipientID: string, preKeyBundle: InitServerInfo, message: string) {
    preKeyBundleFromServer = preKeyBundle;
    const firstMessageBundle: InitSenderInfo = await x3dh.initSend(recipientID, returnPreKeyBundleAsPromise, message);
    return firstMessageBundle;
}


export async function establishSharedKeyAndDecryptFirstMessage(senderInfo: InitSenderInfo) {
    const decryptedData = await x3dh.initRecv(senderInfo);
    return decryptedData;
}


export async function decodeIdentityKeyfromHexEncodedString(identityKey: string): Promise<Ed25519PublicKey> {
    if (!sodium)
        sodium = await SodiumPlus.auto();

    const identityPublic = new Ed25519PublicKey(
        await sodium.sodium_hex2bin(identityKey)
    )
    return identityPublic;
}


export async function returnIdentityString(): Promise<string> {
    const identityString = await x3dh.identityKeyManager.getMyIdentityString();
    return identityString;
}
