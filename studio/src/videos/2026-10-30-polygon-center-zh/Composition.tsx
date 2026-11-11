import { staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { ease, fadeTo, fadeUp, pop, range } from '../../lib/anim';
import { Explainer, at, type SceneComponent, type Timeline } from '../../lib/Explainer';
import { Countdown } from '../../lib/PauseCard';
import { Poly, Stage, type Pt } from '../../lib/grid';
import { PACIFICO, ZH_FONT } from '../../lib/fonts';
import { Tex } from '../../lib/Tex';
import { Answer, Choices, Confetti, Mark, Pill, Text } from '../../lib/ui';
import { SignOff } from '../../lib/Brand';
import { C } from '../../lib/theme';

export const SLUG = '2026-10-30-polygon-center-zh';
export const CHIME = staticFile(`${SLUG}/sfx/fs-541985.mp3`); // Freesound CC0, see sfx/FREESOUND-CREDITS.md
export const TICK = staticFile(`${SLUG}/sfx/fs-668355.mp3`);

// ---------- mixed maths + hanzi (hanzi never go inside KaTeX, whose \text font is serif) ----------

type Part = string | { z: string; c?: string };
const Z: React.FC<{ p: Part[] | string; size: number; color?: string }> = ({ p, size, color = C.ink }) =>
  typeof p === 'string' ? (
    <Tex tex={p} size={size} color={color} />
  ) : (
    <span style={{ whiteSpace: 'nowrap', color }}>
      {p.map((x, i) =>
        typeof x === 'string' ? (
          <Tex key={i} tex={x} size={size} color={color} />
        ) : (
          <span key={i} style={{ fontFamily: ZH_FONT, fontSize: size * 0.9, fontWeight: 800, color: x.c ?? color, margin: '0 0.12em' }}>{x.z}</span>
        ),
      )}
    </span>
  );
const z = (t: string): Part => ({ z: t });

// ---------- geometry ----------
// Vertex 0 is at the top; vertex k sits k steps CLOCKWISE from it (screen y grows down, so a growing
// angle turns clockwise on screen). "Next six" in the narration = the six vertices clockwise after it.

type Geo = { cx: number; cy: number; R: number; n: number };
export const BIG: Geo = { cx: 540, cy: 480, R: 280, n: 13 };
export const HIT = [0, 3, 7, 10]; // gaps 3, 4, 3, 3: every empty arc < half
export const MISS = [0, 2, 3, 5]; // gaps 2, 1, 2, 8: one empty arc > half

const ang = (g: Geo, k: number) => -Math.PI / 2 + (2 * Math.PI * k) / g.n;
const onCircle = (g: Geo, k: number, r = g.R): Pt => [g.cx + r * Math.cos(ang(g, k)), g.cy + r * Math.sin(ang(g, k))];
export const mod = (a: number, n: number) => ((a % n) + n) % n;
export const rot = (s: number[], r: number, n: number) => s.map((v) => mod(v + r, n)).sort((a, b) => a - b);

/** Every k-subset of xs (lexicographic). */
export const combos = (xs: number[], k: number): number[][] =>
  k === 0 ? [[]] : xs.length < k ? [] : [...combos(xs.slice(1), k - 1).map((c) => [xs[0], ...c]), ...combos(xs.slice(1), k)];
/** Ordered ways to write `total` as `parts` positive whole numbers. */
const splits = (total: number, parts: number): number[][] =>
  parts === 1 ? [[total]] : range(total - parts + 1).flatMap((i) => splits(total - i - 1, parts - 1).map((r) => [i + 1, ...r]));

/** The polygon: faint circle + outline, the vertex dots, and the centre dot. */
export const Ngon: React.FC<{ g: Geo; start?: number; centre?: string; dim?: number; showCentre?: boolean }> = ({ g, start, centre = C.ink, dim = 1, showCentre = true }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pts = range(g.n).map((k) => onCircle(g, k));
  const grow = start === undefined ? 1 : ease(f, start, 20);
  return (
    <g opacity={dim}>
      <circle cx={g.cx} cy={g.cy} r={g.R} fill="none" stroke={C.line} strokeWidth={4} strokeDasharray="10 12" opacity={grow} />
      <Poly pts={pts} color="#c9cedb" width={4} progress={grow} />
      {pts.map(([x, y], k) => (
        <circle key={k} cx={x} cy={y} r={11 * (start === undefined ? 1 : pop(f, start + k * 2, fps))} fill={C.ink} />
      ))}
      {showCentre && <circle cx={g.cx} cy={g.cy} r={12 * grow} fill={centre} />}
    </g>
  );
};

/** The chosen quadrilateral (or triangle), drawn on in circle order. */
export const Shape: React.FC<{ g: Geo; set: number[]; color: string; progress?: number; opacity?: number }> = ({ g, set, color, progress = 1, opacity = 1 }) =>
  opacity <= 0 || progress <= 0 ? null : (
    <g opacity={opacity}>
      <Poly pts={[...set].sort((a, b) => a - b).map((k) => onCircle(g, k))} color={color} width={7} fill={color} fillOpacity={0.18} progress={progress} />
      {set.map((k) => {
        const [x, y] = onCircle(g, k);
        return <circle key={k} cx={x} cy={y} r={17} fill={color} stroke="#fff" strokeWidth={4} />;
      })}
    </g>
  );

/** A thick arc along the circle, clockwise from vertex a for `steps` steps. */
export const Arc: React.FC<{ g: Geo; a: number; steps: number; color: string; opacity: number; r?: number; width?: number }> = ({ g, a, steps, color, opacity, r, width = 14 }) => {
  if (opacity <= 0) return null;
  const rr = r ?? g.R + 22;
  const trim = 0.14;
  const [x0, y0] = onCircle(g, a + trim, rr);
  const [x1, y1] = onCircle(g, a + steps - trim, rr);
  const large = steps / g.n > 0.5 ? 1 : 0;
  return <path d={`M ${x0} ${y0} A ${rr} ${rr} 0 ${large} 1 ${x1} ${y1}`} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" opacity={opacity} />;
};

/** A shaded half of the circle, starting at vertex a and going clockwise for 180 degrees. */
export const Half: React.FC<{ g: Geo; a: number; opacity: number; color?: string }> = ({ g, a, opacity, color = C.violet }) => {
  if (opacity <= 0) return null;
  const t0 = ang(g, a);
  const r = g.R + 40;
  const p0 = [g.cx + r * Math.cos(t0), g.cy + r * Math.sin(t0)];
  const p1 = [g.cx + r * Math.cos(t0 + Math.PI), g.cy + r * Math.sin(t0 + Math.PI)];
  return (
    <g opacity={opacity}>
      <path d={`M ${p0[0]} ${p0[1]} A ${r} ${r} 0 0 1 ${p1[0]} ${p1[1]} Z`} fill={color} fillOpacity={0.1} />
      <line x1={p0[0]} y1={p0[1]} x2={p1[0]} y2={p1[1]} stroke={color} strokeWidth={4} strokeDasharray="14 10" />
    </g>
  );
};

/** Ring around vertex k. */
export const Ring: React.FC<{ g: Geo; k: number; color: string; opacity: number }> = ({ g, k, color, opacity }) => {
  if (opacity <= 0) return null;
  const [x, y] = onCircle(g, k);
  return <circle cx={x} cy={y} r={24} fill="none" stroke={color} strokeWidth={6} opacity={opacity} />;
};

/** SVG text at a point. */
export const Label: React.FC<{ p: Pt; text: string; color?: string; size?: number; opacity?: number; anchor?: 'start' | 'middle' | 'end' }> = ({ p, text, color = C.ink, size = 48, opacity = 1, anchor = 'middle' }) =>
  opacity <= 0 ? null : (
    <text x={p[0]} y={p[1]} fill={color} opacity={opacity} fontFamily={ZH_FONT} fontWeight={900} fontSize={size} textAnchor={anchor} dominantBaseline="middle" paintOrder="stroke" stroke={C.bg} strokeWidth={8}>
      {text}
    </text>
  );

/** Label just outside the circle, at step position k (may be fractional). */
export const Outside: React.FC<{ g: Geo; k: number; text: string; color?: string; opacity: number; d?: number; size?: number }> = ({ g, k, text, color, opacity, d = 62, size = 48 }) => (
  <Label p={onCircle(g, k, g.R + d)} text={text} color={color} opacity={opacity} size={size} />
);

/** Gap sizes around a set (in circle order, starting at its smallest vertex). */
export const gapsOf = (set: number[], n: number) => {
  const s = [...set].sort((a, b) => a - b);
  return s.map((v, i) => mod(s[(i + 1) % s.length] - v, n) || n);
};

/** A maths line placed absolutely. */
const Eq: React.FC<{ x: number; y: number; tex: string | Part[]; start: number; size?: number; color?: string; opacity?: number }> = ({ x, y, tex, start, size = 56, color = C.ink, opacity = 1 }) => {
  const f = useCurrentFrame();
  const s = fadeUp(f, start);
  return (
    <div style={{ position: 'absolute', left: x, top: y, whiteSpace: 'nowrap', ...s, opacity: (s.opacity as number) * opacity }}>
      <Z p={tex} size={size} color={color} />
    </div>
  );
};

const Card: React.FC<{ x: number; y: number; w: number; h: number; style?: React.CSSProperties; children?: React.ReactNode }> = ({ x, y, w, h, style, children }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, background: C.card, borderRadius: 28, boxShadow: '0 8px 28px rgba(30,40,80,0.07)', ...style }}>{children}</div>
);

