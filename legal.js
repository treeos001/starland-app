if (window.parent !== window) document.documentElement.classList.add("is-embedded");

const lang = document.documentElement.lang.startsWith("zh") ? "zh" : "en";
const langTrigger = document.querySelector("#langTrigger");
const langSelector = document.querySelector(".lang-selector");
const navbar = document.querySelector(".navbar");
const burgerToggle = document.querySelector("#burgerToggle");
const mobileMenu = document.querySelector("#mobileMenu");
const aboutModal = document.querySelector("#aboutModal");
const aboutModalOpen = document.querySelector("#aboutModalOpen");
const aboutModalClose = document.querySelector("#aboutModalClose");
const aboutMobileBack = document.querySelector("#aboutMobileBack");
const year = document.querySelector("#year");

if (year) year.textContent = new Date().getFullYear();

if (langTrigger && langSelector) {
  langTrigger.addEventListener("click", (event) => {
    event.stopPropagation();
    const open = langSelector.classList.toggle("open");
    langTrigger.setAttribute("aria-expanded", open ? "true" : "false");
  });
  document.querySelectorAll(".lang-dropdown a").forEach((item) => {
    item.addEventListener("click", () => {
      langSelector.classList.remove("open");
      langTrigger.setAttribute("aria-expanded", "false");
    });
  });
  document.addEventListener("click", () => {
    langSelector.classList.remove("open");
    langTrigger.setAttribute("aria-expanded", "false");
  });
}

function closeMobileMenuIfOpen() {
  if (!mobileMenu?.classList.contains("open")) return;
  burgerToggle?.classList.remove("open");
  mobileMenu.classList.remove("open");
  navbar?.classList.remove("menu-open");
  burgerToggle?.setAttribute("aria-expanded", "false");
  burgerToggle?.setAttribute("aria-label", lang === "zh" ? "打开菜单" : "Open menu");
  if (!aboutModal?.classList.contains("show")) document.body.style.overflow = "";
}

if (burgerToggle && mobileMenu) {
  burgerToggle.addEventListener("click", () => {
    const open = !mobileMenu.classList.contains("open");
    burgerToggle.classList.toggle("open", open);
    mobileMenu.classList.toggle("open", open);
    navbar?.classList.toggle("menu-open", open);
    burgerToggle.setAttribute("aria-expanded", open ? "true" : "false");
    burgerToggle.setAttribute("aria-label", open
      ? (lang === "zh" ? "关闭菜单" : "Close menu")
      : (lang === "zh" ? "打开菜单" : "Open menu"));
    document.body.style.overflow = open || aboutModal?.classList.contains("show") ? "hidden" : "";
  });
}

document.querySelectorAll(".mobile-lang a").forEach((item) => {
  item.addEventListener("click", () => {
    closeMobileMenuIfOpen();
  });
});

function openAboutModal() {
  if (!aboutModal || aboutModal.classList.contains("show")) return;
  aboutModal.classList.add("show");
  aboutModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  aboutModalOpen?.setAttribute("aria-expanded", "true");
  if (location.hash !== "#about") history.replaceState(null, "", "#about");
}

function closeAboutModal() {
  if (!aboutModal || !aboutModal.classList.contains("show")) {
    if (location.hash === "#about") history.replaceState(null, "", location.pathname + location.search);
    return;
  }
  aboutModal.classList.remove("show");
  aboutModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = mobileMenu?.classList.contains("open") ? "hidden" : "";
  aboutModalOpen?.setAttribute("aria-expanded", "false");
  if (location.hash === "#about") history.replaceState(null, "", location.pathname + location.search);
}

aboutModalOpen?.addEventListener("click", (event) => {
  event.preventDefault();
  openAboutModal();
});
document.querySelectorAll(".mobile-about-open").forEach((el) => {
  el.addEventListener("click", (event) => {
    event.preventDefault();
    closeMobileMenuIfOpen();
    openAboutModal();
  });
});
aboutModalClose?.addEventListener("click", closeAboutModal);
aboutMobileBack?.addEventListener("click", closeAboutModal);
aboutModal?.addEventListener("click", (event) => {
  if (!event.target.closest(".modal-container")) closeAboutModal();
});
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (aboutModal?.classList.contains("show")) {
    closeAboutModal();
    return;
  }
  closeMobileMenuIfOpen();
});
window.addEventListener("hashchange", () => {
  if (location.hash === "#about") openAboutModal();
  else closeAboutModal();
});
if (location.hash === "#about") openAboutModal();

window.matchMedia("(max-width: 639px)").addEventListener("change", (event) => {
  if (!event.matches) closeMobileMenuIfOpen();
});

window.addEventListener("message", (event) => {
  if (event.data?.type !== "starland-lang") return;
  const next = String(event.data.lang || "").startsWith("zh") ? "zh" : "en";
  const path = location.pathname;
  const onZh = /\/zh\//.test(path);
  const onPrivacy = path.includes("/privacy");
  const onTerms = path.includes("/terms");
  if (!onPrivacy && !onTerms) return;
  if (next === "zh" && !onZh) {
    location.replace(onPrivacy ? "../zh/privacy/" : "../zh/terms/");
  } else if (next === "en" && onZh) {
    location.replace(onPrivacy ? "../../privacy/" : "../../terms/");
  }
});
