export default class InputWidget {

    constructor(divElementId, config, answer = null, onAnswer) {
        this.divElementId = divElementId;
        this.config = config;
        this.answer = answer;
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

        var xdim = 900;
        var ydim = 600;
        
    
        //var draw = SVG('min_sirkel').size(xdim, ydim);       
        //var rect1 = draw.rect(50, 50).attr({ fill: '#f06' });
        //var sirkell = draw.circle();
        //sirkell.radius(790);

        var figuren = new SVG('min_figur').size(xdim,ydim);
                
        figuren.viewbox(0,0,450,300);

        //hente svg bildeobjekt
        var ajax = new XMLHttpRequest();
        ajax.open('GET', 'test.svg', true);
        ajax.send();
        ajax.onload = function(e) {
            var svgimage = figuren.svg(ajax.responseText); // put loaded file on SVG document

            var targ1 = SVG.select('.target');

            
            var readtext = SVG.select('.question').members[0].node.innerHTML;
            console.log(readtext);

            responsiveVoice.speak(readtext, "Norwegian Female");

            var imid = svgimage.node.id;
            
            console.log(imid)
            // WEIRD BEHAVIOR!!! I think only a problem on Chrome.. 
            //TweenLite.set("#"+imid, { touchAction: "pan-x"});
            TweenLite.set("#"+imid, { touchAction: "manipulation"});
            
            Draggable.create(".source", {     
                
                
                bounds:"#"+imid,                
                onDragEnd: function() {
                    var i = targ1.members.length;
                    while (--i > -1) {
                        if (this.hitTest(targ1.members[i].node)) 
                        {
                            var pos = targ1.members[i].bbox();
                            var t = pos.x2*0.97  + " " +pos.cy*0.95;
                            //console.log(t)
                            TweenLite.to(this.target, 0.6, {opacity:0, scale:0, svgOrigin:t});

                            //    r = 1+0.25*(Math.random() -0.5);
                            //   r2 = Math.random();
                            // console.log(r)
                            //responsiveVoice.speak("nam. nam", "Norwegian Male", {pitch: r2, rate:r})

                            responsiveVoice.speak("nam. nam", "Norwegian Male", {pitch: 0.8, rate:1.5});
                            //targ1.stroke('#f00')
                        }
                        else {
                        // targ1.stroke('#000')
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
        description: 'Denne widgeten lager et input felt',
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
    }





}



