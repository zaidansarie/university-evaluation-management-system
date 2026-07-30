import html2pdf from 'html2pdf.js';

export const generateQuestionPaperPDF = async (elementId, paper) => {
  const element = document.getElementById(elementId);
  if (!element) throw new Error("Preview element not found.");

  // Generate safe filename
  const cleanStr = (str) => (str || '').replace(/[^a-zA-Z0-9-]/g, '_').replace(/_+/g, '_');
  const filename = `${cleanStr(paper.exam_type)}_${cleanStr(paper.paper_title)}_${cleanStr(paper.course)}_Sem${paper.semester}_${cleanStr(paper.academic_year)}.pdf`;

  // Remove top/bottom padding temporarily so html2pdf can manage per-page vertical margins
  // without duplicating the top margin on the first page.
  const originalPaddingTop = element.style.paddingTop;
  const originalPaddingBottom = element.style.paddingBottom;
  element.style.paddingTop = '0px';
  element.style.paddingBottom = '0px';

  // HTML2PDF Options
  const opt = {
    margin:       [20, 0, 20, 0], // Top 20mm, Right 0, Bottom 20mm, Left 0 (Sides handled by CSS padding)
    filename:     filename,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { 
      scale: 3, // High scale for crisp rendering
      useCORS: true, 
      letterRendering: true,
      scrollY: 0, // Prevent vertical offset bugs if the user has scrolled down
      windowWidth: 793, // A4 pixel equivalent at 96 DPI
    },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak:    { mode: ['css', 'legacy'] }
  };

  // Generate PDF and modify jsPDF instance for page numbers and metadata
  await html2pdf().set(opt).from(element).toPdf().get('pdf').then((pdf) => {
    
    // Set Document Metadata
    pdf.setProperties({
      title: paper.paper_title,
      subject: paper.course,
      author: 'University Evaluation Management System',
      creator: 'Admin Dashboard'
    });

    // Add Page Numbers
    const totalPages = pdf.internal.getNumberOfPages();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(10);
      pdf.setTextColor(100);
      // Center bottom pagination
      pdf.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    }
  }).save();

  // Restore padding after PDF generation
  element.style.paddingTop = originalPaddingTop;
  element.style.paddingBottom = originalPaddingBottom;
};
