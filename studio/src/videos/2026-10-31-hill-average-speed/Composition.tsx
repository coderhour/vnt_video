import { Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop } from '../../lib/anim';
import { Explainer, at, type SceneComponent, type Timeline } from '../../lib/Explainer';
import { Countdown } from '../../lib/PauseCard';
import { Stage } from '../../lib/grid';
import { PACIFICO } from '../../lib/fonts';
import { Tex } from '../../lib/Tex';
import { Answer, Check, Confetti, Mark, Pill, Text } from '../../lib/ui';
import { C } from '../../lib/theme';

export const SLUG = '2026-10-31-hill-average-speed';
const CHIME = staticFile(`${SLUG}/sfx/fs-541985.mp3`); // Freesound CC0, see sfx/FREESOUND-CREDITS.md
const TICK = staticFile(`${SLUG}/sfx/fs-668355.mp3`);

const KM = '#2a6fe0'; // km, km/h (blue)
const MS = '#e8590c'; // m, m/s (orange)
const PANEL = 1020;

// ---------- hill geometry (maths-style: front slope rises left to right, back slope is scenery) ----------
const HX0 = 100;
const HX1 = 780;
const HYB = 760;
const HYT = 340;
const sm = (t: number) => t * t * (3 - 2 * t);
const pt = (p: number) => {
  const x = HX0 + (HX1 - HX0) * p;
  const y = HYB - (HYB - HYT) * sm(p);
  const dy = -(HYB - HYT) * 6 * p * (1 - p);
  const dx = HX1 - HX0;
  return { x, y, ang: (Math.atan2(dy, dx) * 180) / Math.PI };
};
const hillPath = (() => {
  const pts: string[] = [];
  for (let i = 0; i <= 40; i++) {
    const p = pt(i / 40);
    pts.push(`${p.x.toFixed(1)},${p.y.toFixed(1)}`);
  }
  for (let i = 1; i <= 20; i++) {
    const u = i / 20;
    pts.push(`${(HX1 + 230 * u).toFixed(1)},${(HYT + (HYB - HYT) * sm(u)).toFixed(1)}`);
  }
  return `M${pts.join(' L')}`;
})();

const Bike: React.FC<{ p: number; dir: 1 | -1; streak?: number }> = ({ p, dir, streak = 0 }) => {
  const q = pt(p);
  return (
    <g transform={`translate(${q.x} ${q.y}) rotate(${q.ang}) scale(${dir} 1)`}>
      {streak > 0 && (
        <g stroke={C.muted} strokeWidth={6} strokeLinecap="round" opacity={streak}>
          <line x1={-60} y1={-30} x2={-130} y2={-30} />
          <line x1={-70} y1={-62} x2={-150} y2={-62} />
          <line x1={-55} y1={-94} x2={-115} y2={-94} />
        </g>
      )}
      <g fill="none" stroke={C.ink} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round">
        <circle cx={-32} cy={-24} r={24} />
        <circle cx={32} cy={-24} r={24} />
        <path d="M-32 -24 L-6 -60 L22 -60 L32 -24 M-6 -60 L0 -24 L-32 -24" stroke={C.violet} />
        <path d="M-6 -60 L6 -92 M6 -92 L24 -66" stroke={C.primary} strokeWidth={9} />
      </g>
      <circle cx={8} cy={-110} r={15} fill={C.amber} />
    </g>
  );
};

/** The hill. `p` = bike position along the slope (null hides the bike). `tx, ty, sc` place and scale the whole drawing. */
const Hill: React.FC<{ p: number | null; dir?: 1 | -1; streak?: number; sc?: number; tx?: number; ty?: number; op?: number; dashed?: boolean }> = ({
  p, dir = 1, streak = 0, sc = 1, tx = 0, ty = 0, op = 1, dashed = false,
}) => (
  <Stage>
    <g transform={`translate(${tx} ${ty}) scale(${sc})`} opacity={op}>
      <path d={`${hillPath} L1010,${HYB} L${HX0},${HYB} Z`} fill={dashed ? 'rgba(12,194,129,0.07)' : '#d6f3e4'} stroke="#3aa675" strokeWidth={8} strokeDasharray={dashed ? '22 14' : undefined} strokeLinejoin="round" />
      <line x1={40} y1={HYB} x2={1070} y2={HYB} stroke="#3aa675" strokeWidth={8} strokeLinecap="round" />
      {p !== null && <Bike p={p} dir={dir} streak={streak} />}
    </g>
  </Stage>
);

