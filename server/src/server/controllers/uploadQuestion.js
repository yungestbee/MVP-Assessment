const xlsx = require('xlsx');
const path = require('path');



class QuestionController {

// Endpoint to upload Excel file
 static async uploadFile(req, res) {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const workbook = xlsx.readFile(req.file.path);
  const sheetName = workbook.SheetNames[0];
  const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

  // Example output structure
  const questions = sheetData.map((row, index) => ({
    question: row.question,
    options: {
      A: row.optionA,
      B: row.optionB,
      C: row.optionC,
      D: row.optionD,
    },
    correctAnswer: row.correctAnswer,
    category: row.category || 'General',
  }));

  // TODO: Save `questions` to your database here

  res.status(200).json({
    message: 'Questions uploaded successfully!',
    data: questions,
  });
}
}