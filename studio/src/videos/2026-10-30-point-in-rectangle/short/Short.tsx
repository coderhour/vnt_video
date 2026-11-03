import { Audio, Sequence, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Stage } from '../../../lib/grid';
import { CommentBubble, CtaPill, MUSIC, PushIn, SFX, Sfx, ShortFrame, choicePulse } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { ABOUT, CHIME, CHOICES, Dim, Figure, MAIN, SLUG, plane, slide } from '../Composition';

export { SLUG };

// New recipe (~39 s): trap-first hook (22 sits across from the missing triangle), question, comment bait,
// the pair idea big (zoom on the stacked heights, P hops up and down with a live "bottom + top = 40" readout),
// reveal 40 − 22 = 18 + CTA pill. First and last frames show the same 10 × 8 figure at the same place.

// The figure: 10 x 8 rectangle at 76 px/unit = 760 x 608 px, x 160…920, y 560…1168.
const U = 76;
const OX = 160;
const OY = 1168;
const M = plane(OX, OY, U);
const before = () => -100;

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const nope = at(scene, 0, 0.84);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: C.violet, color: '#fff', borderRadius: 999, padding: '10px 40px', fontSize: 52, fontWeight: 900 }}>AMC 8 · Challenge #28</div>
      </div>
      <Text x={540} y={385} w={1000} size={96} weight={900} align="center">
        Think it's <span style={{ color: C.red }}>22</span>?
      </Text>
      <PushIn frames={scene.frames} origin="540px 860px">
        <Stage>
          <Figure m={M} {...MAIN} fills={{ left: 0.25 }} colors={{ left: C.amber }} labels={ABOUT} labelColors={{ left: C.amber }} size={76} />
        </Stage>
      </PushIn>
      <Sfx at={nope} src={SFX.buzz} volume={0.35} />
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 780, display: 'flex', justifyContent: 'center', opacity: ease(f, nope, 4) }}>
        <div style={{ transform: `rotate(-8deg) scale(${pop(f, nope)})`, border: `14px solid ${C.red}`, color: C.red, background: 'rgba(255,255,255,0.92)', borderRadius: 28, padding: '6px 54px', fontSize: 150, fontWeight: 900, letterSpacing: 6 }}>
          NOPE
        </div>
      </div>
    </>
  );
};

