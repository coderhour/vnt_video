import { Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { clamp, ease, fadeTo, fadeUp, pop } from '../../lib/anim';
import { Explainer, at, type SceneComponent, type Timeline } from '../../lib/Explainer';
import { Countdown } from '../../lib/PauseCard';
import { Poly, Stage, XMark, type Pt } from '../../lib/grid';
import { PACIFICO } from '../../lib/fonts';
import { Tex } from '../../lib/Tex';
import { Answer, Choices, Confetti, Mark, Pill, Text } from '../../lib/ui';
import { C } from '../../lib/theme';

export const SLUG = '2026-10-31-scalene-perimeter-36';
const CHIME = staticFile(`${SLUG}/sfx/fs-541985.mp3`); // Freesound CC0, see sfx/FREESOUND-CREDITS.md
const TICK = staticFile(`${SLUG}/sfx/fs-668355.mp3`);

const CARD_SHADOW = '0 6px 22px rgba(30,40,80,0.08)';
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const seg = (f: number, a: number, b: number) => Math.max(0, Math.min(1, (f - a) / Math.max(1, b - a)));

// ---------- to-scale triangles ----------

/** Vertices of the triangle with sides a, b, c (base c along the bottom), y grows downward, in side-length units. */
const geom = (a: number, b: number, c: number): Pt[] => {
  const x = (b * b + c * c - a * a) / (2 * c);
  const y = Math.sqrt(Math.max(0, b * b - x * x));
  return [[0, 0], [c, 0], [x, -y]];
};
/** Centre the bounding box on (cx, cy) and scale by `u` px per unit. */
const place = (pts: Pt[], cx: number, cy: number, u: number): Pt[] => {
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const mx = (Math.min(...xs) + Math.max(...xs)) / 2;
  const my = (Math.min(...ys) + Math.max(...ys)) / 2;
  return pts.map((p): Pt => [cx + (p[0] - mx) * u, cy + (p[1] - my) * u]);
};
const mix = (p: Pt[], q: Pt[], t: number): Pt[] => p.map((a, i): Pt => [lerp(a[0], q[i][0], t), lerp(a[1], q[i][1], t)]);

/** Side labels at the middle of each edge (AB, BC, CA), pushed away from the centre. */
const SideLabels: React.FC<{ pts: Pt[]; labels: React.ReactNode[]; op?: number; push?: number; size?: number; color?: string }> = ({ pts, labels, op = 1, push = 46, size = 52, color = C.ink }) => {
  if (op <= 0) return null;
  const g: Pt = [(pts[0][0] + pts[1][0] + pts[2][0]) / 3, (pts[0][1] + pts[1][1] + pts[2][1]) / 3];
  return (
    <>
      {labels.map((l, i) => {
        const a = pts[i];
        const b = pts[(i + 1) % 3];
        const m: Pt = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
        let dx = m[0] - g[0];
        let dy = m[1] - g[1];
        const n = Math.hypot(dx, dy) || 1;
        dx /= n; dy /= n;
        if (n < 1) { dx = 0; dy = -1; }
        return (
          <div key={i} style={{ position: 'absolute', left: m[0] + dx * push - 100, top: m[1] + dy * push - 36, width: 200, textAlign: 'center', fontSize: size, fontWeight: 900, color, opacity: op, lineHeight: '72px' }}>
            {l}
          </div>
        );
      })}
    </>
  );
};

// ---------- small helpers ----------

const Tag: React.FC<{ x: number; y: number; start: number; color: string; children: React.ReactNode; size?: number }> = ({ x, y, start, color, children, size = 42 }) => {
  const f = useCurrentFrame();
  return <Pill x={x} y={y} color={color} style={{ ...fadeUp(f, start), fontSize: size, whiteSpace: 'nowrap' }}>{children}</Pill>;
};

const Eq: React.FC<{ x: number; y: number; start: number; tex: string; size?: number; color?: string; style?: React.CSSProperties }> = ({ x, y, start, tex, size = 56, color = C.ink, style }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: x, top: y, whiteSpace: 'nowrap', ...fadeUp(f, start), ...style }}>
      <Tex tex={tex} size={size} color={color} />
    </div>
  );
};

const Box: React.FC<{ x: number; y: number; w: number; start: number; children: React.ReactNode; color?: string; size?: number }> = ({ x, y, w, start, children, color = C.violet, size = 42 }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, background: C.card, borderRadius: 22, borderLeft: `12px solid ${color}`, padding: '14px 30px', fontSize: size, fontWeight: 800, lineHeight: 1.35, boxShadow: CARD_SHADOW, ...fadeUp(f, start) }}>
      {children}
    </div>
  );
};

const QCard: React.FC<{ x: number; y: number; w: number; size?: number; children: React.ReactNode; start?: number }> = ({ x, y, w, size = 44, children, start = 4 }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, background: C.card, borderRadius: 32, padding: '28px 40px', fontSize: size, fontWeight: 600, lineHeight: 1.45, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', ...fadeUp(f, start) }}>
      {children}
    </div>
  );
};

