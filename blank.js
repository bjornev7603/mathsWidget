
// Bygger et arrayobjekt som tar vare på hvert dra-objekts
// posisjon, tidsbruk og målet det evt. traff.

/** enableShiftDragZoom
 * widget
 * |-initDOM Render widget to DOM
 * |-intiSVG load svg and append functionality (loop through predef classes with ass. handlers)
 * 
 */
// var SVGclasses = {
//   "task_done":{event: 'click', handler:(event)=>{console.log('hello world')}},
//   "click_riktigantall": this.handleClickriktig,

// }

// Object.entries(obj).forEach(
//   ([key, value]) => SVG.select(key).on(value.event, value.handler)
// );
//export default 
console.log("widget file loaded in browser")
class MatteWidget {
  constructor( divElementId, config, answer = null, onAnswer ) {

    console.log('Hello world')

    this.divElementId = divElementId



     document.getElementById( this.divElementId ).style.height = '100%'; // h +"px"


    //config = {svg_url: '....'}
    let default_config = {
      svg_url: "streng",
      mp3_base_url: "mappe hvor mp3'er er...",
      viewBox: {
        x: 1024,
        y: 768
      }
      // orientation: 'landscape'
    }

    this.config = {
      ...default_config,
      ...config
    }
    this.answer = answer || []
    this.onAnswer = onAnswer

    this.runscript()

  }

