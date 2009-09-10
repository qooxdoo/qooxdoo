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
 * Abstract renderer for Progressive.  EXPERIMENTAL!  INTERFACE MAY CHANGE.
 */
qx.Class.define("qx.ui.progressive.renderer.Abstract",
{
  type       : "abstract",
  extend     : qx.core.Object,


  members :
  {
    /**
     * Render the provided element in the renderer's unique way.
     *
     * @param state {@link qx.ui.progressive.State}
     *   Data relevant to the current rendering session.
     *
     * @param element {Object}
     *   An object containing at least the following members:
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
     *
     * @return {Void}
     */
    render : function(state, element)
    {
      throw new Error("render() is abstract");
    },

    /**
     * Join this renderer to its {@link qx.ui.progressive.Progressive}.
     *
     * @param progressive {qx.ui.progressive.Progressive}
     *   The Progressive object to which we are being joined.
     *
     * @param name {String}
     *   The name by which the data model will reference this renderer.  This
     *   is important to know in order to access the appropriate member of the
     *   {@link qx.ui.progressive.State}'s renderer array.  That array is
     *   accessed from the renderer by
     *   state.getRendererData()[element.renderer] where element.renderer will
     *   be the name provided here.
     */
    join : function(progressive, name)
    {
      // nothing to do in the default case
    }
  }
});
