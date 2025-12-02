import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import { Suggestion, TextHighlight } from '../../types';

interface SuggestionsPanelProps {
  suggestions: Suggestion[];
  highlights: TextHighlight[];
  onAccept: (phrase: string, replacement: string) => void;
  onIgnore: (phrase: string) => void;
  onHover: (highlightId: string | null) => void;
  hoveredId: string | null;
  colorPalette: any;
}

export interface SuggestionsPanelRef {
  scrollToSuggestion: (highlightId: string) => void;
}

const SuggestionsPanel = forwardRef<SuggestionsPanelRef, SuggestionsPanelProps>(({
  suggestions,
  highlights,
  onAccept,
  onIgnore,
  onHover,
  hoveredId,
  colorPalette,
}, ref) => {
  const suggestionRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useImperativeHandle(ref, () => ({
    scrollToSuggestion: (highlightId: string) => {
      const element = suggestionRefs.current.get(highlightId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }));

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {suggestions.map((suggestion, index) => {
        // Get the tag color for this suggestion
        const tagColor = suggestion.tag ? colorPalette[suggestion.tag] : '#6B7280';
        const firstAlternative = suggestion.alternatives[0] || suggestion.phrase;

        // Find the corresponding highlight
        const highlight = highlights.find(h => h.text === suggestion.phrase);
        const isHovered = highlight && hoveredId === highlight.id;

        return (
          <div
            key={index}
            ref={(el) => {
              if (el && highlight) {
                suggestionRefs.current.set(highlight.id, el);
              }
            }}
            className={`border rounded-lg p-2 space-y-1.5 transition-all cursor-pointer ${
              isHovered ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
            }`}
            onMouseEnter={() => highlight && onHover(highlight.id)}
            onMouseLeave={() => onHover(null)}
          >
            {/* Original -> Alternative format */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                className="text-xs font-medium px-1.5 py-0.5 rounded"
                style={{
                  backgroundColor: tagColor,
                  color: '#000000'
                }}
              >
                {suggestion.phrase}
              </span>
              <span className="text-gray-400 text-xs">→</span>
              <span className="text-xs font-medium text-gray-800">
                {firstAlternative}
              </span>
            </div>

            {/* Explanation */}
            {suggestion.explanation && (
              <div className="text-xs text-gray-600 leading-snug">
                {suggestion.explanation}
              </div>
            )}

            {/* Compact action buttons at bottom */}
            <div className="flex gap-1.5 justify-center">
              <button
                onClick={() => onAccept(suggestion.phrase, firstAlternative)}
                className="p-1.5 bg-green-600 hover:bg-green-700 text-white rounded transition flex items-center justify-center"
                title="Accept"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </button>
              <button
                onClick={() => onIgnore(suggestion.phrase)}
                className="p-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded transition flex items-center justify-center"
                title="Ignore"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
});

SuggestionsPanel.displayName = 'SuggestionsPanel';

export default SuggestionsPanel;
