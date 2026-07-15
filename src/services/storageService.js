const STORAGE_KEY = 'dieta-ai-locale-v1';

export const defaultState = {
  meals: [],
  favoriteMeals: [],
  workouts: [],
  weightLog: [],
  waterLog: [],
  preferences: {
	waterGoalMl: 2000,
	theme: 'auto'
  },

  goals: {
    startWeight: '',
    currentWeight: '',
    targetWeight: '',
    targetDate: '',
    dailyKcal: 2000,
    carbsGoal: 250,
    proteinGoal: 120,
    fatGoal: 65
  },
  mealPlan: {
    pdfName: '',
    dailyKcalTarget: '',
    notes: '',
    meals: []
  }
};

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    return { ...defaultState, ...JSON.parse(raw) };
  } catch {
    return defaultState;
  }
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function exportBackup(state) {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `dieta-ai-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importBackup(file) {
  const text = await file.text();
  const parsed = JSON.parse(text);
  return { ...defaultState, ...parsed };
}
