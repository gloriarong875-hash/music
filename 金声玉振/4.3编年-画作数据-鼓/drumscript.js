const periodColors = {
  "先秦汉唐": {
    "base": "#E0A36E",
    "hi": "#F5C898",
    "low": "#7A4010"
  },
  "宋代": {
    "base": "#A7C6A4",
    "hi": "#C8E0C5",
    "low": "#2A6025"
  },
  "元代": {
    "base": "#BA494C",
    "hi": "#D87070",
    "low": "#5A1A1C"
  },
  "明代": {
    "base": "#D7B1DB",
    "hi": "#F0C6F3",
    "low": "#5F3763"
  },
  "清代": {
    "base": "#4F768D",
    "hi": "#80AACC",
    "low": "#132840"
  }
};

/*
  中文脚注（数据与图表说明）
  - 修改颜色：调整 periodColors 中各朝代的 base / hi / low。
  - 修改画作数据：调整 works 数组；period 对应 Y 轴朝代，category 对应 X 轴题材。
  - 修改图表大小：调整 CHART_SCALE_BASE 或 view.scale 初始值；数值越大图表越大，越小图表越小。
  - 修改图表位置：调整 CHART_CENTER_X / CHART_CENTER_Y；X 越大越往右，Y 越大越往下，Y 越小越往上。
  - 修改 Z 轴高度和数据落差：调整 Z_AXIS_SCALE，数值越大，Z 轴越高、波峰落差越明显。
  - 修改背景颜色：调整 drumstyle.css 中 `.page { background-color: ... }` 和 `.page::after` 的渐变。
  - periods / categories 决定 Y 轴朝代与 X 轴题材顺序。
  - axisPoint 是真实数据波形使用的坐标；axisBasePoint 是坐标轴和地面网格使用的坐标。
  - 为避免数据从原点开始，axisPoint 对 X/Y 做了轻微内缩偏移；坐标轴标签则通过 categoryLabelPoint / periodLabelPoint 放到轴外侧。
  - view.rotX 控制初始俯视程度：数值越接近 0 越低视角，越负越俯视；view.rotY 控制 X/Y 两轴的水平开角。
  - 限定 Z 轴朝上：横向拖动仍可 360 度旋转，纵向拖动会被 CHART_ROT_X_MIN / CHART_ROT_X_MAX 限制，避免图表上下翻转。
  - 修改大图缩放：调整 LIGHTBOX_ZOOM_MIN / LIGHTBOX_ZOOM_MAX / LIGHTBOX_ZOOM_STEP；滚轮向上放大、向下缩小。
  - 图表 hover 卡片只显示画作、材质与馆藏，避免信息卡片过长。
*/

const periods = [
  "先秦汉唐",
  "宋代",
  "元代",
  "明代",
  "清代"
];
const categories = ["宫廷礼宴", "文人雅集", "民间世俗", "宗教神话"];
const Z_AXIS_SCALE = 2.08;
const Z_AXIS_MAX = 6;
const CHART_SCALE_BASE = .35;
const CHART_CENTER_X = .53;
const CHART_CENTER_Y = .53;
const CHART_ROT_X_MIN = -1.18;
const CHART_ROT_X_MAX = -0.08;

