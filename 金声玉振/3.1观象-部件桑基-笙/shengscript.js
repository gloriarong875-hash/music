/*
  中文脚注（交互脚本说明）
  - 本脚本负责：
    1) 左侧结构图部件的悬停交互与右下/左下的部件信息面板显示；
    2) 桑基图（ECharts）渲染与 tooltip 格式化（见 renderEchartsSankey 中的 tooltip.textStyle/fontSize）；
  - 若要修改部件面板位置，请编辑 `generalcomponent.css` 中的 `.part-info`，
    例如将 `left`/`bottom` 调整到期望位置。
*/

/* 部件信息数据 */
const partInfo = {
  "笙苗": {
    title: "笙苗",
    body: "笙苗由长短不同的竹管构成，是空气柱共鸣与定音的主体。管身排列如凤翼展开，承接了笙“簧管合鸣”的基本形态。"
  },
  "笙孔": {
    title: "笙孔",
    body: "笙孔控制气流进入与闭合，决定每根笙苗是否被激发。孔位与手感需要同时兼顾演奏路径、气密性和音准稳定。"
  },
  "笙斗": {
    title: "笙斗",
    body: "笙斗是聚气的腹腔，连接笙苗、簧舌与吹口。它承担气压分配，也以木胎和漆层维持长期吹奏中的防潮与密封。"
  },
  "笙嘴": {
    title: "笙嘴",
    body: "笙嘴是吹奏入口，形制要贴合唇部并保证气流稳定进入笙斗。圆润的口缘与适度声阻会影响起音的顺滑程度。"
  },
  "簧舌": {
    title: "簧舌",
    body: "簧舌是笙发声的心脏。薄铜片在气流中自由振动，既产生明亮的金石音色，也把气息转化为可持续的和声。"
  },
  "朱砂": {
    title: "朱砂配重",
    body: "朱砂与蜂蜡混合后点在簧舌尖端，以极小重量改变振动频率。点砂定音把微观配重转化为听觉上的纯正音准。"
  }
};

const partTitle = document.getElementById("partTitle");
const partBody = document.getElementById("partBody");
const hoverTargets = [...document.querySelectorAll("[data-part]")];
const partInfoEl = document.querySelector('.part-info');

function setPart(name) {
  const info = partInfo[name] || partInfo["笙苗"];
  partTitle.textContent = info.title;
  partBody.textContent = info.body;
  hoverTargets.forEach((el) => el.classList.toggle("is-hot", el.dataset.part === name));
  if (partInfoEl) partInfoEl.classList.add('visible');
}

hoverTargets.forEach((el) => {
  el.addEventListener("mouseenter", () => setPart(el.dataset.part));
  el.addEventListener("focus", () => setPart(el.dataset.part));
  el.addEventListener("click", () => setPart(el.dataset.part));
  el.addEventListener("mouseleave", () => {
    if (partInfoEl) partInfoEl.classList.remove('visible');
    hoverTargets.forEach((node) => node.classList.remove('is-hot'));
  });
  el.addEventListener("blur", () => {
    if (partInfoEl) partInfoEl.classList.remove('visible');
    hoverTargets.forEach((node) => node.classList.remove('is-hot'));
  });
  if (el.classList.contains("orbit-node")) {
    el.tabIndex = 0;
  }
});


function expandStructure() {
  document.body.classList.add("is-expanded");
}


window.setTimeout(expandStructure, 980);
setPart("笙苗");
// 初始不显示介绍，只有在悬停时才可见
if (partInfoEl) partInfoEl.classList.remove('visible');

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

const nodeColorMap = {
  "笙苗": allowedColors.c10,
  "簧舌": allowedColors.c5,
  "笙斗": allowedColors.c11,
  "笙嘴": allowedColors.c8,
  "配重": allowedColors.c3,
  "烘烤矫直": allowedColors.c10,
  "安弦设轴": allowedColors.c9,
  "熔铸合金": allowedColors.c2,
  "精密微雕": allowedColors.c5,
  "手工挖办": allowedColors.c11,
  "大漆髹饰": allowedColors.c4,
  "车旋打磨": allowedColors.c8,
  "微观配重": allowedColors.c3,
  "江南竹乡": allowedColors.c7,
  "江汉荆楚": allowedColors.c1,
  "岭南沿海": allowedColors.c6,
  "西南山地": allowedColors.c4,
  "优质紫竹": allowedColors.c9,
  "高锡响铜": allowedColors.c2,
  "陈年木料": allowedColors.c1,
  "天然生漆": allowedColors.c4,
  "名贵乌木": allowedColors.c8,
  "天然朱砂": allowedColors.c3,
  "高山蜂蜡": allowedColors.c1,
  "竹": allowedColors.c9,
  "金": allowedColors.c2,
  "木": allowedColors.c1,
  "土": allowedColors.c4
};

