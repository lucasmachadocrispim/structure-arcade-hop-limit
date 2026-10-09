// vitest.setup.js
// Stub global do Phaser para permitir que src/core/constants.js seja importado
// em ambiente Node (sem DOM). Não afeta o jogo — apenas os testes.
globalThis.Phaser = globalThis.Phaser || {
  Display: {
    Color: {
      IntegerToColor: (c) => {
        const r = (c >> 16) & 0xff;
        const g = (c >> 8) & 0xff;
        const b = c & 0xff;
        return {
          red: r, green: g, blue: b,
          lighten: () => ({ color: c }),
          darken: () => ({ color: c }),
        };
      },
    },
  },
};