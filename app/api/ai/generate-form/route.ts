import { NextRequest, NextResponse } from "next/server";
import { createGeminiService } from "@/lib/ai/gemini-service";
import { getAIConfig, validateAIConfig } from "@/lib/config/env";
import { AIPrompt } from "@/lib/ai/form-generator";
import { debugFormElements } from "@/lib/debug-form-elements";

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function getRateLimitKey(request: NextRequest): string {
  // Use IP address for rate limiting
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const ip = forwarded ? forwarded.split(",")[0] : realIp || "unknown";
  return `ai-form-generation:${ip}`;
}

function checkRateLimit(
  key: string,
  limit: number,
): { allowed: boolean; resetTime: number } {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute window

  const record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    // Reset or create new record
    const resetTime = now + windowMs;
    rateLimitStore.set(key, { count: 1, resetTime });
    return { allowed: true, resetTime };
  }

  if (record.count >= limit) {
    return { allowed: false, resetTime: record.resetTime };
  }

  // Increment count
  record.count++;
  rateLimitStore.set(key, record);
  return { allowed: true, resetTime: record.resetTime };
}

export async function POST(request: NextRequest) {
  try {
    // Validate AI configuration
    const configValidation = validateAIConfig();
    if (!configValidation.valid) {
      return NextResponse.json(
        {
          error: "AI_CONFIG_INVALID",
          message: "AI configuration is invalid",
          details: configValidation.errors,
        },
        { status: 500 },
      );
    }

    const config = getAIConfig();

    // Check rate limiting
    const rateLimitKey = getRateLimitKey(request);
    const rateLimit = checkRateLimit(rateLimitKey, config.rateLimitPerMinute);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "RATE_LIMIT_EXCEEDED",
          message: "Too many requests. Please try again later.",
          resetTime: rateLimit.resetTime,
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": config.rateLimitPerMinute.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": rateLimit.resetTime.toString(),
          },
        },
      );
    }

    // Parse request body
    let prompt: AIPrompt;
    try {
      prompt = await request.json();
    } catch (error) {
      return NextResponse.json(
        { error: "INVALID_JSON", message: "Invalid JSON in request body" },
        { status: 400 },
      );
    }

    // Validate prompt
    if (!prompt.description || typeof prompt.description !== "string") {
      return NextResponse.json(
        { error: "INVALID_PROMPT", message: "Description is required" },
        { status: 400 },
      );
    }

    if (prompt.description.length < 10) {
      return NextResponse.json(
        {
          error: "INVALID_PROMPT",
          message: "Description must be at least 10 characters",
        },
        { status: 400 },
      );
    }

    if (prompt.description.length > 1000) {
      return NextResponse.json(
        {
          error: "INVALID_PROMPT",
          message: "Description must be less than 1000 characters",
        },
        { status: 400 },
      );
    }

    // Set defaults
    const validatedPrompt: AIPrompt = {
      description: prompt.description.trim(),
      industry: prompt.industry || "",
      formType: prompt.formType || "custom",
      targetAudience: prompt.targetAudience || "",
      additionalRequirements: Array.isArray(prompt.additionalRequirements)
        ? prompt.additionalRequirements.slice(0, 5) // Limit to 5 requirements
        : [],
      maxFields: Math.min(Math.max(prompt.maxFields || 10, 1), 20), // Between 1-20 fields
      includeValidation: prompt.includeValidation !== false,
    };

    // Debug FormElements structure
    debugFormElements();

    // Create AI service
    const aiService = createGeminiService(config.gemini.apiKey);

    // Generate form with timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Request timeout")), config.timeout);
    });

    const generationPromise = aiService.generateForm(validatedPrompt);

    let result: any;
    try {
      result = await Promise.race([generationPromise, timeoutPromise]);
    } catch (error: any) {
      console.error("AI form generation error:", error);

      if (error.message === "Request timeout") {
        return NextResponse.json(
          { error: "TIMEOUT", message: "Request timed out. Please try again." },
          { status: 408 },
        );
      }

      return NextResponse.json(
        {
          error: "GENERATION_FAILED",
          message: "Failed to generate form. Please try again.",
          details: error.message,
        },
        { status: 500 },
      );
    }

    // Return successful response
    return NextResponse.json(
      {
        success: true,
        data: result,
        metadata: {
          requestId: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          model: config.gemini.model,
          tokensUsed: result.metadata?.tokensUsed || "unknown",
        },
      },
      {
        headers: {
          "X-RateLimit-Limit": config.rateLimitPerMinute.toString(),
          "X-RateLimit-Remaining": (
            config.rateLimitPerMinute -
            (rateLimitStore.get(rateLimitKey)?.count || 0)
          ).toString(),
          "X-RateLimit-Reset": rateLimit.resetTime.toString(),
        },
      },
    );
  } catch (error: any) {
    console.error("Unexpected error in AI form generation:", error);

    return NextResponse.json(
      {
        error: "INTERNAL_ERROR",
        message: "An unexpected error occurred. Please try again later.",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  // Health check endpoint
  const configValidation = validateAIConfig();

  return NextResponse.json({
    status: "ok",
    aiEnabled: configValidation.valid,
    errors: configValidation.valid ? [] : configValidation.errors,
    timestamp: new Date().toISOString(),
  });
}
