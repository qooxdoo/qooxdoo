/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)

************************************************************************ */

/**
 * This is the root element for a set of {@link qx.html.Element}s.
 *
 * To make other elements visible these elements must be inserted
 * into an root element at any level.
 *
 * A root element uses an existing DOM element where is assumed that
 * this element is always visible. In the easiest case, the root element
 * is identical to the document's body.
 */
qx.Class.define("qx.html.Root",
{
  extend : qx.html.Element,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * Creates a root element
   *
   * @param elem {Element?null} DOM element to use
   */
  construct : function(elem)
  {
    this.base(arguments);

    if (elem != null) {
      this.useElement(elem);
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * Sets the element to an already existing node. It will be
     * assumed that this DOM element is already visible e.g.
     * like a normal displayed element in the document's body.
     *
     * @param elem {Element} the dom element to set
     * @throws {Error} if the element is assigned again
     */
    useElement : function(elem)
    {
      // Base call
      this.base(arguments, elem);

      // Mark as root
      this.setRoot(true);

      // Register for syncronization
      qx.html.Element._modified[this.$$hash] = this;
    }
  }
});
