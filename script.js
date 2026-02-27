// =============================
// CUSTOM CURSOR
// =============================
const cursor = document.getElementById("cursor");
const ring   = document.getElementById("cursor-ring");

let mouseX = 0, mouseY = 0;
let ringX  = 0, ringY  = 0;

document.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursor.style.left = mouseX + "px";
  cursor.style.top  = mouseY + "px";
});

// Smooth ring follow via rAF
(function animateRing() {
  ringX += (mouseX - ringX) * 0.12;
  ringY += (mouseY - ringY) * 0.12;
  ring.style.left = ringX + "px";
  ring.style.top  = ringY + "px";
  requestAnimationFrame(animateRing);
})();

// Cursor scale on interactive elements
document.addEventListener("mouseover", (e) => {
  if (e.target.closest("a, button, [data-panel], .project-item, .skill-chip")) {
    ring.style.transform  = "translate(-50%, -50%) scale(1.6)";
    ring.style.opacity    = "0.5";
    cursor.style.transform = "translate(-50%, -50%) scale(0.6)";
  }
});
document.addEventListener("mouseout", (e) => {
  if (e.target.closest("a, button, [data-panel], .project-item, .skill-chip")) {
    ring.style.transform  = "translate(-50%, -50%) scale(1)";
    ring.style.opacity    = "1";
    cursor.style.transform = "translate(-50%, -50%) scale(1)";
  }
});

// =============================
// PANEL SYSTEM
// =============================
// IMPORTANT: Must include all 7 panels in the correct order.
// "certifications" lives between "education" and "projects".
const PANEL_ORDER = ["home", "about", "skills", "education", "certifications", "projects", "contact"];
let currentIndex    = 0;
let isTransitioning = false;

const ease = "0.65s cubic-bezier(0.4, 0, 0.2, 1)";

function goToPanel(targetId) {
  const targetIndex = PANEL_ORDER.indexOf(targetId);
  if (targetIndex === -1 || targetIndex === currentIndex || isTransitioning) return;

  isTransitioning = true;
  const goingForward = targetIndex > currentIndex;

  const currentPanel = document.getElementById("panel-" + PANEL_ORDER[currentIndex]);
  const nextPanel    = document.getElementById("panel-" + PANEL_ORDER[targetIndex]);

  // ── 1. Snap next panel to its off-screen starting position (no animation yet) ──
  nextPanel.style.transition = "none";
  nextPanel.classList.remove("active", "past");
  // Incoming panel starts slightly offset for a parallax feel
  nextPanel.style.transform  = goingForward ? "translateX(55%)" : "translateX(-55%)";
  nextPanel.style.opacity    = "0";

  // ── 2. Force reflow so starting state is committed before transition fires ──
  void nextPanel.offsetWidth;

  // ── 3. Enable transitions on both panels simultaneously ──
  currentPanel.style.transition = `transform ${ease}, opacity ${ease}`;
  nextPanel.style.transition    = `transform ${ease}, opacity ${ease}`;

  // ── 4. Slide current OUT (moves further than 100% so there's no overlap) ──
  currentPanel.style.transform = goingForward ? "translateX(-110%)" : "translateX(110%)";
  currentPanel.style.opacity   = "0";
  currentPanel.classList.remove("active");

  // ── 5. Slide next IN ──
  nextPanel.style.transform = "translateX(0%)";
  nextPanel.style.opacity   = "1";
  nextPanel.classList.add("active");

  // ── Update nav highlight ──
  document.querySelectorAll(".nav-link").forEach(l =>
    l.classList.toggle("active", l.dataset.panel === targetId)
  );

  // ── Update progress bar ──
  const progress = (targetIndex / (PANEL_ORDER.length - 1)) * 100;
  document.getElementById("progressBar").style.width = progress + "%";

  // ── Update counter e.g. "03 / 07" ──
  const pad = n => String(n).padStart(2, "0");
  document.getElementById("panelCounter").textContent =
    pad(targetIndex + 1) + " / " + pad(PANEL_ORDER.length);

  currentIndex = targetIndex;

  // ── Cleanup after animation completes ──
  setTimeout(() => {
    // Clear inline styles and mark old panel as 'past' so CSS takes over
    currentPanel.style.transition = "";
    currentPanel.style.transform  = "";
    currentPanel.style.opacity    = "";
    currentPanel.classList.add("past");

    nextPanel.style.transition = "";
    isTransitioning = false;
  }, 700);
}

// Wire all [data-panel] clicks site-wide (navigation, buttons, footer links)
document.addEventListener("click", (e) => {
  const el = e.target.closest("[data-panel]");
  if (el) { e.preventDefault(); goToPanel(el.dataset.panel); }
});

// Arrow / keyboard navigation
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight" || e.key === "ArrowDown") {
    if (currentIndex < PANEL_ORDER.length - 1) goToPanel(PANEL_ORDER[currentIndex + 1]);
  }
  if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
    if (currentIndex > 0) goToPanel(PANEL_ORDER[currentIndex - 1]);
  }
});

// =============================
// PROJECTS MODAL
// =============================
const projects = [
  {
    title: "AI Medical Waste Detection System",
    desc:  "An intelligent system using YOLO object detection integrated with a conveyor-based waste segregation machine. Automatically classifies and sorts medical waste in real-time, improving safety and efficiency in healthcare facilities.",
    tech:  ["YOLO", "Computer Vision", "Python", "Embedded Systems"],
    inst:  "STI College Caloocan",
    year:  "2024 - 2025"
  },
  {
    title: "Mini Calculator Application",
    desc:  "A fully functional calculator application demonstrating core programming fundamentals and object-oriented principles.",
    tech:  ["Java", "OOP", "UI Design"],
    inst:  "STI College Caloocan",
    year:  "2023"
  }
];

function openModal(i) {
  const p = projects[i];
  document.getElementById("modalTitle").textContent = p.title;
  document.getElementById("modalDesc").textContent  = p.desc;
  document.getElementById("modalInst").textContent  = p.inst;
  document.getElementById("modalYear").textContent  = p.year;
  document.getElementById("modalTech").innerHTML    =
    p.tech.map(t => `<span class="tag" style="margin:2px 4px 2px 0;">${t}</span>`).join("");

  const overlay = document.getElementById("projectModal");
  overlay.classList.add("open");
  // Small delay lets the display:flex paint before the opacity transition fires
  requestAnimationFrame(() => overlay.classList.add("visible"));
}

function closeModal() {
  const overlay = document.getElementById("projectModal");
  overlay.classList.remove("visible");
  // Wait for fade-out, then hide
  overlay.addEventListener("transitionend", () => overlay.classList.remove("open"), { once: true });
}

// Close modal on Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});