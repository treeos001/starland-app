const assetBase = document.documentElement.dataset.assetRoot || "./";
const asset = (path) => assetBase + path;
const assetRoot = asset("Assets/Starland/islands/");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const travelOrb = document.querySelector("#travel-orb");
const orbCore = travelOrb.querySelector(".orb-core");
const hero = document.querySelector("#hero");
const heroAnchor = document.querySelector("#hero-orb-anchor");
const heroCopy = document.querySelector("#hero-copy");
const record = document.querySelector("#record");
const recordHeading = document.querySelector("#record-heading");
const phoneOrb = document.querySelector("#phone-orb");
const stickyDownload = document.querySelector("#sticky-download");
const privacy = document.querySelector("#privacy");
const privacyScene = document.querySelector("#scene-privacy");
const recordVideo = document.querySelector("#record-video");

const emotionColors = {
  joy: { r: 255, g: 214, b: 0 },
  warmth: { r: 240, g: 122, b: 148 },
  excitement: { r: 255, g: 107, b: 89 },
  awe: { r: 156, g: 94, b: 240 },
  satisfaction: { r: 227, g: 186, b: 115 },
  calm: { r: 168, g: 200, b: 122 },
  melancholy: { r: 92, g: 153, b: 240 },
  anger: { r: 240, g: 69, b: 69 },
  disgust: { r: 120, g: 156, b: 133 },
  anxiety: { r: 255, g: 153, b: 38 },
};
const emotions = [
  emotionColors.joy,
  emotionColors.warmth,
  emotionColors.excitement,
  emotionColors.awe,
  emotionColors.satisfaction,
  emotionColors.calm,
  emotionColors.melancholy,
  emotionColors.anger,
  emotionColors.disgust,
  emotionColors.anxiety,
];
const emotionCycle = [
  emotionColors.joy,
  emotionColors.satisfaction,
  emotionColors.anxiety,
  emotionColors.excitement,
  emotionColors.warmth,
  emotionColors.anger,
  emotionColors.awe,
  emotionColors.melancholy,
  emotionColors.calm,
  emotionColors.disgust,
];

const clamp = (value, min = 0, max = 1) => Math.min(Math.max(value, min), max);
const mix = (from, to, amount) => from + (to - from) * amount;
const easeOut = (value) => 1 - Math.pow(1 - value, 3);
const easeIn = (value) => value * value * value;

function makeBezier(p1x, p1y, p2x, p2y) {
  const cx = 3 * p1x;
  const bx = 3 * (p2x - p1x) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * p1y;
  const by = 3 * (p2y - p1y) - cy;
  const ay = 1 - cy - by;
  const xAt = (t) => ((ax * t + bx) * t + cx) * t;
  const yAt = (t) => ((ay * t + by) * t + cy) * t;
  const dxAt = (t) => (3 * ax * t + 2 * bx) * t + cx;
  return (x) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 6; i += 1) {
      const d = dxAt(t);
      if (Math.abs(d) < 1e-6) break;
      t = clamp(t - (xAt(t) - x) / d);
    }
    return yAt(t);
  };
}
const easeGather = makeBezier(0.22, 0.82, 0.26, 1);
const gatherStagger = [0, 0.2, 0.33, 0.45];

let lang = "en";
let activeCard;
let currentView = "home";
let recordPlaying = false;
let recordIntroPending = true;
const recordVideos = {
  zh: { src: asset("Assets/Starland/zh.mp4?v=20260911-play-03"), start: 9 },
  en: { src: asset("Assets/Starland/en.mp4?v=20260911-play-03"), start: 12.5 },
};
const showcaseMedia = {
  zh: {
    home: asset("Assets/Starland/showcase/zh-home.mp4?v=20260911-play-03"),
    timeline: asset("Assets/Starland/showcase/zh-timeline.mp4?v=20260911-play-03"),
    island: asset("Assets/Starland/showcase/zh-island.mp4?v=20260911-play-03"),
    emotion: asset("Assets/Starland/showcase/zh-emotion.mp4?v=20260911-play-03"),
  },
  en: {
    home: asset("Assets/Starland/showcase/en-home.mp4?v=20260911-play-03"),
    timeline: asset("Assets/Starland/showcase/en-timeline.mp4?v=20260911-play-03"),
    island: asset("Assets/Starland/showcase/en-island.mp4?v=20260911-play-03"),
    emotion: asset("Assets/Starland/showcase/en-emotion.mp4?v=20260911-play-03"),
  },
};

