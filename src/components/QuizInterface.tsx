
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle, XCircle, RotateCcw, Trophy, Brain } from 'lucide-react';

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface QuizInterfaceProps {
  questions: Question[];
  isLoading: boolean;
}

const QuizInterface: React.FC<QuizInterfaceProps> = ({ questions, isLoading}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResults) return;
    
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswers([]);
    setShowResults(false);
    setQuizStarted(false);
  };

  const calculateScore = () => {
    return selectedAnswers.reduce((score, answer, index) => {
      return score + (answer === questions[index]?.correctAnswer ? 1 : 0);
    }, 0);
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Card>
    );
  }

  if (!questions.length) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Quiz Available</h3>
          <p className="text-gray-500">Upload a PDF to generate quiz questions automatically.</p>
        </div>
      </Card>
    );
  }

  if (!quizStarted) {
    return (
      <Card className="p-6">
        <div className="text-center">
       
          <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Ready to Test Your Knowledge?</h2>
          <p className="text-gray-600 mb-6">
            We've generated {length} questions based on your PDF content.
          </p>
          <Button 
            onClick={() => setQuizStarted(true)}
            className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3"
          >
            Start Quiz
          </Button>
        </div>
      </Card>
    );
  }

  if (showResults) {
    const score = calculateScore();
    const percentage = Math.round((score / questions.length) * 100);
    
    return (
      <Card className="p-6">
        <div className="text-center mb-6">
          <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Quiz Complete!</h2>
          <div className="flex items-center justify-center gap-4 mb-4">
            <Badge variant={percentage >= 70 ? "default" : "destructive"} className="text-lg px-4 py-2">
              {score}/{questions.length} ({percentage}%)
            </Badge>
          </div>
        </div>
        
        <ScrollArea className="h-64 mb-6">
          <div className="space-y-4">
            {questions.map((question, index) => {
              const userAnswer = selectedAnswers[index];
              const isCorrect = userAnswer === question.correctAnswer;
              
              return (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start gap-2 mb-2">
                    {isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium mb-2">{question.question}</p>
                      <p className="text-sm text-gray-600">
                        Your answer: {question.options[userAnswer]}
                      </p>
                      {!isCorrect && (
                        <p className="text-sm text-green-600">
                          Correct answer: {question.options[question.correctAnswer]}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
        
        <Button onClick={resetQuiz} className="w-full" variant="outline">
          <RotateCcw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </Card>
    );
  }

  const question = questions[currentQuestion];
  
  return (
    <Card className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <Badge variant="outline">
            Question {currentQuestion + 1} of {questions.length}
          </Badge>
          <div className="w-32 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>
        
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          {question.question}
        </h3>
        
        <div className="space-y-3">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              className={`w-full p-4 text-left rounded-lg border-2 transition-colors ${
                selectedAnswers[currentQuestion] === index
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="font-medium text-gray-700">{String.fromCharCode(65 + index)}.</span>
              <span className="ml-2">{option}</span>
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
          disabled={currentQuestion === 0}
        >
          Previous
        </Button>
        <Button 
          onClick={nextQuestion}
          disabled={selectedAnswers[currentQuestion] === undefined}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {currentQuestion === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
        </Button>
      </div>
    </Card>
  );
};

export default QuizInterface;
