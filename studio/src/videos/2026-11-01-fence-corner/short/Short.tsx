import { Audio, Sequence, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop, range } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Stage } from '../../../lib/grid';
import { NUNITO } from '../../../lib/fonts';
import { CommentBubble, CtaPill, MUSIC, PushIn, SFX, Sfx, ShortFrame, choicePulse } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { BEST, CHIME, LOP, R, Region, SLUG, SQB, Walls, mk, octOf, poly, type Pt } from '../Composition';

export { SLUG };

// New recipe: trap-first AMC 10 hook (the 6×6 square, 36), question, comment bait, the mirror trick as the aha
// (reflect twice -> octagon, morph to the regular one, zoom onto our quarter), reveal over the same corner as frame 0.

const CHOICES = ['36', '18+18\\sqrt{2}', '36\\sqrt{2}', '36+18\\sqrt{2}', '72+72\\sqrt{2}'];
const D2R = Math.PI / 180;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const mixP = (a: Pt[], b: Pt[], t: number): Pt[] => a.map((p, i) => [lerp(p[0], b[i][0], t), lerp(p[1], b[i][1], t)]);
const regOct = (): Pt[] => range(8).map((k): Pt => [R * Math.cos(45 * k * D2R), R * Math.sin(45 * k * D2R)]);
const before = () => -100;

// The hook / reveal corner (the loop figure). The aha's MC figure, scaled by ZOOM about ZO, lands exactly on HM.
const HM = mk(250, 1150, 78);
const MC = mk(540, 800, 48);
const ZOOM = 78 / 48;
const ZO = '1004px 240px'; // fixed point of the map MC -> HM
const HLEN = 8.3;

const Lbl: React.FC<{ p: Pt; text: string; color?: string; size?: number; opacity?: number }> = ({ p, text, color = C.ink, size = 52, opacity = 1 }) =>
  opacity <= 0 ? null : (
    <text x={p[0]} y={p[1]} fill={color} opacity={opacity} fontFamily={NUNITO} fontWeight={900} fontSize={size} textAnchor="middle" dominantBaseline="central" paintOrder="stroke" stroke={C.bg} strokeWidth={size / 5} strokeLinejoin="round">
      {text}
    </text>
  );

/** Equal-length tick across the middle of a segment. */
const Tick: React.FC<{ a: Pt; b: Pt; color?: string; opacity?: number }> = ({ a, b, color = C.violet, opacity = 1 }) => {
  if (opacity <= 0) return null;
  const d = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const [ux, uy] = [(b[0] - a[0]) / d, (b[1] - a[1]) / d];
  const [cx, cy] = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  return <line x1={cx - uy * 20} y1={cy + ux * 20} x2={cx + uy * 20} y2={cy - ux * 20} stroke={color} strokeWidth={7} strokeLinecap="round" opacity={opacity} />;
};

/** Point just outside the middle of edge i of a polygon around centre c. */
const outMid = (pts: Pt[], i: number, c: Pt, d: number): Pt => {
  const a = pts[i];
  const b = pts[(i + 1) % pts.length];
  const m: Pt = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const r = Math.hypot(m[0] - c[0], m[1] - c[1]);
  return [m[0] + ((m[0] - c[0]) / r) * d, m[1] + ((m[1] - c[1]) / r) * d];
};

const Chip: React.FC<{ y?: number; color?: string; opacity?: number; scale?: number; children: React.ReactNode }> = ({ y = 280, color = C.violet, opacity = 1, scale = 1, children }) =>
  opacity <= 0 ? null : (
    <div style={{ position: 'absolute', left: 0, width: 1080, top: y, display: 'flex', justifyContent: 'center', opacity }}>
      <div style={{ transform: `scale(${scale})`, background: color, color: '#fff', borderRadius: 26, padding: '12px 44px', fontSize: 66, fontWeight: 900, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 18 }}>{children}</div>
    </div>
  );

/** The trap: the 6 × 6 square bend in the same corner the short ends on. */
const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const nope = at(scene, 0, 0.84);
  const red = f >= nope;
  const c = HM([3, 3]);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: C.violet, color: '#fff', borderRadius: 999, padding: '10px 40px', fontSize: 52, fontWeight: 900 }}>AMC 10 · Challenge #15</div>
      </div>
      <Text x={540} y={385} w={1000} size={96} weight={900} align="center">
        Think it's <span style={{ color: C.red }}>36</span>?
      </Text>
      <PushIn frames={scene.frames} origin="480px 900px">
        <Stage>
          <Walls m={HM} len={HLEN} />
          <Region m={HM} s={SQB} width={18} fill={red ? C.red : C.primary} fence={red ? C.red : C.primary} fillOp={0.18} />
          <Lbl p={[c[0], c[1]]} text="6 × 6 = 36" size={64} color={red ? C.red : C.ink} />
        </Stage>
      </PushIn>
      <Sfx at={nope} src={SFX.buzz} volume={0.35} />
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 760, display: 'flex', justifyContent: 'center', opacity: ease(f, nope, 4) }}>
        <div style={{ transform: `rotate(-8deg) scale(${pop(f, nope)})`, border: `14px solid ${C.red}`, color: C.red, background: 'rgba(255,255,255,0.92)', borderRadius: 28, padding: '6px 54px', fontSize: 150, fontWeight: 900, letterSpacing: 6 }}>
          NOPE
        </div>
      </div>
    </>
  );
};

