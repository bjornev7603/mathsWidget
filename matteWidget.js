export default class MatteWidget {
  //class MatteWidget {
  constructor(divElementId, config, answer = null, onAnswer, options) {
    // DEBUG if playback
    console.log(
      options && options.playback
        ? "Widget in playback mode"
        : "Widget in standard mode"
    );

    // DEBUG if svg
    console.log(
      options && options.svg
        ? "Loaded svg from Main(test framework) at folk.ntnu.no"
        : "Widget loaded svg normally, without passing svg object in options"
    );

    this.divElementId = divElementId;

    //playback events
    this.eventHandlers = {
      move: arg => this.replay_svg(arg),
      hit: arg => this.replay_svg(arg),
      click: arg => this.replay_svg(arg),
      timer_click: arg => this.replay_svg(arg)

      //RESET: () => this.api.reset()
    };

    const default_config = {
      svgUrl: "streng",
      mp3BaseUrl: "mappe hvor mp3'er er",
      viewBox: {
        x: 1024,
        y: 768
      }
    };
    this.config = {
      ...default_config,
      ...config
    };
    this.answer = answer || [];
    this.onAnswer = onAnswer;
    this.audioEl = new Audio();
    this.timerInvoked = false; //brukes for å anslå om allerede trykket på timer-objekt

    //get svg from upload file and save this to window.name,
    //otherwise fetch uploaded svg object stored i window.name
    if (options && options.svg != null && options.svg != false) {
      this.svg = options.svg;
      this.filename = options.filename;
      window.name = this.svg;
    } else if (window.name.length > 50) {
      this.svg = window.name;
    } else {
      this.svg == null;
    }

    this.svgimage;

    //if Ipad (ioS), additional dom elements is given CSS class,
    //because ioS does not allow styling of container elements
    this.selected_class = this.getOS() == "iOS" ? "framed_ios" : "framed";

    this.size_src_obj = 0; //reset size of object when replaying
    this.already_replay = false; //checks if new replay
    this.x_offset = [];
    this.y_offset = [];
    this.x_offset_diff = [];
    this.y_offset_diff = [];
    this.init_mx_a = [];
    this.init_mx_b = [];
    this.init_mx_c = [];
    this.init_mx_d = [];

    customNav.init();
    document.getElementById(this.divElementId).classList.add("matte-widget");
    this.divContainer = document.getElementById("widget-container");

    const size = options.playback ? "90%" : "100%";
    this.svgelement = SVG(this.divElementId).size("100%", "100%");
    this.svgelement.viewbox(0, 0, this.config.viewBox.x, this.config.viewBox.y);
    this.width_svg = size;
    this.height_svg = size;
    this.targets;
    this.countdown_msec = 10000;
    this.timeout_msec = 3000;

    this.vars = {};

    this.answer = answer || [];
    //this.answer = answer || { log: [], states: [] };
    if (this.answer.log !== undefined) this.answer = this.answer.log;

    //this.onAnswer = onAnswer;
    if (options.playback) {
      this.playback = options.playback;
    }

    this.buildDOM();

    if (this.answer !== undefined && this.answer.length == 0 && this.playback) {
      this.show_msg("This log is empty");
      //return;
    }

    //if playback mode and there is log data (answer) to emulate
    if (this.playback && this.answer.length) {
      this.buildPlayback();
      let skip = false;
      this.state = {
        //Initial state
        nextevent: this.answer[0].event,
        current: 0,
        forward: () => {
          let skip = false;

          if (this.state.current + 1 < this.answer.length) {
            let t1 = this.answer[this.state.current];
            t1 = typeof t1.time === "object" ? t1.time[0] : t1.time;
            let t2 = this.answer[this.state.current + 1];
            t2 = typeof t2.time === "object" ? t2.time[0] : t2.time;
            if (t1 == t2) {
              //signal to step over index if move and odd number -> duplicate move
              skip = true;
            }
          }

          //next action and index (augmented below)
          let action = this.state.nextevent;
          let index = this.state.current;

          if (skip) this.state.current++;

          this.state.current =
            this.state.current != this.answer.length
              ? (this.state.current + 1) % this.answer.length
              : 0;
          this.state.nextevent = this.answer[this.state.current].event;

          return { action: action, index: index, skip: skip };
        }
      };
    }

    //***************************
    //Speak on page load
    //***************************
    let loc =
      document.location.href.includes(":55") == false
        ? document.location.href
        : "";
    this.audioEl.src =
      loc + this.config.mp3BaseUrl + this.getFileNumstr() + ".m4a";
    this.audioEl.play().catch(e => console.warn(e));

    if (this.svg == null || this.svg == 1) {
      fetch(this.svg == null ? this.config.svgUrl : this.svg, {
        method: "GET",
        mode: "no-cors"
      })
        .then(resp => resp.text())
        .then(svgl => {
          this.parseSVG(svgl);
        })
        .then(pm => {
          this.runscript();
        });
    } else {
      this.parseSVG(this.svg);
      this.runscript();
    }

    //SVG event handlers
  }

  show_msg(msg) {
    let msgDiv;
    msgDiv = document.getElementById("msgdiv");
    if (msgDiv != undefined) {
      msgDiv.remove();
    }

    msgDiv = document.createElement("div");
    msgDiv.id = "msgdiv";
    msgDiv.classList.add("drawing-playback-container");
    msgDiv.style = "float: left";
    this.divContainer.prepend(msgDiv);

    let span = document.createElement("span");
    span.style = "color: red; font-weight: bold;";
    msgDiv.append(span);
    let msgTxt = document.createTextNode(msg);
    span.append(msgTxt);
  }

  //********************************************** */
  //PLAYBACK: reset all source elements to original state
  //********************************************** */
  reset_svg(ind, lg) {
    //reset select element
    var memb = document.getElementsByClassName("select");
    for (var i = 0; i < memb.length; i++) {
      memb[i].classList.toggle(this.selected_class, false);
      memb[i].classList.toggle("unframed", false);
    }

    if (memb[0].classList.contains("colorized"))
      this.selected_class = "in_color";

    let src_el = "{g}";
    let lg_moved_obj = [];
    let lg_times = [];
    //select nodes from svg file
    let all_src = SVG().select(".source").members;

    //Reset moving object (source)

    //Loop all source objects
    for (let src_el of all_src) {
      //Loop all log elements
      for (let lg_el = 0; lg_el < lg.length; lg_el++) {
        //add string to start of node id if it start with integer in svg nodetree
        for (let src_el of all_src) {
          if (this.is_numeric(src_el.node.id[0])) {
            src_el.node.setAttribute("id", "gr" + src_el.node.id);
          }
        }
        let log_objid = lg[lg_el].obj;
        //problem of integer start of string
        log_objid = this.is_numeric(log_objid[0])
          ? (log_objid = "gr" + log_objid)
          : log_objid;

        //select specific node id from svg
        let svg_obj = SVG().select("#" + log_objid).members[0];

        //***************************************************** */
        //only take source objects that correspond to id log row
        //***************************************************** */
        if (src_el.node.id == log_objid) {
          if (
            !this.already_replay &&
            svg_obj.node.transform.animVal.length > 0
          ) {
            //calculate offsets to simulate movements from log with correct xy positions
            //(some svgs have deviating posisions in transform matrix, or different group objects have the same x /y pos in matrix despite sub els have diff x / y
            //define px difference between transform matrix x/y and log x/y to get real paths)

            //diff x
            if (log_objid in this.x_offset_diff == false) {
              this.x_offset[log_objid] =
                svg_obj.node.transform.animVal[0].matrix["e"];
              this.x_offset_diff[log_objid] =
                this.x_offset[log_objid] - lg[lg_el].x[0];
            }

            //diff y
            if (log_objid in this.y_offset_diff == false) {
              this.y_offset[log_objid] =
                svg_obj.node.transform.animVal[0].matrix["f"];
              this.y_offset_diff[log_objid] =
                this.y_offset[log_objid] - lg[lg_el].y[0];
            }
          }

          let srcid = src_el.node.id;
          if (
            lg_moved_obj.includes("gr" + log_objid) == false &&
            lg_times.includes(lg[lg_el].time[0]) == false
          ) {
            lg_moved_obj.push("gr" + log_objid);
            lg_times.push(lg[lg_el].time[0]);

            //
            if (this.is_numeric(log_objid[0])) {
              src_el.node.setAttribute("id", "gr" + log_objid);
            }

            if (log_objid in this.init_mx_a == false) {
              this.init_mx_a[log_objid] =
                src_el.node.transform.animVal[0].matrix["a"];
              this.init_mx_b[log_objid] =
                src_el.node.transform.animVal[0].matrix["b"];
              this.init_mx_c[log_objid] =
                src_el.node.transform.animVal[0].matrix["c"];
              this.init_mx_d[log_objid] =
                src_el.node.transform.animVal[0].matrix["d"];
            }

            src_el.node.setAttribute(
              "transform",
              "matrix(" +
                this.init_mx_a[log_objid] +
                "," +
                this.init_mx_b[log_objid] +
                "," +
                this.init_mx_c[log_objid] +
                "," +
                this.init_mx_d[log_objid] +
                "," +
                (src_el.node._gsTransform.x + this.x_offset_diff[log_objid]) +
                "," +
                (src_el.node._gsTransform.y + this.y_offset_diff[log_objid]) +
                ")"
            );

            src_el.node.style.opacity = 1;
          }
        }
      }
    }
    this.already_replay = true;
  }

  //Check if string consist of numbers
  is_numeric(str) {
    return /^\d+$/.test(str);
  }

  getOS() {
    var userAgent = window.navigator.userAgent,
      platform = window.navigator.platform,
      macosPlatforms = ["Macintosh", "MacIntel", "MacPPC", "Mac68K"],
      windowsPlatforms = ["Win32", "Win64", "Windows", "WinCE"],
      iosPlatforms = ["iPhone", "iPad", "iPod"],
      os = null;

    if (macosPlatforms.indexOf(platform) !== -1) {
      os = "Mac OS";
    } else if (iosPlatforms.indexOf(platform) !== -1) {
      os = "iOS";
    } else if (windowsPlatforms.indexOf(platform) !== -1) {
      os = "Windows";
    } else if (/Android/.test(userAgent)) {
      os = "Android";
    } else if (!os && /Linux/.test(platform)) {
      os = "Linux";
    }

    return os;
  }

  //******************************************************************* */
  //PLAYBACK: Main logic for emulating log event through svg actions
  replay_svg(arg) {
    if (arg == 0) this.reset_svg(arg, this.answer);

    var svg_pricks = SVG.select(".disappear").members;
    for (var i = 0; i < svg_pricks.length; i++) {
      svg_pricks[i].node.classList.toggle("disappear", false);
      svg_pricks[i].node.classList.toggle("re-appear", true);
    }

    let logg = this.answer[arg];
    //Select specific svg node element that corresponds to log row
    logg.obj = this.is_numeric(logg.obj[0]) ? "gr" + logg.obj : logg.obj;
    let svg_obj = SVG().select("#" + logg.obj).members[0];

    switch (logg.event) {
      case "move":
        if (typeof logg.x === "object") {
          logg.x.forEach((pos, index) => {
            let interval = 50; //msec
            setTimeout(
              () => {
                interval =
                  index < logg.x.length
                    ? logg.time[index + 1] - logg.time[index]
                    : 0;
                let pos_x =
                  index > 0
                    ? logg.x[index] + this.x_offset_diff[logg.obj]
                    : this.x_offset[logg.obj];

                let pos_y =
                  index > 0
                    ? +(logg.y[index] + this.y_offset_diff[logg.obj])
                    : this.y_offset[logg.obj];

                let nd_mx = svg_obj.node.transform.animVal[0].matrix;
                svg_obj.node.setAttribute(
                  "transform",
                  "matrix(" +
                    nd_mx["a"] +
                    "," +
                    nd_mx["b"] +
                    "," +
                    nd_mx["c"] +
                    "," +
                    nd_mx["d"] +
                    "," +
                    pos_x +
                    "," +
                    pos_y +
                    ")"
                );
              },
              index < logg.x.length && index == 1000 //comment last cond to apply logtime
                ? (logg.time[index + 1] - logg.time[index]) * index * 10
                : interval * index
            );
          });
        }
        break;

      case "hit":
        var t = logg.x * 0.94 + " " + logg.y * 0.91;
        let prefix = "";
        prefix = this.is_numeric(logg.obj[0]) ? "#gr" : "#";

        let svg_ele = SVG().select(prefix + logg.obj).members[0];
        if (SVG().select(".target.eat").members.length > 0) {
          TweenLite.to(svg_ele, 0.1, {
            opacity: 0,
            scale: 0,
            svgOrigin: t
          });
        } else {
          svg_ele.node.style.opacity = "0.66";
        }
        break;
      case "click":
      case "timer_click":
        var memb = document.getElementsByClassName("select");
        var memb_oth = document.getElementsByClassName("start_timer");
        for (var i = 0; i < memb.length; i++) {
          memb[i].classList.toggle(this.selected_class, false);
          memb[i].classList.toggle("unframed", false);

          if (memb_oth.length > 0 && memb_oth[0].classList.length > 0) {
            memb_oth[0].classList.toggle("unframed", false);
            memb_oth[0].classList.toggle(this.selected_class, false);
          }
        }

        let svg_sel_el = SVG().select("#" + logg.obj).members[0].node;
        svg_sel_el.classList.toggle(this.selected_class, true);

        break;
    }
  }

  buildDOM() {
    // if (this.playback) this.buildPlayback();
    //else this.buildMenu();

    let parent = document.getElementById(this.divElementId);
    //parent.setAttribute("height", `${this.config.ggbApplet.height}px`);
    let ggb = document.createElement("div");
    //ggb.classList.add("widget-box");
    //ggb.id = this.ggbId;

    parent.append(ggb);
  }

  //PLAYBACK: create playback navigation button in div container which handles actions.
  //eventhandler calls methods to handle corresponding actions (move, hit, click-select)
  buildPlayback() {
    const menuDivElement = document.createElement("div");
    menuDivElement.classList.add("drawing-playback-container");

    const ControlDivElement = document.createElement("div");
    ControlDivElement.classList.add("drawing-playback-container");

    //navigating between answers (states)
    const actions = [
      {
        name: "",
        handler: () => {
          let toggle = false;
          let { action, index, skip } = this.state.forward();
          if (
            index == this.answer.length - 1 ||
            (index == this.answer.length - 2 && skip)
          )
            toggle = true;
          //if (index == 0) this.eventHandlers.CLEAR_ANIMATIONS();
          this.eventHandlers[action](index);
          return toggle;
        },
        icon: "mdi-skip-next",
        reset_icon: "mdi-skip-backward"
      }
    ];
    for (let tool of actions) {
      let div = document.createElement("div");
      div.classList.add("playback-tool");
      // div.style.backgroundColor = '#000'
      let i = document.createElement("i");
      i.classList.add("mdi", tool.icon);
      div.append(i);
      ControlDivElement.append(div);
      div.addEventListener("click", () => {
        let toggle = tool.handler();
        if (toggle) {
          i.classList.remove(tool.icon);
          i.classList.add(tool.reset_icon);
        } else if (i.classList.contains(tool.reset_icon)) {
          i.classList.remove(tool.reset_icon);
          i.classList.add(tool.icon);
        }
      });
    }
    const divEl = document.getElementById(this.divElementId);
    menuDivElement.append(ControlDivElement);
    divEl.prepend(menuDivElement);
  }

  //****************************** */
  //load image into SVG DOM tree
  parseSVG = svgResp => {
    var doc = new DOMParser().parseFromString(svgResp, "image/svg+xml");
    doc
      .querySelector("svg")
      .setAttribute("width", this.width_svg > 0 ? this.width_svg : "100%");
    doc
      .querySelector("svg")
      .setAttribute("height", this.height_svg > 0 ? this.height_svg : "100%");
    window.svgdoc = doc;
    this.svgimage = this.svgelement.svg(
      new XMLSerializer().serializeToString(doc)
    );
  };

  runscript() {
    // HANDLER overview:
    // runscript(
    //     SVG.select(".next").on("click"
    //     SVG.select(".start_timer").on("click"
    //       setTimeout()
    //     SVG.select(".speak").on("click"
    //     SVG.select(".select").on("click"
    //     Draggable.create(".source"
    //       onDragStart
    //       onDrag
    //       onDragEnd
    //         hitTest()
    // )

    this.targets = SVG.select(".target");
    //save "this" object to make it available for calls from inside event handlers/methods
    let widgetThis = this;

    this.size_src_obj =
      SVG().select(".source").members.length > 0 &&
      SVG().select(".source").members[0].node.transform.animVal.length > 0
        ? SVG().select(".source").members[0].node.transform.animVal[0].matrix[
            "a"
          ]
        : 0;

    //fetching svg top node for Tweenlite touch action
    var imid = this.svgimage.node.id;
    TweenLite.set("#" + imid, {
      touchAction: "manipulation"
    });

    /************** */
    //CLICK/TOUCH EVENTS
    //*************************************************************
    //CLICK NEXT BUTTON
    //*************************************************************
    SVG.select(".next").on("click", event => {
      //***************************
      //Speak on click/touch next button
      //***************************
      //this.onAnswer(this.answer);

      if (event.currentTarget.classList.contains("speak")) {
        this.audioEl.src =
          this.config.mp3BaseUrl + this.getFileNumstr() + "next.m4a";
        this.audioEl.play().catch(e => {
          console.warn(e);
          customNav.next();
        });

        this.audioEl.onended = customNav.next;
      } else {
        customNav.next();
      }
    });

    //*************************************************************
    //Trykk på et objekt av timerklasse. Teller ned fra x sekund (synlig nedtelling og brikker som forsvinner etter x sekund)
    //Kode gjør:
    //1. Anslår ant sekund og starter timer
    //2. Fading vha opasitetsendring
    //3. Skjuler eller viser prikker i brikkeoppgaver
    SVG.select(".start_timer").on("click", event => {
      //hvis attr "single_attempt" satt i svg for at Timer ikke kan restartes
      let att = event.currentTarget.attributes["single_attempt"];
      if (
        this.timerInvoked == false ||
        att == null ||
        (att != null && att.value.trim() != "true")
      ) {
        this.timerInvoked = true; //brukes for å anslå om allerede trykket på timer-objekt

        //valgfri fading av objekt: henter element av klassen fade, dette settes med full opasitet - synlig
        var fades = SVG.select(".fade").members;
        for (var i = 0; i < fades.length; i++) {
          SVG.select(".fade").members[i].node.style.opacity = 1;
        }

        //henter timer(e) fra svg-fil og henter info om varighet eller default varighet
        var timers = SVG.select(".start_timer").members;
        for (var i = 0; i < timers.length; i++) {
          widgetThis.countdown_msec =
            timers[i].node.attributes["countdown_sec"] != null
              ? //henter timer-varighet i svg-fil hvis satt, ellers fra widgetvariabel
                timers[i].node.attributes["countdown_sec"].value * 1000
              : widgetThis.countdown_msec;
        }

        //gjør prikker synlige i timerens x antall sek, ved å skifte css klasse
        var svg_pricks = SVG.select(".disappear").members;
        for (var i = 0; i < svg_pricks.length; i++) {
          svg_pricks[i].node.classList.toggle("disappear", false);
          svg_pricks[i].node.classList.toggle("re-appear", true);
        }

        //viser tid som er igjen ved å fade ut et objekt av klassen "fade"et av timer-varigheten
        var countDownDate = new Date().getTime() + widgetThis.countdown_msec;
        var x = setInterval(function() {
          let now = new Date().getTime();
          // Find the distance between now and the count down date
          let distance = countDownDate - now;

          // Time calculations for days, hours, minutes and seconds
          let seconds = Math.floor((distance % (1000 * 60)) / 1000);

          //fader ut objekt ved å endre opasitet vha nedtelling
          for (var i = 0; i < fades.length; i++) {
            var fadeto = fades[i].node.classList.contains("start_timer")
              ? 0.5
              : 0.33;
            fades[i].node.style.opacity = 1 - (1 - fadeto) / (seconds + 1); //algoritme for fading
          }
          if (distance < 0) {
            clearInterval(x);
          }
        }, 500); //msek

        //Etter noen sekund forsvinner brikkeprikkene (blir hvite)
        let mintimer = setTimeout(function() {
          var svg_pricks = SVG.select(".re-appear").members;
          for (var i = 0; i < svg_pricks.length; i++) {
            svg_pricks[i].node.classList.toggle("disappear", true);
            svg_pricks[i].node.classList.toggle("re-appear", false);
          }
          clearTimeout(mintimer);
        }, widgetThis.countdown_msec);

        this.setEventdata("timer_click", event, "", widgetThis);
      }
    });

    //******************************************************* */
    //få objekt til å snakke når de trykkes på,
    //spille mp3-filer m bestemte navn [tresifra oppgkode][speak][event][evtl selectverdi]
    //******************************************************* */
    SVG.select(".speak").on("click", event => {
      //henter mp3 fil fra en katalog, navn samsvarer med elementets klassenavn (eller flere)
      //*************************************
      //Snakker ved trykk ekorn eller på flervalg(select)element
      //*************************************
      if (!event.currentTarget.classList.contains("next")) {
        //snakk på nesteknapp allerede håndtert i onNext

        //if speak selected number, no file num needed
        let filenum = event.currentTarget.classList.contains("select")
          ? ""
          : this.getFileNumstr();

        //selve lydfilnavnet
        this.audioEl.src =
          this.config.mp3BaseUrl +
          filenum +
          this.getSelstr(event.currentTarget) + //hvis flervalg (select), hentes evt verdi som skal tales
          ".m4a";
        this.audioEl.play().catch(e => console.warn(e));
      }
    });

    //******************************************************* */
    //Klikk på flervalg(select) medfører ramme rundt elementet, og loggføring (av x, y, objekt og verdi i selectelement)
    //******************************************************* */
    SVG.select(".select").on("click", event => {
      var memb = document.getElementsByClassName("select");
      for (var i = 0; i < memb.length; i++) {
        memb[i].classList.toggle(this.selected_class, false);
        memb[i].classList.toggle("unframed", false);
      }
      if (event.currentTarget.classList.contains("colorized")) {
        this.selected_class = "in_color";
      }

      if (event.currentTarget.classList.contains("no_frame")) {
        this.selected_class = "unframed";
      }

      event.currentTarget.classList.toggle(this.selected_class, true);
      //logger hendelser
      this.setEventdata("click", event, "", widgetThis);
    });

    //SKRIV INN TALL (brukes hvis behov for å legge til noe i et tekstfelt generert dynamisk ved klikk på noe i svg)
    SVG.select(".writenumber").on("click", event => {
      var t = (event.currentTarget.innerHTML =
        "<div contenteditable='true'><text>Innhold</text></div>");
    });
    //***************************************
    //***************************************
    let event;
    Draggable.create(".source", {
      //setter bounds til å dekke alt (noe svg'er med rare startverdier)
      bounds: {
        minX: -4000,
        maxX: 1024,
        minY: -4005,
        maxY: 1024
      },

      onDragLeave: function() {
        //this.update();
      },

      onDragStart: function(e) {
        //logger hendelser
        event = widgetThis.setEventdata("move", this, "", widgetThis);
      },

      onDrag: function(evt) {
        var terskel = 6;
        let lastX = event.x[event.x.length - 1],
          lastY = event.y[event.y.length - 1];
        if (
          widgetThis.answer.length == 1 ||
          this.x - lastX > terskel ||
          this.x - lastX < -terskel ||
          this.y - lastY > terskel ||
          this.y - lastY < -terskel
        ) {
          event.x.push(this.x);
          event.y.push(this.y);
          event.time.push(Date.now());
          //console.log(this);
        }
      },

      onDragEnd: function(e) {
        /* event.x.push(this.x);
        event.y.push(this.y);
        event.time.push(Date.now()); */
        //widgetThis.updateAnswer(event);

        this.target.style.width = "";
        this.target.style.height = "";
        var i = widgetThis.targets.members.length;
        //Ved treff av et target
        while (--i > -1) {
          if (this.hitTest(widgetThis.targets.members[i].node)) {
            //skriver info om posisjon, tidspkt og target_id for treff av target
            let selval =
              this.target.attributes["selectvalue"] != null
                ? this.target.attributes["selectvalue"].value
                : "";

            //logger hendelser
            widgetThis.setEventdata(
              "hit",
              this,
              widgetThis.targets.members[i].node.id,
              widgetThis
            );

            var pos = widgetThis.targets.members[i].bbox();
            var t = pos.x2 * 0.97 + " " + pos.cy * 0.95;

            //ser om klassen disappear finnes i src svg-objekt
            var disappear = widgetThis.targets.members[
              i
            ].node.classList.contains("eat")
              ? true
              : false;
            if (disappear) {
              TweenLite.to(this.target, 0.1, {
                opacity: 0,
                scale: 0,
                svgOrigin: t
              });
            }

            let sources = SVG.select(".source").members;
            for (var xx = 0; xx < sources.length; xx++) {
              //if (sources[i].node.id != this.target.id) {
              if (sources[xx].node.classList.contains("all_disappear")) {
                sources[xx].node.classList.toggle("sources_disappear", true);
                sources[xx].node.classList.toggle("source", false);
              }
            }

            //***************************
            //Speak on target hit
            //***************************
            if (
              widgetThis.targets.members[i].node.classList.contains(
                "speak_when_hit"
              )
            ) {
              widgetThis.audioEl.src =
                widgetThis.config.mp3BaseUrl +
                widgetThis.getFileNumstr() +
                "hit.m4a";
              widgetThis.audioEl.play().catch(e => console.warn(e));
            }
          }
        }
      }
    });
  }

  //Updating on action
  updateAnswer(newAnswer) {
    this.answer.push(newAnswer);
    this.onAnswer(this.answer);
  }

  //logging pos x|y, obj, val, ev_type, etc
  //para ev_type, eventobj (x|y value), object, widget (for variables)
  setEventdata = (evtype, ev, hitobj, w_this) => {
    let an = w_this.answer;
    let trgobj;
    if (ev.currentTarget != null) trgobj = ev.currentTarget;
    else if (ev.target != null) trgobj = ev.target;
    else trgobj = "";

    const eventen = {
      x: evtype != "move" ? ev.x : [ev.x],
      y: evtype != "move" ? ev.y : [ev.y],
      obj: trgobj.id != null ? trgobj.id : "emp",
      val:
        trgobj.attributes["selectvalue"] == null
          ? "emp"
          : trgobj.attributes["selectvalue"].value,

      event: evtype,
      time: evtype != "move" ? Date.now() : [Date.now()],
      tdiff:
        evtype != "move" &&
        an != null &&
        an[an.length - 1] &&
        an[an.length - 1].time != null
          ? (Date.now() -
              an[an.length - 1].time[an[an.length - 1].time.length - 1]) /
            1000
          : "",
      hit: hitobj
    };
    w_this.updateAnswer(eventen);
    //.catch(e => console.warn("error when logging!"));
    return eventen;
  };

  //hente tre første siffer i filnavn
  getFileNumstr = () => {
    let fnm = this.filename != undefined ? this.filename : this.config.svgUrl;
    return fnm.substr(fnm.search("[0-9]{3}"), 3);
  };

  //flervalg(select)element hentes fra streng
  getSelstr = trg => {
    let num_in_url = "";
    if (
      trg.attributes["selectvalue"] &&
      trg.classList.contains("select") &&
      trg.attributes["selectvalue"].value.search("[^0-9]+")
    ) {
      return "select" + trg.attributes["selectvalue"].value.substr(0, 2).trim();
    } else {
      return num_in_url;
    }
  };
}

