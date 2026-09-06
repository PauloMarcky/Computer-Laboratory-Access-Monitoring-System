const REGISTERED_STUDENTS = [
  { id: "24-10326", name: "Marcky Paulo Balaba" },
  { id: "24-10383", name: "Lanther han Serrano" },
  { id: "2023-10044", name: "JANE SMITH" },
  { id: "2023-10045", name: "MARIA SANTOS" }
];

exports.verifyAndLogScan = (req, res) => {
  const { scannedId } = req.body;

  if (!scannedId) {
    return res.status(400).json({ matched: false, message: "No ID provided." });
  }

  const cleanId = scannedId.trim();

  const matchedStudent = REGISTERED_STUDENTS.find(student => student.id === cleanId);

  if (matchedStudent) {
    console.log(`[MATCH FOUND] ID: ${matchedStudent.id} -> ${matchedStudent.name}`);
    return res.status(200).json({
      matched: true,
      studentId: matchedStudent.id,
      studentName: matchedStudent.name,
      message: "Access Granted!"
    });
  }

  console.log(`[REJECT] ID '${cleanId}' not recognized.`);
  return res.status(404).json({
    matched: false,
    message: "ID Number not registered."
  });
};