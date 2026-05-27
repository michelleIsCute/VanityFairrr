export enum IdentityClass {
  Supermodel = "SUPERMODEL", // 超模
  TopStar = "TOPSTAR", // 顶流女明星
  PrivateArtist = "ARTIST", // 私人艺术家
  InvestmentElite = "INVESTOR", // 商业投资高手
  BrandOwner = "BRAND_OWNER", // 顶流奢侈品牌主理人
  Heiress = "HEIRESS", // 跨国家族继承人
}

export interface CharacterProfile {
  id: string;
  name: string;
  age: number;
  mbti: string;
  avatarColor: string;
  identity: string;
  datingStyle: string;
  vanityFairBehavior: string;
  jealousyThreshold: number; // 嫉妒阈值 %
  powerBottomLine: string; // 权力底线
  physicalCues: string[]; // 肢体语言特征
}

export interface GameStats {
  favorability: Record<string, number>; // 好感度 0-100 (每人独立)
  intimacy: Record<string, number>; // 亲密度 0-100 (每人独立)
  duel: Record<string, number>; // 博弈值 0-100 (每人独立)
  sincerity: Record<string, number>; // 真心度 0-100 (每人独立)
  tension: number; // 全局多线张力值 0-100
  candor: number; // 全局坦诚值 0-100
  power: number; // 全局权力值 0-100
}

export enum DayPeriod {
  Morning = "MORNING", // 上午: 状态选择 (精力分配)
  Noon = "NOON", // 中午: 公共区域随机偶遇
  Afternoon = "AFTERNOON", // 下午: 主动发起约会
  Evening = "EVENING", // 傍晚: 「局中局」信息处理
  Night = "NIGHT", // 晚上: 随机事件触发
  DeepNight = "DEEP_NIGHT", // 深夜: 个人状态与思绪
}

export interface PlayerInfo {
  name: string;
  age: number;
  mbti: string;
  identityClass: IdentityClass;
  personality: string;
  entryReason: string;
  preciousAsset: string;
}

export interface StoryLog {
  day: number;
  period: DayPeriod;
  eventTitle: string;
  narrative: string;
  speaker?: string;
  choiceMade: string;
}

export interface GameState {
  day: number; // 1-30
  period: DayPeriod;
  player: PlayerInfo | null;
  stats: GameStats;
  currentEvent: {
    id: string;
    title: string;
    description: string;
    speaker?: string;
    choices: Array<{
      id: string; // "A" | "B" | "C" | "D"
      text: string;
    }>;
  } | null;
  history: StoryLog[];
  unlockedThresholds: string[];
}

