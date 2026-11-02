import { Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop } from '../../lib/anim';
import { Explainer, at, type SceneComponent, type Timeline } from '../../lib/Explainer';
import { Countdown } from '../../lib/PauseCard';
import { Stage } from '../../lib/grid';
import { PACIFICO } from '../../lib/fonts';
import { Tex } from '../../lib/Tex';
import { Answer, Check, Choices, Confetti, Mark, Pill, Text } from '../../lib/ui';
import { SignOff } from '../../lib/Brand';
import { C } from '../../lib/theme';

export const SLUG = '2026-10-30-juice-mix';
export const CHIME = staticFile(`${SLUG}/sfx/fs-541985.mp3`); // Freesound CC0, see sfx/FREESOUND-CREDITS.md
export const TICK = staticFile(`${SLUG}/sfx/fs-668355.mp3`);

export const JUICE = '#ff9f1c';
export const WATER = '#4cc9f0';
export const JD = '#e08600'; // darker juice, for text
export const WD = '#168fbf'; // darker water, for text
export const BASE = 824; // bottom of every beaker
const SC = 24; // px per liter
const B1 = 140;
const B2 = 560;
const BW = 220;
const PANEL = 900;

// ---------- beaker: stacked bar, juice at the bottom, water on top ----------

type BP = {
  x: number; w?: number; sc?: number; total: number;
  j?: number; wt?: number; jp?: number; wp?: number; jl?: number; wl?: number;
  jText?: string; wText?: string; jAdd?: number; wAdd?: number;
  head?: [string, string]; headOp?: number; op?: number; dashed?: boolean; tint?: number; tintJ?: number; grey?: number; wShift?: number;
};

export const Beaker: React.FC<BP> = ({ x, w = BW, sc = SC, total, j = 0, wt = 0, jp = 0, wp = 0, jl = 0, wl = 0, jText, wText, jAdd = 0, wAdd = 0, head, headOp = 1, op = 1, dashed = false, tint = 0, tintJ = 0.5, grey = 0, wShift = 0 }) => {
  const H = total * sc;
  const hj = j * sc * jp;
  const hw = wt * sc * wp;
  const stripe = (c: string) => `repeating-linear-gradient(45deg, rgba(255,255,255,0.5) 0 9px, rgba(255,255,255,0) 9px 18px), ${c}`;
  const lab: React.CSSProperties = { position: 'absolute', left: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 52, fontWeight: 900, color: C.ink, whiteSpace: 'nowrap', textShadow: '0 0 8px #fff, 0 0 8px #fff' };
  return (
    <>
      <div style={{ position: 'absolute', left: x - 6, top: BASE - H, width: w, height: H, boxSizing: 'content-box', borderStyle: dashed ? 'dashed' : 'solid', borderWidth: '0 6px 6px 6px', borderColor: dashed ? '#aab1c1' : C.ink, borderRadius: '0 0 20px 20px', overflow: 'hidden', opacity: op, background: 'rgba(255,255,255,0.75)' }}>
        {tint > 0 && (
          <>
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: H * tintJ, background: JUICE, opacity: tint * 0.5 }} />
            <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: H * (1 - tintJ), background: WATER, opacity: tint * 0.5 }} />
            <div style={{ ...lab, bottom: 0, height: H * tintJ, fontSize: 48, opacity: tint }}>juice</div>
            <div style={{ ...lab, top: 0, height: H * (1 - tintJ), fontSize: 48, opacity: tint }}>water</div>
          </>
        )}
        {hj > 0 && (
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: hj, background: JUICE, filter: grey > 0 ? `grayscale(${grey}) opacity(${1 - 0.6 * grey})` : undefined }}>
            {jAdd > 0 && <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: Math.min(hj, jAdd * sc), background: stripe(JUICE), borderBottom: '4px solid #fff' }} />}
          </div>
        )}
        {hw > 0 && (
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: hj, height: hw, background: WATER }}>
            {wAdd > 0 && <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: Math.min(hw, wAdd * sc), background: stripe(WATER), borderBottom: '4px solid #fff' }} />}
          </div>
        )}
        {jl > 0 && hj > 0 && <div style={{ ...lab, bottom: 0, height: hj, opacity: jl }}>{jText ?? `${j} L`}</div>}
        {wl > 0 && hw > 0 && <div style={{ ...lab, bottom: hj, height: hw, opacity: wl, transform: `translateY(${-wShift}px)` }}>{wText ?? `${wt} L`}</div>}
      </div>
      {head && (
        <div style={{ position: 'absolute', left: x + w / 2 - 190, width: 380, top: BASE - H - 104, textAlign: 'center', opacity: headOp * op, lineHeight: 1.15 }}>
          <div style={{ fontSize: 46, fontWeight: 900 }}>{head[0]}</div>
          <div style={{ fontSize: 36, fontWeight: 800, color: C.muted }}>{head[1]}</div>
        </div>
      )}
    </>
  );
};

