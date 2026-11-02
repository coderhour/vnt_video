import { useId } from 'react';
import { staticFile, useCurrentFrame } from 'remotion';
import { clamp, ease, fadeTo, fadeUp, pop, range } from '../../lib/anim';
import { Explainer, at, type Scene, type SceneComponent, type Timeline } from '../../lib/Explainer';
import { Countdown } from '../../lib/PauseCard';
import { Stage, type Pt } from '../../lib/grid';
import { NUNITO, PACIFICO } from '../../lib/fonts';
import { Tex } from '../../lib/Tex';
import { Answer, Check, Confetti, Mark, Pill, Text } from '../../lib/ui';
import { SignOff } from '../../lib/Brand';
import { C } from '../../lib/theme';

export const SLUG = '2026-10-30-multiples-of-4-6-9';
export const CHIME = staticFile(`${SLUG}/sfx/fs-541985.mp3`); // Freesound CC0, see sfx/FREESOUND-CREDITS.md
export const TICK = staticFile(`${SLUG}/sfx/fs-668355.mp3`);

export const CIRC = [C.primary, C.violet, C.amber];
const PX = 980; // right panel x
export const CHOICES = ['362', '388', '389', '416', '527'];

// ---------- Venn diagram ----------

const R = 190;
const CEN: Pt[] = [[300, 430], [550, 430], [425, 640]];
const ANCH = { a: [205, 415], b: [645, 415], c: [425, 765], ab: [425, 352], ac: [318, 595], bc: [532, 595], abc: [425, 510] } as Record<string, Pt>;

type Reg = { ins: number[]; outs?: number[]; color: string; op: number };
type Lab = { at: string; text: string; color?: string; op: number; size?: number; dx?: number; dy?: number };

const Region: React.FC<{ uid: string; reg: Reg; k: number }> = ({ uid, reg, k }) => {
  if (reg.op <= 0) return null;
  const id = `${uid}m${k}`;
  const nest = (list: number[]): React.ReactNode =>
    list.length === 0 ? <rect x={0} y={0} width={1920} height={1080} fill="#fff" /> : <g clipPath={`url(#${uid}c${list[0]})`}>{nest(list.slice(1))}</g>;
  return (
    <>
      <mask id={id} maskUnits="userSpaceOnUse" x={0} y={0} width={1920} height={1080}>
        {nest(reg.ins)}
        {(reg.outs ?? []).map((o) => (
          <circle key={o} cx={CEN[o][0]} cy={CEN[o][1]} r={R + 1} fill="#000" />
        ))}
      </mask>
      <rect x={0} y={0} width={1920} height={1080} fill={reg.color} opacity={reg.op} mask={`url(#${id})`} />
    </>
  );
};

const Venn: React.FC<{
  names: [string, string, string];
  fill?: [number, number, number];
  draw?: number;
  regions?: Reg[];
  labels?: Lab[];
  dim?: number;
  namesOp?: number;
}> = ({ names, fill = [0, 0, 0], draw = 1, regions = [], labels = [], dim = 1, namesOp = 1 }) => {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const namePos: Pt[] = [[40, 145], [940, 145], [650, 835]];
  return (
    <Stage>
      <g transform="translate(10 -115) scale(1.15)">
      <defs>
        {CEN.map((c, i) => (
          <clipPath key={i} id={`${uid}c${i}`}>
            <circle cx={c[0]} cy={c[1]} r={R} />
          </clipPath>
        ))}
      </defs>
      <g opacity={dim}>
        {CEN.map((c, i) => (
          <circle key={i} cx={c[0]} cy={c[1]} r={R} fill={CIRC[i]} opacity={0.2 * fill[i]} />
        ))}
        {CEN.map((c, i) => (
          <circle key={i} cx={c[0]} cy={c[1]} r={R} fill="none" stroke={CIRC[i]} strokeWidth={7} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
        ))}
      </g>
      {regions.map((r, k) => (
        <Region key={k} uid={uid} reg={r} k={k} />
      ))}
      {labels.map((l, k) =>
        l.op <= 0 ? null : (
          <text key={k} x={ANCH[l.at][0] + (l.dx ?? 0)} y={ANCH[l.at][1] + (l.dy ?? 0)} textAnchor="middle" dominantBaseline="middle" fontFamily={NUNITO} fontWeight={900} fontSize={l.size ?? 52} fill={l.color ?? C.ink} opacity={l.op} paintOrder="stroke" stroke={C.bg} strokeWidth={7}>
            {l.text}
          </text>
        ),
      )}
      </g>
      {names.map((n, i) => (
        <text key={i} x={namePos[i][0]} y={namePos[i][1]} textAnchor={i === 1 ? 'end' : 'start'} fontFamily={NUNITO} fontWeight={900} fontSize={46} fill={CIRC[i]} opacity={namesOp * draw}>
          multiples of {n}
        </text>
      ))}
    </Stage>
  );
};

