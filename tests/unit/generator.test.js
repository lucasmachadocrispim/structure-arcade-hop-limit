import { describe, it, expect, vi } from 'vitest';
import { gen, Kfor, Kinf } from '../../src/core/generator.js';
import { ZK } from '../../src/core/constants.js';

const pacoteBase = () => ({
  proto: 'tcp',
  src: '192.168.10.5',
  dst: '203.0.113.7',
  dport: 443,
  vlan: 20,
  tag: 20,
});

describe('generator · gen', () => {
  it('acl com falha marca bad entre 0 e 2', () => {
    for (let i = 0; i < 40; i++) {
      const r = gen('acl', pacoteBase(), true);
      expect(r.bad).toBeGreaterThanOrEqual(0);
      expect(r.bad).toBeLessThanOrEqual(2);
      expect(r.lines).toHaveLength(3);
    }
  });

  it('acl sem falha devolve bad=-1', () => {
    const r = gen('acl', pacoteBase(), false);
    expect(r.bad).toBe(-1);
    expect(r.lines).toHaveLength(3);
  });

  it('rota com falha tem bad válido', () => {
    for (let i = 0; i < 20; i++) {
      const r = gen('rota', pacoteBase(), true);
      expect(r.bad).toBeGreaterThanOrEqual(0);
      expect(r.bad).toBeLessThan(r.lines.length);
    }
  });

  it('dns simples com falha usa IP da rede + 1 no último octeto', () => {
    const p = { ...pacoteBase(), dst: '203.0.113.7' };
    const r = gen('dns', p, true, true);
    expect(r.bad).toBe(0);
    expect(r.lines[0]).toMatch(/^A 203\.0\.113\.8$/);
  });

  it('dns simples sem falha devolve o IP correto', () => {
    const p = { ...pacoteBase(), dst: '203.0.113.7' };
    const r = gen('dns', p, false, true);
    expect(r.bad).toBe(-1);
    expect(r.lines[0]).toBe('A 203.0.113.7');
  });

  it('vlan gera config access quando o sorteio cai em access', () => {
    // Math.random >= 0.5 força o ramo "access"
    const spy = vi.spyOn(Math, 'random').mockReturnValue(0.9);
    const r = gen('vlan', pacoteBase(), false);
    spy.mockRestore();
    expect(r.lines.some(l => l.startsWith('switchport access vlan'))).toBe(true);
    expect(r.bad).toBe(-1);
  });

  it('vlan gera config trunk quando o sorteio cai em trunk', () => {
    // Math.random < 0.5 força o ramo "trunk"
    const spy = vi.spyOn(Math, 'random').mockReturnValue(0.1);
    const r = gen('vlan', pacoteBase(), false);
    spy.mockRestore();
    expect(r.lines.some(l => l.startsWith('switchport trunk allowed vlan'))).toBe(true);
    expect(r.bad).toBe(-1);
  });

  it('vlan sempre devolve 3 linhas (access ou trunk)', () => {
    for (let i = 0; i < 30; i++) {
      const r = gen('vlan', pacoteBase(), false);
      expect(r.lines).toHaveLength(3);
    }
  });

  it('nat com falha marca bad=1', () => {
    const r = gen('nat', pacoteBase(), true);
    expect(r.bad).toBe(1);
  });

  it('nat sem falha marca bad=-1', () => {
    const r = gen('nat', pacoteBase(), false);
    expect(r.bad).toBe(-1);
  });
});

describe('generator · Kfor', () => {
  it('zona 1 ramo 1 devolve [ip]', () => {
    expect(Kfor(1, 1)).toEqual(['ip']);
  });

  it('nunca devolve tcp e udp juntos', () => {
    for (let z = 1; z <= 5; z++) {
      for (let r = 1; r <= 5; r++) {
        const k = Kfor(z, r);
        const temTcp = k.includes('tcp');
        const temUdp = k.includes('udp');
        expect(temTcp && temUdp).toBe(false);
      }
    }
  });

  it('nunca devolve duplicatas', () => {
    for (let z = 1; z <= 5; z++) {
      for (let r = 1; r <= 5; r++) {
        const k = Kfor(z, r);
        expect(new Set(k).size).toBe(k.length);
      }
    }
  });

  it('sempre devolve ao menos 1 conceito', () => {
    for (let z = 1; z <= 5; z++) {
      for (let r = 1; r <= 5; r++) {
        expect(Kfor(z, r).length).toBeGreaterThanOrEqual(1);
      }
    }
  });
});

describe('generator · Kinf', () => {
  it('cresce com a distância', () => {
    const k0 = Kinf(0, { bag: [] });
    const k20 = Kinf(20, { bag: [] });
    expect(k20.length).toBeGreaterThanOrEqual(k0.length);
  });

  it('nunca passa de 8 conceitos', () => {
    for (let d = 0; d < 200; d += 10) {
      const k = Kinf(d, { bag: [] });
      expect(k.length).toBeLessThanOrEqual(8);
    }
  });

  it('não repete conceito', () => {
    const k = Kinf(50, { bag: [] });
    expect(new Set(k).size).toBe(k.length);
  });
});

describe('generator · ZK (estrutura de zonas)', () => {
  it('tem exatamente 5 zonas', () => {
    expect(ZK).toHaveLength(5);
  });
  it('zona 1 tem 4 conceitos', () => {
    expect(ZK[0]).toHaveLength(4);
  });
  it('zona 5 tem 9 conceitos', () => {
    expect(ZK[4]).toHaveLength(9);
  });
});