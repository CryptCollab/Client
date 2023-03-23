import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import { collabDocument } from "../utils/yjs";
import { useEffect } from "react";
import propTypes from 'prop-types'

import { socket } from "../App";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import TextEditorMenuBar from "../components/TextEditorMenuBar";


export const document = new collabDocument();

const Tiptap = () => {
  useEffect(() => {
     socket.connectHandler(document.ydoc);
    document.ydoc.on("update", socket.distributeDocumentUpdate);

    return () => {
       socket.disconnectHandler();
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
      CollaborationCursor.configure({
        provider: socket,
      }),
    ],
    // content: "Hello World",
  });



  return (
    <>
      <TextEditorMenuBar editor={editor} />
      <EditorContent editor={editor} />
      <p>Total users: </p>
    </>
  );
};

Tiptap.propTypes = {
  editor: propTypes.object
}

export default Tiptap;