const LENS = (op: number, color = C.red): Reg[] => [
  { ins: [0, 1], color, op },
  { ins: [0, 2], color, op },
  { ins: [1, 2], color, op },
];

// ---------- shared pieces ----------

const Eq: React.FC<{ y: number; tex: string; start: number; x?: number; size?: number; color?: string; opacity?: number }> = ({ y, tex, start, x = PX, size = 56, color = C.ink, opacity = 1 }) => {
  const f = useCurrentFrame();
  const s = fadeUp(f, start);
  return (
    <div style={{ position: 'absolute', left: x, top: y, whiteSpace: 'nowrap', ...s, opacity: (s.opacity as number) * opacity }}>
      <Tex tex={tex} size={size} color={color} />
    </div>
  );
};

const Note: React.FC<{ y: number; start: number; children: React.ReactNode; color?: string; x?: number; w?: number; size?: number; opacity?: number }> = ({ y, start, children, color = C.ink, x = PX, w = 900, size = 50, opacity = 1 }) => {
  const f = useCurrentFrame();
  const s = fadeUp(f, start);
  return (
    <Text x={x} y={y} w={w} size={size} weight={800} color={color} style={{ ...s, opacity: (s.opacity as number) * opacity }}>
      {children}
    </Text>
  );
};

const Chip: React.FC<{ x: number; y: number; start: number; color: string; children: React.ReactNode; size?: number }> = ({ x, y, start, color, children, size = 52 }) => {
  const f = useCurrentFrame();
  const s = pop(f, start);
  if (s <= 0) return null;
  return (
    <div style={{ position: 'absolute', left: x, top: y, background: color, color: '#fff', borderRadius: 18, padding: '6px 24px', fontSize: size, fontWeight: 900, transform: `scale(${s})`, transformOrigin: 'left center', whiteSpace: 'nowrap' }}>
      {children}
    </div>
  );
};

const QCard: React.FC<{ x: number; y: number; w: number; size: number; start?: number; marks?: [number, number]; children?: React.ReactNode; lines: [string, string, string] }> = ({ x, y, w, size, start = 0, marks, lines }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, background: C.card, borderRadius: 32, padding: '32px 48px', fontSize: size, fontWeight: 600, lineHeight: 1.45, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', ...fadeUp(f, start) }}>
      {lines[0]} {marks ? <Mark on={marks[0]}>{lines[1]}</Mark> : lines[1]} {marks ? <Mark on={marks[1]}>{lines[2]}</Mark> : lines[2]}
    </div>
  );
};

const Q1: [string, string, string] = ['', 'How many whole numbers from 1 to 1000', 'are multiples of at least one of 4, 6 and 9?'];
const Q2: [string, string, string] = ['', 'How many whole numbers from 1 to 300', 'are multiples of at least one of 4, 6 and 10?'];

const ChoiceRow: React.FC<{ x: number; y: number; start: (i: number) => number; size?: number; gap?: number }> = ({ x, y, start, size = 56, gap = 22 }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: x, top: y, display: 'flex', gap }}>
      {CHOICES.map((c, i) => (
        <div key={c} style={{ ...fadeUp(f, start(i), 10), background: C.card, borderRadius: 18, padding: '10px 24px', fontSize: size, fontWeight: 800, boxShadow: '0 4px 14px rgba(30,40,80,0.07)', whiteSpace: 'nowrap' }}>
          <span style={{ color: C.muted, fontSize: size - 8, marginRight: 10 }}>{'ABCDE'[i]}</span>
          {c}
        </div>
      ))}
    </div>
  );
};

// ---------- scenes ----------

