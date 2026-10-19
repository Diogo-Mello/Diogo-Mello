import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const base = new URL('./marca/', import.meta.url);

function miolo(arquivo) {
    const svg = readFileSync(new URL(arquivo, base), 'utf8');
    return svg.slice(svg.indexOf('>', svg.indexOf('<svg')) + 1, svg.lastIndexOf('</svg>'));
}

function logo(arquivo, halo) {
    return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 640 200" width="640" height="200" role="img" aria-label="Vynce Labs">
  <defs>
    <radialGradient id="halo" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0%" stop-color="${halo}" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="${halo}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="raio" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0"/>
      <stop offset="50%" stop-color="#FFFFFF" stop-opacity="0.85"/>
      <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0"/>
    </linearGradient>
    <filter id="branco"><feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0"/></filter>
    <g id="marca" transform="translate(54.5 37) scale(3)">${miolo(arquivo)}</g>
    <mask id="forma" maskUnits="userSpaceOnUse" x="0" y="0" width="640" height="200">
      <use xlink:href="#marca" href="#marca" filter="url(#branco)"/>
    </mask>
  </defs>
  <ellipse cx="320" cy="100" rx="300" ry="90" fill="url(#halo)" opacity="0.25">
    <animate attributeName="opacity" values="0.15;0.35;0.15" dur="4s" repeatCount="indefinite"/>
  </ellipse>
  <use xlink:href="#marca" href="#marca"/>
  <g mask="url(#forma)">
    <rect x="-160" y="-40" width="110" height="280" fill="url(#raio)" transform="skewX(-20)">
      <animate attributeName="x" values="-160;-160;800" keyTimes="0;0.55;1" dur="5s" repeatCount="indefinite"/>
    </rect>
  </g>
</svg>`;
}

const saida = process.argv[2] || 'assets';
mkdirSync(saida, { recursive: true });
writeFileSync(`${saida}/vynce-escuro.svg`, logo('logo-escuro.svg', '#FFD000'));
writeFileSync(`${saida}/vynce-claro.svg`, logo('logo-claro.svg', '#F0B400'));
