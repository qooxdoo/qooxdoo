
/**
 * Module for mediaqueries evaluation. The module is a wrapper for media.match.js,
 * that implements a polyfill for window.matchMedia when it's not supported natively.
 *
 * Usage:
 *
 * qxWeb.matchMedia("screen and (min-width: 480px)").matches; // true or false
 *
 * or
 *
 * var mql = qxWeb.matchMedia("screen and (min-width: 480px)"); 
 * mql.on("change",function(mql){
 *  //Do your stuff
 * });
 *
 */
qx.Bootstrap.define("qx.module.MatchMedia", {

  statics : {
    /**
    * Evaluates the specified mediaquery list
    * 
    * @attachStatic {qxWeb, matchMedia.match}
    * @return {qx.bom.MediaQueryListener}  The mediaquery listener
    */
    match : function(query){
      return new qx.bom.MediaQueryListener(query);
    }
  },

  defer : function(statics){
    qxWeb.$attachStatic({
      matchMedia : statics.match      
    });
  }
});