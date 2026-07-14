import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { num } from '../App.jsx';
const MET = { Corsa: 9.8, Camminata: 3.5, Pesi: 5, Ciclismo: 7.5, Nuoto: 8, Yoga: 2.5, Altro: 4 };
function fmtDate(d) { return new Date(d + 'T00:00:00').toLocaleDateString('it-IT', { weekday:'short', day:'numeric', month:'short' }); }
export default function Workouts({ workouts, weight, onAdd, onRemove }) {
  const [type,setType] = useState('Corsa'); const [duration,setDuration] = useState(30); const [manual,setManual] = useState('');
  const est = Math.round((MET[type] * 3.5 * (weight || 70) / 200) * num(duration));
  const sorted = [...workouts].sort((a,b)=>(b.date+b.time).localeCompare(a.date+a.time));
  return <><section className="card"><h2>Registra allenamento</h2><div className="grid2"><select value={type} onChange={e=>setType(e.target.value)}>{Object.keys(MET).map(t=><option key={t}>{t}</option>)}</select><input type="number" value={duration} onChange={e=>setDuration(e.target.value)} placeholder="Durata minuti"/><input type="number" value={manual} onChange={e=>setManual(e.target.value)} placeholder={`Kcal opzionali, stima ${est}`}/></div><button onClick={()=>{onAdd({name:type,type,duration:num(duration),kcal:manual?num(manual):est});setManual('')}}>Aggiungi allenamento</button></section><section className="card"><h2>Cronologia allenamenti</h2>{sorted.length===0 && <p className="empty">Nessun allenamento registrato ancora.</p>}{sorted.map(w=><div className="row" key={w.id}><div><b>{w.name}</b><p>{fmtDate(w.date)} · {w.time} · {w.duration} min</p></div><strong>-{Math.round(num(w.kcal))} kcal</strong><button className="ghost danger" onClick={()=>onRemove(w.id)}><Trash2 size={16}/></button></div>)}</section></>;
}