const Intro: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const D = [4, 6, 9];
  const dbl = ease(f, at(scene, 1, 0.55), 12);
  const pulse = 0.5 + 0.5 * Math.sin((f - at(scene, 1, 0.55)) / 5);
  const gone = ease(f, at(scene, 2, 0.02), 12);
  const title = ease(f, at(scene, 2, 0.05), 16);
  return (
    <>
      <div style={{ opacity: 1 - 0.65 * gone }}>
        {range(40).map((i) => {
          const n = i + 1;
          const lit = D.map((d, k) => n % d === 0 && f >= at(scene, 0, 0.05 + k * 0.3 + (n / 40) * 0.26));
          const cols = D.map((_, k) => (lit[k] ? CIRC[k] : null)).filter(Boolean) as string[];
          const bg = cols.length === 0 ? C.card : cols.length === 1 ? cols[0] : `linear-gradient(90deg, ${cols.map((c, j) => `${c} ${(j / cols.length) * 100}% ${((j + 1) / cols.length) * 100}%`).join(', ')})`;
          const multi = D.filter((d) => n % d === 0).length >= 2;
          return (
            <div key={n} style={{ position: 'absolute', left: 406 + (i % 10) * 112, top: 150 + Math.floor(i / 10) * 112, width: 100, height: 100, borderRadius: 18, background: bg, color: cols.length ? '#fff' : C.muted, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, fontWeight: 900, boxShadow: '0 4px 14px rgba(30,40,80,0.07)', outline: multi && dbl > 0 ? `${4 + 4 * pulse}px solid ${C.red}` : 'none', outlineOffset: 2, opacity: multi && dbl > 0 ? 1 : cols.length || multi ? 1 : 0.9 }}>
              {n}
            </div>
          );
        })}
      </div>
      <Text x={960} y={650} w={1500} size={64} weight={900} color={C.red} align="center" style={{ opacity: dbl * (1 - gone), transform: `translateY(${(1 - dbl) * 20}px)` }}>
        Some numbers sneak in twice!
      </Text>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 610, textAlign: 'center', opacity: title, transform: `translateY(${(1 - title) * 24}px)` }}>
        <div style={{ fontFamily: PACIFICO, fontSize: 120, color: C.violet, lineHeight: 1.3 }}>Vantee</div>
        <div style={{ fontSize: 54, fontWeight: 900 }}>Multiples of 4, 6 or 9</div>
      </div>
    </>
  );
};

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <QCard x={110} y={190} w={1700} size={64} start={at(scene, 0, 0.6)} marks={[at(scene, 1, 0.3), at(scene, 2, 0.3)]} lines={Q1} />
      <ChoiceRow x={150} y={600} start={(i) => at(scene, 3, 0.2 + i * 0.12)} size={64} gap={26} />
      <Text x={110} y={110} w={600} size={0} style={fadeUp(f, 0)}>{''}</Text>
    </>
  );
};

const Asked: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const rules = ['4', '6', '9'];
  const px = [150, 700, 1250];
  const stamp = pop(f, at(scene, 1, 0.65));
  return (
    <>
      {rules.map((r, i) => (
        <Chip key={r} x={px[i]} y={170} start={at(scene, 0, 0.35 + i * 0.22)} color={CIRC[i]} size={56}>
          {r} goes into n
        </Chip>
      ))}
      {[0, 1].map((i) => (
        <Text key={i} x={px[i] + 500} y={176} w={110} size={50} weight={900} color={C.muted} align="center" style={fadeUp(f, at(scene, 0, 0.5 + i * 0.22))}>
          OR
        </Text>
      ))}
      <Text x={960} y={335} w={1500} size={50} weight={800} align="center" color={C.muted} style={fadeUp(f, at(scene, 0, 0.8))}>
        n counts if ANY one is true
      </Text>
      <div style={{ position: 'absolute', left: 560, top: 470, width: 180, height: 180, borderRadius: 28, background: `linear-gradient(90deg, ${C.primary} 0% 50%, ${C.violet} 50% 100%)`, color: '#fff', fontSize: 110, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', ...fadeUp(f, at(scene, 1, 0.1)) }}>12</div>
      {[0, 1].map((i) => (
        <Check key={i} x={[190, 740][i] + 20} y={262} start={at(scene, 1, 0.3 + i * 0.15)}>{''}</Check>
      ))}
      <Text x={640} y={680} w={600} size={50} weight={800} align="center" color={C.ink} style={fadeUp(f, at(scene, 1, 0.3))}>
        fits 4 and 6
      </Text>
      <div style={{ position: 'absolute', left: 1000, top: 480, transform: `scale(${stamp}) rotate(-6deg)`, border: `10px solid ${C.green}`, color: C.green, borderRadius: 28, padding: '10px 40px', fontSize: 100, fontWeight: 900, opacity: stamp > 0 ? 1 : 0 }}>
        counts ONCE
      </div>
    </>
  );
};

const makePause = (seconds: number, lines: [string, string, string], showChoices: boolean): SceneComponent => ({ scene }) => (
  <>
    <QCard x={100} y={150} w={1000} size={52} start={4} lines={lines} />
    {showChoices && <ChoiceRow x={100} y={560} start={() => 10} size={50} gap={14} />}
    <Countdown scene={scene} seconds={seconds} x={1500} y={480} tick={TICK} />
  </>
);

const Singles: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const fl = (l: number) => ease(f, at(scene, l, 0.5), 20);
  const t = at(scene, 4, 0.55);
  const pulse = ease(f, t, 12) * (0.35 + 0.25 * Math.sin((f - t) / 5));
  return (
    <>
      <Venn names={['4', '6', '9']} draw={ease(f, 0, 25)} fill={[fl(1), fl(2), fl(3)]} regions={LENS(pulse)} />
      <Eq y={170} start={at(scene, 1, 0.1)} tex="1000 \div 4 = 250" color={C.primary} />
      <Eq y={270} start={at(scene, 2, 0.1)} tex="1000 \div 6 = 166 \text{ R } 4" color={C.violet} />
      <Eq y={370} start={at(scene, 3, 0.1)} tex="1000 \div 9 = 111 \text{ R } 1" color="#d98300" />
      <Eq y={510} start={at(scene, 4, 0.1)} tex="250 + 166 + 111 = 527" size={62} />
      <Note y={650} start={t} color={C.red}>Overlaps are counted twice!</Note>
    </>
  );
};

