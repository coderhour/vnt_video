import { Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { CommentBubble, CtaPill, MUSIC, PushIn, SFX, Sfx, ShortFrame, choicePulse } from '../../../lib/Short';
import { Stage } from '../../../lib/grid';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { AMBER, BIG_DOWN, BIG_UP, BLUE_D, Base, CHOICES, GREEN_D, Pg, SLUG, SMALL_HEX, UP2, VIOLET_D, mk, ptsOf } from '../Composition';

export { SLUG };
const CHIME = staticFile(`${SLUG}/sfx/fs-541985.mp3`);

// Trap-first AMC 8 short: hook on the big hexagon, question, comment bait, the aha (count only ▲: 12 small shade in,
// zoom while one outline hops through the 6 side-2 ones, the big one, 19; then a half turn: 19 ▼ too), reveal on the same hexagon.

const UPS = SMALL_HEX.filter((t) => t.dir === 'up').sort((a, b) => b.p[0][1] - a.p[0][1] || a.p[0][0] - b.p[0][0]);

/** The hook / reveal hexagon (same place, so the loop cuts cleanly). */
const HT = mk(530, 880, 190);
const Tinted: React.FC = () => (
  <>
    <Base T={HT} />
    {SMALL_HEX.map((t, k) => (
      <Pg key={k} pts={ptsOf(t, HT)} fill={t.dir === 'up' ? C.primary : C.blue} fo={0.3} />
    ))}
  </>
);

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const nope = at(scene, 0, 0.84);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: C.violet, color: '#fff', borderRadius: 999, padding: '10px 40px', fontSize: 52, fontWeight: 900 }}>AMC 8 · Challenge #4</div>
      </div>
      <Text x={540} y={385} w={1000} size={96} weight={900} align="center">
        Think it's <span style={{ color: C.red }}>36</span>?
      </Text>
      <PushIn frames={scene.frames} origin="530px 880px">
        <Stage>
          <Tinted />
        </Stage>
      </PushIn>
      <Sfx at={nope} src={SFX.buzz} volume={0.35} />
      <div style={{ position: 'absolute', left: 0, width: 1060, top: 790, display: 'flex', justifyContent: 'center', opacity: ease(f, nope, 4) }}>
        <div style={{ transform: `rotate(-8deg) scale(${pop(f, nope)})`, border: `14px solid ${C.red}`, color: C.red, background: 'rgba(255,255,255,0.92)', borderRadius: 28, padding: '6px 54px', fontSize: 150, fontWeight: 900, letterSpacing: 6 }}>
          NOPE
        </div>
      </div>
    </>
  );
};

