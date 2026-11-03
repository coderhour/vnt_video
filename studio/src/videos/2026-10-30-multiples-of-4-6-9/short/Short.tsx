import { useId } from 'react';
import { Audio, Sequence, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop } from '../../../lib/anim';
import { at, type Scene, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Stage } from '../../../lib/grid';
import { NUNITO } from '../../../lib/fonts';
import { CommentBubble, CtaPill, MUSIC, PushIn, SFX, Sfx, ShortFrame, choicePulse } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { CHIME, CHOICES, CIRC, SLUG } from '../Composition';

export { SLUG };

// New short recipe: trap-first hook (527 = just adding the three counts), question, comment bait, one big Venn
// diagram where the counts land, the double-counted 12 gets a zoom, the overlaps come off and the 36s come back,
// then the reveal on the same Venn the hook opens on.

type P = [number, number];
const R = 220;
const CEN: P[] = [[390, 705], [690, 705], [540, 965]];
const ANCH: Record<string, P> = { a: [290, 650], b: [790, 650], c: [540, 1075], ab: [540, 640], bc: [676, 870], ac: [404, 870], abc: [540, 795] };
const NAMES = ['4', '6', '9'];
const COUNTS = ['250', '166', '111'];

/** Frame (scene-relative) where `phrase` starts (or ends) in line i's spoken text, by character position. */
const cue = (s: Scene, i: number, phrase: string, after = false) => {
  const l = s.lines[i];
  const t = l.text.toLowerCase();
  const k = t.indexOf(phrase.toLowerCase());
  if (k < 0) throw new Error(`cue: "${phrase}" not in ${s.id} line ${i}`);
  return l.from + Math.round(l.frames * Math.min(0.97, (k + (after ? phrase.length : 0)) / t.length));
};

type Reg = { ins: number[]; color: string; op: number };
type Lab = { at: string; text: string; color?: string; op: number; size?: number; s?: number };

/** The 4 / 6 / 9 Venn diagram, nearly full width. `counts` = opacity of each circle's name + count. */
const Venn: React.FC<{ draw?: number; counts?: [number, number, number]; regions?: Reg[]; labels?: Lab[] }> = ({ draw = 1, counts = [1, 1, 1], regions = [], labels = [] }) => {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const nest = (list: number[]): React.ReactNode =>
    list.length === 0 ? <rect x={0} y={0} width={1080} height={1920} fill="#fff" /> : <g clipPath={`url(#${uid}c${list[0]})`}>{nest(list.slice(1))}</g>;
  const txt = (x: number, y: number, t: string, size: number, color: string, op: number, s = 1, k?: string) =>
    op <= 0.01 ? null : (
      <text key={k} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontFamily={NUNITO} fontWeight={900} fontSize={size} fill={color} opacity={op} paintOrder="stroke" stroke={C.bg} strokeWidth={9} transform={`translate(${x} ${y}) scale(${s}) translate(${-x} ${-y})`}>
        {t}
      </text>
    );
  return (
    <Stage>
      <defs>
        {CEN.map((c, i) => (
          <clipPath key={i} id={`${uid}c${i}`}>
            <circle cx={c[0]} cy={c[1]} r={R} />
          </clipPath>
        ))}
        {regions.map((r, k) => (
          <mask key={k} id={`${uid}m${k}`} maskUnits="userSpaceOnUse" x={0} y={0} width={1080} height={1920}>
            {nest(r.ins)}
          </mask>
        ))}
      </defs>
      {CEN.map((c, i) => (
        <circle key={i} cx={c[0]} cy={c[1]} r={R} fill={CIRC[i]} opacity={0.18 * draw} />
      ))}
      {regions.map((r, k) => (r.op <= 0 ? null : <rect key={k} x={0} y={0} width={1080} height={1920} fill={r.color} opacity={r.op} mask={`url(#${uid}m${k})`} />))}
      {CEN.map((c, i) => (
        <circle key={i} cx={c[0]} cy={c[1]} r={R} fill="none" stroke={CIRC[i]} strokeWidth={8} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
      ))}
      {(['a', 'b', 'c'] as const).map((k, i) => (
        <g key={k}>
          {txt(ANCH[k][0], ANCH[k][1] - 40, `×${NAMES[i]}`, 58, CIRC[i], draw)}
          {txt(ANCH[k][0], ANCH[k][1] + 36, COUNTS[i], 70, C.ink, counts[i], 0.7 + 0.3 * counts[i])}
        </g>
      ))}
      {labels.map((l, k) => txt(ANCH[l.at][0], ANCH[l.at][1], l.text, l.size ?? 58, l.color ?? C.ink, l.op, l.s ?? 1, String(k)))}
    </Stage>
  );
};

/** The labels the overlap scene leaves behind (and the reveal / hook-loop shows). */
const OVERLAPS = (op: number, mid = C.ink): Lab[] => [
  { at: 'ab', text: '×12', op, color: C.red },
  { at: 'bc', text: '×18', op, color: C.red },
  { at: 'abc', text: '×36', op, color: mid },
];

