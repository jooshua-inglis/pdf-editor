import React, { useState } from 'react'
import { PageData } from '../components/page'
import { PageGrid } from '../components/pageGrid'
import { PDFPageProxy, getDocument, GlobalWorkerOptions } from 'pdfjs-dist'
import { PDFDocument } from 'pdf-lib'
import { AddFile } from '../components/addFiles'
import { Spinner } from '../components/spinner'

GlobalWorkerOptions.workerSrc =
  'https://npmcdn.com/pdfjs-dist@2.5.207/build/pdf.worker.js'

let documentToExport: PDFDocument

function filesFromDropEvent(event: React.DragEvent<HTMLDivElement>) {
  var files: File[] = []
  if (event.dataTransfer.items) {
    // Use DataTransferItemList interface to access the file(s)
    for (var i = 0; i < event.dataTransfer.items.length; i++) {
      if (event.dataTransfer.items[i].kind === 'file') {
        var file = event.dataTransfer.items[i].getAsFile()
        files.push(file)
      }
    }
  } else {
    for (var i = 0; i < event.dataTransfer.files.length; i++) {
      files.push(file)
    }
  }

  return files
}

async function extractPdfRenderers(data: Uint8Array) {
  // Asynchronous download of PDF
  const pdf = await getDocument(data).promise

  var pages: PDFPageProxy[] = []
  for (let pageIndex = 0; pageIndex < pdf.numPages; pageIndex++) {
    pages.push(await pdf.getPage(pageIndex + 1))
  }
  return pages
}

function dragOverHandler(ev) {
  ev.preventDefault()
}

async function getByteArray(file): Promise<Uint8Array> {
  const fileReader = new FileReader()
  return new Promise(function (resolve, reject) {
    fileReader.onload = function (ev) {
      const array = new Uint8Array(ev.target.result as ArrayBuffer | undefined)
      const fileByteArray = []
      for (let i = 0; i < array.length; i++) {
        fileByteArray.push(array[i])
      }
      resolve(array) // successful
    }
    fileReader.onerror = () => {
      reject // call reject if error
      console.error('error loading file')
    }
    fileReader.readAsArrayBuffer(file)
  })
}

function saveData(typedArray: Uint8Array, fileName: string) {
  const uri = URL.createObjectURL(
    new Blob([typedArray.buffer], { type: 'application/pdf' })
  )
  var downloadLink = document.createElement('a')
  downloadLink.href = uri
  downloadLink.download = fileName

  document.body.appendChild(downloadLink)
  downloadLink.click()
  document.body.removeChild(downloadLink)
}

const IndexPage = () => {
  const [pages, setPages] = useState<PageData[]>([])

  const exportDocument = async () => {
    const pageCount = documentToExport.getPageCount()
    for (var i = 0; i < pageCount; i++) {
      documentToExport.removePage(0)
    }

    pages.forEach((page) => {
      documentToExport.addPage(page.page)
    })
    const pdfBytes = await documentToExport.save()

    saveData(pdfBytes, 'test.pdf')
  }

  const onDropHandler = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    var newPages: PageData[] = []

    const files = filesFromDropEvent(event)

    Promise.all(
      files.map(async (file) => {
        const fileReader = new FileReader()
        fileReader.readAsDataURL(file)

        const pdfData = await getByteArray(file)
        const pageRenderers = await extractPdfRenderers(pdfData)

        if (!documentToExport) {
          documentToExport = await PDFDocument.create()
        }

        const pdfDoc = await PDFDocument.load(pdfData)
        const pages = await documentToExport.copyPages(
          pdfDoc,
          pdfDoc.getPageIndices()
        )

        for (let i = 0; i < pages.length; i++) {
          newPages.push({
            number: i + 1,
            title: file.name,
            pageRenderer: pageRenderers[i],
            page: pages[i],
          })
        }
      })
    ).then(() => {
      setPages((pages) => [...pages, ...newPages])
    })
  }

  const movePageTo = (from: number, to: number) => {
    setPages((prevPages) => {
      prevPages.splice(to, 0, prevPages.splice(from, 1)[0])
      return [...prevPages]
    })
  }

  return (
    <main
      className="p-4"
      style={{ height: '100vh' }}
      id="drop_zone"
      onDrop={onDropHandler}
      onDragOver={dragOverHandler}
    >
      {pages.length !== 0 ? (
        <>
          <button
            className="fixed rounded-lg text-white font-bold text-xl bg-indigo-500 bottom-10 shadow-xl right-10 py-10 px-16"
            onClick={exportDocument}
          >
            Export
          </button>
          <PageGrid pages={pages} movePageTo={movePageTo} />
        </>
      ) : (
        <AddFile />
      )}
    </main>
  )
}

export default IndexPage
