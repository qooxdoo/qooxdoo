/**
 * Shows the class details.
 */
qx.apiviewer.DetailViewer = function() {
  QxIframe.call(this, "api-detail.html");

  qx.apiviewer.DetailViewer.instance = this;
};

clazz = qx.apiviewer.DetailViewer;

clazz.extend(QxIframe, "qx.apiviewer.DetailViewer");


// overridden
proto._afterAppear = function() {
  QxIframe.prototype._afterAppear.call(this);

  var DetailViewer = qx.apiviewer.DetailViewer;

  this._infoPanelHash = {};

  var html = "";

  // Add title
  html += '<div class="api-title"></div>';

  // Add description
  html += DetailViewer.DIV_START_DESC + DetailViewer.DIV_END;

  // Add constructor info
  html += this._createInfoPanel(DetailViewer.NODE_TYPE_CONSTRUCTOR,
    "constructor", "constructor", this._createMethodInfo,
    QxUtil.returnTrue, false, true);

  // Add properties info
  html += this._createInfoPanel(DetailViewer.NODE_TYPE_PROPERTY,
    "properties", "properties", this._createPropertyInfo,
    QxUtil.returnTrue, true, true);

  // Add public methods info
  html += this._createInfoPanel(DetailViewer.NODE_TYPE_METHOD_PUBLIC,
    "methods-pub", "public methods", this._createMethodInfo,
    QxUtil.returnTrue, true, true);

  // Add protected methods info
  html += this._createInfoPanel(DetailViewer.NODE_TYPE_METHOD_PROTECTED,
    "methods-prot", "protected methods", this._createMethodInfo,
    QxUtil.returnTrue, true, false);

  // Add static public methods info
  html += this._createInfoPanel(DetailViewer.NODE_TYPE_METHOD_STATIC_PUBLIC,
    "methods-static-pub", "static public methods", this._createMethodInfo,
    QxUtil.returnTrue, false, true);

  // Add static protected methods info
  html += this._createInfoPanel(DetailViewer.NODE_TYPE_METHOD_STATIC_PROTECTED,
    "methods-static-prot", "static protected methods", this._createMethodInfo,
    QxUtil.returnTrue, false, false);

  // Add constants info
  html += this._createInfoPanel(DetailViewer.NODE_TYPE_CONSTANT,
    "constants", "constants", this._createConstantInfo,
    this._constantHasDetails, false, true);


  // Set the html
  var doc = this.getContentDocument();
  doc.body.innerHTML = html;

  doc._detailViewer = this;

  // Extract the main elements
  var divArr = doc.body.childNodes;
  this._titleElem = divArr[0];
  this._classDescElem = divArr[1];
  this._infoPanelHash[DetailViewer.NODE_TYPE_CONSTRUCTOR].infoElem             = divArr[2];
  this._infoPanelHash[DetailViewer.NODE_TYPE_PROPERTY].infoElem                = divArr[3];
  this._infoPanelHash[DetailViewer.NODE_TYPE_METHOD_PUBLIC].infoElem           = divArr[4];
  this._infoPanelHash[DetailViewer.NODE_TYPE_METHOD_PROTECTED].infoElem        = divArr[5];
  this._infoPanelHash[DetailViewer.NODE_TYPE_METHOD_STATIC_PUBLIC].infoElem    = divArr[6];
  this._infoPanelHash[DetailViewer.NODE_TYPE_METHOD_STATIC_PROTECTED].infoElem = divArr[7];
  this._infoPanelHash[DetailViewer.NODE_TYPE_CONSTANT].infoElem                = divArr[8];

  // Get the child elements
  for (var nodeType in this._infoPanelHash) {
    var typeInfo = this._infoPanelHash[nodeType];
    typeInfo.infoTitleElem = typeInfo.infoElem.firstChild;
    typeInfo.infoBodyElem = typeInfo.infoElem.lastChild;
  }

  // Update the view
  if (this._currentClassDocNode) {
    // NOTE: We have to set this._currentClassDocNode to null beore, because
    //       otherwise showClass thinks, there's nothing to do
    var classDocNode = this._currentClassDocNode;
    this._currentClassDocNode = null;
    this.showClass(classDocNode);
  }
};


/**
 * Creates an info panel. An info panel shows the information about one item
 * type (e.g. for public methods).
 *
 * @param nodeType {int} the node type to create the info panel for.
 * @param listName {string} the name of the node list in the class doc node where
 *        the items shown by this info panel are stored.
 * @param labelText {string} the label text describing the node type.
 * @param infoFactory {function} the factory method creating the HTML for one
 *        item.
 * @param hasDetailDecider {function} a function returning <code>true</code>
 *        when a item has details.
 * @param addInheritedCheckBox {boolean} whether to add a "show inherited ..."
 *        checkbox.
 * @param isOpen {boolean} whether the info panel is open by default.
 * @return {string} the HTML for the info panel.
 */
proto._createInfoPanel = function(nodeType, listName, labelText, infoFactory,
  hasDetailDecider, addInheritedCheckBox, isOpen)
{
  var uppercaseLabelText = labelText[0].toUpperCase() + labelText.substring(1);

  typeInfo = { listName:listName, labelText:labelText, infoFactory:infoFactory,
    hasDetailDecider:hasDetailDecider, isOpen:isOpen,
    hasInheritedCheckBox:addInheritedCheckBox };
  this._infoPanelHash[nodeType] = typeInfo;

  var html = '<div class="api-info"><div class="api-info-title">'
    + '<img class="api-openclose" src="images/' + (isOpen ? 'close.gif' : 'open.gif') + '"'
    + " onclick=\"document._detailViewer._onShowInfoPanelBodyClicked(" + nodeType + ")\"/> "
    + uppercaseLabelText;
  if (addInheritedCheckBox) {
    html += '<span class="api-checkbox"><input type="checkbox" '
      + 'onclick="document._detailViewer._onInheritedCheckBoxClick(' + nodeType + ')"></input>'
      + 'Show inherited ' + labelText + '</span>';
  }
  html += '</div><div></div></div>';

  return html;
}


