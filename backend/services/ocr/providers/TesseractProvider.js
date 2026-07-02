const Tesseract = require('tesseract.js');

class TesseractProvider {
  async recognize(imageBase64) {
    try {
      console.log("TesseractProvider: Starting OCR recognition...");
      
      // Remove data:image/png;base64, prefix if present
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, 'base64');

      const result = await Tesseract.recognize(buffer, 'eng');
      const text = result.data.text;
      const overallConfidence = result.data.confidence;
      
      // Basic heuristic extraction from raw text
      let detectedFields = {};
      
      // Try to find Hall Ticket Number (e.g., HTNo or similar)
      const htMatch = text.match(/(?:Hall\s*Ticket|HTNo|H\.T\.No)[\s:\-]*([A-Za-z0-9]+)/i);
      if (htMatch && htMatch[1]) {
        detectedFields.hall_ticket_number = { value: htMatch[1].trim(), confidence: Math.max(overallConfidence - 10, 10) };
      }

      // Try to find Candidate Code (e.g., 6 digits)
      const ccMatch = text.match(/\b\d{6}\b/);
      if (ccMatch) {
        detectedFields.candidate_code = { value: ccMatch[0], confidence: overallConfidence };
      }

      // Try to find Roll Number (e.g., 9-11 digits)
      const rollMatch = text.match(/\b\d{9,11}\b/);
      if (rollMatch) {
        detectedFields.roll_number = { value: rollMatch[0], confidence: overallConfidence };
      }

      // Look for "Name: [Value]" pattern
      const nameMatch = text.match(/Name\s*[:\-]?\s*([A-Za-z\s]+)/i);
      if (nameMatch && nameMatch[1]) {
        detectedFields.student_name = { value: nameMatch[1].trim(), confidence: Math.max(overallConfidence - 20, 10) };
      }
      
      // Look for Subject
      const subjMatch = text.match(/Subject\s*[:\-]?\s*([A-Za-z\s0-9&]+)/i);
      if (subjMatch && subjMatch[1]) {
        detectedFields.subject = { value: subjMatch[1].trim().split('\n')[0], confidence: Math.max(overallConfidence - 15, 10) };
      }

      // Look for Branch
      const branchMatch = text.match(/Branch\s*[:\-]?\s*([A-Za-z\s0-9&]+)/i);
      if (branchMatch && branchMatch[1]) {
        detectedFields.branch = { value: branchMatch[1].trim().split('\n')[0], confidence: Math.max(overallConfidence - 15, 10) };
      }

      // Look for Semester
      const semMatch = text.match(/Semester\s*[:\-]?\s*([IVX0-9]+)/i);
      if (semMatch && semMatch[1]) {
        detectedFields.semester = { value: semMatch[1].trim(), confidence: Math.max(overallConfidence - 10, 10) };
      }

      // Look for Date
      const dateMatch = text.match(/(?:Date)\s*[:\-]?\s*([0-9]{1,2}[\/\-][0-9]{1,2}[\/\-][0-9]{2,4})/i);
      if (dateMatch && dateMatch[1]) {
        detectedFields.date = { value: dateMatch[1].trim(), confidence: Math.max(overallConfidence - 5, 10) };
      }

      return {
        text: text,
        confidence: overallConfidence,
        detectedFields: detectedFields
      };

    } catch (err) {
      console.error("TesseractProvider Error:", err);
      throw err;
    }
  }
}

module.exports = TesseractProvider;
