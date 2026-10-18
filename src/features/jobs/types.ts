export interface Job {
  _id: string
  title: string
  company: string
  companyLogo?: string
  category: string
  description: string
  employmentType: string
  salaryRange: string
  location: string
  postedDate: Date | string
  postedBy?: string
}

export type JobApplicationStatus = "submitted" | "reviewing" | "rejected" | "accepted"

export interface JobApplicant {
  _id: string
  applicantName: string
  applicantEmail: string
  phone?: string
  resumeUrl?: string
  portfolioUrl?: string
  coverLetter?: string
  status: JobApplicationStatus
  appliedAt: Date | string
}
