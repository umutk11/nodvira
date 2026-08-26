(function (global) {
  "use strict";

  const CATEGORY_LABELS = { network: "Network", system: "Sistem", web: "Web Teknolojileri", software: "Yazılım", transformation: "Dijital Dönüşüm", consulting: "Teknoloji Danışmanlığı", management: "Teknoloji Danışmanlığı" };
  const SERVICE_LINKS = { network: "/hizmetlerimiz/network-cozumleri", system: "/hizmetlerimiz/sistem-cozumleri", web: "/hizmetlerimiz/web-cozumleri", software: "/hizmetlerimiz/yazilim-cozumleri", transformation: "/hizmetlerimiz/teknoloji-danismanligi", consulting: "/hizmetlerimiz/teknoloji-danismanligi", management: "/hizmetlerimiz/teknoloji-danismanligi" };
  const initializedRoots = new WeakSet();

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
      image.src = post.image;
      image.alt = "";
      image.loading = "lazy";
      card.append(image);
    } else {
      card.append(createElement("div", "visual-placeholder", `${CATEGORY_LABELS[post.category] || "Blog"} görseli`));
    }
    const metaRow = createElement("div", "article-card-meta");
    const category = createElement("span", "article-meta", `${CATEGORY_LABELS[post.category] || post.category} · ${readingTime(post.content)} DK.`);
    const date = createElement("time", "article-date", publicationDate(post.publishedAt || post.createdAt));
    if (post.publishedAt || post.createdAt) date.dateTime = post.publishedAt || post.createdAt;
    metaRow.append(category, date);
    card.append(metaRow, createElement("h3", "", post.title), createElement("p", "", post.excerpt));
    const link = createElement("a", "card-link", "Devamını Oku →");
    link.href = `/blog/${encodeURIComponent(post.slug)}`;
    card.append(link);
    return card;
  }

  async function renderList(root) {
    const filterRow = root.querySelector(".filter-row");
    if (!filterRow) return;
    const grid = root.querySelector("[data-blog-list]") || filterRow.nextElementSibling;
    if (!grid) return;
    grid.dataset.blogList = "";
    grid.className = "grid-3 public-blog-grid";
    grid.setAttribute("aria-busy", "true");
    try {
      const posts = [...(global.StaticBlogPosts || [])]
        .filter((post) => post.status === "published")
        .sort((left, right) => String(right.publishedAt).localeCompare(String(left.publishedAt)));
      grid.replaceChildren(...posts.map(createPostCard));
      if (!posts.length) {
        const empty = createElement("div", "public-blog-empty");
        empty.append(createElement("h2", "", "Henüz yayınlanmış yazı yok."), createElement("p", "muted", "Yeni içerikler hazırlandığında burada görünecek."));
        grid.replaceChildren(empty);
      }
    } catch (error) {
      const empty = createElement("div", "public-blog-empty");
      empty.append(createElement("h2", "", "Yazılar yüklenemedi."), createElement("p", "muted", "Lütfen sayfayı yenileyerek tekrar deneyin."));
      grid.replaceChildren(empty);
      console.error("Blog listesi yüklenemedi.", error);
    } finally {
      grid.removeAttribute("aria-busy");
    }
  }

  async function renderDetail(root) {
    const article = root.querySelector("[data-blog-detail]");
    if (!article) return;
    const activeUrl = activePageUrl();
    const cleanSlug = decodeURIComponent(activeUrl.pathname).match(/^\/blog\/([^/]+)\/?$/)?.[1];
    const slug = cleanSlug || activeUrl.searchParams.get("slug");
    try {
      const publishedPosts = [...(global.StaticBlogPosts || [])].filter((candidate) => candidate.status === "published");
      const post = slug ? publishedPosts.find((candidate) => candidate.slug === slug) : null;
      if (!post || post.status !== "published") {
        article.replaceChildren(createElement("h1", "", "Yazı bulunamadı."), createElement("p", "lead", "Bu içerik kaldırılmış, taslağa alınmış veya adresi değişmiş olabilir."));
        document.title = "Yazı Bulunamadı | NODVIRA";
        return;
      }
      document.title = `${post.title} | NODVIRA`;
      const description = document.querySelector('meta[name="description"]');
      if (description) description.content = post.excerpt;
      const header = createElement("header", "blog-detail-header");
      const published = publicationDate(post.publishedAt || post.createdAt);
      header.append(createElement("span", "article-meta", `${CATEGORY_LABELS[post.category] || post.category} · ${published} · ${readingTime(post.content)} DK. · NODVIRA`), createElement("h1", "", post.title), createElement("p", "lead", post.excerpt));
      article.replaceChildren(header);
      if (post.image) {
        const image = document.createElement("img");
        image.className = "blog-detail-image";
        image.src = post.image;
        image.alt = "";
        article.append(image);
      } else {
        const visual = createElement("div", "blog-detail-visual");
        visual.append(createElement("span", "", CATEGORY_LABELS[post.category] || "NODVIRA BLOG"), createElement("strong", "", "TEKNİK REHBER"), createElement("small", "", `${readingTime(post.content)} dakikalık okuma`));
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
    renderList(root);
    renderDetail(root);
  }

  global.PublicBlog = Object.freeze({ init });
})(window);
