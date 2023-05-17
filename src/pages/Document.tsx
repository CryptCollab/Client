import Tiptap from "../components/TextEditor";
import styles from "../styles/document.module.css";
// ES2015
// ES2015
import { useEffect, useState } from "react";
import useAxios from "../hooks/useAxios";
import { useLocation } from "react-router-dom";
import { cryptoUtils } from "../App";
import { InitServerInfo, InitSenderInfo } from "../cryptolib/x3dh";
import useLoadingDone from "../hooks/useLoadingDone";
import {
	deleteDocumentInvitaion,
	getDocumentMetaData,
	getGroupKeyFromServer,
	getUserKeyStoreFromServerAndInitKeyStore,
	sendGroupKeyToServer,
} from "../utils/networkUtils";
import useAuth from "../hooks/useAuth";
import DocNavBar from "../components/DocNavBar";

type LocalOption = Record<string, User>;

interface User {
	userName: string;
	email: string;
	userID: string;
}

type DocumentMetaData = {
	leaderID: string;
	total_participants: number;
	participant_ids: string[];
	latest_document_update: string;
	entityId: string;
	entityKeyName: string;
};

type userInvites = {
	documentName: string;
	documentID: string;
	participantID: string;
	leaderID: string;
	preKeyBundle: string;
};

type preKeyBundle = {
	userID: string;
	preKeyBundle: {
		IdentityKey: string;
		SignedPreKey: {
			Signature: string;
			PreKey: string;
		};
	};
};

export default function Document() {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selected, setSelected] = useState<any[]>([]);
	const [documentMetaData, setDocumentMetaData] =
		useState<DocumentMetaData | null>(null);
	const axios = useAxios();
	const auth = useAuth();
	const { state } = useLocation();
	const loadingDone = useLoadingDone();
	loadingDone();
	const {
		documentName,
		documentID,
		newDocumentJoin,
		existingDocumentJoin,
		newDocumentCreation,
		documentInvite,
	} = state;

	const openInviteModal = () => {
		setIsModalOpen(true);
	};
	const closeModal = () => {
		setIsModalOpen(false);
	};

	const handleNewDocumentJoin = async (documentInvite: any) => {
		const { preKeyBundle } = documentInvite;

		const parsedPreKeyBundle: InitSenderInfo = JSON.parse(preKeyBundle);
		const firstMessageFromHandshake =
			await cryptoUtils.establishSharedKeyAndDecryptFirstMessage(
				parsedPreKeyBundle
			);
		cryptoUtils.groupKeyStore = {
			nonce: firstMessageFromHandshake.toString().slice(0, 48),
			groupKey: firstMessageFromHandshake.toString().slice(48),
		};
		await cryptoUtils.saveGroupKeysToIDB(cryptoUtils.groupKeyStore, documentID);
		await sendGroupKeyToServer(documentID, axios);
		await deleteDocumentInvitaion(documentID, axios);
	};

	const handleExistingDocumentJoin = async () => {
		let groupKey = await cryptoUtils.returnFromKeyStore(documentID);
		if (!groupKey) {
			console.log("No group key found in IDB. Fetching from server");
			const groupKeyDump = await getGroupKeyFromServer(documentID, axios);
			await cryptoUtils.importIntoStore(groupKeyDump);
		}
		groupKey = await cryptoUtils.loadGroupKeyStoreFromIDB(documentID);
		cryptoUtils.groupKeyStore = groupKey;
		//await deleteDocumentInvitaion(documentID, axios);
	};

	/**
   * This function is called when the user clicks on the invite button.
   * It sends a request to the server to get the prekeybundles of the selected users.
   * It then establishes a shared key with each of the selected users and encrypts the group key with the shared key.
   * It then sends a request to the server to send the encrypted group key to the selected users.
   * The server then stores the encrypted group key in the database.
   */
	const handleInvite = async () => {
		const selectedUsers = selected as User[];
		const participantIDs: string[] = selectedUsers.map((user) => user.userID);
		const preKeyBundleRequestResponse = await axios.post(
			"/api/prekeybundle/request",
			{ participantIDs }
		);
		const preKeyBundleOfParticipants: preKeyBundle[] =
			preKeyBundleRequestResponse.data;
		const userInvitesArray: userInvites[] = [];
		const groupKey = await cryptoUtils.generateGroupKeyStoreBundle(documentID);
		for (const preKeyBundle of preKeyBundleOfParticipants) {
			const participantID = preKeyBundle.userID;
			const preKeyBundleForHandshake: InitServerInfo = {
				IdentityKey: preKeyBundle.preKeyBundle.IdentityKey,
				SignedPreKey: {
					Signature: preKeyBundle.preKeyBundle.SignedPreKey.Signature,
					PreKey: preKeyBundle.preKeyBundle.SignedPreKey.PreKey,
				},
			};

			const firstMessageFromHandshake =
				await cryptoUtils.establishSharedKeyAndEncryptFirstMessage(
					participantID,
					preKeyBundleForHandshake,
					groupKey
				);
			const userInvite: userInvites = {
				documentName: documentName,
				documentID: documentID,
				participantID: participantID,
				leaderID: documentMetaData!.leaderID,
				preKeyBundle: JSON.stringify(firstMessageFromHandshake),
			};
			userInvitesArray.push(userInvite);
		}
		const sendingInvitesResponse = await axios.post("/api/document/invites", {
			userInvitesArray,
		});
		console.log(sendingInvitesResponse.data);
	};

	useEffect(() => {
		getDocumentMetaData(axios, documentID).then((documentMetaData) => {
			setDocumentMetaData(documentMetaData as DocumentMetaData);
			getUserKeyStoreFromServerAndInitKeyStore(
				auth.userData?.userID as string,
				axios
			).then(() => {
				if (newDocumentJoin) {
					handleNewDocumentJoin(documentInvite);
				}
				if (existingDocumentJoin || newDocumentCreation) {
					handleExistingDocumentJoin();
				}
			});

			// state = {};
		});
	}, []);

	return (
		<div className={styles.root}>
			<DocNavBar />
			<Tiptap documentID={documentID} />
		</div>
	);
}