/** "hit" / "miss" tag. */
const Tag: React.FC<{ x: number; y: number; hit: boolean; style?: React.CSSProperties }> = ({ x, y, hit, style }) => (
  <div style={{ position: 'absolute', left: x, top: y, fontSize: 52, fontWeight: 900, color: hit ? C.green : C.red, ...style }}>{hit ? '✓ 包住' : '✗ 漏掉'}</div>
);

// ---------- scenes ----------

const Intro: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const swap = at(scene, 1, 0.45);
  const hitOn = f < swap;
  return (
    <>
      <Stage>
        <Ngon g={BIG} start={4} centre={f < at(scene, 1) ? C.ink : hitOn ? C.green : C.red} />
        <Shape g={BIG} set={HIT} color={C.green} progress={ease(f, at(scene, 0, 0.55), 20)} opacity={fadeTo(f, swap, 0, 8)} />
        <Shape g={BIG} set={MISS} color={C.red} progress={ease(f, swap + 4, 18)} />
      </Stage>
      <Text x={1000} y={170} w={860} size={76} weight={900} style={fadeUp(f, 6)}>
        能不能包住<span style={{ color: C.primary }}>中心</span>？
      </Text>
      <Tag x={1000} y={420} hit style={{ ...fadeUp(f, at(scene, 1, 0.1)), opacity: ease(f, at(scene, 1, 0.1)) * fadeTo(f, swap, 0.3) }} />
      <Tag x={1300} y={420} hit={false} style={fadeUp(f, swap + 6)} />
      <Text x={1000} y={520} w={860} size={56} weight={900} color={C.violet} style={fadeUp(f, at(scene, 1, 0.8))}>
        哪种情况更多？
      </Text>
      <div style={{ position: 'absolute', left: 1000, top: 650, ...fadeUp(f, at(scene, 2)) }}>
        <div style={{ fontFamily: PACIFICO, fontSize: 72, color: C.violet }}>Vantee</div>
        <div style={{ fontSize: 36, fontWeight: 700, color: C.muted, marginTop: -6 }}>你的数学小导师</div>
      </div>
    </>
  );
};

