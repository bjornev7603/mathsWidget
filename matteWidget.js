// Bygger et arrayobjekt som tar vare på hvert dra-objekts
// posisjon, tidsbruk og målet det evt. traff.

export default class SVGNumbersWidget {
  constructor( divElementId, config, answer = null, onAnswer ) {
    this.divElementId = divElementId

    document.getElementById( this.divElementId ).style.height = '100%'; // h +"px"


    config = {svg_url: '....'}
     let default_config = {
      svg_url: "streng",
      mp3_base_url: "mappe hvor mp3'er er",
      viewBox: {
        x: 1024,
        y: 768
      }
      // orientation: 'landscape'
    }

    configStructure = {
      ...default_config,
      ...config
    }
    this.answer = answer || []
    this.onAnswer = onAnswer

    this.runscript()    
  }

  runscript() {
    // reomve nav bar at bottom
    customNav.init()

    // Get already created <div> element.


    let divElement = document.getElementById( this.divElementId )
    let inputElement = document.createElement( "input" )
    inputElement.type = this.config.inputType || "number"

    // Add event listener, to update answer.
    inputElement.onchange = event => {
      this.updateAnswer( event.target.value )
    }

    // Set existing answer, if it exists.
    if ( this.answer ) {
      inputElement.value = this.answer
    }

    // Add created <input> element to existing <div> element.
    divElement.appendChild( inputElement )

    //initierer array i answer
    const event = {
      x: 0,
      y: 0,
      obj: "emp",
      val: "emp",
      event: null,
      tim: Date.now(),
      tdiff: 0,
      hit: null
    }
    this.updateAnswer( event )

    var countdown_msec = 10000 //1000 = sekund
    var timeout_msec = 3000

    var xdim = "100%",
        ydim = "100%"
  
    var figuren = SVG( this.divElementId ).size( xdim, ydim )
    figuren.viewbox( 0, 0, this.config.viewBox.x, this.config.viewBox.y );

    //responsive voice logo
    // if ( svg_navn.includes( "000" ) ) {
    //   document.getElementById( 'logo' ).style.display = "block"
    // }

    //hente svg bildeobjekt
    var ajax = new XMLHttpRequest()    
    ajax.open( "GET", this.config.svg_url, true )
    ajax.send()

    ajax.onload = e => {
      //laster svg-bilde
      let tmp = ajax.responseText
      var parser = new DOMParser()
      var doc = parser.parseFromString( tmp, "image/svg+xml" )
      window.svgdoc = doc

      //lagrer "this" (widgets overordnede variabler) til "that", så de er tilgjengelige inne i funksjoner
      var that = this
      
      doc.querySelector( "svg" ).setAttribute( "width", "90%" )
      doc.querySelector( "svg" ).setAttribute( "height", "85%" )
     
      var oSerializer = new XMLSerializer()
      var sXML = oSerializer.serializeToString( doc )
      var svgimage = figuren.svg( sXML ) // put loaded file on SVG document

      window.test = svgimage
      var targ1 = SVG.select( ".target" )      
      var src1 = SVG.select( ".source" )

      //HVIS R VOICE SKAL BRUKES, FJERN UTKOMMENTERING
      //Leser spørsmåltekst høyt
      //var sel_que = SVG.select(".question").members  
      var sel_que = SVG.select( ".speak" ).members
      var readtext = sel_que.length != 0 && sel_que[ 0 ].node.getAttribute( 'speech' ) != null ? sel_que[ 0 ].node.getAttribute( 'speech' ).trim() : ""
      //Snakker ved lasting av side, 
      //trenger brukerhandling for å unngå melding (deny/allow), så fjerner midl
      /* responsiveVoice.speak(readtext, "Norwegian Female", {
        pitch: 0.8,
        rate: 1
      })       */

      var imid = svgimage.node.id            
      //TweenLite.set("#"+imid, { touchAction: "pan-x"});
      TweenLite.set( "#" + imid, {
        touchAction: "manipulation"
      } )
      //TweenLite.onchange(event)

      //brukes i "sub_dra" oppgave
      SVG.select( '.click_start_tallrekker' ).on( 'click', event => {
          //Leser spørsmåltekst høyt
          var sel_que = SVG.select( ".speak" ).members
          var readtext = event.currentTarget != null ? event.currentTarget.getAttribute( 'speech' ).trim() : ""
          /* responsiveVoice.speak( readtext, "Norwegian Female", {
            pitch: 0.8,
            rate: 1.1
          } ) */

          //tre ormefigurer i Figurtall
          var svg_showfigures1 = SVG.select( ".show1" ).members
          var svg_showfigures2 = SVG.select( ".show2" ).members
          var svg_showfigures3 = SVG.select( ".show3" ).members
          var x = 0

          mintimer = setTimeout( function () {
            ;
            [ ...svg_showfigures1 ].forEach( node => {
              node.node.style.display = ""
            } )
          }, timeout_msec )

          mintimer = setTimeout( function () {
            ;
            [ ...svg_showfigures2 ].forEach( node => {
              node.node.style.display = ""
            } )
          }, timeout_msec * 2 )

          mintimer = setTimeout( function () {
            ;
            [ ...svg_showfigures3 ].forEach( node => {
              node.node.style.display = ""
            } )
          }, timeout_msec * 3 )          
        } ),


        //*************************************************************
        //TRYKK PÅ NESTE-KNAPP
        //*************************************************************
        SVG.select( '.next' ).on( 'click', event => {

          customNav.next()

          //Leser spørsmåltekst høyt
          /* var sel_que = (SVG.select(".speak")!=null)? SVG.select(".speak").members: ""
          var readtext = event.currentTarget != null ? event.currentTarget.getAttribute('speech').trim() : ""       
          responsiveVoice.speak(readtext, "Norwegian Female", {
            pitch: 0.8,
            rate: 1.1
          }) */

          //trykker på nesteknapp i matistikk rammeverket          
          document.getElementById( 'setBtn' ).onclick = setAns          
        } )
      //************************************************************* 



      //brukes i subitize_dra
      //teller ned fra x sekund (synlig nedtelling og brikker som forsvinner etter x sek's nedtelling )
      //Kan flytte nedtelling til onDragStart hvis nedtelling skal starte når brikkene røres
      SVG.select( '.start_timer' ).on( 'click', event => {
          //henter element av klassen fade, dette settes med full opasitet - synlig
          var fades = SVG.select( ".fade" ).members
          for ( var i = 0; i < fades.length; i++ ) {
            SVG.select( ".fade" ).members[ i ].node.style.opacity = 1;
          }

          var timers = SVG.select(".start_timer").members
          for(var i=0;i<timers.length;i++) {        
            countdown_msec = 
            (timers[i].node.attributes['countdown_sec'] != null)?
              timers[i].node.attributes['countdown_sec'].value * 1000: 
              countdown_msec                            
          }

          //gjør prikker synlige i timerens x antall sek, ved å skifte css klasse
          var svg_pricks = SVG.select( ".disappear" ).members
          for ( var i = 0; i < svg_pricks.length; i++ ) {
            svg_pricks[ i ].node.classList.toggle( 'disappear', false );
            svg_pricks[ i ].node.classList.toggle( 're-appear', true );
          }

          var countDownDate = new Date().getTime() + countdown_msec
          var x = setInterval( function () {
            var now = new Date().getTime()
            // Find the distance between now and the count down date
            var distance = countDownDate - now

            // Time calculations for days, hours, minutes and seconds                            
            let seconds = Math.floor( ( distance % ( 1000 * 60 ) ) / 1000 )            
            //document.getElementById("klokke").innerHTML = seconds + "s "

            //fader ut objekt ved å endre opasitet vha nedtelling          
            for ( var i = 0; i < fades.length; i++ ) {
              var fadeto = ( fades[ i ].node.classList.contains( 'start_timer' ) ) ? 0.5 : 0.33
              fades[ i ].node.style.opacity = 1 - ( ( 1 - fadeto ) / ( seconds + 1 ) );
            }            
            if ( distance < 0 ) {
              clearInterval( x )
              //document.getElementById("klokke").innerHTML = "Tida er ute"
            }
          }, 500 ) //msek

          //Etter noen sekund forsvinner brikkeprikkene (blir hvite)
          mintimer = setTimeout( function () {
            var svg_pricks = SVG.select( ".re-appear" ).members
            for ( var i = 0; i < svg_pricks.length; i++ ) {
              svg_pricks[ i ].node.classList.toggle( 'disappear', true );
              svg_pricks[ i ].node.classList.toggle( 're-appear', false );
            }
            clearTimeout( mintimer )
          }, countdown_msec )

          //Leser spørsmåltekst høyt
          /* var sel_que = SVG.select("#speech_on_click").members
          var readtext = sel_que.length != 0 ? sel_que[0].node.textContent.trim() : ""      
          responsiveVoice.speak(readtext, "Norwegian Female", {
            pitch: 0.8,
            rate: 1
          }) */
        } ),

        //snakke
        SVG.select( '.speak' ).on( 'click', event => {

          //henter mp3 fil fra en katalog, navnet på mp3 samsvarer med navn på oppgavefil ( uten .svg) - scvg_url minus banen
          //readMp3File(this.config.mp3_base_url + this.config.svg_url.substring(4,5))          

          var readtext = event.currentTarget != null ? event.currentTarget.getAttribute( 'speech' ).trim() : ""
          /* responsiveVoice.speak( readtext, "Norwegian Female", {
            pitch: 0.8,
            rate: 1
          } ) */
        } ),


        //****************************************** 
        //KLIKK HENDELSER     

        //Klikk på tall i Tallrekker1
        SVG.select( '.select' ).on( 'click', event => {
          var memb = document.getElementsByClassName( 'select' );
          for ( var i = 0; i < memb.length; i++ ) {
            memb[ i ].classList.toggle( 'framed', false );
            memb[ i ].classList.toggle( 'unframed', false );
          }
          event.currentTarget.classList.toggle( 'framed', true );

          let sel_obj = event.currentTarget
          let selval = event.currentTarget.attributes[ 'selectvalue' ]

          const eventen = {
            x: event.x,
            y: event.y,
            obj: ( sel_obj == null ) ? "emp" : sel_obj.id,
            val: ( selval == null ) ? "emp" : selval.value,

            event: "click",
            tim: Date.now(),
            tdiff: ( Date.now() - this.answer[ this.answer.length - 1 ].tim ) / 1000,
            hit: null
          }
          this.updateAnswer( eventen )
        } ),


        //TRYKK PÅ TALL FÅR FRAM VISUELLE TALLBRIKKER
        SVG.select( '.click_visuelletall' ).on( 'click', event => {
          var alle_brikker = SVG.select( ".brikker" ).members;
          [ ...alle_brikker ].forEach( node => {
            node.node.style.display = "none"
          } )
          var mitt_aktuelle_tall = event.currentTarget.id.split( "_" )[ 1 ]
          var aktuell_brikke = SVG.select( "#brik" + mitt_aktuelle_tall ).members[ 0 ]
          aktuell_brikke.node.style.display = ""
        } ),


        //SKRIV INN TALL
        SVG.select( '.writenumber' ).on( 'click', event => {
          var ttt = event.currentTarget.innerHTML = "<div contenteditable='true'><text>Innhold</text></div>"          
          //aktuell_brikke.node.style.display = ""        
        } ),
        //***************************************

        Draggable.create( ".source", {
          //setter bounds til å dekke alt (none svg'er med rare startverdier)
          bounds: {
            minX: -4000,
            maxX: 1024,
            minY: -4005,
            maxY: 1024
          ,          

          onDragLeave: function () {
            //this.update();
          },

          onDragStart: function ( e ) {},

          onDrag: function ( evt ) {            
            //console.log( `x: ${this.x}, y: ${this.y}` )
            var terskel = 4
            let len = that.answer.length
            if (
              len == 1 ||
              this.x - that.answer[ len - 1 ].x > terskel ||
              this.x - that.answer[ len - 1 ].x < -terskel ||
              this.y - that.answer[ len - 1 ].y > terskel ||
              this.y - that.answer[ len - 1 ].y < -terskel
            ) {

              let sel_obj = this.target
              let selval = this.target.attributes[ 'selectvalue' ]

              const event = {
                x: this.x,
                y: this.y,
                obj: ( sel_obj == null ) ? "emp" : sel_obj.id,
                val: ( selval == null ) ? "emp" : selval.value,
                event: "move",
                tim: Date.now(),
                tdiff: ( Date.now() - that.answer[ that.answer.length - 1 ].tim ) / 1000,
                hit: null
              }
              that.updateAnswer( event )
              //console.log(this.target.id,'ny x og y -posisjon', cc[length].x, ' ', cc[length].y);            
            }
            // console.log(this);
            // console.log(`pointer (x,y) = (${e.x},${e.y})`)
            // console.log(`object (x,y) = (${this.x},${this.y})`)
          },

          onDragEnd: function () {
            
            this.target.style.width = ""
            this.target.style.height = ""

            var i = targ1.members.length
            console.log(
              this.target.id,
              "ny x-posisjon" + that.x,
              " ny y-posisjon" + that.y,
              " x og y: ",
              that.answer[ that.answer.length - 1 ]
            )
            while ( --i > -1 ) {
              if ( this.hitTest( targ1.members[ i ].node ) ) {
                //skriver info om posisjon, tidspkt og target_id for treff av target

                let selval = this.target.attributes[ 'selectvalue' ]

                const event = {
                  x: this.x,
                  y: this.y,
                  obj: ( this.target == null ) ? "emp" : this.target.id,
                  val: ( selval == null ) ? "emp" : selval.value,
                  event: "hit",
                  tim: Date.now(),
                  tdiff: ( Date.now() - that.answer[ that.answer.length - 1 ].tim ) / 1000,
                  hit: targ1.members[ i ].node.id
                }
                that.updateAnswer( event )

                var pos = targ1.members[ i ].bbox()
                var t = pos.x2 * 0.97 + " " + pos.cy * 0.95
                //console.log(t)

                //ser om klassen disappear finnes i src svg-objekt
                var disappear =
                  targ1.members[ 0 ].node.classList.contains( 'eat' ) ? true : false
                if ( disappear ) {
                  TweenLite.to( this.target, 0.01, {
                    opacity: 0,
                    scale: 0,
                    svgOrigin: t
                  } )
                } else {
                  //console.log( "Target skal ikke sluke objekt" )
                }
                //targ1.members[ i ].addClass( "highlight" )

                //Leser spørsmåltekst høyt              
                var sel_que = SVG.select( ".speak_when_hit" ).members
                var readtext = sel_que.length != 0 && sel_que[ 0 ].node.getAttribute( 'speech' ) != null ? sel_que[ 0 ].node.getAttribute( 'speech' ).trim() : ""
                /* responsiveVoice.speak( readtext, "Norwegian Male", {
                  pitch: 0.8,
                  rate: 1
                } ) */
                
              } else {
                //skriver info om posisjon, tidspkt og target_id for treff av target

                //sjekker om attributtet selectvalue er satt i svg, denne innehlder "fasit" i flervalg
                let selval = this.target.attributes[ 'selectvalue' ]

                const event = {
                  x: this.x,
                  y: this.y,
                  obj: ( this.target == null ) ? "emp" : this.target.id,
                  val: ( selval == null ) ? "emp" : selval.value,
                  event: "dragend",
                  tim: Date.now(),
                  tdiff: ( Date.now() - that.answer[ that.answer.length - 1 ].tim ) / 1000,
                  hit: ""
                }
                that.updateAnswer( event )                
              }
            }
          }
        } )
    }
  }

  //Oppdaterer med hendelse
  updateAnswer( newAnswer ) {
    // this.answer = newAnswer
    this.answer.push( newAnswer )
    this.onAnswer( this.answer )
  }


}

var matteWidget = {
  /**
   * External scripts the widget is dependent on, e.g., a cdn with JQuery.
   * This ensures that all dependencies are loaded only once per test.
   */
  scripts: [
   "/libs/nav/customNav.js",
   "https://cdnjs.cloudflare.com/ajax/libs/svg.js/2.6.6/svg.min.js",
   "https://cdnjs.cloudflare.com/ajax/libs/gsap/2.1.3/plugins/CSSPlugin.min.js",
   "https://cdnjs.cloudflare.com/ajax/libs/gsap/2.1.3/TweenLite.min.js",
   "https://cdnjs.cloudflare.com/ajax/libs/gsap/2.1.3/utils/Draggable.min.js"
  ],

  /**
   * Import CSS-libraries to use. Be careful with this, since CSS is global
   * and might override classes/tags outside the widget as well.
   */
  links: ["/widgets/css/index.css"],

  /**
   * Class responsible for setting up/running widget.
   */
  widgetClass: matteWidget,

  /**
   * Boolean value telling if the widget is supposed to have any output
   * in the form of an answer from the user.
   */
  contributesAnswer: true,

  /**
   * JSON Shcema defining how the config object should look like.
   * For more information, visit:
   * https://mozilla-services.github.io/react-jsonschema-form/
   */
  jsonSchema: {
    title: "Input widget",
    description: "Denne widgeten inneholder drag - og dropbare objekt",
    type: "object",
    properties: {
      mathApplet: {
        type: "object",
        title: "mathApplet"
      },
      vars: {
        type: "array",
        title: "Variables",
        description: "Variables for feedback checking"
      },
      feedback: {
        type: "object",
        properties: {
          parameters: {
            type: "object",
            title: "Parameters",
            description: "Parameters for feedback module"
          },
          default: {
            type: "string",
            title: "defaultFB",
            description: "fallback feedback if no condition is true"
          },
          feedbacks: {
            type: "array",
            title: "feedbacks",
            description: "Array of arrays for feedback (1-1 correspondance with conditions)"
          },
          conditions: {
            type: "array",
            title: "conditions",
            description: "Array of conditions to check which feedback to give (1-1 correspondance with feedbacks)"
          }
        }
      }
    }
  },

  configStructure: {
    //inputType: 'number'    
    svg_url: 'streng',
    mp3_base_url: 'string',
    viewBox: {
      x: 'number',
      y: 'number'
    }
  }
}