/**
 * Shows the information about a class.
 *
 * @param classNode {Map} the doc node of the class to show.
 */
proto.showClass = function(classNode) {
  if (this._currentClassDocNode == classNode) {
    // Nothing to do
    return;
  }

  var DetailViewer = qx.apiviewer.DetailViewer;

  this._currentClassDocNode = classNode;

  if (!this._titleElem) {
    // _afterAppear was not called yet -> Do nothing, the class will be shown in
    // _afterAppear.
    return;
  }

  var titleHtml = "";
  if (classNode.attributes.isAbstract) {
    titleHtml += "abstract ";
  } else if (classNode.attributes.isStatic) {
    titleHtml += "static ";
  }
  titleHtml += "class " + classNode.attributes.fullName;

  this._titleElem.innerHTML = titleHtml

  // Create the class hierarchie
  var classHierarchie = [];
  var currClass = classNode;
  while (currClass != null) {
    classHierarchie.push(currClass);
    currClass = this._getClassDocNode(currClass.attributes.superClass);
  }
  this._currentClassHierarchie = classHierarchie;

  // Add the class hierarchie
  var classHtml = DetailViewer.createImageHtml("images/class18.gif") + "Object<br/>";
  var indent = 0;
  for (var i = classHierarchie.length - 1; i >= 0; i--) {
    classHtml += DetailViewer.createImageHtml("images/nextlevel.gif", null, "padding-left:" + indent + "px")
      + DetailViewer.createImageHtml(qx.apiviewer.TreeUtil.getIconUrl(classHierarchie[i]));
    if (i != 0) {
      classHtml += this._createItemLinkHtml(classHierarchie[i].attributes.fullName, null, false)
    } else {
      classHtml += classHierarchie[i].attributes.fullName;
    }
    classHtml += "<br/>";
    indent += 18;
  }

  // Add the class description
  var ctorList = qx.apiviewer.TreeUtil.getChild(classNode, "constructor");
  if (ctorList) {
    classHtml += '<p>' + this._createDescHtml(ctorList.children[0], classNode, true) + '</p>';
  }

  // Add child classes
  if (classNode.attributes.childClasses) {
    classHtml += DetailViewer.DIV_START_DETAIL_HEADLINE + "Direct known subclasses:" + DetailViewer.DIV_END
      + DetailViewer.DIV_START_DETAIL_TEXT;

    var classNameArr = classNode.attributes.childClasses.split(",");
    for (var i = 0; i < classNameArr.length; i++) {
      if (i != 0) {
        classHtml += ", ";
      }
      classHtml += this._createItemLinkHtml(classNameArr[i], null, true, false);
    }

    classHtml += DetailViewer.DIV_END;
  }

  // Add @see attributes
  if (ctorList) {
    classHtml += this._createSeeAlsoHtml(ctorList.children[0], classNode);
  }

  this._classDescElem.innerHTML = classHtml;

  // Refresh the info viewers
  for (var nodeType in this._infoPanelHash) {
    this._updateInfoPanel(parseInt(nodeType));
  }

  // Scroll to top
  var doc = this.getContentDocument();
  doc.body.scrollTop = 0;
};


/**
 * Highlights an item (property, method or constant) and scrolls it visible.
 *
 * @param itemName {string} the name of the item to highlight.
 */
proto.showItem = function(itemName) {
  var itemNode = qx.apiviewer.TreeUtil.getItemDocNode(this._currentClassDocNode, itemName);
  if (! itemNode) {
    alert("Item '" + itemName + "' not found");
  }

  var nodeType = this._getTypeForItemNode(itemNode);
  var elem = this._getItemElement(nodeType, itemNode.attributes.name);

  if (this._markedElement) {
    this._markedElement.className = "api-item-row";
  }
  elem.className = "api-item-row-marked";
  this._markedElement = elem;

  // Scroll the element visible
  var top = QxDom.getComputedPageBoxTop(elem);
  var height = elem.offsetHeight;

  var doc = this.getContentDocument();
  var scrollTop = doc.body.scrollTop;
  var clientHeight = doc.body.clientHeight;

  if (scrollTop > top) {
    doc.body.scrollTop = top;
  } else if (scrollTop < top + height - clientHeight) {
    doc.body.scrollTop = top + height - clientHeight;
  }
};


/**
 * Updates an info panel.
 *
 * @param nodeType {int} the node type of which to update the info panel.
 */
