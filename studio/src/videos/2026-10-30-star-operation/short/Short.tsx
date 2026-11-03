import { Audio, Sequence, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { CommentBubble, CtaPill, MUSIC, PushIn, SFX, Sfx, ShortFrame, choicePulse } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { C } from '../../../lib/theme';
import { Confetti, Text } from '../../../lib/ui';
import { CHIME, CHOICES, QEXPR, RULE, SLUG } from '../Composition';

export { SLUG };

// Trap-first short: hook (5/7?) → question → think (comment bait) → the chain, one star at a time (step counter,
// zoom on each result, a 3-step track filling up: 5/7 and 9/11 are only steps 1 and 2) → reveal (56/64 = 7/8, the trap, CTA pill).
// The last frame shows the same chain + step track as frame 0.

const CHAIN_Y = 530;
const WORK_Y = 715;
const TRACK_Y = 1010;
const XS = [200, 490, 780];
const before = -100;
const never = 99999;

/** The chain ((1/2 ⋆ 1/3) ⋆ 1/4) ⋆ 1/5; the fractions used so far (`upto` = 0…4) turn violet. */
const Chain: React.FC<{ upto?: number }> = ({ upto = 0 }) => {
  const P: [string, number][] = [['\\Big(\\Big(', -1], ['\\dfrac12', 1], ['\\star', -1], ['\\dfrac13', 2], ['\\Big)', -1], ['\\star', -1], ['\\dfrac14', 3], ['\\Big)', -1], ['\\star', -1], ['\\dfrac15', 4]];
  return (
    <div style={{ position: 'absolute', left: 0, width: 1080, top: CHAIN_Y, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10 }}>
      {P.map(([t, k], i) => (
        <Tex key={i} tex={t} size={60} color={k > 0 && k <= Math.max(upto, upto > 0 ? 2 : 0) ? C.violet : k < 0 ? C.muted : C.ink} />
      ))}
    </div>
  );
};

/** Three step boxes: step 1, 2, 3 with their values (null = "?"). `bad` boxes get a red border and a ✗. */
const Track: React.FC<{ vals: (string | null)[]; pops?: number[]; bad?: boolean[]; ok?: boolean[] }> = ({ vals, pops = [before, before, before], bad = [], ok = [] }) => {
  const f = useCurrentFrame();
  return (
    <>
      {XS.map((x, i) => (
        <div key={i} style={{ position: 'absolute', left: x - 120, top: TRACK_Y, width: 240, height: 240, boxSizing: 'border-box', background: ok[i] ? C.green : C.card, border: `7px solid ${ok[i] ? C.green : bad[i] ? C.red : C.line}`, borderRadius: 30, boxShadow: '0 6px 20px rgba(30,40,80,0.08)', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 6 }}>
          <div style={{ fontSize: 42, lineHeight: 1.2, fontWeight: 900, color: ok[i] ? '#fff' : C.muted }}>step {i + 1}</div>
          <div style={{ transform: `scale(${vals[i] ? pop(f, pops[i]) : 1})` }}>
            {vals[i] ? <Tex tex={vals[i] as string} size={62} color={ok[i] ? '#fff' : bad[i] ? C.red : C.ink} /> : <span style={{ fontSize: 110, fontWeight: 900, color: C.line, lineHeight: 1.2 }}>?</span>}
          </div>
          {bad[i] && <div style={{ position: 'absolute', right: -18, top: -22, width: 64, height: 64, borderRadius: 32, background: C.red, color: '#fff', fontSize: 44, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✗</div>}
        </div>
      ))}
      {[0, 1].map((i) => (
        <div key={i} style={{ position: 'absolute', left: XS[i] + 120, width: XS[i + 1] - XS[i] - 240, top: TRACK_Y + 70, textAlign: 'center', fontSize: 60, fontWeight: 900, color: C.muted }}>→</div>
      ))}
    </>
  );
};

/** A row of maths pieces centred at WORK_Y, each fading in at its own frame. */
const Work: React.FC<{ pieces: [string, number, string?][]; zoom?: number; opacity?: number }> = ({ pieces, zoom = 1, opacity = 1 }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: 0, width: 1080, top: WORK_Y, height: 180, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 14, transform: `scale(${zoom})`, opacity }}>
      {pieces.map(([t, s, col], i) => (
        <div key={i} style={{ ...fadeUp(f, s, 8) }}>
          <Tex tex={t} size={76} color={col ?? C.ink} />
        </div>
      ))}
    </div>
  );
};

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const nope = at(scene, 0, 0.86);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: C.violet, color: '#fff', borderRadius: 999, padding: '10px 40px', fontSize: 52, fontWeight: 900 }}>AMC 8 · Challenge #56</div>
      </div>
      <Text x={540} y={385} w={1000} size={96} weight={900} align="center">
        Think it's <span style={{ color: C.red }}>5/7</span>?
      </Text>
      <PushIn frames={scene.frames} origin="540px 900px">
        <Chain />
        <Track vals={['\\dfrac57', null, null]} bad={[f >= nope, false, false]} />
      </PushIn>
      <Sfx at={nope} src={SFX.buzz} volume={0.35} />
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 740, display: 'flex', justifyContent: 'center', opacity: ease(f, nope, 4) }}>
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
      <div style={{ position: 'absolute', left: 40, top: 290, width: 1000, boxSizing: 'border-box', background: C.card, borderRadius: 32, padding: '26px 20px', boxShadow: '0 8px 30px rgba(30,40,80,0.07)', textAlign: 'center', fontSize: 54, fontWeight: 800 }}>
        <Tex tex={RULE} size={68} />
        <div style={{ margin: '14px 0 6px' }}>
          Find <b style={{ color: C.violet }}>the whole chain</b>:
        </div>
        <div style={{ whiteSpace: 'nowrap' }}>
          <Tex tex={QEXPR} size={60} />
        </div>
      </div>
      <div style={{ position: 'absolute', left: 60, top: 830, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>
        {CHOICES.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 8), background: C.card, borderRadius: 22, padding: '8px 16px', boxShadow: '0 4px 14px rgba(30,40,80,0.08)', display: 'flex', alignItems: 'center', gap: 10, scale: String(pulse(i)) }}>
            <span style={{ color: C.muted, fontSize: 40, fontWeight: 900 }}>{'ABCDE'[i]}</span>
            <Tex tex={c} size={64} />
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
      <QuestionBody start={() => before} pulse={(i) => choicePulse(f, i)} />
      <CommentBubble y={1070} />
    </>
  );
};

