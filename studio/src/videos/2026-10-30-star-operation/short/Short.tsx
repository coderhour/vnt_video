import { staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { FullLessonCard, ShortFrame } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { C } from '../../../lib/theme';
import { Text } from '../../../lib/ui';
import { CHIME, CHOICES, QEXPR, RULE, SLUG, TICK } from '../Composition';
import { AnswerBadge, ChoiceRow, Title, makeThink } from '../../2026-10-30-square-and-cube/short/kit';

export { SLUG };

const Center: React.FC<{ top: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ top, style, children }) => (
  <div style={{ position: 'absolute', left: 0, width: 1080, top, display: 'flex', justifyContent: 'center', whiteSpace: 'nowrap', ...style }}>{children}</div>
);

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const t = at(scene, 0, 0.55);
  return (
    <>
      <Title>
        The <span style={{ color: C.violet }}>star</span> puzzle
      </Title>
      <Center top={420}>
        <div style={{ background: C.card, borderRadius: 32, padding: '30px 40px', boxShadow: '0 8px 30px rgba(30,40,80,0.08)' }}>
          <Tex tex={RULE} size={78} />
        </div>
      </Center>
      <Center top={700}>
        <Tex tex={QEXPR} size={64} />
      </Center>
      <Center top={900} style={{ gap: 28, alignItems: 'center', ...fadeUp(f, t) }}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
            <div style={{ fontSize: 44, fontWeight: 900, padding: '8px 26px', borderRadius: 999, background: i === 3 ? C.green : C.violet, color: '#fff' }}>step {i}</div>
            {i < 3 && <span style={{ fontSize: 50, color: C.muted }}>→</span>}
          </div>
        ))}
      </Center>
      <Text x={540} y={1040} w={900} size={60} weight={900} align="center" color={C.red} style={{ transform: `scale(${pop(f, at(scene, 0, 0.8))})` }}>
        Don't stop early!
      </Text>
    </>
  );
};

const QBody: React.FC = () => (
  <div style={{ position: 'absolute', left: 60, top: 300, width: 860, background: C.card, borderRadius: 32, padding: '30px 20px', boxShadow: '0 8px 30px rgba(30,40,80,0.07)', textAlign: 'center', fontSize: 46, fontWeight: 700, lineHeight: 1.5 }}>
    <Tex tex={RULE} size={64} />
    <div style={{ marginTop: 14 }}>
      Find <b style={{ color: C.violet }}>the whole chain</b>:
    </div>
    <div style={{ whiteSpace: 'nowrap' }}>
      <Tex tex={QEXPR} size={58} />
    </div>
  </div>
);

const Question: SceneComponent = ({ scene }) => (
  <>
    <QBody />
    <ChoiceRow items={CHOICES} top={880} start={(i) => at(scene, 1, 0.15 + i * 0.12)} size={52} />
  </>
);
const Think = makeThink(QBody, TICK);

const SC = ['3', '2', '\\dfrac53', '\\dfrac32'];
const FR = ['\\dfrac12', '\\dfrac13', '\\dfrac14', '\\dfrac15'];
const XS = [165, 380, 595, 810];

const Score: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l1 = at(scene, 1);
  const l2 = at(scene, 2);
  const l3 = at(scene, 3);
  return (
    <>
      <Title size={70}>The score trick</Title>
      {FR.map((t, i) => (
        <div key={t} style={{ position: 'absolute', left: XS[i] - 100, width: 200, top: 400, textAlign: 'center', ...fadeUp(f, 2 + i * 3) }}>
          <Tex tex={t} size={78} />
        </div>
      ))}
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ position: 'absolute', left: XS[i] + 50, width: 115, top: 420, textAlign: 'center', ...fadeUp(f, 6 + i * 3) }}>
          <Tex tex="\star" size={64} color={C.muted} />
        </div>
      ))}
      <Center top={640} style={fadeUp(f, 12)}>
        <Tex tex="\text{score}=\dfrac{1+x}{1-x}" size={64} color={C.violet} />
      </Center>
      {SC.map((t, i) => (
        <div key={t} style={{ position: 'absolute', left: XS[i] - 90, width: 180, top: 850, display: 'flex', justifyContent: 'center', transform: `scale(${pop(f, l1 + 10 + i * 24)})` }}>
          <div style={{ background: C.violet, color: '#fff', borderRadius: 30, padding: '8px 26px' }}>
            <Tex tex={t} size={68} color="#fff" />
          </div>
        </div>
      ))}
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ position: 'absolute', left: XS[i] + 50, width: 115, top: 880, textAlign: 'center', fontSize: 70, fontWeight: 900, color: C.amber, opacity: ease(f, l2 + 14 + i * 14, 8) }}>
          ×
        </div>
      ))}
      <Text x={540} y={1040} w={900} size={52} weight={900} align="center" color={C.amber} style={fadeUp(f, l2 + 4)}>
        star → scores multiply
      </Text>
      <Center top={1130} style={fadeUp(f, l3 + 4)}>
        <Tex tex="3\times2\times\dfrac53\times\dfrac32=15" size={72} />
      </Center>
    </>
  );
};

const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l1 = at(scene, 1);
  const steps = ['\\dfrac{1+x}{1-x}=15', '1+x=15-15x', '16x=14'];
  const chips: [string, string, boolean][] = [['step 1', '\\dfrac57', false], ['step 2', '\\dfrac9{11}', false], ['step 3', '\\dfrac78', true]];
  return (
    <>
      <AnswerBadge label="Answer =" tex="\dfrac78" hit={at(scene, 0, 0.82)} chime={at(scene, 0, 1)} sfx={CHIME} />
      {steps.map((s, i) => (
        <Center key={s} top={[560, 750, 880][i]} style={fadeUp(f, at(scene, 0, 0.08 + i * 0.16))}>
          <Tex tex={s} size={66} />
        </Center>
      ))}
      <div style={{ position: 'absolute', left: 60, width: 860, top: 1010, display: 'flex', justifyContent: 'center', gap: 22 }}>
        {chips.map(([label, tex, ok], i) => (
          <div key={label} style={{ ...fadeUp(f, l1 + i * 10), position: 'relative', background: C.card, borderRadius: 24, padding: '12px 26px', textAlign: 'center', boxShadow: '0 6px 20px rgba(30,40,80,0.1)', border: `5px solid ${ok ? C.green : C.red}`, opacity: (fadeUp(f, l1 + i * 10).opacity as number) * (ok ? 1 : 0.75) }}>
            <div style={{ fontSize: 34, fontWeight: 800, color: C.muted }}>{label}</div>
            <div style={{ opacity: ok ? 1 : 0.35 }}><Tex tex={tex} size={62} /></div>
            {!ok && <div style={{ position: 'absolute', left: 0, right: 0, top: 30, textAlign: 'center', fontSize: 110, fontWeight: 900, color: C.red, opacity: 0.8 }}>✕</div>}
          </div>
        ))}
      </div>
    </>
  );
};

const Cta: SceneComponent = ({ scene }) => (
  <FullLessonCard scene={scene} poster={staticFile(`${SLUG}/short/full.jpg`)} length="7:07" bullets={['Two ways to solve it', 'Every trap explained', 'A new chain to try']} />
);

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, score: Score, reveal: Reveal, cta: Cta };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" /> : null;
