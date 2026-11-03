import { Audio, Sequence, interpolate, useCurrentFrame } from 'remotion';
import { clamp, ease, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Stage, type Pt } from '../../../lib/grid';
import { CommentBubble, CtaPill, MUSIC, PushIn, SFX, Sfx, ShortFrame, choicePulse } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { CHIME, CHOICES, Lbl, PIV, PMark, Ring, SLUG, Sq, Trail } from '../Composition';

export { SLUG };

// New short recipe: trap-first hook (4π), question, comment bait, the roll move by move (quarter turn r = 1,
// half turn r = √2 with a zoom, P is the pivot: 0, ×2), then (2 + 2√2)π. The board with the small square at home
// sits at the same place in the hook and at the end of the reveal (no trail in the hook), so the loop cuts cleanly.

type M = (p: Pt) => Pt;
const mkm = (ox: number, oy: number, u: number): M => (p) => [ox + u * p[0], oy - u * p[1]];
const U = 170;
const fm = mkm(370, 1080, U); // board x 370…710, y 740…1080; the path spans x 130…950, y 500…1320
const before = () => -100;

const Board: React.FC<{ m: M; u: number; labels?: boolean }> = ({ m, u, labels }) => {
  const [x0, y0] = m([0, 2]);
  return (
    <g>
      <rect x={x0} y={y0} width={2 * u} height={2 * u} fill="#e4e7ef" stroke={C.ink} strokeWidth={8} strokeLinejoin="round" />
      {labels && <Lbl p={[x0 + u, y0 + 2 * u + 40]} text="2" size={56} />}
      {labels && <Lbl p={[x0 - 38, y0 + u]} text="2" size={56} />}
    </g>
  );
};

const Chip: React.FC<{ y: number; children: React.ReactNode }> = ({ y, children }) => (
  <div style={{ position: 'absolute', left: 0, width: 1080, top: y, display: 'flex', justifyContent: 'center' }}>{children}</div>
);

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const nope = at(scene, 0, 0.84);
  return (
    <>
      <Chip y={280}>
        <div style={{ background: C.violet, color: '#fff', borderRadius: 999, padding: '10px 40px', fontSize: 52, fontWeight: 900 }}>AMC 10 · Challenge #14</div>
      </Chip>
      <Text x={540} y={385} w={1000} size={96} weight={900} align="center">
        Think it's <span style={{ color: C.red }}>4π</span>?
      </Text>
      <PushIn frames={scene.frames} origin="540px 880px">
        <Stage>
          <Board m={fm} u={U} />
          <Sq m={fm} T={0} />
          <PMark m={fm} T={0} scale={1.3} label={1.2} />
        </Stage>
      </PushIn>
      <Sfx at={nope} src={SFX.buzz} volume={0.35} />
      <Chip y={760}>
        <div style={{ opacity: ease(f, nope, 4), transform: `rotate(-8deg) scale(${pop(f, nope)})`, border: `14px solid ${C.red}`, color: C.red, background: 'rgba(255,255,255,0.92)', borderRadius: 28, padding: '6px 54px', fontSize: 150, fontWeight: 900, letterSpacing: 6 }}>
          NOPE
        </div>
      </Chip>
    </>
  );
};

// ---- question: figure on the left, the five choices in a column on the right ----
const QU = 150;
const qm = mkm(95, 1070, QU);

const QuestionBody: React.FC<{ start: (i: number) => number; pulse?: (i: number) => number }> = ({ start, pulse = () => 1 }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 50, top: 290, width: 980, boxSizing: 'border-box', background: C.card, borderRadius: 32, padding: '26px 40px', fontSize: 54, fontWeight: 800, lineHeight: 1.35, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        A <b style={{ color: C.primary }}>side-1</b> square rolls clockwise around a fixed <b>side-2</b> square. How long is corner <b style={{ color: C.primary }}>P</b>'s path until it's first back home?
      </div>
      <Stage>
        <Board m={qm} u={QU} labels />
        <Sq m={qm} T={0} />
        <PMark m={qm} T={0} scale={1.1} />
      </Stage>
      <div style={{ position: 'absolute', left: 460, top: 625, width: 460, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 10 }}>
        {CHOICES.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 8), background: C.card, borderRadius: 22, padding: '2px 24px', boxShadow: '0 4px 14px rgba(30,40,80,0.08)', display: 'flex', alignItems: 'center', gap: 16, scale: String(pulse(i)), transformOrigin: 'left center' }}>
            <span style={{ color: C.muted, fontSize: 44, fontWeight: 900 }}>{'ABCDE'[i]}</span>
            <Tex tex={c} size={58} />
          </div>
        ))}
      </div>
    </>
  );
};

