(function (global) {
  "use strict";

  const CATEGORY_LABELS = { network: "Network", system: "Sistem", web: "Web Teknolojileri", software: "Yazılım", transformation: "Dijital Dönüşüm", consulting: "Teknoloji Danışmanlığı", management: "Teknoloji Danışmanlığı" };
  const SERVICE_LINKS = { network: "/hizmetlerimiz/network-cozumleri", system: "/hizmetlerimiz/sistem-cozumleri", web: "/hizmetlerimiz/web-cozumleri", software: "/hizmetlerimiz/yazilim-cozumleri", transformation: "/hizmetlerimiz/teknoloji-danismanligi", consulting: "/hizmetlerimiz/teknoloji-danismanligi", management: "/hizmetlerimiz/teknoloji-danismanligi" };
  const initializedRoots = new WeakSet();
  let apiUnavailable = false;

  function apiEndpoint(path = "") {
    if (global.NODVIRA_API_BASE) {
      return `${String(global.NODVIRA_API_BASE).replace(/\/$/, "")}/api/blog-posts${path}`;
    }
    const localHost = ["127.0.0.1", "localhost"].includes(global.location.hostname);
    if (global.location.protocol === "file:" || (localHost && global.location.port !== "3000")) {
      return `http://127.0.0.1:3000/api/blog-posts${path}`;
    }
    return `/api/blog-posts${path}`;
  }

  function mediaUrl(path) {
    if (!String(path || "").startsWith("/uploads/")) return path || "";
    return new URL(path, new URL(apiEndpoint(), global.location.href).origin).href;
  }

  function setMeta(selector, attribute, value) {
    let tag = document.head.querySelector(selector);
    if (!tag) {
      tag = document.createElement("meta");
      const match = selector.match(/meta\[(name|property)="([^"]+)"\]/);
      if (match) tag.setAttribute(match[1], match[2]);
      document.head.append(tag);
    }
    tag.setAttribute(attribute, value);
  }

  function applyBlogSeo(post, activeUrl) {
    const canonicalUrl = `${activeUrl.origin}/blog/${encodeURIComponent(post.slug)}`;
    const seoTitle = post.seoTitle || `${post.title} | NODVIRA`;
    const description = post.metaDescription || post.excerpt;
    const image = post.image ? mediaUrl(post.image) : "";
    document.title = seoTitle;
    setMeta('meta[name="description"]', "content", description);
    setMeta('meta[property="og:title"]', "content", seoTitle);
    setMeta('meta[property="og:description"]', "content", description);
    setMeta('meta[property="og:type"]', "content", "article");
    setMeta('meta[property="og:url"]', "content", canonicalUrl);
    setMeta('meta[name="twitter:card"]', "content", image ? "summary_large_image" : "summary");
    setMeta('meta[name="twitter:title"]', "content", seoTitle);
    setMeta('meta[name="twitter:description"]', "content", description);
    if (image) {
      setMeta('meta[property="og:image"]', "content", image);
      setMeta('meta[property="og:image:alt"]', "content", post.imageAlt || post.title);
      setMeta('meta[name="twitter:image"]', "content", image);
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
        { "@type": "BlogPosting", headline: post.title, description, image: image || undefined,
          datePublished: post.publishedAt, dateModified: post.updatedAt || post.publishedAt,
          author: { "@type": "Organization", name: post.authorName || "NODVIRA" },
          publisher: { "@type": "Organization", name: "NODVIRA" }, mainEntityOfPage: canonicalUrl },
        { "@type": "BreadcrumbList", itemListElement: [
          { "@type": "ListItem", position: 1, name: "Ana Sayfa", item: `${activeUrl.origin}/` },
          { "@type": "ListItem", position: 2, name: "Blog", item: `${activeUrl.origin}/blog` },
          { "@type": "ListItem", position: 3, name: post.title, item: canonicalUrl },
        ] },
      ],
    });
    document.head.append(jsonLd);
  }

  async function requestApi(path = "", parameters = null) {
    if (apiUnavailable) throw new Error("Blog API kullanılamıyor.");
    const url = new URL(apiEndpoint(path), global.location.href);
    if (parameters) {
      Object.entries(parameters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, value);
      });
    }
    const controller = new AbortController();
    const timeout = global.setTimeout(() => controller.abort(), 4_000);
    try {
      const response = await fetch(url, { headers: { Accept: "application/json" }, signal: controller.signal });
      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        apiUnavailable = true;
        throw new Error("Blog API JSON yanıtı vermedi.");
      }
      const result = await response.json();
      if (!response.ok) {
        const error = new Error(result.message || "Blog API isteği başarısız oldu.");
        error.status = response.status;
        throw error;
      }
      return result;
    } catch (error) {
      if (!error.status) apiUnavailable = true;
      throw error;
    } finally {
      global.clearTimeout(timeout);
    }
  }

  function createElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function readingTime(content) {
    const words = String(content || "").trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 200));
  }

  function publicationDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "gg/aa/yyyy";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${day}/${month}/${date.getFullYear()}`;
  }

  function activePageUrl() {
    const stateUrl = global.history?.state?.href;
    try {
      return new URL(stateUrl || global.location.href, global.location.href);
    } catch (_) {
      return new URL(global.location.href);
    }
  }

  function headingSlug(value) {
    return String(value).toLocaleLowerCase("tr-TR")
      .replaceAll("ı", "i").replaceAll("ğ", "g").replaceAll("ü", "u")
      .replaceAll("ş", "s").replaceAll("ö", "o").replaceAll("ç", "c")
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }

  function appendInlineContent(element, value) {
    const text = String(value || "");
    const linkPattern = /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g;
    let lastIndex = 0;
    let match;
    while ((match = linkPattern.exec(text))) {
      if (match.index > lastIndex) element.append(document.createTextNode(text.slice(lastIndex, match.index)));
      const link = createElement("a", "", match[1]);
      link.href = match[2];
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      element.append(link);
      lastIndex = linkPattern.lastIndex;
    }
    if (lastIndex < text.length) element.append(document.createTextNode(text.slice(lastIndex)));
  }

  function renderArticleContent(rawContent) {
    const container = createElement("div", "blog-detail-content");
    const headings = [];
    const usedHeadingIds = new Map();
    const lines = String(rawContent || "").split(/\r?\n/);

    for (let index = 0; index < lines.length;) {
      const line = lines[index].trim();
      if (!line) {
        index += 1;
        continue;
      }

      const headingMatch = line.match(/^(##|###)\s+(.+)$/);
      if (headingMatch) {
        const level = headingMatch[1].length;
        const label = headingMatch[2].trim();
        const baseId = headingSlug(label) || `bolum-${headings.length + 1}`;
        const occurrence = (usedHeadingIds.get(baseId) || 0) + 1;
        usedHeadingIds.set(baseId, occurrence);
        const id = occurrence === 1 ? baseId : `${baseId}-${occurrence}`;
        const heading = createElement(`h${level}`, "", label);
        heading.id = id;
        container.append(heading);
        headings.push({ id, label, level });
        index += 1;
        continue;
      }

      if (/^-\s+/.test(line)) {
        const list = document.createElement("ul");
        while (index < lines.length && /^-\s+/.test(lines[index].trim())) {
          const item = document.createElement("li");
          appendInlineContent(item, lines[index].trim().replace(/^-\s+/, ""));
          list.append(item);
          index += 1;
        }
        container.append(list);
        continue;
      }

      if (/^\d+\.\s+/.test(line)) {
        const list = document.createElement("ol");
        while (index < lines.length && /^\d+\.\s+/.test(lines[index].trim())) {
          const item = document.createElement("li");
          appendInlineContent(item, lines[index].trim().replace(/^\d+\.\s+/, ""));
          list.append(item);
          index += 1;
        }
        container.append(list);
        continue;
      }

      if (/^>\s?/.test(line)) {
        const quote = document.createElement("blockquote");
        appendInlineContent(quote, line.replace(/^>\s?/, ""));
        container.append(quote);
        index += 1;
        continue;
      }

      const paragraph = document.createElement("p");
      appendInlineContent(paragraph, line);
      container.append(paragraph);
      index += 1;
    }

    return { container, headings };
  }

  function createTableOfContents(headings) {
    const toc = createElement("aside", "card blog-detail-toc");
    toc.append(createElement("h2", "", "İçindekiler"));
    const list = document.createElement("ol");
    headings.filter((heading) => heading.level === 2).forEach((heading) => {
      const item = document.createElement("li");
      const link = createElement("a", "", heading.label);
      link.href = `#${heading.id}`;
      item.append(link);
      list.append(item);
    });
    toc.append(list);
    return toc;
  }

  function createPostCard(post) {
    const card = createElement("article", "card article-card");
    card.dataset.projectCategory = post.category;
    if (post.image) {
      const image = document.createElement("img");
      image.className = "article-image";
      image.src = mediaUrl(post.image);
      image.alt = post.imageAlt || `${post.title} kapak görseli`;
      image.loading = "lazy";
      card.append(image);
    } else {
      card.append(createElement("div", "visual-placeholder", `${CATEGORY_LABELS[post.category] || "Blog"} görseli`));
    }
    const metaRow = createElement("div", "article-card-meta");
    const category = createElement("span", "article-meta", `${CATEGORY_LABELS[post.category] || post.category} · ${post.readingTimeMinutes || readingTime(post.content)} DK.`);
    const date = createElement("time", "article-date", publicationDate(post.publishedAt || post.createdAt));
    if (post.publishedAt || post.createdAt) date.dateTime = post.publishedAt || post.createdAt;
    metaRow.append(category, date);
    card.append(metaRow, createElement("h3", "", post.title), createElement("p", "", post.excerpt));
    const link = createElement("a", "card-link", "Devamını Oku →");
    link.href = `/blog/${encodeURIComponent(post.slug)}`;
    card.append(link);
    return card;
  }

  function staticBlogList({ category, search, page, limit }) {
    const query = String(search || "").toLocaleLowerCase("tr");
    const posts = [...(global.StaticBlogPosts || [])]
      .filter((post) => post.status === "published")
      .filter((post) => category === "all" || post.category === category)
      .filter((post) => !query || `${post.title} ${post.excerpt} ${post.content}`.toLocaleLowerCase("tr").includes(query))
      .sort((left, right) => String(right.publishedAt).localeCompare(String(left.publishedAt)));
    const totalPages = Math.max(1, Math.ceil(posts.length / limit));
    const safePage = Math.min(page, totalPages);
    return {
      items: posts.slice((safePage - 1) * limit, safePage * limit),
      pagination: {
        page: safePage,
        limit,
        total: posts.length,
        totalPages,
        hasPrevious: safePage > 1,
        hasNext: safePage < totalPages,
      },
    };
  }

  async function loadBlogList(parameters) {
    try {
      return await requestApi("", parameters);
    } catch (error) {
      if (error.status === 422) throw error;
      return staticBlogList(parameters);
    }
  }

  async function renderFeatured(root) {
    const featured = root.querySelector("[data-featured-blog]");
    const image = featured?.querySelector("[data-featured-blog-image]");
    const slug = featured?.dataset.featuredBlog;
    if (!featured || !image || !slug) return;

    let post = null;
    try {
      post = (await requestApi(`/${encodeURIComponent(slug)}`)).item;
    } catch (_) {
      post = [...(global.StaticBlogPosts || [])]
        .find((candidate) => candidate.status === "published" && candidate.slug === slug) || null;
    }

    if (!post?.image) return;
    image.src = mediaUrl(post.image);
    image.alt = post.imageAlt || `${post.title} kapak görseli`;
  }

  function renderPagination(navigation, pagination, onPageChange) {
    if (!navigation) return;
    navigation.replaceChildren();
    navigation.hidden = pagination.totalPages <= 1;
    if (navigation.hidden) return;

    const previous = createElement("button", "btn btn-secondary", "← Önceki");
    previous.type = "button";
    previous.disabled = !pagination.hasPrevious;
    previous.addEventListener("click", () => onPageChange(pagination.page - 1));
    navigation.append(previous);

    for (let page = 1; page <= pagination.totalPages; page += 1) {
      const button = createElement("button", "btn btn-secondary", String(page));
      button.type = "button";
      if (page === pagination.page) button.setAttribute("aria-current", "page");
      button.addEventListener("click", () => onPageChange(page));
      navigation.append(button);
    }

    const next = createElement("button", "btn btn-secondary", "Sonraki →");
    next.type = "button";
    next.disabled = !pagination.hasNext;
    next.addEventListener("click", () => onPageChange(pagination.page + 1));
    navigation.append(next);
  }

  async function renderList(root) {
    const filterRow = root.querySelector(".filter-row");
    if (!filterRow) return;
    const grid = root.querySelector("[data-blog-list]") || filterRow.nextElementSibling;
    if (!grid) return;
    grid.dataset.blogList = "";
    grid.className = "grid-3 public-blog-grid";
    const navigation = root.querySelector(".pagination");
    const searchInput = root.querySelector("#blog-search");
    const categoryButtons = [...filterRow.querySelectorAll("[data-filter]")];
    const state = { category: "all", search: "", page: 1, limit: 6 };
    let requestSequence = 0;
    let searchTimer;

    const update = async () => {
      const sequence = ++requestSequence;
      grid.setAttribute("aria-busy", "true");
      try {
        const result = await loadBlogList(state);
        if (sequence !== requestSequence) return;
        state.page = result.pagination.page;
        grid.replaceChildren(...result.items.map(createPostCard));
        if (!result.items.length) {
          const empty = createElement("div", "public-blog-empty");
          empty.append(createElement("h2", "", "Yazı bulunamadı."), createElement("p", "muted", "Arama ifadenizi veya kategori seçiminizi değiştirebilirsiniz."));
          grid.replaceChildren(empty);
        }
        renderPagination(navigation, result.pagination, (page) => {
          state.page = page;
          update();
          grid.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      } catch (error) {
        if (sequence !== requestSequence) return;
        const empty = createElement("div", "public-blog-empty");
        empty.append(createElement("h2", "", "Yazılar yüklenemedi."), createElement("p", "muted", "Lütfen filtreleri kontrol ederek tekrar deneyin."));
        grid.replaceChildren(empty);
        if (navigation) navigation.hidden = true;
        console.error("Blog listesi yüklenemedi.", error);
      } finally {
        if (sequence === requestSequence) grid.removeAttribute("aria-busy");
      }
    };

    categoryButtons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.filter === state.category));
      button.addEventListener("click", () => {
        state.category = button.dataset.filter || "all";
        state.page = 1;
        categoryButtons.forEach((candidate) => {
          const active = candidate === button;
          candidate.classList.toggle("active", active);
          candidate.setAttribute("aria-pressed", String(active));
        });
        update();
      });
    });

    searchInput?.addEventListener("input", () => {
      global.clearTimeout(searchTimer);
      searchTimer = global.setTimeout(() => {
        state.search = searchInput.value.trim();
        state.page = 1;
        update();
      }, 240);
    });

    await update();
  }

  async function renderDetail(root) {
    const article = root.querySelector("[data-blog-detail]");
    if (!article) return;
    const activeUrl = activePageUrl();
    const cleanSlug = decodeURIComponent(activeUrl.pathname).match(/^\/blog\/([^/]+)\/?$/)?.[1];
    const slug = cleanSlug || activeUrl.searchParams.get("slug");
    try {
      const publishedPosts = [...(global.StaticBlogPosts || [])].filter((candidate) => candidate.status === "published");
      let post = null;
      if (slug) {
        try {
          post = (await requestApi(`/${encodeURIComponent(slug)}`)).item;
        } catch (error) {
          if (error.status !== 404) post = publishedPosts.find((candidate) => candidate.slug === slug) || null;
        }
      }
      if (!post || post.status !== "published") {
        article.replaceChildren(createElement("h1", "", "Yazı bulunamadı."), createElement("p", "lead", "Bu içerik kaldırılmış, taslağa alınmış veya adresi değişmiş olabilir."));
        document.title = "Yazı Bulunamadı | NODVIRA";
        return;
      }
      applyBlogSeo(post, activeUrl);
      const header = createElement("header", "blog-detail-header");
      const published = publicationDate(post.publishedAt || post.createdAt);
      header.append(createElement("span", "article-meta", `${CATEGORY_LABELS[post.category] || post.category} · ${published} · ${post.readingTimeMinutes || readingTime(post.content)} DK. · NODVIRA`), createElement("h1", "", post.title), createElement("p", "lead", post.excerpt));
      article.replaceChildren(header);
      if (post.image) {
        const media = document.createElement("figure");
        media.className = "blog-detail-media";
        const image = document.createElement("img");
        image.className = "blog-detail-image";
        image.src = mediaUrl(post.image);
        image.alt = post.imageAlt || `${post.title} kapak görseli`;
        media.append(image);
        article.append(media);
      } else {
        const visual = createElement("div", "blog-detail-visual");
        visual.append(createElement("span", "", CATEGORY_LABELS[post.category] || "NODVIRA BLOG"), createElement("strong", "", "TEKNİK REHBER"), createElement("small", "", `${post.readingTimeMinutes || readingTime(post.content)} dakikalık okuma`));
        article.append(visual);
      }
      const renderedContent = renderArticleContent(post.content);
      article.append(createTableOfContents(renderedContent.headings), renderedContent.container);

      const related = createElement("aside", "card blog-related-service");
      related.append(createElement("h2", "", "Bu konuda desteğe mi ihtiyacınız var?"), createElement("p", "", "Mevcut yapınızı ve hedefinizi birlikte değerlendirerek uygulanabilir bir sonraki adımı netleştirebiliriz."));
      const relatedLink = createElement("a", "card-link", "İlgili hizmeti inceleyin →");
      relatedLink.href = SERVICE_LINKS[post.category] || "/hizmetlerimiz";
      related.append(relatedLink);
      renderedContent.container.append(related);

      const relatedPosts = publishedPosts
        .filter((candidate) => candidate.slug !== post.slug)
        .sort((left, right) => Number(right.category === post.category) - Number(left.category === post.category))
        .slice(0, 3);
      if (relatedPosts.length) {
        const relatedSection = createElement("section", "blog-related-posts");
        relatedSection.append(createElement("h2", "", "İlgili Yazılar"));
        const relatedGrid = createElement("div", "grid-3 public-blog-grid");
        relatedGrid.append(...relatedPosts.map(createPostCard));
        relatedSection.append(relatedGrid);
        article.append(relatedSection);
      }

      const backLink = createElement("a", "btn btn-secondary", "← Tüm Yazılar");
      backLink.href = "/blog";
      const contactLink = createElement("a", "btn btn-primary", "Projenizi Konuşalım →");
      contactLink.href = "/iletisim";
      const actions = createElement("div", "button-row");
      actions.append(backLink, contactLink);
      article.append(actions);
    } catch (error) {
      article.replaceChildren(createElement("h1", "", "Yazı yüklenemedi."), createElement("p", "lead", "Lütfen sayfayı yenileyerek tekrar deneyin."));
      console.error("Blog yazısı yüklenemedi.", error);
    }
  }

  function init(root) {
    if (!root || initializedRoots.has(root)) return;
    initializedRoots.add(root);
    renderFeatured(root);
    renderList(root);
    renderDetail(root);
  }

  global.PublicBlog = Object.freeze({ init });
})(window);
