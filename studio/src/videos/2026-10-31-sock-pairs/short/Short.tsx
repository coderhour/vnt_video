import { Audio, Sequence, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop, range } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { CommentBubble, CtaPill, MUSIC, PushIn, SFX, Sfx, ShortFrame, choicePulse } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { CHIME, CHOICES, COL, Drawer, SLUG, Sock, type Over } from '../Composition';

export { SLUG };

// New recipe: trap-first hook (140, which counts two-pair sets twice), question, comment bait, then the aha big:
// count the no-pair sets (leave one color out, 5 ways; a sock of each color, 16 ways, zoom on one color), then
// 210 − 80 = 130. The last frame shows the hook's drawer at the same place.

const VSvg: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', left: 0, top: 0 }}>
    {children}
  </svg>
);

const Row: React.FC<{ y: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ y, style, children }) => (
  <div style={{ position: 'absolute', left: 0, width: 1080, top: y, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 18, whiteSpace: 'nowrap', ...style }}>{children}</div>
);

const Chip: React.FC<{ color?: string; style?: React.CSSProperties; children: React.ReactNode }> = ({ color = C.ink, style, children }) => (
  <div style={{ background: C.card, border: `5px solid ${color}`, color, borderRadius: 999, padding: '6px 38px', fontSize: 64, fontWeight: 900, boxShadow: '0 6px 20px rgba(30,40,80,0.08)', display: 'flex', alignItems: 'center', gap: 16, ...style }}>{children}</div>
);

const CELL = 190; // the big drawer: 5 × 190 + 48 = 998 wide
const DX = (1080 - (5 * CELL + 48)) / 2;
const HOOK_Y = 540; // the hook's (and the reveal's) drawer
const before = () => -100;

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const nope = at(scene, 0, 0.84);
  return (
    <>
      <Row y={280}>
        <div style={{ background: C.violet, color: '#fff', borderRadius: 999, padding: '10px 40px', fontSize: 52, fontWeight: 900 }}>AMC 8 · Challenge #22</div>
      </Row>
      <Text x={540} y={385} w={1000} size={96} weight={900} align="center">
        Think it's <span style={{ color: C.red }}>140</span>?
      </Text>
      <PushIn frames={scene.frames} origin="540px 750px">
        <VSvg>
          <Drawer x={DX} y={HOOK_Y} n={5} cell={CELL} />
        </VSvg>
      </PushIn>
      <Sfx at={nope} src={SFX.buzz} volume={0.35} />
      <Row y={660} style={{ opacity: ease(f, nope, 4) }}>
        <div style={{ transform: `rotate(-8deg) scale(${pop(f, nope)})`, border: `14px solid ${C.red}`, color: C.red, background: 'rgba(255,255,255,0.92)', borderRadius: 28, padding: '6px 54px', fontSize: 150, fontWeight: 900, letterSpacing: 6 }}>
          NOPE
        </div>
      </Row>
    </>
  );
};

const QuestionBody: React.FC<{ start: (i: number) => number; pulse?: (i: number) => number }> = ({ start, pulse = () => 1 }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 50, top: 290, width: 980, boxSizing: 'border-box', background: C.card, borderRadius: 32, padding: '24px 40px', fontSize: 54, fontWeight: 800, lineHeight: 1.33, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        <b style={{ color: C.violet }}>5 pairs</b> of socks, each a different color. Pull out <b>4 socks</b>. How many sets have <b style={{ color: C.primary }}>at least one matching pair</b>?
      </div>
      <VSvg>
        <Drawer x={(1080 - (5 * 160 + 48)) / 2} y={640} n={5} cell={160} />
      </VSvg>
      <div style={{ position: 'absolute', left: 60, top: 1035, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 22 }}>
        {CHOICES.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 8), background: C.card, borderRadius: 22, padding: '10px 30px', boxShadow: '0 4px 14px rgba(30,40,80,0.08)', display: 'flex', alignItems: 'center', gap: 14, scale: String(pulse(i)) }}>
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
    <QuestionBody start={(i) => at(scene, 1, 0.45 + i * 0.08)} />
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

const PX = (i: number) => 150 + i * 200; // the four chosen colors' columns
const ROW_Y = 975;

