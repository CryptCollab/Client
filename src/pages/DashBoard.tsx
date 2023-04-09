import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAxios from "../hooks/useAxios";
import { Button, Modal } from "react-bootstrap";
import TypeAhead from "../components/TypeAhead";



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
	const [options, setOptions] = useState<User[]>([]);
	const [areUsersLoading, setAreUsersLoading] = useState(false);
	const axios = useAxios();
	const openInviteModal = () => {
		setIsModalOpen(true)
	}
	const closeModal = () => {
		setIsModalOpen(false)
	}
	const handleSearch = async (query: string) => {
		const response = await axios.get<User[]>(`/api/users?user=${query}`)
		setOptions(response.data)
		console.log(response.data)
		setAreUsersLoading(true)
	}
	return (<>
		<div>DashBoard</div>
		<button onClick={createDocument}>Create Document</button>
		<Button variant="primary" onClick={openInviteModal}> Invite Users </Button>
		<Modal show={isModalOpen} onHide={openInviteModal}>
			<Modal.Header>
				<Modal.Title>Search here</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<TypeAhead />
			</Modal.Body>
			<Modal.Footer>
				<Button variant="secondary" onClick={closeModal}>
					Close
				</Button>
			</Modal.Footer>
		</Modal>
	</>
	);
}
