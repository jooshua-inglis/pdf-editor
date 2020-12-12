import React from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Page, PageData } from './page'

export const PageGrid = ({
  pages,
  movePageTo
}: {
  pages: PageData[]
  movePageTo: (from: number, to: number) => void
}) => {
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 lg:grid-cols-4" >
        {pages.map((page, index) => {
          return <Page key={page.title + page.number + index} pageData={page} movePageTo={movePageTo} position={index} />
        })}
      </div>
    </DndProvider>
  )
}
