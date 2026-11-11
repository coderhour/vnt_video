import { interpolate, staticFile, useCurrentFrame } from 'remotion';
import { clamp, ease, fadeTo, fadeUp, range } from '../../lib/anim';
import { Explainer, at, type SceneComponent, type Timeline } from '../../lib/Explainer';
import { Countdown } from '../../lib/PauseCard';
import { Dots, Poly, Stage, Step, XMark, boxSpots, boxSquare, makeGrid, type Pt } from '../../lib/grid';
import { PACIFICO, ZH_FONT } from '../../lib/fonts';
import { Answer, Check, Choices, Confetti, Mark, Pill, Row, Text } from '../../lib/ui';
import { SignOff } from '../../lib/Brand';
import { C } from '../../lib/theme';

export const SLUG = '2026-10-29-dot-grid-squares-zh';
export const CHIME = staticFile(`${SLUG}/sfx/fs-541985.mp3`); // Freesound CC0, see sfx/FREESOUND-CREDITS.md
export const TICK = staticFile(`${SLUG}/sfx/fs-668355.mp3`);

// The question: 5 dots across, 4 down. The variant: 5 × 5.
export const COLS = 5;
export const ROWS = 4;
export const TILT = [C.violet, C.blue]; // a = 1, a = 2 tilted squares

// ---------- small building blocks ----------

/** Upright square of side k with top-left (x, y), in grid coordinates. */
export const sq = (x: number, y: number, k: number) => boxSquare(x, y, k, 0);

/** A shape sliding through `spots`, leaving faint copies behind. `draw` renders it at a grid spot. */
const Slide: React.FC<{ spots: Pt[]; draw: (p: Pt, ghost: boolean) => React.ReactNode; start: number; end: number; opacity?: number }> = ({ spots, draw, start, end, opacity = 1 }) => {
  const f = useCurrentFrame();
  if (f < start || opacity <= 0) return null;
  const step = (end - start) / spots.length;
  const i = Math.min(spots.length - 1, Math.floor((f - start) / step));
  const move = ease(f, start + i * step, Math.min(14, step * 0.5));
  const prev = spots[Math.max(0, i - 1)];
  const cur = spots[i];
  const pos: Pt = i === 0 ? cur : [prev[0] + (cur[0] - prev[0]) * move, prev[1] + (cur[1] - prev[1]) * move];
  return (
    <g opacity={opacity}>
      {spots.slice(0, i).map((s, j) => (
        <g key={j} opacity={0.25}>
          {draw(s, true)}
        </g>
      ))}
      <g opacity={ease(f, start, 12)}>{draw(pos, false)}</g>
    </g>
  );
};

/** How many spots a Slide has reached: the number its ×n counter shows. */
const slideCount = (f: number, start: number, end: number, n: number) =>
  Math.min(n, 1 + Math.floor(Math.max(0, f - start) / ((end - start) / n)));

const upright = (k: number, grid: (p: Pt) => Pt, color: string) => (p: Pt, ghost: boolean) => (
  <Poly pts={sq(p[0], p[1], k).map(grid)} color={color} width={ghost ? 4 : 8} fill={ghost ? undefined : color} fillOpacity={0.12} />
);

const Counter: React.FC<{ x: number; y: number; n: number; style: React.CSSProperties; color: string }> = ({ x, y, n, style, color }) => (
  <div style={{ position: 'absolute', left: x, top: y, fontSize: 64, fontWeight: 900, color, ...style }}>×{n}</div>
);

// ---------- scenes ----------

const Intro: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = makeGrid(960 - 280, 230, 140);
  const more = at(scene, 1, 0.55);
  return (
    <>
      <Text x={960} y={100} w={1400} size={84} weight={900} align="center" style={fadeUp(f, 0)}>
        有多少个正方形？
      </Text>
      <Stage>
        <Poly pts={sq(0, 0, 1).map(g)} color={C.primary} fill={C.primary} progress={ease(f, 30, 16)} />
        <Poly pts={sq(0, 1, 2).map(g)} color={C.primary} fill={C.primary} progress={ease(f, 48, 16)} />
        <Poly pts={boxSquare(2, 0, 2, 1).map(g)} color={C.violet} fill={C.violet} progress={ease(f, more, 16)} />
        <Dots cols={COLS} rows={ROWS} at={g} start={0} />
      </Stage>
      <Text x={1570} y={330} w={420} size={110} weight={900} color={C.muted} align="center" style={{ ...fadeUp(f, at(scene, 1, 0.1)), textDecoration: f > more ? 'line-through' : 'none' }}>
        20?
      </Text>
      <Text x={1570} y={480} w={420} size={80} weight={900} color={C.violet} align="center" style={fadeUp(f, more)}>
        还有更多！
      </Text>
      <div style={{ position: 'absolute', left: 260, top: 700, ...fadeUp(f, at(scene, 2)) }}>
        <div style={{ fontFamily: PACIFICO, fontSize: 64, color: C.violet }}>Vantee</div>
        <div style={{ fontSize: 34, fontWeight: 700, color: C.muted, marginTop: -6 }}>你的数学小导师</div>
      </div>
    </>
  );
};