export const CHOICES = ['260', '390', '455', '520', '715'];

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g: Geo = { cx: 1520, cy: 400, R: 220, n: 13 };
  return (
    <>
      <div style={{ position: 'absolute', left: 100, top: 150, width: 1080, background: C.card, borderRadius: 32, padding: '40px 50px', fontSize: 50, fontWeight: 600, lineHeight: 1.5, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', ...fadeUp(f, 0) }}>
        从正 13 边形的 13 个顶点中<Mark on={at(scene, 0, 0.6)}>选出 4 个</Mark>，
        <Mark on={at(scene, 1, 0.2)}>按顺序连起来</Mark>，得到一个四边形。有多少种选法，能让这个四边形
        <Mark on={at(scene, 2, 0.5)}>包含多边形的中心</Mark>？
      </div>
      <Stage>
        <Ngon g={g} start={8} centre={f >= at(scene, 2, 0.5) ? C.green : C.ink} />
        <Shape g={g} set={HIT} color={C.primary} progress={ease(f, at(scene, 1, 0.3), 24)} />
      </Stage>
      <Choices x={100} y={720} items={CHOICES.map((c) => <Tex key={c} tex={c} size={56} />)} start={(i) => at(scene, 3, 0.1 + i * 0.12)} />
    </>
  );
};

const Asked: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const swap = at(scene, 3);
  const across = ease(f, at(scene, 4, 0.1), 14) * fadeTo(f, at(scene, 5), 0);
  const opp = onCircle(BIG, 6.5);
  const top = onCircle(BIG, 0);
  return (
    <>
      <Stage>
        <Ngon g={BIG} start={0} centre={f < at(scene, 2) ? C.ink : f < swap ? C.green : C.red} />
        {(() => {
          const t = f - at(scene, 0, 0.3);
          if (t < 0 || t > 45) return null;
          const [x, y] = onCircle(BIG, 0);
          return <circle cx={x} cy={y} r={20 + t * 0.9} fill="none" stroke={C.primary} strokeWidth={6} opacity={1 - t / 45} />;
        })()}
        <Outside g={BIG} k={0} text="角" color={C.primary} opacity={ease(f, at(scene, 0, 0.3), 8) * fadeTo(f, at(scene, 1), 0)} d={52} />
        <Shape g={BIG} set={HIT} color={f < at(scene, 2) ? C.primary : C.green} progress={ease(f, at(scene, 1, 0.2), 30)} opacity={fadeTo(f, swap, 0, 8)} />
        <Shape g={BIG} set={MISS} color={C.red} progress={ease(f, swap + 4, 20)} opacity={fadeTo(f, at(scene, 4), 0.25)} />
        <g opacity={across}>
          <line x1={top[0]} y1={top[1]} x2={opp[0]} y2={opp[1]} stroke={C.violet} strokeWidth={6} strokeDasharray="16 12" />
          <circle cx={opp[0]} cy={opp[1]} r={14} fill="none" stroke={C.violet} strokeWidth={6} />
        </g>
      </Stage>
      <Tag x={1000} y={170} hit style={{ ...fadeUp(f, at(scene, 2, 0.3)), opacity: ease(f, at(scene, 2, 0.3)) * fadeTo(f, swap, 0.3) }} />
      <Tag x={1300} y={170} hit={false} style={fadeUp(f, swap + 10)} />
      <Text x={1000} y={270} w={880} size={42} weight={800} color={C.violet} style={fadeUp(f, at(scene, 4, 0.2))}>
        每个顶点的正对面都是空隙，不是顶点。所以中心不会落在边上。
      </Text>
      <Eq x={1000} y={450} start={at(scene, 5, 0.3)} size={56} tex="13 \times 12 \times 11 \times 10" />
      <Eq x={1000} y={540} start={at(scene, 6, 0.3)} size={52} color={C.muted} tex={[z('顺序：'), '4 \\times 3 \\times 2 \\times 1 = 24']} />
      <Eq x={1000} y={640} start={at(scene, 7, 0.2)} size={60} color={C.primary} tex="\dfrac{13 \times 12 \times 11 \times 10}{24} = 715" />
    </>
  );
};