const Pairs: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const drop = ease(f, 4, 22);
  const tok = (a: Pt, from = 150): Pt => [a[0], from + (a[1] - from) * drop];
  const t0 = tok(ANCH.ab);
  const x2 = ease(f, at(scene, 0, 0.5), 10);
  const l1 = ease(f, at(scene, 1, 0.7), 10);
  return (
    <>
      <Venn
        names={['4', '6', '9']}
        fill={[1, 1, 1]}
        regions={[{ ins: [0, 1], color: C.red, op: 0.25 * x2 * (1 - l1) }]}
        labels={[
          { at: 'ab', text: '12', color: C.ink, op: 1, dx: t0[0] - ANCH.ab[0], dy: t0[1] - ANCH.ab[1] },
          { at: 'bc', text: '18', color: C.ink, op: ease(f, at(scene, 3, 0.7), 10) },
          { at: 'abc', text: '36', color: C.ink, op: ease(f, at(scene, 4, 0.7), 10) },
        ]}
      />
      {x2 > 0 && l1 < 1 && (
        <Chip x={455} y={135} start={at(scene, 0, 0.5)} color={C.red} size={44}>
          ×2
        </Chip>
      )}
      <Eq y={170} start={at(scene, 1, 0.1)} tex="4,\ 8,\ \boxed{12}" color={C.primary} />
      <Eq y={255} start={at(scene, 1, 0.45)} tex="6,\ \boxed{12}" color={C.violet} />
      <Note y={340} start={at(scene, 1, 0.8)} color={C.green}>they first meet at 12</Note>
      <Eq y={430} start={at(scene, 2, 0.3)} tex="24" color={C.red} size={64} />
      <Note y={433} x={PX + 130} start={at(scene, 2, 0.35)} color={C.red}>✗ misses 12 and 36</Note>
      <Eq y={520} start={at(scene, 3, 0.15)} tex="9,\ \boxed{18}" color="#d98300" />
      <Eq y={520} x={PX + 300} start={at(scene, 3, 0.15)} tex="6,\ 12,\ \boxed{18}" color={C.violet} />
      <Eq y={640} start={at(scene, 4, 0.3)} tex="4 \times 9 = 36" size={62} />
      <Note y={735} start={at(scene, 4, 0.2)} color={C.muted}>no shared factor</Note>
      {f >= at(scene, 2, 0.35) && (
        <div style={{ position: 'absolute', left: PX + 8, top: 456, width: 110, height: 6, background: C.red, transform: 'rotate(-8deg)', opacity: ease(f, at(scene, 2, 0.4), 8) }} />
      )}
    </>
  );
};