/** Bike position over time: slow up, pause, fast down. Returns [p, dir, streak]. */
const ride = (f: number, upStart: number, upDur: number, downStart: number, downDur: number): [number, 1 | -1, number] => {
  if (f < downStart) return [ease(f, upStart, upDur), 1, 0];
  const d = Math.min(1, Math.max(0, (f - downStart) / downDur));
  return [1 - d * d, -1, d > 0 && d < 1 ? 0.9 : 0];
};

// ---------- small pieces ----------
const col = (c: string, t: string) => `{\\color{${c}}${t}}`;
const kmh = col(KM, '\\text{km/h}');
const ms = col(MS, '\\text{m/s}');

const Eq: React.FC<{ x?: number; y: number; start: number; tex: string; size?: number; color?: string; op?: number }> = ({ x = PANEL, y, start, tex, size = 52, color = C.ink, op = 1 }) => {
  const f = useCurrentFrame();
  if (op <= 0) return null;
  return (
    <div style={{ position: 'absolute', left: x, top: y, whiteSpace: 'nowrap', ...fadeUp(f, start), opacity: ease(f, start, 14) * op }}>
      <Tex tex={tex} size={size} color={color} />
    </div>
  );
};

const Boxed: React.FC<{ x?: number; y: number; start: number; tex: string }> = ({ x = PANEL, y, start, tex }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: x, top: y, whiteSpace: 'nowrap', background: C.card, border: `6px solid ${C.green}`, borderRadius: 22, padding: '4px 28px', boxShadow: '0 6px 22px rgba(30,40,80,0.08)', ...fadeUp(f, start) }}>
      <Tex tex={tex} size={56} />
    </div>
  );
};

/** Speed tag: value in ink, unit in its own colour. */
const Tag: React.FC<{ x: number; y: number; label: string; value: string; unit: string; color: string; start: number; hl?: number }> = ({ x, y, label, value, unit, color, start, hl = 0 }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: x, top: y, display: 'flex', alignItems: 'baseline', gap: 14, background: C.card, borderRadius: 22, padding: '8px 28px', borderLeft: `12px solid ${color}`, fontSize: 52, fontWeight: 900, boxShadow: `0 6px 22px rgba(30,40,80,0.08)${hl > 0 ? `, 0 0 0 ${8 * hl}px ${color}44` : ''}`, whiteSpace: 'nowrap', ...fadeUp(f, start) }}>
      <span style={{ fontSize: 40, fontWeight: 800, color: C.muted }}>{label}</span>
      <span>{value}</span>
      <span style={{ color }}>{unit}</span>
    </div>
  );
};

const Clock: React.FC<{ x: number; y: number; text: string; color: string; start: number }> = ({ x, y, text, color, start }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: x, top: y, display: 'flex', alignItems: 'center', gap: 16, fontSize: 48, fontWeight: 900, color, ...fadeUp(f, start) }}>
      <svg width={54} height={54} viewBox="0 0 54 54">
        <circle cx={27} cy={27} r={23} fill="#fff" stroke={color} strokeWidth={6} />
        <path d="M27 14 V27 L36 33" stroke={color} strokeWidth={5} fill="none" strokeLinecap="round" />
      </svg>
      {text}
    </div>
  );
};

const HillLabel: React.FC<{ x: number; y: number; text: string; start: number }> = ({ x, y, text, start }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: x, top: y, background: '#fff', borderRadius: 999, padding: '6px 30px', fontSize: 48, fontWeight: 900, whiteSpace: 'nowrap', border: `5px solid #3aa675`, ...fadeUp(f, start) }}>{text}</div>
  );
};

const Card: React.FC<{ x?: number; y: number; w?: number; start: number; children: React.ReactNode; color?: string; size?: number }> = ({ x = PANEL, y, w = 860, start, children, color = C.primary, size = 48 }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, background: C.card, borderRadius: 22, borderLeft: `12px solid ${color}`, padding: '10px 30px', fontSize: size, fontWeight: 800, boxShadow: '0 6px 22px rgba(30,40,80,0.08)', ...fadeUp(f, start) }}>
      {children}
    </div>
  );
};

