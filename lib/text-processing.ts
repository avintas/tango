export interface ProcessingStep {
  id: string;
  name: string;
  description: string;
  completed: boolean;
  processing: boolean;
}

export interface ProcessingResult {
  originalText: string;
  processedText: string;
  chunks: string[]; // Array of text chunks
  steps: ProcessingStep[];
  wordCount: number;
  charCount: number;
  processingTime: number;
}

const PROCESSING_STEPS: ProcessingStep[] = [
  {
    id: 'line-endings',
    name: 'Normalize line endings',
    description: 'Convert \\r\\n to \\n (Windows to Unix)',
    completed: false,
    processing: false,
  },
  {
    id: 'remove-decorators',
    name: 'Remove visual decorators',
    description: "Bullets, boxes, arrows (AI doesn't need them)",
    completed: false,
    processing: false,
  },
  {
    id: 'remove-unicode',
    name: 'Clean invisible characters',
    description: 'Zero-width spaces, byte order marks',
    completed: false,
    processing: false,
  },
  {
    id: 'smart-quotes',
    name: 'Normalize quotes',
    description: '"curly" to "straight" quotes',
    completed: false,
    processing: false,
  },
  {
    id: 'normalize-caps',
    name: 'Normalize capitalization',
    description: 'Title case (preserve acronyms)',
    completed: false,
    processing: false,
  },
  {
    id: 'join-sentences',
    name: 'Join broken sentences',
    description: 'Create continuous text flow',
    completed: false,
    processing: false,
  },
  {
    id: 'fix-spacing',
    name: 'Fix spacing issues',
    description: 'Double spaces, space before punctuation',
    completed: false,
    processing: false,
  },
  {
    id: 'final-cleanup',
    name: 'Final cleanup',
    description: 'Trim edges, normalize whitespace',
    completed: false,
    processing: false,
  },
];

export function processText(text: string): Promise<ProcessingResult> {
  return new Promise(resolve => {
    const startTime = Date.now();
    let processedText = text;
    const steps = PROCESSING_STEPS.map(step => ({ ...step }));

    // Process each step with a small delay for visual feedback
    const processStep = async (stepIndex: number) => {
      if (stepIndex >= steps.length) {
        const endTime = Date.now();
        const wordCount = processedText
          .trim()
          .split(/\s+/)
          .filter(word => word.length > 0).length;
        const charCount = processedText.length;

        // Smart chunking: only chunk large content (>= 600 words)
        const chunks = smartChunk(processedText);

        resolve({
          originalText: text,
          processedText,
          chunks,
          steps,
          wordCount,
          charCount,
          processingTime: endTime - startTime,
        });
        return;
      }

      const step = steps[stepIndex];
      step.processing = true;

      // Simulate processing time for visual feedback
      await new Promise(resolve => setTimeout(resolve, 300));

      // Apply the actual processing
      switch (step.id) {
        case 'line-endings':
          processedText = processedText.replace(/\r\n/g, '\n');
          break;

        case 'remove-decorators':
          // Remove bullets and replace with period for sentence separation
          processedText = processedText.replace(/[•●○◦▪▫]/g, '. ');
          // Remove boxes, arrows, and other visual elements
          processedText = processedText.replace(/[□■◻◼►▸▹◄◂]/g, '');
          // Remove em dashes and en dashes (replace with regular dash)
          processedText = processedText.replace(/[—–]/g, '-');
          // Remove other common decorative characters
          processedText = processedText.replace(/[†‡§¶]/g, '');
          break;

        case 'remove-unicode':
          // Remove zero-width spaces and joiners
          processedText = processedText.replace(/[\u200B-\u200D\uFEFF]/g, '');
          // Remove byte order marks
          processedText = processedText.replace(/\uFEFF/g, '');
          // Remove soft hyphens
          processedText = processedText.replace(/\u00AD/g, '');
          break;

        case 'smart-quotes':
          processedText = processedText
            .replace(/[""]/g, '"')
            .replace(/['']/g, "'")
            .replace(/[«»]/g, '"')
            .replace(/[‹›]/g, "'");
          break;

        case 'normalize-caps':
          // Smart capitalization: preserve acronyms (2-4 consecutive caps)
          // but normalize long runs of caps
          processedText = processedText.replace(/\b([A-Z]{5,})\b/g, match => {
            // Convert to title case: first letter cap, rest lowercase
            return match.charAt(0) + match.slice(1).toLowerCase();
          });
          break;

        case 'join-sentences':
          // Remove ALL line breaks, replace with spaces for continuous text flow
          processedText = processedText.replace(/\n+/g, ' ');
          break;

        case 'fix-spacing':
          // Fix double spaces
          processedText = processedText.replace(/\s{2,}/g, ' ');
          // Remove space before punctuation
          processedText = processedText.replace(/\s+([.,!?;:])/g, '$1');
          // Ensure space after punctuation (but not in numbers like 1,234)
          processedText = processedText.replace(
            /([.,!?;:])([A-Za-z])/g,
            '$1 $2'
          );
          // Fix multiple periods (ellipsis)
          processedText = processedText.replace(/\.{4,}/g, '...');
          break;

        case 'final-cleanup':
          // Trim leading/trailing spaces
          processedText = processedText.trim();
          // Fix multiple consecutive periods from bullet removal
          processedText = processedText.replace(/\.{2,}\s/g, '. ');
          // Remove any remaining double spaces
          processedText = processedText.replace(/\s{2,}/g, ' ');
          break;
      }

      step.processing = false;
      step.completed = true;

      // Process next step
      processStep(stepIndex + 1);
    };

    // Start processing
    processStep(0);
  });
}