const Question: SceneComponent = ({ scene }) => (
  <>
    <QuestionBody start={(i) => at(scene, 1, 0.3 + i * 0.1)} />
    <Sfx at={0} src={SFX.whoosh} volume={0.3} />
  </>
);

const Think: SceneComponent = () => {
  const f = useCurrentFrame();
  return (
    <>
      <QuestionBody start={before} pulse={(i) => choicePulse(f, i)} />
      <CommentBubble y={1130} />
    </>
  );
};

// ---- aha: the roll, move by move ----
const CHIPS: { r: string; arc: string; color: string }[] = [
  { r: 'r=1', arc: '\\tfrac{\\pi}{2}', color: C.primary },
  { r: 'r=\\sqrt2', arc: '\\sqrt2\\,\\pi', color: C.violet },
  { r: 'r=1', arc: '\\tfrac{\\pi}{2}', color: C.primary },
  { r: 'r=0', arc: '0', color: C.muted },
];
const RAD = ['1', '√2', '1', ''];

const Roll: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const t = (i: number, p = 0) => at(scene, i, p);
  // move k runs between keys[k] and ends[k]
  const keys = [t(0, 0.12), t(1, 0.1), t(2, 0.04), t(2, 0.55), ...[0, 1, 2, 3].map((i) => t(3, 0.02 + i * 0.23))];
  const ends = [t(0, 0.8), t(1, 0.85), t(2, 0.4), t(2, 0.85), ...[0, 1, 2, 3].map((i) => t(3, 0.23 + i * 0.23))];
  const input: number[] = [];
  const output: number[] = [];
  keys.forEach((k, i) => { input.push(k, ends[i]); output.push(i, i + 1); });
  const T = interpolate(f, input, output, clamp);
  const k = Math.min(7, Math.floor(T + 1e-6));
  const zoomIn = t(1, 0.02);
  const zoomOut = t(2, 0);
  const zoom = 1 + 0.25 * ease(f, zoomIn, 12) - 0.25 * ease(f, zoomOut, 12);
  const times2 = t(3, 0.05);
  const live = T < 4 && k < 4;
  const radOp = live && k !== 3 && T - k > 0.01 ? 1 : 0;
  const pivotIsP = T >= 3 && T < 4.02 && f < t(3);
  return (
    <>
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      {keys.map((kf, i) => <Sfx key={i} at={kf} src={SFX.click} volume={i < 4 ? 0.3 : 0.22} />)}
      <Sfx at={zoomIn} src={SFX.whoosh} volume={0.25} />
      <Sfx at={zoomOut} src={SFX.whoosh} volume={0.25} />
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: '900px 760px' }}>
        <Stage>
          <Board m={fm} u={U} />
          <Trail m={fm} to={T} width={14} />
          <Sq m={fm} T={T} />
          {live && <Ring m={fm} k={k} f={f} />}
          <Radius T={T} k={k} opacity={radOp} />
          <PMark m={fm} T={T} scale={1.25} label={1.15} />
        </Stage>
      </div>
      <div style={{ position: 'absolute', left: 30, top: 285, width: 1020, display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'center' }}>
        {CHIPS.map((c, i) => {
          const on = T > i || f >= times2;
          const cur = T > i && T < i + 1 && f < times2;
          return (
            <div key={i} style={{ width: 210, textAlign: 'center', background: C.card, borderRadius: 20, border: `6px solid ${c.color}`, padding: '4px 4px', opacity: on ? 1 : 0, transform: `scale(${on ? (cur ? 1.06 : 1) * (0.7 + 0.3 * pop(f, keys[i])) : 0.7})`, boxShadow: cur ? `0 0 0 6px ${C.amber}` : '0 4px 14px rgba(30,40,80,0.08)' }}>
              <div><Tex tex={c.r} size={46} color={c.color} /></div>
              <div><Tex tex={c.arc} size={62} color={c.color} /></div>
            </div>
          );
        })}
        <div style={{ width: 96, fontSize: 72, fontWeight: 900, color: C.green, opacity: ease(f, times2, 6), transform: `scale(${pop(f, times2)})` }}>×2</div>
      </div>
      <Chip y={900}>
        <div style={{ opacity: pivotIsP ? 1 : 0, background: C.ink, color: '#fff', borderRadius: 24, padding: '8px 34px', fontSize: 60, fontWeight: 900 }}>P is the pivot</div>
      </Chip>
    </>
  );
};

