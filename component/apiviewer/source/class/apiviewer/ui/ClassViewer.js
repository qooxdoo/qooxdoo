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

/**
 * Shows the class details.
 */
qx.Class.define("apiviewer.ui.ClassViewer",
{
  extend : apiviewer.ui.AbstractViewer,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);
    this.addInfoPanel(new apiviewer.ui.panels.MethodPanel("constructor", "constructor"));
    this.addInfoPanel(new apiviewer.ui.panels.EventPanel("events", "events", true, true));
    this.addInfoPanel(new apiviewer.ui.panels.MethodPanel("methods-static", "static methods"));
    this.addInfoPanel(new apiviewer.ui.panels.ConstantPanel("constants", "constants", false, true));
    this.addInfoPanel(new apiviewer.ui.panels.PropertyPanel("properties", "properties", true, true));
    this.addInfoPanel(new apiviewer.ui.panels.MethodPanel("methods", "methods"));
    this.addInfoPanel(new apiviewer.ui.panels.ChildControlsPanel("childControls", "child controls"));

    this.getContentElement().setAttribute("class", "ClassViewer");

    this._init(new apiviewer.dao.Class({}));
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
      "varargs"   : true,

      "Boolean"   : true,
      "String"    : true,

      "Number"    : true,
      "Integer"   : true,
      "PositiveNumber" : true,
      "PositiveInteger" : true,
      "Float"     : true,
      "Double"    : true,

      "Color"    : true,

      "Error"     : true,
      "RegExp"    : true,

      "Object"    : true,
      "Array"     : true,
      "Map"       : true,

      "Function"  : true,
      "Date"      : true,
      "Node"      : true,
      "Element"   : true,
      "Document"  : true,
      "Window"    : true,
      "Event"     : true
    },

    MDC_LINKS :
    {
      "Event" : "https://developer.mozilla.org/en/DOM/event",
      "Window" : "https://developer.mozilla.org/en/DOM/window",
      "Document" : "https://developer.mozilla.org/en/DOM/document",
      "Element" : "https://developer.mozilla.org/en/DOM/element",
      "Node" : "https://developer.mozilla.org/en/DOM/node",
      "Date" : "https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Date",
      "Function" : "https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function",
      "Array" : "https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array",
      "Object" : "https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object",
      "RegExp" : "https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/RegExp",
      "Error" : "https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Error",
      "Number" : "https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Number",
      "Boolean" : "https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Boolean",
      "String" : "https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/String",
      "undefined" : "https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/undefined",
      "arguments" : "https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/arguments",
      "Font" : "https://developer.mozilla.org/en/CSS/font",
      "Color" : "https://developer.mozilla.org/en/CSS/color"
    },


    /**
     * {Map} Replacement rules for placeholders in the source view URI.
     * Functions will be called with the current @link{apiviewer.dao.Node} as the
     * only parameter and must return a string.
    **/
    SOURCE_VIEW_MACROS :
    {
      classFilePath : function(node) {
        var classNode = node.getClass ? node.getClass() : node;
        return classNode.getFullName().replace(/\./gi, "/") + ".js";
      },

      lineNumber : function(node) {
        if (node.getLineNumber && typeof node.getLineNumber() == "number") {
          return node.getLineNumber() + "";
        }
        else {
          return "0";
        }
      },

      qxGitBranch : function(node) {
        return qx.core.Environment.get("qx.revision") ?
          qx.core.Environment.get("qx.revision").split(":")[1] : "master";
      }
    },


    /**
     * Creates the HTML showing an image. Optionally with overlays
     *
     * @param imgUrl {String|String[]} the URL of the image. May be a string or an array of
     *          strings (for overlay images).
     * @param tooltip {String} the tooltip to show.
     * @param styleAttributes {String} the style attributes to add to the image.
     * @return {String} HTML fragment for the image
     */
    createImageHtml : function(imgUrl, tooltip, styleAttributes)
    {
      if (typeof imgUrl == "string") {
        return '<img src="' + qx.util.ResourceManager.getInstance().toUri(imgUrl) + '" class="img"' + (styleAttributes ? ' style="' + styleAttributes + '"' : "") + '/>';
      }
      else
      {
        if (styleAttributes) {
          styleAttributes += ";vertical-align:top";
        } else {
          styleAttributes = "vertical-align:top";
        }

        return apiviewer.ui.ClassViewer.createOverlayImageHtml(18, 18, imgUrl, tooltip, styleAttributes);
      }
    },


    /**
     * Creates HTML that shows an overlay image (several images on top of each other).
     * The resulting HTML will behave inline.
     *
     * @param width {Integer} the width of the images.
     * @param height {Integer} the height of the images.
     * @param imgUrlArr {String[]} the URLs of the images. The last image will be
     *          painted on top.
     * @param toolTip {String?null} the tooltip of the icon.
     * @param styleAttributes {String?null} custom CSS style attributes.
     * @return {String} the HTML with the overlay image.
     */
    createOverlayImageHtml : function(width, height, imgUrlArr, toolTip, styleAttributes)
    {
      var html = '';
      var style;

      if(qx.core.Environment.get("engine.name") == "webkit") {
        html = '<span style="display:inline;position:relative;top:-2px;width:' + width + 'px;height:' + height + 'px' + ((styleAttributes == null) ? '' : (';' + styleAttributes)) + '">';
      } else {
        html = '<span style="display:inline-block;display:inline;padding-right:18px;position:relative;top:-2px;left:0;width:' + width + 'px;height:' + height + 'px' + ((styleAttributes == null) ? '' : (';' + styleAttributes)) + '">';
      }

      if(qx.core.Environment.get("engine.name") == "webkit") {
        style = "position:absolute;top:0px;left:0px;padding-right:18px;";
      } else if(qx.core.Environment.get("engine.name") == "opera") {
        style = "margin-right:-18px;";
      }else{
        style = "position:absolute;top:0px;left:0px";
      }

      for (var i=0; i<imgUrlArr.length; i++)
      {
        html += '<img';

        if (toolTip != null) {
          html += ' title="' + toolTip + '"';
        }

        html += ' style="' + style + '" src="' + qx.util.ResourceManager.getInstance().toUri(imgUrlArr[i]) + '"/>';
      }

      html += '</span>';

      return html;
    },


    /**
     * Returns the source view URI for a doc node. This is determined by getting
     * the value for the "sourceViewUri" key from the library that contains the
     * item represented by the node. Placeholders of the form %{key} in the URI
     * are then resolved by applying the rules defined in the
     * @link{#SOURCE_VIEW_MACROS} map.
     *
     * @param node {apiviewer.dao.Node} the documentation node for the title
     * @return {String|null} Source view URI or <code>null</code> if it couldn't
     * be determined
     */
    getSourceUri : function(node)
    {
      var classNode;
      if (node instanceof apiviewer.dao.Class) {
        classNode = node;
      }
      else {
        classNode = node.getClass();
      }

      // get the library's top-level namespace
      var libNs = classNode.getFullName().split(".")[0];
      if (!qx.util.LibraryManager.getInstance().has(libNs)) {
        return null;
      }

      var sourceViewUri = qx.util.LibraryManager.getInstance().get(libNs, "sourceViewUri");
      if (!sourceViewUri) {
        return null;
      }

      var replacements = this.SOURCE_VIEW_MACROS;
      for (var key in replacements) {
        var macro = "%{" + key + "}";
        if (sourceViewUri.indexOf(macro) >=0 && typeof replacements[key] == "function") {
          var replacement = replacements[key](node);
          if (typeof replacement == "string") {
            sourceViewUri = sourceViewUri.replace(new RegExp(macro), replacement);
          }
        }
      }

      if (sourceViewUri.indexOf("%{") >= 0) {
        if (qx.core.Environment.get("qx.debug")) {
          qx.log.Logger.warn("Source View URI contains unresolved macro(s):", sourceViewUri);
        }
        return null;
      }

      return sourceViewUri;
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
     * Returns the HTML fragment for the title
     *
     * @param classNode {apiviewer.dao.Class} the class documentation node for the title
     * @return {String} HTML fragment of the title
     */
    _getTitleHtml : function(classNode)
    {
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

      titleHtml.add('<small>', classNode.getPackageName(), '</small>');
      titleHtml.add('<span class="type">');

      if (classNode.isAbstract()) {
        titleHtml.add("Abstract ");
      } else if (classNode.isStatic()) {
        titleHtml.add("Static ");
      } else if (classNode.isSingleton()) {
        titleHtml.add("Singleton ");
      }

      titleHtml.add(objectName, ' </span>');

      var className = classNode.getName();
      var sourceUri = this.self(arguments).getSourceUri(classNode);
      if (sourceUri) {
        className = '<a href="' + sourceUri + '" target="_blank" title="View Source">' + className + '<a/>';
      }

      titleHtml.add(apiviewer.ui.panels.InfoPanel.setTitleClass(classNode, className));

      return titleHtml.get();
    },


    _getTocHtml : function(classNode)
    {
      var tocHtml = document.createDocumentFragment();
      var members = ["constructor", "events", "methods-static", "constants", "properties", "methods", "childControls"];
      var iconURL = {"events" : "apiviewer/image/event18.gif",
                                "constructor" : "apiviewer/image/constructor18.gif",
                                "properties" : "apiviewer/image/property18.gif",
                                "methods" : "apiviewer/image/method_public18.gif",
                                "methods-static" : ["apiviewer/image/method_public18.gif","apiviewer/image/overlay_static18.gif"],
                                "constants" : "apiviewer/image/constant18.gif",
                                "childControls" : "apiviewer/image/childcontrol18.gif"};
      var panels = this.getPanels();
      var panelByName = {};

      for(var i=0, l=panels.length; i<l; i++)
      {
        var listName = panels[i].getListName();
        panelByName[listName] = panels[i];
      }

      var lastTocItem = null;

      for(var i=0, l=members.length; i<l; i++)
      {
        var memberList = classNode.getItemList(members[i]);
        this.sortItems(memberList);
        var showTOC = false;
        if(memberList.length>0)
        {
          showTOC = true;
        }
        else
        {
          if (
            this.getShowInherited() &&
            (
              members[i] == "events" ||
              members[i] == "properties" ||
              members[i] == "methods"
              )
            )
            {
              var classNodes = null;
              if (classNode.getType() == "interface") {
                classNodes = classNode.getInterfaceHierarchy();
              } else {
                classNodes = classNode.getClassHierarchy();
              }
              for(var j=0;j<classNodes.length;j++)
              {
                if(apiviewer.dao.Class.isNativeObject(classNodes[j]) && classNodes[j].name==='Object') {
                  continue;
                }
                memberList = classNodes[j].getItemList(members[i]);
                if(memberList.length > 0)
                {
                  showTOC = true;
                  break;
                }
              }
          }
        }

        if(showTOC)
        {
          if(lastTocItem) {
            tocHtml.appendChild(document.createTextNode(' | '));
          }
          var tocItem = qx.dom.Element.create('span');
          qx.bom.element.Class.add(tocItem,'tocitem');

          // add icon in front of the TOC item
          tocItem.innerHTML = apiviewer.ui.ClassViewer.createImageHtml(iconURL[members[i]],members[i])+' ';

          qx.bom.Element.addListener(tocItem,'click',(function(panel,firstItem){
            return function()
            {
              this.__enableSection(firstItem, firstItem.getName());
              qx.bom.element.Scroll.intoView(panel.getTitleElement(), null, "left", "top");
              if(!panel.getIsOpen()) {
                this.togglePanelVisibility(panel);
              }
            };})(panelByName[members[i]],memberList[0]),this,false);
          var textSpan = qx.dom.Element.create('span');
          if(members[i] === 'methods-static' && qx.core.Environment.get("engine.name")=='webkit') {
            qx.bom.element.Style.set(textSpan,'margin-left','25px');
          }
          textSpan.appendChild(document.createTextNode(' '));
          textSpan.appendChild(document.createTextNode(members[i] === 'methods-static' ? 'Static Methods' : qx.lang.String.capitalize(members[i])));
          tocItem.appendChild(textSpan);
          tocHtml.appendChild(tocItem);
          lastTocItem = tocItem;
        }
      }

      return tocHtml;
    },

    _getDescriptionHtml : function(classNode)
    {
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

      if (desc != "") {
        classHtml.add(
          '<div class="class-description">',
          apiviewer.ui.panels.InfoPanel.resolveLinkAttributes(desc, classNode),
          '</div>'
        );
      }

      if (classNode.getErrors().length > 0) {
        classHtml.add(
          '<div class="class-description">',
          apiviewer.ui.panels.InfoPanel.createErrorHtml(classNode, classNode),
          '</div>'
        );
      }


      // Add the class hierarchy
      switch (classNode.getType())
      {
        case "interface" :
          classHtml.add(this.__getInterfaceHierarchyHtml(classNode));
          break;

        default:
          classHtml.add(this.__getClassHierarchyHtml(classNode));
          break;
      }

      classHtml.add(this.__getDependentClassesHtml(classNode.getChildClasses(), "Direct " + subObjectsName + ":"));
      classHtml.add(this.__getDependentClassesHtml(classNode.getInterfaces(), "Implemented interfaces:"));
      classHtml.add(this.__getDependentClassesHtml(classNode.getMixins(), "Included mixins:"));
      classHtml.add(this.__getDependentClassesHtml(classNode.getImplementations(), "Implementations of this interface:"));
      classHtml.add(this.__getDependentClassesHtml(classNode.getIncluder(), "Classes including this mixin:"));

      var construct = classNode.getConstructor();
      if (construct) {
        classHtml.add(apiviewer.ui.panels.InfoPanel.createSeeAlsoHtml(construct));
      }

      if (classNode.isDeprecated())
      {
        classHtml.add('<h2 class="warning">', "Deprecated:", '</h2>');
        classHtml.add('<p>');
        var desc = classNode.getDeprecationText();
        if (desc) {
          classHtml.add(desc);
        } else {
          classHtml.add("This ", classNode.getType(), " is deprecated!");
        }
        classHtml.add('</p>');
      }

      if (classNode.isInternal())
      {
        classHtml.add('<h2 class="warning">', "Internal:", '</h2>');
        classHtml.add('<p>');
        var type = classNode.getType();
        if(type=='bootstrap') {
          type+=' class';
        }
        classHtml.add("This ", type, " is internal!");
        classHtml.add('</p>');
      }

      return classHtml.get();
    },


    /**
     * Create a HTML fragment containing information of dependent classes
     * like implemented interfaces, included mixins, direct sub classes, ...
     *
     * @param dependentClasses {apiviewer.dao.Class[]} array of dependent classes
     * @param title {String} headline
     * @return {String} HTML Fragement
     */
    __getDependentClassesHtml : function(dependentClasses, title)
    {
      if (dependentClasses.length > 0)
      {
        var result = new qx.util.StringBuilder("<h2>", title, "</h2>");

        for (var i=0; i<dependentClasses.length; i++)
        {
          if (i != 0) {
            result.add(", ");
          }
          result.add(apiviewer.ui.panels.InfoPanel.createItemLinkHtml(dependentClasses[i], null, true, false));
        }

        result = result.get();
      } else {
        result = "";
      }
      return result;
    },


    /**
     * Generate HTML fragment to display the inheritance hierarchy of a class.
     *
     * @param classNode {apiviewer.dao.Class} class node
     * @return {String} HTML fragemnt
     */
    __getClassHierarchyHtml: function(classNode)
    {
      var ClassViewer = apiviewer.ui.ClassViewer;

      // Create the class hierarchy
      var classHtml = new qx.util.StringBuilder("<h2>", "Inheritance hierarchy:", "</h2>");

      var classHierarchy = classNode.getClassHierarchy(true);

      classHtml.add(ClassViewer.createImageHtml("apiviewer/image/class18.gif"), '<span style="white-space: nowrap;"><a href="https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object" target="_blank" title="Object">Object</a></span>');
      var indent = 0;

      for (var i=classHierarchy.length-1; i>=0; i--)
      {
        if(apiviewer.dao.Class.isNativeObject(classHierarchy[i]) && classHierarchy[i] === Object) {
          continue;
        }
        classHtml.add('<div>');
        classHtml.add(
          ClassViewer.createImageHtml("apiviewer/image/nextlevel.gif", null, "margin-left:" + indent + "px"),
          !apiviewer.dao.Class.isNativeObject(classHierarchy[i]) ? ClassViewer.createImageHtml(apiviewer.TreeUtil.getIconUrl(classHierarchy[i])) : ClassViewer.createImageHtml("apiviewer/image/class18.gif")
        );

        if (i != 0) {
          if(!apiviewer.dao.Class.isNativeObject(classHierarchy[i]))
          {
            classHtml.add(apiviewer.ui.panels.InfoPanel.createItemLinkHtml(classHierarchy[i].getFullName(), null, false));
          }
          else
          {
            // it is safe to get the name of the type of the object as below, because only standard native objects are used here.
            // the method below returns Object for user defined objects
            var name = Object.prototype.toString.call(new classHierarchy[i]).match(/^\[object (.*)\]$/)[1];
            classHtml.add('<span style="white-space: nowrap;"><a href="'+apiviewer.ui.ClassViewer.MDC_LINKS[name]+'" target="_blank" title="'+name+'">'+name+'</a></span>');
          }
        } else {
          classHtml.add(classHierarchy[i].getFullName());
        }

        indent += 18;
        classHtml.add('</div>');
      }
      return classHtml.get();
    },

    /**
     * Generate HTML fragment to display the inheritance hierarchy of an Interface.
     *
     * @param classNode {apiviewer.dao.Class} class node
     * @return {String} HTML fragemnt
     */
    __getInterfaceHierarchyHtml: function(classNode)
    {
      var ClassViewer = apiviewer.ui.ClassViewer;
      var TreeUtil = apiviewer.TreeUtil;
      var InfoPanel = apiviewer.ui.panels.InfoPanel;

      var hierarchy = classNode.getInterfaceHierarchy();
      var html = new qx.util.StringBuilder();

      //show nothing if we don't have a hierarchy
      if (hierarchy.length <= 1) { return; }

      html.add("<h2>", "Inheritance hierarchy:", "</h2>");

      var indent = 0;
      for (var i=hierarchy.length - 1; i >= 0; i--) {
        var name = hierarchy[i].getFullName();
        var icon = TreeUtil.getIconUrl(hierarchy[i]);

        html.add("<div>");

        if (hierarchy[i].getSuperInterfaces().length > 0) {
          html.add(ClassViewer.createImageHtml("apiviewer/image/nextlevel.gif", null, "margin-left:" + indent + "px"));
          html.add(ClassViewer.createImageHtml(icon));
          html.add(i != 0 ? InfoPanel.createItemLinkHtml(name, null, false) : name);
          indent += 18;
        }
        else {
          html.add(ClassViewer.createImageHtml(icon));
          html.add(InfoPanel.createItemLinkHtml(name, null, false));
        }

        html.add("</div>");
      }

      return html.get();
    },

    /**
     * Highlights an item (property, method or constant) and scrolls it visible.
     *
     * @param itemName {String} the name of the item to highlight.
     * @return {Boolean} whether the item name was valid and could be selected.
     */
    showItem : function(itemName)
    {
      var itemNode;

      var nameMap = {
                      "event": "events",
                      "method_public": "methods",
                      "method_protected": "methods",
                      "method_private": "methods",
                      "property" : "properties",
                      "property_private" : "properties",
                      "property_protected" : "properties",
                      "constant" : "constants",
                      "childcontrol": "childControls"
                    };

      // special handling for constructor methods since the constructor
      // cannot be obtained with the "getItem" (which works on lists)
      if (itemName == "construct") {
        itemNode = this.getDocNode().getConstructor();
      } else {
        if(itemName.indexOf('!')!=-1)
        {
          var parts = itemName.split('!');
          itemNode = this.getDocNode().getItemByListAndName(nameMap[parts[1]], parts[0]);
          if(!itemNode) {
            itemNode = this.getDocNode().getItem(parts[0]);
          }
        }
        else
        {
          itemNode = this.getDocNode().getItem(itemName);
        }
      }

      if (!itemNode) {
        return false;
      }

      // Show properties, private or protected methods if they are hidden
      this.__enableSection(itemNode, itemName);


      var panel = this._getPanelForItemNode(itemNode);
      if(!panel.getIsOpen()) {
        this.togglePanelVisibility(panel);
      }
      var itemElement = panel.getItemElement(itemNode.getName());

      if (!itemElement) {
        return false;
      }

      var elem = itemElement.parentNode.parentNode;

      // Handle mark
      if (this._markedElement) {
        this._markedElement.className = apiviewer.ui.panels.InfoPanel.getItemCssClasses(this._markedItemNode);
      }

      elem.className = "marked";
      this._markedElement = elem;
      this._markedItemNode = itemNode;

      // Use a timeout as pragmatic solution
      // Replace this later on with a kind of post-processing
      // to get rid off this timer
      qx.event.Timer.once(function(e) {
        qx.bom.element.Scroll.intoView(elem, null, "left", "top");
      }, this, 0);

      return true;
    },

    /**
     * Programatically enables the button to show private, protected function or
     * properties so that the selected item can be shown.
     *
     * @param itemName {String} the name of the item to highlight.
     * @param itemName {String} The doc node of the item
     */
    __enableSection : function(itemNode, itemName)
    {
       var uiModel = apiviewer.UiModel.getInstance();

      // Check for property
      if(itemNode.isFromProperty && itemNode.isFromProperty()) {
        uiModel.setExpandProperties(true);
        if(itemNode.isProtected()) {
          uiModel.setShowProtected(true);
        }
        if(itemNode.isPrivate()) {
          uiModel.setShowPrivate(true);
        }
        if(itemNode.isInternal()) {
          uiModel.setShowInternal(true);
        }
      }
      else
      {
        // Check for privates
        if (itemNode.isPrivate()) {
          uiModel.setShowPrivate(true);
        }
        // Check for internals
        if (itemNode.isInternal()) {
          uiModel.setShowInternal(true);
        }
        // Check for protected
        else if (itemNode.isProtected()){
          uiModel.setShowProtected(true);
        }
      }
    },


    /**
     * Gets the node panel for a doc node.
     *
     * @param itemNode {apiviewer.dao.Class} the doc node of the item.
     * @return {InfoPanel} the item's info panel instance
     */
    _getPanelForItemNode : function(itemNode)
    {
      var panels = this.getPanels();
      for (var i=0; i<panels.length; i++)
      {
        var panel = panels[i];
        if (panel.canDisplayItem(itemNode)) {
          return panel;
        }
      }
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._titleElem = this._classDescElem = this._markedElement = this._markedItemNode = null;
  }
});