const works = [
  {
    "id": "D016331",
    "title": "韩熙载夜宴图",
    "material": "绢本",
    "category": "宫廷礼宴",
    "instruments": "琵琶、笛子、鼓",
    "author": "顾闳中（传）",
    "dynasty": "五代",
    "museum": "故宫博物院",
    "period": "先秦汉唐",
    "intro": "《韩熙载夜宴图》为五代顾闳中（传）作品，现藏故宫博物院。画面属宫廷礼宴题材，可见琵琶、笛子、鼓等乐器，适合作为相关乐器图像资料。"
  },
  {
    "id": "D017527",
    "title": "龙宿郊民图",
    "material": "绢本设色",
    "category": "民间世俗",
    "instruments": "鼓",
    "author": "董源",
    "dynasty": "五代",
    "museum": "台北故宫博物院",
    "period": "先秦汉唐",
    "intro": "《龙宿郊民图》为五代董源作品，现藏台北故宫博物院。画面属民间世俗题材，可见鼓等乐器，适合作为相关乐器图像资料。"
  },
  {
    "id": "D019752",
    "title": "洛神图",
    "material": "绢本设色",
    "category": "宗教神话",
    "instruments": "鼓",
    "author": "顾恺之",
    "dynasty": "晋",
    "museum": "台北故宫博物院",
    "period": "先秦汉唐",
    "intro": "《洛神图》为晋顾恺之作品，现藏台北故宫博物院。画面属宗教神话题材，可见鼓等乐器，适合作为相关乐器图像资料。"
  },
  {
    "id": "D015931",
    "title": "三官图：水官",
    "material": "绢本设色",
    "category": "宗教神话",
    "instruments": "鼓",
    "author": "佚名",
    "dynasty": "宋",
    "museum": "波士顿艺术博物馆",
    "period": "宋代",
    "intro": "《三官图：水官》为宋佚名作品，现藏波士顿艺术博物馆。画面属宗教神话题材，可见鼓等乐器，适合作为相关乐器图像资料。"
  },
  {
    "id": "D016008",
    "title": "孝经图",
    "material": "绢本水墨",
    "category": "宫廷礼宴",
    "instruments": "编钟、扁鼓",
    "author": "李公麟",
    "dynasty": "宋",
    "museum": "大都会博物馆",
    "period": "宋代",
    "intro": "《孝经图》为宋李公麟作品，现藏大都会博物馆。画面属宫廷礼宴题材，可见编钟、扁鼓等乐器，适合作为相关乐器图像资料。"
  },
  {
    "id": "D016102",
    "title": "陈风图",
    "material": "绢本设色",
    "category": "民间世俗",
    "instruments": "鼓、笛子、萧",
    "author": "马和之",
    "dynasty": "宋",
    "museum": "大英博物馆",
    "period": "宋代",
    "intro": "《陈风图》为宋马和之作品，现藏大英博物馆。画面属民间世俗题材，可见鼓、笛子、萧等乐器，适合作为相关乐器图像资料。"
  },
  {
    "id": "D016751",
    "title": "早秋夜泊图",
    "material": "绢本设色",
    "category": "文人雅集",
    "instruments": "鼓、琴",
    "author": "佚名",
    "dynasty": "宋",
    "museum": "克利夫兰艺术博物馆",
    "period": "宋代",
    "intro": "《早秋夜泊图》为宋佚名作品，现藏克利夫兰艺术博物馆。画面属文人雅集题材，可见鼓、琴等乐器，适合作为相关乐器图像资料。"
  },
  {
    "id": "D016085",
    "title": "钟馗嫁妹图",
    "material": "纸本设色",
    "category": "宗教神话",
    "instruments": "笛、鼓",
    "author": "颜庚",
    "dynasty": "元",
    "museum": "大都会博物馆",
    "period": "元代",
    "intro": "《钟馗嫁妹图》为元颜庚作品，现藏大都会博物馆。画面属宗教神话题材，可见笛、鼓等乐器，适合作为相关乐器图像资料。"
  },
  {
    "id": "D016582",
    "title": "东山丝竹图",
    "material": "绢本",
    "category": "文人雅集",
    "instruments": "琵琶、笙、笛、阮、鼓",
    "author": "佚名",
    "dynasty": "元",
    "museum": "故宫博物院",
    "period": "元代",
    "intro": "《东山丝竹图》为元佚名作品，现藏故宫博物院。画面属文人雅集题材，可见琵琶、笙、笛、阮、鼓等乐器，适合作为相关乐器图像资料。"
  },
  {
    "id": "D016587",
    "title": "龙舟夺标图",
    "material": "绢本设色",
    "category": "民间世俗",
    "instruments": "鼓",
    "author": "佚名",
    "dynasty": "元",
    "museum": "故宫博物院",
    "period": "元代",
    "intro": "《龙舟夺标图》为元佚名作品，现藏故宫博物院。画面属民间世俗题材，可见鼓等乐器，适合作为相关乐器图像资料。"
  },
  {
    "id": "D016602",
    "title": "嫁娶图 故宫里叫农村嫁女图",
    "material": "绢本设色",
    "category": "民间世俗",
    "instruments": "鼓、笛、箫",
    "author": "佚名",
    "dynasty": "元",
    "museum": "故宫博物院",
    "period": "元代",
    "intro": "《嫁娶图 故宫里叫农村嫁女图》为元佚名作品，现藏故宫博物院。画面属民间世俗题材，可见鼓、笛、箫等乐器，适合作为相关乐器图像资料。"
  },
  {
    "id": "D016773",
    "title": "钟馗元夜出游图 月夜",
    "material": "绢本设色",
    "category": "宗教神话",
    "instruments": "鼓、笛",
    "author": "颜辉",
    "dynasty": "元",
    "museum": "克利夫兰艺术博物馆",
    "period": "元代",
    "intro": "《钟馗元夜出游图 月夜》为元颜辉作品，现藏克利夫兰艺术博物馆。画面属宗教神话题材，可见鼓、笛等乐器，适合作为相关乐器图像资料。"
  },
  {
    "id": "D017141",
    "title": "群仙祝寿图",
    "material": "绢本设色",
    "category": "宗教神话",
    "instruments": "笛、鼓、板",
    "author": "颜辉（传）",
    "dynasty": "元",
    "museum": "私人藏",
    "period": "元代",
    "intro": "《群仙祝寿图》为元颜辉（传）作品，现藏私人藏。画面属宗教神话题材，可见笛、鼓、板等乐器，适合作为相关乐器图像资料。"
  },
  {
    "id": "D000522",
    "title": "人物故事图",
    "material": "绢本",
    "category": "文人雅集",
    "instruments": "琵琶、箫、古琴、鼓",
    "author": "仇英",
    "dynasty": "明",
    "museum": "故宫博物院",
    "period": "明代",
    "intro": "《人物故事图》为明仇英作品，现藏故宫博物院。画面属文人雅集题材，可见琵琶、箫、古琴、鼓等乐器，适合作为相关乐器图像资料。"
  },
  {
    "id": "D004744",
    "title": "万树园赐宴图",
    "material": "绢本设色",
    "category": "宫廷礼宴",
    "instruments": "鼓、笛、笙、编钟",
    "author": "郎世宁等",
    "dynasty": "清",
    "museum": "故宫博物院",
    "period": "清代",
    "intro": "《万树园赐宴图》为清郎世宁等作品，现藏故宫博物院。画面属宫廷礼宴题材，可见鼓、笛、笙、编钟等乐器，适合作为相关乐器图像资料。"
  },
  {
    "id": "D005271",
    "title": "弘历雪景行乐图",
    "material": "绢本设色",
    "category": "宫廷礼宴",
    "instruments": "鼓（鼗鼓）",
    "author": "唐岱等",
    "dynasty": "清",
    "museum": "故宫博物院",
    "period": "清代",
    "intro": "《弘历雪景行乐图》为清唐岱等作品，现藏故宫博物院。画面属宫廷礼宴题材，可见鼓（鼗鼓）等乐器，适合作为相关乐器图像资料。"
  },
  {
    "id": "D009930",
    "title": "携琴啜茗图",
    "material": "纸本设色",
    "category": "文人雅集",
    "instruments": "琴、鼓",
    "author": "汤光启",
    "dynasty": "清",
    "museum": "山东博物馆",
    "period": "清代",
    "intro": "《携琴啜茗图》为清汤光启作品，现藏山东博物馆。画面属文人雅集题材，可见琴、鼓等乐器，适合作为相关乐器图像资料。"
  },
  {
    "id": "待补充",
    "title": "百子图",
    "material": "绢本设色",
    "category": "民间世俗",
    "instruments": "鼓",
    "author": "苏汉臣、王居正",
    "dynasty": "南宋",
    "museum": "克利夫兰艺术博物馆",
    "period": "宋代",
    "intro": "《百子图》为南宋苏汉臣、王居正名下作品，现藏克利夫兰艺术博物馆。画面聚焦儿童庭园嬉戏，构图繁密而人物清晰，鼓类玩具使场景更添节庆与童趣。"
  },
  {
    "id": "待补充",
    "title": "观舞仕女图",
    "material": "绢本设色",
    "category": "宫廷礼宴",
    "instruments": "鼓、笙、笛、钹等",
    "author": "周文矩",
    "dynasty": "五代南唐",
    "museum": "弗利尔美术馆",
    "period": "先秦汉唐",
    "intro": "周文矩《观舞仕女图》描绘庭院仕女歌舞奏乐，舞者居中起势，旁侧乐伎以笙、笛、鼓、钹等相和。鼓在画中承担击节助舞作用，烘托华贵热烈的宴乐氛围。"
  },
  {
    "id": "待补充",
    "title": "荷亭婴戏图",
    "material": "绢本设色",
    "category": "民间世俗",
    "instruments": "鼓、钹等",
    "author": "佚名",
    "dynasty": "宋",
    "museum": "波士顿艺术博物馆",
    "period": "宋代",
    "intro": "《荷亭婴戏图》描绘荷亭旁儿童仿作戏曲表演，有童子戴面具、扮角色，旁人敲鼓击钹相和。鼓声连接游戏与表演，呈现宋代儿童娱乐和市井戏乐的生动一面。"
  },
  {
    "id": "D016552",
    "title": "鲁颂三篇",
    "material": "绢本",
    "category": "宫廷礼宴",
    "instruments": "编钟、笙、琴、笛子、鼓",
    "author": "马和之（传）/宋高宗书",
    "dynasty": "宋",
    "museum": "辽宁省博物馆",
    "period": "宋代",
    "intro": "《鲁颂三篇》为《诗经图》系统作品，宋高宗书、马和之画一类书画合璧卷。画面书画相间表现《鲁颂》诗意，可见编钟、笙、琴、笛、鼓等礼乐配置。"
  },
  {
    "id": "待补充",
    "title": "摹顾恺之洛神赋图（第一卷）",
    "material": "绢本设色",
    "category": "宗教神话",
    "instruments": "鼓",
    "author": "顾恺之（宋摹本）",
    "dynasty": "宋摹本",
    "museum": "故宫博物院",
    "period": "宋代",
    "intro": "《摹顾恺之洛神赋图（第一卷）》为故宫博物院藏宋摹本，取曹植《洛神赋》故事，铺陈人神相望、车驾出行等情节。鼓类仪仗元素增强神灵出行的庄严感。"
  },
  {
    "id": "待补充",
    "title": "市担婴戏图",
    "material": "绢本浅设色",
    "category": "民间世俗",
    "instruments": "拨浪鼓、鼓类玩具",
    "author": "李嵩",
    "dynasty": "南宋",
    "museum": "台北故宫博物院",
    "period": "宋代",
    "intro": "李嵩《市担婴戏图》描绘货郎挑担入村，儿童围拢观看选物。货郎手摇拨浪鼓招徕孩童，满担杂货与玩具呈现南宋市井交易和儿童生活的鲜活气息。"
  },
  {
    "id": "待补充",
    "title": "唐风图",
    "material": "绢本设色",
    "category": "宫廷礼宴",
    "instruments": "钟鼓",
    "author": "马和之（传）/宋高宗书",
    "dynasty": "南宋",
    "museum": "辽宁省博物馆",
    "period": "宋代",
    "intro": "《唐风图》为南宋《诗经图》系统作品之一，以书画相间方式表现《诗经·唐风》诗意。其中“山有枢”等段落涉及钟鼓礼乐，借鼓写礼乐废弛与劝戒意味。"
  },
  {
    "id": "待补充",
    "title": "杂剧打花鼓图",
    "material": "绢本设色",
    "category": "民间世俗",
    "instruments": "大皮鼓、鼓槌",
    "author": "佚名",
    "dynasty": "南宋",
    "museum": "故宫博物院",
    "period": "宋代",
    "intro": "《杂剧打花鼓图》为南宋佚名册页，画两名人物作杂剧表演，身后置大皮鼓与鼓槌等道具。鼓既是题名中心，也是推动滑稽戏剧场景的关键视觉线索。"
  },
  {
    "id": "待补充",
    "title": "杂剧卖眼药图",
    "material": "绢本设色",
    "category": "民间世俗",
    "instruments": "鼓",
    "author": "佚名",
    "dynasty": "南宋",
    "museum": "故宫博物院",
    "period": "宋代",
    "intro": "《杂剧卖眼药图》又名《杂剧图》，描绘卖眼药郎中与买药者的滑稽表演。人物装扮夸张，旁见鼓类道具，呈现南宋城市娱乐、杂剧演出与市井风俗。"
  }
];

