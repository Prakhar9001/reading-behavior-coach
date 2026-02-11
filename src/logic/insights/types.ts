export type ConfidenceLevel = 'low' | 'medium' | 'high';

export type InsightCategory = 'general' | 'abandonment' | 'completion' | 'genre' | 'reasons';

export interface Insight {
  id: string;
  text: string;
  category: InsightCategory;
  confidence: ConfidenceLevel;
  sampleSize: number;
  unit?: 'books' | 'events'; // For sample size display context
}
