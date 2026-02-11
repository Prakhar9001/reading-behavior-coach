export interface ReadingInstance {
  id: string;
  bookId: string;
  startedAt: number;
  endedAt: number | null;
  status: 'in_progress' | 'completed' | 'abandoned';
  whyStarted: string | null;
  currentPage: number;
}
