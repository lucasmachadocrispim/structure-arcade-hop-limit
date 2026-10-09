/**
 * Funções utilitárias puras do HOP LIMIT.
 * Corpos idênticos às funções originais em src/main.js — nenhuma lógica foi alterada.
 */

/** Sorteia um elemento aleatório de um array. */
export const pick = a => a[Math.random() * a.length | 0];

/** Embaralha um array (in-place) e o retorna. */
export const shuf = a => a.sort(() => Math.random() - .5);

/** Retorna os 3 primeiros octetos de um IPv4 (a "rede"). */
export const net = i => i.split('.').slice(0, 3).join('.');

/** Retorna o último octeto de um IPv4 como número. */
export const lastp = i => +i.split('.')[3];

/**
 * Calcula a base de uma sub-rede de tamanho `s` que contém `x`.
 * Se `f` for verdadeiro, retorna a base da PRÓXIMA sub-rede (offset).
 */
export const B = (s, x, f) => {
  const b = Math.floor(x / s) * s;
  return f ? (b + s) % 256 : b;
};

/** Anexa `.b = índice` a um array (usado para marcar a linha que bloqueia). */
export const R = (a, b) => { a.b = b; return a; };

/** Sorteia um elemento diferente de `x`. */
export const A = (a, x) => pick(a.filter(v => v !== x));

/** Converte MAC `AA:BB:CC:...` para o formato Cisco `aabb.cc11.2233`. */
export const dm = m => m.replace(/:/g, '').toLowerCase().replace(/(....)(?=.)/g, '$1.');