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
qx.Class.define("qx.ui.progressive.State",
{
  extend     : qx.core.Object,


  /**
   */
    construct : function(progressive,
                         model,
                         pane,
                         batchSize,
                         rendererData,
                         userData)
  {
    this.base(arguments);

    this.setProgressive(progressive);
    this.setModel(model);
    this.setPane(pane);
    this.setBatchSize(batchSize);
    this.setRendererData(rendererData);
    this.setUserData(userData || { });
  },


  properties :
  {
    /**
     * The {qx.ui.progressive.Progressive} with which this {#State} is
     * associated. This property should be treated as read-only.
     */
    progressive    : { },

    /**
     * The data model being used. This property should be treated as
     * read-only.
     */
    model          : { },

    /**
     * The widget in which the element data should be rendered.  This property
     * should be treated as read-only.
     */
    pane           : { },

    /**
     * How many elements are rendered at a time, before yielding to the
     * browser.  This property should be treated as read-only.
     */
    batchSize      : { },

    /**
     * Add a place for renderers' private data.  If multiple renderers are
     * being used, each renderer should place its own private data in the the
     * state object area reserved for that renderer's use:
     * state.getRendererData()[element.renderer].  This property should be
     * accessed only by renderers, and all elements of the array other than a
     * renderer's own element should be treated as read-only.
     */
    rendererData   : { },

    /**
     * User data.  This is useful, for example, by communication between
     * the renderStart event listener and the renderers.
     */
    userData       : { }
  }
});
