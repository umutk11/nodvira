const routes = {
  home: "index.html",
  about: "hakkimda.html",
  services: "hizmetler.html",
  solutions: "cozumler.html",
  projects: "projeler.html",
  blog: "blog.html",
  faq: "sss.html",
  contact: "iletisim.html",
  web: "web-tasarim.html",
  network: "network.html",
  software: "yazilim-cozumleri.html",
  system: "sistem-cozumleri.html",
  caseStudy: "referans-detay.html"
};

let page = document.body.dataset.page || "";

const serviceNavItems = [
  ["dijital-cozumler", "Web Çözümleri", "Kurumsal web, UI/UX, responsive ve performans", routes.web],
  ["yazilim-cozumleri", "Yazılım Çözümleri", "Özel yazılım, otomasyon ve entegrasyon", routes.software],
  ["network-ag", "Network Çözümleri", "LAN/WAN, kablosuz ağ ve ölçeklenebilir mimari", routes.network],
  ["sistem-yonetimi", "Sistem Çözümleri", "Sunucu, sanallaştırma ve modernizasyon", routes.system],
  ["danismanlik-proje", "Teknoloji Danışmanlığı", "Analiz, strateji, mimari ve yol haritası", routes.solutions]
];

function headerMarkup() {
  const nav = [
    ["home", "Ana Sayfa"], ["services", "Hizmetlerimiz"], ["projects", "Referanslarımız"],
    ["about", "Hakkımızda"], ["blog", "Blog"], ["faq", "SSS"], ["contact", "İletişim"]
  ];
  const desktopLinks = nav.map(([key, label]) => {
    const active = page === key ? "active" : "";
    const current = page === key ? 'aria-current="page"' : "";
    if (key !== "services") return `<a data-nav-link data-page-key="${key}" href="${routes[key]}" class="nav-link ${active}" ${current}>${label}</a>`;
    const serviceLinks = serviceNavItems.map(([, title, description, destination], index) => `<a class="mega-service" href="${destination}"><span class="mega-number">0${index + 1}</span><span><strong>${title}</strong><small>${description}</small></span><span class="mega-arrow" aria-hidden="true">↗</span></a>`).join("");
    return `<div class="nav-services"><a data-nav-link data-page-key="services" href="${routes.services}" class="nav-link service-trigger ${active}" ${current} aria-haspopup="true">${label}<img class="nav-chevron" src="assets/icons/chevron-down.svg" alt="" aria-hidden="true"></a><div class="mega-menu"><div class="mega-grid"><div><div class="mega-label">HİZMET KATALOĞU</div><div class="mega-services">${serviceLinks}</div></div><aside class="mega-feature"><h3>Teknolojiyi iş hedefleriniz için birlikte kurgulayalım.</h3><p>İhtiyacınızın hangi hizmet alanına girdiğinden emin değilseniz ilk görüşmede kapsamı netleştirebiliriz.</p><a class="btn btn-primary" href="${routes.contact}">İhtiyacınızı Anlatın →</a></aside></div></div></div>`;
  }).join("");
  const mobileLinks = `<a data-page-key="home" href="${routes.home}" class="${page === "home" ? "active" : ""}">Ana Sayfa</a><div class="mobile-service-group"><div class="mobile-service-row"><a data-page-key="services" href="${routes.services}" class="${page === "services" ? "active" : ""}">Hizmetlerimiz</a><button class="mobile-service-toggle" type="button" aria-label="Hizmet alt menüsünü aç" aria-expanded="false" aria-controls="mobile-services"><img src="assets/icons/chevron-down.svg" alt="" aria-hidden="true"></button></div><div class="mobile-services" id="mobile-services">${serviceNavItems.map(([, title, , destination]) => `<a href="${destination}">${title}</a>`).join("")}</div></div><a data-page-key="projects" href="${routes.projects}" class="${page === "projects" ? "active" : ""}">Referanslarımız</a><a data-page-key="about" href="${routes.about}" class="${page === "about" ? "active" : ""}">Hakkımızda</a><a data-page-key="blog" href="${routes.blog}" class="${page === "blog" ? "active" : ""}">Blog</a><a data-page-key="faq" href="${routes.faq}" class="${page === "faq" ? "active" : ""}">SSS</a><a data-page-key="contact" href="${routes.contact}" class="${page === "contact" ? "active" : ""}">İletişim</a>`;
  return `<header class="site-header"><div class="container header-inner">
    <a class="brand header-brand" href="${routes.home}" aria-label="NODVIRA ana sayfa"><img class="brand-symbol" src="assets/brand/nodvira-icon.png" alt=""><img class="brand-wordmark" src="assets/brand/nodvira-wordmark-light.png" alt=""></a>
    <nav class="desktop-nav" aria-label="Ana navigasyon">${desktopLinks}<span class="nav-active-line" aria-hidden="true"></span></nav>
    <div class="header-actions"><a class="btn btn-primary header-cta" href="${routes.contact}"><span>Projenizi Konuşalım</span><span class="cta-arrow" aria-hidden="true">→</span></a><button class="menu-toggle" type="button" aria-label="Menüyü aç" aria-expanded="false" aria-controls="mobile-menu"><span></span></button></div>
  </div></header><div class="mobile-panel" id="mobile-menu" aria-hidden="true"><div class="mobile-menu-inner"><nav class="mobile-nav" aria-label="Mobil navigasyon">${mobileLinks}</nav><div class="mobile-contact"><span>PROJENİZİ BİRLİKTE DEĞERLENDİRELİM</span><a class="btn btn-primary" href="${routes.contact}">Projenizi Konuşalım →</a><a class="mobile-mail" href="mailto:info@nodvira.com">info@nodvira.com</a></div></div></div>`;
}

function footerMarkup() {
  return `<footer class="site-footer"><div class="container">
    <div class="footer-grid">
      <div><a class="brand footer-brand" href="${routes.home}" aria-label="NODVIRA ana sayfa"><img class="brand-lockup" src="assets/brand/nodvira-logo-standard.png" alt=""></a><p class="muted" style="margin-top:18px;max-width:300px">Web, yazılım, network, sistem ve teknoloji danışmanlığını bütüncül çözümlerde bir araya getiren teknoloji çözüm ortağı.</p></div>
      <div><div class="footer-title">HİZMETLER</div><div class="footer-links"><a href="${routes.web}">Web Çözümleri</a><a href="${routes.software}">Yazılım Çözümleri</a><a href="${routes.network}">Network Çözümleri</a><a href="${routes.system}">Sistem Çözümleri</a><a href="${routes.solutions}">Teknoloji Danışmanlığı</a></div></div>
      <div><div class="footer-title">İLETİŞİM</div><div class="footer-links"><a href="mailto:info@nodvira.com">info@nodvira.com</a><a href="https://nodvira.com">nodvira.com</a></div></div>
      <div><div class="footer-title">KEŞFEDİN</div><div class="footer-links"><a href="${routes.about}">Hakkımızda</a><a href="${routes.projects}">Referanslarımız</a><a href="${routes.blog}">Blog</a><a href="${routes.faq}">Sıkça Sorulan Sorular</a><a href="${routes.contact}">İletişim</a></div></div>
    </div><div class="footer-bottom"><span>© 2026 NODVIRA. Tüm hakları saklıdır. · CONNECT • BUILD • EVOLVE</span></div>
  </div></footer>`;
}

document.getElementById("site-header").innerHTML = headerMarkup();
document.getElementById("site-footer").innerHTML = footerMarkup();

const toggle = document.querySelector(".menu-toggle");
const mobilePanel = document.getElementById("mobile-menu");
let menuReturnFocus = null;

function setMobileMenu(open) {
  if (!toggle || !mobilePanel) return;
  const wasOpen = toggle.getAttribute("aria-expanded") === "true";
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute("aria-label", open ? "Menüyü kapat" : "Menüyü aç");
  mobilePanel.setAttribute("aria-hidden", String(!open));
  mobilePanel.classList.toggle("open", open);
  document.body.classList.toggle("menu-open", open);
  if (open) {
    menuReturnFocus = document.activeElement;
    window.setTimeout(() => mobilePanel.querySelector("a")?.focus(), 180);
  } else if (wasOpen && menuReturnFocus instanceof HTMLElement) {
    menuReturnFocus.focus();
  }
}

toggle?.addEventListener("click", () => setMobileMenu(toggle.getAttribute("aria-expanded") !== "true"));

const mobileServiceToggle = document.querySelector(".mobile-service-toggle");
const mobileServices = document.getElementById("mobile-services");
mobileServiceToggle?.addEventListener("click", () => {
  const open = mobileServiceToggle.getAttribute("aria-expanded") === "true";
  mobileServiceToggle.setAttribute("aria-expanded", String(!open));
  mobileServiceToggle.setAttribute("aria-label", open ? "Hizmet alt menüsünü aç" : "Hizmet alt menüsünü kapat");
  mobileServices?.classList.toggle("open", !open);
});