const assets = [
  {
    "file": "韩熙载夜宴图.jpg",
    "title": "韩熙载夜宴图",
    "shape": "wide"
  },
  {
    "file": "龙宿郊民图.jpg",
    "title": "龙宿郊民图",
    "shape": "large"
  },
  {
    "file": "三官图.jpg",
    "title": "三官图：水官",
    "shape": "wide",
    "label": "三官图"
  },
  {
    "file": "孝经图.jpg",
    "title": "孝经图",
    "shape": "wide"
  },
  {
    "file": "早秋夜泊图.jpg",
    "title": "早秋夜泊图",
    "shape": "wide"
  },
  {
    "file": "东山丝竹图.jpg",
    "title": "东山丝竹图",
    "shape": "large"
  },
  {
    "file": "龙舟夺标图.jpg",
    "title": "龙舟夺标图",
    "shape": "wide"
  },
  {
    "file": "农村嫁女图.jpg",
    "title": "嫁娶图 故宫里叫农村嫁女图",
    "shape": "large",
    "label": "农村嫁女图"
  },
  {
    "file": "百子图.jpg",
    "title": "百子图",
    "shape": "wide"
  },
  {
    "file": "观舞仕女图.jpg",
    "title": "观舞仕女图",
    "shape": "wide"
  },
  {
    "file": "荷亭婴戏图.jpg",
    "title": "荷亭婴戏图",
    "shape": "wide"
  },
  {
    "file": "鲁颂三篇.jpg",
    "title": "鲁颂三篇",
    "shape": "large"
  },
  {
    "file": "摹顾恺之洛神赋图（第一卷）.jpg",
    "title": "摹顾恺之洛神赋图（第一卷）",
    "shape": "wide"
  },
  {
    "file": "市担婴戏图.jpg",
    "title": "市担婴戏图",
    "shape": "large"
  },
  {
    "file": "唐风图.jpg",
    "title": "唐风图",
    "shape": "wide"
  },
  {
    "file": "钟馗月夜出游图.jpg",
    "title": "钟馗元夜出游图 月夜",
    "shape": "wide",
    "label": "钟馗月夜出游图"
  },
  {
    "file": "杂剧打花鼓图.jpg",
    "title": "杂剧打花鼓图",
    "shape": "wide"
  },
  {
    "file": "杂剧卖眼药图.jpg",
    "title": "杂剧卖眼药图",
    "shape": "large"
  }
];

