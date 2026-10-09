import { describe, it, expect } from 'vitest';
import { pick, shuf, net, lastp, B, R, A, dm } from '../../src/core/utils.js';

describe('utils · pick', () => {
  it('retorna um elemento do array', () => {
    const arr = [1, 2, 3, 4, 5];
    const r = pick(arr);
    expect(arr).toContain(r);
  });
  it('array de um elemento devolve ele mesmo', () => {
    expect(pick(['x'])).toBe('x');
  });
});

describe('utils · shuf', () => {
  it('preserva os elementos (permutação)', () => {
    const orig = [1, 2, 3, 4, 5];
    const r = shuf([...orig]);
    expect(r.slice().sort((a, b) => a - b)).toEqual(orig);
  });
  it('não perde nem adiciona elementos', () => {
    const r = shuf([10, 20, 30]);
    expect(r.length).toBe(3);
  });
});

describe('utils · net', () => {
  it('extrai os 3 primeiros octetos', () => {
    expect(net('192.168.10.5')).toBe('192.168.10');
    expect(net('10.20.30.40')).toBe('10.20.30');
  });
});

describe('utils · lastp', () => {
  it('extrai o último octeto como número', () => {
    expect(lastp('192.168.10.5')).toBe(5);
    expect(lastp('10.0.0.255')).toBe(255);
  });
});

describe('utils · B (base de sub-rede)', () => {
  it('s=32 devolve a base da sub-rede que contém x', () => {
    expect(B(32, 130, false)).toBe(128);
    expect(B(32, 130, true)).toBe(160);
  });
  it('s=64 alinha em múltiplos de 64', () => {
    expect(B(64, 70, false)).toBe(64);
    expect(B(64, 200, false)).toBe(192);
  });
  it('rotação com módulo 256 quando f=true', () => {
    expect(B(32, 250, true)).toBe(0);
  });
});

describe('utils · R (marcar linha)', () => {
  it('anexa .b preservando o array', () => {
    const arr = ['a', 'b', 'c'];
    const r = R(arr, 1);
    expect(r).toBe(arr);
    expect(r.b).toBe(1);
  });
});

describe('utils · A (sorteia diferente)', () => {
  it('nunca devolve o valor excluído', () => {
    const arr = ['x', 'y', 'z'];
    for (let i = 0; i < 20; i++) expect(A(arr, 'x')).not.toBe('x');
  });
});

describe('utils · dm (MAC para formato Cisco)', () => {
  it('converte AA:BB:CC:11:22:33 → aabb.cc11.2233', () => {
    expect(dm('AA:BB:CC:11:22:33')).toBe('aabb.cc11.2233');
  });
});