
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
  // 子=23-0, 丑=1-2 ... の2時間刻み（23:00-00:59 が子）
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
    } // ← これが必要
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
            setStatus("CSVにデータがありません（区切り/ヘッダーを確認）。");
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
          setStatus("保存済みCSVが壊れています。いったん消して読み込み直してください。");
          return;
        }
        cards = rows;
        setDeckInfo();
        setStatus(`保存済みCSVを読み込みました：${cards.length}枚。`);
        showReady();
      } catch (e) {
        setStatus("保存済みCSVの読み込みに失敗。消して読み込み直してください。");
      }
    }
    function clearSaved() {
      localStorage.removeItem(STORAGE_KEY);
      cards = [];
      setDeckInfo();
      setStatus("保存を削除しました。CSVを読み込んでください。");
      elResult.innerHTML = `<div class="empty">
    ここに結果が出ます。<br>
    ① CSVを読み込む → ② 1枚/3枚を選ぶ → ③「カードを引く」
  </div>`;
    }
  
    function startShuffle(){
  document.getElementById("shuffleArea")?.classList.add("shuffling");
}
function stopShuffle(){
  document.getElementById("shuffleArea")?.classList.remove("shuffling");
}
    function randInt(n) { return Math.floor(Math.random() * n); }
    function drawUnique(count) {
      const used = new Set();
      const picked = [];
      while (picked.length < count) {
        const idx = randInt(cards.length);
        if (used.has(idx)) continue;
        used.add(idx);
        const card = cards[idx];
        const isReversed = Math.random() < 0.5;
        picked.push({ card, isReversed });
      }
      return picked;
    }
    function ensureDeckWrap(){
  const area = document.getElementById("shuffleArea");
  if (!area) return;
  const deckImg = area.querySelector("img.deck");
  if (!deckImg) return;
  // もうwrap済みなら何もしない
  if (deckImg.parentElement && deckImg.parentElement.classList.contains("deckWrap")) return;
  const wrap = document.createElement("div");
  wrap.className = "deckWrap";
  deckImg.parentNode.insertBefore(wrap, deckImg);
  wrap.appendChild(deckImg);
}
// 初期表示で1回
document.addEventListener("DOMContentLoaded", ensureDeckWrap);
    // =========================
// Step1-1: 4枠（結論→理由→今日は→一歩）を固定する
// =========================
function buildStoryBlockHTML({ conclusion, reason, today, step }) {
  const escBR = (s) => escapeHtml(String(s ?? "")).replace(/\n/g, "<br>");
  return `
    <section class="angel-summary">
      <div class="angel-block angel-conclusion">
        <div class="angel-label">結論</div>
        <div class="angel-text">${escBR(conclusion)}</div>
      </div>
      <div class="angel-block angel-reason">
        <div class="angel-label">理由</div>
        <div class="angel-text">${escBR(reason)}</div>
      </div>
      <div class="angel-block angel-today">
        <div class="angel-label">今日は</div>
        <div class="angel-text">${escBR(today)}</div>
      </div>
      <div class="angel-block angel-step">
        <div class="angel-label">一歩</div>
        <div class="angel-text">${escBR(step)}</div>
      </div>
    </section>
  `;
}
// =========================
// Stable picker (seeded)
// =========================
function hash32(str){
  // FNV-1a 32bit
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}
/**
 * arr: 配列
 * seed: 文字列（例 "2026-03-02|The World|U|work"）
 */
function pickStable(arr, seed){
  if (!Array.isArray(arr) || arr.length === 0) return "";
  const idx = hash32(String(seed || "seed")) % arr.length;
  return arr[idx];
}
// Fallback arrays (in case they are missing)
window.loveActionsUpright ??= ["深呼吸して、優しい言葉をひとつ。"];
window.loveActionsReversed ??= ["急がず、距離感を整える。"];
window.moneyActionsUpright ??= ["支出を一つだけ整える。"];
window.moneyActionsReversed ??= ["今日だけは守りを優先する。"];
window.workActionsUpright ??= ["手元の一件を完了させる。"];
window.workActionsReversed ??= ["優先順位を見直して一つ減らす。"];
// =========================
// Text helpers (global)
// =========================
function normalizeText(s, fallback=""){
  const t = (s ?? "").toString().trim();
  return t ? t : fallback;
}
// dbEntry を「カード＋正逆」で取ってくる関数（あなたの既存実装に寄せる）
// ※あとでここだけ “本物” に差し替える
function getDbEntryFor(card, isReversed){
  if (!card) return null;
  return {
    light: card.light,
    meaning: isReversed ? card.meaning_reversed || card.meaning : card.meaning,
    actions: Array.isArray(card.actions)
      ? card.actions
      : (card.actions ? card.actions.split("|") : []),
    prayer: card.prayer
  };
}
// actions配列が無い/足りない場合の保険
function pickFirstAction(dbEntry){
  const a0 = dbEntry?.actions?.[0];
  if (typeof a0 === "string" && a0.trim()) return a0.trim();
  return "呼吸が深くなる選択をひとつ";
}
// =========================
// Step3: 五行不足を「一歩」に自然反映（global）
// =========================
function adjustStepByWeakElement(stepText, weakJP){
  if (!weakJP) return stepText;
  const map = {
    "火": " ほんの少し勇気を足して。",
    "水": " 感情を整えながら。",
    "木": " まず一歩、動いて。",
    "土": " 足場を固めてから。",
    "金": " 境界線を意識して。"
  };
  return stepText + (map[weakJP] || "");
}
// =========================
// Short action formatter (global)
// =========================
function toShortAction(s, maxLen = 22){
  const t = (s ?? "").toString().trim();
  if (!t) return "呼吸が深くなる選択をひとつ";
  // 先頭の記号や箇条書き記号を削る
  let out = t.replace(/^[・●\-\*]\s*/g, "");
  // 末尾の句点や余計な記号を軽く整理
  out = out.replace(/[。．\.]+$/g, "");
  // 長すぎる場合は省略
  if (out.length > maxLen) out = out.slice(0, maxLen) + "…";
  return out;
}
// =========================
// Reason builder (global)
// - basePoetic / baseExplain / closing を “読みやすい一つの理由文” に整形
// =========================
function buildReadableReason({ basePoetic = "", baseExplain = "", closing = "", optionalMetaLines = [] }){
  const clean = (s) => (s ?? "").toString().trim();
  const p = clean(basePoetic);
  const e = clean(baseExplain);
  const c = clean(closing);
  const meta = Array.isArray(optionalMetaLines)
    ? optionalMetaLines.map(clean).filter(Boolean)
    : [];
  // 長文になりすぎるのを軽く抑える（必要なら調整可）
  const shorten = (s, max = 160) => {
    const t = clean(s);
    if (!t) return "";
    if (t.length <= max) return t;
    return t.slice(0, max) + "…";
  };
  // 「理由」なので、詩→説明→締め で一続きにする
  // ※ UI側が white-space: pre-line なら \n が綺麗に効く
  const parts = [
    shorten(p, 120),
    shorten(e, 220),
    ...meta.map(m => shorten(m, 120)),
    shorten(c, 90),
  ].filter(Boolean);
  // 文章が何も無いケースでも落とさない
  if (!parts.length) {
    return "いまは状況を整えるほど、次の流れが見えてくる時です。";
  }
  return parts.join("\n");
}
const BACK_SRC = "./public/cards/back.png";
function pulseDeck(){
  const area = document.getElementById("shuffleArea");
  if (!area) return;
  area.classList.remove("pulse");
  void area.offsetWidth; // 再発火させるため
  area.classList.add("pulse");
  setTimeout(() => {
    area.classList.remove("pulse");
  }, 1900);
}
function buildResultActionsHTML(){
  return `
    <div class="resultActions">
      <div class="readingLinks">
        <a class="readingLink" href="./numbers.html" target="_blank" rel="noopener">
          ✨ 数秘（ライフパスナンバー）の意味を見る
        </a>
        <a class="readingLink" href="./elements/index.html" target="_blank" rel="noopener">
  🌿 五行（木火土金水）の意味を見る
</a>
        <a class="readingLink highlight" href="https://lin.ee/Cm7TuLh" target="_blank" rel="noopener noreferrer">
          💬 LINE登録：無料ミニ鑑定へ
        </a>
      </div>
      <div class="shareRow">
        <button class="btnGhost" type="button" onclick="shareResultText()">Share</button>
        <button class="btnGhost" type="button" onclick="copyResultText()">Copy</button>
        <button class="btnGhost" type="button" onclick="shareResultImage()">Share Image</button>
      </div>
      <button class="btnDrawAgain" type="button" onclick="onDraw()">もう一度カードを引く</button>
    </div>
  `;
}
async function onDraw() {
  const elResult = document.getElementById("result");
  pulseDeck();
  try {
    if (!cards.length) {
      setStatus("デッキが未読み込みです");
      showToast("デッキ読み込み待ちです。少し待ってからもう一度。", 3500);
      return;
    }
    const drawMode = document.querySelector('input[name="drawMode"]:checked')?.value || "1";
    const count = (String(drawMode) === "3") ? 3 : 1;
    setStatus(`シャッフル中…（${count}枚）`);
    if (typeof startShuffle === "function") startShuffle();
    await new Promise(r => setTimeout(r, 900));
    if (typeof stopShuffle === "function") stopShuffle();
    const picked = drawUnique(count);
    const labels3 = ["過去", "現在", "未来"];
    const gridClass = count === 1 ? "cardsGrid single" : "cardsGrid three";
    const globalSummaryHTML = buildGlobalSummaryHTML(picked, count, labels3);
    const numerologyMiniHTML =
  (typeof buildNumerologyMiniHTML === "function")
    ? buildNumerologyMiniHTML()
    : "";
    const gogyouNavHTML =
      (typeof buildGogyouQuickNavHTML === "function") ? buildGogyouQuickNavHTML() : "";
    const energyHTML =
      (typeof hasBirthInput === "function" && hasBirthInput() && typeof buildBothGogyouHTML === "function")
        ? buildBothGogyouHTML()
        : "";
    const actionsHTML =
      (typeof buildResultActionsHTML === "function")
        ? buildResultActionsHTML()
        : "";
    elResult.innerHTML = `
      ${globalSummaryHTML}
      ${numerologyMiniHTML}
      ${gogyouNavHTML}
      ${energyHTML}
      <div class="${gridClass}">
        ${picked.map((p, i) =>
          renderCard(p.card, p.isReversed, count === 3 ? labels3[i] : "", true)
        ).join("")}
      </div>
      ${actionsHTML}
    `;
    setTimeout(() => {
      console.log(
        "globalSummary:",
        document.querySelector("#result .globalSummary")?.innerText
      );
    }, 50);
    // --- share用の「鑑定の一文」を保存 ---
    window.__shareOneLine =
      (document.querySelector("#result .coreText")?.textContent || "").trim();
    if (!window.__shareOneLine) {
      window.__shareOneLine =
        (document.querySelector("#result .globalSummary")?.textContent || "").trim();
    }
    // ★ これを戻す
    setTimeout(scrollToResultSmooth, 160);
    setStatus(`結果表示：${count}枚引き。`);
  } catch (e) {
    console.error(e);
    setStatus("エラーで停止しました");
    showToast("エラーで停止しました（Console参照）", 4500);
  }
}
    
        /**
         * basePoetic: 詩的1文
         * baseExplain: 具体化（つまり）
         * isReversed: 正逆
         * cardKey: カード名 or id (必須：安定選択に使う)
         * ymdKey: 今日の日付 "YYYY-MM-DD"（なければ生成）
         */
        function buildLoveReasonTextStable({ basePoetic, baseExplain, isReversed, cardKey, ymdKey }) {
          const today = ymdKey || new Date().toISOString().slice(0, 10);
          const seed = `${today}|${cardKey || "card"}|${isReversed ? "R" : "U"}`;
          const rawAction = isReversed
            ? pickStable(loveActionsReversed, seed)
            : pickStable(loveActionsUpright, seed);
          const action = toShortAction(rawAction);
          const closing = isReversed
            ? `今日は${action} 整えるほど、静かに守られる。`
            : `今日は${action} 小さく動くほど、流れが味方する。`;
          return buildReadableReason({
            basePoetic,
            baseExplain,
            closing,
            optionalMetaLines: [
              // 恋愛では数秘/九星は出しすぎると重いので「必要なら」だけ
              // ここは空にしてもOK。残す場合も短く。
            ]
          });
        }
        function buildMoneyReasonTextStable({ basePoetic, baseExplain, isReversed, cardKey, ymdKey }) {
          const today = ymdKey || new Date().toISOString().slice(0, 10);
          const seed = `${today}|${cardKey || "card"}|${isReversed ? "R" : "U"}|money`;
          const rawAction = isReversed
            ? pickStable(moneyActionsReversed, seed)
            : pickStable(moneyActionsUpright, seed);
          const action = toShortAction(rawAction);
          const closing = isReversed
            ? `今日は${action} 整えるほど、静かに守られる。`
            : `今日は${action} 小さく動くほど、流れが味方する。`;
          return buildReadableReason({
            basePoetic,
            baseExplain,
            closing,
            optionalMetaLines: [
              // 金運は “なぜ金運?” を防ぐために一行だけ添える（押しつけない）
              "このカードは“価値・循環・物質”に触れているため、金運の助言として読めます。"
            ]
          });
        }
        /**
         * basePoetic: 詩的1文
         * baseExplain: 具体化（つまり）
         * isReversed: 正逆
         * cardKey: カード名 or id
         * ymdKey: "YYYY-MM-DD"（省略可）
         */
        function buildWorkReasonTextStable({ basePoetic, baseExplain, isReversed, cardKey, ymdKey }) {
          const today = ymdKey || new Date().toISOString().slice(0, 10);
          const seed = `${today}|${cardKey || "card"}|${isReversed ? "R" : "U"}|work`;
          const rawAction = isReversed
            ? pickStable(workActionsReversed, seed)
            : pickStable(workActionsUpright, seed);
          const action = toShortAction(rawAction);
          const closing = isReversed
            ? `今日は${action} 整えるほど、静かに守られる。`
            : `今日は${action} 小さく動くほど、流れが味方する。`;
          return buildReadableReason({
            basePoetic,
            baseExplain,
            closing,
            optionalMetaLines: []
          });
        }
        
        
    // === 五行の計算結果を保持する場所（ここが“答え”になる） ===
