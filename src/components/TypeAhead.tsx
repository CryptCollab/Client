/* eslint-disable import/no-unresolved,camelcase */

import React, { useEffect, useState } from 'react';
import { AsyncTypeahead } from 'react-bootstrap-typeahead';
import useAxios from '../hooks/useAxios';
import { Option } from 'react-bootstrap-typeahead/types/types';
import { Button } from 'react-bootstrap';

interface Item {
    avatar_url: string;
    id: string;
    login: string;
}

interface Response {
    items: Item[];
}


interface User {
    userName: string;
    email: string;
    userId: string;
}

interface Props{
    selected: any[];
    setSelected: (selected: any[]) => void;
}


const TypeAhead: React.FC<Props> = ({selected, setSelected}) => {
    const [areUsersLoading, setAreUsersLoading] = useState(false);
    const [options, setOptions] = useState<User[]>([]);
    const axios = useAxios();

    const handleSearch = async (query: string) => {
        setAreUsersLoading(true);
        const response = await axios.get<User[]>(`/api/users?user=${query}`)
        setOptions(response.data);
        setAreUsersLoading(false);
    }
    return (
        <AsyncTypeahead
            filterBy={() => true}
            id="async-example"
            isLoading={areUsersLoading}
            labelKey="userName"
            minLength={2}
            onSearch={handleSearch}
            // selected={selected}
            onChange={setSelected}
            options={options}
            multiple
            placeholder="Search for a Github user..."
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