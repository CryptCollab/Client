import { socket } from "../App";
import { collabDocument } from "./yjs";



/** 
 * @deprecated
 */

export const fireEventHandlers = (document: collabDocument) => {
	const { socketInstance } = socket;
	socketInstance.connect();
	socketInstance.on("connect", socket.onConnect);
	socketInstance.on("disconnect", socket.onDisconnect);
	socketInstance.on("documentUpdate", document.applyDocumentUpdate);
	// socketInstance.on("usersInRoom", socket.processUsersInRoom);
	socketInstance.on("groupMessage", socket.processGroupMessage);
	socketInstance.on("awarenessUpdate", socket.applyAwarenessUpdate);
  
	socket.awareness.on("update", socket.distributeAwarenessUpdate);
};

/** 
 * @deprecated
 */

export const removeEventHandlers = (document: collabDocument) => {
	const { socketInstance } = socket;
	socketInstance.off("connect", socket.onConnect);
	socketInstance.off("disconnect", socket.onDisconnect);
	socketInstance.off("documentUpdate", document.applyDocumentUpdate);
	socketInstance.off("groupMessage", socket.processGroupMessage);
	socketInstance.off("awarenessUpdate", socket.applyAwarenessUpdate);
	document.ydoc.off("update", socket.distributeDocumentUpdate);
	socket.awareness.off("update", socket.distributeAwarenessUpdate);
};