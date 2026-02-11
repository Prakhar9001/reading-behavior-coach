import { ReadingInstance } from '../../data/models/ReadingInstance';
import { Book } from '../../data/models/Book';
import { AbandonmentEvent } from '../../data/models/AbandonmentEvent';
import { Insight, ConfidenceLevel } from './types';

// Debug logging flag (set to true to see threshold checks)
const DEBUG = true;

const log = (...args: any[]) => {
  if (DEBUG) console.log('[InsightGenerator]', ...args);
};

/**
 * Calculate confidence level based on sample size and context
 * - Low: just met minimum threshold
 * - Medium: 1.5× minimum threshold
 * - High: ≥15 total books OR ≥10 genre-specific books
 */
const calculateConfidence = (sampleSize: number, minimum: number, isGenreSpecific = false): ConfidenceLevel => {
  // High confidence thresholds
  if (isGenreSpecific && sampleSize >= 10) return 'high';
  if (!isGenreSpecific && sampleSize >= 15) return 'high';

  // Medium confidence: 1.5× minimum
  if (sampleSize >= minimum * 1.5) return 'medium';

  // Low confidence: just met minimum
  return 'low';
};

/**
 * Calculate range for abandonment timing
 * Returns a range string like "30-40%" instead of a single number
 */
const calculateRange = (percentage: number): string => {
  const lower = Math.floor(percentage / 10) * 10;
  const upper = lower + 10;
  return `${lower}–${upper}%`;
};

