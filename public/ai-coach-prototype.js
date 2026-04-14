const whyThisButton = document.querySelector('[data-toggle="why-this-panel"]');
const whyThisPanel = document.getElementById("why-this-panel");
const jumpButtons = document.querySelectorAll("[data-jump]");
const compressButton = document.querySelector("[data-compress]");
const reviewButtons = document.querySelectorAll("[data-review-answer]");
const reviewHeadline = document.querySelector("[data-review-headline]");
const reviewCopy = document.querySelector("[data-review-copy]");
const answerFeedback = document.querySelector("[data-answer-feedback]");
const toast = document.getElementById("prototype-toast");

if (whyThisButton && whyThisPanel) {
  whyThisButton.addEventListener("click", () => {
    const expanded = whyThisButton.getAttribute("aria-expanded") === "true";
    whyThisButton.setAttribute("aria-expanded", String(!expanded));
    whyThisPanel.hidden = expanded;
  });
}

for (const button of jumpButtons) {
  button.addEventListener("click", () => {
    const targetId = button.getAttribute("data-jump");
    const target = targetId ? document.getElementById(targetId) : null;
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
      flash(target.closest(".device-card"));
    }
  });
}

if (compressButton) {
  compressButton.addEventListener("click", () => {
    const commandBlock = document.querySelector(".takeover-command");
    if (!commandBlock) return;

    commandBlock.innerHTML = `
      <div class="command-topline">
        <span>Minimum Visible Deliverable</span>
        <span class="cold-badge">Compressed</span>
      </div>
      <div class="command-block">
        <small>Command</small>
        <p>Ship one onboarding state header plus one interaction note. Nothing more.</p>
      </div>
      <div class="command-block">
        <small>Reason</small>
        <p>The mission still needs a visible artifact, but the scope must shrink again to remain executable tonight.</p>
      </div>
      <div class="command-block">
        <small>Done When</small>
        <ul>
          <li>Header layout finished</li>
          <li>One state note written</li>
          <li>Saved before 21:30</li>
        </ul>
      </div>
    `;
    showToast("Plan compressed. The day still ends with a visible artifact.");
  });
}

for (const button of reviewButtons) {
  button.addEventListener("click", () => {
    for (const item of reviewButtons) item.classList.remove("active");
    button.classList.add("active");

    const answer = button.getAttribute("data-review-answer");
    if (answer === "yes") {
      if (reviewHeadline) reviewHeadline.textContent = "Busy day. Incomplete mission.";
      if (reviewCopy) reviewCopy.textContent = "The day stayed active, but the key mission remained too large and never converted into visible output.";
      if (answerFeedback) answerFeedback.textContent = "Alignment held. Tomorrow only needs scope correction.";
    } else {
      if (reviewHeadline) reviewHeadline.textContent = "Drifted day. Wrong center of gravity.";
      if (reviewCopy) reviewCopy.textContent = "Too much effort went into surrounding activity. The declared mission lost priority before it ever became tangible.";
      if (answerFeedback) answerFeedback.textContent = "Main line broke. Tomorrow needs both a smaller mission and a firmer start boundary.";
    }
  });
}

for (const button of document.querySelectorAll("[data-toast]")) {
  button.addEventListener("click", () => {
    const message = button.getAttribute("data-toast");
    if (message) showToast(message);
  });
}

function flash(element) {
  if (!element) return;
  element.classList.add("is-highlighted");
  window.setTimeout(() => element.classList.remove("is-highlighted"), 900);
}

let toastTimer = null;
function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.hidden = false;
  toast.classList.add("is-visible");

  if (toastTimer) window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
    window.setTimeout(() => {
      toast.hidden = true;
    }, 220);
  }, 2400);
}