const showcaseTabs = ["home", "timeline", "island", "emotion"];
const showcasePhone = document.querySelector("#showcase-phone");
const showcaseVideo = document.querySelector("#showcase-video");
let resumeTimer;
let showcaseVisible = false;

const LANG_KEY = "starland-lang";

function isZhPath() {
  const path = location.pathname.replace(/\/index\.html$/, "").replace(/\/$/, "") || "/";
  return path === "/zh" || path.endsWith("/zh");
}

function detectLang() {
  if (isZhPath()) return "zh";
  try {
    if (window.parent && window.parent !== window) {
      const parentLang = window.parent.document.documentElement.lang || "";
      if (parentLang.startsWith("zh")) return "zh";
      if (parentLang.startsWith("en")) return "en";
    }
  } catch (_) {}
  return "en";
}

function applyLang(nextLang) {
  lang = nextLang.startsWith("zh") ? "zh" : "en";
  document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
  try { localStorage.setItem(LANG_KEY, lang); } catch (_) {}
  const currentLangText = document.querySelector("#currentLang");
  if (currentLangText) currentLangText.textContent = lang === "zh" ? "中" : "En";
  const titleEl = document.querySelector("title");
  const descEl = document.querySelector('meta[name="description"]');
  const title = (lang === "zh" ? titleEl?.dataset.zh : titleEl?.dataset.en) || document.title;
  const description = (lang === "zh" ? descEl?.dataset.zh : descEl?.dataset.en) || "";
  document.title = title;
  descEl?.setAttribute("content", description);
  document.querySelector('meta[property="og:title"]')?.setAttribute("content", title);
  document.querySelector('meta[property="og:description"]')?.setAttribute("content", description);
  document.querySelector('meta[name="twitter:title"]')?.setAttribute("content", title);
  document.querySelector('meta[name="twitter:description"]')?.setAttribute("content", description);
  document.querySelector('meta[property="og:locale"]')?.setAttribute("content", lang === "zh" ? "zh_CN" : "en_US");
  document.querySelectorAll(".localize").forEach((el) => {
    const copy = lang === "zh" ? el.dataset.zh : el.dataset.en;
    if (copy) el.innerHTML = copy;
  });
  document.querySelectorAll("[data-aria-en]").forEach((el) => {
    el.setAttribute("aria-label", lang === "zh" ? el.dataset.ariaZh : el.dataset.ariaEn);
  });
  document.querySelectorAll(".trial-link").forEach((el) => {
    el.href = lang === "zh" ? el.dataset.hrefZh : el.dataset.hrefEn;
  });
  document.querySelectorAll(".island-card").forEach((card) => {
    card.querySelector("img").alt = lang === "zh" ? card.dataset.nameZh : card.dataset.nameEn;
  });
  document.querySelectorAll(".mobile-lang a").forEach((el) => {
    el.classList.toggle("is-active", el.dataset.lang === lang);
  });
  if (activeCard) fillIslandCopy(activeCard);
  else {
    const defaultCard = document.querySelector(".island-card.is-default");
    if (defaultCard) fillIslandCopy(defaultCard);
  }
  syncRecordVideo();
  if (showcaseVisible) paintView(currentView, true);
  else if (showcaseVideo) showcaseVideo.poster = showcasePoster();
  updateOrbJourney();
}

window.addEventListener("message", (event) => {
  if (event.data?.type === "starland-lang") applyLang(event.data.lang);
});

