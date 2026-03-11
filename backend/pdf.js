const PDFDocument = require("pdfkit");
const fs = require("fs");

function createReport(data, output) {
  const doc = new PDFDocument({ margin: 50 });
  const stream = fs.createWriteStream(output);

  doc.pipe(stream);

  // Title
  doc
    .fontSize(22)
    .fillColor("#2c3e50")
    .text("RetinaAI Medical Report", { align: "center" });

  doc.moveDown(2);

  // Patient section
  doc.fontSize(16).fillColor("black").text("Patient Information", { underline: true });

  const patient = data.patient || {};

  doc.moveDown();
  doc.fontSize(12).text(`Name: ${patient.name || "N/A"}`);
  doc.text(`Age: ${patient.age || "N/A"}`);
  doc.text(`Gender: ${patient.gender || "N/A"}`);
  doc.text(`Diabetes History: ${patient.diabetesHistory || "N/A"}`);
  doc.text(`Hypertension: ${patient.hypertension || "N/A"}`);

  doc.moveDown(2);

  // Diagnosis section
  doc.fontSize(16).text("AI Diagnosis Results", { underline: true });

  doc.moveDown();

  // CHANGED: Instead of "Positive/Negative", we show the specific Severity Grade
  doc.fontSize(14).fillColor("#e67e22").text(
    `Severity Grade: ${data.disease}` 
  );

  doc.fontSize(12).fillColor("black").text(
    `Confidence Score: ${data.confidence}`
  );

  doc.text(`Report Generated: ${new Date().toLocaleString()}`);

  doc.moveDown(2);

  // ADDED: Simple disclaimer based on severity
  if (data.disease !== "No DR") {
    doc.fillColor("#c0392b").text(
      "Recommendation: Please consult an ophthalmologist for further clinical evaluation.",
      { oblique: true }
    );
  }

  doc.moveDown(2);
  doc.fillColor("grey").fontSize(10).text(
    "This report is generated using RetinaAI deep learning analysis and should be used as a screening aid, not a final medical diagnosis.",
    { align: "center" }
  );

  doc.end();
}

module.exports = createReport;