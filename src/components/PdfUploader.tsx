import React, { useCallback, useState } from 'react';
import { Upload, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';

// ✅ Set PDF.js worker source manually for Vite (no import errors or CORS issues)
GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';


interface PdfUploaderProps {
  onPdfExtracted: (text: string, fileName: string) => void;
  isProcessing: boolean;
}

const PdfUploader: React.FC<PdfUploaderProps> = ({ onPdfExtracted, isProcessing }) => {
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();

  const extractTextFromPdf = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      if (arrayBuffer.byteLength === 0) throw new Error('File appears to be empty or corrupted');

      const loadingTask = getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;

      if (pdf.numPages === 0) throw new Error('PDF contains no pages');

      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => ('str' in item ? item.str : ''))
          .filter((str) => str.trim().length > 0)
          .join(' ');
        fullText += pageText + '\n\n';
      }

      if (!fullText.trim()) {
        throw new Error('No readable text found. PDF may be image-based or password-protected.');
      }

      return fullText.trim();
    } catch (error: any) {
      throw new Error(error.message || 'Failed to extract PDF text');
    }
  };

  const handleFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      toast({ title: 'Invalid file type', description: 'Please upload a PDF file.', variant: 'destructive' });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Max file size is 10MB.', variant: 'destructive' });
      return;
    }

    try {
      const text = await extractTextFromPdf(file);
      onPdfExtracted(text, file.name);
      toast({ title: 'Success', description: 'PDF processed successfully!' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) handleFile(e.target.files[0]);
  };

  return (
    <Card className="p-8">
      <div
        className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {isProcessing ? (
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
            <p className="text-lg font-medium">Processing PDF...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-4">
            <div className="p-4 rounded-full bg-blue-100">
              <FileText className="h-12 w-12 text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Upload your PDF</h3>
            <p className="text-gray-500 mb-4">Drag and drop a file here, or click to upload</p>
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <label className="cursor-pointer flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Choose File
                <input type="file" accept=".pdf" className="hidden" onChange={handleFileInput} />
              </label>
            </Button>
            <p className="text-xs text-gray-400">Maximum file size: 10MB</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default PdfUploader;