mobilePanel?.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setMobileMenu(false)));

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && desktopServiceNav?.classList.contains("mega-open")) {
    event.preventDefault();
    setDesktopServiceMenu(false, { blur: true });
    return;
  }
  if (!mobilePanel?.classList.contains("open")) return;
  if (event.key === "Escape") {
    event.preventDefault();
    setMobileMenu(false);
    return;
  }
  if (event.key !== "Tab") return;
  const focusable = [...mobilePanel.querySelectorAll('a[href], button:not([disabled])')].filter((item) => item.offsetParent !== null && !item.closest('[aria-hidden="true"]'));
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
});

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const precisePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
const desktopNav = document.querySelector(".desktop-nav");
const navActiveLine = document.querySelector(".nav-active-line");
const desktopServiceNav = document.querySelector(".nav-services");
const desktopServiceTrigger = document.querySelector(".service-trigger");

function setDesktopServiceMenu(open, { blur = false } = {}) {
  if (!desktopServiceNav || !desktopServiceTrigger) return;
  desktopServiceNav.classList.toggle("mega-open", open);
  desktopServiceTrigger.setAttribute("aria-expanded", String(open));
  if (blur && desktopServiceNav.contains(document.activeElement) && document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
}

desktopServiceNav?.addEventListener("pointerenter", () => {
  if (precisePointer.matches) setDesktopServiceMenu(true);
});
desktopServiceTrigger?.setAttribute("aria-expanded", "false");
desktopServiceNav?.addEventListener("pointerleave", () => setDesktopServiceMenu(false));
desktopServiceNav?.addEventListener("focusin", () => setDesktopServiceMenu(true));
desktopServiceNav?.addEventListener("focusout", () => {
  requestAnimationFrame(() => {
    if (!desktopServiceNav.contains(document.activeElement)) setDesktopServiceMenu(false);
  });
});

function positionActiveLine(target, animate = true) {
  if (!desktopNav || !navActiveLine || desktopNav.offsetWidth === 0) return;
  if (!target) {
    navActiveLine.classList.remove("ready");
    return;
  }
  const navRect = desktopNav.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();
  if (!animate) navActiveLine.classList.remove("ready");
  navActiveLine.style.setProperty("--line-x", `${targetRect.left - navRect.left + 13}px`);
  navActiveLine.style.setProperty("--line-width", `${Math.max(targetRect.width - 26, 0)}px`);
  requestAnimationFrame(() => navActiveLine.classList.add("ready"));
}

function updateNavState(nextPage, animateLine = true) {
  page = nextPage;
  const servicePage = ["services", "web", "network", "software", "system"].includes(page);
  document.querySelectorAll("[data-page-key]").forEach((link) => {
    const selected = link.dataset.pageKey === page || (link.dataset.pageKey === "services" && servicePage);
    link.classList.toggle("active", selected);
    if (selected) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
  const activeDesktopLink = document.querySelector("[data-nav-link].active");
  positionActiveLine(activeDesktopLink, animateLine && !reducedMotion.matches);
}

window.addEventListener("resize", () => {
  positionActiveLine(document.querySelector("[data-nav-link].active"), false);
  if (window.innerWidth > 1199) setMobileMenu(false);
  else setDesktopServiceMenu(false, { blur: true });
});
requestAnimationFrame(() => updateNavState(page, false));

let renderedUrl = new URL(window.location.href);
let contentNavigation = false;

function writeHistory(destination, replace = false) {
  const method = replace ? "replaceState" : "pushState";
  const state = { siteShell: true, href: destination.href };
  if (window.location.protocol === "file:") history[method](state, "");
  else history[method](state, "", destination.href);
}

writeHistory(renderedUrl, true);

function updateDocumentMetadata(pageData) {
  document.title = pageData.title;
  const nextDescription = pageData.description;
  const currentDescription = document.querySelector('meta[name="description"]');
  if (nextDescription && currentDescription) currentDescription.content = nextDescription;
}

function getPageData(destination) {
  const pathname = decodeURIComponent(destination.pathname);
  const fileName = pathname.split("/").pop() || "index.html";
  return window.sitePages?.[fileName] || null;
}

function scrollToDestination(destination) {
  if (destination.hash) {
    let targetId = destination.hash.slice(1);
    try { targetId = decodeURIComponent(targetId); } catch (_) { /* Keep the encoded id as a fallback. */ }
    document.getElementById(targetId)?.scrollIntoView();
    return;
  }
  window.scrollTo({ top: 0, left: 0, behavior: "instant" });
}

async function navigatePage(destination, { push = true } = {}) {
  if (contentNavigation) return;
  const targetUrl = destination instanceof URL ? destination : new URL(destination, window.location.href);
  if (targetUrl.origin !== window.location.origin) return;
  setDesktopServiceMenu(false, { blur: true });

  const sameDocument = targetUrl.pathname === renderedUrl.pathname && targetUrl.search === renderedUrl.search;
  if (sameDocument) {
    if (push && targetUrl.href !== renderedUrl.href) writeHistory(targetUrl);
    renderedUrl = targetUrl;
    scrollToDestination(targetUrl);
    return;
  }

  const pageData = getPageData(targetUrl);
  if (!pageData) {
    console.error(`Uygulama içinde sayfa bulunamadı: ${targetUrl.pathname}`);
    return;
  }

  updateNavState(pageData.page);
  contentNavigation = true;
  const currentMain = document.querySelector("main.site-main");
  try {
    const nextDocument = new DOMParser().parseFromString(pageData.main, "text/html");
    const nextMain = nextDocument.querySelector("main.site-main");
    if (!nextMain || !currentMain) throw new Error("Sayfa içerik alanı bulunamadı.");

    currentMain.classList.add("page-content-leaving");
    if (!reducedMotion.matches) await new Promise((resolve) => window.setTimeout(resolve, 140));

    nextMain.classList.add("page-content-entering");
    currentMain.replaceWith(nextMain);
    document.body.dataset.page = pageData.page;
    updateDocumentMetadata(pageData);
    if (push) writeHistory(targetUrl);
    renderedUrl = targetUrl;
    initPageInteractions(nextMain);
    setMobileMenu(false);
    scrollToDestination(targetUrl);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      nextMain.classList.remove("page-content-entering");
    }));
  } catch (error) {
    currentMain?.classList.remove("page-content-leaving");
    updateNavState(document.body.dataset.page);
    console.error("Sayfa içeriği değiştirilemedi.", error);
  } finally {
    contentNavigation = false;
  }
}

document.addEventListener("click", (event) => {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const link = event.target.closest("a[href]");
  if (!link || link.hasAttribute("download") || (link.target && link.target !== "_self")) return;
  const rawHref = link.getAttribute("href");
  if (!rawHref || rawHref === "#") return;
  if (rawHref.startsWith("#")) {
    const target = document.getElementById(rawHref.slice(1));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: reducedMotion.matches ? "auto" : "smooth", block: "start" });
    const nextUrl = new URL(renderedUrl.href);
    nextUrl.hash = rawHref;
    renderedUrl = nextUrl;
    writeHistory(nextUrl, true);
    return;
  }
  const destination = new URL(link.href, window.location.href);
  if (!["http:", "https:", "file:"].includes(destination.protocol) || destination.origin !== window.location.origin) return;
  if (!getPageData(destination)) return;
  event.preventDefault();
  navigatePage(destination);
});

window.addEventListener("popstate", (event) => {
  const destination = event.state?.href ? new URL(event.state.href) : new URL(window.location.href);
  if (!getPageData(destination)) {
    window.location.href = destination.href;
    return;
  }
  navigatePage(destination, { push: false });
});

let scrollMotionObserver = null;
let scrollMotionMutation = null;

const motionItemSelector = [
  ".page-hero > .container",
  ".expertise-item",
  ".section-heading",
  ".section .card",
  ".section .process-step",
  ".home-methodology li",
  ".service-spectrum-statement",
  ".service-showcase-item",
  ".about-visual-stack",
  ".about-split > .visual-placeholder",
  ".about-copy",
  ".cta-panel",
  ".contact-card",
  ".form-card",
  ".quote",
  ".capability-accordion",
  ".project-process-diagram .diagram-step",
  ".project-route",
  ".project-route-step",
  ".section > .container > .btn-ghost",
  ".filter-row",
  ".case-showcase-item",
  ".case-method-steps li",
  ".case-chapter",
  ".case-technical",
  ".case-architecture > div",
  ".case-outcome",
  ".case-related-services",
  ".case-project-nav",
  ".faq-categories",
  ".value-editorial-item"
].join(", ");

