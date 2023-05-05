/* eslint-disable import/no-unresolved,camelcase */

import React, { useEffect, useState } from 'react';
import { AsyncTypeahead } from 'react-bootstrap-typeahead';
import useAxios from '../hooks/useAxios';
import 'react-bootstrap-typeahead/css/Typeahead.css';

interface User {
    userName: string;
    email: string;
    userId: string;
}

export interface TypeAheadProps {
    selectedUserList: any[];
    setSelectedUserList: React.Dispatch<React.SetStateAction<any[]>>;
}

const TypeAhead: React.FC<TypeAheadProps> = ({ selectedUserList, setSelectedUserList }) => {

    const [areUsersLoading, setAreUsersLoading] = useState(false);
    const [fetchedUserList, setFetchedUserList] = useState<User[]>([]);
    const axios = useAxios();

    const handleSearch = async (query: string) => {
        setAreUsersLoading(true);
        const response = await axios.get<User[]>(`/api/users?user=${query}`)
        setFetchedUserList(response.data);
        setAreUsersLoading(false);
    }
    const filterBy = (option: any) => !selectedUserList.includes(option);

    return (
        <AsyncTypeahead
            filterBy={filterBy}
            id="async-example"
            isLoading={areUsersLoading}
            labelKey="userName"
            key="userId"
            useCache
            minLength={2}
            onSearch={handleSearch}
            onChange={setSelectedUserList}
            options={fetchedUserList}
            multiple
            placeholder="Search by username or email..."
            renderMenuItemChildren={(option: any) => (
                <>
                    <span>{option.userName} • {option.email}</span>
                    {/* <Button variant = "secondary" >Invite</Button> */}
                </>
            )}
        />
    );
};

export default TypeAhead;