proto._updateInfoPanel = function(nodeType) {
  var typeInfo = this._infoPanelHash[nodeType];

  // Get the nodes to show
  var nodeArr = null;
  var fromClassHash = null;
  if (typeInfo.isOpen && this._currentClassDocNode) {
    if (typeInfo.showInherited) {
      nodeArr = [];
      fromClassArr = [];
      fromClassHash = {};
      var currClassNode = this._currentClassDocNode;
      while (currClassNode != null) {
        var currParentNode = qx.apiviewer.TreeUtil.getChild(currClassNode, typeInfo.listName);
        var currNodeArr = currParentNode ? currParentNode.children : null;
        if (currNodeArr) {
          // Add the nodes from this class
          for (var i = 0; i < currNodeArr.length; i++) {
            var name = currNodeArr[i].attributes.name;
            if (fromClassHash[name] == null) {
              fromClassHash[name] = currClassNode;
              nodeArr.push(currNodeArr[i]);
            }
          }
        }

        var superClassName = currClassNode.attributes.superClass;
        currClassNode = superClassName ? this._getClassDocNode(superClassName) : null;
      }

      // Sort the nodeArr by name
      nodeArr.sort(function(obj1, obj2) {
        return (obj1.attributes.name < obj2.attributes.name) ? -1 : 1;
      });
    } else {
      var parentNode = qx.apiviewer.TreeUtil.getChild(this._currentClassDocNode, typeInfo.listName);
      nodeArr = parentNode ? parentNode.children : null;
    }
  }

  // Show the nodes
  if (nodeArr && nodeArr.length != 0) {
    var html = '<table cellspacing="0" cellpadding="0" class="api-info" width="100%">'
      + '<colgroup><col width="20px"></col><col></col></colgroup>';
    for (var i = 0; i < nodeArr.length; i++) {
      var fromClassNode = fromClassHash ? fromClassHash[nodeArr[i].attributes.name] : null;
      html += '<tr _itemName="' + nodeArr[i].attributes.name + '" class="api-item-row">'
        + this._createItemInfo(nodeArr[i], nodeType, fromClassNode, false) + '</tr>';
    }
    html += '</table>';

    typeInfo.infoBodyElem.innerHTML = html;
    typeInfo.infoBodyElem.style.display = "";
  } else {
    if (typeInfo.isOpen) {
      typeInfo.infoBodyElem.innerHTML = '<div class="api-empty-info-body">'
        + 'This class has no ' + typeInfo.labelText + '</div>';
      typeInfo.infoBodyElem.style.display = "";
    } else {
      typeInfo.infoBodyElem.style.display = "none";
    }
  }
};


/**
 * Event handler. Called when the user clicked on a "show inherited ..."
 * checkbox.
 *
 * @param nodeType {int} the node type of which the inherited-checkbox was
 *        clicked.
 */
proto._onInheritedCheckBoxClick = function(nodeType) {
  try {
    var typeInfo = this._infoPanelHash[nodeType];
    var checkboxElem = typeInfo.infoTitleElem.getElementsByTagName("input")[0];

    typeInfo.showInherited = checkboxElem.checked;

    this._updateInfoPanel(nodeType);
  } catch (exc) {
    this.error("Handling inherited checkbox click failed", null, exc);
  }
};


/**
 * Event handler. Called when the user clicked a button for showing/hiding the
 * body of an info panel.
 *
 * @param nodeType {int} the node type of which the show/hide-body-button was
 *        clicked.
 */
proto._onShowInfoPanelBodyClicked = function(nodeType) {
  try {
    var typeInfo = this._infoPanelHash[nodeType];
    typeInfo.isOpen = !typeInfo.isOpen;

    var imgElem = typeInfo.infoTitleElem.getElementsByTagName("img")[0];
    imgElem.src = typeInfo.isOpen ? 'images/close.gif' : 'images/open.gif';

    this._updateInfoPanel(nodeType);
  } catch (exc) {
    this.error("Toggling info body failed", null, exc);
  }
};


/**
 * Event handler. Called when the user clicked a button for showing/hiding the
 * details of an item.
 *
 * @param nodeType {int} the node type of the item to show/hide the details.
 * @param name {string} the name of the item.
 * @param fromClassName {string} the name of the class the item the item was
 *        defined in.
 */
proto._onShowItemDetailClicked = function(nodeType, name, fromClassName) {
  try {
    var typeInfo = this._infoPanelHash[nodeType];
    var elem = this._getItemElement(nodeType, name);  
    if (! elem) {
      throw Error("Element for name '" + name + "' not found!");
    }

    var showDetails = elem._showDetails ? !elem._showDetails : true;
    elem._showDetails = showDetails;
  
    var fromClassNode = this._currentClassDocNode;
    if (fromClassName) {
      fromClassNode = this._getClassDocNode(fromClassName);
    }

    var listNode = qx.apiviewer.TreeUtil.getChild(fromClassNode, typeInfo.listName);
    var node;
    if (nodeType == qx.apiviewer.DetailViewer.NODE_TYPE_CONSTRUCTOR) {
      node = listNode.children[0];
    } else {
      node = qx.apiviewer.TreeUtil.getChildByAttribute(listNode, "name", name);
    }
    elem.innerHTML = this._createItemInfo(node, nodeType, fromClassNode, showDetails);
  } catch (exc) {
    this.error("Toggling item details failed", null, exc);
  }
}


/**
 * Gets the HTML element showing the details of an item.
 *
 * @param nodeType {int} the node type of the item.
 * @param name {string} the item's name.
 * @return {Element} the HTML element showing the details of the item.
 */
proto._getItemElement = function(nodeType, name) {
  var typeInfo = this._infoPanelHash[nodeType];

  var elemArr = typeInfo.infoBodyElem.getElementsByTagName("TBODY")[0].childNodes;
  if (nodeType == qx.apiviewer.DetailViewer.NODE_TYPE_CONSTRUCTOR) {
    return elemArr[0];
  } else {
    for (var i = 0; i < elemArr.length; i++) {
      if (elemArr[i].getAttribute("_itemName") == name) {
        return elemArr[i];
      }
    }
  }
};


/**
 * Selects an item.
 *
 * @param itemName {string} the name of the item.
 * @see ApiViewer#selectItem
 */
proto._selectItem = function(itemName) {
  try {
    qx.apiviewer.ApiViewer.instance.selectItem(itemName);
    QxWidget.flushGlobalQueues();
  } catch (exc) {
    this.error("Selecting item '" + itemName + "' failed", null, exc);
  }
};


/**
 * Gets the doc node of a class.
 *
 * @param className {string} the name of the class.
 * @return {Map} the doc node of the class.
 */
proto._getClassDocNode = function(className) {
  if (className) {
    return qx.apiviewer.TreeUtil.getClassDocNode(qx.apiviewer.ApiViewer.instance.getDocTree(), className);
  } else {
    return null;
  }
};


