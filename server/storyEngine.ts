import { GoogleGenAI, Type } from "@google/genai";
import { 
  IdentityClass, 
  CHARACTERS, 
  GameStats, 
  DayPeriod, 
  PlayerInfo, 
  GameState, 
  StoryLog 
} from "../src/types.ts";

// Initialize Gemini SDK with telemetry header guidance
export function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

// Generate starting stats based on player identity class
export function createInitialState(player: PlayerInfo): GameState {
  const defaultStats: GameStats = {
    favorability: {},
    intimacy: {},
    duel: {},
    sincerity: {},
    tension: 0,
    candor: 40,
    power: 30,
  };

  // Initialize values for each of the 7 charcs
  Object.keys(CHARACTERS).forEach((charId) => {
    defaultStats.favorability[charId] = 10;
    defaultStats.intimacy[charId] = 5;
    defaultStats.duel[charId] = 20;
    defaultStats.sincerity[charId] = 15;
  });

  let extraStats: any = {};

  // Custom class bonuses from Page 4, 5, 6
  switch (player.identityClass) {
    case IdentityClass.Supermodel:
      // 超模: 场面掌控+15, 初始好感+8(全员), 坦诚初始40, 解锁专属镜头剧情
      defaultStats.candor = 40;
      defaultStats.power = 35;
      Object.keys(CHARACTERS).forEach((charId) => {
        defaultStats.favorability[charId] = 18; // +8 base
      });
      extraStats = { "control": 15, "lensUnlocked": true };
      break;

    case IdentityClass.TopStar:
      // 顶流明星: 名声资本+20, 初始博弈+10, 真心上限-10, 解锁卸下滤镜线
      defaultStats.candor = 30;
      defaultStats.power = 40;
      Object.keys(CHARACTERS).forEach((charId) => {
        defaultStats.duel[charId] = 30; // +10 base
        defaultStats.sincerity[charId] = 10; // Capped or restricted
      });
      extraStats = { "reputation": 20, "filterLimit": -10, "filterUnlocked": true };
      break;

    case IdentityClass.PrivateArtist:
      // 私人艺术家: 神秘值+20, 初始真心+10, 初始好感-5, 解锁缪斯剧情
      defaultStats.candor = 50;
      defaultStats.power = 25;
      Object.keys(CHARACTERS).forEach((charId) => {
        defaultStats.favorability[charId] = 5; // -5 base
        defaultStats.sincerity[charId] = 25; // +10 base
      });
      extraStats = { "mystery": 20, "museUnlocked": true };
      break;

    case IdentityClass.InvestmentElite:
      // 商业投资高手: 初始权力值+20, 博弈抵抗+15, 坦诚55, 解锁利益交叉剧情
      defaultStats.candor = 55;
      defaultStats.power = 50; // +20 base (30 + 20)
      defaultStats.tension = 5;
      extraStats = { "duelResist": 15, "crossedInterestsUnlocked": true };
      break;

    case IdentityClass.BrandOwner:
      // 奢侈品牌主理人: 品牌影响力+20, 场面掌控+15, 亲密解锁阈值-5, 解锁穿衣剧情
      defaultStats.candor = 45;
      defaultStats.power = 38;
      extraStats = { "brandInfluence": 20, "control": 15, "intimacyThresholdBonus": -5, "wardrobeUnlocked": true };
      break;

    case IdentityClass.Heiress:
      // 跨国家族继承人: 初始权力+25, 神秘+15, 真心受限-15, 解锁家族棋盘剧情
      defaultStats.candor = 35;
      defaultStats.power = 55; // +25 base (30 + 25)
      Object.keys(CHARACTERS).forEach((charId) => {
        defaultStats.sincerity[charId] = 5; 
      });
      extraStats = { "mystery": 15, "familyBoardUnlocked": true };
      break;
  }

  // Pre-seed Day 1 Morning event
  const firstEvent = {
    id: "DAY1_START",
    title: "初启名利场 · 迈步入此门",
    description: `伦敦、巴黎和纽约的灯火都已退散。当你站在 SevenClub 这座私密至极的顶层私人会所门前，门童微微鞠躬拉开沉重的雕花铜门。门内是奢华闪耀的水晶吊灯、顶级爵士乐音色、以及隐藏在幽暗沙发区中，一道道锋利、审视却带着好奇的目光。\n\n今天是你进入 SevenClub 的第一天。作为「${getIdentityChineseName(player.identityClass)}」，这里有人早已认得你的脸，也有人在探查你的底牌。前方迎面走来的，是智库创始人「金南俊」与餐饮巨擘继承人「金硕珍」，两人举杯示意。`,
    speaker: "RM",
    choices: [
      { id: "A", text: "得体微笑，举杯向两个方向分别致意，保持完美的名流距离。" },
      { id: "B", text: "走上前与金南俊聊起艺术基金的主题，眼神微不可察地在金硕珍的红酒杯上勾留。" },
      { id: "C", text: "冷淡颔首，在一道道聚光灯般的目光中笔直穿过，独自走向更安静的露台。" }
    ]
  };

  return {
    day: 1,
    period: DayPeriod.Morning,
    player,
    stats: defaultStats,
    currentEvent: firstEvent,
    history: [],
    unlockedThresholds: [],
  };
}

export function getIdentityChineseName(cls: IdentityClass): string {
  switch (cls) {
    case IdentityClass.Supermodel: return "超模";
    case IdentityClass.TopStar: return "顶流女明星";
    case IdentityClass.PrivateArtist: return "私人艺术家";
    case IdentityClass.InvestmentElite: return "商业投资高手";
    case IdentityClass.BrandOwner: return "豪华奢侈品牌主理人";
    case IdentityClass.Heiress: return "跨国家族继承人";
    default: return "名流";
  }
}

