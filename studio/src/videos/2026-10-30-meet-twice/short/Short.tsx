import { Audio, Sequence, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Stage } from '../../../lib/grid';
import { CommentBubble, CtaPill, MUSIC, PushIn, SFX, Sfx, ShortFrame, choicePulse } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { ANN, BO, Brace, CHIME, CHOICES, D, Label, Leg, Meet, RoadLine, SLUG, VA, VB, Walker, X, bounce, legs, walkT, type Road } from '../Composition';

export { SLUG };

// Trap-first AMC 8 short: the two walks laid out as road-length bars (1 road at the first meeting, 3 at the second,
// with a zoom on the three bars), then Ann's 3 × 12 = 36 = road + (road − 10). Frame 0 and the last frame show the same road.

const R: Road = { x0: 150, x1: 900, y: 720, d: D };
const BAR = (i: number) => 870 + i * 105;
const before = () => -100;

/** Road with the two meeting spots from the question (hook, question, reveal: the loop figure). */
const QFigure: React.FC<{ mark?: number; mark2?: number }> = ({ mark = 1, mark2 = mark }) => (
  <Stage>
    <RoadLine r={R} />
    <Brace r={R} a={0} b={12} y={R.y + 62} up color={C.primary} label="12 km" size={50} opacity={mark} />
    <circle cx={X(R, 12)} cy={R.y} r={16} fill={C.primary} opacity={mark} />
    <Brace r={R} a={0} b={10} y={R.y + 170} up color={C.blue} label="10 km" size={50} opacity={mark2} />
    <circle cx={X(R, 10)} cy={R.y} r={16} fill={C.blue} opacity={mark2} />
  </Stage>
);

/** Road-length bar, split into pieces [km from, km to, color, label], aligned with the road above. */
const Bar: React.FC<{ y: number; pieces: [number, number, string, string][]; p: number }> = ({ y, pieces, p }) => {
  if (p <= 0) return null;
  return (
    <g opacity={Math.min(1, p * 1.5)}>
      {pieces.map(([a, b, color, label], i) => {
        const xa = X(R, a);
        const w = X(R, b) - xa;
        return (
          <g key={i}>
            <rect x={xa + 3} y={y} width={Math.max(0, w * p - 6)} height={86} rx={18} fill={color} fillOpacity={0.22} stroke={color} strokeWidth={5} />
            <Label x={xa + w / 2} y={y + 45} text={label} color={color} size={48} opacity={ease(p, 0.7, 0.3)} />
          </g>
        );
      })}
    </g>
  );
};

/** Numbered disc left of a bar. */
const Num: React.FC<{ i: number; p: number; y: number }> = ({ i, p, y }) =>
  p <= 0 ? null : (
    <g opacity={p} transform={`translate(80 ${y + 43}) scale(${0.6 + 0.4 * p})`}>
      <circle r={36} fill={C.primary} />
      <text y={3} fill="#fff" fontFamily="Nunito, sans-serif" fontWeight={900} fontSize={48} textAnchor="middle" dominantBaseline="middle">{i}</text>
    </g>
  );

/** Big readout chip at the top of the aha scene. */
const Readout: React.FC<{ tex: string; o: number; color?: string }> = ({ tex, o, color = C.primary }) =>
  o <= 0 ? null : (
    <div style={{ position: 'absolute', left: 0, width: 1080, top: 300, display: 'flex', justifyContent: 'center', opacity: o }}>
      <div style={{ background: C.card, border: `5px solid ${color}`, borderRadius: 26, padding: '8px 36px', boxShadow: '0 6px 18px rgba(30,40,80,0.08)' }}>
        <Tex tex={tex} size={72} />
      </div>
    </div>
  );

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const nope = at(scene, 0, 0.84);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: C.violet, color: '#fff', borderRadius: 999, padding: '10px 40px', fontSize: 52, fontWeight: 900 }}>AMC 8 · Challenge #17</div>
      </div>
      <Text x={540} y={385} w={1000} size={96} weight={900} align="center">
        Think it's <span style={{ color: C.red }}>22</span>?
      </Text>
      <PushIn frames={scene.frames} origin="525px 800px">
        <QFigure />
      </PushIn>
      <Sfx at={nope} src={SFX.buzz} volume={0.35} />
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 660, display: 'flex', justifyContent: 'center', opacity: ease(f, nope, 4) }}>
        <div style={{ transform: `rotate(-8deg) scale(${pop(f, nope)})`, border: `14px solid ${C.red}`, color: C.red, background: 'rgba(255,255,255,0.92)', borderRadius: 28, padding: '6px 54px', fontSize: 150, fontWeight: 900, letterSpacing: 6 }}>
          NOPE
        </div>
      </div>
    </>
  );
};