const Subtract: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const flash = ease(f, at(scene, 1, 0.5), 10) * (0.35 + 0.2 * Math.sin((f - at(scene, 1, 0.5)) / 5));
  const q = ease(f, at(scene, 3, 0.85), 10);
  return (
    <>
      <Venn
        names={['4', '6', '9']}
        fill={[1, 1, 1]}
        regions={LENS(flash)}
        labels={[
          { at: 'ab', text: '12', op: 1 },
          { at: 'bc', text: '18', op: 1 },
          { at: 'abc', text: '36', op: 1 },
        ]}
      />
      <Eq y={170} start={at(scene, 0, 0.35)} tex="1000 \div 12 \to 83" />
      <Eq y={260} start={at(scene, 0, 0.55)} tex="1000 \div 18 \to 55" />
      <Eq y={350} start={at(scene, 0, 0.75)} tex="1000 \div 36 \to 27" />
      <Eq y={470} start={at(scene, 1, 0.3)} tex="83 + 55 + 27 = 165" size={62} />
      <Eq y={600} start={at(scene, 2, 0.1)} tex="527 - 165" size={62} />
      <Eq y={600} x={PX + 400} start={at(scene, 3, 0.45)} tex="= 362" size={62} />
      <Text x={PX + 640} y={590} w={120} size={110} weight={900} color={C.amber} style={{ opacity: q, transform: `scale(${0.6 + 0.4 * q})` }}>?</Text>
    </>
  );
};

const Addback: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const grey = ease(f, at(scene, 1, 0.8), 14);
  const back = ease(f, at(scene, 2, 0.2), 14);
  const pulse = ease(f, at(scene, 0, 0.5), 10) * (1 - ease(f, at(scene, 1, 0.1), 10)) * (0.5 + 0.3 * Math.sin(f / 4));
  const bounce = pop(f, at(scene, 0, 0.55));
  return (
    <>
      <Venn
        names={['4', '6', '9']}
        fill={[1, 1, 1]}
        regions={[
          { ins: [0, 1, 2], color: C.green, op: pulse },
          { ins: [0, 1, 2], color: '#fff', op: grey * (1 - back) },
          { ins: [0, 1, 2], color: C.green, op: back * 0.55 },
        ]}
        labels={[{ at: 'abc', text: '36', op: 1, size: 56 * (0.7 + 0.3 * bounce) }]}
      />
      <Note y={160} start={at(scene, 0, 0.55)}>36 is in all three circles</Note>
      <Eq y={250} start={at(scene, 1, 0.1)} tex="+1\ +1\ +1" color={C.green} size={50} />
      <Eq y={250} x={PX + 350} start={at(scene, 1, 0.5)} tex="-1\ -1\ -1" color={C.red} size={50} />
      <Eq y={250} x={PX + 690} start={at(scene, 1, 0.85)} tex="=\ 0" size={50} />
      <Note y={340} start={at(scene, 1, 0.8)} color={C.muted}>not counted at all!</Note>
      <Eq y={430} start={at(scene, 2, 0.35)} tex="1000 \div 36 \to 27" />
      <Eq y={430} x={PX + 560} start={at(scene, 2, 0.7)} tex="+27" color={C.green} size={62} />
      <Eq y={560} start={at(scene, 3, 0.1)} tex="362 + 27" size={64} />
      <Eq y={560} x={PX + 350} start={at(scene, 4, 0.45)} tex="= 389" size={64} color={C.green} />
      <Pill x={PX} y={700} color={C.green} style={fadeUp(f, at(scene, 4, 0.8))}>Answer: C</Pill>
      <Answer x={1700} y={690} value="389" start={at(scene, 4, 0.85)} chime={CHIME} />
      <Confetti x={1700} y={690} start={at(scene, 4, 0.85)} seed={7} />
    </>
  );
};

const Aha: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const spot = ease(f, at(scene, 0, 0.35), 14);
  const c = ease(f, at(scene, 2, 0.1), 12);
  return (
    <>
      <Venn
        names={['4', '6', '9']}
        fill={[1, 1, 1]}
        dim={1 - 0.65 * spot}
        namesOp={1 - 0.6 * spot}
        regions={[{ ins: [0, 2], outs: [1], color: C.amber, op: 0.85 * spot }]}
        labels={[{ at: 'ac', text: 'empty', color: C.ink, op: ease(f, at(scene, 2, 0.1), 10), size: 40, dx: -8, dy: -18 }]}
      />
      <Eq y={200} start={at(scene, 1, 0.1)} tex="4 \text{ and } 9 \to 36" />
      <Eq y={300} start={at(scene, 1, 0.5)} tex="36 = 6 \times 6" />
      <Note y={400} start={at(scene, 1, 0.8)} color={C.green}>so 36 is in the 6-circle too</Note>
      <div style={{ position: 'absolute', left: PX, top: 540, display: 'flex', gap: 60, alignItems: 'center', opacity: c }}>
        <span style={{ fontSize: 76, fontWeight: 900, color: C.red }}>−27</span>
        <span style={{ fontSize: 76, fontWeight: 900, color: C.green }}>+27</span>
        <span style={{ fontSize: 50, fontWeight: 800, color: C.muted }}>cancel!</span>
      </div>
      <div style={{ position: 'absolute', left: PX - 10, top: 585, width: 330 * c, height: 6, background: C.ink, borderRadius: 3 }} />
    </>
  );
};

