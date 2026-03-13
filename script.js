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
window.DAY_OFFSET = window.DAY_OFFSET ?? 49;
