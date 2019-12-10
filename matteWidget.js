// Bygger et arrayobjekt som tar vare på hvert dra-objekts
// posisjon, tidsbruk og målet det evt. traff.

export default class MatteWidget {
  // class MatteWidget {
  constructor( divElementId, config, answer = null, onAnswer ) {
    this.divElementId = divElementId;
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
    this.timerInvoked = false;
    this.runscript();
  }

  runscript() {
    // reomve nav bar at bottom
    customNav.init();
    document.getElementById( this.divElementId ).classList.add( "matte-widget" );

    // TODO: Handle case when answer is provided from backend, atm just console log...
    if ( this.answer.length ) {
      console.log( "DEBUG: got answer:", this.answer );
    }



    var countdown_msec = 10000; //1000 = sekund
    var timeout_msec = 3000;
    var xdim = "100%";
    var ydim = "100%";

    var figuren = SVG( this.divElementId ).size( xdim, ydim );
    figuren.viewbox( 0, 0, this.config.viewBox.x, this.config.viewBox.y );

    var parseSVG = svgResp => {
      //laster svg-bilde
      // let tmp = ajax.responseText
      //console.log(svgResp)
      let tmp = svgResp;
      var parser = new DOMParser();
      var doc = parser.parseFromString( tmp, "image/svg+xml" );
      window.svgdoc = doc;

      //lagrer "this" (widgets overordnede variabler) til "that", så de er tilgjengelige inne i funksjoner
      var that = this;

      doc.querySelector( "svg" ).setAttribute( "width", "100%" );
      doc.querySelector( "svg" ).setAttribute( "height", "100%" );

      var oSerializer = new XMLSerializer();
      var sXML = oSerializer.serializeToString( doc );
      var svgimage = figuren.svg( sXML ); // put loaded file on SVG document

      window.test = svgimage;
      var targ1 = SVG.select( ".eat" );
      var src1 = SVG.select( ".source" );

      //Leser spørsmåltekst høyt

      //***************************
      //Snakker ved lasting av side
      //***************************
      let num_in_url = this.config.svgUrl.substr(
        this.config.svgUrl.search( "[0-9]{3}" ),
        3
      );
      this.audioEl.src = this.config.mp3BaseUrl + num_in_url + "speak" + ".m4a";
      this.audioEl.play().catch( e => console.warn( e ) );

      var imid = svgimage.node.id;
      TweenLite.set( "#" + imid, {
        touchAction: "manipulation"
      } );

      //brukes i "sub_dra" oppgave
      SVG.select( ".click_start_tallrekker" ).on( "click", event => {
        //Leser spørsmåltekst høyt
        var sel_que = SVG.select( ".speak" ).members;
        var readtext =
          event.currentTarget != null ?
          event.currentTarget.getAttribute( "speech" ).trim() :
          "";

        //tre ormefigurer i Figurtall
        var svg_showfigures1 = SVG.select( ".show1" ).members;
        var svg_showfigures2 = SVG.select( ".show2" ).members;
        var svg_showfigures3 = SVG.select( ".show3" ).members;
        var x = 0;

        let mintimer = setTimeout( function () {
          [ ...svg_showfigures1 ].forEach( node => {
            node.node.style.display = "";
          } );
        }, timeout_msec );

        mintimer = setTimeout( function () {
          [ ...svg_showfigures2 ].forEach( node => {
            node.node.style.display = "";
          } );
        }, timeout_msec * 2 );

        mintimer = setTimeout( function () {
          [ ...svg_showfigures3 ].forEach( node => {
            node.node.style.display = "";
          } );
        }, timeout_msec * 3 );
      } );
      //*************************************************************
      //TRYKK PÅ NESTE-KNAPP
      //*************************************************************
      SVG.select( ".next" ).on( "click", event => {
        //***************************
        //Snakker ved trykk neste knapp
        //***************************
        if ( event.currentTarget.classList.contains( "speak" ) ) {
          let num_in_url = this.config.svgUrl.substr(
            this.config.svgUrl.search( "[0-9]{3}" ),
            3
          );

          this.audioEl.src =
            this.config.mp3BaseUrl + num_in_url + "speak" + "next.m4a";
          this.audioEl.play().catch( e => {
            console.warn( e );
            customNav.next();
          } );

          this.audioEl.onended = customNav.next;
        } else {
          customNav.next();
        }
      } );
      //*************************************************************

      //brukes i subitize_dra
      //teller ned fra x sekund (synlig nedtelling og brikker som forsvinner etter x sek's nedtelling )
      //Kan flytte nedtelling til onDragStart hvis nedtelling skal starte når brikkene røres
      SVG.select( ".start_timer" ).on( "click", event => {
        //hvis satt i svg felt "once" at timer ikke kan startes kan man bare trykke på timer-sol EN gang
        if (
          this.timerInvoked == false ||
          event.currentTarget.attributes[ "single_attempt" ] == null ||
          ( event.currentTarget.attributes[ "single_attempt" ] != null &&
            event.currentTarget.attributes[ "single_attempt" ].value.trim() !=
            "true" )
        ) {
          this.timerInvoked = true;

          //henter element av klassen fade, dette settes med full opasitet - synlig
          var fades = SVG.select( ".fade" ).members;
          for ( var i = 0; i < fades.length; i++ ) {
            SVG.select( ".fade" ).members[ i ].node.style.opacity = 1;
          }

          var timers = SVG.select( ".start_timer" ).members;
          for ( var i = 0; i < timers.length; i++ ) {
            countdown_msec =
              timers[ i ].node.attributes[ "countdown_sec" ] != null ?
              timers[ i ].node.attributes[ "countdown_sec" ].value * 1000 :
              countdown_msec;
          }

          //gjør prikker synlige i timerens x antall sek, ved å skifte css klasse
          var svg_pricks = SVG.select( ".disappear" ).members;
          for ( var i = 0; i < svg_pricks.length; i++ ) {
            svg_pricks[ i ].node.classList.toggle( "disappear", false );
            svg_pricks[ i ].node.classList.toggle( "re-appear", true );
          }

          var countDownDate = new Date().getTime() + countdown_msec;
          var x = setInterval( function () {
            var now = new Date().getTime();
            // Find the distance between now and the count down date
            var distance = countDownDate - now;

            // Time calculations for days, hours, minutes and seconds
            let seconds = Math.floor( ( distance % ( 1000 * 60 ) ) / 1000 );

            //fader ut objekt ved å endre opasitet vha nedtelling
            for ( var i = 0; i < fades.length; i++ ) {
              var fadeto = fades[ i ].node.classList.contains( "start_timer" ) ?
                0.5 :
                0.33;
              fades[ i ].node.style.opacity = 1 - ( 1 - fadeto ) / ( seconds + 1 );
            }
            if ( distance < 0 ) {
              clearInterval( x );
            }
          }, 500 ); //msek

          //Etter noen sekund forsvinner brikkeprikkene (blir hvite)
          let mintimer = setTimeout( function () {
            var svg_pricks = SVG.select( ".re-appear" ).members;
            for ( var i = 0; i < svg_pricks.length; i++ ) {
              svg_pricks[ i ].node.classList.toggle( "disappear", true );
              svg_pricks[ i ].node.classList.toggle( "re-appear", false );
            }
            clearTimeout( mintimer );
          }, countdown_msec );
        }
      } );

      //snakke
      SVG.select( ".speak" ).on( "click", event => {
        //henter mp3 fil fra en katalog, navn samsvarer med elementets klassenavn (eller flere)
        //*************************************
        //Snakker ved trykk ekorn eller på tall
        //*************************************
        if ( !event.currentTarget.classList.contains( "next" ) ) {
          //snakk på nesteknapp alleredehåntert i onnext

          let numstr_in_url;
          if ( event.currentTarget.attributes[ "selectvalue" ] ) {
            numstr_in_url = event.currentTarget.attributes[ "selectvalue" ].value;
            if (
              event.currentTarget.attributes[ "selectvalue" ].value.search(
                "[^0-9]+"
              )
            ) {
              numstr_in_url = event.currentTarget.attributes[
                  "selectvalue"
                ].value
                .substr( 0, 2 )
                .trim();
            }
          }

          let sel_str = event.currentTarget.classList.contains( "select" ) ?
            "select" + numstr_in_url :
            "";
          // src_el.src = this.config.mp3BaseUrl + "speak" + sel_str + .m4a";
          let num_in_url = this.config.svgUrl.substr(
            this.config.svgUrl.search( "[0-9]{3}" ),
            3
          );

          this.audioEl.src =
            this.config.mp3BaseUrl + num_in_url + "speak" + sel_str + ".m4a";
          this.audioEl.play().catch( e => console.warn( e ) );
        }
      } );
      //******************************************
      //KLIKK HENDELSER

      //Klikk på tall i Tallrekker1
      SVG.select( ".select" ).on( "click", event => {
        var memb = document.getElementsByClassName( "select" );
        for ( var i = 0; i < memb.length; i++ ) {
          memb[ i ].classList.toggle( "framed", false );
          memb[ i ].classList.toggle( "unframed", false );
        }
        event.currentTarget.classList.toggle( "framed", true );

        let sel_obj = event.currentTarget;
        let selval = event.currentTarget.attributes[ "selectvalue" ];

        const eventen = {
          x: event.x,
          y: event.y,
          obj: sel_obj == null ? "emp" : sel_obj.id,
          val: selval == null ? "emp" : selval.value,

          event: "click",
          time: Date.now(),
          tdiff: ( Date.now() - this.answer[ this.answer.length - 1 ].time ) / 1000,
          hit: null
        };
        this.updateAnswer( eventen );
      } );
      //TRYKK PÃ… TALL FÃ…R FRAM VISUELLE TALLBRIKKER
      SVG.select( ".click_visuelletall" ).on( "click", event => {
        var alle_brikker = SVG.select( ".brikker" ).members;
        [ ...alle_brikker ].forEach( node => {
          node.node.style.display = "none";
        } );
        var mitt_aktuelle_tall = event.currentTarget.id.split( "_" )[ 1 ];
        var aktuell_brikke = SVG.select( "#brik" + mitt_aktuelle_tall )
          .members[ 0 ];
        aktuell_brikke.node.style.display = "";
      } );
      //SKRIV INN TALL
      SVG.select( ".writenumber" ).on( "click", event => {
        var ttt = ( event.currentTarget.innerHTML =
          "<div contenteditable='true'><text>Innhold</text></div>" );
        //aktuell_brikke.node.style.display = ""
      } );
      //***************************************
      let widgetThis = this;
      let event
      Draggable.create( ".source", {
        //setter bounds til å dekke alt (none svg'er med rare startverdier)
        bounds: {
          minX: -4000,
          maxX: 1024,
          minY: -4005,
          maxY: 1024
        },

        onDragLeave: function () {
          //this.update();
        },

        onDragStart: function ( e ) {
          let sel_obj = this.target;
          let selval = this.target.attributes[ "selectvalue" ];
          event = {
            x: [ this.x ],
            y: [ this.y ],
            obj: sel_obj == null ? "emp" : sel_obj.id,
            val: selval == null ? "emp" : selval.value,
            event: "move",
            time: [ Date.now() ],
            hit: null
          };
        },

        onDrag: function ( evt ) {
          var terskel = 4;
          let len = that.answer.length;
          let lastX = event.x[ event.x.length - 1 ],
            lastY = event.y[ event.y.length - 1 ]
          if (
            len == 1 ||
            this.x - lastX > terskel ||
            this.x - lastX < -terskel ||
            this.y - lastY > terskel ||
            this.y - lastY < -terskel
          ) {
            event.x.push( this.x )
            event.y.push( this.y )
            event.time.push( Date.now() )
            // that.updateAnswer(event);
          }
        },

        onDragEnd: function () {
          event.x.push( this.x )
          event.y.push( this.y )
          event.time.push( Date.now() )
          that.updateAnswer( event )

          this.target.style.width = "";
          this.target.style.height = "";
          var i = targ1.members.length;
          while ( --i > -1 ) {
            if ( this.hitTest( targ1.members[ i ].node ) ) {
              //skriver info om posisjon, tidspkt og target_id for treff av target
              let selval = this.target.attributes[ "selectvalue" ];

              const hitEvent = {
                x: this.x,
                y: this.y,
                obj: this.target == null ? "emp" : this.target.id,
                val: selval == null ? "emp" : selval.value,
                event: "hit",
                time: Date.now(),
                tdiff: ( Date.now() - that.answer[ that.answer.length - 1 ].time ) /
                  1000,
                hit: targ1.members[ i ].node.id
              };
              that.updateAnswer( hitEvent );

              var pos = targ1.members[ i ].bbox();
              var t = pos.x2 * 0.97 + " " + pos.cy * 0.95;
              //console.log(t)

              //ser om klassen disappear finnes i src svg-objekt
              var disappear = targ1.members[ 0 ].node.classList.contains( "eat" ) ?
                true :
                false;
              if ( disappear ) {
                TweenLite.to( this.target, 0.1, {
                  opacity: 0,
                  scale: 0,
                  svgOrigin: t
                } );
              }

              //***************************
              //Snakker ved treff av target
              //***************************

              let num_in_url = widgetThis.config.svgUrl.substr(
                widgetThis.config.svgUrl.search( "[0-9]{3}" ),
                3
              );

              widgetThis.audioEl.src =
                widgetThis.config.mp3BaseUrl +
                num_in_url +
                "speak" +
                "whenhit.m4a";
              widgetThis.audioEl.play().catch( e => console.warn( e ) );
            }
            // else {
            //   //skriver info om posisjon, tidspkt og target_id for treff av target

            //   //sjekker om attributtet selectvalue er satt i svg, denne innehlder "fasit" i flervalg
            //   let selval = this.target.attributes[ "selectvalue" ];

            //   const event = {
            //     x: this.x,
            //     y: this.y,
            //     obj: this.target == null ? "emp" : this.target.id,
            //     val: selval == null ? "emp" : selval.value,
            //     event: "dragend",
            //     time: Date.now(),
            //     tdiff: ( Date.now() - that.answer[ that.answer.length - 1 ].time ) /
            //       1000,
            //     hit: ""
            //   };
            //   that.updateAnswer( event );
            // }
          }
        }
      } );
    };

    fetch( this.config.svgUrl, {
        method: "GET",
        mode: "no-cors"
      } )
      .then( resp => resp.text() )
      .then( svg => {
        //  console.log("response from fetch:", svg)
        parseSVG( svg );
      } );
  }

  //Oppdaterer med hendelse
  updateAnswer( newAnswer ) {
    this.answer.push( newAnswer );
    this.onAnswer( this.answer );
  }
}

var matteWidget = {
  scripts: [
    "/libs/nav/customNav.js",
    "https://cdnjs.cloudflare.com/ajax/libs/svg.js/2.6.6/svg.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/gsap/2.1.3/plugins/CSSPlugin.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/gsap/2.1.3/TweenLite.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/gsap/2.1.3/utils/Draggable.min.js"
  ],

  links: [ "/widgets/css/matteWidget.css" ],

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