/** A centred chip under the Venn. */
const Chip: React.FC<{ y?: number; op: number; color?: string; children: React.ReactNode; s?: number }> = ({ y = 1200, op, color = C.ink, children, s = 1 }) =>
  op <= 0.01 ? null : (
    <div style={{ position: 'absolute', left: 60, width: 860, top: y, display: 'flex', justifyContent: 'center', opacity: op }}>
      <div style={{ background: C.card, border: `6px solid ${color}`, borderRadius: 28, padding: '8px 38px', transform: `scale(${s})`, boxShadow: '0 8px 24px rgba(30,40,80,0.08)', whiteSpace: 'nowrap' }}>{children}</div>
    </div>
  );

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const nope = cue(scene, 0, 'nope');
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: C.violet, color: '#fff', borderRadius: 999, padding: '10px 40px', fontSize: 52, fontWeight: 900 }}>AMC 8 · Challenge #32</div>
      </div>
      <Text x={540} y={385} w={1000} size={96} weight={900} align="center">
        Think it's <span style={{ color: C.red }}>527</span>?
      </Text>
      <PushIn frames={scene.frames} origin="540px 820px">
        <Venn />
      </PushIn>
      <Sfx at={nope} src={SFX.buzz} volume={0.35} />
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 720, display: 'flex', justifyContent: 'center', opacity: ease(f, nope, 4) }}>
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
        How many whole numbers from <b>1 to 1000</b> are multiples of <b>at least one</b> of <b style={{ color: CIRC[0] }}>4</b>, <b style={{ color: CIRC[1] }}>6</b> and <b style={{ color: CIRC[2] }}>9</b>?
      </div>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 700, display: 'flex', justifyContent: 'center', gap: 40 }}>
        {NAMES.map((d, k) => (
          <div key={d} style={{ width: 190, height: 190, borderRadius: 999, border: `8px solid ${CIRC[k]}`, background: `${CIRC[k]}2e`, color: CIRC[k], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 80, fontWeight: 900 }}>
            ×{d}
          </div>
        ))}
      </div>
      <div style={{ position: 'absolute', left: 60, top: 980, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 22 }}>
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
      <CommentBubble y={560} />
    </>
  );
};

