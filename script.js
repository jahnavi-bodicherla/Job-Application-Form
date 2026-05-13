/* ═══════════════════════════════════════════════════
   Meridian Careers — script.js
   Validation · Dark Mode · Animations · Form Logic
   ═══════════════════════════════════════════════════ */

"use strict";

// ──────────────────────────────────────────────────────
// 1. DOM REFERENCES
// ──────────────────────────────────────────────────────
const form        = document.getElementById("appForm");
const submitBtn   = document.getElementById("submitBtn");
const navbar      = document.getElementById("navbar");
const themeToggle = document.getElementById("themeToggle");
const themeIcon   = document.getElementById("themeIcon");
const hamburger   = document.getElementById("hamburger");
const mobileMenu  = document.getElementById("mobileMenu");
const successModal= document.getElementById("successModal");
const modalCloseBtn= document.getElementById("modalCloseBtn");
const modalName   = document.getElementById("modalName");
const countdownNum= document.getElementById("countdownNum");
const toast       = document.getElementById("toast");
const progressFill= document.getElementById("progressFill");
const progressPct = document.getElementById("progressPct");
const progressWrap= document.getElementById("progressWrap");
const msgCounter  = document.getElementById("message-counter");
const resumeInput = document.getElementById("resume");
const resumeZone  = document.getElementById("resumeZone");
const uploadText  = document.getElementById("uploadText");

// ──────────────────────────────────────────────────────
// 2. THEME (DARK MODE)
// ──────────────────────────────────────────────────────

/**
 * Apply a theme to the document root.
 * Persists the preference to localStorage.
 * @param {"light"|"dark"} theme
 */
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("meridian-theme", theme);
  // Swap icon
  if (theme === "dark") {
    themeIcon.classList.replace("fa-moon", "fa-sun");
  } else {
    themeIcon.classList.replace("fa-sun", "fa-moon");
  }
}

// Restore saved theme or respect OS preference
(function initTheme() {
  const saved = localStorage.getItem("meridian-theme");
  if (saved) {
    applyTheme(saved);
  } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    applyTheme("dark");
  }
})();

themeToggle.addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme");
  applyTheme(current === "dark" ? "light" : "dark");
  showToast(current === "dark" ? "Light mode on" : "Dark mode on");
});

// ──────────────────────────────────────────────────────
// 3. NAVBAR — sticky + mobile hamburger
// ──────────────────────────────────────────────────────

// Add shadow when scrolled
window.addEventListener("scroll", () => {
  navbar.classList.toggle("scrolled", window.scrollY > 10);
}, { passive: true });

// Hamburger toggle
hamburger.addEventListener("click", () => {
  const isOpen = mobileMenu.classList.toggle("open");
  hamburger.setAttribute("aria-expanded", String(isOpen));
});

// Close mobile menu on link click
mobileMenu.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    mobileMenu.classList.remove("open");
    hamburger.setAttribute("aria-expanded", "false");
  });
});

// ──────────────────────────────────────────────────────
// 4. SCROLL REVEAL
// ──────────────────────────────────────────────────────

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

// Apply reveal class to key sections after DOM ready
document.querySelectorAll(".form-container, .site-footer").forEach(el => {
  el.classList.add("reveal");
  revealObserver.observe(el);
});

// ──────────────────────────────────────────────────────
// 5. TOAST NOTIFICATIONS
// ──────────────────────────────────────────────────────

let toastTimer = null;

/**
 * Show a temporary toast message at the bottom of the screen.
 * @param {string} message - Text to display
 * @param {"default"|"error"} type - Visual style
 * @param {number} duration - Display time in ms
 */
function showToast(message, type = "default", duration = 2600) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.remove("error-toast");
  if (type === "error") toast.classList.add("error-toast");
  toast.classList.add("show");
  toastTimer = setTimeout(() => toast.classList.remove("show"), duration);
}

// ──────────────────────────────────────────────────────
// 6. VALIDATION HELPERS
// ──────────────────────────────────────────────────────

