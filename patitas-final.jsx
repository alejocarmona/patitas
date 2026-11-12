import { useState } from "react";

const theme = {
  primary: "#FF6B35", primaryDark: "#E5521A", secondary: "#2D4A3E",
  accent: "#FFD166", bg: "#FDF6F0", text: "#1A1A2E",
  textMuted: "#7A7A9A", textLight: "#B0B0C8",
  success: "#4CAF82", danger: "#FF4757", border: "#F0E8E0",
};

const I = {
  Home: ({ c="#7A7A9A", s=18 }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/><path d="M9 22V12h6v10" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></svg>),
  Health: ({ c="#7A7A9A", s=18 }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></svg>),
  Tips: ({ c="#7A7A9A", s=18 }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke={c} strokeWidth={2}/><path d="M12 8v4M12 16h.01" stroke={c} strokeWidth={2} strokeLinecap="round"/></svg>),
  Map: ({ c="#7A7A9A", s=18 }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke={c} strokeWidth={2}/><circle cx="12" cy="10" r="3" stroke={c} strokeWidth={2}/></svg>),
  Paw: ({ c=theme.primary, s=20 }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill={c}><ellipse cx="12" cy="17" rx="5" ry="4"/><ellipse cx="7" cy="11" rx="2" ry="3"/><ellipse cx="17" cy="11" rx="2" ry="3"/><ellipse cx="9.5" cy="7" rx="1.5" ry="2"/><ellipse cx="14.5" cy="7" rx="1.5" ry="2"/></svg>),
  Bell: ({ c="#7A7A9A", s=20 }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></svg>),
  Plus: ({ c="#fff", s=20 }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke={c} strokeWidth={2.5} strokeLinecap="round"/></svg>),
  ChevR: ({ c="#B0B0C8", s=16 }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></svg>),
  ChevL: ({ c="#fff", s=20 }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></svg>),
  Star: ({ c=theme.accent, s=14 }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill={c}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>),
  Heart: ({ c=theme.danger, s=14 }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></svg>),
  Syringe: ({ c=theme.primary, s=16 }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M18 2l4 4M17 7l-6 6M3 21l6-6M13 11l-4 4M8 8l8 8" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/><circle cx="6" cy="18" r="1" fill={c}/></svg>),
  Weight: ({ c=theme.secondary, s=16 }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none"><rect x="2" y="8" width="20" height="14" rx="2" stroke={c} strokeWidth={2}/><path d="M8 8V6a4 4 0 018 0v2" stroke={c} strokeWidth={2} strokeLinecap="round"/></svg>),
  Edit: ({ c=theme.primary, s=16 }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></svg>),
  Trash: ({ c=theme.danger, s=16 }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none"><polyline points="3 6 5 6 21 6" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/><path d="M10 11v6M14 11v6" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></svg>),
  User: ({ c="#7A7A9A", s=20 }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="7" r="4" stroke={c} strokeWidth={2}/></svg>),
  Logout: ({ c=theme.danger, s=18 }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/><polyline points="16 17 21 12 16 7" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/><line x1="21" y1="12" x2="9" y2="12" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></svg>),
  Info: ({ c=theme.secondary, s=18 }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke={c} strokeWidth={2}/><line x1="12" y1="8" x2="12" y2="12" stroke={c} strokeWidth={2} strokeLinecap="round"/><line x1="12" y1="16" x2="12.01" y2="16" stroke={c} strokeWidth={2} strokeLinecap="round"/></svg>),
  Mail: ({ c=theme.secondary, s=18 }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/><polyline points="22,6 12,13 2,6" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></svg>),
  Google: ({ s=18 }) => (<svg width={s} height={s} viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>),
};

const TIPS_DATA = [
  { id:1, emoji:"🐱", category:"Alimentación", likes:142, time:"Hace 2 días", title:"¿Cuántas veces al día debe comer tu gato?", excerpt:"Los gatos adultos necesitan 2-3 porciones al día. Evita dejar comida seca disponible todo el tiempo.", detail:["Los gatos son comedores naturalmente pequeños y frecuentes. Su sistema digestivo está diseñado para porciones pequeñas y frecuentes.","✅ Recomendado: 2 comidas al día para adultos, 3 para gatitos menores de 6 meses.","⚠️ Evita dejar el comedero lleno todo el día — el 60% de los gatos domésticos tienen sobrepeso por esta razón.","💧 Siempre agua fresca disponible, especialmente si tu gato come croquetas secas.","🐟 Alterna húmedo y seco para variedad nutricional y salud dental."] },
  { id:2, emoji:"✂️", category:"Cuidado", likes:389, time:"Hace 5 días", title:"El truco del snack para cortar las uñas sin estrés", excerpt:"Usa un snack tipo pasta o gel mientras cortas. Tu gato estará tan concentrado en el premio que no notará nada.", detail:["Este truco explota la concentración natural del gato en la comida. Cuando está laminando una pasta de premio, sus sentidos se enfocan completamente en esa tarea.","🛒 Qué necesitas: pasta de premio felino (Churu o similar), cortaúñas para gatos.","📋 Paso a paso:","1. Pon la pasta en tu dedo o en un plato pequeño.","2. Deja que empiece a lamer antes de tocar las uñas.","3. Corta solo la punta transparente, nunca la parte rosada (la vena).","4. Descansa entre patas si el gato se incomoda.","⏱️ Frecuencia ideal: cada 2-3 semanas para gatos de interior."] },
  { id:3, emoji:"🛁", category:"Higiene", likes:98, time:"Hace 1 semana", title:"¿Con qué frecuencia bañar a un gato?", excerpt:"Los gatos se limpian solos. Un baño cada 4-6 semanas es suficiente, a menos que tengan pulgas o condición de piel.", detail:["Los gatos dedican entre el 30% y 50% de su tiempo despiertos al aseo personal.","🚿 ¿Cuándo SÍ bañar?: cuando hay pulgas, cuando tocó algo tóxico, o por prescripción veterinaria.","🚫 ¿Cuándo NO es necesario?: en gatos de interior saludables, el baño excesivo elimina los aceites naturales de su piel.","💡 Si debes bañarlo: usa agua tibia y shampoo específico para gatos."] },
  { id:4, emoji:"🏥", category:"Salud", likes:256, time:"Hace 2 semanas", title:"Señales de que tu gato necesita ir al veterinario", excerpt:"Cambios en el apetito, letargo prolongado, problemas para orinar o dificultad para respirar son señales de alerta.", detail:["Los gatos son expertos en ocultar el dolor — herencia de sus instintos salvajes.","🚨 Señales de URGENCIA (ve hoy):","• Dificultad para respirar o respiración con boca abierta","• Intentos fallidos de orinar (especialmente en machos)","• Convulsiones o pérdida de conciencia","⚠️ Señales que merecen cita pronto:","• Pérdida de apetito por más de 24 horas","• Letargo inusual o aislamiento","• Vómitos frecuentes (más de 2 veces por semana)","📅 Chequeos preventivos: una vez al año para adultos."] },
  { id:5, emoji:"😴", category:"Cuidado", likes:174, time:"Hace 3 semanas", title:"¿Cuántas horas duerme un gato sano?", excerpt:"Entre 12 y 16 horas diarias es completamente normal. Si duerme más de 18 horas y pierde apetito, consulta al vet.", detail:["Los gatos son depredadores de emboscada: gastan poca energía esperando y mucha en el ataque.","😴 Rangos normales: gatitos 16-20h, adultos 12-16h, senior 14-18h.","🔍 ¿Cuándo preocuparse?: si además de dormir más también pierde apetito o desinterés en el juego."] },
  { id:6, emoji:"🌿", category:"Alimentación", likes:441, time:"Hace 1 mes", title:"Plantas tóxicas para gatos que debes tener lejos", excerpt:"Lirio, pothos, aloe vera y tulipán son altamente tóxicos. Conoce la lista completa para proteger a tu mascota.", detail:["Muchas plantas decorativas comunes son peligrosas para los gatos.","☠️ ALTAMENTE TÓXICAS:","• Lirios — pueden causar falla renal aguda con solo lamer el polen","• Azalea y rododendro — afectan el corazón","• Oleander — tóxico para el sistema cardiovascular","⚠️ TÓXICAS (síntomas moderados):","• Pothos y Philodendron — irritación oral y digestiva","• Aloe vera — diarrea y vómitos","• Tulipán e Iris — náuseas y letargo","✅ SEGURAS: hierba gatera, orquídeas, girasoles.","📱 Ante sospecha de intoxicación: lleva a urgencias veterinarias de inmediato."] },
];

const VETS = [
  { id:1, name:"Clínica Veterinaria PetCare", address:"Cra 45 #23-10, Medellín", mapsQuery:"Cra+45+%2323-10+Medellin", phone:"6044512890", distance:"0.4 km", rating:4.8, reviews:124, hours:"Lun-Sáb 8am-8pm", open:true, specialty:"General" },
  { id:2, name:"VetSalud Especialistas", address:"Cll 33 #67-20, Medellín", mapsQuery:"Cll+33+%2367-20+Medellin", phone:"6044523456", distance:"1.2 km", rating:4.6, reviews:89, hours:"Lun-Dom 7am-10pm", open:true, specialty:"Urgencias 24h" },
  { id:3, name:"Veterinaria El Arca", address:"Av El Poblado #15-44", mapsQuery:"Av+El+Poblado+%2315-44+Medellin", phone:"6044534567", distance:"2.1 km", rating:4.3, reviews:201, hours:"Lun-Vie 9am-6pm", open:false, specialty:"General" },
  { id:4, name:"Centro Médico Felino", address:"Cra 70 #45-12, Medellín", mapsQuery:"Cra+70+%2345-12+Medellin", phone:"6044545678", distance:"2.8 km", rating:4.9, reviews:67, hours:"Mar-Dom 10am-7pm", open:true, specialty:"Especialista felino" },
];

// ─── REUSABLE ───────────────────────────────────────────────────────────────
function TopBar({ title, subtitle, gradient, onBack, right }) {
  return (
    <div style={{ background: gradient || `linear-gradient(135deg,${theme.primary},${theme.primaryDark})`, padding:"48px 20px 24px", borderRadius:"0 0 32px 32px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        {onBack
          ? <button onClick={onBack} style={{ background:"rgba(255,255,255,0.2)", border:"none", borderRadius:12, padding:"8px 12px", cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}><I.ChevL s={18}/><span style={{ color:"#fff", fontSize:13, fontWeight:700 }}>Volver</span></button>
          : <div/>}
        {right}
      </div>
      <h2 style={{ color:"#fff", fontSize:22, fontWeight:900, marginTop:onBack?12:0, marginBottom:4 }}>{title}</h2>
      {subtitle && <p style={{ color:"rgba(255,255,255,0.65)", fontSize:13 }}>{subtitle}</p>}
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type="text" }) {
  return (
    <div>
      <label style={{ fontSize:12, fontWeight:700, color:theme.textMuted, letterSpacing:0.5, textTransform:"uppercase", marginBottom:6, display:"block" }}>{label}</label>
      <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} type={type}
        style={{ width:"100%", background:"#fff", border:`2px solid ${theme.border}`, borderRadius:12, padding:"13px 16px", fontSize:15, fontWeight:600, color:theme.text, outline:"none", boxSizing:"border-box" }}/>
    </div>
  );
}

function Btn({ label, onClick, color=theme.primary, outline=false, full=true }) {
  return (
    <button onClick={onClick} style={{ width:full?"100%":"auto", background:outline?"transparent":color, color:outline?color:"#fff", border:`2px solid ${color}`, borderRadius:14, padding:"14px 20px", fontSize:15, fontWeight:700, cursor:"pointer", boxShadow:outline?"none":`0 6px 20px ${color}33` }}>
      {label}
    </button>
  );
}

// ─── ONBOARDING ─────────────────────────────────────────────────────────────
function Onboarding({ onNext }) {
  const [step,setStep]=useState(0);
  const steps=[
    { emoji:"🐾", title:"Todo lo de tu mascota,\nen un lugar", sub:"Cartilla digital, vacunas, veterinarios cercanos y más.", bg:"#FFF3EE" },
    { emoji:"💉", title:"Nunca pierdas una\nvacuna", sub:"Recibe recordatorios antes de cada cita médica.", bg:"#EEF7F2" },
    { emoji:"📍", title:"Veterinarios cerca\nde ti", sub:"Encuentra el más cercano y llega directo desde la app.", bg:"#FFF8EE" },
  ];
  const s=steps[step];
  return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column", background:s.bg, transition:"background 0.4s" }}>
      <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"40px 32px 20px" }}>
        <div style={{ fontSize:72, marginBottom:24 }}>{s.emoji}</div>
        <h1 style={{ fontSize:26, fontWeight:800, color:theme.text, textAlign:"center", lineHeight:1.25, marginBottom:16, whiteSpace:"pre-line" }}>{s.title}</h1>
        <p style={{ fontSize:15, color:theme.textMuted, textAlign:"center", lineHeight:1.6 }}>{s.sub}</p>
        <div style={{ display:"flex", gap:6, marginTop:32 }}>
          {steps.map((_,i)=><div key={i} style={{ width:i===step?24:8, height:8, borderRadius:4, background:i===step?theme.primary:theme.border, transition:"all 0.3s" }}/>)}
        </div>
      </div>
      <div style={{ padding:"0 24px 48px", display:"flex", flexDirection:"column", gap:12 }}>
        <button onClick={step<2?()=>setStep(step+1):onNext} style={{ background:theme.primary, color:"#fff", border:"none", borderRadius:16, padding:"16px", fontSize:16, fontWeight:700, cursor:"pointer", boxShadow:`0 8px 24px ${theme.primary}44` }}>
          {step<2?"Siguiente":"Comenzar — es gratis"}
        </button>
        {step<2&&<button onClick={onNext} style={{ background:"transparent", color:theme.textMuted, border:"none", fontSize:14, fontWeight:600, cursor:"pointer" }}>Omitir</button>}
      </div>
    </div>
  );
}

// ─── LOGIN ───────────────────────────────────────────────────────────────────
function Login({ onLogin }) {
  return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column", background:theme.bg }}>
      <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"40px 32px" }}>
        <div style={{ width:72, height:72, background:theme.primary, borderRadius:24, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:20, boxShadow:`0 8px 24px ${theme.primary}55` }}>
          <I.Paw c="#fff" s={36}/>
        </div>
        <h1 style={{ fontSize:28, fontWeight:900, color:theme.text, marginBottom:6 }}>Patitas</h1>
        <p style={{ fontSize:14, color:theme.textMuted, marginBottom:8, textAlign:"center" }}>Todo lo de tu mascota, siempre contigo</p>
        <div style={{ background:`${theme.success}15`, border:`1px solid ${theme.success}30`, borderRadius:12, padding:"8px 20px", marginBottom:32 }}>
          <p style={{ fontSize:13, color:theme.success, fontWeight:700 }}>✓ Completamente gratis</p>
        </div>
        <div style={{ width:"100%", display:"flex", flexDirection:"column", gap:12 }}>
          {[["Google",<I.Google s={20}/>],["email","✉️"]].map(([label,icon])=>(
            <button key={label} onClick={onLogin} style={{ background:"#fff", border:`2px solid ${theme.border}`, borderRadius:14, padding:"14px 20px", display:"flex", alignItems:"center", gap:12, cursor:"pointer", fontSize:15, fontWeight:600, color:theme.text, boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
              <span style={{ fontSize:20 }}>{icon}</span>Continuar con {label}
            </button>
          ))}
          <div style={{ position:"relative", margin:"4px 0" }}>
            <div style={{ height:1, background:theme.border }}/>
            <span style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", background:theme.bg, padding:"0 12px", fontSize:12, color:theme.textMuted }}>o</span>
          </div>
          <button onClick={onLogin} style={{ background:theme.primary, color:"#fff", border:"none", borderRadius:14, padding:"16px", fontSize:16, fontWeight:700, cursor:"pointer", boxShadow:`0 8px 24px ${theme.primary}44` }}>
            Crear mi cuenta gratis
          </button>
        </div>
      </div>
      <p style={{ textAlign:"center", fontSize:12, color:theme.textLight, padding:"0 24px 32px" }}>
        Al continuar aceptas nuestros <span style={{ color:theme.primary }}>Términos</span> y <span style={{ color:theme.primary }}>Política de privacidad</span>
      </p>
    </div>
  );
}

