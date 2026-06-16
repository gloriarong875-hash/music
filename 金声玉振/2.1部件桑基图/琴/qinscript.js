/*
  中文脚注（交互脚本说明）
  - 本脚本负责 3.1 琴页面左侧结构悬停、右侧桑基图和 tooltip 考据卡片。
  - 修改桑基数据：编辑 `sankeyRows`，字段对应 Excel《材质产地八音.xlsx》的“古琴”sheet。
  - 修改部件说明：编辑 `partInfo`；修改配色：编辑 `allowedColors` 和 `nodeColorMap`。
*/

const partInfo = {
  "面板": {
    title: "面板",
    body: "面板多取陈年杉木或桐木，手工凿挖出琴腹腔、槽腹与纳音，决定古琴中空、松透的共鸣底色。"
  },
  "底板": {
    title: "底板",
    body: "底板多用坚硬梓木，开凿龙池、凤沼两个泄音共鸣孔，与面板形成“桐天梓地”的声学结构。"
  },
  "灰胎": {
    title: "灰胎",
    body: "灰胎由天然大漆、鹿角霜粉等层层刮涂打磨而成，既保护木胎，也通过微观配重调节音色。"
  },
  "琴弦": {
    title: "琴弦",
    body: "琴弦以太湖蚕丝熟丝绞合而成，承载古琴走手音、吟猱绰注与静美和雅的丝音气质。"
  },
  "配件": {
    title: "配件",
    body: "配件包含岳山、雁足、轸子等承弦扣位，常取珍稀红木车旋打磨，负责锁定弦压并传导振动。"
  }
};

const partTitle = document.getElementById("partTitle");
const partBody = document.getElementById("partBody");
const hoverTargets = [...document.querySelectorAll("[data-part]")];
const partInfoEl = document.querySelector(".part-info");

function setPart(name) {
  const info = partInfo[name] || partInfo["面板"];
  partTitle.textContent = info.title;
  partBody.textContent = info.body;
  hoverTargets.forEach((el) => el.classList.toggle("is-hot", el.dataset.part === name));
  if (partInfoEl) partInfoEl.classList.add("visible");
}

hoverTargets.forEach((el) => {
  el.addEventListener("mouseenter", () => setPart(el.dataset.part));
  el.addEventListener("focus", () => setPart(el.dataset.part));
  el.addEventListener("click", () => setPart(el.dataset.part));
  el.addEventListener("mouseleave", () => {
    if (partInfoEl) partInfoEl.classList.remove("visible");
    hoverTargets.forEach((node) => node.classList.remove("is-hot"));
  });
  el.addEventListener("blur", () => {
    if (partInfoEl) partInfoEl.classList.remove("visible");
    hoverTargets.forEach((node) => node.classList.remove("is-hot"));
  });
  if (el.classList.contains("orbit-node")) el.tabIndex = 0;
});

function expandStructure() {
  document.body.classList.add("is-expanded");
}

window.setTimeout(expandStructure, 980);
setPart("面板");
if (partInfoEl) partInfoEl.classList.remove("visible");

const allowedColors = {
  /* 中文脚注：桑基图色板与 3.1 笙、鼓、埙保持一致；如需整体换色，建议四个 3.1 页面同步改。 */
  c1: "#EEE7CB",
  c2: "#EFD67D",
  c3: "#E0A36E",
  c4: "#BA494C",
  c5: "#9D2D2E",
  c6: "#D7B1DB",
  c7: "#9CC5C1",
  c8: "#4F768D",
  c9: "#A7C6A4",
  c10: "#657E62",
  c11: "#464ea8"
};

