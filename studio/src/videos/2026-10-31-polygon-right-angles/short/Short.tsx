import { Audio, Sequence, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop, range } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Stage } from '../../../lib/grid';
import { CommentBubble, CtaPill, MUSIC, PushIn, SFX, Sfx, ShortFrame, choicePulse } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { AMBER, CHIME, CHIPS, G1, G2, GD, SLUG } from '../Composition';
import { CornerMark, DIRS11, LENS11, Outline, RightMark, SvgText, TurnCircle, Walker, build, corner, flashP, passP, walkU, type P, type Poly, type Wedge } from '../geom';

export { SLUG };

// New recipe: trap-first hook (9), question, comment bait, the "add up the turns" aha (walker lap, a zoom onto one
// 160° corner, the turn circle filling 90 + 90 then nine 20s with a counter), then answer, trap and CTA pill.
// The 11-gon of verify.py is turned 90° (a bowl: flat top with the two square corners) so it fills the width.

const col = (c: string, t: string) => `{\\color{${c}}${t}}`;
const rad = (d: number) => (d * Math.PI) / 180;
const pol = (c: P, r: number, deg: number): P => [c[0] + r * Math.cos(rad(deg)), c[1] - r * Math.sin(rad(deg))];
const ROT = DIRS11.map((d) => d + 90);
// corners: V1, V2 = the square corners (top right, top left); V3…V10 and V0 = the nine 160° corners
const BIG = build(ROT, LENS11, 150, [980, 670]); // x 130…980, y 520…1027
const SMALL = build(ROT, LENS11, 120, [880, 740]); // question: x 200…880, y 620…1026
const CC: P = [555, 760];
const CR = 175;

const before = () => -100;
const inside = (poly: Poly, i: number, d: number) => {
  const c = corner(poly, i);
  return pol(c.at, d, c.dout + (180 - c.turn) / 2);
};

/** The question's shape with its side count hidden: V0…V6 solid, the rest a dashed unknown curve. */
const Partial: React.FC<{ poly: Poly; k?: number; fs?: number }> = ({ poly, k = 1, fs = 50 }) => {
  const v = poly.pts;
  const a = v[6];
  const b = v[0];
  const h = (d: number): P => [Math.cos(rad(d)), -Math.sin(rad(d))];
  const [ha, hb] = [h(poly.dirs[6]), h(poly.dirs[10])];
  // where the tangent leaving V6 meets the tangent arriving at V0
  const det = ha[0] * -hb[1] - -hb[0] * ha[1];
  const t = ((b[0] - a[0]) * -hb[1] - -hb[0] * (b[1] - a[1])) / det;
  const ctrl: P = [a[0] + t * ha[0], a[1] + t * ha[1]];
  const solid = `M ${v.slice(0, 7).map((p) => `${p[0]} ${p[1]}`).join(' L ')}`;
  const tail = `Q ${ctrl[0]} ${ctrl[1]} ${b[0]} ${b[1]}`;
  return (
    <Stage>
      <path d={`${solid} ${tail} Z`} fill={C.violetSoft} opacity={0.9} />
      <path d={solid} fill="none" stroke={C.ink} strokeWidth={8} strokeLinejoin="round" strokeLinecap="round" />
      <path d={`M ${a[0]} ${a[1]} ${tail}`} fill="none" stroke={C.muted} strokeWidth={8} strokeLinecap="round" strokeDasharray="4 18" />
      {[1, 2].map((i) => {
        const c = corner(poly, i);
        return <RightMark key={i} at={c.at} din={c.din} dout={c.dout} a={36 * k} />;
      })}
      {[4, 5, 6].map((i) => {
        const c = corner(poly, i);
        return <CornerMark key={i} at={c.at} din={c.din} dout={c.dout} r={34 * k} inOp={1} />;
      })}
      {[1, 2].map((i) => <SvgText key={i} at={inside(poly, i, 96 * k)} size={fs} color={C.violet}>90°</SvgText>)}
      {[4, 5, 6].map((i) => <SvgText key={i} at={inside(poly, i, 92 * k)} size={fs} color={C.violet}>160°</SvgText>)}
    </Stage>
  );
};

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const nope = at(scene, 0, 0.84);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: C.violet, color: '#fff', borderRadius: 999, padding: '10px 40px', fontSize: 52, fontWeight: 900 }}>AMC 8 · Challenge #30</div>
      </div>
      <Text x={540} y={385} w={1000} size={96} weight={900} align="center">
        Think it's <span style={{ color: C.red }}>9</span>?
      </Text>
      <PushIn frames={scene.frames} origin="555px 770px">
        <Partial poly={BIG} />
      </PushIn>
      <Sfx at={nope} src={SFX.buzz} volume={0.35} />
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 650, display: 'flex', justifyContent: 'center', opacity: ease(f, nope, 4) }}>
        <div style={{ transform: `rotate(-8deg) scale(${pop(f, nope)})`, border: `14px solid ${C.red}`, color: C.red, background: 'rgba(255,255,255,0.92)', borderRadius: 28, padding: '6px 54px', fontSize: 150, fontWeight: 900, letterSpacing: 6 }}>
          NOPE
        </div>
      </div>
    </>
  );
};

