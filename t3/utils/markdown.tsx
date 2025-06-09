import React, { useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'

const components = {
    /* ─────────────────────── headings ─────────────────────── */
    h1: ({ node, ...p }) => <h1 {...p} className="text-5xl font-bold mt-4"   />,
    h2: ({ node, ...p }) => <h2 {...p} className="text-4xl font-bold mt-4"   />,
    h3: ({ node, ...p }) => <h3 {...p} className="text-3xl font-semibold mt-4"/>,
    h4: ({ node, ...p }) => <h4 {...p} className="text-2xl font-semibold mt-4"/>,
    h5: ({ node, ...p }) => <h5 {...p} className="text-xl  font-medium mt-4" />,
    h6: ({ node, ...p }) => <h6 {...p} className="text-lg  font-medium mt-4" />,

    /* ─────────────────────── common text tags ──────────────────────── */
    p:   ({ node, ...p }) => <p   {...p} className="my-2"        />,
    a:   ({ node, ...p }) => <a   {...p} className="text-blue-500 underline hover:text-blue-600" target="_blank" rel="noopener noreferrer" />,
    strong: ({ node, ...p }) => <strong {...p} className="font-semibold"         />,
    em:     ({ node, ...p }) => <em     {...p} className="italic"                />,

    /* lists */
    ul:  ({ node, ...p }) => <ul  {...p} className="list-disc pl-6 pb-1" />,
    ol:  ({ node, ...p }) => <ol  {...p} className="list-decimal pl-6" />,
    li: ({ children, ...p }) => (
        <li {...p} className="leading-relaxed my-2 ml-2">
            {children}
        </li>
    ),

    /* inline code */
    code({node, inline, ...p}) {
        return inline ? (
            <code {...p} className="rounded px-1 py-0.5 font-mono text-[90%]" />
        ) : (
            /* fenced block handled by <pre> below */
            <code {...p} />
        );
    },

    /* fenced code block */
    pre: ({ node, ...p }) => (
        <pre {...p} className="my-4 rounded-lg py-4 overflow-x-auto" />
    ),

    /* quotes & rules */
    blockquote: ({ node, ...p }) => (
        <blockquote {...p} className="border-l-4 border-zinc-500 pl-4 italic text-zinc-400 my-4" />
    ),
    hr: ({ node, ...p }) => <hr {...p} className="my-8 border-zinc-700" />,

    /* images */
    img: ({ node, ...p }) => (
        <img {...p} className="my-4 rounded-lg max-w-full h-auto" />
    ),

    /* tables */
    table: ({ node, ...p }) => (
        <div className="my-6 overflow-x-auto">
            <table {...p} className="w-full text-left border-collapse">
                {p.children}
            </table>
        </div>
    ),
    thead: ({ node, ...p }) => <thead {...p} className="bg-zinc-800" />,
    th: ({ node, ...p }) => <th {...p} className="px-3 py-2 font-semibold border-b border-zinc-700" />,
    td: ({ node, ...p }) => <td {...p} className="px-3 py-2 border-b border-zinc-800" />,
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