// ─── CREATE / EDIT PET ───────────────────────────────────────────────────────
function PetForm({ initial, onDone, isEdit=false }) {
  const [form,setForm]=useState(initial||{ name:"", species:"Gato", breed:"", birthdate:"", gender:"Hembra" });
  const set=k=>v=>setForm(f=>({...f,[k]:v}));
  return (
    <div style={{ height:"100%", overflowY:"auto", background:theme.bg }}>
      <TopBar
        title={isEdit?"Editar perfil de Luna":"Cuéntanos de tu mascota"}
        subtitle={isEdit?"Actualiza los datos cuando quieras":"Así podremos cuidarla mejor juntos 🐾"}
        gradient={`linear-gradient(135deg,${theme.primary},${theme.primaryDark})`}
        onBack={isEdit?onDone:null}
      />
      <div style={{ padding:"8px 20px 16px", display:"flex", justifyContent:"center" }}>
        <div style={{ width:80, height:80, borderRadius:24, background:`${theme.primary}20`, border:`3px dashed ${theme.primary}60`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexDirection:"column", gap:4, marginTop:-20 }}>
          <span style={{ fontSize:26 }}>📷</span>
          <span style={{ fontSize:10, color:theme.primary, fontWeight:700 }}>Foto</span>
        </div>
      </div>
      <div style={{ padding:"0 20px 32px", display:"flex", flexDirection:"column", gap:14 }}>
        <Field label="Nombre" value={form.name} onChange={set("name")} placeholder="¿Cómo se llama?"/>
        <Field label="Raza" value={form.breed} onChange={set("breed")} placeholder="Ej: Labrador, Persa..."/>
        <Field label="Fecha de nacimiento" value={form.birthdate} onChange={set("birthdate")} placeholder="AAAA-MM-DD"/>
        <div>
          <label style={{ fontSize:12, fontWeight:700, color:theme.textMuted, letterSpacing:0.5, textTransform:"uppercase", marginBottom:8, display:"block" }}>Especie</label>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {["Perro","Gato","Conejo","Ave","Otro"].map(s=>(
              <button key={s} onClick={()=>setForm(f=>({...f,species:s}))} style={{ padding:"8px 16px", borderRadius:20, border:`2px solid ${form.species===s?theme.primary:theme.border}`, background:form.species===s?`${theme.primary}15`:"#fff", color:form.species===s?theme.primary:theme.textMuted, fontWeight:700, fontSize:13, cursor:"pointer" }}>{s}</button>
            ))}
          </div>
        </div>
        <div>
          <label style={{ fontSize:12, fontWeight:700, color:theme.textMuted, letterSpacing:0.5, textTransform:"uppercase", marginBottom:8, display:"block" }}>Género</label>
          <div style={{ display:"flex", gap:8 }}>
            {["Macho","Hembra"].map(g=>(
              <button key={g} onClick={()=>setForm(f=>({...f,gender:g}))} style={{ flex:1, padding:"12px", borderRadius:12, border:`2px solid ${form.gender===g?theme.primary:theme.border}`, background:form.gender===g?`${theme.primary}15`:"#fff", color:form.gender===g?theme.primary:theme.textMuted, fontWeight:700, fontSize:14, cursor:"pointer" }}>
                {g==="Macho"?"♂ Macho":"♀ Hembra"}
              </button>
            ))}
          </div>
        </div>
        <Btn label={isEdit?"Guardar cambios":"¡Listo, creemos el perfil de Luna! 🐾"} onClick={onDone}/>
        {isEdit&&<Btn label="Cancelar" onClick={onDone} outline color={theme.textMuted}/>}
      </div>
    </div>
  );
}

