
function *batch(generator, { size = 1, max = undefined }) {
  let elems = [];
  let count = 0;
  for (let elem of generator) {
    count++;
    elems.push(elem);

    if (elems.length === size || count === max) {
      yield elems;
      elems = [];
    }

    if (count === max)
      break;
  }
}

module.exports = {
  batch
}
