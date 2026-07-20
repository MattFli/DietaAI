import React, { useState, useEffect } from 'react';
import {
  Home,
  CalendarDays,
  Target,
  FileText,
  UserCircle
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
import Profile from './components/Profile.jsx';
import CalendarView from './components/CalendarView.jsx';

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
  { id: 'calendario', label: 'Calendario', icon: CalendarDays },
  { id: 'obiettivi', label: 'Progressi', icon: Target },
  { id: 'piano', label: 'Piano', icon: FileText },
  { id: 'profilo', label: 'Profilo', icon: UserCircle }
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
  
  useEffect(() => {
  const selectedTheme = state.preferences?.theme || 'auto';
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  function applyTheme() {
    const shouldUseDark =
      selectedTheme === 'dark' ||
      (selectedTheme === 'auto' && mediaQuery.matches);

    document.documentElement.classList.toggle('theme-dark', shouldUseDark);
    document.documentElement.classList.toggle('theme-light', !shouldUseDark);
    document.documentElement.setAttribute(
      'data-theme',
      shouldUseDark ? 'dark' : 'light'
    );
  }

  applyTheme();

  if (selectedTheme === 'auto') {
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', applyTheme);

      return () => {
        mediaQuery.removeEventListener('change', applyTheme);
      };
    }

    mediaQuery.addListener(applyTheme);

    return () => {
      mediaQuery.removeListener(applyTheme);
    };
  }
}, [state.preferences?.theme]);

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
  
  function addFavoriteMeal(meal) {
	const alreadyExists = state.favoriteMeals.some(
    (favorite) =>
      favorite.name.toLowerCase().trim() === meal.name.toLowerCase().trim()
	);

	if (alreadyExists) {
		setNotice('Questo pasto è già presente nei preferiti.');
		return;
	}

	const favoriteMeal = {
		id: uid(),
		name: meal.name,
		kcal: num(meal.kcal),
		carbs: num(meal.carbs),
		protein: num(meal.protein),
		fat: num(meal.fat),
		source: 'preferito'
	};

	setState((s) => ({
		...s,
		favoriteMeals: [...(s.favoriteMeals || []), favoriteMeal]
	}));

	setNotice('Pasto aggiunto ai preferiti.');
	}
	
	function addRecipe(recipe) {
	  const recipeToSave = {
		id: uid(),
		name: recipe.name,
		description: recipe.description || '',
		kcal: num(recipe.kcal),
		carbs: num(recipe.carbs),
		protein: num(recipe.protein),
		fat: num(recipe.fat),
		servings: num(recipe.servings, 1),
		createdAt: new Date().toISOString()
	  };

	  setState((s) => ({
		...s,
		recipes: [...(s.recipes || []), recipeToSave]
	  }));

	  setNotice('Ricetta aggiunta correttamente.');
	}

	function removeRecipe(id) {
	  setState((s) => ({
		...s,
		recipes: (s.recipes || []).filter((recipe) => recipe.id !== id)
	  }));

	  setNotice('Ricetta rimossa.');
	}

	function addMealFromRecipe(recipe) {
	  addMeal({
		name: recipe.name,
		kcal: num(recipe.kcal),
		carbs: num(recipe.carbs),
		protein: num(recipe.protein),
		fat: num(recipe.fat),
		source: 'ricetta'
	  });

	  setNotice('Ricetta aggiunta ai pasti di oggi.');
	}


	function removeFavoriteMeal(id) {
		setState((s) => ({
		...s,
		favoriteMeals: (s.favoriteMeals || []).filter(
		(favorite) => favorite.id !== id
		)
	}));

	setNotice('Pasto rimosso dai preferiti.');
	}

  function addMealFromFavorite(favoriteMeal) {
	addMeal({
		name: favoriteMeal.name,
		kcal: num(favoriteMeal.kcal),
		carbs: num(favoriteMeal.carbs),
		protein: num(favoriteMeal.protein),
		fat: num(favoriteMeal.fat),
		source: 'preferito'
	});

	setNotice('Pasto preferito aggiunto a oggi.');
	}
  
  function copyMealsFromDate(sourceDate) {
	  const targetDate = todayKey();

	  if (!sourceDate) {
		setNotice('Nessuna data selezionata da copiare.');
		return;
	  }

	  if (sourceDate === targetDate) {
		setNotice('Non puoi copiare i pasti di oggi su oggi.');
		return;
	  }

	  const mealsToCopy = state.meals.filter((meal) => meal.date === sourceDate);

	  if (mealsToCopy.length === 0) {
		setNotice('Nessun pasto trovato nel giorno selezionato.');
		return;
	  }

	  const alreadyCopiedFromThisDate = state.meals.filter(
		(meal) =>
		  meal.date === targetDate &&
		  meal.copiedFromDate === sourceDate
	  );

	  let confirmMessage = `Ho trovato ${mealsToCopy.length} pasto/i nel giorno selezionato.\n\nVuoi copiarli su oggi?`;

	  if (alreadyCopiedFromThisDate.length > 0) {
		confirmMessage =
		  `Hai già copiato ${alreadyCopiedFromThisDate.length} pasto/i da questo giorno.\n\nVuoi copiarli di nuovo su oggi?`;
	  }

	  const confirmed = confirm(confirmMessage);

	  if (!confirmed) {
		return;
	  }

	  const copiedMeals = mealsToCopy.map((meal) => ({
		...meal,
		id: uid(),
		date: targetDate,
		time: nowTime(),
		copiedFromDate: sourceDate,
		source: meal.source ? `${meal.source}-copiato` : 'copiato'
	  }));

	  setState((s) => ({
		...s,
		meals: [...s.meals, ...copiedMeals]
	  }));

	  setNotice(`${copiedMeals.length} pasto/i copiato/i su oggi.`);
}

