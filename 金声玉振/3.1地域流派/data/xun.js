const assetUrl = (path) => new URL(`./埙/assets/${path}`, window.location.href).href;

const xunAssets = {
  background: assetUrl('background.png'),
  cardArt: assetUrl('card-art.png'),
  audio: {
    chuGe: assetUrl('audio/埙独奏 楚歌.aac'),
    suWuMuYang: assetUrl('audio/埙独奏 苏武牧羊.aac'),
    nanXiangXiaoDiao: assetUrl('audio/【埙】《南乡小调》.aac'),
    aiYing: assetUrl('audio/埙独奏《哀郢》.aac'),
    zhuangTaiQiuSi: assetUrl('audio/埙独奏 妆台秋思.aac'),
    banGeYueLiang: assetUrl('audio/埙合奏《半个月亮爬上来》.aac'),
  },
};

export const xunChronicle = [
  {
    era: '距今约7000年', period: '河姆渡文化线索', title: '河姆渡遗址', location: '浙江省余姚市，今宁波余姚',
    story: '河姆渡遗址出土的早期陶制吹奏器物，是埙起源研究中的重要线索之一。它说明埙类乐器很早就与先民的生活、祭祀和自然声音感知发生联系，具有浓厚的原始音乐色彩。',
    track: '《楚歌》', audio: xunAssets.audio.chuGe, mapLabel: '浙江余姚 · 河姆渡遗址', provinceAdcodes: [330000], center: [121.16, 30.04], zoom: 2.08,
  },
  {
    era: '距今约6000年', period: '仰韶文化早期陶埙', title: '半坡遗址', location: '陕西省西安市半坡村，今西安市浐灞生态区半坡街道',
    story: '半坡陶埙是中国早期埙类乐器的重要代表，体现了黄河流域新石器时代音乐文化的发展。其形制朴素、音色古拙，为后世埙的发展奠定了基础。',
    track: '《苏武牧羊》', audio: xunAssets.audio.suWuMuYang, mapLabel: '陕西西安 · 半坡遗址', provinceAdcodes: [610000], center: [109.07, 34.27], zoom: 2.02,
  },
  {
    era: '龙山文化时期', period: '黄河中游遗存', title: '万荣县遗址', location: '山西省万荣县，今运城市万荣县',
    story: '万荣县遗址的埙类遗存反映出黄河中游地区早期陶制吹奏乐器的发展脉络，说明埙在中原及周边地区并非孤立出现，而是在不同聚落文化中逐渐传播和演变。',
    track: '《南乡小调》', audio: xunAssets.audio.nanXiangXiaoDiao, mapLabel: '山西运城 · 万荣县', provinceAdcodes: [140000], center: [110.84, 35.42], zoom: 1.96,
  },
  {
    era: '仰韶文化时期', period: '北方音乐考古材料', title: '小里村遗址', location: '河北省邢台市柏乡县小里村',
    story: '小里村遗址的埙类发现为北方地区早期音乐考古提供了重要材料，体现出埙在新石器时代已经具有较广的地域分布，也为研究早期陶制乐器传播提供依据。',
    track: '《哀郢》', audio: xunAssets.audio.aiYing, mapLabel: '河北邢台 · 小里村', provinceAdcodes: [130000], center: [114.73, 37.49], zoom: 1.94,
  },
  {
    era: '传统古曲改编', period: '怀古、离别与历史题材', title: '古曲埙乐', location: '以传统古曲、琴曲、民歌和历史题材音乐改编为主',
    story: '埙的音色低回、苍凉、幽远，适合表现怀古、离别、思乡和悲怆主题。古曲埙乐多由传统乐曲改编而来，共同塑造了埙古朴、深沉、富有历史感的听觉形象。',
    track: '《妆台秋思》', audio: xunAssets.audio.zhuangTaiQiuSi, mapLabel: '古曲改编 · 中原与江南传统', provinceAdcodes: [410000, 420000, 330000, 610000], center: [113.2, 32.8], zoom: 1.38,
  },
  {
    era: '20世纪以来', period: '现代舞台与新编曲目', title: '现代新编埙曲', location: '20世纪以来逐渐发展',
    story: '20世纪以来，埙逐渐从考古与礼乐记忆中的古老乐器走向现代舞台。刘宽忍、张维良、黄金成、王次恒等作曲家和演奏家创作、改编了一批现代埙曲，使埙具备更丰富的旋律表现力和舞台感染力。',
    track: '《半个月亮爬上来》', audio: xunAssets.audio.banGeYueLiang, mapLabel: '现代新编 · 舞台传播', provinceAdcodes: [110000, 610000, 310000], center: [112.6, 35.8], zoom: 1.36,
  },
];

export const xunConfig = {
  key: 'xun', title: '埙声 · 埙的遗址与曲目地图', description: '埙的考古遗址、曲目类型与现代传播可视化',
  seal: '埙', brand: '埙声', archive: 'XUN ARCHIVE', subject: '埙', chronicle: xunChronicle,
  eraPositions: [[47, 7], [31, 24], [51, 41], [34, 58], [50, 75], [58, 88]], startCenter: [121.16, 30.04],
  background: xunAssets.background, cardArt: xunAssets.cardArt, cardArtSize: '72%', cardOverlay: 'rgba(232,226,211,.88)',
  chronicleTitle: '埙的遗址线索与曲目传播脉络',
  views: {
    object: { kicker: 'XUN · MATERIAL STUDY', title: '陶土、吹口与音孔', cardTitle: '埙的构造', location: '陶腔 · 吹口 · 音孔 · 共鸣体', story: '埙多以陶土烧制，内部为空腔，顶部或侧面设吹口，器身开有音孔。气流进入陶腔后形成低回、浑厚而带有泥土质感的声音。', track: '查看器物结构' },
    phenomenon: { kicker: 'XUN · SOUND PHENOMENON', title: '陶腔中的远古回声', cardTitle: '埙如何发声', location: '边棱激发 · 陶腔共鸣', story: '演奏者将气流送入吹口，空气柱在陶腔中振动并与孔位变化共同决定音高。陶质腔体削弱明亮泛音，使音色呈现苍凉、幽远和朴拙的听感。', track: '触发埙声音型' },
    chronicle: { kicker: 'XUN · CHRONICLE' },
  },
};
