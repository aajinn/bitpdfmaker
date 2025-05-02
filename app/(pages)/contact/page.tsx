import fs from 'fs'
import path from 'path'
import { compileMDX } from 'next-mdx-remote/rsc'
import { Metadata } from 'next'

export const metadata: Metadata = {
        title: 'Contact Us | BitPDFMaker',
        description: 'Get in touch with the BitPDFMaker team via X (formerly Twitter) at @chanyajin.',
}
export default async function Privacy() {
        const filePath = path.join(process.cwd(), 'app/(pages)/(content)', 'contact.mdx')
        const fileContent = fs.readFileSync(filePath, 'utf8')

        const { content } = await compileMDX({
                source: fileContent,
                options: { parseFrontmatter: true }
        })

        return <div className="container mx-auto py-12">{content}</div>
}