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
     * Til Schneider (til132)
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

#module(apiviewer)

************************************************************************ */

/**
 * Shows the class details.
 */
qx.Class.define("apiviewer.ClassViewer",
{
  extend : qx.ui.embed.HtmlEmbed,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    qx.ui.embed.HtmlEmbed.call(this);

    this.setOverflow("auto");
    this.setPadding(20);
    this.setEdge(0);
    this.setHtmlProperty("id", "ClassViewer");
    this.setVisibility(false);

    apiviewer.ClassViewer.instance = this;
  },


  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {

    /** {Map} The primitive types. These types will not be shown with links. */
    PRIMITIVES :
    {
      "var"       : true,
      "void"      : true,
      "undefined" : true,
      "arguments" : true,
      "null"      : true,
      "call"      : true,
      "Boolean"   : true,
      "String"    : true,
      "Float"     : true,
      "Double"    : true,
      "Number"    : true,
      "Integer"   : true,
      "Error"     : true,
      "RegExp"    : true,
      "Array"     : true,
      "Map"       : true,
      "Date"      : true,
      "Element"   : true,
      "Document"  : true,
      "Window"    : true,
      "Node"      : true,
      "Function"  : true,
      "Object"    : true,
      "Event"     : true,
      "Class"     : true,
      "Mixin"     : true,
      "Interface" : true
    },


    /** {int} The node type of a constructor. */
    NODE_TYPE_CONSTRUCTOR : 1,

    /** {int} The node type of an event. */
    NODE_TYPE_EVENT : 2,

    /** {int} The node type of a property. */
    NODE_TYPE_PROPERTY : 3,

    /** {int} The node type of a public method. */
    NODE_TYPE_METHOD : 4,

    /** {int} The node type of a static public method. */
    NODE_TYPE_METHOD_STATIC : 5,

    /** {int} The node type of a constant. */
    NODE_TYPE_CONSTANT : 6,

    /** {int} The node type of a appearance. */
    NODE_TYPE_APPEARANCE : 7,

    /** {string} The start tag of a div. */
    DIV_START : '<div>',

    /** {string} The start tag of a div containing an item description. */
    DIV_START_DESC : '<div class="item-desc">',

    /** {string} The start tag of a div containing the headline of an item detail. */
    DIV_START_DETAIL_HEADLINE : '<div class="item-detail-headline">',

    /** {string} The start tag of a div containing the text of an item detail. */
    DIV_START_DETAIL_TEXT : '<div class="item-detail-text">',

    /** {string} The start tag of a div containing the headline of an item error. */
    DIV_START_ERROR_HEADLINE : '<div class="item-detail-error">',

    /** {string} The end tag of a div. */
    DIV_END : '</div>',

    /** {string} The start tag of a span containing an optional detail. */
    SPAN_START_OPTIONAL : '<span class="item-detail-optional">',

    /** {string} The start tag of a span containing a parameter name. */
    SPAN_START_PARAM_NAME : '<span class="item-detail-param-name">',

    /** {string} The end tag of a span. */
    SPAN_END : '</span>',


    /**
     * Creates the HTML showing an image.
     *
     * @type static
     * @param imgUrl {var} the URL of the image. May be a string or an array of
     *          strings (for overlay images).
     * @param tooltip {String} the tooltip to show.
     * @param styleAttributes {String} the style attributes to add to the image.
     * @return {var} TODOC
     */
    createImageHtml : function(imgUrl, tooltip, styleAttributes)
    {
      if (typeof imgUrl == "string") {
        return '<img src="' + qx.manager.object.AliasManager.getInstance().resolvePath(imgUrl) + '" class="img"' + (styleAttributes ? ' style="' + styleAttributes + '"' : "") + '/>';
      }
      else
      {
        if (styleAttributes) {
          styleAttributes += ";vertical-align:top";
        } else {
          styleAttributes = "vertical-align:top";
        }

        return apiviewer.ClassViewer.createOverlayImageHtml(18, 18, imgUrl, tooltip, styleAttributes);
      }
    },


    /**
     * Creates HTML that shows an overlay image (several images on top of each other).
     * The resulting HTML will behave inline.
     *
     * @type static
     * @param width {Integer} the width of the images.
     * @param height {Integer} the height of the images.
     * @param imgUrlArr {String[]} the URLs of the images. The last image will be
     *          painted on top.
     * @param toolTip {String,null} the tooltip of the icon.
     * @param styleAttributes {String,null} custom CSS style attributes.
     * @return {String} the HTML with the overlay image.
     */
    createOverlayImageHtml : function(width, height, imgUrlArr, toolTip, styleAttributes)
    {
      var html = '<div style="display:inline;padding-right:22px;position:relative;top:0;left:0;width:' + width + 'px;height:' + height + 'px' + ((styleAttributes == null) ? '' : (';' + styleAttributes)) + '">';

      for (var i=0; i<imgUrlArr.length; i++)
      {
        html += '<img';

        if (toolTip != null) {
          html += ' title="' + toolTip + '"';
        }

        html += ' style="position:absolute;top:0px;left:0px" src="' + qx.manager.object.AliasManager.getInstance().resolvePath(imgUrlArr[i]) + '"/>';
      }

      html += '</div>';

      /*
      // NOTE: See testOverlay.html
      var html = '<table cellpadding="0" cellspacing="0" '
        + 'style="display:inline;position:relative;border:1px solid blue'
        + ((styleAttributes == null) ? '' : (';' + styleAttributes)) + '"><tr>'
        + '<td style="width:' + width + 'px;height:' + height + 'px">';
      for (var i = 0; i < imgUrlArr.length; i++) {
        html += '<img';
        if (toolTip != null) {
          html += ' title="' + toolTip + '"';
        }
        html += ' style="position:absolute;top:0px;left:0px" src="' + imgUrlArr[i] + '"></img>';
      }
      html += '</td></tr></table>';
      */

      return html;
    },


    /**
     * Gets the doc node of a class using the doc tree of the default Viewer instance.
     *
     * @type member
     * @param className {String} the name of the class.
     * @return {Map} the doc node of the class.
     */
    getClassDocNode : function(className)
    {
      if (className) {
        return apiviewer.TreeUtil.getClassDocNode(apiviewer.Viewer.instance.getDocTree(), className);
      } else {
        return null;
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param el {Element} TODOC
     * @return {void}
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
    }

  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {

    _showProtected : false,
    _showInherited : false,

    /**
     * Initializes the content of the embedding DIV. Will be called by the
     * HtmlEmbed element initialization routine.
     *
     * @type member
     * @return {void}
     */
    _syncHtml : function()
    {
      var ClassViewer = apiviewer.ClassViewer;

      document._detailViewer = this;

      this._infoPanelHash = {};

      var html = new qx.util.StringBuilder();

      // Add title
      html.add('<h1></h1>');

      // Add description
      html.add(ClassViewer.DIV_START, ClassViewer.DIV_END);

      html.add('<div id="ControlFrame">');
      html.add('<input type="checkbox" id="showInherited" onclick="document._detailViewer._onInheritedCheckBoxClick()"/><label for="showInherited">Show Inherited</label>');
      html.add('&#160;');
      html.add('<input type="checkbox" id="showProtected" onclick="document._detailViewer._onProtectedCheckBoxClick()"/><label for="showProtected">Show Protected</label>');
      html.add('</div>');

      // BASICS
      // Add constructor info
      var constructorPanel = new apiviewer.MethodPanel(ClassViewer.NODE_TYPE_CONSTRUCTOR, "constructor", "constructor", false, true);
      this._infoPanelHash[ClassViewer.NODE_TYPE_CONSTRUCTOR] = constructorPanel;
      html.add(constructorPanel.getPanelHtml());

      // Add event info
      var eventPanel = new apiviewer.EventPanel(ClassViewer.NODE_TYPE_EVENT, "events", "events", true, true)
      this._infoPanelHash[ClassViewer.NODE_TYPE_EVENT] = eventPanel;
      html.add(eventPanel.getPanelHtml());

      // Add properties info
      var propPanel = new apiviewer.PropertyPanel(ClassViewer.NODE_TYPE_PROPERTY, "properties", "properties", true, true);
      this._infoPanelHash[ClassViewer.NODE_TYPE_PROPERTY] = propPanel;
      html.add(propPanel.getPanelHtml());

      // PUBLIC
      // Add methods info
      var memberPanel = new apiviewer.MethodPanel(ClassViewer.NODE_TYPE_METHOD, "methods", "methods", true, true);
      this._infoPanelHash[ClassViewer.NODE_TYPE_METHOD] = memberPanel;
      html.add(memberPanel.getPanelHtml());

      // Add static methods info
      var staticsPanel = new apiviewer.MethodPanel(ClassViewer.NODE_TYPE_METHOD_STATIC, "methods-static", "static methods", false, true);
      this._infoPanelHash[ClassViewer.NODE_TYPE_METHOD_STATIC] = staticsPanel;
      html.add(staticsPanel.getPanelHtml());

      // Add constants info
      var constantsPanel = new apiviewer.ConstantPanel(ClassViewer.NODE_TYPE_CONSTANT, "constants", "constants", false, true);
      this._infoPanelHash[ClassViewer.NODE_TYPE_CONSTANT] = constantsPanel;
      html.add(constantsPanel.getPanelHtml());

      // Add constants info
      var appearPanel = new apiviewer.AppearancePanel(ClassViewer.NODE_TYPE_APPEARANCE, "appearances", "appearances", false, true);
      this._infoPanelHash[ClassViewer.NODE_TYPE_APPEARANCE] = appearPanel;
      html.add(appearPanel.getPanelHtml());



      // Set the html
      // doc.body.innerHTML = html;
      this.getElement().innerHTML = html.get();
      apiviewer.ClassViewer.fixLinks(this.getElement());

      // Extract the main elements
      var divArr = this.getElement().childNodes;
      this._titleElem = divArr[0];
      this._classDescElem = divArr[1];
      this._controlFrame = divArr[2];

      this._infoPanelHash[ClassViewer.NODE_TYPE_CONSTRUCTOR].setInfoElement(divArr[3]);
      this._infoPanelHash[ClassViewer.NODE_TYPE_EVENT].setInfoElement(divArr[4]);
      this._infoPanelHash[ClassViewer.NODE_TYPE_PROPERTY].setInfoElement(divArr[5]);
      this._infoPanelHash[ClassViewer.NODE_TYPE_METHOD].setInfoElement(divArr[6]);
      this._infoPanelHash[ClassViewer.NODE_TYPE_METHOD_STATIC].setInfoElement(divArr[7]);
      this._infoPanelHash[ClassViewer.NODE_TYPE_CONSTANT].setInfoElement(divArr[8]);
      this._infoPanelHash[ClassViewer.NODE_TYPE_APPEARANCE].setInfoElement(divArr[9]);

      // Get the child elements
      for (var nodeType in this._infoPanelHash)
      {
        var panel = this._infoPanelHash[nodeType];
        panel.setInfoTitleElement(panel.getInfoElement().firstChild);
        panel.setInfoBodyElement(panel.getInfoElement().lastChild);
      }

      // Update the view
      if (this._currentClassDocNode)
      {
        // NOTE: We have to set this._currentClassDocNode to null beore, because
        //       otherwise showClass thinks, there's nothing to do
        var classDocNode = this._currentClassDocNode;
        this._currentClassDocNode = null;
        this.showClass(classDocNode);
      }
    },


    __getTitleHtml : function(classNode)
    {
      var ClassViewer = apiviewer.ClassViewer;

      switch (classNode.getType())
      {
        case "mixin" :
          var objectName = "Mixin";
          break;

        case "interface" :
          var objectName = "Interface";
          break;

        default:
          var objectName = "Class";
          break;
      }

      var titleHtml = new qx.util.StringBuilder();

      titleHtml.add('<div class="packageName">', classNode.getPackageName(), '</div>');

      titleHtml.add('<span class="typeInfo">');

      if (classNode.isAbstract()) {
        titleHtml.add("Abstract ");
      } else if (classNode.isStatic()) {
        titleHtml.add("Static ");
      } else if (classNode.isSingleton()) {
        titleHtml.add("Singleton ");
      }

      titleHtml.add(objectName);
      titleHtml.add(' </span>');
      titleHtml.add(apiviewer.InfoPanel.createDeprecatedTitle(classNode, classNode.getName()));
      return titleHtml.get();
    },


    /**
     * Shows the information about a class.
     *
     * @type member
     * @param classNode {Map} the doc node of the class to show.
     * @return {void}
     */
    showClass : function(classNode)
    {
      if (this._currentClassDocNode == classNode)
      {
        // Nothing to do
        return ;
      }

      this._currentClassDocNode = classNode;

      if (!this._titleElem)
      {
        // _initContentDocument was not called yet
        // -> Do nothing, the class will be shown in _initContentDocument.
        return ;
      }

      var ClassViewer = apiviewer.ClassViewer;

      this._titleElem.innerHTML = this.__getTitleHtml(classNode);

      switch (classNode.getType())
      {
        case "mixin" :
          var subObjectsName = "sub mixins"
          break;

        case "interface" :
          var subObjectsName = "sub interfaces"
          break;

        default:
          var subObjectsName = "sub classes"
          break;

      }

      var classHtml = new qx.util.StringBuilder();

      // Add the class description
      var desc = classNode.getDescription();

      if (desc != "")
      {
        classHtml.add('<div class="classDescription">', apiviewer.InfoPanel.resolveLinkAttributes(desc, classNode), '</div>');
        classHtml.add("<br/>");
      }

      // Add the class hierarchy
      switch (classNode.getType())
      {
        case "mixin" :
        case "interface" :
          classHtml.add(this.__getHierarchyTreeHtml(classNode));
          break;

        default:
          classHtml.add(this.__getClassHierarchyHtml(classNode));
          break;
      }

      classHtml.add('<br/>');

      classHtml.add(this.__getDependentClassesHtml(classNode.getChildClasses(), "Direct " + subObjectsName + ":"));
      classHtml.add(this.__getDependentClassesHtml(classNode.getInterfaces(), "Implemented interfaces:"));
      classHtml.add(this.__getDependentClassesHtml(classNode.getMixins(), "Included mixins:"));
      classHtml.add(this.__getDependentClassesHtml(classNode.getImplementations(), "Implementations of this interface:"));
      classHtml.add(this.__getDependentClassesHtml(classNode.getIncluder(), "Classes including this mixin:"));

      var construct = classNode.getConstructor();
      if (construct)
      {
        classHtml.add(apiviewer.InfoPanel.createSeeAlsoHtml(construct));
        classHtml.add('<br/>');
      }

      classHtml.add(apiviewer.InfoPanel.createDeprecationHtml(classNode, "class"));

      this._classDescElem.innerHTML = classHtml.get();
      apiviewer.ClassViewer.fixLinks(this._classDescElem);

      // Refresh the info viewers
      this._updateInfoViewers();

      // Scroll to top
      this.getElement().scrollTop = 0;
    },


    __getDependentClassesHtml : function(dependentClasses, title)
    {
      var ClassViewer = apiviewer.ClassViewer;

      if (dependentClasses.length > 0)
      {
        var result = new qx.util.StringBuilder(ClassViewer.DIV_START_DETAIL_HEADLINE, title, ClassViewer.DIV_END, ClassViewer.DIV_START_DETAIL_TEXT);

        for (var i=0; i<dependentClasses.length; i++)
        {
          if (i != 0) {
            result.add(", ");
          }
          result.add(apiviewer.InfoPanel.createItemLinkHtml(dependentClasses[i], null, true, false));
        }

        result.add(ClassViewer.DIV_END);
        result.add('<br/>');
        result = result.get();
      } else {
        result = "";
      }
      return result;
    },


    /**
     * Generate HTML fragment to display the inheritance hierarchy of a class.
     *
     * @param classNode {map} class node
     * @return {String} HTML fragemnt
     */
    __getClassHierarchyHtml: function(classNode)
    {
      var ClassViewer = apiviewer.ClassViewer;

      // Create the class hierarchy
      var classHtml = new qx.util.StringBuilder(ClassViewer.DIV_START_DETAIL_HEADLINE, "Inheritance hierarchy:", ClassViewer.DIV_END);

      var classHierarchy = classNode.getClassHierarchy();

      classHtml.add(ClassViewer.createImageHtml("api/image/class18.gif"), "Object<br/>");
      var indent = 0;

      for (var i=classHierarchy.length-1; i>=0; i--)
      {
        classHtml.add(
          ClassViewer.createImageHtml("api/image/nextlevel.gif", null, "margin-left:" + indent + "px"),
          ClassViewer.createImageHtml(apiviewer.TreeUtil.getIconUrl(classHierarchy[i].getNode()))
        );

        if (i != 0) {
          classHtml.add(apiviewer.InfoPanel.createItemLinkHtml(classHierarchy[i].getFullName(), null, false));
        } else {
          classHtml.add(classHierarchy[i].getFullName());
        }

        classHtml.add("<br/>");
        indent += 18;
      }
      return classHtml.get();
    },


    /**
     * Generate HTML fragment to display the inheritance tree of an interface or mixin.
     *
     * @param classNode {map} class node
     * @return {String} HTML fragemnt
     */
    __getHierarchyTreeHtml: function(classNode)
    {
      if (classNode.getType() == "mixin") {
        var superList = "superMixins";
      } else {
        superList = "superInterfaces";
      }

      var ClassViewer = apiviewer.ClassViewer;

      // Create the interface hierarchy
      var EMPTY_CELL = ClassViewer.createImageHtml("api/image/blank.gif", null, "width:18px");

      var generateTree = function(nodes, first)
      {
        var lines = [];

        for (var nodeIndex=0; nodeIndex<nodes.length; nodeIndex++)
        {

          // render line
          var line = new qx.util.StringBuilder();
          var classNode = nodes[nodeIndex];
          if (!first) {
            if (nodeIndex == nodes.length-1) {
              line.add(ClassViewer.createImageHtml("api/image/nextlevel.gif"));
            } else {
              line.add(ClassViewer.createImageHtml("api/image/cross.gif"));
            }
          } else {
            line.add(EMPTY_CELL);
          }

          line.add(ClassViewer.createImageHtml(apiviewer.TreeUtil.getIconUrl(classNode.getNode())));
          if (!first) {
            line.add(apiviewer.InfoPanel.createItemLinkHtml(classNode.getFullName(), null, false));
          } else {
            line.add(classNode.getFullName());
          }
          lines.push(line.get());

          // get a list of super interfaces
          var superInterfaces = qx.lang.Array.clone(classNode.getItemList(superList));
          for (var j=0; j<superInterfaces.length; j++) {
            superInterfaces[j] = apiviewer.dao.Class.getClassByName(superInterfaces[j].getName());
          }

          // render lines of super interfaces
          if (superInterfaces.length > 0)
          {
            var subLines = generateTree(superInterfaces);
            for(var i=0; i<subLines.length; i++) {
              if (nodeIndex == nodes.length-1) {
                lines.push(EMPTY_CELL + subLines[i]);
              } else {
                lines.push(ClassViewer.createImageHtml("api/image/vline.gif") + subLines[i]);
              }
            }
          }
        }
        return lines;
      }

      var classHtml = new qx.util.StringBuilder();

      if(classNode.getItemList(superList).length > 0)
      {
        classHtml.add(ClassViewer.DIV_START_DETAIL_HEADLINE, "Inheritance hierarchy:", ClassViewer.DIV_END);
        classHtml.add("<div style='line-height:15px'>");
        classHtml.add(generateTree([classNode], true).join("<br />\n"));
        classHtml.add("</div>");
      }

      return classHtml.get();
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _updateInfoViewers : function()
    {
      for (var nodeType in this._infoPanelHash) {
       var panel = this._infoPanelHash[nodeType];
        panel.update(this._showProtected, this._showInherited, this._currentClassDocNode);
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param classNode {var} TODOC
     * @return {void}
     */
    showInfo : function(classNode)
    {
      if (this._currentClassDocNode == classNode)
      {
        // Nothing to do
        return ;
      }

      this._currentClassDocNode = classNode;

      if (!this._titleElem)
      {
        // _initContentDocument was not called yet
        // -> Do nothing, the class will be shown in _initContentDocument.
        return ;
      }

      var ClassViewer = apiviewer.ClassViewer;

      this._titleElem.innerHTML = "Info View";
      this._classDescElem.innerHTML = "";

      // Scroll to top
      this.getElement().scrollTop = 0;
    },


    /**
     * Highlights an item (property, method or constant) and scrolls it visible.
     *
     * @type member
     * @param itemName {String} the name of the item to highlight.
     * @return {void}
     */
    showItem : function(itemName)
    {
      var itemNode = this._currentClassDocNode.getItem(itemName);

      if (!itemNode) {
        alert("Item '" + itemName + "' not found");
      }

      var panel = this._getPanelForItemNode(itemNode);
      var elem = this._getItemElement(panel, itemNode.getName()).parentNode.parentNode;

      // Handle mark
      if (this._markedElement) {
        this._markedElement.className = "";
      }

      elem.className = "marked";
      this._markedElement = elem;

      // Scroll the element visible
      var top = qx.html.Location.getPageBoxTop(elem);
      var height = elem.offsetHeight;

      var doc = this.getElement();
      var scrollTop = doc.scrollTop;
      var clientHeight = doc.offsetHeight;

      if (scrollTop > top) {
        doc.scrollTop = top;
      } else if (scrollTop < top + height - clientHeight) {
        doc.scrollTop = top + height - clientHeight;
      }
    },


    /**
     * Event handler. Called when the user clicked a button for showing/hiding the
     * details of an item.
     *
     * @type member
     * @param nodeType {Integer} the node type of the item to show/hide the details.
     * @param name {String} the name of the item.
     * @param fromClassName {String} the name of the class the item the item was
     *          defined in.
     * @return {void}
     * @throws TODOC
     */
    _onShowItemDetailClicked : function(nodeType, name, fromClassName)
    {
      try
      {
        var panel = this._infoPanelHash[nodeType];
        var textDiv = this._getItemElement(panel, name);

        if (!textDiv) {
          throw Error("Element for name '" + name + "' not found!");
        }

        var showDetails = textDiv._showDetails ? !textDiv._showDetails : true;
        textDiv._showDetails = showDetails;

        var fromClassNode = this._currentClassDocNode;

        if (fromClassName) {
          fromClassNode = apiviewer.dao.Class.getClassByName(fromClassName);
        }

        var node = fromClassNode.getItemByListAndName(panel.getListName(), name);

        // Update the close/open image
        var opencloseImgElem = textDiv.parentNode.previousSibling.firstChild;
        opencloseImgElem.src = qx.manager.object.AliasManager.getInstance().resolvePath(showDetails ? 'api/image/close.gif' : 'api/image/open.gif');

        // Update content
        var info = panel.getItemHtml(node, fromClassNode, this._currentClassDocNode, showDetails);
        textDiv.innerHTML = info.textHtml;
        apiviewer.ClassViewer.fixLinks(textDiv);
      }
      catch(exc)
      {
        this.error("Toggling item details failed", exc);
      }
    },


    /**
     * Event handler. Called when the user clicked on the "show inherited ..." checkbox.
     *
     * @type member
     * @return {void}
     */
    _onInheritedCheckBoxClick : function()
    {
      this._showInherited = document.getElementById("showInherited").checked;
      this._updateInfoViewers();
    },


    /**
     * Event handler. Called when the user clicked on the "show protected ..." checkbox.
     *
     * @type member
     * @return {void}
     */
    _onProtectedCheckBoxClick : function()
    {
      this._showProtected = document.getElementById("showProtected").checked;
      this._updateInfoViewers();
    },


    /**
     * Event handler. Called when the user clicked a button for showing/hiding the
     * body of an info panel.
     *
     * @type member
     * @param nodeType {Integer} the node type of which the show/hide-body-button was
     *          clicked.
     * @return {void}
     */
    _onShowInfoPanelBodyClicked : function(nodeType)
    {
      try
      {
        var panel = this._infoPanelHash[nodeType];
        panel.setIsOpen(!panel.getIsOpen());

        var imgElem = panel.getInfoTitleElement().getElementsByTagName("img")[0];
        imgElem.src = qx.manager.object.AliasManager.getInstance().resolvePath(panel.getIsOpen() ? 'api/image/close.gif' : 'api/image/open.gif');

        panel.update(this._showProtected, this._showInherited, this._currentClassDocNode);
      }
      catch(exc)
      {
        this.error("Toggling info body failed", exc);
      }
    },


    /**
     * Gets the HTML element showing the details of an item.
     *
     * @type member
     * @param panel {InfoPanel} the info panel of the item.
     * @param name {String} the item's name.
     * @return {Element} the HTML element showing the details of the item.
     */
    _getItemElement : function(panel, name)
    {
      var elemArr = panel.getInfoBodyElement().getElementsByTagName("TBODY")[0].childNodes;

      for (var i=0; i<elemArr.length; i++)
      {
        // ARRG, should be implemented in a more fault-tolerant way
        // iterate over tr's, look inside the third "td" and there the second element
        if (elemArr[i].childNodes[3].childNodes[1].getAttribute("_itemName") == name) {
          return elemArr[i].childNodes[3].childNodes[1];
        }
      }
    },


    /**
     * Selects an item.
     *
     * @type member
     * @param itemName {String} the name of the item.
     * @return {void}
     * @see ApiViewer#selectItem
     */
    _selectItem : function(itemName)
    {
      try
      {
        apiviewer.Viewer.instance.selectItem(itemName);
      }
      catch(exc)
      {
        this.error("Selecting item '" + itemName + "' failed", exc);
      }
    },


    /**
     * Gets the node panel for a doc node.
     *
     * @type member
     * @param itemNode {Map} the doc node of the item.
     * @return {InfoPanel} the item's info panel instance
     */
    _getPanelForItemNode : function(itemNode)
    {
      itemNode = itemNode.getNode();
      var ClassViewer = apiviewer.ClassViewer;

      if (itemNode.getType == "constant") {
        return this._infoPanelHash[ClassViewer.NODE_TYPE_CONSTANT];
      } else if (itemNode.type == "property") {
        return this._infoPanelHash[ClassViewer.NODE_TYPE_PROPERTY];
      } else if (itemNode.type == "event") {
        return this._infoPanelHash[ClassViewer.NODE_TYPE_EVENT];
      }
      else if (itemNode.type == "method")
      {
        var name = itemNode.attributes.name;

        if (name == null) {
          return this._infoPanelHash[ClassViewer.NODE_TYPE_CONSTRUCTOR];
        }
        else
        {
          if (itemNode.attributes.isStatic) {
            return this._infoPanelHash[ClassViewer.NODE_TYPE_METHOD_STATIC];
          } else {
            return this._infoPanelHash[ClassViewer.NODE_TYPE_METHOD];
          }
        }
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
    this._disposeObjectDeep("_infoPanelHash", 1);
    this._disposeFields("_titleElem", "_classDescElem", "_markedElement");
    document._detailViewer = null;
  }
});
