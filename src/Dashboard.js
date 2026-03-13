import "./Dashboard.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "./firebase";
import { collection, addDoc, query, where, onSnapshot } from "firebase/firestore";
import emailjs from "@emailjs/browser"; 
import { ToastContainer, toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";

const auditoriums = [
  "Audi, B Block, Ground Floor", "Audi C block UID (Av Room)", "Audi SoHT",
  "Moot Court Hall D block", "Ampitheatre", "Staff Refractory, B Block",
  "Student Refractory, B Block", "Staff Refractory, D Block", "UID Courtyard, C Block"
];

const slots = ["09:10 AM - 10:00 AM", "10:00 AM - 10:50 AM", "10:50 AM - 11:40 AM", "11:40 AM - 12:30 PM", "12:30 PM - 01:20 PM", "01:20 PM - 02:10 PM", "02:10 PM - 03:00 PM", "03:00 PM - 03:50 PM", "03:50 PM - 04:30 PM"];
const countryCodes = ["+91", "+1", "+44", "+971", "+61"];

function Dashboard({ user }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedAuditorium, setSelectedAuditorium] = useState(auditoriums[0]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [existingBookings, setExistingBookings] = useState([]);
  const [countryCode, setCountryCode] = useState("+91");
  const [details, setDetails] = useState({ name: "", email: "", phone: "", purpose: "", eventName: "", host: "", capacity: 1 });

  const getTodayIST = () => {
    const now = new Date();
    const istDate = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
    return istDate.toISOString().split('T')[0];
  };
  const todayIST = getTodayIST();

  useEffect(() => {
    if (user) setDetails(prev => ({ ...prev, name: user.displayName || "Faculty", email: user.email || "" }));
  }, [user]);

  useEffect(() => {
    if (!startDate) return;
    const q = query(collection(db, "bookings"), where("date", "==", startDate), where("auditorium", "==", selectedAuditorium));
    const unsub = onSnapshot(q, (snapshot) => setExistingBookings(snapshot.docs.map(doc => doc.data())));
    return () => unsub();
  }, [startDate, selectedAuditorium]);

  const isSlotPast = (slotString) => {
    if (!startDate || startDate < todayIST) return true;
    if (startDate > todayIST) return false;
    const now = new Date();
    const istNow = new Date(now.getTime() + (now.getTimezoneOffset() * 60000) + (5.5 * 60 * 60 * 1000));
    const startTime = slotString.split(" - ")[0]; 
    let [time, modifier] = startTime.split(" ");
    let [h, m] = time.split(":").map(Number);
    if (modifier === "PM" && h < 12) h += 12;
    if (modifier === "AM" && h === 12) h = 0;
    return (h * 60 + m) < (istNow.getHours() * 60 + istNow.getMinutes());
  };

  const getSlotStatus = (slotTime) => {
    if (isSlotPast(slotTime)) return { status: "PASSED" };
    if (existingBookings.find(b => b.slots.includes(slotTime) && b.status === "APPROVED")) return { status: "BOOKED" };
    if (existingBookings.find(b => b.slots.includes(slotTime) && b.status === "PENDING")) return { status: "PENDING" };
    return { status: "AVAILABLE" };
  };

  const handleNextStep = () => {
    const { phone, eventName, purpose, host } = details;
    if (!phone || phone.length !== 10 || !eventName || !purpose || !host) {
      return toast.warning("⚠️ Fill all details! ");
    }
    setStep(2);
  };

  const submitBooking = async () => {
    if (selectedSlots.length === 0 || !startDate || !endDate) return toast.warning("⚠️ Select slots and date range!");
    let dates = [];
    let curr = new Date(startDate);
    let last = new Date(endDate);
    while(curr <= last) {
      dates.push(new Date(curr).toISOString().split('T')[0]);
      curr.setDate(curr.getDate() + 1);
    }
    try {
      for (const d of dates) {
        await addDoc(collection(db, "bookings"), {
          ...details, fullPhone: `${countryCode} ${details.phone}`, email: user.email,
          auditorium: selectedAuditorium, date: d, slots: selectedSlots, status: "PENDING", createdAt: new Date(), type: "Auditorium"
        });
      }
      toast.success(`✅ Saved for ${dates.length} days!`);
      setTimeout(() => navigate("/my-bookings"), 2000);
    } catch (e) { toast.error("❌ Error!"); }
  };

  return (
    <>
      <img src="/image.png" alt="Logo" style={{position:"absolute", top:"5px", left:"20px", width:"180px", zIndex:1000, background:"#1e3c72", padding:"8px", borderRadius:"5px"}} />
      <ToastContainer position="bottom-right" theme="colored" />
      <header className="topbar" style={{paddingLeft: "250px", height: "70px", display:"flex", alignItems:"center"}}>
        <h2>🏟️ Auditorium Booking</h2>
        <button onClick={() => navigate("/home")} className="back-btn" style={{background:"transparent", border:"1px solid white", color:"white"}}>⬅ Back Home</button>
      </header>

      {step === 1 ? (
        <div className="details-card">
          <h3>Step 1: Event Details</h3>
          <div className="input-group">
            <label>Phone (10 Digits) *</label>
            <div className="phone-input-container">
              <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)} className="country-select">{countryCodes.map(c => <option key={c}>{c}</option>)}</select>
              <input value={details.phone} onChange={(e)=>setDetails({...details, phone:e.target.value.replace(/\D/g,"")})} placeholder="9876543210" maxLength={10} />
            </div>
          </div>
          <div className="input-group"><label>Event Name *</label><input value={details.eventName} onChange={(e) => setDetails({ ...details, eventName: e.target.value })} /></div>
          <div className="input-group"><label>Purpose *</label><input value={details.purpose} onChange={(e) => setDetails({ ...details, purpose: e.target.value })} /></div>
          <div className="input-group"><label>Host *</label><input value={details.host} onChange={(e) => setDetails({ ...details, host: e.target.value })} /></div>
          <button className="submit" style={{width:"100%"}} onClick={handleNextStep}>Next ➡️</button>
        </div>
      ) : (
        <div className="dashboard">
          <aside>{auditoriums.map(a => <div key={a} onClick={() => setSelectedAuditorium(a)} className={selectedAuditorium === a ? "active" : ""}>{a}</div>)}</aside>
          <main>
             <h3>{selectedAuditorium}</h3>
             <div style={{display:"flex", gap:"10px", marginBottom:"20px"}}>
                <div style={{flex:1}}><label>From:</label><input type="date" min={todayIST} onChange={(e)=>setStartDate(e.target.value)} className="date-picker"/></div>
                <div style={{flex:1}}><label>To:</label><input type="date" min={startDate || todayIST} onChange={(e)=>setEndDate(e.target.value)} className="date-picker"/></div>
             </div>
             {startDate && (
               <div className="slots">
                 {slots.map(s => {
                   const { status } = getSlotStatus(s);
                   return <button key={s} onClick={() => status === "AVAILABLE" && setSelectedSlots(prev => prev.includes(s) ? prev.filter(x=>x!==s) : [...prev, s])} className={`slot ${status !== 'AVAILABLE' ? 'booked-slot' : selectedSlots.includes(s) ? 'selected' : ''}`} disabled={status !== 'AVAILABLE'}>{s} <br/><small>{status === 'AVAILABLE' ? '' : status}</small></button>
                 })}
               </div>
             )}
             {selectedSlots.length > 0 && <button className="submit" onClick={submitBooking}>Confirm Booking</button>}
             <div className="legend" style={{marginTop:"30px", borderTop:"1px solid #333", paddingTop:"15px"}}>
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