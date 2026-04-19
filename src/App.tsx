import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

axios.defaults.withCredentials = true;
axios.defaults.headers.common['x-admin-request'] = 'true';

const THEME = {
  bg: '#0d1117',
  card: '#161b22',
  border: '#30363d',
  text: '#c9d1d9',
  textMuted: '#8b949e',
  primary: '#58a6ff',
  success: '#238636',
  danger: '#f85149',
  accent: '#79c0ff',
  warning: '#d29922'
};

const CHART_COLORS = ['#58a6ff', '#3fb950', '#f85149', '#d29922', '#bc8cff', '#ff7b72'];

export default function App(){
  const [activeTab, setActiveTab] = useState<'analytics' | 'users' | 'management'>('analytics');
  const [areas, setAreas] = useState<any[]>([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [usernameHeader, setUsernameHeader] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState(0);
  
  const [users, setUsers] = useState<any[]>([]);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('user');

  const [bookings, setBookings] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [trend, setTrend] = useState<any[]>([]);

  useEffect(() => {
    async function checkSession() {
      try {
        const res = await axios.get('/api/auth/me');
        if (res.data.role === 'admin') {
          setUserRole(res.data.role); 
          setUserId(res.data.userId);
          setUsernameHeader(res.data.username);
        } else if (res.data.role) {
          await axios.post('/api/auth/logout');
        }
      } catch (err) {
      } finally { setLoading(false); }
    }
    checkSession();
  }, []);

  useEffect(()=>{ 
    if(userRole==='admin') {
      fetchAreas(); fetchBookings(); fetchStats(); fetchTrend(); fetchUsers();
      const socket = io(window.location.origin.replace('5174', '4000').replace('5173', '4000'));
      socket.on('bookingUpdated', () => { 
        fetchAreas(); fetchBookings(); fetchStats(); fetchTrend();
      });
      socket.on('userUpdated', () => fetchUsers());
      return () => { socket.disconnect(); };
    } 
  },[userRole]);

  async function login(e:any){
    e.preventDefault();
    try {
      const res = await axios.post('/api/auth/login', { username, password, isAdminLogin: true });
      setUserRole(res.data.role); setUserId(res.data.userId);
      const meRes = await axios.get('/api/auth/me');
      setUsernameHeader(meRes.data.username);
    } catch(err: any) { 
      alert(err.response?.data?.error || 'Login fallito'); 
    }
  }

  async function logout() {
    try {
      await axios.post('/api/auth/logout');
      setUserRole(null); setUserId(null); setUsernameHeader(null); setAreas([]); setBookings([]); setStats(null); setTrend([]); setUsers([]);
    } catch (err) { console.error('Logout failed', err); }
  }

  async function fetchAreas(){
    const res = await axios.get('/api/areas');
    setAreas(res.data);
  }

  async function addArea(e:any){
    e.preventDefault();
    if (!id || !capacity) return alert('ID e Capienza obbligatori');
    await axios.post('/api/areas', { id, name, capacity });
    setId(''); setName(''); setCapacity(0); fetchAreas();
  }

  async function deleteArea(areaId: string) {
    if (!confirm(`Eliminare il parcheggio ${areaId}? Questa azione farà scadere le prenotazioni attive ma manterrà i log storici.`)) return;
    try {
      await axios.delete(`/api/areas/${areaId}`);
      fetchAreas();
    } catch (err) { alert('Errore eliminazione area'); }
  }

  async function fetchBookings(){
    const res = await axios.get('/api/bookings/all');
    setBookings(res.data);
  }

  async function fetchStats(){
    const res = await axios.get('/api/bookings/stats/30days');
    setStats(res.data);
  }

  async function fetchTrend() {
    const res = await axios.get('/api/bookings/trend/7days');
    setTrend(res.data);
  }

  async function fetchUsers() {
    const res = await axios.get('/api/auth/users');
    setUsers(res.data);
  }

  async function createUser(e:any) {
    e.preventDefault();
    try {
      await axios.post('/api/auth/users', { username: newUsername, password: newPassword, role: newRole });
      setNewUsername(''); setNewPassword('');
      alert('Utente creato');
      fetchUsers();
    } catch (err) { alert('Errore creazione utente'); }
  }

  async function deleteUser(id: number) {
    if (!confirm('Eliminare questo utente?')) return;
    try {
      await axios.delete(`/api/auth/users/${id}`);
      fetchUsers();
    } catch (err) { alert('Errore eliminazione utente'); }
  }

  async function expireAllBookings() {
    if (!confirm('Far scadere all\'istante tutte le prenotazioni attive?')) return;
    try {
      await axios.post('/api/bookings/management/expire-all');
      alert('Tutte le prenotazioni attive sono state fatte scadere.');
    } catch (err) { alert('Errore durante l\'operazione'); }
  }

  async function clearAllHistory() {
    if (!confirm('ATTENZIONE: Cancellare definitivamente TUTTA la cronologia, i log e le statistiche?')) return;
    try {
      await axios.post('/api/bookings/management/clear-history');
      alert('Cronologia e statistiche resettate correttamente.');
    } catch (err) { alert('Errore durante l\'operazione'); }
  }

  if (loading) return <div style={{ padding: '24px', color: THEME.textMuted, backgroundColor: THEME.bg, height: '100vh' }}>Caricamento...</div>;

  return (
    <div style={{ 
      padding: '24px', 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif', 
      backgroundColor: THEME.bg, 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      overflow: 'hidden', 
      boxSizing: 'border-box',
      color: THEME.text
    }}>
      <style>{`
        html, body { margin: 0; padding: 0; height: 100%; overflow: hidden; background-color: ${THEME.bg}; }
        .no-scrollbar::-webkit-scrollbar { width: 4px; }
        .no-scrollbar::-webkit-scrollbar-thumb { background: ${THEME.border}; border-radius: 10px; }
        .card { 
          background: ${THEME.card}; 
          border: 1px solid ${THEME.border}; 
          border-radius: 16px; 
          display: flex; 
          flex-direction: column; 
          min-height: 0; 
          overflow: hidden; 
        }
        .card-title { 
          width: 100%;
          font-size: 11px; 
          font-weight: 800; 
          color: ${THEME.textMuted}; 
          text-transform: uppercase; 
          letter-spacing: 2px; 
          text-align: center; 
          padding: 16px 0 10px 0; 
          flex-shrink: 0;
          border-bottom: 1px solid rgba(255,255,255,0.03);
        }
        .scroll-area { 
          overflow-y: auto; 
          flex: 1; 
          padding: 16px 20px; 
        }
        .list-item { padding: 14px 0; border-bottom: 1px solid ${THEME.border}; }
        .list-item:last-child { border-bottom: none; }
        input, select { background: ${THEME.bg}; color: ${THEME.text}; border: 1px solid ${THEME.border}; padding: 10px 14px; border-radius: 8px; outline: none; font-size: 14px; transition: border-color 0.2s; width: 100%; box-sizing: border-box; }
        input:focus, select:focus { border-color: ${THEME.primary}; box-shadow: 0 0 0 3px rgba(88, 166, 255, 0.15); }
        button { transition: all 0.2s ease; cursor: pointer; border: none; }
        button:hover:not(:disabled) { filter: brightness(1.1); transform: translateY(-1px); }
        .tab-btn { background: none; color: ${THEME.textMuted}; padding: 8px 16px; border-radius: 6px; font-weight: 600; font-size: 14px; }
        .tab-btn.active { color: ${THEME.primary}; background: rgba(88, 166, 255, 0.1); }
      `}</style>
      
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '32px', height: '32px', backgroundColor: THEME.primary, borderRadius: '8px', display: 'grid', placeItems: 'center', fontWeight: 'bold', color: THEME.bg }}>A</div>
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 800 }}>Admin <span style={{ color: THEME.primary }}>Panel</span></h1>
          </div>
          {userRole === 'admin' && (
            <nav style={{ display: 'flex', gap: '8px' }}>
              <button className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>Analytics</button>
              <button className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>Gestione Utenti</button>
              <button className={`tab-btn ${activeTab === 'management' ? 'active' : ''}`} onClick={() => setActiveTab('management')}>Gestione Parcheggi</button>
            </nav>
          )}
        </div>
        {userRole === 'admin' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: THEME.textMuted }}>{usernameHeader}</span>
            <button onClick={logout} style={{ backgroundColor: THEME.card, color: THEME.text, border: `1px solid ${THEME.border}`, padding: '8px 16px', borderRadius: '10px', fontWeight: 600 }}>Logout</button>
          </div>
        )}
      </header>

      {userRole !== 'admin' ? (
        <div style={{ background: THEME.card, padding: '40px', borderRadius: '20px', border: `1px solid ${THEME.border}`, boxShadow: '0 8px 24px rgba(0,0,0,0.3)', maxWidth: '380px', margin: 'auto', width: '100%' }}>
          <div className="card-title">Autenticazione Admin</div>
          <form onSubmit={login} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} />
            <input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
            <button style={{ padding: '14px', backgroundColor: THEME.primary, color: THEME.bg, border: 'none', borderRadius: '10px', fontWeight: 700 }}>Entra</button>
          </form>
        </div>
      ) : activeTab === 'analytics' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: 1, minHeight: 0 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', height: '35%' }}>
            <section className="card">
              <div className="card-title">Crea Nuova Area</div>
              <div className="scroll-area no-scrollbar" style={{ display: 'flex', flexDirection: 'column', gap: '10px', justifyContent: 'center' }}>
                <input placeholder="ID (es. C3)" value={id} onChange={e=>setId(e.target.value)} />
                <input placeholder="Nome Area" value={name} onChange={e=>setName(e.target.value)} />
                <input placeholder="Capienza" type="number" value={capacity} onChange={e=>setCapacity(Number(e.target.value))} />
                <button onClick={addArea} style={{ padding: '10px', backgroundColor: THEME.success, color: 'white', borderRadius: '8px', fontWeight: 700 }}>Aggiungi</button>
              </div>
            </section>

            <section className="card">
              <div className="card-title" style={{ color: THEME.accent }}>Occupazione Real-time</div>
              <div className="scroll-area no-scrollbar">
                {areas.map(a=> (
                  <div key={a.id} className="list-item">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 700 }}>{a.name || a.id} <small style={{ color: THEME.textMuted }}>#{a.id}</small></span>
                      <span style={{ fontSize: '12px', color: a.available < 5 ? THEME.danger : THEME.textMuted }}>{a.available} liberi / {a.capacity}</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', backgroundColor: THEME.bg, borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${((a.capacity - a.available) / a.capacity) * 100}%`, height: '100%', backgroundColor: a.available < 5 ? THEME.danger : THEME.success, boxShadow: `0 0 8px ${a.available < 5 ? THEME.danger : THEME.success}` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '24px', flex: 1, minHeight: 0 }}>
            <section className="card">
              <div className="card-title">Log Attività</div>
              <div className="scroll-area no-scrollbar">
                {bookings.slice().reverse().map(b => (
                  <div key={b.id} className="list-item" style={{ fontSize: '12px' }}>
                    <div style={{ fontWeight: 700 }}>{b.user.username}</div>
                    <div style={{ color: THEME.textMuted, marginTop: '2px' }}>{b.areaName || b.areaId || 'Area Eliminata'} • {new Date(b.from).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                ))}
              </div>
            </section>

            <section className="card">
              <div className="card-title" style={{ color: THEME.accent }}>Trend Prenotazioni</div>
              <div className="scroll-area no-scrollbar" style={{ padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                <div style={{ width: '100%', height: '100%', padding: '20px 20px 10px 0', boxSizing: 'border-box' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={THEME.border} vertical={false} />
                      <XAxis dataKey="date" stroke={THEME.textMuted} fontSize={10} tickFormatter={(str) => str.split('-').slice(1).reverse().join('/')} tickLine={false} axisLine={false} />
                      <YAxis stroke={THEME.textMuted} fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: '8px', color: THEME.text }} itemStyle={{ fontSize: '12px' }} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '15px' }} />
                      {Array.from(new Set(trend.flatMap(d => Object.keys(d).filter(k => k !== 'date')))).map((key, idx) => (
                        <Line key={key} type="monotone" dataKey={key} name={key} stroke={CHART_COLORS[idx % CHART_COLORS.length]} strokeWidth={2.5} dot={{ r: 4, strokeWidth: 2, fill: THEME.card }} activeDot={{ r: 6 }} />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </section>

            <section className="card">
              <div className="card-title">Storage Analytics</div>
              <div className="scroll-area no-scrollbar">
                {stats ? Object.keys(stats).sort().reverse().slice(0, 5).map(day => (
                  <div key={day} style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '10px', fontWeight: 800, color: THEME.accent, marginBottom: '8px' }}>{day}</div>
                    {Object.keys(stats[day]).map(areaId => (
                      <div key={areaId} style={{ fontSize: '12px', display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                        <span>{areaId}</span>
                        <span style={{ fontWeight: 700 }}>{stats[day][areaId]}</span>
                      </div>
                    ))}
                  </div>
                )) : <div style={{ textAlign: 'center', fontSize: '12px', color: THEME.textMuted }}>...</div>}
              </div>
            </section>
          </div>
        </div>
      ) : activeTab === 'users' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', flex: 1, minHeight: 0 }}>
          <section className="card">
            <div className="card-title">Crea Nuovo Profilo</div>
            <div className="scroll-area no-scrollbar" style={{ display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'center' }}>
              <div>
                <label style={{ fontSize: '11px', color: THEME.textMuted, display: 'block', marginBottom: '8px' }}>USERNAME</label>
                <input value={newUsername} onChange={e=>setNewUsername(e.target.value)} placeholder="Esem. mario.rossi" />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: THEME.textMuted, display: 'block', marginBottom: '8px' }}>PASSWORD</label>
                <input type="password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} placeholder="••••••••" />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: THEME.textMuted, display: 'block', marginBottom: '8px' }}>RUOLO</label>
                <select value={newRole} onChange={e=>setNewRole(e.target.value)}>
                  <option value="user">User (Cittadino)</option>
                  <option value="admin">Admin (Amministratore)</option>
                </select>
              </div>
              <button onClick={createUser} style={{ padding: '14px', backgroundColor: THEME.primary, color: THEME.bg, borderRadius: '10px', fontWeight: 700, marginTop: '8px' }}>Crea Profilo</button>
            </div>
          </section>

          <section className="card">
            <div className="card-title">Directory Utenti</div>
            <div className="scroll-area no-scrollbar">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ position: 'sticky', top: 0, background: THEME.card, zIndex: 1 }}>
                  <tr style={{ textAlign: 'left', borderBottom: `1px solid ${THEME.border}` }}>
                    <th style={{ padding: '12px', fontSize: '11px', color: THEME.textMuted }}>USERNAME</th>
                    <th style={{ padding: '12px', fontSize: '11px', color: THEME.textMuted }}>RUOLO</th>
                    <th style={{ padding: '12px', fontSize: '11px', color: THEME.textMuted, textAlign: 'right' }}>AZIONI</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} style={{ borderBottom: `1px solid ${THEME.border}` }}>
                      <td style={{ padding: '12px', fontWeight: 600 }}>{u.username}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ 
                          fontSize: '11px', 
                          fontWeight: 700, 
                          color: u.role === 'admin' ? THEME.primary : THEME.success,
                          backgroundColor: u.role === 'admin' ? 'rgba(88, 166, 255, 0.1)' : 'rgba(35, 134, 54, 0.1)',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          textTransform: 'uppercase'
                        }}>{u.role}</span>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <button onClick={() => deleteUser(u.id)} style={{ background: 'none', color: THEME.danger, fontSize: '12px', fontWeight: 600 }}>Elimina</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', flex: 1, minHeight: 0 }}>
          <section className="card">
            <div className="card-title" style={{ color: THEME.accent }}>Elimina Parcheggi</div>
            <div className="scroll-area no-scrollbar">
              {areas.map(a => (
                <div key={a.id} className="list-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{a.name || a.id}</div>
                    <div style={{ fontSize: '11px', color: THEME.textMuted }}>ID: {a.id} • Capienza: {a.capacity}</div>
                  </div>
                  <button onClick={() => deleteArea(a.id)} style={{ color: THEME.danger, background: 'rgba(248, 81, 73, 0.1)', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 700 }}>ELIMINA</button>
                </div>
              ))}
            </div>
          </section>

          <section className="card">
            <div className="card-title" style={{ color: THEME.warning }}>Manutenzione Rapida</div>
            <div className="scroll-area no-scrollbar" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ background: 'rgba(210, 153, 34, 0.05)', padding: '20px', borderRadius: '12px', border: `1px solid rgba(210, 153, 34, 0.2)` }}>
                <h3 style={{ fontSize: '16px', margin: '0 0 10px 0', color: THEME.warning }}>Svuota Tutti i Parcheggi</h3>
                <p style={{ fontSize: '13px', color: THEME.textMuted, marginBottom: '20px' }}>Fa scadere istantaneamente tutte le prenotazioni attive.</p>
                <button onClick={expireAllBookings} style={{ width: '100%', padding: '14px', backgroundColor: THEME.warning, color: THEME.bg, borderRadius: '10px', fontWeight: 700 }}>ESERGUITI ORA</button>
              </div>

              <div style={{ background: 'rgba(248, 81, 73, 0.05)', padding: '20px', borderRadius: '12px', border: `1px solid rgba(248, 81, 73, 0.2)` }}>
                <h3 style={{ fontSize: '16px', margin: '0 0 10px 0', color: THEME.danger }}>Reset Totale Cronologia</h3>
                <p style={{ fontSize: '13px', color: THEME.textMuted, marginBottom: '20px' }}>Cancellazione definitiva di tutta la cronologia e log.</p>
                <button onClick={clearAllHistory} style={{ width: '100%', padding: '14px', backgroundColor: THEME.danger, color: 'white', borderRadius: '10px', fontWeight: 700 }}>CANCELLA TUTTO</button>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
