import React from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";
import "./UserHome.css"; 

function UserHome({ user, setUser }) {
  const navigate = useNavigate();
  const ADMINS = ["240160203087.priyesh@gdgu.org"]; 
  const isAdmin = user && ADMINS.includes(user.email);

  const handleLogout = () => {
    signOut(auth).then(() => {
      setUser(null);
      navigate("/");
    });
  };

  return (
      
      <div className="modern-home-container">
  
  {/* ✅ 1. LOCUS BRANDING (Ab Sabse Upar) */}
  <div className="home-locus-brand">
    <h1 className="locus-text-main">LOCUS</h1>
    <div className="locus-underline"></div>
  </div>

  {/* ✅ 2. GD GOENKA LOGO (Ab LOCUS ke Niche) */}
  <img src="/image.png" alt="Logo" className="floating-logo" />

  {/* ... baaki header aur grid same rahega ... */}

      <header className="modern-header"> 
        <div className="welcome-section">
            <h1>👋 Welcome, {user?.displayName ? user.displayName.split(" ")[0] : "User"}</h1>
            {isAdmin && (
              <button onClick={() => navigate("/admin")} className="modern-admin-btn">
                🛡️ Admin Panel
              </button>
            )}
        </div>
        <button className="modern-logout-btn" onClick={handleLogout}>Logout</button>
      </header>

      <div className="modern-grid">
        <div className="modern-card card-blue" onClick={() => navigate("/auditorium")}>
          <div className="card-icon">🏟️</div>
          <h3>Book Auditorium</h3>
          <p>Reserve the main hall for big events.</p>
        </div>

        <div className="modern-card card-green" onClick={() => navigate("/meeting-booking")}>
          <div className="card-icon">🤝</div>
          <h3>Book Meeting Room</h3>
          <p>Schedule conference & board rooms.</p>
        </div>

        <div className="modern-card card-orange" onClick={() => navigate("/my-bookings")}>
          <div className="card-icon">📜</div>
          <h3>My Bookings</h3>
          <p>Track your requests & status.</p>
        </div>

        <div className="modern-card card-purple" onClick={() => navigate("/schedule")}>
          <div className="card-icon">📊</div>
          <h3>Resource Tracker</h3>
          <p>Live availability of all rooms.</p>
        </div>

        <div className="modern-card card-cyan" onClick={() => navigate("/auditorium-details")}>
          <div className="card-icon">ℹ️</div>
          <h3>Auditorium Info</h3>
          <p>Check capacity & equipment.</p>
        </div>

        <div className="modern-card card-teal" onClick={() => navigate("/meeting-details")}>
          <div className="card-icon">📋</div>
          <h3>Meeting Room Info</h3>
          <p>Check room facilities.</p>
        </div>
      </div>
    </div>
  );
}

export default UserHome;