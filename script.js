
    // ===== MUST: global state (place near top of script) =====
window.__gogyouState = window.__gogyouState || { user: null, partner: null };
    // ===== Five Elements constants (global safe) =====
window.STEMS = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
window.BRANCHES = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];
window.YEAR_STEM_TO_TIGER_MONTH_STEM = {
  "甲":"丙","己":"丙",
  "乙":"戊","庚":"戊",
  "丙":"庚","辛":"庚",
  "丁":"壬","壬":"壬",
  "戊":"甲","癸":"甲"
};
window.DAY_STEM_TO_HOUR_STEM = {
  "甲":"甲","己":"甲",
  "乙":"丙","庚":"丙",
  "丙":"戊","辛":"戊",
  "丁":"庚","壬":"庚",
  "戊":"壬","癸":"壬"
};
// ===== Day offset (global safe) =====
// まずは固定で動かす（あとで精度を上げたければ再調整する）
window.DAY_OFFSET = window.DAY_OFFSET ?? 49;

window.STEM_TO_ELEM = window.STEM_TO_ELEM || {
  "甲":"木","乙":"木","丙":"火","丁":"火","戊":"土","己":"土","庚":"金","辛":"金","壬":"水","癸":"水",
};
function normalizeDateInput(v){
  const s = (v || "").toString().trim();
  if (!s) return "";
  const m = s.match(/^(\d{4})[\/\.\-](\d{1,2})[\/\.\-](\d{1,2})$/);
  if (m) {
    const Y = m[1];
    const M = String(m[2]).padStart(2,"0");
    const D = String(m[3]).padStart(2,"0");
    return `${Y}-${M}-${D}`;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  return "";
}
function normalizeTimeInput(v){
  let s = (v || "").toString().trim();
  if (!s) return "";
  s = s.replace(/：/g, ":");
  const m = s.match(/^(\d{1,2}):?(\d{2})$/);
  if (!m) return "";
  const hh = String(m[1]).padStart(2,"0");
  const mm = String(m[2]).padStart(2,"0");
  return `${hh}:${mm}`;
}
function hasBirthInput(){
  const uDate = normalizeDateInput(document.getElementById("userBirthdate")?.value);
  return !!uDate;
}
function getSelectedTheme(){
  const el = document.querySelector('input[name="theme"]:checked');
  return el ? el.value : "";
}

    const VERSION = "2026.03.01.1";
   
    window.CARDS_BASE = "/public/cards/"; // ←あなたの実際のベースパスに合わせる
      window.__shareOneLine = "";
    const CARDS_BASE = window.CARDS_BASE;
    
    function showToast(message, duration = 3000) {
  const container = document.getElementById("toastContainer");
  if (!container) return;
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = message;
  container.appendChild(el);
  void el.offsetWidth;
  el.classList.add("show");
  setTimeout(() => {
    el.classList.remove("show");
    el.addEventListener("transitionend", () => {
      if (el.parentNode) el.parentNode.removeChild(el);
    });
  }, duration);
}
    document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("btnDraw");
  if (btn && !btn.dataset.bound) {
    btn.dataset.bound = "1";
    btn.addEventListener("click", onDraw);
  }
});
    function isProbablyMobile() {
  // なるべく安全に「スマホっぽさ」判定
  const ua = navigator.userAgent || "";
  const touch = navigator.maxTouchPoints > 1;
  const coarse = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
  return /iPhone|Android|iPad|Mobile/i.test(ua) || (touch && coarse);
}
    function getCurrentDrawModeValue() {
      return document.querySelector('input[name="drawMode"]:checked')?.value || "1";
    }
    function updateDrawButtonLabels() {
      const btn = document.getElementById("btnDraw");
      if (btn) btn.textContent = "カードを引く";
    }
    function bindDrawModeLabelSync() {
      document.querySelectorAll('input[name="drawMode"]').forEach(r => {
        r.addEventListener("change", () => {
          if (r.checked) updateDrawButtonLabels();
        });
      });
    }
    function getYesNo(cardName, isReversed) {
      const neutralCards = [
        "節制", "月", "吊るされた男", "隠者"
      ];
      if (neutralCards.includes(cardName)) return "保留";
      return isReversed ? "NO" : "YES";
    }
    function deriveThemeLabel(primaryCard, hasPartnerDate) {
      const pickedTheme = getSelectedTheme();
      if (pickedTheme) return pickedTheme;
      if (hasPartnerDate) return "恋愛";
      // 既存の isMoneyTheme を使う（存在する前提。無ければ金運判定はスキップ）
      try {
        if (typeof isMoneyTheme === "function" && isMoneyTheme(primaryCard?.themes, primaryCard?.name_ja || primaryCard?.name)) {
          return "金運";
        }
      } catch (_) { }
      return "仕事";
    }
    document.addEventListener("DOMContentLoaded", () => {
      const badge = document.getElementById("versionBadge");
      if (badge) badge.textContent = "VERSION: " + VERSION;
    });
    function scrollToResultSmooth() {
  const target =
    document.querySelector("#result .globalSummary") ||
    document.getElementById("result");
  if (!target) return;
  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) {
    const top = target.getBoundingClientRect().top + window.pageYOffset - 12;
    window.scrollTo(0, top);
    return;
  }
  const startY = window.pageYOffset;
  const targetY = target.getBoundingClientRect().top + window.pageYOffset - 12;
  const duration = 1200;
  const startT = performance.now();
  const easeInOut = (t) => (t < 0.5)
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
  function tick(now) {
    const p = Math.min(1, (now - startT) / duration);
    const y = startY + (targetY - startY) * easeInOut(p);
    window.scrollTo(0, y);
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(() => requestAnimationFrame((t) => tick(t)));
}
    function scrollToDrawStart() {
  const target = document.getElementById("drawStart");
  if (!target) return;
  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const top = target.getBoundingClientRect().top + window.pageYOffset - 12;
  if (reduce) {
    window.scrollTo(0, top);
    return;
  }
  window.scrollTo({
    top,
    behavior: "smooth"
  });
}    const STORAGE_KEY = "angelique_tarot_csv_rows_v2";
    let cards = [];
    const IS_CREATOR = location.hostname === "localhost" || location.hostname === "127.0.0.1";
    function triggerResultAppear(){
  const result = document.getElementById("result");
  if (!result) return;
  // いったんリセットして、毎回ちゃんと発火させる
  result.classList.remove("resultAppear");
  void result.offsetWidth;
  result.classList.add("resultAppear");
  // 押下時だけデッキも少し強く光らせたいなら（任意）
  const sa = document.getElementById("shuffleArea");
  if (sa){
    sa.classList.add("pulse");
    setTimeout(() => sa.classList.remove("pulse"), 1600);
  }
}
    function applyCreatorMode() {
      const creator = document.getElementById("creatorOnly");
      const csvArea = document.getElementById("csvArea");
      if (!IS_CREATOR) {
        if (creator) creator.style.display = "none";
        if (csvArea) csvArea.style.display = "none"; // ★ CSV UI全体を隠す
      }
    }
    const CSV_PATH = new URL("public/data/deck.csv", location.href).toString();
    function guessDelimiterFromText(text) {
      const firstLine = (text || "").split(/\r?\n/)[0] || "";
      const tabCount = (firstLine.match(/\t/g) || []).length;
      const commaCount = (firstLine.match(/,/g) || []).length;
      // タブの方が多ければTSV、それ以外はCSV
      return tabCount > commaCount ? "\t" : ",";
    }
    async function loadBundledCsv() {
      console.log("loadBundledCsv called");
      setStatus("同梱CSVを読み込み中...");
      console.log("CSV_PATH =", CSV_PATH);
      try {
        const res = await fetch(CSV_PATH, { cache: "no-store" });
        if (!res.ok) throw new Error(`fetch failed: ${res.status} ${res.statusText}`);
        const text = await res.text();
        const delim = guessDelimiterFromText(text);
        console.log("guessed delimiter =", JSON.stringify(delim));
        const results = Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          delimiter: delim
        });
        // ===== Column1〜 行を自動スキップする =====
        if (results.meta?.fields?.[0]?.toLowerCase() === "column1") {
          console.log("Dummy header detected. Re-parsing CSV...");
          results.data.shift();              // ダミー行を捨てる
        }
        // ========================================
        console.log("Papa meta.fields:", results.meta?.fields);
        console.log("First row sample:", results.data?.[0]);
        const rows = (results.data || [])
          .map(normalizeRow)
          .filter(r => r && r.id);
        console.log("normalized rows:", rows.length, rows[0]);
        if (!rows.length) {
          setStatus("同梱CSVの読み込みはできたが、id が取れません（ヘッダー名/区切りの可能性）。");
          return;
        }
        if (!validateCards(rows)) {
          setStatus("同梱CSVの必須列（id,name_ja,name_en,image）が不足しています。");
          return;
        }
        cards = rows;
