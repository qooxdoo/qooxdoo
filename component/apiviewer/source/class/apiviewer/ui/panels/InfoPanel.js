/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Til Schneider (til132)
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Fabian Jakobs (fjakobs)

************************************************************************ */
/**
 * @require(qx.module.event.GestureHandler)
 * @require(qx.module.Attribute)
 * @require(qx.module.event.Native)
 */
qx.Class.define("apiviewer.ui.panels.InfoPanel", {

  type : "abstract",

  extend: qx.core.Object,

  /**
   * Creates an info panel. An info panel shows the information about one item
   * type (e.g. for public methods).
   *
   * @param listName {String} the name of the node list in the class doc node where
   *          the items shown by this info panel are stored.
   * @param labelText {String} the label text describing the node type.
   */
  construct: function(listName, labelText)
  {
    this.base(arguments);
    this.setListName(listName);
    this._labelText = labelText;
    apiviewer.ObjectRegistry.register(this);
  },

  properties :
  {

    /** top level DOM node of the panel */
    element :
    {
      check : "Element",
      init : null,
      nullable : true,
      apply : "_applyElement"
    },

    /** The name of the list containing the items in the tree data structure */
    listName : { check : "String" },

    /** whether the info panel is open */
    isOpen :
    {
      check : "Boolean",
      init : true
    },

    docNode :
    {
      check : "apiviewer.dao.Node",
      nullable : true
    }
  },


  statics : {

    /**
     * {regexp} The regexp for parsing a item name
     * (e.g. "mypackage.MyClass#MY_CONSTANT alternative text").
     */
    ITEM_SPEC_REGEX : /^(([\w\.]+)?(#\w+(\([^\)]*\))?)?)(\s+(.*))?$/,

    /** {regexp} The regexp that finds the end of a sentence. */
    SENTENCE_END_REGEX : /[^\.].\.(\s|<)/,


    /**
     * Creates HTML that replaces all &#64;link-attributes with links.
     *
     * @param description {String} the description.
     * @param packageBaseClass {apiviewer.dao.Class?null} the doc node of the class to use for
     *          auto-adding packages.
     * @return {String} HTML fragment
     */
    resolveLinkAttributes : function(description, packageBaseClass)
    {
      var linkRegex = /\{@link([^\}]*)\}/mg;

      var html = new qx.util.StringBuilder();
      var hit;
      var lastPos = 0;

      while ((hit = linkRegex.exec(description)) != null)
      {
        // Add the text before the link
        html.add(
          description.substring(lastPos, hit.index) +
          this.createItemLinkHtml(hit[1], packageBaseClass)
        );

        lastPos = hit.index + hit[0].length;
      }

      // Add the text after the last hit
      html.add(description.substring(lastPos, description.length));

      return html.get();
    },


    /**
     * Creates the HTML for a link to an item.
     *
     * @param linkText {String} the link text
     *          (e.g. "mypackage.MyClass#myMethod alt text")
     * @param packageBaseClass {apiviewer.dao.Class?null} the doc node of the class to use when
     *          auto-adding the package to a class name having no package specified.
     *          If null, no automatic package addition is done.
     * @param useIcon {Boolean?true} whether to add an icon to the link.
     * @param useShortName {Boolean?false} whether to use the short name.
     * @return {String} HTML fragment of the link
     */
    createItemLinkHtml : function(linkText, packageBaseClass, useIcon, useShortName)
    {
      var classNode = null;
      if (useIcon == null) {
        useIcon = true;
      }

      linkText = linkText.trim();

      if (linkText.charAt(0) == '"' || linkText.charAt(0) == '<')
      {
        // This is a String or a link to a URL -> Just use it as it is
        return linkText;
      }
      else
      {
        // This is a link to another class or method -> Create an item link
        // Separate item name from label
        var hit = this.ITEM_SPEC_REGEX.exec(linkText);

        if (hit == null)
        {
          // Malformed item name
          return linkText;
        }
        else
        {
          var className = hit[2];
          var itemName = hit[3];
          var label = hit[6];
          var style = "";

          // Make the item name absolute
          if (className == null || className.length == 0)
          {
            // This is a relative link to a method -> Add the current class
            className = packageBaseClass.getFullName();
          }
          else if (packageBaseClass && className.indexOf(".") == -1)
          {
            classNode = apiviewer.dao.Class.getClassByName(className);

            // classNode could be a native JS constructor (String, Boolean, ...)
            if (!classNode || !classNode.classname ||
                classNode.getPackage().getName() !== "")
            {
              // The class name has no package -> Use the same package as the current class
              var name = packageBaseClass.getName();
              var packageName;
              if (packageBaseClass instanceof apiviewer.dao.Package) {
                packageName = packageBaseClass.getFullName();
              } else {
                var fullName = packageBaseClass.getFullName();
                packageName = fullName.substring(0, fullName.length - name.length - 1);
              }
              className = packageName + "." + className;
            }
          }

          // Get the node info
          if (label == null || label.length == 0)
          {
            // We have no label -> Use the item name as label
            label = hit[1];
          }

          // Add the right icon
          if (useIcon)
          {
            if (!classNode) {
              classNode = apiviewer.dao.Class.getClassByName(className);
            }

            if (classNode)
            {
              var itemNode;

              if (itemName)
              {
                // The links points to a item of the class
                var cleanItemName = itemName.substring(1);
                var parenPos = cleanItemName.indexOf("(");

                if (parenPos != -1) {
                  cleanItemName = cleanItemName.substring(0, parenPos).trim();
                }
                itemNode = this.__getItemFromClassHierarchy(cleanItemName,classNode);
                if(!itemNode && apiviewer.UiModel.getInstance().getShowIncluded())
                {
                  if(apiviewer.UiModel.getInstance().getShowInherited())
                  {
                    var classNodes = [classNode];
                    if (classNode.getType() == "interface") {
                      classNodes = classNode.getInterfaceHierarchy();
                    } else {
                      classNodes = classNode.getClassHierarchy();
                    }
                    for(var i=0,l=classNodes.length; i<l; i++)
                    {
                      itemNode = classNodes[i].getItemByNameFromMixins(cleanItemName);
                      if(itemNode) {
                        break;
                      }
                    }
                  } else {
                    itemNode = classNode.getItemByNameFromMixins(cleanItemName);
                  }
                }
              }
              else
              {
                // The links points to the class
                itemNode = classNode;
              }

              if (itemNode)
              {
                if(itemNode.getNodeType()!=='package') {
                  className = itemNode.getClass().getFullName();
                }
                var iconUrl = apiviewer.TreeUtil.getIconUrl(itemNode);
                var iconCode = apiviewer.ui.ClassViewer.createImageHtml(iconUrl);

                if (qx.core.Environment.get("engine.name") == "webkit")
                {
                  if(iconCode.indexOf("overlay_") !== -1) {
                    style = "margin-left:18px;";
                  }
                }
              }
            }
          }

          // Create a real bookmarkable link
          // NOTE: The onclick-handler must be added by HTML code. If it
          //       is added using the DOM element then the href is followed.
          var fullItemName = className + (itemName ? itemName : "");
          var protocol, host, pathname;

          // Opera 10.5 loses the reference to "window"
          // See http://bugzilla.qooxdoo.org/show_bug.cgi?id=3516 for details
          if (qx.core.Environment.get("engine.name") == "opera" &&
            qx.core.Environment.get("engine.version") > 9)
          {
            protocol = location.protocol;
            host = location.host;
            pathname = location.pathname;
          }
          else
          {
            protocol = window.location.protocol;
            host = window.location.host;
            pathname = window.location.pathname;
          }

          var linkHtml = [
            '<span style="white-space: nowrap;">',
            (typeof iconCode != "undefined" ? iconCode : ""),
            '<a style="' + style + '" href="' + protocol, '//',
            host,
            pathname, '#', fullItemName,
            '" onclick="return false;"',
            '" onmouseup="apiviewer.TabViewController.instance.onSelectItem(\'',
            fullItemName, '\'); return false;"', ' title="',
            fullItemName, '">', label, '</a></span>'
          ];

          return linkHtml.join("");
        }
      }
    },


    /**
     * Creates the HTML showing the &#64;see attributes of an item.
     *
     * @param node {apiviewer.dao.ClassItem} the doc node of the item.
     * @return {String} the HTML showing the &#64;see attributes.
     */
    createSeeAlsoHtml : function(node)
    {
      var see = node.getSee();
      if (see.length > 0)
      {
        var seeAlsoLinks = new qx.util.StringBuilder();

        for (var i=0; i<see.length; i++)
        {
          if (seeAlsoLinks.length != 0) {
            seeAlsoLinks.add(", ");
          }
          var link = this.createItemLinkHtml(see[i], node.getClass());
          if (link.indexOf("http") === 0) {
            link = "<a target='_blank' href='" + link + "'>" + link + "</a>";
          }
          seeAlsoLinks.add(link);
        }

        if (!seeAlsoLinks.isEmpty())
        {
          // We had @see attributes
          var seeAlsoHtml = new qx.util.StringBuilder();
          seeAlsoHtml.add(
            '<div class="item-detail-headline">', "See also:", '</div>',
            '<div class="item-detail-text">', seeAlsoLinks, '</div>'
          );
          return seeAlsoHtml.get();
        }
      }

      // Nothing found
      return "";
    },


    /**
     * Creates the HTML showing information about inheritance
     *
     * @param node {apiviewer.dao.ClassItem} item to get the information from
     * @param currentClassDocNode {apiviewer.dao.Class} the current class shown in the class viewer
     * @return {String} HTML fragment
     */
    createInheritedFromHtml : function(node, currentClassDocNode)
    {
      if (
        node.getClass().getType() != "mixin" &&
        node.getClass() != currentClassDocNode
      )
      {
        var html = new qx.util.StringBuilder(
          '<div class="item-detail-headline">', "Inherited from:", '</div>',
          '<div class="item-detail-text">',
          apiviewer.ui.panels.InfoPanel.createItemLinkHtml(node.getClass().getFullName()+"#"+node.getName()),
          '</div>'
        );
        return html.get();
      }
      else
      {
        return "";
      }
    },


    /**
     * Creates the HTML showing whether the item is overridden
     *
     * @param node {apiviewer.dao.ClassItem} item to get the the information from
     * @return {String} HTML fragment
     */
    createOverwriddenFromHtml : function(node)
    {
      if (node.getOverriddenFrom())
      {
        var html = new qx.util.StringBuilder(
          '<div class="item-detail-headline">', "Overrides:", '</div>',
          '<div class="item-detail-text">',
          apiviewer.ui.panels.InfoPanel.createItemLinkHtml(node.getOverriddenFrom().getFullName()+"#"+node.getName()),
          '</div>'
        );
        return html.get();
      }
      else
      {
        return "";
      }
    },


    /**
     * Creates the HTML showing whether the item is included from a mixin
     *
     * @param node {apiviewer.dao.ClassItem} item to get the the information from
     * @param currentClassDocNode {apiviewer.dao.Class} the current class shown in the class viewer
     * @return {String} HTML fragment
     */
    createIncludedFromHtml : function(node, currentClassDocNode)
    {
      if (node.getClass() != currentClassDocNode)
      {
        if (node.getClass().getType() == "mixin") {
          var html = new qx.util.StringBuilder(
            '<div class="item-detail-headline">', "Included from mixin:", '</div>',
            '<div class="item-detail-text">',
            apiviewer.ui.panels.InfoPanel.createItemLinkHtml(node.getClass().getFullName()+"#"+node.getName()),
            '</div>'
          );
          return html.get();
        }
      }
      else
      {
        return "";
      }
    },

    /**
     * Gets a class item from baseClassNode. if it is not found there, the class' hierarchy is searched until the item is found.
     *
     * @param itemName {String} the name of the item.
     * @param baseClassNode {apiviewer.dao.Class} class doc node
     * @return {apiviewer.dao.ClassItem} the classItem
     *
     */
    __getItemFromClassHierarchy : function(itemName,baseClassNode)
    {
      var itemNode = baseClassNode.getItem(itemName);
      if(itemNode)
      {
        return itemNode;
      }
      else
      {
        var classNodes = baseClassNode.getClassHierarchy();
        for (var i=0,l=classNodes.length; i<l; i++)
        {
          var currClassNode = classNodes[i];
          itemNode = currClassNode.getItem(itemName);
          if (itemNode) {
            break;
          }
        }
        return itemNode;
      }
    },


    /**
     * Creates the HTML showing the description of an item.
     *
     * @param node {apiviewer.dao.Node} the doc node of the item.
     * @param packageBaseClass {apiviewer.dao.Class|apiviewer.dao.Package?null} the doc node of the class to use for
     *          auto-adding packages.
     * @param showDetails {Boolean} whether to show details. If <code>false</code>
     *          only the first sentence of the description will be shown.
     * @return {String} the HTML showing the description.
     */
    createDescriptionHtml : function(node, packageBaseClass, showDetails)
    {
      var desc = node.getDescription();

      if (desc)
      {
        if (!showDetails) {
          desc = this.__extractFirstSentence(desc);
        }
        return '<div class="item-desc">' + this.resolveLinkAttributes(desc, packageBaseClass) + '</div>';
      }
      else
      {
        return "";
      }
    },


    /**
     * Extracts the first sentence from a text.
     *
     * @param text {String} the text.
     * @return {String} the first sentence from the text.
     */
    __extractFirstSentence : function(text)
    {
      var ret = text;

      // Extract first block
      var pos = ret.indexOf("</p>");

      if (pos != -1)
      {
        ret = ret.substr(0, pos + 4);

        var hit = this.SENTENCE_END_REGEX.exec(ret);

        if (hit != null) {
          ret = text.substring(0, hit.index + hit[0].length - 1) + "</p>";
        }
      }

      return ret;
    },


    /**
     * Returns whether the description of an item has details (has more than one
     * sentence).
     *
     * @param node {apiviewer.dao.Node} the doc node of the item.
     * @return {Boolean} whether the description of an item has details.
     */
    descriptionHasDetails : function(node)
    {
      var desc = node.getDescription();
      if (desc) {
        return this.__extractFirstSentence(desc) != desc;
      }
      else
      {
        return false;
      }
    },


    /**
     * Creates the HTML showing the type of a doc node.
     *
     * @param typeNode {apiviewer.dao.ClassItem} the doc node to show the type for.
     * @param defaultType {String} the type name to use if <code>typeNode</code> is
     *          <code>null</code> or defines no type.
     * @param useShortName {Boolean?true} whether to use short class names
     *          (without package).
     * @return {String} the HTML showing the type.
     */
    createTypeHtml : function(typeNode, defaultType, useShortName)
    {

      if (useShortName == null) {
        useShortName = true;
      }

      var types = [];
      var typeDimensions, typeName, linkText;

      if (typeNode) {
        types = typeNode.getTypes();
      }

      var typeHtml = new qx.util.StringBuilder()
      if (types.length == 0) {
        typeHtml.add(defaultType);
      }
      else
      {
        if (types.length > 1) {
          typeHtml.add("(");
        }

        for (var j=0; j<types.length; j++)
        {
          if (j > 0) {
            typeHtml.add(" | ");
          }

          typeName = types[j].type;
          typeDimensions = types[j].dimensions;

          if (apiviewer.ui.ClassViewer.PRIMITIVES[typeName]) {
            if(apiviewer.ui.ClassViewer.MDC_LINKS[typeName]) {
              typeHtml.add('<span style="white-space: nowrap;"><a href="'+apiviewer.ui.ClassViewer.MDC_LINKS[typeName]+'" target="_blank" title="'+typeName+'">'+typeName+'</a></span>');
            } else {
              typeHtml.add(typeName);
            }
          }
          else
          {
            linkText = typeName;

            if (useShortName)
            {
              var lastDot = typeName.lastIndexOf(".");

              if (lastDot != -1) {
                linkText += " " + typeName.substring(lastDot + 1);
              }
            }
            typeHtml.add(apiviewer.ui.panels.InfoPanel.createItemLinkHtml(linkText, typeNode.getClass(), false, true));
          }

          if (typeDimensions)
          {
            for (var i=0; i<parseInt(typeDimensions); i++) {
              typeHtml.add("[]");
            }
          }
        }

        if (types.length > 1) {
          typeHtml.add(")");
        }
      }

      return typeHtml.get();
    },


    /**
     * Creates the HTML showing the documentation errors of an item.
     *
     * @param node {apiviewer.dao.Node} the doc node of the item.
     * @param currentClassDocNode {Map} the doc node of the currently displayed class
     * @return {String} the HTML showing the documentation errors.
     */
    createErrorHtml : function(node, currentClassDocNode)
    {
      var docNode = node.getDocNode();

      var errors = docNode.getErrors();

      if (errors.length > 0)
      {
        var html = new qx.util.StringBuilder(
          '<div class="item-detail-error">', "Documentation errors:", '</div>'
        );

        for (var i=0; i<errors.length; i++)
        {
          html.add('<div class="item-detail-text">', errors[i].attributes.msg, " <br/>");

          if (errors[i].attributes.line || node.getClass() != currentClassDocNode) {
            html.add("(");

            if (node.getClass() != currentClassDocNode) {
              html.add(node.getClass().getFullName(), "; ");
            }

            if (errors[i].attributes.line) {
              html.add("Line: ", errors[i].attributes.line);
              if (errors[i].attributes.column) {
                html.add(", Column:", errors[i].attributes.column);
              }
            }
            html.add(")");
          }
          html.add("</div>");
        }

        return html.get();
      }
      else
      {
        return "";
      }
    },


    /**
     * Creates the HTML showing whether the item is deprecated
     *
     * @param node {apiviewer.dao.ClassItem} the doc node of the item.
     * @param itemName {String} type of the item, e.g. "method", "property", "constant", ...
     * @return {String} the HTML fragment.
     */
    createDeprecationHtml : function(node, itemName)
    {
      if (!node.isDeprecated()) {
        return "";
      }

      var html = new qx.util.StringBuilder();
      html.add('<div class="item-detail-error">', "Deprecated:", '</div>');

      html.add('<div class="item-detail-text">');
      var desc = node.getDeprecationText();
      if (desc) {
        html.add(desc);
      } else {
        html.add("This ", itemName, " is deprecated!");
      }
      html.add('</div>');
      return html.get();
    },


    /**
     * Creates the HTML showing the access protection for a class item.
     *
     * @param node {apiviewer.dao.ClassItem} the doc node of the item.
     * @return {String} the HTML fragment.
     */
    createAccessHtml : function(node)
    {
      if (node.isPublic()) {
        return "";
      }

      var html = new qx.util.StringBuilder();
      html.add('<div class="item-detail-headline">', "Access:", '</div>');
      html.add('<div class="item-detail-text">');
      var access = [];
      if (node.isPrivate()) {
        access.push("private");
      }
      if (node.isInternal()) {
        access.push("internal");
      }
      if (node.isProtected()) {
        access.push("protected");
      }
      html.add(access.join(" "));
      html.add('</div>');
      return html.get();
    },


    /**
     * Creates the HTML showing interfaces requiring this node
     *
     * @param node {apiviewer.dao.ClassItem} the doc node of the item.
     * @return {String} the HTML.
     */
    createInfoRequiredByHtml : function(node)
    {
      var html = new qx.util.StringBuilder();
      var requiredBy = node.getRequiredBy();
      if (requiredBy.length > 0) {
        html.add('<div class="item-detail-headline">', "Required by:", '</div>');
        for (var i=0; i<requiredBy.length; i++) {
          html.add(
            '<div class="item-detail-text">',
            apiviewer.ui.panels.InfoPanel.createItemLinkHtml(requiredBy[i].getFullName()+"#"+node.getName()),
            '</div>'
          );
        }
      }
      return html.get();
    },


    /**
     * Creates the link to the source file that definen an item
     *
     * @param node {apiviewer.dao.ClassItem} the doc node of the item.
     * @return {String} the HTML.
     */
    createSourceLinkHtml : function(node)
    {
      if (!node.getLineNumber || !node.getLineNumber()) {
        return "";
      }

      var sourceUri = apiviewer.ui.ClassViewer.getSourceUri(node);
      if (!sourceUri) {
        return "";
      }

      var title;
      if (node instanceof apiviewer.dao.Class) {
        title = node.getFullName();
      }
      else {
        title = node.getClass().getFullName() + "#" + node.getName();
      }

      var html = new qx.util.StringBuilder();
      html.add('<div class="item-detail-headline">', "View Source:", '</div>');
      html.add(
        '<div class="item-detail-text">',
        '<a href="' + sourceUri + '" target="_blank">' + title + '</a>',
        '</div>');

      return html.get();
    },


    /**
     * Creates the link to class where the method has been attached from.
     *
     * @param node {apiviewer.dao.ClassItem} the doc node of the item.
     * @return {String} the HTML.
     */
    createAttachedFrom : function(method) {
      if (method.getAttachedFrom()) {
        var html = new qx.util.StringBuilder();
        html.add('<div class="item-detail-headline">', "Attached from:", '</div>');
        html.add(
          '<div class="item-detail-text">',
          this.createItemLinkHtml(method.getAttachedFrom(), method.getClass()),
          '</div>');

        return html.get();
      }
      return "";
    },


    /**
     * Wraps a HTML fragment with a "span" element with CSS classes for
     * the item.
     *
     * @param node {apiviewer.dao.Class} class doc node
     * @param title {String} original title
     * @return {String} HMTL fragment
     */
    setTitleClass : function(node, title)
    {
      var html = ["<span class='","","'>", title, "</span>"];
      html[1] = this.getItemCssClasses(node);
      return html.join("");
    },


    /**
     * Gets CSS classes for a class item
     *
     * @param node {apiviewer.dao.Class} class doc node
     * @return {String} CSS classes separated by " "
     */
    getItemCssClasses : function(node)
    {
      var cssClasses = [];
      if (node.isDeprecated()) {
        cssClasses.push("item-deprecated");
      }
      if (node.isPrivate()) {
        cssClasses.push("item-private");
      }
      if (node.isInternal()) {
        cssClasses.push("item-internal");
      }
      if (node.isProtected()) {
        cssClasses.push("item-protected");
      }
      return cssClasses.join(" ");
    }

  },


  members :
  {

    /**
     * Whether the panel can display the given item node
     *
     * @return {Boolean} Whether the panel can display the given item node
     */
    canDisplayItem : function(itemNode)
    {
      return (itemNode.getListName() == this.getListName());
    },


    /**
     * Get the type HTML string of an item.
     *
     * @abstract
     * @param node {apiviewer.dao.ClassItem} the doc node of the item.
     * @param currentClassDocNode {apiviewer.dao.Class} the doc node of the currently displayed class
     * @return {String} the HTML showing the information about the method.
     */
    getItemTypeHtml : function(node, currentClassDocNode) {
      throw new Error("Abstract method called!");
    },


    /**
     * Get the title HTML string of an item.
     *
     * @abstract
     * @param node {apiviewer.dao.ClassItem} the doc node of the item.
     * @param currentClassDocNode {apiviewer.dao.Class} the doc node of the currently displayed class
     * @return {String} the HTML showing the information about the method.
     */
    getItemTitleHtml : function(node, currentClassDocNode) {
      throw new Error("Abstract method called!");
    },


    /**
     * Get the description text HTML string of an item.
     *
     * @abstract
     * @param node {apiviewer.dao.ClassItem} the doc node of the item.
     * @param currentClassDocNode {apiviewer.dao.Class} the doc node of the currently displayed class
     * @param showDetails {Boolean} whether to show the details.
     * @return {String} the HTML showing the information about the method.
     */
    getItemTextHtml : function(node, currentClassDocNode, showDetails) {
      throw new Error("Abstract method called!");
    },


    getItemTooltip : function(node, currentClassDocNode)
    {
      return "";
    },


    /**
     * Creates the HTML showing the information about a class item.
     * The root HTML element must be a table row (&lt;tr&gt;).
     *
     * @abstract
     * @param node {apiviewer.dao.ClassItem} the doc node of the item.
     * @param showDetails {Boolean} whether to show the details.
     * @return {String} the HTML showing the information about the method.
     */
    getItemHtml : function(node, currentDocNode, showDetails)
    {
      if ( (node instanceof apiviewer.dao.Class) || node instanceof apiviewer.dao.Package) {
        var parentNode = node.getPackage();
      } else {
        var parentNode = node.getClass();
      }
      var html = new qx.util.StringBuilder();

      var inherited =
      (parentNode != currentDocNode) &&
      parentNode.getType() == "class";
      var iconUrl = apiviewer.TreeUtil.getIconUrl(node, inherited);

      // Create the title row
      html.add('<tr class="', apiviewer.ui.panels.InfoPanel.getItemCssClasses(node), '">');
      var tooltipText = this.getItemTooltip(node, currentDocNode);
      var tooltip = tooltipText ? 'title="'+ tooltipText +'" alt="' + tooltipText + '"' : '';
      html.add('<td class="icon" ', tooltip, '>', apiviewer.ui.ClassViewer.createImageHtml(iconUrl), '</td>');

      var typeHtml = this.getItemTypeHtml(node, currentDocNode);
      html.add('<td class="type">', ((typeHtml) ? (typeHtml + "&nbsp;") : "&nbsp;"), '</td>');

      html.add('<td class="toggle">');

      if (this.itemHasDetails(node, currentDocNode))
      {
        // This node has details -> Show the detail button
        html.add(
          '<img src="', qx.util.ResourceManager.getInstance().toUri("apiviewer/image/open.gif"),
          '" onclick="', this.__encodeObject(this), ".toggleShowItemDetails('",
          node.getName(), "'" ,
          ((parentNode != currentDocNode) ? ",'" + parentNode.getFullName() + "'" : ""),
          ')"/>'
        );
      }
      else
      {
        html.add("&#160;");
      }

      html.add('</td>');

      html.add('<td class="text">');

      // Create headline
      html.add('<h3');

      if (this.itemHasDetails(node, currentDocNode)) {
        html.add(
          ' onclick="', this.__encodeObject(this), ".toggleShowItemDetails('",
          node.getName(), "'",
          ((parentNode != currentDocNode) ? ",'" + parentNode.getFullName() + "'" : ""),
          ')">'
        );
      } else {
        html.add('>');
      }

      html.add(this.getItemTitleHtml(node, currentDocNode));

      html.add('</h3>');

      // Create content area
      html.add('<div _itemName="', node.getName(), '">');
      html.add(this.getItemTextHtml(node, currentDocNode, showDetails));
      html.add('</div>');

      html.add('</td>');
      html.add('</tr>');
      return html.get();
    },


    /**
     * Checks whether a class item has details.
     * This method is abstract. Sub classes must override it.
     *
     * @abstract
     * @param node {apiviewer.dao.ClassItem} the doc node of the item.
     * @param currentClassDocNode {apiviewer.dao.Class} the doc node of the currently displayed class
     * @return {Boolean} whether the class item has details.
     */
    itemHasDetails : function(node, currentClassDocNode) {return true;},


    __encodeObject : function(object)
    {
      return "apiviewer.ObjectRegistry.getObjectFromHashCode('"+object.toHashCode()+"')";
    },


    /**
     * Get the HTML fragment of the info panel
     *
     * @return {String} HTML fragment of the info panel
     */
    getPanelHtml : function(viewer)
    {
      var uppercaseLabelText = this._labelText.charAt(0).toUpperCase() + this._labelText.substring(1);

      var html = new qx.util.StringBuilder('<div class="info-panel"><h2>');
      html.add(
        '<img class="openclose" src="',
        qx.util.ResourceManager.getInstance().toUri('apiviewer/image/' + (this.getIsOpen() ? 'close.gif' : 'open.gif')),
        '" onclick="', this.__encodeObject(viewer),
        '.togglePanelVisibility(' + this.__encodeObject(this), ')"/> ',
        '<span onclick="', this.__encodeObject(viewer),
        '.togglePanelVisibility(', this.__encodeObject(this), ')">',
        uppercaseLabelText, '</span>'
      );

      html.add('</h2><div></div></div>');

      return html.get();
    },


    /**
     * Retuns a list of all items to display in the panel
     *
     * @param showInherited {Boolean} whether to show inherited items
     * @param currentClassDocNode {apiviewer.dao.Class} the currently displayed class
     * @return {apiviewer.dao.ClassItem[]} list of all items to display in the panel
     */
    _getPanelItems : function(showInherited, showIncluded, currentClassDocNode)
    {

      if (!currentClassDocNode) {
        return [];
      }

      var listName = this.getListName();
      var nodeArr = [];
      var fromClassHash = {};

      // Get the classes to show
      if (
        showInherited &&
        (
          listName == "events" ||
          listName == "properties" ||
          listName == "methods"
          )
        )
        {
        if (currentClassDocNode.getType() == "interface") {
          var classNodes = currentClassDocNode.getInterfaceHierarchy();
        } else {
          var classNodes = currentClassDocNode.getClassHierarchy();
        }

      } else {
        classNodes = [currentClassDocNode];
      }

      for (var classIndex=0; classIndex<classNodes.length; classIndex ++)
      {
        var currClassNode = classNodes[classIndex];
        var currNodeArr = currClassNode.getItemList(listName);
        if (
          showIncluded &&
          (
            listName == "events" ||
            listName == "properties" ||
            listName == "methods"
          )
          ) {
          currNodeArr = currNodeArr.concat(currClassNode.getNodesOfTypeFromMixins(this.getListName()));
        }
        // Add the nodes from this class
        for (var i=0; i<currNodeArr.length; i++)
        {
          var name = currNodeArr[i].getName();
          if (!(Object.prototype.hasOwnProperty.call(fromClassHash, name)))
          {
            fromClassHash[name] = currClassNode;
            nodeArr.push(currNodeArr[i]);
          }
        }
      }

      return nodeArr;
    },


    /**
     * Filter the item list to display only the desired items.
     *
     * @param nodeArr {apiviewer.dao.ClassItem[]} array of class items
     * @param showProtected {Boolean} whether to show protected items
     * @param showPrivate {Boolean} whether to show private items
     * @param showInternal {Boolean} whether to show internal items
     * @return {apiviewer.dao.ClassItem[]} filtered list of items
     */
    __filterItems : function(nodeArr, expandProperties, showProtected, showPrivate, showInternal)
    {
      var copyArr = nodeArr.concat();
      for (var i=nodeArr.length-1; i>=0; i--)
      {
        var node = nodeArr[i];
        if (node.isPropertyGenerated() && !expandProperties) {
          qx.lang.Array.removeAt(copyArr, i);
        }
        else if (node.isPrivate() && !showPrivate) {
          qx.lang.Array.removeAt(copyArr, i);
        }
        else if (node.isProtected() && !showProtected) {
          qx.lang.Array.removeAt(copyArr, i);
        }
        else if (node.isInternal() && !showInternal) {
          qx.lang.Array.removeAt(copyArr, i);
        }
      }

      return copyArr;
    },

    _displayNodes : function(nodes, currentClassDocNode)
    {
      // Show the nodes
      if (nodes && nodes.length > 0)
      {
        var html = new qx.util.StringBuilder(
          '<table cellspacing="0" cellpadding="0" class="info" width="100%">'
        );

        for (var i=0; i<nodes.length; i++) {
          html.add(this.getItemHtml(nodes[i], currentClassDocNode, false));
        }

        html.add('</table>');

        this.getBodyElement().innerHTML = html.get();
        this._postProcessLinks(this.getBodyElement());
        apiviewer.ui.AbstractViewer.fixLinks(this.getBodyElement());
        apiviewer.ui.AbstractViewer.highlightCode(this.getBodyElement());
        this.getBodyElement().style.display = !this.getIsOpen() ? "none" : "";
        this.getElement().style.display = "";
      }
      else
      {
        this.getElement().style.display = "none";
      }
    },


    /**
     * Updates an info panel.
     *
     * @param classViewer {apiviewer.ui.ClassViewer} parent class viewer widget.
     * @param currentClassDocNode {apiviewer.dao.Class} the currently displayed class
     */
    update : function(classViewer, currentClassDocNode)
    {
      if (!this.getElement()) {
        return;
      }

      this.setDocNode(currentClassDocNode);

      var showInherited = classViewer.getShowInherited();
      var showIncluded = classViewer.getShowIncluded();
      var nodeArr = this._getPanelItems(showInherited, showIncluded, currentClassDocNode);

      if (nodeArr && nodeArr.length > 0)
      {
        var expandProperties = classViewer.getExpandProperties();
        var showProtected = classViewer.getShowProtected();
        var showPrivate = classViewer.getShowPrivate();
        var showInternal = classViewer.getShowInternal();

        nodeArr = this.__filterItems(nodeArr, expandProperties, showProtected, showPrivate, showInternal);
        classViewer.sortItems(nodeArr);
      }

      this._displayNodes(nodeArr, currentClassDocNode);
    },


    _applyElement : function(element)
    {
      this._titleElement = element.firstChild;
      this._bodyElement = element.lastChild;
    },


    /** DOM node of the title of the panel */
    getTitleElement : function() {
      return this._titleElement;
    },


    /** DOM node of the body of the panel */
    getBodyElement : function() {
      return this._bodyElement;
    },


    /**
     * Gets the HTML element showing the details of an item.
     *
     * @param panel {InfoPanel} the info panel of the item.
     * @param name {String} the item's name.
     * @return {Element} the HTML element showing the details of the item.
     * @ignore(getElementsByTagName)
     */
    getItemElement : function(name)
    {
      var elemArr = this.getBodyElement().getElementsByTagName("TBODY")[0].childNodes;

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
     * Event handler. Called when the user clicked a button for showing/hiding the
     * details of an item.
     *
     * @param panelHashCode {Integer} hash code of the panel object.
     * @param name {String} the name of the item.
     * @param fromClassName {String} the name of the class the item the item was
     *          defined in.
     */
    toggleShowItemDetails : function(itemName, fromClassName)
    {
      try
      {
        var textDiv = this.getItemElement(itemName);

        if (!textDiv) {
          throw Error("Element for name '" + itemName + "' not found!");
        }

        var showDetails = textDiv._showDetails ? !textDiv._showDetails : true;
        textDiv._showDetails = showDetails;

        if (fromClassName) {
          var fromClassNode = apiviewer.dao.Class.getClassByName(fromClassName);
        } else {
          fromClassNode = this.getDocNode();
        }
        var node = fromClassNode.getItemByListAndName(this.getListName(), itemName);

        // Update the close/open image
        var opencloseImgElem = textDiv.parentNode.previousSibling.firstChild;
        opencloseImgElem.src = qx.util.ResourceManager.getInstance().toUri(showDetails ? 'apiviewer/image/close.gif' : 'apiviewer/image/open.gif');

        // Update content
        textDiv.innerHTML = this.getItemTextHtml(node, this.getDocNode(), showDetails);
        this._postProcessLinks(textDiv);
        apiviewer.ui.AbstractViewer.fixLinks(textDiv);
        apiviewer.ui.AbstractViewer.highlightCode(textDiv);
      }
      catch(exc)
      {
        this.error("Toggling item details failed");
        this.error(exc);
      }
    },


    /**
     * Convert mouseup and click listener attached to tap / pointerup listener.
     * @param el {Element} The element containing the links.
     */
    _postProcessLinks : function(el) {
      if (el._processed) {
        return;
      }
      q(el).on("pointerup", function(e) {
        var target = e.getTarget();
        var mouseup = target.getAttribute("onmouseup");
        if (mouseup) {
          target.removeAttribute("onmouseup");
          target.setAttribute("oldonmouseup", mouseup);
        } else {
          mouseup = target.getAttribute("oldonmouseup");
        }

        if (mouseup) {
          Function(mouseup)();
        }
      });

      q(el).on("tap", function(e) {
        var onClickValue = "event.preventDefault ? event.preventDefault() : event.returnValue = false; return false;";
        var target = e.getTarget();
        var click = target.getAttribute("onclick");
        if (click && click != onClickValue) {
          target.removeAttribute("onclick");
          target.setAttribute("oldonclick", click);
          target.setAttribute("onclick", onClickValue);
        } else {
          click = target.getAttribute("oldonclick");
        }

        if (click) {
          Function(click)();
        }
      });

      el._processed = true;
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._titleElement = this._bodyElement = null;
  }
});
