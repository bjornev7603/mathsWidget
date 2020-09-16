class LottieWidget {
  constructor(divElementId, config, answer = null, onAnswer, options = null) {
    this.lottieDiv = this.setup(divElementId);

    const default_config = {
      LottieUrl: null,
    };
    this.config = {
      ...default_config,
      ...config,
    };

    this.params = {
      container: this.lottieDiv,
      renderer: "svg",
      loop: false,
      autoplay: true,
    };

    //this.anim = lottie.loadAnimation(this.params);

    fetch(this.config.LottieUrl, {
      method: "GET",
      mode: "no-cors",
    })
      .then((resp) => resp.text())
      .then((lott) => {
        var lottien = JSON.parse(lott);
        this.params = { ...this.params, ...lottien.input[0] };
        this.anim = lottie.loadAnimation(this.params);
      });
  }
  setup(elid) {
    const el = document.getElementById(elid);
    const rootCSS = `background-color:#fff;
                  margin: 0px;
                  /*height: 100%;*/
                  overflow: hidden;`;

    const lottieCSS = `background-color:#fff;
    /*width:100%;
    height:100%;*/
    display:block;
    overflow: hidden;
    transform: translate3d(0,0,0);
    text-align: center;
    opacity: 1;`;
    el.style = rootCSS;

    const lottie = document.createElement("div");
    lottie.style = lottieCSS;
    el.appendChild(lottie);
    return lottie;
  }
}

var lottieWidget2 = {
  scripts: [
    "https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.6.10/lottie.min.js",
  ],
  links: [],
  widgetClass: LottieWidget,
  contributesAnswer: false,
  jsonSchema: {
    title: "Lottie SVG animation widget",
    description: "Widget that playsback SVG animations with lottie.js",
    type: "object",
    properties: {
      /* animationData: {
        type: "object",
        title: "animationData",
        description: "Animation data for playback (see lottie.js)",
      }, */
      LottieUrl: {
        type: "string",
        title: "animationData",
        //,
        /* description: "Animation data for Lottie (see lottie.js)", */
      },
      loop: {
        type: "boolean",
        title: "loop",
        description: "Boolean for loop (defaults to true)",
      },
      autoplay: {
        type: "boolean",
        title: "autoplay",
        description: "Boolean for autoplay (defaults to true)",
      },
    },
  },
  // prettier-ignore
  /* jsonSchemaData: {
    "animationData": {},
    "loop": true,
    "autoplay": true
  },
  // prettier-ignore
  configStructure: {
    "animationData": {},
    "loop": true,
    "autoplay": true
  }
}; */

  jsonSchemaData: {
  "LottieUrl": "Url of file containing json data",
  "loop": true,
  "autoplay": true
},
  // prettier-ignore
  configStructure: {
  "LottieUrl": "Url of file containing json data",
  "loop": true,
  "autoplay": true
}
};