var matteWidget = {
  scripts: [
    "/libs/nav/customNav.js",
    "https://cdnjs.cloudflare.com/ajax/libs/svg.js/2.6.6/svg.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/gsap/2.1.3/plugins/CSSPlugin.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/gsap/2.1.3/TweenLite.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/gsap/2.1.3/utils/Draggable.min.js"
  ],

  links: [
    "/widgets/css/matteWidget.css",
    "https://cdn.materialdesignicons.com/4.7.95/css/materialdesignicons.min.css"
  ],

  widgetClass: MatteWidget,
  contributesAnswer: true,
  jsonSchema: {
    title: "MatteWidget",
    description: "Denne widgeten inneholder drag - og dropbare objekt",
    type: "object",
    properties: {
      svgUrl: {
        type: "string",
        title: "URL for svg-file"
      },
      mp3BaseUrl: {
        type: "string",
        title: "URL for mp3-files"
      },
      viewBox: {
        type: "object",
        properties: {
          x: {
            type: "number",
            title: "viewbox x-value"
          },
          y: {
            type: "number",
            title: "viewbox y-value"
          }
        }
      }
    }
  },
  jsonSchemaData: {
    svgUrl: "url for svgs",
    mp3BaseUrl: "base url for mp3-files",
    viewBox: {
      x: 1024,
      y: 768
    }
  },
  configStructure: {
    svgUrl: "url for svgs",
    mp3BaseUrl: "base url for mp3-files",
    viewBox: {
      x: 1024,
      y: 768
    }
  }
};
