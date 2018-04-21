export function *batch<T>(generator: Iterable<T>, { size = 1, max }): Iterable<T[]> {
  let elems: T[] = [];
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

  // emit the leftover elements
  if (elems.length)
    yield elems;
}
