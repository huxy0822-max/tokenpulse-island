import {
  Activity,
  Award,
  Bot,
  CalendarCheck,
  Check,
  ChevronUp,
  Flame,
  Gauge,
  Github,
  GitPullRequest,
  Loader2,
  Radio,
  RefreshCcw,
  Sparkles,
  Star,
  Target,
  Terminal,
  Trophy,
  UploadCloud,
  Zap
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { demoSummary, formatCount, formatPercent } from "./data";
import type { Badge, BehaviorSignal, Quest, TokenSummary, ToolSignal } from "./types";

const iconMap = {
  activity: Activity,
  award: Award,
  bot: Bot,
  "calendar-check": CalendarCheck,
  flame: Flame,
  gauge: Gauge,
  github: Github,
  "git-pull-request": GitPullRequest,
  sparkles: Sparkles,
  star: Star,
  target: Target,
  terminal: Terminal,
  trophy: Trophy,
  "upload-cloud": UploadCloud,
  zap: Zap,
  "trending-up": ChevronUp
};

function DynamicIcon({ name, size = 18 }: { name: string; size?: number }) {
  const Icon = iconMap[name as keyof typeof iconMap] || Activity;
  return <Icon size={size} strokeWidth={1.8} />;
}

async function loadSummary(): Promise<TokenSummary> {
  const response = await fetch(`/api/summary?ts=${Date.now()}`, {
    headers: { accept: "application/json" }
  });
  const contentType = response.headers.get("content-type") || "";
  if (!response.ok || !contentType.includes("application/json")) {
    throw new Error(`summary api unavailable ${response.status}`);
  }
  const data = (await response.json()) as TokenSummary;
  if (!data.ok) throw new Error("summary api returned not ok");
  return data;
}

export default function App() {
  const [summary, setSummary] = useState<TokenSummary>(demoSummary);
  const [loading, setLoading] = useState(false);
  const [pulse, setPulse] = useState(0);
  const [range, setRange] = useState<"today" | "week">("today");

  const maxHistory = useMemo(
    () => Math.max(1, ...summary.history.map((point) => point.normalized)),
    [summary.history]
  );

  const refresh = async () => {
    setLoading(true);
    try {
      const next = await loadSummary();
      setSummary(next);
    } catch {
      setSummary({ ...demoSummary, generatedAt: new Date().toISOString() });
    } finally {
      setPulse((value) => value + 1);
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-block">
          <div className="brand-mark" aria-hidden="true">
            <Radio size={22} />
          </div>
          <div>
            <h1>OpenToken 反馈小岛</h1>
            <p>OpenToken 即时反馈层</p>
          </div>
        </div>

        <div className="top-actions">
          <div className="segmented" aria-label="时间范围">
            <button className={range === "today" ? "active" : ""} onClick={() => setRange("today")}>
              今日
            </button>
            <button className={range === "week" ? "active" : ""} onClick={() => setRange("week")}>
              7 日
            </button>
          </div>
          <button className="icon-button" aria-label="刷新数据" onClick={refresh} disabled={loading}>
            {loading ? <Loader2 className="spin" size={18} /> : <RefreshCcw size={18} />}
          </button>
          <button className="primary-action" onClick={() => setPulse((value) => value + 1)}>
            <Zap size={17} />
            触发反馈
          </button>
        </div>
      </header>

      <section className="workspace">
        <section className="signal-column">
          <StatusRail summary={summary} />
          <IslandPulse key={pulse} summary={summary} range={range} />
          <RhythmChart summary={summary} maxHistory={maxHistory} />
        </section>

        <section className="detail-column">
          <QuestBoard quests={summary.quests} />
          <ToolShare tools={summary.tools} />
          <BehaviorSignals signals={summary.behaviorSignals} />
        </section>

        <aside className="side-column">
          <BadgeStrip badges={summary.badges} />
          <LocalBridge summary={summary} />
        </aside>
      </section>
    </main>
  );
}

function StatusRail({ summary }: { summary: TokenSummary }) {
  const metricItems = [
    { label: "榜单 Token", value: summary.totalLabel, detail: summary.date, icon: "activity" },
    { label: "排名", value: summary.rankLabel, detail: summary.gapLabel ? `差 ${summary.gapLabel}` : "等待榜单", icon: "trophy" },
    { label: "专注", value: String(summary.focusScore), detail: `${summary.streak} 天连续`, icon: "gauge" },
    { label: "新输入输出", value: formatCount(summary.normalized), detail: "不含缓存", icon: "terminal" }
  ];

  return (
    <section className="status-grid" aria-label="当前状态">
      {metricItems.map((item) => (
        <div className="metric-panel" key={item.label}>
          <div className="metric-head">
            <DynamicIcon name={item.icon} />
            <span>{item.label}</span>
          </div>
          <strong>{item.value}</strong>
          <small>{item.detail}</small>
        </div>
      ))}
    </section>
  );
}

function IslandPulse({ summary, range }: { summary: TokenSummary; range: "today" | "week" }) {
  const totalCopy = summary.totalLabel === "未连接" ? summary.totalLabel : `${summary.totalLabel} Token`;
  const rankCopy =
    summary.rank === 1
      ? `守住第 1，领先 ${summary.leadLabel || "0"}`
      : summary.rank
        ? `当前 ${summary.rankLabel}，距上一名 ${summary.gapLabel || "0"}`
        : "等待榜单匹配";

  return (
    <section className="island-stage" aria-label="反馈小岛">
      <div className="ambient-lines" aria-hidden="true" />
      <div className="island-card">
        <div className="island-left">
          <span className="live-dot" />
          <div>
            <p>{range === "today" ? "今日反馈" : "7 日反馈"}</p>
            <h2>{totalCopy}</h2>
          </div>
        </div>
        <div className="island-right">
          <strong>{summary.rankLabel}</strong>
          <span>{summary.primaryTool}</span>
        </div>
      </div>
      <div className="pulse-copy">
        <p>{rankCopy}</p>
        <span>{summary.levelTitle} · 经验 {formatPercent(summary.xp / Math.max(1, summary.xpMax))}</span>
      </div>
      <div className="xp-track" aria-label="经验进度">
        <i style={{ width: `${summary.xpPct}%` }} />
      </div>
    </section>
  );
}

function RhythmChart({ summary, maxHistory }: { summary: TokenSummary; maxHistory: number }) {
  return (
    <section className="surface rhythm">
      <div className="section-title">
        <div>
          <h2>7 日节奏</h2>
          <p>{summary.mode === "local" ? "来自本机 OpenToken" : "演示数据"}</p>
        </div>
        <span className={`mode-pill ${summary.mode}`}>{summary.mode === "local" ? "本机" : "演示"}</span>
      </div>
      <div className="bars">
        {summary.history.map((point) => (
          <div className="bar-item" key={point.date}>
            <span className="bar-value">{formatCount(point.normalized)}</span>
            <i style={{ height: `${Math.max(10, (point.normalized / maxHistory) * 100)}%` }} />
            <small>{point.label}</small>
          </div>
        ))}
      </div>
    </section>
  );
}

function QuestBoard({ quests }: { quests: Quest[] }) {
  return (
    <section className="surface">
      <div className="section-title">
        <div>
          <h2>任务</h2>
          <p>把排名压力拆成下一步</p>
        </div>
        <Target size={19} />
      </div>
      <div className="quest-list">
        {quests.map((quest) => (
          <div className={`quest-row ${quest.tone}`} key={quest.title}>
            <span className="quest-state">{quest.done ? <Check size={16} /> : <Target size={16} />}</span>
            <div>
              <strong>{quest.title}</strong>
              <p>{quest.detail}</p>
            </div>
            <em>{quest.reward}</em>
          </div>
        ))}
      </div>
    </section>
  );
}

function ToolShare({ tools }: { tools: ToolSignal[] }) {
  return (
    <section className="surface">
      <div className="section-title">
        <div>
          <h2>工具占比</h2>
          <p>榜单贡献</p>
        </div>
        <Bot size={19} />
      </div>
      <div className="tool-list">
        {tools.map((tool) => (
          <div className="tool-row" key={tool.id}>
            <span className="tool-icon" style={{ color: tool.color }}>
              <DynamicIcon name={tool.icon} />
            </span>
            <div className="tool-main">
              <div>
                <strong>{tool.label}</strong>
                <small>{formatCount(tool.normalized)}</small>
              </div>
              <span className="tool-track">
                <i style={{ width: `${Math.max(4, tool.share * 100)}%`, background: tool.color }} />
              </span>
            </div>
            <em>{formatPercent(tool.share)}</em>
          </div>
        ))}
      </div>
    </section>
  );
}

function BehaviorSignals({ signals }: { signals: BehaviorSignal[] }) {
  return (
    <section className="surface">
      <div className="section-title">
        <div>
          <h2>行为信号</h2>
          <p>比口头反馈更接近需求</p>
        </div>
        <Github size={19} />
      </div>
      <div className="signal-list">
        {signals.map((signal) => (
          <div className={`signal-row ${signal.tone}`} key={signal.label}>
            <span>{signal.label}</span>
            <strong>{signal.value}</strong>
            <small>{signal.detail}</small>
          </div>
        ))}
      </div>
    </section>
  );
}

function BadgeStrip({ badges }: { badges: Badge[] }) {
  return (
    <section className="surface badge-surface">
      <div className="section-title">
        <div>
          <h2>成就</h2>
          <p>解锁状态</p>
        </div>
        <Award size={19} />
      </div>
      <div className="badge-list">
        {badges.map((badge) => (
          <div className={`badge-row ${badge.unlocked ? "unlocked" : "locked"}`} key={badge.title}>
            <span>
              <DynamicIcon name={badge.unlocked ? badge.icon : "target"} />
            </span>
            <div>
              <strong>{badge.title}</strong>
              <small>{badge.detail}</small>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function LocalBridge({ summary }: { summary: TokenSummary }) {
  return (
    <section className="surface bridge">
      <div className="section-title">
        <div>
          <h2>连接</h2>
          <p>{summary.sourceNote}</p>
        </div>
        <UploadCloud size={19} />
      </div>
      <div className="bridge-grid">
        <div>
          <span>输入</span>
          <strong>{formatCount(summary.input)}</strong>
        </div>
        <div>
          <span>输出</span>
          <strong>{formatCount(summary.output)}</strong>
        </div>
        <div>
          <span>缓存</span>
          <strong>{formatCount(summary.cache)}</strong>
        </div>
        <div>
          <span>主力</span>
          <strong>{summary.primaryToolShareLabel}</strong>
        </div>
      </div>
    </section>
  );
}
