import { Audio, Sequence, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { CommentBubble, CtaPill, MUSIC, PushIn, SFX, Sfx, ShortFrame, choicePulse } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { AMBER, BLUE, CHIME, E0, Lab, SLUG, VALS, Yard } from '../Composition';

export { SLUG };

// New recipe: trap-first hook (6, which is EB), question, comment bait, then the aha big: name EA = x, so EC = x
// and EB = 16 − x, the right triangle EBC, a zoom on the x² cancelling, 320 = 32x, then x = 10.
// The last frame shows the hook's yard at the same place.

// 16 × 8 yard, 46 px per metre: 736 × 368, x 124…860 (labels stay inside x 60…920)
const Y = { L: 16, W: 8, u: 46, ox: 124 };
const HOOK_OY = 958; // the hook's (and the reveal's) yard
const LS = 60; // label size
const before = () => -100;

type G = { X: (x: number) => number; Y: (y: number) => number; L: number; W: number; oy: number; ex: number };

/** Corner letters, E and BC = 8 at 60 px (the long video's Yard draws them at 48). */
const Corners: React.FC<{ g: G; e?: number; eight?: number }> = ({ g, e = 1, eight = 1 }) => (
  <>
    <Lab x={g.X(0) - 40} y={g.oy + 60} t="A" size={LS} />
    <Lab x={g.X(g.L) + 40} y={g.oy + 60} t="B" size={LS} />
    <Lab x={g.X(g.L) + 40} y={g.Y(g.W) - 10} t="C" size={LS} />
    <Lab x={g.X(0) - 40} y={g.Y(g.W) - 10} t="D" size={LS} />
    <Lab x={g.X(g.ex)} y={g.oy + 60} t="E" size={LS} op={e} />
    <Lab x={g.X(g.L) + 18} y={g.Y(g.W / 2) + 20} t="8" size={LS} anchor="start" op={eight} />
  </>
);
const Dim: React.FC<{ g: G }> = ({ g }) => (
  <>
    <g stroke="#666" strokeWidth={4}>
      <line x1={g.X(0)} y1={g.oy + 90} x2={g.X(g.L)} y2={g.oy + 90} />
      <line x1={g.X(0)} y1={g.oy + 76} x2={g.X(0)} y2={g.oy + 104} />
      <line x1={g.X(g.L)} y1={g.oy + 76} x2={g.X(g.L)} y2={g.oy + 104} />
    </g>
    <Lab x={(g.X(0) + g.X(g.L)) / 2} y={g.oy + 152} t="16" size={LS} />
  </>
);
const eaL = (g: G, t: string, op: number, color = C.primary, size = LS) => <Lab x={g.X(g.ex / 2)} y={g.oy - 24} t={t} op={op} color={color} size={size} />;
const ebL = (g: G, t: string, op: number, color = BLUE) => <Lab x={g.X((g.ex + g.L) / 2)} y={g.oy - 24} t={t} op={op} color={color} size={LS} />;
const ecL = (g: G, t: string, op: number, color = C.violet, size = LS) => <Lab x={g.X((g.ex + g.L) / 2) - 40} y={g.Y(g.W / 2) + 4} t={t} op={op} color={color} anchor="end" size={size} />;

const Row: React.FC<{ y: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ y, style, children }) => (
  <div style={{ position: 'absolute', left: 0, width: 1080, top: y, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 18, whiteSpace: 'nowrap', ...style }}>{children}</div>
);

const Chip: React.FC<{ color?: string; children: React.ReactNode }> = ({ color = C.ink, children }) => (
  <div style={{ background: C.card, border: `5px solid ${color}`, color, borderRadius: 999, padding: '6px 38px', fontSize: 64, fontWeight: 900, boxShadow: '0 6px 20px rgba(30,40,80,0.08)', display: 'flex', alignItems: 'center', gap: 16 }}>{children}</div>
);