/** The aha: no pair = 4 different colors. Leave one color out (5 ways), then a sock of each color (2×2×2×2 = 16). */
const NoPair: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const a = at(scene, 0, 0.5);
  const b = at(scene, 0, 0.97);
  const leave = f < a ? -1 : Math.min(4, Math.floor(((f - a) / (b - a)) * 5));
  const l1 = at(scene, 1);
  const l2 = at(scene, 2);
  const row = ease(f, l1, 12);
  // zoom onto the first color's two socks while "two socks to pick from" is said, then back out to count
  const zIn = l1 + 4;
  const zOut = at(scene, 1, 0.4);
  const z = ease(f, zIn, 14) - ease(f, zOut, 12);
  const zs = 1 + 0.6 * z;
  const tx = z * (430 - 1.6 * PX(0));
  const ty = z * (1000 - 1.6 * ROW_Y);
  const c0 = at(scene, 1, 0.45);
  const c1 = at(scene, 1, 0.95);
  const cnt = f < c0 ? -1 : Math.min(15, Math.floor(((f - c0) / (c1 - c0)) * 16));
  // before the count, the box on the zoomed color flips between its two socks
  const pre = Math.floor((f - zIn) / 14) % 2 === 1 ? 1 : 0;
  const pick = (i: number) => (cnt < 0 ? (i === 0 && f >= zIn + 14 ? pre : 0) : Math.floor(cnt / 2 ** (3 - i)) % 2);
  const over = (c: number): Over | undefined => (c === leave ? { op: 0.18 } : undefined);
  return (
    <>
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      {range(5).map((i) => <Sfx key={i} at={a + ((b - a) * i) / 5} src={SFX.click} volume={0.28} />)}
      <Sfx at={zIn} src={SFX.whoosh} volume={0.25} />
      <Sfx at={zOut} src={SFX.whoosh} volume={0.25} />
      {range(8).map((i) => <Sfx key={`c${i}`} at={c0 + ((c1 - c0) * 2 * i) / 16} src={SFX.click} volume={0.22} />)}
      <div style={{ position: 'absolute', inset: 0, transform: `translate(${tx}px, ${ty}px) scale(${zs})`, transformOrigin: '0 0' }}>
        <VSvg>
          <Drawer x={DX} y={420} n={5} cell={CELL} over={(c) => over(c)} op={1 - 0.65 * z} />
          <g opacity={row}>
            {range(4).map((i) => {
              const v = pick(i);
              return (
                <g key={i}>
                  <rect x={PX(i) - 98 + v * 96} y={ROW_Y - 68} width={100} height={136} rx={18} fill="#fff" stroke={C.ink} strokeWidth={7} />
                  <Sock x={PX(i) - 48} y={ROW_Y} k={0.85} c={i} v={0} op={v === 0 ? 1 : 0.35} />
                  <Sock x={PX(i) + 48} y={ROW_Y} k={0.85} c={i} v={1} op={v === 1 ? 1 : 0.35} />
                </g>
              );
            })}
          </g>
        </VSvg>
      </div>
      {/* top readout: changes on every beat */}
      <Row y={285} style={{ opacity: ease(f, 4, 10) * fadeTo(f, a - 2, 0, 6) }}>
        <Chip color={C.violet}>no pair = 4 different colors</Chip>
      </Row>
      <Row y={285} style={{ opacity: ease(f, a, 6) * fadeTo(f, l1, 0, 6) }}>
        <Chip color={C.violet}>
          leave out
          <svg width={60} height={60}><circle cx={30} cy={30} r={26} fill={COL[Math.max(0, leave)]} /></svg>
          way {Math.max(1, leave + 1)}
        </Chip>
      </Row>
      <Row y={285} style={{ opacity: ease(f, zIn, 8) * fadeTo(f, l2, 0, 6) }}>
        <Chip color={C.primary}>{cnt < 0 ? '2 socks per color' : `sock choice #${cnt + 1}`}</Chip>
      </Row>
      <Row y={285} style={fadeUp(f, at(scene, 2, 0.35))}>
        <Chip color={C.red}>
          <Tex tex={'5\\times 16 = 80'} size={70} color={C.red} />
          <span>no pair</span>
        </Chip>
      </Row>
      <Row y={1110} style={fadeUp(f, at(scene, 1, 0.62))}>
        <Tex tex={'2\\times 2\\times 2\\times 2 = 16'} size={76} />
      </Row>
    </>
  );
};

const mix = (x: number[], y: number[], t: number) => `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * t)).join(',')})`;

/** 210 − 80 = 130 over the hook's drawer, the trap, then the CTA pill. */
const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const full = ease(f, at(scene, 0, 0.05), 12);
  const cut = ease(f, at(scene, 0, 0.5), 12);
  const hit = at(scene, 0, 0.76);
  const chime = at(scene, 0, 0.97);
  const trap = at(scene, 1);
  const cta = at(scene, 2);
  const W = 860;
  const w80 = (W * 80) / 210;
  return (
    <>
      <VSvg>
        <Drawer x={DX} y={HOOK_Y} n={5} cell={CELL} />
      </VSvg>
      <Row y={285} style={fadeUp(f, at(scene, 0, 0.45))}>
        <Tex tex={'210 - 80 ='} size={76} />
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, borderRadius: 26, padding: '8px 34px', boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <Tex tex={'130'} size={88} color="#fff" />
        </div>
      </Row>
      <Text x={540} y={415} w={1000} size={58} weight={900} color={C.red} align="center" style={{ ...fadeUp(f, trap + 3), opacity: ease(f, trap + 3, 12) * fadeTo(f, cta - 4, 0, 8) }}>
        140 counts 2-pair sets twice
      </Text>
      <CtaPill start={cta} y={405} />
      <div style={{ position: 'absolute', left: 60, top: 1010, width: W, height: 120, borderRadius: 24, overflow: 'hidden', opacity: full, display: 'flex' }}>
        <div style={{ width: w80, background: mix([60, 131, 246], [239, 67, 67], cut), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 60, fontWeight: 900, color: '#fff' }}>{cut > 0.3 ? '80' : ''}</div>
        <div style={{ flex: 1, background: mix([60, 131, 246], [33, 196, 93], ease(f, hit, 10)), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64, fontWeight: 900, color: '#fff' }}>{f >= hit ? '130' : ''}</div>
      </div>
      <Text x={540} y={1010} w={W} size={60} weight={900} color="#fff" align="center" style={{ opacity: full * fadeTo(f, at(scene, 0, 0.5), 0, 6), lineHeight: '120px' }}>
        210 sets
      </Text>
      <Text x={60 + w80 / 2} y={1145} w={w80 + 40} size={48} weight={900} color={C.red} align="center" style={{ opacity: cut }}>no pair</Text>
      <Text x={60 + w80 + (W - w80) / 2} y={1145} w={W - w80} size={48} weight={900} color={C.green} align="center" style={{ opacity: ease(f, hit, 10) }}>has a pair</Text>
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      <Sfx at={hit - 31} src={SFX.riser} volume={0.3} />
      <Sfx at={trap} src={SFX.buzz} volume={0.2} />
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={700} y={330} start={chime} seed={11} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, nopair: NoPair, reveal: Reveal };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" captions="words" music={MUSIC} /> : null;
