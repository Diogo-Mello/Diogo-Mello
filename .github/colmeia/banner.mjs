import { mkdirSync, writeFileSync } from 'node:fs';

const LOGO =
    'M382 409 L382 543 L562 788 L562 933 L623 994 L628 997 L693 933 L694 786 L871 542 L871 409 L628 736 L623 732 Z M382 211 L383 366 L448 452 L627 697 L781 484 L871 364 L871 211 L790 323 L627 556 L464 323 Z';

const TEMAS = {
    escuro: {
        fundo: '#0B0B0C',
        texto: '#F3EBD8',
        apagado: '#8C8270',
        linha: '#2A261E',
        favo: '#FFD000',
        grad: ['#FFF200', '#FFE100', '#FFD000', '#FFB81C', '#FF9F1A'],
    },
    claro: {
        fundo: '#FFFBF0',
        texto: '#1C1A15',
        apagado: '#7A6F57',
        linha: '#E6DAB8',
        favo: '#C77A00',
        grad: ['#F5C400', '#F0B400', '#E6A000', '#D68800', '#BF6C00'],
    },
};

function favos(t) {
    const r = 22;
    const passoX = r * 1.5;
    const passoY = Math.sqrt(3) * r;
    const pontos = Array.from({ length: 6 }, (_, i) => {
        const a = (Math.PI / 3) * i;
        return `${(r * 0.92 * Math.cos(a)).toFixed(1)},${(r * 0.92 * Math.sin(a)).toFixed(1)}`;
    }).join(' ');
    const saida = [];
    for (let c = 0; c < 12; c++) {
        for (let l = -1; l < 7; l++) {
            const x = 560 + c * passoX;
            const y = l * passoY + (c % 2 ? passoY / 2 : 0);
            const op = Math.max(0, Math.min(1, (c - 1) / 8)) * 0.9;
            if (op <= 0) continue;
            saida.push(`<polygon points="${pontos}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)})" fill="none" stroke="${t.favo}" stroke-opacity="${(op * 0.22).toFixed(3)}" stroke-width="1"/>`);
        }
    }
    return saida.join('');
}

function banner(t) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 260" width="900" height="260" role="img" aria-label="Diogo Mello, fundador da Vynce Labs">
  <defs>
    <linearGradient id="mel" x1="0" y1="205" x2="0" y2="1000" gradientUnits="userSpaceOnUse">
      ${t.grad.map((c, i) => `<stop offset="${[0, 22, 48, 72, 100][i]}%" stop-color="${c}"/>`).join('')}
    </linearGradient>
    <clipPath id="borda"><rect width="900" height="260" rx="14"/></clipPath>
  </defs>
  <style>
    .nome { font-family: Georgia, 'Times New Roman', serif; font-size: 50px; fill: ${t.texto}; letter-spacing: -0.5px; }
    .rotulo { font-family: 'Segoe UI', -apple-system, 'Helvetica Neue', Arial, sans-serif; font-size: 12px; font-weight: 600; letter-spacing: 3px; fill: ${t.favo}; }
    .frase { font-family: 'Segoe UI', -apple-system, 'Helvetica Neue', Arial, sans-serif; font-size: 16px; fill: ${t.apagado}; }
  </style>
  <g clip-path="url(#borda)">
    <rect width="900" height="260" fill="${t.fundo}"/>
    ${favos(t)}
  </g>
  <g transform="translate(48 52) scale(0.19) translate(-360 -190)">
    <path d="${LOGO}" fill="url(#mel)" stroke="url(#mel)" fill-rule="evenodd"/>
  </g>
  <text x="170" y="78" class="rotulo">FUNDADOR DA VYNCE LABS</text>
  <text x="168" y="134" class="nome">Diogo Mello</text>
  <line x1="170" y1="158" x2="420" y2="158" stroke="${t.linha}" stroke-width="1"/>
  <text x="170" y="188" class="frase">Comece pequeno. Conecte. Evolua.</text>
</svg>`;
}

const saida = process.argv[2] || 'assets';
mkdirSync(saida, { recursive: true });
writeFileSync(`${saida}/banner-escuro.svg`, banner(TEMAS.escuro));
writeFileSync(`${saida}/banner-claro.svg`, banner(TEMAS.claro));
