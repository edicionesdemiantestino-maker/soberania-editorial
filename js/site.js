;(function () {
  var C = window.SOBERANIA || {}

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
      if (mode === 'scroll-vidriera' || mode === 'scroll-catalogo' || mode === 'scroll-preview' || mode === 'scroll-servicios' || mode === 'scroll-contacto') {
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
    },
  }

  document.addEventListener('DOMContentLoaded', function () {
    wireLinks()
    injectJsonLd()
    wirePodcast()
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
