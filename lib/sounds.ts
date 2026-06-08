let _ctx: AudioContext | null = null;

function ctx(): AudioContext {
  if (!_ctx) _ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  if (_ctx.state === "suspended") _ctx.resume();
  return _ctx;
}

function osc(
  freq: number,
  type: OscillatorType,
  gainPeak: number,
  duration: number,
  startDelay = 0,
) {
  const c = ctx();
  const o = c.createOscillator();
  const g = c.createGain();
  o.connect(g);
  g.connect(c.destination);
  o.type = type;
  o.frequency.setValueAtTime(freq, c.currentTime + startDelay);
  g.gain.setValueAtTime(0, c.currentTime + startDelay);
  g.gain.linearRampToValueAtTime(gainPeak, c.currentTime + startDelay + 0.005);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + startDelay + duration);
  o.start(c.currentTime + startDelay);
  o.stop(c.currentTime + startDelay + duration);
}

// Short subtle click — filter chips, tab toggles, small actions
export function playTick() {
  osc(700, "sine", 0.08, 0.05);
}

// Soft pop — like / unlike
export function playPop() {
  const c = ctx();
  const o = c.createOscillator();
  const g = c.createGain();
  o.connect(g);
  g.connect(c.destination);
  o.type = "sine";
  o.frequency.setValueAtTime(400, c.currentTime);
  o.frequency.exponentialRampToValueAtTime(180, c.currentTime + 0.08);
  g.gain.setValueAtTime(0.12, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.12);
  o.start(c.currentTime);
  o.stop(c.currentTime + 0.12);
}

// Two-note ascending chime — ticket purchase, major success
export function playSuccess() {
  osc(520, "sine", 0.15, 0.18, 0);
  osc(780, "sine", 0.12, 0.22, 0.15);
}

// Soft bell — notification bell tap
export function playBell() {
  osc(880, "sine", 0.13, 0.3, 0);
  osc(1320, "sine", 0.06, 0.25, 0.01);
}

// Follow / unfollow toggle
export function playFollow() {
  osc(600, "sine", 0.1, 0.1, 0);
  osc(900, "sine", 0.07, 0.1, 0.08);
}