function copyYesterdayMeals() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const year = yesterday.getFullYear();
  const month = String(yesterday.getMonth() + 1).padStart(2, '0');
  const day = String(yesterday.getDate()).padStart(2, '0');
  const yesterdayKey = `${year}-${month}-${day}`;

  copyMealsFromDate(yesterdayKey);
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
  
  function addWater(amountMl) {
  setState((s) => {
    const today = todayKey();
    const currentEntry = (s.waterLog || []).find((entry) => entry.date === today);
    const currentMl = num(currentEntry?.ml);
    const nextMl = Math.max(0, currentMl + amountMl);

    const rest = (s.waterLog || []).filter((entry) => entry.date !== today);

    return {
      ...s,
      waterLog: [
        ...rest,
        {
          date: today,
          ml: nextMl
        }
      ].sort((a, b) => a.date.localeCompare(b.date))
    };
  });
}

function resetTodayWater() {
  setState((s) => {
    const today = todayKey();
    const rest = (s.waterLog || []).filter((entry) => entry.date !== today);

    return {
      ...s,
      waterLog: rest
    };
  });

  setNotice('Acqua di oggi azzerata.');
}

function setWaterGoalMl(value) {
  setState((s) => ({
    ...s,
    preferences: {
      ...(s.preferences || {}),
      waterGoalMl: num(value, 2000)
    }
  }));

  setNotice('Obiettivo acqua aggiornato.');
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
  
  function setThemePreference(theme) {
	setState((s) => ({
		...s,
		preferences: {
		...(s.preferences || {}),
		theme
		}
	}));
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
				<p className="eyebrow">Dieta AI</p>
				<h1>IL MIO PIANO ALIMENTARE</h1>
			</div>

			<div className={user ? "mini-cloud-badge success" : "mini-cloud-badge local"}>
				{user ? "☁️ Cloud" : "📱 Locale"}
			</div>
		</header>


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
				onCopyYesterdayMeals={copyYesterdayMeals}
				onAddWater={addWater}
				onResetWater={resetTodayWater}
				syncStatus={syncStatus}
				isCloudActive={Boolean(user)}
			/>
		)}
		
		{tab === 'calendario' && (
		  <CalendarView
			meals={state.meals}
			workouts={state.workouts}
			weightLog={state.weightLog}
			onGoTab={setTab}
			onCopyMealsFromDate={copyMealsFromDate}
		  />
		)}

        {tab === 'pasti' && (
		  <Meals
			meals={state.meals}
			favoriteMeals={state.favoriteMeals || []}
			recipes={state.recipes || []}
			onAdd={addMeal}
			onRemove={removeMeal}
			onAddFavorite={addFavoriteMeal}
			onRemoveFavorite={removeFavoriteMeal}
			onAddFromFavorite={addMealFromFavorite}
			onAddRecipe={addRecipe}
			onRemoveRecipe={removeRecipe}
			onAddFromRecipe={addMealFromRecipe}
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
			meals={state.meals}
			workouts={state.workouts}
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
		
		{tab === 'profilo' && (
			<Profile
				user={user}
				syncStatus={syncStatus}
				theme={state.preferences?.theme || 'auto'}
				waterGoalMl={state.preferences?.waterGoalMl || 2000}
				onThemeChange={setThemePreference}
				onWaterGoalChange={setWaterGoalMl}
				onLogin={handleLogin}
				onLogout={handleLogout}
				onUploadLocal={uploadLocalToCloud}
				onExport={() => exportBackup(state)}
				onImport={handleImport}
				onReset={resetAll}
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