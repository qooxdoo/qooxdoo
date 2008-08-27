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
     * Jonathan Rass (jonathan_rass)

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
    this.addInfoPanel(new apiviewer.ui.panels.MethodPanel("constructor", "constructor", false, true));
    this.addInfoPanel(new apiviewer.ui.panels.EventPanel("events", "events", true, true));
    this.addInfoPanel(new apiviewer.ui.panels.PropertyPanel("properties", "properties", true, true));
    this.addInfoPanel(new apiviewer.ui.panels.MethodPanel("methods", "methods", true, true));
    this.addInfoPanel(new apiviewer.ui.panels.MethodPanel("methods-static", "static methods", false, true));
    this.addInfoPanel(new apiviewer.ui.panels.ConstantPanel("constants", "constants", false, true));
    this.addInfoPanel(new apiviewer.ui.panels.AppearancePanel("appearances", "appearances", false, true));

    this.getContentElement().setAttribute("id", "ClassViewer");
    apiviewer.ui.ClassViewer.instance = this;

    this._init(new apiviewer.dao.Class({}));
  },


  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events :
  {
    /** This event if dispatched if one of the internal links is clicked */
    "classLinkClicked" : "qx.event.type.Data"
  },


  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** whether to display inherited items */
    showInherited : {
      check: "Boolean",
      init: false,
      apply: "_updatePanels"
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

    /** whether to display private and internal items */
    showPrivate : {
      check: "Boolean",
      init: false,
      apply: "_updatePanels"
    }
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
        return '<img src="' + qx.util.ResourceManager.toUri(imgUrl) + '" class="img"' + (styleAttributes ? ' style="' + styleAttributes + '"' : "") + '/>';
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
      var html = '<span style="display:inline-block;display:inline;padding-right:18px;position:relative;top:-2px;left:0;width:' + width + 'px;height:' + height + 'px' + ((styleAttributes == null) ? '' : (';' + styleAttributes)) + '">';

      for (var i=0; i<imgUrlArr.length; i++)
      {
        html += '<img';

        if (toolTip != null) {
          html += ' title="' + toolTip + '"';
        }

        html += ' style="position:absolute;top:0px;left:0px" src="' + qx.util.ResourceManager.toUri(imgUrlArr[i]) + '"/>';
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
        case "mixin" :
        case "interface" :
          classHtml.add(this.__getHierarchyTreeHtml(classNode));
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
        classHtml.add("This ", classNode.getType(), " is internal!");
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

      var classHierarchy = classNode.getClassHierarchy();

      classHtml.add(ClassViewer.createImageHtml("apiviewer/image/class18.gif"), "Object<br/>");
      var indent = 0;

      for (var i=classHierarchy.length-1; i>=0; i--)
      {
        classHtml.add('<div>');
        classHtml.add(
          ClassViewer.createImageHtml("apiviewer/image/nextlevel.gif", null, "margin-left:" + indent + "px"),
          ClassViewer.createImageHtml(apiviewer.TreeUtil.getIconUrl(classHierarchy[i]))
        );

        if (i != 0) {
          classHtml.add(apiviewer.ui.panels.InfoPanel.createItemLinkHtml(classHierarchy[i].getFullName(), null, false));
        } else {
          classHtml.add(classHierarchy[i].getFullName());
        }

        indent += 18;
        classHtml.add('</div>');
      }
      return classHtml.get();
    },


    /**
     * Generate HTML fragment to display the inheritance tree of an interface or mixin.
     *
     * @param classNode {apiviewer.dao.Class} class node
     * @return {String} HTML fragemnt
     */
    __getHierarchyTreeHtml: function(classNode)
    {
      if (classNode.getType() == "mixin") {
        var superList = "superMixins";
      } else {
        superList = "superInterfaces";
      }

      var ClassViewer = apiviewer.ui.ClassViewer;

      // Create the interface hierarchy
      var EMPTY_CELL = ClassViewer.createImageHtml("apiviewer/image/blank.gif", null, "width:18px");

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
              line.add(ClassViewer.createImageHtml("apiviewer/image/nextlevel.gif"));
            } else {
              line.add(ClassViewer.createImageHtml("apiviewer/image/cross.gif"));
            }
          } else {
            if (!first) {
              line.add(EMPTY_CELL)
            };
          }

          line.add(ClassViewer.createImageHtml(apiviewer.TreeUtil.getIconUrl(classNode)));
          if (!first) {
            line.add(apiviewer.ui.panels.InfoPanel.createItemLinkHtml(classNode.getFullName(), null, false));
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
                if (first) {
                  lines.push(subLines[i]);
                } else {
                  lines.push(EMPTY_CELL + subLines[i]);
                }
              } else {
                lines.push(ClassViewer.createImageHtml("apiviewer/image/vline.gif") + subLines[i]);
              }
            }
          }
        }
        return lines;
      }

      var classHtml = new qx.util.StringBuilder();

      if(classNode.getItemList(superList).length > 0)
      {
        classHtml.add("<h2>", "Inheritance hierarchy:", "</h2>");
        classHtml.add(generateTree([classNode], true).join("<br />\n"));
      }

      return classHtml.get();
    },


    /**
     * Highlights an item (property, method or constant) and scrolls it visible.
     *
     * @param itemName {String} the name of the item to highlight.
     * @return {Boolean} whether the item name was valid and could be selected.
     */
    showItem : function(itemName)
    {
      var itemNode = this.getDocNode().getItem(itemName);

      if (!itemNode || !itemNode.isFromProperty) {
        return false;
      }

      if(itemNode.isFromProperty())
      {
        var controller = qx.core.Init.getApplication().controller;
        var btn_expand = controller._widgetRegistry.getWidgetById("btn_expand");
        if (btn_expand.getChecked() === false) {
          btn_expand.setChecked(true);
          this.setExpandProperties(true);
        }
      }

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

      qx.bom.element.Scroll.intoView(elem);

      return true;
    },


    /**
     * Callback for internal links to other classes/items.
     * This code is called directly from the generated HTML of the
     * class viewer.
     *
     * @param itemName {String} the name of the item.
     * @see Controller#selectItem
     */
    _onSelectItem : function(itemName)
    {
      this.fireDataEvent("classLinkClicked", itemName);
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

  destruct : function()
  {
    this._disposeFields("_titleElem", "_classDescElem", "_markedElement");
  }
});