// ─── AGREGAR VACUNA (CRUD PATTERN) ──────────────────────────────────────────
function AddVacuna({ onBack, onSave }) {
  const [form,setForm]=useState({ name:"", date:"", next:"", notes:"" });
  const set=k=>v=>setForm(f=>({...f,[k]:v}));
  const vaccines=["Panleucopenia","Rinotraqueítis","Calicivirus","Antirrábica","Leucemia felina","Bordetella","Otra"];
  return (
    <div style={{ height:"100%", overflowY:"auto", background:theme.bg }}>
      <TopBar title="Agregar vacuna" subtitle="Registra la vacuna de Luna" gradient={`linear-gradient(135deg,${theme.secondary},#1A3028)`} onBack={onBack}/>
      <div style={{ padding:"24px 20px 32px", display:"flex", flexDirection:"column", gap:16 }}>
        <div>
          <label style={{ fontSize:12, fontWeight:700, color:theme.textMuted, letterSpacing:0.5, textTransform:"uppercase", marginBottom:8, display:"block" }}>Vacuna</label>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {vaccines.map(v=>(
              <button key={v} onClick={()=>setForm(f=>({...f,name:v}))} style={{ padding:"8px 14px", borderRadius:20, border:`2px solid ${form.name===v?theme.primary:theme.border}`, background:form.name===v?`${theme.primary}15`:"#fff", color:form.name===v?theme.primary:theme.textMuted, fontWeight:700, fontSize:12, cursor:"pointer" }}>{v}</button>
            ))}
          </div>
          {form.name==="Otra"&&<input value={form.customName||""} onChange={e=>setForm(f=>({...f,customName:e.target.value}))} placeholder="Nombre de la vacuna" style={{ marginTop:10, width:"100%", background:"#fff", border:`2px solid ${theme.border}`, borderRadius:12, padding:"12px 16px", fontSize:14, fontWeight:600, color:theme.text, outline:"none", boxSizing:"border-box" }}/>}
        </div>
        <Field label="Fecha de aplicación" value={form.date} onChange={set("date")} placeholder="AAAA-MM-DD" type="text"/>
        <Field label="Próxima dosis" value={form.next} onChange={set("next")} placeholder="AAAA-MM-DD" type="text"/>
        <div>
          <label style={{ fontSize:12, fontWeight:700, color:theme.textMuted, letterSpacing:0.5, textTransform:"uppercase", marginBottom:6, display:"block" }}>Notas (opcional)</label>
          <textarea value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} placeholder="Reacciones, lote, veterinario..."
            style={{ width:"100%", background:"#fff", border:`2px solid ${theme.border}`, borderRadius:12, padding:"13px 16px", fontSize:14, fontWeight:500, color:theme.text, outline:"none", boxSizing:"border-box", resize:"none", minHeight:80, fontFamily:"inherit" }}/>
        </div>
        <div style={{ background:`${theme.accent}20`, border:`1px solid ${theme.accent}`, borderRadius:14, padding:"12px 16px" }}>
          <p style={{ fontSize:12, color:theme.text, fontWeight:600 }}>💡 Guarda el carnet físico de Luna como respaldo adicional</p>
        </div>
        <Btn label="Guardar vacuna" onClick={()=>{ onSave(form); onBack(); }}/>
        <Btn label="Cancelar" onClick={onBack} outline color={theme.textMuted}/>
      </div>
    </div>
  );
}

