
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Key, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GeminiApiKeyInputProps {
  onApiKeySet: (apiKey: string) => void;
  geminiApiKey: (defKey: string) => void;

}

const GeminiApiKeyInput: React.FC<GeminiApiKeyInputProps> = ({ onApiKeySet ,geminiApiKey }) => {

  const defKey= import.meta.env.VITE_GEMINI_API ?? ""
  const [apiKey, setApiKey] = useState(defKey);
  const [showApiKey, setShowApiKey] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const savedApiKey = localStorage.getItem('gemini_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
      onApiKeySet(savedApiKey);
    }
  }, [onApiKeySet]);

  const handleSaveApiKey = () => {
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your Gemini API key.",
        variant: "destructive",
      });
      return;
    }

    localStorage.setItem('gemini_api_key', apiKey.trim());
    onApiKeySet(apiKey.trim());
    toast({
      title: "API Key Saved",
      description: "Your Gemini API key has been saved securely in your browser.",
    });
  };

  const handleClearApiKey = () => {
    localStorage.removeItem('gemini_api_key');
    setApiKey('');
    onApiKeySet('');
    toast({
      title: "API Key Cleared",
      description: "Your API key has been removed.",
    });
  };

  return (
    <Card className="p-6 mb-6 border-yellow-200 bg-yellow-50">
      <div className="flex items-center gap-2 mb-4">
        <Key className="h-5 w-5 text-yellow-600" />
        <h3 className="text-lg font-semibold text-yellow-800">Gemini API Configuration</h3>
      </div>
      
      <p className="text-sm text-yellow-700 mb-4">
        To use the AI features, you need to provide your Google Gemini API key. 
        Your key will be stored securely in your browser's local storage.
      </p>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="api-key" className="text-sm font-medium text-gray-700">
            Gemini API Key
          </Label>
          <div className="relative mt-1">
            <Input
              id="api-key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Gemini API key..."
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showApiKey ? (
                <EyeOff className="h-4 w-4 text-gray-400" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={handleSaveApiKey} className="bg-yellow-600 hover:bg-yellow-700">
            Save API Key
          </Button>
          {apiKey && (
            <Button onClick={handleClearApiKey} variant="outline">
              Clear Key
            </Button>
          )}
        </div>
        
        <div className="text-xs text-gray-600">
          <p className="mb-1">Don't have an API key? Get one from Google AI Studio:</p>
          <a 
            href="https://aistudio.google.com/app/apikey" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
          >
            Get Gemini API Key <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </Card>
  );
};

export default GeminiApiKeyInput;
