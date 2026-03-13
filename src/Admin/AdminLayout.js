import { Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase"; 
import "./Admin.css";

function AdminLayout() {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    signOut(auth).then(() => {
      window.location.href = "/"; 
    });
  };

  return (
    <div className={`admin-layout ${isCollapsed ? "sidebar-collapsed" : ""}`}>
      
      {/* ✅ LOCUS BRANDING - Top Left Fixed */}
      <div className="locus-fixed-header">
        <h1 className="locus-logo">LOCUS</h1>
      </div>

      <aside className="admin-sidebar">
        {/* Sidebar Header - Wahi purana structure */}
        <div className="sidebar-header">
          {!isCollapsed && (
            <>
              <div style={{background:"#1e3c72", padding:"10px", borderRadius:"8px", marginBottom:"15px", textAlign:"center", width: "100%"}}>
                <img src="/image.png" alt="Logo" style={{width:"140px"}} />
              </div>
              <h3 className="panel-title" style={{color: "white"}}>🛡️ Admin Panel</h3>
            </>
          )}
        </div>

        <nav className="admin-nav">
          <button onClick={() => navigate("/admin/pending")}>
            <span className="nav-icon">🔔</span> {!isCollapsed && "Pending Requests"}
          </button>
          <button onClick={() => navigate("/dashboard")}>
            <span className="nav-icon">➕</span> {!isCollapsed && "New Booking (Self)"}
          </button>
          <button onClick={() => navigate("/admin/data")}>
            <span className="nav-icon">📊</span> {!isCollapsed && "All Records / Data"}
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="footer-action-btn" onClick={() => setIsCollapsed(!isCollapsed)}>
            {isCollapsed ? "➡️" : "⬅️ Collapse Sidebar"}
          </button>
          
          <button className="footer-action-btn logout-special" onClick={handleLogout}>
              🚪 {!isCollapsed && "Logout"}
          </button>
        </div>
      </aside>

      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;