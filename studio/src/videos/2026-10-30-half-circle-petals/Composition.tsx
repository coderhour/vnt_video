import { interpolate, staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, range } from '../../lib/anim';
import { Explainer, at, type Scene, type SceneComponent, type Timeline } from '../../lib/Explainer';
import { Countdown } from '../../lib/PauseCard';
import { Stage, type Pt } from '../../lib/grid';
import { NUNITO, PACIFICO } from '../../lib/fonts';
import { Tex } from '../../lib/Tex';
import { Answer, Choices, Confetti, Mark, Pill, Text } from '../../lib/ui';
import { SignOff } from '../../lib/Brand';
import { ThumbFrame } from '../../lib/Thumb';
import { C } from '../../lib/theme';

export const SLUG = '2026-10-30-half-circle-petals';
export const CHIME = staticFile(`${SLUG}/sfx/fs-541985.mp3`); // Freesound CC0, see sfx/FREESOUND-CREDITS.md
export const TICK = staticFile(`${SLUG}/sfx/fs-668355.mp3`);

// ---------- geometry (maths coordinates, y grows UPWARD) ----------
// The square is [0, S] x [0, S] with (0, 0) at the bottom-left on screen. Each half circle has one side as
// its diameter (radius S/2) and bulges inward. A petal runs from a corner to the centre: it is the overlap
// of the two half circles on the sides that meet at that corner. Same picture as the bank figure.

const D2R = Math.PI / 180;
type Mapper = (p: Pt) => Pt;

/** Maths coords → pixels: (ox, oy) is the square's bottom-left corner on screen, `unit` px per 1. */
export const plane = (ox: number, oy: number, unit: number): Mapper => (p) => [ox + p[0] * unit, oy - p[1] * unit];

/** Points on a circle from angle a0 to a1 (degrees, maths orientation). */
export const arc = (c: Pt, r: number, a0: number, a1: number, n = 64): Pt[] =>
  range(n + 1).map((i) => {
    const a = (a0 + ((a1 - a0) * i) / n) * D2R;
    return [c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)];
  });

export const path = (pts: Pt[], m: Mapper, close = true) => `M ${pts.map((p) => m(p).map((v) => v.toFixed(2)).join(' ')).join(' L ')}${close ? ' Z' : ''}`;

/** The four half circles: centre (midpoint of a side) and the angle range that stays inside the square. */
export const halves = (S: number) => {
  const r = S / 2;
  return [
    { c: [r, 0] as Pt, a0: 0, a1: 180 }, // bottom
    { c: [0, r] as Pt, a0: -90, a1: 90 }, // left
    { c: [r, S] as Pt, a0: 180, a1: 360 }, // top
    { c: [S, r] as Pt, a0: 90, a1: 270 }, // right
  ];
};

/** Petal k (corner k: bottom-left, bottom-right, top-right, top-left): lens of the two half circles meeting there. */
const CORNERS = [[0, 0], [1, 0], [1, 1], [0, 1]] as const;
export const petal = (S: number, k: number): Pt[] => {
  const r = S / 2;
  const corner: Pt = [CORNERS[k][0] * S, CORNERS[k][1] * S];
  const mid: Pt = [r, r];
  // the two side midpoints next to this corner
  const cs: Pt[] = [[r, corner[1]], [corner[0], r]];
  const piece = (c: Pt, from: Pt, to: Pt) => {
    const a0 = Math.atan2(from[1] - c[1], from[0] - c[0]) / D2R;
    let a1 = Math.atan2(to[1] - c[1], to[0] - c[0]) / D2R;
    while (a1 - a0 > 180) a1 -= 360;
    while (a1 - a0 < -180) a1 += 360;
    return arc(c, r, a0, a1, 40);
  };
  return [...piece(cs[0], corner, mid), ...piece(cs[1], mid, corner).slice(1)];
};

export const square = (S: number): Pt[] => [[0, 0], [S, 0], [S, S], [0, S]];

// colours: shaded part = violet, petals = white, highlights
export const SHADE = C.violet;
export const SHADE_OP = 0.32;

// ---------- the figure ----------

type FigProps = {
  m: Mapper;
  S?: number;
  draw?: number[]; // progress of each half circle's arc (0…1)
  shade?: number; // opacity of the shaded fill (0…1)
  petalHi?: number[]; // green highlight on each petal
  petalHiColor?: string;
  halfHi?: number[]; // coloured fill for each half circle
  halfColors?: string[];
  shadeHi?: number; // extra glow on the shaded part
  sideLabel?: string;
  labelOpacity?: number;
  opacity?: number;
};

export const Label: React.FC<{ p: Pt; text: string; color?: string; size?: number; opacity?: number }> = ({ p, text, color = C.ink, size = 52, opacity = 1 }) =>
  opacity <= 0 ? null : (
    <text x={p[0]} y={p[1]} fill={color} opacity={opacity} fontFamily={NUNITO} fontWeight={900} fontSize={size} textAnchor="middle" dominantBaseline="central" paintOrder="stroke" stroke={C.bg} strokeWidth={8}>
      {text}
    </text>
  );

