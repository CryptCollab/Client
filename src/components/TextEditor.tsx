import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import { collabDocument } from "../utils/yjs";
import { useEffect } from "react";
import { socket } from "../App";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import { Color } from "@tiptap/extension-color";
import TextStyle from "@tiptap/extension-text-style";
import "../styles/styles.scss";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import {
	FaBold,
	FaItalic, 
	FaStrikethrough,
	FaHeading,
	FaListOl,
	FaListUl,
	FaQuoteLeft,
	FaUndo,
	FaRedo,
	FaUnderline,
	FaRulerHorizontal,
	FaHighlighter,
	FaAlignLeft,
	FaAlignCenter,
	FaAlignRight,
	FaAlignJustify,
	FaParagraph,
	FaCode,
	FaCodeBranch,
} from "react-icons/fa";


export const document = new collabDocument();

const MenuBar = ({ editor }) => {
	if (!editor) {
		return null;
	}

	return (
		<div className="menu-bar">
			<div>
				<button
					onClick={() => editor.chain().focus().toggleBold().run()}
					disabled={
						!editor.can()
							.chain()
							.focus()
							.toggleBold()
							.run()
					}
					className={editor.isActive("bold") ? "is-active" : ""}
				>
					<FaBold/>
				</button>
				<button
					onClick={() => editor.chain().focus().toggleItalic().run()}
					disabled={
						!editor.can()
							.chain()
							.focus()
							.toggleItalic()
							.run()
					}
					className={editor.isActive("italic") ? "is-active" : ""}
				>
					<FaItalic/>
				</button>
	  <button
					onClick={() => editor.chain().focus().toggleUnderline().run()}
					disabled={
						!editor.can()
							.chain()
							.focus()
							.toggleItalic()
							.run()
					}
					className={editor.isActive("underline") ? "is-active" : ""}
				>
					<FaUnderline/>
				</button>
				<button
					onClick={() => editor.chain().focus().toggleHighlight({color:"#FFFF00"}).run()}
					className={editor.isActive("highlight") ? "is-active" : ""}
				>
					<FaHighlighter/>
				</button>  
				{/*<ColorPicker editor={editor}/>*/}
				<button
					onClick={() => editor.chain().focus().setTextAlign("left").run()}
					className={editor.isActive({textAlign:"left"}) ? "is-active" : ""}
				>
					<FaAlignLeft/>
				</button>  
				<button
					onClick={() => editor.chain().focus().setTextAlign("center").run()}
					className={editor.isActive({textAlign:"center"}) ? "is-active" : ""}
				>
					<FaAlignCenter/>
				</button>   
				<button
					onClick={() => editor.chain().focus().setTextAlign("right").run()}
					className={editor.isActive({textAlign:"right"}) ? "is-active" : ""}
				>
					<FaAlignRight/>
				</button>   
				<button
					onClick={() => editor.chain().focus().setTextAlign("justify").run()}
					className={editor.isActive({textAlign:"justify"}) ? "is-active" : ""}
				>
					<FaAlignJustify/>
				</button>    
				<button
					onClick={() => editor.chain().focus().toggleStrike().run()}
					disabled={
						!editor.can()
							.chain()
							.focus()
							.toggleStrike()
							.run()
					}
					className={editor.isActive("strike") ? "is-active" : ""}
				>
					<FaStrikethrough/>
				</button>  
				<button
					onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
					className={editor.isActive("heading", { level: 1 }) ? "is-active" : ""}
				>
					<FaHeading/>
				</button>  
				<button
					onClick={() => editor.chain().focus().setParagraph().run()}
					className={editor.isActive("paragraph") ? "is-active" : ""}
				>
					<FaParagraph/>
				</button>      
				<button
					onClick={() => editor.chain().focus().toggleBulletList().run()}
					className={editor.isActive("bulletList") ? "is-active" : ""}
				>
					<FaListUl/>
				</button>
				<button
					onClick={() => editor.chain().focus().toggleOrderedList().run()}
					className={editor.isActive("orderedList") ? "is-active" : ""}
				>
					<FaListOl/>
				</button>      
				<button
					onClick={() => editor.chain().focus().toggleBlockquote().run()}
					className={editor.isActive("blockquote") ? "is-active" : ""}
				>
					<FaQuoteLeft/>
				</button>
				<button
					onClick={() => editor.chain().focus().toggleCode().run()}
					disabled={
						!editor.can()
							.chain()
							.focus()
							.toggleCode()
							.run()
					}
					className={editor.isActive("code") ? "is-active" : ""}
				>
					<FaCode/>
				</button>
				<button
					onClick={() => editor.chain().focus().toggleCodeBlock().run()}
					className={editor.isActive("codeBlock") ? "is-active" : ""}
				>
					<FaCodeBranch/>
				</button>
				<button onClick={() => editor.chain().focus().setHorizontalRule().run()}>
					<FaRulerHorizontal/>
				</button>      
			</div>
	  <div>
	  <button
					onClick={() => editor.chain().focus().undo().run()}
					disabled={
						!editor.can()
							.chain()
							.focus()
							.undo()
							.run()
					}
				>
					<FaUndo/>
				</button>
				<button
					onClick={() => editor.chain().focus().redo().run()}
					disabled={
						!editor.can()
							.chain()
							.focus()
							.redo()
							.run()
					}
				>
					<FaRedo/>
				</button>      
			</div>
		</div>
	);
};
//console.log(TextStyle);
const Tiptap = (props: { documentID: string; }) => {
	const documentID = props.documentID;
	useEffect(() => {
		socket.documentID = documentID;
		socket.connectHandler(document.ydoc);
		document.ydoc.on("update", socket.distributeDocumentUpdate);
    
		return () => {
			socket.disconnectHandler();
			document.ydoc.off("update", socket.distributeDocumentUpdate);
		};
	}, []);
	const editor = useEditor({
		extensions: [
			Underline,
			Highlight.configure({
				multicolor:true,
			}),
			TextAlign.configure({
				types:["heading","paragraph"],
				alignments: ["left", "center", "right", "justify"],
				defaultAlignment: "left",
			}),
			TextStyle,
			//Color.configure({ types: [TextStyle.name, ListItem.name] }),			
			Color.configure({ 
				types: ["TextStyle"],
			}),
			StarterKit.configure({
				// The Collaboration extension comes with its own history handling
				history: false,
				bulletList: {
          			keepMarks: true,
          			keepAttributes: false, // TODO : Making this as `false` becase marks are not preserved when I try to preserve attrs, awaiting a bit of help
        		},
        		orderedList: {
          			keepMarks: true,
          			keepAttributes: false, // TODO : Making this as `false` becase marks are not preserved when I try to preserve attrs, awaiting a bit of help
        		},
			}),
			// Register the document with Tiptap
			Collaboration.configure({
				document: document.ydoc,
        
			}),
			CollaborationCursor.configure({
				provider: socket,
			}),

		],
		content: "",
		onUpdate:({editor})=>{
			//use this to extract document contents
			const html = editor.getHTML();
			//console.log(html);
			const json = editor.getJSON();
		}
	});

	return (
		<div className="text-editor-area">
			<MenuBar editor={editor} />
			<EditorContent editor={editor} />
		</div>
	);
};

export default Tiptap;
