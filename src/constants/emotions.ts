export const EMOTIONAL_STATES = ['relieved', 'guilty', 'neutral'] as const;

export type EmotionalState = typeof EMOTIONAL_STATES[number];

export const EMOTIONAL_STATE_LABELS: Record<EmotionalState, string> = {
  relieved: 'Relieved',
  guilty: 'Guilty',
  neutral: 'Neutral',
};

export const COMPLETION_FEELINGS = ['glad', 'relieved', 'disappointed', 'neutral'] as const;

export type CompletionFeeling = typeof COMPLETION_FEELINGS[number];

export const COMPLETION_FEELING_LABELS: Record<CompletionFeeling, string> = {
  glad: 'Glad I finished',
  relieved: 'Relieved it\'s over',
  disappointed: 'Disappointed',
  neutral: 'Neutral',
};