export const Figure: React.FC<FigProps> = ({
  m, S = 4, draw = [1, 1, 1, 1], shade = 1, petalHi = [0, 0, 0, 0], petalHiColor = C.green, halfHi = [0, 0, 0, 0], halfColors = [C.blue, C.amber, C.primary, C.red], shadeHi = 0, sideLabel, labelOpacity = 1, opacity = 1,
}) => {
  if (opacity <= 0) return null;
  const H = halves(S);
  const petals = range(4).map((k) => path(petal(S, k), m));
  const sq = path(square(S), m);
  return (
    <g opacity={opacity}>
      <path d={sq} fill={C.card} />
      {/* shaded part = square minus the petals (petals never overlap each other) */}
      <path d={`${sq} ${petals.join(' ')}`} fillRule="evenodd" fill={SHADE} opacity={SHADE_OP * shade + 0.3 * shadeHi} />
      {H.map((h, i) =>
        halfHi[i] > 0 ? <path key={i} d={path(arc(h.c, S / 2, h.a0, h.a1), m)} fill={halfColors[i]} opacity={0.22 * halfHi[i]} /> : null,
      )}
      {petals.map((d, k) => (petalHi[k] > 0 ? <path key={k} d={d} fill={petalHiColor} opacity={0.45 * petalHi[k]} /> : null))}
      {H.map((h, i) =>
        draw[i] > 0 ? (
          <path key={i} d={path(arc(h.c, S / 2, h.a0, h.a0 + (h.a1 - h.a0) * draw[i]), m, false)} fill="none" stroke={halfHi[i] > 0.5 ? halfColors[i] : C.ink} strokeWidth={halfHi[i] > 0.5 ? 7 : 5} strokeLinecap="round" />
        ) : null,
      )}
      <path d={sq} fill="none" stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
      {sideLabel && <Label p={[m([S / 2, 0])[0], m([0, 0])[1] + 46]} text={sideLabel} opacity={labelOpacity} />}
    </g>
  );
};

/** A maths line (KaTeX). */
const Eq: React.FC<{ x: number; y: number; tex: string; start: number; size?: number; color?: string; opacity?: number }> = ({ x, y, tex, start, size = 54, color = C.ink, opacity = 1 }) => {
  const f = useCurrentFrame();
  const s = fadeUp(f, start);
  return (
    <div style={{ position: 'absolute', left: x, top: y, whiteSpace: 'nowrap', ...s, opacity: (s.opacity as number) * opacity }}>
      <Tex tex={tex} size={size} color={color} />
    </div>
  );
};

const Boxed: React.FC<{ x: number; y: number; w: number; h: number; start: number }> = ({ x, y, w, h, start }) => {
  const f = useCurrentFrame();
  return <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, border: `6px solid ${C.green}`, borderRadius: 20, opacity: ease(f, start, 12) }} />;
};

/** Frame where line i of a scene starts, plus an offset in frames. */
const cue = (scene: Scene, i: number, t = 0, off = 0) => at(scene, i, t) + off;

// The working figure used by most scenes: side 4 → 560 px, bottom-left at (200, 770).
const P = plane(200, 770, 140);
const PANEL = 880;

// ---------- scenes ----------

const Intro: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const m = plane(300, 800, 135);
  const draw = range(4).map((i) => ease(f, 8 + i * 14, 18));
  const shade = ease(f, 70, 16);
  const pet = ease(f, cue(scene, 1, 0.05), 12) * fadeTo(f, cue(scene, 1, 0.6), 0);
  const want = ease(f, cue(scene, 1, 0.62), 14);
  return (
    <>
      <Text x={960} y={120} w={1500} size={80} weight={900} align="center" style={fadeUp(f, 0)}>
        How much is shaded?
      </Text>
      <Stage>
        <Figure m={m} draw={draw} shade={shade} petalHi={[pet, pet, pet, pet]} petalHiColor={C.red} shadeHi={want} />
      </Stage>
      <Text x={1000} y={360} w={760} size={56} weight={900} color={C.red} style={{ ...fadeUp(f, cue(scene, 1, 0.1)), opacity: pet }}>
        Petals? Not asked!
      </Text>
      <Text x={1000} y={360} w={760} size={60} weight={900} color={C.violet} style={fadeUp(f, cue(scene, 1, 0.65))}>
        We want the shaded part!
      </Text>
      <div style={{ position: 'absolute', left: 1000, top: 540, ...fadeUp(f, cue(scene, 2)) }}>
        <div style={{ fontFamily: PACIFICO, fontSize: 72, color: C.violet }}>Vantee</div>
        <div style={{ fontSize: 36, fontWeight: 700, color: C.muted, marginTop: -6 }}>your math tutor</div>
      </div>
    </>
  );
};

