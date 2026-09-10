(function () {
  "use strict";

  const apiBase = ["127.0.0.1", "localhost"].includes(location.hostname) ? "http://127.0.0.1:3000/api" : "/api";
  const state = { items: [], status: "", search: "", editingId: null, slugEdited: false, seoTitleEdited: false, metaEdited: false, deleteArmed: false };
  const statusLabels = { draft: "Taslak", published: "Yayında" };

  async function api(path, options = {}) {
    const response = await fetch(`${apiBase}${path}`, { credentials: "include", headers: { "Content-Type": "application/json", ...(options.headers || {}) }, ...options });
    const data = await response.json().catch(() => ({}));
    if (response.status === 401) { location.replace("index.html"); throw new Error("Oturum süresi doldu."); }
    if (!response.ok) throw new Error(data.issues?.map((issue) => issue.message).join(" ") || data.message || "İşlem tamamlanamadı.");
    return data;
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function emptyState(title, detail) {
    const wrapper = el("div", "request-empty");
    wrapper.append(el("span", "empty-icon", "◇"), el("h2", "", title), el("p", "", detail));
    return wrapper;
  }

  function slugify(value) {
    return String(value || "").toLocaleLowerCase("tr-TR")
      .replaceAll("ı", "i").replaceAll("ğ", "g").replaceAll("ü", "u").replaceAll("ş", "s").replaceAll("ö", "o").replaceAll("ç", "c")
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }

  function feedback(message, error = false) {
    const node = document.querySelector("#project-feedback");
    node.textContent = message;
    node.classList.toggle("error", error);
  }

  function formatDate(value) {
    if (!value) return "Henüz yayınlanmadı";
    return new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(value));
  }

  function toLocalDate(value) {
    if (!value) return "";
    const date = new Date(value);
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
    return local.toISOString().slice(0, 16);
  }

  async function changeOrder(item, delta) {
    try {
      await api(`/admin/projects/${item.id}/order`, { method: "PATCH", body: JSON.stringify({ sortOrder: Math.max(0, item.sortOrder + delta) }) });
      feedback("Referans sırası güncellendi.");
      await load();
    } catch (error) { feedback(error.message, true); }
  }

  function render() {
    const list = document.querySelector("#project-admin-list");
    list.replaceChildren();
    if (!state.items.length) { list.append(emptyState("Referans bulunamadı", "Filtreyi değiştirin veya yeni bir proje vakası oluşturun.")); return; }
    state.items.forEach((item) => {
      const card = el("article", "blog-admin-card");
      const head = el("div", "blog-card-head");
      head.append(el("span", `status-badge status-${item.status}`, statusLabels[item.status]), el("span", "category-label", item.categoryLabel));
      const body = el("div", "blog-card-body");
      body.append(el("h2", "", item.title), el("p", "", item.summary));
      const footer = el("div", "blog-card-footer");
      const identity = el("div");
      identity.append(el("code", "", item.slug), el("span", "blog-updated-at", ` · Sıra ${item.sortOrder}`));
      const actions = el("div", "blog-card-actions");
      const order = el("span", "project-order-actions");
      const up = el("button", "", "↑"); up.type = "button"; up.title = "Öne al"; up.addEventListener("click", () => changeOrder(item, -10));
      const down = el("button", "", "↓"); down.type = "button"; down.title = "Geri al"; down.addEventListener("click", () => changeOrder(item, 10));
      order.append(up, down);
      const edit = el("button", "blog-edit-button", "Düzenle"); edit.type = "button"; edit.addEventListener("click", () => openEdit(item.id));
      actions.append(el("span", "blog-updated-at", item.status === "published" ? formatDate(item.publishedAt) : "Taslak"), order, edit);
      footer.append(identity, actions);
      card.append(head, body, footer);
      list.append(card);
    });
  }

  async function load() {
    const list = document.querySelector("#project-admin-list");
    list.replaceChildren(emptyState("Referanslar yükleniyor", "Güncel proje kayıtları getiriliyor."));
    const params = new URLSearchParams({ limit: "100" });
    if (state.status) params.set("status", state.status);
    if (state.search) params.set("search", state.search);
    try { const data = await api(`/admin/projects?${params}`); state.items = data.items; render(); }
    catch (error) { list.replaceChildren(emptyState("Referanslar yüklenemedi", error.message)); feedback(error.message, true); }
  }

  const fields = {
    title: "#project-title", slug: "#project-slug", summary: "#project-summary", category: "#project-category",
    status: "#project-status", sortOrder: "#project-sort-order", publishedAt: "#project-published-at", imagePath: "#project-image-path",
    seoTitle: "#project-seo-title", metaDescription: "#project-meta-description", imageAlt: "#project-image-alt",
    client: "#project-client", industry: "#project-industry", services: "#project-services", reportStatus: "#project-report-status",
    code: "#project-code", visualLabel: "#project-visual-label", visualCaption: "#project-visual-caption",
    need: "#project-need", approach: "#project-approach", solution: "#project-solution", outcomeLead: "#project-outcome-lead",
    outcome: "#project-outcome", technicalIntro: "#project-technical-intro", architecture: "#project-architecture",
    technicalNote: "#project-technical-note", process: "#project-process", related: "#project-related",
  };
  const node = (name) => document.querySelector(fields[name]);

  function resetDelete() {
    state.deleteArmed = false;
    const button = document.querySelector("#delete-project-button");
    button.classList.remove("confirming");
    button.textContent = "Referansı sil";
  }

  function openNew() {
    feedback(""); state.editingId = null; state.slugEdited = false; state.seoTitleEdited = false; state.metaEdited = false;
    const form = document.querySelector("#project-form"); form.reset(); form.classList.remove("was-validated");
    node("category").value = "web"; node("status").value = "draft"; node("sortOrder").value = "100"; node("reportStatus").value = "Anonim vaka raporu";
    document.querySelector("#project-dialog-mode").textContent = "Yeni referans";
    document.querySelector("#project-dialog-title").textContent = "Proje vakası oluşturun.";
    document.querySelector("#delete-project-button").hidden = true;
    document.querySelector("#project-form-message").textContent = ""; resetDelete();
    renderProjectSeoChecklist();
    document.querySelector("#project-dialog").showModal(); node("title").focus();
  }

  function joinParagraphs(values) { return (values || []).join("\n\n"); }
  function joinTuples(values) { return (values || []).map(([label, value]) => `${label} | ${value}`).join("\n"); }

  async function openEdit(id) {
    feedback("");
    try {
      const { item } = await api(`/admin/projects/${id}`); const content = item.content || {};
      state.editingId = item.id; state.slugEdited = true; state.seoTitleEdited = true; state.metaEdited = true;
      node("title").value = item.title; node("slug").value = item.slug; node("summary").value = item.summary;
      node("category").value = item.category; node("status").value = item.status; node("sortOrder").value = item.sortOrder;
      node("publishedAt").value = toLocalDate(item.publishedAt); node("imagePath").value = item.imagePath || "";
      document.querySelector("#project-image-file").value = "";
      node("seoTitle").value = item.seoTitle || ""; node("metaDescription").value = item.metaDescription || ""; node("imageAlt").value = item.imageAlt || "";
      ["client","industry","services","reportStatus","code","visualLabel","visualCaption","technicalIntro","technicalNote","outcomeLead"].forEach((name) => { node(name).value = content[name] || ""; });
      ["need","approach","solution","outcome"].forEach((name) => { node(name).value = joinParagraphs(content[name]); });
      ["architecture","process","related"].forEach((name) => { node(name).value = joinTuples(content[name]); });
      document.querySelector("#project-form").classList.remove("was-validated");
      document.querySelector("#project-dialog-mode").textContent = "Referansı düzenle";
      document.querySelector("#project-dialog-title").textContent = item.title;
      document.querySelector("#delete-project-button").hidden = false;
      document.querySelector("#project-form-message").textContent = ""; resetDelete();
      renderProjectSeoChecklist();
      document.querySelector("#project-dialog").showModal();
    } catch (error) { feedback(error.message, true); }
  }

  function paragraphs(value) { return String(value || "").split(/\n\s*\n/).map((item) => item.trim()).filter(Boolean); }
  function tuples(value, label) {
    return String(value || "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => {
      const separator = line.indexOf("|");
      if (separator < 1 || separator === line.length - 1) throw new Error(`${label} alanındaki her satır "Başlık | Açıklama" biçiminde olmalı.`);
      return [line.slice(0, separator).trim(), line.slice(separator + 1).trim()];
    });
  }

  function payload() {
    const published = node("publishedAt").value;
    return {
      title: node("title").value.trim(), slug: node("slug").value.trim(), summary: node("summary").value.trim(),
      category: node("category").value, status: node("status").value, sortOrder: Number(node("sortOrder").value),
      publishedAt: published ? new Date(published).toISOString() : null, imagePath: node("imagePath").value.trim() || null,
      seoTitle: node("seoTitle").value.trim(), metaDescription: node("metaDescription").value.trim(), imageAlt: node("imageAlt").value.trim(),
      content: {
        client: node("client").value.trim(), industry: node("industry").value.trim(), services: node("services").value.trim(),
        reportStatus: node("reportStatus").value.trim(), code: node("code").value.trim(), visualLabel: node("visualLabel").value.trim(),
        visualCaption: node("visualCaption").value.trim(), need: paragraphs(node("need").value), approach: paragraphs(node("approach").value),
        solution: paragraphs(node("solution").value), technicalIntro: node("technicalIntro").value.trim(), architecture: tuples(node("architecture").value, "Mimari katmanlar"),
        technicalNote: node("technicalNote").value.trim(), process: tuples(node("process").value, "Uygulama süreci"),
        outcomeLead: node("outcomeLead").value.trim(), outcome: paragraphs(node("outcome").value), related: tuples(node("related").value, "İlgili hizmetler"),
      },
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

  function projectSeoAssessment() {
    const title = node("title")?.value.trim() || "";
    const slug = node("slug")?.value.trim() || "";
    const summary = node("summary")?.value.trim() || "";
    const imagePath = node("imagePath")?.value.trim() || "";
    const imageAlt = node("imageAlt")?.value.trim() || "";
    const seoTitle = node("seoTitle")?.value.trim() || "";
    const meta = node("metaDescription")?.value.trim() || "";
    const required = [
      { passed: title.length >= 3, label: "Sayfa H1 başlığı hazır" },
      { passed: /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug), label: "URL kısa adı geçerli" },
      { passed: summary.length >= 30, label: "Proje özeti tamamlandı" },
      { passed: Boolean(imagePath), label: "Kapak görseli yüklendi" },
      { passed: imageAlt.length >= 5, label: "Görsel alt metni yazıldı" },
      { passed: seoTitle.length >= 15 && seoTitle.length <= 70, label: "SEO başlığı tamamlandı" },
      { passed: meta.length >= 50 && meta.length <= 180, label: "Meta açıklaması tamamlandı" },
      { passed: node("client")?.value.trim().length >= 2, label: "Müşteri veya anonim müşteri belirtildi" },
      { passed: node("industry")?.value.trim().length >= 2, label: "Sektör belirtildi" },
      { passed: node("need")?.value.trim().length >= 10, label: "İhtiyaç bölümü tamamlandı" },
      { passed: node("approach")?.value.trim().length >= 10, label: "Yaklaşım bölümü tamamlandı" },
      { passed: node("solution")?.value.trim().length >= 10, label: "Çözüm bölümü tamamlandı" },
      { passed: node("architecture")?.value.includes("|"), label: "Teknik mimari tanımlandı" },
      { passed: node("process")?.value.includes("|"), label: "Uygulama süreci tanımlandı" },
      { passed: node("outcome")?.value.trim().length >= 10, label: "Sonuç bölümü tamamlandı" },
      { passed: node("related")?.value.includes("|"), label: "İlgili hizmet bağlantısı eklendi" },
    ];
    const combined = `${summary} ${node("outcomeLead")?.value || ""} ${node("outcome")?.value || ""}`;
    const warnings = [
      { passed: seoTitle.length >= 30 && seoTitle.length <= 60, label: "SEO başlığı 30–60 karakter" },
      { passed: meta.length >= 120 && meta.length <= 160, label: "Meta açıklaması 120–160 karakter" },
      { passed: /anonim/i.test(node("reportStatus")?.value || "") || node("client")?.value.trim().length > 2, label: "Müşteri görünürlüğü açıkça belirtildi" },
      { passed: !/\b%\s*\d|\d+\s*%/.test(combined), label: "Doğrulanması gereken yüzde iddiası görünmüyor" },
    ];
    return { required, warnings, title, slug, seoTitle, meta };
  }

  function renderProjectSeoChecklist() {
    const assessment = projectSeoAssessment();
    renderChecklist(document.querySelector("#project-seo-required"), assessment.required);
    renderChecklist(document.querySelector("#project-seo-warnings"), assessment.warnings, "warning");
    const passed = assessment.required.filter((item) => item.passed).length;
    document.querySelector("#project-seo-score").textContent = `${passed}/${assessment.required.length}`;
    document.querySelector("#project-seo-title-count").textContent = String(assessment.seoTitle.length);
    document.querySelector("#project-meta-count").textContent = String(assessment.meta.length);
    document.querySelector("#project-search-preview-title").textContent = assessment.seoTitle || assessment.title || "Referans başlığı";
    document.querySelector("#project-search-preview-url").textContent = `nodvira.com/referanslarimiz/${assessment.slug || "proje-adresi"}`;
    document.querySelector("#project-search-preview-description").textContent = assessment.meta || "Meta açıklaması burada gösterilecek.";
    const blocked = node("status")?.value === "published" && passed < assessment.required.length;
    const button = document.querySelector("#save-project-button");
    button.disabled = blocked;
    button.classList.toggle("seo-publish-blocked", blocked);
    button.title = blocked ? "Yayın için kırmızı SEO maddelerini tamamlayın." : "";
  }

  async function save(event) {
    event.preventDefault(); const form = event.currentTarget;
    if (!form.reportValidity()) { form.classList.add("was-validated"); return; }
    const button = document.querySelector("#save-project-button"); const message = document.querySelector("#project-form-message");
    button.disabled = true; button.textContent = "Kaydediliyor…"; message.textContent = "";
    try {
      const editing = Boolean(state.editingId);
      await api(editing ? `/admin/projects/${state.editingId}` : "/admin/projects", { method: editing ? "PATCH" : "POST", body: JSON.stringify(payload()) });
      document.querySelector("#project-dialog").close(); feedback(editing ? "Referans güncellendi." : "Yeni referans oluşturuldu."); await load();
    } catch (error) { message.textContent = error.message; }
    finally { button.disabled = false; button.textContent = "Referansı kaydet"; renderProjectSeoChecklist(); }
  }

  async function remove() {
    if (!state.editingId) return;
    const button = document.querySelector("#delete-project-button"); const message = document.querySelector("#project-form-message");
    if (!state.deleteArmed) {
      state.deleteArmed = true; button.classList.add("confirming"); button.textContent = "Silme işlemini onayla";
      message.textContent = "Referansı listeden ve yayından kaldırmak için 5 saniye içinde tekrar tıklayın.";
      setTimeout(() => { if (state.deleteArmed) { resetDelete(); message.textContent = ""; } }, 5_000); return;
    }
    button.disabled = true; button.textContent = "Siliniyor…";
    try { await api(`/admin/projects/${state.editingId}`, { method: "DELETE" }); document.querySelector("#project-dialog").close(); feedback("Referans silindi."); await load(); }
    catch (error) { message.textContent = error.message; }
    finally { button.disabled = false; resetDelete(); }
  }

  document.querySelector("#new-project-button")?.addEventListener("click", openNew);
  document.querySelector("#project-form")?.addEventListener("submit", save);
  window.NodviraUploads?.bind("#project-image-file", "#project-image-path", "#project-form-message");
  document.querySelector("#project-dialog-close")?.addEventListener("click", () => document.querySelector("#project-dialog").close());
  document.querySelector("#cancel-project-button")?.addEventListener("click", () => document.querySelector("#project-dialog").close());
  document.querySelector("#delete-project-button")?.addEventListener("click", remove);
  document.querySelector("#project-dialog")?.addEventListener("click", (event) => { if (event.target === document.querySelector("#project-dialog")) event.target.close(); });
  node("title")?.addEventListener("input", (event) => {
    if (!state.slugEdited) node("slug").value = slugify(event.target.value);
    if (!state.seoTitleEdited) node("seoTitle").value = `${event.target.value.trim()} | NODVIRA`.slice(0, 70);
  });
  node("slug")?.addEventListener("input", (event) => { state.slugEdited = Boolean(event.target.value.trim()); event.target.value = slugify(event.target.value); });
  node("summary")?.addEventListener("input", (event) => { if (!state.metaEdited) node("metaDescription").value = event.target.value.trim().slice(0, 180); });
  node("seoTitle")?.addEventListener("input", () => { state.seoTitleEdited = true; });
  node("metaDescription")?.addEventListener("input", () => { state.metaEdited = true; });
  document.querySelector("#project-form")?.addEventListener("input", renderProjectSeoChecklist);
  document.querySelector("#project-form")?.addEventListener("change", renderProjectSeoChecklist);
  let searchTimer;
  document.querySelector("#project-admin-search")?.addEventListener("input", (event) => { clearTimeout(searchTimer); searchTimer = setTimeout(() => { state.search = event.target.value.trim(); feedback(""); load(); }, 250); });
  document.querySelectorAll("[data-project-status]").forEach((button) => button.addEventListener("click", () => {
    document.querySelectorAll("[data-project-status]").forEach((item) => item.classList.toggle("active", item === button));
    state.status = button.dataset.projectStatus; feedback(""); load();
  }));

  load();
})();
