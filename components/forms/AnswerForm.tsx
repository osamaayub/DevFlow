"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import type { MDXEditorMethods } from "@mdxeditor/editor"
import { ReloadIcon } from "@radix-ui/react-icons"
import Image from "next/image"
import { useRef, useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import type { z } from "zod"

import { Editor } from "@/components/editor"
import { Button, Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui"
import { AnswerFormSchema } from "@/lib"
import { createAnswer } from "@/lib/actions/answer.action"

interface Props {
  questionId: string;
  content: string; 
}

export function AnswerForm({ questionId, content }: Props) {
  type T = z.infer<typeof AnswerFormSchema>
  
  const editorRef = useRef<MDXEditorMethods>(null)
  const [isPending, startTransition] = useTransition()
  const [isAISubmitting, setIsAISubmitting] = useState(false)

  const form = useForm<T>({
    resolver: zodResolver(AnswerFormSchema),
    defaultValues: {
      content: ""
    }
  })

  const handleCreateAnswer = (data: T) => {
    startTransition(async () => {
      try {
        const result = await createAnswer({
          content: data.content,
          questionId,
        })

        if (result.success) {
          toast.success("Answer created successfully")
          form.reset()
          editorRef.current?.setMarkdown("")
        } else {
          toast.error(result?.error ? String(result.error) : "Failed to create answer")
        }
      } catch (error: unknown) {
        toast.error(`An unexpected error occurred while posting your answer.${String(error)}`)
      }
    })
  }

  const generateAIAnswer = async () => {
    if (!content) {
      toast.error("Missing question context to generate an AI answer.")
      return
    }

    setIsAISubmitting(true)
    try {
      toast.info("AI generation feature coming soon!")
    } catch {
      toast.error("Failed to generate AI answer")
    } finally {
      setIsAISubmitting(false)
    }
  }

  return (
    <div className="mt-8">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center sm:gap-2">
        <h4 className="text-lg text-dark400_light800 paragraph-semibold">Write Your Answer</h4>
        <Button
          type="button" 
          className="btn light-border-2 gap-1.5 rounded-md border px-4 py-2.5 text-primary-500 shadow-none dark:text-primary-500"
          disabled={isAISubmitting}
          onClick={generateAIAnswer}
        >
          {isAISubmitting ? (
            <>
              <ReloadIcon className="mr-2 size-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Image
                src="/icons/stars.svg"
                alt="Stars icon"
                width={12}
                height={12}
                className="object-contain"
              />
              Generate Answer with AI
            </>
          )}
        </Button>
      </div>
      
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleCreateAnswer)}
          className="mt-6 flex w-full flex-col gap-10"
        >
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem className="flex w-full flex-col gap-2.5">
                <FormControl>
                  <Editor 
                    value={field.value} 
                    fieldChange={field.onChange} 
                    editorRef={editorRef} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isPending || !form.formState.isDirty}
              className="primary-gradient w-fit"
            >
              {isPending ? (
                <>
                  <ReloadIcon className="mr-2 size-4 animate-spin" />
                  Posting...
                </>
              ) : (
                "Post Answer"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

export default AnswerForm