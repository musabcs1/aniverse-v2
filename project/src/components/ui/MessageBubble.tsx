import React from 'react';
import { Message } from '../../types';
import { formatDistanceToNow } from 'date-fns';
import { Check } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwnMessage }) => {
  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
      {!isOwnMessage && (
        <div className="w-8 h-8 rounded-full overflow-hidden mr-2 flex-shrink-0">
          <img 
            src={message.senderAvatar || 'https://via.placeholder.com/40'} 
            alt={message.senderName} 
            className="h-full w-full object-cover"
            onError={(e) => {
              e.currentTarget.src = 'https://via.placeholder.com/40';
            }}
          />
        </div>
      )}
      
      <div className={`max-w-[70%] ${isOwnMessage ? 'order-1' : 'order-2'}`}>
        {!isOwnMessage && (
          <div className="text-xs text-gray-400 mb-1 ml-1">{message.senderName}</div>
        )}
        
        <div 
          className={`p-3 rounded-lg ${
            isOwnMessage 
              ? 'bg-primary text-white rounded-tr-none' 
              : 'bg-surface-dark text-gray-200 rounded-tl-none'
          }`}
        >
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        </div>
        
        <div className={`flex items-center mt-1 text-xs text-gray-500 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
          <span>{formatDistanceToNow(message.createdAt, { addSuffix: true })}</span>
          
          {isOwnMessage && (
            <div className="ml-2">
              {message.read ? (
                <div className="flex">
                  <Check className="h-3 w-3 text-primary -mr-1" />
                  <Check className="h-3 w-3 text-primary" />
                </div>
              ) : (
                <Check className="h-3 w-3" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble; 