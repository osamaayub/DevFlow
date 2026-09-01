import { Code } from "bright";
import { MDXRemote } from "next-mdx-remote/rsc";

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
          code: (props: any) => {
            const { children, className } = props;
            const language = className?.replace("language-", "") || "javascript";
            
            return (
              <Code
                code={children as string} // Cast to string for safety
                lang={language}
                theme="github-dark"
                lineNumbers
                className="shadow-light-200 dark:shadow-dark-200"
              />
            );
          },
          pre: ({ children }: any) => <>{children}</>,
        }}
      />
    </section>
  );
};