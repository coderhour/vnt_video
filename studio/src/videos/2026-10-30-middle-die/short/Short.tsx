import { Audio, Sequence, useCurrentFrame, useVideoConfig } from 'remotion';
import { ease, fadeTo, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Stage } from '../../../lib/grid';
import { CommentBubble, CtaPill, MUSIC, PushIn, SFX, Sfx, ShortFrame, choicePulse } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { CHIME, CHOICES, DICE, Die, Label, Ring, SLUG } from '../Composition';

export { SLUG };

// Trap-first AMC 8 short: split the rolls by how many dice show a 2. Case 1 gets a zoom: the high die steps 3…6,
// then the six orders of 1, 2, 5 flick past with a counter (6 × 4 = 24); case 2 slides the odd die through its
// 3 spots and 5 faces (3 × 5 = 15); case 3 is one roll. Frame 0 and the last frame show the same three dice.

const before = () => -100;
const ROW_DY = 730; // the loop figure: three big dice
const BIG = 190;
const BX = (i: number) => 270 + i * 270;

/** The loop figure: three coloured dice, middle one ringed. */
const DiceRow: React.FC<{ vals?: number[]; start?: number }> = ({ vals = [0, 0, 0], start = -100 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Stage>
      {vals.map((v, i) => <Die key={i} x={BX(i)} y={ROW_DY} v={v} size={BIG} color={DICE[i]} scale={pop(f, start + i * 4, fps)} />)}
      <Ring x={BX(1)} y={ROW_DY} size={BIG} opacity={1} />
    </Stage>
  );
};

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const nope = at(scene, 0, 0.84);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: C.violet, color: '#fff', borderRadius: 999, padding: '10px 40px', fontSize: 52, fontWeight: 900 }}>AMC 8 · Challenge #51</div>
      </div>
      <Text x={540} y={385} w={1000} size={96} weight={900} align="center">
        Think it's <span style={{ color: C.red }}>1 in 6</span>?
      </Text>
      <PushIn frames={scene.frames} origin="540px 730px">
        <DiceRow />
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
      <div style={{ position: 'absolute', left: 50, top: 270, width: 980, boxSizing: 'border-box', background: C.card, borderRadius: 32, padding: '24px 40px', fontSize: 54, fontWeight: 800, lineHeight: 1.33, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        <b style={{ color: C.primary }}>3 fair dice</b>, put in order, smallest to largest. What's the chance the <b style={{ color: C.amber }}>middle</b> one is a <b>2</b>?
      </div>
      <DiceRow />
      <div style={{ position: 'absolute', left: 60, top: 880, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 22 }}>
        {CHOICES.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 8), background: C.card, borderRadius: 22, padding: '10px 30px', boxShadow: '0 4px 14px rgba(30,40,80,0.08)', display: 'flex', alignItems: 'center', gap: 14, scale: String(pulse(i)) }}>
            <span style={{ color: C.muted, fontSize: 44, fontWeight: 900 }}>{'ABCDE'[i]}</span>
            <Tex tex={c.replace(/\\frac/g, '\\dfrac')} size={68} />
          </div>
        ))}
      </div>
    </>
  );
};

