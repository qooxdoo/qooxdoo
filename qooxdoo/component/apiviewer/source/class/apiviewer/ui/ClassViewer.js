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
    this.addInfoPanel(new apiviewer.ui.panels.PropertyPanel("properties", "properties", true, true));
    this.addInfoPanel(new apiviewer.ui.panels.MethodPanel("methods", "methods"));
    this.addInfoPanel(new apiviewer.ui.panels.MethodPanel("methods-static", "static methods"));
    this.addInfoPanel(new apiviewer.ui.panels.ConstantPanel("constants", "constants", false, true));
    this.addInfoPanel(new apiviewer.ui.panels.AppearancePanel("appearances", "appearances", false, true));
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
      "Event"     : true,

      "Class"     : true,
      "Bootstrap" : true,
      "List"      : true,
      "Mixin"     : true,
      "Interface" : true,
      "Theme"     : true,

      "Color"     : true,
      "Decorator" : true,
      "Font"      : true
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
      titleHtml.add(apiviewer.ui.panels.InfoPanel.setTitleClass(classNode, classNode.getName()));

      return titleHtml.get();
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
        if(apiviewer.dao.Class.isNativeObject(classHierarchy[i]) && classHierarchy[i].name==='Object') {
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
            classHtml.add('<span style="white-space: nowrap;"><a href="https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/'+classHierarchy[i].name+'" target="_blank" title="'+classHierarchy[i].name+'">'+classHierarchy[i].name+'</a></span>');
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

      var indent = 0, l = hierarchy.length;
      for (var i=l-1; i>=0; i--) {
        var name = hierarchy[i].getFullName();
        var icon = TreeUtil.getIconUrl(hierarchy[i]);

        html.add("<div>");

        if (i == l-1) {
          html.add(ClassViewer.createImageHtml(icon));
          html.add(InfoPanel.createItemLinkHtml(name, null, false));
        } else {
          html.add(ClassViewer.createImageHtml("apiviewer/image/nextlevel.gif", null, "margin-left:" + indent + "px"));
          html.add(ClassViewer.createImageHtml(icon));
          html.add(i != 0 ? InfoPanel.createItemLinkHtml(name, null, false) : name);
          indent += 18;
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

      // special handling for constructor methods since the constructor
      // cannot be obtained with the "getItem" (which works on lists)
      if (itemName == "construct") {
        itemNode = this.getDocNode().getConstructor();
      } else {
        itemNode = this.getDocNode().getItem(itemName);
      }

      if (!itemNode) {
        return false;
      }

      // Show properties, private or protected methods if they are hidden
      this.__enableSection(itemNode, itemName);


      var panel = this._getPanelForItemNode(itemNode);
      var itemElement = panel.getItemElement(itemNode.getName());

      if (!itemElement) {
        return false;
      }

      var elem = itemElement.parentNode.parentNode;

      // Handle mark
      if (this._markedElement) {
        this._markedElement.className = "";
      }

      elem.className = "marked";
      this._markedElement = elem;

      // Use a timeout as pragmatic solution
      // Replace this later on with a kind of post-processing
      // to get rid off this timer
      qx.event.Timer.once(function(e) {
        qx.bom.element.Scroll.intoView(elem, null, "left", "top");
      }, this, 0);

      return true;
    },

    /**
     * Programatically enables the butto to show private, protected function or
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
      }
      else if (itemNode.getListName() == "methods")
      {
        // Check for privates
        if (itemName.indexOf("__") === 0 || itemNode.isInternal()) {
          uiModel.setShowPrivate(true);
        }
        // Check for protected
        else if (itemName.indexOf("_") === 0){
          uiModel.setShowProtected(true);
        }
      }
      else if (itemNode.getListName() == "methods-static")
      {
        // Check for privates
        if (itemName.indexOf("__") === 0 || itemNode.isInternal()) {
          uiModel.setShowPrivate(true);
        }
        // Check for protected
        else if (itemName.indexOf("_") === 0){
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
    this._titleElem = this._classDescElem = this._markedElement = null;
  }
});
