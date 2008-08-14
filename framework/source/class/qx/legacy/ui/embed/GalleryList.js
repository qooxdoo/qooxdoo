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

************************************************************************ */

/* ************************************************************************

#asset(qx/static/blank.gif)

************************************************************************ */


qx.Class.define("qx.legacy.ui.embed.GalleryList",
{
  extend : qx.legacy.ui.basic.Terminator,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(galleryList)
  {
    this.base(arguments);

    this._blank = qx.util.ResourceManager.toUri("qx/static/blank.gif");
    this._list = galleryList;
    this._listSize = galleryList.length;
    this._processedImages = 0;

    this.initOverflow();

    this.setHtmlProperty("className", "qx_ui_embed_GalleryList");

    this._manager = new qx.legacy.ui.selection.DomSelectionManager(this);

    this.addListener("mousedown", this._onmousedown);
    this.addListener("mouseup", this._onmouseup);
    this.addListener("mousemove", this._onmousemove);
    this.addListener("click", this._onclick);
    this.addListener("dblclick", this._ondblclick);
    this.addListener("keypress", this._onKeyPress);
  },




  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events: {
    /**
     * Dispatched just before the tooltip is shown. This makes it possible to
     * control which tooltip is shown. The data property holds a reference to
     * the hovered item.
     */
    "beforeToolTipAppear"     : "qx.event.type.Data",
    "loadComplete"            : "qx.event.type.Event"
  },



  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /**
     * TODOC
     *
     * @return {void}
     */
    imageOnLoad : function()
    {
      this.gallery.imageOnComplete();
      this.gallery = null;
      this.onload = null;
      this.onerror = null;
    },


    /**
     * TODOC
     *
     * @return {void}
     */
    imageOnError : function()
    {
      this.gallery.imageOnComplete();
      this.gallery = null;
      this.onload = null;
      this.onerror = null;
    }
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    overflow :
    {
      refine : true,
      init : "auto"
    },

    thumbMaxWidth :
    {
      check : "Integer",
      init : 60
    },

    thumbMaxHeight :
    {
      check : "Integer",
      init : 60
    },

    decorHeight :
    {
      check : "Integer",
      init : 40
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
      ELEMENT HANDLING
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @return {void}
     */
    _applyElementData : function() {
      this.getElement().appendChild(this.createView());
    },




    /*
    ---------------------------------------------------------------------------
      UTILITIES
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @return {var} TODOC
     */
    getManager : function() {
      return this._manager;
    },


    /**
     * TODOC
     *
     * @param vGalleryList {var} TODOC
     * @return {void}
     */
    update : function(vGalleryList)
    {
      this._manager.deselectAll();

      this._list = vGalleryList;

      var el = this.getElement();
      el.replaceChild(this.createView(), el.firstChild);
    },


    /**
     * TODOC
     *
     * @return {void}
     */
    removeAll : function()
    {
      this._manager.deselectAll();
      this.getElement().innerHTML = "";
    },


    /**
     * TODOC
     *
     * @param vId {var} TODOC
     * @return {var} TODOC
     */
    getPositionById : function(vId)
    {
      for (var i=0, a=this._list, l=a.length; i<l; i++)
      {
        if (a[i].id == vId) {
          return i;
        }
      }

      return -1;
    },


    /**
     * TODOC
     *
     * @param vId {var} TODOC
     * @return {var} TODOC
     */
    getEntryById : function(vId) {
      return this.getEntryByPosition(this.getPositionById(vId));
    },


    /**
     * TODOC
     *
     * @param vId {var} TODOC
     * @return {var} TODOC
     */
    getNodeById : function(vId) {
      return this.getNodeByPosition(this.getPositionById(vId));
    },


    /**
     * TODOC
     *
     * @param vPosition {var} TODOC
     * @return {var} TODOC
     */
    getEntryByPosition : function(vPosition) {
      return vPosition == -1 ? null : this._list[vPosition];
    },


    /**
     * TODOC
     *
     * @param vPosition {var} TODOC
     * @return {var} TODOC
     */
    getNodeByPosition : function(vPosition) {
      return vPosition == -1 ? null : this._frame.childNodes[vPosition];
    },


    /**
     * TODOC
     *
     * @param vNode {var} TODOC
     * @return {var} TODOC
     */
    getEntryByNode : function(vNode) {
      return this.getEntryById(vNode.id);
    },


    /*
    ---------------------------------------------------------------------------
      EVENT HANDLER
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @param e {Event} TODOC
     * @return {void}
     */
    _onmousedown : function(e)
    {
      var vItem = this.getListItemTarget(e.getDomTarget());

      if (vItem) {
        this._manager.handleMouseDown(vItem, e);
      }
    },


    /**
     * TODOC
     *
     * @param e {Event} TODOC
     * @return {void}
     */
    _onmouseup : function(e)
    {
      var vItem = this.getListItemTarget(e.getDomTarget());

      if (vItem) {
        this._manager.handleMouseUp(vItem, e);
      }
    },


    /**
     * TODOC
     *
     * @param e {Event} TODOC
     * @return {void}
     */
    _onclick : function(e)
    {
      var vItem = this.getListItemTarget(e.getDomTarget());

      if (vItem) {
        this._manager.handleClick(vItem, e);
      }
    },


    /**
     * TODOC
     *
     * @param e {Event} TODOC
     * @return {void}
     */
    _ondblclick : function(e)
    {
      var vItem = this.getListItemTarget(e.getDomTarget());

      if (vItem) {
        this._manager.handleDblClick(vItem, e);
      }
    },


    /**
     * TODOC
     *
     * @param e {Event} TODOC
     * @return {void}
     */
    _onmousemove : function(e)
    {
      if (!qx.Class.isDefined("qx.legacy.ui.popup.ToolTipManager")) {
        return;
      }

      var vItem = this.getListItemTarget(e.getDomTarget());

      if (vItem == this._lastItem) {
        return;
      }

      if (this._lastItem)
      {
        var vEventObject = new qx.legacy.event.type.MouseEvent("mouseout", e, false, this._lastItem);
        qx.legacy.ui.popup.ToolTipManager.getInstance().handleMouseOut(vEventObject);
        vEventObject.dispose();
      }

      if (vItem)
      {
        this.fireDataEvent("beforeToolTipAppear", vItem);

        if (!this.getToolTip()) {
          return;
        }

        var vEventObject = new qx.legacy.event.type.MouseEvent("mouseout", e, false, vItem);
        qx.legacy.ui.popup.ToolTipManager.getInstance().handleMouseOver(vEventObject);
        vEventObject.dispose();

        this.setToolTip(null);
      }

      this._lastItem = vItem;
    },


    /**
     * TODOC
     *
     * @param e {Event} TODOC
     * @return {void}
     */
    _onKeyPress : function(e) {
      this._manager.handleKeyPress(e);
    },


    /**
     * TODOC
     *
     * @param dt {var} TODOC
     * @return {null | var} TODOC
     */
    getListItemTarget : function(dt)
    {
      while (dt.className.indexOf("galleryCell") == -1 && dt.tagName.toLowerCase() != "body") {
        dt = dt.parentNode;
      }

      if (dt.tagName.toLowerCase() == "body") {
        return null;
      }

      return dt;
    },




    /*
    ---------------------------------------------------------------------------
      SCROLL INTO VIEW
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @param vItem {var} TODOC
     * @return {void}
     */
    scrollItemIntoView : function(vItem)
    {
      this.scrollItemIntoViewX(vItem);
      this.scrollItemIntoViewY(vItem);
    },


    /**
     * TODOC
     *
     * @param vItem {var} TODOC
     * @return {void}
     */
    scrollItemIntoViewX : function(vItem) {
      qx.legacy.html.ScrollIntoView.scrollX(vItem);
    },


    /**
     * TODOC
     *
     * @param vItem {var} TODOC
     * @return {void}
     */
    scrollItemIntoViewY : function(vItem) {
      qx.legacy.html.ScrollIntoView.scrollY(vItem);
    },




    /*
    ---------------------------------------------------------------------------
      SELECTION MANAGER API
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @return {var} TODOC
     */
    getItems : function() {
      return this._frame.childNodes;
    },


    /**
     * TODOC
     *
     * @return {var} TODOC
     */
    getFirstChild : function() {
      return this._frame.childNodes[0];
    },


    /**
     * TODOC
     *
     * @return {var} TODOC
     */
    getLastChild : function() {
      return this._frame.childNodes[this._frame.childNodes.length - 1];
    },




    /*
    ---------------------------------------------------------------------------
      CREATE VIEW
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @return {var} TODOC
     */
    createView : function()
    {
      var protoCell = this.createProtoCell(this.getThumbMaxHeight());
      var frame = this._frame = document.createElement("div");

      this._frame.className = "galleryFrame clearfix";

      var cframe, cnode;

      for (var i=0, a=this._list, l=a.length, d; i<l; i++)
      {
        d = a[i];

        cframe = protoCell.cloneNode(true);

        cframe.id = d.id;
        cframe.pos = i;

        cnode = cframe.childNodes[0];
        cnode.firstChild.nodeValue = d.number;

        cnode = cframe.childNodes[1].firstChild;
        this.createImageCell(cnode, d);

        cnode = cframe.childNodes[2].firstChild;
        cnode.firstChild.nodeValue = d.title;

        cnode = cframe.childNodes[2].lastChild;
        cnode.firstChild.nodeValue = d.comment;

        frame.appendChild(cframe);
      }

      return frame;
    },


    /**
     * TODOC
     *
     * @param inode {var} TODOC
     * @param d {var} TODOC
     * @return {void}
     */
    createImageCell : function(inode, d)
    {
      if (this.hasListeners("loadComplete"))
      {
        inode.onload = qx.legacy.ui.embed.GalleryList.imageOnLoad;
        inode.onerror = qx.legacy.ui.embed.GalleryList.imageOnError;
        inode.gallery = this;
      }

      inode.width = d.thumbWidth;
      inode.height = d.thumbHeight;

      if (qx.core.Variant.isSet("qx.client", "mshtml")) {
        inode.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + d.src + "',sizingMethod='scale')";
      } else {
        inode.src = d.src;
      }

      inode.style.marginLeft = inode.style.marginRight = Math.floor((this.getThumbMaxWidth() - d.thumbWidth) / 2) + "px";
      inode.style.marginTop = inode.style.marginBottom = Math.floor((this.getThumbMaxHeight() - d.thumbHeight) / 2) + "px";
    },


    /**
     * TODOC
     *
     * @param tHeight {var} TODOC
     * @return {var} TODOC
     */
    createProtoCell : function(tHeight)
    {
      var frame = document.createElement("div");
      frame.className = "galleryCell";
      frame.unselectable = "on";
      frame.style.height = (tHeight + 2) + "px";

      var number = document.createElement("div");
      number.className = "galleryNumber";
      number.unselectable = "on";
      var ntext = document.createTextNode("-");
      number.appendChild(ntext);

      var imageContainer = document.createElement("div");
      imageContainer.className = "galleryImageContainer";
      imageContainer.unselectable = "on";

      var image = new Image();
      image.src = this._blank;

      imageContainer.appendChild(image);

      var text = document.createElement("div");
      text.className = "galleryText";
      text.unselectable = "on";
      text.style.width = (this.getWidth() - 100 - this.getThumbMaxWidth()) + "px";

      var title = document.createElement("h3");
      var ttext = document.createTextNode("-");
      title.appendChild(ttext);
      title.unselectable = "on";
      text.appendChild(title);

      var comment = document.createElement("p");
      var ctext = document.createTextNode("-");
      comment.appendChild(ctext);
      comment.unselectable = "on";
      text.appendChild(comment);

      frame.appendChild(number);
      frame.appendChild(imageContainer);
      frame.appendChild(text);

      return frame;
    },




    /*
    ---------------------------------------------------------------------------
      PRELOADING
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @return {void}
     */
    imageOnComplete : function()
    {
      this._processedImages++;

      if (this._processedImages == this._listSize) {
        this.fireEvent("loadComplete");
      }
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this._disposeObjects("_manager");
    this._disposeFields("_list", "_frame");
  }
});