/* 中文脚注：古琴 sheet 数据。value 控制桑基流线粗细，数值越大视觉权重越高。 */
const sankeyRows = [
  {
    part: "面板",
    process: "手工挖办",
    origin: "江汉荆楚",
    material: "古材杉木",
    bayin: "木",
    value: 9,
    processText: "挑选陈年老杉木或桐木房梁，纯手工凿挖出琴腹腔、槽腹及纳音。",
    originText: "斲琴师崇尚两湖腹地与中原的老木料，如旧房梁、独木枯桐，水分早已干绝。",
    materialText: "陈年老杉木的纤维内部蜂窝孔早已干枯，能产生太古般中空、松透的声学导音。",
    bayinText: "【木音】太古共鸣之腹。槽腹与纳音的雕挖深浅直接决定古琴九德音色。"
  },
  {
    part: "底板",
    process: "手工挖办",
    origin: "江汉荆楚",
    material: "坚硬梓木",
    bayin: "木",
    value: 7,
    processText: "用梓木雕挖出琴底板，并开凿出龙池、凤沼两个泄音共鸣孔。",
    originText: "梓木质地硬于桐杉，主要产自长江中游及华中平原，为木中之良材。",
    materialText: "坚硬梓木作为琴底，与松透的面板形成“桐天梓地”的刚柔搭配，锁死共鸣。",
    bayinText: "【木音】太古共鸣之腹。底梓面桐的结构让声音在腔内激荡后由池沼流出。"
  },
  {
    part: "灰胎",
    process: "大漆髹饰",
    origin: "西南山地",
    material: "纯正大漆",
    bayin: "土",
    value: 4,
    processText: "将天然生漆混合鹿角霜粉调制成灰胎，层层刮涂在木胎表面并打磨。",
    originText: "云贵及巴蜀大漆品质冠绝全国，其高分子结构能完美包裹木胎历千年不裂。",
    materialText: "大漆属于天然环氧树脂，固化后形成坚硬坚固的漆壳，死死锁住共鸣。",
    bayinText: "【土音】漆骨矿物之聚。鹿角霜灰胎能防止木质因弦压变形。"
  },
  {
    part: "灰胎",
    process: "微观配重",
    origin: "西北牧区",
    material: "鹿角霜粉",
    bayin: "土",
    value: 2,
    processText: "在灰胎中精确调入鹿角霜与瓦灰比例，通过改变表面质量来控制音色。",
    originText: "北方及西北秦岭、陇山林区捕猎所得的野生鹿角，是熬制鹿角霜的上材。",
    materialText: "鹿角骨粉具有中空海绵状微观结构，混入漆层能使琴音透亮不发闷。",
    bayinText: "【土音】漆骨矿物之聚。鹿角霜灰胎能防止木质因弦压变形。"
  },
  {
    part: "琴弦",
    process: "熟丝绞合",
    origin: "江南竹乡",
    material: "太湖蚕丝",
    bayin: "丝",
    value: 8,
    processText: "将上等蚕丝在生漆水中绞制，运用传统手工绞绳工艺制成古琴丝弦。",
    originText: "传统“太湖弦”采用苏杭太湖流域的七茧丝，纤维极长且张力极大。",
    materialText: "上等生丝经多股绞合后具有极强的韧性与抗拉张力，构成传统走手音的基础。",
    bayinText: "【丝音】静美和雅之韵。丝弦摩擦产生的“走手音”是古琴艺术的最高美学。"
  },
  {
    part: "配件",
    process: "车旋打磨",
    origin: "西南山地",
    material: "珍稀红木",
    bayin: "木",
    value: 3,
    processText: "对岳山、雁足、轸子等承弦扣位硬木进行精细的车旋切削与抛光。",
    originText: "西南边疆及热带林区盛产高密度、高反射率的红木与硬质玉石材料。",
    materialText: "岳山雁足承载了全器七根丝弦的绝对弦压，非高硬度名贵红木莫属。",
    bayinText: "【木音】承弦传导之枢。硬木岳山将丝弦的张力毫无损耗地锁死并传给面板。"
  }
];

const nodeColorMap = {
  "面板": allowedColors.c10,
  "底板": allowedColors.c11,
  "灰胎": allowedColors.c3,
  "琴弦": allowedColors.c6,
  "配件": allowedColors.c8,
  "手工挖办": allowedColors.c10,
  "大漆髹饰": allowedColors.c4,
  "微观配重": allowedColors.c3,
  "熟丝绞合": allowedColors.c6,
  "车旋打磨": allowedColors.c8,
  "江汉荆楚": allowedColors.c7,
  "西南山地": allowedColors.c4,
  "西北牧区": allowedColors.c3,
  "江南竹乡": allowedColors.c9,
  "古材杉木": allowedColors.c10,
  "坚硬梓木": allowedColors.c11,
  "纯正大漆": allowedColors.c4,
  "鹿角霜粉": allowedColors.c3,
  "太湖蚕丝": allowedColors.c6,
  "珍稀红木": allowedColors.c8,
  "木": allowedColors.c10,
  "土": allowedColors.c3,
  "丝": allowedColors.c6
};

