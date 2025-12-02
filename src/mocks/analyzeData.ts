import { TextHighlight, Suggestion, FamiliarityLevel } from '../types';
import exampleTextsData from './exampleTexts.json';

/**
 * Mock data for text analysis and rephrase suggestions
 * Loads from JSON file for easy demo content management
 */

// Map JSON tag names to FamiliarityLevel type
const tagMapping: Record<string, FamiliarityLevel> = {
  'not_familiar': 'not-familiar',
  'somewhat_familiar': 'somewhat-familiar',
  'familiar': 'familiar',
};

/**
 * Get example text by ID (defaults to first example)
 */
export const getExampleById = (id: number = 1) => {
  return exampleTextsData.examples.find(ex => ex.id === id) || exampleTextsData.examples[0];
};

/**
 * Get all available examples
 */
export const getAllExamples = () => {
  return exampleTextsData.examples;
};

/**
 * Convert JSON tagged phrases to TextHighlight format
 */
export const getHighlightsFromExample = (exampleId: number = 1): TextHighlight[] => {
  const example = getExampleById(exampleId);
  
  return example.tagged_phrases.map((phrase, index) => ({
    id: `highlight-${index}-${phrase.start_index}`,
    start: phrase.start_index,
    end: phrase.end_index,
    text: phrase.phrase,
    familiarityLevel: tagMapping[phrase.tag],
  }));
};

/**
 * Get suggestions from JSON example data
 */
export const getSuggestionsFromExample = (exampleId: number = 1): Suggestion[] => {
  const example = getExampleById(exampleId);

  return example.tagged_phrases.map(phrase => ({
    phrase: phrase.phrase,
    alternatives: phrase.rephrased_versions.map(v => v.replacement),
    position: { start: phrase.start_index, end: phrase.end_index },
    tag: tagMapping[phrase.tag],
    explanation: phrase.explanation || 'Consider using simpler language for better clarity.',
  }));
};

/**
 * Analyzes text and returns highlights for complex phrases
 * Uses JSON data if text matches an example, otherwise uses fallback logic
 */
export const mockAnalyzeText = (text: string): TextHighlight[] => {
  // Check if this text matches any example
  const matchingExample = exampleTextsData.examples.find(
    ex => ex.original_text.trim() === text.trim()
  );
  
  if (matchingExample) {
    return getHighlightsFromExample(matchingExample.id);
  }
  
  // Fallback: simple phrase detection for custom text
  return detectComplexPhrases(text);
};

/**
 * Generates rephrase suggestions for highlighted phrases
 */
export const mockGetSuggestions = (highlights: TextHighlight[], text: string): Suggestion[] => {
  // Check if this text matches any example
  const matchingExample = exampleTextsData.examples.find(
    ex => ex.original_text.trim() === text.trim()
  );
  
  if (matchingExample) {
    return getSuggestionsFromExample(matchingExample.id);
  }
  
  // Fallback: generate generic suggestions
  return highlights.map(h => ({
    phrase: h.text,
    alternatives: [
      `simpler version of "${h.text}"`,
      `easier "${h.text}"`
    ],
    position: { start: h.start, end: h.end },
  }));
};

/**
 * Generate gentle rewrite - minor modifications based on tags
 * Replaces only "not-familiar" tagged phrases with simpler alternatives
 */
export const mockGetGentleRewrite = (text: string, highlights: TextHighlight[]): string => {
  // Check if this text matches any example
  const matchingExample = exampleTextsData.examples.find(
    ex => ex.original_text.trim() === text.trim()
  );

  if (matchingExample && (matchingExample as any).gentle_rewrite) {
    // Return the pre-written gentle rewrite from JSON
    return (matchingExample as any).gentle_rewrite;
  }

  // Fallback: replace only "not-familiar" tagged phrases
  let rewrittenText = text;
  const notFamiliarHighlights = highlights.filter(h => h.familiarityLevel === 'not-familiar');
  notFamiliarHighlights.sort((a, b) => b.start - a.start).forEach(h => {
    const simplifiedVersion = `simpler ${h.text}`;
    rewrittenText = rewrittenText.slice(0, h.start) + simplifiedVersion + rewrittenText.slice(h.end);
  });

  return rewrittenText;
};

/**
 * Generate full rewrite - deeper modifications of content
 * Replaces all tagged phrases with simpler alternatives
 */
export const mockGetFullRewrite = (text: string, highlights: TextHighlight[]): string => {
  // Check if this text matches any example
  const matchingExample = exampleTextsData.examples.find(
    ex => ex.original_text.trim() === text.trim()
  );

  if (matchingExample && (matchingExample as any).full_rewrite) {
    // Return the pre-written full rewrite from JSON
    return (matchingExample as any).full_rewrite;
  }

  // Fallback: replace all tagged phrases
  let rewrittenText = text;
  highlights.sort((a, b) => b.start - a.start).forEach(h => {
    const simplifiedVersion = `simpler ${h.text}`;
    rewrittenText = rewrittenText.slice(0, h.start) + simplifiedVersion + rewrittenText.slice(h.end);
  });

  return rewrittenText;
};

/**
 * Handle custom chat instruction and return modified text
 * If text matches Example 3 or 4, returns Example 5
 */
export const mockCustomRephrase = (text: string, instruction: string): string => {
  // Check if this text matches Example 3 or Example 4
  const matchingExample = exampleTextsData.examples.find(
    ex => (ex.id === 3 || ex.id === 4) && ex.original_text.trim() === text.trim()
  );

  if (matchingExample) {
    // Return Example 5 as the custom rephrased version
    const example5 = exampleTextsData.examples.find(ex => ex.id === 5);
    if (example5) {
      return example5.original_text;
    }
  }

  // Fallback: append instruction effect to the text
  return `${text}\n\n[Modified based on: "${instruction}"]`;
};

/**
 * Fallback phrase detection for non-example text
 */
const detectComplexPhrases = (text: string): TextHighlight[] => {
  const highlights: TextHighlight[] = [];
  const lowerText = text.toLowerCase();

  const fallbackPhrases = [
    { text: 'large language model', level: 'not-familiar' as FamiliarityLevel },
    { text: 'LLM agents', level: 'not-familiar' as FamiliarityLevel },
    { text: 'composable patterns', level: 'somewhat-familiar' as FamiliarityLevel },
    { text: 'complex frameworks', level: 'somewhat-familiar' as FamiliarityLevel },
  ];

  fallbackPhrases.forEach((phrase, index) => {
    const searchText = phrase.text.toLowerCase();
    let startIndex = 0;

    while (startIndex < lowerText.length) {
      const start = lowerText.indexOf(searchText, startIndex);
      if (start === -1) break;

      highlights.push({
        id: `highlight-${index}-${start}`,
        start,
        end: start + phrase.text.length,
        text: text.slice(start, start + phrase.text.length),
        familiarityLevel: phrase.level,
      });

      startIndex = start + phrase.text.length;
    }
  });

  return highlights.sort((a, b) => a.start - b.start);
};
