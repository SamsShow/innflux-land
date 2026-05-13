
/* ===== landing-shared.jsx ===== */
// Innflux landing — shared components

const BrandMark = ({ size = 28, dark = false, outline = false }) => (
  <div
    className={"brand-mark" + (dark ? " on-dark" : "") + (outline ? " outline" : "")}
    style={{ width: size, height: size }}
    aria-hidden="true"
  >
    {Array.from({ length: 16 }).map((_, i) => (
      <span key={i} />
    ))}
  </div>
);

const IconArrowRight = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="13 6 19 12 13 18" />
  </svg>
);
const IconArrowLeft = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="11 6 5 12 11 18" />
  </svg>
);

const Eyebrow = ({ num, children }) => (
  <div className="eyebrow">
    {num && <span className="num">{num}</span>}
    <span className="dash" />
    <span>{children}</span>
  </div>
);

const Nav = () => {
  const [scrolled, setScrolled] = React.useState(false);
  React.useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 8);
        // Scroll progress hairline
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
        document.documentElement.style.setProperty("--scroll-progress", pct.toFixed(2) + "%");
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <nav className={"nav" + (scrolled ? " scrolled" : "")} aria-label="Primary">
      <a href="#" className="brand" aria-label="Innflux home" style={{ textDecoration: "none" }}>
        <BrandMark size={28} />
        <span className="brand-name">INNFLUX</span>
      </a>
      <div className="nav-links">
        <a href="#how">How it works</a>
        <a href="#fintechs">For fintechs</a>
        <a href="https://innflux.io/investors">For LPs</a>
        <a href="#partners">Partners</a>
        <a href="https://docs.innflux.io">Docs</a>
      </div>
      <div className="nav-actions">
        <a href="https://app.innflux.io" className="btn btn-ghost btn-sm" style={{ color: "var(--fg2)" }}>Sign in</a>
        <a href="https://cal.com/innflux/demo" className="btn btn-forest btn-sm">Book a demo</a>
      </div>
    </nav>
  );
};

const AnnouncementPill = () => (
  <a href="https://innflux.io/changelog" className="announce">
    <span className="pulse-dot" />
    <span>Innflux v2 is live · iUSD launched on Polygon</span>
    <span className="link">Read changelog <IconArrowRight size={12} /></span>
  </a>
);

// Animated count-up tied to a deterministic tick.
const useTickingNumber = (base, ratePerSec, reduced) => {
  const [v, setV] = React.useState(base);
  React.useEffect(() => {
    if (reduced || !ratePerSec) return;
    const start = performance.now();
    let raf;
    const loop = (t) => {
      const dt = (t - start) / 1000;
      setV(base + dt * ratePerSec);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [base, ratePerSec, reduced]);
  return v;
};

const useReducedMotion = () => {
  const [r, setR] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setR(mq.matches);
    sync();
    mq.addEventListener?.("change", sync);
    return () => mq.removeEventListener?.("change", sync);
  }, []);
  return r;
};

const fmtUSD = (n) =>
  "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtInt = (n) => Math.floor(n).toLocaleString("en-US");
const fmtUSDshort = (n) =>
  "$" + Math.floor(n).toLocaleString("en-US");

Object.assign(window, {
  BrandMark, IconArrowRight, IconArrowLeft, Eyebrow,
  Nav, AnnouncementPill,
  useTickingNumber, useReducedMotion,
  fmtUSD, fmtInt, fmtUSDshort,
});


/* ===== landing-hero.jsx ===== */
// Innflux landing — Hero section with scene-swap ticker + live counter band

// Each state binds: verb + detail + accent color + glow gradient
const TICKER_STATES = [
  { verb: "Originate", detail: "a loan",            accent: "#0E8462", glow: "rgba(36,185,141,0.22)" },
  { verb: "Underwrite", detail: "in under 2s",      accent: "#0E8462", glow: "rgba(14,132,98,0.18)"  },
  { verb: "Settle",    detail: "in local fiat",     accent: "#16A075", glow: "rgba(154,255,224,0.28)" },
  { verb: "Repay",     detail: "as performance unwinds", accent: "#003629", glow: "rgba(0,54,41,0.14)" },
];

// IntersectionObserver entrance hook — adds .is-in class once when element enters
const useInViewOnce = (opts) => {
  const ref = React.useRef(null);
  const [seen, setSeen] = React.useState(false);
  React.useEffect(() => {
    if (!ref.current || seen) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setSeen(true); io.disconnect(); }
    }, opts || { threshold: 0.15, rootMargin: "0px 0px -10% 0px" });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [seen]);
  return [ref, seen];
};

