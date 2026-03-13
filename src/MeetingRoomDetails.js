import React from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css"; // Teri purani CSS use ho jayegi

// 👇 EXCEL SHEET WALA DATA 👇
const meetingRoomDetails = [
  {
    id: 1,
    name: "Conference room, D Block, 1st Floor",
    capacity: 20,
    projectors: 1,
    speakers: 4,
    devices: 2,
    internet: "Yes",
    display: "1 interactive monitor screen",
    mics: "0"
  },
  {
    id: 2,
    name: "Conference room, B Block, Ground Floor",
    capacity: 15,
    projectors: 1,
    speakers: 1,
    devices: 0,
    internet: "Yes",
    display: "NA",
    mics: "0"
  },
  {
    id: 3,
    name: "B Block VC Lounge",
    capacity: 15,
    projectors: 0,
    speakers: 0,
    devices: 0,
    internet: "Yes",
    display: "1 smart TV",
    mics: "0"
  },
  {
    id: 4,
    name: "B Block Conference room, 1st Floor (B103)",
    capacity: 10,
    projectors: 0,
    speakers: 0,
    devices: 0,
    internet: "Yes",
    display: "1 interactive panel",
    mics: "0"
  }
];

function MeetingInfo() {
  const navigate = useNavigate();

  return (
    <div className="dashboard-container" style={{ padding: "0", minHeight: "100vh", background: "#f4f6f9" }}>
      
      {/* HEADER */}
      <header style={{ background: "#1e3c72", padding: "15px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 4px 15px rgba(0,0,0,0.3)" }}>
        <h2 style={{ color: "white", margin: 0, fontSize: "24px", fontWeight: "bold" }}>
          📋 Meeting Room Facilities
        </h2>
        <button onClick={() => navigate("/home")} style={{ background: "rgba(255,255,255,0.2)", color: "white", border: "1px solid rgba(255,255,255,0.5)", padding: "8px 15px", borderRadius: "20px", cursor: "pointer", fontWeight: "bold" }}>
          ⬅ Back Home
        </button>
      </header>

      {/* DETAILS GRID */}
      <div style={{ padding: "40px", display: "flex", flexWrap: "wrap", gap: "20px", justifyContent: "center" }}>
        {meetingRoomDetails.map((room) => (
          <div key={room.id} className="white-info-card" style={{
            background: "white", 
            width: "350px", 
            padding: "20px", 
            borderRadius: "15px", 
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
            borderTop: "5px solid #1e3c72"
          }}>
            <h3 style={{ color: "#1e3c72", borderBottom: "2px solid #eee", paddingBottom: "10px", marginTop: "0" }}>
              {room.name}
            </h3>
            
            <div style={{ color: "#333", fontSize: "15px", lineHeight: "1.8" }}>
              <p style={{margin: "5px 0"}}>👥 <strong>Capacity:</strong> {room.capacity} Persons</p>
              <p style={{margin: "5px 0"}}>📽️ <strong>Projectors:</strong> {room.projectors}</p>
              <p style={{margin: "5px 0"}}>📺 <strong>Display:</strong> {room.display}</p>
              <p style={{margin: "5px 0"}}>🔊 <strong>Speakers:</strong> {room.speakers}</p>
              <p style={{margin: "5px 0"}}>🎤 <strong>Mics:</strong> {room.mics}</p>
              <p style={{margin: "5px 0"}}>💻 <strong>Devices (Laptops):</strong> {room.devices}</p>
              <p style={{margin: "5px 0"}}>🌐 <strong>Internet:</strong> {room.internet}</p>
            </div>
          </div>
        ))}
      </div>
      
    </div>
  );
}

export default MeetingInfo;