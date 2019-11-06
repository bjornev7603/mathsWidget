/* eslint-disable semi */
/* eslint-disable indent */
/**
 * Module that handles conditional statements from json object
 * objects are of the form
 * op: operator
 * a: first argument
 * b: last argument
 *
 * the statements can be nested together, e.g.
 * {
 *   op: 'or',
 *   a:{
 *       op:'eq',
 *       a:1,
 *       b:2
 *     },
 *   b:{
 *       op:'lt',
 *       a:1,
 *       b:2
 *     }
 * }
 */

const ops = {
  eq: (a, b) => a === b,
  neq: (a, b) => a !== b,
  lt: (a, b) => a < b,
  leq: (a, b) => a <= b,
  gt: (a, b) => a > b,
  geq: (a, b) => a >= b,
  and: (a, b) => a && b,
  or: (a, b) => a || b,
  xor: (a, b) => a != b,
  add: (a, b) => a + b,
  sub: (a, b) => a - b,
  mult: (a, b) => a * b,
  div: (a, b) => a / b
}

const getOperator = op => {
  return op in ops ? ops[op] : undefined
}

const check = (input, vars = null) => {
  const op = getOperator(input.op)
  if (!op) {
    console.log("check operator, cannot find operator?!")
    return undefined
  }

  let a = input.a,
    b = input.b
  if (typeof a === "object") a = check(a, vars)
  if (typeof b === "object") b = check(b, vars)
  if (typeof a === "string" && a.charAt() == "_") a = vars[a.slice(1)]
  if (typeof b === "string" && b.charAt() == "_") b = vars[b.slice(1)]
  // Need to check if argument is a variable or a constant!

  return op(a, b)
}
