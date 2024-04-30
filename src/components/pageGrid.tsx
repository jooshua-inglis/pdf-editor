import React from 'react'
import Page, { PageData } from './page'
import { DndContext, DragEndEvent, MouseSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext } from '@dnd-kit/sortable'

const PageGrid = ({
    pages,
    movePageTo,
    deletePage,
}: {
    pages: PageData[]
    movePageTo: (from: number, to: number) => void
    deletePage: (index: number) => void
}) => {
    const handleDragEnd = (event: DragEndEvent) => {
        const a = event.active.id
        const o = event.over?.id


        const from = pages.findIndex(p => p.id === a)
        const to = pages.findIndex(p => p.id === o)
        if(from === -1 || to === -1) {
            console.error("from or to not found")
            return
        }
        
        movePageTo(from, to)
    }
    const mouseSensor = useSensor(MouseSensor, {
        // Require the mouse to move by 10 pixels before activating
        activationConstraint: {
            distance: 10,
        },
    })

    const sensors = useSensors(mouseSensor)
    return (
        <DndContext onDragEnd={handleDragEnd} sensors={sensors}>
            <SortableContext items={pages}>
            <div className="flex flex-wrap justify-evenly">
                {pages.map((page, index) => {
                    return (
                        <Page
                            className="basis-80"
                            key={page.id}
                            pageData={page}
                            position={index}
                            deletePage={() => deletePage(index)}
                        />
                    )
                })}
            </div>
      </SortableContext>
        </DndContext>
    )
}

export default PageGrid