const Level: React.FC<{ x1: number; x2: number; L: number; op?: number; color?: string; sc?: number }> = ({ x1, x2, L, op = 1, color = C.ink, sc = SC }) =>
  op <= 0 ? null : <div style={{ position: 'absolute', left: x1, top: BASE - L * sc - 2, width: x2 - x1, borderTop: `4px dashed ${color}`, opacity: op }} />;

const Bracket: React.FC<{ x: number; L1: number; L2: number; label: string; color: string; op?: number; size?: number; scale?: number }> = ({ x, L1, L2, label, color, op = 1, size = 48, scale = 1 }) => {
  if (op <= 0) return null;
  const top = BASE - L2 * SC;
  const h = (L2 - L1) * SC;
  return (
    <div style={{ opacity: op, transform: `scale(${scale})`, transformOrigin: `${x}px ${top + h / 2}px` }}>
      <div style={{ position: 'absolute', left: x, top, width: 22, height: h, borderStyle: 'solid', borderWidth: '6px 6px 6px 0', borderColor: color, borderRadius: '0 8px 8px 0' }} />
      <div style={{ position: 'absolute', left: x + 38, top: top + h / 2, transform: 'translateY(-50%)', fontSize: size, fontWeight: 900, color, whiteSpace: 'nowrap' }}>{label}</div>
    </div>
  );
};

const Ghost: React.FC<{ x: number; w?: number; Lbot: number; len: number; op?: number; color: string }> = ({ x, w = BW, Lbot, len, op = 1, color }) =>
  op <= 0 ? null : <div style={{ position: 'absolute', left: x - 6, top: BASE - (Lbot + len) * SC, width: w, height: len * SC, boxSizing: 'content-box', border: `6px dashed ${color}`, borderRadius: 6, opacity: op }} />;

/** Arrow between the two beakers, labelled "+ juice / + water". */
const PlusArrow: React.FC<{ x1: number; x2: number; y: number; op: number }> = ({ x1, x2, y, op }) => (
  <>
    <Stage>
      <g opacity={op} stroke={C.ink} strokeWidth={8} strokeLinecap="round" fill={C.ink}>
        <line x1={x1} y1={y} x2={x2 - 14} y2={y} />
        <polygon points={`${x2},${y} ${x2 - 26},${y - 16} ${x2 - 26},${y + 16}`} stroke="none" />
      </g>
    </Stage>
    <div style={{ position: 'absolute', left: x1 - 20, width: x2 - x1 + 40, top: y - 112, textAlign: 'center', fontSize: 38, fontWeight: 900, lineHeight: 1.25, opacity: op }}>
      <div style={{ color: JD }}>+ juice</div>
      <div style={{ color: WD }}>+ water</div>
    </div>
  </>
);

const Eq: React.FC<{ x?: number; y: number; start: number; tex: string; size?: number; color?: string }> = ({ x = PANEL, y, start, tex, size = 56, color = C.ink }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: x, top: y, whiteSpace: 'nowrap', ...fadeUp(f, start) }}>
      <Tex tex={tex} size={size} color={color} />
    </div>
  );
};

const col = (c: string, t: string) => `{\\color{${c}}${t}}`;
const cJ = (t: string) => col(JD, t);
const cW = (t: string) => col(WD, t);

const Card: React.FC<{ x?: number; y: number; w?: number; start: number; children: React.ReactNode; color?: string }> = ({ x = PANEL, y, w = 960, start, children, color = C.red }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, background: C.card, borderRadius: 22, borderLeft: `12px solid ${color}`, padding: '10px 30px', fontSize: 42, fontWeight: 800, boxShadow: '0 6px 22px rgba(30,40,80,0.08)', ...fadeUp(f, start) }}>
      {children}
    </div>
  );
};

const Fade: React.FC<{ op: number; children: React.ReactNode }> = ({ op, children }) => (op <= 0 ? null : <div style={{ opacity: op, position: 'absolute', inset: 0 }}>{children}</div>);

// ---------- scenes ----------