window.__gogyouState = window.__gogyouState || {
  user: null,
  partner: null
};
    // --- キーワード：| 区切りで最大10個 ---
    function splitKeywords(str, limit = 10) {
      const raw = (str ?? "").toString().trim();
      if (!raw) return [];
      return raw.split("|").map(s => s.trim()).filter(Boolean).slice(0, limit);
    }
    function strengthenCore(core, themes) {
  let c = (core ?? "").toString().trim();
  const t = (themes ?? "").toString().trim();
  // 末尾句点を整える（短文が並んでも切れ目が見える）
  const ensureEndPunc = (s) => {
    const tt = String(s || "").trim();
    if (!tt) return "";
    return /[。！？!?\)]$/.test(tt) ? tt : (tt + "。");
  };
  // 分離先
  let baseText = c;
  let focusText = "";
  let directionText = "";
  // themes が "焦点|方向性" 形式なら優先
  if (t) {
    const partsT = String(t).split("|").map(v => v.trim()).filter(Boolean);
    if (partsT[0]) focusText = partsT[0];
    if (partsT[1]) directionText = partsT[1];
  }
  // core に「焦点：」「方向性：」が入ってたら上書き分離
  if (String(c || "").includes("焦点：")) {
    const parts = String(c).split("焦点：");
    baseText = (parts[0] || "").trim();
    const remain = (parts[1] || "").trim();
    if (remain.includes("方向性：")) {
      const sub = remain.split("方向性：");
      focusText = (sub[0] || "").trim();
      directionText = (sub[1] || "").trim();
    } else {
      focusText = remain;
    }
  }
  // フォールバック
  if (!baseText) baseText = "いまは流れの節目にいます。";
  if (!focusText) focusText = "いま大切な感覚に気づくこと。";
  if (!directionText) directionText = "焦らず、できる一歩を選びましょう。";
  // 句点統一
  focusText = ensureEndPunc(focusText);
  directionText = ensureEndPunc(directionText);
  // “1枚引きの短文”として見せる（深読みは details 側へ）
  return `
    <div class="cardCore">
      <div class="coreText">${escapeHtml(baseText)}</div>
      <div class="metaLines">
        <div class="metaLine">
          <span class="metaLabel">焦点</span>
          <span class="metaValue">${escapeHtml(focusText)}</span>
        </div>
        <div class="metaLine">
          <span class="metaLabel">方向性</span>
          <span class="metaValue">${escapeHtml(directionText)}</span>
        </div>
      </div>
    </div>
  `;
}// ← ★これが抜けてると終わります
    function metaLine(card) {
  const parts = [];
  if (card.arcana) parts.push(`区分:${card.arcana}`);
  if (card.suit) parts.push(`スート:${card.suit}`);
  if (card.number) parts.push(`番号:${card.number}`);
  if (card.element) parts.push(`元素:${card.element}`);
  if (card.polarity) parts.push(`極性:${card.polarity}`);
  if (card.timing) parts.push(`時期:${card.timing}`);
  return parts.join(" / ");
}
function pickTextByOrientation(card, isReversed, keyBase){
  const k = isReversed ? `${keyBase}_reversed` : `${keyBase}_upright`;
  return (card[k] ?? "").toString().trim();
}
function extractPrayer(card, isReversed){
  const theme = ((card.themes ?? "") + "").trim();
  if (theme.includes("癒")) return "あなたの心が、ゆっくりほどけますように。";
  if (theme.includes("決")) return "あなたの選ぶ道が、光に守られますように。";
  return "あなたの灯す光が、静かに広がりますように。";
}
// ★これが抜けてた（or 壊れてた）ので追加/復活させる
function buildSingleReadingStory({ card, isReversed, energyProfile }){
  const core = extractCoreSentence(card, isReversed);
  const action = extractAction(card, isReversed);
  const prayer = extractPrayer(card, isReversed);
  let body =
`${core}
いま、あなたの流れは静かに動き始めています。
大きく変わろうとしなくても大丈夫。
小さく整える行動が、次の道を照らします。
${action}`;
  if (energyProfile?.tone === "soft"){
    body = body.replace("ください。","みて。");
  }
  return { body, prayer };
}
function buildSingleReadingHTML({ card, isReversed, energyProfile }){
  const { body, prayer } = buildSingleReadingStory({ card, isReversed, energyProfile });
  return `
  <section class="angel-story">
    <div class="angel-cardname">
      ${escapeHtml(card.name_ja)}（${escapeHtml(card.name_en)}）
      <span class="mini">${isReversed ? "逆位置" : "正位置"}</span>
    </div>
    <div class="angel-body">${escapeHtml(body).replace(/\n/g,"<br>")}</div>
    ${energyProfile ? `<div class="angel-tune">${escapeHtml(energyProfile.oneLine)}</div>` : ""}
    <div class="angel-prayer">${escapeHtml(prayer)}</div>
    <section id="aboutFold">
      <details class="angel-details">
        <summary>このサイトでできること</summary>
        <div class="grid">
          ${buildCardDetailHTML(card, isReversed)}
        </div>
      </details>
    </section>
  </section>`;
}

// 未来文の「語尾」に合わせて、つなぎ文を自動で選ぶ

function ensurePoliteJP(s){
  s = (s ?? "").toString().trim();
  if (!s) return "";
  // 末尾が句点で終わるように
  if (!/[。！？!?]$/.test(s)) s += "。";
  // 「大丈夫。」→「大丈夫です。」みたいに統一
  s = s.replace(/大丈夫。/g, "大丈夫です。");
  return s;
}
function softenTendencyJP(line, seed){
  const s = String(line || "").trim();
  if (!s) return "";
  // すでに自然な未来/状態文ならそのまま
  if (/(時です。?|状態です。?|流れです。?|になっていきます。?|しやすくなっていきます。?)$/.test(s)) {
    return s;
  }
  // 「〜しやすい傾向があります」
  if (/しやすい傾向があります。?$/.test(s)){
    return pickStableOne([
      s.replace(/しやすい傾向があります。?$/, "しやすいです。"),
      s.replace(/しやすい傾向があります。?$/, "しやすい状態です。"),
      s.replace(/しやすい傾向があります。?$/, "しやすい傾向があります。"),
    ], seed + "|tend2");
  }
  // 「〜になりやすい傾向があります」
  if (/になりやすい傾向があります。?$/.test(s)){
    return pickStableOne([
      s.replace(/になりやすい傾向があります。?$/, "になりやすいです。"),
      s.replace(/になりやすい傾向があります。?$/, "になりがちです。"),
      s.replace(/になりやすい傾向があります。?$/, "になりやすい傾向があります。"),
    ], seed + "|tend3");
  }
  // ふつうの「傾向があります」
  if (/傾向があります。?$/.test(s)){
    return pickStableOne([
      s.replace(/傾向があります。?$/, "傾向があります。"),
      s.replace(/傾向があります。?$/, "状態です。"),
      s.replace(/傾向があります。?$/, "流れがあります。"),
    ], seed + "|tend");
  }
  return s;
}
function softenEndingJP(t){
  return String(t || "")
    .replace(/状態です。/g,"傾向があります。")
    .replace(/しやすい状態です。/g,"しやすくなっています。");
}
// 最終仕上げ（これを story の最後に1回かける）

// 文頭の固定を避ける：候補から「安定選択」(同じカードなら同じ導入)
function pickStableOne(list, seed){
  if (!Array.isArray(list) || !list.length) return "";
  let h = 0;
  const s = String(seed ?? "seed");
  for (let i=0;i<s.length;i++) h = (h*31 + s.charCodeAt(i)) >>> 0;
  return list[h % list.length];
}
// 最終仕上げ：空行整理・句読点揺れ・反復除去

