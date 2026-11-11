import { Audio, Sequence, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { CommentBubble, CtaPill, MUSIC, PushIn, SFX, Sfx, ShortFrame, choicePulse } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { CH, CHIME, SLUG, SpotTag, Tile } from '../Composition';

export { SLUG };

// Trap-first AMC 10 short: hook "Think it's 2070?" (choice B, forgot that 1 is a square), the aha = the long video's
// "add back the squares" picture (cross the squares out, the list packs up; put them back, each one shoves the rest
// one spot), then 45 squares up to 45^2 = 2025 and the reveal 2026 + 45 = 2071. Frame 0 and the last frame show the
// same 1…10 row (squares struck, survivors green with their spot tags).

const SPOT = C.violet;
const SQC = C.red;
const OKC = C.primary;
const NEVER = 1e7;
const before = () => -100;

// The 1…10 list as two rows of five big tiles (slots 1–5 on top, 6–10 below), kept left of the right-hand UI below y 900.
const ROWS = [640, 880];
const TILE = 118;
const VALS = Array.from({ length: 10 }, (_, i) => i + 1);
const SQS = [1, 4, 9];
const isSq = (v: number) => SQS.includes(v);
const spotOf = (v: number) => v - Math.floor(Math.sqrt(v));
const slotXY = (k: number) => ({ x: 130 + ((k - 1) % 5) * 180, y: ROWS[Math.floor((k - 1) / 5)] });
/** Position of a (fractional) slot. Between slots 5 and 6 a tile slides off the end of row 1 and in at the start of row 2. */
const place = (s: number) => {
  const k = Math.floor(s + 1e-6);
  const t = s - k;
  if (t < 1e-6 || k >= 10) return { ...slotXY(Math.min(k, 10)), o: 1 };
  if (k === 5) return t < 0.5 ? { x: 850 + 360 * t, y: ROWS[0], o: 1 - 2 * t } : { x: -50 + 360 * (t - 0.5), y: ROWS[1], o: 2 * t - 1 };
  const a = slotXY(k);
  return { x: a.x + 180 * t, y: a.y, o: 1 };
};

type RowProps = {
  appear?: (v: number) => number; red?: number; strike?: number; green?: (v: number) => number; tag?: (v: number) => number;
  slotOf?: (v: number) => number; vis?: (v: number) => number; dy?: (v: number) => number; rings?: [number, number, string][];
};

/** The 1…10 list: squares 1, 4, 9 red and struck, survivors green with their purple spot tag (1…7) underneath. */
const Row: React.FC<RowProps> = ({ appear = before, red = -100, strike = -100, green = before, tag = before, slotOf = (v) => v, vis, dy, rings = [] }) => {
  const f = useCurrentFrame();
  return (
    <>
      {VALS.map((v) => {
        const p = place(slotOf(v));
        return (
          <Tile
            key={v} x={p.x} y={p.y} w={TILE} h={TILE} fs={72} label={v} appear={appear(v)}
            red={isSq(v) ? red : NEVER} strike={isSq(v) ? strike : NEVER} green={isSq(v) ? NEVER : green(v)}
            vis={(vis ? vis(v) : 1) * p.o} dy={dy ? dy(v) : 0}
          />
        );
      })}
      {VALS.filter((v) => !isSq(v)).map((v) => {
        const p = place(slotOf(v));
        return <SpotTag key={v} x={p.x} y={p.y + 115} d={84} n={spotOf(v)} start={tag(v)} opacity={p.o} />;
      })}
      {rings.map(([v, start, color], i) => {
        const o = ease(f, start, 6);
        if (o <= 0) return null;
        const p = place(slotOf(v));
        return <div key={i} style={{ position: 'absolute', left: p.x - 72, top: p.y - 72, width: 144, height: 144, borderRadius: 28, border: `9px solid ${color}`, boxSizing: 'border-box', opacity: o }} />;
      })}
    </>
  );
};

/** Opens on the finished row (the same row the video ends on, so the loop cuts cleanly), then stamps the trap. */
const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const nope = at(scene, 0, 0.84);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: C.violet, color: '#fff', borderRadius: 999, padding: '10px 40px', fontSize: 52, fontWeight: 900 }}>AMC 10 · Challenge #17</div>
      </div>
      <Text x={540} y={385} w={1000} size={96} weight={900} align="center">
        Think it's <span style={{ color: C.red }}>2070</span>?
      </Text>
      <PushIn frames={scene.frames} origin="490px 800px">
        <Row />
      </PushIn>
      <Sfx at={nope} src={SFX.buzz} volume={0.35} />
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 680, display: 'flex', justifyContent: 'center', opacity: ease(f, nope, 4) }}>
        <div style={{ transform: `rotate(-8deg) scale(${pop(f, nope)})`, border: `16px solid ${C.red}`, color: C.red, background: 'rgba(255,255,255,0.92)', borderRadius: 32, padding: '6px 64px', fontSize: 180, fontWeight: 900, letterSpacing: 6 }}>
          NOPE
        </div>
      </div>
    </>
  );
};

