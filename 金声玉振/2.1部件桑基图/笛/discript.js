/*
  中文脚注（交互脚本说明）
  - 本脚本负责左侧笛结构图悬停说明，以及右侧“部件 → 工艺 → 产地 → 材质 → 八音”的桑基图。
  - 修改桑基数据：编辑 `sankeyRows`；字段对应 Excel 的部件、制作工艺、材料产地、对应材质、对应八音与四列考据文字。
  - 修改颜色：编辑 `allowedColors` 或 `nodeColorMap`。
  - 修改部件说明：编辑 `partInfo`。
*/

const partInfo = {
  "笛身": {
    "title": "笛身",
    "body": "笛身由苦竹修治成管，是横吹空气柱共鸣的主体。烘烤矫直与扎线固护共同保证管体笔直、抗裂并保持稳定音准。"
  },
  "笛膜": {
    "title": "笛膜",
    "body": "笛膜多取芦苇内壁薄膜，贴覆于膜孔后随气流振动，形成笛子明亮、清脆且带有颤动感的独特音色。"
  },
  "镶头": {
    "title": "镶头",
    "body": "镶头以牛角或硬质骨角制成，嵌护笛端以防竹管开裂，同时也参与管体配重与手感平衡。"
  }
};

const partTitle = document.getElementById("partTitle");
const partBody = document.getElementById("partBody");
const hoverTargets = [...document.querySelectorAll("[data-part]")];
const partInfoEl = document.querySelector(".part-info");

function setPart(name) {
  const info = partInfo[name] || partInfo["笛身"];
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

function expandStructure() { document.body.classList.add("is-expanded"); }
window.setTimeout(expandStructure, 980);
setPart("笛身");
if (partInfoEl) partInfoEl.classList.remove("visible");

const allowedColors = {
  c1: "#EEE7CB", c2: "#EFD67D", c3: "#E0A36E", c4: "#BA494C", c5: "#9D2D2E",
  c6: "#D7B1DB", c7: "#9CC5C1", c8: "#4F768D", c9: "#A7C6A4", c10: "#657E62", c11: "#361E19"
};

const sankeyRows = [
  {
    "part": "笛身",
    "process": "烘烤矫直",
    "origin": "江南竹乡",
    "material": "优质苦竹",
    "bayin": "竹",
    "value": 5,
    "processText": "利用炭火高温软化天然苦竹，通过矫竹工具消除竹材的天然弯曲。",
    "originText": "历代制笛公认江南竹乡（如杭州余杭中泰）的苦竹其纤维结构最利于发声。",
    "materialText": "苦竹的竹质较为松透而富有弹性，能够完美适应吹奏时横向高频共鸣气流。",
    "bayinText": "【竹音】横吹管乐之翘楚。笛身通过空气柱振动，音色清脆高亢。"
  },
  {
    "part": "笛身",
    "process": "扎线",
    "origin": "江南竹乡",
    "material": "强韧丝线",
    "bayin": "竹",
    "value": 5,
    "processText": "在笛身外部用丝线进行紧密缠绕并固漆，防止竹管因气候干燥而开裂。",
    "originText": "江南丝织业与老漆作坊为笛身扎线提供了兼具高韧性与防潮力的原材料。",
    "materialText": "高拉力生丝线在表面髹漆后能紧紧勒住竹身，提供强大的横向抗物理拉力。",
    "bayinText": "【竹音】横吹管乐之翘楚。笛身通过空气柱振动，音色清脆高亢。"
  },
  {
    "part": "笛膜",
    "process": "安弦设轴",
    "origin": "江汉荆楚",
    "material": "野生苇膜",
    "bayin": "竹",
    "value": 4,
    "processText": "将采集的芦苇嫩皮用阿胶或大蒜汁平整地贴覆在膜孔上，调整松紧度。",
    "originText": "江汉荆楚大江大湖沿岸盛产优质野生芦苇，其内壁苇膜薄如蝉翼。",
    "materialText": "野生芦苇内壁的苇膜薄且弹性模量极高，气流冲撞时能产生独特的明亮清脆音。",
    "bayinText": "【竹音】随风激荡之韵。笛膜赋予笛子特有的清脆、明亮和颤动音色。"
  },
  {
    "part": "镶头",
    "process": "车旋打磨",
    "origin": "江汉荆楚",
    "material": "防裂牛角",
    "bayin": "木",
    "value": 3,
    "processText": "将硬质牛骨或牛角通过车床车旋雕琢出契合笛端的防护镶头并抛光。",
    "originText": "江汉平原蓄牧区的水牛角产量极丰、质地紧密，是传统笛头防裂的最佳材质。",
    "materialText": "水牛角本身纤维致密、绝不缩水，镶嵌在笛端能永久卡死、锁紧竹材防止开裂。",
    "bayinText": "【木音】防护构件之骨。镶头保护笛端，同时起到调节管体声学配重的作用。"
  }
];
const nodeColorMap = {
  "笛身": "#657E62",
  "烘烤矫直": "#EFD67D",
  "江南竹乡": "#E0A36E",
  "优质苦竹": "#BA494C",
  "竹": "#A7C6A4",
  "扎线": "#D7B1DB",
  "强韧丝线": "#9CC5C1",
  "笛膜": "#A7C6A4",
  "安弦设轴": "#A7C6A4",
  "江汉荆楚": "#657E62",
  "野生苇膜": "#361E19",
  "镶头": "#EFD67D",
  "车旋打磨": "#EFD67D",
  "防裂牛角": "#E0A36E",
  "木": "#EEE7CB"
};
const fallbackColumns = [
  [
    "笛身",
    "笛膜",
    "镶头"
  ],
  [
    "烘烤矫直",
    "扎线",
    "安弦设轴",
    "车旋打磨"
  ],
  [
    "江南竹乡",
    "江汉荆楚"
  ],
  [
    "优质苦竹",
    "强韧丝线",
    "野生苇膜",
    "防裂牛角"
  ],
  [
    "竹",
    "木"
  ]
];

function makeKey(source, target) { return `${source}_${target}`; }
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
  if (!window.echarts) { renderFallbackSankey(chartDom); return; }
  const chart = echarts.init(chartDom);
  chart.setOption({
    backgroundColor: "transparent",
    tooltip: {
      trigger: "item", triggerOn: "mousemove", backgroundColor: "rgba(15, 15, 15, 0.98)",
      borderColor: "#361E19", borderWidth: 1, padding: [14, 18], confine: true,
      textStyle: { color: allowedColors.c1, fontSize: 16, fontFamily: "FZLiShu, Microsoft YaHei, serif", lineHeight: 22 },
      formatter: tooltipFormatter
    },
    series: [{
      type: "sankey", layout: "none", left: "9%", right: "10%", top: "11%", bottom: "8%",
      nodeGap: 24, nodeWidth: 14, nodePitchGap: 0, focusNodeAdjacency: "none",
      itemStyle: { borderWidth: 0, borderColor: "#000000" },
      levels: [
        { depth: 0, label: { position: "left", color: allowedColors.c1, fontSize: 15 } },
        { depth: 1, label: { position: "top", color: allowedColors.c1, fontSize: 15, dy: -8 } },
        { depth: 2, label: { position: "bottom", color: allowedColors.c1, fontSize: 15, dy: 8 } },
        { depth: 3, label: { position: "top", color: allowedColors.c1, fontSize: 15, dy: -8 } },
        { depth: 4, label: { position: "right", color: allowedColors.c1, fontSize: 15 } }
      ],
      data: Object.keys(nodeColorMap).map((name) => ({ name, itemStyle: { color: nodeColorMap[name] } })),
      links: sankeyLinks,
      lineStyle: { color: "gradient", curveness: .6, opacity: .5 },
      label: { color: allowedColors.c1, fontFamily: "FZLiShu, Microsoft YaHei, serif" },
      animation: true, animationDuration: 3500, animationEasing: "quadraticOut", animationDelay: (idx) => idx * 130
    }]
  });
  window.addEventListener("resize", () => chart.resize());
}