function initScrollMotion(root) {
  scrollMotionObserver?.disconnect();
  scrollMotionMutation?.disconnect();
  scrollMotionObserver = null;
  scrollMotionMutation = null;

  const main = root.matches?.("main.site-main") ? root : root.querySelector?.("main.site-main");
  if (!main) return;

  const assignGroupDelays = () => {
    main.querySelectorAll(".grid-2, .grid-3, .grid-4, .expertise-list, .faq-list, .contact-cards, .home-methodology, .service-showcase-list, .project-process-diagram, .project-route, .case-showcase, .case-method-steps, .case-architecture, .values-editorial-list").forEach((group) => {
      [...group.children].forEach((item, index) => {
        item.style.setProperty("--reveal-delay", `${Math.min(index * 80, 320)}ms`);
      });
    });
  };

  const revealImmediately = reducedMotion.matches || !("IntersectionObserver" in window);

  if (!revealImmediately) {
    scrollMotionObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: .14, rootMargin: "0px 0px -6% 0px" });
  }

  const registerItems = () => {
    assignGroupDelays();
    main.querySelectorAll(motionItemSelector).forEach((item) => {
      if (item.classList.contains("motion-reveal")) return;
      item.classList.add("motion-reveal");
      if (revealImmediately) item.classList.add("is-visible");
      else scrollMotionObserver.observe(item);
    });
  };

  registerItems();

  if ("MutationObserver" in window) {
    scrollMotionMutation = new MutationObserver(registerItems);
    scrollMotionMutation.observe(main, { childList: true, subtree: true });
  }
}

const caseStudyOrder = ["web", "software", "network", "system", "consulting"];

