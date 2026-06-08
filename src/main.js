import "./styles.css";
import rickrollImage from "./assets/rickroll-young-rick.jpg";

const CONFIG = {
  DEMO_REDIRECT_URL: "https://coutdesretraites.fr/",
  SATIRE_MODE_ENABLED: true,
  ADS_LOOP_ENABLED: true,
  ADS_ON_DIGIT_ENABLED: true,
  AUTO_AD_INTERVAL_MS: 5000,
  KEY_SHUFFLE_INTERVAL_MS: 5000,
};

const adMessages = [
  {
    brand: "NitroLink",
    title: "Clique pour 9 boosts gratuits (promis juré)",
    body: "Ton calcul est en file d'attente car le bot modérateur spamme des gifs dans #general.",
    cta: "Réclamer le boost maudit",
    tag: "#general",
  },
  {
    brand: "RaidShield 0.1",
    title: "Votre calcul a été signalé par 14 alt accounts",
    body: "Veuillez résoudre ce captcha émotionnel avant de multiplier quoi que ce soit.",
    cta: "Prouver que je suis admin",
    tag: "MOD",
  },
  {
    brand: "RatioBot",
    title: "Ton résultat s'est pris un ratio monumental",
    body: "La réponse sera floutée jusqu'à ce que tu acceptes les conditions du meme.",
    cta: "Envoyer un sticker gênant",
    tag: "RATIO",
  },
  {
    brand: "PingMaster",
    title: "@everyone ton calcul est prêt mais pas vraiment",
    body: "Chaque clic ajoute trois notifications et une promesse vague de Nitro.",
    cta: "Ping tout le serveur",
    tag: "PING",
  },
  {
    brand: "LowEffortAI",
    title: "Calcul généré par un bot de niveau 2",
    body: "La précision dépend de l'humeur du salon vocal et de la qualité du micro.",
    cta: "Lancer le soundboard",
    tag: "BOT",
  },
];

const rickMemeCards = [
  {
    caption: "Never gonna give you up",
    punchline: "Ton resultat aussi ne va jamais arriver",
  },
  {
    caption: "Rickroll premium",
    punchline: "Le bouton egalite cache encore un refrain",
  },
  {
    caption: "1987 called",
    punchline: "Il veut recuperer ta calculatrice",
  },
];

let currentInput = "0";
let storedValue = null;
let pendingOperator = null;
let shouldResetInput = false;
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
  currentInput = currentInput === "0" || shouldResetInput ? digit : `${currentInput}${digit}`;
  shouldResetInput = false;
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
  shouldResetInput = false;
  updateDisplay();
}

function calculateResult() {
  if (!pendingOperator || storedValue === null) return Number(currentInput);

  const currentValue = Number(currentInput);

  switch (pendingOperator) {
    case "+":
      return storedValue + currentValue;
    case "-":
      return storedValue - currentValue;
    case "×":
      return storedValue * currentValue;
    case "/":
      return currentValue === 0 ? "Erreur" : storedValue / currentValue;
    default:
      return currentValue;
  }
}

function selectOperator(operator) {
  if (calculatorBlocked) return;
  if (pendingOperator && !shouldResetInput) {
    const result = calculateResult();
    currentInput = formatDisplayValue(result);
  }

  storedValue = Number(currentInput);
  pendingOperator = operator;
  shouldResetInput = true;
  updateDisplay();

  if (CONFIG.SATIRE_MODE_ENABLED) {
    createAdPopup("operator");
    openDemoTab();
  }
}

function showPaymentModal() {
  if (calculatorBlocked) return;
  const result = calculateResult();
  currentInput = formatDisplayValue(result);
  storedValue = null;
  pendingOperator = null;
  shouldResetInput = true;
  updateDisplay();
  document.querySelector("[data-payment-modal]").showModal();
}

