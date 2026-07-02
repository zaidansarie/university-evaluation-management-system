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

      // We won't try to guess Name with regex right now as it's too error prone without anchor text
      // But we can look for "Name: [Value]" pattern
      const nameMatch = text.match(/Name\s*[:\-]?\s*([A-Za-z\s]+)/i);
      if (nameMatch && nameMatch[1]) {
        detectedFields.student_name = { value: nameMatch[1].trim(), confidence: Math.max(overallConfidence - 20, 10) }; // Slightly lower confidence for regex parsing
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
