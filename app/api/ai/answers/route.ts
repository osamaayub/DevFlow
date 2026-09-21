import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"
import { NextResponse } from "next/server"

import { AIAnswerSchema, HandleError, ValidationError } from "@/lib"

export async function POST(req: Request) {
  const { question, content, userAnswer } = await req.json()

  try {
    const validatedData = AIAnswerSchema.safeParse({ question, content })

    if (!validatedData.success) {
      throw new ValidationError(validatedData.error.flatten().fieldErrors)
    }
    const { text } = await generateText({
      model: openai("gpt-5.4-mini"),
      prompt: `Generate a markdown-formatted response to the following question: "${question}".

Consider the provided context:
**Context:** ${content}

Also, prioritize and incorporate the user's answer when formulating your response:
**User's Answer:** ${userAnswer}

Prioritize the user's answer only if it's correct. If it's incomplete or incorrect, improve or correct it while keeping the response concise and to the point.
Provide the final answer in markdown format.`,
      instructions:
        "You are a helpful assistant that provides informative responses in markdown format. Use appropriate markdown syntax for headings, lists, code blocks, and emphasis where necessary. For code blocks, use short-form smaller case language identifiers (e.g., 'js' for JavaScript, 'py' for Python, 'ts' for TypeScript, 'html' for HTML, 'css' for CSS, etc.)."
    })
    return NextResponse.json({ success: true, data: text }, { status: 200 })
  } catch (error) {
    const errorMessage = String(error)
    
    // Handle specific OpenAI API errors
    if (errorMessage.includes("no credits remaining") || errorMessage.includes("credits")) {
      return HandleError(
        new Error("OpenAI API credits exhausted. Please add credits to your OpenAI account at https://platform.openai.com/settings/organization/billing/"),
        "api",
        402,
        "API Credits Required"
      ) as unknown as APIErrorResponse
    }
    
    if (errorMessage.includes("API key") || errorMessage.includes("authentication")) {
      return HandleError(
        new Error("OpenAI API key is missing or invalid. Please check your OPENAI_API_KEY environment variable."),
        "api",
        401,
        "Authentication Error"
      ) as unknown as APIErrorResponse
    }
    
    if (errorMessage.includes("rate limit") || errorMessage.includes("429")) {
      return HandleError(
        new Error("OpenAI API rate limit exceeded. Please try again later."),
        "api",
        429,
        "Rate Limit Exceeded"
      ) as unknown as APIErrorResponse
    }
    
    // Generic error handling
    return HandleError(new Error(errorMessage), "api", 500, "Failed to generate AI answer") as unknown as APIErrorResponse
  }
}
