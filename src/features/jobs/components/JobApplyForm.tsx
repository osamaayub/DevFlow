"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { LoaderIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { applyToJob } from "@/features/jobs/actions"
import {
  Button,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from "@/shared/components/ui"
import ROUTES from "@/shared/constants/route"
import { JobApplicationFormSchema } from "@/shared/lib/validation"

type JobApplicationFormValues = z.infer<typeof JobApplicationFormSchema>

interface JobApplyFormProps {
  jobId: string
  defaultName?: string
  defaultEmail?: string
}

const labelClasses = "paragraph-semibold text-dark400_light800"
const inputClasses =
  "paragraph-regular background-light700_dark300 light-border-2 text-dark300_light700 no-focus min-h-14 border"

const JobApplyForm = ({ jobId, defaultName = "", defaultEmail = "" }: JobApplyFormProps) => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const form = useForm<JobApplicationFormValues>({
    resolver: zodResolver(JobApplicationFormSchema),
    defaultValues: {
      applicantName: defaultName,
      applicantEmail: defaultEmail,
      phone: "",
      resumeUrl: "",
      portfolioUrl: "",
      coverLetter: "",
    },
  })

  const coverLetterLength = form.watch("coverLetter").length

  const handleSubmit = (values: JobApplicationFormValues) => {
    startTransition(async () => {
      const result = await applyToJob({ jobId, ...values })

      if (!result.success || !result.data) {
        toast.error(result.error?.message || "Could not submit your application.")
        return
      }

      toast.success(
        result.data.alreadyApplied
          ? "You have already applied for this job."
          : "Application submitted successfully!"
      )
      router.push(`${ROUTES.MY_JOBS}?tab=applied`)
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="flex w-full flex-col gap-8">
        <div className="grid gap-8 md:grid-cols-2">
          <FormField
            control={form.control}
            name="applicantName"
            render={({ field }) => (
              <FormItem className="flex w-full flex-col">
                <FormLabel className={labelClasses}>
                  Full name <span className="text-primary-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input className={inputClasses} autoComplete="name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="applicantEmail"
            render={({ field }) => (
              <FormItem className="flex w-full flex-col">
                <FormLabel className={labelClasses}>
                  Email <span className="text-primary-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input type="email" className={inputClasses} autoComplete="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem className="flex w-full flex-col">
                <FormLabel className={labelClasses}>Phone</FormLabel>
                <FormControl>
                  <Input type="tel" className={inputClasses} autoComplete="tel" placeholder="+1 555 123 4567" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="portfolioUrl"
            render={({ field }) => (
              <FormItem className="flex w-full flex-col">
                <FormLabel className={labelClasses}>Portfolio / GitHub</FormLabel>
                <FormControl>
                  <Input type="url" className={inputClasses} placeholder="https://github.com/you" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="resumeUrl"
          render={({ field }) => (
            <FormItem className="flex w-full flex-col">
              <FormLabel className={labelClasses}>
                Resume link <span className="text-primary-500">*</span>
              </FormLabel>
              <FormControl>
                <Input type="url" className={inputClasses} placeholder="https://drive.google.com/…" {...field} />
              </FormControl>
              <FormDescription className="body-regular mt-1 text-light-500">
                Share a public link to your resume (Google Drive, Dropbox, personal site…).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="coverLetter"
          render={({ field }) => (
            <FormItem className="flex w-full flex-col">
              <FormLabel className={labelClasses}>
                Cover letter <span className="text-primary-500">*</span>
              </FormLabel>
              <FormControl>
                <textarea
                  rows={8}
                  className={`${inputClasses} w-full resize-y rounded-md px-3 py-3 outline-none`}
                  placeholder="Tell the team why you're a great fit for this role…"
                  {...field}
                />
              </FormControl>
              <FormDescription className="body-regular mt-1 flex justify-between text-light-500">
                <span>Minimum 50 characters.</span>
                <span>{coverLetterLength}/2000</span>
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => router.push(ROUTES.JOBS_DETAILS(jobId))}
            className="light-border-2 text-dark400_light700 min-h-12 px-6"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            className="primary-gradient min-h-12 px-8 font-semibold !text-light-900"
          >
            {isPending ? (
              <>
                <LoaderIcon className="size-4 animate-spin" aria-hidden="true" />
                Submitting…
              </>
            ) : (
              "Submit application"
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default JobApplyForm