const U: React.FC<{ c: string; on: number; children: React.ReactNode }> = ({ c, on, children }) => {
  const f = useCurrentFrame();
  const p = ease(f, on, 14);
  return (
    <span style={{ color: p > 0 ? c : undefined, fontWeight: p > 0 ? 800 : 600, backgroundImage: `linear-gradient(${c}, ${c})`, backgroundSize: `${p * 100}% 6px`, backgroundRepeat: 'no-repeat', backgroundPosition: '0 100%', paddingBottom: 4 }}>{children}</span>
  );
};

const Fade: React.FC<{ op: number; children: React.ReactNode }> = ({ op, children }) => (op <= 0 ? null : <div style={{ opacity: op, position: 'absolute', inset: 0 }}>{children}</div>);

const Strike: React.FC<{ x: number; y: number; w: number; start: number }> = ({ x, y, w, start }) => {
  const f = useCurrentFrame();
  const p = ease(f, start, 14);
  return p <= 0 ? null : <div style={{ position: 'absolute', left: x, top: y, width: w * p, height: 9, background: C.red, borderRadius: 5, transform: 'rotate(-3deg)', transformOrigin: 'left center' }} />;
};

const QBOX: React.CSSProperties = { position: 'absolute', background: C.card, borderRadius: 32, padding: '26px 40px', fontWeight: 600, lineHeight: 1.45, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' };

// ---------- scenes ----------

const Intro: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const L0 = scene.lines[0].frames;
  const [p, dir, streak] = ride(f, 10, Math.round(L0 * 0.5), at(scene, 0, 0.62), Math.round(L0 * 0.22));
  return (
    <>
      <Hill p={p} dir={dir} streak={streak} />
      <Tag x={110} y={170} label="up" value="12" unit="km/h" color={KM} start={at(scene, 0, 0.12)} />
      <Tag x={110} y={265} label="down" value="10" unit="m/s" color={MS} start={at(scene, 0, 0.62)} />
      <Text x={PANEL} y={170} w={860} size={80} weight={900} color={C.violet} style={{ ...fadeUp(f, at(scene, 0, 0.8)), transform: `scale(${0.9 + 0.1 * pop(f, at(scene, 0, 0.8))})`, transformOrigin: 'left center' }}>average speed?</Text>
      <div style={{ position: 'absolute', left: PANEL, top: 320, width: 780, height: 90, background: C.card, borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 22px rgba(30,40,80,0.08)', ...fadeUp(f, at(scene, 1, 0.05)) }}>
        <Tex tex="(12 + 10) \div 2 = \,?" size={54} />
      </div>
      <Strike x={PANEL - 10} y={360} w={800} start={at(scene, 1, 0.3)} />
      <div style={{ position: 'absolute', left: PANEL, top: 440, width: 780, height: 90, background: C.card, borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, fontSize: 52, fontWeight: 900, boxShadow: '0 6px 22px rgba(30,40,80,0.08)', ...fadeUp(f, at(scene, 1, 0.62)) }}>
        <span style={{ color: KM }}>km/h</span>
        <span style={{ color: C.red }}>vs</span>
        <span style={{ color: MS }}>m/s</span>
        <span style={{ color: C.red }}>?</span>
      </div>
      <div style={{ position: 'absolute', left: PANEL, top: 600, ...fadeUp(f, at(scene, 2, 0.25)) }}>
        <div style={{ fontFamily: PACIFICO, fontSize: 110, color: C.violet }}>Vantee</div>
        <div style={{ fontSize: 38, fontWeight: 700, color: C.muted, marginTop: -6 }}>your math tutor</div>
      </div>
    </>
  );
};

const CHOICES = ['11', '18', '22', '24', '36'];

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const s = (i: number) => ({ opacity: ease(f, at(scene, i), 10) });
  const [p, dir, streak] = ride(f, at(scene, 1, 0.3), Math.round(scene.lines[1].frames * 0.65), at(scene, 2, 0.35), 30);
  const pp = f < at(scene, 1, 0.3) ? 0 : p;
  return (
    <>
      <Hill p={pp} dir={dir} streak={streak} />
      <HillLabel x={470} y={600} text="3 km" start={at(scene, 1, 0.05)} />
      <Tag x={110} y={170} label="up" value="12" unit="km/h" color={KM} start={at(scene, 1, 0.5)} />
      <Tag x={110} y={265} label="down" value="10" unit="m/s" color={MS} start={at(scene, 2, 0.5)} />
      <div style={{ ...QBOX, left: PANEL, top: 130, width: 860, fontSize: 42, opacity: ease(f, at(scene, 1) - 4, 10) }}>
        <span style={s(1)}>Jo bikes up a 3-km hill at <U c={KM} on={at(scene, 1, 0.55)}>12 km per hour</U>. </span>
        <span style={s(2)}>She then bikes back down the same hill at <U c={MS} on={at(scene, 2, 0.6)}>10 meters per second</U>. </span>
        <span style={s(3)}>What is her average speed for the whole round trip, in <Mark on={at(scene, 3, 0.5)}>km per hour</Mark>?</span>
      </div>
      <div style={{ position: 'absolute', left: PANEL, top: 650, display: 'flex', gap: 14 }}>
        {CHOICES.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, at(scene, 4, 0.15 + i * 0.12), 10), background: C.card, borderRadius: 18, padding: '10px 16px', fontSize: 48, fontWeight: 800, boxShadow: '0 4px 14px rgba(30,40,80,0.07)', whiteSpace: 'nowrap' }}>
            <span style={{ color: C.muted, fontSize: 48, marginRight: 8 }}>{'ABCDE'[i]}</span>
            <Tex tex={c} size={52} />
          </div>
        ))}
      </div>
    </>
  );
};

