import { Code } from "bright";
import { MDXRemote } from "next-mdx-remote/rsc";
import type { ComponentPropsWithoutRef } from "react";

export const Preview = ({ content }: { content: string }) => {
  return (
    <section className="markdown prose grid wrap-break-words">
      <MDXRemote
        source={content}
        // Tell the compiler to treat this as standard Markdown, not MDX
        options={{
          mdxOptions: {
            format: "md",
          },
        }}
        components={{
          code: (props: ComponentPropsWithoutRef<"code">) => {
            const { children, className } = props;
            const language =
              typeof className === "string"
                ? className.replace("language-", "")
                : "javascript";

            return (
              <Code
                code={String(children)}
                lang={language || "javascript"}
                theme="github-dark"
                lineNumbers
                className="shadow-light-200 dark:shadow-dark-200"
              />
            );
          },
          pre: ({ children }: ComponentPropsWithoutRef<"pre">) => <>{children}</>,
        }}
      />
    </section>
  );
};