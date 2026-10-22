"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { updateUserProfile } from "@/features/users/actions"
import { Button, Input } from "@/shared/components/ui"
import ROUTES from "@/shared/constants/route"
export interface ProfileEditFormProps {
  userId: string
  name: string
  username: string
  bio?: string
  location?: string
  portfolio?: string
}

const ProfileEditForm = ({
  userId,
  name,
  username,
  bio = "",
  location = "",
  portfolio = "",
}: ProfileEditFormProps) => {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setIsSaving(true)

    try {
      const result = await updateUserProfile({
        name: String(formData.get("name") ?? ""),
        username: String(formData.get("username") ?? ""),
        bio: String(formData.get("bio") ?? ""),
        location: String(formData.get("location") ?? ""),
        portfolio: String(formData.get("portfolio") ?? ""),
      })

      if (!result.success) {
        toast.error(result.error?.message ?? "Unable to update your profile.")
        return
      }

      toast.success("Profile updated successfully.")
      router.push(ROUTES.PROFILE(userId))
      router.refresh()
    } catch (submitError) {
      toast.error(
        submitError instanceof Error
          ? submitError.message
          : "Unable to update your profile. Please try again."
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form action={handleSubmit} className="mt-8 flex max-w-2xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label htmlFor="name" className="body-semibold text-dark200_light900">
          Full Name
        </label>
        <Input
          id="name"
          name="name"
          defaultValue={name}
          minLength={2}
          required
          className="background-light900_dark300 text-dark200_light900 h-11"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="username" className="body-semibold text-dark200_light900">
          Username
        </label>
        <Input
          id="username"
          name="username"
          defaultValue={username}
          minLength={2}
          required
          className="background-light900_dark300 text-dark200_light900 h-11"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="portfolio" className="body-semibold text-dark200_light900">
          Portfolio Link
        </label>
        <Input
          id="portfolio"
          name="portfolio"
          type="url"
          defaultValue={portfolio}
          placeholder="https://example.com"
          className="background-light900_dark300 text-dark200_light900 h-11"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="location" className="body-semibold text-dark200_light900">
          Location
        </label>
        <Input
          id="location"
          name="location"
          defaultValue={location}
          maxLength={100}
          placeholder="Mumbai, India"
          className="background-light900_dark300 text-dark200_light900 h-11"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="bio" className="body-semibold text-dark200_light900">
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          defaultValue={bio}
          maxLength={500}
          rows={4}
          placeholder="Tell the community a little about yourself."
          className="background-light900_dark300 light-border text-dark200_light900 placeholder:text-dark400_light700 w-full resize-y rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        />
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          disabled={isSaving}
          onClick={() => router.push(ROUTES.PROFILE(userId))}
          className="light-border-2 text-dark400_light700 min-h-11 px-5"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSaving}
          className="primary-gradient min-h-11 px-5 text-light-900"
        >
          {isSaving ? "Updating..." : "Update Profile"}
        </Button>
      </div>
    </form>
  )
}

export default ProfileEditForm