const CHOICES = ['17', '19', '20', '27', '35'];
const ChoiceRow: React.FC<{ x: number; y: number; start: (i: number) => number; hi?: number; hiAt?: number; dim?: number }> = ({ x, y, start, hi, hiAt = 0 }) => {
  const f = useCurrentFrame();
  const on = hi !== undefined ? ease(f, hiAt, 12) : 0;
  return (
    <div style={{ position: 'absolute', left: x, top: y, display: 'flex', gap: 22 }}>
      {CHOICES.map((c, i) => {
        const h = i === hi ? on : 0;
        return (
          <div key={c} style={{ ...fadeUp(f, start(i), 10), background: h > 0.5 ? C.green : C.card, color: h > 0.5 ? '#fff' : C.ink, borderRadius: 18, padding: '12px 26px', fontSize: 52, fontWeight: 800, boxShadow: CARD_SHADOW, transform: `scale(${1 + h * 0.12})` }}>
            <span style={{ opacity: 0.6, fontSize: 36, marginRight: 12 }}>{'ABCDE'[i]}</span>
            {c}
          </div>
        );
      })}
    </div>
  );
};

// ---------- list table (rows of chips 'a, b') ----------

type RowCfg = { c: number; add: number; pairs: [number, number][]; chipFrom: number; chipTo: number; addAt: number; cnt: number; cntAt: number; note?: { tex: string; at: number } };
const CHIP_X = 540;
const CHIP_PITCH = 158;

