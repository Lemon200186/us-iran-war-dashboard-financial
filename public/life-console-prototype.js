const panelToggles = document.querySelectorAll("[data-panel-toggle]");
const jumpButtons = document.querySelectorAll("[data-jump]");
const toastButtons = document.querySelectorAll("[data-toast]");
const toast = document.getElementById("prototype-toast");

for (const button of panelToggles) {
  button.addEventListener("click", () => {
    const targetId = button.getAttribute("data-panel-toggle");
    const panel = targetId ? document.getElementById(targetId) : null;
    if (!panel) return;
    panel.hidden = !panel.hidden;
  });
}

for (const button of jumpButtons) {
  button.addEventListener("click", () => {
    const targetId = button.getAttribute("data-jump");
    const target = targetId ? document.getElementById(targetId) : null;
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "center" });
    const card = target.closest(".phone-card");
    if (card) {
      card.classList.add("is-highlighted");
      window.setTimeout(() => card.classList.remove("is-highlighted"), 900);
    }
  });
}

for (const button of toastButtons) {
  button.addEventListener("click", () => {
    const message = button.getAttribute("data-toast");
    if (message) showToast(message);
  });
}

let timer = null;
function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.hidden = false;
  toast.classList.add("is-visible");
  if (timer) window.clearTimeout(timer);
  timer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
    window.setTimeout(() => {
      toast.hidden = true;
    }, 220);
  }, 2200);
}
