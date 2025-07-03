
import React from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BookOpen, Lightbulb, Target } from 'lucide-react';

interface NotesDisplayProps {
  notes: string;
  isLoading: boolean;
}

const NotesDisplay: React.FC<NotesDisplayProps> = ({ notes, isLoading }) => {
  const formatNotes = (text: string) => {
    const sections = text.split('\n').filter(line => line.trim());
    return sections.map((section, index) => {
      if (section.startsWith('##')) {
        return (
          <h3 key={index} className="text-lg font-semibold text-blue-700 mt-4 mb-2 flex items-center gap-2">
            <Target className="h-4 w-4" />
            {section.replace('##', '').trim()}
          </h3>
        );
      } else if (section.startsWith('#')) {
        return (
          <h2 key={index} className="text-xl font-bold text-blue-800 mt-6 mb-3 flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            {section.replace('#', '').trim()}
          </h2>
        );
      } else if (section.startsWith('•') || section.startsWith('-')) {
        return (
          <li key={index} className="ml-4 mb-2 flex items-start gap-2">
            <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
            <span>{section.replace(/^[•-]\s*/, '').trim()}</span>
          </li>
        );
      } else {
        return (
          <p key={index} className="mb-3 text-gray-700 leading-relaxed">
            {section}
          </p>
        );
      }
    });
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
          <div className="h-6 bg-gray-200 rounded w-2/3"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="h-5 w-5 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-800">Generated Notes</h2>
      </div>
      <ScrollArea className="h-96">
        <div className="prose prose-blue max-w-none">
          {notes ? formatNotes(notes) : (
            <p className="text-gray-500 italic">
              Upload a PDF to generate notes automatically using AI.
            </p>
          )}
        </div>
      </ScrollArea>
    </Card>
  );
};

export default NotesDisplay;
