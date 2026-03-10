const PDFDocument = require("pdfkit");
const fs = require("fs");

function createReport(data, output) {

  const doc = new PDFDocument({ margin: 50 });

  const stream = fs.createWriteStream(output);

  doc.pipe(stream);

  // Title
  doc
    .fontSize(22)
    .text("RetinaAI Medical Report", { align: "center" });

  doc.moveDown(2);

  // Patient section
  doc.fontSize(16).text("Patient Information", { underline: true });

  const patient = data.patient || {};

  doc.moveDown();

  doc.fontSize(12).text(`Name: ${patient.name || "N/A"}`);
  doc.text(`Age: ${patient.age || "N/A"}`);
  doc.text(`Gender: ${patient.gender || "N/A"}`);
  doc.text(`Diabetes History: ${patient.diabetesHistory || "N/A"}`);
  doc.text(`Hypertension: ${patient.hypertension || "N/A"}`);

  doc.moveDown(2);

  // Diagnosis section
  doc.fontSize(16).text("AI Diagnosis", { underline: true });

  doc.moveDown();

  doc.fontSize(12).text(
    `Disease Detection: ${data.disease ? "Positive" : "Negative"}`
  );

  doc.text(
    `Confidence Score: ${(data.confidence * 100).toFixed(2)}%`
  );

  doc.text(`Report Generated: ${new Date().toLocaleString()}`);

  doc.moveDown(2);

  doc.text(
    "This report is generated using RetinaAI deep learning analysis.",
    { align: "center" }
  );

  doc.end();
}

module.exports = createReport;