  import { useEffect, useRef } from 'react'
  import { ChatMessage } from './ChatMessage';
  
  function ChatMessages({ chatMessages }) {
        const chatMessagesRef = useAutoScroll(chatMessages);
        return (
          <div 
            className="chat-messages-container"
            ref={chatMessagesRef}>
            {chatMessages.map((chatMessage, index) => {
              return (
                <ChatMessage
                  key={index}
                  message={chatMessage.message}
                  time={chatMessage.time}
                  sender={chatMessage.sender}
                />
              );
            })}
          </div>
        );
      }

      function useAutoScroll(dependencies){
         const containerRef = useRef(null);
        useEffect(() => {
        const containerElem = containerRef.current
        if(containerElem){
          containerElem.scrollTop = containerElem.scrollHeight;
        }else{
          console.log("there is no container ref")
        }
        }, [dependencies])
         return containerRef;
      }

      export default ChatMessages;
