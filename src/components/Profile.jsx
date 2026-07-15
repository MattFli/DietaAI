import React from "react";
import {
  Cloud,
  CloudOff,
  Download,
  Upload,
  LogOut,
  LogIn,
  RotateCcw,
  ShieldCheck,
  Database,
  UserCircle,
  Sun,
  Moon,
  Monitor
} from "lucide-react";

export default function Profile({
  user,
  syncStatus,
  theme,
  onThemeChange,
  onLogin,
  onLogout,
  onUploadLocal,
  onExport,
  onImport,
  onReset
}) {
  const isCloudActive = Boolean(user);

  return (
    <>
      <section className="profile-hero card">
        <div className="profile-avatar">
          <UserCircle size={42} />
        </div>

        <div className="profile-main">
          <p className="eyebrow">Profilo</p>

          <h2>
            {user ? user.displayName || "Account Google" : "Modalità locale"}
          </h2>

          <p className="profile-email">
            {user
              ? user.email
              : "Nessun account collegato. I dati sono salvati localmente."}
          </p>

          <div className={isCloudActive ? "sync-pill success" : "sync-pill local"}>
            {isCloudActive ? <Cloud size={15} /> : <CloudOff size={15} />}
            <span>
              {syncStatus || (isCloudActive ? "Cloud attivo" : "Solo locale")}
            </span>
          </div>
        </div>
      </section>

      <section className="card profile-section">
        <h3>Account</h3>

        {user ? (
          <>
            <p className="hint">
              Sei connesso con account Google. I dati vengono salvati localmente
              e sincronizzati su cloud.
            </p>

            <button className="profile-action danger-btn" onClick={onLogout}>
              <LogOut size={18} />
              Esci dall'account
            </button>
          </>
        ) : (
          <>
            <p className="hint">
              Accedi con Google per sincronizzare i dati tra telefono, PC e altri
              dispositivi.
            </p>

            <button className="profile-action" onClick={onLogin}>
              <LogIn size={18} />
              Accedi con Google
            </button>
          </>
        )}
      </section>

      <section className="card profile-section">
        <h3>Sincronizzazione cloud</h3>

        <div className="settings-row">
          <div>
            <strong>Stato</strong>
            <p>{syncStatus || "Non disponibile"}</p>
          </div>

          {isCloudActive ? (
            <Cloud size={22} className="settings-icon success-color" />
          ) : (
            <CloudOff size={22} className="settings-icon muted-color" />
          )}
        </div>

        <button
			className={user ? "profile-action secondary" : "profile-action disabled-action"}
			onClick={onUploadLocal}
			disabled={!user}
		>
		<Database size={18} />
		{user
			? "Carica dati locali nel cloud"
			: "Accedi per abilitare il cloud"}
		</button>

        {!user && (
          <p className="hint small-hint">
            Devi accedere con Google per usare la sincronizzazione cloud.
          </p>
        )}
      </section>

      <section className="card profile-section">
        <h3>Backup dati</h3>

        <p className="hint">
          Puoi esportare un backup JSON dei dati o importare un backup precedente.
        </p>
		<div className="profile-actions-grid">
			<button
				className="profile-action backup-action"
				onClick={onExport}
				>
				<Download size={18} />
				Esporta backup
			</button>

			<button
				type="button"
				className="profile-action backup-action"
				onClick={() =>
				document.getElementById("import-backup-file").click()
				}
				>
				<Upload size={18} />
				Importa backup
			</button>

			<input
			id="import-backup-file"
			hidden
			type="file"
			accept="application/json"
			onChange={onImport}
			/>
			
		</div>
      </section>

	<section className="card profile-section">
		<h3>Tema</h3>

		<p className="hint">
			Scegli l'aspetto dell'app. La modalità automatica segue il tema del dispositivo.
		</p>

		<div className="theme-choice-grid">
			<button
				type="button"
				className={theme === 'light' ? 'theme-option active' : 'theme-option'}
				onClick={() => onThemeChange('light')}
			>
				<Sun size={18} />
				<span>Chiaro</span>
			</button>

			<button
				type="button"
				className={theme === 'dark' ? 'theme-option active' : 'theme-option'}
				onClick={() => onThemeChange('dark')}
			>
				<Moon size={18} />
				<span>Scuro</span>
			</button>

			<button
				type="button"
				className={theme === 'auto' ? 'theme-option active' : 'theme-option'}
				onClick={() => onThemeChange('auto')}
			>
				<Monitor size={18} />
				<span>Auto</span>
			</button>
		</div>
	</section>

      <section className="card profile-section">
        <h3>Privacy e sicurezza</h3>

        <div className="settings-row">
          <div>
            <strong>Dati personali</strong>
            <p>
              I dati sono salvati nel browser e, se accedi, nel tuo spazio cloud
              Firebase associato al tuo account.
            </p>
          </div>

          <ShieldCheck size={22} className="settings-icon success-color" />
        </div>
      </section>

      <section className="card profile-section danger-zone">
        <h3>Dati app</h3>

        <p className="hint">
          Questa azione cancella i dati locali presenti su questo dispositivo.
          Usa il backup prima di procedere.
        </p>

        <button className="profile-action danger-btn" onClick={onReset}>
          <RotateCcw size={18} />
          Reset dati locali
        </button>
      </section>
    </>
  );
}