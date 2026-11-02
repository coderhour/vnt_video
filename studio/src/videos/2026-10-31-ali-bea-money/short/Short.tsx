import { Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Countdown } from '../../../lib/PauseCard';
import { FullLessonCard, ShortFrame } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { ALI, ALI_D, BEA, BEA_D, CH, COIN, SLUG, Wallet, chime, tick } from '../Composition';

export { SLUG };

const PW = 100;
const STEP = 106;
const BH = 90;
const X0 = 290;
const px = (i: number) => X0 + i * STEP;
const YA = 540;
const YB = 700;

const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

const Part: React.FC<{ x: number; y: number; color: string; op?: number; scale?: number; dashed?: boolean; label?: string; ring?: boolean }> = ({ x, y, color, op = 1, scale = 1, dashed, label, ring }) =>
  op <= 0 ? null : (
    <div
      style={{
        position: 'absolute', left: x, top: y, width: PW, height: BH, borderRadius: 16, boxSizing: 'border-box', opacity: op, transform: `scale(${scale})`,
        background: dashed ? 'transparent' : color, border: dashed ? `5px dashed ${color}` : ring ? `6px solid ${COIN}` : undefined,
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 42, fontWeight: 900,
      }}
    >
      {label}
    </div>
  );

const CPill: React.FC<{ y: number; color: string; size: number; style: React.CSSProperties; children: React.ReactNode }> = ({ y, color, size, style, children }) => (
  <div style={{ position: 'absolute', left: 0, width: 1080, top: y, display: 'flex', justifyContent: 'center' }}>
    <div style={{ background: color, color: '#fff', borderRadius: 999, padding: '10px 36px', fontSize: size, fontWeight: 900, whiteSpace: 'nowrap', ...style }}>{children}</div>
  </div>
);

const Name: React.FC<{ y: number; name: string; color: string; op?: number }> = ({ y, name, color, op = 1 }) => (
  <div style={{ position: 'absolute', left: 40, top: y, width: 230, height: BH, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', fontSize: 64, fontWeight: 900, color, opacity: op }}>{name}</div>
);

const Side: React.FC<{ y: number; text: string; color: string; op?: number }> = ({ y, text, color, op = 1 }) => (
  <div style={{ position: 'absolute', left: 840, top: y, height: BH, display: 'flex', alignItems: 'center', fontSize: 60, fontWeight: 900, color, opacity: op, whiteSpace: 'nowrap' }}>{text}</div>
);

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Text x={540} y={300} w={980} size={84} weight={900} align="center">
        <span style={{ color: ALI_D }}>Ali</span> + <span style={{ color: BEA_D }}>Bea</span> = $ ?
      </Text>
      <Wallet x={110} y={480} w={340} h={220} name="Ali" start={4} size={70} />
      <Wallet x={540} y={480} w={340} h={220} name="Bea" start={10} size={70} />
      <CPill y={790} color={ALI_D} size={52} style={fadeUp(f, at(scene, 0, 0.5))}>Ali gives Bea 20%</CPill>
      <CPill y={900} color={BEA_D} size={52} style={fadeUp(f, at(scene, 1, 0.1))}>Bea gives Ali $10</CPill>
    </>
  );
};

const QuestionBody: React.FC<{ start: (i: number) => number }> = ({ start }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 60, top: 300, width: 860, background: C.card, borderRadius: 32, padding: '32px 40px', fontSize: 50, fontWeight: 700, lineHeight: 1.4, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', boxSizing: 'border-box' }}>
        <b style={{ color: ALI_D }}>Ali</b> gives <b style={{ color: BEA_D }}>Bea</b> 20%: they have the <b>same</b> amount.
        <br />
        Instead, <b style={{ color: BEA_D }}>Bea</b> gives <b style={{ color: ALI_D }}>Ali</b> $10: Ali has <b>twice</b> as much.
        <br />
        <b>How much together?</b>
      </div>
      <div style={{ position: 'absolute', left: 60, top: 860, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 20 }}>
        {CH.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 10), background: C.card, borderRadius: 18, padding: '10px 24px', boxShadow: '0 4px 14px rgba(30,40,80,0.07)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ color: C.muted, fontSize: 34, fontWeight: 800 }}>{'ABCDE'[i]}</span>
            <Tex tex={`\\$${c}`} size={48} />
          </div>
        ))}
      </div>
    </>
  );
};

const Question: SceneComponent = ({ scene }) => <QuestionBody start={(i) => at(scene, 2, 0.1 + i * 0.15)} />;

const Think: SceneComponent = ({ scene }) => (
  <>
    <div style={{ opacity: 0.35 }}>
      <QuestionBody start={() => -100} />
    </div>
    <div style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, background: 'rgba(246,247,251,0.6)' }} />
    <Countdown scene={scene} seconds={3} x={540} y={1000} tick={tick} />
  </>
);