const Asked: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hl = (i: number) => 1 + 0.07 * Math.sin(Math.min(1, Math.max(0, (f - at(scene, 1, 0.3 + i * 0.25)) / 30)) * Math.PI);
  return (
    <>
      <Hill p={0} />
      <HillLabel x={470} y={600} text="3 km" start={4} />
      <Eq y={150} start={at(scene, 0, 0.3)} tex={`\\text{up: }3\\text{ km at }12\\ ${kmh}`} />
      <Eq y={240} start={at(scene, 0, 0.7)} tex={`\\text{down: }3\\text{ km at }10\\ ${ms}`} />
      <div style={{ position: 'absolute', left: PANEL, top: 360, display: 'flex', alignItems: 'center', gap: 24, ...fadeUp(f, at(scene, 1, 0.3)) }}>
        <div style={{ background: C.card, border: `6px solid ${KM}`, color: KM, borderRadius: 999, padding: '8px 36px', fontSize: 56, fontWeight: 900, transform: `scale(${hl(0)})` }}>km/h</div>
        <div style={{ fontSize: 64, fontWeight: 900, color: C.red }}>≠</div>
        <div style={{ background: C.card, border: `6px solid ${MS}`, color: MS, borderRadius: 999, padding: '8px 36px', fontSize: 56, fontWeight: 900, transform: `scale(${hl(1)})` }}>m/s</div>
      </div>
      <Text x={PANEL} y={480} w={860} size={48} weight={800} color={C.muted} style={fadeUp(f, at(scene, 1, 0.7))}>different units!</Text>
      <Card y={580} start={at(scene, 2, 0.25)} w={850} color={C.violet}>
        <Tex tex={'\\text{average speed} = \\dfrac{\\text{total distance}}{\\text{total time}}'} size={48} />
      </Card>
    </>
  );
};

const makePause = (seconds: number, text: React.ReactNode): SceneComponent => ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Hill p={0} sc={0.62} tx={20} ty={330} />
      <div style={{ ...QBOX, left: 60, top: 130, width: 1020, fontSize: 42, ...fadeUp(f, 6) }}>{text}</div>
      <Countdown scene={scene} seconds={seconds} x={1500} y={520} tick={TICK} />
    </>
  );
};

const QT1 = <>Jo bikes up a 3-km hill at 12 km per hour. She then bikes back down the same hill at 10 meters per second. What is her average speed for the whole round trip, in km per hour?</>;
const QT2 = <>Max bikes up a 3-km hill at 9 km per hour. He comes back down at 5 meters per second. What is his average speed, in km per hour?</>;

