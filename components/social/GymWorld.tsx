'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PublicGymPresence, socialService } from '@/services/social.service';
import AvatarSprite, { AvatarConfig, DEFAULT_AVATAR } from './AvatarSprite';

interface ExtendedPresence extends PublicGymPresence { avatarConfig?: Partial<AvatarConfig>; }

// ── Isometric math ────────────────────────────────────────────────────────────
const OX=400, OY=440;
const DLx=-34, DLy=-14, DRx=34, DRy=-14, DZy=-36;
const L=10, R=10, WH=5;
function bx(l:number,r:number){return Math.round(OX+l*DLx+r*DRx);}
function by(l:number,r:number,z=0){return Math.round(OY+l*DLy+r*DRy+z*DZy);}
function p(l:number,r:number,z=0){return `${bx(l,r)},${by(l,r,z)}`;}
function P(...pts:[number,number,number?][]){return pts.map(([l,r,z=0])=>p(l,r,z)).join(' ');}

// Avatares distribuidos por toda la sala, evitando el equipamiento
const SLOTS:[number,number][]=[
  [2,2],[2,5],[2,8],
  [4,2],[4,5],[4,8],
  [5,3],[5,6],
  [6,2],[6,7],
];

// ── Caja isométrica de 3 caras ────────────────────────────────────────────────
function Box({l,r,lw,rw,h,top,lf,rf,stroke='#0a0c10',sw=1}:{
  l:number;r:number;lw:number;rw:number;h:number;
  top:string;lf:string;rf:string;stroke?:string;sw?:number;
}){
  return(
    <g stroke={stroke} strokeWidth={sw} strokeLinejoin="miter">
      <polygon points={P([l,r],[l+lw,r],[l+lw,r,h],[l,r,h])}            fill={lf}/>
      <polygon points={P([l,r],[l,r+rw],[l,r+rw,h],[l,r,h])}            fill={rf}/>
      <polygon points={P([l,r,h],[l+lw,r,h],[l+lw,r+rw,h],[l,r+rw,h])} fill={top}/>
    </g>
  );
}

// ── Panel de perfil ───────────────────────────────────────────────────────────
function ProfilePanel({profile,onClose}:{profile:ExtendedPresence;onClose:()=>void}){
  const cfg:AvatarConfig={...DEFAULT_AVATAR,...profile.avatarConfig};
  const isAnon=profile.socialVisibility==='anonymous';
  return(
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
      className="fixed inset-0 z-[90] flex items-end md:items-center justify-center p-4" role="dialog" aria-modal="true">
      <button className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose}/>
      <motion.div initial={{scale:0.9,y:24}} animate={{scale:1,y:0}} exit={{scale:0.9,y:24}}
        className="relative w-full max-w-sm border-2 border-[#00d8ff] bg-[#0d1117] p-6"
        style={{fontFamily:'monospace',boxShadow:'4px 4px 0 #00d8ff'}}>
        <button onClick={onClose}
          className="absolute top-3 right-3 w-7 h-7 border border-[#00d8ff] text-[#00d8ff] flex items-center justify-center text-xs font-bold hover:bg-[#00d8ff] hover:text-black transition-colors">
          X
        </button>
        <div className="flex flex-col items-center gap-3 pt-1">
          <AvatarSprite config={cfg} size={64} isAnonymous={isAnon}/>
          <div className="text-center">
            <p className="text-[9px] uppercase tracking-[0.3em] text-[#00d8ff] font-bold mb-1">▶ ENTRENANDO AHORA</p>
            <h3 className="text-xl font-bold uppercase tracking-wider text-white">{profile.displayName}</h3>
            {profile.instagram&&<p className="text-[10px] tracking-widest text-[#00d8ff] mt-1">{profile.instagram}</p>}
          </div>
        </div>
        {profile.publicBio&&(
          <p className="mt-4 text-xs text-[#8090a0] leading-relaxed text-center border-t border-[#00d8ff30] pt-4">
            {profile.publicBio}
          </p>
        )}
        {typeof profile.currentStreak==='number'&&profile.currentStreak>0&&(
          <div className="mt-4 border border-[#f0600030] bg-[#f060000a] p-3 flex items-center gap-3">
            <span className="text-2xl">🔥</span>
            <div>
              <p className="text-[8px] uppercase tracking-widest text-[#8090a0]">RACHA</p>
              <p className="text-2xl font-bold text-[#f06020]">{profile.currentStreak} DÍAS</p>
            </div>
          </div>
        )}
        {isAnon&&<p className="mt-4 text-xs text-[#8090a0] italic text-center">Socio anónimo.</p>}
      </motion.div>
    </motion.div>
  );
}

