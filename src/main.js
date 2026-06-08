import "./styles.css";

const CONFIG = {
  DEMO_REDIRECT_URL: "https://example.com/",
  SATIRE_MODE_ENABLED: true,
  ADS_LOOP_ENABLED: true,
  ADS_ON_DIGIT_ENABLED: true,
  AUTO_AD_INTERVAL_MS: 5000,
  KEY_SHUFFLE_INTERVAL_MS: 5000,
};

const adMessages = [
  {
    brand: "NovaBank",
    title: "Crédit instantané jusqu'à 5 000 €",
    body: "Une réponse de principe en moins de 3 minutes pour financer vos projets du moment.",
    cta: "Découvrir l'offre",
    tag: "Finance",
  },
  {
    brand: "Helio Mobile",
    title: "Forfait 5G 180 Go à prix réduit",
    body: "Appels illimités, roaming Europe inclus et activation immédiate en ligne.",
    cta: "Comparer les forfaits",
    tag: "Télécom",
  },
  {
    brand: "CasaFlex",
    title: "Canapé modulable livré en 72 h",
    body: "Composez votre salon avec des modules premium et une garantie confort 10 ans.",
    cta: "Voir la collection",
    tag: "Maison",
  },
  {
    brand: "Triply",
    title: "Séjours urbains dès 49 € la nuit",
    body: "Des hôtels bien notés, des annulations flexibles et des offres limitées cette semaine.",
    cta: "Réserver maintenant",
    tag: "Voyage",
  },
  {
    brand: "FitMeal",
    title: "Menus protéinés livrés chez vous",
    body: "Choisissez vos objectifs, recevez vos repas prêts à consommer du lundi au vendredi.",
    cta: "Créer mon panier",
    tag: "Bien-être",
  },
];

let currentInput = "0";
let storedValue = null;
let pendingOperator = null;
let adId = 0;
let calculatorBlocked = false;
let keyOrder = [
  { label: "C", type: "clear" },
  { label: "/", type: "operator", value: "/" },
  { label: "×", type: "operator", value: "×" },
  { label: "-", type: "operator", value: "-" },
  { label: "7", type: "digit", value: "7" },
  { label: "8", type: "digit", value: "8" },
  { label: "9", type: "digit", value: "9" },
  { label: "4", type: "digit", value: "4" },
  { label: "5", type: "digit", value: "5" },
  { label: "6", type: "digit", value: "6" },
  { label: "1", type: "digit", value: "1" },
  { label: "2", type: "digit", value: "2" },
  { label: "3", type: "digit", value: "3" },
  { label: "0", type: "digit", value: "0" },
  { label: "+", type: "operator", value: "+" },
  { label: "=", type: "equals" },
];

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
  if (CONFIG.SATIRE_MODE_ENABLED && CONFIG.ADS_ON_DIGIT_ENABLED) {
    createAdPopup("digit");
  }
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

function shuffleKeys() {
  const shuffled = [...keyOrder];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  keyOrder = shuffled;
  renderCalculatorKeys();
}

function createKeyButton(key) {
  const className = key.type === "equals" ? "key-equals" : "";
  const valueAttribute = key.value ? ` data-value="${key.value}"` : "";
  return `<button type="button" class="${className}" data-key-type="${key.type}"${valueAttribute}>${key.label}</button>`;
}

function renderCalculatorKeys() {
  const keypad = document.querySelector("[data-keypad]");
  if (!keypad) return;
  keypad.innerHTML = keyOrder.map(createKeyButton).join("");
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
  node.setAttribute("aria-label", `Annonce sponsorisée ${ad.title}`);
  node.innerHTML = `
    <div class="ad-popin__chrome">
      <span>${ad.brand}</span>
      <button type="button" aria-label="Fermer cette publicité" data-close-ad>×</button>
    </div>
    <div class="ad-popin__visual" aria-hidden="true">
      <strong>${ad.tag}</strong>
      <span></span>
    </div>
    <p class="ad-popin__label">Sponsorisé · Offre limitée</p>
    <h3>${ad.title}</h3>
    <p>${ad.body}</p>
    <button type="button" data-ad-action>${ad.cta}</button>
    <small>${reason === "automatic" ? "Suggestion personnalisée" : "Recommandation contextuelle"}</small>
  `;

  node.querySelector("[data-close-ad]").addEventListener("click", () => {
    node.remove();
  });

  node.querySelector("[data-ad-action]").addEventListener("click", openDemoTab);
  layer.append(node);
}

function createStaticAd(text, index) {
  return `
    <article class="static-ad static-ad--${index % 4}">
      <span>${text.brand}</span>
      <strong>${text.title}</strong>
      <p>${text.body}</p>
      <div>
        <em>${text.price}</em>
        <button type="button">Voir</button>
      </div>
      <small>${text.meta}</small>
    </article>
  `;
}

