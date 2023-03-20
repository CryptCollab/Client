import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import { collabDocument } from "../utils/yjs";
import { useEffect } from "react";
import { fireEventHandlers, removeEventHandlers } from "../utils/eventHandler";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";


export const document = new collabDocument();
document.setAwarenessState();

const Tiptap = () => {
  useEffect(() => {
    fireEventHandlers(document);
    
    return () => {
      removeEventHandlers(document);
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
      // CollaborationCursor.configure({
      //   user: cursorUser,
      // }),

    ],
    //content: "Hello World",
  });

  return <EditorContent editor={editor} />;
};

export default Tiptap;