const makePause = (n: number, k: number, seconds: number): SceneComponent => ({ scene }) => {
  const f = useCurrentFrame();
  const g: Geo = { cx: 540, cy: 640, R: 150, n };
  return (
    <>
      <Card x={110} y={150} w={860} h={690} style={fadeUp(f, 0)}>
        <div style={{ position: 'absolute', left: 50, right: 50, top: 40, fontSize: 48, fontWeight: 700, lineHeight: 1.4 }}>
          从正 <b>{n}</b> 边形的顶点中选 <b style={{ color: C.primary }}>{k}</b> 个，连成{k === 4 ? '四边形' : '三角形'}。有多少个{k === 4 ? '四边形' : '三角形'}包含中心？
        </div>
      </Card>
      <Stage>
        <Ngon g={g} start={6} />
      </Stage>
      <Countdown scene={scene} seconds={seconds} x={1440} y={480} tick={TICK} label={<span style={{ fontFamily: ZH_FONT }}>暂停，试一试<span style={{ color: C.primary }}>！</span></span>} />
    </>
  );
};

// ---- Solution 1: count the misses ----

const Miss: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const swap = at(scene, 3);
  const quadsOut = fadeTo(f, at(scene, 5), 0);
  const hitArcs = ease(f, at(scene, 2, 0.2), 12) * fadeTo(f, swap, 0, 8);
  const half = at(scene, 7);
  const hitGaps = gapsOf(HIT, 13);
  const missGaps = gapsOf(MISS, 13);
  return (
    <>
      <Stage>
        <Half g={BIG} a={0} opacity={ease(f, at(scene, 4, 0.3), 14) * fadeTo(f, at(scene, 5), 0) + ease(f, half, 14)} />
        <Ngon g={BIG} centre={f < at(scene, 2) ? C.ink : f < swap ? C.green : f < at(scene, 5) ? C.red : C.ink} />
        {/* one side and its empty arc */}
        <Arc g={BIG} a={HIT[0]} steps={hitGaps[0]} color={C.green} opacity={ease(f, at(scene, 1, 0.45), 12) * fadeTo(f, swap, 0, 8)} />
        {HIT.slice(1).map((v, i) => (
          <Arc key={v} g={BIG} a={v} steps={hitGaps[i + 1]} color={C.green} opacity={hitArcs} />
        ))}
        <Shape g={BIG} set={HIT} color={C.green} opacity={fadeTo(f, swap, 0, 8)} />
        {/* the miss */}
        {MISS.map((v, i) => (
          <Arc key={v} g={BIG} a={v} steps={missGaps[i]} color={missGaps[i] > 6 ? C.red : C.green} opacity={ease(f, swap + 6, 12) * quadsOut} />
        ))}
        <Shape g={BIG} set={MISS} color={C.red} opacity={ease(f, swap, 10) * quadsOut} />
        {/* a half: the first vertex + the next six; the seventh is past halfway */}
        {range(6).map((i) => (
          <Outside key={i} g={BIG} k={i + 1} text={`${i + 1}`} color={C.violet} opacity={ease(f, half + 10 + i * 5, 8)} />
        ))}
        {range(7).map((i) => (
          <Ring key={i} g={BIG} k={i} color={C.violet} opacity={ease(f, half + 6 + i * 5, 8)} />
        ))}
        <Outside g={BIG} k={0} text="第一个" color={C.violet} opacity={ease(f, half + 4, 8)} d={52} />
        {range(13).map((i) => (
          <Outside key={`s${i}`} g={BIG} k={i + 0.5} text={`${i + 1}`} color={C.blue} size={40} d={48}
            opacity={ease(f, at(scene, 5, 0.35) + i * Math.max(2, Math.floor(scene.lines[5].frames * 0.045)), 6) * fadeTo(f, at(scene, 6, 0.3), 0)} />
        ))}
        {(() => {
          const o = ease(f, at(scene, 6, 0.3), 12) * fadeTo(f, half, 0);
          if (o <= 0) return null;
          const [tx, ty] = onCircle(BIG, 0);
          const [bx, by] = onCircle(BIG, 6.5);
          return (
            <g opacity={o}>
              <line x1={tx} y1={ty} x2={bx} y2={by} stroke={C.violet} strokeWidth={5} strokeDasharray="14 10" />
              <Arc g={BIG} a={0} steps={6.5 + 0.28} color={C.violet} opacity={1} width={10} />
              <circle cx={bx} cy={by} r={16} fill={C.violet} />
              <Label p={[bx, by - 56]} text="6½" color={C.violet} size={52} />
            </g>
          );
        })()}
        <Ring g={BIG} k={7} color={C.red} opacity={ease(f, at(scene, 7, 0.65), 8)} />
        <Outside g={BIG} k={7} text="7 ✗" color={C.red} opacity={ease(f, at(scene, 7, 0.65), 8)} d={72} />
      </Stage>
      <Eq x={1000} y={170} start={at(scene, 0, 0.4)} size={56} tex={[z('包住的'), '= 715 -', z('漏掉的')]} />
      <Text x={1000} y={290} w={860} size={44} weight={800} color={C.green} style={{ ...fadeUp(f, at(scene, 2, 0.3)), opacity: ease(f, at(scene, 2, 0.3)) * fadeTo(f, swap, 0.35) * fadeTo(f, at(scene, 6, 0.2), 0) }}>
        每段空弧都不到一半：中心在里面。
      </Text>
      <Text x={1000} y={410} w={860} size={44} weight={800} color={C.red} style={fadeUp(f, at(scene, 3, 0.4))}>
        有一段空弧超过一半：漏掉。
      </Text>
      <Text x={1000} y={500} w={860} size={44} weight={800} color={C.violet} style={fadeUp(f, at(scene, 4, 0.3))}>
        漏掉 = 4 个顶点都在同一半圆里。
      </Text>
      <Eq x={1000} y={600} start={at(scene, 5, 0.5)} size={56} tex={[z('一整圈'), '= 13', z('步')]} />
      <Eq x={1000} y={690} start={at(scene, 6, 0.2)} size={56} color={C.violet} tex={[z('一半'), '= 6\\dfrac{1}{2}', z('步')]} />
    </>
  );
};

