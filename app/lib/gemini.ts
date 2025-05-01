import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_API_KEY, checkGeminiConfig } from './env';

// Create Gemini AI instance only if API key is available
const genAI = GEMINI_API_KEY 
  ? new GoogleGenerativeAI(GEMINI_API_KEY)
  : null;

type SuggestionType = 'task' | 'project' | 'description';

/**
 * Get suggestions from Gemini for tasks, projects, or descriptions
 */
export async function getSuggestions(input: string, type: SuggestionType): Promise<string[]> {
  try {
    // Check if API key is available
    if (!checkGeminiConfig() || !genAI) {
      return [];
    }
    
    // Select a generative model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    // Create prompt based on type
    let prompt = '';
    
    switch (type) {
      case 'task':
        prompt = `Generate 3 task title suggestions based on this input: "${input}". 
        Return only the task titles, each on a new line. Be concise, specific, and action-oriented. 
        Each title should be under 60 characters. Don't number the items.`;
        break;
      case 'project':
        prompt = `Generate 3 project title suggestions based on this input: "${input}".
        Return only the project titles, each on a new line. Be concise, specific, and descriptive.
        Each title should be under 60 characters. Don't number the items.`;
        break;
      case 'description':
        prompt = `Generate a concise and clear description for a ${input.includes('project') ? 'project' : 'task'} titled: "${input}".
        The description should explain what needs to be done, be under 120 characters, and be actionable.
        Return only the description text.`;
        break;
    }
    
    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse the response into an array of suggestions
    return text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .slice(0, 3); // Ensure we only return max 3 items
  } catch (error) {
    console.error('Error getting suggestions from Gemini:', error);
    return [];
  }
}

/**
 * Generate a smarter description for a task or project
 */
export async function generateDescription(title: string): Promise<string> {
  try {
    if (!checkGeminiConfig() || !genAI) {
      return '';
    }
    
    const suggestions = await getSuggestions(title, 'description');
    return suggestions[0] || '';
  } catch (error) {
    console.error('Error generating description:', error);
    return '';
  }
} 