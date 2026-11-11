import { Audio, Sequence, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { CommentBubble, CtaPill, MUSIC, PushIn, SFX, Sfx, ShortFrame, choicePulse } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { CHIME, CHOICES, SLUG } from '../Composition';

export { SLUG };

// AMC 10 Challenge #20: trap 24 (skipping n = 1, 2), aha = write n in base five, doubling must not carry,
// so every digit is 0, 1 or 2: 3·3·3 − 1 = 26. Hook and last frame share the factorial-pairs figure.

/** Digits with the last k zeros coloured. */
const ZR = (s: string, k: number, col: string) => `${s.slice(0, s.length - k)}{\\color{${col}}${s.slice(s.length - k)}}`;

const PairCard: React.FC<{ y: number; color: string; tag: string; rows: [string, string, number][] }> = ({ y, color, tag, rows }) => (
  <div style={{ position: 'absolute', left: 60, top: y, width: 860, height: 220, boxSizing: 'border-box', background: C.card, border: `6px solid ${color}`, borderRadius: 30, padding: '34px 26px 14px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8, boxShadow: '0 8px 24px rgba(30,40,80,0.07)' }}>
    {rows.map(([lhs, digits, k]) => (
      <div key={lhs} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', whiteSpace: 'nowrap' }}>
        <Tex tex={`${lhs}=${ZR(digits, k, color)}`} size={42} />
        <span style={{ background: color, color: '#fff', borderRadius: 999, padding: '2px 18px', fontSize: 36, fontWeight: 900 }}>
          {k} {k === 1 ? 'zero' : 'zeros'}
        </span>
      </div>
    ))}
    <div style={{ position: 'absolute', right: 24, top: -32, background: color, color: '#fff', borderRadius: 999, padding: '2px 24px', fontSize: 42, fontWeight: 900 }}>{tag}</div>
  </div>
);

/** 10! / 20! doubles, 8! / 16! doesn't. The hook's figure and the last frame's (the loop cut). */
const Pairs: React.FC = () => (
  <>
    <PairCard y={540} color={C.green} tag="×2 ✓" rows={[['10!', '3628800', 2], ['20!', '2432902008176640000', 4]]} />
    <PairCard y={800} color={C.red} tag="3 > 2×1 ✗" rows={[['8!', '40320', 1], ['16!', '20922789888000', 3]]} />
  </>
);

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const nope = at(scene, 0, 0.84);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: C.violet, color: '#fff', borderRadius: 999, padding: '10px 40px', fontSize: 52, fontWeight: 900 }}>AMC 10 · Challenge #20</div>
      </div>
      <Text x={540} y={385} w={1000} size={96} weight={900} align="center">
        Think it's <span style={{ color: C.red }}>24</span>?
      </Text>
      <PushIn frames={scene.frames} origin="490px 760px">
        <Pairs />
      </PushIn>
      <Sfx at={nope} src={SFX.buzz} volume={0.35} />
      <div style={{ position: 'absolute', left: 0, width: 980, top: 660, display: 'flex', justifyContent: 'center', opacity: ease(f, nope, 4) }}>
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
        For how many <b style={{ color: C.violet }}>n from 1 to 100</b> does <Tex tex="(2n)!" size={54} /> end in <b style={{ color: C.primary }}>exactly twice</b> as many zeros as <Tex tex="n!" size={54} />?
        <div style={{ marginTop: 14, fontSize: 44, color: C.muted }}>
          <Tex tex="n!=1\times2\times\cdots\times n" size={46} />
        </div>
      </div>
      <div style={{ position: 'absolute', left: 60, top: 1010, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 22 }}>
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
    <QuestionBody start={(i) => at(scene, 0, 0.55 + i * 0.07)} />
    <Sfx at={0} src={SFX.whoosh} volume={0.3} />
  </>
);

const Think: SceneComponent = () => {
  const f = useCurrentFrame();
  return (
    <>
      <QuestionBody start={() => -100} pulse={(i) => choicePulse(f, i)} />
      <CommentBubble y={790} />
    </>
  );
};

// ---------- aha: base five, no carries ----------

const BOX_X = [110, 410, 710];
const BOX_W = 260;
const BOX_Y = 520;
const BOX_H = 220;
const LABELS = ['25s', '5s', '1s'];
const BOX_COL = [C.ink, C.violet, C.primary];

