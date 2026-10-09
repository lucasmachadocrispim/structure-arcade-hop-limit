import { describe, it, expect } from 'vitest';
import { ORD, PORTS, PNM, NM, ZK, ZB, ZC, PALS } from '../../src/core/constants.js';

describe('constants · ORD', () => {
  it('tem 25 conceitos', () => expect(ORD).toHaveLength(25));
  it('começa com ip', () => expect(ORD[0]).toBe('ip'));
  it('não tem duplicatas', () => expect(new Set(ORD).size).toBe(ORD.length));
  it('termina com qos', () => expect(ORD[ORD.length - 1]).toBe('qos'));
});

describe('constants · PORTS', () => {
  it('contém 80 e 443', () => {
    expect(PORTS).toContain(80);
    expect(PORTS).toContain(443);
  });
  it('contém 22, 53 e 25', () => {
    expect(PORTS).toContain(22);
    expect(PORTS).toContain(53);
    expect(PORTS).toContain(25);
  });
});

describe('constants · PNM', () => {
  it('mapeia 80 para www e 443 para https', () => {
    expect(PNM[80]).toBe('www');
    expect(PNM[443]).toBe('https');
  });
  it('mapeia 22 para ssh e 53 para domain', () => {
    expect(PNM[22]).toBe('ssh');
    expect(PNM[53]).toBe('domain');
  });
});

describe('constants · NM', () => {
  it('tem entrada para todos os tipos de dispositivo usados', () => {
    ['srv', 'gw', 'acl', 'rota', 'vlan', 'dns', 'nat'].forEach(k => expect(NM[k]).toBeTruthy());
  });
});

describe('constants · ZK', () => {
  it('cobertura total do ORD', () => {
    const flat = ZK.flat();
    ORD.forEach(c => expect(flat).toContain(c));
  });
});

describe('constants · ZB / ZC / PALS', () => {
  it('ZB tem 5 cores de fundo', () => expect(ZB).toHaveLength(5));
  it('ZC tem 5 paletas de 3 camadas', () => {
    expect(ZC).toHaveLength(5);
    ZC.forEach(z => expect(z).toHaveLength(3));
  });
  it('PALS tem 10 cores de pacote', () => expect(PALS).toHaveLength(10));
  it('primeira PALS é papelão', () => expect(PALS[0].n).toBe('Papelão'));
  it('cada PALS tem campo f (cor de face)', () => {
    PALS.forEach(p => expect(typeof p.f).toBe('number'));
  });
});