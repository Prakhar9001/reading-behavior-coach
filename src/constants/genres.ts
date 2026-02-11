export const GENRES = [
  'Fiction',
  'Mystery',
  'Thriller',
  'Science Fiction',
  'Fantasy',
  'Romance',
  'Literary Fiction',
  'Historical Fiction',
  'Horror',
  'Non-Fiction',
  'Biography',
  'Memoir',
  'Self-Help',
  'Business',
  'History',
  'Science',
  'Philosophy',
  'Poetry',
] as const;

export type Genre = typeof GENRES[number];
