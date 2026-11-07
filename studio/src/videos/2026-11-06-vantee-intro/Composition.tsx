// Vantee intro: a silent, looping book-fair booth video (music + captions). Design spec:
// videos/2026-11-06-vantee-intro/design-spec.md. Every product screen is a real 2x capture from the test env
// (public/<slug>/tex), except the planner follow-through cards, rendered from the app's own markup + CSS (img/card-*.png).
import React from 'react';
import { AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, getInputProps, staticFile, useCurrentFrame } from 'remotion';
import { loadFont as loadBaloo } from '@remotion/google-fonts/Baloo2';
import { NUNITO } from '../../lib/fonts';
import type { Timeline } from '../../lib/Explainer';
import { EASE, mix, ramp, softShadow, innerHighlight } from './polish';

export const SLUG = '2026-11-06-vantee-intro';
const { fontFamily: BALOO } = loadBaloo('normal', { weights: ['700', '800'], subsets: ['latin'] });
const f = (p: string) => staticFile(`${SLUG}/${p}`);
const props = getInputProps() as { bgm?: boolean; video?: boolean };
const SHOW_VIDEO = props.video !== false; // beat 4c (quiz video explainers flag) can be cut with --props='{"video":false}'

// Soft Garden tokens, taken from the vnt landing page (Baloo 2 / Nunito, primary 500 / 800, ink, sub, lilac)
const T = { g500: '#0cc281', g800: '#05472f', ink: '#191936', sub: '#515469', lilac: '#7b61ff', lilacSoft: 'rgba(123,97,255,0.10)' };

// ------------------------------------------------------------------ timeline (30 fps)
type Beat = { id: string; from: number; len: number };
const BEATS: Beat[] = [];
const beat = (id: string, len: number) => {
  const from = BEATS.length ? BEATS[BEATS.length - 1].from + BEATS[BEATS.length - 1].len : 0;
  BEATS.push({ id, from, len });
};
beat('hook', 180);
beat('coach', 270);
beat('family', 150);
beat('skill', 330);
beat('time', 210);
beat('explain', 210);
if (SHOW_VIDEO) beat('video', 210);
beat('fixit', 180);
beat('writing', 210);
beat('path', 330);
beat('follow', 480);
beat('join', 240);
beat('chapters', 300);
beat('parent', 390);
beat('rewards', 210);
beat('tutors', 210);
beat('cta', 300);
export const TOTAL = BEATS[BEATS.length - 1].from + BEATS[BEATS.length - 1].len;
const XF = 12; // cross-dissolve overlap between beats
const BGM: string | null = 'audio/bgm.mp3'; // Mixkit "Feeling Happy" (Ahjay Stelino), Mixkit Free License; looped once to 139 s

// ------------------------------------------------------------------ shared pieces
const Backdrop: React.FC = () => {
  const fr = useCurrentFrame();
  const drift = Math.sin(fr / 240) * 12;
  return (
    <AbsoluteFill style={{ background: '#fbfaff' }}>
      <Img src={f('img/page_bg.webp')} style={{ position: 'absolute', inset: -30, width: 1980, height: 1140, objectFit: 'cover', transform: `translateX(${drift}px)` }} />
      <Img src={f('img/hero_bg.webp')} style={{ position: 'absolute', inset: -30, width: 1980, height: 1140, objectFit: 'cover', opacity: 0.9, transform: `translateX(${-drift}px)` }} />
    </AbsoluteFill>
  );
};

/** blur-slide (shotcraft card): words rise out of focus, y / blur / opacity on one shared progress. */
type Seg = string | { t: string; accent?: boolean };
const Words: React.FC<{ segs: Seg[]; start: number; size: number; color?: string; gap?: number; dur?: number; dy?: number; blur?: number; weight?: number; font?: string; align?: 'left' | 'center'; lineHeight?: number; maxWidth?: number }> = ({
  segs, start, size, color = T.g800, gap = 4, dur = 22, dy, blur, weight = 800, font = BALOO, align = 'left', lineHeight = 1.12, maxWidth,
}) => {
  const fr = useCurrentFrame();
  const words: { w: string; accent: boolean; br: boolean }[] = [];
  for (const s of segs) {
    const seg = typeof s === 'string' ? { t: s } : s;
    if (seg.t === '\n') { words.push({ w: '', accent: false, br: true }); continue; }
    for (const w of seg.t.split(' ').filter(Boolean)) words.push({ w, accent: !!seg.accent, br: false });
  }
  const DY = dy ?? size * 0.38;
  const B = blur ?? Math.min(18, size * 0.2);
  let i = 0;
  return (
    <div style={{ fontFamily: font, fontWeight: weight, fontSize: size, lineHeight, color, letterSpacing: font === BALOO ? '-0.01em' : 0, textAlign: align, maxWidth, display: 'flex', flexWrap: 'wrap', columnGap: '0.26em', justifyContent: align === 'center' ? 'center' : 'flex-start' }}>
      {words.map((w, k) => {
        if (w.br) return <div key={k} style={{ flexBasis: '100%', height: 0 }} />;
        const p = ramp(fr, start + i++ * gap, dur, EASE.out);
        return (
          <span key={k} style={{ display: 'inline-block', opacity: p, transform: `translateY(${((1 - p) * DY).toFixed(2)}px)`, filter: p > 0.999 ? undefined : `blur(${((1 - p) * B).toFixed(2)}px)`, color: w.accent ? T.g500 : undefined }}>
            {w.w}
          </span>
        );
      })}
    </div>
  );
};