export const CHOICES = ['16 - 4\\pi', '32 - 8\\pi', '8\\pi - 16', '16 - 2\\pi', '48 - 8\\pi'];

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const m = plane(1290, 580, 100);
  return (
    <>
      <div style={{ position: 'absolute', left: 100, top: 170, width: 1020, background: C.card, borderRadius: 32, padding: '40px 52px', fontSize: 48, fontWeight: 600, lineHeight: 1.5, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', ...fadeUp(f, 0) }}>
        A square has <Mark on={cue(scene, 1, 0.1)}>side 4</Mark>. A <Mark on={cue(scene, 1, 0.45)}>half circle is drawn inside</Mark> the square on each side, as shown. The half circles overlap in{' '}
        <Mark on={cue(scene, 2, 0.1)}>four white petals</Mark>. What is the <Mark on={cue(scene, 2, 0.65)}>total shaded area</Mark>?
      </div>
      <Stage>
        <Figure m={m} sideLabel="4" draw={range(4).map((i) => ease(f, cue(scene, 1, 0.45) + i * 8, 14))} shade={ease(f, cue(scene, 2, 0.1), 14)} />
      </Stage>
      <Choices x={100} y={700} items={CHOICES.map((c) => <Tex key={c} tex={c} size={50} />)} start={(i) => cue(scene, 3, 0.1 + i * 0.12)} />
    </>
  );
};

/** A fact row on the right panel: text plus maths, at least 48 px. */
const Fact: React.FC<{ y: number; start: number; children: React.ReactNode; color?: string }> = ({ y, start, children, color = C.ink }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: PANEL, top: y, display: 'flex', alignItems: 'center', gap: 22, fontSize: 48, fontWeight: 800, color, whiteSpace: 'nowrap', ...fadeUp(f, start) }}>
      <svg width={54} height={54} viewBox="0 0 54 54">
        <circle cx={27} cy={27} r={27} fill={C.primary} />
        <path d="M15 28 L24 37 L40 19" stroke="#fff" strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {children}
    </div>
  );
};

const Asked: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const dia = ease(f, cue(scene, 1, 0.3), 12) * fadeTo(f, cue(scene, 3), 0.0);
  const rad = ease(f, cue(scene, 2, 0.2), 14) * fadeTo(f, cue(scene, 3), 0.0);
  const one = ease(f, cue(scene, 3, 0.2), 12) * fadeTo(f, cue(scene, 4), 0);
  const glow = ease(f, cue(scene, 4, 0.2), 14);
  return (
    <>
      <Stage>
        <Figure m={P} sideLabel="" halfHi={[Math.max(dia, one), one, 0, 0]} petalHi={[one, 0, 0, 0]} shadeHi={glow} />
        {/* diameter = bottom side */}
        <line x1={P([0, 0])[0]} y1={P([0, 0])[1]} x2={P([4, 0])[0]} y2={P([4, 0])[1]} stroke={C.blue} strokeWidth={12} strokeLinecap="round" opacity={dia} />
        <Label p={[P([2, 0])[0], P([0, 0])[1] + 46]} text="4" color={dia > 0.5 ? C.blue : C.ink} />
        {/* radius from the bottom midpoint to the centre */}
        <g opacity={rad}>
          <line x1={P([2, 0])[0]} y1={P([2, 0])[1]} x2={P([2, 2])[0]} y2={P([2, 2])[1]} stroke={C.amber} strokeWidth={8} strokeLinecap="round" />
          <circle cx={P([2, 0])[0]} cy={P([2, 0])[1]} r={11} fill={C.amber} />
          <Label p={P([2.36, 0.5])} text="2" color={C.amber} />
        </g>
      </Stage>
      <Fact y={230} start={cue(scene, 1, 0.5)}>
        <span>Diameter</span>
        <Tex tex="= 4" size={54} color={C.blue} />
      </Fact>
      <Fact y={330} start={cue(scene, 2, 0.3)}>
        <span>Radius</span>
        <Tex tex="= 2" size={54} color={C.amber} />
      </Fact>
      <Fact y={430} start={cue(scene, 3, 0.3)}>
        <span>Petal = where two half circles overlap</span>
      </Fact>
      <div style={{ position: 'absolute', left: PANEL, top: 590, ...fadeUp(f, cue(scene, 4, 0.3)), display: 'flex', alignItems: 'center', gap: 20 }}>
        <Tex tex="\text{shaded} = 16 - \text{4 petals}" size={60} color={C.violet} />
      </div>
    </>
  );
};

const makePause = (S: number, seconds: number, prompt: string): SceneComponent => ({ scene }) => {
  const f = useCurrentFrame();
  const m = plane(200, 760, 500 / S);
  return (
    <>
      <Stage>
        <Figure m={m} S={S} sideLabel={String(S)} />
      </Stage>
      <Text x={1330} y={150} w={900} size={48} align="center" style={fadeUp(f, 6)}>
        {prompt}
      </Text>
      <Countdown scene={scene} seconds={seconds} x={1330} y={560} tick={TICK} />
    </>
  );
};

// ----- Solution 1 -----

