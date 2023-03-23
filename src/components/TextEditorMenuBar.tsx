import {
  faBold,
  faItalic,
  faUnderline,
  faAlignLeft,
  faAlignCenter,
  faAlignRight,
  faAlignJustify,
  faList,
  faList12,
  faPaperclip,
  faCut,
  faCopy,
  faPaste,
  faUndo,
  faRedo,
  faBroom,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

const TextEditorMenuBar = (props: any) => {
  const { editor } = props;
  const toggleBold = () => {
    editor?.chain().focus().toggleBold().run();
  };
    const clearDocument = () => {
        editor?.chain().focus().clearContent().run();
    };
    const executeUndo = () => {
        editor?.chain().focus().undo().run();
    };
    const executeRedo = () => {
        editor?.chain().focus().redo().run();
    };
    const executeCut = () => {
        editor?.chain().focus().cut().run();
    };
    const executeCopy = () => {
        editor?.chain().focus().copy().run();
    };
    const executePaste = () => {
        editor?.chain().focus().paste().run();
    };
    const toggleItalic = () => {
        editor?.chain().focus().toggleItalic().run();
    };
    const toggleUnderline = () => {
        editor?.chain().focus().toggleUnderline().run();
    };
    const toggleAlignment = (alignmentDirection:string) => {
        editor?.chain().focus().setParagraphAlignment(alignmentDirection).run();
    };
    const toggleUnorderedList = () => {
        editor?.chain().focus().toggleBulletList().run();
    };
    const toggleOrderedList = () => {
        editor?.chain().focus().toggleOrderedList().run();
    };
    const insertAttachment = () => {
        editor?.chain().focus().insertContent({
            type: "attachment",
            attrs: {
                src: "https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png",
                alt: "Google Logo",
            },
        }).run();
    };



    return (
        <div className="textEditorMenuBar">
            <button onClick={executeUndo}>
                <FontAwesomeIcon icon={faUndo} />
            </button>
            <button onClick={executeRedo}>
                <FontAwesomeIcon icon={faRedo} />
            </button>
            <button onClick={executeCut}>
                <FontAwesomeIcon icon={faCut} />
            </button>
            <button onClick={executeCopy}>
                <FontAwesomeIcon icon={faCopy} />
            </button>
            <button onClick={executePaste}>
                <FontAwesomeIcon icon={faPaste} />
            </button>
            <button onClick={toggleBold}>
                <FontAwesomeIcon icon={faBold} />
            </button>
            <button onClick={toggleItalic}>
                <FontAwesomeIcon icon={faItalic} />
            </button>
            <button onClick={toggleUnderline}>
                <FontAwesomeIcon icon={faUnderline} />
            </button>
            <button onClick={() => { toggleAlignment("left") }}>
                <FontAwesomeIcon icon={faAlignLeft} />
            </button>
            <button onClick={() => { toggleAlignment("center") }}>
                <FontAwesomeIcon icon={faAlignCenter} />
            </button>
            <button onClick={() => { toggleAlignment("right") }}>
                <FontAwesomeIcon icon={faAlignRight} />
            </button>
            <button onClick={() => { toggleAlignment("justify") }}>
                <FontAwesomeIcon icon={faAlignJustify} />
            </button>
            <button onClick={toggleUnorderedList}>
                <FontAwesomeIcon icon={faList} />
            </button>
            <button onClick={toggleOrderedList}>
                <FontAwesomeIcon icon={faList12} />
            </button>
            <button onClick={insertAttachment}>
                <FontAwesomeIcon icon={faPaperclip} />
            </button>
            <button onClick={clearDocument}>
                <FontAwesomeIcon icon={faBroom} />
            </button>
        </div>
    );
};

export default TextEditorMenuBar;