const Kicker: React.FC<{ text: string; start: number; color?: string; bg?: string }> = ({ text, start, color = T.lilac, bg = T.lilacSoft }) => {
  const fr = useCurrentFrame();
  const p = ramp(fr, start, 18, EASE.out);
  return (
    <div style={{ display: 'inline-block', opacity: p, transform: `translateY(${(1 - p) * 14}px)`, fontFamily: NUNITO, fontWeight: 800, fontSize: 28, color, background: bg, padding: '10px 24px', borderRadius: 999, marginBottom: 26 }}>
      {text}
    </div>
  );
};

/** Caption block: kicker, Baloo headline, Nunito sub. */
const Caption: React.FC<{ kicker?: string; head: Seg[]; sub?: string; start?: number; size?: number; align?: 'left' | 'center'; width?: number; subStart?: number }> = ({
  kicker, head, sub, start = 6, size = 84, align = 'left', width = 760, subStart,
}) => (
  <div style={{ width, display: 'flex', flexDirection: 'column', alignItems: align === 'center' ? 'center' : 'flex-start' }}>
    {kicker && <Kicker text={kicker} start={start} />}
    <Words segs={head} start={start + 4} size={size} align={align} maxWidth={width} />
    {sub && (
      <div style={{ marginTop: 26 }}>
        <Words segs={[sub]} start={subStart ?? start + 22} size={34} weight={700} font={NUNITO} color={T.sub} gap={2.2} dur={20} lineHeight={1.36} align={align} maxWidth={width} />
      </div>
    )}
  </div>
);

/** A crop of a real page capture, in a white card. crop = [x, y, w, h] in texture px; `to` pans to a second crop. */
type Crop = [number, number, number, number];
type Hl = { rect: Crop; at: number; pill?: boolean };
const Screen: React.FC<{
  tex: string; texW?: number; crop: Crop; to?: Crop; panFrom?: number; panLen?: number; width: number; start?: number;
  tilt?: number; radius?: number; hl?: Hl[]; style?: React.CSSProperties; out?: number; fadeRight?: boolean;
}> = ({ fadeRight, tex, texW = 3840, crop, to, panFrom = 40, panLen = 60, width, start = 0, tilt = -7, radius = 30, hl = [], style, out }) => {
  const fr = useCurrentFrame();
  const inP = ramp(fr, start, 26, EASE.out);
  const outP = out === undefined ? 0 : ramp(fr, out, 14, EASE.exit);
  const pan = to ? ramp(fr, panFrom, panLen, EASE.smooth) : 0;
  const c0 = to ? (crop.map((v, i) => mix(v, to[i], pan)) as Crop) : crop;
  // no zoom: the scale stays fixed for the whole shot (a changing scale shimmers); pans only translate, snapped to whole pixels
  const c = c0;
  const s = width / crop[2];
  const h = Math.round(crop[3] * s);
  const dy = Math.round((1 - inP) * 50 - outP * 30);
  return (
    <div style={{ width, height: h, opacity: inP * (1 - outP), filter: inP > 0.99 && outP < 0.01 ? undefined : `blur(${((1 - inP) * 10 + outP * 8).toFixed(2)}px)`, ...style }}>
      <div style={{ width, height: h, transform: dy ? `translateY(${dy}px)` : undefined, borderRadius: radius, overflow: 'hidden', background: '#fff', boxShadow: `${innerHighlight(0.9)}, ${softShadow(36, { color: '#05472f', strength: 0.9 })}, 0 0 0 1px rgba(5,71,47,0.06)`, position: 'relative' }}>
        <Img src={f(`tex/${tex}`)} style={{ position: 'absolute', left: -Math.round(c[0] * s), top: -Math.round(c[1] * s), width: Math.round(texW * s), maxWidth: 'none' }} />
        {fadeRight && <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: 140, background: 'linear-gradient(90deg, rgba(255,255,255,0), #fff 85%)' }} />}
        {hl.map((r, k) => {
          const p = ramp(fr, r.at, 16, EASE.overshoot);
          if (p <= 0) return null;
          const [x, y, w, hh] = r.rect;
          return (
            <div key={k} style={{ position: 'absolute', left: (x - c[0]) * s - 6, top: (y - c[1]) * s - 6, width: w * s + 12, height: hh * s + 12, borderRadius: r.pill ? 999 : 16, border: `4px solid ${T.g500}`, boxShadow: `0 0 0 ${10 * p}px rgba(12,194,129,0.16)`, opacity: Math.min(1, p), transform: `scale(${mix(1.08, 1, p)})` }} />
          );
        })}
      </div>
    </div>
  );
};

