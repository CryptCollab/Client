import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useAxios from "../hooks/useAxios";
import { Link } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Button from "react-bootstrap/Button";
import NavDropdown from "react-bootstrap/NavDropdown";
import Image from "react-bootstrap/Image";
import Tiptap from "../components/TextEditor";
import styles from "../styles/document.module.css";
import { AsyncTypeahead } from "react-bootstrap-typeahead"; // ES2015
import { useEffect, useState } from "react";
import { Option } from "react-bootstrap-typeahead/types/types";
import { type } from "os";
import { Modal } from "react-bootstrap";
import TypeAhead from "../components/TypeAhead";
import { useLocation } from "react-router-dom";
import { CryptoUtils } from "../utils/crypto";
import { cryptoUtils } from "../App";
import { InitServerInfo, InitSenderInfo } from "../cryptolib/x3dh";
import { ConstructionOutlined } from "@mui/icons-material";
import useLoadingDone from "../hooks/useLoadingDone";
import { sendGroupKeyToServer } from "../utils/networkUtils";
import UserInviteModal from "./UserInviteModal";

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

export default function DocNavBar() {

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selected, setSelected] = useState<any[]>([]);
	const [documentMetaData, setDocumentMetaData] =
		useState<DocumentMetaData | null>(null);
	const { state } = useLocation();
	useLoadingDone();
	const { documentID, joinedDocument } = state;

	const user = useAuth();
	const navigate = useNavigate();
	const axios = useAxios();

	const openInviteModal = () => {
		setIsModalOpen(true);
	};
	const closeModal = () => {
		setIsModalOpen(false);
	};
	const handleDocumentJoin = async (documentInvite: any) => {
		const axios = useAxios();
		const { documentID, participantID, leaderID, preKeyBundle } =
			documentInvite;

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
		const getDocumentMetaData = async () => {
			const response = await axios.get<DocumentMetaData>("/api/document", {
				params: {
					documentID,
				},
			});
			setDocumentMetaData(response.data as DocumentMetaData);
		};
		getDocumentMetaData();
	}, []);
	if (joinedDocument) {
		const { documentInvite } = state;
		handleDocumentJoin(documentInvite);
	}

	const handleLogout = async () => {
		try {
			await axios.get("/api/logout");
			user.logoutUser();
			navigate("/");
		}
		catch (error) {
			console.error(error);
		}

	};

	const linkStyle = {
		margin: "1rem",
		textDecoration: "none",
		color: "white"
	};


	return (
		<Navbar bg="dark" variant="dark" expand="lg">
			<Container>
				<Navbar.Brand href="/">
					<img style={{ objectFit: "contain" }}
						src="/logo_50_dark.png"
						width="auto"
						height="auto"
					/>{" "}
					CryptCollab
				</Navbar.Brand>
				<Navbar.Toggle aria-controls="basic-navbar-nav" />
				<Navbar.Collapse id="basic-navbar-nav">
					<Nav className="ms-auto">
						<Link to="/dashboard" style={linkStyle}>Dashboard</Link>
						{/*<Button onClick={handleLogout} variant="link" 
					style={{textDecoration: "none",
  							color: 'white'}}>
							Logout
						</Button>*/}
					</Nav>
					<NavDropdown title={
						<Image
							src={"https://github.com/nightink.png"}
							alt="User profile image"
							roundedCircle
							style={{ width: "30px" }}
						/>
					} style={{ color: "white", margin: "1rem", }} id="collasible-nav-dropdown">
						<NavDropdown.Item href="#action/3.1" className="text-center" style={{ fontWeight: "bold" }}>{user.userData?.userName}</NavDropdown.Item>
						<NavDropdown.Divider />
						<NavDropdown.Item className="text-center">
							<Button variant="primary" onClick={handleLogout}
								style={{
									textDecoration: "none",
								}}>
								Logout
							</Button>
						</NavDropdown.Item>
						<NavDropdown.Item className="text-center">
							<Button variant="primary" onClick={openInviteModal}>
								{" "}
								Invite Users{" "}
							</Button>
							<UserInviteModal isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} handleInvite={handleInvite} selectedUserList={selected} setSelectedUserList={setSelected} />
						</NavDropdown.Item>
					</NavDropdown>
				</Navbar.Collapse>
			</Container>
		</Navbar>
	);

}
