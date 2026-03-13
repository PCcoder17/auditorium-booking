import React from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "./firebase"; 
import "./Login.css";

function Login({ setUser }) {
  const handleLogin = () => {
    signInWithPopup(auth, googleProvider)
      .then((result) => {
        setUser(result.user);
      })
      .catch((error) => console.error(error));
  };

  return (
    <div className="login-container" style={{
      /* Background Image fix */
      background: `url('/bg.jpg')`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat"
    }}>
      
      {/* Logo */}
      <img src="/image.png" alt="GD Goenka Logo" className="top-logo" />

      <div className="login-box">
        {/* ✅ INLINE STYLE: Ye color ko force karega Black hone ke liye */}
        <h2 style={{ color: "#000000", fontWeight: "bold", textShadow: "none" }}>
          🎓 Welcome to GD Goenka
        </h2>
        
        <p style={{ color: "#000000", fontWeight: "500", textShadow: "none" }}>
          Auditorium & Meeting Room Booking Portal
        </p>

        <button className="google-btn" onClick={handleLogin}>
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" />
          Sign in with Google
        </button>
      </div>
    </div>
  );
}

export default Login;