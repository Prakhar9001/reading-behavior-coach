export type CoachingType = 'quit_now' | 'push_to_page' | 'insufficient_data';

export type ConfidenceLevel = 'low' | 'medium' | 'high';

export interface CoachingResponse {
  type: CoachingType;
  message: string;
  confidence: ConfidenceLevel;
  sampleSize: number;
  reasoning: string;

  // Type-specific fields
  targetPage?: number; // For push_to_page
  abandonmentRate?: number; // For quit_now (as percentage)
  typicalRange?: string; // For quit_now (e.g., "30-40%")
}