const ListTable: React.FC<{ rows: RowCfg[]; y0: number; pitch: number; bubbleX: number; op?: number }> = ({ rows, y0, pitch, bubbleX, op = 1 }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ opacity: op }}>
      {rows.map((r, ri) => {
        const y = y0 + ri * pitch;
        const n = r.pairs.length;
        const bp = pop(f, r.cntAt);
        return (
          <div key={r.c}>
            <div style={{ position: 'absolute', left: 50, top: y, width: 1810, height: 96, background: C.card, borderRadius: 26, boxShadow: '0 3px 12px rgba(30,40,80,0.06)' }} />
            <div style={{ position: 'absolute', left: 80, top: y, height: 96, display: 'flex', alignItems: 'center', fontSize: 46, fontWeight: 900 }}>
              <span style={{ color: C.muted, fontSize: 32, marginRight: 10, fontWeight: 800 }}>longest</span>{r.c}
            </div>
            <div style={{ position: 'absolute', left: 340, top: y, height: 96, display: 'flex', alignItems: 'center', fontSize: 36, fontWeight: 800, color: C.muted, opacity: ease(f, r.addAt, 10), whiteSpace: 'nowrap' }}>
              add to {r.add}
            </div>
            {r.pairs.map((p, i) => {
              const s = pop(f, Math.round(lerp(r.chipFrom, r.chipTo, n > 1 ? i / (n - 1) : 0)));
              if (s <= 0) return null;
              return (
                <div key={i} style={{ position: 'absolute', left: CHIP_X + i * CHIP_PITCH, top: y + 15, width: 148, height: 66, borderRadius: 18, background: C.violetSoft, border: `3px solid ${C.violet}`, color: C.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44, fontWeight: 900, transform: `scale(${s})`, opacity: Math.min(1, s) }}>
                  {p[0]}, {p[1]}
                </div>
              );
            })}
            {r.note && (
              <div style={{ position: 'absolute', left: CHIP_X, top: y + 8, opacity: ease(f, r.note.at, 10), whiteSpace: 'nowrap' }}>
                <Tex tex={r.note.tex} size={52} color={C.red} />
              </div>
            )}
            {bp > 0 && (
              <div style={{ position: 'absolute', left: bubbleX, top: y - 2, width: 100, height: 100, borderRadius: '50%', background: r.cnt === 0 ? C.muted : C.violet, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 62, fontWeight: 900, transform: `scale(${bp})` }}>
                {r.cnt}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const pairs = (list: [number, number][]) => list;
const P17: [number, number][] = [[3, 16], [4, 15], [5, 14], [6, 13], [7, 12], [8, 11], [9, 10]];
const P16: [number, number][] = [[5, 15], [6, 14], [7, 13], [8, 12], [9, 11]];
const P15: [number, number][] = [[7, 14], [8, 13], [9, 12], [10, 11]];
const P14: [number, number][] = [[9, 13], [10, 12]];
const P13: [number, number][] = [[11, 12]];

// ---------- scenes ----------

const U = 30; // px per side unit in the intro
const T1 = place(geom(10, 12, 14), 960, 450, U);
const T2 = place(geom(5, 15, 16), 960, 450, U);
const T3 = place(geom(11, 12, 13), 960, 450, U);
const FLAT = place([[0, 0], [18, 0], [9, 0]], 960, 450, U);

const Intro: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l1 = at(scene, 1);
  const l2 = at(scene, 2);
  const l3 = at(scene, 3);
  const t12 = seg(f, l1 + 6, l1 + 26);
  const t23 = seg(f, l1 + 50, l1 + 72);
  const t3f = seg(f, l2 + 8, l2 + 50);
  let pts = mix(mix(T1, T2, t12), T3, t23);
  pts = mix(pts, FLAT, t3f);
  // labels only while a shape rests: fade out during each morph
  const rest1 = f < l1 + 4 ? 1 : 1 - seg(f, l1 + 4, l1 + 10);
  const shape2 = seg(f, l1 + 26, l1 + 32) * (1 - seg(f, l1 + 44, l1 + 50));
  const shape3 = seg(f, l1 + 72, l1 + 78) * (1 - seg(f, l2 - 2, l2 + 4));
  const flatL = seg(f, l2 + 52, l2 + 62);
  const fade = fadeTo(f, l3, 0, 12);
  return (
    <>
      <div style={{ opacity: fade }}>
        <Stage>
          <Poly pts={pts} progress={ease(f, 4, 30)} color={C.violet} width={9} fill={C.violet} fillOpacity={0.12} />
        </Stage>
        <div style={{ position: 'absolute', left: 760, top: 140, width: 400, textAlign: 'center', ...fadeUp(f, 14) }}>
          <span style={{ background: C.primary, color: '#fff', borderRadius: 999, padding: '8px 30px', fontSize: 46, fontWeight: 900 }}>string: 36</span>
        </div>
        {/* AB, BC, CA = c, a, b ; for each shape: [c, a, b] */}
        <SideLabels pts={pts} labels={[14, 10, 12]} op={rest1 * ease(f, at(scene, 0, 0.6), 10)} />
        <SideLabels pts={pts} labels={[16, 5, 15]} op={shape2} />
        <SideLabels pts={pts} labels={[13, 11, 12]} op={shape3} />
        <div style={{ opacity: flatL }}>
          {[[-4.5, -1, 9], [4.5, -1, 9], [0, 1, 18]].map(([ox, oy, v], i) => (
            <div key={i} style={{ position: 'absolute', left: 960 + ox * U - 60, top: 450 + oy * 52 - 36, width: 120, textAlign: 'center', fontSize: 52, fontWeight: 900, lineHeight: '72px' }}>{v}</div>
          ))}
        </div>
        <div style={{ position: 'absolute', left: 560, top: 640, width: 800, textAlign: 'center', ...fadeUp(f, at(scene, 2, 0.75)), fontSize: 50, fontWeight: 900, color: C.red }}>
          flat, so not a triangle
        </div>
        <Stage>
          <XMark at={[1420, 450]} size={90} opacity={ease(f, at(scene, 2, 0.7), 8)} />
        </Stage>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', ...fadeUp(f, at(scene, 3, 0.1)) }}>
        <div style={{ fontFamily: PACIFICO, fontSize: 140, color: C.violet }}>Vantee</div>
        <div style={{ fontSize: 56, fontWeight: 900, marginTop: 10 }}>your math tutor</div>
      </div>
    </>
  );
};

const Q_TEXT = (
  <>
    How many triangles have whole-number side lengths and a perimeter of 36, and have three different side lengths?
  </>
);

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const s = (i: number) => ({ opacity: ease(f, at(scene, i), 10) });
  return (
    <>
      <QCard x={90} y={150} w={1100} size={50} start={4}>
        <span style={s(0)}>How many triangles have <Mark on={at(scene, 1, 0.3)}>whole-number</Mark> side lengths and a <Mark on={at(scene, 1, 0.7)}>perimeter of 36</Mark>, </span>
        <span style={s(2)}>and have <Mark on={at(scene, 2, 0.3)}>three different</Mark> side lengths?</span>
      </QCard>
      <Tag x={90} y={450} start={at(scene, 1, 0.45)} color={C.primary} size={44}>whole-number sides</Tag>
      <Tag x={650} y={450} start={at(scene, 1, 0.8)} color={C.violet} size={44}>perimeter 36</Tag>
      <Tag x={90} y={545} start={at(scene, 2, 0.4)} color={C.amber} size={44}>all three sides different</Tag>
      <ChoiceRow x={90} y={680} start={(i) => at(scene, 3, 0.2 + i * 0.13)} />
    </>
  );
};

const Asked: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const a = geom(10, 12, 14);
  const t1 = place(a, 480, 380, 38);
  const eq = place(geom(12, 12, 12), 1380, 380, 38);
  return (
    <>
      <Stage>
        <Poly pts={t1} progress={ease(f, at(scene, 0, 0.5), 24)} color={C.violet} width={8} fill={C.violet} />
        <Poly pts={eq} progress={ease(f, at(scene, 1, 0.3), 24)} color={C.red} width={8} fill={C.red} />
        <XMark at={[1380, 400]} size={110} opacity={ease(f, at(scene, 1, 0.75), 8)} />
      </Stage>
      <SideLabels pts={[t1[0], t1[1], t1[2]]} labels={[14, 10, 12]} op={ease(f, at(scene, 0, 0.6), 10)} />
      <SideLabels pts={eq} labels={[12, 12, 12]} op={ease(f, at(scene, 1, 0.5), 10)} />
      <Eq x={170} y={665} start={at(scene, 0, 0.7)} tex={'10+12+14=36'} size={64} />
      <div style={{ position: 'absolute', left: 900, top: 668, fontSize: 64, fontWeight: 900, color: C.green, opacity: ease(f, at(scene, 0, 0.9), 8) }}>✓</div>
      <Text x={1380} y={680} w={700} size={48} weight={900} color={C.red} align="center" style={fadeUp(f, at(scene, 1, 0.8))}>sides repeat</Text>
      <Tag x={90} y={770} start={at(scene, 2, 0.15)} color={C.violet} size={42}>same three sides, any order = one triangle</Tag>
    </>
  );
};

const Pause1: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <QCard x={90} y={170} w={1050} size={50} start={6}>{Q_TEXT}</QCard>
      <Tag x={90} y={560} start={14} color={C.amber} size={44}>perimeter 36 · three different sides</Tag>
      <ChoiceRow x={90} y={690} start={() => 10} />
      <Countdown scene={scene} seconds={10} x={1560} y={520} tick={TICK} />
      {f < 0 && null}
    </>
  );
};

const Rule: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  // flat demo 9, 9, 18: two bars of 9 laid on the bar of 18
  const dx = 1010;
  const u = 44;
  return (
    <>
      <div style={{ position: 'absolute', left: 90, top: 150, display: 'flex', alignItems: 'center', gap: 18, whiteSpace: 'nowrap', ...fadeUp(f, at(scene, 0, 0.6)) }}>
        {['smallest', 'middle', 'longest'].map((t, i) => (
          <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <div style={{ background: [C.primary, C.blue, C.violet][i], color: '#fff', borderRadius: 999, padding: '8px 28px', fontSize: 42, fontWeight: 900 }}>{t}</div>
            {i < 2 && <span style={{ fontSize: 56, fontWeight: 900, color: C.muted }}>&lt;</span>}
          </div>
        ))}
      </div>
      <Box x={90} y={270} w={880} start={at(scene, 1, 0.3)} color={C.violet} size={42}>
        The two shorter sides must add to <span style={{ color: C.red }}>MORE</span> than the longest side
      </Box>
      {/* demo: 9 + 9 laid along 18 */}
      <div style={{ position: 'absolute', left: dx, top: 150, opacity: ease(f, at(scene, 1, 0.55), 10), fontSize: 40, fontWeight: 800, color: C.muted }}>9, 9, 18 lies flat</div>
      <div style={{ position: 'absolute', left: dx + 20, top: 215, display: 'flex', gap: 6, opacity: ease(f, at(scene, 1, 0.6), 10) }}>
        <div style={{ width: 9 * u - 3, height: 54, borderRadius: '16px 4px 4px 16px', background: C.blue, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, fontWeight: 900, transform: `translateX(${0}px)` }}>9</div>
        <div style={{ width: 9 * u - 3, height: 54, borderRadius: '4px 16px 16px 4px', background: C.primary, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, fontWeight: 900 }}>9</div>
      </div>
      <div style={{ position: 'absolute', left: dx + 20, top: 300, width: 18 * u, height: 54, borderRadius: 16, background: C.violet, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, fontWeight: 900, opacity: ease(f, at(scene, 1, 0.7), 10) }}>18</div>
      <Eq x={dx + 20} y={370} start={at(scene, 1, 0.8)} tex={'9+9=18 \\;\\text{, not more}'} size={52} color={C.red} />
      <Eq x={90} y={470} start={at(scene, 2, 0.35)} tex={'36-\\text{longest}>\\text{longest} \\;\\Rightarrow\\; \\text{longest}<18'} size={60} />
      <Eq x={90} y={570} start={at(scene, 3, 0.35)} tex={'\\text{longest}\\ge 36\\div 3=12'} size={60} />
      {/* range bar */}
      <div style={{ position: 'absolute', left: 90, top: 690, ...fadeUp(f, at(scene, 4, 0.1)), fontSize: 46, fontWeight: 900, color: C.muted }}>longest side</div>
      <div style={{ position: 'absolute', left: 430, top: 670, display: 'flex', gap: 10, ...fadeUp(f, at(scene, 4, 0.15)) }}>
        {[12, 13, 14, 15, 16, 17].map((n, i) => {
          const p = ease(f, at(scene, 4, 0.2 + i * 0.1), 8);
          return (
            <div key={n} style={{ width: 130, height: 100, borderRadius: i === 0 ? '28px 8px 8px 28px' : i === 5 ? '8px 28px 28px 8px' : 8, background: p > 0.5 ? C.primary : C.line, color: p > 0.5 ? '#fff' : C.muted, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 56, fontWeight: 900 }}>
              {n}
            </div>
          );
        })}
      </div>
    </>
  );
};

