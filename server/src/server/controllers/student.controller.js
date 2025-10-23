const Student = require("../../models/student.model");

// ✅ Create a new student
const createStudent = (req, res) => {
  try {
    const { firstName, lastName, grade, score, school } = req.body;

    if (!firstName || !lastName || !grade) {
      return res.status(400).json({
        status: "error",
        message: "First name, last name, and grade are required.",
      });
    }

    // Check if student already exists (optional)
    const existing = Student.getAll().find(
      (s) =>
        s.firstName.toLowerCase() === firstName.toLowerCase() &&
        s.lastName.toLowerCase() === lastName.toLowerCase() &&
        s.grade.toLowerCase() === grade.toLowerCase()
    );

    if (existing) {
      return res.status(203).json({
        status: "error",
        message: "Student has already attempted this assessment.",
      });
    }

    const newStudent = Student.create({
      firstName,
      lastName,
      grade,
      score,
      school,
    });

    return res.status(201).json({
      status: "success",
      message: "Student created successfully",
      data: newStudent,
    });
  } catch (error) {
    console.error("❌ Error creating student:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error.",
    });
  }
};

// ✅ Get all students
const getAllStudents = (req, res) => {
  try {
    const students = Student.getAll();
    return res.status(200).json({
      status: "success",
      data: students,
    });
  } catch (error) {
    console.error("❌ Error fetching students:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error.",
    });
  }
};

// ✅ Get student by ID
const getStudentById = (req, res) => {
  try {
    const { id } = req.params;
    const student = Student.getById(id);

    if (!student) {
      return res.status(404).json({
        status: "error",
        message: "Student not found.",
      });
    }

    return res.status(200).json({
      status: "success",
      data: student,
    });
  } catch (error) {
    console.error("❌ Error fetching student:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error.",
    });
  }
};

// ✅ Update student
const updateStudent = (req, res) => {
  try {
    const { id } = req.params;
    const updated = Student.update(id, req.body);

    if (!updated) {
      return res.status(404).json({
        status: "error",
        message: "Student not found.",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Student updated successfully.",
      data: updated,
    });
  } catch (error) {
    console.error("❌ Error updating student:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error.",
    });
  }
};

// ✅ Delete student
const deleteStudent = (req, res) => {
  try {
    const { id } = req.params;
    const result = Student.delete(id);

    if (result.changes === 0) {
      return res.status(404).json({
        status: "error",
        message: "Student not found.",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Student deleted successfully.",
    });
  } catch (error) {
    console.error("❌ Error deleting student:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error.",
    });
  }
};

module.exports = {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
};
