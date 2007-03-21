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

qx.Class.define("apiviewer.InfoPanel", {

  type : "abstract",

  extend: qx.core.Object,

  /**
   * Creates an info panel. An info panel shows the information about one item
   * type (e.g. for public methods).
   *
   * @param viewer {ClassViewer} class viewer, which embeds the info panel
   * @param nodeType {Integer} the node type to create the info panel for.
   * @param listName {String} the name of the node list in the class doc node where
   *          the items shown by this info panel are stored.
   * @param labelText {String} the label text describing the node type.
   */
  construct: function(nodeType, listName, labelText)
  {
    this.setListName(listName);
    this.setNodeType(nodeType);
    this._nodeType = nodeType;
    this._labelText = labelText;
  },


  properties :
  {

    /** top level DOM node of the panel */
    infoElement : { _legacy: true },

    /** DOM node of the title of the panel */
    infoTitleElement : { _legacy: true },

    /** DOM node of the body of the panel */
    infoBodyElement : { _legacy: true },

    nodeType : { _legacy: true, type: "number"},
    listName : { _legacy: true, type: "string"},

    /** whether the info panel is open */
    isOpen : { _legacy: true, type: "boolean", defaultValue: true}
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
     * @param packageBaseClass {Map,null} the doc node of the class to use for
     *          auto-adding packages.
     * @return {var} TODOC
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
        html.add(description.substring(lastPos, hit.index) + this.createItemLinkHtml(hit[1], packageBaseClass));

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
     * @param packageBaseClass {Map,null} the doc node of the class to use when
     *          auto-adding the package to a class name having no package specified.
     *          If null, no automatic package addition is done.
     * @param useIcon {Boolean,true} whether to add an icon to the link.
     * @param useShortName {Boolean,false} whether to use the short name.
     * @return {var} TODOC
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
            var fullName = packageBaseClass.getFullName();
            var packageName = fullName.substring(0, fullName.length - name.length);
            className = packageName + className;
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
                var iconUrl = apiviewer.TreeUtil.getIconUrl(itemNode.getNode());
                var iconCode = apiviewer.ClassViewer.createImageHtml(iconUrl);
              }
            }
          }

          // Create a real bookmarkable link
          // NOTE: The onclick-handler must be added by HTML code. If it
          //       is added using the DOM element then the href is followed.
          var fullItemName = className + (itemName ? itemName : "");

          var linkHtml = new qx.util.StringBuilder(
            '<span style="white-space: nowrap;">',
            (typeof iconCode != "undefined" ?  iconCode : ""),
            '<a href="' + window.location.protocol, '//',
            window.location.pathname, '#', fullItemName,
            '" onclick="', 'document._detailViewer._selectItem(\'',
            fullItemName, '\'); return false;"', ' title="',
            fullItemName, '">', label, '</a></span>'
          )
          return linkHtml.get()
        }
      }
    },


    /**
     * Creates the HTML showing the &#64;see attributes of an item.
     *
     * @type member
     * @param node {Map} the doc node of the item.
     * @param fromClassNode {Map} the doc node of the class the item was defined.
     * @return {String} the HTML showing the &#64;see attributes.
     */
    createSeeAlsoHtml : function(node)
    {
      var ClassViewer = apiviewer.ClassViewer;

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
            ClassViewer.DIV_START_DETAIL_HEADLINE, "See also:", ClassViewer.DIV_END,
            ClassViewer.DIV_START_DETAIL_TEXT, seeAlsoHtml, ClassViewer.DIV_END
          )
          return seeAlsoHtml.get()
        }
      }

      // Nothing found
      return "";
    },


    /**
     * Creates the HTML showing the description of an item.
     *
     * @type member
     * @param node {Map} the doc node of the item.
     * @param fromClassNode {Map} the doc node of the class the item was defined.
     * @param showDetails {Boolean} whether to show details. If <code>false</code>
     *          only the first sentence of the description will be shown.
     * @return {String} the HTML showing the description.
     */
    createDescriptionHtml : function(node, showDetails)
    {
      var desc = node.getDescription();

      if (desc)
      {
        if (!showDetails) {
          desc = this.__extractFirstSentence(desc);
        }
        return apiviewer.ClassViewer.DIV_START_DESC + this.resolveLinkAttributes(desc, node.getClass()) + apiviewer.ClassViewer.DIV_END;
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
     * @param node {Map} the doc node of the item.
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
     * @param typeNode {Map} the doc node to show the type for.
     * @param packageBaseClass {Map} the doc node of the class <code>typeNode</code>
     *          belongs to.
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

          if (apiviewer.ClassViewer.PRIMITIVES[typeName]) {
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
            typeHtml.add(apiviewer.InfoPanel.createItemLinkHtml(linkText, typeNode.getClass(), false, true));
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
     * @param node {Map} the doc node of the item.
     * @param fromClassNode {Map} the doc node of the class the item was defined.
     * @param currentClassDocNode {Map} the doc node of the currently displayed class
     * @return {String} the HTML showing the documentation errors.
     */
    createErrorHtml : function(node, fromClassNode, currentClassDocNode)
    {
      var ClassViewer = apiviewer.ClassViewer;

      var errors = node.getErrors();

      if (errors.length > 0)
      {
        var html = new qx.util.StringBuilder(
          ClassViewer.DIV_START_ERROR_HEADLINE, "Documentation errors:", ClassViewer.DIV_END
        );

        for (var i=0; i<errors.length; i++)
        {
          html.add(ClassViewer.DIV_START_DETAIL_TEXT, errors[i].attributes.msg, " <br/>");
          html.add("(");

          if (fromClassNode && fromClassNode != currentClassDocNode) {
            html.add(fromClassNode.getFullName(), "; ");
          }

          html.add("Line: ", errors[i].attributes.line, ", Column:", errors[i].attributes.column + ")", ClassViewer.DIV_END);
        }

        return html.get();
      }
      else
      {
        return "";
      }
    },


    /**
     * Creates the HTML showing interfaces requiring this node
     *
     * @type member
     * @param node {Map} the doc node of the item.
     * @return {String} the HTML.
     */
    createInfoRequiredByHtml : function(node)
    {
      var ClassViewer = apiviewer.ClassViewer;
      var html = new qx.util.StringBuilder();
      var requiredBy = node.getRequiredBy();
      if (requiredBy.length > 0) {
        html.add(ClassViewer.DIV_START_DETAIL_HEADLINE, "Required by:", ClassViewer.DIV_END);
        for (var i=0; i<requiredBy.length; i++) {
          html.add(
            ClassViewer.DIV_START_DETAIL_TEXT,
            apiviewer.InfoPanel.createItemLinkHtml(requiredBy[i].getFullName()),
            ClassViewer.DIV_END
          );
        }
      }
      return html.get();
    },


    createDeprecatedTitle : function(node, title)
    {
      var html = ["<span class='item-title-deprecated'>", "", "</span>"];
      if (node.isDeprecated()) {
        html[1] = title;
        return html.join("");
      } else {
        return title;
      }
    },


    createDeprecationHtml : function(node, itemName)
    {
      var ClassViewer = apiviewer.ClassViewer;
      if (!node.isDeprecated()) {
        return "";
      }
      var html = new qx.util.StringBuilder();
      html.add(ClassViewer.DIV_START_ERROR_HEADLINE, "Deprecated:", ClassViewer.DIV_END);

      html.add(ClassViewer.DIV_START_DETAIL_TEXT);
      var desc = node.getDeprecationText();
      if (desc) {
        html.add(desc);
      } else {
        html.add("This ", itemName, " is deprecated!");
      }
      html.add(ClassViewer.DIV_END);
      return html.get();
    }


  },


  members :
  {

    /**
     * Creates the HTML showing the information about a method.
     *
     * This method is abstract. Sub classes must overwrite it.
     *
     * @type member
     * @abstract
     * @param node {Map} the doc node of the method.
     * @param fromClassNode {Map} the doc node of the class the method was defined.
     * @param currentClassDocNode {Map} the doc node of the currently displayed class
     * @param showDetails {Boolean} whether to show the details.
     * @return {String} the HTML showing the information about the method.
     */
    getItemHtml : function(node, fromClassNode, currentClassDocNode, showDetails) {},


    /**
     * Checks whether a method has details.
     *
     * This method is abstract. Sub classes must overwrite it.
     *
     * @type member
     * @abstract
     * @param node {Map} the doc node of the method.
     * @param fromClassNode {Map} the doc node of the class the method was defined.
     * @param currentClassDocNode {Map} the doc node of the currently displayed class
     * @return {Boolean} whether the method has details.
     * @signature function(node, fromClassNode, currentClassDocNode)
     */
    itemHasDetails : qx.lang.Function.returnTrue,


    /**
     * Get the HTML fragmet of the info panel
     *
     * @return {String} HTML fragment of the info panel
     */
    getPanelHtml : function()
    {
      var uppercaseLabelText = this._labelText.charAt(0).toUpperCase() + this._labelText.substring(1);

      var html = new qx.util.StringBuilder('<div class="infoPanel"><h2>');
      html.add(
        '<img class="openclose" src="',
        qx.manager.object.AliasManager.getInstance().resolvePath('api/image/' + (this.getIsOpen() ? 'close.gif' : 'open.gif')),
        '"', " onclick=\"document._detailViewer._onShowInfoPanelBodyClicked(" + this._nodeType + ")\"/> ",
        '<span ' + " onclick=\"document._detailViewer._onShowInfoPanelBodyClicked(" + this._nodeType + ")\">",
        uppercaseLabelText, '</span>'
      );

      html.add('</h2><div></div></div>');

      return html.get();
    },


    /**
     * Return a list of all nodes of panel from all mixins of a class
     *
     * @return {Map[]} list of all nodes of a panel from all mixins of the class
     */
    __addNodesOfTypeFromMixins : function(classNode, nodeArr, fromClassHash)
    {
      var mixins = classNode.getMixins();
      for (var mixinIndex=0; mixinIndex<mixins.length; mixinIndex++)
      {

        var self = this;
        var mixinRecurser = function(mixinNode)
        {
          var items = mixinNode.getItemList(self.getListName());
          for (var i=0; i<items.length; i++)
          {
            var name = items[i].getName();
            if (fromClassHash[name] == null)
            {
              fromClassHash[name] = mixinNode;
              nodeArr.push(items[i]);
            }
          }

          // recursive decent
          var superClasses = mixinNode.getSuperMixins();
          for (var i=0; i<superClasses.length; i++) {
            mixinRecurser(apiviewer.dao.Class.getClassByName(superClasses[i].getName()));
          }
        }

        var mixinNode = apiviewer.dao.Class.getClassByName(mixins[mixinIndex]);
        mixinRecurser(mixinNode);

      }
    },


    /**
     * Retuns a list of all items to display in the panel
     */
    _getPanelItems : function(showInherited, currentClassDocNode)
    {
      if (!currentClassDocNode) {
        return [];
      }

      var ClassViewer = apiviewer.ClassViewer;
      var nodeType = this.getNodeType();

      var nodeArr = [];
      var fromClassHash = {};
      var docTree = apiviewer.Viewer.instance.getDocTree();

      // Get the classes to show
      if (
        showInherited &&
        (
          nodeType == apiviewer.ClassViewer.NODE_TYPE_EVENT ||
          nodeType == apiviewer.ClassViewer.NODE_TYPE_PROPERTY ||
          nodeType == apiviewer.ClassViewer.NODE_TYPE_METHOD
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
        // Add the nodes from this class
        for (var i=0; i<currNodeArr.length; i++)
        {
          var name = currNodeArr[i].getName();

          if (fromClassHash[name] == null)
          {
            fromClassHash[name] = currClassNode;
            nodeArr.push(currNodeArr[i]);
          }
        }
        this.__addNodesOfTypeFromMixins(currClassNode, nodeArr, fromClassHash);
      }

      return nodeArr;
    },


    __filterProtectedItems : function(nodeArr)
    {
      copyArr = nodeArr.concat();

      for (var i=nodeArr.length-1; i>=0; i--)
      {
        var node = nodeArr[i];

        if (nodeArr[i].getName().charAt(0) == "_") {
          qx.lang.Array.removeAt(copyArr, i);
        }
      }

      return copyArr;
    },


    /**
     * Sorts the nodes in place.
     */
    _sortItems : function(nodeArr)
    {
      // Sort the nodeArr by name
      // Move protected methods to the end
      nodeArr.sort(function(obj1, obj2)
      {
        var n1 = obj1.getName();
        var n2 = obj2.getName();
        var p1 = n1.charAt(0) == "_";
        var p2 = n2.charAt(0) == "_";
        var h1 = n1.charAt(0) == "__";
        var h2 = n2.charAt(0) == "__";

        if (p1 == p2 && h1 == h2) {
          return n1.toLowerCase() < n2.toLowerCase() ? -1 : 1;
        } else {
          return h1 ? 1 : p1 ? 1 : -1;
        }
      });
    },


    /**
     * Updates an info panel.
     *
     * @type member
     * @return {void}
     */
    update : function(showProtected, showInherited, currentClassDocNode)
    {

      var nodeArr = this._getPanelItems(showInherited, currentClassDocNode);

      var ClassViewer = apiviewer.ClassViewer;
      var nodeType = this.getNodeType();

      if (nodeArr && nodeArr.length > 0)
      {
        // Filter protected
        if (
          nodeType == apiviewer.ClassViewer.NODE_TYPE_METHOD ||
          nodeType == apiviewer.ClassViewer.NODE_TYPE_METHOD_STATIC ||
          nodeType == apiviewer.ClassViewer.NODE_TYPE_PROPERTY
        ) {
          if (!showProtected) {
            nodeArr = this.__filterProtectedItems(nodeArr);
          }
        }

        this._sortItems(nodeArr);
      }

      // Show the nodes
      if (nodeArr && nodeArr.length > 0)
      {
        var html = new qx.util.StringBuilder('<table cellspacing="0" cellpadding="0" class="info" width="100%">');

        for (var i=0; i<nodeArr.length; i++)
        {
          var node = nodeArr[i];

          fromClassNode = node.getClass();

          var info = this.getItemHtml(node, fromClassNode, currentClassDocNode, false);
          var inherited =
            (fromClassNode != currentClassDocNode) &&
            fromClassNode.getType() == "class";
          var iconUrl = apiviewer.TreeUtil.getIconUrl(node.getNode(), inherited);

          // Create the title row
          html.add('<tr>');

          html.add('<td class="icon">', ClassViewer.createImageHtml(iconUrl), '</td>');
          html.add('<td class="type">', ((info.typeHtml.length != 0) ? (info.typeHtml + "&nbsp;") : ""), '</td>');

          html.add('<td class="toggle">');

          if (this.itemHasDetails(node, fromClassNode, currentClassDocNode))
          {
            // This node has details -> Show the detail button
            html.add(
              '<img src="', qx.manager.object.AliasManager.getInstance().resolvePath("api/image/open.gif"),
              '"', " onclick=\"document._detailViewer._onShowItemDetailClicked(", nodeType, ",'",
              node.getName(), "'" ,
              ((fromClassNode != currentClassDocNode) ? ",'" + fromClassNode.getFullName() + "'" : ""),
              ")\"/>"
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

          if (this.itemHasDetails(node, fromClassNode, currentClassDocNode)) {
            html.add(
              " onclick=\"document._detailViewer._onShowItemDetailClicked(",
              nodeType, ",'", node.getName(), "'",
              ((fromClassNode != currentClassDocNode) ? ",'" + fromClassNode.getFullName() + "'" : ""),
              ")\">"
            );
          } else {
            html.add('>');
          }

          html.add(info.titleHtml);

          html.add('</h3>');

          // Create content area
          html.add('<div _itemName="', nodeArr[i].getName(), '">');
          html.add(info.textHtml);
          html.add('</div>');

          html.add('</td>');
          html.add('</tr>');
        }

        html.add('</table>');

        this.getInfoBodyElement().innerHTML = html.get();
        apiviewer.ClassViewer.fixLinks(this.getInfoBodyElement());
        this.getInfoBodyElement().style.display = !this.getIsOpen() ? "none" : "";
        this.getInfoElement().style.display = "";
      }
      else
      {
        this.getInfoElement().style.display = "none";
      }
    }

  }


});