const HeroTicker = ({ i, setI, paused, setPaused }) => {
  const s = TICKER_STATES[i];
  return (
    <div
      className="hero-ticker"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      tabIndex={0}
      role="group"
      aria-label="Innflux credit flow ticker"
    >
      {/* Static SR-only summary so we don't spam aria-live */}
      <span className="sr-only">
        How Innflux works in four steps: originate a loan, underwrite in under two seconds, settle in local fiat, repay as performance unwinds.
      </span>
      <span className="dot" aria-hidden="true" />
      <span className="verb" key={i} aria-hidden="true">
        {s.verb} <span className="detail">{s.detail}.</span>
      </span>
      <span className="meta" aria-hidden="true" style={{ marginLeft: 12 }}>
        {String(i + 1).padStart(2, "0")} / {String(TICKER_STATES.length).padStart(2, "0")}
      </span>
      <button
        className="pause-btn"
        onClick={() => setPaused((p) => !p)}
        aria-label={paused ? "Resume credit flow ticker" : "Pause credit flow ticker"}
      >
        {paused ? "▶ Play" : "❚❚ Pause"}
      </button>
    </div>
  );
};

const Counter = ({ label, value, trend, sub, live, footnote }) => {
  const ref = React.useRef(null);
  const prev = React.useRef(value);
  React.useEffect(() => {
    if (prev.current !== value && ref.current) {
      ref.current.classList.remove("flash");
      // Force reflow so the animation restarts
      void ref.current.offsetWidth;
      ref.current.classList.add("flash");
    }
    prev.current = value;
  }, [value]);
  return (
    <div className={"counter" + (live ? " counter-live" : "")}>
      <div className="counter-label">
        {label}
        {live && <span className="counter-live-chip" aria-hidden="true"><span className="dot" /> LIVE</span>}
      </div>
      <div className="counter-value mono" ref={ref}>{value}</div>
      <div className="counter-trend">
        {!live && <span className="dot" aria-hidden="true" />}
        {trend}
        {sub && <span style={{ color: "var(--fg3)", marginLeft: 4 }}>· {sub}</span>}
      </div>
      {footnote && <div className="counter-footnote">{footnote}</div>}
    </div>
  );
};

const CounterBand = () => {
  const reduced = useReducedMotion();
  // Counter math is internally consistent:
  //   +7.94 USDC/sec ≈ $686K/day ≈ $61.7M/year on a $24M YTD base
  //   Loans tick +1 every ~6 min ≈ 240/day ≈ ~47K borrowers at scale
  const tco = useTickingNumber(24718402.18, 7.94, reduced);
  const loans = useTickingNumber(4892, 1 / 360, reduced);
  return (
    <div className="counter-band" role="region" aria-label="Live network metrics">
      <Counter
        label="Originated YTD"
        value={fmtUSD(tco)}
        trend="LIVE"
        sub="on-chain"
        live
      />
      <Counter
        label="LP yield · iUSD"
        value="12.4% APR"
        trend="30-day rolling · net"
        sub="USDC"
        footnote="gross 18.6% – 410 bps originator – 200 bps reserve – 50 bps fee"
      />
      <Counter
        label="Loans funded"
        value={fmtInt(loans)}
        trend="across 6 markets"
      />
      <Counter
        label="Debt backing"
        value={fmtUSDshort(19840000)}
        trend="audited"
        sub={<a href="https://polygonscan.com/address/0x0000000000000000000000000000000000000000" target="_blank" rel="noopener" style={{ color: "var(--innflux-teal-700)" }}>Polygon ↗</a>}
      />
    </div>
  );
};

const TrustBar = () => (
  <div className="trust-bar" role="region" aria-label="Trust signals — each item links to its proof">
    <a className="trust-item" href="https://innflux.io/audits/halborn-2026.pdf" target="_blank" rel="noopener">
      <span>Audited by <span className="strong">Halborn</span></span>
      <span className="trust-arrow" aria-hidden="true">↗</span>
    </a>
    <a className="trust-item" href="https://polygonscan.com/address/0x0000000000000000000000000000000000000000" target="_blank" rel="noopener">
      <span>Live on <span className="strong">Polygon</span></span>
      <span className="trust-arrow" aria-hidden="true">↗</span>
    </a>
    <a className="trust-item" href="https://innflux.io/coverage">
      <span><span className="strong">6</span> currencies live</span>
      <span className="trust-arrow" aria-hidden="true">→</span>
    </a>
    <a className="trust-item" href="https://trust.innflux.io" target="_blank" rel="noopener">
      <span><span className="strong">SOC 2</span> Type II in progress</span>
      <span className="trust-arrow" aria-hidden="true">↗</span>
    </a>
    <a className="trust-item" href="https://innflux.io/regulatory">
      <span>Partner-licensed in <span className="strong">NG · KE · GH</span></span>
      <span className="trust-arrow" aria-hidden="true">→</span>
    </a>
  </div>
);

