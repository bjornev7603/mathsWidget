// Bygger et arrayobjekt som tar vare på hvert dra-objekts
// posisjon, tidsbruk og målet det evt. traff.

export default class InputWidget {

    constructor(divElementId, config, answer = null, onAnswer) {
        this.divElementId = divElementId;
//
        document.getElementById(divElementId).style.height = "100%"
//

        this.config = config;
        this.answer = answer|| [];
        this.onAnswer = onAnswer;
         

        this.runscript();

        let parameters = {
			width:
				document.getElementById(divElementId).clientWidth < 800 ? 600 : 800,
			// width: 600,
			height: 450,
			// borderColor: null,
			showMenuBar: false,
			// showAlgebraInput: false,
			showToolBar: false,
			// customToolbar: '0|1', //see https://wiki.geogebra.org/en/Reference:Toolbar for codes
			showResetIcon: false,
			enableLabelDrags: false,
			enableShiftDragZoom: true,
			enableRightClick: false,
			// enableCAS: false,
			// capturingThreshold: null,
			// appName: 'graphing',
			showToolBarHelp: false,
			errorDialogsActive: true,
			useBrowserForJS: false,
			autoHeight: true,
			language: 'nb'
			// showLogging: 'true' //only for testing/debugging
		}

        // overwrite default values with values passed down from config
		// this.config.parameters = { ...parameters, ...config.ggbApplet }
		this.config = {
			ggbApplet: { ...parameters, ...config.ggbApplet },
			feedback: config.feedback || null,
			vars: config.vars || []
		}

    }

