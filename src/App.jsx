import React, { useState, useEffect } from 'react';
import {
  Home,
  UtensilsCrossed,
  Dumbbell,
  Target,
  FileText,
  Download,
  Upload,
  RotateCcw
} from 'lucide-react';

import {
  loadState,
  saveState,
  exportBackup,
  importBackup,
  defaultState
} from './services/storageService.js';

import Dashboard from './components/Dashboard.jsx';
import Meals from './components/Meals.jsx';
import Workouts from './components/Workouts.jsx';
import Goals from './components/Goals.jsx';
import MealPlan from './components/MealPlan.jsx';
import AuthBar from './components/AuthBar.jsx';

import {
  loginWithGoogle,
  logout,
  listenAuthState,
  loadCloudState,
  saveCloudState,
  getGoogleRedirectResult
} from './services/firebaseService.js';

export function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function nowTime() {
  return new Date().toTimeString().slice(0, 5);
}

export function num(v, d = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
}

const tabs = [
  { id: 'oggi', label: 'Oggi', icon: Home },
  { id: 'pasti', label: 'Pasti', icon: UtensilsCrossed },
  { id: 'allenamenti', label: 'Sport', icon: Dumbbell },
  { id: 'obiettivi', label: 'Obiettivi', icon: Target },
  { id: 'piano', label: 'Piano', icon: FileText }
];

