/**
 * Environment variables utility
 * Provides typed access to environment variables with validation
 */

// Gemini API
export const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

// Check if Gemini API key is available
export const isGeminiConfigured = !!GEMINI_API_KEY;

// Helper function to check if Gemini API is available
export function checkGeminiConfig() {
  if (!isGeminiConfigured) {
    console.warn(
      'Gemini API key not found. Set NEXT_PUBLIC_GEMINI_API_KEY in your .env file to enable AI features.'
    );
    return false;
  }
  return true;
}

// Function to get configuration status for client components
export function getAIConfigStatus() {
  return {
    geminiAvailable: isGeminiConfigured,
  };
} 