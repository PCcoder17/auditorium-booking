import "./Dashboard.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "./firebase";
import { collection, addDoc, query, where, onSnapshot } from "firebase/firestore";
import emailjs from "@emailjs/browser"; 
import { ToastContainer, toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";


const auditoriums = ["Audi B Block (Ground Floor)","Audi C block UID (Av Room)","Audi SoHT",  "Moot Court Hall D block","Amphitheater", "Staff Refractory, B Block","Student Refractory, B Block","Staff Refractory, D Block","UID Courtyard, C Block"];
const slots = ["09:10 - 10:00", "10:00 - 10:50", "10:50 - 11:40", "11:40 - 12:30", "12:30 - 01:20", "01:20 - 02:10", "02:10 - 03:00", "03:00 - 03:50", "03:50 - 04:30"];
const countryCodes = ["+91", "+1", "+44", "+971", "+61"];

function Dashboard({ user }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedAuditorium, setSelectedAuditorium] = useState(auditoriums[0]);
  const [date, setDate] = useState("");
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [existingBookings, setExistingBookings] = useState([]);
  const [countryCode, setCountryCode] = useState("+91");
 const [details, setDetails] = useState({
  name: "",
  email: "",
  phone: "",
  purpose: "",
  eventName: "",
  host: "",
  capacity: 1,
});


  useEffect(() => {
    if (user) setDetails(prev => ({ ...prev, name: user.displayName || "Faculty", email: user.email || "" }));
  }, [user]);

  useEffect(() => {
    if (!date) return;
    const q = query(collection(db, "bookings"), where("date", "==", date), where("auditorium", "==", selectedAuditorium));
    const unsub = onSnapshot(q, (snapshot) => setExistingBookings(snapshot.docs.map(doc => doc.data())));
    return () => unsub();
  }, [date, selectedAuditorium]);

  // Check if time has passed
  const isSlotPast = (slotString) => {
    const today = new Date().toISOString().split("T")[0];
    if (date !== today) return false; 

    const now = new Date();
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();

    const startTimePart = slotString.split(" - ")[0]; 
    let [slotHour, slotMin] = startTimePart.split(":").map(Number);

    if (slotHour < 9) slotHour += 12; 

    if (currentHour > slotHour) return true;
    if (currentHour === slotHour && currentMin > slotMin) return true;
    
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
    if (!details.phone || !details.eventName || details.phone.length !== 10) return toast.warning("⚠️ Enter valid details!");
    setStep(2);
  };

  const submitBooking = async () => {
    if (selectedSlots.length === 0) return toast.warning("Select slot!");
    try {
      await addDoc(collection(db, "bookings"), {
        ...details, fullPhone: `${countryCode} ${details.phone}`, email: user.email,
        auditorium: selectedAuditorium, date, slots: selectedSlots, status: "PENDING", createdAt: new Date(), type: "Auditorium"
      });
      
      toast.success("✅ Auditorium Request Saved!");

      const templateParams = { to_name: details.name, to_email: details.email, event_name: details.eventName, date, status: "PENDING", message: "Auditorium Request Sent." };
      emailjs.send('service_pu8v9ik', 'template_fsvewmn', templateParams, 'brwklSK_C1VLSMlQD')
        .then(() => { toast.success("📧 Mail Sent!"); setTimeout(() => navigate("/my-bookings"), 2000); })
        .catch(() => { toast.error("❌ Mail Failed!"); setTimeout(() => navigate("/my-bookings"), 3000); });
      
    } catch (error) {
      toast.error("❌ Error submitting");
    }
  };

  return (
    <>
      {/* ✅ LOGO ADDED HERE (As requested) */}
      <img src="/image.png" alt="Logo" style={{position:"absolute", top:"5px", left:"20px", width:"180px", zIndex:1000, background:"#1e3c72", padding:"8px", borderRadius:"5px", boxShadow:"0 2px 5px rgba(0,0,0,0.2)"}} />
      
      <ToastContainer position="bottom-right" theme="colored" />
      
      <header className="topbar" style={{paddingLeft: "250px", height: "70px", display:"flex", alignItems:"center"}}>
        <h2>🏟️ Auditorium Booking</h2>
        <button onClick={() => navigate("/home")} className="back-btn" style={{background:"transparent", border:"1px solid white", color:"white"}}>⬅ Back Home</button>
      </header>

      {step === 1 && (
        <div className="details-card">
          <h3>Step 1: Event Details</h3>
          <div className="input-group">
            <label>Phone (10 Digits)</label>
            <div className="phone-input-container">
              <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)} className="country-select">{countryCodes.map(c => <option key={c}>{c}</option>)}</select>
              <input value={details.phone} onChange={handlePhoneChange} placeholder="9876543210" />
            </div>
          </div>
          <div className="input-group"><label>Event Name</label><input value={details.eventName} onChange={(e) => setDetails({ ...details, eventName: e.target.value })} /></div>
          <div className="input-group"><label>Purpose</label><input value={details.purpose} onChange={(e) => setDetails({ ...details, purpose: e.target.value })} /></div>
          <div className="input-group"><label>Host</label><input value={details.host} onChange={(e) => setDetails({ ...details, host: e.target.value })} /></div>
          <button className="submit" style={{width:"100%"}} onClick={handleNextStep}>Next ➡️</button>
        </div>
      )}

      {step === 2 && (
        <div className="dashboard">
          <aside>{auditoriums.map(a => <div key={a} onClick={() => setSelectedAuditorium(a)} className={selectedAuditorium === a ? "active" : ""}>{a}</div>)}</aside>
          <main>
             <h3>{selectedAuditorium}</h3>
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
             {selectedSlots.length > 0 && <button className="submit" onClick={submitBooking}>Confirm</button>}
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
export default Dashboard;