const caseStudyData = {
  "web": {
    "title": "Kurumsal Web Deneyimi",
    "client": "Mock hizmet şirketi",
    "industry": "Profesyonel Hizmetler",
    "services": "Bilgi Mimarisi · UX · Front-end",
    "status": "Mock vaka çalışması",
    "code": "WEB / 01",
    "visualLabel": "Web deneyimi",
    "visualCaption": "Yer tutucu proje verisi",
    "summary": "Çok sayfalı bir hizmet yapısını ortak içerik modeli ve responsive bileşen sistemi altında birleştiren örnek web projesi.",
    "need": [
      "Bu bölüm, arayüzde uzun metin davranışını değerlendirmek için hazırlanmış sentetik problem açıklamasıdır. Herhangi bir gerçek kurum, kullanıcı, sistem veya proje bilgisi içermez.",
      "Mock senaryoda dağınık sorumluluklar, tutarsız uygulamalar ve ölçülemeyen operasyon adımları ortak problem çerçevesinde ele alınmaktadır."
    ],
    "approach": [
      "Örnek keşif çalışmasında kullanıcı ihtiyaçları, teknik bağımlılıklar ve öncelikli akışlar birlikte değerlendirilmiştir.",
      "Kapsam; arayüz incelemesinde farklı paragraf uzunluklarını ve içerik hiyerarşisini gösterecek şekilde modellenmiştir."
    ],
    "solution": [
      "Örnek çözüm; yeniden kullanılabilir bileşenler, açık sorumluluklar ve izlenebilir durumlar üzerine kurulmuştur.",
      "Teknik yaklaşım yalnızca tasarım yerleşimini göstermek amacıyla genelleştirilmiş, gerçek ürün ve altyapı ayrıntıları kullanılmamıştır."
    ],
    "technicalIntro": "Mock teknik mimari, detay sayfasındaki açıklama ve diyagram bileşenlerinin değerlendirilmesi için dört katmanda gösterilmektedir.",
    "architecture": [
      [
        "Deneyim Katmanı",
        "Responsive arayüz, erişilebilir etkileşimler ve ortak bileşen kuralları."
      ],
      [
        "Uygulama Katmanı",
        "Örnek iş akışları, roller ve doğrulama adımları."
      ],
      [
        "Veri Katmanı",
        "Sentetik veri modeli, ilişki kuralları ve durum kayıtları."
      ],
      [
        "Operasyon Katmanı",
        "Mock izleme, bakım ve iyileştirme yaklaşımı."
      ]
    ],
    "technicalNote": "Bu teknik anlatım yalnızca UI/UX revizyonu için hazırlanmış mock içeriktir.",
    "process": [
      [
        "Keşif",
        "Örnek ihtiyaçlar ve öncelikli kullanıcı akışları belirlenir."
      ],
      [
        "Modelleme",
        "İçerik, veri ve bileşen ilişkileri taslak hale getirilir."
      ],
      [
        "Prototip",
        "Kritik ekranlar ve etkileşimler örnek veriyle doğrulanır."
      ],
      [
        "Uygulama",
        "Arayüz ve teknik bileşenler kontrollü olarak geliştirilir."
      ],
      [
        "Değerlendirme",
        "Geri bildirimler yeni revizyonlara dönüştürülür."
      ]
    ],
    "outcomeLead": "Mock proje, tasarım ve içerik hiyerarşisinin gerçek veri paylaşılmadan incelenebilmesini sağlar.",
    "outcome": [
      "Bu sonuç bölümü, detay sayfasında birden fazla paragrafın, vurgulu metnin ve uzun içerik akışının nasıl göründüğünü değerlendirmek için hazırlanmıştır.",
      "Gerçek müşteri sonucu, ölçüm, ürün adı veya operasyon verisi kullanılmamıştır; tüm ifadeler sentetiktir."
    ],
    "related": [
      [
        "Web Çözümleri",
        "web-tasarim.html"
      ],
      [
        "Yazılım Çözümleri",
        "yazilim-cozumleri.html"
      ],
      [
        "Teknoloji Danışmanlığı",
        "cozumler.html"
      ]
    ]
  },
  "software": {
    "title": "Süreç Takip Uygulaması",
    "client": "Mock operasyon ekibi",
    "industry": "Operasyon Yönetimi",
    "services": "İş Analizi · Web Uygulaması · Entegrasyon",
    "status": "Mock vaka çalışması",
    "code": "SOFT / 02",
    "visualLabel": "Operasyon uygulaması",
    "visualCaption": "Yer tutucu proje verisi",
    "summary": "Dağınık görevleri, istisnaları ve durum takibini ortak bir uygulamada toplayan örnek yazılım projesi.",
    "need": [
      "Bu bölüm, arayüzde uzun metin davranışını değerlendirmek için hazırlanmış sentetik problem açıklamasıdır. Herhangi bir gerçek kurum, kullanıcı, sistem veya proje bilgisi içermez.",
      "Mock senaryoda dağınık sorumluluklar, tutarsız uygulamalar ve ölçülemeyen operasyon adımları ortak problem çerçevesinde ele alınmaktadır."
    ],
    "approach": [
      "Örnek keşif çalışmasında kullanıcı ihtiyaçları, teknik bağımlılıklar ve öncelikli akışlar birlikte değerlendirilmiştir.",
      "Kapsam; arayüz incelemesinde farklı paragraf uzunluklarını ve içerik hiyerarşisini gösterecek şekilde modellenmiştir."
    ],
    "solution": [
      "Örnek çözüm; yeniden kullanılabilir bileşenler, açık sorumluluklar ve izlenebilir durumlar üzerine kurulmuştur.",
      "Teknik yaklaşım yalnızca tasarım yerleşimini göstermek amacıyla genelleştirilmiş, gerçek ürün ve altyapı ayrıntıları kullanılmamıştır."
    ],
    "technicalIntro": "Mock teknik mimari, detay sayfasındaki açıklama ve diyagram bileşenlerinin değerlendirilmesi için dört katmanda gösterilmektedir.",
    "architecture": [
      [
        "Deneyim Katmanı",
        "Responsive arayüz, erişilebilir etkileşimler ve ortak bileşen kuralları."
      ],
      [
        "Uygulama Katmanı",
        "Örnek iş akışları, roller ve doğrulama adımları."
      ],
      [
        "Veri Katmanı",
        "Sentetik veri modeli, ilişki kuralları ve durum kayıtları."
      ],
      [
        "Operasyon Katmanı",
        "Mock izleme, bakım ve iyileştirme yaklaşımı."
      ]
    ],
    "technicalNote": "Bu teknik anlatım yalnızca UI/UX revizyonu için hazırlanmış mock içeriktir.",
    "process": [
      [
        "Keşif",
        "Örnek ihtiyaçlar ve öncelikli kullanıcı akışları belirlenir."
      ],
      [
        "Modelleme",
        "İçerik, veri ve bileşen ilişkileri taslak hale getirilir."
      ],
      [
        "Prototip",
        "Kritik ekranlar ve etkileşimler örnek veriyle doğrulanır."
      ],
      [
        "Uygulama",
        "Arayüz ve teknik bileşenler kontrollü olarak geliştirilir."
      ],
      [
        "Değerlendirme",
        "Geri bildirimler yeni revizyonlara dönüştürülür."
      ]
    ],
    "outcomeLead": "Mock proje, tasarım ve içerik hiyerarşisinin gerçek veri paylaşılmadan incelenebilmesini sağlar.",
    "outcome": [
      "Bu sonuç bölümü, detay sayfasında birden fazla paragrafın, vurgulu metnin ve uzun içerik akışının nasıl göründüğünü değerlendirmek için hazırlanmıştır.",
      "Gerçek müşteri sonucu, ölçüm, ürün adı veya operasyon verisi kullanılmamıştır; tüm ifadeler sentetiktir."
    ],
    "related": [
      [
        "Web Çözümleri",
        "web-tasarim.html"
      ],
      [
        "Yazılım Çözümleri",
        "yazilim-cozumleri.html"
      ],
      [
        "Teknoloji Danışmanlığı",
        "cozumler.html"
      ]
    ]
  },
  "network": {
    "title": "Ağ Standardizasyonu",
    "client": "Mock çok lokasyonlu yapı",
    "industry": "Dağıtık Operasyon",
    "services": "LAN/WAN · Wi-Fi · Segmentasyon",
    "status": "Mock vaka çalışması",
    "code": "NET / 03",
    "visualLabel": "Network mimarisi",
    "visualCaption": "Yer tutucu proje verisi",
    "summary": "Farklı lokasyonları ortak segmentasyon ve izleme standartlarında buluşturan örnek network projesi.",
    "need": [
      "Bu bölüm, arayüzde uzun metin davranışını değerlendirmek için hazırlanmış sentetik problem açıklamasıdır. Herhangi bir gerçek kurum, kullanıcı, sistem veya proje bilgisi içermez.",
      "Mock senaryoda dağınık sorumluluklar, tutarsız uygulamalar ve ölçülemeyen operasyon adımları ortak problem çerçevesinde ele alınmaktadır."
    ],
    "approach": [
      "Örnek keşif çalışmasında kullanıcı ihtiyaçları, teknik bağımlılıklar ve öncelikli akışlar birlikte değerlendirilmiştir.",
      "Kapsam; arayüz incelemesinde farklı paragraf uzunluklarını ve içerik hiyerarşisini gösterecek şekilde modellenmiştir."
    ],
    "solution": [
      "Örnek çözüm; yeniden kullanılabilir bileşenler, açık sorumluluklar ve izlenebilir durumlar üzerine kurulmuştur.",
      "Teknik yaklaşım yalnızca tasarım yerleşimini göstermek amacıyla genelleştirilmiş, gerçek ürün ve altyapı ayrıntıları kullanılmamıştır."
    ],
    "technicalIntro": "Mock teknik mimari, detay sayfasındaki açıklama ve diyagram bileşenlerinin değerlendirilmesi için dört katmanda gösterilmektedir.",
    "architecture": [
      [
        "Deneyim Katmanı",
        "Responsive arayüz, erişilebilir etkileşimler ve ortak bileşen kuralları."
      ],
      [
        "Uygulama Katmanı",
        "Örnek iş akışları, roller ve doğrulama adımları."
      ],
      [
        "Veri Katmanı",
        "Sentetik veri modeli, ilişki kuralları ve durum kayıtları."
      ],
      [
        "Operasyon Katmanı",
        "Mock izleme, bakım ve iyileştirme yaklaşımı."
      ]
    ],
    "technicalNote": "Bu teknik anlatım yalnızca UI/UX revizyonu için hazırlanmış mock içeriktir.",
    "process": [
      [
        "Keşif",
        "Örnek ihtiyaçlar ve öncelikli kullanıcı akışları belirlenir."
      ],
      [
        "Modelleme",
        "İçerik, veri ve bileşen ilişkileri taslak hale getirilir."
      ],
      [
        "Prototip",
        "Kritik ekranlar ve etkileşimler örnek veriyle doğrulanır."
      ],
      [
        "Uygulama",
        "Arayüz ve teknik bileşenler kontrollü olarak geliştirilir."
      ],
      [
        "Değerlendirme",
        "Geri bildirimler yeni revizyonlara dönüştürülür."
      ]
    ],
    "outcomeLead": "Mock proje, tasarım ve içerik hiyerarşisinin gerçek veri paylaşılmadan incelenebilmesini sağlar.",
    "outcome": [
      "Bu sonuç bölümü, detay sayfasında birden fazla paragrafın, vurgulu metnin ve uzun içerik akışının nasıl göründüğünü değerlendirmek için hazırlanmıştır.",
      "Gerçek müşteri sonucu, ölçüm, ürün adı veya operasyon verisi kullanılmamıştır; tüm ifadeler sentetiktir."
    ],
    "related": [
      [
        "Web Çözümleri",
        "web-tasarim.html"
      ],
      [
        "Yazılım Çözümleri",
        "yazilim-cozumleri.html"
      ],
      [
        "Teknoloji Danışmanlığı",
        "cozumler.html"
      ]
    ]
  },
  "system": {
    "title": "Sistem Modernizasyonu",
    "client": "Mock üretim kuruluşu",
    "industry": "Üretim",
    "services": "Sanallaştırma · Yedekleme · İzleme",
    "status": "Mock vaka çalışması",
    "code": "SYS / 04",
    "visualLabel": "Sistem altyapısı",
    "visualCaption": "Yer tutucu proje verisi",
    "summary": "Eski iş yüklerini yönetilebilir altyapı ve doğrulanabilir yedekleme modeline taşıyan örnek sistem projesi.",
    "need": [
      "Bu bölüm, arayüzde uzun metin davranışını değerlendirmek için hazırlanmış sentetik problem açıklamasıdır. Herhangi bir gerçek kurum, kullanıcı, sistem veya proje bilgisi içermez.",
      "Mock senaryoda dağınık sorumluluklar, tutarsız uygulamalar ve ölçülemeyen operasyon adımları ortak problem çerçevesinde ele alınmaktadır."
    ],
    "approach": [
      "Örnek keşif çalışmasında kullanıcı ihtiyaçları, teknik bağımlılıklar ve öncelikli akışlar birlikte değerlendirilmiştir.",
      "Kapsam; arayüz incelemesinde farklı paragraf uzunluklarını ve içerik hiyerarşisini gösterecek şekilde modellenmiştir."
    ],
    "solution": [
      "Örnek çözüm; yeniden kullanılabilir bileşenler, açık sorumluluklar ve izlenebilir durumlar üzerine kurulmuştur.",
      "Teknik yaklaşım yalnızca tasarım yerleşimini göstermek amacıyla genelleştirilmiş, gerçek ürün ve altyapı ayrıntıları kullanılmamıştır."
    ],
    "technicalIntro": "Mock teknik mimari, detay sayfasındaki açıklama ve diyagram bileşenlerinin değerlendirilmesi için dört katmanda gösterilmektedir.",
    "architecture": [
      [
        "Deneyim Katmanı",
        "Responsive arayüz, erişilebilir etkileşimler ve ortak bileşen kuralları."
      ],
      [
        "Uygulama Katmanı",
        "Örnek iş akışları, roller ve doğrulama adımları."
      ],
      [
        "Veri Katmanı",
        "Sentetik veri modeli, ilişki kuralları ve durum kayıtları."
      ],
      [
        "Operasyon Katmanı",
        "Mock izleme, bakım ve iyileştirme yaklaşımı."
      ]
    ],
    "technicalNote": "Bu teknik anlatım yalnızca UI/UX revizyonu için hazırlanmış mock içeriktir.",
    "process": [
      [
        "Keşif",
        "Örnek ihtiyaçlar ve öncelikli kullanıcı akışları belirlenir."
      ],
      [
        "Modelleme",
        "İçerik, veri ve bileşen ilişkileri taslak hale getirilir."
      ],
      [
        "Prototip",
        "Kritik ekranlar ve etkileşimler örnek veriyle doğrulanır."
      ],
      [
        "Uygulama",
        "Arayüz ve teknik bileşenler kontrollü olarak geliştirilir."
      ],
      [
        "Değerlendirme",
        "Geri bildirimler yeni revizyonlara dönüştürülür."
      ]
    ],
    "outcomeLead": "Mock proje, tasarım ve içerik hiyerarşisinin gerçek veri paylaşılmadan incelenebilmesini sağlar.",
    "outcome": [
      "Bu sonuç bölümü, detay sayfasında birden fazla paragrafın, vurgulu metnin ve uzun içerik akışının nasıl göründüğünü değerlendirmek için hazırlanmıştır.",
      "Gerçek müşteri sonucu, ölçüm, ürün adı veya operasyon verisi kullanılmamıştır; tüm ifadeler sentetiktir."
    ],
    "related": [
      [
        "Web Çözümleri",
        "web-tasarim.html"
      ],
      [
        "Yazılım Çözümleri",
        "yazilim-cozumleri.html"
      ],
      [
        "Teknoloji Danışmanlığı",
        "cozumler.html"
      ]
    ]
  },
  "consulting": {
    "title": "Teknoloji Yol Haritası",
    "client": "Mock şirketler grubu",
    "industry": "Çok Şirketli Yapı",
    "services": "Mevcut Durum · Öncelik · Mimari Karar",
    "status": "Mock vaka çalışması",
    "code": "CONS / 05",
    "visualLabel": "Dönüşüm programı",
    "visualCaption": "Yer tutucu proje verisi",
    "summary": "Teknoloji taleplerini bağımlılık, risk ve iş değeri üzerinden sıralayan örnek danışmanlık çalışması.",
    "need": [
      "Bu bölüm, arayüzde uzun metin davranışını değerlendirmek için hazırlanmış sentetik problem açıklamasıdır. Herhangi bir gerçek kurum, kullanıcı, sistem veya proje bilgisi içermez.",
      "Mock senaryoda dağınık sorumluluklar, tutarsız uygulamalar ve ölçülemeyen operasyon adımları ortak problem çerçevesinde ele alınmaktadır."
    ],
    "approach": [
      "Örnek keşif çalışmasında kullanıcı ihtiyaçları, teknik bağımlılıklar ve öncelikli akışlar birlikte değerlendirilmiştir.",
      "Kapsam; arayüz incelemesinde farklı paragraf uzunluklarını ve içerik hiyerarşisini gösterecek şekilde modellenmiştir."
    ],
    "solution": [
      "Örnek çözüm; yeniden kullanılabilir bileşenler, açık sorumluluklar ve izlenebilir durumlar üzerine kurulmuştur.",
      "Teknik yaklaşım yalnızca tasarım yerleşimini göstermek amacıyla genelleştirilmiş, gerçek ürün ve altyapı ayrıntıları kullanılmamıştır."
    ],
    "technicalIntro": "Mock teknik mimari, detay sayfasındaki açıklama ve diyagram bileşenlerinin değerlendirilmesi için dört katmanda gösterilmektedir.",
    "architecture": [
      [
        "Deneyim Katmanı",
        "Responsive arayüz, erişilebilir etkileşimler ve ortak bileşen kuralları."
      ],
      [
        "Uygulama Katmanı",
        "Örnek iş akışları, roller ve doğrulama adımları."
      ],
      [
        "Veri Katmanı",
        "Sentetik veri modeli, ilişki kuralları ve durum kayıtları."
      ],
      [
        "Operasyon Katmanı",
        "Mock izleme, bakım ve iyileştirme yaklaşımı."
      ]
    ],
    "technicalNote": "Bu teknik anlatım yalnızca UI/UX revizyonu için hazırlanmış mock içeriktir.",
    "process": [
      [
        "Keşif",
        "Örnek ihtiyaçlar ve öncelikli kullanıcı akışları belirlenir."
      ],
      [
        "Modelleme",
        "İçerik, veri ve bileşen ilişkileri taslak hale getirilir."
      ],
      [
        "Prototip",
        "Kritik ekranlar ve etkileşimler örnek veriyle doğrulanır."
      ],
      [
        "Uygulama",
        "Arayüz ve teknik bileşenler kontrollü olarak geliştirilir."
      ],
      [
        "Değerlendirme",
        "Geri bildirimler yeni revizyonlara dönüştürülür."
      ]
    ],
    "outcomeLead": "Mock proje, tasarım ve içerik hiyerarşisinin gerçek veri paylaşılmadan incelenebilmesini sağlar.",
    "outcome": [
      "Bu sonuç bölümü, detay sayfasında birden fazla paragrafın, vurgulu metnin ve uzun içerik akışının nasıl göründüğünü değerlendirmek için hazırlanmıştır.",
      "Gerçek müşteri sonucu, ölçüm, ürün adı veya operasyon verisi kullanılmamıştır; tüm ifadeler sentetiktir."
    ],
    "related": [
      [
        "Web Çözümleri",
        "web-tasarim.html"
      ],
      [
        "Yazılım Çözümleri",
        "yazilim-cozumleri.html"
      ],
      [
        "Teknoloji Danışmanlığı",
        "cozumler.html"
      ]
    ]
  }
};