const QM = mk(190, 1010, 50);

const QuestionBody: React.FC<{ start: (i: number) => number; pulse?: (i: number) => number }> = ({ start, pulse = () => 1 }) => {
  const f = useCurrentFrame();
  const mp = QM([LOP.P[0] + 1.2, LOP.P[1] + 1.4]);
  return (
    <>
      <div style={{ position: 'absolute', left: 50, top: 290, width: 980, boxSizing: 'border-box', background: C.card, borderRadius: 32, padding: '20px 36px', fontSize: 54, fontWeight: 800, lineHeight: 1.32, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        Walls at a <b style={{ color: C.violet }}>right angle</b>. A <b style={{ color: C.primary }}>2-piece fence</b>, total length <b style={{ color: C.primary }}>12</b>, joins them. Largest area enclosed?
      </div>
      <Stage>
        <Walls m={QM} len={9.3} />
        <Region m={QM} s={LOP} width={13} />
        <Lbl p={mp} text="12" size={60} color={C.primary} />
      </Stage>
      <div style={{ position: 'absolute', left: 60, top: 1060, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 14 }}>
        {CHOICES.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 8), background: C.card, borderRadius: 22, padding: '8px 18px', boxShadow: '0 4px 14px rgba(30,40,80,0.08)', display: 'flex', alignItems: 'center', gap: 14, scale: String(pulse(i)) }}>
            <span style={{ color: C.muted, fontSize: 44, fontWeight: 900 }}>{'ABCDE'[i]}</span>
            <Tex tex={c} size={60} />
          </div>
        ))}
      </div>
    </>
  );
};

const Question: SceneComponent = ({ scene }) => (
  <>
    <QuestionBody start={(i) => at(scene, 1, 0.2 + i * 0.1)} />
    <Sfx at={0} src={SFX.whoosh} volume={0.3} />
  </>
);

const Think: SceneComponent = () => {
  const f = useCurrentFrame();
  return (
    <>
      <QuestionBody start={before} pulse={(i) => choicePulse(f, i)} />
      <CommentBubble />
    </>
  );
};

