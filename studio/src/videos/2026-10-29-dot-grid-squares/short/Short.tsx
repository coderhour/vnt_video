import { Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop, range } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Countdown } from '../../../lib/PauseCard';
import { Dots, Poly, Stage, boxSpots, boxSquare, makeGrid, type Pt } from '../../../lib/grid';
import { FullLessonCard, ShortFrame } from '../../../lib/Short';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { CHIME, CHOICES, COLS, ROWS, SLUG, TICK, TILT, sq } from '../Composition';

export { SLUG };

const G = makeGrid(240, 480, 150);

const Title: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Text x={540} y={300} w={980} size={76} weight={900} align="center">
    {children}
  </Text>
);

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const more = at(scene, 1, 0.55);
  return (
    <>
      <Title>
        How many <span style={{ color: C.primary }}>squares</span>?
      </Title>
      <Stage>
        <Poly pts={sq(0, 0, 1).map(G)} color={C.primary} fill={C.primary} progress={ease(f, 20, 14)} />
        <Poly pts={sq(0, 1, 2).map(G)} color={C.primary} fill={C.primary} progress={ease(f, 36, 14)} />
        <Poly pts={boxSquare(2, 0, 2, 1).map(G)} color={C.violet} fill={C.violet} width={9} progress={ease(f, more, 16)} />
        <Dots cols={COLS} rows={ROWS} at={G} />
      </Stage>
      <Text x={330} y={1010} w={400} size={120} weight={900} color={C.muted} align="center" style={{ ...fadeUp(f, at(scene, 1, 0.1)), textDecoration: f > more ? 'line-through' : 'none' }}>
        20?
      </Text>
      <Text x={730} y={1030} w={420} size={96} weight={900} color={C.violet} align="center" style={fadeUp(f, more)}>
        MORE!
      </Text>
    </>
  );
};

const QG = makeGrid(335, 640, 100);

const QuestionBody: React.FC<{ start: (i: number) => number }> = ({ start }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 60, top: 300, width: 860, background: C.card, borderRadius: 32, padding: '28px 40px', fontSize: 50, fontWeight: 700, lineHeight: 1.4, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        <b style={{ color: C.primary }}>20 dots</b>. How many <b style={{ color: C.violet }}>squares</b> have dot corners? <b>Tilted ones too!</b>
      </div>
      <Stage>
        <Dots cols={COLS} rows={ROWS} at={QG} r={11} />
        <Poly pts={boxSquare(1, 0, 2, 1).map(QG)} color={C.violet} fill={C.violet} width={8} progress={ease(f, 40, 16)} />
      </Stage>
      <div style={{ position: 'absolute', left: 60, top: 1000, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 20 }}>
        {CHOICES.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 10), background: C.card, borderRadius: 18, padding: '10px 36px', boxShadow: '0 4px 14px rgba(30,40,80,0.07)', display: 'flex', alignItems: 'center', gap: 14, fontSize: 52, fontWeight: 800 }}>
            <span style={{ color: C.muted, fontSize: 34 }}>{'ABCDE'[i]}</span>
            {c}
          </div>
        ))}
      </div>
    </>
  );
};

const Question: SceneComponent = ({ scene }) => <QuestionBody start={(i) => at(scene, 2, 0.1 + i * 0.12)} />;

const Think: SceneComponent = ({ scene }) => (
  <>
    <div style={{ opacity: 0.35 }}>
      <QuestionBody start={() => -100} />
    </div>
    <div style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, background: 'rgba(246,247,251,0.6)' }} />
    <Countdown scene={scene} seconds={3} x={540} y={900} tick={TICK} />
  </>
);