const Box: React.FC<{ i: number; start: number; children?: React.ReactNode; border?: string }> = ({ i, start, children, border }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ ...fadeUp(f, start, 10) }}>
      <div style={{ position: 'absolute', left: BOX_X[i], top: BOX_Y - 80, width: BOX_W, textAlign: 'center', fontSize: 54, fontWeight: 900, color: BOX_COL[i] }}>{LABELS[i]}</div>
      <div style={{ position: 'absolute', left: BOX_X[i], top: BOX_Y, width: BOX_W, height: BOX_H, boxSizing: 'border-box', borderRadius: 30, background: C.card, border: `8px solid ${border ?? BOX_COL[i]}`, boxShadow: '0 8px 24px rgba(30,40,80,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {children}
      </div>
    </div>
  );
};

/** A big digit that pops in at `start` (and is gone after `end`). */
const Dig: React.FC<{ d: string; start: number; end?: number; color?: string; size?: number }> = ({ d, start, end, color = C.ink, size = 150 }) => {
  const f = useCurrentFrame();
  if (f < start || (end !== undefined && f >= end)) return null;
  return <span style={{ position: 'absolute', fontSize: size, fontWeight: 900, color, transform: `scale(${pop(f, start)})` }}>{d}</span>;
};

const Readout: React.FC<{ a: number; b?: number; children: React.ReactNode; color?: string }> = ({ a, b, children, color = C.ink }) => {
  const f = useCurrentFrame();
  const o = ease(f, a, 8) * (b === undefined ? 1 : fadeTo(f, b, 0, 6));
  if (o <= 0) return null;
  return (
    <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, display: 'flex', justifyContent: 'center', opacity: o, fontSize: 80, fontWeight: 900, color, whiteSpace: 'nowrap' }}>
      {children}
    </div>
  );
};

