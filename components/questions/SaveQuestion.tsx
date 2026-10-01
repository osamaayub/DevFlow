'use client'

import Image from "next/image";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { hasSavedQuestion, toggleSaveQuestion } from "@/lib/actions";

const SaveQuestion = ({
    questionId,
}: {
    questionId: string;
}) => {

    const session = useSession();
    const userId = session.data?.user?.id;
    const [isSaving, setIsSaving] = useState(false);
    const [hasSaved, setHasSaved] = useState(false);
    const [isCheckingSaved, setIsCheckingSaved] = useState(true);

    useEffect(() => {
        if (session.status === "loading") return;
        if (!userId) {
            setHasSaved(false);
            setIsCheckingSaved(false);
            return;
        }

        let isActive = true;
        setIsCheckingSaved(true);

        const loadSavedState = async () => {
            try {
                const result = await hasSavedQuestion({ questionId });
                if (isActive) {
                    setHasSaved(result.success && Boolean(result.data?.saved));
                }
            } catch {
                if (isActive) setHasSaved(false);
            } finally {
                if (isActive) setIsCheckingSaved(false);
            }
        };

        void loadSavedState();
        return () => {
            isActive = false;
        };
    }, [questionId, session.status, userId]);


    const handleSaveQuestion = async () => {
        if (isSaving) return;
        if (!userId) return toast("You must be logged in to save a question.");

        setIsSaving(true);
        try {

            const result = await toggleSaveQuestion({
                questionId,
            })
            if (result.success && result.data) {
                setHasSaved(result.data.saved);
                toast.success(
                    result.data.saved
                        ? "Question saved successfully."
                        : "Question removed from saved questions."
                );
            }
        }
        catch (error) {
            toast.error(`An error occurred while saving the question. ${error}`);
        }
        finally {
            setIsSaving(false);
        }

    }
    if (isCheckingSaved) {
        return (
            <div
                role="status"
                aria-label="Checking saved question"
                className="size-[18px] animate-pulse rounded-sm bg-light-800 dark:bg-dark-300"
            />
        );
    }

    return (
        <button
            type="button"
            aria-label={hasSaved ? "Remove saved question" : "Save question"}
            aria-pressed={hasSaved}
            disabled={isCheckingSaved || isSaving}
            onClick={handleSaveQuestion}
        >
            <Image
                src={hasSaved ? "/icons/star-filled.svg" : "/icons/star.svg"}
                alt=""
                width={18}
                height={18}
            />
        </button>
    )
}

export default SaveQuestion