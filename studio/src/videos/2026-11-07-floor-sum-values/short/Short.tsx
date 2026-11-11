import { Audio, Sequence, interpolate, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Stage } from '../../../lib/grid';
import { CommentBubble, CtaPill, MUSIC, PushIn, SFX, Sfx, ShortFrame, choicePulse } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { Axes, BAD, CHIME, CHOICES, F1, F2, F3, G1, G2, G3, Lbl, OK, SLUG, Seg, T1, T2, TOT, Vert, fval, mk } from '../Composition';

export { SLUG };

// Trap-first AMC 10 hook (668 = forgot that 1000 is skipped), the staircase leap 3 -> 6 as the aha (zoom on the jump),
// remainders 4 and 5 skipped every block of six, 1000 has remainder 4, reveal 667. First and last frame: the full 0..2 staircase.

const G = mk(150, 1160, 360, 52); // x 0..2 -> 150..870, y 0..12 -> 1160..536
const ZOOM_ORIGIN = '150px 926px'; // on the y axis at the leap's height, so the axis labels (and the skipped 4, 5) stay put

type StairT = { t1: number[]; d1: number[]; dot6: number; jump: number; t2: number; leap: number; x4: number; x5: number; x10: number; x11: number; y6: number; y9: number; y12: number };
const DONE: StairT = { t1: [-100, -100, -100, -100], d1: [14, 14, 14, 14], dot6: -100, jump: -100, t2: -100, leap: -100, x4: -100, x5: -100, x10: -100, x11: -100, y6: -100, y9: -100, y12: -100 };
const T2STEP = 8;

const Cross: React.FC<{ v: number; start: number }> = ({ v, start }) => {
  const f = useCurrentFrame();
  const [x, y] = G(0, v);
  return (
    <g opacity={ease(f, start, 8)} stroke={BAD} strokeWidth={7} strokeLinecap="round">
      <line x1={x - 14} y1={y - 14} x2={x + 14} y2={y + 14} />
      <line x1={x + 14} y1={y - 14} x2={x - 14} y2={y + 14} />
    </g>
  );
};

/** The staircase f(x) = floor x + floor 2x + floor 3x on 0..2: filled dot left, hollow dot right, dashed jumps, skipped levels in red. */
const Stair: React.FC<{ t: StairT }> = ({ t }) => (
  <>
    <Stage>
      <Axes g={G} xmax={2.12} ymax={12.6} xticks={[0, 1, 2]} />
      {T1.map(([x0, x1, v], i) => (
        <Seg key={i} a={G(x0, v)} b={G(x1, v)} start={t.t1[i]} dur={t.d1[i]} color={TOT} w={12} r={15} />
      ))}
      {T1.slice(1).map(([x0, , v], i) => <Vert key={i} a={G(x0, v - 1)} b={G(x0, v)} start={t.t1[i + 1]} />)}
      <Vert a={G(1, 3)} b={G(1, 6)} start={t.jump} color={BAD} opacity={0.95} w={6} />
      <Seg a={G(1, 6)} b={G(1, 6)} start={t.dot6} hollow={false} color={TOT} w={12} r={15} />
      {T2.map(([x0, x1, v], i) => (
        <Seg key={i} a={G(x0, v)} b={G(x1, v)} start={t.t2 + i * T2STEP} dur={T2STEP} color={TOT} w={12} r={15} />
      ))}
      {T2.slice(1).map(([x0, , v], i) => <Vert key={i} a={G(x0, v - 1)} b={G(x0, v)} start={t.t2 + (i + 1) * T2STEP} />)}
      <Vert a={G(2, 9)} b={G(2, 12)} start={t.leap} color={BAD} opacity={0.95} w={6} />
      <Seg a={G(2, 12)} b={G(2.08, 12)} start={t.leap} hollow={false} color={TOT} w={12} r={15} dur={8} />
      <Cross v={4} start={t.x4} />
      <Cross v={5} start={t.x5} />
      <Cross v={10} start={t.x10} />
      <Cross v={11} start={t.x11} />
    </Stage>
    {[0, 1, 2].map((x) => <Lbl key={x} x={G(x, 0)[0]} y={G(0, 0)[1] + 52} tex={String(x)} start={-100} size={52} />)}
    {([[0, -100], [3, -100], [6, t.y6], [9, t.y9], [12, t.y12]] as const).map(([v, s]) => (
      <Lbl key={v} x={G(0, 0)[0] - 30} y={G(0, v)[1]} tex={String(v)} start={s} anchor="right" size={50} />
    ))}
    {([[4, t.x4], [5, t.x5], [10, t.x10], [11, t.x11]] as const).map(([v, s]) => (
      <Lbl key={v} x={G(0, 0)[0] - 30} y={G(0, v)[1]} tex={String(v)} start={s} anchor="right" size={50} color={BAD} />
    ))}
    {T1.map(([x0, x1, v], i) => <Lbl key={v} x={G((x0 + x1) / 2, 0)[0]} y={G(0, v)[1] - 44} tex={String(v)} start={t.t1[i]} size={56} pops />)}
    {T2.map(([x0, x1, v], i) => <Lbl key={v} x={G((x0 + x1) / 2, 0)[0]} y={G(0, v)[1] - 44} tex={String(v)} start={t.t2 + i * T2STEP} size={56} pops />)}
  </>
);

