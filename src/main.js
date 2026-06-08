import "./styles.css";

const CONFIG = {
  DEMO_REDIRECT_URL: "https://example.com/",
  SATIRE_MODE_ENABLED: true,
  ADS_LOOP_ENABLED: true,
  AUTO_AD_INTERVAL_MS: 5000,
};

const adMessages = [
  {
    title: "Turbo Résultat Premium",
    body: "Votre addition mérite une expérience VIP sponsorisée par rien du tout.",
    cta: "Voir l'offre fictive",
  },
  {
    title: "Assurance Parenthèses",
    body: "Protégez vos calculs contre les priorités opératoires imprévues.",
    cta: "Simulation locale",
  },
  {
    title: "Pack Zéro Tracking",
    body: "Nous ne collectons aucune donnée, mais nous occupons tout l'écran.",
    cta: "Démo neutre",
  },
  {
    title: "Crédit Décimales",
    body: "Payez maintenant, arrondissez plus tard. Publicité 100% factice.",
    cta: "Ouvrir le néant",
  },
  {
    title: "Booster de Chiffres",
    body: "Multipliez votre patience par un nombre absurde de pop-ins.",
    cta: "Continuer quand même",
  },
];

let currentInput = "0";
let storedValue = null;
let pendingOperator = null;
let adId = 0;
let calculatorBlocked = false;

function openDemoTab() {
  if (!CONFIG.SATIRE_MODE_ENABLED) return;
  const demoTab = window.open(CONFIG.DEMO_REDIRECT_URL, "_blank");
  if (demoTab) demoTab.opener = null;
}

function formatDisplayValue(value) {
  return String(value).slice(0, 16);
}

function updateDisplay() {
  const display = document.querySelector("[data-display]");
  const status = document.querySelector("[data-status]");
  const calculator = document.querySelector("[data-calculator]");

  display.textContent = formatDisplayValue(currentInput);
  status.textContent = pendingOperator
    ? `Opérateur ${pendingOperator} sélectionné`
    : "Saisie normale des chiffres active";

  calculator.classList.toggle("is-blocked", calculatorBlocked);
}

function inputDigit(digit) {
  if (calculatorBlocked) return;
  currentInput = currentInput === "0" ? digit : `${currentInput}${digit}`;
  updateDisplay();
}

function clearCalculator() {
  calculatorBlocked = false;
  currentInput = "0";
  storedValue = null;
  pendingOperator = null;
  updateDisplay();
}

function selectOperator(operator) {
  if (calculatorBlocked) return;
  storedValue = Number(currentInput);
  pendingOperator = operator;
  currentInput = "0";
  if (CONFIG.SATIRE_MODE_ENABLED) {
    createAdPopup("operator");
    openDemoTab();
  }
  updateDisplay();
}

function showPaymentModal() {
  if (calculatorBlocked) return;
  document.querySelector("[data-payment-modal]").showModal();
}

function blockCalculator() {
  calculatorBlocked = true;
  pendingOperator = null;
  currentInput = "BLOQUÉ";
  updateDisplay();
}

function closePaymentModal({ cancelClicked = false } = {}) {
  const modal = document.querySelector("[data-payment-modal]");
  if (modal.open) modal.close();

  if (cancelClicked && CONFIG.SATIRE_MODE_ENABLED) {
    createAdPopup("cancel");
    openDemoTab();
  }

  blockCalculator();
}

function pickAd() {
  return adMessages[adId % adMessages.length];
}

function createAdPopup(reason = "automatic") {
  if (!CONFIG.SATIRE_MODE_ENABLED) return;

  const layer = document.querySelector("[data-ad-layer]");
  const ad = pickAd();
  const node = document.createElement("section");
  const id = adId++;
  const offset = (id % 6) * 22;

  node.className = "ad-popin";
  node.style.setProperty("--x-offset", `${offset}px`);
  node.style.setProperty("--y-offset", `${offset * 0.7}px`);
  node.setAttribute("aria-label", `Publicité factice ${ad.title}`);
  node.innerHTML = `
    <div class="ad-popin__chrome">
      <span>Annonce locale #${String(id + 1).padStart(2, "0")}</span>
      <button type="button" aria-label="Fermer cette publicité" data-close-ad>×</button>
    </div>
    <div class="ad-popin__visual" aria-hidden="true">
      <span></span><span></span><span></span>
    </div>
    <h3>${ad.title}</h3>
    <p>${ad.body}</p>
    <button type="button" data-ad-action>${ad.cta}</button>
    <small>${reason === "automatic" ? "Apparition automatique" : "Déclenchée par interaction"} · aucun tracking</small>
  `;

  node.querySelector("[data-close-ad]").addEventListener("click", () => {
    node.remove();
    if (CONFIG.ADS_LOOP_ENABLED && CONFIG.SATIRE_MODE_ENABLED) {
      window.setTimeout(() => createAdPopup("loop"), 80);
    }
  });

  node.querySelector("[data-ad-action]").addEventListener("click", openDemoTab);
  layer.append(node);
}

