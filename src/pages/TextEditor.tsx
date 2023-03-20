import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import { collabDocument } from "../utils/yjs";
import { socket } from "../App";
import { toUint8Array } from "js-base64";
import { useEffect } from "react";

const document = new collabDocument();

const Tiptap = () => {
  useEffect(() => {
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
    return () => {
      socketInstance.connect();
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
    };
  }, []);
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // The Collaboration extension comes with its own history handling
        history: false,
      }),
      // Register the document with Tiptap
      Collaboration.configure({
        document: document.ydoc,
      }),
    ],
    //content: "Hello World",
  });

  return <EditorContent editor={editor} />;
};

export default Tiptap;
