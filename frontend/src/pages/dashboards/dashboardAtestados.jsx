"use client"

import React, { useContext, useEffect, useMemo, useRef, useState } from "react"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LabelList,
  Legend,
  LineChart,
  Line,
} from "recharts"
import api from "../../services/api"
import Sidebar from "../../components/Sidebar"
import Header from "../../components/Header"
import { ThemeContext } from "../../context/ThemeContext"

/* ─── THEME ────────────────────────────────────────────────────────── */
const THEME = {
  dark:  { bg: "#080808", card: "#111111", cardHover: "#161616", border: "rgba(255,255,255,0.07)", borderCard: "rgba(255,255,255,0.06)", textMain: "#F0F0F0", textMuted: "rgba(255,255,255,0.45)", textSubtle: "rgba(255,255,255,0.22)", sectionText: "rgba(255,255,255,0.20)" },
  light: { bg: "#F3F4F6", card: "#FFFFFF", cardHover: "#F9FAFB", border: "#E5E7EB",              borderCard: "#E5E7EB",              textMain: "#111827", textMuted: "#6B7280",              textSubtle: "#9CA3AF",              sectionText: "#9CA3AF" },
}

/* ─── TOKENS ─────────────────────────────────────────────────────── */
const BRAND = "#FA4C00"
const CHART_COLORS = ["#FA4C00","#3B82F6","#F59E0B","#22C55E","#A855F7","#EC4899","#14B8A6"]

/* ─── UTILS ──────────────────────────────────────────────────────── */
function isoToday() { return new Date().toISOString().slice(0, 10) }
function isoFirstDayOfMonth() {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10)
}

const CID_DESCRICOES = {
  A09: "Sintomas Gripais", J11: "Sintomas Gripais", J069: "Sintomas Gripais",
  B349: "Sintomas Gripais", H920: "Sintomas Gripais",
  M545: "Dor lombar (lombalgia)", M796: "Dor em membros",
  R11: "Náuseas e vômitos", R52: "Dor não especificada", R520: "Dor aguda",
}

// Mapa invertido: sintoma → [códigos CID]
const SINTOMA_CIDS = Object.entries(CID_DESCRICOES).reduce((acc, [codigo, sintoma]) => {
  if (!acc[sintoma]) acc[sintoma] = []
  acc[sintoma].push(codigo)
  return acc
}, {})

/* ─── SKELETON ───────────────────────────────────────────────────── */
function Skeleton({ style = {} }) {
  const { isDark } = useContext(ThemeContext)
  return (
    <div style={{ background: isDark ? "rgba(255,255,255,0.05)" : "#E5E7EB", borderRadius: 10, animation: "pulse 1.5s ease-in-out infinite", ...style }} />
  )
}

