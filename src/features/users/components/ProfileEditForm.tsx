"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { updateUserProfile } from "@/features/users/actions"
import { Button, Input } from "@/shared/components/ui"
import ROUTES from "@/shared/constants/route"

interface Props {
  userId: string
  bio: string
  location: string
  portfolio: string
}

const ProfileEditForm = ({ userId, bio, location, portfolio }: Props) => {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (formData: FormData) => {
    setIsSaving(true)
    setError("")

    try {
      const result = await updateUserProfile({
        bio: String(formData.get("bio") ?? ""),
        location: String(formData.get("location") ?? ""),
        portfolio: String(formData.get("portfolio") ?? ""),
      })

      if (!result.success) {
        setError(result.error?.message ?? "Unable to update your profile.")
        return
      }

      router.push(ROUTES.PROFILE(userId))
      router.refresh()
    } catch (submitError) {
      setError(
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
        <label htmlFor="location" className="body-semibold text-dark200_light900">
          City and country
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

      <div className="flex flex-col gap-2">
        <label htmlFor="portfolio" className="body-semibold text-dark200_light900">
          Portfolio URL
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

      {error && (
        <p role="alert" className="body-regular text-red-500">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <Button
          type="submit"
          disabled={isSaving}
          className="primary-gradient min-h-11 px-5 text-light-900"
        >
          {isSaving ? "Saving..." : "Save Profile"}
        </Button>
        <Button
          type="button"
          variant="outline"
          asChild
          className="min-h-11 text-dark200_light900"
        >
          <Link href={ROUTES.PROFILE(userId)}>Cancel</Link>
        </Button>
      </div>
    </form>
  )
}

export default ProfileEditForm