/**
 * Creates the HTML showing the information about an item.
 *
 * @param node {Map} the doc node of the item.
 * @param nodeType {int} the node type of the item.
 * @param fromClassNode {Map} the doc node of the class the item was defined.
 * @param showDetails {boolean} whether to show the details.
 * @return {string} the HTML showing the information about the item.
 */
proto._createItemInfo = function(node, nodeType, fromClassNode, showDetails) {
  var DetailViewer = qx.apiviewer.DetailViewer;

  var typeInfo = this._infoPanelHash[nodeType];

  if (!fromClassNode) {
    fromClassNode = this._currentClassDocNode;
  }

  var inherited = fromClassNode && (fromClassNode != this._currentClassDocNode);
  var iconUrl = qx.apiviewer.TreeUtil.getIconUrl(node, inherited);

  var html = DetailViewer.INFO_CELL_LEFT_START + DetailViewer.createImageHtml(iconUrl);
  if (typeInfo.hasDetailDecider.call(this, node, nodeType, fromClassNode)) {
    // This node has details -> Show the detail button
    html += '<br><img class="api-openclose" src="images/'
      + (showDetails ? 'close.gif' : 'open.gif') + '"'
      + " onclick=\"document._detailViewer._onShowItemDetailClicked(" + nodeType + ",'"
      + node.attributes.name + "'"
      + ((fromClassNode != this._currentClassDocNode) ? ",'" + fromClassNode.attributes.fullName + "'" : "")
      + ")\"/>"
  }
  html += DetailViewer.INFO_CELL_DELEMITER
    + typeInfo.infoFactory.call(this, node, nodeType, fromClassNode, showDetails)
    + DetailViewer.INFO_CELL_RIGHT_END;

  return html;
};


/**
 * Creates the HTML showing the information about a property.
 *
 * @param node {Map} the doc node of the property.
 * @param nodeType {int} the node type of the property.
 * @param fromClassNode {Map} the doc node of the class the property was defined.
 * @param showDetails {boolean} whether to show the details.
 * @return {string} the HTML showing the information about the property.
 */
proto._createPropertyInfo = function(node, nodeType, fromClassNode, showDetails) {
  var DetailViewer = qx.apiviewer.DetailViewer;

  var typeInfo = this._infoPanelHash[nodeType];

  // Get the property node that holds the documentation
  var docClassNode = fromClassNode;
  var docNode = node;
  if (node.attributes.docFrom) {
    docClassNode = this._getClassDocNode(node.attributes.docFrom);
    var listNode = qx.apiviewer.TreeUtil.getChild(docClassNode, typeInfo.listName);
    docNode = qx.apiviewer.TreeUtil.getChildByAttribute(listNode, "name", node.attributes.name);
  }

  // Add the title
  var html = DetailViewer.DIV_START_TITLE
    + this._createTypeHtml(node, fromClassNode, "var", true) + " "
    + node.attributes.name + DetailViewer.DIV_END;

  // Add the description
  html += this._createDescHtml(docNode, fromClassNode, showDetails);

  if (showDetails) {
    // Add allowed values
    html += DetailViewer.DIV_START_DETAIL_HEADLINE + "Allowed values:" + DetailViewer.DIV_END
      + DetailViewer.DIV_START_DETAIL_TEXT;

    if (node.attributes.allowNull != "false") {
      html += "null, ";
    }
    if (node.attributes.possibleValues) {
      html += node.attributes.possibleValues;
    } else if (node.attributes.classname) {
      html += "instances of " + node.attributes.classname;
    } else if (node.attributes.instance) {
      html += "instances of " + node.attributes.instance + " or sub classes";
    } else if (node.attributes.unitDetection) {
      html += "units: " + node.attributes.unitDetection;
    } else {
      html += "any " + node.attributes.type;
    }

    html += DetailViewer.DIV_END;

    // Add default value
    html += DetailViewer.DIV_START_DETAIL_HEADLINE + "Default value:" + DetailViewer.DIV_END
      + DetailViewer.DIV_START_DETAIL_TEXT
      + (node.attributes.defaultValue ? node.attributes.defaultValue : "null")
      + DetailViewer.DIV_END;

    // Add get alias
    if (node.attributes.getAlias) {
      html += DetailViewer.DIV_START_DETAIL_HEADLINE + "Get alias:" + DetailViewer.DIV_END
        + DetailViewer.DIV_START_DETAIL_TEXT + node.attributes.getAlias + DetailViewer.DIV_END;
    }

    // Add set alias
    if (node.attributes.setAlias) {
      html += DetailViewer.DIV_START_DETAIL_HEADLINE + "Set alias:" + DetailViewer.DIV_END
        + DetailViewer.DIV_START_DETAIL_TEXT + node.attributes.setAlias + DetailViewer.DIV_END;
    }

    // Add inherited from or overridden from
    if (fromClassNode && fromClassNode != this._currentClassDocNode) {
      html += DetailViewer.DIV_START_DETAIL_HEADLINE + "Inherited from:" + DetailViewer.DIV_END
        + DetailViewer.DIV_START_DETAIL_TEXT
        + this._createItemLinkHtml(fromClassNode.attributes.fullName)
        + DetailViewer.DIV_END;
    } else if (node.attributes.overriddenFrom) {
      html += DetailViewer.DIV_START_DETAIL_HEADLINE + "Overridden from:" + DetailViewer.DIV_END
        + DetailViewer.DIV_START_DETAIL_TEXT
        + this._createItemLinkHtml(node.attributes.overriddenFrom)
        + DetailViewer.DIV_END;
    }

    // Add @see attributes
    html += this._createSeeAlsoHtml(docNode, docClassNode);

    // Add documentation errors
    html += this._createErrorHtml(docNode, docClassNode);
  }

  return html;
};


