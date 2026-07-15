import React, { useState } from "react";
import {
  Flame,
  UtensilsCrossed,
  Dumbbell,
  Scale,
  ClipboardList,
  Cloud,
  CloudOff,
  Zap
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip
} from "recharts";
import { num } from "../App.jsx";

function MacroCard({ icon, label, value, goal, unit }) {
  const pct = goal > 0 ? Math.min(100, Math.round((value / goal) * 100)) : 0;

  return (
    <div className="today-macro-card">
      <div className="today-macro-top">
        <span className="today-macro-icon">{icon}</span>
        <div>
          <strong>{label}</strong>
          <p>
            {Math.round(value)} / {Math.round(goal)} {unit}
          </p>
        </div>
      </div>

      <div className="today-progress">
        <span style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function StatCard({ label, value, helper }) {
  return (
    <div className="today-stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
      {helper && <p>{helper}</p>}
    </div>
  );
}

function SyncBadge({ isCloudActive, syncStatus }) {
  let label = "Locale";
  let className = "today-sync-badge local";

  if (isCloudActive) {
    label = syncStatus || "Cloud attivo";
    className = "today-sync-badge success";

    if ((syncStatus || "").toLowerCase().includes("sincronizzazione")) {
      className = "today-sync-badge syncing";
    }

    if ((syncStatus || "").toLowerCase().includes("errore")) {
      className = "today-sync-badge error";
    }
  }

  return (
    <div className={className}>
      {isCloudActive ? <Cloud size={14} /> : <CloudOff size={14} />}
      <span>{label}</span>
    </div>
  );
}

	export default function Dashboard({
		state,
		totals,
		burned,
		todayMeals,
		todayWorkouts,
		onGoTab,
		onWeight,
		onCopyYesterdayMeals,
		syncStatus,
		isCloudActive
	}) {
  const [weight, setWeight] = useState(state.goals.currentWeight || "");

  const g = state.goals;
  const yesterday = new Date();
	yesterday.setDate(yesterday.getDate() - 1);
	const yesterdayKey = yesterday.toISOString().slice(0, 10);

	const yesterdayMealsCount = state.meals.filter(
	(meal) => meal.date === yesterdayKey
	).length;
	
  const dailyKcal = num(g.dailyKcal, 2000);
  const net = totals.kcal - burned;
  const remaining = Math.round(dailyKcal - net);
  const remainingLabel = remaining >= 0 ? "kcal disponibili" : "kcal oltre obiettivo";

  const currentWeight =
    state.goals.currentWeight ||
    state.weightLog[state.weightLog.length - 1]?.weight ||
    "";

  const targetWeight = state.goals.targetWeight || "";

  const chart = state.weightLog.slice(-14).map((w) => ({
    date: w.date.slice(5),
    peso: w.weight
  }));

  const plannedMeals = state.mealPlan?.meals || [];

  const timeline = [
    ...todayMeals.map((m) => ({ ...m, kind: "meal" })),
    ...todayWorkouts.map((w) => ({ ...w, kind: "workout" }))
  ].sort((a, b) => a.time.localeCompare(b.time));

  return (
    <>
      <section className="today-hero card">
        <div className="today-hero-top">
          <div>
            <p className="eyebrow">Oggi</p>
            <h2>La tua giornata</h2>
          </div>

          <SyncBadge isCloudActive={isCloudActive} syncStatus={syncStatus} />
        </div>

        <div className="today-calorie-main">
          <div className="today-flame">
            <Flame size={30} />
          </div>

          <div>
            <span>{remainingLabel}</span>
            <strong>{Math.abs(remaining)}</strong>
            <p>
              {Math.round(totals.kcal)} assunte · {Math.round(burned)} bruciate
            </p>
          </div>
        </div>

        <div className="today-stats-grid">
          <StatCard
            label="Assunte"
            value={`${Math.round(totals.kcal)} kcal`}
            helper="Pasti di oggi"
          />

          <StatCard
            label="Bruciate"
            value={`${Math.round(burned)} kcal`}
            helper="Allenamenti"
          />

          <StatCard
            label="Obiettivo"
            value={`${Math.round(dailyKcal)} kcal`}
            helper="Target giornaliero"
          />
        </div>
      </section>

      <section className="today-actions-grid">
        <button onClick={() => onGoTab("pasti")}>
          <UtensilsCrossed size={18} />
          Pasto
        </button>

        <button className="secondary" onClick={() => onGoTab("allenamenti")}>
          <Dumbbell size={18} />
          Sport
        </button>

        <button className="secondary" onClick={() => onGoTab("obiettivi")}>
          <Scale size={18} />
          Peso
        </button>

        <button
			className={yesterdayMealsCount > 0 ? "secondary" : "disabled-action"}
			disabled={yesterdayMealsCount === 0}
			onClick={() => onCopyYesterdayMeals && onCopyYesterdayMeals()}
			title={
				yesterdayMealsCount > 0
				? `Copia ${yesterdayMealsCount} pasto/i da ieri`
				: "Nessun pasto registrato ieri"
			}
		>
			<ClipboardList size={18} />
			Copia ieri
		</button>
      </section>

      <section className="card">
        <div className="section-title-row">
          <div>
            <p className="eyebrow">Macronutrienti</p>
            <h3>Obiettivi di oggi</h3>
          </div>

          <Zap size={20} className="success-color" />
        </div>

        <div className="today-macro-grid">
          <MacroCard
            icon="🥩"
            label="Proteine"
            value={totals.protein}
            goal={num(g.proteinGoal, 120)}
            unit="g"
          />

          <MacroCard
            icon="🍞"
            label="Carboidrati"
            value={totals.carbs}
            goal={num(g.carbsGoal, 250)}
            unit="g"
          />

          <MacroCard
            icon="🥑"
            label="Grassi"
            value={totals.fat}
            goal={num(g.fatGoal, 65)}
            unit="g"
          />
        </div>
      </section>

      <section className="card today-weight-card">
        <div>
          <p className="eyebrow">Peso</p>
          <h3>
            {currentWeight ? `${currentWeight} kg` : "Peso non registrato"}
          </h3>

          {targetWeight && (
            <p className="hint">Obiettivo: {targetWeight} kg</p>
          )}
        </div>

        <div className="today-weight-form">
          <input
            type="number"
            step="0.1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="kg"
          />

          <button onClick={() => weight && onWeight(weight)}>
            Salva
          </button>
        </div>
      </section>

      {chart.length > 1 && (
        <section className="card">
          <div className="section-title-row">
            <div>
              <p className="eyebrow">Trend</p>
              <h3>Andamento peso</h3>
            </div>
          </div>

          <div className="chart">
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={chart}>
                <XAxis dataKey="date" />
                <YAxis domain={["dataMin - 1", "dataMax + 1"]} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="peso"
                  stroke="#16a34a"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      <section className="card">
        <div className="section-title-row">
          <div>
            <p className="eyebrow">Piano alimentare</p>
            <h3>Piano di oggi</h3>
          </div>

          <button
            className="mini-link-button"
            onClick={() => onGoTab("piano")}
          >
            Apri
          </button>
        </div>

        {plannedMeals.length === 0 ? (
          <p className="empty">
            Nessun pasto previsto nel piano. Puoi aggiungerlo dalla sezione Piano.
          </p>
        ) : (
          <div className="today-plan-list">
            {plannedMeals.slice(0, 4).map((meal) => (
              <div className="today-plan-item" key={meal.id}>
                <div>
                  <strong>{meal.name}</strong>
                  <p>
                    {meal.time || "Orario non indicato"} · {meal.kcal} kcal
                  </p>
                </div>

                <span>⏳</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="card">
        <div className="section-title-row">
          <div>
            <p className="eyebrow">Diario</p>
            <h3>Ultime attività di oggi</h3>
          </div>
        </div>

        {timeline.length === 0 && (
          <p className="empty">
            Ancora nessun pasto o allenamento registrato oggi.
          </p>
        )}

        {timeline.map((item) => (
          <div className="today-timeline-row" key={item.id}>
            <div className="today-timeline-icon">
              {item.kind === "workout" ? "🏃" : "🍽️"}
            </div>

            <div>
              <strong>{item.name}</strong>
              <p>
                {item.time}
                {item.kind === "workout" ? ` · ${item.duration} min` : ""}
              </p>
            </div>

            <span>
              {item.kind === "workout" ? "-" : ""}
              {Math.round(num(item.kcal))} kcal
            </span>
          </div>
        ))}
      </section>
    </>
  );
}