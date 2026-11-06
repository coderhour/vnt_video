import { Audio, Sequence, useCurrentFrame } from 'remotion';
import { ease, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { CommentBubble, CtaPill, MUSIC, PushIn, SFX, Sfx, ShortFrame, choicePulse } from '../../../lib/Short';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { CHIME, SLUG } from '../Composition';

export { SLUG };

// Tip short (no quiz question, no challenge number): the score table is the main figure. Frame 0 and the last frame
// show the same table (Right +1 / Wrong ? / Blank 0) in the same place, so the loop cuts cleanly.

const before = () => -100;
const TABLE_Y = 560;
const ROW_H = 170;
const ROW_STEP = 200;

type RowState = { label: string; val: string; color: string; border?: string; start: number; popAt?: number; tag?: string };

const Row: React.FC<{ i: number } & RowState> = ({ i, label, val, color, border, start, popAt, tag }) => {
  const f = useCurrentFrame();
  const s = popAt === undefined ? 1 : 1 + 0.07 * Math.max(0, Math.sin(Math.min(1, Math.max(0, (f - popAt) / 14)) * Math.PI));
  return (
    <div
      style={{
        position: 'absolute', left: 50, top: TABLE_Y + i * ROW_STEP, width: 870, height: ROW_H, boxSizing: 'border-box', background: C.card, borderRadius: 28,
        border: border ? `7px solid ${border}` : '7px solid transparent', boxShadow: '0 8px 26px rgba(30,40,80,0.10)', display: 'flex', alignItems: 'center',
        ...fadeUp(f, start, 8), transform: `${fadeUp(f, start, 8).transform ?? ''} scale(${s})`,
      }}
    >
      <div style={{ fontSize: 92, fontWeight: 900, marginLeft: 50, width: 440, color }}>{label}</div>
      <div style={{ fontSize: 120, fontWeight: 900, color, width: 200 }}>{val}</div>
      {tag && <div style={{ marginLeft: 'auto', marginRight: 36, background: C.red, color: '#fff', borderRadius: 18, padding: '4px 26px', fontSize: 60, fontWeight: 900 }}>{tag}</div>}
    </div>
  );
};

/** Wrong value flips "?" -> "0" at `flip` (and back at `back`, for the loop). */
const Table: React.FC<{ rows: RowState[] }> = ({ rows }) => (
  <>
    {rows.map((r, i) => <Row key={r.label} i={i} {...r} />)}
  </>
);

const HOOK_ROWS: RowState[] = [
  { label: 'Right', val: '+1', color: C.green, start: -100 },
  { label: 'Wrong', val: '?', color: C.amber, start: -100 },
  { label: 'Blank', val: '0', color: C.ink, start: -100 },
];

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const nope = at(scene, 0, 0.88);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 272, display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: C.violet, color: '#fff', borderRadius: 999, padding: '12px 48px', fontSize: 64, fontWeight: 900 }}>AMC 8 · Tip</div>
      </div>
      <Text x={540} y={372} w={1000} size={116} weight={900} align="center">
        Leave it <span style={{ color: C.red }}>blank</span>?
      </Text>
      <PushIn frames={scene.frames} origin="540px 845px">
        <Table rows={HOOK_ROWS} />
      </PushIn>
      <Sfx at={nope} src={SFX.buzz} volume={0.35} />
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 700, display: 'flex', justifyContent: 'center', opacity: ease(f, nope, 4) }}>
        <div style={{ transform: `rotate(-8deg) scale(${pop(f, nope)})`, border: `14px solid ${C.red}`, color: C.red, background: 'rgba(255,255,255,0.92)', borderRadius: 28, padding: '6px 54px', fontSize: 180, fontWeight: 900, letterSpacing: 6 }}>
          NOPE
        </div>
      </div>
    </>
  );
};

const CHOICES = ['−1 point', '−¼ point', 'nothing'];

