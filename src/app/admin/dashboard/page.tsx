'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

// ---- Types ------------------------------------------------------------------

interface OverviewData {
  total_visitors: number;
  total_pageviews: number;
  visitors_today: number;
  visitors_week: number;
  avg_duration_seconds: number;
}

interface DailyVisitor {
  date: string;
  visitors: number;
  sessions: number;
}

interface TopPage {
  path: string;
  views: number;
  unique_views: number;
  avg_duration_seconds: number;
}

interface DeviceStat {
  device_type: string;
  count: number;
}

interface BrowserStat {
  browser_name: string;
  count: number;
}

interface OSStat {
  os_name: string;
  count: number;
}

interface CountryStat {
  country: string;
  city: string;
  count: number;
}

interface EventStat {
  component: string;
  event_type: string;
  count: number;
}

interface ProjectStat {
  element_id: string;
  project_name: string;
  clicks: number;
}

interface PhotoStat {
  element_id: string;
  caption: string;
  location: string;
  clicks: number;
}

interface RecentVisitor {
  session_id: string;
  ip_hash: string;
  country: string;
  city: string;
  device_type: string;
  browser: string;
  os: string;
  referrer: string;
  created_at: string;
  pageviews: number;
}

interface StatsData {
  overview: OverviewData;
  dailyVisitors: DailyVisitor[];
  topPages: TopPage[];
  devices: DeviceStat[];
  browsers: BrowserStat[];
  operatingSystems: OSStat[];
  countries: CountryStat[];
  topEvents: EventStat[];
  topProjects: ProjectStat[];
  topPhotos: PhotoStat[];
  recentVisitors: RecentVisitor[];
}

const EMPTY_STATS: StatsData = {
  overview: {
    total_visitors: 0,
    total_pageviews: 0,
    visitors_today: 0,
    visitors_week: 0,
    avg_duration_seconds: 0,
  },
  dailyVisitors: [],
  topPages: [],
  devices: [],
  browsers: [],
  operatingSystems: [],
  countries: [],
  topEvents: [],
  topProjects: [],
  topPhotos: [],
  recentVisitors: [],
};

// ---- Color Palette ----------------------------------------------------------

const COLORS = ['#7c3aed', '#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#84cc16'];
const DEVICE_COLORS: Record<string, string> = {
  desktop: '#7c3aed',
  mobile: '#06b6d4',
  tablet: '#10b981',
};

// ---- Helpers ----------------------------------------------------------------