const Buildup: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const stripOp = ease(f, at(scene, 3, 0.6), 12);
  const S = [9, 18, 27, 36, 45, 54, 63, 72];
  const even = ease(f, at(scene, 4, 0.4), 12);
  const odd = ease(f, at(scene, 5, 0.4), 12);
  const barX = 120;
  const unit = 900 / 400;
  const w333 = ease(f, at(scene, 3, 0.2), 20) * 333 * unit;
  const w56 = ease(f, at(scene, 7, 0.1), 20) * 56 * unit;
  const tip = ease(f, at(scene, 8, 0.1), 14);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, top: 0, opacity: 1 - ease(f, at(scene, 1, 0.02), 10) }}>
        {['4', '6', '9'].map((r, i) => (
          <Chip key={r} x={380 + i * 400} y={300} start={at(scene, 0, 0.35 + i * 0.2)} color={CIRC[i]} size={64}>
            {i === 0 ? 'first 4' : i === 1 ? 'then 6' : 'then 9'}
          </Chip>
        ))}
      </div>
      <Eq x={120} y={140} start={at(scene, 1, 0.3)} tex="250 + 166" size={62} opacity={1 - ease(f, at(scene, 2, 0.05), 8)} />
      <Eq x={120} y={140} start={at(scene, 2, 0.1)} tex="250 + 166 - 83" size={62} opacity={ease(f, at(scene, 2, 0.1), 8)} />
      <Chip x={720} y={150} start={at(scene, 2, 0.75)} color={C.violet} size={44}>83 multiples of 12</Chip>
      <Eq x={120} y={250} start={at(scene, 3, 0.2)} tex="= 333" size={62} color={C.green} />
      <div style={{ position: 'absolute', left: barX, top: 360, width: 900, height: 56, borderRadius: 14, background: C.line, opacity: ease(f, at(scene, 3, 0.2), 10) }} />
      <div style={{ position: 'absolute', left: barX, top: 360, width: w333, height: 56, borderRadius: '14px 0 0 14px', background: C.primary }} />
      <div style={{ position: 'absolute', left: barX + w333, top: 360, width: w56, height: 56, background: C.amber }} />
      <Text x={barX + 960} y={360} w={420} size={44} weight={800} color={C.muted} style={fadeUp(f, at(scene, 3, 0.3))}>so far</Text>
      {S.map((n, i) => (
        <div key={n} style={{ position: 'absolute', left: 120 + i * 120, top: 470, width: 108, height: 100, borderRadius: 18, background: n % 2 === 0 ? `rgba(123,97,255,${0.15 + 0.85 * even})` : `rgba(245,159,10,${0.15 + 0.85 * odd})`, color: (n % 2 === 0 ? even : odd) > 0.5 ? '#fff' : C.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 52, fontWeight: 900, opacity: stripOp, transform: `translateY(${(1 - stripOp) * 20}px)` }}>
          {n}
        </div>
      ))}
      <Text x={1090} y={475} w={100} size={64} weight={900} color={C.muted} style={{ opacity: stripOp }}>…</Text>
      <Note x={120} y={600} w={1500} start={at(scene, 4, 0.4)} color={C.violet} opacity={1 - odd}>even ones are multiples of 18, so of 6: already counted ✓</Note>
      <Note x={120} y={600} w={1100} start={at(scene, 5, 0.4)} color="#d98300" opacity={odd}>odd ones: NEW!</Note>
      <Chip x={1260} y={330} start={at(scene, 6, 0.3)} color={C.violet} size={40}>55 = multiples of 18</Chip>
      <Eq x={1260} y={410} start={at(scene, 6, 0.5)} tex="111 - 55 = 56" size={58} />
      <Eq x={1260} y={500} start={at(scene, 7, 0.5)} tex="333 + 56 = 389" size={58} />
      <Check x={1260} y={590} start={at(scene, 7, 0.8)}>same answer</Check>
      <div style={{ position: 'absolute', left: 120, top: 740, width: 1500, background: C.card, borderRadius: 28, padding: '22px 40px', fontSize: 48, fontWeight: 800, boxShadow: '0 8px 30px rgba(30,40,80,0.08)', opacity: tip, transform: `translateY(${(1 - tip) * 24}px)` }}>
        Tip: one overlap hides inside another
        <span style={{ color: C.muted }}> (4 &amp; 9 sits inside 6 &amp; 9)</span>
      </div>
    </>
  );
};

