//export default class MatteWidget {
class MatteWidget {
  constructor(divElementId, config, answer = null, onAnswer, options) {
    // DEBUG if playback
    /* console.log(
      options && options.playback
        ? "Widget in playback mode"
        : "Widget in standard mode"
    );

    // DEBUG if svg
    console.log(
      options && options.svg
        ? "Loaded svg from Main(test framework)"
        : "Widget loaded svg normally, without passing svg object in options"
    );

    this.divElementId = divElementId;

    const default_config = {
      svgUrl: null,
      mp3BaseUrl: null,
      viewBox: {
        x: 1600,
        y: 1200,
      },
    };
    this.config = {
      ...default_config,
      ...config,
    };
    this.answer = answer || [];
    this.onAnswer = onAnswer;
    this.audioEl = new Audio();
    this.timerInvoked = false; //brukes for å anslå om allerede trykket på timer-objekt

    this.svgfilename = null;

    this.instruction_already_spoken = false;

    //indicated if restarted from last event in playback. If restarted -> only reset_svg(), no replay
    this.restarted = true;

    this.view_endstate = false;

    this.index = 0;

    this.skip_to_start = "mdi-skip-backward";
    this.skip_to_end = "mdi-skip-forward";
    this.play_next = "mdi-play";
    this.play_previous = "mdi-rewind";

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

    this.svgimage = null;

    //if Ipad (ioS), additional dom elements is given CSS class,
    //because ioS does not allow styling of container elements

    //let css class always be framed
    this.selected_class = "framed";
    /* this.getOS() == "iOS" ? "framed_ios" : "framed"; */
    /*

    this.size_src_obj = 0; //reset size of object when replaying
    this.already_replay = false; //checks if new replay
    this.x_offset = [];
    this.y_offset = [];
    this.init_mx_a = [];
    this.init_mx_b = [];
    this.init_mx_c = [];
    this.init_mx_d = [];

    this.currTrg = null;

    customNav.init();
    document.getElementById(this.divElementId).classList.add("matte-widget");
    this.divContainer = document.getElementById("widget-container");

    const size = options.playback ? "100%" : "90%";
    this.svgelement = SVG(this.divElementId).size("85%", "85%");

    this.svgelement.viewbox(0, 0, this.config.viewBox.x, this.config.viewBox.y);

    if (screenfull.isEnabled) {
      screenfull.request();
    }
    this.width_svg = size;
    this.height_svg = size;
    this.targets;
    this.countdown_msec = 10000;
    this.timeout_msec = 3000;

    this.diff_level = 1;
    if (window.diff_level == undefined) {
      window.diff_level = this.diff_level;
    } else {
      this.diff_level = window.diff_level;
    }

    this.ran_0_2 = this.getRandomInt(0, 3);

    this.vars = {};

    this.answer = answer || [];

    this.buildDOM();

    if (options.playback) {
      this.playback = options.playback;
      this.initPlayback();
    }

    //
    if (this.svg == null || this.svg == 1) {
      fetch(this.svg == null ? this.config.svgUrl : this.svg, {
        /* fetch(
              this.svg == null
                ? this.config.svgdir + this.get_task_from_level(this.diff_level)
                : this.svg,
              { */
    /*
        method: "GET",
        mode: "no-cors",
      })
        .then((resp) => resp.text())
        .then((svgl) => {
          this.parseSVG(svgl);
        })
        .then((pm) => {
          this.getSVGinfo();
          this.runscript();
        });
    } else {
      this.parseSVG(this.svg);
      this.getSVGinfo();
      this.runscript();
    } */
    //SVG event handlers
  }
}

var matteWidget = {
  scripts: [
    "/libs/nav/customNav.js",
    "/libs/screenfull/screenfull.js",
    "https://cdnjs.cloudflare.com/ajax/libs/svg.js/2.6.6/svg.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/gsap/2.1.3/plugins/CSSPlugin.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/gsap/2.1.3/TweenLite.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/gsap/2.1.3/utils/Draggable.min.js",
  ],

  links: [
    "/widgets/css/matteWidget.css",
    "https://cdn.materialdesignicons.com/4.7.95/css/materialdesignicons.min.css",
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
        title: "URL for svg-file",
      },
      mp3BaseUrl: {
        type: "string",
        title: "URL for mp3-files",
      },
      viewBox: {
        type: "object",
        properties: {
          x: {
            type: "number",
            title: "viewbox x-value",
          },
          y: {
            type: "number",
            title: "viewbox y-value",
          },
        },
      },
    },
  },
  jsonSchemaData: {
    svgUrl: "url for svgs",
    mp3BaseUrl: "base url for mp3-files",
    viewBox: {
      x: 1600,
      y: 1200,
    },
  },
  configStructure: {
    svgUrl: "url for svgs",
    mp3BaseUrl: "base url for mp3-files",
    viewBox: {
      x: 1600,
      y: 1200,
    },
  },
};
