import { io } from "socket.io-client";
import { fromUint8Array, toUint8Array } from "js-base64";
import { cryptoUtils } from "../App";
import { InitServerInfo } from "../cryptolib/x3dh";
import { document } from "../components/TextEditor";
import * as awarenessProtocol from "y-protocols/awareness.js";
import { Doc } from "yjs";
// "undefined" means the URL will be computed from the `window.location` object


export class socketHandlers {
	socketInstance: any;
	socketURL: string;
	isConnected: boolean | undefined;
	awareness: any;
	documentID!: string;
	updateCounter = 0;
	constructor(socketURL: string | undefined) {
		this.socketURL = socketURL || "http://localhost:8080";
		this.updateCounter = 0;
		this.socketInstance = io(this.socketURL, {
			autoConnect: false,
			transports: ["websocket"],
		});
		this.isConnected = false;

	}
	initAwareness = (ydoc: Doc) => {
		this.awareness = new awarenessProtocol.Awareness(ydoc);
		this.setAwarenessState();
	};
	onConnect =  () => {
		console.log("Connected to server with id: ", this.socketInstance.id);
		this.isConnected = true;
		
		this.socketInstance.emit("documentID", this.documentID);
	};
	onDisconnect = async () => {
		//await cryptoUtils.destroyIdentityKeyStore();
		//console.log("Disconnected from server");
		this.isConnected = false;
	};

	processGroupMessage = async (groupMessage: string) => {
		//console.log("Received group message");
		const decryptedGroupMessage = await cryptoUtils.decryptGroupMessage(
			groupMessage
		);
		console.log(decryptedGroupMessage);
	};

	distributeDocumentUpdate = async (update: any, origin: any) => {
		if (origin === null) {
			//console.log("Not distributing update");
			return;
		}
		//console.log("Distributing update");
		this.updateCounter++;
		if (this.updateCounter % 30 === 0) { 
			const encodedState = document.returnEncodedStateVector();
			const encryptedState = await cryptoUtils.encryptGroupMessage(fromUint8Array(encodedState));
			this.socketInstance.emit("documentState", this.documentID, encryptedState);
		}
		
		const encryptedUpdate = await cryptoUtils.encryptGroupMessage(fromUint8Array(update));
		this.socketInstance.emit("documentUpdate", this.documentID ,encryptedUpdate);
	};

	distributeAwarenessUpdate = (changeObject: { added: []; updated: []; removed: []; }, origin: any) => {
		if (origin === null) {
			//console.log("Not distributing awareness update");
			return;
		}
		const { added, updated, removed } = changeObject;
		const changedClients = added.concat(updated).concat(removed);
		const encodedAwarenessState = awarenessProtocol.encodeAwarenessUpdate(this.awareness, changedClients);
		this.socketInstance.emit("awarenessUpdate", this.documentID ,fromUint8Array(encodedAwarenessState));
	};

	setAwarenessState = () => {
		this.awareness.setLocalStateField("user", {
			name: "User " + Math.floor(Math.random() * 100),
			color: "#" + Math.floor(Math.random() * 0xFFFFFF).toString(16)
		});
	};

	applyAwarenessUpdate = async (update: string) => {
		const decodedAwarenessUpdate = toUint8Array(update);
		//console.log("Applying awareness update");
		awarenessProtocol.applyAwarenessUpdate(this.awareness, decodedAwarenessUpdate, null);
	};


	// getPreKeyBundleWithUserID = async (userID: string) => {
	// 	this.socketInstance.emit("getPreKeyBundleWithUserID", userID);
	// };

	preKeyBundleRecievedFromServer = async (preKeyBundle: InitServerInfo) => {
		return preKeyBundle;
	};

	// initiateSecureHandshake = async (preKeyBundle: InitServerInfo, userID: string) => {
	// 	const groupKey = await cryptoUtils.generateGroupKeyStoreBundle();
	// 	const inviterMessageBundle = await cryptoUtils.establishSharedKeyAndEncryptFirstMessage(
	// 		userID,
	// 		preKeyBundle,
	// 		groupKey
	// 	);
	// };

