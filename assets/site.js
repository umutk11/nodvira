const routes = {
  home: "/",
  about: "/hakkimizda",
  services: "/hizmetlerimiz",
  solutions: "/hizmetlerimiz/teknoloji-danismanligi",
  projects: "/referanslarimiz",
  blog: "/blog",
  faq: "/sss",
  contact: "/iletisim",
  web: "/hizmetlerimiz/web-cozumleri",
  network: "/hizmetlerimiz/network-cozumleri",
  software: "/hizmetlerimiz/yazilim-cozumleri",
  system: "/hizmetlerimiz/sistem-cozumleri",
  caseStudy: "/referanslarimiz/kurumsal-web-platformu",
  privacyNotice: "/kvkk-aydinlatma-metni",
  privacy: "/gizlilik-politikasi",
  cookies: "/cerez-politikasi"
};

const pageKeysByPath = {
  "/": "index.html",
  "/hizmetlerimiz": "hizmetler.html",
  "/hizmetlerimiz/web-cozumleri": "web-tasarim.html",
  "/hizmetlerimiz/yazilim-cozumleri": "yazilim-cozumleri.html",
  "/hizmetlerimiz/network-cozumleri": "network.html",
  "/hizmetlerimiz/sistem-cozumleri": "sistem-cozumleri.html",
  "/hizmetlerimiz/teknoloji-danismanligi": "cozumler.html",
  "/referanslarimiz": "projeler.html",
  "/hakkimizda": "hakkimda.html",
  "/blog": "blog.html",
  "/sss": "sss.html",
  "/iletisim": "iletisim.html",
  "/kvkk-aydinlatma-metni": "kvkk-aydinlatma-metni.html",
  "/gizlilik-politikasi": "gizlilik-politikasi.html",
  "/cerez-politikasi": "cerez-politikasi.html"
};

const caseStudySlugs = {
  web: "kurumsal-web-platformu",
  software: "soguk-zincir-istisna-yonetimi",
  network: "ag-standardizasyonu",
  system: "sistem-modernizasyonu",
  consulting: "teknoloji-yol-haritasi"
};

const caseStudyKeysBySlug = Object.fromEntries(Object.entries(caseStudySlugs).map(([key, slug]) => [slug, key]));

function normalizeRoutePath(pathname) {
  const decoded = decodeURIComponent(pathname || "/");
  if (decoded === "/") return decoded;
  return decoded.replace(/\/+$/, "");
}

function pageKeyFromUrl(destination) {
  const pathname = normalizeRoutePath(destination.pathname);
  if (/^\/blog\/[^/]+$/.test(pathname)) return "blog-detay.html";
  if (/^\/referanslarimiz\/[^/]+$/.test(pathname)) return "referans-detay.html";
  if (pageKeysByPath[pathname]) return pageKeysByPath[pathname];
  const legacyFile = pathname.split("/").pop() || "index.html";
  return window.sitePages?.[legacyFile] ? legacyFile : null;
}

function caseStudyUrl(key) {
  return `/referanslarimiz/${caseStudySlugs[key] || caseStudySlugs.web}`;
}

let page = document.body.dataset.page || "";

const serviceNavItems = [
  ["dijital-cozumler", "Web Çözümleri", "Kurumsal web, UI/UX, responsive ve performans", routes.web],
  ["yazilim-cozumleri", "Yazılım Çözümleri", "Özel yazılım, otomasyon ve entegrasyon", routes.software],
  ["network-ag", "Network Çözümleri", "LAN/WAN, kablosuz ağ ve ölçeklenebilir mimari", routes.network],
  ["sistem-yonetimi", "Sistem Çözümleri", "Sunucu, sanallaştırma ve modernizasyon", routes.system],
  ["danismanlik-proje", "Teknoloji Danışmanlığı", "Analiz, strateji, mimari ve yol haritası", routes.solutions]
];

const servicePageKeys = new Set(["services", "web", "network", "software", "system", "solutions"]);

function headerMarkup() {
  const nav = [
    ["home", "Ana Sayfa"], ["services", "Hizmetlerimiz"], ["projects", "Referanslarımız"],
    ["about", "Hakkımızda"], ["blog", "Blog"], ["faq", "SSS"], ["contact", "İletişim"]
  ];
  const desktopLinks = nav.map(([key, label]) => {
    const selected = page === key || (key === "services" && servicePageKeys.has(page));
    const active = selected ? "active" : "";
    const current = selected ? 'aria-current="page"' : "";
    if (key !== "services") return `<a data-nav-link data-page-key="${key}" href="${routes[key]}" class="nav-link ${active}" ${current}>${label}</a>`;
    const serviceLinks = serviceNavItems.map(([, title, description, destination], index) => `<a class="mega-service" href="${destination}"><span class="mega-number">0${index + 1}</span><span><strong>${title}</strong><small>${description}</small></span><span class="mega-arrow" aria-hidden="true">↗</span></a>`).join("");
    return `<div class="nav-services"><a data-nav-link data-page-key="services" href="${routes.services}" class="nav-link service-trigger ${active}" ${current} aria-haspopup="true">${label}<img class="nav-chevron" src="/assets/icons/chevron-down.svg" alt="" aria-hidden="true"></a><div class="mega-menu"><div class="mega-grid"><div><div class="mega-label">HİZMET KATALOĞU</div><div class="mega-services">${serviceLinks}</div></div><aside class="mega-feature"><h3>Teknolojiyi iş hedefleriniz için birlikte kurgulayalım.</h3><p>İhtiyacınızın hangi hizmet alanına girdiğinden emin değilseniz ilk görüşmede kapsamı netleştirebiliriz.</p><a class="btn btn-primary" href="${routes.contact}">İhtiyacınızı Anlatın →</a></aside></div></div></div>`;
  }).join("");
  const mobileLinks = `<a data-page-key="home" href="${routes.home}" class="${page === "home" ? "active" : ""}">Ana Sayfa</a><div class="mobile-service-group"><div class="mobile-service-row"><a data-page-key="services" href="${routes.services}" class="${servicePageKeys.has(page) ? "active" : ""}">Hizmetlerimiz</a><button class="mobile-service-toggle" type="button" aria-label="Hizmet alt menüsünü aç" aria-expanded="false" aria-controls="mobile-services"><img src="/assets/icons/chevron-down.svg" alt="" aria-hidden="true"></button></div><div class="mobile-services" id="mobile-services">${serviceNavItems.map(([, title, , destination]) => `<a href="${destination}">${title}</a>`).join("")}</div></div><a data-page-key="projects" href="${routes.projects}" class="${page === "projects" ? "active" : ""}">Referanslarımız</a><a data-page-key="about" href="${routes.about}" class="${page === "about" ? "active" : ""}">Hakkımızda</a><a data-page-key="blog" href="${routes.blog}" class="${page === "blog" ? "active" : ""}">Blog</a><a data-page-key="faq" href="${routes.faq}" class="${page === "faq" ? "active" : ""}">SSS</a><a data-page-key="contact" href="${routes.contact}" class="${page === "contact" ? "active" : ""}">İletişim</a>`;
  return `<header class="site-header"><div class="container header-inner">
    <a class="brand header-brand" href="${routes.home}" aria-label="NODVIRA ana sayfa"><img class="header-lockup" src="/assets/brand/nodvira-logo.svg?v=20260826-static1" alt=""></a>
    <nav class="desktop-nav" aria-label="Ana navigasyon">${desktopLinks}<span class="nav-active-line" aria-hidden="true"></span></nav>
    <div class="header-actions"><a class="btn btn-primary header-cta" href="${routes.contact}"><span>Projenizi Konuşalım</span><span class="cta-arrow" aria-hidden="true">→</span></a><button class="menu-toggle" type="button" aria-label="Menüyü aç" aria-expanded="false" aria-controls="mobile-menu"><span></span></button></div>
  </div></header><div class="mobile-panel" id="mobile-menu" aria-hidden="true"><div class="mobile-menu-inner"><nav class="mobile-nav" aria-label="Mobil navigasyon">${mobileLinks}</nav><div class="mobile-contact"><span>PROJENİZİ BİRLİKTE DEĞERLENDİRELİM</span><a class="btn btn-primary" href="${routes.contact}">Projenizi Konuşalım →</a><a class="mobile-mail" href="${routes.contact}">İletişim Formu</a></div></div></div>`;
}