/* ─── SVG ICONS ──────────────────────────────────────────────────── */
const IconDoc      = ({ c = "currentColor", s = 18 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="12" y1="18" x2="12" y2="12" /><line x1="9" y1="15" x2="15" y2="15" /></svg>
const IconRepeat   = ({ c = "currentColor", s = 18 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 1l4 4-4 4" /><path d="M3 11V9a4 4 0 014-4h14" /><path d="M7 23l-4-4 4-4" /><path d="M21 13v2a4 4 0 01-4 4H3" /></svg>
const IconUsers    = ({ c = "currentColor", s = 18 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg>
const IconPercent  = ({ c = "currentColor", s = 18 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="5" x2="5" y2="19" /><circle cx="6.5" cy="6.5" r="2.5" /><circle cx="17.5" cy="17.5" r="2.5" /></svg>
const IconCalDay   = ({ c = "currentColor", s = 18 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18M12 14h.01" /></svg>
const IconCalWeek  = ({ c = "currentColor", s = 18 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18M8 14h8" /></svg>
const IconCalMonth = ({ c = "currentColor", s = 18 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18M8 14h2M14 14h2M8 18h2M14 18h2" /></svg>
const IconAlert    = ({ c = "currentColor", s = 18 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
const IconChevronDown = ({ c = "currentColor", s = 14 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>

/* ─── KPI CONFIG ─────────────────────────────────────────────────── */
const KPI_META = {
  "Atestados":   { Icon: IconDoc,      color: "#FA4C00", desc: "Total no período" },
  "Recorrência": { Icon: IconRepeat,   color: "#F59E0B", desc: "Atestaram 2+ vezes" },
  "Impactados":  { Icon: IconUsers,    color: "#3B82F6", desc: "Colaboradores únicos" },
  "% HC":        { Icon: IconPercent,  color: "#A855F7", desc: "Headcount afetado" },
  "Hoje":        { Icon: IconCalDay,   color: "#EF4444", desc: "Atestados hoje" },
  "Semana":      { Icon: IconCalWeek,  color: "#F59E0B", desc: "Esta semana" },
  "Mês":         { Icon: IconCalMonth, color: "#22C55E", desc: "Este mês" },
}

/* ─── KPI CARD ───────────────────────────────────────────────────── */
function KpiCard({ label, value, loading }) {
  const { isDark } = useContext(ThemeContext)
  const T = THEME[isDark ? "dark" : "light"]
  const { Icon = IconDoc, color = BRAND, desc = "" } = KPI_META[label] || {}
  return (
    <div
      style={{ background: T.card, border: `1px solid ${T.border}`, borderLeft: `3px solid ${color}`, borderRadius: 12, padding: "16px 18px", display: "flex", flexDirection: "column", gap: 8, cursor: "default", transition: "background 0.2s" }}
      onMouseEnter={(e) => (e.currentTarget.style.background = T.cardHover)}
      onMouseLeave={(e) => (e.currentTarget.style.background = T.card)}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <Icon c={color} s={13} />
        <p style={{ fontSize: 11, color: T.textMuted, fontWeight: 500, margin: 0 }}>{label}</p>
      </div>
      {loading ? <Skeleton style={{ height: 28, width: "55%" }} /> : (
        <p style={{ fontSize: 26, fontWeight: 700, color: T.textMain, margin: 0, lineHeight: 1, letterSpacing: "-0.02em" }}>{value ?? "—"}</p>
      )}
      <p style={{ fontSize: 10, color: T.textSubtle, margin: 0 }}>{desc}</p>
    </div>
  )
}

/* ─── SECTION LABEL ──────────────────────────────────────────────── */
function SectionLabel({ num, title }) {
  const { isDark } = useContext(ThemeContext)
  const T = THEME[isDark ? "dark" : "light"]
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
      <span style={{ fontSize: 10, fontWeight: 800, color: BRAND, textTransform: "uppercase", letterSpacing: "0.16em" }}>{num}</span>
      <span style={{ fontSize: 10, color: T.sectionText, textTransform: "uppercase", letterSpacing: "0.16em" }}>{title}</span>
    </div>
  )
}

/* ─── CARD ───────────────────────────────────────────────────────── */
function Card({ title, subtitle, icon, children, style = {} }) {
  const { isDark } = useContext(ThemeContext)
  const T = THEME[isDark ? "dark" : "light"]
  return (
    <div style={{ background: T.card, border: `1px solid ${T.borderCard}`, borderRadius: 18, padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16, minWidth: 0, width: "100%", boxSizing: "border-box", ...style }}>
      {title && (
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
          {icon && (
            <div style={{ width: 30, height: 30, borderRadius: 9, background: `${BRAND}14`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
              {icon}
            </div>
          )}
          <div>
            <h2 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: T.textMain }}>{title}</h2>
            {subtitle && <p style={{ margin: "3px 0 0", fontSize: 11, color: T.textMuted }}>{subtitle}</p>}
          </div>
        </div>
      )}
      {children}
    </div>
  )
}

/* ─── DATE INPUT ─────────────────────────────────────────────────── */
function DateInput({ label, value, onChange }) {
  const { isDark } = useContext(ThemeContext)
  const T = THEME[isDark ? "dark" : "light"]
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 10, color: T.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em" }}>{label}</label>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ background: T.card, border: `1px solid ${T.border}`, color: T.textMain, fontSize: 13, borderRadius: 12, padding: "9px 14px", outline: "none", cursor: "pointer", colorScheme: isDark ? "dark" : "light" }}
      />
    </div>
  )
}

/* ─── SELECT EMPRESA ─────────────────────────────────────────────── */
function SelectEmpresa({ value, onChange, options }) {
  const { isDark } = useContext(ThemeContext)
  const T = THEME[isDark ? "dark" : "light"]
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const selected = options.find((e) => String(e.idEmpresa) === String(value))
  useEffect(() => {
    function handleClickOutside(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])
  return (
    <div ref={ref} style={{ display: "flex", flexDirection: "column", gap: 5, position: "relative" }}>
      <label style={{ fontSize: 10, color: T.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em" }}>Empresa</label>
      <div
        onClick={() => setOpen(!open)}
        style={{ background: T.card, border: `1px solid ${open ? "rgba(250,76,0,0.5)" : T.border}`, color: T.textMain, fontSize: 13, borderRadius: 12, padding: "9px 14px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, minWidth: 180, userSelect: "none", transition: "border-color 0.2s" }}
      >
        <span style={{ color: selected ? T.textMain : T.textSubtle, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 160 }}>
          {selected ? selected.razaoSocial : "Todas as empresas"}
        </span>
        <IconChevronDown c={T.textSubtle} />
      </div>
      {open && (
        <div className="hide-scrollbar" style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, zIndex: 9999, background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, maxHeight: 240, overflowY: "auto", boxShadow: "0 16px 40px rgba(0,0,0,0.15)", minWidth: "100%" }}>
          <div
            onClick={() => { onChange(""); setOpen(false) }}
            style={{ padding: "10px 14px", fontSize: 13, cursor: "pointer", color: !value ? BRAND : T.textMuted, fontWeight: !value ? 600 : 400, borderBottom: `1px solid ${T.border}` }}
            onMouseEnter={(e) => (e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.05)" : "#F3F4F6")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            Todas as empresas
          </div>
          {options.map((e) => (
            <div
              key={e.idEmpresa}
              onClick={() => { onChange(String(e.idEmpresa)); setOpen(false) }}
              style={{ padding: "10px 14px", fontSize: 13, cursor: "pointer", color: String(value) === String(e.idEmpresa) ? BRAND : T.textMuted, fontWeight: String(value) === String(e.idEmpresa) ? 600 : 400 }}
              onMouseEnter={(e2) => (e2.currentTarget.style.background = "rgba(250,76,0,0.08)")}
              onMouseLeave={(e2) => (e2.currentTarget.style.background = "transparent")}
            >
              {e.razaoSocial}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── SELECT CID ─────────────────────────────────────────────────── */
function SelectCID({ value, onChange, options }) {
  const { isDark } = useContext(ThemeContext)
  const T = THEME[isDark ? "dark" : "light"]
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const selected = options.find((c) => c.codigo === value)
  useEffect(() => {
    function handleClickOutside(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])
  return (
    <div ref={ref} style={{ display: "flex", flexDirection: "column", gap: 5, position: "relative" }}>
      <label style={{ fontSize: 10, color: T.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em" }}>CID</label>
      <div
        onClick={() => setOpen(!open)}
        style={{ background: T.card, border: `1px solid ${open ? "rgba(250,76,0,0.5)" : T.border}`, color: T.textMain, fontSize: 13, borderRadius: 12, padding: "9px 14px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, minWidth: 160, userSelect: "none", transition: "border-color 0.2s" }}
      >
        <span style={{ color: selected ? T.textMain : T.textSubtle }}>
          {selected ? `${selected.codigo} (${selected.total})` : "Todos os CIDs"}
        </span>
        <IconChevronDown c={T.textSubtle} />
      </div>
      {open && (
        <div className="hide-scrollbar" style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, zIndex: 9999, background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, maxHeight: 240, overflowY: "auto", boxShadow: "0 16px 40px rgba(0,0,0,0.15)", minWidth: "100%" }}>
          <div
            onClick={() => { onChange(""); setOpen(false) }}
            style={{ padding: "10px 14px", fontSize: 13, cursor: "pointer", color: !value ? BRAND : T.textMuted, fontWeight: !value ? 600 : 400, borderBottom: `1px solid ${T.border}` }}
            onMouseEnter={(e) => (e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.05)" : "#F3F4F6")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            Todos os CIDs
          </div>
          {options.map((c) => (
            <div
              key={c.codigo}
              onClick={() => { onChange(c.codigo); setOpen(false) }}
              style={{ padding: "10px 14px", fontSize: 13, cursor: "pointer", color: value === c.codigo ? BRAND : T.textMuted, fontWeight: value === c.codigo ? 600 : 400 }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(250,76,0,0.08)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              {c.codigo} — {CID_DESCRICOES[c.codigo] || "CID"}{" "}
              <span style={{ color: T.textSubtle }}>({c.total})</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── SELECT SINTOMA ─────────────────────────────────────────────── */
function SelectSintoma({ value, onChange }) {
  const { isDark } = useContext(ThemeContext)
  const T = THEME[isDark ? "dark" : "light"]
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const sintomas = Object.keys(SINTOMA_CIDS)
  useEffect(() => {
    function handleClickOutside(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])
  return (
    <div ref={ref} style={{ display: "flex", flexDirection: "column", gap: 5, position: "relative" }}>
      <label style={{ fontSize: 10, color: T.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em" }}>Sintoma</label>
      <div
        onClick={() => setOpen(!open)}
        style={{ background: T.card, border: `1px solid ${open ? "rgba(250,76,0,0.5)" : value ? "rgba(250,76,0,0.35)" : T.border}`, color: T.textMain, fontSize: 13, borderRadius: 12, padding: "9px 14px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, minWidth: 180, userSelect: "none", transition: "border-color 0.2s" }}
      >
        <span style={{ color: value ? T.textMain : T.textSubtle, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 160 }}>
          {value || "Todos os sintomas"}
        </span>
        <IconChevronDown c={T.textSubtle} />
      </div>
      {open && (
        <div className="hide-scrollbar" style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, zIndex: 9999, background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, maxHeight: 240, overflowY: "auto", boxShadow: "0 16px 40px rgba(0,0,0,0.15)", minWidth: "100%" }}>
          <div
            onClick={() => { onChange(""); setOpen(false) }}
            style={{ padding: "10px 14px", fontSize: 13, cursor: "pointer", color: !value ? BRAND : T.textMuted, fontWeight: !value ? 600 : 400, borderBottom: `1px solid ${T.border}` }}
            onMouseEnter={(e) => (e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.05)" : "#F3F4F6")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            Todos os sintomas
          </div>
          {sintomas.map((s) => (
            <div
              key={s}
              onClick={() => { onChange(s); setOpen(false) }}
              style={{ padding: "10px 14px", fontSize: 13, cursor: "pointer", color: value === s ? BRAND : T.textMuted, fontWeight: value === s ? 600 : 400 }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(250,76,0,0.08)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <span>{s}</span>
              <span style={{ marginLeft: 8, fontSize: 11, color: T.textSubtle }}>
                ({SINTOMA_CIDS[s].join(", ")})
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── BAR BLOCK ──────────────────────────────────────────────────── */
function BarBlock({ data }) {
  const { isDark } = useContext(ThemeContext)
  const T = THEME[isDark ? "dark" : "light"]
  const safeData = Array.isArray(data) ? data : []
  if (!safeData.length) return <p style={{ fontSize: 13, color: T.textMuted }}>Sem dados no período.</p>
  const tickColor = isDark ? "#BFBFC3" : "#6B7280"
  const ttBg = isDark ? "#232323" : "#FFFFFF"
  const ttBorder = isDark ? "rgba(255,255,255,0.1)" : "#E5E7EB"
  const labelColor = isDark ? "#FFF" : "#111827"
  const gridColor = isDark ? "rgba(255,255,255,0.08)" : "#E5E7EB"
  return (
    <div className="h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={safeData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid stroke={gridColor} />
          <XAxis dataKey="name" tick={{ fill: tickColor, fontSize: 12 }} />
          <YAxis allowDecimals={false} tick={{ fill: tickColor, fontSize: 12 }} />
          <Tooltip contentStyle={{ background: ttBg, border: `1px solid ${ttBorder}`, borderRadius: 8, color: T.textMain }} />
          <Bar dataKey="value" fill={BRAND}>
            <LabelList dataKey="value" position="top" style={{ fill: labelColor, fontSize: 12, fontWeight: 600 }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

/* ─── BAR BLOCK HORIZONTAL ───────────────────────────────────────── */
function BarBlockHorizontal({ data }) {
  const { isDark } = useContext(ThemeContext)
  const T = THEME[isDark ? "dark" : "light"]
  const safeData = Array.isArray(data) ? data : []
  if (!safeData.length) return <p style={{ fontSize: 13, color: T.textMuted }}>Sem dados no período.</p>
  const tickColor = isDark ? "#BFBFC3" : "#6B7280"
  const ttBg = isDark ? "#232323" : "#FFFFFF"
  const ttBorder = isDark ? "rgba(255,255,255,0.1)" : "#E5E7EB"
  const labelColor = isDark ? "#FFF" : "#111827"
  const gridColor = isDark ? "rgba(255,255,255,0.08)" : "#E5E7EB"
  const formatName = (name) => {
    const parts = String(name || "").trim().split(" ")
    return parts.length >= 2 ? `${parts[0]} ${parts[1]}` : name
  }
  const formatted = safeData.map((d) => ({ ...d, name: formatName(d.name) }))
  return (
    <div className="h-[280px] sm:h-80 lg:h-[360px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={formatted} layout="vertical" margin={{ left: 20, right: 20 }}>
          <CartesianGrid stroke={gridColor} />
          <XAxis type="number" allowDecimals={false} domain={[0, "dataMax + 2"]} tick={{ fill: tickColor, fontSize: 12 }} />
          <YAxis type="category" dataKey="name" width={140} tick={{ fill: tickColor, fontSize: 11 }} />
          <Tooltip contentStyle={{ background: ttBg, border: `1px solid ${ttBorder}`, borderRadius: 8, color: T.textMain }} />
          <Bar dataKey="value" fill={BRAND}>
            <LabelList dataKey="value" position="right" style={{ fill: labelColor, fontSize: 12, fontWeight: 600 }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

/* ─── BAR BLOCK HORIZONTAL CID ───────────────────────────────────── */
function BarBlockHorizontalCID({ data }) {
  const { isDark } = useContext(ThemeContext)
  const T = THEME[isDark ? "dark" : "light"]
  const safeData = Array.isArray(data) ? data : []
  if (!safeData.length) return <p style={{ fontSize: 13, color: T.textMuted }}>Sem dados no período.</p>
  const tickColor  = isDark ? "#BFBFC3" : "#6B7280"
  const ttBg       = isDark ? "#232323" : "#FFFFFF"
  const ttBorder   = isDark ? "rgba(255,255,255,0.1)" : "#E5E7EB"
  const labelColor = isDark ? "#FFF" : "#111827"
  const gridColor  = isDark ? "rgba(255,255,255,0.06)" : "#E5E7EB"
  const height = Math.max(260, safeData.length * 34)
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={safeData} layout="vertical" barSize={18} barCategoryGap="18%" margin={{ top: 5, right: 28, left: 10, bottom: 5 }}>
          <CartesianGrid stroke={gridColor} />
          <XAxis type="number" allowDecimals={false} domain={[0, (dataMax) => dataMax + 0.3]} tick={{ fill: tickColor, fontSize: 12 }} />
          <YAxis type="category" dataKey="name" width={120} tick={{ fill: tickColor, fontSize: 12 }} />
          <Tooltip
            formatter={(value, _, props) => [`${value} atestados`, props.payload.full || props.payload.name]}
            contentStyle={{ background: ttBg, border: `1px solid ${ttBorder}`, borderRadius: 8, color: T.textMain }}
          />
          <Bar dataKey="value" fill={BRAND} radius={[0, 6, 6, 0]}>
            <LabelList dataKey="value" position="right" style={{ fill: labelColor, fontSize: 12, fontWeight: 600 }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

/* ─── PIE BLOCK ──────────────────────────────────────────────────── */
function PieBlock({ data }) {
  const { isDark } = useContext(ThemeContext)
  const T = THEME[isDark ? "dark" : "light"]
  const safeData = Array.isArray(data) ? data : []
  if (!safeData.length) return <p style={{ fontSize: 13, color: T.textMuted }}>Sem dados no período.</p>
  const ttBg     = isDark ? "#232323" : "#FFFFFF"
  const ttBorder = isDark ? "rgba(255,255,255,0.1)" : "#E5E7EB"
  return (
    <div className="h-[220px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={safeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            labelLine={false}>
            {safeData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
          </Pie>
          <Tooltip contentStyle={{ background: ttBg, border: `1px solid ${ttBorder}`, borderRadius: 8, color: T.textMain }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

/* ─── TOP OFENSORES TABLE ────────────────────────────────────────── */
function TopOfensoresTable({ rows, loading }) {
  const { isDark } = useContext(ThemeContext)
  const T = THEME[isDark ? "dark" : "light"]
  if (loading) return <p style={{ fontSize: 13, color: T.textMuted }}>Carregando…</p>
  if (!rows?.length) return <p style={{ fontSize: 13, color: T.textMuted }}>Sem ofensores no período.</p>
  return (
    <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
      <table className="w-full text-sm" style={{ minWidth: 480, borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${T.border}` }}>
            {["#","Colaborador","Empresa","Setor","Turno","Tempo","Atst.","Dias"].map((h, i) => (
              <th key={h} style={{ textAlign: i >= 6 ? "right" : "left", padding: "8px 8px 8px 0", fontSize: 11, color: T.textMuted, fontWeight: 600 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.opsId} style={{ borderBottom: `1px solid ${T.border}` }}>
              <td style={{ padding: "8px 8px 8px 0", fontSize: 12, color: T.textSubtle }}>{r.rank}</td>
              <td style={{ padding: "8px 8px 8px 0", fontWeight: 500, color: T.textMain, maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={r.nome}>{r.nome}</td>
              <td style={{ padding: "8px 8px 8px 0", fontSize: 12, color: T.textMuted, maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={r.empresa}>{r.empresa || "N/I"}</td>
              <td style={{ padding: "8px 8px 8px 0", fontSize: 12, color: T.textMuted, maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={r.setor}>{r.setor || "N/I"}</td>
              <td style={{ padding: "8px 8px 8px 0", fontSize: 12, color: T.textMuted, whiteSpace: "nowrap" }}>{r.turno || "N/I"}</td>
              <td style={{ padding: "8px 8px 8px 0" }}>
                <span style={{
                  padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600,
                  background: ["0 a 7","8 a 15","16 a 30"].includes(r.tempoCasaFaixa) ? "#FF453A22" : r.tempoCasaFaixa === "31 a 89" ? "#FF9F0A22" : "#34C75922",
                  color:       ["0 a 7","8 a 15","16 a 30"].includes(r.tempoCasaFaixa) ? "#FF453A"   : r.tempoCasaFaixa === "31 a 89" ? "#FF9F0A"   : "#34C759",
                }}>
                  {r.tempoCasaFaixa || "N/I"}
                </span>
              </td>
              <td style={{ padding: "8px 8px 8px 0", textAlign: "right", fontWeight: 600, fontSize: 13, color: T.textMain }}>{r.totalAtestados}</td>
              <td style={{ padding: "8px 0", textAlign: "right", fontWeight: 600, fontSize: 13, color: "#FA4C00" }}>{r.diasAfastados}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ─── COLABORADORES TABLE ────────────────────────────────────────── */
const COLS = ["Colaborador", "Empresa", "Setor", "Turno", "Escala", "Tempo Casa", "Atestados"]

function ColaboradoresTable({ data, loading, filtroTempoCasa, setFiltroTempoCasa, filtroTurno, setFiltroTurno, colaboradores }) {
  const { isDark } = useContext(ThemeContext)
  const T = THEME[isDark ? "dark" : "light"]

  const filtered = useMemo(() => {
    const tempoCasaMap = { "0 a 7": ["0 a 7"], "8 a 15": ["8 a 15"], "16 a 30": ["16 a 30"], "31 a 89": ["31 a 89"], "90+": ["90+"] }
    return data.filter((c) => {
      if (filtroTempoCasa && !tempoCasaMap[filtroTempoCasa]?.includes(c.tempoCasa)) return false
      if (filtroTurno && c.turno !== filtroTurno) return false
      return true
    })
  }, [data, filtroTempoCasa, filtroTurno])

  const selectStyle = { background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, padding: "8px 12px", fontSize: 13, color: T.textMain, outline: "none" }

  return (
    <Card title="Colaboradores com Atestados">
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <select value={filtroTempoCasa} onChange={(e) => setFiltroTempoCasa(e.target.value)} style={selectStyle}>
          <option value="">Tempo de casa (Todos)</option>
          {["0 a 7","8 a 15","16 a 30","31 a 89","90+"].map(v => <option key={v} value={v}>{v}</option>)}
        </select>
        <select value={filtroTurno} onChange={(e) => setFiltroTurno(e.target.value)} style={selectStyle}>
          <option value="">Turno (Todos)</option>
          {[...new Set(colaboradores.map((c) => c.turno))].map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>
      <div style={{ overflowX: "auto", borderRadius: 14, border: `1px solid ${T.borderCard}` }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700, fontSize: 13 }}>
          <thead>
            <tr style={{ background: isDark ? "#0D0D0D" : "#F9FAFB", borderBottom: `1px solid ${T.border}` }}>
              {COLS.map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "12px 16px", fontSize: 10, color: T.textSubtle, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.10em", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${T.border}` }}>
                  {COLS.map((_, j) => <td key={j} style={{ padding: "12px 16px" }}><Skeleton style={{ height: 14, width: "80%" }} /></td>)}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr><td colSpan={COLS.length} style={{ padding: "48px 16px", textAlign: "center", color: T.textSubtle, fontSize: 13 }}>Nenhum resultado encontrado</td></tr>
            ) : (
              filtered.map((c, i) => {
                const atst = c.totalAtestados || 0
                const atstColor = atst >= 3 ? "#EF4444" : atst >= 2 ? "#F59E0B" : BRAND
                const atstBg   = atst >= 3 ? "#EF444418" : atst >= 2 ? "#F59E0B18" : `${BRAND}14`
                return (
                  <tr key={c.opsId || i} style={{ borderBottom: `1px solid ${T.border}`, transition: "background 0.15s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = T.cardHover)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ padding: "11px 16px", fontWeight: 500, color: T.textMain, whiteSpace: "nowrap" }}>{c.nome}</td>
                    <td style={{ padding: "11px 16px", color: T.textMuted, whiteSpace: "nowrap" }}>{c.empresa}</td>
                    <td style={{ padding: "11px 16px", color: T.textMuted, whiteSpace: "nowrap" }}>{c.setor}</td>
                    <td style={{ padding: "11px 16px", color: T.textMuted, whiteSpace: "nowrap" }}>{c.turno}</td>
                    <td style={{ padding: "11px 16px", color: T.textMuted, whiteSpace: "nowrap" }}>{c.escala}</td>
                    <td style={{ padding: "11px 16px", whiteSpace: "nowrap" }}>
                      <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 8, background: isDark ? "rgba(255,255,255,0.06)" : "#F3F4F6", color: T.textMuted, fontSize: 12 }}>{c.tempoCasa}</span>
                    </td>
                    <td style={{ padding: "11px 16px", whiteSpace: "nowrap" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 30, height: 30, borderRadius: 8, background: atstBg, color: atstColor, fontWeight: 700, fontSize: 13 }}>{atst}</span>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
        {!loading && filtered.length > 0 && (
          <div style={{ padding: "10px 16px", borderTop: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p style={{ fontSize: 11, color: T.textSubtle, margin: 0 }}>{filtered.length} de {data.length} colaboradores</p>
          </div>
        )}
      </div>
    </Card>
  )
}

/* ─── MAIN PAGE ──────────────────────────────────────────────────── */
export default function DashboardAtestados() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [inicio, setInicio] = useState(isoFirstDayOfMonth())
  const [fim, setFim] = useState(isoToday())
  const [cid, setCid] = useState("")
  const [cids, setCids] = useState([])
  const [sintoma, setSintoma] = useState("")
  const [empresaId, setEmpresaId] = useState("")
  const [empresas, setEmpresas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [kpis, setKpis] = useState(null)
  const [dist, setDist] = useState(null)
  const [tendencia, setTendencia] = useState([])
  const [topOfensores, setTopOfensores] = useState([])
  const [colaboradores, setColaboradores] = useState([])
  const [filtroTempoCasa, setFiltroTempoCasa] = useState("")
  const [filtroTurno, setFiltroTurno] = useState("")

  useEffect(() => {
    api.get("/empresas").then((res) => {
      const payload = res.data?.data ?? res.data
      setEmpresas(Array.isArray(payload) ? payload : payload?.items ?? [])
    }).catch(() => {})
  }, [])

  async function fetchAll() {
    try {
      setLoading(true)
      setError("")
      const params = { inicio, fim, cid: cid || undefined, empresaId: empresaId || undefined }
      // se sintoma selecionado, envia os CIDs do grupo (ignora filtro de CID individual)
      if (sintoma && SINTOMA_CIDS[sintoma]) {
        delete params.cid
        params.cids = SINTOMA_CIDS[sintoma]
      }
      const [resResumo, resDist, resTend, resRisco, resCids, resColab] = await Promise.all([
        api.get("/dashboard/atestados/resumo", { params }),
        api.get("/dashboard/atestados/distribuicoes", { params }),
        api.get("/dashboard/atestados/tendencia", { params }),
        api.get("/dashboard/atestados/risco", { params }),
        api.get("/dashboard/atestados/cids", { params }),
        api.get("/dashboard/atestados/colaboradores", { params }),
      ])
      setKpis(resResumo.data?.data?.kpis ?? resResumo.data?.kpis ?? null)
      setDist(resDist.data?.data ?? resDist.data ?? null)
      setCids(resCids.data?.data || [])
      setColaboradores(resColab.data?.data || [])
      setTendencia(Array.isArray(resTend.data?.data) ? resTend.data.data : Array.isArray(resTend.data) ? resTend.data : [])
      setTopOfensores(resRisco.data?.data?.topOfensores ?? resRisco.data?.topOfensores ?? [])
    } catch (err) {
      console.error("❌ DASHBOARD ATESTADOS:", err)
      setError("Erro ao carregar dashboard de atestados.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [inicio, fim, cid, sintoma, empresaId])

  const porEmpresa   = useMemo(() => dist?.porEmpresa   || [], [dist])
  const porSetor     = useMemo(() => dist?.porSetor     || [], [dist])
  const porTurno     = useMemo(() => dist?.porTurno     || [], [dist])
  const porGenero    = useMemo(() => dist?.porGenero    || [], [dist])
  const porLider     = useMemo(() => (dist?.porLider    || []).slice(0, 10), [dist])
  const porTempoCasa = useMemo(() => dist?.porTempoCasa || [], [dist])

  const porCidChart = useMemo(() => {
    if (!dist?.porCid) return []
    return dist.porCid.map((item) => ({ ...item, name: `${item.name} — ${CID_DESCRICOES[item.name] || "Outros"}`, full: `${item.name} — ${CID_DESCRICOES[item.name] || "Outros"}` })).slice(0, 10)
  }, [dist])

  const cidTableData = useMemo(() => {
    const agrupado = {}
    ;(dist?.porCid || []).forEach((c) => {
      const categoria = CID_DESCRICOES[c.name] || "Outros"
      agrupado[categoria] = (agrupado[categoria] || 0) + c.value
    })
    const relevantes = []
    let outrosTotal = 0
    Object.entries(agrupado).forEach(([name, value]) => {
      if (value <= 2) outrosTotal += value
      else relevantes.push({ name, value })
    })
    if (outrosTotal > 0) relevantes.push({ name: "Outros", value: outrosTotal })
    return relevantes.sort((a, b) => b.value - a.value)
  }, [dist])

  const pulseStyle = `
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.45} }
    input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.5); cursor: pointer; }
    .recharts-wrapper, .recharts-surface { overflow: visible !important; }
    select option { background: #1A1A1A; }
    .hide-scrollbar::-webkit-scrollbar { display: none; }
    .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  `

  const { isDark } = useContext(ThemeContext)
  const T = THEME[isDark ? "dark" : "light"]

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: T.bg, color: T.textMain }}>
      <style>{pulseStyle}</style>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }} className="lg:ml-64">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main style={{ flex: 1, padding: "32px 24px 64px", maxWidth: 1600, width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", gap: 40 }}>

          {/* PAGE HEADER */}
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: 20 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <div style={{ width: 4, height: 26, borderRadius: 4, background: BRAND }} />
                <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}>Dashboard de Atestados</h1>
              </div>
              <p style={{ margin: "0 0 0 14px", fontSize: 13, color: "rgba(255,255,255,0.35)" }}>
                Visão completa de impacto, recorrência e diagnóstico de ausências médicas
              </p>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: 12 }}>
              <DateInput label="Início" value={inicio} onChange={setInicio} />
              <DateInput label="Fim" value={fim} onChange={setFim} />
              <SelectEmpresa value={empresaId} onChange={setEmpresaId} options={empresas} />
              <SelectSintoma
                value={sintoma}
                onChange={(v) => { setSintoma(v); if (v) setCid("") }}
              />
              <SelectCID
                value={cid}
                onChange={(v) => { setCid(v); if (v) setSintoma("") }}
                options={cids}
              />
              <button
                onClick={fetchAll}
                disabled={loading}
                style={{ height: 42, padding: "0 24px", borderRadius: 12, background: loading ? "#333" : BRAND, color: "#fff", fontWeight: 700, fontSize: 13, border: "none", cursor: loading ? "not-allowed" : "pointer", transition: "background 0.2s", whiteSpace: "nowrap", alignSelf: "flex-end" }}
                onMouseEnter={(e) => !loading && (e.target.style.background = "#e64500")}
                onMouseLeave={(e) => !loading && (e.target.style.background = BRAND)}
              >
                {loading ? "Carregando…" : "Atualizar"}
              </button>
            </div>
          </div>

          {/* ERROR */}
          {error && (
            <div style={{ borderRadius: 14, border: "1px solid rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.06)", padding: "14px 18px", display: "flex", alignItems: "center", gap: 10 }}>
              <IconAlert c="#EF4444" s={17} />
              <p style={{ margin: 0, fontSize: 13, color: "#EF4444" }}>{error}</p>
            </div>
          )}

          {/* 01 — PANORAMA GERAL */}
          <section style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <SectionLabel num="01" title="Panorama Geral" />
            <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-3">
              <KpiCard label="Atestados"   value={kpis?.totalPeriodo}              loading={loading} />
              <KpiCard label="Recorrência" value={`${kpis?.recorrencia ?? 0}%`}    loading={loading} />
              <KpiCard label="Impactados"  value={kpis?.colaboradoresImpactados}   loading={loading} />
              <KpiCard label="% HC"        value={`${kpis?.percentualHC ?? 0}%`}   loading={loading} />
              <KpiCard label="Hoje"        value={kpis?.hoje}                      loading={loading} />
              <KpiCard label="Semana"      value={kpis?.semana}                    loading={loading} />
              <KpiCard label="Mês"         value={kpis?.mes}                       loading={loading} />
            </div>
          </section>

          {/* 02 — TENDÊNCIA */}
          <section style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <SectionLabel num="02" title="Tendência" />
            <Card title="Atestados por dia">
              <div className="h-[220px] sm:h-[260px] lg:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={Array.isArray(tendencia) ? tendencia : []}>
                    <CartesianGrid stroke={isDark ? "rgba(255,255,255,0.08)" : "#E5E7EB"} />
                    <XAxis dataKey="data" tick={{ fill: isDark ? "#BFBFC3" : "#6B7280", fontSize: 12 }} minTickGap={20} />
                    <YAxis tick={{ fill: isDark ? "#BFBFC3" : "#6B7280", fontSize: 12 }} allowDecimals={false} />
                    <Tooltip contentStyle={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, color: T.textMain }} />
                    <Line type="monotone" dataKey="total" stroke={BRAND} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }}>
                      <LabelList dataKey="total" position="top" style={{ fill: T.textMain, fontSize: 12, fontWeight: 600 }} />
                    </Line>
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </section>

          {/* 03 — DISTRIBUIÇÕES */}
          <section style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <SectionLabel num="03" title="Distribuições" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card title="Atestados por Empresa"><BarBlock data={porEmpresa} /></Card>
              <Card title="Atestados por Setor"><BarBlock data={porSetor} /></Card>
              <Card title="Top 10 Líderes"><BarBlockHorizontal data={porLider} /></Card>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Card title="Por Turno"><PieBlock data={porTurno} /></Card>
                <Card title="Por Gênero"><PieBlock data={porGenero} /></Card>
              </div>
            </div>
          </section>

          {/* 04 — TEMPO DE CASA + CID */}
          <section style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <SectionLabel num="04" title="Tempo de Casa & CID" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card title="Atestados por Tempo de Casa">
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={porTempoCasa}>
                      <CartesianGrid stroke={isDark ? "rgba(255,255,255,0.08)" : "#E5E7EB"} />
                      <XAxis dataKey="name" tick={{ fill: T.textMuted, fontSize: 12 }} />
                      <YAxis allowDecimals={false} tick={{ fill: T.textMuted, fontSize: 12 }} />
                      <Tooltip contentStyle={{ background: isDark ? "#232323" : "#FFFFFF", border: `1px solid ${T.border}`, borderRadius: 8, color: T.textMain }} />
                      <Bar dataKey="value" fill={BRAND}>
                        <LabelList dataKey="value" position="top" style={{ fill: isDark ? "#FFF" : "#111827", fontSize: 12, fontWeight: 600 }} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card title="CID — Distribuição Completa">
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                        <th style={{ textAlign: "left", padding: "8px 0", color: T.textMuted, fontWeight: 600, fontSize: 11 }}>Categoria</th>
                        <th style={{ textAlign: "right", padding: "8px 0", color: T.textMuted, fontWeight: 600, fontSize: 11 }}>Qtd</th>
                        <th style={{ textAlign: "right", padding: "8px 0", color: T.textMuted, fontWeight: 600, fontSize: 11 }}>% Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const total = cidTableData.reduce((acc, i) => acc + i.value, 0)
                        return cidTableData.map((c, index) => (
                          <tr key={index} style={{ borderTop: `1px solid ${T.border}` }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = T.cardHover)}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                          >
                            <td style={{ padding: "8px 0", fontWeight: 500, color: c.name === "Outros" ? T.textSubtle : T.textMain }}>{c.name}</td>
                            <td style={{ padding: "8px 0", textAlign: "right", fontWeight: 600, color: T.textMain }}>{c.value}</td>
                            <td style={{ padding: "8px 0", textAlign: "right", fontWeight: 600, color: "#FA4C00" }}>{total > 0 ? ((c.value / total) * 100).toFixed(1) : 0}%</td>
                          </tr>
                        ))
                      })()}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </section>

          {/* 05 — RANKING */}
          <section style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <SectionLabel num="05" title="Ranking" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card title="Top 10 CID (dado sensível)"><BarBlockHorizontalCID data={porCidChart} /></Card>
              <Card title="Top 10 Ofensores (colaboradores)"><TopOfensoresTable rows={topOfensores} loading={loading} /></Card>
            </div>
          </section>

          {/* 06 — COLABORADORES */}
          <section style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <SectionLabel num="06" title="Colaboradores" />
            <ColaboradoresTable
              data={colaboradores}
              loading={loading}
              filtroTempoCasa={filtroTempoCasa}
              setFiltroTempoCasa={setFiltroTempoCasa}
              filtroTurno={filtroTurno}
              setFiltroTurno={setFiltroTurno}
              colaboradores={colaboradores}
            />
          </section>

        </main>
      </div>
    </div>
  )
}
