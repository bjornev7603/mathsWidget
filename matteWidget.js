// Bygger et arrayobjekt som tar vare på hvert dra-objekts
// posisjon, tidsbruk og målet det evt. traff.

export default class MatteWidget {
  // class MatteWidget {
  constructor(divElementId, config, answer = null, onAnswer, options) {
    this.divElementId = divElementId;

    //playback events
    this.eventHandlers = {
      move: arg => this.replay_svg(arg),
      hit: arg => this.replay_svg(arg)
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

    customNav.init();
    document.getElementById(this.divElementId).classList.add("matte-widget");

    this.svgelement = SVG(this.divElementId).size("70%", "70%");
    this.svgelement.viewbox(0, 0, this.config.viewBox.x, this.config.viewBox.y);
    this.width_svg = "100%";
    this.height_svg = "100%";
    this.targets;
    this.countdown_msec = 10000;
    this.timeout_msec = 3000;

    this.vars = {};
    this.answer = answer || { log: [], states: [] };
    if (this.answer.log !== undefined) this.answer = this.answer.log;

    //this.onAnswer = onAnswer;
    if (options.playback) {
      this.playback = options.playback;
    }

    this.buildDOM();
    //this.config.ggbApplet.appletOnLoad = this.appletOnLoad;

    if (!this.playback) {
      //this.setAns();
    } else {
      this.state = {
        next: this.answer[0].event,

        current: 0,
        forward: () => {
          let action = this.state.next,
            index = this.state.current;
          this.state.current = (this.state.current + 1) % this.answer.length;
          this.state.next = this.answer[this.state.current].event;

          return { action: action, index: index };
        }
      };
    }

    this.runscript();
  }

  replay_svg(arg) {
    let logg = "";
    let svg_obj;
    let xx = "";
    let yy = "";
    logg = this.answer[arg];

    switch (logg.event) {
      case "move":
        //let mem = svg.members;

        if (typeof logg.x === "object") {
          //console.log(svg_obj.node.id + " ; value: " + logg.x[i] + 100);
          //var handle = setInterval(function() {
          /* for (let i = 0; i <= logg.x.length; i++) {
              svg_obj = SVG().select("#" + logg.obj).members[0];
              //svg_obj
              if (svg_obj.node.id == logg.obj) {
                
                
                var handle = setTimeout(function(to) { 
                  console.log("timer på t sekund starter");
                  svg_obj.x(logg.x[i]);
                  svg_obj.y(logg.y[i]);
                  //clearInterval(handle);
                 }, 3000, i)
              }
            } */

          svg_obj = SVG().select("#" + logg.obj).members[0];
          let posis = logg.x; //[1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
          let posis_y = logg.y;
          let interval = 100; //one second
          logg.x.forEach((pos, index) => {
            setTimeout(() => {
              console.log(pos + " and" + logg.y[index]);
              svg_obj.x(pos);
              svg_obj.y(logg.y[index]);
            }, index * interval);
          });

          //handle = 0;
          //}, 4000); //msek
          //if (i == logg.x.length - 1) {
          //clearInterval(it);
          //}

          //svg_obj.x(logg.y[i]) + " and " + svg_obj.y(logg.y[i])
          //);

          //svg_obj.x(logg.x[i]);
          //svg_obj.y(logg.y[i]);

          //for(let svgobj of svg_objs) {
          //if(svgobj == logg.obj) {

          //}

          //let xval = logg.x[i];
          //let yval = logg.y[i];

          //clearInterval(handle);
        }
        //xx = typeof logg.x === "object" ? logg.x[logg.x.length - 1] : logg.x;
        //yy = typeof logg.y === "object" ? logg.y[logg.y.length - 1] : logg.y;
        //this.api.evalCommand(logg.objectName + '= (' + xx + ', ' + yy + ')')

        break;
    }
  }

  buildDOM() {
    if (this.playback) this.buildPlayback();
    //else this.buildMenu();

    let parent = document.getElementById(this.divElementId);
    //parent.setAttribute("height", `${this.config.ggbApplet.height}px`);
    let ggb = document.createElement("div");
    //ggb.classList.add("widget-box");
    //ggb.id = this.ggbId;

    parent.append(ggb);
  }

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
          let { action, index } = this.state.forward();
          if (index == this.answer.length - 1) toggle = true;
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
    divEl.appendChild(menuDivElement);
  }

