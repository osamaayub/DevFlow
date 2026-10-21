export const getSiteUrl = () =>
  (process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || "http://localhost:3000").replace(/\/$/, "")

export const stripMarkup = (value: string, maxLength = 160) => {
  const plainText = value
    .replace(/<[^>]*>/g, " ")
    .replace(/[`*_>#-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()

  return plainText.length > maxLength ? `${plainText.slice(0, maxLength - 1).trim()}…` : plainText
}
