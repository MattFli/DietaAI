import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { num } from '../App.jsx';

function fmtDate(d) { return new Date(d + 'T00:00:00').toLocaleDateString('it-IT', { weekday:'short', day:'numeric', month:'short' }); }
const emptyForm = { name:'', kcal:'', carbs:'', protein:'', fat:'' };

export default function Meals({ meals, onAdd, onRemove }) {
  const [form, setForm] = useState(emptyForm);
  const [photoName, setPhotoName] = useState('');
  const sorted = [...meals].sort((a,b)=>(b.date+b.time).localeCompare(a.date+a.time));
  const grouped = sorted.reduce((acc,m)=>{(acc[m.date]=acc[m.date]||[]).push(m);return acc;},{});
  function save() {
    if (!form.name.trim()) return;
    onAdd({ name: form.name, kcal:num(form.kcal), carbs:num(form.carbs), protein:num(form.protein), fat:num(form.fat), source: photoName ? 'manuale-da-foto' : 'manuale' });
    setForm(emptyForm); setPhotoName('');
  }
  return <>
    <section className="card"><h2>Registra un pasto</h2><p className="hint">Versione locale: la foto può essere allegata come riferimento, ma i valori vanno inseriti manualmente. L'AI verrà aggiunta in una fase successiva con backend sicuro.</p>
      <div className="grid2"><input placeholder="Nome pasto" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/><input type="number" placeholder="Kcal" value={form.kcal} onChange={e=>setForm({...form,kcal:e.target.value})}/><input type="number" placeholder="Carboidrati g" value={form.carbs} onChange={e=>setForm({...form,carbs:e.target.value})}/><input type="number" placeholder="Proteine g" value={form.protein} onChange={e=>setForm({...form,protein:e.target.value})}/><input type="number" placeholder="Grassi g" value={form.fat} onChange={e=>setForm({...form,fat:e.target.value})}/><label className="file-btn">Foto piatto<input hidden type="file" accept="image/*" capture="environment" onChange={e=>setPhotoName(e.target.files?.[0]?.name || '')}/></label></div>
      {photoName && <p className="hint">Foto selezionata: {photoName}</p>}<button onClick={save}>Salva pasto</button></section>
    <section className="card"><h2>Diario pasti</h2>{Object.keys(grouped).length===0 && <p className="empty">Nessun pasto registrato ancora.</p>}{Object.entries(grouped).map(([date,items]) => <div key={date} className="group"><h3>{fmtDate(date)}</h3>{items.map(m => <div className="row" key={m.id}><div><b>{m.name}</b><p>{m.time} · C {Math.round(num(m.carbs))}g · P {Math.round(num(m.protein))}g · G {Math.round(num(m.fat))}g</p></div><strong>{Math.round(num(m.kcal))} kcal</strong><button className="ghost danger" onClick={()=>onRemove(m.id)}><Trash2 size={16}/></button></div>)}</div>)}</section>
  </>;
}