/**
 * Creates the HTML showing the information about a method.
 *
 * @param node {Map} the doc node of the method.
 * @param nodeType {int} the node type of the method.
 * @param fromClassNode {Map} the doc node of the class the method was defined.
 * @param showDetails {boolean} whether to show the details.
 * @return {string} the HTML showing the information about the method.
 */
proto._createMethodInfo = function(node, nodeType, fromClassNode, showDetails) {
  var DetailViewer = qx.apiviewer.DetailViewer;
  var TreeUtil = qx.apiviewer.TreeUtil;

  var typeInfo = this._infoPanelHash[nodeType];

  // Get the method node that holds the documentation
  var docClassNode = fromClassNode;
  var docNode = node;
  if (node.attributes.docFrom) {
    docClassNode = this._getClassDocNode(node.attributes.docFrom);
    var listNode = TreeUtil.getChild(docClassNode, typeInfo.listName);
    docNode = TreeUtil.getChildByAttribute(listNode, "name", node.attributes.name);
  }

  // Get name, icon and return type
  var returnNode = TreeUtil.getChild(docNode, "return");
  var name;
  var returnType;
  if (node.attributes.isCtor) {
    name = this._currentClassDocNode.attributes.name;
    returnType = "";
  } else {
    name = node.attributes.name;
    returnType = this._createTypeHtml(returnNode, fromClassNode, "void", true) + " ";
  }

  // Add the title (the method signature)
  var html = DetailViewer.DIV_START_TITLE + returnType + name + " (";
  var paramsNode = TreeUtil.getChild(docNode, "params");
  if (paramsNode) {
    for (var i = 0; i < paramsNode.children.length; i++) {
      var param = paramsNode.children[i];
      if (i != 0) {
        html += ", ";
      }
      html += this._createTypeHtml(param, fromClassNode, "var") + " "
        + param.attributes.name;
      if (param.attributes.defaultValue) {
        html += "?";
      }
    }
  }
  html += ")" + DetailViewer.DIV_END;

  // Add the description
  html += this._createDescHtml(docNode, fromClassNode, showDetails);

  if (showDetails) {
    // Add Parameters
    var paramsNode = TreeUtil.getChild(docNode, "params");
    if (paramsNode) {
      html += DetailViewer.DIV_START_DETAIL_HEADLINE + "Parameters:" + DetailViewer.DIV_END;
      for (var i = 0; i < paramsNode.children.length; i++) {
        var param = paramsNode.children[i];
        var paramType = param.attributes.type ? param.attributes.type : "var";
        var dims = param.attributes.arrayDimensions;
        if (dims) {
          for (var i = 0; i < dims; i++) {
            paramType += "[]";
          }
        }
        var defaultValue = param.attributes.defaultValue;

        html += DetailViewer.DIV_START_DETAIL_TEXT;
        if (defaultValue) {
          html += DetailViewer.SPAN_START_OPTIONAL;
        }
        html += DetailViewer.SPAN_START_PARAM_NAME + param.attributes.name + DetailViewer.SPAN_END;
        if (defaultValue) {
          html += " (default: " + defaultValue + ") " + DetailViewer.SPAN_END;
        }

        var paramDescNode = TreeUtil.getChild(param, "desc");
        if (paramDescNode) {
          html += " " + paramDescNode.attributes.text;
        }
        html += DetailViewer.DIV_END;
      }
    }

    // Add return value
    if (returnNode) {
      var returnDescNode = TreeUtil.getChild(returnNode, "desc");
      if (returnDescNode) {
        html += DetailViewer.DIV_START_DETAIL_HEADLINE + "Returns:" + DetailViewer.DIV_END
          + DetailViewer.DIV_START_DETAIL_TEXT
          + this._createDescriptionHtml(returnDescNode.attributes.text, docClassNode)
          + DetailViewer.DIV_END;
      }
    }

    // Add inherited from or overridden from
    if (fromClassNode && fromClassNode != this._currentClassDocNode) {
      html += DetailViewer.DIV_START_DETAIL_HEADLINE + "Inherited from:" + DetailViewer.DIV_END
        + DetailViewer.DIV_START_DETAIL_TEXT
        + this._createItemLinkHtml(fromClassNode.attributes.fullName)
        + DetailViewer.DIV_END;
    } else if (node.attributes.overriddenFrom) {
      html += DetailViewer.DIV_START_DETAIL_HEADLINE + "Overridden from:" + DetailViewer.DIV_END
        + DetailViewer.DIV_START_DETAIL_TEXT
        + this._createItemLinkHtml(node.attributes.overriddenFrom)
        + DetailViewer.DIV_END;
    }

    // Add @see attributes
    html += this._createSeeAlsoHtml(docNode, docClassNode);

    // Add documentation errors
    html += this._createErrorHtml(docNode, docClassNode);
  }

  return html;
};


/**
 * Checks whether a constant has details.
 *
 * @param node {Map} the doc node of the constant.
 * @param nodeType {int} the node type of the constant.
 * @param fromClassNode {Map} the doc node of the class the constant was defined.
 * @return {boolean} whether the constant has details.
 */
proto._constantHasDetails = function(node, nodeType, fromClassNode) {
  return this._hasSeeAlsoHtml(node) || this._hasErrorHtml(node);
};


/**
 * Creates the HTML showing the information about a constant.
 *
 * @param node {Map} the doc node of the constant.
 * @param nodeType {int} the node type of the constant.
 * @param fromClassNode {Map} the doc node of the class the constant was defined.
 * @param showDetails {boolean} whether to show the details.
 * @return {string} the HTML showing the information about the constant.
 */
