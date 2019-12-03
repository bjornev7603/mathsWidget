var customNav = {
  init: () => {
    try {

      this.nav = document.querySelector( "nav" )
      this.btns = this.nav.querySelectorAll( "button" )
      this.nav.style = "display:none"
    } catch ( e ) {
      console.log( 'not in matistikk' )
    }
  },
  next: () => {
    try {
      this.nav.style = ""
      this.btns[ 1 ].click()
    } catch ( e ) {
      console.log( 'not in matistikk' )
    }
  },
  prev: () => {
    try {
      this.nav.style = ""
      this.btns[ 0 ].click()
    } catch ( e ) {
      console.log( 'not in matistikk' )
    }
  }
}