export const NEXT6 = combos([1, 2, 3, 4, 5, 6], 3);

const Count: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  // line 2: step through all 20 ways to pick three of the next six
  const c0 = at(scene, 2, 0.15);
  const ci = Math.max(0, Math.min(19, Math.floor((f - c0) / 5)));
  const pick = f < c0 ? [2, 3, 5] : NEXT6[ci];
  // line 3: the first vertex steps through all 13 positions
  const r0 = at(scene, 3, 0.1);
  const rStep = Math.max(4, Math.floor((at(scene, 4) - r0) / 14));
  const r = f < r0 ? 0 : Math.min(12, Math.floor((f - r0) / rStep));
  const shown = rot(f < at(scene, 3) ? [0, ...pick] : MISS, r, 13);
  const settle = f >= at(scene, 4);
  const set = settle ? MISS : shown;
  const first = settle ? 0 : r;
  const g = gapsOf(set, 13);
  const bigIdx = g.findIndex((x) => x > 6);
  const sorted = [...set].sort((a, b) => a - b);
  const bigFrom = sorted[bigIdx];
  const twice = ease(f, at(scene, 5, 0.3), 12);
  return (
    <>
      <Stage>
        <Half g={BIG} a={first} opacity={ease(f, at(scene, 1, 0.1), 12)} />
        <Ngon g={BIG} centre={C.red} />
        <Arc g={BIG} a={bigFrom} steps={g[bigIdx]} color={C.red} opacity={ease(f, at(scene, 0, 0.6), 12)} width={14 + 6 * twice} />
        {range(6).map((i) => (
          <Ring key={i} g={BIG} k={first + i + 1} color={C.violet} opacity={ease(f, at(scene, 1, 0.3) + i * 4, 8) * fadeTo(f, at(scene, 4), 0)} />
        ))}
        <Shape g={BIG} set={set} color={C.red} />
        <Outside g={BIG} k={first} text="第一个" color={C.violet} opacity={ease(f, at(scene, 0, 0.75), 10)} d={52} />
        <Outside g={BIG} k={bigFrom + g[bigIdx] / 2} text="空弧" color={C.red} opacity={twice} d={122} />
      </Stage>
      {f >= c0 && f < at(scene, 3) && (
        <Text x={1000} y={170} w={600} size={44} weight={800} color={C.muted}>
          第 <span style={{ color: C.violet }}>{ci + 1}</span> 种，共 20 种
        </Text>
      )}
      {f >= r0 && f < at(scene, 5) && (
        <Text x={1000} y={170} w={900} size={44} weight={800} color={C.muted}>
          第一个顶点：第 <span style={{ color: C.violet }}>{r + 1}</span> 个位置，共 13 个
        </Text>
      )}
      <Eq x={1000} y={240} start={at(scene, 2, 0.2)} size={56} tex="\dbinom{6}{3} = \dfrac{6 \times 5 \times 4}{6} = 20" />
      <Eq x={1000} y={410} start={at(scene, 4, 0.2)} size={60} tex={['13 \\times 20 = 260', z('种漏掉')]} />
      <Eq x={1000} y={510} start={at(scene, 6, 0.2)} size={52} color={C.muted} tex={[z('两段大空弧：'), '7 + 7 = 14 > 13']} />
      <Eq x={1000} y={630} start={at(scene, 7, 0.3)} size={64} color={C.green} tex="715 - 260 = 455" />
      <Answer x={1700} y={700} value="C" chime={CHIME} start={at(scene, 7, 0.96)} />
      <Confetti x={1700} y={700} start={at(scene, 7, 0.96)} seed={7} />
    </>
  );
};

