import { Audio, Sequence, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop, range } from '../../../lib/anim';
import { at, type Scene, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Stage } from '../../../lib/grid';
import { CommentBubble, CtaPill, MUSIC, PushIn, SFX, Sfx, ShortFrame, choicePulse } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { ZH_FONT } from '../../../lib/fonts';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { CHIME, CHOICES, GREY, Jump, SLUG, T, mapper } from '../Composition';

export { SLUG };

// Chinese sibling of 2026-10-30-midpoint-chase/short (same layout and timing logic). Trap-first hook (42.5 = P9, one step early), question, comment bait, the jump chase with two
// magnifier zooms (0–64 → 40–45 → 42–43) and a jump readout, then the reveal on the same 42–43 line the hook opens on.

const Y = 800; // the number line
const MW = mapper(0, 64, 90, 990); // wide view
const MA = mapper(40, 45, 90, 990); // zoom 1
const MB = mapper(42, 43, 140, 940); // zoom 2 (hook + reveal)
const never = 99999;

/** Frame (scene-relative) where `phrase` starts (or ends) in line i's spoken text, by character position. */
const cue = (s: Scene, i: number, phrase: string, after = false) => {
  const l = s.lines[i];
  const t = l.text.toLowerCase();
  const k = t.indexOf(phrase.toLowerCase());
  if (k < 0) throw new Error(`cue: "${phrase}" not in ${s.id} line ${i}`);
  return l.from + Math.round(l.frames * Math.min(0.97, (k + (after ? phrase.length : 0)) / t.length));
};

/** A number line with ticks every `step` (bigger every `major`) and labels at `labels`. */
const Axis: React.FC<{ m: (v: number) => number; lo: number; hi: number; step: number; major: number; labels: number[]; op?: number }> = ({ m, lo, hi, step, major, labels, op = 1 }) => {
  if (op <= 0.01) return null;
  const n = Math.round((hi - lo) / step);
  return (
    <g opacity={op}>
      <line x1={m(lo) - 30} y1={Y} x2={m(hi) + 30} y2={Y} stroke={C.ink} strokeWidth={7} strokeLinecap="round" />
      {range(n + 1).map((k) => {
        const v = lo + k * step;
        const big = Math.abs(v / major - Math.round(v / major)) < 1e-6;
        return <line key={k} x1={m(v)} y1={Y - (big ? 20 : 11)} x2={m(v)} y2={Y + (big ? 20 : 11)} stroke={C.ink} strokeWidth={big ? 5 : 3} />;
      })}
      {labels.map((v) => (
        <T key={v} x={m(v)} y={Y + 78} tex={String(v)} size={58} color={C.muted} w={200} />
      ))}
    </g>
  );
};

/** A point: dot, P_n above, optional value below. `ring` = a coloured halo (trap / answer). */
const Pt: React.FC<{ x: number; n: number; color?: string; op?: number; val?: string; ring?: string; s?: number; lx?: number }> = ({ x, n, color = C.primary, op = 1, val, ring, s = 1, lx = 0 }) =>
  op <= 0.01 ? null : (
    <g opacity={op} transform={`translate(${x} ${Y}) scale(${s}) translate(${-x} ${-Y})`}>
      {ring && <circle cx={x} cy={Y} r={36} fill="none" stroke={ring} strokeWidth={8} />}
      <circle cx={x} cy={Y} r={20} fill={color} stroke="#fff" strokeWidth={5} />
      <T x={x + lx} y={Y - 84} tex={`P_{${n}}`} size={60} color={color} w={200} />
      {val && <T x={x} y={Y + 84} tex={val} size={62} color={color} w={260} />}
    </g>
  );

