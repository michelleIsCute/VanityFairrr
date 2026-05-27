/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { 
  IdentityClass, 
  CHARACTERS, 
  DayPeriod, 
  GameState, 
  PlayerInfo,
  StoryLog
} from "./types.ts";
import { MAIN_IDENTITIES, IdentityCard } from "./data.ts";
import ThreeCanvas from "./components/ThreeCanvas.tsx";
import CharEncyclopedia from "./components/CharEncyclopedia.tsx";
import { 
  Heart, 
  Shield, 
  Sparkles, 
  Flame, 
  Eye, 
  ChevronRight, 
  Loader2, 
  Volume2, 
  Bookmark, 
  RefreshCcw, 
  Compass, 
  Lock, 
  HelpCircle,
  TrendingUp,
  Award,
  BookOpen
} from "lucide-react";

function getIdentityChineseName(cls: IdentityClass): string {
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

function getPeriodChineseName(period: DayPeriod): string {
  switch (period) {
    case DayPeriod.Morning: return "上午【精力定调】";
    case DayPeriod.Noon: return "中午【公共偶遇】";
    case DayPeriod.Afternoon: return "下午【私密约会】";
    case DayPeriod.Evening: return "傍晚【信息暗战】";
    case DayPeriod.Night: return "晚上【暗流激战】";
    case DayPeriod.DeepNight: return "深夜【个人幽思】";
    default: return "新时刻";
  }
}

export default function App() {
  // Game state core
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [isSubmittingChoice, setIsSubmittingChoice] = useState(false);
  const [activeReaction, setActiveReaction] = useState<StoryLog | null>(null);
  
  // Wizards Character Creation states
  const [charName, setCharName] = useState("温晚");
  const [charAge, setCharAge] = useState(24);
  const [charMbti, setCharMbti] = useState("INFJ");
  const [selectedClass, setSelectedClass] = useState<IdentityClass>(IdentityClass.Supermodel);
  const [customReason, setCustomReason] = useState("为了拿回被侵吞的家族旧藏画作，也为了解开母亲二十年前在SevenClub离席的秘密。");
  const [preciousAsset, setPreciousAsset] = useState("灵魂底处的骄傲、对自己真实模样的清醒记忆。");
  
  // Custom D input state
  const [customActionText, setCustomActionText] = useState("");
  // Selected character ID in sidebar encyclopedia details
  const [sidebarCharId, setSidebarCharId] = useState<string>("RM");
  // Active tab in play panel: "constellation" or "encyclopedia" or "history"
  const [activePlayTab, setActivePlayTab] = useState<"constellation" | "encyclopedia" | "history">("encyclopedia");

  // Error logging state
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize Game
  const handleStartGame = async () => {
    setIsStarting(true);
    setErrorMessage(null);
    try {
      const playerInfo: PlayerInfo = {
        name: charName || "温晚",
        age: charAge || 24,
        mbti: charMbti || "INFJ",
        identityClass: selectedClass,
        personality: `温和且极其聪明的 ${charMbti} 独立女性。`,
        entryReason: customReason,
        preciousAsset: preciousAsset,
      };

      const res = await fetch("/api/story/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerInfo }),
      });

      if (!res.ok) {
        throw new Error("初始化游戏服务器失败，请稍后重试");
      }

      const data = await res.json();
      if (data?.gameState) {
        setGameState(data.gameState);
        // Set default active character to matches the opening speaker
        if (data.gameState.currentEvent?.speaker) {
          setSidebarCharId(data.gameState.currentEvent.speaker);
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "网络故障，请检查服务器连接");
    } finally {
      setIsStarting(false);
    }
  };

  // Process selected play choice
  const handleSubmitChoice = async (choiceId: string, customOptionText?: string) => {
    if (!gameState) return;
    setIsSubmittingChoice(true);
    setErrorMessage(null);
    try {
      const payload = {
        gameState,
        choiceId,
        customText: choiceId === "D" ? customOptionText : undefined
      };

      const res = await fetch("/api/story/choice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("处理选项失败，剧情引擎计算超时，尝试重新发送。");
      }

      const data = await res.json();
      if (data?.gameState) {
        setGameState(data.gameState);
        setCustomActionText(""); // Clear custom input
        // Update selection to match new active speaker
        if (data.gameState.currentEvent?.speaker) {
          setSidebarCharId(data.gameState.currentEvent.speaker);
        }
        // Store last log to play character reaction
        if (data.gameState.history && data.gameState.history.length > 0) {
          const lastLog = data.gameState.history[data.gameState.history.length - 1];
          setActiveReaction(lastLog);
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "请求服务器发生故障。");
    } finally {
      setIsSubmittingChoice(false);
    }
  };

  const handleResetGame = () => {
    if (window.confirm("确定要格式化当前存档，重新进SevenClub吗？当前天数进度将归零。")) {
      setGameState(null);
      setCustomActionText("");
      setErrorMessage(null);
      setActiveReaction(null);
    }
  };

  // Render Character Creation Card screen
  if (!gameState) {
    const activeClassCard: IdentityCard = MAIN_IDENTITIES[selectedClass];

    return (
      <div className="min-h-screen bg-[#050505] text-[#E0D8D0] py-12 px-4 sm:px-6 lg:px-8 font-sans flex flex-col justify-between selection:bg-accent-gold/30 selection:text-white">
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-accent-gold/5 to-transparent pointer-events-none" />
        
        {/* Simple elegant header */}
        <div className="max-w-4xl mx-auto w-full text-center space-y-4 mb-10">
          <h1 className="text-4xl sm:text-5xl font-serif tracking-[0.25em] font-light text-accent-gold text-center uppercase">
            名 利 场
          </h1>
          <div className="font-serif italic text-lg tracking-[0.5em] text-gray-500">
            V A N I T Y &nbsp; F A I R
          </div>
          <div className="h-[1px] bg-gradient-to-r from-transparent via-accent-gold/30 to-transparent w-full" />
          <p className="text-xs text-accent-gold-dark/80 tracking-widest font-mono">
            「有些游戏，从踏进SevenClub的那一刻就已经开始」
          </p>
        </div>

        {/* Wizard Panel wrapper */}
        <main className="max-w-4xl mx-auto w-full bg-[#0A0A0A] border border-dark-border rounded-3xl shadow-2xl p-6 sm:p-10 relative overflow-hidden flex-1 flex flex-col justify-between">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-radial from-accent-gold/5 to-transparent rounded-full pointer-events-none" />
          
          <div className="space-y-8 flex-1">
            <h2 className="text-xl font-serif font-light tracking-[0.1em] text-accent-gold border-b border-dark-border pb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent-gold animate-pulse" />
              创建你的女主角身世密档
            </h2>

            {/* Step form elements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Form controls */}
              <div className="space-y-5">
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-xs font-mono text-gray-500 uppercase tracking-widest block">主角姓名</label>
                    <input 
                      type="text" 
                      value={charName}
                      onChange={(e) => setCharName(e.target.value)}
                      placeholder="温晚"
                      className="w-full bg-[#111111]/80 border border-dark-border rounded-lg px-3 py-2 text-sm text-[#E0D8D0] focus:outline-none focus:border-accent-gold/70 transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-gray-500 uppercase tracking-widest block">身世年龄</label>
                    <input 
                      type="number" 
                      value={charAge}
                      onChange={(e) => setCharAge(parseInt(e.target.value) || 24)}
                      className="w-full bg-[#111111]/80 border border-dark-border rounded-lg px-3 py-2 text-sm text-[#E0D8D0] focus:outline-none focus:border-accent-gold/70 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-gray-500 uppercase tracking-widest block">
                    人格特质 MBTI (自定义描述)
                  </label>
                  <input 
                    type="text" 
                    value={charMbti}
                    onChange={(e) => setCharMbti(e.target.value.toUpperCase())}
                    placeholder="INFJ"
                    className="w-full bg-[#111111]/80 border border-dark-border rounded-lg px-3 py-2 text-sm text-[#E0D8D0] focus:outline-none focus:border-accent-gold font-mono tracking-widest"
                  />
                  <span className="text-[10px] text-gray-500 block leading-tight">
                    MBTI 决定了你面对男人们多线博弈时的情绪反应与底线心算。例如: INFJ, ENTJ, ENFP
                  </span>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono text-gray-500 uppercase tracking-widest block">
                    选择女主社会阶层身份 (初始优势各不相同)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.values(MAIN_IDENTITIES).map((item) => {
                      const isSelected = selectedClass === item.classType;
                      return (
                        <button
                          key={item.classType}
                          type="button"
                          onClick={() => setSelectedClass(item.classType)}
                          className={`p-2.5 rounded-xl text-left border text-xs cursor-pointer transition-all ${
                            isSelected 
                              ? "bg-accent-gold/10 border-accent-gold text-accent-gold font-semibold" 
                              : "bg-[#111111]/60 border-dark-border hover:border-accent-gold/40 text-gray-400"
                          }`}
                        >
                          {item.title.split(" / ")[0]}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right explanation of chosen class & narrative reason fields */}
              <div className="bg-[#111111]/40 border border-dark-border rounded-2xl p-5 space-y-4 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-accent-gold tracking-tight">
                    {activeClassCard.title}
                  </h3>
                  <p className="text-[11px] text-[#888] italic mt-1.5 leading-snug font-serif">
                    {activeClassCard.tagline}
                  </p>
                  <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                    {activeClassCard.introduction}
                  </p>
                </div>

                {/* Initial buffs info from Page 4,5,6 */}
                <div className="border-t border-dark-border pt-3 space-y-2">
                  <span className="text-[10px] font-mono text-[#888] uppercase tracking-wider block">
                    初始能力值增幅加成:
                  </span>
                  <div className="grid grid-cols-1 gap-1.5 text-[10px] font-mono">
                    {activeClassCard.bonuses.map((bonus, bidx) => (
                      <div key={bidx} className="flex justify-between border-b border-[#1A1A1A] pb-1">
                        <span className="text-gray-400 font-sans">{bonus.name}</span>
                        <span className="text-accent-gold font-bold">{bonus.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Custom Motivation inputs */}
            <div className="grid grid-cols-1 gap-4 pt-4 border-t border-dark-border/60">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-gray-500 uppercase tracking-widest block">
                  踏足顶级会所 SevenClub 的真实动因 (玩家秘密)
                </label>
                <textarea 
                  rows={2}
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="为了拿回属于母亲的藏画，也为了调查背后的利益对价..."
                  className="w-full bg-[#111111]/80 border border-dark-border rounded-lg px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-accent-gold/70 leading-relaxed transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-gray-500 uppercase tracking-widest block">
                  在这30天社交季狂潮中，你最不能割舍/失去的东西是什么？
                </label>
                <input 
                  type="text"
                  value={preciousAsset}
                  onChange={(e) => setPreciousAsset(e.target.value)}
                  placeholder="对自己身世的诚实，以及最亲近的人对我的信任。"
                  className="w-full bg-[#111111]/80 border border-dark-border rounded-lg px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-accent-gold/70 transition-colors"
                />
              </div>
            </div>
          </div>

          {errorMessage && (
            <div className="bg-red-950/30 border border-red-500/20 text-red-400 p-3 rounded-lg text-xs mt-4 font-mono">
              [异常提示]: {errorMessage}
            </div>
          )}

          {/* Form Action buttons */}
          <div className="pt-6 border-t border-dark-border/60 flex justify-end">
            <button
              onClick={handleStartGame}
              disabled={isStarting}
              className="w-full sm:w-auto bg-accent-gold hover:bg-[#b89327] text-black font-semibold rounded-lg px-8 py-3 text-sm tracking-[0.2em] uppercase cursor-pointer flex items-center justify-center gap-2 transition-all duration-300 shadow-lg shadow-accent-gold/10 active:scale-[0.98]"
            >
              {isStarting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  正在连接 SevenClub 档案室...
                </>
              ) : (
                <>
                  踏入 SevenClub 开启第1天
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </main>

        {/* Footer info block */}
        <footer className="max-w-4xl mx-auto w-full text-center text-[10px] text-gray-600 mt-8 font-mono tracking-widest">
          VANITY FAIR TEXT SIMULATION GAME ENGINE • DESKTOP HIGH RES EDITION
        </footer>
      </div>
    );
  }

  // Active status values shorthand
  const { day, period, player, stats, currentEvent, history, unlockedThresholds } = gameState;
  const activeCharProfile = currentEvent?.speaker ? CHARACTERS[currentEvent.speaker] : null;

  return (
    <div className="min-h-screen bg-[#050505] text-[#E0D8D0] font-sans flex flex-col justify-between selection:bg-accent-gold/30 selection:text-white">
      
      {/* 1. Global HUD Header Bar */}
      <header className="bg-dark-panel/95 border-b border-dark-border sticky top-0 z-50 py-3.5 px-4 sm:px-6 lg:px-8 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* Logo & Info */}
          <div className="flex items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-serif tracking-[0.2em] font-medium text-accent-gold uppercase">名利场</span>
                <span className="text-[10px] font-serif tracking-[0.3em] font-light text-gray-500 uppercase">VANITY FAIR</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-0.5 font-mono">
                女主：<strong className="text-gray-200">{player?.name}</strong> • 身份阶层：<span className="text-accent-gold font-semibold">{getIdentityChineseName(player?.identityClass || IdentityClass.Supermodel)}</span>
              </p>
            </div>
            
            {/* Round display day indicator */}
            <div className="bg-[#0A0A0A] border border-dark-border px-3 py-1.5 rounded-xl text-center">
              <div className="text-[10px] text-accent-gold font-mono tracking-widest uppercase">DAY PROGRESS</div>
              <div className="text-sm font-extrabold text-accent-gold font-mono leading-none mt-0.5">
                {day} <span className="text-xs text-gray-500 font-normal">/ 30 天</span>
              </div>
            </div>

            {/* Stage indicator */}
            <div className="hidden sm:block text-[11px] font-mono px-2.5 py-1 select-none backdrop-blur rounded border border-dark-border/80">
              {day <= 10 && <span className="text-accent-gold">试探季 • 大家都在看你</span>}
              {day > 10 && day <= 20 && <span className="text-orange-400">暗流季 • 水面已在暗战</span>}
              {day > 20 && <span className="text-red-400 font-bold">决断季 • 带着什么离开</span>}
            </div>
          </div>

          {/* Quick global states gauges */}
          <div className="flex flex-wrap gap-4 items-center justify-end">
            {/* Global multi tension gauge */}
            <div className="flex flex-col gap-1 text-[11px] font-mono min-w-[110px] p-1.5 bg-[#0A0A0A]/40 rounded border border-dark-border relative group">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-gray-500 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-orange-500" />
                  多线张力值
                </span>
                <span className={`font-bold ${stats.tension >= 60 ? "text-red-500" : stats.tension >= 35 ? "text-orange-500" : "text-accent-gold"}`}>
                  {stats.tension}%
                </span>
              </div>
              <div className="w-full bg-[#1A1A1A] h-1.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    stats.tension >= 70 ? "bg-red-600" : stats.tension >= 40 ? "bg-orange-500" : "bg-accent-gold"
                  }`}
                  style={{ width: `${stats.tension}%` }}
                />
              </div>
              {stats.tension >= 60 && (
                <div className="absolute -bottom-1 left-1.5 translate-y-full bg-red-950 text-red-300 text-[8px] px-1 py-0.5 rounded border border-red-500/20 shadow uppercase scale-90">
                  三角撞车高发
                </div>
              )}
            </div>

            {/* Global candor gauge */}
            <div className="flex flex-col gap-1 text-[11px] font-mono min-w-[110px] p-1.5 bg-[#0A0A0A]/40 rounded border border-dark-border">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-gray-500 flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-blue-400" />
                  全局坦诚值
                </span>
                <span className="text-blue-400 font-bold">{stats.candor}%</span>
              </div>
              <div className="w-full bg-[#1A1A1A] h-1.5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-400 rounded-full transition-all duration-500" 
                  style={{ width: `${stats.candor}%` }}
                />
              </div>
            </div>

            {/* Global power gauge */}
            <div className="flex flex-col gap-1 text-[11px] font-mono min-w-[110px] p-1.5 bg-[#0A0A0A]/40 rounded border border-dark-border">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-gray-500 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-accent-gold" />
                  全局权力值
                </span>
                <span className="text-accent-gold font-bold">{stats.power}%</span>
              </div>
              <div className="w-full bg-[#1A1A1A] h-1.5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-accent-gold rounded-full transition-all duration-500" 
                  style={{ width: `${stats.power}%` }}
                />
              </div>
            </div>

            {/* Global reset button */}
            <button
              onClick={handleResetGame}
              className="p-2 border border-dark-border hover:bg-neutral-900 rounded-md text-[#888] hover:text-accent-gold transition-colors cursor-pointer flex items-center justify-center"
              title="重新初始化并清空存档"
            >
              <RefreshCcw className="w-4 h-4" />
            </button>
          </div>

        </div>
      </header>

      {/* 2. Main Game Workspace */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        
        {/* LEFT COMPACTS VISUAL DASHBOARD: Three.js relational map & target encyclopedia */}
        <section className="lg:col-span-5 flex flex-col gap-6 h-full min-h-[500px]">
          
          {/* Tab selector menu */}
          <div className="flex gap-2 bg-[#0A0A0A] p-1.5 rounded-xl border border-dark-border">
            <button
              onClick={() => setActivePlayTab("constellation")}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold font-sans cursor-pointer transition-all ${
                activePlayTab === "constellation" 
                  ? "bg-accent-gold/15 text-accent-gold border border-accent-gold/30" 
                  : "text-gray-400 hover:text-[#E0D8D0]"
              }`}
            >
              <Compass className="w-3.5 h-3.5 inline mr-1" />
              关系星座 3D
            </button>
            <button
              onClick={() => setActivePlayTab("encyclopedia")}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold font-sans cursor-pointer transition-all ${
                activePlayTab === "encyclopedia" 
                  ? "bg-accent-gold/15 text-accent-gold border border-accent-gold/30" 
                  : "text-gray-400 hover:text-[#E0D8D0]"
              }`}
            >
              <Award className="w-3.5 h-3.5 inline mr-1" />
              名流密卷档案
            </button>
            <button
              onClick={() => setActivePlayTab("history")}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold font-sans cursor-pointer transition-all ${
                activePlayTab === "history" 
                  ? "bg-accent-gold/15 text-accent-gold border border-accent-gold/30" 
                  : "text-gray-400 hover:text-[#E0D8D0]"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 inline mr-1" />
              心诀日志 ({history.length})
            </button>
          </div>

          {/* Interactive display render blocks */}
          <div className="flex-1 flex flex-col min-h-[450px]">
            {activePlayTab === "constellation" && (
              <div className="flex-1 min-h-[400px]">
                <ThreeCanvas stats={stats} activeCharacterId={currentEvent?.speaker} />
                <div className="mt-2 bg-[#0A0A0A]/50 border border-dark-border p-3 rounded-xl text-[11px] text-gray-400 leading-snug">
                  <span className="text-accent-gold font-bold uppercase block text-[10px] mb-0.5 font-mono">Constellation Gravity Tips</span>
                  金钱与欲望在此处形成社交引力。代表男主的星体与你的核心引力点（YOU）的距离随着好感起跌而实时拉近或推远。切换「修罗场张力对立」与「名利博弈矩阵」标签可全盘预判多线交锋的修罗风险。
                </div>
              </div>
            )}

            {activePlayTab === "encyclopedia" && (
              <CharEncyclopedia 
                activeCharacterId={sidebarCharId}
                onSelectCharacter={(id) => setSidebarCharId(id)}
                favorability={stats.favorability}
              />
            )}

            {activePlayTab === "history" && (
              <div className="bg-[#0A0A0A]/60 p-5 rounded-2xl border border-dark-border overflow-y-auto max-h-[500px] flex-1 text-xs space-y-4 custom-scrollbar">
                <h2 className="text-sm font-semibold tracking-tight text-accent-gold border-b border-dark-border pb-2 font-serif">
                  名利场周旋轨迹 
                </h2>
                {history.length === 0 ? (
                  <div className="text-center p-8 text-neutral-550 italic font-serif">
                    暂无历史对决。今天是你踏进 SevenClub 的第一天。
                  </div>
                ) : (
                  history.map((log, lidx) => (
                    <div key={lidx} className="bg-[#111111]/40 p-3 rounded-xl border border-dark-border/40 space-y-2">
                      <div className="flex justify-between text-[10px] font-mono text-gray-500">
                        <span>第 {log.day} 天 • {log.period}</span>
                        <span className="text-accent-gold font-bold">{log.eventTitle}</span>
                      </div>
                      <p className="text-gray-300 font-serif leading-relaxed line-clamp-4">
                        {log.narrative.replace(/【你选择了】：.*?\n\n/, "")}
                      </p>
                      <div className="text-[10px] font-serif text-accent-gold font-medium">
                        「你选择了」：{log.choiceMade}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </section>

        {/* RIGHT CORE STORY PANEL READER: Text Narrative, dialogue, interaction, D option */}
        <section className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-[#0A0A0A]/95 border border-dark-border p-6 sm:p-8 rounded-2xl flex-1 flex flex-col justify-between shadow-xl relative overflow-hidden min-h-[550px]">
            <div className="absolute top-0 left-0 w-24 h-24 border-t border-l border-accent-gold/20 rounded-tl-2xl pointer-events-none" />
            
            {activeReaction ? (
              // CHARACTER REACTION INTERMEDIATE VIEW
              <div className="flex-1 flex flex-col justify-between h-full min-h-[480px]">
                <div>
                  <div className="mb-6 pb-4 border-b border-dark-border">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono bg-accent-gold/15 text-accent-gold border border-accent-gold/30 px-2 py-0.5 rounded-md">
                        RESOLVED • DECISION
                      </span>
                      <span className="text-xs font-mono text-gray-500 uppercase tracking-widest font-semibold">
                        • {activeReaction.eventTitle}
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-serif font-medium text-sand tracking-tight mt-3 text-left">
                       攻略角色实时回响
                    </h2>
                  </div>

                  <div className="space-y-5 text-left">
                    {/* The Choice Made Display */}
                    <div className="bg-[#111111]/80 border border-dark-border/60 p-4 rounded-xl">
                      <span className="text-[10px] font-mono text-accent-gold uppercase tracking-widest font-semibold block mb-1">
                        你的抉择行为：
                      </span>
                      <p className="text-xs text-sand font-mono italic">
                        {activeReaction.choiceMade}
                      </p>
                    </div>

                    {/* Character avatar profile card */}
                    {activeReaction.speaker && CHARACTERS[activeReaction.speaker] && (
                      (() => {
                        const char = CHARACTERS[activeReaction.speaker];
                        return (
                          <div className="flex items-center gap-3 bg-[#111111]/45 p-3 rounded-lg border border-dark-border/40">
                            <div 
                              className="w-10 h-10 rounded-full flex items-center justify-center font-mono font-bold text-xs"
                              style={{ 
                                backgroundColor: `${char.avatarColor}15`, 
                                border: `2px solid ${char.avatarColor}`, 
                                color: char.avatarColor,
                                boxShadow: `0 0 10px ${char.avatarColor}30`
                              }}
                            >
                              {char.id}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-sand font-serif flex items-center gap-2">
                                {char.name}
                                <span className="text-[8px] font-mono text-accent-gold border border-accent-gold/30 px-1 py-[1px] rounded font-bold">
                                  {char.mbti}
                                </span>
                              </div>
                              <p className="text-[9px] text-gray-550 mt-0.5">{char.datingStyle}</p>
                            </div>
                          </div>
                        );
                      })()
                    )}

                    {/* Response narrative body */}
                    <div className="bg-gradient-to-b from-[#111111]/60 to-black/80 p-5 sm:p-6 rounded-xl border border-accent-gold/30 relative">
                      <div className="absolute top-2 right-2 flex gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent-gold animate-pulse" />
                        <span className="w-1.5 h-1.5 rounded-full bg-accent-gold/40" />
                      </div>
                      <p className="text-sm sm:text-base font-serif text-[#E0D8D0] leading-relaxed whitespace-pre-wrap text-left antialiased tracking-wide select-text">
                        {activeReaction.narrative.includes("【你选择了】：")
                          ? activeReaction.narrative.split("\n\n").slice(1).join("\n\n")
                          : activeReaction.narrative
                        }
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-dark-border">
                  <button
                    onClick={() => setActiveReaction(null)}
                    className="w-full py-3.5 bg-accent-gold hover:bg-accent-gold-dark text-black font-bold uppercase tracking-widest text-[11px] rounded-xl shadow-lg cursor-pointer active:scale-[0.99] transition-all duration-300 flex items-center justify-center gap-2 font-mono"
                  >
                    推进剧情 (点击进入 {getPeriodChineseName(period)})
                    <ChevronRight className="w-4 h-4 text-black" />
                  </button>
                  <p className="text-[8px] text-gray-550 font-mono tracking-widest text-center mt-3 uppercase">
                    SEVENCLUB STORYTIME TRANSITION CONTROLLER
                  </p>
                </div>
              </div>
            ) : (
              // STANDARD EVENT READ PANEL
              <>
                {/* Event Header description */}
                <div className="mb-6 pb-4 border-b border-dark-border">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono bg-[#1A1A1A] text-accent-gold border border-accent-gold/30 px-2 py-0.5 rounded-md">
                        DAY {day}
                      </span>
                      <span className="text-xs font-mono text-gray-500 uppercase tracking-widest font-semibold">
                        • {period} (当日行进度段)
                      </span>
                    </div>
                    <div className="text-[10px] font-mono text-accent-gold-dark font-semibold">
                      EVENT KEY: {currentEvent?.id}
                    </div>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-serif font-medium text-sand tracking-tight mt-3 text-left">
                    {currentEvent?.title}
                  </h2>
                </div>

                {/* Narrative Story board body */}
                <div className="flex-1 space-y-6">
                  {/* Speaker card representation if available */}
                  {activeCharProfile && (
                    <div className="inline-flex items-center gap-3 bg-[#111111]/90 px-4 py-1.5 rounded-full border border-dark-border mb-2">
                      <div 
                        className="w-3.5 h-3.5 rounded-full" 
                        style={{ backgroundColor: activeCharProfile.avatarColor, boxShadow: `0 0 8px ${activeCharProfile.avatarColor}` }}
                      />
                      <span className="text-xs font-sans font-semibold text-[#E0D8D0]">{activeCharProfile.name} ({activeCharProfile.mbti})</span>
                      <span className="text-[9px] text-gray-550 font-mono"> | ACTIVE CONVERSANT</span>
                    </div>
                  )}

                  {/* Main storytelling segment */}
                  <div className="bg-[#111111]/30 p-4 sm:p-6 rounded-xl border border-dark-border/60">
                    <p className="text-sm sm:text-base font-serif text-sand leading-relaxed whitespace-pre-wrap text-left antialiased tracking-wide select-text">
                      {currentEvent?.description}
                    </p>
                  </div>

                  {/* Threshold Notices List if triggered */}
                  {unlockedThresholds.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-accent-gold font-bold uppercase tracking-wider block">
                        已触发解锁之社交判定:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {unlockedThresholds.slice(-3).map((note, index) => (
                          <span key={index} className="text-[10px] font-mono bg-red-955/40 text-red-450 border border-red-500/15 px-2 py-0.5 rounded animate-pulse">
                            {note}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Play Choice Interactive Panel */}
                <div className="mt-8 pt-6 border-t border-dark-border">
                  
                  {errorMessage && (
                    <div className="bg-red-955/30 border border-red-500/20 text-red-500 p-3 rounded-lg text-xs font-mono mb-4 text-left">
                      [系统回执异常]: {errorMessage}
                    </div>
                  )}

                  <div className="space-y-4">
                    <span className="text-[10px] font-mono text-accent-gold font-bold uppercase tracking-widest block text-left">
                      你在这场局里的抉择:
                    </span>

                    <div className="grid grid-cols-1 gap-2.5">
                      {currentEvent?.choices.map((choice) => (
                        <button
                          key={choice.id}
                          onClick={() => handleSubmitChoice(choice.id)}
                          disabled={isSubmittingChoice}
                          className="p-3 bg-[#111111]/80 hover:bg-accent-gold/10 border border-dark-border hover:border-accent-gold/70 rounded-xl text-left text-xs text-sand hover:text-[#E0D8D0] font-sans cursor-pointer transition-all duration-300 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed group flex gap-3 items-center"
                        >
                          <div className="w-6 h-6 rounded-full bg-[#0A0A0A] border border-dark-border flex items-center justify-center text-[10px] font-mono font-bold group-hover:border-accent-gold/70 text-accent-gold group-hover:text-black group-hover:bg-accent-gold transition-colors">
                            {choice.id}
                          </div>
                          <span className="flex-1 leading-normal">{choice.text}</span>
                        </button>
                      ))}
                    </div>

                    {/* Option D custom action submission - Absolute highlight of AI capability */}
                    {currentEvent && !currentEvent.id.includes("DAY30_") && (
                      <div className="mt-4 pt-4 border-t border-dark-border space-y-2">
                        <div className="flex items-center justify-between text-[10px] font-mono">
                          <span className="text-accent-gold uppercase tracking-widest font-semibold flex items-center gap-1">
                            <Volume2 className="w-3.5 h-3.5 text-accent-gold" />
                            【自定义选项 D】 · AI 智能行为输入
                          </span>
                          <span className="text-gray-500 scale-90">支持完全任意的语言或身体交互反应</span>
                        </div>
                        
                        <div className="flex gap-2">
                          <input 
                            type="text"
                            value={customActionText}
                            onChange={(e) => setCustomActionText(e.target.value)}
                            placeholder="例如：「我冷饮杯中残酒，抬起下巴玩味反问他到底谁才是真正害怕出局的人...」"
                            className="bg-[#0A0A0A] border border-dark-border rounded-xl px-3 py-2 text-xs text-[#E0D8D0] placeholder-neutral-700 focus:outline-none focus:border-accent-gold/80 flex-1 transition-colors"
                            disabled={isSubmittingChoice}
                          />
                          <button
                            onClick={() => handleSubmitChoice("D", customActionText)}
                            disabled={isSubmittingChoice || !customActionText.trim()}
                            className="bg-accent-gold hover:bg-accent-gold-dark text-black font-semibold text-xs px-4 rounded-xl cursor-pointer hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all py-2"
                          >
                            {isSubmittingChoice ? (
                              <Loader2 className="w-4 h-4 animate-spin text-black inline-block" />
                            ) : (
                              "向 AI 摊牌"
                            )}
                          </button>
                        </div>
                        <p className="text-[9px] text-[#555] text-left font-serif italic leading-none">
                          AI剧情引擎将实时解析你的所有言行和挑衅，完美维护男主MBTI和人设底线，给出无悔反应。
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </section>

      </main>

      {/* 3. Global Dashboard Footer */}
      <footer className="bg-[#0A0A0A] border-t border-dark-border py-2 px-4 shadow-inner pointer-events-none select-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-[10px] font-mono tracking-widest text-[#555]">
          <span>STATUS: ONLINE • ENGINE READY</span>
          <span>© SEVENCLUB BLACK CARD ARCHIVE</span>
        </div>
      </footer>
    </div>
  );
}
