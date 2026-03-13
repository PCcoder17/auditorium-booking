import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import { useNavigate } from "react-router-dom";
import { auth, db } from "./firebase";
import { collection, addDoc, query, where, onSnapshot } from "firebase/firestore";
import emailjs from "@emailjs/browser"; 
import { ToastContainer, toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";

const meetingRooms = ["Conference Room 1", "Conference Room 2", "Board Room", "Meeting Room A"];
const slots = ["09:00 - 10:00", "10:00 - 11:00", "11:00 - 12:00", "12:00 - 01:00", "02:00 - 03:00", "03:00 - 04:00"];
const countryCodes = ["+91", "+1", "+44", "+971", "+61"];

function MeetingBooking({ user }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedRoom, setSelectedRoom] = useState(meetingRooms[0]);
  const [date, setDate] = useState("");
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [existingBookings, setExistingBookings] = useState([]);
  const [countryCode, setCountryCode] = useState("+91");
  const [details, setDetails] = useState({ name: "", email: "", phone: "", purpose: "", eventName: "", host: "", capacity: "" });

  useEffect(() => {
    if (user) setDetails(prev => ({ ...prev, name: user.displayName || "Faculty", email: user.email || "" }));
  }, [user]);

  useEffect(() => {
    if (!date) return;
    const q = query(collection(db, "bookings"), where("date", "==", date), where("auditorium", "==", selectedRoom));
    const unsub = onSnapshot(q, (snapshot) => setExistingBookings(snapshot.docs.map(doc => doc.data())));
    return () => unsub();
  }, [date, selectedRoom]);

  const isSlotPast = (slotString) => {
    const today = new Date().toISOString().split("T")[0];
    if (date !== today) return false;
    const now = new Date();
    const currentHour = now.getHours();
    let startHour = parseInt(slotString.split(":")[0]);
    if (startHour < 9) startHour += 12;
    if (currentHour >= startHour) return true;
    return false;
  };

  const getSlotStatus = (slotTime) => {
    if (isSlotPast(slotTime)) return { status: "BOOKED", name: "Time Passed" };
    const approved = existingBookings.find(b => b.slots.includes(slotTime) && b.status === "APPROVED");
    if (approved) return { status: "BOOKED", name: approved.name };
    const pending = existingBookings.find(b => b.slots.includes(slotTime) && b.status === "PENDING");
    if (pending) return { status: "PENDING", name: pending.name };
    return { status: "AVAILABLE", name: "" };
  };

  const toggleSlot = (slot) => {
    if (getSlotStatus(slot).status === "BOOKED") return; 
    setSelectedSlots(prev => prev.includes(slot) ? prev.filter(s => s !== slot) : [...prev, slot]);
  };

  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/\D/g, "");
    if (val.length <= 10) setDetails({ ...details, phone: val });
  };

  const handleNextStep = () => {
    if (!details.phone || !details.eventName || !details.capacity || details.phone.length !== 10) return toast.warning("⚠️ Enter details & 10-digit Phone!");
    setStep(2);
  };

  const submitBooking = async () => {
    if (selectedSlots.length === 0) return toast.warning("Select slot!");
    try {
      await addDoc(collection(db, "bookings"), {
        ...details, fullPhone: `${countryCode} ${details.phone}`, email: user.email,
        auditorium: selectedRoom, date, slots: selectedSlots, status: "PENDING", createdAt: new Date(), type: "Meeting Room"
      });
      toast.success("✅ Request Saved!");

      const templateParams = { to_name: details.name, to_email: details.email, event_name: details.eventName, date, status: "PENDING", message: `Request for ${selectedRoom} sent.` };

      emailjs.send('service_pu8v9ik', 'template_fsvewmn', templateParams, 'brwklSK_C1VLSMlQD')
        .then(() => { toast.success("📧 Mail Sent!"); setTimeout(() => navigate("/my-bookings"), 2000); })
        .catch(() => { toast.error("❌ Mail Failed!"); setTimeout(() => navigate("/my-bookings"), 3000); });

    } catch (error) {
      toast.error("❌ Database Error!");
    }
  };

  return (
    <>
      <ToastContainer position="bottom-right" theme="colored" />
      
      {/* Logo */}
      <img src="/image.png" alt="Logo" style={{position:"absolute", top:"5px", left:"20px", width:"180px", zIndex:1000, background:"#1e3c72", padding:"8px", borderRadius:"5px", boxShadow:"0 2px 5px rgba(0,0,0,0.2)"}} />

      {/* ✅ HEADER FIXED: Changed background from #2c3e50 to #1e3c72 */}
      <header className="topbar" style={{
          background:"#1e3c72", /* 🔵 BLUE COLOR FIX */
          paddingLeft: "250px", 
          height: "80px", /* Height thodi badha di match karne ke liye */
          display:"flex", 
          alignItems:"center",
          boxShadow: "0 4px 10px rgba(0,0,0,0.3)"
      }}> 
        <h2 style={{color: "white", margin: 0}}>🤝 Meeting Room Booking</h2>
        <button onClick={() => navigate("/home")} className="back-btn" style={{background:"transparent", border:"1px solid white", color:"white", marginLeft:"auto", marginRight:"20px"}}>⬅ Back Home</button>
      </header>

      {/* STEP 1: DETAILS */}
      {step === 1 && (
        <div className="details-card">
          <h3>Step 1: Meeting Details</h3>
          <div className="input-group">
            <label>Phone (10 Digits)</label>
            <div className="phone-input-container">
              <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)} className="country-select">{countryCodes.map(c => <option key={c}>{c}</option>)}</select>
              <input value={details.phone} onChange={handlePhoneChange} placeholder="9876543210" />
            </div>
          </div>
          <div className="input-group"><label>Meeting Name</label><input value={details.eventName} onChange={(e) => setDetails({ ...details, eventName: e.target.value })} /></div>
          
          <div className="input-group">
            <label>Approx. Capacity Required</label>
            <input type="number" placeholder="Ex: 20" value={details.capacity} onChange={(e) => setDetails({ ...details, capacity: e.target.value })} />
          </div>

          <div className="input-group"><label>Purpose</label><input value={details.purpose} onChange={(e) => setDetails({ ...details, purpose: e.target.value })} /></div>
          <div className="input-group"><label>Host</label><input value={details.host} onChange={(e) => setDetails({ ...details, host: e.target.value })} /></div>
          <button className="submit" style={{width:"100%", background:"#1e3c72"}} onClick={handleNextStep}>Next ➡️</button>
        </div>
      )}

      {/* STEP 2: SLOT BOOKING */}
      {step === 2 && (
        <div className="dashboard">
          <aside>{meetingRooms.map(r => <div key={r} onClick={() => setSelectedRoom(r)} className={selectedRoom === r ? "active" : ""}>{r}</div>)}</aside>
          <main>
             <h3>{selectedRoom}</h3>
             <input type="date" min={new Date().toISOString().split("T")[0]} onChange={(e) => setDate(e.target.value)} className="date-picker" />
             {date && (
               <div className="slots">
                 {slots.map(s => {
                   const { status, name } = getSlotStatus(s);
                   let btnClass = "slot";
                   if (name === "Time Passed") btnClass += " booked-slot"; 
                   else if (status === "BOOKED") btnClass += " booked-slot";
                   else if (selectedSlots.includes(s)) btnClass += " selected";
                   else if (status === "PENDING") btnClass += " pending-slot";
                   return <button key={s} onClick={() => toggleSlot(s)} className={btnClass} disabled={status === "BOOKED"}>{s} <span className="slot-badge">{status === 'AVAILABLE' ? '' : name === "Time Passed" ? "Passed" : status}</span></button>
                 })}
               </div>
             )}
             {selectedSlots.length > 0 && <button className="submit" style={{background:"#1e3c72"}} onClick={submitBooking}>Confirm Meeting</button>}
             
             {/* Legend */}
             <div className="legend">
               <div className="legend-item"><div className="dot available"></div> Available</div>
               <div className="legend-item"><div className="dot selected"></div> Selected</div>
               <div className="legend-item"><div className="dot pending"></div> Pending</div>
               <div className="legend-item"><div className="dot booked"></div> Booked/Passed</div>
             </div>
          </main>
        </div>
      )}
    </>
  );
}
export default MeetingBooking;