proto._createConstantInfo = function(node, nodeType, fromClassNode, showDetails) {
  var html = "";

  // Add the title
  html += qx.apiviewer.DetailViewer.DIV_START_TITLE
    + this._createTypeHtml(node, fromClassNode, "var", true) + " "
    + node.attributes.name + qx.apiviewer.DetailViewer.DIV_END;

  // Add the description
  html += this._createDescHtml(node, fromClassNode, showDetails);

  if (showDetails) {
    // Add @see attributes
    html += this._createSeeAlsoHtml(node, fromClassNode);

    // Add documentation errors
    html += this._createErrorHtml(node, fromClassNode);
  }

  return html;
};


/**
 * Creates the HTML showing the description of an item.
 *
 * @param node {Map} the doc node of the item.
 * @param fromClassNode {Map} the doc node of the class the item was defined.
 * @param showDetails {boolean} whether to show details. If <code>false</code>
 *        only the first sentence of the description will be shown.
 * @return {string} the HTML showing the description.
 */
proto._createDescHtml = function(node, fromClassNode, showDetails) {
  var descNode = qx.apiviewer.TreeUtil.getChild(node, "desc");
  if (descNode) {
    var desc = descNode.attributes.text;
    if (!showDetails) {
      desc = this._extractFirstSentence(desc);
    }
    return qx.apiviewer.DetailViewer.DIV_START_DESC
      + this._createDescriptionHtml(desc, fromClassNode)
      + qx.apiviewer.DetailViewer.DIV_END;
  } else {
    return "";
  }
}


/**
 * Checks whether a item has &#64;see attributes.
 *
 * @param node {Map} the doc node of the item.
 * @return {boolean} whether the item has &#64;see attributes.
 */
proto._hasSeeAlsoHtml = function(node) {
  var TreeUtil = qx.apiviewer.TreeUtil;

  var descNode = TreeUtil.getChild(node, "desc");
  if (descNode) {
    var attributesNode = TreeUtil.getChild(descNode, "attributes");
    if (attributesNode) {
      var seeAttribNode = TreeUtil.getChildByAttribute(attributesNode, "name", "see");
      if (seeAttribNode) {
        return true;
      }
    }
  }

  // There is no @see attribute
  return false;
};


/**
 * Creates the HTML showing the &#64;see attributes of an item.
 *
 * @param node {Map} the doc node of the item.
 * @param fromClassNode {Map} the doc node of the class the item was defined.
 * @return {string} the HTML showing the &#64;see attributes.
 */
proto._createSeeAlsoHtml = function(node, fromClassNode) {
  var DetailViewer = qx.apiviewer.DetailViewer;

  var descNode = qx.apiviewer.TreeUtil.getChild(node, "desc");
  if (descNode) {
    var attributesNode = qx.apiviewer.TreeUtil.getChild(descNode, "attributes");
    if (attributesNode) {
      var seeAlsoHtml = "";
      for (var i = 0; i < attributesNode.children.length; i++) {
        var attribNode = attributesNode.children[i];
        if (attribNode.attributes.name == "see") {
          // This is a @see attribute
          if (seeAlsoHtml.length != 0) {
            seeAlsoHtml += ", ";
          }
          seeAlsoHtml += this._createItemLinkHtml(attribNode.attributes.text, fromClassNode);
        }
      }

      if (seeAlsoHtml.length != 0) {
        // We had @see attributes
        return DetailViewer.DIV_START_DETAIL_HEADLINE + "See also:" + DetailViewer.DIV_END
          + DetailViewer.DIV_START_DETAIL_TEXT + seeAlsoHtml + DetailViewer.DIV_END;
      }
    }
  }

  // Nothing found
  return "";
}


/**
 * Checks whether a item has documentation errors.
 *
 * @param node {Map} the doc node of the item.
 * @return {boolean} whether the item has documentation errors.
 */
proto._hasErrorHtml = function(node) {
  var errorNode = qx.apiviewer.TreeUtil.getChild(node, "errors");
  return (errorNode != null);
};


/**
 * Creates the HTML showing the documentation errors of an item.
 *
 * @param node {Map} the doc node of the item.
 * @param fromClassNode {Map} the doc node of the class the item was defined.
 * @return {string} the HTML showing the documentation errors.
 */
proto._createErrorHtml = function(node, fromClassNode) {
  var DetailViewer = qx.apiviewer.DetailViewer;

  var errorNode = qx.apiviewer.TreeUtil.getChild(node, "errors");
  if (errorNode) {
    var html = DetailViewer.DIV_START_ERROR_HEADLINE + "Documentation errors:" + DetailViewer.DIV_END;
    var errArr = errorNode.children;
    for (var i = 0; i < errArr.length; i++) {
      html += DetailViewer.DIV_START_DETAIL_TEXT + errArr[i].attributes.msg + " (";
      if (fromClassNode && fromClassNode != this._currentClassDocNode) {
        html += fromClassNode.attributes.fullName + " ";
      }
      html += "line " + errArr[i].attributes.line + ")" + DetailViewer.DIV_END;
    }
    return html;
  } else {
    return "";
  }
};


/**
 * Extracts the first sentence from a text.
 *
 * @param text {string} the text.
 * @return {string} the first sentence from the text.
 */
proto._extractFirstSentence = function(text) {
  // Look for a point followed by white space, but don't match if there is
  // a point two chars before, like in "e.g. "
  var sentenceEndRE = /[^\.].\.\s/;
  var hit = sentenceEndRE.exec(text);
  if (hit != null) {
    return text.substring(0, hit.index + hit[0].length);
  } else {
    return text;
  }
};


/**
 * Creates the HTML showing the type of a doc node.
 *
 * @param typeNode {Map} the doc node to show the type for.
 * @param packageBaseClass {Map} the doc node of the class <code>typeNode</code>
 *        belongs to.
 * @param defaultType {string} the type name to use if <code>typeNode</code> is
 *        <code>null</code> or defines no type.
 * @param fillSpaces {boolean} whether to append spaces until the type has the
 *        length of {@link #MIN_TYPE_LENGTH}.
 * @return {string} the HTML showing the type.
 */
