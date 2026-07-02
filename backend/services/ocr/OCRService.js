const MockProvider = require('./providers/MockProvider');
const TesseractProvider = require('./providers/TesseractProvider');

class OCRService {
  constructor(providerName = 'tesseract') {
    switch(providerName.toLowerCase()) {
      case 'mock':
        this.provider = new MockProvider();
        break;
      case 'tesseract':
        this.provider = new TesseractProvider();
        break;
      // case 'gemini': this.provider = new GeminiProvider(); break;
      default:
        this.provider = new TesseractProvider();
    }
  }

  async processImage(imageBase64) {
    if (!imageBase64) {
      throw new Error("No image data provided for OCR");
    }
    
    // The provider handles the raw image and returns a structured object
    return await this.provider.recognize(imageBase64);
  }
}

module.exports = OCRService;
