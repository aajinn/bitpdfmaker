import fs from 'fs'
import path from 'path'
import { compileMDX } from 'next-mdx-remote/rsc'
import { Metadata } from 'next'


export const metadata: Metadata = {
        title: 'About | BitPDFMaker',
        description: 'about.',
}
export default async function Privacy() {

        const filePath = path.join(process.cwd(), 'app/(pages)/(content)', 'about.mdx')
        const fileContent = fs.readFileSync(filePath, 'utf8')

        const { content } = await compileMDX({
                source: fileContent,
                options: { parseFrontmatter: true }
        })

        return <div className="container mx-auto py-12">{content}</div>
}