/** Regex patterns */
const REGEX = {
  name:      /^[A-Za-z\s'-]{3,}$/,
  email:     /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
  phone:     /^\d{10}$/,
  url:       /^https?:\/\/([\w-]+\.)+[\w-]+(\/[\w\-._~:/?#[\]@!$&'()*+,;=%]*)?$/,
};

/**
 * Mark a field-group as valid or invalid and set the error message.
 * @param {string} id    - The id of the <input> / <select> / <textarea>
 * @param {boolean} valid
 * @param {string} message - Error text (empty string = clear error)
 */
function setValidity(id, valid, message = "") {
  const fieldGroup = document.getElementById(`fg-${id}`);
  const errorEl    = document.getElementById(`${id}-error`);
  if (!fieldGroup) return;

  fieldGroup.classList.toggle("is-valid",   valid);
  fieldGroup.classList.toggle("is-invalid", !valid);
  if (errorEl) errorEl.textContent = valid ? "" : message;
}

/** Clear all validity states (used on reset) */
function clearValidity() {
  document.querySelectorAll(".field-group").forEach(fg => {
    fg.classList.remove("is-valid", "is-invalid");
  });
  document.querySelectorAll(".field-error").forEach(el => {
    el.textContent = "";
  });
}

// ──────────────────────────────────────────────────────
// 7. INDIVIDUAL FIELD VALIDATORS
// ──────────────────────────────────────────────────────

function validateFullName() {
  const val = document.getElementById("fullName").value.trim();
  if (!val)               return setValidity("name", false, "Full name is required."), false;
  if (!REGEX.name.test(val))
    return setValidity("name", false, "Name must be at least 3 letters (alphabets only)."), false;
  setValidity("name", true); return true;
}

function validateEmail() {
  const val = document.getElementById("email").value.trim();
  if (!val)                     return setValidity("email", false, "Email address is required."), false;
  if (!REGEX.email.test(val))   return setValidity("email", false, "Enter a valid email (e.g. jane@co.com)."), false;
  setValidity("email", true); return true;
}

function validatePhone() {
  const val = document.getElementById("phone").value.trim();
  if (!val)                     return setValidity("phone", false, "Phone number is required."), false;
  if (!REGEX.phone.test(val))   return setValidity("phone", false, "Enter exactly 10 digits."), false;
  setValidity("phone", true); return true;
}

function validateRole() {
  const val = document.getElementById("jobRole").value;
  if (!val) return setValidity("role", false, "Please select a job role."), false;
  setValidity("role", true); return true;
}

function validateExperience() {
  const val = document.getElementById("experience").value;
  if (!val) return setValidity("exp", false, "Please select your experience level."), false;
  setValidity("exp", true); return true;
}

function validateLinkedin() {
  const val = document.getElementById("linkedin").value.trim();
  if (!val) { setValidity("linkedin", true); return true; } // optional
  if (!REGEX.url.test(val)) return setValidity("linkedin", false, "Enter a valid URL starting with https://"), false;
  setValidity("linkedin", true); return true;
}

function validatePortfolio() {
  const val = document.getElementById("portfolio").value.trim();
  if (!val) { setValidity("portfolio", true); return true; } // optional
  if (!REGEX.url.test(val)) return setValidity("portfolio", false, "Enter a valid URL starting with https://"), false;
  setValidity("portfolio", true); return true;
}

function validateMessage() {
  const val = document.getElementById("message").value.trim();
  if (!val)          return setValidity("message", false, "A cover letter is required."), false;
  if (val.length < 50)
    return setValidity("message", false, `At least 50 characters needed (${val.length}/50).`), false;
  setValidity("message", true); return true;
}

function validateTerms() {
  const checked = document.getElementById("terms").checked;
  if (!checked) return setValidity("terms", false, "You must agree to the terms before submitting."), false;
  setValidity("terms", true); return true;
}

// ──────────────────────────────────────────────────────
// 8. PROGRESS BAR
// ──────────────────────────────────────────────────────

/** Required fields tracked for progress */
const REQUIRED_IDS = ["fullName", "email", "phone", "jobRole", "experience", "message"];

function updateProgress() {
  let filled = 0;
  REQUIRED_IDS.forEach(id => {
    const el = document.getElementById(id);
    if (el && el.value.trim()) filled++;
  });
  // Also count terms checkbox
  if (document.getElementById("terms").checked) filled++;
  const total   = REQUIRED_IDS.length + 1;
  const pct     = Math.round((filled / total) * 100);
  progressFill.style.width = pct + "%";
  progressPct.textContent  = pct + "%";
  progressWrap.setAttribute("aria-valuenow", pct);
}

// ──────────────────────────────────────────────────────
// 9. SUBMIT BUTTON ENABLE/DISABLE
// ──────────────────────────────────────────────────────

function checkSubmitEligibility() {
  const allFilled = REQUIRED_IDS.every(id => {
    const el = document.getElementById(id);
    return el && el.value.trim().length > 0;
  });
  const termsChecked = document.getElementById("terms").checked;
  const eligible = allFilled && termsChecked;

  submitBtn.disabled = !eligible;
  submitBtn.setAttribute("aria-disabled", String(!eligible));
}

// ──────────────────────────────────────────────────────
// 10. REAL-TIME EVENT LISTENERS
// ──────────────────────────────────────────────────────

/** Attach blur + input listeners to a field's validator */
function watchField(id, validator) {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener("blur",  validator);
  el.addEventListener("input", () => { validator(); updateProgress(); checkSubmitEligibility(); });
}

watchField("fullName",   validateFullName);
watchField("email",      validateEmail);
watchField("phone",      validatePhone);
watchField("jobRole",    validateRole);
watchField("experience", validateExperience);
watchField("linkedin",   validateLinkedin);
watchField("portfolio",  validatePortfolio);
watchField("message",    validateMessage);

// Terms checkbox
document.getElementById("terms").addEventListener("change", () => {
  validateTerms();
  updateProgress();
  checkSubmitEligibility();
});

// ──────────────────────────────────────────────────────
// 11. PHONE: PREVENT NON-DIGITS / AUTO-FORMAT
// ──────────────────────────────────────────────────────

document.getElementById("phone").addEventListener("keypress", e => {
  // Allow only digits, backspace, delete, arrows
  if (!/[\d]/.test(e.key) && !["Backspace","Delete","ArrowLeft","ArrowRight","Tab"].includes(e.key)) {
    e.preventDefault();
    showToast("Only numbers allowed in phone field", "error", 1800);
  }
});

// ──────────────────────────────────────────────────────
// 12. CHARACTER COUNTER FOR MESSAGE
// ──────────────────────────────────────────────────────

document.getElementById("message").addEventListener("input", () => {
  const len = document.getElementById("message").value.trim().length;
  msgCounter.textContent = `${len} / 50 min`;
  msgCounter.classList.toggle("ok",      len >= 50);
  msgCounter.classList.toggle("warning", len > 0 && len < 50);
  if (len >= 50) msgCounter.classList.remove("warning");
});

// ──────────────────────────────────────────────────────
// 13. RESUME UPLOAD
// ──────────────────────────────────────────────────────

resumeInput.addEventListener("change", () => {
  const file = resumeInput.files[0];
  if (!file) return;
  const allowedTypes = ["application/pdf", "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
  const maxSize = 5 * 1024 * 1024; // 5 MB

  if (!allowedTypes.includes(file.type)) {
    showToast("Only PDF, DOC, DOCX allowed", "error");
    resumeInput.value = "";
    return;
  }
  if (file.size > maxSize) {
    showToast("File must be under 5 MB", "error");
    resumeInput.value = "";
    return;
  }
  uploadText.textContent = `✓ ${file.name}`;
  resumeZone.classList.add("has-file");
  showToast("Resume attached!");
});

// Keyboard trigger for file zone
resumeZone.addEventListener("keydown", e => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    resumeInput.click();
  }
});

// ──────────────────────────────────────────────────────
// 14. LOCAL STORAGE — SAVE & RESTORE DRAFT
// ──────────────────────────────────────────────────────

const DRAFT_KEY = "meridian-draft";

/** Save current form values to localStorage */
function saveDraft() {
  const draft = {
    fullName:   document.getElementById("fullName").value,
    email:      document.getElementById("email").value,
    phone:      document.getElementById("phone").value,
    jobRole:    document.getElementById("jobRole").value,
    experience: document.getElementById("experience").value,
    skills:     document.getElementById("skills").value,
    linkedin:   document.getElementById("linkedin").value,
    portfolio:  document.getElementById("portfolio").value,
    message:    document.getElementById("message").value,
  };
  localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

/** Restore draft from localStorage */
function restoreDraft() {
  const raw = localStorage.getItem(DRAFT_KEY);
  if (!raw) return;
  try {
    const draft = JSON.parse(raw);
    Object.entries(draft).forEach(([key, val]) => {
      const el = document.getElementById(key);
      if (el && val) el.value = val;
    });
    updateProgress();
    checkSubmitEligibility();
    // Update char counter
    const msgLen = document.getElementById("message").value.trim().length;
    if (msgLen) {
      msgCounter.textContent = `${msgLen} / 50 min`;
      msgCounter.classList.toggle("ok", msgLen >= 50);
    }
  } catch (e) {
    console.warn("Failed to restore draft:", e);
  }
}

// Auto-save every 2 seconds while typing
let saveTimer = null;
form.addEventListener("input", () => {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveDraft, 2000);
});

restoreDraft();

// ──────────────────────────────────────────────────────
// 15. SUCCESS MODAL
// ──────────────────────────────────────────────────────

let countdownTimer = null;

/**
 * Open the success modal and start the auto-close countdown.
 * @param {string} applicantName
 */
function openSuccessModal(applicantName) {
  modalName.textContent = `Good luck, ${applicantName}! 🎉`;
  successModal.classList.add("open");
  successModal.removeAttribute("aria-hidden");
  modalCloseBtn.focus();

  // Countdown 5 → 0 then close
  let count = 5;
  countdownNum.textContent = count;
  countdownTimer = setInterval(() => {
    count--;
    countdownNum.textContent = count;
    if (count <= 0) closeSuccessModal();
  }, 1000);
}

function closeSuccessModal() {
  clearInterval(countdownTimer);
  successModal.classList.remove("open");
  successModal.setAttribute("aria-hidden", "true");
}

modalCloseBtn.addEventListener("click", closeSuccessModal);

// Close on overlay click
successModal.addEventListener("click", e => {
  if (e.target === successModal) closeSuccessModal();
});

// Close on Escape
document.addEventListener("keydown", e => {
  if (e.key === "Escape" && successModal.classList.contains("open")) closeSuccessModal();
});

// ──────────────────────────────────────────────────────
// 16. RIPPLE EFFECT ON SUBMIT BUTTON
// ──────────────────────────────────────────────────────

submitBtn.addEventListener("click", e => {
  const ripple = submitBtn.querySelector(".btn-ripple");
  const rect   = submitBtn.getBoundingClientRect();
  const size   = Math.max(rect.width, rect.height);
  ripple.style.cssText = `
    width: ${size}px; height: ${size}px;
    top: ${e.clientY - rect.top  - size / 2}px;
    left: ${e.clientX - rect.left - size / 2}px;
  `;
  ripple.classList.remove("animate");
  void ripple.offsetWidth; // reflow trick
  ripple.classList.add("animate");
});

// ──────────────────────────────────────────────────────
// 17. FORM SUBMISSION
// ──────────────────────────────────────────────────────

form.addEventListener("submit", async e => {
  e.preventDefault();

  // Run all validators
  const results = [
    validateFullName(),
    validateEmail(),
    validatePhone(),
    validateRole(),
    validateExperience(),
    validateLinkedin(),
    validatePortfolio(),
    validateMessage(),
    validateTerms(),
  ];

  // If any failed, shake invalid fields and show toast
  if (results.includes(false)) {
    document.querySelectorAll(".field-group.is-invalid").forEach(fg => {
      fg.classList.remove("is-invalid");
      void fg.offsetWidth; // reflow = re-trigger animation
      fg.classList.add("is-invalid");
    });
    showToast("Please fix the errors before submitting.", "error");
    // Scroll to first invalid field
    const firstInvalid = form.querySelector(".field-group.is-invalid");
    if (firstInvalid) firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }

  // ─── Loading state ───
  submitBtn.classList.add("loading");
  submitBtn.disabled = true;

  // Simulate async submission (replace with real fetch in production)
  await new Promise(resolve => setTimeout(resolve, 1800));

  // ─── Collect data ───
  const formData = {
    fullName:   document.getElementById("fullName").value.trim(),
    email:      document.getElementById("email").value.trim(),
    phone:      document.getElementById("phone").value.trim(),
    jobRole:    document.getElementById("jobRole").value,
    experience: document.getElementById("experience").value,
    skills:     document.getElementById("skills").value.trim(),
    linkedin:   document.getElementById("linkedin").value.trim(),
    portfolio:  document.getElementById("portfolio").value.trim(),
    message:    document.getElementById("message").value.trim(),
    gender:     document.querySelector('input[name="gender"]:checked')?.value || "Not specified",
    submittedAt: new Date().toLocaleString(),
  };

  // Log to console for demonstration
  console.group("%c✅ Meridian Application Submitted", "color: #c9a84c; font-weight: bold; font-size: 14px");
  console.table(formData);
  console.groupEnd();

  // ─── Success state ───
  submitBtn.classList.remove("loading");
  submitBtn.classList.add("done");

  // Clear draft
  localStorage.removeItem(DRAFT_KEY);

  // Show modal
  openSuccessModal(formData.fullName.split(" ")[0]);

  // Reset form after modal closes (slight delay)
  setTimeout(() => {
    form.reset();
    clearValidity();
    submitBtn.classList.remove("done");
    submitBtn.disabled = true;
    submitBtn.setAttribute("aria-disabled", "true");
    uploadText.textContent = "Drop your file here or click to browse";
    resumeZone.classList.remove("has-file");
    msgCounter.textContent  = "0 / 50 min";
    msgCounter.className    = "char-counter";
    progressFill.style.width = "0%";
    progressPct.textContent  = "0%";
  }, 6500);
});

// ──────────────────────────────────────────────────────
// 18. INITIAL STATE
// ──────────────────────────────────────────────────────
updateProgress();
checkSubmitEligibility();
