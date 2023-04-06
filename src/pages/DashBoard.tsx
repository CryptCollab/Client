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
export default function DashBoard() {
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
		navigate("/document/" + data.data,{replace: true, state: {documentID: data.data}});
	};


	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedUsers, setSelectedUsers] = useState<any[]>([]);

	const openInviteModal = () => {
		setIsModalOpen(true)
	}


	return (<>
		<div>DashBoard</div>
		<button onClick={createDocument}>Create Document</button>
		
	</>
	);
}