/** Centered slot in the top area (above the graph). */
const Slot: React.FC<{ y: number; opacity?: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ y, opacity = 1, style, children }) =>
  opacity <= 0 ? null : (
    <div style={{ position: 'absolute', left: 0, width: 1080, top: y, display: 'flex', justifyContent: 'center', opacity, ...style }}>{children}</div>
  );

const chip = (bg: string, color = '#fff'): React.CSSProperties => ({ background: bg, color, borderRadius: 26, padding: '8px 36px', fontSize: 64, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 18, whiteSpace: 'nowrap', boxShadow: '0 8px 24px rgba(30,40,80,0.12)' });

/** Remainder strip mod 6: 0 1 2 3 green, 4 5 red. */
const STRIP_X = 230;
const CELL = 80;
const Strip6: React.FC<{ y: number; start: number; ring?: number }> = ({ y, start, ring = 99999 }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: STRIP_X - 150, top: y + 8, ...fadeUp(f, start, 10) }}>
        <Tex tex="\div 6:" size={58} />
      </div>
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} style={{ position: 'absolute', left: STRIP_X + i * (CELL + 10), top: y, width: CELL, height: CELL, borderRadius: 18, background: i < 4 ? OK : BAD, color: '#fff', fontSize: 52, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: i === 4 && f >= ring ? `0 0 0 8px ${C.amber}` : undefined, ...fadeUp(f, start + i * 3, 10) }}>
          {i}
        </div>
      ))}
    </>
  );
};

/** The strip row as it ends the jump scene (held into the reveal): strip, ring on 4, "1000 ✗" stamp. */
const StripRow: React.FC<{ start: number; ring: number; out: number }> = ({ start, ring, out }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Strip6 y={414} start={start} ring={ring} />
      <div style={{ position: 'absolute', left: STRIP_X + 6 * (CELL + 10) + 10, top: 418, ...fadeUp(f, out, 8) }}>
        <div style={{ transform: `rotate(-6deg) scale(${pop(f, out)})`, border: `6px solid ${BAD}`, color: BAD, background: 'rgba(255,255,255,0.92)', borderRadius: 16, padding: '0 14px', fontSize: 50, fontWeight: 900, whiteSpace: 'nowrap' }}>
          1000 ✗
        </div>
      </div>
    </>
  );
};

/** Opens on the finished staircase (the same figure the video ends on), then stamps the trap. */
const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const nope = at(scene, 0, 0.84);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: C.violet, color: '#fff', borderRadius: 999, padding: '10px 40px', fontSize: 52, fontWeight: 900 }}>AMC 10 · Challenge #26</div>
      </div>
      <Text x={540} y={385} w={1000} size={96} weight={900} align="center">
        Think it's <span style={{ color: C.red }}>668</span>?
      </Text>
      <PushIn frames={scene.frames} origin="510px 880px">
        <Stair t={DONE} />
      </PushIn>
      <Sfx at={nope} src={SFX.buzz} volume={0.35} />
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 770, display: 'flex', justifyContent: 'center', opacity: ease(f, nope, 4) }}>
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
        <div>
          <b style={{ color: C.violet }}>Round down</b> <i>x</i>, 2<i>x</i>, 3<i>x</i>, then add:
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', margin: '14px 0 12px' }}>
          <Tex tex={`n=\\color{${G1}}{${F1}}+\\color{${G2}}{${F2}}+\\color{${G3}}{${F3}}`} size={64} />
        </div>
        <div>
          How many <i>n</i> from <b style={{ color: C.blue }}>1 to 1000</b> can you make?
        </div>
      </div>
      <div style={{ position: 'absolute', left: 60, top: 720, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 22 }}>
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

