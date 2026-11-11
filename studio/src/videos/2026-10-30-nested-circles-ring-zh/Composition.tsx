import { Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { ease, fadeTo, fadeUp, pop, range } from '../../lib/anim';
import { Explainer, at, type Scene, type SceneComponent, type Timeline } from '../../lib/Explainer';
import { Countdown } from '../../lib/PauseCard';
import { Poly, Stage, XMark, type Pt } from '../../lib/grid';
import { PACIFICO, ZH_FONT } from '../../lib/fonts';
import { Tex } from '../../lib/Tex';
import { Answer, Confetti, Mark, Pill, Text } from '../../lib/ui';
import { SignOff } from '../../lib/Brand';
import { C } from '../../lib/theme';

export const SLUG = '2026-10-30-nested-circles-ring-zh';
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

// ---------- geometry (bank SVG units, viewBox 300; centre (150,150)) ----------
// Big square 30..270 (side 8 in the question), big circle R=120, diamond with corners on the big circle,
// small circle r=120/sqrt2, and (variant only) an upright square 90..210 with a circle r=60.

export const R = 120;
export const RS = 120 / Math.SQRT2; // 84.853
const R3 = 60;
export const SQ: Pt[] = [[30, 270], [270, 270], [270, 30], [30, 30]];
export const DIA: Pt[] = [[150, 270], [270, 150], [150, 30], [30, 150]];
const SQ2: Pt[] = [[90, 90], [210, 90], [210, 210], [90, 210]];

export type Frame = { cx: number; cy: number; s: number };
const FIG: Frame = { cx: 480, cy: 470, s: 2.4 };
export const mkP = ({ cx, cy, s }: Frame) => (x: number, y: number): Pt => [cx + (x - 150) * s, cy + (y - 150) * s];

export const BLUE = C.blue;
export const GREEN = C.primary;
export const VIOLET = C.violet;
export const AMBER = C.amber;
const PANEL = 960;

// ---------- drawing helpers ----------

export const Ci: React.FC<{ cx: number; cy: number; r: number; p?: number; color?: string; width?: number; fill?: string; fillOp?: number; dash?: string; opacity?: number }> = ({
  cx, cy, r, p = 1, color = C.ink, width = 6, fill, fillOp = 1, dash, opacity = 1,
}) =>
  p <= 0 || opacity <= 0 ? null : (
    <g opacity={opacity}>
      {fill && <circle cx={cx} cy={cy} r={r} fill={fill} opacity={fillOp * Math.min(1, p * 1.5)} />}
      {dash ? (
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={width} strokeDasharray={dash} opacity={p} />
      ) : (
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={width} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} transform={`rotate(-90 ${cx} ${cy})`} />
      )}
    </g>
  );

export const Ln: React.FC<{ a: Pt; b: Pt; p?: number; color?: string; width?: number; opacity?: number; dash?: string }> = ({ a, b, p = 1, color = C.ink, width = 12, opacity = 1, dash }) =>
  p <= 0 || opacity <= 0 ? null : (
    <line x1={a[0]} y1={a[1]} x2={a[0] + (b[0] - a[0]) * p} y2={a[1] + (b[1] - a[1]) * p} stroke={color} strokeWidth={width} strokeLinecap="round" opacity={opacity} strokeDasharray={dash} />
  );

export const Dot: React.FC<{ p: Pt; r?: number; color?: string; s?: number }> = ({ p, r = 13, color = AMBER, s = 1 }) =>
  s <= 0 ? null : <circle cx={p[0]} cy={p[1]} r={r * s} fill={color} stroke="#fff" strokeWidth={3} />;

export const ringPath = (cx: number, cy: number, ro: number, ri: number) =>
  `M ${cx + ro} ${cy} A ${ro} ${ro} 0 1 0 ${cx - ro} ${cy} A ${ro} ${ro} 0 1 0 ${cx + ro} ${cy} Z M ${cx + ri} ${cy} A ${ri} ${ri} 0 1 0 ${cx - ri} ${cy} A ${ri} ${ri} 0 1 0 ${cx + ri} ${cy} Z`;

/** The bank figure, one level at a time. Everything is a fraction 0..1. */
export const Fig: React.FC<{
  fr?: Frame;
  sq?: number; c1?: number; dia?: number; c2?: number; sq2?: number; c3?: number;
  ring?: number; ringColor?: string; ringInner?: number;
  under?: React.ReactNode;
  over?: React.ReactNode;
}> = ({ fr = FIG, sq = 1, c1 = 1, dia = 1, c2 = 1, sq2 = 0, c3 = 0, ring = 0, ringColor = VIOLET, ringInner = RS, under, over }) => {
  const P = mkP(fr);
  const s = fr.s;
  const px = (pts: Pt[]) => pts.map((p) => P(p[0], p[1]));
  return (
    <g>
      {ring > 0 && <path d={ringPath(fr.cx, fr.cy, R * s, ringInner * s)} fill={ringColor} fillOpacity={0.3 * ring} fillRule="evenodd" />}
      {under}
      <Poly pts={px(SQ)} progress={sq} color={C.ink} width={6} />
      <Ci cx={fr.cx} cy={fr.cy} r={R * s} p={c1} />
      <Poly pts={px(DIA)} progress={dia} color={C.ink} width={6} />
      <Ci cx={fr.cx} cy={fr.cy} r={RS * s} p={c2} />
      <Poly pts={px(SQ2)} progress={sq2} color={C.ink} width={6} />
      <Ci cx={fr.cx} cy={fr.cy} r={R3 * s} p={c3} />
      {over}
    </g>
  );
};

/** Maths label centred on a point (HTML so KaTeX works), above the figure. */
export const TL: React.FC<{ p: Pt; tex: string; size?: number; color?: string; opacity?: number }> = ({ p, tex, size = 52, color = C.ink, opacity = 1 }) =>
  opacity <= 0 ? null : (
    <div style={{ position: 'absolute', left: p[0], top: p[1], transform: 'translate(-50%, -50%)', opacity, background: 'rgba(246,247,251,0.9)', borderRadius: 12, padding: '0 10px', whiteSpace: 'nowrap', lineHeight: 1.1 }}>
      <Tex tex={tex} size={size} color={color} />
    </div>
  );

