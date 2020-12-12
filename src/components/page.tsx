import { PDFPage } from 'pdf-lib'
import { PDFPageProxy } from 'pdfjs-dist'
import React, { useEffect, useRef } from 'react'
import { DragSourceMonitor, useDrag, useDrop } from 'react-dnd'

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
}

interface DropResult {
  position: number
}

export const Page = ({ pageData, movePageTo, position }: PageProps) => {
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
    renderTask.promise.then(function () {
    })
  }, [])

  const canvasRef = useRef(null)

  const [{}, drag] = useDrag({
    end(item, monitor: DragSourceMonitor) {
      const dropResult: DropResult = monitor.getDropResult()
      if (dropResult) {
        movePageTo(item.position, dropResult.position)
      }
    },
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
    <div className="p-8 text-center" ref={drop}>
      <div ref={drag}>
        <div
          className={`a4 border-2 ${isOver ? 'border-blue' : 'border-black'}`}
          style={{ margin: '0 auto' }}
        >
          <canvas ref={canvasRef} className='h-full w-full' />
        </div>

        <h3>
          {pageData.title} - page {pageData.number}
        </h3>
      </div>
    </div>
  )
}