	// processUsersInRoom = async (users: any) => {
	// 	console.log("Users in room", users);
	// 	if (users === 1) {
	// 		await cryptoUtils.generateGroupKeys();
	// 	}
	// 	else {
	// 		console.log("Joined the document!!");
	// 		socket.socketInstance.emit("joinedDocument", "joined the document");
	// 	}
	// };


	// processPreKeyBundleAndSendFirstMessageToParticipant = async (preKeyBundle: InitServerInfo, participant: string) => {
	// 	//console.log("Received preKeyBundle from server");
	// 	const firstGroupMessage = await cryptoUtils.encryptGroupMessage(
	// 		"Welcome to the document!!"
	// 	);
	// 	const message = await cryptoUtils.generateGroupKeyStoreBundle();
	// 	const firstMessageBundle: InitSenderInfo =
	// 		await cryptoUtils.establishSharedKeyAndEncryptFirstMessage(
	// 			participant,
	// 			preKeyBundle,
	// 			message
	// 		);
	// 	this.socketInstance.emit(
	// 		"firstMessage",
	// 		firstMessageBundle,
	// 		participant,
	// 		firstGroupMessage
	// 	);
	// };


	// processFirstMessageFromGroupLeader = async (firstMessageBundle: InitSenderInfo, firstGroupMessage: string) => {
	// 	//console.log(`Received first message from `, firstMessageBundle);
	// 	const decryptedData = await cryptoUtils.establishSharedKeyAndDecryptFirstMessage(
	// 		firstMessageBundle
	// 	);
	// 	cryptoUtils.groupKeyStore = {
	// 		nonce: decryptedData.toString().slice(0, 48),
	// 		groupKey: decryptedData.toString().slice(48),
	// 	};
	// 	cryptoUtils.saveGroupKeysToIDB(cryptoUtils.groupKeyStore);
	// 	//console.log(cryptoUtils.groupKeyStore);
	// 	const decryptedGroupMessage = await cryptoUtils.decryptGroupMessage(
	// 		firstGroupMessage
	// 	);
	// 	console.log(decryptedGroupMessage);
	// 	const firstPeerMessage = await cryptoUtils.encryptGroupMessage(
	// 		"Thanks for letting me join the document!!"
	// 	);
	// 	this.socketInstance.emit("groupMessage", firstPeerMessage);
	// 	//return groupKeyStore;
	// };

	connectHandler = (doc: Doc) => {
		this.socketInstance.connect();
		this.initAwareness(doc);
		this.socketInstance.on("connect", this.onConnect);
		this.socketInstance.on("disconnect", this.onDisconnect);
		this.socketInstance.on("groupMessage", this.processGroupMessage);
		this.socketInstance.on("documentUpdate", document.applyDocumentUpdate);
		this.socketInstance.on("documentState", document.setDocumentState);
		this.socketInstance.on("awarenessUpdate", this.applyAwarenessUpdate);
		this.socketInstance.on("preKeyBundleWithUserID", this.preKeyBundleRecievedFromServer);
		this.awareness.on("update", this.distributeAwarenessUpdate);
	};

	disconnectHandler = () => {
		this.socketInstance.disconnect();
		this.socketInstance.off("connect", this.onConnect);
		this.socketInstance.off("disconnect", this.onDisconnect);
		this.socketInstance.off("groupMessage", this.processGroupMessage);
		this.socketInstance.off("documentUpdate", document.applyDocumentUpdate);
		this.socketInstance.off("awarenessUpdate", this.applyAwarenessUpdate);
		this.socketInstance.off("preKeyBundleWithUserID", this.preKeyBundleRecievedFromServer);
		this.awareness.off("update", this.distributeAwarenessUpdate);
	};


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
