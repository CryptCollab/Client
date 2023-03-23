import { io } from 'socket.io-client';
import { fromUint8Array, toUint8Array } from "js-base64";
import { cryptoUtils} from '../App';
import { InitSenderInfo, InitServerInfo } from '../cryptolib/x3dh';
import { document } from '../pages/TextEditor';
import * as awarenessProtocol from 'y-protocols/awareness.js'
import { Doc } from 'yjs';
// "undefined" means the URL will be computed from the `window.location` object


export class socketHandlers {
    socketInstance: any;
    socketURL: string;
    isConnected: boolean | undefined;
    awareness: any;
    constructor(socketURL: string | undefined) {
        this.socketURL = socketURL || "http://localhost:8080";
        this.socketInstance = io(this.socketURL, {
            autoConnect: false,
            transports: ['websocket'],
        });
        this.isConnected = false;

    }
    initAwareness = (ydoc: Doc) => {
        this.awareness = new awarenessProtocol.Awareness(ydoc);
        this.setAwarenessState();
    }
    onConnect = async () => {
        //console.log("Connected to server with id: ", this.socketInstance.id);
        await cryptoUtils.setIdentity(this.socketInstance.id);
        this.isConnected = true;
    }
    onDisconnect = async () => {
        await cryptoUtils.destroyIdentityKeyStore();
        //console.log("Disconnected from server");
        this.isConnected = false;
    }

    processUsersInRoom = async (users: any) => {
        //console.log("Users in room", users);
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
        //console.log(cryptoUtils.groupKeyStore);
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
        console.log("Received group message");
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

    distributeAwarenessUpdate = (changeObject: { added: []; updated: []; removed: []; }, origin: any) => {
        if (origin === null) {
            //console.log("Not distributing awareness update");
            return;
        }
        const { added, updated, removed } = changeObject;
        const changedClients = added.concat(updated).concat(removed);
        const encodedAwarenessState = awarenessProtocol.encodeAwarenessUpdate(this.awareness, changedClients);
        this.socketInstance.emit("awarenessUpdate", fromUint8Array(encodedAwarenessState));
    }

    setAwarenessState = () => {
        const colorHexCode = '#' + Math.floor(Math.random() * 0xFFFFFF).toString(16).slice(0,6)
        this.awareness.setLocalStateField('user', {
            name: "User " + Math.floor(Math.random() * 100),
            color: colorHexCode
        })
        console.log(colorHexCode)
    }
    applyAwarenessUpdate = async (update: string) => {
        const decodedAwarenessUpdate = toUint8Array(update);
        //console.log("Applying awareness update from server")
        awarenessProtocol.applyAwarenessUpdate(this.awareness, decodedAwarenessUpdate, null);
    }

    connectHandler = (doc: Doc) => {
        this.socketInstance.connect();
        this.initAwareness(doc);
        this.socketInstance.on("connect", this.onConnect);
        this.socketInstance.on("disconnect", this.onDisconnect);
        this.socketInstance.on("usersInRoom", this.processUsersInRoom);
        this.socketInstance.on("prekeyBundleForHandshake", this.processPreKeyBundleAndSendFirstMessageToParticipant);
        this.socketInstance.on("firstMessageForHandshake", this.processFirstMessageFromGroupLeader);
        this.socketInstance.on("groupMessage", this.processGroupMessage);
        this.socketInstance.on("documentUpdate", document.applyDocumentUpdate);
        this.socketInstance.on("awarenessUpdate", this.applyAwarenessUpdate);
        this.awareness.on('update', this.distributeAwarenessUpdate);
    }

    disconnectHandler = () => {
        this.socketInstance.disconnect();
        this.socketInstance.off("connect", this.onConnect);
        this.socketInstance.off("disconnect", this.onDisconnect);
        this.socketInstance.off("usersInRoom", this.processUsersInRoom);
        this.socketInstance.off("preKeyBundle", this.processPreKeyBundleAndSendFirstMessageToParticipant);
        this.socketInstance.off("firstMessage", this.processFirstMessageFromGroupLeader);
        this.socketInstance.off("groupMessage", this.processGroupMessage);
        this.socketInstance.off("documentUpdate", document.applyDocumentUpdate);
        this.socketInstance.off("awarenessUpdate", this.applyAwarenessUpdate);
        this.awareness.off('update', this.distributeAwarenessUpdate);
    }


}

