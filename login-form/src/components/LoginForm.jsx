 import { useState } from 'react'
 import './LoginForm.css'

 function LoginForm() {
        const [showPassword, setShowPassword] = useState(true);
        function togglePassword() {
          showPassword === true
            ? setShowPassword(false)
            : setShowPassword(true);
        }
        return (
          <div className="loginForm-container">
            <div>
              <input
                placeholder="Email"
                type="email"
                className="input input-email"
              />
            </div>

            <div>
              <input
                placeholder="password"
                type={showPassword === true ? "password" : "text"}
                className="input input-password"
              />
              <button className="hide-btn" onClick={togglePassword}>
               {showPassword === true ? "Show" : "Hide"}
              </button>
            </div>

            <button className="btn login-btn">Login</button>
            <button className="btn signup-btn">Sign up</button>
          </div>
        );
      }

export default LoginForm;