function reduceRepeatsJP(text){
  let t = String(text || "");
  // 「今は、」が連続するときだけ2回目以降を削る（弱め）
  t = t.replace(/(今は、)\s*\1+/g, "$1");
  t = t.replace(/(いまは、)\s*\1+/g, "$1");
  // 「無理」連発だけ軽く救済（2回目以降だけ言い換え）
  const hits = (t.match(/無理/g) || []).length;
  if (hits >= 2){
    let first = true;
    t = t.replace(/無理/g, () => (first ? (first=false, "無理") : "背負いすぎ"));
  }
  // 空行が多すぎるのを整える
  t = t.replace(/\n{3,}/g, "\n\n");
  return t;
}
function polishStoryJP(story){
  let s = String(story || "");
  s = s.replace(/[ \t]+\n/g, "\n");
  s = s.replace(/\n{3,}/g, "\n\n");
  s = s.replace(/。。+/g, "。");
  s = reduceRepeatsJP(s);
  return s.trim();
}

function fixDuplicateTendencyJP(s){
  s = String(s || "");
  // 句読点の事故（.。）や 全角ピリオド混入
  s = s.replace(/\.。/g, "。");
  s = s.replace(/。\./g, "。");
  s = s.replace(/\.{2,}/g, "。");
  // 「時です時です」系
  s = s.replace(/(時です)\s*\1+/g, "$1");
  s = s.replace(/(です)\s*\1+/g, "$1");
  // 「〜になりやすいに寄りやすい」/「〜しやすいに寄りやすい」
  s = s.replace(/(なりやすい|しやすい)\s*に寄りやすい/g, "$1");
  s = s.replace(/に寄りやすい\s*時です/g, "傾向があります。");
  // 「〜がちなになりやすい」→ どちらかに統一
  s = s.replace(/がち(な)?\s*になりやすい/g, "がちです");
  s = s.replace(/がち(な)?\s*しやすい/g, "がちです");
  // 「〜が出やすいです」：意味が壊れてることが多いので自然文へ
  // 例「疲弊しやすいが出やすいです」→「疲弊しやすい傾向があります」
  s = s.replace(/(やすい|がち)(?:が)?\s*出やすいです/g, "$1傾向があります。");
  s = s.replace(/が出やすいです/g, "傾向があります。");
  // 「〜になりやすいです時です」みたいな接続事故
  s = s.replace(/(傾向があります。)\s*時です/g, "$1");
  s = s.replace(/(です)\s*時です/g, "$1。");
  // 余計な空白
  s = s.replace(/[ \t]{2,}/g, " ");
  s = s.replace(/\n{3,}/g, "\n\n");
  return s.trim();
}
// ===== JP story post-process (repeat + connector fix) =====
function postProcessStoryJP(s){
  s = String(s || "");
  s = s.replace(/がちなという/g, "がちだという");
  // ① 先頭の固定フレーズをランダム化（“これまでの流れでは”固定を回避）
  s = s.replace(/^これまでの流れでは、/m, pickOneJP([
    "これまでを振り返ると、",
    "ここまでの経緯を見ると、",
    "これまでの歩みの中で、",
  ]));
  // ② 「流れ」連打を弱める（“流れの〜”→“この先の〜”など）
  s = s.replace(/流れの/g, "この先の");
  s = s.replace(/この流れ/g, "この傾向");
  s = s.replace(/流れが/g, "気配が");
  // ③ 「今は、今は、」などの繰り返しを潰す
  s = s.replace(/(今は、)\s*\1+/g, "$1");
  s = s.replace(/(無理に)\s*\1+/g, "$1");
  // ④ 「〜しにくいへと」みたいな不自然接続を修正
  s = s.replace(/(しにくい|づらい)へと/g, "$1傾向へ");
  // 二重化事故を潰す（よく出るやつだけ強制修正）
s = s.replace(/がちなになりがち/g, "がちです");
s = s.replace(/がちなになりやすい/g, "がちです");
s = s.replace(/しやすいになりがち/g, "しやすい傾向があります");
s = s.replace(/しやすいになりやすい/g, "しやすい傾向があります");
s = s.replace(/やすい時です時です/g, "やすい時です");
s = s.replace(/時です時です/g, "時です");
s = s.replace(/状態です\.\。/g, "状態です。");
s = s.replace(/\.\。/g, "。");
  // ⑤ 余計な空行を整える
  s = s.replace(/\n{3,}/g, "\n\n");
  // ⑥ 既存の重複削減も最後に一回かける（あるなら）
  if (typeof reduceRepeatsJP === "function") {
  s = reduceRepeatsJP(s);
  }
   // ★ここを追加：最終の崩れ取り
 if (typeof fixJPArtifacts === "function") {
  s = fixJPArtifacts(s);
}
  if (typeof stripStepWrapFromStoryJP === "function") {
  s = stripStepWrapFromStoryJP(s); // ★UI側で出すなら入れる
  }
  return s.trim();
}
// 未来文の語尾に合わせて、つなぎを自然にする
function endingTypeJP(s){
  s = (s ?? "").toString().trim();
  if (!s) return "other";
  if (/(しにくい|しづらい|なりやすい|やすい)\s*。?$/.test(s)) return "adj_difficulty";
  if (/(状態です|傾向です|流れです|局面です)\s*。?$/.test(s)) return "state";
  if (/(でしょう|かもしれません)\s*。?$/.test(s)) return "soft";
  if (/(ます|です)\s*。?$/.test(s)) return "polite";
  return "other";
}
function bridgeJP(nextSentence){
  const t = endingTypeJP(nextSentence);
  if (t === "adj_difficulty"){
    return "その先では、そう感じやすい時間が続きそうです。";
  }
  if (t === "state"){
    return "少し先には、その傾向がもう一段はっきりしていきます。";
  }
  if (t === "soft"){
    return "この先は、その気配が静かに広がっていくでしょう。";
  }
  return "やがて、その意味が現実の場面に表れてきます。";
}
  function buildThreeReadingStory({ past, present, future, energyProfile }){
  // 0) seed は最初に作る（必須）
  const seed = `${past.card.id}|${present.card.id}|${future.card.id}`;
  // 1) 元テキスト（接続詞を剥がしたコア）
  const p0 = stripLeadConnectorJP(extractCoreSentence(past.card, past.isReversed));
  const n0 = stripLeadConnectorJP(extractCoreSentence(present.card, present.isReversed));
  const f0 = stripLeadConnectorJP(extractCoreSentence(future.card, future.isReversed));
  // 2) 2文まで + 語尾ゆらぎ（必要なら soften）
  const p = softenTendencyJP(
  ensurePoliteJP(varyEndingJP(firstSentencesJP(p0, 2), seed+"|p")),
  seed+"|p"
);
const n = softenTendencyJP(
  ensurePoliteJP(varyEndingJP(firstSentencesJP(n0, 2), seed+"|n")),
  seed+"|n"
);
// 未来は soften しない
const f = normalizeFutureJP(firstSentencesJP(f0, 2));
  // 3) つなぎ
  const head = pickStableOne([
    "これまでを振り返ると、",
    "ここまでの経緯を見ると、",
    "最近の流れを辿ると、",
  ], seed + "|head");
  const mid = pickStableOne([
    "そして今、",
    "いま目の前では、",
    "現在は、",
  ], seed + "|mid");
  const fut = pickStableOne([
  "少し先には、",
  "やがて、",
  "この先、",
], seed + "|fut");
  const themeNow = String(present.card.themes || "");
  const bridge = (typeof bridgeForFutureJP === "function")
    ? bridgeForFutureJP(seed, themeNow)
    : pickStableOne([
        "その延長で、次の気配が少しずつ強まります。",
        "そこから、次のテーマが輪郭を帯びてきます。",
        "積み重ねの先で、次の課題が静かに現れます。",
      ], seed + "|bridge");
  // 4) ストーリー本文
  const hasTimeLead = /^(この先|少し先|やがて|今後|まもなく)[、]/.test(f);
let story =
`${head}${p}
${mid}${n}
${bridge}
${hasTimeLead ? "" : fut}${f}`.trim();
  // ===== ここ（A）: 今日の一歩を入れる（おすすめ：wrapの前） =====
  const step = extractAction(present.card, present.isReversed)
            || extractAction(future.card, future.isReversed);
  if (step) {
    story += `\n\n今日の一歩：${firstSentencesJP(step, 1).replace(/。$/,"")}。`;
  }
  // ===== ここ（B）: 結びは “必要な時だけ” 追加（※二重追加しない） =====
  const shouldWrap =
    (String(f || "").length < 28) || /傾向があります。?$/.test(String(f));
  if (shouldWrap && typeof buildWrapUpJP === "function") {
    const wrap = buildWrapUpJP({ p0, n0, f0, seed });
    if (wrap) story += `\n\n${wrap}`;
  }
  // ① ゴミ取り
  if (typeof fixDuplicateTendencyJP === "function") {
    story = fixDuplicateTendencyJP(story);
  }
  // ② 全体整形
  if (typeof postProcessStoryJP === "function") {
    story = postProcessStoryJP(story);
  }
  return story;
}
function buildWrapUpJP({ p0="", n0="", f0="", seed="" }){
  const p = String(p0), n = String(n0), f = String(f0);
  // “現在”を主役にして、結び方を変える（ざっくりでOK）
  if (/癒|回復|安心|休|落ち着/.test(n)){
    return pickStableOne([
      "結び：いまは回復が最優先です。過去の疲れをほどきながら、未来へ進む余白が戻ってきます。",
      "結び：整えるほどに光が戻ります。過去の名残を手放し、未来の選択がやさしく開いていきます。",
    ], seed+"|wrap|heal");
  }
  if (/決|選択|転|変|進む|動く/.test(n)){
    return pickStableOne([
      "結び：いまは選択の軸を定める時です。過去の経験を糧に、未来へ向けて一歩が決まっていきます。",
      "結び：決めることで流れが整います。過去を整理し、未来の方向がはっきりしていきます。",
    ], seed+"|wrap|decide");
  }
  if (/不安|怖|迷|孤立|見失/.test(n)){
    return pickStableOne([
      "結び：いまは心の安全を作り直す時です。過去の影響を抱えすぎず、未来へ向けて呼吸を整えましょう。",
      "結び：不安は“守るためのサイン”です。過去の負担を軽くして、未来に向けた小さな安心を積み重ねて。",
    ], seed+"|wrap|anx");
  }
  if (/評価|恐れ|怖い|批判|見られ|期待|空回り/.test(n)){
  return pickStableOne([
    "結び：評価の目線よりも、自分の感覚を基準に戻すほど整っていきます。過去を抱えすぎず、未来は自然に開いていきます。",
    "結び：怖さは“守りたい大切さ”の裏返しです。いまの基準を整えるほど、未来の選択に芯が戻ります。",
  ], seed+"|wrap|eval");
}
  // default
  return pickStableOne([
    "結び：現在の気づきが、過去を癒し、未来を選び直す鍵になります。",
    "結び：過去の背景を踏まえた上で、いまの選択が未来の形を作ります。",
  ], seed+"|wrap|default");
}

