interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export class GeminiService {
  private apiKey: string;
  private Questions:number;
  private baseUrl =`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`;
;

  constructor(apiKey: string,Questions:number) {
    this.apiKey = apiKey;
    this.Questions = Questions
  }

  private async makeRequest(prompt: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}\n${errorText}`);
      }

      const data = await response.json();

      const content = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!content) {
        throw new Error('Invalid response from Gemini API');
      }

      return content;
    } catch (error) {
      console.error('Gemini API request failed:', error);
      throw error;
    }
  }

  async generateNotes(pdfText: string): Promise<string> {
    const prompt = `
Please analyze the following PDF content and create structured, concise notes with clear sections and bullet points.

Structure:
# Main Topics
## Subtopics
• Bullet points

PDF Content:
${pdfText.substring(0, 10000)} 

Only return the notes without extra explanation.
    `;

    return await this.makeRequest(prompt);
  }

  async generateQuiz(pdfText: string): Promise<Question[]> {
    const prompt = `
Create ${this.Questions} multiple-choice questions based on this content.

Format:
[
  {
    "question": "Text?",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": 0,
    "explanation": "Why this answer is correct"
  }
]

Use only JSON. No markdown or extra explanation.

PDF Content:
${pdfText.substring(0, 8000)}
    `;

    try {
      const responseText = await this.makeRequest(prompt);

      // Clean up response if wrapped in code block
      const cleaned = responseText
        .replace(/```json|```/g, '')
        .trim();

      const jsonStart = cleaned.indexOf('[');
      const jsonEnd = cleaned.lastIndexOf(']') + 1;

      if (jsonStart === -1 || jsonEnd === 0) {
        throw new Error('No JSON array found in Gemini response');
      }

      const json = cleaned.substring(jsonStart, jsonEnd);

      const questions = JSON.parse(json);

      if (!Array.isArray(questions)) {
        throw new Error('Gemini response is not a valid JSON array');
      }

      return questions.map((q: any) => ({
        question: q.question || '',
        options: Array.isArray(q.options) ? q.options : [],
        correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : 0,
        explanation: q.explanation || '',
      }));
    } catch (err) {
      console.error('Failed to parse quiz JSON:', err);

      // Fallback example question
      return [
        {
          question: 'What is the main topic discussed?',
          options: ['A', 'B', 'C', 'D'],
          correctAnswer: 0,
          explanation: 'Fallback generated due to parsing error.',
        },
      ];
    }
  }
}
