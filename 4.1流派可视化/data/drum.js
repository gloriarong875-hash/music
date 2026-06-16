const assetUrl = (path) => new URL(`./鼓地图/assets/${path}`, window.location.href).href;

const drumAssets = {
  background: assetUrl('background.png'),
  cardArt: assetUrl('card-art.png'),
  audio: {
    '安塞腰鼓': assetUrl('audio/安塞腰鼓.mp3'),
    '洛川蹩鼓': assetUrl('audio/洛川蹩鼓.mp3'),
    '绛州鼓乐': assetUrl('audio/绛州鼓乐.mp3'),
    '晋南威风锣鼓': assetUrl('audio/晋南威风锣鼓.mp3'),
    '翼城花鼓': assetUrl('audio/翼城花鼓.mp3'),
    '兰州太平鼓': assetUrl('audio/兰州太平鼓.mp3'),
    '常山战鼓': assetUrl('audio/常山战鼓.mp3'),
    '潮汕大锣鼓': assetUrl('audio/潮汕大锣鼓.mp3'),
  },
};

export const drumChronicle = [
  {
    era: '时代难考', period: '近现代广泛传播', title: '安塞腰鼓', location: '陕西延安安塞区',
    story: '安塞腰鼓流行于陕西延安安塞一带，是陕北黄土高原最具代表性的鼓舞形式之一。它以腰鼓击打和身体舞动为核心，动作奔放有力，节奏热烈激昂，常用于节庆、庆典和群众性表演。其风格粗犷豪迈，集中体现了陕北人民刚健、昂扬的生命力。',
    track: '《安塞腰鼓》', audio: drumAssets.audio['安塞腰鼓'], mapLabel: '陕西省 · 延安安塞', provinceAdcode: 610000, center: [109.33, 36.86], zoom: 1.96,
  },
  {
    era: '战国传说', period: '民间传承至少六代', title: '洛川蹩鼓', location: '陕西延安洛川县',
    story: '洛川蹩鼓流行于陕西延安洛川地区，“蹩”有蹦跳之意，因此它最鲜明的特征是边击鼓边跳跃。其源流常与古代军阵和祭祀活动联系在一起，表演时动作粗犷、节奏强烈，带有浓厚的战斗气息和民俗色彩，是洛川地区重要的民间鼓舞。',
    track: '《洛川蹩鼓》', audio: drumAssets.audio['洛川蹩鼓'], mapLabel: '陕西省 · 延安洛川', provinceAdcode: 610000, center: [109.43, 35.76], zoom: 2.02,
  },
  {
    era: '先秦源流', period: '明清时期发展兴盛', title: '绛州鼓乐', location: '山西运城新绛县',
    story: '绛州鼓乐流行于山西运城新绛一带，是晋南地区极具代表性的民间鼓乐系统。据传其源于先秦，明清时期发展兴盛。它以多种鼓类和打击技巧组合演奏，气势宏大，节奏变化丰富，常与庙会、社火、祭祀和民间节庆活动相结合。',
    track: '《绛州鼓乐》', audio: drumAssets.audio['绛州鼓乐'], mapLabel: '山西省 · 运城新绛', provinceAdcode: 140000, center: [111.22, 35.62], zoom: 2,
  },
  {
    era: '源流久远', period: '20世纪后期传播扩大', title: '晋南威风锣鼓', location: '山西临汾及周边地区',
    story: '晋南威风锣鼓流行于山西临汾及周边地区，是一种大型民间锣鼓艺术。它以鼓、锣、钹等打击乐器组成强烈的节奏阵列，强调群体气势和队形变化。其表演场面宏大，声音雄浑有力，常用于节庆、社火和大型庆典活动，具有强烈的仪式感与震撼力。',
    track: '《晋南威风锣鼓》', audio: drumAssets.audio['晋南威风锣鼓'], mapLabel: '山西省 · 临汾', provinceAdcode: 140000, center: [111.52, 36.09], zoom: 2.04,
  },
  {
    era: '唐代记载', period: '明万历以前已存在', title: '翼城花鼓', location: '山西临汾翼城县',
    story: '翼城花鼓流行于山西临汾翼城县，是集击鼓、舞蹈、歌唱和社火表演于一体的民间鼓舞。其历史可追溯至唐代相关记载，明代以前已较为流行。表演动作欢快热烈，节奏明朗，常用于庆丰收、祭祖、元宵社火等民俗场景，具有浓厚的乡土生活气息。',
    track: '《翼城花鼓》', audio: drumAssets.audio['翼城花鼓'], mapLabel: '山西省 · 临汾翼城', provinceAdcode: 140000, center: [111.72, 35.74], zoom: 2.08,
  },
  {
    era: '明代以来', period: '已有约六百余年历史', title: '兰州太平鼓', location: '甘肃兰州及周边地区',
    story: '兰州太平鼓流行于甘肃兰州及周边地区，已有约六百余年历史。它的鼓身较大，表演者常将鼓挎于身侧击打，并结合大幅度舞蹈动作和队形变化。其风格粗犷豪放、雄健有力，寓意祈求太平、庆贺丰年，是西北地区极具代表性的鼓舞形式。',
    track: '《兰州太平鼓》', audio: drumAssets.audio['兰州太平鼓'], mapLabel: '甘肃省 · 兰州', provinceAdcode: 620000, center: [103.84, 36.06], zoom: 1.94,
  },
  {
    era: '战国雏形', period: '宋元成熟，明代兴盛', title: '常山战鼓', location: '河北石家庄正定县',
    story: '常山战鼓流行于河北石家庄正定一带，因正定古属常山郡而得名。它在战国时期已有雏形，宋元时期逐渐成熟，明代以后兴盛。常山战鼓以鼓、锣、铙、钹等打击乐器构成宏大的声响效果，节奏激越，气势磅礴，具有鲜明的战争想象和地域历史色彩。',
    track: '《常山战鼓》', audio: drumAssets.audio['常山战鼓'], mapLabel: '河北省 · 石家庄正定', provinceAdcode: 130000, center: [114.57, 38.15], zoom: 1.96,
  },
  {
    era: '明清成熟', period: '明代已有锣鼓记载', title: '潮汕大锣鼓', location: '广东潮州、汕头、揭阳',
    story: '潮汕大锣鼓流行于广东潮州、汕头、揭阳等潮汕地区，是潮州音乐中最具场面感的广场乐形式之一。它由锣鼓乐与管弦乐结合而成，常用于游神、庙会、节庆和民间喜庆活动。其音乐气势宏大，同时保留潮乐细腻华丽的旋律韵味。',
    track: '《潮汕大锣鼓》', audio: drumAssets.audio['潮汕大锣鼓'], mapLabel: '广东省 · 潮汕地区', provinceAdcode: 440000, center: [116.68, 23.35], zoom: 1.9,
  },
]