/** The 42…43 close-up the short opens and ends on (the loop match). */
const CloseUp: React.FC<{ nineRing?: string; nineVal?: boolean; children?: React.ReactNode }> = ({ nineRing, nineVal = true, children }) => (
  <>
    <Axis m={MB} lo={42} hi={43} step={0.25} major={1} labels={[42, 43]} />
    <Pt x={MB(42)} n={7} color={GREY} />
    <Pt x={MB(43)} n={8} color={GREY} />
    {children}
    <Pt x={MB(42.5)} n={9} color={nineRing ? C.red : GREY} ring={nineRing} val={nineVal ? '42.5' : undefined} lx={-62} />
  </>
);

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const nope = cue(scene, 0, '错');
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: C.violet, color: '#fff', borderRadius: 999, padding: '10px 40px', fontSize: 52, fontWeight: 900 }}>AMC 8 · 挑战 #1</div>
      </div>
      <Text x={540} y={385} w={1000} size={96} weight={900} align="center">
        你觉得是 <span style={{ color: C.red }}>42.5</span>？
      </Text>
      <PushIn frames={scene.frames} origin={`540px ${Y}px`}>
        <Stage>
          <CloseUp nineRing={C.red} />
        </Stage>
      </PushIn>
      <Sfx at={nope} src={SFX.buzz} volume={0.35} />
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 700, display: 'flex', justifyContent: 'center', opacity: ease(f, nope, 4) }}>
        <div style={{ transform: `rotate(-8deg) scale(${pop(f, nope)})`, border: `14px solid ${C.red}`, color: C.red, background: 'rgba(255,255,255,0.92)', borderRadius: 28, padding: '6px 54px', fontSize: 150, fontWeight: 900, letterSpacing: 6 }}>
          错！
        </div>
      </div>
    </>
  );
};

const QuestionBody: React.FC<{ start: (i: number) => number; pulse?: (i: number) => number }> = ({ start, pulse = () => 1 }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 50, top: 290, width: 980, boxSizing: 'border-box', background: C.card, borderRadius: 32, padding: '24px 40px', fontSize: 54, fontWeight: 800, lineHeight: 1.35, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        <b style={{ color: C.primary }}>
          <Tex tex="P_1 = 0" size={58} />
        </b>
        ，
        <b style={{ color: C.primary }}>
          <Tex tex="P_2 = 64" size={58} />
        </b>
        。每个新点都是前两个点的<b style={{ color: C.violet }}>中点</b>。<Tex tex="P_{10}" size={58} /> 在哪里？
      </div>
      <Stage>
        <Axis m={MW} lo={0} hi={64} step={8} major={16} labels={[0, 16, 32, 48, 64]} />
        <Pt x={MW(0)} n={1} color={GREY} />
        <Pt x={MW(64)} n={2} color={GREY} />
      </Stage>
      <div style={{ position: 'absolute', left: 60, top: 990, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 22 }}>
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
    <QuestionBody start={(i) => at(scene, 1, 0.7 + i * 0.05)} />
    <Sfx at={0} src={SFX.whoosh} volume={0.3} />
  </>
);

const Think: SceneComponent = () => {
  const f = useCurrentFrame();
  return (
    <>
      <QuestionBody start={() => -100} pulse={(i) => choicePulse(f, i)} />
      <CommentBubble text="评论你的选项！" />
    </>
  );
};

/** The readout chip under the line: the jump (or point) just made. */
const Readout: React.FC<{ items: { at: number; tex: string; color: string }[]; out?: number }> = ({ items, out = never }) => {
  const f = useCurrentFrame();
  const cur = [...items].reverse().find((it) => f >= it.at);
  if (!cur) return null;
  const o = ease(f, items[0].at, 6) * fadeTo(f, out, 0, 8);
  return (
    <div style={{ position: 'absolute', left: 60, width: 860, top: 1090, display: 'flex', justifyContent: 'center', opacity: o }}>
      <div style={{ background: C.card, border: `6px solid ${cur.color}`, borderRadius: 28, padding: '10px 44px', transform: `scale(${pop(f, cur.at) * 0.15 + 0.85})`, boxShadow: '0 8px 24px rgba(30,40,80,0.08)' }}>
        <Tex tex={cur.tex} size={76} color={cur.color} />
      </div>
    </div>
  );
};

