"use client"

import { ImagePlus, LoaderIcon, X } from "lucide-react"
import Image from "next/image"
import { useId, useState, type ChangeEvent } from "react"

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml", "image/gif"]
const MAX_FILE_SIZE = 5 * 1024 * 1024
const MAX_DIMENSION = 256

// Downscales the image in the browser so the stored logo stays a few KB
const resizeImage = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const image = new window.Image()

    image.onload = () => {
      const scale = Math.min(1, MAX_DIMENSION / Math.max(image.width, image.height))
      const width = Math.max(1, Math.round(image.width * scale))
      const height = Math.max(1, Math.round(image.height * scale))

      const canvas = document.createElement("canvas")
      canvas.width = width
      canvas.height = height
      const context = canvas.getContext("2d")
      if (!context) {
        URL.revokeObjectURL(objectUrl)
        reject(new Error("Could not process this image."))
        return
      }

      context.drawImage(image, 0, 0, width, height)
      URL.revokeObjectURL(objectUrl)
      resolve(canvas.toDataURL("image/webp", 0.85))
    }

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error("Could not read this image."))
    }

    image.src = objectUrl
  })

interface LogoUploadProps {
  value: string
  onChange: (value: string) => void
  onError?: (message: string) => void
}

const LogoUpload = ({ value, onChange, onError }: LogoUploadProps) => {
  const inputId = useId()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return

    if (!ACCEPTED_TYPES.includes(file.type)) {
      onError?.("Please choose a PNG, JPG, WebP, GIF or SVG image.")
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      onError?.("Image must be smaller than 5 MB.")
      return
    }

    setIsProcessing(true)
    try {
      onChange(await resizeImage(file))
    } catch (error) {
      onError?.(error instanceof Error ? error.message : "Could not process this image.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div className="background-light700_dark300 light-border-2 flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border">
        {isProcessing ? (
          <LoaderIcon className="size-5 animate-spin text-light-400" aria-hidden="true" />
        ) : value ? (
          <Image src={value} alt="Company logo preview" width={80} height={80} unoptimized className="size-full object-contain" />
        ) : (
          <ImagePlus className="size-6 text-light-400" aria-hidden="true" />
        )}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <label
            htmlFor={inputId}
            className="body-semibold light-border-2 text-dark400_light700 cursor-pointer rounded-lg border px-4 py-2 transition-colors hover:text-primary-500"
          >
            {value ? "Change image" : "Upload image"}
          </label>
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="body-medium inline-flex items-center gap-1 text-red-500 hover:underline"
            >
              <X className="size-4" aria-hidden="true" />
              Remove
            </button>
          )}
        </div>
        <p className="small-regular text-light-500">PNG, JPG, WebP, GIF or SVG · up to 5 MB</p>
      </div>

      <input
        id={inputId}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        onChange={handleFileChange}
        disabled={isProcessing}
        className="sr-only"
      />
    </div>
  )
}

export default LogoUpload
