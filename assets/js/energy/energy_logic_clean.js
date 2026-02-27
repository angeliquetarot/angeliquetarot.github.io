// --- Numerology Logic ---
const NUMEROLOGY_DATA = {
    1: { lp: "自らの足で立ち、新しい道を切り開く開拓者のエネルギー" },
    2: { lp: "人の心に寄り添い、細やかな気配りで調和を生み出すサポーター" },
    3: { lp: "無邪気な子供のように楽しみ、周囲を明るく照らす表現者" },
    4: { lp: "誠実に物事に取り組み、揺るがない安心の土台を築く職人" },
    5: { lp: "好奇心の赴くままに未体験の世界を飛び回る、自由な冒険者" },
    6: { lp: "深い愛情と責任感で、身近な人に美しい調和をもたらす奉仕者" },
    7: { lp: "目に見えない本質を探求し、独自の哲学を深めていく孤高の探求者" },
    8: { lp: "現実世界で確かな豊かさを手に入れ、それを社会に還元する実行者" },
    9: { lp: "すべてを受け入れる海のような器で、人々の心を癒やす手放しの達人" },
    11: { lp: "天からの直感を受け取り、それを人々に伝える神聖なメッセンジャー" },
    22: { lp: "高い理想を現実の世界に引き下ろし、誰もが驚く規模で形にする構築者" },
    33: { lp: "見返りを求めない普遍的な愛で、世界を包み込むような菩薩のエネルギー" }
};

function reduceToSingleDigitOrMaster(num) {
    if (num === 0) return 0;
    let current = num;
    while (current > 9 && current !== 11 && current !== 22 && current !== 33) {
        let sum = 0;
        let str = current.toString();
        for (let i = 0; i < str.length; i++) {
            sum += parseInt(str[i], 10);
        }
        current = sum;
    }
    return current;
}

function calculateLifePath(dateString) {
    if (!dateString) return null;
    const parts = dateString.split("-");
    if (parts.length !== 3) return null;
    const year = parts[0];
    const month = parts[1];
    const day = parts[2];

    const yNum = reduceToSingleDigitOrMaster(parseInt(year, 10));
    const mNum = reduceToSingleDigitOrMaster(parseInt(month, 10));
    const dNum = reduceToSingleDigitOrMaster(parseInt(day, 10));

    return reduceToSingleDigitOrMaster(yNum + mNum + dNum);
}

// --- Nine Star Ki Logic ---
const STAR_DATA = {
    1: { name: "一白水星", element: "水", theme: "柔軟性と深い洞察" },
    2: { name: "二黒土星", element: "土", theme: "育成と堅実さ" },
    3: { name: "三碧木星", element: "木", theme: "若々しい躍動と直感" },
    4: { name: "四緑木星", element: "木", theme: "調和とご縁" },
    5: { name: "五黄土星", element: "土", theme: "中心と圧倒的な力" },
    6: { name: "六白金星", element: "金", theme: "高潔さと完璧" },
    7: { name: "七赤金星", element: "金", theme: "喜びと豊かさ" },
    8: { name: "八白土星", element: "土", theme: "変化と蓄積" },
    9: { name: "九紫火星", element: "火", theme: "情熱と美意識" }
};

function getHonmeiStar(year, month, day) {
    let y = parseInt(year, 10);
    const m = parseInt(month, 10);
    const d = parseInt(day, 10);

    // 節分(2月4日)を年の境界とする簡易判定
    if (m === 1 || (m === 2 && d < 4)) {
        y -= 1;
    }

    // 九星本命星の計算 (11 - (西暦の各位の和) % 9)
    let ySum = 0;
    let yStr = y.toString();
    for (let i = 0; i < yStr.length; i++) {
        ySum += parseInt(yStr[i], 10);
    }
    while (ySum > 9) {
        let temp = 0;
        let tempStr = ySum.toString();
        for (let j = 0; j < tempStr.length; j++) {
            temp += parseInt(tempStr[j], 10);
        }
        ySum = temp;
    }
    let star = 11 - ySum;
    if (star > 9) star -= 9;
    if (star <= 0) star += 9;
    return star;
}
