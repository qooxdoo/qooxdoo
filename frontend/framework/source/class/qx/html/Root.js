/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)

************************************************************************ */

/* ************************************************************************

#module(html)

************************************************************************ */

qx.Class.define("qx.html.Root",
{
  extend : qx.html.Element,
  
  construct : function(elem)
  {
    this.base(arguments);
    
    if (elem != null) {
      this.useElement(elem);
    }
  },
  
  members : 
  {
    /**
     * Sets the element to an already existing node. It will be
     * assumed that this DOM element is already visible e.g.
     * like a normal displayed element in the document's body.
     *
     * @type member
     * @param elem {Element} the dom element to set
     * @return {void}
     * @throws an exception if the element is assigned again
     */    
    useElement : function(elem)
    {
      if (this._element) {
        throw new Error("Elements could not be replaced!");
      }
      
      // Store reference to "this"
      elem.QxElement = this;

      // Initialize based on given element
      this._element = elem;
      
      // Mark as root
      this._root = true;
      
      // Mark as new
      this._new = true;
      
      // Register for syncronization
      if (this._included) {
        this._scheduleSync();
      }      
    }   
  }  
});
