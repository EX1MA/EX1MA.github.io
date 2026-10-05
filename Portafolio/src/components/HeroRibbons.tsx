import { useEffect, useRef } from 'react';
import { gsap } from '../animations/gsap';
import { prefersReducedMotion } from '../utils/motion';
import s from './HeroSection.module.css';

/* Cintas de luz en WebGL (idea del demo landing-lima), teñidas con --primary-color
   y --accent-color para que sigan al perfil (Dev naranja, Diseñador morado) y al tema. */

const VS = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';

const FS = `
precision highp float;
uniform vec2 uRes; uniform float uTime;
uniform vec2 uCenter; uniform vec3 uA, uB;
uniform float uLight;
const int N = 22;   // cintas
const int P = 22;   // chispas
const float CURV = 1.9, SPREAD = .6, ANGLE = -1.25;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float hash1(float n){ return fract(sin(n * 12.9898) * 43758.5453); }
float noise(vec2 x){
  vec2 i = floor(x), f = fract(x);
  f = f * f * (3. - 2. * f);
  return mix(mix(hash(i), hash(i + vec2(1., 0.)), f.x),
             mix(hash(i + vec2(0., 1.)), hash(i + vec2(1., 1.)), f.x), f.y);
}
// posición de la cinta fi a la altura y: parábola en abanico + deriva orgánica
float curveX(float y, float k, float fi, float t){
  float ay = abs(y);
  float breathe = 1. + .28 * sin(t * .45 + y * 2.2 + fi * 3.1);
  float drift = noise(vec2(y * 1.25 - t * .22, fi * 4.3 + t * .07)) - .5;
  return CURV * (1. + k * .55) * y * y
       + k * SPREAD * (.06 + ay * 1.1) * breathe
       + drift * .17 * (.2 + ay * 1.5);
}
void main(){
  vec2 uv = (gl_FragCoord.xy - .5 * uRes) / uRes.y;
  vec2 p = uv - uCenter;
  float ca = cos(ANGLE), sa = sin(ANGLE);
  p = mat2(ca, -sa, sa, ca) * p;

  vec3 col = vec3(0.);
  float t = uTime;
  float ay = abs(p.y);

  for (int i = 0; i < N; i++) {
    float fi = float(i) / float(N - 1);
    float k = fi - .5;
    float x = curveX(p.y, k, fi, t);
    float slope = 2. * CURV * (1. + k * .55) * p.y + k * SPREAD * 1.1 * sign(p.y);
    float d = abs(p.x - x) / sqrt(1. + slope * slope);
    float w = .0018 + .0028 * max(1. - abs(k) * 1.6, 0.);
    float core = w / (d + w * .35);
    float halo = .004 / (d + .012);
    float e = noise(vec2(ay * 4.5 - t * 1.6 + fi * 1.7, fi * 11.3));
    float energy = .25 + 1.6 * e * e;
    float tail = smoothstep(1.5, .12, ay);
    vec3 c = mix(uA, uB, smoothstep(-.2, .5, k));
    float bright = max(1. - abs(k) * 1.1, .2);
    col += c * (core * core * .06 + halo * .1) * energy * tail * bright;
  }

  // nudo que respira
  float knot = .016 / (length(p * vec2(1.3, .8)) + .03);
  col += uA * knot * (.7 + .25 * noise(vec2(t * 1.7, 3.)));

  // chispas que viajan por las cintas
  for (int j = 0; j < P; j++) {
    float fj = float(j);
    float fi = floor(hash1(fj * 3.7) * float(N)) / float(N - 1);
    float k = fi - .5;
    float s = fract(hash1(fj * 7.1) + t * (.06 + .11 * hash1(fj * 1.9)));
    float y = (hash1(fj * 5.3) < .5 ? -1. : 1.) * s * 1.2;
    vec2 q = vec2(curveX(y, k, fi, t), y);
    float dd = length(p - q);
    float spark = exp(-dd * dd / .0000125) * 1.6 + .0012 / (dd + .006) * .25;
    col += mix(uB, vec3(1.), .4 * (1. - uLight)) * spark * sin(s * 3.14159);
  }

  col = 1. - exp(-col * 1.25);
  // alfa = intensidad: el fondo de la página se ve a través (premultiplicado)
  float a = clamp(max(col.r, max(col.g, col.b)), 0., 1.);
  gl_FragColor = vec4(col, a);
}`;

const parseColor = (css: string): [number, number, number] => {
  const ctx = document.createElement('canvas').getContext('2d')!;
  ctx.fillStyle = css;
  const hex = ctx.fillStyle; // siempre #rrggbb para colores opacos
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255];
};

export const HeroRibbons = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas?.getContext('webgl', { antialias: false, premultipliedAlpha: true, alpha: true });
    if (!canvas || !gl) return;

    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(sh));
      return sh;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = (n: string) => gl.getUniformLocation(prog, n);
    const u = { res: U('uRes'), time: U('uTime'), center: U('uCenter'), a: U('uA'), b: U('uB'), light: U('uLight') };

    // Colores del tema: se releen al cambiar de perfil (style) o de tema (data-theme)
    const readColors = () => {
      const cs = getComputedStyle(document.documentElement);
      gl.uniform3fv(u.a, parseColor(cs.getPropertyValue('--primary-color').trim()));
      gl.uniform3fv(u.b, parseColor(cs.getPropertyValue('--accent-color').trim()));
      gl.uniform1f(u.light, document.documentElement.dataset.theme === 'dark' ? 0 : 1);
    };

    // Resolución reducida: el brillo es suave, no necesita píxeles completos
    const mobile = () => window.innerWidth < 900;
    const resize = () => {
      const scale = Math.min(devicePixelRatio, 2) * (mobile() ? 0.35 : 0.5);
      canvas.width = Math.round(canvas.clientWidth * scale);
      canvas.height = Math.round(canvas.clientHeight * scale);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    const reduce = prefersReducedMotion();
    const mouse = { x: 0, y: 0 };
    const start = performance.now();
    const draw = () => {
      const t = reduce ? 8 : (performance.now() - start) / 1000;
      gl.uniform2f(u.res, canvas.width, canvas.height);
      gl.uniform1f(u.time, t);
      // En celular el nudo baja para no tapar el nombre
      gl.uniform2f(u.center, (mobile() ? -0.05 : -0.42) + mouse.x, (mobile() ? -0.32 : -0.08) + mouse.y);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    readColors();
    resize();
    draw();

    const theme = new MutationObserver(() => { readColors(); draw(); });
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ['style', 'data-theme'] });
    const onResize = () => { resize(); draw(); };
    window.addEventListener('resize', onResize);

    if (reduce) {
      return () => { theme.disconnect(); window.removeEventListener('resize', onResize); };
    }

    // El mouse inclina un poco las cintas
    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      gsap.to(mouse, {
        x: (e.clientX / window.innerWidth - 0.5) * 0.06,
        y: (e.clientY / window.innerHeight - 0.5) * -0.04,
        duration: 1.2, overwrite: true,
      });
    };
    window.addEventListener('pointermove', onPointer);

    // Solo se anima mientras el hero está en pantalla
    let raf = 0;
    const loop = () => { draw(); raf = requestAnimationFrame(loop); };
    const io = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(raf);
      if (entry.isIntersecting) raf = requestAnimationFrame(loop);
    });
    io.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      theme.disconnect();
      gsap.killTweensOf(mouse);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onPointer);
    };
  }, []);

  return <canvas ref={canvasRef} data-ribbons className={s.ribbons} aria-hidden="true" />;
};