/** Split layout: caption on the left, screen(s) on the right. */
const Split: React.FC<{ caption: React.ReactNode; children: React.ReactNode; capTop?: number }> = ({ caption, children, capTop = 0 }) => (
  <AbsoluteFill>
    <div style={{ position: 'absolute', left: 130, top: 0, bottom: 0, width: 780, display: 'flex', alignItems: 'center', transform: `translateY(${capTop}px)` }}>{caption}</div>
    <div style={{ position: 'absolute', left: 900, right: 90, top: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{children}</div>
  </AbsoluteFill>
);

/** Several screens stacked in one slot, each shown from its `at` frame (cross-dissolving). */
const Swap: React.FC<{ items: { at: number; until?: number; node: React.ReactNode }[] }> = ({ items }) => (
  <div style={{ position: 'relative', display: 'grid' }}>
    {items.map((it, k) => (
      <Sequence key={k} from={it.at} durationInFrames={it.until ? it.until - it.at : undefined} layout="none">
        <div style={{ gridArea: '1 / 1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{it.node}</div>
      </Sequence>
    ))}
  </div>
);

const Mascot: React.FC<{ start: number; size: number; style?: React.CSSProperties; shift?: number }> = ({ start, size, style, shift = 0 }) => {
  const fr = useCurrentFrame() + shift;
  const p = ramp(fr, start, 30, EASE.overshoot);
  const bob = Math.sin((fr - start) / 18) * 8;
  return <Img src={f('img/Vantee_avatar_point2x.png')} style={{ width: size, opacity: Math.min(1, p * 1.5), transform: `translateY(${(1 - p) * 60 + bob}px) scale(${mix(0.8, 1, p)})`, filter: `drop-shadow(0 30px 40px rgba(123,97,255,.25))`, ...style }} />;
};

// ------------------------------------------------------------------ beats
const Hook: React.FC<{ shift?: number }> = ({ shift = 0 }) => (
  <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
    <Mascot start={-200} size={300} style={{ marginBottom: 20 }} shift={shift} />
    <Words segs={['Every family has goals.', '\n', { t: 'Following through', accent: true }, 'is the hard part.']} start={-200} size={104} align="center" gap={4} />
  </AbsoluteFill>
);
const LOOP = 24; // the end card dissolves into the composed hook over the last LOOP frames, so frame 0 follows seamlessly

/** pill-slot-cycle (shotcraft card, demos/typography/pill-slot-cycle): fixed stem, pills roll through the slot, the conclusion lands. */
const PILLS = [
  { label: 'math contest', icon: 'math_icon.svg' },
  { label: 'writing goal', icon: 'writing_icon.svg' },
  { label: 'school test', icon: 'math_icon.svg' },
  { label: 'screen-time goal', icon: 'parent_control_icon.svg' },
];
const STEM = 'The right AI coach for every';
const P_BEAT = 24, P_INTRO = 14, P_SWAP = 8, P_FIN = 14;
const Pill: React.FC<{ label: string; icon: string; lift?: number; hidden?: boolean }> = ({ label, icon, lift = 0, hidden }) => (
  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 16, padding: '10px 34px 10px 14px', borderRadius: 999, background: '#fff', border: '1px solid rgba(5,71,47,0.10)', boxShadow: `${innerHighlight(0.95)}, ${softShadow(6 + lift * 30, { color: '#05472f' })}`, fontFamily: BALOO, fontWeight: 800, fontSize: 72, color: T.g800, whiteSpace: 'nowrap', visibility: hidden ? 'hidden' : undefined, lineHeight: 1.2 }}>
    <span style={{ width: 70, height: 70, borderRadius: 22, background: 'rgba(12,194,129,0.12)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <Img src={f(`img/${icon}`)} style={{ width: 40, height: 40 }} />
    </span>
    {label}
  </div>
);
const Coach: React.FC = () => {
  const fr = useCurrentFrame();
  const stemT = ramp(fr, 0, P_INTRO, EASE.out);
  const cycEnd = P_INTRO + PILLS.length * P_BEAT;
  const rel = fr - P_INTRO;
  const idx = Math.max(0, Math.min(Math.floor(rel / P_BEAT), PILLS.length - 1));
  const bf = rel - idx * P_BEAT;
  const fin = fr >= cycEnd;
  const finT = ramp(fr, cycEnd + 5, P_FIN, EASE.overshoot); // lands after the last pill has mostly left (no overlap)
  const centerT = ramp(fr, cycEnd + P_FIN - 2, 26, EASE.smooth);
  const stemStyle: React.CSSProperties = { fontFamily: BALOO, fontWeight: 800, fontSize: 84, color: T.g800, whiteSpace: 'nowrap', letterSpacing: '-0.01em' };
  let slot: React.ReactNode = null;
  if (!fin && rel >= 0) {
    const inc = PILLS[idx], outg = idx > 0 ? PILLS[idx - 1] : null;
    // clean swap, no ghosting: the outgoing pill leaves first (0..5f), then the incoming one rises in (5..13f);
    // both are clipped to the slot and drawn flat (no blur / 3D), so two half-transparent pills never overlap
    const inT = ramp(bf, 5, P_SWAP, EASE.snappy), outT = ramp(bf, 0, 5, EASE.exit); // strictly one after the other
    slot = (
      <div style={{ position: 'relative', display: 'inline-block', overflow: 'hidden', padding: '12px 30px 26px', margin: '-12px -30px -26px' }}>
        <Pill {...inc} hidden />
        {outg && outT < 1 && (
          <div style={{ position: 'absolute', left: 30, top: 12, transform: `translateY(${Math.round(mix(0, -110, outT))}px)`, opacity: 1 - outT }}>
            <Pill {...outg} lift={outT} />
          </div>
        )}
        <div style={{ position: 'absolute', left: 30, top: 12, transform: `translateY(${Math.round(mix(110, 0, inT))}px)`, opacity: inT }}>
          <Pill {...inc} lift={1 - inT} />
        </div>
      </div>
    );
  } else if (fin) {
    const lastOut = ramp(fr, cycEnd, 5, EASE.exit);
    slot = (
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <span style={{ ...stemStyle, color: T.g500, display: 'inline-block', opacity: Math.min(1, finT * 1.4), transform: `translateY(${Math.round((1 - finT) * 90)}px)` }}>family goal.</span>
        {lastOut < 1 && (
          <div style={{ position: 'absolute', left: 0, top: -6, transform: `translateY(${Math.round(-130 * lastOut)}px)`, opacity: 1 - lastOut }}>
            <Pill {...PILLS[PILLS.length - 1]} lift={lastOut} />
          </div>
        )}
      </div>
    );
  }
  // stem left-anchored while the pills roll (card rule), centered only once the sentence is complete
  const STEM_LEFT = 150, FINAL_W = 1640;
  const shiftX = centerT * ((1920 - FINAL_W) / 2 - STEM_LEFT);
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: STEM_LEFT, top: 480, transform: `translate(${shiftX}px, calc(-50% + ${(1 - stemT) * 50}px))`, display: 'flex', alignItems: 'center', gap: 30, opacity: stemT }}>
        <span style={stemStyle}>{STEM}</span>
        {slot}
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 640, display: 'flex', justifyContent: 'center' }}>
        <Words segs={['Build a path. Follow through. Together.']} start={cycEnd + 18} size={44} weight={700} font={NUNITO} color={T.sub} gap={1.6} dur={20} align="center" maxWidth={1200} lineHeight={1.4} />
      </div>
    </AbsoluteFill>
  );
};