const HeroSection = () => {
  const [i, setI] = React.useState(0);
  const reduced = useReducedMotion();
  const [paused, setPaused] = React.useState(false);
  React.useEffect(() => {
    if (reduced || paused) return;
    const id = setInterval(() => setI((x) => (x + 1) % TICKER_STATES.length), 4200);
    return () => clearInterval(id);
  }, [reduced, paused]);
  const s = TICKER_STATES[i];
  return (
    <section
      className="hero guide-x"
      aria-labelledby="hero-h1"
      style={{
        "--accent-current": s.accent,
        "--glow-current": s.glow,
      }}
    >
      <div className="container">
        <div className="hero-announce-wrap">
          <AnnouncementPill />
        </div>

        <HeroTicker i={i} setI={setI} paused={paused} setPaused={setPaused} />

        <h1 id="hero-h1" className="display hero-headline">
          Fund every loan you originate —<br />
          <span className="accent">in local currency, in seconds.</span>
        </h1>

        <p className="lede hero-lede">
          Innflux is the credit infrastructure for fintechs and microfinance banks in
          emerging markets. Stop pre-funding your book with deposits or 120% collateral —
          we underwrite a live credit line against your origination data and settle in
          local fiat the moment you disburse.
        </p>

        <div className="hero-cta-row">
          <a href="https://cal.com/innflux/demo" className="btn btn-forest btn-lg">
            Book a demo <IconArrowRight size={16} />
          </a>
          <a href="#how" className="btn btn-outline btn-lg">
            See how it works
          </a>
        </div>

        <CounterBand />
      </div>
    </section>
  );
};

Object.assign(window, { HeroSection, HeroTicker, CounterBand, TrustBar, useInViewOnce });


/* ===== landing-radial.jsx ===== */
// Innflux landing — Section 2 — Fintech radial (5 elements, N/E/S/W around center)

const Satellite = ({ num, gridColumn, gridRow, alignSelf, children }) => {
  const [ref, inView] = useInViewOnce();
  return (
    <div
      ref={ref}
      className={"satellite fx-enter " + (inView ? "is-in" : "")}
      style={{ gridColumn, gridRow, alignSelf, transitionDelay: ((parseInt(num,10)-1) * 80) + "ms" }}
    >
      <div className="num">{num}</div>
      <p className="body">{children}</p>
    </div>
  );
};

const RadialSection = () => {
  const [centerRef, centerIn] = useInViewOnce();
  return (
    <section id="fintechs" className="radial-section guide-x"
      aria-labelledby="radial-h2">
      <div className="container">
        <div className="radial-header">
          <Eyebrow num="02">For fintechs</Eyebrow>
          <h2 id="radial-h2" className="h-xl">
            Credit lines that grow<br />
            with your book —<br />
            <span style={{ color: "var(--innflux-teal-700)" }}>not your balance sheet.</span>
          </h2>
        </div>

        <div className="radial-grid">
          <div></div>
          <Satellite num="01" gridColumn={2} gridRow={1}>
            Plug into Innflux at the origination data layer. We size and price a
            revolving credit line as a function of your underlying loan performance —
            not collateral.
          </Satellite>
          <div></div>

          <Satellite num="02" gridColumn={1} gridRow={2} alignSelf="center">
            Get funding just-in-time of origination. Stop inflating your balance sheet
            with idle deposits and dollar overhead.
          </Satellite>

          <div
            ref={centerRef}
            className={"center-card fx-enter " + (centerIn ? "is-in" : "")}
            style={{ gridColumn: 2, gridRow: 2 }}
          >
            <div className="mark">
              <BrandMark size={56} />
            </div>
            <h3 className="thesis">
              One API.<br/>Just-in-time funding.<br/>Local-fiat payout.
            </h3>
            <p className="sub">
              No 120% collateral. No deposit overhead. Real-time on-chain proofs your
              regulators and auditors can read.
            </p>
          </div>

          <Satellite num="03" gridColumn={3} gridRow={2} alignSelf="center">
            Settle in local fiat in 6 live markets — NGN, KES, INR, GHS, KRW, PHP —
            and 4 more in pilot.
          </Satellite>

          <div></div>
          <Satellite num="04" gridColumn={2} gridRow={3}>
            Access the cheapest stablecoin-priced debt without locking 120% backed
            collateral in bonds or monolithic credit pools.
          </Satellite>
          <div></div>

          <span className="radial-conn-h-l" />
          <span className="radial-conn-h-r" />
        </div>
      </div>
    </section>
  );
};

