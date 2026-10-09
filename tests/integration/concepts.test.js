import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ORD } from '../../src/core/constants.js';

const aqui = dirname(fileURLToPath(import.meta.url));
const caminho = resolve(aqui, '../../src/content/concepts.json');
const dados = JSON.parse(readFileSync(caminho, 'utf8'));

describe('concepts.json · integridade', () => {
  it('declara 25 conceitos', () => {
    expect(dados.conceitos).toHaveLength(25);
    expect(dados.total).toBe(25);
  });

  it('todo conceito tem id, nome, zona, preReqs', () => {
    dados.conceitos.forEach(c => {
      expect(c).toHaveProperty('id');
      expect(c).toHaveProperty('nome');
      expect(c).toHaveProperty('zona');
      expect(Array.isArray(c.preReqs)).toBe(true);
    });
  });

  it('IDs batem com o ORD do código', () => {
    const idsJson = dados.conceitos.map(c => c.id).sort();
    const idsOrd = [...ORD].sort();
    expect(idsJson).toEqual(idsOrd);
  });

  it('zona está entre 1 e 5', () => {
    dados.conceitos.forEach(c => {
      expect(c.zona).toBeGreaterThanOrEqual(1);
      expect(c.zona).toBeLessThanOrEqual(5);
    });
  });

  it('todo preReq existe no conjunto de conceitos', () => {
    const ids = new Set(dados.conceitos.map(c => c.id));
    dados.conceitos.forEach(c => {
      c.preReqs.forEach(p => expect(ids.has(p)).toBe(true));
    });
  });

  it('preReq de zona N aponta para zona < N', () => {
    const mapa = Object.fromEntries(dados.conceitos.map(c => [c.id, c.zona]));
    dados.conceitos.forEach(c => {
      c.preReqs.forEach(p => {
        expect(mapa[p]).toBeLessThan(c.zona);
      });
    });
  });

  it('não há IDs duplicados', () => {
    const ids = dados.conceitos.map(c => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('todo conceito da zona 1 não tem preReqs', () => {
    dados.conceitos.filter(c => c.zona === 1).forEach(c => {
      expect(c.preReqs).toEqual([]);
    });
  });
});