const QuestionBody: React.FC<{ scene: Parameters<SceneComponent>[0]['scene']; start: (i: number) => number; pulse?: (i: number) => number; fixed?: boolean }> = ({ scene, start, pulse = () => 1, fixed }) => {
  const f = useCurrentFrame();
  const l1 = fixed ? -100 : at(scene, 1);
  return (
    <>
      <div style={{ position: 'absolute', left: 40, top: 265, width: 1000, height: 300, boxSizing: 'border-box', background: C.card, borderRadius: 32, padding: '26px 40px', fontSize: 70, fontWeight: 800, lineHeight: 1.35, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <div style={{ position: 'absolute', width: 920, opacity: 1 - ease(f, l1, 6) }}>
          <b style={{ color: C.violet }}>AMC 8:</b> 25 questions · <b style={{ color: C.green }}>+1</b> per right answer
        </div>
        <div style={{ position: 'absolute', width: 920, opacity: ease(f, l1, 8) }}>
          What does a <b style={{ color: C.red }}>wrong</b> answer cost you?
        </div>
      </div>
      {CHOICES.map((c, i) => (
        <div key={c} style={{ position: 'absolute', left: 50, top: 622 + i * 190, width: 870, height: 165, boxSizing: 'border-box', ...fadeUp(f, start(i), 8), background: C.card, borderRadius: 28, boxShadow: '0 4px 14px rgba(30,40,80,0.10)', display: 'flex', alignItems: 'center', gap: 30, padding: '0 44px', scale: String(pulse(i)) }}>
          <span style={{ color: C.muted, fontSize: 80, fontWeight: 900, width: 80 }}>{'ABC'[i]}</span>
          <span style={{ fontSize: 96, fontWeight: 900 }}>{c}</span>
        </div>
      ))}
    </>
  );
};

const Question: SceneComponent = ({ scene }) => (
  <>
    <QuestionBody scene={scene} start={(i) => at(scene, 1, 0.38 + i * 0.2)} />
    <Sfx at={0} src={SFX.whoosh} volume={0.3} />
    <Sfx at={at(scene, 1)} src={SFX.whoosh} volume={0.2} />
  </>
);

const Think: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <QuestionBody scene={scene} fixed start={before} pulse={(i) => choicePulse(f, i)} />
      <CommentBubble y={1175} choices={3} />
    </>
  );
};

const Xmark: React.FC<{ cx: number; cy: number; start: number }> = ({ cx, cy, start }) => {
  const f = useCurrentFrame();
  const s = pop(f, start, 30);
  if (s <= 0) return null;
  return (
    <svg style={{ position: 'absolute', left: cx - 48, top: cy - 48, width: 96, height: 96, transform: `scale(${s})` }} viewBox="-40 -40 80 80">
      <circle r={36} fill={C.red} />
      <path d="M-16 -16 L16 16 M16 -16 L-16 16" stroke="#fff" strokeWidth={9} strokeLinecap="round" />
    </svg>
  );
};

