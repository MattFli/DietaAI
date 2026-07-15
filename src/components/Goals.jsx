import React, { useEffect, useMemo, useState } from "react";
import {
  Scale,
  Flame,
  Dumbbell,
  UtensilsCrossed,
  Target,
  CalendarCheck,
  Save,
  BarChart3
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

function dateKeyFromDate(date) {
  return date.toISOString().slice(0, 10);
}

function getLastDays(count) {
  const days = [];

  for (let i = count - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(dateKeyFromDate(d));
  }

  return days;
}

function getStartOfWeekKey() {
  const now = new Date();
  const day = now.getDay() === 0 ? 7 : now.getDay();
  now.setDate(now.getDate() - day + 1);
  return dateKeyFromDate(now);
}

function ProgressStat({ icon, label, value, helper }) {
  return (
    <div className="progress-stat-card">
      <div className="progress-stat-icon">{icon}</div>
      <span>{label}</span>
      <strong>{value}</strong>
      {helper && <p>{helper}</p>}
    </div>
  );
}

function ProgressBar({ label, value, goal, unit }) {
  const pct = goal > 0 ? Math.min(100, Math.round((value / goal) * 100)) : 0;

  return (
    <div className="progress-macro-row">
      <div className="progress-macro-head">
        <span>{label}</span>
        <strong>
          {Math.round(value)} / {Math.round(goal)} {unit}
        </strong>
      </div>

      <div className="progress-track">
        <span style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function Goals({
  goals,
  weightLog,
  meals,
  workouts,
  setGoals,
  logWeight
}) {
  const [g, setG] = useState(goals);

  useEffect(() => {
    setG(goals);
  }, [goals]);

  const last7Days = useMemo(() => getLastDays(7), []);
  const startOfWeekKey = getStartOfWeekKey();

  const last30Weights = weightLog.slice(-30).map((entry) => ({
    date: entry.date.slice(5),
    peso: entry.weight
  }));

  const currentWeight =
    num(goals.currentWeight) ||
    weightLog[weightLog.length - 1]?.weight ||
    0;

  const startWeight = num(goals.startWeight);
  const targetWeight = num(goals.targetWeight);

  const weightDiffToTarget =
    currentWeight && targetWeight
      ? Math.round(Math.abs(currentWeight - targetWeight) * 10) / 10
      : 0;

  const lostOrGained =
    startWeight && currentWeight
      ? Math.round(Math.abs(startWeight - currentWeight) * 10) / 10
      : 0;

  const weeklyMeals = meals.filter((meal) => last7Days.includes(meal.date));

  const daysWithMeals = last7Days.filter((date) =>
    meals.some((meal) => meal.date === date)
  );

  const weeklyCalories = last7Days.map((date) => {
    const dayMeals = meals.filter((meal) => meal.date === date);

    return dayMeals.reduce((sum, meal) => sum + num(meal.kcal), 0);
  });

  const averageCalories =
    weeklyCalories.length > 0
      ? Math.round(
          weeklyCalories.reduce((sum, value) => sum + value, 0) /
            weeklyCalories.length
        )
      : 0;

  const weeklyMacroTotals = weeklyMeals.reduce(
    (acc, meal) => ({
      carbs: acc.carbs + num(meal.carbs),
      protein: acc.protein + num(meal.protein),
      fat: acc.fat + num(meal.fat)
    }),
    { carbs: 0, protein: 0, fat: 0 }
  );

  const macroDivisor = Math.max(daysWithMeals.length, 1);

  const averageProtein = weeklyMacroTotals.protein / macroDivisor;
  const averageCarbs = weeklyMacroTotals.carbs / macroDivisor;
  const averageFat = weeklyMacroTotals.fat / macroDivisor;

  const weeklyWorkouts = workouts.filter(
    (workout) => workout.date >= startOfWeekKey
  );

  const weeklyWorkoutMinutes = weeklyWorkouts.reduce(
    (sum, workout) => sum + num(workout.duration),
    0
  );

  const weeklyWorkoutKcal = weeklyWorkouts.reduce(
    (sum, workout) => sum + num(workout.kcal),
    0
  );

  const daysWithWeight = last7Days.filter((date) =>
    weightLog.some((entry) => entry.date === date)
  );

  const mealAdherence = Math.round((daysWithMeals.length / 7) * 100);
  const weightAdherence = Math.round((daysWithWeight.length / 7) * 100);
  const workoutAdherence = Math.min(100, Math.round((weeklyWorkouts.length / 3) * 100));

  const totalScore = Math.round(
    mealAdherence * 0.45 + weightAdherence * 0.25 + workoutAdherence * 0.3
  );

  const totalMeals = meals.length;
  const totalWorkouts = workouts.length;
  const totalLoggedDays = new Set([
    ...meals.map((meal) => meal.date),
    ...workouts.map((workout) => workout.date),
    ...weightLog.map((entry) => entry.date)
  ]).size;

  function saveGoals() {
    setGoals(g);

    if (g.currentWeight) {
      logWeight(g.currentWeight);
    }
  }

  return (
    <>
      <section className="card progress-hero">
        <div className="section-title-row">
          <div>
            <p className="eyebrow">Progressi</p>
            <h2>Panoramica personale</h2>
          </div>

          <BarChart3 size={24} className="success-color" />
        </div>

        <div className="progress-stats-grid">
          <ProgressStat
            icon={<Scale size={20} />}
            label="Peso attuale"
            value={currentWeight ? `${currentWeight} kg` : "-"}
            helper={targetWeight ? `Target: ${targetWeight} kg` : "Target non impostato"}
          />

          <ProgressStat
            icon={<Target size={20} />}
            label="Mancano"
            value={targetWeight && currentWeight ? `${weightDiffToTarget} kg` : "-"}
            helper="Al peso obiettivo"
          />

          <ProgressStat
            icon={<CalendarCheck size={20} />}
            label="Score 7 giorni"
            value={`${totalScore}%`}
            helper="Aderenza generale"
          />
        </div>
      </section>

      <section className="card">
  <div className="section-title-row">
    <div>
      <p className="eyebrow">Peso</p>
      <h3>Andamento ultimi 30 giorni</h3>
    </div>
  </div>

	{last30Weights.length > 1 ? (
		<>
		<div className="chart">
			<ResponsiveContainer width="100%" height={220}>
			<LineChart data={last30Weights}>
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

		{startWeight > 0 && currentWeight > 0 && (
			<p className="hint">
			Variazione dal peso iniziale: {lostOrGained} kg
			</p>
		)}
		</>
	) : (
		<div className="progress-empty-chart">
		<Scale size={24} />
		<strong>
			{last30Weights.length === 1
			? "Serve almeno un'altra pesata"
			: "Nessuna pesata registrata"}
		</strong>
		<p>
			Il grafico verrà mostrato quando saranno presenti almeno due pesate in giorni diversi.
		</p>
		</div>
	)}
	</section>

      <section className="card">
        <div className="section-title-row">
          <div>
            <p className="eyebrow">Calorie</p>
            <h3>Media ultimi 7 giorni</h3>
          </div>

          <Flame size={22} className="success-color" />
        </div>

        <div className="progress-calorie-box">
          <span>Media giornaliera</span>
          <strong>{averageCalories} kcal</strong>
          <p>Target: {Math.round(num(goals.dailyKcal, 2000))} kcal</p>
        </div>
      </section>

      <section className="card">
        <div className="section-title-row">
          <div>
            <p className="eyebrow">Macro</p>
            <h3>Medie sui giorni registrati</h3>
          </div>

          <UtensilsCrossed size={22} className="success-color" />
        </div>

        <ProgressBar
          label="Proteine"
          value={averageProtein}
          goal={num(goals.proteinGoal, 120)}
          unit="g"
        />

        <ProgressBar
          label="Carboidrati"
          value={averageCarbs}
          goal={num(goals.carbsGoal, 250)}
          unit="g"
        />

        <ProgressBar
          label="Grassi"
          value={averageFat}
          goal={num(goals.fatGoal, 65)}
          unit="g"
        />
      </section>

      <section className="card">
        <div className="section-title-row">
          <div>
            <p className="eyebrow">Allenamenti</p>
            <h3>Questa settimana</h3>
          </div>

          <Dumbbell size={22} className="success-color" />
        </div>

        <div className="progress-stats-grid">
          <ProgressStat
            icon={<Dumbbell size={20} />}
            label="Sessioni"
            value={weeklyWorkouts.length}
            helper="Da lunedì"
          />

          <ProgressStat
            icon={<CalendarCheck size={20} />}
            label="Minuti"
            value={weeklyWorkoutMinutes}
            helper="Totali"
          />

          <ProgressStat
            icon={<Flame size={20} />}
            label="Kcal"
            value={Math.round(weeklyWorkoutKcal)}
            helper="Bruciate"
          />
        </div>
      </section>

      <section className="card">
        <div className="section-title-row">
          <div>
            <p className="eyebrow">Aderenza</p>
            <h3>Ultimi 7 giorni</h3>
          </div>

          <CalendarCheck size={22} className="success-color" />
        </div>

        <ProgressBar
          label="Giorni con pasti registrati"
          value={daysWithMeals.length}
          goal={7}
          unit="gg"
        />

        <ProgressBar
          label="Giorni con peso registrato"
          value={daysWithWeight.length}
          goal={7}
          unit="gg"
        />

        <ProgressBar
          label="Allenamenti settimana"
          value={weeklyWorkouts.length}
          goal={3}
          unit="sessioni"
        />
      </section>

      <section className="card">
        <div className="section-title-row">
          <div>
            <p className="eyebrow">Statistiche</p>
            <h3>Totali registrati</h3>
          </div>
        </div>

        <div className="progress-stats-grid">
          <ProgressStat
            icon={<CalendarCheck size={20} />}
            label="Giorni"
            value={totalLoggedDays}
            helper="Con dati"
          />

          <ProgressStat
            icon={<UtensilsCrossed size={20} />}
            label="Pasti"
            value={totalMeals}
            helper="Totali"
          />

          <ProgressStat
            icon={<Dumbbell size={20} />}
            label="Sport"
            value={totalWorkouts}
            helper="Allenamenti"
          />
        </div>
      </section>

      <section className="card">
        <div className="section-title-row">
          <div>
            <p className="eyebrow">Impostazioni</p>
            <h3>Obiettivi personali</h3>
          </div>
        </div>

        <div className="grid2">
          <input
            type="number"
            step="0.1"
            placeholder="Peso iniziale kg"
            value={g.startWeight}
            onChange={(e) => setG({ ...g, startWeight: e.target.value })}
          />

          <input
            type="number"
            step="0.1"
            placeholder="Peso attuale kg"
            value={g.currentWeight}
            onChange={(e) => setG({ ...g, currentWeight: e.target.value })}
          />

          <input
            type="number"
            step="0.1"
            placeholder="Peso obiettivo kg"
            value={g.targetWeight}
            onChange={(e) => setG({ ...g, targetWeight: e.target.value })}
          />

          <input
            type="date"
            value={g.targetDate}
            onChange={(e) => setG({ ...g, targetDate: e.target.value })}
          />

          <input
            type="number"
            placeholder="Kcal giornaliere"
            value={g.dailyKcal}
            onChange={(e) => setG({ ...g, dailyKcal: e.target.value })}
          />

          <input
            type="number"
            placeholder="Carboidrati g"
            value={g.carbsGoal}
            onChange={(e) => setG({ ...g, carbsGoal: e.target.value })}
          />

          <input
            type="number"
            placeholder="Proteine g"
            value={g.proteinGoal}
            onChange={(e) => setG({ ...g, proteinGoal: e.target.value })}
          />

          <input
            type="number"
            placeholder="Grassi g"
            value={g.fatGoal}
            onChange={(e) => setG({ ...g, fatGoal: e.target.value })}
          />
        </div>

        <button className="profile-action" onClick={saveGoals}>
          <Save size={18} />
          Salva obiettivi
        </button>
      </section>
    </>
  );
}