declare const window: any;

export const generatePdfFromElement = async (element: HTMLElement, fileName: string): Promise<void> => {
    // jsPDF and html2canvas are loaded from CDN and available on the window object.
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
        orientation: 'p',
        unit: 'pt',
        format: 'letter', // Standard letter size: 612pt x 792pt
    });

    // The element is styled to be 8.5in (612pt) wide.
    // We will make the PDF output match this exactly, with no extra margins from jsPDF.
    // The element's own padding will serve as the document margin.
    return doc.html(element, {
        callback: function (doc: any) {
            doc.save(fileName);
        },
        // Tell jsPDF to place the content at the very top-left of the page.
        x: 0,
        y: 0,
        // The output width on the PDF should be the full page width.
        width: 612,
        // The width for html2canvas to use for rendering should also match the element's width.
        windowWidth: 612,
        html2canvas: {
            scale: 2, // Higher resolution for better quality
            useCORS: true,
            letterRendering: true,
        },
        autoPaging: 'text', // Tries to avoid cutting text lines between pages
        // Remove jsPDF margins to rely solely on the element's internal padding.
        margin: [0, 0, 0, 0],
    });
};