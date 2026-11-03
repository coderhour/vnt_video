import { Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Stage } from '../../../lib/grid';
import { CommentBubble, CtaPill, MUSIC, PushIn, SFX, Sfx, ShortFrame, choicePulse } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { CHOICES, Hill, KM, MS, SLUG, ride } from '../Composition';

export { SLUG };
const CHIME = staticFile(`${SLUG}/sfx/fs-541985.mp3`);
const col = (c: string, t: string) => `{\\color{${c}}${t}}`;
const kmh = col(KM, '\\text{ km/h}');
const ms = col(MS, '\\text{ m/s}');
const before = -100;

// Hill as placed in the hook and at the end of the reveal (same spot, so the loop cuts cleanly).
const BIG = { sc: 0.95, tx: 27, ty: 208 };

/** Speed chip: arrow, value, unit in its colour. */
const Speed: React.FC<{ dir: 'up' | 'down'; value: string; unit: string; color: string; style?: React.CSSProperties; size?: number }> = ({ dir, value, unit, color, style, size = 60 }) => (
  <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, background: C.card, borderRadius: 24, padding: '8px 30px', borderLeft: `14px solid ${color}`, fontSize: size, fontWeight: 900, boxShadow: '0 6px 22px rgba(30,40,80,0.08)', whiteSpace: 'nowrap', ...style }}>
    <span style={{ color: C.muted, fontSize: size * 0.8 }}>{dir === 'up' ? '▲' : '▼'}</span>
    <span>{value}</span>
    <span style={{ color }}>{unit}</span>
  </div>
);

const Center: React.FC<{ y: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ y, style, children }) => (
  <div style={{ position: 'absolute', left: 0, width: 1080, top: y, display: 'flex', justifyContent: 'center', gap: 28, ...style }}>{children}</div>
);

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const nope = at(scene, 0, 0.84);
  return (
    <>
      <Center y={280}>
        <div style={{ background: C.violet, color: '#fff', borderRadius: 999, padding: '10px 40px', fontSize: 52, fontWeight: 900 }}>AMC 8 · Challenge #26</div>
      </Center>
      <Text x={540} y={385} w={1000} size={96} weight={900} align="center">
        Think it's <span style={{ color: C.red }}>24</span>?
      </Text>
      <PushIn frames={scene.frames} origin="540px 760px">
        <Hill p={0} {...BIG} />
        <Center y={970}>
          <Speed dir="up" value="12" unit="km/h" color={KM} />
          <Speed dir="down" value="10" unit="m/s" color={MS} />
        </Center>
      </PushIn>
      <Sfx at={nope} src={SFX.buzz} volume={0.35} />
      <Center y={640} style={{ opacity: ease(f, nope, 4) }}>
        <div style={{ transform: `rotate(-8deg) scale(${pop(f, nope)})`, border: `14px solid ${C.red}`, color: C.red, background: 'rgba(255,255,255,0.92)', borderRadius: 28, padding: '6px 54px', fontSize: 150, fontWeight: 900, letterSpacing: 6 }}>
          NOPE
        </div>
      </Center>
    </>
  );
};

const QuestionBody: React.FC<{ start: (i: number) => number; pulse?: (i: number) => number; bike?: [number, 1 | -1, number] }> = ({ start, pulse = () => 1, bike = [0, 1, 0] }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 50, top: 290, width: 980, boxSizing: 'border-box', background: C.card, borderRadius: 32, padding: '26px 40px', fontSize: 54, fontWeight: 800, lineHeight: 1.35, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        Jo bikes up a <b>3 km</b> hill at <b style={{ color: KM }}>12 km/h</b>, then back down at <b style={{ color: MS }}>10 m/s</b>. Average speed, <b style={{ color: C.violet }}>in km/h</b>?
      </div>
      <Hill p={bike[0]} dir={bike[1]} streak={bike[2]} sc={0.8} tx={96} ty={368} />
      <div style={{ position: 'absolute', left: 60, top: 995, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 22 }}>
        {CHOICES.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 8), background: C.card, borderRadius: 22, padding: '12px 30px', boxShadow: '0 4px 14px rgba(30,40,80,0.08)', display: 'flex', alignItems: 'center', gap: 14, scale: String(pulse(i)) }}>
            <span style={{ color: C.muted, fontSize: 44, fontWeight: 900 }}>{'ABCDE'[i]}</span>
            <Tex tex={c} size={68} />
          </div>
        ))}
      </div>
    </>
  );
};

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const L = scene.lines[0].frames;
  // slow up while "twelve kilometers per hour" is said, fast down on "ten meters per second"
  const bike = ride(f, at(scene, 0, 0.15), Math.round(L * 0.4), at(scene, 0, 0.66), 18);
  return (
    <>
      <QuestionBody start={(i) => at(scene, 1, 0.1 + i * 0.1)} bike={bike} />
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
    </>
  );
};

