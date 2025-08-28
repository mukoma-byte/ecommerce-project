import { useState, useEffect } from 'react'
import { ChatInput } from './components/ChatInput'
import { Chatbot } from 'supersimpledev';
import ChatMessages from './components/ChatMessages';
import './App.css'

   
      

    
 function App() {
        const [chatMessages, setChatMessages] = useState([
          //  { message: "Hello chatbot", sender: "user", time:"14:48pm" },
          //  { message: "Hello! How can I help you today?", sender: "robot", time:"14:48pm" },
          // { message: "can you get me todays date?", sender: "user" },
          // { message: "Today is September 27", sender: "robot" },
        ]);

        useEffect(() => {
          Chatbot.addResponses({
            "Who is my girl": "Beryl",
            "Who is my girl?": "Beryl",
            "who is my girl": "Beryl"
          })
        }, [])
        return (
          <div className="app-container">
            {chatMessages.length === 0?<p className="welcome-message">Welcome to the chatbot project! Send a message using the textbox below.</p>:''}
            <ChatMessages chatMessages={chatMessages} />
            <ChatInput
              chatMessages={chatMessages}
              setChatMessages={setChatMessages}
            />
          </div>
        );
      }
export default App
