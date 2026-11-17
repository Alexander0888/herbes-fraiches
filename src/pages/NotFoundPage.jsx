import { useEffect } from 'react';
import { Link, useOutletContext } from 'react-router';
import { AppHeader } from '../app/AppHeader.jsx';
import { AppFooter } from '../app/AppFooter.jsx';
import { fr, pageTitle } from '../content/fr.js';

export function NotFoundPage() {
  const account = useOutletContext();
  useEffect(() => { document.title = pageTitle(fr.notFoundTitle); }, []);
  return (
    <>
      <AppHeader {...account} />
      <main className="page-width main" id="main-content" tabIndex={-1}>
        <section className="card empty-state">
          <h1>{fr.notFoundTitle}</h1>
          <p className="secondary">{fr.notFoundDescription}</p>
          <Link className="button recovery-link" to="/">{fr.backHome}</Link>
        </section>
      </main>
    </>
  );
}

export function RouteErrorPage() {
  useEffect(() => { document.title = pageTitle(fr.pageErrorTitle); }, []);

  return (
    <>
      <AppHeader />
      <main className="page-width main">
        <section className="card empty-state" role="alert">
          <h1>{fr.pageErrorTitle}</h1>
          <p className="secondary">{fr.pageErrorDescription}</p>
          <button className="button recovery-link" onClick={() => window.location.reload()}>{fr.retry}</button>
        </section>
      </main>
      <AppFooter />
    </>
  );
}