if (window.parent !== window) {
  document.documentElement.classList.add("is-embedded");
}

function emotionAt(time) {
  const hold = 3200;
  const fade = 1500;
  const cycle = emotions.length * (hold + fade);
  const local = time % cycle;
  const index = Math.floor(local / (hold + fade));
  const next = (index + 1) % emotions.length;
  const t = clamp((local - hold) / fade);
  const from = emotions[index];
  const to = emotions[next];
  return {
    r: mix(from.r, to.r, t),
    g: mix(from.g, to.g, t),
    b: mix(from.b, to.b, t),
  };
}

function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return { h: h / 6, s, l };
}

function hslToRgb(h, s, l) {
  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  if (s === 0) return { r: l * 255, g: l * 255, b: l * 255 };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return {
    r: hue2rgb(p, q, h + 1 / 3) * 255,
    g: hue2rgb(p, q, h) * 255,
    b: hue2rgb(p, q, h - 1 / 3) * 255,
  };
}

function mixColor(from, to, amount) {
  const a = rgbToHsl(from.r, from.g, from.b);
  const b = rgbToHsl(to.r, to.g, to.b);
  let dh = b.h - a.h;
  if (dh > 0.5) dh -= 1;
  if (dh < -0.5) dh += 1;
  return hslToRgb(((a.h + dh * amount) % 1 + 1) % 1, mix(a.s, b.s, amount), mix(a.l, b.l, amount));
}

function landingOrbColor() {
  return lang === "zh" ? emotionColors.warmth : emotionColors.calm;
}

function colorAlongCycle(distance) {
  const count = emotionCycle.length;
  const pos = ((distance % count) + count) % count;
  const index = Math.floor(pos);
  return mixColor(emotionCycle[index], emotionCycle[(index + 1) % count], pos - index);
}

function flightOrbColor(flight) {
  const settleAt = 0.62;
  const holdAt = 0.84;
  const loops = 2.2;
  if (flight >= holdAt) return landingOrbColor();
  const cycling = colorAlongCycle((Math.min(flight, settleAt) / settleAt) * emotionCycle.length * loops);
  if (flight < settleAt) return cycling;
  return mixColor(cycling, landingOrbColor(), easeOut((flight - settleAt) / (holdAt - settleAt)));
}

function paintTravelOrb(color) {
  if (!color) {
    orbCore.style.removeProperty("--orb-color");
    return;
  }
  orbCore.style.setProperty("--orb-color", `${Math.round(color.r)}, ${Math.round(color.g)}, ${Math.round(color.b)}`);
}

function updateMoodColors(time) {
  const current = emotionAt(time);
  const haze = { r: 228, g: 227, b: 240 };
  const card = {
    r: Math.round(mix(current.r, haze.r, 0.72)),
    g: Math.round(mix(current.g, haze.g, 0.72)),
    b: Math.round(mix(current.b, haze.b, 0.72)),
  };
  stickyDownload.style.backgroundColor = `rgb(${card.r}, ${card.g}, ${card.b})`;
}

