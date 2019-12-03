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
export default class SVGNumbersWidget {
  constructor( divElementId, config, answer = null, onAnswer ) {
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

    // let parameters = {
    //   width:
    //     document.getElementById(divElementId).clientWidth < 800 ? 600 : 800,
    //   // width: 600,
    //   height: 450,
    //   // borderColor: null,
    //   showMenuBar: false,
    //   // showAlgebraInput: false,
    //   showToolBar: false,
    //   // customToolbar: '0|1', //see https://wiki.geogebra.org/en/Reference:Toolbar for codes
    //   showResetIcon: false,
    //   enableLabelDrags: false,
    //   enableShiftDragZoom: true,
    //   enableRightClick: false,
    //   // enableCAS: false,
    //   // capturingThreshold: null,
    //   // appName: 'graphing',
    //   showToolBarHelp: false,
    //   errorDialogsActive: true,
    //   useBrowserForJS: false,
    //   autoHeight: true,
    //   language: "nb"
    //   // showLogging: 'true' //only for testing/debugging
    // }

    // overwrite default values with values passed down from config
    // this.config.parameters = { ...parameters, ...config.ggbApplet }
    // this.config = {
    //   mathtask_Applet: { ...parameters, ...config.mathtask_Applet },
    //   feedback: config.feedback || null,
    //   vars: config.vars || []
    // }
  }