// ---- Solution 2: the big gap ----

const GAP7 = splits(6, 3); // 10 ways for the other three gaps when the big gap is 7
const ROWS = [
  { big: 7, rest: 6, ways: 10 },
  { big: 8, rest: 5, ways: 6 },
  { big: 9, rest: 4, ways: 3 },
  { big: 10, rest: 3, ways: 1 },
];

const Gaps: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l0 = at(scene, 2, 0.35);
  const li = Math.max(0, Math.min(9, Math.floor((f - l0) / Math.max(4, Math.floor((at(scene, 3) - l0) / 11)))));
  const listing = f >= l0 && f < at(scene, 3);
  const [a, b] = GAP7[li];
  const spin0 = at(scene, 7, 0.1);
  const spin = f < spin0 ? 0 : Math.min(13, Math.floor((f - spin0) / Math.max(3, Math.floor((at(scene, 8) - spin0) / 14))));
  const set = listing ? [0, a, a + b, 6] : rot(MISS, spin % 13, 13);
  const g = gapsOf(set, 13);
  const sorted = [...set].sort((x, y) => x - y);
  const rowShow = [at(scene, 2, 0.05), at(scene, 3, 0.1), at(scene, 4, 0.05), at(scene, 4, 0.55)];
  const listOut = fadeTo(f, at(scene, 5), 0);
  return (
    <>
      <Stage>
        <Ngon g={BIG} centre={C.red} />
        {sorted.map((v, i) => (
          <Arc key={`${v}-${i}`} g={BIG} a={v} steps={g[i]} color={g[i] > 6 ? C.red : C.blue} opacity={ease(f, at(scene, 0, 0.3) + i * 6, 10)} />
        ))}
        <Shape g={BIG} set={set} color={C.red} />
        {sorted.map((v, i) => (
          <Outside key={`l${i}`} g={BIG} k={v + g[i] / 2} text={`${g[i]}`} color={g[i] > 6 ? C.red : C.blue} opacity={ease(f, at(scene, 0, 0.4) + i * 6, 10)} d={70} />
        ))}
      </Stage>
      <Eq x={1000} y={160} start={at(scene, 0, 0.6)} size={52} opacity={fadeTo(f, at(scene, 2), 0)} tex="2 + 1 + 2 + 8 = 13" />
      <Text x={1000} y={250} w={880} size={42} weight={800} color={C.red} style={{ ...fadeUp(f, at(scene, 1, 0.3)), opacity: ease(f, at(scene, 1, 0.3)) * fadeTo(f, at(scene, 2), 0) }}>
        漏掉：有一个 7 步或更大的大空隙
      </Text>
      {/* table: big gap | the rest | ways */}
      <div style={{ position: 'absolute', left: 1000, top: 150, display: 'grid', gridTemplateColumns: '220px 220px 200px', rowGap: 4, fontSize: 48, fontWeight: 900, textAlign: 'center', opacity: ease(f, at(scene, 2), 10) }}>
        <div style={{ fontSize: 36, color: C.red }}>大空隙</div>
        <div style={{ fontSize: 36, color: C.blue }}>另外三个</div>
        <div style={{ fontSize: 36, color: C.muted }}>种数</div>
        {ROWS.map((row, i) => {
          const o = ease(f, rowShow[i], 10);
          const w = ease(f, i === 0 ? at(scene, 2, 0.9) : rowShow[i] + 14, 10);
          return [
            <div key={`a${i}`} style={{ opacity: o, color: C.red }}>{row.big}</div>,
            <div key={`b${i}`} style={{ opacity: o, color: C.blue }}>{row.rest}</div>,
            <div key={`c${i}`} style={{ opacity: w, color: C.ink }}>{row.ways}</div>,
          ];
        })}
        <div style={{ gridColumn: '1 / 3', fontSize: 44, color: C.muted, textAlign: 'right', paddingRight: 30, opacity: ease(f, at(scene, 5, 0.1), 10) }}>合计</div>
        <div style={{ color: C.green, opacity: ease(f, at(scene, 5, 0.1), 10) }}>20</div>
      </div>
      {/* the ten ways for a big gap of 7 */}
      <div style={{ position: 'absolute', left: 1000, top: 600, width: 880, display: 'grid', gridTemplateColumns: 'repeat(5, 176px)', rowGap: 14, opacity: listOut }}>
        {GAP7.map((s, i) => (
          <div key={i} style={{ opacity: f >= l0 && (li >= i || !listing) ? 1 : 0, fontSize: 48, fontWeight: 800, color: listing && li === i ? C.blue : C.muted }}>
            {s.join('+')}
          </div>
        ))}
      </div>
      <Eq x={1000} y={630} start={at(scene, 6, 0.4)} size={60} color={C.primary} tex={['13 \\times 20 = 260', z('种漏掉')]} />
      <div style={{ position: 'absolute', left: 1000, top: 740, display: 'flex', gap: 24, ...fadeUp(f, at(scene, 7, 0.3)) }}>
        <Pill x={0} y={0} color={C.violet} style={{ position: 'relative', fontSize: 36 }}>数第一个顶点：最快</Pill>
        <Pill x={0} y={0} color={C.blue} style={{ position: 'relative', fontSize: 36, ...fadeUp(f, at(scene, 7, 0.6)) }}>看空隙：讲清为什么</Pill>
      </div>
    </>
  );
};

