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
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */

/**
 * The Flash widget embeds the HMTL Flash element
 */
qx.Class.define("qx.ui.embed.Flash",
{
  extend : qx.ui.core.Widget,


  /**
   * Constructs a flash widget.
   *
   * @param source {String} The URL of the Flash movie to display.
   * @param id {String?null} The unique id for the Flash movie.
   */
  construct : function(source, id)
  {
    this.base(arguments);

    if (qx.core.Environment.get("qx.debug"))
    {
      qx.core.Assert.assertString(source, "Invalid parameter 'source'.");

      if (id) {
        qx.core.Assert.assertString(id, "Invalid parameter 'id'.");
      }
    }

    this.setSource(source);

    if (id) {
      this.setId(id);
    } else {
      this.setId("flash" + this.toHashCode());
    }

    //init properties
    this.initQuality();
    this.initWmode();
    this.initAllowScriptAccess();
    this.initLiveConnect();

    // Creates the Flash DOM element (movie) on appear,
    // because otherwise IE 7 and higher blocks the
    // ExternelInterface from Flash.
    this.addListenerOnce("appear", function()
    {
      this._checkLoading();
      this.getContentElement().createFlash();
    }, this);
  },


  events :
  {
    /**
     * Fired when the flash object still is loading.
     *
     * The loading action can be prevented by calling
     * {@link qx.event.type.Event#preventDefault} on the event object
     */
    "loading" : "qx.event.type.Event",

    /**
     * Fired after the flash object has been loaded.
     *
     * The loaded action can be prevented by calling
     * {@link qx.event.type.Event#preventDefault} on the event object
     */
    "loaded" : "qx.event.type.Event",

    /**
     * Fired after the flash object has got a timeout.
     *
     * The timeout action can be prevented by calling
     * {@link qx.event.type.Event#preventDefault} on the event object
     */
    "timeout" : "qx.event.type.Event"
  },


  properties :
  {
    /**
     * The URL of the Flash movie.
     */
    source :
    {
      check : "String",
      apply : "_applySource"
    },

    /**
     * The unique Flash movie id.
     */
    id :
    {
      check : "String",
      apply : "_applyId"
    },

    /**
     * Set the quality attribute for the Flash movie.
     */
    quality :
    {
      check : ["low", "autolow", "autohigh", "medium", "high", "best"],
      init : "best",
      nullable : true,
      apply : "_applyQuality"
    },

    /**
     * Set the scale attribute for the Flash movie.
     */
    scale :
    {
      check : ["showall", "noborder", "exactfit", "noscale"],
      nullable : true,
      apply : "_applyScale"
    },

    /**
     * Set the wmode attribute for the Flash movie.
     */
    wmode :
    {
      check : ["window", "opaque", "transparent"],
      init : "opaque",
      nullable : true,
      apply : "_applyWmode"
    },

    /**
     * Set the play attribute for the Flash movie.
     */
    play :
    {
      check : "Boolean",
      nullable : true,
      apply : "_applyPlay"
    },

    /**
     * Set the loop attribute for the Flash movie.
     */
    loop :
    {
      check : "Boolean",
      nullable : true,
      apply : "_applyLoop"
    },

    /**
     * Set the mayscript attribute for the Flash movie.
     */
    mayScript :
    {
      check : "Boolean",
      nullable : false,
      apply : "_applyMayScript"
    },

    /**
     * Set the menu attribute for the Flash movie.
     */
    menu :
    {
      check : "Boolean",
      nullable : true,
      apply : "_applyMenu"
    },

    /**
     * Set allow script access
     **/
    allowScriptAccess :
    {
      check : ["sameDomain", "always", "never"],
      init : "sameDomain",
      nullable : true,
      apply : "_applyAllowScriptAccess"
    },

    /**
     * Enable/disable live connection
     **/
    liveConnect :
    {
      check : "Boolean",
      init : true,
      nullable : true,
      apply : "_applyLiveConnect"
    },

    /**
     * Set the 'FlashVars' to pass variables to the Flash movie.
     */
    variables :
    {
      init : {},
      check : "Map",
      apply : "_applyVariables"
    },

    /**
     * A timeout when trying to load the flash source.
     */
    loadTimeout :
    {
      check : "Integer",
      init : 10000
    }
  },


  members :
  {
    /** {Integer} The time stamp when the loading begins. */
    __time : null,


    /*
    ---------------------------------------------------------------------------
      PUBLIC WIDGET API
    ---------------------------------------------------------------------------
    */

    /**
     * Returns the DOM element of the Flash movie.
     *
     * Note: If you call the method before the widget is rendered, it will
     * always return <code>null</code>. Therefore call the method after
     * the {@link #appear} event is fired.
     *
     * @return {Element|null} The DOM element of the Flash movie.
     */
    getFlashElement : function()
    {
      var element = this.getContentElement();

      if (element) {
        return element.getFlashElement();
      } else {
        return null;
      }
    },


    /**
     * Checks if the movie is loaded.
     *
     * @return {Boolean} <code>true</code> When the movie is completely loaded,
     *   otherwise <code>false</code>.
     */
    isLoaded : function() {
      return this.getPercentLoaded() === 100;
    },


    /**
     * Returns the current loaded state from the Flash movie.
     *
     * @return {Integer} The loaded percent value.
     */
    getPercentLoaded : function()
    {
      var flashFE = this.getFlashElement();

      // First make sure the movie is defined and has received a non-zero object id.
      if(typeof(flashFE) != "undefined" && flashFE != null)
      {
        try {
          return flashFE.PercentLoaded();
        }
        catch(err)
        {
          // Not an accessible function yet.
          return 0;
        }
      }
      else {
        return 0;
      }
    },


    // overridden
    _createContentElement : function() {
      return new qx.html.Flash();
    },

    /**
     * Checks the current loaded state and fires one of the defined events:
     * {@link #loading}, {@link #loaded} or {@link #timeout}.
     *
     * Note the {@link #timeout} event is fired when the check reached the
     * defined {@link #loadTimeout}.
     */
    _checkLoading : function()
    {
      var source = this.getSource();
      if(source != "" && source != null && source != "undefined")
      {
        if(!this.isLoaded())
        {
          if(!this.__time) {
            this.__time = new Date().getTime();
          }

          var timeDiff = new Date().getTime() - this.__time;

          if(this.getLoadTimeout() > timeDiff)
          {
            var timer = qx.util.TimerManager.getInstance();
            timer.start(this._checkLoading, 0, this, null, 10);

            this.fireEvent("loading");
          }
          else
          {
            if (qx.core.Environment.get("qx.debug")) {
              this.debug("Timeout after: " + timeDiff);
            }
            this.fireEvent("timeout");
            this.__time = null;
          }
        }
        else
        {
          this.fireEvent("loaded");
          this.__time = null;
        }
      }
    },


    /*
    ---------------------------------------------------------------------------
     APPLY METHODS
    ---------------------------------------------------------------------------
    */


    // property apply
    _applySource : function(value, old)
    {
      var source = qx.util.ResourceManager.getInstance().toUri(value);
      this.getContentElement().setSource(source);
      qx.ui.core.queue.Layout.add(this);
    },

    // property apply
    _applyId : function(value, old)
    {
      this.getContentElement().setId(value);
      qx.ui.core.queue.Layout.add(this);
    },

    // property apply
    _applyVariables : function(value, old)
    {
      this.getContentElement().setVariables(value);
      qx.ui.core.queue.Layout.add(this);
    },

    // property apply
    _applyMayScript : function (value, old)
    {
      this.getContentElement().setAttribute("mayscript", value ? "" : false);
      qx.ui.core.queue.Layout.add(this);
    },

    // property apply
    _applyQuality : function(value, old) {
      this.__flashParamHelper("quality", value);
    },

    // property apply
    _applyScale : function(value, old) {
      this.__flashParamHelper("scale", value);
    },

    // property apply
    _applyWmode : function(value, old) {
      this.__flashParamHelper("wmode", value);
    },

    // property apply
    _applyPlay : function(value, old) {
      this.__flashParamHelper("play", value);
    },

    // property apply
    _applyLoop : function(value, old) {
      this.__flashParamHelper("loop", value);
    },

    // property apply
    _applyMenu : function(value, old) {
      this.__flashParamHelper("menu", value);
    },

    // property apply
    _applyAllowScriptAccess : function(value, old) {
      this.__flashParamHelper("allowScriptAccess", value);
    },

    // property apply
    _applyLiveConnect : function(value, old) {
      this.__flashParamHelper("swLiveConnect", value);
    },

    /*
    ---------------------------------------------------------------------------
     HELPER METHODS
    ---------------------------------------------------------------------------
    */

    /**
     * Set the attribute for the Flash DOM element.
     *
     * @param key {String} Flash Player attribute name.
     * @param value {String?null} The value for the attribute, <code>null</code>
     *    if the attribut should be removed from the DOM element.
     */
    __flashParamHelper : function(key, value)
    {
      this.getContentElement().setParam(key, value);
      qx.ui.core.queue.Layout.add(this);
    }
  }
});