const Think: SceneComponent = () => {
  const f = useCurrentFrame();
  return (
    <>
      <QuestionBody start={() => before} pulse={(i) => choicePulse(f, i)} />
      <CommentBubble />
    </>
  );
};

// ---------- the aha: one clock for the whole trip ----------
const CX = 300;
const CY = 1070;
const R = 190;
const ang = (m: number) => ((-90 + m * 6) * Math.PI) / 180;
const xy = (m: number, r: number) => [CX + r * Math.cos(ang(m)), CY + r * Math.sin(ang(m))];
const wedge = (m0: number, m1: number, r = R - 10) => {
  if (m1 - m0 <= 0.01) return '';
  const [x0, y0] = xy(m0, r);
  const [x1, y1] = xy(m1, r);
  return `M${CX} ${CY} L${x0.toFixed(1)} ${y0.toFixed(1)} A${r} ${r} 0 ${m1 - m0 > 30 ? 1 : 0} 1 ${x1.toFixed(1)} ${y1.toFixed(1)} Z`;
};

/** Clock face: blue wedge = minutes going up, orange = minutes going down; `thirds` shows the 20-minute slices, `ghosts` (0–2) fills the rest of the hour. */
const Clock: React.FC<{ up: number; down: number; hand: number; thirds?: number; glow?: number; ghosts?: number }> = ({ up, down, hand, thirds = 0, glow = 0, ghosts = 0 }) => {
  const [hx, hy] = xy(hand, R - 40);
  return (
    <Stage>
      <circle cx={CX} cy={CY} r={R} fill="#fff" stroke={C.ink} strokeWidth={10} />
      {[0, 1].map((i) => (ghosts > i ? <path key={i} d={wedge(20 + 20 * i, 20 + 20 * i + 20 * Math.min(1, ghosts - i))} fill={C.violetSoft} stroke={C.violet} strokeWidth={6} strokeDasharray="16 10" /> : null))}
      <path d={wedge(0, up)} fill={KM} />
      <path d={wedge(15, 15 + down)} fill={MS} />
      {glow > 0 && <path d={wedge(0, 20)} fill="none" stroke={C.violet} strokeWidth={12} opacity={glow} strokeLinejoin="round" />}
      {Array.from({ length: 12 }, (_, i) => {
        const [a, b] = xy(i * 5, R - 4);
        const [c, d] = xy(i * 5, R - (i % 3 === 0 ? 34 : 22));
        return <line key={i} x1={a} y1={b} x2={c} y2={d} stroke={C.ink} strokeWidth={i % 3 === 0 ? 8 : 5} strokeLinecap="round" />;
      })}
      {thirds > 0 &&
        [0, 20, 40].map((m) => {
          const [x, y] = xy(m, R);
          return <line key={m} x1={CX} y1={CY} x2={x} y2={y} stroke={C.violet} strokeWidth={8} strokeDasharray="18 12" opacity={thirds} />;
        })}
      <line x1={CX} y1={CY} x2={hx} y2={hy} stroke={C.ink} strokeWidth={12} strokeLinecap="round" />
      <circle cx={CX} cy={CY} r={16} fill={C.ink} />
    </Stage>
  );
};

/** Headline readout: swaps per line (units, km ridden, 6 km in 1/3 h, ×3). */
const Head: React.FC<{ op: number; children: React.ReactNode }> = ({ op, children }) =>
  op <= 0 ? null : (
    <div style={{ position: 'absolute', left: 0, width: 1080, top: 290, height: 130, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: op, fontSize: 76, fontWeight: 900, whiteSpace: 'nowrap' }}>{children}</div>
  );