const Family: React.FC = () => (
  <Split caption={<Caption head={['One coach for the', { t: 'whole family.', accent: true }]} sub="Set a goal for any kid, or for yourself." />}>
    <Screen tex="sarah-who-for.jpg" crop={[1120, 660, 1580, 900]} width={920} hl={[{ rect: [1180, 930, 640, 120], at: 50, pill: true }]} />
  </Split>
);

const Skill: React.FC = () => (
  <Split caption={<Caption kicker="Free · no sign-up" head={['Start with a free', { t: 'skill check.', accent: true }]} sub="10 real AMC 8-style questions in 15 minutes, then a clear report." />}>
    <Swap
      items={[
        { at: 0, until: 150, node: <Screen tex="skill-q1.png" texW={1920} crop={[20, 100, 1320, 420]} width={960} out={136} /> },
        { at: 140, node: <Screen tex="skill-report.jpg" crop={[1080, 380, 1660, 1220]} width={860} hl={[{ rect: [1130, 600, 1560, 190], at: 60 }]} /> },
      ]}
    />
  </Split>
);

const Time: React.FC = () => (
  <Split caption={<Caption kicker="Beyond a practice book" head={['We see how long', { t: 'every question takes.', accent: true }]} sub="Rushed answers show up as slips, not gaps, so practice goes where it should." />}>
    <Swap
      items={[
        { at: 0, until: 90, node: <Screen tex="skill-report.jpg" crop={[1080, 2440, 1660, 870]} width={940} out={76} /> },
        { at: 80, node: <Screen tex="skill-report.jpg" crop={[1100, 2960, 1620, 330]} width={940} hl={[{ rect: [1150, 3140, 1520, 90], at: 40 }]} /> },
      ]}
    />
  </Split>
);

