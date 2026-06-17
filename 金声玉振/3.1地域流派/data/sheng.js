const assetUrl = (path) => new URL(`./笙/assets/${path}`, window.location.href).href;

export const shengChronicle = [
  {
    era: '清代以来', period: '约二百年村社传承', title: '冀中笙管乐', location: '河北中部平原',
    story: '冀中笙管乐流传于河北中部平原，以管子领奏、笙等乐器合奏，民间俗称“音乐会”。它常用于祭祀、礼仪、丧葬等村社活动，具有浓厚的民间礼俗色彩，是以村落为单位世代传承的区域性笙管乐系统。',
    track: '《放驴》', audio: assetUrl('audio/fang-lv.mp3'), mapLabel: '河北省 · 冀中平原', provinceAdcode: 130000, center: [115.3, 38.3], zoom: 1.82,
  },
  {
    era: '唐宋源流', period: '明清保存完整', title: '西安鼓乐系统', location: '陕西西安及周边',
    story: '西安鼓乐流传于古长安及周边地区，依托寺庙、道观和民间乐社传承。它以笙、管、笛和打击乐组成大型合奏，保留了古代燕乐、教坊大曲等音乐遗响，风格庄重宏大，历史纵深感强。',
    track: '代表曲目待补充', mapLabel: '陕西省 · 西安市', provinceAdcode: 610000, center: [108.94, 34.34], zoom: 1.9,
  },
  {
    era: '1950年代', period: '独奏艺术形成', title: '晋派 / 山西胡派笙', location: '山西忻州、太原一带',
    story: '晋派笙以胡天泉等山西笙家为代表，吸收山西梆子、晋剧和北方鼓吹乐风格。1950年代后，笙逐渐从合奏、伴奏中走向独奏舞台，《凤凰展翅》成为现代笙独奏艺术的重要标志。',
    track: '《凤凰展翅》', audio: assetUrl('audio/feng-huang-zhan-chi.mp3'), mapLabel: '山西省 · 太原 / 忻州', provinceAdcode: 140000, center: [112.55, 38.4], zoom: 1.94,
  },
  {
    era: '1980年代', period: '现代教学体系', title: '山东牟派笙', location: '山东，后与上海教学体系联系密切',
    story: '山东牟派以牟善平为代表，融合山东民间音乐气质与现代笙演奏技巧。它强调气息控制、手指灵活和复调表现，并与37簧加键笙的发展密切相关，是现代笙教学和演奏体系中的重要流派。',
    track: '《微山湖船歌》', audio: assetUrl('audio/wei-shan-hu-chuan-ge.mp3'), mapLabel: '山东省', provinceAdcode: 370000, center: [118.0, 36.4], zoom: 1.84,
  },
  {
    era: '当代', period: '37簧加键体系', title: '现代加键笙 / 上音37簧体系', location: '上海，辐射全国及海外华乐圈',
    story: '现代加键笙体系以37簧加键笙为核心，扩展了传统笙的音域、半音和转调能力。它使笙从传统合奏乐器发展为可独奏、重奏、协奏和跨界创作的现代乐器，代表笙艺术的当代转型方向。',
    track: '代表曲目待补充', mapLabel: '上海市', provinceAdcode: 310000, center: [121.47, 31.23], zoom: 2.02,
  },
]

export const shengConfig = {
    key: 'sheng', title: '和鸣 · 笙的编年地图', description: '笙的器物、声学与历史传播可视化',
    seal: '笙', brand: '和鸣', archive: 'SHENG ARCHIVE', subject: '笙', chronicle: shengChronicle,
    eraPositions: [[47, 10], [31, 29], [51, 48], [34, 68], [49, 88]], startCenter: [111.5, 35.2],
    background: assetUrl('background.png'), cardArt: assetUrl('card-art.png'), cardArtSize: '70%', cardOverlay: 'rgba(232,226,211,.90)',
    performer: assetUrl('performer.gif'), performerAlt: '古画人物吹笙动态展示',
    chronicleTitle: '五种笙乐传统的地域与时代脉络',
    views: {
      object: { kicker: 'SHENG · MATERIAL STUDY', title: '匏斗、簧片与音管', cardTitle: '笙的构造', location: '簧片 · 音管 · 笙斗 · 吹口', story: '笙由多根音管插入笙斗构成。气流使金属簧片振动，吹气和吸气都能发声；多个音管可同时奏响，形成笙独特的和声能力。', track: '查看器物结构' },
      phenomenon: { kicker: 'SHENG · SOUND PHENOMENON', title: '吹吸皆响的自由簧', cardTitle: '自由簧如何发声', location: '气流与簧片耦合', story: '簧舌在气流中往复振动。音高主要由簧片与管内空气柱共同决定，多簧同时振动时形成清晰而富有穿透力的复合音色。', track: '触发和声音型' },
      chronicle: { kicker: 'SHENG · CHRONICLE' },
    },
  };
