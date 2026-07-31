import { spawn } from 'node:child_process'
import { readFile, mkdir, rm, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const config = JSON.parse(await readFile(new URL('../decks.json', import.meta.url), 'utf8'))
const outputRoot = resolve('dist')
const slidev = resolve('node_modules/.bin/slidev')

function normalizeBase(value) {
  return `/${value.split('/').filter(Boolean).join('/')}/`
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function run(command, args) {
  return new Promise((resolveRun, reject) => {
    const child = spawn(command, args, { stdio: 'inherit' })
    child.once('error', reject)
    child.once('exit', (code, signal) => {
      if (code === 0) {
        resolveRun()
        return
      }

      reject(new Error(`${command} exited with ${signal ? `signal ${signal}` : `code ${code}`}`))
    })
  })
}

if (!Array.isArray(config.decks) || config.decks.length === 0) {
  throw new Error('decks.json must contain at least one deck')
}

const seenSlugs = new Set()
for (const deck of config.decks) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(deck.slug)) {
    throw new Error(`Invalid deck slug: ${deck.slug}`)
  }
  if (seenSlugs.has(deck.slug)) {
    throw new Error(`Duplicate deck slug: ${deck.slug}`)
  }
  if (typeof deck.title !== 'string' || typeof deck.entry !== 'string') {
    throw new Error(`Deck ${deck.slug} must have string title and entry values`)
  }
  seenSlugs.add(deck.slug)
}

const repository =
  process.env.GITHUB_REPOSITORY?.split('/').at(-1) || config.repository
const siteBase = normalizeBase(process.env.SLIDEV_SITE_BASE || repository)

await rm(outputRoot, { recursive: true, force: true })
await mkdir(outputRoot, { recursive: true })

for (const deck of config.decks) {
  const deckBase = normalizeBase(`${siteBase}${deck.slug}`)
  const deckOutput = resolve(outputRoot, deck.slug)

  console.log(`\nBuilding ${deck.slug} at ${deckBase}`)
  await run(slidev, [
    'build',
    deck.entry,
    '--base',
    deckBase,
    '--out',
    deckOutput,
  ])
}

const deckLinks = config.decks
  .map(
    (deck) =>
      `<li><a href="./${encodeURIComponent(deck.slug)}/">${escapeHtml(deck.title)}</a><code>${escapeHtml(deck.slug)}</code></li>`,
  )
  .join('\n')

const index = `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" href="data:," />
    <title>${escapeHtml(config.siteTitle)}</title>
    <style>
      :root {
        color-scheme: light;
        font-family: "Noto Sans KR", system-ui, sans-serif;
        background: #f5f7fb;
        color: #172033;
      }
      body {
        max-width: 56rem;
        margin: 0 auto;
        padding: 10vh 1.5rem;
      }
      h1 { font-size: clamp(2rem, 5vw, 3.5rem); margin-bottom: 2.5rem; }
      ul { display: grid; gap: 1rem; padding: 0; list-style: none; }
      li {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        padding: 1.25rem 1.5rem;
        border: 1px solid #dce2ed;
        border-radius: 1rem;
        background: white;
        box-shadow: 0 0.5rem 1.5rem rgb(30 46 78 / 8%);
      }
      a { color: #174ea6; font-size: 1.2rem; font-weight: 700; text-decoration: none; }
      a:hover { text-decoration: underline; }
      code { color: #6a7384; }
    </style>
  </head>
  <body>
    <main>
      <h1>${escapeHtml(config.siteTitle)}</h1>
      <ul>${deckLinks}</ul>
    </main>
  </body>
</html>
`

await writeFile(resolve(outputRoot, 'index.html'), index)
await writeFile(resolve(outputRoot, '.nojekyll'), '')

console.log(`\nBuilt ${config.decks.length} deck(s) under ${siteBase}`)