const Explain: React.FC = () => (
  <Split caption={<Caption kicker="Beyond a practice book" head={['Every miss,', { t: 'explained step by step.', accent: true }]} sub="The idea, the steps, and the answer, for each question." />}>
    <Screen tex="leo-explain.jpg" crop={[60, 1150, 1900, 760]} to={[60, 1500, 1900, 760]} panFrom={60} panLen={70} width={960} fadeRight />
  </Split>
);

const VideoBeat: React.FC = () => {
  const fr = useCurrentFrame();
  const p = ramp(fr, 0, 26, EASE.out);
  return (
    <Split caption={<Caption kicker="Beyond a practice book" head={['…and', { t: 'on video.', accent: true }]} sub="Vantee's video explainers show each idea move, right in the review." />}>
      <div style={{ width: 960, height: 540, borderRadius: 30, overflow: 'hidden', boxShadow: softShadow(36, { color: '#05472f' }), opacity: p, transform: `translateY(${Math.round((1 - p) * 50)}px)`, background: '#fff' }}>
        <OffthreadVideo src={f('clip/explainer.mp4')} muted style={{ width: 960, height: 540 }} />
      </div>
    </Split>
  );
};

const FixIt: React.FC = () => (
  <Split caption={<Caption kicker="Beyond a practice book" head={['Missed it?', { t: 'It comes back tomorrow.', accent: true }]} sub="Missed questions come back the next day." />}>
    <Screen tex="sarah-leo-goal-full.jpg" crop={[1010, 2560, 960, 720]} width={860} hl={[{ rect: [1040, 2972, 900, 116], at: 40 }]} />
  </Split>
);

const Writing: React.FC = () => (
  <Split caption={<Caption kicker="Writing Coach" head={['Feedback on', { t: 'their own words.', accent: true }]} sub="What's working, and one next step to try, trait by trait." />}>
    <Screen tex="writing-report.jpg" crop={[1240, 700, 1320, 760]} to={[1240, 1260, 1320, 760]} panFrom={70} panLen={70} width={900} />
  </Split>
);

const Path: React.FC = () => (
  <Split
    caption={
      <Swap
        items={[
          { at: 0, until: 190, node: <Caption head={['A plan built from', { t: 'where they are.', accent: true }]} sub="The first check finds what they know, then Vantee picks what to practice." /> },
          { at: 190, node: <Caption head={['…and it', { t: 'grows with them.', accent: true }]} sub="Doing great? Vantee offers to aim higher." start={0} /> },
        ]}
      />
    }
  >
    <Swap
      items={[
        { at: 0, until: 110, node: <Screen tex="leo-practice-test-done.jpg" crop={[1140, 728, 1532, 700]} width={940} out={96} /> },
        { at: 100, until: 200, node: <Screen tex="sarah-leo-goal-full.jpg" crop={[1008, 1120, 952, 1060]} width={640} hl={[{ rect: [1030, 1320, 900, 290], at: 40 }]} out={186} /> },
        { at: 190, node: <Screen tex="leo-aim-higher.jpg" crop={[1088, 660, 1792, 292]} width={960} hl={[{ rect: [2560, 700, 300, 90], at: 50, pill: true }]} /> },
      ]}
    />
  </Split>
);

/** doc-park-left-pill-deal idea: the planner parks on the left, Vantee's cards are dealt on the right one by one. */
const Card: React.FC<{ src: string; at: number; out?: number; w?: number }> = ({ src, at, out, w = 860 }) => {
  const fr = useCurrentFrame();
  const p = ramp(fr, at, 20, EASE.overshoot);
  const o = out === undefined ? 0 : ramp(fr, out, 12, EASE.exit);
  if (p <= 0 || o >= 1) return null;
  return <Img src={f(`img/${src}`)} style={{ width: w, opacity: Math.min(1, p * 1.4) * (1 - o), transform: `translateX(${(1 - p) * 220}px) scale(${mix(0.96, 1, p)})`, filter: `drop-shadow(0 18px 30px rgba(5,71,47,0.16))` }} />;
};
const Follow: React.FC = () => {
  const fr = useCurrentFrame();
  const park = ramp(fr, 40, 30, EASE.smooth);
  const lines = [
    { at: 70, t: 'A nudge when the week is close.' },
    { at: 170, t: 'It asks what got in the way, and adjusts.' },
    { at: 320, t: 'Stuck? One tap brings help.' },
  ];
  const cur = [...lines].reverse().find((l) => fr >= l.at);
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 70, display: 'flex', justifyContent: 'center' }}>
        <Words segs={['Vantee helps them', { t: 'follow through,', accent: true }, 'every day.']} start={4} size={76} align="center" />
      </div>
      <div style={{ position: 'absolute', left: Math.round(mix(530, 70, park)), top: 250 }}>
        <Screen tex="leo-myday.jpg" crop={[1100, 140, 1780, 1500]} width={Math.round(mix(860, 740, park))} />
      </div>
      <div style={{ position: 'absolute', left: 900, width: 900, top: 300, display: 'flex', flexDirection: 'column', gap: 26 }}>
        <Card src="card-catchup.png" at={70} />
        <div style={{ display: 'grid' }}>
          <div style={{ gridArea: '1/1' }}><Card src="card-recovery.png" at={170} out={262} /></div>
          <div style={{ gridArea: '1/1' }}><Card src="card-thanks.png" at={268} /></div>
        </div>
        <div style={{ display: 'grid' }}>
          <div style={{ gridArea: '1/1' }}><Card src="card-help.png" at={320} out={410} /></div>
          <div style={{ gridArea: '1/1' }}><Card src="card-helpline.png" at={416} /></div>
        </div>
      </div>
      {cur && (
        <Sequence from={cur.at} layout="none" key={cur.at}>
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 58, display: 'flex', justifyContent: 'center' }}>
            <Words segs={[cur.t]} start={0} size={38} weight={800} font={NUNITO} color={T.sub} gap={2} dur={18} align="center" />
          </div>
        </Sequence>
      )}
    </AbsoluteFill>
  );
};

