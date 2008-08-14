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
#optional(qx.legacy.ui.popup.ToolTipManager)

************************************************************************ */


qx.Class.define("qx.legacy.ui.embed.Gallery",
{
  extend : qx.legacy.ui.basic.Terminator,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(vGalleryList)
  {
    this.base(arguments);

    this._blank = qx.util.ResourceManager.toUri("qx/static/blank.gif");
    this._list = vGalleryList;
    this._listSize = vGalleryList.length;
    this._processedImages = 0;

    this.initOverflow();

    this.setHtmlProperty("className", "qx_ui_embed_Gallery");

    this._manager = new qx.legacy.ui.selection.DomSelectionManager(this);

    this._manager.setMultiColumnSupport(true);

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
      init : 100
    },

    thumbMaxHeight :
    {
      check : "Integer",
      init : 100
    },

    decorHeight :
    {
      check : "Integer",
      init : 40
    },

    showTitle :
    {
      check : "Boolean",
      init : true
    },

    showComment :
    {
      check : "Boolean",
      init : true
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
     * @return {var} TODOC
     */
    getList : function() {
      return this._list;
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
      if (el)
      {
        el.replaceChild(this.createView(), el.firstChild);
      }
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
     * @param vSrc {var} TODOC
     * @param vWidth {var} TODOC
     * @param vHeight {var} TODOC
     * @return {void}
     */
    updateImageById : function(vId, vSrc, vWidth, vHeight)
    {
      this.updateImageSrcById(vId, vSrc);
      this.updateImageDimensionsById(vId, vWidth, vHeight);
    },


    /**
     * TODOC
     *
     * @param vId {var} TODOC
     * @param vWidth {var} TODOC
     * @param vHeight {var} TODOC
     * @return {void}
     */
    updateImageDimensionsById : function(vId, vWidth, vHeight) {
      this.updateImageDimensionsByPosition(this.getPositionById(vId), vWidth, vHeight);
    },


    /**
     * TODOC
     *
     * @param vPos {var} TODOC
     * @param vWidth {var} TODOC
     * @param vHeight {var} TODOC
     * @return {void}
     * @throws TODOC
     */
    updateImageDimensionsByPosition : function(vPos, vWidth, vHeight)
    {
      // TBD: compare dimensions with max. thumb size and scale proportionally if necessary
      if (vPos == -1) {
        throw new Error("No valid Position: " + vPos);
      }

      var cnode = this.getNodeByPosition(vPos).getElementsByTagName("img")[0];

      cnode.width = vWidth;
      cnode.height = vHeight;

      cnode.style.marginLeft = cnode.style.marginRight = Math.floor((this.getThumbMaxWidth() - vWidth) / 2) + "px";
      cnode.style.marginTop = cnode.style.marginBottom = Math.floor((this.getThumbMaxHeight() - vHeight) / 2) + "px";

      this._list[vPos].thumbWidth = vWidth;
      this._list[vPos].thumbHeight = vHeight;
    },


    /**
     * TODOC
     *
     * @param vId {var} TODOC
     * @param vSrc {var} TODOC
     * @return {void}
     */
    updateImageSrcById : function(vId, vSrc) {
      this.updateImageSrcByPosition(this.getPositionById(vId), vSrc);
    },


    /**
     * TODOC
     *
     * @param vPos {var} TODOC
     * @param vSrc {var} TODOC
     * @return {void}
     * @throws TODOC
     */
    updateImageSrcByPosition : function(vPos, vSrc)
    {
      if (vPos == -1) {
        throw new Error("No valid Position: " + vPos);
      }

      var vNode = this.getNodeByPosition(vPos);

      vNode.getElementsByTagName("img")[0].src = vSrc;
      this._list[vPos].src = vSrc;
    },


    /**
     * TODOC
     *
     * @param vId {var} TODOC
     * @return {void}
     */
    deleteById : function(vId) {
      this.deleteByPosition(this.getPositionById(vId));
    },


    /**
     * TODOC
     *
     * @param vPos {var} TODOC
     * @return {void}
     * @throws TODOC
     */
    deleteByPosition : function(vPos)
    {
      this._manager.deselectAll();

      if (vPos == -1) {
        throw new Error("No valid Position: " + vPos);
      }

      var vNode = this.getNodeByPosition(vPos);

      if (vNode) {
        vNode.parentNode.removeChild(vNode);
      }

      this._list.splice(vPos, 1);
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


    /**
     * TODOC
     *
     * @param vPartialList {var} TODOC
     * @return {void}
     */
    addFromPartialList : function(vPartialList)
    {
      this.concat(vPartialList);

      for (var i=0, a=vPartialList, l=a.length; i<l; i++) {
        this._frame.appendChild(this.createCell(a[i], i));
      }
    },


    /**
     * TODOC
     *
     * @param vNewList {var} TODOC
     * @return {void}
     */
    addFromUpdatedList : function(vNewList)
    {
      for (var a=vNewList, l=a.length, i=this._list.length; i<l; i++) {
        this._frame.appendChild(this.createCell(a[i], i));
      }

      this._list = vNewList;
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
      }

      this._lastItem = vItem;
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
      MANAGER REQUIREMENTS
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
      INTERNALS
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @return {var} TODOC
     */
    createView : function()
    {
      if (!this._protoCell) {
        this.createProtoCell();
      }

      this._frame = document.createElement("div");
      this._frame.className = "galleryFrame clearfix";

      for (var i=0, a=this._list, l=a.length; i<l; i++) {
        this._frame.appendChild(this.createCell(a[i], i));
      }

      return this._frame;
    },


    /**
     * TODOC
     *
     * @param d {var} TODOC
     * @param i {var} TODOC
     * @return {var} TODOC
     */
    createCell : function(d, i)
    {
      var cframe = this._protoCell.cloneNode(true);

      cframe.id = d.id;
      cframe.pos = i;

      if (this.getShowTitle())
      {
        cnode = cframe.childNodes[0];
        cnode.firstChild.nodeValue = d.title;
      }

      var cnode = cframe.childNodes[this.getShowTitle() ? 1 : 0];
      this.createImageCell(cnode, d);

      if (this.getShowComment())
      {
        cnode = cframe.childNodes[this.getShowTitle() ? 2 : 1];
        cnode.firstChild.nodeValue = d.comment;
      }

      return cframe;
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
        inode.onload = qx.legacy.ui.embed.Gallery.imageOnLoad;
        inode.onerror = qx.legacy.ui.embed.Gallery.imageOnError;
        inode.gallery = this;
      }

      if (qx.core.Variant.isSet("qx.client", "mshtml")) {
        inode.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + d.src + "',sizingMethod='scale')";
      } else {
        inode.src = d.src;
      }

      inode.width = d.thumbWidth + 2;
      inode.height = d.thumbHeight + 2;
      inode.style.marginLeft = inode.style.marginRight = Math.floor((this.getThumbMaxWidth() - d.thumbWidth) / 2) + "px";
      inode.style.marginTop = inode.style.marginBottom = Math.floor((this.getThumbMaxHeight() - d.thumbHeight) / 2) + "px";
    },


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
    },


    /**
     * TODOC
     *
     * @return {void}
     */
    createProtoCell : function()
    {
      var frame = this._protoCell = document.createElement("div");
      frame.className = "galleryCell";
      frame.unselectable = "on";
      frame.style.width = (this.getThumbMaxWidth() + 2) + "px";
      frame.style.height = (this.getThumbMaxHeight() + this.getDecorHeight() + 2) + "px";

      if (this.getShowTitle())
      {
        var title = document.createElement("div");
        title.className = "galleryTitle";
        title.unselectable = "on";
        var ttext = document.createTextNode("-");
        title.appendChild(ttext);

        frame.appendChild(title);
      }

      var image = new Image();
      image.src = this._blank;
      frame.appendChild(image);

      if (this.getShowComment())
      {
        var comment = document.createElement("div");
        comment.className = "galleryComment";
        comment.unselectable = "on";
        var ctext = document.createTextNode("-");
        comment.appendChild(ctext);

        frame.appendChild(comment);
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
    this._disposeFields("_list", "_protoCell", "_frame");
  }
});