const Eq: React.FC<{ y: number; tex: string | Part[]; start: number; x?: number; size?: number; color?: string; opacity?: number }> = ({ y, tex, start, x = PANEL, size = 56, color = C.ink, opacity = 1 }) => {
  const f = useCurrentFrame();
  const s = fadeUp(f, start);
  return (
    <div style={{ position: 'absolute', left: x, top: y, whiteSpace: 'nowrap', ...s, opacity: (s.opacity as number) * opacity }}>
      <Z p={tex} size={size} color={color} />
    </div>
  );
};

const Chip: React.FC<{ color: string; children: React.ReactNode; size?: number }> = ({ color, children, size = 44 }) => (
  <span style={{ background: color, color: '#fff', borderRadius: 999, padding: '6px 26px', fontSize: size, fontWeight: 900, whiteSpace: 'nowrap' }}>{children}</span>
);

export const Choices: React.FC<{ x: number; y: number; start: (i: number) => number; hi?: number; hiStart?: number; size?: number }> = ({ x, y, start, hi, hiStart = 0, size = 52 }) => {
  const f = useCurrentFrame();
  const items = ['4\\pi', '8\\pi', '12\\pi', '16\\pi', '24\\pi'];
  const h = hi === undefined ? 0 : ease(f, hiStart, 10);
  return (
    <div style={{ position: 'absolute', left: x, top: y, display: 'flex', gap: 14 }}>
      {items.map((c, i) => {
        const on = hi === i ? h : 0;
        return (
          <div key={i} style={{ ...fadeUp(f, start(i), 10), display: 'flex', alignItems: 'center', gap: 8, background: on > 0 ? C.green : C.card, color: on > 0 ? '#fff' : C.ink, borderRadius: 18, padding: '8px 18px', fontWeight: 800, boxShadow: '0 4px 14px rgba(30,40,80,0.07)' }}>
            <span style={{ color: on > 0 ? '#fff' : C.muted, fontSize: 36 }}>{'ABCDE'[i]}</span>
            <Tex tex={c} size={size} />
          </div>
        );
      })}
    </div>
  );
};

const RightMark: React.FC<{ F: Pt; a: Pt; b: Pt; k?: number; opacity: number }> = ({ F, a, b, k = 34, opacity }) => {
  if (opacity <= 0) return null;
  const n = (p: Pt): Pt => { const l = Math.hypot(p[0], p[1]); return [p[0] / l, p[1] / l]; };
  const A = n(a), B = n(b);
  return <path d={`M ${F[0] + A[0] * k} ${F[1] + A[1] * k} L ${F[0] + (A[0] + B[0]) * k} ${F[1] + (A[1] + B[1]) * k} L ${F[0] + B[0] * k} ${F[1] + B[1] * k}`} stroke={C.ink} strokeWidth={6} fill="none" opacity={opacity} />;
};