const ClockScene: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const conv = at(scene, 0, 0.55);
  const L1 = scene.lines[1].frames;
  const upS = at(scene, 1, 0.02);
  const upD = Math.round(L1 * 0.45);
  const dnS = at(scene, 1, 0.6);
  const dnD = Math.round(upD / 3); // 5 min vs 15 min: the down ride takes a third as long
  const bike = ride(f, upS, upD, dnS, dnD);
  const upP = Math.min(1, Math.max(0, (f - upS) / upD));
  const dnP = Math.min(1, Math.max(0, (f - dnS) / dnD));
  const upMin = 15 * upP;
  const dnMin = 5 * dnP;
  const km = Math.round(3 * upP + 3 * dnP);
  const l2 = at(scene, 2);
  const l3 = at(scene, 3);
  const zoomIn = at(scene, 2, 0.1);
  const zoomOut = at(scene, 3, 0.05);
  const zoom = 1 + 0.4 * ease(f, zoomIn, 12) - 0.4 * ease(f, zoomOut, 12);
  const ghost1 = at(scene, 3, 0.35);
  const ghost2 = at(scene, 3, 0.6);
  const ghosts = Math.min(1, Math.max(0, (f - ghost1) / 10)) + Math.min(1, Math.max(0, (f - ghost2) / 10));
  const side = fadeTo(f, zoomIn, 0, 8) + ease(f, zoomOut + 6, 10);
  const downIsKmh = f >= conv;
  return (
    <>
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      <Sfx at={conv} src={SFX.click} volume={0.3} />
      {[1, 2, 3].map((i) => <Sfx key={i} at={upS + (upD * i) / 3} src={SFX.click} volume={0.25} />)}
      <Sfx at={dnS + dnD} src={SFX.click} volume={0.3} />
      <Sfx at={zoomIn} src={SFX.whoosh} volume={0.25} />
      <Sfx at={zoomOut} src={SFX.whoosh} volume={0.25} />
      <Sfx at={ghost1} src={SFX.click} volume={0.28} />
      <Sfx at={ghost2} src={SFX.click} volume={0.28} />

      <Head op={fadeTo(f, at(scene, 1), 0, 6)}>
        <Tex tex={`10${ms}${f >= conv ? ` = 36${kmh}` : ''}`} size={80} />
      </Head>
      <Head op={ease(f, at(scene, 1) + 4, 6) * fadeTo(f, l2, 0, 6)}>
        ridden:&nbsp;<span style={{ color: C.primary }}>{km} km</span>
      </Head>
      <Head op={ease(f, l2 + 4, 6) * fadeTo(f, l3, 0, 6)}>
        <Tex tex={`6\\text{ km in }${col(C.violet, '20\\text{ min}')} = \\dfrac{1}{3}\\text{ h}`} size={72} />
      </Head>
      <Head op={ease(f, l3 + 4, 6)}>
        <Tex tex={`1\\text{ hour}: \\ 6\\text{ km} \\times ${col(C.violet, '3')}`} size={80} />
      </Head>

      <div style={{ opacity: 1 - 0.75 * (zoom - 1) / 0.4 }}>
        <Hill p={bike[0]} dir={bike[1]} streak={bike[2]} sc={0.8} tx={96} ty={228} />
        <div style={{ position: 'absolute', left: 50, top: 480, display: 'flex', flexDirection: 'column', gap: 18, alignItems: 'flex-start' }}>
          <Speed dir="up" value="12" unit="km/h" color={KM} size={54} />
          <Speed dir="down" value={downIsKmh ? '36' : '10'} unit={downIsKmh ? 'km/h' : 'm/s'} color={downIsKmh ? KM : MS} size={54} style={{ transform: `scale(${1 + 0.12 * Math.sin(ease(f, conv, 14) * Math.PI)})`, transformOrigin: 'left center' }} />
        </div>
      </div>

      <div style={{ position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: `${CX}px 1040px`, opacity: ease(f, at(scene, 0, 0.8), 10) }}>
        <Clock up={upMin} down={dnMin} hand={f < dnS ? upMin : 15 + dnMin + (f >= ghost1 ? 40 * Math.min(1, ghosts / 2) : 0)} thirds={ease(f, l2 + 6, 10)} glow={ease(f, at(scene, 2, 0.3), 10)} ghosts={ghosts} />
      </div>

      <div style={{ position: 'absolute', left: 560, top: 900, width: 360, display: 'flex', flexDirection: 'column', gap: 26, alignItems: 'flex-start', opacity: Math.min(1, side) }}>
        <div style={{ fontSize: 66, fontWeight: 900, color: KM, ...fadeUp(f, upS + upD - 4) }}>▲ 15 min</div>
        <div style={{ fontSize: 66, fontWeight: 900, color: MS, ...fadeUp(f, dnS + dnD - 2) }}>▼ 5 min</div>
        <div style={{ background: C.violet, color: '#fff', borderRadius: 24, padding: '6px 30px', fontSize: 72, fontWeight: 900, ...fadeUp(f, ghost2 + 8) }}>× 3</div>
      </div>
    </>
  );
};

/** The answer, the trap, then the CTA pill over the same hill as frame 0 (no separate end card). */
const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 0, 0.42);
  const chime = at(scene, 0, 0.97);
  return (
    <>
      <Center y={300}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '14px 48px', display: 'flex', alignItems: 'center', gap: 24, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <Tex tex="18" size={116} color="#fff" />
          <span style={{ fontSize: 76, fontWeight: 900 }}>km/h</span>
        </div>
      </Center>
      <Hill p={0} {...BIG} />
      <Center y={965} style={fadeUp(f, at(scene, 1, 0.05))}>
        <Tex tex={col(C.red, '(12+36) \\div 2 = 24')} size={64} />
        <span style={{ fontSize: 64, fontWeight: 900, color: C.red }}>✗</span>
      </Center>
      <Text x={490} y={1055} w={860} size={54} weight={900} color={C.muted} align="center" style={fadeUp(f, at(scene, 1, 0.4))}>
        slow for 15 min, fast for 5
      </Text>
      <CtaPill start={at(scene, 2)} y={1160} />
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      <Sfx at={hit - 31} src={SFX.riser} volume={0.3} />
      <Sfx at={at(scene, 1)} src={SFX.buzz} volume={0.2} />
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={380} start={chime} seed={5} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, clock: ClockScene, reveal: Reveal };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" captions="words" music={MUSIC} /> : null;
