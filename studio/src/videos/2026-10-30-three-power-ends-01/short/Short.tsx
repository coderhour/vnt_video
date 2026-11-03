import { Audio, Sequence, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { CommentBubble, CtaPill, MUSIC, PushIn, SFX, Sfx, ShortFrame, choicePulse } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { CHIME, CHOICES, SLUG } from '../Composition';

export { SLUG };

// Trap-first AMC 8 short: "Think it's 4?", the last-digit loop, then the ×81 ladder whose last two digits step
// 81, 61, 41, 21, 01 (zoom on the last steps). Frame 0 and the last frame show the same ladder at the same place.

const before = () => -100;
const never = 99999;

const ROW_Y = (i: number) => 540 + i * 124;
const ROW_H = 104;
const EXPS = ['4', '8', '12', '16', '?'];
const LAST = ['81', '61', '41', '21', '01'];

/** One rung: 3^n … last two digits. `last` null = "??". */
const Rung: React.FC<{ i: number; exp: string; last: string | null; start: number; ring?: string; done?: boolean; tens?: boolean }> = ({ i, exp, last, start, ring, done, tens }) => {
  const f = useCurrentFrame();
  const s = start < 0 ? 1 : pop(f, start);
  if (s <= 0) return null;
  const digits = last ? last.split('') : ['?', '?'];
  return (
    <div
      style={{
        position: 'absolute', left: 60, top: ROW_Y(i), width: 680, height: ROW_H, boxSizing: 'border-box', padding: '0 30px 0 44px',
        background: C.card, borderRadius: 26, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: ring ? `0 0 0 8px ${ring}` : '0 6px 22px rgba(30,40,80,0.09)', transform: `scale(${s})`,
      }}
    >
      <div style={{ width: 170 }}>
        <Tex tex={`3^{${exp}}`} size={72} />
      </div>
      <span style={{ fontSize: 46, fontWeight: 900, color: C.muted }}>ends in</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 60, fontWeight: 900, color: C.muted }}>…</span>
        {digits.map((d, j) => (
          <div
            key={j}
            style={{
              width: 80, height: 88, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 66, fontWeight: 900,
              background: done ? C.green : last ? (j === 0 && tens ? C.amber : C.violetSoft) : C.line,
              color: done || (j === 0 && tens && last) ? '#fff' : last ? C.ink : C.muted,
            }}
          >
            {d}
          </div>
        ))}
      </div>
    </div>
  );
};

/** "×81" tag between rung i and rung i + 1. */
const Times81: React.FC<{ i: number; start: number }> = ({ i, start }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: 760, top: ROW_Y(i) + ROW_H - 26, ...(start < 0 ? {} : fadeUp(f, start, 8)) }}>
      <Tex tex="\times 81" size={58} color={C.violet} />
    </div>
  );
};

/** The whole ladder as the hook / reveal show it (all at once). */
const Ladder: React.FC<{ filled: (i: number) => boolean; exp4: string; ring0?: string; doneAt?: number }> = ({ filled, exp4, ring0, doneAt = never }) => {
  const f = useCurrentFrame();
  return (
    <>
      {EXPS.map((e, i) => (
        <Rung key={i} i={i} exp={i === 4 ? exp4 : e} last={filled(i) ? LAST[i] : null} start={-1} ring={i === 0 ? ring0 : undefined} done={i === 4 && f >= doneAt} />
      ))}
      {[0, 1, 2, 3].map((i) => <Times81 key={i} i={i} start={-1} />)}
    </>
  );
};

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const nope = at(scene, 0, 0.85);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: C.violet, color: '#fff', borderRadius: 999, padding: '10px 40px', fontSize: 52, fontWeight: 900 }}>AMC 8 · Challenge #41</div>
      </div>
      <Text x={540} y={385} w={1000} size={96} weight={900} align="center">
        Think it's <span style={{ color: C.red }}>4</span>?
      </Text>
      <PushIn frames={scene.frames} origin="400px 840px">
        <Ladder filled={(i) => i === 0} exp4="?" ring0={f >= nope ? C.red : C.amber} />
      </PushIn>
      <Sfx at={nope} src={SFX.buzz} volume={0.35} />
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 700, display: 'flex', justifyContent: 'center', opacity: ease(f, nope, 4) }}>
        <div style={{ transform: `rotate(-8deg) scale(${pop(f, nope)})`, border: `14px solid ${C.red}`, color: C.red, background: 'rgba(255,255,255,0.92)', borderRadius: 28, padding: '6px 54px', fontSize: 150, fontWeight: 900, letterSpacing: 6 }}>
          NOPE
        </div>
      </div>
    </>
  );
};