const Convert: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const [p, dir, streak] = ride(f, 0, 1, 0, 1);
  const zoom = Math.min(1, Math.max(0, (f - at(scene, 1)) / 40));
  const pp = 1 - zoom * (f < at(scene, 2) ? 1 : 1);
  void p; void dir; void streak;
  const lbl = f < at(scene, 4, 0.55) ? { v: '10', u: 'm/s', c: MS } : { v: '36', u: 'km/h', c: KM };
  return (
    <>
      <Hill p={f < at(scene, 1) ? 1 : pp} dir={-1} streak={zoom > 0 && zoom < 1 ? 0.9 : 0} />
      <Tag x={110} y={170} label="down" value={lbl.v} unit={lbl.u} color={lbl.c} start={at(scene, 0, 0.5)} hl={Math.sin(ease(f, at(scene, 4, 0.55), 20) * Math.PI)} />
      <Pill x={PANEL} y={125} color={C.primary} style={{ ...fadeUp(f, at(scene, 0, 0.45)), fontSize: 40 }}>total distance</Pill>
      <Pill x={PANEL + 330} y={125} color={C.violet} style={{ ...fadeUp(f, at(scene, 0, 0.75)), fontSize: 40 }}>total time</Pill>
      <Eq y={215} start={at(scene, 1, 0.55)} tex={`10\\ ${ms} = 10\\text{ m every }1\\text{ s}`} />
      <Eq y={315} start={at(scene, 2, 0.35)} tex={'1\\text{ hour} = 3600\\text{ s}'} />
      <Eq y={415} start={at(scene, 3, 0.45)} tex={`10 \\times 3600 = 36\\,000\\text{ m per hour}`} />
      <Eq y={515} start={at(scene, 4, 0.1)} tex={`36\\,000\\text{ m} = 36\\text{ km}`} />
      <Boxed y={625} start={at(scene, 4, 0.55)} tex={`10\\ ${ms} = 36\\ ${kmh}`} />
    </>
  );
};

const Times: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const [p, dir, streak] = ride(f, at(scene, 0, 0.1), Math.round(scene.lines[0].frames * 0.8), at(scene, 1, 0.1), 28);
  const done = at(scene, 6, 1);
  const pillOp = fadeTo(f, at(scene, 6), 0, 8);
  return (
    <>
      <Hill p={p} dir={dir} streak={streak} />
      <Tag x={110} y={160} label="up" value="12" unit="km/h" color={KM} start={2} />
      <Clock x={120} y={238} text="15 min" color={KM} start={at(scene, 0, 0.75)} />
      <Tag x={110} y={320} label="down" value="36" unit="km/h" color={KM} start={at(scene, 1, 0.1)} />
      <Clock x={120} y={398} text="5 min" color={MS} start={at(scene, 2, 0.2)} />
      <Eq y={105} start={at(scene, 0, 0.1)} tex={`3 \\div 12 = \\dfrac{1}{4}\\text{ h}${f < at(scene, 0, 0.62) ? '' : ' = 15\\text{ min}'}`} />
      <Eq y={245} start={at(scene, 1, 0.3)} tex={`3 \\div 36 = \\dfrac{1}{12}\\text{ h}${f < at(scene, 2, 0.1) ? '' : ' = 5\\text{ min}'}`} />
      <Eq y={395} start={at(scene, 3, 0.2)} tex={'3 + 3 = 6\\text{ km}'} />
      <Eq y={470} start={at(scene, 3, 0.55)} tex={'15 + 5 = 20\\text{ min}'} />
      <Eq y={550} start={at(scene, 4, 0.1)} tex={'20\\text{ min} = \\dfrac{1}{3}\\text{ h}'} />
      <div style={{ position: 'absolute', left: 1500, top: 580, fontSize: 38, fontWeight: 900, color: '#fff', background: C.violet, borderRadius: 999, padding: '8px 26px', ...fadeUp(f, at(scene, 4, 0.55)), opacity: ease(f, at(scene, 4, 0.55), 14) * pillOp, whiteSpace: 'nowrap' }}>3 times as far</div>
      <Eq x={1120} y={690} start={at(scene, 5, 0.12)} tex={'6 \\times 3 = 18\\text{ km/h}'} size={60} />
      <Answer x={1780} y={560} value="18" start={done} chime={CHIME} />
      <Confetti x={1780} y={560} start={done} seed={7} />
      <Pill x={1650} y={805} color={C.green} style={{ ...fadeUp(f, done + 4), fontSize: 40 }}>Choice B</Pill>
    </>
  );
};

