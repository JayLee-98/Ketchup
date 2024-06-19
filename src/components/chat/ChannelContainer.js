import React from 'react';
import { Channel, MessageSimple } from 'stream-chat-react';

import { ChannelInner, CreateChannel, EditChannel } from '../';

const ChannelContainer = ({ isCreating, setIsCreating, isEditing, setIsEditing, createType }) => {

    if (isCreating) {
        return (
            <div className='channel__container'>
                <CreateChannel createType={createType} setIsCreating={setIsCreating} />
            </div>
        );
    }

    if (isEditing) {
        return (
            <div className='channel__container'>
                <EditChannel setIsEditing={setIsEditing} />
            </div>
        );
    }

    const EmptyState = () => (
        <div className='channel-empty__container'>
            <p className='channel-empty__first'>메세지가 없습니다.</p>
            <p className='channel-empty__second'>메세지를 보내고 대화를 시작해보세요.</p>
        </div>
    );

    return (
        <div className='channel__container'>
            <Channel
                EmptyStateIndicator={EmptyState}
                Message={(messageProps, i) => <MessageSimple key={i} {...messageProps} />}
            >
                <ChannelInner setIsEditing={setIsEditing} />
            </Channel>
        </div>
    );
}

export default ChannelContainer;