export default function App() {
  const [state, setState] = useState(loadState);
  const [tab, setTab] = useState('oggi');
  const [notice, setNotice] = useState('');

  const [user, setUser] = useState(null);
  const [syncStatus, setSyncStatus] = useState('Modalità locale');
  const [cloudLoaded, setCloudLoaded] = useState(false);

  useEffect(() => {
    getGoogleRedirectResult()
      .then(async (result) => {
        if (result && result.user) {
          setUser(result.user);
          setSyncStatus('Accesso Google completato');

          try {
            const cloudState = await loadCloudState(result.user.uid);

            if (cloudState) {
              setState({ ...defaultState, ...cloudState });
              setSyncStatus('Dati caricati dal cloud');
            } else {
              setSyncStatus('Cloud pronto - nessun dato precedente');
            }

            setCloudLoaded(true);
          } catch (error) {
            console.error('Errore caricamento cloud dopo redirect:', error);
            setSyncStatus('Errore caricamento cloud');
            setCloudLoaded(true);
          }
        }
      })
      .catch((error) => {
        console.error('Errore redirect Google:', error);
        setSyncStatus('Errore login Google');
      });
  }, []);

  useEffect(() => {
    const unsubscribe = listenAuthState(async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        setSyncStatus('Caricamento dati cloud...');

        try {
          const cloudState = await loadCloudState(firebaseUser.uid);

          if (cloudState) {
            setState({ ...defaultState, ...cloudState });
            setSyncStatus('Dati caricati dal cloud');
          } else {
            setSyncStatus('Cloud pronto - nessun dato precedente');
          }

          setCloudLoaded(true);
        } catch (error) {
          console.error('Errore caricamento cloud:', error);
          setSyncStatus('Errore caricamento cloud');
          setCloudLoaded(true);
        }
      } else {
        setSyncStatus('Modalità locale');
        setCloudLoaded(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    saveState(state);

    if (!user || !cloudLoaded) {
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setSyncStatus('Sincronizzazione...');
        await saveCloudState(user.uid, state);
        setSyncStatus('Cloud sincronizzato');
      } catch (error) {
        console.error('Errore sincronizzazione cloud:', error);
        setSyncStatus('Errore sincronizzazione cloud');
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [state, user, cloudLoaded]);

  const todayMeals = state.meals.filter((m) => m.date === todayKey());
  const todayWorkouts = state.workouts.filter((w) => w.date === todayKey());

  const totals = todayMeals.reduce(
    (acc, m) => ({
      kcal: acc.kcal + num(m.kcal),
      carbs: acc.carbs + num(m.carbs),
      protein: acc.protein + num(m.protein),
      fat: acc.fat + num(m.fat)
    }),
    { kcal: 0, carbs: 0, protein: 0, fat: 0 }
  );

  const burned = todayWorkouts.reduce((a, w) => a + num(w.kcal), 0);

  function addMeal(meal) {
    setState((s) => ({
      ...s,
      meals: [
        ...s.meals,
        {
          id: uid(),
          date: todayKey(),
          time: nowTime(),
          ...meal
        }
      ]
    }));
  }

  function removeMeal(id) {
    setState((s) => ({
      ...s,
      meals: s.meals.filter((m) => m.id !== id)
    }));
  }

  function addWorkout(w) {
    setState((s) => ({
      ...s,
      workouts: [
        ...s.workouts,
        {
          id: uid(),
          date: todayKey(),
          time: nowTime(),
          ...w
        }
      ]
    }));
  }

  function removeWorkout(id) {
    setState((s) => ({
      ...s,
      workouts: s.workouts.filter((w) => w.id !== id)
    }));
  }

  function setGoals(goals) {
    setState((s) => ({
      ...s,
      goals: {
        ...s.goals,
        ...goals
      }
    }));
  }

  function logWeight(weight) {
    setState((s) => {
      const rest = s.weightLog.filter((w) => w.date !== todayKey());

      return {
        ...s,
        weightLog: [
          ...rest,
          {
            date: todayKey(),
            weight: num(weight)
          }
        ].sort((a, b) => a.date.localeCompare(b.date)),
        goals: {
          ...s.goals,
          currentWeight: weight
        }
      };
    });
  }

  function updatePlan(plan) {
    setState((s) => ({
      ...s,
      mealPlan: plan
    }));
  }

  function resetAll() {
    if (confirm('Vuoi davvero cancellare tutti i dati salvati in locale?')) {
      setState(defaultState);
    }
  }

  async function handleImport(e) {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const imported = await importBackup(file);
      setState(imported);
      setNotice('Backup importato correttamente.');
    } catch {
      setNotice('Backup non valido o non leggibile.');
    }

    e.target.value = '';
  }

  async function handleLogin() {
  try {
    setSyncStatus('Accesso Google...');
    await loginWithGoogle();
  } catch (error) {
    console.error('Errore login Google:', error);
    setSyncStatus('Accesso annullato o non riuscito');
  }
}


  async function handleLogout() {
    try {
      await logout();
      setUser(null);
      setCloudLoaded(false);
      setSyncStatus('Modalità locale');
    } catch (error) {
      console.error('Errore logout:', error);
      setSyncStatus('Errore logout');
    }
  }

  async function uploadLocalToCloud() {
    if (!user) {
      return;
    }

    if (!confirm('Vuoi caricare i dati locali attuali nel tuo account Google?')) {
      return;
    }

    try {
      setSyncStatus('Caricamento dati locali nel cloud...');
      await saveCloudState(user.uid, state);
      setSyncStatus('Dati locali caricati nel cloud');
    } catch (error) {
      console.error('Errore caricamento dati locali:', error);
      setSyncStatus('Errore caricamento dati locali');
    }
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Web app locale + cloud</p>
          <h1>Dieta AI</h1>
        </div>

        <div className="header-actions">
          <button
            className="icon-btn"
            onClick={() => exportBackup(state)}
            title="Esporta backup"
          >
            <Download size={18} />
          </button>

          <label className="icon-btn" title="Importa backup">
            <Upload size={18} />
            <input
              hidden
              type="file"
              accept="application/json"
              onChange={handleImport}
            />
          </label>

          <button
            className="icon-btn danger"
            onClick={resetAll}
            title="Reset dati"
          >
            <RotateCcw size={18} />
          </button>
        </div>
      </header>

      <AuthBar
        user={user}
        syncStatus={syncStatus}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onUploadLocal={uploadLocalToCloud}
      />

      {notice && (
        <div className="notice" onClick={() => setNotice('')}>
          {notice}
        </div>
      )}

      <main className="content">
        {tab === 'oggi' && (
          <Dashboard
            state={state}
            totals={totals}
            burned={burned}
            todayMeals={todayMeals}
            todayWorkouts={todayWorkouts}
            onGoTab={setTab}
            onWeight={logWeight}
          />
        )}

        {tab === 'pasti' && (
          <Meals
            meals={state.meals}
            onAdd={addMeal}
            onRemove={removeMeal}
          />
        )}

        {tab === 'allenamenti' && (
          <Workouts
            workouts={state.workouts}
            weight={num(state.goals.currentWeight, 70)}
            onAdd={addWorkout}
            onRemove={removeWorkout}
          />
        )}

        {tab === 'obiettivi' && (
          <Goals
            goals={state.goals}
            weightLog={state.weightLog}
            setGoals={setGoals}
            logWeight={logWeight}
          />
        )}

        {tab === 'piano' && (
          <MealPlan
            mealPlan={state.mealPlan}
            updatePlan={updatePlan}
            onLogMeal={addMeal}
          />
        )}
      </main>

      <nav className="bottom-nav">
        {tabs.map((t) => {
          const Icon = t.icon;

          return (
            <button
              key={t.id}
              className={tab === t.id ? 'active' : ''}
              onClick={() => setTab(t.id)}
            >
              <Icon size={20} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}