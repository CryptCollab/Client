import Tiptap from "../components/TextEditor";
import styles from "../styles/document.module.css";
// ES2015
import { useState } from "react";
import useAxios from "../hooks/useAxios";
import useLoadingDone from "../hooks/useLoadingDone";

type LocalOption = Record<string, User>;
interface User {
    userName: string;
    email: string;
    userId: string;
}
interface Item {
    avatar_url: string;
    id: string;
    login: string;
}

export default function Document() {

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [options, setOptions] = useState<User[]>([]);
	const [areUsersLoading, setAreUsersLoading] = useState(false);
	const axios = useAxios();
	useLoadingDone();


	const openInviteModal = () => {
		setIsModalOpen(true);
	};
	const closeModal = () => {
		setIsModalOpen(false);
	};
	const handleSearch = async (query: string) => {
		const response = await axios.get<User[]>(`/api/users?query=${query}`);
		setOptions(response.data);
		setAreUsersLoading(false);
	};

	return (
		<div className={styles.root}>


			<Tiptap />
		</div>
	);
}