proto._createTypeHtml = function(typeNode, packageBaseClass, defaultType, fillSpaces) {
  var typeHtml;
  var typeLength;

  var typeName = null;
  var arrayDims = null;
  if (typeNode && typeNode.attributes) {
    typeName = typeNode.attributes.instance ? typeNode.attributes.instance : typeNode.attributes.type;
    arrayDims = typeNode.attributes.arrayDimensions;
  }

  if (typeName == null) {
    typeHtml = defaultType;
    typeLength = defaultType.length
  } else {
    typeLength = typeName.length;

    if (qx.apiviewer.DetailViewer.PRIMITIVES[typeName]) {
      typeHtml = typeName;
    } else {
      typeHtml = this._createItemLinkHtml(typeName, packageBaseClass, false, true);
    }

    if (arrayDims) {
      for (var i = 0; i < parseInt(arrayDims); i++) {
        typeHtml += "[]";
        typeLength += 2;
      }
    }
  }

  if (fillSpaces) {
    var spacesCount = qx.apiviewer.DetailViewer.MIN_TYPE_LENGTH - typeLength;
    for (var i = 0; i < spacesCount; i++) {
      typeHtml += "&nbsp;";
    }
  }

  return typeHtml;
};


/**
 * Creates HTML that replaces all &#64;link-attributes with links.
 *
 * @param description {string} the description.
 * @param packageBaseClass {Map,null} the doc node of the class to use for
 *        auto-adding packages.
 */
proto._createDescriptionHtml = function(description, packageBaseClass) {
  var linkRegex = /\{@link([^\}]*)\}/mg;

  var html = "";
  var hit;
  var lastPos = 0;
  while ((hit = linkRegex.exec(description)) != null) {
    // Add the text before the link
    html += description.substring(lastPos, hit.index)
      + this._createItemLinkHtml(hit[1], packageBaseClass);
    
    lastPos = hit.index + hit[0].length;
  }
  
  // Add the text after the last hit
  html += description.substring(lastPos, description.length);

  return html;
};


/**
 * Creates the HTML for a link to an item.
 *
 * @param linkText {string} the link text
 *        (e.g. "mypackage.MyClass#myMethod alt text")
 * @param packageBaseClass {Map,null} the doc node of the class to use when
 *        auto-adding the package to a class name having no package specified.
 *        If null, no automatic package addition is done.
 * @param useIcon {boolean,true} whether to add an icon to the link.
 * @param useShortName {boolean,false} whether to use the short name.
 */
proto._createItemLinkHtml = function(linkText, packageBaseClass, useIcon,
  useShortName)
{
  if (useIcon == null) {
    useIcon = true;
  }

  linkText = linkText.trim();

  if (linkText[0] == '"' || linkText[0] == '<') {
    // This is a String or a link to a URL -> Just use it as it is
    return linkText;
  } else {
    // This is a link to another class or method -> Create an item link

    // Separate item name from label
    var hit = qx.apiviewer.DetailViewer.ITEM_SPEC_REGEX.exec(linkText);
    if (hit == null) {
      // Malformed item name
      return linkText;
    } else {
      var className = hit[2];
      var itemName = hit[3];
      var label = hit[6];

      // Make the item name absolute
      if (className == null || className.length == 0) {
        // This is a relative link to a method -> Add the current class
        className = packageBaseClass.attributes.fullName;
      } else if (packageBaseClass && className.indexOf(".") == -1) {
        // The class name has no package -> Use the same package as the current class
        var name = packageBaseClass.attributes.name;
        var fullName = packageBaseClass.attributes.fullName;
        var packageName = fullName.substring(0, fullName.length - name.length);
        className = packageName + className;
      }

      // Get the node info
      if (label == null || label.length == 0) {
        // We have no label -> Use the item name as label
        label = hit[1];
      }

      // Add the right icon
      if (useIcon) {
        var classNode = this._getClassDocNode(className);
        if (classNode) {
          var itemNode;
          if (itemName) {
            // The links points to a item of the class
            var cleanItemName = itemName.substring(1);
            var parenPos = cleanItemName.indexOf("(");
            if (parenPos != -1) {
              cleanItemName = cleanItemName.substring(0, parenPos).trim();
            }
            itemNode = qx.apiviewer.TreeUtil.getItemDocNode(classNode, cleanItemName);
          } else {
            // The links points to the class
            itemNode = classNode;
          }
          if (itemNode) {
            var iconUrl = qx.apiviewer.TreeUtil.getIconUrl(itemNode);
            label = qx.apiviewer.DetailViewer.createImageHtml(iconUrl) + label;
          }
        }
      }

      // Create a real bookmarkable link
      // NOTE: The onclick-handler must be added by HTML code. If it
      //       is added using the DOM element then the href is followed.
      var fullItemName = className + (itemName ? itemName : "");
      return '<a href="' + window.location.protocol + '//' +  window.location.pathname
        + '#' + fullItemName + '" onclick="'
        + 'document._detailViewer._selectItem(\'' + fullItemName + '\'); return false;"'
        + ' title="' + fullItemName + '">' + label + '</a>';
    }
  }
};


/**
 * Gets the node type for a doc node.
 *
 * @param itemNode {Map} the doc node of the item.
 * @return {int} the item's node type.
 */
