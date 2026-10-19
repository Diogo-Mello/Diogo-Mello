import { mkdirSync, writeFileSync } from 'node:fs';

const usuario = process.env.USUARIO || 'Diogo-Mello';
const token = process.env.GITHUB_TOKEN;
const saida = process.env.SAIDA || 'dist';

const consulta = `query($login: String!) {
  user(login: $login) {
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks { contributionDays { date contributionCount contributionLevel } }
      }
    }
  }
}`;

async function buscarCalendario() {
    const resposta = await fetch('https://api.github.com/graphql', {
        method: 'POST',
        headers: { Authorization: `bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: consulta, variables: { login: usuario } }),
    });
    const json = await resposta.json();
    if (!json.data?.user) throw new Error(JSON.stringify(json.errors || json));
    return json.data.user.contributionsCollection.contributionCalendar;
}

const NIVEIS = { NONE: 0, FIRST_QUARTILE: 1, SECOND_QUARTILE: 2, THIRD_QUARTILE: 3, FOURTH_QUARTILE: 4 };
const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

const TEMAS = {
    escuro: {
        fundo: '#0B0B0C',
        cera: '#1A1814',
        borda: '#2A261E',
        texto: '#F3EBD8',
        apagado: '#8C8270',
        mel: ['', '#5A4100', '#9A6B00', '#E6A000', '#FFD000'],
        brilho: '#FFF2A8',
        corpo: '#FFD000',
        listra: '#14110B',
        asa: '#FFFFFF',
    },
    claro: {
        fundo: '#FFFBF0',
        cera: '#F4ECD8',
        borda: '#E6DAB8',
        texto: '#1C1A15',
        apagado: '#7A6F57',
        mel: ['', '#FBE7A1', '#F7CF4B', '#E9A800', '#C77A00'],
        brilho: '#FFFFFF',
        corpo: '#F0B400',
        listra: '#1C1A15',
        asa: '#FFFFFF',
    },
};

const R = 10.5;
const PASSO_X = R * 1.5;
const PASSO_Y = Math.sqrt(3) * R;
const MARGEM_X = 30;
const TOPO = 78;

function hexagono(raio) {
    const pontos = [];
    for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i;
        pontos.push(`${(raio * Math.cos(a)).toFixed(2)},${(raio * Math.sin(a)).toFixed(2)}`);
    }
    return pontos.join(' ');
}

function centro(coluna, linha) {
    return {
        x: MARGEM_X + R + coluna * PASSO_X,
        y: TOPO + PASSO_Y / 2 + linha * PASSO_Y + (coluna % 2 ? PASSO_Y / 2 : 0),
    };
}

const fmt = (n) => +n.toFixed(4);

function abelha(t) {
    return `<g id="abelha" transform="scale(1.3)">
      <g>
        <animateTransform attributeName="transform" type="translate" values="0,0;0,-2.2;0,0" dur="0.6s" repeatCount="indefinite"/>
        <ellipse cx="-2" cy="-7" rx="5" ry="7" fill="${t.asa}" fill-opacity="0.55" transform="rotate(-25 -2 -7)">
          <animate attributeName="ry" values="7;3;7" dur="0.12s" repeatCount="indefinite"/>
        </ellipse>
        <ellipse cx="3" cy="-7" rx="4" ry="6" fill="${t.asa}" fill-opacity="0.45" transform="rotate(20 3 -7)">
          <animate attributeName="ry" values="6;2.5;6" dur="0.12s" repeatCount="indefinite"/>
        </ellipse>
        <path d="M-12 0 L-16 0.8 L-12 1.6 Z" fill="${t.listra}"/>
        <ellipse cx="-2" cy="0.8" rx="10" ry="6.5" fill="${t.corpo}" stroke="${t.listra}" stroke-width="1"/>
        <path d="M-6 -5.3 Q-4.5 0.8 -6 6.9 M-1 -6.2 Q0.5 0.8 -1 7.8" stroke="${t.listra}" stroke-width="2.4" fill="none"/>
        <circle cx="9" cy="0" r="4.6" fill="${t.listra}"/>
        <circle cx="10.6" cy="-1.2" r="1.2" fill="${t.corpo}"/>
        <path d="M10 -4 Q12 -9 15 -9.5 M8 -4.2 Q8.5 -9.5 11 -11" stroke="${t.listra}" stroke-width="1" fill="none" stroke-linecap="round"/>
      </g>
    </g>`;
}

function desenhar(calendario, t) {
    const semanas = calendario.weeks;
    const largura = Math.ceil(MARGEM_X * 2 + R * 2 + (semanas.length - 1) * PASSO_X);
    const altura = Math.ceil(TOPO + PASSO_Y * 7.5 + 46);

    const celulas = [];
    const meses = [];
    let mesAnterior = -1;
    semanas.forEach((semana, coluna) => {
        semana.contributionDays.forEach((dia) => {
            const linha = new Date(dia.date + 'T12:00:00Z').getUTCDay();
            celulas.push({ ...dia, coluna, linha, nivel: NIVEIS[dia.contributionLevel] ?? 0, ...centro(coluna, linha) });
        });
        const mes = new Date(semana.contributionDays[0].date + 'T12:00:00Z').getUTCMonth();
        if (mes !== mesAnterior && coluna < semanas.length - 2) {
            if (mesAnterior !== -1 || semana.contributionDays.length === 7) meses.push({ coluna, nome: MESES[mes] });
            mesAnterior = mes;
        }
    });

    const visitas = celulas.filter((c) => c.nivel > 0);
    const maior = visitas.reduce((m, c) => (c.contributionCount > (m?.contributionCount ?? -1) ? c : m), null);

    const duracao = Math.min(42, Math.max(14, visitas.length * 0.16));
    const inicioVoo = 0.03;
    const fimVoo = 0.84;
    const largada = { x: -30, y: TOPO + PASSO_Y * 3.5 };
    const chegada = { x: largura + 30, y: TOPO + PASSO_Y * 3.5 };
    const rota = [largada, ...visitas, chegada];
    const trechos = rota.slice(1).map((p, i) => Math.max(18, Math.hypot(p.x - rota[i].x, p.y - rota[i].y)) + 26);
    const total = trechos.reduce((a, b) => a + b, 0);

    const tempos = [inicioVoo];
    let acumulado = 0;
    for (const trecho of trechos) {
        acumulado += trecho;
        tempos.push(inicioVoo + (fimVoo - inicioVoo) * (acumulado / total));
    }
    tempos[tempos.length - 1] = fimVoo + 0.04;

    const kt = ['0'];
    const vals = [`${largada.x},${largada.y}`];
    rota.forEach((p, i) => {
        const tempo = tempos[i];
        const pouso = Math.min(tempo + 0.004, (tempos[i + 1] ?? 1) - 0.0005);
        kt.push(fmt(tempo));
        vals.push(`${fmt(p.x)},${fmt(p.y - 3)}`);
        if (i > 0 && i < rota.length - 1) {
            kt.push(fmt(pouso));
            vals.push(`${fmt(p.x)},${fmt(p.y - 3)}`);
        }
    });
    kt.push('1');
    vals.push(`${chegada.x},${chegada.y}`);

    const favos = celulas
        .map((c) => `<polygon points="${hexagono(R * 0.9)}" transform="translate(${fmt(c.x)} ${fmt(c.y)})" fill="${t.cera}" stroke="${t.borda}" stroke-width="1"/>`)
        .join('');

    const mel = visitas
        .map((c, i) => {
            const chega = tempos[i + 1];
            const a = fmt(Math.max(chega - 0.0001, 0.0001));
            const b = fmt(chega + 0.012);
            const d = fmt(chega + 0.022);
            const real = c === maior;
            const titulo = `<title>${c.date}: ${c.contributionCount} ${c.contributionCount === 1 ? 'contribuição' : 'contribuições'}</title>`;
            const anel = real
                ? `<polygon points="${hexagono(R * 0.9)}" fill="none" stroke="${t.mel[4]}" stroke-width="1.6" opacity="0">
            <animate attributeName="opacity" values="0;0;1;0;0" keyTimes="0;${a};${b};${fmt(chega + 0.08)};1" dur="${duracao}s" repeatCount="indefinite"/>
            <animateTransform attributeName="transform" type="scale" values="1;1;1;2.4;2.4" keyTimes="0;${a};${b};${fmt(chega + 0.08)};1" dur="${duracao}s" repeatCount="indefinite"/>
          </polygon>`
                : '';
            return `<g transform="translate(${fmt(c.x)} ${fmt(c.y)})">${titulo}
          <polygon points="${hexagono(R * 0.9)}" fill="${t.mel[c.nivel]}" transform="scale(0)">
            <animateTransform attributeName="transform" type="scale" values="0;0;1.18;1;1;0" keyTimes="0;${a};${b};${d};0.965;1" dur="${duracao}s" repeatCount="indefinite"/>
          </polygon>
          ${c.nivel >= 3 ? `<path d="M${-R * 0.42} ${-R * 0.35} Q0 ${-R * 0.62} ${R * 0.42} ${-R * 0.35}" stroke="${t.brilho}" stroke-opacity="0.5" stroke-width="1.4" fill="none" stroke-linecap="round" opacity="0">
            <animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;${b};${d};0.965;1" dur="${duracao}s" repeatCount="indefinite"/>
          </path>` : ''}${anel}
        </g>`;
        })
        .join('');

    const rotulosMes = meses
        .map((m) => `<text x="${fmt(MARGEM_X + R + m.coluna * PASSO_X - R * 0.6)}" y="${TOPO - 8}" class="mes">${m.nome}</text>`)
        .join('');

    const legendaX = largura - MARGEM_X - 5 * 26 - 60;
    const legendaY = altura - 22;
    const legenda = [0, 1, 2, 3, 4]
        .map((n, i) => `<polygon points="${hexagono(7)}" transform="translate(${legendaX + 58 + i * 20} ${legendaY - 4})" fill="${n ? t.mel[n] : t.cera}" stroke="${t.borda}" stroke-width="1"/>`)
        .join('');

    const plural = calendario.totalContributions === 1 ? 'contribuição' : 'contribuições';

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${largura} ${altura}" width="${largura}" height="${altura}" role="img" aria-label="Colmeia de commits de ${usuario}: ${calendario.totalContributions} ${plural} no último ano">
  <style>
    text { font-family: 'Segoe UI', -apple-system, 'Helvetica Neue', Arial, sans-serif; }
    .titulo { fill: ${t.texto}; font-size: 15px; font-weight: 700; letter-spacing: 0.4px; }
    .sub { fill: ${t.apagado}; font-size: 12px; }
    .mes { fill: ${t.apagado}; font-size: 10.5px; }
    .numero { fill: ${t.mel[4]}; font-weight: 700; }
  </style>
  <rect width="100%" height="100%" rx="14" fill="${t.fundo}"/>
  <text x="${MARGEM_X}" y="34" class="titulo">COLMEIA DE COMMITS</text>
  <text x="${MARGEM_X}" y="54" class="sub">cada favo é um dia. a abelha passa recolhendo o que eu fiz e enche de mel.</text>
  <text x="${largura - MARGEM_X}" y="34" text-anchor="end" class="sub"><tspan class="numero">${calendario.totalContributions}</tspan> ${plural} no último ano</text>
  ${rotulosMes}
  ${favos}
  ${mel}
  <text x="${MARGEM_X}" y="${legendaY}" class="sub">${visitas.length} dias com mel</text>
  <text x="${legendaX}" y="${legendaY}" class="sub">menos</text>
  ${legenda}
  <text x="${legendaX + 58 + 5 * 20 - 2}" y="${legendaY}" class="sub">mais</text>
  <g>
    <animateTransform attributeName="transform" type="translate" values="${vals.join(';')}" keyTimes="${kt.join(';')}" dur="${duracao}s" repeatCount="indefinite"/>
    ${abelha(t)}
  </g>
</svg>`;
}

const calendario = await buscarCalendario();
mkdirSync(saida, { recursive: true });
writeFileSync(`${saida}/colmeia-escura.svg`, desenhar(calendario, TEMAS.escuro));
writeFileSync(`${saida}/colmeia-clara.svg`, desenhar(calendario, TEMAS.claro));
console.log(`colmeia gerada: ${calendario.totalContributions} contribuições`);
