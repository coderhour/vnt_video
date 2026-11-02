import { Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { NUNITO } from '../../../lib/fonts';
import { Countdown } from '../../../lib/PauseCard';
import { Stage } from '../../../lib/grid';
import { FullLessonCard, ShortFrame } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { BOY, CH, CHIME, GIRL, SLUG, TICK } from '../Composition';

export { SLUG };

/** A kid token (own copy: the long video's one is a landscape helper). */
const Kid: React.FC<{ x: number; y: number; k: 'G' | 'B'; r?: number; s?: number; o?: number; ring?: string }> = ({ x, y, k, r = 44, s = 1, o = 1, ring }) =>
  s <= 0 || o <= 0 ? null : (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
      {ring && <circle r={r + 10} fill="none" stroke={ring} strokeWidth={7} />}
      <circle r={r} fill={k === 'G' ? GIRL : BOY} />
      <text y={2} fill="#fff" fontFamily={NUNITO} fontWeight={900} fontSize={r * 1.05} textAnchor="middle" dominantBaseline="central">
        {k}
      </text>
    </g>
  );

const KidRow: React.FC<{ order: string; y: number; r?: number; sp?: number; start?: (i: number) => number; ringed?: number[] }> = ({ order, y, r = 40, sp = 105, start, ringed = [] }) => {
  const f = useCurrentFrame();
  return (
    <>
      {order.split('').map((c, i) => (
        <Kid key={i} x={540 + (i - (order.length - 1) / 2) * sp} y={y} k={c as 'G' | 'B'} r={r} s={start ? pop(f, start(i)) : 1} ring={ringed.includes(i) ? C.red : undefined} />
      ))}
    </>
  );
};

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const t = at(scene, 1, 0.45);
  return (
    <>
      <Text x={540} y={300} w={980} size={74} weight={900} align="center">
        Keep the <span style={{ color: GIRL }}>girls</span> apart!
      </Text>
      <Stage>
        <KidRow order="BGGBBGBB" y={640} r={42} sp={108} ringed={f >= t ? [1, 2] : []} />
      </Stage>
      <Text x={540} y={760} w={900} size={60} weight={900} color={C.red} align="center" style={fadeUp(f, t)}>
        touching = not allowed
      </Text>
      <Text x={540} y={900} w={900} size={56} weight={900} color={C.muted} align="center" style={fadeUp(f, at(scene, 1, 0.1))}>
        5 boys, 3 girls, random order
      </Text>
    </>
  );
};

const QuestionBody: React.FC<{ start: (i: number) => number }> = ({ start }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 60, top: 300, width: 860, background: C.card, borderRadius: 32, padding: '28px 40px', fontSize: 48, fontWeight: 700, lineHeight: 1.4, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        <b style={{ color: BOY }}>5 boys</b> and <b style={{ color: GIRL }}>3 girls</b> in a random order. Chance that <b>no two girls</b> stand together?
      </div>
      <Stage>
        <KidRow order="BGBBGBGB" y={690} r={40} sp={108} />
      </Stage>
      <div style={{ position: 'absolute', left: 40, top: 850, width: 900, display: 'flex', justifyContent: 'center', gap: 16 }}>
        {CH.map((c, i) => (
          <div key={i} style={{ ...fadeUp(f, start(i), 10), background: C.card, borderRadius: 18, padding: '8px 18px', boxShadow: '0 4px 14px rgba(30,40,80,0.07)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: C.muted, fontSize: 30, fontWeight: 800 }}>{'ABCDE'[i]}</span>
            <Tex tex={c} size={52} />
          </div>
        ))}
      </div>
    </>
  );
};

const Question: SceneComponent = ({ scene }) => <QuestionBody start={(i) => at(scene, 1, 0.5 + i * 0.08)} />;

const Think: SceneComponent = ({ scene }) => (
  <>
    <div style={{ opacity: 0.35 }}>
      <QuestionBody start={() => -100} />
    </div>
    <div style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, background: 'rgba(246,247,251,0.6)' }} />
    <Countdown scene={scene} seconds={3} x={540} y={900} tick={TICK} />
  </>
);

const BX = (i: number) => 190 + i * 150; // boy i
const GX = (j: number) => 115 + j * 150; // gap j (0 = left end, 5 = right end)
const Y = 680;
const CHOSEN = [0, 2, 5];

