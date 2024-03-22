import * as idb from "./lib/store";
import * as crypto from "easy-web-crypto";

export type Dump = Record<string | number, any>;

const masterKey = "masterKey";

class Store {
	private store: idb.Store;
	private encMasterKey?: crypto.ProtectedMasterKey;
	private _key?: CryptoKey;


	private get key(): CryptoKey {
		if (!this._key) {
			throw new Error("Master key not initialized");
		}
		return this._key;
	}
	/**
      * Class constructor
      *
      * @param {string} user - The current user
      * @param {string} passphrase - Passphrase from which we derive the key
      */
	constructor(public storeName: string, private passphrase: string) {
		if (!storeName || !passphrase) {
			throw new Error("Store name and passphrase required");
		}
		// init store
		this.store = new idb.Store(storeName, storeName);
	}

	async init() {
		try {
			let generatedMasterKey: crypto.ProtectedMasterKey | undefined = await idb.get(masterKey, this.store);
			// generate a new key for the user if no key exists (empty store)
			if (!generatedMasterKey) {
				generatedMasterKey = await crypto.genEncryptedMasterKey(this.passphrase);
				// store the new key since it's the first time
				await idb.set(masterKey, generatedMasterKey, this.store);
			}
			// decrypt key so we can use it during this session
			this.encMasterKey = generatedMasterKey;
			this._key = await crypto.decryptMasterKey(this.passphrase, this.encMasterKey);
			// close DB connection if the window enters freeze state
			window.addEventListener("freeze", () => {
				this.close();
			});
		} catch (e) {
			if (e instanceof Error)
				throw new Error(e.message);
			else
				throw new Error("Unknown error");
		}
	}

	async updatePassphrase(oldPass: string, newPass: string) {
		try {
			if (!this.encMasterKey) {
				throw new Error("No password to update set");
			}
			const encryptedKey = await crypto.updatePassphraseKey(oldPass, newPass, this.encMasterKey);
			await idb.set(masterKey, encryptedKey, this.store);
			this.encMasterKey = encryptedKey;
		} catch (e) {
			if (e instanceof Error)
				throw new Error(e.message);
			else
				throw new Error("Unknown error");
		}
	}

	async set(key: IDBValidKey, val: string | object) {
		val = await crypto.encrypt(this.key, val);
		return idb.set(key, val, this.store);
	}

	async get(key: IDBValidKey | IDBKeyRange) {
		const val = await idb.get(key, this.store);
		if (!val) {
			// undefined data cant/doesn't need to be decrypted
			return val;
		}
		// decrypt data before returning it
		return await crypto.decrypt(this.key, val);
	}

	del(key: IDBValidKey | IDBKeyRange) {
		return idb.del(key, this.store);
	}

	async keys(): Promise<IDBValidKey[]> {
		const keys = await idb.keys(this.store);
		// Users of secure-webstore should not have to be aware of existence of __key.
		//return keys.filter(key => key !== masterKey);
		return keys;
	}

	clear(): Promise<void> {
		return idb.clear(this.store);
	}

	close() {
		return idb.close(this.store);
	}

	destroy() {
		return new Promise((resolve, reject) => {
			this.close();
			const req = window.indexedDB.deleteDatabase(this.storeName);
			req.onsuccess = (e) => {
				resolve(e);
			};
			req.onerror = (e) => {
				reject(e);
			};
		});
	}

	async export() {
		const dump: Dump = {};
		const keys = await this.keys();
		if (keys) {
			for (const key of keys) {
				if (typeof key !== "string" && typeof key !== "number") {
					continue;
				}
				const data = await idb.get(key, this.store);
				dump[key] = data;
			}
		}
		return dump;
	}

	async import(data: Dump) {
		if (!data || Object.keys(data).length === 0) {
			throw new Error("No data provided");
		}
		if (Object.prototype.toString.call(data) !== "[object Object]") {
			throw new Error("Data must be a valid JSON object");
		}
		for (const key of Object.keys(data)) {
			await idb.set(key, data[key], this.store);
		}
	}
}

const _idb = idb;

export {
	Store,
	_idb
};