const Intro: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const end1 = at(scene, 1);
  const p = ease(f, 8, end1 - 8);
  const bx = 640;
  const bw = 300;
  const surface = BASE - 8 * SC * 2 * p; // total liquid height (j 7 + w 9 = 16 L)
  const streamOp = 1 - ease(f, end1, 10);
  const jug = (x: number, color: string, rot: number) => (
    <div style={{ position: 'absolute', left: x, top: 140, width: 130, height: 96, background: color, borderRadius: 22, transform: `rotate(${rot}deg)`, boxShadow: '0 8px 20px rgba(30,40,80,0.15)', opacity: ease(f, 0, 10) }} />
  );
  return (
    <>
      <Beaker x={bx} w={bw} total={20} j={7} wt={9} jp={p} wp={p} />
      {jug(bx - 30, JUICE, 18)}
      {jug(bx + bw - 100, WATER, -18)}
      <Stage>
        <g opacity={streamOp * ease(f, 4, 8)}>
          <rect x={bx + 100} y={226} width={22} height={Math.max(0, surface - 226)} rx={8} fill={JUICE} />
          <rect x={bx + bw - 100} y={226} width={22} height={Math.max(0, surface - 226)} rx={8} fill={WATER} />
        </g>
      </Stage>
      <div style={{ position: 'absolute', left: 1100, top: 230, fontSize: 170, fontWeight: 900, color: WD, transform: `scale(${pop(f, end1)})`, transformOrigin: 'left center', opacity: f >= end1 ? 1 : 0 }}>water?</div>
      <div style={{ position: 'absolute', left: 1100, top: 520, ...fadeUp(f, at(scene, 2, 0.25)) }}>
        <div style={{ fontFamily: PACIFICO, fontSize: 110, color: C.violet }}>Vantee</div>
        <div style={{ fontSize: 38, fontWeight: 700, color: C.muted, marginTop: -6 }}>your math tutor</div>
      </div>
    </>
  );
};

export const CH = ['0', '1', '2', '4', '5'];

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const s = (i: number) => ({ opacity: ease(f, at(scene, i), 10) });
  return (
    <>
      <div style={{ position: 'absolute', left: PANEL, top: 140, width: 940, minHeight: 440, background: C.card, borderRadius: 32, padding: '30px 44px', fontSize: 44, fontWeight: 600, lineHeight: 1.45, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', opacity: ease(f, at(scene, 1) - 4, 10) }}>
        <span style={s(1)}>Ella has 20 liters of a drink that is 30% juice. </span>
        <span style={s(2)}>She adds some pure juice and some water. </span>
        <span style={s(3)}>Now she has 25 liters of a drink that is 40% juice. </span>
        <span style={s(4)}>How many <Mark on={at(scene, 4, 0.3)}>liters of water</Mark> does she add?</span>
      </div>
      <Choices x={PANEL} y={680} start={(i) => at(scene, 5, 0.15 + i * 0.12)} items={CH.map((c) => <Tex key={c} tex={c} size={56} />)} />
      <Beaker x={B1} total={20} dashed head={['20 L', '30% juice']} headOp={ease(f, at(scene, 1, 0.3), 12)} op={ease(f, at(scene, 1), 12)} />
      <Beaker x={B2} total={25} dashed head={['25 L', '40% juice']} headOp={ease(f, at(scene, 3, 0.3), 12)} op={ease(f, at(scene, 3), 12)} />
      <PlusArrow x1={B1 + BW + 24} x2={B2 - 24} y={600} op={ease(f, at(scene, 3, 0.15), 12)} />
    </>
  );
};

const Asked: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const tint = ease(f, at(scene, 1, 0.1), 16);
  const wt = ease(f, at(scene, 2, 0.55), 12);
  const hl = 1 + 0.08 * Math.sin(Math.min(1, Math.max(0, (f - at(scene, 2, 0.55)) / 40)) * Math.PI);
  return (
    <>
      <Beaker x={B1} total={20} dashed head={['20 L', '30% juice']} tint={tint} tintJ={0.3} />
      <Beaker x={B2} total={25} dashed head={['25 L', '40% juice']} tint={tint} tintJ={0.4} />
      <PlusArrow x1={B1 + BW + 24} x2={B2 - 24} y={600} op={1} />
      <Text x={PANEL} y={170} w={900} size={60} weight={900} style={fadeUp(f, at(scene, 0, 0.45))}>
        <span style={{ color: C.muted }}>Start:</span> 20 L
      </Text>
      <Text x={PANEL} y={260} w={900} size={60} weight={900} style={fadeUp(f, at(scene, 0, 0.75))}>
        <span style={{ color: C.muted }}>End:</span> 25 L
      </Text>
      <Eq y={400} start={at(scene, 1, 0.55)} size={64} tex={'30\\% = \\dfrac{30}{100}'} />
      <div style={{ position: 'absolute', left: PANEL, top: 560, display: 'flex', flexDirection: 'column', gap: 22 }}>
        <div style={{ ...fadeUp(f, at(scene, 2, 0.15)), alignSelf: 'flex-start', background: 'rgba(255,159,28,0.28)', borderRadius: 999, padding: '10px 36px', fontSize: 52, fontWeight: 900 }}>juice: +?</div>
        <div style={{ ...fadeUp(f, at(scene, 2, 0.35)), alignSelf: 'flex-start', background: WATER, borderRadius: 999, padding: '10px 36px', fontSize: 52, fontWeight: 900, transform: `scale(${hl})`, transformOrigin: 'left center', boxShadow: wt > 0 ? '0 0 0 8px rgba(76,201,240,0.35)' : undefined }}>water: +?</div>
      </div>
    </>
  );
};

