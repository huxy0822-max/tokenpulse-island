export type SourceMode = "demo" | "local";

export type ToolSignal = {
  id: string;
  label: string;
  normalized: number;
  raw: number;
  share: number;
  color: string;
  icon: string;
};

export type Quest = {
  title: string;
  detail: string;
  reward: string;
  done: boolean;
  tone: "green" | "blue" | "amber" | "rose";
};

export type Badge = {
  title: string;
  detail: string;
  unlocked: boolean;
  icon: string;
};

export type DailyPoint = {
  date: string;
  label: string;
  normalized: number;
};

export type BehaviorSignal = {
  label: string;
  value: string;
  detail: string;
  tone: "green" | "blue" | "amber" | "rose";
};

export type TokenSummary = {
  ok: boolean;
  mode: SourceMode;
  generatedAt: string;
  date: string;
  sourceNote: string;
  normalized: number;
  raw: number;
  input: number;
  output: number;
  cache: number;
  totalLabel: string;
  rawLabel: string;
  rank: number | null;
  rankLabel: string;
  gapLabel: string;
  leadLabel: string;
  rankDelta: number;
  level: number;
  levelTitle: string;
  xp: number;
  xpMax: number;
  xpPct: number;
  streak: number;
  focusScore: number;
  primaryTool: string;
  primaryToolShareLabel: string;
  tools: ToolSignal[];
  quests: Quest[];
  badges: Badge[];
  history: DailyPoint[];
  behaviorSignals: BehaviorSignal[];
};

