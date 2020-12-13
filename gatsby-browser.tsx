import React from 'react'
import './layout.css'
import 'tailwindcss/tailwind.css'
import { Head } from './src/components/head'

// Logs when the client route changes
// Wraps every page in a component
export const wrapPageElement = ({ element, props }) => {
    return (
        <main>
            <Head />
            {element}
        </main>
    )
}
