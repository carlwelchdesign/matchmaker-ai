import Link from "next/link";

export function PublicSplash() {
  return (
    <main className="splash-shell">
      <section className="splash-hero" aria-labelledby="splash-title">
        <div className="splash-overlay" />
        <header className="splash-header">
          <Link aria-label="Argent home" className="wordmark" href="/">
            ARGENT
          </Link>
          <p>Private matchmaking</p>
        </header>
        <div className="splash-content">
          <p className="splash-coordinate">34.4208° N · 119.6982° W</p>
          <h1 id="splash-title">A private introduction.</h1>
          <span className="splash-rule" aria-hidden="true" />
          <p className="splash-location">
            First campaign · Santa Barbara County
          </p>
          <p className="splash-copy">
            Anyone may apply. Every application is considered individually by a
            human team.
          </p>
          <Link className="action-button" href="/prototype">
            Explore campaign concept <span aria-hidden="true">→</span>
          </Link>
        </div>
        <footer className="splash-footer">
          <span>Private by design</span>
          <span>Human reviewed</span>
          <span>Concept prototype · no live applications</span>
        </footer>
      </section>
    </main>
  );
}
