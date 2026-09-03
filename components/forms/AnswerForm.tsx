"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import type { MDXEditorMethods } from "@mdxeditor/editor"
import { ReloadIcon } from "@radix-ui/react-icons"
import Image from "next/image"
import { useRef, useState } from "react"
import { useForm } from "react-hook-form"
import type { z } from "zod"

import { Editor } from "@/components/editor"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { AnswerFormSchema } from "@/lib"

export function AnswerForm() {
  type T = z.infer<typeof AnswerFormSchema>
  const editorRef = useRef<MDXEditorMethods>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAISubmitting, setIsAISubmitting] = useState(false)

  const form = useForm<T>({
    resolver: zodResolver(AnswerFormSchema),
    defaultValues: {
      content: ""
    }
  })

  const handleCreateAnswer = async (data: T) => {
    setIsSubmitting(true)
    console.log("Form data:", data)
    // Your submit logic here
  }

  return (
    <div className="">
      <div className="flex flex-col  justify-between gap-5 sm:flex-row sm:items-center sm:gap-2">
        <h4 className="text-lg text-dark400_light800 paragraph-semibold">Write Your Answer</h4>
        <Button
          className="btn light-border-2 gap-1.5 rounded-md border px-4 py-2.5 text-primary-500 shadow-none dark:text-primary-500"
          disabled={isAISubmitting}
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
                alt=""
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
                  <Editor value={field.value} fieldChange={field.onChange} editorRef={editorRef} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="primary-gradient w-fit"
            >
              {isSubmitting ? (
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
