import { Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { clamp, ease, fadeTo, fadeUp, pop } from '../../lib/anim';
import { Explainer, at, type SceneComponent, type Timeline } from '../../lib/Explainer';
import { Countdown } from '../../lib/PauseCard';
import { Stage } from '../../lib/grid';
import { PACIFICO } from '../../lib/fonts';
import { Tex } from '../../lib/Tex';
import { Answer, Check, Choices, Confetti, Mark, Pill, Text } from '../../lib/ui';
import { C } from '../../lib/theme';

export const SLUG = '2026-10-31-goldfish-pond';
const CHIME = staticFile(`${SLUG}/sfx/fs-541985.mp3`); // Freesound CC0, see sfx/FREESOUND-CREDITS.md
const TICK = staticFile(`${SLUG}/sfx/fs-668355.mp3`);

const GOLD = '#ff9f1c';
const GD = '#e08600'; // darker gold, for text
const GREY = '#9aa3b2';
const GRD = '#6b7385'; // darker grey, for text
const PX = 90;
const PY = 190;
const CELL = 36;
const PANEL = 900;

const col = (c: string, t: string) => `{\\color{${c}}${t}}`;
const cG = (t: string) => col(GD, t);
const cO = (t: string) => col(GRD, t);

// ---------- pond: 20 columns x 10 rows of fish; the grey "other" fish fill the 2 right-hand columns ----------

type PondP = {
  x?: number; y?: number; cell?: number; op?: number;
  appear?: number; gone?: number; glow?: number; lift?: number; lock?: number;
};

const Fish: React.FC<{ cx: number; cy: number; color: string; s: number; op: number }> = ({ cx, cy, color, s, op }) => (
  <g transform={`translate(${cx} ${cy}) scale(${s})`} opacity={op}>
    <ellipse rx={11} ry={8} fill={color} />
    <path d="M-8 0 L-17 -7 L-17 7 Z" fill={color} />
    <circle cx={6} cy={-2} r={1.9} fill="#fff" />
  </g>
);

const Pond: React.FC<PondP> = ({ x = PX, y = PY, cell = CELL, op = 1, appear = 1, gone = 0, glow = 0, lift = 0, lock = 0 }) => {
  const f = useCurrentFrame();
  const W = 20 * cell;
  const H = 10 * cell;
  const s = cell / 36;
  const pulse = 0.55 + 0.45 * Math.sin(f / 7);
  const fish: React.ReactNode[] = [];
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 20; c++) {
      const grey = c >= 18;
      const a = Math.max(0, Math.min(1, appear * 1.6 - (c / 20) * 0.6));
      let o = a;
      let dy = 0;
      if (!grey) {
        const g = Math.max(0, Math.min(1, (gone - (c / 10) * 0.55) / 0.45));
        if (c < 10) o *= 1 - g;
        if ((r * 7 + c * 3) % 13 === 0) {
          dy = -lift * 30 * s;
          o *= 1 - 0.55 * lift;
        }
      }
      if (o <= 0.01) continue;
      fish.push(<Fish key={`${r}-${c}`} cx={x + c * cell + cell / 2} cy={y + r * cell + cell / 2 + dy} color={grey ? GREY : GOLD} s={s} op={o} />);
    }
  }
  const gx = x + 18 * cell;
  return (
    <>
      <div style={{ position: 'absolute', left: x - 14, top: y - 14, width: W + 28, height: H + 28, borderRadius: 30, background: 'rgba(76, 201, 240, 0.14)', border: '4px solid rgba(76, 201, 240, 0.4)', opacity: op * Math.min(1, appear * 3) }} />
      <Stage>
        <g opacity={op}>
          {glow > 0 && <rect x={gx - 6} y={y - 6} width={2 * cell + 12} height={H + 12} rx={16} fill="rgba(123, 97, 255, 0.12)" stroke={C.violet} strokeWidth={6} opacity={glow * pulse} />}
          {lock > 0 && <rect x={gx - 6} y={y - 6} width={2 * cell + 12} height={H + 12} rx={16} fill="none" stroke={C.violet} strokeWidth={6} strokeDasharray="14 10" opacity={lock} />}
          {fish}
        </g>
      </Stage>
    </>
  );
};

