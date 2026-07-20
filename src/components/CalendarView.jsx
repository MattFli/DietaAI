import React, { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  UtensilsCrossed,
  Dumbbell,
  Scale,
  Plus,
  CalendarDays,
  ClipboardList
} from "lucide-react";
import { num, todayKey } from "../App.jsx";

function toDateKey(date) {
  return date.toISOString().slice(0, 10);
}

function formatMonth(date) {
  return date.toLocaleDateString("it-IT", {
    month: "long",
    year: "numeric"
  });
}

function formatFullDate(dateKey) {
  return new Date(dateKey + "T00:00:00").toLocaleDateString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

function buildMonthDays(baseDate) {
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const days = [];

  const firstWeekDay = firstDay.getDay() === 0 ? 7 : firstDay.getDay();
  const leadingEmptyDays = firstWeekDay - 1;

  for (let i = 0; i < leadingEmptyDays; i++) {
    days.push(null);
  }

  for (let day = 1; day <= lastDay.getDate(); day++) {
    days.push(new Date(year, month, day));
  }

  return days;
}

function DayIndicators({
  hasMeals,
  hasWorkouts,
  hasWeight,
  hasWater
}) {
  return (
    <div className="calendar-indicators">
	  {hasWater && <span className="indicator water" />}
      {hasMeals && <span className="indicator meals" />}
      {hasWorkouts && <span className="indicator workouts" />}
      {hasWeight && <span className="indicator weight" />}
    </div>
  );
}

function SummaryBox({ icon, label, value }) {
  return (
    <div className="calendar-summary-box">
      <div className="calendar-summary-icon">{icon}</div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default function CalendarView({
  meals,
  workouts,
  weightLog,
  waterLog,
  onGoTab,
  onCopyMealsFromDate
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(todayKey());
  const isPastDay = selectedDate < todayKey();

  const monthDays = useMemo(
    () => buildMonthDays(currentMonth),
    [currentMonth]
  );

  const selectedMeals = meals
    .filter((meal) => meal.date === selectedDate)
    .sort((a, b) => a.time.localeCompare(b.time));

  const selectedWorkouts = workouts
    .filter((workout) => workout.date === selectedDate)
    .sort((a, b) => a.time.localeCompare(b.time));

  const selectedWeight = weightLog.find((entry) => entry.date === selectedDate);

  const dayCalories = selectedMeals.reduce(
    (sum, meal) => sum + num(meal.kcal),
    0
  );

  const dayBurned = selectedWorkouts.reduce(
    (sum, workout) => sum + num(workout.kcal),
    0
  );

  const isSelectedToday = selectedDate === todayKey();

  function goPrevMonth() {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  }

  function goNextMonth() {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  }

  function goToday() {
    const now = new Date();
    setCurrentMonth(now);
    setSelectedDate(todayKey());
  }

  return (
    <>
      <section className="calendar-header card">
        <div>
          <p className="eyebrow">Calendario</p>
          <h2>{formatMonth(currentMonth)}</h2>
        </div>

        <div className="calendar-month-actions">
          <button className="calendar-icon-button" onClick={goPrevMonth}>
            <ChevronLeft size={18} />
          </button>

          <button className="calendar-today-button" onClick={goToday}>
            Oggi
          </button>

          <button className="calendar-icon-button" onClick={goNextMonth}>
            <ChevronRight size={18} />
          </button>
        </div>
      </section>

      <section className="card">
        <div className="calendar-weekdays">
          <span>L</span>
          <span>M</span>
          <span>M</span>
          <span>G</span>
          <span>V</span>
          <span>S</span>
          <span>D</span>
        </div>

        <div className="calendar-grid">
          {monthDays.map((day, index) => {
            if (!day) {
              return <div key={`empty-${index}`} className="calendar-day empty" />;
            }

            const dateKey = toDateKey(day);
            const isToday = dateKey === todayKey();
            const isSelected = dateKey === selectedDate;

            const hasMeals = meals.some((meal) => meal.date === dateKey);
            const hasWorkouts = workouts.some((workout) => workout.date === dateKey);
            const hasWeight = weightLog.some((entry) => entry.date === dateKey);
			const hasWater = waterLog.some(
				(entry) => entry.date === dateKey && num(entry.ml) > 0
			);

            return (
              <button
                key={dateKey}
                className={[
                  "calendar-day",
                  isToday ? "today" : "",
                  isSelected ? "selected" : ""
                ].join(" ")}
                onClick={() => setSelectedDate(dateKey)}
              >
                <span>{day.getDate()}</span>

                <DayIndicators
				  hasMeals={hasMeals}
				  hasWorkouts={hasWorkouts}
				  hasWeight={hasWeight}
				  hasWater={hasWater}
				/>
              </button>
            );
          })}
        </div>

        <div className="calendar-legend">
          <span><i className="indicator meals" /> Pasti</span>
          <span><i className="indicator workouts" /> Sport</span>
          <span><i className="indicator weight" /> Peso</span>
		  <span><i className="indicator water" /> Acqua</span>
        </div>
      </section>

      <section className="card">
        <div className="section-title-row">
          <div>
            <p className="eyebrow">Giorno selezionato</p>
            <h3>{formatFullDate(selectedDate)}</h3>
          </div>

          <CalendarDays size={22} className="success-color" />
        </div>

        <div className="calendar-summary-grid">
          <SummaryBox
            icon={<UtensilsCrossed size={18} />}
            label="Assunte"
            value={`${Math.round(dayCalories)} kcal`}
          />

          <SummaryBox
            icon={<Dumbbell size={18} />}
            label="Bruciate"
            value={`${Math.round(dayBurned)} kcal`}
          />

          <SummaryBox
            icon={<Scale size={18} />}
            label="Peso"
            value={selectedWeight ? `${selectedWeight.weight} kg` : "-"}
          />
        </div>

        {isSelectedToday ? (
		  <div className="calendar-day-actions">
			<button onClick={() => onGoTab("pasti")}>
			  <Plus size={17} />
			  Aggiungi pasto
			</button>

			<button className="secondary" onClick={() => onGoTab("allenamenti")}>
			  <Plus size={17} />
			  Aggiungi sport
			</button>

			<button className="secondary" onClick={() => onGoTab("obiettivi")}>
			  <Scale size={17} />
			  Registra peso
			</button>
		  </div>
		) : (
		  <>
			{isPastDay && selectedMeals.length > 0 && (
			  <div className="calendar-day-actions single-action">
				<button onClick={() => onCopyMealsFromDate(selectedDate)}>
				  <ClipboardList size={17} />
				  Copia pasti su oggi
				</button>
			  </div>
			)}

			<div className="calendar-note">
			  Gli inserimenti manuali vengono registrati su oggi. Puoi copiare i pasti di questo giorno su oggi se sono presenti pasti registrati.
			</div>
		  </>
		)}
		
      </section>

      <section className="card">
        <div className="section-title-row">
          <div>
            <p className="eyebrow">Diario</p>
            <h3>Pasti</h3>
          </div>
        </div>

        {selectedMeals.length === 0 ? (
          <p className="empty">Nessun pasto registrato in questo giorno.</p>
        ) : (
          selectedMeals.map((meal) => (
            <div className="calendar-list-row" key={meal.id}>
              <div className="calendar-list-icon meals-bg">
                <UtensilsCrossed size={18} />
              </div>

              <div>
                <strong>{meal.name}</strong>
                <p>
                  {meal.time} · C {Math.round(num(meal.carbs))}g · P{" "}
                  {Math.round(num(meal.protein))}g · G{" "}
                  {Math.round(num(meal.fat))}g
                </p>
              </div>

              <span>{Math.round(num(meal.kcal))} kcal</span>
            </div>
          ))
        )}
      </section>

      <section className="card">
        <div className="section-title-row">
          <div>
            <p className="eyebrow">Attività</p>
            <h3>Sport</h3>
          </div>
        </div>

        {selectedWorkouts.length === 0 ? (
          <p className="empty">Nessun allenamento registrato in questo giorno.</p>
        ) : (
          selectedWorkouts.map((workout) => (
            <div className="calendar-list-row" key={workout.id}>
              <div className="calendar-list-icon workouts-bg">
                <Dumbbell size={18} />
              </div>

              <div>
                <strong>{workout.name}</strong>
                <p>
                  {workout.time} · {workout.duration} min
                </p>
              </div>

              <span>-{Math.round(num(workout.kcal))} kcal</span>
            </div>
          ))
        )}
      </section>

      <section className="card">
        <div className="section-title-row">
          <div>
            <p className="eyebrow">Peso</p>
            <h3>Registrazione peso</h3>
          </div>
        </div>

        {selectedWeight ? (
          <div className="calendar-weight-box">
            <Scale size={20} />
            <strong>{selectedWeight.weight} kg</strong>
          </div>
        ) : (
          <p className="empty">Nessun peso registrato in questo giorno.</p>
        )}
      </section>
    </>
  );
}