const Base5: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const L = (i: number, t = 0) => at(scene, i, t);
  const boxes = L(0, 0.55);
  const fill = L(1, 0.12); // "one, three"
  const dbl = L(1, 0.36); // "Double it"
  const six = L(1, 0.5); // "the three makes six"
  const carry = L(1, 0.7); // "carries an extra five"
  const l2 = L(2);
  const opts = (i: number) => L(2, 0.12 + i * 0.1);
  const prod = L(2, 0.62);
  // zoom onto the fives + ones boxes while the carry happens, back out for line 3
  const zoom = 1 + 0.25 * ease(f, dbl, 12) - 0.25 * ease(f, l2, 10);
  // the +1 flying from the ones box into the fives box
  const fly = ease(f, carry, 14);
  const carryX = BOX_X[2] + BOX_W / 2 + (BOX_X[1] + BOX_W / 2 - (BOX_X[2] + BOX_W / 2)) * fly;
  const carryO = ease(f, carry, 4) * fadeTo(f, carry + 16, 0, 6);
  return (
    <>
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      {[0, 1, 2].map((i) => <Sfx key={i} at={boxes + i * 5} src={SFX.click} volume={0.25} />)}
      <Sfx at={fill} src={SFX.click} volume={0.28} />
      <Sfx at={dbl} src={SFX.whoosh} volume={0.25} />
      <Sfx at={six} src={SFX.click} volume={0.28} />
      <Sfx at={carry} src={SFX.buzz} volume={0.15} />
      <Sfx at={l2} src={SFX.whoosh} volume={0.25} />
      {[0, 1, 2].map((i) => <Sfx key={`o${i}`} at={opts(i)} src={SFX.click} volume={0.25} />)}
      <Sfx at={prod} src={SFX.click} volume={0.3} />

      <Readout a={0} b={L(1, 0.05)} color={C.primary}>count the fives</Readout>
      <Readout a={L(1, 0.05)} b={dbl}>
        <Tex tex="8=1\times5+3=13_5" size={80} />
      </Readout>
      <Readout a={dbl} b={carry + 18}>
        <Tex tex="\text{double: }16" size={80} />
      </Readout>
      <Readout a={carry + 18} b={l2}>
        <Tex tex="16=31_5" size={80} color={C.red} />
      </Readout>
      <Readout a={l2} color={C.green}>
        every digit ≤ 2
      </Readout>

      <div style={{ position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: '700px 630px' }}>
        {[0, 1, 2].map((i) => (
          <Box key={i} i={i} start={boxes + i * 5} border={i === 2 && f >= six && f < l2 ? C.red : undefined}>
            {/* line 2: 8 = 013 in base five, then doubled */}
            <Dig d={['0', '1', '3'][i]} start={fill} end={i === 0 ? l2 : six} color={i === 0 ? C.muted : BOX_COL[i]} />
            {i === 1 && <Dig d="2" start={six} end={carry + 14} color={C.violet} />}
            {i === 1 && <Dig d="3" start={carry + 14} end={l2} color={C.red} />}
            {i === 2 && <Dig d="6" start={six} end={carry + 4} color={C.red} />}
            {i === 2 && <Dig d="1" start={carry + 4} end={l2} color={C.primary} />}
            {/* line 3: the allowed digits */}
            {f >= opts(i) && (
              <span style={{ position: 'absolute', fontSize: 84, fontWeight: 900, color: C.green, transform: `scale(${pop(f, opts(i))})`, whiteSpace: 'nowrap' }}>0 1 2</span>
            )}
          </Box>
        ))}
        {[0, 1, 2].map((i) => (
          <div key={`x${i}`} style={{ position: 'absolute', left: BOX_X[i], top: BOX_Y + BOX_H + 14, width: BOX_W, textAlign: 'center', fontSize: 56, fontWeight: 900, color: C.red, textDecoration: 'line-through', textDecorationThickness: 6, ...fadeUp(f, opts(i) + 4, 8) }}>
            3 4
          </div>
        ))}
        {/* the carry */}
        <div style={{ position: 'absolute', left: carryX - 60, top: BOX_Y - 150 - 40 * Math.sin(fly * Math.PI), width: 120, textAlign: 'center', fontSize: 64, fontWeight: 900, color: C.red, opacity: carryO }}>+1</div>
        <div style={{ position: 'absolute', left: BOX_X[2] + BOX_W - 380, top: BOX_Y + BOX_H + 14, width: 380, textAlign: 'right', whiteSpace: 'nowrap', ...fadeUp(f, six, 8), opacity: ease(f, six, 8) * fadeTo(f, l2, 0, 6) }}>
          <Tex tex="3\times2=6\ge5" size={44} color={C.red} />
        </div>
      </div>

      {/* fives in 16!: 3, not 2 x 1 */}
      <div style={{ position: 'absolute', left: 60, width: 860, top: 880, display: 'flex', justifyContent: 'center', ...fadeUp(f, carry + 18), opacity: ease(f, carry + 18, 8) * fadeTo(f, l2, 0, 6) }}>
        <div style={{ background: C.red, color: '#fff', borderRadius: 24, padding: '10px 36px', fontSize: 60, fontWeight: 900, whiteSpace: 'nowrap' }}>3 fives, not 2 ✗</div>
      </div>
      <div style={{ position: 'absolute', left: 60, width: 860, top: 900, display: 'flex', justifyContent: 'center', ...fadeUp(f, prod) }}>
        <div style={{ background: C.green, color: '#fff', borderRadius: 24, padding: '12px 40px', display: 'flex' }}>
          <Tex tex="3\times3\times3=27" size={80} color="#fff" />
        </div>
      </div>
    </>
  );
};

/** The count, the trap, then the CTA pill over the same pairs figure as frame 0. */
const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 0, 0.7); // onset of "twenty-six" (frame 61 of 87, from the waveform)
  const chime = at(scene, 0, 0.97);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 258, display: 'flex', justifyContent: 'center', whiteSpace: 'nowrap', ...fadeUp(f, at(scene, 0, 0.05)) }}>
        <Tex tex="\cancel{000_5}\ \Rightarrow\ 27-1" size={70} />
      </div>
      {/* the answer chip on its own line below, so it never covers the "1" */}
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 362, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '4px 40px', display: 'flex', alignItems: 'center', boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <Tex tex="=26" size={84} color="#fff" />
        </div>
      </div>
      <Pairs />
      <Text x={490} y={1045} w={860} size={56} weight={900} color={C.red} align="center" style={fadeUp(f, at(scene, 1, 0.05))}>
        24 skips n = 1, 2. They count!
      </Text>
      <CtaPill start={at(scene, 2)} y={1160} />
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      <Sfx at={hit - 31} src={SFX.riser} volume={0.3} />
      <Sfx at={at(scene, 1)} src={SFX.buzz} volume={0.2} />
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={600} y={360} start={chime} seed={20} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, base5: Base5, reveal: Reveal };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 10-style" captions="words" music={MUSIC} /> : null;