const Friendly: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const [p, dir, streak] = ride(f, at(scene, 2, 0.1), Math.round(scene.lines[2].frames * 0.4), at(scene, 2, 0.62), 24);
  const pp = f < at(scene, 2, 0.1) ? 0 : p;
  return (
    <>
      <Hill p={pp} dir={dir} streak={streak} dashed={f >= at(scene, 1, 0.2)} />
      <HillLabel x={f < at(scene, 1, 0.2) ? 470 : 280} y={600} text={f < at(scene, 1, 0.2) ? '3 km' : '36 km (pretend)'} start={3} />
      <Tag x={110} y={170} label="up" value="12" unit="km/h" color={KM} start={2} />
      <Tag x={110} y={265} label="down" value="36" unit="km/h" color={KM} start={2} />
      <Card y={120} start={at(scene, 0, 0.55)} w={880}>length changes, average doesn't</Card>
      <Eq y={225} start={at(scene, 2, 0.15)} tex={'\\text{up: }36 \\div 12 = 3\\text{ h}'} />
      <Eq y={315} start={at(scene, 2, 0.6)} tex={'\\text{down: }36 \\div 36 = 1\\text{ h}'} />
      <Eq y={430} start={at(scene, 3, 0.1)} tex={'36 + 36 = 72\\text{ km}'} />
      <Eq y={510} start={at(scene, 3, 0.3)} tex={'3 + 1 = 4\\text{ h}'} />
      <Eq y={595} start={at(scene, 3, 0.55)} tex={'72 \\div 4 = 18\\text{ km/h}'} size={56} />
      <Pill x={PANEL} y={715} color={C.violet} style={{ ...fadeUp(f, at(scene, 5, 0.2)), fontSize: 44 }}>pick a length both speeds divide</Pill>
    </>
  );
};

const TrapRow: React.FC<{ y: number; letter: string; tex: string; note: string; start: number; show?: number }> = ({ y, letter, tex, note, start }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: 60, top: y, width: 930, height: 96, background: C.card, borderRadius: 22, borderLeft: `12px solid ${C.red}`, display: 'flex', alignItems: 'center', gap: 22, padding: '0 26px', boxShadow: '0 6px 22px rgba(30,40,80,0.08)', ...fadeUp(f, start) }}>
      <span style={{ color: C.muted, fontSize: 48, fontWeight: 800 }}>{letter}</span>
      <span style={{ whiteSpace: 'nowrap' }}><Tex tex={tex} size={52} /></span>
      <span style={{ marginLeft: 'auto', fontSize: 42, fontWeight: 800, color: C.red, whiteSpace: 'nowrap' }}>{note}</span>
    </div>
  );
};

