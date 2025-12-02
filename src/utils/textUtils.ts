import { TextHighlight } from '../types';

export const generateHighlightId = (): string => {
  return `highlight-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const getSelectedText = (): { text: string; start: number; end: number } | null => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;

  const range = selection.getRangeAt(0);
  const text = range.toString();
  
  if (!text) return null;

  return {
    text,
    start: range.startOffset,
    end: range.endOffset
  };
};

export const applyHighlightsToText = (
  text: string,
  highlights: TextHighlight[]
): string => {
  if (highlights.length === 0) return text;

  // Sort highlights by start position
  const sortedHighlights = [...highlights].sort((a, b) => a.start - b.start);

  let result = '';
  let lastIndex = 0;

  sortedHighlights.forEach((highlight) => {
    // Add text before highlight
    result += text.slice(lastIndex, highlight.start);
    
    // Add highlighted text
    const highlightedText = text.slice(highlight.start, highlight.end);
    result += `<mark data-id="${highlight.id}" data-level="${highlight.familiarityLevel || ''}">${highlightedText}</mark>`;
    
    lastIndex = highlight.end;
  });

  // Add remaining text
  result += text.slice(lastIndex);

  return result;
};

export const removeOverlappingHighlights = (
  highlights: TextHighlight[]
): TextHighlight[] => {
  if (highlights.length <= 1) return highlights;

  const sorted = [...highlights].sort((a, b) => a.start - b.start);
  const result: TextHighlight[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];
    const last = result[result.length - 1];

    // If current doesn't overlap with last, add it
    if (current.start >= last.end) {
      result.push(current);
    } else {
      // If current overlaps, keep the one with higher priority (not-familiar > somewhat-familiar > familiar)
      const priorityMap = { 'not-familiar': 3, 'somewhat-familiar': 2, 'familiar': 1 };
      const currentPriority = priorityMap[current.familiarityLevel || 'familiar'];
      const lastPriority = priorityMap[last.familiarityLevel || 'familiar'];

      if (currentPriority > lastPriority) {
        result[result.length - 1] = current;
      }
    }
  }

  return result;
};

export const findWordBoundaries = (text: string, start: number, end: number): { start: number; end: number } => {
  // Expand selection to word boundaries
  let newStart = start;
  let newEnd = end;

  // Expand backward to start of word
  while (newStart > 0 && /\w/.test(text[newStart - 1])) {
    newStart--;
  }

  // Expand forward to end of word
  while (newEnd < text.length && /\w/.test(text[newEnd])) {
    newEnd++;
  }

  return { start: newStart, end: newEnd };
};