const List: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const L = (i: number, t = 0) => at(scene, i, t);
  const rows: RowCfg[] = [
    { c: 17, add: 19, pairs: P17, chipFrom: L(1, 0.05), chipTo: L(1, 0.7), addAt: L(0, 0.55), cnt: 7, cntAt: L(1, 0.85) },
    { c: 16, add: 20, pairs: P16, chipFrom: L(3, 0.52), chipTo: L(3, 0.88), addAt: L(3, 0.1), cnt: 5, cntAt: L(4, 0.4) },
    { c: 15, add: 21, pairs: P15, chipFrom: L(5, 0.1), chipTo: L(5, 0.6), addAt: L(5, 0.02), cnt: 4, cntAt: L(5, 0.82) },
    { c: 14, add: 22, pairs: P14, chipFrom: L(6, 0.06), chipTo: L(6, 0.16), addAt: L(6, 0.02), cnt: 2, cntAt: L(6, 0.3) },
    { c: 13, add: 23, pairs: P13, chipFrom: L(6, 0.75), chipTo: L(6, 0.75), addAt: L(6, 0.4), cnt: 1, cntAt: L(6, 0.88) },
    { c: 12, add: 24, pairs: [], chipFrom: 0, chipTo: 0, addAt: L(7, 0.02), cnt: 0, cntAt: L(7, 0.25), note: { tex: '10+11=21<24', at: L(7, 0.4) } },
  ];
  const last = L(8);
  const endF = last + scene.lines[8].frames;
  const dim = 1 - 0.92 * ease(f, last, 12);
  const terms = ['7', '+', '5', '+', '4', '+', '2', '+', '1'];
  return (
    <>
      <ListTable rows={rows} y0={195} pitch={108} bubbleX={1720} op={dim} />
      <div style={{ position: 'absolute', left: 700, top: 96, ...fadeUp(f, L(2, 0.5)), opacity: ease(f, L(2, 0.5), 10) * (1 - ease(f, L(3), 8)), background: C.card, borderRadius: 22, padding: '2px 28px', border: `3px solid ${C.violet}`, whiteSpace: 'nowrap' }}>
        <Tex tex={'\\text{smallest}<\\text{middle}<17'} size={48} />
      </div>
      {/* final sum: terms in as spoken, 19 on the last line only */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 190, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 18, whiteSpace: 'nowrap' }}>
        {terms.map((t, i) => (
          <span key={i} style={{ fontSize: 100, fontWeight: 900, color: i % 2 ? C.muted : C.violet, ...fadeUp(f, last + Math.round(i * scene.lines[8].frames * 0.075), 8) }}>{t}</span>
        ))}
        <span style={{ fontSize: 100, fontWeight: 900, color: C.muted, ...fadeUp(f, last + Math.round(scene.lines[8].frames * 0.7), 8) }}>=</span>
        <span style={{ fontSize: 100, fontWeight: 900, color: C.green, ...fadeUp(f, last + Math.round(scene.lines[8].frames * 0.75), 8) }}>19</span>
      </div>
      <ChoiceRow x={560} y={700} start={() => last + 4} hi={1} hiAt={endF - 14} />
      <Answer x={960} y={500} value="19" start={endF - 10} chime={CHIME} />
    </>
  );
};

