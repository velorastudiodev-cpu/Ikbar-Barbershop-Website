import { useEffect, useState } from 'react'
import { waLink } from '../data.js'
import { useSite } from '../site.js'
import { DAY_NAMES, parseDays } from '../lib/hours.js'
import { Icon, Mark, OpenStatus, SectionHead, useNow } from './ui.jsx'
import { NAV } from './Top.jsx'

const prettyWa = (n) => '+' + n.replace(/^62/, '62 ').replace(/(\d{3})(\d{4})(\d{3,5})$/, '$1-$2-$3')

export function Location() {
  const { address, mapsUrl, hours, wa, ig } = useSite()
  const now = useNow()
  const [showMap, setShowMap] = useState(false)
  const todayName = now ? DAY_NAMES[now.day] : null
  const searchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('Dinasti Barbershop ' + address)}`

  return (
    <section className="section location" id="lokasi" aria-labelledby="location-title">
      <div className="shell location-grid">
        <div>
          <SectionHead kicker="Temukan kami" id="location-title" title={<>Luragung, <em>Kuningan.</em></>} />
          <ul className="contact-list" data-reveal>
            <li><Icon name="pin" /><div><h3>Alamat</h3><address>{address}</address></div></li>
            <li><Icon name="phone" /><div><h3>WhatsApp</h3><a href={waLink(wa, 'Halo Dinasti')} target="_blank" rel="noopener noreferrer">{prettyWa(wa)}</a></div></li>
            <li><Icon name="ig" /><div><h3>Instagram</h3><a href={`https://www.instagram.com/${ig}/`} target="_blank" rel="noopener noreferrer">@{ig}</a></div></li>
          </ul>
          <div className="hours" data-reveal>
            <div className="hours-head"><h3><Icon name="clock" size={18} /> Jam operasional</h3><OpenStatus /></div>
            <table>
              <tbody>
                {hours.map((h, i) => {
                  const isToday = todayName && parseDays(h.hari).has(DAY_NAMES.indexOf(todayName))
                  return (
                    <tr key={i} className={isToday ? 'is-today' : ''}>
                      <th scope="row">{h.hari}{isToday && <small>Hari ini</small>}</th>
                      <td>{h.tutup ? 'Tutup' : h.jam}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
        <div className="map" data-reveal>
          {showMap
            ? <iframe title="Peta lokasi Dinasti Barbershop di Luragung, Kuningan" src={mapsUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
            : (
              <div className="map-cover">
                <Icon name="pin" size={34} />
                <p>{address}</p>
                <div className="map-actions">
                  <button className="btn btn-brass btn-sm" onClick={() => setShowMap(true)}>Tampilkan peta</button>
                  <a className="btn btn-ghost btn-sm" href={searchUrl} target="_blank" rel="noopener noreferrer">Buka Google Maps <Icon name="arrow" size={14} /></a>
                </div>
              </div>
            )}
        </div>
      </div>
    </section>
  )
}

export function Contact() {
  const { wa, ig } = useSite()
  return (
    <section className="cta" id="kontak" aria-labelledby="cta-title">
      <div className="shell" data-reveal>
        <p className="kicker">Siap tampil lebih keren?</p>
        <h2 id="cta-title">Duduk dulu, <em>kita ngobrol.</em></h2>
        <p>Mau potongan yang cocok sama karaktermu? Konsultasi santai, gratis, langsung dengan barber Dinasti.</p>
        <div className="cta-actions">
          <a className="btn btn-brass" href={waLink(wa, 'Halo Dinasti, boleh konsultasi soal potongan rambut yang cocok buat saya?')} target="_blank" rel="noopener noreferrer"><Icon name="wa" size={18} /> Chat WhatsApp</a>
          <a className="btn btn-ghost" href={`https://www.instagram.com/${ig}/`} target="_blank" rel="noopener noreferrer"><Icon name="ig" size={18} /> Follow Instagram</a>
        </div>
      </div>
      <div className="cta-pole" aria-hidden="true"><i /></div>
    </section>
  )
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="shell footer-inner">
        <a className="brand" href="#top"><Mark size={28} /><span><b>Dinasti</b><small>Barbershop</small></span></a>
        <nav aria-label="Navigasi footer"><ul>{NAV.map(([id, label]) => <li key={id}><a href={`#${id}`}>{label}</a></li>)}</ul></nav>
        <p>© 2026 Dinasti Barbershop · Luragung, Kuningan<br /><small>Made with care by Velora Studio</small></p>
      </div>
    </footer>
  )
}

/** Floating WhatsApp that steps aside while the hero (which has its own WhatsApp button) is on screen. */
export function WaFloat() {
  const { wa } = useSite()
  const [hidden, setHidden] = useState(true)
  useEffect(() => {
    const hero = document.querySelector('.hero')
    if (!hero) { setHidden(false); return }
    const io = new IntersectionObserver(([e]) => setHidden(e.isIntersecting))
    io.observe(hero)
    return () => io.disconnect()
  }, [])
  return (
    <a className={`wa-float ${hidden ? 'is-hidden' : ''}`} href={waLink(wa, 'Halo Dinasti, boleh konsultasi soal potongan rambut yang cocok buat saya?')}
      target="_blank" rel="noopener noreferrer" aria-label="Chat WhatsApp Dinasti Barbershop" tabIndex={hidden ? -1 : 0}>
      <Icon name="wa" size={28} />
    </a>
  )
}
