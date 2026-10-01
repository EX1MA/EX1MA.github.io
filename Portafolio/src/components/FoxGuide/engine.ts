/**
 * Motor del zorro guía: pixel art sobre un <canvas> fijo en la parte baja de la pantalla.
 * Todo se dibuja a resolución nativa (1 unidad = 1 píxel del sprite) y el CSS lo amplía
 * con `image-rendering: pixelated`, así partículas y efectos también quedan en pixel art.
 */

export interface SheetMeta {
  frameWidth: number;
  frameHeight: number;
  animations: Record<string, { row: number; frames: number; fps: number; loop: boolean }>;
}

/** Lo que hace el zorro al llegar a su lugar en cada sección */
export type Pose = 'sit' | 'think' | 'look_up' | 'sniff' | 'projects' | 'trail' | 'howl' | 'sleep';
export type Facing = 'left' | 'right' | 'pointer';

export interface Scene {
  /** posición horizontal como fracción del ancho de la ventana (centro del cuerpo) */
  x: number;
  pose: Pose;
  face: Facing;
  /** caza el cursor (solo donde no estorba: Hero y Contacto) */
  hunt?: boolean;
}

interface Particle {
  x: number; y: number; vx: number; vy: number; g: number;
  life: number; color: string; size: number; glyph?: keyof typeof GLYPH;
  w?: number;   // ancho, para las líneas de velocidad
}

const GLYPH = {
  note:  ['0011', '0011', '0010', '0010', '1110', '1110'],
  z:     ['111', '001', '010', '100', '111'],
  star:  ['010', '111', '010'],
  dot:   ['11', '11'],
  heart: ['01010', '11111', '11111', '01110', '00100'],
  ask:   ['01110', '10001', '00001', '00010', '00100', '00000', '00100'],
  bang:  ['1', '1', '1', '0', '1'],
};

// Datos de cada pose sentada dentro de la celda de 56x40: ojos, puntas de orejas [x0, x1, y0, y1],
// cuadros en que la cabeza sube 1 px al respirar, cuello/inicio del cuerpo para ladear la cabeza
// y dónde van los lentes (centro del ojo) y la boina (centro de su fila inferior)
interface PosePx { eyes: number[][]; ears: number[][]; inh: number[]; neck: number; from: number; glasses: number[]; hat: number[] }
const POSE_PX: Record<string, PosePx> = {
  sit:     { eyes: [[45, 18]], ears: [[36, 39, 8, 10], [47, 50, 8, 10]], inh: [1, 2], neck: 21, from: 31, glasses: [45, 18], hat: [43, 11] },
  look_up: { eyes: [[44, 11], [45, 11], [43, 12]], ears: [[36, 39, 7, 9], [46, 49, 6, 8]], inh: [1, 2], neck: 18, from: 31, glasses: [44, 11], hat: [42, 9] },
  think:   { eyes: [[44, 15], [45, 15], [43, 16]], ears: [[37, 40, 10, 12], [45, 48, 10, 12]], inh: [1, 2], neck: 22, from: 35, glasses: [44, 15], hat: [43, 13] },
};
export type Role = 'developer' | 'designer';
const GLASS_FRAME = [28, 28, 34];
const LENS = [200, 230, 255];
const BERET = [150, 30, 40], BERET_HI = [190, 55, 60], BERET_STEM = [60, 10, 15];
const BERET_ROWS = ['..#######..', '.#########.', '###########'];

const BODY_CENTER = 36;      // x del centro del cuerpo dentro de la celda (mirando a la derecha)
const STAGE_H = 64;          // alto del escenario en píxeles nativos
const WALK_SPEED = 34;       // px nativos por segundo
const RUN_SPEED = 88;
const RUN_DISTANCE = 70;     // más lejos que esto, corre en vez de caminar
const MOBILE_X = 34;         // en pantallas angostas se queda en la esquina inferior izquierda
const SEATED: Pose[] = ['sit', 'think', 'look_up', 'howl', 'sleep', 'projects', 'trail'];

const rnd = (a: number, b: number) => a + Math.random() * (b - a);

export class FoxEngine {
  private ctx: CanvasRenderingContext2D;
  private buf: HTMLCanvasElement;
  private bctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  private sheet: HTMLImageElement;
  private meta: SheetMeta;
  private reduced: boolean;

  private scale = 3;
  private mobile = false;
  private width = 0;          // ancho nativo
  private ground = STAGE_H - 3;
  private t = 0;
  private particles: Particle[] = [];

