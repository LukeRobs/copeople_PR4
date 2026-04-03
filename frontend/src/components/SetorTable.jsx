import { useContext, useState } from "react";
import { Pencil, Trash2, Layers, Users } from "lucide-react";
import { ThemeContext } from "../context/ThemeContext";

const THEME = {
  dark: {
    card:"#111113", cardBorder:"#27272A", cardHover:"#18181B",
    textMain:"#F4F4F5", textMuted:"#A1A1AA", textSubtle:"#71717A", divider:"#27272A",
    avatarBg:"#1F1F22", avatarText:"#FA4C00",
    badgeBg:"#1A2E1A", badgeText:"#4ADE80", badgeBorder:"#166534",
    badgeOffBg:"#2A1A1A", badgeOffTxt:"#F87171", badgeOffBdr:"#7F1D1D",
    countBg:"#1E1B30", countText:"#A78BFA", countBorder:"#4C1D95",
    btnEditBg:"transparent", btnEditBorder:"#3F3F46", btnEditText:"#A1A1AA", btnEditHover:"#27272A",
    btnDelBg:"transparent", btnDelBorder:"#4A1A1A", btnDelText:"#F87171", btnDelHover:"#3F1515",
    emptyText:"#71717A",
  },
  light: {
    card:"#FFFFFF", cardBorder:"#E4E4E7", cardHover:"#FAFAFA",
    textMain:"#18181B", textMuted:"#52525B", textSubtle:"#A1A1AA", divider:"#F4F4F5",
    avatarBg:"#FFF1EC", avatarText:"#FA4C00",
    badgeBg:"#F0FDF4", badgeText:"#15803D", badgeBorder:"#BBF7D0",
    badgeOffBg:"#FEF2F2", badgeOffTxt:"#DC2626", badgeOffBdr:"#FECACA",
    countBg:"#EFF6FF", countText:"#2563EB", countBorder:"#BFDBFE",
    btnEditBg:"#FFFFFF", btnEditBorder:"#E4E4E7", btnEditText:"#52525B", btnEditHover:"#F4F4F5",
    btnDelBg:"#FFFFFF", btnDelBorder:"#FECACA", btnDelText:"#DC2626", btnDelHover:"#FEF2F2",
    emptyText:"#A1A1AA",
  },
};

function Avatar({ name, T }) {
  const initials = name ? name.split(" ").slice(0,2).map(w=>w[0]).join("").toUpperCase() : "?";
  return (
    <div style={{width:42,height:42,borderRadius:12,background:T.avatarBg,color:T.avatarText,
      display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:14,flexShrink:0}}>
      {initials}
    </div>
  );
}

function StatusBadge({ ativo, T }) {
  return (
    <span style={{display:"inline-flex",alignItems:"center",gap:5,padding:"3px 10px",borderRadius:999,
      fontSize:11,fontWeight:600,letterSpacing:"0.03em",
      background:ativo?T.badgeBg:T.badgeOffBg, color:ativo?T.badgeText:T.badgeOffTxt,
      border:`1px solid ${ativo?T.badgeBorder:T.badgeOffBdr}`,whiteSpace:"nowrap"}}>
      <span style={{width:6,height:6,borderRadius:"50%",background:ativo?T.badgeText:T.badgeOffTxt,display:"inline-block",flexShrink:0}}/>
      {ativo ? "Ativo" : "Inativo"}
    </span>
  );
}

function CountBadge({ count, T }) {
  return (
    <span style={{display:"inline-flex",alignItems:"center",gap:5,padding:"3px 10px",borderRadius:999,
      fontSize:12,fontWeight:600,background:T.countBg,color:T.countText,border:`1px solid ${T.countBorder}`}}>
      <Users size={11}/>{count}
    </span>
  );
}

function ActionBtn({ label, icon, bg, border, color, hoverBg, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{display:"inline-flex",alignItems:"center",gap:6,padding:"6px 13px",borderRadius:8,
        fontSize:12,fontWeight:500,cursor:"pointer",border:`1px solid ${border}`,
        background:hov?hoverBg:bg,color,transition:"background 0.15s ease",outline:"none",whiteSpace:"nowrap"}}>
      {icon}{label}
    </button>
  );
}

export default function SetorTable({ setores, onEdit, onDelete }) {
  const { isDark } = useContext(ThemeContext);
  const T = THEME[isDark?"dark":"light"];
  if (!setores?.length) {
    return (
      <div style={{padding:"60px 20px",textAlign:"center",color:T.emptyText,
        display:"flex",flexDirection:"column",alignItems:"center",gap:12}}>
        <Layers size={40} strokeWidth={1.2} style={{opacity:0.4}}/>
        <p style={{fontSize:14}}>Nenhum setor cadastrado</p>
      </div>
    );
  }
  const cols = Math.min(setores.length, 3);
  return (
    <div style={{display:"grid",gridTemplateColumns:`repeat(${cols}, 1fr)`,gap:16,padding:20}}>
      {setores.map(s => <SetorCard key={s.idSetor} setor={s} T={T} onEdit={onEdit} onDelete={onDelete}/>)}
    </div>
  );
}

function SetorCard({ setor:s, T, onEdit, onDelete }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{background:hov?T.cardHover:T.card,border:`1px solid ${T.cardBorder}`,borderRadius:14,
        padding:"18px 20px",display:"flex",flexDirection:"column",gap:14,
        transition:"background 0.15s ease,box-shadow 0.15s ease",
        boxShadow:hov?"0 4px 20px rgba(0,0,0,0.08)":"none"}}>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12}}>
        <div style={{display:"flex",alignItems:"center",gap:12,minWidth:0}}>
          <Avatar name={s.nomeSetor} T={T}/>
          <div style={{minWidth:0}}>
            <p style={{fontSize:15,fontWeight:700,color:T.textMain,margin:0,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{s.nomeSetor}</p>
            <p style={{fontSize:11,color:T.textSubtle,margin:"3px 0 0"}}>ID #{s.idSetor}</p>
          </div>
        </div>
        <StatusBadge ativo={s.ativo} T={T}/>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:6,paddingTop:4,borderTop:`1px solid ${T.divider}`}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <span style={{fontSize:12,color:T.textSubtle}}>Descrição</span>
          <span style={{fontSize:12,color:T.textMuted,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:180}}>{s.descricao || "—"}</span>
        </div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <span style={{fontSize:12,color:T.textSubtle}}>Colaboradores</span>
          <CountBadge count={s.totalColaboradores??0} T={T}/>
        </div>
      </div>
      <div style={{display:"flex",justifyContent:"flex-end",gap:8,paddingTop:10,borderTop:`1px solid ${T.divider}`}}>
        <ActionBtn label="Editar" icon={<Pencil size={13}/>} bg={T.btnEditBg} border={T.btnEditBorder} color={T.btnEditText} hoverBg={T.btnEditHover} onClick={()=>onEdit(s)}/>
        <ActionBtn label="Excluir" icon={<Trash2 size={13}/>} bg={T.btnDelBg} border={T.btnDelBorder} color={T.btnDelText} hoverBg={T.btnDelHover} onClick={()=>onDelete(s)}/>
      </div>
    </div>
  );
}