/** Labels under the pond: gold section and grey section. */
const PondLabels: React.FC<{ gold?: string; grey?: string; goldOp?: number; greyOp?: number; y?: number; goldColor?: string }> = ({ gold, grey, goldOp = 1, greyOp = 1, y = PY + 10 * CELL + 26, goldColor = GD }) => (
  <>
    {gold && <Text x={PX + 9 * CELL} y={y} w={18 * CELL} size={50} weight={900} color={goldColor} align="center" style={{ opacity: goldOp, whiteSpace: 'nowrap' }}>{gold}</Text>}
    {grey && <Text x={PX + 19 * CELL} y={y} w={4 * CELL + 80} size={50} weight={900} color={GRD} align="center" style={{ opacity: greyOp, whiteSpace: 'nowrap' }}>{grey}</Text>}
  </>
);

// ---------- bar split into equal parts ----------

type Part = { color: string; label?: string; op?: number; labelOp?: number; txt?: string };
const Bar: React.FC<{ x: number; y: number; w: number; h?: number; parts: Part[]; op?: number }> = ({ x, y, w, h = 90, parts, op = 1 }) => {
  const n = parts.length;
  const pw = (w - (n - 1) * 6) / n;
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, display: 'flex', gap: 6, opacity: op }}>
      {parts.map((p, i) => (
        <div key={i} style={{ width: pw, height: h, background: p.color, opacity: p.op ?? 1, borderRadius: i === 0 ? '24px 8px 8px 24px' : i === n - 1 ? '8px 24px 24px 8px' : 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 54, fontWeight: 900, color: p.txt ?? '#fff' }}>
          <span style={{ opacity: p.labelOp ?? 1 }}>{p.label}</span>
        </div>
      ))}
    </div>
  );
};

const Eq: React.FC<{ x?: number; y: number; start: number; tex: string; size?: number; color?: string }> = ({ x = PANEL, y, start, tex, size = 54, color = C.ink }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: x, top: y, whiteSpace: 'nowrap', ...fadeUp(f, start) }}>
      <Tex tex={tex} size={size} color={color} />
    </div>
  );
};

const Card: React.FC<{ x?: number; y: number; w?: number; start: number; children: React.ReactNode; color?: string }> = ({ x = PANEL, y, w = 960, start, children, color = C.red }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, background: C.card, borderRadius: 22, borderLeft: `12px solid ${color}`, padding: '10px 30px', fontSize: 40, fontWeight: 800, boxShadow: '0 6px 22px rgba(30,40,80,0.08)', ...fadeUp(f, start) }}>
      {children}
    </div>
  );
};

const Fade: React.FC<{ op: number; children: React.ReactNode }> = ({ op, children }) => (op <= 0 ? null : <div style={{ opacity: op, position: 'absolute', inset: 0 }}>{children}</div>);

const Tag: React.FC<{ x: number; y: number; start: number; color: string; children: React.ReactNode; size?: number; w?: number }> = ({ x, y, start, color, children, size = 40, w }) => {
  const f = useCurrentFrame();
  return (
    <Pill x={x} y={y} color={color} style={{ ...fadeUp(f, start), fontSize: size, whiteSpace: w ? 'normal' : 'nowrap', width: w, textAlign: w ? 'center' : undefined, borderRadius: w ? 36 : 999 }}>
      {children}
    </Pill>
  );
};

// ---------- scenes ----------

const Intro: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const wob = 1 + 0.08 * Math.sin(Math.min(1, Math.max(0, (f - at(scene, 1, 0.3)) / 50)) * Math.PI * 3);
  return (
    <>
      <Pond appear={ease(f, 4, 40)} />
      <div style={{ position: 'absolute', left: PANEL, top: 190, ...fadeUp(f, at(scene, 0, 0.1)) }}>
        <div style={{ fontSize: 130, fontWeight: 900 }}>
          <span style={{ color: GD }}>90%</span> <span style={{ color: C.muted }}>→</span> <span style={{ color: GD }}>80%</span>
        </div>
        <div style={{ fontSize: 50, fontWeight: 800, color: C.muted, marginTop: 4 }}>goldfish in the pond</div>
      </div>
      <Pill x={PANEL} y={440} color={C.red} style={{ ...fadeUp(f, at(scene, 1, 0.1)), fontSize: 46, transform: `scale(${wob})`, transformOrigin: 'left center' }}>Most kids guess 10</Pill>
      <Pill x={PANEL} y={540} color={C.green} style={{ ...fadeUp(f, at(scene, 1, 0.55)), fontSize: 46 }}>The real answer is much bigger</Pill>
      <div style={{ position: 'absolute', left: PANEL, top: 650, ...fadeUp(f, at(scene, 2, 0.25)) }}>
        <div style={{ fontFamily: PACIFICO, fontSize: 110, color: C.violet }}>Vantee</div>
        <div style={{ fontSize: 38, fontWeight: 700, color: C.muted, marginTop: -6 }}>your math tutor</div>
      </div>
    </>
  );
};

