"use client"

import { useState, useRef } from "react"
import "../css/admin-page.css"

export default function AdminPage() {
  // Mock data
  const schools = [
    { id: "all", name: "All Schools" },
    { id: "lincoln-high", name: "Lincoln High School" },
    { id: "washington-middle", name: "Washington Middle School" },
    { id: "jefferson-elementary", name: "Jefferson Elementary" },
    { id: "roosevelt-academy", name: "Roosevelt Academy" },
  ]

  const allStudents = [
    {
      id: 1,
      name: "Alice Johnson",
      email: "alice.johnson@email.com",
      school: "Lincoln High School",
      grade: "10th",
      enrollmentDate: "2023-09-01",
    },
    {
      id: 2,
      name: "Bob Smith",
      email: "bob.smith@email.com",
      school: "Washington Middle School",
      grade: "8th",
      enrollmentDate: "2023-09-15",
    },
    {
      id: 3,
      name: "Carol Davis",
      email: "carol.davis@email.com",
      school: "Lincoln High School",
      grade: "11th",
      enrollmentDate: "2023-08-20",
    },
    {
      id: 4,
      name: "David Wilson",
      email: "david.wilson@email.com",
      school: "Jefferson Elementary",
      grade: "5th",
      enrollmentDate: "2023-09-05",
    },
    {
      id: 5,
      name: "Emma Brown",
      email: "emma.brown@email.com",
      school: "Roosevelt Academy",
      grade: "9th",
      enrollmentDate: "2023-09-10",
    },
    {
      id: 6,
      name: "Frank Miller",
      email: "frank.miller@email.com",
      school: "Washington Middle School",
      grade: "7th",
      enrollmentDate: "2023-09-12",
    },
    {
      id: 7,
      name: "Grace Lee",
      email: "grace.lee@email.com",
      school: "Lincoln High School",
      grade: "12th",
      enrollmentDate: "2023-08-25",
    },
    {
      id: 8,
      name: "Henry Taylor",
      email: "henry.taylor@email.com",
      school: "Jefferson Elementary",
      grade: "4th",
      enrollmentDate: "2023-09-03",
    },
  ]

  const [selectedSchool, setSelectedSchool] = useState("all")
  const [uploadedFile, setUploadedFile] = useState(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef(null)

  const filteredStudents =
    selectedSchool === "all"
      ? allStudents
      : allStudents.filter((student) => student.school === schools.find((s) => s.id === selectedSchool)?.name)

  const handleFileUpload = (file) => {
    if (
      file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.type === "application/vnd.ms-excel"
    ) {
      setUploadedFile(file)
      console.log("File uploaded:", file.name)
    } else {
      alert("Please upload an Excel file (.xlsx or .xls)")
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleFileInputChange = (e) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleSubmitAssessment = () => {
    if (uploadedFile) {
      alert(`Assessment questions from ${uploadedFile.name} have been uploaded successfully!`)
      setUploadedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

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
                  <span className="file-size">({(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
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
  )
}