const POWERS: [string, string][] = [['3^1', '3'], ['3^2', '9'], ['3^3', '27'], ['3^4', '81']];

const QuestionBody: React.FC<{ start: (i: number) => number; pow: (i: number) => number; pulse?: (i: number) => number }> = ({ start, pow, pulse = () => 1 }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 50, top: 290, width: 980, boxSizing: 'border-box', background: C.card, borderRadius: 32, padding: '26px 40px', fontSize: 54, fontWeight: 800, lineHeight: 1.35, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        What's the <b style={{ color: C.violet }}>smallest</b> whole number <b style={{ color: C.violet }}>n</b> so that <b style={{ color: C.primary }}>3<sup>n</sup></b> ends in <b style={{ color: C.red }}>01</b>?
      </div>
      {POWERS.map(([p, v], i) => (
        <div key={p} style={{ position: 'absolute', left: 40 + i * 255, top: 560, width: 235, height: 190, background: C.card, borderRadius: 28, boxShadow: '0 8px 26px rgba(30,40,80,0.08)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, ...fadeUp(f, pow(i), 8) }}>
          <Tex tex={p} size={56} color={C.muted} />
          <span style={{ fontSize: 88, fontWeight: 900, color: C.violet, lineHeight: 1 }}>{v}</span>
        </div>
      ))}
      <div style={{ position: 'absolute', left: 60, top: 830, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 22 }}>
        {CHOICES.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 8), background: C.card, borderRadius: 22, padding: '12px 34px', boxShadow: '0 4px 14px rgba(30,40,80,0.08)', display: 'flex', alignItems: 'center', gap: 14, scale: String(pulse(i)) }}>
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
    <QuestionBody pow={(i) => 6 + i * 6} start={(i) => at(scene, 1, 0.45 + i * 0.08)} />
    {[0, 1, 2, 3].map((i) => <Sfx key={i} at={6 + i * 6} src={SFX.click} volume={0.22} />)}
    <Sfx at={0} src={SFX.whoosh} volume={0.3} />
  </>
);

const Think: SceneComponent = () => {
  const f = useCurrentFrame();
  return (
    <>
      <QuestionBody pow={before} start={before} pulse={(i) => choicePulse(f, i)} />
      <CommentBubble />
    </>
  );
};

const LOOP = ['3', '9', '7', '1'];