function makeKey(source, target) {
  return `${source}_${target}`;
}

const edgeTextMap = {};
const nodeTextMap = {};

sankeyRows.forEach((row) => {
  edgeTextMap[makeKey(row.part, row.process)] = { title: "【考据 · 工艺】", body: row.processText };
  edgeTextMap[makeKey(row.process, row.origin)] = { title: "【考据 · 产地】", body: row.originText };
  edgeTextMap[makeKey(row.origin, row.material)] = { title: "【考据 · 材质】", body: row.materialText };
  edgeTextMap[makeKey(row.material, row.bayin)] = { title: `【考据 · ${row.bayin}】`, body: row.bayinText };

  nodeTextMap[row.part] = { title: `【部件】${row.part}`, body: partInfo[row.part]?.body || "" };
  nodeTextMap[row.process] = { title: `【工艺】${row.process}`, body: row.processText };
  nodeTextMap[row.origin] = { title: `【产地】${row.origin}`, body: row.originText };
  nodeTextMap[row.material] = { title: `【材质】${row.material}`, body: row.materialText };
  nodeTextMap[row.bayin] = { title: `【八音】${row.bayin}`, body: row.bayinText };
});

function addLink(links, source, target, value) {
  const existing = links.find((link) => link.source === source && link.target === target);
  if (existing) existing.value += value;
  else links.push({ source, target, value });
}

const sankeyLinks = [];
sankeyRows.forEach((row) => {
  addLink(sankeyLinks, row.part, row.process, row.value);
  addLink(sankeyLinks, row.process, row.origin, row.value);
  addLink(sankeyLinks, row.origin, row.material, row.value);
  addLink(sankeyLinks, row.material, row.bayin, row.value);
});

const fallbackColumns = [
  ["面板", "底板", "灰胎", "琴弦", "配件"],
  ["手工挖办", "大漆髹饰", "微观配重", "熟丝绞合", "车旋打磨"],
  ["江汉荆楚", "西南山地", "西北牧区", "江南竹乡"],
  ["古材杉木", "坚硬梓木", "纯正大漆", "鹿角霜粉", "太湖蚕丝", "珍稀红木"],
  ["木", "土", "丝"]
];

function formatTip(title, body) {
  return `<div style="font-family: FZLiShu, Microsoft YaHei, serif; max-width:320px;white-space:normal;word-break:break-all;">
    <strong style="color:#EFD67D;font-size:14px;letter-spacing:1px;">${title}</strong><br/>
    <p style="margin:6px 0 0;color:#EEE7CB;">${body}</p>
  </div>`;
}

function tooltipFormatter(params) {
  if (params.dataType === "edge") {
    const edgeInfo = edgeTextMap[makeKey(params.data.source, params.data.target)];
    if (edgeInfo) return formatTip(edgeInfo.title, edgeInfo.body);
  }

  const nodeInfo = nodeTextMap[params.name];
  if (nodeInfo) return formatTip(nodeInfo.title, nodeInfo.body);
  return `<div style="font-family: FZLiShu, Microsoft YaHei, serif;"><strong style="color:#EFD67D;">${params.name}</strong></div>`;
}