function blockCalculator() {
  calculatorBlocked = true;
  pendingOperator = null;
  shouldResetInput = false;
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
      <img src="${rickrollImage}" alt="">
      <strong>${ad.tag}</strong>
      <span>RICKROLL</span>
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

function createRickMemeCard(meme, index) {
  return `
    <article class="rick-meme rick-meme--${index % 3}">
      <img src="${rickrollImage}" alt="Rick Astley jeune dans le meme Rickroll">
      <div>
        <span>meme internet certifie</span>
        <strong>${meme.caption}</strong>
        <p>${meme.punchline}</p>
      </div>
    </article>
  `;
}

function createStaticAd(text, index) {
  return `
    <article class="static-ad static-ad--${index % 4}">
      <img class="static-ad__meme" src="${rickrollImage}" alt="Rick Astley jeune style Rickroll">
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
      brand: "NitroLink",
      title: "Nitro pas suspect",
      body: "Un lien bleu, zéro regret.",
      price: "0,00 €*",
      meta: "*sauf dignité",
    },
    {
      brand: "PingMaster",
      title: "@everyone premium",
      body: "Plus de bruit, moins de maths.",
      price: "999 pings",
      meta: "Mute impossible",
    },
    {
      brand: "RatioBot",
      title: "Pack ratio",
      body: "Transforme 2+2 en débat.",
      price: "-404%",
      meta: "Avis mitigé",
    },
    {
      brand: "ModoMall",
      title: "Badge admin faux",
      body: "Pouvoir imaginaire inclus.",
      price: "13 rôles",
      meta: "Kick non inclus",
    },
    {
      brand: "MemeAudit",
      title: "Sticker jaune fluo",
      body: "Aucun contexte, gros impact.",
      price: "xD",
      meta: "Cringe assumé",
    },
    {
      brand: "VoiceLag",
      title: "Micro saturé",
      body: "Le résultat coupe toutes les 2 secondes.",
      price: "128 kbps",
      meta: "Echo garanti",
    },
    {
      brand: "AltFarm",
      title: "Comptes niveau 1",
      body: "Pour voter contre la soustraction.",
      price: "x37",
      meta: "Suspect",
    },
    {
      brand: "Prime Calc",
      title: "Résultat flouté",
      body: "Débloque la vérité, ou pas.",
      price: "99,99 €",
      meta: "Paywall troll",
    },
  ];

  app.innerHTML = `
    <main class="page-shell">
      <header class="top-lock-ad" aria-label="Publicité impossible à fermer">
        <div class="top-lock-ad__badge">TROLL<br>MODE</div>
        <div class="top-lock-ad__content">
          <p class="eyebrow">Discord calculator raid edition</p>
          <h1>@everyone cette calculatrice est maintenant moche exprès</h1>
          <p>Le calcul reprendra après 12 pings, 4 popups, un faux Nitro et une dispute inutile dans #maths.</p>
        </div>
        <div class="top-lock-ad__deal">
          <img src="${rickrollImage}" alt="Rick Astley jeune, meme Rickroll">
          <span>Boost maudit</span>
          <strong>LOL</strong>
          <button type="button" data-top-ad-action>SPAMMER</button>
          <small>Fermeture réservée aux modos</small>
        </div>
      </header>

      <aside class="ad-rail ad-rail--left" aria-label="Publicités gauche">
        ${staticAds.slice(0, 4).map(createStaticAd).join("")}
      </aside>

      <section class="calculator-zone" aria-label="Calculatrice satirique">
        <div class="background-ads" aria-hidden="true">
          ${staticAds.map((ad) => `<span>${ad.brand} · ${ad.price}</span>`).join("")}
        </div>
        <div class="rick-meme-strip" aria-label="Memes Rick Astley">
          ${rickMemeCards.map(createRickMemeCard).join("")}
        </div>
        <div class="calculator" data-calculator>
          <div class="blocked-overlay">
            <strong>RATIO + BLOQUÉ</strong>
            <span>Le bot a décidé que ton résultat manquait de vibes Discord.</span>
          </div>
          <div class="calculator__brand">
            <span>Prime Calc</span>
            <small>@everyone edition</small>
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
        <p class="asset-credit">Image meme Rickroll: thumbnail de la video officielle "Never Gonna Give You Up".</p>
      </footer>
    </main>

    <div class="ad-layer" data-ad-layer aria-live="polite"></div>

    <dialog class="payment-modal" data-payment-modal aria-labelledby="payment-title">
      <button class="modal-close" type="button" data-payment-close aria-label="Fermer le paywall">×</button>
      <p class="eyebrow">Résultat presque disponible</p>
      <h2 id="payment-title">Débloque le calcul avec Nitro Ultra Fake</h2>
      <p>Le salon #resultats est privé. Pour entrer, accepte un paywall qui ressemble volontairement à une mauvaise blague.</p>
      <div class="fake-card" aria-hidden="true">
        <span>NITRO ULTRA FAKE</span>
        <strong>99 pings</strong>
      </div>
      <div class="modal-actions">
        <button type="button" data-payment-accept>Refuser et me faire ratio</button>
        <button type="button" data-payment-cancel>Alt+F4 émotionnel</button>
      </div>
    </dialog>
  `;
}

function bindEvents() {
  document.querySelector("[data-top-ad-action]").addEventListener("click", () => {
    createAdPopup("operator");
    openDemoTab();
  });

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
