import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import * as XLSX from "xlsx"; // Excel Export ke liye
import "./Admin.css";

export default function DataPage() {
  const [bookings, setBookings] = useState([]);
  const [filters, setFilters] = useState({ type: "All", resource: "All", status: "All", date: "" });

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "bookings"), (snap) => {
      setBookings(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  // Filter Logic
  const filteredData = bookings.filter((b) => {
    return (
      (filters.type === "All" || b.type === filters.type) &&
      (filters.resource === "All" || b.auditorium === filters.resource) &&
      (filters.status === "All" || b.status === filters.status) &&
      (filters.date === "" || b.date === filters.date)
    );
  });

  // Export to Excel
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Bookings");
    XLSX.writeFile(wb, "Booking_Records.xlsx");
  };

  // Delete Record
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      await deleteDoc(doc(db, "bookings", id));
    }
  };

  return (
    <div className="data-container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 className="section-title" style={{ margin: 0, border: "none" }}>📊 Booking Records</h2>
        <button onClick={exportToExcel} className="export-btn">📥 Export Excel</button>
      </div>

      {/* ✅ FILTERS AB HORIZONTAL HAIN */}
      <div className="filters-container">
        
        <div className="filter-group">
          <label>Resource Type:</label>
          <select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
            <option value="All">All Types</option>
            <option value="Auditorium">Auditorium</option>
            <option value="Meeting Room">Meeting Room</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Resource Name:</label>
          <select value={filters.resource} onChange={(e) => setFilters({ ...filters, resource: e.target.value })}>
            <option value="All">All Resources</option>
            <option>Block A Audi 1</option>
            <option>Block B Audi 1</option>
                 <option> Block C  Audi 1</option>   
                 <option>Block C UID Atrium</option>
                 <option>Ampitheatre</option>
                 <option>Block A Staff Refractory</option>
                 <option>Block B Staff Refractory</option>
                 <option>Block A Student Refractory</option>
                 <option>Block B Student Refractory</option>

            <option>Conference Room 1</option>
            <option>Conference Room 2</option>
            <option>Board Room</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Status:</label>
          <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
            <option value="All">All Status</option>
            <option value="PENDING">PENDING</option>
            <option value="APPROVED">APPROVED</option>
            <option value="REJECTED">REJECTED</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Date:</label>
          <input type="date" value={filters.date} onChange={(e) => setFilters({ ...filters, date: e.target.value })} />
        </div>

        <button className="reset-btn" onClick={() => setFilters({ type: "All", resource: "All", status: "All", date: "" })}>
          Reset
        </button>

      </div>

      {/* TABLE */}
      <table className="styled-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Name</th>
            <th>Event Details</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.length === 0 ? (
            <tr><td colSpan="6" style={{textAlign:"center", padding:"20px"}}>No records found</td></tr>
          ) : (
            filteredData.map((b) => (
              <tr key={b.id}>
                <td>{b.date}</td>
                <td><span style={{ padding: "4px 8px", borderRadius: "4px", background: b.type === "Auditorium" ? "#3498db" : "#9b59b6", color: "white", fontSize: "12px" }}>{b.type}</span></td>
                <td>{b.auditorium}</td>
                <td>
                   <strong>{b.eventName}</strong><br/>
                   <span style={{fontSize:"12px", opacity:0.7}}>By: {b.name}</span>
                </td>
                <td>
                  <span style={{
                    padding: "5px 10px", borderRadius: "5px", fontWeight: "bold", fontSize: "12px",
                    background: b.status === "APPROVED" ? "#2ecc71" : b.status === "REJECTED" ? "#e74c3c" : "#f1c40f",
                    color: b.status === "PENDING" ? "black" : "white"
                  }}>
                    {b.status}
                  </span>
                </td>
                <td>
                  <button onClick={() => handleDelete(b.id)} style={{background:"#c0392b", color:"white", border:"none", padding:"5px 10px", borderRadius:"4px", cursor:"pointer"}}>Delete</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}