const Traps: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const [p, dir, streak] = ride(f, at(scene, 5, 0.1), Math.round(scene.lines[5].frames * 0.35), at(scene, 5, 0.55), 20);
  const pp = f < at(scene, 5, 0.1) ? 0 : p;
  const bar = (i: number, d: number) => ease(f, at(scene, 5, d), 20);
  return (
    <>
      <Hill p={pp} dir={dir} streak={streak} sc={0.5} tx={10} ty={400} />
      <TrapRow y={120} letter="A" start={at(scene, 1, 0.15)} tex={`(12 + 10) \\div 2 = 11`} note="mixed units" />
      <TrapRow y={230} letter="C" start={at(scene, 2, 0.15)} tex={'12 + 10 = 22'} note="adding speeds" />
      <TrapRow y={340} letter="E" start={at(scene, 3, 0.15)} tex={'36'} note="downhill only" />
      <TrapRow y={450} letter="D" start={at(scene, 4, 0.15)} tex={'(12 + 36) \\div 2 = 24'} note="still a trap" />
      <Text x={PANEL + 40} y={130} w={820} size={42} weight={800} color={C.muted} style={fadeUp(f, at(scene, 5, 0.1))}>time on the hill</Text>
      {bar(0, 0.15) > 0 && <div style={{ position: 'absolute', left: PANEL + 40, top: 200, width: 800 * 0.75 * bar(0, 0.15), height: 80, background: KM, borderRadius: 18, color: '#fff', fontSize: 48, fontWeight: 900, display: 'flex', alignItems: 'center', paddingLeft: 26, whiteSpace: 'nowrap', overflow: 'hidden' }}>{bar(0, 0.15) > 0.6 ? '15 min slow' : ''}</div>}
      {bar(1, 0.5) > 0 && <div style={{ position: 'absolute', left: PANEL + 40, top: 300, width: 800 * 0.25 * bar(1, 0.5) * 1.15, height: 80, background: MS, borderRadius: 18, color: '#fff', fontSize: 48, fontWeight: 900, display: 'flex', alignItems: 'center', paddingLeft: 26, whiteSpace: 'nowrap', overflow: 'hidden' }}>{bar(1, 0.5) > 0.6 ? '5 min' : ''}</div>}
      <Text x={PANEL + 40} y={400} w={820} size={42} weight={800} color={C.ink} style={fadeUp(f, at(scene, 6, 0.3))}>slow part = more time = lower average</Text>
      <Card x={PANEL + 40} y={470} w={800} start={at(scene, 7, 0.4)} color={C.green}>
        <div style={{ fontSize: 44, color: C.muted }}>average speed =</div>
        <Tex tex={'\\dfrac{\\text{total distance}}{\\text{total time}}'} size={50} />
        <div style={{ fontSize: 44, color: C.red, marginTop: 4 }}>never just average the speeds</div>
      </Card>
    </>
  );
};

const Variant: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const [p, dir, streak] = ride(f, at(scene, 0, 0.55), Math.round(scene.lines[0].frames * 0.4), at(scene, 1, 0.1), 26);
  const pp = f < at(scene, 0, 0.55) ? 0 : p;
  return (
    <>
      <Hill p={pp} dir={dir} streak={streak} />
      <HillLabel x={470} y={600} text="3 km" start={at(scene, 0, 0.3)} />
      <Tag x={110} y={170} label="up" value="9" unit="km/h" color={KM} start={at(scene, 0, 0.7)} />
      <Tag x={110} y={265} label="down" value="5" unit="m/s" color={MS} start={at(scene, 1, 0.1)} />
      <Pill x={PANEL} y={130} color={C.violet} style={{ ...fadeUp(f, 4), fontSize: 40 }}>A gentler hill</Pill>
      <div style={{ ...QBOX, left: PANEL, top: 230, width: 860, fontSize: 42, opacity: ease(f, 6, 10) }}>
        <span style={{ opacity: ease(f, at(scene, 0), 10) }}>Max bikes up a 3-km hill at <U c={KM} on={at(scene, 0, 0.75)}>9 km per hour</U>. </span>
        <span style={{ opacity: ease(f, at(scene, 1), 10) }}>He comes back down at <U c={MS} on={at(scene, 1, 0.25)}>5 meters per second</U>. What is his average speed, in <Mark on={at(scene, 1, 0.65)}>km per hour</Mark>?</span>
      </div>
    </>
  );
};