export const CHOICES = ['20', '24', '26', '30', '40'];

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = makeGrid(1250, 250, 110);
  const pulse = (start: number) => 1 + 0.35 * Math.sin(Math.PI * Math.min(1, Math.max(0, (f - start) / 20)));
  return (
    <>
      <div style={{ position: 'absolute', left: 100, top: 160, width: 960, background: C.card, borderRadius: 32, padding: '44px 52px', fontSize: 46, fontWeight: 600, lineHeight: 1.55, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', ...fadeUp(f, 0) }}>
        图中有 <Mark on={at(scene, 1, 0.2)}>20 个点，排成 4 行，每行 5 个</Mark>，
        <Mark on={at(scene, 2, 0.2)}>相邻两点相距 1 个单位</Mark>。
        <Mark on={at(scene, 3, 0.1)}>有多少个正方形的 4 个顶点都在点上？</Mark>
        <Mark on={at(scene, 4, 0.3)}>各种大小的正方形都要数，包括斜着的</Mark>。
      </div>
      <Choices x={130} y={690} items={CHOICES} start={(i) => at(scene, 5, 0.12 + i * 0.17)} />
      <Stage>
        <g style={{ transformOrigin: '1470px 415px', transform: `scale(${pulse(at(scene, 1, 0.3))})` }}>
          <Dots cols={COLS} rows={ROWS} at={g} start={4} r={9} />
        </g>
        <g opacity={ease(f, at(scene, 2, 0.3), 12)}>
          <Step a={g([0, 3.35])} b={g([1, 3.35])} label="1" color={C.primary} opacity={1} dy={40} />
        </g>
        <Poly pts={boxSquare(1, 0, 2, 1).map(g)} color={C.violet} fill={C.violet} progress={ease(f, at(scene, 4, 0.6), 16)} />
      </Stage>
    </>
  );
};

const Asked: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = makeGrid(300, 240, 140);
  const ring = (p: Pt, i: number) => {
    const t = ease(f, at(scene, 1, 0.5) + i * 4, 12) * fadeTo(f, at(scene, 2, 0.4));
    const [cx, cy] = g(p);
    return <circle key={i} cx={cx} cy={cy} r={26} fill="none" stroke={C.amber} strokeWidth={6} opacity={t} />;
  };
  return (
    <>
      <Stage>
        {sq(3, 0, 1).map(ring)}
        <Poly pts={sq(3, 0, 1).map(g)} color={C.primary} fill={C.primary} progress={ease(f, at(scene, 2, 0.15), 16)} />
        <Poly pts={sq(0, 1, 2).map(g)} color={C.primary} fill={C.primary} progress={ease(f, at(scene, 3, 0.45), 18)} />
        <Poly pts={boxSquare(2, 1, 2, 1).map(g)} color={C.violet} fill={C.violet} progress={ease(f, at(scene, 4, 0.2), 18)} />
        <Dots cols={COLS} rows={ROWS} at={g} />
      </Stage>
      <Check x={1080} y={250} start={at(scene, 2, 0.15)}>小正方形</Check>
      <Check x={1080} y={350} start={at(scene, 3, 0.45)}>更大的正方形</Check>
      <Check x={1080} y={450} start={at(scene, 4, 0.2)}>斜着的正方形</Check>
      <Check x={1080} y={550} start={at(scene, 5, 0.6)}>每个只数一次</Check>
    </>
  );
};

const makePause = (cols: number, rows: number, seconds: number, prompt: string): SceneComponent => ({ scene }) => {
  const f = useCurrentFrame();
  const unit = rows === 4 ? 115 : 100;
  const g = makeGrid(420 - ((cols - 1) * unit) / 2, 200, unit);
  return (
    <>
      <Stage>
        <Dots cols={cols} rows={rows} at={g} />
      </Stage>
      <Text x={420} y={250 + (rows - 1) * unit} w={700} size={42} align="center" style={fadeUp(f, 6)}>
        {prompt}
      </Text>
      <Countdown scene={scene} seconds={seconds} x={1330} y={480} tick={TICK} label={<span style={{ fontFamily: ZH_FONT }}>暂停，试一试<span style={{ color: C.primary }}>！</span></span>} />
    </>
  );
};