const QuestionBody: React.FC<{ start: (i: number) => number; pulse?: (i: number) => number }> = ({ start, pulse = () => 1 }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 50, top: 290, width: 980, boxSizing: 'border-box', background: C.card, borderRadius: 32, padding: '26px 40px', fontSize: 54, fontWeight: 800, lineHeight: 1.35, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        A convex polygon: <b style={{ color: C.violet }}>two corners of 90°</b>, every other corner <b style={{ color: C.primary }}>160°</b>. How many sides?
      </div>
      <Partial poly={SMALL} k={0.85} fs={44} />
      <div style={{ position: 'absolute', left: 60, top: 1065, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 22 }}>
        {CHIPS.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 8), background: C.card, borderRadius: 22, padding: '12px 30px', boxShadow: '0 4px 14px rgba(30,40,80,0.08)', display: 'flex', alignItems: 'center', gap: 14, scale: String(pulse(i)) }}>
            <span style={{ color: C.muted, fontSize: 44, fontWeight: 900 }}>{'ABCDE'[i]}</span>
            <Tex tex={c} size={68} />
          </div>
        ))}
      </div>
    </>
  );
};

const Question: SceneComponent = ({ scene }) => (
  <>
    <QuestionBody start={(i) => at(scene, 1, 0.1 + i * 0.12)} />
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

/** The aha: walk the outside (turns = 360), zoom onto one 160° corner (turn 20), then fill the turn circle. */
const Walk: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const [l1, l2, l3] = [at(scene, 1), at(scene, 2), at(scene, 3)];
  // line 0: one lap; line 3: from the last square corner round the nine 160° corners
  const [a0, b0] = [at(scene, 0, 0.08), at(scene, 0, 0.82)];
  const lap = walkU(f, a0, b0, 0, 11);
  const [a3, b3] = [at(scene, 3, 0.02), at(scene, 3, 0.76)];
  const u = walkU(f, a3, b3, 2.5, 11.3);
  const late = f >= l3;
  const k = late ? Math.max(0, Math.min(9, Math.floor(u + 1e-9) - 2)) : 0;
  const zIn = at(scene, 1, 0.5);
  const zoom = 1 + 0.45 * (ease(f, zIn, 12) - ease(f, l2 - 8, 10));
  const v1 = corner(BIG, 1);
  const v6 = corner(BIG, 6);
  const m1 = ease(f, at(scene, 1, 0.04), 8) * fadeTo(f, l2, 0, 8);
  const m6 = ease(f, zIn, 8) * fadeTo(f, l2, 0, 8);
  const amb = [at(scene, 2, 0.04), at(scene, 2, 0.18)];
  const wedges: Wedge[] = [
    { a: 90, color: AMBER, p: ease(f, amb[0], 10), label: '90°' },
    { a: 90, color: AMBER, p: ease(f, amb[1], 10), label: '90°' },
    ...range(9).map((j): Wedge => ({ a: 20, color: j % 2 ? G2 : G1, p: late ? passP(u, 3 + j, 0.25) : 0 })),
  ];
  const ghost = f < l2 ? { a1: 0, a2: 359.9, op: ease(f, at(scene, 0, 0.45), 10), label: '' } : { a1: 180, a2: 359.9, op: ease(f, at(scene, 2, 0.55), 10) * fadeTo(f, l3 + 6, 0, 8), label: '180°' };
  const cornerFrame = (a: number, b: number, u0: number, u1: number, c: number) => a + ((c - u0) / (u1 - u0)) * (b - a);
  const read = (tex: string, from: number, to: number) => (
    <div style={{ position: 'absolute', left: 60, width: 860, top: 1110, display: 'flex', justifyContent: 'center', opacity: ease(f, from, 6) * fadeTo(f, to, 0, 6) }}>
      <div style={{ background: C.card, borderRadius: 26, padding: '10px 40px', boxShadow: '0 6px 22px rgba(30,40,80,0.08)', whiteSpace: 'nowrap' }}>
        <Tex tex={tex} size={80} />
      </div>
    </div>
  );
  return (
    <>
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      {[1, 3, 5, 7, 9, 11].map((c) => <Sfx key={c} at={cornerFrame(a0, b0, 0, 11, c)} src={SFX.click} volume={0.22} />)}
      <Sfx at={zIn} src={SFX.whoosh} volume={0.25} />
      {amb.map((a, i) => <Sfx key={`a${i}`} at={a} src={SFX.click} volume={0.3} />)}
      {[3, 5, 7, 9, 11].map((c) => <Sfx key={`w${c}`} at={cornerFrame(a3, b3, 2.5, 11.3, c)} src={SFX.click} volume={0.28} />)}
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: '420px 1060px' }}>
        <Stage>
          <Outline poly={BIG} progress={ease(f, 0, 14)} fill={C.violetSoft} />
          <TurnCircle c={CC} R={CR} wedges={wedges} ghost={ghost} center={f < l1 ? '360°' : undefined} centerOp={ease(f, at(scene, 0, 0.6), 8) * fadeTo(f, l1, 0, 6)} fs={46} />
          {range(11).map((j) => {
            const c = corner(BIG, j + 1);
            const op = f < l1 ? flashP(lap, j + 1) : late && j + 1 >= 3 ? flashP(u, j + 1) : 0;
            return <CornerMark key={j} at={c.at} din={c.din} dout={c.dout} r={42} turnOp={op} />;
          })}
          <CornerMark at={v1.at} din={v1.din} dout={v1.dout} r={46} extLen={160} extOp={m1} inOp={m1} turnOp={m1} inLabel="90°" turnLabel="90°" labelGap={46} size={50} />
          <CornerMark at={v6.at} din={v6.din} dout={v6.dout} r={46} turnR={92} turnGap={46} extLen={170} extOp={m6} inOp={m6} turnOp={m6} inLabel="160°" turnLabel="20°" labelGap={50} size={50} />
          <Walker poly={BIG} u0={late ? 2.5 : 0} u={late ? u : Math.min(lap, 10.97)} op={late ? ease(f, l3, 6) : ease(f, a0 - 4, 6) * fadeTo(f, l1, 0, 8)} />
        </Stage>
      </div>
      <Text x={540} y={290} w={1000} size={92} weight={900} align="center" style={fadeUp(f, 0, 10)}>
        Add the <span style={{ color: GD }}>turns</span>
      </Text>
      {read('\\text{turns} = 360^{\\circ}', at(scene, 0, 0.6), at(scene, 1, 0.12))}
      {read(`180 - 90 = ${col(AMBER, '90')}`, at(scene, 1, 0.12), zIn + 4)}
      {read(`180 - 160 = ${col(GD, '20')}`, zIn + 4, at(scene, 2, 0.5))}
      {read(`360 - ${col(AMBER, '90')} - ${col(AMBER, '90')} = 180`, at(scene, 2, 0.5), l3 + 2)}
      {read(`${col(GD, '20^{\\circ}')} \\times ${k}`, l3 + 2, at(scene, 3, 0.8))}
      {read(`180 \\div 20 = ${col(GD, '9')}`, at(scene, 3, 0.8), 1e6)}
    </>
  );
};