function updateOrbJourney() {
  const heroHeight = hero.offsetHeight;
  if (!heroHeight) {
    requestAnimationFrame(updateOrbJourney);
    return;
  }
  const start = heroHeight * 0.1;
  const end = heroHeight * 0.96;
  const progress = clamp((window.scrollY - start) / (end - start));
  const source = heroAnchor.getBoundingClientRect();
  const target = phoneOrb.getBoundingClientRect();
  const sourceX = source.left + source.width / 2;
  const sourceY = source.top + source.height / 2;
  const targetX = target.left + target.width / 2;
  const targetY = target.top + target.height / 2;
  const launchEnd = 0.26;
  const compressEnd = 0.12;
  const flight = clamp((progress - launchEnd) / (1 - launchEnd));
  const arrival = clamp((flight - 0.84) / 0.16);
  let x = sourceX;
  let y = sourceY;
  let scale = 1;

  if (progress < compressEnd) {
    const compress = easeOut(progress / compressEnd);
    scale = mix(1, 0.9, compress);
    y = sourceY + mix(0, 9, compress);
  } else if (progress < launchEnd) {
    const rebound = easeOut((progress - compressEnd) / (launchEnd - compressEnd));
    scale = mix(0.9, 1.04, rebound);
    y = sourceY + mix(9, -12, rebound);
  } else {
    const journey = easeOut(flight);
    x = mix(sourceX, targetX, journey);
    y = mix(sourceY - 12, targetY, journey);
    scale = mix(1.04, Math.max(target.width / source.width, 0.16), journey);
  }

  travelOrb.classList.toggle("is-visible", progress < 0.995 && !reducedMotion.matches);
  travelOrb.classList.toggle("is-scrolling", progress > 0.02);
  travelOrb.style.opacity = progress < 0.995 && !reducedMotion.matches ? "1" : "0";
  travelOrb.style.transform = `translate3d(${x - source.width / 2}px, ${y - source.height / 2}px, 0) scale(${scale})`;
  phoneOrb.style.opacity = "0";
  paintTravelOrb(progress > 0.02 ? flightOrbColor(flight) : undefined);

  const pieces = [...heroCopy.children];
  pieces.forEach((node, index) => {
    const exit = clamp((progress - 0.34 - index * 0.04) / 0.3);
    node.style.opacity = String(1 - exit);
    node.style.transform = `translateY(${mix(0, -18, exit)}px)`;
  });

  recordHeading.classList.toggle("is-visible", progress > 0.55 || reducedMotion.matches);

  if (progress < 0.42) resetRecordIntro();
  else if (progress > 0.62) startRecordVideo();

  const downloadRect = document.querySelector("#download").getBoundingClientRect();
  const stickyReady = progress > 0.55 && downloadRect.top > window.innerHeight * 0.42;
  stickyDownload.classList.toggle("is-visible", stickyReady);
}

function updateBackgroundJourney() {
  const rect = privacy.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  const active = rect.top < viewportHeight * 0.58 && rect.bottom > viewportHeight * 0.42;
  privacyScene.classList.toggle("is-active", active);
}

let ticking = false;
function onScroll() {
  if (ticking) return;
  ticking = true;
  window.requestAnimationFrame(() => {
    updateOrbJourney();
    updateBackgroundJourney();
    updateIslandGather();
    ticking = false;
  });
}
window.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("resize", () => {
  updateOrbJourney();
  updateBackgroundJourney();
  updateIslandGather();
  if (isIslandCarousel() && activeCard) centerIslandCard(activeCard, false);
});

function moodLoop(now) {
  updateMoodColors(now);
  window.requestAnimationFrame(moodLoop);
}
window.requestAnimationFrame(moodLoop);

function recordClip() {
  return recordVideos[lang] || recordVideos.en;
}

function recordPoster() {
  return lang === "zh"
    ? asset("Assets/Starland/record-poster-zh.jpg?v=20260911-play-03")
    : asset("Assets/Starland/record-poster-en.jpg?v=20260911-play-03");
}

function showcasePoster() {
  return lang === "zh"
    ? asset("Assets/Starland/showcase-poster-zh.jpg?v=20260911-play-03")
    : asset("Assets/Starland/showcase-poster-en.jpg?v=20260911-play-03");
}

function armVideo(video) {
  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  video.setAttribute("playsinline", "");
  video.setAttribute("webkit-playsinline", "");
  video.setAttribute("muted", "");
  video.autoplay = true;
}

function playVideo(video) {
  armVideo(video);
  const play = video.play();
  if (play && typeof play.catch === "function") play.catch(() => {});
}

