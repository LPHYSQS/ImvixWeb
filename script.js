﻿const siteConfig = Object.freeze({
  githubRepo: "https://github.com/LPHYSQS/Imvix",
  mainlandMirror: {
    url: "https://wwaoi.lanzouu.com/b00csz9skj",
    extractionCode: "16vx"
  },
  directDownloads: {
    x64: "https://github.com/LPHYSQS/Imvix/releases/download/v1.3.2/Imvix-v1.3.2-win-x64.zip",
    x86: "https://github.com/LPHYSQS/Imvix/releases/download/v1.3.2/Imvix-v1.3.2-win-x86.zip",
    arm64: "https://github.com/LPHYSQS/Imvix/releases/download/v1.3.2/Imvix-v1.3.2-win-arm64.zip"
  }
});

const downloadLabels = {
  x64: "Windows x64",
  x86: "Windows x86",
  arm64: "Windows ARM64"
};

const toastElement = document.getElementById("toast");
const navToggleButton = document.getElementById("nav-toggle");
const siteNav = document.getElementById("site-nav");
const toastState = { timerId: 0 };

function showToast(message) {
  if (!toastElement) {
    return;
  }

  window.clearTimeout(toastState.timerId);
  toastElement.textContent = message;
  toastElement.classList.add("is-visible");

  toastState.timerId = window.setTimeout(() => {
    toastElement.classList.remove("is-visible");
  }, 2200);
}

async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return true;
  }

  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.setAttribute("readonly", "");
  textArea.style.position = "fixed";
  textArea.style.left = "-9999px";
  document.body.appendChild(textArea);
  textArea.select();

  let copied = false;
  try {
    copied = document.execCommand("copy");
  } finally {
    document.body.removeChild(textArea);
  }

  if (!copied) {
    window.prompt("浏览器未能自动复制，请手动复制提取码：", text);
  }

  return copied;
}

function openDownload(architecture) {
  const link = siteConfig.directDownloads[architecture];
  const label = downloadLabels[architecture] ?? architecture;

  if (!link) {
    showToast(`${label} 下载链接暂不可用。`);
    return;
  }

  showToast(`正在打开 ${label} 下载链接。`);
  window.open(link, "_blank", "noopener,noreferrer");
}

async function openMainlandMirror() {
  const { extractionCode, url } = siteConfig.mainlandMirror;

  try {
    const copied = await copyText(extractionCode);
    showToast(copied ? `提取码 ${extractionCode} 已复制。` : `请手动输入提取码 ${extractionCode}。`);
  } catch (error) {
    showToast(`请手动输入提取码 ${extractionCode}。`);
  }

  window.setTimeout(() => {
    window.open(url, "_blank", "noopener,noreferrer");
  }, 260);
}

function setNavOpen(isOpen) {
  if (!navToggleButton || !siteNav) {
    return;
  }

  navToggleButton.setAttribute("aria-expanded", String(isOpen));
  siteNav.classList.toggle("is-open", isOpen);
}

function setupNav() {
  if (!navToggleButton || !siteNav) {
    return;
  }

  navToggleButton.addEventListener("click", () => {
    const expanded = navToggleButton.getAttribute("aria-expanded") === "true";
    setNavOpen(!expanded);
  });

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      setNavOpen(false);
    });
  });

  document.addEventListener("click", (event) => {
    if (!siteNav.classList.contains("is-open")) {
      return;
    }

    if (siteNav.contains(event.target) || navToggleButton.contains(event.target)) {
      return;
    }

    setNavOpen(false);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 760) {
      setNavOpen(false);
    }
  });
}

function setupActiveNav() {
  const navLinks = Array.from(document.querySelectorAll(".site-nav a"));
  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if (!navLinks.length || !sections.length || !("IntersectionObserver" in window)) {
    return;
  }

  const linkById = new Map(
    navLinks.map((link) => [link.getAttribute("href"), link])
  );

  const observer = new IntersectionObserver((entries) => {
    const visibleEntry = entries
      .filter((entry) => entry.isIntersecting)
      .sort((first, second) => second.intersectionRatio - first.intersectionRatio)[0];

    if (!visibleEntry) {
      return;
    }

    navLinks.forEach((link) => link.classList.remove("is-active"));
    const activeLink = linkById.get(`#${visibleEntry.target.id}`);
    if (activeLink) {
      activeLink.classList.add("is-active");
    }
  }, {
    rootMargin: "-20% 0px -55% 0px",
    threshold: [0.2, 0.45, 0.7]
  });

  sections.forEach((section) => observer.observe(section));
}

function closeMiniStats(exceptStat) {
  document.querySelectorAll("[data-mini-stat]").forEach((stat) => {
    if (stat === exceptStat) {
      return;
    }

    stat.classList.remove("is-open");
    const trigger = stat.querySelector(".mini-stat-trigger");
    if (trigger) {
      trigger.setAttribute("aria-expanded", "false");
    }
  });
}

function setupMiniStats() {
  const stats = Array.from(document.querySelectorAll("[data-mini-stat]"));
  if (!stats.length) {
    return;
  }

  stats.forEach((stat) => {
    const trigger = stat.querySelector(".mini-stat-trigger");
    if (!trigger) {
      return;
    }

    trigger.addEventListener("click", () => {
      const isOpen = stat.classList.contains("is-open");
      closeMiniStats(stat);
      stat.classList.toggle("is-open", !isOpen);
      trigger.setAttribute("aria-expanded", String(!isOpen));
    });
  });

  document.addEventListener("click", (event) => {
    const insideStat = event.target.closest("[data-mini-stat]");
    if (insideStat) {
      return;
    }

    closeMiniStats();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMiniStats();
    }
  });
}

function setupDownloadButtons() {
  document.querySelectorAll("[data-download]").forEach((button) => {
    button.addEventListener("click", () => {
      openDownload(button.getAttribute("data-download"));
    });
  });
}

function setupMirrorButtons() {
  const openMirrorButton = document.getElementById("open-mirror");
  const copyCodeButton = document.getElementById("copy-code");

  if (openMirrorButton) {
    openMirrorButton.addEventListener("click", () => {
      openMainlandMirror();
    });
  }

  if (copyCodeButton) {
    copyCodeButton.addEventListener("click", async () => {
      try {
        const copied = await copyText(siteConfig.mainlandMirror.extractionCode);
        showToast(copied ? "提取码已复制。" : "请手动复制提取码 16vx。");
      } catch (error) {
        showToast("请手动复制提取码 16vx。");
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  setupNav();
  setupActiveNav();
  setupMiniStats();
  setupDownloadButtons();
  setupMirrorButtons();
});