const partToProcessTxt = {
  "笙苗": "传统十七簧笙管要求纤维紧密、管壁匀称。制笙大师首选江南竹乡的优质紫竹。",
  "簧舌": "发声心脏，需经数万次反复锻打熔铸与裁切，古代优质响铜原料皆来自江汉荆楚青铜矿脉。",
  "笙斗": "笙斗木胎需承受长期吹奏的湿气与气压，非老木料不可。外表需髹数十遍西南山地出产的天然生漆防潮。",
  "笙嘴": "高规格笙嘴追求润唇耐磨，古代多使用由岭南沿海口岸输入的名贵乌木、红木或象牙车旋而成。",
  "配重": "点砂调音的绝对核心。将丝滑的蜂蜡调和西南山地出产的纯正朱砂粉，微量涂抹在簧片尖端进行配重调音。"
};

const processToOriginTxt = {
  "烘烤矫直": "利用炭火高热软化天然紫竹，通过矫竹板瞬间定型，使其笔直匀称、空气柱共鸣稳定。",
  "安弦设轴": "此指传统攒管合流。将17根长短各异的笙苗按照大雁展翅的对称美学插设攒管并固定。",
  "熔铸合金": "将铜、锡等金属按照严格的声学配比，在高温炉中熔炼出发声高锡响铜片。",
  "精密微雕": "在响铜片上通过微观刀法雕刻出具有极小公差的U型簧舌，自由振动以激发声频。",
  "手工挖办": "选用陈年硬木，由老工匠用刻刀纯手工凿挖出笙斗内部蓄气腹腔及17个马蹄形插孔。",
  "大漆髹饰": "在雕挖好的笙斗表面反复刷涂、揩抹多层天然生漆，并在阴房中固化干燥，提供顶级的防潮气密防护。",
  "车旋打磨": "将名贵硬木通过车床旋削出契合唇形的吸口形状，并经细砂纸反复打磨至圆润光洁。",
  "微观配重": "在发声簧舌的尖端部位精准点入朱砂蜡泥，通过物理增重调整其固有振动频率，化刺耳为天籁。"
};

const originToMaterialTxt = {
  "江南竹乡_优质紫竹": "江浙天目山脉一带出产的紫竹纤维长且紧密，在经过烘烤拉直后，管内空气柱能产生极为温润的共鸣。",
  "江汉荆楚_高锡响铜": "长江中游拥有丰富的响铜矿料。由于其内部微观结构含锡量严苛，敲击时声音具有极强的刚度与延续性。",
  "江汉荆楚_陈年木料": "两湖及中原腹地留存的陈年梓木或楸木，其天然水分早已耗尽，手工刨削后不易因气候产生微观形变。",
  "西南山地_天然生漆": "云贵深山生漆树上割取出的原漆。干燥固化后分子链极其致密，是古代乐器顶级的气密保护膜。",
  "岭南沿海_名贵乌木": "经由海上丝绸之路输入的硬质黑檀。不吸水且硬度极高，长期与嘴唇接触能提供绝佳的声学声阻。",
  "西南山地_天然朱砂": "贵州万山出产的纯正天然硫化汞结晶。由于其极高的物理密度，能在极小的微米体积内提供完美的重力配重。",
  "西南山地_高山蜂蜡": "采自野生高山中华蜜蜂的天然蜡质。在常温下柔韧不脆裂，能死死包裹住朱砂矿物并咬住响铜簧片。"
};

const materialToBayinTxt = {
  "竹": "【竹音】传统管乐之宗。笙以竹管聚气、以长短定音，在八音中因其整体声学载体而被赋予竹音之正统。",
  "金": "【金音】钟磬齐鸣之响。青铜簧舌在气流震动下产生极其清脆、华丽的金石和音，是乐器发声的核心。",
  "木": "【木音】柷敔礼乐之序。漆木笙斗及乌木笙嘴作为气流汇聚的枢纽器皿，承载着中国传统木质漆器的框架。",
  "土": "【土音】陶埙泥塑之风。调音所抹的朱砂配重依附于簧舌，利用天然矿物微观增重进行物理音准调校。"
};