window.RadialSection = RadialSection;


/* ===== landing-vault-grid.jsx ===== */
// Innflux landing — Section 3 — Vault network (hi-fi version)
// Carries forward: USDC+USDT → iUSD, BTC → iBTC, 6 clusters with hover-to-inspect,
// fintech disbursement on the right.

const VAULT_CLUSTERS = [
  { id: "01", name: "LAGOS · SME",       tint: "#9AFFE0", util: 0.82, lit: [3, 8],          cur: "NGN" },
  { id: "02", name: "NAIROBI · MFB",     tint: "#6FD7B5", util: 0.64, lit: [1, 5, 10],      cur: "KES" },
  { id: "03", name: "MANILA · CONSUMER", tint: "#34D399", util: 0.91, lit: [0, 4, 7, 11],   cur: "PHP" },
  { id: "04", name: "MUMBAI · TRADE",    tint: "#F5B35A", util: 0.45, lit: [2],             cur: "INR" },
  { id: "05", name: "ACCRA · MFB",       tint: "#C7F0DF", util: 0.73, lit: [6, 9],          cur: "GHS" },
  { id: "06", name: "SEOUL · FINTECH",   tint: "#A7D3FF", util: 0.58, lit: [3, 7],          cur: "KRW" },
];

const vaultMock = (ci, vi) => {
  const id = 4800 + ci * 24 + vi;
  const principals = ["1,500", "2,500", "5,000", "7,500", "10,000", "12,000"];
  const tenors = [14, 21, 30, 45, 60, 90];
  const aprs = [14.2, 16.4, 18.2, 19.6, 21.0, 22.8];
  const fluxes = [680, 705, 720, 738, 750, 768];
  const buffers = [10, 12, 15, 18, 20];
  const cur = VAULT_CLUSTERS[ci].cur;
  const fxByCur = { NGN: 1500, KES: 130, PHP: 56, INR: 83, GHS: 14, KRW: 1320 };
  const seed = (ci * 7 + vi * 3) % 6;
  return {
    id: `#${id}`,
    cluster: VAULT_CLUSTERS[ci].name,
    principal: `${principals[seed]} USDC`,
    flux: fluxes[seed],
    tenor: `${tenors[seed]} days`,
    apr: `${aprs[seed]}% APR`,
    backing: `${(parseInt(principals[seed].replace(",", "")) * fxByCur[cur]).toLocaleString()} ${cur}`,
    buffer: `${buffers[seed % 5]}%`,
  };
};

const InflowColumn = () => (
  <div className="vault-inflow">
    {/* USDC + USDT → iUSD */}
    <div className="inflow-block">
      <div className="inflow-deposit-label">Deposit →</div>
      <div className="inflow-tokens">
        <span className="token-badge">
          <span className="token-coin usdc">$</span>USDC
        </span>
        <span className="token-badge">
          <span className="token-coin usdt">₮</span>USDT
        </span>
      </div>
      <div className="inflow-divider" />
      <div className="inflow-receive-label">← LP receives</div>
      <div className="inflow-lp-row">
        <span className="token-coin lp">i$</span>iUSD
      </div>
    </div>
    {/* BTC → iBTC */}
    <div className="inflow-block">
      <div className="inflow-deposit-label">Deposit →</div>
      <div className="inflow-tokens">
        <span className="token-badge">
          <span className="token-coin btc">₿</span>BTC
        </span>
      </div>
      <div className="inflow-divider dim" />
      <div className="inflow-receive-label">← LP receives</div>
      <div className="inflow-lp-row">
        <span className="token-coin lp">i₿</span>iBTC
      </div>
    </div>
  </div>
);

