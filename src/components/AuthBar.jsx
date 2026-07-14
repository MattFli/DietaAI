import React from "react";
import { Cloud, CloudOff, LogIn, LogOut } from "lucide-react";

export default function AuthBar({
  user,
  syncStatus,
  onLogin,
  onLogout,
  onUploadLocal
}) {
  return (
    <div className="auth-bar">
      {user ? (
        <>
          <div className="auth-user">
            <div className="local-icon">
              <Cloud size={20} />
            </div>

            <div>
              <strong>{user.displayName || "Account Google"}</strong>
              <p>{syncStatus || "Cloud attivo"}</p>
            </div>
          </div>

          <div className="auth-actions">
            <button className="small secondary" onClick={onUploadLocal}>
              Carica dati locali
            </button>

            <button className="small danger-btn" onClick={onLogout}>
              <LogOut size={14} />
              Esci
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="auth-user">
            <div className="local-icon">
              <CloudOff size={20} />
            </div>

            <div>
              <strong>Modalità locale</strong>
              <p>I dati sono salvati solo su questo dispositivo</p>
            </div>
          </div>

          <button className="small" onClick={onLogin}>
            <LogIn size={14} />
            Accedi con Google
          </button>
        </>
      )}
    </div>
  );
}