// ---- traps ----

const TrapRow: React.FC<{ y: number; letter: string; value: string; start: number; ok?: boolean; children: React.ReactNode }> = ({ y, letter, value, start, ok, children }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: 110, top: y, display: 'flex', alignItems: 'center', gap: 34, ...fadeUp(f, start) }}>
      <div style={{ width: 270, height: 96, borderRadius: 22, background: C.card, border: `5px solid ${ok ? C.green : C.red}`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, fontSize: 56, fontWeight: 900 }}>
        <span style={{ color: C.muted, fontSize: 40 }}>{letter}</span>
        {value}
        <span style={{ color: ok ? C.green : C.red, fontSize: 48 }}>{ok ? '✓' : '✗'}</span>
      </div>
      <div style={{ fontSize: 44, fontWeight: 800, whiteSpace: 'nowrap' }}>{children}</div>
    </div>
  );
};

const Traps: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <TrapRow y={110} letter="E" value="715" start={at(scene, 0, 0.1)}>
        所有选法 <Tex tex="715" size={52} />：<span style={{ color: C.red }}>忘了中心</span>
      </TrapRow>
      <TrapRow y={214} letter="A" value="260" start={at(scene, 1, 0.1)}>
        只是漏掉的：<span style={{ color: C.red }}>忘了减</span>
      </TrapRow>
      <TrapRow y={306} letter="D" value="520" start={at(scene, 2, 0.1)}>
        4 个都从后面 6 个里选：<Tex tex="\dbinom{6}{4} = 15" size={52} />
      </TrapRow>
      <div style={{ position: 'absolute', left: 414, top: 470, whiteSpace: 'nowrap', ...fadeUp(f, at(scene, 3, 0.1)) }}>
        <Z p={['13 \\times 15 = 195', z('种漏掉，'), '715 - 195 = 520']} size={52} />
      </div>
      <div style={{ position: 'absolute', left: 414, top: 538, fontSize: 44, fontWeight: 800, whiteSpace: 'nowrap', ...fadeUp(f, at(scene, 4, 0.2)) }}>
        但第一个顶点就是 4 个之一：<Tex tex="\dbinom{6}{3} = 20" size={52} color={C.green} />
      </div>
      <TrapRow y={662} letter="B" value="390" start={at(scene, 5, 0.1)}>
        <Tex tex="715 - 390 = 325 = 13 \times 25" size={52} /> <span style={{ color: C.red }}>可每个顶点只有 20 种</span>
      </TrapRow>
      <div style={{ position: 'absolute', left: 1500, top: 228, ...fadeUp(f, 0) }}>
        <Pill x={0} y={0} color={C.green} style={{ position: 'relative', fontSize: 48 }}>C 455 ✓</Pill>
      </div>
      <div style={{ position: 'absolute', left: 260, top: 772, width: 1400, textAlign: 'center', background: C.primary, color: '#fff', borderRadius: 24, padding: '8px 40px', fontSize: 42, fontWeight: 900, ...fadeUp(f, at(scene, 6, 0.3)) }}>
        包住的不好数？就数漏掉的，再减掉！
      </div>
    </>
  );
};

// ---- variant: triangles in an 11-gon ----

const G11: Geo = { cx: 540, cy: 480, R: 280, n: 11 };
const TRI_HIT = [0, 4, 7];

