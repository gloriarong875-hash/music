/*
  中文脚注（交互脚本说明）
  - 本脚本负责：
    1) 左侧鼓结构图部件的悬停交互与部件信息面板显示；
    2) 右侧鼓“部件 → 工艺 → 产地 → 材质 → 八音”的桑基图渲染；
    3) tooltip 的考据文字来自 `材质产地八音.xlsx` 的“鼓”sheet。
  - 修改桑基数据：编辑 `sankeyRows`，字段依次对应 Excel 的 部件/制作工艺/材料产地/对应材质/对应八音/四列考据。
  - 修改部件介绍：编辑 `partInfo`。
*/

const partInfo = {
  "鼓皮": {
    title: "鼓皮",
    body: "鼓皮是鼓面发声的核心，通常以牛皮鞣制、拉伸并绷紧在鼓框上，承担主要击打振动。"
  },
  "鼓钉": {
    title: "鼓钉",
    body: "鼓钉沿鼓框边缘密集排列，用以固定鼓皮并维持张力，使鼓面在强击下仍保持稳定。"
  },
  "鼓框": {
    title: "鼓框",
    body: "鼓框是鼓的木质共鸣腔，承托鼓皮并反射声波，决定鼓声的厚度、余韵与空间感。"
  }
};

const partTitle = document.getElementById("partTitle");
const partBody = document.getElementById("partBody");
const hoverTargets = [...document.querySelectorAll("[data-part]")];
const partInfoEl = document.querySelector(".part-info");

function setPart(name) {
  const info = partInfo[name] || partInfo["鼓皮"];
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
  if (el.classList.contains("orbit-node")) {
    el.tabIndex = 0;
  }
});

function expandStructure() {
  document.body.classList.add("is-expanded");
}

window.setTimeout(expandStructure, 980);
setPart("鼓皮");
if (partInfoEl) partInfoEl.classList.remove("visible");

const allowedColors = {
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
  c11: "#361E19"
};

/* 中文脚注：此处为鼓 sheet 数据。value 用于控制桑基流线粗细，可按重要程度微调。 */
const sankeyRows = [
  {
    part: "鼓皮",
    process: "熟皮鞣制",
    origin: "西北牧区",
    material: "黄牛",
    bayin: "革",
    value: 5,
    processText: "将天然牛皮进行彻底的刮脂、去毛和多次浸泡拉伸，使其变得富有极强的坚韧度。",
    originText: "北方及西北牧区出产的黄牛皮质地紧密、弹性好，是制作清脆战鼓的首选。",
    materialText: "黄牛皮长年在北方高寒风沙下生长，其纤维致密粗壮，鞣制后耐磨抗暴击。",
    bayinText: "【革音】节奏大乐之王。鼓皮通过物理撞击产生极强的低频声压，为乐悬之核心。"
  },
  {
    part: "鼓皮",
    process: "套揿套皮",
    origin: "江汉荆楚",
    material: "水牛",
    bayin: "革",
    value: 5,
    processText: "将巨大的水牛皮或黄牛皮在极高的人力张力下绷紧，严密套揿在木质鼓框上。",
    originText: "江汉荆楚的大鼓作坊拥有成熟的大型“绷鼓”仪轨与多工具复合拉伸套皮工艺。",
    materialText: "南方大水牛皮面积庞大、质地极其厚韧，崩紧在巨鼓上能激发深沉闷雷的声压。",
    bayinText: "【革音】节奏大乐之王。鼓皮通过物理撞击产生极强的低频声压，为乐悬之核心。"
  },
  {
    part: "鼓框",
    process: "烘烤矫直",
    origin: "燕赵平原",
    material: "杨木",
    bayin: "木",
    value: 4,
    processText: "选用杨木或杉木板材，通过高温火烤或蒸汽使其弯曲，拼合合围成浑圆的鼓框。",
    originText: "燕赵平原及北方林区盛产高大易合围的速生硬木，为制作巨型鼓框提供原料。",
    materialText: "速生杨木、北方杉木板幅巨大、质轻且抗机械弯曲，拼合合围后能稳定锁死。",
    bayinText: "【木音】声音共鸣之墙。圆筒形鼓框作为天然反射腹腔，使鼓声深沉雄浑。"
  },
  {
    part: "鼓钉",
    process: "熔铸合金",
    origin: "江汉荆楚",
    material: "泡钉",
    bayin: "金",
    value: 3,
    processText: "将高强度生铁或青铜合金按配比熔炼，铸造出带有大圆头、用于固定鼓皮的泡钉。",
    originText: "泡钉固定鼓皮依赖成熟的传统冶铁工业，历史上多由中原及治铁发达的荆楚提供。",
    materialText: "熟铁/青铜泡钉刚度极大，能在几吨的张力下丝毫不动，永恒锁紧牛皮皮膜。",
    bayinText: "【金音】约束固皮之铁。泡钉密密麻麻错落紧固在鼓框边缘，提供稳固张力。"
  }
];

const nodeColorMap = {
  "鼓皮": allowedColors.c5,
  "鼓钉": allowedColors.c2,
  "鼓框": allowedColors.c11,
  "熟皮鞣制": allowedColors.c5,
  "套揿套皮": allowedColors.c4,
  "烘烤矫直": allowedColors.c10,
  "熔铸合金": allowedColors.c2,
  "西北牧区": allowedColors.c3,
  "江汉荆楚": allowedColors.c7,
  "燕赵平原": allowedColors.c9,
  "黄牛": allowedColors.c3,
  "水牛": allowedColors.c8,
  "杨木": allowedColors.c9,
  "泡钉": allowedColors.c2,
  "革": allowedColors.c5,
  "木": allowedColors.c10,
  "金": allowedColors.c2
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
  ["鼓皮", "鼓钉", "鼓框"],
  ["熟皮鞣制", "套揿套皮", "烘烤矫直", "熔铸合金"],
  ["西北牧区", "江汉荆楚", "燕赵平原"],
  ["黄牛", "水牛", "杨木", "泡钉"],
  ["革", "木", "金"]
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
      nodeGap: 24,
      nodeWidth: 14,
      nodePitchGap: 0,
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

  container.innerHTML = `<svg class="fallback-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="鼓桑基图备用 SVG">
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
  document.fonts.ready.then(() => {
    renderEchartsSankey();
  });
} else {
  renderEchartsSankey();
}
