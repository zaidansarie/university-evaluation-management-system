import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import './PDFViewer.css';

// Set up pdf.js worker globally
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

function PDFViewer({ pdfUrl, onPageRenderSuccess }) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.5));
  const handleFitPage = () => setScale(0.8);

  const handlePageRenderSuccess = (page) => {
    if (onPageRenderSuccess) {
      onPageRenderSuccess(page, pageNumber);
    }
  };

  if (!pdfUrl) {
    return (
      <div className="pdf-pane">
        <div className="pdf-viewer-empty">
          <p>No PDF available to view.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pdf-pane">
      <div className="pdf-toolbar">
        <div className="pdf-controls">
          <span className="pdf-page-indicator">Page {pageNumber} / {numPages || '--'}</span>
          <button className="as-btn as-btn-secondary" onClick={() => setPageNumber(prev => Math.max(prev - 1, 1))} disabled={pageNumber <= 1}>Prev</button>
          <button className="as-btn as-btn-secondary" onClick={() => setPageNumber(prev => Math.min(prev + 1, numPages))} disabled={pageNumber >= numPages}>Next</button>
        </div>
        <div className="pdf-controls">
          <button className="as-btn as-btn-secondary" onClick={handleZoomOut}>-</button>
          <span className="pdf-zoom-indicator">{Math.round(scale * 100)}%</span>
          <button className="as-btn as-btn-secondary" onClick={handleZoomIn}>+</button>
          <button className="as-btn as-btn-secondary" onClick={handleFitPage}>Fit Page</button>
        </div>
      </div>
      <div className="pdf-viewer-container">
        <Document
          file={pdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={<div style={{padding:'40px', color: '#64748b'}}>Loading PDF Document...</div>}
          error={(err) => <div style={{padding:'40px', color: '#ef4444'}}>Failed to load PDF file. {err?.message || err?.toString()}</div>}
        >
          <Page 
            pageNumber={pageNumber} 
            scale={scale} 
            onRenderSuccess={handlePageRenderSuccess}
          />
        </Document>
      </div>
    </div>
  );
}

export default PDFViewer;