const Question: SceneComponent = ({ scene }) => (
  <>
    <QuestionBody start={(i) => at(scene, 0, 0.6 + i * 0.05)} />
    <Sfx at={0} src={SFX.whoosh} volume={0.3} />
  </>
);

/** Comment bait instead of a countdown: the question stays, a bubble pops, the choices pulse one by one. */
const Think: SceneComponent = () => {
  const f = useCurrentFrame();
  return (
    <>
      <QuestionBody start={() => -100} pulse={(i) => choicePulse(f, i)} />
      <div style={{ position: 'absolute', inset: 0, transform: 'translateX(-60px)' }}>
        <CommentBubble y={960} />
      </div>
    </>
  );
};

// marker keyframes in line 0 (frames from the line start): each step starts as the voice says its value ("0, 1, 2, 3")
const KF = [58, 76, 92, 106, 120];
const KX = [0, 1 / 3, 1 / 2, 2 / 3, 0.985];

const Jump: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l0 = at(scene, 0), l1 = at(scene, 1), l2 = at(scene, 2), l3 = at(scene, 3);
  const flash = l1 + 40; // "jump"
  const jumpAt = l1 + 70; // "three leaps"
  const six = l1 + 92; // "six"
  const zIn = l1 + 2;
  const zOut = l2 + 44;
  const t2 = l2 + 50;
  const t: StairT = {
    t1: KF.slice(0, 4).map((k) => l0 + k), d1: KF.slice(1).map((k, i) => k - KF[i]),
    dot6: six, jump: jumpAt, t2, leap: t2 + 4 * T2STEP, x4: l2 + 4, x5: l2 + 14, x10: t2 + 4 * T2STEP + 6, x11: t2 + 4 * T2STEP + 12,
    y6: six, y9: t2 + 3 * T2STEP, y12: t2 + 4 * T2STEP,
  };
  const zoom = 1 + 0.35 * ease(f, zIn, 14) - 0.35 * ease(f, zOut, 14);
  // marker: slides along the valid steps only, hides during the leap, lands on 6
  const mx = interpolate(f, KF.map((k) => l0 + k), KX, { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const onSix = f >= six;
  const mPos = onSix ? G(1, 6) : G(mx, fval(mx));
  const mOpacity = onSix ? ease(f, six, 6) * fadeTo(f, l2 + 30, 0, 8) : ease(f, l0 + 50, 6) * fadeTo(f, jumpAt - 6, 0, 6);
  const total = onSix ? 6 : fval(mx);
  const outAt = l3 + 76; // "out"
  return (
    <>
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      {KF.slice(0, 4).map((k, i) => <Sfx key={i} at={l0 + k} src={SFX.click} volume={0.26} />)}
      <Sfx at={zIn} src={SFX.whoosh} volume={0.25} />
      <Sfx at={flash} src={SFX.click} volume={0.3} />
      <Sfx at={jumpAt} src={SFX.click} volume={0.3} />
      <Sfx at={six} src={SFX.click} volume={0.3} />
      <Sfx at={t.x4} src={SFX.click} volume={0.26} />
      <Sfx at={t.x5} src={SFX.click} volume={0.26} />
      <Sfx at={zOut} src={SFX.whoosh} volume={0.25} />
      {[0, 2].map((i) => <Sfx key={`t2${i}`} at={t2 + i * T2STEP} src={SFX.click} volume={0.22} />)}
      <Sfx at={t.leap} src={SFX.click} volume={0.26} />
      <Sfx at={l3 + 3} src={SFX.click} volume={0.25} />
      <Sfx at={l3 + 44} src={SFX.click} volume={0.28} />
      <Sfx at={outAt} src={SFX.buzz} volume={0.15} />
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: ZOOM_ORIGIN }}>
        {/* the 0..1 band the voice names first */}
        <div style={{ position: 'absolute', left: G(0, 0)[0], top: G(0, 0)[1] - 14, width: 360, height: 28, borderRadius: 14, background: C.amber, opacity: 0.35 * ease(f, l0 + 4, 10) * fadeTo(f, l0 + KF[0], 0, 10) }} />
        <Stair t={t} />
        <Stage>
          {[G1, G2, G3].map((c, i) => {
            const e = ease(f, flash + i * 2, 14);
            return e > 0 && f < jumpAt + 20 ? <circle key={i} cx={G(1, 0)[0]} cy={G(0, 3)[1]} r={18 + e * (26 + i * 14)} fill="none" stroke={c} strokeWidth={8} opacity={(1 - e * 0.4) * fadeTo(f, jumpAt + 6, 0, 12)} /> : null;
          })}
          {mOpacity > 0 && <circle cx={mPos[0]} cy={mPos[1]} r={22} fill={C.amber} stroke="#fff" strokeWidth={5} opacity={mOpacity} />}
        </Stage>
        <Lbl x={G(1, 0)[0] + 30} y={G(0, 4.5)[1]} tex="+3" start={jumpAt + 6} anchor="left" color={BAD} size={64} />
      </div>
      {/* slot A: the readout chip, then the skipped list, then 1000's remainder */}
      <Slot y={270} opacity={ease(f, l0 + 50, 6) * fadeTo(f, t.x4 - 2, 0, 4)}>
        <div style={chip(C.ink)}>total = {total}</div>
      </Slot>
      <Slot y={270} opacity={ease(f, t.x4, 6) * fadeTo(f, l3, 0, 5)}>
        <div style={chip(BAD)}>skipped: 4, 5{f >= t.x10 ? ', 10, 11' : ''}</div>
      </Slot>
      <Slot y={262} opacity={ease(f, l3 + 3, 8)} style={{ transform: `scale(${pop(f, l3 + 3)})` }}>
        <div style={{ ...chip(C.card, C.ink), padding: '10px 36px' }}>
          <Tex tex={`1000=6\\times166+\\color{${BAD}}{4}`} size={66} />
        </div>
      </Slot>
      {/* slot B: the formula, then the three +1s, then the remainder strip */}
      <Slot y={410} opacity={fadeTo(f, flash, 0, 6)}>
        <div style={{ ...chip(C.card, C.ink), padding: '10px 32px' }}>
          <Tex tex={`\\color{${G1}}{${F1}}+\\color{${G2}}{${F2}}+\\color{${G3}}{${F3}}`} size={60} />
        </div>
      </Slot>
      <Slot y={410} opacity={ease(f, flash, 6) * fadeTo(f, t2 - 6, 0, 6)}>
        <div style={{ ...chip(C.card, C.ink), padding: '10px 32px' }}>
          <Tex tex={`x=1:\\ \\color{${G1}}{+1}\\ \\color{${G2}}{+1}\\ \\color{${G3}}{+1}${f >= jumpAt ? `\\ =\\ \\color{${BAD}}{+3}` : ''}`} size={60} />
        </div>
      </Slot>
      <StripRow start={t2} ring={l3 + 44} out={outAt} />
    </>
  );
};

