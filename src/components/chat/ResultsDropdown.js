import React from 'react';
import { Avatar, useChatContext } from 'stream-chat-react';

const channelByUser = async ({ client, setActiveChannel, channel, setChannel }) => {
  const filters = {
    type: 'messaging',
    member_count: 2,
    members: { $eq: [client.user.id, client.userID] },
  };

  const [existingChannel] = await client.queryChannels(filters);

  if (existingChannel) return setActiveChannel(existingChannel);

  const newChannel = client.channel('messaging', { members: [channel.id, client.userID] });
  
  setChannel(newChannel)

  return setActiveChannel(newChannel);
};

const SearchResult = ({ channel, focusedId, type, setChannel, setToggleContainer }) => {
  const { client, setActiveChannel } = useChatContext();

  if (type === 'channel') {
    return (
      <div
        onClick={() => {
          setChannel(channel)
          if(setToggleContainer) {
            setToggleContainer((prevState) => !prevState)   
          }
        }}
        className={focusedId === channel.id ? 'channel-search__result-container__focused' : 'channel-search__result-container' }
      >
        <div className='result-hashtag'>#</div>
        <p className='channel-search__result-text'>{channel.data.name}</p>
      </div>
    );
  }

  return (
    <div
      onClick={async () => {
        channelByUser({ client, setActiveChannel, channel, setChannel })
        if(setToggleContainer) {
            setToggleContainer((prevState) => !prevState)   
        }
      }}
      className={focusedId === channel.id ? 'channel-search__result-container__focused' : 'channel-search__result-container' }
    >
      <div className='channel-search__result-user'>
        <Avatar image={channel.image || undefined} name={channel.name} size={24} />
        <p className='channel-search__result-text'>{channel.name}</p>
      </div>
    </div>
  );
};

const ResultsDropdown = ({ teamChannels, directChannels, focusedId, loading, setChannel, setToggleContainer }) => {

  return (
    <div className='channel-search__results'>
      <p className='channel-search__results-header'>채널</p>
      {loading && !teamChannels.length && (
        <p className='channel-search__results-header'>
          <i>로딩 중...</i>
        </p>
      )}
      {!loading && !teamChannels.length ? (
        <p className='channel-search__results-header'>
          <i>검색어와 일치하는 채널이 없습니다.</i>
        </p>
      ) : (
        teamChannels?.map((channel, i) => (
          <SearchResult
            channel={channel}
            focusedId={focusedId}
            key={i}
            setChannel={setChannel}
            type='channel'
            setToggleContainer={setToggleContainer}
          />
        ))
      )}
      <p className='channel-search__results-header'>이용자</p>
      {loading && !directChannels.length && (
        <p className='channel-search__results-header'>
          <i>로딩 중...</i>
        </p>
      )}
      {!loading && !directChannels.length ? (
        <p className='channel-search__res ults-header'>
          <i>검색하신 이용자와 주고받은 메세지가 없습니다.</i>
        </p>
      ) : (
        directChannels?.map((channel, i) => (
          <SearchResult
            channel={channel}
            focusedId={focusedId}
            key={i}
            setChannel={setChannel}
            type='user'
            setToggleContainer={setToggleContainer}
          />
        ))
      )}
    </div>
  );
};

export default ResultsDropdown;