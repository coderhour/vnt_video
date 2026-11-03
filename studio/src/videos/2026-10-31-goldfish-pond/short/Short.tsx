import { Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { CommentBubble, CtaPill, MUSIC, PushIn, SFX, Sfx, ShortFrame, choicePulse } from '../../../lib/Short';
import { Stage } from '../../../lib/grid';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { CH, SLUG } from '../Composition';

export { SLUG };
const CHIME = staticFile(`${SLUG}/sfx/fs-541985.mp3`);

// Trap-first AMC 8 short: hook on the full pond, question, comment bait, the aha (the 20 other fish stay: zoom onto
// them, then a 5-part bar, 5 × 20 = 100 fish left), reveal (the right half, 100 goldfish, fades out of the same pond).

const GOLD = '#ff9f1c';
const GD = '#e08600';
const GREY = '#9aa3b2';
const GRD = '#6b7385';

const Fish: React.FC<{ cx: number; cy: number; color: string; s: number; op: number }> = ({ cx, cy, color, s, op }) => (
  <g transform={`translate(${cx} ${cy}) scale(${s})`} opacity={op}>
    <ellipse rx={11} ry={8} fill={color} />
    <path d="M-8 0 L-17 -7 L-17 7 Z" fill={color} />
    <circle cx={6} cy={-2} r={1.9} fill="#fff" />
  </g>
);

/** 20 × 10 pond: the 20 grey "other" fish fill the 2 left columns, 180 goldfish the rest.
 * `gone` 0→1 fades the 100 goldfish in columns 10…19 to ghosts, right to left; `glow` rings the grey fish. */
const Pond: React.FC<{ x: number; y: number; cell: number; gone?: number; glow?: number }> = ({ x, y, cell, gone = 0, glow = 0 }) => {
  const f = useCurrentFrame();
  const s = cell / 36;
  const fish: React.ReactNode[] = [];
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 20; c++) {
      const grey = c < 2;
      const g = c >= 10 ? Math.max(0, Math.min(1, gone * 10 - (19 - c))) : 0;
      fish.push(<Fish key={`${r}-${c}`} cx={x + c * cell + cell / 2 + 3 * s} cy={y + r * cell + cell / 2} color={grey ? GREY : GOLD} s={s * 1.15} op={1 - 0.85 * g} />);
    }
  }
  const pulse = 0.6 + 0.4 * Math.sin(f / 6);
  return (
    <>
      <div style={{ position: 'absolute', left: x - 14, top: y - 14, width: 20 * cell + 28, height: 10 * cell + 28, borderRadius: 30, background: 'rgba(76, 201, 240, 0.14)', border: '4px solid rgba(76, 201, 240, 0.4)' }} />
      <Stage>
        {glow > 0 && <rect x={x - 6} y={y - 6} width={2 * cell + 12} height={10 * cell + 12} rx={16} fill="rgba(123, 97, 255, 0.12)" stroke={C.violet} strokeWidth={7} opacity={glow * pulse} />}
        {fish}
      </Stage>
    </>
  );
};