const QuestionBody: React.FC<{ start: (i: number) => number; pulse?: (i: number) => number; row?: RowProps }> = ({ start, pulse = () => 1, row }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 50, top: 290, width: 980, boxSizing: 'border-box', background: C.card, borderRadius: 32, padding: '26px 40px', fontSize: 54, fontWeight: 800, lineHeight: 1.35, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        List the whole numbers that are <b style={{ color: SQC }}>not perfect squares</b>: 2, 3, 5, 6, 7, 8, 10, … What is the <b style={{ color: SPOT }}>2026th</b> number?
      </div>
      <Row {...row} />
      <div style={{ position: 'absolute', left: 60, top: 1068, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 22 }}>
        {CH.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 8), background: C.card, borderRadius: 22, padding: '12px 30px', boxShadow: '0 4px 14px rgba(30,40,80,0.08)', display: 'flex', alignItems: 'center', gap: 14, scale: String(pulse(i)) }}>
            <span style={{ color: C.muted, fontSize: 44, fontWeight: 900 }}>{'ABCDE'[i]}</span>
            <Tex tex={c} size={68} />
          </div>
        ))}
      </div>
    </>
  );
};

const survivorIndex = (v: number) => spotOf(v) - 1; // 0…6 in list order

const Question: SceneComponent = ({ scene }) => {
  const listed = (v: number) => at(scene, 0, 0.45 + survivorIndex(v) * 0.075);
  return (
    <>
      <QuestionBody
        start={(i) => at(scene, 1, 0.5 + i * 0.08)}
        row={{ appear: (v) => 2 + v * 2, red: at(scene, 0, 0.2), strike: at(scene, 0, 0.32), green: listed, tag: listed }}
      />
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      {[2, 5, 8].map((v) => <Sfx key={v} at={listed(v)} src={SFX.click} volume={0.22} />)}
    </>
  );
};

/** Comment bait instead of a countdown: the question stays, a bubble pops, the choices pulse one by one. */
const Think: SceneComponent = () => {
  const f = useCurrentFrame();
  return (
    <>
      <QuestionBody start={before} pulse={(i) => choicePulse(f, i)} />
      <CommentBubble />
    </>
  );
};

