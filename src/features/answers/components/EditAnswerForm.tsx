"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import type { MDXEditorMethods } from "@mdxeditor/editor"
import { ReloadIcon } from "@radix-ui/react-icons"
import { useRouter } from "next/navigation"
import { useRef, useTransition } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import type { z } from "zod"

import { editAnswer } from "@/features/answers/actions"
import { Editor } from "@/shared/components/editor"
import { Button, Form, FormControl, FormField, FormItem, FormMessage } from "@/shared/components/ui"
import { AnswerFormSchema } from "@/shared/lib/validation"

type AnswerFormValues = z.infer<typeof AnswerFormSchema>

interface EditAnswerFormProps {
  answerId: string
  content: string
  /** Where to go after saving or cancelling */
  returnTo: string
}

const EditAnswerForm = ({ answerId, content, returnTo }: EditAnswerFormProps) => {
  const router = useRouter()
  const editorRef = useRef<MDXEditorMethods>(null)
  const [isPending, startTransition] = useTransition()

  const form = useForm<AnswerFormValues>({
    resolver: zodResolver(AnswerFormSchema),
    defaultValues: { content },
  })

  const handleSubmit = (values: AnswerFormValues) => {
    startTransition(async () => {
      const result = await editAnswer({ answerId, content: values.content })

      if (!result.success) {
        toast.error(result.error?.message ?? "Could not update your answer.")
        return
      }

      toast.success("Answer updated successfully!")
      router.push(returnTo)
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="flex w-full flex-col gap-10">
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

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => router.push(returnTo)}
            className="light-border-2 text-dark400_light700 min-h-12 px-6"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isPending || !form.formState.isDirty}
            className="primary-gradient min-h-12 px-8 font-semibold !text-light-900"
          >
            {isPending ? (
              <>
                <ReloadIcon className="mr-2 size-4 animate-spin" />
                Saving…
              </>
            ) : (
              "Save changes"
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default EditAnswerForm
