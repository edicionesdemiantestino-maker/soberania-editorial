/**
 * SOLO EDITÁ ESTE ARCHIVO cuando publiques el sitio.
 *
 * PODCAST_SRC — ruta al audio (relativa al sitio) o URL absoluta si lo subís a Supabase Storage.
 * REELS — cada reel: url de Instagram + thumb (imagen previa). Podés cambiar thumbs por capturas.
 */
window.SOBERANIA = {
  SITE_CANONICAL: 'https://edicionesdemiantestino-maker.github.io/soberania-editorial',
  APP_BASE: 'https://v0-editorial-control-station-kasswdea0.vercel.app',
  SUPABASE_URL: 'https://wjsxlwsqjvuyjrdngvyo.supabase.co',
  SUPABASE_ANON_KEY:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indqc3hsd3NxanZ1eWpyZG5ndnlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3MzY0NzksImV4cCI6MjA1NzMxMjQ3OX0.x0jG4Jk-0JxRBPu4i3_4vrzFMzL6vbzo5fjfRHOy_w8',

  PODCAST_SRC: 'media/Nueve_libros_para_apagar_Wall_Street.m4a',
  PODCAST_TITLE: 'Nueve libros para apagar Wall Street',
  PODCAST_SUB: 'Audio · podcast',

  INFORMES: {
    universo: 'informes/testino_universo_literario.html',
    kaukel: 'informes/informe_trilogia_kaukel.html',
    ente: 'informes/informe_trilogia_frecuencia_cero.html',
  },

  REELS: [
    {
      href: 'https://www.instagram.com/reel/DWcYhl0kZO9/',
      label: 'Reel 01',
      thumb: 'https://i.ibb.co/zWxrHGjS/Copilot-20260323-172254.jpg',
    },
    {
      href: 'https://www.instagram.com/reel/DWprvL5Ef26/',
      label: 'Reel 02',
      thumb: 'https://i.ibb.co/939Wbyb1/Copilot-20260325-205511.png',
    },
    {
      href: 'https://www.instagram.com/reel/DWptglHkU3N/',
      label: 'Reel 03',
      thumb: 'https://i.ibb.co/m5jjt92d/Gemini-Generated-Image-7pko2k7pko2k7pko.png',
    },
    {
      href: 'https://www.instagram.com/reel/DWttklaEUM9/',
      label: 'Reel 04',
      thumb: 'https://i.ibb.co/mCnzrcpT/tapa-amazon-kaukel-conv-0.png',
    },
    {
      href: 'https://www.instagram.com/reel/DV4bWmuRrgi/',
      label: 'Reel 05',
      thumb: 'https://i.ibb.co/1GHNGwb1/Saga-El-Ente-de-la-Frecuencia-Cero-Demi-n-A-Testino-conv-0.png',
    },
    {
      href: 'https://www.instagram.com/reel/DV93oLbETVM/',
      label: 'Reel 06',
      thumb: 'https://i.ibb.co/DH22FjNY/Tapa-conv-0.png',
    },
  ],
}
