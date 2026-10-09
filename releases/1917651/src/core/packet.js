/**
 * Geração de pacotes aleatórios.
 * Corpo idêntico ao original em src/main.js.
 */
import { pick } from './utils.js';
import { PORTS } from './constants.js';

export function novoPacote() {
  const o = pick;
  const L = n => '192.168.' + n + '.';
  const h = () => o([130, 70, 200, 170, 100]);
  const hx = () => 'AA:BB:CC:11:' + o(['22','2A','4F']) + ':' + o(['33','7B','C0']);
  const dn = o(['203.0.113', '198.51.100']);
  const ten = () => '10.' + o([20,30,40]) + '.' + o([30,60,90]) + '.';
  return {
    id:'PKT-' + (Math.random() * 900 + 100 | 0),
    src:L(10) + h(),
    dport:o(PORTS),
    flag:o(['SYN','ACK']),
    up:o([53,123,161]),
    mip:L(20) + h(),
    cip:L(30) + h(),
    cpre:o([24,26,28]),
    gs:L(10) + h(),
    gd:o(['8.8.8.8','1.1.1.1','9.9.9.9']),
    bc:o([127,63,31]),
    ap:o([80,443,22,25]),
    nsrc:L(o([1,2,3])) + '5',
    sp:o([49152,50500,55000,60000]),
    q:o(['www','api','mail']) + '.exemplo.' + o(['com','net']),
    mac:hx(),
    vlan:o([10,20,30,40]),
    tag:o([10,20,30,40]),
    dip:L(10) + h(),
    o:ten() + o([40,55,200]),
    rd:ten() + o([40,55]),
    rif:o(['Gi0/1','Gi0/2']),
    bd:dn + '.' + o([5,37,100]),
    asn:o([1,2,3]) * 65536 + o([4,6,10]),
    vd:'10.50.' + o([0,3,7]) + '.' + o([1,9]),
    alg:o(['aes 256','aes 128','3des']),
    tv:o(['1.2','1.3']),
    dscp:o(['EF','AF41','AF21']),
    tt:o([3,4,5,6]),
    it:o([8,0,11]),
  };
}