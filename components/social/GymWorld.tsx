'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PublicGymPresence, socialService } from '@/services/social.service';
import AvatarSprite, { AvatarConfig, DEFAULT_AVATAR } from './AvatarSprite';

interface ExtendedPresence extends PublicGymPresence { avatarConfig?: Partial<AvatarConfig>; }

// ── Isometric math ────────────────────────────────────────────────────────────
// Near corner at (400,440). Room 10L × 10R, wall height 5 units.
// DL: per left step → screen (-34,-14). DR: right step → (+34,-14). DZ: up → (0,-36).
const OX=400, OY=440;
const DLx=-34, DLy=-14, DRx=34, DRy=-14, DZy=-36;
const L=10, R=10, WH=5;
function bx(l:number,r:number){return Math.round(OX+l*DLx+r*DRx);}
function by(l:number,r:number,z=0){return Math.round(OY+l*DLy+r*DRy+z*DZy);}
function p(l:number,r:number,z=0){return `${bx(l,r)},${by(l,r,z)}`;}
function P(...pts:[number,number,number?][]){return pts.map(([l,r,z=0])=>p(l,r,z)).join(' ');}

// Avatar slots (l,r) in front area of room
const SLOTS:[number,number][]=[
  [2,2],[3,2],[2,3],[4,2],[3,3],[2,4],[5,2],[4,3],[3,4],[5,3],
];

// ── Flat-color iso box ────────────────────────────────────────────────────────
function Box({l,r,lw,rw,h,top,lf,rf,stroke='#05080e',sw=1}:{
  l:number;r:number;lw:number;rw:number;h:number;
  top:string;lf:string;rf:string;stroke?:string;sw?:number;
}){
  return(
    <g stroke={stroke} strokeWidth={sw} strokeLinejoin="miter">
      <polygon points={P([l,r],[l+lw,r],[l+lw,r,h],[l,r,h])}        fill={lf}/>
      <polygon points={P([l,r],[l,r+rw],[l,r+rw,h],[l,r,h])}        fill={rf}/>
      <polygon points={P([l,r,h],[l+lw,r,h],[l+lw,r+rw,h],[l,r+rw,h])} fill={top}/>
    </g>
  );
}

