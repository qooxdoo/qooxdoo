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
     * @type member
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
     * @type member
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
      if (useIcon == null) {
        useIcon = true;
      }

      linkText = qx.lang.String.trim(linkText);

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

          // Make the item name absolute
          if (className == null || className.length == 0)
          {
            // This is a relative link to a method -> Add the current class
            className = packageBaseClass.getFullName();
          }
          else if (packageBaseClass && className.indexOf(".") == -1)
          {
            // The class name has no package -> Use the same package as the current class
            var name = packageBaseClass.getName();
            if (packageBaseClass instanceof apiviewer.dao.Package) {
              var packageName = packageBaseClass.getFullName();
            } else {
              var fullName = packageBaseClass.getFullName();
              var packageName = fullName.substring(0, fullName.length - name.length - 1);
            }
            className = packageName + "." + className;
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
            var classNode = apiviewer.dao.Class.getClassByName(className);

            if (classNode)
            {
              var itemNode;

              if (itemName)
              {
                // The links points to a item of the class
                var cleanItemName = itemName.substring(1);
                var parenPos = cleanItemName.indexOf("(");

                if (parenPos != -1) {
                  cleanItemName = qx.lang.String.trim(cleanItemName.substring(0, parenPos));
                }
                itemNode = classNode.getItem(cleanItemName);
              }
              else
              {
                // The links points to the class
                itemNode = classNode;
              }

              if (itemNode)
              {
                var iconUrl = apiviewer.TreeUtil.getIconUrl(itemNode);
                var iconCode = apiviewer.ui.ClassViewer.createImageHtml(iconUrl);
              }
            }
          }

          // Create a real bookmarkable link
          // NOTE: The onclick-handler must be added by HTML code. If it
          //       is added using the DOM element then the href is followed.
          var fullItemName = className + (itemName ? itemName : "");

          var linkHtml = new qx.util.StringBuilder(
            '<span style="white-space: nowrap;">',
            (typeof iconCode != "undefined" ? iconCode : ""),
            '<a href="' + window.location.protocol, '//',
            window.location.pathname, '#', fullItemName,
            '" onclick="', 'apiviewer.ui.ClassViewer.instance._onSelectItem(\'',
            fullItemName, '\'); return false;"', ' title="',
            fullItemName, '">', label, '</a></span>'
          )
          return linkHtml.get();
        }
      }
    },


    /**
     * Creates the HTML showing the &#64;see attributes of an item.
     *
     * @type member
     * @param node {apiviewer.dao.ClassItem} the doc node of the item.
     * @return {String} the HTML showing the &#64;see attributes.
     */
    createSeeAlsoHtml : function(node)
    {
      var ClassViewer = apiviewer.ui.ClassViewer;

      var see = node.getSee();
      if (see.length > 0)
      {
        var seeAlsoHtml = new qx.util.StringBuilder();

        for (var i=0; i<see.length; i++)
        {
           if (seeAlsoHtml.length != 0) {
             seeAlsoHtml.add(", ");
           }

           seeAlsoHtml.add(this.createItemLinkHtml(see[i].getName(), node.getClass()));
        }

        if (!seeAlsoHtml.isEmpty())
        {
          // We had @see attributes
          seeAlsoHtml.add(
            '<div class="item-detail-headline">', "See also:", '</div>',
            '<div class="item-detail-text">', seeAlsoHtml, '</div>'
          )
          return seeAlsoHtml.get()
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
     var ClassViewer = apiviewer.ui.ClassViewer;
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
      var ClassViewer = apiviewer.ui.ClassViewer;
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
      var ClassViewer = apiviewer.ui.ClassViewer;
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
     * Creates the HTML showing the description of an item.
     *
     * @type member
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
     * @type member
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
     * @type member
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
     * @type member
     * @param typeNode {apiviewer.dao.ClassItem} the doc node to show the type for.
     * @param defaultType {String} the type name to use if <code>typeNode</code> is
     *          <code>null</code> or defines no type.
     * @param useShortName {Boolean,true} whether to use short class names
     *          (without package).
     * @return {String} the HTML showing the type.
     */
    createTypeHtml : function(typeNode, defaultType, useShortName)
    {

      if (useShortName == null) {
        useShortName = true;
      }

      var types = [];
      var typeDimensions, typeName, linkText, dims;

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
            typeHtml.add(typeName);
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
     * @type member
     * @param node {apiviewer.dao.Node} the doc node of the item.
     * @param currentClassDocNode {Map} the doc node of the currently displayed class
     * @return {String} the HTML showing the documentation errors.
     */
    createErrorHtml : function(node, currentClassDocNode)
    {
      var ClassViewer = apiviewer.ui.ClassViewer;
      docNode = node.getDocNode();

      var errors = docNode.getErrors();

      if (errors.length > 0)
      {
        var html = new qx.util.StringBuilder(
          '<div class="item-detail-error">', "Documentation errors:", '</div>'
        );

        for (var i=0; i<errors.length; i++)
        {
          html.add('<div class="item-detail-text">', errors[i].attributes.msg, " <br/>");
          html.add("(");

          if (node.getClass() != currentClassDocNode) {
            html.add(node.getClass().getFullName(), "; ");
          }

          html.add("Line: ", errors[i].attributes.line, ", Column:", errors[i].attributes.column + ")", '</div>');
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
     * @type member
     * @param node {apiviewer.dao.ClassItem} the doc node of the item.
     * @param itemName {String} type of the item, e.g. "method", "property", "constant", ...
     * @return {String} the HTML fragment.
     */
    createDeprecationHtml : function(node, itemName)
    {
      if (!node.isDeprecated()) {
        return "";
      }

      var ClassViewer = apiviewer.ui.ClassViewer;
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
     * @type member
     * @param node {apiviewer.dao.ClassItem} the doc node of the item.
     * @return {String} the HTML fragment.
     */
    createAccessHtml : function(node)
    {
      if (node.isPublic()) {
        return "";
      }

      var ClassViewer = apiviewer.ui.ClassViewer;
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
     * @type member
     * @param node {apiviewer.dao.ClassItem} the doc node of the item.
     * @return {String} the HTML.
     */
    createInfoRequiredByHtml : function(node)
    {
      var ClassViewer = apiviewer.ui.ClassViewer;
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
     * @type member
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
          '<img src="', qx.io.Alias.getInstance().resolve("api/image/open.gif"),
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
     * @type member
     * @abstract
     * @param node {apiviewer.dao.ClassItem} the doc node of the item.
     * @param currentClassDocNode {apiviewer.dao.Class} the doc node of the currently displayed class
     * @return {Boolean} whether the class item has details.
     * @signature function(node, currentClassDocNode)
     */
    itemHasDetails : qx.lang.Function.returnTrue,


    __encodeObject : function(object)
    {
      return "apiviewer.ObjectRegistry.getObjectFromHashCode("+object.toHashCode()+")";
    },


    /**
     * Get the HTML fragmet of the info panel
     *
     * @return {String} HTML fragment of the info panel
     */
    getPanelHtml : function(viewer)
    {
      var uppercaseLabelText = this._labelText.charAt(0).toUpperCase() + this._labelText.substring(1);

      var html = new qx.util.StringBuilder('<div class="info-panel"><h2>');
      html.add(
        '<img class="openclose" src="',
        qx.io.Alias.getInstance().resolve('api/image/' + (this.getIsOpen() ? 'close.gif' : 'open.gif')),
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
    _getPanelItems : function(showInherited, currentClassDocNode)
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
        var classNodes = currentClassDocNode.getClassHierarchy();
      } else {
        classNodes = [currentClassDocNode];
      }

      for (var classIndex=0; classIndex<classNodes.length; classIndex ++)
      {
        var currClassNode = classNodes[classIndex];
        var currNodeArr = currClassNode.getItemList(this.getListName());
        if (
          listName == "events" ||
          listName == "properties" ||
          listName == "methods"
        ) {
          qx.lang.Array.append(currNodeArr, currClassNode.getNodesOfTypeFromMixins(this.getListName()));
        }
        // Add the nodes from this class
        for (var i=0; i<currNodeArr.length; i++)
        {
          var name = currNodeArr[i].getName();
          if (!fromClassHash[name])
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
     * @return {apiviewer.dao.ClassItem[]} filtered list of items
     */
    __filterItems : function(nodeArr, showProtected, showPrivate)
    {
      if (showProtected && showPrivate) {
        return nodeArr;
      }

      copyArr = nodeArr.concat();
      for (var i=nodeArr.length-1; i>=0; i--)
      {
        var node = nodeArr[i];
        if (node.isPrivate() && !showPrivate) {
          qx.lang.Array.removeAt(copyArr, i);
        }

        if (node.isProtected() && !showProtected) {
          qx.lang.Array.removeAt(copyArr, i);
        }

        if (node.isInternal() && !showPrivate) {
            qx.lang.Array.removeAt(copyArr, i);
        }
      }

      return copyArr;
    },


    /**
     * Sorts the nodes in place.
     *
     * @param nodeArr {apiviewer.dao.ClassItem[]} array of class items
     */
    _sortItems : function(nodeArr)
    {
      // Sort the nodeArr by name
      // Move protected methods to the end
      nodeArr.sort(function(obj1, obj2)
      {
        sum1 = 0;
        if (obj1.isInternal()) {
          sum1 += 4;
        }
        if (obj1.isPrivate()) {
          sum1 += 2;
        }
        if (obj1.isProtected()) {
          sum1 += 1;
        }

        sum2 = 0;
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

          /*
          if (obj1.getFromProperty && obj1.getFromProperty()) {
            var name1 = obj1.getFromProperty().getName();
          }

          if (obj2.getFromProperty && obj2.getFromProperty()) {
            var name2 = obj2.getFromProperty().getName();
          }
          */
          return name1.toLowerCase() < name2.toLowerCase() ? -1 : 1;
        }
        else
        {
          return sum1 - sum2;
        }
      });
    },


    _displayNodes : function(nodes, currentClassDocNode)
    {
      // Show the nodes
      if (nodes && nodes.length > 0)
      {
        var html = new qx.util.StringBuilder(
          '<table cellspacing="0" cellpadding="0" class="info" width="100%">'
        );

        for (var i=0; i<nodes.length; i++)
        {
          html.add(this.getItemHtml(nodes[i], currentClassDocNode, false));
        }

        html.add('</table>');

        this.getBodyElement().innerHTML = html.get();
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
      this.setDocNode(currentClassDocNode);

      var showProtected = classViewer.getShowProtected();
      var showInherited = classViewer.getShowInherited();
      var showPrivate = classViewer.getShowPrivate();

      var nodeArr = this._getPanelItems(showInherited, currentClassDocNode);

      if (nodeArr && nodeArr.length > 0)
      {
        nodeArr = this.__filterItems(nodeArr, showProtected, showPrivate);
        this._sortItems(nodeArr);
      }

      this._displayNodes(nodeArr, currentClassDocNode);
    },


    _applyElement : function(element)
    {
      this._titleElement = element.firstChild;
      this._bodyElement = element.lastChild;
    },


    /** DOM node of the title of the panel */
    getTitleElement : function()
    {
      return this._titleElement;
    },


    /** DOM node of the body of the panel */
    getBodyElement : function()
    {
      return this._bodyElement;
    },


    /**
     * Gets the HTML element showing the details of an item.
     *
     * @type member
     * @param panel {InfoPanel} the info panel of the item.
     * @param name {String} the item's name.
     * @return {Element} the HTML element showing the details of the item.
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
     * @type member
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
        opencloseImgElem.src = qx.io.Alias.getInstance().resolve(showDetails ? 'api/image/close.gif' : 'api/image/open.gif');

        // Update content
        textDiv.innerHTML = this.getItemTextHtml(node, this.getDocNode(), showDetails);
        apiviewer.ui.AbstractViewer.fixLinks(textDiv);
        apiviewer.ui.AbstractViewer.highlightCode(textDiv);
      }
      catch(exc)
      {
        this.error("Toggling item details failed", exc);
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
    this._disposeFields("_titleElement", "_bodyElement");
  }
});
