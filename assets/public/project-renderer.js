(function (global) {
  "use strict";

  const initializedRoots = new WeakSet();
  let apiUnavailable = false;

  function endpoint(path = "") {
    if (global.NODVIRA_API_BASE) return `${String(global.NODVIRA_API_BASE).replace(/\/$/, "")}/api/projects${path}`;
    const local = ["127.0.0.1", "localhost"].includes(global.location.hostname);
    if (global.location.protocol === "file:" || (local && global.location.port !== "3000")) return `http://127.0.0.1:3000/api/projects${path}`;
    return `/api/projects${path}`;
  }

  function mediaUrl(path) {
    if (!String(path || "").startsWith("/uploads/")) return path || "";
    return new URL(path, new URL(endpoint(), global.location.href).origin).href;
  }

  function setMeta(selector, value) {
    let tag = document.head.querySelector(selector);
    if (!tag) {
      tag = document.createElement("meta");
      const match = selector.match(/meta\[(name|property)="([^"]+)"\]/);
      if (match) tag.setAttribute(match[1], match[2]);
      document.head.append(tag);
    }
    tag.content = value;
  }

  function applyProjectSeo(project, activeUrl) {
    const canonicalUrl = `${activeUrl.origin}/referanslarimiz/${encodeURIComponent(project.slug)}`;
    const seoTitle = project.seoTitle || `${project.title} | NODVIRA`;
    const description = project.metaDescription || project.summary;
    const image = project.imagePath ? mediaUrl(project.imagePath) : "";
    document.title = seoTitle;
    setMeta('meta[name="description"]', description);
    setMeta('meta[property="og:title"]', seoTitle);
    setMeta('meta[property="og:description"]', description);
    setMeta('meta[property="og:type"]', "article");
    setMeta('meta[property="og:url"]', canonicalUrl);
    setMeta('meta[name="twitter:card"]', image ? "summary_large_image" : "summary");
    if (image) {
      setMeta('meta[property="og:image"]', image);
      setMeta('meta[property="og:image:alt"]', project.imageAlt || project.title);
      setMeta('meta[name="twitter:image"]', image);
    }
    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement("link"); canonical.rel = "canonical"; document.head.append(canonical); }
    canonical.href = canonicalUrl;
    document.querySelector("#dynamic-content-jsonld")?.remove();
    const jsonLd = document.createElement("script");
    jsonLd.id = "dynamic-content-jsonld";
    jsonLd.type = "application/ld+json";
    jsonLd.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@graph": [
        { "@type": "CreativeWork", name: project.title, description, image: image || undefined,
          datePublished: project.publishedAt, dateModified: project.updatedAt || project.publishedAt,
          publisher: { "@type": "Organization", name: "NODVIRA" }, url: canonicalUrl },
        { "@type": "BreadcrumbList", itemListElement: [
          { "@type": "ListItem", position: 1, name: "Ana Sayfa", item: `${activeUrl.origin}/` },
          { "@type": "ListItem", position: 2, name: "Referanslarımız", item: `${activeUrl.origin}/referanslarimiz` },
          { "@type": "ListItem", position: 3, name: project.title, item: canonicalUrl },
        ] },
      ],
    });
    document.head.append(jsonLd);
  }

  async function request(path = "", parameters = null) {
    if (apiUnavailable) throw new Error("Referans API kullanılamıyor.");
    const url = new URL(endpoint(path), global.location.href);
    Object.entries(parameters || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, value);
    });
    const controller = new AbortController();
    const timeout = global.setTimeout(() => controller.abort(), 4_000);
    try {
      const response = await fetch(url, { headers: { Accept: "application/json" }, signal: controller.signal });
      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) { apiUnavailable = true; throw new Error("Referans API JSON yanıtı vermedi."); }
      const result = await response.json();
      if (!response.ok) { const error = new Error(result.message || "Referans isteği başarısız oldu."); error.status = response.status; throw error; }
      return result;
    } catch (error) {
      if (!error.status) apiUnavailable = true;
      throw error;
    } finally { global.clearTimeout(timeout); }
  }

  function element(tag, className, text) {
    const item = document.createElement(tag);
    if (className) item.className = className;
    if (text !== undefined) item.textContent = text;
    return item;
  }

  function createCard(project) {
    const article = element("article", "case-showcase-item");
    article.dataset.projectCategory = project.category;
    const visual = element("div", "case-showcase-visual");
    visual.setAttribute("role", "img");
    visual.setAttribute("aria-label", project.imageAlt || `${project.title} proje kapağı`);
    if (project.imagePath) {
      visual.classList.add("has-uploaded-image");
      visual.style.backgroundImage = `url("${mediaUrl(project.imagePath)}")`;
    }
    visual.append(element("span", "", project.visual.label), element("small", "", project.visual.caption));
    const content = element("div", "case-showcase-content");
    content.append(element("h3", "", project.title), element("p", "case-showcase-summary", project.summary));
    const link = element("a", "case-showcase-link", "Projeyi İncele →");
    link.href = `/referanslarimiz/${encodeURIComponent(project.slug)}`;
    content.append(link);
    article.append(visual, content);
    return article;
  }

  async function renderList(root) {
    const showcase = root.querySelector(".case-showcase");
    if (!showcase) return;
    try {
      const result = await request("", { limit: 100 });
      const projects = result.items;
      const buttons = [...root.querySelectorAll(".filter-button[data-filter]")];
      const pageList = root.querySelector("[data-project-page-list]");
      const pagination = root.querySelector("[data-project-pagination]");
      const previous = root.querySelector("[data-project-page-prev]");
      const next = root.querySelector("[data-project-page-next]");
      const status = root.querySelector("[data-project-page-status]");
      const empty = root.querySelector("[data-filter-empty]");
      const state = { category: "all", page: 1, pageSize: 5 };

      const draw = () => {
        const filtered = projects.filter((project) => state.category === "all" || project.category === state.category);
        const pages = Math.max(1, Math.ceil(filtered.length / state.pageSize));
        state.page = Math.min(state.page, pages);
        showcase.replaceChildren(...filtered.slice((state.page - 1) * state.pageSize, state.page * state.pageSize).map(createCard));
        if (empty) empty.hidden = filtered.length > 0;
        if (pagination) pagination.hidden = pages <= 1;
        if (pageList) {
          pageList.replaceChildren(...Array.from({ length: pages }, (_, index) => {
            const button = element("button", "references-page-number", String(index + 1));
            button.type = "button";
            if (index + 1 === state.page) button.setAttribute("aria-current", "page");
            button.addEventListener("click", () => { state.page = index + 1; draw(); });
            return button;
          }));
        }
        if (previous) previous.disabled = state.page === 1;
        if (next) next.disabled = state.page === pages;
        if (status) status.textContent = `${state.page}. referans sayfası gösteriliyor.`;
      };

      buttons.forEach((button) => button.addEventListener("click", () => {
        state.category = button.dataset.filter || "all";
        state.page = 1;
        buttons.forEach((candidate) => {
          const active = candidate === button;
          candidate.classList.toggle("active", active);
          candidate.setAttribute("aria-pressed", String(active));
        });
        draw();
      }));
      previous?.addEventListener("click", () => { if (state.page > 1) { state.page -= 1; draw(); } });
      next?.addEventListener("click", () => { state.page += 1; draw(); });
      draw();
    } catch (error) {
      if (!apiUnavailable) console.error("Referans listesi yüklenemedi.", error);
    }
  }

  function paragraphs(container, values) {
    if (container) container.replaceChildren(...(values || []).map((text) => element("p", "", text)));
  }

  async function renderDetail(root) {
    if (!root.querySelector("[data-case-title]")) return;
    const activeUrl = new URL(global.history?.state?.href || global.location.href, global.location.href);
    const slug = decodeURIComponent(activeUrl.pathname).match(/^\/referanslarimiz\/([^/]+)\/?$/)?.[1];
    if (!slug) return;
    try {
      const result = await request(`/${encodeURIComponent(slug)}`);
      const project = result.item;
      applyProjectSeo(project, activeUrl);
      const data = project.content || {};
      const values = {
        "[data-case-title]": project.title, "[data-case-current]": project.title, "[data-case-summary]": project.summary,
        "[data-case-client]": data.client, "[data-case-industry]": data.industry, "[data-case-services]": data.services,
        "[data-case-status]": data.reportStatus, "[data-case-visual-label]": data.visualLabel,
        "[data-case-visual-caption]": data.visualCaption, "[data-case-technical-intro]": data.technicalIntro,
        "[data-case-technical-note]": data.technicalNote, "[data-case-outcome-lead]": data.outcomeLead,
      };
      Object.entries(values).forEach(([selector, value]) => { const target = root.querySelector(selector); if (target && value) target.textContent = value; });
      const detailVisual = root.querySelector(".case-detail-visual");
      if (detailVisual && project.imagePath) {
        detailVisual.classList.add("has-uploaded-image");
        detailVisual.setAttribute("aria-label", project.imageAlt || `${project.title} proje kapağı`);
        detailVisual.style.backgroundImage = `linear-gradient(rgba(7,18,34,.2), rgba(7,18,34,.46)), url("${mediaUrl(project.imagePath)}")`;
      }
      paragraphs(root.querySelector("[data-case-need]"), data.need);
      paragraphs(root.querySelector("[data-case-approach]"), data.approach);
      paragraphs(root.querySelector("[data-case-solution]"), data.solution);
      paragraphs(root.querySelector("[data-case-outcome]"), data.outcome);

      const architecture = root.querySelector("[data-case-architecture]");
      if (architecture) architecture.replaceChildren(...(data.architecture || []).map(([title, copy], index) => {
        const item = element("div"); item.append(element("span", "", String(index + 1).padStart(2, "0")), element("strong", "", title), element("p", "", copy)); return item;
      }));
      const process = root.querySelector("[data-case-process]");
      if (process) process.replaceChildren(...(data.process || []).map(([title, copy], index) => {
        const item = element("li", "diagram-step");
        const content = element("div", "diagram-step-content"); content.append(element("h3", "", title), element("p", "", copy));
        item.append(element("span", "diagram-step-number", String(index + 1).padStart(2, "0")), content); return item;
      }));
      root.querySelectorAll("[data-case-related]").forEach((link, index) => {
        const related = data.related?.[index];
        let safeHref = null;
        if (related) {
          const candidate = String(related[1] || "").trim();
          if (candidate.startsWith("/") && !candidate.startsWith("//") && !candidate.includes("\\")) {
            safeHref = candidate;
          } else {
            try {
              const url = new URL(candidate);
              if (url.protocol === "https:" && !url.username && !url.password) safeHref = url.href;
            } catch (_) {}
          }
        }
        link.hidden = !safeHref;
        if (!safeHref) {
          link.removeAttribute("href");
          return;
        }
        link.href = safeHref;
        link.querySelector("span").textContent = related[0];
      });
      const previous = root.querySelector("[data-case-previous]");
      const next = root.querySelector("[data-case-next]");
      if (previous && result.navigation.previous) { previous.href = `/referanslarimiz/${result.navigation.previous.slug}`; previous.querySelector("strong").textContent = result.navigation.previous.title; }
      if (next && result.navigation.next) { next.href = `/referanslarimiz/${result.navigation.next.slug}`; next.querySelector("strong").textContent = result.navigation.next.title; }
    } catch (error) {
      if (error.status === 404) {
        const title = root.querySelector("[data-case-title]");
        if (title) title.textContent = "Referans bulunamadı.";
      } else if (!apiUnavailable) console.error("Referans detayı yüklenemedi.", error);
    }
  }

  function init(root) {
    if (!root || initializedRoots.has(root)) return;
    initializedRoots.add(root);
    renderList(root);
    renderDetail(root);
  }

  global.PublicProjects = Object.freeze({ init });
})(window);