/** The hook's yard: the tree at E with its two equal strings (no numbers). */
const HookYard: React.FC<{ children?: (g: G) => React.ReactNode; tri?: number; hiEB?: number }> = ({ children, tri = 0, hiEB = 0 }) => (
  <Yard {...Y} oy={HOOK_OY} ex={E0} dot={0} eLab={0} corners={0} dim={0} bc={0} tree={1} ea={1} ec={1} ecDash={false} tick={1} tri={tri} rt={tri} hiEB={hiEB}>
    {(g) => (
      <>
        <Corners g={g} />
        <Dim g={g} />
        {children?.(g)}
      </>
    )}
  </Yard>
);

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const nope = at(scene, 0, 0.84);
  return (
    <>
      <Row y={280}>
        <div style={{ background: C.violet, color: '#fff', borderRadius: 999, padding: '10px 40px', fontSize: 52, fontWeight: 900 }}>AMC 8 · Challenge #34</div>
      </Row>
      <Text x={540} y={385} w={1000} size={96} weight={900} align="center">
        Think it's <span style={{ color: C.red }}>6</span>?
      </Text>
      <PushIn frames={scene.frames} origin="540px 780px">
        <HookYard />
      </PushIn>
      <Sfx at={nope} src={SFX.buzz} volume={0.35} />
      <Row y={700} style={{ opacity: ease(f, nope, 4) }}>
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
        Yard: <b style={{ color: C.primary }}>AB = 16 m</b>, <b style={{ color: BLUE }}>BC = 8 m</b>. Tree E on AB with <b style={{ color: C.violet }}>EA = EC</b>. How far is E from A?
      </div>
      <Yard {...Y} oy={1000} ex={E0} dot={1} eLab={0} corners={0} dim={0} bc={0} ea={1} ec={1} tick={1}>
        {(g) => (
          <>
            <Corners g={g} />
            {eaL(g, '? m', 1, AMBER)}
          </>
        )}
      </Yard>
      <div style={{ position: 'absolute', left: 60, top: 1090, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 22 }}>
        {VALS.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 8), background: C.card, borderRadius: 22, padding: '8px 34px', boxShadow: '0 4px 14px rgba(30,40,80,0.08)', display: 'flex', alignItems: 'center', gap: 14, scale: String(pulse(i)) }}>
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
    <QuestionBody start={(i) => at(scene, 1, 0.3 + i * 0.1)} />
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

