import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useAxios from "../hooks/useAxios";
import { Button } from "react-bootstrap";
import useLoadingDone from "../hooks/useLoadingDone";
import { cryptoUtils } from "../App";
import {
	getUserKeyStoreFromServerAndInitKeyStore,
	sendGroupKeyToServer,
	sendPreKeyBundleAndUserKeyStoreToServer,
} from "../utils/networkUtils";
import useAuth from "../hooks/useAuth";
import { _genRandomBuffer, genEncryptedMasterKey } from "easy-web-crypto";
import DashboardNavBar from "../components/DashboardNavBar";
import { Card, CardGroup, Container } from 'react-bootstrap';
import styles from "../styles/Dashboard.module.css";

interface User {
	userName: string;
	email: string;
	userId: string;
}

type userInvites = {
	documentName: string;
	documentID: string;
	participantID: string;
	leaderID: string;
	preKeyBundle: string;
	entityID: string;
	entityKeyName: string;
};

export default function DashBoard() {
	const [documentInvites, setDocumentInvites] = useState<any[]>([]);
	const [existingdocuments, setExistingDocuments] = useState<any[]>([]);
	const protectedAxios = useAxios();
	const navigate = useNavigate();
	const axios = useAxios();
	const auth = useAuth();
	const { state } = useLocation();
	//const { isRegistering } = state as { isRegistering: boolean };
	const loadingDone = useLoadingDone();
	// useEffect(() => {
	// 	console.log(auth.userData);
	// });
	if (state === null) {
		loadingDone();
	}
	else if (state.isRegistering) {
		sendPreKeyBundleAndUserKeyStoreToServer(
			auth.userData?.userID as string,
			axios
		).then(() => {
			getUserKeyStoreFromServerAndInitKeyStore(
				auth.userData?.userID as string,
				axios
			).then(() => {
				loadingDone();
			});
		});
	} else {
		getUserKeyStoreFromServerAndInitKeyStore(
			auth.userData?.userID as string,
			axios
		).then(() => {
			loadingDone();
		});
	}

	const handleDocumentCreation: React.FormEventHandler<
		HTMLFormElement
	> = async (event) => {
		event.preventDefault();
		const documentName = event.target["documentName"].value;
		console.log(documentName);
		const data = await protectedAxios.post("/api/document", {
			documentName,
		});
		console.log("Document Created");
		const documentID: string = data.data;
		const groupKeys = await cryptoUtils.generateGroupKeys();
		await cryptoUtils.saveGroupKeysToIDB(groupKeys, documentID);
		await sendGroupKeyToServer(documentID, protectedAxios);
		navigate("/document/" + documentID, {
			replace: true,
			state: {
				documentName,
				newDocumentCreation: true,
				documentID,
			},
		});
	};

	const handleNewDocumentJoining = async (documentInvite: userInvites) => {
		navigate("/document/" + documentInvite.documentID, {
			replace: true,
			state: {
				documentID: documentInvite.documentID,
				newDocumentJoin: true,
				existingDocumentJoin: false,
				documentInvite,
			},
		});
	};

	const handleExistingDocumentJoining = async (
		documentID: string,
		documentName: string
	) => {
		navigate("/document/" + documentID, {
			replace: true,
			state: {
				documentName,
				documentID,
				newDocumentJoin: false,
				existingDocumentJoin: true,
			},
		});
	};
	const getExistingDocuments = async () => {
		const data = await protectedAxios.get("/api/document/existingdocuments");
		return data.data;
	};

	const getDocumentInvites = async () => {
		const data = await protectedAxios.get("/api/document/invites");
		console.log(data.data)
		return data.data;
	};

	useEffect(() => {
		getDocumentInvites().then((data) => {
			setDocumentInvites(data);
		});
		getExistingDocuments().then((data) => {
			setExistingDocuments(data);
		});

		getUserKeyStoreFromServerAndInitKeyStore(
			auth.userData?.userID as string,
			axios
		);
	}, []);

	return (
		<>
			<DashboardNavBar />
			<Container fluid >
				<h1>Document Invites</h1>
				<div className={styles.scrollbar}>
					<CardGroup>
						{documentInvites.map((invite: userInvites) => (
							<Card key={invite.entityID}>
								<Card.Body className="d-flex flex-column align-items-center">
									<Card.Title className="text-center">{invite.documentID}</Card.Title>
									<Button
										variant="link"
										className="mt-auto"
										onClick={() => handleNewDocumentJoining(invite)}
									>
										Open
									</Button>
								</Card.Body>
							</Card>
						))}
					</CardGroup>
				</div>
				<br />
				<h1>Recent Docs</h1>
				<div className={styles.scrollbar} >
					<CardGroup>
						{existingdocuments.map((documentInfo: any) => (
							<Card key={documentInfo.documentID}>
								<Card.Body className="d-flex flex-column align-items-center">
									<Card.Title className="text-center">{documentInfo.documentName}</Card.Title>
									<Button
										variant="link"
										className="mt-auto"
										onClick={() =>
											handleExistingDocumentJoining(
												documentInfo.documentID,
												documentInfo.documentName
											)
										}
									>
										Open
									</Button>
								</Card.Body>
							</Card>
						))}
					</CardGroup>
				</div>
			</Container>
		</>
	);
}
