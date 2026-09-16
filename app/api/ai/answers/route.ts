import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"
import { NextResponse } from "next/server"

import { AIAnswerSchema, HandleError, ValidationError } from "@/lib"

export async function POST(req: Request) {
  const { question, content } = await req.json()

  try {
    const validatedData = AIAnswerSchema.safeParse({ question, content })

    if (!validatedData.success) {
      throw new ValidationError(validatedData.error.flatten().fieldErrors)
    }
    const { text } = await generateText({
      model: openai("gpt-5.4-mini"),
      prompt: `Generate a markdown-formatted response to the following question: ${question}. Base it on the provided content: ${content}`,
      instructions:
        "You are a helpful assistant that provides informative responses in markdown format. Use appropriate markdown syntax for headings, lists, code blocks, and emphasis where necessary. For code blocks, use short-form smaller case language identifiers (e.g., 'js' for JavaScript, 'py' for Python, 'ts' for TypeScript, 'html' for HTML, 'css' for CSS, etc.)."
    })
    return NextResponse.json({ success: true, data: text }, { status: 200 })
  } catch (error) {
    return HandleError(new Error(String(error))) as unknown as APIErrorResponse
  }
}
