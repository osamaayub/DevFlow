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
}
