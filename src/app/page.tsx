'use client';

import { useState, useRef, useMemo, useEffect } from 'react';

interface InstagramUser {
  value: string;
  href: string;
  timestamp: number;
}

interface IgListItem {
  string_list_data: InstagramUser[];
}

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

  const extractUsers = (data: any, type: 'following' | 'followers'): string[] => {
    try {
      let list: any[] = [];
      if (type === 'following') {
        list = data.relationships_following || (Array.isArray(data) ? data : []);
      } else {
        list = data.relationships_followers || (Array.isArray(data) ? data : []);
      }
      const users = list
        .filter((item: any) => item?.string_list_data?.[0]?.value)
        .map((item: IgListItem) => item.string_list_data[0].value);
      return Array.from(new Set(users));
    } catch (e) {
      return [];
    }
  };

  const processFile = (file: File, type: 'following' | 'followers') => {
    if (!file.name.endsWith('.json')) {
      setError("Hanya mendukung file .json asli dari Instagram.");
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const users = extractUsers(json, type);
        if (users.length === 0) throw new Error("Format salah.");
        if (type === 'following') setFollowing(users);
        else setFollowers(users);
      } catch (err) {
        setError("File tidak valid. Pastikan ini JSON hasil ekspor Instagram.");
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
    if (e.dataTransfer.files && e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0], type);
  };

  useEffect(() => {
    if (following.length > 0 && followers.length > 0) {
      setLoading(true);
      setTimeout(() => {
        const followersSet = new Set(followers);
        const result = following.filter(user => !followersSet.has(user));
        setUnfollowers(result);
        setLoading(false);
        setStep(3);
      }, 1500);
    }
  }, [following, followers]);

  const filteredUnfollowers = useMemo(() => {
    return unfollowers.filter(user => user.toLowerCase().includes(searchQuery.toLowerCase())).sort();
  }, [unfollowers, searchQuery]);

  const copyToClipboard = (user: string) => {
    navigator.clipboard.writeText(user);
    setCopied(user);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <main className="container">
      {/* Header Section */}
      <header className="main-header">
        <div className="logo-box">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 10h.01M15 10h.01M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z"/>
          </svg>
        </div>
        <h1 className="main-title">Ghost Checker</h1>
        <p className="main-subtitle">Analisis privasi lokal tanpa login. Cepat, aman, dan privat.</p>
      </header>

      {error && (
        <div className="alert-box">
          <span className="alert-icon">⚠️</span>
          <span className="alert-text">{error}</span>
        </div>
      )}

      {/* STEP 1: PREPARATION */}
      {step === 1 && (
        <section className="card glass-effect fadeIn">
          <div className="card-top">
            <h2 className="card-title">Instruksi Persiapan</h2>
            <a href="https://accountscenter.instagram.com/your_information/" target="_blank" className="nav-btn hide-mobile">
              Buka Meta ↗
            </a>
          </div>
          
          <div className="instruction-stack">
            <div className="instr-row">
              <div className="instr-num">01</div>
              <div className="instr-body">
                <span className="instr-label">Akses Download Information</span>
                <p className="instr-text">Masuk ke <b>Accounts Center</b> &gt; <b>Your info</b> &gt; <b>Download info</b>.</p>
              </div>
            </div>

            <div className="instr-row">
              <div className="instr-num">02</div>
              <div className="instr-body">
                <span className="instr-label">Pilih Followers & Following</span>
                <p className="instr-text">Pilih <b>Some info</b> dan centang hanya kategori ini untuk mempercepat ekspor.</p>
              </div>
            </div>

            <div className="instr-row">
              <div className="instr-num">03</div>
              <div className="instr-body">
                <span className="instr-label">Ekspor Format JSON</span>
                <p className="instr-text">Wajib pilih <b>Format: JSON</b> (Jangan HTML). Date: <b>All Time</b>. Tunggu email dari Meta.</p>
              </div>
            </div>
          </div>

          <div className="card-bottom">
            <button className="btn-primary" onClick={() => setStep(2)}>
              Mulai Analisis
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{marginLeft: '12px'}}><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
            <a href="https://accountscenter.instagram.com/your_information/" target="_blank" className="nav-btn show-mobile" style={{marginTop: '16px', display: 'block'}}>
              Buka Pusat Akun Meta ↗
            </a>
          </div>
        </section>
      )}

      {/* STEP 2: UPLOAD */}
      {step === 2 && (
        <section className="card glass-effect fadeIn">
          <h2 className="card-title center">Seret & Lepas File JSON</h2>
          <p className="center-desc">Data kamu diproses di memori browser perangkat ini secara mutlak.</p>
          
          <div className="grid-responsive">
            <div className="upload-wrapper" onDragEnter={(e) => handleDrag(e, 'following')} onDragLeave={(e) => handleDrag(e, 'following')} onDragOver={(e) => handleDrag(e, 'following')} onDrop={(e) => handleDrop(e, 'following')}>
              <span className="field-label">1. following.json</span>
              <div className={`drop-zone ${following.length > 0 ? 'success' : ''} ${dragActive.type === 'following' ? 'drag-in' : ''}`} onClick={() => followingInputRef.current?.click()}>
                <div className="zone-icon">{following.length > 0 ? '✅' : '📥'}</div>
                <span className="zone-label">{following.length > 0 ? `${following.length} Akun` : 'Ketuk atau Tarik File'}</span>
              </div>
              <input type="file" ref={followingInputRef} accept=".json" onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0], 'following')} />
            </div>

            <div className="upload-wrapper" onDragEnter={(e) => handleDrag(e, 'followers')} onDragLeave={(e) => handleDrag(e, 'followers')} onDragOver={(e) => handleDrag(e, 'followers')} onDrop={(e) => handleDrop(e, 'followers')}>
              <span className="field-label">2. followers_1.json</span>
              <div className={`drop-zone ${followers.length > 0 ? 'success' : ''} ${dragActive.type === 'followers' ? 'drag-in' : ''}`} onClick={() => followersInputRef.current?.click()}>
                <div className="zone-icon">{followers.length > 0 ? '✅' : '📥'}</div>
                <span className="zone-label">{followers.length > 0 ? `${followers.length} Akun` : 'Ketuk atau Tarik File'}</span>
              </div>
              <input type="file" ref={followersInputRef} accept=".json" onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0], 'followers')} />
            </div>
          </div>

          {loading && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p className="loading-note">Sedang mengkalkulasi hantu di akunmu...</p>
            </div>
          )}

          <div className="card-bottom center">
            <button className="btn-secondary" onClick={() => setStep(1)}>Buka Bantuan</button>
          </div>
        </section>
      )}

      {/* STEP 3: RESULTS */}
      {step === 3 && (
        <section className="card glass-effect fadeIn">
          <div className="results-top">
            <div className="results-title-group">
              <h2 className="card-title">Hasil Temuan</h2>
              <p className="red-note">{unfollowers.length} akun tidak folback.</p>
            </div>
            <button className="btn-small-primary" onClick={() => { setFollowing([]); setFollowers([]); setUnfollowers([]); setStep(2); }}>Ulangi</button>
          </div>

          <div className="search-wrap">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2.5" className="s-icon"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" placeholder="Cari username..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="s-field" />
          </div>

          <div className="list-wrap">
            {filteredUnfollowers.length > 0 ? filteredUnfollowers.map((user, index) => (
              <div key={index} className="list-row" onClick={() => copyToClipboard(user)}>
                <span className="u-name">@{user}</span>
                <div className={`u-badge ${copied === user ? 'is-copied' : 'is-ghost'}`}>
                  {copied === user ? 'Copied' : 'Gak Folback'}
                </div>
              </div>
            )) : (
              <div className="list-empty">
                <div className="empty-emoji">🥂</div>
                <p>Akun kamu bersih. Semua orang sudah folback!</p>
              </div>
            )}
          </div>
          <p className="footer-tip">Ketuk username untuk menyalin & unfollow di aplikasi Instagram.</p>
        </section>
      )}

      <footer className="main-footer">
        <p>© 2026 GHOST CHECKER — THE ARCHITECT EDITION</p>
        <p className="footer-sub">DATA PRIVACY IS A HUMAN RIGHT.</p>
      </footer>

      <style jsx>{`
        /* Mathematical Spacing & Grid System */
        .container { max-width: 800px; margin: 0 auto; padding: 80px 24px; }
        .main-header { text-align: center; margin-bottom: 56px; }
        .logo-box { display: inline-flex; background: rgba(255,255,255,0.05); padding: 14px; border-radius: 18px; border: 1px solid rgba(255,255,255,0.1); margin-bottom: 20px; }
        .main-title { font-size: 3.5rem; font-weight: 900; letter-spacing: -1.5px; margin-bottom: 8px; background: linear-gradient(to bottom, #fff 20%, #888 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; line-height: 1.1; }
        .main-subtitle { font-size: 1.15rem; color: #777; font-weight: 500; }
        
        .card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 32px; padding: 48px; box-shadow: 0 32px 64px rgba(0,0,0,0.5); backdrop-filter: blur(60px); -webkit-backdrop-filter: blur(60px); }
        .card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; }
        .card-title { font-size: 1.8rem; font-weight: 800; color: #fff; letter-spacing: -0.5px; }
        .card-title.center { text-align: center; margin-bottom: 8px; }
        .center-desc { text-align: center; color: #666; font-size: 0.95rem; margin-bottom: 40px; }
        
        .nav-btn { color: #888; text-decoration: none; font-size: 0.85rem; font-weight: 700; border: 1px solid #333; padding: 10px 18px; border-radius: 12px; transition: all 0.2s; display: inline-block; }
        .nav-btn:hover { border-color: #fff; color: #fff; background: rgba(255,255,255,0.05); }
        .show-mobile { display: none; }
        
        .instruction-stack { display: flex; flex-direction: column; gap: 32px; }
        .instr-row { display: flex; gap: 20px; align-items: flex-start; }
        .instr-num { background: #fff; color: #000; width: 34px; height: 34px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 0.9rem; flex-shrink: 0; box-shadow: 0 8px 16px rgba(255,255,255,0.1); }
        .instr-label { font-weight: 700; font-size: 1.1rem; color: #eee; display: block; margin-bottom: 6px; line-height: 1.3; }
        .instr-text { color: #777; font-size: 0.95rem; line-height: 1.6; }
        
        .card-bottom { margin-top: 48px; }
        .card-bottom.center { text-align: center; }
        
        .btn-primary { background: #fff; color: #000; border: none; padding: 16px 36px; border-radius: 16px; font-weight: 800; font-size: 1rem; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); display: inline-flex; align-items: center; justify-content: center; width: auto; }
        .btn-primary:hover { transform: scale(1.02) translateY(-2px); box-shadow: 0 16px 32px rgba(255,255,255,0.15); }
        .btn-secondary { background: transparent; color: #666; border: 1px solid #333; padding: 12px 28px; border-radius: 14px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
        .btn-secondary:hover { color: #fff; border-color: #666; }
        
        .grid-responsive { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .field-label { color: #555; font-size: 0.8rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 12px; display: block; }
        .drop-zone { background: rgba(255,255,255,0.02); border: 2px dashed rgba(255,255,255,0.08); border-radius: 20px; padding: 40px 16px; text-align: center; cursor: pointer; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        .drop-zone:hover { background: rgba(255,255,255,0.04); border-color: #444; transform: translateY(-4px); }
        .drop-zone.success { border-color: #00ff88; background: rgba(0,255,136,0.03); border-style: solid; }
        .drop-zone.drag-in { background: rgba(255,255,255,0.08) !important; border-color: #fff !important; transform: scale(1.02); }
        .zone-icon { font-size: 2.5rem; margin-bottom: 12px; }
        .zone-label { font-weight: 700; color: #fff; font-size: 0.9rem; }
        
        .loading-state { margin-top: 48px; text-align: center; }
        .spinner { width: 32px; height: 32px; border: 3px solid rgba(255,255,255,0.1); border-top-color: #fff; border-radius: 50%; animation: spin 0.8s infinite linear; margin: 0 auto 16px; }
        .loading-note { color: #777; font-weight: 600; font-size: 0.9rem; }
        @keyframes spin { to { transform: rotate(360deg); } }
        
        .results-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
        .red-note { color: #ff3b30; font-weight: 700; font-size: 1.1rem; margin-top: 4px; }
        .btn-small-primary { background: #fff; color: #000; border: none; padding: 10px 20px; border-radius: 12px; font-weight: 700; font-size: 0.85rem; cursor: pointer; }
        
        .search-wrap { position: relative; margin-bottom: 24px; }
        .s-icon { position: absolute; left: 18px; top: 50%; transform: translateY(-50%); }
        .s-field { width: 100%; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 18px; padding: 16px 16px 16px 52px; color: #fff; font-size: 1rem; outline: none; transition: all 0.2s; }
        .s-field:focus { border-color: rgba(255,255,255,0.2); background: rgba(255,255,255,0.06); }
        
        .list-wrap { max-height: 440px; overflow-y: auto; border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; background: rgba(0,0,0,0.2); }
        .list-row { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.03); cursor: pointer; transition: background 0.2s; }
        .list-row:hover { background: rgba(255,255,255,0.04); }
        .u-name { font-weight: 700; color: #eee; font-size: 0.95rem; }
        .u-badge { padding: 6px 12px; border-radius: 20px; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
        .u-badge.is-ghost { background: rgba(255,59,48,0.1); color: #ff3b30; }
        .u-badge.is-copied { background: rgba(0,255,136,0.1); color: #00ff88; }
        .list-empty { padding: 80px 24px; text-align: center; color: #555; }
        .empty-emoji { font-size: 3rem; margin-bottom: 16px; }
        .footer-tip { text-align: center; margin-top: 24px; font-size: 0.85rem; color: #555; font-weight: 600; }
        
        .alert-box { background: rgba(255,59,48,0.1); border: 1px solid rgba(255,59,48,0.2); border-radius: 16px; padding: 16px 24px; display: flex; align-items: center; gap: 12px; margin-bottom: 32px; animation: shake 0.4s ease-in-out; }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }
        .alert-text { color: #ff3b30; font-weight: 600; font-size: 0.9rem; line-height: 1.4; }
        
        .main-footer { text-align: center; margin-top: 64px; opacity: 0.3; padding-bottom: 32px; }
        .main-footer p { font-size: 0.75rem; font-weight: 800; letter-spacing: 1.5px; margin-bottom: 4px; }
        .footer-sub { color: #555; }
        
        .fadeIn { animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        
        input[type="file"] { display: none; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: #222; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #333; }

        /* ========================================= */
        /* 📱 FLUID RESPONSIVE ENGINE (MOBILE FIRST) */
        /* ========================================= */
        @media (max-width: 768px) {
          .container { padding: 40px 16px; }
          .main-header { margin-bottom: 40px; }
          .main-title { font-size: 2.25rem; letter-spacing: -1px; }
          .main-subtitle { font-size: 0.95rem; padding: 0 10px; line-height: 1.4; }
          
          .card { padding: 24px; border-radius: 24px; }
          .card-top { margin-bottom: 24px; }
          .card-title { font-size: 1.4rem; }
          
          .hide-mobile { display: none; }
          .show-mobile { display: inline-block; width: 100%; text-align: center; }
          
          .instruction-stack { gap: 24px; }
          .instr-row { gap: 16px; flex-direction: column; }
          .instr-num { margin-bottom: -8px; }
          
          .grid-responsive { grid-template-columns: 1fr; gap: 16px; }
          .drop-zone { padding: 32px 16px; }
          
          .btn-primary { width: 100%; padding: 16px 20px; font-size: 0.95rem; }
          .btn-secondary { width: 100%; }
          
          .results-top { flex-direction: column; gap: 16px; align-items: flex-start; }
          .btn-small-primary { width: 100%; text-align: center; padding: 12px; }
          
          .list-row { padding: 16px; flex-direction: column; align-items: flex-start; gap: 12px; }
          .u-badge { align-self: flex-start; }
        }
      `}</style>
    </main>
  );
}
