import { execFile } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import https from "node:https";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist");
const port = Number(process.env.PORT || 4188);
const home = process.env.HOME || os.homedir();

const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".json": "application/json; charset=utf-8"
};

const demoSignals = [
  { label: "星标", value: "0", detail: "原型仍在冷启动", tone: "amber" },
  { label: "问题", value: "0", detail: "还没有配置问题暴露", tone: "blue" },
  { label: "共建", value: "0", detail: "暂无外部共建", tone: "rose" },
  { label: "安装", value: "本机", detail: "本机可接 OpenToken 预览", tone: "green" }
];

function json(res, status, body) {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*"
  });
  res.end(JSON.stringify(body));
}

function formatCount(value) {
  if (!Number.isFinite(value)) return "0";
  if (value >= 100_000_000) return `${(value / 100_000_000).toFixed(2)}亿`;
  if (value >= 10_000) return `${(value / 10_000).toFixed(1)}万`;
  return String(Math.round(value));
}

function formatPercent(value) {
  return `${Math.round(Math.max(0, Math.min(1, value)) * 100)}%`;
}

function findOpenToken() {
  if (process.env.OPENTOKEN_BIN && fs.existsSync(process.env.OPENTOKEN_BIN)) {
    return process.env.OPENTOKEN_BIN;
  }

  const candidates = [
    path.join(home, ".local", "bin", "opentoken"),
    "/opt/homebrew/bin/opentoken",
    "/usr/local/bin/opentoken"
  ];

  return candidates.find((candidate) => {
    try {
      fs.accessSync(candidate, fs.constants.X_OK);
      return true;
    } catch {
      return false;
    }
  });
}

function runOpenToken() {
  const bin = findOpenToken();
  if (!bin) {
    return Promise.reject(new Error("opentoken binary not found"));
  }

  return new Promise((resolve, reject) => {
    execFile(bin, ["preview", "--json"], { timeout: 45_000 }, (error, stdout, stderr) => {
      if (error) {
        reject(new Error((stderr || error.message || "").trim()));
        return;
      }
      try {
        const rows = JSON.parse(stdout);
        resolve({ rows, bin });
      } catch (parseError) {
        reject(parseError);
      }
    });
  });
}

function groupByDate(rows) {
  const map = new Map();
  for (const row of rows) {
    const date = row.date || "";
    if (!date) continue;
    const current = map.get(date) || {
      date,
      normalized: 0,
      raw: 0,
      input: 0,
      output: 0,
      cache: 0,
      byTool: {}
    };
    const input = Number(row.input || 0);
    const output = Number(row.output || 0);
    const cache = Number(row.cache_read || 0) + Number(row.cache_write || 0);
    const normalized = Number(row.normalized ?? input + output);
    const raw = input + output + cache;
    current.normalized += normalized;
    current.raw += raw;
    current.input += input;
    current.output += output;
    current.cache += cache;
    current.byTool[row.tool || "unknown"] = (current.byTool[row.tool || "unknown"] || 0) + raw;
    map.set(date, current);
  }
  return [...map.values()].sort((a, b) => a.date.localeCompare(b.date));
}