const CH = ['10', '20', '40', '50', '100'];

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const s = (i: number) => ({ opacity: ease(f, at(scene, i), 10) });
  const ls = at(scene, 3, 0.35);
  const lift = Math.sin(Math.min(1, Math.max(0, (f - ls) / 50)) * Math.PI);
  return (
    <>
      <Pond lift={lift} />
      <PondLabels gold="" />
      <Text x={PX + 360} y={PY + 10 * CELL + 28} w={720} size={56} weight={900} align="center" style={fadeUp(f, at(scene, 1, 0.4))}>200 fish</Text>
      <Text x={PX + 360} y={PY + 10 * CELL + 100} w={720} size={52} weight={900} color={GD} align="center" style={fadeUp(f, at(scene, 2, 0.5))}>90% goldfish</Text>
      <div style={{ position: 'absolute', left: PANEL, top: 140, width: 940, minHeight: 440, background: C.card, borderRadius: 32, padding: '30px 44px', fontSize: 44, fontWeight: 600, lineHeight: 1.45, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', opacity: ease(f, at(scene, 1) - 4, 10) }}>
        <span style={s(1)}>A pond has 200 fish, </span>
        <span style={s(2)}>and 90% of them are goldfish. </span>
        <span style={s(3)}>How many goldfish must be <Mark on={at(scene, 3, 0.35)}>taken out</Mark> so that 80% of the fish left are goldfish?</span>
      </div>
      <Choices x={PANEL} y={680} start={(i) => at(scene, 4, 0.2 + i * 0.12)} items={CH.map((c) => <Tex key={c} tex={c} size={56} />)} />
    </>
  );
};

const Asked: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Pond lock={ease(f, at(scene, 1, 0.3), 14)} />
      <Text x={PANEL} y={160} w={960} size={52} weight={900} style={fadeUp(f, at(scene, 0, 0.35))}>
        <span style={{ color: C.muted }}>Start:</span> 200 fish, <span style={{ color: GD }}>90% goldfish</span>
      </Text>
      <Tag x={PANEL} y={290} start={at(scene, 1, 0.1)} color={GD} size={46}>Only goldfish leave</Tag>
      <Tag x={PX + 18 * CELL - 40} y={PY + 10 * CELL + 28} start={at(scene, 1, 0.45)} color={C.violet} size={44}>others stay</Tag>
      <Text x={PANEL} y={440} w={960} size={52} weight={900} style={fadeUp(f, at(scene, 2, 0.05))}>
        <span style={{ color: C.muted }}>End:</span> 80% of the fish <Mark on={at(scene, 2, 0.45)}>LEFT</Mark> are goldfish
      </Text>
    </>
  );
};

const PAUSE_TEXT = (
  <>A pond has 200 fish, and 90% of them are goldfish. How many goldfish must be taken out so that 80% of the fish left are goldfish?</>
);
const PAUSE_TEXT2 = (
  <>A bigger pond has 400 fish, and 95% of them are goldfish. How many goldfish must be taken out so that 75% of the fish left are goldfish?</>
);

const Pause1: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Pond x={70} y={200} cell={32} />
      <div style={{ position: 'absolute', left: 770, top: 150, width: 650, background: C.card, borderRadius: 28, padding: '24px 36px', fontSize: 42, fontWeight: 600, lineHeight: 1.45, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', ...fadeUp(f, 6) }}>{PAUSE_TEXT}</div>
      <Countdown scene={scene} seconds={10} x={1660} y={500} tick={TICK} />
    </>
  );
};

const BigBar: React.FC<{ x: number; y: number; w: number; op?: number }> = ({ x, y, w, op = 1 }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: w, height: 64, display: 'flex', gap: 4, opacity: op }}>
    <div style={{ width: w * 0.95 - 2, background: GOLD, borderRadius: '22px 6px 6px 22px' }} />
    <div style={{ width: w * 0.05 - 2, background: GREY, borderRadius: '6px 22px 22px 6px' }} />
  </div>
);