const drumChronicleOrder = [
  '绛州鼓乐',
  '洛川蹩鼓',
  '常山战鼓',
  '翼城花鼓',
  '兰州太平鼓',
  '潮汕大锣鼓',
  '晋南威风锣鼓',
  '安塞腰鼓',
];

drumChronicle.sort((left, right) => (
  drumChronicleOrder.indexOf(left.title) - drumChronicleOrder.indexOf(right.title)
));

export const drumConfig = {
    key: 'drum', title: '鼓动 · 中国鼓乐编年地图', description: '中国鼓乐系统的地域、历史与声响传统可视化',
    seal: '鼓', brand: '鼓动', archive: 'DRUM ARCHIVE', subject: '鼓乐', chronicle: drumChronicle,
    eraPositions: [[47, 5], [31, 17.5], [51, 30], [34, 42.5], [49, 55], [31, 67.5], [51, 80], [38, 92]], startCenter: [109.33, 36.86],
    background: drumAssets.background, cardArt: drumAssets.cardArt, cardArtSize: '92%', cardOverlay: 'rgba(225,218,204,.74)',
    performer: null, performerAlt: '', chronicleTitle: '八种鼓乐传统的地域与时代脉络',
    views: {
      object: { kicker: 'DRUM · MATERIAL STUDY', title: '鼓皮、鼓腔与鼓槌', cardTitle: '鼓的构造', location: '鼓皮 · 鼓腔 · 鼓钉 · 鼓槌', story: '鼓以张紧的鼓膜覆盖鼓腔，击打后鼓膜振动并推动腔内空气共鸣。鼓面材质、鼓腔形制与击打位置共同塑造音高、音色和声音的延续感。', track: '查看鼓体结构' },
      phenomenon: { kicker: 'DRUM · SOUND PHENOMENON', title: '鼓膜振动与群体节奏', cardTitle: '鼓声如何形成', location: '击打 · 振膜 · 共鸣', story: '鼓槌或手掌将瞬时能量传递给鼓膜，低频振动经鼓腔放大。多面鼓与锣钹共同演奏时，强弱、疏密和音区交织成具有推进感的节奏层次。', track: '感受鼓点律动' },
      chronicle: { kicker: 'DRUM · CHRONICLE' },
    },
  };
