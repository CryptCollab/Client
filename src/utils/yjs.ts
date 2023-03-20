import { toUint8Array } from "js-base64";
import * as Y from "yjs";
import * as awarenessProtocol from 'y-protocols/awareness.js'
import { cryptoUtils } from "../App";
export class collabDocument {
    ydoc: Y.Doc;
    awareness!: awarenessProtocol.Awareness;
    constructor() {
        this.ydoc = new Y.Doc();
        this.awareness = new awarenessProtocol.Awareness(this.ydoc);
    }
    setAwarenessState = () => {
        this.awareness.setLocalStateField('user', {
            name: "User " + Math.floor(Math.random() * 100),
            color: '#' + Math.floor(Math.random() * 0xFFFFFF).toString(16)
        })
    }
    getDoc() {
        return this.ydoc;
    }
    applyDocumentUpdate = async (update: string) => {
        const decryptedUpdate = await cryptoUtils.decryptGroupMessage(update);
        Y.applyUpdate(this.ydoc, toUint8Array(decryptedUpdate), null);
    }

    applyAwarenessUpdate = async (update: string) => {
        const decodedAwarenessUpdate = toUint8Array(update);
        console.log("Applying awareness update")
        awarenessProtocol.applyAwarenessUpdate(this.awareness, decodedAwarenessUpdate, null);
    }

}