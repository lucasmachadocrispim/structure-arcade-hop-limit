const TX = '#F2E8D5', AM = 0xE8B44B, OK = 0x6BBF59, ER = 0xD64545, PN = 0x1E1E2A, LN = 0x2E2E3E, CY = 0x5FB8C8;
const D = { FUNDO: 0, CIRC: 5, CABOS: 10, DISP: 20, RASTRO: 25, PAC: 30, CFG: 40, BYTO: 1900, BALAO: 1950, FOCO: 1800, HUD: 100, BTN: 1000, POPUP: 2000 };
const F = 'Arial Black, Arial, sans-serif', M = 'Courier New, monospace';
const pick = a => a[Math.random() * a.length | 0], shuf = a => a.sort(() => Math.random() - .5);
const txt = (s, x, y, t, o = {}) => s.add.text(x, y, t, Object.assign({ fontFamily: F, fontSize: '20px', color: TX }, o));
const defs = { cor: 0, conceitos: ['ip'], faseMaxima: 1, tutorialFeito: false, som: true, musica: true, modoTempo: true, ajuda: true, guia: true, venceu: false, recorde: 0 };
function carregar() { try { const o = Object.assign({}, defs, JSON.parse(localStorage.getItem('hoplimit_save')) || {}); if (o.v != 2) { o.modoTempo = true; o.v = 2 } return o } catch (e) { return Object.assign({}, defs) } }
function salvar() { try { localStorage.setItem('hoplimit_save', JSON.stringify(save)) } catch (e) { console.warn('save falhou', e) } }
let save = carregar(), actx = null, cur = [];
/* ---------- áudio ---------- */
let master, sfxB, AV = 0; const lastS = {};
/* barramentos: sfx e música -> master -> compressor; limite de vozes e anti-clique */
function initAudio() { try { if (!actx) { actx = new (window.AudioContext || window.webkitAudioContext)(); master = actx.createGain(); master.gain.value = .7; const cp = actx.createDynamicsCompressor(); cp.threshold.value = -20; cp.ratio.value = 8; cp.attack.value = .003; cp.release.value = .2; master.connect(cp); cp.connect(actx.destination); sfxB = actx.createGain(); sfxB.gain.value = .9; sfxB.connect(master); document.addEventListener('visibilitychange', () => { if (!document.hidden && actx.state == 'suspended') actx.resume() }) } if (actx.state == 'suspended') actx.resume(); musica() } catch (e) { } }
function tone(f, d = .1, t = 'square', v = .12, at = 0, out) {
    if (!actx) return; const mu = out && out === mus.g; if (mu ? !save.musica : !save.som) return; if (!mu && AV > 24) return;
    const o = actx.createOscillator(), g = actx.createGain(), s = actx.currentTime + at; o.type = t; o.frequency.value = f; g.gain.setValueAtTime(.0001, s); g.gain.linearRampToValueAtTime(v, s + .004); g.gain.exponentialRampToValueAtTime(.0001, s + d); o.connect(g); g.connect(mu ? out : sfxB); o.start(s); o.stop(s + d + .02); if (!mu) { AV++; o.onended = () => AV-- }
}
function sweep(a, b, d, t = 'sine', v = .08) { if (!actx || !save.som || AV > 24) return; const o = actx.createOscillator(), g = actx.createGain(), s = actx.currentTime; o.type = t; o.frequency.setValueAtTime(a, s); o.frequency.exponentialRampToValueAtTime(b, s + d); g.gain.setValueAtTime(.0001, s); g.gain.linearRampToValueAtTime(v, s + .005); g.gain.exponentialRampToValueAtTime(.0001, s + d); o.connect(g); g.connect(sfxB); o.start(s); o.stop(s + d + .02); AV++; o.onended = () => AV-- }
const fire = { s: null, g: null, f: null };
const sfx = { fan() { [0, 4, 7, 12, 7, 12, 16, 19].forEach((k, i) => tone(392 * 2 ** (k / 12), .25, 'triangle', .12, i * .14)) }, boom() { sweep(260, 35, .7, 'sawtooth', .22); sweep(120, 30, .9, 'square', .15) }, tick() { tone(1000, .03, 'square', .05) }, sel() { tone(520, .08, 'triangle', .1) }, pop() { sweep(200, 500, .12, 'triangle', .07) }, move() { sweep(300, 700, .3, 'triangle', .06) }, stop() { sweep(700, 200, .3, 'triangle', .06) }, whoosh() { sweep(150, 2200, .8, 'sawtooth', .07) }, chg() { tone(1500, .05, 'square', .06); tone(1800, .05, 'square', .06, .06) }, ok() { tone(880, .15, 'triangle'); tone(1320, .2, 'triangle', .12, .12) }, err() { tone(110, .4, 'sawtooth', .2) }, up() { [0, 2, 4, 5, 7].forEach((n, i) => tone(440 * 2 ** (n / 12), .1, 'triangle', .1, i * .07)) }, shop() { tone(1200, .08, 'square', .1); tone(1600, .15, 'square', .1, .08) }, byto(n = 3) { for (let i = 0; i < n; i++)tone(600 + Math.random() * 300, .1, 'square', .08, i * .11) } };
/* intervalo mínimo por som e "ducking": a música abaixa quando um som grande toca */
const duck = () => { if (!mus.d) return; const t = actx.currentTime, g = mus.d.gain; g.cancelScheduledValues(t); g.setTargetAtTime(.2, t, .02); g.setTargetAtTime(.55, t + .5, .15) };
Object.keys(sfx).forEach(n => { const f = sfx[n]; sfx[n] = (...a) => { const t = performance.now(); if (t - (lastS[n] || 0) < (n == 'tick' ? 90 : 70)) return; lastS[n] = t; if (['ok', 'err', 'boom', 'fan', 'up', 'whoosh'].includes(n)) duck(); f(...a) } });
const mus = { sp: 260, b: 260, z: 0, v: 'menu', t: null, g: null, i: 0 }, SC = [220, 261.6, 329.6, 392, 329.6, 261.6, 196, 246.9], SM = [196, 233, 262, 311, 262, 233, 175, 208], SD = [220, 208, 196, 175, 165, 175, 196, 208], SW = [262, 330, 392, 523, 659, 523, 392, 330];
const BASE = { menu: 430, calm: 430, tense: 136, epic: 231, sad: 700, win: 200 }, MINI = { menu: .4, calm: .4, tense: .115, epic: .2, sad: .6, win: .18 }, MOT = [0, 3, 7, 11, 10, 7, 3, 2], MW = [0, 2, 4, 7, 9, 7, 4, 2], nt = (k, r, m = MOT) => r * 2 ** ((m[k % 8] + (Math.floor(k / 8) % 3 == 2 && k % 8 == 7 ? 12 : 0)) / 12);
/* tema de 8 notas em todas as variações; notas agendadas pelo relógio do áudio (sem atrasos nem acúmulo) */
function musica() {
    if (!actx || mus.t) return; mus.t = 1; mus.g = actx.createGain(); mus.d = actx.createGain(); mus.d.gain.value = .55; mus.g.connect(mus.d); mus.d.connect(master);
    const dl = actx.createDelay(.5); dl.delayTime.value = .17; const fb = actx.createGain(); fb.gain.value = .4, wet = actx.createGain(); wet.gain.value = 0; mus.d.connect(dl); dl.connect(fb); fb.connect(dl); dl.connect(wet); wet.connect(master); mus.wet = wet;
    const hm = actx.createGain(); hm.gain.value = .012; hm.connect(master); mus.ho = [60, 120].map(fq => { const o = actx.createOscillator(); o.frequency.value = fq; o.connect(hm); o.start(); return o }); mus.h = hm;
    const ck = () => { if (save.som && mus.v != 'menu') tone(1500 + Math.random() * 1200, .012, 'square', .025); setTimeout(ck, 3000 + Math.random() * 5000) }; ck();
    const step = A0 => {
        mus.h.gain.value = save.som ? .012 : 0; if (!save.musica) return; const k = mus.i++, v = mus.v, g = mus.g, Z = mus.z;
        if (v == 'sad') { tone(110 * 2 ** (MOT[7 - k % 8] / 12), 1.2, 'sine', .09, A0, g); return }
        if (v == 'win') { const f = nt(k, 262, MW); tone(f, .2, 'triangle', .08, A0, g); tone(f * 1.5, .2, 'square', .03, A0, g); if (k % 4 == 0) tone(131, .3, 'triangle', .08, A0, g); return }
        if (v == 'menu') { tone(nt(k, 196), .8, 'sine', .07, A0, g); return }
        if (v == 'calm') { tone(nt(k, 220), .5, 'triangle', .05, A0, g); if (k % 8 == 0) tone(110, 3, 'sine', .04, A0, g); return }
        const f = nt(k, 220);
        if (v == 'tense') { const ft = nt(k >> 1, 220) / 2; tone(9000, .02, 'square', .012, A0, g); if (k % 2 == 0) { tone(ft, .2, 'sawtooth', .04, A0, g); tone(ft * 2 ** (13 / 12), .2, 'sawtooth', .012, A0, g) } if (k % 4 == 0) tone(55, .3, 'sawtooth', .07, A0, g) }
        else { tone(f, .22, 'square', .05, A0, g); tone(f * 2, .2, 'sawtooth', .02, A0, g); if (k % 2 == 0) tone(60, .15, 'sine', .2, A0, g); if (k % 32 == 0) [0, 7, 12].forEach(n => tone(220 * 2 ** (n / 12), .6, 'sawtooth', .03, A0, g)) }
        if (Z) tone(f * (Z > 2 ? 1.414 : 1.5), .2, 'sawtooth', .012 * Z, A0, g)
    };
    let nx = 0; setInterval(() => { const now = actx.currentTime; if (nx < now - .2) nx = now + .05; while (nx < now + .12) { step(Math.max(0, nx - now)); nx += Math.max(MINI[mus.v] || .1, (BASE[mus.v] || 260) * Math.max(.78, mus.sp / 260) / 1000) } }, 30)
}
function musV(v) { if (!mus.g || v == mus.v) return; const g = mus.g.gain, t = actx.currentTime; g.cancelScheduledValues(t); g.setValueAtTime(g.value, t); g.linearRampToValueAtTime(0, t + .25); setTimeout(() => { mus.v = v; g.linearRampToValueAtTime(1, actx.currentTime + .25) }, 250) }
/* ---------- dados ---------- */
const ORD = ['ip', 'porta', 'tcp', 'udp', 'mac', 'mask', 'cidr', 'gw', 'bcast', 'dhcp', 'acl', 'nat', 'pat', 'dns', 'icmp', 'vlan', 'trunk', 'rota', 'ospf', 'ttl', 'bgp', 'as', 'vpn', 'tls', 'qos'];
const CON = { ip: ['Endereço IP', 'É o "endereço de casa" do seu pacote na rede. Sem ele, ninguém sabe onde entregar.', 'Seu pacote tem dois IPs: src (de onde saiu) e dst (para onde vai). Cada dispositivo só deixa passar IPs dentro de uma faixa. Se o seu não estiver na faixa, a linha fica vermelha e o pacote volta.', ['10.x.x.x → rede local', '172.16.x.x a 172.31.x.x → rede local', '192.168.x.x → rede local', 'Qualquer outro → internet', 'Rede local é "dentro de casa"; internet é "na rua". O roteador troca o número de casa pelo da rua quando o pacote sai.'], [['✅', 'Passa: seu IP está na faixa que a regra permite.', 'seu src: 192.168.1.5\nip access-list standard B\n  permit 192.168.1.0 0.0.0.255'], ['❌', 'Bloqueia: seu IP está fora da faixa.', 'seu src: 192.168.1.5\nip access-list standard B\n  permit 10.0.0.0 0.0.0.255'], ['⚠️', 'Cuidado: mesma faixa, máscara diferente.', 'seu src: 172.16.5.20\npermit 172.16.0.0 0.15.255.255 → passa\npermit 172.16.0.0 0.0.255.255  → bloqueia']]] };
const CD = `
porta|Porta de rede|É a "porta da casa" que o pacote quer usar. Cada serviço atende numa porta.|Seu pacote tem um dport. A port-filter lista a porta liberada: precisa ser igual.|80 → sites sem cadeado;443 → sites com cadeado;22 → acesso remoto;53 → DNS|dport|443|port-filter|permit eq {v}|443|80|Cuidado: portas parecidas não valem.|dport 8080 ≠ 80
tcp|TCP|É o "correio com aviso de recebimento": confirma que tudo chegou, na ordem certa.|Seu pacote tem proto TCP. A protocol-filter precisa liberar tcp.|confirma a entrega;reenvia o que se perdeu;usado em web e e-mail|proto|TCP|protocol-filter|permit {v}|tcp|udp|Cuidado: a config cita um protocolo só.|permit udp → seu TCP não passa
udp|UDP|É a "carta sem aviso de recebimento": rápida, mas sem garantia de entrega.|Seu pacote tem proto UDP. A protocol-filter precisa liberar udp.|sem confirmação de chegada;bom para voz, vídeo e DNS;não corrige perdas|proto|UDP|protocol-filter|permit {v}|udp|tcp|Cuidado: DNS costuma usar UDP na porta 53.|proto UDP + dport 53
mac|Endereço MAC|É o "número de série" da placa de rede. Só vale dentro da rede local.|Seu pacote carrega o mac de origem. A mac access-list libera só o MAC citado.|6 pares hexadecimais;os 3 primeiros identificam o fabricante;não atravessa roteadores|mac|AA:BB:CC:00:10:01|mac access-list extended M|permit host {v} any|AA:BB:CC:00:10:01|AA:BB:CC:00:10:FF|Cuidado: um par diferente já é outra placa.|…10:01 ≠ …10:0A
mask|Máscara de sub-rede|Diz quanto do IP é "rua" (rede) e quanto é "número da casa" (host).|Seu pacote traz a mask da rede dele. A config ip address precisa ter a mesma máscara.|255.255.255.0 → 254 hosts;255.255.0.0 → 65.534 hosts;255.255.255.128 → 126 hosts|mask|255.255.255.0|interface Gi0/0|ip address 10.0.0.1 {v}|255.255.255.0|255.255.0.0|Cuidado: máscaras parecidas dão redes de tamanhos bem diferentes.|255.255.255.0 ≠ 255.255.255.128
cidr|Notação CIDR|É a máscara escrita de forma curta: /24 significa 24 bits de rede.|Seu pacote traz o cidr. A config network precisa ter o mesmo prefixo.|/16 → 65 mil hosts;/24 → 254 hosts;/25 → 126 hosts;/28 → 14 hosts|cidr|/24|router static|network 203.0.113.0{v}|/24|/25|Cuidado: cada +1 no prefixo divide a rede ao meio.|/24 tem o dobro de hosts de /25
gw|Gateway padrão|É a "porta de saída" da rede local: quem leva o pacote para fora.|Seu pacote conhece o gw da rede dele. A config default-gateway precisa citar o mesmo IP.|quase sempre termina em .1 ou .254;fica na mesma rede do host;sem ele só fala com a rede local|gw|192.168.1.1|interface Vlan1|ip default-gateway {v}|192.168.1.1|192.168.1.254|Cuidado: o gateway tem que estar na SUA rede.|192.168.1.1 ≠ 192.168.2.1
bcast|Broadcast|É o "alto-falante" da rede: um aviso para todos os dispositivos de uma vez.|Seu pacote conhece o bcast da rede. A config broadcast-address precisa citar o mesmo.|é o último endereço da rede;192.168.1.255 numa rede /24;todos os hosts recebem|bcast|192.168.1.255|interface Gi0/0|ip broadcast-address {v}|192.168.1.255|192.168.1.127|Cuidado: o broadcast muda com a máscara.|/24 → .255 ; /25 → .127
dhcp|DHCP|É o "recepcionista" que entrega IP automaticamente a quem entra na rede.|Seu pacote recebeu IP de um pool dhcp. A config network do pool precisa ser a mesma rede.|entrega IP, máscara e gateway;cada pool serve uma rede;o IP é emprestado (lease)|dhcp|192.168.1.0|ip dhcp pool LAN|network {v} 255.255.255.0|192.168.1.0|192.168.2.0|Cuidado: pools de redes diferentes entregam IPs diferentes.|IP 192.168.1.x não vem do pool 192.168.2.0
acl|Firewall / ACL|É o "porteiro": só deixa passar o que a lista autoriza.|Seu pacote vem autorizado por uma acl. A interface precisa ter o access-group com o mesmo número.|access-group N in → aplica a lista N;permit libera, deny bloqueia;sem match vale o deny final|acl|110|interface Gi0/1|ip access-group {v} in|110|120|Cuidado: lista diferente, regras diferentes.|110 ≠ 100
nat|NAT|É o "tradutor de endereço": troca o IP privado por um público para sair à rua.|Seu pacote sai com um IP público (nat). A config pool precisa citar o mesmo.|privado → público na saída;esconde a rede interna;economiza endereços|nat|198.51.100.7|ip nat pool P|address {v}|198.51.100.7|198.51.100.8|Cuidado: .7 e .8 são IPs públicos diferentes.|…100.7 ≠ …100.8
pat|PAT|É o NAT "multiplicado": vários hosts dividem 1 IP público usando portas diferentes.|Seu pacote sai por uma porta pat. A port-range precisa conter essa porta.|overload → ativa o PAT;cada conexão usa uma porta pública;faixa típica 40000-45000|pat|40123|ip nat inside source list 1 interface Gi0/0 overload|port-range {v}|40000-41500|50000-51000|Cuidado: a porta precisa estar DENTRO da faixa.|40123 ∈ 40000-41500
dns|DNS|É a "lista telefônica" da internet: traduz nome em IP.|Seu pacote procura um nome. A zona precisa ter o registro A com esse nome.|A → nome para IPv4;zone → domínio gerenciado;ttl → tempo de cache|nome|api|zone exemplo.com|A {v} 203.0.113.5|api|www|Cuidado: nomes parecidos são registros diferentes.|api.exemplo.com ≠ www.exemplo.com
icmp|ICMP|É o "mensageiro de diagnóstico": ping e avisos de erro da rede.|Seu pacote traz um tipo de icmp. A config permit precisa liberar esse tipo.|echo → ping;unreach → destino inalcançável;ttl-exc → TTL esgotou|icmp|echo|ip icmp-allow|permit {v}|echo|unreach|Cuidado: liberar ping não libera os outros avisos.|permit echo ≠ ttl-exc
vlan|VLAN|É uma "sala" separada dentro do mesmo switch.|Seu pacote pertence a uma vlan. A porta access só aceita a vlan configurada.|access vlan N → só a N;isola grupos no mesmo switch;vlan 1 é a padrão|vlan|20|interface Gi0/1|switchport access vlan {v}|20|30|Cuidado: 20 e 30 são salas diferentes.|vlan 20 ≠ vlan 30
trunk|Trunk|É o "corredor" que leva várias VLANs num só cabo, cada quadro com uma etiqueta (tag).|Seu pacote traz uma tag 802.1Q. O trunk precisa listar essa vlan em allowed.|allowed vlan 10,20,30 → só essas;a tag identifica a vlan;liga switch a switch|tag|20|interface Gi0/2|switchport trunk allowed vlan {v}|10,20,30|10,30,40|Cuidado: basta a tag estar na lista.|tag 20 está em 10,20,30
rota|Tabela de roteamento|É o "mapa" do roteador: diz por onde cada rede deve seguir.|Seu pacote vai para uma net. A ip route precisa cobrir exatamente essa rede.|ip route REDE MÁSCARA SALTO;a rota mais específica vence;rota padrão: 0.0.0.0/0|net|203.0.113.0|ip routing|ip route {v} 255.255.255.0 10.0.0.254|203.0.113.0|198.51.100.0|Cuidado: rota para outra rede não leva você.|203.0.113.0 ≠ 192.0.2.0
ospf|OSPF|É o "GPS" interno: roteadores trocam mapas e acham o melhor caminho sozinhos.|Seu pacote viaja numa area. O network do OSPF precisa estar na mesma area.|area 0 → backbone;vizinhos trocam rotas;escolhe o menor custo|area|0|router ospf 1|network 10.0.0.0 0.0.0.255 area {v}|0|1|Cuidado: area errada, vizinhos que não conversam.|area 0 ≠ area 1
ttl|TTL|É o "prazo de validade" do pacote: cada roteador tira 1; em 0 ele morre.|Seu pacote tem um ttl restante. A ttl-minimum exige um mínimo: o seu precisa ser maior ou igual.|começa em 64 ou 128;cada salto tira 1;em 0 vira aviso ICMP|ttl|12|ip ttl-policy|ttl-minimum {v}|8|20|Cuidado: aqui conta maior ou igual, não igualdade.|ttl 12 passa em mínimo 8; bloqueia em 20
bgp|BGP|É o "correio entre países": troca rotas entre grandes redes da internet.|Seu pacote vai para um prefixo bgp. O network do BGP precisa anunciar exatamente esse prefixo.|conecta sistemas autônomos;anuncia prefixos;escolhe caminhos por política|bgp|203.0.113.0/24|router bgp 65001|network {v}|203.0.113.0/24|203.0.113.0/25|Cuidado: /24 e /25 são prefixos diferentes.|203.0.113.0/24 ≠ /25
as|Sistema autônomo|É uma "empresa" de rede com política própria, identificada por um número (ASN).|Seu pacote vai para o as do destino. O remote-as precisa citar esse número.|ASN identifica a rede;eBGP liga ASNs diferentes;65000+ são ASNs privados|as|65010|bgp neighbor-list|remote-as {v}|65010|65020|Cuidado: números parecidos, redes diferentes.|65010 ≠ 65020
vpn|VPN|É o "túnel blindado": leva seu tráfego pela internet como se fosse rede privada.|Seu pacote entra num tunel. A interface Tunnel precisa ter o mesmo destino.|o túnel liga dois pontos;cifra o conteúdo;IPsec e WireGuard são exemplos|tunel|203.0.113.3|interface Tunnel0|tunnel destination {v}|203.0.113.3|203.0.113.4|Cuidado: outro destino é outro túnel.|…113.3 ≠ …113.4
tls|TLS|É o "cadeado" das conexões: cifra e prova quem é o servidor.|Seu pacote negocia uma versão tls. A ssl-policy precisa citar a mesma versão.|1.2 → ainda aceito;1.3 → o mais moderno;versões antigas são inseguras|tls|1.2|ssl-policy|version {v}|1.2|1.3|Cuidado: versão diferente, negociação falha.|1.2 ≠ 1.3
qos|QoS|É a "fila preferencial": decide quem passa primeiro quando a rede está cheia.|Seu pacote tem uma classe qos. O class-map precisa casar com a mesma classe.|EF → voz;AF41 → vídeo;BE → melhor esforço|qos|EF|class-map VOZ|match dscp {v}|EF|BE|Cuidado: classes diferentes entram em filas diferentes.|EF passa primeiro; BE espera`;
CD.trim().split('\n').forEach(r => { const [k, n, i, c, pt, lb, pv, h, tp, ok, bd, tt, tc] = r.split('|'); CON[k] = [n, i, c, pt.split(';'), [['✅', 'Passa: o valor da config combina com o do seu pacote.', 'seu ' + lb + ': ' + pv + '\n' + h + '\n  ' + tp.replace('{v}', ok)], ['❌', 'Bloqueia: o valor da config é diferente do seu.', 'seu ' + lb + ': ' + pv + '\n' + h + '\n  ' + tp.replace('{v}', bd)], ['⚠️', tt, tc]]] });
const UN = { acl: ['acl', 'porta', 'tcp'], vlan: ['vlan', 'ip'], dns: ['dns', 'ip'], rota: ['rota', 'ip'], nat: ['nat', 'ip'] }, NM = { srv: 'SERVIDOR', gw: 'GATEWAY', acl: 'FIREWALL', rota: 'ROTEADOR', vlan: 'SWITCH', dns: 'DNS', nat: 'NAT' };
const net = i => i.split('.').slice(0, 3).join('.'), lastp = i => +i.split('.')[3], PORTS = [80, 443, 22, 53, 8080, 25, 3389];
/* gera config de dispositivo; bad = índice da linha que bloqueia (-1 = libera) */
function gen(tp, p, fail, simple) {
    const pr = p.proto.toLowerCase(), oth = (a, x) => pick(a.filter(v => v !== x));
    if (simple && tp == 'dns') return { lines: ['A ' + (fail ? net(p.dst) + '.' + (lastp(p.dst) + 1) : p.dst)], bad: fail ? 0 : -1 };
    if (simple && tp == 'vlan') return { lines: ['switchport access vlan ' + (fail ? pick([10, 20, 30, 40, 50].filter(v => v != p.vlan)) : p.vlan)], bad: fail ? 0 : -1 };
    if (tp == 'acl') {
        const m = fail ? pick(['early', 'proto', 'port', 'dst', 'src']) : '';
        return {
            lines: ['access-list 100 deny ' + (m == 'early' ? pr : oth(['tcp', 'udp'], pr)) + ' any any eq ' + (m == 'early' ? p.dport : oth(PORTS, p.dport)),
            'access-list 100 permit ' + (m == 'proto' ? oth(['tcp', 'udp'], pr) : pr) + ' ' + (m == 'src' ? '10.9.9.0' : net(p.src) + '.0') + ' 0.0.0.255 host ' + (m == 'dst' ? net(p.dst) + '.' + (lastp(p.dst) + 1) : p.dst) + ' eq ' + (m == 'port' ? oth(PORTS, p.dport) : p.dport),
                'access-list 100 deny ip any any'], bad: m == '' ? -1 : m == 'early' ? 0 : 2
        }
    }
    if (tp == 'rota') {
        const m = fail ? pick(['shut', 'route']) : '', dn = m == 'route' ? oth(['203.0.113', '198.51.100', '192.0.2'], net(p.dst)) : net(p.dst);
        return { lines: ['interface Gi0/1', 'ip address 10.0.0.1 255.255.255.0', m == 'shut' ? 'shutdown' : 'no shutdown', 'ip route ' + dn + '.0 255.255.255.0 10.0.0.254'], bad: m == 'shut' ? 2 : m == 'route' ? 3 : -1 }
    }
    if (tp == 'vlan') {
        const V = [10, 20, 30, 40, 50], o = V.filter(v => v != p.vlan);
        if (Math.random() < .5) { const l = fail ? shuf(o.slice()).slice(0, 3) : shuf(o.slice()).slice(0, 2).concat(p.vlan); return { lines: ['interface Gi0/1', 'switchport mode trunk', 'switchport trunk allowed vlan ' + l.sort((a, b) => a - b).join(',')], bad: fail ? 2 : -1 } }
        return { lines: ['interface Fa0/5', 'switchport mode access', 'switchport access vlan ' + (fail ? pick(o) : p.vlan)], bad: fail ? 2 : -1 }
    }
    if (tp == 'dns') return { lines: ['zone exemplo.com', 'A ' + (fail ? net(p.dst) + '.' + (lastp(p.dst) + 1) : p.dst), 'ttl 300'], bad: fail ? 1 : -1 };
    return { lines: ['ip nat inside source list 10 interface Gi0/0 overload', 'access-list 10 permit ' + (fail ? '192.168.' + oth([1, 2, 10, 3], +p.src.split('.')[2]) + '.0' : net(p.src) + '.0') + ' 0.0.0.255'], bad: fail ? 1 : -1 }
}
/* ---------- UI ---------- */
function btn(s, x, y, w, h, t, fn, fs = 22) {
    const c = s.add.container(x, y).setDepth(D.BTN), bg = s.add.rectangle(0, 0, w, h, PN).setStrokeStyle(3, AM), l = s.add.text(0, 0, t, { fontFamily: F, fontSize: fs + 'px', color: TX }).setOrigin(.5); c.add([bg, l]); const W = Math.max(w, 44), H = Math.max(h, 44); c.setSize(W, H); c.setInteractive(new Phaser.Geom.Rectangle(0, 0, W, H), Phaser.Geom.Rectangle.Contains); c.input.cursor = 'pointer'; c.lbl = l;
    c.on('pointerover', () => { bg.setFillStyle(LN); bg.setStrokeStyle(4, AM); sfx.tick() }); c.on('pointerout', () => { bg.setFillStyle(PN); bg.setStrokeStyle(3, AM) });
    c.on('pointerdown', () => { initAudio(); s.tweens.add({ targets: c, scaleX: .96, scaleY: .96, duration: 60, yoyo: true, onComplete: () => fn() }) }); return c
}
function bgLines(s) { const W = s.scale.width, H = s.scale.height, g = s.add.graphics().setDepth(-1).setScrollFactor(0); g.lineStyle(3, PN); for (let i = 0; i < 5; i++) { const y = H * (.1 + i * .2); g.lineBetween(0, y, W, y); const d = s.add.rectangle(0, y, 14, 6, LN).setDepth(-1).setScrollFactor(0); s.tweens.add({ targets: d, x: W, duration: 14000 + i * 3000, repeat: -1 }) } }
const R = (a, b) => { a.b = b; return a }, A = (a, x) => pick(a.filter(v => v != x)), B = (s, x, f) => { const b = Math.floor(x / s) * s; return f ? (b + s) % 256 : b }, PNM = { 80: 'www', 443: 'https', 22: 'ssh', 53: 'domain', 25: 'smtp' }, dm = m => m.replace(/:/g, '').toLowerCase().replace(/(....)(?=.)/g, '$1.');
/* feature: [zona, -, rótulo no painel, valor BRUTO(p), config TRANSFORMADA(p,falha,T)]; R(linhas,i) marca a linha que bloqueia */
const FT = {
    ip: [1, 0, 'src', p => p.src, (p, f, T) => { const z = pick([32, 64, 128]), b = B(z, lastp(p.src), f); return ['ip access-list standard A', ' permit ' + T(net(p.src) + '.' + b + ' 0.0.0.' + (z - 1))] }],
    porta: [1, 0, 'dport', p => p.dport, (p, f, T) => {
        const d = p.dport, po = PORTS.filter(x => x != d); let t;
        if (!f) { const v = pick(PNM[d] ? ['n', 'l', 'r'] : ['l', 'r']); t = v == 'n' ? 'eq ' + PNM[d] : v == 'l' ? 'eq ' + shuf([d, ...shuf(po.slice()).slice(0, 2)]).join(' ') : 'range ' + (d - 5) + ' ' + (d + 5) }
        else { const o = pick(po.filter(x => PNM[x])), v = pick(['n', 'l', 'r']); t = v == 'n' ? 'eq ' + PNM[o] : v == 'l' ? 'eq ' + shuf(po.slice()).slice(0, 3).join(' ') : 'range ' + (d + 10) + ' ' + (d + 99) }
        return ['port-filter', ' permit ' + T(t)]
    }],
    tcp: [1, 0, 'tcp', p => 'TCP ' + p.flag, (p, f, T) => { const s = p.flag == 'SYN'; let r; if (!f) r = s ? pick(['permit tcp any any', 'permit ip any any']) : pick(['permit tcp any any established', 'permit tcp any any']); else r = s ? pick(['permit tcp any any established', 'permit udp any any']) : 'permit udp any any'; return ['ip access-list extended T', ' ' + T(r)] }],
    udp: [1, 0, 'udp', p => 'UDP ' + p.up, (p, f, T) => { const U = { 53: 'domain', 123: 'ntp', 161: 'snmp' }, d = p.up, o = A([53, 123, 161], d), r = f ? pick(['permit tcp any any eq ' + d, 'permit udp any any eq ' + U[o], 'deny udp any any']) : pick(['permit udp any any eq ' + U[d], 'permit udp any any eq ' + d, 'permit udp any any']); return ['ip access-list extended U', ' ' + T(r)] }],
    mask: [2, 0, 'mask', p => p.mip + ' mask 255.255.255.0', (p, f, T) => { const z = pick([32, 64, 128]), b = B(z, lastp(p.mip), f); return ['subnet-map M', ' network ' + T(net(p.mip) + '.' + b + ' 255.255.255.' + (256 - z))] }],
    cidr: [2, 0, 'cidr', p => p.cip + '/' + p.cpre, (p, f, T) => { const z = f ? pick([32, 64, 128]) : pick([32, 64, 128, 256]), b = z == 256 ? 0 : B(z, lastp(p.cip), f); return ['route-map C', ' network ' + T(net(p.cip) + '.' + b + '/' + (32 - Math.log2(z)))] }],
    gw: [2, 0, 'saída', p => p.gs + ' → ' + p.gd, (p, f, T) => { const n = net(p.gs); return ['interface Vlan1', ' ' + T(f ? pick(['no ip default-gateway', 'ip default-gateway 10.0.0.1', 'ip default-gateway ' + n + '0.1']) : 'ip default-gateway ' + n + '.' + pick([1, 254]))] }],
    bcast: [2, 0, 'dst', p => '192.168.10.' + p.bc, (p, f, T) => { const b = f ? A([127, 63, 31, 255], p.bc) : p.bc; return ['interface Gi0/0', ' ip address 192.168.10.1 ' + T('255.255.255.' + (255 - b))] }],
    acl: [3, 0, 'flow', p => 'tcp/' + p.ap, (p, f, T) => {
        const a = p.ap, o = A([80, 443, 22, 25], a); let L, b = 2;
        if (!f) L = Math.random() < .5 ? ['permit tcp any any eq ' + a, 'deny tcp any any eq ' + a] : ['deny tcp any any eq ' + o, 'permit tcp any any eq ' + a];
        else if (Math.random() < .6) { L = ['deny tcp any any eq ' + a, 'permit tcp any any eq ' + a]; b = 1 } else L = ['permit tcp any any eq ' + o, 'deny ip any any'];
        return R(['ip access-list extended 100', ...L.map(x => ' ' + T(x))], b)
    }],
    nat: [3, 0, 'priv', p => p.nsrc + ' → internet', (p, f, T) => {
        const n = p.nsrc.split('.')[2], v = f ? pick([0, 1, 2]) : -1, o = A([1, 2, 3], n);
        return R([T(v == 2 ? 'no ip nat inside source list 10' : v == 1 ? 'ip nat inside source static 192.168.' + n + '.9 198.51.100.7' : 'ip nat inside source list 10 interface Gi0/0 overload'), 'access-list 10 permit ' + T('192.168.' + (v == 0 ? o : n) + '.0 0.0.0.255')], v == 0 ? 1 : 0)
    }],
    pat: [3, 0, 'sport', p => p.sp, (p, f, T) => { const v = f ? pick(['static', 'rng']) : 'ok'; return R([T(v == 'static' ? 'ip nat inside source static 192.168.1.5 198.51.100.7' : 'ip nat inside source list 10 interface Gi0/0 overload'), ' port-range ' + T(v == 'rng' ? '1024-49151' : pick(['49152-65535', '40000-60000']))], v == 'static' ? 0 : 1) }],
    dns: [3, 0, 'consulta', p => p.q, (p, f, T) => {
        const [h, ...d] = p.q.split('.'), dom = d.join('.'), v = f ? pick(['tld', 'host', 'off']) : '';
        if (v == 'off') return R([T('no ip domain-lookup'), ' A ' + h + ' 203.0.113.5'], 0);
        return R(['zone ' + T(v == 'tld' ? dom.replace(/\.\w+$/, m => m == '.com' ? '.net' : '.com') : dom), ' A ' + T(v == 'host' ? A(['www', 'api', 'mail'], h) : h) + ' 203.0.113.5'], v == 'tld' ? 0 : 1)
    }],
    mac: [4, 0, 'src_mac', p => p.mac, (p, f, T) => {
        const d = dm(p.mac), v = f ? pick(['deny', 'other', 'oui']) : pick(['host', 'wild']);
        const r = { host: 'permit host ' + d, wild: 'permit ' + d.slice(0, 7) + '00.0000 0000.00ff.ffff', deny: 'deny host ' + d, other: 'permit host ' + d.slice(0, -1) + (d.slice(-1) == '0' ? '1' : '0'), oui: 'permit 0050.5600.0000 0000.00ff.ffff' }[v]; return ['mac access-list extended M', ' ' + T(r)]
    }],
    vlan: [4, 0, 'vlan', p => p.vlan, (p, f, T) => {
        const V = [10, 20, 30, 40], v = p.vlan, o = V.filter(x => x != v), s = a => a.sort((x, y) => x - y).join(',');
        const r = !f ? pick(['switchport access vlan ' + v, 'switchport trunk allowed vlan ' + s([v, pick(o)]), 'switchport trunk allowed vlan ' + (v - 10) + '-' + (v + 10)]) : pick(['switchport trunk allowed vlan ' + s(shuf(o.slice()).slice(0, 2)), 'switchport access vlan ' + pick(o)]); return ['interface Gi0/1', ' ' + T(r)]
    }],
    trunk: [4, 0, 'tag', p => '802.1Q vlan ' + p.tag, (p, f, T) => f ? R(['interface Gi0/2', ' ' + T('switchport mode access'), ' switchport access vlan ' + p.tag], 1) : ['interface Gi0/2', ' ' + T('switchport mode trunk'), ' switchport trunk native vlan 1']],
    dhcp: [4, 0, 'discover', p => p.dip, (p, f, T) => { const z = pick([64, 128]), v = f ? pick(['adj', 'net']) : 'ok'; return ['ip dhcp pool LAN', ' network ' + T(v == 'net' ? '10.0.0.0 255.255.255.0' : net(p.dip) + '.' + B(z, lastp(p.dip), v == 'adj') + ' 255.255.255.' + (256 - z))] }],
    ospf: [5, 0, 'dst', p => p.o, (p, f, T) => {
        const [a, b, c] = p.o.split('.').map(Number), v = f ? pick(['net', 'small']) : pick(['16', '8', '24']);
        const r = { 16: '10.' + b + '.0.0 0.0.255.255', 8: '10.0.0.0 0.255.255.255', 24: '10.' + b + '.' + c + '.0 0.0.0.255', net: '10.' + (b + 1) + '.0.0 0.0.255.255', small: '10.' + b + '.' + c + '.0 0.0.0.15' }[v]; return ['router ospf 1', ' network ' + T(r) + ' area 0']
    }],
    rota: [5, 0, 'dst', p => p.rd + ' → ' + p.rif, (p, f, T) => {
        const b = +p.rd.split('.')[1], oi = p.rif == 'Gi0/1' ? 'Gi0/2' : 'Gi0/1', v = f ? pick(['swap', 'def']) : '';
        if (v == 'swap') return R(['ip route 10.' + b + '.0.0 255.255.0.0 ' + T(oi), ' ip route 0.0.0.0 0.0.0.0 ' + p.rif], 0);
        return R(['ip route 10.' + (v == 'def' ? b + 1 : b) + '.0.0 255.255.0.0 ' + T(p.rif), ' ip route 0.0.0.0 0.0.0.0 ' + oi], v == 'def' ? 1 : 2)
    }],
    bgp: [5, 0, 'dst', p => p.bd + ' (outro AS)', (p, f, T) => {
        const n = net(p.bd), h = lastp(p.bd), v = f ? pick(['none', 'other', 'small']) : 'ok', L = ['router bgp 65000', ' neighbor 198.51.100.1 remote-as 65001'];
        if (v == 'none') { L[1] = ' ' + T('neighbor 198.51.100.1 remote-as 65001'); return R(L, 1) }
        L.push(' network ' + T(v == 'ok' ? n + '.0 mask 255.255.255.0' : v == 'other' ? n.replace(/\.\d+$/, m => '.' + (+m.slice(1) + 1)) + '.0 mask 255.255.255.0' : n + '.' + (Math.floor(h / 8) * 8 + 8) + ' mask 255.255.255.248')); return R(L, 2)
    }],
    as: [5, 0, 'vizinho', p => 'espera AS ' + p.asn, (p, f, T) => { const hi = p.asn >>> 16, lo = p.asn & 65535, v = f ? pick([[hi + 1, lo], [hi, lo + 1], [hi, lo + 10]]) : [hi, lo]; return ['router bgp ' + T(v.join('.')), ' neighbor 198.51.100.1 remote-as 65001'] }],
    vpn: [5, 0, 'dst', p => p.vd + ' · ' + p.alg, (p, f, T) => {
        const b = p.vd.split('.')[1], v = f ? pick(['net', 'alg', 'gi']) : 'ok', tr = v == 'alg' ? A(['esp-3des', 'esp-aes 128', 'esp-aes 256'], 'esp-' + p.alg) : 'esp-' + p.alg;
        return R(['interface Tunnel0', ' ip route 10.' + (v == 'net' ? 60 : b) + '.0.0 255.255.0.0 ' + T(v == 'gi' ? 'Gi0/1' : 'Tunnel0'), ' transform-set ' + T(tr)], v == 'alg' ? 2 : 1)
    }],
    tls: [5, 0, 'tls', p => 'dport 443 · TLS ' + p.tv, (p, f, T) => { const all = ['tlsv1.0', 'tlsv1.1', 'tlsv1.2', 'tlsv1.3'], c = 'tlsv' + p.tv, L = f ? pick([['tlsv1.0'], ['tlsv1.0', 'tlsv1.1'], [c == 'tlsv1.2' ? 'tlsv1.3' : 'tlsv1.2']]) : [...new Set(shuf([c, pick(all)]))]; return ['ssl-policy', ' ssl-protocol ' + T(L.join(' '))] }],
    qos: [5, 0, 'dscp', p => p.dscp, (p, f, T) => { const D = { EF: 46, AF41: 34, AF21: 18 }, v = f ? pick(['police', 'other']) : 'ok'; return R(['policy-map PRIORITY', ' match ip dscp ' + T(v == 'other' ? D[A(Object.keys(D), p.dscp)] : D[p.dscp]), v == 'police' ? ' police rate 30 percent' : ' priority percent 30'], v == 'police' ? 2 : 1) }],
    ttl: [5, 0, 'ttl', p => p.tt, (p, f, T) => { const t = p.tt; return ['path to-destination', ' hops ' + T(f ? pick([t, t + 1, t + 3]) : 1 + (Math.random() * (t - 1) | 0))] }],
    icmp: [5, 0, 'icmp', p => 'type ' + p.it, (p, f, T) => {
        const N = { 8: 'echo', 0: 'echo-reply', 11: 'time-exceeded' }, t = p.it, o = A([8, 0, 11], t), h = 'ip access-list extended I';
        return f ? (Math.random() < .5 ? R([h, ' ' + T('deny icmp any any'), ' permit ip any any'], 1) : R([h, ' ' + T('permit icmp any any ' + N[o]), ' deny ip any any'], 1)) : [h, ' ' + T('permit icmp any any ' + N[t]), ' deny ip any any']
    }]
};
FT.dst0 = [0, 0, 'destino', p => p.bd, (p, f, T) => ['lista de convidados', ' permit host ' + T(f ? pick(['198.51.100', '192.0.2', '203.0.113'].filter(x => x != net(p.bd))) + '.' + pick([7, 44, 120]) : p.bd)]];
const ZK = [['ip', 'porta', 'tcp', 'udp'], ['mask', 'cidr', 'gw', 'bcast'], ['acl', 'nat', 'pat', 'dns'], ['mac', 'vlan', 'trunk', 'dhcp'], ['ospf', 'rota', 'bgp', 'as', 'vpn', 'tls', 'qos', 'ttl', 'icmp']];
/* conceito novo aparece isolado; depois combina (máx. 3 antes da zona 5) */
function Kfor(z, r) {
    const C = ZK[z - 1], P = ZK.slice(0, z - 1).flat(), sub = (a, n) => shuf(a.slice()).slice(0, n); let K;
    if (z == 1) K = [[C[0]], [C[1]], [C[2]], [C[3]], sub(C, 3)][r - 1];
    else if (z < 5) { const rv = () => pick(P); K = [[C[0], rv()], [C[1], rv()], [C[2], C[0]], [C[3], C[1], rv()], sub(C.concat(sub(P, 2)), 3)][r - 1] }
    else K = [[C[0], C[1]], [C[2], C[3]], [C[4], C[5]], [C[6], C[7], C[8]], sub(C.concat(sub(P, 3)), 5)][r - 1];
    K = [...new Set(K)]; if (K.includes('tcp') && K.includes('udp')) K = K.filter(k => k != 'udp'); return K
}
const FC = {}; Object.keys(FT).forEach((k, i) => { const c = Phaser.Display.Color.HSLToColor((i * .382) % 1, [.8, .62, .88][i % 3], [.6, .5, .76][i % 3]).color; FC[k] = '#' + c.toString(16).padStart(6, '0') });
function parse(l) { let s = '', c = [], i = 0; while (i < l.length) { if (l[i] == '\u0001') { const j = l.indexOf('\u0002', i), e = l.indexOf('\u0003', j), k = l.slice(i + 1, j); for (const ch of l.slice(j + 1, e)) { s += ch; c.push(save.guia ? FC[k] : null) } i = e + 1 } else { s += l[i]; c.push(null); i++ } } return [s, c] }
let HARD = 0;
function Kinf(d, st) { const n = Math.min(8, 3 + (d / 3 | 0)), o = []; while (o.length < n) { if (!st.bag.length) st.bag = shuf(ZK.flat()); const c = st.bag.pop(); if (!o.includes(c) && !(c == 'udp' && o.includes('tcp')) && !(c == 'tcp' && o.includes('udp'))) o.push(c) } return o }
function compor(K, p, n, ok) {
    const devs = [], tps = ['acl', 'rota', 'vlan', 'dns', 'nat', 'srv', 'gw']; let w = 0;
    for (let i = 0; i < n; i++) {
        let fl = []; if (i !== ok) { fl = [K[(w++) % K.length]]; if (K.length >= 3 && Math.random() < .35 + HARD) fl.push(pick(K.filter(k => k !== fl[0]))) }
        const lines = [], bad = []; K.forEach(k => { const f = fl.includes(k), L = FT[k][4](p, f, t => '\u0001' + k + '\u0002' + t + '\u0003'), o = lines.length; L.forEach(l => lines.push(l)); if (f) bad.push(o + (L.b !== undefined ? L.b : L.length - 1)) });
        const tp = pick(tps); devs.push({ tp, label: NM[tp], lines, bad: bad.length ? bad : -1 })
    } return devs
}
function novoPacote() {
    const o = pick, L = n => '192.168.' + n + '.', h = () => o([130, 70, 200, 170, 100]), hx = () => 'AA:BB:CC:11:' + o(['22', '2A', '4F']) + ':' + o(['33', '7B', 'C0']), dn = o(['203.0.113', '198.51.100']), ten = () => '10.' + o([20, 30, 40]) + '.' + o([30, 60, 90]) + '.';
    return { id: 'PKT-' + (Math.random() * 900 + 100 | 0), src: L(10) + h(), dport: o(PORTS), flag: o(['SYN', 'ACK']), up: o([53, 123, 161]), mip: L(20) + h(), cip: L(30) + h(), cpre: o([24, 26, 28]), gs: L(10) + h(), gd: o(['8.8.8.8', '1.1.1.1', '9.9.9.9']), bc: o([127, 63, 31]), ap: o([80, 443, 22, 25]), nsrc: L(o([1, 2, 3])) + '5', sp: o([49152, 50500, 55000, 60000]), q: o(['www', 'api', 'mail']) + '.exemplo.' + o(['com', 'net']), mac: hx(), vlan: o([10, 20, 30, 40]), tag: o([10, 20, 30, 40]), dip: L(10) + h(), o: ten() + o([40, 55, 200]), rd: ten() + o([40, 55]), rif: o(['Gi0/1', 'Gi0/2']), bd: dn + '.' + o([5, 37, 100]), asn: o([1, 2, 3]) * 65536 + o([4, 6, 10]), vd: '10.50.' + o([0, 3, 7]) + '.' + o([1, 9]), alg: o(['aes 256', 'aes 128', '3des']), tv: o(['1.2', '1.3']), dscp: o(['EF', 'AF41', 'AF21']), tt: o([3, 4, 5, 6]), it: o([8, 0, 11]) }
}
const CMT = `
ip|Seu src é um IP exato; a config traz uma faixa (rede + curinga). Veja se o IP cabe nela.|curinga 0.0.0.127 → 128 endereços;0.0.0.63 → 64;0.0.0.31 → 32;o IP precisa estar entre a base e a base + curinga|A faixa .0 com 0.0.0.127 cobre .0 a .127. Um IP .130 fica fora!
porta|Seu dport é um número; a config pode citar o nome do serviço, uma lista ou uma faixa.|www = 80;https = 443;ssh = 22;domain = 53;smtp = 25|eq www é a 80: parece boa, mas bloqueia 443. Traduza o nome!
tcp|Seu pacote é TCP com uma flag. Regras com established só aceitam conexões já abertas.|SYN → abre a conexão;ACK → conexão já aberta;established → só aceita ACK|Um SYN inicial NÃO passa por established. Leia a regra inteira.
udp|Seu pacote é UDP em certa porta. Regras de TCP não afetam UDP.|domain = 53;ntp = 123;snmp = 161;a regra precisa ser udp, não tcp|permit tcp eq 53 parece servir, mas seu pacote é UDP.
mac|Seu src_mac vem com dois pontos; a config usa o formato com pontos e pode ter curinga.|AA:BB:CC:11:22:33 → aabb.cc11.2233;os 6 primeiros dígitos são o fabricante;curinga ff ignora o byte|Uma regra que aceita o fabricante mas nega o host exato bloqueia você.
mask|Seu pacote traz IP e a máscara da rede grande; a config define uma sub-rede menor. Veja se seu IP cai nela.|255.255.255.128 → blocos de 128;255.255.255.192 → blocos de 64;255.255.255.224 → blocos de 32|O IP .130 só está na sub-rede que começa em .128 se a máscara for .128.
cidr|Seu pacote traz IP com um prefixo; a config traz outra rede em CIDR. Veja se o IP cabe nela.|/25 → 128 endereços;/26 → 64;/27 → 32;/24 → 256|/26 a partir de .0 cobre .0 a .63. Um IP .130 está fora.
gw|Para sair da rede local, o gateway precisa estar na mesma rede de origem.|gateway = porta de saída;precisa ficar na sua rede;sem gateway só circula localmente|192.168.100.1 parece 192.168.10.1, mas é outra rede!
bcast|O broadcast do pacote precisa ser o último endereço da sub-rede do dispositivo. Calcule pela máscara.|máscara .0 → broadcast .255;.128 → .127;.192 → .63;.224 → .31|.255 é o broadcast de uma /24, não de uma rede /25.
acl|A ACL é lida de cima para baixo e PARA no primeiro match. A ordem decide.|permit libera;deny bloqueia;o primeiro que bater vale|Se o deny vem antes do permit, bloqueia. Inverter as linhas muda tudo.
nat|Sem NAT, IP privado não sai para a internet. A lista precisa cobrir sua origem.|overload → NAT dinâmico;static → vale para um IP só;no ip nat → desligado|Um NAT estático para outro host parece certo, mas não cobre você.
pat|O PAT usa overload e traduz também a porta. A faixa precisa conter sua porta de origem.|overload → vários hosts, 1 IP;static → só um IP;portas altas: 49152-65535|NAT estático só serve a um IP; e a faixa precisa conter o seu sport.
dns|O DNS só resolve se a consulta estiver ligada e a zona e o host baterem com o nome consultado.|zone → domínio;A → host e IP;no ip domain-lookup → desliga|Zona e registro certos, mas domain-lookup desligado: a consulta falha.
vlan|Sua vlan precisa ser a da porta access ou estar na lista/faixa do trunk.|access → uma vlan só;allowed 10,20 → só essas;10-30 → todas entre elas|Trunk com allowed 10,20 parece aceitar tráfego, mas bloqueia a vlan 30.
trunk|Seu pacote vem com tag 802.1Q: só passa por porta em modo trunk.|trunk → mantém a tag;access → remove a tag;a tag liga switch a switch|Porta access com a vlan certa parece servir, mas perde a tag.
dhcp|O pool DHCP só atende clientes da rede que ele cobre. Calcule se o IP do cliente cabe.|network + máscara define o pool;rede errada → sem resposta;discover = pedido de IP|Um pool de 10.0.0.0 não atende quem está em 192.168.10.x.
ospf|O OSPF só anuncia redes dentro do network. Seu destino precisa estar coberto pelo curinga.|0.0.255.255 → cobre uma /16;0.0.0.255 → cobre uma /24;0.0.0.15 → só 16 endereços|network x.x.x.0 0.0.0.15 parece próximo, mas não cobre um destino .40.
rota|Vence a rota mais específica (prefixo maior) que cobre seu destino. Veja por qual interface ela sai.|a /16 é mais específica que a /0;0.0.0.0/0 é a rota padrão;a específica sempre ganha|Se a rota específica sai pela interface errada, a padrão certa não salva.
bgp|O BGP só alcança o destino se o network anunciar uma rede que o cubra.|network + máscara anuncia;vizinho sem network → nada anunciado;máscara maior = rede menor|Vizinho configurado sem anunciar a rede não leva a lugar nenhum.
as|O número do AS na config precisa ser o que o vizinho espera. ASNs de 4 bytes aparecem como alto.baixo (asdot).|65540 = 1 × 65536 + 4 → 1.4;131078 → 2.6;AS errado = sessão não sobe|1.4 e 1.5 parecem iguais, mas são sistemas autônomos diferentes.
vpn|O destino remoto precisa sair pelo túnel, com a mesma criptografia que seu pacote usa.|rota apontando para Tunnel0;transform-set → algoritmo;rota por interface física → sem túnel|IPsec configurado, mas com algoritmo incompatível, também falha.
tls|A lista de versões da policy precisa conter a versão que seu cliente exige.|tlsv1.0 e 1.1 → antigas;tlsv1.2 e 1.3 → atuais;sem versão em comum, o handshake falha|A porta 443 liberada, mas só TLS 1.0 aceito: o handshake falha.
qos|A classe precisa casar seu dscp (número) e dar PRIORIDADE ao tráfego.|EF = 46;AF41 = 34;AF21 = 18;priority prioriza, police limita|Com police em vez de priority parece QoS, mas faz o oposto.
ttl|Cada salto tira 1 do TTL. Com N saltos, o pacote só chega se N for menor que o ttl.|ttl 3 → no máximo 2 saltos;chegou a 0 → descartado;rota curta salva|Mais saltos esgotam o TTL. A rota mais curta é a certa.
icmp|Seu type é um número; a config usa o nome. A ACL precisa liberar exatamente esse tipo.|8 = echo (ping);0 = echo-reply;11 = time-exceeded|permit ip any any parece liberar tudo, mas um deny icmp antes bloqueia o ping.`;
CMT.trim().split('\n').forEach(r => {
    const [k, c, pt, dd] = r.split('|'), f = FT[k], p = novoPacote(), sh = a => a.map(l => parse(l)[0]).join('\n'), T0 = t => t;
    CON[k][2] = c; CON[k][3] = pt.split(';'); CON[k][4] = [['✅', 'Passa: o valor traduzido da config cobre o seu pacote.', 'seu ' + f[2] + ': ' + f[3](p) + '\n' + sh(f[4](p, false, T0))], ['❌', 'Bloqueia: a config não cobre o seu pacote.', 'seu ' + f[2] + ': ' + f[3](p) + '\n' + sh(f[4](p, true, T0))], ['⚠️', dd, '']]
});
function vib(p) { try { navigator.vibrate && navigator.vibrate(p) } catch (e) { } }
const ZB = [0x12121A, 0x10201E, 0x1E1428, 0x241A10, 0x2A1216], ZC = [[0x1E1E2A, 0x2E2E3E, 0x3A3A4E], [0x1B3A34, 0x2A5A4E, 0x3F8070], [0x3A2A52, 0x55407A, 0x7A5AA8], [0x4A3418, 0x7A5628, 0xB07C38], [0x4A1E24, 0x7A2E38, 0xB04555]];
/* cor por caractere: só colore valores que realmente casam com o pacote */
function pintar(l) {
    const c = Array(l.length).fill(null); if (!save.guia) return c;
    [['proto', /(?<=(?:deny|permit) )(?:tcp|udp)\b/g], ['dport', /(?<=eq )\d+/g], ['dst', /(?<=host )[\d.]+/g], ['dst', /(?<=^A )[\d.]+/g], ['dst', /(?<=ip route )[\d.]+/g], ['src', /[\d.]+(?= 0\.0\.0\.255)/g], ['vlan', /(?<=vlan [\d,]*)\d+/g]].forEach(([k, re]) => { let m; while ((m = re.exec(l))) for (let i = m.index; i < m.index + m[0].length; i++)c[i] = FC[k] }); return c
}
function desenho(g, tp, w, h) {
    const L = 0xF2E8D5, x0 = -w / 2, y0 = -h / 2; g.lineStyle(2, L, .8).fillStyle(L, .8);
    if (tp == 'acl') { const rh = (h - 16) / 3; for (let r = 0; r < 4; r++) { const y = y0 + 8 + r * rh; g.lineBetween(x0 + 6, y, -x0 - 6, y); if (r < 3) for (let k = 0; k < 5; k++)g.lineBetween(x0 + 6 + (k + (r % 2) * .5) * (w - 12) / 5, y, x0 + 6 + (k + (r % 2) * .5) * (w - 12) / 5, y + rh) } }
    else if (tp == 'vlan') { [0xE8B44B, 0x5FB8C8, 0xB07CC6, 0xE58FB0].forEach((c, i) => g.fillStyle(c, .85).fillRect(x0 + 12 + i * (w - 24) / 4, y0 + 8, (w - 24) / 4 - 2, 7)); g.fillStyle(L, .8); for (let i = 0; i < 8; i++)g.fillRect(x0 + 8 + i * ((w - 16) / 8), h / 2 - 18, (w - 16) / 8 - 3, 10) }
    else if (tp == 'rota') { g.lineBetween(-w / 3, y0, -w / 3 - 5, y0 - 12); g.lineBetween(w / 3, y0, w / 3 + 5, y0 - 12); for (let i = 0; i < 4; i++)g.fillRect(x0 + 10 + i * ((w - 20) / 4), h / 2 - 16, (w - 20) / 4 - 4, 9); g.strokeCircle(0, y0 + 16, 9); g.lineBetween(-5, y0 + 16, 5, y0 + 16) }
    else if (tp == 'dns') { g.strokeRect(x0 + 10, y0 + 12, w * .34, h * .5); g.strokeRect(x0 + 10 + w * .34, y0 + 12, w * .34, h * .5); g.strokeCircle(w * .3, y0 + 16, 8); g.lineBetween(w * .3 + 6, y0 + 22, w * .3 + 15, y0 + 31) }
    else if (tp == 'srv') { for (let r = 0; r < 3; r++) { const y = y0 + 4 + r * (h - 8) / 3; g.strokeRect(x0 + 5, y, w - 10, (h - 8) / 3 - 3); g.fillRect(x0 + 10, y + 4, w * .4, 3) } }
    else if (tp == 'nat') { g.lineBetween(-w / 3, -6, w / 3, -6); g.fillTriangle(w / 3, -12, w / 3, 0, w / 3 + 9, -6); g.lineBetween(-w / 3, 8, w / 3, 8); g.fillTriangle(-w / 3, 2, -w / 3, 14, -w / 3 - 9, 8) }
    else if (tp == 'gw') { g.lineBetween(-w / 3, h / 2 - 6, -w / 3, 0); g.lineBetween(w / 3, h / 2 - 6, w / 3, 0); g.beginPath(); g.arc(0, 0, w / 3, Math.PI, 0, false); g.strokePath(); g.fillCircle(0, -w / 6, 4) }
}
/* micro-animações sutis: LEDs, chama do firewall, livro do DNS */
function animar(s, c, tp, w, h) {
    const led = (x, y) => { const o = s.add.circle(x, y, 2.5, 0x6BBF59); c.add(o); s.tweens.add({ targets: o, alpha: .15, duration: 300 + Math.random() * 700, yoyo: true, repeat: -1 }) };
    if (tp == 'acl') { const f = s.add.graphics(); f.fillStyle(0xD64545, .9).fillTriangle(-8, 0, 8, 0, 0, -22); f.fillStyle(0xE8B44B, .95).fillTriangle(-4, 0, 4, 0, 0, -13); f.setPosition(w / 2 - 14, -h / 2 + 4); c.add(f); s.tweens.add({ targets: f, scaleY: { from: .75, to: 1.2 }, scaleX: { from: 1.1, to: .85 }, duration: 260, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' }) }
    else if (tp == 'dns') { const p = s.add.rectangle(w * .17 - w * .17, 0, w * .16, h * .4, 0xF2E8D5, .45); p.x = -w * .17 + w * .17; c.add(p); s.tweens.add({ targets: p, scaleX: { from: 1, to: .25 }, duration: 900, yoyo: true, repeat: -1, hold: 700, ease: 'Sine.easeInOut' }) }
    else if (tp == 'vlan' || tp == 'rota' || tp == 'srv' || tp == 'gw') { led(-w / 2 + 10, -h / 2 + 9); led(-w / 2 + 20, -h / 2 + 9); led(w / 2 - 10, -h / 2 + 9) }
}
const EXP = { n: ['0', '010'], f: ['^', '000'], s: ['O', '0110'], t: ['-', '101'], r: ['▮', '010'] };
/* pacote visual: caixa com fita, etiqueta, rachaduras por dano e camadas de cor de estado */
const PALS = [['Papelão', 0xC98F4F], ['Azul', 0x4F8FD9], ['Verde', 0x5FB070], ['Vermelho', 0xD64545], ['Roxo', 0x9A6BD0], ['Rosa', 0xE58FB0], ['Laranja', 0xE8892F], ['Ciano', 0x4FC3CF], ['Amarelo', 0xE8C84B], ['Grafite', 0x6A6A7A]].map(([n, c], i) => { if (!i) return { n, f: c, t: 0xE0B070, s: 0x8E5F2A, o: 0x5A3C18, k: 0xF2E8D5 }; const C = Phaser.Display.Color, mk = (p, l) => { const q = C.IntegerToColor(c); return (l ? q.lighten(p) : q.darken(p)).color }, q = C.IntegerToColor(c); return { n, f: c, t: mk(22, 1), s: mk(30, 0), o: mk(55, 0), k: (.299 * q.red + .587 * q.green + .114 * q.blue) / 255 > .62 ? 0x3A3A4E : 0xF2E8D5 } });
function mkPacote(s) {
    const P = a => a.map(([x, y]) => ({ x, y })), sil = (g, c) => { g.fillStyle(c, 1); g.fillPoints(P([[-20, -12], [-11, -21], [27, -21], [18, -12]]), true); g.fillPoints(P([[18, -12], [27, -21], [27, 12], [18, 20]]), true); g.fillRect(-20, -12, 38, 32) }, g = s.add.graphics(); const T1 = [[-20, -12], [-11, -21], [27, -21], [18, -12]], T2 = [[18, -12], [27, -21], [27, 12], [18, 20]], T3 = [[-4, -12], [4, -12], [13, -21], [5, -21]], draw = pl => {
        g.clear(); g.lineStyle(2, pl.o);
        g.fillStyle(pl.t).fillPoints(P(T1), true).strokePoints(P(T1), true); g.fillStyle(pl.s).fillPoints(P(T2), true).strokePoints(P(T2), true);
        g.fillStyle(pl.f).fillRect(-20, -12, 38, 32).strokeRect(-20, -12, 38, 32); g.fillStyle(pl.k).fillRect(-4, -12, 8, 32).fillPoints(P(T3), true);
        g.fillStyle(0xFFFFFF).fillRect(6, 4, 10, 10).lineStyle(1, pl.o).strokeRect(6, 4, 10, 10); g.lineBetween(8, 8, 14, 8); g.lineBetween(8, 11, 12, 11)
    }; draw(PALS[0]);
    const ov = { r: s.add.graphics(), g: s.add.graphics(), c: s.add.graphics() }; sil(ov.r, 0xD64545); sil(ov.g, 0x6BBF59); sil(ov.c, 0xF2E8D5); Object.values(ov).forEach(o => o.setAlpha(0));
    const cr = s.add.graphics(), inner = s.add.container(0, 0, [g, s.add.text(-15, 6, '01', { fontFamily: M, fontSize: '9px', fontStyle: 'bold', color: '#3A2810' }), ov.r, ov.g, ov.c, cr]), c = s.add.container(0, 0, [inner]); c.ov = ov; c.inner = inner; c.cor = i => draw(PALS[i]);
    const CK = [[[-14, -12], [-8, -2], [-12, 4], [-6, 14]], [[10, -12], [4, 0], [10, 8]], [[-18, 6], [-8, 8], [-2, 18]], [[0, -12], [-2, -4], [4, 2], [0, 10]], [[16, -8], [20, 0], [14, 12]]];
    c.crk = n => { cr.clear().lineStyle(2, 0x2A1A0A); for (let i = 0; i < n; i++) { const p = CK[i]; cr.beginPath(); cr.moveTo(p[0][0], p[0][1]); p.slice(1).forEach(q => cr.lineTo(q[0], q[1])); cr.strokePath() } };
    s.tweens.add({ targets: inner, scale: 1.02, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' }); return c
}
let DEBUG = false;
const FR = { dns: ['dst'], vlan: ['vlan'], rota: ['dst'], nat: ['src'], acl: ['src', 'dst', 'dport', 'proto'] };
/* entrada de texto via DOM (sem depender do teclado do Phaser) */
function pedirTexto(t, cb) {
    const d = document.createElement('div'); d.style.cssText = 'position:fixed;inset:0;background:#000b;display:flex;align-items:center;justify-content:center;z-index:99';
    d.innerHTML = '<div style="background:#1E1E2A;border:4px solid #E8B44B;padding:20px;border-radius:8px;font:18px Arial;color:#F2E8D5;text-align:center">' + t + '<br><input style="margin:12px;padding:8px;font-size:18px;max-width:70vw"><br><button style="font-size:16px;padding:8px 16px">OK</button> <button style="font-size:16px;padding:8px 16px">Cancelar</button></div>';
    document.body.appendChild(d); const i = d.querySelector('input'), b = d.querySelectorAll('button'), f = v => { d.remove(); if (v !== null) cb(v) }; setTimeout(() => i.focus(), 50);
    b[0].onclick = () => f(i.value.trim().toLowerCase()); b[1].onclick = () => f(null);['keydown', 'keyup'].forEach(n => i.addEventListener(n, e => { e.stopPropagation(); if (n == 'keydown' && e.key == 'Enter') f(i.value.trim().toLowerCase()) }))
}
function silh(g, z, x, w, h, H, c) {
    const y = H - h; g.fillStyle(c).fillRect(x, y, w, h); g.fillStyle(0xffffff, .08);
    if (z == 0) { for (let r = 0; r < h - 16; r += 16)for (let k = 4; k < w - 8; k += 13)g.fillRect(x + k, y + r + 6, 8, 6) }
    else if (z == 1) { g.fillStyle(0x6BBF59, .35); for (let r = 6; r < h - 6; r += 12)g.fillRect(x + w - 10, y + r, 4, 3); g.fillStyle(0xffffff, .06); for (let r = 0; r < h; r += 12)g.fillRect(x + 3, y + r, w - 16, 2) }
    else if (z == 2) { for (let r = 0; r < h; r += 12) { g.fillRect(x, y + r, w, 1); for (let k = (r / 12 % 2) * 8; k < w; k += 16)g.fillRect(x + k, y + r, 1, 12) } }
    else if (z == 3) { g.fillStyle(c).fillRect(x + w / 2 - 2, y - 30, 4, 30); g.fillStyle(0xE8B44B, .4).fillCircle(x + w / 2, y - 32, 3); g.fillStyle(0xffffff, .08); for (let r = 0; r < h; r += 14)g.fillRect(x + 4, y + r, w - 8, 3) }
    else { g.fillStyle(c).fillCircle(x + w / 2, y, w / 2); g.fillStyle(0xffffff, .1).fillCircle(x + w / 2, y - 4, w / 3); g.fillStyle(0xF2E8D5, .5).fillRect(x + w / 2 - 1, y - h * .4, 2, 2) }
}
function fireSet(a) {
    if (!actx || !save.som) a = 0; if (a > 0 && !fire.s) {
        const b = actx.createBuffer(1, actx.sampleRate, actx.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++)d[i] = Math.random() * 2 - 1;
        fire.s = actx.createBufferSource(); fire.s.buffer = b; fire.s.loop = true; fire.f = actx.createBiquadFilter(); fire.f.type = 'bandpass'; fire.g = actx.createGain(); fire.g.gain.value = 0; fire.s.connect(fire.f); fire.f.connect(fire.g); fire.g.connect(sfxB); fire.s.start()
    }
    if (fire.g) { const t = actx.currentTime; fire.g.gain.setTargetAtTime(a * .022, t, .05); fire.f.frequency.setTargetAtTime(300 + a * 140, t, .05) }
}
class Byto {
    constructor(s) {
        this.s = s; this.c = s.add.container(0, 0).setDepth(D.BYTO).setScrollFactor(0); const i = this.i = s.add.container(0, 0); this.c.add(i);
        const R = ['1010101010101', '1101010101011', '1011010101101', '1           1', '1           1', '1010101010101'];
        i.add(s.add.text(0, 0, R.join('\n'), { fontFamily: M, fontSize: '16px', fontStyle: 'bold', color: '#E8B44B', lineSpacing: 2, align: 'center' }).setOrigin(.5));
        this.eyes = [-28, 28].map(x => s.add.text(x, 14, '0', { fontFamily: M, fontSize: '32px', fontStyle: 'bold', color: TX }).setOrigin(.5));
        this.mouth = s.add.text(0, 34, '010', { fontFamily: M, fontSize: '18px', fontStyle: 'bold', color: TX }).setOrigin(.5); i.add([...this.eyes, this.mouth]);
        i.setScale(.98); s.tweens.add({ targets: i, scale: 1.02, duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' }); s.tweens.add({ targets: i, y: -6, duration: 1600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        this.blink(); this.place()
    }
    humor(m) { this.mouth.setText(m) }
    mood(k) { const e = EXP[k] || EXP.n; if (k == 'f') this.s.tweens.add({ targets: this.c, scaleX: 1.12, scaleY: .9, duration: 90, yoyo: true, repeat: 5 }); this.e0 = e[0]; this.m0 = e[1]; this.eyes.forEach(x => x.setText(e[0])); this.mouth.setText(e[1]) }
    blink() { this.ev = this.s.time.delayedCall(2000 + Math.random() * 2000, () => { if (!this.c.active) return; this.eyes.forEach(e => e.setText('1').setAngle(90)); this.s.time.delayedCall(120, () => this.eyes.forEach(e => e.active && e.setText(this.e0 || '0').setAngle(0))); this.blink() }) }
    place() { const s = this.s; this.c.setPosition(s.W - s.m - 70, s.H - s.m - 60); if (this.b) this.pb() }
    pb() { const s = this.s, b = this.b; if (s.nar) b.setPosition(s.W - s.m - b.bw / 2, this.c.y - 84 - b.bh / 2); else b.setPosition(this.c.x - 100 - b.bw / 2, this.c.y + 60 - b.bh / 2) }
    say(t, foc, dim = true) {
        return new Promise(res => {
            if (this.b) this.b.destroy(); const s = this.s, bw = Math.min(340, s.W - s.m * 2 - 40), tx = s.add.text(-bw / 2, 0, t, { fontFamily: 'Arial, sans-serif', fontSize: '19px', color: '#12121A', wordWrap: { width: bw } }).setOrigin(0, .5), w = bw + 40, h = tx.height + 40, g = s.add.graphics();
            g.fillStyle(0xFFFFFF).fillRoundedRect(-w / 2, -h / 2, w, h, 10).lineStyle(4, 0).strokeRoundedRect(-w / 2, -h / 2, w, h, 10);
            if (s.nar) g.fillTriangle(w / 2 - 60, h / 2 - 2, w / 2 - 30, h / 2 - 2, w / 2 - 40, h / 2 + 18); else g.fillTriangle(w / 2 - 2, h / 2 - 40, w / 2 - 2, h / 2 - 14, w / 2 + 18, h / 2 - 26);
            const b = this.b = s.add.container(0, 0, [g, tx]).setDepth(D.BALAO).setScrollFactor(0), t0 = performance.now(); b.bw = w; b.bh = h; if (dim) s.foco(foc); tx.setText(''); let ci = 0, typing = true; const ty = s.time.addEvent({ delay: 34, loop: true, callback: () => { if (!tx.active) { ty.remove(); return } ci++; tx.setText(t.slice(0, ci)); this.letraSom(t[ci - 1]); if (ci >= t.length) { typing = false; ty.remove() } } });
            const fin = f => { if ((f !== true && performance.now() - t0 < 250) || this.b !== b) return; if (f !== true && typing) { ci = t.length; tx.setText(t); typing = false; ty.remove(); return } ty.remove(); b.destroy(); this.b = null; s.input.off('pointerdown', fin); if (dim) s.unfoco(); res() }; this.fin = fin; s.input.on('pointerdown', fin); const md = /\?/.test(t) ? 's' : /!/.test(t) ? 'f' : /erro|perd|vermelh|bloque|❌/i.test(t) ? 't' : /cuidado|atenç|só um|ordem|traduza/i.test(t) ? 'r' : 'n'; this.mood(md); if (this.tk) this.tk.remove(); let q = 0; const nn = Math.min(24, t.length / 2 | 0); this.tk = s.time.addEvent({ delay: 150, repeat: nn, callback: () => { if (!this.c.active) return; if (this.i.list[0]) this.s.tweens.add({ targets: this.i.list[0], scale: 1.07, duration: 70, yoyo: true }); q++; if (q > nn) this.mouth.setText(this.m0); else { this.mouth.setText(q % 2 ? '010' : this.m0); if (q % 5 == 0) this.eyes.forEach(x => x.setText(pick([this.e0, '0', '^']))) } } });
            this.pb();
            s.tweens.add({ targets: this.i, angle: { from: -5, to: 5 }, duration: 180, yoyo: true, repeat: 3, onComplete: () => this.i.setAngle(0) })
        })
    }
    skip() { if (this.fin) this.fin(true) }
    letraSom(ch) { if (!ch || !/\S/.test(ch)) return; const c = ch.toLowerCase().charCodeAt(0); tone(520 + ((c * 37) % 11) * 36 + (/[aeiouáéíóúâêôãõ]/.test(ch.toLowerCase()) ? 70 : 0), .045, 'square', .05) }
    sai() { this.s.tweens.add({ targets: this.c, scale: 0, alpha: 0, duration: 400, onComplete: () => this.destroy() }) }
    destroy() { if (this.ev) this.ev.remove(); if (this.tk) this.tk.remove(); if (this.b) this.b.destroy(); this.c.destroy() }
}
/* ---------- mundo ---------- */
const TC = { acl: 0xB07CC6, rota: 0x5C8DE0, vlan: 0x4DB6AC, dns: 0xE58FB0, nat: 0xC9A66B }, sh = c => '#' + c.toString(16).padStart(6, '0');
const RL = { escudo: ['ESCUDO', 'ESCUDO DE PACOTE', 'O primeiro erro de cada zona não custa vida.', 8], reserva: ['RESERVA', 'VIDA DE RESERVA', 'Máximo de 6 vidas e +1 vida agora.', 7], via: ['2ª VIA', 'SEGUNDA VIA', 'Ao perder todas as vidas, volta com 1 vida. Uma vez.', 8], amort: ['AMORTECEDOR', 'AMORTECEDOR', 'O primeiro erro de cada zona não zera a sequência.', 6], amp: ['AMPULHETA', 'AMPULHETA', '+5 s em toda ramificação.', 7], sorte: ['SORTE', 'CRONÔMETRO DE SORTE', 'Acertar com mais da metade do tempo sobrando dá +3 s na próxima.', 6], para: ['PARAQUEDAS', 'PARAQUEDAS', 'Se o tempo acabar, perde só 1 vida. Vale uma vez.', 7], cofre: ['COFRINHO', 'COFRINHO', '+1 Byto-Coin por ramificação acertada.', 8], combo: ['COMBO', 'COMBO DOURADO', 'Com sequência de 3+, cada acerto rende +2 Byto-Coins.', 9], juros: ['JUROS', 'JUROS', 'Ao entrar na loja, ganha 10% das moedas (máx. +3).', 7], desc: ['DESCONTO', 'DESCONTO DO BYTO', 'Tudo na loja custa 1 moeda a menos.', 9], atalho: ['ATALHO', 'ATALHO DE CABO', 'Acertar em menos de 5 s dobra as moedas do acerto.', 8], meio: ['½ TEMPO', 'METADE DO TEMPO', 'Você tem metade do tempo, mas ganha o dobro de moedas.', 7], pen: ['PENEIRA', 'PENEIRA', 'A cada 3 ramificações, um caminho errado some de graça.', 8], risco: ['RISCO', 'GRANDE RISCO', 'Acertar no último segundo devolve 1 vida, mas sem moedas.', 8] };
class WorldScene extends Phaser.Scene {
    constructor() { super('World') }
    create(d) { try { console.log('create'); this.setup(d || {}); console.log('create ok') } catch (e) { this.erro(e) } }
    erro(e) { console.error(e); const t = txt(this, this.scale.width / 2, this.scale.height / 2, 'Erro — reiniciar', { fontSize: '32px' }).setOrigin(.5).setDepth(D.POPUP).setInteractive({ useHandCursor: true }); t.on('pointerdown', () => this.sair({})) }
    setup(d) {
        const W = this.W = this.scale.width, H = this.H = this.scale.height, nar = this.nar = W < 700, m = this.m = nar ? 16 : 40;
        this.mob = !this.game.device.os.desktop; this.cy = H * (nar ? .56 : .46); this.rest = W * .2; this.vidas = 5; this.maxV = 5; this.bc = 0; this.rel = []; this.gone = []; this.rz = {}; this.zk = 0; this.sorte = 0; this.pc = 0; this.t0b = 0; this.up = { skip: 0, reveal: 0, elim: 0 }; this.extra = 0; this.wo = []; this.pool = []; this.pp = { x: 135, y: this.cy - 30 }; this.proxX = 200; this.tl = 0; this.dead = false; this.tut = save.ajuda !== false; this.bag = null; this.sig = ''; this.fase = 1; this.ramo = 1; this.inf = !!d.inf; this.dist = 0; this.skb = { bag: [] }; HARD = this.inf ? .4 : 0; this.seq = 0; this.cfgT = []; this.fast = false; cur = [];
        this.cameras.main.setBackgroundColor(0x12121A); this.cameras.main.scrollX = 135 - this.rest; bgLines(this);
        this.par = [];[[.06, 1, 0x1E1E2A], [.15, 1, 0x1E1E2A], [.25, 2, 0x2E2E3E], [.35, 2, 0x2E2E3E], [.5, 3, 0x3A3A4E], [.6, 3, 0x3A3A4E], [.85, 4, 0x3A3A4E]].forEach(([f, s, c], l) => { for (let i = 0; i < 16; i++) { const o = this.add.rectangle(Math.random() * (W + 40), Math.random() * H, s * 12, s * 2, c).setScrollFactor(f).setDepth(2 + s); o.f = f; o.l = [0, 0, 1, 1, 2, 2, 2][l]; this.par.push(o) } });
        this.pcUI();
        this.pkt = mkPacote(this); this.pkt.cor(save.cor || 0); this.cs = []; this.pkt.setPosition(135, this.cy - 30).setDepth(D.PAC);
        this.hearts = [0, 1, 2, 3, 4, 5].map(() => txt(this, 0, 0, '1', { fontFamily: M, fontSize: '30px', fontStyle: 'bold' }).setScrollFactor(0).setDepth(D.HUD));
        this.cTx = txt(this, 0, 0, '🪙 0', { fontFamily: M, fontSize: '22px', fontStyle: 'bold', color: '#E8B44B' }).setScrollFactor(0).setDepth(D.HUD); this.relDesc = txt(this, 0, 0, '', { fontFamily: 'Arial, sans-serif', fontSize: '12px', color: '#E8B44B', wordWrap: { width: 360 } }).setScrollFactor(0).setDepth(D.HUD); this.relTx = this.relDesc;
        this.rsl = [0, 1, 2].map(i => {
            const c = this.add.container(0, 0).setScrollFactor(0).setDepth(D.HUD), b = this.add.rectangle(0, 0, 118, 34, PN).setOrigin(0).setStrokeStyle(2, AM), t = txt(this, 59, 17, '', { fontSize: '11px', align: 'center', wordWrap: { width: 110 } }).setOrigin(.5); c.add([b, t]); c.setSize(118, 34); c.setInteractive(new Phaser.Geom.Rectangle(0, 0, 118, 34), Phaser.Geom.Rectangle.Contains); c.input.cursor = 'pointer'; c.t = t; c.b = b;
            c.on('pointerover', () => { if (this.shop && this.selK) return; const k = this.rel[i]; this.relDesc.setText(k ? RL[k][1] + ': ' + RL[k][2] : 'Espaço de relíquia livre.') }); c.on('pointerout', () => { if (!this.selK) this.relDesc.setText('') }); c.on('pointerdown', () => this.vender(i)); return c
        });
        this.rp = {};
        this.pkBg = this.add.rectangle(0, 0, 10, 10, PN).setOrigin(0).setStrokeStyle(3, LN).setScrollFactor(0).setDepth(D.HUD);
        this.pkC = this.add.container(0, 0).setScrollFactor(0).setDepth(D.HUD); this.pkW = 10; this.pkH = 10;
        this.faseTx = txt(this, 0, 0, '', { color: '#E8B44B' }).setScrollFactor(0).setDepth(D.HUD);
        this.tbar = this.add.rectangle(0, 0, W * .4, 6, AM).setOrigin(0, .5).setScrollFactor(0).setDepth(D.HUD).setVisible(false);
        this.cdx = btn(this, 0, 0, nar ? 130 : 170, nar ? 52 : 56, nar ? '📖 CODEX' : '📖 CODEX [C]', () => this.abrirCodex(), nar ? 17 : 19).setScrollFactor(0);
        this.setB = btn(this, 0, 0, nar ? 110 : 150, 48, 'CONFIG', () => this.abrirSet(), 18).setScrollFactor(0);
        this.kC = this.input.keyboard.addKey('C'); this.kC.on('down', this.abrirCodex, this);
        this.scale.on('resize', this.layout, this);
        this.events.once('shutdown', () => { this.dead = true; try { this.scale.off('resize', this.layout, this); this.events.off('resume', this.rs, this); fireSet(0); this.kC.removeAllListeners() } catch (e) { } });
        this.time.addEvent({ delay: 1600, loop: true, callback: () => { if (this.dead || this.menu) return; const cam = this.cameras.main, p = this.add.circle(cam.scrollX - 10, this.cy, 3, 0xF2E8D5, .9).setDepth(D.CABOS + 1); this.tweens.add({ targets: p, x: cam.scrollX + this.W + 10, duration: 2200, onComplete: () => p.destroy() }) } });
        this.hud = [...this.hearts, this.cTx, ...this.rsl, this.relDesc, this.pkBg, this.pkC, this.faseTx, this.cdx, this.setB]; this.zona(1); this.events.on('resume', this.rs, this); this.updH(); this.setFase(); this.layout(); musV('menu');
        if (d.play) { this.menu = false; this.pcStop(); this.jornada() } else { this.menu = true; this.hud.forEach(o => o.setVisible(false)); this.menuUI() }
    }
    layout() {
        try {
            const { W, H, m, nar } = this, ph = this.pkH;
            this.hearts.forEach((h, i) => h.setPosition(m + i * (nar ? 24 : 30), nar ? H - m - 30 : m)); this.cTx.setPosition(m + (nar ? 150 : 196), nar ? H - m - 32 : m + 4); this.rsl.forEach((c, i) => c.setPosition(m + i * 124, nar ? H - m - 150 : H - m - 38)); this.relDesc.setPosition(m, nar ? H - m - 176 : H - m - 62);
            this.pkBg.setSize(nar ? W - 2 * m : this.pkW, ph).setPosition(m, nar ? m : this.cy + 60); this.pkC.setPosition(m + 15, this.pkBg.y + 10);
            this.faseTx.setOrigin(.5, 0).setPosition(W / 2, nar ? m + ph + 8 : m); this.tbar.setPosition(W * .3, nar ? m + ph + 60 : m + 64);
            this.cdx.setPosition(nar ? m + 65 : W - m - 85, nar ? H - m - 100 : m + 28); this.setB.setPosition(nar ? m + 195 : W - m - 260, nar ? H - m - 100 : m + 28); if (this.byto) this.byto.place()
        } catch (e) { console.error(e) }
    }
    setPacket(p, rel) {
        this.pk = p; const it = [[p.id, TX, 'id'], ...(rel || []).map(k => [FT[k][2] + ' ' + FT[k][3](p), FC[k], k])];
        this.pkC.removeAll(true); let x = 0, y = 0, w = 0; const mx = this.nar ? this.W - 2 * this.m - 30 : 1e4;
        it.forEach(([s, c]) => { const t = txt(this, 0, 0, s, { fontFamily: M, fontSize: '16px', fontStyle: 'bold', color: c }); if (this.nar) { if (x + t.width > mx && x > 0) { x = 0; y += 24 } t.setPosition(x, y); x += t.width + 16; w = Math.max(w, x) } else { t.setPosition(0, y); y += 24; w = Math.max(w, t.width) } this.pkC.add(t) });
        this.pkW = w + 30; this.pkH = (this.nar ? y + 24 : y) + 20; this.layout();
        sfx.chg(); this.tweens.add({ targets: this.pkt, scale: 2.4, duration: 300, yoyo: true, hold: 500, ease: 'Back.easeOut' });
        this.pkC.setAlpha(1); this.pkBg.setAlpha(1); this.tweens.add({ targets: [this.pkC, this.pkBg], alpha: { from: 1, to: .15 }, duration: 110, yoyo: true, repeat: 5 }); this.pkBg.setStrokeStyle(3, AM); this.time.delayedCall(1400, () => this.pkBg.active && this.pkBg.setStrokeStyle(3, LN))
    }
    updH() { this.hearts.forEach((h, i) => { const on = i >= this.maxV - this.vidas; h.setAlpha(i < this.maxV ? 1 : 0); h.setText(on ? '1' : '0').setColor(on ? '#6BBF59' : '#D64545') }); this.cTx.setText('🪙 ' + this.bc); this.relHud() }
    setFase(t) { if (this.inf) { this.faseTx.setAlign('center').setText('∞ DISTÂNCIA ' + this.dist + '\nRECORDE ' + (save.recorde || 0)); this.layout(); return } const f = this.fase; this.faseTx.setAlign('center').setText([0, 1, 2, 3, 4].map(i => i < f ? '■' : '□').join(' -- ') + '\n' + (t || 'ZONA ' + f + ' · ramo ' + this.ramo + '/5')); this.layout() }
    zona(f, sc) {
        const o0 = this.zcur || [ZB[0], ZC[0]], n = [ZB[f - 1], ZC[f - 1]], C = Phaser.Display.Color, I = (a, b, v) => { const x = C.Interpolate.ColorWithColor(C.IntegerToColor(a), C.IntegerToColor(b), 100, v); return C.GetColor(x.r, x.g, x.b) };
        this.zn = f - 1; this.zcur = n; if (f > 1 && !sc) this.cortina(f); mus.z = f - 1; mus.b = 260 - (f - 1) * 28; mus.sp = mus.b; this.fundo(f - 1); this.tweens.addCounter({ from: 0, to: 100, duration: this.zcur === o0 ? 1 : 1800, onUpdate: q => { const v = q.getValue(); this.cameras.main.setBackgroundColor(I(o0[0], n[0], v)); this.par.forEach(o => o.setFillStyle(I(o0[1][o.l], n[1][o.l], v))) } })
    }
    corTela(on) {
        if (!this.menu || this.cz === on) return; const W = this.W, H = this.H, cam = this.cameras.main, z = 2.4;
        if (on) {
            this.cz = true; this.tweens.add({ targets: this.mn, alpha: 0, duration: 300, onComplete: () => this.mn.forEach(o => o.setVisible(false)) });
            this.tweens.add({ targets: cam, zoom: z, scrollX: this.pkt.x - W / 2 - (W * .28 - W / 2) / z, scrollY: this.pkt.y - H / 2, duration: 700, ease: 'Cubic.easeInOut', onComplete: () => this.coresUI(z) })
        }
        else { (this.cs || []).forEach(o => o.destroy()); this.cs = []; this.mn.forEach(o => o.setVisible(true)); this.tweens.add({ targets: this.mn, alpha: 1, duration: 400 }); this.tweens.add({ targets: cam, zoom: 1, scrollX: this.pp.x - this.rest, scrollY: 0, duration: 700, ease: 'Cubic.easeInOut', onComplete: () => { this.cz = false } }) }
    }
    /* as opções ficam no mundo (escala 1/zoom) porque o zoom da câmera também afeta objetos fixos na tela */
    coresUI(z) {
        const W = this.W, H = this.H, nar = this.nar, cam = this.cameras.main, cs = this.cs = [], sw = nar ? 80 : 104, sh = nar ? 52 : 60, xs = nar ? [W * .56, W * .82] : [W * .62, W * .8], y0 = H * (nar ? .22 : .2), dy = nar ? 80 : 84, mx = (xs[0] + xs[1]) / 2;
        const at = (sx, sy) => { const p = cam.getWorldPoint(sx, sy); return [p.x, p.y] }, sel = () => cs.forEach(o => o.r && o.r.setStrokeStyle(4, o.idx == (save.cor || 0) ? 0xF2E8D5 : LN));
        { const [a, b] = at(mx, y0 - 48); cs.push(txt(this, a, b, 'COR DO PACOTE', { fontSize: nar ? '20px' : '26px', color: '#E8B44B' }).setOrigin(.5).setScale(1 / z).setDepth(D.BTN)) }
        PALS.forEach((p, i) => {
            const [a, b] = at(xs[i % 2] - sw / 2, y0 + (i >> 1) * dy - sh / 2), c = this.add.container(a, b).setScale(1 / z).setDepth(D.BTN), r = this.add.rectangle(0, 0, sw, sh, p.f).setOrigin(0).setStrokeStyle(4, (save.cor || 0) == i ? 0xF2E8D5 : LN), t = txt(this, sw / 2, sh + 10, p.n, { fontSize: '12px' }).setOrigin(.5);
            c.add([r, t]); c.setSize(sw, sh); c.setInteractive(new Phaser.Geom.Rectangle(0, 0, sw, sh), Phaser.Geom.Rectangle.Contains); c.input.cursor = 'pointer'; c.r = r; c.idx = i;
            c.on('pointerover', () => { sfx.tick(); r.setStrokeStyle(4, AM) }); c.on('pointerout', sel); c.on('pointerdown', () => { save.cor = i; salvar(); this.pkt.cor(i); sfx.pop(); sel() }); cs.push(c)
        });
        { const [a, b] = at(mx, H * .9); cs.push(btn(this, a, b, 200, 56, 'VOLTAR', () => this.corTela(false), 22).setScale(1 / z)) }
    }
    rs() { this.cameras.main.fadeIn(250, 18, 18, 26); if (this.menu && this.mn && !this.cz) { this.mn.forEach(o => o.destroy()); this.menuUI() } }
    titleUI(W, H, nar) {
        const y = H * .13, fs = nar ? 56 : 92, st = { fontSize: fs + 'px', stroke: '#12121A', strokeThickness: nar ? 7 : 10, letterSpacing: nar ? 4 : 6 },
        a = txt(this, 0, y, 'HOP ', { ...st, color: '#E8B44B' }).setOrigin(0, .5).setShadow(3, 6, '#5A3C0E', 0, true, true), b = txt(this, 0, y, 'LIMIT', { ...st, color: '#F2E8D5' }).setOrigin(0, .5).setShadow(3, 6, '#3A3A4E', 0, true, true), tw = a.width + b.width;
        a.x = W / 2 - tw / 2; b.x = a.x + a.width; const ly = y + (nar ? 44 : 68);
        return [a, b, this.add.rectangle(W / 2, ly, tw, 5, CY), this.add.rectangle(W / 2 - tw / 2, ly, 12, 12, AM), this.add.rectangle(W / 2 + tw / 2, ly, 12, 12, AM),
            txt(this, W / 2, ly + (nar ? 22 : 28), 'O PACOTE QUE NÃO PODE PARAR', { fontSize: nar ? '12px' : '15px', color: '#F2E8D5', letterSpacing: 4 }).setOrigin(.5).setAlpha(.85),
            txt(this, W / 2, ly + (nar ? 46 : 56), '∞ DISTÂNCIA MÁXIMA: ' + (save.recorde || 0), { fontSize: nar ? '13px' : '16px', color: '#5FB8C8' }).setOrigin(.5)]
    }
    menuUI() {
        const { W, H, nar } = this, x = nar ? W / 2 : W * .64, y0 = nar ? H * .4 : H * .36, w = nar ? 300 : 320;
        this.mn = [...this.titleUI(W, H, nar),
        btn(this, x, y0, w, 64, 'INICIAR', () => this.iniciar(), 28), btn(this, x, y0 + 84, w, 64, 'CODEX', () => this.abrirCodex(), 28), btn(this, x, y0 + 168, w, 64, 'CONFIGURAÇÕES', () => this.abrirSet(), 24), btn(this, x, y0 + 252, w, 64, 'COR DO PACOTE', () => this.corTela(true), 24), ...(save.venceu || DEBUG ? [btn(this, x, y0 + 336, w, 64, '∞ MODO INFINITO', () => this.sair({ play: true, inf: true }), 24)] : [])]; this.mn.forEach(o => o.setScrollFactor(0).setDepth(D.BTN))
    }
    pcUI() {
        const cy = this.cy, A = o => { this.wo.push(o); return o }, z = D.DISP;
        A(this.add.rectangle(135, cy - 30, 200, 132, 0x2A2A38).setStrokeStyle(4, LN).setDepth(z)); A(this.add.rectangle(135, cy - 30, 174, 106, 0x0B0B12).setStrokeStyle(2, CY).setDepth(z));
        A(this.add.rectangle(135, cy + 46, 26, 14, 0x2A2A38).setDepth(z)); A(this.add.rectangle(135, cy + 54, 96, 8, 0x2A2A38).setStrokeStyle(2, LN).setDepth(z));
        A(this.add.rectangle(135, cy + 84, 190, 34, PN).setStrokeStyle(3, LN).setDepth(z)); this.keys = [];
        for (let r = 0; r < 3; r++)for (let k = 0; k < 12; k++)this.keys.push(A(this.add.rectangle(55 + k * 12.5 + r * 4, cy + 74 + r * 10, 9, 7, LN).setDepth(z + 1)));
        this.enter = A(this.add.rectangle(211, cy + 94, 26, 9, 0x5A5A6E).setDepth(z + 1));
        this.scr = A(txt(this, 57, cy - 76, '', { fontFamily: M, fontSize: '10px', color: '#6BBF59', lineSpacing: 3 }).setDepth(z + 1));
        const S = '$ ssh servidor\nlogin ok\n$ ls dados/\n$ enviar pacote'; let i = 0;
        this.tp = this.time.addEvent({ delay: 110, loop: true, callback: () => { i = (i + 1) % (S.length + 14); this.scr.setText(S.slice(0, Math.min(i, S.length)) + (i % 4 < 2 ? '_' : '')); const k = pick(this.keys); k.setFillStyle(AM); this.time.delayedCall(70, () => k.active && k.setFillStyle(LN)) } })
    }
    pcStop() { if (this.tp) this.tp.remove() }
    async iniciar() {
        if (!this.menu) return; this.menu = false; initAudio(); this.pcStop();
        this.tweens.add({ targets: this.mn, alpha: 0, duration: 400, onComplete: () => this.mn.forEach(o => o.destroy()) });
        this.scr.setText('> enviar pacote\n  [ENTER]'); await this.wait(300);
        await this.tw({ targets: this.enter, scaleX: .8, scaleY: .5, duration: 90, yoyo: true }); this.enter.setFillStyle(AM); tone(300, .06, 'square', .12); sfx.pop(); this.scr.setText('> enviado!'); await this.wait(350);
        sfx.whoosh(); this.fast = true; this.hud.forEach(o => o.setVisible(true)); await this.tw({ targets: this.pp, x: this.pp.x + 170, y: this.cy, duration: 750, ease: 'Sine.easeIn' }); this.fast = false; this.jornada()
    }
    abrirCodex() { if (this.dead || this.scene.isActive('Codex')) return; if (this.byto) this.byto.skip(); save.vistos = [...new Set([...(save.vistos || []), ...cur])]; salvar(); if (this.cpl) { this.cpl.stop(); this.cpl = null; this.cdx.setScale(1) } this.scene.pause(); this.scene.launch('Codex', { de: 'World', guia: !!this.guia }) }
    abrirSet() { if (this.dead || this.scene.isActive('Settings')) return; this.scene.pause(); this.scene.launch('Settings', { de: 'World' }) }
    foco(l) {
        this.fo = []; this.dm = this.add.rectangle(this.W / 2, this.H / 2, this.W, this.H, 0x12121A, .74).setScrollFactor(0).setDepth(1500).setInteractive(); const cam = this.cameras.main, R = [];
        (l || []).filter(o => o && o.active).forEach(o => { this.fo.push([o, o.depth]); o.setDepth(D.FOCO); if (!o.visible) return; try { const b = o.getBounds(), sx = o.scrollFactorX ? cam.scrollX : 0, sy = o.scrollFactorY ? cam.scrollY : 0, x0 = Math.max(0, b.x - sx - 6), y0 = Math.max(0, b.y - sy - 6), x1 = Math.min(this.W, b.right - sx + 6), y1 = Math.min(this.H, b.bottom - sy + 6); if (x1 > x0 && y1 > y0) R.push([x0, y0, x1, y1]) } catch (e) { } });
        for (let ch = 1; ch;) { ch = 0; for (let i = 0; i < R.length && !ch; i++)for (let j = i + 1; j < R.length; j++) { const a = R[i], b = R[j]; if (a[0] <= b[2] + 8 && b[0] <= a[2] + 8 && a[1] <= b[3] + 8 && b[1] <= a[3] + 8) { R[i] = [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[2], b[2]), Math.max(a[3], b[3])]; R.splice(j, 1); ch = 1; break } } }
        this.fr = R.map(r => { const q = this.add.rectangle(r[0], r[1], r[2] - r[0], r[3] - r[1]).setOrigin(0).setStrokeStyle(3, AM).setScrollFactor(0).setDepth(1850); this.tweens.add({ targets: q, alpha: .45, yoyo: true, repeat: -1, duration: 500 }); return q })
    }
    unfoco() { if (this.dm) { this.dm.destroy(); this.dm = null } (this.fr || []).forEach(q => { this.tweens.killTweensOf(q); q.destroy() }); this.fr = []; (this.fo || []).forEach(([o, d]) => o.active && o.setDepth(d)); this.fo = [] }
    limpar() { try { this.time.removeAllEvents(); this.tweens.killAll(); this.input.removeAllListeners(); this.input.keyboard.removeAllKeys(); this.children.list.slice().forEach(o => o.destroy()) } catch (e) { console.error(e) } }
    sair(d) { this.dead = true; this.limpar(); this.scene.start('World', d) }
    tw(c) { return new Promise(r => this.tweens.add({ ...c, onComplete: r })) }
    wait(ms) { return new Promise(r => this.time.delayedCall(ms, r)) }
    async path(pts, dur = 220) { this.mov = true; sfx.move(); for (const q of pts) await this.tw({ targets: this.pp, x: q[0], y: q[1], duration: dur, ease: 'Sine.easeInOut' }); this.mov = false }
    fala(t, f) { return this.byto ? this.byto.say(t, f) : Promise.resolve() }
    puff(x, y, c, vx, vy, l, s = 6) {
        let r = this.pool.find(q => !q.active); if (!r) { r = this.add.rectangle(0, 0, 6, 6, c).setDepth(D.RASTRO); this.pool.push(r) }
        r.setActive(true).setVisible(true).setPosition(x, y).setFillStyle(c).setAlpha(1).setScale(s / 6);
        this.tweens.add({ targets: r, x: x + vx, y: y + vy, alpha: 0, scale: .2, duration: l, onComplete: () => r.setActive(false).setVisible(false) })
    }
    burst(x, y, c, n, up) { for (let i = 0; i < n; i++)this.puff(x, y, c, (Math.random() - .5) * 160, up ? -60 - Math.random() * 120 : (Math.random() - .5) * 160, 600 + Math.random() * 400, 8) }
    update(t, dt) {
        try {
            if (!this.pkt || !this.pkt.active) return; const cam = this.cameras.main, W = this.W;
            /* lerp manual: mantém o pacote fixo na tela (0.2W); mais rápido no avanço */
            if (!this.cz) cam.scrollX += (this.pp.x - this.rest - cam.scrollX) * (this.fast ? .2 : .08); const v = Math.abs(this.pp.x - (this.lx ?? this.pp.x)) / Math.max(dt, 1); this.lx = this.pp.x; this.sv = (this.sv || 0) * .85 + v * .15; const amp = this.fast ? Math.min(11, this.sv * 9) : 0; if (!this.cz) cam.scrollY = amp ? (Math.random() - .5) * 2 * amp : 0; this.pkt.setPosition(this.pp.x, this.pp.y + Math.sin(t / 220) * 4);
            (this.bgs || []).forEach(g => { if (g.tw && g.x + g.tw - cam.scrollX * g.f < 0) g.x += 2 * g.tw }); const z = this.zn, H = this.H; this.par.forEach(o => { if (o.x - cam.scrollX * o.f < -60) o.x += W + 120; const k = o.l + 1; if (z == 1) o.y += dt * .05 * k; else if (z == 2) o.y -= dt * .04 * k; else if (z == 3) o.y += Math.sin(t / 400 + o.x) * .5; else if (z == 4) { o.y += dt * .12 * k; if (Math.random() < .02) o.setAlpha(.2 + Math.random() * .8) } if (o.y > H + 10) o.y = -10; else if (o.y < -10) o.y = H + 10 });
            if (this.fast && Math.random() < .9) { const s = this.add.rectangle(cam.scrollX + W + 20, Math.random() * this.H, 160, 2, 0xF2E8D5, .5).setDepth(8); this.tweens.add({ targets: s, x: s.x - W * 1.6, alpha: 0, duration: 450, onComplete: () => s.destroy() }) }
            this.tl += dt; if (this.tl > 35 && this.pkt.visible && (this.mov || this.fast || this.sv > .02)) { this.tl = 0; const sq = this.seq || 0; this.puff(this.pkt.x - 18, this.pkt.y, sq >= 5 ? pick([AM, OK, 0xE58FB0]) : sq >= 3 ? pick([AM, OK]) : AM, -30, 0, this.mov ? 700 : 400, (this.mov ? 10 : 5) + (this.zn || 0) * 2 + Math.min(sq, 6)) }
            const lim = cam.scrollX + W * 1.5; while (this.proxX < lim) { this.wo.push(this.add.rectangle(this.proxX + 200, this.cy, 400, 6, CY).setDepth(D.CABOS)); this.proxX += 400 }
            const lo = cam.scrollX - W * .5; for (let i = this.wo.length - 1; i >= 0; i--) { const o = this.wo[i]; if (!o.active) this.wo.splice(i, 1); else if (o.x < lo) { o.destroy(); this.wo.splice(i, 1) } }
        } catch (e) { console.error(e) }
    }
    limpaCfg() { if (this.lk) { this.lk.destroy(); this.lk = null } if (this.cfgC) { this.cfgC.destroy(); this.cfgC = null; this.cfgT = [] } }
    mostrar(i) {
        const d = this.devs && this.devs[i]; if (!d) return; this.limpaCfg(); const { W, H, m, nar } = this, fs = nar ? 12 : 14, cw = fs * .6, PL = d.lines.map(parse), maxc = Math.max(...PL.map(a => a[0].length)), sx = d.obj.x - this.cameras.main.scrollX;
        let x = m, w = W - 2 * m - (nar ? 108 : 0); if (!nar) { x = sx + d.dw / 2 + 24; w = Math.min(maxc * cw + 30, W - m - x) }
        const cols = Math.floor((w - 30) / cw), c = this.cfgC = this.add.container(0, 0).setScrollFactor(0).setDepth(D.CFG), bg = this.add.rectangle(0, 0, w, 10, PN).setOrigin(0).setStrokeStyle(3, CY); c.add(bg); let y = 10; this.cfgT = [];
        PL.forEach(([pl, col], li) => { const arr = []; for (let s = 0; s < pl.length; s += cols) { const row = pl.slice(s, s + cols); let a = 0; while (a < row.length) { let b = a; while (b < row.length && col[s + b] === col[s + a]) b++; const k = col[s + a], t = txt(this, 15 + a * cw, y, row.slice(a, b), { fontFamily: M, fontSize: fs + 'px', fontStyle: k ? 'bold' : 'normal', color: k || TX }); c.add(t); arr.push(t); a = b } y += fs + 6 } this.cfgT[li] = arr; y += 3 });
        if (d.fail) [].concat(d.bad).forEach(b => this.cfgT[b] && this.cfgT[b].forEach(t => t.setColor('#D64545')));
        const h = y + 8; bg.setSize(w, h); c.setPosition(x, nar ? this.faseTx.y + 58 : Phaser.Math.Clamp(d.y - h / 2, m + 70, H - m - h - 150)); if (this.P && this.P.hint && d.bad === -1) this.link(i)
    }
    hl(l) { [].concat(l).forEach(i => (this.cfgT[i] || []).forEach(t => { t.setColor('#D64545'); this.tweens.add({ targets: t, alpha: .3, duration: 200, yoyo: true, repeat: 7 }) })) }
    escolher(i) { const d = this.devs && this.devs[i]; if (this.escolhendo || !this.res || (d && d.dead)) return; this.escolhendo = true; sfx.sel(); const r = this.res; this.res = null; r(i) }
    timer(res, s) { const b = this.tbar; b.setVisible(true).setScale(1, 1); mus.sp = mus.b; const t0 = this.time.now; let ls = 99; this.spc = this.tweens.addCounter({ from: mus.b, to: 100, duration: s * 1000, onUpdate: q => { mus.sp = q.getValue(); const rm = s - (this.time.now - t0) / 1000, c = Math.ceil(rm); if (c < ls && rm <= 10) { ls = c; tone(rm <= 3 ? 2600 : 2000, .03, 'square', .07); if (rm <= 3) this.time.delayedCall(450, () => tone(2600, .03, 'square', .07)) } } }); this.tweens.add({ targets: b, scaleX: 0, duration: s * 1000, onComplete: () => { if (this.res === res && !this.escolhendo) { this.escolhendo = true; this.res = null; res(-1) } } }) }
    async perde(free) {
        if (free) return; if (this.tem('escudo') && this.rz.escudo != this.zk) { this.rz.escudo = this.zk; this.anuncio('ESCUDO DE PACOTE!\nSem perda de vida', '#5FB8C8', 34, 1400); tone(900, .2, 'triangle', .1); return }
        this.vidas--; this.dano = true; this.updH(); this.danoFx(); tone(160, .3, 'sawtooth', .15); vib(80);
        if (this.vidas <= 0) { if (this.tem('via')) { this.rel = this.rel.filter(x => x != 'via'); this.gone.push('via'); this.vidas = 1; this.updH(); this.anuncio('SEGUNDA VIA!\nUma vida de volta', '#E8B44B', 36, 1500) } else { await this.fim(false); throw 'over' } }
    }
    /* monta N dispositivos ligados por cabos à linha principal (usado em ramos e loja) */
    montar(bx, items) {
        const { W, H, nar } = this, n = items.length, dw = nar ? 96 : 120, dh = nar ? 48 : 60, off = nar ? W - this.m - dw / 2 - this.rest : W * .24, mid = off * .4, gap = Math.min(nar ? 90 : 110, (H - this.m * 2 - 170) / n), objs = [];
        items.forEach((d, i) => {
            const y = this.cy + (i - (n - 1) / 2) * gap; Object.assign(d, { y, dw, mid, off, bx }); d.col = d.col || CY;
            const g = d.g = this.add.graphics().setDepth(D.CABOS); g.x = bx; this.cab(d, CY); objs.push(g); this.wo.push(g);
            const c = this.add.container(bx + off, y).setDepth(D.DISP), rc = this.add.rectangle(0, 0, dw, dh, PN).setStrokeStyle(3, d.col), g2 = this.add.graphics(); desenho(g2, d.tp, dw, dh);
            c.add([rc, g2, d.tp ? txt(this, 0, dh / 2 + 12, d.label, { fontSize: '12px' }).setOrigin(.5) : txt(this, 0, 0, d.label, { fontSize: '13px', color: sh(d.col) }).setOrigin(.5)]);
            animar(this, c, d.tp, dw, dh); c.setSize(dw, dh); c.setInteractive(new Phaser.Geom.Rectangle(0, 0, dw, dh), Phaser.Geom.Rectangle.Contains); c.input.cursor = 'pointer';
            d.obj = c; d.rc = rc; this.wo.push(c); objs.push(c); const st = () => rc.setStrokeStyle(d.dead ? 4 : 3, d.fail ? ER : d.out ? 0x555566 : d.col);
            if (this.mob) c.on('pointerdown', () => { if (this.sel === i) this.escolher(i); else { this.sel = i; this.mostrar(i); sfx.tick() } });
            else { c.on('pointerover', () => { if (this.dm || this.demo) return; rc.setStrokeStyle(5, 0xF2E8D5); sfx.tick(); vib(5); if (!this.trava) this.estado('c'); this.tweens.add({ targets: c, scale: 1.05, duration: 80 }); (this.devs || []).forEach((o, j) => j != i && o.obj && o.obj.setAlpha(.7)); if (!this.trava) this.mostrar(i) }); c.on('pointerout', () => { if (this.dm || this.demo) return; st(); if (!this.trava) this.estado(''); this.tweens.add({ targets: c, scale: 1, duration: 80 }); (this.devs || []).forEach(o => o.obj && o.obj.setAlpha(o.out ? .45 : 1)); if (!this.trava) this.limpaCfg() }); c.on('pointerdown', () => this.escolher(i)) }
            c.setScale(0); this.tweens.add({ targets: c, scale: 1, duration: 250, delay: i * 60, ease: 'Back.easeOut' })
        });
        const nd = this.add.circle(bx, this.cy, 7, AM).setDepth(D.CABOS + 1); this.tweens.add({ targets: nd, scale: 1.4, alpha: .6, duration: 600, yoyo: true, repeat: -1 }); this.wo.push(nd); objs.push(nd);
        items.forEach(d => { const p = this.add.circle(bx, this.cy, 3, 0xF2E8D5).setDepth(D.CABOS + 1); this.wo.push(p); objs.push(p); const ch = this.tweens.chain({ targets: p, loop: -1, loopDelay: 1200 + Math.random() * 2000, tweens: [{ x: bx + d.mid, y: this.cy, duration: 300 }, { x: bx + d.mid, y: d.y, duration: 200 }, { x: bx + d.off - d.dw / 2, y: d.y, duration: 300 }] }); p.once('destroy', () => ch.stop()) });
        this.devs = items; sfx.pop(); return objs
    }
    cab(d, col) { const g = d.g, { off, mid, dw, y } = d; g.clear().lineStyle(4, col); g.beginPath(); g.moveTo(0, this.cy); g.lineTo(mid, this.cy); g.lineTo(mid, y); g.lineTo(off - dw / 2, y); g.moveTo(off + dw / 2, y); g.lineTo(off + dw / 2 + 90, y); g.lineTo(off + dw / 2 + 90, this.cy); g.strokePath() }
    ir(d) { return this.path([[d.bx + d.mid, this.cy], [d.bx + d.mid, d.y], [d.bx + d.off - d.dw / 2 - 24, d.y]]) }
    volta(d) { return this.path([[d.bx + d.mid, d.y], [d.bx + d.mid, this.cy], [d.bx, this.cy]]) }
    /* sucesso: o pacote atravessa o dispositivo e segue em frente em alta velocidade */
    async passa(d) { const ex = d.bx + d.off + d.dw / 2 + 90; this.fast = true; sfx.whoosh(); await this.tw({ targets: this.pp, x: d.bx + d.off + d.dw / 2 + 30, duration: 260, ease: 'Quad.easeIn' }); await this.path([[ex, d.y], [ex, this.cy], [ex + this.W * .3, this.cy]], 200) }
    async avancar() { const bx = this.pp.x + this.W * .55; this.fast = true; sfx.move(); await this.tw({ targets: this.pp, x: bx, y: this.cy, duration: (bx - this.pp.x) / .4, ease: 'Cubic.easeOut' }); this.fast = false; sfx.stop(); return bx }
    rev(...a) { a.flat().forEach(o => o && o.setVisible && o.setVisible(true)) }
    async ghost(i) { if (!this.gh) this.gh = txt(this, this.W * .3, this.H * .85, '🖱️', { fontSize: '30px' }).setScrollFactor(0).setDepth(1850); const d = this.devs[i]; await this.tw({ targets: this.gh, x: d.obj.x - this.cameras.main.scrollX, y: d.y + 8, duration: 700, ease: 'Sine.easeInOut' }) }
    ghostOff() { if (this.gh) { this.gh.destroy(); this.gh = null } }
    /* linha que liga o dado do painel ao valor igual na regra (só nas lições guiadas) */
    link(i) {
        if (this.lk) { this.lk.destroy(); this.lk = null } const arr = this.cfgT && this.cfgT[1], row = this.pkC.list[1]; if (!arr || !arr.length || !row || !this.cfgC) return; const t = arr.find(x => x.style.color !== TX) || arr[0], g = this.lk = this.add.graphics().setScrollFactor(0).setDepth(D.CFG + 1); g.lineStyle(3, 0xE8B44B, .95);
        const x1 = this.pkC.x + row.x + row.width + 8, y1 = this.pkC.y + row.y + row.height / 2, x2 = this.cfgC.x + t.x - 6, y2 = this.cfgC.y + t.y + t.height / 2, xm = (x1 + x2) / 2; g.beginPath(); g.moveTo(x1, y1); g.lineTo(xm, y1); g.lineTo(xm, y2); g.lineTo(x2, y2); g.strokePath(); this.tweens.add({ targets: g, alpha: .35, yoyo: true, repeat: -1, duration: 450 })
    }
    async mundo0() {
        this.fase = 0; this.zona(1, true); const PK = [this.pkBg, this.pkC], H = this.hearts, F = (t, f) => this.fala(t, f), mob = this.mob;
        [...this.hud].flat().forEach(o => o.setVisible(false));
        const star = o => { o.dead = true; o.obj.setAlpha(.6); o.obj.add(txt(this, 0, -o.obj.height / 2 - 12, '★ CERTO', { fontSize: '12px', color: '#6BBF59' }).setOrigin(.5)) };
        const errG = async function () { await F('A linha em vermelho mostra o motivo do bloqueio. É só treino: tente o outro!') };
        const ph = [
            {
                K: ['dst0'], n: 2, free: 1, nocur: 1, pre: async function () { await F('Olá! Eu sou o Byto. Esta caixa é você: um pacote de dados.', [this.pkt]); await F('Você viaja por uma rede de computadores até chegar ao destino.') },
                pos: async function (r, o, dv) {
                    this.demo = true; this.rev(this.pkBg, this.pkC); await F('Este painel é a sua etiqueta: ele diz para onde você vai.', [this.pkBg, this.pkC]);
                    await F('Cada caixa à frente é um porteiro com uma lista de convidados. Só passa quem está na lista.', dv);
                    const w = r.devs.findIndex((d, i) => i != r.ok); await this.ghost(w); this.mostrar(w); await F('Vou ler a lista deste porteiro. O meu destino não está nela, então ele não me deixaria passar.', [this.cfgC, ...PK]); this.limpaCfg();
                    await this.ghost(r.ok); this.mostrar(r.ok); this.link(r.ok); await F('Aqui! A lista tem o mesmo destino da minha etiqueta. Este porteiro me deixa passar.', [this.cfgC, this.lk, ...PK]); this.limpaCfg(); this.ghostOff();
                    await F('Vou por ele. Observe!'); this.demo = false; setTimeout(() => this.escolher(r.ok), 400)
                },
                fin: async function () { await F('Viu? Li a minha etiqueta, li a lista de cada porteiro e comparei. É assim que se joga.') }
            },
            { K: ['dst0'], n: 3, free: 1, nocur: 1, hint: 1, pos: async function (r, o, dv) { await F('Agora é a sua vez! ' + (mob ? 'Toque' : 'Passe o mouse') + ' em um porteiro para ler a lista dele.', dv); await F('Procure o destino da sua etiqueta. Quando achar na lista, uma linha liga os dois.'); await F('Aí é só escolher esse porteiro.') }, err: errG },
            {
                K: ['dst0'], n: 3, once: 1, nocur: 1, pre: async function () { await F('Agora vou mostrar o que acontece quando você escolhe o porteiro errado.') }, pos: async function (r, o, dv) { star(o); await F('Escolha de propósito um dos outros. O marcado com ★ é o certo: evite ele.', dv) },
                err: async function () { await F('Esse porteiro não tinha o seu destino. A linha em vermelho mostra o motivo do bloqueio.'); this.rev(this.hearts); await F('Cada erro custa uma vida. Elas ficam aqui: cada 1 verde é uma vida, cada 0 vermelho é uma perdida.', H); await F('Se perder todas, o pacote explode e a partida acaba. Vou devolver esta vida: foi só demonstração!', H); this.vidas = Math.min(5, this.vidas + 1); this.falhas = 0; this.updH(); if (this.pkt.crk) this.pkt.crk(5 - this.vidas) }
            },
            { K: ['ip'], n: 2, free: 1, nocur: 1, pos: async function (r, o, dv, PK) { await F('Atenção: nem sempre a lista repete o seu dado. Às vezes traz uma FAIXA, como "de 128 a 159".', dv); await F('Aí você confere se o seu valor cabe dentro da faixa.', PK) }, err: errG },
            { K: ['ip', 'porta'], n: 3, free: 1, nocur: 1, pos: async function (r, o, dv, PK) { await F('Cada tipo de dado tem uma cor. A mesma cor aparece no painel e nas regras.', PK); await F('Procure a cor no painel e depois a mesma cor nas regras: é isso que você compara.'); await F('Se as cores atrapalharem, dá para desligá-las em CONFIG.') }, err: errG },
            { K: ['ip'], n: 2, free: 1, timed: 1, sec: 40, nocur: 1, pos: async function () { this.tbar.setVisible(true); await F('Esta barra no alto é o tempo. Ela encolhe enquanto você decide.', [this.tbar]); await F('Se ela acabar antes de você escolher, o pacote é perdido e a partida acaba!', [this.tbar]); await F('Calma: aqui o tempo só começa depois que eu terminar. Escolha!') }, err: errG },
            { K: ['ip'], n: 2, free: 1, nocur: 1, pos: async function () { await F('Acertar vários caminhos seguidos forma uma sequência. Acerte este e o próximo!') }, err: errG },
            { K: ['ip'], n: 2, free: 1, nocur: 1, keep: 1, err: errG, fin: async function () { await F('Viu o aviso grande? Quanto maior a sequência, mais empolgante. Um erro zera tudo.') } },
            { shop: 1 },
            {
                say: async function () {
                    this.rev(this.faseTx); await F('No alto fica o mapa: são 5 zonas, e cada uma traz conceitos novos de rede, aos poucos.', [this.faseTx]);
                    this.rev(this.cdx); await F('Ficou na dúvida sobre um conceito? A aba CODEX explica tudo. Vou abrir para você ver.', [this.cdx]);
                    this.guia = true; const ev = new Promise(r => this.events.once('cdx', r)); this.abrirCodex(); await ev; this.guia = false;
                    this.rev(this.setB); await F('As configurações ficam em CONFIG, e lá dá para repetir este tutorial.', [this.setB])
                }
            }];
        for (let i = 0; i < ph.length; i++) { const P = ph[i]; this.setFase('MUNDO 0 · ' + (i + 1) + '/' + ph.length); if (!P.keep) this.seq = 0; if (P.shop) { await this.loja(); continue } if (P.say) { await P.say.call(this); continue } await this.ramificacao(-1, P) }
        await F('Mundo 0 completo! A partir daqui é o jogo de verdade. Boa sorte!'); this.hud.flat().forEach(o => o.setVisible(true)); this.vidas = 5; this.maxV = 5; this.bc = 0; this.rel = []; this.gone = []; this.rz = {}; this.up = { skip: 0, reveal: 0, elim: 0 }; this.falhas = 0; this.seq = 0; this.updH(); await F('Antes de começar, escolha como quer jogar.'); await this.opcoes(); this.byto.sai(); this.byto = null; this.tut = false; save.ajuda = false; salvar()
    }
    async jornada() {
        try {
            if (this.inf) { this.tut = false; await this.infinito(); return } if (this.tut) { this.byto = new Byto(this); this.byto.humor('000'); await this.mundo0() }
            for (let f = 1; f <= 5; f++) {
                this.fase = f; this.zk = f; this.zona(f); this.dano = false; for (let r = 1; r <= 5; r++) { this.ramo = r; this.setFase(); await this.ramificacao((f - 1) * 5 + r - 1) }
                if (!this.dano && f < 5) { this.moeda(3); if (this.vidas < this.maxV) { this.vidas++; this.updH(); sfx.up(); this.anuncio('ZONA SEM DANO!\n+1 VIDA', '#6BBF59', 44, 1600) } else this.anuncio('ZONA PERFEITA!', '#E8B44B', 44, 1600); await this.wait(1700) }
                if (f < 5) { await this.loja(); if (f == 1 && this.tut) { await this.fala('Você passou da primeira zona! Daqui em diante, vai sozinho.'); await this.fala('Antes de seguir, escolha como quer jogar.'); await this.opcoes(); await this.fala('Para rever o tutorial, use "Repetir tutorial" nas Configurações.', [this.setB]); this.byto.sai(); this.byto = null; this.tut = false; save.ajuda = false; salvar() } }
            }
            await this.chegada(); await this.fim(true)
        } catch (e) { if (e !== 'over') this.erro(e) }
    }
    async ramificacao(idx, P) {
        this.P = P; if (this.up.skip > 0) { this.up.skip--; sfx.up(); this.fast = true; await this.tw({ targets: this.pp, x: this.pp.x + this.W * 1.1, y: this.cy, duration: 1100, ease: 'Quad.easeInOut' }); this.fast = false; return } const t = false, simple = false, PK = [this.pkBg, this.pkC], _ = 0; const K = P ? P.K : this.inf ? Kinf(this.dist, this.skb) : Kfor(this.fase, this.ramo), n = P ? P.n : this.inf ? Math.min(7, 4 + (this.dist / 5 | 0)) : [3, 3, 4, 4, 5 + (Math.random() * 2 | 0)][this.fase - 1]; let r, tries = 0;
        do { const p = novoPacote(), ok = Math.random() * n | 0; r = { p, ok, devs: compor(K, p, n, ok) } } while (r.devs.map(d => d.lines.join()).join('|') === this.sig && ++tries < 5);
        this.sig = r.devs.map(d => d.lines.join()).join('|'); cur = P && P.nocur ? [] : [...K]; this.setPacket(r.p, K); this.novoCdx();
        if (P && P.pre) await P.pre.call(this);
        musV('epic'); const bx = await this.avancar(), objs = this.montar(bx, r.devs), okd = r.devs[r.ok], dv = r.devs.map(d => d.obj);
        if (this.up.reveal > 0) { this.up.reveal--; okd.col = OK; okd.rc.setStrokeStyle(5, OK) }
        if (DEBUG) { okd.col = OK; okd.rc.setStrokeStyle(5, OK); okd.obj.add(txt(this, 0, -okd.obj.height / 2 - 12, '★ CERTO', { fontSize: '12px', color: '#6BBF59' }).setOrigin(.5)) }
        if (this.up.elim > 0 || (this.tem('pen') && (this.pc = (this.pc || 0) + 1) % 3 == 0)) { if (this.up.elim > 0) this.up.elim--; const w = shuf(r.devs.filter(d => d !== okd))[0]; if (w) { w.dead = w.out = true; w.rc.setFillStyle(0x2A2A38).setStrokeStyle(4, 0x555566); this.cab(w, 0x555566); w.obj.setAlpha(.45); sfx.tick() } }
        if (P && P.pos) await P.pos.call(this, r, okd, dv, PK);
        const free = !!(P && P.free), timed = P ? !!P.timed : (this.inf || save.modoTempo); let fim = false; musV(timed ? 'tense' : 'calm');
        while (!fim) {
            this.t0b = this.time.now; this.escolhendo = false; this.sel = -1; this.trava = false;
            const i = await new Promise(res => { this.res = res; if (timed) this.timer(res, this.tlim(P && P.sec ? P.sec : this.inf ? Math.max(18, 45 - this.dist * .8) : [50, 45, 40, 35, 30][this.fase - 1] + this.extra)) });
            const fr = this.tbar.visible ? this.tbar.scaleX : 0; this.tbar.setVisible(false); this.tweens.killTweensOf(this.tbar); mus.sp = mus.b; if (this.spc) this.spc.stop(); this.res = null; this.escolhendo = true;
            if (i < 0) { sweep(900, 80, .5, 'sawtooth', .12); this.limpaCfg(); if (free) { await this.fala('O tempo acabou! Aqui é só treino, então começo de novo.'); continue } if (this.tem('para')) { this.rel = this.rel.filter(x => x != 'para'); this.gone.push('para'); await this.perde(false); continue } this.vidas = 0; this.updH(); await this.fim(false); throw 'over' }
            const d = r.devs[i], ok = i === r.ok, byp = false; this.trava = true; this.mostrar(i); this.estado(ok || byp ? '' : 'r'); await this.ir(d);
            if (ok || byp) {
                if (byp) this.up.bypass--; this.limpaCfg(); d.rc.setFillStyle(OK).setStrokeStyle(4, AM); sfx.ok(); this.burst(d.obj.x, d.y, OK, 26, true); this.acerto(); this.seq = (this.seq || 0) + 1; this.combo(); const el = (this.time.now - this.t0b) / 1000; let g = 1 + (el < 10 ? 1 : 0) + (this.seq >= 3 ? 1 : 0) + (this.tem('cofre') ? 1 : 0) + (this.tem('combo') && this.seq >= 3 ? 2 : 0); if (el < 5 && this.tem('atalho')) g *= 2; if (this.tem('meio')) g *= 2;
                if (this.tem('risco') && fr > 0 && fr * this.tTot <= 1 && this.vidas < this.maxV) { this.vidas++; this.updH(); g = 0; this.anuncio('GRANDE RISCO!\n+1 VIDA', '#E58FB0', 38, 1400) }
                if (this.tem('sorte') && fr > .5) this.sorte = 3; if (!P) this.moeda(g); await this.passa(d); fim = true
            }
            else {
                if (this.tem('amort') && this.rz.amort != this.zk) this.rz.amort = this.zk; else this.seq = 0; d.dead = d.fail = true; d.rc.setFillStyle(ER).setStrokeStyle(4, ER); this.cab(d, ER); sfx.err(); this.cameras.main.shake(180, .006); this.hl(d.bad); this.erroFx(d);
                this.tweens.add({ targets: d.obj, scale: 1.1, duration: 150, yoyo: true, repeat: 3 });
                await this.tw({ targets: this.pp, x: this.pp.x - 14, duration: 60, yoyo: true, repeat: 2 }); await this.espera(3200); this.limpaCfg(); await this.perde(free);
                if (P && P.err) await P.err.call(this, d, PK);
                this.estado(''); await this.volta(d); if (P && P.once) fim = true
            }
        }
        this.trava = false; this.tweens.add({ targets: objs.filter(o => o.type == 'Container'), alpha: 0, duration: 250 }); await this.wait(260); objs.forEach(o => o.destroy()); this.devs = null; if (P && P.fin) await P.fin.call(this)
    }
    async loja() {
        musV('calm'); this.ambLoja(true); this.setFase('LOJA'); this.limpaCfg();
        const W = this.W, H = this.H, zi = this.inf ? (((this.zk || 1) - 1) % 5 + 5) % 5 : Math.max(0, this.fase - 1), vend = !this.tut, F = (t, f) => this.fala(t, f);
        const FR = [['Bem-vindo à lojinha! Byto-Coins aqui valem ouro.', 'Primeira zona vencida? Merece um mimo!', 'Escolha com calma: a rede não foge.'], ['Máscaras e CIDR me dão fome de moedas!', 'Quem economiza hoje, voa amanhã.', 'Esta relíquia é a minha preferida. Só dizendo.'], ['Firewalls assustam, mas relíquias protegem!', 'Boa escolha vale mais que muitas moedas.', 'Hoje o estoque está especialmente brilhante.'], ['Estamos fundo na rede. Preparado?', 'VLANs, trunks... e eu aqui vendendo bugigangas!', 'Cuide das suas vidas: curar está sempre em oferta.'], ['Última parada antes do destino! Gaste tudo!', 'Já falei que você é meu melhor cliente?', 'Pacote bom é pacote bem equipado.']];
        const thx = ['Pechincha!', 'Ótima escolha!', 'Obrigado, volte sempre!'], say2 = t => { if (vend && this.byto) this.byto.say(t || pick(thx), null, false) };
        if (this.tem('juros')) { const j = Math.min(3, Math.floor(this.bc * .1)); if (j) { this.bc += j; this.updH(); this.anuncio('JUROS +' + j + ' 🪙', '#E8B44B', 30, 1000) } }
        if (this.tut) { this.bc = Math.max(this.bc, 12); this.rev(this.cTx, this.rsl, this.relDesc) }
        if (vend) { if (!this.byto) { this.byto = new Byto(this); this.byto.humor('000') } this.byto.say(pick(FR[zi]), null, false) }
        this.rest = W * .5; const bx = await this.avancar(); this.shop = true; this.selK = null;
        let rr = 1, heals = 0, items, objs; const pr = p => Math.max(1, p - (this.tem('desc') ? 1 : 0));
        const rc = this.add.container(0, 0); rc.destroy();
        const build = () => {
            const pool = Object.keys(RL).filter(k => !this.rel.includes(k) && !this.gone.includes(k)), of = shuf(pool.slice()).slice(0, 3);
            const mk = k => { if (!k) return { label: '—', lines: ['Sem oferta', 'Volte na próxima loja.'], bad: -1, dead: true }; const p = pr(RL[k][3] + this.rel.length); return { label: RL[k][0] + '\n🪙 ' + p, lines: ['RELÍQUIA: ' + RL[k][1], RL[k][2], 'Preço: 🪙 ' + p], bad: -1, col: AM, rid: k, price: p } };
            const hp = pr(4 + heals); items = [mk(of[0]), mk(of[1]), { label: 'SEGUIR ▸', lines: ['CONTINUAR A JORNADA', 'Pegue este caminho para avançar.'], bad: -1, seguir: true }, mk(of[2]), { label: 'CURAR\n🪙 ' + hp, lines: ['CURAR 1 VIDA', 'Devolve uma vida (até o máximo).', 'Preço: 🪙 ' + hp], bad: -1, col: 0x6BBF59, heal: hp }]; objs = this.montar(bx, items)
        };
        build();
        this.rrBtn = btn(this, W / 2, this.m + 84, 200, 44, 'REROLL (1x) 🪙 ' + pr(2), () => { if (!rr || this.bc < pr(2) || !this.shop) { tone(110, .2, 'sawtooth', .1); return } this.bc -= pr(2); rr = 0; this.updH(); this.rrBtn.lbl.setText('REROLL (usado)'); this.rrBtn.setAlpha(.5); this.limpaCfg(); objs.forEach(x => x.destroy()); sfx.pop(); build() }, 15).setScrollFactor(0);
        if (this.tut) { const dv = items.map(d => d.obj); await F('Entre as zonas há uma loja. Cada caminho de cima e de baixo leva a uma relíquia ou a uma cura.', dv); await F('Você pega o item e volta. Para seguir viagem, vá pelo caminho do meio.', [items[2].obj]); await F('Relíquias mudam a partida inteira. Você leva até 3 e pode vendê-las por metade do preço neste canto da tela.', [...this.rsl, this.relDesc]) }
        for (; ;) {
            this.escolhendo = false; this.sel = -1; this.trava = false; const i = await new Promise(res => { this.res = res }); this.res = null; this.escolhendo = true; const d = items[i];
            this.limpaCfg(); await this.ir(d);
            if (d.seguir) { await this.passa(d); break }
            if (d.heal !== undefined) { if (this.vidas >= this.maxV || this.bc < d.heal) { tone(110, .2, 'sawtooth', .1); if (this.vidas >= this.maxV) this.anuncio('Vidas cheias!', '#D64545', 24, 800) } else { this.bc -= d.heal; heals++; this.vidas++; this.updH(); sfx.up(); d.dead = true; d.obj.setAlpha(.45); say2() } }
            else if (d.rid) {
                if (this.rel.length >= 3) { tone(110, .2, 'sawtooth', .1); this.anuncio('Relíquias cheias! Venda uma no canto.', '#D64545', 24, 1200) } else if (this.bc < d.price) { tone(110, .2, 'sawtooth', .1); this.anuncio('Moedas insuficientes', '#D64545', 24, 900) }
                else { this.bc -= d.price; this.rel.push(d.rid); this.rp[d.rid] = d.price; if (d.rid == 'reserva') { this.maxV = 6; this.vidas = Math.min(6, this.vidas + 1) } this.updH(); sfx.shop(); d.dead = true; d.obj.setAlpha(.45); say2() }
            }
            await this.volta(d)
        }
        this.shop = false; this.selK = null; this.relDesc.setText(''); if (this.rrBtn) { this.rrBtn.destroy(); this.rrBtn = null }
        this.tweens.add({ targets: objs.filter(o => o.type == 'Container'), alpha: 0, duration: 250 }); await this.wait(260); objs.forEach(o => o.destroy()); this.devs = null; this.rest = W * .2; this.ambLoja(false); if (vend && this.byto) { this.byto.destroy(); this.byto = null }
    }
    vender(i) {
        const k = this.rel[i]; if (!k || !this.shop) return; const v = Math.max(1, Math.floor((this.rp[k] || RL[k][3]) / 2));
        if (this.selK !== k) { this.selK = k; this.relDesc.setText('Clique de novo para vender ' + RL[k][1] + ' por 🪙 ' + v); return }
        this.bc += v; this.rel.splice(i, 1); delete this.rp[k]; if (k == 'reserva') { this.maxV = 5; this.vidas = Math.min(this.vidas, 5) } this.selK = null; this.relDesc.setText(''); this.updH(); sfx.shop(); this.anuncio('Vendida! +' + v + ' 🪙', '#E8B44B', 28, 900)
    }
    tem(k) { return this.rel.includes(k) }
    tlim(b) { let t = b + (this.tem('amp') ? 5 : 0) + this.sorte; this.sorte = 0; if (this.tem('meio')) t = t / 2; this.tTot = t; return t }
    relHud() { this.rsl.forEach((c, i) => { const k = this.rel[i]; c.t.setText(k ? RL[k][0] : '— livre —').setColor(k ? '#E8B44B' : '#6B6B7B'); c.b.setStrokeStyle(2, k ? AM : LN) }) }
    moeda(n) { if (n <= 0) return; this.bc += n; this.updH(); const t = txt(this, this.pkt.x, this.pkt.y - 44, '+' + n + ' 🪙', { fontSize: '22px', color: '#E8B44B', stroke: '#12121A', strokeThickness: 4 }).setOrigin(.5).setDepth(D.POPUP); this.tweens.add({ targets: t, y: t.y - 60, alpha: 0, duration: 900, onComplete: () => t.destroy() }) }
    /* espera N ms, ou até o jogador tocar/clicar na tela (pula a animação) */
    espera(ms) { return new Promise(r => { let d = false; const t0 = performance.now(), h = () => { if (performance.now() - t0 > 200) f() }, f = () => { if (d) return; d = true; this.input.off('pointerdown', h); if (ev) ev.remove(); if (hint.active) hint.destroy(); r() }, hint = txt(this, this.W / 2, this.H - this.m - 6, 'toque para pular', { fontSize: '13px', color: '#F2E8D5' }).setOrigin(.5, 1).setScrollFactor(0).setDepth(D.POPUP).setAlpha(.6), ev = this.time.delayedCall(ms, f); this.input.on('pointerdown', h) }) }
    anuncio(str, col, sz, hold = 900) {
        const t = txt(this, this.W / 2, this.H * .26, str, { fontSize: sz + 'px', align: 'center', color: col, stroke: '#12121A', strokeThickness: 8, wordWrap: { width: this.W - 40 } }).setOrigin(.5).setScrollFactor(0).setDepth(D.POPUP).setScale(.2).setAngle(-8);
        this.tweens.add({ targets: t, scale: 1, angle: 0, duration: 280, ease: 'Back.easeOut' }); this.tweens.add({ targets: t, x: t.x + 6, duration: 50, yoyo: true, repeat: Math.floor(hold / 100) });
        this.time.delayedCall(hold, () => { if (t.active) this.tweens.add({ targets: t, y: t.y - 70, alpha: 0, duration: 500, onComplete: () => t.destroy() }) })
    }
    combo() {
        const n = this.seq; if (n < 2) return; const nm = { 2: 'BOA!', 3: 'COMBO!', 4: 'EM CHAMAS!', 5: 'IMPARÁVEL!', 6: 'DOMINANDO!', 7: 'LENDÁRIO!' }, cols = ['#E8B44B', '#F29E4C', '#E8745A', '#E58FB0', '#F2E8D5'];
        this.anuncio('x' + n + '\n' + (n >= 8 ? 'PERFEITO!!' : nm[n]), cols[Math.min(4, n >> 1)], Math.min(this.nar ? 46 : 90, 26 + n * 7), 700 + n * 60);
        this.burst(this.pkt.x, this.pkt.y, AM, 10 + n * 4, true); if (n >= 4) this.cameras.main.flash(120, 255, 220, 150);
        [0, 4, 7, 12, 16, 19].slice(0, Math.min(6, n)).forEach((k, i) => tone(523 * 2 ** (k / 12), .14, 'triangle', .1, i * .06))
    }
    fundo(z) {
        const W = this.W, H = this.H, old = this.bgs || [], cl = [[0x1A1A28, 0x262638], [0x15302B, 0x1F4A41], [0x2C2040, 0x403060], [0x3A2A16, 0x56401E], [0x40181E, 0x5C2630]][z], nw = [];
        old.forEach(g => this.tweens.add({ targets: g, alpha: 0, duration: 1500, onComplete: () => g.destroy() }));
        [[.04, .85], [.08, .7], [.14, .58], [.22, .47], [.3, .4]].forEach(([f, hh], li) => {
            for (let t = 0; t < 2; t++) {
                const g = this.add.graphics().setScrollFactor(f).setDepth(1 + li * .15).setAlpha(0), tw = W * 1.1; let x = 0;
                while (x < tw) { const w = 34 + Math.random() * 60, pk = .35 + .65 * Math.abs(Math.sin(x / tw * 3.1 + li * 1.7)); silh(g, z, x, w, H * hh * pk, H, cl[li % 2]); x += w + 3 }
                g.x = (t - .5) * tw; g.f = f; g.tw = tw; nw.push(g); this.tweens.add({ targets: g, alpha: .9, duration: 1500 })
            }
        }); this.bgs = nw
    }
    pcDest(cx) {
        const cy = this.cy, A = o => { this.wo.push(o); return o }, z = D.DISP;
        A(this.add.rectangle(cx, cy - 30, 200, 132, 0x2A2A38).setStrokeStyle(4, LN).setDepth(z)); this.dscr = A(this.add.rectangle(cx, cy - 30, 174, 106, 0x0B0B12).setStrokeStyle(2, CY).setDepth(z));
        A(this.add.rectangle(cx, cy + 46, 26, 14, 0x2A2A38).setDepth(z)); A(this.add.rectangle(cx, cy + 54, 96, 8, 0x2A2A38).setStrokeStyle(2, LN).setDepth(z)); A(this.add.rectangle(cx, cy + 84, 190, 34, PN).setStrokeStyle(3, LN).setDepth(z));
        A(txt(this, cx, cy - 118, 'DESTINO', { fontSize: '16px', color: '#E8B44B' }).setOrigin(.5).setDepth(z)); this.dt = A(txt(this, cx, cy - 30, 'aguardando...', { fontFamily: M, fontSize: '14px', color: '#6BBF59' }).setOrigin(.5).setDepth(z + 1))
    }
    async infinito() {
        this.fase = 1; this.dano = false; if (this.byto) { this.byto.destroy(); this.byto = null }
        for (; ;) {
            const d = ++this.dist; this.zk = Math.ceil(d / 5); this.ramo = d; this.setFase(); if (d % 6 == 1) this.zona((((d - 1) / 6 | 0) % 5) + 1, true);
            if (d % 8 == 0 && this.vidas < this.maxV) { this.vidas++; this.updH(); sfx.up(); this.anuncio('+1 VIDA', pick(['#6BBF59']), 40, 1200) }
            if (d % 5 == 0) { const k = pick(['reveal', 'elim', 'skip']); this.up[k]++; this.anuncio('BÔNUS: ' + { reveal: 'REVELAR', elim: 'ELIMINAR', skip: 'PASSE LIVRE' }[k], '#E8B44B', 36, 1300) }
            await this.ramificacao(1000 + d); if (d % 5 == 0) { this.moeda(2); await this.loja() }
        }
    }
    async opcoes() {
        const W = this.W, H = this.H, o = [], bx = Math.min(400, W - 40), cx = W / 2, cy = H / 2;
        o.push(this.add.rectangle(cx, cy, W, H, 0, .6).setScrollFactor(0).setDepth(1500).setInteractive(), this.add.rectangle(cx, cy, bx, 300, PN).setStrokeStyle(4, AM).setScrollFactor(0).setDepth(1501),
            txt(this, cx, cy - 110, 'COMO VOCÊ QUER JOGAR?', { fontSize: '20px', color: '#E8B44B' }).setOrigin(.5).setScrollFactor(0).setDepth(1502));
        const tg = (y, k, n) => { const set = () => b.lbl.setText(n + ': ' + (save[k] ? 'LIGADO' : 'DESLIGADO')), b = btn(this, cx, y, bx - 40, 56, '', () => { save[k] = !save[k]; salvar(); set() }, 17).setScrollFactor(0).setDepth(1503); set(); o.push(b) };
        tg(cy - 45, 'modoTempo', 'MODO COM TEMPO'); tg(cy + 25, 'guia', 'DICAS COM CORES');
        await new Promise(res => { o.push(btn(this, cx, cy + 100, bx - 100, 52, 'CONTINUAR', res, 20).setScrollFactor(0).setDepth(1503)) }); o.forEach(x => x.destroy())
    }
    async chegada() {
        musV('win'); mus.sp = 260; const bx = this.pp.x + this.W * .6, cx = bx + 260; this.fast = true; sfx.whoosh(); this.pcDest(cx);
        await this.tw({ targets: this.pp, x: bx, duration: 1800, ease: 'Cubic.easeOut' }); this.fast = false;
        await this.tw({ targets: this.pp, x: cx, y: this.cy - 30, duration: 900, ease: 'Sine.easeInOut' });
        this.dt.setText('RECEBIDO!').setColor('#E8B44B'); this.dscr.setFillStyle(0x1B3A20); this.tweens.add({ targets: this.pkt, scale: .6, duration: 300 }); sfx.fan(); this.cameras.main.flash(300, 255, 240, 200);
        for (let i = 0; i < 9; i++)this.time.delayedCall(i * 350, () => { this.burst(cx + (Math.random() - .5) * 500, this.cy - 60 - Math.random() * 200, pick([AM, OK, 0xE58FB0, CY, 0xF2E8D5]), 34, false); tone(500 + Math.random() * 700, .15, 'triangle', .08) });
        for (let i = 0; i < 110; i++) { const r = this.add.rectangle(Math.random() * this.W, -20, 8, 14, pick([AM, OK, ER, CY, 0xE58FB0])).setScrollFactor(0).setDepth(D.POPUP - 50); this.tweens.add({ targets: r, y: this.H + 30, x: r.x + (Math.random() - .5) * 160, angle: Math.random() * 720, duration: 2200 + Math.random() * 1600, delay: i * 30, onComplete: () => r.destroy() }) }
        this.tweens.add({ targets: this.pp, y: this.cy - 62, duration: 250, yoyo: true, repeat: 9 }); this.anuncio('DESTINO\nALCANÇADO!', '#6BBF59', this.nar ? 44 : 72, 3600); await this.wait(4300)
    }
    acerto() { const W = this.W, H = this.H, o = this.add.rectangle(W / 2, H / 2, W, H, 0xE8B44B, .08).setScrollFactor(0).setDepth(1300); this.tweens.add({ targets: o, alpha: 0, duration: 100, onComplete: () => o.destroy() }); this.tweens.add({ targets: this.cameras.main, zoom: 1.05, duration: 150, yoyo: true }); this.estado('g'); this.time.delayedCall(400, () => this.estado('')); vib(10) }
    erroFx(d) {
        const W = this.W, H = this.H, v = this.add.rectangle(W / 2, H / 2, W - 40, H - 40).setStrokeStyle(40, 0xD64545, .4).setScrollFactor(0).setDepth(1300); this.tweens.add({ targets: v, alpha: 0, duration: 300, onComplete: () => v.destroy() });
        const r = this.add.circle(d.obj.x, d.y, 20).setStrokeStyle(5, 0xD64545).setDepth(D.PAC); this.tweens.add({ targets: r, scale: 6, alpha: 0, duration: 600, onComplete: () => r.destroy() }); vib([30, 30, 30])
    }
    novoCdx() { save.vistos = save.vistos || []; const n = cur.some(c => !save.vistos.includes(c)); if (this.cpl) { this.cpl.stop(); this.cpl = null; this.cdx.setScale(1) } const nw = cur.filter(c => !save.vistos.includes(c)); if (nw.length && !this.guia && !this.tut) { this.selo(CON[nw[0]][0]); save.vistos = [...new Set([...save.vistos, ...nw])]; salvar() } if (n && !this.guia) this.cpl = this.tweens.add({ targets: this.cdx, scale: 1.1, yoyo: true, repeat: -1, duration: 500 }) }
    cortina(f) {
        const W = this.W, H = this.H, r = this.add.rectangle(W, H / 2, W, H, 0x12121A).setOrigin(0, .5).setScrollFactor(0).setDepth(1400), tx = [];
        for (let i = 0; i < 14; i++)tx.push(this.add.text(W + Math.random() * W, H * i / 14, Array.from({ length: 30 }, () => Math.random() < .5 ? '0' : '1').join(' '), { fontFamily: M, fontSize: '18px', color: '#2E5A50' }).setScrollFactor(0).setDepth(1401));
        const n = this.add.text(W / 2, H / 2, '', { fontFamily: F, fontSize: (this.nar ? 48 : 80) + 'px', color: '#E8B44B' }).setOrigin(.5).setScrollFactor(0).setDepth(1402), s = 'ZONA ' + f; let i = 0;
        this.tweens.add({ targets: [r, ...tx], x: '-=' + W * 2, duration: 900, onComplete: () => { r.destroy(); tx.forEach(t => t.destroy()) } });
        this.time.addEvent({ delay: 110, repeat: s.length - 1, callback: () => { n.setText(s.slice(0, ++i)); tone(900 + i * 60, .03, 'square', .05) } }); this.time.delayedCall(1900, () => n.destroy())
    }
    estado(k) { const o = this.pkt.ov; if (!o) return;['r', 'g', 'c'].forEach(n => this.tweens.add({ targets: o[n], alpha: n == k ? (k == 'c' ? .5 : .75) : 0, duration: 120 })) }
    danoFx() { const o = this.pkt.ov, i = this.pkt.inner; this.pkt.crk(5 - this.vidas); o.r.setAlpha(0); this.tweens.add({ targets: o.r, alpha: { from: .9, to: 0 }, duration: 140, yoyo: true, repeat: 2 }); this.tweens.add({ targets: i, scale: .9, duration: 200, yoyo: true }) }
    selo(n) {
        const W = this.W, H = this.H, c = this.add.container(W / 2, H * .5).setScrollFactor(0).setDepth(D.FOCO + 5), bg = this.add.rectangle(0, 0, 270, 52, PN).setStrokeStyle(3, AM), t = txt(this, 0, 0, '★ NOVO: ' + n, { fontSize: '16px', color: '#E8B44B' }).setOrigin(.5); c.add([bg, t]); c.setScale(0);
        this.tweens.add({ targets: c, scale: 1, duration: 300, ease: 'Back.easeOut' }); this.time.delayedCall(1100, () => { if (c.active) this.tweens.add({ targets: c, x: this.cdx.x, y: this.cdx.y + 40, scale: .45, duration: 600, ease: 'Quad.easeIn', onComplete: () => this.time.delayedCall(2000, () => { if (c.active) this.tweens.add({ targets: c, alpha: 0, duration: 300, onComplete: () => c.destroy() }) }) }) })
    }
    ambLoja(on) { if (!actx || !mus.wet) return; const t = actx.currentTime; mus.wet.gain.setTargetAtTime(on ? .35 : 0, t, .2); mus.ho.forEach((o, i) => o.frequency.setTargetAtTime(on ? (i ? 90 : 45) : (i ? 120 : 60), t, .3)) }
    async explode() {
        const p = this.pkt; sfx.boom(); this.cameras.main.shake(500, .02); this.cameras.main.flash(250, 255, 200, 120);
        for (let i = 0; i < 46; i++)this.puff(p.x, p.y, pick([0xC98F4F, 0xE0B070, 0xF2E8D5, AM, 0xD64545]), (Math.random() - .5) * 600, (Math.random() - .5) * 600, 900 + Math.random() * 600, 6 + Math.random() * 10);
        const ring = this.add.circle(p.x, p.y, 10).setStrokeStyle(6, AM).setDepth(D.PAC); this.tweens.add({ targets: ring, scale: 14, alpha: 0, duration: 800, onComplete: () => ring.destroy() }); p.setVisible(false); await this.espera(1700)
    }
    async fim(win) {
        this.dead = true; if (!win) await this.explode(); fireSet(0); musV(win ? 'win' : 'sad'); mus.sp = 260; save.faseMaxima = Math.max(save.faseMaxima, win ? 5 : this.fase); if (win) save.venceu = true; if (this.inf) save.recorde = Math.max(save.recorde || 0, this.dist || 0); salvar(); this.limpaCfg(); this.unfoco(); const { W, H } = this;
        this.add.rectangle(W / 2, H / 2, W, H, 0x12121A, .7).setScrollFactor(0).setDepth(900);
        txt(this, W / 2, H * .2, win ? 'DESTINO ALCANÇADO' : 'PACOTE PERDIDO', { fontSize: this.nar ? '34px' : '56px', color: win ? '#6BBF59' : '#D64545' }).setOrigin(.5).setScrollFactor(0).setDepth(D.POPUP);
        if (this.inf) txt(this, W / 2, H * .2 + (this.nar ? 44 : 70), 'DISTÂNCIA ' + this.dist + '  ·  RECORDE ' + save.recorde, { fontSize: '20px', color: '#E8B44B' }).setOrigin(.5).setScrollFactor(0).setDepth(D.POPUP);
        if (this.byto) this.byto.destroy(); this.byto = new Byto(this); this.byto.humor(win ? '000' : '101');
        this.byto.say(win ? 'Você chegou! Que viagem.' : pick(['Quase! Olhe as linhas vermelhas.', 'Respire e tente de novo.', 'Cada erro ensina algo.']), null, false);
        btn(this, W / 2, H * .38, 280, 56, win ? '∞ MODO INFINITO' : 'REINICIAR', () => this.sair(win ? { play: true, inf: true } : { play: true, inf: this.inf }), 22).setScrollFactor(0);
        btn(this, W / 2, H * .38 + 80, 280, 56, 'MENU', () => this.sair({}), 24).setScrollFactor(0)
    }
}
/* ---------- menu, config, codex ---------- */
class MenuScene extends Phaser.Scene {
    constructor() { super('Menu') }
    create() {
        const W = this.scale.width, H = this.scale.height; this.cameras.main.setBackgroundColor(0x12121A); bgLines(this); musV('menu'); const py = H * .9; this.add.rectangle(W / 2, py, W, 6, CY); const pk = this.add.container(-30, py, [this.add.rectangle(0, 0, 34, 34, AM).setStrokeStyle(3, 0xF2E8D5), txt(this, 0, 0, 'P', { fontSize: '18px', color: '#12121A' }).setOrigin(.5)]); this.tweens.add({ targets: pk, x: W + 30, duration: 5000, repeat: -1, ease: 'Sine.easeInOut' }); this.tweens.add({ targets: pk, y: py - 6, yoyo: true, repeat: -1, duration: 300 });
        txt(this, W / 2, H * .2, 'HOP LIMIT', { fontSize: W < 700 ? '52px' : '84px', color: '#E8B44B' }).setOrigin(.5).setDepth(D.POPUP);
        txt(this, W / 2, H * .2 + (W < 700 ? 50 : 70), 'fase máxima: ' + save.faseMaxima, { fontSize: '16px' }).setOrigin(.5);
        btn(this, W / 2, H * .5, 320, 64, 'INICIAR', () => { initAudio(); this.scene.start('World') }, 28);
        btn(this, W / 2, H * .5 + 84, 320, 64, 'CODEX', () => { this.scene.pause(); this.scene.launch('Codex', { de: 'Menu' }) }, 28);
        btn(this, W / 2, H * .5 + 168, 320, 64, 'CONFIGURAÇÕES', () => this.scene.start('Settings'), 24)
    }
}
class SettingsScene extends Phaser.Scene {
    constructor() { super('Settings') }
    init(d) { this.de = d && d.de }
    create() {
        const W = this.scale.width, w = Math.min(420, W - 40), cam = this.cameras.main; cam.setBackgroundColor(0x12121A); cam.fadeIn(300, 18, 18, 26); cam.setZoom(.9); this.tweens.add({ targets: cam, zoom: 1, duration: 300, ease: 'Back.easeOut' }); bgLines(this);
        txt(this, W / 2, 60, 'CONFIGURAÇÕES', { fontSize: '34px' }).setOrigin(.5);
        [['som', 'EFEITOS'], ['musica', 'MÚSICA'], ['modoTempo', 'MODO TEMPO'], ['ajuda', 'REPETIR TUTORIAL'], ['guia', 'GUIA DE CORES']].forEach(([k, n], i) => { const set = () => b.lbl.setText(n + ': ' + (save[k] ? 'LIGADO' : 'DESLIGADO')), b = btn(this, W / 2, 130 + i * 58, w, 50, '', () => { save[k] = !save[k]; salvar(); set() }, 20); set() });
        const dbg = btn(this, W / 2, 420, w, 50, '', () => pedirTexto('Digite o código:', v => { if (v == 'pacote') DEBUG = true; else if (v == 'debug') DEBUG = false; dbg.lbl.setText('DEBUG: ' + (DEBUG ? 'ATIVO' : 'INATIVO')) }), 20); dbg.lbl.setText('DEBUG: ' + (DEBUG ? 'ATIVO' : 'INATIVO'));
        btn(this, W / 2, 478, w, 50, 'CRÉDITOS', () => this.creditos(), 20);
        txt(this, W / 2, 534, 'Apagar progresso remove a fase máxima e as preferências.', { fontFamily: 'Arial, sans-serif', fontSize: '15px', align: 'center', wordWrap: { width: w } }).setOrigin(.5);
        btn(this, W / 2, 584, w, 50, 'APAGAR PROGRESSO', () => this.confirmar(), 20);
        btn(this, W / 2, 650, 240, 52, 'VOLTAR', () => { cam.fadeOut(220, 18, 18, 26); this.time.delayedCall(240, () => { this.scene.stop(); this.scene.resume('World') }) }, 22)
    }
    creditos() {
        const W = this.scale.width, H = this.scale.height, bx = Math.min(440, W - 40), o = [];
        o.push(this.add.rectangle(W / 2, H / 2, W, H, 0, .8).setDepth(3000).setInteractive(), this.add.rectangle(W / 2, H / 2, bx, 380, PN).setStrokeStyle(4, AM).setDepth(3001),
            txt(this, W / 2, H / 2 - 150, 'CRÉDITOS', { fontSize: '30px', color: '#E8B44B' }).setOrigin(.5).setDepth(3002),
            txt(this, W / 2, H / 2 - 105, 'Desenvolvido por', { fontFamily: 'Arial, sans-serif', fontSize: '16px', color: '#D8CDB8' }).setOrigin(.5).setDepth(3002),
            txt(this, W / 2, H / 2 - 5, ['Ana Lívia dos Santos Lopes', 'Jacquys Barbosa da Silva', 'Lucas Machado Crispim', 'Luis Gustavo Cesar Consoli de Almeida'].join('\n'), { fontFamily: 'Arial, sans-serif', fontSize: '20px', align: 'center', lineSpacing: 14, wordWrap: { width: bx - 30 } }).setOrigin(.5).setDepth(3002));
        o.push(btn(this, W / 2, H / 2 + 140, 200, 52, 'FECHAR', () => o.forEach(x => x.destroy()), 20).setDepth(3003))
    }
    confirmar() {
        const W = this.scale.width, H = this.scale.height, bx = Math.min(380, W - 40), o = [];
        o.push(this.add.rectangle(W / 2, H / 2, W, H, 0, .78).setDepth(3000).setInteractive(), this.add.rectangle(W / 2, H / 2, bx, 220, PN).setStrokeStyle(4, ER).setDepth(3001),
            txt(this, W / 2, H / 2 - 55, 'Apagar TODO o progresso?\nO jogo será reiniciado.', { fontSize: '18px', align: 'center', wordWrap: { width: bx - 30 } }).setOrigin(.5).setDepth(3002));
        o.push(btn(this, W / 2 - bx / 4, H / 2 + 50, bx / 2 - 14, 52, 'APAGAR', () => { save = Object.assign({}, defs); try { localStorage.removeItem('hoplimit_save') } catch (e) { } location.reload() }, 18).setDepth(3003),
            btn(this, W / 2 + bx / 4, H / 2 + 50, bx / 2 - 14, 52, 'CANCELAR', () => o.forEach(x => x.destroy()), 18).setDepth(3003))
    }
}
class CodexScene extends Phaser.Scene {
    constructor() { super('Codex') }
    init(d) { this.de = d.de; this.guia = d.guia; const w = d.de == 'World' && cur.length; this.sel = (d.guia || !w) ? 'ip' : cur[0]; this.modo = d.guia ? 'lista' : w ? 'conteudo' : 'lista'; this.sy = 0; this.lsy = -1; this.sai = false }
    liberado(k) { return DEBUG || (this.guia && k == 'ip') || (save.vistos || []).includes(k) }
    /* Codex como aba lateral: desliza da direita sobre o jogo, sem trocar de tela */
    create() {
        const W = this.W = this.scale.width, H = this.H = this.scale.height; this.m = 16; this.DW = W < 700 ? W : Math.min(430, W * .42); this.X0 = W - this.DW; if (this.modo == 'conteudo' && !this.liberado(this.sel)) this.modo = 'lista';
        const cam = this.cameras.main; cam.scrollX = -this.DW; this.tweens.add({ targets: cam, scrollX: 0, duration: 260, ease: 'Cubic.easeOut' });
        this.dim = this.add.rectangle(0, 0, W, H, 0, .5).setOrigin(0).setScrollFactor(0).setDepth(-5).setInteractive(); this.dim.on('pointerdown', () => { if (!(this.guia && this.byto)) this.sair() });
        this.kc = this.input.keyboard.addKey('C'); this.kc.on('down', this.sair, this);
        this.input.on('wheel', (p, o, dx, dy) => this.rolar(dy)); this.input.on('pointermove', p => { if (p.isDown && p.y > this.top && p.x > this.X0) this.rolar(p.prevPosition.y - p.y) });
        this.events.once('shutdown', () => { try { this.kc.removeAllListeners(); this.input.removeAllListeners() } catch (e) { } }); this.draw(); if (this.guia) this.guiar()
    }
    rolar(dy) { if (this.modo == 'lista') { if (!this.lc) return; this.lsy = Phaser.Math.Clamp(this.lsy + dy, 0, Math.max(0, this.lh - this.lv)); this.lc.y = this.top + 8 - this.lsy } else { if (!this.cont) return; this.sy = Phaser.Math.Clamp(this.sy + dy, 0, Math.max(0, this.ch - this.vh)); this.cont.y = this.top + 16 - this.sy } }
    sair() { if (this.sai) return; this.sai = true; if (this.byto) this.byto.destroy(); this.tweens.add({ targets: this.cameras.main, scrollX: -this.DW, duration: 200, onComplete: () => { const w = this.scene.get(this.de); this.scene.stop(); this.scene.resume(this.de); w.events.emit('cdx') } }) }
    async guiar() {
        const b = this.byto = new Byto(this); b.humor('000');
        await b.say('Esta aba é o Codex: ela explica cada conceito de rede que aparece no jogo.');
        await b.say('Os conceitos que você ainda não viu ficam bloqueados 🔒. Eles destravam quando aparecem.', this.lst);
        this.sel = 'ip'; this.modo = 'conteudo'; this.draw();
        await b.say('Cada página mostra o que é, como funciona e exemplos: ✅ passa e ❌ bloqueia.', this.pg);
        await b.say('Role com a roda do mouse ou arrastando. Para fechar, use FECHAR ou toque na área escura.', [this.voltar]);
        b.sai(); this.byto = null
    }
    draw() {
        const kp = new Set([this.dm, this.byto && this.byto.c, this.byto && this.byto.b, this.dim]); this.children.list.slice().filter(o => !kp.has(o)).forEach(o => o.destroy()); const { W, H, m, X0, DW } = this, top = this.top = m + 70, inW = this.de == 'World', cw = DW - 2 * m; this.lst = []; this.pg = [];
        this.add.rectangle(X0, 0, DW, H, 0x161621).setOrigin(0).setStrokeStyle(3, AM);
        txt(this, X0 + m, m, 'CODEX', { fontSize: '26px', color: '#E8B44B' }); if (inW && cur.length) txt(this, X0 + m, m + 34, '★ = presente neste ramo', { fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#E8B44B' });
        this.voltar = btn(this, X0 + DW - m - 65, m + 26, 130, 48, this.modo == 'conteudo' ? '◀ LISTA' : 'FECHAR ▸', () => { if (this.modo == 'conteudo' && !this.guia) { this.modo = 'lista'; this.draw() } else this.sair() }, 16);
        this.lv = H - top - m - 16; this.lh = ORD.length * 44; if (this.lsy < 0) this.lsy = this.guia ? 0 : Math.max(0, Math.min(this.lh - this.lv, ORD.indexOf(this.sel) * 44 - 60));
        if (this.modo == 'lista') {
            const lc = this.lc = this.add.container(0, top + 8 - this.lsy);
            ORD.forEach((k, i) => { const op = this.liberado(k), hi = inW && cur.includes(k), b = btn(this, X0 + DW / 2, 22 + i * 44, cw, 40, op ? (hi ? '★ ' : '') + CON[k][0] : '🔒 ???', () => { if (!op || (this.guia && this.byto)) return; this.sel = k; this.modo = 'conteudo'; this.sy = 0; this.draw() }, 16); b.lbl.setColor(op ? FC[k] : '#6B6B7B'); if (!op) b.setAlpha(.6); lc.add(b); if (op) lc.add(this.add.rectangle(X0 + m + 4, 22 + i * 44, 5, 28, parseInt(FC[k].slice(1), 16))) });
            const mg = this.make.graphics({ add: false }); mg.fillStyle(0xffffff).fillRect(X0, top + 4, DW, H - top - m - 8); lc.setMask(mg.createGeometryMask()); this.lst = [lc]
        }
        else {
            const pr = this.add.rectangle(X0 + m / 2, top, DW - m, H - top - m, PN).setOrigin(0).setStrokeStyle(3, LN); this.vh = H - top - m - 32;
            const ct = this.cont = this.add.container(X0 + m + 8, top + 16), ww = cw - 16, c = CON[this.sel]; let y = 0; this.pg = [pr, ct];
            const mg = this.make.graphics({ add: false }); mg.fillStyle(0xffffff).fillRect(X0, top + 6, DW, H - top - m - 12); ct.setMask(mg.createGeometryMask());
            const add = (s, o) => { const t = txt(this, 0, y, s, o); ct.add(t); y += t.height + 8; return t }, hd = s => { y += 6; add(s, { fontSize: '14px', color: '#5FB8C8' }) }, tx = (s, o = {}) => add(s, { fontFamily: 'Arial, sans-serif', fontSize: '16px', wordWrap: { width: ww }, ...o });
            add(c[0].toUpperCase(), { fontSize: '24px', color: FC[this.sel] || '#E8B44B', wordWrap: { width: ww } }); tx(c[1], { fontStyle: 'italic' }); hd('COMO FUNCIONA'); tx(c[2]); hd('O QUE IMPORTA'); c[3].forEach(s => tx('• ' + s)); hd('EXEMPLOS');
            c[4].forEach(([ic, s, code]) => { tx(ic + ' ' + s, { color: ic == '✅' ? '#6BBF59' : ic == '❌' ? '#D64545' : '#E8B44B', fontStyle: 'bold' }); if (!code) return; const r = this.add.rectangle(0, y, ww, 10, 0x12121A).setOrigin(0); ct.add(r); const t = txt(this, 10, y + 8, code, { fontFamily: M, fontSize: '14px', wordWrap: { width: ww - 20 } }); ct.add(t); r.setSize(ww, t.height + 16); y += t.height + 24 });
            this.ch = y
        }
    }
}
Object.assign(CodexScene.prototype, { foco: WorldScene.prototype.foco, unfoco: WorldScene.prototype.unfoco });
const isP = innerHeight > innerWidth;
new Phaser.Game({ type: Phaser.AUTO, parent: 'game', width: isP ? 450 : 1280, height: isP ? 975 : 720, backgroundColor: '#12121A', scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH }, scene: [WorldScene, CodexScene, SettingsScene] });