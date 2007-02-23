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

************************************************************************ */

/* ************************************************************************

#embed(qx.static/image/blank.gif)

************************************************************************ */

/**
 * @event loadComplete {qx.event.type.Event}
 */
qx.Clazz.define("qx.ui.embed.GalleryList",
{
  extend : qx.ui.basic.Terminator,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(galleryList)
  {
    qx.ui.basic.Terminator.call(this);

    this._blank = qx.manager.object.AliasManager.getInstance().resolvePath("static/image/blank.gif");
    this._list = galleryList;
    this._listSize = galleryList.length;
    this._processedImages = 0;

    this.setOverflow("auto");

    this.setHtmlProperty("className", "qx_ui_embed_GalleryList");

    this._manager = new qx.manager.selection.DomSelectionManager(this);

    this.addEventListener("mousedown", this._onmousedown);
    this.addEventListener("mouseup", this._onmouseup);
    this.addEventListener("click", this._onclick);
    this.addEventListener("dblclick", this._ondblclick);
    this.addEventListener("keypress", this._onkeypress);
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
     * @type static
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
     * @type static
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
    thumbMaxWidth :
    {
      _legacy      : true,
      type         : "number",
      defaultValue : 60
    },

    thumbMaxHeight :
    {
      _legacy      : true,
      type         : "number",
      defaultValue : 60
    },

    decorHeight :
    {
      _legacy      : true,
      type         : "number",
      defaultValue : 40
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
     * @type member
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
     * @type member
     * @return {var} TODOC
     */
    getManager : function() {
      return this._manager;
    },


    /**
     * TODOC
     *
     * @type member
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
     * @type member
     * @return {void} 
     */
    removeAll : function()
    {
      this._manager.deselectAll();
      this.getElement().innerHTML = "";
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
     * @type member
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
     * @type member
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
     * @type member
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
     * @type member
     * @param e {Event} TODOC
     * @return {void} 
     */
    _onkeypress : function(e) {
      this._manager.handleKeyPress(e);
    },


    /**
     * TODOC
     *
     * @type member
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
     * @type member
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
     * @type member
     * @param vItem {var} TODOC
     * @return {void} 
     */
    scrollItemIntoViewX : function(vItem) {
      qx.html.ScrollIntoView.scrollX(vItem);
    },


    /**
     * TODOC
     *
     * @type member
     * @param vItem {var} TODOC
     * @return {void} 
     */
    scrollItemIntoViewY : function(vItem) {
      qx.html.ScrollIntoView.scrollY(vItem);
    },




    /*
    ---------------------------------------------------------------------------
      SELECTION MANAGER API
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getItems : function() {
      return this._frame.childNodes;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getFirstChild : function() {
      return this._frame.childNodes[0];
    },


    /**
     * TODOC
     *
     * @type member
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
     * @type member
     * @return {var} TODOC
     */
    createView : function()
    {
      var s = (new Date).valueOf();

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
     * @type member
     * @param inode {var} TODOC
     * @param d {var} TODOC
     * @return {void} 
     */
    createImageCell : function(inode, d)
    {
      if (this.hasEventListeners("loadComplete"))
      {
        inode.onload = qx.ui.embed.GalleryList.imageOnLoad;
        inode.onerror = qx.ui.embed.GalleryList.imageOnError;
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
     * @type member
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
     * @type member
     * @return {void} 
     */
    imageOnComplete : function()
    {
      this._processedImages++;

      if (this._processedImages == this._listSize) {
        this.dispatchEvent(new qx.event.type.Event("loadComplete"), true);
      }
    },




    /*
    ---------------------------------------------------------------------------
      DISPOSER
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @return {boolean | var} TODOC
     */
    dispose : function()
    {
      if (this.getDisposed()) {
        return true;
      }

      this._list = null;
      this._frame = null;

      if (this._manager)
      {
        this._manager.dispose();
        this._manager = null;
      }

      this.removeEventListener("mousedown", this._onmousedown);
      this.removeEventListener("mouseup", this._onmouseup);
      this.removeEventListener("click", this._onclick);
      this.removeEventListener("dblclick", this._ondblclick);
      this.removeEventListener("keydown", this._onkeydown);

      return qx.ui.basic.Terminator.prototype.dispose.call(this);
    }
  }
});
