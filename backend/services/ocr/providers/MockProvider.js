// Mock Provider for testing and fallback
class MockProvider {
  async recognize(imageBase64) {
    console.log("MockProvider: Simulating OCR processing...");
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate extraction logic: Look for common patterns
    // Just return some dummy data that looks like a real OCR payload
    return {
      text: "HALL TICKET NUMBER: 590017505\nCANDIDATE CODE: 220145\nROLL NUMBER: 590017505\nNAME: Mohd Zaid\nSUBJECT: Artificial Intelligence\nBRANCH: AI&DS\nSEMESTER: IV\nDATE: 15-05-2024",
      confidence: 90,
      detectedFields: {
        hall_ticket_number: { value: "590017505", confidence: 95 },
        candidate_code: { value: "220145", confidence: 98 },
        roll_number: { value: "590017505", confidence: 91 },
        student_name: { value: "Mohd Zaid", confidence: 73 },
        subject: { value: "Artificial Intelligence", confidence: 85 },
        branch: { value: "AI&DS", confidence: 88 },
        semester: { value: "IV", confidence: 92 },
        date: { value: "15-05-2024", confidence: 96 }
      }
    };
  }
}

module.exports = MockProvider;
