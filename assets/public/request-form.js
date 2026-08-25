(function (global) {
  "use strict";

  const initializedForms = new WeakSet();

  function preparePrivacyFields(form) {
    const note = form.querySelector(".form-note");
    if (note) note.textContent = "Bu frontend inceleme kopyasında form verileri kaydedilmez veya gönderilmez.";

    if (!form.querySelector("[name='consent']")) {
      const consent = document.createElement("label");
      consent.className = "consent-field";
      consent.innerHTML = '<input name="consent" type="checkbox" required><span>Demo formunu göndermeyi onaylıyorum. *</span>';
      note?.insertAdjacentElement("afterend", consent);
    }
  }

  function init(form) {
    if (!form || initializedForms.has(form)) return;
    initializedForms.add(form);
    preparePrivacyFields(form);

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const status = form.querySelector("#form-status");
      const button = form.querySelector("[type='submit']");
      if (!button.dataset.defaultText) button.dataset.defaultText = button.textContent;
      button.disabled = true;
      button.textContent = "Demo gönderim…";
      global.setTimeout(() => {
        form.reset();
        form.querySelector('select[name="service"]')?.dispatchEvent(new Event("change", { bubbles: true }));
        if (status) status.textContent = "Demo tamamlandı. Bu inceleme kopyasında herhangi bir veri gönderilmedi.";
        button.disabled = false;
        button.textContent = button.dataset.defaultText;
      }, 450);
    });
  }

  global.PublicRequestForm = Object.freeze({ init });
})(window);