const Score: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const flip = at(scene, 0, 0.62);
  const l1 = at(scene, 1);
  const l2 = at(scene, 2);
  const cross = at(scene, 2, 0.4);
  const third = at(scene, 2, 0.72);
  const zoom = 1 + 0.2 * ease(f, flip - 6, 10) - 0.2 * ease(f, l1 + 2, 10);
  const wrongNow = f >= flip;
  const rows: RowState[] = [
    { label: 'Right', val: '+1', color: C.green, border: C.green, start: 0 },
    { label: 'Wrong', val: wrongNow ? '0' : '?', color: wrongNow ? C.ink : C.amber, border: undefined, start: at(scene, 0, 0.3), popAt: flip },
    { label: 'Blank', val: '0', color: C.ink, start: l1 - 4, popAt: l1 + 2 },
  ];
  const chipY = 1165;
  const one5 = ease(f, l2 + 12, 8) * (1 - ease(f, cross + 24, 8));
  return (
    <>
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      <Sfx at={at(scene, 0, 0.3)} src={SFX.click} volume={0.25} />
      <Sfx at={flip} src={SFX.click} volume={0.3} />
      <Sfx at={l1 + 2} src={SFX.click} volume={0.25} />
      <Sfx at={at(scene, 1, 0.5)} src={SFX.whoosh} volume={0.25} />
      <Sfx at={l2} src={SFX.whoosh} volume={0.25} />
      <Sfx at={cross} src={SFX.click} volume={0.3} />
      <Sfx at={cross + 8} src={SFX.click} volume={0.3} />
      <Sfx at={third} src={SFX.whoosh} volume={0.25} />
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 300, display: 'flex', justifyContent: 'center', fontSize: 100, fontWeight: 900, textAlign: 'center' }}>
        <div style={{ opacity: ease(f, 0, 6) * (1 - ease(f, l2 + 6, 6)), position: 'absolute', width: 1080 }}>Points per question</div>
        <div style={{ position: 'absolute', width: 1080, opacity: one5 }}>wild guess: <span style={{ color: C.amber }}>1 in 5</span></div>
        <div style={{ position: 'absolute', width: 1080, opacity: ease(f, third, 8), transform: `scale(${0.9 + 0.1 * pop(f, third)})` }}>now: <span style={{ color: C.primary }}>1 in 3</span></div>
      </div>
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: '485px 845px' }}>
        <Table rows={rows} />
      </div>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 1165, display: 'flex', justifyContent: 'center', ...fadeUp(f, at(scene, 1, 0.55)), opacity: ease(f, at(scene, 1, 0.55), 8) * (1 - ease(f, l2 - 6, 6)) }}>
        <div style={{ background: C.violet, color: '#fff', borderRadius: 999, padding: '14px 48px', fontSize: 78, fontWeight: 900, whiteSpace: 'nowrap' }}>a guess can only help</div>
      </div>
      {'ABCDE'.split('').map((l, i) => {
        const x = 50 + i * 178;
        const out = i === 1 || i === 3;
        return (
          <div key={l}>
            <div style={{ position: 'absolute', left: x, top: chipY, width: 150, height: 140, borderRadius: 26, background: C.card, boxShadow: '0 4px 14px rgba(30,40,80,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 88, fontWeight: 900, ...fadeUp(f, l2 + i * 4, 8), opacity: ease(f, l2 + i * 4, 8) * (out ? 1 - 0.7 * ease(f, cross + 6, 8) : 1) }}>
              {l}
            </div>
            {out && <Xmark cx={x + 75} cy={chipY + 70} start={cross + (i === 1 ? 0 : 8)} />}
          </div>
        );
      })}
    </>
  );
};

const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 0, 0.3);
  const chime = at(scene, 0, 0.97);
  const l1 = at(scene, 1);
  const reset = scene.frames - 24;
  const back = f >= reset;
  const rows: RowState[] = [
    { label: 'Right', val: '+1', color: C.green, start: -100 },
    { label: 'Wrong', val: back ? '?' : '0', color: back ? C.amber : C.green, border: back ? undefined : C.green, start: -100, popAt: hit },
    { label: 'Blank', val: '0', color: C.ink, border: f >= l1 && !back ? C.red : undefined, start: -100, tag: f >= l1 && !back ? 'trap' : undefined },
  ];
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 272, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, opacity: ease(f, hit, 3), background: C.green, color: '#fff', borderRadius: 28, padding: '14px 48px', display: 'flex', alignItems: 'center', gap: 28, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <span style={{ fontSize: 140, fontWeight: 900 }}>C</span>
          <span style={{ fontSize: 100, fontWeight: 900 }}>nothing</span>
        </div>
      </div>
      <Table rows={rows} />
      <Text x={540} y={1170} w={960} size={72} weight={900} color={C.green} align="center" style={{ ...fadeUp(f, at(scene, 0, 0.55)), opacity: ease(f, at(scene, 0, 0.55), 8) * (1 - ease(f, at(scene, 2) - 6, 6)) }}>
        a wrong answer costs 0
      </Text>
      <CtaPill start={at(scene, 2)} y={1170} />
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      <Sfx at={hit - 31} src={SFX.riser} volume={0.3} />
      <Sfx at={l1} src={SFX.buzz} volume={0.2} />
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={330} start={chime} seed={5} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, score: Score, reveal: Reveal };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8 Guide" captions="words" music={MUSIC} /> : null;