// Upright + tilted share one grid position so the second scene feels like a continuation.
const G1 = makeGrid(200, 250, 130);
const PANEL = 960;

const Upright: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const tilesOut = fadeTo(f, at(scene, 4), 0.25);
  const twoOut = fadeTo(f, at(scene, 6), 0.0);
  const two = [at(scene, 4, 0.55), at(scene, 5, 0.75)] as const;
  return (
    <>
      <Pill x={PANEL} y={170} color={C.primary} style={fadeUp(f, at(scene, 1, 0.3))}>正放的正方形</Pill>
      <Stage>
        {range(12).map((i) => {
          const x = i % 4;
          const y = Math.floor(i / 4);
          const s = ease(f, at(scene, 3, 0.05) + i * 4, 10);
          const [cx, cy] = G1([x + 0.5, y + 0.5]);
          return (
            <g key={i} opacity={tilesOut}>
              <Poly pts={sq(x + 0.06, y + 0.06, 0.88).map(G1)} color={C.primary} width={3} fill={C.primary} fillOpacity={0.25} progress={s} />
              <text x={cx} y={cy + 2} opacity={s} fontSize={40} fontWeight={800} fill={C.primary} textAnchor="middle" dominantBaseline="middle">{i + 1}</text>
            </g>
          );
        })}
        <Slide spots={boxSpots(COLS, ROWS, 2)} draw={upright(2, G1, C.primary)} start={two[0]} end={two[1]} opacity={twoOut} />
        <Slide spots={boxSpots(COLS, ROWS, 3)} draw={upright(3, G1, C.primary)} start={at(scene, 6, 0.2)} end={at(scene, 6, 0.95)} opacity={fadeTo(f, at(scene, 7))} />
        <g opacity={fadeTo(f, at(scene, 8))}>
          <Poly pts={sq(0, 0, 4).map(G1)} color={C.red} width={6} dashed progress={ease(f, at(scene, 7, 0.25), 14)} />
          <XMark at={G1([2, 3.5])} opacity={ease(f, at(scene, 7, 0.75), 8)} />
        </g>
        <Dots cols={COLS} rows={ROWS} at={G1} />
        <g opacity={ease(f, at(scene, 2, 0.3), 12) * fadeTo(f, at(scene, 4))}>
          <Step a={G1([0, -0.3])} b={G1([4, -0.3])} label="4" color={C.ink} opacity={1} dy={-34} />
          <Step a={G1([-0.3, 0])} b={G1([-0.3, 3])} label="3" color={C.ink} opacity={1} dx={-36} />
        </g>
      </Stage>
      <Counter x={760} y={560} n={slideCount(f, two[0], two[1], 6)} color={C.primary} style={{ opacity: ease(f, two[0], 8) * twoOut }} />
      <Row x={PANEL} y={290} label="1 乘 1" tex="4 \times 3 = 12" style={fadeUp(f, at(scene, 3, 0.4))} />
      <Row x={PANEL} y={390} label="2 乘 2" tex="3 \times 2 = 6" style={fadeUp(f, at(scene, 5, 0.83))} />
      <Row x={PANEL} y={490} label="3 乘 3" tex="2" style={fadeUp(f, at(scene, 6, 0.75))} />
      <Row x={PANEL} y={590} label="4 乘 4" tex="0" color={C.red} style={fadeUp(f, at(scene, 7, 0.8))} />
      <div style={{ position: 'absolute', left: PANEL, top: 690, width: 760, height: 5, background: C.line, ...fadeUp(f, at(scene, 8)) }} />
      <Row x={PANEL} y={715} label="正放" tex="12 + 6 + 2 = 20" strong style={fadeUp(f, at(scene, 8, 0.15))} />
    </>
  );
};

