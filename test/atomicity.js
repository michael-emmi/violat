
const ATOMIC = {};

const WEAK = {weak: true};

const WEAKEST = {
  weak: true,
  weakRelaxLinearization: true,
  weakRelaxVisibility: true,
  weakRelaxReturns: true
};

module.exports = { ATOMIC, WEAK, WEAKEST }
