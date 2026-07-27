import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export const Route = createFileRoute('/')({ component: WHHome })

const TABS = [
  { id: 'home',         label: 'Home' },
  { id: 'news',         label: 'News' },
  { id: 'eo',           label: 'Executive Orders' },
  { id: 'memo',         label: 'Memos' },
  { id: 'gallery',      label: 'Gallery' },
  { id: 'applications', label: 'The White House' },
] as const

type TabId = 'home' | 'news' | 'eo' | 'memo' | 'gallery' | 'leadership' | 'applications'

const C = {
  navy: '#0a2240', navyDark: '#061530', navyLight: '#123457',
  gold: '#b8962e', goldLight: '#e8d9a8',
  white: '#ffffff', offWhite: '#f7f8fa', lightGray: '#eceef2',
  gray: '#6b7280', darkGray: '#1f2937', border: '#d7dbe3',
  text: '#111827', textMuted: '#4b5563',
}

type Post = {
  id: string
  category: 'news' | 'eo' | 'memo'
  title: string
  body: string
  image_url?: string | null
  eo_number?: string | null
  source?: string | null
  pinned?: boolean
  created_at: string
}

/* ─── Icons ─────────────────────────────────────────────────────── */
function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  )
}
function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" />
    </svg>
  )
}

/* ─── Header search ─────────────────────────────────────────────── */
function HeaderSearch({ setTab }: { setTab: (t: TabId) => void }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Post[]>([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!query.trim()) { setResults([]); return }
    const t = setTimeout(() => {
      supabase.from('wh_posts').select('*').ilike('title', `%${query}%`).limit(5).then(({ data }) => setResults(data || []))
    }, 250)
    return () => clearTimeout(t)
  }, [query])

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }} onClick={() => setOpen(o => !o)}>
        <SearchIcon />
        <span style={{ fontSize: 11, letterSpacing: 1.5, fontWeight: 700 }}>SEARCH</span>
      </div>
      {open && (
        <div style={{ position: 'absolute', top: '130%', right: 0, width: 260, background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, boxShadow: '0 10px 30px rgba(10,34,64,0.18)', padding: 10, zIndex: 30 }}>
          <input autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder="Search the site..."
            style={{ width: '100%', border: `1px solid ${C.border}`, borderRadius: 6, padding: '8px 10px', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
          {results.length > 0 && (
            <div style={{ marginTop: 8 }}>
              {results.map(r => (
                <button key={r.id} onMouseDown={() => { setTab(r.category as TabId); setQuery(''); setOpen(false) }}
                  style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: '8px 6px', cursor: 'pointer', borderBottom: `1px solid ${C.lightGray}` }}>
                  <div style={{ fontSize: 10, color: C.gray, textTransform: 'uppercase' }}>{r.category}</div>
                  <div style={{ fontSize: 13, color: C.text, fontWeight: 600 }}>{r.title}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ─── Mega menu ─────────────────────────────────────────────────── */
const MEGA_MENU: { label: string; items: { label: string; action: 'tab' | 'link'; target: string }[] }[] = [
  { label: 'News', items: [
    { label: 'Latest News', action: 'tab', target: 'news' },
    { label: 'Executive Orders', action: 'tab', target: 'eo' },
    { label: 'Memos', action: 'tab', target: 'memo' },
  ]},
  { label: 'Media', items: [
    { label: 'Photo Gallery', action: 'tab', target: 'gallery' },
    { label: 'Livestream (C-SPAN)', action: 'link', target: 'https://osfcspan.netlify.app' },
  ]},
  { label: 'Administration', items: [
    { label: 'Leadership', action: 'tab', target: 'leadership' },
  ]},
  { label: 'Get Involved', items: [
    { label: 'The White House', action: 'tab', target: 'applications' },
    { label: 'Check Application Status', action: 'link', target: '/applications' },
  ]},
]

function MegaMenu({ onClose, setTab }: { onClose: () => void; setTab: (t: TabId) => void }) {
  const [active, setActive] = useState(0)
  return (
    <div style={{ position: 'fixed', inset: 0, background: C.white, zIndex: 100, overflowY: 'auto' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${C.border}` }}>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.navy, cursor: 'pointer', fontSize: 12, fontWeight: 700, letterSpacing: 1.5 }}>✕ CLOSE</button>
        <img src="/wh-emblem.png" alt="" style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover' }} onError={e => { e.currentTarget.style.display = 'none' }} />
        <div style={{ width: 70 }} />
      </div>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 28px', display: 'grid', gridTemplateColumns: '260px 1fr', gap: 40 }}>
        <div>
          {MEGA_MENU.map((cat, i) => (
            <button key={cat.label} onMouseEnter={() => setActive(i)} onClick={() => setActive(i)} style={{
              display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none',
              padding: '14px 0', fontSize: 22, fontWeight: 700, fontFamily: 'Georgia, serif', cursor: 'pointer',
              color: active === i ? C.navy : C.gray, borderBottom: `1px solid ${C.border}`,
            }}>{cat.label} <span style={{ fontSize: 14, opacity: 0.5 }}>›</span></button>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 8 }}>
          {MEGA_MENU[active].items.map(item => (
            item.action === 'tab' ? (
              <button key={item.label} onClick={() => { setTab(item.target as TabId); onClose() }} style={{
                textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14,
                fontWeight: 600, color: C.text, letterSpacing: 0.3, textTransform: 'uppercase', padding: '4px 0',
              }}>{item.label}</button>
            ) : (
              <a key={item.label} href={item.target} target="_blank" rel="noopener noreferrer" style={{
                fontSize: 14, fontWeight: 600, color: C.text, letterSpacing: 0.3, textTransform: 'uppercase',
                padding: '4px 0', textDecoration: 'none',
              }}>{item.label} ↗</a>
            )
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─── Header ────────────────────────────────────────────────────── */
function Header({ tab, setTab }: { tab: TabId; setTab: (t: TabId) => void }) {
  const [menuOpen, setMenuOpen] = useState(false)
  return (
    <header style={{ background: C.white, borderBottom: `3px solid ${C.gold}` }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={() => setMenuOpen(true)} style={{ background: 'none', border: 'none', color: C.navy, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
          <MenuIcon /> <span style={{ fontSize: 11, letterSpacing: 1.5, fontWeight: 700 }}>MENU</span>
        </button>
        <Link to="/" onClick={() => setTab('home')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textDecoration: 'none' }}>
          <img src="/wh-emblem.png" alt="The White House" style={{ width: 46, height: 46, borderRadius: 6, objectFit: 'cover', marginBottom: 4 }} onError={e => { e.currentTarget.style.display = 'none' }} />
          <div style={{ fontSize: 15, fontWeight: 700, color: C.navy, fontFamily: 'Georgia, serif', letterSpacing: 0.5 }}>THE WHITE HOUSE</div>
          <div style={{ fontSize: 8, letterSpacing: 2, color: C.gray, textTransform: 'uppercase' }}>OSFUSA Roblox RP</div>
        </Link>
        <HeaderSearch setTab={setTab} />
      </div>
      <div style={{ borderTop: `1px solid ${C.border}`, background: C.offWhite }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 28px', display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              background: 'transparent', border: 'none', borderBottom: tab === t.id ? `2px solid ${C.gold}` : '2px solid transparent',
              color: tab === t.id ? C.navy : C.textMuted, padding: '12px 14px', fontSize: 12, cursor: 'pointer',
              fontWeight: tab === t.id ? 700 : 600, letterSpacing: 0.8, textTransform: 'uppercase',
            }}>{t.label}</button>
          ))}
        </div>
      </div>
      {menuOpen && <MegaMenu onClose={() => setMenuOpen(false)} setTab={setTab} />}
    </header>
  )
}

/* ─── Footer ────────────────────────────────────────────────────── */
function SiteFooter() {
  return (
    <footer style={{ background: C.navyDark, color: C.goldLight, padding: '30px 24px', marginTop: 60, textAlign: 'center', fontSize: 12 }}>
      <div style={{ fontFamily: 'Georgia, serif', fontSize: 14, marginBottom: 6 }}>THE WHITE HOUSE</div>
      <div style={{ opacity: 0.75 }}>OSFUSA Roleplay network. Not affiliated with the real White House or U.S. government.</div>
      <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.12)' }}>
        <Link to="/admin" style={{ color: 'rgba(232,217,168,0.6)', fontSize: 11, textDecoration: 'none' }}>Staff Login</Link>
      </div>
    </footer>
  )
}

/* ─── Post feed (News / Memos) ──────────────────────────────────── */
function PostFeed({ category, accent }: { category: Post['category']; accent: string }) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('wh_posts').select('*').eq('category', category)
      .order('pinned', { ascending: false }).order('created_at', { ascending: false })
      .then(({ data }) => { setPosts(data || []); setLoading(false) })
  }, [category])

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: C.gray }}>Loading…</div>
  if (posts.length === 0) return <div style={{ padding: 40, textAlign: 'center', color: C.gray }}>Nothing posted here yet.</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {posts.map(p => (
        <div key={p.id} style={{ background: C.white, border: `1px solid ${C.border}`, borderLeft: `4px solid ${accent}`, borderRadius: 6, padding: '20px 22px', boxShadow: '0 2px 8px rgba(10,34,64,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
            {p.eo_number && <span style={{ fontSize: 10, fontWeight: 700, color: C.white, background: accent, borderRadius: 3, padding: '2px 8px', letterSpacing: 0.5 }}>EXEC. ORDER NO. {p.eo_number}</span>}
            {p.pinned && <span style={{ fontSize: 10, fontWeight: 700, color: accent, border: `1px solid ${accent}`, borderRadius: 3, padding: '1px 7px' }}>PINNED</span>}
            <span style={{ fontSize: 11, color: C.gray }}>{new Date(p.created_at).toLocaleString()}</span>
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 8, fontFamily: 'Georgia, serif' }}>{p.title}</div>
          {p.image_url && <img src={p.image_url} alt="" style={{ width: '100%', borderRadius: 6, marginBottom: 10 }} />}
          <div style={{ fontSize: 14, color: C.textMuted, lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>{p.body}</div>
        </div>
      ))}
    </div>
  )
}

/* ─── Stat box ──────────────────────────────────────────────────── */
function StatBox({ label, value, accent, onClick }: { label: string; value: string; accent: string; onClick?: () => void }) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag onClick={onClick} style={{
      background: C.white, border: `1px solid ${C.border}`, borderTop: `3px solid ${accent}`, borderRadius: 10,
      padding: '16px 18px', textAlign: 'left', cursor: onClick ? 'pointer' : 'default',
      boxShadow: '0 2px 10px rgba(10,34,64,0.06)', fontFamily: 'inherit',
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: accent, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: C.darkGray }}>{value}</div>
    </Tag>
  )
}

/* ─── Home tab ──────────────────────────────────────────────────── */
function HomeTab({ setTab }: { setTab: (t: TabId) => void }) {
  const [featured, setFeatured] = useState<Post | null>(null)
  const [recent, setRecent] = useState<Post[]>([])
  const [counts, setCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    supabase.from('wh_posts').select('*').order('pinned', { ascending: false }).order('created_at', { ascending: false }).limit(1)
      .then(({ data }) => setFeatured(data?.[0] || null))
    supabase.from('wh_posts').select('*').order('created_at', { ascending: false }).limit(6)
      .then(({ data }) => setRecent(data || []))
    supabase.from('wh_posts').select('category').then(({ data }) => {
      const c: Record<string, number> = {}
      ;(data || []).forEach((p: any) => { c[p.category] = (c[p.category] || 0) + 1 })
      setCounts(c)
    })
  }, [])

  const accentFor = (cat: string) => cat === 'eo' ? C.gold : cat === 'memo' ? C.navyLight : C.navy

  return (
    <div>
      {/* Featured hero */}
      <div style={{ background: C.white, borderRadius: 16, padding: 24, boxShadow: '0 6px 24px rgba(10,34,64,0.10)', border: `1px solid ${C.border}`, marginBottom: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: featured?.image_url ? '1fr 1fr' : '1fr', gap: 28, alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, color: '#fff', letterSpacing: 1.5, marginBottom: 12, background: featured ? accentFor(featured.category) : C.navy, borderRadius: 20, padding: '4px 12px' }}>
              {featured ? (featured.category === 'eo' ? 'EXECUTIVE ORDER' : featured.category === 'memo' ? 'MEMO' : 'FEATURED') : 'OSFUSA WHITE HOUSE'}
            </div>
            <div style={{ fontSize: 30, fontWeight: 700, color: C.navyDark, fontFamily: 'Georgia, serif', lineHeight: 1.15, marginBottom: 14 }}>
              {featured ? featured.title : 'Serving the American people'}
            </div>
            <div style={{ fontSize: 14, color: C.textMuted, lineHeight: 1.6, marginBottom: 20 }}>
              {featured ? featured.body.slice(0, 140) + (featured.body.length > 140 ? '...' : '') : 'News, executive orders, and official memos from the White House.'}
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button onClick={() => setTab(featured ? (featured.category as TabId) : 'news')} style={{ background: C.navy, color: C.white, border: 'none', borderRadius: 6, padding: '11px 20px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                Read more
              </button>
              <button onClick={() => setTab('leadership')} style={{ background: 'transparent', border: `1px solid ${C.border}`, color: C.navy, borderRadius: 6, padding: '11px 20px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                Meet Leadership
              </button>
            </div>
          </div>
          {featured?.image_url && (
            <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', height: 240, boxShadow: '0 8px 30px rgba(10,34,64,0.18)' }}>
              <img src={featured.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}
        </div>
      </div>

      {/* Quick stat boxes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14, marginBottom: 28 }}>
        <StatBox label="News" value={`${counts.news || 0} posted`} accent={C.navy} onClick={() => setTab('news')} />
        <StatBox label="Executive Orders" value={`${counts.eo || 0} issued`} accent={C.gold} onClick={() => setTab('eo')} />
        <StatBox label="Memos" value={`${counts.memo || 0} released`} accent={C.navyLight} onClick={() => setTab('memo')} />
        <StatBox label="Join the Staff" value="View openings" accent={C.gold} onClick={() => setTab('applications')} />
      </div>

      {/* Recent posts */}
      {recent.length > 0 && (
        <div>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: C.darkGray, marginBottom: 14, textTransform: 'uppercase', letterSpacing: 1 }}>Recent updates</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {recent.map(p => (
              <button key={p.id} onClick={() => setTab(p.category as TabId)} style={{
                textAlign: 'left', display: 'flex', gap: 14, alignItems: 'center', background: C.white,
                border: `1px solid ${C.border}`, borderLeft: `4px solid ${accentFor(p.category)}`, borderRadius: 8,
                padding: '14px 18px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(10,34,64,0.05)',
              }}>
                {p.image_url && <img src={p.image_url} alt="" style={{ width: 64, height: 64, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} />}
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: accentFor(p.category), textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 }}>
                    {p.category === 'eo' ? `Executive Order${p.eo_number ? ' No. ' + p.eo_number : ''}` : p.category === 'memo' ? 'Memo' : 'News'}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{p.title}</div>
                  <div style={{ fontSize: 11, color: C.gray, marginTop: 2 }}>{new Date(p.created_at).toLocaleDateString()}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── Gallery tab ───────────────────────────────────────────────── */
function GalleryTab() {
  const [items, setItems] = useState<any[]>([])
  useEffect(() => {
    supabase.from('wh_gallery').select('*').order('created_at', { ascending: false }).then(({ data }) => setItems(data || []))
  }, [])
  if (items.length === 0) return <div style={{ padding: 40, textAlign: 'center', color: C.gray }}>No photos yet.</div>
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
      {items.map(g => (
        <div key={g.id} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 8px rgba(10,34,64,0.06)' }}>
          <img src={g.image_url} alt={g.caption || ''} style={{ width: '100%', height: 160, objectFit: 'cover' }} />
          {g.caption && <div style={{ padding: '10px 12px', fontSize: 13, color: C.textMuted }}>{g.caption}</div>}
        </div>
      ))}
    </div>
  )
}

/* ─── Leadership tab ────────────────────────────────────────────── */
function LeadershipTab() {
  const [people, setPeople] = useState<any[]>([])
  useEffect(() => {
    supabase.from('wh_leadership').select('*').order('sort_order', { ascending: true }).then(({ data }) => setPeople(data || []))
  }, [])
  if (people.length === 0) return <div style={{ padding: 40, textAlign: 'center', color: C.gray }}>Leadership roster coming soon.</div>
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 18 }}>
      {people.map(p => (
        <div key={p.id} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden', textAlign: 'center', boxShadow: '0 2px 8px rgba(10,34,64,0.06)' }}>
          <div style={{ width: '100%', height: 170, background: C.lightGray, overflow: 'hidden' }}>
            {p.photo_url
              ? <img src={p.photo_url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.gray, fontSize: 32, fontFamily: 'Georgia, serif' }}>{p.name?.[0]}</div>}
          </div>
          <div style={{ padding: '12px 10px' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{p.name}</div>
            <div style={{ fontSize: 12, color: C.gold, fontWeight: 600, marginTop: 2 }}>{p.title}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ─── Applications tab ──────────────────────────────────────────── */
function ApplicationsTab() {
  const [positions, setPositions] = useState<{ title: string; desc: string }[]>([])
  useEffect(() => {
    supabase.from('wh_settings').select('*').eq('key', 'open_positions').single().then(({ data }) => {
      const raw = data?.value || ''
      const list = raw.split('\n').map((l: string) => l.trim()).filter(Boolean).map((l: string) => {
        const [title, ...rest] = l.split('|')
        return { title: title.trim(), desc: rest.join('|').trim() }
      })
      setPositions(list)
    })
  }, [])

  return (
    <div>
      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, padding: 28, marginBottom: 20 }}>
        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 22, color: C.navy, marginBottom: 8 }}>Join the White House Staff</h2>
        <p style={{ fontSize: 14, color: C.textMuted, lineHeight: 1.7 }}>
          Interested in serving on the White House staff? Review current openings below, then
          submit an application.
        </p>
      </div>
      {positions.length === 0 ? (
        <div style={{ padding: 30, textAlign: 'center', color: C.gray, background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, marginBottom: 20 }}>
          No open positions listed right now.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
          {positions.map((p, i) => (
            <div key={i} style={{ background: C.white, border: `1px solid ${C.border}`, borderLeft: `4px solid ${C.gold}`, borderRadius: 6, padding: '16px 20px' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 4 }}>{p.title}</div>
              {p.desc && <div style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.6 }}>{p.desc}</div>}
            </div>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <Link to="/apply" style={{ background: C.navy, color: C.white, padding: '10px 20px', borderRadius: 4, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>Apply Now</Link>
        <Link to="/applications" style={{ background: C.white, color: C.navy, border: `1px solid ${C.border}`, padding: '10px 20px', borderRadius: 4, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>Check Application Status</Link>
      </div>
    </div>
  )
}

/* ─── Page ──────────────────────────────────────────────────────── */
/* ─── Intro video overlay ───────────────────────────────────────── */
function IntroVideoOverlay() {
  const [url, setUrl] = useState<string | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem('wh-intro-shown') === 'true') { setDismissed(true); return }
    supabase.from('wh_settings').select('*').eq('key', 'intro_video_url').single().then(({ data }) => {
      if (data?.value) setUrl(data.value)
      else setDismissed(true)
    })
  }, [])

  const dismiss = () => { sessionStorage.setItem('wh-intro-shown', 'true'); setDismissed(true) }

  if (dismissed || !url) return null

  return (
    <div onClick={dismiss} onWheel={dismiss} style={{ position: 'fixed', inset: 0, background: '#000', zIndex: 200, cursor: 'pointer' }}>
      <video
        src={url} autoPlay muted playsInline onEnded={dismiss}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
      <button onClick={dismiss} style={{
        position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.4)',
        color: '#fff', padding: '8px 18px', borderRadius: 20, fontSize: 12, fontWeight: 700, letterSpacing: 1, cursor: 'pointer',
      }}>SKIP ✕</button>
    </div>
  )
}

function WHHome() {
  const [tab, setTab] = useState<TabId>('home')

  return (
    <div style={{ minHeight: '100vh', background: C.offWhite, fontFamily: 'system-ui, sans-serif' }}>
      <IntroVideoOverlay />
      <Header tab={tab} setTab={setTab} />
      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px' }}>
        {tab === 'home' && <HomeTab setTab={setTab} />}
        {tab === 'news' && <PostFeed category="news" accent={C.navy} />}
        {tab === 'eo' && <PostFeed category="eo" accent={C.gold} />}
        {tab === 'memo' && <PostFeed category="memo" accent={C.navyLight} />}
        {tab === 'gallery' && <GalleryTab />}
        {tab === 'leadership' && <LeadershipTab />}
        {tab === 'applications' && <ApplicationsTab />}
      </main>
      <SiteFooter />
    </div>
  )
}