proto._getTypeForItemNode = function(itemNode) {
  var DetailViewer = qx.apiviewer.DetailViewer;

  if (itemNode.type == "constant") {
    return DetailViewer.NODE_TYPE_CONSTANT;
  } else if (itemNode.type == "property") {
    return DetailViewer.NODE_TYPE_PROPERTY;
  } else if (itemNode.type == "method") {
    var name = itemNode.attributes.name;
    if (name == null) {
      return DetailViewer.NODE_TYPE_CONSTRUCTOR;
    } else if (name[0] == "_") {
      if (itemNode.attributes.isStatic) {
        return DetailViewer.NODE_TYPE_METHOD_STATIC_PROTECTED;
      } else {
        return DetailViewer.NODE_TYPE_METHOD_PROTECTED;
      }
    } else {
      if (itemNode.attributes.isStatic) {
        return DetailViewer.NODE_TYPE_METHOD_STATIC_PUBLIC;
      } else {
        return DetailViewer.NODE_TYPE_METHOD_PUBLIC;
      }
    }
  }
};


// overridden
proto.dispose = function() {
  if (this.getDisposed()) {
    return;
  };

  this._titleElem = null;
  this._classDescElem = null;
  this._markedElement = null;

  for (var nodeType in this._infoPanelHash) {
    this._infoPanelHash[nodeType].infoElem = null;
    this._infoPanelHash[nodeType].infoTitleElem = null;
    this._infoPanelHash[nodeType].infoBodyElem = null;
  }

  var doc = this.getContentDocument();
  if (doc) {
    doc._detailViewer = null;
  }

  return QxIframe.prototype.dispose.call(this);
};


/** {Map} The primitive types. These types will not be shown with links. */
clazz.PRIMITIVES = { "object":true, "boolean":true, "string":true, "number":true,
  "int":true, "float":true, "var":true, "regexp":true, "Map":true, "Date":true,
  "Element":true };

/**
 * {regexp} The regexp for parsing a item name
 * (e.g. "mypackage.MyClass#MY_CONSTANT alternative text").
 */
clazz.ITEM_SPEC_REGEX = /^(([\w\.]+)?(#\w+(\([^\)]*\))?)?)(\s+(.*))?$/;

/** {int} the minimum length of types. */
clazz.MIN_TYPE_LENGTH = 9;

/** {int} The node type of a constructor. */
clazz.NODE_TYPE_CONSTRUCTOR = 1;
/** {int} The node type of a property. */
clazz.NODE_TYPE_PROPERTY = 2;
/** {int} The node type of a public method. */
clazz.NODE_TYPE_METHOD_PUBLIC = 3;
/** {int} The node type of a protected method. */
clazz.NODE_TYPE_METHOD_PROTECTED = 4;
/** {int} The node type of a static public method. */
clazz.NODE_TYPE_METHOD_STATIC_PUBLIC = 5;
/** {int} The node type of a static protected method. */
clazz.NODE_TYPE_METHOD_STATIC_PROTECTED = 6;
/** {int} The node type of a constant. */
clazz.NODE_TYPE_CONSTANT = 7;

/** {string} The HTML starting the left cell of a item info. */
clazz.INFO_CELL_LEFT_START = '<td class="api-icon-cell">';
/** {string} The HTML between the left and the right cell of a item info. */
clazz.INFO_CELL_DELEMITER = '</td><td class="api-info-cell">';
/** {string} The HTML ending the right cell of a item info. */
clazz.INFO_CELL_RIGHT_END = '</td>';

/** {string} The start tag of a div containing an item title. */
clazz.DIV_START_TITLE = '<div class="api-item-title">';
/** {string} The start tag of a div containing an item description. */
clazz.DIV_START_DESC = '<div class="api-item-desc">';
/** {string} The start tag of a div containing the headline of an item detail. */
clazz.DIV_START_DETAIL_HEADLINE = '<div class="api-item-detail-headline">';
/** {string} The start tag of a div containing the text of an item detail. */
clazz.DIV_START_DETAIL_TEXT = '<div class="api-item-detail-text">';
/** {string} The start tag of a div containing the headline of an item error. */
clazz.DIV_START_ERROR_HEADLINE = '<div class="api-item-detail-error">';
/** {string} The end tag of a div. */
clazz.DIV_END = '</div>';

/** {string} The start tag of a span containing an optional detail. */
clazz.SPAN_START_OPTIONAL = '<span class="api-item-detail-optional">';
/** {string} The start tag of a span containing a parameter name. */
clazz.SPAN_START_PARAM_NAME = '<span class="api-item-detail-param-name">';
/** {string} The end tag of a span. */
clazz.SPAN_END = '</span>';


/**
 * Creates the HTML showing an image.
 *
 * @param imgUrl {var} the URL of the image. May be a string or an array of
 *        strings (for overlay images).
 * @param tooltip {string} the tooltip to show.
 * @param styleAttributes {string} the style attributes to add to the image.
 */
clazz.createImageHtml = function(imgUrl, tooltip, styleAttributes) {
  if (typeof imgUrl == "string") {
    return '<img src="' + imgUrl + '" class="api-img"'
      + (styleAttributes ? ' style="' + styleAttributes + '"' : "") + '/>';
  } else {
    if (styleAttributes) {
      styleAttributes += ";vertical-align:top";
    } else {
      styleAttributes = "vertical-align:top";
    }
    return qx.apiviewer.DetailViewer.createOverlayImageHtml(18, 18, imgUrl, tooltip, styleAttributes);
  }
};


/**
 * Creates HTML that shows an overlay image (several images on top of each other).
 * The resulting HTML will behave inline.
 *
 * @param width {int} the width of the images.
 * @param height {int} the height of the images.
 * @param imgUrlArr {string[]} the URLs of the images. The last image will be
 *        painted on top.
 * @param toolTip {string,null} the tooltip of the icon.
 * @param styleAttributes {string,null} custom CSS style attributes.
 * @return {string} the HTML with the overlay image.
 */
clazz.createOverlayImageHtml
  = function(width, height, imgUrlArr, toolTip, styleAttributes)
{
  // NOTE: See testOverlay.html
  var html = '<table cellpadding="0" cellspacing="0" '
    + 'style="display:inline;position:relative'
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

  return html;
};