const QuestionBody: React.FC<{ start: (i: number) => number; mark: number; mark2: number; pulse?: (i: number) => number }> = ({ start, mark, mark2, pulse = () => 1 }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 50, top: 270, width: 980, boxSizing: 'border-box', background: C.card, borderRadius: 32, padding: '24px 40px', fontSize: 54, fontWeight: 800, lineHeight: 1.33, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        <span style={{ color: ANN }}>Ann</span> and <span style={{ color: BO }}>Bo</span> meet <b style={{ color: C.primary }}>12 km</b> from A, turn back at the far towns, and meet again <b style={{ color: C.blue }}>10 km</b> from A. How far apart are A and B?
      </div>
      <QFigure mark={mark} mark2={mark2} />
      <div style={{ position: 'absolute', left: 60, top: 1000, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 22 }}>
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
  return (
    <>
      <QuestionBody start={(i) => at(scene, 1, 0.65 + i * 0.05)} mark={ease(f, at(scene, 0, 0.35), 10)} mark2={ease(f, at(scene, 1, 0.3), 10)} />
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
    </>
  );
};

const Think: SceneComponent = () => {
  const f = useCurrentFrame();
  return (
    <>
      <QuestionBody start={before} mark={1} mark2={1} pulse={(i) => choicePulse(f, i)} />
      <CommentBubble />
    </>
  );
};

