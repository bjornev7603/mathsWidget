export default class Test {
  constructor(divId, config, answer = null, onAnswer, options) {
    this.divId = divId
    this.onAnswer = onAnswer
    this.config = config
    this.vars = {}
    this.givenFb = []
    window.onload = this.buildDom()
    this.fb = new FeedBack(divId, this.config.feedback.params)
  }
  buildDom() {
    // let div = document.getElementById(this.divId)
    let form = document.createElement("div")
    form.id = `${this.divId}-form`
    let inputs = ["a", "b"]
    for (let i of inputs) {
      let inp = document.createElement("input")
      inp.name = i
      let id = `${this.divId}-${i}`
      inp.id = id
      inp.type = "number"
      let val = Math.floor(Math.random() * 10)
      let vars = this.vars
      vars[i] = val
      // inp.value = val
      inp.setAttribute("value", val)
      form.innerHTML += `${i}: `
      form.append(inp)
      form.innerHTML += `<br>`
      // inp.onchange = function(i) {
      //   vars[i] = this.value
      //   console.log(vars)
      // }
    }
    form.innerHTML += `<br>`
    let sub = document.createElement("button")
    sub.innerHTML = "check"
    sub.onclick = this.checkAns
    form.append(sub)
    document.getElementById(this.divId).append(form)

    let inps = document.getElementById(this.divId).getElementsByTagName("input")
    let vars = this.vars
    let self = this
    for (let inp of inps) {
      inp.onchange = function() {
        let name = this.name
        let val = parseInt(this.value)
        vars[name] = val
        self.onAnswer(JSON.stringify(self.vars))
      }
    }
  }
  checkAns = event => {
    let conds = []
    for (let c of this.config.feedback.condition) {
      let ch = check(c, this.vars)
      conds.push(ch)
      // console.log(`checking condition ${c}, evaluated to ${ch}`)
    }
    let fbs = this.config.feedback.fb
      .filter((f, i) => {
        return conds[i]
      })
      .flat()
      .filter(f => !this.givenFb.includes(f))
    if (!fbs.length && !this.givenFb.includes(this.config.feedback.default)) {
      this.givenFb.push(this.config.feedback.default)
      this.fb.push(this.config.feedback.default)
      return
    } else if (fbs.length) {
      // console.log(fbs)
      let rand = Math.random()
      let floor = Math.floor
      let fb = fbs[floor(rand * fbs.length + 1) - 1]
      this.givenFb.push(fb)
      this.fb.push(fb, "sucess")
      return
    }
    event.disabled = true
    // console.log(event)
    // this.fb.push('Im doing dis :/', 'sucess')
    // this.fb.push('Im doing dis :/', 'error')
    // this.fb.push('Why no btn ?! :/')
    // event.preventDefault()
    // console.log(this.vars)
    // for (let x in this.vars) {
    //   console.log(x)
    // }
  }
}

function debounced(delay, fn) {
  let timerId
  return function(...args) {
    if (timerId) {
      clearTimeout(timerId)
    }
    timerId = setTimeout(() => {
      fn(...args)
      timerId = null
    }, delay)
  }
}