function buildThreeReadingHTML({ past, present, future, energyProfile }){
  const story = buildThreeReadingStory({ past, present, future, energyProfile });
  return `
  <section class="angel-story">
    <div class="angel-cardrow">
      <span>過去：${escapeHtml(past.card.name_ja)}</span>
      <span>現在：${escapeHtml(present.card.name_ja)}</span>
      <span>未来：${escapeHtml(future.card.name_ja)}</span>
    </div>
    <div class="angel-body">${escapeHtml(story).replace(/\n/g,"<br>")}</div>
    ${energyProfile ? `<div class="angel-tune">${escapeHtml(energyProfile.oneLine)}</div>` : ""}
    <div class="angel-prayer">すべては、ちゃんと繋がっています。</div>
    <details class="angel-details">
      <summary>カード詳細</summary>
      <div class="detailGrid">
        ${buildCardDetailMiniHTML(past.card, past.isReversed, "過去")}
        ${buildCardDetailMiniHTML(present.card, present.isReversed, "現在")}
        ${buildCardDetailMiniHTML(future.card, future.isReversed, "未来")}
      </div>
    </details>
  </section>`;
}
    // --- 4つのエネルギー分類テキスト生成 ---
    function generateEnergyCategories(uDate, pDate) {
      if (!uDate) return "";
      const lp = calculateLifePath(uDate);
      const [y, m, d] = uDate.split("-");
      const honmei = getHonmeiStar(y, m, d) || 1;
      const isLpOdd = lp % 2 !== 0;
      const hElement = STAR_DATA[honmei] ? STAR_DATA[honmei].element : "水";
      // 要件にある calculateNameNumbers の利用 (Name入力がないためプレースホルダで算出)
      const nameEnergy = typeof calculateNameNumbers === "function" ? calculateNameNumbers("TAROT") : { su: 3, pe: 5 };
      const hasStrongSoul = nameEnergy.su >= 5;
      let romance = "【恋愛】";
      if (pDate) {
        const p_lp = calculateLifePath(pDate);
        if (lp === p_lp || (isLpOdd && p_lp % 2 !== 0) || (!isLpOdd && p_lp % 2 === 0)) {
          romance += "波長が合いやすい時期。お互いの長所を認め合うことで絆が深まります。";
        } else {
          romance += "違う視点を持つからこそ補い合える関係。違いを楽しむ心のゆとりが愛を育てます。";
        }
      } else {
        romance += (hElement === "水" || hElement === "木" || hasStrongSoul)
          ? "柔らかな気配りがご縁を引き寄せる時。自然なコミュニケーションが吉。"
          : "あなたの情熱や芯の強さが魅力として伝わりやすい時期。素直な表現を心がけて。";
      }
      const work = " 【仕事】" + (["土", "金"].includes(hElement)
        ? "堅実な積み上げが大きな成果に繋がります。焦らず着実な一歩を。"
        : "直感やアイデアが光るタイミング。新しいアプローチを試してみる価値あり。");
      const intp = " 【対人】" + (isLpOdd
        ? "明るいエネルギーが周囲を牽引します。積極的な声かけが好循環を生むでしょう。"
        : "聞き役に徹することで、深い信頼関係を築ける時期。相手の言葉に耳を傾けて。");
      const money = " 【金運】" + ([8, 22].includes(lp) || hElement === "金"
        ? "豊かさを引き寄せる力が強い時。自己投資や長期的な計画にお金を使うのがおすすめ。"
        : "堅実な管理が金運安定の鍵。日々の小さな感謝が更なる豊かさを呼び込みます。");
      return `\n${romance}${work}${intp}${money}`;
    }