function applyCaseStudyData(root) {
  const title = root.querySelector("[data-case-title]");
  if (!title) return;

  const requestedKey = renderedUrl.searchParams.get("project") || "web";
  const key = caseStudyData[requestedKey] ? requestedKey : "web";
  const data = caseStudyData[key];
  const index = caseStudyOrder.indexOf(key);
  const previousKey = caseStudyOrder[(index - 1 + caseStudyOrder.length) % caseStudyOrder.length];
  const nextKey = caseStudyOrder[(index + 1) % caseStudyOrder.length];

  const values = {
    "[data-case-title]": data.title,
    "[data-case-current]": data.title,
    "[data-case-summary]": data.summary,
    "[data-case-client]": data.client,
    "[data-case-industry]": data.industry,
    "[data-case-services]": data.services,
    "[data-case-status]": data.status,
    "[data-case-code]": data.code,
    "[data-case-visual-label]": data.visualLabel,
    "[data-case-visual-caption]": data.visualCaption,
    "[data-case-technical-intro]": data.technicalIntro,
    "[data-case-technical-note]": data.technicalNote,
    "[data-case-outcome-lead]": data.outcomeLead
  };
  Object.entries(values).forEach(([selector, value]) => {
    const element = root.querySelector(selector);
    if (element) element.textContent = value;
  });

  const renderParagraphs = (selector, paragraphs) => {
    const container = root.querySelector(selector);
    if (!container) return;
    container.replaceChildren(...paragraphs.map((text) => {
      const paragraph = document.createElement("p");
      paragraph.textContent = text;
      return paragraph;
    }));
  };
  renderParagraphs("[data-case-need]", data.need);
  renderParagraphs("[data-case-approach]", data.approach);
  renderParagraphs("[data-case-solution]", data.solution);
  renderParagraphs("[data-case-outcome]", data.outcome);

  const architecture = root.querySelector("[data-case-architecture]");
  if (architecture) {
    architecture.replaceChildren(...data.architecture.map(([heading, description], itemIndex) => {
      const item = document.createElement("div");
      const number = document.createElement("span");
      const title = document.createElement("strong");
      const copy = document.createElement("p");
      number.textContent = String(itemIndex + 1).padStart(2, "0");
      title.textContent = heading;
      copy.textContent = description;
      item.append(number, title, copy);
      return item;
    }));
  }

  const process = root.querySelector("[data-case-process]");
  if (process) {
    process.replaceChildren(...data.process.map(([heading, description], itemIndex) => {
      const item = document.createElement("li");
      item.className = "diagram-step";
      const number = document.createElement("span");
      number.className = "diagram-step-number";
      number.textContent = String(itemIndex + 1).padStart(2, "0");
      const content = document.createElement("div");
      content.className = "diagram-step-content";
      const title = document.createElement("h3");
      const copy = document.createElement("p");
      title.textContent = heading;
      copy.textContent = description;
      content.append(title, copy);
      item.append(number, content);
      return item;
    }));
  }

  root.querySelectorAll("[data-case-related]").forEach((link, relatedIndex) => {
    const related = data.related[relatedIndex];
    if (!related) return;
    link.href = related[1];
    const label = link.querySelector("span");
    if (label) label.textContent = related[0];
  });

  const previousLink = root.querySelector("[data-case-previous]");
  const nextLink = root.querySelector("[data-case-next]");
  if (previousLink) {
    previousLink.href = `referans-detay.html?project=${previousKey}`;
    previousLink.querySelector("strong").textContent = caseStudyData[previousKey].title;
  }
  if (nextLink) {
    nextLink.href = `referans-detay.html?project=${nextKey}`;
    nextLink.querySelector("strong").textContent = caseStudyData[nextKey].title;
  }

  document.title = `${data.title} | NODVIRA`;
  const description = document.querySelector('meta[name="description"]');
  if (description) description.content = data.summary;
}

const servicePageContexts = {
  "web-tasarim.html": { project: "web", service: "Web Çözümleri" },
  "yazilim-cozumleri.html": { project: "software", service: "Yazılım Çözümleri" },
  "network.html": { project: "network", service: "Network Çözümleri" },
  "sistem-cozumleri.html": { project: "system", service: "Sistem Çözümleri" },
  "cozumler.html": { project: "consulting", service: "Teknoloji Danışmanlığı" }
};

function currentRenderedFile() {
  return decodeURIComponent(renderedUrl.pathname).split("/").pop() || "index.html";
}

