import { Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Countdown } from '../../../lib/PauseCard';
import { Stage } from '../../../lib/grid';
import { FullLessonCard, ShortFrame } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { Cells, CHIME, DOM_COVER, DOM_H, DOM_V, HiCell, LBOX, O, SLUG, TICK, Tile, Tiles, W6, board, zig, type Kind, type RC } from '../Composition';

export { SLUG };

const Title: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Text x={540} y={300} w={980} size={72} weight={900} align="center">
    {children}
  </Text>
);

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const B = O(150, 560, 130);
  const gone = at(scene, 1, 0);
  const l1 = at(scene, 1, 0.1);
  return (
    <>
      <Title>
        Dominoes <span style={{ color: C.violet }}>+ L tiles</span>
      </Title>
      <Stage>
        <Cells cells={board(6)} o={B} />
        <Tiles o={B} list={DOM_COVER.map((cells, i) => ({ cells, kind: 'D' as Kind, t0: 4 + i * 5, t1: gone }))} />
        <Tile cells={LBOX(0, 0, 'br')} o={B} kind="L" t0={l1} />
      </Stage>
      <Text x={540} y={900} w={900} size={72} weight={900} color={C.primary} align="center" style={{ opacity: ease(f, 20, 10) * (1 - ease(f, gone, 8)) }}>
        13 ways
      </Text>
      <Text x={540} y={900} w={900} size={80} weight={900} color={C.violet} align="center" style={fadeUp(f, at(scene, 1, 0.3))}>
        with L tiles: ? ways
      </Text>
    </>
  );
};

const CHOICES = ['13', '50', '53', '59', '117'];

const QuestionBody: React.FC<{ start: (i: number) => number; mark: number }> = ({ start, mark }) => {
  const f = useCurrentFrame();
  const B = O(240, 640, 100);
  const T1 = O(260, 910, 60);
  const T2 = O(560, 890, 60);
  return (
    <>
      <div style={{ position: 'absolute', left: 60, top: 300, width: 860, background: C.card, borderRadius: 32, padding: '28px 40px', fontSize: 50, fontWeight: 700, lineHeight: 1.35, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        How many ways to cover a <Tex tex="2\times 6" size={52} /> board with <b style={{ color: C.primary }}>dominoes</b> and <b style={{ color: C.violet }}>L tiles</b>?
      </div>
      <Stage>
        <Cells cells={board(6)} o={B} />
        <g opacity={mark}>
          <Tile cells={DOM_H(0, 0)} o={T1} kind="D" t0={0} />
          <Tile cells={LBOX(0, 0, 'br')} o={T2} kind="L" t0={0} />
        </g>
      </Stage>
      <div style={{ position: 'absolute', left: 60, top: 1050, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 20 }}>
        {CHOICES.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 10), background: C.card, borderRadius: 18, padding: '10px 28px', boxShadow: '0 4px 14px rgba(30,40,80,0.07)', display: 'flex', alignItems: 'center', gap: 12, fontSize: 52, fontWeight: 800 }}>
            <span style={{ color: C.muted, fontSize: 36 }}>{'ABCDE'[i]}</span>
            {c}
          </div>
        ))}
      </div>
    </>
  );
};

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return <QuestionBody start={(i) => at(scene, 1, 0.25 + i * 0.12)} mark={ease(f, at(scene, 0, 0.5), 10)} />;
};

const Think: SceneComponent = ({ scene }) => (
  <>
    <div style={{ opacity: 0.35 }}>
      <QuestionBody start={() => -100} mark={1} />
    </div>
    <div style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, background: 'rgba(246,247,251,0.6)' }} />
    <Countdown scene={scene} seconds={3} x={540} y={900} tick={TICK} />
  </>
);

