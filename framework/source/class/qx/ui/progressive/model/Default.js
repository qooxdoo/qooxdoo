/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2008 Derrell Lipman

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Derrell Lipman (derrell)

************************************************************************ */

/**
 * Data Model for Progressive renderer.
 */
qx.Class.define("qx.ui.progressive.model.Default",
{
  extend     : qx.ui.progressive.model.Abstract,


  construct : function()
  {
    this.base(arguments);

    this.__elements = [ ];
  },


  members :
  {

    __elements : null,

    /**
     * Add elements to be progressively rendered.  Each element must be an
     * object which contains at least two members: renderer (the renderer
     * name) and data.
     *
     * @param elems {Array}
     *   An array of elements to be added to the element queue
     */
    addElements : function(elems)
    {
      // Add the new elements to our elements queue.
      this.__elements = this.__elements.concat(elems);

      // Tell Progressive that data is available
      this.fireDataEvent("dataAvailable", this.__elements.length);
    },

    /**
     * Add a single element to be progressively rendered.  The element must
     * be an object which contains at least two members: renderer (the
     * renderer name) and data.
     *
     * @param elem {var}
     *   An element to be added to the element queue
     */
    addElement : function(elem)
    {
      // Add the new elements to our elements queue.
      this.__elements.push(elem);

      // Tell Progressive that data is available
      this.fireDataEvent("dataAvailable", this.__elements.length);
    },

    // overridden
    getElementCount : function()
    {
      return this.__elements.length;
    },

    // overridden
    getNextElement : function()
    {
      // Do we have any remaining elements?
      if (this.__elements.length > 0)
      {
        // Yup.  Give 'em the first one and remove it from our queue.
        return(
          {
            element   : this.__elements.shift(),
            remaining : this.__elements.length
          });
      }

      return null;
    }
  },

  destruct : function() {
    this.__elements = null;
  }
});