const QTEXT1 = (
  <>Ella has 20 liters of a drink that is 30% juice. She adds some pure juice and some water. Now she has 25 liters of a drink that is 40% juice. How many liters of water does she add?</>
);
const QTEXT2 = (
  <>Leo has 15 liters of a drink that is 60% juice. He adds pure juice and water to make 24 liters that is 50% juice. How many liters of juice does he add, and how many liters of water?</>
);

const makePause = (seconds: number, text: React.ReactNode, a: [number, string], b: [number, string]): SceneComponent => ({ scene }) => {
  const f = useCurrentFrame();
  const sc = 16;
  return (
    <>
      <Beaker x={120} w={160} sc={sc} total={a[0]} dashed head={[`${a[0]} L`, a[1]]} />
      <Beaker x={360} w={160} sc={sc} total={b[0]} dashed head={[`${b[0]} L`, b[1]]} />
      <div style={{ position: 'absolute', left: 620, top: 140, width: 790, background: C.card, borderRadius: 28, padding: '24px 36px', fontSize: 44, fontWeight: 600, lineHeight: 1.45, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', ...fadeUp(f, 6) }}>{text}</div>
      <Countdown scene={scene} seconds={seconds} x={1660} y={500} tick={TICK} />
    </>
  );
};

const Start: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const jp = ease(f, at(scene, 2), at(scene, 2, 0.75) - at(scene, 2));
  const wp = ease(f, at(scene, 3, 0.45), 24);
  return (
    <>
      <Beaker x={B1} total={20} j={6} wt={14} jp={jp} wp={wp} jl={ease(f, at(scene, 2, 0.55), 10)} wl={ease(f, at(scene, 3, 0.8), 10)} dashed={jp === 0} head={['20 L', '30% juice']} />
      <Beaker x={B2} total={25} dashed head={['25 L', '40% juice']} />
      <Pill x={PANEL} y={170} color={C.primary} style={{ ...fadeUp(f, at(scene, 0, 0.5)), fontSize: 40 }}>Split each drink: juice + water</Pill>
      <Eq y={290} start={at(scene, 1, 0.3)} tex={'10\\%\\text{ of }20 = 2'} />
      <Eq y={390} start={at(scene, 1, 0.65)} tex={`30\\%\\text{ of }20 = 3\\times 2 = ${cJ('6')}`} />
      <Eq y={520} start={at(scene, 3, 0.4)} tex={`20 - 6 = ${cW('14')}`} />
    </>
  );
};

const End: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const jp = ease(f, at(scene, 2), at(scene, 2, 0.75) - at(scene, 2));
  const wp = ease(f, at(scene, 3, 0.45), 24);
  const hp = 1 + 0.07 * Math.sin(Math.min(1, Math.max(0, (f - at(scene, 0, 0.2)) / 30)) * Math.PI);
  return (
    <>
      <Beaker x={B1} total={20} j={6} wt={14} jp={1} wp={1} jl={1} wl={1} head={['20 L', '30% juice']} />
      <Beaker x={B2} total={25} j={10} wt={15} jp={jp} wp={wp} jl={ease(f, at(scene, 2, 0.55), 10)} wl={ease(f, at(scene, 3, 0.8), 10)} dashed={jp === 0} head={['25 L', '40% juice']} />
      <div style={{ position: 'absolute', left: B2 + BW / 2 - 190, top: BASE - 25 * SC - 104, width: 380, height: 96, transform: `scale(${hp})`, border: `5px solid ${C.violet}`, borderRadius: 18, opacity: ease(f, at(scene, 0, 0.2), 8) * fadeTo(f, at(scene, 1), 0, 10) }} />
      <Eq y={140} start={at(scene, 1, 0.1)} tex={'40\\% = \\dfrac{2}{5}'} />
      <Eq y={300} start={at(scene, 1, 0.45)} tex={'\\dfrac{1}{5}\\text{ of }25 = 5'} />
      <Eq y={460} start={at(scene, 1, 0.75)} tex={`\\dfrac{2}{5}\\text{ of }25 = ${cJ('10')}`} />
      <Eq y={650} start={at(scene, 3, 0.4)} tex={`25 - 10 = ${cW('15')}`} />
    </>
  );
};