function playVideoAt(video, start) {
  const kick = () => playVideo(video);
  const run = () => {
    if (start > 0 && Math.abs(video.currentTime - start) > 0.35) {
      video.addEventListener("seeked", kick, { once: true });
      video.currentTime = start;
      window.setTimeout(() => {
        if (video.paused) kick();
      }, 500);
      return;
    }
    kick();
  };
  if (video.readyState >= 1) run();
  else video.addEventListener("loadedmetadata", run, { once: true });
}

function syncRecordVideo() {
  const clip = recordClip();
  armVideo(recordVideo);
  recordVideo.poster = recordPoster();
  if (recordVideo.getAttribute("src") !== clip.src) {
    recordVideo.src = clip.src;
  }
  if (recordPlaying) playVideoAt(recordVideo, recordIntroPending ? clip.start : 0);
}

function resetRecordIntro() {
  if (recordIntroPending && !recordPlaying) return;
  recordPlaying = false;
  recordIntroPending = true;
  recordVideo.loop = false;
  recordVideo.pause();
}

function startRecordVideo() {
  if (recordPlaying) {
    if (recordVideo.paused) playVideo(recordVideo);
    return;
  }
  recordPlaying = true;
  const clip = recordClip();
  armVideo(recordVideo);
  recordVideo.poster = recordPoster();
  if (recordVideo.getAttribute("src") !== clip.src) recordVideo.src = clip.src;
  recordVideo.loop = false;
  playVideoAt(recordVideo, recordIntroPending ? clip.start : 0);
}

recordVideo.addEventListener("ended", () => {
  if (!recordPlaying) return;
  recordIntroPending = false;
  recordVideo.loop = true;
  playVideo(recordVideo);
});

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible" && recordPlaying && recordVideo.paused) {
    playVideo(recordVideo);
  }
});

new IntersectionObserver((entries) => {
  if (entries.some((entry) => entry.isIntersecting)) startRecordVideo();
  else resetRecordIntro();
}, { threshold: 0.2, rootMargin: "0px 0px 15% 0px" }).observe(document.querySelector("#phone-wrap"));

document.addEventListener("pointerdown", () => {
  if (recordVideo.paused) startRecordVideo();
  if (showcaseVideo.paused) tryPlayShowcase();
}, { passive: true });

const stageImagePath = (slug, stage) => `${assetRoot}island_${slug}_stage_${stage}.imageset/${slug}_stage_${stage}.png`;
const rail = document.querySelector("#island-rail");
const islandRailViewport = document.querySelector("#island-rail-viewport");
const islandCopy = document.querySelector("#island-copy");
const islandCarouselQuery = window.matchMedia("(max-width: 767px)");
let morphDelay;
let morphInterval;
let copyTimer;
let copyToken = 0;
let carouselProgrammatic = false;
let carouselReady = false;
let carouselTick = false;

function isIslandCarousel() {
  return islandCarouselQuery.matches;
}

function siblingCard(card, direction) {
  const slot = card.parentElement;
  const sibling = direction === "prev" ? slot.previousElementSibling : slot.nextElementSibling;
  return sibling?.querySelector(".island-card");
}

function layoutIslandRail() {
  const cards = [...rail.querySelectorAll(".island-card")];
  cards.forEach((card) => card.classList.remove("is-leftmost", "is-rightmost"));
  cards[0]?.classList.add("is-leftmost");
  cards[cards.length - 1]?.classList.add("is-rightmost");
}

function islandGatherProgress() {
  const rect = rail.getBoundingClientRect();
  const viewHeight = window.innerHeight;
  const start = viewHeight * 0.76;
  const end = viewHeight * 0.42;
  return clamp((start - rect.top) / Math.max(start - end, 1));
}

function nearestIslandCard() {
  const viewRect = islandRailViewport.getBoundingClientRect();
  const center = viewRect.left + viewRect.width / 2;
  let best;
  let bestDist = Infinity;
  rail.querySelectorAll(".island-card").forEach((card) => {
    const rect = card.closest(".island-slot").getBoundingClientRect();
    const dist = Math.abs(rect.left + rect.width / 2 - center);
    if (dist < bestDist) {
      bestDist = dist;
      best = card;
    }
  });
  return best;
}