    runscript() {
        // Get already created <div> element.
        
        var mintimer;
           
                
        let divElement = document.getElementById(this.divElementId);
        let inputElement = document.createElement('inputxxx');
        inputElement.type = this.config.inputType || 'number';
        
        // Add event listener, to update answer.
        inputElement.onchange = event => {
            this.updateAnswer(event.target.value);            
        };

        // Set existing answer, if it exists.
        if (this.answer) {
            inputElement.value = this.answer;
        }

        // Add created <input> element to existing <div> element.
        divElement.appendChild(inputElement);

        
        var cc = new Array;
        //initierer arrayobj
        cc[0] = {'x': 0, 'y': 0, 'fig': '', 'event': null , 'tim': Date.now(), 'tdiff' : 0, 'hit': null};
        


        //Generisk tilstandsanalyse av figurer som drag'es og drop'es

        //Sortere og gruppere dragbare figurer
        //To eller flere figurer nære hverandre er gruppe
        
        //Sortere oppgaver: kan klassifisere trag-bare figurer. 
        //Disse sorteres av bruker etter kriterium også til grunn for klassifisering        
            //Sortable.size


        

        /* var canvass = SVG('drawing').size('50%', '50%').viewbox(0,0,800,1000);
        var rect = canvass.rect(100, 100);

        var path = canvass.path("m 357.64532,453.84097 c 17.62007,8.02216 -2.12058,27.70935 -13.33334,29.28571 -30.3859,4.27185 -48.34602,-29.97426 -45.23807,-55.9524 5.5594,-46.46879 56.1311,-70.59787 98.57145,-61.19043 62.28294,13.8058 93.32728,82.57702 77.1428,141.19051 C 453.21679,585.29693 365.67122,623.42358 290.97859,600.26951 196.98554,571.13248 151.71003,464.56996 181.93108,373.84089 218.53281,263.95583 344.23687,211.49702 450.97875,248.84102 576.77037,292.84963 636.43303,437.76771 591.93099,560.50775 540.55162,702.21597 376.3736,769.09583 237.6452,717.41234 80.01319,658.68628 5.9069261,475.21736 64.788247,320.50751 130.84419,146.94643 333.62587,65.607117 504.31214,131.69819 693.80625,205.0718 782.38357,427.18225 709.07382,613.84113")
        var length = path.length()  
  
        path.fill('none').stroke({width:1, color: '#ccc'})

        rect.animate(8000, '<>').during(function(pos, morph, eased){
            var p = path.pointAt(eased * length)
            rect.center(p.x, p.y)
        }).loop(true, true) */

        var svg_navn, neste_svg;
        var oppgaver_navn =  new Array;        
        oppgaver_navn = ['fotball', 'monkeyeatbanana2', 'sub_dra1', 'telling2', 
                            'telling1b', 'tallrekker1', 'figurtall4', 'skilltest'];
        //var svg_fil_navn = 'fotball.svg';
        //var svg_fil_navn = 'monkeyeatbanana.svg';
        //var svg_fil_navn = 'telling1b.svg';
        //var svg_fil_navn = 'telling2.svg';         
        //var svg_fil_navn = 'sub_dra1.svg';
        //var svg_fil_navn = 'tallrekker1.svg';
        //var svg_fil_navn = 'figurtall4.svg';
        //var svg_fil_navn = 'skilltest.svg';

        
        var andre_oppg = (oppgaver_navn.length>=2)? oppgaver_navn[1]: oppgaver_navn[0]; //tar høyde for om bare en oppg i array
        //henter oppgave (task) i url, eller laster første oppgave som default
        //henter også neste oppgave fra task_array, til nesteknapp
        const task_paraval = new URLSearchParams(window.location.search).get('task');        
        
        if (task_paraval != null && task_paraval != "") {
            var posi = oppgaver_navn.indexOf(task_paraval);            
            svg_navn = (oppgaver_navn[posi] != null)? oppgaver_navn[posi]: oppgaver_navn[0];
            neste_svg = (oppgaver_navn[posi+1] != null)? oppgaver_navn[posi+1]: andre_oppg;
        }
        else {
             svg_navn = oppgaver_navn[0];
             neste_svg = andre_oppg;
        }


        var count_msec = 30000;
        var timeout_tallrekker = 3000;

        

        
        
        
        
        //xdim = 900, ydim = 600, vb_x = 450, vb_y = 300,
        //størrelse figurtest
        //xdim = 800, ydim = 600, vb_x = 450, vb_y = 300,
        
        //størrelse fotball
        //xdim = 1000, ydim = 800, vb_x = 1000, vb_y = 800,

        //størrelse telling1b:
        //xdim = 27.467, ydim = 108.116, vb_x = 27.467, vb_y = 108.116,
        var xdim = 900, ydim = 900, vb_x = 200, vb_y = 1200
    
       
        
        //størrelse telling2:
        //xdim = 27.467, ydim = 108.116, vb_x = 27.467, vb_y = 108.116,
        //xdim = 700, ydim = 900, vb_x = 700, vb_y = 900,



        //xdim = 900, ydim = 900, vb_x = 750, vb_y = 700,
        var figuren = new SVG(this.divElementId)//.size("29700","21000");
        //figuren.viewbox(0,0,vb_x,vb_y);

         //if($( ".click_start" ).empty) {
            /* var sel_que = SVG.select('.question').members;
            var readtext = (sel_que.length!=0)? sel_que[0].node.textContent: "";
            console.log(readtext);                
            responsiveVoice.speak(readtext, "Norwegian Female", {pitch: 0.8, rate:1.5});   */
        //} 

        //hente svg bildeobjekt
        var ajax = new XMLHttpRequest();
        ajax.open('GET', 'svgfiler/' + svg_navn + ".svg", true);
        ajax.send();

        ajax.onload = (e)=> {
            //laster svg-bilde
            let tmp =ajax.responseText
            var parser = new DOMParser();
            var doc = parser.parseFromString(tmp, "image/svg+xml");
            window.svgdoc = doc
            let h = doc.querySelector('svg').height.baseVal.value
            document.getElementById(this.divElementId).style.height = `${h}px` // h +"px"

            let w = document.getElementById(this.divElementId).clientWidth
            console.log("W", w, ", H", h)
            // svgimage.size(h)

            var svgimage = figuren.svg(ajax.responseText); // put loaded file on SVG document

            
            window.test = svgimage
            var targ1 = SVG.select('.target');
            //var spesifikk_targ1 = SVG.select('#target_1');
            var src1 = SVG.select('.source');





            //var sel_que = SVG.select('.question').members;
            //var readtext = (sel_que.length!=0)? sel_que[0].node.attributes.tekst.nodeValue: "";
            //console.log(readtext);
            //responsiveVoice.speak("Hei", "Norwegian Female");

            

            var sel_que = SVG.select('.question').members;
            //var readtext = (sel_que.length!=0)? sel_que[0].node.textContent: "";            
            var readtext = (sel_que.length!=0)? sel_que[0].node.textContent: "";

            console.log(readtext);                
            responsiveVoice.speak(readtext, "Norwegian Female", {pitch: 0.8, rate:1});
            //responsiveVoice.speak("Test av Oppgaver", "Norwegian Male", {pitch: 0.8, rate:1});

            
            var imid = svgimage.node.id;
            
            console.log(imid)
            // WEIRD BEHAVIOR!!! I think only a problem on Chrome.. 
            //TweenLite.set("#"+imid, { touchAction: "pan-x"});
            TweenLite.set("#"+imid, { touchAction: "manipulation"});
            

            //TweenLite.onchange(event)
           

            $( ".click_start_tallrekker" ).click(function() {



                var sel_que = SVG.select('.question').members;
                var readtext = (sel_que.length!=0)? sel_que[0].node.textContent: "";
                console.log(readtext);                
                responsiveVoice.speak(readtext, "Norwegian Female", {pitch: 0.8, rate:1.1});

            
                var svg_showfigures1 = SVG.select('.show1').members;
                var svg_showfigures2 = SVG.select('.show2').members;
                var svg_showfigures3 = SVG.select('.show3').members;
                var x = 0
                                    
                                        
                mintimer = setTimeout(function(){                            
                    [...svg_showfigures1].forEach(node => {
                        node.node.style.display = "";
                    })
                }, timeout_tallrekker);

                mintimer = setTimeout(function(){                            
                    [...svg_showfigures2].forEach(node => {
                        node.node.style.display = "";
                    })
                }, timeout_tallrekker*(2));


                mintimer = setTimeout(function(){                            
                    [...svg_showfigures3].forEach(node => {
                        node.node.style.display = "";
                    })
                }, timeout_tallrekker*(3) );

                

                                                
                    

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
                

            }),

            $( ".task_done" ).click(function() {
                                
                //sender objektarray'et cc tilbake til server når knappen trykkes.
                //this.updateAnswer(cc);

                //Redirigerer til neste oppgave med gitte parametre. Ny instans av widget destruerer og konstruerer objektet. 
                //Ny oppgave lastes, med nytt objarray
                var pathn = window.location.pathname.includes('index.html')? window.location.pathname: '/index.html';                
                window.location.href = 'http://' + window.location.host + pathn + '?task=' + neste_svg;



            
            })


            $( ".click_tallbrikker" ).click(function() {

                var alle_brikker = SVG.select('.brikker').members;
                [...alle_brikker].forEach(node => {
                    node.node.style.display = "none";                  
                });

                var mitt_aktuelle_tall = this.id.split("_")[1];                
                var aktuell_brikke = SVG.select('#brik'+ mitt_aktuelle_tall).members[0];                
                aktuell_brikke.node.style.display = "";

                
                

                //brikker.node.id

                /* [...brikker].forEach(node => {
                    node.node.style.display = "";

                    //mitt_aktuelle_tall

                    var rr = node.node.id;
                }) */




                //tallrekker



            }),


            $( ".click_start_timere" ).click(function() {
                
                var countDownDate = new Date().getTime() + count_msec;
                var x = setInterval(function() {

                    var now = new Date().getTime();

                    // Find the distance between now and the count down date
                    var distance = countDownDate - now;       
                    
                    // Time calculations for days, hours, minutes and seconds
                    /* var days = Math.floor(distance / (1000 * 60 * 60 * 24));
                    var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)); */
                    var seconds = Math.floor((distance % (1000 * 60)) / 1000);
                    
                    // Display the result in the element with id="demo"
                    document.getElementById("klokke").innerHTML = 
                    //days + "d " + hours + "h " + minutes + "m " +
                     seconds + "s ";
                    
                    // If the count down is finished, write some text 
                    if (distance < 0) {
                        clearInterval(x);
                        document.getElementById("klokke").innerHTML = "Tida er ute";
                    }

                }, 1000);

                mintimer = setTimeout(function(){

                    var svg_pricks = SVG.select('.prick').members;
                    var x = 0
                    for (x=0;x<svg_pricks.length;x++) {
                        svg_pricks[x].node.style.fill = 'white';
                      //  var ccc = svg_prick;
                    }
                    clearTimeout(mintimer); 
                },
                count_msec);
            
            

                var sel_que = SVG.select('.question').members;
                var readtext = (sel_que.length!=0)? sel_que[0].node.textContent: "";
                console.log(readtext);                
                responsiveVoice.speak(readtext, "Norwegian Female", {pitch: 0.8, rate:1});
            }),


            $( ".click_start_uten_timere" ).click(function() {                

                var sel_que = SVG.select('.question').members;
                var readtext = (sel_que.length!=0)? sel_que[0].node.textContent: "";
                console.log(readtext);                
                responsiveVoice.speak(readtext, "Norwegian Female", {pitch: 0.8, rate:1});
            }),




            $( ".click" ).click(function() {
                $('.click').css('fill', 'black');
                $('.click').css('fontSize', '12');
               
                this.style.fontSize  = "20";                
                this.style.fill = "pink";
                
                
                
                
                cc[cc.length] = {'x': this.x.baseVal[0].value, 'y': this.y.baseVal[0].value, 'fig': this.id, 'event': 'click', 'tim': Date.now(), 'tdiff': ((Date.now() - cc[cc.length-1].tim)/1000), 'hit': null };
                console.log(cc[cc.length-1]);
              }),

            

            Draggable.create(".source", {               
                                
                bounds: (svg_navn=="fotball") ? {minX:-1850, maxX:-1100, minY:-500, maxY:150}: "#"+imid ,
                
                onDragLeave: function() {
                    //this.update();
                },

                onDragStart: function(e) {


                    /* //viser tallbrikker
                    var alle_brikker = SVG.select('.brikker').members;
                    [...alle_brikker].forEach(node => {
                        node.node.style.display = "none";                  
                    });

                    var mitt_aktuelle_tall = this.id.split("_")[1];                
                    var aktuell_brikke = SVG.select('#brik'+ mitt_aktuelle_tall).members[0];                
                    aktuell_brikke.node.style.display = "";


                    mintimer = setTimeout(function(){

                        var svg_pricks = SVG.select('.prick').members;
                        var x = 0
                        for (x=0;x<svg_pricks.length;x++) {
                            svg_pricks[x].node.style.fill = 'white';
                          //  var ccc = svg_prick;
                        }
                        clearTimeout(mintimer); 
                    },
                    count_msec); */



                    //øker objektets størrelse ved dragging
                    //this.target.style.width  = "6%";
                    //this.target.style.height  = "6%";          
                    
                    



                    /* var kl_div = document.getElementById("klokke").innerHTML
                    var x = 40;
                    var myVar;
                    while(x>0) { 
                    	myVar = setInterval(alertFunc, 4000);
                        

                        if(x>0) {
                            document.getElementById("klokke").innerHTML = x + " sekund";                         						
						}
                        
                        if(x==0) {
                            document.getElementById("klokke").innerHTML = "Tiden er ute!!";                        
                        }
                        x--;
                    }
                    //var myVar;
                    //myVar = setInterval(alertFunc2, 10000);

                    function alertFunc() {                       
                        //setInterval(alertFunc, 1000);
                        x--;
						
                    }

                    function alertFunc2() {                                              
                    } */
                    

                    /* var antSekTimer = 30;

                    var naatid = new Date().getTime();
                    var countDownDate = naatid + (1000*antSekTimer);

                    // Update the count down every 1 second
                    var x = setInterval(function() {

                    // Get today's date and time
                    var now = naatid;//new Date().getTime();

                    // Find the distance between now and the count down date
                    var distance = countDownDate - now;

                    // Time calculations for days, hours, minutes and seconds
                    var days = Math.floor(distance / (1000 * 60 * 60 * 24));
                    var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                    var seconds = Math.floor((distance % (1000 * 60)) / 1000);

                    // Display the result in the element with id="demo"
                    document.getElementById("demo").innerHTML = days + "d " + hours + "h "
                    + minutes + "m " + seconds + "s ";

                    // If the count down is finished, write some text 
                    if (distance < 0) {
                        clearInterval(x);
                        document.getElementById("demo").innerHTML = "EXPIRED";
                    }
                    }, 1000); */



                },
               
                                
                onDrag: function() {
                    var terskel = 4;
                    
                    if(cc.length==1 || this.x - cc[cc.length-1].x > terskel || this.x - cc[cc.length-1].x < -terskel || this.y - cc[cc.length-1].y > terskel || this.y - cc[cc.length-1].y < -terskel) {
                        cc[cc.length] = {'x': this.x, 'y': this.y, 'fig': this.target.id, 'event': 'move', 'tim': Date.now(), 'tdiff': ((Date.now() - cc[cc.length-1].tim)/1000), 'hit': null };
                        //console.log(this.target.id,'ny x og y -posisjon', cc[length].x, ' ', cc[length].y);
                        
                        if(cc.length==1) console.log(this)
                    }
                    
                    console.log(this);
                    
                    

                },                

                onDragEnd: function(e) {
                    // console.log(e)

                    this.target.style.width  = "";
                    this.target.style.height  = "";                

                    var i = targ1.members.length;
                    console.log(this.target.id,'ny x-posisjon' + this.x,' ny y-posisjon' + this.y , ' x og y: ', cc[cc.length-1]);
                                       
                    while (--i > -1) {
                        if (this.hitTest(targ1.members[i].node)) 
                        {   
                            //skriver info om posisjon, tidspkt og target_id for treff av target
                            cc[cc.length] = {'x': this.x, 'y': this.y, 'fig': this.target.id, 'event': 'hit' , 'tim': Date.now(), 'tdiff': ((Date.now() - cc[cc.length-1].tim)/1000), 'hit': targ1.members[i].node.id };

                            var pos = targ1.members[i].bbox();
                            var t = pos.x2*0.97  + " " +pos.cy*0.95;
                            //console.log(t)
                            
                            //ser om klassen disappear finnes i src svg-objekt
                            var disappear = (this.target.classList[2]=="disappear")? true: false;                            
                            if(disappear) {
                                TweenLite.to(this.target, 0.6, {opacity:0, scale:0, svgOrigin:t});
                            } 
                            else {
                                console.log("Target skal ikke sluke objekt");
                            }
                            
                            targ1.members[i].addClass("highlight");

                            //    r = 1+0.25*(Math.random() -0.5);
                            //   r2 = Math.random();
                            // console.log(r)
                            //responsiveVoice.speak("nam. nam", "Norwegian Male", {pitch: r2, rate:r})
                            
                            
                            var sel_que = SVG.select('.hit_reaction').members;
                            //var readtext = (sel_que.length!=0)? sel_que[0].node.textContent: "";            
                            var readtext = (sel_que.length!=0)? sel_que[0].node.textContent: "";                            
                            responsiveVoice.speak(readtext, "Norwegian Male", {pitch: 0.8, rate:1});
                            //targ1.stroke('#f00')
                        }
                        else {
                            //skriver info om posisjon, tidspkt og target_id for treff av target
                            cc[cc.length] = {'x': this.x, 'y': this.y, 'fig': this.target.id, 'event': 'dragend' , 'tim': Date.now(), 'tdiff': ((Date.now() - cc[cc.length-1].tim)/1000), 'stop': targ1.members[i].node.id };
                            var c=1;
                            //targ1.stroke({ width: 1 });                            
                        }
                    }                      
                }
            })
             
        }
        








    }