const Join: React.FC = () => (
  <Split caption={<Caption kicker="Grow together" head={['Write a story', { t: 'together.', accent: true }]} sub="Share one challenge code. Friends join, even from another family, with their parent's OK." />}>
    <Swap
      items={[
        { at: 0, until: 90, node: <Screen tex="mia-share.jpg" crop={[1268, 300, 1276, 520]} width={880} out={78} /> },
        { at: 80, until: 165, node: <Screen tex="ava-join-preview.jpg" crop={[1380, 200, 1044, 1240]} width={500} out={152} /> },
        { at: 155, node: <Screen tex="priya-request.jpg" crop={[1092, 700, 1788, 350]} width={960} hl={[{ rect: [1130, 900, 410, 110], at: 40, pill: true }]} /> },
      ]}
    />
  </Split>
);

/** card-stack (shotcraft card, demos/ui-entrance/card-stack): chapters spring in one by one, the stack fans out,
 *  then the book cover rises out of it. Three cards, so the fan angle is wider than the demo's 6.5°. */
const spring = (fr: number, start: number, damping: number, stiffness: number) => {
  // critically-tuned damped spring 0→1, deterministic closed form
  const t = Math.max(0, (fr - start) / 30);
  const w0 = Math.sqrt(stiffness), z = damping / (2 * Math.sqrt(stiffness));
  if (t <= 0) return 0;
  if (z < 1) { const wd = w0 * Math.sqrt(1 - z * z); return 1 - Math.exp(-z * w0 * t) * (Math.cos(wd * t) + (z * w0 / wd) * Math.sin(wd * t)); }
  return 1 - Math.exp(-w0 * t) * (1 + w0 * t);
};
const CHAPTERS = [
  { img: 'ch1.jpg', who: 'Mia', n: 1, line: 'Fox tiptoed to the tall bookshelf and followed the tiny paw prints…' },
  { img: 'ch2.jpg', who: 'Friend', n: 2, line: 'In the middle sat a small gray mouse wearing tiny glasses…' },
  { img: 'ch3.jpg', who: 'Leo', n: 3, line: '"It isn\'t empty," she said. "It\'s written in invisible ink!"' },
];
const Chapters: React.FC = () => {
  const fr = useCurrentFrame();
  const fan = spring(fr, 92, 20, 95);
  const press = CHAPTERS.reduce((a, _c, i) => { const st = 6 + i * 22; const d = fr - (st + 6); return a + (d >= 0 && d <= 9 ? Math.sin((d / 9) * Math.PI) * 5 : 0); }, 0);
  const cover = ramp(fr, 190, 30, EASE.overshoot);
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 70, display: 'flex', justifyContent: 'center' }}>
        <Words segs={['Each kid adds a chapter.', { t: 'Vantee adds the pictures.', accent: true }]} start={4} size={68} align="center" />
      </div>
      <div style={{ position: 'absolute', left: 960, top: 600, perspective: 1800, transform: `translateY(${press}px) scale(${mix(1, 0.9, ramp(fr, 180, 30, EASE.smooth))})` }}>
        {CHAPTERS.map((c, i) => {
          const st = 6 + i * 22;
          const e = spring(fr, st, 13, 150);
          const k = i - 1;
          const y = mix(900, 0, e);
          const tilt = (i % 2 ? 9 : -9) * (1 - e);
          const rot = k * 9 * fan + (1 - fan) * (i - 1) * 2.5 + tilt;
          const tx = k * 560 * fan + (1 - fan) * (i - 1) * 10;
          return (
            <div key={i} style={{ position: 'absolute', left: -250, top: -260, width: 500, transformOrigin: '50% 130%', transform: `translate3d(${tx}px, ${y + cover * 40}px, ${i * 2}px) rotate(${rot}deg) scale(${1 - cover * 0.1})`, zIndex: i, opacity: 1 - cover * 0.55, filter: cover > 0.01 ? `blur(${cover * 3}px)` : undefined }}>
              <div style={{ background: '#fff', borderRadius: 26, padding: 18, boxShadow: softShadow(30, { color: '#05472f' }) }}>
                <Img src={f(`img/${c.img}`)} style={{ width: 464, height: 348, objectFit: 'cover', borderRadius: 16, display: 'block' }} />
                <div style={{ fontFamily: BALOO, fontWeight: 800, fontSize: 30, color: '#d6246e', marginTop: 12 }}>Chapter {c.n} · {c.who}</div>
                <div style={{ fontFamily: NUNITO, fontWeight: 700, fontSize: 22, color: T.sub, lineHeight: 1.35, height: 60, overflow: 'hidden' }}>{c.line}</div>
              </div>
            </div>
          );
        })}
      </div>
      {cover > 0 && (
        <div style={{ position: 'absolute', left: 960 - 330, top: 330, width: 660, opacity: Math.min(1, cover * 1.3), transform: `translateY(${(1 - cover) * 140}px) scale(${mix(0.9, 1, cover)})`, zIndex: 10 }}>
          <Screen tex="sarah-mia-work.jpg" crop={[1200, 820, 1420, 1060]} width={660} tilt={0} start={-30} />
        </div>
      )}
      <Sequence from={210} layout="none">
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 50, display: 'flex', justifyContent: 'center' }}>
          <Words segs={['Grow together.']} start={6} size={64} color={T.g500} align="center" />
        </div>
      </Sequence>
    </AbsoluteFill>
  );
};

