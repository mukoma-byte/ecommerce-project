import { useState } from 'react'
import {Chatbot} from 'supersimpledev'
import './ChatInput.css'
import dayjs from 'dayjs'
import LoadingSpinner from '../assets/loading-spinner.gif'

export function ChatInput({ chatMessages, setChatMessages }) {
        const [inputText, setInputText] = useState("");
        const time = dayjs().valueOf();
        const timeFormated = dayjs(time).format("HH:mm")
        

        function saveInput(event) {
          setInputText(event.target.value);
        }
       async function sendMessage() {
          //In react the state is updated after the code is finished
          setInputText('')

          const newChatMessages = [
            ...chatMessages,
            {
              message: inputText,
              sender: "user",
              time: timeFormated,
              key: crypto.randomUUID(),
            },
          ];
          
            setChatMessages([
            ...newChatMessages,
            {
              message: <img src={LoadingSpinner} alt="loading spinner" className="loading-spinner"/>,
              sender: "robot",
              key: crypto.randomUUID(),
            },
          ]);
          const response = await Chatbot.getResponseAsync(inputText);
        
          setTimeout(() => {
            setChatMessages([
            ...newChatMessages,
            {
              message: response,
              sender: "robot",
              time: timeFormated,
              key: crypto.randomUUID(),
            },
          ])                                                                                                                                                                                                                                            
          }, 800);
          

          setInputText("");
        }

        return (
          <div className="chat-input-container">
            <input
              placeholder="Send message to chatbot"
              size="30"
              onChange={saveInput}
              value={inputText}
              className="chat-input"
            />
            <button onClick={sendMessage} className="send-btn">
              Send
            </button>
          </div>
        );
      }