function centerIslandCard(card, smooth) {
  if (!card || !isIslandCarousel()) return;
  const slot = card.closest(".island-slot");
  const viewRect = islandRailViewport.getBoundingClientRect();
  const slotRect = slot.getBoundingClientRect();
  const delta = slotRect.left + slotRect.width / 2 - (viewRect.left + viewRect.width / 2);
  carouselProgrammatic = true;
  islandRailViewport.style.scrollSnapType = "none";
  islandRailViewport.scrollTo({
    left: islandRailViewport.scrollLeft + delta,
    behavior: smooth ? "smooth" : "auto",
  });
  window.setTimeout(() => {
    const restView = islandRailViewport.getBoundingClientRect();
    const restSlot = slot.getBoundingClientRect();
    const remain = restSlot.left + restSlot.width / 2 - (restView.left + restView.width / 2);
    if (Math.abs(remain) > 1) islandRailViewport.scrollLeft += remain;
    islandRailViewport.style.scrollSnapType = "";
    carouselProgrammatic = false;
  }, smooth ? 480 : 60);
}

function setupIslandCarousel(forceCenter = false) {
  if (!isIslandCarousel()) return;
  const card = activeCard || document.querySelector(".island-card.is-default");
  if (card) activateCard(card);
  if (forceCenter || !carouselReady) centerIslandCard(card, false);
  carouselReady = true;
}

function syncIslandCarouselMode() {
  carouselReady = false;
  if (isIslandCarousel()) {
    updateIslandGather();
    setupIslandCarousel();
    return;
  }
  islandRailViewport.scrollLeft = 0;
  if (activeCard) clearCardState();
  updateIslandGather();
}

function updateIslandGather() {
  const slots = [...rail.querySelectorAll(".island-slot")];
  if (reducedMotion.matches || isIslandCarousel()) {
    slots.forEach((slot) => { slot.style.transform = ""; });
    rail.classList.add("is-gathered");
    document.documentElement.classList.add("is-islands-ready");
    return;
  }

  const progress = islandGatherProgress();
  const duration = 1 - gatherStagger[gatherStagger.length - 1];
  const railLeft = rail.getBoundingClientRect().left;
  const viewWidth = window.innerWidth;
  const edgePad = Math.max(48, viewWidth * 0.05);

  slots.forEach((slot, index) => {
    const restLeft = railLeft + slot.offsetLeft;
    const fromCenter = index < 4 ? 3 - index : index - 4;
    const extra = fromCenter * slot.offsetWidth * 1.35;
    const originX = index < 4
      ? -edgePad - extra - slot.offsetWidth
      : viewWidth + edgePad + extra;
    const local = clamp((progress - gatherStagger[fromCenter]) / duration);
    const x = (originX - restLeft) * (1 - easeGather(local));
    slot.style.transform = Math.abs(x) < 0.4 ? "" : `translate3d(${x}px, 0, 0)`;
  });

  const gathered = progress >= 0.92;
  rail.classList.toggle("is-gathered", gathered);
  if (!gathered && activeCard) clearCardState();
  document.documentElement.classList.add("is-islands-ready");
}

layoutIslandRail();

function clearMorph() {
  window.clearTimeout(morphDelay);
  window.clearInterval(morphInterval);
  morphDelay = undefined;
  morphInterval = undefined;
}

function resetCardVisual(card) {
  const image = card.querySelector("img");
  image.src = stageImagePath(card.dataset.slug, 1);
  image.style.opacity = "1";
}

function fillIslandCopy(card) {
  islandCopy.querySelector(".island-name").textContent = lang === "zh" ? card.dataset.nameZh : card.dataset.nameEn;
  islandCopy.querySelector(".island-description").textContent = lang === "zh" ? card.dataset.descriptionZh : card.dataset.descriptionEn;
}

