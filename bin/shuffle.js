let seedrandom = require('seedrandom');

module.exports = ary => {
  seedrandom('anticonstitutionnellement', { global: true });
  for (let i = ary.length; i; i--) {
    let j = Math.floor(Math.random() * i);
    [ary[i - 1], ary[j]] = [ary[j], ary[i - 1]];
  }
}
