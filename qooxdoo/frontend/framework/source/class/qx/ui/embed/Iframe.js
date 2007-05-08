/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

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

    this.__onreadystatechange = qx.lang.Function.bind(this._onreadystatechange, this);
    this.__onload = qx.lang.Function.bind(this._onload, this);

    if (vSource != undefined) {
      this.setSource(vSource);
    }
  },




  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events: {

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
    /*
    ---------------------------------------------------------------------------
      INIT
    ---------------------------------------------------------------------------
    */

    /**
     * Creates an template iframe element and sets all required html and style properties.
     *
     * @type static
     * @param vFrameName {String} Name of the iframe.
     */
    __initIframe : function(vFrameName)
    {
      if (qx.ui.embed.Iframe._element && !vFrameName) {
        return;
      }

      if (vFrameName && qx.core.Client.getInstance().isMshtml()) {
        var f = qx.ui.embed.Iframe._element = document.createElement('<iframe name="' + vFrameName + '"></iframe>');
      }
      else
      {
        var f = qx.ui.embed.Iframe._element = document.createElement("iframe");

        if (vFrameName) {
          f.name = vFrameName;
        }
      }

      f.frameBorder = "0";
      f.frameSpacing = "0";

      f.marginWidth = "0";
      f.marginHeight = "0";

      f.width = "100%";
      f.height = "100%";

      f.hspace = "0";
      f.vspace = "0";

      f.border = "0";
      f.scrolling = "auto";
      f.unselectable = "on";
      f.allowTransparency = "true";

      f.style.position = "absolute";
      f.style.top = 0;
      f.style.left = 0;
    },


    /**
     * TODOC
     *
     * @type static
     * @return {void}
     */
    __initBlocker : function()
    {
      if (qx.ui.embed.Iframe._blocker) {
        return;
      }

      var b = qx.ui.embed.Iframe._blocker = document.createElement("div");

      if (qx.core.Variant.isSet("qx.client", "mshtml")) {
        // Setting the backgroundImage causes an "insecure elements" warning under SSL
        // b.style.backgroundImage = "url(" + qx.manager.object.AliasManager.getInstance().resolvePath("static/image/blank.gif") + ")";

        b.style.backgroundColor = "white";
        b.style.filter = "Alpha(Opacity=0)";
      }

      b.style.position = "absolute";
      b.style.top = 0;
      b.style.left = 0;
      b.style.width = "100%";
      b.style.height = "100%";
      b.style.zIndex = 1;
      b.style.display = "none";
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
      init : "",
      apply : "_modifySource",
      event : "changeSource"

    },

    /**
     * Name of the iframe.
     */
    frameName :
    {
      check : "String",
      init : "",
      apply : "_modifyFrameName"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /*
    ---------------------------------------------------------------------------
      INTERNAL PROPERTIES
    ---------------------------------------------------------------------------
    */

    // iframe DOM node
    _iframeNode : null,


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

    // blocker div DOM node
    _blockerNode : null,


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
    reload : function() {
      this._applySource();
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
      MODIFIER
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param propValue {var} Current value
     * @param propOldValue {var} Previous value
     * @param propData {var} Property configuration map
     * @return {Boolean} TODOC
     */
    _modifyElement : function(propValue, propOldValue, propData)
    {
      var iframeNode = this.getIframeNode();

      if (!iframeNode)
      {
        qx.ui.embed.Iframe.__initIframe(this.getFrameName());

        // clone proto element and assign iframe
        iframeNode = this.setIframeNode(qx.ui.embed.Iframe._element.cloneNode(true));

        qx.ui.embed.Iframe.__initBlocker();

        // clone proto blocker
        var blockerNode = this.setBlockerNode(qx.ui.embed.Iframe._blocker.cloneNode(true));

        if (qx.core.Variant.isSet("qx.client", "mshtml")) {
          iframeNode.onreadystatechange = this.__onreadystatechange;
        } else {
          iframeNode.onload = this.__onload;
        }
      }

      this._applySource();

      propValue.appendChild(iframeNode);
      propValue.appendChild(blockerNode);

      // create basic widget
      this.base(arguments, propValue, propOldValue, propData);

      return true;
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
      qx.manager.object.IframeManager.getInstance().add(this);
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
      qx.manager.object.IframeManager.getInstance().remove(this);
    },


    /**
     * TODOC
     *
     * @type member
     * @param propValue {var} Current value
     * @param propOldValue {var} Previous value
     * @param propData {var} Property configuration map
     * @return {Boolean} TODOC
     */
    _modifySource : function(propValue, propOldValue, propData)
    {
      if (this.isCreated()) {
        this._applySource();
      }

      return true;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _applySource : function()
    {
      var currentSource = this.getSource();

      if (qx.util.Validation.isInvalidString(currentSource)) {
        currentSource = qx.manager.object.AliasManager.getInstance().resolvePath("static/image/blank.gif");
      }

      this._isLoaded = false;
      this.getIframeNode().src = currentSource;
    },


    /**
     * TODOC
     *
     * @type member
     * @param propValue {var} Current value
     * @param propOldValue {var} Previous value
     * @param propName {var} TODOC
     * @param uniqModIds {var} TODOC
     * @return {Boolean} TODOC
     * @throws TODOC
     */
    _modifyFrameName : function(propValue, propOldValue, propName, uniqModIds)
    {
      if (this.isCreated()) {
        throw new Error("Not allowed to set frame name after it has been created");
      }

      return true;
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
    _onreadystatechange : function()
    {
      if (this.getIframeNode().readyState == "complete") {
        this.dispatchEvent(new qx.event.type.Event("load"), true);
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _onload : function()
    {
      this._isLoaded = true;
      this.dispatchEvent(new qx.event.type.Event("load"), true);
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
      this._iframeNode.onreadystatechange = null;
      this._iframeNode.onload = null;
    }

    this._disposeFields("__onreadystatechange", "__onload", "_iframeNode");
  }
});
