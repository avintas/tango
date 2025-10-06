'use client';

import { useState } from 'react';
import { Button } from '@/components/button';
import { Textarea } from '@/components/textarea';
import { Text } from '@/components/text';

export default function ContentProcessor() {
  const [originalText, setOriginalText] = useState('');
  const [processedText, setProcessedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingSteps, setProcessingSteps] = useState<string[]>([]);
  const [wordCount, setWordCount] = useState<number | null>(null);
  const [processingTime, setProcessingTime] = useState<number | null>(null);

  const handleProcessClick = async () => {
    if (!originalText.trim()) {
      alert('Please enter some text to process');
      return;
    }

    setIsProcessing(true);
    setProcessingSteps([]);
    setProcessedText('');
    setWordCount(null);
    setProcessingTime(null);

    try {
      // Step 1: Insert into source_content table
      setProcessingSteps(['Inserting content into database...']);

      const insertResponse = await fetch('/api/source-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          original_text: originalText,
        }),
      });

      if (!insertResponse.ok) {
        throw new Error('Failed to insert content');
      }

      const insertResult = await insertResponse.json();
      const sourceId = insertResult.data.id;

      // Step 2: Process the text
      setProcessingSteps(['Processing text...']);

      const processResponse = await fetch(
        `/api/source-content/${sourceId}/process`,
        {
          method: 'POST',
        }
      );

      if (!processResponse.ok) {
        throw new Error('Failed to process text');
      }

      const processResult = await processResponse.json();

      setProcessedText(processResult.data.processed_text);
      setWordCount(processResult.data.word_count);
      setProcessingTime(processResult.data.processing_time_ms);
      setProcessingSteps(['Processing completed!']);
    } catch (error) {
      console.error('Processing error:', error);
      setProcessingSteps([
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClear = () => {
    setOriginalText('');
    setProcessedText('');
    setProcessingSteps([]);
    setWordCount(null);
    setProcessingTime(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <Text className="text-xl font-semibold text-gray-900 mb-4">
        Content Processor
      </Text>

      <div className="space-y-4">
        {/* Input Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Original Text
          </label>
          <Textarea
            value={originalText}
            onChange={e => setOriginalText(e.target.value)}
            placeholder="Paste your hockey content here..."
            rows={6}
            className="w-full"
          />
        </div>

        {/* Process Button */}
        <div className="flex space-x-4">
          <Button
            onClick={handleProcessClick}
            disabled={isProcessing || !originalText.trim()}
            color="indigo"
          >
            {isProcessing ? 'Processing...' : 'Process Content'}
          </Button>

          <Button onClick={handleClear} disabled={isProcessing} outline>
            Clear All
          </Button>
        </div>

        {/* Processing Steps */}
        {processingSteps.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Processing Steps:
            </Text>
            <ul className="space-y-1">
              {processingSteps.map((step, index) => (
                <li key={index} className="text-sm text-gray-600">
                  {isProcessing && index === processingSteps.length - 1 ? (
                    <span className="inline-block w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-2"></span>
                  ) : (
                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  )}
                  {step}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Results Section */}
        {processedText && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-3">
                <Text className="text-sm font-medium text-blue-700">
                  Word Count
                </Text>
                <Text className="text-lg font-bold text-blue-900">
                  {wordCount}
                </Text>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <Text className="text-sm font-medium text-green-700">
                  Processing Time
                </Text>
                <Text className="text-lg font-bold text-green-900">
                  {processingTime}ms
                </Text>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Processed Text
              </label>
              <Textarea
                value={processedText}
                readOnly
                rows={6}
                className="w-full bg-gray-50"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