const ZU = 90;
const Zigzag: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const a = (i: number, t = 0) => at(scene, i, t);
  const M = O(150, 600, 130);
  const out = a(1, 0);
  const fs = a(2, 0.35);
  const e = ease(f, fs, 16) + ease(f, fs + 34, 16);
  const s = Math.cos(e * Math.PI);
  const rowY = (k: number) => 360 + k * 190;
  return (
    <>
      <Title>{f < out ? 'An L starts a zigzag' : <>Four <span style={{ color: C.violet }}>zigzags</span></>}</Title>
      <Stage>
        <g opacity={fadeTo(f, out, 0, 10)}>
          <Cells cells={board(6)} o={M} />
          <HiCell cell={[0, 0]} o={M} t0={a(0, 0.35)} t1={a(0, 0.6)} />
          <Tile cells={LBOX(0, 0, 'br')} o={M} kind="L" t0={a(0, 0.6)} />
          <HiCell cell={[1, 1]} o={M} t0={a(0, 0.8)} />
        </g>
        {[0, 1, 2, 3].map((k) => {
          const o = O(110, rowY(k) + 80, ZU);
          const st = a(1, 0.08 + k * 0.2);
          const cy = o.oy + ZU;
          return (
            <g key={k} transform={f >= fs ? `translate(0 ${cy}) scale(1 ${s}) translate(0 ${-cy})` : undefined}>
              <Cells cells={board(k + 3)} o={o} opacity={ease(f, st, 10)} />
              <Tiles o={o} list={zig(k, false, st, 4)} />
            </g>
          );
        })}
      </Stage>
      {[0, 1, 2, 3].map((k) => (
        <Text key={k} x={110 + (k + 3) * ZU + 30} y={rowY(k) + 80 + 55} w={300} size={50} weight={900} color={C.violet} style={fadeUp(f, a(1, 0.12 + k * 0.2))}>
          {k + 3} long
        </Text>
      ))}
      <Text x={540} y={1235} w={900} size={64} weight={900} color={C.amber} align="center" style={fadeUp(f, a(2, 0.4))}>
        flip it: a mirror twin ×2
      </Text>
    </>
  );
};

const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 0, 0.78);
  const chime = at(scene, 0, 1);
  const cw = 118;
  const x0 = (1080 - 7 * cw) / 2 - 20;
  const C0 = O(240, 800, 100);
  const cover: { cells: RC[]; kind: Kind }[] = [
    ...zig(0).map((t) => ({ cells: t.cells, kind: t.kind })),
    { cells: DOM_V(3), kind: 'D' },
    { cells: DOM_H(0, 4), kind: 'D' },
    { cells: DOM_H(1, 4), kind: 'D' },
  ];
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 290, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '14px 48px', fontSize: 84, fontWeight: 900, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          53 ways
        </div>
      </div>
      <div style={{ position: 'absolute', left: x0, top: 520, display: 'flex' }}>
        {W6.map((v, i) => {
          const last = i === 6;
          const t = last ? hit : at(scene, 0, 0.1 + i * 0.1);
          return (
            <div key={i} style={{ width: cw, textAlign: 'center', ...fadeUp(f, t, 10) }}>
              <div style={{ fontSize: 40, fontWeight: 800, color: C.muted }}>{i}</div>
              <div style={{ margin: '0 5px', background: last ? C.green : C.card, color: last ? '#fff' : C.ink, borderRadius: 18, fontSize: 60, fontWeight: 900, padding: '10px 0', boxShadow: '0 4px 14px rgba(30,40,80,0.1)' }}>{v}</div>
            </div>
          );
        })}
      </div>
      <Text x={540} y={470} w={900} size={40} weight={800} color={C.muted} align="center" style={fadeUp(f, at(scene, 0, 0.05))}>
        ways to cover a board of length…
      </Text>
      <Stage>
        <Cells cells={board(6)} o={C0} />
        <Tiles o={C0} list={cover.map((t, i) => ({ ...t, t0: at(scene, 1, 0.1 + i * 0.05) }))} />
      </Stage>
      <Text x={540} y={1030} w={900} size={56} weight={900} color={C.violet} align="center" style={fadeUp(f, at(scene, 1, 0.55))}>
        Choice C. Not 13!
      </Text>
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={380} start={chime} seed={7} />
    </>
  );
};

const Cta: SceneComponent = ({ scene }) => (
  <FullLessonCard scene={scene} poster={staticFile(`${SLUG}/short/full.jpg`)} length="6:59" bullets={['Two ways to count', 'Every trap explained', 'A new tile to try']} />
);

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, zigzag: Zigzag, reveal: Reveal, cta: Cta };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 10-style" /> : null;
