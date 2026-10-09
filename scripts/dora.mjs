/**
 * Calcula as 4 métricas DORA a partir dos dados do GitHub.
 * Uso: GH_TOKEN=... GITHUB_REPOSITORY=... node scripts/dora.mjs
 * Gera: reports/dora.json
 */
import { writeFileSync, mkdirSync } from 'node:fs';

const { GH_TOKEN, GITHUB_REPOSITORY } = process.env;
if (!GH_TOKEN || !GITHUB_REPOSITORY) {
  console.error('✗ defina GH_TOKEN e GITHUB_REPOSITORY');
  process.exit(1);
}

async function api(path) {
  const r = await fetch(`https://api.github.com${path}`, {
    headers: { Authorization: `Bearer ${GH_TOKEN}`, Accept: 'application/vnd.github+json' },
  });
  if (!r.ok) throw new Error(`${path} → ${r.status}`);
  return r.json();
}

async function listarRuns(nome) {
  const runs = [];
  for (let page = 1; page <= 3; page++) {
    const r = await api(`/repos/${GITHUB_REPOSITORY}/actions/workflows/${nome}/runs?per_page=100&page=${page}`);
    runs.push(...r.workflow_runs);
    if (r.workflow_runs.length < 100) break;
  }
  return runs;
}

async function listarAlertas() {
  return api(`/repos/${GITHUB_REPOSITORY}/issues?labels=alerta&state=all&per_page=100`);
}

const [deploys, alertas] = await Promise.all([
  listarRuns('esteira.yml'),
  listarAlertas(),
]);

const prd = deploys.filter(r => (r.name || '').includes('produção') && r.conclusion === 'success');
const hml = deploys.filter(r => (r.name || '').includes('homologação') && r.conclusion === 'success');

const agora = Date.now();
const janela = 30 * 24 * 3600 * 1000;

const freqDeploy = prd.filter(r => agora - new Date(r.created_at).getTime() < janela).length;

const leadTimeHoras = prd.length
  ? prd.slice(0, 20).reduce((acc, r) => {
      const c = new Date((r.head_commit && r.head_commit.timestamp) || r.created_at).getTime();
      const d = new Date(r.updated_at).getTime();
      return acc + (d - c) / 3600000;
    }, 0) / Math.min(prd.length, 20)
  : 0;

const taxaFalha = deploys.length
  ? deploys.filter(r => r.conclusion === 'failure').length / deploys.length
  : 0;

const fechadas = alertas.filter(a => a.closed_at);
const mttrHoras = fechadas.length
  ? fechadas.slice(0, 20).reduce((acc, a) =>
      acc + (new Date(a.closed_at).getTime() - new Date(a.created_at).getTime()) / 3600000, 0
    ) / Math.min(fechadas.length, 20)
  : 0;

const relatorio = {
  geradoEm: new Date().toISOString(),
  janelaDias: 30,
  frequenciaDeploy: freqDeploy,
  frequenciaDeployPorSemana: +(freqDeploy / (janela / (7 * 24 * 3600 * 1000))).toFixed(2),
  leadTimeHoras: +leadTimeHoras.toFixed(2),
  leadTimeDias: +(leadTimeHoras / 24).toFixed(2),
  taxaFalha: +(taxaFalha * 100).toFixed(1),
  mttrHoras: +mttrHoras.toFixed(2),
  deploysHml: hml.length,
  deploysPrd: prd.length,
  baselineCarparts: { leadTimeDias: 11 },
};

mkdirSync('reports', { recursive: true });
writeFileSync('reports/dora.json', JSON.stringify(relatorio, null, 2));
console.log(JSON.stringify(relatorio, null, 2));