const Pause2: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 120, top: 170, width: 1100, background: C.card, borderRadius: 28, padding: '28px 40px', fontSize: 48, fontWeight: 600, lineHeight: 1.45, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', ...fadeUp(f, 6) }}>{PAUSE_TEXT2}</div>
      <BigBar x={120} y={560} w={1100} op={ease(f, 14, 14)} />
      <Text x={120} y={640} w={1100} size={48} weight={800} color={C.muted} style={fadeUp(f, 14)}>400 fish, 95% goldfish</Text>
      <Countdown scene={scene} seconds={12} x={1660} y={500} tick={TICK} />
    </>
  );
};

const Stay: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const glow = ease(f, at(scene, 2, 0.1), 12) * fadeTo(f, at(scene, 3), 0.5, 12);
  return (
    <>
      <Pond glow={glow} lock={ease(f, at(scene, 3, 0.4), 14)} />
      <Pill x={PANEL} y={160} color={C.primary} style={{ ...fadeUp(f, at(scene, 0, 0.45)), fontSize: 42 }}>Watch the fish that don't change</Pill>
      <Eq y={300} start={at(scene, 1, 0.2)} tex={'10\\%\\text{ of }200 = 20'} />
      <Eq y={400} start={at(scene, 1, 0.58)} tex={`90\\% = 9\\times 20 = ${cG('180')}`} />
      <PondLabels gold="180 goldfish" goldOp={ease(f, at(scene, 1, 0.8), 12)} grey="20 others" greyOp={ease(f, at(scene, 2, 0.3), 12)} />
      <Tag x={PX + 18 * CELL - 30} y={PY - 90} start={at(scene, 3, 0.5)} color={C.violet} size={46}>stays!</Tag>
    </>
  );
};

const FW = 700; // bar width in the "fifth" scene

const Fifth: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const gone = ease(f, at(scene, 3, 0.35), Math.round(scene.lines[3].frames * 0.55));
  const bp = (i: number) => ease(f, at(scene, 2, 0.05 + i * 0.07), 8);
  const done = at(scene, 5, 0.85);
  const afterGone = f >= at(scene, 3, 0.95);
  return (
    <>
      <Pond gone={gone} />
      <Eq y={130} size={52} start={at(scene, 0, 0.55)} tex={'100\\% - 80\\% = 20\\%'} />
      <Eq y={215} size={52} start={at(scene, 1, 0.45)} tex={'20\\% = \\dfrac{1}{5}'} />
      <Bar
        x={PANEL}
        y={355}
        w={FW}
        parts={[
          { color: GOLD, op: bp(0) },
          { color: GOLD, op: bp(1) },
          { color: GOLD, op: bp(2) },
          { color: GOLD, op: bp(3) },
          { color: GREY, label: '20', op: bp(4), labelOp: ease(f, at(scene, 2, 0.4), 8) },
        ]}
      />
      <Eq y={470} size={52} start={at(scene, 2, 0.75)} tex={`5\\times 20 = 100\\text{ fish left}`} />
      <Eq y={560} size={52} start={at(scene, 3, 0.6)} tex={`200 - 100 = ${cG('100')}\\text{ goldfish out}`} />
      <Text x={PX + 360} y={PY + 10 * CELL + 28} w={720} size={52} weight={900} align="center" style={{ opacity: ease(f, at(scene, 3, 0.95), 12) }}>100 fish left</Text>
      <Check x={PANEL} y={665} start={at(scene, 4, 0.35)}>
        <Tex tex={'\\dfrac{80}{100} = 80\\%'} size={56} />
      </Check>
      {afterGone && <div style={{ position: 'absolute', left: PX + 14 * CELL - 200, top: PY - 76, fontSize: 48, fontWeight: 800, color: GD, width: 400, whiteSpace: 'nowrap', textAlign: 'center', ...fadeUp(f, at(scene, 4, 0.1)) }}>80 goldfish</div>}
      <Answer x={1740} y={290} value="100" start={done} chime={CHIME} />
      <Confetti x={1740} y={290} start={done} seed={7} />
      <Pill x={1640} y={440} color={C.green} style={{ ...fadeUp(f, done + 4), fontSize: 46 }}>Choice E</Pill>
    </>
  );
};

