import { io } from 'socket.io-client';
import { fromUint8Array, toUint8Array } from "js-base64";
import { cryptoUtils } from '../App';
import { InitSenderInfo, InitServerInfo } from '../cryptolib/x3dh';
// "undefined" means the URL will be computed from the `window.location` object


export class socketHandlers {
    socketInstance: any;
    socketURL: string;
    isConnected: boolean | undefined;
    constructor(socketURL: string | undefined) {
        this.socketURL = socketURL || "http://localhost:8080";
        this.socketInstance = io(this.socketURL, {
            autoConnect: false,
            transports: ['websocket'],
        });
        this.isConnected = false;
    }
    onConnect = async () => {
        console.log("Connected to server with id: ", this.socketInstance.id);
        await cryptoUtils.setIdentity(this.socketInstance.id);
        this.isConnected = true;
    }
    onDisconnect = async () => {
        await cryptoUtils.destroyIdentityKeyStore();
        //console.log("Disconnected from server");
    }

    processUsersInRoom = async (users: any) => {
        console.log("Users in room", users);
        if (users === 1) {
            await cryptoUtils.generateAndsaveIdentityKeysToIDB();
            cryptoUtils.groupKeyStore = {
                nonce: await cryptoUtils.returnHexEncodedNonce(),
                groupKey: await cryptoUtils.returnHexEncodedGroupKey(),
            };
        } else {
            const preKeyBundle: InitServerInfo = await cryptoUtils.generatePreKeyBundle();
            //console.log("Prekey bundle generated and sent to server");
            this.socketInstance.emit("preKeyBundle", preKeyBundle, this.socketInstance.id);
        }
    }

    processPreKeyBundleAndSendFirstMessageToParticipant = async (preKeyBundle: InitServerInfo, participant: string) => {
        //console.log("Received preKeyBundle from server");
        const firstGroupMessage = await cryptoUtils.encryptGroupMessage(
            "Welcome to the document!!"
        );
        const message = cryptoUtils.groupKeyStore.nonce + cryptoUtils.groupKeyStore.groupKey;
        const firstMessageBundle: InitSenderInfo =
            await cryptoUtils.establishSharedKeyAndEncryptFirstMessage(
                participant,
                preKeyBundle,
                message
            );
        this.socketInstance.emit(
            "firstMessage",
            firstMessageBundle,
            participant,
            firstGroupMessage
        );
    }

    processFirstMessageFromGroupLeader = async (firstMessageBundle: InitSenderInfo, firstGroupMessage: string) => {
        //console.log(`Received first message from `, firstMessageBundle);
        const decryptedData = await cryptoUtils.establishSharedKeyAndDecryptFirstMessage(
            firstMessageBundle
        );
        cryptoUtils.groupKeyStore = {
            nonce: decryptedData.toString().slice(0, 48),
            groupKey: decryptedData.toString().slice(48),
        };
        const decryptedGroupMessage = await cryptoUtils.decryptGroupMessage(
            firstGroupMessage
        );
        console.log(decryptedGroupMessage);
        const firstPeerMessage = await cryptoUtils.encryptGroupMessage(
            "Thanks for letting me join the document!!"
        );
        this.socketInstance.emit("groupMessage", firstPeerMessage);
        //return groupKeyStore;
    }

    processGroupMessage = async (groupMessage: string) => {
        //console.log("Received group message");
        const decryptedGroupMessage = await cryptoUtils.decryptGroupMessage(
            groupMessage
        );
        console.log(decryptedGroupMessage);
    }

    distributeDocumentUpdate = async (update: any, origin: any) => {
        if (origin === null) {
            //console.log("Not distributing update");
            return;
        }
        //console.log("Distributing update");
        const encryptedUpdate = await cryptoUtils.encryptGroupMessage(fromUint8Array(update));
        this.socketInstance.emit("documentUpdate", encryptedUpdate);
    }


}



// export const socket = io('http://localhost:8080', {
//     autoConnect: false,
//     transports: ['websocket'],
// });

// export async function onConnect() {
//     console.log("Connected to server with id: ", socket.id);
//     await setIdentity(socket.id);
// }

// export async function onDisconnect() {
//     await destroyIdentityKeyStore();
//     //console.log("Disconnected from server");
// }

// export async function processUsersInRoom(users: any) {
//     console.log("Users in room", users);
//     if (users === 1) {
//         await generateAndsaveIdentityKeysToIDB();
//         groupKeyStore = {
//             nonce: await returnHexEncodedNonce(),
//             groupKey: await returnHexEncodedGroupKey(),
//         };
//     } else {
//         const preKeyBundle: InitServerInfo = await generatePreKeyBundle();
//         //console.log("Prekey bundle generated and sent to server");
//         socket.emit("preKeyBundle", preKeyBundle, socket.id);
//     }
// }


// export async function processPreKeyBundleForHandshake(
//     preKeyBundle: InitServerInfo,
//     participant: string
// ) {
//     //console.log("Received preKeyBundle from server");
//     const firstGroupMessage = await encryptGroupMessage(
//         groupKeyStore,
//         "Welcome to the document!!"
//     );
//     const message = groupKeyStore.nonce + groupKeyStore.groupKey;
//     const firstMessageBundle: InitSenderInfo =
//         await establishSharedKeyAndEncryptFirstMessage(
//             participant,
//             preKeyBundle,
//             message
//         );
//     socket.emit(
//         "firstMessage",
//         firstMessageBundle,
//         participant,
//         firstGroupMessage
//     );
// }


// export async function processFirstMessage(
//     firstMessageBundle: InitSenderInfo,
//     firstGroupMessage: string
// ) {
//     //console.log(`Received first message from `, firstMessageBundle);
//     const decryptedData = await establishSharedKeyAndDecryptFirstMessage(
//         firstMessageBundle
//     );
//     groupKeyStore = {
//         nonce: decryptedData.toString().slice(0, 48),
//         groupKey: decryptedData.toString().slice(48),
//     };
//     const decryptedGroupMessage = await decryptGroupMessage(
//         groupKeyStore,
//         firstGroupMessage
//     );
//     console.log(decryptedGroupMessage);
//     const firstPeerMessage = await encryptGroupMessage(
//         groupKeyStore,
//         "Thanks for letting me join the document!!"
//     );
//     socket.emit("groupMessage", firstPeerMessage);
//     return groupKeyStore;
// }

// export async function distributeUpdate(update: any, origin: any) {
//     if (origin === null) {
//         //console.log("Not distributing update");
//         return;
//     }
//     //console.log("Distributing update");
//     const encryptedUpdate = await encryptGroupMessage(groupKeyStore, fromUint8Array(update));
//     socket.emit("documentUpdate", encryptedUpdate);
// }

// export async function decryptUpdate(update: string) {
//     const decryptedUpdate = await decryptGroupMessage(groupKeyStore, update);
//     return decryptedUpdate;
// }




// export async function processGroupMessage(groupMessage: string) {
//     //console.log("Received group message");
//     const decryptedGroupMessage = await decryptGroupMessage(
//         groupKeyStore,
//         groupMessage
//     );
//     console.log(decryptedGroupMessage);
// }