  runscript() {
    // reomve nav bar at bottom
    customNav.init()

    // Get already created <div> element.



    let divElement = document.getElementById( this.divElementId )
    let inputElement = document.createElement( "inputxxx" )
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


    var svg_navn, neste_svg



    let oppgaver_navn = {
      veronso: [
        '000_startside',
        '001_fotball5',
        '002_ans4',
        '003_eplegiven',
        '004_monkeyeatbanana',
        '005_ans2',
        '006_kanin',
        '007_epletre',
        '008_tallinje1',
        '009_likemange',
        '010_opptelling27',
        '011_oppdeling5',
        '012_monkeyeatbanana',
        '013_givenplussn',
        '014_juletre',
        '015_opptelling33',
        '016_ans1',
        '017_juletre2',
        '099_ferdig',
        //'013',

        /* "fotball",
        "monkeyeatbanana",
        "epletre",    
        "tallinje1",      
        "juletre",  
        "ans1",  
        "ans2",  
        "ans3",  
        "ans4",
        "kanin",
        "likemange",      
        "opptelling27",
        "oppdeling5", */

      ],
      /* juliesg:[  

        "000-øvingsub",
        "001-subitizing",
        "002-subitizing",
        "003-subitizing",
        "004-subitizing",
        "005-subitizing",
        "006-subitizing",
        "007-subitizing",
        "008-subitizing",
        "009-øvingsubdra",


        "010-subitizingdra",
        "011-subitizingdra",
        "012-subitizingdra",
        "013-subitizingdra",
        "014-subitizingdra",
        

        "015-telling1a.svg",
        "016-telling1b.svg",

        "017-telling2a",
        "018-telling2b",


        "020-trekant",
        "021-kvadrat",
        "022-rutenett",
        "023-lastpage",
        
        

      ], */
      juliesg: [
        "kvadrat",
        "trekant",
        "subitizing-øving",
        "subitizing1",
        "subitizing2",
        "subitizing3",
        "subitizing4",
        "subitizing5",
        "subitizing6",
        "subitizing7",
        "subitizing8",
        "subitizing9",
        "subitizingdra-øving",
        "subitizingdra1",
        "subitizingdra2",
        "subitizingdra3",
        "subitizingdra4",
        "subitizingdra5",

        "telling1a",
        "telling1b",
        "telling2",
        //"tallrekker1",
        //"figurtall1",      
        "figurtall4",
      ],
      andre: [
        "figurtest",
        "MC",
        "skilpadde2",
        "skilltest"
      ]
    }


    let aktuell_svgmappe = "andrex";


    const author_paraval = new URLSearchParams( window.location.search ).get( "author" )

    const task_paraval = new URLSearchParams( window.location.search ).get( "task" )


    /* var directory="http://127.0.0.1:5500/svgfiler_veronso";
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", directory, false ); // false for synchronous request
    xmlHttp.send( null );
    var ret=xmlHttp.responseText;
    var fileList=ret.split('\n'); */




    /* const fs = require("fs");
 
  var directory = './';
 
  fs.readdir(directory, (err, files) => {
	  if(err) {
		// handle error; e.g., folder didn't exist
	  } 
	// 'files' is an array of the files found in the directory
  });  */



    // var stud = this.config.mathtask_Applet.folder

    // let oppgaver_navn_from_json = {
    //   [ stud ]: [
    //     this.config.mathtask_Applet.mathtask_Base64,
    //   ]
    // }


    // //let item = Object.keys(oppgaver_navn)[0]
    // //Object.keys(oppgaver_navn_from_json).forEach(function (item) {
    // Object.keys( oppgaver_navn ).forEach( function ( item ) {


    //   //hvis ingen ting i url, bare index.html eller ingenting bak adresse
    //   if ( task_paraval == null || task_paraval == "" ) {
    //     //hvis ikke oppgave oppgitt i url taskpara, og url inneholder katalogen veronica, julie eller andre på folk.ntnt.no
    //     //om ikke på folk-server, settes default oppgavekatalog (array) til 'andre'



    //     if ( window.location.host.includes( '5500' ) ) {
    //       if ( author_paraval == item ) {
    //         svg_navn = oppgaver_navn[ author_paraval ][ 0 ]
    //         neste_svg = oppgaver_navn[ author_paraval ][ 1 ]
    //         aktuell_svgmappe = "svgfiler_" + author_paraval;
    //       } else if ( author_paraval == null ) {
    //         svg_navn = oppgaver_navn[ 'andre' ][ 0 ]
    //         neste_svg = oppgaver_navn[ 'andre' ][ 1 ]
    //         aktuell_svgmappe = "svgfiler_andre";
    //       }
    //     } else {
    //       //kan skrive inn parameter for å komme til de ulike studenters oppggaver uten å angi filnavn
    //       if ( author_paraval == item ) {
    //         svg_navn = oppgaver_navn[ item ][ 0 ]
    //         neste_svg = oppgaver_navn[ item ][ 1 ]

    //         aktuell_svgmappe = ( item == "juliesg" ) ? "http://folk.ntnu.no/bjornev/matteoppgaver/juliesg_matteapps" : "http://folk.ntnu.no/" + item + "/matteapps";
    //       } else if ( author_paraval == null ) {
    //         svg_navn = oppgaver_navn[ 'andre' ][ 0 ]
    //         neste_svg = oppgaver_navn[ 'andre' ][ 1 ]
    //         aktuell_svgmappe = "./andre_matteapps";
    //       }



    //     }
    //   }
    //   var andre_oppg =
    //     oppgaver_navn[ 'andre' ].length >= 2 ? oppgaver_navn[ 'andre' ][ 1 ] : oppgaver_navn[ 'andre' ][ 0 ] //tar høyde for om bare en oppg i array
    //   //henter oppgave (task) i url, eller laster første oppgave som default
    //   //henter også neste oppgave fra task_array, til nesteknapp

    //   //oppgaver hentes fra array til qstring for lokal sidestyring      
    //   var posi = oppgaver_navn[ item ].indexOf( task_paraval )
    //   if ( posi > -1 ) {
    //     svg_navn =
    //       oppgaver_navn[ item ][ posi ]
    //     neste_svg =
    //       oppgaver_navn[ item ][ posi + 1 ] != null ? oppgaver_navn[ item ][ posi + 1 ] : oppgaver_navn[ item ][ 0 ] //andre_oppg
    //     //aktuell_svgmappe = item;
    //     //aktuell_svgmappe = "../../" + item + "/matteapps";

    //     if ( window.location.host.includes( '5500' ) ) {
    //       aktuell_svgmappe = "svgfiler_" + item;
    //     } else {
    //       //henter fra studentenes filområder
    //       aktuell_svgmappe = ( item == "juliesg" ) ? "http://folk.ntnu.no/bjornev/matteoppgaver/juliesg_matteapps" : "http://folk.ntnu.no/" + item + "/matteapps";
    //     }
    //   }
    // } )

    var countdown_msec = 12000 //1000 = sekund
    var timeout_msec = 3000

    var xdim = "100%",
      ydim = "100%"
    // vb_x, vb_y
    //styrer slik at julies bilder er portrett (768*1024), ellers landskap (1024*768)
    // if ( aktuell_svgmappe.includes( "juliesg" ) ) {
    // vb_x = 768
    // vb_y = 1024
    // } else {
    //   vb_x = 1024
    //   vb_y = 768
    // }

    var figuren = SVG( this.divElementId ).size( xdim, ydim )
    figuren.viewbox( 0, 0, this.config.viewBox.x, this.config.viewBox.y );


    // if ( svg_navn.includes( "000" ) ) {
    //   document.getElementById( 'logo' ).style.display = "block"
    // }
    // fetch( this.config.svg_url, {
    //     mode: 'no-cors'
    //   } )
    //   .then( resp => console.log( resp.json() ) )


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


      // doc.querySelector('svg').setAttribute('viewBox','0 0 100% 100%')

      // document.getElementById(this.divElementId).style.height = `${h}px` // h +"px"

      // let w = document.getElementById(this.divElementId).clientWidth
      // console.log("W", w, ", H", h)
      // svgimage.size(h)

      // figuren = SVG(this.divElementId).size("100%","100%");

      // var svgimage = figuren.svg(ajax.responseText); // put loaded file on SVG document
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

          //clearTimeout(mintimer);

          //arra.forEach(element => {
          //console.log(element);
          //});
          /* svg_showfigures[x].node.children.style.fill = 'white';
                      mintimer = setTimeout(function(){
                          var svg_pricks = SVG.select('.prick').members;
                          var x = 0
                          for (x=0;x<svg_pricks.length;x++) {
                              svg_pricks[x].node.style.fill = 'white';
                            var ccc = svg_prick;
                          } 
                          clearTimeout(mintimer); 
                      },
                      count_msec_tallrekker); */
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
          //document.getElementById('setBtn').submit()
          document.getElementById( 'setBtn' ).onclick = setAns

          //ser om localhost eller deployet til server
          var p_xtra = window.location.host.includes( "5500" ) ?
            "/index.html" :
            "/bjornev/matteoppgaver_" + "veronica" + "/index.html";

          //index.html føyes til hvis nødv
          var pathn = window.location.pathname.includes( "index.html" ) ?
            window.location.pathname :
            p_xtra;

          //selve url'en med oppgaveparameter
          window.location.href =
            "http://" + window.location.host + pathn + "?task=" + neste_svg
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

          //Leser spørsmåltekst høyt
          /* var sel_que = SVG.select("#speech_on_click").members
          var readtext = sel_que.length != 0 ? sel_que[0].node.textContent.trim() : ""      
          responsiveVoice.speak(readtext, "Norwegian Female", {
            pitch: 0.8,
            rate: 1
          }) */
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
          //event.setAttribute("transform","scale(1.0)")             
          //event.currentTarget.childnodes.style.fontSize = "20"
          //event.currentTarget.childNodes[1] = { outline: 3px solid green;} 
          //event.currentTarget.childNodes[1].stroke({ width: 1 })       

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

            // console.log(this);
            // console.log(`pointer (x,y) = (${e.x},${e.y})`)
            // console.log(`object (x,y) = (${this.x},${this.y})`)
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
  /**
   * External scripts the widget is dependent on, e.g., a cdn with JQuery.
   * This ensures that all dependencies are loaded only once per test.
   */
  scripts: [ "/libs/nav/customNav.js" ],

  /**
   * Import CSS-libraries to use. Be careful with this, since CSS is global
   * and might override classes/tags outside the widget as well.
   */
  links: [],

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
      ggbApplet: {
        type: "object",
        title: "GGBApplet"
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
  }
}