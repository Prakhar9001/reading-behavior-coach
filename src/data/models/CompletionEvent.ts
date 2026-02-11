export interface CompletionEvent {
  id: string;
  readingInstanceId: string;
  completedAt: number;
  completionFeeling: 'glad' | 'relieved' | 'disappointed' | 'neutral';
  almostQuit: boolean;
  almostQuitPage: number | null;
}