function formatDuration(seconds: number): string {
  if (!seconds) return '0s';
  if (seconds < 60) return `${Math.round(seconds)}s`;
  return `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatPath(path: string): string {
  if (path === '/') return 'Home';
  return path.replace(/^\/[a-z]{2}\//, '/').replace(/^\/(ja|en|vi)$/, 'Home') || path;
}

function getDeviceIcon(device: string): string {
  if (device === 'mobile') return '📱';
  if (device === 'tablet') return '📱';
  return '🖥️';
}

function getCountryFlag(code: string): string {
  if (!code || code === 'XX' || code === 'LO') return '🌐';
  const codePoints = [...code.toUpperCase()].map(c => 0x1F1E0 + c.charCodeAt(0) - 65);
  return String.fromCodePoint(...codePoints);
}

// ---- Sub-components ---------------------------------------------------------

function StatCard({
  label,
  value,
  icon,
  sub,
  color = 'purple',
}: {
  label: string;
  value: string | number;
  icon: string;
  sub?: string;
  color?: 'purple' | 'cyan' | 'green' | 'amber';
}) {
  const colorMap = {
    purple: 'from-purple-600/20 to-purple-800/10 border-purple-500/20',
    cyan: 'from-cyan-600/20 to-cyan-800/10 border-cyan-500/20',
    green: 'from-green-600/20 to-green-800/10 border-green-500/20',
    amber: 'from-amber-600/20 to-amber-800/10 border-amber-500/20',
  };
  return (
    <div className={`rounded-2xl border bg-linear-to-br p-5 ${colorMap[color]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{label}</p>
          <p className="text-3xl font-bold text-white mt-1">{value}</p>
          {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 p-5 bg-white/5">
      <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">{title}</h3>
      {children}
    </div>
  );
}

// ---- Main Dashboard ---------------------------------------------------------

export default function AdminDashboard() {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState(30);
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'visitors'>('overview');
  const router = useRouter();

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/analytics/stats?range=${range}`);
      if (res.status === 401) {
        router.push('/admin');
        return;
      }
      if (!res.ok) {
        setData(EMPTY_STATS);
        return;
      }
      const json = await res.json();
      setData({
        overview: json.overview ?? EMPTY_STATS.overview,
        dailyVisitors: Array.isArray(json.dailyVisitors) ? json.dailyVisitors : EMPTY_STATS.dailyVisitors,
        topPages: Array.isArray(json.topPages) ? json.topPages : EMPTY_STATS.topPages,
        devices: Array.isArray(json.devices) ? json.devices : EMPTY_STATS.devices,
        browsers: Array.isArray(json.browsers) ? json.browsers : EMPTY_STATS.browsers,
        operatingSystems: Array.isArray(json.operatingSystems) ? json.operatingSystems : EMPTY_STATS.operatingSystems,
        countries: Array.isArray(json.countries) ? json.countries : EMPTY_STATS.countries,
        topEvents: Array.isArray(json.topEvents) ? json.topEvents : EMPTY_STATS.topEvents,
        topProjects: Array.isArray(json.topProjects) ? json.topProjects : EMPTY_STATS.topProjects,
        topPhotos: Array.isArray(json.topPhotos) ? json.topPhotos : EMPTY_STATS.topPhotos,
        recentVisitors: Array.isArray(json.recentVisitors) ? json.recentVisitors : EMPTY_STATS.recentVisitors,
      });
    } catch (e) {
      console.error(e);
      setData(EMPTY_STATS);
    } finally {
      setLoading(false);
    }
  }, [range, router]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin');
  };

  // ---- Render ----------------------------------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a12] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg className="w-8 h-8 text-purple-400 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-gray-400 text-sm">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { overview, dailyVisitors, topPages, devices, browsers, operatingSystems, countries, topEvents, topProjects, topPhotos, recentVisitors } = data;

  const totalDeviceCount = devices.reduce((s, d) => s + Number(d.count), 0);

  return (
    <div className="min-h-screen text-white" style={{ background: '#0a0a12' }}>
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a12]/80 backdrop-blur-xl px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-600/30 border border-purple-500/30 flex items-center justify-center">
              <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h1 className="font-bold text-white">Analytics</h1>
            <span className="text-xs text-gray-500 hidden sm:block">Portfolio Dashboard</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Date Range */}
            <select
              id="date-range-select"
              value={range}
              onChange={(e) => setRange(Number(e.target.value))}
              className="text-sm bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-gray-300
                focus:outline-none focus:border-purple-500/60 cursor-pointer"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
              <option value={365}>Last year</option>
            </select>

            <button
              id="dashboard-refresh-btn"
              onClick={fetchStats}
              className="text-sm bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-gray-300
                hover:bg-white/10 transition-colors"
            >
              ↻ Refresh
            </button>

            <button
              id="admin-logout-btn"
              onClick={handleLogout}
              className="text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-1.5 text-red-400
                hover:bg-red-500/20 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* Overview Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Visitors" value={Number(overview?.total_visitors || 0).toLocaleString()} icon="👥" color="purple" />
          <StatCard label="Today" value={Number(overview?.visitors_today || 0).toLocaleString()} icon="📅" sub="unique visitors" color="cyan" />
          <StatCard label="This Week" value={Number(overview?.visitors_week || 0).toLocaleString()} icon="📈" sub="unique visitors" color="green" />
          <StatCard label="Avg. Duration" value={formatDuration(Number(overview?.avg_duration_seconds || 0))} icon="⏱️" sub="per pageview" color="amber" />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-white/10">
          {(['overview', 'events', 'visitors'] as const).map((tab) => (
            <button
              key={tab}
              id={`tab-${tab}`}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors capitalize
                ${activeTab === tab
                  ? 'text-purple-400 border-b-2 border-purple-500'
                  : 'text-gray-500 hover:text-gray-300'
                }`}
            >
              {tab === 'overview' ? '📊 Overview' : tab === 'events' ? '🖱️ Events' : '👤 Visitors'}
            </button>
          ))}
        </div>

        {/* ---- OVERVIEW TAB ---- */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Daily Visitors Chart */}
            <SectionCard title="Daily Visitors">
              {dailyVisitors.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={dailyVisitors.map(d => ({ ...d, date: formatDate(d.date) }))}>
                    <defs>
                      <linearGradient id="visitorGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                      labelStyle={{ color: '#e5e7eb' }}
                      itemStyle={{ color: '#a78bfa' }}
                    />
                    <Area type="monotone" dataKey="visitors" stroke="#7c3aed" fill="url(#visitorGrad)" strokeWidth={2} name="Visitors" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[220px] flex items-center justify-center text-gray-600">No data yet</div>
              )}
            </SectionCard>

            {/* Devices + Browsers row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Device Pie */}
              <SectionCard title="Devices">
                {devices.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie data={devices} cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                          dataKey="count" nameKey="device_type">
                          {devices.map((d, i) => (
                            <Cell key={i} fill={DEVICE_COLORS[d.device_type] || COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-col gap-1.5 mt-2">
                      {devices.map((d, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <span>{getDeviceIcon(d.device_type)}</span>
                            <span className="text-gray-300 capitalize">{d.device_type}</span>
                          </div>
                          <span className="text-gray-400">
                            {Math.round((Number(d.count) / totalDeviceCount) * 100)}%
                            <span className="text-gray-600 ml-1">({d.count})</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : <div className="h-[180px] flex items-center justify-center text-gray-600">No data</div>}
              </SectionCard>

              {/* Browsers */}
              <SectionCard title="Browsers">
                {browsers.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={browsers} layout="vertical" margin={{ left: 0, right: 16 }}>
                      <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis dataKey="browser_name" type="category" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} width={72} />
                      <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                      <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} name="Sessions" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <div className="h-[220px] flex items-center justify-center text-gray-600">No data</div>}
              </SectionCard>

              {/* OS */}
              <SectionCard title="Operating Systems">
                {operatingSystems.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={operatingSystems} layout="vertical" margin={{ left: 0, right: 16 }}>
                      <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis dataKey="os_name" type="category" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} width={72} />
                      <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                      <Bar dataKey="count" fill="#06b6d4" radius={[0, 4, 4, 0]} name="Sessions" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <div className="h-[220px] flex items-center justify-center text-gray-600">No data</div>}
              </SectionCard>
            </div>

            {/* Top Pages + Countries */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SectionCard title="Top Pages">
                <div className="space-y-2">
                  {topPages.length > 0 ? topPages.map((p, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-white truncate">{formatPath(p.path)}</p>
                        <p className="text-xs text-gray-500">{p.unique_views} unique · {formatDuration(Number(p.avg_duration_seconds))} avg</p>
                      </div>
                      <span className="text-sm font-medium text-purple-400 ml-4">{p.views}</span>
                    </div>
                  )) : <p className="text-gray-600 text-sm">No pageviews yet</p>}
                </div>
              </SectionCard>

              <SectionCard title="Top Locations">
                <div className="space-y-2">
                  {countries.length > 0 ? countries.map((c, i) => (
                    <div key={i} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getCountryFlag(c.country)}</span>
                        <div>
                          <span className="text-sm text-white">{c.city || 'Unknown'}</span>
                          <span className="text-xs text-gray-500 ml-1">{c.country}</span>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-cyan-400">{c.count}</span>
                    </div>
                  )) : <p className="text-gray-600 text-sm">No location data yet</p>}
                </div>
              </SectionCard>
            </div>
          </div>
        )}

        {/* ---- EVENTS TAB ---- */}
        {activeTab === 'events' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Projects Clicked */}
              <SectionCard title="🗂️ Projects Clicked">
                {topProjects.length > 0 ? (
                  <div className="space-y-2">
                    {topProjects.map((p, i) => (
                      <div key={i} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                        <span className="text-xs text-gray-600 w-4 text-right">#{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white truncate">{p.project_name || p.element_id}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-bold text-purple-400">{p.clicks}</span>
                          <span className="text-xs text-gray-600">clicks</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-gray-600 text-sm py-4 text-center">No project clicks yet</p>}
              </SectionCard>

              {/* Top Photos Clicked */}
              <SectionCard title="📸 Photos Clicked">
                {topPhotos.length > 0 ? (
                  <div className="space-y-2">
                    {topPhotos.map((p, i) => (
                      <div key={i} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                        <span className="text-xs text-gray-600 w-4 text-right">#{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white truncate">{p.caption || p.element_id}</p>
                          {p.location && <p className="text-xs text-gray-500">📍 {p.location}</p>}
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-bold text-cyan-400">{p.clicks}</span>
                          <span className="text-xs text-gray-600">clicks</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-gray-600 text-sm py-4 text-center">No photo clicks yet</p>}
              </SectionCard>
            </div>

            {/* All Event Components */}
            <SectionCard title="All Click Events by Component">
              {topEvents.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={topEvents} margin={{ left: 0, right: 16 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="component" tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                      <Bar dataKey="count" name="Clicks" radius={[4, 4, 0, 0]}>
                        {topEvents.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">
                    {topEvents.map((e, i) => (
                      <div key={i} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
                        <span className="text-xs text-gray-400 truncate">{e.component}</span>
                        <span className="text-sm font-bold ml-2" style={{ color: COLORS[i % COLORS.length] }}>{e.count}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : <p className="text-gray-600 text-sm py-4 text-center">No click events yet</p>}
            </SectionCard>
          </div>
        )}

        {/* ---- VISITORS TAB ---- */}
        {activeTab === 'visitors' && (
          <SectionCard title={`Recent Visitors (last ${range} days)`}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left">
                    {['Time', 'Location', 'Device', 'Browser / OS', 'Referrer', 'Pages'].map((h) => (
                      <th key={h} className="pb-3 pr-4 text-xs text-gray-500 font-medium uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentVisitors.length > 0 ? recentVisitors.map((v, i) => (
                    <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                      <td className="py-2.5 pr-4 text-gray-400 whitespace-nowrap text-xs">
                        {new Date(v.created_at).toLocaleString('en-US', {
                          month: 'short', day: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </td>
                      <td className="py-2.5 pr-4 whitespace-nowrap">
                        <span className="mr-1">{getCountryFlag(v.country)}</span>
                        <span className="text-gray-300">{v.city || 'Unknown'}</span>
                        <span className="text-gray-600 ml-1 text-xs">{v.country}</span>
                      </td>
                      <td className="py-2.5 pr-4">
                        <span className="capitalize text-gray-300">{getDeviceIcon(v.device_type)} {v.device_type}</span>
                      </td>
                      <td className="py-2.5 pr-4 text-gray-400 text-xs">
                        <p>{v.browser}</p>
                        <p className="text-gray-600">{v.os}</p>
                      </td>
                      <td className="py-2.5 pr-4 text-gray-500 text-xs max-w-[140px] truncate">
                        {v.referrer || <span className="text-gray-700">direct</span>}
                      </td>
                      <td className="py-2.5 text-center">
                        <span className="text-purple-400 font-medium">{v.pageviews}</span>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-600">No visitors yet</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </SectionCard>
        )}
      </main>
    </div>
  );
}
