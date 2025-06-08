import remarkGfm from "remark-gfm";
import {serialize} from "next-mdx-remote/serialize";
import rehypeHighlight from "rehype-highlight";

export async function compileMdx(src: string){
    return serialize(src, {
        mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [[rehypeHighlight, {ignoreMissing: true}]]
        }
    })
}