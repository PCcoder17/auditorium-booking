import React from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css"; 

const roomData = [
  { name: "Conference Room 1", capacity: "20 Pax", screen: "65-inch Smart TV", connection: "HDMI, WiFi Cast", extra: "Video Conferencing Cam" },
  { name: "Board Room", capacity: "15 Pax", screen: "Projector Screen", connection: "HDMI", extra: "Oval Table, Premium Chairs" },
  { name: "Meeting Room A", capacity: "8 Pax", screen: "Whiteboard Only", connection: "N/A", extra: "Soundproof Glass" },
];

function MeetingRoomDetails() {
  const navigate = useNavigate();
  return (
    <div className="dashboard-container" style={{padding:"0", minHeight:"100vh", background: "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)"}}>
      
      {/* ✅ Logo Fixed: image.png */}
      <img src="/image.png" alt="Logo" style={{position:"absolute", top:"5px", left:"20px", width:"150px", zIndex:1000, background:"#1e3c72", padding:"8px", borderRadius:"5px", boxShadow:"0 2px 5px rgba(0,0,0,0.2)"}} />

      {/* ✅ Uniform Header */}
      <header style={{
         background: "#1e3c72", 
         height: "80px", 
         display: "flex", 
         alignItems: "center", 
         justifyContent: "center",
         paddingLeft: "200px", 
         paddingRight: "40px", 
         boxShadow: "0 4px 10px rgba(0,0,0,0.3)", 
         marginBottom: "40px"
      }}>
         <h2 style={{color: "white", margin: 0, fontSize: "28px"}}>🤝 Meeting Room Facilities</h2>
         
         <button onClick={() => navigate("/home")} style={{
             marginLeft: "auto", 
             background:"transparent", 
             border:"1px solid white", 
             color:"white", 
             padding:"8px 15px", 
             borderRadius:"5px", 
             cursor:"pointer",
             fontWeight: "bold"
         }}>
            ⬅ Back Home
         </button>
      </header>

      {/* Details Cards */}
      <div style={{padding: "0 40px", display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(300px, 1fr))", gap:"20px"}}>
        {roomData.map((room, index) => (
          <div key={index} style={{
              background:"white", 
              padding:"25px", 
              borderRadius:"10px", 
              boxShadow:"0 10px 30px rgba(0,0,0,0.3)", 
              borderLeft:"5px solid #2c3e50"
          }}>
            <h3 style={{margin:"0 0 15px 0", color:"#2c3e50", fontSize:"22px", borderBottom:"1px solid #eee", paddingBottom:"10px"}}>{room.name}</h3>
            
            {/* ✅ FORCE BLACK TEXT */}
            <div style={{color: "#333", marginBottom: "8px", fontSize:"15px"}}><strong>🪑 Capacity:</strong> {room.capacity}</div>
            <div style={{color: "#333", marginBottom: "8px", fontSize:"15px"}}><strong>📺 Screen:</strong> {room.screen}</div>
            <div style={{color: "#333", marginBottom: "8px", fontSize:"15px"}}><strong>🔌 Connectivity:</strong> {room.connection}</div>
            <div style={{color: "#333", marginBottom: "8px", fontSize:"15px"}}><strong>✨ Extra:</strong> {room.extra}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
export default MeetingRoomDetails;