const sankeyLinks = [
  { source: "笙苗", target: "烘烤矫直", value: 9 },
  { source: "笙苗", target: "安弦设轴", value: 6 },
  { source: "簧舌", target: "熔铸合金", value: 7 },
  { source: "簧舌", target: "精密微雕", value: 7 },
  { source: "笙斗", target: "手工挖办", value: 4 },
  { source: "笙斗", target: "大漆髹饰", value: 2 },
  { source: "笙嘴", target: "车旋打磨", value: 3 },
  { source: "配重", target: "微观配重", value: 4 },
  { source: "烘烤矫直", target: "江南竹乡", value: 9 },
  { source: "安弦设轴", target: "江南竹乡", value: 6 },
  { source: "熔铸合金", target: "江汉荆楚", value: 7 },
  { source: "精密微雕", target: "江汉荆楚", value: 7 },
  { source: "手工挖办", target: "江汉荆楚", value: 4 },
  { source: "大漆髹饰", target: "西南山地", value: 2 },
  { source: "车旋打磨", target: "岭南沿海", value: 3 },
  { source: "微观配重", target: "西南山地", value: 4 },
  { source: "江南竹乡", target: "优质紫竹", value: 15 },
  { source: "江汉荆楚", target: "高锡响铜", value: 14 },
  { source: "江汉荆楚", target: "陈年木料", value: 4 },
  { source: "西南山地", target: "天然生漆", value: 2 },
  { source: "岭南沿海", target: "名贵乌木", value: 3 },
  { source: "西南山地", target: "天然朱砂", value: 2 },
  { source: "西南山地", target: "高山蜂蜡", value: 2 },
  { source: "优质紫竹", target: "竹", value: 15 },
  { source: "高锡响铜", target: "金", value: 14 },
  { source: "陈年木料", target: "木", value: 4 },
  { source: "天然生漆", target: "木", value: 2 },
  { source: "名贵乌木", target: "木", value: 3 },
  { source: "天然朱砂", target: "土", value: 2 },
  { source: "高山蜂蜡", target: "土", value: 2 }
];

function tooltipFormatter(params) {
  if (params.dataType === "edge") {
    const src = params.data.source;
    const tgt = params.data.target;
    let title = "";
    let body = "";

    if (partToProcessTxt[src]) {
      title = "【考据 · 工艺】";
      body = partToProcessTxt[src];
    } else if (processToOriginTxt[src]) {
      title = "【考据 · 产地】";
      body = processToOriginTxt[src];
    } else if (originToMaterialTxt[`${src}_${tgt}`]) {
      title = "【考据 · 材质】";
      body = originToMaterialTxt[`${src}_${tgt}`];
    } else if (materialToBayinTxt[tgt]) {
      title = `【考据 · ${tgt}】`;
      body = materialToBayinTxt[tgt];
    }

    if (body) {
      return `<div style="font-family: FZLiShu, Microsoft YaHei, serif; max-width:320px;white-space:normal;word-break:break-all;">
        <strong style="color:#EFD67D;font-size:14px;letter-spacing:1px;">${title}</strong><br/>
        <p style="margin:6px 0 0;color:#EEE7CB;">${body}</p>
      </div>`;
    }
  }

  const name = params.name;
  if (partToProcessTxt[name]) return `<div style="font-family: FZLiShu, Microsoft YaHei, serif; max-width:320px;white-space:normal;word-break:break-all;"><strong style="color:#EFD67D;">【部件】${name}</strong><br/><p style="margin:6px 0 0;color:#EEE7CB;">${partToProcessTxt[name]}</p></div>`;
  if (processToOriginTxt[name]) return `<div style="font-family: FZLiShu, Microsoft YaHei, serif; max-width:320px;white-space:normal;word-break:break-all;"><strong style="color:#EFD67D;">【工艺】${name}</strong><br/><p style="margin:6px 0 0;color:#EEE7CB;">${processToOriginTxt[name]}</p></div>`;
  if (materialToBayinTxt[name]) return `<div style="font-family: FZLiShu, Microsoft YaHei, serif; max-width:320px;white-space:normal;word-break:break-all;"><strong style="color:#EFD67D;">【八音】${name}</strong><br/><p style="margin:6px 0 0;color:#EEE7CB;">${materialToBayinTxt[name]}</p></div>`;
  return `<div style="font-family: FZLiShu, Microsoft YaHei, serif;"><strong style="color:#EFD67D;">${name}</strong></div>`;
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
        /* 使用项目隶书字体优先显示 */
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
      nodeGap: 20,
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
        opacity: .48
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
  const columns = [
    ["笙苗", "簧舌", "笙斗", "笙嘴", "配重"],
    ["烘烤矫直", "安弦设轴", "熔铸合金", "精密微雕", "手工挖办", "大漆髹饰", "车旋打磨", "微观配重"],
    ["江南竹乡", "江汉荆楚", "岭南沿海", "西南山地"],
    ["优质紫竹", "高锡响铜", "陈年木料", "天然生漆", "名贵乌木", "天然朱砂", "高山蜂蜡"],
    ["竹", "金", "木", "土"]
  ];
  const width = 980;
  const height = 640;
  const xPositions = [50, 270, 488, 700, 910];
  const nodeMap = new Map();

  columns.forEach((names, col) => {
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

  container.innerHTML = `<svg class="fallback-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="笙桑基图备用 SVG">
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
