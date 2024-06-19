import React, {useState} from 'react';
import { useChatContext } from 'stream-chat-react';

import { UserList } from '../';
import { CloseCreateChannel } from '../../assets';

const ChannelNameInput = ({ channelName = '', setChannelName }) => {
    const handleChange = (event) => {
        event.preventDefault();

        setChannelName(event.target.value);
    }

    return (
        <div className='channel-name-input__wrapper'>
            <p>이름</p>
            <input value={channelName} onChange={handleChange} placeholder='channel-name (no spaces)' />
            <p>이용자 추가</p>
        </div>
    );
}

const EditChannel = ({ setIsEditing }) => {
    const { channel } = useChatContext();
    const [channelName, setChannelName] = useState(channel?.data?.name);
    const [selectedUsers, setSelectedUsers] = useState([]);

    const updateChannel = async (event) => {
        event.preventDefault();

        const nameChanged = channelName !== (channel.data.name || channel.data.id);

        if (nameChanged) {
            await channel.update({name: channelName}, {text: `채널의 이름이 '${channelName}'(으)로 변경되었습니다.`});
        }

        if (selectedUsers.length) {
            await channel.addMembers(selectedUsers);
        }

        setChannelName(null);
        setIsEditing(false);
        setSelectedUsers([]);
    }

    return (
        <div className='edit-channel__container'>
            <div className='edit-channel__header'>
                <p>채널 수정</p>
                <CloseCreateChannel setIsEditing={setIsEditing} />
            </div>
            <ChannelNameInput channelName={channelName} setChannelName={setChannelName} />
            <UserList setSelectedUsers={setSelectedUsers} />
            <div className='edit-channel__button-wrapper' onClick={updateChannel}>
                수정사항 저장
            </div>
        </div>
    );
}

export default EditChannel;