/** The answer, the trap, then the CTA pill over the same staircase (no separate end card). */
const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l0 = at(scene, 0);
  const hit = l0 + 69; // "667" starts right after the pause at 2.23 s
  const chime = l0 + 113; // end of the line
  const trap = at(scene, 1);
  return (
    <>
      <Stair t={DONE} />
      <Slot y={262} opacity={ease(f, l0 + 4, 8) * fadeTo(f, hit - 4, 0, 4)}>
        <div style={{ ...chip(C.card, C.ink), padding: '10px 36px' }}>
          <Tex tex={`166\\times2+1=\\color{${BAD}}{333}\\ \\text{skipped}`} size={62} />
        </div>
      </Slot>
      <Slot y={262} opacity={f >= hit ? 1 : 0}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: OK, color: '#fff', borderRadius: 26, padding: '2px 40px', display: 'flex', alignItems: 'center', gap: 20, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <span style={{ fontSize: 56, fontWeight: 900, opacity: 0.85 }}>A</span>
          <Tex tex="667" size={76} color="#fff" />
          <span style={{ fontSize: 50, fontWeight: 900 }}>left</span>
        </div>
      </Slot>
      <div style={{ opacity: fadeTo(f, trap, 0, 6) }}>
        <StripRow start={-100} ring={-100} out={-100} />
      </div>
      <Slot y={405} opacity={ease(f, trap + 2, 8) * fadeTo(f, at(scene, 2) - 4, 0, 6)} style={{ transform: `translateY(${(1 - ease(f, trap + 2, 8)) * 20}px)` }}>
        <div style={{ fontSize: 60, fontWeight: 900, color: BAD, whiteSpace: 'nowrap' }}>668 forgets 1000 ✗</div>
      </Slot>
      <CtaPill start={at(scene, 2)} y={386} />
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      <Sfx at={hit - 31} src={SFX.riser} volume={0.3} />
      <Sfx at={trap} src={SFX.buzz} volume={0.2} />
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={330} start={chime} seed={7} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, jump: Jump, reveal: Reveal };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 10-style" captions="words" music={MUSIC} /> : null;
