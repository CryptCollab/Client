import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import * as Y from "yjs";
import {
  distributeUpdate,
  onConnect,
  onDisconnect,
  processFirstMessage,
  processGroupMessage,
  processPreKeyBundleForHandshake,
  processUsersInRoom,
  socket,
} from "../socket";
import { toUint8Array } from "js-base64";
import { useEffect } from "react";

const ydoc = new Y.Doc();

function applyDocumentUpdate(update: string) {
  Y.applyUpdate(ydoc, toUint8Array(update), null);
}

const Tiptap = () => {
  useEffect(() => {
    socket.connect();
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("documentUpdate", applyDocumentUpdate);
    socket.on("usersInRoom", processUsersInRoom);
    socket.on("prekeyBundleForHandshake", processPreKeyBundleForHandshake);
    socket.on("firstMessageForHandshake", processFirstMessage);
    socket.on("groupMessage", processGroupMessage);
    ydoc.on("update", distributeUpdate);
    return () => {
      socket.disconnect();
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("documentUpdate", applyDocumentUpdate);
      socket.off("usersInRoom", processUsersInRoom);
      socket.off("prekeyBundleForHandshake", processPreKeyBundleForHandshake);
      socket.off("firstMessageForHandshake", processFirstMessage);
      socket.off("groupMessage", processGroupMessage);
      ydoc.off("update", distributeUpdate);
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
        document: ydoc,
      }),
    ],
    //content: "Hello World",
  });

  return <EditorContent editor={editor} />;
};

export default Tiptap;
