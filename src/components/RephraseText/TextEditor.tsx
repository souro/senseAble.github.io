import React, { useState, useRef, useEffect } from 'react';
import { TextHighlight, FamiliarityLevel } from '../../types';

interface TextEditorProps {
  text: string;
  onTextChange: (text: string) => void;
  highlights: TextHighlight[];
  onAddHighlight: (highlight: TextHighlight) => void;
  onUpdateHighlight?: (id: string, level: FamiliarityLevel) => void;
  onRemoveHighlight?: (id: string) => void;
  colorPalette: any;
  hoveredHighlightId?: string | null;
  onHighlightHover?: (id: string | null) => void;
  acceptedReplacements?: Map<number, string>;
  onHighlightClick?: (highlightId: string) => void;
}

// SVG Pattern definitions for accessibility
const PatternDefs: React.FC = () => (
  <svg width="0" height="0" style={{ position: 'absolute' }}>
    <defs>
      {/* Dense dots pattern */}
      <pattern id="dots" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="1.5" fill="rgba(0,0,0,0.3)" />
        <circle cx="6" cy="6" r="1.5" fill="rgba(0,0,0,0.3)" />
      </pattern>
      
      {/* Diagonal lines pattern */}
      <pattern id="diagonal" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
        <line x1="0" y1="8" x2="8" y2="0" stroke="rgba(0,0,0,0.3)" strokeWidth="1.5" />
      </pattern>
      
      {/* Grid pattern */}
      <pattern id="grid" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
        <line x1="0" y1="0" x2="0" y2="10" stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
        <line x1="0" y1="0" x2="10" y2="0" stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
      </pattern>
      
      {/* Horizontal lines pattern */}
      <pattern id="horizontal" x="0" y="0" width="10" height="6" patternUnits="userSpaceOnUse">
        <line x1="0" y1="3" x2="10" y2="3" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
      </pattern>
    </defs>
  </svg>
);

