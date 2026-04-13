import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function App(){
  const [areas, setAreas] = useState<any[]>([]);
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState(0);

  useEffect(()=>{ fetchAreas(); },[]);

  async function fetchAreas(){
    const res = await axios.get('/api/areas');
    setAreas(res.data);
  }

  async function addArea(e:any){
    e.preventDefault();
    // In prototype, areas are not persisted - this would call backend to add
    alert('Area aggiunta (simulata)');
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>SmartCity - Admin</h1>
      <form onSubmit={addArea}>
        <input placeholder="id" value={id} onChange={e=>setId(e.target.value)} />
        <input placeholder="name" value={name} onChange={e=>setName(e.target.value)} />
        <input placeholder="capacity" type="number" value={capacity} onChange={e=>setCapacity(Number(e.target.value))} />
        <button>Aggiungi area</button>
      </form>

      <h2>Are di parcheggio</h2>
      <ul>
        {areas.map(a=> (
          <li key={a.id}>{a.name} - capienza: {a.capacity}</li>
        ))}
      </ul>
    </div>
  );
}