const Tilted: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const small = [at(scene, 3, 0.3), at(scene, 3, 0.9)] as const;
  const big = [at(scene, 6, 0.1), at(scene, 6, 0.6)] as const;
  const smallOut = fadeTo(f, at(scene, 4), 0);
  const bigOut = fadeTo(f, at(scene, 8, 0.6), 0.35);
  const diamond = (p: Pt, ghost: boolean) => (
    <Poly pts={boxSquare(p[0], p[1], 2, 1).map(G1)} color={C.violet} width={ghost ? 4 : 7} fill={ghost ? undefined : C.violet} />
  );
  const pair = (p: Pt, ghost: boolean) => (
    <>
      {!ghost && <Poly pts={sq(p[0], p[1], 3).map(G1)} color={C.ink} width={3} dashed opacity={0.5} />}
      {[1, 2].map((a) => (
        <Poly key={a} pts={boxSquare(p[0], p[1], 3, a).map(G1)} color={TILT[a - 1]} width={ghost ? 4 : 7} fill={ghost ? undefined : TILT[a - 1]} fillOpacity={0.1} />
      ))}
    </>
  );
  return (
    <>
      <Row x={PANEL} y={190} label="正放" tex="20" color={C.primary} style={{}} />
      <Pill x={PANEL} y={300} color={C.violet} style={fadeUp(f, at(scene, 0, 0.55))}>斜着的正方形？</Pill>
      <Stage>
        <g opacity={smallOut}>
          {f < small[0] && <Poly pts={boxSquare(0, 0, 2, 1).map(G1)} color={C.violet} fill={C.violet} progress={ease(f, at(scene, 1, 0.1), 16)} />}
          <Slide spots={boxSpots(COLS, ROWS, 2)} draw={diamond} start={small[0]} end={small[1]} />
          <Poly pts={sq(0, 0, 2).map(G1)} color={C.violet} width={4} dashed progress={ease(f, at(scene, 2, 0.4), 12) * fadeTo(f, small[0])} />
          <g opacity={ease(f, at(scene, 1, 0.55), 10) * fadeTo(f, at(scene, 2, 0.4))}>
            <Step a={G1([1, -0.25])} b={G1([2, -0.25])} label="1" color={C.violet} opacity={1} dy={-30} />
            <Step a={G1([2.25, 0])} b={G1([2.25, 1])} label="1" color={C.violet} opacity={1} dx={32} />
          </g>
        </g>
        <g opacity={bigOut}>
          {f < big[0] &&
            [1, 2].map((a) => (
              <Poly key={a} pts={boxSquare(0, 0, 3, a).map(G1)} color={TILT[a - 1]} fill={TILT[a - 1]} fillOpacity={0.1} progress={ease(f, a === 1 ? at(scene, 4, 0.1) : at(scene, 5, 0.65), 18)} />
            ))}
          <Slide spots={boxSpots(COLS, ROWS, 3)} draw={pair} start={big[0]} end={big[1]} />
          <Poly pts={sq(0, 0, 3).map(G1)} color={C.violet} width={4} dashed progress={ease(f, at(scene, 5, 0.25), 12) * fadeTo(f, big[0])} />
          <g opacity={ease(f, at(scene, 4, 0.55), 10) * fadeTo(f, at(scene, 5, 0.2))}>
            <Step a={G1([1, -0.25])} b={G1([3, -0.25])} label="2" color={C.violet} opacity={1} dy={-30} />
            <Step a={G1([3.25, 0])} b={G1([3.25, 1])} label="1" color={C.violet} opacity={1} dx={32} />
          </g>
        </g>
        <g opacity={fadeTo(f, at(scene, 8))}>
          <Poly pts={sq(0, 0, 4).map(G1)} color={C.red} width={6} dashed progress={ease(f, at(scene, 7, 0.3), 14)} />
          <XMark at={G1([2, 3.5])} opacity={ease(f, at(scene, 7, 0.7), 8)} />
        </g>
        <Dots cols={COLS} rows={ROWS} at={G1} />
      </Stage>
      <Counter x={760} y={560} n={slideCount(f, small[0], small[1], 6)} color={C.violet} style={{ opacity: ease(f, small[0], 8) * smallOut }} />
      <Counter x={760} y={560} n={slideCount(f, big[0], big[1], 2)} color={C.blue} style={{ opacity: ease(f, big[0], 8) * fadeTo(f, at(scene, 7)) }} />
      <Row x={PANEL} y={410} label="小斜正方形" tex="6" color={C.violet} style={fadeUp(f, at(scene, 3, 0.9))} />
      <Row x={PANEL} y={500} label="大斜正方形" tex="2 \times 2 = 4" color={C.blue} style={fadeUp(f, at(scene, 6, 0.85))} />
      <div style={{ position: 'absolute', left: PANEL, top: 600, width: 760, height: 5, background: C.line, ...fadeUp(f, at(scene, 8)) }} />
      <Row x={PANEL} y={625} label="全部正方形" tex="20 + 6 + 4 = 30" strong style={fadeUp(f, at(scene, 8, 0.15))} />
      <Answer x={1700} y={260} value="30" chime={CHIME} start={at(scene, 8, 0.97)} />
      <Confetti x={1700} y={260} start={at(scene, 8, 0.97)} seed={7} />
    </>
  );
};

