import { mkdirSync, writeFileSync } from 'node:fs';

const L = 1000;
const GRAD = `<linearGradient id="mel" x1="0" y1="0" x2="0" y2="200" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FFE100"/>
      <stop offset="100%" stop-color="#FFB81C"/>
    </linearGradient>`;

function onda(base, amplitude, fase, invertido) {
    const pontos = [];
    for (let x = 0; x <= L; x += 50) {
        const y = base + Math.sin((x / L) * Math.PI * 4 + fase) * amplitude + Math.sin((x / L) * Math.PI * 9 + fase * 1.7) * amplitude * 0.35;
        pontos.push([x, y]);
    }
    let d = invertido ? `M0 200 L0 ${pontos[0][1].toFixed(1)}` : `M0 0 L0 ${pontos[0][1].toFixed(1)}`;
    for (let i = 1; i < pontos.length; i++) {
        const [x0, y0] = pontos[i - 1];
        const [x1, y1] = pontos[i];
        d += ` Q${x0 + 25} ${y0.toFixed(1)} ${((x0 + x1) / 2).toFixed(1)} ${((y0 + y1) / 2).toFixed(1)}`;
        if (i === pontos.length - 1) d += ` T${x1} ${y1.toFixed(1)}`;
    }
    d += invertido ? ` L${L} 200 Z` : ` L${L} 0 Z`;
    return d;
}

function animarOnda(base, amplitude, invertido, dur, cor) {
    const quadros = [0, 1.6, 3.2, 4.8, 6.283].map((f) => onda(base, amplitude, f, invertido));
    return `<path d="${quadros[0]}" fill="${cor}">
      <animate attributeName="d" values="${quadros.join(';')}" dur="${dur}s" repeatCount="indefinite"/>
    </path>`;
}

const GOTAS = [
    { x: 90, atraso: 0, comp: 46 },
    { x: 260, atraso: 2.3, comp: 64 },
    { x: 430, atraso: 1.1, comp: 38 },
    { x: 610, atraso: 3.4, comp: 70 },
    { x: 780, atraso: 0.6, comp: 50 },
    { x: 930, atraso: 2.8, comp: 42 },
];

function gota({ x, atraso, comp }) {
    const dur = 4.2;
    const tempo = `dur="${dur}s" begin="${atraso}s" repeatCount="indefinite"`;
    return `<g transform="translate(${x} 48)">
      <rect x="-4" y="0" width="8" height="0" rx="4" fill="#FFC400">
        <animate attributeName="height" values="0;${comp};${comp};0;0" keyTimes="0;0.5;0.56;0.68;1" ${tempo}/>
      </rect>
      <circle cx="0" cy="0" r="7" fill="#FFC400">
        <animate attributeName="cy" values="0;${comp};${comp};${comp + 150};${comp + 150}" keyTimes="0;0.5;0.56;0.86;1" calcMode="spline" keySplines="0.3 0 0.7 1;0 0 1 1;0.55 0 1 1;0 0 1 1" ${tempo}/>
        <animate attributeName="opacity" values="1;1;0;0" keyTimes="0;0.8;0.86;1" ${tempo}/>
      </circle>
    </g>`;
}

const ABELHA = `<g transform="scale(1.6)">
      <g>
        <animateTransform attributeName="transform" type="translate" values="0,0;0,-3;0,0" dur="0.7s" repeatCount="indefinite"/>
        <ellipse cx="-2" cy="-7" rx="5" ry="7" fill="#FFFFFF" fill-opacity="0.75" stroke="#14110B" stroke-opacity="0.35" stroke-width="0.8" transform="rotate(-25 -2 -7)">
          <animate attributeName="ry" values="7;3;7" dur="0.12s" repeatCount="indefinite"/>
        </ellipse>
        <ellipse cx="3" cy="-7" rx="4" ry="6" fill="#FFFFFF" fill-opacity="0.65" stroke="#14110B" stroke-opacity="0.35" stroke-width="0.8" transform="rotate(20 3 -7)">
          <animate attributeName="ry" values="6;2.5;6" dur="0.12s" repeatCount="indefinite"/>
        </ellipse>
        <path d="M-12 0 L-16 0.8 L-12 1.6 Z" fill="#14110B"/>
        <ellipse cx="-2" cy="0.8" rx="10" ry="6.5" fill="#FFD000" stroke="#14110B" stroke-width="1"/>
        <path d="M-6 -5.3 Q-4.5 0.8 -6 6.9 M-1 -6.2 Q0.5 0.8 -1 7.8" stroke="#14110B" stroke-width="2.4" fill="none"/>
        <circle cx="9" cy="0" r="4.6" fill="#14110B"/>
        <circle cx="10.6" cy="-1.2" r="1.2" fill="#FFD000"/>
        <path d="M10 -4 Q12 -9 15 -9.5 M8 -4.2 Q8.5 -9.5 11 -11" stroke="#14110B" stroke-width="1" fill="none" stroke-linecap="round"/>
      </g>
    </g>`;

function topo() {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${L} 200" width="${L}" height="200" preserveAspectRatio="none" role="img" aria-label="Mel escorrendo">
  <defs>${GRAD}</defs>
  ${animarOnda(66, 12, false, 9, '#E68A00')}
  ${animarOnda(54, 10, false, 6, 'url(#mel)')}
  ${GOTAS.map(gota).join('')}
  <g>
    <animateMotion dur="14s" repeatCount="indefinite" path="M-60 160 C 150 110, 300 190, 500 140 S 850 120, 1060 165" rotate="0"/>
    ${ABELHA}
  </g>
</svg>`;
}

function rodape() {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${L} 200" width="${L}" height="200" preserveAspectRatio="none" role="img" aria-label="Pote de mel">
  <defs>${GRAD}</defs>
  ${animarOnda(110, 14, true, 8, '#E68A00')}
  ${animarOnda(124, 11, true, 5.5, 'url(#mel)')}
</svg>`;
}

const saida = process.argv[2] || 'assets';
mkdirSync(saida, { recursive: true });
writeFileSync(`${saida}/topo.svg`, topo());
writeFileSync(`${saida}/rodape.svg`, rodape());
