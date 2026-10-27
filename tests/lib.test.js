import test from 'node:test'
import assert from 'node:assert/strict'
import { parseDays, parseRange, weekSchedule, openStatus, slotsFor, jakartaNow, upcomingDays } from '../src/lib/hours.js'
import { toDinasti } from '../src/lib/brand.js'

const CURRENT = [
  { hari: 'Senin – Jumat', jam: '16:00 – 21:00', tutup: false },
  { hari: 'Sabtu', jam: '10:00 – 21:00', tutup: false },
  { hari: 'Minggu', jam: '10:00 – 21:00', tutup: false },
]

test('parses day ranges, lists and wrap-around', () => {
  assert.deepEqual([...parseDays('Senin – Jumat')].sort(), [1, 2, 3, 4, 5])
  assert.deepEqual([...parseDays('Sabtu, Minggu')].sort(), [0, 6])
  assert.deepEqual([...parseDays("Jum'at - Senin")].sort(), [0, 1, 5, 6])
  assert.equal(parseDays('Setiap hari').size, 7)
})

test('parses hour ranges in either separator style', () => {
  assert.deepEqual(parseRange('16:00 – 21:00'), [960, 1260])
  assert.deepEqual(parseRange('10.00-21.00'), [600, 1260])
  assert.equal(parseRange('Tutup'), null)
})

test('open status follows the CMS schedule', () => {
  const week = weekSchedule(CURRENT)
  assert.deepEqual(openStatus(week, { day: 1, minutes: 17 * 60 }), { open: true, closesAt: '21:00' })
  assert.deepEqual(openStatus(week, { day: 1, minutes: 10 * 60 }), { open: false, next: 'hari ini 16:00' })
  assert.deepEqual(openStatus(week, { day: 5, minutes: 22 * 60 }), { open: false, next: 'besok 10:00' })
  // A day closed in the CMS is skipped.
  const withMondayOff = weekSchedule([...CURRENT, { hari: 'Senin', jam: '', tutup: true }])
  assert.deepEqual(openStatus(withMondayOff, { day: 0, minutes: 22 * 60 }), { open: false, next: 'Selasa 16:00' })
})

test('booking slots stay inside opening hours and skip past times', () => {
  const week = weekSchedule(CURRENT)
  const sat = slotsFor(week, 6)
  assert.equal(sat[0], '10:00')
  assert.equal(sat.at(-1), '20:30')
  assert.deepEqual(slotsFor(week, 1, { after: 20 * 60 }), ['20:30'])
})

test('jakartaNow reads WIB regardless of the host timezone', () => {
  // 2026-10-26T09:30:00Z is Monday 16:30 in Jakarta (UTC+7).
  assert.deepEqual(jakartaNow(new Date('2026-10-26T09:30:00Z')), { day: 1, minutes: 16 * 60 + 30 })
})

test('brand rename keeps the barber\'s own name', () => {
  assert.equal(toDinasti('Hasil cukur Ikbar Barbershop'), 'Hasil cukur Dinasti Barbershop')
  assert.equal(toDinasti('Tanya ke IKBAR'), 'Tanya ke DINASTI')
  assert.equal(toDinasti('Dicukur oleh Ikbar Kamil'), 'Dicukur oleh Ikbar Kamil')
  assert.equal(toDinasti(null), null)
})

test('upcoming days are Jakarta calendar days', () => {
  // 2026-10-30T18:00:00Z is already Saturday 31 October 01:00 in Jakarta.
  const days = upcomingDays(3, new Date('2026-10-30T18:00:00Z'))
  assert.deepEqual(days.map(d => d.day), [6, 0, 1])
  assert.equal(days[0].short, 'Sab 31')
  assert.equal(days[1].long, 'Minggu, 1 November')
})

// A stand-in for the Supabase client that answers like the dashboard's tables do.
function fakeSupabase(tables) {
  return {
    from(name) {
      const rows = tables[name] || []
      const q = { select: () => q, order: () => q, in: (col, vals) => Promise.resolve({ data: rows.filter(r => vals.includes(r[col])) }), then: (ok, err) => Promise.resolve({ data: rows }).then(ok, err) }
      return q
    },
  }
}

test('CMS rows map onto the site with the same contract the dashboard writes', async () => {
  const { loadSiteData, FALLBACK } = await import('../src/data.js')
  const site = await loadSiteData(fakeSupabase({
    gallery_items: [{ src: 'https://x.supabase.co/a.jpg', type: 'image', alt: 'Hasil Ikbar Barbershop', category: 'Foto', sort_order: 1 }],
    services: [
      { name: 'Skin Fade', desc: 'Tajam', price: 'Rp 30.000', category: 'utama' },
      { name: 'Perming', desc: 'Ala Korea', price: 'Tanya Ikbar', category: 'tambahan', highlight: true },
    ],
    site_content: [
      { section: 'kontak', content: { wa_number: '6281111111111', instagram: '@dinasti.official' } },
      { section: 'lokasi', content: { address: 'Jl. Baru No. 1', hours_data: [{ hari: 'Setiap hari', jam: '09:00 – 22:00', tutup: false }] } },
      { section: 'about', content: { image_url: '/assets/about-new.jpg' } },
    ],
  }))
  assert.equal(site.wa, '6281111111111')
  assert.equal(site.ig, 'dinasti.official')
  assert.equal(site.address, 'Jl. Baru No. 1')
  assert.equal(site.hours[0].jam, '09:00 – 22:00')
  assert.equal(site.gallery[0].alt, 'Hasil Dinasti Barbershop')
  assert.equal(site.servicesUtama[0].price, 'Rp 30.000')
  assert.equal(site.servicesTambahan[0].price, 'Tanya Dinasti')
  // The old white-background crest photo is replaced by the dark-theme crest.
  assert.equal(site.aboutImage, null)
  // Sections the CMS leaves empty fall back to the built-in content.
  assert.equal(site.videoUrl, FALLBACK.videoUrl)
  assert.equal(await loadSiteData(null), FALLBACK)
})

test('CMS rows with the old name or placeholders are ignored', async () => {
  const { loadSiteData, FALLBACK } = await import('../src/data.js')
  const site = await loadSiteData(fakeSupabase({
    site_content: [
      { section: 'kontak', content: { instagram: 'ikbar.barbershop' } },
      { section: 'lokasi', content: { address: 'Isi alamat di sini', maps_url: 'https://maps.google.com/?q=Toko Iwan' } },
    ],
  }))
  assert.equal(site.ig, FALLBACK.ig)
  assert.equal(site.address, FALLBACK.address)
  assert.equal(site.mapsUrl, FALLBACK.mapsUrl)
  assert.equal(site.gallery, FALLBACK.gallery)
})