const Split: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const cut = ease(f, cue(scene, 1, 0.2), 20);
  const hi = range(4).map((k) => ease(f, cue(scene, 2, 0.15 + k * 0.15), 10) * fadeTo(f, cue(scene, 3), 0));
  const z = ease(f, cue(scene, 3, 0.25), 30);
  // zoom: unit 140 → 250 around the bottom-left corner, the other three small squares fade out
  const m = plane(200, 770, interpolate(z, [0, 1], [140, 250]));
  const clip = [m([0, 0]), m([2, 2])];
  return (
    <>
      <Pill x={PANEL + 80} y={170} color={C.violet} style={{ ...fadeUp(f, cue(scene, 0, 0.3)), opacity: fadeTo(f, cue(scene, 3, 0.2), 0) }}>
        Plan: find one petal first
      </Pill>
      <Stage>
        <defs>
          <clipPath id="bl">
            <rect x={clip[0][0]} y={clip[1][1]} width={clip[1][0] - clip[0][0]} height={clip[0][1] - clip[1][1]} />
          </clipPath>
          <clipPath id="notbl">
            <path clipRule="evenodd" d={`M -10 -10 H 1930 V 1090 H -10 Z M ${clip[0][0]} ${clip[1][1]} H ${clip[1][0]} V ${clip[0][1]} H ${clip[0][0]} Z`} />
          </clipPath>
        </defs>
        {z <= 0 ? (
          <Figure m={m} petalHi={hi} />
        ) : (
          <>
            <g clipPath="url(#notbl)">
              <Figure m={m} opacity={1 - z} petalHi={hi} />
            </g>
            <g clipPath="url(#bl)">
              <Figure m={m} petalHi={hi} />
            </g>
          </>
        )}
        <g opacity={cut * (1 - z)}>
          <line x1={m([2, 0])[0]} y1={m([2, 0])[1]} x2={m([2, 4])[0]} y2={m([2, 4])[1]} stroke={C.ink} strokeWidth={4} strokeDasharray="14 10" />
          <line x1={m([0, 2])[0]} y1={m([0, 2])[1]} x2={m([4, 2])[0]} y2={m([4, 2])[1]} stroke={C.ink} strokeWidth={4} strokeDasharray="14 10" />
        </g>
        <rect x={clip[0][0]} y={clip[1][1]} width={clip[1][0] - clip[0][0]} height={clip[0][1] - clip[1][1]} fill="none" stroke={C.green} strokeWidth={8} opacity={ease(f, cue(scene, 3, 0.05), 10)} />
        <Label p={[m([1, 0])[0], m([0, 0])[1] + 46]} text="2" opacity={cut} />
        <Label p={[m([0, 1])[0] - 40, m([0, 1])[1]]} text="2" opacity={cut} />
      </Stage>
      <Text x={PANEL + 80} y={330} w={900} size={50} weight={800} style={{ ...fadeUp(f, cue(scene, 1, 0.4)), opacity: fadeTo(f, cue(scene, 3, 0.2), 0) * ease(f, cue(scene, 1, 0.4), 14) }}>
        4 small squares, each 2 by 2
      </Text>
      <Text x={PANEL + 80} y={440} w={900} size={50} weight={800} color={C.green} style={{ ...fadeUp(f, cue(scene, 2, 0.3)), opacity: fadeTo(f, cue(scene, 3, 0.2), 0) * ease(f, cue(scene, 2, 0.3), 14) }}>
        One petal in each
      </Text>
    </>
  );
};

// The zoomed small square: maths coords 0…2, same 250 px/unit plane the zoom ends on.
const Z = plane(200, 770, 250);
const QB = [[2, 0] as Pt, ...arc([2, 0], 2, 180, 90)]; // bottom half circle's quarter (centre = bottom-right corner)
const QL = [[0, 2] as Pt, ...arc([0, 2], 2, -90, 0)]; // left half circle's quarter (centre = top-left corner)
const LENS = petal(4, 0);
const TRI: Pt[] = [[0, 0], [2, 0], [2, 2]];
const SLICE: Pt[] = arc([2, 0], 2, 180, 90); // closed back along the diagonal

const R45: Pt = [2 - Math.SQRT2, Math.SQRT2]; // a radius of the blue quarter circle, through its middle

const Zoomed: React.FC<{ q: number; diag: number; blue: number; triIn: number; away: number; slice: number; sector: number; triHi: number }> = ({ q, diag, blue, triIn, away, slice, sector, triHi }) => {
  const shift = away * 140; // the removed triangle slides down-right and fades
  return (
    <Stage>
      <path d={path(square(2), Z)} fill={C.card} />
      <path d={`${path(square(2), Z)} ${path(LENS, Z)}`} fillRule="evenodd" fill={SHADE} opacity={SHADE_OP * (1 - q)} />
      {/* L0–L1: the two quarter circles, light */}
      <path d={path(QB, Z)} fill={C.blue} opacity={0.18 * q * (1 - blue)} />
      <path d={path(QL, Z)} fill={C.amber} opacity={0.18 * q * (1 - blue)} />
      {/* L2: the blue quarter = slice part + triangle part (the triangle part is covered by the triangle card) */}
      <path d={path(SLICE, Z)} fill={C.blue} opacity={0.4 * blue * (1 - slice)} />
      <path d={path(TRI, Z)} fill={C.blue} opacity={0.4 * blue * (1 - triIn)} />
      <path d={path(SLICE, Z)} fill={C.green} opacity={0.55 * slice} />
      <path d={path(arc([2, 0], 2, 180, 90), Z, false)} fill="none" stroke={q > 0.5 ? C.blue : C.ink} strokeWidth={q > 0.5 ? 8 : 5} />
      <path d={path(arc([0, 2], 2, -90, 0), Z, false)} fill="none" stroke={q > 0.5 && blue < 0.5 ? C.amber : C.ink} strokeWidth={q > 0.5 ? 8 : 5} />
      <path d={path(square(2), Z)} fill="none" stroke={C.ink} strokeWidth={6} />
      <line x1={Z([0, 0])[0]} y1={Z([0, 0])[1]} x2={Z([0, 0])[0] + (Z([2, 2])[0] - Z([0, 0])[0]) * diag} y2={Z([0, 0])[1] + (Z([2, 2])[1] - Z([0, 0])[1]) * diag} stroke={C.ink} strokeWidth={5} strokeDasharray="16 10" opacity={diag > 0 ? 1 : 0} />
      {/* L2: the triangle as its own card, then it slides away on "remove" */}
      {triIn > 0 && away < 1 && (
        <g transform={`translate(${shift} ${shift * 0.6})`} opacity={triIn * (1 - away)}>
          <path d={path(TRI, Z)} fill={C.card} />
          <path d={path(TRI, Z)} fill={C.red} fillOpacity={0.18} stroke={C.red} strokeWidth={6} strokeLinejoin="round" />
        </g>
      )}
      {/* L4: the blue quarter circle again, with a radius */}
      <g opacity={sector}>
        <path d={path(QB, Z)} fill={C.blue} fillOpacity={0.22} stroke={C.blue} strokeWidth={7} strokeLinejoin="round" />
        <line x1={Z([2, 0])[0]} y1={Z([2, 0])[1]} x2={Z(R45)[0]} y2={Z(R45)[1]} stroke={C.blue} strokeWidth={8} strokeLinecap="round" />
        <Label p={Z([1.62, 1.04])} text="2" color={C.blue} />
      </g>
      {/* L5: the triangle, outlined in red */}
      <g opacity={triHi}>
        <path d={path(TRI, Z)} fill={C.red} fillOpacity={0.14} stroke={C.red} strokeWidth={7} strokeLinejoin="round" />
      </g>
      <circle cx={Z([2, 0])[0]} cy={Z([2, 0])[1]} r={12} fill={C.blue} opacity={q} />
      <Label p={[Z([1, 0])[0], Z([0, 0])[1] + 46]} text="2" color={triHi > 0.5 ? C.red : C.ink} />
      <Label p={[Z([2, 0])[0] + 42, Z([2, 1])[1]]} text="2" color={triHi > 0.5 ? C.red : C.ink} />
    </Stage>
  );
};