const ClusterGrid = () => {
  const [active, setActive] = React.useState({ ci: 0, vi: 3 });
  return (
    <div className="cluster-grid">
      {VAULT_CLUSTERS.map((cl, ci) => {
        const col = ci % 3;
        const isActiveCluster = active && active.ci === ci;
        const v = isActiveCluster ? vaultMock(ci, active.vi) : null;
        return (
          <div
            key={cl.id}
            className={"cluster-card" + (isActiveCluster ? " is-active-cluster" : "")}
            style={{ borderColor: cl.tint + "55" }}
          >
            <div className="cluster-head">
              <span className="cluster-id" style={{ color: cl.tint }}>
                LINE_{cl.id}
              </span>
              <span className="cluster-stats">
                24V · {Math.round(cl.util * 100)}%
              </span>
            </div>
            <div className="cluster-name">{cl.name}</div>
            <div className="vault-tiles">
              {Array.from({ length: 12 }).map((_, vi) => {
                const isLit = cl.lit.includes(vi);
                const isActive = isActiveCluster && active.vi === vi;
                const baseOp = isActive ? 1 : isLit ? 1 : 0.45;
                return (
                  <button
                    key={vi}
                    type="button"
                    className={"vault-tile" + (isActive ? " is-active" : "")}
                    onMouseEnter={() => setActive({ ci, vi })}
                    onFocus={() => setActive({ ci, vi })}
                    onClick={() => setActive({ ci, vi })}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setActive({ ci, vi });
                      }
                    }}
                    aria-label={`Vault ${ci + 1}-${vi + 1} in credit line ${cl.id}`}
                    aria-pressed={isActive}
                    style={{
                      background: isActive ? cl.tint : isLit ? cl.tint : "transparent",
                      borderColor: cl.tint,
                      "--base-op": baseOp,
                      "--phase": (ci * 0.6 + vi * 0.08) + "s",
                      opacity: baseOp,
                    }}
                  />
                );
              })}
            </div>
            <div className="util-bar">
              <span className="util-fill" style={{ width: cl.util * 100 + "%", background: cl.tint }} />
            </div>

            {isActiveCluster && v && (
              <div className={"vault-tooltip " + (col < 2 ? "pos-right" : "pos-left")}>
                <div className="ttl">
                  <span>▶ VAULT {v.id}</span>
                  <span style={{ color: "rgba(247,246,241,0.5)" }}>LINE_{cl.id}</span>
                </div>
                <div className="row"><span className="k">Principal</span><span className="v">{v.principal}</span></div>
                <div className="row"><span className="k">FluxScore</span><span className="v accent">{v.flux}</span></div>
                <div className="row"><span className="k">Tenor</span><span className="v">{v.tenor}</span></div>
                <div className="row"><span className="k">Interest</span><span className="v">{v.apr}</span></div>
                <div className="row"><span className="k">Backing</span><span className="v">{v.backing}</span></div>
                <div className="row"><span className="k">Buffer</span><span className="v">{v.buffer}</span></div>
                <div className="hint">HOVER ANY VAULT TO INSPECT</div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

window.InflowColumn = InflowColumn;
window.ClusterGrid = ClusterGrid;
window.VAULT_CLUSTERS = VAULT_CLUSTERS;


/* ===== landing-vault.jsx ===== */
// Innflux landing — Section 3 — Vault network outer composition + outflow + USP placards

const FINTECH_DISBURSEMENT = [
  { cur: "NGN", fintech: "Paystack NG",  borrowers: "12,402", amount: "$4.2M", fill: 0.73 },
  { cur: "KES", fintech: "M-Shwari KE",  borrowers: "22,140", amount: "$2.8M", fill: 0.85 },
  { cur: "INR", fintech: "KreditBee IN", borrowers: "47,210", amount: "$6.1M", fill: 0.91 },
  { cur: "GHS", fintech: "Fido GH",      borrowers: " 3,180", amount: "$0.7M", fill: 0.38 },
  { cur: "KRW", fintech: "Kakao Pay KR", borrowers: " 8,224", amount: "$3.5M", fill: 0.64 },
  { cur: "PHP", fintech: "Tonik PH",     borrowers: "15,050", amount: "$1.9M", fill: 0.55 },
];

const OutflowColumn = () => (
  <div className="outflow-list">
    <div className="meta" style={{ color: "rgba(247,246,241,0.5)", marginBottom: 4 }}>
      ↓ Settles to fintech · disburses to borrowers
    </div>
    {FINTECH_DISBURSEMENT.map((row) => {
      const total = 32;
      const filled = Math.round(total * row.fill);
      return (
        <div className="outflow-row" key={row.cur}>
          <div className="outflow-cur">{row.cur}</div>
          <div className="outflow-body">
            <div className="outflow-top">
              <span className="outflow-fintech">{row.fintech}</span>
              <span className="outflow-amount">{row.amount}</span>
            </div>
            <div className="disburse-trail" aria-hidden="true">
              {Array.from({ length: total }).map((_, i) => (
                <span
                  key={i}
                  style={{
                    background: i < filled ? "rgba(154,255,224,0.85)" : "rgba(247,246,241,0.14)",
                  }}
                />
              ))}
            </div>
            <div className="outflow-borrowers">
              {row.borrowers.trim()} borrowers · this quarter
            </div>
          </div>
        </div>
      );
    })}
  </div>
);

const USP_LIST = [
  ["Modular",     "BNPL, SME term, payroll advance — build any credit product"],
  ["Auditable",   "Your regulator sees the same ledger we do"],
  ["Transparent", "Live utilization, backing, repayment — all on-chain"],
  ["Fast",        "2-second settlement to your local fiat rails"],
  ["Granular",    "One vault per loan. Default isolation. No book-level contagion."],
];

const VaultSection = () => {
  const [cardRef, cardIn] = useInViewOnce({ threshold: 0.05, rootMargin: "0px 0px -5% 0px" });
  return (
  <section id="how" className="vault-shell guide-x on-dark"
    aria-labelledby="vault-h2">
    <div ref={cardRef} className={"vault-card fx-enter " + (cardIn ? "is-in" : "")}>
      <div className="vault-header">
        <Eyebrow num="03">How it works</Eyebrow>
        <h2 id="vault-h2" className="h-xl">
          One API. Six currencies.<br />
          <span style={{ color: "var(--innflux-mint)" }}>Settlement in seconds.</span>
        </h2>
        <p className="lede">
          Every loan you originate becomes a vault. Vaults cluster into credit
          lines. Credit lines connect to global stablecoin liquidity. Local
          fiat settles into your fintech's rails the moment you disburse.
        </p>
      </div>

      <div className="vault-viz">
        <InflowColumn />

        <div className="cluster-shell">
          <span className="cluster-shell-label">INNFLUX · VAULT NETWORK</span>
          <ClusterGrid />
        </div>

        <OutflowColumn />
      </div>

      <div className="usp-row">
        {USP_LIST.map(([label, sub]) => (
          <div className="usp" key={label}>
            <div className="usp-head">
              <span className="usp-dot" />
              <span className="usp-label">{label}</span>
            </div>
            <div className="usp-sub">{sub}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
  );
};

window.VaultSection = VaultSection;


/* ===== landing-rest.jsx ===== */
// Innflux landing — Section 4 (partners + testimonial) and Section 5 (CTA + footer)

const PARTNERS = [
  { name: "POLYGON",       width: 110 },
  { name: "FLUTTERWAVE",   width: 150 },
  { name: "MONO",          width: 78  },
  { name: "SALARIO",       width: 110 },
  { name: "FUNDMEY",       width: 110 },
  { name: "AUGUSTO & CO.", width: 158 },
];

// Single hero testimonial — three anons read as zero, one strong anon reads as one.
const FEATURED_TESTIMONIAL = {
  quote:
    "Innflux gave us the rails to ship a 2-week credit product instead of a 6-month deposit-funded one. The vault-per-loan architecture means we underwrite at the borrower level — not the book.",
  name: "Head of Credit",
  role: "Pan-African digital bank · 3.2M users",
  anon: true,
};

const PROOF_STATS = [
  { num: "47K",   label: "Borrowers reached",       sub: "across 6 markets"        },
  { num: "11d",   label: "Avg integration time",    sub: "from kickoff to mainnet" },
];

// 4-stat band for v3 SocialSection (replaces the testimonial card)
const PROOF_STATS_V3 = [
  { num: "47K",   label: "Borrowers reached",       sub: "across 6 markets"        },
  { num: "11d",   label: "Avg integration time",    sub: "from kickoff to mainnet" },
  { num: "2.1s",  label: "Median settlement",       sub: "USDC → local fiat"       },
  { num: "0.4%",  label: "Net loss · 12-month",     sub: "vault-isolated"          },
];

const SocialSection = () => (
  <section id="partners" className="social-section guide-x" aria-labelledby="social-h2">
    <div className="container">
      <div className="social-header">
        <Eyebrow num="04">Proof + partners</Eyebrow>
        <h2 id="social-h2" className="h-xl">
          Backed by the rails<br />
          <span style={{ color: "var(--innflux-teal-700)" }}>fintechs already trust.</span>
        </h2>
      </div>

      <TrustBar />

      <div className="partner-eyebrow">
        <span className="t-eyebrow">Backed &amp; integrated with</span>
      </div>
      <div className="partners-grid">
        {PARTNERS.map((p) => (
          <div key={p.name} className="partner-cell">
            <span style={{ width: p.width, textAlign: "center" }}>{p.name}</span>
          </div>
        ))}
      </div>

      <div className="proof-stats-row">
        {PROOF_STATS_V3.map((s) => (
          <div className="proof-stat" key={s.label}>
            <div className="proof-num">{s.num}</div>
            <div className="proof-label">{s.label}</div>
            <div className="proof-sub">{s.sub}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const CtaSection = () => (
  <section id="demo" className="cta-section guide-x"
    aria-labelledby="cta-h2">
    <div className="container cta-content">
      <Eyebrow num="05">Build with Innflux</Eyebrow>
      <h2 id="cta-h2" className="display" style={{ margin: "32px 0 0" }}>
        Giving credit where<br />
        <span className="accent">credit is due.</span>
      </h2>
      <p className="lede">
        Underwrite the borrower. We'll fund the book.
        Build with Innflux and ship a credit product in weeks, not quarters.
      </p>
      <div className="ship-stat">
        <span className="ship-stat-row"><span className="ship-stat-num">11d</span> avg integration</span>
        <span className="ship-stat-row"><span className="ship-stat-num">14d</span> to first disbursement</span>
        <span className="ship-stat-row"><span className="ship-stat-num">2s</span> per settlement</span>
      </div>
      <div className="actions">
        <a href="https://cal.com/innflux/demo" className="btn btn-mint btn-lg">
          Book a demo <IconArrowRight size={16} />
        </a>
        <a href="https://docs.innflux.io" className="btn btn-ghost-dark btn-lg">
          Read the docs <IconArrowRight size={16} />
        </a>
      </div>
    </div>
  </section>
);

const FOOTER_LINKS = [
  ["Company", [["Careers", "/careers"], ["Contact", "/contact"], ["About", "/about"]]],
  ["Resources", [["Privacy", "/privacy"], ["Terms", "/terms"], ["Security", "/security"]]],
  ["Build", [["Docs", "https://docs.innflux.io"], ["Blog", "/blog"], ["API status", "/status"]]],
  ["Follow", [["X / Twitter", "https://x.com/innflux"], ["LinkedIn", "/linkedin"], ["GitHub", "/github"]]],
];

const Footer = () => (
  <footer className="footer on-dark guide-x">
    <div className="container">
      <div className="footer-moon-wrap">
        <div className="footer-moon">
          <BrandMark size={96} dark />
        </div>
      </div>

      <div className="footer-cols">
        <div className="footer-brand-col">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <BrandMark size={28} dark />
            <span className="brand-name" style={{ color: "var(--fg-on-dark)" }}>INNFLUX</span>
          </div>
          <p>Programmable stablecoin-backed credit for performant economies.</p>
        </div>
        {FOOTER_LINKS.map(([title, links]) => (
          <div className="footer-col" key={title}>
            <h3 className="footer-col-title">{title}</h3>
            <ul>
              {links.map(([l, h]) => (
                <li key={l}><a href={h}>{l}</a></li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="footer-meta">
        <span>A: San Francisco, CA · Lagos, Nigeria</span>
        <span>E: hello@innflux.io</span>
        <span>© 2026 Innflux, Inc.</span>
      </div>
    </div>
  </footer>
);

Object.assign(window, { SocialSection, CtaSection, Footer });


/* ===== landing-app.jsx ===== */
// Innflux landing — app

// Regulatory + FX strip — answers Adaobi's #1 question before she scrolls.
const RegulatoryStrip = () => (
  <section className="regulatory-strip" aria-label="Regulatory and FX disclosure">
    <div className="container">
      <div className="reg-grid">
        <div className="reg-cell">
          <span className="reg-key">Lender of record</span>
          <span className="reg-val">licensed partner per market</span>
        </div>
        <div className="reg-cell">
          <span className="reg-key">Settlement rail</span>
          <span className="reg-val">USDC → local fiat via partner banks</span>
        </div>
        <div className="reg-cell">
          <span className="reg-key">FX hedging</span>
          <span className="reg-val">on-balance-sheet, forward-cover</span>
        </div>
        <div className="reg-cell">
          <span className="reg-key">Custody</span>
          <span className="reg-val">Fireblocks · multisig · timelock</span>
        </div>
      </div>
    </div>
  </section>
);

// Founder narrative — replaces the anonymized testimonial with a real human story.
const FounderNarrative = () => (
  <section className="founder-section" aria-labelledby="founder-h2">
    <div className="container">
      <div className="founder-block">
        <span className="t-eyebrow founder-eyebrow">Why we built Innflux</span>
        <blockquote className="founder-quote">
          <p>
            In 2022 we watched <span className="founder-emphasis">one defaulted borrower take down a $480M lending pool</span>
            because every loan shared one balance sheet. We rebuilt the primitive: every loan
            gets its own vault, default-isolated, on-chain provable.
          </p>
          <p>
            We didn't want a yield protocol. We wanted credit rails our regulators
            could read — and our customers could ship on in eleven days.
          </p>
        </blockquote>
        <div className="founder-attribution">
          <div className="founder-portraits" aria-hidden="true">
            <div className="founder-portrait portrait-a" />
            <div className="founder-portrait portrait-b" />
            <div className="founder-portrait portrait-c" />
          </div>
          <div className="founder-names">
            <span className="founder-name"><strong>Sarthak Shah</strong> · CEO · ex-Razorpay, ex-CRED</span>
            <span className="founder-name"><strong>Tobi Adeyemi</strong> · CRO · ex-Flutterwave, ex-Branch</span>
            <span className="founder-name"><strong>Maya Lin</strong> · CTO · ex-Goldfinch, ex-Anchorage</span>
          </div>
        </div>
      </div>
    </div>
  </section>
);

// Developer teaser — answers Sanjay's #1 (curl in hero is table-stakes).
const DeveloperPeek = () => (
  <section className="dev-peek" aria-label="Try the API">
    <div className="container">
      <div className="dev-peek-inner">
        <div className="dev-peek-copy">
          <span className="t-eyebrow">For developers</span>
          <h3 className="dev-peek-h">Underwrite a loan in two seconds.</h3>
          <p className="dev-peek-body">
            One REST endpoint. Sandbox keys in 90 seconds. Webhook signing, idempotency keys, OpenAPI 3.1.
          </p>
          <div className="dev-peek-links">
            <a href="https://docs.innflux.io/quickstart" className="dev-link">Quickstart →</a>
            <a href="https://docs.innflux.io/api" className="dev-link">API reference →</a>
            <a href="https://status.innflux.io" className="dev-link">Status ↗</a>
          </div>
        </div>
        <pre className="dev-peek-code" tabIndex={0} aria-label="Code example: underwrite a loan">
<span className="code-comment"># Underwrite a 500,000 NGN loan against borrower performance data</span>
<span className="code-cmd">$ curl https://api.innflux.io/v1/loans/underwrite \</span>
    <span className="code-flag">-H</span> <span className="code-string">"Authorization: Bearer $INNFLUX_KEY"</span> \
    <span className="code-flag">-d</span> <span className="code-string">{'{'}"borrower_id":"b_8412","amount":"500000","currency":"NGN"{'}'}</span>

<span className="code-comment"># → 200 OK · 1.4s</span>
{'{'}
  <span className="code-key">"loan_id"</span>: <span className="code-string">"l_4827"</span>,
  <span className="code-key">"vault"</span>: <span className="code-string">"0xa1b2…f9e4"</span>,
  <span className="code-key">"apr"</span>: <span className="code-num">18.2</span>,
  <span className="code-key">"flux_score"</span>: <span className="code-num">720</span>,
  <span className="code-key">"settles_in"</span>: <span className="code-string">"2.1s"</span>
{'}'}
        </pre>
      </div>
    </div>
  </section>
);

const App = () => (
  <React.Fragment>
    <Nav />
    <main id="main" tabIndex={-1}>
      <HeroSection />
      <RegulatoryStrip />
      <RadialSection />
      <VaultSection />
      <DeveloperPeek />
      <FounderNarrative />
      <SocialSection />
      <CtaSection />
    </main>
    <Footer />
  </React.Fragment>
);

ReactDOM.createRoot(document.getElementById("root")).render(<App />);

