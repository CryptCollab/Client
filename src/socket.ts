import { io } from 'socket.io-client';
import { fromUint8Array, toUint8Array } from "js-base64";
import { decryptGroupMessage, destroyIdentityKeyStore, encryptGroupMessage, establishSharedKeyAndDecryptFirstMessage, establishSharedKeyAndEncryptFirstMessage, generateAndsaveIdentityKeysToIDB, generatePreKeyBundle, GroupKeyStore, returnHexEncodedGroupKey, returnHexEncodedNonce, returnIdentityString, setIdentity } from './utils/crypto';
import { InitSenderInfo, InitServerInfo } from './cryptolib/x3dh';
// "undefined" means the URL will be computed from the `window.location` object
const URL = process.env.NODE_ENV === 'production' ? undefined : 'http://localhost:8080';
export let groupKeyStore: GroupKeyStore;
export const socket = io('http://localhost:8080', {
    autoConnect: false,
    transports: ['websocket'],
});

export async function onConnect() {
    console.log("Connected to server with id: ", socket.id);
    await setIdentity(socket.id);
}

export async function onDisconnect() {
    await destroyIdentityKeyStore();
    //console.log("Disconnected from server");
}

export async function processUsersInRoom(users: any) {
    console.log("Users in room", users);
    if (users === 1) {
        await generateAndsaveIdentityKeysToIDB();
        groupKeyStore = {
            nonce: await returnHexEncodedNonce(),
            groupKey: await returnHexEncodedGroupKey(),
        };
    } else {
        const preKeyBundle: InitServerInfo = await generatePreKeyBundle();
        //console.log("Prekey bundle generated and sent to server");
        socket.emit("preKeyBundle", preKeyBundle, socket.id);
    }
}


export async function processPreKeyBundleForHandshake(
    preKeyBundle: InitServerInfo,
    participant: string
) {
    //console.log("Received preKeyBundle from server");
    const firstGroupMessage = await encryptGroupMessage(
        groupKeyStore,
        "Welcome to the document!!"
    );
    const message = groupKeyStore.nonce + groupKeyStore.groupKey;
    const firstMessageBundle: InitSenderInfo =
        await establishSharedKeyAndEncryptFirstMessage(
            participant,
            preKeyBundle,
            message
        );
    socket.emit(
        "firstMessage",
        firstMessageBundle,
        participant,
        firstGroupMessage
    );
}


export async function processFirstMessage(
    firstMessageBundle: InitSenderInfo,
    firstGroupMessage: string
) {
    //console.log(`Received first message from `, firstMessageBundle);
    const decryptedData = await establishSharedKeyAndDecryptFirstMessage(
        firstMessageBundle
    );
    groupKeyStore = {
        nonce: decryptedData.toString().slice(0, 48),
        groupKey: decryptedData.toString().slice(48),
    };
    const decryptedGroupMessage = await decryptGroupMessage(
        groupKeyStore,
        firstGroupMessage
    );
    console.log(decryptedGroupMessage);
    const firstPeerMessage = await encryptGroupMessage(
        groupKeyStore,
        "Thanks for letting me join the document!!"
    );
    socket.emit("groupMessage", firstPeerMessage);
    return groupKeyStore;
}

export async function distributeUpdate(update: any, origin: any) {
    if (origin === null) {
        //console.log("Not distributing update");
        return;
    }
    //console.log("Distributing update");
    const encryptedUpdate = await encryptGroupMessage(groupKeyStore, fromUint8Array(update));
    socket.emit("documentUpdate", encryptedUpdate);
}

export async function decryptUpdate(update: string) {
    const decryptedUpdate = await decryptGroupMessage(groupKeyStore, update);
    return decryptedUpdate;
}




export async function processGroupMessage(groupMessage: string) {
    //console.log("Received group message");
    const decryptedGroupMessage = await decryptGroupMessage(
        groupKeyStore,
        groupMessage
    );
    console.log(decryptedGroupMessage);
}