const Trap: React.FC<{ y: number; start: number; letter: string; tex?: string; node?: React.ReactNode; why: string; fade: number }> = ({ y, start, letter, tex, node, why, fade }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: 90, top: y, width: 1740, height: 150, background: C.card, border: `6px solid ${C.red}`, borderRadius: 28, display: 'flex', alignItems: 'center', gap: 36, padding: '0 36px', whiteSpace: 'nowrap', boxShadow: '0 8px 24px rgba(239,67,67,0.12)', ...fadeUp(f, start), opacity: (fadeUp(f, start).opacity as number) * fade }}>
      <div style={{ background: C.red, color: '#fff', borderRadius: 18, padding: '4px 24px', fontSize: 66, fontWeight: 900, width: 250, textAlign: 'center' }}>
        {letter}
      </div>
      <div style={{ width: 800 }}>{tex ? <Tex tex={tex} size={56} /> : node}</div>
      <div style={{ fontSize: 44, fontWeight: 800, color: C.red, whiteSpace: 'normal', lineHeight: 1.2, flex: 1 }}>{why}</div>
    </div>
  );
};

const Traps: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const cards = 1 - ease(f, at(scene, 5, 0.0), 12);
  const lensIn = ease(f, at(scene, 5, 0.1), 14);
  const t36 = pop(f, at(scene, 5, 0.3));
  const t72 = pop(f, at(scene, 5, 0.6));
  const habit = ease(f, at(scene, 6, 0.1), 14);
  return (
    <>
      <Trap y={150} start={at(scene, 1, 0.1)} letter="E 527" tex="250 + 166 + 111 = 527" why="no overlaps taken away" fade={cards} />
      <Trap y={320} start={at(scene, 2, 0.1)} letter="A 362" tex="527 - 165 = 362" why="forgot to add the 27 back" fade={cards} />
      <Trap y={490} start={at(scene, 3, 0.1)} letter="B 388" tex="389 - 1 = 388" why="left out 1000" fade={cards} />
      <Trap
        y={660}
        start={at(scene, 4, 0.1)}
        letter="D 416"
        tex="527 - 83 - 55 + 27 = 416"
        why="no −27, but +27 added"
        fade={cards}
      />
      {lensIn > 0 && (
        <>
          <Venn
            names={['4', '6', '9']}
            draw={1}
            fill={[lensIn, lensIn, lensIn]}
            namesOp={lensIn}
            dim={lensIn}
            regions={[{ ins: [0, 2], color: C.red, op: 0.25 * lensIn * t36 }]}
            labels={[
              { at: 'abc', text: '36', color: C.ink, op: t36 > 0 ? 1 : 0, dy: -26, size: 48 },
              { at: 'abc', text: '72', color: C.ink, op: t72 > 0 ? 1 : 0, dy: 26, size: 48 },
            ]}
          />
          <Note y={200} start={at(scene, 5, 0.3)}>4 and 9 meet at</Note>
          <Eq y={280} start={at(scene, 5, 0.45)} tex="36,\ 72,\ 108,\ \dots" size={62} />
        </>
      )}
      <div style={{ position: 'absolute', left: PX, top: 470, width: 880, background: C.card, border: `6px solid ${C.green}`, borderRadius: 28, padding: '24px 36px', opacity: habit, transform: `translateY(${(1 - habit) * 24}px)`, boxShadow: '0 8px 24px rgba(33,196,93,0.15)' }}>
        <div style={{ fontSize: 48, fontWeight: 900, color: C.green }}>Habit: the FIRST meeting number</div>
        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 36 }}>
          <Tex tex="4,\ 6 \to 12" size={58} />
          <span style={{ fontSize: 56, fontWeight: 900, color: C.green }}>✓</span>
          <Tex tex="24" size={58} color={C.red} />
          <span style={{ fontSize: 56, fontWeight: 900, color: C.red }}>✗</span>
        </div>
      </div>
    </>
  );
};

const Variant: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Pill x={110} y={130} color={C.violet} style={fadeUp(f, 4)}>Your turn!</Pill>
      <QCard x={110} y={260} w={1700} size={64} start={at(scene, 0, 0.5)} marks={[at(scene, 1, 0.3), at(scene, 2, 0.3)]} lines={Q2} />
    </>
  );
};

