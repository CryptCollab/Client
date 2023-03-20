import { socket } from "../App";
import { collabDocument } from "./yjs";


export const fireEventHandlers = (document: collabDocument) => {
    const { socketInstance } = socket;
    socketInstance.connect();
    socketInstance.on("connect", socket.onConnect);
    socketInstance.on("disconnect", socket.onDisconnect);
    socketInstance.on("documentUpdate", document.applyDocumentUpdate);
    socketInstance.on("usersInRoom", socket.processUsersInRoom);
    socketInstance.on(
      "prekeyBundleForHandshake",
      socket.processPreKeyBundleAndSendFirstMessageToParticipant
    );
    socketInstance.on(
      "firstMessageForHandshake",
      socket.processFirstMessageFromGroupLeader
    );
    socketInstance.on("groupMessage", socket.processGroupMessage);
    document.ydoc.on("update", socket.distributeDocumentUpdate);
}



export const removeEventHandlers = (document: collabDocument) => {
    const { socketInstance } = socket;
    socketInstance.off("connect", socket.onConnect);
    socketInstance.off("disconnect", socket.onDisconnect);
    socketInstance.off("documentUpdate", document.applyDocumentUpdate);
    socketInstance.off("usersInRoom", socket.processUsersInRoom);
    socketInstance.off(
      "prekeyBundleForHandshake",
      socket.processPreKeyBundleAndSendFirstMessageToParticipant
    );
    socketInstance.off(
      "firstMessageForHandshake",
      socket.processFirstMessageFromGroupLeader
    );
    socketInstance.off("groupMessage", socket.processGroupMessage);
    document.ydoc.off("update", socket.distributeDocumentUpdate);
}