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

  // RECURSIVE DISCOVERY ENGINE V3.2: Universal detection for any Instagram JSON schema
  const extractUsernamesRecursive = (obj: any): string[] => {
    const usernames = new Set<string>();
    const recurse = (current: any) => {
      if (!current || typeof current !== 'object') return;
      if (Array.isArray(current)) {
        current.forEach(item => recurse(item));
        return;
      }
      if (current.string_list_data && Array.isArray(current.string_list_data)) {
        current.string_list_data.forEach((item: any) => {
          if (item?.value && typeof item.value === 'string') usernames.add(item.value);
        });
      }
      if (typeof current.value === 'string' && typeof current.href === 'string' && current.value.length > 0) {
        usernames.add(current.value);
      }
      Object.values(current).forEach(val => recurse(val));
    };
    recurse(obj);
    return Array.from(usernames);
  };

  const processFile = (file: File, type: 'following' | 'followers') => {
    setError(null);
    if (!file.name.toLowerCase().endsWith('.json')) {
      setError("Wajib menggunakan file .json asli dari Instagram.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        const extracted = extractUsernamesRecursive(json);
        if (extracted.length === 0) throw new Error("Format salah.");
        if (type === 'following') setFollowing(extracted);
        else setFollowers(extracted);
      } catch (err) {
        setError(`Gagal membaca ${file.name}. Pastikan file asli dari folder 'connections'.`);
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
        <div style={{ display: 'inline-flex', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '16px', marginBottom: '16px', border: '1px solid var(--glass-border)' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 10h.01M15 10h.01M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z"/>
          </svg>
        </div>
        <h1 className="main-title">Ghost Checker</h1>
        <p className="main-subtitle">Analisis privasi lokal tanpa login. Cepat, aman, dan absolut.</p>
      </header>

      {error && (
        <div style={{ background: 'rgba(255,59,48,0.1)', color: '#ff453a', padding: '14px 20px', borderRadius: '16px', marginBottom: '24px', textAlign: 'center', fontSize: '0.9rem', border: '1px solid rgba(255,59,48,0.2)', fontWeight: '600' }}>
          ⚠️ {error}
        </div>
      )}

      {step === 1 && (
        <section className="card fadeIn">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800' }}>Instruksi Persiapan</h2>
            <a href="https://accountscenter.instagram.com/your_information/" target="_blank" style={{ color: '#888', textDecoration: 'none', fontSize: '0.8rem', fontWeight: '700', border: '1px solid #333', padding: '8px 14px', borderRadius: '10px' }}>Buka Meta ↗</a>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {[ { num: '01', title: 'Download Data', desc: 'Buka pusat akun Meta, pilih "Download your information".' },
               { num: '02', title: 'Centang Kategori', desc: 'Pilih "Some info" dan centang hanya "Followers and following".' },
               { num: '03', title: 'Format JSON', desc: 'Pilih Format: JSON (Wajib!) dan Date: All Time.' }
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{ background: '#fff', color: '#000', width: '30px', height: '30px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '0.8rem', flexShrink: 0 }}>{s.num}</div>
                <div>
                  <span style={{ fontWeight: '700', color: '#eee', display: 'block', marginBottom: '2px' }}>{s.title}</span>
                  <p style={{ color: '#666', fontSize: '0.9rem', lineHeight: '1.5' }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '40px', textAlign: 'center' }}>
            <button className="btn-primary" onClick={() => setStep(2)}>
              Sudah Siap, Analisis Sekarang
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{marginLeft: '10px'}}><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="card fadeIn">
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', textAlign: 'center', marginBottom: '8px' }}>Unggah JSON</h2>
          <p style={{ textAlign: 'center', color: '#666', fontSize: '0.9rem', marginBottom: '32px' }}>Unggah file asli hasil ekspor Instagram kamu.</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            {(['following', 'followers'] as const).map((t) => (
              <div key={t} onDragEnter={(e) => handleDrag(e, t)} onDragLeave={(e) => handleDrag(e, t)} onDragOver={(e) => handleDrag(e, t)} onDrop={(e) => handleDrop(e, t)}>
                <span style={{ color: '#444', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px', display: 'block' }}>{t === 'following' ? '1. following.json' : '2. followers_1.json'}</span>
                <div className={`upload-zone ${following.length > 0 && t === 'following' ? 'success' : ''} ${followers.length > 0 && t === 'followers' ? 'success' : ''} ${dragActive.type === t ? 'drag-active' : ''}`} onClick={() => (t === 'following' ? followingInputRef : followersInputRef).current?.click()}>
                  <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{(t === 'following' ? following.length : followers.length) > 0 ? '✅' : '📥'}</div>
                  <span style={{ fontWeight: '700', fontSize: '0.85rem' }}>{(t === 'following' ? following.length : followers.length) > 0 ? `${t === 'following' ? following.length : followers.length} Akun Terbaca` : 'Cari file'}</span>
                </div>
                <input type="file" ref={t === 'following' ? followingInputRef : followersInputRef} accept=".json" onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0], t)} style={{ display: 'none' }} />
              </div>
            ))}
          </div>

          {loading && (
            <div style={{ marginTop: '32px', textAlign: 'center' }}>
              <div style={{ width: '24px', height: '24px', border: '2px solid rgba(255,255,255,0.1)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s infinite linear', margin: '0 auto 12px' }}></div>
              <p style={{ color: '#888', fontWeight: '600', fontSize: '0.85rem' }}>Mencocokkan database...</p>
            </div>
          )}

          <div style={{ marginTop: '32px', textAlign: 'center' }}>
            <button className="btn-secondary" onClick={() => { setFollowing([]); setFollowers([]); setError(null); setStep(1); }}>Kembali</button>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="card fadeIn">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800' }}>Hasil Analisis</h2>
              <p style={{ color: '#ff453a', fontWeight: '700', fontSize: '1rem', marginTop: '2px' }}>{unfollowers.length} akun tidak folback.</p>
            </div>
            <button className="btn-secondary" onClick={() => { setFollowing([]); setFollowers([]); setUnfollowers([]); setStep(2); }} style={{ padding: '8px 16px', fontSize: '0.75rem' }}>Ulangi</button>
          </div>

          <div style={{ position: 'relative', marginBottom: '20px' }}>
            <svg style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" placeholder="Cari username..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '14px 14px 14px 44px', color: '#fff', fontSize: '0.95rem', outline: 'none' }} />
          </div>

          <div className="results-list">
            {filteredUnfollowers.length > 0 ? filteredUnfollowers.map((u, i) => (
              <div key={i} className="list-item" onClick={() => copyToClipboard(u)} style={{ cursor: 'pointer' }}>
                <span style={{ fontWeight: '700', color: '#eee', fontSize: '0.9rem' }}>@{u}</span>
                <div className={`status-badge ${copied === u ? 'badge-copied' : 'badge-ghost'}`}>{copied === u ? 'Tersalin' : 'Gak Folback'}</div>
              </div>
            )) : (
              <div style={{ padding: '60px 20px', textAlign: 'center', color: '#444' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🥂</div>
                <p style={{ fontWeight: '600' }}>{searchQuery ? 'Tidak ditemukan.' : 'Bersih! Tidak ada "Ghost".'}</p>
              </div>
            )}
          </div>
          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.8rem', color: '#444', fontWeight: '600' }}>Tip: Klik username untuk menyalin & unfollow di IG.</p>
        </section>
      )}

      <footer style={{ marginTop: '64px', textAlign: 'center', opacity: 0.3 }}>
        <p style={{ fontSize: '0.7rem', fontWeight: '900', letterSpacing: '1.5px', marginBottom: '4px' }}>GHOST CHECKER V2.5 — FINAL MASTERPIECE</p>
        <p style={{ fontSize: '0.65rem', color: '#555', fontWeight: '700' }}>THE ARCHITECT EDITION • NO DATA LEAVES YOUR DEVICE</p>
      </footer>

      <style jsx>{`
        .fadeIn { animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </main>
  );
}
