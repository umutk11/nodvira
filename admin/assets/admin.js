(function () {
  "use strict";

  const apiBase = ["127.0.0.1", "localhost"].includes(location.hostname)
    ? "http://127.0.0.1:3000/api"
    : "/api";
  const state = { items: [], status: "", search: "", selectedId: null };
  const statusLabels = { new: "Yeni", read: "Okundu", closed: "Kapatıldı" };
  const blogState = { items: [], status: "", search: "", page: 1, limit: 12, editingId: null, slugEdited: false, seoTitleEdited: false, metaEdited: false, deleteArmed: false };
  const blogStatusLabels = { draft: "Taslak", published: "Yayında" };

  async function api(path, options = {}) {
    const response = await fetch(`${apiBase}${path}`, {
      credentials: "include",
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
      ...options,
    });
    const data = await response.json().catch(() => ({}));
    if (response.status === 401) {
      location.replace("index.html");
      throw new Error("Oturum süresi doldu.");
    }
    if (!response.ok) throw new Error(data.issues?.map((issue) => issue.message).join(" ") || data.message || "İşlem tamamlanamadı.");
    return data;
  }

  function mediaUrl(path) {
    if (!path?.startsWith("/uploads/")) return path || "";
    return new URL(path, new URL(apiBase, location.href).origin).href;
  }

  async function uploadImage(file) {
    if (!file) return null;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) throw new Error("Yalnızca JPEG, PNG veya WebP görseller yüklenebilir.");
    if (file.size > 5 * 1024 * 1024) throw new Error("Görsel boyutu en fazla 5 MB olabilir.");
    const response = await fetch(`${apiBase}/admin/uploads`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": file.type, "X-File-Name": encodeURIComponent(file.name) },
      body: file,
    });
    const data = await response.json().catch(() => ({}));
    if (response.status === 401) { location.replace("index.html"); throw new Error("Oturum süresi doldu."); }
    if (!response.ok) throw new Error(data.message || "Görsel yüklenemedi.");
    return data.item;
  }

  function bindImageUpload(fileSelector, pathSelector, messageSelector) {
    const input = document.querySelector(fileSelector);
    const pathInput = document.querySelector(pathSelector);
    const message = document.querySelector(messageSelector);
    input?.addEventListener("change", async () => {
      const file = input.files?.[0];
      if (!file) return;
      input.disabled = true;
      if (message) message.textContent = "Görsel yükleniyor…";
      try {
        const item = await uploadImage(file);
        pathInput.value = item.path;
        pathInput.dispatchEvent(new Event("input", { bubbles: true }));
        if (message) message.textContent = "Görsel yüklendi. Kaydı tamamladığınızda kullanılmaya başlanacak.";
        await loadUnusedUploads();
      } catch (error) {
        input.value = "";
        if (message) message.textContent = error.message;
      } finally {
        input.disabled = false;
      }
    });
  }

  window.NodviraUploads = Object.freeze({ bind: bindImageUpload });

  const sidebar = document.querySelector("#admin-sidebar");
  const toggle = document.querySelector("#sidebar-toggle");
  const backdrop = document.querySelector("#sidebar-backdrop");
  const links = [...document.querySelectorAll("[data-admin-view]")];
  const views = [...document.querySelectorAll("[data-view-panel]")];
  const listShell = document.querySelector("#request-list-shell");
  const feedback = document.querySelector("#request-feedback");
  const dialog = document.querySelector("#request-dialog");

  function closeSidebar() {
    sidebar?.classList.remove("open");
    backdrop?.classList.remove("visible");
    toggle?.setAttribute("aria-expanded", "false");
  }

  function showView(name) {
    const selected = views.find((view) => view.dataset.viewPanel === name) || views[0];
    views.forEach((view) => { view.hidden = view !== selected; });
    links.forEach((link) => link.classList.toggle("active", link.dataset.adminView === selected.dataset.viewPanel));
    closeSidebar();
    if (selected.dataset.viewPanel === "uploads") loadUnusedUploads();
  }

  async function loadUnusedUploads() {
    const list = document.querySelector("#upload-list");
    const feedback = document.querySelector("#upload-feedback");
    if (!list) return;
    try {
      const { items } = await api("/admin/uploads?status=unused");
      if (!items.length) {
        list.replaceChildren(emptyState("Kullanılmayan görsel yok", "Tüm yüklemeler içeriklerde kullanılıyor veya henüz görsel yüklenmedi."));
        if (feedback) feedback.textContent = "";
        return;
      }
      list.replaceChildren(...items.map((item) => {
        const row = document.createElement("article");
        row.className = "upload-row";
        const image = document.createElement("img");
        image.src = mediaUrl(item.path);
        image.alt = "";
        image.loading = "lazy";
        const detail = document.createElement("div");
        const name = document.createElement("strong");
        name.textContent = item.originalName;
        const meta = document.createElement("small");
        meta.textContent = `${Math.max(1, Math.round(item.sizeBytes / 1024))} KB · ${formatDate(item.createdAt)}`;
        detail.append(name, meta);
        const remove = document.createElement("button");
        remove.className = "danger-button upload-delete";
        remove.type = "button";
        remove.textContent = "Sil";
        let armed = false;
        remove.addEventListener("click", async () => {
          if (!armed) {
            armed = true;
            remove.textContent = "Silmeyi onayla";
            window.setTimeout(() => { if (armed) { armed = false; remove.textContent = "Sil"; } }, 5_000);
            return;
          }
          remove.disabled = true;
          try { await api(`/admin/uploads/${item.id}`, { method: "DELETE" }); await loadUnusedUploads(); }
          catch (error) { if (feedback) feedback.textContent = error.message; remove.disabled = false; }
        });
        row.append(image, detail, remove);
        return row;
      }));
      if (feedback) feedback.textContent = `${items.length} kullanılmayan görsel bulundu.`;
    } catch (error) {
      list.replaceChildren(emptyState("Görseller yüklenemedi", error.message));
    }
  }

  function initials(name) {
    return String(name || "Yönetici").split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toLocaleUpperCase("tr-TR");
  }

  function formatDate(value) {
    return new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
  }

  function emptyState(title, detail) {
    const wrapper = document.createElement("div");
    wrapper.className = "request-empty";
    const icon = document.createElement("span");
    icon.className = "empty-icon";
    icon.textContent = "↗";
    const heading = document.createElement("h2");
    heading.textContent = title;
    const paragraph = document.createElement("p");
    paragraph.textContent = detail;
    wrapper.append(icon, heading, paragraph);
    return wrapper;
  }

  function createCell(content) {
    const cell = document.createElement("td");
    if (content instanceof Node) cell.append(content);
    else cell.textContent = content;
    return cell;
  }

  function renderRequests() {
    listShell.replaceChildren();
    if (!state.items.length) {
      listShell.append(emptyState("Eşleşen talep bulunamadı", "Filtreyi değiştirin veya yeni bir iletişim talebini bekleyin."));
      return;
    }

    const wrap = document.createElement("div");
    wrap.className = "request-table-wrap";
    const table = document.createElement("table");
    table.className = "request-table";
    const head = document.createElement("thead");
    head.innerHTML = "<tr><th>İlgili kişi</th><th>Hizmet</th><th>Tarih</th><th>Durum</th><th><span class='sr-only'>İşlem</span></th></tr>";
    const body = document.createElement("tbody");

    state.items.forEach((item) => {
      const row = document.createElement("tr");
      const identity = document.createElement("div");
      const name = document.createElement("strong");
      name.textContent = item.name;
      const email = document.createElement("span");
      email.textContent = item.company || item.email;
      identity.append(name, email);
      const status = document.createElement("span");
      status.className = `status-badge status-${item.status}`;
      status.textContent = statusLabels[item.status];
      const action = document.createElement("button");
      action.className = "row-action";
      action.type = "button";
      action.textContent = "İncele";
      action.addEventListener("click", () => openRequest(item.id));
      row.append(
        createCell(identity),
        createCell(item.serviceLabel),
        createCell(formatDate(item.createdAt)),
        createCell(status),
        createCell(action)
      );
      body.append(row);
    });

    table.append(head, body);
    wrap.append(table);
    listShell.append(wrap);
  }

  function updateCounts(counts) {
    document.querySelector("#new-request-count").textContent = counts.new;
    document.querySelector("#read-request-count").textContent = counts.read;
    document.querySelector("#closed-request-count").textContent = counts.closed;
    document.querySelector("#request-nav-count").textContent = counts.new;
  }

  async function loadRequests() {
    listShell.replaceChildren(emptyState("Talepler yükleniyor", "Güncel kayıtlar getiriliyor."));
    feedback.textContent = "";
    const parameters = new URLSearchParams({ limit: "100" });
    if (state.status) parameters.set("status", state.status);
    if (state.search) parameters.set("search", state.search);

    try {
      const data = await api(`/admin/contact-requests?${parameters}`);
      state.items = data.items;
      updateCounts(data.counts);
      renderRequests();
    } catch (error) {
      listShell.replaceChildren(emptyState("Talepler yüklenemedi", error.message));
    }
  }

  function setDialogText(selector, value) {
    document.querySelector(selector).textContent = value || "—";
  }

  async function openRequest(id) {
    try {
      const { item } = await api(`/admin/contact-requests/${id}`);
      state.selectedId = item.id;
      setDialogText("#dialog-request-name", item.name);
      setDialogText("#dialog-company", item.company);
      setDialogText("#dialog-service", item.serviceLabel);
      setDialogText("#dialog-created", formatDate(item.createdAt));
      setDialogText("#dialog-current-status", statusLabels[item.status]);
      setDialogText("#dialog-message", item.message);
      const email = document.querySelector("#dialog-email");
      email.textContent = item.email;
      email.href = `mailto:${item.email}`;
      const phone = document.querySelector("#dialog-phone");
      phone.textContent = item.phone || "—";
      phone.href = item.phone ? `tel:${item.phone.replace(/[^+\d]/g, "")}` : "#";
      document.querySelector("#dialog-status").value = item.status;
      dialog.showModal();
    } catch (error) {
      feedback.textContent = error.message;
    }
  }

  async function saveRequestStatus() {
    if (!state.selectedId) return;
    const button = document.querySelector("#save-request-status");
    button.disabled = true;
    button.textContent = "Kaydediliyor…";
    try {
      await api(`/admin/contact-requests/${state.selectedId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: document.querySelector("#dialog-status").value }),
      });
      dialog.close();
      feedback.textContent = "Talep durumu güncellendi.";
      await loadRequests();
    } catch (error) {
      feedback.textContent = error.message;
    } finally {
      button.disabled = false;
      button.textContent = "Durumu kaydet";
    }
  }

  function slugify(value) {
    return String(value || "").toLocaleLowerCase("tr-TR")
      .replaceAll("ı", "i").replaceAll("ğ", "g").replaceAll("ü", "u")
      .replaceAll("ş", "s").replaceAll("ö", "o").replaceAll("ç", "c")
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }

  function formatShortDate(value) {
    if (!value) return "Henüz yayınlanmadı";
    return new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(value));
  }

  function toDateTimeLocal(value) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
    return local.toISOString().slice(0, 16);
  }

  function setBlogFeedback(message, error = false) {
    const element = document.querySelector("#blog-feedback");
    if (!element) return;
    element.textContent = message;
    element.classList.toggle("error", error);
  }

  function renderBlogPagination(pagination) {
    const navigation = document.querySelector("#blog-pagination");
    if (!navigation) return;
    navigation.replaceChildren();
    navigation.hidden = pagination.totalPages <= 1;
    if (navigation.hidden) return;

    const addButton = (label, page, options = {}) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = label;
      button.disabled = Boolean(options.disabled);
      if (options.current) button.setAttribute("aria-current", "page");
      button.addEventListener("click", () => {
        blogState.page = page;
        loadBlogPosts();
      });
      navigation.append(button);
    };

    addButton("←", pagination.page - 1, { disabled: !pagination.hasPrevious });
    for (let page = 1; page <= pagination.totalPages; page += 1) {
      addButton(String(page), page, { current: page === pagination.page });
    }
    addButton("→", pagination.page + 1, { disabled: !pagination.hasNext });
  }

  function renderBlogPosts(pagination) {
    const list = document.querySelector("#blog-list");
    list.replaceChildren();
    if (!blogState.items.length) {
      list.append(emptyState("Blog yazısı bulunamadı", "Filtreyi değiştirin veya yeni bir yazı oluşturun."));
      renderBlogPagination(pagination);
      return;
    }

    blogState.items.forEach((post) => {
      const card = document.createElement("article");
      card.className = "blog-admin-card";
      const head = document.createElement("div");
      head.className = "blog-card-head";
      const badge = document.createElement("span");
      badge.className = `status-badge status-${post.status}`;
      badge.textContent = blogStatusLabels[post.status] || post.status;
      const category = document.createElement("span");
      category.className = "category-label";
      category.textContent = post.categoryLabel;
      head.append(badge, category);
      const body = document.createElement("div");
      body.className = "blog-card-body";
      const title = document.createElement("h2");
      title.textContent = post.title;
      const excerpt = document.createElement("p");
      excerpt.textContent = post.excerpt;
      body.append(title, excerpt);
      const footer = document.createElement("div");
      footer.className = "blog-card-footer";
      const slug = document.createElement("code");
      slug.textContent = post.slug;
      const actions = document.createElement("div");
      actions.className = "blog-card-actions";
      const date = document.createElement("span");
      date.className = "blog-updated-at";
      date.textContent = post.status === "published" ? formatShortDate(post.publishedAt) : `Güncellendi ${formatShortDate(post.updatedAt)}`;
      const edit = document.createElement("button");
      edit.className = "blog-edit-button";
      edit.type = "button";
      edit.textContent = "Düzenle";
      edit.addEventListener("click", () => openPostEditor(post.id));
      actions.append(date, edit);
      footer.append(slug, actions);
      card.append(head, body, footer);
      list.append(card);
    });
    renderBlogPagination(pagination);
  }

  async function loadBlogPosts() {
    const list = document.querySelector("#blog-list");
    list.replaceChildren(emptyState("Yazılar yükleniyor", "Güncel blog kayıtları getiriliyor."));
    const parameters = new URLSearchParams({ page: String(blogState.page), limit: String(blogState.limit) });
    if (blogState.status) parameters.set("status", blogState.status);
    if (blogState.search) parameters.set("search", blogState.search);
    try {
      const data = await api(`/admin/blog-posts?${parameters}`);
      blogState.items = data.items;
      blogState.page = data.pagination.page;
      renderBlogPosts(data.pagination);
    } catch (error) {
      list.replaceChildren(emptyState("Yazılar yüklenemedi", error.message));
      setBlogFeedback(error.message, true);
    }
  }

  function resetDeleteConfirmation() {
    blogState.deleteArmed = false;
    const button = document.querySelector("#delete-post-button");
    button.classList.remove("confirming");
    button.textContent = "Yazıyı sil";
  }

  function openNewPost() {
    setBlogFeedback("");
    blogState.editingId = null;
    blogState.slugEdited = false;
    blogState.seoTitleEdited = false;
    blogState.metaEdited = false;
    document.querySelector("#post-form").reset();
    document.querySelector("#post-form").classList.remove("was-validated");
    document.querySelector("#post-category").value = "web";
    document.querySelector("#post-status").value = "draft";
    document.querySelector("#post-dialog-mode").textContent = "Yeni yazı";
    document.querySelector("#post-dialog-title").textContent = "Blog yazısı oluşturun.";
    document.querySelector("#delete-post-button").hidden = true;
    document.querySelector("#post-form-message").textContent = "";
    document.querySelector("#excerpt-count").textContent = "0";
    document.querySelector("#post-author-name").value = "NODVIRA";
    resetDeleteConfirmation();
    renderBlogSeoChecklist();
    document.querySelector("#post-dialog").showModal();
    document.querySelector("#post-title").focus();
  }

  async function openPostEditor(id) {
    setBlogFeedback("");
    try {
      const { item } = await api(`/admin/blog-posts/${id}`);
      blogState.editingId = item.id;
      blogState.slugEdited = true;
      blogState.seoTitleEdited = true;
      blogState.metaEdited = true;
      document.querySelector("#post-form").classList.remove("was-validated");
      document.querySelector("#post-title").value = item.title;
      document.querySelector("#post-slug").value = item.slug;
      document.querySelector("#post-excerpt").value = item.excerpt;
      document.querySelector("#post-content").value = item.content;
      document.querySelector("#post-category").value = item.category;
      document.querySelector("#post-status").value = item.status;
      document.querySelector("#post-published-at").value = toDateTimeLocal(item.publishedAt);
      document.querySelector("#post-image-path").value = item.imagePath || "";
      document.querySelector("#post-image-file").value = "";
      document.querySelector("#post-image-alt").value = item.imageAlt || "";
      document.querySelector("#post-seo-title").value = item.seoTitle || "";
      document.querySelector("#post-meta-description").value = item.metaDescription || "";
      document.querySelector("#post-author-name").value = item.authorName || "NODVIRA";
      document.querySelector("#post-reviewer-name").value = item.reviewerName || "";
      document.querySelector("#post-dialog-mode").textContent = "Yazıyı düzenle";
      document.querySelector("#post-dialog-title").textContent = item.title;
      document.querySelector("#delete-post-button").hidden = false;
      document.querySelector("#post-form-message").textContent = "";
      document.querySelector("#excerpt-count").textContent = String(item.excerpt.length);
      resetDeleteConfirmation();
      renderBlogSeoChecklist();
      document.querySelector("#post-dialog").showModal();
    } catch (error) {
      setBlogFeedback(error.message, true);
    }
  }

  function postPayload() {
    const form = document.querySelector("#post-form");
    const data = new FormData(form);
    const publishedAt = String(data.get("publishedAt") || "").trim();
    return {
      title: String(data.get("title") || "").trim(),
      slug: String(data.get("slug") || "").trim(),
      excerpt: String(data.get("excerpt") || "").trim(),
      content: String(data.get("content") || "").trim(),
      category: String(data.get("category") || ""),
      status: String(data.get("status") || "draft"),
      imagePath: String(data.get("imagePath") || "").trim() || null,
      imageAlt: String(data.get("imageAlt") || "").trim(),
      seoTitle: String(data.get("seoTitle") || "").trim(),
      metaDescription: String(data.get("metaDescription") || "").trim(),
      authorName: String(data.get("authorName") || "").trim(),
      reviewerName: String(data.get("reviewerName") || "").trim() || null,
      publishedAt: publishedAt ? new Date(publishedAt).toISOString() : null,
    };
  }

  function renderChecklist(target, checks, failedClass = "failed") {
    target?.replaceChildren(...checks.map((check) => {
      const item = document.createElement("li");
      item.className = check.passed ? "passed" : failedClass;
      item.textContent = check.label;
      return item;
    }));
  }

  function blogSeoAssessment() {
    const title = document.querySelector("#post-title")?.value.trim() || "";
    const slug = document.querySelector("#post-slug")?.value.trim() || "";
    const content = document.querySelector("#post-content")?.value.trim() || "";
    const imagePath = document.querySelector("#post-image-path")?.value.trim() || "";
    const imageAlt = document.querySelector("#post-image-alt")?.value.trim() || "";
    const seoTitle = document.querySelector("#post-seo-title")?.value.trim() || "";
    const meta = document.querySelector("#post-meta-description")?.value.trim() || "";
    const author = document.querySelector("#post-author-name")?.value.trim() || "";
    const required = [
      { passed: title.length >= 3, label: "Sayfa H1 başlığı hazır" },
      { passed: /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug), label: "URL kısa adı geçerli" },
      { passed: Boolean(imagePath), label: "Kapak görseli yüklendi" },
      { passed: imageAlt.length >= 5, label: "Görsel alt metni yazıldı" },
      { passed: seoTitle.length >= 15 && seoTitle.length <= 70, label: "SEO başlığı tamamlandı" },
      { passed: meta.length >= 50 && meta.length <= 180, label: "Meta açıklaması tamamlandı" },
      { passed: author.length >= 2, label: "Yazar / yayınlayan belirtildi" },
      { passed: content.length >= 300, label: "İçerik en az 300 karakter" },
      { passed: /^##\s+\S/m.test(content), label: "En az bir H2 (##) bölüm başlığı var" },
      { passed: !/^#\s+\S/m.test(content), label: "İçerikte ikinci H1 (#) yok" },
    ];
    const warnings = [
      { passed: seoTitle.length >= 30 && seoTitle.length <= 60, label: "SEO başlığı 30–60 karakter" },
      { passed: meta.length >= 120 && meta.length <= 160, label: "Meta açıklaması 120–160 karakter" },
      { passed: /\]\(\/(?:[^)]+)\)/.test(content), label: "İlgili bir iç sayfaya bağlantı var" },
      { passed: !content.split(/\n\s*\n/).some((paragraph) => paragraph.length > 700), label: "Paragraflar rahat okunabilir uzunlukta" },
    ];
    return { required, warnings, title, slug, seoTitle, meta };
  }

  function renderBlogSeoChecklist() {
    const assessment = blogSeoAssessment();
    renderChecklist(document.querySelector("#post-seo-required"), assessment.required);
    renderChecklist(document.querySelector("#post-seo-warnings"), assessment.warnings, "warning");
    const passed = assessment.required.filter((item) => item.passed).length;
    document.querySelector("#post-seo-score").textContent = `${passed}/${assessment.required.length}`;
    document.querySelector("#post-seo-title-count").textContent = String(assessment.seoTitle.length);
    document.querySelector("#post-meta-count").textContent = String(assessment.meta.length);
    document.querySelector("#post-search-preview-title").textContent = assessment.seoTitle || assessment.title || "Yazı başlığı";
    document.querySelector("#post-search-preview-url").textContent = `nodvira.com/blog/${assessment.slug || "yazi-adresi"}`;
    document.querySelector("#post-search-preview-description").textContent = assessment.meta || "Meta açıklaması burada gösterilecek.";
    const blocked = document.querySelector("#post-status")?.value === "published" && passed < assessment.required.length;
    const button = document.querySelector("#save-post-button");
    button.disabled = blocked;
    button.classList.toggle("seo-publish-blocked", blocked);
    button.title = blocked ? "Yayın için kırmızı SEO maddelerini tamamlayın." : "";
  }

  async function savePost(event) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) {
      form.classList.add("was-validated");
      return;
    }
    form.classList.remove("was-validated");
    const button = document.querySelector("#save-post-button");
    const message = document.querySelector("#post-form-message");
    button.disabled = true;
    button.textContent = "Kaydediliyor…";
    message.textContent = "";
    try {
      const editing = Boolean(blogState.editingId);
      await api(editing ? `/admin/blog-posts/${blogState.editingId}` : "/admin/blog-posts", {
        method: editing ? "PATCH" : "POST",
        body: JSON.stringify(postPayload()),
      });
      document.querySelector("#post-dialog").close();
      blogState.page = 1;
      setBlogFeedback(editing ? "Blog yazısı güncellendi." : "Yeni blog yazısı oluşturuldu.");
      await loadBlogPosts();
    } catch (error) {
      message.textContent = error.message;
    } finally {
      button.disabled = false;
      button.textContent = "Yazıyı kaydet";
      renderBlogSeoChecklist();
    }
  }

  async function deletePost() {
    if (!blogState.editingId) return;
    const button = document.querySelector("#delete-post-button");
    if (!blogState.deleteArmed) {
      blogState.deleteArmed = true;
      button.classList.add("confirming");
      button.textContent = "Silme işlemini onayla";
      document.querySelector("#post-form-message").textContent = "Yazıyı listeden ve yayından kaldırmak için 5 saniye içinde tekrar tıklayın.";
      window.setTimeout(() => {
        if (!blogState.deleteArmed) return;
        resetDeleteConfirmation();
        document.querySelector("#post-form-message").textContent = "";
      }, 5_000);
      return;
    }

    button.disabled = true;
    button.textContent = "Siliniyor…";
    try {
      await api(`/admin/blog-posts/${blogState.editingId}`, { method: "DELETE" });
      document.querySelector("#post-dialog").close();
      blogState.page = 1;
      setBlogFeedback("Blog yazısı silindi.");
      await loadBlogPosts();
    } catch (error) {
      document.querySelector("#post-form-message").textContent = error.message;
    } finally {
      button.disabled = false;
      resetDeleteConfirmation();
    }
  }

  toggle?.addEventListener("click", () => {
    const open = sidebar.classList.toggle("open");
    backdrop.classList.toggle("visible", open);
    toggle.setAttribute("aria-expanded", String(open));
  });
  backdrop?.addEventListener("click", closeSidebar);
  links.forEach((link) => link.addEventListener("click", () => showView(link.dataset.adminView)));
  window.addEventListener("hashchange", () => showView(location.hash.slice(1)));
  document.querySelector("#dialog-close")?.addEventListener("click", () => dialog.close());
  document.querySelector("#save-request-status")?.addEventListener("click", saveRequestStatus);
  dialog?.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
  document.querySelector("#new-post-button")?.addEventListener("click", openNewPost);
  document.querySelector("#post-dialog-close")?.addEventListener("click", () => document.querySelector("#post-dialog").close());
  document.querySelector("#cancel-post-button")?.addEventListener("click", () => document.querySelector("#post-dialog").close());
  document.querySelector("#post-form")?.addEventListener("submit", savePost);
  bindImageUpload("#post-image-file", "#post-image-path", "#post-form-message");
  document.querySelector("#delete-post-button")?.addEventListener("click", deletePost);
  document.querySelector("#post-dialog")?.addEventListener("click", (event) => {
    if (event.target === document.querySelector("#post-dialog")) event.target.close();
  });
  document.querySelector("#post-title")?.addEventListener("input", (event) => {
    if (!blogState.slugEdited) document.querySelector("#post-slug").value = slugify(event.target.value);
    if (!blogState.seoTitleEdited) document.querySelector("#post-seo-title").value = `${event.target.value.trim()} | NODVIRA`.slice(0, 70);
  });
  document.querySelector("#post-slug")?.addEventListener("input", (event) => {
    blogState.slugEdited = Boolean(event.target.value.trim());
    event.target.value = slugify(event.target.value);
  });
  document.querySelector("#post-excerpt")?.addEventListener("input", (event) => {
    document.querySelector("#excerpt-count").textContent = String(event.target.value.length);
    if (!blogState.metaEdited) document.querySelector("#post-meta-description").value = event.target.value.trim().slice(0, 180);
  });
  document.querySelector("#post-seo-title")?.addEventListener("input", () => { blogState.seoTitleEdited = true; });
  document.querySelector("#post-meta-description")?.addEventListener("input", () => { blogState.metaEdited = true; });
  document.querySelector("#post-form")?.addEventListener("input", renderBlogSeoChecklist);
  document.querySelector("#post-form")?.addEventListener("change", renderBlogSeoChecklist);

  let searchTimer;
  document.querySelector("#request-search")?.addEventListener("input", (event) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => { state.search = event.target.value.trim(); loadRequests(); }, 250);
  });
  document.querySelectorAll("[data-status-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-status-filter]").forEach((item) => item.classList.toggle("active", item === button));
      state.status = button.dataset.statusFilter;
      loadRequests();
    });
  });
  let blogSearchTimer;
  document.querySelector("#blog-admin-search")?.addEventListener("input", (event) => {
    clearTimeout(blogSearchTimer);
    blogSearchTimer = setTimeout(() => {
      setBlogFeedback("");
      blogState.search = event.target.value.trim();
      blogState.page = 1;
      loadBlogPosts();
    }, 250);
  });
  document.querySelectorAll("[data-blog-status]").forEach((button) => {
    button.addEventListener("click", () => {
      setBlogFeedback("");
      document.querySelectorAll("[data-blog-status]").forEach((item) => item.classList.toggle("active", item === button));
      blogState.status = button.dataset.blogStatus;
      blogState.page = 1;
      loadBlogPosts();
    });
  });
  document.querySelector("#logout-button")?.addEventListener("click", async () => {
    try { await api("/admin/auth/logout", { method: "POST", body: "{}" }); } catch {}
    location.replace("index.html");
  });
  document.querySelector("#cleanup-uploads-button")?.addEventListener("click", async (event) => {
    const button = event.currentTarget;
    if (button.dataset.armed !== "true") {
      button.dataset.armed = "true";
      button.classList.add("confirming");
      button.textContent = "Temizlemeyi onayla";
      window.setTimeout(() => {
        if (button.dataset.armed === "true") {
          delete button.dataset.armed;
          button.classList.remove("confirming");
          button.textContent = "Eski dosyaları temizle";
        }
      }, 5_000);
      return;
    }
    button.disabled = true;
    try {
      const result = await api("/admin/uploads/cleanup", { method: "POST", body: "{}" });
      document.querySelector("#upload-feedback").textContent = `${result.removed} eski ve kullanılmayan görsel silindi.`;
      await loadUnusedUploads();
    } catch (error) {
      document.querySelector("#upload-feedback").textContent = error.message;
    } finally {
      button.disabled = false;
      delete button.dataset.armed;
      button.classList.remove("confirming");
      button.textContent = "Eski dosyaları temizle";
    }
  });

  async function initialize() {
    try {
      const { admin } = await api("/admin/auth/session");
      document.querySelector("#admin-display-name").textContent = admin.displayName;
      document.querySelector("#admin-avatar").textContent = initials(admin.displayName);
      document.querySelector("#topbar-date").textContent = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric" }).format(new Date());
      document.body.dataset.authReady = "true";
      showView(location.hash.slice(1) || "overview");
      await Promise.all([loadRequests(), loadBlogPosts(), loadUnusedUploads()]);
    } catch {}
  }

  initialize();
})();