const chart = document.getElementById("paintChart");
const ctx = chart.getContext("2d");
const tip = document.getElementById("chartTip");
const legend = document.getElementById("chartLegend");

/* 中文脚注：view.scale 是数据可视化初始大小；CHART_CENTER_X/Y 是数据可视化初始位置。 */
const view = { rotX: -0.22, rotY: -0.78, scale: .98, dragging: false, moved: false, lastX: 0, lastY: 0 };
let hits = [];
let activeHit = null;
let selectedHit = null;
let scheduled = false;
const LIGHTBOX_ZOOM_MIN = .6;
const LIGHTBOX_ZOOM_MAX = 4;
const LIGHTBOX_ZOOM_STEP = .16;
let lightboxZoom = 1;

function rgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function groupedWorks(period, category) {
  return works.filter((item) => item.period === period && item.category === category);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function resizeCanvas() {
  const rect = chart.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  const width = Math.max(620, Math.floor(rect.width * dpr));
  const height = Math.max(500, Math.floor(rect.height * dpr));
  if (chart.width !== width || chart.height !== height) {
    chart.width = width;
    chart.height = height;
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function project(point) {
  const rect = chart.getBoundingClientRect();
  const w = rect.width;
  const h = rect.height;
  const cosY = Math.cos(view.rotY);
  const sinY = Math.sin(view.rotY);
  const cosX = Math.cos(view.rotX);
  const sinX = Math.sin(view.rotX);
  const x1 = point.x * cosY + point.y * sinY;
  const y1 = -point.x * sinY + point.y * cosY;
  const y2 = y1 * cosX - point.z * sinX;
  const z2 = y1 * sinX + point.z * cosX;
  const perspective = 760 / (760 + z2 * 120);
  const scale = Math.min(w, h) * CHART_SCALE_BASE * view.scale;
  return {
    /* 中文脚注：修改数据可视化位置就在这里对应的常量；CHART_CENTER_Y 已从 .56 调到 .53，让初始状态继续上移。 */
    sx: w * CHART_CENTER_X + x1 * scale * perspective,
    sy: h * CHART_CENTER_Y - y2 * scale * perspective,
    depth: z2,
    perspective
  };
}

function axisPoint(ci, pi, value) {
  const x = ((ci + .72) / (categories.length + .72) - .5) * 2.1;
  const y = ((pi + .78) / (periods.length + .78) - .5) * 1.46;
  const z = (value / Z_AXIS_MAX) * Z_AXIS_SCALE;
  return { x, y, z };
}

function axisBasePoint(ci, pi, value) {
  const x = (ci / (categories.length - 1) - .5) * 2.1;
  const y = (pi / (periods.length - 1) - .5) * 1.46;
  const z = (value / Z_AXIS_MAX) * Z_AXIS_SCALE;
  return { x, y, z };
}

function categoryLabelPoint(ci) {
  const p = axisPoint(ci, 0, 0);
  return { ...p, y: p.y - .34, z: 0 };
}

function periodLabelPoint(pi) {
  const p = axisPoint(0, pi, 0);
  return { ...p, x: p.x - .34, z: 0 };
}

function catmullPoints(points, steps = 16) {
  const out = [];
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    for (let s = 0; s < steps; s += 1) {
      const t = s / steps;
      const t2 = t * t;
      const t3 = t2 * t;
      out.push({
        sx: .5 * ((2 * p1.sx) + (-p0.sx + p2.sx) * t + (2 * p0.sx - 5 * p1.sx + 4 * p2.sx - p3.sx) * t2 + (-p0.sx + 3 * p1.sx - 3 * p2.sx + p3.sx) * t3),
        sy: .5 * ((2 * p1.sy) + (-p0.sy + p2.sy) * t + (2 * p0.sy - 5 * p1.sy + 4 * p2.sy - p3.sy) * t2 + (-p0.sy + 3 * p1.sy - 3 * p2.sy + p3.sy) * t3)
      });
    }
  }
  out.push(points[points.length - 1]);
  return out;
}

function countBy(list, key) {
  const counts = {};
  list.forEach((item) => {
    const value = item[key] || "未详";
    counts[value] = (counts[value] || 0) + 1;
  });
  return Object.entries(counts).map(([name, count]) => `${name}×${count}`).join("、") || "未详";
}

function drawLine(a, b, color, width = 1, dash = []) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.setLineDash(dash);
  ctx.beginPath();
  ctx.moveTo(a.sx, a.sy);
  ctx.lineTo(b.sx, b.sy);
  ctx.stroke();
  ctx.restore();
}

function drawText(text, point, color, size = 15, align = "center") {
  ctx.save();
  ctx.fillStyle = color;
  ctx.font = `${size}px FZLiShu, Microsoft YaHei, serif`;
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  ctx.fillText(text, point.sx, point.sy);
  ctx.restore();
}

function drawChart() {
  scheduled = false;
  resizeCanvas();
  const rect = chart.getBoundingClientRect();
  ctx.clearRect(0, 0, rect.width, rect.height);
  hits = [];

  const x0 = axisBasePoint(0, 0, 0);
  const x1 = axisBasePoint(categories.length - 1, 0, 0);
  const y1 = axisBasePoint(0, periods.length - 1, 0);
  const z1 = axisBasePoint(0, 0, Z_AXIS_MAX);

  const floorCorners = [
    project(axisBasePoint(0, 0, 0)),
    project(axisBasePoint(categories.length - 1, 0, 0)),
    project(axisBasePoint(categories.length - 1, periods.length - 1, 0)),
    project(axisBasePoint(0, periods.length - 1, 0))
  ];

  ctx.beginPath();
  floorCorners.forEach((p, index) => {
    if (index === 0) ctx.moveTo(p.sx, p.sy);
    else ctx.lineTo(p.sx, p.sy);
  });
  ctx.closePath();
  ctx.fillStyle = "rgba(238, 231, 203, .045)";
  ctx.fill();

  categories.forEach((_, ci) => {
    drawLine(project(axisBasePoint(ci, 0, 0)), project(axisBasePoint(ci, periods.length - 1, 0)), "rgba(238,231,203,.12)", .8, [4, 5]);
  });
  periods.forEach((_, pi) => {
    drawLine(project(axisBasePoint(0, pi, 0)), project(axisBasePoint(categories.length - 1, pi, 0)), "rgba(238,231,203,.12)", .8, [4, 5]);
  });
  for (let v = 1; v <= Z_AXIS_MAX; v += 1) {
    drawLine(project(axisBasePoint(0, 0, v)), project(axisBasePoint(0, periods.length - 1, v)), "rgba(238,231,203,.10)", .8, [3, 5]);
    drawText(String(v), project({ ...axisBasePoint(0, 0, v), x: axisBasePoint(0, 0, v).x - .12 }), "rgba(238,231,203,.58)", 14, "right");
  }

  drawLine(project(x0), project({ ...x1, x: x1.x + .22 }), "rgba(239,214,125,.82)", 1.5);
  drawLine(project(x0), project({ ...y1, y: y1.y + .22 }), "rgba(239,214,125,.70)", 1.5);
  drawLine(project(x0), project({ ...z1, z: z1.z + .20 }), "rgba(239,214,125,.76)", 1.5);
  drawText("题材", project({ ...x1, x: x1.x + .26, y: x1.y + .03 }), "rgba(239,214,125,.86)", 16, "left");
  drawText("朝代", project({ ...y1, x: y1.x - .08, y: y1.y + .30 }), "rgba(239,214,125,.86)", 16, "right");
  drawText("数量", project({ ...z1, x: z1.x - .05, z: z1.z + .18 }), "rgba(239,214,125,.86)", 16, "left");

  categories.forEach((cat, ci) => {
    drawText(cat, project(categoryLabelPoint(ci)), "rgba(238,231,203,.72)", 14);
  });
  periods.forEach((period, pi) => {
    const color = periodColors[period].hi;
    drawText(period, project(periodLabelPoint(pi)), color, 14, "right");
  });

  const bands = periods.map((period, pi) => {
    const nodes = categories.map((category, ci) => {
      const list = groupedWorks(period, category);
      const base3d = axisPoint(ci, pi, 0);
      const point3d = axisPoint(ci, pi, list.length);
      return {
        period,
        category,
        value: list.length,
        list,
        base3d,
        point3d,
        base: project(base3d),
        peak: project(point3d),
        color: periodColors[period]
      };
    });
    return {
      period,
      nodes,
      color: periodColors[period],
      depth: nodes.reduce((sum, node) => sum + node.base.depth, 0) / nodes.length
    };
  }).sort((a, b) => a.depth - b.depth);

  bands.forEach((band) => {
    const topCurve = catmullPoints(band.nodes.map((node) => node.peak), 18);
    const baseCurve = catmullPoints(band.nodes.map((node) => node.base), 18);
    const minY = Math.min(...topCurve.map((p) => p.sy));
    const maxY = Math.max(...baseCurve.map((p) => p.sy));
    const fill = ctx.createLinearGradient(0, minY, 0, maxY);
    fill.addColorStop(0, rgba(band.color.base, .62));
    fill.addColorStop(.52, rgba(band.color.base, .26));
    fill.addColorStop(1, rgba(band.color.base, .035));

    ctx.beginPath();
    ctx.moveTo(topCurve[0].sx, topCurve[0].sy);
    topCurve.forEach((p) => ctx.lineTo(p.sx, p.sy));
    for (let i = baseCurve.length - 1; i >= 0; i -= 1) ctx.lineTo(baseCurve[i].sx, baseCurve[i].sy);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(topCurve[0].sx, topCurve[0].sy);
    topCurve.forEach((p) => ctx.lineTo(p.sx, p.sy));
    ctx.strokeStyle = rgba(band.color.hi, .88);
    ctx.lineWidth = 1.7;
    ctx.stroke();

    band.nodes.forEach((node) => {
      if (!node.value) return;
      const lift = project({ ...node.point3d, z: node.point3d.z + .22 });
      const isActive = (activeHit && activeHit.period === node.period && activeHit.category === node.category) ||
        (selectedHit && selectedHit.period === node.period && selectedHit.category === node.category);
      const r = (10 + node.value * 4.5) * lift.perspective;

      drawLine(node.peak, lift, rgba(node.color.hi, isActive ? .62 : .30), isActive ? 1.4 : .9, [3, 4]);
      ctx.beginPath();
      ctx.arc(lift.sx, lift.sy, r, 0, Math.PI * 2);
      ctx.fillStyle = rgba(node.color.base, isActive ? .78 : .46);
      ctx.fill();
      ctx.strokeStyle = rgba(node.color.hi, isActive ? 1 : .82);
      ctx.lineWidth = isActive ? 2.2 : 1.2;
      ctx.stroke();

      ctx.fillStyle = isActive ? "#fff6db" : "rgba(238,231,203,.88)";
      ctx.font = "16px FZLiShu, Microsoft YaHei, serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(node.value, lift.sx, lift.sy + .5);

      hits.push({
        x: lift.sx,
        y: lift.sy,
        radius: r + 7,
        period: node.period,
        category: node.category,
        value: node.value,
        list: node.list,
        materialSummary: countBy(node.list, "material"),
        museumSummary: countBy(node.list, "museum")
      });
    });
  });
}

function requestDraw() {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(drawChart);
}

function showTip(hit, event) {
  const worksHtml = hit.list.map((item) => `
    <div class="tip-work">
      <b>${item.title}</b><br>
      <span>${item.dynasty}｜${item.author}｜${item.material}</span><br>
      <span>馆藏：${item.museum}</span>
    </div>
  `).join("");
  tip.innerHTML = `
    <strong>${hit.period} · ${hit.category}</strong>
    <span>共 ${hit.value} 件鼓相关画作</span>
    <div class="tip-meta">
      <span>材质：${hit.materialSummary}</span>
      <span>馆藏：${hit.museumSummary}</span>
    </div>
    ${worksHtml}
  `;
  const x = Math.min(event.clientX + 18, window.innerWidth - 410);
  const y = Math.min(event.clientY + 18, window.innerHeight - 220);
  tip.style.left = `${Math.max(16, x)}px`;
  tip.style.top = `${Math.max(16, y)}px`;
  tip.classList.add("visible");
}

function hideTip() {
  if (!selectedHit) tip.classList.remove("visible");
}

function findHit(event) {
  const rect = chart.getBoundingClientRect();
  const mx = event.clientX - rect.left;
  const my = event.clientY - rect.top;
  return hits.find((hit) => Math.hypot(mx - hit.x, my - hit.y) <= hit.radius);
}

function initChartEvents() {
  chart.addEventListener("pointerdown", (event) => {
    view.dragging = true;
    view.moved = false;
    view.lastX = event.clientX;
    view.lastY = event.clientY;
    chart.setPointerCapture(event.pointerId);
  });

  chart.addEventListener("pointermove", (event) => {
    if (view.dragging) {
      const dx = event.clientX - view.lastX;
      const dy = event.clientY - view.lastY;
      if (Math.abs(dx) + Math.abs(dy) > 2) view.moved = true;
      view.rotY += dx * .008;
      /* 中文脚注：这里限定纵向旋转角度，确保 Z 轴始终朝上；修改范围请调 CHART_ROT_X_MIN / CHART_ROT_X_MAX。 */
      view.rotX = clamp(view.rotX - dy * .008, CHART_ROT_X_MIN, CHART_ROT_X_MAX);
      view.lastX = event.clientX;
      view.lastY = event.clientY;
      requestDraw();
      return;
    }

    const found = findHit(event);
    if (found) {
      activeHit = found;
      showTip(found, event);
    } else {
      activeHit = null;
      hideTip();
    }
    requestDraw();
  });

  chart.addEventListener("pointerup", (event) => {
    view.dragging = false;
    const found = findHit(event);
    if (found && !view.moved) {
      selectedHit = selectedHit && selectedHit.period === found.period && selectedHit.category === found.category ? null : found;
      if (selectedHit) showTip(selectedHit, event);
      else tip.classList.remove("visible");
      requestDraw();
    }
  });

  chart.addEventListener("pointerleave", () => {
    view.dragging = false;
    activeHit = null;
    hideTip();
    requestDraw();
  });

  chart.addEventListener("wheel", (event) => {
    event.preventDefault();
    view.scale = Math.max(.68, Math.min(1.65, view.scale - event.deltaY * .001));
    requestDraw();
  }, { passive: false });

  window.addEventListener("resize", requestDraw);
}

function renderLegend() {
  legend.innerHTML = periods.map((period) => {
    const color = periodColors[period].hi;
    return `<div class="legend-item"><span class="legend-mark" style="background:${color};color:${color}"></span>${period}</div>`;
  }).join("");
}

function renderGallery() {
  const grid = document.getElementById("paintingGrid");
  grid.innerHTML = assets.map((asset, index) => {
    const work = works.find((item) => item.title === asset.title);
    const label = asset.label || asset.title;
    const meta = work ? `${work.dynasty}｜${work.author}｜${work.museum}` : "";
    const intro = work ? work.intro : "暂无画作介绍。";
    const loading = index < 6 ? "eager" : "lazy";

    return `
      <article class="painting-card" tabindex="0" data-index="${index}" data-shape="${asset.shape}">
        <img src="鼓画作assets/${asset.file}" alt="${label}" loading="${loading}" decoding="async" />
        <div class="painting-caption">${label}</div>
      </article>
    `;
  }).join("");

  initGalleryInteractions();
}

function getAssetInfo(index) {
  const asset = assets[index];
  const work = works.find((item) => item.title === asset.title);
  return {
    asset,
    work,
    label: asset.label || asset.title,
    meta: work ? `${work.dynasty}｜${work.author}｜${work.museum}` : "",
    intro: work ? work.intro : "暂无画作介绍。"
  };
}

function ensureFloatCard() {
  let card = document.getElementById("paintingInfoCard");
  if (!card) {
    card = document.createElement("aside");
    card.id = "paintingInfoCard";
    card.className = "painting-float-card";
    document.body.appendChild(card);
  }
  return card;
}

function ensureLightbox() {
  let box = document.getElementById("imageLightbox");
  if (!box) {
    box = document.createElement("section");
    box.id = "imageLightbox";
    box.className = "image-lightbox";
    box.setAttribute("aria-modal", "true");
    box.setAttribute("role", "dialog");
    box.innerHTML = `
      <button class="lightbox-close" type="button" aria-label="关闭大图">×</button>
      <div class="lightbox-image-wrap"><img alt="" /></div>
      <div class="lightbox-info">
        <h3></h3>
        <div class="painting-meta"></div>
        <div class="painting-intro"></div>
      </div>
    `;
    document.body.appendChild(box);
    box.querySelector(".lightbox-close").addEventListener("click", closeLightbox);
    box.querySelector(".lightbox-image-wrap").addEventListener("wheel", (event) => {
      /* 中文脚注：在大图区域滚轮缩放图片；只阻止弹窗内滚动，不影响页面其他区域。 */
      event.preventDefault();
      setLightboxZoom(lightboxZoom + (event.deltaY < 0 ? LIGHTBOX_ZOOM_STEP : -LIGHTBOX_ZOOM_STEP));
    }, { passive: false });
    box.addEventListener("click", (event) => {
      if (event.target === box) closeLightbox();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeLightbox();
    });
  }
  return box;
}

function setLightboxZoom(value) {
  /* 中文脚注：修改缩放上下限请调 LIGHTBOX_ZOOM_MIN / LIGHTBOX_ZOOM_MAX，当前允许 0.6 倍到 4 倍。 */
  lightboxZoom = Math.max(LIGHTBOX_ZOOM_MIN, Math.min(LIGHTBOX_ZOOM_MAX, value));
  const img = document.querySelector("#imageLightbox img");
  if (img) img.style.setProperty("--lightbox-zoom", lightboxZoom);
}

function showPaintingCard(index, event) {
  const card = ensureFloatCard();
  const info = getAssetInfo(index);
  card.innerHTML = `
    <h3>${info.label}</h3>
    <div class="painting-meta">${info.meta}</div>
    <div class="painting-intro">${info.intro}</div>
  `;

  const width = 330;
  const left = Math.min(event.clientX + 18, window.innerWidth - width - 16);
  const top = Math.min(event.clientY + 18, window.innerHeight - 230);
  card.style.left = `${Math.max(16, left)}px`;
  card.style.top = `${Math.max(16, top)}px`;
  card.classList.add("visible");
}

function hidePaintingCard() {
  const card = ensureFloatCard();
  card.classList.remove("visible");
}

function openLightbox(index) {
  const box = ensureLightbox();
  const info = getAssetInfo(index);
  const img = box.querySelector("img");
  setLightboxZoom(1);
  img.src = `鼓画作assets/${info.asset.file}`;
  img.alt = info.label;
  box.querySelector(".lightbox-info h3").textContent = info.label;
  box.querySelector(".lightbox-info .painting-meta").textContent = info.meta;
  box.querySelector(".lightbox-info .painting-intro").textContent = info.intro;
  box.classList.add("visible");
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  const box = document.getElementById("imageLightbox");
  if (!box) return;
  box.classList.remove("visible");
  setLightboxZoom(1);
  document.body.style.overflow = "";
}

function initGalleryInteractions() {
  document.querySelectorAll(".painting-card").forEach((card) => {
    const index = Number(card.dataset.index);
    card.addEventListener("pointerenter", (event) => showPaintingCard(index, event));
    card.addEventListener("pointermove", (event) => showPaintingCard(index, event));
    card.addEventListener("pointerleave", hidePaintingCard);
    card.addEventListener("focus", (event) => showPaintingCard(index, event));
    card.addEventListener("blur", hidePaintingCard);
    card.addEventListener("click", () => openLightbox(index));
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openLightbox(index);
      }
    });
  });
}