function revealIslandCopy(card) {
  window.clearTimeout(copyTimer);
  const token = ++copyToken;
  const name = lang === "zh" ? card.dataset.nameZh : card.dataset.nameEn;
  const description = lang === "zh" ? card.dataset.descriptionZh : card.dataset.descriptionEn;
  const show = () => {
    if (token !== copyToken) return;
    islandCopy.querySelector(".island-name").textContent = name;
    islandCopy.querySelector(".island-description").textContent = description;
    void islandCopy.offsetWidth;
    islandCopy.classList.add("is-visible");
  };
  if (islandCopy.classList.contains("is-visible")) {
    islandCopy.classList.remove("is-visible");
    copyTimer = window.setTimeout(show, reducedMotion.matches ? 0 : 340);
    return;
  }
  show();
}

function hideIslandCopy() {
  window.clearTimeout(copyTimer);
  copyToken += 1;
  islandCopy.classList.remove("is-visible");
}

function clearCardState() {
  rail.querySelectorAll(".island-card").forEach((card) => {
    card.classList.remove("is-active", "neighbor-left", "neighbor-right");
    resetCardVisual(card);
  });
  hideIslandCopy();
  clearMorph();
  activeCard = undefined;
}

function setNeighbors(card) {
  rail.querySelectorAll(".island-card").forEach((item) => item.classList.remove("is-active", "neighbor-left", "neighbor-right"));
  card.classList.add("is-active");
  siblingCard(card, "prev")?.classList.add("neighbor-left");
  siblingCard(card, "next")?.classList.add("neighbor-right");
}

function startMorph(card) {
  if (reducedMotion.matches) return;
  let stage = 1;
  const image = card.querySelector("img");
  morphInterval = window.setInterval(() => {
    if (activeCard !== card) return;
    stage = stage === 4 ? 1 : stage + 1;
    image.style.opacity = "0";
    window.setTimeout(() => {
      if (activeCard !== card) return;
      image.src = stageImagePath(card.dataset.slug, stage);
      image.style.opacity = "1";
    }, 180);
  }, 1000);
}

function activateCard(card, shouldMorph = true, instantCopy = false) {
  if (activeCard === card) return;
  clearMorph();
  setNeighbors(card);
  if (instantCopy) {
    window.clearTimeout(copyTimer);
    copyToken += 1;
    fillIslandCopy(card);
    islandCopy.classList.add("is-visible");
  } else {
    revealIslandCopy(card);
  }
  activeCard = card;
  if (!shouldMorph) return;
  morphDelay = window.setTimeout(() => startMorph(card), 520);
}

function syncCarouselSelection() {
  if (!isIslandCarousel() || carouselProgrammatic) return;
  const card = nearestIslandCard();
  if (card) activateCard(card, true, true);
}

islandRailViewport.addEventListener("scroll", () => {
  if (!isIslandCarousel() || carouselTick) return;
  carouselTick = true;
  window.requestAnimationFrame(() => {
    carouselTick = false;
    syncCarouselSelection();
  });
}, { passive: true });

islandCarouselQuery.addEventListener("change", syncIslandCarouselMode);

rail.querySelectorAll(".island-card").forEach((card) => {
  card.addEventListener("pointerenter", (event) => {
    if (event.pointerType !== "touch") activateCard(card);
  });
  card.addEventListener("pointerleave", (event) => {
    if (event.pointerType === "touch") return;
    if (isIslandCarousel()) return;
    const next = event.relatedTarget?.closest?.(".island-card");
    if (next && rail.contains(next)) return;
    if (activeCard === card) clearCardState();
  });
  card.addEventListener("click", () => {
    if (isIslandCarousel()) {
      if (activeCard !== card) {
        centerIslandCard(card, true);
        activateCard(card);
      }
      return;
    }
    if (activeCard === card) clearCardState();
    else activateCard(card);
  });
});

