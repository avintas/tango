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
  steps: ProcessingStep[];
  wordCount: number;
  charCount: number;
  processingTime: number;
}

const PROCESSING_STEPS: ProcessingStep[] = [
  {
    id: 'whitespace',
    name: 'Remove extra whitespace',
    description: 'Multiple spaces, tabs, line breaks',
    completed: false,
    processing: false,
  },
  {
    id: 'line-endings',
    name: 'Normalize line endings',
    description: 'Convert \\r\\n to \\n (Windows to Unix)',
    completed: false,
    processing: false,
  },
  {
    id: 'join-sentences',
    name: 'Join broken sentences',
    description: 'Remove line breaks within sentences',
    completed: false,
    processing: false,
  },
  {
    id: 'trim-spaces',
    name: 'Trim leading/trailing spaces',
    description: 'Clean up edges',
    completed: false,
    processing: false,
  },
  {
    id: 'empty-lines',
    name: 'Remove empty lines',
    description: 'Strip out blank lines',
    completed: false,
    processing: false,
  },
  {
    id: 'smart-quotes',
    name: 'Convert smart quotes',
    description: '"curly quotes" to "straight quotes"',
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

        resolve({
          originalText: text,
          processedText,
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
        case 'whitespace':
          processedText = processedText.replace(/[ \t]+/g, ' ');
          break;
        case 'line-endings':
          processedText = processedText.replace(/\r\n/g, '\n');
          break;
        case 'join-sentences':
          // Remove ALL line breaks, replace with spaces for continuous text flow
          processedText = processedText.replace(/\n/g, ' ');
          break;
        case 'trim-spaces':
          processedText = processedText.trim();
          break;
        case 'empty-lines':
          processedText = processedText
            .split('\n')
            .filter(line => line.trim().length > 0)
            .join('\n');
          break;
        case 'smart-quotes':
          processedText = processedText
            .replace(/[""]/g, '"')
            .replace(/['']/g, "'");
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
