export default class GgbWidget {
	// kun for matistikk
	// class GgbWidget {
	constructor(divElementId, config, answer = null, onAnswer, options) {
		this.divElementId = divElementId
		this.ggbId = `${this.divElementId}-ggb-container`
		// this.fbId = `${this.divElementId}-fb`
		// default values
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

		this.vars = {}
		this.ans = answer || { log: [] }
		this.onAnswer = onAnswer
		if (options.playback) {
			this.playback = options.playback
		}

		this.buildDOM()
		this.config.ggbApplet.appletOnLoad = this.appletOnLoad
		window.onload = this.runscript()
		if (this.config.feedback) {
			this.fb = new FeedBack(
				divElementId,
				this.config.feedback.params,
				config.feedback.feedbacks,
				config.feedback.default,
				this.vars,
				this.setFb
			)
		}
	}

	addUpdateListener = (api, name, type, vars = false, aux = false) => {
		// console.log("name:", name, "type:", type)
		const appendVar = (objName = name) => {
			let value = api.getValue(objName)
			// console.log("value:", value, "typeof", typeof value)
			if (!isNaN(value) && value !== null) {
				this.vars[name] = value
			}
			if (type == 'point') {
				let x = api.getXcoord(objName),
					y = api.getYcoord(objName)

				this.vars[name + 'x'] = x
				this.vars[name + 'y'] = y
			}
		}
		let listener = objName => {
			if (vars) appendVar(objName)
			if (!aux) this.logger(api, name)
		}
		api.registerObjectUpdateListener(name, _debounced(250, listener))
		appendVar()
	}
	/**
	 * Logs action to the answer.log array
	 */
	logger = (api, objName = null, action = 'UPDATE') => {
		let type = api.getObjectType(objName)
		if (action === 'ADD') this.addUpdateListener(api, objName, type)
		let data = {}
		let value = api.getValue(objName)
		if (value !== NaN && value !== null) data.value = value
		if (type === 'point') {
			data = {
				x: api.getXcoord(objName).toFixed(5),
				y: api.getYcoord(objName).toFixed(5)
			}
		} else if (type === 'angle') {
			data.value *= 180 / Math.PI
		}
		let def = api.getDefinitionString(objName)
		if (def !== '') data['definition_string'] = def
		this.ans.log.push({
			action: action,
			object_name: objName,
			object_type: type,
			data: data,
			time: Date.now(),
			delta_time: this.ans.log.length
				? Date.now() - this.ans.log[this.ans.log.length - 1].time
				: null
		})
		this.putAns()
	}

	appletOnLoad = api => {
		const addListener = objName => {
			this.logger(api, objName, 'ADD')
		}
		api.registerAddListener(addListener)

		const clearListener = () => {
			this.logger(api, null, 'RESET')
		}
		api.registerClearListener(clearListener)

		// const clickListener = obj => {
		// 	console.log(obj)
		// }
		// api.registerClickListener(clickListener)

		const clientListener = evt => {
			console.log('Client:', evt)
		}
		api.registerClientListener(clientListener)

		for (let o of this.config.vars) {
			this.addUpdateListener(api, o.name, o.type, true, o.aux)
		}
		api.recalculateEnvironments()
	}

	currentTimeMs() {
		return this.startTime ? new Date() - this.startTime : 0
	}
	// CB sendt til feedback klassen, legger til feedback til svar objektet
	setFb = msg => {
		this.ans.log.push({
			action: 'FEEDBACK',
			data: msg,
			time: Date.now(),
			delta_time: this.ans.log.length
				? Date.now() - this.ans.log[this.ans.log.length - 1].time
				: null
		})
		this.putAns()
	}

	putAns() {
		//! ONLY FOR DEBUGGING
		const LENGTH = 3
		const tail = (arr = []) => {
			return arr.slice(-3)
		}
		//
		// console.log(JSON.stringify(this.ans.log, null, 2))
		this.onAnswer(JSON.stringify(tail(this.ans.log).reverse(), null, 2))
		// this.onAnswer(this.answer)
	}

	buildDOM() {
		let parent = document.getElementById(this.divElementId)
		parent.setAttribute('height', `${this.config.ggbApplet.height}px`)
		let ggb = document.createElement('div')
		ggb.classList.add('widget-box')
		ggb.id = this.ggbId

		parent.append(ggb)
	}

	runscript() {
		this.applet = new GGBApplet(this.config.ggbApplet, '5.0', this.ggbId)
		this.applet.setPreviewImage(
			'data:image/gif;base64,R0lGODlhAQABAAAAADs=',
			'https://www.geogebra.org/images/GeoGebra_loading.png',
			'https://www.geogebra.org/images/applet_play.png'
		)
		// this.ggb = this.applet.getAppletObject()
		this.applet.inject(this.ggbId)
		// this.applet.inject()
	}
}

var ggbWidget = {
	scripts: ['https://cdn.geogebra.org/apps/deployggb.js'],
	links: [],
	widgetClass: ggbWidget,
	contributesAnswer: true,
	jsonSchema: {
		title: 'GoeGebra widget',
		description: 'Geogebra',
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

	// prettier-ignore
	jsonSchemaData: {
		"ggbApplet": {},
		"vars": [],
		"feedback": {},
	},
	// prettier-ignore
	configStructure: {
		"ggbApplet": {
      "ggbBase64":"XXX"
    }, // see https://wiki.geogebra.org/en/Reference:GeoGebra_App_Parameters
		"vars": [
      {
        "name": "Name of geogebra object",
        "type": "numeric | point | line | segment | polygon | ..."
    }
    ],
		"feedback": {
      "parameters": {
        "dismissable": true,  // default
        "multi": true,        // default
        "forgetful": false,   // default
        "random": true        // default
      },
      "default": "Default feedback to give when no conditions return true",
      "feedbacks": [
        [
          "feedback A1",
          "feedback A2"
        ],
        [
          "feedback B1",
          "feedback B2"
          // and so on
        ]
      ],
      // Must be in 1-1 correspondans with elements in feedbacks array
      "conditions":[
        {
          "op": "lt | leq | gt | geq | eq | neq | and | or | and | xor | add | sub | mult | div",
          "a": "First argument (read left to right). Can be of type string | number | boolean",
          "b": "Second argument to access vars start string with '_', e.g. '_m' or '_Ax'(x-coordinate of point A) "
        },
        {
          "op": "Conditions can be nested",
          "a": {
            "op": "and",
            "a": true,
            "b": true
          },
          "b": {
            "op": "or",
            "a": {
              // etc...
            },
            "b": {
              // etc ..
            }
          }
        }
      ]
    },
	}
}

function _debounced(delay, fn) {
	let timerId
	return function(...args) {
		if (timerId) {
			clearTimeout(timerId)
		}
		timerId = setTimeout(() => {
			fn(...args)
			timerId = null
		}, delay)
	}
}