/** One big k×k box with its k squares (a = 0…k-1); `a` animates the sliding square. */
const BigBox: React.FC<{ k: number; unit: number; ox: number; oy: number; ghosts: number[]; slide?: number; boxProgress: number; opacity?: number }> = ({ k, unit, ox, oy, ghosts, slide, boxProgress, opacity = 1 }) => {
  const g = makeGrid(ox, oy, unit);
  const colors = [C.primary, ...TILT, C.amber];
  return (
    <g opacity={opacity}>
      <Poly pts={sq(0, 0, k).map(g)} color={C.primary} width={8} fill={C.primary} fillOpacity={0.08} progress={boxProgress} />
      {ghosts.map((a, i) => (a > 0 ? <Poly key={i} pts={boxSquare(0, 0, k, a).map(g)} color={colors[a]} width={7} fill={colors[a]} fillOpacity={0.1} /> : null))}
      {slide !== undefined && <Poly pts={boxSquare(0, 0, k, slide).map(g)} color={C.ink} width={8} />}
      <Dots cols={k + 1} rows={k + 1} at={g} r={9} />
    </g>
  );
};

const BoxTrick: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const exOut = fadeTo(f, at(scene, 2));
  const twoOut = fadeTo(f, at(scene, 3));
  const threeOut = fadeTo(f, at(scene, 6));
  // L4: the corners step 0, 1, 2 dots along the sides (no in-between frames: corners stay on dots).
  const stepAt = [at(scene, 4, 0.03), at(scene, 4, 0.15), at(scene, 4, 0.27)];
  const backAt = at(scene, 4, 0.4);
  const allAt = at(scene, 4, 0.86);
  const current = stepAt.filter((s) => f >= s).length - 1;
  const gBig = makeGrid(240, 250, 130);
  const g3 = makeGrid(200, 270, 110);
  const two = [at(scene, 8, 0.1), at(scene, 8, 0.8)] as const;
  const three = [at(scene, 9, 0.1), at(scene, 9, 0.7)] as const;
  const tableRow = (i: number) => fadeUp(f, at(scene, 7 + i, 0.15));
  return (
    <>
      <Pill x={PANEL - 40} y={170} color={C.violet} style={{ ...fadeUp(f, at(scene, 0, 0.72)), fontSize: 48 }}>方框妙招</Pill>
      <Stage>
        {/* L0–L1: every square sits snugly in an upright box */}
        <g opacity={exOut}>
          {[1, 2, 3].map((k, i) => {
            const g = makeGrid(140 + i * 270, 360 - k * 30, 70);
            const p = ease(f, at(scene, 0, 0.75) + i * 12, 14);
            return (
              <g key={k}>
                <Poly pts={sq(0, 0, k).map(g)} color={C.ink} width={4} dashed progress={p} />
                <Poly pts={boxSquare(0, 0, k, k - 1).map(g)} color={k === 1 ? C.primary : TILT[k - 2]} fill={k === 1 ? C.primary : TILT[k - 2]} progress={p} />
              </g>
            );
          })}
        </g>
        {/* L2: a 2×2 box holds 2 */}
        <BigBox k={2} unit={170} ox={260} oy={260} ghosts={f >= at(scene, 2, 0.55) ? [0, 1] : [0]} boxProgress={ease(f, at(scene, 2, 0.1), 16)} opacity={(f >= at(scene, 2) ? 1 : 0) * twoOut} />
        {/* L3–L5: a 3×3 box holds 3 */}
        {f >= at(scene, 3) && (
          <g opacity={threeOut}>
            <BigBox k={3} unit={130} ox={240} oy={250} ghosts={f >= allAt ? [0, 1, 2] : range(Math.max(0, current))} boxProgress={ease(f, at(scene, 3), 16)} />
            {current >= 0 && f < allAt && <Poly key={current} pts={boxSquare(0, 0, 3, current).map(gBig)} color={C.ink} width={8} progress={ease(f, stepAt[current], 10)} />}
            <Poly pts={sq(0, 0, 3).map(gBig)} color={C.amber} width={12} opacity={interpolate(f, [backAt, backAt + 8, backAt + 30, backAt + 45], [0, 1, 1, 0], clamp)} />
          </g>
        )}
        {/* L6–L10: count boxes on the real grid */}
        <g opacity={ease(f, at(scene, 6, 0.3), 12)}>
          <g opacity={fadeTo(f, at(scene, 8), 0.15)}>
            {range(12).map((i) => (
              <Poly key={i} pts={sq((i % 4) + 0.08, Math.floor(i / 4) + 0.08, 0.84).map(g3)} color={C.primary} width={3} fill={C.primary} fillOpacity={0.25} progress={ease(f, at(scene, 7, 0.1) + i * 3, 10)} />
            ))}
          </g>
          <Slide spots={boxSpots(COLS, ROWS, 2)} draw={upright(2, g3, C.violet)} start={two[0]} end={two[1]} opacity={fadeTo(f, at(scene, 9))} />
          <Slide spots={boxSpots(COLS, ROWS, 3)} draw={upright(3, g3, C.blue)} start={three[0]} end={three[1]} />
          <Dots cols={COLS} rows={ROWS} at={g3} />
        </g>
      </Stage>
      <Counter x={670} y={520} n={slideCount(f, two[0], two[1], 6)} color={C.violet} style={{ opacity: ease(f, two[0], 8) * fadeTo(f, at(scene, 9)) }} />
      <Counter x={670} y={520} n={slideCount(f, three[0], three[1], 2)} color={C.blue} style={{ opacity: ease(f, three[0], 8) * fadeTo(f, at(scene, 10)) }} />
      {/* L2–L4 labels */}
      <Text x={720} y={420} w={420} size={64} weight={900} color={C.violet} style={{ ...fadeUp(f, at(scene, 2, 0.86)), opacity: ease(f, at(scene, 2, 0.86), 12) * twoOut }}>
        = 2 个正方形
      </Text>
      {['走 0 步', '走 1 步', '走 2 步'].map((t, i) => (
        <Text key={t} x={760} y={270 + i * 85} w={420} size={52} weight={900} color={[C.primary, ...TILT][i]} style={{ ...fadeUp(f, stepAt[i], 10), opacity: ease(f, stepAt[i], 10) * threeOut }}>
          {t}
        </Text>
      ))}
      <Text x={760} y={530} w={460} size={40} weight={800} color={C.amber} style={{ ...fadeUp(f, backAt, 10), opacity: ease(f, backAt, 10) * threeOut }}>
        走 3 步 = 又回到方框
      </Text>
      <Text x={760} y={620} w={500} size={64} weight={900} color={C.ink} style={{ ...fadeUp(f, allAt), opacity: ease(f, allAt, 12) * threeOut }}>
        = 3 个正方形！
      </Text>
      {/* L5 pattern */}
      <div style={{ position: 'absolute', left: 1240, top: 330, opacity: threeOut }}>
        <div style={{ fontSize: 48, fontWeight: 800, ...fadeUp(f, at(scene, 5, 0.2)) }}>
          2 乘 2 方框 <span style={{ color: C.muted }}>→</span> <span style={{ color: C.violet }}>2 个正方形</span>
        </div>
        <div style={{ fontSize: 48, fontWeight: 800, marginTop: 30, ...fadeUp(f, at(scene, 5, 0.65)) }}>
          3 乘 3 方框 <span style={{ color: C.muted }}>→</span> <span style={{ color: C.blue }}>3 个正方形</span>
        </div>
      </div>
      {/* L6–L10 table */}
      <Text x={PANEL} y={290} w={800} size={40} weight={800} color={C.muted} style={fadeUp(f, at(scene, 6, 0.4))}>
        方框个数 × 每个方框里的正方形数
      </Text>
      <Row x={PANEL} y={370} label="1 乘 1" tex="12 \times 1 = 12" color={C.primary} style={tableRow(0)} />
      <Row x={PANEL} y={465} label="2 乘 2" tex="6 \times 2 = 12" color={C.violet} style={tableRow(1)} />
      <Row x={PANEL} y={560} label="3 乘 3" tex="2 \times 3 = 6" color={C.blue} style={tableRow(2)} />
      <div style={{ position: 'absolute', left: PANEL, top: 660, width: 760, height: 5, background: C.line, ...fadeUp(f, at(scene, 10)) }} />
      <Row x={PANEL} y={685} label="全部正方形" tex="12 + 12 + 6 = 30" strong style={fadeUp(f, at(scene, 10, 0.1))} />
      <Pill x={200} y={680} color={C.amber} style={{ ...fadeUp(f, at(scene, 11, 0.45)), fontSize: 40 }}>网格大？用方框妙招！</Pill>
    </>
  );
};