const Compare: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const X1 = 200;
  const X2 = 520;
  const lv = ease(f, at(scene, 0, 0.45), 14);
  const slide = ease(f, at(scene, 2, 0.05), 28);
  const ghostX = X1 + (X2 - X1) * slide;
  const ghostL = 6 + 4 * slide;
  const done = at(scene, 4, 0.8);
  return (
    <>
      <Beaker x={X1} total={20} j={6} wt={14} jp={1} wp={1} jl={1} wl={1} head={['20 L', '30% juice']} />
      <Beaker x={X2} total={25} j={10} wt={15} jp={1} wp={1} jl={1} wl={1} head={['25 L', '40% juice']} />
      <Level x1={X1 - 40} x2={X2 + BW + 20} L={6} op={lv} color={JD} />
      <Level x1={X1 - 40} x2={X2 + BW + 20} L={10} op={lv} color={JD} />
      <Bracket x={X2 + BW + 28} L1={6} L2={10} label="+4 L juice" color={JD} op={ease(f, at(scene, 1, 0.3), 10)} />
      <Ghost x={ghostX} Lbot={ghostL} len={14} color={WD} op={ease(f, at(scene, 2, 0.05), 8)} />
      <Bracket x={X2 + BW + 28} L1={24} L2={25} label="+1 L water" color={WD} op={ease(f, at(scene, 2, 0.6), 10)} />
      <Eq x={1180} y={300} start={at(scene, 1, 0.55)} tex={`10 - 6 = ${cJ('4')}`} />
      <Eq x={1180} y={215} start={at(scene, 2, 0.75)} tex={`15 - 14 = ${col(C.green, '1')}`} />
      <Eq x={1180} y={410} start={at(scene, 3, 0.15)} tex={`${cJ('4')} + ${cW('1')} = 5`} />
      <Eq x={1180} y={500} start={at(scene, 3, 0.55)} tex={'20 + 5 = 25'} />
      <Check x={1180} y={610} start={at(scene, 3, 0.85)}>It fits!</Check>
      <Answer x={1730} y={330} value="1 L" start={done} chime={CHIME} />
      <Confetti x={1730} y={330} start={done} seed={5} />
      <Pill x={1600} y={470} color={C.green} style={{ ...fadeUp(f, done + 4), fontSize: 46 }}>Choice B</Pill>
    </>
  );
};

const Water: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const X1 = 110;
  const X2 = 400;
  const w = 200;
  const g = ease(f, 6, 14);
  return (
    <>
      <Beaker x={X1} w={w} total={20} j={6} wt={14} jp={1} wp={1} grey={g} wl={ease(f, at(scene, 1, 0.5), 10)} wText={f < at(scene, 2, 0.5) ? '70%' : '14 L'} head={['20 L', '30% juice']} />
      <Beaker x={X2} w={w} total={25} j={10} wt={15} jp={1} wp={1} grey={g} wl={ease(f, at(scene, 3, 0.5), 10)} wText={f < at(scene, 4, 0.85) ? '60%' : '15 L'} head={['25 L', '40% juice']} />
      <Eq x={680} y={170} size={50} start={at(scene, 1, 0.25)} tex={`100\\% - 30\\% = ${cW('70\\%')}`} />
      <Eq x={680} y={270} start={at(scene, 2, 0.2)} tex={'10\\%\\text{ of }20 = 2'} />
      <Eq x={680} y={360} start={at(scene, 2, 0.6)} tex={`70\\%\\text{ of }20 = ${cW('14')}`} />
      <Eq x={1330} y={170} size={50} start={at(scene, 3, 0.25)} tex={`100\\% - 40\\% = ${cW('60\\%')}`} />
      <Eq x={1330} y={270} start={at(scene, 4, 0.12)} tex={'60\\% = \\dfrac{3}{5}'} />
      <Eq x={1330} y={430} start={at(scene, 4, 0.4)} tex={'\\dfrac{1}{5}\\text{ of }25 = 5'} />
      <Eq x={1330} y={610} start={at(scene, 4, 0.7)} tex={`3 \\times 5 = ${cW('15')}`} />
      <Eq x={680} y={520} start={at(scene, 5, 0.25)} size={64} tex={`15 - 14 = ${col(C.green, '1')}`} />
      <Pill x={680} y={620} color={C.green} style={{ ...fadeUp(f, at(scene, 5, 0.7)), fontSize: 42 }}>same answer</Pill>
      <Pill x={680} y={740} color={C.violet} style={{ ...fadeUp(f, at(scene, 6, 0.3)), fontSize: 38 }}>follow the part the question asks about</Pill>
    </>
  );
};