const islandPreloadObserver = new IntersectionObserver((entries, observer) => {
  if (!entries.some((entry) => entry.isIntersecting)) return;
  rail.querySelectorAll(".island-card").forEach((card) => {
    [2, 3, 4].forEach((stage) => {
      const preload = new Image();
      preload.src = stageImagePath(card.dataset.slug, stage);
    });
  });
  observer.disconnect();
}, { rootMargin: "600px" });
islandPreloadObserver.observe(document.querySelector("#islands"));

function showcaseSrc(view) {
  return (showcaseMedia[lang] || showcaseMedia.zh)[view];
}

function tryPlayShowcase() {
  if (reducedMotion.matches || !showcaseVisible) {
    showcaseVideo.pause();
    return;
  }
  playVideo(showcaseVideo);
}

function paintView(view, force = false) {
  if (!showcaseVideo) return;
  const src = showcaseSrc(view);
  armVideo(showcaseVideo);
  showcaseVideo.poster = showcasePoster();
  if (force || showcaseVideo.dataset.lang !== lang || showcaseVideo.getAttribute("src") !== src) {
    showcaseVideo.dataset.lang = lang;
    showcaseVideo.src = src;
  }
  tryPlayShowcase();
  document.querySelectorAll(".showcase-tabs button").forEach((button) => {
    button.setAttribute("aria-selected", String(button.dataset.view === view));
  });
}

function setView(view, userInitiated = false) {
  currentView = view;
  showcaseVideo.loop = userInitiated;
  showcasePhone.classList.add("is-changing");
  window.setTimeout(() => {
    paintView(view);
    showcasePhone.classList.remove("is-changing");
  }, 180);
  window.clearTimeout(resumeTimer);
  if (userInitiated) {
    resumeTimer = window.setTimeout(() => {
      showcaseVideo.loop = false;
    }, 8000);
  }
}

showcaseVideo.addEventListener("ended", () => {
  if (showcaseVideo.loop || reducedMotion.matches) return;
  const index = Math.max(0, showcaseTabs.indexOf(currentView));
  setView(showcaseTabs[(index + 1) % showcaseTabs.length]);
});

document.querySelectorAll(".showcase-tabs button").forEach((button) => {
  button.addEventListener("click", () => setView(button.dataset.view, true));
});
new IntersectionObserver((entries) => {
  showcaseVisible = entries.some((entry) => entry.isIntersecting);
  if (showcaseVisible) paintView(currentView);
  else showcaseVideo.pause();
}, { threshold: 0.12, rootMargin: "50% 0px" }).observe(showcasePhone);

const langTrigger = document.querySelector("#langTrigger");
const langSelector = document.querySelector(".lang-selector");
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
applyLang(detectLang());

const navbar = document.querySelector(".navbar");
const burgerToggle = document.querySelector("#burgerToggle");
const mobileMenu = document.querySelector("#mobileMenu");

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

const aboutModal = document.querySelector("#aboutModal");
const aboutModalOpen = document.querySelector("#aboutModalOpen");
const aboutModalClose = document.querySelector("#aboutModalClose");
const aboutMobileBack = document.querySelector("#aboutMobileBack");

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

if (aboutModalOpen) {
  aboutModalOpen.addEventListener("click", (event) => {
    event.preventDefault();
    openAboutModal();
  });
}
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

window.matchMedia("(max-width: 767px)").addEventListener("change", (event) => {
  if (!event.matches) closeMobileMenuIfOpen();
});

document.querySelector("#year").textContent = new Date().getFullYear();

function initMotion() {
  updateOrbJourney();
  updateBackgroundJourney();
  updateIslandGather();
  setupIslandCarousel();
}

initMotion();
requestAnimationFrame(() => requestAnimationFrame(() => setupIslandCarousel(true)));
if (document.readyState === "complete") {
  initMotion();
  setupIslandCarousel(true);
} else {
  window.addEventListener("load", () => {
    initMotion();
    setupIslandCarousel(true);
  });
}
new IntersectionObserver((entries) => {
  if (entries.some((entry) => entry.isIntersecting)) initMotion();
}).observe(hero);
