/*
  中文脚注（交互脚本说明）
  - 本脚本负责：
    1) 左侧埙结构图部件的悬停交互与部件信息面板显示；
    2) 右侧埙“部件 → 工艺 → 产地 → 材质 → 八音”的桑基图渲染；
    3) tooltip 的考据文字来自 `材质产地八音.xlsx` 的“埙”sheet。
  - 修改桑基数据：编辑 `sankeyRows`，字段依次对应 Excel 的 部件/制作工艺/材料产地/对应材质/对应八音/四列考据。
  - 修改部件介绍：编辑 `partInfo`。
*/

const partInfo = {
  "埙体": {
    title: "埙体",
    body: "埙体由红泥或陶土捏塑、挖空并烧结成中空腔体，是埙形成低回悲凉音色的核心共鸣空间。"
  },
  "涂层": {
    title: "涂层",
    body: "涂层多以蜂蜡等材料反复擦拭于陶埙表面，填补微孔、防潮护体，使埙色泽温润并维持气密。"
  }
};

const partTitle = document.getElementById("partTitle");
const partBody = document.getElementById("partBody");
const hoverTargets = [...document.querySelectorAll("[data-part]")];
const partInfoEl = document.querySelector(".part-info");

function setPart(name) {
  const info = partInfo[name] || partInfo["埙体"];
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
setPart("埙体");
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

/* 中文脚注：此处为埙 sheet 数据。value 用于控制桑基流线粗细，可按重要程度微调。 */
const sankeyRows = [
  {
    part: "埙体",
    process: "手工挖办",
    origin: "中原黄河",
    material: "红泥",
    bayin: "土",
    value: 5,
    processText: "采用黄河两岸最具黏性的红泥或陶土，手工捏塑、搓制并挖空出中空的腔体。",
    originText: "埙源于新石器时代。中原及西北黄河流域（如西安半坡）的黏土是制陶埙的最早原材。",
    materialText: "黄河沉积红泥具有极佳的塑性与致密微观空隙，捏塑中空最易聚合共鸣。",
    bayinText: "【土音】太古旷野之声。中空陶土腔体通过闭口吹奏，产生极其悲凉的低频音色。"
  },
  {
    part: "埙体",
    process: "烘烤矫直",
    origin: "中原黄河",
    material: "陶土",
    bayin: "土",
    value: 5,
    processText: "将捏好的埙体胚胎送入窑口，通过高温进行烧结焙烧，使其彻底陶化。",
    originText: "中原黄河区域发达的古瓷窑、陶窑口，为埙体烧结提供了炉火纯青的温度控制。",
    materialText: "胚胎在经过红窑高温焙烧后，泥土彻底矿物化，转化为刚性极强的硬质陶体。",
    bayinText: "【土音】太古旷野之声。中空陶土腔体通过闭口吹奏，产生极其悲凉的低频音色。"
  },
  {
    part: "涂层",
    process: "车旋打磨",
    origin: "西南山地",
    material: "野生蜂蜡",
    bayin: "土",
    value: 3,
    processText: "在烧结完成的埙体表面反复擦拭、揩抹一层薄野生蜂蜡，使其色泽温润并防潮。",
    originText: "西南及南方林区天然采集的野生蜂蜡，质地温和，能完美填补陶埙表面的微观气孔。",
    materialText: "野生蜂蜡熔化擦拭后填补陶质微观裂隙，形成防水气密层，阻绝唾液侵蚀。",
    bayinText: "【土音】气密防护之衣。蜂蜡涂层让埙体更加温润，并保护陶质免受吹奏湿气侵蚀。"
  }
];

const nodeColorMap = {
  "埙体": allowedColors.c3,
  "涂层": allowedColors.c2,
  "手工挖办": allowedColors.c3,
  "烘烤矫直": allowedColors.c10,
  "车旋打磨": allowedColors.c2,
  "中原黄河": allowedColors.c3,
  "西南山地": allowedColors.c10,
  "红泥": allowedColors.c4,
  "陶土": allowedColors.c11,
  "野生蜂蜡": allowedColors.c2,
  "土": allowedColors.c3
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
  ["埙体", "涂层"],
  ["手工挖办", "烘烤矫直", "车旋打磨"],
  ["中原黄河", "西南山地"],
  ["红泥", "陶土", "野生蜂蜡"],
  ["土"]
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

  container.innerHTML = `<svg class="fallback-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="埙桑基图备用 SVG">
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
