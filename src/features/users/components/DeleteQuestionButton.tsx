"use client"

import Image from "next/image"
import { useState, useTransition } from "react"

import { ConfirmDialog } from "@/shared/components/common"

interface DeleteQuestionButtonProps {
  questionTitle: string
  disabled?: boolean
  /** Resolves to true when the question was deleted, which closes the dialog */
  onDelete: () => Promise<boolean>
}

const DeleteQuestionButton = ({
  questionTitle,
  disabled = false,
  onDelete,
}: DeleteQuestionButtonProps) => {
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
        aria-label={`Delete ${questionTitle}`}
        title="Delete question"
        disabled={disabled}
        onClick={() => setIsOpen(true)}
        className="rounded p-1.5 transition hover:bg-red-500/10 disabled:opacity-50"
      >
        <Image src="/icons/trash.svg" alt="" width={16} height={16} />
      </button>

      <ConfirmDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        title="Delete this question?"
        description={
          <>
            Are you sure you want to delete{" "}
            <span className="font-semibold">&ldquo;{questionTitle}&rdquo;</span>? Its answers and
            votes will be removed too. This can&apos;t be undone.
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

export default DeleteQuestionButton
