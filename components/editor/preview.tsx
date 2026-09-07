import { Code } from "bright";
import { MDXRemote } from "next-mdx-remote/rsc";
import type { ComponentPropsWithoutRef, ReactElement } from "react";

export const Preview = ({ content }: { content: string }) => {
  return (
    <section className="markdown prose grid wrap-break-words">
      <MDXRemote
        source={content}
        options={{
          mdxOptions: {
            format: "md",
          },
        }}
        components={{
          code: (props: ComponentPropsWithoutRef<"code">) => {
            const { children, className } = props;
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          pre: ({ children }: ComponentPropsWithoutRef<"pre">) => {
            const childElement = children as ReactElement<{
              className?: string;
              children?: React.ReactNode;
            }>;
            const codeProps = childElement?.props || {};
            const language =
              typeof codeProps.className === "string"
                ? codeProps.className.replace("language-", "")
                : "javascript";

            return (
              <Code
                code={String(codeProps.children || "")}
                lang={language || "javascript"}
                theme="github-dark"
                lineNumbers
                className="shadow-light-200 dark:shadow-dark-200"
              />
            );
          },
        }}
      />
    </section>
  );
};