function renderEchartsSankey() {
  const chartDom = document.getElementById("sankey-chart");
  if (!window.echarts) {
    renderFallbackSankey(chartDom);
    return;
  }

  const chart = echarts.init(chartDom);
  chart.setOption({
    backgroundColor: "transparent",
    tooltip: {
      trigger: "item",
      triggerOn: "mousemove",
      backgroundColor: "rgba(15, 15, 15, 0.98)",
      borderColor: "#361E19",
      borderWidth: 1,
      padding: [14, 18],
      textStyle: {
        color: allowedColors.c1,
        fontSize: 16,
        fontFamily: "FZLiShu, Microsoft YaHei, serif",
        lineHeight: 22
      },
      confine: true,
      formatter: tooltipFormatter
    },
    series: [{
      type: "sankey",
      layout: "none",
      left: "9%",
      right: "10%",
      top: "11%",
      bottom: "8%",
      nodeGap: 22,
      nodeWidth: 14,
      itemStyle: {
        borderWidth: 0,
        borderColor: "#000000"
      },
      focusNodeAdjacency: "none",
      levels: [
        { depth: 0, label: { position: "left", color: allowedColors.c1, fontSize: 15 } },
        { depth: 1, label: { position: "top", color: allowedColors.c1, fontSize: 15, dy: -8 } },
        { depth: 2, label: { position: "bottom", color: allowedColors.c1, fontSize: 15, dy: 8 } },
        { depth: 3, label: { position: "top", color: allowedColors.c1, fontSize: 15, dy: -8 } },
        { depth: 4, label: { position: "right", color: allowedColors.c1, fontSize: 15 } }
      ],
      data: Object.keys(nodeColorMap).map((name) => ({
        name,
        itemStyle: { color: nodeColorMap[name] }
      })),
      links: sankeyLinks,
      lineStyle: {
        color: "gradient",
        curveness: .6,
        opacity: .5
      },
      label: {
        color: allowedColors.c1,
        fontFamily: "FZLiShu, Microsoft YaHei, serif"
      },
      animation: true,
      animationDuration: 3500,
      animationEasing: "quadraticOut",
      animationDelay: (idx) => idx * 130
    }]
  });

  window.addEventListener("resize", () => chart.resize());
}

function renderFallbackSankey(container) {
  const width = 980;
  const height = 640;
  const xPositions = [50, 270, 488, 700, 910];
  const nodeMap = new Map();

  fallbackColumns.forEach((names, col) => {
    const gap = height / (names.length + 1);
    names.forEach((name, index) => {
      nodeMap.set(name, {
        name,
        x: xPositions[col],
        y: gap * (index + 1),
        color: nodeColorMap[name] || allowedColors.c1
      });
    });
  });

  const linkMarkup = sankeyLinks.map((link) => {
    const source = nodeMap.get(link.source);
    const target = nodeMap.get(link.target);
    const stroke = source.color;
    const thickness = Math.max(3, link.value * 1.8);
    const c1 = source.x + 96;
    const c2 = target.x - 96;
    const d = `M ${source.x + 12} ${source.y} C ${c1} ${source.y}, ${c2} ${target.y}, ${target.x - 12} ${target.y}`;
    return `<path class="fallback-link" d="${d}" stroke="${stroke}" stroke-width="${thickness}">
      <title>${link.source} → ${link.target}：${link.value}</title>
    </path>`;
  }).join("");

  const nodeMarkup = [...nodeMap.values()].map((node) => {
    const textX = node.x < 120 ? node.x - 16 : node.x + 18;
    const anchor = node.x < 120 ? "end" : "start";
    return `<g class="fallback-node">
      <rect x="${node.x - 7}" y="${node.y - 22}" width="14" height="44" fill="${node.color}"></rect>
      <text x="${textX}" y="${node.y}" text-anchor="${anchor}" style="font-family: FZLiShu, Microsoft YaHei, serif;">${node.name}</text>
      <title>${node.name}</title>
    </g>`;
  }).join("");

  container.innerHTML = `<svg class="fallback-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="琴桑基图备用 SVG">
    <defs>
      <filter id="fallbackGlow">
        <feGaussianBlur stdDeviation="2.2" result="blur"></feGaussianBlur>
        <feMerge>
          <feMergeNode in="blur"></feMergeNode>
          <feMergeNode in="SourceGraphic"></feMergeNode>
        </feMerge>
      </filter>
    </defs>
    <rect width="${width}" height="${height}" fill="transparent"></rect>
    <g filter="url(#fallbackGlow)">${linkMarkup}</g>
    <g>${nodeMarkup}</g>
  </svg>`;
}

if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(() => renderEchartsSankey());
} else {
  renderEchartsSankey();
}
