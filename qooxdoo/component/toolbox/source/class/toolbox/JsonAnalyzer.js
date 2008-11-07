/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Yuecel Beser (ybeser)

************************************************************************ */

/* ************************************************************************
#asset(toolbox/*)

************************************************************************ */

/**
 * This is the main application class of your custom application "HelloWorld"
 */
qx.Class.define("toolbox.JsonAnalyzer",
{ 
	extend : qx.core.Object,
	
	
  members :
  {

  	__keyContainer : new Array(),
    __keyContentContainer : new Array(),
    __stringContainer : new Array(),
    __wholeContentContainer : new Array(),
    __contentContainer : new Array(),

  	
    __map :
    {
      "string"    : "__analyzeString",
      "object"    : "__analyzeObject"
    },
    
    analyze : function(obj) {
    	// Start convertion
    	obj = eval("( " + obj + " )");

      var result = this[this.__map[typeof obj]](obj);
      if (typeof result != "string") {
        result = null;
      }

      // Debugging support
      if (qx.core.Setting.get("qx.jsonDebugging")) {
        qx.log.Logger.debug(this, "JSON request: " + result);
      }
    },
    
    
    __analyzeString : function(incoming) {
    	if(parseInt(incoming).toString() == "NaN") {
         alert(incoming);
      } 
    },
    
    __analyzeObject : function(incoming) {
    	//alert("__analyzeObject wurde aufgerufen");
    	for(var key in incoming){
    	   if(parseInt(key).toString() == "NaN") {
    	     
    	     this.__keyContainer.push(key);
    	     this.__wholeContentContainer.push(key + " " + incoming[key] + "\n");
    	     if(typeof incoming[key] != "object") {
    	       this.__contentContainer.push(incoming[key]);
    	     }
    	   }
    	   var resultKey = this[this.__map[typeof key]](key);
    	   //var resultContent = this[this.__map[typeof incoming[key]]](incoming[key]); 
    	}
    },
    
    
     resetAnalyzer : function () {
     	this.__keyContainer.splice(0, this.__keyContainer.length);
      this.__contentContainer.splice(0, this.__contentContainer.length);
      this.__wholeContentContainer.splice(0, this.__wholeContentContainer.length);
     },
     
     getKeyContainer : function() {
     	return this.__keyContainer;
     },
     
     getContentContainer : function() {
     	return this.__contentContainer;
     },
     
     getWholeContentContainer : function() {
     	return this.__wholeContentContainer;
     }
    

    
    
    
    
    
    


    
  
  }

});