export interface AbandonmentEvent {
  id: string;
  readingInstanceId: string;
  abandonedAt: number;
  pageAbandoned: number;
  percentComplete: number;
  primaryReason: string;
  emotionalState: 'relieved' | 'guilty' | 'neutral';
  notes: string | null;
}
