import React, { useEffect, useState } from 'react';
import { Avatar, useChatContext } from 'stream-chat-react';

import { InviteIcon } from '../../assets';

const ListContainer = ({ children }) => {
    return (
        <div className='user-list__container'>
            <div className='user-list__header'>
                <p>사용자</p>
                <p>초대</p>
            </div>
            {children}
        </div>
    );
}

const UserItem = ({ user, setSelectedUsers }) => {
    const [selected, setSelected] = useState(false);

    const handleSelect = () => {
        if (selected) {
            setSelectedUsers((prevUsers) => prevUsers.filter((prevUser) => prevUser !== user.id))
        } else {
            setSelectedUsers((prevUsers) => [...prevUsers, user.id])
        }
        setSelected((prevSelected) => !prevSelected);
    };

    return (
        <div className='user-item__wrapper'>
            <div className='user-item__name-wrapper'>
                <Avatar image={user.imgUrl} name={user.memberName} size={32} />
                {/* Avatar에 user.imgUrl과 name memberName이 맞는지 확앤해야함. */}
                <p className='user-item__name'>{user.memberName || user.id}</p>
            </div>
            {selected ? <InviteIcon /> : <div className='user-item__invite-empty'></div>}
        </div>
    );
}

const UserList = ({ setSelectedUsers }) => {
    const { client } = useChatContext();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [listEmpty, setListEmpty] = useState(false);
    const { error, setError } = useState(false);

    useEffect(() => {
        const getUsers = async () => {
            if (loading) return;

            setLoading(true);

            try {
                const response = await client.queryUsers(
                    { id: { $ne: client.userID } },
                    { id: 1 },
                    { limit: 100 }
                );

                if (response.users.length) {
                    setUsers(response.users);
                } else {
                    setListEmpty(true);
                }
            } catch (error) {
                setError(true);
            }
            setLoading(false);
        }

        if (client) getUsers();
    }, []);

    if (error) {
        return (
            <ListContainer>
                <div className='user-list__message'>
                    에러가 발생했습니다. 새로고침해주십시오.
                </div>
            </ListContainer>
        );
    }

    if (listEmpty) {
        return (
            <ListContainer>
                <div className='user-list__message'>
                    검색어와 일치하는 이용자가 없습니다.
                </div>
            </ListContainer>
        );
    }

    return (
        <ListContainer>
            {loading ? <div className='user-list__message'>
                사용자 조회 중...
            </div> : (
                users?.map((user, i) => (
                    <UserItem index={i} key={user.id} user={user} setSelectedUsers={setSelectedUsers} />
                ))
            )}
        </ListContainer>
    );
}

export default UserList;