//import Widget from './ggbWidget.js'
//import Widget from './test.js'
//import Widget from './bjornWidget.js'

//import Widget from './figurWidget.js'
import Widget from './matteWidget.js'

const configFile = 'configA.json'
// const configFile = 'configB.json'

const divContainer = document.getElementById( 'widget-container' )
const fileUpload = document.getElementById( 'config-file' )

fileUpload.onchange = inn => {
	let file = fileUpload.files[ 0 ]
	let fr = new FileReader()
	fr.onload = evt => {
		let config = JSON.parse( evt.target.result )
		makeWidget( config )
	}
	fr.readAsText( file )
}
let answerEl = document.getElementById( 'answer' )

//let ans
let onAnswer = answer => {
	console.log( "Nytt kall til onAnswer" )
	console.log( answer )
}

fetch( `./configs/${configFile}` )
	.then( resp => resp.json() )
	.then( config => makeWidget( config ) )

function makeWidget( config ) {
	// let divEl = document.getElementById('widget')
	if ( divContainer.hasChildNodes() )
		divContainer.removeChild( divContainer.firstChild )
	answerEl.value = ''
	delete window.widget
	let divEl = document.createElement( 'div' )
	divEl.id =
		'widget' +
		Math.random()
		.toString( 36 )
		.substring( 2, 15 )
	divContainer.append( divEl )
	window.widget = new Widget( divEl.id, config, null, onAnswer, {} )
}

let setAns = () => {
	console.log( 'setting answer...' )
	let ansWidget = new Widget(
		document.getElementById( 'setAns' ).id,
		config,
		ans,
		function ( arg ) {
			console.log( 'new ans:', arg )
		}, {}
	)
}

document.getElementById( 'setBtn' ).onclick = setAns