setDeckInfo();
setStatus("");
showReady();
} catch (e) {
  console.error(e);
  setStatus("同梱CSVの読み込みに失敗しました（Console参照）。");
  showToast("同梱CSVの読み込みに失敗しました。Consoleを確認してください。", 5000);
}
}
// ===== SAFE: Branch hidden stems (global) =====
window.BRANCH_HIDDEN = window.BRANCH_HIDDEN || {
  "子":[["癸",1.00]],
  "丑":[["己",0.60],["癸",0.30],["辛",0.10]],
  "寅":[["甲",0.60],["丙",0.25],["戊",0.15]],
  "卯":[["乙",1.00]],
  "辰":[["戊",0.60],["乙",0.25],["癸",0.15]],
  "巳":[["丙",0.60],["庚",0.25],["戊",0.15]],
  "午":[["丁",0.70],["己",0.30]],
  "未":[["己",0.60],["丁",0.25],["乙",0.15]],
  "申":[["庚",0.60],["壬",0.25],["戊",0.15]],
  "酉":[["辛",1.00]],
  "戌":[["戊",0.60],["辛",0.25],["丁",0.15]],
  "亥":[["壬",0.70],["甲",0.30]],
};
// ===== SAFE: hour helpers (global) =====
window.hourBranchFromTime = window.hourBranchFromTime || function(timeStr){
  if (!timeStr) return null;
  const s = String(timeStr).trim();
  if (!s) return null;
  const m = s.match(/^(\d{1,2}):?(\d{2})$/);
  if (!m) return null;
  const hh = parseInt(m[1], 10);
  if (!Number.isFinite(hh)) return null;
  const BRANCHES = window.BRANCHES || ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];
  // 子=23-0, 丑=1-2 ... の2時間刷み（23:00-00:59 が子）
  const idx = Math.floor(((hh + 1) % 24) / 2);
  return BRANCHES[idx];
};
window.hourStemFromDayStem = window.hourStemFromDayStem || function(dayStem, hourBranch){
  if (!dayStem || !hourBranch) return null;
  const STEMS = window.STEMS || ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
  const BRANCHES = window.BRANCHES || ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];
  // 五鼠遁：子時の時干
  const startMap = {
    "甲":"甲","己":"甲",
    "乙":"丙","庚":"丙",
    "丙":"戊","辛":"戊",
    "丁":"庚","壬":"庚",
    "戊":"壬","癸":"壬",
  };
  const startStem = startMap[dayStem] || "甲";
  const startIndex = STEMS.indexOf(startStem);
  const bIndex = BRANCHES.indexOf(hourBranch);
  const ziIndex = BRANCHES.indexOf("子");
  const offset = (bIndex - ziIndex + 12) % 12;
  return STEMS[(startIndex + offset) % 10];
};
    // =====================