const Traps: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const X1 = 110;
  const X2 = 400;
  const w = 200;
  const bx = X2 + w + 28;
  const pulse = (i: number) => 1 + 0.12 * Math.sin(Math.min(1, Math.max(0, (f - at(scene, i, 0.2)) / 36)) * Math.PI);
  const refOp = 1 - ease(f, at(scene, 3), 10);
  const aOp = ease(f, at(scene, 3), 10) * (1 - ease(f, at(scene, 5), 10));
  const cOp = ease(f, at(scene, 5), 10);
  const brOp = ease(f, at(scene, 1), 10) * refOp;
  const lvl = ease(f, at(scene, 3), 10);
  return (
    <>
      <Beaker x={X1} w={w} total={20} j={6} wt={14} jp={1} wp={1} jl={1} wl={1} head={['20 L', '30% juice']} />
      <Beaker x={X2} w={w} total={25} j={10} wt={15} jp={1} wp={1} jl={1} wl={1} head={['25 L', '40% juice']} op={refOp} />
      <Beaker x={X2} w={w} total={25} j={11} wt={14} jAdd={5} jp={1} wp={1} jl={ease(f, at(scene, 4, 0.5), 10)} head={['25 L', 'if A']} op={aOp} />
      <Beaker x={X2} w={w} total={25} j={9} wt={16} jAdd={3} wAdd={2} jp={1} wp={1} jl={ease(f, at(scene, 6, 0.6), 10)} head={['25 L', 'if C']} op={cOp} />
      <Level x1={X2 - 30} x2={bx + 24} L={10} op={lvl} color={C.ink} />
      <Bracket x={bx} L1={6} L2={10} label="+4 L" color={JD} op={brOp} scale={pulse(1)} />
      <Bracket x={bx} L1={24} L2={25} label="+1 L" color={WD} op={ease(f, at(scene, 2), 10) * refOp} scale={pulse(2)} />
      <Bracket x={bx} L1={10} L2={11} label="too strong" color={C.red} op={ease(f, at(scene, 4, 0.6), 10) * aOp} size={40} />
      <Bracket x={bx} L1={9} L2={10} label="too weak" color={C.red} op={ease(f, at(scene, 6, 0.7), 10) * cOp} size={40} />
      <Card y={130} start={at(scene, 1)}>D: 4 = juice added</Card>
      <Card y={225} start={at(scene, 2)}>E: 5 = 4 + 1, everything added</Card>
      <Card y={320} start={at(scene, 3)}>A: 0 water, only juice</Card>
      <Eq y={408} size={52} start={at(scene, 4, 0.35)} tex={'6 + 5 = 11'} />
      <Eq x={1380} y={408} size={52} start={at(scene, 4, 0.75)} color={C.red} tex={'11 \\neq 10'} />
      <Card y={505} start={at(scene, 5)}>C: 2 = 10% of 20</Card>
      <Eq y={590} size={52} start={at(scene, 5, 0.5)} tex={'40\\% - 30\\% = 10\\%'} />
      <Text x={1440} y={600} w={440} size={38} weight={800} color={C.muted} style={fadeUp(f, at(scene, 6, 0.15))}>2 water → 3 juice</Text>
      <Eq y={672} size={52} start={at(scene, 6, 0.4)} tex={'6 + 3 = 9'} />
      <Eq x={1380} y={672} size={52} start={at(scene, 6, 0.75)} color={C.red} tex={'9 \\neq 10'} />
      <Pill x={PANEL} y={770} color={C.primary} style={{ ...fadeUp(f, at(scene, 7, 0.25)), fontSize: 38 }}>follow each part, answer the exact question</Pill>
    </>
  );
};