    // Update answer.
    updateAnswer(newAnswer) {
        this.answer = newAnswer;
        this.onAnswer(newAnswer);
    }


    // Set the date we're counting down to
			
			
			// Update the count down every 1 second
			/* setInterval(thousand) {
            
                var countDownDate = new Date("Jan 5, 2021 15:37:25").getTime();

                // Get today's date and time
                var now = new Date().getTime();
                
                // Find the distance between now and the count down date
                var distance = countDownDate - now;
                
                // Time calculations for days, hours, minutes and seconds
                var days = Math.floor(distance / (1000 * 60 * 60 * 24));
                var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                var seconds = Math.floor((distance % (1000 * 60)) / 1000);
                
                // Display the result in the element with id="demo"
                document.getElementById("demo").innerHTML = days + "d " + hours + "h "
                + minutes + "m " + seconds + "s ";
                
                // If the count down is finished, write some text 
                if (distance < 0) {
                    clearInterval(x);
                    document.getElementById("demo").innerHTML = "EXPIRED";
			    }
			};
 */
    

}

var bjornWidget = {

    /**
    * External scripts the widget is dependent on, e.g., a cdn with JQuery.
    * This ensures that all dependencies are loaded only once per test.
    */
    scripts: ['https://cdn.geogebra.org/apps/deployggb.js'],
    
    /**
    * Import CSS-libraries to use. Be careful with this, since CSS is global
    * and might override classes/tags outside the widget as well.
    */
    links: [],
    
    /**
    * Class responsible for setting up/running widget.
    */
    widgetClass: bjornWidget,

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
        title: 'Input widget',
        description: 'Denne widgeten inneholder drag - og dropbare objekt',
        type: 'object',
        properties: {
            ggbApplet: {
                type: 'object',
                title: 'GGBApplet'
            },
            vars: {
                type: 'array',
                title: 'Variables',
                description: 'Variables for feedback checking'
            },
            feedback: {
                type: 'object',
                properties: {
                    parameters: {
                        type: 'object',
                        title: 'Parameters',
                        description: 'Parameters for feedback module'
                    },
                    default: {
                        type: 'string',
                        title: 'defaultFB',
                        description: 'fallback feedback if no condition is true'
                    },
                    feedbacks: {
                        type: 'array',
                        title: 'feedbacks',
                        description:
                            'Array of arrays for feedback (1-1 correspondance with conditions)'
                    },
                    conditions: {
                        type: 'array',
                        title: 'conditions',
                        description:
                            'Array of conditions to check which feedback to give (1-1 correspondance with feedbacks)'
                    }
                }
            }
        }
    },

    configStructure: {
        //inputType: 'number'
    },

}