const QuestionBody: React.FC<{ start: (i: number) => number; pulse?: (i: number) => number }> = ({ start, pulse = () => 1 }) => {
  const f = useCurrentFrame();
  const m = plane(290, 1010, 50);
  return (
    <>
      <div style={{ position: 'absolute', left: 50, top: 290, width: 980, boxSizing: 'border-box', background: C.card, borderRadius: 32, padding: '26px 40px', fontSize: 54, fontWeight: 800, lineHeight: 1.35, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        A point in a rectangle joins all 4 corners. Triangles: <b style={{ color: C.violet }}>bottom 15</b>, <b style={{ color: C.blue }}>right 22</b>, <b style={{ color: C.violet }}>top 25</b>. <b style={{ color: C.amber }}>Left = ?</b>
      </div>
      <Stage>
        <Figure m={m} {...MAIN} fills={{ left: 0.25 }} colors={{ left: C.amber }} labels={ABOUT} labelColors={{ left: C.amber }} size={50} letters={0} />
      </Stage>
      <div style={{ position: 'absolute', left: 60, top: 1060, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 22 }}>
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
    <QuestionBody start={(i) => at(scene, 1, 0.75 + i * 0.05)} />
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

// ---------- the pair idea ----------

const Pairs: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const { w, h } = MAIN;
  const wOn = ease(f, at(scene, 0, 0.15), 10);
  const hOn = ease(f, at(scene, 0, 0.5), 10);
  const fullOn = ease(f, at(scene, 0, 0.75), 10);
  const zIn = at(scene, 0, 0.45);
  const zOut = at(scene, 1, 0.05);
  const zAmt = ease(f, zIn, 12) - ease(f, zOut, 12);
  const zoom = 1 + 0.3 * zAmt;
  const { y, vis } = slide(f, at(scene, 2, 0.45), at(scene, 3, 0.3));
  const p: [number, number] = [MAIN.p[0], y];
  const P = M(p);
  const bottom = Math.round(5 * y);
  const top = 40 - bottom;
  const half = ease(f, at(scene, 1, 0.5), 10);
  const lr = ease(f, at(scene, 3, 0.05), 12);
  const hopStarts = [0.04, 0.36, 0.72].map((t) => at(scene, 2, 0.45) + (at(scene, 3, 0.3) - at(scene, 2, 0.45)) * t);
  const sum = ease(f, at(scene, 2, 0.02), 8);
  return (
    <>
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      <Sfx at={zIn} src={SFX.whoosh} volume={0.25} />
      <Sfx at={zOut} src={SFX.whoosh} volume={0.22} />
      <Sfx at={at(scene, 0, 0.15)} src={SFX.click} volume={0.25} />
      <Sfx at={at(scene, 0, 0.75)} src={SFX.click} volume={0.25} />
      {hopStarts.map((s, i) => <Sfx key={i} at={s + 14} src={SFX.click} volume={0.3} />)}
      <Sfx at={at(scene, 3, 0.05)} src={SFX.click} volume={0.25} />
      {/* readout */}
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 300, textAlign: 'center', fontSize: 84, fontWeight: 900, whiteSpace: 'nowrap' }}>
        <div style={{ position: 'absolute', width: 1080, opacity: fadeTo(f, at(scene, 2, 0.02), 0, 8) }}>
          <span style={{ color: C.violet }}>bottom + top</span>
          <span style={{ opacity: half }}> = <span style={{ color: C.green }}>½</span> rect</span>
        </div>
        <div style={{ position: 'absolute', width: 1080, opacity: sum * fadeTo(f, at(scene, 3, 0.05), 0, 8) }}>
          <span style={{ color: C.violet, opacity: vis }}>{bottom} + {top}</span> = <span style={{ color: C.green }}>40</span>
        </div>
        <div style={{ position: 'absolute', width: 1080, opacity: lr }}>
          <span style={{ color: C.blue }}>22 + </span>
          <span style={{ color: C.amber }}>?</span> = <span style={{ color: C.green }}>40</span>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 410, display: 'flex', justifyContent: 'center', opacity: half * fadeTo(f, at(scene, 2, 0.02), 0, 8) }}>
        <div style={{ background: C.green, color: '#fff', borderRadius: 999, padding: '4px 34px', fontSize: 52, fontWeight: 900 }}>wherever P is</div>
      </div>
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: `${M(MAIN.p)[0]}px ${M(MAIN.p)[1]}px` }}>
        <Stage>
          <Figure
            m={M}
            w={w}
            h={h}
            p={p}
            fills={{ bottom: 0.32, top: 0.32, left: 0.32 * lr, right: 0.32 * lr }}
            colors={{ left: C.amber }}
            labels={{ bottom: String(bottom), top: String(top), right: '22', left: '?' }}
            labelOpacity={{ bottom: vis, top: vis, right: 0.35 + 0.65 * lr, left: 0.35 + 0.65 * lr }}
            labelColors={{ bottom: C.violet, top: C.violet, right: C.blue, left: C.amber }}
            size={72}
            letters={0}
          />
          <Dim a={[M([0, 0])[0], M([0, 0])[1] + 44]} b={[M([w, 0])[0], M([0, 0])[1] + 44]} color={C.violet} opacity={wOn * fadeTo(f, at(scene, 2), 0)} label="width" ly={0} size={48} />
          <Dim a={[M([0, h])[0], M([0, h])[1] - 44]} b={[M([w, h])[0], M([0, h])[1] - 44]} color={C.violet} opacity={wOn * (1 - zAmt) * fadeTo(f, at(scene, 2), 0)} label="width" ly={0} size={48} />
          <Dim a={P} b={M([p[0], 0])} color={C.amber} opacity={hOn * fadeTo(f, at(scene, 3), 0)} label="h₁" lx={-46} size={60} />
          <Dim a={P} b={M([p[0], h])} color={C.primary} opacity={hOn * fadeTo(f, at(scene, 3), 0)} label="h₂" lx={-46} size={60} />
          <Dim a={[OX - 50, M([0, 0])[1]]} b={[OX - 50, M([0, h])[1]]} color={C.ink} opacity={fullOn * fadeTo(f, at(scene, 2), 0)} label="h" lx={-30} size={60} />
        </Stage>
      </div>
    </>
  );
};

// ---------- reveal ----------

const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 0, 0.75);
  const chime = at(scene, 0, 0.98);
  const found = ease(f, hit, 8);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 290, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 26, whiteSpace: 'nowrap' }}>
        <span style={{ fontSize: 96, fontWeight: 900, ...fadeUp(f, 0, 8) }}>
          <span style={{ color: C.green }}>40</span> − <span style={{ color: C.blue }}>22</span> =
        </span>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '6px 44px', fontSize: 116, fontWeight: 900, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>18</div>
      </div>
      <Text x={540} y={450} w={1000} size={56} weight={900} color={C.red} align="center" style={fadeUp(f, at(scene, 1, 0.05))}>
        22 sits across, but isn't equal
      </Text>
      <Stage>
        <Figure
          m={M}
          {...MAIN}
          fills={{ bottom: 0.3, top: 0.3, right: 0.3, left: 0.25 + 0.1 * found }}
          colors={{ left: f >= hit ? C.green : C.amber }}
          labels={{ ...ABOUT, left: f >= hit ? '18' : '?' }}
          labelColors={{ bottom: C.violet, top: C.violet, right: C.blue, left: f >= hit ? C.green : C.amber }}
          size={76}
        />
      </Stage>
      <CtaPill start={at(scene, 2)} y={1215} />
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      <Sfx at={hit - 31} src={SFX.riser} volume={0.3} />
      <Sfx at={at(scene, 1)} src={SFX.buzz} volume={0.2} />
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={360} start={chime} seed={5} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, pairs: Pairs, reveal: Reveal };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" captions="words" music={MUSIC} /> : null;
