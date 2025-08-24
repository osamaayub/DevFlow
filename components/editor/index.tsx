
'use client'

import { BoldItalicUnderlineToggles, ChangeCodeMirrorLanguage, codeBlockPlugin, codeMirrorPlugin, ConditionalContents, CreateLink, diffSourcePlugin, imagePlugin, InsertCodeBlock, InsertImage, InsertTable, InsertThematicBreak, linkDialogPlugin, linkPlugin, ListsToggle, MDXEditor, tablePlugin, toolbarPlugin, UndoRedo } from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';
import {basicDark}from "cm6-theme-basic-dark";
import "./dark-editor.css";

// InitializedMDXEditor.tsx
import type { ForwardedRef } from 'react'
import {
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  type MDXEditorMethods,
} from '@mdxeditor/editor'
import { useTheme } from 'next-themes';
import { Separator } from '@radix-ui/react-dropdown-menu';

interface EditorProps{
    value:string,
    fieldChange:(value:string)=>void,
    editorRef:(ForwardedRef<MDXEditorMethods> | null)
}

export const Editor = ({value,fieldChange,editorRef,...props}:EditorProps) => {

    const {resolvedTheme}=useTheme();
    const theme=resolvedTheme==="dark" ? [basicDark] :[];
  return (
    <MDXEditor
    key={resolvedTheme}
    markdown={value}
      onChange={fieldChange}
      className="background-light800_dark200 light-border-2 markdown-editor dark-editor
      w-full border grid"
         plugins={[
              // Example Plugin Usage
              headingsPlugin(), 
              listsPlugin(),
              linkPlugin(),
              tablePlugin(),
              imagePlugin(),
              codeBlockPlugin({
                defaultCodeBlockLanguage:''
              }),
              linkDialogPlugin(),
              quotePlugin(),
              thematicBreakPlugin(),
              markdownShortcutPlugin(),
              codeMirrorPlugin({
                codeBlockLanguages:{
                  css:"css",
                  text:"txt",
                  sql:"sql",
                  html:"html",
                  js:"javascript",
                  sass:"sass",
                  scss:"scss",
                  json:"json",
                  ts:"typescript",
                  "":"unspecified",
                  jsx:"Javascript (React)",
                  tsx:"typescript (React)"
                },
                autoLoadLanguageSupport:true,
                codeMirrorExtensions:theme
              }),
              diffSourcePlugin({
                viewMode:'rich-text',
                diffMarkdown:''
              }),
              toolbarPlugin({
                toolbarContents:()=>{
                  return <ConditionalContents
                    options={[
                      {
                        when: (editor) => editor?.editorType === "codeblock",
                        contents: () => <ChangeCodeMirrorLanguage />
                      }, {
                        fallback:() => {
                          return <>
                            <UndoRedo />
                            <Separator />
                            <BoldItalicUnderlineToggles />
                            <Separator />
                            <ListsToggle />
                            <Separator />
                            <CreateLink/>
                            <InsertImage/>
                             <Separator/>
                             <InsertTable/>
                             <InsertThematicBreak/>
                             <InsertCodeBlock/>
                          </>;
                        }
                      }
                    ]} />;
                }
              })
          ]}
          {...props}
          ref={editorRef}          
          
          />
  )
}

