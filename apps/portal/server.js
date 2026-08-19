import { serve } from '@hono/node-server'
import app from './app.js'

const port = 3000

console.log(`Server gestart op http://localhost:${port}`)
console.log(`Directe Bookmark Test URL: http://localhost:${port}/Customers/123-Aramco/Contact/356-Jenssen/edit`)

serve({ fetch: app.fetch, port })