function footerMarkup() {
  return `<footer class="site-footer"><div class="container">
    <div class="footer-grid">
      <div><a class="brand footer-brand" href="${routes.home}" aria-label="NODVIRA ana sayfa"><img class="brand-lockup" src="/assets/brand/nodvira-logo.svg?v=20260826-static1" alt=""></a><p class="muted" style="margin-top:18px;max-width:300px">Web, yazılım, network, sistem ve teknoloji danışmanlığını bütüncül çözümlerde bir araya getiren teknoloji çözüm ortağı.</p></div>
      <div><div class="footer-title">HİZMETLER</div><div class="footer-links"><a href="${routes.web}">Web Çözümleri</a><a href="${routes.software}">Yazılım Çözümleri</a><a href="${routes.network}">Network Çözümleri</a><a href="${routes.system}">Sistem Çözümleri</a><a href="${routes.solutions}">Teknoloji Danışmanlığı</a></div></div>
      <div><div class="footer-title">İLETİŞİM</div><div class="footer-links"><a href="${routes.contact}">İletişim Formu</a><a href="https://nodvira.com">nodvira.com</a></div></div>
      <div><div class="footer-title">KEŞFEDİN</div><div class="footer-links"><a href="${routes.about}">Hakkımızda</a><a href="${routes.projects}">Referanslarımız</a><a href="${routes.blog}">Blog</a><a href="${routes.faq}">Sıkça Sorulan Sorular</a><a href="${routes.contact}">İletişim</a></div></div>
    </div><div class="footer-bottom"><span>© 2026 NODVIRA. Tüm hakları saklıdır. · CONNECT • BUILD • EVOLVE</span><nav class="footer-legal-links" aria-label="Yasal bağlantılar"><a href="${routes.privacyNotice}">KVKK Aydınlatma Metni</a><a href="${routes.privacy}">Gizlilik Politikası</a><a href="${routes.cookies}">Çerez Politikası</a></nav></div>
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
  const servicePage = servicePageKeys.has(page);
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
  const fileName = pageKeyFromUrl(destination);
  return fileName ? window.sitePages?.[fileName] || null : null;
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
  web: {
    title: "12 Hizmet Hattı İçin Kurumsal Web Platformu",
    imagePath: "/assets/images/projects/web-platform-cover-v2.webp",
    client: "Anonim B2B danışmanlık grubu",
    industry: "Mühendislik ve Profesyonel Hizmetler",
    services: "Bilgi Mimarisi · UX · Front-end · Teknik SEO",
    status: "Anonim vaka raporu",
    code: "WEB / 01",
    visualLabel: "B2B hizmet platformu",
    visualCaption: "12 hizmet hattı · 3 bölge · 280+ mevcut URL",
    summary: "On iki hizmet hattını üç bölgesel ekip adına yöneten B2B danışmanlık grubunun 280’den fazla URL’ye dağılmış içeriğini ortak bilgi mimarisi, ölçülebilir iletişim akışı ve tekrar kullanılabilir yayın sistemi altında birleştiren web dönüşümü.",
    need: [
      "Grubun on iki hizmet hattı üç bölgesel ekip tarafından ayrı ayrı güncelleniyordu. Yapılan içerik taramasında aynı hizmeti farklı adlarla anlatan sayfalar, güncel olmayan uzman profilleri ve birbiriyle rekabet eden 280’den fazla indekslenebilir URL bulundu. Mobil menüde bir hizmet detayına ulaşmak üç seviyeye kadar inerken, sektör sayfaları ilgili hizmet ve uzmanlarla sistematik biçimde bağlanmıyordu.",
      "Dört farklı iletişim formunun tamamı aynı posta kutusuna yalnızca serbest metin gönderiyor; talebin hangi hizmetten, bölgeden veya içerikten geldiği kaydedilmiyordu. Pazarlama ekibi yeni bir kampanya sayfası açmak için geliştirme ekibinden destek almak zorunda kalıyor, kullanılan özel sayfa blokları nedeniyle yayın öncesi görsel ve teknik kontrol her seferinde yeniden yapılıyordu."
    ],
    approach: [
      "URL envanteri; korunacak, birleştirilecek, yönlendirilecek ve kaldırılacak içerikler olarak sınıflandırıldı. Satış ve uzman ekipleriyle yapılan oturumlarda kullanıcıların ilk görüşme öncesinde sorduğu sorular çıkarıldı; hizmet, sektör, uzmanlık, içgörü ve iletişim içerikleri arasındaki zorunlu bağlantılar yeni bilgi mimarisinin girdisi yapıldı.",
      "Üç öncelikli kullanıcı yolculuğu prototiplendi: belirli bir hizmet arayan karar verici, sektörüne uygun yetkinliği araştıran yönetici ve doğrudan uzman görüşmesi talep eden ziyaretçi. Sayfa şablonları bu görevlerle test edildikten sonra içerik alanları, bileşen varyasyonları, URL kuralları ve analitik olay sözlüğü geliştirme sözleşmesine dönüştürüldü."
    ],
    solution: [
      "Hizmet, sektör, uzman, vaka ve içgörü için ayrı içerik tipleri oluşturuldu; bu tipler referans alanlarıyla birbirine bağlandı. Editörler yalnızca onaylı alanları ve on sekiz yeniden kullanılabilir bileşeni kullanarak sayfa kurabilir hale getirildi. Hizmet sayfalarında kapsam, çözülen problem, süreç, ilgili uzmanlık ve iletişim bileşenlerinin bulunması yayın kuralına bağlandı.",
      "Front-end tarafında semantik başlık yapısı, klavye ile çalışan navigasyon, responsive grid ve ortak odak durumları bileşen seviyesinde uygulandı. Eski URL’ler için yönlendirme matrisi, görseller için boyut ve gecikmeli yükleme politikası, formlar için hizmet ve kaynak kimliği taşıyan gizli alanlar, analitik için de form başlatma, doğrulama hatası ve başarılı gönderim olayları tanımlandı."
    ],
    technicalIntro: "Teknik mimari, 280’den fazla eski URL’nin kontrollü geçişini ve üç editör ekibinin aynı kurallarla içerik üretmesini destekleyecek şekilde dört katmana ayrıldı.",
    architecture: [
      ["Deneyim Katmanı", "On sekiz bileşenden oluşan responsive UI sistemi, klavye navigasyonu ve hizmet odaklı iletişim akışları."],
      ["İçerik Katmanı", "Hizmet, sektör, uzman, vaka ve içgörü içerik tipleri; zorunlu alanlar ve editoryal yayın rolleri."],
      ["Sunum Katmanı", "Semantik HTML, responsive görsel kaynakları, kritik CSS yaklaşımı, önbellekleme ve URL yönlendirme matrisi."],
      ["Ölçüm Katmanı", "Kaynak ve hizmet kimliği taşıyan formlar, analitik olay sözlüğü, doğrulama hataları ve teknik hata kayıtları."]
    ],
    technicalNote: "Teknoloji seçimi tek bir araca bağlı kalmadan; içerik ekibinin çalışma biçimi, bakım sorumluluğu ve performans hedefleri üzerinden değerlendirildi.",
    process: [["Envanter", "280’den fazla URL, form, uzman profili ve mevcut analitik olayı sınıflandırıldı."], ["Bilgi Mimarisi", "On iki hizmet hattı, sektörler ve uzmanlıklar ortak içerik modeline bağlandı."], ["Prototip", "Üç kritik kullanıcı yolculuğu mobil ve masaüstünde görev testleriyle doğrulandı."], ["Uygulama", "İçerik tipleri, on sekiz bileşen, form bağlamı ve ölçüm olayları geliştirildi."], ["Geçiş", "Yönlendirme matrisi, içerik kontrolü ve editör eğitimleriyle kontrollü yayın yapıldı."]],
    outcomeLead: "On iki hizmet hattı, üç editör ekibinin aynı yayın ve ölçüm kurallarıyla yönetebildiği tek platformda toplandı.",
    outcome: ["Hizmet, sektör ve uzman içerikleri ilişkisel modele taşındığı için aynı bilgi farklı sayfalarda kopyalanmadan yeniden kullanılabilir hale geldi. İletişim talepleri hizmet ve kaynak bağlamıyla birlikte kaydedilecek şekilde standartlaştırıldı; yeni sayfa üretimi onaylı şablon ve bileşenlere bağlandı.", "Teslim raporunda URL karar matrisi, içerik modeli, on sekiz bileşenlik UI kütüphanesi, form alan sözleşmesi, analitik olay şeması, erişilebilirlik kontrol listesi ve editör yayın rehberi yer aldı. Yayın sonrası doğrulanmış dönüşüm verisi paylaşılmadığı için performans artışı iddiası kullanılmadı."],
    related: [["Web Çözümleri", routes.web], ["Yazılım Çözümleri", routes.software], ["Teknoloji Danışmanlığı", routes.solutions]]
  },
  software: {
    title: "Soğuk Zincir Teslimatlarında İstisna Yönetimi",
    imagePath: "/assets/images/projects/software-cold-chain-cover-v2.webp",
    client: "Anonim bölgesel dağıtım şirketi",
    industry: "Soğuk Zincir Lojistiği",
    services: "İş Analizi · Web Uygulaması · ERP Entegrasyonu",
    status: "Anonim vaka raporu",
    code: "SOFT / 02",
    visualLabel: "Teslimat istisna yönetimi",
    visualCaption: "4 depo · 60+ araç · ERP sipariş verisi",
    summary: "Dört depo ve altmıştan fazla saha aracıyla çalışan soğuk zincir dağıtım şirketinde sıcaklık sapması, eksik evrak, hasarlı koli ve reddedilen teslimat kayıtlarını ERP sevkiyat verisiyle birleştiren istisna yönetim uygulaması.",
    need: [
      "Sürücüler sıcaklık sapması, eksik teslimat evrakı, hasarlı koli veya müşteri reddi yaşadığında durumu telefon ve mesajlaşma gruplarıyla merkeze bildiriyordu. Operasyon sorumluları aynı olayı ayrı Excel satırlarına giriyor, kalite ekibi sıcaklık kaydını başka bir sistemden arıyor, müşteri hizmetleri ise ERP’de yalnızca sevkiyatın genel durumunu görebiliyordu.",
      "Bir istisnanın hangi depoya, araca, sevkiyata ve ürün partisine ait olduğu tek kayıtta tutulmadığı için kanıt fotoğrafları ve karar geçmişi dağınık kalıyordu. Sistem; ERP’deki sevkiyat ana verisini değiştirmeden kullanmalı, saha bağlantısı kesildiğinde taslak kaydı korumalı ve on iki istisna tipinin her biri için farklı sorumlu, süre ve kapanış kanıtı çalıştırmalıydı."
    ],
    approach: [
      "İki depoda saha gözlemi yapılarak sürücü, dispeçer, kalite sorumlusu ve müşteri hizmetleri rollerinin olayı nasıl devraldığı adım adım çıkarıldı. Son üç aylık kayıt örneklerinden on iki istisna tipi, zorunlu kanıtlar, eskalasyon koşulları ve kapanış yetkileri belirlendi.",
      "ERP entegrasyonu yalnızca sevkiyat, müşteri, rota ve ürün partisi ana verisini okuyacak şekilde sınırlandı. İstisna durumu ayrı uygulamada yönetildi; ERP’ye geri yazılacak kapanış kodları için idempotent işlem anahtarı ve hata tekrar kuyruğu tasarlandı."
    ],
    solution: [
      "Mobil öncelikli uygulamada sürücü sevkiyat numarasını seçerek istisna tipini, fotoğrafı, sıcaklık değerini ve kısa açıklamayı bağlantı olmasa da taslak olarak kaydedebildi. Kayıt senkronize olduğunda tipine göre dispeçer veya kalite kuyruğuna düştü; süre aşımı, yeniden atama ve müşteri bilgilendirme adımları durum makinesi üzerinden çalıştırıldı.",
      "Sunucu tarafında rol bazlı yetki, zorunlu alan doğrulaması, değiştirilemez işlem geçmişi ve dosya yükleme kontrolleri ortak servis haline getirildi. ERP bağlantısı zamanlanmış içe aktarma ve tekrar denenebilir dışa aktarma görevleriyle ayrıştırıldı; aynı kapanışın iki kez yazılmasını önlemek için sevkiyat ve istisna kimliğinden üretilen benzersiz işlem anahtarı kullanıldı."
    ],
    technicalIntro: "Uygulama, saha bağlantı kesintisini ve ERP entegrasyon hatasını normal operasyon senaryosu kabul eden dört katmanlı mimariyle tasarlandı.",
    architecture: [["Mobil Arayüz", "Çevrimdışı taslak, kontrollü fotoğraf yükleme, sevkiyat seçimi ve role göre görev listesi."], ["İş Akışı Motoru", "On iki istisna tipi, durum geçişleri, süre kuralları, eskalasyon ve kapanış kanıtı."], ["ERP Entegrasyonu", "Sevkiyat ana verisi, idempotent kapanış kodu, görev kuyruğu ve hata tekrar politikası."], ["Denetim Verisi", "Parti, araç ve sevkiyat ilişkileri; değiştirilemez işlem geçmişi ve erişim kayıtları."]],
    technicalNote: "Teknik yapı; ekran sayısından çok süreç değişikliklerine dayanıklı olma, hataları izleyebilme ve yeni modülleri mevcut akışları bozmadan ekleyebilme hedefiyle şekillendirildi.",
    process: [["Saha Analizi", "İki depoda dört rol gözlemlendi, gerçek istisna kayıtları sınıflandırıldı."], ["Kural Tasarımı", "On iki tip için zorunlu alan, sorumlu, süre ve kapanış kanıtı belirlendi."], ["Entegrasyon", "ERP sevkiyat verisi ve kapanış kodları için veri sözleşmeleri doğrulandı."], ["Pilot", "Bir depo ve seçili sürücü grubuyla çevrimdışı kullanım ve eskalasyon test edildi."], ["Yaygınlaştırma", "Rol eğitimleri, hata kuyruğu takibi ve operasyon runbook'u ile dört depoya açıldı."]],
    outcomeLead: "Sıcaklık sapması ve teslimat istisnaları, sevkiyat ve ürün partisiyle ilişkili tek denetim kaydında yönetilir hale geldi.",
    outcome: ["Sürücü, dispeçer, kalite ve müşteri hizmetleri aynı olay kaydı üzerinde kendi sorumluluğundaki adımı görebildi. Fotoğraf, sıcaklık bilgisi, karar notu ve ERP kapanış kodu kayıtla birlikte tutulduğu için olayın geriye dönük incelemesi kişisel mesajlaşmaya bağımlı olmaktan çıktı.", "Teslim raporunda on iki istisna tipinin süreç matrisi, rol ve yetki tablosu, ERP veri sözleşmesi, idempotency kuralı, hata kuyruğu prosedürü, ekran kabul kriterleri ve depo bazlı devreye alma kontrol listesi yer aldı. Doğrulanmış operasyon süresi ölçümü paylaşılmadığı için verim artışı iddiası kullanılmadı."],
    related: [["Yazılım Çözümleri", routes.software], ["Sistem Çözümleri", routes.system], ["Teknoloji Danışmanlığı", routes.solutions]]
  },
  network: {
    title: "27 Mağaza ve 2 Depo İçin Ağ Standardizasyonu",
    imagePath: "/assets/images/projects/network-standardization-cover-v2.webp",
    client: "Anonim ulusal perakende zinciri",
    industry: "Perakende ve Depo Operasyonları",
    services: "LAN/WAN · Wi-Fi · Segmentasyon · Merkezi İzleme",
    status: "Anonim vaka raporu",
    code: "NET / 03",
    visualLabel: "Mağaza ve depo ağı",
    visualCaption: "27 mağaza · 2 depo · 1 merkez ofis",
    summary: "Yirmi yedi mağaza, iki depo ve merkez ofiste farklı dönemlerde kurulmuş ağları; POS, ofis, misafir, kamera ve el terminali trafiğini ayrıştıran ortak topoloji ve merkezi işletim standardında birleştiren network projesi.",
    need: ["On bir mağazada POS terminalleri, personel bilgisayarları, IP kameralar ve misafir Wi-Fi aynı yerel ağda çalışıyordu. Şubeler farklı IP blokları ve cihaz parolaları kullanıyor, bazı lokasyonlarda tüketici tipi erişim noktaları yoğun saatlerde istemci yükünü taşıyamıyordu. Depolardaki el terminalleri koridor geçişlerinde bağlantı kaybediyor; destek ekibi olay anında erişim noktası, uplink veya internet hattı kaynaklı ayrım yapamıyordu.", "Yeni standart POS trafiğini diğer cihazlardan ayırmalı, misafir erişimini kurum ağına kapatmalı, depo dolaşımını desteklemeli ve mağaza açılış ekibinin her yeni lokasyonu aynı port ve kablosuz profil setiyle devreye almasını sağlamalıydı. Kritik depolar için ikinci WAN hattına geçiş ve merkezden konfigürasyon yedeği de zorunlu kapsamdaydı."],
    approach: ["Tüm lokasyonlardan cihaz, port ve hat envanteri toplandı; üç mağaza tipi ve bir depo tipi tanımlandı. İki mağaza ile bir depoda yerinde keşif yapılarak rack düzeni, uplink kapasitesi, PoE bütçesi, kablosuz kanal kullanımı ve el terminali dolaşım noktaları ölçüldü.", "POS, ofis, kamera, el terminali, misafir ve yönetim ağlarının hangi servislerle konuşması gerektiği akış matrisiyle çıkarıldı. Pilot mağazada yeni VLAN, port profili ve SSID politikaları uygulandı; ödeme, kamera kaydı, uzaktan destek ve misafir erişimi için ayrı kabul senaryoları çalıştırıldı."],
    solution: ["Her lokasyon tipi için standart switch port profilleri, VLAN ve IP şablonları hazırlandı. POS ve el terminalleri yalnızca gerekli merkez servislerine, kameralar kayıt sunucularına, misafir ağı ise yalnızca internete erişecek biçimde güvenlik kuralları oluşturuldu. Depolarda kapsama yerine kapasite ve dolaşım hedefleri üzerinden erişim noktası yerleşimi yeniden planlandı.", "Merkezi yönetimde cihaz sağlık durumu, WAN erişimi, uplink hataları, istemci yoğunluğu ve erişim noktası kanal kullanımı ortak izleme ekranına alındı. Konfigürasyon yedeği, standart isimlendirme, sürüm takibi ve değişiklik onayı için operasyon akışı kuruldu; iki depoda birincil hat kesintisinde devreye giren ikincil WAN senaryosu test planına bağlandı."],
    technicalIntro: "Mimari, mağaza açılışını tekrar edilebilir hale getirirken POS ve depo operasyonunu diğer trafikten ayıran dört teknik katman üzerinde standartlaştırıldı.",
    architecture: [["Fiziksel Erişim", "Lokasyon tipine göre rack, uplink, PoE bütçesi, port profili ve kablolama kontrol listesi."], ["Kablosuz Erişim", "Depo dolaşımı, kanal planı, istemci kapasitesi ve kurumsal/misafir SSID ayrımı."], ["Segmentasyon", "POS, ofis, kamera, el terminali, misafir ve yönetim VLAN'ları için servis bazlı erişim matrisi."], ["Merkezi İşletim", "Konfigürasyon yedeği, WAN ve uplink izleme, olay sınıfları, sürüm takibi ve değişiklik kaydı."]],
    technicalNote: "Cihaz markasından bağımsız olarak hedef topoloji, ağ rolleri ve işletim standartları önce tanımlandı; ürün seçimi kapasite, desteklenebilirlik ve yaşam döngüsü gereksinimlerine göre yapıldı.",
    process: [["Envanter", "27 mağaza, iki depo ve merkez için cihaz, port, hat ve IP bilgileri toplandı."], ["Saha Ölçümü", "Üç mağaza tipinde ve depoda PoE, uplink, RF kapasitesi ve dolaşım noktaları doğrulandı."], ["Pilot", "İki mağaza ve bir depoda segmentasyon, POS akışı ve ikincil WAN senaryoları test edildi."], ["Dalgalı Geçiş", "Lokasyonlar tip ve risk seviyesine göre gruplandırılarak yeni şablona geçirildi."], ["Operasyon Devri", "İzleme ekranı, konfigürasyon yedeği, olay matrisi ve açılış kontrol listesi teslim edildi."]],
    outcomeLead: "POS, ofis, kamera, misafir ve depo cihazları; 30 lokasyonda aynı ağ rolleri ve merkezi işletim kurallarıyla yönetilir hale getirildi.",
    outcome: ["Destek ekibi bir mağaza olayını standart topoloji üzerinden inceleyebilir, uplink, WAN, switch portu veya kablosuz istemci katmanını ortak izleme verisiyle ayırabilir hale geldi. Yeni mağaza açılışları için cihaz rolleri, port profilleri, SSID'ler ve kabul testleri tek şablona bağlandı.", "Teslim raporunda lokasyon tipleri, hedef topolojiler, IP/VLAN planı, servis erişim matrisi, depo RF yerleşim prensipleri, ikincil WAN test senaryosu, konfigürasyon yedek prosedürü ve mağaza açılış kontrol listesi yer aldı. Ölçülmüş kesinti verisi paylaşılmadığı için süreklilik yüzdesi kullanılmadı."],
    related: [["Network Çözümleri", routes.network], ["Sistem Çözümleri", routes.system], ["Teknoloji Danışmanlığı", routes.solutions]]
  },
  system: {
    title: "ERP ve Mühendislik İş Yüklerinin Modernizasyonu",
    imagePath: "/assets/images/projects/system-modernization-cover-v2.webp",
    client: "Anonim endüstriyel üretici",
    industry: "Endüstriyel Üretim",
    services: "Sanallaştırma · Yedekleme · İzleme · İş Sürekliliği",
    status: "Anonim vaka raporu",
    code: "SYS / 04",
    visualLabel: "Üretim sistemleri modernizasyonu",
    visualCaption: "ERP · CAD dosyaları · 9 fiziksel sunucu",
    summary: "ERP veritabanı, üretim planlama uygulaması, Active Directory/DNS ve CAD dosya servislerini çalıştıran dokuz yaşlı fiziksel sunucuyu; doğrulanabilir yedekleme ve merkezi izleme içeren sanallaştırılmış hedef mimariye taşıyan sistem projesi.",
    need: ["ERP veritabanı ve uygulama sunucusu, üretim planlama servisi, Active Directory/DNS ve mühendislik ekibinin CAD dosya alanı dokuz fiziksel sunucu üzerinde çalışıyordu. İki sunucu donanım desteği dışındaydı; uygulama bağlantıları ve servis hesapları güncel envanterde bulunmadığı için planlı bakım öncesinde hangi sistemin etkileneceği kesin olarak görülemiyordu.", "Günlük yedeklerin bir bölümü üretim sistemleriyle aynı depolama alanında tutuluyor, CAD dosyaları farklı bir görevle korunuyor ve ERP geri dönüşü yalnızca dosya seviyesinde kontrol ediliyordu. Yönetim, donanım yenilemesi kadar ERP için dört saatlik geri dönüş hedefi, CAD verisi için daha sık kurtarma noktası ve bakım sırasında tek düğüm kaybını karşılayacak kapasite istedi."],
    approach: ["Dokuz fiziksel sunucuda dört haftalık CPU, bellek, disk gecikmesi ve büyüme verisi toplandı. Uygulama sahipleriyle ERP istemci bağlantıları, lisans servisleri, dosya paylaşımları, zamanlanmış görevler, servis hesapları ve DNS bağımlılıkları çıkarıldı; her iş yüküne RPO, RTO, bakım penceresi ve geri dönüş sahibi atandı.", "Hedef kapasite N+1 bakım senaryosuna göre modellendi. Önce bağımsız dosya ve yardımcı servisler pilot gruba alındı; ERP veritabanı geçişi için uygulama durdurma, son yedek, veri doğrulama, DNS değişimi ve geri alma adımları dakika seviyesinde runbook'a dönüştürüldü."],
    solution: ["Üç düğümlü sanallaştırma kümesi, ayrılmış yönetim ağı ve iş yükü kritikliğine göre kaynak rezervleri tasarlandı. ERP veritabanı ile uygulama katmanı farklı sanal makinelerde tutuldu; CAD dosya alanı kapasite ve dosya sayısı artışına göre ayrı depolama politikasıyla ele alındı. Yönetim erişimi günlük kullanıcı ağından ayrıldı ve ayrı yetki gruplarına bağlandı.", "Yedekleme mimarisinde üretim depolamasından bağımsız depo, iş yükü bazlı saklama politikası ve değiştirilemez ikinci kopya prensibi kullanıldı. ERP için uygulama tutarlı yedek ve kontrollü geri dönüş, CAD alanı için örnek klasör geri yükleme, Active Directory için sistem durumu senaryosu takvime bağlandı. Kaynak, servis ve yedekleme olayları merkezi izleme eşikleriyle ilişkilendirildi."],
    technicalIntro: "Hedef yapı, ERP ve CAD iş yüklerinin farklı kurtarma gereksinimlerini korurken tek düğüm bakımını karşılayacak kapasite ve doğrulanabilir geri dönüş üzerine kuruldu.",
    architecture: [["Hesaplama Kümesi", "Üç sanallaştırma düğümü, N+1 kaynak rezervi, iş yükü grupları ve kontrollü bakım sırası."], ["İş Yükü Ayrımı", "ERP veritabanı/uygulama ayrımı, CAD dosya politikası, AD/DNS servisleri ve lisans bağımlılıkları."], ["Veri Koruma", "Bağımsız yedek deposu, değiştirilemez ikinci kopya, iş yükü bazlı saklama ve geri dönüş testleri."], ["Operasyon", "Yönetim ağı, ayrı yetki grupları, kapasite ve servis eşikleri, geçiş/geri alma runbook'ları."]],
    technicalNote: "Hedef platform, yalnızca donanım yenilemesi olarak değil; kapasite planlama, geri dönüş doğrulama ve sürdürülebilir işletim süreçlerini birlikte iyileştiren bir sistem olarak tasarlandı.",
    process: [["Ölçüm", "Dokuz sunucuda dört haftalık kaynak ve disk gecikmesi verisi toplandı."], ["Bağımlılık", "ERP, CAD, AD/DNS, lisans ve servis hesabı ilişkileri iş yükü envanterine işlendi."], ["Pilot", "Yardımcı servisler taşındı; yedek ve geri alma adımları gerçek sistemde doğrulandı."], ["Kritik Geçiş", "ERP ve CAD geçişleri ayrı bakım penceresi ve onay kapılarıyla yürütüldü."], ["Devir", "Kapasite eşikleri, geri dönüş takvimi ve operasyon runbook'ları sistem ekibine aktarıldı."]],
    outcomeLead: "ERP, üretim planlama ve CAD iş yükleri; bağımlılıkları, kurtarma hedefleri ve bakım adımları dokümante edilmiş ortak sistem mimarisine taşındı.",
    outcome: ["Operasyon ekibi hangi sanal iş yükünün hangi uygulama, servis hesabı, veri alanı ve kurtarma planına bağlı olduğunu tek envanterden izleyebilir hale geldi. Yedekleme kontrolü görev başarısından çıkarılarak ERP, CAD ve dizin hizmetleri için planlı geri dönüş senaryolarıyla ilişkilendirildi.", "Teslim raporunda dört haftalık kapasite tabanı, N+1 hedef modeli, iş yükü ve bağımlılık envanteri, ERP geçiş/geri alma runbook'u, yedekleme ve saklama matrisi, geri dönüş test takvimi ve izleme eşikleri yer aldı. Canlı süreklilik ölçümü paylaşılmadığı için uptime iddiası kullanılmadı."],
    related: [["Sistem Çözümleri", routes.system], ["Network Çözümleri", routes.network], ["Teknoloji Danışmanlığı", routes.solutions]]
  },
  consulting: {
    title: "Üç Şirketli Grup İçin 24 Aylık Teknoloji Yol Haritası",
    imagePath: "/assets/images/projects/consulting-roadmap-cover-v2.webp",
    client: "Anonim şirketler grubu",
    industry: "Dağıtım, Servis ve Üretim",
    services: "Mevcut Durum · Mimari Karar · Portföy Önceliği",
    status: "Anonim vaka raporu",
    code: "CONS / 05",
    visualLabel: "24 aylık yatırım portföyü",
    visualCaption: "46 uygulama · 7 sözleşme · 34 yatırım talebi",
    summary: "Dağıtım, teknik servis ve üretim şirketlerinden oluşan grupta 46 uygulama, yedi kritik tedarikçi sözleşmesi ve 34 yatırım talebini ortak bağımlılık ve öncelik modeline dönüştüren teknoloji yol haritası çalışması.",
    need: ["Üç şirketin teknoloji bütçeleri ayrı hazırlanıyor; aynı müşteri verisi farklı CRM ve servis uygulamalarında tutuluyor, iki şirket birbirinden habersiz doküman yönetimi ürünü değerlendiriyor, altyapı ekibi ise kimlik ve yedekleme yatırımlarını uygulama projelerinden bağımsız planlıyordu. İlk envanterde 46 aktif uygulama, yedi kritik destek sözleşmesi ve sahipliği net olmayan dokuz entegrasyon tespit edildi.", "Yönetim kuruluna sunulan 34 yatırım talebi ürün adı ve yaklaşık maliyet içeriyor ancak hangi iş riskini azalttığı, hangi sisteme bağımlı olduğu ve iç ekip kapasitesini ne kadar kullanacağı ortak formatta görünmüyordu. Özellikle ERP sürüm geçişi, ortak kimlik yönetimi, saha servis uygulaması ve veri ambarı talepleri aynı uzmanlara ve entegrasyon noktalarına bağımlıydı."],
    approach: ["Finans, satış, saha servis, üretim ve BT ekipleriyle 18 yapılandırılmış görüşme yapıldı. Uygulama envanteri sahip, kullanıcı grubu, veri alanı, entegrasyon, sözleşme bitişi, kritik operasyon ve bilinen risk bilgileriyle genişletildi; dokuz sahipsiz entegrasyon için teknik ve operasyonel sorumlular belirlendi.", "Otuz dört talep; yasal/zorunlu gereksinim, operasyonel risk, gelir süreci etkisi, mimari bağımlılık, iç kapasite, tedarikçi bağımlılığı ve toplam yaşam döngüsü yükü üzerinden puanlandı. Aynı kabiliyeti hedefleyen talepler birleştirildi; ERP geçişi, kimlik standardı ve ana veri sahipliği tamamlanmadan başlayamayacak projeler bağımlılık haritasında işaretlendi."],
    solution: ["Yatırım listesi on bir program paketine dönüştürüldü. İlk altı ay için kimlik, yedekleme, uygulama sahipliği ve entegrasyon görünürlüğü gibi temel riskler; ikinci faz için ERP ve saha servis entegrasyonları; sonraki faz için ortak analitik ve müşteri veri modeli planlandı. Her paket için sponsor, teknik sahip, ön koşul, karar kapısı ve bütçe sınıfı tanımlandı.", "Yeni yatırım talepleri için tek sayfalık iş problemi formu, mimari değerlendirme kontrolü ve portföy kurulunda aylık öncelik gözden geçirme ritmi kuruldu. Sözleşme bitiş tarihleri yol haritasına bağlandı; tedarikçi yenileme kararları hedef mimari ve geçiş takvimiyle aynı toplantıda değerlendirilir hale getirildi."],
    technicalIntro: "Yol haritası, 46 uygulamanın sahiplik ve entegrasyon verisini 34 yatırım talebiyle bağlayan portföy modeli üzerinde oluşturuldu.",
    architecture: [["Uygulama Portföyü", "46 uygulama için sahiplik, kullanıcı, veri alanı, entegrasyon, sözleşme ve kritiklik kaydı."], ["Bağımlılık Haritası", "ERP, kimlik, ana veri, dokuz entegrasyon ve ortak ekip kapasitesi ilişkileri."], ["Program Paketleri", "34 talebin birleştirildiği on bir paket; ön koşul, sponsor, teknik sahip ve karar kapıları."], ["Portföy Yönetişimi", "Aylık öncelik kurulu, mimari kontrol, sözleşme takvimi ve yol haritası değişiklik kaydı."]],
    technicalNote: "Öneriler ürün veya marka seçiminden önce mimari rol, işletim sorumluluğu ve toplam yaşam döngüsü etkisi üzerinden tanımlandı; satın alma kararları bu çerçevenin sonraki adımı olarak bırakıldı.",
    process: [["Portföy Envanteri", "46 uygulama, yedi kritik sözleşme ve dokuz sahipsiz entegrasyon kaydedildi."], ["İş Görüşmeleri", "Beş iş alanıyla 18 görüşmede risk, hedef ve yatırım gerekçeleri doğrulandı."], ["Öncelik Modeli", "34 talep yedi ortak kriterle puanlandı ve tekrar eden kapsamlar birleştirildi."], ["24 Aylık Plan", "On bir program paketi ön koşul, sponsor, kapasite ve karar kapılarıyla sıralandı."], ["Yönetişim", "Aylık portföy kurulu, mimari kontrol ve sözleşme takibi çalışma ritmine bağlandı."]],
    outcomeLead: "Otuz dört teknoloji talebi, bağımlılıkları ve sahipleri tanımlı on bir program paketinden oluşan 24 aylık portföye dönüştürüldü.",
    outcome: ["Yönetim; ERP geçişi, ortak kimlik, saha servis uygulaması ve analitik yatırımlarını aynı bağımlılık haritasında değerlendirebilir hale geldi. Hangi girişimin önce bir veri sahipliği, entegrasyon veya ekip kapasitesi kararına ihtiyaç duyduğu açıkça görüldü; ürün yenileme kararları sözleşme bitişleriyle birlikte planlandı.", "Teslim raporunda 46 uygulamalık portföy envanteri, dokuz entegrasyonun sorumluluk haritası, yedi kriterli öncelik modeli, on bir program paketi, 24 aylık yol haritası, karar kapıları ve aylık portföy kurulu çalışma tanımı yer aldı. Finansal gerçekleşme verisi bulunmadığı için tasarruf veya yatırım geri dönüşü iddiası kullanılmadı."],
    related: [["Teknoloji Danışmanlığı", routes.solutions], ["Yazılım Çözümleri", routes.software], ["Sistem Çözümleri", routes.system]]
  }
};

function applyCaseStudyData(root) {
  const title = root.querySelector("[data-case-title]");
  if (!title) return;

  const caseSlug = normalizeRoutePath(renderedUrl.pathname).split("/").pop();
  const requestedProject = renderedUrl.searchParams.get("project");
  const requestedKey = caseStudyKeysBySlug[caseSlug] || requestedProject;
  if (!requestedKey || !caseStudyData[requestedKey]) {
    const pageRoot = root.matches?.("main.site-main") ? root : root.querySelector?.("main.site-main");
    if (pageRoot) {
      pageRoot.innerHTML = '<section class="section"><div class="container"><div class="cta-panel not-found-panel"><span class="article-meta">404</span><h1>Referans bulunamadı.</h1><p>Aradığınız referans kaldırılmış veya adresi yanlış yazılmış olabilir.</p><div class="button-row"><a class="btn" href="/referanslarimiz">Tüm Referanslara Dön →</a></div></div></div></section>';
    }
    document.title = "Referans Bulunamadı | NODVIRA";
    return;
  }
  const key = requestedKey;
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

  const detailVisual = root.querySelector(".case-detail-visual");
  if (detailVisual && data.imagePath) {
    detailVisual.classList.add("has-uploaded-image");
    detailVisual.setAttribute("aria-label", `${data.title} proje kapak görseli`);
    detailVisual.style.backgroundImage = `linear-gradient(rgba(7,18,34,.2), rgba(7,18,34,.46)), url("${data.imagePath}")`;
  }

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
    previousLink.href = caseStudyUrl(previousKey);
    previousLink.querySelector("strong").textContent = caseStudyData[previousKey].title;
  }
  if (nextLink) {
    nextLink.href = caseStudyUrl(nextKey);
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
  return pageKeyFromUrl(renderedUrl) || "index.html";
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
    contentRoot.querySelectorAll(`a[href="${routes.contact}"]`).forEach((link) => {
      link.href = `${routes.contact}?hizmet=${context.project}`;
    });
    contentRoot.querySelectorAll(`a[href="${routes.projects}"]`).forEach((link) => {
      link.href = `${routes.projects}?filter=${context.project}`;
    });
    contentRoot.querySelectorAll(`a[href="${routes.caseStudy}"]`).forEach((link) => {
      link.href = caseStudyUrl(context.project);
    });
  }

  const faqDestinations = {
    about: routes.about,
    web: routes.web,
    software: routes.software,
    network: routes.network,
    system: routes.system,
    consulting: routes.solutions,
    process: routes.services
  };
  contentRoot.querySelectorAll(".faq-item[data-category]").forEach((item) => {
    const destination = faqDestinations[item.dataset.category];
    const link = item.querySelector(`.faq-answer a[href="${routes.services}"]`);
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
    consulting: "Teknoloji Danışmanlığı",
    privacy: "KVKK Başvurusu"
  };
  const requestedKey = renderedUrl.searchParams.get("konu") === "kvkk"
    ? "privacy"
    : renderedUrl.searchParams.get("hizmet");
  const requestedService = serviceNames[requestedKey];
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
    icon.src = "/assets/icons/chevron-right.svg";
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
    image.className = "hero-brand-symbol hero-brand-icon";
    image.src = "/assets/favicon.svg?v=20260922-hero02";
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
    customSelect.innerHTML = `<button class="custom-select-trigger" type="button" aria-haspopup="listbox" aria-expanded="false" aria-controls="${listboxId}"><span class="custom-select-value"></span><img src="/assets/icons/chevron-down.svg" alt="" aria-hidden="true"></button><div class="custom-select-panel" id="${listboxId}" role="listbox" tabindex="-1"></div>`;
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
  const fileName = pageKeyFromUrl(activeUrl) || "index.html";
  const visuals = {
    "web-tasarim.html": { variant: "web-v2", label: "Responsive Deneyim ve Performans Sistemi", code: "WEB / 01", scene: `<div class="web-v2-browser"><header><i></i><i></i><i></i><span></span></header><div class="web-v2-browser-body"><aside class="web-v2-sidebar"><b></b><span></span><span></span><span></span><span></span></aside><div class="web-v2-canvas"><div class="web-v2-grid-guides">${"<i></i>".repeat(4)}</div><div class="web-v2-copy"><em></em><b></b><span></span><span></span></div><div class="web-v2-cards">${"<article><i></i><b></b><span></span></article>".repeat(3)}</div><footer><i></i><span></span><span></span></footer></div></div></div><div class="web-v2-device"><i></i><div><em></em><b></b><span></span><span></span><span></span></div><footer></footer></div><div class="web-v2-sync-lines"><span></span><span></span><span></span></div><div class="web-v2-breakpoints"><span><em>DESKTOP</em><i></i></span><span><em>TABLET</em><i></i></span><span><em>MOBILE</em><i></i></span></div><div class="web-v2-quality"><span><em>PERF</em><i></i></span><span><em>A11Y</em><i></i></span><span><em>SEO</em><i></i></span></div>` },
    "yazilim-cozumleri.html": { variant: "software-v2", label: "Modüler Uygulama ve Entegrasyon Mimarisi", code: "YAZILIM / 02", scene: `<div class="software-v2-sources"><article><i></i><b></b><span></span></article><article><i></i><b></b><span></span></article><article><i></i><b></b><span></span></article></div><div class="software-v2-connectors">${"<span></span>".repeat(6)}</div><div class="software-v2-core"><div class="software-v2-corebar"><i></i><i></i><i></i><span></span></div><div class="software-v2-modules">${"<article><i></i><b></b><span></span></article>".repeat(4)}</div></div><div class="software-v2-integrations"><article><i></i><b></b></article><article><i></i><b></b></article><article><i></i><b></b></article></div><div class="software-v2-release">${"<span></span>".repeat(5)}</div><div class="software-v2-state">${"<i></i>".repeat(4)}</div>` },
    "network.html": { variant: "network-v3", label: "Segmentasyon, Erişim ve Ağ Görünürlüğü", code: "NETWORK / 03", scene: `<div class="network-v3-zones"><article class="zone-lan"><em>LAN</em><div>${"<i></i>".repeat(4)}</div></article><article class="zone-wlan"><em>WLAN</em><div><i></i><i></i><i></i><b></b></div></article><article class="zone-wan"><em>WAN</em><div><i></i><b></b><span></span></div></article><article class="zone-systems"><em>SİSTEM</em><div>${"<span><i></i><b></b></span>".repeat(3)}</div></article></div><div class="network-v3-paths"><span class="path-lan"></span><span class="path-wlan"></span><span class="path-wan"></span><span class="path-systems"></span></div><div class="network-v3-core"><header><em>CORE</em><span></span></header><div class="network-v3-ports">${"<i></i>".repeat(8)}</div><footer><b></b><span></span><span></span></footer></div><div class="network-v3-policy"><i></i><b></b><span></span></div><div class="network-v3-telemetry">${"<i></i>".repeat(8)}</div><div class="network-v3-controls"><span><i></i><em>SEGMENT</em></span><span><i></i><em>MONITOR</em></span><span><i></i><em>OPTIMIZE</em></span></div>` },
    "sistem-cozumleri.html": { variant: "system-v2", label: "Sanallaştırma, İzleme ve Süreklilik Mimarisi", code: "SİSTEM / 04", scene: `<div class="system-v2-monitor"><div class="system-v2-chart">${"<i></i>".repeat(6)}</div><div class="system-v2-health"><i></i><b></b><span></span></div></div><div class="system-v2-hosts"><article><header><i></i><b></b></header><div>${"<span></span>".repeat(4)}</div><footer><i></i><b></b></footer></article><article><header><i></i><b></b></header><div>${"<span></span>".repeat(4)}</div><footer><i></i><b></b></footer></article></div><div class="system-v2-fabric">${"<span></span>".repeat(4)}</div><div class="system-v2-storage"><i></i><i></i><i></i><b></b></div><div class="system-v2-backup">${"<i></i>".repeat(4)}<span></span></div>` },
    "cozumler.html": { variant: "consult-v2", label: "Mevcut Durumdan Uygulama Yol Haritasına", code: "DANIŞMANLIK / 05", scene: `<div class="consult-v2-evidence"><header><i></i><i></i><i></i><span></span></header><div>${"<i></i>".repeat(6)}</div><footer><span></span><span></span><span></span></footer></div><div class="consult-v2-priority"><span><i></i></span><span><i></i></span><span><i></i></span></div><div class="consult-v2-connectors"><span></span><span></span><span></span></div><div class="consult-v2-matrix">${"<i></i>".repeat(16)}</div><div class="consult-v2-target"><header><i></i><b></b></header><div>${"<span></span>".repeat(4)}</div></div><div class="consult-v2-roadmap">${"<span></span>".repeat(6)}</div>` },
    "hizmetler.html": { variant: "services-v2", label: "Beş Yetkinlik, Tek Teknoloji Ekosistemi", code: "HİZMETLER / 05", scene: `<div class="services-v2-board"><article class="services-v2-domain domain-web"><em>WEB</em><div class="services-v2-web"><header><i></i><i></i><i></i></header><b></b><span></span><footer><i></i><i></i><i></i></footer></div></article><article class="services-v2-domain domain-software"><em>YAZILIM</em><div class="services-v2-software">${"<i></i>".repeat(4)}</div></article><article class="services-v2-domain domain-consult"><em>DANIŞMANLIK</em><div class="services-v2-consult"><i></i><i></i><i></i><span></span><span></span><span></span></div></article><article class="services-v2-domain domain-network"><em>NETWORK</em><div class="services-v2-network"><b></b>${"<i></i>".repeat(4)}<span></span><span></span></div></article><article class="services-v2-domain domain-system"><em>SİSTEM</em><div class="services-v2-system">${"<span><i></i><b></b></span>".repeat(3)}</div></article></div><div class="services-v2-phases"><span><em>CONNECT</em><i></i></span><span><em>BUILD</em><i></i></span><span><em>EVOLVE</em><i></i></span></div>` },
    "projeler.html": { variant: "references-v4", label: "Projeden Doğrulanmış Sonuca", code: "REFERANSLAR / 06", scene: `<article class="references-v4-brief"><header><i></i><div><b></b><span></span></div></header><em>PROJE GİRDİSİ</em><div class="references-v4-brief-lines">${"<span></span>".repeat(5)}</div><footer><i></i><i></i><i></i></footer></article><div class="references-v4-entry"><span></span></div><ol class="references-v4-route"><li><i>01</i><strong>İhtiyaç</strong><b></b></li><li><i>02</i><strong>Yaklaşım</strong><b></b></li><li><i>03</i><strong>Çözüm</strong><b></b></li><li><i>04</i><strong>Teknik Yaklaşım</strong><b></b></li><li><i>05</i><strong>Uygulama Süreci</strong><b></b></li><li><i>06</i><strong>Sonuç</strong><b></b></li></ol><div class="references-v4-exit"><span></span></div><article class="references-v4-result"><header><em>SONUÇ RAPORU</em><i></i></header><div class="references-v4-result-mark"><i></i><b></b><span></span></div><div class="references-v4-result-lines">${"<span></span>".repeat(3)}</div><div class="references-v4-result-metrics"><i></i><i></i><i></i><i></i></div><footer><span>DOĞRULANMIŞ ÇIKTI</span><b></b></footer></article><div class="references-v4-progress"><span></span></div>` },
    "hakkimda.html": { variant: "about-v4", label: "Beş Yetkinlikten Tek Teknoloji Vizyonuna", code: "NODVIRA / 05", scene: `<div class="about-v4-system"><div class="about-v4-capabilities"><article><span>01</span><em>WEB</em><i></i></article><article><span>02</span><em>YAZILIM</em><i></i></article><article><span>03</span><em>NETWORK</em><i></i></article><article><span>04</span><em>SİSTEM</em><i></i></article><article><span>05</span><em>DANIŞMANLIK</em><i></i></article></div><div class="about-v4-traces">${"<span></span>".repeat(5)}</div><div class="about-v4-bus"><i></i><b></b></div><div class="about-v4-brand"><div><img src="/assets/brand/nodvira-logo.svg?v=20260826-static1" alt=""></div><span>BAĞLANTILI TEKNOLOJİ VİZYONU</span></div><div class="about-v4-method"><span><i>01</i><em>CONNECT</em><b></b></span><span><i>02</i><em>BUILD</em><b></b></span><span><i>03</i><em>EVOLVE</em><b></b></span></div></div>` },
    "blog.html": { variant: "blog-v2", label: "", code: "", scene: `<div class="blog-v2-board"><div class="blog-v2-tabs">${"<i></i>".repeat(5)}</div><div class="blog-v2-pages"><article></article><article></article><article class="blog-v2-page"><header><div><i></i><i></i><i></i></div><span></span></header><div class="blog-v2-feature"><i></i><b></b><span></span></div><div class="blog-v2-copy">${"<span></span>".repeat(5)}</div><footer><i></i><i></i><i></i></footer></article></div><aside class="blog-v2-outline">${"<i></i>".repeat(5)}</aside><div class="blog-v2-progress"><span></span></div></div>` },
    "sss.html": { variant: "faq-v2", label: "", code: "", scene: `<div class="faq-v2-shell"><div class="faq-v2-query"><i></i><span></span><b></b></div><div class="faq-v2-body"><div class="faq-v2-list">${"<article><i></i><div><b></b><span></span></div><em></em></article>".repeat(4)}</div><div class="faq-v2-bridge"><span></span><i></i><b></b></div><article class="faq-v2-answer"><header><i></i><b></b></header><div>${"<span></span>".repeat(5)}</div><footer><i></i><span></span><span></span></footer></article></div></div>` },
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
    ${config.label || config.code ? `<div class="web-visual-index"><span>${config.label}</span><strong>${config.code}</strong></div>` : ""}`;
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
  if (window.PublicProjects) window.PublicProjects.init(root);
  initScrollMotion(root);
  root.querySelectorAll(".faq-question").forEach((button) => {
    button.addEventListener("click", () => {
      const expanded = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!expanded));
    });
  });

  const faqList = root.querySelector(".faq-list");
  const resetFaqScroll = () => faqList?.scrollTo({ top: 0, behavior: reducedMotion.matches ? "auto" : "smooth" });
  const faqSearch = root.querySelector("#faq-search");
  const faqItems = [...root.querySelectorAll(".faq-item[data-category]")];
  const faqCategoryButtons = [...root.querySelectorAll(".faq-category")];
  const faqEmptyState = root.querySelector("[data-faq-empty]");
  const faqStatus = root.querySelector("[data-faq-status]");
  let activeFaqCategory = faqCategoryButtons.find((button) => button.classList.contains("active"))?.dataset.category || "all";

  const applyFaqFilters = () => {
    const query = faqSearch?.value.trim().toLocaleLowerCase("tr") || "";
    let visibleCount = 0;

    faqCategoryButtons.forEach((button) => {
      const active = button.dataset.category === activeFaqCategory;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    faqItems.forEach((item) => {
      const categoryMatches = activeFaqCategory === "all" || item.dataset.category === activeFaqCategory;
      const queryMatches = !query || item.textContent.toLocaleLowerCase("tr").includes(query);
      const visible = categoryMatches && queryMatches;
      item.hidden = !visible;
      if (visible) visibleCount += 1;
    });

    if (faqEmptyState) faqEmptyState.hidden = visibleCount > 0;
    if (faqStatus) faqStatus.textContent = visibleCount
      ? `${visibleCount} soru gösteriliyor.`
      : "Aramanızla eşleşen soru bulunamadı.";
    resetFaqScroll();
  };

  faqCategoryButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeFaqCategory = button.dataset.category || "all";
      applyFaqFilters();
    });
  });
  faqSearch?.addEventListener("input", applyFaqFilters);
  if (faqItems.length) applyFaqFilters();

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
