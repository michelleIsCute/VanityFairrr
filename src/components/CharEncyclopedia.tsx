import { CHARACTERS, CharacterProfile } from "../types.ts";
import { User, Activity, AlertOctagon, Heart, Zap } from "lucide-react";

interface CharEncyclopediaProps {
  activeCharacterId?: string;
  onSelectCharacter?: (id: string) => void;
  favorability?: Record<string, number>;
}

export default function CharEncyclopedia({ 
  activeCharacterId, 
  onSelectCharacter, 
  favorability = {} 
}: CharEncyclopediaProps) {
  return (
    <div className="bg-dark-panel border border-dark-border p-6 rounded-2xl h-full flex flex-col shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-48 h-48 bg-radial from-[#D4AF37]/5 to-transparent rounded-full pointer-events-none" />
      
      <div className="mb-6">
        <h2 className="text-xl font-serif font-medium text-accent-gold tracking-[0.1em] flex items-center gap-2">
          <User className="w-5 h-5 text-accent-gold" />
          SEVENCLUB 顶级攻略档案
        </h2>
        <p className="text-xs text-[#888] mt-1.5 font-mono">
          「这个房间里最贵的东西，从来不是钱。」
        </p>
      </div>

      {/* Grid of characters */}
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mb-6">
        {Object.values(CHARACTERS).map((char) => {
          const isActive = activeCharacterId === char.id;
          const favVal = favorability[char.id] || 0;
          return (
            <button
              key={char.id}
              onClick={() => onSelectCharacter?.(char.id)}
              className={`p-2 rounded-xl text-center border transition-all duration-300 relative flex flex-col items-center justify-center gap-1.5 cursor-pointer group ${
                isActive 
                  ? "bg-accent-gold/10 border-accent-gold shadow-md shadow-accent-gold/10" 
                  : "bg-[#111111]/80 border-dark-border hover:border-accent-gold/50 hover:bg-[#151515]"
              }`}
            >
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold relative overflow-hidden transition-transform duration-300 group-hover:scale-105"
                style={{ backgroundColor: `${char.avatarColor}20`, border: `1.5px solid ${char.avatarColor}` }}
              >
                <span style={{ color: char.avatarColor }}>{char.name[0]}</span>
                {favVal > 0 && (
                  <div className="absolute -bottom-0.5 right-0 bg-accent-gold text-black text-[7px] font-extrabold px-1 rounded-full scale-75">
                    {favVal}
                  </div>
                )}
              </div>
              <span className="text-[10px] font-sans font-medium text-sand select-none">
                {char.name}
              </span>
              <span className="text-[8px] font-mono text-gray-500 font-medium scale-90">
                {char.mbti}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected character details */}
      {activeCharacterId ? (
        <SelectedCharacterView 
          char={CHARACTERS[activeCharacterId]} 
          favorability={favorability[activeCharacterId] || 0}
        />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-[#111111]/40 rounded-xl border border-dashed border-dark-border">
          <Activity className="w-8 h-8 text-[#555] mb-2 animate-pulse" />
          <p className="text-xs text-gray-500 font-sans">
            点击上方头像索取该成员名利场专属密档
          </p>
        </div>
      )}
    </div>
  );
}

function SelectedCharacterView({ char, favorability }: { char: CharacterProfile; favorability: number }) {
  return (
    <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-sand custom-scrollbar max-h-[350px]">
      <div className="flex items-center gap-3 bg-[#111111]/60 p-3 rounded-xl border border-dark-border/60">
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold font-mono"
          style={{ backgroundColor: `${char.avatarColor}15`, border: `2px solid ${char.avatarColor}`, color: char.avatarColor }}
        >
          {char.id}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-[#E0D8D0] font-sans">{char.name}</span>
            <span className="text-[9px] font-mono bg-[#1A1A1A] text-accent-gold border border-accent-gold/30 px-1.5 py-0.5 rounded">
              {char.mbti}
            </span>
            <span className="text-xs text-gray-400 font-mono">{char.age}岁</span>
          </div>
          <p className="text-[10px] text-gray-400 mt-1 font-sans leading-tight">
            {char.identity}
          </p>
        </div>
      </div>

      {/* Quick affinity stats */}
      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
        <div className="p-2.5 bg-[#0A0A0A] rounded-lg border border-dark-border flex items-center justify-between">
          <span className="text-gray-500">当前好感</span>
          <span className="text-accent-gold font-bold flex items-center gap-1">
            <Heart className="w-3.5 h-3.5 text-red-500 inline fill-red-500" />
            {favorability}/100
          </span>
        </div>
        <div className="p-2.5 bg-[#0A0A0A] rounded-lg border border-dark-border flex items-center justify-between">
          <span className="text-gray-500">嫉妒阈值</span>
          <span className="text-orange-500 font-bold flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-orange-500 inline" />
            {char.jealousyThreshold}%
          </span>
        </div>
      </div>

      {/* Deep characteristics */}
      <div className="space-y-3 text-xs leading-relaxed">
        <div className="bg-[#111111]/30 p-3 rounded-xl border border-dark-border/50">
          <div className="text-[10px] text-accent-gold font-bold font-mono uppercase tracking-wider mb-1 flex items-center gap-1">
            <Heart className="w-3 h-3 text-red-500" />
            恋爱风格与精神共振
          </div>
          <p className="text-gray-300 font-sans text-[11px] leading-relaxed">{char.datingStyle}</p>
        </div>

        <div className="bg-[#111111]/30 p-3 rounded-xl border border-dark-border/50">
          <div className="text-[10px] text-accent-gold font-bold font-mono uppercase tracking-wider mb-1 flex items-center gap-1">
            <Activity className="w-3 h-3 text-accent-gold" />
            名利场高层运转逻辑
          </div>
          <p className="text-gray-300 font-sans text-[11px] leading-relaxed">{char.vanityFairBehavior}</p>
        </div>

        <div className="bg-[#111111]/30 p-3 rounded-xl border border-dark-border/80">
          <div className="text-[10px] text-red-400 font-bold font-mono uppercase tracking-wider mb-1 flex items-center gap-1">
            <AlertOctagon className="w-3.5 h-3.5 text-red-500" />
            不可抵触之权力底线
          </div>
          <p className="text-gray-400 font-sans text-[11px] leading-snug">{char.powerBottomLine}</p>
        </div>

        <div className="bg-[#111111]/20 p-3 rounded-xl border border-dark-border/30">
          <span className="text-[10px] text-accent-gold font-bold font-mono uppercase tracking-wider block mb-2">
            物理肢体语言特征
          </span>
          <ul className="list-disc pl-4 space-y-1.5 text-gray-400 font-sans text-[10px]">
            {char.physicalCues.map((cue, idx) => (
              <li key={idx} className="leading-normal">{cue}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
