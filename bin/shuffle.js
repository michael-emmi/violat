let seedrandom = require('seedrandom');

seedrandom('knick-knacks', { global: true });

module.exports = ary => {
  for (let i = ary.length; i; i--) {
    let j = Math.floor(Math.random() * i);
    [ary[i - 1], ary[j]] = [ary[j], ary[i - 1]];
  }
}
