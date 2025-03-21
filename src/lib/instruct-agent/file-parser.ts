/**
 * File parser utility to extract text from various document formats
 */

/**
 * Extract text content from a file
 * @param file The uploaded file to extract text from
 * @returns A promise that resolves to the extracted text content
 */
export async function extractTextFromFile(file: File): Promise<string> {
  try {
    // Handle text files and markdown
    if (file.type === 'text/plain' || 
        file.type === 'text/markdown' || 
        file.name.endsWith('.md') || 
        file.name.endsWith('.txt')) {
      return await readTextFile(file);
    }
    
    // Handle PDF files
    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      return await extractTextFromPDF(file);
    }
    
    // Handle DOCX files
    if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.name.endsWith('.docx')) {
      return await extractTextFromDOCX(file);
    }
    
    // For other file types, provide a helpful message
    return `Unable to fully extract content from ${file.name}. File type: ${file.type}. Please upload a text, markdown, PDF, or DOCX file for best results.`;
  } catch (error) {
    console.error('Error extracting text from file:', error);
    return `Error processing file: ${file.name}. ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}

/**
 * Read a text file
 */
async function readTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = () => {
      reject(new Error(`Failed to read file: ${file.name}`));
    };
    reader.readAsText(file);
  });
}

/**
 * Extract text from PDF using PDF.js
 */
async function extractTextFromPDF(file: File): Promise<string> {
  try {
    // Dynamic import of pdfjs - requires the library to be installed
    let pdfjs;
    try {
      pdfjs = await import('pdfjs-dist');
      // Important: We need to specify a fixed version for both the library and worker
      // Use the version from the actual package to avoid mismatches
      const version = pdfjs.version || '3.11.174';
      console.log(`Using PDF.js version: ${version}`);
      
      // We'll use the same version for both the library and worker by using a CDN
      const workerSrc = `https://unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.js`;
      pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
    } catch (error) {
      console.error('PDF.js library not found or error setting worker:', error);
      return `PDF text extraction requires the PDF.js library which couldn't be loaded properly. Error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try a different file format or extract the text manually.`;
    }
    
    // Read the file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    try {
      // Load the PDF document with explicit disabling of worker if needed
      const pdf = await pdfjs.getDocument({
        data: arrayBuffer,
        useWorkerFetch: false, // Try to avoid worker fetch issues
        isEvalSupported: false, // Avoid eval issues in strict environments
        useSystemFonts: true    // Use system fonts to avoid font loading issues
      }).promise;
      
      let extractedText = `[Content extracted from ${file.name}]\n\n`;
      
      // Extract text from each page - limit to first 50 pages for large documents
      const pageCount = Math.min(pdf.numPages, 50);
      for (let i = 1; i <= pageCount; i++) {
        try {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const textItems = textContent.items;
          
          // Extract text from text items
          const pageText = textItems
            .map(item => 'str' in item ? item.str : '')
            .join(' ');
          
          extractedText += `--- Page ${i} ---\n${pageText}\n\n`;
        } catch (pageError) {
          console.error(`Error extracting page ${i}:`, pageError);
          extractedText += `--- Page ${i} ---\n[Error extracting this page]\n\n`;
        }
      }
      
      if (pdf.numPages > pageCount) {
        extractedText += `[Note: Only showing first ${pageCount} pages of ${pdf.numPages} total pages]\n\n`;
      }
      
      if (extractedText.trim() === `[Content extracted from ${file.name}]`) {
        return `The PDF file "${file.name}" appears to be a scanned document or has no extractable text content. Consider using an OCR tool to extract the text before uploading, or manually type the relevant content into the chat.`;
      }
      
      return extractedText;
    } catch (error) {
      console.error('PDF parsing error:', error);
      // Try the fallback method
      return await simpleTextExtraction(file);
    }
  } catch (error) {
    console.error('Error in PDF extraction:', error);
    return `Failed to extract text from PDF "${file.name}". Error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try a different file format or extract the text manually.`;
  }
}

/**
 * Fallback extraction without using PDF.js - just try to get some text content
 */
async function simpleTextExtraction(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        // Try to extract any text content from the raw PDF data
        const data = reader.result as ArrayBuffer;
        const bytes = new Uint8Array(data);
        let text = '';
        
        // Look for text patterns in PDF - very simplified approach
        for (let i = 0; i < bytes.length - 4; i++) {
          // Look for text objects in PDF
          if (bytes[i] === 0x54 && // 'T'
              bytes[i+1] === 0x6A && // 'j'
              bytes[i+2] <= 127) { // Followed by ASCII
            // Extract some characters after text marker
            let extracted = '';
            for (let j = i + 3; j < i + 100 && j < bytes.length; j++) {
              if (bytes[j] >= 32 && bytes[j] <= 126) { // Printable ASCII
                extracted += String.fromCharCode(bytes[j]);
              }
            }
            if (extracted.length > 5) { // Only keep substantial text
              text += extracted + ' ';
            }
          }
        }
        
        if (text.length > 100) {
          resolve(`[Basic text extracted from ${file.name} using fallback method]\n\n${text}`);
        } else {
          resolve(`Unable to extract meaningful text from "${file.name}". This PDF might be scanned or contain mostly images. Please try a different file or manually extract the text.`);
        }
      } catch (error) {
        console.error('Simple extraction failed:', error);
        resolve(`Unable to extract text from PDF "${file.name}". Please try a different file.`);
      }
    };
    
    reader.onerror = () => {
      resolve(`Failed to read PDF file: ${file.name}`);
    };
    
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Simple fallback extraction method that works in browsers
 * without requiring PDF.js worker
 */
async function fallbackPDFExtraction(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        // Try to use PDF.js without worker
        const pdfjs = await import('pdfjs-dist');
        
        // Disable worker to use on main thread
        pdfjs.GlobalWorkerOptions.workerSrc = '';
        
        const arrayBuffer = reader.result as ArrayBuffer;
        const loadingTask = pdfjs.getDocument({ data: arrayBuffer, disableWorker: true });
        const pdf = await loadingTask.promise;
        
        let text = `[Content extracted from ${file.name} using fallback method]\n\n`;
        
        // Only process first 10 pages for performance
        const maxPages = Math.min(pdf.numPages, 10);
        for (let i = 1; i <= maxPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          
          const pageText = content.items
            .map(item => 'str' in item ? item.str : '')
            .join(' ');
          
          text += `--- Page ${i} ---\n${pageText}\n\n`;
        }
        
        if (maxPages < pdf.numPages) {
          text += `[Note: Only the first ${maxPages} pages were extracted for performance reasons. The document has ${pdf.numPages} pages in total.]\n`;
        }
        
        resolve(text);
      } catch (error) {
        console.error('Fallback PDF extraction failed:', error);
        resolve(`Unable to extract text from this PDF. The document might be scanned or protected. Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };
    
    reader.onerror = () => {
      resolve(`Failed to read PDF file: ${file.name}`);
    };
    
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Extract text from DOCX
 * Note: In a production environment, you'd use a library like mammoth.js
 * This is a simplified implementation for the demo
 */
async function extractTextFromDOCX(file: File): Promise<string> {
  // This is a placeholder for actual DOCX extraction
  return `[DOCX Content from ${file.name}]\n\nThis is a simplified text extraction. In a production environment, you would integrate a DOCX parsing library.`;
}