import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import { collection, onSnapshot } from "firebase/firestore";
import "./Dashboard.css"; 

const auditoriumSlots = ["09:10 - 10:00", "10:00 - 10:50", "10:50 - 11:40", "11:40 - 12:30", "12:30 - 01:20", "01:20 - 02:10", "02:10 - 03:00", "03:00 - 03:50", "03:50 - 04:30"];
const meetingSlots = ["09:00 - 10:00", "10:00 - 11:00", "11:00 - 12:00", "12:00 - 01:00","1:00-2:00", "02:00 - 03:00", "03:00 - 04:00"];
const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function TimetableView() {
  const [bookings, setBookings] = useState([]);
  const [selectedResource, setSelectedResource] = useState("Auditorium 1"); 
  const [currentDate, setCurrentDate] = useState(new Date()); 
  const [selectedCellData, setSelectedCellData] = useState(null); 

  const isAuditorium = selectedResource.includes("Auditorium");
  const currentSlots = isAuditorium ? auditoriumSlots : meetingSlots;

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "bookings"), (snap) => {
      setBookings(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const getStartOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); 
    return new Date(d.setDate(diff));
  };
  const startOfWeek = getStartOfWeek(currentDate);
  const weekDays = Array.from({length: 6}, (_, i) => {
      let d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      return { name: daysOfWeek[i], dateStr: d.toISOString().split('T')[0], display: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) };
  });

  const getBookingForCell = (dateStr, slot) => bookings.find(b => b.date === dateStr && b.auditorium === selectedResource && b.slots.includes(slot) && b.status !== "REJECTED");

  return (
    <div className="timetable-container" style={{padding:"20px", borderRadius:"10px", background: "transparent"}}>
      
      {/* HEADER */}
      <div className="timetable-header" style={{display:"flex", justifyContent:"space-between", marginBottom:"20px", flexWrap:"wrap", gap:"10px", alignItems:"center"}}>
        <select 
          value={selectedResource} 
          onChange={(e) => { setSelectedResource(e.target.value); setSelectedCellData(null); }} 
          style={{
            padding:"10px", 
            fontSize:"16px", 
            borderRadius:"5px", 
            minWidth: "200px", 
            background: "rgba(0,0,0,0.6)", /* Dark Input */
            color:"white", 
            border:"1px solid rgba(255,255,255,0.3)"
          }}
        >
          {["Block A Audi 1", "Block B Audi 1", "Block C  Audi 1", "Block C UID Atrium", "Ampitheatre  ", "Block A Staff Refractory  ","Block B Staff Refractory","Block A Student Refractory  ","Block B Student Refractory", "Conference Room 1", "Conference Room 2", "Board Room", "Meeting Room A"].map(r => <option key={r} style={{background:"#333", color:"white"}}>{r}</option>)}
        </select>

        <div>
          <button onClick={() => { const d = new Date(currentDate); d.setDate(d.getDate() - 7); setCurrentDate(d); }} className="nav-btn">◀ Prev</button>
          <span style={{fontWeight:"bold", margin:"0 15px", color:"white"}}>{weekDays[0].display} - {weekDays[5].display}</span>
          <button onClick={() => { const d = new Date(currentDate); d.setDate(d.getDate() + 7); setCurrentDate(d); }} className="nav-btn">Next ▶</button>
        </div>
      </div>

      {/* GRID */}
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%", borderCollapse:"collapse", minWidth:"1000px"}}>
          <thead>
            {/* Dark Header */}
            <tr style={{background:"rgba(0,0,0,0.8)", color:"white"}}>
              <th style={{padding:"12px", border:"1px solid rgba(255,255,255,0.1)"}}>Day / Time</th>
              {currentSlots.map(s => <th key={s} style={{padding:"10px", border:"1px solid rgba(255,255,255,0.1)", fontSize:"13px"}}>{s}</th>)}
            </tr>
          </thead>
          <tbody>
            {weekDays.map((day) => (
              <tr key={day.dateStr}>
                {/* ✅ FIX 1: LEFT COLUMN TEXT VISIBILITY (White Text, Dark BG) */}
                <td style={{
                    background:"rgba(255,255,255,0.05)", 
                    color:"white", 
                    padding:"10px", 
                    border:"1px solid rgba(255,255,255,0.1)", 
                    fontWeight:"bold", 
                    textAlign:"center", 
                    minWidth:"100px"
                }}>
                  {day.name}<br/>
                  <span style={{fontSize:"12px", opacity:0.8, color: "#ddd"}}>{day.display}</span>
                </td>

                {/* SLOTS */}
                {currentSlots.map((slot) => {
                  const booking = getBookingForCell(day.dateStr, slot);
                  let bg = "rgba(255,255,255,0.02)"; // Very subtle transparent bg
                  let label = "";
                  let textColor = "white";
                  
                  if (booking) {
                      bg = booking.status === "APPROVED" ? "#e74c3c" : "#f1c40f"; 
                      label = booking.status;
                      textColor = booking.status === "PENDING" ? "black" : "white"; // Pending yellow pe black text
                  }
                  
                  return (
                    <td key={slot} 
                        style={{
                            background: bg, 
                            border:"1px solid rgba(255,255,255,0.1)", 
                            cursor:"pointer", 
                            height:"60px", 
                            minWidth:"100px", 
                            textAlign:"center", 
                            fontSize:"12px", 
                            color: textColor, 
                            fontWeight:"bold"
                        }} 
                        onClick={() => setSelectedCellData(booking || { status: "AVAILABLE", date: day.dateStr, slot })}>
                        {label}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ✅ FIX 2: DETAILS BOX - DARK GLASS THEME (No more White Box) */}
      {selectedCellData && (
        <div style={{
            marginTop:"25px", 
            padding:"25px", 
            background: "rgba(0, 0, 0, 0.6)", /* Dark Semi-Transparent */
            backdropFilter: "blur(10px)",
            borderRadius:"12px", 
            color: "white", /* White Text */
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderLeft: `6px solid ${selectedCellData.status === "APPROVED" ? "#e74c3c" : selectedCellData.status === "PENDING" ? "#f1c40f" : "#2ecc71"}`,
            boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.3)"
        }}>
          <h3 style={{margin:"0 0 15px 0", color: "#fff", textShadow:"0 0 5px rgba(255,255,255,0.3)"}}>
             {selectedCellData.status === "AVAILABLE" ? "🟢 Slot Available" : "📌 Booking Details"}
          </h3>
          
          {selectedCellData.status !== "AVAILABLE" ? (
             <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))", gap:"15px", fontSize: "14px"}}>
               <div><strong style={{color:"#81ecec"}}>Event:</strong> {selectedCellData.eventName}</div>
               <div><strong style={{color:"#81ecec"}}>By:</strong> {selectedCellData.name}</div>
               <div><strong style={{color:"#81ecec"}}>Capacity Req:</strong> {selectedCellData.capacity || "N/A"}</div>
               <div><strong style={{color:"#81ecec"}}>Phone:</strong> {selectedCellData.fullPhone}</div>
               <div style={{wordBreak: "break-all"}}><strong style={{color:"#81ecec"}}>Email:</strong> {selectedCellData.email}</div>
               <div><strong style={{color:"#81ecec"}}>Date:</strong> {selectedCellData.date}</div>
               <div><strong style={{color:"#81ecec"}}>Status:</strong> <span style={{fontWeight:"bold", color: selectedCellData.status==="APPROVED"?"#ff7675":"#ffeaa7"}}>{selectedCellData.status}</span></div>
             </div>
          ) : (
             <p style={{color: "#dfe6e9", fontSize: "16px"}}>
                This slot is free for <strong style={{color:"#74b9ff"}}>{selectedResource}</strong> on {selectedCellData.date} at {selectedCellData.slot}.
             </p>
          )}
        </div>
      )}
    </div>
  );
}