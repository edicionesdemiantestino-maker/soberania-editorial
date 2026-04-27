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

  function wireInformes() {
    var I = C.INFORMES || {}
    var map = [
      ['iframe-universo', I.universo],
      ['iframe-kaukel', I.kaukel],
      ['iframe-ente', I.ente],
    ]
    map.forEach(function (pair) {
      var el = document.getElementById(pair[0])
      if (el && pair[1]) el.src = pair[1]
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
  if (e.target === document.getElementById('purchaseModal')) closePurchaseModal()
})

var purchaseLinks = {
  kaukel: { url: 'https://mpago.la/1DA4uYq', label: 'Saga Káukel — $35.000 ARS' },
  ente: { url: 'https://mpago.la/2HcSsX4', label: 'El Ente de la Frecuencia Cero — $20.000 ARS' },
  combo: { url: 'https://mpago.la/2L3PFuK', label: 'Combo Soberanía (Káukel + El Ente) — $50.000 ARS' },
}
function openPurchase(type) {
  var data = purchaseLinks[type]
  if (!data) return
  document.getElementById('purchaseLink').href = data.url
  document.getElementById('purchaseProductLabel').textContent = data.label
  document.getElementById('purchaseModal').style.display = 'flex'
  document.body.style.overflow = 'hidden'
}
function closePurchaseModal() {
  document.getElementById('purchaseModal').style.display = 'none'
  document.body.style.overflow = 'auto'
}

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
