import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAxios from "../hooks/useAxios";
import { Button } from "react-bootstrap";
import useLoadingDone from "../hooks/useLoadingDone";
import UserInviteModal from "../components/UserInviteModal";
import { cryptoUtils } from "../App";
import {
  getUserKeyStoreFromServerAndInitKeyStore,
  sendGroupKeyToServer,
} from "../utils/networkUtils";
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
  const [existingdocuments, setExistingDocuments] = useState<any[]>([]);
  const protectedAxios = useAxios();
  const navigate = useNavigate();
  const axios = useAxios();
  const auth = useAuth();
  // useEffect(() => {
  // 	console.log(auth.userData);
  // });
  useLoadingDone();

  const handleDocumentCreation = async () => {
    const data = await protectedAxios.post("/api/document", {
      userID: auth.userData?.userID,
    });
    console.log("Document Created");
    const documentID: string = data.data;
    const groupKeys = await cryptoUtils.generateGroupKeys();
    await cryptoUtils.saveGroupKeysToIDB(groupKeys, documentID);
    sendGroupKeyToServer(documentID, protectedAxios);
    navigate("/document/" + documentID, {
      replace: true,
      state: { documentID },
    });
  };

  const handleNewDocumentJoining = async (documentInvite: userInvites) => {
    navigate("/document/" + documentInvite.documentID, {
      replace: true,
      state: {
        documentID: documentInvite.documentID,
        newDocumentJoin: true,
        documentInvite,
      },
    });
  };

  const handleExistingDocumentJoining = async (documentID: string) => {
    navigate("/document/" + documentID, {
      replace: true,
      state: {
        documentID: documentID,
        existingDocumentJoin: true,
      },
    });
  };
  const getExistingDocuments = async () => {
    const data = await protectedAxios.get("/api/document/existingdocuments");
    console.log(data.data);
    return data.data;
  };

  const getDocumentInvites = async () => {
    const data = await protectedAxios.get("/api/document/invites");
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
              onClick={() => handleNewDocumentJoining(invite)}
            >
              Open
            </Button>
          </li>
        </ul>
      ))}
      <br />
      <h1>Documents you have worked on: </h1>
      {existingdocuments.map((document: any) => (
        <ul key={document}>
          <li>
            {document}
            <Button
              variant="primary"
              onClick={() => handleExistingDocumentJoining(document)}
            >
              Open
            </Button>
          </li>
        </ul>
      ))}
    </>
  );
}