function applyContextualLinks(root) {
  const contentRoot = root.matches?.("main.site-main") ? root : root.querySelector?.("main.site-main") || root;
  contentRoot.classList.toggle("case-navigation-page", Boolean(contentRoot.querySelector(".case-section-index")));
  if (currentRenderedFile() === "cozumler.html") {
    contentRoot.querySelectorAll(".process-step h3").forEach((heading) => {
      heading.textContent = heading.textContent.replace(/^0[1-6]\s+/, "");
    });
  }
  const context = servicePageContexts[currentRenderedFile()];
  if (context) {
    contentRoot.querySelectorAll('a[href="iletisim.html"]').forEach((link) => {
      link.href = `iletisim.html?hizmet=${context.project}`;
    });
    contentRoot.querySelectorAll('a[href="projeler.html"]').forEach((link) => {
      link.href = `projeler.html?filter=${context.project}`;
    });
    contentRoot.querySelectorAll('a[href="referans-detay.html"]').forEach((link) => {
      link.href = `referans-detay.html?project=${context.project}`;
    });
  }

  const faqDestinations = {
    about: "hakkimda.html",
    web: "web-tasarim.html",
    software: "yazilim-cozumleri.html",
    network: "network.html",
    system: "sistem-cozumleri.html",
    consulting: "cozumler.html",
    process: "hizmetler.html"
  };
  contentRoot.querySelectorAll(".faq-item[data-category]").forEach((item) => {
    const destination = faqDestinations[item.dataset.category];
    const link = item.querySelector('.faq-answer a[href="hizmetler.html"]');
    if (link && destination) link.href = destination;
  });

  contentRoot.querySelectorAll('a.btn-secondary[href^="mailto:"]').forEach((link) => {
    if (link.textContent.trim() === "Bize Ulaşın") link.textContent = "E-posta Gönderin";
  });

  contentRoot.querySelectorAll('a[href="#"]').forEach((link) => link.hidden = true);
  contentRoot.querySelectorAll(".pagination").forEach((pagination) => {
    const availableLinks = [...pagination.querySelectorAll("a")].some((link) => !link.hidden);
    if (!availableLinks) pagination.hidden = true;
  });
}

let caseNavigationObserver = null;

function initCaseSectionNavigation(root) {
  caseNavigationObserver?.disconnect();
  caseNavigationObserver = null;
  const navigation = root.querySelector?.(".case-section-index");
  if (!navigation) return;

  const links = [...navigation.querySelectorAll('a[href^="#"]')];
  const sections = links.map((link) => document.getElementById(link.hash.slice(1))).filter(Boolean);
  const setActiveSection = (id) => {
    links.forEach((link) => {
      const active = link.hash === `#${id}`;
      link.classList.toggle("active", active);
      if (active) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  };

  links.forEach((link) => {
    link.addEventListener("click", () => setActiveSection(link.hash.slice(1)));
  });
  if (sections[0]) setActiveSection(sections[0].id);

  if ("IntersectionObserver" in window) {
    caseNavigationObserver = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (visible) setActiveSection(visible.target.id);
    }, { rootMargin: "-18% 0px -68% 0px", threshold: 0 });
    sections.forEach((section) => caseNavigationObserver.observe(section));
  }
}

function applyContactSelection(root) {
  const select = root.querySelector('#contact-form select[name="service"]');
  if (!select) return;
  const serviceNames = {
    web: "Web Çözümleri",
    software: "Yazılım Çözümleri",
    network: "Network Çözümleri",
    system: "Sistem Çözümleri",
    consulting: "Teknoloji Danışmanlığı"
  };
  const requestedService = serviceNames[renderedUrl.searchParams.get("hizmet")];
  if (requestedService && [...select.options].some((option) => option.value === requestedService)) {
    select.value = requestedService;
  }
}

function enhanceServiceShowcaseLinks(root) {
  root.querySelectorAll(".service-showcase-content > .card-link, .case-showcase-link").forEach((link) => {
    if (link.dataset.iconReady === "true") return;
    link.dataset.iconReady = "true";
    link.classList.add("service-detail-link");
    link.textContent = link.textContent.replace(/\s*→\s*$/, "").trim();

    const icon = document.createElement("img");
    icon.className = "service-detail-link-icon";
    icon.src = "assets/icons/chevron-right.svg";
    icon.alt = "";
    icon.setAttribute("aria-hidden", "true");
    link.append(icon);
  });
}

function initFaqCategoryIndicator(root) {
  root.querySelectorAll(".faq-categories").forEach((menu) => {
    if (menu.dataset.indicatorReady === "true") return;
    menu.dataset.indicatorReady = "true";

    const indicator = document.createElement("span");
    indicator.className = "faq-category-indicator";
    indicator.setAttribute("aria-hidden", "true");
    menu.prepend(indicator);

    const moveIndicator = (button, immediate = false) => {
      if (!button) return;
      const menuRect = menu.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();
      indicator.classList.toggle("no-transition", immediate);
      indicator.style.width = `${buttonRect.width}px`;
      indicator.style.height = `${buttonRect.height}px`;
      indicator.style.transform = `translate(${buttonRect.left - menuRect.left}px, ${buttonRect.top - menuRect.top}px)`;
      indicator.classList.add("ready");
      if (immediate) requestAnimationFrame(() => indicator.classList.remove("no-transition"));
    };

    menu.querySelectorAll(".faq-category").forEach((button) => {
      button.addEventListener("click", () => moveIndicator(button));
    });

    requestAnimationFrame(() => moveIndicator(menu.querySelector(".faq-category.active"), true));
    if ("ResizeObserver" in window) {
      const observer = new ResizeObserver(() => moveIndicator(menu.querySelector(".faq-category.active"), true));
      observer.observe(menu);
    }
  });
}

function initButtonContentMotion(root) {
  const buttons = [
    ...(root.matches?.(".btn") ? [root] : []),
    ...root.querySelectorAll(".btn:not([data-content-motion-ready])")
  ];

  buttons.forEach((button) => {
    if (button.dataset.contentMotionReady === "true") return;
    button.dataset.contentMotionReady = "true";
    const content = document.createElement("span");
    content.className = "btn-content";
    while (button.firstChild) content.append(button.firstChild);
    button.append(content);
  });
}

function applyBrandAssets(root) {
  root.querySelectorAll(".hero-stat strong").forEach((mark) => {
    if (mark.querySelector(".hero-brand-symbol")) return;
    const image = document.createElement("img");
    image.className = "hero-brand-symbol";
    image.src = "assets/brand/nodvira-icon.png";
    image.alt = "";
    image.setAttribute("aria-hidden", "true");
    mark.replaceChildren(image);
  });
}

function arrangeHomepageSectionCtas(root) {
  if (currentRenderedFile() !== "index.html") return;
  const contentRoot = root.matches?.("main.site-main") ? root : root.querySelector?.("main.site-main") || root;
  const labels = new Set(["Tüm Hizmetleri İnceleyin →", "Tüm Referansları Gör →", "Tüm Yazılar →"]);

  contentRoot.querySelectorAll(".btn-ghost").forEach((button) => {
    if (!labels.has(button.textContent.trim())) return;
    const container = button.closest(".container");
    if (!container) return;

    const previousHeading = button.closest(".section-heading");
    let footer = container.querySelector(":scope > .section-footer-actions");
    if (!footer) {
      footer = document.createElement("div");
      footer.className = "section-footer-actions";
      container.append(footer);
    }
    footer.append(button);

    if (previousHeading?.classList.contains("split") && previousHeading.children.length === 1) {
      previousHeading.classList.remove("split", "home-section-cta-heading");
    }
  });
}

function initCustomSelect(root) {
  root.querySelectorAll('.field select:not([data-custom-select-ready])').forEach((select, selectIndex) => {
    select.dataset.customSelectReady = "true";
    select.classList.add("custom-select-native");
    select.tabIndex = -1;

    const listboxId = `${select.id || "custom-select"}-listbox-${selectIndex}`;
    const customSelect = document.createElement("div");
    customSelect.className = "custom-select";
    customSelect.innerHTML = `<button class="custom-select-trigger" type="button" aria-haspopup="listbox" aria-expanded="false" aria-controls="${listboxId}"><span class="custom-select-value"></span><img src="assets/icons/chevron-down.svg" alt="" aria-hidden="true"></button><div class="custom-select-panel" id="${listboxId}" role="listbox" tabindex="-1"></div>`;
    select.insertAdjacentElement("afterend", customSelect);

    const trigger = customSelect.querySelector(".custom-select-trigger");
    const valueLabel = customSelect.querySelector(".custom-select-value");
    const panel = customSelect.querySelector(".custom-select-panel");
    const optionButtons = [...select.options].map((option) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "custom-select-option";
      button.setAttribute("role", "option");
      button.dataset.value = option.value;
      button.textContent = option.textContent;
      panel.append(button);
      return button;
    });

    const updateSelection = () => {
      const selectedOption = select.options[select.selectedIndex];
      valueLabel.textContent = selectedOption?.textContent || "Lütfen seçin";
      trigger.classList.toggle("has-value", Boolean(select.value));
      if (select.value) customSelect.classList.remove("is-invalid");
      optionButtons.forEach((button) => {
        const selected = button.dataset.value === select.value;
        button.classList.toggle("is-selected", selected);
        button.setAttribute("aria-selected", String(selected));
      });
    };

    const closeSelect = ({ returnFocus = false } = {}) => {
      if (!customSelect.classList.contains("is-open")) return;
      customSelect.classList.remove("is-open");
      trigger.setAttribute("aria-expanded", "false");
      if (returnFocus) trigger.focus();
    };

    const openSelect = () => {
      customSelect.classList.remove("is-invalid");
      customSelect.classList.add("is-open");
      trigger.setAttribute("aria-expanded", "true");
    };

    trigger.addEventListener("click", () => {
      if (customSelect.classList.contains("is-open")) closeSelect();
      else openSelect();
    });

    optionButtons.forEach((button) => {
      button.addEventListener("click", () => {
        select.value = button.dataset.value;
        select.dispatchEvent(new Event("change", { bubbles: true }));
        updateSelection();
        closeSelect({ returnFocus: true });
      });
    });

    document.addEventListener("pointerdown", (event) => {
      if (!customSelect.contains(event.target)) closeSelect();
    });
    customSelect.addEventListener("focusout", () => {
      requestAnimationFrame(() => {
        if (!customSelect.contains(document.activeElement)) closeSelect();
      });
    });
    select.addEventListener("change", updateSelection);
    select.addEventListener("invalid", (event) => {
      event.preventDefault();
      customSelect.classList.add("is-invalid");
      trigger.focus();
    });
    select.form?.addEventListener("reset", () => requestAnimationFrame(updateSelection));
    updateSelection();
  });
}

