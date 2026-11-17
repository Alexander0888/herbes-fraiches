import { Leaf, LogIn, LogOut } from 'lucide-react';
import { Link } from 'react-router';
import { fr } from '../content/fr.js';

export function AppHeader({ children, signIn, signOut, pending = false }) {
  return (
    <header className="site-header">
      <div className="page-width header-inner">
        <Link className="brand" to="/" aria-label={`${fr.department} · ${fr.home}`}>
          <span className="brand-icon" aria-hidden="true"><Leaf size={18} strokeWidth={1.5} /></span>
          <span className="brand-label"><strong>{fr.appName}</strong><span>{fr.appDepartment}</span></span>
        </Link>
        <div className="header-actions">
          {children}
          {signIn && (
            <button type="button" className="button sign-in" onClick={signIn} disabled={pending}>
              <LogIn aria-hidden="true" />{fr.signIn}
            </button>
          )}
          {signOut && (
            <button type="button" className="button sign-out" aria-label={fr.signOut}
              title={fr.signOut} onClick={signOut} disabled={pending}>
              <LogOut aria-hidden="true" /><span>{fr.signOut}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
