import Tiptap from "../components/TextEditor";
import styles from "../styles/document.module.css";
import { AsyncTypeahead } from "react-bootstrap-typeahead"; // ES2015
import { useEffect, useState } from "react";
import { Option } from "react-bootstrap-typeahead/types/types";
import { type } from "os";
import useAxios from "../hooks/useAxios";
import { Button, Modal } from "react-bootstrap";
import TypeAhead from "../components/TypeAhead";
import { useLocation } from "react-router-dom";
import { CryptoUtils } from "../utils/crypto";
import { cryptoUtils } from "../App";
import { InitServerInfo } from "../cryptolib/x3dh";
import { ConstructionOutlined } from "@mui/icons-material";

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
}

type preKeyBundle = {
  userID: string;
  preKeyBundle: {
    IdentityKey: string;
    SignedPreKey: {
      Signature: string;
      PreKey: string;
    }

  }
}

export default function Document() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selected, setSelected] = useState<any[]>([]);
  const [documentMetaData, setDocumentMetaData] = useState<DocumentMetaData|null>(null);
  const axios = useAxios();
  const { state } = useLocation();
  const { documentID } = state;
  const openInviteModal = () => {
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
  };
  const handleInvite = async () => {
    const selectedUsers = selected as User[];
    const participantIDs: string[] = selectedUsers.map((user) => user.userID);
    const preKeyBundleRequestResponse = await axios.post("/api/prekeybundle/request",{participantIDs}); 
    const preKeyBundleOfParticipants: preKeyBundle[] = preKeyBundleRequestResponse.data ;
    const userInvitesArray: userInvites[] = [];
    const groupKey = await cryptoUtils.generateGroupKeyStoreBundle();
    for (const preKeyBundle of preKeyBundleOfParticipants) {
      const participantID = preKeyBundle.userID;
      const preKeyBundleForHandshake: InitServerInfo = {
        IdentityKey: preKeyBundle.preKeyBundle.IdentityKey,
        SignedPreKey: {
          Signature: preKeyBundle.preKeyBundle.SignedPreKey.Signature,
          PreKey: preKeyBundle.preKeyBundle.SignedPreKey.PreKey,
        }
      }
      const firstMessageFromHandshake = await cryptoUtils.establishSharedKeyAndEncryptFirstMessage(participantID, preKeyBundleForHandshake, groupKey);
      const userInvite: userInvites = {
        documentID: documentID,
        participantID: participantID,
        leaderID: documentMetaData!.leaderID,
        preKeyBundle: JSON.stringify(firstMessageFromHandshake)
      }
      userInvitesArray.push(userInvite);
    }
    const sendingInvitesResponse = await axios.post("/api/document/invites", {userInvitesArray});
    console.log(sendingInvitesResponse.data);
  };

  useEffect(() => {
    
    const getDocumentMetaData = async () => {
      const response = await axios.get<DocumentMetaData>("/api/document", {
        params: {
          documentID,
        }
      });
      setDocumentMetaData(response.data as DocumentMetaData);
    };
    getDocumentMetaData();
    
  }, []);

  return (
    <div className={styles.root}>
      <Button variant="primary" onClick={openInviteModal}>
        {" "}
        Invite Users{" "}
      </Button>
      <Modal show={isModalOpen} onHide={openInviteModal}>
        <Modal.Header>
          <Modal.Title>Search here</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <TypeAhead selected={selected} setSelected={setSelected} />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleInvite}>
            Invite
          </Button>
          <Button variant="secondary" onClick={closeModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
      <Tiptap />
    </div>
  );
}
