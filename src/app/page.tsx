'use client';

import { useState, useRef, useMemo, useEffect } from 'react';

export default function Home() {
  const [following, setFollowing] = useState<string[]>([]);
  const [followers, setFollowers] = useState<string[]>([]);
  const [unfollowers, setUnfollowers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState<{type: string | null}>({type: null});
  const [copied, setCopied] = useState<string | null>(null);

  const followingInputRef = useRef<HTMLInputElement>(null);
  const followersInputRef = useRef<HTMLInputElement>(null);

  // HYPER-AGGRESSIVE PARSER v4.0: Searching for usernames in EVERY possible Meta JSON structure
  const extractUsernamesGodMode = (obj: any): string[] => {
    const usernames = new Set<string>();

    const recurse = (current: any) => {
      if (!current || typeof current !== 'object') return;

      if (Array.isArray(current)) {
        current.forEach(item => recurse(item));
        return;
      }

      // Pattern 1: Meta's standard "string_list_data" -> "value"
      if (current.string_list_data && Array.isArray(current.string_list_data)) {
        current.string_list_data.forEach((sub: any) => {
          if (sub?.value && typeof sub.value === 'string') usernames.add(sub.value);
        });
      }

      // Pattern 2: Meta's "title" used as username (Standard in some exports)
      if (current.title && typeof current.title === 'string' && current.title.length > 0) {
        const forbidden = ["", "Followers", "Following", "Followers and Following"];
        if (!forbidden.includes(current.title) && !current.title.includes(" ")) {
          usernames.add(current.title);
        }
      }

      // Pattern 3: Direct "value" key (Used in newer Professional account exports)
      if (current.value && typeof current.value === 'string' && current.value.length > 0) {
        if (!current.value.startsWith('http') && !current.value.includes(" ")) {
          usernames.add(current.value);
        }
      }

      // Traverse all keys
      Object.values(current).forEach(val => recurse(val));
    };

    recurse(obj);
    return Array.from(usernames);
  };

  const processFile = (file: File, type: 'following' | 'followers') => {
    setError(null);
    if (!file.name.toLowerCase().endsWith('.json')) {
      setError(`Format Salah: Pastikan Anda memilih file .json, bukan file .zip atau .html.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        const extracted = extractUsernamesGodMode(json);
        
        if (extracted.length === 0) {
          setError(`Gagal: Tidak ditemukan username di ${file.name}. Pastikan file ini berasal dari folder 'connections/followers_and_following'.`);
          return;
        }

        if (type === 'following') setFollowing(extracted);
        else setFollowers(extracted);
      } catch (err) {
        setError(`Error: File ${file.name} rusak atau bukan JSON asli Instagram.`);
      }
    };
    reader.readAsText(file);
  };

  const handleDrag = (e: React.DragEvent, type: string) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive({type});
    else if (e.type === "dragleave") setDragActive({type: null});
  };

  const handleDrop = (e: React.DragEvent, type: 'following' | 'followers') => {
    e.preventDefault(); e.stopPropagation();
    setDragActive({type: null});
    if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0], type);
  };

  useEffect(() => {
    if (following.length > 0 && followers.length > 0) {
      setLoading(true);
      const timer = setTimeout(() => {
        const followersSet = new Set(followers);
        const result = following.filter(user => !followersSet.has(user));
        setUnfollowers(result);
        setLoading(false);
        setStep(3);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [following, followers]);

  const filteredUnfollowers = useMemo(() => {
    return unfollowers
      .filter(user => user.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => a.localeCompare(b));
  }, [unfollowers, searchQuery]);

  const copyToClipboard = (user: string) => {
    navigator.clipboard.writeText(user);
    setCopied(user);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <main className="container">
      <header className="main-header fadeIn">
        <div style={{ display: 'inline-flex', padding: '12px', background: 'rgba(255,255,255,0.04)', borderRadius: '14px', marginBottom: '16px', border: '1px solid var(--glass-border)' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 10h.01M15 10h.01M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z"/>
          </svg>
        </div>
        <h1 className="main-title">Ghost Checker</h1>
        <p className="main-subtitle">Analisis privasi lokal tanpa login. Cepat, aman, dan absolut.</p>
      </header>

      {error && (
        <div style={{ background: 'rgba(255,59,48,0.08)', color: '#ff453a', padding: '12px 16px', borderRadius: '12px', marginBottom: '24px', textAlign: 'center', fontSize: '0.85rem', border: '1px solid rgba(255,59,48,0.2)', fontWeight: '600' }}>
          ⚠️ {error}
        </div>
      )}

      {step === 1 && (
        <section className="card fadeIn">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Panduan Ekspor (Penting!)</h2>
            <a href="https://accountscenter.instagram.com/your_information/" target="_blank" style={{ color: '#888', textDecoration: 'none', fontSize: '0.75rem', fontWeight: '700', border: '1px solid #333', padding: '6px 12px', borderRadius: '8px' }}>Pusat Akun Meta ↗</a>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {[ { num: '01', title: 'Request Data di Instagram', desc: 'Pilih "Download your information" > "Some of your information" > Centang "Followers and following".' },
               { num: '02', title: 'Wajib Format JSON', desc: 'Ubah format HTML menjadi JSON (Date: All Time). Tunggu email dari Meta.' },
               { num: '03', title: 'Ekstrak File ZIP', desc: 'Download file dari email, EKSTRAK ZIP-nya, cari folder "connections/followers_and_following".' }
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div style={{ background: '#fff', color: '#000', width: '24px', height: '24px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '0.75rem', flexShrink: 0 }}>{s.num}</div>
                <div>
                  <span style={{ fontWeight: '700', color: '#eee', display: 'block', marginBottom: '2px', fontSize: '0.95rem' }}>{s.title}</span>
                  <p style={{ color: '#666', fontSize: '0.85rem', lineHeight: '1.4' }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '32px', textAlign: 'center' }}>
            <button className="btn-primary" onClick={() => setStep(2)}>
              Mulai Analisis Sekarang
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{marginLeft: '10px'}}><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="card fadeIn">
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', textAlign: 'center', marginBottom: '4px' }}>Unggah File JSON</h2>
          <p style={{ textAlign: 'center', color: '#666', fontSize: '0.85rem', marginBottom: '24px' }}>Pilih file following.json dan followers_1.json</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            {(['following', 'followers'] as const).map((t) => (
              <div key={t} onDragEnter={(e) => handleDrag(e, t)} onDragLeave={(e) => handleDrag(e, t)} onDragOver={(e) => handleDrag(e, t)} onDrop={(e) => handleDrop(e, t)}>
                <span style={{ color: '#444', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', display: 'block' }}>{t === 'following' ? '1. following.json' : '2. followers_1.json'}</span>
                <div className={`upload-zone ${following.length > 0 && t === 'following' ? 'success' : ''} ${followers.length > 0 && t === 'followers' ? 'success' : ''} ${dragActive.type === t ? 'drag-active' : ''}`} onClick={() => (t === 'following' ? followingInputRef : followersInputRef).current?.click()}>
                  <div style={{ fontSize: '1.75rem', marginBottom: '4px' }}>{(t === 'following' ? following.length : followers.length) > 0 ? '✅' : '📥'}</div>
                  <span style={{ fontWeight: '700', fontSize: '0.8rem' }}>{(t === 'following' ? following.length : followers.length) > 0 ? `${t === 'following' ? following.length : followers.length} Akun` : 'Ketuk & Pilih File'}</span>
                </div>
                <input type="file" ref={t === 'following' ? followingInputRef : followersInputRef} accept=".json" onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0], t)} style={{ display: 'none' }} />
              </div>
            ))}
          </div>

          {loading && (
            <div style={{ marginTop: '24px', textAlign: 'center' }}>
              <div style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.1)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s infinite linear', margin: '0 auto 8px' }}></div>
              <p style={{ color: '#888', fontWeight: '600', fontSize: '0.8rem' }}>Sinkronisasi data...</p>
            </div>
          )}

          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <button className="btn-secondary" onClick={() => { setFollowing([]); setFollowers([]); setError(null); setStep(1); }}>Bantuan</button>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="card fadeIn">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Hasil Analisis</h2>
              <p style={{ color: '#ff453a', fontWeight: '700', fontSize: '0.9rem', marginTop: '2px' }}>{unfollowers.length} orang tidak folback kamu.</p>
            </div>
            <button className="btn-secondary" onClick={() => { setFollowing([]); setFollowers([]); setUnfollowers([]); setStep(2); }} style={{ padding: '6px 12px', fontSize: '0.7rem' }}>Ulangi</button>
          </div>

          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <svg style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" placeholder="Cari username..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '12px 12px 12px 40px', color: '#fff', fontSize: '0.9rem', outline: 'none' }} />
          </div>

          <div className="results-list">
            {filteredUnfollowers.length > 0 ? filteredUnfollowers.map((u, i) => (
              <div key={i} className="list-item" onClick={() => copyToClipboard(u)} style={{ cursor: 'pointer' }}>
                <span style={{ fontWeight: '700', color: '#eee', fontSize: '0.85rem' }}>@{u}</span>
                <div className={`status-badge ${copied === u ? 'badge-copied' : 'badge-ghost'}`}>{copied === u ? 'Copied' : 'Gak Folback'}</div>
              </div>
            )) : (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: '#444' }}>
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🥂</div>
                <p style={{ fontWeight: '600', fontSize: '0.9rem' }}>{searchQuery ? 'Tidak ditemukan.' : 'Bersih! Tidak ada "Ghost".'}</p>
              </div>
            )}
          </div>
          <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.75rem', color: '#444', fontWeight: '600' }}>Ketuk username untuk menyalin & unfollow di Instagram.</p>
        </section>
      )}

      <footer style={{ marginTop: '48px', textAlign: 'center', opacity: 0.3 }}>
        <p style={{ fontSize: '0.6rem', fontWeight: '900', letterSpacing: '1.2px', marginBottom: '4px' }}>GHOST CHECKER V2.6 — HYPER-AGGRESSIVE DISCOVERY</p>
        <p style={{ fontSize: '0.55rem', color: '#555', fontWeight: '700' }}>THE ARCHITECT EDITION • PRIVACY IS A HUMAN RIGHT</p>
      </footer>

      <style jsx>{`
        .fadeIn { animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </main>
  );
}