// ── Profile panel ─────────────────────────────────────────────────────────────
function ProfilePanel({profile,onClose}:{profile:ExtendedPresence;onClose:()=>void}){
  const cfg:AvatarConfig={...DEFAULT_AVATAR,...profile.avatarConfig};
  const isAnon=profile.socialVisibility==='anonymous';
  return(
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
      className="fixed inset-0 z-[90] flex items-end md:items-center justify-center p-4" role="dialog" aria-modal="true">
      <button className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose}/>
      <motion.div initial={{scale:0.9,y:24}} animate={{scale:1,y:0}} exit={{scale:0.9,y:24}}
        className="relative w-full max-w-sm rounded-none border-2 border-[#4dabf7] bg-[#0d1117] p-6 shadow-[4px_4px_0_#4dabf7]"
        style={{fontFamily:'monospace'}}>
        <button onClick={onClose}
          className="absolute top-3 right-3 w-7 h-7 border border-[#4dabf7] text-[#4dabf7] flex items-center justify-center text-xs font-bold hover:bg-[#4dabf7] hover:text-black transition-colors">
          X
        </button>
        <div className="flex flex-col items-center gap-3 pt-1">
          <AvatarSprite config={cfg} size={64} isAnonymous={isAnon}/>
          <div className="text-center">
            <p className="text-[9px] uppercase tracking-[0.3em] text-[#4dabf7] font-bold mb-1">▶ ENTRENANDO AHORA</p>
            <h3 className="text-xl font-bold uppercase tracking-wider text-white">{profile.displayName}</h3>
            {profile.instagram&&<p className="text-[10px] tracking-widest text-[#4dabf7] mt-1">{profile.instagram}</p>}
          </div>
        </div>
        {profile.publicBio&&<p className="mt-4 text-xs text-[#8090a0] leading-relaxed text-center border-t border-[#4dabf730] pt-4">{profile.publicBio}</p>}
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

  // ── Color palette ──────────────────────────────────────────────────────────
  const C={
    floor:'#161824',        floorAlt:'#1a1e2c',
    wallL:'#1e2030',        wallLd:'#161826',  wallLhi:'#262838',
    wallR:'#181a28',        wallRd:'#121420',  wallRhi:'#1e2030',
    brick:'#1a1c2a',        mortar:'#0e1018',
    metal:'#2a2e3e',        metalD:'#1a1e2c',  metalL:'#3a3e50',
    metalHi:'#4a5060',
    plate:'#c85000',        plateL:'#f06020',  plateD:'#8a3500',
    neon:'#4dabf7',         neonD:'#1a4a80',
    bench:'#1a1e32',        benchL:'#262a42',
    rubber:'#1c1e2c',
    outline:'#05080e',
  };

  // Precompute key room vertices
  const nearX=bx(0,0), nearY=by(0,0);
  const leftX=bx(L,0), leftY=by(L,0);
  const rightX=bx(0,R), rightY=by(0,R);
  const backX=bx(L,R), backY=by(L,R);
  const nearTopY=by(0,0,WH);
  const leftTopY=by(L,0,WH);
  const rightTopY=by(0,R,WH);

  return(
    <div className="space-y-3 animate-in fade-in duration-500">
      {/* Header */}
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
          <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-widest text-[#4dabf7]">
            <div className="w-2 h-2 bg-[#4dabf7] animate-pulse"/>EN VIVO
          </div>
        )}
      </div>

      {/* Room */}
      <div className="relative w-full overflow-hidden" style={{background:'#05080e', border:'2px solid #1a2030', boxShadow:'4px 4px 0 #0d1220', aspectRatio:'800/500'}}>
        <svg viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg"
          shapeRendering="crispEdges" className="absolute inset-0 w-full h-full block" style={{imageRendering:'pixelated'}}>

          {/* ── FLOOR ──────────────────────────────────────────────────────── */}
          <polygon points={P([0,0],[L,0],[L,R],[0,R])} fill={C.floor} stroke={C.outline} strokeWidth="1"/>
          {/* Rubber tile grid */}
          {[0,2,4,6,8,10].map(r=>(
            <line key={`fl${r}`} x1={bx(0,r)} y1={by(0,r)} x2={bx(L,r)} y2={by(L,r)} stroke={C.floorAlt} strokeWidth="1"/>
          ))}
          {[0,2,4,6,8,10].map(l=>(
            <line key={`fr${l}`} x1={bx(l,0)} y1={by(l,0)} x2={bx(l,R)} y2={by(l,R)} stroke={C.floorAlt} strokeWidth="1"/>
          ))}
          {/* Center mat highlight */}
          <polygon points={P([1,1],[6,1],[6,9],[1,9])} fill={C.rubber} stroke={C.floorAlt} strokeWidth="0.5" opacity="0.5"/>

          {/* ── LEFT WALL (r=0 face) ───────────────────────────────────────── */}
          <polygon points={`${nearX},${nearY} ${leftX},${leftY} ${leftX},${leftTopY} ${nearX},${nearTopY}`}
            fill={C.wallL} stroke={C.outline} strokeWidth="1"/>
          {/* Horizontal brick mortar lines */}
          {[1,2,3,4,5].map(z=>(
            <line key={`lz${z}`} x1={bx(0,0)} y1={by(0,0,z)} x2={bx(L,0)} y2={by(L,0,z)} stroke={C.mortar} strokeWidth="2"/>
          ))}
          {/* Vertical brick joints (staggered) */}
          {[0,1,2,3,4].map(z=>
            [2,4,6,8].map(l=>(
              <line key={`lbv${z}${l}`}
                x1={bx(l+(z%2),0)} y1={by(l+(z%2),0,z)}
                x2={bx(l+(z%2),0)} y2={by(l+(z%2),0,z+1)}
                stroke={C.mortar} strokeWidth="1.5"/>
            ))
          )}
          {/* Left wall highlight strip at top */}
          <polygon points={`${bx(0,0)},${by(0,0,4.8)} ${bx(L,0)},${by(L,0,4.8)} ${bx(L,0)},${by(L,0,WH)} ${bx(0,0)},${by(0,0,WH)}`}
            fill={C.wallLhi} opacity="0.5"/>

          {/* Mirror panels on left wall */}
          {[
            [0.5,2.5,0.8,4.0],
            [3.2,5.2,0.8,4.0],
            [6.0,8.5,0.8,4.0],
          ].map(([l1,l2,z1,z2],mi)=>(
            <g key={mi}>
              <polygon
                points={`${bx(l1,0)},${by(l1,0,z1)} ${bx(l2,0)},${by(l2,0,z1)} ${bx(l2,0)},${by(l2,0,z2)} ${bx(l1,0)},${by(l1,0,z2)}`}
                fill="#3a5a7a" stroke="#5a8ab0" strokeWidth="1.5"/>
              {/* Mirror reflection shimmer */}
              <polygon
                points={`${bx(l1,0)},${by(l1,0,z1)} ${bx(l1+0.4,0)},${by(l1+0.4,0,z1)} ${bx(l1+0.4,0)},${by(l1+0.4,0,z2)} ${bx(l1,0)},${by(l1,0,z2)}`}
                fill="white" opacity="0.08"/>
            </g>
          ))}

          {/* ── RIGHT WALL (l=0 face) ──────────────────────────────────────── */}
          <polygon points={`${nearX},${nearY} ${rightX},${rightY} ${rightX},${rightTopY} ${nearX},${nearTopY}`}
            fill={C.wallR} stroke={C.outline} strokeWidth="1"/>
          {[1,2,3,4,5].map(z=>(
            <line key={`rz${z}`} x1={bx(0,0)} y1={by(0,0,z)} x2={bx(0,R)} y2={by(0,R,z)} stroke={C.mortar} strokeWidth="2"/>
          ))}
          {[0,1,2,3,4].map(z=>
            [2,4,6,8].map(r=>(
              <line key={`rbv${z}${r}`}
                x1={bx(0,r+(z%2))} y1={by(0,r+(z%2),z)}
                x2={bx(0,r+(z%2))} y2={by(0,r+(z%2),z+1)}
                stroke={C.mortar} strokeWidth="1.5"/>
            ))
          )}
          {/* Dumbbell rack on right wall */}
          {[1,2,3].map(bar=>(
            <line key={`db${bar}`}
              x1={bx(0,1)} y1={by(0,1,bar*1.1)}
              x2={bx(0,9)} y2={by(0,9,bar*1.1)}
              stroke={C.metalL} strokeWidth="3"/>
          ))}
          {/* Dumbbells on rack */}
          {[1.5,2.5,3.5,4.5,5.5,6.5,7.5,8.5].map((r,ri)=>{
            const colors=['#c0392b','#c0392b','#e67e22','#e67e22','#2980b9','#2980b9','#27ae60','#8e44ad'];
            return [1.1,2.2,3.3].map((z,zi)=>{
              const cx=bx(0,r), cy=by(0,r,z);
              return(
                <g key={`${ri}${zi}`}>
                  <ellipse cx={cx} cy={cy} rx={7} ry={4} fill={colors[ri]} stroke={C.outline} strokeWidth="0.5"/>
                  <ellipse cx={cx} cy={cy} rx={3} ry={2} fill="white" opacity={0.15}/>
                </g>
              );
            });
          })}

          {/* ── CEILING EDGE ───────────────────────────────────────────────── */}
          <line x1={bx(0,0)} y1={by(0,0,WH)} x2={bx(L,0)} y2={by(L,0,WH)} stroke={C.wallLhi} strokeWidth="2"/>
          <line x1={bx(0,0)} y1={by(0,0,WH)} x2={bx(0,R)} y2={by(0,R,WH)} stroke={C.wallRhi} strokeWidth="2"/>
          {/* Neon light strip on ceiling */}
          <line x1={bx(1,1)} y1={by(1,1,4.9)} x2={bx(1,9)} y2={by(1,9,4.9)} stroke={C.neon} strokeWidth="3" opacity="0.7"/>
          <line x1={bx(9,1)} y1={by(9,1,4.9)} x2={bx(9,9)} y2={by(9,9,4.9)} stroke={C.neon} strokeWidth="3" opacity="0.7"/>

          {/* LED scoreboard sign */}
          <polygon
            points={`${bx(3,3,0)},${by(3,3,4.5)} ${bx(7,3,0)},${by(7,3,4.5)} ${bx(7,7,0)},${by(7,7,4.5)} ${bx(3,7,0)},${by(3,7,4.5)}`}
            fill={C.neonD} stroke={C.neon} strokeWidth="1.5"/>
          <text
            x={bx(5,5)} y={by(5,5,4.5)+4}
            textAnchor="middle" fontSize="11" fontWeight="bold"
            fontFamily="monospace" letterSpacing="3"
            fill={C.neon} style={{textShadow:'0 0 6px #4dabf7'}}>
            GYM
          </text>

          {/* Clock on right wall */}
          <ellipse cx={bx(0,8)} cy={by(0,8,3.5)} rx={14} ry={8} fill="#1a1a2a" stroke={C.metalL} strokeWidth="1.5"/>
          <ellipse cx={bx(0,8)} cy={by(0,8,3.5)} rx={10} ry={5} fill="#0d1020"/>
          <line x1={bx(0,8)} y1={by(0,8,3.5)} x2={bx(0,8)} y2={by(0,8,3.5)-4} stroke={C.neon} strokeWidth="1"/>
          <line x1={bx(0,8)} y1={by(0,8,3.5)} x2={bx(0,8)+3} y2={by(0,8,3.5)} stroke={C.metalHi} strokeWidth="1"/>

          {/* ── EQUIPMENT (back→front) ─────────────────────────────────────── */}

          {/* === SQUAT RACK L (l=8-10, r=2-4) === */}
          {/* Posts */}
          <Box l={9.6} r={2.2} lw={0.3} rw={0.3} h={4.5} top={C.metalHi} lf={C.metal} rf={C.metalD}/>
          <Box l={9.6} r={3.6} lw={0.3} rw={0.3} h={4.5} top={C.metalHi} lf={C.metal} rf={C.metalD}/>
          <Box l={8.2} r={2.2} lw={0.3} rw={0.3} h={4.5} top={C.metalHi} lf={C.metal} rf={C.metalD}/>
          <Box l={8.2} r={3.6} lw={0.3} rw={0.3} h={4.5} top={C.metalHi} lf={C.metal} rf={C.metalD}/>
          {/* Top crossbar */}
          <Box l={8.2} r={2.2} lw={1.7} rw={0.15} h={4.6} top={C.metalL} lf={C.metalHi} rf={C.metal}/>
          <Box l={8.2} r={3.6} lw={1.7} rw={0.15} h={4.6} top={C.metalL} lf={C.metalHi} rf={C.metal}/>
          {/* Safety bar */}
          <Box l={8.2} r={2.2} lw={1.7} rw={0.15} h={2.5} top={C.metalL} lf={C.metalHi} rf={C.metal}/>
          {/* Barbell */}
          <Box l={8.4} r={1.8} lw={1.3} rw={2.2} h={3.0} top={C.metalHi} lf={C.metal} rf={C.metalD}/>
          {/* Red plates */}
          <Box l={8.4} r={1.8} lw={0.15} rw={0.6} h={3.45} top={C.plateL} lf={C.plate} rf={C.plateD}/>
          <Box l={9.5} r={1.8} lw={0.15} rw={0.6} h={3.45} top={C.plateL} lf={C.plate} rf={C.plateD}/>
          <Box l={8.4} r={3.4} lw={0.15} rw={0.6} h={3.45} top={C.plateL} lf={C.plate} rf={C.plateD}/>
          <Box l={9.5} r={3.4} lw={0.15} rw={0.6} h={3.45} top={C.plateL} lf={C.plate} rf={C.plateD}/>

          {/* === SQUAT RACK R (l=8-10, r=6-8) === */}
          <Box l={9.6} r={6.2} lw={0.3} rw={0.3} h={4.5} top={C.metalHi} lf={C.metal} rf={C.metalD}/>
          <Box l={9.6} r={7.6} lw={0.3} rw={0.3} h={4.5} top={C.metalHi} lf={C.metal} rf={C.metalD}/>
          <Box l={8.2} r={6.2} lw={0.3} rw={0.3} h={4.5} top={C.metalHi} lf={C.metal} rf={C.metalD}/>
          <Box l={8.2} r={7.6} lw={0.3} rw={0.3} h={4.5} top={C.metalHi} lf={C.metal} rf={C.metalD}/>
          <Box l={8.2} r={6.2} lw={1.7} rw={0.15} h={4.6} top={C.metalL} lf={C.metalHi} rf={C.metal}/>
          <Box l={8.2} r={7.6} lw={1.7} rw={0.15} h={4.6} top={C.metalL} lf={C.metalHi} rf={C.metal}/>
          <Box l={8.4} r={5.8} lw={1.3} rw={2.2} h={3.0} top={C.metalHi} lf={C.metal} rf={C.metalD}/>
          <Box l={8.4} r={5.8} lw={0.15} rw={0.6} h={3.45} top={C.plateL} lf={C.plate} rf={C.plateD}/>
          <Box l={9.5} r={5.8} lw={0.15} rw={0.6} h={3.45} top={C.plateL} lf={C.plate} rf={C.plateD}/>
          <Box l={8.4} r={7.4} lw={0.15} rw={0.6} h={3.45} top={C.plateL} lf={C.plate} rf={C.plateD}/>
          <Box l={9.5} r={7.4} lw={0.15} rw={0.6} h={3.45} top={C.plateL} lf={C.plate} rf={C.plateD}/>

          {/* === BENCH PRESS CENTER (l=6-8, r=4-6) === */}
          <Box l={6.0} r={4.2} lw={2.0} rw={1.6} h={0.9} top={C.bench} lf={C.benchL} rf={C.metalD}/>
          <Box l={6.1} r={4.3} lw={1.8} rw={1.4} h={1.0} top="#223" lf="#1a2" rf="#131"/>
          {/* Barbell on bench */}
          <Box l={6.3} r={3.8} lw={1.4} rw={2.4} h={1.6} top={C.metalHi} lf={C.metal} rf={C.metalD}/>
          <Box l={6.3} r={3.8} lw={0.12} rw={0.5} h={2.0} top={C.plateL} lf={C.plate} rf={C.plateD}/>
          <Box l={7.6} r={3.8} lw={0.12} rw={0.5} h={2.0} top={C.plateL} lf={C.plate} rf={C.plateD}/>
          <Box l={6.3} r={5.7} lw={0.12} rw={0.5} h={2.0} top={C.plateL} lf={C.plate} rf={C.plateD}/>
          <Box l={7.6} r={5.7} lw={0.12} rw={0.5} h={2.0} top={C.plateL} lf={C.plate} rf={C.plateD}/>
          {/* Bench posts */}
          <Box l={6.2} r={4.3} lw={0.2} rw={0.2} h={1.9} top={C.metalL} lf={C.metal} rf={C.metalD}/>
          <Box l={7.6} r={4.3} lw={0.2} rw={0.2} h={1.9} top={C.metalL} lf={C.metal} rf={C.metalD}/>

          {/* === CABLE MACHINE (l=7-9, r=1-3) === */}
          <Box l={7.5} r={1.0} lw={1.5} rw={2.0} h={3.5} top={C.metalL} lf={C.metal} rf={C.metalD}/>
          {/* Screen */}
          <polygon
            points={`${bx(7.6,1)},${by(7.6,1,2.5)} ${bx(8.8,1)},${by(8.8,1,2.5)} ${bx(8.8,1)},${by(8.8,1,3.2)} ${bx(7.6,1)},${by(7.6,1,3.2)}`}
            fill={C.neonD} stroke={C.neon} strokeWidth="1"/>
          <line x1={bx(7.8,1)} y1={by(7.8,1,2.7)} x2={bx(8.6,1)} y2={by(8.6,1,2.7)} stroke={C.neon} strokeWidth="1" opacity="0.6"/>
          <line x1={bx(7.8,1)} y1={by(7.8,1,2.9)} x2={bx(8.3,1)} y2={by(8.3,1,2.9)} stroke={C.neon} strokeWidth="1" opacity="0.4"/>
          {/* Cable pulley */}
          <ellipse cx={bx(8.2,2)} cy={by(8.2,2,3.6)} rx={8} ry={4} fill={C.metalHi} stroke={C.outline} strokeWidth="0.5"/>

          {/* === DUMBBELL RACK on floor (l=9-10, r=0.5-9) === */}
          <Box l={9.0} r={0.5} lw={1.0} rw={8.5} h={1.4} top={C.metal} lf={C.metalD} rf={C.metalD}/>
          {[1,2,3,4,5,6,7,8].map((ri,i)=>{
            const colors=[C.plateD,C.plate,C.plateL,'#c0392b','#c0392b','#e67e22','#2980b9','#27ae60'];
            return(
              <g key={ri}>
                <ellipse cx={bx(9.5,ri)} cy={by(9.5,ri,1.5)} rx={9} ry={5} fill={colors[i]} stroke={C.outline} strokeWidth="0.5"/>
                <ellipse cx={bx(9.5,ri)} cy={by(9.5,ri,1.5)} rx={4} ry={2} fill="white" opacity={0.12}/>
              </g>
            );
          })}

          {/* === TREADMILL (l=1-3, r=7-9) === */}
          <Box l={1.0} r={7.0} lw={2.0} rw={2.0} h={1.4} top={C.metal} lf={C.metalD} rf={C.metalD}/>
          {/* Belt */}
          <polygon points={P([1.1,7.1,1.41],[2.9,7.1,1.41],[2.9,8.9,1.41],[1.1,8.9,1.41])} fill="#0d0d18" stroke={C.floorAlt} strokeWidth="0.5"/>
          {/* Handlebars */}
          <Box l={1.2} r={7.0} lw={0.15} rw={0.1} h={3.0} top={C.metalHi} lf={C.metalL} rf={C.metal}/>
          <Box l={2.7} r={7.0} lw={0.15} rw={0.1} h={3.0} top={C.metalHi} lf={C.metalL} rf={C.metal}/>
          <Box l={1.2} r={7.0} lw={1.65} rw={0.1} h={2.95} top={C.metalL} lf={C.metalHi} rf={C.metal}/>
          {/* Screen */}
          <polygon
            points={`${bx(1.6,7)},${by(1.6,7,2.7)} ${bx(2.4,7)},${by(2.4,7,2.7)} ${bx(2.4,7)},${by(2.4,7,2.95)} ${bx(1.6,7)},${by(1.6,7,2.95)}`}
            fill={C.neonD} stroke={C.neon} strokeWidth="1"/>

          {/* Second treadmill */}
          <Box l={1.0} r={4.5} lw={2.0} rw={2.0} h={1.4} top={C.metal} lf={C.metalD} rf={C.metalD}/>
          <polygon points={P([1.1,4.6,1.41],[2.9,4.6,1.41],[2.9,6.4,1.41],[1.1,6.4,1.41])} fill="#0d0d18" stroke={C.floorAlt} strokeWidth="0.5"/>
          <Box l={1.2} r={4.5} lw={0.15} rw={0.1} h={3.0} top={C.metalHi} lf={C.metalL} rf={C.metal}/>
          <Box l={2.7} r={4.5} lw={0.15} rw={0.1} h={3.0} top={C.metalHi} lf={C.metalL} rf={C.metal}/>
          <Box l={1.2} r={4.5} lw={1.65} rw={0.1} h={2.95} top={C.metalL} lf={C.metalHi} rf={C.metal}/>
          <polygon
            points={`${bx(1.6,4.5)},${by(1.6,4.5,2.7)} ${bx(2.4,4.5)},${by(2.4,4.5,2.7)} ${bx(2.4,4.5)},${by(2.4,4.5,2.95)} ${bx(1.6,4.5)},${by(1.6,4.5,2.95)}`}
            fill={C.neonD} stroke={C.neon} strokeWidth="1"/>

          {/* Water cooler */}
          <Box l={9.2} r={9.0} lw={0.6} rw={0.8} h={2.2} top="#90d0f0" lf="#4ab0e0" rf="#2090c0"/>
          <Box l={9.3} r={9.1} lw={0.4} rw={0.6} h={2.8} top="#c0e8ff" lf="#90d0f0" rf="#60b8e0"/>

          {/* Weight plates on floor */}
          {[[8.0,3.5],[7.5,5.0],[7.0,3.0]].map(([l,r],i)=>(
            <g key={i}>
              <ellipse cx={bx(l,r)} cy={by(l,r,0.1)} rx={14} ry={7} fill={i===0?C.plate:C.plateD} stroke={C.outline} strokeWidth="0.5"/>
              <ellipse cx={bx(l,r)} cy={by(l,r,0.1)} rx={5}  ry={2.5} fill={C.outline} opacity={0.5}/>
            </g>
          ))}

          {/* Avatar floor shadows (inside SVG for correct z-order) */}
          {!loading&&sorted.map(({profile,slot})=>{
            const [sl,sr]=slot;
            return(
              <ellipse key={profile.id}
                cx={bx(sl,sr)} cy={by(sl,sr,0)+3}
                rx={20} ry={8} fill="black" opacity={0.5}/>
            );
          })}
        </svg>

        {/* ── AVATAR OVERLAY (positioned divs, no foreignObject) ────────────── */}
        {!loading&&sorted.map(({profile,slot},idx)=>{
          const [sl,sr]=slot;
          const ax=bx(sl,sr), ay=by(sl,sr,0);
          const cfg:AvatarConfig={...DEFAULT_AVATAR,...profile.avatarConfig};
          const isAnon=profile.socialVisibility==='anonymous';
          const isSel=selected?.id===profile.id;
          // Percentage position inside the 800×500 viewBox
          const pctX=(ax/800)*100;
          const pctY=(ay/500)*100;
          return(
            <button
              key={profile.id}
              onClick={()=>setSelected(isSel?null:profile)}
              className="absolute focus:outline-none"
              style={{
                left:`${pctX}%`,
                top:`${pctY}%`,
                transform:'translate(-50%,-100%)',
                zIndex: 10 + idx,
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
              {/* Pixel name tag */}
              <div style={{
                background: isSel?C.neon:'rgba(5,8,14,0.85)',
                color: isSel?'#05080e':'#e0e8f0',
                border:`1px solid ${isSel?C.neon:'#4dabf730'}`,
                padding:'1px 6px 1px 6px',
                fontFamily:'monospace',
                fontSize:9,
                fontWeight:'bold',
                letterSpacing:1,
                textTransform:'uppercase',
                whiteSpace:'nowrap',
                boxShadow: isSel?`2px 2px 0 ${C.neonD}, 0 0 8px ${C.neon}60`:undefined,
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
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#4dabf7] mb-2">▶ SALA VACÍA</p>
              <p className="text-xs text-[#4a5a70]">Activá tu visibilidad en tu perfil</p>
              <p className="text-xs text-[#4a5a70]">para aparecer aquí mientras entrenás.</p>
            </div>
          </div>
        )}
        {loading&&(
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div className="w-6 h-6 border-2 border-[#4dabf730] border-t-[#4dabf7] rounded-full animate-spin"/>
          </div>
        )}
      </div>

      {/* Pixel-style member chips */}
      {profiles.length>0&&(
        <div className="flex flex-wrap gap-2">
          {profiles.map(profile=>{
            const cfg:AvatarConfig={...DEFAULT_AVATAR,...profile.avatarConfig};
            const isAnon=profile.socialVisibility==='anonymous';
            const isSel=selected?.id===profile.id;
            return(
              <button key={profile.id}
                onClick={()=>setSelected(isSel?null:profile)}
                style={{fontFamily:'monospace',boxShadow:isSel?`2px 2px 0 #4dabf7`:undefined}}
                className={`flex items-center gap-2 px-3 py-1.5 text-[9px] uppercase tracking-widest font-bold border transition-none
                  ${isSel
                    ?'bg-[#4dabf7] text-[#0d1117] border-[#4dabf7]'
                    :'bg-[#0d1117] text-[#8090a0] border-[#1a2030] hover:border-[#4dabf740] hover:text-[#c0d0e0]'
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
