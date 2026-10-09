import { describe, it, expect } from 'vitest';
import { novoPacote } from '../../src/core/packet.js';
import { PORTS } from '../../src/core/constants.js';

describe('packet · novoPacote', () => {
  it('gera um objeto com todos os campos esperados', () => {
    const p = novoPacote();
    const campos = [
      'id','src','dport','flag','up','mip','cip','cpre','gs','gd','bc','ap','nsrc','sp',
      'q','mac','vlan','tag','dip','o','rd','rif','bd','asn','vd','alg','tv','dscp','tt','it',
    ];
    campos.forEach(c => expect(p).toHaveProperty(c));
  });

  it('id segue o formato PKT-###', () => {
    for (let i = 0; i < 20; i++) {
      expect(novoPacote().id).toMatch(/^PKT-\d{3}$/);
    }
  });

  it('src é IP válido na faixa 192.168.10.x', () => {
    for (let i = 0; i < 20; i++) {
      expect(novoPacote().src).toMatch(/^192\.168\.10\.\d{1,3}$/);
    }
  });

  it('dport pertence ao conjunto de portas conhecidas', () => {
    for (let i = 0; i < 30; i++) {
      expect(PORTS).toContain(novoPacote().dport);
    }
  });

  it('flag é SYN ou ACK', () => {
    for (let i = 0; i < 20; i++) {
      expect(['SYN', 'ACK']).toContain(novoPacote().flag);
    }
  });

  it('mac segue o formato AA:BB:CC:11:XX:YY', () => {
    for (let i = 0; i < 20; i++) {
      expect(novoPacote().mac).toMatch(/^AA:BB:CC:11:[0-9A-F]{2}:[0-9A-F]{2}$/);
    }
  });

  it('vlan e tag pertencem ao conjunto {10,20,30,40}', () => {
    for (let i = 0; i < 30; i++) {
      const p = novoPacote();
      expect([10, 20, 30, 40]).toContain(p.vlan);
      expect([10, 20, 30, 40]).toContain(p.tag);
    }
  });

  it('asn é um inteiro positivo (ASN de 4 bytes)', () => {
    for (let i = 0; i < 20; i++) {
      const asn = novoPacote().asn;
      expect(Number.isInteger(asn)).toBe(true);
      expect(asn).toBeGreaterThan(0);
    }
  });
});