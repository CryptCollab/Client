import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAxios from "../hooks/useAxios";
import { Button } from "react-bootstrap";
import UserInvitieModal from "../components/UserInvitieModal";



interface User {
	userName: string;
	email: string;
	userId: string;
}
export default function DashBoard() {
	const protectedAxios = useAxios();
	const navigate = useNavigate();
	const createDocument = async () => {
		const data = await protectedAxios.post("/api/document", {
			userID: "01GWP2QD2CB59BDDT76JWQB0SG",
		});
		console.log(data.data);
		navigate("/document/" + data.data);
	};


	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedUsers, setSelectedUsers] = useState<any[]>([]);

	const openInviteModal = () => {
		setIsModalOpen(true)
	}


	return (<>
		<div>DashBoard</div>
		<button onClick={createDocument}>Create Document</button>
		<Button variant="primary" onClick={openInviteModal}> Invite Users </Button>
		<UserInvitieModal isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} selectedUserList={selectedUsers} setSelectedUserList={setSelectedUsers} />
	</>
	);
}