// =========================
// 画像パス生成（最終確定版）
// =========================
function getBackSrc(){
  return CARDS_BASE + "back.png";
}
function getCardImageSrc(card){
  let raw = String(card?.image || "").trim();
  if (!raw) return getBackSrc();
  raw = raw
    .replace(/^\uFEFF/, "")
    .replace(/^"+|"+$/g, "")
    .replace(/^'+|'+$/g, "")
    .replace(/^\/+/, "")
    .replace(/\\/g, "/");
  // 拡張子が無ければwebp
  if (!/\.(webp|png|jpg|jpeg)$/i.test(raw)) {
    raw += ".webp";
  }
   const base = (window.CARDS_BASE || "/public/cards/");
  return (window.CARDS_BASE || "/public/cards/") + raw;
}
function firstSentencesJP(text, max = 2){
  const t = String(text || "").trim();
  if (!t) return "";
  // 「。」で区切って最大max文まで
  const parts = t.split("。").map(s => s.trim()).filter(Boolean);
  const out = parts.slice(0, max).join("。");
  return out ? out + "。" : "";
}
function normalizeJP(text){
  return (text ?? "").toString().replace(/\s+/g, " ").trim();
}
function extractThemes(card){
  return normalizeJP(card?.themes ?? "");
}
function extractCoreSentence(card, isReversed){
  let t = "";
  const core = pickTextByOrientation(card, isReversed, "core");
  if (core) t = core;
  if (!t){
    const interp = pickTextByOrientation(card, isReversed, "interpretation");
    if (interp) t = firstSentenceJP(interp);
  }
  if (!t){
    const angel = pickTextByOrientation(card, isReversed, "angel");
    if (angel) t = firstSentenceJP(angel);
  }
  if (!t){
    t = "いまは静かに整える時間です。";
  }
  t = normalizeJP(t);
  if (typeof softenEndingJP === "function"){
    t = softenEndingJP(t);
  }
  return t;
}
function varyEndingJP(line, seed){
  const t = String(line || "").trim();
  if (!t) return "";
  // すでに丁寧語ならそのまま
  if (/[。！？]$/.test(t) && /(です|ます|でしょう|かもしれません|なります|やすい)/.test(t)) return t;
  const tail = pickStableOne([
    "という気配があります。",
    "になりやすいようです。",
    "という傾向が出ています。",
    "かもしれません。",
  ], seed + "|tail");
  const base = t.replace(/[。！？]$/,"");
  return base + tail;
}
function extractInterpretation(card, isReversed){
  return normalizeJP(pickTextByOrientation(card, isReversed, "interpretation"));
}
function extractAngel(card, isReversed){
  return normalizeJP(pickTextByOrientation(card, isReversed, "angel"));
}
function extractAction(card, isReversed){
  const action = normalizeJP(pickTextByOrientation(card, isReversed, "action"));
  if (action) return action;
  // actionが空なら、coreを軽く行動化（増やしすぎない）
  const core = extractCoreSentence(card, isReversed);
  return core.replace(/です。$/, "を、ひとつだけ試してみて。");
}
// --- 鑑定文の自動整形（プロっぽくするレイヤー） ---
function softenStateJP(text){
  let t = (text ?? "").toString().trim();
  if (!t) return "";
  // 余計な引用符を除去
  t = t.replace(/[「」"]/g, "").trim();
  t = stripNowPrefixJP(t);
  // 断定をやわらげる（説明文→占い文）
  t = t
    .replace(/しやすい状態です。?$/,"しやすい流れにあります。")
    .replace(/状態です。?$/,"という流れが出ています。")
    .replace(/状況です。?$/,"という状況が出ています。")
    .replace(/傾向です。?$/,"という傾向が出ています。");
  if (!/[。！？]$/.test(t)) t += "。";
  return t;
}
function inferMeaningLine(stateText){
  const t = (stateText ?? "").toString();
  if (/迷い|先延ばし|決められ/.test(t)) return "本音と現実の間で、答えを熟成させている最中です。";
  if (/疲弊|我慢|犠牲/.test(t))         return "境界線が薄くなり、エネルギーが外に漏れやすい時です。";
  if (/不安|怖/.test(t))               return "安全を確かめたい心が強くなっています。";
  if (/焦|急/.test(t))                 return "スピードより整合性を優先すると流れが戻ります。";
  return pickOneJP([
    "整えるべきポイントは、ここにあります。",
    "ここが、立て直しの要所になります。",
    "調整の鍵は、いまここにあります。"
  ]);
}
function normalizeActionJP(s){
  return String(s || "")
    .trim()
    .replace(/[.．]+$/g, "")   // ← 末尾の . を消す
    .replace(/。+$/g, "")      // ← 末尾の 。も一旦消す
    .replace(/\s+/g, " ")
    .replace(/$/,"。");        // ← 最後に必ず 。を1個だけ付ける
}
// --- 表現の重複を減らすユーティリティ ---
function pickOne(arr, seed){
  // seed不要なら Math.random でOK
  return arr[Math.floor(Math.random() * arr.length)];
}
function bridgeForFutureJP(seed, themeNow="", nowText=""){
  const t = String(themeNow);
  const n = String(nowText);
  // テーマ優先
  if (/癒|回復|安心|休/.test(t) || /癒|回復|安心|休/.test(n)){
    return pickStableOne([
      "その延長で、心の回復が次の判断を助けていきます。",
      "整い始めたところから、次の光が見えやすくなります。",
    ], seed+"|bridge|heal");
  }
  if (/決|選択|転|変/.test(t) || /決|迷い|選べ|変/.test(n)){
    return pickStableOne([
      "その延長で、決めるべき一点が輪郭を帯びてきます。",
      "ここからは、選択の軸が静かに定まっていきます。",
    ], seed+"|bridge|decide");
  }
  if (/恋|愛|関係|対人/.test(t) || /距離|関係|孤立|誤解/.test(n)){
    return pickStableOne([
      "その延長で、関係性の温度が少しずつ変わっていきます。",
      "ここからは、距離感の調整が次の流れを作ります。",
    ], seed+"|bridge|love");
  }
  return pickStableOne([
    "その延長で、次の気配が少しずつ強まります。",
    "そこから、次のテーマが輪郭を帯びてきます。",
    "積み重ねの先で、次の課題が静かに現れます。",
  ], seed+"|bridge|default");
}
function stripLeadConnectorJP(s){
  let t = String(s || "").trim();
  // よくある先頭接続を剥がす（カード文に付いてるやつ）
  t = t.replace(/^(そして)?(今は|いまは|現在は|目の前では)[、,\s]*/,"");
  t = t.replace(/^(この先は|少し先には|やがて)[、,\s]*/,"");
  return t.trim();
}
// 先頭の「今は/いま/そして今は/そしていま」系を剥がす
function stripNowPrefixJP(s){
  let t = String(s || "").trim();
  t = t.replace(/^(そして)?(今は|いまは|いま|現在は|現在)[、,\s]*/,"");
  return t.trim();
}
function normalizeFutureJP(text){
  let s = String(text || "").trim();
  if (!s) return "";
  // 先頭の時間語は buildThreeReadingStory 側で付けるので剥がす
  s = s.replace(/^(この先|少し先|やがて|今後)[、,\s]*/, "");
  // まず未来化
  s = toFutureJP(s);
  // 二重化をここで確実に止める
  s = s.replace(/しやすいになりやすくなっていきます。?/g, "しやすくなっていきます。");
  s = s.replace(/やすいになりやすくなっていきます。?/g, "やすくなっていきます。");
  s = s.replace(/になりやすいになりやすくなっていきます。?/g, "になりやすくなっていきます。");
  // 「〜しやすい時です」→「〜しやすくなっていきます」
  s = s.replace(/しやすい時です。?/g, "しやすくなっていきます。");
  s = s.replace(/しにくい時です。?/g, "しにくくなっていきます。");
  s = s.replace(/になりやすい時です。?/g, "になりやすくなっていきます。");
  // 「〜傾向があります」も未来寄せ
  s = s.replace(/傾向があります。?$/g, "傾向が強まりやすくなっていきます。");
  // 句点整理
  s = s.replace(/\.。/g, "。");
  s = s.replace(/。。+/g, "。");
  return s;
}
function toFutureJP(s){
  s = String(s || "").trim();
  if (!s) return "";
  // 先頭の時間語は外で付けるので剥がす
  s = s.replace(/^(この先|少し先|やがて|今後)[、,\s]*/, "");
  // 1) まず「〜しやすい / 〜になりやすい」系を未来化
  s = s.replace(/しやすい時です。?$/g, "しやすくなっていきます。");
  s = s.replace(/しにくい時です。?$/g, "しにくくなっていきます。");
  s = s.replace(/になりやすい時です。?$/g, "になりやすくなっていきます。");
  s = s.replace(/が出やすい時です。?$/g, "が出やすくなっていきます。");
  s = s.replace(/が強まりやすい時です。?$/g, "が強まりやすくなっていきます。");
  // 2) 「〜している時です」→「〜していく流れです」
  s = s.replace(/している時です。?$/g, "していく流れです。");
  // 3) 「〜できる時です」→「〜できるようになっていきます」
  s = s.replace(/できる時です。?$/g, "できるようになっていきます。");
  // 4) 「〜整う時です」「〜実を結ぶ時です」など動詞で終わる場合
  //    → 「〜流れになっていきます」に寄せる
  s = s.replace(/([ぁ-んァ-ン一-龥A-Za-z0-9]+(?:う|く|ぐ|す|つ|ぬ|ぶ|む|る))時です。?$/g, "$1流れになっていきます。");
  // 5) 「〜状態です」系
  s = s.replace(/状態です。?$/g, "状態になっていきます。");
  // 6) 「〜傾向があります」系
  s = s.replace(/傾向があります。?$/g, "傾向が強まりやすくなっていきます。");
  // 7) 最後まで残った単純な「時です」は、無理に未来化しない
  //    （ここを雑に変えると “整うになっていきます” が起きる）
  //    必要ならそのまま残す
  // s = s.replace(/時です。?$/g, "時です。");
  // 句点整理
  s = s.replace(/\.。/g, "。");
  s = s.replace(/。。+/g, "。");
  return s;
}
function stripStepWrapFromStoryJP(s){
  let t = String(s || "");
  // 「今日の一歩：〜」以降を削る（結論ブロックに混ぜない）
  t = t.replace(/\n*\s*今日の一歩[:：][\s\S]*$/m, "");
  // 「結び：〜」以降を削る（必要なら残すならこの行は消す）
  t = t.replace(/\n*\s*結び[:：][\s\S]*$/m, "");
  // 「今日の一歩」単独見出しパターンにも対応
  t = t.replace(/\n*\s*今日の一歩\s*\n[\s\S]*$/m, "");
  // 「結び」単独見出しパターンにも対応
  t = t.replace(/\n*\s*結び\s*\n[\s\S]*$/m, "");
  // 空行整理
  t = t.replace(/\n{3,}/g, "\n\n");
  return t.trim();
}
// 文のつなぎを自然にする（固定語を減らす）
function joinWithVariedConnectors({past, now, future}){
  // ★ 接続詞を付ける前に「今は」系を剥がす
  now = stripNowPrefixJP(now);
  future = stripNowPrefixJP(future);
  const cNow = pickOne(["そして今、","いまは、","現在は、","目の前では、","ここでは、","その結果、"]);
  const cFut = pickOne(["この先は、","やがて、","少し先では、","次の段階では、","静かに、"]);
  return {
    pastLine: past,
    nowLine: `${cNow}${now}`,
    futureLine: `${cFut}${future}`,
  };
}
function fixJPArtifacts(s){
  return String(s || "")
    .replace(/(しやすい|出やすい|疲れやすい|揺れやすい|なりやすい|見失いやすい)\s*(に)?\s*なりやすい/g, "$1")
    .replace(/(しやすい|出やすい|疲れやすい|揺れやすい|なりやすい|見失いやすい)\s*に寄りやすい/g, "$1")
    .replace(/傾向があります。?\s*傾向があります。?/g, "傾向があります。")
    .replace(/[.．]+\s*。/g, "。")
    .replace(/。。+/g, "。")
    .replace(/[.．]{2,}/g, "。")
    .replace(/です[.．]+/g, "です。")
    .replace(/ます[.．]+/g, "ます。");
}
function pickOneJP(arr){
  return arr[Math.floor(Math.random() * arr.length)];
}
function extractKeywords(card, isReversed, limit){
  const raw = isReversed ? card?.keywords_reversed : card?.keywords_upright;
  if (!raw) return [];
  // 既存 splitKeywords があるならそれを優先
  if (typeof splitKeywords === "function") return splitKeywords(raw, limit);
  return String(raw).split(/[,、|]/).map(s => s.trim()).filter(Boolean).slice(0, limit);
}
/* ---- 刺さる2行に整形する（核心：言い切り + 次の一手） ---- */
function makeTwoLineConclusion({ coreNow, coreFlow, themes }){
  // 1行目：状況の言い切り（短い）
  const line1 = coreFlow || coreNow || "いまは流れが切り替わる前夜です。";
  // 2行目：方向性（テーマがあれば寄せる）
  let line2 = "";
  if (themes) {
    line2 = `テーマは「${themes}」。そこに意識を寄せて、行動をひとつに絞って。`;
  } else {
    line2 = "焦らず、行動をひとつに絞って進めて。";
  }
  return { line1, line2 };
}
/* ---- 3枚の“流れ”を作る：過去→現在→未来を一言でつなぐ ---- */
function buildFlowSentence(pastCore, nowCore, futureCore){
  const p = pastCore ? pastCore.replace(/。$/, "") : "";
  const n = nowCore ? nowCore.replace(/。$/, "") : "";
  const f = futureCore ? futureCore.replace(/。$/, "") : "";
  if (!p && !n && !f) return "";
  // 例：「過去：〜。いま：〜。この先：〜。」
  const parts = [];
  if (p) parts.push(`過去：${p}`);
  if (n) parts.push(`いま：${n}`);
  if (f) parts.push(`この先：${f}`);
  return parts.join("。") + "。";
}
/* ---- 結果上部の“鑑定の結論ブロック”を生成（HTML） ---- */
function buildGlobalSummaryHTML(picked, count){
  try{
    let story = "";
    let step = "";
    let wrap = "";
    if (count === 3){
      const past = picked[0];
      const present = picked[1];
      const future = picked[2];
      const seed = `${past.card.id}|${present.card.id}|${future.card.id}`;
      story = buildThreeReadingStory({
        past,
        present,
        future,
        energyProfile: null
      });
      step = normalizeActionJP(
        extractAction(present.card, present.isReversed) ||
        extractAction(future.card, future.isReversed) ||
        "今日は、整える選択をひとつ。"
      );
      if (typeof buildWrapUpJP === "function") {
        wrap = buildWrapUpJP({
          p0: stripLeadConnectorJP(extractCoreSentence(past.card, past.isReversed)),
          n0: stripLeadConnectorJP(extractCoreSentence(present.card, present.isReversed)),
          f0: stripLeadConnectorJP(extractCoreSentence(future.card, future.isReversed)),
          seed
        }) || "";
      }
    } else {
      const one = picked[0];
      story = `
${ensurePoliteJP(extractCoreSentence(one.card, one.isReversed))}
${inferMeaningLine(extractCoreSentence(one.card, one.isReversed))}
`.trim();
      step = normalizeActionJP(
        extractAction(one.card, one.isReversed) ||
        "今日は、整える選択をひとつ。"
      );
      wrap = "";
    }
    story = polishStoryJP(story);
    story = story
      .replace(/\n*\s*今日の一歩：.*?(?=\n|$)/g, "")
      .replace(/\n*\s*一歩：.*?(?=\n|$)/g, "")
      .replace(/\n*\s*結び：.*?(?=\n|$)/g, "")
      .trim();
    return `
      <section class="globalSummary">
        <div class="gsTitle">鑑定の結論</div>
        <div class="gsLines">
          <div class="gsLine1">${escapeHtml(story).replace(/\n/g,"<br>")}</div>
        </div>
        ${step ? `
          <div class="gsAction">
            <span class="gsActionLabel">今日の一歩</span>
            <div class="gsActionText">${escapeHtml(step)}</div>
          </div>
        ` : ""}
        ${wrap ? `
          <details class="gsWrap">
            <summary>結びをひらく</summary>
            <div class="gsWrapText">${escapeHtml(wrap).replace(/\n/g,"<br>")}</div>
          </details>
        ` : ""}
      </section>
    `;
  } catch(e){
    console.error("[buildGlobalSummaryHTML error]", e);
    return `
      <section class="globalSummary">
        <div class="gsTitle">鑑定の結論</div>
        <div class="gsLines">
          <div class="gsLine1">いまは静かに整える時間です。</div>
        </div>
      </section>
    `;
  }
}
    function renderCard(card, isReversed, positionLabel = "", showDeepRead = true) {
  const safe = (s) => (typeof escapeHtml === "function") ? escapeHtml(s) : s;
  const frontSrc = getCardImageSrc(card);
  const isThree = (positionLabel === "過去" || positionLabel === "現在" || positionLabel === "未来");
  const kwLimit = isThree ? 6 : 6;
  const themes = extractThemes(card);
  const kw = extractKeywords(card, isReversed, kwLimit);
  const core = extractCoreSentence(card, isReversed);
  const interpretation = extractInterpretation(card, isReversed);
  const angel = extractAngel(card, isReversed);
  const action = extractAction(card, isReversed);
  const yn = pickTextByOrientation(card, isReversed, "yes_no");
  const meta = metaLine(card);
  // strengthenCore は「HTMLを返す」想定なので、そのまま埋め込み
  const coreHTML = (typeof strengthenCore === "function")
    ? String(strengthenCore(core, themes) || "")
    : `<div class="coreText">${safe(core)}</div>`;
  const deepReadHTML = showDeepRead ? `
    <details class="deepRead">
      <summary>深読みをひらく</summary>
      ${interpretation ? `
  <div class="cardSection">
    <h4>読み解き</h4>
    <div class="deepText">${safe(interpretation).replace(/\n/g,"<br>")}</div>
  </div>` : ``}
${angel ? `
  <div class="cardSection">
    <h4>天使からの言葉</h4>
    <div class="deepText">${safe(angel).replace(/\n/g,"<br>")}</div>
  </div>` : ``}
${action ? `
  <div class="cardSection">
    <h4>今日の一歩</h4>
    <div class="deepText">${safe(action).replace(/\n/g,"<br>")}</div>
  </div>` : ``}
    </details>
  ` : ``;
  return `
    <div class="tcard ${isReversed ? "reversed" : ""}">
      <div class="tcardHeader">
        <div class="tcardTitle">
          <div class="pos">${safe(positionLabel || "")}</div>
          <div class="name">${safe(card.name_ja)} <span class="sub">(${safe(card.name_en)})</span></div>
          <div class="sub">${safe(meta)}</div>
          ${themes ? `<div class="sub">テーマ：${safe(themes)}</div>` : ``}
        </div>
        <div class="badge ${isReversed ? "rev" : "up"}">${isReversed ? "逆位置" : "正位置"}</div>
      </div>
      <div class="tcardVisual">
        <img class="cardImg ${isReversed ? "reversed" : ""}"
             src="${frontSrc}"
             alt="${safe(card.name_ja || card.name_en || "カード")}"
             onerror="handleCardImgError(this)">
      </div>
      ${yn ? `
        <div class="ynRow">
          <div class="yn ${isReversed ? "rev" : "up"}">YES / NO：${safe(yn)}</div>
        </div>` : ``}
      <div class="tcardBody">
        <div class="line">
          <span class="k">キーワード（${isReversed ? "逆" : "正"}）：</span>
          <div class="kwWrap">
            ${kw.length
              ? kw.map(w => `<span class="kw ${isReversed ? "rev" : "up"}">${safe(w)}</span>`).join("")
              : `<span class="small">（なし）</span>`
            }
          </div>
        </div>
        <div class="corePunch">
          ${coreHTML}
        </div>
        ${deepReadHTML}
      </div>
    </div>
  `;
}
   function handleCardImgError(img) {
  const src = img.getAttribute("src") || "";
  if (src.includes("back.")) return;
  console.warn("[MISSING IMAGE]", src);
  img.src = getBackSrc();
}
function monthStemFrom(yearStem, monthBranch){
  const map = window.YEAR_STEM_TO_TIGER_MONTH_STEM;
  const STEMS = window.STEMS;
  const BRANCHES = window.BRANCHES;
  if(!map || !STEMS || !BRANCHES){
    console.warn("Five elements constants missing");
    return "甲";
  }
  const tigerStem = map[yearStem];
  const monthIndex = BRANCHES.indexOf(monthBranch);
  const stemIndex = (STEMS.indexOf(tigerStem) + monthIndex) % 10;
  return STEMS[stemIndex];
}
// 簡易：節入りの厳密計算はせず、月の範囲で月支を推定（立春＝2/4起点）
function approxMonthBranch(y, m, d){
  // おおよその節入り境界（日本向けのざっくり）
  // 寅:2/4-3/5, 卯:3/6-4/4, 辰:4/5-5/5, 巳:5/6-6/5, 午:6/6-7/6,
  // 未:7/7-8/7, 申:8/8-9/7, 酉:9/8-10/7, 戌:10/8-11/6, 亥:11/7-12/6,
  // 子:12/7-1/5, 丑:1/6-2/3
  const mmdd = m*100 + d;
  if (mmdd >= 204 && mmdd <= 305) return "寅";
  if (mmdd >= 306 && mmdd <= 404) return "卯";
  if (mmdd >= 405 && mmdd <= 505) return "辰";
  if (mmdd >= 506 && mmdd <= 605) return "巳";
  if (mmdd >= 606 && mmdd <= 706) return "午";
  if (mmdd >= 707 && mmdd <= 807) return "未";
  if (mmdd >= 808 && mmdd <= 907) return "申";
  if (mmdd >= 908 && mmdd <= 1007) return "酉";
  if (mmdd >= 1008 && mmdd <= 1106) return "戌";
  if (mmdd >= 1107 && mmdd <= 1206) return "亥";
  if (mmdd >= 1207 || mmdd <= 105) return "子";
  return "丑"; // 1/6-2/3
}
// 立春（2/4）以前は前年扱い（簡易）
function approxYearForFourPillars(y, m, d){
  const mmdd = m*100 + d;
  if (mmdd < 204) return y - 1;
  return y;
}
// JDN（ユリウス日）計算
function toJdn(y, m, d){
  // Gregorian calendar
  const a = Math.floor((14 - m) / 12);
  const y2 = y + 4800 - a;
  const m2 = m + 12*a - 3;
  return d + Math.floor((153*m2 + 2)/5) + 365*y2 + Math.floor(y2/4) - Math.floor(y2/100) + Math.floor(y2/400) - 32045;
}
// ====== Day Ganzhi offset calibration ======
// アンカー: 1980-04-06 は「乙亥」想定（あなたが提示した基準）
function findDayOffsetFor(y, m, d, targetStem, targetBranch){
  const jdn = toJdn(y, m, d);
  for (let off = 0; off < 60; off++){
    const idx = (jdn + off) % 60;
    const stem = STEMS[idx % 10];
    const branch = BRANCHES[idx % 12];
    if (stem === targetStem && branch === targetBranch) return off;
  }
  return null;
}
// ここで offset を確定（見つからなければ旧値49を使う）
const DAY_OFFSET = (()=>{
  const off = findDayOffsetFor(1980, 4, 6, "乙", "亥");
  return (off == null) ? 49 : off;
})();
// 日干支（60干支）: JDN基準から算出
function dayGanzhi(y, m, d){
  const jdn = toJdn(y, m, d);
  const STEMS = window.STEMS;
  const BRANCHES = window.BRANCHES;
  // 念のため保険
  const off = Number.isFinite(window.DAY_OFFSET) ? window.DAY_OFFSET : 49;
  const idx = (jdn + off) % 60;
  const stem = STEMS[idx % 10];
  const branch = BRANCHES[idx % 12];
  return { stem, branch };
}
// 年干支（簡易）：1984=甲子を基準に
function yearGanzhi(y){
  const STEMS = window.STEMS;
  const BRANCHES = window.BRANCHES;
  // guard
  if (!Array.isArray(STEMS) || !Array.isArray(BRANCHES)) {
    console.warn("[yearGanzhi] STEMS/BRANCHES missing", { STEMS, BRANCHES });
    return { stem: "甲", branch: "子" }; // 落とさない保険
  }
  const base = 1984; // 甲子
  const Y = parseInt(y, 10);
  if (!Number.isFinite(Y)) {
    console.warn("[yearGanzhi] invalid year:", y);
    return { stem: "甲", branch: "子" };
  }
  const diff = Y - base;
  const idx = (diff % 60 + 60) % 60;
  return {
    stem: STEMS[idx % 10],
    branch: BRANCHES[idx % 12]
  };
}
// 日干から時干を出す（五鼠遁の起点）
function hourStemFromDayStem(dayStem, hourBranch){
  const map = window.DAY_STEM_TO_HOUR_STEM;
  const STEMS = window.STEMS;
  const BRANCHES = window.BRANCHES;
  const startStem = map[dayStem];
  const hourIndex = BRANCHES.indexOf(hourBranch);
  const stemIndex = (STEMS.indexOf(startStem) + hourIndex) % 10;
  return STEMS[stemIndex];
}
// 五行スコア（天干=強め、地支蔵干=合算）
// ざっくり：干=1.0、支（蔵干合計）=1.0、4柱で最大8前後のイメージ
function calcFiveElements({ yStem,yBranch, mStem,mBranch, dStem,dBranch, hStem,hBranch }){
  const score = { "木":0, "火":0, "土":0, "金":0, "水":0 };
  const addStem = (s, w=1.0)=>{
  if (!s) return;
  const map = window.STEM_TO_ELEM || {};
  const e = map[s];
  if (e) score[e] += w;
};
  const addBranch = (b, w=1.0)=>{
  if (!b) return;
  const dict = window.BRANCH_HIDDEN || {};
  const hidden = dict[b];
  if (!hidden) return;
  for (const [hs, ratio] of hidden){
    addStem(hs, w * ratio);
  }
};
  // 天干（各1）
  addStem(yStem, 1.0); addStem(mStem, 1.0); addStem(dStem, 1.0);
  if (hStem) addStem(hStem, 1.0);
  // 地支（各1）
  addBranch(yBranch, 1.0); addBranch(mBranch, 1.0); addBranch(dBranch, 1.0);
  if (hBranch) addBranch(hBranch, 1.0);
  return score;
}
function toDots(v){
  // 見た目のための丸め：0〜3を中心に
  const n = Math.max(0, Math.min(5, Math.round(v)));
  return "●".repeat(n) + "○".repeat(Math.max(0, 5-n));
}
function pickStrongWeak(score){
  const entries = Object.entries(score).sort((a,b)=>b[1]-a[1]);
  return {
    strong: [entries[0][0], entries[1][0]],
    weak: [entries[4][0], entries[3][0]]
  };
}
function debugFive(dateStr, timeStr){
  dateStr = normalizeDateInput(dateStr);
  timeStr = normalizeTimeInput(timeStr);
  const [y,m,d] = dateStr.split("-").map(n=>parseInt(n,10));
  const fpYear = approxYearForFourPillars(y,m,d);
  const ygz = yearGanzhi(fpYear);
  const mBranch = approxMonthBranch(y,m,d);
  const mStem = monthStemFrom(ygz.stem, mBranch);
  const dgz = dayGanzhi(y,m,d);
  const hBranch = (timeStr && typeof hourBranchFromTime==="function") ? hourBranchFromTime(timeStr) : null;
  const hStem   = (hBranch && typeof hourStemFromDayStem==="function") ? hourStemFromDayStem(dgz.stem, hBranch) : null;
  const score = calcFiveElements({
    yStem: ygz.stem, yBranch: ygz.branch,
    mStem, mBranch,
    dStem: dgz.stem, dBranch: dgz.branch,
    hStem, hBranch
  });
  console.log("INPUT", {dateStr, timeStr});
  console.log("PILLARS", {
    year: `${ygz.stem}${ygz.branch}`,
    month:`${mStem}${mBranch}`,
    day:  `${dgz.stem}${dgz.branch}`,
    hour: hStem && hBranch ? `${hStem}${hBranch}` : "(no hour)"
  });
  console.log("SCORE", score);
  console.log("STRONG/WEAK", pickStrongWeak(score));
  return { ygz, mStem, mBranch, dgz, hStem, hBranch, score };
}
function getWeakElemFromInputs(){
  const uDate = normalizeDateInput(document.getElementById("userBirthdate")?.value);
  const uTime = normalizeTimeInput(document.getElementById("userBirthtime")?.value);
  if (!uDate) return "";
  const [y,m,d] = uDate.split("-").map(n=>parseInt(n,10));
  if (!y || !m || !d) return "";
  const fpYear = approxYearForFourPillars(y,m,d);
  const ygz = yearGanzhi(fpYear);
  const mBranch = approxMonthBranch(y,m,d);
  const mStem = monthStemFrom(ygz.stem, mBranch);
  const dgz = dayGanzhi(y,m,d);
  
const hBranch = hourBranchFromTime(uTime);
const hStem = hBranch ? hourStemFromDayStem(dgz.stem, hBranch) : null;
  const score = calcFiveElements({
    yStem: ygz.stem, yBranch: ygz.branch,
    mStem, mBranch,
    dStem: dgz.stem, dBranch: dgz.branch,
    hStem, hBranch
  });
  const { weak } = pickStrongWeak(score);
  return weak?.[0] || "";
}
function getStrongElemFromInputs(){
  const uDate = normalizeDateInput(document.getElementById("userBirthdate")?.value);
  const uTime = normalizeTimeInput(document.getElementById("userBirthtime")?.value);
  if (!uDate) return "";
  const [y,m,d] = uDate.split("-").map(n=>parseInt(n,10));
  if (!y || !m || !d) return "";
  const fpYear = approxYearForFourPillars(y,m,d);
  const ygz = yearGanzhi(fpYear);
  const mBranch = approxMonthBranch(y,m,d);
  const mStem = monthStemFrom(ygz.stem, mBranch);
  const dgz = dayGanzhi(y,m,d);
  const hBranch = hourBranchFromTime(uTime);
  const hStem = hBranch ? hourStemFromDayStem(dgz.stem, hBranch) : null;
  const score = calcFiveElements({
    yStem: ygz.stem, yBranch: ygz.branch,
    mStem, mBranch,
    dStem: dgz.stem, dBranch: dgz.branch,
    hStem, hBranch
  });
  const { strong } = pickStrongWeak(score);
  return strong?.[0] || "";
}
function elemMeaning(e){
  const map = {
    "木":"育つ力・つながり",
    "火":"情熱・表現",
    "土":"安定・現実化",
    "金":"決断・境界線",
    "水":"感受性・回復",
  };
  return map[e] || "";
}
function buildEnergyDetailHTML(score){
  const { strong, weak } = pickStrongWeak(score);
  const strongData = ELEMENT_SOUL[strong[0]];
  const weakData   = ELEMENT_SOUL[weak[0]];
  if (!strongData || !weakData) return "";
  return `
    <div class="energyBlock">
      <div>
        🔥 強く出ている：${strong[0]}<br>
        <a href="${strongData.strongUrl}" target="_blank" rel="noopener">
          ${strongData.strong}とは？
        </a>
      </div>
      <br>
      <div>
        🌿 今回のテーマに影響する要素：${weak[0]}<br>
        <a href="${weakData.weakUrl}" target="_blank" rel="noopener">
          ${weakData.weak}とは？
        </a>
      </div>
    </div>
  `;
}
function elemKeyJPtoSlug(jp){
  return {
    "木":"wood",
    "火":"fire",
    "土":"earth",
    "金":"metal",
    "水":"water"
  }[jp] || "";
}
function hourBranchFromTime(timeStr){
  const t = normalizeTimeInput(timeStr);
  if (!t) return null;
  const hh = parseInt(t.split(":")[0], 10);
  const idx = Math.floor(((hh + 1) % 24) / 2);
  return window.BRANCHES[idx];
}
function computeElemProfile(dateStr, timeStr){
  dateStr = normalizeDateInput(dateStr);
  timeStr = normalizeTimeInput(timeStr);
  if (!dateStr) return null;
  const [y,m,d] = dateStr.split("-").map(n=>parseInt(n,10));
  const fpYear = approxYearForFourPillars(y,m,d);
  const ygz = yearGanzhi(fpYear);
  const mBranch = approxMonthBranch(y,m,d);
  const mStem = monthStemFrom(ygz.stem, mBranch);
  const dgz = dayGanzhi(y,m,d);
  const hBranch = (timeStr ? hourBranchFromTime(timeStr) : null);
  const hStem   = (hBranch ? hourStemFromDayStem(dgz.stem, hBranch) : null);
  const score = calcFiveElements({
    yStem: ygz.stem, yBranch: ygz.branch,
    mStem, mBranch,
    dStem: dgz.stem, dBranch: dgz.branch,
    hStem, hBranch
  });
  const { strong, weak } = pickStrongWeak(score);
  return { score, strong, weak };
}
function buildGogyouBlock(title, dateStr, timeStr){
  dateStr = normalizeDateInput(dateStr);
  timeStr = normalizeTimeInput(timeStr);
  if (!dateStr) return "";
  const [y,m,d] = dateStr.split("-").map(n=>parseInt(n,10));
  if (!y || !m || !d) return "";
  const fpYear = approxYearForFourPillars(y,m,d);
  const ygz = yearGanzhi(fpYear);
  const mBranch = approxMonthBranch(y,m,d);
  const mStem = monthStemFrom(ygz.stem, mBranch);
  const dgz = dayGanzhi(y,m,d);
  const hBranch = hourBranchFromTime(timeStr);
  const hStem = hBranch ? hourStemFromDayStem(dgz.stem, hBranch) : null;
  const score = calcFiveElements({
    yStem: ygz.stem, yBranch: ygz.branch,
    mStem, mBranch,
    dStem: dgz.stem, dBranch: dgz.branch,
    hStem, hBranch
  });
  const { strong, weak } = pickStrongWeak(score);
  const strongJP = strong?.[0];
  const weakJP = weak?.[0];
  // 状態保存（QuickNav用）
  try {
    window.__gogyouState = window.__gogyouState || { user:null, partner:null };
    const key =
      title === "あなた" ? "user" :
      title === "お相手" ? "partner" :
      null;
    if (key) {
      window.__gogyouState[key] = { score, strong, weak };
    }
  } catch(e){
    console.warn("[gogyouState save skipped]", e);
  }
  const strongSlug = elemKeyJPtoSlug(strongJP);
  const weakSlug = elemKeyJPtoSlug(weakJP);
  const strongHref = strongSlug
    ? `./elements/${strongSlug}-strong.html`
    : "./elements/index.html";
  const weakHref = weakSlug
    ? `./elements/${weakSlug}-weak.html`
    : "./elements/index.html";
  const lines = ["木","火","土","金","水"].map(e=>{
    return `${e}：${toDots(score[e])}　<span class="gogyouSub">${elemMeaning(e)}</span>`;
  }).join("<br>");
  const note = hBranch
    ? `（時刻あり：時柱まで反映）`
    : `（時刻なし：時柱は未反映）`;
  return `
  <div class="gogyouCard">
    <div class="gogyouHead">
      <div class="gogyouTitle">${escapeHtml(title)}の五行</div>
      <div class="gogyouNote">簡易推定 ${note}</div>
    </div>
    <div class="gogyouBody">${lines}</div>
    <div class="gogyouFocus">
      <a class="gogyouTag weak" href="${weakHref}" target="_blank" rel="noopener">
        不足：${weakJP}
      </a>
      <a class="gogyouTag strong" href="${strongHref}" target="_blank" rel="noopener">
        強い：${strongJP}
      </a>
      <div class="gogyouHint">
        不足（${weakJP}）を少し足すと、カードのメッセージが“あなた仕様”に整います。
      </div>
    </div>
  </div>`;
}
// =========================
// Step2: Folded Energy Panel (Gogyou/Numerology gateway)
// - safe: if gogyou functions don't exist, show links only
// =========================
function buildBothGogyouHTML(){
  const uDateRaw = document.getElementById("userBirthdate")?.value || "";
  const uTimeRaw = document.getElementById("userBirthtime")?.value || "";
  const pDateRaw = document.getElementById("partnerBirthdate")?.value || "";
  const pTimeRaw = document.getElementById("partnerBirthtime")?.value || "";
  // 必ず normalize
  const uDate = normalizeDateInput(uDateRaw);
  const uTime = normalizeTimeInput(uTimeRaw);
  const pDate = normalizeDateInput(pDateRaw);
  const pTime = normalizeTimeInput(pTimeRaw);
  // 誕生日が両方ないなら表示しない
  if (!uDate && !pDate) return "";
  // 五行ブロックを作る
  let gogyouHTML = "";
  try{
    if (typeof buildGogyouBlock === "function") {
      let u = "";
      let p = "";
      if (uDate) u = buildGogyouBlock("あなた", uDate, uTime);
      if (pDate) {
        p = buildGogyouBlock("お相手", pDate, pTime);
      } else {
        p = `
          <div class="gogyouCard">
            <div class="gogyouHead">
              <div class="gogyouTitle">お相手の五行</div>
              <div class="gogyouNote">任意</div>
            </div>
            <div class="gogyouBody">※ お相手の生年月日を入れると表示されます</div>
          </div>
        `;
      }
      const wrap = [u, p].filter(Boolean).join("");
      if (wrap) gogyouHTML = `<div class="gogyouWrap">${wrap}</div>`;
    }
  } catch(e){
    console.warn("[buildBothGogyouHTML] failed:", e);
  }
  // 入口リンク
  const links = `
    <div class="energyLinks">
      <a href="./numbers.html" target="_blank" rel="noopener">数秘を詳しく</a>
      <a href="./elements/index.html" target="_blank" rel="noopener">五行を詳しく</a>
    </div>
  `;
  const numerologyHTML =
  (typeof buildNumerologyMiniHTML === "function")
    ? buildNumerologyMiniHTML()
    : "";
  // 折りたたみで返す（ここが最終return）
  return `
    <details class="energyDetails">
      <summary>あなたの設計図を見る（数秘 / 五行）</summary>
      <div class="energyInner">
        <div class="energyMeta">
          ※ 深く知りたい人向け。本文はカードだけで成立するようにしています。
        </div>
        ${links}
        ${numerologyHTML}
        ${gogyouHTML ? `<div style="margin-top:12px;">${gogyouHTML}</div>` : ""}
      </div>
    </details>
  `;
}
function buildNumerologyMiniHTML() {
  const uDate = normalizeDateInput(document.getElementById("userBirthdate")?.value);
  const pDate = normalizeDateInput(document.getElementById("partnerBirthdate")?.value);
  if (!uDate && !pDate) return "";
  let userLp = "";
  let partnerLp = "";
  try {
    if (uDate && typeof calculateLifePath === "function") {
      userLp = calculateLifePath(uDate);
    }
    if (pDate && typeof calculateLifePath === "function") {
      partnerLp = calculateLifePath(pDate);
    }
  } catch (e) {
    console.warn("[buildNumerologyMiniHTML] failed:", e);
  }
  if (!userLp && !partnerLp) return "";
  return `
    <div class="numerologyMini">
      <div class="nmTitle">数秘の番号</div>
      <div class="nmChips">
        ${userLp ? `<div class="nmChip"><span class="nmLabel">あなた</span><span class="nmValue">${userLp}</span></div>` : ""}
        ${partnerLp ? `<div class="nmChip"><span class="nmLabel">お相手</span><span class="nmValue">${partnerLp}</span></div>` : ""}
      </div>
    </div>
  `;
}
function buildGogyouQuickNavHTML(){
  const uDate = normalizeDateInput(document.getElementById("userBirthdate")?.value);
  const uTime = normalizeTimeInput(document.getElementById("userBirthtime")?.value);
  const pDate = normalizeDateInput(document.getElementById("partnerBirthdate")?.value);
  const pTime = normalizeTimeInput(document.getElementById("partnerBirthtime")?.value);
  if (!uDate && !pDate) return "";
  const mkLink = (jp, kind) => {
    const slug = elemKeyJPtoSlug(jp);
    if (!slug) return "./elements/index.html";
    return `./elements/${slug}-${kind}.html`;
  };
  const chip = (label, jp, kind) => jp ? `
    <a class="gqChip ${kind}" href="${mkLink(jp, kind)}" target="_blank" rel="noopener">
      <span class="gqLabel">${label}</span>
      <span class="gqMain">${jp}</span>
      <span class="gqSub">${elemMeaning(jp)}</span>
    </a>
  ` : "";
  const row = (who, prof) => {
    if (!prof) return "";
    return `
      <div class="gqRow">
        <div class="gqWho">${who}</div>
        <div class="gqChips">
          ${chip("不足", prof.weak?.[0], "weak")}
          ${chip("強い", prof.strong?.[0], "strong")}
        </div>
      </div>
    `;
  };
  const uProf = uDate ? computeElemProfile(uDate, uTime) : null;
  const pProf = pDate ? computeElemProfile(pDate, pTime) : null;
  return `
    <section class="gogyouQuickNav">
      <div class="gqTitle">五行の案内（不足 / 強い）</div>
      <div class="gqNote">迷ったら「不足」から読むのがおすすめ。</div>
      ${row("あなた", uProf)}
      ${row("お相手", pProf)}
    </section>
  `;
}
// =========================
// Five Elements -> Soul Theme Links
// =========================
const ELEMENT_SOUL = {
  "木": { strong:"成長を導く魂", weak:"芽吹きを恐れている魂", strongUrl:"./elements/wood-strong.html", weakUrl:"./elements/wood-weak.html" },
  "火": { strong:"情熱を灯す魂", weak:"情熱を思い出す魂", strongUrl:"./elements/fire-strong.html", weakUrl:"./elements/fire-weak.html" },
  "土": { strong:"世界を支える魂", weak:"安心を求める魂", strongUrl:"./elements/earth-strong.html", weakUrl:"./elements/earth-weak.html" },
  "金": { strong:"境界を守る魂", weak:"自分を守りきれない魂", strongUrl:"./elements/metal-strong.html", weakUrl:"./elements/metal-weak.html" },
  "水": { strong:"深く感じ取る魂", weak:"感情を閉じ込めた魂", strongUrl:"./elements/water-strong.html", weakUrl:"./elements/water-weak.html" },
};
    // ---- HTMLエスケープ ----
    function escapeHtml(str) {
      return (str ?? "").toString()
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
    }
    /* =========================================
       ✨ Share & Copy Logic
       ========================================= */
    function getResultPlainText() {
      // 画面上のテキストを一括取得して整形
      const res = document.getElementById("result");
      if (!res || !res.innerText) return "";
      let text = res.innerText;
      // 不要なボタンのテキストを除去
      text = text.replace(/Share This Reading\nShare\nCopy\nShare Image\nもう一度ひく\n数字の意味を詳しく知りたい方はこちら/g, "");
      return text.trim() + "\n\n#AngeliqueTarot\nhttps://angeliquetarot.github.io/";
    }
    function copyResultText() {
      const text = getResultPlainText();
      if (!text) return;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
          showToast("コピーしました");
        }).catch(err => {
          console.error("Copy failed", err);
          fallbackCopyText(text);
        });
      } else {
        fallbackCopyText(text);
      }
    }
    function fallbackCopyText(text) {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      // 表示領域外に
      textArea.style.position = "fixed";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        const successful = document.execCommand('copy');
        if (successful) showToast("コピーしました");
        else showToast("コピーに失敗しました");
      } catch (err) {
        console.error('Fallback copy fail', err);
        showToast("コピーに失敗しました");
      }
      document.body.removeChild(textArea);
    }
    async function shareResultText() {
      const text = getResultPlainText();
      if (!text) return;
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'Angelique Tarot Reading',
            text: text
          });
          showToast("シェアしました！");
        } catch (err) {
          console.error("Share failed or was cancelled:", err);
          // 失敗またはキャンセルされた場合は確実にクリップボードコピーへ
          copyResultText();
        }
      } else {
        // フォールバック: コピー
        copyResultText();
      }
    }
    // =========================
