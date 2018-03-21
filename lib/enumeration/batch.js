
function *batch(generator, size = 1) {
  let elems = [];
  for (let elem of generator) {
    elems.push(elem);

    if (elems.length < size)
      continue;

    yield elems;
    elems = [];
  }
}

module.exports = {
  batch
}