const Bars: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const a0 = at(scene, 0, 0.35);
  const down = ease(f, at(scene, 1, 0.05), 20);
  const back = ease(f, at(scene, 2, 0), 20);
  const t = down - back;
  const bea = at(scene, 1, 0.3);
  const counts = f < at(scene, 2, 0.1);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 300, display: 'flex', justifyContent: 'center', ...fadeUp(f, 0) }}>
        <Tex tex="20\% = \dfrac{1}{5}" size={72} />
      </div>
      <Name y={YA} name="Ali" color={ALI_D} op={ease(f, a0 - 6, 10)} />
      {[0, 1, 2, 3].map((i) => <Part key={i} x={px(i)} y={YA} color={ALI} scale={pop(f, a0 + i * 6)} op={Math.min(1, pop(f, a0 + i * 6) * 2)} />)}
      <Part x={px(4)} y={YA} color={ALI} dashed op={t > 0.05 ? 0.6 : 0} />
      <Name y={YB} name="Bea" color={BEA_D} op={ease(f, bea - 6, 10)} />
      {[0, 1, 2].map((i) => <Part key={i} x={px(i)} y={YB} color={BEA} scale={pop(f, bea + i * 5)} op={Math.min(1, pop(f, bea + i * 5) * 2)} />)}
      <Part x={px(3)} y={YB} color={BEA} dashed op={t < 0.95 && f > bea ? 0.5 : 0} />
      <Part x={lerp(px(4), px(3), t)} y={lerp(YA, YB, t)} color={ALI} scale={pop(f, a0 + 24)} op={Math.min(1, pop(f, a0 + 24) * 2)} ring={t > 0.5} />
      <Text x={px(3) - 40} y={YB + 105} w={400} size={44} weight={900} color={COIN} style={{ opacity: ease(f, at(scene, 1, 0.45), 8) * (1 - ease(f, at(scene, 2), 8)) }}>
        ↑ the gift
      </Text>
      <Side y={YA} text={counts ? '4' : '5'} color={ALI_D} op={ease(f, at(scene, 1, 0.65), 8)} />
      <Side y={YB} text={counts ? '4' : '3'} color={BEA_D} op={ease(f, at(scene, 1, 0.65), 8)} />
      <Text x={540} y={880} w={900} size={60} weight={900} color={C.muted} align="center" style={{ opacity: ease(f, at(scene, 1, 0.7), 8) * (1 - ease(f, at(scene, 2), 8)) }}>
        4 parts = 4 parts: equal!
      </Text>
      <CPill y={880} color={C.primary} size={64} style={fadeUp(f, at(scene, 2, 0.5))}>
        5 + 3 = 8 parts
      </CPill>
    </>
  );
};

const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const t = (x: number) => at(scene, 0, x);
  const hit = t(0.78);
  const end = at(scene, 0, 1);
  const lab = (i: number) => pop(f, t(0.12) + i * 4);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 300, display: 'flex', justifyContent: 'center', opacity: fadeTo(f, hit - 4), ...fadeUp(f, t(0.05)) }}>
        <Tex tex="1\text{ part} = \$30" size={84} />
      </div>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '16px 48px', fontSize: 84, fontWeight: 900, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>$240 together</div>
      </div>
      <Name y={YA} name="Ali" color={ALI_D} />
      {[0, 1, 2, 3, 4].map((i) => <Part key={i} x={px(i)} y={YA} color={ALI} label="$30" scale={lab(i)} />)}
      <Name y={YB} name="Bea" color={BEA_D} />
      {[0, 1, 2].map((i) => <Part key={i} x={px(i)} y={YB} color={BEA} label="$30" scale={lab(5 + i)} />)}
      <Text x={540} y={870} w={900} size={72} weight={900} align="center" style={fadeUp(f, t(0.6))}>
        8 × $30 = $240
      </Text>
      <Side y={YA} text="$150" color={ALI_D} op={ease(f, at(scene, 1, 0.1), 8)} />
      <Side y={YB} text="$90" color={BEA_D} op={ease(f, at(scene, 1, 0.5), 8)} />
      <Sequence from={end} durationInFrames={60} layout="none">
        <Audio src={chime} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={380} start={end} seed={11} />
    </>
  );
};

const Cta: SceneComponent = ({ scene }) => (
  <FullLessonCard scene={scene} poster={staticFile(`${SLUG}/short/full.jpg`)} length="6:14" bullets={['Both clues, step by step', 'A second way with letters', 'Every trap, and a new twist']} />
);

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, bars: Bars, reveal: Reveal, cta: Cta };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" /> : null;
