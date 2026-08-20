import { readdir, readFile } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

export async function discoverApps(rootDir = join(__dirname, '..')) {
  const apps = []
  
  try {
    const entries = await readdir(rootDir, { withFileTypes: true })
    
    for (const entry of entries) {
      if (!entry.isDirectory()) continue
      
      const appDir = join(rootDir, entry.name)
      const portalJsonPath = join(appDir, 'portal.json')
      
      try {
        const portalJsonContent = await readFile(portalJsonPath, 'utf-8')
        const portalJson = JSON.parse(portalJsonContent)
        
        apps.push({
          name: entry.name,
          fullname: portalJson.fullname,
          category: portalJson.category || 'default',
          basePath: `/${entry.name}`,
          mountPath: portalJson.mountPath || `/${entry.name}`,
          modulePath: join('../', entry.name, portalJson.appEntry || 'app.js')
        })
      } catch (err) {
        // Skip directories without portal.json
      }
    }
  } catch (err) {
    console.error('Error discovering apps:', err)
  }
  
  // Sort by category (ascending), then by fullname (ascending)
  return apps.sort((a, b) => {
    const categoryCompare = a.category.localeCompare(b.category)
    if (categoryCompare !== 0) return categoryCompare
    return a.fullname.localeCompare(b.fullname)
  })
}
