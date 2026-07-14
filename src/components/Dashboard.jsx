import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { num } from '../App.jsx';

function MacroBar({ label, value, goal, unit }) {
  const pct = goal > 0 ? Math.min(100, Math.round((value / goal) * 100)) : 0;
  return <div className="macro">
    <div className="macro-head"><span>{label}</span><b>{Math.round(value)} / {Math.round(goal)} {unit}</b></div>
    <div className="progress"><span style={{ width: `${pct}%` }} /></div>
  </div>;
}

export default function Dashboard({ state, totals, burned, todayMeals, todayWorkouts, onGoTab, onWeight }) {
  const [weight, setWeight] = useState(state.goals.currentWeight || '');
  const g = state.goals;
  const net = totals.kcal - burned;
  const chart = state.weightLog.slice(-14).map(w => ({ date: w.date.slice(5), peso: w.weight }));
  const timeline = [...todayMeals.map(m => ({...m, kind:'meal'})), ...todayWorkouts.map(w => ({...w, kind:'workout'}))].sort((a,b)=>a.time.localeCompare(b.time));
  return <>
    <section className="hero card">
      <div><p className="eyebrow">Bilancio di oggi</p><h2>{Math.round(net)} kcal</h2><p>{Math.round(totals.kcal)} assunte · {Math.round(burned)} bruciate</p></div>
      <div className="ring">{Math.max(0, Math.round(num(g.dailyKcal, 2000) - net))}<small>kcal rimaste</small></div>
    </section>
    <section className="card">
      <h3>Macronutrienti</h3>
      <MacroBar label="Calorie" value={totals.kcal} goal={num(g.dailyKcal,2000)} unit="kcal" />
      <MacroBar label="Carboidrati" value={totals.carbs} goal={num(g.carbsGoal,250)} unit="g" />
      <MacroBar label="Proteine" value={totals.protein} goal={num(g.proteinGoal,120)} unit="g" />
      <MacroBar label="Grassi" value={totals.fat} goal={num(g.fatGoal,65)} unit="g" />
    </section>
    <section className="card inline-form">
      <h3>Peso di oggi</h3>
      <input type="number" step="0.1" value={weight} onChange={e=>setWeight(e.target.value)} placeholder="kg" />
      <button onClick={()=> weight && onWeight(weight)}>Salva</button>
    </section>
    {chart.length > 1 && <section className="card"><h3>Andamento peso</h3><div className="chart"><ResponsiveContainer width="100%" height={180}><LineChart data={chart}><XAxis dataKey="date"/><YAxis domain={['dataMin - 1','dataMax + 1']}/><Tooltip/><Line type="monotone" dataKey="peso" stroke="#16a34a" strokeWidth={3}/></LineChart></ResponsiveContainer></div></section>}
    <section className="quick-actions"><button onClick={()=>onGoTab('pasti')}>Aggiungi pasto</button><button className="secondary" onClick={()=>onGoTab('allenamenti')}>Registra sport</button></section>
    <section className="card"><h3>Cronologia di oggi</h3>{timeline.length===0 && <p className="empty">Ancora nessun pasto o allenamento registrato oggi.</p>}{timeline.map(i => <div className="row" key={i.id}><div><b>{i.kind==='workout'?'🏃':'🍽️'} {i.name}</b><p>{i.time}{i.kind==='workout' ? ` · ${i.duration} min` : ''}</p></div><strong>{i.kind==='workout'?'-':''}{Math.round(num(i.kcal))} kcal</strong></div>)}</section>
  </>;
}
