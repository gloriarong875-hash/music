const assetUrl = (path) => new URL(`./琴地图/${path}`, window.location.href).href;

const qinAssets = {
  background: assetUrl('background.png'),
  cardArt: assetUrl('card-art.png'),
  audio: {
    xiaoXiangShuiYun: assetUrl('audio/潇湘水云.mp3'),
    puAnZhou: assetUrl('audio/普庵咒.mp3'),
    biJianLiuQuan: assetUrl('audio/碧涧流泉.mp3'),
    zuiYuChangWan: assetUrl('audio/醉渔唱晚.mp3'),
    meiHuaSanNong: assetUrl('audio/梅花三弄.mp3'),
    changMenYuan: assetUrl('audio/长门怨.mp3'),
    daoYi: assetUrl('audio/捣衣.mp3'),
    guangLingSan: assetUrl('audio/广陵散.mp3'),
  },
};

export const qinChronicle = [
  {
    era: '南宋末年', period: '临安琴学兴盛', title: '浙派', location: '浙江杭州、南宋临安一带',
    story: '浙派古琴与浙江杭州、南宋临安一带的文化环境关系密切。南宋时期，临安作为都城，文人雅集、宫廷音乐与江南审美交汇，推动了琴乐风格的发展。浙派琴风清雅流畅、含蓄细腻，重视音韵与文人意趣。近现代以来，浙地琴学又经整理与复兴，使新浙派成为连接古代琴学与当代传播的重要脉络。',
    track: '《潇湘水云》', audio: qinAssets.audio.xiaoXiangShuiYun, mapLabel: '浙派 · 浙江杭州', provinceAdcodes: [330000], center: [120.15, 30.28], zoom: 2.04,
  },
  {
    era: '明末清初', period: '常熟文人琴学成派', title: '虞山派', location: '江苏常熟、太仓一带',
    story: '虞山派形成于明末清初，主要流行于江苏常熟、太仓一带。代表人物严澂主张琴乐应清微淡远、雅正平和，反对过度繁复和炫技化的演奏倾向。虞山派强调音色洁净、节奏从容、意境深远，具有浓厚的文人审美气质，是明清以来最具代表性的古琴流派之一。',
    track: '《普庵咒》', audio: qinAssets.audio.puAnZhou, mapLabel: '虞山派 · 江苏常熟', provinceAdcodes: [320000], center: [120.75, 31.65], zoom: 2.08,
  },
  {
    era: '清代', period: '岭南地域化发展', title: '岭南派', location: '广东广州、珠三角一带',
    story: '岭南派形成于清代，主要流行于广东广州、珠三角一带。岭南地区商业活跃、文化开放，琴乐也呈现出鲜明的地域气质。岭南派琴风爽朗明快，兼具清雅与活泼，旋律处理富有弹性，常带有南方音乐细腻婉转又不失明亮的特点。',
    track: '《碧涧流泉》', audio: qinAssets.audio.biJianLiuQuan, mapLabel: '岭南派 · 广东广州', provinceAdcodes: [440000], center: [113.27, 23.13], zoom: 1.94,
  },
  {
    era: '清代成派', period: '巴蜀琴风源流更早', title: '蜀派 / 川派 / 泛川派', location: '四川成都、青城山一带',
    story: '蜀派又称川派，主要流行于四川成都、青城山一带。蜀地琴风源流较早，清代逐渐形成较明确的流派特色。其音乐气质雄健、苍劲、跌宕而富有山川之气，既有巴蜀地域的豪放，也有道教名山文化的清幽。泛川派则是以四川琴学为中心向周边扩展的广义传承系统。',
    track: '《醉渔唱晚》', audio: qinAssets.audio.zuiYuChangWan, mapLabel: '蜀派 · 四川成都', provinceAdcodes: [510000], center: [103.9, 30.9], zoom: 1.87,
  },
  {
    era: '清代中期', period: '扬州琴坛兴盛', title: '广陵派', location: '江苏扬州',
    story: '广陵派形成于清代中期，主要流行于江苏扬州。清代扬州商业繁荣、文人荟萃，为琴乐发展提供了活跃环境。广陵派琴风跌宕洒脱，节奏变化丰富，既有文人琴的雅致，也有江淮地区音乐的开阔气韵，其代表曲目和传谱影响深远。',
    track: '《梅花三弄》', audio: qinAssets.audio.meiHuaSanNong, mapLabel: '广陵派 · 江苏扬州', provinceAdcodes: [320000], center: [119.42, 32.39], zoom: 2.08,
  },
  {
    era: '19世纪中叶', period: '山东文人琴学传承', title: '诸城派', location: '山东诸城',
    story: '诸城派形成于19世纪中叶左右，主要流行于山东诸城。它与山东地区的文人传统和地方音乐环境密切相关，琴风朴实古雅、刚柔相济，重视旋律线条与吟猱韵味的结合。诸城派传承脉络较清晰，近现代以来影响较大，是北方古琴流派中具有代表性的一支。',
    track: '《长门怨》', audio: qinAssets.audio.changMenYuan, mapLabel: '诸城派 · 山东诸城', provinceAdcodes: [370000], center: [119.41, 35.99], zoom: 2.02,
  },
  {
    era: '清末民初', period: '1929年梅庵琴社成立', title: '梅庵派', location: '起源山东，后传至南京、镇江、合肥等地',
    story: '梅庵派源流可追溯至清代嘉庆以后，清末民初逐渐定型，1929年梅庵琴社成立后影响扩大。它起源于山东，后在南京、镇江、合肥等地传播。梅庵派琴风清新流畅，节奏灵活，旋律性强，具有近现代传播和教学的开放气质。',
    track: '《捣衣》', audio: qinAssets.audio.daoYi, mapLabel: '梅庵派 · 鲁苏皖', provinceAdcodes: [370000, 320000, 340000], center: [117.7, 33.2], zoom: 1.58,
  },
  {
    era: '近代', period: '北京琴坛与学术整理', title: '九嶷派', location: '北京',
    story: '九嶷派主要与近代北京琴坛相关，名称来自杨宗稷的号“九嶷山人”。杨宗稷重视琴学理论、谱本整理和古琴教育，对近代琴学传播影响很大。九嶷派既承接清代琴学传统，又带有近代学术整理和城市琴坛传播的特点，风格注重规整、古雅与学理性。',
    track: '《广陵散》', audio: qinAssets.audio.guangLingSan, mapLabel: '九嶷派 · 北京', provinceAdcodes: [110000], center: [116.4, 39.9], zoom: 2.04,
  },
];

