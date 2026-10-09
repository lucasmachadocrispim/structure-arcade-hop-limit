/**
 * Geradores de configuração e composição de ramificações.
 * Corpos idênticos aos originais em src/main.js.
 */
import { pick, shuf, net, lastp, B, R, A } from './utils.js';
import { PORTS, ZK } from './constants.js';

export function gen(tp, p, fail, simple) {
  const pr = (p.proto || 'tcp').toLowerCase();
  const oth = (a, x) => pick(a.filter(v => v !== x));

  if (simple && tp === 'dns')
    return { lines: ['A ' + (fail ? net(p.dst) + '.' + (lastp(p.dst) + 1) : p.dst)], bad: fail ? 0 : -1 };
  if (simple && tp === 'vlan')
    return { lines: ['switchport access vlan ' + (fail ? pick([10,20,30,40,50].filter(v => v !== p.vlan)) : p.vlan)], bad: fail ? 0 : -1 };

  if (tp === 'acl') {
    const m = fail ? pick(['early','proto','port','dst','src']) : '';
    return {
      lines: [
        'access-list 100 deny ' + (m === 'early' ? pr : oth(['tcp','udp'], pr)) + ' any any eq ' + (m === 'early' ? p.dport : oth(PORTS, p.dport)),
        'access-list 100 permit ' + (m === 'proto' ? oth(['tcp','udp'], pr) : pr) + ' ' + (m === 'src' ? '10.9.9.0' : net(p.src) + '.0') + ' 0.0.0.255 host ' + (m === 'dst' ? net(p.dst) + '.' + (lastp(p.dst) + 1) : p.dst) + ' eq ' + (m === 'port' ? oth(PORTS, p.dport) : p.dport),
        'access-list 100 deny ip any any',
      ],
      bad: m === '' ? -1 : m === 'early' ? 0 : 2,
    };
  }

  if (tp === 'rota') {
    const m = fail ? pick(['shut','route']) : '';
    const dn = m === 'route' ? oth(['203.0.113','198.51.100','192.0.2'], net(p.dst)) : net(p.dst);
    return {
      lines: ['interface Gi0/1','ip address 10.0.0.1 255.255.255.0', m === 'shut' ? 'shutdown' : 'no shutdown','ip route ' + dn + '.0 255.255.255.0 10.0.0.254'],
      bad: m === 'shut' ? 2 : m === 'route' ? 3 : -1,
    };
  }

  if (tp === 'vlan') {
    const V = [10,20,30,40,50];
    const o = V.filter(v => v !== p.vlan);
    if (Math.random() < .5) {
      const l = fail ? shuf(o.slice()).slice(0, 3) : shuf(o.slice()).slice(0, 2).concat(p.vlan);
      return { lines: ['interface Gi0/1','switchport mode trunk','switchport trunk allowed vlan ' + l.sort((a,b) => a-b).join(',')], bad: fail ? 2 : -1 };
    }
    return { lines: ['interface Fa0/5','switchport mode access','switchport access vlan ' + (fail ? pick(o) : p.vlan)], bad: fail ? 2 : -1 };
  }

  if (tp === 'dns')
    return { lines: ['zone exemplo.com','A ' + (fail ? net(p.dst) + '.' + (lastp(p.dst) + 1) : p.dst),'ttl 300'], bad: fail ? 1 : -1 };

  return {
    lines: ['ip nat inside source list 10 interface Gi0/0 overload','access-list 10 permit ' + (fail ? '192.168.' + oth([1,2,10,3], +p.src.split('.')[2]) + '.0' : net(p.src) + '.0') + ' 0.0.0.255'],
    bad: fail ? 1 : -1,
  };
}

export function Kinf(d, st) {
  const n = Math.min(8, 3 + (d / 3 | 0));
  const o = [];
  while (o.length < n) {
    if (!st.bag.length) st.bag = shuf(ZK.flat());
    const c = st.bag.pop();
    if (!o.includes(c) && !(c === 'udp' && o.includes('tcp')) && !(c === 'tcp' && o.includes('udp'))) o.push(c);
  }
  return o;
}

export function Kfor(z, r) {
  const C = ZK[z - 1];
  const P = ZK.slice(0, z - 1).flat();
  const sub = (a, n) => shuf(a.slice()).slice(0, n);
  let K;
  if (z === 1) K = [[C[0]], [C[1]], [C[2]], [C[3]], sub(C, 3)][r - 1];
  else if (z < 5) {
    const rv = () => pick(P);
    K = [[C[0], rv()], [C[1], rv()], [C[2], C[0]], [C[3], C[1], rv()], sub(C.concat(sub(P, 2)), 3)][r - 1];
  } else K = [[C[0], C[1]], [C[2], C[3]], [C[4], C[5]], [C[6], C[7], C[8]], sub(C.concat(sub(P, 3)), 5)][r - 1];
  K = [...new Set(K)];
  if (K.includes('tcp') && K.includes('udp')) K = K.filter(k => k !== 'udp');
  return K;
}

export function compor(K, p, n, ok, HARD = 0, FT) {
  const devs = [];
  const tps = ['acl','rota','vlan','dns','nat','srv','gw'];
  let w = 0;
  for (let i = 0; i < n; i++) {
    let fl = [];
    if (i !== ok) {
      fl = [K[(w++) % K.length]];
      if (K.length >= 3 && Math.random() < .35 + HARD) fl.push(pick(K.filter(k => k !== fl[0])));
    }
    const lines = [], bad = [];
    K.forEach(k => {
      const f = fl.includes(k);
      const L = FT[k][4](p, f, t => '\u0001' + k + '\u0002' + t + '\u0003');
      const o = lines.length;
      L.forEach(l => lines.push(l));
      if (f) bad.push(o + (L.b !== undefined ? L.b : L.length - 1));
    });
    const tp = pick(tps);
    devs.push({ tp, label: '', lines, bad: bad.length ? bad : -1 });
  }
  return devs;
}