const Jumps: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const D = 16; // frames to draw one arc
  // L0: 64 right, 32 left, 16 right (wide view)
  const j1 = cue(scene, 0, '右64');
  const j2 = cue(scene, 0, '左32');
  const j3 = cue(scene, 0, '右16');
  // L1: halve and flip, with a push onto the last three arcs
  const l1 = at(scene, 1);
  const push = ease(f, l1 + 4, 14) - ease(f, at(scene, 2) - 6, 12);
  // L2: 8 left (wide), zoom to 40–45, then 4 right, 2 left, 1 right
  const j4 = cue(scene, 2, '左8');
  const z1 = j4 + 22;
  const zA = ease(f, z1, 20);
  const j5 = Math.max(z1 + 22, cue(scene, 2, '右4'));
  const j6 = Math.max(j5 + 16, cue(scene, 2, '左2'));
  const j7 = Math.max(j6 + 16, cue(scene, 2, '右1'));
  // L3: zoom to 42–43, then half of 1 back left: P9 = 42.5
  const z2 = at(scene, 3) - 6;
  const zB = ease(f, z2, 20);
  const j8 = at(scene, 3, 0.18);
  const p9 = cue(scene, 3, '42.5');
  const p = (t: number) => ease(f, t, D);
  const dot = (t: number) => ease(f, t + D - 4, 6);
  const grey = (t: number) => (f >= t ? GREY : C.primary);
  // magnifier brackets
  const br1 = ease(f, z1 - 14, 8) * (1 - ease(zA, 0.8, 0.2));
  const b1x0 = MW(40) - 16 + (70 - MW(40) + 16) * zA;
  const b1x1 = MW(45) + 16 + (1010 - MW(45) - 16) * zA;
  const br2 = ease(f, z2 - 14, 8) * (1 - ease(zB, 0.8, 0.2));
  const b2x0 = MA(42) - 16 + (120 - MA(42) + 16) * zB;
  const b2x1 = MA(43) + 16 + (960 - MA(43) - 16) * zB;
  const G = C.primary;
  const V = C.violet;
  return (
    <>
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      {[j1, j2, j3, j4, j5, j6, j7, j8].map((t, i) => <Sfx key={i} at={t} src={SFX.click} volume={0.24} />)}
      <Sfx at={l1 + 2} src={SFX.whoosh} volume={0.22} />
      <Sfx at={z1} src={SFX.whoosh} volume={0.28} />
      <Sfx at={z2} src={SFX.whoosh} volume={0.28} />
      <Text x={540} y={300} w={1000} size={84} weight={900} color={C.primary} align="center" style={{ opacity: fadeTo(f, l1, 0, 8) }}>
        看看怎么跳
      </Text>
      <Text x={540} y={300} w={1000} size={84} weight={900} color={C.violet} align="center" style={fadeUp(f, l1 + 2)}>
        减半，再反向！
      </Text>
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${1 + 0.2 * push})`, transformOrigin: `${MW(48)}px ${Y}px` }}>
        <Stage>
          {/* wide view 0–64 */}
          <g opacity={1 - zA}>
            <Axis m={MW} lo={0} hi={64} step={8} major={16} labels={[0, 16, 32, 48, 64]} />
            <Jump a={MW(0)} b={MW(64)} y={Y} p={p(j1)} lab="64" labSize={64} hMax={200} op={f >= j4 ? 0.3 : 1} />
            <Jump a={MW(64)} b={MW(32)} y={Y} p={p(j2)} lab="32" labSize={64} hMax={150} />
            <Jump a={MW(32)} b={MW(48)} y={Y} p={p(j3)} lab="16" labSize={64} hMax={110} />
            <Jump a={MW(48)} b={MW(40)} y={Y} p={p(j4)} lab="8" labSize={64} hMax={70} labDy={120} />
            <Pt x={MW(0)} n={1} color={GREY} />
            <Pt x={MW(64)} n={2} color={GREY} />
            <Pt x={MW(32)} n={3} color={grey(j3)} op={dot(j2)} />
            <Pt x={MW(48)} n={4} color={grey(j4)} op={dot(j3)} />
            <Pt x={MW(40)} n={5} op={dot(j4)} />
          </g>
          <rect x={b1x0} y={Y - 160} width={b1x1 - b1x0} height={330} rx={22} fill="none" stroke={C.amber} strokeWidth={8} strokeDasharray="18 12" opacity={br1} />
          {/* zoom 1: 40–45 */}
          <g opacity={zA * (1 - zB)}>
            <Axis m={MA} lo={40} hi={45} step={0.25} major={1} labels={[41, 42, 43, 44, 45]} />
            <Jump a={MA(40)} b={MA(44)} y={Y} p={p(j5)} lab="4" labSize={64} hMax={170} />
            <Jump a={MA(44)} b={MA(42)} y={Y} p={p(j6)} lab="2" labSize={64} hMax={130} />
            <Jump a={MA(42)} b={MA(43)} y={Y} p={p(j7)} lab="1" labSize={64} hMax={100} />
            <Pt x={MA(40)} n={5} color={grey(j5)} />
            <Pt x={MA(44)} n={6} color={grey(j6)} op={dot(j5)} />
            <Pt x={MA(42)} n={7} color={grey(j7)} op={dot(j6)} />
            <Pt x={MA(43)} n={8} op={dot(j7)} />
          </g>
          <rect x={b2x0} y={Y - 160} width={b2x1 - b2x0} height={330} rx={22} fill="none" stroke={C.amber} strokeWidth={8} strokeDasharray="18 12" opacity={br2} />
          {/* zoom 2: 42–43 */}
          <g opacity={zB}>
            <Axis m={MB} lo={42} hi={43} step={0.25} major={1} labels={[42, 43]} />
            <Jump a={MB(42)} b={MB(43)} y={Y} p={1} lab="1" labSize={64} hMax={110} op={0.3} />
            <Jump a={MB(43)} b={MB(42.5)} y={Y} p={p(j8)} lab={'\\tfrac12'} labSize={76} hMax={110} />
            <Pt x={MB(42)} n={7} color={GREY} />
            <Pt x={MB(43)} n={8} color={grey(p9)} />
            <Pt x={MB(42.5)} n={9} op={ease(f, p9, 6)} lx={-62} />
          </g>
        </Stage>
      </div>
      <Readout
        items={[
          { at: j1, tex: '64 \\to', color: G },
          { at: j2, tex: '\\gets 32', color: V },
          { at: j3, tex: '16 \\to', color: G },
          { at: l1 + 10, tex: `\\color{${G}}{64} \\xrightarrow{\\div 2} \\color{${V}}{32} \\xrightarrow{\\div 2} \\color{${G}}{16}`, color: C.ink },
          { at: j4, tex: '\\gets 8', color: V },
          { at: j5, tex: '4 \\to', color: G },
          { at: j6, tex: '\\gets 2', color: V },
          { at: j7, tex: '1 \\to', color: G },
          { at: j8, tex: '\\gets \\tfrac12', color: V },
          { at: p9, tex: 'P_9 = 42.5', color: C.primary },
        ]}
      />
    </>
  );
};

/** The last quarter jump lands on the answer, on the same close-up the hook opened on. */
const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = cue(scene, 0, '42.75');
  const chime = at(scene, 0, 0.98);
  const arc = hit - 16;
  const trap = at(scene, 1);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 290, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '16px 48px', display: 'flex', alignItems: 'center', gap: 26, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <Tex tex={'P_{10} = 42.75'} size={96} color="#fff" />
          <span style={{ fontSize: 80, fontWeight: 900 }}>· C</span>
        </div>
      </div>
      <Stage>
        <CloseUp nineRing={f >= trap ? C.red : undefined} nineVal={f >= hit}>
          <Jump a={MB(43)} b={MB(42.5)} y={Y} p={1} lab={'\\tfrac12'} labSize={76} hMax={110} op={fadeTo(f, 4, 0, 10)} />
          <Jump a={MB(42.5)} b={MB(42.75)} y={Y} p={ease(f, arc, 16)} lab={'\\tfrac14'} labSize={76} hMax={150} grow={0.55} />
          <Pt x={MB(42.75)} n={10} color={C.green} op={ease(f, hit, 4)} s={0.6 + 0.4 * Math.min(1.3, pop(f, hit))} val="42.75" ring={C.green} lx={66} />
        </CloseUp>
      </Stage>
      <Text x={540} y={1060} w={960} size={60} weight={900} color={C.red} align="center" style={fadeUp(f, trap + 2)}>
        42.5 是 <Tex tex="P_9" size={64} color={C.red} />，早了一步
      </Text>
      <CtaPill start={at(scene, 2)} y={1160} text="练习更多题，就在 vantee.ai" />
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      <Sfx at={arc} src={SFX.click} volume={0.26} />
      <Sfx at={hit - 31} src={SFX.riser} volume={0.3} />
      <Sfx at={trap} src={SFX.buzz} volume={0.2} />
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={380} start={chime} seed={5} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, jumps: Jumps, reveal: Reveal };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8 风格" font={ZH_FONT} captions="box" music={MUSIC} /> : null;