const VariantAnswer: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const X = 1190;
  const [p, dir, streak] = ride(f, at(scene, 3, 0.05), 40, at(scene, 3, 0.55), 22);
  const pp = f < at(scene, 3, 0.05) ? 0 : p;
  const done = at(scene, 5, 1);
  const conv = fadeTo(f, at(scene, 3), 0, 10); // unit-conversion rows give way to the times
  const fo = fadeTo(f, at(scene, 6), 0, 12);
  const lbl = f < at(scene, 2, 0.1) ? { v: '5', u: 'm/s', c: MS } : { v: '18', u: 'km/h', c: KM };
  return (
    <>
      <Hill p={pp} dir={dir} streak={streak} />
      <Tag x={110} y={170} label="up" value="9" unit="km/h" color={KM} start={2} />
      <Tag x={110} y={265} label="down" value={lbl.v} unit={lbl.u} color={lbl.c} start={2} hl={Math.sin(ease(f, at(scene, 2, 0.1), 20) * Math.PI)} />
      <Eq x={X} y={125} size={50} op={conv} start={at(scene, 1, 0.1)} tex={'5 \\times 3600 = 18\\,000\\text{ m}'} />
      <Eq x={X} y={205} size={50} op={conv} start={at(scene, 2, 0.1)} tex={'18\\,000\\text{ m} = 18\\text{ km}'} />
      <div style={{ opacity: conv }}>
        <Boxed x={X} y={285} start={at(scene, 2, 0.4)} tex={`5\\ ${ms} = 18\\ ${kmh}`} />
      </div>
      <Eq x={X} y={125} size={50} op={fo} start={at(scene, 3, 0.1)} tex={`3 \\div 9 = \\dfrac{1}{3}\\text{ h} = 20\\text{ min}`} />
      <Eq x={X} y={260} size={50} op={fo} start={at(scene, 3, 0.6)} tex={`3 \\div 18 = \\dfrac{1}{6}\\text{ h} = 10\\text{ min}`} />
      <Eq x={X} y={385} size={50} op={fo} start={at(scene, 4, 0.2)} tex={'3 + 3 = 6\\text{ km}'} />
      <Eq x={X} y={455} size={50} op={fo} start={at(scene, 4, 0.55)} tex={'20 + 10 = 30\\text{ min}'} />
      <Eq x={X} y={530} size={50} op={fo} start={at(scene, 5, 0.1)} tex={'30\\text{ min} = \\dfrac{1}{2}\\text{ h}'} />
      <Eq x={X} y={665} size={58} start={at(scene, 5, 0.55)} tex={'6 \\times 2 = 12\\text{ km/h}'} />
      <Eq x={X} y={300} size={56} start={at(scene, 6, 0.45)} tex={f < at(scene, 7, 0.1) ? '(9 + 18) \\div 2 = 13.5' : '{\\color{#ef4343}\\cancel{(9 + 18) \\div 2 = 13.5}}'} />
      <Answer x={960} y={190} value="12" start={done} chime={CHIME} />
      <Pill x={880} y={330} color={C.green} style={{ ...fadeUp(f, done + 4), fontSize: 40 }}>km/h</Pill>
      <Check x={X} y={825} start={at(scene, 8, 0.2)}>Amazing work!</Check>
    </>
  );
};

const Recap: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const out = fadeTo(f, at(scene, 3), 0, 12);
  return (
    <>
      <Fade op={out}>
        <Hill p={0.35} />
        <Text x={PANEL} y={150} w={860} size={56} weight={900} color={C.primary} style={fadeUp(f, at(scene, 0, 0.3))}>The big idea</Text>
        <Card y={260} start={at(scene, 1, 0.1)} color={KM}>1  match the units</Card>
        <Card y={370} start={at(scene, 1, 0.55)} color={C.violet}>2  total distance, total time</Card>
        <Card y={500} start={at(scene, 2, 0.15)} color={C.green} w={850}>
          <Tex tex={'\\text{average speed} = \\dfrac{\\text{total distance}}{\\text{total time}}'} size={48} />
        </Card>
        <div style={{ position: 'absolute', left: PANEL, top: 690, fontSize: 42, fontWeight: 800, color: C.red, ...fadeUp(f, at(scene, 2, 0.7)) }}>never average the two speeds</div>
      </Fade>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', ...fadeUp(f, at(scene, 3, 0.1)) }}>
        <div style={{ fontFamily: PACIFICO, fontSize: 130, color: C.violet }}>Vantee</div>
        <div style={{ fontSize: 54, fontWeight: 900, marginTop: 10 }}>Keep exploring!</div>
      </div>
      <Confetti x={960} y={380} start={at(scene, 3, 0.2)} seed={3} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = {
  intro: Intro,
  question: Question,
  asked: Asked,
  try1: makePause(10, QT1),
  convert: Convert,
  times: Times,
  friendly: Friendly,
  traps: Traps,
  variant: Variant,
  try2: makePause(12, QT2),
  'variant-answer': VariantAnswer,
  recap: Recap,
};

export const Video: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <Explainer timeline={timeline} scenes={SCENES} badge="AMC 8-style · Level 5" /> : null;