const Ratio: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const BX = 110;
  const BW = 150;
  const GAP = 24;
  const BY = 250;
  const blocks = [0, 1, 2, 3, 4];
  const fillP = (i: number) => ease(f, at(scene, 2, 0.15 + i * 0.12), 12);
  const greyL = ease(f, at(scene, 2, 0.0), 10);
  return (
    <>
      {blocks.map((i) => {
        const grey = i === 4;
        const color = grey ? GREY : GOLD;
        const show = ease(f, at(scene, 1, 0.45 + i * 0.1), 8);
        const p = grey ? 1 : fillP(i);
        return (
          <div key={i} style={{ position: 'absolute', left: BX + i * (BW + GAP), top: BY, width: BW, height: BW, opacity: show, borderRadius: 24, border: `5px solid ${color}`, overflow: 'hidden', background: C.card }}>
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: `${p * 100}%`, background: color }} />
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64, fontWeight: 900, color: '#fff', opacity: grey ? greyL : ease(f, at(scene, 2, 0.3 + i * 0.12), 8) }}>20</div>
          </div>
        );
      })}
      <Text x={BX + 2 * (BW + GAP) - GAP / 2 + 10} y={BY + BW + 20} w={4 * BW + 3 * GAP} size={46} weight={900} color={GD} align="center" style={{ opacity: ease(f, at(scene, 1, 0.9), 10) }}>4 parts goldfish</Text>
      <Text x={BX + 4 * (BW + GAP) + BW / 2} y={BY + BW + 20} w={BW + GAP + 120} size={46} weight={900} color={GRD} align="center" style={{ opacity: ease(f, at(scene, 1, 0.9), 10) }}>1 part others</Text>
      <Eq x={1100} y={160} start={at(scene, 0, 0.5)} tex={f < at(scene, 1, 0.2) ? `${cG('80\\%')} : ${cO('20\\%')}` : `${cG('80\\%')} : ${cO('20\\%')} = ${cG('4')} : ${cO('1')}`} />
      <Eq x={110} y={520} start={at(scene, 2, 0.8)} tex={`4\\times 20 = ${cG('80')}\\text{ goldfish}`} />
      <Eq x={110} y={610} start={at(scene, 3, 0.4)} tex={`180 - 80 = ${col(C.green, '100')}`} />
      <Tag x={110} y={715} start={at(scene, 4, 0.35)} color={C.violet} size={40}>fixed group → new total</Tag>
    </>
  );
};

type Row = { take: string; left: string; fifth: string; ok: boolean; letter: string };
const ROWS: Row[] = [
  { letter: 'A', take: '10', left: '190', fifth: '38', ok: false },
  { letter: 'B', take: '20', left: '180', fifth: '36', ok: false },
  { letter: 'C', take: '40', left: '160', fifth: '32', ok: false },
  { letter: 'D', take: '50', left: '150', fifth: '30', ok: false },
  { letter: 'E', take: '100', left: '100', fifth: '20', ok: true },
];
const TW = [260, 200, 260, 300];
const TX = 80;
const TY = 235;
const TH = 90;

