"use client"

import { useRouter } from "next/navigation"
import { FormEvent, useState } from "react"
import { toast } from "sonner"

import {
  ManagedUser,
  setUserSuspension,
  updateManagedUser
} from "@/features/users/admin-actions"
import { Button, Input } from "@/shared/components/ui"

export function AdminUserRow({ user }: { user: ManagedUser }) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isChangingStatus, setIsChangingStatus] = useState(false)

  const handleUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSaving(true)

    const formData = new FormData(event.currentTarget)
    const result = await updateManagedUser({
      userId: user._id,
      name: formData.get("name"),
      username: formData.get("username"),
      bio: formData.get("bio"),
      location: formData.get("location"),
      portfolio: formData.get("portfolio")
    })

    setIsSaving(false)
    if (!result.success) {
      toast.error(result.error)
      return
    }

    toast.success("User profile updated.")
    setIsEditing(false)
    router.refresh()
  }

  const handleSuspension = async () => {
    const action = user.isSuspended ? "restore" : "suspend"
    if (!window.confirm(`Are you sure you want to ${action} ${user.name}'s account?`)) return

    setIsChangingStatus(true)
    const result = await setUserSuspension(user._id, !user.isSuspended)
    setIsChangingStatus(false)

    if (!result.success) {
      toast.error(result.error)
      return
    }

    toast.success(user.isSuspended ? "Account restored." : "Account suspended.")
    router.refresh()
  }

  return (
    <article className="background-light900_dark300 light-border rounded-xl border p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="h3-semibold text-dark200_light900">{user.name}</h2>
            {user.isAdmin && (
              <span className="rounded-full bg-primary-100 px-2.5 py-1 text-xs font-semibold text-primary-500">
                Admin
              </span>
            )}
            {user.isSuspended && (
              <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700 dark:bg-red-950 dark:text-red-300">
                Suspended
              </span>
            )}
          </div>
          <p className="body-regular mt-1 break-all text-dark500_light400">
            @{user.username} · {user.email}
          </p>
          <p className="small-regular mt-1 text-dark500_light400">
            Joined {new Date(user.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsEditing((editing) => !editing)}
          >
            {isEditing ? "Cancel" : "Edit profile"}
          </Button>
          {!user.isAdmin && (
            <Button
              type="button"
              variant={user.isSuspended ? "secondary" : "destructive"}
              disabled={isChangingStatus}
              onClick={handleSuspension}
            >
              {isChangingStatus
                ? "Saving..."
                : user.isSuspended
                  ? "Restore"
                  : "Suspend"}
            </Button>
          )}
        </div>
      </div>

      {isEditing && (
        <form onSubmit={handleUpdate} className="mt-5 grid gap-4 border-t border-light-700 pt-5 md:grid-cols-2">
          <label className="small-medium text-dark400_light700">
            Name
            <Input name="name" required minLength={2} maxLength={80} defaultValue={user.name} className="mt-1" />
          </label>
          <label className="small-medium text-dark400_light700">
            Username
            <Input name="username" required minLength={2} maxLength={30} defaultValue={user.username} className="mt-1" />
          </label>
          <label className="small-medium text-dark400_light700">
            Location
            <Input name="location" maxLength={100} defaultValue={user.location} className="mt-1" />
          </label>
          <label className="small-medium text-dark400_light700">
            Portfolio
            <Input name="portfolio" type="url" defaultValue={user.portfolio} className="mt-1" />
          </label>
          <label className="small-medium text-dark400_light700 md:col-span-2">
            Bio
            <textarea
              name="bio"
              maxLength={500}
              rows={3}
              defaultValue={user.bio}
              className="background-light900_dark300 light-border-2 text-dark300_light700 mt-1 w-full resize-y rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            />
          </label>
          <div className="flex justify-end md:col-span-2">
            <Button type="submit" disabled={isSaving} className="primary-gradient text-white">
              {isSaving ? "Saving..." : "Save profile"}
            </Button>
          </div>
        </form>
      )}
    </article>
  )
}