const VariantAnswer: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const out = 1 - ease(f, at(scene, 2, 0.02), 10);
  const t = at(scene, 5, 0.8);
  return (
    <>
      <Venn
        names={['4', '6', '10']}
        fill={[1, 1, 1]}
        labels={[
          { at: 'ab', text: '12', op: ease(f, at(scene, 2, 0.5), 10) },
          { at: 'ac', text: '20', op: ease(f, at(scene, 2, 0.5), 10), size: 48 },
          { at: 'bc', text: '30', op: ease(f, at(scene, 2, 0.5), 10) },
          { at: 'abc', text: '60', op: ease(f, at(scene, 3, 0.55), 10) },
        ]}
      />
      <Eq y={170} start={at(scene, 0, 0.3)} tex="300 \div 4 = 75" color={C.primary} opacity={out} size={54} />
      <Eq y={250} start={at(scene, 0, 0.5)} tex="300 \div 6 = 50" color={C.violet} opacity={out} size={54} />
      <Eq y={330} start={at(scene, 0, 0.7)} tex="300 \div 10 = 30" color="#d98300" opacity={out} size={54} />
      <Eq y={420} start={at(scene, 1, 0.3)} tex="75 + 50 + 30 = 155" opacity={out} size={58} />
      <Eq y={170} start={at(scene, 2, 0.3)} tex="300 \div 12 \to 25" size={54} />
      <Eq y={250} start={at(scene, 2, 0.5)} tex="300 \div 20 \to 15" size={54} />
      <Eq y={330} start={at(scene, 2, 0.7)} tex="300 \div 30 \to 10" size={54} />
      <Eq y={420} start={at(scene, 3, 0.25)} tex="25 + 15 + 10 = 50" size={58} color={C.red} />
      <Eq y={510} start={at(scene, 3, 0.65)} tex="300 \div 60 = 5" size={58} color={C.green} />
      <Eq y={610} start={at(scene, 4, 0.1)} tex="155 - 50 + 5" size={62} />
      <Eq y={700} start={at(scene, 5, 0.5)} tex="= 110" size={62} color={C.green} />
      <Answer x={1650} y={700} value="110" start={t} chime={CHIME} />
      <Confetti x={1650} y={700} start={t} seed={11} />
    </>
  );
};

const Recap: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const rules: [string, string, string, number][] = [
    ['+', 'add the three counts', C.green, at(scene, 0, 0.3)],
    ['−', 'take away each pair', C.red, at(scene, 0, 0.62)],
    ['+', 'add back all three', C.green, at(scene, 1, 0.2)],
  ];
  const tile = fadeUp(f, at(scene, 2, 0.5));
  const sign = ease(f, at(scene, 3, 0.1), 16);
  return (
    <>
      {rules.map(([s, t, col, st], i) => (
        <div key={i} style={{ position: 'absolute', left: 100, top: 150 + i * 150, display: 'flex', alignItems: 'center', gap: 30, ...fadeUp(f, st) }}>
          <div style={{ width: 100, height: 100, borderRadius: '50%', background: col, color: '#fff', fontSize: 80, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{s}</div>
          <div style={{ fontSize: 62, fontWeight: 900 }}>{t}</div>
        </div>
      ))}
      <div style={{ position: 'absolute', left: 100, top: 630, display: 'flex', alignItems: 'center', gap: 28, whiteSpace: 'nowrap', ...tile }}>
        <div style={{ fontSize: 46, fontWeight: 800, color: C.muted }}>smallest number they all go into:</div>
        <Tex tex="12" size={64} color={C.green} />
        <span style={{ fontSize: 56, fontWeight: 900, color: C.green }}>✓</span>
        <Tex tex="24" size={64} color={C.red} />
        <span style={{ fontSize: 56, fontWeight: 900, color: C.red }}>✗</span>
      </div>
      <SignOff start={at(scene, 3, 0.1)} />
      <Confetti x={960} y={380} start={at(scene, 3, 0.2)} seed={5} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = {
  intro: Intro,
  question: Question,
  asked: Asked,
  try1: makePause(10, Q1, true),
  singles: Singles,
  pairs: Pairs,
  subtract: Subtract,
  addback: Addback,
  aha: Aha,
  buildup: Buildup,
  traps: Traps,
  variant: Variant,
  try2: makePause(12, Q2, false),
  'variant-answer': VariantAnswer,
  recap: Recap,
};

export const Video: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <Explainer timeline={timeline} scenes={SCENES} badge="AMC 8-style · Level 4" /> : null;