export function getInitialSteps(): ProcessingStep[] {
  return PROCESSING_STEPS.map(step => ({ ...step }));
}

/**
 * Smart chunking: Split large content into paragraph-based chunks
 * Only chunks content >= 600 words
 * @param text - Processed text to chunk
 * @param targetWords - Target words per chunk (default: 500)
 * @param minWordsToChunk - Minimum words to trigger chunking (default: 600)
 * @returns Array of text chunks
 */
export function smartChunk(
  text: string,
  targetWords: number = 500,
  minWordsToChunk: number = 600
): string[] {
  const wordCount = text
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 0).length;

  // If content is small, don't chunk it
  if (wordCount < minWordsToChunk) {
    return [text];
  }

  // Split on paragraph boundaries (double newlines or single newlines)
  // After our processing, text is mostly continuous, so we look for sentence clusters
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0);

  // If no clear paragraphs, try splitting on periods followed by capital letters
  // This creates "semantic paragraphs"
  let workingParagraphs = paragraphs;
  if (paragraphs.length === 1) {
    // Split on sentence boundaries: ". [Capital Letter]"
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    // Group sentences into pseudo-paragraphs (~3-5 sentences each)
    workingParagraphs = [];
    let tempPara = '';
    let sentenceCount = 0;

    for (const sentence of sentences) {
      tempPara += sentence + ' ';
      sentenceCount++;

      if (sentenceCount >= 4) {
        workingParagraphs.push(tempPara.trim());
        tempPara = '';
        sentenceCount = 0;
      }
    }

    if (tempPara.trim().length > 0) {
      workingParagraphs.push(tempPara.trim());
    }
  }

  // Now group paragraphs into chunks of ~targetWords
  const chunks: string[] = [];
  let currentChunk: string[] = [];
  let currentWordCount = 0;

  for (const para of workingParagraphs) {
    const paraWords = para.split(/\s+/).filter(word => word.length > 0).length;

    // If adding this paragraph exceeds target and we have content, start new chunk
    if (currentWordCount + paraWords > targetWords && currentChunk.length > 0) {
      chunks.push(currentChunk.join('\n\n'));
      currentChunk = [para];
      currentWordCount = paraWords;
    } else {
      currentChunk.push(para);
      currentWordCount += paraWords;
    }
  }

  // Add remaining content
  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join('\n\n'));
  }

  return chunks.length > 0 ? chunks : [text];
}