export default function GymWorld(){
  const [profiles,setProfiles]=useState<ExtendedPresence[]>([]);
  const [loading,setLoading]=useState(true);
  const [selected,setSelected]=useState<ExtendedPresence|null>(null);

  useEffect(()=>{
    const unsub=socialService.getPublicGymPresence(data=>{
      setProfiles(data as ExtendedPresence[]);
      setLoading(false);
    });
    return unsub;
  },[]);

  const isEmpty=!loading&&profiles.length===0;
  const sorted=[...profiles]
    .map((profile,i)=>({profile,slot:SLOTS[i%SLOTS.length]}))
    .sort((a,b)=>(b.slot[0]+b.slot[1])-(a.slot[0]+a.slot[1]));

  // ── Paleta de colores vibrante ─────────────────────────────────────────────
  const C={
    // Piso — madera oscura cálida
    floor:   '#2c1f0e', floorAlt: '#3a2a14', floorLine:'#4a3820',
    // Paredes — gris concreto medio (MUCHO más claro que el piso)
    wallL:   '#5e6472', wallLd:  '#4e5460', wallLhi: '#72788a',
    wallR:   '#545866', wallRd:  '#444858', wallRhi: '#686e80',
    mortar:  '#3e4250',
    // Metales — plateado cromado real
    metal:   '#7292a8', metalD:  '#526878', metalL:  '#8caabe', metalHi:'#aec8da',
    // Discos de pesas — naranja-rojo vivo
    plate:   '#e04000', plateL:  '#ff5010', plateD:  '#922800',
    // Discos azules
    plateB:  '#1858d0', plateBL: '#2070ec', plateBD: '#0c3890',
    // Banco — azul profundo
    bench:   '#162888', benchL:  '#2440b0', benchD:  '#0e1a60',
    // Pantallas
    neon:    '#00d8ff', neonD:   '#004c6a',
    neonG:   '#00cc88', neonGd:  '#003d28',
    // Colores de mancuernas por peso
    db5:     '#1e6ee0', db5d:    '#0e3e90',
    db10:    '#20b048', db10d:   '#107028',
    db15:    '#d8c000', db15d:   '#806000',
    db20:    '#e84000', db20d:   '#902000',
    db25:    '#cc1830', db25d:   '#800010',
    db30:    '#303030', db30d:   '#101010',
    outline: '#0a0c10',
  };

  const nearX=bx(0,0), nearY=by(0,0);
  const leftX=bx(L,0), leftY=by(L,0);
  const rightX=bx(0,R), rightY=by(0,R);
  const nearTopY=by(0,0,WH);
  const leftTopY=by(L,0,WH);
  const rightTopY=by(0,R,WH);

  // Mancuernas en pared derecha: silhouette en espacio de pantalla
  const wallDumbbells=[
    {r:1.2, color:C.db5,  dk:C.db5d},
    {r:2.6, color:C.db10, dk:C.db10d},
    {r:4.0, color:C.db15, dk:C.db15d},
    {r:5.4, color:C.db20, dk:C.db20d},
    {r:6.8, color:C.db25, dk:C.db25d},
    {r:8.2, color:C.db30, dk:C.db30d},
  ];

  return(
    <div className="space-y-3 animate-in fade-in duration-500">
      {/* Encabezado */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="font-headline text-3xl font-black uppercase tracking-tight">Comunidad en el gym</h2>
          <p className="mt-1 text-sm text-tertiary" style={{fontFamily:'monospace'}}>
            {loading?'CONECTANDO...'
              :profiles.length===0?'SALA VACÍA'
              :`${profiles.length} SOCIO${profiles.length!==1?'S':''} ENTRENANDO`}
          </p>
        </div>
        {profiles.length>0&&(
          <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-widest text-[#00d8ff]">
            <div className="w-2 h-2 bg-[#00d8ff] animate-pulse"/>EN VIVO
          </div>
        )}
      </div>

      {/* Sala isométrica */}
      <div className="relative w-full overflow-hidden"
        style={{background:'#080c14',border:'2px solid #1e2840',boxShadow:'4px 4px 0 #0d1220',aspectRatio:'800/500'}}>
        <svg viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg"
          shapeRendering="crispEdges" className="absolute inset-0 w-full h-full block"
          style={{imageRendering:'pixelated'}}>

          {/* ── PISO ──────────────────────────────────────────────────────── */}
          <polygon points={P([0,0],[L,0],[L,R],[0,R])} fill={C.floor} stroke={C.outline} strokeWidth="1"/>
          {/* Grilla de pisos de madera */}
          {[0,1,2,3,4,5,6,7,8,9,10].map(r=>(
            <line key={`fl${r}`} x1={bx(0,r)} y1={by(0,r)} x2={bx(L,r)} y2={by(L,r)}
              stroke={C.floorLine} strokeWidth={r%2===0?1.5:0.8}/>
          ))}
          {[0,2,4,6,8,10].map(l=>(
            <line key={`fr${l}`} x1={bx(l,0)} y1={by(l,0)} x2={bx(l,R)} y2={by(l,R)}
              stroke={C.floorAlt} strokeWidth="0.8"/>
          ))}
          {/* Mat central de goma negra */}
          <polygon points={P([2,2],[7,2],[7,8],[2,8])} fill="#1a1410" stroke={C.floorLine} strokeWidth="1" opacity="0.7"/>
          {/* Logo en el mat */}
          <polygon points={P([4,4],[5,4],[5,6],[4,6])} fill="#2a1e08" stroke={C.floorLine} strokeWidth="0.5" opacity="0.8"/>

          {/* ── PARED IZQUIERDA ───────────────────────────────────────────── */}
          <polygon points={`${nearX},${nearY} ${leftX},${leftY} ${leftX},${leftTopY} ${nearX},${nearTopY}`}
            fill={C.wallL} stroke={C.outline} strokeWidth="1"/>
          {/* Líneas horizontales de mampostería */}
          {[1,2,3,4].map(z=>(
            <line key={`lz${z}`} x1={bx(0,0)} y1={by(0,0,z)} x2={bx(L,0)} y2={by(L,0,z)}
              stroke={C.mortar} strokeWidth="2.5"/>
          ))}
          {/* Juntas verticales escalonadas */}
          {[0,1,2,3].map(z=>
            [1.5,3.5,5.5,7.5,9.5].map(l=>(
              <line key={`lv${z}${l}`}
                x1={bx(l+(z%2*1),0)} y1={by(l+(z%2*1),0,z)}
                x2={bx(l+(z%2*1),0)} y2={by(l+(z%2*1),0,z+1)}
                stroke={C.mortar} strokeWidth="1.5"/>
            ))
          )}
          {/* Franja de highlight superior */}
          <polygon points={`${bx(0,0)},${by(0,0,4.6)} ${bx(L,0)},${by(L,0,4.6)} ${bx(L,0)},${by(L,0,WH)} ${bx(0,0)},${by(0,0,WH)}`}
            fill={C.wallLhi} opacity="0.4"/>
          {/* Espejos en pared izquierda (3 paneles grandes) */}
          {([[0.4,2.8,0.6,4.2],[3.2,6.0,0.6,4.2],[6.4,9.6,0.6,4.2]] as [number,number,number,number][])
            .map(([l1,l2,z1,z2],mi)=>(
            <g key={mi}>
              <polygon
                points={`${bx(l1,0)},${by(l1,0,z1)} ${bx(l2,0)},${by(l2,0,z1)} ${bx(l2,0)},${by(l2,0,z2)} ${bx(l1,0)},${by(l1,0,z2)}`}
                fill="#2a4e72" stroke="#5088b8" strokeWidth="2"/>
              {/* Reflejo */}
              <polygon
                points={`${bx(l1,0)},${by(l1,0,z1)} ${bx(l1+0.5,0)},${by(l1+0.5,0,z1)} ${bx(l1+0.5,0)},${by(l1+0.5,0,z2)} ${bx(l1,0)},${by(l1,0,z2)}`}
                fill="white" opacity="0.12"/>
              {/* Marco */}
              <polygon
                points={`${bx(l1,0)},${by(l1,0,z1)} ${bx(l2,0)},${by(l2,0,z1)} ${bx(l2,0)},${by(l2,0,z2)} ${bx(l1,0)},${by(l1,0,z2)}`}
                fill="none" stroke="#6090c0" strokeWidth="1.5"/>
            </g>
          ))}

          {/* ── PARED DERECHA ─────────────────────────────────────────────── */}
          <polygon points={`${nearX},${nearY} ${rightX},${rightY} ${rightX},${rightTopY} ${nearX},${nearTopY}`}
            fill={C.wallR} stroke={C.outline} strokeWidth="1"/>
          {[1,2,3,4].map(z=>(
            <line key={`rz${z}`} x1={bx(0,0)} y1={by(0,0,z)} x2={bx(0,R)} y2={by(0,R,z)}
              stroke={C.mortar} strokeWidth="2.5"/>
          ))}
          {[0,1,2,3].map(z=>
            [1.5,3.5,5.5,7.5,9.5].map(r=>(
              <line key={`rv${z}${r}`}
                x1={bx(0,r+(z%2*1))} y1={by(0,r+(z%2*1),z)}
                x2={bx(0,r+(z%2*1))} y2={by(0,r+(z%2*1),z+1)}
                stroke={C.mortar} strokeWidth="1.5"/>
            ))
          )}
          {/* Highlight superior */}
          <polygon points={`${bx(0,0)},${by(0,0,4.6)} ${bx(0,R)},${by(0,R,4.6)} ${bx(0,R)},${by(0,R,WH)} ${bx(0,0)},${by(0,0,WH)}`}
            fill={C.wallRhi} opacity="0.4"/>

          {/* Cartel del gym en pared derecha */}
          <polygon
            points={`${bx(0,3.5)},${by(0,3.5,3.2)} ${bx(0,7.0)},${by(0,7.0,3.2)} ${bx(0,7.0)},${by(0,7.0,4.1)} ${bx(0,3.5)},${by(0,3.5,4.1)}`}
            fill={C.neonD} stroke={C.neon} strokeWidth="2"/>
          <text x={bx(0,5.25)} y={by(0,5.25,3.65)+4}
            textAnchor="middle" fontSize="12" fontWeight="bold"
            fontFamily="monospace" letterSpacing="4" fill={C.neon}>GYM</text>

          {/* Rack de mancuernas en pared derecha */}
          {/* Barras horizontales del rack */}
          {[0.45, 1.15, 1.85].map(z=>(
            <line key={`rackbar${z}`}
              x1={bx(0,0.8)} y1={by(0,0.8,z)}
              x2={bx(0,9.2)} y2={by(0,9.2,z)}
              stroke={C.metalHi} strokeWidth="4"/>
          ))}
          {/* Soportes verticales del rack */}
          {[0.9,5.0,9.0].map(r=>(
            <line key={`racksup${r}`}
              x1={bx(0,r)} y1={by(0,r,0)}
              x2={bx(0,r)} y2={by(0,r,2.2)}
              stroke={C.metalL} strokeWidth="3"/>
          ))}
          {/* Mancuernas: silhouette en posición isométrica de pared */}
          {wallDumbbells.flatMap(({r,color,dk})=>
            ([0.12, 0.82, 1.52] as number[]).map((z)=>{
              const cx=bx(0,r);
              const cy=by(0,r,z);
              // Silueta de halter: cabeza-mango-cabeza horizontalmente en pantalla
              const dx=10; // ancho de cada cabeza
              const hh=7;  // semi-alto de cabeza
              const hx=3;  // ancho del mango
              const hy=3;  // semi-alto del mango
              return(
                <g key={`db${r}-${z}`}>
                  {/* Cabeza 1 */}
                  <rect x={cx-dx-hx} y={cy-hh} width={dx} height={hh*2} fill={color} stroke={C.outline} strokeWidth="0.8"/>
                  <rect x={cx-dx-hx+1} y={cy-hh+1} width={3} height={4} fill="white" opacity="0.15"/>
                  {/* Mango */}
                  <rect x={cx-hx} y={cy-hy} width={hx*2} height={hy*2} fill={C.metalL} stroke={C.outline} strokeWidth="0.6"/>
                  {/* Cabeza 2 */}
                  <rect x={cx+hx} y={cy-hh} width={dx} height={hh*2} fill={color} stroke={C.outline} strokeWidth="0.8"/>
                  <rect x={cx+hx+1} y={cy-hh+1} width={3} height={4} fill="white" opacity="0.15"/>
                </g>
              );
            })
          )}

          {/* Reloj en pared derecha */}
          <ellipse cx={bx(0,9)} cy={by(0,9,3.0)} rx={16} ry={9} fill="#1a1e2e" stroke={C.metalL} strokeWidth="2"/>
          <ellipse cx={bx(0,9)} cy={by(0,9,3.0)} rx={11} ry={6} fill="#0d1020"/>
          <line x1={bx(0,9)} y1={by(0,9,3.0)} x2={bx(0,9)} y2={by(0,9,3.0)-5} stroke={C.neon} strokeWidth="1.2"/>
          <line x1={bx(0,9)} y1={by(0,9,3.0)} x2={bx(0,9)+4} y2={by(0,9,3.0)+1} stroke={C.metalHi} strokeWidth="1"/>
          <ellipse cx={bx(0,9)} cy={by(0,9,3.0)} rx={2} ry={1} fill={C.metalHi}/>

          {/* ── BORDE Y LUCES DE TECHO ─────────────────────────────────────── */}
          <line x1={bx(0,0)} y1={by(0,0,WH)} x2={bx(L,0)} y2={by(L,0,WH)} stroke={C.wallLhi} strokeWidth="2"/>
          <line x1={bx(0,0)} y1={by(0,0,WH)} x2={bx(0,R)} y2={by(0,R,WH)} stroke={C.wallRhi} strokeWidth="2"/>
          {/* Tiras de neon en techo */}
          <line x1={bx(2,1)} y1={by(2,1,4.92)} x2={bx(2,9)} y2={by(2,9,4.92)} stroke={C.neon} strokeWidth="3" opacity="0.8"/>
          <line x1={bx(8,1)} y1={by(8,1,4.92)} x2={bx(8,9)} y2={by(8,9,4.92)} stroke={C.neon} strokeWidth="3" opacity="0.8"/>
          <line x1={bx(2,1)} y1={by(2,1,4.92)} x2={bx(8,1)} y2={by(8,1,4.92)} stroke={C.neon} strokeWidth="3" opacity="0.5"/>
          <line x1={bx(2,9)} y1={by(2,9,4.92)} x2={bx(8,9)} y2={by(8,9,4.92)} stroke={C.neon} strokeWidth="3" opacity="0.5"/>

          {/* ── EQUIPAMIENTO (back → front para z-order correcto) ───────── */}

          {/* === RACK DE SENTADILLAS IZQUIERDO (l=8-10, r=1.5-4) === */}
          {/* Posts traseros */}
          <Box l={9.5} r={1.8} lw={0.35} rw={0.35} h={4.5} top={C.metalHi} lf={C.metalL} rf={C.metal}/>
          <Box l={9.5} r={3.4} lw={0.35} rw={0.35} h={4.5} top={C.metalHi} lf={C.metalL} rf={C.metal}/>
          {/* Posts delanteros */}
          <Box l={8.0} r={1.8} lw={0.35} rw={0.35} h={4.5} top={C.metalHi} lf={C.metalL} rf={C.metal}/>
          <Box l={8.0} r={3.4} lw={0.35} rw={0.35} h={4.5} top={C.metalHi} lf={C.metalL} rf={C.metal}/>
          {/* Barra superior */}
          <Box l={8.0} r={1.8} lw={1.85} rw={0.18} h={4.6} top={C.metalL} lf={C.metalHi} rf={C.metal}/>
          <Box l={8.0} r={3.4} lw={1.85} rw={0.18} h={4.6} top={C.metalL} lf={C.metalHi} rf={C.metal}/>
          {/* Barra de seguridad */}
          <Box l={8.0} r={1.8} lw={1.85} rw={0.18} h={2.4} top={C.metalL} lf={C.metalHi} rf={C.metal}/>
          {/* Barra olímpica */}
          <Box l={8.2} r={1.2} lw={1.4} rw={2.8} h={3.0} top={C.metalHi} lf={C.metalL} rf={C.metal}/>
          {/* Discos naranja */}
          <Box l={8.2} r={1.2} lw={0.18} rw={0.7} h={3.55} top={C.plateL} lf={C.plate} rf={C.plateD}/>
          <Box l={9.4} r={1.2} lw={0.18} rw={0.7} h={3.55} top={C.plateL} lf={C.plate} rf={C.plateD}/>
          <Box l={8.2} r={3.3} lw={0.18} rw={0.7} h={3.55} top={C.plateL} lf={C.plate} rf={C.plateD}/>
          <Box l={9.4} r={3.3} lw={0.18} rw={0.7} h={3.55} top={C.plateL} lf={C.plate} rf={C.plateD}/>

          {/* === RACK DE SENTADILLAS DERECHO (l=8-10, r=6-8.5) === */}
          <Box l={9.5} r={6.2} lw={0.35} rw={0.35} h={4.5} top={C.metalHi} lf={C.metalL} rf={C.metal}/>
          <Box l={9.5} r={7.8} lw={0.35} rw={0.35} h={4.5} top={C.metalHi} lf={C.metalL} rf={C.metal}/>
          <Box l={8.0} r={6.2} lw={0.35} rw={0.35} h={4.5} top={C.metalHi} lf={C.metalL} rf={C.metal}/>
          <Box l={8.0} r={7.8} lw={0.35} rw={0.35} h={4.5} top={C.metalHi} lf={C.metalL} rf={C.metal}/>
          <Box l={8.0} r={6.2} lw={1.85} rw={0.18} h={4.6} top={C.metalL} lf={C.metalHi} rf={C.metal}/>
          <Box l={8.0} r={7.8} lw={1.85} rw={0.18} h={4.6} top={C.metalL} lf={C.metalHi} rf={C.metal}/>
          <Box l={8.2} r={5.6} lw={1.4} rw={2.8} h={3.0} top={C.metalHi} lf={C.metalL} rf={C.metal}/>
          {/* Discos azules */}
          <Box l={8.2} r={5.6} lw={0.18} rw={0.7} h={3.55} top={C.plateBL} lf={C.plateB} rf={C.plateBD}/>
          <Box l={9.4} r={5.6} lw={0.18} rw={0.7} h={3.55} top={C.plateBL} lf={C.plateB} rf={C.plateBD}/>
          <Box l={8.2} r={7.7} lw={0.18} rw={0.7} h={3.55} top={C.plateBL} lf={C.plateB} rf={C.plateBD}/>
          <Box l={9.4} r={7.7} lw={0.18} rw={0.7} h={3.55} top={C.plateBL} lf={C.plateB} rf={C.plateBD}/>

          {/* === BANCO DE PRESS (l=6-8, r=4-6) === */}
          {/* Estructura del banco */}
          <Box l={6.0} r={4.0} lw={2.2} rw={2.0} h={0.9} top={C.metal} lf={C.metalD} rf={C.metalD}/>
          {/* Pad azul */}
          <Box l={6.1} r={4.1} lw={2.0} rw={1.8} h={1.05} top={C.benchL} lf={C.bench} rf={C.benchD}/>
          {/* Posts del banco */}
          <Box l={6.2} r={4.2} lw={0.22} rw={0.22} h={2.2} top={C.metalHi} lf={C.metalL} rf={C.metal}/>
          <Box l={7.6} r={4.2} lw={0.22} rw={0.22} h={2.2} top={C.metalHi} lf={C.metalL} rf={C.metal}/>
          {/* Barra y soportes del banco */}
          <Box l={6.2} r={4.2} lw={1.6} rw={0.18} h={2.25} top={C.metalL} lf={C.metalHi} rf={C.metal}/>
          {/* Barra olímpica */}
          <Box l={6.3} r={3.6} lw={1.4} rw={2.8} h={1.65} top={C.metalHi} lf={C.metalL} rf={C.metal}/>
          {/* Discos */}
          <Box l={6.3} r={3.6} lw={0.15} rw={0.55} h={2.1} top={C.plateL} lf={C.plate} rf={C.plateD}/>
          <Box l={7.6} r={3.6} lw={0.15} rw={0.55} h={2.1} top={C.plateL} lf={C.plate} rf={C.plateD}/>
          <Box l={6.3} r={5.85} lw={0.15} rw={0.55} h={2.1} top={C.plateL} lf={C.plate} rf={C.plateD}/>
          <Box l={7.6} r={5.85} lw={0.15} rw={0.55} h={2.1} top={C.plateL} lf={C.plate} rf={C.plateD}/>

          {/* === MÁQUINA DE CABLE (l=7-9, r=1-3) === */}
          {/* Cuerpo */}
          <Box l={7.3} r={0.8} lw={1.8} rw={2.2} h={3.8} top={C.metalL} lf={C.metal} rf={C.metalD}/>
          {/* Pantalla LED */}
          <polygon
            points={`${bx(7.5,0.8)},${by(7.5,0.8,2.6)} ${bx(8.9,0.8)},${by(8.9,0.8,2.6)} ${bx(8.9,0.8)},${by(8.9,0.8,3.4)} ${bx(7.5,0.8)},${by(7.5,0.8,3.4)}`}
            fill={C.neonGd} stroke={C.neonG} strokeWidth="1.5"/>
          <line x1={bx(7.7,0.8)} y1={by(7.7,0.8,2.85)} x2={bx(8.7,0.8)} y2={by(8.7,0.8,2.85)} stroke={C.neonG} strokeWidth="1" opacity="0.7"/>
          <line x1={bx(7.7,0.8)} y1={by(7.7,0.8,3.05)} x2={bx(8.3,0.8)} y2={by(8.3,0.8,3.05)} stroke={C.neonG} strokeWidth="1" opacity="0.5"/>
          {/* Polea */}
          <ellipse cx={bx(8.2,2)} cy={by(8.2,2,3.9)} rx={9} ry={5} fill={C.metalHi} stroke={C.outline} strokeWidth="0.8"/>
          <ellipse cx={bx(8.2,2)} cy={by(8.2,2,3.9)} rx={4} ry={2} fill={C.metal}/>

          {/* === CINTAS CAMINADORAS (l=1-3, r=4.5-9) === */}
          {/* Cinta 1 (r=7-9) */}
          <Box l={1.0} r={7.0} lw={2.2} rw={2.2} h={1.5} top={C.metal} lf={C.metalD} rf={C.metalD}/>
          {/* Belt */}
          <polygon points={P([1.1,7.1,1.52],[2.9,7.1,1.52],[2.9,9.0,1.52],[1.1,9.0,1.52])} fill="#0d0d18"/>
          {/* Upright posts */}
          <Box l={1.2} r={7.0} lw={0.18} rw={0.12} h={3.2} top={C.metalHi} lf={C.metalL} rf={C.metal}/>
          <Box l={2.7} r={7.0} lw={0.18} rw={0.12} h={3.2} top={C.metalHi} lf={C.metalL} rf={C.metal}/>
          <Box l={1.2} r={7.0} lw={1.7} rw={0.12} h={3.1} top={C.metalL} lf={C.metalHi} rf={C.metal}/>
          {/* Pantalla verde */}
          <polygon
            points={`${bx(1.6,7.0)},${by(1.6,7.0,2.8)} ${bx(2.4,7.0)},${by(2.4,7.0,2.8)} ${bx(2.4,7.0)},${by(2.4,7.0,3.05)} ${bx(1.6,7.0)},${by(1.6,7.0,3.05)}`}
            fill={C.neonGd} stroke={C.neonG} strokeWidth="1.2"/>

          {/* Cinta 2 (r=4.5-6.8) */}
          <Box l={1.0} r={4.5} lw={2.2} rw={2.2} h={1.5} top={C.metal} lf={C.metalD} rf={C.metalD}/>
          <polygon points={P([1.1,4.6,1.52],[2.9,4.6,1.52],[2.9,6.5,1.52],[1.1,6.5,1.52])} fill="#0d0d18"/>
          <Box l={1.2} r={4.5} lw={0.18} rw={0.12} h={3.2} top={C.metalHi} lf={C.metalL} rf={C.metal}/>
          <Box l={2.7} r={4.5} lw={0.18} rw={0.12} h={3.2} top={C.metalHi} lf={C.metalL} rf={C.metal}/>
          <Box l={1.2} r={4.5} lw={1.7} rw={0.12} h={3.1} top={C.metalL} lf={C.metalHi} rf={C.metal}/>
          <polygon
            points={`${bx(1.6,4.5)},${by(1.6,4.5,2.8)} ${bx(2.4,4.5)},${by(2.4,4.5,2.8)} ${bx(2.4,4.5)},${by(2.4,4.5,3.05)} ${bx(1.6,4.5)},${by(1.6,4.5,3.05)}`}
            fill={C.neonGd} stroke={C.neonG} strokeWidth="1.2"/>

          {/* === ENFRIADOR DE AGUA (l=9, r=9) === */}
          <Box l={9.2} r={8.8} lw={0.6} rw={0.9} h={2.0} top="#60b8e0" lf="#38a0d0" rf="#1880b0"/>
          <Box l={9.25} r={8.85} lw={0.5} rw={0.8} h={2.7} top="#c8ecff" lf="#90d8f8" rf="#68c0e8"/>

          {/* === RACK DE DISCOS DE PISO (l=9-10, r=0.5-9) === */}
          <Box l={9.1} r={0.4} lw={0.8} rw={9.0} h={0.8} top={C.metal} lf={C.metalD} rf={C.metalD}/>
          {/* Discos en el rack de piso */}
          {([
            [0.8, C.plateBL, C.plateB, C.plateBD],
            [1.8, C.plateBL, C.plateB, C.plateBD],
            [2.8, C.plateBL, C.plateB, C.plateBD],
            [4.0, C.plateL,  C.plate,  C.plateD],
            [5.0, C.plateL,  C.plate,  C.plateD],
            [6.0, C.plateL,  C.plate,  C.plateD],
            [7.2, C.neonG,   '#20a050','#105020'],
            [8.2, C.neonG,   '#20a050','#105020'],
          ] as [number,string,string,string][]).map(([ri,topC,lfC,rfC],i)=>(
            <Box key={i} l={9.2} r={ri} lw={0.6} rw={0.6} h={1.6} top={topC} lf={lfC} rf={rfC}/>
          ))}

          {/* Discos en el piso (sueltos) */}
          {([[7.5,3.2],[7.0,4.8],[7.8,5.5]] as [number,number][]).map(([l,r],i)=>(
            <g key={i}>
              <ellipse cx={bx(l,r)} cy={by(l,r,0.1)} rx={15} ry={7}
                fill={i===0?C.plate:C.plateB} stroke={C.outline} strokeWidth="0.8"/>
              <ellipse cx={bx(l,r)} cy={by(l,r,0.1)} rx={5} ry={2.5} fill={C.outline} opacity="0.6"/>
            </g>
          ))}

          {/* Sombras de avatares en el piso */}
          {!loading&&sorted.map(({profile,slot})=>{
            const [sl,sr]=slot;
            return(
              <ellipse key={profile.id}
                cx={bx(sl,sr)} cy={by(sl,sr,0)+4}
                rx={22} ry={9} fill="black" opacity="0.45"/>
            );
          })}
        </svg>

        {/* ── OVERLAY DE AVATARES (divs absolutos, no foreignObject) ─────────── */}
        {!loading&&sorted.map(({profile,slot},idx)=>{
          const [sl,sr]=slot;
          const ax=bx(sl,sr), ay=by(sl,sr,0);
          const cfg:AvatarConfig={...DEFAULT_AVATAR,...profile.avatarConfig};
          const isAnon=profile.socialVisibility==='anonymous';
          const isSel=selected?.id===profile.id;
          return(
            <button
              key={profile.id}
              onClick={()=>setSelected(isSel?null:profile)}
              className="absolute focus:outline-none"
              style={{
                left:`${(ax/800)*100}%`,
                top:`${(ay/500)*100}%`,
                transform:'translate(-50%,-100%)',
                zIndex:10+idx,
                display:'flex',
                flexDirection:'column',
                alignItems:'center',
                gap:2,
                cursor:'pointer',
                background:'none',
                border:'none',
                padding:0,
              }}
              aria-label={`Ver perfil de ${profile.displayName}`}
            >
              {/* Etiqueta de nombre pixel-art */}
              <div style={{
                background: isSel?C.neon:'rgba(8,12,20,0.88)',
                color: isSel?'#080c14':'#d8e8f0',
                border:`1px solid ${isSel?C.neon:'#00d8ff30'}`,
                padding:'1px 6px',
                fontFamily:'monospace',
                fontSize:9,
                fontWeight:'bold',
                letterSpacing:1,
                textTransform:'uppercase',
                whiteSpace:'nowrap',
                boxShadow: isSel?`2px 2px 0 #004c6a, 0 0 8px ${C.neon}60`:undefined,
              }}>
                {isAnon?'???':profile.displayName.split(' ')[0]}
              </div>
              <AvatarSprite config={cfg} size={48} isAnonymous={isAnon} isSelected={isSel}/>
            </button>
          );
        })}

        {isEmpty&&(
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/50">
            <div style={{fontFamily:'monospace',textAlign:'center'}}>
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#00d8ff] mb-2">▶ SALA VACÍA</p>
              <p className="text-xs text-[#4a5a70]">Activá tu visibilidad en tu perfil</p>
              <p className="text-xs text-[#4a5a70]">para aparecer aquí mientras entrenás.</p>
            </div>
          </div>
        )}
        {loading&&(
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div className="w-6 h-6 border-2 border-[#00d8ff30] border-t-[#00d8ff] rounded-full animate-spin"/>
          </div>
        )}
      </div>

      {/* Chips de miembros */}
      {profiles.length>0&&(
        <div className="flex flex-wrap gap-2">
          {profiles.map(profile=>{
            const cfg:AvatarConfig={...DEFAULT_AVATAR,...profile.avatarConfig};
            const isAnon=profile.socialVisibility==='anonymous';
            const isSel=selected?.id===profile.id;
            return(
              <button key={profile.id}
                onClick={()=>setSelected(isSel?null:profile)}
                style={{fontFamily:'monospace',boxShadow:isSel?'2px 2px 0 #00d8ff':undefined}}
                className={`flex items-center gap-2 px-3 py-1.5 text-[9px] uppercase tracking-widest font-bold border transition-none
                  ${isSel
                    ?'bg-[#00d8ff] text-[#080c14] border-[#00d8ff]'
                    :'bg-[#0d1117] text-[#8090a0] border-[#1a2030] hover:border-[#00d8ff40] hover:text-[#c0d0e0]'
                  }`}>
                <div className="w-2 h-2" style={{background:isAnon?'#555':cfg.outfitColor}}/>
                {isAnon?'ANÓNIMO':profile.displayName.toUpperCase()}
                {typeof profile.currentStreak==='number'&&profile.currentStreak>0&&(
                  <span className="text-[#f06020]">🔥{profile.currentStreak}</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {selected&&<ProfilePanel profile={selected} onClose={()=>setSelected(null)}/>}
      </AnimatePresence>
    </div>
  );
}