const Slice: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const q = ease(f, cue(scene, 0, 0.3), 16);
  const lens = ease(f, cue(scene, 1, 0.05), 12) * fadeTo(f, cue(scene, 2), 0);
  const diag = ease(f, cue(scene, 1, 0.45), 20);
  const blue = ease(f, cue(scene, 2, 0.05), 12);
  const triIn = ease(f, cue(scene, 2, 0.4), 10);
  const away = ease(f, cue(scene, 2, 0.75), 18);
  const slice = ease(f, cue(scene, 3, 0.15), 14);
  const sector = ease(f, cue(scene, 4, 0.05), 12) * fadeTo(f, cue(scene, 5), 0);
  const triHi = ease(f, cue(scene, 5, 0.05), 12) * fadeTo(f, cue(scene, 6), 0);
  return (
    <>
      <Zoomed q={q} diag={diag} blue={blue} triIn={triIn} away={away} slice={slice} sector={sector} triHi={triHi} />
      <Stage>
        <path d={path(LENS, Z)} fill="none" stroke={C.green} strokeWidth={10} opacity={lens} />
      </Stage>
      <Pill x={PANEL} y={170} color={C.violet} style={fadeUp(f, cue(scene, 0, 0.2))}>Zoom in: one small square</Pill>
      <Text x={PANEL} y={270} w={980} size={48} weight={800} style={fadeUp(f, cue(scene, 1, 0.6))}>
        Petal = <span style={{ color: C.green }}>2 equal slices</span>
      </Text>
      <Eq x={PANEL} y={350} start={cue(scene, 2, 0.3)} color={C.green} tex="\text{slice} = {\color{#3c83f6}\text{quarter circle}} - {\color{#ef4343}\text{triangle}}" size={52} />
      <Eq x={PANEL} y={430} start={cue(scene, 4, 0.25)} color={C.blue} tex="\text{quarter circle} = \dfrac{\pi \times 2^2}{4} = \dfrac{4\pi}{4} = \pi" size={54} />
      <Eq x={PANEL} y={575} start={cue(scene, 5, 0.3)} color={C.red} tex="\text{triangle} = \dfrac{2 \times 2}{2} = 2" size={54} />
      <Eq x={PANEL} y={738} start={cue(scene, 6, 0.2)} color={C.green} tex="\text{slice} = \pi - 2" size={58} />
      <Boxed x={PANEL - 24} y={722} w={430} h={96} start={cue(scene, 6, 0.4)} />
    </>
  );
};

const Total: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hi = range(4).map((k) => ease(f, cue(scene, 1, 0.1 + k * 0.15), 10) * fadeTo(f, cue(scene, 3, 0.3), 0));
  const glow = ease(f, cue(scene, 3, 0.4), 14);
  const done = cue(scene, 6, 0.97);
  return (
    <>
      <Stage>
        <Figure m={P} sideLabel="4" petalHi={hi} shadeHi={glow} />
        {range(4).map((k) => (
          <Label key={k} p={P([[1, 1], [3, 1], [3, 3], [1, 3]][k] as Pt)} text={`${k + 1}`} color={C.green} size={52} opacity={hi[k]} />
        ))}
      </Stage>
      <Eq x={PANEL} y={160} start={cue(scene, 0, 0.3)} tex="\text{petal} = 2(\pi - 2) = 2\pi - 4" />
      <Eq x={PANEL} y={260} start={cue(scene, 2, 0.3)} tex="\text{4 petals} = 8\pi - 16" color={C.green} />
      <Eq x={PANEL} y={360} start={cue(scene, 3, 0.4)} tex="\text{shaded} = 16 - (8\pi - 16)" color={C.violet} />
      <Eq x={PANEL} y={460} start={cue(scene, 4, 0.15)} tex="= 16 - 8\pi + 16" />
      <Eq x={PANEL} y={560} start={cue(scene, 4, 0.6)} tex="= 32 - 8\pi" size={66} color={C.green} />
      <Eq x={PANEL} y={680} start={cue(scene, 5, 0.2)} tex="\approx 6.87 \approx 43\% \text{ of } 16" size={50} color={C.muted} />
      <Answer x={1700} y={560} value="B" chime={CHIME} start={done} />
      <Confetti x={1700} y={560} start={done} seed={5} />
    </>
  );
};

