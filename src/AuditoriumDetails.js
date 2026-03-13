import React from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css"; 

// 👇 EXCEL SHEET WALA NAYA DATA 👇
const auditoriumData = [
  { id: 1, name: "Audi, B Block, Ground Floor", capacity: "282", projectors: "2", wirelessMics: "2", wiredMics: "0", speakers: "0", devices: "1", internet: "YES", additionalIT: "2 podiums and 3 podium mics", tvMonitor: "0" },
  { id: 2, name: "Audi C block UID (Av Room)", capacity: "120", projectors: "1", wirelessMics: "2", wiredMics: "0", speakers: "2", devices: "1", internet: "YES", additionalIT: "1 podium and 1 podium mic", tvMonitor: "0" },
  { id: 3, name: "Audi SoHT", capacity: "50", projectors: "0", wirelessMics: "2", wiredMics: "2", speakers: "2", devices: "1", internet: "YES", additionalIT: "1 podium and 1 podium mic", tvMonitor: "2" },
  { id: 4, name: "Moot Court Hall D block", capacity: "50", projectors: "2", wirelessMics: "0", wiredMics: "5", speakers: "4", devices: "1", internet: "YES", additionalIT: "2 podium and 2 podium mic", tvMonitor: "2" },
  { id: 5, name: "Ampitheatre", capacity: "open", projectors: "0", wirelessMics: "0", wiredMics: "0", speakers: "2", devices: "0", internet: "YES", additionalIT: "NA", tvMonitor: "NA" },
  { id: 6, name: "Staff Refractory, B Block", capacity: "50", projectors: "NA", wirelessMics: "NA", wiredMics: "NA", speakers: "NA", devices: "NA", internet: "YES", additionalIT: "NA", tvMonitor: "NA" },
  { id: 7, name: "Student Refractory, B Block", capacity: "250", projectors: "NA", wirelessMics: "NA", wiredMics: "NA", speakers: "NA", devices: "NA", internet: "YES", additionalIT: "NA", tvMonitor: "NA" },
  { id: 8, name: "Staff Refractory, D Block", capacity: "50", projectors: "NA", wirelessMics: "NA", wiredMics: "NA", speakers: "NA", devices: "NA", internet: "YES", additionalIT: "NA", tvMonitor: "NA" },
  { id: 9, name: "UID Courtyard, C Block", capacity: "50", projectors: "1", wirelessMics: "NA", wiredMics: "2", speakers: "4", devices: "1", internet: "YES", additionalIT: "1 podium, 2 podium mic", tvMonitor: "NA" }
];

function AuditoriumDetails() {
  const navigate = useNavigate();

  return (
    <div className="dashboard-container" style={{ padding: "0", minHeight: "100vh", background: "#f4f6f9" }}>
      
      {/* HEADER */}
      <header style={{ background: "#1e3c72", padding: "15px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 4px 15px rgba(0,0,0,0.3)" }}>
        <h2 style={{ color: "white", margin: 0, fontSize: "24px", fontWeight: "bold" }}>
          🎭 Auditorium & Venue Facilities
        </h2>
        <button onClick={() => navigate("/home")} style={{ background: "rgba(255,255,255,0.2)", color: "white", border: "1px solid rgba(255,255,255,0.5)", padding: "8px 15px", borderRadius: "20px", cursor: "pointer", fontWeight: "bold" }}>
          ⬅ Back Home
        </button>
      </header>

      {/* DETAILS GRID */}
      <div style={{ padding: "40px", display: "flex", flexWrap: "wrap", gap: "20px", justifyContent: "center" }}>
        {auditoriumData.map((room) => (
          <div key={room.id} className="white-info-card" style={{
            background: "white", 
            width: "380px", 
            padding: "20px", 
            borderRadius: "15px", 
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
            borderTop: "5px solid #1e3c72"
          }}>
            <h3 style={{ color: "#1e3c72", borderBottom: "2px solid #eee", paddingBottom: "10px", marginTop: "0" }}>
              {room.name}
            </h3>
            
            <div style={{ color: "#333", fontSize: "14px", lineHeight: "1.8" }}>
              <p style={{margin: "4px 0"}}>👥 <strong>Capacity:</strong> {room.capacity}</p>
              <p style={{margin: "4px 0"}}>📽️ <strong>Projectors:</strong> {room.projectors} | 📺 <strong>TV Monitor:</strong> {room.tvMonitor}</p>
              <p style={{margin: "4px 0"}}>🎤 <strong>Mics:</strong> Wireless ({room.wirelessMics}) | Wired ({room.wiredMics})</p>
              <p style={{margin: "4px 0"}}>🔊 <strong>Speakers:</strong> {room.speakers}</p>
              <p style={{margin: "4px 0"}}>💻 <strong>Devices (Laptops):</strong> {room.devices}</p>
              <p style={{margin: "4px 0"}}>🌐 <strong>Internet:</strong> {room.internet}</p>
              <p style={{margin: "4px 0", background: "#f8f9fa", padding: "5px", borderRadius: "5px"}}>
                🛠️ <strong>Add. IT Facilities:</strong> <br/>{room.additionalIT}
              </p>
            </div>
          </div>
        ))}
      </div>
      
    </div>
  );
}

export default AuditoriumDetails;