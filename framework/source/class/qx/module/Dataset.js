/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2013 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Romeo Kenfack (rkenfack)

************************************************************************ */

/**
 * Module for handling of HTML5 data-* attributes
 */
qx.Bootstrap.define("qx.module.Dataset", {	
	
	statics: {

		/**
	   * Sets an HTML "data-*" attribute on each item in the collection
	   * 
	   * @attach {qxWeb}  
	   * @param name {String} Name of the attribute [CamelCase variant]
	   * @param value {var} New value of the attribute
	   * @return {qxWeb} The collection for chaining
	   */
	  setData : function(name, value)
	  {
			
			for (var i = 0; i < this.length; i++)
			{
				qx.bom.element.Dataset.set(this[0],name,value);
			}	
	      
			return this;
	  },
    
	   
	  /**
	   *
	   * Returns the value of the given HTML "data-*" attribute for the first item in the collection
	   * 
	   * @attach {qxWeb}
	   * @param name {String} Name of the attribute [CamelCase variant]
	   * @return {var} The value of the attribute
	   *
	   */
	  getData : function(name)
	  {		  		
	    return qx.bom.element.Dataset.get(this[0],name);
	  },

	  /**
	   * Returns a map containing all the HTML "data-*" attributes of the specified element
	   * 
	   * @attach {qxWeb}
	   * @return {Map} The map containing the "data-*" attributes
	   *
	   */
	  getAllData : function()
	  {
	  	
	  	return qx.bom.element.Dataset.getAll(this[0]); 		    
	  },


	  /**
	   * Remove an HTML "data-*" attribute from the given DOM element
	   *
	   * @attach {qxWeb}	  
	   * @param name {String} Name of the attribute
	   * @return {qxWeb} The collection for chaining
	   */
	  removeData : function(name)
	  {
	    qx.bom.element.Dataset.remove(this[0],name); 
	  	return this;
	  }

	},
	
	defer : function(statics)
	{
		qxWeb.$attach({
			"getData" : statics.getData,
		  "setData" : statics.setData,
		  "removeData" : statics.removeData,
		  "getAllData" : statics.getAllData
		});

	 }
});