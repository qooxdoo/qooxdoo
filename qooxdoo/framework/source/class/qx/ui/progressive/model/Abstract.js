/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2008 Derrell Lipman

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
qx.Class.define("qx.ui.progressive.model.Abstract",
{
  type       : "abstract",
  extend     : qx.core.Object,


  events :
  {
    /**
     * This event is fired when new data has been added to the data model.  It
     * typically informs Progressive to begin its rendering process.
     *
     * The event data is an integer: the number of elements now available on
     * the element queue.
     */
    "dataAvailable" : "qx.event.type.Data"
  },


  members :
  {
    /**
     * Get the number of data elements currently available.
     *
     * @return {Integer}
     */
    getElementCount : function()
    {
      throw new Error("getElementCount() is abstract");
    },

    /**
     * Get the next available element from the data model.
     *
     * @return {Object}
     *   The returned object must provide at least the following members:
     *   <dl>
     *     <dt>
     *       renderer</dt>
     *     <dd>
     *       The name of a renderer.  That name is used by {@link
     *       qx.ui.progressive.Progressive} to select the renderer to be used
     *       to render this element.  The name should match one provided to
     *       {@link qx.ui.progressive.Progressive#addRenderer}.
     *     </dd>
     *
     *     <dt>
     *       data
     *     </dt>
     *     <dd>
     *       The data to be passed to the renderer.  The data may be of any
     *       type that the renderer knows how to render.
     *     </dd>
     *   </dl>
     */
    getNextElement : function()
    {
      throw new Error("getNextElement() is abstract");
    }
  }
});
