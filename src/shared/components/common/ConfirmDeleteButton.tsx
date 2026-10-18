"use client"

import Image from "next/image"
import { useState, useTransition } from "react"

import ConfirmDialog from "./ConfirmDialog"

interface ConfirmDeleteButtonProps {
  /** What is being deleted, e.g. "question" or "answer" */
  itemType: string
  /** Shown in the accessible label and the dialog, e.g. the question title */
  itemTitle: string
  /** Extra sentence for the dialog, e.g. what else gets removed */
  consequence?: string
  disabled?: boolean
  /** Resolves to true when the item was deleted, which closes the dialog */
  onDelete: () => Promise<boolean>
}

/** Trash icon that asks "Are you sure?" in a modal before deleting. */
const ConfirmDeleteButton = ({
  itemType,
  itemTitle,
  consequence,
  disabled = false,
  onDelete,
}: ConfirmDeleteButtonProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleConfirm = () => {
    startTransition(async () => {
      const deleted = await onDelete()
      if (deleted) setIsOpen(false)
    })
  }

  return (
    <>
      <button
        type="button"
        aria-label={`Delete ${itemType}: ${itemTitle}`}
        title={`Delete ${itemType}`}
        disabled={disabled}
        onClick={() => setIsOpen(true)}
        className="rounded p-1.5 transition hover:bg-red-500/10 disabled:opacity-50"
      >
        <Image src="/icons/trash.svg" alt="" width={16} height={16} />
      </button>

      <ConfirmDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        title={`Delete this ${itemType}?`}
        description={
          <>
            Are you sure you want to delete{" "}
            <span className="font-semibold">&ldquo;{itemTitle}&rdquo;</span>?
            {consequence ? ` ${consequence}` : ""} This can&apos;t be undone.
          </>
        }
        confirmLabel="Yes, delete"
        pendingLabel="Deleting…"
        cancelLabel="No"
        isPending={isPending}
        onConfirm={handleConfirm}
      />
    </>
  )
}

export default ConfirmDeleteButton
