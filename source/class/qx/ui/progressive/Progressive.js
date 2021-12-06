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
 * <i>Progressive</i>.
 *
 * Follow progressive instructions provided by a data model.  A variable
 * number of instructions are executed at one time, after which control is
 * returned briefly to the browser.  This allows browser rendering between
 * batches of instructions, improving the visual experience.
 *
 * <i>Progressive</i> may be used for various purposes.  Two predefined
 * purposes for which "renderers" are provided, are a progressively-rendered
 * table which allows variable row height, and a program load/initialization
 * renderer with progress bar.  (Note that the term "renderer" is interpreted
 * quite broadly.  A renderer needn't actually render; rather it is just some
 * set of activities that takes place at one time, e.g a row of table data or
 * a single widget added to the document or a sending a request to a server,
 * etc.)
 */
qx.Class.define("qx.ui.progressive.Progressive",
{
  extend : qx.ui.container.Composite,


  /**
   * @param structure {qx.ui.progressive.structure.Abstract}
   *   The structure of the Progressive pane.
   */
  construct : function(structure)
  {
    this.base(arguments, new qx.ui.layout.VBox());

    // Create an object in which we'll track renderers that have been added
    this.__renderer = { };

    // Prepare to have our pane structure added to us.
    this.set(
      {
        backgroundColor : "white"
      });

    // If no structure is provided...
    if (! structure)
    {
      // ... then create a default one.
      structure = new qx.ui.progressive.structure.Default();
    }

    // Prepare our pane structure
    this.__structure = structure;
    structure.applyStructure(this);

    // We've not yet done our initial render
    this.__bInitialRenderComplete = false;

    // We're not currently rendering
    this.__bRendering = false;

    // Number of elements available to be rendered.  Useful for progress
    // handlers, e.g. a progress bar or status counter.
    this.__initialNumElements = 0;
  },


  events :
  {
    /**
     * Event fired when rendering begins.
     *
     * The event data is an object with the following members:
     * <dl>
     *   <dt>state</dt>
     *   <dd>
     *     The state object.
     *   </dd>
     *
     *   <dt>initial</dt>
     *     The number of elements that are available to be rendered
     *   <dd>
     *   </dd>
     * </dl>
     */
    "renderStart" : "qx.event.type.Data",

    /**
     * Event fired when rendering ends.  The data is the state object.
     */
    "renderEnd"   : "qx.event.type.Data",

    /**
     * This event is fired after each batch of elements is rendered, and
     * control is about to be yielded to the browser.  This is an appropriate
     * event to listen for, to implement a progress bar.
     *
     * The event data is an object with the following members:
     * <dl>
     *   <dt>initial</dt>
     *   <dd>
     *     The number of elements that were available at the start of this
     *     rendering request.
     *   </dd>
     *
     *   <dt>remaining</dt>
     *   <dd>
     *     The number of elements still remaining to be rendered.
     *   </dd>
     * </dl>
     */
    "progress" : "qx.event.type.Data",

    /**
     * This event is fired after each element is rendered.
     *
     * The event data is an object with the following members:
     * <dl>
     *   <dt>initial</dt>
     *   <dd>
     *     The number of elements that were available at the start of this
     *     rendering request.
     *   </dd>
     *
     *   <dt>remaining</dt>
     *   <dd>
     *     The number of elements still remaining to be rendered.
     *   </dd>
     *
     *   <dt>element</dt>
     *   <dd>
     *     The object, returned by the data model's getNextElement() method,
     *     that was just rendered.
     *   </dd>
     * </dl>
     *
     * Note: Unless batchSize is set to 1 or we happen to be at the end of a
     *       batch, widgets will not be rendered at this time.  Use this event
     *       for programmatically processing rendered elements, but not for
     *       such things as progress bars.  Instead, where only user-visible
     *       changes such as progress bars are being updated, use the
     *       "progress" event.
     */
    "progressDetail" : "qx.event.type.Data"
  },


  properties :
  {
    /** The data model. */
    dataModel :
    {
      check : "qx.ui.progressive.model.Abstract",
      apply : "_applyDataModel"
    },

    /**
     * Number of elements to render at one time.  After this number of
     * elements has been rendered, control will be yielded to the browser
     * allowing the elements to actually be displayed.  A short-interval timer
     * will be set, to regain control to render the next batch of elements.
     */
    batchSize :
    {
      check : "Integer",
      init  : 20
    },

    /**
     * Flush the widget queue after each batch is rendered.  This is
     * particularly relevant for such things as progressive loading, where
     * the whole purpose is to be able to see the loading progressing.
     */
    flushWidgetQueueAfterBatch :
    {
      check : "Boolean",
      init : false
    },

    /**
     * Delay between rendering elements. Zero is normally adequate, but
     * there are times that the user wants more time between rendering
     * some elements.
     */
    interElementTimeout :
    {
      check: "Integer",
      init  : 0
    }
  },


  members :
  {

    __renderer : null,
    __bRendering : null,
    __t1 : null,
    __initialNumElements : null,
    __bInitialRenderComplete : null,
    __structure : null,

    /**
     * Return the structure object
     *
     * @return {qx.ui.progressive.structure.Abstract} The structure object
     */
    getStructure : function()
    {
      return this.__structure;
    },

    /**
     * Add a renderer that can be referenced by the data model.
     *
     * @param name {String}
     *   Name referenced in the data model when this renderer is to be used.
     *
     * @param renderer {qx.ui.progressive.renderer.Abstract}
     *   Renderer object used if the data model references the specified name.
     *
     */
    addRenderer : function(name, renderer)
    {
      this.__renderer[name] = renderer;
      renderer.join(this, name);
    },

    /**
     * Remove a previously added renderer.
     *
     * @param name {String}
     *   Remove the renderer which was assigned this name.
     *
     */
    removeRenderer : function(name)
    {
      if (! this.__renderer[name])
      {
        throw new Error("No existing renderer named " + name);
      }

      delete this.__renderer[name];
    },

    /**
     * Render the elements available from the data model.  Elements are
     * rendered in batches of size {@link #batchSize}.  After each batch of
     * elements are rendered, control is returned temporarily to the
     * browser, so that actual screen updates can take place.  A timer is
     * used to regain control a short while later, in order to render the
     * next batch of element.
     *
     */
    render : function()
    {
      // Prevent render calls while we're already rendering
      if (this.__bRendering)
      {
        return;
      }

      this.__bRendering = true;

      var state = new qx.ui.progressive.State(
        {
          progressive  : this,
          model        : this.getDataModel(),
          pane         : this.__structure.getPane(),
          batchSize    : this.getBatchSize(),
          rendererData : this.__createStateRendererData(),
          userData     : { }
        });

      // Record render start time
      this.__t1 = new Date();

      // Render the first batch of elements.  Subsequent batches will be via
      // timer started from this.__renderElementBatch().
      if (this.__bInitialRenderComplete)
      {
        // Get the starting number of elements
        this.__initialNumElements = state.getModel().getElementCount();

        // Let listeners know we're beginning to render
        this.fireDataEvent("renderStart",
                           {
                             state   : state,
                             initial : this.__initialNumElements
                           });

        // Begin rendering
        this.__renderElementBatch(state);
      }
      else
      {
        // Ensure we leave enough time that 'this' has been rendered, so that
        // this.getContentElement().getDomElement() is valid and has
        // properties.  It's needed by some renderers.
        //
        // FIXME: Why isn't an event listener for "appear" an adequate delay???
        //        (It's done with a timer like this in Table's Pane too.)
        qx.event.Timer.once(function()
                            {
                              this.__initialNumElements =
                                state.getModel().getElementCount();
                              this.fireDataEvent(
                                "renderStart",
                                {
                                  state   : state,
                                  initial : this.__initialNumElements
                                });
                              this.__renderElementBatch(state);
                              this.__bInitialRenderComplete = true;
                            },
                            this, 10);
      }
    },

    /**
     * Called when the dataModel property is changed.
     *
     * @param value {qx.ui.progressive.model.Abstract}
     *   The new data model.
     *
     * @param old {qx.ui.progressive.model.Abstract}
     *   The old data model.
     *
     */
    _applyDataModel : function(value, old)
    {
      if (old)
      {
        // Remove the old event listener
        old.removeListener("dataAvailable", this.__dataAvailable, this);

        // Dispose the old model
        old.dispose();
      }

      // Add an event listener so we know when data is available in the model
      value.addListener("dataAvailable", this.__dataAvailable, this);
    },

    /**
     * Render a batch of elements.  The batch size is determined by the
     * Progressive's batch size at the time that rendering began.  That batch
     * size was copied into the {@link qx.ui.progressive.State} object and is
     * used herein.
     *
     * @param state {qx.ui.progressive.State}
     *   The current state of rendering.
     *
     */
    __renderElementBatch : function(state)
    {
      var current;
      var element;
      var renderer;

      for (var i = state.getBatchSize(); i > 0; i--)
      {
        // Retrieve the current element
        current = state.getModel().getNextElement();
        if (! current)
        {
          // No more elements.  We're done.
          this.debug("Render time: " + (new Date() - this.__t1) + "ms");
          this.__bRendering = false;

          // Notify any progress handlers that are listening
          this.fireDataEvent("renderEnd", state);

          // We don't need our render state any longer
          state.dispose();

          // See ya!
          return;
        }

        // Get the element member
        element = current.element;

        // Get the element's renderer
        renderer = this.__renderer[element.renderer];

        // Render this element
        renderer.render(state, element);

        // Notify any progress detail handlers that are listening
        this.fireDataEvent("progressDetail",
                           {
                             initial   : this.__initialNumElements,
                             remaining : current.remaining,
                             element   : element
                           });
      }

      // Notify any progress handlers that are listening
      this.fireDataEvent("progress",
                         {
                           initial   : this.__initialNumElements,
                           remaining : current.remaining
                         });

      // Flush the widget queue
      if (this.getFlushWidgetQueueAfterBatch())
      {
        qx.ui.core.queue.Manager.flush();
      }

      // Set a timer to render the next element
      qx.event.Timer.once(function()
                          {
                            this.__renderElementBatch(state);
                          },
                          this,
                          this.getInterElementTimeout());
    },


    /**
     * Create the map of empty objects for use by the renderers.
     * @return {Map} renderer data map
     */
    __createStateRendererData : function()
    {
      var rendererData = { };

      for (var name in this.__renderer)
      {
        rendererData[name] = { };
      }

      return rendererData;
    },

    /**
     * Event callback for the "dataAvailable" event.
     *
     * @param e {qx.event.type.Data}
     *   A "dataAvailable" event's data contains the initial number of elements
     *
     */
    __dataAvailable : function(e)
    {
      this.__initialNumElements = e.getData();
      this.render();
    }
  },


  /**
   */
  destruct : function()
  {
    // For each renderer...
    for (var name in this.__renderer)
    {
      // ... dispose it
      this.__renderer[name].dispose();
    }

    // Clean up references
    this.__t1 = this.__renderer = this.__structure = null;
  }
});
