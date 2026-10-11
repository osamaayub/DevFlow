import { redirect } from "next/navigation"

import { getUser } from "@/features/users/actions"
import { ProfileEditForm } from "@/features/users/components"
import { auth } from "@/server/auth"

const EditProfilePage = async () => {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) redirect("/sign-in")

  const result = await getUser({ userId })
  if (!result.success || !result.data) {
    throw new Error(result.error?.message ?? "Unable to load your profile.")
  }

  const { user } = result.data

  return (
    <main className="w-full">
      <h1 className="h1-bold text-dark100_light900">Edit Profile</h1>
      <p className="body-regular mt-2 text-dark400_light700">
        Add your city, country, and a short bio to your profile.
      </p>
      <ProfileEditForm
        userId={userId}
        bio={user.bio ?? ""}
        location={user.location ?? ""}
        portfolio={user.portfolio ?? ""}
      />
    </main>
  )
}

export default EditProfilePage