/** The answer, the trap, then the CTA pill over the same shape (now closed), so the loop cuts back to the hook. */
const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 0, 0.8);
  const chime = at(scene, 0, 0.98);
  const dot = (i: number) => (i === 1 || i === 2 ? at(scene, 0, 0.4) + (i - 1) * 5 : at(scene, 0, 0.02) + ((i + 8) % 11) * 2.5);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 290, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '14px 48px', display: 'flex', alignItems: 'center', gap: 24, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <Tex tex="11" size={116} color="#fff" />
          <span style={{ fontSize: 70, fontWeight: 900 }}>sides</span>
        </div>
      </div>
      <Stage>
        <Outline poly={BIG} progress={1} fill={C.violetSoft} />
        {BIG.pts.map((p, i) => {
          const s = pop(f, dot(i));
          return f >= dot(i) ? <circle key={i} cx={p[0]} cy={p[1]} r={20 * s} fill={i === 1 || i === 2 ? AMBER : G1} stroke="#fff" strokeWidth={5} /> : null;
        })}
      </Stage>
      <div style={{ position: 'absolute', left: 130, width: 850, top: 700, display: 'flex', justifyContent: 'center', whiteSpace: 'nowrap', ...fadeUp(f, at(scene, 0, 0.05)) }}>
        <Tex tex={`${col(GD, '9')} + ${col(AMBER, '2')} = ${col(C.green, f < hit ? '?' : '11')}`} size={88} />
      </div>
      <Text x={540} y={1050} w={860} size={56} weight={900} color={C.red} align="center" style={fadeUp(f, at(scene, 1, 0.05))}>
        9 forgets the square corners
      </Text>
      <CtaPill start={at(scene, 2)} y={1150} />
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      {[0, 3, 6, 9].map((i) => <Sfx key={i} at={dot(i)} src={SFX.click} volume={0.22} />)}
      <Sfx at={dot(1)} src={SFX.click} volume={0.28} />
      <Sfx at={hit - 31} src={SFX.riser} volume={0.3} />
      <Sfx at={at(scene, 1)} src={SFX.buzz} volume={0.2} />
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={380} start={chime} seed={7} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, walk: Walk, reveal: Reveal };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" captions="words" music={MUSIC} /> : null;