// ----- Solution 2 -----

const COUNT_SPOTS_1: Pt[] = [[2, 0.45], [0.45, 2], [2, 3.55], [3.55, 2]]; // in exactly one half circle
const COUNT_SPOTS_2: Pt[] = [[1, 1], [3, 1], [3, 3], [1, 3]]; // petal middles: in two

const Count: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  // L0: light each half circle in turn; they stay faintly lit through L2, then go.
  // one half circle at a time (fill + coloured arc); at L2 all four arcs stay coloured, no fills, so nothing tangles
  const lit = range(4).map((i) => ease(f, cue(scene, 0, 0.25 + i * 0.17), 8) * fadeTo(f, i < 3 ? cue(scene, 0, 0.42 + i * 0.17) : cue(scene, 1, 0.1), 0, 8));
  const arcs = ease(f, cue(scene, 0, 0.25), 8) * fadeTo(f, cue(scene, 3), 0);
  const ones = ease(f, cue(scene, 3, 0.55), 12);
  const twos = ease(f, cue(scene, 4, 0.2), 12);
  const top = fadeTo(f, cue(scene, 8, 0.05), 0);
  const centre = ease(f, cue(scene, 5, 0.3), 12) * fadeTo(f, cue(scene, 6), 0);
  return (
    <>
      <Stage>
        <Figure m={P} sideLabel="4" halfHi={lit} shade={1 - 0.6 * arcs} petalHi={[twos, twos, twos, twos]} />
        {halves(4).map((h, i) => (
          <path key={i} d={path(arc(h.c, 2, h.a0, h.a1), P, false)} fill="none" stroke={[C.blue, C.amber, C.primary, C.red][i]} strokeWidth={7} opacity={arcs * ease(f, cue(scene, 0, 0.25 + i * 0.17), 8)} />
        ))}
        {COUNT_SPOTS_1.map((p, i) => <Label key={i} p={P(p)} text="1" color={C.violet} size={56} opacity={ones} />)}
        {COUNT_SPOTS_2.map((p, i) => <Label key={i} p={P(p)} text="2" color={C.green} size={56} opacity={twos} />)}
        <circle cx={P([2, 2])[0]} cy={P([2, 2])[1]} r={26} fill="none" stroke={C.amber} strokeWidth={8} opacity={centre} />
      </Stage>
      <Text x={PANEL} y={470} w={1000} size={48} weight={800} color={C.amber} style={{ ...fadeUp(f, cue(scene, 5, 0.4)), opacity: ease(f, cue(scene, 5, 0.4), 12) * fadeTo(f, cue(scene, 6), 0) }}>
        Only the center touches all four
      </Text>
      <Eq x={PANEL} y={160} start={cue(scene, 1, 0.2)} opacity={top} tex="\text{half circle} = \dfrac{\pi \times 2^2}{2} = \dfrac{4\pi}{2} = 2\pi" />
      <Eq x={PANEL} y={300} start={cue(scene, 2, 0.2)} tex="4 \times 2\pi = 8\pi" />
      <Eq x={PANEL + 420} y={300} start={cue(scene, 2, 0.65)} tex="\text{but square} = 16" color={C.red} size={50} />
      <Text x={PANEL} y={390} w={1000} size={48} weight={800} style={fadeUp(f, cue(scene, 3, 0.5))}>
        <span style={{ color: C.violet }}>Shaded: counted once</span>
      </Text>
      <Text x={PANEL + 520} y={390} w={500} size={48} weight={800} style={fadeUp(f, cue(scene, 4, 0.3))}>
        <span style={{ color: C.green }}>Petals: twice</span>
      </Text>
      <Eq x={PANEL} y={480} start={cue(scene, 6, 0.3)} tex="8\pi = 16 + \text{petals}" color={C.ink} size={58} />
      <Eq x={PANEL} y={580} start={cue(scene, 7, 0.1)} tex="\text{petals} = 8\pi - 16" color={C.green} />
      <Eq x={PANEL} y={680} start={cue(scene, 7, 0.55)} tex="\text{shaded} = 16 - (8\pi - 16) = 32 - 8\pi" color={C.violet} size={48} />
      <Pill x={PANEL} y={170} color={C.amber} style={{ ...fadeUp(f, cue(scene, 8, 0.25)), fontSize: 40 }}>
        Overlaps cover a region? Count twice!
      </Pill>
    </>
  );
};

// ----- traps -----

