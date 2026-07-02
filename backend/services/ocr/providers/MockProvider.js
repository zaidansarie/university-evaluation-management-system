// Mock Provider for testing and fallback
class MockProvider {
  async recognize(imageBase64) {
    console.log("MockProvider: Simulating OCR processing...");
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate extraction logic: Look for common patterns
    // Just return some dummy data that looks like a real OCR payload
    return {
      text: "CANDIDATE CODE: 220145\nROLL NUMBER: 590017505\nNAME: Mohd Zaid",
      confidence: 90,
      detectedFields: {
        candidate_code: { value: "220145", confidence: 98 },
        roll_number: { value: "590017505", confidence: 91 },
        student_name: { value: "Mohd Zaid", confidence: 73 }
      }
    };
  }
}

module.exports = MockProvider;
