import { AxiosInstance } from "axios";
import { cryptoUtils } from "../App";

export const sendPreKeyBundleAndUserKeyStoreToServer = async (userID: string, axios: AxiosInstance) => {
	const preKeyBundle = await cryptoUtils.setIdentityAndReturnPreKeyBundle(userID);
	const preKeyPair = await cryptoUtils.returnPreKeyPair();
	await axios.post("/api/prekeybundle", preKeyBundle);
	// if(response.status === 200) {
	//     console.log("PreKeyBundle sent to server");
	// }
	// else {
	//     console.log("PreKeyBundle not sent to server");
	// }
	const keyStoreDump = (await cryptoUtils.returnKeyStoreAsDump());
	const userKeyStore = {
		userID: userID,
		identityPublic: keyStoreDump.identityPublic.ciphertext,
		identityPubliciv: keyStoreDump.identityPublic.iv,
		identitySecret: keyStoreDump.identitySecret.ciphertext,
		identitySecretiv: keyStoreDump.identitySecret.iv,
		preKeyPublic: keyStoreDump.preKeyPublic.ciphertext,
		preKeyPubliciv: keyStoreDump.preKeyPublic.iv,
		preKeySecret: keyStoreDump.preKeySecret.ciphertext,
		preKeySecretiv: keyStoreDump.preKeySecret.iv,
		masterKey: JSON.stringify(keyStoreDump.masterKey)
	};
	await axios.post("/api/userkeystore", userKeyStore);
};


export const getUserKeyStoreFromServerAndInitKeyStore = async (userID: string, axios: AxiosInstance) => {
	const response = await axios.get("/api/userkeystore");
	await cryptoUtils.setIdentity(userID);
	const userKeyStore = response.data;
	const keyStoreDump = {
		identityPublic: {
			ciphertext: userKeyStore.identityPublic,
			iv: userKeyStore.identityPubliciv
		},
		identitySecret: {
			ciphertext: userKeyStore.identitySecret,
			iv: userKeyStore.identitySecretiv
		},
		preKeyPublic: {
			ciphertext: userKeyStore.preKeyPublic,
			iv: userKeyStore.preKeyPubliciv
		},
		preKeySecret: {
			ciphertext: userKeyStore.preKeySecret,
			iv: userKeyStore.preKeySecretiv
		},
		masterKey: JSON.parse(userKeyStore.masterKey)
	};
	await cryptoUtils.initKeyStoreFromDump(keyStoreDump);
};


export const sendGroupKeyToServer = async (documentID: string, axios: AxiosInstance) => {
	const keyStoreDump = await cryptoUtils.returnKeyStoreAsDump();
	const groupKey = keyStoreDump[documentID];
	await axios.post("/api/groupkey", {
		documentID: documentID,
		groupKey: groupKey.ciphertext,
		groupKeyiv: groupKey.iv,
	});


};


export const getDocumentMetaData = async (axios: AxiosInstance, documentID: string) => {
	const response = await axios.get("/api/document", {
		params: {
			documentID,
		},
	});
	return response.data;
};


export const getGroupKeyFromServer = async (documentID: string, axios: AxiosInstance) => {
	const queryResponse = await axios.get("/api/groupkey", {
		params: {
			documentID,
		},
	});
	const { groupKey, groupKeyiv } = queryResponse.data;
	const groupKeyDump = {
		[documentID]: {
			ciphertext: groupKey,
			iv: groupKeyiv,
		}
	};
	return groupKeyDump;
};


export const deleteDocumentInvitaion = async (documentID: string, axios: AxiosInstance) => {
	await axios.delete("/api/document/invites", {
		data: {
			documentID,
		},
	});
};
