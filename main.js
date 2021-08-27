import Widget from "./matteWidget.js";

//import Report from "./makeReport.js";
import makeReport from "./makeReport.js";

let currentConfig;
const configFile = "configA.json";
<<<<<<< HEAD
//const configFile = 'configB.json'
=======
//const configFile = "configB.json";
>>>>>>> 29ebaffa890b2dac841b4e6636d6a32e63e451a8

const divContainer = document.getElementById("widget-container");
const fileUpload = document.getElementById("config-file");
const setAns = document.getElementById("set-ans");
const testReport = document.getElementById("test-report");
const playback = document.getElementById("playback");
const fileJsonUpload = document.getElementById("json-log-file");
const SVGUpload = document.getElementById("svgfile");
const answerJsons = document.getElementById("answerJsons");

let svg;

answerJsons.onchange = (inn) => {
  let jsonstreng = "";
  let attemp_ids = [];
  let task_ids = [];
  let sss = "";

  let chosen_files = inn.currentTarget.files;

  const promise1 = new Promise((resolve, reject) => {
    for (var i = 0; i < chosen_files.length; i++) {
      (function (f, i) {
        var filereader = new FileReader();

        filereader.onloadend = function (e) {
          //console.log("filereader.onloaded: File: " + f.name + " index:" + i);

          //extract attempt id from file name
          //legger bare inn nye attemptid'er (unngår dobbletgjengere)
          if (!attemp_ids.includes(f.name.split(".")[0].slice(5))) {
            task_ids[i] = f.name.split("-")[0];
            //hvis førsteside (task1: forsøknavn input) hentes attemptnavn
            if (task_ids.length == 0 || f.name.split("-")[0] == task_ids[0]) {
              attemp_ids[i] = f.name.split(".")[0].slice(5);
              sss += attemp_ids[i] + ":" + e.currentTarget.result + ",";
            } else {
              //ellers hentes unike attemptid'er med dato
              attemp_ids[i] = f.name.split(".")[0].slice(5);

              //fetch date and time from first matisktikk event
              let timex = new Date(
                JSON.parse(e.currentTarget.result)[0].time
              ).toISOString();
              let att_time = timex.slice(0, 10) + " " + timex.slice(11, 19);
              sss += attemp_ids[i] + ":" + '"' + att_time + '"' + ",";
            }
          }
          if (task_ids.length > 0 && f.name.split("-")[0] != task_ids[0]) {
            jsonstreng +=
              e.currentTarget.result
                .trim()
                .slice(1, -1)
                .replace(
                  /"tdiff": ""|"tdiff": null|"tdiff": "NaN"/g,
                  '"a_file": "' + chosen_files[i].name + '"'
                ) + ",";
          }

          if (i == chosen_files.length - 1) {
            resolve(sss + jsonstreng);
          }
        };
        filereader.readAsText(f);
      })(chosen_files[i], i);
    }
  });

  promise1.then((value) => {
    let rep = new makeReport(value);
  });
};

fileUpload.onchange = (inn) => {
  let file = fileUpload.files[0];
  let fr = new FileReader();
  fr.onload = (evt) => {
    let config = JSON.parse(evt.target.result);
    currentConfig = config;
    makeWidget(config, null, false);
  };
  fr.readAsText(file);
};

let ans = {};

setAns.onclick = () => {
  console.log("SETTING ANSWER");
  if (ans.log.length > 0) makeWidget(currentConfig, ans.log, null);
};

/* testReport.onclick = () => {
  console.log("Making excel report from matistikk answer Json files");
  //if (ans.log.length > 0) makeWidget(currentConfig, ans.log, null);
  window.widget = new makeReport();
}; */

playback.onclick = () => {
  console.log("PLAYBACK");
  makeWidget(currentConfig, ans.log, true);
};

//let answerEl = document.getElementById("answer");

fileJsonUpload.onchange = (inn) => {
  console.log("Getting log data from json");
  let file = fileJsonUpload.files[0];
  let fr = new FileReader();
  fr.onload = (evt) => {
    let jsonobj = JSON.parse(evt.target.result);
    let logdata_json = jsonobj;
    console.log(logdata_json);
    makeWidget(currentConfig, logdata_json, true);
  };
  fr.readAsText(file);
};

SVGUpload.onchange = (inn) => {
  console.log("Getting uploaded svg file");
  let file = SVGUpload.files[0];
  let fr = new FileReader();
  fr.onload = (evt) => {
    //let svgobj = JSON.parse(evt.target.result);
    svg = evt.target.result;
    console.log("loading svg file");
    makeWidget(currentConfig, null, null, svg, file.name);
  };
  fr.readAsText(file);
};

//Onanswer is callback
//Answer is previous
let onAnswer = (answer) => {
  ans.log = answer != null ? answer : [];
  //console.log(answer);
};

/* fetch(`./configs/${configFile}`)
  .then(resp => resp.json())
  .then(config => makeWidget(config, null, false)); */

fetch(`./configs/${configFile}`)
  .then((resp) => resp.json())
  .then((config) => {
    currentConfig = config;
    makeWidget(config);
  });

function makeWidget(
  config,
  answer = null,
  playback = false,
  svg = null,
  filename = null
) {
  // let divEl = document.getElementById('widget')
  if (divContainer.hasChildNodes())
    divContainer.removeChild(divContainer.firstChild);
  //answerEl.value = "";
  delete window.widget;
  let divEl = document.createElement("div");
  divEl.id = "widget" + Math.random().toString(36).substring(2, 15);
  divContainer.append(divEl);
  window.widget = new Widget(divEl.id, config, answer, onAnswer, {
    playback: playback,
    svg: svg,
    filename: filename,
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
