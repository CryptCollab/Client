import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import { collabDocument } from "../utils/yjs";
import { useEffect } from "react";
import { socket } from "../App";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";


export const document = new collabDocument();


const Tiptap = () => {
  useEffect(() => {
    socket.connect(document.ydoc);
    document.ydoc.on("update", socket.distributeDocumentUpdate);
    
    return () => {
      socket.disconnect();
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
    //content: "Hello World",
  });

  return <EditorContent editor={editor} />;
};

export default Tiptap;
