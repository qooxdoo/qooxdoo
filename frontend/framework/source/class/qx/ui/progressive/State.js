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
 * State of renderering by Progressive.  EXPERIMENTAL!  INTERFACE MAY CHANGE.
 */
qx.Class.define("qx.ui.progressive.State",
{
  extend     : qx.core.Object,


  construct : function(initialState)
  {
    this.base(arguments);

    this.setProgressive(initialState.progressive);
    this.setModel(initialState.model);
    this.setPane(initialState.pane);
    this.setBatchSize(initialState.batchSize);
    this.setRendererData(initialState.rendererData);
    this.setUserData(initialState.userData);
  },


  properties :
  {
    /**
     * The {@link qx.ui.progressive.Progressive} with which this {@link
     * #State} is associated. This property should be treated as read-only.
     */
    progressive    : { nullable : true },

    /**
     * The data model being used. This property should be treated as
     * read-only.
     */
    model          : { nullable : true },

    /**
     * The widget in which the element data should be rendered.  This property
     * should be treated as read-only.
     */
    pane           : { nullable : true },

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
     *
     * IMPORTANT NOTE:  It is the renderer's responsibility to clean up its
     *                  own mess.  If the renderer places data here, it should
     *                  also add an event listener for "renderEnd" so that it
     *                  can clean up.
     */
    rendererData   : { },

    /**
     * User data.  This is useful, for example, by communication between
     * the renderStart event listener and the renderers.
     *
     * IMPORTANT NOTE:  It is the user's responsibility to clean up his
     *                  own mess.  If you place data here, you should
     *                  also add an event listener for "renderEnd" to
     *                  dispose any objects you placed here.
     */
    userData       : { }
  },


  destruct : function()
  {
    // Remove references to other objects
    this.setProgressive(null);
    this.setModel(null);
    this.setPane(null);
  }
});