// ─── HOME ────────────────────────────────────────────────────────────────────
function Home({ setTab, onEditPet, onProfile }) {
  const quick=[
    { icon:"💉", label:"Vacunas", tab:1 },{ icon:"⚖️", label:"Peso", tab:1 },
    { icon:"💊", label:"Medicinas", tab:1 },{ icon:"📍", label:"Vets cerca", tab:3 },
  ];
  return (
    <div style={{ overflowY:"auto", height:"100%" }}>
      <div style={{ background:`linear-gradient(135deg,${theme.primary},${theme.primaryDark})`, padding:"48px 20px 28px", borderRadius:"0 0 32px 32px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-20, right:-20, width:120, height:120, borderRadius:"50%", background:"rgba(255,255,255,0.08)" }}/>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div>
            <p style={{ color:"rgba(255,255,255,0.75)", fontSize:13, fontWeight:600, marginBottom:2 }}>Hola, Alejo 👋</p>
            <h1 style={{ color:"#fff", fontSize:22, fontWeight:900 }}>¿Cómo está Luna hoy?</h1>
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <button style={{ background:"rgba(255,255,255,0.15)", border:"none", borderRadius:12, padding:10, cursor:"pointer" }}>
              <I.Bell c="#fff" s={20}/>
            </button>
            <button onClick={onProfile} style={{ background:"rgba(255,255,255,0.15)", border:"none", borderRadius:12, padding:10, cursor:"pointer" }}>
              <I.User c="#fff" s={20}/>
            </button>
          </div>
        </div>
        {/* Pet card */}
        <div style={{ marginTop:20, background:"rgba(255,255,255,0.15)", borderRadius:20, padding:"16px 20px", display:"flex", alignItems:"center", gap:16 }}>
          <div style={{ width:56, height:56, borderRadius:18, background:"rgba(255,255,255,0.25)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28 }}>🐱</div>
          <div style={{ flex:1 }}>
            <h2 style={{ color:"#fff", fontSize:18, fontWeight:800, marginBottom:2 }}>Luna</h2>
            <p style={{ color:"rgba(255,255,255,0.75)", fontSize:13 }}>Gata · Siamés · 4 años</p>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:8, alignItems:"flex-end" }}>
            <div style={{ background:theme.success, borderRadius:10, padding:"4px 10px" }}>
              <span style={{ color:"#fff", fontSize:10, fontWeight:700 }}>Al día gracias a ti ✓</span>
            </div>
            <button onClick={onEditPet} style={{ background:"rgba(255,255,255,0.2)", border:"none", borderRadius:8, padding:"4px 10px", cursor:"pointer", display:"flex", alignItems:"center", gap:4 }}>
              <I.Edit c="#fff" s={12}/><span style={{ color:"#fff", fontSize:11, fontWeight:700 }}>Editar</span>
            </button>
          </div>
        </div>
      </div>

      <div style={{ padding:"20px 16px" }}>
        <div style={{ background:`${theme.accent}22`, border:`1.5px solid ${theme.accent}`, borderRadius:16, padding:"14px 16px", marginBottom:20, display:"flex", alignItems:"center", gap:14, cursor:"pointer" }}>
          <div style={{ width:40, height:40, background:theme.accent, borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>💉</div>
          <div style={{ flex:1 }}>
            <p style={{ fontSize:11, fontWeight:700, color:theme.textMuted, textTransform:"uppercase", letterSpacing:0.5 }}>Próxima vacuna</p>
            <p style={{ fontSize:14, fontWeight:800, color:theme.text }}>Antirrábica</p>
            <p style={{ fontSize:12, color:theme.textMuted }}>15 Jun 2025 · en 36 días</p>
          </div>
          <I.ChevR/>
        </div>

        <h3 style={{ fontSize:14, fontWeight:800, color:theme.text, marginBottom:12, textTransform:"uppercase", letterSpacing:0.5 }}>Acceso rápido</h3>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:10, marginBottom:24 }}>
          {quick.map(a=>(
            <button key={a.label} onClick={()=>setTab(a.tab)} style={{ background:"#fff", border:`1.5px solid ${theme.border}`, borderRadius:16, padding:"14px 8px", display:"flex", flexDirection:"column", alignItems:"center", gap:8, cursor:"pointer", boxShadow:"0 2px 8px rgba(0,0,0,0.04)" }}>
              <span style={{ fontSize:24 }}>{a.icon}</span>
              <span style={{ fontSize:11, fontWeight:700, color:theme.textMuted }}>{a.label}</span>
            </button>
          ))}
        </div>

        <h3 style={{ fontSize:14, fontWeight:800, color:theme.text, marginBottom:12, textTransform:"uppercase", letterSpacing:0.5 }}>Resumen de Luna</h3>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {[
            { icon:"⚖️", label:"Peso actual", value:"4.2 kg", sub:"Hace 2 semanas", color:theme.secondary },
            { icon:"💊", label:"Desparasitación", value:"Al día", sub:"Feb 2025", color:theme.success },
            { icon:"🏥", label:"Última visita vet", value:"Dr. Martínez", sub:"Ene 2025", color:theme.primary },
          ].map(item=>(
            <div key={item.label} style={{ background:"#fff", borderRadius:16, padding:"14px 16px", display:"flex", alignItems:"center", gap:14, boxShadow:"0 2px 8px rgba(0,0,0,0.04)", border:`1.5px solid ${theme.border}` }}>
              <div style={{ width:40, height:40, background:`${item.color}15`, borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>{item.icon}</div>
              <div style={{ flex:1 }}>
                <p style={{ fontSize:12, color:theme.textMuted, fontWeight:600 }}>{item.label}</p>
                <p style={{ fontSize:15, fontWeight:800, color:theme.text }}>{item.value}</p>
              </div>
              <span style={{ fontSize:11, color:theme.textLight, fontWeight:600 }}>{item.sub}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── CARTILLA ────────────────────────────────────────────────────────────────
function Cartilla({ setTab, onAddVacuna }) {
  const [activeTab,setActiveTab]=useState("vacunas");
  const [vacunas,setVacunas]=useState([
    { id:1, name:"Panleucopenia", date:"Mar 2024", next:"Mar 2025", status:"ok" },
    { id:2, name:"Rinotraqueítis", date:"Mar 2024", next:"Mar 2025", status:"ok" },
    { id:3, name:"Antirrábica", date:"Jun 2024", next:"Jun 2025", status:"pronto" },
    { id:4, name:"Leucemia felina", date:"Oct 2023", next:"Oct 2024", status:"vencida" },
  ]);
  const [pesos]=useState([
    { date:"Abr 2025", value:"4.2 kg" },{ date:"Feb 2025", value:"4.0 kg" },
    { date:"Dic 2024", value:"3.8 kg" },{ date:"Oct 2024", value:"3.7 kg" },
  ]);
  const sColor={ ok:theme.success, pronto:theme.accent, vencida:theme.danger };
  const sLabel={ ok:"Al día ✓", pronto:"Próxima", vencida:"Luna necesita protección" };

  return (
    <div style={{ height:"100%", overflowY:"auto" }}>
      <div style={{ background:theme.secondary, padding:"48px 20px 24px", borderRadius:"0 0 32px 32px" }}>
        <h2 style={{ color:"#fff", fontSize:22, fontWeight:900, marginBottom:4 }}>Cartilla de Luna</h2>
        <p style={{ color:"rgba(255,255,255,0.6)", fontSize:13 }}>Historial médico digital</p>
        <div style={{ display:"flex", gap:8, marginTop:20, background:"rgba(255,255,255,0.1)", borderRadius:14, padding:4 }}>
          {["vacunas","peso","medicinas"].map(t=>(
            <button key={t} onClick={()=>setActiveTab(t)} style={{ flex:1, padding:"10px", borderRadius:10, border:"none", background:activeTab===t?"#fff":"transparent", color:activeTab===t?theme.secondary:"rgba(255,255,255,0.6)", fontWeight:700, fontSize:12, cursor:"pointer", transition:"all 0.2s" }}>
              {t==="vacunas"?"Vacunas":t==="peso"?"Peso":"Medicinas"}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding:"20px 16px" }}>
        {activeTab==="vacunas"&&(
          <>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
              <h3 style={{ fontSize:14, fontWeight:800, color:theme.text, textTransform:"uppercase", letterSpacing:0.5 }}>Vacunas</h3>
              <button onClick={onAddVacuna} style={{ background:theme.primary, border:"none", borderRadius:10, padding:"8px 14px", color:"#fff", fontSize:12, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
                <I.Plus s={14}/> Agregar
              </button>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {vacunas.map(v=>(
                <div key={v.id} style={{ background:"#fff", borderRadius:16, padding:"14px 16px", border:`1.5px solid ${v.status==="vencida"?`${theme.danger}40`:theme.border}`, boxShadow:"0 2px 8px rgba(0,0,0,0.04)" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:v.status==="vencida"?12:0 }}>
                    <div style={{ width:40, height:40, background:`${sColor[v.status]}20`, borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <I.Syringe c={sColor[v.status]} s={18}/>
                    </div>
                    <div style={{ flex:1 }}>
                      <p style={{ fontSize:14, fontWeight:800, color:theme.text, marginBottom:2 }}>{v.name}</p>
                      <p style={{ fontSize:11, color:theme.textMuted }}>Aplicada: {v.date} · Próxima: {v.next}</p>
                    </div>
                    <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                      <div style={{ background:`${sColor[v.status]}15`, borderRadius:8, padding:"4px 10px" }}>
                        <span style={{ fontSize:10, fontWeight:700, color:sColor[v.status] }}>{sLabel[v.status]}</span>
                      </div>
                      <button onClick={()=>setVacunas(vs=>vs.filter(x=>x.id!==v.id))} style={{ background:`${theme.danger}10`, border:"none", borderRadius:8, padding:6, cursor:"pointer" }}>
                        <I.Trash s={14}/>
                      </button>
                    </div>
                  </div>
                  {v.status==="vencida"&&(
                    <button onClick={()=>setTab(3)} style={{ width:"100%", background:`${theme.primary}12`, border:`1.5px solid ${theme.primary}30`, borderRadius:12, padding:"11px", color:theme.primary, fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                      📍 Encuentra una veterinaria cerca →
                    </button>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab==="peso"&&(
          <>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
              <h3 style={{ fontSize:14, fontWeight:800, color:theme.text, textTransform:"uppercase", letterSpacing:0.5 }}>Historial de peso</h3>
              <button style={{ background:theme.primary, border:"none", borderRadius:10, padding:"8px 14px", color:"#fff", fontSize:12, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
                <I.Plus s={14}/> Registrar
              </button>
            </div>
            <div style={{ background:"#fff", borderRadius:20, padding:20, marginBottom:16, border:`1.5px solid ${theme.border}` }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:16 }}>
                <div>
                  <p style={{ fontSize:12, color:theme.textMuted, fontWeight:600 }}>Peso actual</p>
                  <p style={{ fontSize:32, fontWeight:900, color:theme.secondary }}>4.2 <span style={{ fontSize:16 }}>kg</span></p>
                </div>
                <div style={{ background:`${theme.success}20`, borderRadius:10, padding:"6px 12px" }}>
                  <span style={{ fontSize:12, fontWeight:700, color:theme.success }}>↑ +0.2 kg</span>
                </div>
              </div>
              <div style={{ display:"flex", gap:4, alignItems:"flex-end", height:60 }}>
                {[3.7,3.8,4.0,4.2].map((v,i)=>(
                  <div key={i} style={{ flex:1 }}>
                    <div style={{ width:"100%", background:i===3?theme.secondary:`${theme.secondary}30`, borderRadius:6, height:`${(v/4.5)*50}px` }}/>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {pesos.map(p=>(
                <div key={p.date} style={{ background:"#fff", borderRadius:14, padding:"14px 16px", display:"flex", alignItems:"center", gap:14, border:`1.5px solid ${theme.border}` }}>
                  <div style={{ width:36, height:36, background:`${theme.secondary}15`, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <I.Weight c={theme.secondary} s={16}/>
                  </div>
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:15, fontWeight:800, color:theme.text }}>{p.value}</p>
                    <p style={{ fontSize:12, color:theme.textMuted }}>{p.date}</p>
                  </div>
                  <button style={{ background:`${theme.danger}10`, border:"none", borderRadius:8, padding:6, cursor:"pointer" }}>
                    <I.Trash s={14}/>
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab==="medicinas"&&(
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"60px 20px", gap:16 }}>
            <span style={{ fontSize:48 }}>💊</span>
            <p style={{ fontSize:16, fontWeight:800, color:theme.text }}>Sin medicamentos activos</p>
            <p style={{ fontSize:14, color:theme.textMuted, textAlign:"center" }}>Registra los medicamentos de Luna para recibir recordatorios</p>
            <Btn label="+ Agregar medicamento" onClick={()=>{}}/>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── TIP DETAIL ──────────────────────────────────────────────────────────────
function TipDetail({ tip, onBack, savedTips, setSavedTips }) {
  const isSaved=savedTips.includes(tip.id);
  return (
    <div style={{ height:"100%", overflowY:"auto", background:theme.bg }}>
      <div style={{ background:`linear-gradient(135deg,#FF8C5A,${theme.primary})`, padding:"48px 20px 28px", borderRadius:"0 0 32px 32px" }}>
        <button onClick={onBack} style={{ background:"rgba(255,255,255,0.2)", border:"none", borderRadius:12, padding:"8px 12px", cursor:"pointer", display:"flex", alignItems:"center", gap:6, marginBottom:16 }}>
          <I.ChevL s={18}/><span style={{ color:"#fff", fontSize:13, fontWeight:700 }}>Tips</span>
        </button>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
          <span style={{ fontSize:32 }}>{tip.emoji}</span>
          <span style={{ fontSize:12, fontWeight:700, color:"rgba(255,255,255,0.9)", background:"rgba(255,255,255,0.2)", padding:"4px 12px", borderRadius:20 }}>{tip.category}</span>
        </div>
        <h1 style={{ color:"#fff", fontSize:20, fontWeight:900, lineHeight:1.3, marginBottom:8 }}>{tip.title}</h1>
        <span style={{ color:"rgba(255,255,255,0.7)", fontSize:12 }}>🐾 Equipo Patitas · {tip.time}</span>
      </div>
      <div style={{ padding:"24px 20px", display:"flex", flexDirection:"column", gap:10 }}>
        {tip.detail.map((line,i)=>{
          const isSection=["✅","⚠️","☠️","🚨","📋","😴","🔍","💡","🛒","🚿","🚫","📅","📱","💧","🐟","⏱️"].some(e=>line.startsWith(e));
          const isBullet=line.startsWith("•")||/^\d\./.test(line);
          return (
            <div key={i} style={{ background:isSection?`${theme.primary}08`:isBullet?"transparent":"#fff", borderRadius:isSection?14:isBullet?0:14, padding:isSection?"12px 16px":isBullet?"2px 0 2px 16px":"14px 16px", border:isSection?`1px solid ${theme.primary}20`:isBullet?"none":`1px solid ${theme.border}` }}>
              <p style={{ fontSize:i===0?15:14, fontWeight:i===0?600:isSection?700:500, color:isSection?theme.primary:theme.text, lineHeight:1.7 }}>{line}</p>
            </div>
          );
        })}
      </div>
      <div style={{ padding:"0 20px 40px", display:"flex", gap:10 }}>
        <button onClick={()=>setSavedTips(s=>s.includes(tip.id)?s.filter(x=>x!==tip.id):[...s,tip.id])}
          style={{ flex:1, padding:"14px", borderRadius:14, border:`2px solid ${isSaved?theme.primary:theme.border}`, background:isSaved?`${theme.primary}15`:"#fff", color:isSaved?theme.primary:theme.textMuted, fontWeight:700, fontSize:14, cursor:"pointer" }}>
          {isSaved?"🔖 Guardado":"🔖 Guardar"}
        </button>
        <button style={{ flex:1, padding:"14px", borderRadius:14, border:"none", background:theme.primary, color:"#fff", fontWeight:700, fontSize:14, cursor:"pointer" }}>
          Compartir ↗
        </button>
      </div>
    </div>
  );
}

// ─── TIPS LIST ────────────────────────────────────────────────────────────────
function Tips({ savedTips, setSavedTips, onSelectTip }) {
  const [cat,setCat]=useState("Todos");
  const cats=["Todos","Alimentación","Cuidado","Higiene","Salud","🔖 Guardados"];
  const isG=cat==="🔖 Guardados";
  const filtered=isG?TIPS_DATA.filter(t=>savedTips.includes(t.id)):TIPS_DATA.filter(t=>cat==="Todos"||t.category===cat);

  return (
    <div style={{ height:"100%", overflowY:"auto" }}>
      <div style={{ background:`linear-gradient(135deg,#FF8C5A,${theme.primary})`, padding:"48px 20px 24px", borderRadius:"0 0 32px 32px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
          <h2 style={{ color:"#fff", fontSize:22, fontWeight:900 }}>Tips para Luna</h2>
          {savedTips.length>0&&(
            <button onClick={()=>setCat("🔖 Guardados")} style={{ background:"rgba(255,255,255,0.2)", border:"none", borderRadius:20, padding:"6px 14px", display:"flex", alignItems:"center", gap:6, cursor:"pointer" }}>
              <span style={{ fontSize:13 }}>🔖</span><span style={{ color:"#fff", fontSize:12, fontWeight:700 }}>{savedTips.length}</span>
            </button>
          )}
        </div>
        <p style={{ color:"rgba(255,255,255,0.75)", fontSize:13, marginBottom:16 }}>Toca un tip para leerlo completo</p>
        <div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:4 }}>
          {cats.map(c=>(
            <button key={c} onClick={()=>setCat(c)} style={{ padding:"8px 16px", borderRadius:20, border:c==="🔖 Guardados"&&cat!==c?"1.5px solid rgba(255,255,255,0.5)":"none", background:cat===c?"#fff":"rgba(255,255,255,0.2)", color:cat===c?theme.primary:"#fff", fontWeight:700, fontSize:12, cursor:"pointer", whiteSpace:"nowrap", flexShrink:0 }}>{c}</button>
          ))}
        </div>
      </div>
      <div style={{ padding:"20px 16px", display:"flex", flexDirection:"column", gap:12 }}>
        {isG&&filtered.length===0&&(
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"60px 20px", gap:12 }}>
            <span style={{ fontSize:48 }}>🔖</span>
            <p style={{ fontSize:16, fontWeight:800, color:theme.text }}>Sin tips guardados aún</p>
            <p style={{ fontSize:13, color:theme.textMuted, textAlign:"center" }}>Guarda los consejos que más te sirvan para tenerlos siempre a mano</p>
            <button onClick={()=>setCat("Todos")} style={{ background:theme.primary, color:"#fff", border:"none", borderRadius:12, padding:"12px 24px", fontSize:14, fontWeight:700, cursor:"pointer" }}>Ver todos los tips</button>
          </div>
        )}
        {filtered.map(tip=>(
          <div key={tip.id} onClick={()=>onSelectTip(tip)} style={{ background:"#fff", borderRadius:20, overflow:"hidden", border:`1.5px solid ${savedTips.includes(tip.id)?`${theme.primary}30`:theme.border}`, boxShadow:"0 2px 12px rgba(0,0,0,0.04)", cursor:"pointer" }}>
            <div style={{ padding:"16px 16px 12px" }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                <span style={{ fontSize:20 }}>{tip.emoji}</span>
                <span style={{ fontSize:11, fontWeight:700, color:theme.primary, background:`${theme.primary}15`, padding:"3px 10px", borderRadius:20 }}>{tip.category}</span>
                <span style={{ fontSize:11, color:theme.textLight, marginLeft:"auto" }}>{tip.time}</span>
              </div>
              <h3 style={{ fontSize:15, fontWeight:800, color:theme.text, marginBottom:6, lineHeight:1.3 }}>{tip.title}</h3>
              <p style={{ fontSize:13, color:theme.textMuted, lineHeight:1.5 }}>{tip.excerpt}</p>
            </div>
            <div style={{ borderTop:`1px solid ${theme.border}`, padding:"10px 16px", display:"flex", alignItems:"center", gap:16 }}>
              <button style={{ display:"flex", alignItems:"center", gap:6, background:"none", border:"none", cursor:"pointer", color:theme.textMuted, fontSize:13, fontWeight:600 }}>
                <I.Heart s={16}/> {tip.likes}
              </button>
              <button onClick={e=>{ e.stopPropagation(); setSavedTips(s=>s.includes(tip.id)?s.filter(x=>x!==tip.id):[...s,tip.id]); }}
                style={{ display:"flex", alignItems:"center", gap:6, background:"none", border:"none", cursor:"pointer", color:savedTips.includes(tip.id)?theme.primary:theme.textMuted, fontSize:13, fontWeight:700 }}>
                {savedTips.includes(tip.id)?"🔖 Guardado":"🔖 Guardar"}
              </button>
              <span style={{ marginLeft:"auto", fontSize:12, color:theme.textLight, fontWeight:600 }}>Leer más →</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── DIRECTORIO ──────────────────────────────────────────────────────────────
function Directorio() {
  return (
    <div style={{ height:"100%", overflowY:"auto" }}>
      <div style={{ background:`linear-gradient(135deg,${theme.secondary},#1A3028)`, padding:"48px 20px 24px", borderRadius:"0 0 32px 32px" }}>
        <h2 style={{ color:"#fff", fontSize:22, fontWeight:900, marginBottom:4 }}>Veterinarias cerca</h2>
        <p style={{ color:"rgba(255,255,255,0.6)", fontSize:13, marginBottom:16 }}>Usando tu ubicación actual 📍</p>
        <div style={{ background:"rgba(255,255,255,0.1)", borderRadius:14, padding:"12px 16px", display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:16 }}>🔍</span>
          <span style={{ color:"rgba(255,255,255,0.5)", fontSize:14 }}>Buscar por nombre o especialidad...</span>
        </div>
      </div>
      <div style={{ padding:"20px 16px", display:"flex", flexDirection:"column", gap:12 }}>
        <p style={{ fontSize:13, color:theme.textMuted, fontWeight:600 }}>{VETS.length} resultados encontrados</p>
        {VETS.map(v=>(
          <div key={v.id} style={{ background:"#fff", borderRadius:20, border:`1.5px solid ${theme.border}`, overflow:"hidden", boxShadow:"0 2px 12px rgba(0,0,0,0.04)" }}>
            <div style={{ padding:"16px 16px 12px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                <div style={{ flex:1 }}>
                  <h3 style={{ fontSize:14, fontWeight:800, color:theme.text, marginBottom:4 }}>{v.name}</h3>
                  <p style={{ fontSize:12, color:theme.textMuted, marginBottom:6 }}>📍 {v.address}</p>
                  <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                    <span style={{ fontSize:11, fontWeight:700, color:v.open?theme.success:theme.danger, background:v.open?`${theme.success}15`:`${theme.danger}15`, padding:"3px 10px", borderRadius:20 }}>{v.open?"● Abierto":"● Cerrado"}</span>
                    <span style={{ fontSize:11, fontWeight:600, color:theme.primary, background:`${theme.primary}15`, padding:"3px 10px", borderRadius:20 }}>{v.specialty}</span>
                  </div>
                </div>
                <div style={{ textAlign:"right", flexShrink:0, marginLeft:8 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:3, justifyContent:"flex-end" }}>
                    <I.Star s={12}/><span style={{ fontSize:13, fontWeight:800, color:theme.text }}>{v.rating}</span>
                  </div>
                  <p style={{ fontSize:11, color:theme.textMuted }}>{v.reviews} reseñas</p>
                  <p style={{ fontSize:12, fontWeight:700, color:theme.primary, marginTop:4 }}>{v.distance}</p>
                </div>
              </div>
              <p style={{ fontSize:11, color:theme.textMuted }}>🕐 {v.hours}</p>
            </div>
            <div style={{ borderTop:`1px solid ${theme.border}`, display:"flex" }}>
              <a href={`tel:${v.phone}`} style={{ flex:1, padding:"13px", background:"#fff", borderRight:`1px solid ${theme.border}`, fontSize:13, fontWeight:700, color:theme.secondary, display:"flex", alignItems:"center", justifyContent:"center", gap:6, textDecoration:"none" }}>
                📞 Llamar
              </a>
              <a href={`https://www.google.com/maps/search/?api=1&query=${v.mapsQuery}`} target="_blank" rel="noopener noreferrer" style={{ flex:1, padding:"13px", background:theme.primary, fontSize:13, fontWeight:700, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", gap:6, textDecoration:"none" }}>
                🗺️ Cómo llegar
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── PERFIL / AJUSTES ────────────────────────────────────────────────────────
function Perfil({ onBack, onLogout }) {
  const [showLogoutConfirm,setShowLogoutConfirm]=useState(false);
  const menuItems=[
    { icon:"🐾", label:"Mi mascota", sub:"Luna · Gata · Siamés", action:()=>{} },
    { icon:"🔔", label:"Notificaciones", sub:"Recordatorios de vacunas activados", action:()=>{} },
    { icon:"🔒", label:"Privacidad", sub:"Gestiona tus datos", action:()=>{} },
  ];
  return (
    <div style={{ height:"100%", overflowY:"auto", background:theme.bg }}>
      <div style={{ background:`linear-gradient(135deg,${theme.secondary},#1A3028)`, padding:"48px 20px 32px", borderRadius:"0 0 32px 32px" }}>
        <button onClick={onBack} style={{ background:"rgba(255,255,255,0.15)", border:"none", borderRadius:12, padding:"8px 12px", cursor:"pointer", display:"flex", alignItems:"center", gap:6, marginBottom:20 }}>
          <I.ChevL s={18}/><span style={{ color:"#fff", fontSize:13, fontWeight:700 }}>Inicio</span>
        </button>
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          <div style={{ width:64, height:64, borderRadius:20, background:"rgba(255,255,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28 }}>👤</div>
          <div>
            <h2 style={{ color:"#fff", fontSize:20, fontWeight:900, marginBottom:2 }}>Alejo Carmona</h2>
            <p style={{ color:"rgba(255,255,255,0.65)", fontSize:13 }}>alejo@email.com</p>
          </div>
        </div>
      </div>

      <div style={{ padding:"24px 16px", display:"flex", flexDirection:"column", gap:10 }}>
        {/* Ajustes */}
        <h3 style={{ fontSize:12, fontWeight:700, color:theme.textMuted, textTransform:"uppercase", letterSpacing:0.5, marginBottom:4 }}>Ajustes</h3>
        {menuItems.map(item=>(
          <button key={item.label} onClick={item.action} style={{ background:"#fff", border:`1.5px solid ${theme.border}`, borderRadius:16, padding:"14px 16px", display:"flex", alignItems:"center", gap:14, cursor:"pointer", textAlign:"left", boxShadow:"0 2px 8px rgba(0,0,0,0.04)" }}>
            <span style={{ fontSize:22 }}>{item.icon}</span>
            <div style={{ flex:1 }}>
              <p style={{ fontSize:14, fontWeight:800, color:theme.text, marginBottom:2 }}>{item.label}</p>
              <p style={{ fontSize:12, color:theme.textMuted }}>{item.sub}</p>
            </div>
            <I.ChevR/>
          </button>
        ))}

        {/* Acerca de */}
        <h3 style={{ fontSize:12, fontWeight:700, color:theme.textMuted, textTransform:"uppercase", letterSpacing:0.5, marginTop:8, marginBottom:4 }}>Acerca de Patitas</h3>
        <div style={{ background:"#fff", border:`1.5px solid ${theme.border}`, borderRadius:16, overflow:"hidden", boxShadow:"0 2px 8px rgba(0,0,0,0.04)" }}>
          <button style={{ width:"100%", padding:"14px 16px", display:"flex", alignItems:"center", gap:14, cursor:"pointer", background:"none", border:"none", borderBottom:`1px solid ${theme.border}`, textAlign:"left" }}>
            <div style={{ width:36, height:36, background:`${theme.secondary}15`, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <I.Info c={theme.secondary} s={18}/>
            </div>
            <div style={{ flex:1 }}>
              <p style={{ fontSize:14, fontWeight:800, color:theme.text }}>Acerca de Patitas</p>
              <p style={{ fontSize:12, color:theme.textMuted }}>Versión 1.0.0 · Hecha con 🐾 en Medellín</p>
            </div>
            <I.ChevR/>
          </button>
          <a href="mailto:hola@patitas.app" style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 16px", textDecoration:"none" }}>
            <div style={{ width:36, height:36, background:`${theme.primary}15`, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <I.Mail c={theme.primary} s={18}/>
            </div>
            <div style={{ flex:1 }}>
              <p style={{ fontSize:14, fontWeight:800, color:theme.text }}>Contáctanos</p>
              <p style={{ fontSize:12, color:theme.textMuted }}>hola@patitas.app</p>
            </div>
            <I.ChevR/>
          </a>
        </div>

        {/* Cerrar sesión */}
        <div style={{ marginTop:8 }}>
          {!showLogoutConfirm?(
            <button onClick={()=>setShowLogoutConfirm(true)} style={{ width:"100%", background:`${theme.danger}10`, border:`1.5px solid ${theme.danger}30`, borderRadius:16, padding:"14px 16px", display:"flex", alignItems:"center", justifyContent:"center", gap:10, cursor:"pointer" }}>
              <I.Logout c={theme.danger} s={18}/>
              <span style={{ fontSize:15, fontWeight:700, color:theme.danger }}>Cerrar sesión</span>
            </button>
          ):(
            <div style={{ background:`${theme.danger}08`, border:`1.5px solid ${theme.danger}30`, borderRadius:16, padding:"20px 16px", textAlign:"center" }}>
              <p style={{ fontSize:15, fontWeight:800, color:theme.text, marginBottom:6 }}>¿Seguro que quieres salir?</p>
              <p style={{ fontSize:13, color:theme.textMuted, marginBottom:16 }}>Tendrás que iniciar sesión de nuevo la próxima vez</p>
              <div style={{ display:"flex", gap:10 }}>
                <button onClick={()=>setShowLogoutConfirm(false)} style={{ flex:1, padding:"12px", borderRadius:12, border:`2px solid ${theme.border}`, background:"#fff", color:theme.textMuted, fontWeight:700, fontSize:14, cursor:"pointer" }}>Cancelar</button>
                <button onClick={onLogout} style={{ flex:1, padding:"12px", borderRadius:12, border:"none", background:theme.danger, color:"#fff", fontWeight:700, fontSize:14, cursor:"pointer" }}>Sí, salir</button>
              </div>
            </div>
          )}
        </div>

        <p style={{ textAlign:"center", fontSize:11, color:theme.textLight, marginTop:8 }}>Patitas © 2025 · Medellín, Colombia 🇨🇴</p>
      </div>
    </div>
  );
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
export default function App() {
  const [flow,setFlow]=useState("onboarding");
  const [tab,setTab]=useState(0);
  const [screen,setScreen]=useState(null); // 'editPet' | 'addVacuna' | 'perfil' | 'tipDetail'
  const [selectedTip,setSelectedTip]=useState(null);
  const [savedTips,setSavedTips]=useState([2]);

  const tabs=[
    { label:"Inicio", Icon:I.Home },{ label:"Cartilla", Icon:I.Health },
    { label:"Tips", Icon:I.Tips },{ label:"Directorio", Icon:I.Map },
  ];

  const shell=children=>(
    <div style={{ fontFamily:"'Nunito',sans-serif", background:theme.bg, height:"100vh", display:"flex", flexDirection:"column", maxWidth:390, margin:"0 auto", boxShadow:"0 0 60px rgba(0,0,0,0.15)", overflow:"hidden", position:"relative" }}>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@500;600;700;800;900&display=swap" rel="stylesheet"/>
      {children}
    </div>
  );

  if(flow==="onboarding") return shell(<Onboarding onNext={()=>setFlow("login")}/>);
  if(flow==="login") return shell(<Login onLogin={()=>setFlow("createPet")}/>);
  if(flow==="createPet") return shell(<PetForm onDone={()=>setFlow("main")}/>);

  // Overlay screens (full screen, no bottom bar)
  if(screen==="editPet") return shell(<PetForm isEdit initial={{ name:"Luna", species:"Gato", breed:"Siamés", birthdate:"2021-03-15", gender:"Hembra" }} onDone={()=>setScreen(null)}/>);
  if(screen==="addVacuna") return shell(<AddVacuna onBack={()=>setScreen(null)} onSave={()=>{}}/>);
  if(screen==="perfil") return shell(<Perfil onBack={()=>setScreen(null)} onLogout={()=>{ setFlow("login"); setScreen(null); }}/>);
  if(screen==="tipDetail"&&selectedTip) return shell(
    <TipDetail tip={selectedTip} onBack={()=>{ setScreen(null); setSelectedTip(null); }} savedTips={savedTips} setSavedTips={setSavedTips}/>
  );

  return shell(
    <>
      <div style={{ flex:1, overflowY:"auto", paddingBottom:80 }}>
        {tab===0&&<Home setTab={setTab} onEditPet={()=>setScreen("editPet")} onProfile={()=>setScreen("perfil")}/>}
        {tab===1&&<Cartilla setTab={setTab} onAddVacuna={()=>setScreen("addVacuna")}/>}
        {tab===2&&<Tips savedTips={savedTips} setSavedTips={setSavedTips} onSelectTip={tip=>{ setSelectedTip(tip); setScreen("tipDetail"); }}/>}
        {tab===3&&<Directorio/>}
      </div>
      <div style={{ position:"absolute", bottom:0, left:0, right:0, background:"#fff", borderTop:`1px solid ${theme.border}`, display:"flex", padding:"10px 0 16px", zIndex:100 }}>
        {tabs.map(({label,Icon},i)=>{
          const active=tab===i;
          return (
            <div key={label} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:3, cursor:"pointer" }} onClick={()=>setTab(i)}>
              <div style={{ width:24, height:24, display:"flex", alignItems:"center", justifyContent:"center", borderRadius:active?8:6, background:active?theme.primary:"transparent", padding:active?4:0, transition:"all 0.2s" }}>
                <Icon c={active?"#fff":theme.textMuted} s={active?16:20}/>
              </div>
              <span style={{ fontSize:10, fontWeight:active?700:500, color:active?theme.primary:theme.textMuted, letterSpacing:0.3 }}>{label}</span>
            </div>
          );
        })}
      </div>
    </>
  );
}