const Traps: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const starts = [3, 5, 6, 7, 8]; // scene line where each row begins
  const xs = TW.reduce<number[]>((a, w, i) => [...a, a[i] + w], [TX]);
  const hdr = ease(f, at(scene, 2, 0.45), 12);
  const cell = (r: number, c: number, text: React.ReactNode, color: string, start: number, size = 54) => (
    <div key={`${r}-${c}`} style={{ position: 'absolute', left: xs[c], top: TY + TH * (r + 1), width: TW[c], height: TH, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size, fontWeight: 900, color, whiteSpace: 'nowrap', ...fadeUp(f, start, 10) }}>
      {text}
    </div>
  );
  return (
    <>
      <Text x={TX} y={130} w={1100} size={48} weight={900} style={fadeUp(f, at(scene, 2, 0.1))}>
        <span style={{ color: GRD }}>20 others</span> = <span style={{ color: C.violet }}>one fifth</span> of the fish left
      </Text>
      <div style={{ position: 'absolute', left: TX, top: TY, width: xs[4] - TX, height: TH, display: 'flex', opacity: hdr, borderBottom: `5px solid ${C.line}` }}>
        {['take out', 'left', 'one fifth', 'need 20'].map((h, i) => (
          <div key={h} style={{ width: TW[i], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, fontWeight: 800, color: C.muted }}>{h}</div>
        ))}
      </div>
      {ROWS.map((r, i) => {
        const s0 = at(scene, starts[i]);
        const color = r.ok ? C.green : C.red;
        const bg = ease(f, at(scene, starts[i], 0.7), 10);
        return (
          <div key={r.take}>
            <div style={{ position: 'absolute', left: TX - 12, top: TY + TH * (i + 1) + 6, width: xs[4] - TX + 24, height: TH - 12, borderRadius: 20, background: r.ok ? 'rgba(33,196,93,0.14)' : 'rgba(239,67,67,0.09)', opacity: bg }} />
            {cell(i, 0, <><span style={{ color: C.muted, fontSize: 36, marginRight: 14 }}>{r.letter}</span>{r.take}</>, C.ink, s0 + 2)}
            {cell(i, 1, r.left, C.ink, at(scene, starts[i], 0.3))}
            {cell(i, 2, r.fifth, color, at(scene, starts[i], 0.6))}
            {cell(i, 3, r.ok ? '= 20 ✓' : `${r.fifth} ≠ 20 ✗`, color, at(scene, starts[i], 0.7), 48)}
          </div>
        );
      })}
      <Card x={1180} y={160} w={700} start={at(scene, 1, 0.3)}>
        A: <Tex tex={'90 - 80 = 10'} size={56} />
        <div style={{ fontSize: 36, color: C.muted, fontWeight: 700 }}>a gap of percents, not fish</div>
      </Card>
      <Card x={1180} y={350} w={700} start={at(scene, 4, 0.35)}>
        <span style={{ fontSize: 48 }}>B: 20 = the other fish</span>
        <div style={{ fontSize: 36, color: C.muted, fontWeight: 700 }}>not the number to take out</div>
      </Card>
      <Tag x={1180} y={600} w={700} start={at(scene, 9, 0.25)} color={C.violet} size={48}>Find the group that doesn't change</Tag>
    </>
  );
};

const Variant: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const s = (i: number) => ({ opacity: ease(f, at(scene, i), 10) });
  return (
    <>
      <Pill x={120} y={130} color={C.violet} style={{ ...fadeUp(f, 4), fontSize: 40 }}>A bigger pond</Pill>
      <div style={{ position: 'absolute', left: 120, top: 230, width: 1100, minHeight: 300, background: C.card, borderRadius: 32, padding: '30px 44px', fontSize: 48, fontWeight: 600, lineHeight: 1.45, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', opacity: ease(f, at(scene, 0) - 4, 10) }}>
        <span style={s(0)}>A bigger pond has 400 fish, and 95% of them are goldfish. </span>
        <span style={s(1)}>How many goldfish must be <Mark on={at(scene, 1, 0.4)}>taken out</Mark> so that 75% of the fish left are goldfish?</span>
      </div>
      <BigBar x={120} y={620} w={1100} op={ease(f, at(scene, 0, 0.5), 14)} />
      <Text x={120} y={700} w={1100} size={48} weight={800} color={C.muted} style={fadeUp(f, at(scene, 0, 0.6))}>400 fish, 95% goldfish</Text>
    </>
  );
};

const VariantAnswer: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const BX = 90;
  const BW4 = 900;
  const EW = BW4 / 5; // the 80-fish bar is one fifth as wide as the 400-fish bar
  const A = 1080;
  const done = at(scene, 4, 0.9);
  const qp = (i: number) => ease(f, at(scene, 3, 0.1 + i * 0.1), 8);
  return (
    <>
      <Text x={BX} y={120} w={800} size={48} weight={800} color={C.muted} style={fadeUp(f, 4)}>400 fish</Text>
      <BigBar x={BX} y={185} w={BW4} op={ease(f, 4, 10)} />
      <div style={{ position: 'absolute', left: BX + BW4 - 300, top: 255, width: 300, textAlign: 'right', fontSize: 48, fontWeight: 900, color: GRD, whiteSpace: 'nowrap', ...fadeUp(f, at(scene, 1, 0.1)) }}>20 others</div>
      <Text x={BX} y={340} w={800} size={48} weight={800} color={C.muted} style={{ ...fadeUp(f, at(scene, 3, 0.05)), whiteSpace: 'nowrap' }}>at the end: 80 fish</Text>
      <Bar
        x={BX}
        y={405}
        w={EW}
        h={80}
        parts={[
          { color: GOLD, op: qp(0) },
          { color: GOLD, op: qp(1) },
          { color: GOLD, op: qp(2) },
          { color: GREY, op: qp(3) },
        ]}
      />
      <div style={{ position: 'absolute', left: BX + EW - 80, top: 490, width: 100, textAlign: 'center', fontSize: 48, fontWeight: 900, color: GRD, opacity: ease(f, at(scene, 3, 0.45), 8) }}>20</div>
      <Text x={BX} y={570} w={BW4} size={48} weight={900} color={GD} style={{ ...fadeUp(f, at(scene, 6, 0.5)), whiteSpace: 'nowrap' }}>goldfish: 380 → 60 left</Text>
      <Tag x={BX} y={660} w={BW4} start={at(scene, 8, 0.2)} color={C.violet} size={48}>95% → 75% emptied most of the pond!</Tag>
      <Eq x={A} y={125} size={48} start={at(scene, 0, 0.3)} tex={'100\\% - 95\\% = 5\\%'} />
      <Eq x={A} y={190} size={48} start={at(scene, 0, 0.65)} tex={`5\\%\\text{ of }400 = ${cO('20')}`} />
      <Eq x={A} y={255} size={48} start={at(scene, 2, 0.35)} tex={'100\\% - 75\\% = 25\\% = \\dfrac{1}{4}'} />
      <Eq x={A} y={385} size={48} start={at(scene, 3, 0.6)} tex={'4\\times 20 = 80\\text{ left}'} />
      <Eq x={A} y={450} size={48} start={at(scene, 4, 0.3)} tex={`400 - 80 = ${col(C.green, '320')}`} />
      <Eq x={A} y={515} size={48} start={at(scene, 5, 0.4)} tex={'400 - 20 = 380\\text{ goldfish}'} />
      <Eq x={A} y={580} size={48} start={at(scene, 6, 0.3)} tex={'380 - 320 = 60'} />
      <Check x={A} y={655} start={at(scene, 7, 0.4)}>
        <Tex tex={'\\dfrac{60}{80} = 75\\%'} size={56} />
      </Check>
      <Answer x={800} y={480} value="320" start={done} chime={CHIME} />
      <Confetti x={800} y={480} start={done} seed={11} />
    </>
  );
};

