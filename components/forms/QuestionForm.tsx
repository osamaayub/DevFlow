"use client";

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod";
import { AskQuestionSchema } from "@/lib/validation";
import React, { KeyboardEvent } from "react"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRef } from "react";
import { MDXEditorMethods } from "@mdxeditor/editor";
import dynamic from "next/dynamic";
import z from "zod";
import TagCards from "../cards/TagCards";
export function QuestionForm() {
  const form = useForm<z.infer<typeof AskQuestionSchema>>({
    resolver: zodResolver(AskQuestionSchema),
    defaultValues: {
      title: "",
      content: "",
      tags: [],
    },
  });
  const editorRef = useRef<MDXEditorMethods>(null);
  const Editor = dynamic(() => import("@/components/editor").then((mod) => mod.Editor), {
    ssr: false,
  });
  const handleCreateQuestion = (data:z.infer<typeof AskQuestionSchema>>) => {

  };
  const handleTagRemove = (tag: string, field:{value:string[]}) => {
  const newTags = field.value.filter((t: string) => t !== tag)
  form.setValue("tags",newTags);
    if(newTags.length===0){
      form.setError("tags",{
        type:"manual",
        message:"Tags are required"
      });
    }

  }
  const handleClick=(e:React.MouseEvent)=>{
   e.preventDefault();
  }

  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>, field: { value: string[] }) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const tagInput = e.currentTarget.value.trim();
      if (tagInput && tagInput.length < 15 && !field.value.includes(tagInput)) {
        form.setValue('tags', [...field.value, tagInput]);
        e.currentTarget.value = "";
        form.clearErrors("tags");
      }
      else if (tagInput.length >= 15) {

        form.setError("tags", {
          type: "manual",
          message: "Tag must be less than  15 characters"
        });
      }
      else if (field.value.includes(tagInput)) {
        form.setError("tags", {
          type: "manual",
          message: "Tag already exists"
        })
      }
    }
  }

  return (

    <Form {...form}>
      <form
        className="flex w-full flex-col gap-10"
        onSubmit={form.handleSubmit(handleCreateQuestion)}
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem className=" flex w-full flex-col">
              <FormLabel className="capitalize  paragraph-semibold text-dark400_light800">
                Question Title <span className="text-primary-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder={`Enter ${field.name}`}
                  {...field}
                  className="paragraph-regular background-light700_dark300 light-border-2 text-dark300_light700 no-focus min-h-[56px]  border"
                />
              </FormControl>
              <FormDescription className="body-regular text-light-500 mt-2.5">
                Be specific and imagine you’re asking a question to another
                person.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem className=" flex w-full flex-col">
              <FormLabel className="capitalize  paragraph-semibold text-dark400_light800">
                Detailed explanation of your problem?{" "}
                <span className="text-primary-500">*</span>
              </FormLabel>
              <FormControl>
                <Editor
                  value={field.value}
                  editorRef={editorRef}
                  fieldChange={field.onChange}
                />
              </FormControl>
              <FormDescription className="body-regular text-light-500 mt-2.5">
                Introduce the problem and expand on what you put in the title.
                Minimum 20 characters.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem className=" flex w-full flex-col gap-3">
              <FormLabel className="capitalize  paragraph-semibold text-dark400_light800">
                Tags <span className="text-primary-500">*</span>
              </FormLabel>
              <FormControl>
                <div>
                  <Input
                    placeholder='Add Tags...'

                    className="paragraph-regular background-light700_dark300 light-border-2 text-dark300_light700 no-focus min-h-[56px]  border"
                    onKeyDown={(e) => { handleInputKeyDown(e, field) }}
                  />
                  {field.value.length > 0 && (
                    <div className="flex-start mt-2.5 flex-wrap gap-2.5">
                      {field.value.map((tag: string) =>
                        <TagCards
                          key={tag}
                          _id={tag}
                          name={tag}
                          compact
                          remove
                          isButton
                          handleRemove={() => { handleTagRemove(tag,field) }}
                        />
                      )}


                    </div>
                  )}
                </div>
              </FormControl>
              <FormDescription className="body-regular text-light-500 mt-2.5">
                Add up to 3 tags to describe what your question is about. Start
                typing to see suggestions.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="mt-16 flex justify-end">
          <Button onClick={handleClick} type="submit" className="primary-gradient !text-light-900 w-fit">
            Ask a Question
          </Button>
        </div>
      </form>
    </Form>
  );
}
