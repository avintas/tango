// API Routes for Modern Source Content Management
// Clean, focused endpoints for Onlyhockey.com

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { generateContent, ContentType } from '@/lib/gemini';
import { processText } from '@/lib/text-processing';

// ========================================
// SOURCE CONTENT API ENDPOINTS
// ========================================

/**
 * POST /api/source-content
 * Create new source content
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { originalText, sourceName, sourceUrl, contentType } = body;

    if (!originalText?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Original text is required',
        },
        { status: 400 }
      );
    }

    const supabase = createClient();

    const { data, error } = await supabase
      .from('source_content')
      .insert({
        original_text: originalText,
        source_name: sourceName,
        source_url: sourceUrl,
        content_type: contentType || 'general',
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Source content created successfully',
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/source-content
 * Get all source content for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const contentType = searchParams.get('contentType');
    const limit = parseInt(searchParams.get('limit') || '50');

    const supabase = createClient();

    let query = supabase
      .from('source_content')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (status) {
      query = query.eq('status', status);
    }

    if (contentType) {
      query = query.eq('content_type', contentType);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      data,
      count: data?.length || 0,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/source-content/[id]
 * Get specific source content
 */
export async function GET_SINGLE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('source_content')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    if (!data) {
      return NextResponse.json(
        {
          success: false,
          error: 'Source content not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/source-content/[id]
 * Update source content
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const supabase = createClient();

    const { data, error } = await supabase
      .from('source_content')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Source content updated successfully',
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/source-content/[id]
 * Delete source content
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();

    const { error } = await supabase
      .from('source_content')
      .delete()
      .eq('id', params.id);

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Source content deleted successfully',
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// ========================================
// PROCESSING API ENDPOINTS
// ========================================

/**
 * POST /api/source-content/[id]/process
 * Process source content text
 */
export async function PROCESS_TEXT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();

    // Get the source content
    const { data: sourceContent, error: fetchError } = await supabase
      .from('source_content')
      .select('*')
      .eq('id', params.id)
      .single();

    if (fetchError || !sourceContent) {
      throw new Error('Source content not found');
    }

    // Update status to processing
    await supabase
      .from('source_content')
      .update({ status: 'processing' })
      .eq('id', params.id);

    // Process the text using your existing function
    const processingResult = await processText(sourceContent.original_text);

    // Update with processed text
    const { data, error } = await supabase
      .from('source_content')
      .update({
        processed_text: processingResult.processedText,
        word_count: processingResult.wordCount,
        processing_time_ms: processingResult.processingTime,
        status: 'completed',
        processed_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    // Log the processing step
    await supabase.from('processing_log').insert({
      source_content_id: params.id,
      step_name: 'text_processing',
      status: 'completed',
      result_data: {
        originalWordCount: processingResult.wordCount,
        processedWordCount: processingResult.wordCount,
        steps: processingResult.steps,
      },
    });

    return NextResponse.json({
      success: true,
      data,
      processingResult,
      message: 'Text processed successfully',
    });
  } catch (error) {
    // Update status to failed
    const supabase = createClient();
    await supabase
      .from('source_content')
      .update({
        status: 'failed',
        processing_notes:
          error instanceof Error ? error.message : 'Unknown error',
      })
      .eq('id', params.id);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/source-content/[id]/generate
 * Generate content from source using Gemini AI
 */
export async function GENERATE_CONTENT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { contentType, numItems = 5 } = body;

    if (!contentType) {
      return NextResponse.json(
        {
          success: false,
          error: 'Content type is required',
        },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Get the source content
    const { data: sourceContent, error: fetchError } = await supabase
      .from('source_content')
      .select('*')
      .eq('id', params.id)
      .single();

    if (fetchError || !sourceContent) {
      throw new Error('Source content not found');
    }

    if (!sourceContent.processed_text) {
      return NextResponse.json(
        {
          success: false,
          error: 'Source content must be processed before generation',
        },
        { status: 400 }
      );
    }

    // Generate content using your existing Gemini function
    const generationResult = await generateContent(
      sourceContent.processed_text,
      contentType as ContentType,
      numItems
    );

    if (!generationResult.success) {
      throw new Error(generationResult.error || 'Generation failed');
    }

    // Update source content with generated content
    const updateData: any = {
      processing_time_ms: generationResult.processingTime,
    };

    // Store generated content based on type
    switch (contentType) {
      case 'trivia_questions':
        updateData.generated_trivia = generationResult.content;
        break;
      case 'quotes':
        updateData.generated_quotes = generationResult.content;
        break;
      case 'stories':
        updateData.generated_stories = generationResult.content;
        break;
      case 'factoids':
        updateData.generated_facts = generationResult.content;
        break;
    }

    const { data, error } = await supabase
      .from('source_content')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    // Log the generation step
    await supabase.from('processing_log').insert({
      source_content_id: params.id,
      step_name: `generate_${contentType}`,
      status: 'completed',
      result_data: {
        itemsGenerated: generationResult.content.length,
        processingTime: generationResult.processingTime,
      },
    });

    return NextResponse.json({
      success: true,
      data,
      generatedContent: generationResult.content,
      message: `Generated ${generationResult.content.length} ${contentType.replace('_', ' ')}`,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// ========================================
// BATCH PROCESSING API
// ========================================

/**
 * POST /api/source-content/batch-process
 * Process multiple sources at once
 */
export async function BATCH_PROCESS(request: NextRequest) {
  try {
    const body = await request.json();
    const { sourceIds, contentType, numItems = 5 } = body;

    if (!sourceIds || !Array.isArray(sourceIds) || sourceIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Source IDs array is required',
        },
        { status: 400 }
      );
    }

    const results = [];
    const errors = [];

    for (const sourceId of sourceIds) {
      try {
        // Process text first
        const processResponse = await fetch(
          `${request.nextUrl.origin}/api/source-content/${sourceId}/process`,
          { method: 'POST' }
        );

        if (!processResponse.ok) {
          throw new Error(`Failed to process source ${sourceId}`);
        }

        // Generate content
        const generateResponse = await fetch(
          `${request.nextUrl.origin}/api/source-content/${sourceId}/generate`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contentType, numItems }),
          }
        );

        if (!generateResponse.ok) {
          throw new Error(`Failed to generate content for source ${sourceId}`);
        }

        const generateData = await generateResponse.json();
        results.push({
          sourceId,
          success: true,
          generatedContent: generateData.generatedContent,
        });
      } catch (error) {
        errors.push({
          sourceId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      success: true,
      results: {
        totalSources: sourceIds.length,
        successfulSources: results.length,
        failedSources: errors.length,
        results,
        errors,
      },
      message: `Processed ${results.length}/${sourceIds.length} sources successfully`,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// ========================================
// PROCESSING LOG API
// ========================================

/**
 * GET /api/processing-log
 * Get processing logs for a source
 */
export async function GET_PROCESSING_LOGS(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sourceContentId = searchParams.get('sourceContentId');

    if (!sourceContentId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Source content ID is required',
        },
        { status: 400 }
      );
    }

    const supabase = createClient();

    const { data, error } = await supabase
      .from('processing_log')
      .select('*')
      .eq('source_content_id', sourceContentId)
      .order('started_at', { ascending: false });

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      data,
      count: data?.length || 0,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
