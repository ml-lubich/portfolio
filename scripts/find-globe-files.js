import { readdirSync, statSync } from 'fs'
import { join } from 'path'

function walk(dir) {
  let results = []
  try {
    const list = readdirSync(dir)
    for (const file of list) {
      const fullPath = join(dir, file)
      try {
        const stat = statSync(fullPath)
        if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules' && file !== '.next') {
          results = results.concat(walk(fullPath))
        } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.js')) {
          results.push(fullPath)
        }
      } catch (e) {}
    }
  } catch (e) {}
  return results
}

const files = walk('/vercel/share/v0-project')
console.log('[v0] All source files:')
for (const f of files) {
  console.log('[v0]', f)
}
