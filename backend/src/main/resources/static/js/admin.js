// FotoIT Admin — interactiuni mici, fara dependinte
(function () {
  "use strict";

  // ---------------------------------------------------------------- Notificare
  const toast = document.getElementById("toast");
  let toastTimer;
  function showToast(text) {
    if (!toast) return;
    toast.querySelector("[data-toast-text]").textContent = text;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2600);
  }

  // ---------------------------------------------------------------- Copiere in clipboard
  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback pentru pagini servite fara HTTPS / browsere vechi
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      let ok = false;
      try {
        ok = document.execCommand("copy");
      } catch {
        ok = false;
      }
      area.remove();
      return ok;
    }
  }

  document.addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-copy]");
    if (!btn) return;
    e.preventDefault();
    let text = btn.getAttribute("data-copy");
    const fromId = btn.getAttribute("data-copy-from");
    if (fromId) text = document.getElementById(fromId)?.textContent.trim() ?? text;
    const ok = await copyText(text);
    showToast(ok ? btn.getAttribute("data-copy-label") || "Copiat în clipboard" : "Nu s-a putut copia");
  });

  // ---------------------------------------------------------------- Mesaje care se pot inchide
  document.querySelectorAll("[data-dismissible] .alert-close").forEach((btn) =>
    btn.addEventListener("click", () => btn.closest(".alert").remove())
  );

  // ---------------------------------------------------------------- Confirmare stergere
  const dialog = document.getElementById("confirm-delete");
  let pendingForm = null;

  document.querySelectorAll("form[data-confirm-delete]").forEach((form) => {
    form.addEventListener("submit", (e) => {
      if (form.dataset.confirmed === "true" || !dialog?.showModal) return;
      e.preventDefault();
      pendingForm = form;
      dialog.querySelector("[data-confirm-name]").textContent = form.getAttribute("data-confirm-delete");
      dialog.showModal();
      dialog.querySelector("[data-confirm-cancel]").focus();
    });
  });

  dialog?.querySelector("[data-confirm-cancel]").addEventListener("click", () => dialog.close());
  dialog?.querySelector("[data-confirm-ok]").addEventListener("click", () => {
    if (!pendingForm) return;
    pendingForm.dataset.confirmed = "true";
    dialog.close();
    pendingForm.submit();
  });
  // Click pe fundal inchide dialogul
  dialog?.addEventListener("click", (e) => {
    if (e.target === dialog) dialog.close();
  });

  // ---------------------------------------------------------------- Sincronizare: ecran de asteptare
  const busy = document.getElementById("busy");
  document.querySelectorAll("form[data-busy]").forEach((form) => {
    form.addEventListener("submit", () => {
      form.querySelectorAll("button").forEach((b) => {
        b.disabled = true;
        b.classList.add("is-loading");
      });
      busy?.classList.add("is-visible");
    });
  });
  // La revenirea cu butonul Inapoi, pagina poate veni din cache cu ecranul activ
  window.addEventListener("pageshow", () => {
    busy?.classList.remove("is-visible");
    document.querySelectorAll("button.is-loading").forEach((b) => {
      b.disabled = false;
      b.classList.remove("is-loading");
    });
  });

  // ---------------------------------------------------------------- Cautare in lista de evenimente
  const search = document.getElementById("event-search");
  if (search) {
    const items = Array.from(document.querySelectorAll("[data-search]"));
    const empty = document.getElementById("search-empty");
    search.addEventListener("input", () => {
      const q = search.value.trim().toLowerCase();
      let visible = 0;
      items.forEach((item) => {
        const match = !q || item.getAttribute("data-search").toLowerCase().includes(q);
        item.hidden = !match;
        if (match) visible++;
      });
      if (empty) empty.hidden = visible > 0;
    });
  }
})();
