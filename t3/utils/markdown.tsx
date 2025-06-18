import React, { useMemo } from 'react'
import ReactMarkdown, {type Components} from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import CodeBlock from "@/components/code-block";


const components: Components = {
    /* ─────────────────────── headings ─────────────────────── */
    h1: ({ ...p }) => <h1 {...p} className="text-5xl font-bold mt-4"   />,
    h2: ({ ...p }) => <h2 {...p} className="text-4xl font-bold mt-4"   />,
    h3: ({ ...p }) => <h3 {...p} className="text-3xl font-semibold mt-4"/>,
    h4: ({ ...p }) => <h4 {...p} className="text-2xl font-semibold mt-4"/>,
    h5: ({ ...p }) => <h5 {...p} className="text-xl  font-medium mt-4" />,
    h6: ({ ...p }) => <h6 {...p} className="text-lg  font-medium mt-4" />,

    /* ─────────────────────── common text tags ──────────────────────── */
    p:   ({ ...p }) => <p   {...p} className="my-2"        />,
    a:   ({ ...p }) => <a   {...p} className="text-blue-500 underline hover:text-blue-600" target="_blank" rel="noopener noreferrer" />,
    strong: ({ ...p }) => <strong {...p} className="font-semibold"         />,
    em:     ({ ...p }) => <em     {...p} className="italic"                />,

    /* lists */
    ul:  ({ ...p }) => <ul  {...p} className="list-disc pl-6 pb-1" />,
    ol:  ({ ...p }) => <ol  {...p} className="list-decimal pl-6" />,
    li: ({ children, ...p }) => (
        <li {...p} className="leading-relaxed my-2 ml-2">
            {children}
        </li>
    ),

    code(props) {
        const {children, node, className, ...p} = props;
        const match = /language-(\w+)/.exec(className || '')
        
        return match ? (
            <CodeBlock {...props} />
        ) : (
            <code {...p} className="bg-sidebar/80 rounded px-[0.3rem] py-[0.25rem] text-sm font-mono" >
                {children}
            </code>
        );
    },

    /* quotes & rules */
    blockquote: ({...p }) => (
        <blockquote {...p} className="border-l-4 border-zinc-500 pl-4 italic text-zinc-400 my-4" />
    ),
    hr: ({...p }) => <hr {...p} className="my-8 border-zinc-700" />,

    /* images */
    img: ({...p }) => (
        <img {...p} className="my-4 rounded-lg max-w-full h-auto" />
    ),

    /* tables */
    table: ({ ...p }) => (
        <div className="my-6 overflow-x-auto">
            <table {...p} className="w-full text-left border-collapse">
                {p.children}
            </table>
        </div>
    ),
    thead: ({ ...p }) => <thead {...p} className="bg-zinc-800" />,
    th: ({ ...p }) => <th {...p} className="px-3 py-2 font-semibold border-b border-zinc-700" />,
    td: ({ ...p }) => <td {...p} className="px-3 py-2 border-b border-zinc-800" />,
};

export default function RenderMarkdown({ text }: { text: string }) {
    const nodeTree = useMemo(
        () => (
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[[rehypeHighlight, { ignoreMissing: true }]]}
                components={components}
            >
                {text}
            </ReactMarkdown>
        ),
        [text]
    )

    return nodeTree
}