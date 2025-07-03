import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FileText, Brain, HelpCircle, Sparkles } from 'lucide-react';
import PdfUploader from '@/components/PdfUploader';
import NotesDisplay from '@/components/NotesDisplay';
import QuizInterface from '@/components/QuizInterface';
import GeminiApiKeyInput from '@/components/GeminiApiKeyInput';
import { GeminiService } from '@/services/geminiService';
import { useToast } from '@/hooks/use-toast';

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

const Index = () => {
  const defaultGeminiKey = import.meta.env.VITE_GEMINI_API ?? "";
  const [geminiApiKey, setGeminiApiKey] = useState(defaultGeminiKey);

  const [pdfText, setPdfText] = useState('');
  const [fileName, setFileName] = useState('');
  const [notes, setNotes] = useState('');
  const [totalQuestion, setTotalQuestions] = useState(10);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isProcessingPdf, setIsProcessingPdf] = useState(false);
  const [isGeneratingNotes, setIsGeneratingNotes] = useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');
  const [showDialog, setShowDialog] = useState(false);
  const [tempQuestions, setTempQuestions] = useState<number | ''>(10);
  const { toast } = useToast();

  const handlePdfExtracted = async (text: string, name: string) => {
    setIsProcessingPdf(true);
    setPdfText(text);
    setFileName(name);

    if (!geminiApiKey) {
      setIsProcessingPdf(false);
      toast({
        title: 'API Key Required',
        description: 'Please set your Gemini API key first.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const geminiService = new GeminiService(geminiApiKey, totalQuestion);
      setIsGeneratingNotes(true);
      const generatedNotes = await geminiService.generateNotes(text);
      setNotes(generatedNotes);
      setIsGeneratingNotes(false);
      setActiveTab('notes');
      toast({ title: 'Success!', description: 'Notes generated successfully!' });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to generate content. Check your API key and try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessingPdf(false);
      setIsGeneratingNotes(false);
    }
  };

  const generateQuiz = async (num: number) => {
    if (!geminiApiKey) {
      toast({
        title: 'API Key Required',
        description: 'Please set your Gemini API key first.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsGeneratingQuiz(true);
      const geminiService = new GeminiService(geminiApiKey, num);
      const generatedQuestions = await geminiService.generateQuiz(pdfText);
      setQuestions(generatedQuestions);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to generate quiz. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handleDialogSubmit = () => {
    if (tempQuestions && tempQuestions > 0) {
      setTotalQuestions(tempQuestions);
      setShowDialog(false);
      generateQuiz(tempQuestions);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              PDF Summarizer
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Transform your PDFs into comprehensive notes and interactive quizzes using AI
          </p>
        </div>

        {/* Always show API key input */}
        <div className="max-w-2xl mx-auto mb-8">
          <GeminiApiKeyInput apiKey={geminiApiKey} onApiKeySet={setGeminiApiKey} />
        </div>

        <div className="max-w-4xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Upload PDF
              </TabsTrigger>
              <TabsTrigger value="notes" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Notes
              </TabsTrigger>
              <TabsTrigger
                value="quiz"
                className="flex items-center gap-2"
                onClick={() => setShowDialog(true)}
              >
                <HelpCircle className="h-4 w-4" />
                Quiz
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-6">
              <PdfUploader
                onPdfExtracted={handlePdfExtracted}
                isProcessing={isProcessingPdf || isGeneratingNotes || isGeneratingQuiz}
              />

              {fileName && (
                <Card className="p-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FileText className="h-4 w-4" />
                    <span>Loaded: {fileName}</span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      {pdfText.length.toLocaleString()} characters extracted
                    </span>
                  </div>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="notes">
              <NotesDisplay notes={notes} isLoading={isGeneratingNotes} />
            </TabsContent>

            <TabsContent value="quiz">
              <QuizInterface questions={questions} isLoading={isGeneratingQuiz} />
            </TabsContent>
          </Tabs>
        </div>

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Number of Questions</DialogTitle>
            </DialogHeader>
            <input
              type="number"
              min={1}
              value={tempQuestions}
              onChange={(e) => setTempQuestions(Number(e.target.value))}
              className="w-full border rounded px-3 py-2"
            />
            <DialogFooter className="flex gap-2">
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleDialogSubmit}>Generate</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="text-center mt-12 text-gray-500 text-sm">
          <p>Powered by Google Gemini AI • Built with React & Tailwind CSS</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
