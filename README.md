# Dieta AI - PWA locale

Questa è una prima versione locale della web app per dieta, pasti, allenamenti, obiettivi e piano alimentare.

## Funzioni incluse fino alla fase 5

- Dashboard giornaliera con calorie assunte, bruciate e macronutrienti.
- Inserimento pasti manuale.
- Possibilità di selezionare/scattare foto del piatto come riferimento, senza analisi AI.
- Registrazione allenamenti con stima calorie tramite MET.
- Obiettivi peso e macronutrienti.
- Storico peso con grafico.
- Caricamento PDF piano alimentare come riferimento.
- Inserimento manuale dei pasti previsti nel piano.
- Possibilità di segnare un pasto del piano come mangiato oggi.
- Salvataggio locale su localStorage.
- Backup esportabile/importabile in JSON.
- Manifest PWA per installazione su iPhone da Safari dopo pubblicazione HTTPS.

## Avvio locale

1. Installa Node.js.
2. Apri il terminale nella cartella del progetto.
3. Esegui:

```bash
npm install
npm run dev
```

Apri l'indirizzo mostrato da Vite, di solito:

```text
http://localhost:5173
```

## Test da iPhone sulla stessa rete Wi-Fi

Esegui:

```bash
npm run dev
```

Poi apri da iPhone l'indirizzo IP del PC indicato da Vite, ad esempio:

```text
http://192.168.1.50:5173
```

Nota: per installarla come PWA sulla Home di iPhone serve normalmente pubblicarla su HTTPS.

## Build di produzione

```bash
npm run build
npm run preview
```

## Pubblicazione consigliata

Per usarla davvero da iPhone come app installabile, pubblica la cartella/progetto su Vercel, Netlify o altro hosting HTTPS.

## Nota AI

Questa versione è volutamente 100% locale e non contiene chiamate API AI né chiavi nel frontend. La parte AI dovrà essere aggiunta in una seconda fase tramite backend/serverless sicuro.
