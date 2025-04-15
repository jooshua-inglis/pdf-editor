'use client'
import React, { useState } from 'react'
import type { PageData } from '@/components/page'
import PageGrid from '@/components/pageGrid'
import { PDFPageProxy, getDocument, GlobalWorkerOptions } from 'pdfjs-dist'
import { PDFDocument, PDFPage } from 'pdf-lib'
import AddFile from '@/components/addFiles'
import * as uuid from 'uuid'
import { Button } from '@/components/ui/button'

// Setting worker path to worker bundle.
GlobalWorkerOptions.workerSrc = 'https://npmcdn.com/pdfjs-dist@3.0.279/build/pdf.worker.js'

function filesFromDropEvent(event: React.DragEvent<HTMLDivElement>) {
    const files: File[] = []
    for (var i = 0; i < event.dataTransfer.items.length; i++) {
        if (event.dataTransfer.items[i].kind === 'file') {
            const file = event.dataTransfer.items[i].getAsFile()
            file && files.push(file)
        }
    }
    return files
}

async function extractPdfRenderers(data: Uint8Array) {
    const pdf = await getDocument(data).promise

    var pages: PDFPageProxy[] = []
    for (let pageIndex = 0; pageIndex < pdf.numPages; pageIndex++) {
        pages.push(await pdf.getPage(pageIndex + 1))
    }
    return pages
}

async function getByteArray(file: File): Promise<Uint8Array> {
    const fileReader = new FileReader()
    return new Promise(function (resolve, reject) {
        fileReader.onload = function (ev) {
            if (ev.target?.result == null) {
                return
            }
            if (typeof ev.target.result === 'string') {
                return
            }
            resolve(new Uint8Array(ev.target.result))
        }
        fileReader.onerror = () => {
            reject('error loading file')
        }

        fileReader.readAsArrayBuffer(file)
    })
}

function saveData(typedArray: Uint8Array, fileName: string) {
    const uri = URL.createObjectURL(new Blob([typedArray.buffer], { type: 'application/pdf' }))
    var downloadLink = document.createElement('a')
    downloadLink.href = uri
    downloadLink.download = fileName

    document.body.appendChild(downloadLink)
    downloadLink.click()
    document.body.removeChild(downloadLink)
}

function openFilePicker() {
    const input = document.createElement('input')
    input.type = 'file'
    input.click()
    return new Promise<File[]>((resolve, reject) => {
        input.onchange = () => {
            const curFiles = input.files
            resolve(curFiles ? [...curFiles] : [])
        }
        input.onerror = (event) => {
            if (typeof event === 'string') {
                return reject(new Error(event))
            }
            return reject(new Error('Could not get file'))
        }
    })
}

export default function Home() {
    const [pages, setPages] = useState<PageData[]>([])

    const importDocument = async () => {
        const files = await openFilePicker()
        await addFiles(files)
    }

    const exportDocument = async () => {
        const documentToExport = await PDFDocument.create()

        const docMap = new Map<string, PDFDocument>()
        const pagesMap = new Map<string, PDFPage[]>()
        for (const p of pages) {
            docMap.set(p.docTitle, p.page.doc)
        }

        for (const [t, d] of Array.from(docMap)) {
            const copiedPages = await documentToExport.copyPages(d, d.getPageIndices())
            pagesMap.set(t, copiedPages)
        }

        pages.forEach((page) => {
            const copiedPage = pagesMap.get(page.docTitle)?.[page.number - 1]
            console.log(page.number)
            if (!copiedPage) {
                console.error('could not find page')
                return
            }
            documentToExport.addPage(copiedPage)
        })
        const pdfBytes = await documentToExport.save()

        saveData(pdfBytes, 'edited.pdf')
    }
    const addFiles = async (files: File[]) => {
        const newPages: PageData[] = []
        await Promise.all(
            files.map(async (file) => {
                const fileReader = new FileReader()
                fileReader.readAsDataURL(file)

                const pdfData = await getByteArray(file)
                const pageRenderers = await extractPdfRenderers(pdfData)

                const pdfDoc = await PDFDocument.load(pdfData)
                const pages = pdfDoc.getPages()

                for (let i = 0; i < pages.length; i++) {
                    newPages.push({
                        id: uuid.v4(),
                        number: i + 1,
                        docTitle: file.name,
                        pageRenderer: pageRenderers[i],
                        page: pages[i],
                    })
                }
            })
        )
        setPages((pages) => [...pages, ...newPages])
    }
    const onDropHandler = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault()
        return addFiles(filesFromDropEvent(event))
    }

    const movePageTo = (from: number, to: number) => {
        console.log(pages)
        setPages((prevPages) => {
            prevPages.splice(to, 0, prevPages.splice(from, 1)[0])
            return [...prevPages]
        })
    }

    const deletePage = (index: number) => {
        setPages((prevPages) => {
            prevPages.splice(index, 1)
            return [...prevPages]
        })
    }

    return (
        <div
            className="h-[1px] min-h-[100dvh] bg-[linear-gradient(to_right,#80808033_1px,transparent_1px),linear-gradient(to_bottom,#80808033_1px,transparent_1px)] bg-[size:70px_70px] p-4 prose-h4:xl:text-2xl prose-h4:lg:text-xl prose-h4:text-lg"
            id="drop_zone"
            onDrop={onDropHandler}
            onDragOver={(e) => e.preventDefault()}>
            <div className="z-50 fixed flex flex-col-reverse bottom-10 right-10 gap-10">
                {pages.length !== 0 && (
                    <Button size="xl" onClick={exportDocument}>
                        Export
                    </Button>
                )}
                <Button size="xl" onClick={importDocument}>
                    Import
                </Button>
            </div>
            {pages.length !== 0 ? (
                <>
                    <PageGrid pages={pages} movePageTo={movePageTo} deletePage={deletePage} />
                </>
            ) : (
                <AddFile />
            )}
        </div>
    )
}
