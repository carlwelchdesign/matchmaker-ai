import Image from "next/image";
import Link from "next/link";

import sunriseHero from "../../public/images/argent-sunrise-couple-hero-selected.jpg";

export function PublicSplash() {
  return (
    <main className="landing-shell" data-theme="sunrise">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <header className="landing-header">
        <Link
          aria-label="The Montecito Matchmaker home"
          className="landing-brand"
          href="/"
        >
          <span className="landing-wordmark">The Montecito Matchmaker</span>
          <span className="landing-endorsement">A division of Argent</span>
        </Link>
        <nav className="landing-nav" aria-label="Main navigation">
          <a href="#approach">How it works</a>
          <a href="#privacy">Your privacy</a>
          <a href="#campaign">Montecito</a>
        </nav>
        <a className="landing-header__cta" href="#campaign">
          Montecito opening <span aria-hidden="true">↓</span>
        </a>
      </header>

      <section
        className="landing-hero"
        id="main-content"
        aria-labelledby="landing-title"
      >
        <div className="landing-hero__copy">
          <p className="landing-eyebrow">Private matchmaking · Montecito</p>
          <h1 id="landing-title">Meet someone, not a profile.</h1>
          <p className="landing-hero__lede">
            The Montecito Matchmaker is for people who would rather be known
            than browsed—and who believe a meaningful introduction deserves
            time, attention, and care.
          </p>
          <div className="landing-actions">
            <a
              className="landing-button landing-button--primary"
              href="#approach"
            >
              How it works <span aria-hidden="true">→</span>
            </a>
            <a className="landing-text-link" href="#campaign">
              The Montecito opening
            </a>
          </div>
        </div>
        <figure className="landing-hero__visual">
          <Image
            alt="A couple sharing an intimate moment on a terrace overlooking the Pacific at sunrise"
            className="landing-hero__image"
            fill
            placeholder="blur"
            priority
            sizes="100vw"
            src={sunriseHero}
          />
          <figcaption>
            <span>California coast</span>
            <span>Montecito, California</span>
          </figcaption>
        </figure>
        <div
          className="landing-promise"
          aria-label="The Montecito Matchmaker service principles"
        >
          <span>Private from the start</span>
          <span>Guided by a matchmaker</span>
          <span>Chosen by both people</span>
        </div>
      </section>

      <section
        className="landing-approach"
        id="approach"
        aria-labelledby="approach-title"
      >
        <div className="landing-section-heading">
          <p className="landing-eyebrow">Our approach</p>
          <h2 id="approach-title">We begin by listening.</h2>
        </div>
        <p className="landing-section-intro">
          A good introduction is never just a list of preferences. It begins
          with understanding the shape of your life, what matters to you, and
          the kind of partnership you hope to build.
        </p>
        <ol className="landing-steps">
          <li>
            <span className="landing-step__number">01</span>
            <h3>Tell us about your life</h3>
            <p>
              We begin with a private conversation—not only about whom you hope
              to meet, but about the life you would like to share.
            </p>
          </li>
          <li>
            <span className="landing-step__number">02</span>
            <h3>We consider the whole picture</h3>
            <p>
              A matchmaker looks beyond the obvious, bringing context and human
              judgment to every possibility considered.
            </p>
          </li>
          <li>
            <span className="landing-step__number">03</span>
            <h3>You both choose</h3>
            <p>
              An introduction moves forward only when both people are
              comfortable taking the next step.
            </p>
          </li>
        </ol>
      </section>

      <section
        className="landing-editorial"
        id="privacy"
        aria-labelledby="privacy-title"
      >
        <blockquote className="landing-editorial__statement">
          <span aria-hidden="true">A</span>
          <p>Being known should never mean being on display.</p>
        </blockquote>
        <div className="landing-editorial__copy">
          <p className="landing-eyebrow">Privacy, from the beginning</p>
          <h2 id="privacy-title">Known with care. Shared sparingly.</h2>
          <p>
            To make a thoughtful introduction, we need to understand you. That
            trust comes with responsibility. The Montecito Matchmaker keeps your
            story out of public view and shares personal details only when there
            is a clear purpose—and your permission.
          </p>
          <ul>
            <li>
              No public profiles, searchable directories, or casual browsing.
            </li>
            <li>Every introduction is guided by an accountable matchmaker.</li>
            <li>
              An introduction moves forward only when both people choose it.
            </li>
          </ul>
        </div>
      </section>

      <section
        className="landing-campaign"
        id="campaign"
        aria-labelledby="campaign-title"
      >
        <p className="landing-eyebrow">Beginning in Montecito</p>
        <h2 id="campaign-title">A new circle is taking shape on the coast.</h2>
        <p>
          The Montecito Matchmaker is preparing to open private consultations.
          We’ll share more when the service details and privacy terms are
          ready—because beginning carefully matters.
        </p>
        <div className="landing-campaign__status">
          <span>Montecito opening</span>
          <span>Private consultations · Opening soon</span>
        </div>
      </section>

      <footer className="landing-footer">
        <Link
          aria-label="The Montecito Matchmaker home"
          className="landing-brand"
          href="/"
        >
          <span className="landing-wordmark">The Montecito Matchmaker</span>
          <span className="landing-endorsement">A division of Argent</span>
        </Link>
        <p>Introductions made with care.</p>
        <p>Montecito, California</p>
      </footer>
    </main>
  );
}