const Variant: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const s = (i: number) => ({ opacity: ease(f, at(scene, i), 10) });
  return (
    <>
      <Pill x={PANEL} y={140} color={C.violet} style={{ ...fadeUp(f, 4), fontSize: 40 }}>A sneakier mix</Pill>
      <div style={{ position: 'absolute', left: PANEL, top: 240, width: 940, minHeight: 400, background: C.card, borderRadius: 32, padding: '30px 44px', fontSize: 44, fontWeight: 600, lineHeight: 1.45, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', opacity: ease(f, at(scene, 1) - 4, 10) }}>
        <span style={s(1)}>Leo has 15 liters of a drink that is 60% juice. </span>
        <span style={s(2)}>He adds pure juice and water to make 24 liters that is 50% juice. </span>
        <span style={s(3)}>
          How many liters of <Mark on={at(scene, 3, 0.35)}>juice</Mark> does he add, <Mark on={at(scene, 3, 0.5)}>and</Mark> how many liters of <Mark on={at(scene, 3, 0.7)}>water</Mark>?
        </span>
      </div>
      <Beaker x={B1} total={15} dashed head={['15 L', '60% juice']} headOp={ease(f, at(scene, 1, 0.3), 12)} op={ease(f, at(scene, 1), 12)} />
      <Beaker x={B2} total={24} dashed head={['24 L', '50% juice']} headOp={ease(f, at(scene, 2, 0.3), 12)} op={ease(f, at(scene, 2), 12)} />
      <PlusArrow x1={B1 + BW + 24} x2={B2 - 24} y={600} op={ease(f, at(scene, 2, 0.15), 12)} />
    </>
  );
};

const VariantAnswer: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const X1 = 100;
  const X2 = 400;
  const w = 200;
  const jp1 = ease(f, at(scene, 1, 0.05), 20);
  const wp1 = ease(f, at(scene, 1, 0.55), 20);
  const jp2 = ease(f, at(scene, 2, 0.5), 18);
  const wp2 = ease(f, at(scene, 2, 0.75), 18);
  const bx = X2 + w + 34;
  const A = 980;
  const B = 1450;
  const lv = ease(f, at(scene, 3, 0.1), 12);
  const chipStart = at(scene, 7, 0.82);
  return (
    <>
      <Beaker x={X1} w={w} total={15} j={9} wt={6} jp={jp1} wp={wp1} jl={ease(f, at(scene, 1, 0.3), 10)} wl={ease(f, at(scene, 1, 0.8), 10)} wShift={44} dashed={jp1 === 0} head={['15 L', '60% juice']} />
      <Beaker x={X2} w={w} total={24} j={12} wt={12} jp={jp2} wp={wp2} jl={ease(f, at(scene, 2, 0.7), 10)} wl={ease(f, at(scene, 2, 0.92), 10)} wShift={44} dashed={jp2 === 0} head={['24 L', '50% juice']} />
      <Level x1={X1 - 30} x2={bx + 20} L={9} op={lv} color={JD} />
      <Level x1={X1 - 30} x2={bx + 20} L={12} op={lv} color={JD} />
      <Bracket x={bx} L1={9} L2={12} label="+3 L" color={JD} op={ease(f, at(scene, 3, 0.4), 10)} />
      <Ghost x={X2} w={w} Lbot={12} len={6} color={WD} op={ease(f, at(scene, 4, 0.1), 10)} />
      <Bracket x={bx} L1={18} L2={24} label="+6 L" color={WD} op={ease(f, at(scene, 4, 0.5), 10)} />
      <Eq x={A} y={140} size={52} start={at(scene, 0, 0.1)} tex={'60\\% = \\dfrac{3}{5}'} />
      <Eq x={A} y={300} size={52} start={at(scene, 0, 0.45)} tex={'\\dfrac{1}{5}\\text{ of }15 = 3'} />
      <Eq x={A} y={460} size={52} start={at(scene, 0, 0.8)} tex={`\\dfrac{3}{5}\\text{ of }15 = ${cJ('9')}`} />
      <Eq x={B} y={150} size={52} start={at(scene, 1, 0.6)} tex={`15 - 9 = ${cW('6')}`} />
      <Eq x={B} y={250} size={52} start={at(scene, 2, 0.25)} tex={'\\dfrac{1}{2}\\text{ of }24 = 12'} />
      <Eq x={B} y={420} size={52} start={at(scene, 3, 0.45)} tex={`12 - 9 = ${cJ('3')}`} />
      <Eq x={B} y={510} size={52} start={at(scene, 4, 0.45)} tex={`12 - 6 = ${cW('6')}`} />
      <Eq x={B} y={600} size={52} start={at(scene, 5, 0.15)} tex={`${cJ('3')} + ${cW('6')} = 9`} />
      <Eq x={B} y={690} size={52} start={at(scene, 5, 0.6)} tex={'15 + 9 = 24'} />
      <Check x={B} y={775} start={at(scene, 5, 0.9)}>It works!</Check>
      <Pill x={A} y={650} color={C.violet} style={{ whiteSpace: 'normal', width: 450, textAlign: 'center', borderRadius: 36,  ...fadeUp(f, at(scene, 6, 0.25)) , opacity: ease(f, at(scene, 6, 0.25), 12) * fadeTo(f, at(scene, 7), 0, 10), fontSize: 36 }}>60% → 50%: weaker, yet +3 juice</Pill>
      <Pill x={880} y={770} color={C.green} style={{ ...fadeUp(f, chipStart), fontSize: 42 }}>3 L juice, 6 L water</Pill>
      <Sequence0 start={chipStart} />
    </>
  );
};

