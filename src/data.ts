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
  sourceNote: "未连接本机 OpenToken",
  normalized: 0,
  raw: 0,
  input: 0,
  output: 0,
  cache: 0,
  totalLabel: "未连接",
  rawLabel: "0",
  rank: null,
  rankLabel: "#--",
  gapLabel: "",
  leadLabel: "",
  rankDelta: 0,
  level: 1,
  levelTitle: "等待本机数据",
  xp: 0,
  xpMax: 25_000_000,
  xpPct: 4,
  streak: 0,
  focusScore: 0,
  primaryTool: "等待数据",
  primaryToolShareLabel: "0%",
  tools: [],
  quests: [
    { title: "等待本机数据", detail: "启动本地服务后读取真实 OpenToken 预览", reward: "+0 经验", done: false, tone: "green" },
    { title: "等待榜单匹配", detail: "连接榜单后显示真实排名", reward: "+0 经验", done: false, tone: "blue" },
    { title: "主力工具待确认", detail: "暂无工具占比", reward: "+0 经验", done: false, tone: "amber" }
  ],
  badges: [
    { title: "Codex 主力", detail: "等待本机数据", unlocked: false, icon: "zap" },
    { title: "排名攀升", detail: "等待榜单匹配", unlocked: false, icon: "trending-up" },
    { title: "高产输出", detail: "等待本机数据", unlocked: false, icon: "flame" },
    { title: "七日循环", detail: "等待本机数据", unlocked: false, icon: "calendar-check" }
  ],
  history: [
    { date: "2026-06-17", label: "06/17", normalized: 0 },
    { date: "2026-06-18", label: "06/18", normalized: 0 },
    { date: "2026-06-19", label: "06/19", normalized: 0 },
    { date: "2026-06-20", label: "06/20", normalized: 0 },
    { date: "2026-06-21", label: "06/21", normalized: 0 },
    { date: "2026-06-22", label: "06/22", normalized: 0 },
    { date: "2026-06-23", label: "今天", normalized: 0 }
  ],
  behaviorSignals: [
    { label: "星标", value: "0", detail: "原型仍在冷启动", tone: "amber" },
    { label: "问题", value: "0", detail: "还没有配置问题暴露", tone: "blue" },
    { label: "共建", value: "0", detail: "暂无外部共建", tone: "rose" },
    { label: "安装", value: "本机", detail: "本机可接 OpenToken 预览", tone: "green" }
  ]
};
