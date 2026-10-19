"use client"

import { LoaderIcon } from "lucide-react"
import type { MouseEvent, ReactNode } from "react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog"

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: ReactNode
  onConfirm: () => void
  confirmLabel?: string
  pendingLabel?: string
  cancelLabel?: string
  isPending?: boolean
}

/**
 * Accessible yes/no confirmation modal. It stays open while `isPending` is true,
 * so the caller decides when to close it (usually after the action succeeds).
 */
const ConfirmDialog = ({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmLabel = "Yes",
  pendingLabel = "Please wait…",
  cancelLabel = "No",
  isPending = false,
}: ConfirmDialogProps) => {
  const handleConfirm = (event: MouseEvent<HTMLButtonElement>) => {
    // AlertDialogAction closes the dialog by default; keep it open until the work finishes
    event.preventDefault()
    onConfirm()
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (!isPending) onOpenChange(nextOpen)
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="background-light900_dark200 light-border border">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-dark200_light900">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-dark400_light700">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending} className="light-border-2 text-dark400_light700">
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isPending}
            onClick={handleConfirm}
            className="bg-red-500 text-white hover:bg-red-600"
          >
            {isPending ? (
              <>
                <LoaderIcon className="size-4 animate-spin" aria-hidden="true" />
                {pendingLabel}
              </>
            ) : (
              confirmLabel
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default ConfirmDialog