/** Dashed pivot → P segment with its length, during move k (screen coords of the live pose). */
const Radius: React.FC<{ T: number; k: number; opacity: number }> = ({ T, k, opacity }) => {
  if (opacity <= 0) return null;
  const pv = PIV[k];
  const pp = livePoint(T);
  const [x1, y1] = fm(pv);
  const [x2, y2] = fm(pp);
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const nx = -(y2 - y1);
  const ny = x2 - x1;
  const nl = Math.hypot(nx, ny) || 1;
  return (
    <g opacity={opacity}>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={k === 1 ? C.violet : C.primary} strokeWidth={7} strokeDasharray="14 10" strokeLinecap="round" />
      <Lbl p={[mx + (nx / nl) * 44, my + (ny / nl) * 44]} text={RAD[k]} color={k === 1 ? C.violet : C.primary} size={64} />
    </g>
  );
};

// P's position at progress T (same rolling model as Composition: 8 moves, 90° / 180° clockwise about PIV, smoothstep)
const ANG = [90, 180, 90, 180, 90, 180, 90, 180];
const rotCW = (p: Pt, c: Pt, deg: number): Pt => {
  const a = (deg * Math.PI) / 180;
  const dx = p[0] - c[0];
  const dy = p[1] - c[1];
  return [c[0] + dx * Math.cos(a) + dy * Math.sin(a), c[1] - dx * Math.sin(a) + dy * Math.cos(a)];
};
const P_STARTS: Pt[] = [[0, 2]];
for (let i = 0; i < 8; i++) P_STARTS.push(rotCW(P_STARTS[i], PIV[i], ANG[i]));
const sm = (u: number) => u * u * (3 - 2 * u);
const livePoint = (T: number): Pt => {
  const k = Math.min(7, Math.max(0, Math.floor(T)));
  const u = T >= 8 ? 1 : T <= 0 ? 0 : sm(T - k);
  return rotCW(P_STARTS[k], PIV[k], ANG[k] * u);
};

// ---- reveal: (2 + 2√2)π over the same board, now with P's whole path ----
const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 0, 0.36);
  const chime = at(scene, 0, 0.97);
  const trap = at(scene, 1);
  return (
    <>
      <Chip y={290}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '10px 44px', display: 'flex', alignItems: 'center', gap: 24, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <span style={{ fontSize: 64, fontWeight: 900 }}>C</span>
          <Tex tex="(2+2\sqrt2)\pi" size={88} color="#fff" />
        </div>
      </Chip>
      <Stage>
        <Board m={fm} u={U} />
        <Trail m={fm} to={8 * ease(f, 4, 50)} width={14} />
        <Sq m={fm} T={0} />
        <PMark m={fm} T={0} scale={1.3} label={1.2} />
      </Stage>
      <div style={{ position: 'absolute', left: 370, width: 340, top: 800, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, ...fadeUp(f, at(scene, 1, 0.02)) }}>
        <div style={{ position: 'relative' }}>
          <Tex tex="4\pi" size={96} color={C.red} />
          <div style={{ position: 'absolute', left: -10, right: -10, top: '52%', height: 9, borderRadius: 5, background: C.red, transform: 'rotate(-12deg)' }} />
        </div>
        <div style={{ opacity: ease(f, at(scene, 1, 0.45), 8) }}>
          <Tex tex="r=\sqrt2" size={64} color={C.violet} />
        </div>
      </div>
      <CtaPill start={at(scene, 2)} y={1225} />
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      <Sfx at={hit - 31} src={SFX.riser} volume={0.3} />
      <Sfx at={trap} src={SFX.buzz} volume={0.2} />
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={370} start={chime} seed={5} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, roll: Roll, reveal: Reveal };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 10-style" captions="words" music={MUSIC} /> : null;
