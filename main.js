//import Widget from './ggbWidget.js'
//import Widget from './test.js'
//import Widget from './bjornWidget.js'

//import Widget from './figurWidget.js'
import Widget from "./matteWidget.js";

const configFile = "configA.json";
let currentConfig;
// const configFile = 'configB.json'

const divContainer = document.getElementById("widget-container");
const fileUpload = document.getElementById("config-file");
const setAns = document.getElementById("set-ans");
const playback = document.getElementById("playback");
const fileJsonUpload = document.getElementById("json-log-file");
const SVGUpload = document.getElementById("svgfile");

fileUpload.onchange = inn => {
  let file = fileUpload.files[0];
  let fr = new FileReader();
  fr.onload = evt => {
    let config = JSON.parse(evt.target.result);
    currentConfig = config;
    makeWidget(config, null, false);
  };
  fr.readAsText(file);
};

let ans = {};

setAns.onclick = () => {
  console.log("SETTING ANSWER");
  if (ans.log.length > 0) makeWidget(currentConfig, null, ans.log);
};

playback.onclick = () => {
  console.log("PLAYBACK");
  if (ans.log.length > 0) makeWidget(currentConfig, ans.log, null, true);
};

//let answerEl = document.getElementById("answer");

fileJsonUpload.onchange = inn => {
  console.log("Getting log data from json");
  let file = fileJsonUpload.files[0];
  let fr = new FileReader();
  fr.onload = evt => {
    let jsonobj = JSON.parse(evt.target.result);
    logdata_json = jsonobj;
    console.log(logdata_json);
    makeWidget(currentConfig, logdata_json.log, null, true);
  };
  fr.readAsText(file);
};

SVGUpload.onchange = inn => {
  console.log("Getting uploaded svg file");
  let file = SVGUpload.files[0];
  let fr = new FileReader();
  fr.onload = evt => {
    //let svgobj = JSON.parse(evt.target.result);
    let svg = evt.target.result;
    console.log("loading svg file");
    makeWidget(currentConfig, null, svg);
  };
  fr.readAsText(file);
};

//Onanswer is callback
//Answer is previous
let onAnswer = answer => {
  ans.log = answer;
  console.log(answer);
};

/* fetch(`./configs/${configFile}`)
  .then(resp => resp.json())
  .then(config => makeWidget(config, null, false)); */

fetch(`./configs/${configFile}`)
  .then(resp => resp.json())
  .then(config => {
    currentConfig = config;
    makeWidget(config);
  });

function makeWidget(config, answer = null, svg = null, playback = false) {
  // let divEl = document.getElementById('widget')
  if (divContainer.hasChildNodes())
    divContainer.removeChild(divContainer.firstChild);
  //answerEl.value = "";
  delete window.widget;
  let divEl = document.createElement("div");
  divEl.id =
    "widget" +
    Math.random()
      .toString(36)
      .substring(2, 15);
  divContainer.append(divEl);
  window.widget = new Widget(divEl.id, config, answer, onAnswer, svg, {
    playback: playback
  });
}

/* let setAns = () => {
  console.log("setting answer...");
  let ansWidget = new Widget(
    document.getElementById("setAns").id,
    config,
    ans,
    function(arg) {
      console.log("new ans:", arg);
    },
    {}
  );
}; */

//document.getElementById("setBtn").onclick = setAns;