/** Mini figure for a trap card: which half circles were removed (white) or which petals were picked. */
const MiniFig: React.FC<{ kind: 'A' | 'B' | 'C' | 'D' }> = ({ kind }) => {
  const m = plane(20, 240, 55);
  const sq = path(square(4), m);
  const H = halves(4);
  const half = (i: number) => path(arc(H[i].c, 2, H[i].a0, H[i].a1), m);
  const petals = range(4).map((k) => path(petal(4, k), m)).join(' ');
  return (
    <svg width={260} height={260} viewBox="0 0 260 260">
      <path d={sq} fill={kind === 'C' ? C.card : SHADE} opacity={kind === 'C' ? 1 : 0.35} />
      {kind === 'B' && <path d={petals} fill={C.card} />}
      {kind === 'C' && <path d={petals} fill={C.red} opacity={0.45} />}
      {kind === 'D' && <path d={half(0)} fill={C.card} />}
      {kind === 'A' && (
        <>
          <path d={half(0)} fill={C.card} />
          <path d={half(2)} fill={C.card} />
        </>
      )}
      {H.map((h, i) => (
        <path key={i} d={path(arc(h.c, 2, h.a0, h.a1), m, false)} fill="none" stroke={C.ink} strokeWidth={3} opacity={kind === 'B' || kind === 'C' ? 1 : 0.35} />
      ))}
      <path d={sq} fill="none" stroke={C.ink} strokeWidth={4} />
    </svg>
  );
};

const NOTES = ['minus two half circles', 'square minus petals', 'just the petals', 'minus one half circle', ''];

