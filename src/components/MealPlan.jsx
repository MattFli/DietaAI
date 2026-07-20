import React, { useState } from 'react';
import {
  Trash2,
  CheckCircle2,
  XCircle,
  RotateCcw,
  FileText,
  Plus
} from 'lucide-react';
import { uid, num, todayKey } from '../App.jsx';

const emptyMeal = {
  name: '',
  time: '',
  description: '',
  kcal: '',
  carbs: '',
  protein: '',
  fat: ''
};

function getMealStatus(mealPlan, mealId) {
  const today = todayKey();

  return (mealPlan?.completions || []).find(
    (entry) => entry.date === today && entry.mealId === mealId
  );
}

function statusLabel(status) {
  if (!status) return 'Da fare';
  if (status.status === 'done') return 'Completato';
  if (status.status === 'skipped') return 'Saltato';
  return 'Da fare';
}

function statusClass(status) {
  if (!status) return 'pending';
  if (status.status === 'done') return 'done';
  if (status.status === 'skipped') return 'skipped';
  return 'pending';
}

export default function MealPlan({
  mealPlan,
  updatePlan,
  onCompletePlanMeal,
  onSkipPlanMeal,
  onResetPlanMealStatus
}) {
  const [plan, setPlan] = useState(
    mealPlan || {
      pdfName: '',
      dailyKcalTarget: '',
      notes: '',
      meals: [],
      completions: []
    }
  );

  const [meal, setMeal] = useState(emptyMeal);

  const todayCompletions = plan.completions || [];
  const totalMeals = plan.meals?.length || 0;

  const completedToday = todayCompletions.filter(
    (entry) => entry.date === todayKey() && entry.status === 'done'
  ).length;

  const skippedToday = todayCompletions.filter(
    (entry) => entry.date === todayKey() && entry.status === 'skipped'
  ).length;

  const progressPct =
    totalMeals > 0 ? Math.round((completedToday / totalMeals) * 100) : 0;

  function commit(next) {
    setPlan(next);
    updatePlan(next);
  }

  function addPlannedMeal() {
    if (!meal.name.trim()) return;

    commit({
      ...plan,
      completions: plan.completions || [],
      meals: [
        ...(plan.meals || []),
        {
          id: uid(),
          ...meal,
          kcal: num(meal.kcal),
          carbs: num(meal.carbs),
          protein: num(meal.protein),
          fat: num(meal.fat)
        }
      ]
    });

    setMeal(emptyMeal);
  }

  function remove(id) {
    commit({
      ...plan,
      meals: (plan.meals || []).filter((m) => m.id !== id),
      completions: (plan.completions || []).filter((entry) => entry.mealId !== id)
    });
  }

  function handleComplete(plannedMeal) {
    onCompletePlanMeal(plannedMeal);

    const today = todayKey();

    const filtered = (plan.completions || []).filter(
      (entry) => !(entry.date === today && entry.mealId === plannedMeal.id)
    );

    commit({
      ...plan,
      completions: [
        ...filtered,
        {
          id: uid(),
          mealId: plannedMeal.id,
          date: today,
          status: 'done',
          updatedAt: new Date().toISOString()
        }
      ]
    });
  }

  function handleSkip(plannedMeal) {
    onSkipPlanMeal(plannedMeal);

    const today = todayKey();

    const filtered = (plan.completions || []).filter(
      (entry) => !(entry.date === today && entry.mealId === plannedMeal.id)
    );

    commit({
      ...plan,
      completions: [
        ...filtered,
        {
          id: uid(),
          mealId: plannedMeal.id,
          date: today,
          status: 'skipped',
          updatedAt: new Date().toISOString()
        }
      ]
    });
  }

  function handleReset(plannedMeal) {
    onResetPlanMealStatus(plannedMeal.id);

    const today = todayKey();

    commit({
      ...plan,
      completions: (plan.completions || []).filter(
        (entry) => !(entry.date === today && entry.mealId === plannedMeal.id)
      )
    });
  }

  return (
    <>
      <section className="card plan-hero">
        <div className="section-title-row">
          <div>
            <p className="eyebrow">Piano alimentare</p>
            <h2>Piano di oggi</h2>
          </div>

          <FileText size={22} className="success-color" />
        </div>

        <div className="plan-progress-box">
          <div>
            <span>Completamento</span>
            <strong>{progressPct}%</strong>
            <p>
              {completedToday} completati · {skippedToday} saltati · {totalMeals} totali
            </p>
          </div>

          <div className="plan-progress-circle">
            {completedToday}/{totalMeals || 0}
          </div>
        </div>

        <div className="plan-progress-track">
          <span style={{ width: `${progressPct}%` }} />
        </div>
      </section>

      <section className="card">
        <h2>Piano alimentare</h2>

        <p className="hint">
          Versione manuale intelligente: puoi caricare il PDF come riferimento,
          inserire i pasti previsti e segnare i pasti come completati o saltati.
        </p>

        <label className="file-btn full">
          Carica PDF piano alimentare
          <input
            hidden
            type="file"
            accept="application/pdf"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) commit({ ...plan, pdfName: f.name });
            }}
          />
        </label>

        {plan.pdfName && (
          <p className="hint">PDF selezionato: {plan.pdfName}</p>
        )}

        <div className="grid2">
          <input
            type="number"
            placeholder="Target kcal giornaliere"
            value={plan.dailyKcalTarget || ''}
            onChange={(e) =>
              commit({ ...plan, dailyKcalTarget: e.target.value })
            }
          />

          <textarea
            placeholder="Note generali del piano"
            value={plan.notes || ''}
            onChange={(e) => commit({ ...plan, notes: e.target.value })}
          />
        </div>
      </section>

      <section className="card">
        <div className="section-title-row">
          <div>
            <p className="eyebrow">Nuovo pasto</p>
            <h2>Aggiungi pasto previsto</h2>
          </div>

          <Plus size={20} className="success-color" />
        </div>

        <div className="grid2">
          <input
            placeholder="Nome pasto, es. Colazione"
            value={meal.name}
            onChange={(e) => setMeal({ ...meal, name: e.target.value })}
          />

          <input
            placeholder="Orario/momento"
            value={meal.time}
            onChange={(e) => setMeal({ ...meal, time: e.target.value })}
          />

          <textarea
            placeholder="Descrizione alimenti"
            value={meal.description}
            onChange={(e) =>
              setMeal({ ...meal, description: e.target.value })
            }
          />

          <input
            type="number"
            placeholder="Kcal"
            value={meal.kcal}
            onChange={(e) => setMeal({ ...meal, kcal: e.target.value })}
          />

          <input
            type="number"
            placeholder="Carboidrati g"
            value={meal.carbs}
            onChange={(e) => setMeal({ ...meal, carbs: e.target.value })}
          />

          <input
            type="number"
            placeholder="Proteine g"
            value={meal.protein}
            onChange={(e) => setMeal({ ...meal, protein: e.target.value })}
          />

          <input
            type="number"
            placeholder="Grassi g"
            value={meal.fat}
            onChange={(e) => setMeal({ ...meal, fat: e.target.value })}
          />
        </div>

        <button onClick={addPlannedMeal}>
          Aggiungi al piano
        </button>
      </section>

      <section className="card">
        <div className="section-title-row">
          <div>
            <p className="eyebrow">Pasti previsti</p>
            <h2>Lista del piano</h2>
          </div>
        </div>

        {(!plan.meals || plan.meals.length === 0) && (
          <p className="empty">Nessun pasto previsto inserito.</p>
        )}

        {plan.meals?.map((m) => {
          const status = getMealStatus(plan, m.id);
          const currentStatusClass = statusClass(status);

          return (
            <div className={`planned smart-plan-item ${currentStatusClass}`} key={m.id}>
              <div>
                <div className="smart-plan-heading">
                  <strong>{m.name}</strong>

                  {m.time && <span className="pill">{m.time}</span>}

                  <span className={`plan-status-pill ${currentStatusClass}`}>
                    {statusLabel(status)}
                  </span>
                </div>

                {m.description && <p>{m.description}</p>}

                <p>
                  C {m.carbs}g · P {m.protein}g · G {m.fat}g
                </p>
              </div>

              <strong>{m.kcal} kcal</strong>

              <div className="planned-actions smart-plan-actions">
                {!status && (
                  <>
                    <button onClick={() => handleComplete(m)}>
                      <CheckCircle2 size={16} />
                      Mangiato
                    </button>

                    <button
                      className="secondary"
                      onClick={() => handleSkip(m)}
                    >
                      <XCircle size={16} />
                      Salta
                    </button>
                  </>
                )}

                {status && (
                  <button
                    className="secondary"
                    onClick={() => handleReset(m)}
                  >
                    <RotateCcw size={16} />
                    Ripristina
                  </button>
                )}

                <button
                  className="ghost danger"
                  onClick={() => remove(m.id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </section>
    </>
  );
}