  // estado del zorro
  private x = -40;            // centro del cuerpo, en px nativos (se coloca fuera de pantalla en resize)
  private placed = false;
  private left = false;       // mirando a la izquierda
  private scene: Scene | null = null;
  private targetX = 0;
  private mode: 'move' | 'pose' | 'jump' | 'settle' | 'stalk' = 'move';
  private leapIn = true;      // la primera llegada (Hero) termina en salto
  private jump = { t: 0, dur: 0, x0: 0, x1: 0, h: 0, then: 'pose' as 'pose' | 'howl', landed: false };
  private settleUntil = 0;
  private howlUntil = 0;
  private turnUntil = 0;
  private pointerX: number | undefined;
  private pointerY = 0;       // relativo al escenario (negativo = por encima)
  private pointerAt = 0;      // último movimiento del cursor
  private role: Role = 'developer';
  // interacciones
  private holdUntil = 0;      // se queda donde aterrizó tras cazar el cursor
  private stalkUntil = 0;
  private nextPounce = 4;
  private excitedUntil = 0;   // escribiendo en el formulario
  private confusedUntil = 0;  // correo inválido
  private napUntil = 0;       // tema oscuro
  private shakeUntil = 0;     // tema claro
  private petting = false;
  private sprintUntil = 0;    // botón de subir
  private watchUntil = 0;     // contadores de Sobre mí
  private sleepy = false;     // inactividad
  private looking = false;    // cursor sobre una tarjeta de proyecto
  private trailNear = false;  // un punto de la Trayectoria pasa a su altura
  private bangUntil = 0;
  private fetch: { phase: 'out' | 'away' | 'back' | 'hold' | 'drop'; until: number } | null = null;
  private scrollSpeed = 0;
  private scrollAt = -10;
  private lastFrame = -1;
  private emitAt = 0;
  private gest = { nb: 1.5, ne: 3, be: 0, ee: 0, ear: 0 };

  // colores que dependen del tema
  private ink = '#1a1a1a';
  private accent = '#c9a227';
  private primary = '#d35400';
  private shadow = 'rgba(90,60,40,.18)';
  private dust = '#e4dccf';

  constructor(canvas: HTMLCanvasElement, sheet: HTMLImageElement, meta: SheetMeta, reduced: boolean) {
    this.canvas = canvas;
    this.sheet = sheet;
    this.meta = meta;
    this.reduced = reduced;
    this.ctx = canvas.getContext('2d')!;
    this.buf = document.createElement('canvas');
    this.buf.width = meta.frameWidth;
    this.buf.height = meta.frameHeight;
    this.bctx = this.buf.getContext('2d', { willReadFrequently: true })!;
    this.resize();
  }

  // ───────────────────────── API ─────────────────────────
  resize() {
    this.mobile = window.innerWidth < 900;
    if (this.mobile) {
      // más pequeño en celular, pero con un número entero de píxeles físicos por píxel del sprite
      const dpr = window.devicePixelRatio || 1;
      this.scale = Math.max(2, Math.round(1.5 * dpr)) / dpr;
    } else {
      this.scale = 3;
    }
    this.width = Math.ceil(window.innerWidth / this.scale);
    this.canvas.width = this.width;
    this.canvas.height = STAGE_H;
    this.canvas.style.width = `${this.width * this.scale}px`;
    this.canvas.style.height = `${STAGE_H * this.scale}px`;
    this.ctx.imageSmoothingEnabled = false;
    // entra corriendo desde el borde más cercano a su lugar (derecha en escritorio, izquierda en celular)
    if (!this.placed) {
      this.x = this.mobile ? -40 : this.width + 40;
      this.left = !this.mobile;
      this.placed = true;
    }
    if (this.scene) this.targetX = this.fracToX(this.scene.x);
    if (this.reduced && this.scene) this.x = this.targetX;
  }

  setTheme(c: { ink: string; accent: string; primary: string; dark: boolean }) {
    this.ink = c.ink;
    this.accent = c.accent;
    this.primary = c.primary;
    this.shadow = c.dark ? 'rgba(0,0,0,.45)' : 'rgba(90,60,40,.18)';
    this.dust = c.dark ? '#5a5048' : '#e4dccf';
  }

  setScene(scene: Scene) {
    const same = this.scene && this.scene.pose === scene.pose && this.scene.x === scene.x;
    this.scene = scene;
    this.targetX = this.fracToX(scene.x);
    if (this.reduced) { this.x = this.targetX; this.left = scene.face === 'left'; return; }
    if (!same && this.mode === 'pose') this.mode = 'move';
  }

  /** Mueve el destino sin cambiar de pose (Trayectoria: avanza con el scroll) */
  setTargetFrac(frac: number) {
    if (!this.scene) return;
    this.scene = { ...this.scene, x: frac };
    this.targetX = this.fracToX(frac);
    if (!this.reduced && this.mode === 'pose' && Math.abs(this.targetX - this.x) > 2) this.mode = 'move';
    if (this.reduced) this.x = this.targetX;
  }

  setPointer(clientX: number | undefined, clientY = 0) {
    if (clientX === undefined) { this.pointerX = undefined; return; }
    this.pointerX = clientX / this.scale;
    this.pointerY = (clientY - (window.innerHeight - STAGE_H * this.scale)) / this.scale;
    this.pointerAt = this.t;
  }