function ensureTechnicalHeroVisual(root) {
  const activeUrl = history.state?.href ? new URL(history.state.href, window.location.href) : renderedUrl;
  const fileName = activeUrl.pathname.split("/").pop() || "index.html";
  const visuals = {
    "web-tasarim.html": { variant: "web", label: "Uyarlanabilir Arayüz Mimarisi", code: "WEB / 01", scene: `<div class="web-desktop-frame"><div class="web-frame-bar"><i></i><i></i><i></i><span></span></div><div class="web-frame-body"><div class="web-frame-nav"><i></i><i></i><i></i><i></i></div><div class="web-frame-canvas"><span class="web-ui-kicker"></span><span class="web-ui-title"></span><span class="web-ui-copy"></span><div class="web-ui-cards"><i></i><i></i><i></i></div><span class="web-ui-rule"></span></div></div></div><div class="web-mobile-frame"><span class="web-mobile-speaker"></span><div class="web-mobile-content"><i></i><b></b><span></span><span></span><span></span></div><span class="web-mobile-home"></span></div><span class="web-connection"><i></i></span><span class="web-size-mark web-size-desktop"></span><span class="web-size-mark web-size-mobile"></span>` },
    "yazilim-cozumleri.html": { variant: "software-v2", label: "Modüler Uygulama ve Entegrasyon Mimarisi", code: "YAZILIM / 02", scene: `<div class="software-v2-sources"><article><i></i><b></b><span></span></article><article><i></i><b></b><span></span></article><article><i></i><b></b><span></span></article></div><div class="software-v2-connectors">${"<span></span>".repeat(6)}</div><div class="software-v2-core"><div class="software-v2-corebar"><i></i><i></i><i></i><span></span></div><div class="software-v2-modules">${"<article><i></i><b></b><span></span></article>".repeat(4)}</div></div><div class="software-v2-integrations"><article><i></i><b></b></article><article><i></i><b></b></article><article><i></i><b></b></article></div><div class="software-v2-release">${"<span></span>".repeat(5)}</div><div class="software-v2-state">${"<i></i>".repeat(4)}</div>` },
    "network.html": { variant: "network-v2", label: "Segmentasyon ve Güvenli Bağlantı Mimarisi", code: "NETWORK / 03", scene: `<div class="network-v2-zones"><span></span><span></span><span></span></div><div class="network-v2-links"><span class="link-a"></span><span class="link-b is-live reverse"><i></i></span><span class="link-c is-live"><i></i></span><span class="link-d"></span><span class="link-e"></span><span class="link-f"></span></div><div class="network-v2-core"><div class="network-v2-ports">${"<i></i>".repeat(6)}</div><b></b><span></span></div><div class="network-v2-node node-a">${"<i></i>".repeat(4)}</div><div class="network-v2-node node-b"><i></i><b></b><span></span></div><div class="network-v2-node node-c"><i></i><i></i><i></i></div><div class="network-v2-node node-d">${"<i></i>".repeat(3)}<span></span></div><div class="network-v2-node node-e"><i></i><b></b></div><div class="network-v2-node node-f"><i></i><b></b><span></span></div>` },
    "sistem-cozumleri.html": { variant: "system-v2", label: "Sanallaştırma, İzleme ve Süreklilik Mimarisi", code: "SİSTEM / 04", scene: `<div class="system-v2-monitor"><div class="system-v2-chart">${"<i></i>".repeat(6)}</div><div class="system-v2-health"><i></i><b></b><span></span></div></div><div class="system-v2-hosts"><article><header><i></i><b></b></header><div>${"<span></span>".repeat(4)}</div><footer><i></i><b></b></footer></article><article><header><i></i><b></b></header><div>${"<span></span>".repeat(4)}</div><footer><i></i><b></b></footer></article></div><div class="system-v2-fabric">${"<span></span>".repeat(4)}</div><div class="system-v2-storage"><i></i><i></i><i></i><b></b></div><div class="system-v2-backup">${"<i></i>".repeat(4)}<span></span></div>` },
    "cozumler.html": { variant: "consult-v2", label: "Mevcut Durumdan Uygulama Yol Haritasına", code: "DANIŞMANLIK / 05", scene: `<div class="consult-v2-evidence"><header><i></i><i></i><i></i><span></span></header><div>${"<i></i>".repeat(6)}</div><footer><span></span><span></span><span></span></footer></div><div class="consult-v2-priority"><span><i></i></span><span><i></i></span><span><i></i></span></div><div class="consult-v2-connectors"><span></span><span></span><span></span></div><div class="consult-v2-matrix">${"<i></i>".repeat(16)}</div><div class="consult-v2-target"><header><i></i><b></b></header><div>${"<span></span>".repeat(4)}</div></div><div class="consult-v2-roadmap">${"<span></span>".repeat(6)}</div>` },
    "hizmetler.html": { variant: "services-v2", label: "Beş Yetkinlik, Tek Teknoloji Ekosistemi", code: "HİZMETLER / 05", scene: `<div class="services-v2-board"><article class="services-v2-domain domain-web"><em>WEB</em><div class="services-v2-web"><header><i></i><i></i><i></i></header><b></b><span></span><footer><i></i><i></i><i></i></footer></div></article><article class="services-v2-domain domain-software"><em>YAZILIM</em><div class="services-v2-software">${"<i></i>".repeat(4)}</div></article><article class="services-v2-domain domain-consult"><em>DANIŞMANLIK</em><div class="services-v2-consult"><i></i><i></i><i></i><span></span><span></span><span></span></div></article><article class="services-v2-domain domain-network"><em>NETWORK</em><div class="services-v2-network"><b></b>${"<i></i>".repeat(4)}<span></span><span></span></div></article><article class="services-v2-domain domain-system"><em>SİSTEM</em><div class="services-v2-system">${"<span><i></i><b></b></span>".repeat(3)}</div></article></div><div class="services-v2-phases"><span><em>CONNECT</em><i></i></span><span><em>BUILD</em><i></i></span><span><em>EVOLVE</em><i></i></span></div>` },
  };
  const config = visuals[fileName];
  if (!config) return;

  const hero = root.querySelector(".page-hero");
  const container = hero?.querySelector(":scope > .container");
  if (!hero || !container || container.querySelector(".web-hero-visual")) return;

  hero.classList.add("web-hero", "technical-hero", `${config.variant}-hero`);
  container.classList.add("web-hero-layout");
  const copy = document.createElement("div");
  copy.className = "web-hero-copy";
  [...container.children].forEach((child) => copy.append(child));

  const visual = document.createElement("div");
  visual.className = "web-hero-visual";
  visual.setAttribute("aria-hidden", "true");
  visual.innerHTML = `
    <div class="web-visual-stage technical-visual-stage ${config.variant}-visual">
      <span class="web-guide web-guide-x"></span><span class="web-guide web-guide-y"></span>
      <span class="web-node web-node-a"></span><span class="web-node web-node-b"></span><span class="web-node web-node-c"></span>
      ${config.scene}
    </div>
    <div class="web-visual-index"><span>${config.label}</span><strong>${config.code}</strong></div>`;
  container.append(copy, visual);
}