export const CHARACTERS: Record<string, CharacterProfile> = {
  RM: {
    id: "RM",
    name: "金南俊",
    age: 27,
    mbti: "ENFP",
    avatarColor: "#D4AF37", // Amber Gold
    identity: "独立智库创始人 / 顶奢文化基金会学术顾问",
    datingStyle: "精神共鸣、极高精神内耗、温和自尊的年上男友",
    vanityFairBehavior: "对权力游戏不感兴趣却能看穿一切，深沉而温柔的直击灵魂发问者",
    jealousyThreshold: 65,
    powerBottomLine: "不可当众令其难堪；不可将私人吐露想法用于社交资本；明确问处境时不可搪塞回避。",
    physicalCues: ["交流时身体前倾缩短物理距离", "极少主动触碰", "牵手时假装在意，实则全部记着", "吃醋时用食指抵着嘴唇陷入沉默，移开视线"],
  },
  JIN: {
    id: "JIN",
    name: "金硕珍",
    age: 29,
    mbti: "INTP",
    avatarColor: "#B57EDC", // Lavender
    identity: "跨国餐饮集团太子爷 / SevenClub 米其林厨师团队运营者",
    datingStyle: "极佳情绪提供者、大叔笑话专家、有明确无法逾越的冰冷红线",
    vanityFairBehavior: "顶级控场者，以退为进地看着玩家拙劣掩饰，在边界外看你表演",
    jealousyThreshold: 85,
    powerBottomLine: "不可当众消费或嘲弄感情；不可窃取并泄露家族商业信息；不可拿他打翻醋坛去钓其他男人。",
    physicalCues: ["用食物与空间替代言语（帮你拿外套，在一旁坐下）", "触碰总是实用自然", "准备离开时，低头默默整理自己的袖口（唯一情绪泄露）"],
  },
  SUGA: {
    id: "SUGA",
    name: "闵玧其",
    age: 28,
    mbti: "ISTP",
    avatarColor: "#4B9CD3", // Ocean Blue
    identity: "顶级独立音乐制作人兼唱作人 / 永久专属顶层工作室持有者",
    datingStyle: "低攻高防、重度领地意识、毒舌体贴口嫌体正直的猫系男友",
    vanityFairBehavior: "极度厌恶暧昧虚伪，察觉多线会发出冷脸警报并退回工作室闭门谢客",
    jealousyThreshold: 35,
    powerBottomLine: "不可透露私人创作信息；确立关系后不可维持暧昧隐瞒；不可将感情拿去社交作为谈资。",
    physicalCues: ["表面保持漫不经心距离，身体在不知不觉间把你与他人隔开", "放松时手重重搭在你的肩上", "吃醋时频繁用舌头抵住腮帮，眼神死死黏着你"],
  },
  J_HOPE: {
    id: "J_HOPE",
    name: "郑号锡",
    age: 27,
    mbti: "ESFJ",
    avatarColor: "#FF5F1F", // Neon Orange
    identity: "顶级私募股权投资机构合伙人 / SevenClub 会员委员会核心主事人",
    datingStyle: "细心至极、无微不至却隐含强烈精准掌控欲的阳光守护者",
    vanityFairBehavior: "顶级细节控，捕捉一切越轨眼神和陌生香水。能以完美东道主面貌将冰冷刺骨字眼隐藏于无懈可击的笑容后",
    jealousyThreshold: 50,
    powerBottomLine: "不可在 SevenClub 公开场合令其尊严受损；不可把他的关照作为便利去取悦他人；不可回避核心定性发问。",
    physicalCues: ["轻柔微调细节：轻理衣领、轻扣手腕、在人群中用手搭在背后引导路线", "吃醋时的动作反而更加完美规范，暗带不容否定的压迫感"],
  },
  JIMIN: {
    id: "JIMIN",
    name: "朴智旻",
    age: 26,
    mbti: "ENTP",
    avatarColor: "#FF1493", // Deep Pink
    identity: "顶级艺人经纪公司核心合伙人 / 娱乐帝国的微妙软权力枢纽",
    datingStyle: "高敏感极致磨人、反向克制海后的顶级推拉大师、易引起保护欲的娇弱野心家",
    vanityFairBehavior: "双重情绪撩拨手。玩家多线不仅不退避，反而能激起极强反向猎杀和精神征服欲",
    jealousyThreshold: 25,
    powerBottomLine: "不可在他人面前用他的情感或公司资源作筹码；不可在明确占有后假装朋友；不可反向利用他的真心做虚无推拉。",
    physicalCues: ["毫无预警触碰（握住手腕，靠在肩上，耳边轻语）", "生气时冷酷缩回一切触碰，用距离感逼你主动示软"],
  },
  V: {
    id: "V",
    name: "金泰亨",
    age: 26,
    mbti: "ENTP",
    avatarColor: "#800020", // Burgundy
    identity: "独立电影导演兼视觉艺术家 / SevenClub 的不规则艺术裂缝",
    datingStyle: "纯粹浪漫、极具原始性张力与野性嗅觉、极强男性支配感的艺术家男友",
    vanityFairBehavior: "面对多线时情绪极度崩溃与宿命化，完全破坏社交体面，直接在聚光灯边缘凝视或带走你",
    jealousyThreshold: 40,
    powerBottomLine: "不可将他的私人素材和电影作品用于商业利益；被他宿命性表白后不可假装糊涂；不得当其是消遣点缀。",
    physicalCues: ["毫无预警拿起相机对准你", "将手强势塞入你的大衣口袋", "情绪崩溃时沉默离场，留给你一张模糊背影"],
  },
  JK: {
    id: "JK",
    name: "田柾国",
    age: 24,
    mbti: "INTP",
    avatarColor: "#333333", // Matte Black (Rock/Goth Vibes)
    identity: "体育产业新锐投资人 / 家族运动帝国继承者 / 自由搏击竞技高手",
    datingStyle: "最年轻张扬的巨狼、极致纯真与狂野肌肉花臂反差的100%直球野手",
    vanityFairBehavior: "领地霸主，绝对无法接受被当做退路，在走廊将你强势带走、按在无人的角落逼出眼圈发红的答案",
    jealousyThreshold: 15,
    powerBottomLine: "不可在其面前与其他男人保持越轨行为；面对选择追问不得躲闪回避；不可轻视并当他是好捏软柿子。",
    physicalCues: ["身体语言极具侵略性，拦住你或靠近你完全不迂回", "吃醋时咬牙，下巴紧绷，用舌头顶腮帮，眼神锁定", "大手轻轻覆满并盖住你的手背（极致温柔）"],
  },
};
