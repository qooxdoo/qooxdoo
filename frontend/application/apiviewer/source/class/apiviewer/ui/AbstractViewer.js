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
     * Til Schneider (til132)
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

#module(apiviewer)

************************************************************************ */


qx.Class.define("apiviewer.ui.AbstractViewer",
{
  extend : qx.ui.embed.HtmlEmbed,

  construct : function()
  {
    this.base(arguments);

    this.setOverflow("auto");
    this.setPadding(20);
    this.setEdge(0);

    this._infoPanelHash = {};
    this._infoPanels = [];
    apiviewer.ObjectRegistry.register(this);
  },


  properties :
  {
    /** The class to display */
    docNode : {
      check : "apiviewer.dao.Node",
      init : null,
      nullable : true,
      apply : "_applyDocNode"
    }
  },


  statics :
  {

    /**
     * Change the target of all external links inside the given element to open in a new browser window.
     *
     * @type member
     * @param el {Element} Root element
     */
    fixLinks : function(el)
    {
      var a = el.getElementsByTagName("a");

      for (var i=0; i<a.length; i++)
      {
        if (typeof a[i].href == "string" && a[i].href.indexOf("http://") == 0) {
          a[i].target = "_blank";
        }
      }
    },


    highlightCode : function(el)
    {
      var pres = el.getElementsByTagName("pre");

      for (var i=0; i<pres.length; i++) {
        var element = pres[i];
        if (element.className !== "javascript") {
          continue;
        }
        element.innerHTML = qx.dev.Tokenizer.javaScriptToHtml(element.innerHTML);
      }
    }

  },


  members :
  {

    /**
     * Returns the HTML fragment for the title
     *
     * @type member
     * @abstract
     * @param classNode {apiviewer.dao.Class} the class documentation node for the title
     * @return {String} HTML fragment of the title
     */
    _getTitleHtml : function(classNode)
    {
      throw new Error("Abstract method called!");
    },


    _getDescriptionHtml : function(classNode)
    {
      throw new Error("Abstract method called!");
    },


    /**
     * Initializes the content of the embedding DIV. Will be called by the
     * HtmlEmbed element initialization routine.
     *
     * @type member
     */
    _syncHtml : function()
    {
      var html = new qx.util.StringBuilder();

      // Add title
      html.add('<h1></h1>');

      // Add description
      html.add('<div>', '</div>');

      // render panels
      var panels = this.getPanels();
      for (var i=0; i<panels.length; i++)
      {
        var panel = panels[i];
        html.add(panel.getPanelHtml(this));
      }

      // Set the html
      this.getElement().innerHTML = html.get();
      apiviewer.ui.AbstractViewer.fixLinks(this.getElement());

      // Extract the main elements
      var divArr = this.getElement().childNodes;
      this._titleElem = divArr[0];
      this._classDescElem = divArr[1];

      for (var i=0; i<panels.length; i++)
      {
        var panel = panels[i];
        html.add(panel.setElement(divArr[i+2]));
      }
    },


    addInfoPanel : function(panel)
    {
      this._infoPanelHash[panel.toHashCode()] = panel;
      this._infoPanels.push(panel);
    },


    getPanels : function() {
      return this._infoPanels;
    },


    getPanelFromHashCode : function(hashCode)
    {
      return this._infoPanelHash[hashCode];
    },


    /**
     * Updates all info panels
     *
     * @type member
     */
    _updatePanels : function()
    {
      var panels = this.getPanels();
      for (var i=0; i<panels.length; i++)
      {
        var panel = panels[i];
        panel.update(this, this.getDocNode());
      }
    },


    /**
     * Shows the information about a class.
     *
     * @type member
     * @param classNode {apiviewer.dao.Class} the doc node of the class to show.
     */
    _applyDocNode : function(classNode)
    {
      if (!this._titleElem)
      {
        // _initContentDocument was not called yet
        // -> Do nothing, the class will be shown in _initContentDocument.
        return;
      }

      this._titleElem.innerHTML = this._getTitleHtml(classNode);
      this._classDescElem.innerHTML = this._getDescriptionHtml(classNode);
      apiviewer.ui.AbstractViewer.fixLinks(this._classDescElem);
      apiviewer.ui.AbstractViewer.highlightCode(this._classDescElem);

      // Refresh the info viewers
      this._updatePanels();
    },




    /**
     * Event handler. Called when the user clicked a button for showing/hiding the
     * body of an info panel.
     *
     * @type member
     * @param panelHashCode {Integer} hash code of the panel object.
     */
    togglePanelVisibility : function(panel)
    {
      try
      {
        panel.setIsOpen(!panel.getIsOpen());

        var imgElem = panel.getTitleElement().getElementsByTagName("img")[0];
        imgElem.src = qx.io.Alias.getInstance().resolve(panel.getIsOpen() ? 'api/image/close.gif' : 'api/image/open.gif');

        panel.update(this, this.getDocNode()
        );
      }
      catch(exc)
      {
        this.error("Toggling info body failed", exc);
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
    this._disposeFields("_classDescElem", "_titleElem");
    this._disposeObjectDeep("_infoPanels", 1);
    this._disposeObjectDeep("_infoPanelHash", 1);
  }
});