const Overlap: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  // L0: the three counts
  const c = [cue(scene, 0, 'two hundred'), cue(scene, 0, 'one hundred sixty'), cue(scene, 0, 'one hundred eleven')];
  // L1: 12 is in two circles: zoom onto the 4 & 6 lens
  const twelve = cue(scene, 1, 'twelve');
  const add = cue(scene, 1, 'adding');
  const zIn1 = twelve - 4;
  const l2 = at(scene, 2);
  // L2: take away the pair overlaps
  const lab = [cue(scene, 2, 'twelve'), cue(scene, 2, 'eighteen'), cue(scene, 2, 'thirty-six')];
  const sub = cue(scene, 2, 'one hundred sixty-five');
  // L3: the 36s fall out, then come back; zoom onto the middle
  const l3 = at(scene, 3);
  const gone = cue(scene, 3, "isn't counted", true);
  const back = cue(scene, 3, 'twenty-seven');
  const zoom1 = ease(f, zIn1, 12) - ease(f, l2 - 6, 12);
  const zoom2 = ease(f, l3 + 2, 14) - ease(f, scene.frames - 22, 14);
  const lensPulse = ease(f, twelve, 8) * fadeTo(f, l2, 0, 10) * (0.35 + 0.15 * Math.sin(f / 4));
  const subFlash = ease(f, lab[0], 10) * fadeTo(f, l3, 0, 10) * (0.3 + 0.12 * Math.sin(f / 4));
  const white = ease(f, gone - 10, 10) * (1 - ease(f, back, 10));
  const green = ease(f, back, 12);
  const scale = 1 + 0.45 * zoom1 + 0.3 * zoom2;
  const origin = zoom2 > 0 ? `${ANCH.abc[0]}px ${ANCH.abc[1]}px` : `${ANCH.ab[0]}px ${ANCH.ab[1] + 30}px`;
  return (
    <>
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      {c.map((t, i) => <Sfx key={i} at={t} src={SFX.click} volume={0.26} />)}
      <Sfx at={zIn1} src={SFX.whoosh} volume={0.26} />
      <Sfx at={l2 - 6} src={SFX.whoosh} volume={0.22} />
      {lab.map((t, i) => <Sfx key={`l${i}`} at={t} src={SFX.click} volume={0.26} />)}
      <Sfx at={l3 + 2} src={SFX.whoosh} volume={0.26} />
      <Sfx at={back} src={SFX.click} volume={0.3} />
      <Text x={540} y={300} w={1000} size={84} weight={900} align="center" style={{ opacity: fadeTo(f, twelve - 4, 0, 8) }}>
        Count each circle
      </Text>
      <Text x={540} y={300} w={1000} size={84} weight={900} color={C.red} align="center" style={{ ...fadeUp(f, twelve - 2), opacity: ease(f, twelve - 2, 10) * fadeTo(f, l2 - 4, 0, 8) }}>
        12 is counted twice!
      </Text>
      <Text x={540} y={300} w={1000} size={84} weight={900} color={C.red} align="center" style={{ ...fadeUp(f, l2), opacity: ease(f, l2, 10) * fadeTo(f, l3 - 4, 0, 8) }}>
        Take away the overlaps
      </Text>
      <Text x={540} y={300} w={1000} size={84} weight={900} color={C.green} align="center" style={{ ...fadeUp(f, l3), opacity: ease(f, l3, 10) }}>
        Add back all three
      </Text>
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${scale})`, transformOrigin: origin }}>
        <Venn
          draw={ease(f, 2, 22)}
          counts={[ease(f, c[0], 8), ease(f, c[1], 8), ease(f, c[2], 8)]}
          regions={[
            { ins: [0, 1], color: C.red, op: lensPulse },
            { ins: [0, 1], color: C.red, op: subFlash },
            { ins: [1, 2], color: C.red, op: subFlash },
            { ins: [0, 2], color: C.red, op: subFlash },
            { ins: [0, 1, 2], color: '#fff', op: white },
            { ins: [0, 1, 2], color: C.green, op: green * 0.55 },
          ]}
          labels={[
            { at: 'ab', text: '12', op: ease(f, twelve, 6) * fadeTo(f, lab[0] - 4, 0, 6), size: 84, s: 0.6 + 0.4 * pop(f, twelve), color: C.red },
            { at: 'ab', text: '×12', op: ease(f, lab[0], 6), color: C.red },
            { at: 'bc', text: '×18', op: ease(f, lab[1], 6), color: C.red },
            { at: 'abc', text: '×36', op: ease(f, lab[2], 6), color: f >= back ? C.green : C.red, s: 1 + 0.25 * zoom2 * 0 },
          ]}
        />
      </div>
      {/* the readout chip: the running count */}
      <Chip op={ease(f, c[0], 6) * fadeTo(f, l2, 0, 6)} color={f >= add ? C.red : C.ink} s={f >= add ? 0.85 + 0.15 * pop(f, add) : 1}>
        <Tex tex={`250${f >= c[1] ? ' + 166' : ''}${f >= c[2] ? ' + 111' : ''}${f >= add ? ' = \\color{#ef4343}{527}' : ''}`} size={68} />
      </Chip>
      <Chip op={ease(f, lab[0], 6) * fadeTo(f, l3, 0, 6)} color={C.red} s={f >= sub ? 0.85 + 0.15 * pop(f, sub) : 1}>
        <Tex tex={`-(83${f >= lab[1] ? ' + 55' : ''}${f >= lab[2] ? ' + 27' : ''})${f >= sub ? ' = -165' : ''}`} size={58} color={C.red} />
      </Chip>
      <Chip op={ease(f, l3 + 6, 6) * fadeTo(f, back - 2, 0, 6)} color={C.muted}>
        <Tex tex={'36:\\ \\color{#21c45d}{+1+1+1}\\ \\color{#ef4343}{-1-1-1}\\ = 0'} size={52} />
      </Chip>
      <Chip op={ease(f, back, 6)} color={C.green} s={0.85 + 0.15 * pop(f, back)}>
        <Tex tex={'+27'} size={72} color={C.green} />
      </Chip>
    </>
  );
};

/** The sum, the answer, the trap, then the CTA pill, over the same Venn the hook opens on. */
const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = cue(scene, 0, 'three hundred');
  const chime = at(scene, 0, 0.98);
  const trap = at(scene, 1);
  const cta = at(scene, 2);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 290, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '12px 52px', display: 'flex', alignItems: 'center', gap: 24, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <Tex tex="389" size={104} color="#fff" />
          <span style={{ fontSize: 80, fontWeight: 900 }}>· C</span>
        </div>
      </div>
      <Venn regions={[{ ins: [0, 1, 2], color: C.green, op: 0.55 }]} labels={OVERLAPS(1, C.green)} />
      <Chip op={ease(f, 2, 8) * fadeTo(f, trap, 0, 6)} color={f >= hit ? C.green : C.ink}>
        <Tex tex={`527 - 165 + 27${f >= hit ? ' = \\color{#21c45d}{389}' : ''}`} size={68} />
      </Chip>
      <Chip op={ease(f, trap + 2, 8) * fadeTo(f, cta - 4, 0, 6)} color={C.red} s={0.85 + 0.15 * pop(f, trap + 2)}>
        <span style={{ fontSize: 54, fontWeight: 900, color: C.red }}>527 never takes away the overlaps</span>
      </Chip>
      <CtaPill start={cta} y={1200} />
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      <Sfx at={hit - 31} src={SFX.riser} volume={0.3} />
      <Sfx at={trap} src={SFX.buzz} volume={0.2} />
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={380} start={chime} seed={5} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, overlap: Overlap, reveal: Reveal };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" captions="words" music={MUSIC} /> : null;