const Gaps: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l1 = at(scene, 1);
  const l2 = at(scene, 2);
  const slot = (j: number) => ease(f, at(scene, 0, 0.45 + j * 0.09), 8);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 300, textAlign: 'center', fontSize: 70, fontWeight: 900 }}>
        <div style={{ position: 'absolute', width: 1080, opacity: fadeTo(f, l1) }}>
          <span style={{ color: BOY }}>5 boys</span> make <span style={{ color: C.primary }}>6 gaps</span>
        </div>
        <div style={{ position: 'absolute', width: 1080, opacity: ease(f, l1, 10) * fadeTo(f, l2) }}>
          One girl <span style={{ color: GIRL }}>per gap</span>
        </div>
        <div style={{ position: 'absolute', width: 1080, opacity: ease(f, l2, 10) }}>
          Choose <span style={{ color: GIRL }}>3</span> of the <span style={{ color: C.primary }}>6</span> gaps
        </div>
      </div>
      <Stage>
        {[0, 1, 2, 3, 4].map((i) => (
          <Kid key={i} x={BX(i)} y={Y} k="B" r={44} s={pop(f, at(scene, 0, 0.12 + i * 0.07))} />
        ))}
        {[0, 1, 2, 3, 4, 5].map((j) => {
          const o = slot(j);
          const filled = f >= at(scene, 2, 0.12 + CHOSEN.indexOf(j) * 0.14) && CHOSEN.includes(j);
          return (
            <g key={j}>
              {o > 0 && <circle cx={GX(j)} cy={Y} r={28} fill="#fff" fillOpacity={0.7 * o} stroke={C.primary} strokeWidth={5} strokeDasharray="10 8" opacity={o * (filled ? 0 : 1)} />}
              {o > 0 && (
                <text x={GX(j)} y={Y + 92} fill={C.primary} opacity={o} fontFamily={NUNITO} fontWeight={900} fontSize={50} textAnchor="middle">
                  {j + 1}
                </text>
              )}
              {CHOSEN.includes(j) && <Kid x={GX(j)} y={Y} k="G" r={28} s={pop(f, at(scene, 2, 0.12 + CHOSEN.indexOf(j) * 0.14))} />}
            </g>
          );
        })}
        {/* line 1: two girls in one gap would touch */}
        <g opacity={ease(f, l1 + 4, 8) * fadeTo(f, at(scene, 1, 0.75), 0, 8)}>
          <Kid x={GX(3) - 26} y={Y - 140} k="G" r={30} />
          <Kid x={GX(3) + 26} y={Y - 140} k="G" r={30} ring={C.red} />
          <text x={GX(3)} y={Y - 205} fill={C.red} fontFamily={NUNITO} fontWeight={900} fontSize={50} textAnchor="middle">touch! ✗</text>
        </g>
      </Stage>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 800, display: 'flex', justifyContent: 'center', ...fadeUp(f, at(scene, 2, 0.45)) }}>
        <Tex tex={'\\dfrac{6\\cdot5\\cdot4}{6}=20'} size={80} color={C.green} />
      </div>
      <Text x={540} y={1040} w={900} size={56} weight={900} color={C.muted} align="center" style={fadeUp(f, at(scene, 2, 0.7))}>
        out of <span style={{ color: C.ink }}>56</span> sets of spots
      </Text>
    </>
  );
};

const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 0, 0.62);
  const chime = at(scene, 0, 0.97);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 285, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '12px 44px', display: 'flex', alignItems: 'center', gap: 22, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <Tex tex={'\\dfrac{20}{56}=\\dfrac{5}{14}'} size={92} color="#fff" />
        </div>
      </div>
      <Stage>
        <KidRow order="GBBGBBBG" y={700} r={40} sp={108} />
      </Stage>
      <Text x={540} y={830} w={900} size={52} weight={900} color={C.muted} align="center" style={fadeUp(f, at(scene, 0, 0.3))}>
        both ends can hold a girl
      </Text>
      <Text x={540} y={960} w={900} size={56} weight={900} color={C.red} align="center" style={fadeUp(f, at(scene, 1, 0.15))}>
        Don't forget the 2 end gaps!
      </Text>
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={380} start={chime} seed={5} />
    </>
  );
};

const Cta: SceneComponent = ({ scene }) => (
  <FullLessonCard scene={scene} poster={staticFile(`${SLUG}/short/full.jpg`)} length="6:34" bullets={['Why count spots, not names', 'A second way to count', 'Every trap explained']} />
);

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, gaps: Gaps, reveal: Reveal, cta: Cta };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" /> : null;
