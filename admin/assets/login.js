(function () {
  "use strict";

  const apiBase = ["127.0.0.1", "localhost"].includes(location.hostname)
    ? "http://127.0.0.1:3000/api"
    : "/api";
  const form = document.querySelector("#admin-login-form");
  const message = document.querySelector("#login-message");
  const password = document.querySelector("#admin-password");
  const toggle = document.querySelector("#password-toggle");
  const submit = form?.querySelector("button[type='submit']");

  async function request(path, options = {}) {
    const response = await fetch(`${apiBase}${path}`, {
      credentials: "include",
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
      ...options,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || "İşlem tamamlanamadı.");
    return data;
  }

  request("/admin/auth/session")
    .then(() => location.replace("panel.html"))
    .catch(() => {});

  toggle?.addEventListener("click", () => {
    const visible = password.type === "text";
    password.type = visible ? "password" : "text";
    toggle.textContent = visible ? "Göster" : "Gizle";
    toggle.setAttribute("aria-label", visible ? "Şifreyi göster" : "Şifreyi gizle");
  });

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    message.textContent = "";
    submit.disabled = true;
    submit.textContent = "Kontrol ediliyor…";

    try {
      await request("/admin/auth/login", {
        method: "POST",
        body: JSON.stringify({
          username: form.elements.username.value,
          password: form.elements.password.value,
        }),
      });
      location.replace("panel.html");
    } catch (error) {
      message.textContent = error.message;
      submit.disabled = false;
      submit.textContent = "Giriş yap";
    }
  });
})();
