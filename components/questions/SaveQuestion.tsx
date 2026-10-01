'use client'

import Image from "next/image";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";

import { toggleSaveQuestion } from "@/lib/actions";

const SaveQuestion = ({
    questionId,
    initialHasSaved = false,
}: {
    questionId: string;
    initialHasSaved?: boolean;
}) => {

    const session = useSession();
    const userId = session.data?.user?.id;
    const [IsLoading, setIsLoading] = useState(false);
    const [hasSaved, setHasSaved] = useState(initialHasSaved);


    const handleSaveQuestion = async () => {
        if (IsLoading) return;
        if (!userId) return toast("You must be logged in to save a question.");

        setIsLoading(true);
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
            setIsLoading(false);
        }

    }
    return (
        <Image src={hasSaved ? "/icons/star-filled.svg" : "/icons/star-red.svg"}
            width={18}
            height={18}
            alt={hasSaved ? "Remove saved question" : "Save question"}
            className={`cursor-pointer ${IsLoading && 'opacity-50'}`}
            aria-label="Save question"
            onClick={handleSaveQuestion}
        />
    )
}

export default SaveQuestion