const QuestionBody: React.FC<{ start: (i: number) => number; pulse?: (i: number) => number }> = ({ start, pulse = () => 1 }) => {
  const f = useCurrentFrame();
  const T = mk(540, 785, 130);
  return (
    <>
      <div style={{ position: 'absolute', left: 50, top: 290, width: 980, boxSizing: 'border-box', background: C.card, borderRadius: 32, padding: '26px 40px', fontSize: 54, fontWeight: 800, lineHeight: 1.35, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        A <b style={{ color: C.primary }}>regular hexagon</b> is cut into <b>24 small triangles</b>. How many triangles <b style={{ color: C.violet }}>of any size</b> are in it?
      </div>
      <Stage>
        <Base T={T} />
      </Stage>
      <div style={{ position: 'absolute', left: 60, top: 1040, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 22 }}>
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
      <QuestionBody start={() => -100} pulse={(i) => choicePulse(f, i)} />
      <CommentBubble />
    </>
  );
};

const FX = 530;
const FY = 735;
const FT = mk(FX, FY, 185);

const Flip: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const shadeAt = (k: number) => at(scene, 0, 0.56) + k * 4;
  const hop0 = at(scene, 1, 0.04);
  const HOP = 9;
  const hop = Math.floor((f - hop0) / HOP); // which side-2 ▲ the outline is on (0…5)
  const bigAt = at(scene, 1, 0.45);
  const sumAt = at(scene, 1, 0.58);
  const zoom = 1 + 0.25 * ease(f, hop0 - 6, 10) - 0.25 * ease(f, sumAt - 8, 10);
  const spin0 = at(scene, 2, 0.08);
  const spin = ease(f, spin0, 45);
  const downAt = at(scene, 2, 0.68);
  let n = 0;
  for (let k = 0; k < 12; k++) if (f >= shadeAt(k)) n++;
  if (f >= hop0) n += Math.min(6, hop + 1);
  if (f >= bigAt) n = 19;
  return (
    <>
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      {[0, 3, 6, 9, 11].map((k) => <Sfx key={k} at={shadeAt(k)} src={SFX.click} volume={0.22} />)}
      <Sfx at={hop0 - 6} src={SFX.whoosh} volume={0.25} />
      {[0, 2, 4, 5].map((k) => <Sfx key={`h${k}`} at={hop0 + k * HOP} src={SFX.click} volume={0.26} />)}
      <Sfx at={bigAt} src={SFX.click} volume={0.3} />
      <Sfx at={spin0} src={SFX.whoosh} volume={0.3} />
      <Sfx at={downAt} src={SFX.click} volume={0.3} />
      <Text x={540} y={240} w={1040} size={84} weight={900} align="center" style={{ ...fadeUp(f, at(scene, 0, 0.2)), opacity: ease(f, at(scene, 0, 0.2), 14) * (1 - (zoom - 1) / 0.25) }}>
        Count only the <span style={{ color: GREEN_D }}>▲</span> ones
      </Text>
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: `${FX}px ${FY}px` }}>
        <Stage>
          <g transform={`rotate(${spin * 180} ${FX} ${FY})`}>
            <Base T={FT} />
            {UPS.map((t, k) => (
              <Pg key={k} pts={ptsOf(t, FT)} fill={C.primary} fo={0.5} op={ease(f, shadeAt(k), 5)} />
            ))}
            {UP2.map((t, k) => {
              const ghost = f >= hop0 && (k < hop || f >= bigAt);
              const on = f >= hop0 && k === hop && f < bigAt;
              return <Pg key={`u${k}`} pts={ptsOf(t, FT)} fill={C.violet} fo={on ? 0.22 : 0.07} stroke={C.violet} w={on ? 11 : 5} op={on ? 1 : ghost ? 0.75 : 0} />;
            })}
            <Pg pts={ptsOf(BIG_UP, FT)} stroke={AMBER} w={13} op={ease(f, bigAt, 8)} />
          </g>
        </Stage>
      </div>
      {/* readout: a running ▲ count, then the sum, then 19 ▼ */}
      <div style={{ position: 'absolute', left: 60, width: 860, top: 1150, display: 'flex', justifyContent: 'center' }}>
        <div style={{ position: 'absolute', opacity: ease(f, shadeAt(0), 6) * fadeTo(f, sumAt, 0, 6), background: GREEN_D, color: '#fff', borderRadius: 24, padding: '6px 40px', fontSize: 72, fontWeight: 900, transform: `scale(${1 + 0.08 * (1 - ease(f, f >= bigAt ? bigAt : f >= hop0 ? hop0 + hop * HOP : shadeAt(n - 1), 6))})` }}>
          ▲ {n}
        </div>
        <div style={{ position: 'absolute', display: 'flex', gap: 18, fontSize: 72, fontWeight: 900, whiteSpace: 'nowrap', ...fadeUp(f, sumAt), opacity: ease(f, sumAt, 8) * fadeTo(f, downAt - 4, 0, 6) }}>
          <span style={{ color: GREEN_D }}>12</span>+<span style={{ color: VIOLET_D }}>6</span>+<span style={{ color: '#c27a00' }}>1</span>= <span>19 <span style={{ color: GREEN_D }}>▲</span></span>
        </div>
        <div style={{ position: 'absolute', transform: `scale(${pop(f, downAt)})`, opacity: ease(f, downAt, 4), background: BLUE_D, color: '#fff', borderRadius: 24, padding: '6px 40px', fontSize: 72, fontWeight: 900, whiteSpace: 'nowrap' }}>
          19 ▼ too!
        </div>
      </div>
    </>
  );
};

/** The answer, the trap (the two big ones), then the CTA pill over the same hexagon as frame 0. */
const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 0, 0.62);
  const chime = at(scene, 0, 0.97);
  const trap = at(scene, 1);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '14px 48px', display: 'flex', alignItems: 'center', gap: 24, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <Tex tex="38" size={116} color="#fff" />
          <span style={{ fontSize: 70, fontWeight: 900 }}>triangles</span>
        </div>
      </div>
      <Text x={540} y={462} w={1000} size={54} weight={900} align="center" style={{ ...fadeUp(f, 4), opacity: ease(f, 4, 10) * fadeTo(f, trap, 0, 6) }}>
        <span style={{ color: GREEN_D }}>19 ▲</span> + <span style={{ color: BLUE_D }}>19 ▼</span>
      </Text>
      <Text x={540} y={462} w={1000} size={54} weight={900} align="center" color={C.red} style={fadeUp(f, at(scene, 1, 0.45))}>
        36 misses these 2 big ones ✗
      </Text>
      <Stage>
        <Tinted />
        <Pg pts={ptsOf(BIG_UP, HT)} stroke={AMBER} w={12} op={ease(f, at(scene, 1, 0.5), 8)} />
        <Pg pts={ptsOf(BIG_DOWN, HT)} stroke={BLUE_D} w={12} op={ease(f, at(scene, 1, 0.68), 8)} />
      </Stage>
      <CtaPill start={at(scene, 2)} y={1225} />
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      <Sfx at={hit - 31} src={SFX.riser} volume={0.3} />
      <Sfx at={trap} src={SFX.buzz} volume={0.2} />
      <Sfx at={at(scene, 1, 0.5)} src={SFX.click} volume={0.25} />
      <Sfx at={at(scene, 1, 0.68)} src={SFX.click} volume={0.25} />
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={360} start={chime} seed={5} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, flip: Flip, reveal: Reveal };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" captions="words" music={MUSIC} /> : null;