const Tilt: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const small = [at(scene, 2, 0.05), at(scene, 2, 0.95)] as const;
  const big = [at(scene, 3, 0.05), at(scene, 3, 0.55)] as const;
  const spots = boxSpots(COLS, ROWS, 2);
  const per = (small[1] - small[0]) / spots.length;
  const si = Math.min(spots.length - 1, Math.max(0, Math.floor((f - small[0]) / per)));
  const smallOut = fadeTo(f, at(scene, 3, 0));
  const tilesOut = fadeTo(f, at(scene, 1, 0));
  const bigSpots = boxSpots(COLS, ROWS, 3);
  const bi = f < big[0] + (big[1] - big[0]) / 2 ? 0 : 1;
  const chip = (label: string, color: string, start: number, y: number) => (
    <div style={{ position: 'absolute', left: 120, top: y, display: 'flex', alignItems: 'center', gap: 24, fontSize: 60, fontWeight: 900, color, ...fadeUp(f, start) }}>
      {label}
    </div>
  );
  return (
    <>
      <Title>{f < at(scene, 1) ? 'Upright squares' : <span style={{ color: C.violet }}>Tilted squares</span>}</Title>
      <Stage>
        <g opacity={tilesOut}>
          {range(12).map((i) => (
            <Poly key={i} pts={sq((i % 4) + 0.07, Math.floor(i / 4) + 0.07, 0.86).map(G)} color={C.primary} width={4} fill={C.primary} fillOpacity={0.25} progress={ease(f, 4 + i * 4, 10)} />
          ))}
        </g>
        {f >= at(scene, 1) && f < small[0] && <Poly pts={boxSquare(0, 0, 2, 1).map(G)} color={C.violet} fill={C.violet} width={9} progress={ease(f, at(scene, 1, 0.15), 16)} />}
        {f >= at(scene, 1, 0.5) && f < small[0] && <Poly pts={sq(0, 0, 2).map(G)} color={C.ink} width={4} dashed progress={ease(f, at(scene, 1, 0.5), 12)} />}
        {f >= small[0] && (
          <g opacity={smallOut}>
            {spots.slice(0, si).map((s, j) => (
              <Poly key={j} pts={boxSquare(s[0], s[1], 2, 1).map(G)} color={C.violet} width={4} opacity={0.3} />
            ))}
            <Poly pts={sq(spots[si][0], spots[si][1], 2).map(G)} color={C.ink} width={4} dashed />
            <Poly pts={boxSquare(spots[si][0], spots[si][1], 2, 1).map(G)} color={C.violet} fill={C.violet} width={9} />
          </g>
        )}
        {f >= big[0] && (
          <g opacity={ease(f, big[0], 8)}>
            {bigSpots.slice(0, bi + 1).map((s, j) => (
              <g key={j}>
                <Poly pts={sq(s[0], s[1], 3).map(G)} color={C.ink} width={4} dashed />
                {[1, 2].map((a) => (
                  <Poly key={a} pts={boxSquare(s[0], s[1], 3, a).map(G)} color={TILT[a - 1]} fill={TILT[a - 1]} width={8} progress={ease(f, big[0] + j * 25 + (a - 1) * 10, 14)} />
                ))}
              </g>
            ))}
          </g>
        )}
        <Dots cols={COLS} rows={ROWS} at={G} />
      </Stage>
      {chip('20 upright', C.primary, at(scene, 0, 0.6), 990)}
      {chip(`+ ${f < small[1] ? Math.min(6, 1 + Math.max(0, si)) : 6} small tilted`, C.violet, small[0], 1070)}
      {chip('+ 4 big tilted', C.blue, big[0] + 10, 1150)}
    </>
  );
};

const RG = makeGrid(240, 480, 150);

const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const chime = at(scene, 0, 1);
  const hit = at(scene, 0, 0.12);
  const spots2 = boxSpots(COLS, ROWS, 2);
  const spots3 = boxSpots(COLS, ROWS, 3);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '12px 56px', fontSize: 110, fontWeight: 900, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>30 squares</div>
      </div>
      <Stage>
        {range(12).map((i) => (
          <Poly key={i} pts={sq((i % 4) + 0.07, Math.floor(i / 4) + 0.07, 0.86).map(RG)} color={C.primary} width={3} fill={C.primary} fillOpacity={0.15} opacity={0.5} />
        ))}
        {spots2.map((s, j) => (
          <Poly key={j} pts={boxSquare(s[0], s[1], 2, 1).map(RG)} color={C.violet} width={5} fill={C.violet} fillOpacity={0.12} progress={ease(f, at(scene, 1, 0.1) + j * 3, 10)} />
        ))}
        {spots3.flatMap((s, j) => [1, 2].map((a) => (
          <Poly key={`${j}${a}`} pts={boxSquare(s[0], s[1], 3, a).map(RG)} color={TILT[a - 1]} width={5} fill={TILT[a - 1]} fillOpacity={0.12} progress={ease(f, at(scene, 1, 0.1) + 20 + (j * 2 + a) * 3, 10)} />
        )))}
        <Dots cols={COLS} rows={ROWS} at={RG} />
      </Stage>
      <Text x={540} y={1010} w={900} size={64} weight={900} color={C.violet} align="center" style={fadeUp(f, at(scene, 1, 0.1))}>
        A third are tilted!
      </Text>
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={380} start={chime} seed={5} />
    </>
  );
};

const Cta: SceneComponent = ({ scene }) => (
  <FullLessonCard scene={scene} poster={staticFile(`${SLUG}/short/full.jpg`)} length="6:49" bullets={['Two ways to count them all', 'Every trap explained', 'A bigger grid to try']} />
);

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, tilt: Tilt, reveal: Reveal, cta: Cta };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" /> : null;