function createStaticAd(text, index) {
  return `
    <article class="static-ad static-ad--${index % 4}">
      <span>Pub factice</span>
      <strong>${text}</strong>
      <small>Démo locale · 0 donnée collectée</small>
    </article>
  `;
}

function renderApp() {
  const app = document.querySelector("#app");
  const staticAds = [
    "Abonnement Soustraction Gold",
    "Addition Express avec frais cachés",
    "Division sponsorisée sans cookies",
    "Multiplication de pop-ins garantie",
    "Résultat verrouillé niveau premium",
    "Pack Décimales inutiles",
    "Opérateurs sous influence",
    "Alerte promo: 99,99 euros",
  ];

  app.innerHTML = `
    <main class="page-shell">
      <header class="site-header">
        <div>
          <p class="eyebrow">Prime Calc</p>
          <h1>La calculatrice qui vend avant de calculer</h1>
        </div>
        <p class="satire-notice">Satire / démonstration UX. Aucun vrai paiement, aucune vraie publicité, aucun tracking.</p>
      </header>

      <aside class="ad-rail ad-rail--left" aria-label="Fausses publicités gauche">
        ${staticAds.slice(0, 4).map(createStaticAd).join("")}
      </aside>

      <section class="calculator-zone" aria-label="Calculatrice satirique">
        <div class="background-ads" aria-hidden="true">
          ${staticAds.map((text, index) => `<span>${text}</span>`).join("")}
        </div>
        <div class="calculator" data-calculator>
          <div class="blocked-overlay">
            <strong>Calcul bloqué</strong>
            <span>Le refus du paywall a rendu cette machine volontairement inutilisable.</span>
          </div>
          <div class="calculator__brand">
            <span>Prime Calc</span>
            <small>Ad-funded edition</small>
          </div>
          <output class="calculator__display" data-display>0</output>
          <p class="calculator__status" data-status>Saisie normale des chiffres active</p>
          <div class="calculator__keys" aria-label="Clavier de calculatrice">
            <button type="button" data-clear>C</button>
            <button type="button" data-operator="/">/</button>
            <button type="button" data-operator="×">×</button>
            <button type="button" data-operator="-">-</button>
            ${["7", "8", "9", "4", "5", "6", "1", "2", "3"].map((digit) => `<button type="button" data-digit="${digit}">${digit}</button>`).join("")}
            <button type="button" data-digit="0" class="key-wide">0</button>
            <button type="button" data-operator="+">+</button>
            <button type="button" data-equals class="key-equals">=</button>
          </div>
        </div>
      </section>

      <aside class="ad-rail ad-rail--right" aria-label="Fausses publicités droite">
        ${staticAds.slice(4).map(createStaticAd).join("")}
      </aside>

      <footer class="site-footer">
        ${staticAds.concat(staticAds.slice(0, 2)).map(createStaticAd).join("")}
      </footer>
    </main>

    <div class="ad-layer" data-ad-layer aria-live="polite"></div>

    <dialog class="payment-modal" data-payment-modal aria-labelledby="payment-title">
      <button class="modal-close" type="button" data-payment-close aria-label="Fermer le paywall">×</button>
      <p class="eyebrow">Résultat disponible</p>
      <h2 id="payment-title">Débloquez le calcul pour 99,99 €</h2>
      <p>Cette modale est une satire locale: aucun paiement réel n'est possible, aucune donnée n'est demandée.</p>
      <div class="fake-card" aria-hidden="true">
        <span>PRIME PAYWALL</span>
        <strong>99,99 €</strong>
      </div>
      <div class="modal-actions">
        <button type="button" data-payment-accept>Je refuse le vrai paiement fictif</button>
        <button type="button" data-payment-cancel>Annuler</button>
      </div>
    </dialog>
  `;
}

function bindEvents() {
  document.querySelectorAll("[data-digit]").forEach((button) => {
    button.addEventListener("click", () => inputDigit(button.dataset.digit));
  });

  document.querySelectorAll("[data-operator]").forEach((button) => {
    button.addEventListener("click", () => selectOperator(button.dataset.operator));
  });

  document.querySelector("[data-clear]").addEventListener("click", clearCalculator);
  document.querySelector("[data-equals]").addEventListener("click", showPaymentModal);
  document.querySelector("[data-payment-close]").addEventListener("click", () => closePaymentModal());
  document.querySelector("[data-payment-accept]").addEventListener("click", () => closePaymentModal());
  document.querySelector("[data-payment-cancel]").addEventListener("click", () => closePaymentModal({ cancelClicked: true }));
  document.querySelector("[data-payment-modal]").addEventListener("cancel", (event) => {
    event.preventDefault();
    closePaymentModal();
  });
}

renderApp();
bindEvents();
updateDisplay();

if (CONFIG.SATIRE_MODE_ENABLED && CONFIG.ADS_LOOP_ENABLED) {
  window.setInterval(() => createAdPopup("automatic"), CONFIG.AUTO_AD_INTERVAL_MS);
}