// Share helpers (ONE PLACE)
// =========================
function shortenJP(s, max = 40){
  const t = String(s || "").trim();
  if (!t) return "";
  return t.length > max ? (t.slice(0, max) + "…") : t;
}
function loadImageSafe(src){
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve({ ok:true, img });
    img.onerror = () => resolve({ ok:false, img:null });
    img.src = src;
  });
}
function drawCardOnCanvas(ctx, item, x, y, w, h) {
  if (!item?.img) return;
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.8)";
  ctx.shadowBlur = 20;
  ctx.shadowOffsetY = 10;
  if (item.isReversed) {
    ctx.translate(x + w / 2, y + h / 2);
    ctx.rotate(Math.PI);
    ctx.drawImage(item.img, -w / 2, -h / 2, w, h);
  } else {
    ctx.drawImage(item.img, x, y, w, h);
  }
  ctx.restore();
}
    // --- Share Image (Canvas) ---
    async function shareResultImage() {
  const canvas = document.getElementById("shareCanvas");
  if (!canvas) { showToast("Canvasが見つかりません"); return; }
  const ctx = canvas.getContext("2d");
  if (!ctx) { showToast("Canvas描画に失敗しました"); return; }
  // 1. 背景描画 (暗いトーン)
  ctx.fillStyle = "#11111d";
  ctx.fillRect(0, 0, 1080, 1080);
  // 上部のグラデーション
  let grad = ctx.createLinearGradient(0, 0, 0, 400);
  grad.addColorStop(0, "rgba(245, 230, 179, 0.15)");
  grad.addColorStop(1, "rgba(17, 17, 29, 0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1080, 1080);
  // 2. 金色の枠線
  ctx.strokeStyle = "rgba(214, 178, 94, 0.4)";
  ctx.lineWidth = 4;
  ctx.strokeRect(40, 40, 1000, 1000);
  ctx.strokeStyle = "rgba(214, 178, 94, 0.15)";
  ctx.lineWidth = 1;
  ctx.strokeRect(50, 50, 980, 980);
  // 3. タイトル
  ctx.fillStyle = "#f5e6b3"; // pale gold
  ctx.font = "40px 'Cinzel', serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText("Angelique Tarot", 540, 80);
  const today = new Date();
  const dateStr = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, "0")}.${String(today.getDate()).padStart(2, "0")}`;
  ctx.font = "24px 'Cinzel', serif";
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.fillText(dateStr, 540, 130);
    // 4. 画像の描画 (現在表示されているカード画像を集める)
  const imgs = document.querySelectorAll("#result .cardImg");
  if (imgs.length === 0) {
    showToast("カード画像がありません");
    return;
  }
  const drawMode = document.querySelector('input[name="drawMode"]:checked')?.value || "1";
  const count = (String(drawMode) === "3") ? 3 : 1;
  const cardW = count === 1 ? 300 : 240;
  const cardH = count === 1 ? 480 : 384;
  const startY = 220;
  // ✅ loadImg はもう不要（消す）
  const promises = [];
  const cardElements = document.querySelectorAll("#result .tcard");
  cardElements.forEach(cel => {
    const imgEl = cel.querySelector("img");
    if (!imgEl) return;
    const isReversed =
      cel.querySelector(".badge")?.classList.contains("rev") ||
      imgEl.classList.contains("reversed");
    promises.push(
      loadImageSafe(imgEl.src).then(r => ({ ...r, isReversed }))
    );
  }); // ← ★forEach を閉じる
  const loadedImgs = await Promise.all(promises);
  const validImgs = loadedImgs.filter(item => item.ok);
  if (validImgs.length === 1) {
    drawCardOnCanvas(ctx, validImgs[0], 540 - cardW / 2, startY, cardW, cardH);
  } else if (validImgs.length === 3) {
    const gap = 40;
    const totalW = cardW * 3 + gap * 2;
    const startX = 540 - totalW / 2;
    drawCardOnCanvas(ctx, validImgs[0], startX, startY, cardW, cardH);
    drawCardOnCanvas(ctx, validImgs[1], startX + cardW + gap, startY, cardW, cardH);
    drawCardOnCanvas(ctx, validImgs[2], startX + (cardW + gap) * 2, startY, cardW, cardH);
  } else {
    showToast("画像の読み込みに失敗しました");
    return;
  }
  // 5. 結論テキスト
  const summaryTitleEl = document.querySelector("#result .summaryTitle");
  if (summaryTitleEl) {
    ctx.font = "bold 28px 'Noto Serif JP', serif";
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    drawWrappedText(ctx, summaryTitleEl.innerText.replace("【結論】", ""),540, startY + cardH + 60, 960, 40, 3);
  }
  // --- 1行要約（鑑定の一文）を描画 ---
const one = shortenJP(String(window.__shareOneLine || "").trim(), 56);
if (one) {
  ctx.save();
  ctx.globalAlpha = 0.92;
  ctx.font = "26px 'Noto Serif JP', serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillStyle = "rgba(255,255,255,0.90)";
  const maxWidth = 760;     // 文章エリアの横幅
  const lineHeight = 42;    // 行間
  const startY = canvas.height - 185;
  const lineCount = drawWrappedText(
    ctx,
    one,
    canvas.width / 2,
    startY,
    maxWidth,
    lineHeight
  );
  ctx.restore();
}
  // Footer
  ctx.font = "20px 'Noto Serif JP', serif";
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.fillText("Search 'Angelique Tarot' to pull your own cards.", 540, 980);
    // 6. 出力（PNG化して、スマホ=共有 / PC=モーダル表示）
  canvas.toBlob(async (blob) => {
    if (!blob) {
      showToast("画像の生成に失敗しました");
      fallbackCopyText(getResultPlainText());
      return;
    }
    const file = new File([blob], "reading.png", { type: "image/png" });
    // ✅ PCは共有シートを使わず、モーダルで画像を見せる
    if (!isProbablyMobile()) {
      openImageFallbackFromBlob(blob);
      return;
    }
    // ✅ スマホは Share API が使えるなら使う
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: "Angelique Tarot Reading",
          text: "私のタロットリーディング結果です #AngeliqueTarot"
        });
        showToast("画像をシェアしました！");
      } catch (err) {
        console.error("Image Share failed or cancelled:", err);
        // キャンセル時はモーダルへ
        openImageFallbackFromBlob(blob);
      }
    } else {
      openImageFallbackFromBlob(blob);
    }
  }, "image/png");
}
function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight, maxLines = 2) {
  const chars = String(text || "").split("");
  let line = "";
  const lines = [];
  for (const ch of chars) {
    const test = line + ch;
    const w = ctx.measureText(test).width;
    if (w > maxWidth && line) {
      lines.push(line);
      line = ch;
      if (lines.length === maxLines - 1) {
        break;
      }
    } else {
      line = test;
    }
  }
  // 残り文字を最後の行に入れる
  if (line) {
    let rest = line + chars.slice(lines.join("").length + line.length).join("");
    while (ctx.measureText(rest).width > maxWidth && rest.length > 1) {
      rest = rest.slice(0, -1);
    }
    const original = String(text || "");
    const consumed = lines.join("").length + rest.length;
    if (consumed < original.length) {
      rest = rest.replace(/…?$/, "") + "…";
    }
    lines.push(rest);
  }
  lines.slice(0, maxLines).forEach((ln, i) => {
    ctx.fillText(ln, x, y + i * lineHeight);
  });
  return lines.length;
}
// ✅ ここは shareResultImage の「外」に置く（超重要）
function openImageFallbackFromBlob(blob) {
  showToast("画像を表示しました。右クリック/長押しで保存できます", 3500);
  const modal = document.getElementById("shareModal");
  const imgEl = document.getElementById("shareModalImg");
  const dl = document.getElementById("shareModalDownload");
  const openBtn = document.getElementById("shareModalOpen");
  const closeBtn = document.getElementById("shareModalClose");
  if (!modal || !imgEl || !dl || !closeBtn || !openBtn) {
    fallbackCopyText(getResultPlainText());
    showToast("画像表示UIが見つかりません。テキストをコピーしました。", 4000);
    return;
  }
  const url = URL.createObjectURL(blob);
  imgEl.src = url;
  dl.href = url;
  openBtn.href = url;
  modal.style.display = "block";
  const close = () => {
    modal.style.display = "none";
    try { URL.revokeObjectURL(url); } catch {}
    closeBtn.removeEventListener("click", close);
    modal.removeEventListener("click", onBg);
  };
  const onBg = (e) => {
    if (e.target === modal) close();
  };
  closeBtn.addEventListener("click", close);
  modal.addEventListener("click", onBg);
}
    
  