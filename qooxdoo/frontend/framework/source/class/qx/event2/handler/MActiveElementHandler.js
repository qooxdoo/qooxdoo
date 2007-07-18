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

  construct : function() {

    this.__setActiveElement(document.body);

    this.addListener(document.documentElement, "click", function(e) {
      var node = e.getTarget();
      // find first node with a valid tabindex
      while (node) {
        if (node.tabIndex !== undefined && node.tabIndex >= 0) {
          this.__setActiveElement(node);
          return;
        }
        node = node.parentNode;
      }
      this.__setActiveElement(document.body);
    }, this);

    // in the keyup phase of the keyevent the new focus has already been
    // set by the browser
    this.addListener(document.documentElement, "keyup", function(e) {
      if (e.getKeyIdentifier() == "Tab") {
        this.__setActiveElement(e.getTarget());
      }
    }, this);
  },



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members:
  {

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
    },


    /**
     * Set the active Element
     *
     * @param element {Element} the new active element.
     */
    __setActiveElement : function(element)
    {
      if (this._activeElement == element) {
        return;
      }
      this._activeElement = element;
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