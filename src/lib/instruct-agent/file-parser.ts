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
 * Extract text from PDF
 * Note: In a production environment, you'd use a library like pdf.js
 * This is a simplified implementation for the demo
 */
async function extractTextFromPDF(file: File): Promise<string> {
  // This is a placeholder for actual PDF extraction
  return `[PDF Content from ${file.name}]\n\nThis is a simplified text extraction. In a production environment, you would integrate a PDF parsing library.`;
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