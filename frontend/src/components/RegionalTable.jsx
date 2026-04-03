import { useContext, useState } from "react";
import { Pencil, Trash2, MapPin } from "lucide-react";
import { ThemeContext } from "../context/ThemeContext";

const THEME = {
  dark: {
    card:"#111113", cardBorder:"#27272A", cardHover:"#18181B",
    textMain:"#F4F4F5", textMuted:"#A1A1AA", textSubtle:"#71717A", divider:"#27272A",
    avatarBg:"#1F1F22", avatarText:"#FA4C00",
    btnEditBg:"transparent", btnEditBorder:"#3F3F46", btnEditText:"#A1A1AA", btnEditHover:"#27272A",
    btnDelBg:"transparent", btnDelBorder:"#4A1A1A", btnDelText:"#F87171", btnDelHover:"#3F1515",
    emptyText:"#71717A",
  },
  light: {
    card:"#FFFFFF", cardBorder:"#E4E4E7", cardHover:"#FAFAFA",
    textMain:"#18181B", textMuted:"#52525B", textSubtle:"#A1A1AA", divider:"#F4F4F5",
    avatarBg:"#FFF1EC", avatarText:"#FA4C00",
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

export default function RegionalTable({ regionais, onEdit, onDelete }) {
  const { isDark } = useContext(ThemeContext);
  const T = THEME[isDark?"dark":"light"];
  if (!regionais?.length) {
    return (
      <div style={{padding:"60px 20px",textAlign:"center",color:T.emptyText,
        display:"flex",flexDirection:"column",alignItems:"center",gap:12}}>
        <MapPin size={40} strokeWidth={1.2} style={{opacity:0.4}}/>
        <p style={{fontSize:14}}>Nenhuma regional cadastrada</p>
      </div>
    );
  }
  const cols = Math.min(regionais.length, 3);
  return (
    <div style={{display:"grid",gridTemplateColumns:`repeat(${cols}, 1fr)`,gap:16,padding:20}}>
      {regionais.map(r => <RegionalCard key={r.idRegional} regional={r} T={T} onEdit={onEdit} onDelete={onDelete}/>)}
    </div>
  );
}

function RegionalCard({ regional:r, T, onEdit, onDelete }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{background:hov?T.cardHover:T.card,border:`1px solid ${T.cardBorder}`,borderRadius:14,
        padding:"18px 20px",display:"flex",flexDirection:"column",gap:14,
        transition:"background 0.15s ease,box-shadow 0.15s ease",
        boxShadow:hov?"0 4px 20px rgba(0,0,0,0.08)":"none"}}>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12}}>
        <div style={{display:"flex",alignItems:"center",gap:12,minWidth:0}}>
          <Avatar name={r.nome} T={T}/>
          <div style={{minWidth:0}}>
            <p style={{fontSize:15,fontWeight:700,color:T.textMain,margin:0,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{r.nome}</p>
            <p style={{fontSize:11,color:T.textSubtle,margin:"3px 0 0"}}>ID #{r.idRegional}</p>
          </div>
        </div>
      </div>
      <div style={{display:"flex",justifyContent:"flex-end",gap:8,paddingTop:10,borderTop:`1px solid ${T.divider}`}}>
        <ActionBtn label="Editar" icon={<Pencil size={13}/>} bg={T.btnEditBg} border={T.btnEditBorder} color={T.btnEditText} hoverBg={T.btnEditHover} onClick={()=>onEdit(r)}/>
        <ActionBtn label="Excluir" icon={<Trash2 size={13}/>} bg={T.btnDelBg} border={T.btnDelBorder} color={T.btnDelText} hoverBg={T.btnDelHover} onClick={()=>onDelete(r)}/>
      </div>
    </div>
  );
}
