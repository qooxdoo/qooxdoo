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
     * Andreas Ecker (ecker)
     * Til Schneider (til132)

************************************************************************ */

/* ************************************************************************

#embed(qx.static/image/blank.gif)
#embed(qx.static/html/blank.html)

************************************************************************ */

/**
 * Container widget for internal frames (iframes).
 *
 * An iframe can display any HTML page inside the widget.
 *
 * @appearance iframe
 */
qx.Class.define("qx.ui.embed.Iframe",
{
  extend : qx.ui.basic.Terminator,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param vSource {String?null} URL of the HTML page displayed in the iframe.
   */
  construct : function(vSource)
  {
    this.base(arguments);

    this.initSelectable();
    this.initTabIndex();
    this.initScrolling();

    if (vSource != null) {
      this.setSource(vSource);
    }
  },


  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events:
  {
    /**
     * The "load" event is fired after the iframe content has successfully been loaded.
     */
    "load" : "qx.event.type.Event"
  },





  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    load : function(obj)
    {
      if (!obj) {
        throw new Error("Could not find iframe which was loaded [A]!");
      }

      // Non-MSHTML browsers will input an DOM event here
      if (obj.currentTarget) {
        obj = obj.currentTarget;
      }

      // Find iframe instance and call onload
      if (obj._QxIframe) {
        obj._QxIframe._onload();
      } else {
        throw new Error("Could not find iframe which was loaded [B]!");
      }
    }
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    tabIndex :
    {
      refine : true,
      init : 0
    },

    selectable :
    {
      refine : true,
      init : false
    },

    appearance :
    {
      refine : true,
      init : "iframe"
    },

    /**
     * Source URL of the iframe.
     */
    source :
    {
      check : "String",
      apply : "_applySource",
      event : "changeSource",
      nullable : true
    },

    /**
     * Name of the iframe.
     */
    frameName :
    {
      check : "String",
      init : "",
      apply : "_applyFrameName"
    },


    /** Whether the iframe's content pane should have scroll bars */
    scrolling :
    {
      check : ["yes", "no", "auto"],
      init  : "auto",
      apply : "_applyScrolling"
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
     * Get the DOM element of the iframe.
     *
     * @type member
     * @return {Element} The DOM element of the iframe.
     */
    getIframeNode : function() {
      return this._iframeNode;
    },


    /**
     * Change the DOM element of the iframe.
     *
     * @type member
     * @param vIframeNode {Element} The new DOM element of the iframe.
     */
    setIframeNode : function(vIframeNode) {
      return this._iframeNode = vIframeNode;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getBlockerNode : function() {
      return this._blockerNode;
    },


    /**
     * TODOC
     *
     * @type member
     * @param vBlockerNode {var} TODOC
     * @return {var} TODOC
     */
    setBlockerNode : function(vBlockerNode) {
      return this._blockerNode = vBlockerNode;
    },




    /*
    ---------------------------------------------------------------------------
      WINDOW & DOCUMENT ACCESS
    ---------------------------------------------------------------------------
    */

    /**
     * Get the DOM window object of the iframe.
     *
     * @type member
     * @return {DOMWindow} The DOM window object of the iframe.
     */
    getContentWindow : function()
    {
      if (this.isCreated()) {
        return qx.html.Iframe.getWindow(this.getIframeNode());
      } else {
        return null;
      }
    },


    /**
     * Get the DOM document object of the iframe.
     *
     * @type member
     * @return {DOMDocument} The DOM document object of the iframe.
     */
    getContentDocument : function()
    {
      if (this.isCreated()) {
        return qx.html.Iframe.getDocument(this.getIframeNode());
      } else {
        return null;
      }
    },


    /**
     * @signature function()
     */
    isLoaded : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function()
      {
        var doc = this.getContentDocument();
        return doc ? doc.readyState == "complete" : false;
      },

      "default" : function() {
        return this._isLoaded;
      }
    }),




    /*
    ---------------------------------------------------------------------------
      METHODS
    ---------------------------------------------------------------------------
    */

    /**
     * Reload the contents of the iframe.
     *
     * @type member
     */
    reload : function()
    {
      if (this.isCreated() && this.getContentWindow())
      {
        this._isLoaded = false;

        var currentSource = this.queryCurrentUrl() || this.getSource();

        try
        {
          /*
          Some gecko users might have an exception here:
            Exception... "Component returned failure code: 0x805e000a
            [nsIDOMLocation.replace]"  nsresult: "0x805e000a (<unknown>)"
          */
          try
          {
            this.getContentWindow().location.replace(currentSource);
          }
          catch(ex)
          {
            this.warn("Could not reload iframe using location.replace()!", ex);
            this.getIframeNode().src = currentSource;
          }
        }
        catch(ex) {
          this.warn("Iframe source could not be set! This may be related to AdBlock Plus Firefox Extension.");
        }
      }
    },


    /**
     * Returns the current (served) URL inside the iframe
     *
     * @return {String} Returns the location href or null (if a query is not possible/allowed)
     */
    queryCurrentUrl : function()
    {
      var doc = this.getContentDocument();

      try
      {
        if (doc && doc.location) {
          return doc.location.href;
        }
      }
      catch(ex) {};

      return null;
    },


    /**
     * Cover the iframe with a transparent blocker div element. This prevents
     * mouse or key events to be handled by the iframe. To release the blocker
     * use {@link #release}.
     *
     * @type member
     */
    block : function()
    {
      if (this._blockerNode) {
        this._blockerNode.style.display = "";
      }
    },


    /**
     * Release the blocker set by {@link #block}.
     *
     * @type member
     */
    release : function()
    {
      if (this._blockerNode) {
        this._blockerNode.style.display = "none";
      }
    },





    /*
    ---------------------------------------------------------------------------
      ELEMENT HELPER
    ---------------------------------------------------------------------------
    */

    /**
     * Creates an template iframe element and sets all required html and style properties.
     *
     * @type static
     * @param vFrameName {String} Name of the iframe.
     */
    _generateIframeElement : function(vFrameName)
    {
      if (qx.core.Variant.isSet("qx.client", "mshtml"))
      {
        var nameStr = vFrameName ? 'name="' + vFrameName + '"' : '';
        var frameEl = qx.ui.embed.Iframe._element = document.createElement('<iframe onload="parent.qx.ui.embed.Iframe.load(this)"' + nameStr + '></iframe>');
      }
      else
      {
        var frameEl = qx.ui.embed.Iframe._element = document.createElement("iframe");

        frameEl.onload = qx.ui.embed.Iframe.load;

        if (vFrameName) {
          frameEl.name = vFrameName;
        }
      }

      frameEl._QxIframe = this;

      frameEl.frameBorder = "0";
      frameEl.frameSpacing = "0";

      frameEl.marginWidth = "0";
      frameEl.marginHeight = "0";

      frameEl.width = "100%";
      frameEl.height = "100%";

      frameEl.hspace = "0";
      frameEl.vspace = "0";

      frameEl.border = "0";
      frameEl.unselectable = "on";
      frameEl.allowTransparency = "true";

      frameEl.style.position = "absolute";
      frameEl.style.top = 0;
      frameEl.style.left = 0;

      return frameEl;
    },


    /**
     * TODOC
     *
     * @type static
     * @return {void}
     */
    _generateBlockerElement : function()
    {
      var blockerEl = qx.ui.embed.Iframe._blocker = document.createElement("div");
      var blockerStyle = blockerEl.style;

      if (qx.core.Variant.isSet("qx.client", "mshtml"))
      {
        // Setting the backgroundImage causes an "insecure elements" warning under SSL
        // blockerStyle.backgroundImage = "url(" + qx.io.Alias.getInstance().resolve("static/image/blank.gif") + ")";

        blockerStyle.backgroundColor = "white";
        blockerStyle.filter = "Alpha(Opacity=0)";
      }

      blockerStyle.position = "absolute";
      blockerStyle.top = 0;
      blockerStyle.left = 0;
      blockerStyle.width = "100%";
      blockerStyle.height = "100%";
      blockerStyle.zIndex = 1;
      blockerStyle.display = "none";

      return blockerEl;
    },






    /*
    ---------------------------------------------------------------------------
      APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applyElement : function(value, old)
    {
      var iframeNode = this.setIframeNode(this._generateIframeElement());
      var blockerNode = this.setBlockerNode(this._generateBlockerElement());

      this._syncSource();
      this._syncScrolling();

      value.appendChild(iframeNode);
      value.appendChild(blockerNode);

      this.base(arguments, value, old);
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _beforeAppear : function()
    {
      this.base(arguments);

      // register to iframe manager as active widget
      qx.ui.embed.IframeManager.getInstance().add(this);
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _beforeDisappear : function()
    {
      this.base(arguments);

      // deregister from iframe manager
      qx.ui.embed.IframeManager.getInstance().remove(this);
    },


    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applySource : function(value, old)
    {
      if (this.isCreated()) {
        this._syncSource();
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _syncSource : function()
    {
      var currentSource = this.getSource();

      if (currentSource == null || currentSource === "") {
        currentSource = qx.io.Alias.getInstance().resolve("static/html/blank.html");
      }

      this._isLoaded = false;

      try
      {
        // the guru says ...
        // it is better to use 'replace' than 'src'-attribute, since 'replace' does not interfer
        // with the history (which is taken care of by the history manager), but there
        // has to be a loaded document
        if (this.getContentWindow())
        {
          /*
          Some gecko users might have an exception here:
            Exception... "Component returned failure code: 0x805e000a
            [nsIDOMLocation.replace]"  nsresult: "0x805e000a (<unknown>)"
          */
          try
          {
            this.getContentWindow().location.replace(currentSource);
          }
          catch(ex)
          {
            this.getIframeNode().src = currentSource;
          }
        }
        else
        {
          this.getIframeNode().src = currentSource;
        }
      }
      catch(ex) {
        this.warn("Iframe source could not be set! This may be related to AdBlock Plus Firefox Extension.");
      }
    },


    // property apply
    _applyScrolling : function(value, old)
    {
      if (this.isCreated()) {
        this._syncScrolling();
      }
    },


    /**
     * Sync scrolling property to the iframe DOM node.
     *
     * @type member
     */
    _syncScrolling : function() {
      this.getIframeNode().setAttribute("scrolling", this.getScrolling());
    },


    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     * @param propName {var} TODOC
     * @param uniqModIds {var} TODOC
     * @throws TODOC
     */
    _applyFrameName : function(value, old, propName, uniqModIds)
    {
      if (this.isCreated()) {
        throw new Error("Not allowed to set frame name after it has been created");
      }
    },




    /*
    ---------------------------------------------------------------------------
      EVENT HANDLER
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _onload : function()
    {
      if (!this._isLoaded)
      {
        this._isLoaded = true;
        this.createDispatchEvent("load");
      }
    },




    /*
    ---------------------------------------------------------------------------
      LOAD STATUS
    ---------------------------------------------------------------------------
    */

    _isLoaded : false
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    if (this._iframeNode)
    {
      this._iframeNode._QxIframe = null;
      this._iframeNode.onload = null;
    }

    this._disposeFields("__onload", "_iframeNode", "_blockerNode");
  }
});