  /** Lentes en el perfil Dev, boina en el perfil Diseño */
  setRole(role: Role) {
    this.role = role;
  }

  /** Alguien escribe en el formulario: orejas atentas y cola contenta */
  typing() {
    this.excitedUntil = this.t + 0.7;
    if (this.t > this.gest.ee) { this.gest.ee = this.t + 0.18; this.gest.ear = Math.random() < 0.5 ? 0 : 1; }
  }

  /** Correo inválido: ladea la cabeza con un signo de interrogación */
  confused() {
    this.confusedUntil = this.t + 1.8;
  }

  /** Botón de subir: sprint en su lugar mientras la página sube */
  sprint() {
    if (this.reduced) return;
    this.sprintUntil = this.t + 1.4;
    this.sleepy = false;
  }

  /** Contadores de Sobre mí: los mira subir y brinca al terminar */
  countStart() {
    if (this.scene?.pose === 'think') this.watchUntil = this.t + 2.6;
  }

  countEnd() {
    if (this.t >= this.watchUntil) return;
    this.watchUntil = 0;
    this.react();
  }

  /** Cursor sobre una tarjeta de proyecto: voltea a verla */
  setLooking(looking: boolean) {
    this.looking = looking;
  }

  /** Un punto de la línea de tiempo llega a su altura: lo olfatea */
  setTrailNear(near: boolean) {
    if (near && !this.trailNear) this.bangUntil = this.t + 0.6;
    this.trailNear = near;
  }

  /** Descargar CV: sale corriendo y regresa con el papel en la boca */
  fetchCV() {
    if (this.reduced || this.fetch || !this.scene) return;
    this.sleepy = false;
    this.fetch = { phase: 'out', until: 0 };
  }

  /** Sin actividad: se duerme donde esté; al volver, se sacude */
  setIdle(idle: boolean) {
    if (idle === this.sleepy) return;
    this.sleepy = idle;
    if (!idle && !this.reduced) this.shakeUntil = this.t + 0.7;
  }

  /** Cambio de tema: en oscuro toma una siesta, en claro se despierta y se sacude */
  themeChanged(dark: boolean) {
    if (this.reduced) return;
    if (dark) { this.napUntil = this.t + 2.6; this.shakeUntil = 0; }
    else { this.shakeUntil = this.t + 0.7; this.napUntil = 0; }
  }

  setScrollSpeed(v: number) {
    this.scrollSpeed = v;
    this.scrollAt = this.t;
  }

  /** Salto con aullido de alegría (formulario enviado) */
  celebrate() {
    if (this.reduced) return;
    this.startJump(this.x, this.x, 24, 0.75, 'howl');
  }

  /** Brinquito con corazón (cuando giran la tarjeta de Sobre mí) */
  react() {
    if (this.reduced || this.mode === 'jump') return;
    this.startJump(this.x, this.x, 9, 0.4, 'pose');
    this.particles.push({ x: this.x + (this.left ? -14 : 10), y: this.ground - 44, vx: 0, vy: -10, g: 0, life: 1.1, color: this.primary, size: 1, glyph: 'heart' });
  }

  /** Avanza la simulación dt segundos y dibuja */
  tick(dt: number) {
    dt = Math.min(dt, 0.05);
    this.t += dt;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, STAGE_H);
    if (!this.scene || !this.sheet.complete) return;

    if (this.reduced) { this.drawStatic(); return; }
    if (this.t < 0.9) return;   // espera a que termine la entrada del Hero
    if (this.t < this.sprintUntil) { this.updateSprint(); this.stepParticles(dt); return; }
    if (this.sprintUntil && this.t >= this.sprintUntil) { this.sprintUntil = 0; this.mode = 'move'; }
    if (this.fetch) { this.updateFetch(dt); this.stepParticles(dt); return; }