// DOM refs (declare once)
// =====================
let elStatus, elDeckInfo, elShuffleArea, elResult, elFile;
function bindDomRefs() {
  elStatus      = document.getElementById("status");
  elDeckInfo    = document.getElementById("deckInfo");
  elShuffleArea = document.getElementById("shuffleArea");
  elResult      = document.getElementById("result");
  elFile        = document.getElementById("csvFile");
}
function setDeckInfo() {
  if (!elDeckInfo) return;
  elDeckInfo.textContent = "";
}
function setStatus(msg) {
  if (!elStatus) {
    console.warn("status element not found. msg =", msg);
    return;
  }
  elStatus.textContent = msg;
}
function showReady() {
  if (!elResult) return;
  elResult.innerHTML = `<div class="empty">
    準備OK。<br>
    ② 1枚/3枚を選ぶ → ③「カードを引く」
  </div>`;
}
function boot() {
  bindDomRefs();
  applyCreatorMode();
  // ★ DOMが取れてからイベントを付ける
  const btnUseSaved = document.getElementById("btnUseSaved");
  if (btnUseSaved) btnUseSaved.addEventListener("click", useSaved);
  const btnClearSaved = document.getElementById("btnClearSaved");
  if (btnClearSaved) btnClearSaved.addEventListener("click", clearSaved);
  if (elFile) elFile.addEventListener("change", onPickFile);
  loadBundledCsv();
}
document.addEventListener("DOMContentLoaded", boot);
    function pick(row, key) {
      // 完全一致
      if (row[key] != null) return row[key];
      // trim/BOMを無視して一致させる
      const want = normalizeKey(key);
      const hit = Object.keys(row).find(k => normalizeKey(k) === want);
      return hit ? row[hit] : "";
    }
    function normalizeKey(s) {
      return (s ?? "")
        .toString()
        .replace(/^\uFEFF/, "")
        .trim()
        .toLowerCase();
    }
    function pickAny(row, candidates) {
      for (const c of candidates) {
        const v = pick(row, c);
        if (v != null && String(v).trim() !== "") return String(v).trim();
      }
      return "";
    }
    function normalizeImagePath(s) {
      return (s ?? "")
        .toString()
        .replace(/^\uFEFF/, "")
        .trim()
        .replace(/^\/+/, "")
        .replace(/\\/g, "/");   // Windowsの \ を / に
    }
    function normalizeRow(row) {
      // キー正規化（BOM/空白/大小）
      const norm = (s) => (s ?? "").toString().replace(/^\uFEFF/, "").trim().toLowerCase();
      // row から key を大小/BOM無視で取る
      const get = (key) => {
        const want = norm(key);
        const hit = Object.keys(row).find(k => norm(k) === want);
        return hit ? String(row[hit] ?? "").trim() : "";
      };
      // 1) 通常ヘッダー（id, arcana, ... image）で来た場合
      const idNormal = get("id");
      if (idNormal) {
        // ヘッダー行が混じる保険
        if (idNormal.toLowerCase() === "id") return null;
        return {
          id: idNormal,
          arcana: get("arcana"),
          suit: get("suit"),
          number: get("number"),
          name_ja: get("name_ja"),
          name_en: get("name_en"),
          element: get("element"),
          polarity: get("polarity"),
          yes_no_upright: get("yes_no_upright"),
          yes_no_reversed: get("yes_no_reversed"),
          timing: get("timing"),
          themes: get("themes"),
          keywords_upright: get("keywords_upright"),
          keywords_reversed: get("keywords_reversed"),
          core_upright: get("core_upright"),
          interpretation_upright: get("interpretation_upright"),
          angel_upright: get("angel_upright"),
          action_upright: get("action_upright"),
          core_reversed: get("core_reversed"),
          interpretation_reversed: get("interpretation_reversed"),
          angel_reversed: get("angel_reversed"),
          action_reversed: get("action_reversed"),
          image: normalizeImagePath(get("image")),
        };
      }
      // Column形式は使わない
      return null;
    } // ← これからが必要
    function validateCards(list) {
      // id さえあればOK（imageは無くても動く）
      const bad = list.find(r => !r.id);
      return !bad;
    }
    function onPickFile() {
      const file = elFile.files?.[0];
      if (!file) return;
      setStatus("CSVを読み込み中...");
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const text = reader.result?.toString() || "";
          const delim = guessDelimiterFromText(text);
          console.log("file guessed delimiter =", JSON.stringify(delim));
          const results = Papa.parse(text, {
            header: true,
            skipEmptyLines: true,
            delimiter: delim
          });
          // ===== Column1〜 行を自動スキップする =====
          if (results.meta?.fields?.[0]?.toLowerCase() === "column1") {
            console.log("Dummy header detected. Re-parsing CSV...");
            results.data.shift();
          }
          // ========================================
          const rows = (results.data || [])
            .map(normalizeRow)
            .filter(r => r && r.id);
          if (!rows.length) {
            setStatus("CSVにデータがありません（区切り/cards listを読み込ました）";
            return;
          }
          if (!validateCards(rows)) {
            setStatus("必須列（id,name_ja,name_en,image）が不足しています。");
            return;
          }
          cards = rows;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
          setDeckInfo();
          setStatus(`読み込み完了：${cards.length}枚。引けます。`);
          showReady();
        } catch (e) {
          console.error(e);
          setStatus("読み込みでエラー。CSV形式を確認してください。");
        }
      };
      reader.onerror = () => {
        setStatus("ファイルの読み込みに失敗しました。");
      };
      reader.readAsText(file, "utf-8");
    }
    function useSaved() {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        setStatus("保存済みCSVがありません。まずCSVを読み込んでください。");
        return;
      }
      try {
        const rows = JSON.parse(saved);
        if (!Array.isArray(rows) || !rows.length) {
          setStatus("保存済みCSVが壊れています。いったん消し