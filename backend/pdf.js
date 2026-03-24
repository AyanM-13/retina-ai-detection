const PDFDocument = require("pdfkit");
const fs = require("fs");

function createReport(data, output) {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  const stream = fs.createWriteStream(output);

  doc.pipe(stream);

  // Clinic Header
  doc.rect(0, 0, 600, 100).fill("#0f172a");
  doc.fontSize(28).fillColor("#ffffff").text("RetinaVision Clinical Labs", 50, 35);
  doc.fontSize(12).fillColor("#94a3b8").text("Advanced Diabetic Retinopathy Diagnostics", 50, 65);
  
  doc.moveDown(4);

  // Patient Information Table
  doc.fontSize(16).fillColor("#1e293b").text("Patient Demographics", { underline: true });
  doc.moveDown(0.5);

  const patient = data.patient || {};
  const tTop = doc.y;
  doc.fontSize(11).fillColor("#475569");
  doc.text(`Patient Name: ${patient.name || "N/A"}`, 50, tTop);
  doc.text(`Age: ${patient.age || "N/A"}`, 50, tTop + 20);
  doc.text(`Gender: ${patient.gender || "N/A"}`, 50, tTop + 40);
  doc.text(`Diabetes History: ${patient.diabetesHistory || "N/A"}`, 300, tTop);
  doc.text(`Hypertension: ${patient.hypertension || "N/A"}`, 300, tTop + 20);
  doc.text(`Report Date: ${new Date().toLocaleDateString()}`, 300, tTop + 40);

  doc.moveDown(4);

  // Diagnostic Results
  doc.fontSize(16).fillColor("#1e293b").text("AI Diagnostic Results", 50, doc.y, { underline: true });
  doc.moveDown(0.5);

  // Dynamic Color based on severity
  let riskColor = "#10b981"; // Healthy
  if (data.disease === "Severe" || data.disease === "Proliferative") riskColor = "#ef4444";
  else if (data.disease !== "No DR") riskColor = "#f59e0b";

  doc.fontSize(18).fillColor(riskColor).text(`Severity Grade: ${data.disease}`);
  doc.fontSize(12).fillColor("#475569").text(`AI Match Confidence: ${data.confidence}`);

  doc.moveDown(2);

  // Image Evidence (Original vs Heatmap)
  const imgY = doc.y;
  
  if (data.imagePath && fs.existsSync(data.imagePath)) {
    doc.fontSize(12).fillColor("#1e293b").text("Original Fundus Scan", 50, imgY);
    try {
      doc.image(data.imagePath, 50, imgY + 20, { width: 220, align: 'center' });
    } catch(e) { console.error("Failed to embed original image", e); }
  }

  if (data.heatmapBuffer) {
    doc.fontSize(12).fillColor("#1e293b").text("AI Confidence Heatmap", 300, imgY);
    try {
      doc.image(data.heatmapBuffer, 300, imgY + 20, { width: 220, align: 'center' });
    } catch(e) { console.error("Failed to embed heatmap", e); }
  }

  // Final Recommendation Area (Wait to push down past images)
  doc.y = imgY + 260;
  
  // Footer Box
  doc.rect(50, doc.y, 495, 60).fill("#f8fafc");
  const boxTop = doc.y;
  
  if (data.disease !== "No DR") {
    doc.fillColor("#ef4444").fontSize(11)
       .text("MEDICAL ADVISORY: Potential diabetic retinopathy detected. Immediate consultation with an ophthalmologist is strongly recommended.", 60, boxTop + 15, { width: 475 });
  } else {
    doc.fillColor("#10b981").fontSize(11)
       .text("MEDICAL ADVISORY: No signs of diabetic retinopathy detected. Continue regular annual screenings.", 60, boxTop + 15, { width: 475 });
  }

  // Disclaimer
  doc.y = 750;
  doc.fillColor("#94a3b8").fontSize(9).text(
    "Disclaimer: This report is generated automatically by RetinaVision Deep Learning AI. It is intended as a clinical decision support tool and does not constitute a final medical diagnosis.",
    50, doc.y, { align: "center", width: 500 }
  );

  doc.end();
}

module.exports = createReport;