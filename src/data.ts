import type { TokenSummary } from "./types";

export function formatCount(value: number): string {
  if (!Number.isFinite(value)) return "0";
  if (value >= 100_000_000) return `${(value / 100_000_000).toFixed(2)}亿`;
  if (value >= 10_000) return `${(value / 10_000).toFixed(1)}万`;
  return Math.round(value).toLocaleString("zh-CN");
}

export function formatPercent(value: number): string {
  return `${Math.round(Math.max(0, Math.min(1, value)) * 100)}%`;
}

export const demoSummary: TokenSummary = {
  ok: true,
  mode: "demo",
  generatedAt: new Date().toISOString(),
  date: "2026-06-23",
  sourceNote: "演示反馈模型",
  normalized: 284_600_000,
  raw: 641_300_000,
  input: 171_400_000,
  output: 113_200_000,
  cache: 356_700_000,
  totalLabel: "2.85亿",
  rawLabel: "6.41亿",
  rank: 7,
  rankLabel: "#7",
  gapLabel: "1,940万",
  leadLabel: "620万",
  rankDelta: 3,
  level: 12,
  levelTitle: "建造者等级 12",
  xp: 9_600_000,
  xpMax: 25_000_000,
  xpPct: 38,
  streak: 6,
  focusScore: 86,
  primaryTool: "Codex",
  primaryToolShareLabel: "72%",
  tools: [
    { id: "codex", label: "Codex", normalized: 205_000_000, raw: 421_000_000, share: 0.72, color: "#34d399", icon: "zap" },
    { id: "claude-code", label: "Claude Code", normalized: 54_000_000, raw: 151_000_000, share: 0.19, color: "#60a5fa", icon: "bot" },
    { id: "opencode", label: "opencode", normalized: 16_800_000, raw: 42_100_000, share: 0.06, color: "#f59e0b", icon: "terminal" },
    { id: "gemini", label: "Gemini", normalized: 8_800_000, raw: 27_200_000, share: 0.03, color: "#f472b6", icon: "sparkles" }
  ],
  quests: [
    { title: "冲刺 3 亿", detail: "还差 1,540万折算 Token", reward: "+620 经验", done: false, tone: "green" },
    { title: "追上上一名", detail: "差距 1,940万，当前上升 3 名", reward: "+800 经验", done: false, tone: "blue" },
    { title: "主力工具稳定", detail: "Codex 占比 72%，反馈链清晰", reward: "已完成", done: true, tone: "amber" }
  ],
  badges: [
    { title: "Codex 主力", detail: "主力工具占比超过 60%", unlocked: true, icon: "zap" },
    { title: "排名攀升", detail: "今日排名上升", unlocked: true, icon: "trending-up" },
    { title: "高产输出", detail: "冲到 3 亿后解锁", unlocked: false, icon: "flame" },
    { title: "七日循环", detail: "连续 7 天有记录", unlocked: false, icon: "calendar-check" }
  ],
  history: [
    { date: "2026-06-17", label: "06/17", normalized: 132_000_000 },
    { date: "2026-06-18", label: "06/18", normalized: 184_000_000 },
    { date: "2026-06-19", label: "06/19", normalized: 226_000_000 },
    { date: "2026-06-20", label: "06/20", normalized: 158_000_000 },
    { date: "2026-06-21", label: "06/21", normalized: 247_000_000 },
    { date: "2026-06-22", label: "06/22", normalized: 301_000_000 },
    { date: "2026-06-23", label: "今天", normalized: 284_600_000 }
  ],
  behaviorSignals: [
    { label: "星标", value: "0", detail: "原型仍在冷启动", tone: "amber" },
    { label: "问题", value: "0", detail: "还没有配置问题暴露", tone: "blue" },
    { label: "共建", value: "0", detail: "暂无外部共建", tone: "rose" },
    { label: "安装", value: "本机", detail: "本机可接 OpenToken 预览", tone: "green" }
  ]
};
