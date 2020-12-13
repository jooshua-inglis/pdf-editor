import { PDFPage } from 'pdf-lib'
import { PDFPageProxy } from 'pdfjs-dist'
import React, { useEffect, useRef } from 'react'
import { DragSourceMonitor, useDrag, useDrop } from 'react-dnd'
import { SvgBin } from './svg/bin'

export interface PageData {
    number: number
    title: string
    pageRenderer: PDFPageProxy
    page: PDFPage
}

interface PageProps {
    pageData: PageData
    movePageTo: (from: number, to: number) => void
    position: number
    deletePage: () => void
}

interface DropResult {
    position: number
}

export const Page = ({ pageData, movePageTo, position, deletePage }: PageProps) => {
    useEffect(() => {
        const viewport = pageData.pageRenderer.getViewport({ scale: 0.6 })

        const canvas = canvasRef.current
        const context = canvas.getContext('2d')
        canvas.height
        //Our first draw
        canvas.height = viewport.height
        canvas.width = viewport.width

        // Render PDF page into canvas context
        var renderContext = {
            canvasContext: context,
            viewport: viewport,
        }
        var renderTask = pageData.pageRenderer.render(renderContext)
        renderTask.promise.then(function () {})
    }, [])

    const canvasRef = useRef(null)

    const [{}, drag] = useDrag({
        end(item, monitor: DragSourceMonitor) {
            const dropResult: DropResult = monitor.getDropResult()
            if (dropResult) {
                movePageTo(item.position, dropResult.position)
            }
        },
        collect: (monitor) => ({
            isDragging: Boolean(monitor.isDragging()),
        }),
        item: { type: 'PAGE', position: position },
    })

    const [{ isOver }, drop] = useDrop({
        accept: 'PAGE',
        drop: () => ({
            position: position,
        }),
        collect: (monitor) => ({
            isOver: Boolean(monitor.isOver()),
        }),
    })

    return (
        <div className={`text-center center-block`} ref={drop}>
            <div
                ref={drag}
                className={`rounded-lg p-5
                ${isOver ? 'bg-gradient-to-tr from-green-400 to-blue-500' : ''}`}
                style={{ maxWidth: 'fit-content' }}>
                <div className={`a4 relative mx-auto mb-2 shadow-md`}>
                    <button
                        onClick={deletePage}
                        className="absolute right-4 top-4 p-3 rounded-md text-white font-semibold bg-gradient-to-bl from-red-600 to-pink-500">
                        <SvgBin className="h-5 w-auto stroke-white " />
                    </button>
                    <canvas ref={canvasRef} className="h-full w-full  border-2 rounded-lg" />
                </div>

                <h3 className="text-gray-600">
                    {pageData.title} - page {pageData.number}
                </h3>
            </div>
        </div>
    )
}
