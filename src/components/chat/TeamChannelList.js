import React from 'react';
import { AddChannel } from '../../assets';

const TeamChannelList = ({ children, error = false, loading, type, isCreating, setIsCreating, setCreateType, setIsEditing, setToggleContainer }) => {
    if (error) {
        return type === 'team' ? (
            <div className='team-channel-list'>
                <p className='team-channel-list__message'>
                    <strong>잠시 후 다시 시도해주세요.</strong> 서버로부터 대화내용을 불러오지 못했습니다. 지속적으로 발생할 경우 관리자에게 문의해주세요.
                </p>
            </div>
        ) : null
    }

    if (loading) {
        return (
            <div className='team-channel-list'>
                <p className='team-channel-list__message loading'>
                    {type === 'team' ? 'Channels' : 'Messages'} 로딩 중...
                </p>
            </div>
        )
    }

    return (
        <div className='team-channel-list'>
            <div className='team-channel-list__header'>
                <p className='team-channel-list__header__title'>
                    {type === 'team' ? 'Channels' : 'Direct Messages'}
                </p>
                <AddChannel
                    type={type === 'team' ? 'team' : 'messaging'}
                    isCreating={isCreating}
                    setIsCreating={setIsCreating}
                    setCreateType={setCreateType}
                    setIsEditing={setIsEditing}
                    setToggleContainer={setToggleContainer}
                />
            </div>
            {children}
        </div>
    );
}

export default TeamChannelList;