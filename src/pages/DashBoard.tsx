import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useProtectedAxios from "../hooks/useAxios";

export default function DashBoard() {
  const protectedAxios = useProtectedAxios();
  const navigate = useNavigate();
  const [documentInvites, setDocumentInvites] = useState([]);

  const createDocument = async () => {
    const data = await protectedAxios.post("/api/document", {
      userID: "01GWP2QD2CB59BDDT76JWQB0SG",
    });
    console.log(data.data);
    navigate("/document/" + data.data);
  };
	
	const getDocumentInvites = async () => {
		const data = await protectedAxios.get("/api/document/invites");
		setDocumentInvites(data.data);
		console.log(documentInvites)
	}


  return (
    <>
      <div>DashBoard</div>
		  <button onClick={createDocument}>Create Document</button><br/>
		  <br/><button onClick={getDocumentInvites}>Get Document Invites</button>
      <div className="documentInvites">
        <h1>Document Invitations</h1>
        {documentInvites.map((invite) => (
          <div className="documentInvite">
            <div className="documentInvite__title">{invite}</div>
            <div className="documentInvite__description">
              {invite}
            </div>
            <div className="documentInvite__author">{invite}</div>
            <button>Accept</button>
            <button>Decline</button>
          </div>
        ))}
      </div>
    </>
  );
}