function initPageInteractions(root) {
  ensureTechnicalHeroVisual(root);
  applyCaseStudyData(root);
  applyContextualLinks(root);
  applyContactSelection(root);
  applyBrandAssets(root);
  arrangeHomepageSectionCtas(root);
  initButtonContentMotion(root);
  enhanceServiceShowcaseLinks(root);
  initFaqCategoryIndicator(root);
  initCustomSelect(root);
  initCaseSectionNavigation(root);
  if (window.PublicBlog) window.PublicBlog.init(root);
  initScrollMotion(root);
  root.querySelectorAll(".faq-question").forEach((button) => {
    button.addEventListener("click", () => {
      const expanded = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!expanded));
    });
  });

  const faqList = root.querySelector(".faq-list");
  const resetFaqScroll = () => faqList?.scrollTo({ top: 0, behavior: reducedMotion.matches ? "auto" : "smooth" });

  root.querySelectorAll(".faq-category").forEach((button) => {
    button.addEventListener("click", () => {
      root.querySelectorAll(".faq-category").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      const category = button.dataset.category;
      root.querySelectorAll(".faq-item").forEach((item) => {
        item.hidden = category !== "all" && item.dataset.category !== category;
      });
      resetFaqScroll();
    });
  });

  const projectFilterButtons = [...root.querySelectorAll(".filter-button")];
  const projectItems = [...root.querySelectorAll("[data-project-category]")];
  const projectPagination = root.querySelector("[data-project-pagination]");
  const projectPageList = root.querySelector("[data-project-page-list]");
  const projectPageStatus = root.querySelector("[data-project-page-status]");
  const projectPreviousPage = root.querySelector("[data-project-page-prev]");
  const projectNextPage = root.querySelector("[data-project-page-next]");
  const projectShowcase = root.querySelector(".case-showcase");
  const projectPageSize = 5;
  let currentProjectFilter = "all";
  let currentProjectPage = 1;
  let currentProjectPageCount = 1;

  const renderProjectPagination = () => {
    if (!projectPagination || !projectPageList) return;
    projectPagination.hidden = currentProjectPageCount <= 1;
    projectPageList.replaceChildren(...Array.from({ length: currentProjectPageCount }, (_, index) => {
      const pageNumber = index + 1;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "references-page-number";
      button.dataset.projectPage = String(pageNumber);
      button.textContent = String(pageNumber);
      button.setAttribute("aria-label", `${pageNumber}. referans sayfası`);
      if (pageNumber === currentProjectPage) button.setAttribute("aria-current", "page");
      return button;
    }));
    if (projectPreviousPage) projectPreviousPage.disabled = currentProjectPage === 1;
    if (projectNextPage) projectNextPage.disabled = currentProjectPage === currentProjectPageCount;
    if (projectPageStatus) projectPageStatus.textContent = `${currentProjectPage}. referans sayfası gösteriliyor.`;
  };

  const applyProjectFilter = (filter, requestedPage = 1) => {
    const availableFilters = projectFilterButtons.map((button) => button.dataset.filter);
    const selectedFilter = availableFilters.includes(filter) ? filter : "all";
    const filteredItems = projectItems.filter((item) => selectedFilter === "all" || item.dataset.projectCategory.split(" ").includes(selectedFilter));
    currentProjectFilter = selectedFilter;
    currentProjectPageCount = Math.max(1, Math.ceil(filteredItems.length / projectPageSize));
    currentProjectPage = Math.min(Math.max(Number(requestedPage) || 1, 1), currentProjectPageCount);
    const pageStart = (currentProjectPage - 1) * projectPageSize;
    const pageItems = new Set(filteredItems.slice(pageStart, pageStart + projectPageSize));

    projectFilterButtons.forEach((button) => {
      const active = button.dataset.filter === selectedFilter;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    projectItems.forEach((item) => { item.hidden = !pageItems.has(item); });
    const emptyState = root.querySelector("[data-filter-empty]");
    if (emptyState) emptyState.hidden = filteredItems.length > 0;
    renderProjectPagination();
    return { selectedFilter, selectedPage: currentProjectPage };
  };

  const updateProjectUrl = ({ selectedFilter, selectedPage }) => {
    const nextUrl = new URL(renderedUrl.href);
    if (selectedFilter === "all") nextUrl.searchParams.delete("filter");
    else nextUrl.searchParams.set("filter", selectedFilter);
    if (selectedPage === 1) nextUrl.searchParams.delete("page");
    else nextUrl.searchParams.set("page", String(selectedPage));
    renderedUrl = nextUrl;
    writeHistory(nextUrl, true);
  };

  const scrollToProjectShowcase = () => {
    if (!projectShowcase) return;
    const scrollOffset = Number.parseFloat(getComputedStyle(projectShowcase).scrollMarginTop) || 0;
    const startPosition = window.scrollY;
    const targetPosition = Math.max(0, startPosition + projectShowcase.getBoundingClientRect().top - scrollOffset);
    const distance = targetPosition - startPosition;
    if (reducedMotion.matches || Math.abs(distance) < 2) {
      window.scrollTo({ top: targetPosition, left: 0, behavior: "auto" });
      return;
    }

    const duration = 280;
    const startTime = performance.now();
    const animateScroll = (currentTime) => {
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      window.scrollTo(0, startPosition + distance * easedProgress);
      if (progress < 1) requestAnimationFrame(animateScroll);
    };
    requestAnimationFrame(animateScroll);
  };

  const changeProjectPage = (nextPage) => {
    const state = applyProjectFilter(currentProjectFilter, nextPage);
    updateProjectUrl(state);
    scrollToProjectShowcase();
  };

  if (projectFilterButtons.length && projectItems.length) {
    applyProjectFilter(renderedUrl.searchParams.get("filter") || "all", Number(renderedUrl.searchParams.get("page")) || 1);
    projectFilterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        updateProjectUrl(applyProjectFilter(button.dataset.filter, 1));
      });
    });
    projectPageList?.addEventListener("click", (event) => {
      const pageButton = event.target.closest("[data-project-page]");
      if (pageButton) changeProjectPage(Number(pageButton.dataset.projectPage));
    });
    projectPreviousPage?.addEventListener("click", () => changeProjectPage(currentProjectPage - 1));
    projectNextPage?.addEventListener("click", () => changeProjectPage(currentProjectPage + 1));
  }

  const faqSearch = root.querySelector("#faq-search");
  faqSearch?.addEventListener("input", () => {
    const query = faqSearch.value.trim().toLocaleLowerCase("tr");
    root.querySelectorAll(".faq-item").forEach((item) => {
      item.hidden = Boolean(query) && !item.textContent.toLocaleLowerCase("tr").includes(query);
    });
    root.querySelectorAll(".faq-category").forEach((item) => item.classList.toggle("active", item.dataset.category === "all"));
    resetFaqScroll();
  });

  const blogSearch = root.querySelector("#blog-search");
  blogSearch?.addEventListener("input", () => {
    const query = blogSearch.value.trim().toLocaleLowerCase("tr");
    root.querySelectorAll("[data-blog-list] .article-card").forEach((item) => {
      item.hidden = Boolean(query) && !item.textContent.toLocaleLowerCase("tr").includes(query);
    });
  });

  root.querySelectorAll(".capability-accordion").forEach((accordion) => {
    const items = [...accordion.querySelectorAll(".capability-accordion-item")];

    const activateItem = (selectedItem) => {
      items.forEach((item) => {
        const active = item === selectedItem;
        item.classList.toggle("is-active", active);
        const trigger = item.querySelector(".capability-accordion-trigger");
        const detail = item.querySelector(".capability-accordion-detail");
        trigger?.setAttribute("aria-expanded", String(active));
        detail?.setAttribute("aria-hidden", String(!active));
      });
    };

    items.forEach((item, index) => {
      const trigger = item.querySelector(".capability-accordion-trigger");
      trigger?.addEventListener("click", () => activateItem(item));
      trigger?.addEventListener("keydown", (event) => {
        let nextIndex = null;
        if (event.key === "ArrowRight" || event.key === "ArrowDown") nextIndex = (index + 1) % items.length;
        if (event.key === "ArrowLeft" || event.key === "ArrowUp") nextIndex = (index - 1 + items.length) % items.length;
        if (event.key === "Home") nextIndex = 0;
        if (event.key === "End") nextIndex = items.length - 1;
        if (nextIndex === null) return;
        event.preventDefault();
        items[nextIndex].querySelector(".capability-accordion-trigger")?.focus();
      });
    });
  });

  const contactForm = root.querySelector("#contact-form");
  if (contactForm && window.PublicRequestForm) window.PublicRequestForm.init(contactForm);

  if (precisePointer.matches) {
    root.querySelectorAll(".card").forEach((card) => {
      let animationFrame;
      const moveGlow = (event) => {
        cancelAnimationFrame(animationFrame);
        animationFrame = requestAnimationFrame(() => {
          const rect = card.getBoundingClientRect();
          card.style.setProperty("--mouse-x", `${event.clientX - rect.left}px`);
          card.style.setProperty("--mouse-y", `${event.clientY - rect.top}px`);
        });
      };
      card.addEventListener("pointerenter", (event) => {
        card.style.setProperty("--glow-opacity", "1");
        moveGlow(event);
      });
      card.addEventListener("pointermove", moveGlow);
      card.addEventListener("pointerleave", () => {
        card.style.setProperty("--glow-opacity", "0");
        cancelAnimationFrame(animationFrame);
      });
    });
  }
}

initPageInteractions(document);

const buttonContentObserver = new MutationObserver((records) => {
  records.forEach((record) => {
    record.addedNodes.forEach((node) => {
      if (node instanceof Element) initButtonContentMotion(node);
    });
  });
});
buttonContentObserver.observe(document.body, { childList: true, subtree: true });
