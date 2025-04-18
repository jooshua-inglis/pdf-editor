import { PDFPage } from 'pdf-lib'
import { PDFPageProxy } from 'pdfjs-dist'
import React, { useEffect, useRef } from 'react'
import { CSS } from '@dnd-kit/utilities'
import { RenderTask } from 'pdfjs-dist/types/src/display/api'
import { useSortable } from '@dnd-kit/sortable'
import { Button } from '@/components/ui/button'

export interface PageData {
    id: string
    number: number
    docTitle: string
    pageRenderer: PDFPageProxy
    page: PDFPage
}

interface PageProps {
    pageData: PageData
    position: number
    className: string
    deletePage: () => void
}

export default function Page({ pageData, position, deletePage, className }: PageProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const renderTask = useRef<RenderTask>()
    useEffect(() => {
        const viewport = pageData.pageRenderer.getViewport({ scale: 0.6 })

        const canvas = canvasRef.current
        if (!canvas) {
            return
        }
        const context = canvas.getContext('2d')
        if (!context) {
            return
        }
        canvas.height
        //Our first draw
        canvas.height = viewport.height
        canvas.width = viewport.width

        // Render PDF page into canvas context
        var renderContext = {
            canvasContext: context,
            viewport: viewport,
        }

        renderTask.current?.cancel()
        renderTask.current = pageData.pageRenderer.render(renderContext)
        renderTask.current.promise
            .then(() => {
                renderTask.current = undefined
            })
            .catch((e) => {
                if (e.name === 'RenderingCancelledException') {
                    return
                }
                throw e
            })
    }, [pageData.pageRenderer])

    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
        id: pageData.id,
    })

    const draggingStyle = {
        transform: CSS.Translate.toString(transform),
        transition,
    }

    return (
        <div
            className={`rounded-lg p-5 text-center center-block ` + className}
            style={{ maxWidth: 'fit-content', ...draggingStyle }}
            ref={setNodeRef}
            {...listeners}
            {...attributes}>
            <div className={`a4 relative mx-auto mb-2 shadow-md`}>
                <Button onClick={deletePage} className="absolute right-4 top-4 p-3 text-black">
                    X
                </Button>
                <canvas ref={canvasRef} className="h-full w-full  border-3" />
            </div>

            <h3>
                {pageData.docTitle} - page {pageData.number}
            </h3>
        </div>
    )
}