  runscript() {
    // TODO: Handle case when answer is provided from backend, atm just console log...
    if (this.answer.length) {
      console.log("DEBUG: got answer:", this.answer);
    }

    // runscript(
    //   parseSVG = svgResp =>
    //     audioEl.play()
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

    var parseSVG = svgResp => {
      //laster svg-bilde
      let tmp = svgResp;
      var parser = new DOMParser();
      var doc = parser.parseFromString(tmp, "image/svg+xml");
      doc.querySelector("svg").setAttribute("width", this.width_svg);
      doc.querySelector("svg").setAttribute("height", this.height_svg);
      window.svgdoc = doc;
      var oSerializer = new XMLSerializer();
      var sXML = oSerializer.serializeToString(doc);
      var svgimage = this.svgelement.svg(sXML); // put loaded file on SVG document
      //window.test = svgimage;
      this.targets = SVG.select(".target");

      //gå gjennom alle objekt som har klasser knyttet til seg. Finne initiell x og y posisjon (state)

      //lagrer "this" (widgets overordnede variabler) til "widgetThis", så de er tilgjengelige inne i funksjoner
      let widgetThis = this;

      //henter svg toppnode til tweenlite touch action
      var imid = svgimage.node.id;
      TweenLite.set("#" + imid, {
        touchAction: "manipulation"
      });

      //***************************
      //Snakker ved lasting av side
      //***************************
      this.audioEl.src = this.config.mp3BaseUrl + this.getFileNumstr() + ".m4a";
      this.audioEl.play().catch(e => console.warn(e));

      /************** */
      //KLIKK-EVENTS
      /************** */

      //*************************************************************
      //TRYKK PÅ NESTE-KNAPP
      //*************************************************************
      SVG.select(".next").on("click", event => {
        //***************************
        //Snakker ved trykk neste knapp
        //***************************
        this.onAnswer(this.answer);

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

          //selve lydfilnavnet
          this.audioEl.src =
            this.config.mp3BaseUrl +
            this.getFileNumstr() +
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
          memb[i].classList.toggle("framed", false);
          memb[i].classList.toggle("unframed", false);
        }
        event.currentTarget.classList.toggle("framed", true);
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
        //setter bounds til å dekke alt (none svg'er med rare startverdier)
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
          let len = widgetThis.answer.length;
          let lastX = event.x[event.x.length - 1],
            lastY = event.y[event.y.length - 1];
          if (
            len == 1 ||
            this.x - lastX > terskel ||
            this.x - lastX < -terskel ||
            this.y - lastY > terskel ||
            this.y - lastY < -terskel
          ) {
            event.x.push(this.x);
            event.y.push(this.y);
            event.time.push(Date.now());
          }
        },

        onDragEnd: function(e) {
          event.x.push(this.x);
          event.y.push(this.y);
          event.time.push(Date.now());
          widgetThis.updateAnswer(event);

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

              //***************************
              //Snakker ved treff av target
              //***************************
              widgetThis.audioEl.src =
                widgetThis.config.mp3BaseUrl +
                widgetThis.getFileNumstr() +
                "hit.m4a";
              widgetThis.audioEl.play().catch(e => console.warn(e));
            }
          }
        }
      });
    };

    fetch(this.config.svgUrl, {
      method: "GET",
      mode: "no-cors"
    })
      .then(resp => resp.text())
      .then(svg => {
        parseSVG(svg);
      });
  }

  //Oppdaterer med hendelse
  updateAnswer(newAnswer) {
    this.answer.push(newAnswer);
    this.onAnswer(this.answer);
  }

  //logger pos x|y, obj, val, ev_type, etc
  //para ev_type, eventobj (x|y verdi), objekt, widget (for variabler)
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
    return this.config.svgUrl.substr(this.config.svgUrl.search("[0-9]{3}"), 3);
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

  links: ["/widgets/css/matteWidget.css"],

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