function boot() {
  initPageSwitcher();
  renderLegend();
  renderGallery();
  initChartEvents();
  requestDraw();
}

function initPageSwitcher() {
  const switcher = document.getElementById("pageSwitcher");
  if (!switcher) return;
  const buttons = [...switcher.querySelectorAll(".switch-item")];
  const order = ["sound", "painting", "chronicle"];
  const step = 46;

  function layout(activePage, emit = true) {
    const activeIndex = order.indexOf(activePage);
    buttons.forEach((button) => {
      const itemIndex = order.indexOf(button.dataset.page);
      const offset = (itemIndex - activeIndex) * step;
      const isActive = button.dataset.page === activePage;
      button.style.setProperty("--x", `${offset}px`);
      button.classList.toggle("active", isActive);
      button.setAttribute("aria-current", isActive ? "page" : "false");
      button.tabIndex = isActive ? 0 : -1;
    });

    if (emit) {
      switcher.dispatchEvent(new CustomEvent("pagechange", {
        bubbles: true,
        detail: { page: activePage }
      }));
    }
  }

  buttons.forEach((button) => {
    button.addEventListener("pointerdown", () => button.classList.add("pressed"));
    button.addEventListener("pointerup", () => button.classList.remove("pressed"));
    button.addEventListener("pointercancel", () => button.classList.remove("pressed"));
    button.addEventListener("click", () => layout(button.dataset.page));
    button.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
      event.preventDefault();
      const current = order.indexOf(button.dataset.page);
      const direction = event.key === "ArrowRight" ? 1 : -1;
      const nextPage = order[(current + direction + order.length) % order.length];
      layout(nextPage);
      switcher.querySelector(`[data-page="${nextPage}"]`)?.focus();
    });
  });

  window.drumPageSwitcher = {
    setPage: (page) => { if (order.includes(page)) layout(page); },
    getPage: () => switcher.querySelector(".active")?.dataset.page
  };

  layout("painting", false);
}

if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(boot);
} else {
  boot();
}
