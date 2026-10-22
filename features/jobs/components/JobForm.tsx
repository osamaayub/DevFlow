"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { LoaderIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { createJob, editJob } from "@/features/jobs/actions"
import type { Job } from "@/features/jobs/types"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import ROUTES from "@/shared/constants/route"
import { CreateJobSchema, JOB_EMPLOYMENT_TYPES } from "@/shared/lib/validation"

import LogoUpload from "./LogoUpload"

type JobFormValues = z.infer<typeof CreateJobSchema>

const labelClasses = "paragraph-semibold text-dark400_light800"
const inputClasses =
  "paragraph-regular background-light700_dark300 light-border-2 text-dark300_light700 no-focus min-h-14 border"

const Required = () => <span className="text-primary-500">*</span>

interface JobFormProps {
  job?: Job
  isEdit?: boolean
}

const isEmploymentType = (value?: string): value is JobFormValues["employmentType"] =>
  (JOB_EMPLOYMENT_TYPES as readonly string[]).includes(value ?? "")

const JobForm = ({ job, isEdit = false }: JobFormProps) => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const form = useForm<JobFormValues>({
    resolver: zodResolver(CreateJobSchema),
    defaultValues: {
      title: job?.title ?? "",
      company: job?.company ?? "",
      companyLogo: job?.companyLogo ?? "",
      applicationUrl: job?.applicationUrl ?? "",
      category: job?.category ?? "",
      employmentType: isEmploymentType(job?.employmentType) ? job.employmentType : "Full-time",
      location: job?.location ?? "",
      salaryRange: job?.salaryRange ?? "",
      description: job?.description ?? "",
    },
  })

  const descriptionLength = form.watch("description").length

  const handleSubmit = (values: JobFormValues) => {
    startTransition(async () => {
      const result =
        isEdit && job ? await editJob({ jobId: job._id, ...values }) : await createJob(values)

      if (!result.success || !result.data) {
        toast.error(result.error?.message || (isEdit ? "Could not update this job." : "Could not post this job."))
        return
      }

      toast.success(isEdit ? "Job updated successfully!" : "Job posted successfully!")
      router.push(ROUTES.JOBS_DETAILS(result.data.job._id))
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="flex w-full flex-col gap-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem className="flex w-full flex-col">
              <FormLabel className={labelClasses}>
                Job title <Required />
              </FormLabel>
              <FormControl>
                <Input className={inputClasses} placeholder="e.g. Senior Frontend Developer" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-8 md:grid-cols-2">
          <FormField
            control={form.control}
            name="company"
            render={({ field }) => (
              <FormItem className="flex w-full flex-col">
                <FormLabel className={labelClasses}>
                  Company <Required />
                </FormLabel>
                <FormControl>
                  <Input className={inputClasses} placeholder="e.g. Acme Inc." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="companyLogo"
            render={({ field }) => (
              <FormItem className="flex w-full flex-col">
                <FormLabel className={labelClasses}>Company logo</FormLabel>
                <FormControl>
                  <LogoUpload
                    value={field.value}
                    onChange={(value) => {
                      field.onChange(value)
                      form.clearErrors("companyLogo")
                    }}
                    onError={(message) => form.setError("companyLogo", { type: "manual", message })}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem className="flex w-full flex-col">
                <FormLabel className={labelClasses}>
                  Category <Required />
                </FormLabel>
                <FormControl>
                  <Input className={inputClasses} placeholder="e.g. Development, Design, Software" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="applicationUrl"
            render={({ field }) => (
              <FormItem className="flex w-full flex-col md:col-span-2">
                <FormLabel className={labelClasses}>
                  Official job link <Required />
                </FormLabel>
                <FormControl>
                  <Input
                    className={inputClasses}
                    type="url"
                    placeholder="https://careers.example.com/jobs/..."
                    {...field}
                  />
                </FormControl>
                <FormDescription className="body-regular text-light-500">
                  Link directly to the company&apos;s real job posting.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="employmentType"
            render={({ field }) => (
              <FormItem className="flex w-full flex-col">
                <FormLabel className={labelClasses}>
                  Employment type <Required />
                </FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className={`${inputClasses} w-full shadow-none focus:ring-0 focus:ring-offset-0`}>
                      <SelectValue placeholder="Select a type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="background-light900_dark200 text-dark500_light700">
                    {JOB_EMPLOYMENT_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem className="flex w-full flex-col">
                <FormLabel className={labelClasses}>
                  Location <Required />
                </FormLabel>
                <FormControl>
                  <Input className={inputClasses} placeholder="e.g. Melbourne, AU or Remote" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="salaryRange"
            render={({ field }) => (
              <FormItem className="flex w-full flex-col">
                <FormLabel className={labelClasses}>
                  Salary range <Required />
                </FormLabel>
                <FormControl>
                  <Input className={inputClasses} placeholder="e.g. 80k - 100k" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="flex w-full flex-col">
              <FormLabel className={labelClasses}>
                Job description <Required />
              </FormLabel>
              <FormControl>
                <textarea
                  rows={10}
                  className={`${inputClasses} w-full resize-y rounded-md px-3 py-3 outline-none`}
                  placeholder="Describe the role, responsibilities, requirements and benefits…"
                  {...field}
                />
              </FormControl>
              <FormDescription className="body-regular mt-1 flex justify-between text-light-500">
                <span>Minimum 50 characters.</span>
                <span>{descriptionLength}/5000</span>
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
            onClick={() => router.push(isEdit && job ? ROUTES.JOBS_DETAILS(job._id) : ROUTES.JOBS)}
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
                {isEdit ? "Saving…" : "Posting…"}
              </>
            ) : isEdit ? (
              "Save changes"
            ) : (
              "Post job"
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default JobForm