const Parent: React.FC = () => (
  <Split caption={<Caption kicker="Parents see it all" head={['Their actual work,', { t: 'not just a checkmark.', accent: true }]} sub="Every chapter and quiz, with Vantee's note on what it shows." />}>
    <Swap
      items={[
        { at: 0, until: 230, node: <Screen tex="sarah-home-full.jpg" crop={[1090, 600, 1800, 1380]} to={[1090, 2620, 1800, 1380]} panFrom={60} panLen={130} width={840} out={216} /> },
        { at: 220, node: <Screen tex="sarah-mia-work.jpg" crop={[1140, 110, 1532, 1260]} width={760} hl={[{ rect: [1180, 430, 1450, 240], at: 40 }]} /> },
      ]}
    />
  </Split>
);

const Rewards: React.FC = () => (
  <Split caption={<Caption kicker="Rewards" head={['You set the rewards.', { t: 'They earn them.', accent: true }]} sub="Gems from real effort, spent on what your family picks." />}>
    <Swap
      items={[
        { at: 0, until: 110, node: <Screen tex="reward-chip-picked.jpg" crop={[1140, 572, 1532, 1020]} width={900} hl={[{ rect: [2172, 1262, 236, 72], at: 30, pill: true }]} out={96} /> },
        { at: 100, node: <Screen tex="leo-redeem-dialog.jpg" crop={[1372, 788, 1046, 590]} width={820} hl={[{ rect: [2205, 1245, 185, 92], at: 50 }]} /> },
      ]}
    />
  </Split>
);

const Tutors: React.FC = () => {
  const fr = useCurrentFrame();
  const p = ramp(fr, 70, 22, EASE.overshoot);
  return (
    <Split
      caption={
        <div>
          <Caption kicker="For tutors" head={['Give homework.', 'Track progress.', { t: 'Save time.', accent: true }]} sub="Share a homework link, see every submission, let AI help with feedback." />
          <div style={{ marginTop: 34, display: 'inline-flex', alignItems: 'center', gap: 14, padding: '14px 26px', borderRadius: 999, background: '#fff', boxShadow: softShadow(10, { color: '#7b61ff' }), border: '2px solid rgba(123,97,255,0.25)', opacity: Math.min(1, p * 1.4), transform: `scale(${mix(0.8, 1, p)})`, transformOrigin: '0 50%' }}>
            <span style={{ fontFamily: NUNITO, fontWeight: 900, fontSize: 22, color: '#fff', background: T.lilac, borderRadius: 999, padding: '4px 14px' }}>COMING SOON</span>
            <span style={{ fontFamily: NUNITO, fontWeight: 800, fontSize: 30, color: T.ink }}>Publish your own AI coach</span>
          </div>
        </div>
      }
    >
      <Screen tex="pub-tutors.jpg" crop={[700, 260, 2400, 960]} width={960} />
    </Split>
  );
};

