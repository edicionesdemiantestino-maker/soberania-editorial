/**
 * Últimos videos del canal + métricas públicas.
 * 1) Si existe YOUTUBE_API_KEY (solo servidor / Vercel): YouTube Data API v3.
 * 2) Si no hay clave o falla cuota/red: RSS público (sin likes/comentarios detallados).
 *
 * OAuth no es necesario para leer datos públicos del canal (playlist uploads,
 * estadísticas y comentarios top-level públicos).
 */

const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID || 'UCBPbTyB4YyZRNlNrD3KUzZQ'
const UPLOADS_PLAYLIST_ID =
  process.env.YOUTUBE_UPLOADS_PLAYLIST_ID || 'UUBPbTyB4YyZRNlNrD3KUzZQ'
const API_KEY = process.env.YOUTUBE_API_KEY || ''
/** Cuántos videos reciben hilo de comentarios (cada uno ~1 unidad de cuota). */
const COMMENT_PREVIEW_VIDEOS = Math.min(
  4,
  Math.max(0, parseInt(process.env.YOUTUBE_COMMENT_PREVIEW_VIDEOS || '2', 10) || 2),
)

function decodeXml(text) {
  return String(text || '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}

function parseEntries(xml) {
  const parts = xml.split('<entry>')
  const videos = []
  for (let i = 1; i < parts.length && videos.length < 15; i++) {
    const block = parts[i]
    const vid =
      block.match(/<yt:videoId>([^<]+)<\/yt:videoId>/) ||
      block.match(/youtube\.com\/watch\?v=([^&"<]+)/)
    const titleM = block.match(/<title>([^<]*)<\/title>/)
    const pubM = block.match(/<published>([^<]+)<\/published>/)
    const viewsM = block.match(/<media:statistics views="(\d+)"/)
    const thumbM = block.match(/<media:thumbnail[^>]*url="([^"]+)"/)
    if (!vid || !titleM) continue
    videos.push({
      videoId: vid[1],
      title: decodeXml(titleM[1]),
      published: pubM ? pubM[1] : '',
      views: viewsM ? Number(viewsM[1]) : null,
      likes: null,
      commentCount: null,
      thumb: thumbM ? thumbM[1] : `https://i.ytimg.com/vi/${vid[1]}/hqdefault.jpg`,
      url: `https://www.youtube.com/watch?v=${vid[1]}`,
      commentsPreview: [],
      metricsSource: 'rss',
    })
  }
  return videos
}

async function fetchJson(url) {
  const r = await fetch(url, {
    headers: { Accept: 'application/json' },
  })
  const text = await r.text()
  let data
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error(`Invalid JSON ${r.status}`)
  }
  if (!r.ok) {
    const msg = data.error?.message || text.slice(0, 200)
    const err = new Error(msg)
    err.status = r.status
    err.details = data.error
    throw err
  }
  return data
}

function stripTags(html) {
  return String(html || '').replace(/<[^>]+>/g, '').trim()
}

/** playlistItems + videos.statistics + opcional commentThreads (primeros videos). */
async function fetchViaDataApi(apiKey) {
  const base = 'https://www.googleapis.com/youtube/v3/'
  const q = (params) =>
    new URLSearchParams({ ...params, key: apiKey }).toString()

  const plUrl = `${base}playlistItems?${q({
    part: 'snippet,contentDetails',
    maxResults: '12',
    playlistId: UPLOADS_PLAYLIST_ID,
  })}`
  const pl = await fetchJson(plUrl)
  const items = pl.items || []
  const ids = items
    .map((row) => row.contentDetails?.videoId || row.snippet?.resourceId?.videoId)
    .filter(Boolean)
  if (!ids.length) {
    return { channelTitle: '', videos: [], source: 'youtube_data_api_v3' }
  }

  const vidUrl = `${base}videos?${q({
    part: 'snippet,statistics',
    id: ids.slice(0, 50).join(','),
  })}`
  const vd = await fetchJson(vidUrl)
  const byId = {}
  for (const v of vd.items || []) {
    byId[v.id] = v
  }

  const videos = ids.map((id) => {
    const v = byId[id]
    const sn = v?.snippet || {}
    const st = v?.statistics || {}
    const thumbs = sn.thumbnails || {}
    const thumb =
      thumbs.medium?.url || thumbs.high?.url || thumbs.default?.url || ''
    return {
      videoId: id,
      title: sn.title || '',
      published: sn.publishedAt || '',
      views: st.viewCount != null ? Number(st.viewCount) : null,
      likes: st.likeCount != null ? Number(st.likeCount) : null,
      commentCount: st.commentCount != null ? Number(st.commentCount) : null,
      thumb,
      url: `https://www.youtube.com/watch?v=${id}`,
      commentsPreview: [],
      metricsSource: 'youtube_data_api_v3',
    }
  })

  let channelTitle = ''
  if (videos[0]) {
    const first = byId[ids[0]]
    channelTitle = first?.snippet?.channelTitle || ''
  }

  const previewIds = ids.slice(0, COMMENT_PREVIEW_VIDEOS)
  for (const vid of previewIds) {
    try {
      const ctUrl = `${base}commentThreads?${q({
        part: 'snippet,replies',
        videoId: vid,
        maxResults: '5',
        order: 'relevance',
      })}`
      const ct = await fetchJson(ctUrl)
      const target = videos.find((x) => x.videoId === vid)
      if (!target) continue
      const threads = ct.items || []
      target.commentsPreview = threads.map((t) => {
        const top = t.snippet?.topLevelComment?.snippet || {}
        return {
          author: top.authorDisplayName || '',
          text: stripTags(top.textDisplay || top.textOriginal || ''),
          likes: top.likeCount != null ? Number(top.likeCount) : null,
        }
      })
    } catch {
      /* quota o comentarios deshabilitados en el video */
    }
  }

  return {
    channelTitle,
    videos,
    source: 'youtube_data_api_v3',
  }
}

async function fetchViaRss() {
  const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(CHANNEL_ID)}`
  const r = await fetch(rssUrl, {
    headers: { Accept: 'application/xml, text/xml, */*' },
  })
  if (!r.ok) throw new Error(`RSS ${r.status}`)
  const xml = await r.text()
  const head = xml.split('<entry>')[0] || xml
  const channelTitleM = head.match(/<title>([^<]*)<\/title>/)
  const videos = parseEntries(xml)
  return {
    channelTitle: channelTitleM ? decodeXml(channelTitleM[1]) : '',
    videos,
    source: 'rss',
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  let payload
  let used = 'rss'

  if (API_KEY && API_KEY.length > 10) {
    try {
      payload = await fetchViaDataApi(API_KEY)
      used = 'youtube_data_api_v3'
      if (!payload.videos.length) {
        payload = await fetchViaRss()
        used = 'rss_fallback_empty'
      }
    } catch (e) {
      console.error('youtube-feed API:', e.message || e)
      try {
        payload = await fetchViaRss()
        used = 'rss_fallback_error'
      } catch (e2) {
        console.error('youtube-feed RSS:', e2)
        res.status(500).json({ error: 'Could not load channel data' })
        return
      }
    }
  } else {
    try {
      payload = await fetchViaRss()
      used = 'rss'
    } catch (e2) {
      console.error('youtube-feed RSS:', e2)
      res.status(500).json({ error: 'RSS error' })
      return
    }
  }

  const cache =
    used.startsWith('youtube')
      ? 'public, s-maxage=900, stale-while-revalidate=7200'
      : 'public, s-maxage=1800, stale-while-revalidate=86400'

  res.setHeader('Cache-Control', cache)
  res.status(200).json({
    channelId: CHANNEL_ID,
    channelTitle: payload.channelTitle,
    videos: payload.videos,
    feedSource: used,
    metricsNote:
      used.includes('youtube_data_api_v3')
        ? 'Métricas vía YouTube Data API (vistas, likes, comentarios públicos).'
        : 'Métricas limitadas al feed RSS; configurá YOUTUBE_API_KEY en Vercel para datos completos.',
  })
}
