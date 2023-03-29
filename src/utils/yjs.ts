import { toUint8Array } from "js-base64";
import * as Y from "yjs";
import { cryptoUtils } from "../App";
export class collabDocument {
	ydoc: Y.Doc;

	constructor() {
		this.ydoc = new Y.Doc();

	}

	getDoc() {
		return this.ydoc;
	}
	applyDocumentUpdate = async (update: string) => {
		const decryptedUpdate = await cryptoUtils.decryptGroupMessage(update);
		Y.applyUpdate(this.ydoc, toUint8Array(decryptedUpdate), null);
	};



}