function renderApp() {
  const app = document.querySelector("#app");
  const staticAds = [
    {
      brand: "NovaBank",
      title: "Prêt personnel express",
      body: "Réponse immédiate pour vos projets.",
      price: "TAEG dès 3,9%",
      meta: "Sous conditions",
    },
    {
      brand: "Helio Mobile",
      title: "Forfait 5G 180 Go",
      body: "Activation en quelques minutes.",
      price: "9,99 €/mois",
      meta: "Série limitée",
    },
    {
      brand: "CasaFlex",
      title: "Canapé modulable",
      body: "Livraison rapide et garantie confort.",
      price: "-35%",
      meta: "Jusqu'à dimanche",
    },
    {
      brand: "Triply",
      title: "Week-ends urbains",
      body: "Hôtels bien notés, annulation flexible.",
      price: "dès 49 €",
      meta: "Places limitées",
    },
    {
      brand: "FitMeal",
      title: "Menus protéinés",
      body: "Repas prêts à consommer livrés chez vous.",
      price: "6,40 €/repas",
      meta: "Sans engagement",
    },
    {
      brand: "ZenDrive",
      title: "Assurance auto flexible",
      body: "Contrat en ligne avec assistance 24/7.",
      price: "dès 18 €/mois",
      meta: "Devis immédiat",
    },
    {
      brand: "Cloudly",
      title: "Stockage sécurisé 2 To",
      body: "Sauvegarde automatique multi-appareils.",
      price: "4,99 €/mois",
      meta: "Essai 30 jours",
    },
    {
      brand: "Prime Access",
      title: "Résultat prioritaire",
      body: "Accédez aux réponses sans attente.",
      price: "99,99 €",
      meta: "Offre premium",
    },
  ];

  app.innerHTML = `
    <main class="page-shell">
      <header class="site-header">
        <div>
          <p class="eyebrow">Prime Calc</p>
          <h1>La calculatrice qui vend avant de calculer</h1>
        </div>
        <p class="satire-notice">Démonstration UX satirique. Aucune transaction, aucune régie externe, aucun tracking.</p>
      </header>

      <aside class="ad-rail ad-rail--left" aria-label="Publicités gauche">
        ${staticAds.slice(0, 4).map(createStaticAd).join("")}
      </aside>

      <section class="calculator-zone" aria-label="Calculatrice satirique">
        <div class="background-ads" aria-hidden="true">
          ${staticAds.map((ad) => `<span>${ad.brand} · ${ad.price}</span>`).join("")}
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
          <div class="calculator__keys" aria-label="Clavier de calculatrice" data-keypad></div>
        </div>
      </section>

      <aside class="ad-rail ad-rail--right" aria-label="Publicités droite">
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
      <p>Accès prioritaire au résultat avec traitement premium. Aucune donnée bancaire n'est demandée dans cette démonstration.</p>
      <div class="fake-card" aria-hidden="true">
        <span>PRIME PAYWALL</span>
        <strong>99,99 €</strong>
      </div>
      <div class="modal-actions">
        <button type="button" data-payment-accept>Refuser l'accès premium</button>
        <button type="button" data-payment-cancel>Annuler</button>
      </div>
    </dialog>
  `;
}

function bindEvents() {
  document.querySelector("[data-keypad]").addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;

    if (button.dataset.keyType === "digit") {
      inputDigit(button.dataset.value);
      return;
    }

    if (button.dataset.keyType === "operator") {
      selectOperator(button.dataset.value);
      return;
    }

    if (button.dataset.keyType === "clear") {
      clearCalculator();
      return;
    }

    if (button.dataset.keyType === "equals") {
      showPaymentModal();
    }
  });

  document.querySelector("[data-payment-close]").addEventListener("click", () => closePaymentModal());
  document.querySelector("[data-payment-accept]").addEventListener("click", () => closePaymentModal());
  document.querySelector("[data-payment-cancel]").addEventListener("click", () => closePaymentModal({ cancelClicked: true }));
  document.querySelector("[data-payment-modal]").addEventListener("cancel", (event) => {
    event.preventDefault();
    closePaymentModal();
  });
}

renderApp();
renderCalculatorKeys();
bindEvents();
updateDisplay();

if (CONFIG.SATIRE_MODE_ENABLED && CONFIG.ADS_LOOP_ENABLED) {
  window.setInterval(() => createAdPopup("automatic"), CONFIG.AUTO_AD_INTERVAL_MS);
}

window.setInterval(shuffleKeys, CONFIG.KEY_SHUFFLE_INTERVAL_MS);