/** The aha: count the road lengths walked together (1, then 3), zoom on the three bars, then Ann's 36 split into two pieces. */
const Three: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  // L0: walk to the first meeting
  const t = f < at(scene, 1) ? walkT(f, at(scene, 0, 0.08), at(scene, 0, 0.5), 0, 1) : walkT(f, at(scene, 1, 0.0), at(scene, 1, 0.62), 1, 3);
  const bar0 = ease(f, at(scene, 0, 0.55), 14) * fadeTo(f, at(scene, 1, 0.02), 0, 8);
  const tb = [at(scene, 1, 0.2), at(scene, 1, 0.4), at(scene, 1, 0.6)];
  const bars = tb.map((s) => ease(f, s, 14) * fadeTo(f, at(scene, 3, 0.0), 0, 8));
  const zIn = at(scene, 1, 0.78);
  const zOut = at(scene, 2, 0.08);
  const zoom = 1 + 0.25 * (ease(f, zIn, 12) - ease(f, zOut, 10));
  const walkers = fadeTo(f, at(scene, 3, 0.0), 0, 8);
  // L3: Ann's walk in two pieces
  const a1 = ease(f, at(scene, 3, 0.05), 14);
  const a2 = ease(f, at(scene, 3, 0.45), 14);
  const nRoads = tb.filter((s) => f >= s).length;

  // readouts
  const L2 = at(scene, 2);
  const r0 = ease(f, at(scene, 0, 0.55), 8) * (f < tb[0] ? 1 : 0);
  const r1 = (f >= tb[0] ? 1 : 0) * fadeTo(f, L2, 0, 6);
  const r2 = ease(f, L2 + 4, 6) * fadeTo(f, at(scene, 3, 0.55), 0, 6);
  const r3 = ease(f, at(scene, 3, 0.55), 6);
  const sixT = at(scene, 2, 0.78);

  return (
    <>
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      <Sfx at={at(scene, 0, 0.55)} src={SFX.click} volume={0.28} />
      {tb.map((s, i) => <Sfx key={i} at={s} src={SFX.click} volume={0.28} />)}
      <Sfx at={zIn} src={SFX.whoosh} volume={0.25} />
      <Sfx at={zOut} src={SFX.whoosh} volume={0.22} />
      <Sfx at={at(scene, 2, 0.3)} src={SFX.click} volume={0.25} />
      <Sfx at={sixT} src={SFX.click} volume={0.3} />
      <Sfx at={at(scene, 3, 0.05)} src={SFX.click} volume={0.25} />
      <Sfx at={at(scene, 3, 0.45)} src={SFX.click} volume={0.25} />

      <Readout o={r0} tex={'\\text{together: } 1 \\text{ road}'} />
      <Readout o={r1} tex={`\\text{together: } ${Math.max(1, nRoads)} \\text{ road${nRoads > 1 ? 's' : ''}}`} />
      <Readout o={r2} color={ANN} tex={f >= sixT ? '\\textcolor{#7b61ff}{\\text{Ann}}: 3 \\times 12 = 36' : '\\textcolor{#7b61ff}{\\text{Ann}}: 3 \\times 12'} />
      <Readout o={r3} color={ANN} tex={'\\text{road} + (\\text{road} - 10) = 36'} />

      <div style={{ position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: '520px 1030px' }}>
        <Stage>
          <RoadLine r={R} />
          <g opacity={walkers}>
            {legs(0, VA, D, t).map(([a, b], i) => <Leg key={`a${i}`} r={R} a={a} b={b} y={R.y - (i === 0 ? 50 : 86)} color={ANN} />)}
            {legs(D, VB, D, t).map(([a, b], i) => <Leg key={`b${i}`} r={R} a={a} b={b} y={R.y + (i === 0 ? 50 : 86)} color={BO} />)}
            <Meet r={R} km={12} n="1st" opacity={t >= 1 && t < 1.25 ? 1 : 0} />
            <Meet r={R} km={10} n="2nd" opacity={t >= 3 ? 1 : 0} />
            <Walker r={R} km={bounce(0, VA, D, t)} who="Ann" tag={false} />
            <Walker r={R} km={bounce(D, VB, D, t)} who="Bo" tag={false} />
          </g>
          <Bar y={BAR(0)} p={bar0} pieces={[[0, 12, ANN, 'Ann: 12'], [12, D, BO, 'Bo']]} />
          <Num i={1} y={BAR(0)} p={bar0} />
          <Bar y={BAR(0)} p={bars[0]} pieces={[[0, D, ANN, 'Ann: A → B']]} />
          <Bar y={BAR(1)} p={bars[1]} pieces={[[0, D, BO, 'Bo: B → A']]} />
          <Bar y={BAR(2)} p={bars[2]} pieces={[[0, 10, BO, 'Bo back'], [10, D, ANN, 'Ann back']]} />
          {bars.map((p, i) => <Num key={i} i={i + 1} y={BAR(i)} p={p * (1 - (zoom - 1) / 0.25)} />)}
          {/* Ann's 36 = the whole road + the road minus 10 */}
          <Leg r={R} a={0} b={D} y={R.y - 60} color={ANN} p={a1} />
          <Leg r={R} a={D} b={10} y={R.y - 110} color={ANN} p={a2} />
          <Meet r={R} km={10} n="" opacity={a2} color={C.blue} />
          <Bar y={BAR(0)} p={a1} pieces={[[0, D, ANN, 'whole road']]} />
          <Bar y={BAR(1)} p={a2} pieces={[[10, D, ANN, 'road − 10']]} />
        </Stage>
      </div>
    </>
  );
};

const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 0, 0.74);
  const chime = at(scene, 0, 0.97);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 290, display: 'flex', justifyContent: 'center', ...fadeUp(f, 2) }}>
        <Tex tex={'2 \\times \\text{road} = 46'} size={80} color={ANN} />
      </div>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 420, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '10px 44px', display: 'flex', alignItems: 'center', gap: 22, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <span style={{ fontSize: 64, fontWeight: 900 }}>road =</span>
          <Tex tex="23" size={110} color="#fff" />
          <span style={{ fontSize: 64, fontWeight: 900 }}>km</span>
        </div>
      </div>
      <QFigure />
      <Text x={490} y={1010} w={860} size={58} weight={900} color={C.red} align="center" style={fadeUp(f, at(scene, 1, 0.05))}>
        22 just adds 12 + 10
      </Text>
      <CtaPill start={at(scene, 2)} y={1150} />
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      <Sfx at={hit - 31} src={SFX.riser} volume={0.3} />
      <Sfx at={at(scene, 1)} src={SFX.buzz} volume={0.2} />
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={500} start={chime} seed={5} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, three: Three, reveal: Reveal };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" captions="words" music={MUSIC} /> : null;
