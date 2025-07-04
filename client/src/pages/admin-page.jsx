"use client";

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import "../css/admin-page.css";

export default function AdminPage() {
  const [students, setStudents] = useState([]);
  const [schools, setSchools] = useState([{ id: "all", name: "All Schools" }]);
  const [selectedSchool, setSelectedSchool] = useState("all");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const API_BASE = import.meta.env.VITE_API_BASE;

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get(`${API_BASE}/api/v1/students`, {
          withCredentials: true,
        });
        const studentData = response.data.data;
        console.log(studentData);

        setStudents(studentData);

        // Extract unique schools from student data
        const uniqueSchools = Array.from(
          new Set(studentData.map((student) => student.school))
        ).map((schoolName) => ({
          id: schoolName.toLowerCase().replace(/\s+/g, "-"),
          name: schoolName,
        }));

        setSchools([{ id: "all", name: "All Schools" }, ...uniqueSchools]);
      } catch (error) {
        console.error("Failed to fetch students:", error);
      }
    };

    fetchStudents();
  }, []);

  const filteredStudents =
    selectedSchool === "all"
      ? students
      : students.filter(
          (student) =>
            student.school ===
            schools.find((s) => s.id === selectedSchool)?.name
        );

  const handleFileUpload = (file) => {
    const isExcel =
      file.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.type === "application/vnd.ms-excel";
    if (isExcel) {
      setUploadedFile(file);
      console.log("File uploaded:", file.name);
    } else {
      alert("Please upload an Excel file (.xlsx or .xls)");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleUploadOnline = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE}/api/v1/sync`
      );
      alert(response.data.message);
    } catch (err) {
      console.error(err);
      alert("Sync failed. Make sure you're connected to the internet.");
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmitAssessment = () => {
    if (uploadedFile) {
      alert(
        `Assessment questions from ${uploadedFile.name} have been uploaded successfully!`
      );
      setUploadedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const title =
      selectedSchool === "all"
        ? "All Students"
        : `Students of ${schools.find((s) => s.id === selectedSchool)?.name}`;

    doc.text(title, 14, 15);

    const tableData = filteredStudents.map((student) => [
      student.id,
      student.name,
      student.email,
      student.school,
      student.grade,
      student.enrollmentDate,
    ]);

    doc.autoTable({
      head: [["ID", "Name", "Email", "School", "Grade", "Enrollment Date"]],
      body: tableData,
      startY: 20,
    });

    doc.save(`${title.replace(/\s+/g, "_").toLowerCase()}_records.pdf`);
  };

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1>Admin Dashboard</h1>
        <div className="admin-nav">
          <span className="admin-user">Welcome, Administrator</span>
        </div>
      </header>

      <main className="admin-main">
        {/* Student Management Section */}
        <section className="admin-section">
          <div className="section-header">
            <h2>Student Management</h2>
            <div className="filter-controls">
              <label htmlFor="school-filter">Filter by School:</label>
              <select
                id="school-filter"
                value={selectedSchool}
                onChange={(e) => setSelectedSchool(e.target.value)}
                className="school-select"
              >
                {schools.map((school) => (
                  <option key={school.id} value={school.id}>
                    {school.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="table-container">
            <table className="students-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>School</th>
                  <th>Grade</th>
                  <th>Enrollment Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id}>
                    <td>{student.id}</td>
                    <td>{student.name}</td>
                    <td>{student.email}</td>
                    <td>{student.school}</td>
                    <td>{student.grade}</td>
                    <td>{student.enrollmentDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="table-info">
            <p>Showing {filteredStudents.length} students</p>
            <div>
              <button className="download-btn" onClick={handleDownloadPDF}>
                Download as PDF
              </button>
              <button onClick={handleUploadOnline} className="sync-btn">
                Upload Online
              </button>
            </div>
          </div>
        </section>

        {/* Assessment Upload Section */}
        <section className="admin-section">
          <div className="section-header">
            <h2>Upload Assessment Questions</h2>
          </div>

          <div className="upload-container">
            <div
              className={`upload-area ${isDragOver ? "drag-over" : ""}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleUploadClick}
            >
              <div className="upload-content">
                <div className="upload-icon">📁</div>
                <h3>Upload Excel File</h3>
                <p>Drag and drop your Excel file here, or click to browse</p>
                <p className="file-types">Supported formats: .xlsx, .xls</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileInputChange}
                className="file-input"
              />
            </div>

            {uploadedFile && (
              <div className="file-preview">
                <div className="file-info">
                  <span className="file-name">📄 {uploadedFile.name}</span>
                  <span className="file-size">
                    ({(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
                <button className="submit-btn" onClick={handleSubmitAssessment}>
                  Upload Assessment Questions
                </button>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
