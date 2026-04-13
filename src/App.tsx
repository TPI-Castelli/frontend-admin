import React, { useState, useEffect } from 'react';
import axios from 'axios';

axios.defaults.withCredentials = true;

export default function App(){
  const [areas, setAreas] = useState<any[]>([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState(0);
  const [bookings, setBookings] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  useEffect(()=>{ if(userRole) fetchAreas(); if(userRole==='admin') fetchBookings(); },[userRole]);

  async function login(e:any){
    e.preventDefault();
    const res = await axios.post('/api/auth/login', { username, password });
    setUserRole(res.data.role);
    setUserId(res.data.userId);
  }

  async function fetchAreas(){
    const res = await axios.get('/api/areas');
    setAreas(res.data);
  }

  async function addArea(e:any){
    e.preventDefault();
    await axios.post('/api/areas', { id, name, capacity });
    alert('Area aggiunta');
    fetchAreas();
  }

  async function fetchBookings(){
    const res = await axios.get('/api/bookings/all');
    setBookings(res.data);
  }

  async function fetchStats(){
    const res = await axios.get('/api/bookings/stats/30days');
    setStats(res.data);
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>SmartCity - Admin</h1>
      {!userRole && (
        <form onSubmit={login}>
          <input placeholder="username" value={username} onChange={e=>setUsername(e.target.value)} />
          <input placeholder="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
          <button>Login</button>
        </form>
      )}

      {userRole === 'admin' && (
        <div>
          <h2>Aggiungi area</h2>
          <form onSubmit={addArea}>
            <input placeholder="id" value={id} onChange={e=>setId(e.target.value)} />
            <input placeholder="name" value={name} onChange={e=>setName(e.target.value)} />
            <input placeholder="capacity" type="number" value={capacity} onChange={e=>setCapacity(Number(e.target.value))} />
            <button>Aggiungi</button>
          </form>

          <h2>Prenotazioni</h2>
          <button onClick={fetchBookings}>Ricarica prenotazioni</button>
          <ul>
            {bookings.map(b => (
              <li key={b.id}>#{b.id} user:{b.user.username} area:{b.areaId} from:{new Date(b.from).toLocaleString()}</li>
            ))}
          </ul>

          <h2>Statistiche ultimi 30 giorni</h2>
          <button onClick={fetchStats}>Carica stats</button>
          <pre>{stats ? JSON.stringify(stats, null, 2) : 'Nessuna stat'}</pre>
        </div>
      )}

      <h2>Are di parcheggio</h2>
      <ul>
        {areas.map(a=> (
          <li key={a.id}>{a.name} - disponibili: {a.available} / {a.capacity}</li>
        ))}
      </ul>
    </div>
  );
}
