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
 * Progressive Renderer.  EXPERIMENTAL!  INTERFACE MAY CHANGE.
 */
qx.Class.define("qx.ui.progressive.Progressive",
{
  extend : qx.ui.layout.VerticalBoxLayout,


  /**
   */
  construct : function()
  {
    this.base(arguments);

    // Create an object in which we'll track renderers that have been added
    this._renderer = { };

    // We want to use a Vertical Box Layout for our container
    this.set(
      {
        left            : 20,
        top             : 20,
        right           : 20,
        bottom          : 20,
        spacing         : 0,
        border          : new qx.ui.core.Border(1, "solid", "#dddddd"),
        overflow        : "scrollY",
        backgroundColor : "white"
      });

    // Initialize properties
    this.setContainer(this);
  },


  events :
  {
    /**
     */
  },


  statics :
  {
    /**
     */
  },


  properties :
  {
    /** The data model. */
    dataModel :
    {
      apply : "_applyDataModel"
    },

    /** Container object in which renderers render their data */
    container :
    {
      apply : "_applyContainer"
    },

    /**
     * Number of elements to render at one time.  After this number of
     * elements has been rendered, control will be yielded to the browser
     * allowing the elements to actually be displayed.  A short-interval
     * timer will be set to cause remaining of the next batch of elements.
     */
    batchSize :
    {
      init  : 20
    }
  },


  members :
  {
    /**
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    addRenderer : function(name, renderer)
    {
      this._renderer[name] = renderer;
    },

    removeRenderer : function(name)
    {
      delete this._renderer[name];
    },

    __renderElementBatch : function(state)
    {
      // Prefetch the next batch
      state.model.preFetch(state.current + state.batchSize, state.batchSize);

      for (var i = state.batchSize; i > 0; i--)
      {
        // Retrieve the current element
        element = state.model.getElement(state.current);

        // Are we done?
        if (! element)
        {
          // Yup.
t2 = new Date();
this.debug("Render time: ", t2 - t1);
          return;
        }

        // Get the element's renderer
        renderer = this._renderer[element.renderer];

        // Render this element
        renderer.render(state, element);

        // Increment to the next element
        ++state.current;
      }

      // Set a timer to render the next element
      qx.client.Timer.once(function()
                           {
                             this.__renderElementBatch(state);
                           },
                           this, 0);
    },

    __createStateRendererData : function()
    {
      var rendererData = { };

      for (var name in this._renderer)
      {
        rendererData[name] = { };
      }

      return rendererData;
    },

    render : function()
    {
      var element;
      var renderer;
      var state =
      {
        model     : this.getDataModel(),
        container : this.getContainer(),
        batchSize : this.getBatchSize(),
        current   : 0,

        // Add a place for renderers' private data.  Each renderer should
        // place its own private data in the the state object area reserved
        // for that renderer's use: state.rendererData[element.renderer]
        rendererData   : this.__createStateRendererData()
      };

t1 = new Date();

      // Render the first batch of elements.  Subsequent batches will be via
      // timer timeout.
      this.__renderElementBatch(state);
    },

    _applyDataModel : function(value, old)
    {
    },

    _applyContainer : function(value, old)
    {
      if (old && old !== this)
      {
        this.remove(old);
        old.dispose();
      }

      this.add(value);
    }
  },


  /**
   */
  destruct : function()
  {
    this._disposeFields("_renderer");
  }
});
