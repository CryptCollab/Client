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
  // useEffect(() => {
  // 	console.log(auth.userData);
  // });
  useLoadingDone();

  const handleDocumentCreation: React.FormEventHandler<HTMLFormElement> = async (event) => {
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

  const handleExistingDocumentJoining = async (documentID: string, documentName: string) => {
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
      <form onSubmit={handleDocumentCreation}>
        <label>
          Document Name:
          <input type="text" name="documentName" />
        </label>
        <button type="submit">Create Document</button>
      </form>
      <br />
      <h1>Document Invites</h1>
      {documentInvites.map((invite: userInvites) => (
        <ul key={invite.entityID}>
          <li>
            {invite.documentName}
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
      {existingdocuments.map((documentInfo: any) => (
        <ul key={documentInfo.documentID}>
          <li>
            {documentInfo.documentName}
            <Button
              variant="primary"
              onClick={() => handleExistingDocumentJoining(documentInfo.documentID, documentInfo.documentName)}
            >
              Open
            </Button>
          </li>
        </ul>
      ))}
    </>
  );
}