const Sequence0: React.FC<{ start: number }> = ({ start }) => (
  <Sequence from={start} durationInFrames={60} layout="none">
    <Audio src={CHIME} volume={0.3} />
  </Sequence>
);

const Recap: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const out = fadeTo(f, at(scene, 3), 0, 12);
  return (
    <>
      <Fade op={out}>
        <Beaker x={B1} total={20} j={6} wt={14} jp={ease(f, at(scene, 1, 0.3), 16)} wp={ease(f, at(scene, 1, 0.5), 16)} jl={ease(f, at(scene, 1, 0.7), 10)} wl={ease(f, at(scene, 1, 0.8), 10)} head={['20 L', '30% juice']} op={ease(f, 4, 10)} />
        <Beaker x={B2} total={25} j={10} wt={15} jp={ease(f, at(scene, 1, 0.3), 16)} wp={ease(f, at(scene, 1, 0.5), 16)} jl={ease(f, at(scene, 1, 0.7), 10)} wl={ease(f, at(scene, 1, 0.8), 10)} head={['25 L', '40% juice']} op={ease(f, 4, 10)} />
        <Text x={PANEL} y={170} w={900} size={52} weight={900} color={C.primary} style={fadeUp(f, at(scene, 0, 0.3))}>The big idea</Text>
        <Text x={PANEL} y={260} w={940} size={50} weight={800} style={fadeUp(f, at(scene, 1, 0.2))}>Split each drink into</Text>
        <div style={{ position: 'absolute', left: PANEL, top: 340, display: 'flex', gap: 22, ...fadeUp(f, at(scene, 1, 0.5)) }}>
          <div style={{ background: JUICE, borderRadius: 999, padding: '8px 34px', fontSize: 48, fontWeight: 900 }}>juice</div>
          <div style={{ background: WATER, borderRadius: 999, padding: '8px 34px', fontSize: 48, fontWeight: 900 }}>water</div>
        </div>
        <Eq y={470} start={at(scene, 2, 0.35)} size={54} tex={`${cJ('\\text{juice: need} - \\text{have} = \\text{add}')}`} />
        <Eq y={570} start={at(scene, 2, 0.65)} size={54} tex={`${cW('\\text{water: need} - \\text{have} = \\text{add}')}`} />
      </Fade>
      <SignOff start={at(scene, 3, 0.1)} />
      <Confetti x={960} y={380} start={at(scene, 3, 0.2)} seed={3} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = {
  intro: Intro,
  question: Question,
  asked: Asked,
  try1: makePause(10, QTEXT1, [20, '30% juice'], [25, '40% juice']),
  start: Start,
  end: End,
  compare: Compare,
  water: Water,
  traps: Traps,
  variant: Variant,
  try2: makePause(12, QTEXT2, [15, '60% juice'], [24, '50% juice']),
  'variant-answer': VariantAnswer,
  recap: Recap,
};

export const Video: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <Explainer timeline={timeline} scenes={SCENES} badge="AMC 8-style · Level 4" /> : null;