const Traps: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const wrongAt = [cue(scene, 2, 0.15), -1, cue(scene, 0, 0.15), cue(scene, 1, 0.15), cue(scene, 3, 0.15)];
  const rightAt = cue(scene, 4, 0.1);
  const kinds = ['A', 'B', 'C', 'D'] as const;
  return (
    <>
      <div style={{ position: 'absolute', left: 95, top: 150, display: 'flex', gap: 30 }}>
        {CHOICES.map((c, i) => {
          const right = i === 1 && f >= rightAt;
          const wrong = i !== 1 && f >= wrongAt[i];
          const border = wrong ? C.red : right ? C.green : 'transparent';
          return (
            <div key={c} style={{ width: 320, ...fadeUp(f, 8 + i * 6, 12) }}>
              <div style={{ height: 440, background: C.card, borderRadius: 28, border: `6px solid ${border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 8px 24px rgba(30,40,80,0.07)', position: 'relative' }}>
                <div style={{ fontSize: 36, fontWeight: 800, color: C.muted, marginTop: 16 }}>{'ABCDE'[i]}</div>
                <div style={{ height: 96, display: 'flex', alignItems: 'center' }}>
                  <Tex tex={c} size={52} color={wrong ? C.red : right ? C.green : C.ink} />
                </div>
                {i < 4 ? (
                  <MiniFig kind={kinds[i]} />
                ) : (
                  <div style={{ height: 260, display: 'flex', alignItems: 'center', opacity: ease(f, wrongAt[4] + 6, 12) }}>
                    <Tex tex="\approx 23 > 16" size={52} color={C.red} />
                  </div>
                )}
                {(wrong || right) && (
                  <div style={{ position: 'absolute', top: -26, right: -26, width: 64, height: 64, borderRadius: '50%', background: wrong ? C.red : C.green, color: '#fff', fontSize: 40, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {wrong ? '✗' : '✓'}
                  </div>
                )}
              </div>
              <div style={{ marginTop: 16, fontSize: 34, fontWeight: 800, textAlign: 'center', lineHeight: 1.2, color: i === 1 ? C.green : C.ink, ...fadeUp(f, i === 1 ? rightAt : i === 4 ? wrongAt[4] + 8 : wrongAt[i] + 8) }}>
                {i === 4 ? 'bigger than the square' : NOTES[i]}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ position: 'absolute', left: 360, top: 700, width: 1200, textAlign: 'center', background: C.card, borderRadius: 28, padding: '14px 40px', boxShadow: '0 8px 24px rgba(30,40,80,0.07)', ...fadeUp(f, rightAt + 10) }}>
        <Tex tex="(32 - 8\pi) + (8\pi - 16) = 16 \;\checkmark" size={54} color={C.green} />
      </div>
    </>
  );
};

// ----- variant -----

const P6 = plane(1150, 770, 90); // side 6 → 540 px

const Variant: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Pill x={120} y={190} color={C.violet} style={fadeUp(f, cue(scene, 0, 0.1))}>Your turn!</Pill>
      <Text x={120} y={310} w={900} size={60} weight={900} style={fadeUp(f, cue(scene, 0, 0.5))}>
        A square with side 6
      </Text>
      <Text x={120} y={420} w={900} size={48} weight={700} style={fadeUp(f, cue(scene, 1, 0.1))}>
        Same four half circles inside. What is the shaded area?
      </Text>
      <Pill x={120} y={620} color={C.amber} style={fadeUp(f, cue(scene, 2, 0.1))}>Hint: find the radius first!</Pill>
      <Stage>
        <Figure m={P6} S={6} sideLabel="6" draw={range(4).map((i) => ease(f, cue(scene, 1, 0.1) + i * 8, 14))} shade={ease(f, cue(scene, 1, 0.5), 14)} labelOpacity={ease(f, cue(scene, 0, 0.6), 10)} />
      </Stage>
    </>
  );
};

const VariantAnswer: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const m = plane(200, 770, 560 / 6);
  const rad = ease(f, cue(scene, 0, 0.5), 12);
  const done = cue(scene, 4, 0.97);
  const pet = ease(f, cue(scene, 3, 0.45), 12) * fadeTo(f, cue(scene, 4, 0.2), 0);
  return (
    <>
      <Stage>
        <Figure m={m} S={6} sideLabel="6" petalHi={[pet, pet, pet, pet]} shadeHi={ease(f, cue(scene, 4, 0.3), 12)} />
        <g opacity={rad}>
          <line x1={m([3, 0])[0]} y1={m([3, 0])[1]} x2={m([3, 3])[0]} y2={m([3, 3])[1]} stroke={C.amber} strokeWidth={8} strokeLinecap="round" />
          <circle cx={m([3, 0])[0]} cy={m([3, 0])[1]} r={11} fill={C.amber} />
          <Label p={m([3.5, 0.7])} text="3" color={C.amber} />
        </g>
      </Stage>
      <Eq x={PANEL} y={150} start={cue(scene, 0, 0.55)} tex="\text{radius} = 3" color={C.amber} />
      <Eq x={PANEL} y={240} start={cue(scene, 1, 0.1)} tex="\pi \times 3^2 = 9\pi" />
      <Eq x={PANEL + 420} y={222} start={cue(scene, 1, 0.55)} tex="\text{half} = \dfrac{9\pi}{2}" />
      <Eq x={PANEL} y={350} start={cue(scene, 2, 0.2)} tex="4 \times \dfrac{9\pi}{2} = 18\pi" />
      <Eq x={PANEL} y={485} start={cue(scene, 3, 0.1)} tex="\text{square} = 6^2 = 36" />
      <Eq x={PANEL} y={560} start={cue(scene, 3, 0.45)} tex="\text{petals} = 18\pi - 36" color={C.green} />
      <Eq x={PANEL} y={635} start={cue(scene, 4, 0.2)} tex="\text{shaded} = 36 - (18\pi - 36)" size={52} color={C.violet} />
      <Eq x={PANEL + 196} y={712} start={cue(scene, 4, 0.6)} tex="= 72 - 18\pi" size={60} color={C.violet} />
      <Answer x={1740} y={500} value="✓" chime={CHIME} start={done} />
      <Confetti x={1740} y={500} start={done} seed={11} />
      <Pill x={1560} y={755} color={C.primary} style={{ ...fadeUp(f, cue(scene, 5, 0.1)), fontSize: 38, whiteSpace: 'nowrap' }}>Amazing work!</Pill>
    </>
  );
};

const Recap: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const cardOut = fadeTo(f, cue(scene, 2));
  const m = plane(1320, 660, 95);
  return (
    <>
      <div style={{ position: 'absolute', left: 160, top: 170, width: 1600, height: 560, background: C.card, borderRadius: 40, boxShadow: '0 10px 40px rgba(30,40,80,0.08)', opacity: ease(f, 0, 14) * cardOut }}>
        <div style={{ position: 'absolute', left: 70, top: 60, fontSize: 48, fontWeight: 900, color: C.primary, ...fadeUp(f, 4) }}>The big idea</div>
        <div style={{ position: 'absolute', left: 70, top: 150, width: 940, fontSize: 58, fontWeight: 900, lineHeight: 1.2, ...fadeUp(f, cue(scene, 0, 0.1)) }}>
          Add up the areas, and every overlap of two shapes is counted twice.
        </div>
        <div style={{ position: 'absolute', left: 70, top: 390, ...fadeUp(f, cue(scene, 1, 0.1)) }}>
          <Tex tex="\text{overlap} = \text{shapes added} - \text{covered}" size={50} color={C.violet} />
        </div>
      </div>
      <Stage>
        <g opacity={ease(f, cue(scene, 0, 0.4), 14) * cardOut}>
          <Figure m={m} petalHi={[1, 1, 1, 1]} />
          {COUNT_SPOTS_1.map((p, i) => <Label key={i} p={m(p)} text="1" color={C.violet} size={48} />)}
          {COUNT_SPOTS_2.map((p, i) => <Label key={i} p={m(p)} text="2" color={C.green} size={48} />)}
        </g>
      </Stage>
      <SignOff start={cue(scene, 2, 0.1)} />
      <Confetti x={960} y={380} start={cue(scene, 2, 0.2)} seed={3} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = {
  intro: Intro,
  question: Question,
  asked: Asked,
  try1: makePause(4, 10, 'Side 4: how much is shaded?'),
  split: Split,
  slice: Slice,
  total: Total,
  count: Count,
  traps: Traps,
  variant: Variant,
  try2: makePause(6, 12, 'Side 6: how much is shaded?'),
  'variant-answer': VariantAnswer,
  recap: Recap,
};

export const Video: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <Explainer timeline={timeline} scenes={SCENES} badge="AMC 8-style · Level 4" /> : null;

// YouTube thumbnail (`2026-10-30-half-circle-petals-thumb`, render.sh → poster.jpg): the question + the flower figure, no answer.
export const Thumb: React.FC = () => (
  <ThumbFrame chip="AMC 8 Practice" lines={["Shaded", <span style={{ color: C.primary }}>area?</span>]}>
    <svg viewBox="0 0 680 640" style={{ width: '100%', height: '100%' }}>
      <Figure m={plane(60, 600, 140)} />
    </svg>
  </ThumbFrame>
);