// ---------- solution 2 ----------

const Subtract: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const L = (i: number, t = 0) => at(scene, i, t);
  const iso = place(geom(11, 11, 14), 440, 560, 38);
  const nums: [number, number][] = [[17, 8], [16, 7], [15, 5], [14, 4], [13, 2], [12, 1]];
  const out = ease(f, L(8), 12);
  const chips = [10, 11, 12, 13, 14, 15, 16, 17];
  const tick = (a: Pt, b: Pt) => {
    const m: Pt = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const d = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const ux = (b[0] - a[0]) / d, uy = (b[1] - a[1]) / d;
    const nx = -uy, ny = ux;
    return [-7, 7].map((o, k) => <line key={k} x1={m[0] + ux * o - nx * 18} y1={m[1] + uy * o - ny * 18} x2={m[0] + ux * o + nx * 18} y2={m[1] + uy * o + ny * 18} stroke={C.violet} strokeWidth={7} strokeLinecap="round" />);
  };
  return (
    <>
      <Tag x={90} y={120} start={L(0, 0.35)} color={C.violet} size={42}>all triangles − ones with a repeat</Tag>
      {/* counts of ALL triangles by longest side */}
      <div style={{ position: 'absolute', left: 90, top: 205, display: 'flex', alignItems: 'flex-end', gap: 12, whiteSpace: 'nowrap', opacity: 1 }}>
        {nums.map(([c, n], i) => (
          <div key={c} style={{ display: 'flex', alignItems: 'flex-end', gap: 12, ...fadeUp(f, L(1, 0.1 + i * 0.1), 10) }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 34, fontWeight: 800, color: C.muted }}>longest {c}</div>
              <div style={{ fontSize: 76, fontWeight: 900, color: C.violet, lineHeight: 1.1 }}>{n}</div>
            </div>
            {i < 5 && <span style={{ fontSize: 66, fontWeight: 900, color: C.muted, marginBottom: 2 }}>+</span>}
          </div>
        ))}
        <span style={{ fontSize: 76, fontWeight: 900, color: C.ink, marginLeft: 6, ...fadeUp(f, L(1, 0.8), 10) }}>= 27</span>
      </div>
      {/* isosceles card */}
      <div style={{ opacity: 1 - out }}>
        <Stage>
          <Poly pts={iso} progress={ease(f, L(2, 0.3), 24)} color={C.violet} width={9} fill={C.violet} />
          <g opacity={ease(f, L(2, 0.7), 10)}>
            {tick(iso[0], iso[2])}
            {tick(iso[1], iso[2])}
          </g>
        </Stage>
        <div style={{ position: 'absolute', left: (iso[0][0] + iso[2][0]) / 2 - 105, top: (iso[0][1] + iso[2][1]) / 2 - 36, fontSize: 60, fontWeight: 900, color: C.violet, opacity: ease(f, L(2, 0.7), 10), fontStyle: 'italic' }}>x</div>
        <div style={{ position: 'absolute', left: (iso[1][0] + iso[2][0]) / 2 + 55, top: (iso[1][1] + iso[2][1]) / 2 - 36, fontSize: 60, fontWeight: 900, color: C.violet, opacity: ease(f, L(2, 0.7), 10), fontStyle: 'italic' }}>x</div>
        <Eq x={iso[0][0] + 130} y={iso[0][1] + 20} start={L(3, 0.45)} tex={'36-2x'} size={60} />
        {/* inequality rows */}
        <Eq x={880} y={375} start={L(4, 0.3)} tex={'36-2x>0'} size={56} />
        <Eq x={1280} y={375} start={L(4, 0.62)} tex={'\\Rightarrow\\; x<18'} size={56} color={C.green} />
        <Eq x={880} y={460} start={L(5, 0.15)} tex={'x+x>36-2x'} size={56} />
        <Eq x={880} y={545} start={L(5, 0.45)} tex={'4x>36'} size={56} />
        <Eq x={1280} y={545} start={L(5, 0.75)} tex={'\\Rightarrow\\; x>9'} size={56} color={C.green} />
        {/* x = 10 … 17 */}
        <div style={{ position: 'absolute', left: 880, top: 680, display: 'flex', alignItems: 'center', gap: 10, whiteSpace: 'nowrap' }}>
          <span style={{ fontSize: 52, fontWeight: 900, color: C.muted, marginRight: 4, opacity: ease(f, L(6, 0.05), 8), fontStyle: 'italic' }}>x =</span>
          {chips.map((n, i) => {
            const s = pop(f, L(6, 0.1 + i * 0.07));
            const hi = n === 12 ? ease(f, L(7, 0.3), 10) : 0;
            return (
              <div key={n} style={{ width: 100, height: 76, borderRadius: 20, background: hi > 0.5 ? C.amber : C.violetSoft, border: `3px solid ${hi > 0.5 ? C.amber : C.violet}`, color: hi > 0.5 ? '#fff' : C.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 52, fontWeight: 900, transform: `scale(${s * (1 + hi * 0.1)})`, opacity: Math.min(1, s) }}>
                {n}
              </div>
            );
          })}
        </div>
        <Tag x={880} y={780} start={L(6, 0.75)} color={C.violet} size={44}>8 triangles</Tag>
        <Eq x={1200} y={776} start={L(7, 0.4)} tex={'12,12,12'} size={56} color={C.amber} />
        <Text x={1510} y={790} w={370} size={40} weight={800} color={C.amber} style={fadeUp(f, L(7, 0.45))}>equilateral, once</Text>
      </div>
      {/* 27 − 8 = 19 */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 440, textAlign: 'center', whiteSpace: 'nowrap', fontSize: 140, fontWeight: 900, ...fadeUp(f, L(8, 0.25)) }}>
        <span style={{ color: C.violet }}>27</span> <span style={{ color: C.muted }}>−</span> <span style={{ color: C.amber }}>8</span> <span style={{ color: C.muted }}>=</span> <span style={{ color: C.green }}>19</span>
      </div>
      <Text x={960} y={650} w={1200} size={50} weight={900} color={C.muted} align="center" style={fadeUp(f, L(9, 0.5))}>count the leftovers</Text>
    </>
  );
};