/** The aha: cross the squares out and the list packs up; put them back and each one shoves the rest one spot. */
const Push: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const out = at(scene, 0, 0.08);
  const ins = [at(scene, 0, 0.45), at(scene, 0, 0.62), at(scene, 0, 0.79)];
  const L1 = at(scene, 1);
  const L2 = at(scene, 2);
  const present = (s: number) => Math.max(0, Math.min(1, 1 - ease(f, out, 14) + ease(f, ins[SQS.indexOf(s)], 10)));
  const slotOf = (v: number) => (isSq(v) ? v : spotOf(v) + SQS.filter((s) => s < v).reduce((a, s) => a + present(s), 0));
  const vis = (v: number) => (isSq(v) ? present(v) : 1);
  const dy = (v: number) => (isSq(v) ? -90 * (1 - present(v)) : 0);
  // zoom onto "10 in spot 7", then back out to count the squares before it
  const zin = L1 + 2;
  const zout = at(scene, 1, 0.45);
  const zoom = 1 + 0.3 * ease(f, zin, 12) - 0.3 * ease(f, zout, 12);
  const flash = [at(scene, 1, 0.62), at(scene, 1, 0.7), at(scene, 1, 0.78)];
  const rings: [number, number, string][] = f >= L1 && f < L2 ? [[10, L1, C.amber], ...SQS.map((s, i): [number, number, string] => [s, flash[i], SQC])] : [];
  const sq3 = SQS.filter((_, i) => f >= flash[i]).length;
  return (
    <>
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      {ins.map((t, i) => <Sfx key={i} at={t} src={SFX.click} volume={0.28} />)}
      <Sfx at={zin} src={SFX.whoosh} volume={0.25} />
      <Sfx at={zout} src={SFX.whoosh} volume={0.25} />
      {flash.map((t, i) => <Sfx key={`f${i}`} at={t} src={SFX.click} volume={0.25} />)}
      <Sfx at={L2} src={SFX.whoosh} volume={0.25} />

      <Text x={540} y={300} w={1000} size={76} weight={900} align="center" style={{ opacity: ease(f, 0, 8) * fadeTo(f, L1, 0, 8) }}>
        each <span style={{ color: SQC }}>square</span> pushes the rest <span style={{ color: SPOT }}>one spot</span>
      </Text>
      <Text x={540} y={300} w={1000} size={76} weight={900} align="center" style={{ ...fadeUp(f, L1 + 6) }}>
        number = <span style={{ color: SPOT }}>spot</span> + <span style={{ color: SQC }}>squares before it</span>
      </Text>

      <div style={{ position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: '850px 930px' }}>
        <Row slotOf={slotOf} vis={vis} dy={dy} rings={rings} />
      </div>

      {/* L1 readout: 10 = spot 7 + 3 squares */}
      <div style={{ position: 'absolute', left: 60, width: 860, top: 1100, display: 'flex', justifyContent: 'center', gap: 18, fontSize: 72, fontWeight: 900, whiteSpace: 'nowrap', opacity: fadeTo(f, L2, 0, 8) }}>
        <span style={fadeUp(f, at(scene, 1, 0.08))}>10 =</span>
        <span style={{ ...fadeUp(f, at(scene, 1, 0.3)), color: SPOT }}>spot 7</span>
        <span style={{ ...fadeUp(f, at(scene, 1, 0.62)), color: SQC }}>+ {Math.max(1, sq3)} square{sq3 > 1 ? 's' : ''}</span>
      </div>

      {/* L2: how many squares come first */}
      <div style={{ position: 'absolute', left: 60, width: 860, top: 1080, display: 'flex', justifyContent: 'center', ...fadeUp(f, at(scene, 2, 0.05)) }}>
        <Tex tex={'45^2=2025\\le{\\color{#7b61ff}2026}'} size={72} />
      </div>
      <div style={{ position: 'absolute', left: 60, width: 860, top: 1190, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 28 }}>
        <div style={fadeUp(f, at(scene, 2, 0.5))}><Tex tex={'1^2,\\;2^2,\\;\\ldots,\\;45^2'} size={60} color={SQC} /></div>
        <div style={{ transform: `scale(${pop(f, at(scene, 2, 0.7))})`, background: SQC, color: '#fff', borderRadius: 24, padding: '6px 34px', fontSize: 60, fontWeight: 900, whiteSpace: 'nowrap' }}>45 squares</div>
      </div>
      <Sfx at={at(scene, 2, 0.7)} src={SFX.click} volume={0.3} />
    </>
  );
};

/** The answer, the trap, then the CTA pill over the same row as frame 0 (no separate end card). */
const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 0, 0.66);
  const chime = at(scene, 0, 0.97);
  const L1 = at(scene, 1);
  const L2 = at(scene, 2);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '14px 48px', display: 'flex', alignItems: 'center', gap: 24, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <span style={{ fontSize: 70, fontWeight: 900 }}>C</span>
          <Tex tex="2071" size={116} color="#fff" />
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 455, display: 'flex', justifyContent: 'center', gap: 14, alignItems: 'center' }}>
        <div style={fadeUp(f, at(scene, 0, 0.05))}><Tex tex={'{\\color{#7b61ff}2026}+45='} size={76} /></div>
        <div style={{ opacity: ease(f, hit, 6) }}><Tex tex="2071" size={76} color={C.green} /></div>
      </div>
      <Row rings={f >= L1 && f < L2 ? [[1, L1 + 4, SQC]] : []} />
      <div style={{ position: 'absolute', left: 60, width: 860, top: 1070, display: 'flex', justifyContent: 'center', ...fadeUp(f, at(scene, 1, 0.05)) }}>
        <Tex tex={'2026+44=2070'} size={64} color={SQC} />
      </div>
      <Text x={490} y={1150} w={860} size={56} weight={900} color={SQC} align="center" style={fadeUp(f, at(scene, 1, 0.35))}>
        forgot that 1 is a square
      </Text>
      <CtaPill start={L2} y={1225} />
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      <Sfx at={hit - 31} src={SFX.riser} volume={0.3} />
      <Sfx at={L1} src={SFX.buzz} volume={0.2} />
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={360} start={chime} seed={5} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, push: Push, reveal: Reveal };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 10-style" captions="words" music={MUSIC} /> : null;
