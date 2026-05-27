import { IdentityClass } from "./types.ts";

export interface IdentityCard {
  classType: IdentityClass;
  title: string;
  tagline: string;
  introduction: string;
  entryReason: string;
  preciousAsset: string;
  bonuses: Array<{ name: string; desc: string }>;
  initialIllustration: string;
}

export const MAIN_IDENTITIES: Record<IdentityClass, IdentityCard> = {
  [IdentityClass.Supermodel]: {
    classType: IdentityClass.Supermodel,
    title: "顶级名模 / Supermodel",
    tagline: "「她走进来，所有人都回头。没有人知道她在想什么。」",
    introduction: "你是当季最炙手可热的封面面孔，走遍了巴黎、米兰、纽约的T台，与三个顶奢品牌签有长期合约。你的脸是资本，你的身体是工具，你清楚地知道这一点并转化为精准的自我管理能力。",
    entryReason: "作为品牌大使，在一场极度奢贵晚宴上受邀出席。席间有陌生男士塞给一联烫金会员卡说：「去SevenClub吧，那里更有趣。」",
    preciousAsset: "无可替换的璀璨美貌、精准的情感镜头克制力",
    bonuses: [
      { name: "场面掌控力", desc: "+15 (游刃有余地穿梭在镜头与挑剔的人群中)" },
      { name: "初始好感度", desc: "所有角色 +8 (全网社交层中，人人都对你的脸存有高质印象)" },
      { name: "坦诚度", desc: "初始锁定 40 (习惯展示人设，不习惯剥离剖白)" }
    ],
    initialIllustration: "supermodel_card"
  },
  [IdentityClass.TopStar]: {
    classType: IdentityClass.TopStar,
    title: "顶流女明星 / A-List Star",
    tagline: "「舞台上的女王，幕后的迷局。」",
    introduction: "你的名字代表着全网的流量密码与社交话题峰值。你习惯将真实自我藏在聚光灯迷雾背后，甚至不确定真实的自己到底长什么样。每一言一行都是舆论核心风暴。",
    entryReason: "经纪公司秘密安排了一次「绝密行业资源对接」的私下饭局。戴着黑面帽的你入席后，发现只有一桌比你任何代表作都要昂贵的珍馐，以及一个传说中的男人。",
    preciousAsset: "极高的全天候舆论话语权、名流资本筹码",
    bonuses: [
      { name: "名声资本值", desc: "+20 (你的名字本身就是上流博弈的烫金门票)" },
      { name: "初始博弈力", desc: "+10 (精通应付各路长枪短炮与明枪暗箭)" },
      { name: "真心度上限", desc: "初始锁定压制 -10 (男人们难以在第一时间对这重星光产生实诚确信)" }
    ],
    initialIllustration: "actress_card"
  },
  [IdentityClass.PrivateArtist]: {
    classType: IdentityClass.PrivateArtist,
    title: "隐世艺术家 / Private Artist",
    tagline: "「只展示给懂的人看。」",
    introduction: "你的画卷作品在苏富比公开拍出过百万英镑，但在社交平台上近乎零踪影，拒绝任何采访。你用极致的稀缺性将自我和作品包裹，在神秘温床中掌控溢价权力。",
    entryReason: "SevenClub 秘密高价收购了你的一副未公开画作。应黑卡委员会之邀前来进行藏品鉴赏，出于探寻灵感的野心，你留了下来。",
    preciousAsset: "稀罕的灵感源泉、不含杂质的名流审美品味",
    bonuses: [
      { name: "神秘值", desc: "+20 (圈内极少有你的流言碎语，极容易勾引男人的窥探欲)" },
      { name: "真心度加成", desc: "+10 (不屑长袖善舞地表彰长相，拥有至纯的温度)" },
      { name: "初始好感值", desc: "-5 (你的冷淡和独立让他们感受到了一丝不被讨好的挑衅)" }
    ],
    initialIllustration: "artist_card"
  },
  [IdentityClass.InvestmentElite]: {
    classType: IdentityClass.InvestmentElite,
    title: "私募投资高手 / Venture Capitalist",
    tagline: "「每笔钱，都有她的资本逻辑。」",
    introduction: "你独立主理着一联规模庞大的家族理财基金，投报率连续四年位列行业三甲。你精于算术和计算人性，将所有男人和金融契约一般用绝对理性和利益逻辑进行全天候审视。",
    entryReason: "追踪一笔数亿额度的海外流失资金去向时，你锁定了SevenClub。为了拿回股权，你不得不伪装身段入席社交季，进行最后的资本对弈。",
    preciousAsset: "算无遗策的冷静理智、执棋掌控百亿版图的铁腕",
    bonuses: [
      { name: "初始权力值", desc: "+20 (在部分商界男主的版图里，拥有对等的资本实力与话语权)" },
      { name: "博弈抵抗力", desc: "+15 (心如止水，绝不轻易被男主多金深情的人设蒙上幻觉)" },
      { name: "坦诚初始值", desc: "高至 55 (习惯把话明明白白讲清对价，高效谈判)" }
    ],
    initialIllustration: "investor_card"
  },
  [IdentityClass.BrandOwner]: {
    classType: IdentityClass.BrandOwner,
    title: "奢侈品牌主理人 / Luxury Brand Owner",
    tagline: "「她定义的，才叫品位。」",
    introduction: "你是独立奢品新星王国的绝对独立主权者，每一季度的新品发布会被整个欧洲老牌贵族誉为品味终点。你属于你自己，从不需要任何豪门贵子替你推门开路。",
    entryReason: "受到 SevenClub 高层核心主事人邀请共同开发限量版高订礼服，你希望借机探察这个金钱帝国顶层究竟在以何种诡秘规则繁衍品味。",
    preciousAsset: "绝对的流行定义权、对男色搭配了然于胸的主理敏锐",
    bonuses: [
      { name: "品牌影响力", desc: "+20 (你的美学声望对奢商男主有着直接且耀眼的变现价值)" },
      { name: "场面掌控力", desc: "+15 (长期主导大型发布，面对各色大场面神色如一)" },
      { name: "肢体解禁难", desc: "亲密度解锁加成 (习惯保持高贵得体距离，男主需付出双倍心力才能亲近)" }
    ],
    initialIllustration: "brand_card"
  },
  [IdentityClass.Heiress]: {
    classType: IdentityClass.Heiress,
    title: "跨国老牌家族继承人 / Ancient Heiress",
    tagline: "「她的姓氏本身，就是一种权力。」",
    introduction: "你的家族跨国持有银行信用、重工及核心资源。你温柔有礼、笑容无懈可击——这些都是自五岁起严苛的淑女教育对你的生理规训。你的真实心意比深不可测的海底还要远。",
    entryReason: "SevenClub 成立的第一栋地标主楼的基建基金。原本仅因处理家族地产路过此处，但有些男人的棋盘，让你第一次有兴趣亲自执白子落子。",
    preciousAsset: "老牌财阀姓氏带来的至高资本底蕴、不战而降的气概",
    bonuses: [
      { name: "权力值基数", desc: "+25 (最高权力，部分男主哪怕处于对峙，也要对家族姓氏敬畏)" },
      { name: "神秘值初始", desc: "+15 (背景底牌重金掌控保护，严防死守任何眼线)" },
      { name: "真心初始阻力", desc: "-15 (他们难以断定你的接近是为了个人真心，还是带着庞大家族的联姻吞吃目的)" }
    ],
    initialIllustration: "heiress_card"
  }
};
