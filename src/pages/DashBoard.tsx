import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAxios from "../hooks/useAxios";
import { Button } from "react-bootstrap";
import UserInvitieModal from "../components/UserInvitieModal";
import useLoadingDone from "../hooks/useLoadingDone";
import useAuth from "../hooks/useAuth";



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
	const auth = useAuth();
	useEffect(() => {
		console.log(auth.userData);
	});
	useLoadingDone();
  const createDocument = async () => {
    const data = await protectedAxios.post("/api/document", {
      userID: "01GWP2QD2CB59BDDT76JWQB0SG",
    });
    navigate("/document/" + data.data, {
      replace: true,
      state: { documentID: data.data, joinedDocument: false },
    });
  };

  const joinDocument = async (documentInvite: userInvites) => {
    navigate("/document/" + documentInvite.documentID, {
      replace: true,
      state: { documentID: documentInvite.documentID, joinedDocument: true, documentInvite },
    });
  };
    

  const getDocumentInvites = async () => {
    const data = await protectedAxios.get("/api/document/invites");
    console.log(data.data);
    return data.data;
  };

  useEffect(() => {
    getDocumentInvites().then((data) => {
      setDocumentInvites(data);
    });
  }, []);

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedUsers, setSelectedUsers] = useState<any[]>([]);

  return (
    <>
      <div>DashBoard</div>
      <button onClick={createDocument}>Create Document</button><br />
      <h1>Document Invites</h1>
      {documentInvites.map((invite: userInvites) => (
        <ul key={invite.entityID}>
          <li>
            {invite.documentID}
            <Button
              variant="primary"
              onClick={() => joinDocument(invite)}
            >
              Open
            </Button>
          </li>
        </ul>
      ))}
    </>
  );
}
