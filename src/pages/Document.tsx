import Tiptap from '../components/TextEditor'
import Button from 'react-bootstrap/Button'
import styles from "../styles/Document.module.css"
import Modal from 'react-bootstrap/Modal';
import { AsyncTypeahead } from 'react-bootstrap-typeahead'; // ES2015
import { useState } from 'react';
import { Option } from 'react-bootstrap-typeahead/types/types';
import { type } from 'os';
import useAxios from '../hooks/useAxios';

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

    const openInviteModal = () => {
        setIsModalOpen(true)
    }
    const closeModal = () => {
        setIsModalOpen(false)
    }
    const handleSearch = async (query: string) => {
        const response = await axios.get<User[]>(`/api/users?query=${query}`)
        setOptions(response.data)
        setAreUsersLoading(false)
    }

    return (
        <div className={styles.root}>
            

            <Tiptap />
        </div>
    )
}