const Question: SceneComponent = ({ scene }) => (
  <>
    <QuestionBody start={(i) => at(scene, 1, 0.55 + i * 0.07)} />
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

// ---------- the aha: three cases ----------
const RY = [610, 850, 1090]; // row centres
const SM = 136;
const SX = (i: number) => 120 + i * 165;
const PERMS = [[1, 2, 5], [1, 5, 2], [2, 1, 5], [2, 5, 1], [5, 1, 2], [5, 2, 1]];

const Readout: React.FC<{ y: number; tex: string; o: number; color?: string; left?: boolean }> = ({ y, tex, o, color = C.violet, left = false }) =>
  o <= 0 ? null : (
    <div style={{ position: 'absolute', left: left ? 650 : 640, width: left ? 400 : 280, top: y - 52, height: 104, display: 'flex', alignItems: 'center', justifyContent: left ? 'flex-start' : 'center', opacity: o }}>
      <div style={{ background: C.card, border: `5px solid ${color}`, borderRadius: 24, padding: '4px 22px', whiteSpace: 'nowrap', boxShadow: '0 6px 18px rgba(30,40,80,0.08)' }}>
        <Tex tex={tex} size={60} />
      </div>
    </div>
  );

const Cases: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  // row 1: exactly one 2
  const r1 = at(scene, 0, 0.75);
  const hi = (k: number) => at(scene, 1, 0.3 + k * 0.05); // high die steps 3, 4, 5, 6
  const perm = (k: number) => at(scene, 1, 0.56 + k * 0.045); // the six orders
  const times4 = at(scene, 1, 0.82);
  const tf = at(scene, 1, 0.92);
  const zIn = at(scene, 1, 0.02);
  const zOut = at(scene, 2, 0.0);
  const zoom = 1 + 0.25 * (ease(f, zIn, 12) - ease(f, zOut, 10));
  const hiK = [0, 1, 2, 3].filter((k) => f >= hi(k)).length;
  const pK = [0, 1, 2, 3, 4, 5].filter((k) => f >= perm(k)).length;
  const v1 = pK > 0 && f < times4 ? PERMS[pK - 1] : [1, 2, hiK > 0 && f < perm(0) ? 2 + hiK : 0];
  const read1 = f >= tf ? '6\\times4=\\textcolor{#7b61ff}{24}' : f >= times4 ? '6\\times4' : pK > 0 ? `${pK}\\text{ order${pK > 1 ? 's' : ''}}` : hiK > 0 ? `\\text{high: } ${2 + hiK}` : '?';
  // row 2: exactly two 2s
  const r2 = at(scene, 2, 0.02);
  const spot = (k: number) => at(scene, 2, 0.25 + k * 0.08); // the odd die's 3 spots
  const face = (k: number) => at(scene, 2, 0.56 + k * 0.05); // its 5 faces
  const f15 = at(scene, 2, 0.85);
  const sK = Math.max(1, [0, 1, 2].filter((k) => f >= spot(k)).length);
  const fK = [0, 1, 2, 3, 4].filter((k) => f >= face(k)).length;
  const odd = 3 - sK; // spot index: starts at the right, steps left
  const oddV = fK > 0 && f < f15 ? [1, 3, 4, 5, 6][fK - 1] : 0;
  const v2 = [0, 1, 2].map((i) => (i === odd ? oddV : 2));
  const read2 = f >= f15 ? '3\\times5=\\textcolor{#7b61ff}{15}' : fK > 0 ? '3\\times5' : f >= spot(0) ? `${sK}\\text{ spot${sK > 1 ? 's' : ''}}` : '?';
  // row 3: all three 2s
  const r3 = at(scene, 3, 0.05);
  const one = at(scene, 3, 0.6);

  const label = (y: number, text: string, s: number) => <Label x={SX(1)} y={y - SM / 2 - 40} text={text} size={50} color={C.muted} opacity={ease(f, s, 10)} />;
  return (
    <>
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      <Sfx at={zIn} src={SFX.whoosh} volume={0.25} />
      {[0, 1, 2, 3].map((k) => <Sfx key={`h${k}`} at={hi(k)} src={SFX.click} volume={0.22} />)}
      {[0, 2, 4].map((k) => <Sfx key={`p${k}`} at={perm(k)} src={SFX.click} volume={0.26} />)}
      <Sfx at={tf} src={SFX.click} volume={0.3} />
      <Sfx at={zOut} src={SFX.whoosh} volume={0.22} />
      {[0, 1, 2].map((k) => <Sfx key={`s${k}`} at={spot(k)} src={SFX.click} volume={0.24} />)}
      {[0, 2, 4].map((k) => <Sfx key={`f${k}`} at={face(k)} src={SFX.click} volume={0.22} />)}
      <Sfx at={f15} src={SFX.click} volume={0.3} />
      <Sfx at={one} src={SFX.click} volume={0.3} />

      <div style={{ position: 'absolute', left: 0, width: 1080, top: 300, display: 'flex', justifyContent: 'center', ...fadeUp(f, at(scene, 0, 0.1)) }}>
        <Tex tex={'6\\times6\\times6=216\\text{ rolls}'} size={76} />
      </div>
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: `140px ${RY[0]}px` }}>
        <Stage>
          {label(RY[0], 'one 2', r1)}
          {v1.map((v, i) => <Die key={i} x={SX(i)} y={RY[0]} v={v} size={SM} color={v === 0 ? C.muted : DICE[i]} scale={pop(f, r1 + i * 4, fps)} />)}
        </Stage>
      </div>
      <Readout y={RY[0]} tex={read1} o={ease(f, r1 + 6, 8)} left />
      <Stage>
        {label(RY[1], 'two 2s', r2)}
        {v2.map((v, i) => <Die key={i} x={SX(i)} y={RY[1]} v={v} size={SM} color={v === 0 ? C.muted : DICE[i]} scale={pop(f, r2 + i * 4, fps)} />)}
        {f >= spot(0) && f < f15 && <Ring x={SX(odd)} y={RY[1]} size={SM} opacity={1} />}
        {label(RY[2], 'three 2s', r3)}
        {[0, 1, 2].map((i) => <Die key={i} x={SX(i)} y={RY[2]} v={2} size={SM} color={DICE[i]} scale={pop(f, r3 + i * 4, fps)} />)}
      </Stage>
      <Readout y={RY[1]} tex={read2} o={ease(f, r2 + 6, 8) * (zoom > 1.02 ? 0 : 1)} />
      <Readout y={RY[2]} tex={'\\textcolor{#7b61ff}{1}'} o={ease(f, one, 8)} />
    </>
  );
};

const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 0, 0.72);
  const chime = at(scene, 0, 0.97);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, height: 210, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 26 }}>
        <div style={fadeUp(f, at(scene, 0, 0.1))}>
          <Tex tex={'\\dfrac{40}{216} ='} size={84} />
        </div>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '14px 44px', display: 'flex', alignItems: 'center', boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <Tex tex={'\\dfrac{5}{27}'} size={92} color="#fff" />
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 860, display: 'flex', justifyContent: 'center', ...fadeUp(f, 2) }}>
        <Tex tex={'24+15+1=40'} size={64} color={C.violet} />
      </div>
      <DiceRow />
      <Text x={490} y={980} w={860} size={58} weight={900} color={C.red} align="center" style={fadeUp(f, at(scene, 1, 0.05))}>
        1/6 is one die, not the middle
      </Text>
      <CtaPill start={at(scene, 2)} y={1150} />
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      <Sfx at={hit - 31} src={SFX.riser} volume={0.3} />
      <Sfx at={at(scene, 1)} src={SFX.buzz} volume={0.2} />
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={700} y={380} start={chime} seed={5} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, cases: Cases, reveal: Reveal };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" captions="words" music={MUSIC} /> : null;
