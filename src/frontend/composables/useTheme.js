import { ref, onMounted } from "vue";

const STORAGE_KEY = "theme_preference";
const themeChangeCallbacks = [];

const currentTheme = ref("auto");

// 跟隨系統明暗偏好:瀏覽器/系統為暗色時返回 dark,否則返回 light
const getSystemTheme = () => {
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return "dark";
};

const resolveTheme = (theme) => {
  if (theme === "auto") {
    return getSystemTheme();
  }
  return theme;
};

const applyTheme = (theme) => {
  const resolved = resolveTheme(theme);
  document.body.classList.remove("dark", "light");
  if (resolved !== "dark") {
    document.body.classList.add(resolved);
  }
  themeChangeCallbacks.forEach((cb) => cb(resolved));
};

// 模塊級媒體查詢監聽器:僅註冊一次,系統明暗變化且處於 auto 模式時即時切換
let systemThemeMediaQuery = null;
let systemThemeListener = null;
const ensureSystemThemeListener = () => {
  if (
    systemThemeMediaQuery ||
    typeof window === "undefined" ||
    !window.matchMedia
  ) {
    return;
  }
  systemThemeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  systemThemeListener = () => {
    if (currentTheme.value === "auto") {
      applyTheme("auto");
    }
  };
  // 兼容舊版 Safari:addListener 已廢棄但部分瀏覽器仍需
  if (systemThemeMediaQuery.addEventListener) {
    systemThemeMediaQuery.addEventListener("change", systemThemeListener);
  } else if (systemThemeMediaQuery.addListener) {
    systemThemeMediaQuery.addListener(systemThemeListener);
  }
};
ensureSystemThemeListener();

export const useTheme = () => {
  const getPreferredTheme = () => {
    return localStorage.getItem(STORAGE_KEY) || "dark";
  };

  const setTheme = (theme) => {
    localStorage.setItem(STORAGE_KEY, theme);
    currentTheme.value = theme;
    applyTheme(theme);
  };

  const toggleTheme = () => {
    const themes = ["dark", "light", "auto"];
    const currentIndex = themes.indexOf(currentTheme.value);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
    return themes[nextIndex];
  };

  const initTheme = () => {
    const saved = getPreferredTheme();
    currentTheme.value = saved;
    applyTheme(saved);
  };

  const onThemeChange = (callback) => {
    themeChangeCallbacks.push(callback);
  };

  onMounted(() => {
    initTheme();
  });

  return {
    currentTheme,
    setTheme,
    getPreferredTheme,
    applyTheme,
    toggleTheme,
    initTheme,
    onThemeChange,
  };
};

export default useTheme;
