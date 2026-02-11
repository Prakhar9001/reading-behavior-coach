export type Book = {
  id: string;
  title: string;
  author: string | null;
  pageCount: number;
  genre: string;
  createdAt: number;
};

export type ReadingInstance = {
  id: string;
  bookId: string;
  startedAt: number;
  endedAt: number | null;
  status: 'in_progress' | 'completed' | 'abandoned';
  whyStarted: string | null;
  currentPage: number;
};

export type AbandonmentEvent = {
  id: string;
  readingInstanceId: string;
  abandonedAt: number;
  pageAbandoned: number;
  percentComplete: number;
  primaryReason: string;
  emotionalState: 'relieved' | 'guilty' | 'neutral';
  notes: string | null;
};

export type CompletionEvent = {
  id: string;
  readingInstanceId: string;
  completedAt: number;
  completionFeeling: 'glad' | 'relieved' | 'disappointed' | 'neutral';
  almostQuit: boolean;
  almostQuitPage: number | null;
};

export type Challenge = {
  id: string;
  readingInstanceId: string;
  challengedAt: number;
  currentPage: number;
  doubtReason: string;
  systemRecommendation: 'quit_now' | 'push_to_page' | 'insufficient_data';
  recommendationDetails: string | null;
  userDecision: 'continued' | 'quit' | null;
};