const QrCard: React.FC<{ qr: string; icon: string; title: string; url: string; at: number }> = ({ qr, icon, title, url, at }) => {
  const fr = useCurrentFrame();
  const p = ramp(fr, at, 26, EASE.overshoot);
  return (
    <div style={{ width: 480, background: '#fff', borderRadius: 32, padding: '32px 32px 24px', textAlign: 'center', boxShadow: `${innerHighlight()}, ${softShadow(30, { color: '#05472f' })}`, opacity: Math.min(1, p * 1.4), transform: `translateY(${(1 - p) * 80}px)` }}>
      <Img src={f(`img/${qr}`)} style={{ width: 340, height: 340, display: 'block', margin: '0 auto' }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 16, fontFamily: NUNITO, fontWeight: 800, fontSize: 28, color: T.ink, whiteSpace: 'nowrap' }}>
        <Img src={f(`img/${icon}`)} style={{ width: 40 }} />
        {title}
      </div>
      <div style={{ fontFamily: NUNITO, fontWeight: 800, fontSize: 26, color: T.g500 }}>{url}</div>
    </div>
  );
};
const Cta: React.FC = () => {
  const fr = useCurrentFrame();
  const lp = ramp(fr, 0, 24, EASE.out);
  const out = ramp(fr, 300 - LOOP, LOOP / 2, EASE.smooth); // dissolves into the hook (see LOOP)
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', opacity: 1 - out }}>
      <Img src={f('img/Vantee_Logo_2x.png')} style={{ height: 110, marginBottom: 30, opacity: lp, transform: `translateY(${(1 - lp) * 30}px)` }} />
      <Words segs={['The right AI coach for every', { t: 'family goal', accent: true }]} start={8} size={66} align="center" />
      <div style={{ display: 'flex', gap: 80, marginTop: 50 }}>
        <QrCard qr="qr-math.svg" icon="math_icon.svg" title="Math Competition Coach" url="vantee.ai/math-coach" at={26} />
        <QrCard qr="qr-writing.svg" icon="writing_icon.svg" title="Writing Coach" url="vantee.ai/writing-coach" at={34} />
      </div>
      <div style={{ marginTop: 44 }}>
        <Words segs={['Private & secure · No ads · Parents in control']} start={56} size={30} weight={700} font={NUNITO} color={T.sub} gap={1.5} dur={18} align="center" />
      </div>
    </AbsoluteFill>
  );
};

const VIEWS: Record<string, React.FC> = {
  hook: Hook, coach: Coach, family: Family, skill: Skill, time: Time, explain: Explain, video: VideoBeat, fixit: FixIt,
  writing: Writing, path: Path, follow: Follow, join: Join, chapters: Chapters, parent: Parent, rewards: Rewards, tutors: Tutors, cta: Cta,
};

/** Each beat fades in over XF frames and out over XF frames (the next one overlaps it). */
const BeatFrame: React.FC<{ b: Beat; last: boolean; children: React.ReactNode }> = ({ b, last, children }) => {
  const fr = useCurrentFrame();
  const inP = b.from === 0 ? 1 : ramp(fr, 0, XF, EASE.smooth);
  const outP = last ? 0 : ramp(fr, b.len, XF, EASE.smooth);
  return <AbsoluteFill style={{ opacity: inP * (1 - outP) }}>{children}</AbsoluteFill>;
};

const at = (id: string, d: number) => (BEATS.find((b) => b.id === id)?.from ?? 0) + d;
const SFX: [number, 'tick' | 'chime'][] = [
  [at('coach', P_INTRO + PILLS.length * P_BEAT), 'chime'],
  ...[70, 170, 268, 320, 416].map((d) => [at('follow', d), 'tick'] as [number, 'tick']),
  ...[12, 34, 56].map((d) => [at('chapters', d), 'tick'] as [number, 'tick']),
  [at('chapters', 190), 'chime'],
  [at('rewards', 150), 'tick'],
  [at('cta', 26), 'tick'], [at('cta', 34), 'tick'],
];

const LoopIn: React.FC = () => {
  const fr = useCurrentFrame();
  return <AbsoluteFill style={{ opacity: ramp(fr, LOOP / 2, LOOP / 2, EASE.smooth) }}><Hook shift={-LOOP} /></AbsoluteFill>;
};

export const Video: React.FC<{ timeline: Timeline | null }> = () => (
  <AbsoluteFill style={{ fontFamily: NUNITO }}>
    <Backdrop />
    {BEATS.map((b, i) => {
      const V = VIEWS[b.id];
      const last = i === BEATS.length - 1;
      return (
        <Sequence key={b.id} from={b.from} durationInFrames={b.len + (last ? 0 : XF)} name={b.id}>
          <BeatFrame b={b} last={last}><V /></BeatFrame>
        </Sequence>
      );
    })}
    {SFX.map(([at, kind], i) => (
      <Sequence key={`sfx${i}`} from={at} durationInFrames={60} layout="none">
        <Audio src={f(`sfx/${kind === 'chime' ? 'fs-541985' : 'fs-668355'}.mp3`)} volume={kind === 'chime' ? 0.35 : 0.22} />
      </Sequence>
    ))}
    <Sequence from={TOTAL - LOOP} durationInFrames={LOOP} name="loop-in">
      <LoopIn />
    </Sequence>
    {props.bgm !== false && BGM && <Audio src={f(BGM)} volume={(fr) => Math.min(1, fr / 18) * Math.min(1, (TOTAL - fr) / 45) * 0.55} />}
  </AbsoluteFill>
);
