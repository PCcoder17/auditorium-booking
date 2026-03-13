import React, { useState } from "react";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "./Admin.css"; 

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/admin");
    } catch (error) {
      alert("Invalid Admin Credentials!");
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-box">
        <h2>🛡️ Admin Login</h2>
        <form onSubmit={handleLogin} style={{display:"flex", flexDirection:"column", gap:"10px"}}>
          <input type="email" placeholder="Email" onChange={(e)=>setEmail(e.target.value)} style={{padding:"10px"}} />
          <input type="password" placeholder="Password" onChange={(e)=>setPassword(e.target.value)} style={{padding:"10px"}} />
          <button type="submit" style={{padding:"10px", background:"#2c3e50", color:"white", cursor:"pointer"}}>Login</button>
        </form>
      </div>
    </div>
  );
}