const PX = 60;
const PY = 540;
const CELL = 43;

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const nope = at(scene, 0, 0.84);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: C.violet, color: '#fff', borderRadius: 999, padding: '10px 40px', fontSize: 52, fontWeight: 900 }}>AMC 8 · Challenge #20</div>
      </div>
      <Text x={540} y={385} w={1000} size={96} weight={900} align="center">
        Think it's <span style={{ color: C.red }}>10</span>?
      </Text>
      <PushIn frames={scene.frames} origin="540px 770px">
        <Pond x={PX} y={PY} cell={CELL} />
      </PushIn>
      <Sfx at={nope} src={SFX.buzz} volume={0.35} />
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 680, display: 'flex', justifyContent: 'center', opacity: ease(f, nope, 4) }}>
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
        A pond has <b>200 fish</b>, <b style={{ color: GD }}>90%</b> goldfish. How many goldfish must go so that <b style={{ color: GD }}>80%</b> of the fish <u>left</u> are goldfish?
      </div>
      <Pond x={180} y={670} cell={36} />
      <div style={{ position: 'absolute', left: 60, top: 1060, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 22 }}>
        {CH.map((c, i) => (
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
    <QuestionBody start={(i) => at(scene, 1, 0.6 + i * 0.07)} />
    <Sfx at={0} src={SFX.whoosh} volume={0.3} />
  </>
);

const Think: SceneComponent = () => {
  const f = useCurrentFrame();
  return (
    <>
      <QuestionBody start={() => -100} pulse={(i) => choicePulse(f, i)} />
      <CommentBubble />
    </>
  );
};

const Chip: React.FC<{ color: string; style?: React.CSSProperties; children: React.ReactNode }> = ({ color, style, children }) => (
  <div style={{ background: color, color: '#fff', borderRadius: 24, padding: '8px 34px', fontSize: 60, fontWeight: 900, whiteSpace: 'nowrap', ...style }}>{children}</div>
);

const Stay: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const sy = 390;
  const zIn = at(scene, 1, 0.02);
  const zOut = at(scene, 1, 0.5);
  const zoom = 1 + 0.5 * ease(f, zIn, 12) - 0.5 * ease(f, zOut, 10);
  const barOn = at(scene, 1, 0.55);
  const fill = (i: number) => at(scene, 2, 0.28 + i * 0.1); // bar parts 1…4 get their "20"
  return (
    <>
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      <Sfx at={at(scene, 0, 0.45)} src={SFX.click} volume={0.28} />
      <Sfx at={at(scene, 0, 0.8)} src={SFX.click} volume={0.28} />
      <Sfx at={zIn} src={SFX.whoosh} volume={0.25} />
      <Sfx at={zOut} src={SFX.whoosh} volume={0.25} />
      <Sfx at={at(scene, 1, 0.75)} src={SFX.click} volume={0.25} />
      {[1, 2, 3, 4].map((i) => <Sfx key={i} at={fill(i)} src={SFX.click} volume={0.25} />)}
      <Text x={540} y={250} w={1040} size={84} weight={900} align="center">
        Watch the fish that <span style={{ color: C.violet }}>stay</span>!
      </Text>
      <div style={{ position: 'absolute', left: 0, top: sy - 30, width: 1080, height: 530, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: 0, top: -(sy - 30), width: 1080, height: 1920, transform: `scale(${zoom})`, transformOrigin: `${PX + CELL}px ${sy + 5 * CELL}px` }}>
          <Pond x={PX} y={sy} cell={CELL} glow={ease(f, at(scene, 0, 0.78), 10)} />
        </div>
      </div>
      {/* zoomed on the grey fish: they stay */}
      <div style={{ position: 'absolute', left: 260, top: 560, opacity: ease(f, zIn + 8, 6) * fadeTo(f, zOut, 0, 6) }}>
        <Chip color={C.violet} style={{ transform: `rotate(-4deg) scale(${pop(f, zIn + 8)})`, fontSize: 72 }}>20 always stay 🔒</Chip>
      </div>
      <div style={{ position: 'absolute', left: 60, width: 860, top: 890, display: 'flex', justifyContent: 'center', gap: 30, opacity: fadeTo(f, barOn, 0, 8) }}>
        <div style={fadeUp(f, at(scene, 0, 0.42))}><Chip color={GD}>180 goldfish</Chip></div>
        <div style={fadeUp(f, at(scene, 0, 0.78))}><Chip color={GRD}>20 others</Chip></div>
      </div>
      {/* the pond at the end: 5 equal parts, one of them the 20 others */}
      <Text x={490} y={900} w={860} size={60} weight={900} color={C.muted} align="center" style={fadeUp(f, barOn + 4)}>
        the pond at the end:
      </Text>
      <div style={{ position: 'absolute', left: 60, top: 1010, width: 860, height: 110, display: 'flex', gap: 8, ...fadeUp(f, barOn) }}>
        {[0, 1, 2, 3, 4].map((i) => {
          const on = i === 0 ? 1 : ease(f, fill(i), 6);
          return (
            <div key={i} style={{ flex: 1, borderRadius: i === 0 ? '26px 8px 8px 26px' : i === 4 ? '8px 26px 26px 8px' : 8, background: i === 0 ? GREY : `rgba(255,159,28,${0.25 + 0.75 * on})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 64, fontWeight: 900, transform: `scale(${i === 0 ? 1 : 0.9 + 0.1 * pop(f, fill(i))})` }}>
              <span style={{ opacity: on }}>20</span>
            </div>
          );
        })}
      </div>
      <div style={{ position: 'absolute', left: 60, width: 860, top: 1150, display: 'flex', justifyContent: 'center' }}>
        <div style={{ position: 'absolute', ...fadeUp(f, at(scene, 1, 0.72)), opacity: ease(f, at(scene, 1, 0.72), 10) * fadeTo(f, at(scene, 2, 0.7), 0, 6) }}>
          <Tex tex={`{\\color{${GRD}}20} = 20\\% = \\dfrac{1}{5}`} size={72} />
        </div>
        <div style={{ position: 'absolute', ...fadeUp(f, at(scene, 2, 0.72)) }}>
          <Tex tex={`5 \\times {\\color{${GRD}}20} = 100\\text{ fish}`} size={72} />
        </div>
      </div>
    </>
  );
};

/** The answer, the trap, then the CTA pill over the same pond as frame 0 (the 100 leaving goldfish as ghosts). */
const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 0, 0.66);
  const chime = at(scene, 0, 0.97);
  const trap = at(scene, 1);
  const g0 = at(scene, 0, 0.05);
  const g1 = at(scene, 0, 0.42);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '14px 48px', display: 'flex', alignItems: 'center', gap: 24, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <Tex tex="100" size={116} color="#fff" />
          <span style={{ fontSize: 70, fontWeight: 900 }}>goldfish go</span>
        </div>
      </div>
      <Pond x={PX} y={PY} cell={CELL} gone={Math.max(0, Math.min(1, (f - g0) / (g1 - g0)))} />
      {[0, 2, 4, 6, 8].map((i) => <Sfx key={i} at={g0 + ((g1 - g0) * (i + 1)) / 10} src={SFX.click} volume={0.22} />)}
      <Text x={490} y={1030} w={860} size={62} weight={900} color={C.green} align="center" style={{ ...fadeUp(f, g0), opacity: ease(f, g0, 10) * fadeTo(f, trap, 0, 6) }}>
        200 fish → 100 fish
      </Text>
      <div style={{ position: 'absolute', left: 60, width: 860, top: 1030, display: 'flex', justifyContent: 'center', ...fadeUp(f, trap + 4) }}>
        <Tex tex={`{\\color{${C.red}}90\\% - 80\\% \\ne 10\\text{ fish}}`} size={64} />
      </div>
      <CtaPill start={at(scene, 2)} y={1150} />
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      <Sfx at={hit - 31} src={SFX.riser} volume={0.3} />
      <Sfx at={trap} src={SFX.buzz} volume={0.2} />
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={360} start={chime} seed={5} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, stay: Stay, reveal: Reveal };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" captions="words" music={MUSIC} /> : null;
