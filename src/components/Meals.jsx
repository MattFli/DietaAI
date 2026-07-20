import React, { useState } from 'react';
import {
  Trash2,
  Star,
  Plus,
  Clock3,
  ChevronDown,
  ChevronUp,
  ChefHat,
  Save
} from 'lucide-react';
import { num } from '../App.jsx';


function fmtDate(d) { return new Date(d + 'T00:00:00').toLocaleDateString('it-IT', { weekday:'short', day:'numeric', month:'short' }); }
const emptyForm = { name:'', kcal:'', carbs:'', protein:'', fat:'' };

export default function Meals({
  meals,
  favoriteMeals,
  recipes,
  onAdd,
  onRemove,
  onAddFavorite,
  onRemoveFavorite,
  onAddFromFavorite,
  onAddRecipe,
  onRemoveRecipe,
  onAddFromRecipe
}) {
  const [form, setForm] = useState(emptyForm);
  const [photoName, setPhotoName] = useState('');
  const [showRecentMeals, setShowRecentMeals] = useState(false);
  const [showRecipes, setShowRecipes] = useState(false);
	const [recipeForm, setRecipeForm] = useState({
	  name: '',
	  description: '',
	  kcal: '',
	  carbs: '',
	  protein: '',
	  fat: '',
	  servings: 1
	});
  const sorted = [...meals].sort((a,b)=>(b.date+b.time).localeCompare(a.date+a.time));
  const grouped = sorted.reduce((acc,m)=>{(acc[m.date]=acc[m.date]||[]).push(m);return acc;},{});
  const recentMeals = sorted.reduce((acc, meal) => {
  const key = meal.name.toLowerCase().trim();

  const alreadyAdded = acc.some((item) => item.key === key);

  if (!alreadyAdded) {
		acc.push({
		key,
		name: meal.name,
		kcal: num(meal.kcal),
		carbs: num(meal.carbs),
		protein: num(meal.protein),
		fat: num(meal.fat)
		});
	}

	return acc;
  }, []).slice(0, 6);
  function save() {
    if (!form.name.trim()) return;
    onAdd({ name: form.name, kcal:num(form.kcal), carbs:num(form.carbs), protein:num(form.protein), fat:num(form.fat), source: photoName ? 'manuale-da-foto' : 'manuale' });
    setForm(emptyForm); setPhotoName('');
  }
  
  function saveRecipe() {
	  if (!recipeForm.name.trim()) {
		return;
	  }

	  onAddRecipe({
		name: recipeForm.name,
		description: recipeForm.description,
		kcal: num(recipeForm.kcal),
		carbs: num(recipeForm.carbs),
		protein: num(recipeForm.protein),
		fat: num(recipeForm.fat),
		servings: num(recipeForm.servings, 1)
	  });

	  setRecipeForm({
		name: '',
		description: '',
		kcal: '',
		carbs: '',
		protein: '',
		fat: '',
		servings: 1
	  });
	}
  
  return <>
	<section className="card">
      <div className="section-title-row">
        <div>
          <p className="eyebrow">Preferiti</p>
          <h2>Pasti preferiti</h2>
        </div>
        <Star size={20} className="success-color" />
      </div>

      {favoriteMeals.length === 0 ? (
        <p className="empty">
          Nessun pasto preferito. Puoi salvare un pasto dal diario usando il pulsante stella.
        </p>
      ) : (
        <div className="favorite-meals-list">
          {favoriteMeals.map((favorite) => (
            <div className="favorite-meal-card" key={favorite.id}>
              <div>
                <strong>{favorite.name}</strong>
                <p>
                  {Math.round(num(favorite.kcal))} kcal · C{' '}
                  {Math.round(num(favorite.carbs))}g · P{' '}
                  {Math.round(num(favorite.protein))}g · G{' '}
                  {Math.round(num(favorite.fat))}g
                </p>
              </div>

              <div className="favorite-meal-actions">
                <button
                  className="small"
                  onClick={() => onAddFromFavorite(favorite)}
                  title="Aggiungi a oggi"
                >
                  <Plus size={15} />
                </button>

                <button
                  className="ghost danger"
                  onClick={() => onRemoveFavorite(favorite.id)}
                  title="Rimuovi dai preferiti"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
	<section className="card">
		<div className="section-title-row">
		<div>
			<p className="eyebrow">Recenti</p>
			<h2>Pasti recenti</h2>
		</div>

		<button
			className="mini-link-button"
			onClick={() => setShowRecentMeals(!showRecentMeals)}
		>
		{showRecentMeals ? (
			<>
			Nascondi
			<ChevronUp size={15} />
			</>
			) : (
			<>
			Mostra
			<ChevronDown size={15} />
			</>
		)}
		</button>
		</div>

	{!showRecentMeals && (
		<p className="hint recent-collapsed-hint">
			Mostra gli ultimi pasti usati per aggiungerli velocemente a oggi.
		</p>
	)}

	{showRecentMeals && (
		<>
		{recentMeals.length === 0 ? (
			<p className="empty">
				Nessun pasto recente disponibile. I pasti compariranno qui dopo averli registrati.
			</p>
		) : (
			<div className="recent-meals-list">
			{recentMeals.map((meal) => (
				<div className="recent-meal-card" key={meal.key}>
				<div>
                <strong>{meal.name}</strong>
                <p>
                  {Math.round(num(meal.kcal))} kcal · C{' '}
                  {Math.round(num(meal.carbs))}g · P{' '}
                  {Math.round(num(meal.protein))}g · G{' '}
                  {Math.round(num(meal.fat))}g
                </p>
              </div>

              <button
                className="small"
                onClick={() =>
                  onAdd({
                    name: meal.name,
                    kcal: num(meal.kcal),
                    carbs: num(meal.carbs),
                    protein: num(meal.protein),
                    fat: num(meal.fat),
                    source: 'recente'
                  })
                }
                title="Aggiungi a oggi"
              >
                <Plus size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  )}
</section>

<section className="card">
  <div className="section-title-row">
    <div>
      <p className="eyebrow">Ricette</p>
      <h2>Ricette personali</h2>
    </div>

    <button
      className="mini-link-button"
      onClick={() => setShowRecipes(!showRecipes)}
    >
      {showRecipes ? (
        <>
          Nascondi
          <ChevronUp size={15} />
        </>
      ) : (
        <>
          Mostra
          <ChevronDown size={15} />
        </>
      )}
    </button>
  </div>

  {!showRecipes && (
    <p className="hint recent-collapsed-hint">
      Salva preparazioni ricorrenti e aggiungile velocemente ai pasti di oggi.
    </p>
  )}

  {showRecipes && (
    <>
      <div className="recipe-form-box">
        <div className="section-title-row">
          <div>
            <p className="eyebrow">Nuova ricetta</p>
            <h3>Aggiungi ricetta</h3>
          </div>

          <ChefHat size={20} className="success-color" />
        </div>

        <div className="grid2">
          <input
            placeholder="Nome ricetta"
            value={recipeForm.name}
            onChange={(e) =>
              setRecipeForm({ ...recipeForm, name: e.target.value })
            }
          />

          <input
            type="number"
            placeholder="Porzioni"
            value={recipeForm.servings}
            onChange={(e) =>
              setRecipeForm({ ...recipeForm, servings: e.target.value })
            }
          />

          <textarea
            placeholder="Descrizione o ingredienti"
            value={recipeForm.description}
            onChange={(e) =>
              setRecipeForm({ ...recipeForm, description: e.target.value })
            }
          />

          <input
            type="number"
            placeholder="Kcal per porzione"
            value={recipeForm.kcal}
            onChange={(e) =>
              setRecipeForm({ ...recipeForm, kcal: e.target.value })
            }
          />

          <input
            type="number"
            placeholder="Carboidrati g"
            value={recipeForm.carbs}
            onChange={(e) =>
              setRecipeForm({ ...recipeForm, carbs: e.target.value })
            }
          />

          <input
            type="number"
            placeholder="Proteine g"
            value={recipeForm.protein}
            onChange={(e) =>
              setRecipeForm({ ...recipeForm, protein: e.target.value })
            }
          />

          <input
            type="number"
            placeholder="Grassi g"
            value={recipeForm.fat}
            onChange={(e) =>
              setRecipeForm({ ...recipeForm, fat: e.target.value })
            }
          />
        </div>

        <button className="profile-action" onClick={saveRecipe}>
          <Save size={18} />
          Salva ricetta
        </button>
      </div>

      {recipes.length === 0 ? (
        <p className="empty">
          Nessuna ricetta salvata. Crea la tua prima ricetta personale.
        </p>
      ) : (
        <div className="recipes-list">
          {recipes.map((recipe) => (
            <div className="recipe-card" key={recipe.id}>
              <div>
                <strong>{recipe.name}</strong>

                {recipe.description && (
                  <p className="recipe-description">
                    {recipe.description}
                  </p>
                )}

                <p>
                  {Math.round(num(recipe.kcal))} kcal · C{" "}
                  {Math.round(num(recipe.carbs))}g · P{" "}
                  {Math.round(num(recipe.protein))}g · G{" "}
                  {Math.round(num(recipe.fat))}g
                </p>
              </div>

              <div className="recipe-actions">
                <button
                  className="small"
                  onClick={() => onAddFromRecipe(recipe)}
                  title="Aggiungi a oggi"
                >
                  <Plus size={15} />
                </button>

                <button
                  className="ghost danger"
                  onClick={() => onRemoveRecipe(recipe.id)}
                  title="Elimina ricetta"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )}
</section>

    <section className="card"><h2>Registra un pasto</h2><p className="hint">Versione locale: la foto può essere allegata come riferimento, ma i valori vanno inseriti manualmente. L'AI verrà aggiunta in una fase successiva con backend sicuro.</p>
      <div className="grid2"><input placeholder="Nome pasto" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/><input type="number" placeholder="Kcal" value={form.kcal} onChange={e=>setForm({...form,kcal:e.target.value})}/><input type="number" placeholder="Carboidrati g" value={form.carbs} onChange={e=>setForm({...form,carbs:e.target.value})}/><input type="number" placeholder="Proteine g" value={form.protein} onChange={e=>setForm({...form,protein:e.target.value})}/><input type="number" placeholder="Grassi g" value={form.fat} onChange={e=>setForm({...form,fat:e.target.value})}/><label className="file-btn">Foto piatto<input hidden type="file" accept="image/*" capture="environment" onChange={e=>setPhotoName(e.target.files?.[0]?.name || '')}/></label></div>
      {photoName && <p className="hint">Foto selezionata: {photoName}</p>}<button onClick={save}>Salva pasto</button></section>
    <section className="card"><h2>Diario pasti</h2>{Object.keys(grouped).length===0 && <p className="empty">Nessun pasto registrato ancora.</p>}{Object.entries(grouped).map(([date,items]) => <div key={date} className="group"><h3>{fmtDate(date)}</h3>{items.map(m => <div className="row" key={m.id}><div><b>{m.name}</b><p>{m.time} · C {Math.round(num(m.carbs))}g · P {Math.round(num(m.protein))}g · G {Math.round(num(m.fat))}g</p></div><strong>{Math.round(num(m.kcal))} kcal</strong>
	<button
		className={
		favoriteMeals.some(
		(favorite) =>
			favorite.name.toLowerCase().trim() === m.name.toLowerCase().trim()
		)
			? "ghost favorite-star active"
			: "ghost favorite-star"
		}
		onClick={() => onAddFavorite(m)}
		title={
		favoriteMeals.some(
		(favorite) =>
			favorite.name.toLowerCase().trim() === m.name.toLowerCase().trim()
		)
			? "Già nei preferiti"
			: "Aggiungi ai preferiti"
		}
	>
		<Star size={16} />
	</button>

	<button
		className="ghost danger"
		onClick={() => onRemove(m.id)}
		title="Elimina pasto"
	>
		<Trash2 size={16} />
	</button>
</div>)}</div>)}</section>
  </>;
}
