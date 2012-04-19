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
     * Jonathan Weiß (jonathan_rass)

************************************************************************ */

qx.Class.define("apiviewer.ui.AbstractViewer",
{
  type : "abstract",
  extend : qx.ui.embed.Html,

  construct : function()
  {
    this.base(arguments);

    this._infoPanelHash = {};
    this._infoPanels = [];

    this.setOverflowX("auto");
    this.setOverflowY("auto");

    this.setAppearance("detailviewer");

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
    },

    /** whether to display inherited items */
    showInherited : {
      check: "Boolean",
      init: false,
      apply: "_updatePanelsWithInheritedMembers"
    },

    /** whether to display included items */
    showIncluded : {
      check: "Boolean",
      init: true,
      apply: "_updatePanelsWithInheritedMembers"
    },

    /** whether to display protected items */
    expandProperties :  {
      check: "Boolean",
      init: false,
      apply: "_updatePanels"
    },

    /** whether to display protected items */
    showProtected :  {
      check: "Boolean",
      init: false,
      apply: "_updatePanels"
    },

    /** whether to display private items */
    showPrivate : {
      check: "Boolean",
      init: false,
      apply: "_updatePanels"
    },

    /** whether to display internal items */
    showInternal : {
      check: "Boolean",
      init: false,
      apply: "_updatePanels"
    }
  },


  statics :
  {

    /**
     * Change the target of all external links inside the given element to open in a new browser window.
     *
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
        if (qx.core.Environment.get("engine.name") == "mshtml") {
          // IE parser treats html added to a pre tag like normal html and removes
          // the whitespaces. To prevent this we create a wrapper element, add
          // to its innerHTML the pre tag and the javaScript code and replace the
          // existing pre element with the wrapper element.
          var preWrapper = document.createElement("div");
          preWrapper.innerHTML = '<pre class="javascript">' + qx.dev.Tokenizer.javaScriptToHtml(element.innerHTML, true) + '</pre>';
          element.parentNode.replaceChild(preWrapper, element);
        } else {
          element.innerHTML = qx.dev.Tokenizer.javaScriptToHtml(element.innerHTML);
        }
      }
    }

  },


  members :
  {
    _infoPanelHash : null,
    _infoPanels : null,
    __classNode : null,

    _init : function(pkg){
      this.__initHtml();

      this.setDocNode(pkg);

      this.addListenerOnce("appear", function(){
        this._syncHtml();
        this._applyDocNode(this.__classNode);
      }, this);
    },

    __initHtml : function()
    {
      var html = new qx.util.StringBuilder();

      html.add('<div style="padding:24px;">');

      // Add title
      html.add('<h1></h1>');

      // Add TOC
      html.add('<div class="tocContainer"></div>');

      // Add description
      html.add('<div>', '</div>');

      // render panels
      var panels = this.getPanels();

      for (var i=0; i<panels.length; i++)
      {
        var panel = panels[i];
        html.add(panel.getPanelHtml(this));
      }

      html.add('</div>');

      this.setHtml(html.get());
   },

    /**
     * Returns the HTML fragment for the title
     *
     * @abstract
     * @param classNode {apiviewer.dao.Class} the class documentation node for the title
     * @return {String} HTML fragment of the title
     */
    _getTitleHtml : function(classNode)
    {
      throw new Error("Abstract method called!");
    },

    _getTocHtml : function(classNode)
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
     */
    _syncHtml : function()
    {
      var element = this.getContentElement().getDomElement().firstChild;
      var divArr = element.childNodes;
      var panels = this.getPanels();

      apiviewer.ui.AbstractViewer.fixLinks(element);

      this._titleElem = divArr[0];
      this._tocElem = divArr[1];
      this._classDescElem = divArr[2];

      for (var i=0; i<panels.length; i++)
      {
        var panel = panels[i];
        panel.setElement(divArr[i+3]);
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
     */
    _updatePanels : function()
    {
      apiviewer.LoadingIndicator.getInstance().show();
      var panels = this.getPanels();

      for (var i=0; i<panels.length; i++)
      {
        var panel = panels[i];
        panel.update(this, this.__classNode);
      }
      apiviewer.LoadingIndicator.getInstance().hide();
    },

    /**
     * Updates all info panels and TOC with items reflecting appearance/disappearance of panels
     * due to inherited members
     */
    _updatePanelsWithInheritedMembers : function(){
      this._updatePanels();
      if(this._tocElem)
      {
        qx.dom.Element.empty(this._tocElem);
        this._tocElem.appendChild(this._getTocHtml(this.__classNode));
      }
    },


    /**
     * Shows the information about a class.
     *
     * @param classNode {apiviewer.dao.Class} the doc node of the class to show.
     */
    _applyDocNode : function(classNode)
    {
      this.__classNode = classNode;

      if (!this._titleElem)
      {
        // _initContentDocument was not called yet
        // -> Do nothing, the class will be shown in _initContentDocument.
        return;
      }

      this._titleElem.innerHTML = this._getTitleHtml(classNode);
      qx.dom.Element.empty(this._tocElem);
      this._tocElem.appendChild(this._getTocHtml(classNode));
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
     * @param panelHashCode {Integer} hash code of the panel object.
     */
    togglePanelVisibility : function(panel)
    {
      try
      {
        panel.setIsOpen(!panel.getIsOpen());

        var imgElem = panel.getTitleElement().getElementsByTagName("img")[0];
        imgElem.src = qx.util.ResourceManager.getInstance().toUri(panel.getIsOpen() ? 'apiviewer/image/close.gif' : 'apiviewer/image/open.gif');

        panel.update(this, this.getDocNode()
        );
      }
      catch(exc)
      {
        this.error("Toggling info body failed", exc);
      }
    },

    /**
     * Sorts the nodes in place.
     *
     * @param nodeArr {apiviewer.dao.ClassItem[]} array of class items
     */
    sortItems : function(nodeArr)
    {
      // Sort the nodeArr by name
      // Move protected methods to the end
      nodeArr.sort(function(obj1, obj2)
      {
        var sum1 = 0;
        if (obj1.isInternal()) {
          sum1 += 4;
        }
        if (obj1.isPrivate()) {
          sum1 += 2;
        }
        if (obj1.isProtected()) {
          sum1 += 1;
        }

        var sum2 = 0;
        if (obj2.isInternal()) {
          sum2 += 4;
        }
        if (obj2.isPrivate()) {
          sum2 += 2;
        }
        if (obj2.isProtected()) {
          sum2 += 1;
        }

        if (sum1 == sum2)
        {
          var name1 = obj1.getName();
          var name2 = obj2.getName();

          return name1.toLowerCase() < name2.toLowerCase() ? -1 : 1;
        }
        else
        {
          return sum1 - sum2;
        }
      });
    }

  },

  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this._classDescElem = this._titleElem = this._tocElem = this._infoPanelHash =
      this.__classNode = null;
    this._disposeArray("_infoPanels", 1);
  }
});