/** One star at a time: the step counter ticks, the work row zooms on each result, the track fills. */
const ChainScene: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l1 = at(scene, 1);
  const l2 = at(scene, 2);
  const r1 = at(scene, 0, 0.76); // "five over seven"
  const s2 = at(scene, 1, 0.36); // "Star one over four"
  const r2 = at(scene, 1, 0.78); // "nine over eleven"
  const s3 = at(scene, 2, 0.45); // "with one over five"
  const step = f >= s3 - 12 ? 3 : f >= s2 - 10 ? 2 : 1;
  const zoom = 1 + 0.25 * (ease(f, r1, 10) * fadeTo(f, l1, 0, 10) + ease(f, r2, 10) * fadeTo(f, l2, 0, 10));
  const w1 = fadeTo(f, s2 - 10, 0, 8);
  const w2 = ease(f, s2 - 8, 8) * fadeTo(f, s3 - 12, 0, 8);
  const w3 = ease(f, s3 - 10, 8);
  return (
    <>
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      <Sfx at={r1 - 4} src={SFX.whoosh} volume={0.25} />
      <Sfx at={r2 - 4} src={SFX.whoosh} volume={0.25} />
      {[at(scene, 0, 0.3), at(scene, 0, 0.5), s2, s3].map((s, i) => <Sfx key={i} at={s} src={SFX.click} volume={0.25} />)}
      <Sfx at={r1} src={SFX.click} volume={0.3} />
      <Sfx at={r2} src={SFX.click} volume={0.3} />
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 300, display: 'flex', justifyContent: 'center' }}>
        <div key={step} style={{ transform: `scale(${pop(f, step === 1 ? 0 : step === 2 ? s2 - 10 : s3 - 12)})`, background: C.violet, color: '#fff', borderRadius: 999, padding: '12px 48px', fontSize: 72, fontWeight: 900 }}>
          step {step} of 3
        </div>
      </div>
      <Chain upto={step + 1} />
      <Work opacity={w1} zoom={zoom} pieces={[['\\dfrac12', at(scene, 0, 0.2)], ['\\star', at(scene, 0, 0.3)], ['\\dfrac13', at(scene, 0, 0.42)], ['=', at(scene, 0, 0.6)], ['\\dfrac57', r1, C.red]]} />
      <Work opacity={w2} zoom={zoom} pieces={[['\\dfrac57', s2 - 8], ['\\star', s2 - 4], ['\\dfrac14', s2], ['=', at(scene, 1, 0.62)], ['\\dfrac9{11}', r2, C.red]]} />
      <Work opacity={w3} pieces={[['\\dfrac9{11}', s3 - 10], ['\\star', s3 - 6], ['\\dfrac15', s3], ['=', s3 + 6], ['\\;?', s3 + 12, C.muted]]} />
      <Track
        vals={['\\dfrac57', f >= r2 ? '\\dfrac9{11}' : null, null]}
        pops={[r1, r2, never]}
        bad={[f >= at(scene, 1, 0.1), f >= at(scene, 2, 0.1), false]}
      />
      {/* "not done!" tag over the latest result */}
      <Text x={540} y={TRACK_Y - 80} w={900} size={60} weight={900} align="center" color={C.red} style={{ opacity: ease(f, at(scene, 1, 0.05), 6) * fadeTo(f, s2 - 10, 0, 6) + ease(f, at(scene, 2, 0.02), 6) * fadeTo(f, s3 - 12, 0, 6), whiteSpace: 'nowrap' }}>
        not done yet!
      </Text>
    </>
  );
};