const Recap: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const out = fadeTo(f, at(scene, 3), 0, 12);
  return (
    <>
      <Fade op={out}>
        <Pond glow={ease(f, at(scene, 1, 0.4), 12)} op={ease(f, 4, 10)} />
        <Text x={PANEL} y={150} w={900} size={56} weight={900} color={C.primary} style={fadeUp(f, at(scene, 0, 0.3))}>The big idea</Text>
        <div style={{ position: 'absolute', left: PANEL, top: 260, display: 'flex', alignItems: 'center', gap: 26, ...fadeUp(f, at(scene, 1, 0.4)) }}>
          <div style={{ background: GREY, borderRadius: 28, padding: '14px 36px', fontSize: 50, fontWeight: 900, color: '#fff' }}>stays the same</div>
        </div>
        <div style={{ position: 'absolute', left: PANEL, top: 400, display: 'flex', alignItems: 'center', gap: 26, ...fadeUp(f, at(scene, 2, 0.15)) }}>
          <svg width={120} height={60} viewBox="0 0 120 60">
            <path d="M5 30 H95 M70 8 L100 30 L70 52" stroke={C.violet} strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div style={{ background: C.violet, borderRadius: 28, padding: '14px 36px', fontSize: 50, fontWeight: 900, color: '#fff' }}>new total</div>
        </div>
        <Eq y={540} size={54} start={at(scene, 2, 0.6)} tex={'\\text{new total} \\;\\to\\; \\text{subtract}'} />
      </Fade>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', ...fadeUp(f, at(scene, 3, 0.1)) }}>
        <div style={{ fontFamily: PACIFICO, fontSize: 130, color: C.violet }}>Vantee</div>
        <div style={{ fontSize: 54, fontWeight: 900, marginTop: 10 }}>Keep exploring!</div>
      </div>
      <Confetti x={960} y={380} start={at(scene, 3, 0.2)} seed={3} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = {
  intro: Intro,
  question: Question,
  asked: Asked,
  try1: Pause1,
  stay: Stay,
  fifth: Fifth,
  ratio: Ratio,
  traps: Traps,
  variant: Variant,
  try2: Pause2,
  'variant-answer': VariantAnswer,
  recap: Recap,
};

export const Video: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <Explainer timeline={timeline} scenes={SCENES} badge="AMC 8-style · Level 4" /> : null;
