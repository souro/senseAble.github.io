export interface User {
  id: number;
  email: string;
  name: string;
  createdAt?: string;
}

export interface UserPreferences {
  id?: number;
  user_id: number;
  accessibility_need: AccessibilityNeed;
  reading_level: ReadingLevel;
  preferred_complexity: ComplexityLevel;
  color_palette: ColorPalette;
  other_preferences?: Record<string, unknown>;
}

export type AccessibilityNeed = 
  | 'none'
  | 'colorblind'
  | 'dyslexia'
  | 'low-vision'
  | 'cognitive'
  | 'other';

export type ReadingLevel = 
  | 'basic'
  | 'intermediate'
  | 'advanced';

export type ComplexityLevel = 
  | 'simple'
  | 'moderate'
  | 'complex';

export type FamiliarityLevel = 
  | 'not-familiar'
  | 'somewhat-familiar'
  | 'familiar';

export interface ColorPalette {
  'not-familiar': string;
  'somewhat-familiar': string;
  'familiar': string;
  textColors?: {
    'not-familiar': string;
    'somewhat-familiar': string;
    'familiar': string;
  };
  patterns?: {
    'not-familiar': string;
    'somewhat-familiar': string;
    'familiar': string;
  };
}

export interface Tag {
  id: number;
  userId: number;
  phrase: string;
  familiarityLevel: FamiliarityLevel;
  createdAt?: string;
}

export interface RephraseRequest {
  text: string;
  userId: number;
  preferences?: Partial<UserPreferences>;
}

export interface RephraseResponse {
  rephrasedText: string;
  suggestions: Suggestion[];
  version: number;
}

export interface Suggestion {
  phrase: string;
  alternatives: string[];
  position: { start: number; end: number };
  tag?: FamiliarityLevel;
  explanation?: string;
}

export interface RephraseHistory {
  id: number;
  userId: number;
  originalText: string;
  rephrasedText: string;
  version: number;
  createdAt: string;
}

export interface TextHighlight {
  id: string;
  start: number;
  end: number;
  text: string;
  familiarityLevel?: FamiliarityLevel;
  tagId?: number;
}

export interface UserContextType {
  user: User | null;
  preferences: UserPreferences | null;
  setUser: (user: User | null) => void;
  setPreferences: (preferences: UserPreferences | null) => void;
  logout: () => void;
}
