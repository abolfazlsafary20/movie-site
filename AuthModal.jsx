import React, { useState, useEffect } from "react";
import "./style.css";

const AuthModal = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setIsLogin(true);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleForm = () => setIsLogin(!isLogin);

  return (
    <div className="auth-modal-backdrop" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <h2>{isLogin ? "Login" : "Sign Up"}</h2>

        <form className="auth-form">
          {!isLogin && <input type="text" placeholder="Username" required />}
          <input type="email" placeholder="Email" required />
          <input type="password" placeholder="Password" required />
          {!isLogin && <input type="password" placeholder="Confirm Password" required />}
          <button type="submit">{isLogin ? "Login" : "Sign Up"}</button>
        </form>

        <p className="toggle-text">
          {isLogin ? "Don't have an account? " : "Already registered? "}
          <span onClick={toggleForm}>
            {isLogin ? "Sign up" : "Login"}
          </span>
        </p>

        <button className="auth-close-btn" onClick={onClose}>×</button>
      </div>
    </div>
  );
};

export default AuthModal;