  runscript() {
    // Get already created <div> element.
    console.log('widget starts')

//    let divElement = document.getElementById( this.divElementId )
//    let inputElement = document.createElement( "inputxxx" )
//    inputElement.type = this.config.inputType || "number"
//
//    // Add event listener, to update answer.
//    inputElement.onchange = event => {
//      this.updateAnswer( event.target.value )
//    }
//
//    // Set existing answer, if it exists.
//    if ( this.answer ) {
//      inputElement.value = this.answer
//    }

    // Add created <input> element to existing <div> element.
    // divElement.appendChild( inputElement )

    //initierer array i answer
    const event = {
      x: 0,
      y: 0,
      obj: "emp",
      val: "emp",
      event: null,
      time: Date.now(),
      tdiff: 0,
      hit: null
    }
    this.updateAnswer( event )


    var countdown_msec = 12000 //1000 = sekund
    var timeout_msec = 3000

    var xdim = "100%",
      ydim = "100%"
    var figuren = SVG( this.divElementId ).size( xdim, ydim )
    figuren.viewbox( 0, 0, this.config.viewBox.x, this.config.viewBox.y );

    //hente svg bildeobjekt
    var ajax = new XMLHttpRequest()
    //.toLowerCase()
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

      // let h = doc.querySelector('svg').height.baseVal.value
      doc.querySelector( "svg" ).setAttribute( "width", "90%" )
      doc.querySelector( "svg" ).setAttribute( "height", "85%" )
	    
      var oSerializer = new XMLSerializer()
      var sXML = oSerializer.serializeToString( doc )
      var svgimage = figuren.svg( sXML ) // put loaded file on SVG document

      window.test = svgimage
      var targ1 = SVG.select( ".target" )
      //var spesifikk_targ1 = SVG.select('#target_1');
      var src1 = SVG.select( ".source" )

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
      console.log( imid )
      // WEIRD BEHAVIOR!!! I think only a problem on Chrome..
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
          responsiveVoice.speak( readtext, "Norwegian Female", {
            pitch: 0.8,
            rate: 1.1
          } )

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

          customNAV.next()

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

            // Display the result in the element with id="demo"
            //document.getElementById("klokke").innerHTML = seconds + "s "

            //fader ut objekt ved å endre opasitet vha nedtelling          
            for ( var i = 0; i < fades.length; i++ ) {
              var fadeto = ( fades[ i ].node.classList.contains( 'start_timer' ) ) ? 0.5 : 0.33
              fades[ i ].node.style.opacity = 1 - ( ( 1 - fadeto ) / ( seconds + 1 ) );
            }


            // If the count down is finished, write some text
            if ( distance < 0 ) {
              clearInterval( x )
              //document.getElementById("klokke").innerHTML = "Tida er ute"
            }
          }, 1000 ) //msek

          //Etter noen sekund forsvinner brikkeprikkene (blir hvite)
          mintimer = setTimeout( function () {
            var svg_pricks = SVG.select( ".re-appear" ).members
            for ( var i = 0; i < svg_pricks.length; i++ ) {
              svg_pricks[ i ].node.classList.toggle( 'disappear', true );
              svg_pricks[ i ].node.classList.toggle( 're-appear', false );
            }

            clearTimeout( mintimer )
          }, countdown_msec )

        } ),


        //brukes i monkey, fotball
        SVG.select( '.speak' ).on( 'click', event => {
          var readtext = event.currentTarget != null ? event.currentTarget.getAttribute( 'speech' ).trim() : ""
          responsiveVoice.speak( readtext, "Norwegian Female", {
            pitch: 0.8,
            rate: 1
          } )
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
          //var ttt = event.currentTarget.childNodes[1].textContent = "hhhhhhhh"

          var ttt = event.currentTarget.innerHTML = "<div contenteditable='true'><text>Hello world</text></div>"

          var bb = 3;
          //aktuell_brikke.node.style.display = ""        
        } ),
        //***************************************

        //$('textedit').contentchanged() {
        //        alert('changed')
        //     }



        Draggable.create( ".source", {
          bounds: svg_navn != "dummyx" ? {
            minX: -4000,
            maxX: 1024,
            minY: -4005,
            maxY: 1024
          } : "#" + imid,
          //dragResistance: 0.4,

          onDragLeave: function () {
            //this.update();
          },

          onDragStart: function ( e ) {},

          onDrag: function ( evt ) {
            // console.log(`deltaX: ${this.deltaX}, deltaY: ${this.deltaY}`)
            console.log( `x: ${this.x}, y: ${this.y}` )
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

          },

          onDragEnd: function () {
            //onDragEnd : (e) => {

            console.log( "ONDRAGEND", that )
            console.log( "THIS", this )

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
                  console.log( "Target skal ikke sluke objekt" )
                }

                targ1.members[ i ].addClass( "highlight" )

                //    r = 1+0.25*(Math.random() -0.5);
                //   r2 = Math.random();              

                //Leser spørsmåltekst høyt              
                var sel_que = SVG.select( ".speak_when_hit" ).members
                var readtext = sel_que.length != 0 && sel_que[ 0 ].node.getAttribute( 'speech' ) != null ? sel_que[ 0 ].node.getAttribute( 'speech' ).trim() : ""
                responsiveVoice.speak( readtext, "Norwegian Male", {
                  pitch: 0.8,
                  rate: 1
                } )
                //targ1.stroke('#f00')
              } else {
                //skriver info om posisjon, tidspkt og target_id for treff av target

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
                //targ1.stroke({ width: 1 });
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
  scripts: [ "/libs/nav/customNav.js" ],
  links: [],
  widgetClass: MatteWidget,
  contributesAnswer: true,
  jsonSchema: {
    title: "MatteWidget",
    description: "Denne widgeten inneholder drag - og dropbare objekt",
    type: "object",
    properties: {
	    svg_url: {
	    	type: "string",
		title: "URL for svg-file"
	    },
	    mp3_base_url:{
		type: "string",
		title: "URL for mp3-files"
	    },
	    viewBox:{
	    	type: "object",
		properties:{
			x:{type:"number", title:"viewbox x-value"},
			y:{type:"number", title:"viewbox y-value"}
		}
	    }
    }
  },
  jsonSchemaData:{
  	"svg_url":"url for svgs",
	"mp3_base_url":"base url for mp3-files",
	"viewBox":{"x":1024, "y":768}
  },
  configStructure: {
  	"svg_url":"url for svgs",
	"mp3_base_url":"base url for mp3-files",
	"viewBox":{"x":1024, "y":768}  
  }
}
