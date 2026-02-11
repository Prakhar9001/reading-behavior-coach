export const ABANDONMENT_REASONS = [
  'boring',
  'too_difficult',
  'not_what_expected',
  'wrong_timing',
  'better_option_appeared',
  'writing_style',
  'pacing_too_slow',
  'content_uncomfortable',
  'other',
] as const;

export type AbandonmentReason = typeof ABANDONMENT_REASONS[number];

export const ABANDONMENT_REASON_LABELS: Record<AbandonmentReason, string> = {
  boring: 'Boring',
  too_difficult: 'Too difficult',
  not_what_expected: 'Not what I expected',
  wrong_timing: 'Wrong timing',
  better_option_appeared: 'Better option appeared',
  writing_style: 'Writing style',
  pacing_too_slow: 'Pacing too slow',
  content_uncomfortable: 'Content made me uncomfortable',
  other: 'Other',
};
