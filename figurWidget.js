// Bygger et arrayobjekt som tar vare på hvert dra-objekts
// posisjon, tidsbruk og målet det evt. traff.

export default class InputWidget {

    constructor(divElementId, config, answer = null, onAnswer) {
        this.divElementId = divElementId;
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

        let divElement = document.getElementById(this.divElementId);
        let inputElement = document.createElement('input');
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


    
        //var draw = SVG('min_sirkel').size(xdim, ydim);
        
        //var rect1 = draw.rect(50, 50).attr({ fill: '#f06' });

        //var sirkell = draw.circle();
        //sirkell.radius(790);

        var svg_fil_navn = 'fotball.svg',
        //var svg_fil_navn = 'fotball.svg',
        //var svg_fil_navn = 'skilltest.svg',
        
        
        //xdim = 900, ydim = 600, vb_x = 450, vb_y = 300,
        //størrelse figurtest
        //xdim = 800, ydim = 600, vb_x = 450, vb_y = 300,
        
        //størrelse fotball
        xdim = 1000, ydim = 800, vb_x = 1000, vb_y = 800,

        //størrelse telling1b:
        //xdim = 27.467, ydim = 108.116, vb_x = 27.467, vb_y = 108.116,
        //xdim = 700, ydim = 700, vb_x = 700, vb_y = 900,
        
        
        //størrelse telling2:
        //xdim = 27.467, ydim = 108.116, vb_x = 27.467, vb_y = 108.116,
        //xdim = 700, ydim = 900, vb_x = 700, vb_y = 900,



        //xdim = 900, ydim = 900, vb_x = 750, vb_y = 700,
        figuren = new SVG('min_figur').size(xdim,ydim);    
        figuren.viewbox(0,0,vb_x,vb_y);

        //hente svg bildeobjekt
        var ajax = new XMLHttpRequest();
        ajax.open('GET', svg_fil_navn, true);
        ajax.send();
        ajax.onload = function(e) {
            var svgimage = figuren.svg(ajax.responseText); // put loaded file on SVG document

            var targ1 = SVG.select('.target');
            //var spesifikk_targ1 = SVG.select('#target_1');
            var src1 = SVG.select('.source');
            //var sel_que = SVG.select('.question').members;
            //var readtext = (sel_que.length!=0)? sel_que[0].node.attributes.tekst.nodeValue: "";
            //console.log(readtext);
            //responsiveVoice.speak(readtext, "Norwegian Female");

            
            var imid = svgimage.node.id;
            
            console.log(imid)
            // WEIRD BEHAVIOR!!! I think only a problem on Chrome.. 
            //TweenLite.set("#"+imid, { touchAction: "pan-x"});
            TweenLite.set("#"+imid, { touchAction: "manipulation"});

            //TweenLite.onchange(event)
           

            Draggable.create(".click", {                
                onClick: function() {
                    console.log("klikka for hen");
                },
            }),

            Draggable.create(".source", {                
                bounds:"#layer1",//+imid,
                //bounds: {minX:0, maxX:200, minY:18, maxY:150 },
                
                
                onDragLeave: function() {
                    this.update();
                },
               
                                
                onDrag: function() {
                    var terskel = 4;
                    
                    if(cc.length==1 || this.x - cc[cc.length-1].x > terskel || this.x - cc[cc.length-1].x < -terskel || this.y - cc[cc.length-1].y > terskel || this.y - cc[cc.length-1].y < -terskel) {
                        cc[cc.length] = {'x': this.x, 'y': this.y, 'fig': this.target.id, 'event': 'move', 'tim': Date.now(), 'tdiff': ((Date.now() - cc[cc.length-1].tim)/1000), 'hit': null };
                        //console.log(this.target.id,'ny x og y -posisjon', cc[length].x, ' ', cc[length].y);
                        
                        if(cc.length==1) console.log(this)
                    }
                    
                    

                },                

                onDragEnd: function(e) {
                    // console.log(e)
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
                            TweenLite.to(this.target, 0.1, {opacity:0, scale:0, svgOrigin:t});

                            //    r = 1+0.25*(Math.random() -0.5);
                            //   r2 = Math.random();
                            // console.log(r)
                            //responsiveVoice.speak("nam. nam", "Norwegian Male", {pitch: r2, rate:r})

                            responsiveVoice.speak("nam. nam", "Norwegian Male", {pitch: 0.8, rate:1.5});
                            //targ1.stroke('#f00')
                        }
                        else {
                            //skriver info om posisjon, tidspkt og target_id for treff av target
                            cc[cc.length] = {'x': this.x, 'y': this.y, 'fig': this.target.id, 'event': 'dragend' , 'tim': Date.now(), 'tdiff': ((Date.now() - cc[cc.length-1].tim)/1000), 'stop': targ1.members[i].node.id };
                            targ1.stroke({ width: 1 });                            
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
        inputType: 'number'
    },

}