    switch (this.mode) {
      case 'move':   this.updateMove(dt); break;
      case 'jump':   this.updateJump(dt); break;
      case 'settle': this.drawFox('crouch', 0); if (this.t > this.settleUntil) this.mode = 'pose'; break;
      case 'pose':   this.updatePose(); break;
      case 'stalk':  this.updateStalk(); break;
    }
    this.stepParticles(dt);
  }

  // ───────────────────────── estados ─────────────────────────
  private updateMove(dt: number) {
    const dx = this.targetX - this.x;
    const dist = Math.abs(dx);
    // el primer viaje (Hero) termina con un salto hacia su lugar
    if (this.leapIn && dist < 46) {
      this.leapIn = false;
      this.startJump(this.x, this.targetX, 20, 0.7, 'pose');
      return;
    }
    if (dist < 1.5) {
      this.x = this.targetX;
      this.leapIn = false;
      const seated = SEATED.includes(this.scene!.pose);
      if (seated) { this.mode = 'settle'; this.settleUntil = this.t + 0.14; this.drawFox('crouch', 0); }
      else { this.mode = 'pose'; this.updatePose(); }
      return;
    }
    const run = dist > RUN_DISTANCE || this.leapIn;
    const speed = run ? RUN_SPEED : WALK_SPEED;
    this.left = dx < 0;
    this.x += Math.sign(dx) * Math.min(dist, speed * dt);
    const anim = run ? 'run' : 'walk';
    const f = this.frameAt(anim);
    const bob = run ? [0, -2, -1, -2, 0][f] : (f === 1 || f === 5 ? -1 : 0);
    if (f !== this.lastFrame && (run ? f === 0 || f === 3 : f === 2 || f === 6)) this.dustPuff(run ? 4 : 2, run ? 22 : 10);
    this.lastFrame = f;
    this.drawShadow(30);
    this.drawFox(anim, f, bob);
  }

  private startJump(x0: number, x1: number, h: number, dur: number, then: 'pose' | 'howl') {
    this.jump = { t: 0, dur, x0, x1, h, then, landed: false };
    this.mode = 'jump';
  }

  private updateJump(dt: number) {
    const j = this.jump;
    j.t += dt;
    const crouch = 0.16, land = 0.18;
    if (j.t < crouch) { this.drawShadow(24); this.drawFox('jump', 0, 0, 1 + 0.08 * (j.t / crouch), 1 - 0.1 * (j.t / crouch)); return; }
    const air = j.t - crouch;
    if (air < j.dur) {
      const k = air / j.dur;
      this.x = j.x0 + (j.x1 - j.x0) * k;
      if (j.x1 !== j.x0) this.left = j.x1 < j.x0;
      const h = 4 * j.h * k * (1 - k);
      this.drawShadow(Math.max(10, Math.round(24 - h / 2)));
      this.drawFox('jump', k < 0.35 ? 1 : k < 0.6 ? 2 : 3, -h);
      return;
    }
    if (!j.landed) { j.landed = true; this.x = j.x1; this.dustPuff(6, 22, true); }
    const k = (air - j.dur) / land;
    if (k < 1) {
      const sq = Math.sin(k * Math.PI);
      this.drawShadow(26);
      this.drawFox('crouch', 0, 0, 1 + 0.1 * sq, 1 - 0.12 * sq);
      return;
    }
    if (j.then === 'howl') this.howlUntil = this.t + 1.8;
    this.mode = this.t < this.holdUntil || Math.abs(this.targetX - this.x) <= 1.5 ? 'pose' : 'move';
  }

  private updatePose() {
    const scene = this.scene!;
    if (Math.abs(this.targetX - this.x) > 2 && this.t >= this.holdUntil) { this.mode = 'move'; return; }

    // aullido de celebración: notas y corazones, luego vuelve a su pose
    if (this.t < this.howlUntil) {
      this.emit(0.3, () => ({ x: this.x + (this.left ? -18 : 14), y: this.ground - 38, vx: rnd(4, 12) * (this.left ? -1 : 1), vy: -10, g: 0, life: 1.4, size: 1,
        glyph: Math.random() < 0.35 ? 'heart' : 'note', color: Math.random() < 0.35 ? this.primary : this.ink }));
      const ph = (this.howlUntil - this.t) % 0.8;
      this.drawShadow(28);
      this.drawFox('howl', 0, -Math.round(2 * Math.sin(ph / 0.8 * Math.PI)));
      return;
    }

    // tema oscuro o inactividad: duerme; tema claro o al volver: se sacude
    if (this.t < this.napUntil || this.sleepy) {
      this.emit(0.8, () => ({ x: this.x + (this.left ? -14 : 12), y: this.ground - 20, vx: this.left ? -5 : 5, vy: -7, g: 0, life: 1.8, size: 1, glyph: 'z', color: this.ink }));
      this.drawShadow(30);
      this.drawFox('sleep', this.frameAt('sleep'));
      return;
    }
    if (this.t < this.shakeUntil) {
      if (Math.random() < 0.3) this.dustPuff(1, 14, true);
      this.drawShadow(30);
      this.drawFox('shake', this.frameAt('shake'));
      return;
    }

    // mira subir los contadores de Sobre mí
    if (this.t < this.watchUntil) {
      this.left = false;
      this.emit(0.45, () => ({ x: this.x + rnd(0, 24), y: rnd(2, 12), vx: 0, vy: -2, g: 0, life: 0.9, size: 1, glyph: 'star', color: this.accent }));
      this.drawShadow(22);
      this.drawFx('look_up', this.frameAt('look_up'), this.gestures());
      return;
    }

    // hacia dónde mira
    if (scene.face === 'pointer' && this.pointerX !== undefined && Math.abs(this.pointerX - this.x) > 10) {
      const wantLeft = this.pointerX < this.x;
      if (wantLeft !== this.left) { this.left = wantLeft; this.turnUntil = this.t + 0.12; this.dustPuff(1, 8); }
    } else if (scene.face !== 'pointer') {
      this.left = scene.face === 'left';
    }
    if (this.t < this.turnUntil) { this.drawShadow(22); this.drawFox('crouch', 0); return; }

    // acariciar: el cursor encima del zorro
    this.petting = this.pointerX !== undefined && Math.abs(this.pointerX - this.x) < 18
      && this.pointerY > this.ground - 38 && this.pointerY < this.ground + 2;
    const g: { blink: boolean; ear?: number; tilt?: number } = this.gestures();
    let tailSpeed = 1;
    if (this.petting) {
      g.blink = true;   // ojos entrecerrados de gusto
      tailSpeed = 3;
      this.emit(0.35, () => ({ x: this.x + rnd(-6, 10) * (this.left ? -1 : 1), y: this.ground - 40, vx: rnd(-3, 3), vy: -12, g: 0, life: 1, size: 1, glyph: 'heart', color: this.primary }));
    }
    if (this.t < this.excitedUntil) tailSpeed = Math.max(tailSpeed, 2.5);
    const confused = this.t < this.confusedUntil;
    if (confused) {
      const k = Math.min(1, (this.confusedUntil - this.t) / 0.25, (this.t - this.confusedUntil + 1.8) / 0.25);
      g.tilt = 2 * k;
      this.glyph('ask', this.x + (this.left ? -14 : 9), this.ground - 48, this.primary);
    }

    // cazar el cursor: si se queda quieto cerca, se agacha, menea la cola y salta
    if (scene.hunt && !this.petting && this.canPounce()) {
      this.mode = 'stalk';
      this.stalkUntil = this.t + 0.9;
      this.left = this.pointerX! < this.x;
      this.drawShadow(24); this.drawFox('crouch', 0);
      return;
    }

    switch (scene.pose) {
      case 'sit':
        this.drawShadow(22);
        this.drawFx('sit', this.frameAt('sit', tailSpeed), g);
        break;
      case 'think': {
        const T = this.t % 4;
        const tilt = T < 0.3 ? T / 0.3 : T < 2.2 ? 1 : T < 2.5 ? 1 - (T - 2.2) / 0.3 : 0;
        const n = Math.floor(this.t * 1.6) % 4;
        for (let i = 0; i < n; i++) this.glyph('dot', this.x + (this.left ? -16 - i * 4 : 14 + i * 4), this.ground - 40 - i * 2, this.ink);
        this.drawShadow(22);
        this.drawFx('think', this.frameAt('think', tailSpeed), { ...g, tilt: Math.max(g.tilt ?? 0, 2 * tilt) });
        break;
      }
      case 'look_up':
        this.emit(0.5, () => ({ x: this.x + rnd(-2, 26) * (this.left ? -1 : 1), y: rnd(2, 12), vx: 0, vy: -2, g: 0, life: 0.9, size: 1, glyph: 'star', color: this.accent }));
        this.drawShadow(22);
        this.drawFx('look_up', this.frameAt('look_up', tailSpeed), g);
        break;
      case 'sniff': {
        const f = this.frameAt('sniff');
        if (f !== this.lastFrame && f !== 0) {
          const dir = this.left ? 1 : -1;
          for (let i = 0; i < 3; i++) this.particles.push({ x: this.x + (this.left ? -8 : 8), y: this.ground - 2, vx: dir * rnd(16, 34), vy: rnd(-34, -18), g: 120, life: 0.6, color: '#8e6151', size: i ? 1 : 2 });
        }
        this.lastFrame = f;
        this.drawShadow(32);
        this.drawFox('sniff', f);
        break;
      }
      case 'projects': {
        // corre en su lugar mientras las tarjetas pasan; si dejas de hacer scroll, se sienta
        const moving = this.t - this.scrollAt < 0.25 && Math.abs(this.scrollSpeed) > 40;
        if (moving) {
          this.left = this.scrollSpeed < 0;
          const f = this.frameAt('run');
          if (f !== this.lastFrame && (f === 0 || f === 3)) this.dustPuff(3, 20);
          this.lastFrame = f;
          this.drawShadow(30);
          this.drawFox('run', f, [0, -2, -1, -2, 0][f]);
        } else if (this.looking) {
          // mira hacia la tarjeta que está bajo el cursor
          if (this.pointerX !== undefined) this.left = this.pointerX < this.x;
          this.drawShadow(22);
          this.drawFx('look_up', this.frameAt('look_up', tailSpeed), g);
        } else {
          this.drawShadow(22);
          this.drawFx('sit', this.frameAt('sit', tailSpeed), g);
        }
        break;
      }
      case 'trail': {
        // junto a la línea de tiempo: olfatea cada punto que pasa y si no, espera sentado
        if (this.t < this.bangUntil) this.glyph('bang', this.x + (this.left ? -18 : 16), this.ground - 44, this.primary);
        if (this.trailNear) {
          const f = this.frameAt('sniff');
          if (f !== this.lastFrame && f !== 0) {
            const dir = this.left ? 1 : -1;
            for (let i = 0; i < 2; i++) this.particles.push({ x: this.x + (this.left ? -8 : 8), y: this.ground - 2, vx: dir * rnd(16, 30), vy: rnd(-30, -16), g: 120, life: 0.5, color: '#8e6151', size: 1 });
          }
          this.lastFrame = f;
          this.drawShadow(32);
          this.drawFox('sniff', f);
        } else {
          this.drawShadow(22);
          this.drawFx('sit', this.frameAt('sit', tailSpeed), g);
        }
        break;
      }
      case 'howl':
        this.drawShadow(28);
        this.drawFox('howl', 0, Math.floor(this.t * 2) % 2 ? 0 : -1);
        break;
      case 'sleep':
        this.emit(1.1, () => ({ x: this.x + (this.left ? -14 : 12), y: this.ground - 20, vx: this.left ? -5 : 5, vy: -7, g: 0, life: 2.2, size: 1, glyph: 'z', color: this.ink }));
        this.drawShadow(30);
        this.drawFox('sleep', this.frameAt('sleep'));
        break;
    }
  }

  private updateSprint() {
    // corre muy rápido en su lugar con polvo y líneas de velocidad detrás
    this.left = false;
    const f = Math.floor(this.t * 20) % 5;
    if (f !== this.lastFrame) {
      this.lastFrame = f;
      if (f === 0 || f === 3) this.dustPuff(3, 30);
      this.particles.push({ x: this.x - 28 - rnd(0, 10), y: this.ground - rnd(10, 30), vx: -70, vy: 0, g: 0, life: 0.25, color: this.primary, size: 1, w: Math.round(rnd(4, 8)) });
    }
    this.drawShadow(30);
    this.drawFox('run', f, [0, -2, -1, -2, 0][f]);
  }

  /** Corre hacia tx; devuelve true al llegar. Con `carry` lleva el papel en la boca */
  private runTo(tx: number, dt: number, carry: boolean) {
    const dx = tx - this.x;
    if (Math.abs(dx) < 1.5) { this.x = tx; return true; }
    this.left = dx < 0;
    this.x += Math.sign(dx) * Math.min(Math.abs(dx), RUN_SPEED * 1.25 * dt);
    const f = this.frameAt('run', 1.25);
    const bob = [0, -2, -1, -2, 0][f];
    if (f !== this.lastFrame && (f === 0 || f === 3)) this.dustPuff(3, 22);
    this.lastFrame = f;
    this.drawShadow(30);
    this.drawFox('run', f, bob);
    if (carry) this.drawPaper(this.x + (this.left ? -18 : 14), this.ground - 26 + bob);
    return false;
  }

  private updateFetch(dt: number) {
    const fe = this.fetch!;
    switch (fe.phase) {
      case 'out':   // sale por el borde más cercano
        if (this.runTo(this.x < this.width / 2 ? -40 : this.width + 40, dt, false)) { fe.phase = 'away'; fe.until = this.t + 0.5; }
        break;
      case 'away':
        if (this.t >= fe.until) fe.phase = 'back';
        break;
      case 'back':
        if (this.runTo(this.targetX, dt, true)) { fe.phase = 'hold'; fe.until = this.t + 1.6; }
        break;
      case 'hold': {   // sentado, orgulloso, con el papel en la boca
        this.left = this.scene?.face === 'left';
        this.drawShadow(22);
        this.drawFx('sit', this.frameAt('sit', 2), this.gestures());
        this.drawPaper(this.x + (this.left ? -16 : 12), this.ground - 22);
        if (this.t >= fe.until) {
          fe.phase = 'drop';
          this.particles.push({ x: this.x + (this.left ? -16 : 12), y: this.ground - 22, vx: this.left ? -8 : 8, vy: -14, g: 90, life: 0.55, color: '#fff7ef', size: 3 });
          this.particles.push({ x: this.x + (this.left ? -10 : 6), y: this.ground - 40, vx: 0, vy: -10, g: 0, life: 1, color: this.primary, size: 1, glyph: 'heart' });
        }
        break;
      }
      case 'drop':
        this.fetch = null;
        this.mode = 'pose';
        this.updatePose();
        break;
    }
  }

  /** Hoja de CV de 5x6 con renglones */
  private drawPaper(x: number, y: number) {
    const ctx = this.ctx, X = Math.round(x), Y = Math.round(y);
    ctx.fillStyle = '#5a2a1c';
    ctx.fillRect(X - 1, Y - 1, 7, 8);
    ctx.fillStyle = '#fff7ef';
    ctx.fillRect(X, Y, 5, 6);
    ctx.fillStyle = this.primary;
    ctx.fillRect(X + 1, Y + 1, 3, 1);
    ctx.fillStyle = '#9a8f86';
    ctx.fillRect(X + 1, Y + 3, 3, 1);
    ctx.fillRect(X + 1, Y + 4, 2, 1);
  }

  private canPounce() {
    if (this.pointerX === undefined || this.t < this.nextPounce || this.t < this.excitedUntil + 2) return false;
    const dx = Math.abs(this.pointerX - this.x);
    const still = this.t - this.pointerAt > 1.4;
    // el cursor debe estar cerca del suelo (hasta ~120 px nativos por encima del escenario)
    return still && dx > 14 && dx < 150 && this.pointerY > -120 && this.pointerY < STAGE_H;
  }

  private updateStalk() {
    if (this.pointerX === undefined || this.t - this.pointerAt < 0.05) {
      // el cursor se movió: se cancela la cacería
      this.mode = 'pose';
      this.nextPounce = this.t + 2;
      this.updatePose();
      return;
    }
    // agachado, meneando la cola (alterna los dos cuadros de agacharse)
    const wiggle = Math.floor(this.t * 7) % 2;
    this.drawShadow(26);
    this.drawFox('crouch', wiggle);
    if (this.t >= this.stalkUntil) {
      const to = Math.max(20, Math.min(this.width - 20, this.pointerX));
      this.nextPounce = this.t + 7;
      this.holdUntil = this.t + 0.16 + 0.55 + 0.18 + 1.2;
      this.startJump(this.x, to, 18, 0.55, 'pose');
    }
  }

  private drawStatic() {
    // movimiento reducido: sentado y quieto (dormido en el footer), sin partículas ni ciclos
    const sleep = this.scene!.pose === 'sleep' || this.sleepy;
    this.drawShadow(22);
    this.drawFox(sleep ? 'sleep' : 'sit', 0);
  }

  // ───────────────────────── dibujo ─────────────────────────
  private fracToX(frac: number) {
    return this.mobile ? MOBILE_X : Math.round(frac * this.width);
  }

  private frameAt(anim: string, speed = 1) {
    const a = this.meta.animations[anim];
    return Math.floor(this.t * a.fps * speed) % a.frames;
  }

  /** x de la esquina izquierda de la celda para que el centro del cuerpo quede en this.x */
  private cellLeft() {
    return Math.round(this.x - (this.left ? this.meta.frameWidth - 1 - BODY_CENTER : BODY_CENTER));
  }

  private blit(src: CanvasImageSource, sx: number, sy: number, bob = 0, sxScale = 1, syScale = 1) {
    const { frameWidth: W, frameHeight: H } = this.meta;
    const ctx = this.ctx;
    const dw = Math.round(W * sxScale), dh = Math.round(H * syScale);
    const left = this.cellLeft() + Math.round((W - dw) / 2);
    const top = Math.round(this.ground - dh + bob);
    if (this.left) {
      ctx.save();
      ctx.translate(left + dw, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(src, sx, sy, W, H, 0, top, dw, dh);
      ctx.restore();
    } else {
      ctx.drawImage(src, sx, sy, W, H, left, top, dw, dh);
    }
  }

  private drawFox(anim: string, frame: number, bob = 0, sx = 1, sy = 1) {
    const a = this.meta.animations[anim];
    this.blit(this.sheet, frame * this.meta.frameWidth, a.row * this.meta.frameHeight, bob, sx, sy);
  }

  /** Dibuja una pose sentada aplicando parpadeo, accesorio, oreja y cabeza ladeada píxel por píxel */
  private drawFx(anim: string, frame: number, o: { blink: boolean; ear?: number; tilt?: number }) {
    const { frameWidth: W, frameHeight: H } = this.meta;
    const a = this.meta.animations[anim];
    const b = this.bctx;
    b.clearRect(0, 0, W, H);
    b.drawImage(this.sheet, frame * W, a.row * H, W, H, 0, 0, W, H);
    const p = POSE_PX[anim];
    if (p) {
      const img = b.getImageData(0, 0, W, H), d = img.data;
      const px = (x: number, y: number) => (y * W + x) * 4;
      const put = (x: number, y: number, c: number[]) => {
        if (x < 0 || y < 0 || x >= W || y >= H) return;
        const i = px(x, y); d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2]; d[i + 3] = 255;
      };
      const dy = p.inh.includes(frame) ? -1 : 0;
      // 1) parpadeo: el ojo toma el color del pelo de arriba
      if (o.blink) for (const [ex, ey] of p.eyes) {
        const i = px(ex, ey + dy), up = px(ex, ey + dy - 1);
        for (let k = 0; k < 3; k++) d[i + k] = d[up + k];
      }
      // 2) accesorio según el perfil
      if (this.role === 'developer') {
        const [ex, ey0] = p.glasses, ey = ey0 + dy;
        for (let x = ex - 2; x <= ex + 2; x++) for (let y = ey - 2; y <= ey + 1; y++) {
          if (x === ex - 2 || x === ex + 2 || y === ey - 2 || y === ey + 1) put(x, y, GLASS_FRAME);
          else if (d[px(x, y) + 3]) { const i = px(x, y); for (let k = 0; k < 3; k++) d[i + k] = Math.round(d[i + k] * 0.45 + LENS[k] * 0.55); }
        }
        for (let x = ex - 6; x < ex - 2; x++) put(x, ey - 1, GLASS_FRAME);   // patilla
        put(ex + 3, ey, GLASS_FRAME); put(ex + 4, ey, GLASS_FRAME);          // puente
      } else {
        const [cx, by0] = p.hat, by = by0 + dy;
        BERET_ROWS.forEach((row, j) => [...row].forEach((c, i) => {
          if (c === '#') put(cx - 5 + i, by - 2 + j, j === 0 && i > 2 && i < 6 ? BERET_HI : BERET);
        }));
        put(cx, by - 3, BERET_STEM);
      }
      // 3) oreja y cabeza ladeada se calculan sobre la imagen ya con accesorio
      if (o.ear !== undefined || o.tilt) {
        const src = new Uint8ClampedArray(d);
        if (o.tilt) {
          for (let y = 0; y < p.neck; y++) {
            const sh = Math.round(o.tilt * (p.neck - y) / 7);
            if (!sh) continue;
            for (let x = W - 1; x >= p.from; x--) {
              const s0 = x - sh, i = px(x, y);
              if (s0 >= p.from) for (let k = 0; k < 4; k++) d[i + k] = src[px(s0, y) + k];
              else d[i + 3] = 0;
            }
          }
        }
        if (o.ear !== undefined && !o.tilt) {
          const [x0, x1, y0, y1] = p.ears[o.ear];
          for (let y = y0 + dy; y <= y1 + dy; y++) for (let x = x1; x >= x0; x--) {
            const i = px(x, y);
            if (src[i + 3]) for (let k = 0; k < 4; k++) d[px(x + 1, y) + k] = src[i + k];
            if (x === x0 || !src[px(x - 1, y) + 3]) d[i + 3] = 0;
          }
        }
      }
      b.putImageData(img, 0, 0);
    }
    this.blit(this.buf, 0, 0);
  }

  private drawShadow(w: number) {
    const ctx = this.ctx;
    ctx.fillStyle = this.shadow;
    const cx = Math.round(this.x + (this.left ? -2 : 2));
    ctx.fillRect(cx - Math.round(w / 2), this.ground - 1, w, 1);
    ctx.fillRect(cx - Math.round(w / 2) + 2, this.ground, w - 4, 1);
  }

  private glyph(g: keyof typeof GLYPH, x: number, y: number, color: string) {
    const ctx = this.ctx;
    ctx.fillStyle = color;
    GLYPH[g].forEach((row, j) => [...row].forEach((c, i) => { if (c === '1') ctx.fillRect(Math.round(x) + i, Math.round(y) + j, 1, 1); }));
  }

  // ───────────────────────── partículas y gestos ─────────────────────────
  private dustPuff(n: number, speed: number, both = false) {
    for (let i = 0; i < n; i++) {
      const dir = both ? (i % 2 ? 1 : -1) : (this.left ? 1 : -1);
      this.particles.push({ x: this.x + dir * rnd(4, 14), y: this.ground - 1, vx: dir * rnd(speed * 0.4, speed), vy: rnd(-16, -6), g: 60, life: 0.45, color: this.dust, size: i % 2 ? 2 : 1 });
    }
  }

  private emit(every: number, make: () => Particle) {
    if (this.t - this.emitAt < every) return;
    this.emitAt = this.t;
    this.particles.push(make());
  }

  private stepParticles(dt: number) {
    const ctx = this.ctx;
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) { this.particles.splice(i, 1); continue; }
      p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.glyph) this.glyph(p.glyph, p.x, p.y, p.color);
      else { ctx.fillStyle = p.color; ctx.fillRect(Math.round(p.x), Math.round(p.y), p.w ?? p.size, p.size); }
    }
  }

  /** Parpadeo cada 2-5 s y oreja cada 3-7 s, al azar */
  private gestures() {
    const g = this.gest, t = this.t;
    if (t > g.nb) { g.be = t + 0.14; g.nb = t + 2 + Math.random() * 3; }
    if (t > g.ne) { g.ee = t + 0.22; g.ear = Math.random() < 0.5 ? 0 : 1; g.ne = t + 3 + Math.random() * 4; }
    return { blink: t < g.be, ear: t < g.ee ? g.ear : undefined };
  }
}
