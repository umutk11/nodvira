(function (global) {
  "use strict";

  const initializedForms = new WeakSet();

  function contactEndpoint() {
    if (global.NODVIRA_API_BASE) {
      return `${String(global.NODVIRA_API_BASE).replace(/\/$/, "")}/api/contact-requests`;
    }
    const localHost = ["127.0.0.1", "localhost"].includes(global.location.hostname);
    if (global.location.protocol === "file:" || (localHost && global.location.port !== "3000")) {
      return "http://127.0.0.1:3000/api/contact-requests";
    }
    return "/api/contact-requests";
  }

  function preparePrivacyFields(form) {
    if (!form.querySelector("[name='website']")) {
      const honeypot = document.createElement("div");
      honeypot.className = "form-honeypot";
      honeypot.setAttribute("aria-hidden", "true");
      honeypot.innerHTML = '<label>Web sitesi<input name="website" type="text" tabindex="-1" autocomplete="off"></label>';
      form.append(honeypot);
    }

    const note = form.querySelector(".form-note");
    if (note) {
      note.innerHTML = 'Bilgileriniz yalnızca talebinizi değerlendirmek ve sizinle iletişim kurmak amacıyla işlenir. Ayrıntılar için <a href="/kvkk-aydinlatma-metni" target="_blank" rel="noopener">KVKK Aydınlatma Metni</a>\'ni inceleyin.';
    }

    if (!form.querySelector("[name='privacyNoticeAcknowledged']")) {
      form.querySelector("[name='consent']")?.closest(".consent-field")?.remove();
      const acknowledgement = document.createElement("label");
      acknowledgement.className = "consent-field";
      acknowledgement.innerHTML = '<input name="privacyNoticeAcknowledged" type="checkbox" required><span><a href="/kvkk-aydinlatma-metni" target="_blank" rel="noopener">KVKK Aydınlatma Metni</a>\'ni okudum ve kişisel verilerimin metinde açıklanan şekilde işlendiği konusunda bilgilendirildim. *</span>';
      note?.insertAdjacentElement("afterend", acknowledgement);
    }

    const service = form.elements.service;
    if (service && ![...service.options].some((option) => option.value === "KVKK Başvurusu")) {
      service.add(new Option("KVKK Başvurusu", "KVKK Başvurusu"));
    }
  }

  function setSubmitting(form, submitting) {
    const button = form.querySelector("[type='submit']");
    if (!button) return;
    if (!button.dataset.defaultText) button.dataset.defaultText = button.textContent;
    button.disabled = submitting;
    button.setAttribute("aria-busy", String(submitting));
    button.textContent = submitting ? "Gönderiliyor…" : button.dataset.defaultText;
  }

  function groupedPhoneDigits(value) {
    return [value.slice(0, 3), value.slice(3, 6), value.slice(6, 8), value.slice(8, 10)]
      .filter(Boolean)
      .join(" ");
  }

  function formatPhoneInput(value) {
    const rawValue = String(value || "").trimStart();
    const international = rawValue.startsWith("+");
    let digits = rawValue.replace(/\D/g, "");

    if (international) {
      if (digits.length <= 2 && "90".startsWith(digits)) return `+${digits}`;
      if (!digits.startsWith("90")) return `+${digits.slice(0, 12)}`;
      digits = digits.slice(2);
      return `+90${digits ? ` ${groupedPhoneDigits(digits.slice(0, 10))}` : ""}`;
    }

    const domestic = digits.startsWith("0");
    if (domestic) digits = digits.slice(1);
    return `${domestic ? "0" : ""}${groupedPhoneDigits(digits.slice(0, 10))}`;
  }

  function phoneIsValid(value) {
    return !value || /^(?:\+90 5\d{2} \d{3} \d{2} \d{2}|05\d{2} \d{3} \d{2} \d{2}|5\d{2} \d{3} \d{2} \d{2})$/.test(value);
  }

  function setPhoneValidity(phone) {
    phone?.setCustomValidity(phoneIsValid(phone.value)
      ? ""
      : "Telefonu +90 555 555 55 55, 0555 555 55 55 veya 555 555 55 55 formatında girin.");
  }

  function preparePhoneField(form) {
    const phone = form.elements.phone;
    if (!phone) return;
    phone.inputMode = "tel";
    phone.maxLength = 17;
    phone.placeholder = "+90 555 555 55 55";
    phone.title = "+90 555 555 55 55, 0555 555 55 55 veya 555 555 55 55 formatını kullanın.";
    phone.addEventListener("input", () => {
      phone.value = formatPhoneInput(phone.value);
      phone.setCustomValidity("");
    });
    phone.addEventListener("blur", () => setPhoneValidity(phone));
  }

  function init(form) {
    if (!form || initializedForms.has(form)) return;
    initializedForms.add(form);
    preparePrivacyFields(form);
    preparePhoneField(form);

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const status = form.querySelector("#form-status");
      if (status) {
        status.classList.remove("error");
        status.textContent = "";
      }

      setPhoneValidity(form.elements.phone);
      if (!form.reportValidity()) return;
      const data = new FormData(form);

      // Bots commonly fill this visually hidden field; silently accept without storing.
      if (String(data.get("website") || "").trim()) {
        form.reset();
        if (status) status.textContent = "Talebiniz bize ulaştı. En kısa sürede sizinle iletişime geçeceğiz.";
        return;
      }

      setSubmitting(form, true);
      if (status) status.textContent = "Talebiniz güvenli biçimde gönderiliyor…";

      const payload = Object.fromEntries(data.entries());
      payload.privacyNoticeAcknowledged = data.get("privacyNoticeAcknowledged") === "on";
      payload.sourceUrl = global.location.href;

      const controller = new AbortController();
      const timeout = global.setTimeout(() => controller.abort(), 15_000);
      try {
        const response = await fetch(contactEndpoint(), {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.message || "Talep gönderilemedi.");

        form.reset();
        form.querySelector('select[name="service"]')?.dispatchEvent(new Event("change", { bubbles: true }));
        if (status) status.textContent = result.message || "Talebiniz bize ulaştı. En kısa sürede sizinle iletişime geçeceğiz.";
      } catch (error) {
        if (status) {
          status.classList.add("error");
          status.textContent = error.name === "AbortError"
            ? "Gönderim zaman aşımına uğradı. Lütfen tekrar deneyin."
            : error.message || "Talep gönderilemedi. Lütfen tekrar deneyin.";
        }
      } finally {
        global.clearTimeout(timeout);
        setSubmitting(form, false);
      }
    });
  }

  global.PublicRequestForm = Object.freeze({ init });
})(window);