const TextEditor: React.FC<TextEditorProps> = ({
  text,
  onTextChange,
  highlights,
  onAddHighlight,
  onUpdateHighlight,
  onRemoveHighlight,
  colorPalette,
  hoveredHighlightId,
  onHighlightHover,
  acceptedReplacements = new Map(),
  onHighlightClick,
}) => {
  const [selectedText, setSelectedText] = useState<{ text: string; start: number; end: number } | null>(null);
  const [showTagMenu, setShowTagMenu] = useState(false);
  const [showEditMenu, setShowEditMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [editingHighlight, setEditingHighlight] = useState<TextHighlight | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (editorRef.current && !editorRef.current.contains(e.target as Node)) {
        setShowTagMenu(false);
        setShowEditMenu(false);
      }
    };

    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowTagMenu(false);
        setShowEditMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
    };
  }, []);

  const handleTextSelect = () => {
    const selection = window.getSelection();
    if (!selection || selection.toString().trim() === '') {
      setShowTagMenu(false);
      return;
    }

    const selectedStr = selection.toString();
    const range = selection.getRangeAt(0);
    
    // Calculate position within the text
    const preSelectionRange = range.cloneRange();
    preSelectionRange.selectNodeContents(editorRef.current!);
    preSelectionRange.setEnd(range.startContainer, range.startOffset);
    const start = preSelectionRange.toString().length;

    const rect = range.getBoundingClientRect();
    
    setSelectedText({
      text: selectedStr,
      start: start,
      end: start + selectedStr.length,
    });

    setMenuPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    });

    setShowTagMenu(true);
    setShowEditMenu(false);
  };

  const handleHighlightClick = (e: React.MouseEvent, highlight: TextHighlight) => {
    e.stopPropagation();

    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setEditingHighlight(highlight);
    setMenuPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    });
    setShowEditMenu(true);
    setShowTagMenu(false);

    // Call the external click handler to scroll to suggestion
    onHighlightClick?.(highlight.id);
  };

  const handleAddTag = (level: FamiliarityLevel) => {
    if (!selectedText) return;

    const highlight: TextHighlight = {
      id: `highlight-${Date.now()}`,
      start: selectedText.start,
      end: selectedText.end,
      text: selectedText.text,
      familiarityLevel: level,
    };

    onAddHighlight(highlight);
    setShowTagMenu(false);
    setSelectedText(null);
    window.getSelection()?.removeAllRanges();
  };

  const handleUpdateTag = (level: FamiliarityLevel) => {
    if (editingHighlight && onUpdateHighlight) {
      onUpdateHighlight(editingHighlight.id, level);
    }
    setShowEditMenu(false);
    setEditingHighlight(null);
  };

  const handleRemoveTag = () => {
    if (editingHighlight && onRemoveHighlight) {
      onRemoveHighlight(editingHighlight.id);
    }
    setShowEditMenu(false);
    setEditingHighlight(null);
  };

  const renderTextWithHighlights = () => {
    if (highlights.length === 0 && acceptedReplacements.size === 0) return text;

    const sortedHighlights = [...highlights].sort((a, b) => a.start - b.start);
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    // Combine highlights and accepted replacements for rendering
    const acceptedPositions = Array.from(acceptedReplacements.keys());

    sortedHighlights.forEach((highlight, index) => {
      // Add text before highlight
      if (lastIndex < highlight.start) {
        parts.push(
          <span key={`text-${index}`}>
            {text.slice(lastIndex, highlight.start)}
          </span>
        );
      }

      // Get colors and patterns
      const familiarityLevel = highlight.familiarityLevel || 'familiar';
      const backgroundColor = colorPalette[familiarityLevel];
      const textColor = colorPalette.textColors?.[familiarityLevel];
      const pattern = colorPalette.patterns?.[familiarityLevel];
      const isHovered = highlight.id === hoveredHighlightId;

      // Build background style with pattern overlay
      const backgroundStyle: React.CSSProperties = {
        backgroundColor: isHovered ? '#BFDBFE' : backgroundColor, // Blue on hover
        color: textColor || 'inherit',
        padding: '2px 4px',
        borderRadius: '3px',
        cursor: 'pointer',
        position: 'relative',
        display: 'inline-block',
        border: isHovered ? '2px solid #3B82F6' : 'none',
      };

      // Add pattern as background image if defined
      if (pattern && pattern !== 'none' && pattern !== 'solid') {
        backgroundStyle.backgroundImage = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cuse href='%23${pattern}'/%3E%3C/defs%3E%3C/svg%3E"), linear-gradient(${backgroundColor}, ${backgroundColor})`;
        backgroundStyle.backgroundBlendMode = 'overlay';
      }

      // Add highlighted text with pattern overlay
      parts.push(
        <mark
          key={highlight.id}
          onClick={(e) => handleHighlightClick(e, highlight)}
          onMouseEnter={() => onHighlightHover?.(highlight.id)}
          onMouseLeave={() => onHighlightHover?.(null)}
          style={backgroundStyle}
          className="transition hover:opacity-80"
          title={`Click to edit - ${familiarityLevel.replace('-', ' ')}`}
        >
          {pattern && pattern !== 'none' && pattern !== 'solid' && (
            <span
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='${pattern}-inline' x='0' y='0' width='${pattern === 'dots' ? '8' : pattern === 'diagonal' ? '8' : pattern === 'horizontal' ? '10' : '10'}' height='${pattern === 'dots' ? '8' : pattern === 'diagonal' ? '8' : pattern === 'horizontal' ? '6' : '10'}' patternUnits='userSpaceOnUse'%3E${getPatternSVG(pattern)}%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23${pattern}-inline)'/%3E%3C/svg%3E")`,
                pointerEvents: 'none',
                borderRadius: '3px',
              }}
            />
          )}
          <span style={{ position: 'relative', zIndex: 1 }}>
            {text.slice(highlight.start, highlight.end)}
          </span>
        </mark>
      );

      lastIndex = highlight.end;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(
        <span key="text-end">
          {text.slice(lastIndex)}
        </span>
      );
    }

    return <>{parts}</>;
  };

  // Helper function to get SVG pattern markup
  const getPatternSVG = (pattern: string): string => {
    switch (pattern) {
      case 'dots':
        return "%3Ccircle cx='2' cy='2' r='1.5' fill='rgba(0,0,0,0.3)'/%3E%3Ccircle cx='6' cy='6' r='1.5' fill='rgba(0,0,0,0.3)'/%3E";
      case 'diagonal':
        return "%3Cline x1='0' y1='8' x2='8' y2='0' stroke='rgba(0,0,0,0.3)' stroke-width='1.5'/%3E";
      case 'grid':
        return "%3Cline x1='0' y1='0' x2='0' y2='10' stroke='rgba(0,0,0,0.2)' stroke-width='1'/%3E%3Cline x1='0' y1='0' x2='10' y2='0' stroke='rgba(0,0,0,0.2)' stroke-width='1'/%3E";
      case 'horizontal':
        return "%3Cline x1='0' y1='3' x2='10' y2='3' stroke='rgba(255,255,255,0.4)' stroke-width='1.5'/%3E";
      default:
        return '';
    }
  };

  return (
    <div className="relative" ref={editorRef}>
      <PatternDefs />
      <div
        className="w-full min-h-[300px] p-3 border-2 border-gray-300 rounded-lg focus-within:border-primary transition bg-white text-sm leading-relaxed"
        onMouseUp={handleTextSelect}
        style={{ userSelect: 'text', cursor: 'text' }}
      >
        {renderTextWithHighlights()}
      </div>

      {/* Tag Menu - For new selections */}
      {showTagMenu && (
        <div
          className="fixed z-50 bg-white border-2 border-gray-300 rounded-lg shadow-xl p-2 min-w-[200px]"
          style={{
            left: `${menuPosition.x}px`,
            top: `${menuPosition.y}px`,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="text-xs font-semibold text-gray-500 mb-2 px-2">ADD TAG</div>
          <button
            onClick={() => handleAddTag('not-familiar')}
            className="block w-full text-left px-3 py-2 hover:bg-gray-50 rounded text-sm font-medium transition"
            style={{ borderLeft: `4px solid ${colorPalette['not-familiar']}` }}
          >
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: colorPalette['not-familiar'] }}></div>
              Not at all familiar
            </div>
          </button>
          <button
            onClick={() => handleAddTag('somewhat-familiar')}
            className="block w-full text-left px-3 py-2 hover:bg-gray-50 rounded text-sm font-medium transition"
            style={{ borderLeft: `4px solid ${colorPalette['somewhat-familiar']}` }}
          >
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: colorPalette['somewhat-familiar'] }}></div>
              Somewhat familiar
            </div>
          </button>
        </div>
      )}

      {/* Edit Menu - For existing highlights */}
      {showEditMenu && editingHighlight && (
        <div
          className="fixed z-50 bg-white border-2 border-gray-300 rounded-lg shadow-xl p-2 min-w-[200px]"
          style={{
            left: `${menuPosition.x}px`,
            top: `${menuPosition.y}px`,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="text-xs font-semibold text-gray-500 mb-2 px-2">CHANGE TAG</div>
          <button
            onClick={() => handleUpdateTag('not-familiar')}
            className="block w-full text-left px-3 py-2 hover:bg-gray-50 rounded text-sm font-medium transition"
            style={{ borderLeft: `4px solid ${colorPalette['not-familiar']}` }}
          >
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: colorPalette['not-familiar'] }}></div>
              Not at all familiar
            </div>
          </button>
          <button
            onClick={() => handleUpdateTag('somewhat-familiar')}
            className="block w-full text-left px-3 py-2 hover:bg-gray-50 rounded text-sm font-medium transition"
            style={{ borderLeft: `4px solid ${colorPalette['somewhat-familiar']}` }}
          >
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: colorPalette['somewhat-familiar'] }}></div>
              Somewhat familiar
            </div>
          </button>
          <hr className="my-2" />
          <button
            onClick={handleRemoveTag}
            className="block w-full text-left px-3 py-2 hover:bg-red-50 rounded text-sm font-medium text-red-600 transition"
          >
            Remove tag
          </button>
        </div>
      )}
    </div>
  );
};

export default TextEditor;