function renderFallbackSankey(container) {
  const width = 980, height = 640, xPositions = [50, 270, 488, 700, 910];
  const nodeMap = new Map();
  fallbackColumns.forEach((names, col) => {
    const gap = height / (names.length + 1);
    names.forEach((name, index) => nodeMap.set(name, { name, x: xPositions[col], y: gap * (index + 1), color: nodeColorMap[name] || allowedColors.c1 }));
  });
  const linkMarkup = sankeyLinks.map((link) => {
    const source = nodeMap.get(link.source), target = nodeMap.get(link.target);
    const d = `M ${source.x + 12} ${source.y} C ${source.x + 96} ${source.y}, ${target.x - 96} ${target.y}, ${target.x - 12} ${target.y}`;
    return `<path class="fallback-link" d="${d}" stroke="${source.color}" stroke-width="${Math.max(3, link.value * 1.8)}"><title>${link.source} → ${link.target}：${link.value}</title></path>`;
  }).join("");
  const nodeMarkup = [...nodeMap.values()].map((node) => `<g class="fallback-node"><rect x="${node.x - 7}" y="${node.y - 22}" width="14" height="44" fill="${node.color}"></rect><text x="${node.x < 120 ? node.x - 16 : node.x + 18}" y="${node.y}" text-anchor="${node.x < 120 ? "end" : "start"}" style="font-family: FZLiShu, Microsoft YaHei, serif;">${node.name}</text><title>${node.name}</title></g>`).join("");
  container.innerHTML = `<svg class="fallback-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="笛桑基图备用 SVG"><rect width="${width}" height="${height}" fill="transparent"></rect><g>${linkMarkup}</g><g>${nodeMarkup}</g></svg>`;
}

if (document.fonts && document.fonts.ready) document.fonts.ready.then(renderEchartsSankey);
else renderEchartsSankey();
