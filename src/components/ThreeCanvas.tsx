import { useState, useEffect } from "react";
import { CHARACTERS, GameStats, CharacterProfile } from "../types.ts";
import { 
  Heart, 
  Zap, 
  Shield, 
  Compass, 
  Activity, 
  Flame, 
  Users, 
  Sparkles, 
  Award,
  AlertTriangle,
  FileText
} from "lucide-react";

interface ThreeCanvasProps {
  stats: GameStats;
  activeCharacterId?: string;
}

export default function ThreeCanvas({ stats, activeCharacterId }: ThreeCanvasProps) {
  const [selectedId, setSelectedId] = useState<string>("RM");
  const [activeTab, setActiveTab] = useState<"orbit" | "rivalry" | "dossier">("orbit");

  // Synchronize state with current active event speaker
  useEffect(() => {
    if (activeCharacterId && CHARACTERS[activeCharacterId]) {
      setSelectedId(activeCharacterId);
    }
  }, [activeCharacterId]);

  const characters = Object.values(CHARACTERS);

  // SVG Geometry Constants
  const cx = 250;
  const cy = 250;
  const activeChar = CHARACTERS[selectedId] || CHARACTERS["RM"];

  // Calculate coordinates for a character based on favorability
  const getCoordinates = (char: CharacterProfile, index: number) => {
    const totalChars = characters.length;
    const angle = (index * 2 * Math.PI) / totalChars - Math.PI / 2; // Start from top
    const fav = stats.favorability[char.id] ?? 0;
    
    // Intimacy distance mapping: Higher favorability is CLOSER to the player
    // 0 favorability = radius 200 (far orbit)
    // 100 favorability = radius 75 (inner sanctum)
    const radius = 200 - (fav / 100) * 125;
    
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    return { x, y, angle, radius };
  };

  // Pre-calculate positions
  const positions = characters.map((char, index) => ({
    char,
    ...getCoordinates(char, index)
  }));

  // Find competing pairs (Jealousy Collision Risks)
  // Two characters have high favorabilities (> 40)
  const competingPairs: Array<{ char1: CharacterProfile; char2: CharacterProfile; p1: any; p2: any; severity: number }> = [];
  for (let i = 0; i < positions.length; i++) {
    for (let j = i + 1; j < positions.length; j++) {
      const p1 = positions[i];
      const p2 = positions[j];
      const fav1 = stats.favorability[p1.char.id] ?? 0;
      const fav2 = stats.favorability[p2.char.id] ?? 0;
      
      if (fav1 > 40 && fav2 > 40) {
        competingPairs.push({
          char1: p1.char,
          char2: p2.char,
          p1,
          p2,
          severity: Math.min(fav1, fav2)
        });
      }
    }
  }

  return (
    <div className="bg-[#0A0A0A] border border-dark-border rounded-2xl p-4 h-full flex flex-col justify-between shadow-2xl relative overflow-hidden select-none min-h-[440px]">
      
      {/* Top Header Hub */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-dark-border pb-3 mb-4">
        <div>
          <div className="text-xs font-mono tracking-widest text-accent-gold uppercase flex items-center gap-1.5 font-bold">
            <Compass className="w-4 h-4 text-accent-gold animate-spin-slow" />
            SEVENCLUB 关系引力星盘 • 2D Relational Engine
          </div>
          <div className="text-[10px] text-gray-500 font-mono mt-0.5">
            「距离越近，引力越强。不要让其相互碰撞。」
          </div>
        </div>

        {/* Tab switcher inside visual panel */}
        <div className="flex gap-1 bg-[#111111] p-1 rounded-lg border border-dark-border self-stretch sm:self-auto">
          <button
            onClick={() => setActiveTab("orbit")}
            className={`px-2.5 py-1 text-[9px] font-mono rounded cursor-pointer uppercase transition-all duration-200 ${
              activeTab === "orbit"
                ? "bg-accent-gold/15 text-accent-gold font-bold border border-accent-gold/20"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            星引力轨
          </button>
          <button
            onClick={() => setActiveTab("rivalry")}
            className={`px-2.5 py-1 text-[9px] font-mono rounded cursor-pointer uppercase transition-all duration-200 ${
              activeTab === "rivalry"
                ? "bg-accent-gold/15 text-accent-gold font-bold border border-accent-gold/20"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            修罗场张力
          </button>
          <button
            onClick={() => setActiveTab("dossier")}
            className={`px-2.5 py-1 text-[9px] font-mono rounded cursor-pointer uppercase transition-all duration-200 ${
              activeTab === "dossier"
                ? "bg-accent-gold/15 text-accent-gold font-bold border border-accent-gold/20"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            博弈密档
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch flex-1">
        
        {/* Left Interactive SVG Map */}
        <div className="md:col-span-7 flex items-center justify-center bg-black/40 rounded-xl border border-dark-border/40 p-2 relative min-h-[300px]">
          
          {activeTab === "orbit" && (
            <svg viewBox="0 0 500 500" className="w-[88%] h-auto max-h-[370px] select-none">
              <defs>
                {/* Glow Filters */}
                <filter id="glow-gold" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <filter id="glow-red" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="8" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <radialGradient id="player-glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Glowing core background */}
              <circle cx={cx} cy={cy} r="60" fill="url(#player-glow)" pointerEvents="none" />

              {/* Concentric Intimacy Orbits */}
              <circle cx={cx} cy={cy} r="75" fill="none" stroke="#D4AF37" strokeWidth="1" strokeDasharray="3,5" opacity="0.4" />
              <text x={cx} y={cy - 78} fill="#D4AF37" opacity="0.65" fontSize="10" fontFamily="monospace" textAnchor="middle">密友禁区 (好感 100)</text>

              <circle cx={cx} cy={cy} r="137" fill="none" stroke="#a855f7" strokeWidth="0.5" strokeDasharray="5,7" opacity="0.25" />
              <text x={cx} y={cy - 140} fill="#a855f7" opacity="0.4" fontSize="10" fontFamily="monospace" textAnchor="middle">高感引力 (好感 55)</text>

              <circle cx={cx} cy={cy} r="200" fill="none" stroke="#444444" strokeWidth="0.5" opacity="0.3" />
              <text x={cx} y={cy - 204} fill="#666" opacity="0.4" fontSize="9" fontFamily="monospace" textAnchor="middle">社交外轨 (好感 0)</text>

              {/* Render Spokes (Dashed Radial Angles) */}
              {positions.map((p, idx) => (
                <line 
                  key={`spoke-${idx}`}
                  x1={cx} 
                  y1={cy} 
                  x2={cx + 220 * Math.cos(p.angle)} 
                  y2={cy + 220 * Math.sin(p.angle)} 
                  stroke="#222" 
                  strokeWidth="0.5" 
                  strokeDasharray="2,4"
                />
              ))}

              {/* Interactive Connections to Player */}
              {positions.map((p, idx) => {
                const isSelected = selectedId === p.char.id;
                const isActiveConverser = activeCharacterId === p.char.id;
                const fav = stats.favorability[p.char.id] ?? 0;
                
                return (
                  <line
                    key={`line-${idx}`}
                    x1={cx}
                    y1={cy}
                    x2={p.x}
                    y2={p.y}
                    stroke={isSelected ? "#D4AF37" : p.char.avatarColor}
                    strokeWidth={isSelected ? "1.5" : isActiveConverser ? "1" : "0.5"}
                    opacity={isSelected ? "0.85" : "0.35"}
                    strokeDasharray={isActiveConverser ? "4,4" : undefined}
                    className="transition-all duration-500"
                  />
                );
              })}

              {/* Relationship Jealousy tension lines if global tension is elevated */}
              {competingPairs.map((pair, idx) => (
                <path
                  key={`tension-${idx}`}
                  d={`M ${pair.p1.x} ${pair.p1.y} Q ${cx} ${cy} ${pair.p2.x} ${pair.p2.y}`}
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="1.2"
                  strokeDasharray="2,3"
                  opacity={stats.tension > 40 ? "0.6" : "0.25"}
                  filter="url(#glow-red)"
                />
              ))}

              {/* CENTER PLAYER NODE */}
              <g transform={`translate(${cx}, ${cy})`} className="cursor-help group">
                <circle cx="0" cy="0" r="18" fill="#111" stroke="#D4AF37" strokeWidth="2.5" className="animate-pulse" />
                <circle cx="0" cy="0" r="14" fill="#000" />
                <text x="0" y="3" fill="#D4AF37" fontSize="10" fontWeight="bold" fontFamily="monospace" textAnchor="middle">YOU</text>
              </g>

              {/* CELESTIAL CHARACTER BODIES (Nodes) */}
              {positions.map((p, idx) => {
                const isSelected = selectedId === p.char.id;
                const isActiveConverser = activeCharacterId === p.char.id;
                const fav = stats.favorability[p.char.id] ?? 0;
                
                return (
                  <g 
                    key={`node-${p.char.id}`}
                    transform={`translate(${p.x}, ${p.y})`}
                    onClick={() => setSelectedId(p.char.id)}
                    className="cursor-pointer group select-none"
                  >
                    {/* Pulsing ring for selected and conversational member */}
                    {(isSelected || isActiveConverser) && (
                      <circle 
                        cx="0" 
                        cy="0" 
                        r="20" 
                        fill="none" 
                        stroke={p.char.avatarColor} 
                        strokeWidth="1.5" 
                        className="animate-ping" 
                        opacity="0.3" 
                      />
                    )}
                    
                    {/* Node Background Glow */}
                    <circle 
                      cx="0" 
                      cy="0" 
                      r={isSelected ? "15" : "12"} 
                      fill="#111111" 
                      stroke={isSelected ? "#D4AF37" : p.char.avatarColor}
                      strokeWidth={isSelected ? "2.5" : "1.5"}
                      style={{ filter: isSelected ? "url(#glow-gold)" : "" }}
                      className="transition-all duration-300 hover:scale-110"
                    />

                    {/* Character Initial Letter */}
                    <text 
                      x="0" 
                      y="4.5" 
                      fill={isSelected ? "#E0D8D0" : "#a8a8af"} 
                      fontSize={isSelected ? "11" : "10"} 
                      fontWeight="bold" 
                      fontFamily="monospace"
                      textAnchor="middle"
                      className="pointer-events-none"
                    >
                      {p.char.id}
                    </text>

                    {/* Small Favorability indicator badglet */}
                    <g transform={`translate(${11 * Math.cos(p.angle + Math.PI/2)}, ${11 * Math.sin(p.angle + Math.PI/2)})`}>
                      <rect x="-8" y="-7" width="16" height="8" rx="2" fill="#0A0A0A" stroke={p.char.avatarColor} strokeWidth="0.5" opacity="0.9" />
                      <text x="0" y="-1" fill="#fff" fontSize="6.5" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">
                        {fav}
                      </text>
                    </g>

                    {/* Character Name Label Display */}
                    <g transform={`translate(0, ${isSelected ? "26" : "22"})`}>
                      {/* background card */}
                      <rect 
                        x="-24" 
                        y="-8" 
                        width="48" 
                        height="12" 
                        rx="3" 
                        fill="#0A0A0A" 
                        stroke={isSelected ? "#D4AF37" : "#222"} 
                        strokeWidth="0.5" 
                      />
                      <text 
                        x="0" 
                        y="0.5" 
                        fill={isSelected ? "#D4AF37" : "#E0D8D0"} 
                        fontSize="7.5" 
                        fontFamily="sans-serif"
                        fontWeight="semibold"
                        textAnchor="middle"
                      >
                        {p.char.name}
                      </text>
                    </g>
                  </g>
                );
              })}
            </svg>
          )}

          {activeTab === "rivalry" && (
            <div className="w-full flex flex-col justify-between h-full p-2 space-y-3">
              <div className="bg-[#111111]/80 rounded-xl p-3 border border-dark-border text-center">
                <div className="text-red-400 font-bold text-xs tracking-wider flex items-center justify-center gap-1.5 font-serif">
                  <Flame className="w-4 h-4 text-red-500" />
                  修罗场碰撞轴对立 (Jealousy Collision Predictor)
                </div>
                <p className="text-[10px] text-gray-500 font-mono mt-1 leading-tight">
                  当两名异性男主好感度同时突破40点时，嫉妒阀值和专属底线将开始面临强对抗，稍有不慎即会三角撞车。
                </p>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 max-h-[220px] custom-scrollbar pr-1">
                {competingPairs.length === 0 ? (
                  <div className="text-center py-10 text-gray-600 italic text-[10px] font-serif">
                    暂时无多线好感处于严重对抗碰撞状态。安全。
                  </div>
                ) : (
                  competingPairs.map((pair, idx) => {
                    const thresholdDiff = Math.abs((stats.favorability[pair.char1.id] ?? 0) - (stats.favorability[pair.char2.id] ?? 0));
                    const isHighlyDangerous = pair.severity > 55;
                    return (
                      <div 
                        key={idx} 
                        className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-all ${
                          isHighlyDangerous 
                            ? "bg-red-950/25 border-red-500/30" 
                            : "bg-[#111111]/40 border-dark-border"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span 
                            className="w-1.5 h-1.5 rounded-full animate-ping"
                            style={{ backgroundColor: isHighlyDangerous ? "#ef4444" : "#f59e0b" }} 
                          />
                          <div>
                            <div className="font-serif font-semibold text-[#E0D8D0] flex items-center gap-1.5">
                              <span>{pair.char1.name}</span>
                              <span className="text-gray-500 font-normal">⚔️</span>
                              <span>{pair.char2.name}</span>
                            </div>
                            <div className="text-[8.5px] text-gray-400 mt-1 font-mono leading-none">
                              博弈级差: {thresholdDiff} 点 • 对抗烈度: {isHighlyDangerous ? "极高特危" : "暗涌警戒"}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className={`text-[10px] font-bold font-mono ${isHighlyDangerous ? "text-red-400" : "text-amber-500"}`}>
                            碰撞阈: {pair.severity}%
                          </span>
                          <span className="block text-[8px] text-red-400/80 mt-0.5 font-sans scale-90">
                            {isHighlyDangerous ? "⚠️ 强烈嫉妒警戒" : "⚖️ 双轨博弈平衡"}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Indicator Status of tension */}
              <div className="p-2.5 bg-[#0A0A0A] rounded-xl border border-dark-border/80 flex items-center justify-between text-[11px] font-mono">
                <div className="text-gray-500">全局修罗张力指征</div>
                <div className="flex items-center gap-2">
                  <span className={`font-bold ${stats.tension > 60 ? "text-red-500" : stats.tension > 30 ? "text-orange-500" : "text-accent-gold"}`}>
                    {stats.tension}%
                  </span>
                  <div className="w-12 bg-neutral-900 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        stats.tension > 60 ? "bg-red-500" : stats.tension > 30 ? "bg-orange-500" : "bg-accent-gold"
                      }`}
                      style={{ width: `${stats.tension}%` }}
                    />
                  </div>
                </div>
              </div>

            </div>
          )}

          {activeTab === "dossier" && (
            <div className="w-full flex flex-col justify-between h-full p-2 space-y-2">
              <div className="text-center bg-[#111111]/80 rounded-xl p-3 border border-dark-border">
                <div className="text-accent-gold font-bold text-xs tracking-wider flex items-center justify-center gap-1.5 font-serif">
                  <Award className="w-4 h-4 text-accent-gold" />
                  SevenClub 成员博弈值速查矩阵
                </div>
              </div>

              <div className="flex-1 overflow-x-auto">
                <table className="w-full text-left text-[10px] border-collapse font-sans">
                  <thead>
                    <tr className="border-b border-dark-border text-gray-500 uppercase font-mono">
                      <th className="py-2 px-1">成员名</th>
                      <th className="py-2 px-1">MBTI</th>
                      <th className="py-2 px-1 text-center text-red-400 hover:text-red-300">❤️ 好感</th>
                      <th className="py-2 px-1 text-center text-[#B57EDC]">🌸 亲密</th>
                      <th className="py-2 px-1 text-center text-blue-400">🛡️ 真心</th>
                      <th className="py-2 px-1 text-center text-orange-400">⚔️ 博弈</th>
                    </tr>
                  </thead>
                  <tbody>
                    {characters.map((char) => {
                      const isSel = selectedId === char.id;
                      const f = stats.favorability[char.id] ?? 0;
                      const im = stats.intimacy[char.id] ?? 0;
                      const s = stats.sincerity[char.id] ?? 0;
                      const d = stats.duel[char.id] ?? 0;
                      return (
                        <tr 
                          key={char.id}
                          className={`border-b border-[#111]/50 hover:bg-[#111111]/40 cursor-pointer ${isSel ? "bg-accent-gold/5" : ""}`}
                          onClick={() => setSelectedId(char.id)}
                        >
                          <td className="py-2.5 px-1 font-semibold text-[#E0D8D0]">{char.name}</td>
                          <td className="py-2.5 px-1 font-mono text-gray-400">{char.mbti}</td>
                          <td className="py-2.5 px-1 text-center font-mono font-bold text-red-400">{f}</td>
                          <td className="py-2.5 px-1 text-center font-mono text-[#B57EDC]">{im}</td>
                          <td className="py-2.5 px-1 text-center font-mono text-blue-400">{s}</td>
                          <td className="py-2.5 px-1 text-center font-mono text-orange-400">{d}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Right HUD Information Control board */}
        <div className="md:col-span-5 flex flex-col justify-between">
          <div className="bg-[#111111]/50 border border-dark-border/40 rounded-xl p-4 flex-1 flex flex-col justify-between space-y-4">
            
            {/* Top Identity bar */}
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold"
                    style={{ backgroundColor: `${activeChar.avatarColor}15`, border: `1.5px solid ${activeChar.avatarColor}`, color: activeChar.avatarColor }}
                  >
                    {activeChar.id}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#E0D8D0] font-sans flex items-center gap-1.5">
                      {activeChar.name}
                      <span className="text-[9px] font-mono bg-[#222] text-accent-gold border border-accent-gold/20 px-1 py-0.2 rounded font-semibold">
                        {activeChar.mbti}
                      </span>
                    </h4>
                    <p className="text-[9px] text-gray-500 font-mono mt-0.5 select-text">
                      {activeChar.identity}
                    </p>
                  </div>
                </div>
              </div>

              {/* MBTI Love Tagline */}
              <p className="text-[10px] text-accent-gold-dark font-serif italic mt-2.5 leading-snug border-l-2 border-accent-gold/40 pl-2">
                「{activeChar.datingStyle}」
              </p>
            </div>

            {/* Metrics Sliders */}
            <div className="space-y-2.5">
              
              {/* Slider 1: Favorability */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="text-red-400 flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 inline fill-red-400/20 text-red-400" />
                    【好感度】
                  </span>
                  <span className="font-bold text-red-400">
                    {stats.favorability[activeChar.id] ?? 0}点 / 100
                  </span>
                </div>
                <div className="h-1 bg-[#1A1A1A] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-red-400 rounded-full transition-all duration-500" 
                    style={{ width: `${stats.favorability[activeChar.id] ?? 0}%` }}
                  />
                </div>
              </div>

              {/* Slider 2: Intimacy */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="text-[#B57EDC] flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 inline" />
                    【亲密度】
                  </span>
                  <span className="font-bold text-[#B57EDC]">
                    {stats.intimacy[activeChar.id] ?? 0}点 / 100
                  </span>
                </div>
                <div className="h-1 bg-[#1A1A1A] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#B57EDC] rounded-full transition-all duration-500" 
                    style={{ width: `${stats.intimacy[activeChar.id] ?? 0}%` }}
                  />
                </div>
              </div>

              {/* Slider 3: Sincerity */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="text-blue-400 flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 inline" />
                    【真心度】
                  </span>
                  <span className="font-bold text-blue-400">
                    {stats.sincerity[activeChar.id] ?? 0}点 / 100
                  </span>
                </div>
                <div className="h-1 bg-[#1A1A1A] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-400 rounded-full transition-all duration-500" 
                    style={{ width: `${stats.sincerity[activeChar.id] ?? 0}%` }}
                  />
                </div>
              </div>

              {/* Slider 4: Duel Index */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="text-orange-400 flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5 inline" />
                    【博弈值】
                  </span>
                  <span className="font-bold text-orange-400">
                    {stats.duel[activeChar.id] ?? 0}点 / 100
                  </span>
                </div>
                <div className="h-1 bg-[#1A1A1A] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-orange-400 rounded-full transition-all duration-500" 
                    style={{ width: `${stats.duel[activeChar.id] ?? 0}%` }}
                  />
                </div>
              </div>

            </div>

            {/* Quick action info */}
            <div className="bg-[#050505] p-2.5 rounded-lg border border-dark-border/60 text-[9.5px] leading-relaxed text-gray-400 font-sans select-text">
              <span className="text-accent-gold font-bold uppercase block text-[8px] font-mono mb-1 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-accent-gold" />
                嫉妒过载警告：{activeChar.jealousyThreshold}%
              </span>
              若是他在会场看到您跟他人的暧昧超出该阈值，博弈人设心算会直接冻结，转而产生嫉妒对立！
            </div>

          </div>
        </div>

      </div>

      {/* Grid Bottom status line */}
      <div className="mt-3 pt-2.5 border-t border-dark-border flex flex-col sm:flex-row items-center justify-between text-[9px] font-mono text-gray-500 uppercase tracking-widest gap-2">
        <span>RELATION_CARD_MATRIX: VER 3.0</span>
        <span>CLICK ON NODES TO CHANGE ACTIVE VIEWPORT FOCUS</span>
      </div>

    </div>
  );
}