export const generateInsights = (
  instances: ReadingInstance[],
  books: Book[],
  abandonmentEvents: AbandonmentEvent[]
): Insight[] => {
  const insights: Insight[] = [];
  const totalBooks = books.length;

  log(`Total books: ${totalBooks}`);

  // GLOBAL THRESHOLD: Minimum 5 books
  if (totalBooks < 5) {
    log('Below minimum threshold (5 books). Showing early state message.');
    insights.push({
      id: 'early-state',
      text: 'Your reading patterns will appear here as more history is recorded.',
      category: 'general',
      confidence: 'high', // Factual statement
      sampleSize: totalBooks,
      unit: 'books',
    });
    return insights;
  }

  // Helper to get book details for instances
  const instancesWithBook = instances.map(i => {
    const book = books.find(b => b.id === i.bookId);
    return book ? { ...i, book } : undefined;
  }).filter((i): i is ReadingInstance & { book: Book } => i !== undefined);

  const abandoned = instancesWithBook.filter(i => i.status === 'abandoned');
  const completed = instancesWithBook.filter(i => i.status === 'completed');

  log(`Abandoned: ${abandoned.length}, Completed: ${completed.length}`);

  // ========================================
  // 1. OVERALL READING OUTCOMES
  // ========================================
  // Rules:
  // - 5–7 books → counts only
  // - 8–14 books → counts + percentage
  // - 15+ books → percentage primary

  if (abandoned.length > 0 || completed.length > 0) {
    const usePercentage = totalBooks >= 8;
    let text = '';

    if (abandoned.length > 0) {
      if (totalBooks >= 15) {
        // Percentage primary
        const abandonRate = Math.round((abandoned.length / totalBooks) * 100);
        text = `In your history, ${abandonRate}% of books were stopped before finishing. Based on ${totalBooks} books recorded.`;
      } else if (usePercentage) {
        // Counts + percentage
        const abandonRate = Math.round((abandoned.length / totalBooks) * 100);
        text = `So far, you've stopped reading ${abandoned.length} out of ${totalBooks} books (${abandonRate}%).`;
      } else {
        // Counts only
        text = `So far, you've stopped reading ${abandoned.length} out of ${totalBooks} books recorded.`;
      }
    } else {
      // All completed
      text = `In your history, you've finished all ${totalBooks} books you've started.`;
    }

    insights.push({
      id: 'overall-outcomes',
      text,
      category: 'completion',
      confidence: calculateConfidence(totalBooks, 5, false),
      sampleSize: totalBooks,
      unit: 'books',
    });
    log('✓ Overall outcomes insight added');
  }

  // ========================================
  // 2. ABANDONMENT TIMING (where users stop)
  // ========================================
  // Rules:
  // - Minimum 3 abandoned books
  // - Show as RANGE (e.g., "30–40%"), not single number

  if (abandoned.length >= 3) {
    let totalPercent = 0;
    let validCount = 0;

    abandoned.forEach(inst => {
      if (inst.book.pageCount > 0) {
        totalPercent += (inst.currentPage / inst.book.pageCount) * 100;
        validCount++;
      }
    });

    if (validCount >= 3) {
      const avg = totalPercent / validCount;
      const range = calculateRange(avg);

      insights.push({
        id: 'abandonment-timing',
        text: `When you stop reading, it's usually around the ${range} mark. Based on ${validCount} abandoned books.`,
        category: 'abandonment',
        confidence: calculateConfidence(validCount, 3, false),
        sampleSize: validCount,
        unit: 'books',
      });
      log(`✓ Abandonment timing insight added (range: ${range})`);
    } else {
      log(`✗ Abandonment timing skipped (valid count: ${validCount} < 3)`);
    }
  } else {
    log(`✗ Abandonment timing skipped (abandoned: ${abandoned.length} < 3)`);
  }

  // ========================================
  // 3. GENRE-LEVEL COMPLETION PATTERNS
  // ========================================
  // Rules:
  // - Minimum total books: 8
  // - Minimum books in genre: 6
  // - Use counts for small samples
  // - Use percentages only if genre count ≥ 8

  if (totalBooks >= 8) {
    const genreStats: Record<string, { total: number, completed: number }> = {};

    instancesWithBook.forEach(inst => {
      const genre = inst.book.genre;
      if (!genreStats[genre]) {
        genreStats[genre] = { total: 0, completed: 0 };
      }
      genreStats[genre].total++;
      if (inst.status === 'completed') {
        genreStats[genre].completed++;
      }
    });

    Object.entries(genreStats).forEach(([genre, stats]) => {
      if (stats.total >= 6) {
        const usePercentage = stats.total >= 8;
        let text = '';

        if (stats.completed === 0) {
          text = `In your history, you haven't finished a ${genre} book yet. Based on ${stats.total} logged.`;
        } else if (stats.completed === stats.total) {
          text = `So far, you've finished every ${genre} book you've started (${stats.total} total).`;
        } else {
          if (usePercentage) {
            const rate = Math.round((stats.completed / stats.total) * 100);
            text = `In your history, you finish ${rate}% of ${genre} books. Based on ${stats.total} logged.`;
          } else {
            text = `So far, you've finished ${stats.completed} out of ${stats.total} ${genre} books.`;
          }
        }

        insights.push({
          id: `genre-${genre}`,
          text,
          category: 'genre',
          confidence: calculateConfidence(stats.total, 6, true),
          sampleSize: stats.total,
          unit: 'books',
        });
        log(`✓ Genre insight added for ${genre} (${stats.total} books)`);
      } else {
        log(`✗ Genre insight skipped for ${genre} (${stats.total} < 6)`);
      }
    });
  } else {
    log(`✗ Genre insights skipped (total books: ${totalBooks} < 8)`);
  }

  // ========================================
  // 4. TOP ABANDONMENT REASONS
  // ========================================
  // Rules:
  // - Minimum abandonment events: 5
  // - Always show as counts, never percentages
  // - Show top 3 reasons

  if (abandonmentEvents.length >= 5) {
    const reasonCounts: Record<string, number> = {};

    abandonmentEvents.forEach(event => {
      const reason = event.primaryReason;
      reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
    });

    // Sort by count descending and take top 3
    const topReasons = Object.entries(reasonCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);

    if (topReasons.length > 0) {
      const reasonsList = topReasons
        .map(([reason, count]) => `${reason} (${count})`)
        .join(', ');

      insights.push({
        id: 'top-reasons',
        text: `When stopping books, your most common reasons are: ${reasonsList}. Based on ${abandonmentEvents.length} events.`,
        category: 'reasons',
        confidence: calculateConfidence(abandonmentEvents.length, 5, false),
        sampleSize: abandonmentEvents.length,
        unit: 'events',
      });
      log(`✓ Top reasons insight added (${abandonmentEvents.length} events)`);
    }
  } else {
    log(`✗ Top reasons skipped (events: ${abandonmentEvents.length} < 5)`);
  }

  // ========================================
  // ORDERING: Overall → Timing → Genre → Reasons
  // ========================================
  return insights.sort((a, b) => {
    const order = ['overall-outcomes', 'abandonment-timing', 'genre', 'top-reasons'];

    // Get category-based ordering
    const getOrder = (insight: Insight): number => {
      if (insight.id === 'overall-outcomes') return 0;
      if (insight.id === 'abandonment-timing') return 1;
      if (insight.category === 'genre') return 2;
      if (insight.id === 'top-reasons') return 3;
      return 4;
    };

    return getOrder(a) - getOrder(b);
  });
};
