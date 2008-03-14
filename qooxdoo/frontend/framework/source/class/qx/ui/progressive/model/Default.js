/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2008 Derrell LIpman

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Derrell Lipman (derrell)

************************************************************************ */

/* ************************************************************************

#module(ui_progressive)

************************************************************************ */

/**
 * Data Model for Progressive renderer.  EXPERIMENTAL!  INTERFACE MAY CHANGE.
 */
qx.Class.define("qx.ui.progressive.model.Default",
{
  extend     : qx.ui.progressive.model.Abstract,


  /**
   */
  construct : function()
  {
    this.base(arguments);

    this.__elements = [ ];
  },


  members :
  {
    /**
     * Add elements to be progressively renderered.  Each element must be an
     * object which contains at least two members: renderer name and data.
     *
     * @param elems {Array}
     *   An array of elements to be added to the element queue
     */
    addElements : function(elems)
    {
      // Add the new elements to our elements queue.
      this.__elements = this.__elements.concat(elems);

      // Tell Progressive that data is available
      this.createDispatchEvent("dataAvailable");
    },

    /**
     */
    getNextElement : function(id)
    {
      // Do we have any remaining elements?
      if (this.__elements.length > 0)
      {
        // Yup.  Give 'em the first one and remove it from our queue.
        return this.__elements.shift();
      }

      throw "No more data";
    }
  }
});