// Highly comprehensive local rules-based simulation generator
// Fully backup if Gemini is offline or API key is not configured yet!
export function localFallbackEngine(
  state: GameState, 
  choiceId: string, 
  customText?: string
): GameState {
  const currentDay = state.day;
  const currentPeriod = state.period;
  const player = state.player!;
  const stats = JSON.parse(JSON.stringify(state.stats)) as GameStats;
  const history = [...state.history];
  const unlocked = [...state.unlockedThresholds];

  // Pick speaker based on choice or context
  const targetChar = state.currentEvent?.speaker || "RM";
  const charProfile = CHARACTERS[targetChar] || CHARACTERS.RM;

  // 1. Process stat updates based on choices
  let deltaFav = 0;
  let deltaInt = 0;
  let deltaDuel = 0;
  let deltaSinc = 0;
  let deltaTension = 0;
  let deltaCandor = 0;
  let deltaPower = 0;

  if (choiceId === "A") {
    deltaFav = 6;
    deltaInt = 2;
    deltaDuel = 4;
    deltaSinc = 3;
    deltaCandor = 5;
    deltaPower = 5;
  } else if (choiceId === "B") {
    deltaFav = 8;
    deltaInt = 6;
    deltaDuel = 7;
    deltaSinc = 2;
    deltaCandor = -2;
    deltaTension = 6;
    deltaPower = 4;
  } else if (choiceId === "C") {
    deltaFav = 4;
    deltaInt = -2;
    deltaDuel = 6;
    deltaSinc = 8;
    deltaCandor = 6;
    deltaTension = -2;
    deltaPower = 8;
  } else if (choiceId === "D") {
    // Custom Option D
    deltaFav = 10;
    deltaInt = 8;
    deltaDuel = 8;
    deltaSinc = 10;
    deltaCandor = 12;
    deltaPower = 10;
  }

  // Adjust for thresholds & personalities
  // Suga territorial check
  if (targetChar === "SUGA" && deltaTension > 0 && stats.tension > 35) {
    deltaFav -= 6;
    deltaSinc -= 8;
  }
  // Jungkook INTP check
  if (targetChar === "JK" && state.stats.tension > 15) {
    deltaFav -= 8;
    deltaInt -= 4;
  }

  // Multiply stats safely
  stats.favorability[targetChar] = Math.max(0, Math.min(100, (stats.favorability[targetChar] || 0) + deltaFav));
  stats.intimacy[targetChar] = Math.max(0, Math.min(100, (stats.intimacy[targetChar] || 0) + deltaInt));
  stats.duel[targetChar] = Math.max(0, Math.min(100, (stats.duel[targetChar] || 0) + deltaDuel));
  stats.sincerity[targetChar] = Math.max(0, Math.min(100, (stats.sincerity[targetChar] || 0) + deltaSinc));
  stats.tension = Math.max(0, Math.min(100, stats.tension + deltaTension));
  stats.candor = Math.max(0, Math.min(100, stats.candor + deltaCandor));
  stats.power = Math.max(0, Math.min(100, stats.power + deltaPower));

  // 2. Format narrative describing choice outcome
  let narrativeText = "";
  const choiceLabel = choiceId === "D" ? (customText || "深入交锋") : (state.currentEvent?.choices.find(c => c.id === choiceId)?.text || "");
  
  narrativeText += `【你选择了】：${choiceLabel}\n\n`;

  // Dynamic dialogue generators
  if (targetChar === "RM") {
    narrativeText += `金南俊听到你的回应，微微一怔，随即他高大的身躯有些向前倾斜。他的眼睛里掠过一抹极深的精神内耗与思索，用他那低沉而富有学者温度的声音温柔说道：「每个人在 ${charProfile.name} 都在尽力扮演好自己的面具。但不知为何，你的眼睛里，保留着名利场里最稀缺的理智。我很希望能够看到你卸下面具真正放松的一刻。」\n\n`;
    narrativeText += `他优雅地把香槟推到你手边，指尖短暂在酒杯边缘停滞了一下。这是一个极其自然而含蓄的交往尺度扣合。`;
  } else if (targetChar === "JIN") {
    narrativeText += `金硕珍脸上扬起标志性的令人极具松弛感的完美微笑。他极其放松地拍了拍西装上的微尘，用一种富有社交支配力与玩味的语气说道：「看来我的米其林菜肴还是吸引了你的主意。不过要当心，名利场可没有不需要对价的糖果。多线拉扯可不是一般人玩得转的，我更在乎玩家在越界之后的真实本相。」\n\n`;
    narrativeText += `他在说话的同时顺势极其熟稔自然地替你把外套整理了一下，随即后撤半步，动作干净得像个彻底不求回报的英伦绅士，却在眼神底处留下了深海般的冷意。`;
  } else if (targetChar === "SUGA") {
    narrativeText += `闵玧其倚靠在顶层工作室高压混音台旁边，猫一般的冷脸直直地凝视着你。他发出低沉而有些沙哑的调侃：「你好像对自己很有信心，到处都能看到你活跃的身影嘛。别在我这里浪费时间了，我要的是绝对的偏心和忠诚，若发现你在拉扯，我的工作室大门对你只会永远锁死。」\n\n`;
    narrativeText += `虽然极其不爽，但在你走过他身侧时，他看似散漫却精准地迈出半步站到你身侧，用自己的肩膀隔开后面喧闹的名流人群。`;
  } else if (targetChar === "J_HOPE") {
    narrativeText += `郑号锡作为 SevenClub 会员委员会的主事，正带着极其温和圆融、滴水不漏的完美东道主笑容看着你。他凑在你耳边，极具分寸地压低声音：「在别人的地盘里撒网，可要当心风暴来得太突然。今晚你走过的每一个角落都被人看在眼里，我为你提供了便利，你的眼里是否有我的位置？」\n\n`;
    narrativeText += `他伸出手极快且极其得体地搭在你背后为你引路，冰冷的手指尖带着一丝暗流涌动的压制力量。`;
  } else if (targetChar === "JIMIN") {
    narrativeText += `朴智旻这个亲密关系里的高敏感推拉大师轻轻靠上你的肩膀，用一种几乎黏连般的软糯语气小声吐露：「姐姐，你昨天跟那个男人聊了那么久。难道，他的手牵起来比我的更舒服么？」他的眼角弯成好看的弧度，但眼神最深处闪烁着势在必得和硬朗的野心。\n\n`;
    narrativeText += `他突然极其大胆地扣住你的手腕，手指扣进你的指缝，毫不顾及旁边可能出现的长枪短炮视线，极尽撩拨。`;
  } else if (targetChar === "V") {
    narrativeText += `金泰亨站在不规则雕塑黑牌展廊深处。他眼神极深极邃，宿命般对上你的目光。他没有分析逻辑，只是直接拿起相机，在不预警的情况下捕捉闪光灯画面。卡嚓一声后他低沉如大提琴的声音在空中摩擦：「把你最好的一面拍进我的电影里。如果你在忽悠我，我会把这背影当成我们最后的线索。别把我只当做一个好玩的过客，那真的很残忍。」\n\n`;
    narrativeText += `他顺势把带着暖意的手塞入你的口袋，像是确认你的存在一般极具男性荷尔蒙张力。`;
  } else {
    narrativeText += `田柾国这个最年轻的直球野狼咬了咬牙，用下巴绷紧的轮廓盯着你，声音沙哑带着狠劲：「别哄我了，也别玩虚的。昨天，你到底是去找他还是来找我？我这里从不要当备胎的耻辱。看着我的眼睛，选他，还是选我？我没跟你开玩笑。」\n\n`;
    narrativeText += `他猛地拦住你的去路，健硕高大的体型压迫力十足。两手撑在你肩膀两侧将你堵在昏暗的走廊尽头，眼眶带了一抹猩红的渴求。`;
  }

  // Record history
  const logItem: StoryLog = {
    day: currentDay,
    period: currentPeriod,
    eventTitle: state.currentEvent?.title || "探试之季",
    narrative: narrativeText,
    speaker: targetChar,
    choiceMade: choiceLabel
  };
  history.push(logItem);

  // 3. Advance to next state/period
  let nextDay = currentDay;
  let nextPeriod = currentPeriod;
  let nextEventTitle = "";
  let nextEventDesc = "";
  let nextSpeaker = "RM";
  let nextChoices: Array<{ id: string; text: string }> = [];

  // Progression cycle: Morning -> Noon -> Afternoon -> Evening -> Night -> DeepNight -> Advanced Day
  if (currentPeriod === DayPeriod.Morning) {
    nextPeriod = DayPeriod.Noon;
    nextSpeaker = selectNextSpeaker(nextDay, "NOON");
    nextEventTitle = `第 ${nextDay} 天 · 中午【公共区域随机偶遇】`;
    nextEventDesc = `随着午后日光透过 SevenClub 的双层精钢落地高窗洒落入大理石前厅，你遇到了一同漫步的攻略对象「${CHARACTERS[nextSpeaker].name}」。对方似乎心情有些浮躁，推门走入落日中庭时，裙摆微拂，两人的手在无意识中有一秒极轻的触碰。双方气场微妙。`;
    nextChoices = [
      { id: "A", text: "无意识肢体接触（蹭到手 / 撞肩），轻声搭话调节氛围（亲密度+，张力微拂）" },
      { id: "B", text: "在极近的物理空间内停下步伐，含蓄地保持对望（博弈值+，好感稍增）" },
      { id: "C", text: "淡定回退拉开距离，以极其事务性口吻开局话题（坦诚+，博弈安全）" }
    ];
  } else if (currentPeriod === DayPeriod.Noon) {
    nextPeriod = DayPeriod.Afternoon;
    nextSpeaker = selectNextSpeaker(nextDay, "AFTERNOON");
    nextEventTitle = `第 ${nextDay} 天 · 下午【主动约会抉择】`;
    nextEventDesc = `下午的三点钟。你拥有一次主动向攻略对象发出私密邀请或到他们领地拜访的机会。你收到了来自「${CHARACTERS[nextSpeaker].name}」的信息邀请，地点是他的专属核心房。你决定欣然赴约。这是一对一的高烈度对话，你们要面对更深的核心博弈……`;
    nextChoices = [
      { id: "A", text: "主动靠近，配合对方节奏倾诉苦衷，打破身体物理防御阻碍。" },
      { id: "B", text: "采取攻防对抗，揭穿对方在上流社会的假面（博弈值大涨，好感度激烈起伏）" },
      { id: "C", text: "坦口自白，说出自己作为普通人或大女主在这30天社交季中最不想失去的真实（坦诚+，真心度+）" }
    ];
  } else if (currentPeriod === DayPeriod.Afternoon) {
    nextPeriod = DayPeriod.Evening;
    nextSpeaker = selectNextSpeaker(nextDay, "EVENING");
    nextEventTitle = `第 ${nextDay} 天 · 傍晚【「局中局」信息战】`;
    nextEventDesc = `暮色如血般染透了城市繁华的屋檐。你在手机上、或从侍从手里收到了一条极具暗示性的秘闻：内容似乎关乎「${CHARACTERS[nextSpeaker].name}」正暗自进行的一次商业并购，或者他的家庭底牌资产。这似乎是一次利益诱惑，也是考验你名利场博弈深度的时候。`;
    nextChoices = [
      { id: "A", text: "直接回应他：选择坦诚交换，透露手中另一张底牌（博弈大幅变动，真心+）" },
      { id: "B", text: "不动声色观察决策，极具说辞进行隐瞒：在防守中暗暗获利（博弈提升，真心度限压）" },
      { id: "C", text: "借助第三方渠道或闺蜜确认信息真相（多线张力维持安全，博弈+）" }
    ];
  } else if (currentPeriod === DayPeriod.Evening) {
    nextPeriod = DayPeriod.Night;
    nextSpeaker = selectNextSpeaker(nextDay, "NIGHT");
    nextEventTitle = `第 ${nextDay} 天 · 晚上【SevenClub 暗流激战】`;
    nextEventDesc = `夜晚的九点。SevenClub 各大高奢沙龙里高朋满座，黑茶、雪茄的奢雅味道飘散。你与攻略对象「${CHARACTERS[nextSpeaker].name}」在一场顶级晚宴桌角意外相遇。对方突然低头，额头几乎碰上你的耳尖，声音沙哑性感得令人失控。`;
    nextChoices = [
      { id: "A", text: "闭上眼睛不做挣扎，坦然接受他的侵掠性物理接近（亲密度骤升）" },
      { id: "B", text: "轻轻推开他，并极其冷艳地调笑「先生，您似乎今晚有些喝多了」（博弈拉锯，嫉妒阈值挑动）" },
      { id: "C", text: "覆住他的双手，用更深沉、野心的视线回敬（张力拉满，解锁高难度深度剧情）" }
    ];
  } else if (currentPeriod === DayPeriod.Night) {
    nextPeriod = DayPeriod.DeepNight;
    nextSpeaker = selectNextSpeaker(nextDay, "DEEP_NIGHT");
    nextEventTitle = `第 ${nextDay} 天 · 深夜【个人心境与幽闭思绪】`;
    nextEventDesc = `凌晨两点。你坐在落地灯光前，写字台的笔尖磨损或酒杯里的气泡浮现。你在今天的所有高频周旋里耗费了极多的精力和感情。一想起「${CHARACTERS[nextSpeaker].name}」白天的眼神，你无法克制内心的情感余波……`;
    nextChoices = [
      { id: "A", text: "写下一条只对他可见的深夜不具名状态（真心度+，坦诚度+）" },
      { id: "B", text: "闭上双眼清除思绪，只把这名利场当做一盘精致好玩的棋盘棋局（权力值+，情感度冷淡）" },
      { id: "C", text: "喝掉高脚杯金黄的残温，在寂静中入睡（精力值恢复）" }
    ];
  } else if (currentPeriod === DayPeriod.DeepNight) {
    // Advanced to next day!
    nextDay = currentDay + 1;
    nextPeriod = DayPeriod.Morning;

    // Trigger critical day nodes if applicable
    if (nextDay === 2) {
      nextSpeaker = "JIMIN";
      nextEventTitle = "第 2 天 · 关键时刻【初次博弈判定】";
      nextEventDesc = "入场第二天。玩家正与朴智旻一起站在楼顶露台。这是名利场圈层对你的初始鉴别节点：他用他带刺的探寻目光笑意吟吟审视你。每一个肢体触痕都会让众人对你的目的进行首轮定性。";
      nextChoices = [
        { id: "A", text: "毫不畏惧对视，任由他拉住手腕，玩弄着你的指尖（亲密开启）" },
        { id: "B", text: "得体把手抽回，调侃「朴总对每个新面孔都这么熟练吗」（博弈提升）" },
        { id: "C", text: "眼神闪躲，说「抱歉，我今晚不胜酒力」，转身退出（大女主冷冽）" }
      ];
    } else if (nextDay === 5) {
      nextSpeaker = "RM"; // All present
      nextEventTitle = "第 5 天 · 宿命圆桌【第一次圆桌时刻 · 季度晚宴】";
      nextEventDesc = "SevenClub 季度私人圆桌晚宴，全员同框出席！长而精美的主餐桌前无主位之分。你坐在了最微妙的中心位置：金南俊、金硕珍与闵玧其的座位皆在对视极狭的三角范围内。侍从送上极贵酒款，眼神的余光，博弈一即一动。";
      nextChoices = [
        { id: "A", text: "微笑着向所有人祝酒，故意只将赞美送给左侧的金南俊，引起一桌暗流起伏（多线张力爆涨）" },
        { id: "B", text: "保持低调内敛，绝不主动引火烧身，默默观察每个男人的举止博弈（博弈+，降低张力）" },
        { id: "C", text: "大女主范：发表对当前名利场局势的精准锐评，展露你的权力才华，令所有人刮目相看（权力+20）" }
      ];
    } else if (nextDay === 8) {
      nextSpeaker = "J_HOPE";
      nextEventTitle = "第 8 天 · 「你是谁」定性日";
      nextEventDesc = "第八天，好感度处于核心上升期的领军 lead 们将试图对你进行深层审视和定性。郑号锡在私人休息室内对你缓缓靠近，他的完美微笑仿佛开始有些瓦解：「我很想知道。你究竟是这圈子里无足重轻的过客，还是一个真正值得我花所有心血和资本去保的明珠？」";
      nextChoices = [
        { id: "A", text: "直视他的眼睛：「我从来都不是任何人的过客，我想要得到的，都会得到。」（博弈+，权力+）" },
        { id: "B", text: "温柔靠在他怀中：「我是谁，取决于今天你愿意为我掏出多少真心。」（亲密+，真心度+）" },
        { id: "C", text: "保持神秘不置可否，含糊应对离开（神秘值爆涨）" }
      ];
    } else if (nextDay === 10) {
      nextSpeaker = "JIN";
      nextEventTitle = "第 10 天 · 第一阶段结算【交错之光】";
      nextEventDesc = "第一阶段（1-10天）试探季正式宣告结束。SevenClub 公布了你在社交圈的首轮成绩单……全网通达，大家看你的表情发生变化。系统提示：「现在，全员看你的目的开始转变，水面下的博弈即将刺刀见红……进入下一阶段。」";
      nextChoices = [
        { id: "A", text: "自信收下成绩，昂首步向风暴深处。（全员博弈+5）" },
        { id: "B", text: "向最高好感者发送私信，寻求联盟结对保护。（张力下降）" },
        { id: "C", text: "冷淡对待结算，只把一切当做过场浮华之梦。（坦诚度+5）" }
      ];
    } else if (nextDay === 13) {
      nextSpeaker = "SUGA"; // Suga VS Jimin
      nextEventTitle = "第 13 天 · 双线激撞【意外同框修罗场】";
      nextEventDesc = `第13天「暗流季」引爆！好感度最高的两位男主——闵玧其和朴智旻意外在楼道里面对面对峙。而你，刚好提着皮包撞开了这扇门。此时张力为：${stats.tension}。气氛冰冻了。`;
      if (stats.tension < 40) {
        nextEventDesc += "\n【由于你的张力维持得极低，两人保持了名流克制】：闵玧其只是对你冷淡点了下头说「我的创作还没完，先回了」，朴智旻则面带玩味在旁边看着他的背影。";
      } else if (stats.tension >= 40 && stats.tension <= 65) {
        nextEventDesc += "\n【张力偏高，暗自较劲】：朴智旻突然当着闵玧其的面，强势拉起你的手，在耳边用糯糯却极寒冷的声音问：「姐姐，今天的饭局不是说好只带我的么？他是谁？」";
      } else {
        nextEventDesc += "\n【张力彻底爆炸，当面刺刀见红摊牌！】：闵玧其直接冷落脸挡在你身前，拽住你手肘：「别装了，他跟我说昨晚你一直在他车里。告诉我，他、还是我？今天你必须给个说法。」全场哗然。";
      }
      nextChoices = [
        { id: "A", text: "主动走向好感更高的一个人，坚定挡在其面前，向另一个人彻底道歉并定出界限（坦诚爆涨，另一人好感暴跌）" },
        { id: "B", text: "不置可否抽手打哈哈，极度圆滑地转移话题，继续保持推拉（博弈+12，坦诚-10，张力+10）" },
        { id: "C", text: "当场落泪示弱，将一切原因归于名利场的压力，引出他们的保护欲（博弈退滑，好感微涨）" }
      ];
    } else if (nextDay === 15) {
      nextSpeaker = "V";
      nextEventTitle = "第 15 天 · 【界限防守遭破防】";
      nextEventDesc = "第15天狂澜起。金泰亨在无人摄影回廊尽头目不视地堵住了你的退路。他的呼吸近得你几乎可以尝出金菲士的酸甜甜味。他的双手牢牢按在你的耳畔，神色崩溃地咬牙：「我今天看见那个投资人牵你的大衣口袋了。别再用什么名利场朋友糊弄我！回答我……」";
      nextChoices = [
        { id: "A", text: "仰头直接吻上他颤抖的眼角，不再做任何虚假的名流假面挣拒（亲密度飙升30点！）" },
        { id: "B", text: "冷漠将他的手挪开，淡淡说「泰亨，这里的摄像头不止一个，别在这像个失控的孩子」（博弈大涨，好感度零点冰碎）" },
        { id: "C", text: "用力抱住他，安抚并告诉他你需要时间，拉近彼此内心连接（真心度大涨）" }
      ];
    } else if (nextDay === 18) {
      nextSpeaker = "J_HOPE";
      nextEventTitle = "第 18 天 · 宿命圆桌【停电圆桌之夜 · 真挚与自省】";
      nextEventDesc = "第18天，SevenClub 在突发深夜暴雨里全会所遭遇大规模线路停路。全员和攻略对象一起被迫困于主餐桌。在一片黑暗里，谁也看不清谁的眼睛、面具和表情。正是说出此行真心话的完美契机……";
      nextChoices = [
        { id: "A", text: "在极暗中，主动越过界限，紧紧扣握住那个白昼绝不敢牵的手（肢体情热度最高者+20）" },
        { id: "B", text: "说出最诚实的心里自述，向所有人公开揭穿自己的出身或执念，不再装相（坦诚值+20）" },
        { id: "C", text: "冷淡在寂静角落独饮，看着黑暗中其他人虚无的勾心斗角（权力+10）" }
      ];
    } else if (nextDay === 20) {
      nextSpeaker = "JK";
      nextEventTitle = "第 20 天 · 第二阶段结算【假面撕裂时刻】";
      nextEventDesc = "水面下的较劲已经结束，社交季已进入恐怖的第三阶段：决断季（第21-30天）。这时的社交圈正快速缩小，所有人对你的耐心都降到了极致冰点。田柾国站在楼下黑色轿车旁在暴雨中冷直看你……";
      nextChoices = [
        { id: "A", text: "迈步上车，与他共享后座逼侧而热烈的纯真空间。（亲密大增）" },
        { id: "B", text: "拒绝邀请，打伞昂首离去，独自对抗剩下的10天恶战。（博弈抗性大增）" },
        { id: "C", text: "给他发匿名告白纸条，承诺在第30天给他真正的答卷。（张力+5）" }
      ];
    } else if (nextDay === 22) {
      nextSpeaker = "JIN";
      nextEventTitle = "第 22 天 · 询问之局【你到底想要什么？】";
      nextEventDesc = "第二十二天。大财阀少东金硕珍将白金杯轻重推倒你的面前。他的眼神像极了商界顶点的冰冷猎手：「三十天期限还有八天。名利场的游乐场大门要关了。我手里的资源并购协议已经批下，告诉我……你到这里，究竟想要我，还是想要我的版图？」";
      nextChoices = [
        { id: "A", text: "「我都要。孩子才做选择，在我的局里，你和你的钱，全部都要臣服于我。」（权力狂飙30点，开启'棋手'结局条件）" },
        { id: "B", text: "「金少爷，你若是不信我的真心，我大可把会员卡折断给你看。」（真心重置狂涨，博弈归零）" },
        { id: "C", text: "选择模棱两可，以笑意搪塞过去（遭到红线警示，好感削减）" }
      ];
    } else if (nextDay === 25) {
      nextSpeaker = "JIMIN";
      nextEventTitle = "第 25 天 · 选择之窗【真挚坦白路线】";
      nextEventDesc = `第25天。当前的坦诚值为：${stats.candor}。如果你坦诚值 >= 55，你可以解锁主动坦白‘我确实在多人中有过多线感情交往’的豁免。朴智旻正在他的套房阳台，手里摇晃着干金。你的选择……`;
      if (stats.candor >= 55) {
        nextChoices = [
          { id: "A", text: "【已解锁 · 坦白路线】主动承认在名利场多线周旋的真实，请求得到他灵魂的拥抱配合（坦诚爆顶+15，解锁多线共识局）" },
          { id: "B", text: "继续欺瞒隐瞒，矢口否认任何多线行径（坦诚再降15，永久关闭任何信任门扉）" },
          { id: "C", text: "只表明当前对他的喜欢是纯真的，掩藏对别人的爱（博弈提升，真心下降）" }
        ];
      } else {
        nextEventDesc += "\n【因你当前的坦诚度过低（低于55），你无法解锁自主坦白豁免！你只能选择掩遮或掩蔽。】";
        nextChoices = [
          { id: "B", text: "欺瞒隐瞒，矢口否认任何多线行径（好感度上限受挫，滑降至75）" },
          { id: "C", text: "只表明当前对他的喜欢是纯真的，掩藏对别人的爱（博弈提升，真心下降）" }
        ];
      }
    } else if (nextDay === 28) {
      nextSpeaker = "RM"; // Farewell Dinner
      nextEventTitle = "第 28 天 · 宿命圆桌【季末告决舍晚宴】";
      nextEventDesc = "第28天，SevenClub 季末告别终极晚宴。所有的红线、感情、博弈都达到了前所未有的临界狂暴高张力！吊灯的光晃眼而炽烈。金南俊端起最醇红酒指向你，全桌目光一瞬间汇聚。这是决定带谁离开、向谁低头的最后一晚。数亿资产的棋盘摆在桌上。";
      nextChoices = [
        { id: "A", text: "在座所有人注视下，牵住最心仪那位男主的手，昂首宣布带他见家长（专一路线定调，其余人当场心碎离线）" },
        { id: "B", text: "大女主傲骨：站起身举杯宣布，这场纸醉金迷游戏是由于你完美操盘，你不属于任何人！（权力+30，锁定隐藏'棋手'路）" },
        { id: "C", text: "什么都不说，默默在桌下流泪饮完酒（锁定'黯然离场'路线）" }
      ];
    } else if (nextDay >= 30) {
      nextSpeaker = "RM";
      nextEventTitle = "第 30 天 · 终极决断日【名利场的宿命答案】";
      nextEventDesc = `第三十天，社交季彻底闭幕。SevenClub 的耀眼大灯一盏盏熄灭。你站在了离场的大堂。前台的小姐正微笑着等待你的退卡。请做出你在这场权力与情感豪赌里的最终抉择：\n\n【当前属性结算】：\n坦诚值：${stats.candor}\n全局多线张力：${stats.tension}\n全局权力值：${stats.power}\n高好感线数量：${getHighFavCount(stats)}`;
      nextChoices = [
        { id: "A", text: "选择与其中一位好感最高之客单独摊牌，求取专心相拥结局（专一路线）" },
        { id: "B", text: "坦诚向所有人发出最后的解围信，接受大家的决定（多线共识路线，需坦诚>=75，至少两条感情线>=72）" },
        { id: "C", text: "将金色的 SevenClub 会员卡留在冰冷的大理石前台桌上，转身一个人大步离去（离开结局）" }
      ];
    } else {
      // Standard advanced day generic morning
      nextEventTitle = `第 ${nextDay} 天 · 上午【日常行精力状态分配】`;
      nextEventDesc = `这是你处于 SevenClub 的第 ${nextDay} 天。清晨的第一缕晨曦斜斜射入院落。你正坐在欧式白色沙发上，手中拿着米其林厨师调制的拿铁咖啡。上午，你需要为自己今天在名利场的精力进行状态定调，这将大幅度改变今日特定事件遭遇几率……`;
      nextChoices = [
        { id: "A", text: "【社交主动型】：精力主要用于全沙龙联络人脉，提升结交高感几率（多线张力爆伏，好感活跃）" },
        { id: "B", text: "【事业专注型】：在 SevenClub 商务阁疯狂看盘与处理并购账单（权力增加，博弈值增加）" },
        { id: "C", text: "【随遇而安型】：安心喝咖啡，观察名牌艺术品展廊（坦诚度提升，精力储备完好）" }
      ];
    }
  }

  // Handle eventual ending evaluations on Day 30+ decisions
  if (currentDay === 30 && choiceId) {
    nextEventTitle = "《名利场》终局判定公布";
    nextSpeaker = "RM";
    nextChoices = [];

    if (choiceId === "C") {
      nextEventDesc = `【离开路线结局：独自离席的背影】\n\n你把闪烁着金质锋芒的 SevenClub 会员卡缓缓推向了大理石前壁柜，没有对旁边的接待留下半字解释。门外是清凉的夜雨，SevenClub 的璀璨灯芒还在二楼、三楼夜空中刺眼地亮着，那些你爱过、斗过、拉扯过的男人们也许还在那张圆桌上执子。但你头也不回地撑开雨伞，独自走进了雨夜喧嚣的另一条普通街道。开始听见自己真实的脚步声、回声。你不再是任何男人的底牌或附庸，这场游戏被你亲手折成过去。\n\n名利场里最贵的东西，从来不是钱。而是能重新照镜子时，对自己真挚坦白地笑。恭喜你通关！`;
    } else if (choiceId === "B") {
      // Check multi line ending conditions
      const hasPaths = checkMultilineConsensus(stats);
      if (stats.candor >= 75 && hasPaths) {
        if (stats.candor >= 88 && stats.tension <= 30) {
          nextEventDesc = `【隐藏结局 · 最后诚实的那个人】\n\n这是一个极其罕见的终极判定。由于你整段旅程达到了近乎不可思议的 88+ 的坦诚记录，且未跨过任何男主的绝对心理底线，你在第30天极其坦直而自省地面向多人吐露。那些本是商界霸主、娱乐枢纽以及天才巨狼的男人们——金硕珍、金南俊、田柾国、闵玧其等，聚在同一张雪茄烟雾弥漫的桌上。他们本是一生敌手，却在你至纯至真、极致自省的灵魂摊牌面前沉默许久，最终，接受了这场彼此心里最微妙的状态，共同拥戴并保护你。\n\n通关评定：终极完美双诚王，你征服了整个 SevenClub 顶层！`;
        } else {
          nextEventDesc = `【多线共识结局：平衡的假面森林】\n\n由于你的坦诚值达到了：${stats.candor}（符合>=75条件），且拥有至少两条深入心曲的好感线（>=72）。你选择了最坦荡的道路。你给每位攻略对象发去坦诚自白书，说明了你无法在这场盛大的豪赌里轻易割舍。他们被你的惊人坦荡击中了防线：高自傲让他们冷嘲热讽，但在冷静过后，他们默许并接受了你的存在。这不是庸俗的童话，但每一个人都清醒地做出了自己的决断，形成微妙和谐的均衡共生之局。\n\n通关评定：多线共识操盘姬！`;
        }
      } else {
        nextEventDesc = `【终局滑落：谎言穿帮的冷落宴】\n\n虽然你期望得到多线平衡共识，但你的全局坦诚度（${stats.candor} / 需75+）或好感羁绊深度不够。你的坦白在男主们眼里沦为极其拙劣的渣女周旋狡辩。金硕珍把白金协议折散，田柾国在拐角对你投来彻底心死落幕的一眼，闵玧其的工作室永远锁死。你被冷落退场，回首处唯有孤家寡人的破败名誉一败涂地。\n\n通关评定：名利场出局滑铁卢。`;
      }
    } else {
      // Choice A: Single Line Ending. Let's find highest favorability target
      const highestChar = getHighestFavCharacter(stats);
      const favVal = stats.favorability[highestChar] || 0;
      const sincVal = stats.sincerity[highestChar] || 0;
      const intVal = stats.intimacy[highestChar] || 0;
      const charName = CHARACTERS[highestChar]?.name || "金南俊";

      // Hidden Chess Master check
      const canBeChessMaster = (player.identityClass === IdentityClass.InvestmentElite || player.identityClass === IdentityClass.Heiress || player.identityClass === IdentityClass.BrandOwner);
      const hasTwoHighDuel = Object.values(stats.duel).filter(v => v >= 75).length >= 2;
      
      if (canBeChessMaster && hasTwoHighDuel && stats.power >= 60) {
        nextEventDesc = `【大女主专属隐藏结局 · 棋手】\n\n你没有在任何男女纠葛上放下底牌——你做出了更狂野、最锋锐的第三种选择：那局名利场大棋，你赢了！身为「${getIdentityChineseName(player.identityClass)}」，你借由前任豪门与顶奢资源做跳板，以连续并购和绝对掌控将整个 SevenClub 的大部商业骨干版图纳入你的私募基金旗下。那几位不可一世的男主们——金硕珍、郑号锡等，此时看着你的目光彻底从垂涎变为了极致敬畏。你不是他们圈子里用身体或长相做赌注的猎物。相反，你是这扇厚铜豪门唯一的执钥人和女总裁！\n\n通关评定：名利场执棋女皇！`;
      } else if (favVal >= 85 && sincVal >= 70 && intVal >= 60) {
        nextEventDesc = `【专一路线结局：怦然落定】\n\n你与「${charName}」在深夜幽静的 SevenClub 观景走廊达成了最终确定。没有繁琐的名单宣言，没有虚假的豪门盛况。在寂天落雨的尽头，高大的他眼底闪烁前所未有的纯真与炽热。他把一串备用的私人复式公寓钥匙，极轻极热地按在你的手心里。他的声音极其嘶哑温柔：「拿着。这里才是 SevenClub 里真正的，没有探照灯和眼线的房间。今晚，跟我回家。」\n\n通关评定：怦然落定 · 执手真爱。`;
      } else if (favVal >= 85 && sincVal >= 70 && intVal < 40) {
        nextEventDesc = `【专一路线结局：慢慢来】\n\n他（${charName}）接受了你的求爱，但拉住了你的胳膊，轻声留下一句「我们还有很多时间」。他感觉到了你在身体接触上的极度克制与保守。他十分尊重你的灵魂傲骨，决定将恋爱的呼吸、节奏与步调交给你，在白昼与黑夜中慢慢前行。`;
      } else if (favVal >= 82 && sincVal <= 35) {
        nextEventDesc = `【专一路线结局：我不确定你是认真的】\n\n他对你产生了海般炽热的情意，但他站在高楼玻璃旁却微微后退。他的双眸掠过怀疑名利场一切的悲凉：「我确实喜欢看你。但我无法确定，你喜欢我、接近我的方式，是否经得起我家族产业、我全部灵魂热烈的拷问。我需要时间确认你是否真心，否则我无法全然给你我的手。」门仍为你开着，但隔了一层高玻璃。`;
      } else if (favVal >= 55 && favVal < 81) {
        nextEventDesc = `【专一路线结局：还不到时候】\n\n「${charName}」对你温柔婉拒，但深邃的眼里留有万般退路。他深深看着你披着的羊绒大衣，微微后撤了一步说：「我们之间有太多秘密还没抖干净，在名利场染黑的墨迹下，还不到大声高誓白头的时候。留下来，等下个三十天社交季。」他没有走远。`;
      } else {
        nextEventDesc = `【专一路线结局：你不了解我】\n\n「${charName}」对你抱以坦然无情的商流拒绝。他依旧温和矜持，笑容找不出丝毫缺憾，但用极温存也极客套的外交声调回应你：「很抱歉。你今天在晚宴上看到的那个我，以及你所爱上的那个完美多金的我。其实只是 SevenClub 极其得体、精心用名誉和财富编织出来的幻梦而已。真实的那个我，你从未窥见只鳞半爪。」`;
      }
    }
  }

  return {
    day: nextDay,
    period: nextPeriod,
    player,
    stats,
    currentEvent: {
      id: `EVT_DAY${nextDay}_${nextPeriod}`,
      title: nextEventTitle,
      description: nextEventDesc,
      speaker: nextSpeaker,
      choices: nextChoices
    },
    history,
    unlockedThresholds: unlocked,
  };
}