function toolLabel(id) {
  const labels = {
    codex: "Codex",
    "claude-code": "Claude Code",
    gemini: "Gemini",
    opencode: "opencode",
    qwen: "Qwen",
    kimi: "Kimi",
    cline: "Cline",
    "roo-code": "Roo Code"
  };
  return labels[id] || id.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function toolIcon(id) {
  if (id === "codex") return "zap";
  if (id === "claude-code") return "bot";
  if (id === "gemini") return "sparkles";
  return "terminal";
}

function colorAt(index) {
  return ["#34d399", "#60a5fa", "#f59e0b", "#f472b6", "#cbd5e1"][index % 5];
}

function calculateStreak(days) {
  let streak = 0;
  for (let index = days.length - 1; index >= 0; index -= 1) {
    if (days[index].raw <= 0) break;
    streak += 1;
  }
  return streak;
}

function buildQuests(current, rankData, tools) {
  const dailyTarget = 300_000_000;
  const primary = tools[0];

  return [
    {
      title: current.raw >= dailyTarget ? "守住 3 亿线" : "冲刺 3 亿",
      detail: current.raw >= dailyTarget
        ? `已超过目标 ${formatCount(current.raw - dailyTarget)}`
        : `还差 ${formatCount(dailyTarget - current.raw)}榜单 Token`,
      reward: current.raw >= dailyTarget ? "已完成" : "+620 经验",
      done: current.raw >= dailyTarget,
      tone: "green"
    },
    {
      title: rankData?.rank === 1 ? "王座防守" : rankData?.rank ? "追上上一名" : "等待榜单匹配",
      detail: rankData?.rank === 1
        ? `领先 ${formatCount(rankData.lead || 0)}`
        : rankData?.rank
          ? `当前差距 ${formatCount(rankData.gap || 0)}`
          : "本地预览未匹配公开榜单",
      reward: rankData?.rank === 1 ? "已完成" : rankData?.rank ? "+800 经验" : "+0 经验",
      done: rankData?.rank === 1,
      tone: "blue"
    },
    {
      title: "主力工具稳定",
      detail: primary ? `${primary.label} 占比 ${formatPercent(primary.share)}` : "等待工具数据",
      reward: primary && primary.share >= 0.6 ? "已完成" : "+240 经验",
      done: Boolean(primary && primary.share >= 0.6),
      tone: "amber"
    }
  ];
}

function buildBadges(current, rankData, streak, tools) {
  const primary = tools[0];
  return [
    {
      title: "Codex 主力",
      detail: primary ? `${primary.label} ${formatPercent(primary.share)}` : "等待工具数据",
      unlocked: Boolean(primary && primary.share >= 0.6),
      icon: primary?.icon || "zap"
    },
    {
      title: "排名攀升",
      detail: rankData?.rank ? `当前 #${rankData.rank}` : "等待榜单匹配",
      unlocked: Boolean(rankData?.rank && rankData.rank <= 10),
      icon: "trending-up"
    },
    {
      title: "高产输出",
      detail: `${formatCount(current.raw)} / 3.00亿`,
      unlocked: current.raw >= 300_000_000,
      icon: "flame"
    },
    {
      title: "七日循环",
      detail: `${streak} 天连续`,
      unlocked: streak >= 7,
      icon: "calendar-check"
    }
  ];
}

function buildTools(current, rankData) {
  const byTool = rankData?.byTool || current.byTool || {};
  const entries = Object.entries(byTool).sort((a, b) => b[1] - a[1]);
  const total = Math.max(1, rankData?.score || current.raw);
  return entries.slice(0, 5).map(([id, score], index) => ({
    id,
    label: toolLabel(id),
    normalized: score,
    raw: score,
    share: score / total,
    color: colorAt(index),
    icon: toolIcon(id)
  }));
}

function requestJson(url) {
  return new Promise((resolve) => {
    const request = https.get(url, { headers: { accept: "application/json", "user-agent": "tokenpulse-island" } }, (response) => {
      const chunks = [];
      response.on("data", (chunk) => chunks.push(chunk));
      response.on("end", () => {
        try {
          resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")));
        } catch {
          resolve(null);
        }
      });
    });
    request.on("error", () => resolve(null));
    request.setTimeout(9000, () => {
      request.destroy();
      resolve(null);
    });
  });
}

async function loadRank(current) {
  const data = await requestJson("https://scys.com/tokenrank/api/subapp/leaderboard?board=total&range=today&limit=500");
  const entries = Array.isArray(data?.entries) ? data.entries : [];
  const configuredUserId = Number(process.env.TOKENPULSE_USER_ID || 0);
  const configuredUserName = (process.env.TOKENPULSE_USER_NAME || "").trim();
  const match =
    (configuredUserId ? entries.find((entry) => Number(entry.userId || 0) === configuredUserId) : null) ||
    (configuredUserName ? entries.find((entry) => entry.name === configuredUserName) : null) ||
    entries.find((entry) => Number(entry.score || 0) === Number(current.raw || 0));
  if (!match) return null;
  const index = entries.findIndex((entry) => entry === match);
  const previous = entries[index - 1] || null;
  const next = entries[index + 1] || null;
  return {
    rank: Number(match.rank || index + 1),
    score: Number(match.score || 0),
    name: match.name || "",
    byTool: match.byTool || null,
    gap: previous ? Math.max(0, Number(previous.score || 0) - Number(match.score || 0) + 1) : 0,
    lead: next ? Math.max(0, Number(match.score || 0) - Number(next.score || 0)) : 0
  };
}

async function githubSignals() {
  const repo = await requestJson("https://api.github.com/repos/ehomekevin/opentoken-island");
  if (!repo || typeof repo !== "object") return demoSignals;

  return [
    { label: "星标", value: String(repo.stargazers_count ?? 0), detail: "公开仓库关注", tone: "amber" },
    { label: "问题", value: String(repo.open_issues_count ?? 0), detail: "包含问题和拉取请求", tone: "blue" },
    { label: "复刻", value: String(repo.forks_count ?? 0), detail: "外部复制意愿", tone: "rose" },
    { label: "许可", value: repo.license?.spdx_id || "无", detail: "复用边界", tone: "green" }
  ];
}

async function buildSummary() {
  const { rows, bin } = await runOpenToken();
  const days = groupByDate(rows);
  if (!days.length) throw new Error("no preview rows");

  const current = days[days.length - 1];
  const rankData = await loadRank(current);
  const displayScore = rankData?.score || current.raw;
  const displayCurrent = { ...current, raw: displayScore };
  const tools = buildTools(current, rankData);
  const streak = calculateStreak(days);
  const levelSize = 25_000_000;
  const xp = displayScore % levelSize;
  const primary = tools[0];
  const history = days.slice(-7).map((day) => ({
    date: day.date,
    label: day.date === current.date ? "今天" : day.date.slice(5).replace("-", "/"),
    normalized: day.date === current.date ? displayScore : day.raw
  }));

  return {
    ok: true,
    mode: "local",
    generatedAt: new Date().toISOString(),
    date: current.date,
    sourceNote: rankData?.rank
      ? `已匹配生财榜单，本机预览 ${formatCount(current.raw)}`
      : `来自 ${path.basename(bin)} 预览，未匹配榜单`,
    normalized: current.normalized,
    raw: current.raw,
    input: current.input,
    output: current.output,
    cache: current.cache,
    totalLabel: formatCount(displayScore),
    rawLabel: formatCount(current.raw),
    rank: rankData?.rank || null,
    rankLabel: rankData?.rank ? `#${rankData.rank}` : "#--",
    gapLabel: rankData?.gap ? formatCount(rankData.gap) : "",
    leadLabel: rankData?.lead ? formatCount(rankData.lead) : "",
    rankDelta: 0,
    level: Math.max(1, Math.floor(displayScore / levelSize) + 1),
    levelTitle: `建造者等级 ${Math.max(1, Math.floor(displayScore / levelSize) + 1)}`,
    xp,
    xpMax: levelSize,
    xpPct: Math.max(4, Math.round((xp / levelSize) * 100)),
    streak,
    focusScore: Math.min(99, Math.round((current.output / Math.max(1, current.input + current.output)) * 160 + streak * 4)),
    primaryTool: primary?.label || "等待数据",
    primaryToolShareLabel: primary ? formatPercent(primary.share) : "0%",
    tools,
    quests: buildQuests(displayCurrent, rankData, tools),
    badges: buildBadges(displayCurrent, rankData, streak, tools),
    history,
    behaviorSignals: await githubSignals()
  };
}

function serveStatic(req, res, url) {
  const requested = url.pathname === "/" ? "/index.html" : decodeURIComponent(url.pathname);
  const filePath = path.normalize(path.join(dist, requested));
  if (!filePath.startsWith(dist)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      fs.readFile(path.join(dist, "index.html"), (indexError, indexData) => {
        if (indexError) {
          res.writeHead(404);
          res.end("Build not found. Run npm run build first.");
          return;
        }
        res.writeHead(200, { "content-type": mime[".html"] });
        res.end(indexData);
      });
      return;
    }
    res.writeHead(200, { "content-type": mime[path.extname(filePath)] || "application/octet-stream" });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET,OPTIONS",
      "access-control-allow-headers": "content-type"
    });
    res.end();
    return;
  }

  const url = new URL(req.url || "/", `http://${req.headers.host || "127.0.0.1"}`);
  if (url.pathname === "/api/health") {
    json(res, 200, { ok: true, opentoken: Boolean(findOpenToken()) });
    return;
  }
  if (url.pathname === "/api/summary") {
    try {
      json(res, 200, await buildSummary());
    } catch (error) {
      json(res, 503, { ok: false, error: error instanceof Error ? error.message : "summary unavailable" });
    }
    return;
  }
  serveStatic(req, res, url);
});

server.on("error", (error) => {
  console.error(`TokenPulse Island failed to listen on ${port}:`, error);
});

console.log(`TokenPulse Island starting with dist=${dist}`);
server.listen(port, "0.0.0.0", () => {
  console.log(`TokenPulse Island running at http://127.0.0.1:${port}`);
});
