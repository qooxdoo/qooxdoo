 /* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * Support document.activeElement (IE's focus model)
 *
 * If added to {@link qx.event2.Manager} it provides the method
 * {@link #getActiveElement}, which is a cross browser implementation
 * of the IE's <code>document.activeElement</code>.
 *
 * <ul>
 *   <li>Original Microsoft documentation: http://msdn2.microsoft.com/en-us/library/ms533065.aspx</li>
 *   <li>Firefox bug report regarding activeElement: https://bugzilla.mozilla.org/show_bug.cgi?id=337631</li>
 *   <li>Draft spec: http://whatwg.org/specs/web-apps/current-work/#the-documentfocus</li>
 * </ul>
 */
qx.Mixin.define("qx.event2.handler.MActiveElementHandler",
{
  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function() 
  {
    this._activeElement = document.body;

    this.addListener(document.documentElement, "click", this.__onClick, this);
    this.addListener(document.documentElement, "keyup", this.__onKeyUp, this);
  },





  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members:
  {
    /**
     * onclick handler
     *
     * @type member
     * @param e {Event}
     */
    __onClick : function(e) 
    {
      var node = e.getTarget();
      
      // find first node with a valid tabindex
      while (node) 
      {
        if (node.tabIndex !== undefined && node.tabIndex >= 0) 
        {
          this._activeElement = node;
          return;
        }
        node = node.parentNode;
      }
      
      this._activeElement = document.body;
    },
    
    
    /**
     * onkeyup handler
     * 
     * in the keyup phase of the keyevent the new focus has already been
     * set by the browser
     *
     * @type member
     * @param e {Event}
     */
    __onKeyUp : function(e)
    {
      if (e.getKeyIdentifier() == "Tab") {
        this._activeElement = e.getTarget();
      }      
    },
    
    
    /**
     * Get the DOM element which currently has the focus. Keyborad events are
     * dispatched on this element by the browser. This function does only return
     * the active element of the current document. It will not return the active
     * element inside a sub documents (i.g. an IFrame).
     *
     * @return {Element} The current active element.
     */
    getActiveElement: function() {
      return this._activeElement;
    }
  },



  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this.disposeFields("_activeElement");
  }
});