const Variant: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Stage>
        <Ngon g={G11} start={4} centre={f >= at(scene, 1, 0.5) ? C.green : C.ink} />
        <Shape g={G11} set={TRI_HIT} color={C.primary} progress={ease(f, at(scene, 1, 0.3), 20)} />
      </Stage>
      <Pill x={1000} y={170} color={C.violet} style={fadeUp(f, at(scene, 0, 0.2))}>轮到你了！</Pill>
      <Text x={1000} y={290} w={860} size={56} weight={900} style={fadeUp(f, at(scene, 0, 0.5))}>
        一个<span style={{ color: C.primary }}>正 11 边形</span>。
      </Text>
      <Text x={1000} y={450} w={860} size={50} weight={700} style={fadeUp(f, at(scene, 1, 0.1))}>
        选 <b>3</b> 个顶点，围成三角形。有多少个三角形包含中心？
      </Text>
    </>
  );
};

const VariantAnswer: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const half = at(scene, 1, 0.5);
  const done = at(scene, 5, 0.9);
  return (
    <>
      <Stage>
        <Half g={G11} a={0} opacity={ease(f, half, 12)} />
        <Ngon g={G11} centre={f >= at(scene, 2) ? C.red : C.ink} />
        {range(6).map((i) => (
          <Ring key={i} g={G11} k={i} color={C.violet} opacity={ease(f, half + 6 + i * 4, 8)} />
        ))}
        {range(5).map((i) => (
          <Outside key={i} g={G11} k={i + 1} text={`${i + 1}`} color={C.violet} opacity={ease(f, half + 10 + i * 4, 8)} />
        ))}
        <Outside g={G11} k={0} text="第一个" color={C.violet} opacity={ease(f, half + 4, 8)} d={52} />
        <Shape g={G11} set={[0, 2, 4]} color={C.red} progress={ease(f, at(scene, 2, 0.4), 16)} />
      </Stage>
      <Eq x={1000} y={130} start={at(scene, 0, 0.3)} size={56} tex="\dfrac{11 \times 10 \times 9}{6} = 165" />
      <Eq x={1000} y={290} start={at(scene, 1, 0.3)} size={56} color={C.violet} tex="5 < \dfrac{11}{2} < 6" />
      <Eq x={1000} y={450} start={at(scene, 2, 0.4)} size={56} tex="\dbinom{5}{2} = \dfrac{5 \times 4}{2} = 10" />
      <Eq x={1000} y={610} start={at(scene, 3, 0.3)} size={56} tex={['11 \\times 10 = 110', z('个漏掉')]} />
      <Eq x={1000} y={710} start={at(scene, 4, 0.4)} size={64} color={C.green} tex="165 - 110 = 55" />
      <Answer x={1720} y={440} value="55" chime={CHIME} start={done} />
      <Confetti x={1720} y={440} start={done} seed={11} />
    </>
  );
};

const Recap: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const cardOut = fadeTo(f, at(scene, 2));
  const g: Geo = { cx: 1500, cy: 520, R: 190, n: 13 };
  return (
    <>
      <div style={{ position: 'absolute', left: 120, top: 150, width: 1680, height: 660, background: C.card, borderRadius: 40, boxShadow: '0 10px 40px rgba(30,40,80,0.08)', opacity: ease(f, 0, 14) * cardOut }}>
        <div style={{ position: 'absolute', left: 70, top: 50, fontSize: 44, fontWeight: 900, color: C.primary, ...fadeUp(f, 4) }}>核心思路</div>
        <div style={{ position: 'absolute', left: 70, top: 130, width: 1000, fontSize: 60, fontWeight: 900, lineHeight: 1.2, ...fadeUp(f, at(scene, 0, 0.3)) }}>
          包住的不好数？<br />就数漏掉的，再减掉。
        </div>
        <div style={{ position: 'absolute', left: 70, top: 400, width: 1000, fontSize: 48, fontWeight: 800, color: C.violet, lineHeight: 1.3, ...fadeUp(f, at(scene, 1, 0.1)) }}>
          这道题里，漏掉的情况所有顶点都在同一个半圆里。按第一个顶点来数。
        </div>
      </div>
      <Stage>
        <g opacity={ease(f, at(scene, 1, 0.3), 14) * cardOut}>
          <Half g={g} a={0} opacity={1} />
          <Ngon g={g} centre={C.red} />
          <Shape g={g} set={MISS} color={C.red} />
          <Outside g={g} k={0} text="第一个" color={C.violet} opacity={1} d={46} />
        </g>
      </Stage>
      <SignOff start={at(scene, 2, 0.1)} text="继续探索！" tagline="你的家庭 AI 教练" />
      <Confetti x={960} y={380} start={at(scene, 2, 0.2)} seed={3} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = {
  intro: Intro,
  question: Question,
  asked: Asked,
  try1: makePause(13, 4, 9),
  miss: Miss,
  count: Count,
  gaps: Gaps,
  traps: Traps,
  variant: Variant,
  try2: makePause(11, 3, 9),
  'variant-answer': VariantAnswer,
  recap: Recap,
};

export const Video: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <Explainer timeline={timeline} scenes={SCENES} badge="AMC 10 风格 · 第4级" font={ZH_FONT} /> : null;