// ---------- traps ----------

const TrapRow: React.FC<{ y: number; letter: string; value: string; start: number; good?: boolean; children: React.ReactNode }> = ({ y, letter, value, start, good, children }) => {
  const f = useCurrentFrame();
  const col = good ? C.green : C.red;
  const on = ease(f, start, 10);
  return (
    <div style={{ position: 'absolute', left: 90, top: y, width: 1770, height: 112, opacity: 0.35 + 0.65 * on }}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: 240, height: 100, borderRadius: 24, background: on > 0.5 ? col : C.card, color: on > 0.5 ? '#fff' : C.ink, boxShadow: CARD_SHADOW, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 58, fontWeight: 900 }}>
        <span style={{ opacity: 0.65, fontSize: 38, marginRight: 14 }}>{letter}</span>
        {value}
      </div>
      <div style={{ position: 'absolute', left: 280, top: 0, height: 100, display: 'flex', alignItems: 'center', gap: 26, whiteSpace: 'nowrap' }}>{children}</div>
    </div>
  );
};

const Traps: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const L = (i: number, t = 0) => at(scene, i, t);
  const fu = (s: number) => fadeUp(f, s);
  const chipStyle: React.CSSProperties = { width: 148, height: 66, borderRadius: 18, background: C.violetSoft, border: `3px solid ${C.violet}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44, fontWeight: 900 };
  return (
    <>
      <TrapRow y={140} letter="D" value="27" start={L(0, 0.25)}>
        <div style={fu(L(0, 0.45))}><Tex tex={'27=\\text{every triangle}'} size={52} /></div>
        <div style={{ ...fu(L(0, 0.75)), fontSize: 40, fontWeight: 800, color: C.red }}>repeats still in</div>
      </TrapRow>
      <TrapRow y={275} letter="C" value="20" start={L(1, 0.1)}>
        <div style={{ ...fu(L(1, 0.5)), position: 'relative' }}>
          <div style={{ ...chipStyle, width: 230, border: `4px dashed ${C.red}`, background: 'rgba(239,67,67,0.1)', fontSize: 42 }}>12, 12, 12</div>
        </div>
        <div style={{ ...fu(L(1, 0.6)), fontSize: 40, fontWeight: 800, color: C.red }}>forgot this one</div>
        <div style={fu(L(2, 0.3))}><Tex tex={'27-7=20'} size={56} /></div>
      </TrapRow>
      <TrapRow y={410} letter="E" value="35" start={L(3, 0.35)}>
        <div style={fu(L(3, 0.5))}><Tex tex={'35>27'} size={56} /></div>
        <div style={{ ...fu(L(3, 0.65)), fontSize: 40, fontWeight: 800, color: C.red }}>only 27 triangles in all</div>
      </TrapRow>
      <TrapRow y={545} letter="A" value="17" start={L(4, 0.2)}>
        <div style={fu(L(4, 0.5))}><Tex tex={'19-2=17'} size={56} /></div>
        <div style={{ ...fu(L(5, 0.15)), display: 'flex', alignItems: 'center', gap: 14, position: 'relative' }}>
          <span style={{ fontSize: 38, fontWeight: 800, color: C.muted }}>longest 14</span>
          <div style={chipStyle}>9, 13</div>
          <div style={chipStyle}>10, 12</div>
          <div style={{ position: 'absolute', left: 208, right: 0, top: 31, height: 6, background: C.red, borderRadius: 3, transform: `scaleX(${ease(f, L(5, 0.4), 10)})`, transformOrigin: 'left' }} />
        </div>
      </TrapRow>
      <TrapRow y={680} letter="B" value="19" start={L(6, 0.4)} good>
        <div style={{ ...fu(L(6, 0.5)), fontSize: 42, fontWeight: 800, color: C.green }}>the organized list keeps every triangle</div>
      </TrapRow>
    </>
  );
};

// ---------- variant ----------

const VAR_TEXT = <>How many triangles have whole-number side lengths, a perimeter of 24, and three different side lengths?</>;

const Variant: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Pill x={90} y={130} color={C.violet} style={{ ...fadeUp(f, 4), fontSize: 42 }}>Your turn</Pill>
      <QCard x={90} y={230} w={1100} size={52} start={at(scene, 0, 0.5)}>
        <span>Same question, new perimeter: </span>
        <Mark on={at(scene, 0, 0.9)}>24</Mark>
        <span style={{ opacity: ease(f, at(scene, 1) - 4, 10) }}>. {VAR_TEXT}</span>
      </QCard>
      <div style={{ position: 'absolute', left: 1340, top: 230, fontFamily: PACIFICO, fontSize: 0 }} />
      <div style={{ position: 'absolute', left: 1300, top: 270, width: 520, textAlign: 'center', ...fadeUp(f, at(scene, 0, 0.3)) }}>
        <div style={{ fontSize: 40, fontWeight: 800, color: C.muted }}>perimeter</div>
        <div style={{ fontSize: 210, fontWeight: 900, color: C.violet, lineHeight: 1 }}>24</div>
      </div>
    </>
  );
};

const Pause2: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <QCard x={90} y={170} w={1050} size={50} start={6}>
        <>Perimeter <b>24</b>. {VAR_TEXT}</>
      </QCard>
      <Tag x={90} y={620} start={14} color={C.amber} size={44}>perimeter 24 · three different sides</Tag>
      <Countdown scene={scene} seconds={12} x={1560} y={520} tick={TICK} />
      {f < 0 && null}
    </>
  );
};

const VariantAnswer: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const L = (i: number, t = 0) => at(scene, i, t);
  const rows: RowCfg[] = [
    { c: 11, add: 13, pairs: [[3, 10], [4, 9], [5, 8], [6, 7]], chipFrom: L(2, 0.12), chipTo: L(2, 0.65), addAt: L(1, 0.4), cnt: 4, cntAt: L(2, 0.88) },
    { c: 10, add: 14, pairs: [[5, 9], [6, 8]], chipFrom: L(3, 0.35), chipTo: L(3, 0.55), addAt: L(3, 0.05), cnt: 2, cntAt: L(3, 0.85) },
    { c: 9, add: 15, pairs: [[7, 8]], chipFrom: L(4, 0.2), chipTo: L(4, 0.2), addAt: L(4, 0.02), cnt: 1, cntAt: L(4, 0.45) },
    { c: 8, add: 16, pairs: [], chipFrom: 0, chipTo: 0, addAt: L(4, 0.55), cnt: 0, cntAt: L(4, 0.85) },
  ];
  const end5 = L(5) + scene.lines[5].frames;
  const n5 = scene.lines[5].frames;
  const badge = pop(f, end5 - 19);
  return (
    <>
      <Eq x={700} y={118} start={L(0, 0.3)} tex={'8\\le \\text{longest}<12'} size={56} style={{}} />
      <ListTable rows={rows} y0={230} pitch={124} bubbleX={1250} />
      <div style={{ position: 'absolute', left: 1420, top: 230, width: 440, textAlign: 'center', whiteSpace: 'nowrap' }}>
        <div style={{ display: 'inline-flex', gap: 12, fontSize: 84, fontWeight: 900 }}>
          {['4', '+', '2', '+', '1', '=', '7'].map((t, i) => (
            <span key={i} style={{ color: i === 6 ? C.green : i % 2 ? C.muted : C.violet, ...fadeUp(f, L(5, 0.05 + i * 0.1), 8) }}>{t}</span>
          ))}
        </div>
      </div>
      <Sequence from={end5 - 6} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      {badge > 0 && (
        <div style={{ position: 'absolute', left: 1670 - 120, top: 540 - 120, width: 240, height: 240, borderRadius: '50%', background: C.green, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 120, fontWeight: 900, transform: `scale(${badge})`, boxShadow: '0 16px 40px rgba(33, 196, 93, 0.35)' }}>7</div>
      )}
      <Eq x={90} y={735} start={L(6, 0.55)} tex={'12-5=7'} size={64} color={C.green} />
      <Text x={470} y={745} w={700} size={44} weight={800} color={C.muted} style={{ ...fadeUp(f, L(6, 0.3)), whiteSpace: 'nowrap' }}>all 12, minus 5 with a repeat</Text>
      <Eq x={1090} y={738} start={L(6, 0.6)} tex={'(x=7,\\dots,11)'} size={52} color={C.muted} />
      {n5 < 0 && null}
    </>
  );
};

// ---------- recap ----------

const Recap: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const out = ease(f, at(scene, 3), 12);
  return (
    <>
      <div style={{ opacity: 1 - out }}>
        <Text x={960} y={140} w={1200} size={58} weight={900} color={C.primary} align="center" style={fadeUp(f, at(scene, 0, 0.3))}>The big idea</Text>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 250, textAlign: 'center', ...fadeUp(f, at(scene, 1, 0.3)) }}>
          <Tex tex={'\\dfrac{\\text{perimeter}}{3}\\le \\text{longest}<\\dfrac{\\text{perimeter}}{2}'} size={72} />
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 520, display: 'flex', justifyContent: 'center', gap: 50, whiteSpace: 'nowrap' }}>
          <div style={{ background: C.violet, color: '#fff', borderRadius: 28, padding: '16px 40px', fontSize: 50, fontWeight: 900, ...fadeUp(f, at(scene, 2, 0.15)) }}>list row by row</div>
          <div style={{ background: C.primary, color: '#fff', borderRadius: 28, padding: '16px 40px', fontSize: 50, fontWeight: 900, ...fadeUp(f, at(scene, 2, 0.6)) }}>or: all − repeats</div>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', ...fadeUp(f, at(scene, 3, 0.1)) }}>
        <div style={{ fontFamily: PACIFICO, fontSize: 130, color: C.violet }}>Vantee</div>
        <div style={{ fontSize: 54, fontWeight: 900, marginTop: 10 }}>Keep counting!</div>
      </div>
      <Confetti x={960} y={380} start={at(scene, 3, 0.2)} seed={7} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = {
  intro: Intro,
  question: Question,
  asked: Asked,
  try1: Pause1,
  rule: Rule,
  list: List,
  subtract: Subtract,
  traps: Traps,
  variant: Variant,
  try2: Pause2,
  'variant-answer': VariantAnswer,
  recap: Recap,
};

export const Video: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <Explainer timeline={timeline} scenes={SCENES} badge="AMC 8-style · Level 5" /> : null;

void clamp;
void pairs;
