import RobotProfileImage from '../assets/robot.png'
import UserProfileImage from '../assets/profile-1.png'
import './ChatMessage.css'
export function ChatMessage({ sender, message, time }) {
        // Each component has one parameter usually called properties.
        // Shortened to props.
        // Used destructing.
        // const {sender, message} = props;
        /*
        if (sender === "robot") {
          return (
            <div>
              <img src="./robot.png" width="50" />
              {message}
            </div>
          );
        }
          */
        return (
          <div
            className={
              sender === "user" ? "chat-message-user" : "chat-message-robot"
            }
          >
            {sender === "robot" && (
              <img src={RobotProfileImage}className="chat-message-profile" />
            )}
            <div className="chat-message-text">{message}
            <p className='chat-message-time'>{time}</p>
            </div>
           

            {sender === "user" && (
              <img src={UserProfileImage} className="chat-message-profile" />
            )}
          </div>
        );
      }