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

qx.Class.define("qx.ui.embed.Iframe",
{
  extend : qx.ui.basic.Terminator,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(vSource)
  {
    // **********************************************************************
    //   INIT
    // **********************************************************************
    this.base(arguments);

    this.setSelectable(false);
    this.setTabIndex(0);

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
     * TODOC
     *
     * @type static
     * @param vFrameName {var} TODOC
     * @return {void}
     */
    initIframe : function(vFrameName)
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
    initBlocker : function()
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
    appearance :
    {
      _legacy      : true,
      type         : "string",
      defaultValue : "iframe"
    },




    /*
    ---------------------------------------------------------------------------
      PROPERTIES
    ---------------------------------------------------------------------------
    */

    source :
    {
      _legacy : true,
      type    : "string"
    },

    frameName :
    {
      _legacy : true,
      type    : "string"
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
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getIframeNode : function() {
      return this._iframeNode;
    },


    /**
     * TODOC
     *
     * @type member
     * @param vIframeNode {var} TODOC
     * @return {var} TODOC
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

    getContentWindow : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function()
      {
        if (this.isCreated())
        {
          try {
            return this.getIframeNode().contentWindow;
          } catch(ex) {}
        }

        return null;
      },

      "default" : function()
      {
        var doc = this.getContentDocument();
        return doc ? doc.defaultView : null;
      }
    }),

    getContentDocument : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function()
      {
        var win = this.getContentWindow();

        if (win)
        {
          try {
            return win.document;
          } catch(ex) {}
        }

        return null;
      },

      "default" : function()
      {
        if (this.isCreated())
        {
          try {
            return this.getIframeNode().contentDocument;
          } catch(ex) {}
        }

        return null;
      }
    }),

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
     * TODOC
     *
     * @type member
     * @return {void}
     */
    reload : function() {
      this._applySource();
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    block : function()
    {
      if (this._blockerNode) {
        this._blockerNode.style.display = "";
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
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
        qx.ui.embed.Iframe.initIframe(this.getFrameName());

        // clone proto element and assign iframe
        iframeNode = this.setIframeNode(qx.ui.embed.Iframe._element.cloneNode(true));

        qx.ui.embed.Iframe.initBlocker();

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
