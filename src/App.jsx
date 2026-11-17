import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';
import { AppFooter } from './app/AppFooter.jsx';
import { AccessScreen, SharedAccess } from './services/SharedAccess.jsx';
import { incompleteSupabaseConfig, supabase } from './services/supabase.js';
import { fr } from './content/fr.js';

export default function App() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    document.getElementById('main-content')?.focus({ preventScroll: true });
  }, [pathname]);

  if (incompleteSupabaseConfig) {
    return (
      <>
        <AccessScreen><p role="alert">{fr.incompleteConfig}</p></AccessScreen>
        <AppFooter />
      </>
    );
  }

  return (
    <>
      <a className="skip-link" href="#main-content" onClick={(event) => {
        event.preventDefault();
        document.getElementById('main-content')?.focus();
      }}>{fr.skipToContent}</a>
      {supabase ? (
        <SharedAccess client={supabase}>
          {(account) => <Outlet context={account} />}
        </SharedAccess>
      ) : <Outlet context={{ workspaceKey: 'local', canEdit: true }} />}
      <AppFooter />
    </>
  );
}
