export interface Book {
  id: string;
  title: string;
  author: string | null;
  pageCount: number;
  genre: string;
  createdAt: number;
}