/** The aha: EA = EC = x, EB = 16 − x, the right triangle, then the x² terms cancel (zoomed) to 320 = 32x. */
const Name: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l1 = at(scene, 1);
  const l2 = at(scene, 2);
  const xA = at(scene, 0, 0.18);
  const xC = at(scene, 0, 0.42);
  const xB = at(scene, 0, 0.78);
  const tri = ease(f, at(scene, 1, 0.08), 12);
  const eq1 = at(scene, 1, 0.3);
  const zIn = l2 + 2;
  const swap = at(scene, 2, 0.3);
  const eq3 = at(scene, 2, 0.6);
  const zOut = at(scene, 2, 0.88);
  const z = ease(f, zIn, 12) - ease(f, zOut, 12);
  const p = ease(f, swap, 14);
  return (
    <>
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      {[xA, xC, xB].map((t, i) => <Sfx key={i} at={t} src={SFX.click} volume={0.28} />)}
      <Sfx at={at(scene, 1, 0.08)} src={SFX.click} volume={0.22} />
      <Sfx at={at(scene, 1, 0.55)} src={SFX.click} volume={0.22} />
      <Sfx at={zIn} src={SFX.whoosh} volume={0.25} />
      <Sfx at={swap} src={SFX.click} volume={0.3} />
      <Sfx at={eq3} src={SFX.click} volume={0.28} />
      <Sfx at={zOut} src={SFX.whoosh} volume={0.25} />
      <Yard {...Y} oy={838} ex={E0} dot={1} eLab={0} corners={0} dim={0} bc={0} ea={ease(f, xA - 4, 8)} ec={ease(f, xC - 4, 8)} tick={ease(f, xC, 8)} tri={tri} rt={tri} hiEB={ease(f, xB - 4, 8) * fadeTo(f, l1, 0.0, 10)} hiBC={ease(f, at(scene, 1, 0.55), 8) * fadeTo(f, l2, 0, 10)}>
        {(g) => (
          <>
            <Corners g={g} />
            {eaL(g, 'x', ease(f, xA, 8), AMBER, 84)}
            {ecL(g, 'x', ease(f, xC, 8), AMBER, 84)}
            {ebL(g, '16 − x', ease(f, xB, 8))}
          </>
        )}
      </Yard>
      {/* top readout, one per beat */}
      <Row y={285} style={{ opacity: ease(f, xA, 8) * fadeTo(f, l1, 0, 6) }}>
        <Chip color={AMBER}>
          <Tex tex={'EA = EC = x'} size={64} color={AMBER} />
        </Chip>
      </Row>
      <Row y={285} style={{ opacity: ease(f, l1, 8) * fadeTo(f, l2, 0, 6) }}>
        <Chip color={BLUE}>right triangle EBC</Chip>
      </Row>
      <Row y={285} style={{ opacity: ease(f, swap, 8) }}>
        <Chip color={C.violet}>
          <Tex tex={'x^2'} size={64} color={C.violet} /> cancels!
        </Chip>
      </Row>
      {/* equation rows, zooming onto the cancel */}
      <div style={{ position: 'absolute', inset: 0, transform: `translateX(${-50 * z}px) scale(${1 + 0.18 * z})`, transformOrigin: '540px 1120px' }}>
        <Row y={985} style={{ ...fadeUp(f, eq1), opacity: ease(f, eq1, 10) * (1 - 0.7 * z) }}>
          <Tex tex={'(16 - x)^2 + 8^2 = x^2'} size={66} />
        </Row>
        <Row y={1080} style={fadeUp(f, l2)}>
          <div style={{ position: 'relative' }}>
            <div style={{ opacity: 1 - p }}>
              <Tex tex={'256 - 32x + \\textcolor{#7b61ff}{x^2} + 64 = \\textcolor{#7b61ff}{x^2}'} size={56} />
            </div>
            <div style={{ position: 'absolute', left: 0, top: 0, opacity: p }}>
              <Tex tex={'256 - 32x + \\textcolor{#c4c9d4}{\\cancel{x^2}} + 64 = \\textcolor{#c4c9d4}{\\cancel{x^2}}'} size={56} />
            </div>
          </div>
        </Row>
        <Row y={1175} style={fadeUp(f, eq3)}>
          <Tex tex={'320 = 32x'} size={70} />
        </Row>
      </div>
    </>
  );
};

/** x = 10 over the hook's yard, the trap (EB = 6), then the CTA pill. */
const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 0, 0.6);
  const chime = at(scene, 0, 0.97);
  const trap = at(scene, 1);
  const cta = at(scene, 2);
  return (
    <>
      <HookYard tri={ease(f, trap, 10)} hiEB={ease(f, trap + 3, 8)}>
        {(g) => (
          <>
            {eaL(g, '10', ease(f, hit, 8), C.green)}
            {ecL(g, '10', ease(f, hit, 8), C.green)}
            {ebL(g, '6', ease(f, trap + 3, 8), C.red)}
          </>
        )}
      </HookYard>
      <Row y={285} style={fadeUp(f, at(scene, 0, 0.05))}>
        <Tex tex={'x = 320 \\div 32 ='} size={72} />
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 26, padding: '6px 34px', fontSize: 80, fontWeight: 900, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          10 m
        </div>
      </Row>
      <Text x={540} y={415} w={1000} size={60} weight={900} color={C.red} align="center" style={{ ...fadeUp(f, trap + 3), opacity: ease(f, trap + 3, 12) * fadeTo(f, cta - 4, 0, 8) }}>
        6 is EB, not EA
      </Text>
      <CtaPill start={cta} y={405} />
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      <Sfx at={hit - 31} src={SFX.riser} volume={0.3} />
      <Sfx at={trap} src={SFX.buzz} volume={0.2} />
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={720} y={330} start={chime} seed={5} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, name: Name, reveal: Reveal };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" captions="words" music={MUSIC} /> : null;