function selectNextSpeaker(day: number, period: string): string {
  const list = ["RM", "JIN", "SUGA", "J_HOPE", "JIMIN", "V", "JK"];
  // Deterministic but feels highly random depending on current day & period combinations
  const hash = (day * 7 + period.charCodeAt(0) + period.charCodeAt(1)) % list.length;
  return list[hash];
}

function getHighFavCount(stats: GameStats): number {
  return Object.values(stats.favorability).filter(f => f >= 72).length;
}

function getHighestFavCharacter(stats: GameStats): string {
  let highest = "RM";
  let maxVal = -1;
  Object.keys(stats.favorability).forEach((k) => {
    if (stats.favorability[k] > maxVal) {
      maxVal = stats.favorability[k];
      highest = k;
    }
  });
  return highest;
}

function checkMultilineConsensus(stats: GameStats): boolean {
  // At least two characters >= 72 favorability
  return getHighFavCount(stats) >= 2;
}

// Highly customized server-side streaming prompt constructor for Gemini AI
export async function runGeminiEngine(
  state: GameState,
  choiceId: string,
  customText?: string
): Promise<GameState> {
  const ai = getGeminiClient();
  if (!ai) {
    // Graceful fallback if API key is not configured or fails
    return localFallbackEngine(state, choiceId, customText);
  }

  const activeChar = state.currentEvent?.speaker || "RM";
  const choiceLabel = choiceId === "D" ? (customText || "深入自我交互") : (state.currentEvent?.choices.find(c => c.id === choiceId)?.text || "");
  const nextPeriod = getNextDayPeriod(state.period);
  const nextDay = state.period === DayPeriod.DeepNight ? state.day + 1 : state.day;

  // Let's craft an elite, dynamic high-society system prompt that embeds all OCR mechanics
  const systemInstruction = `
You are the elite storyteller AI guiding an interactive high-society RPG game "Vanity Fair" (名利场) set in the ultra-private hotel rooftop club "SevenClub".
The game duration is exactly 30 days.

CHARACTER PROFILES (Strictly match these personalities at all times, including physical cues and rules):
- RM (金南俊, 27, ENFP): Intellectual, deep thinker, Academic Adviser, does not like base power play but understands it instantly, has intellectual overthinking (jealousy: 65%). Physical cue: Leans in, rarely initiates touch, eating vinegar by touching lips with index finger in deep silence.
- JIN (金硕珍, 29, INTP): Heir to Michelin food empires in SevenClub. Very chill, tells dad jokes, has rigid boundaries (jealousy: 85%). Absolute controller of the room. Physical cue: Uses actions/items instead of words (holds coat, sits next silently), adjusts cuffs secretly before leaving.
- SUGA (闵玧其, 28, ISTP): Genius music producer. Low defense, heavy territorial instincts, toxic/dry tongue (jealousy: 35%). Physical cue: Keeps distance but blocks others from approaching you, heavily places shoulder hand only when relaxed, clicks tongue/teeth when jealous.
- J_HOPE (郑号锡, 27, ESFJ): PE Partner, true operator of SevenClub seating/flow. Captures all details, strangers' perfumes, screens flickering. Flawless polite smile covering absolute control (jealousy: 50%). Physical cue: Adjusts collar, holds wrist briefly to remind, acts perfectly compliant yet pressuring when jealous.
- JIMIN (朴智旻, 26, ENTP): Entertainment Mogul. Soft delicate outward face covering rock-solid defensive ego, loves extreme push-and-pull, can hunt multiple tracks directly (jealousy: 25%). Physical cue: Surprising touch (wrist grab, shoulder lean, whisper), cold withdraw, pushing distance when angry.
- V (金泰亨, 26, ENTP): Film Director & Artist. Pure romantic, high male dominance and raw chemistry. Highly fatalistic and emotional with multi-line tension, ignores SevenClub elegance, pulls you away directly (jealousy: 40%). Physical cue: Takes camera snap without warning, hands in your coat pocket, leaves lonely backdrop photos.
- JK (田柾国, 24, INTP): Sports Investment Heir, ultimate straight-shooter beast with tattooed arm sleeve (jealousy: 15%). Extremely territorial, hates being a spare tire. Takes you away in deep hallways, corners you, eyes turning red demanding answers. Physical cue: Brutal straight-lines, biting jaw, tongue clicking against cheek when eating vinegar, warm big hand covering yours gently.

CRITICAL DAY LOGICS & MILESTONES:
- Day 2: First Dueling Event. Sets intimacy basis.
- Day 5: First Round Table (SevenClub private dinner, everyone's there! Sits, gazes, responses affecting multiline tension).
- Day 8: "Who are you" defining Day. Fav >= 30 leads ask if you are a passing guest or valuable asset.
- Day 10: Phase 1 review.
- Day 13: Double-line crash event (highest 2 favorability leads find out about each other) -> If tension < 40 (calm), 40-65 (jealous undercurrent), > 65 (direct face-to-face clash).
- Day 15: Out-of-bounds breakout event (Fav >= 55 + Intimacy >= 40, lead breaks rule and touches you in public).
- Day 18: Blackout Second Round Table (honest deep dialogue, darkness hides eyes, sets candor).
- Day 20: Phase 2 review.
- Day 22: "What do you want?" Confrontation day (Fav >= 70 characters ask for commitment).
- Day 25: "Candor window" (if Candor >= 55, can confess multi-line to redeem).
- Day 28: Third Round Table (Farewell Gala, highest tension, massive sacrifices).
- Day 30: Final Reckoning (Determines endings: Single focus, multi-consensual (Candor>=75, 2 lines >=72), Departure (alone), hidden "Last Honest Person" (Candor>=88), or "Chess Master" (Investor/Heiress/BrandOwner with high Duel and Power)).

TASK:
You must process the player's choice. Generate a JSON response that contains:
1. "narrative": High-society written prose describing the continuation (150-300 characters of elegant, premium Chinese drama, dialogue with the speaker, and physical cues matching their MBTI).
2. "statChanges": Changes to Stats (Favorability (map of character->number), Intimacy (map of character->number), Duel (map of character->number), Sincerity (map of character->number), Tension, Candor, Power) based on the action. Make them follow math patterns specified on pages 14, 15, 16.
3. "unlocked": A notification string of unlocked items if Favorability or Intimacy reaches key thresholds (e.g. >=25, 45, 65, 85).
4. "nextEvent": An object defining the NEXT period's scenario, including elegant choices A, B, C (specifically write customized luxury choices).
`;

  try {
    const prompt = `
CURRENT GAME STATE:
- Day: ${state.day}
- Period: ${state.period}
- Player: ${JSON.stringify(state.player)}
- Current Stats: ${JSON.stringify(state.stats)}
- Selected Choice: ${choiceId} (${choiceLabel})

Generate the outcome narration in the role of the game narrator. Ensure you return a STRICT JSON object matching the following structure exactly:
{
  "narrative": "outcome story prose in beautiful, elite Chinese",
  "activeSpeaker": "RM|JIN|SUGA|J_HOPE|JIMIN|V|JK",
  "stats": {
    "favorability": {"RM": 15, "JIN": 12, ...},
    "intimacy": {"RM": 10, ...},
    "duel": {"RM": 25, ...},
    "sincerity": {"RM": 15, ...},
    "tension": 5,
    "candor": 42,
    "power": 35
  },
  "unlockedNotice": "Optional threshold announcement like [闵玧其·肢体互动一阶解锁]",
  "nextEvent": {
    "title": "Scene location & Title in SevenClub format",
    "description": "Next scenario text setting up Day ${nextDay} Period ${nextPeriod}",
    "speaker": "RM|JIN|SUGA|J_HOPE|JIMIN|V|JK",
    "choices": [
      {"id": "A", "text": "Choice A text"},
      {"id": "B", "text": "Choice B text"},
      {"id": "C", "text": "Choice C text"}
    ]
  }
}
`;

    // Access Gemini with robust schema handling
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
      }
    });

    const parsed = JSON.parse(response.text.trim());

    // Merge changes safely back into GameState
    const mergedStats: GameStats = {
      favorability: { ...state.stats.favorability, ...parsed.stats?.favorability },
      intimacy: { ...state.stats.intimacy, ...parsed.stats?.intimacy },
      duel: { ...state.stats.duel, ...parsed.stats?.duel },
      sincerity: { ...state.stats.sincerity, ...parsed.stats?.sincerity },
      tension: typeof parsed.stats?.tension === 'number' ? parsed.stats.tension : state.stats.tension,
      candor: typeof parsed.stats?.candor === 'number' ? parsed.stats.candor : state.stats.candor,
      power: typeof parsed.stats?.power === 'number' ? parsed.stats.power : state.stats.power,
    };

    // Cap values to 0-100 safely
    Object.keys(mergedStats.favorability).forEach(k => mergedStats.favorability[k] = Math.max(0, Math.min(100, mergedStats.favorability[k])));
    Object.keys(mergedStats.intimacy).forEach(k => mergedStats.intimacy[k] = Math.max(0, Math.min(100, mergedStats.intimacy[k])));
    Object.keys(mergedStats.duel).forEach(k => mergedStats.duel[k] = Math.max(0, Math.min(100, mergedStats.duel[k])));
    Object.keys(mergedStats.sincerity).forEach(k => mergedStats.sincerity[k] = Math.max(0, Math.min(100, mergedStats.sincerity[k])));
    mergedStats.tension = Math.max(0, Math.min(100, mergedStats.tension));
    mergedStats.candor = Math.max(0, Math.min(100, mergedStats.candor));
    mergedStats.power = Math.max(0, Math.min(100, mergedStats.power));

    const updatedLog: StoryLog = {
      day: state.day,
      period: state.period,
      eventTitle: state.currentEvent?.title || "探试之季",
      narrative: parsed.narrative || "你在SevenClub深处优雅地进退。",
      speaker: activeChar,
      choiceMade: choiceLabel
    };

    const nextEvt = parsed.nextEvent || {
      title: `第 ${nextDay} 天 · ${nextPeriod === DayPeriod.Morning ? "清晨" : "中午"}【新篇章】`,
      description: `这是你在 SevenClub 的新时刻。名利场的灯河仍在低语，宿命的拉扯还在继续。`,
      speaker: state.currentEvent?.speaker || "RM",
      choices: [
        { id: "A", text: "继续维持社交假面并寻找盟友。" },
        { id: "B", text: "直接摊牌利益要点，争取上层博弈控制。" },
        { id: "C", text: "暗夜独酌自省，理智抽离在棋局边界开外。" }
      ]
    };

    return {
      day: nextDay,
      period: nextPeriod,
      player: state.player,
      stats: mergedStats,
      currentEvent: {
        id: `EVT_DAY${nextDay}_${nextPeriod}`,
        title: nextEvt.title,
        description: nextEvt.description,
        speaker: nextEvt.speaker || "RM",
        choices: nextEvt.choices
      },
      history: [...state.history, updatedLog],
      unlockedThresholds: parsed.unlockedNotice ? [...state.unlockedThresholds, parsed.unlockedNotice] : state.unlockedThresholds,
    };
  } catch (err) {
    console.error("Gemini API Engine failed, folding elegantly to rule-based fallback:", err);
    return localFallbackEngine(state, choiceId, customText);
  }
}

function getNextDayPeriod(current: DayPeriod): DayPeriod {
  switch (current) {
    case DayPeriod.Morning: return DayPeriod.Noon;
    case DayPeriod.Noon: return DayPeriod.Afternoon;
    case DayPeriod.Afternoon: return DayPeriod.Evening;
    case DayPeriod.Evening: return DayPeriod.Night;
    case DayPeriod.Night: return DayPeriod.DeepNight;
    case DayPeriod.DeepNight: return DayPeriod.Morning;
  }
}
