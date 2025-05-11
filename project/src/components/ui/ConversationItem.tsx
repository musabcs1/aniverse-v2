import React from 'react';
import { Conversation } from '../../types';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface ConversationItemProps {
  conversation: Conversation;
  otherUser: {
    id: string;
    username: string;
    avatar?: string;
  };
}

const ConversationItem: React.FC<ConversationItemProps> = ({ conversation, otherUser }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const handleClick = () => {
    navigate(`/messages/${conversation.id}`);
  };
  
  const isUnread = conversation.unreadCount > 0 && conversation.lastMessage?.senderId !== currentUser?.id;

  return (
    <div
      className={`p-4 flex items-center cursor-pointer transition-colors ${
        isUnread ? 'bg-surface-dark border-l-2 border-primary' : 'bg-surface hover:bg-surface-light'
      }`}
      onClick={handleClick}
    >
      <div className="relative">
        <div className="w-12 h-12 rounded-full overflow-hidden">
          <img 
            src={otherUser.avatar || 'https://via.placeholder.com/40'} 
            alt={otherUser.username} 
            className="h-full w-full object-cover"
            onError={(e) => {
              e.currentTarget.src = 'https://via.placeholder.com/40';
            }}
          />
        </div>
        {isUnread && (
          <div className="absolute -top-1 -right-1 h-4 w-4 bg-primary rounded-full"></div>
        )}
      </div>
      
      <div className="ml-4 flex-1 min-w-0">
        <div className="flex justify-between items-baseline">
          <h4 className={`font-medium ${isUnread ? 'text-white' : 'text-gray-200'}`}>
            {otherUser.username}
          </h4>
          {conversation.lastMessage && (
            <span className="text-xs text-gray-400">
              {formatDistanceToNow(conversation.lastMessage.createdAt, { addSuffix: true })}
            </span>
          )}
        </div>
        {conversation.lastMessage ? (
          <p className={`text-sm truncate pr-4 ${isUnread ? 'text-gray-200' : 'text-gray-400'}`}>
            {conversation.lastMessage.senderId === currentUser?.id && (
              <span className="text-gray-500 mr-1">You:</span>
            )}
            {conversation.lastMessage.content}
          </p>
        ) : (
          <p className="text-sm text-gray-500">Start a conversation</p>
        )}
      </div>
    </div>
  );
};

export default ConversationItem; 