interface ProfileActivityErrorProps {
  error: string
}

const ProfileActivityError = ({ error }: ProfileActivityErrorProps) => {
  if (!error) {
    return null
  }

  return (
    <p role="alert" className="body-regular mt-4 text-red-500">
      {error}
    </p>
  )
}

export default ProfileActivityError
