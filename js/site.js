;(function () {
  var C = window.SOBERANIA || {}

  var metaDefaultsSnapshot = null

  function snapshotMetaDefaults() {
    if (metaDefaultsSnapshot) return metaDefaultsSnapshot
    function gc(id, attr) {
      var el = document.getElementById(id)
      if (!el) return ''
      return attr ? el.getAttribute(attr) || '' : el.textContent || ''
    }
    metaDefaultsSnapshot = {
      title: document.title,
      description: gc('meta-description', 'content'),
      ogTitle: gc('meta-og-title', 'content'),
      ogDescription: gc('meta-og-description', 'content'),
      twitterTitle: gc('meta-twitter-title', 'content'),
      twitterDescription: gc('meta-twitter-description', 'content'),
    }
    return metaDefaultsSnapshot
  }

  function applyRouteMeta(mode) {
    snapshotMetaDefaults()
    var d = metaDefaultsSnapshot
    var use =
      mode === 'contenidos'
        ? {
            title:
              'Podcast, YouTube & Instagram | Soberanía Editorial — Demián Testino',
            description:
              'Podcast del sello, canal Ediciones Demián Testino en YouTube (vídeos con métricas públicas), reels en Instagram y señal editorial desde Trelew, Patagonia. Marca INPI.',
            ogTitle: 'Contenidos · Soberanía Editorial — audio, vídeo y redes',
            ogDescription:
              'Podcast, canal @edicionesdemiantestino en YouTube e Instagram del sello. Infra editorial con Soberanía Vault.',
            twitterTitle: 'Contenidos · Soberanía Editorial — podcast y YouTube',
            twitterDescription:
              'Podcast, canal de YouTube oficial y reels @demiantestinoautor.',
          }
        : d

    document.title = use.title
    var md = document.getElementById('meta-description')
    if (md) md.setAttribute('content', use.description)
    var og = document.getElementById('meta-og-title')
    if (og) og.setAttribute('content', use.ogTitle)
    var ogd = document.getElementById('meta-og-description')
    if (ogd) ogd.setAttribute('content', use.ogDescription)
    var tw = document.getElementById('meta-twitter-title')
    if (tw) tw.setAttribute('content', use.twitterTitle)
    var twd = document.getElementById('meta-twitter-description')
    if (twd) twd.setAttribute('content', use.twitterDescription)
  }

  var APP = (function () {
    var raw = (C.APP_BASE || '').trim()
    if (!raw) return 'https://v0-editorial-control-station.vercel.app'
    try {
      return new URL(raw).origin
    } catch (e) {
      return raw.replace(/\/$/, '')
    }
  })()

  function wireLinks() {
    var login = APP + '/login?next=' + encodeURIComponent('/dashboard')
    ;['vault-link-login', 'panel-big-link'].forEach(function (id) {
      var el = document.getElementById(id)
      if (el) el.href = login
    })
    var vPre = document.getElementById('vault-link-precios')
    var vBlg = document.getElementById('vault-link-blog')
    if (vPre) vPre.href = APP + '/precios'
    if (vBlg) vBlg.href = APP + '/blog'
    var digUrl = String(C.DIGITAL_SITE_URL || '').trim()
    var digHref = ''
    if (digUrl) {
      try {
        digHref = new URL(digUrl).origin + '/'
      } catch (e) {
        digHref = digUrl.replace(/\/$/, '') + '/'
      }
    }
    ;['soberania-digital-footer-link', 'soberania-digital-nav', 'soberania-digital-hero-btn'].forEach(function (id) {
      var el = document.getElementById(id)
      if (el && digHref) el.href = digHref
    })
    var yt = String(C.YOUTUBE_CHANNEL_URL || '').trim()
    var ytNav = document.getElementById('youtube-channel-link')
    if (ytNav && yt) {
      try {
        ytNav.href = new URL(yt).href
      } catch (e) {
        ytNav.href = yt
      }
    }
  }

  function injectJsonLd() {
    try {
      var site = (C.SITE_CANONICAL || '').replace(/\/$/, '')
      if (site.indexOf('TU-USUARIO') !== -1) site = ''
      var orgUrl = site || APP
      var data = {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Organization',
            name: 'Soberanía Editorial',
            url: orgUrl,
            logo: 'https://i.ibb.co/WvmMFJJg/sello-editorial.jpg',
            address: {
              '@type': 'PostalAddress',
              addressLocality: 'Trelew',
              addressRegion: 'Chubut',
              addressCountry: 'AR',
            },
          },
          {
            '@type': 'WebSite',
            name: 'Soberanía Editorial',
            url: orgUrl,
            description: 'Catálogo, informes literarios, podcast y Soberanía Vault.',
          },
        ],
      }
      var el = document.createElement('script')
      el.type = 'application/ld+json'
      el.text = JSON.stringify(data)
      document.head.appendChild(el)

      if (orgUrl) {
        var canonicalHref = orgUrl.replace(/\/$/, '') + '/'
        var linkCanon = document.querySelector('link[rel="canonical"]')
        if (!linkCanon) {
          linkCanon = document.createElement('link')
          linkCanon.rel = 'canonical'
          document.head.appendChild(linkCanon)
        }
        linkCanon.href = canonicalHref
        var ogUrl = document.querySelector('meta[property="og:url"]')
        if (!ogUrl) {
          ogUrl = document.createElement('meta')
          ogUrl.setAttribute('property', 'og:url')
          document.head.appendChild(ogUrl)
        }
        ogUrl.setAttribute('content', canonicalHref)
      }
    } catch (e) {}
  }

  function podcastUrl() {
    var src = C.PODCAST_SRC || ''
    if (!src) return ''
    if (/^https?:\/\//i.test(src)) return src
    try {
      return new URL(src, window.location.href).href
    } catch (e) {
      return src
    }
  }

  function formatYtDate(iso) {
    if (!iso) return ''
    try {
      var d = new Date(iso)
      if (isNaN(d.getTime())) return ''
      return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })
    } catch (e) {
      return ''
    }
  }

  function wireYouTube() {
    var C = window.SOBERANIA || {}
    var iframe = document.getElementById('youtube-main-embed')
    var loadingEl = document.getElementById('youtube-player-loading')
    var featuredLabel = document.getElementById('youtube-featured-label')
    var channelVideos = document.getElementById('youtube-all-videos-link')

    var ytBase = String(C.YOUTUBE_CHANNEL_URL || '').trim().replace(/\/$/, '')
    if (channelVideos && ytBase) {
      try {
        channelVideos.href = ytBase + '/videos'
      } catch (e) {
        channelVideos.href = 'https://www.youtube.com/@edicionesdemiantestino/videos'
      }
    }

    function hideLoading() {
      if (loadingEl) loadingEl.style.display = 'none'
    }

    function showEmbedError(msg) {
      hideLoading()
      if (iframe) iframe.removeAttribute('src')
      if (featuredLabel)
        featuredLabel.textContent = msg || 'No se pudo cargar el reproductor. Abrí el canal en YouTube.'
    }

    var listEl = document.getElementById('youtube-latest-inner')
    if (!listEl) return

    fetch('/api/youtube-feed')
      .then(function (r) {
        if (!r.ok) throw new Error('youtube-feed')
        return r.json()
      })
      .then(function (data) {
        var noteEl = document.getElementById('youtube-metrics-source-note')
        if (noteEl) noteEl.textContent = data.metricsNote || ''

        var vids = data.videos || []
        if (!vids.length) {
          showEmbedError('Sin videos en el feed por ahora.')
          listEl.innerHTML =
            '<li class="text-[13px] text-slate-500 italic">No hay datos del feed. Probá más tarde o abrí el canal en YouTube.</li>'
          return
        }

        var first = vids[0]
        if (iframe && first && first.videoId) {
          iframe.src =
            'https://www.youtube.com/embed/' +
            encodeURIComponent(first.videoId) +
            '?rel=0&modestbranding=1'
          hideLoading()
          if (featuredLabel) {
            featuredLabel.textContent =
              'Última subida · ' + String(first.title || '').slice(0, 120)
          }
        } else {
          showEmbedError()
        }

        function trunc(s, n) {
          s = String(s || '')
          if (s.length <= n) return s
          return s.slice(0, n) + '…'
        }
        listEl.innerHTML = vids
          .map(function (v) {
            var meta = formatYtDate(v.published)
            var parts = []
            if (typeof v.views === 'number' && v.views >= 0) {
              parts.push(v.views.toLocaleString('es-AR') + ' vistas')
            }
            if (v.likes != null && !isNaN(v.likes)) {
              parts.push(v.likes.toLocaleString('es-AR') + ' mg')
            }
            if (v.commentCount != null && !isNaN(v.commentCount)) {
              parts.push(v.commentCount.toLocaleString('es-AR') + ' coment.')
            }
            var metrics =
              parts.length > 0 ? ' · ' + parts.join(' · ') : ''
            var titleEsc = String(v.title || '')
              .replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/"/g, '&quot;')
            var href = String(v.url || '#').replace(/"/g, '&quot;')
            var thumb = String(v.thumb || '').replace(/"/g, '&quot;')
            var prev = v.commentsPreview || []
            var previewHtml = ''
            if (prev.length) {
              previewHtml =
                '<div style="margin-top:10px;padding-left:0;font-size:11px;color:#94a3b8;line-height:1.45;font-style:italic;border-top:1px solid rgba(255,255,255,0.06);padding-top:8px">' +
                prev
                  .slice(0, 3)
                  .map(function (c) {
                    var a = String(c.author || '').replace(/</g, '&lt;')
                    var t = trunc(String(c.text || '').replace(/</g, '&lt;'), 160)
                    var lk =
                      c.likes != null && !isNaN(c.likes)
                        ? ' · ' + Number(c.likes).toLocaleString('es-AR') + ' ♥'
                        : ''
                    return (
                      '<div style="margin-bottom:6px"><strong style="color:#cbd5e1;font-style:normal">' +
                      a +
                      '</strong>' +
                      lk +
                      '<div style="margin-top:2px">' +
                      t +
                      '</div></div>'
                    )
                  })
                  .join('') +
                '</div>'
            }
            var vidRaw = String(v.videoId || '').replace(/"/g, '')
            return (
              '<li data-yt-vid="' +
              vidRaw +
              '" style="border-radius:12px;border:1px solid rgba(255,255,255,0.08);background:rgba(0,0,0,0.28);overflow:hidden;margin-bottom:12px;padding:12px;cursor:default">' +
              '<a href="' +
              href +
              '" target="_blank" rel="noopener noreferrer" style="display:flex;gap:12px;text-decoration:none;color:#e2e8f0;align-items:flex-start">' +
              '<img src="' +
              thumb +
              '" alt="" width="120" height="68" style="width:120px;height:68px;object-fit:cover;border-radius:9px;border:1px solid rgba(255,255,255,0.12);flex-shrink:0">' +
              '<span style="min-width:0">' +
              '<span style="display:block;font-size:13px;font-weight:700;font-style:italic;color:#fff;line-height:1.35">' +
              titleEsc +
              '</span>' +
              '<span style="display:block;font-size:11px;color:#64748b;margin-top:6px;font-style:italic">' +
              meta +
              metrics +
              '</span>' +
              '</span>' +
              '</a>' +
              previewHtml +
              '</li>'
            )
          })
          .join('')

        listEl.addEventListener('click', function onYtFeedClick(e) {
          var a = e.target.closest && e.target.closest('a[href*="youtube"]')
          if (!a || !iframe) return
          var li = a.closest && a.closest('li[data-yt-vid]')
          if (!li) return
          if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || e.button !== 0)
            return
          var vid = li.getAttribute('data-yt-vid')
          if (!vid) return
          e.preventDefault()
          iframe.src =
            'https://www.youtube.com/embed/' +
            encodeURIComponent(vid) +
            '?rel=0&modestbranding=1'
          hideLoading()
          if (featuredLabel) {
            var ts = a.querySelector('[style*="font-weight:700"]')
            var tit =
              ts && ts.textContent ? ts.textContent.trim().slice(0, 120) : ''
            featuredLabel.textContent = tit
              ? 'Reproduciendo · ' + tit
              : 'Reproduciendo'
          }
        })
      })
      .catch(function () {
        showEmbedError()
        listEl.innerHTML =
          '<li class="text-[13px] text-slate-500 italic">No se pudo cargar el feed (¿abrís el sitio desde file:// ? Usá la URL en Vercel). Podés ver todo en el canal de YouTube.</li>'
      })
  }

  function wirePodcast() {
    var a = document.getElementById('podcast-audio')
    if (!a) return
    var u = podcastUrl()
    if (u) a.src = u
    var t = document.getElementById('podcast-title')
    var s = document.getElementById('podcast-sub')
    if (t && C.PODCAST_TITLE) t.textContent = C.PODCAST_TITLE
    if (s && C.PODCAST_SUB) s.textContent = C.PODCAST_SUB
  }

  function informeSrc(path) {
    if (!path) return ''
    var q = C.INFORMES_CACHE
    if (!q) return path
    var sep = path.indexOf('?') >= 0 ? '&' : '?'
    return path + sep + 'v=' + encodeURIComponent(String(q))
  }

  function wireInformes() {
    var I = C.INFORMES || {}
    var map = [
      ['iframe-universo', I.universo],
      ['iframe-kaukel', I.kaukel],
      ['iframe-ente', I.ente],
      ['iframe-cubismo', I.cubismo],
      ['iframe-cronicas', I.cronicas],
    ]
    map.forEach(function (pair) {
      var el = document.getElementById(pair[0])
      if (el && pair[1]) el.src = informeSrc(pair[1])
    })
  }

  function playTrollFanfare() {
    try {
      var AC = window.AudioContext || window.webkitAudioContext
      if (!AC) return
      var ctx = new AC()
      var freqs = [196, 233, 262, 294, 349]
      var t0 = ctx.currentTime
      freqs.forEach(function (f, i) {
        var osc = ctx.createOscillator()
        var gn = ctx.createGain()
        osc.type = 'triangle'
        osc.frequency.value = f
        gn.gain.setValueAtTime(0.13, t0 + i * 0.1)
        gn.gain.exponentialRampToValueAtTime(0.001, t0 + i * 0.1 + 0.32)
        osc.connect(gn)
        gn.connect(ctx.destination)
        osc.start(t0 + i * 0.1)
        osc.stop(t0 + i * 0.1 + 0.34)
      })
    } catch (e) {}
  }

  function showTrollOverlay() {
    playTrollFanfare()
    var el = document.getElementById('soberania-troll-overlay')
    if (el) {
      el.classList.add('is-on')
      el.setAttribute('aria-hidden', 'false')
    }
    document.body.style.overflow = 'hidden'
  }

  function hideTrollOverlay() {
    var el = document.getElementById('soberania-troll-overlay')
    if (el) {
      el.classList.remove('is-on')
      el.setAttribute('aria-hidden', 'true')
    }
    document.body.style.overflow = ''
  }

  window.hideSoberaniaTroll = hideTrollOverlay

  function setContactStatus(kind, msg) {
    var st = document.getElementById('contact-form-status')
    if (!st) return
    st.className = ''
    if (!msg) {
      st.style.display = 'none'
      st.textContent = ''
      return
    }
    st.style.display = 'block'
    st.textContent = msg
    st.classList.add(kind === 'ok' ? 'ok' : 'err')
  }

  function wireContactForm() {
    var form = document.getElementById('soberania-contact-form')
    if (!form) return
    form.addEventListener('submit', function (e) {
      e.preventDefault()
      var hpEl = form.querySelector('[name="hp_company"]')
      if (hpEl && String(hpEl.value || '').trim() !== '') {
        showTrollOverlay()
        return
      }
      var fd = new FormData(form)
      var webhook = String(C.MAKE_CONTACT_WEBHOOK_URL || '').trim()
      if (!webhook) {
        setContactStatus(
          'err',
          'Falta configurar el webhook en config.js. Escribinos por email.',
        )
        return
      }
      var params = new URLSearchParams()
      params.set('nombre', fd.get('nombre') || '')
      params.set('email', fd.get('email') || '')
      params.set('genero', fd.get('genero') || '')
      params.set('estado', fd.get('estado') || '')
      params.set('link', fd.get('link') || '')
      params.set('es_extranjero', fd.get('es_extranjero') || '')
      params.set('pais_origen', fd.get('pais_origen') || '')
      params.set('idioma_original', fd.get('idioma_original') || '')
      params.set('estado_obra', fd.get('estado_obra') || '')
      params.set('servicio_requerido', fd.get('servicio_requerido') || '')
      params.set('extension_obra', fd.get('extension_obra') || '')
      params.set('mensaje', fd.get('mensaje') || '')
      var btn = document.getElementById('soberania-contact-submit')
      if (btn) {
        btn.disabled = true
        btn.textContent = 'Enviando…'
      }
      setContactStatus('', '')
      fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      })
        .then(function (r) {
          if (r.ok) {
            setContactStatus('ok', 'Recibimos tu mensaje. Te respondemos por email.')
            form.reset()
            return
          }
          setContactStatus(
            'err',
            'No se pudo enviar. Escribinos por email o probá más tarde.',
          )
        })
        .catch(function () {
          setContactStatus(
            'err',
            'Sin conexión o el servidor no responde. Escribinos por email.',
          )
        })
        .finally(function () {
          if (btn) {
            btn.disabled = false
            btn.textContent = 'Enviar para Evaluación Técnica'
          }
        })
    })
  }

  function buildReels() {
    var grid = document.getElementById('reels-grid-inner')
    if (!grid) return
    var reels = C.REELS || []
    grid.innerHTML = reels
      .map(function (r) {
        var thumb = (r.thumb || '').replace(/'/g, '%27')
        var style = thumb
          ? "background-image:url('" +
            thumb +
            "');background-size:cover;background-position:center;"
          : 'background:linear-gradient(145deg,#0f172a,#1e293b);'
        return (
          '<a href="' +
          r.href +
          '" target="_blank" rel="noopener noreferrer" class="reel-tile group block rounded-2xl overflow-hidden border border-slate-700/80 hover:border-sky-500/50 transition shadow-xl aspect-[9/16] max-h-[340px] relative" style="' +
          style +
          '">' +
          '<span class="absolute inset-0 bg-black/35 group-hover:bg-black/20 transition"></span>' +
          '<span class="absolute inset-0 flex flex-col items-center justify-end p-4 pb-5">' +
          '<span class="w-14 h-14 rounded-full bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center mb-2 group-hover:scale-105 transition">' +
          '<svg width="26" height="26" fill="white" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></span>' +
          '<span class="text-[10px] font-black uppercase tracking-widest text-white italic text-center drop-shadow-lg">' +
          (r.label || 'Instagram') +
          '</span>' +
          '<span class="text-[9px] text-sky-200/90 mt-1">@demiantestinoautor · abrir</span>' +
          '</span></a>'
        )
      })
      .join('')
  }

  function setNavActive(mode) {
    document.querySelectorAll('[data-spa-nav]').forEach(function (btn) {
      var m = btn.getAttribute('data-spa-nav')
      var on = m === mode
      btn.classList.toggle('text-sky-400', on)
      btn.classList.toggle('border-sky-500/50', on)
      if (on) btn.setAttribute('aria-current', 'page')
      else btn.removeAttribute('aria-current')
    })
  }

  var siteScroll = document.getElementById('site-scroll')
  var spaShell = document.getElementById('spa-shell')

  window.SoberaniaSPA = {
    go: function (mode) {
      try {
        if (
          mode === 'scroll-vidriera' ||
          mode === 'scroll-catalogo' ||
          mode === 'scroll-preview' ||
          mode === 'scroll-servicios' ||
          mode === 'scroll-contacto'
        ) {
          document.querySelectorAll('.spa-view').forEach(function (el) {
            el.classList.add('hidden')
          })
          if (siteScroll) siteScroll.classList.remove('hidden')
          if (spaShell) spaShell.classList.add('spa-min')
          var id =
            mode === 'scroll-vidriera'
              ? 'vidriera'
              : mode === 'scroll-catalogo'
                ? 'catalogo'
                : mode === 'scroll-preview'
                  ? 'preview'
                  : mode === 'scroll-servicios'
                    ? 'servicios'
                    : 'contacto'
          setNavActive(mode)
          requestAnimationFrame(function () {
            var target = document.getElementById(id)
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' })
          })
          return
        }

        if (mode === 'home') {
          document.querySelectorAll('.spa-view').forEach(function (el) {
            el.classList.toggle('hidden', el.id !== 'view-home')
          })
          if (siteScroll) siteScroll.classList.remove('hidden')
          if (spaShell) spaShell.classList.remove('spa-min')
          setNavActive('home')
          window.scrollTo({ top: 0, behavior: 'smooth' })
          return
        }

        var viewId = 'view-' + mode
        document.querySelectorAll('.spa-view').forEach(function (el) {
          el.classList.toggle('hidden', el.id !== viewId)
        })
        if (siteScroll) siteScroll.classList.add('hidden')
        if (spaShell) spaShell.classList.remove('spa-min')
        setNavActive(mode)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } finally {
        applyRouteMeta(mode)
      }
    },
  }

  document.addEventListener('DOMContentLoaded', function () {
    wireLinks()
    injectJsonLd()
    snapshotMetaDefaults()
    wirePodcast()
    wireYouTube()
    wireInformes()
    buildReels()
    window.SoberaniaSPA.go('home')

    document.querySelectorAll('[data-spa-nav]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault()
        var mode = btn.getAttribute('data-spa-nav')
        if (mode) window.SoberaniaSPA.go(mode)
      })
    })
    wireContactForm()
  })
})()

function openModal(id) {
  var m = document.getElementById(id)
  if (m) {
    m.style.display = 'flex'
    document.body.style.overflow = 'hidden'
  }
}
function closeModal(id) {
  var m = document.getElementById(id)
  if (m) {
    m.style.display = 'none'
    document.body.style.overflow = 'auto'
  }
}
window.addEventListener('click', function (e) {
  if (e.target.classList && e.target.classList.contains('modal')) {
    e.target.style.display = 'none'
    document.body.style.overflow = 'auto'
  }
})

function toggleExt(cb) {
  var c = document.getElementById('campos-ext')
  var bg = document.getElementById('ext-bg')
  var dot = document.getElementById('ext-dot')
  if (cb.checked) {
    c.style.display = 'block'
    bg.style.background = '#0ea5e9'
    dot.style.transform = 'translateX(22px)'
  } else {
    c.style.display = 'none'
    bg.style.background = 'rgba(255,255,255,0.1)'
    dot.style.transform = 'translateX(0)'
  }
}
