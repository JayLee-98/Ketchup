import React, { useEffect } from 'react';
import { Chat, Channel, ChannelList, Window, ChannelHeader, MessageList, MessageInput, Thread, LoadingIndicator } from 'stream-chat-react';
import 'stream-chat-react/dist/css/v2/index.css';

const ChatPage = ({ client, filters, sort }) => {
  useEffect(() => {
    if (!client) return;

    const memberIds = ['2405001', '2405003'];
    const members = Array.from(new Set([client.userID, ...memberIds]));

    const channel = client.channel('messaging', 'common-channel', {
      members
    });

    const handleTypingStart = event => {
      if (event.parent_id) {
        console.log(`${event.user.name} started typing in thread ${event.parent_id}`);
      } else {
        console.log(`${event.user.name} started typing`);
      }
    };

    const handleTypingStop = event => {
      if (event.parent_id) {
        console.log(`${event.user.name} stopped typing in thread ${event.parent_id}`);
      } else {
        console.log(`${event.user.name} stopped typing`);
      }
    };

    channel.on('typing.start', handleTypingStart);
    channel.on('typing.stop', handleTypingStop);

    return () => {
      channel.off('typing.start', handleTypingStart);
      channel.off('typing.stop', handleTypingStop);
    };
  }, [client]);

  if (!client) return <LoadingIndicator />;

  const handleKeystroke = async () => {
    const memberIds = ['2405001', '2405003', '2405005'];
    const members = Array.from(new Set([client.userID, ...memberIds]));

    const channel = client.channel('messaging', 'common-channel', {
      members
    });
    await channel.keystroke();
  };

  const handleStopTyping = async () => {
    const memberIds = ['2405001', '2405003', '2405005'];
    const members = Array.from(new Set([client.userID, ...memberIds]));

    const channel = client.channel('messaging', 'common-channel', {
      members
    });
    await channel.stopTyping();
  };

  return (
    <main id="main" className="main">
      <Chat client={client} theme='team light'>
        <ChannelList filters={filters} sort={sort} />
        <Channel channel={client.channel('messaging', 'common-channel', {
          members: Array.from(new Set([client.userID, '2405001', '2405003', '2405005'])) // 중복 제거
        })}>
          <Window>
            <ChannelHeader />
            <MessageList />
            <MessageInput onChange={handleKeystroke} onSend={handleStopTyping} />
          </Window>
          <Thread />
        </Channel>
      </Chat>
    </main>
  );
};

export default ChatPage;