/** The aha: the last digit loops 3, 9, 7, 1, then the ×81 ladder steps the last two digits 81 → 61 → 41 → 21 → 01. */
const Jump: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l1 = at(scene, 1);
  const node = (i: number) => at(scene, 0, 0.25 + i * 0.08);
  const loopBack = at(scene, 0, 0.55);
  const loopOut = fadeTo(f, l1 - 4, 0, 10);
  // rung frames: 3^4 on "three to the fourth", the rest on "sixty-one, forty-one, twenty-one, zero one"
  const rs = [at(scene, 1, 0.03), at(scene, 2, 0.36), at(scene, 2, 0.49), at(scene, 2, 0.63), at(scene, 2, 0.87)];
  const tags = [at(scene, 1, 0.72), rs[2] - 5, rs[3] - 5, rs[4] - 5];
  const zIn = at(scene, 2, 0.5);
  const zOut = at(scene, 2, 0.97);
  const zoom = 1 + 0.38 * ease(f, zIn, 12) - 0.38 * ease(f, zOut, 10);
  const cur = rs.reduce((k, r, i) => (f >= r ? i : k), 0);
  const readout = ease(f, rs[0] + 6, 8);
  return (
    <>
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      {LOOP.map((_, i) => <Sfx key={i} at={node(i)} src={SFX.click} volume={0.25} />)}
      {rs.map((r, i) => <Sfx key={`r${i}`} at={r} src={SFX.click} volume={0.28} />)}
      <Sfx at={zIn} src={SFX.whoosh} volume={0.25} />
      <Sfx at={zOut} src={SFX.whoosh} volume={0.25} />
      {/* titles */}
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 300, textAlign: 'center', fontSize: 84, fontWeight: 900, opacity: fadeTo(f, zIn, 0, 8) + ease(f, zOut, 8) }}>
        <div style={{ position: 'absolute', width: 1080, opacity: loopOut }}>
          the <span style={{ color: C.violet }}>last digit</span> loops
        </div>
        <div style={{ position: 'absolute', width: 1080, opacity: ease(f, l1, 8) }}>
          jump <span style={{ color: C.violet }}>×81</span><span style={{ opacity: ease(f, at(scene, 2), 8) }}>, tens <span style={{ color: C.amber }}>−2</span></span>
        </div>
      </div>
      {/* line 0: the loop */}
      <div style={{ opacity: loopOut }}>
        {LOOP.map((d, i) => {
          const s = pop(f, node(i));
          const cx = 165 + i * 250;
          return (
            <div key={i}>
              <div style={{ position: 'absolute', left: cx - 100, top: 450, width: 200, textAlign: 'center', opacity: ease(f, node(i), 6) }}>
                <Tex tex={`3^{${i + 1}}`} size={60} color={C.muted} />
              </div>
              <div style={{ position: 'absolute', left: cx - 95, top: 540, width: 190, height: 190, borderRadius: '50%', background: d === '1' ? C.green : C.violet, color: '#fff', fontSize: 110, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${s})`, boxShadow: '0 10px 28px rgba(30,40,80,0.15)' }}>
                {d}
              </div>
            </div>
          );
        })}
        <svg viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          <path d="M 885 745 C 885 880, 165 880, 165 745" stroke={C.violet} strokeWidth={10} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - ease(f, loopBack, 14)} />
          {f >= loopBack + 12 && <path d="M 165 742 L 145 778 L 185 778 Z" fill={C.violet} />}
        </svg>
        <Text x={540} y={900} w={860} size={64} weight={900} color={C.green} align="center" style={fadeUp(f, at(scene, 0, 0.7))}>
          ends in 1: n = 4, 8, 12, …
        </Text>
      </div>
      {/* lines 1–2: the ladder, zoomed onto the last steps */}
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: '250px 1140px' }}>
        {EXPS.map((e, i) => (
          <Rung key={i} i={i} exp={e} last={LAST[i]} start={rs[i]} done={i === 4} tens={i > 0 && i < 4} />
        ))}
        {tags.map((t, i) => <Times81 key={i} i={i} start={t} />)}
      </div>
      <div style={{ position: 'absolute', left: 60, width: 860, top: 1180, display: 'flex', justifyContent: 'center', opacity: readout * fadeTo(f, zIn, 0, 6) }}>
        <div style={{ background: C.ink, color: '#fff', borderRadius: 24, padding: '8px 40px', fontSize: 64, fontWeight: 900, transform: `scale(${cur > 0 ? 0.9 + 0.1 * pop(f, rs[cur]) : 1})` }}>
          ends in …<span style={{ color: C.amber }}>{LAST[cur][0]}</span>{LAST[cur][1]}
        </div>
      </div>
    </>
  );
};

/** The answer, the trap, then the CTA pill over the same ladder the hook showed. */
const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 0, 0.82);
  const chime = at(scene, 0, 0.97);
  const trap = at(scene, 1);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 262, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '10px 50px', display: 'flex', alignItems: 'center', gap: 22, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <Tex tex="n = 20" size={104} color="#fff" />
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 425, display: 'flex', justifyContent: 'center', ...fadeUp(f, at(scene, 0, 0.1)) }}>
        <Tex tex={`5 \\text{ jumps} \\times 4${f >= hit ? ' = 20' : ''}`} size={66} color={C.violet} />
      </div>
      <Ladder filled={() => true} exp4={f >= hit ? '20' : '?'} ring0={f >= trap ? C.red : undefined} doneAt={-1} />
      <div style={{ position: 'absolute', left: 60, width: 860, top: 1170, display: 'flex', justifyContent: 'center', ...fadeUp(f, trap + 3), opacity: ease(f, trap + 3, 8) * fadeTo(f, at(scene, 2) - 6, 0, 6) }}>
        <Tex tex={'3^4 = 81 \\text{: not } 01 \\text{ yet}'} size={62} color={C.red} />
      </div>
      <CtaPill start={at(scene, 2)} y={1170} />
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      <Sfx at={hit - 31} src={SFX.riser} volume={0.3} />
      <Sfx at={trap} src={SFX.buzz} volume={0.2} />
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={330} start={chime} seed={5} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, jump: Jump, reveal: Reveal };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" captions="words" music={MUSIC} /> : null;