const NOTES = ['只数了正放的', '20 + 4 个大斜的（漏了 6 个小的）', '20 + 6 个小斜的（漏了 4 个大的）', '', '太多了！'];

const Traps: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const wrongAt = [at(scene, 1, 0.1), at(scene, 2, 0.1), at(scene, 3, 0.1), Infinity, at(scene, 3, 0.71)];
  return (
    <>
      <div style={{ position: 'absolute', left: 135, top: 200, display: 'flex', gap: 30 }}>
        {CHOICES.map((c, i) => {
          const wrong = f >= wrongAt[i];
          const right = i === 3;
          const border = wrong ? C.red : right ? C.green : 'transparent';
          return (
            <div key={c} style={{ width: 300, ...fadeUp(f, 8 + i * 6, 12) }}>
              <div style={{ height: 210, background: C.card, borderRadius: 28, border: `6px solid ${border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(30,40,80,0.07)', position: 'relative' }}>
                <div style={{ fontSize: 36, fontWeight: 800, color: C.muted }}>{'ABCDE'[i]}</div>
                <div style={{ fontSize: 100, fontWeight: 900, color: wrong ? C.red : right ? C.green : C.ink, lineHeight: 1 }}>{c}</div>
                {(wrong || right) && (
                  <div style={{ position: 'absolute', top: -26, right: -26, width: 64, height: 64, borderRadius: '50%', background: wrong ? C.red : C.green, color: '#fff', fontSize: 40, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {wrong ? '✗' : '✓'}
                  </div>
                )}
              </div>
              {NOTES[i] && (
                <div style={{ marginTop: 24, fontSize: 34, fontWeight: 700, textAlign: 'center', lineHeight: 1.3, ...fadeUp(f, wrongAt[i] + 8) }}>
                  {NOTES[i]}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div style={{ position: 'absolute', left: 360, top: 640, width: 1200, textAlign: 'center', background: C.primary, color: '#fff', borderRadius: 28, padding: '26px 40px', fontSize: 52, fontWeight: 900, ...fadeUp(f, at(scene, 4, 0.3)) }}>
        按大小分类 → 再检查斜着的！
      </div>
    </>
  );
};

const G5 = makeGrid(1150, 200, 105);

const Variant: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Pill x={120} y={190} color={C.violet} style={fadeUp(f, at(scene, 0, 0.3))}>轮到你了！</Pill>
      <Text x={120} y={310} w={900} size={60} weight={900} style={fadeUp(f, at(scene, 1, 0.2))}>
        25 个点，排成 5 行，每行 5 个
      </Text>
      <Text x={120} y={420} w={900} size={48} weight={700} style={fadeUp(f, at(scene, 2, 0.1))}>
        有多少个正方形的 4 个顶点都在点上？<br /><span style={{ color: C.violet }}>斜着的也算。</span>
      </Text>
      <Pill x={120} y={620} color={C.amber} style={fadeUp(f, at(scene, 3))}>试试方框妙招！</Pill>
      <Stage>
        <Dots cols={5} rows={5} at={G5} start={6} />
      </Stage>
    </>
  );
};

const GV = makeGrid(190, 230, 105);
const VP = 790; // table x for the variant answer (wider total)

const VariantAnswer: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const r = (i: number, t = 0.2) => fadeUp(f, at(scene, i, t));
  const two = [at(scene, 2, 0.1), at(scene, 2, 0.62)] as const;
  const three = [at(scene, 3, 0.05), at(scene, 3, 0.4)] as const;
  // L4: the 4×4 box's square steps 0, 1, 2, 3 dots along the sides.
  const four = range(4).map((a) => at(scene, 4, 0.62 + a * 0.08));
  const a4 = four.filter((s) => f >= s).length - 1;
  return (
    <>
      <Stage>
        <g opacity={fadeTo(f, at(scene, 2), 0.15)}>
          {range(16).map((i) => (
            <Poly key={i} pts={sq((i % 4) + 0.08, Math.floor(i / 4) + 0.08, 0.84).map(GV)} color={C.primary} width={3} fill={C.primary} fillOpacity={0.25} progress={ease(f, at(scene, 1, 0.1) + i * 3, 10)} />
          ))}
        </g>
        <Slide spots={boxSpots(5, 5, 2)} draw={upright(2, GV, C.violet)} start={two[0]} end={two[1]} opacity={fadeTo(f, at(scene, 3))} />
        <Slide spots={boxSpots(5, 5, 3)} draw={upright(3, GV, C.blue)} start={three[0]} end={three[1]} opacity={fadeTo(f, at(scene, 4))} />
        <g opacity={ease(f, at(scene, 4, 0.05), 12)}>
          <Poly pts={sq(0, 0, 4).map(GV)} color={C.amber} width={8} fill={C.amber} fillOpacity={0.08} />
          {a4 > 0 && <Poly key={a4} pts={boxSquare(0, 0, 4, a4).map(GV)} color={C.ink} width={8} progress={ease(f, four[a4], 10)} />}
        </g>
        <Dots cols={5} rows={5} at={GV} />
        <g opacity={ease(f, at(scene, 0, 0.42), 12) * fadeTo(f, at(scene, 1))}>
          <Step a={GV([0, -0.3])} b={GV([4, -0.3])} label="4" color={C.ink} opacity={1} dy={-34} />
          <Step a={GV([-0.3, 0])} b={GV([-0.3, 4])} label="4" color={C.ink} opacity={1} dx={-36} />
        </g>
      </Stage>
      <Counter x={640} y={560} n={slideCount(f, two[0], two[1], 9)} color={C.violet} style={{ opacity: ease(f, two[0], 8) * fadeTo(f, at(scene, 3)) }} />
      <Counter x={640} y={560} n={slideCount(f, three[0], three[1], 4)} color={C.blue} style={{ opacity: ease(f, three[0], 8) * fadeTo(f, at(scene, 4)) }} />
      <Counter x={640} y={560} n={Math.max(1, a4 + 1)} color={C.amber} style={{ opacity: ease(f, four[0], 8) }} />
      <Text x={VP} y={190} w={800} size={40} weight={800} color={C.muted} style={r(1, 0)}>
        方框个数 × 每个方框里的正方形数
      </Text>
      <Row x={VP} y={270} label="1 乘 1" tex="16 \times 1 = 16" color={C.primary} style={r(1, 0.5)} />
      <Row x={VP} y={360} label="2 乘 2" tex="9 \times 2 = 18" color={C.violet} style={r(2, 0.86)} />
      <Row x={VP} y={450} label="3 乘 3" tex="4 \times 3 = 12" color={C.blue} style={r(3, 0.77)} />
      <Row x={VP} y={540} label="4 乘 4" tex="1 \times 4 = 4" color={C.amber} style={r(4, 0.9)} />
      <div style={{ position: 'absolute', left: VP, top: 640, width: 800, height: 5, background: C.line, ...r(5, 0) }} />
      <Row x={VP} y={665} label="合计" tex="16+18+12+4 = 50" strong style={r(5, 0.1)} />
      <Answer x={1720} y={270} value="50" chime={CHIME} start={at(scene, 5, 0.97)} />
      <Confetti x={1720} y={270} start={at(scene, 5, 0.97)} seed={11} />
      <Pill x={VP} y={775} color={C.primary} style={r(6, 0.1)}>太棒了！</Pill>
    </>
  );
};

const Recap: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const cardOut = fadeTo(f, at(scene, 3));
  return (
    <>
      <div style={{ position: 'absolute', left: 160, top: 170, width: 1600, height: 560, background: C.card, borderRadius: 40, boxShadow: '0 10px 40px rgba(30,40,80,0.08)', opacity: ease(f, 0, 14) * cardOut }}>
        <div style={{ position: 'absolute', left: 70, top: 60, fontSize: 44, fontWeight: 900, color: C.primary, ...fadeUp(f, 4) }}>核心思路</div>
        <div style={{ position: 'absolute', left: 70, top: 150, width: 900, fontSize: 64, fontWeight: 900, lineHeight: 1.2, ...fadeUp(f, at(scene, 1, 0.1)) }}>
          按刚好装进的方框来分类。
        </div>
        <div style={{ position: 'absolute', left: 70, top: 330, width: 900, fontSize: 48, fontWeight: 800, color: C.muted, ...fadeUp(f, at(scene, 1, 0.55)) }}>
          3 乘 3 的方框里，有 <span style={{ color: C.blue }}>3 个贴边的正方形</span>。
        </div>
        <div style={{ position: 'absolute', left: 70, top: 430, width: 900, fontSize: 52, fontWeight: 900, color: C.violet, ...fadeUp(f, at(scene, 2, 0.1)) }}>
          千万别忘了斜着的正方形！
        </div>
      </div>
      <Stage>
        <g opacity={ease(f, at(scene, 1, 0.55), 14) * cardOut}>
          <BigBox k={3} unit={115} ox={1240} oy={270} ghosts={[0, 1, 2]} boxProgress={1} />
        </g>
      </Stage>
      <SignOff start={at(scene, 3, 0.1)} text="继续数下去！" tagline="你的家庭 AI 教练" />
      <Confetti x={960} y={380} start={at(scene, 3, 0.2)} seed={3} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = {
  intro: Intro,
  question: Question,
  asked: Asked,
  try1: makePause(COLS, ROWS, 10, '有多少个正方形？斜着的也算！'),
  upright: Upright,
  tilted: Tilted,
  boxtrick: BoxTrick,
  traps: Traps,
  variant: Variant,
  try2: makePause(5, 5, 12, '25 个点，有多少个正方形？'),
  'variant-answer': VariantAnswer,
  recap: Recap,
};

export const Video: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <Explainer timeline={timeline} scenes={SCENES} badge="AMC 8 风格 · 第5级" font={ZH_FONT} /> : null;
