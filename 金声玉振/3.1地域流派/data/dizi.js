const assetUrl = (path) => new URL(`./笛地图/assets/${path}`, window.location.href).href;

const diziAssets = {
  background: assetUrl('background.jpg'),
  cardArt: assetUrl('card-art.png'),
  audio: {
    xiXiangFeng: assetUrl('audio/xi-xiang-feng.mp3'),
    guSuXing: assetUrl('audio/gu-su-xing.mp3'),
    meiHuaSanNong: assetUrl('audio/mei-hua-san-nong.mp3'),
    sanWuQi: assetUrl('audio/san-wu-qi.mp3'),
    muDi: assetUrl('audio/mu-di.mp3'),
  },
};

export const diziChronicle = [
  {
    era: '民间源流', period: '20世纪50年代定型', title: '北派梆笛', location: '华北、东北、西北，重点在河北、山西、内蒙古、北京',
    story: '北派梆笛与梆子腔、二人台和北方民间器乐关系密切。音色高亢明亮，常用吐音、滑音、垛音、花舌等技巧。20世纪50年代以后，冯子存、刘管乐等人将民间曲牌改编为独奏曲，使其成为现代竹笛的重要流派。',
    track: '《喜相逢》', audio: diziAssets.audio.xiXiangFeng, mapLabel: '北派 · 京冀晋蒙', provinceAdcodes: [110000, 130000, 140000, 150000], center: [113.2, 39.5], zoom: 1.52,
  },
  {
    era: '江南源流', period: '20世纪50年代定型', title: '南派曲笛', location: '上海、江苏南部、浙江北部',
    story: '南派曲笛深受昆曲、江南丝竹和吴地民间音乐影响，音色圆润柔和，重视气息、韵味与指法装饰。20世纪50年代以后，陆春龄、赵松庭等人推动曲笛从戏曲伴奏和民间合奏走向舞台独奏。',
    track: '《姑苏行》', audio: diziAssets.audio.guSuXing, mapLabel: '南派 · 沪苏浙', provinceAdcodes: [310000, 320000, 330000], center: [120.6, 31], zoom: 1.95,
  },
  {
    era: '明清源流', period: '昆曲与弦索传统', title: '江南丝竹笛乐', location: '上海、苏州、无锡及浙江西部',
    story: '江南丝竹笛乐的源流可追溯至明代昆曲水磨腔和吴中“弦索”传统。笛子在合奏中常承担主旋律、加花与润饰，风格讲究“小、细、轻、雅”，具有鲜明的江南水乡气质。',
    track: '《梅花三弄》', audio: diziAssets.audio.meiHuaSanNong, mapLabel: '丝竹 · 沪苏浙', provinceAdcodes: [310000, 320000, 330000], center: [120.2, 30.8], zoom: 1.9,
  },
  {
    era: '1950年代后', period: '南北交融成派', title: '浙派竹笛', location: '浙江杭州、东阳、金华一带',
    story: '浙派竹笛以赵松庭为代表，20世纪50年代以后逐渐成熟。它吸收南派曲笛的细腻韵味，又融合北派梆笛的力度与舞台表现，形成刚柔并济、南北交融的风格。',
    track: '《三五七》', audio: diziAssets.audio.sanWuQi, mapLabel: '浙派 · 杭州 / 金华', provinceAdcodes: [330000], center: [120.2, 29.4], zoom: 2.02,
  },
  {
    era: '1956年', period: '专业舞台新语言', title: '新派笛子 / 刘森派', location: '北京及专业院团系统',
    story: '新派笛子以刘森为代表，形成于20世纪50年代。1956年创作的《牧笛》是重要节点。它强调旋律的歌唱性、音域拓展与现代音乐表达，在舞台创作中形成不完全依附南北派传统的新语言。',
    track: '《牧笛》', audio: diziAssets.audio.muDi, mapLabel: '新派 · 北京', provinceAdcodes: [110000], center: [116.4, 39.9], zoom: 2.05,
  },
  {
    era: '1970年代后', period: '学院综合发展', title: '现代学院融合派', location: '北京、上海、杭州等音乐学院与专业院团',
    story: '现代学院融合派吸收北派的力度、南派的韵味、浙派的融合思路和新派的创作方法，使竹笛进入协奏曲、室内乐、跨界音乐与国际舞台。它不是单一地域门派，而是持续发展的综合趋势。',
    track: '代表曲目待补充', mapLabel: '学院派 · 京沪杭', provinceAdcodes: [110000, 310000, 330000], center: [117, 34.5], zoom: 1.35,
  },
];

export const diziConfig = {
  key: 'dizi', title: '笛韵 · 竹笛流派地图', description: '竹笛流派、声学与地域传播可视化',
  seal: '笛', brand: '笛韵', archive: 'DIZI ARCHIVE', subject: '竹笛', chronicle: diziChronicle,
  eraPositions: [[47, 7], [31, 24], [51, 41], [34, 58], [50, 75], [58, 88]], startCenter: [113.2, 39.5],
  background: diziAssets.background, cardArt: diziAssets.cardArt, cardArtSize: '70%', cardOverlay: 'rgba(232,226,211,.90)',
  chronicleTitle: '六种竹笛流派的地域与时代脉络',
  views: {
    object: { kicker: 'DIZI · MATERIAL STUDY', title: '竹管、吹孔与指孔', cardTitle: '竹笛的构造', location: '吹孔 · 膜孔 · 音孔 · 笛身', story: '竹笛以竹管为主体，由吹孔、膜孔和音孔共同构成。气流越过吹孔边棱激发管内空气柱振动，笛膜则赋予声音清亮而富有颗粒感的音色。', track: '查看器物结构' },
    phenomenon: { kicker: 'DIZI · SOUND PHENOMENON', title: '气流与笛膜的共振', cardTitle: '竹笛如何发声', location: '边棱音与空气柱耦合', story: '演奏者控制气流速度和角度，使空气柱产生稳定振动。指孔改变有效管长，笛膜随声波振动，为不同流派带来明亮、圆润或高亢的音色变化。', track: '触发笛声音型' },
    chronicle: { kicker: 'DIZI · SCHOOLS' },
  },
};