/** 56/64 = 7/8 into step 3, the trap on step 1, then the CTA pill over the same chain + track. */
const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 0, 0.62);
  const chime = at(scene, 0, 0.97);
  const l1 = at(scene, 1);
  const l2 = at(scene, 2);
  return (
    <>
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      <Sfx at={4} src={SFX.click} volume={0.28} />
      <Sfx at={hit - 31} src={SFX.riser} volume={0.3} />
      <Sfx at={l1} src={SFX.buzz} volume={0.2} />
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 285, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '10px 48px', display: 'flex', alignItems: 'center', gap: 24, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <span style={{ fontSize: 66, fontWeight: 900 }}>Answer</span>
          <Tex tex="\dfrac78" size={80} color="#fff" />
        </div>
      </div>
      <Chain upto={4} />
      <Work
        opacity={fadeTo(f, l2 - 6, 0, 8)}
        pieces={[['\\dfrac9{11}', before], ['\\star', before], ['\\dfrac15', before], ['=', before], ['\\dfrac{56}{64}', 2], ['=', hit - 6], ['\\dfrac78', hit, C.green]]}
      />
      <Track vals={['\\dfrac57', '\\dfrac9{11}', f >= hit ? '\\dfrac78' : null]} pops={[before, before, hit]} bad={[true, true, false]} ok={[false, false, f >= hit]} />
      <Text x={540} y={TRACK_Y - 80} w={900} size={56} weight={900} align="center" color={C.red} style={{ ...fadeUp(f, l1 + 3), whiteSpace: 'nowrap' }}>
        5/7 stops too early!
      </Text>
      <CtaPill start={l2} y={750} />
      <Confetti x={540} y={360} start={chime} seed={9} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, chain: ChainScene, reveal: Reveal };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" captions="words" music={MUSIC} /> : null;
