import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAxios from "../hooks/useAxios";
import { Button } from "react-bootstrap";
import UserInviteModal from "../components/UserInviteModal";
import { cryptoUtils } from "../App";
import { getUserKeyStoreFromServerAndInitKeyStore, sendGroupKeyToServer } from "../utils/networkUtils";
import useAuth from "../hooks/useAuth";
import { _genRandomBuffer, genEncryptedMasterKey } from "easy-web-crypto";

interface User {
  userName: string;
  email: string;
  userId: string;
}

type userInvites = {
  documentID: string;
  participantID: string;
  leaderID: string;
  preKeyBundle: string;
  entityID: string;
  entityKeyName: string;
};

export default function DashBoard() {
  const [documentInvites, setDocumentInvites] = useState<any[]>([]);
  const protectedAxios = useAxios();
  const navigate = useNavigate();
  const axios = useAxios();
  const auth = useAuth();

  const handleDocumentCreation = async () => {
    const data = await protectedAxios.post("/api/document", {
      userID: auth.userData?.userID,
    });
    const documentID: string = data.data;
    const groupKeys = await cryptoUtils.generateGroupKeys();
    await cryptoUtils.saveGroupKeysToIDB(groupKeys, documentID);
    sendGroupKeyToServer(documentID, protectedAxios);
    navigate("/document/" + documentID, {
      replace: true,
      state: { documentID: data.data, joinedDocument: false },
    });
  };

  const handleDocumentJoining = async (documentInvite: userInvites) => {
    navigate("/document/" + documentInvite.documentID, {
      replace: true,
      state: {
        documentID: documentInvite.documentID,
        joinedDocument: true,
        documentInvite,
      },
    });
  };

  const getDocumentInvites = async () => {
    const data = await protectedAxios.get("/api/document/invites");
    return data.data;
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);

  const openInviteModal = () => {
    setIsModalOpen(true);
  };



  useEffect(() => {
    getDocumentInvites().then((data) => {
      setDocumentInvites(data);
    });
    
    getUserKeyStoreFromServerAndInitKeyStore(auth.userData?.userID as string, axios)

  }, []);

  return (
    <>
      <div>DashBoard</div>
      <button onClick={handleDocumentCreation}>Create Document</button>
      <br />
      <h1>Document Invites</h1>
      {documentInvites.map((invite: userInvites) => (
        <ul key={invite.entityID}>
          <li>
            {invite.documentID}
            <Button
              variant="primary"
              onClick={() => handleDocumentJoining(invite)}
            >
              Open
            </Button>
          </li>
        </ul>
      ))}
    </>
  );
}