/** The aha: walls are mirrors -> 8 fence pieces, perimeter 48 -> regular octagon, sides 6 -> zoom onto our quarter. */
const MirrorScene: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const t = (i: number, p = 0) => at(scene, i, p);
  const flip1 = t(1, 0.02);
  const flip2 = t(1, 0.3);
  const t1 = ease(f, flip1, 22);
  const t2 = ease(f, flip2, 22);
  const nums = t(1, 0.58);
  const morph = t(2, 0.02);
  const mt = ease(f, morph, 36);
  const zoomAt = t(3, 0.02);
  const z = ease(f, zoomAt, 20);
  const zoom = 1 + (ZOOM - 1) * z;
  const glow = ease(f, 6, 10) * fadeTo(f, flip1, 0, 8);
  const wallsA = fadeTo(f, t(1, 0.5), 0, 10);
  const wallsB = ease(f, t(3, 0.25), 12);
  const c = MC([0, 0]);
  const quad = f < morph;
  const pts = mixP(octOf(LOP), regOct(), mt).map(MC);
  const rest = fadeTo(f, t(3, 0.2), 0, 14); // the other 6 sides fade while we zoom onto ours
  const ticks = ease(f, t(2, 0.45), 10);
  const ours = ease(f, zoomAt, 10);
  const count = f < flip1 + 11 ? 2 : f < flip2 + 11 ? 4 : 8;
  const sixL = ease(f, t(3, 0.4), 10);
  return (
    <>
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      <Sfx at={flip1} src={SFX.whoosh} volume={0.25} />
      <Sfx at={flip2} src={SFX.whoosh} volume={0.25} />
      {range(4).map((i) => <Sfx key={i} at={nums + i * 2 * 4} src={SFX.click} volume={0.25} />)}
      <Sfx at={t(2, 0.45)} src={SFX.click} volume={0.25} />
      <Sfx at={zoomAt} src={SFX.whoosh} volume={0.28} />
      <Sfx at={t(3, 0.4)} src={SFX.click} volume={0.3} />
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: ZO }}>
        <Stage>
          <Walls m={MC} len={9.6} opacity={wallsA} glow={glow} />
          {quad ? (
            <>
              {t1 > 0 && <Region m={MC} s={LOP} sy={1 - 2 * t1} fillOp={0.1} width={11} />}
              {t2 > 0 && <Region m={MC} s={LOP} sx={1 - 2 * t2} fillOp={0.1} width={11} />}
              {t2 > 0 && <Region m={MC} s={LOP} sx={1 - 2 * t2} sy={-1} fillOp={0.1} width={11} />}
              <Region m={MC} s={LOP} width={11} />
            </>
          ) : (
            <g strokeLinecap="round">
              <path d={poly(pts)} fill={C.primary} opacity={0.16 * rest} />
              <path d={poly([c, pts[0], pts[1], pts[2]])} fill={C.violet} opacity={0.25 * ours} />
              {pts.map((p, i) => {
                const q = pts[(i + 1) % 8];
                const mine = i < 2;
                return <line key={i} x1={p[0]} y1={p[1]} x2={q[0]} y2={q[1]} stroke={mine && ours > 0.5 ? C.violet : C.primary} strokeWidth={mine ? lerp(11, 11.1, ours) : 11} opacity={mine ? 1 : rest} />;
              })}
              {range(8).map((i) => <Tick key={i} a={pts[i]} b={pts[(i + 1) % 8]} opacity={ticks * (i < 2 ? 1 : rest) * (1 - sixL)} />)}
            </g>
          )}
          <Walls m={MC} len={HLEN} opacity={wallsB} />
          {range(8).map((i) => {
            const o = ease(f, nums + i * 4, 6) * fadeTo(f, morph, 0, 8);
            const p = outMid(octOf(LOP).map(MC), i, c, 42);
            return (
              o > 0 && (
                <g key={i} opacity={o}>
                  <circle cx={p[0]} cy={p[1]} r={30} fill={C.violet} />
                  <text x={p[0]} y={p[1] + 2} fontFamily={NUNITO} fontWeight={900} fontSize={42} fill="#fff" textAnchor="middle" dominantBaseline="central">{i + 1}</text>
                </g>
              )
            );
          })}
          {[0, 1].map((i) => <Lbl key={i} p={outMid(pts, i, c, 30)} text="6" size={40} color={C.violet} opacity={sixL} />)}
        </Stage>
      </div>
      <Chip opacity={fadeTo(f, flip1 - 4, 0, 6)} scale={pop(f, 4)}>
        Walls = mirrors
      </Chip>
      <Chip opacity={ease(f, flip1 - 2, 6) * fadeTo(f, t(1, 0.78), 0, 6)} scale={1 + 0.12 * Math.max(0, 1 - Math.abs(f - (count === 4 ? flip1 + 11 : flip2 + 11)) / 6) * (count > 2 ? 1 : 0)}>
        fence pieces: {count}
      </Chip>
      <Chip color={C.primary} opacity={ease(f, t(1, 0.78), 6) * fadeTo(f, t(2, 0.55), 0, 6)} scale={pop(f, t(1, 0.78))}>
        <span>perimeter</span>
        <Tex tex="4\times 12 = 48" size={66} color="#fff" />
      </Chip>
      <Chip color={C.primary} opacity={ease(f, t(2, 0.55), 6) * fadeTo(f, t(3, 0.36), 0, 6)} scale={pop(f, t(2, 0.55))}>
        <span>side</span>
        <Tex tex="48 \div 8 = 6" size={66} color="#fff" />
      </Chip>
      <Chip opacity={ease(f, t(3, 0.4), 6)} scale={pop(f, t(3, 0.4))}>
        our fence = 6 + 6
      </Chip>
    </>
  );
};

/** Answer, trap, CTA pill over the same corner as frame 0. */
const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 0, 0.47);
  const chime = at(scene, 0, 0.97);
  const trap = at(scene, 1, 0.05);
  const c = HM([0, 0]);
  const pts = regOct().map(HM);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '14px 44px', display: 'flex', alignItems: 'center', gap: 24, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <span style={{ fontSize: 66, fontWeight: 900 }}>B</span>
          <Tex tex="18+18\sqrt{2}" size={96} color="#fff" />
        </div>
      </div>
      <Stage>
        <Walls m={HM} len={HLEN} />
        <Region m={HM} s={SQB} fill="none" fence={C.red} width={9} opacity={ease(f, trap, 10) * 0.85} />
        <Region m={HM} s={BEST} fill={C.violet} fillOp={0.25} fence={C.violet} width={17.9} />
        {[0, 1].map((i) => <Lbl key={i} p={outMid(pts, i, c, 49)} text="6" size={65} color={C.violet} />)}
        <Lbl p={HM([3.4, 3.4])} text="¼ octagon" size={58} color={C.violet} opacity={ease(f, at(scene, 0, 0.1), 10)} />
      </Stage>
      <Text x={760} y={500} w={520} size={60} weight={900} color={C.red} align="center" style={fadeUp(f, trap)}>
        square: 36 ✗
      </Text>
      <CtaPill start={at(scene, 2)} y={1195} />
      <Sfx at={0} src={SFX.whoosh} volume={0.25} />
      <Sfx at={hit - 31} src={SFX.riser} volume={0.3} />
      <Sfx at={trap} src={SFX.buzz} volume={0.2} />
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={360} start={chime} seed={5} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, mirror: MirrorScene, reveal: Reveal };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 10-style" captions="words" music={MUSIC} /> : null;
