/**
 * Constantes do HOP LIMIT.
 * Valores idênticos aos originais em src/main.js.
 */

/** Ordem oficial dos conceitos no Codex. */
export const ORD = [
  'ip','porta','tcp','udp','mac','mask','cidr','gw','bcast','dhcp','acl','nat','pat',
  'dns','icmp','vlan','trunk','rota','ospf','ttl','bgp','as','vpn','tls','qos',
];

/** Portas de serviço usadas para gerar pacotes e regras. */
export const PORTS = [80, 443, 22, 53, 8080, 25, 3389];

/** Mapeamento porta → nome de serviço (para regras "eq <nome>"). */
export const PNM = { 80:'www', 443:'https', 22:'ssh', 53:'domain', 25:'smtp' };

/** Nome amigável de cada tipo de dispositivo. */
export const NM = {
  srv:'SERVIDOR', gw:'GATEWAY', acl:'FIREWALL', rota:'ROTEADOR',
  vlan:'SWITCH', dns:'DNS', nat:'NAT',
};

/** Conceitos pré-requisitos por zona (usado em Kfor). */
export const ZK = [
  ['ip','porta','tcp','udp'],
  ['mask','cidr','gw','bcast'],
  ['acl','nat','pat','dns'],
  ['mac','vlan','trunk','dhcp'],
  ['ospf','rota','bgp','as','vpn','tls','qos','ttl','icmp'],
];

/** Cores de fundo por zona. */
export const ZB = [0x12121A, 0x10201E, 0x1E1428, 0x241A10, 0x2A1216];

/** Paleta das camadas de parallax por zona. */
export const ZC = [
  [0x1E1E2A, 0x2E2E3E, 0x3A3A4E],
  [0x1B3A34, 0x2A5A4E, 0x3F8070],
  [0x3A2A52, 0x55407A, 0x7A5AA8],
  [0x4A3418, 0x7A5628, 0xB07C38],
  [0x4A1E24, 0x7A2E38, 0xB04555],
];

/** Paleta de cores do pacote (papelão + 9 variantes). */
export const PALS = [
  ['Papelão', 0xC98F4F], ['Azul', 0x4F8FD9], ['Verde', 0x5FB070], ['Vermelho', 0xD64545],
  ['Roxo', 0x9A6BD0], ['Rosa', 0xE58FB0], ['Laranja', 0xE8892F], ['Ciano', 0x4FC3CF],
  ['Amarelo', 0xE8C84B], ['Grafite', 0x6A6A7A],
].map(([n, c], i) => {
  if (!i) return { n, f:c, t:0xE0B070, s:0x8E5F2A, o:0x5A3C18, k:0xF2E8D5 };
  const mk = (p, l) => {
    const q = Phaser.Display.Color.IntegerToColor(c);
    return (l ? q.lighten(p) : q.darken(p)).color;
  };
  const q = Phaser.Display.Color.IntegerToColor(c);
  return {
    n, f:c, t:mk(22,1), s:mk(30,0), o:mk(55,0),
    k:(.299*q.red + .587*q.green + .114*q.blue)/255 > .62 ? 0x3A3A4E : 0xF2E8D5,
  };
});