export const qinConfig = {
  key: 'qin', title: '琴韵 · 古琴流派地图', description: '古琴流派、地域与历史传播可视化',
  seal: '琴', brand: '琴韵', archive: 'QIN ARCHIVE', subject: '古琴', chronicle: qinChronicle,
  eraPositions: [[47, 5], [31, 17], [51, 29], [34, 41], [51, 53], [34, 65], [51, 77], [43, 89]], startCenter: [120.15, 30.28],
  background: qinAssets.background, cardArt: qinAssets.cardArt, cardArtSize: '74%', cardOverlay: 'rgba(232,226,211,.89)',
  chronicleTitle: '八种古琴流派的地域与时代脉络',
  views: {
    object: { kicker: 'QIN · MATERIAL STUDY', title: '琴面、琴弦与徽位', cardTitle: '古琴的构造', location: '琴面 · 琴弦 · 徽位 · 雁足', story: '古琴由狭长的琴体、七根琴弦与十三个徽位构成。琴面与底板围合成共鸣腔，演奏者以散音、按音和泛音塑造深沉而细腻的声音层次。', track: '查看器物结构' },
    phenomenon: { kicker: 'QIN · SOUND PHENOMENON', title: '弦振与共鸣腔', cardTitle: '古琴如何发声', location: '弦振动 · 木质共鸣 · 吟猱绰注', story: '手指拨动琴弦后，振动经琴码与琴面传入木质共鸣腔。左手按弦、滑动和吟猱改变音高与余韵，使一个音在时间中呈现丰富的虚实变化。', track: '触发琴声音型' },
    chronicle: { kicker: 'QIN · SCHOOLS' },
  },
};