const AnswerTex: React.FC<{ x: number; y: number; tex: string; start: number }> = ({ x, y, tex, start }) => {
  const D = 190;
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = pop(f, start, fps);
  return (
    <>
      <Sequence from={start} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      {s > 0 && (
        <div style={{ position: 'absolute', left: x - D / 2, top: y - D / 2, width: D, height: D, borderRadius: '50%', background: C.green, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${s})`, boxShadow: '0 16px 40px rgba(33, 196, 93, 0.35)' }}>
          <Tex tex={tex} size={84} />
        </div>
      )}
    </>
  );
};

const labelUnder = (fr: Frame): Pt => mkP(fr)(150, 291);

// ---------- scenes ----------

const Intro: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const fr: Frame = { cx: 620, cy: 530, s: 2.5 };
  return (
    <>
      <Text x={960} y={118} w={1700} size={72} weight={900} align="center" style={fadeUp(f, 0)}>
        正方形、圆、正方形、圆……
      </Text>
      <Stage>
        <Fig fr={fr} sq={ease(f, 6, 24)} c1={ease(f, at(scene, 0, 0.3), 24)} dia={ease(f, at(scene, 0, 0.5), 24)} c2={ease(f, at(scene, 0, 0.72), 24)} ring={ease(f, at(scene, 1, 0.4), 22)} />
      </Stage>
      <div style={{ position: 'absolute', left: 1260, top: 400, ...fadeUp(f, at(scene, 2)) }}>
        <div style={{ fontFamily: PACIFICO, fontSize: 110, color: C.violet }}>Vantee</div>
        <div style={{ fontSize: 44, fontWeight: 700, color: C.muted, marginTop: 4 }}>你的数学小导师</div>
      </div>
    </>
  );
};

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const fr: Frame = { cx: 1500, cy: 470, s: 2.0 };
  return (
    <>
      <div style={{ position: 'absolute', left: 80, top: 140, width: 1000, background: C.card, borderRadius: 32, padding: '32px 48px', fontSize: 48, fontWeight: 600, lineHeight: 1.5, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', ...fadeUp(f, 0) }}>
        一个圆刚好放在<Mark on={at(scene, 1, 0.5)}>边长为 8</Mark> 的正方形里。一个小正方形的<Mark on={at(scene, 2, 0.2)}>4 个顶点都在这个圆上</Mark>，小正方形里面又<Mark on={at(scene, 2, 0.7)}>刚好放着一个小圆</Mark>。两个圆之间的<Mark on={at(scene, 3, 0.3)}>阴影圆环</Mark>，面积是多少？
      </div>
      <Choices x={80} y={720} start={(i) => at(scene, 4, 0.2 + i * 0.12)} />
      <Stage>
        <Fig fr={fr} sq={ease(f, at(scene, 1, 0.05), 24)} c1={ease(f, at(scene, 1, 0.45), 24)} dia={ease(f, at(scene, 2, 0.05), 24)} c2={ease(f, at(scene, 2, 0.5), 24)} ring={ease(f, at(scene, 3, 0.45), 20)} />
      </Stage>
      <TL p={labelUnder(fr)} tex="8" opacity={ease(f, at(scene, 1, 0.7), 10)} />
    </>
  );
};

const Asked: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const P = mkP(FIG);
  const big = ease(f, at(scene, 1, 0.1), 14);
  const cut = ease(f, at(scene, 1, 0.5), 14);
  const flash = ease(f, at(scene, 0, 0.4), 10) * (1 - ease(f, at(scene, 0, 0.8), 14));
  const rad = ease(f, at(scene, 2, 0.15), 14);
  const a1 = (-30 * Math.PI) / 180;
  const a2 = (-150 * Math.PI) / 180;
  const eR = P(150 + R * Math.cos(a1), 150 + R * Math.sin(a1));
  const er = P(150 + RS * Math.cos(a2), 150 + RS * Math.sin(a2));
  const c0 = P(150, 150);
  const ringOn = f < at(scene, 1, 0.1) ? 1 : 0;
  return (
    <>
      <Stage>
        <Fig
          ring={ringOn ? 1 : 0}
          ringColor={VIOLET}
          under={
            <>
              <circle cx={FIG.cx} cy={FIG.cy} r={R * FIG.s} fill={BLUE} opacity={0.3 * big} />
              <circle cx={FIG.cx} cy={FIG.cy} r={RS * FIG.s} fill={C.bg} opacity={cut} />
              {ringOn === 0 && <path d={ringPath(FIG.cx, FIG.cy, R * FIG.s, RS * FIG.s)} fill={VIOLET} fillOpacity={0.3 * cut} fillRule="evenodd" />}
              {flash > 0 && <path d={ringPath(FIG.cx, FIG.cy, R * FIG.s, RS * FIG.s)} fill={VIOLET} fillOpacity={0.35 * flash} fillRule="evenodd" />}
            </>
          }
          over={
            <>
              <Ln a={c0} b={eR} p={rad} color={BLUE} width={10} />
              <Ln a={c0} b={er} p={rad} color={GREEN} width={10} />
            </>
          }
        />
      </Stage>
      <TL p={labelUnder(FIG)} tex="8" />
      <TL p={[(c0[0] + eR[0]) / 2 + 36, (c0[1] + eR[1]) / 2 - 24]} tex="R" color={BLUE} opacity={rad} />
      <TL p={[(c0[0] + er[0]) / 2 - 28, (c0[1] + er[1]) / 2 - 56]} tex="r" color={GREEN} opacity={rad} />
      <div style={{ position: 'absolute', left: PANEL, top: 190, display: 'flex', alignItems: 'center', gap: 16, ...fadeUp(f, at(scene, 1, 0.2)) }}>
        <Chip color={VIOLET} size={46}>圆环</Chip>
        <span style={{ fontSize: 56, fontWeight: 800 }}>=</span>
        <Chip color={BLUE} size={46}>大圆</Chip>
        <span style={{ fontSize: 56, fontWeight: 800 }}>−</span>
        <Chip color={GREEN} size={46}>小圆</Chip>
      </div>
      <Eq y={380} start={at(scene, 2, 0.2)} tex={'R = ?'} color={BLUE} size={72} />
      <Eq y={500} start={at(scene, 2, 0.4)} tex={'r = ?'} color={GREEN} size={72} />
    </>
  );
};

const makePause = (seconds: number, variant: boolean): SceneComponent => ({ scene }) => {
  const f = useCurrentFrame();
  const fr: Frame = { cx: 440, cy: 480, s: 2.2 };
  return (
    <>
      <Stage>
        {variant ? (
          <Fig fr={fr} sq2={1} c3={1} ring={1} ringInner={R3} />
        ) : (
          <Fig fr={fr} ring={1} />
        )}
      </Stage>
      <TL p={labelUnder(fr)} tex={variant ? '12' : '8'} />
      {variant ? (
        <Text x={880} y={130} w={1000} size={48} style={fadeUp(f, 6)}>
          阴影面积 = ?
        </Text>
      ) : (
        <Choices x={880} y={735} start={() => 0} size={48} />
      )}
      <Countdown scene={scene} seconds={seconds} x={1380} y={470} tick={TICK} label={<span style={{ fontFamily: ZH_FONT }}>暂停，试一试<span style={{ color: C.primary }}>！</span></span>} />
    </>
  );
};

const Big: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const P = mkP(FIG);
  const side = ease(f, at(scene, 1, 0.3), 14);
  const dia = ease(f, at(scene, 1, 0.55), 16);
  const rad = ease(f, at(scene, 2, 0.1), 14);
  const disk = ease(f, at(scene, 2, 0.6), 16);
  return (
    <>
      <Stage>
        <Fig under={<circle cx={FIG.cx} cy={FIG.cy} r={R * FIG.s} fill={BLUE} opacity={0.2 * disk} />} />
        <Ln a={P(30, 270)} b={P(270, 270)} p={side} color={GREEN} />
        <Ln a={P(30, 150)} b={P(270, 150)} p={dia} color={BLUE} />
        <Ln a={P(150, 150)} b={P(150, 30)} p={rad} color={AMBER} />
      </Stage>
      <TL p={labelUnder(FIG)} tex="8" color={side > 0 ? GREEN : C.ink} />
      <TL p={P(100, 160)} tex="8" color={BLUE} opacity={dia} />
      <TL p={P(133, 92)} tex="4" color={AMBER} opacity={rad} />
      <Eq y={190} start={at(scene, 1, 0.5)} tex={[z('直径'), '=', z('边长'), '= 8']} size={52} />
      <Eq y={320} start={at(scene, 2, 0.05)} tex={'R = 4'} color={AMBER} />
      <Eq y={430} start={at(scene, 2, 0.45)} tex={'\\pi \\cdot 4^2 = 16\\pi'} color={BLUE} size={64} />
    </>
  );
};

const Diag: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const P = mkP(FIG);
  const outline = ease(f, at(scene, 0, 0.3), 16);
  const dots = ease(f, at(scene, 0, 0.55), 12);
  const diag = ease(f, at(scene, 1, 0.1), 18);
  const tri = ease(f, at(scene, 2, 0.15), 14);
  const rt = ease(f, at(scene, 2, 0.6), 10);
  const side = ease(f, at(scene, 5, 0.55), 10);
  return (
    <>
      <Stage>
        <Fig over={
          <>
            <Poly pts={DIA.map((p) => P(p[0], p[1]))} color={GREEN} width={10} progress={outline} />
            {DIA.map((p, i) => <Dot key={i} p={P(p[0], p[1])} s={dots} />)}
            <Poly pts={[P(150, 30), P(270, 150), P(150, 270)]} color={VIOLET} width={0} fill={VIOLET} fillOpacity={0.3} progress={tri} />
            <Ln a={P(150, 30)} b={P(150, 270)} p={diag} color={AMBER} />
            <RightMark F={P(270, 150)} a={[-1, -1]} b={[-1, 1]} opacity={rt} />
          </>
        } />
      </Stage>
      <TL p={labelUnder(FIG)} tex="8" />
      <TL p={P(131, 92)} tex="8" color={AMBER} opacity={diag} />
      <TL p={P(231, 70)} tex="s" color={VIOLET} opacity={tri * (1 - side)} />
      <TL p={P(231, 230)} tex="s" color={VIOLET} opacity={tri * (1 - side)} />
      <TL p={P(236, 66)} tex={'4\\sqrt2'} color={VIOLET} opacity={side} size={50} />
      <TL p={P(236, 234)} tex={'4\\sqrt2'} color={VIOLET} opacity={side} size={50} />
      <div style={{ position: 'absolute', left: PANEL, top: 150, ...fadeUp(f, at(scene, 1, 0.45)) }}>
        <Chip color={AMBER} size={44}>对角线 = 直径 = 8</Chip>
      </div>
      <div style={{ position: 'absolute', left: PANEL, top: 240, ...fadeUp(f, at(scene, 2, 0.4)) }}>
        <Chip color={VIOLET} size={44}>直角三角形</Chip>
      </div>
      <Eq y={350} start={at(scene, 3, 0.45)} tex={'s^2 + s^2 = 8^2 = 64'} size={60} />
      <Eq y={470} start={at(scene, 4, 0.05)} tex={'s^2 = 32'} size={60} />
      <Eq y={580} start={at(scene, 4, 0.5)} tex={'s = \\sqrt{32}'} size={60} color={VIOLET} />
      <Eq y={680} start={at(scene, 5, 0.1)} tex={'= \\sqrt{16 \\cdot 2} = 4\\sqrt2'} size={60} color={VIOLET} />
    </>
  );
};

const Small: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const P = mkP(FIG);
  const d = ease(f, at(scene, 0, 0.25), 18);
  const r = ease(f, at(scene, 1, 0.15), 14);
  const disk = ease(f, at(scene, 2, 0.6), 16);
  return (
    <>
      <Stage>
        <Fig
          under={<circle cx={FIG.cx} cy={FIG.cy} r={RS * FIG.s} fill={GREEN} opacity={0.22 * disk} />}
          over={
            <>
              <Ci cx={FIG.cx} cy={FIG.cy} r={RS * FIG.s} color={GREEN} width={10} p={ease(f, 4, 20)} />
              <Ln a={P(90, 90)} b={P(210, 210)} p={d} color={AMBER} />
              <Ln a={P(150, 150)} b={P(210, 210)} p={r} color={C.red} width={10} />
              {d > 0 && [P(90, 90), P(210, 210)].map((p, i) => <Dot key={i} p={p} r={11} s={d} />)}
            </>
          }
        />
      </Stage>
      <TL p={labelUnder(FIG)} tex="8" />
      <TL p={P(175, 117)} tex={'4\\sqrt2'} color={AMBER} opacity={d} size={50} />
      <TL p={P(190, 190)} tex={'2\\sqrt2'} color={C.red} opacity={r} size={50} />
      <Eq y={190} start={at(scene, 0, 0.7)} tex={'d = 4\\sqrt2'} color={AMBER} size={64} />
      <Eq y={310} start={at(scene, 1, 0.4)} tex={'r = 2\\sqrt2'} color={C.red} size={64} />
      <Eq y={430} start={at(scene, 2, 0.2)} tex={'(2\\sqrt2)^2 = 4 \\times 2 = 8'} size={60} />
      <Eq y={550} start={at(scene, 2, 0.65)} tex={'\\pi r^2 = 8\\pi'} size={64} color={GREEN} />
    </>
  );
};

const Total1: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const ring = ease(f, at(scene, 0, 0.3), 16);
  const res = fadeUp(f, at(scene, 1, 0.1));
  const s1 = fadeUp(f, at(scene, 0, 0.25));
  return (
    <>
      <Stage>
        <Fig ring={ring} under={<circle cx={FIG.cx} cy={FIG.cy} r={RS * FIG.s} fill={C.bg} opacity={ring} />} />
      </Stage>
      <TL p={labelUnder(FIG)} tex="8" />
      <div style={{ position: 'absolute', left: PANEL, top: 190, display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
        <div style={s1}><Tex tex={'16\\pi - 8\\pi'} size={72} /></div>
        <div style={{ ...res, marginLeft: 20 }}><Tex tex={'= 8\\pi'} size={72} color={C.green} /></div>
      </div>
      <Choices x={PANEL} y={400} start={() => 0} hi={1} hiStart={at(scene, 1, 0.88)} size={48} />
      <Answer x={1650} y={680} value="B" start={at(scene, 1, 0.9)} chime={CHIME} />
    </>
  );
};

// ---- fold ----
export const foldPt = (p: Pt, a: Pt, b: Pt, q: number): Pt => {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const l = Math.hypot(dx, dy);
  const n: Pt = [-dy / l, dx / l];
  const d = (p[0] - a[0]) * n[0] + (p[1] - a[1]) * n[1];
  const k = d * (1 - Math.cos(Math.PI * q));
  return [p[0] - k * n[0], p[1] - k * n[1]];
};

const Fold: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const P = mkP(FIG);
  const dots = (i: number) => ease(f, at(scene, 1, 0.1 + i * 0.12), 10);
  const tris: { c: Pt; a: Pt; b: Pt; col: string }[] = [
    { c: [30, 30], a: [150, 30], b: [30, 150], col: AMBER },
    { c: [270, 30], a: [150, 30], b: [270, 150], col: BLUE },
    { c: [270, 270], a: [270, 150], b: [150, 270], col: VIOLET },
    { c: [30, 270], a: [150, 270], b: [30, 150], col: GREEN },
  ];
  const appear = ease(f, at(scene, 2, 0.0), 10);
  const leg = ease(f, at(scene, 2, 0.02), 10) * (1 - ease(f, at(scene, 4, 0.0), 8));
  return (
    <>
      <Stage>
        <Fig c1={1} c2={0} ring={0} over={
          <>
            {tris.map((t, i) => {
              const q = ease(f, at(scene, 2, 0.22 + i * 0.17), 26);
              const c = foldPt(t.c, t.a, t.b, q);
              return <Poly key={i} pts={[P(t.a[0], t.a[1]), P(t.b[0], t.b[1]), P(c[0], c[1])]} color={t.col} width={5} fill={t.col} fillOpacity={0.5} opacity={appear} />;
            })}
            {DIA.map((p, i) => <Dot key={i} p={P(p[0], p[1])} s={dots(i)} />)}
          </>
        } />
      </Stage>
      <TL p={labelUnder(FIG)} tex="8" />
      <TL p={P(90, 8)} tex="4" opacity={leg} />
      <TL p={P(8, 90)} tex="4" opacity={leg} />
      <div style={{ position: 'absolute', left: PANEL, top: 150, ...fadeUp(f, at(scene, 1, 0.35)) }}>
        <Chip color={AMBER} size={42}>顶点 = 各边中点</Chip>
      </div>
      <Eq y={260} start={at(scene, 3, 0.2)} tex={[z('每个角：'), '\\dfrac12 \\cdot 4 \\cdot 4 = 8']} size={50} />
      <Eq y={400} start={at(scene, 3, 0.65)} tex={'4 \\times 8 = 32'} size={64} />
      <Eq y={520} start={at(scene, 4, 0.4)} tex={'32 = \\dfrac12 \\cdot 64'} size={64} color={C.green} />
    </>
  );
};

// ---- turn ----
const Turn: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const s = 2.0;
  const L: Pt = [390, 470];
  const Rr: Pt = [860, 470];
  const half = RS * s;
  const rotOut = ease(f, at(scene, 0, 0.08), 40);
  const moveOut = ease(f, at(scene, 0, 0.6), 40);
  const back = ease(f, at(scene, 3, 0.05), 40);
  const move = moveOut * (1 - back);
  const rot = rotOut * (1 - back);
  const cx = L[0] + (Rr[0] - L[0]) * move;
  const cy = L[1];
  const ang = 45 * (1 - rot);
  const ringOp = ease(f, at(scene, 3, 0.55), 16);
  const wasRing = f < 12 ? 1 - ease(f, 0, 12) : 0;
  // colours: square blue, circle green. Pair is concentric with the big one only at the very start/end.
  return (
    <>
      <Stage>
        {/* big pair */}
        <rect x={L[0] - R * s} y={L[1] - R * s} width={2 * R * s} height={2 * R * s} fill="none" stroke={BLUE} strokeWidth={7} />
        <circle cx={L[0]} cy={L[1]} r={R * s} fill={GREEN} fillOpacity={0.08} stroke={GREEN} strokeWidth={7} />
        {(ringOp > 0 || wasRing > 0) && <path d={ringPath(L[0], L[1], R * s, RS * s)} fill={VIOLET} fillOpacity={0.3 * Math.max(ringOp, wasRing)} fillRule="evenodd" />}
        {/* small pair: upright square rotated by `ang` about its centre + circle */}
        <g transform={`translate(${cx} ${cy}) rotate(${ang})`}>
          <rect x={-half} y={-half} width={2 * half} height={2 * half} fill={BLUE} fillOpacity={0.06} stroke={BLUE} strokeWidth={7} />
        </g>
        <circle cx={cx} cy={cy} r={half} fill={GREEN} fillOpacity={0.1} stroke={GREEN} strokeWidth={7} />
      </Stage>
      {/* area labels beneath each pair */}
      <div style={{ position: 'absolute', left: L[0] - 240, top: 725, width: 480, display: 'flex', justifyContent: 'center', gap: 36, ...fadeUp(f, at(scene, 1, 0.05)), opacity: ease(f, at(scene, 1, 0.05), 12) * (1 - back) }}>
        <Tex tex="64" size={56} color={BLUE} />
        <span style={{ opacity: ease(f, at(scene, 2, 0.1), 12) }}><Tex tex={'16\\pi'} size={56} color={GREEN} /></span>
      </div>
      <div style={{ position: 'absolute', left: Rr[0] - 220, top: 725, width: 440, display: 'flex', justifyContent: 'center', gap: 36, opacity: ease(f, at(scene, 1, 0.45), 12) * (1 - back) }}>
        <Tex tex="32" size={56} color={BLUE} />
        <span style={{ opacity: ease(f, at(scene, 2, 0.45), 12) }}><Tex tex={'8\\pi'} size={56} color={GREEN} /></span>
      </div>
      <Text x={Rr[0]} y={150} w={500} size={44} weight={800} color={C.muted} align="center" style={{ opacity: ease(f, at(scene, 0, 0.9), 12) * (1 - back) }}>
        缩小版
      </Text>
      {/* panel */}
      <div style={{ position: 'absolute', left: 1080, top: 190, display: 'flex', alignItems: 'center', gap: 14, whiteSpace: 'nowrap', ...fadeUp(f, at(scene, 1, 0.5)) }}>
        <Z p={[z('正方形：'), '\\times\\dfrac12']} size={52} color={BLUE} />
        <Tex tex={'\\Rightarrow'} size={52} />
        <Z p={[z('圆：'), '\\times\\dfrac12']} size={52} color={GREEN} />
      </div>
      <Eq x={1080} y={330} start={at(scene, 2, 0.3)} tex={'16\\pi \\div 2 = 8\\pi'} size={64} color={GREEN} />
      <div style={{ position: 'absolute', left: 1080, top: 470, ...fadeUp(f, at(scene, 3, 0.5)) }}>
        <Z p={[z('圆环'), '= 8\\pi']} size={64} color={VIOLET} />
      </div>
      <div style={{ position: 'absolute', left: 1080, top: 580, ...fadeUp(f, at(scene, 3, 0.7)) }}>
        <Z p={[z('小圆'), '= 8\\pi']} size={64} color={GREEN} />
      </div>
      <Text x={1080} y={680} w={800} size={40} weight={900} color={C.green} style={fadeUp(f, at(scene, 4, 0.5))}>
        图形一层套一层？找找缩小版。
      </Text>
    </>
  );
};

// ---- traps ----
const Strike: React.FC<{ p: number; children: React.ReactNode }> = ({ p, children }) => (
  <span style={{ position: 'relative', display: 'inline-block' }}>
    {children}
    <span style={{ position: 'absolute', left: -6, top: '50%', height: 7, width: `${p * 100}%`, background: C.red, borderRadius: 4 }} />
  </span>
);

const Card: React.FC<{ y: number; h: number; letter: string; start: number; x: number; children: React.ReactNode }> = ({ y, h, letter, start, x, children }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: PANEL, top: y, width: 900, height: h, background: C.card, borderRadius: 24, border: `4px solid ${C.red}33`, boxShadow: '0 6px 22px rgba(30,40,80,0.07)', ...fadeUp(f, start) }}>
      <div style={{ position: 'absolute', left: 22, top: 18, width: 64, height: 64, borderRadius: '50%', background: C.red, color: '#fff', fontSize: 40, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{letter}</div>
      <svg width={70} height={70} viewBox="0 0 70 70" style={{ position: 'absolute', right: 8, top: 15 }}><XMark at={[35, 35]} opacity={ease(f, x, 8)} size={36} /></svg>
      <div style={{ position: 'absolute', left: 110, top: 8, right: 80, display: 'flex', flexDirection: 'column', gap: 4 }}>{children}</div>
    </div>
  );
};

const Traps: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const P = mkP(FIG);
  const c0 = P(150, 150);
  const wrong = ease(f, at(scene, 1, 0.35), 14) * (1 - ease(f, at(scene, 2, 0.1), 12));
  const sideLab = ease(f, at(scene, 2, 0.15), 12);
  const dBig = ease(f, at(scene, 3, 0.15), 14) * (1 - ease(f, at(scene, 4, 0.05), 12));
  const eBoth = ease(f, at(scene, 4, 0.2), 14) * (1 - ease(f, at(scene, 5, 0.05), 12));
  const third = ease(f, at(scene, 5, 0.25), 18) * (1 - ease(f, at(scene, 6, 0.05), 12));
  const ring = ease(f, at(scene, 6, 0.2), 16);
  const xs = (st: number) => ease(f, st, 8);
  const T = P(150, 150);
  return (
    <>
      <Stage>
        <Fig
          ring={ring}
          under={
            <>
              <circle cx={FIG.cx} cy={FIG.cy} r={R * FIG.s} fill={BLUE} opacity={0.28 * Math.max(dBig, eBoth)} />
              <circle cx={FIG.cx} cy={FIG.cy} r={RS * FIG.s} fill={GREEN} opacity={0.4 * eBoth} />
            </>
          }
          over={
            <>
              {wrong > 0 && <circle cx={c0[0]} cy={c0[1]} r={60 * FIG.s} fill="none" stroke={C.red} strokeWidth={8} strokeDasharray="16 12" opacity={wrong} />}
              {third > 0 && (
                <g opacity={third * 0.75}>
                  <Poly pts={SQ2.map((p) => P(p[0], p[1]))} color={AMBER} width={6} />
                  <circle cx={c0[0]} cy={c0[1]} r={R3 * FIG.s} fill={AMBER} fillOpacity={0.25} stroke={AMBER} strokeWidth={6} />
                </g>
              )}
            </>
          }
        />
      </Stage>
      <TL p={labelUnder(FIG)} tex="8" />
      <TL p={P(228, 72)} tex={'4\\sqrt2'} color={VIOLET} opacity={sideLab * (1 - ease(f, at(scene, 3, 0.1), 10))} size={50} />
      <TL p={T} tex={'4\\pi'} color={AMBER} opacity={third} />
      <TL p={P(195, 100)} tex={'r=2?'} color={C.red} opacity={wrong} size={50} />
      <Card y={125} h={240} letter="C" start={at(scene, 1, 0.0)} x={at(scene, 1, 0.8)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, whiteSpace: 'nowrap' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Tex tex={'r = 2?'} size={48} color={ease(f, at(scene, 1, 0.55), 12) > 0.5 ? C.muted : C.ink} />
            <svg width={44} height={44} viewBox="0 0 44 44"><XMark at={[22, 22]} opacity={ease(f, at(scene, 1, 0.55), 12)} size={26} /></svg>
          </span>
          <Tex tex={'16\\pi - 4\\pi = 12\\pi'} size={48} />
        </div>
        <div style={{ whiteSpace: 'nowrap', opacity: ease(f, at(scene, 2, 0.1), 12) }}><Z p={[z('边长'), '= 4\\sqrt2 \\approx 5.66', z('，不是'), '4']} size={48} color={VIOLET} /></div>
        <div style={{ whiteSpace: 'nowrap', opacity: ease(f, at(scene, 2, 0.6), 12) }}><Z p={[z('面积'), '\\div 2', z('，不是半径'), '\\div 2']} size={48} color={C.green} /></div>
      </Card>
      <Card y={380} h={100} letter="D" start={at(scene, 3, 0.0)} x={at(scene, 3, 0.7)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, whiteSpace: 'nowrap', marginTop: 8 }}>
          <Tex tex={'16\\pi'} size={52} />
          <span style={{ fontSize: 40, fontWeight: 800, color: C.muted }}>什么也没减</span>
        </div>
      </Card>
      <Card y={495} h={100} letter="E" start={at(scene, 4, 0.0)} x={at(scene, 4, 0.7)}>
        <div style={{ whiteSpace: 'nowrap', marginTop: 8 }}><Tex tex={'16\\pi + 8\\pi = 24\\pi'} size={52} /></div>
      </Card>
      <Card y={610} h={100} letter="A" start={at(scene, 5, 0.0)} x={at(scene, 5, 0.8)}>
        <div style={{ whiteSpace: 'nowrap', marginTop: 8 }}><Tex tex={'8\\pi \\div 2 = 4\\pi'} size={52} /></div>
      </Card>
      <div style={{ position: 'absolute', left: PANEL, top: 740, ...fadeUp(f, at(scene, 6, 0.3)), background: C.card, border: `5px solid ${C.green}`, borderRadius: 24, padding: '6px 34px' }}>
        <Z p={[z('圆环'), '=', z('大圆'), '-', z('小圆')]} size={58} color={C.green} />
      </div>
    </>
  );
};

// ---- variant ----
const VarChain: React.FC<{ y: number; scene: Scene }> = ({ y, scene }) => {
  const f = useCurrentFrame();
  const a = fadeUp(f, at(scene, 0, 0.5));
  const b = fadeUp(f, at(scene, 1, 0.55));
  const c = fadeUp(f, at(scene, 2, 0.4));
  const Arrow = ({ s }: { s: React.CSSProperties }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', ...s }}>
      <Tex tex={'\\div 2'} size={44} color={C.muted} />
      <Tex tex={'\\longrightarrow'} size={52} color={C.muted} />
    </div>
  );
  return (
    <div style={{ position: 'absolute', left: PANEL, top: y, display: 'flex', alignItems: 'center', gap: 22, whiteSpace: 'nowrap' }}>
      <div style={a}><Tex tex={'36\\pi'} size={64} color={BLUE} /></div>
      <Arrow s={b} />
      <div style={b}><Tex tex={'18\\pi'} size={64} color={AMBER} /></div>
      <Arrow s={c} />
      <div style={c}><Tex tex={'9\\pi'} size={64} color={GREEN} /></div>
    </div>
  );
};

const Variant: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const t = (x: number) => at(scene, 1, x);
  const fr = FIG;
  return (
    <>
      <Stage>
        <Fig
          sq={ease(f, t(0.04), 22)}
          c1={ease(f, t(0.56), 18)}
          dia={ease(f, t(0.65), 18)}
          c2={ease(f, t(0.74), 18)}
          sq2={ease(f, t(0.82), 18)}
          c3={ease(f, t(0.9), 18)}
          ring={ease(f, at(scene, 3, 0.45), 20)}
          ringInner={R3}
        />
      </Stage>
      <TL p={labelUnder(fr)} tex="12" opacity={ease(f, t(0.04), 10)} />
      <Eq y={190} start={t(0.05)} tex={[z('边长'), '= 12']} size={60} />
      <div style={{ position: 'absolute', left: PANEL, top: 310, display: 'flex', gap: 14, alignItems: 'center', ...fadeUp(f, t(0.55)) }}>
        {['圆', '正方形', '圆', '正方形', '圆'].map((n, i) => (
          <span key={i} style={{ opacity: ease(f, [0.56, 0.65, 0.74, 0.82, 0.9].map(t)[i], 8), background: i % 2 === 0 ? GREEN : BLUE, color: '#fff', borderRadius: 999, padding: '4px 18px', fontSize: 40, fontWeight: 900 }}>{n}</span>
        ))}
      </div>
      <Eq y={470} start={at(scene, 3, 0.5)} tex={[z('面积'), '= ?']} size={84} color={VIOLET} />
    </>
  );
};

const VariantAnswer: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const fr = FIG;
  const P = mkP(fr);
  const d0 = ease(f, at(scene, 0, 0.3), 14);
  const d1 = ease(f, at(scene, 1, 0.3), 14);
  const d2 = ease(f, at(scene, 2, 0.3), 14);
  const band = ease(f, at(scene, 3, 0.1), 16);
  const rad = ease(f, at(scene, 0, 0.3), 14);
  const rad3 = ease(f, at(scene, 4, 0.75), 14);
  const done = at(scene, 3, 0.85);
  const fill = (r: number, col: string, o: number, off: number) => <circle cx={fr.cx} cy={fr.cy} r={r * fr.s} fill={col} opacity={o * off} />;
  return (
    <>
      <Stage>
        <Fig
          sq2={1}
          c3={1}
          ring={band}
          ringInner={R3}
          under={
            <>
              {fill(R, BLUE, 0.28, d0 * (1 - d1))}
              {fill(RS, AMBER, 0.32, d1 * (1 - d2))}
              {fill(R3, GREEN, 0.4, d2 * (1 - band))}
            </>
          }
          over={
            <>
              <Ln a={P(150, 150)} b={P(150, 30)} p={rad * (1 - d1)} color={BLUE} width={10} />
              <Ln a={P(150, 150)} b={P(150, 90)} p={rad3} color={GREEN} width={10} />
            </>
          }
        />
      </Stage>
      <TL p={labelUnder(fr)} tex="12" />
      <TL p={P(131, 74)} tex="6" color={BLUE} opacity={rad * (1 - d1)} />
      <TL p={P(135, 124)} tex="3" color={GREEN} opacity={rad3} size={48} />
      <Eq y={150} start={at(scene, 0, 0.3)} tex={'\\pi \\cdot 6^2 = 36\\pi'} size={60} color={BLUE} />
      <VarChain y={270} scene={scene} />
      <Eq y={390} start={at(scene, 3, 0.1)} tex={'36\\pi - 9\\pi'} size={64} color={C.green} />
      <Eq y={390} x={PANEL + 335} start={at(scene, 3, 0.62)} tex={'= 27\\pi'} size={64} color={C.green} />
      <div style={{ position: 'absolute', left: PANEL, top: 500, display: 'flex', alignItems: 'center', gap: 16, whiteSpace: 'nowrap', ...fadeUp(f, at(scene, 4, 0.1)) }}>
        <Z p={[z('面积'), '\\times\\dfrac14']} size={48} />
        <Tex tex={'\\Rightarrow'} size={48} />
        <Z p={[z('半径'), '\\times\\dfrac12']} size={48} />
      </div>
      <Eq y={660} start={at(scene, 4, 0.8)} tex={'r = 3'} size={56} color={GREEN} />
      <Eq y={660} x={1200} start={at(scene, 5, 0.3)} tex={'\\pi \\cdot 3^2 = 9\\pi \\ \\checkmark'} size={56} color={GREEN} />
      <AnswerTex x={1745} y={545} tex={'27\\pi'} start={done} />
      <Confetti x={1745} y={545} start={done} seed={7} />
      <Pill x={PANEL} y={770} color={C.primary} style={{ ...fadeUp(f, at(scene, 6, 0.2)), fontSize: 40 }}>太棒了！</Pill>
    </>
  );
};

// ---- recap ----
const RuleCard: React.FC<{ x: number; start: number; title: string; rule: string }> = ({ x, start, title, rule }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: x, top: 150, width: 540, height: 640, background: C.card, borderRadius: 36, boxShadow: '0 10px 40px rgba(30,40,80,0.08)', ...fadeUp(f, start) }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 36, textAlign: 'center', fontSize: 48, fontWeight: 900, color: C.primary }}>{title}</div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 480, textAlign: 'center', fontSize: 48, fontWeight: 800, padding: '0 20px', lineHeight: 1.25 }}>{rule}</div>
    </div>
  );
};

const Recap: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const cardOut = fadeTo(f, at(scene, 3, 0));
  const cy = 450;
  const c1: Pt = [370, cy], c2: Pt = [960, cy], c3: Pt = [1550, cy];
  const o1 = ease(f, at(scene, 1, 0.05), 12);
  const o2 = ease(f, at(scene, 1, 0.5), 12);
  const o3 = ease(f, at(scene, 2, 0.1), 12);
  const d1 = ease(f, at(scene, 1, 0.3), 14);
  const d2 = ease(f, at(scene, 1, 0.75), 14);
  return (
    <>
      <Text x={960} y={55} w={1200} size={62} weight={900} align="center" style={{ ...fadeUp(f, 4), opacity: ease(f, 4, 12) * cardOut }}>关键思路</Text>
      <div style={{ opacity: cardOut }}>
        <RuleCard x={100} start={at(scene, 1, 0.0)} title="圆里的正方形" rule="对角线 = 直径" />
        <RuleCard x={690} start={at(scene, 1, 0.45)} title="正方形里的圆" rule="直径 = 边长" />
        <RuleCard x={1280} start={at(scene, 2, 0.05)} title="圆、正方形、圆" rule="面积 × ½" />
      </div>
      <Stage>
        <g opacity={cardOut}>
          {/* 1: square (diamond) in circle, diagonal = diameter */}
          <g opacity={o1}>
            <circle cx={c1[0]} cy={c1[1]} r={130} fill={BLUE} fillOpacity={0.1} stroke={C.ink} strokeWidth={6} />
            <Poly pts={[[c1[0], c1[1] - 130], [c1[0] + 130, c1[1]], [c1[0], c1[1] + 130], [c1[0] - 130, c1[1]]]} color={C.ink} width={6} />
            <Ln a={[c1[0] - 130, c1[1]]} b={[c1[0] + 130, c1[1]]} p={d1} color={AMBER} />
          </g>
          {/* 2: circle in square, diameter = side */}
          <g opacity={o2}>
            <rect x={c2[0] - 130} y={c2[1] - 130} width={260} height={260} fill="none" stroke={C.ink} strokeWidth={6} />
            <circle cx={c2[0]} cy={c2[1]} r={130} fill={GREEN} fillOpacity={0.12} stroke={C.ink} strokeWidth={6} />
            <Ln a={[c2[0] - 130, c2[1] + 130]} b={[c2[0] + 130, c2[1] + 130]} p={d2} color={BLUE} />
            <Ln a={[c2[0] - 130, c2[1]]} b={[c2[0] + 130, c2[1]]} p={d2} color={BLUE} />
          </g>
          {/* 3: three levels */}
          <g opacity={o3}>
            <circle cx={c3[0]} cy={c3[1]} r={130} fill={BLUE} fillOpacity={0.1} stroke={C.ink} strokeWidth={6} />
            <Poly pts={[[c3[0], c3[1] - 130], [c3[0] + 130, c3[1]], [c3[0], c3[1] + 130], [c3[0] - 130, c3[1]]]} color={C.ink} width={6} />
            <circle cx={c3[0]} cy={c3[1]} r={92} fill={GREEN} fillOpacity={0.3} stroke={C.ink} strokeWidth={6} />
          </g>
        </g>
      </Stage>
      <SignOff start={at(scene, 3, 0.1)} />
      <Confetti x={960} y={380} start={at(scene, 3, 0.2)} seed={3} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = {
  intro: Intro,
  question: Question,
  asked: Asked,
  try1: makePause(10, false),
  big: Big,
  diag: Diag,
  small: Small,
  total1: Total1,
  fold: Fold,
  turn: Turn,
  traps: Traps,
  variant: Variant,
  try2: makePause(10, true),
  'variant-answer': VariantAnswer,
  recap: Recap,
};

export const Video: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <Explainer timeline={timeline} scenes={SCENES} badge="AMC 8 风格 · 第4级" font={ZH_FONT} /> : null;
