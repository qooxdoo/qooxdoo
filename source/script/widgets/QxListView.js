function QxListView(columns)
{
  QxWidget.call(this);


  // storage if columns
  this._columns = typeof columns == "object" && columns != null ? columns : [];
  this._columnsLength = this._columns.length-1;


  // storage of entries
  this._data = [];


  // storge of current selection (as ids)
  this._selection = {};
  this._selectionLength = 0;
  this._selectionMode = "none";


  // row holder
  this._fragment = QxListView._useFragment ? document.createDocumentFragment() : document.createElement("div");


  // row create timer and queue
  this._rowCreateQueue = [];

  this._rowCreateTimer = new QxTimer(10);
  this._rowCreateTimer.addEventListener("interval", this._onrowcreate, this);
  this._rowCreateTimer.start();


  // row append timer and queue
  this._rowAppendQueue = [];

  this._rowAppendTimer = new QxTimer(100);
  this._rowAppendTimer.addEventListener("interval", this._onrowappend, this);
  this._rowAppendTimer.start();

  // scroll timer (fix smooth scrolling)
  this._scrollSmoothTimer = new QxTimer(1);
  this._scrollSmoothTimer.addEventListener("interval", this._onscrollsmooth, this);

  // scroll timer (for opera, doesn't support onscroll on divs nativly)
  if ((new QxClient).isOpera()) {
    this._scrollEmuTimer = new QxTimer(100);
    this._scrollEmuTimer.addEventListener("interval", this._onscrollemu, this);
    this._scrollEmuTimer.start();
  };

  // node caches
  this._nodeRowCache = [];

  this._nodeHeaderColsCache = [];
  this._nodeContentColsCache = [];

  this._nodeHeaderCellCache = [];
  this._nodeContentFirstRowCellCache = [];

  this._nodeHeaderInnerTableCache = [];
  this._nodeHeaderInnerTextCellCache = [];
  this._nodeHeaderInnerTextBoxCache = [];
  this._nodeHeaderInnerSortCellCache = [];
  this._nodeHeaderInnerSortIconCache = [];


  // add events
  this.addEventListener("click", this._onclick);
  this.addEventListener("mousewheel", this._onmousewheel);
};

QxListView.extend(QxWidget, "QxListView");

QxListView._useFragment = Boolean(document.createDocumentFragment);

proto._initialRowCount = 100;
proto._perLoopRowCreateCount = 5;
proto._perLoopRowAppendCount = 100;



/*!
  Create Tables by cloning proto tables.

  Also it attach nodes to object properties and attach events like scrolling.
*/
proto._modifyElement = function(propValue, propOldValue, propName, uniqModIds)
{
  this._contentProtoRow = QxListView._contentProtoRow.cloneNode(true);

  QxWidget.prototype._modifyElement.call(this, propValue, propOldValue, propName, uniqModIds);


  // HEADER
  // ----------------------------------

  this._header = QxListView._headerProtoFrame.cloneNode(true);

  this._headerTable = this._header.firstChild;
  this._headerColGroup = this._headerTable.firstChild;
  this._headerBody = this._headerTable.lastChild;
  this._headerRow = this._headerBody.firstChild;

  // short mappings for style dom definitions
  this._headerStyle = this._header.style;
  this._headerTableStyle = this._headerTable.style;

  propValue.appendChild(this._header);


  // CONTENT
  // ----------------------------------

  this._content = QxListView._contentProtoFrame.cloneNode(true);

  this._contentTable = this._content.firstChild;
  this._contentColGroup = this._contentTable.firstChild;
  this._contentBody = this._contentTable.lastChild;

  var o = this;
  this._content.onscroll = function() { o._onscroll(); };


  propValue.appendChild(this._content);


  // COLUMN DATA CACHE
  // ----------------------------------

  this._cacheAdditionalColumnData();


  // COLUMNS
  // ----------------------------------

  try{
    var d = this._columns;
    var l = d.length;

    for (var i=0; i<l; i++) {
      this._addColumn(d[i]);
    };
  }
  catch(ex) {
    throw new Error("Failed to apply columns: " + ex);
  };


  // ROWS
  // ----------------------------------

  var q = this._rowCreateQueue;
  var l = Math.min(this._initialRowCount-1, q.length);
  for (var i=0; i<l; i++) { this._contentBody.appendChild(this._createRow(q.shift())); };



  // RENDER
  // ----------------------------------
  this._renderTableLayoutInitial();

  return true;
};

proto._cacheAdditionalColumnData = function()
{
  var d = this._columns;
  var l = d.length;
  var c;

  for (var i=0; i<l; i++)
  {
    c=d[i];

    c.contentType = typeof c.content;
    c.contentLength = c.content.length-1;

    c.hasStaticWidth = typeof c.width == "number";
    c.hasDynamicWidth = !c.hasStaticWidth;
    c.hasScaleWidth = c.width == "scale";
    c.hasScaleFactor = typeof c.scaleFactor == "number";

    c.hasMaxWidthLimit = typeof c.maxWidth == "number";
    c.hasMinWidthLimit = typeof c.minWidth == "number";


    if (c.hasStaticWidth && c.hasScalingWidth)
    {
      throw new Error("Malformed column dimensions! [1: static scaling conflict]");
    };

    if (c.hasMinWidthLimit && c.hasMaxWidthLimit && c.maxWidth <= c.minWidth)
    {
      throw new Error("Malformed column dimensions! [2: min max conflict]");
    };

    if (c.hasScalingFactor && !c.hasScalingWidth)
    {
      throw new Error("Malformed column dimensions! [3: scaling conflict]");
    };
  };
};




proto._onrowcreate = function()
{
  if (!this.isCreated()) {
    return;
  };
  
  var q = this._rowCreateQueue;
  var l = q.length-1;

  if (l==-1) {
    this._rowCreateTimer.stop();
    return;
  };

  l = Math.min(this._perLoopRowCreateCount, l);
  do{ this._fragment.appendChild(this._createRow(q.shift())); } while(l--);
};

proto._onrowappend = function()
{
  if (this._fragment.childNodes.length > this._perLoopRowAppendCount)
  {
    this._onrowappenddo();
    return;
  };

  if (this._rowCreateQueue.length == 0)
  {
    this._onrowappenddo();
    this._rowAppendTimer.stop();

    if (this.hasEventListeners("complete")) {
      this.dispatchEvent(new QxEvent("complete"), true);
    };

    return;
  };
};


if (QxListView._useFragment)
{
  proto._onrowappenddo = function() {
    this._contentBody.appendChild(this._fragment);
  };
}
else
{
  proto._onrowappenddo = function() {
    var f = this._fragment;
    var l = f.childNodes.length;
    for (var i=0; i<l; i++) { this._contentBody.appendChild(f.firstChild); };
  };
};




/*
  -------------------------------------------------------------------------------
    DATA HANDLING
  -------------------------------------------------------------------------------
*/

/*!
  This adds data to the grid.

  1. Validate incoming data
  2. Add additional meta data like a hash and the position
  3. Create a row (only if was visible before)
  4. Push new entry to entry database
*/
proto.addData = function(entry)
{
  // 1. VALIDATE INCOMING DATA
  // ----------------------------------

  this._validateData(entry);


  // 2. ADD ADDITIONAL META DATA
  // ----------------------------------

  entry.hash = "h" + String(Math.round(Math.random() * 1e6));
  entry.pos = this._data.length;


  // 3. PUSH DATA TO ARRAY
  // ----------------------------------

  this._data.push(entry);
  this._rowCreateQueue.push(entry);
};



/*
  -------------------------------------------------------------------------------
    VALIDATOR
  -------------------------------------------------------------------------------
*/

/*!
  This validates incoming entries and fix missing values.

  I think this is really optimized, please keep code clean.
*/
proto._validateData = function(entry)
{
  var currentColumn, currentContent, currentContentLength, currentId, currentDefaults, arrayEntry;
  var columns = this._columns, columnsLength = columns.length;
  var i, j;

  // ITERATE THROUGH ALL COLUMNS
  // -----------------------------------------------------
  for (i=0; i<columnsLength; i++)
  {
    currentColumn = columns[i];
    currentContent = currentColumn.content;
    currentId = currentColumn.id;

    switch(typeof currentContent)
    {

      // HANDLE STRING VALUES
      // -----------------------------------------------------

      case "string":
        if (typeof entry[currentId] == "undefined")
        {
          if (typeof currentColumn.defaultValue != "undefined") {
            entry[currentId] = currentColumn.defaultValue;
          } else {
            entry[currentId] = this._validateDataDefaultGetter(currentContent);
          };
        };

        break;


      // HANDLE BOOLEAN AND NUMBER VALUES
      // -----------------------------------------------------

      case "number":
      case "boolean":
        if (typeof entry[currentId] == "undefined")
        {
          if (typeof currentColumn.defaultValue != "undefined") {
            entry[currentId] = String(currentColumn.defaultValue);
          } else {
            entry[currentId] = String(this._validateDataDefaultGetter(currentContent));
          };
        };

        break;


      // HANDLE ARRAYS OF TYPES
      // -----------------------------------------------------

      case "object":
        arrayEntry = entry[currentId];
        currentDefaults = currentColumn.defaultValues;
        currentContentLength = currentContent.length;

        switch(typeof arrayEntry)
        {
          // THERE IS A EXISTING ARRAY
          // -----------------------------------------------------
          case "object":

            // THERE ARE ANY DEFAULTS
            // -----------------------------------------------------
            if (currentDefaults)
            {
              for (j=0; j<currentContentLength; j++)
              {
                switch(typeof arrayEntry[j])
                {
                  case "number":
                  case "boolean":
                    arrayEntry[j] = String(arrayEntry[j]);
                    break;

                  case "undefined":
                    arrayEntry[j] = typeof currentDefaults[j] != "undefined" ? currentDefaults[j] : this._validateDataDefaultGetter(currentContent[j]);
                    break;
                };
              };
            }

            // THERE ARE NO DEFAULTS DEFINED
            // -----------------------------------------------------
            else
            {
              for (j=0; j<currentContentLength; j++)
              {
                switch(typeof arrayEntry[j])
                {
                  case "number":
                  case "boolean":
                    arrayEntry[j] = String(arrayEntry[j]);
                    break;

                  case "undefined":
                    arrayEntry[j] = this._validateDataDefaultGetter(currentContent[j]);
                    break;
                };
              };
            };

            break;


          // ENTRY COMPLETLY MISSING, CREATING NEW ONE
          // -----------------------------------------------------
          default:
            arrayEntry = entry[currentId] = [];

            // THERE ARE ANY DEFAULTS
            // -----------------------------------------------------
            if (currentDefaults) {
              for (j=0; j<currentContentLength; j++) {
                arrayEntry.push(typeof currentDefaults[j] != "undefined" ? currentDefaults[j] : this._validateDataDefaultGetter(currentContent[j]));
              };
            }

            // THERE ARE NO DEFAULTS DEFINED
            // -----------------------------------------------------
            else {
              for (j=0; j<currentContentLength; j++) {
                arrayEntry.push(this._validateDataDefaultGetter(currentContent[j]));
              };
            };

            break;

        };

        break;



      default:
        throw new Error("Unsupported content type: " + currentType);
    };
  };
};


/*!
  Return default values for column content types
*/
proto._validateDataDefaultGetter = function(cType)
{
  switch(cType)
  {
    case "text":
      return String.fromCharCode(160);

    case "image":
      return (new QxImageManager).buildURI("core/blank.gif");

    // ******************************
    // EXTEND WITH NEW TYPES HERE
    // ******************************

    default:
      throw new Error("No default Value available for content: " + cType);
  };
};




/*
  -------------------------------------------------------------------------------
    PREPARE NODE HANDLING
  -------------------------------------------------------------------------------
*/

/*!
  Helper for pushElement to allow direct (fast) returns from switch
*/
proto._pushSingleElementDo = function(parentNode, elemNode)
{
  parentNode.appendChild(elemNode);
  return true;
};


/*!
  Create a single element by column type
*/
proto._pushSingleElement = function(parentNode, elemType)
{
  switch(elemType)
  {
    case "text":
      return this._pushSingleElementDo(parentNode, QxListView._protoTypeElements.text.cloneNode(true));

    case "image":
      return this._pushSingleElementDo(parentNode, QxListView._protoTypeElements.image.cloneNode(true));

    // ******************************
    // EXTEND WITH NEW TYPES HERE
    // ******************************

    default:
      throw new Error("Unsupported type: " + elemType);
  };
};


/*!
  Push all elements which are defined by a single content expression
*/
proto._pushElements = function(parentNode, contentInfo)
{
  if (typeof contentInfo == "object")
  {
    var contentInfoLength = contentInfo.length;

    for (var i=0; i<contentInfoLength; i++) {
      this._pushSingleElement(parentNode, contentInfo[i]);
    };
  }
  else if (typeof contentInfo == "string")
  {
    this._pushSingleElement(parentNode, contentInfo);
  }
  else
  {
    this.debug("Unknown type: " + contentInfo);
  };
};



/*
  -------------------------------------------------------------------------------
    DOM COLUMN HANDLING
  -------------------------------------------------------------------------------
*/

/*!
  Add columns to nodes
*/
proto._addColumn = function(colData)
{
  // SHORTCUTS FOR HEADER SUB-NODES
  // ----------------------------------------

  var headerCell = QxListView._headerProtoCell.cloneNode(true);
  var headerInnerTable = headerCell.firstChild;
  var headerInnerRow = headerInnerTable.firstChild.firstChild;
  var headerInnerTextCell = headerInnerRow.firstChild;
  var headerInnerTextBox = headerInnerTextCell.firstChild;
  var headerInnerSortCell = headerInnerRow.lastChild;
  var headerInnerSortImage = headerInnerSortCell.firstChild;


  // SHORTCUTS FOR HEADER SUB-NODES
  // ----------------------------------------

  var contentCell = QxListView._contentProtoCell.cloneNode(true);
  var contentBox = contentCell.firstChild;


  // PUSH CONTENT TO HEADER FRAME
  // ----------------------------------------

  // :: to header box
  if (colData.image)
  {
    var i = new Image();
    i.src = colData.image;

    if (typeof colData.imageWidth != "undefined")
      i.width = colData.imageWidth;

    if (typeof colData.imageHeight != "undefined")
      i.height = colData.imageHeight;

    headerInnerTextBox.appendChild(i);
  };

  if (colData.label) {
    headerInnerTextBox.appendChild(document.createTextNode(colData.label));
  };


  // PUSH CONTENT TO CONTENT FRAME
  // ----------------------------------------

  this._pushElements(contentBox, colData.content);



  // APPEND CELLS TO ROWS
  // ----------------------------------------

  // :: to header row
  this._headerRow.appendChild(headerCell);

  // :: to prototype content row
  this._contentProtoRow.appendChild(contentCell);


  // APPEND COL ELEMENTS TO COLGROUPS
  // AND CACHE REFERENCES
  // ----------------------------------------

  var headerCol = document.createElement("col");
  this._headerColGroup.appendChild(headerCol);
  this._nodeHeaderColsCache.push(headerCol);

  var contentCol = document.createElement("col");
  this._contentColGroup.appendChild(contentCol);
  this._nodeContentColsCache.push(contentCol);


  // CACHE ROW NODE REFERENCES
  // ----------------------------------------
  if (typeof this._nodeRowCache == "undefined") {
    this._nodeRowCache = [];
  };

  var j = this._contentProtoRow.childNodes.length-1;
  this._nodeRowCache[j] = [];

  for (var i=0; i<contentBox.childNodes.length; i++) {
    this._nodeRowCache[j].push(contentBox.childNodes[i]);
  };



  // CACHE HEADER NODE REFERENCES
  // ----------------------------------------
  this._nodeHeaderCellCache.push(headerCell);
  this._nodeHeaderInnerTableCache.push(headerInnerTable);
  this._nodeHeaderInnerTextCellCache.push(headerInnerTextCell);
  this._nodeHeaderInnerTextBoxCache.push(headerInnerTextBox);
  this._nodeHeaderInnerSortCellCache.push(headerInnerSortCell);
  this._nodeHeaderInnerSortIconCache.push(headerInnerSortImage);



  // APPLY CLASS NAMES
  // ----------------------------------------

  var classNamePart = colData.id.toFirstUp();

  QxDOM.addClass(headerCell, "QxListViewHeaderCell-" + classNamePart);
  QxDOM.addClass(contentCell, "QxListViewContentCell-" + classNamePart);
};






/*
  -------------------------------------------------------------------------------
    DOM ROW HANDLING
  -------------------------------------------------------------------------------
*/

proto._createRowDo = function(elemType, elemNode, elemContent)
{
  try{
    switch(elemType)
    {
      case "text":
        elemNode.nodeValue = elemContent;
        break;

      case "image":
        elemNode.src = elemContent;
        break;

      default:
        throw new Error("Unsupported type #2: " + elemType);
    };
  }
  catch(ex) {
    throw new Error("Failed to add Row: " + elemType + ", " + elemNode + ", " + elemContent + ": " + ex);
  };
};

proto._createRow = function(rowData, rowTarget)
{
  var col, cols = this._columns, i = this._columnsLength, base;

  try
  {
    do
    {
      col = cols[i];
      base = this._nodeRowCache[i];

      switch(col.contentType)
      {
        case "string":
          this._createRowDo(col.content, base[0], rowData[col.id]);
          break;

        case "object":
          j=col.contentLength;
          do { this._createRowDo(col.content[j], base[j], rowData[col.id][j]); } while(j--);
          break;
      };
    }
    while(i--);
  }
  catch(ex) {
    throw new Error("Failed on column: " + i + ": " + ex);
  };

  //this.debug(this + " :: " + this._contentProtoRow);

  var newRow = this._contentProtoRow.cloneNode(true);
  newRow.style.display = "";
  newRow._data = rowData;

  return newRow;
};



/*
  -------------------------------------------------------------------------------
    SELECTION
  -------------------------------------------------------------------------------
*/

proto.setSelection = function(newSelection, oldSelection)
{
  var i;


  // BUILDING TODO LISTS
  // -----------------------------------------------------

  var toSelect = [];
  var newSelectionLength = 0;
  for (i in newSelection) {
    if (!oldSelection[i]) {
      toSelect.push(i);
    };

    newSelectionLength++;
  };

  var toDeselect = [];
  for (i in oldSelection) {
    if (!newSelection[i]) {
      toDeselect.push(i);
    };
  };


  // CLASS OPERATIONS
  // -----------------------------------------------------

  var ch = this._contentBody.childNodes;

  var toSelectLength = toSelect.length;
  for (i=0; i<toSelectLength; i++) {
    QxDOM.addClass(ch[toSelect[i]], "QxListViewContentRowSelected");
  };

  var toDeselectLength = toDeselect.length;
  for (i=0; i<toDeselectLength; i++) {
    QxDOM.removeClass(ch[toDeselect[i]], "QxListViewContentRowSelected");
  };



  // PRE CHECK FOR CHANGES
  // -----------------------------------------------------

  var changeSelectionLength = this._selectionLength != newSelectionLength;

  if (changeSelectionLength) {
    var newSelectionMode = this._evalSelectionMode(newSelectionLength);
    var changeSelectionMode = this._selectionMode != newSelectionMode;
  };



  // STORE NEW VALUES
  // -----------------------------------------------------

  this._selection = newSelection;

  if (changeSelectionLength) {
    this._selectionLength = newSelectionLength;

    if (changeSelectionMode) {
      this._selectionMode = newSelectionMode;
    };
  };



  // DISPATCH EVENTS
  // -----------------------------------------------------

  if (this.hasEventListeners("changeSelection")) {
    this.dispatchEvent(new QxDataEvent("changeSelection", this._selection), true);
  };

  if (changeSelectionLength)
  {
    if (this.hasEventListeners("changeSelectionLength")) {
      this.dispatchEvent(new QxDataEvent("changeSelectionLength", this._selectionLength), true);
    };

    if (changeSelectionMode)
    {
      if (this.hasEventListeners("changeSelectionMode")) {
        this.dispatchEvent(new QxDataEvent("changeSelectionMode", this._selectionMode), true);
      };
    };
  };
};

/*!
  Get current selection
*/
proto.getSelection       = function() { return this._selection;       };

/*!
  Get current selection length
*/
proto.getSelectionLength = function() { return this._selectionLength; };

/*!
  Get current selection mode
*/
proto.getSelectionMode   = function() { return this._selectionMode;   };

/*!
  Convert selection length to selection mode
*/
proto._evalSelectionMode = function(l)
{
  switch(l)
  {
    case 0:
      return "none";

    case 1:
      return "single";

    default:
      return "multi";
  };
};

// this store the last selected row,
// needed for shift key combinations
proto._lastSelect = null;

/*!
  Handle onclick
*/
proto._onclick = function(e)
{
  // HANDLE CURRENT CONTEXT MENU
  // -----------------------------------------------------

  if (this.getContextMenu()) {
    this.getContextMenu().setVisible(false);
  };


  // FIND MATCHING ENTRY ROW
  // -----------------------------------------------------

  var r = e.getDomTarget();
  var m = this.getElement();

  while(r != m && (r.nodeType != 1 || r.tagName != "TR")) {
    if (r.tagName == "TH") {
      return;
    };

    r = r.parentNode;
  };


  // PREPARE
  // -----------------------------------------------------

  var rowPosition = r._data.pos;
  var oldSelection = this.getSelection();
  var newSelection = {};

  // keep current selection
  if (e.getCtrlKey()){
    for (var i in oldSelection) {
      newSelection[i] = oldSelection[i];
    };
  };


  // HANDLE SHIFT KEY
  // -----------------------------------------------------

  if (e.getShiftKey())
  {
    if (this._lastSelect == null) {
      return;
    };

    if (rowPosition < this._lastSelect) {
      var istart = rowPosition, istop = this._lastSelect;
    } else {
      var istart = this._lastSelect, istop = rowPosition;
    };

    for (var i=istart; i<=istop; i++) {
      newSelection[i] = true;
    };
  }


  // HANDLE DEFAULT FLOW
  // -----------------------------------------------------

  else
  {
    if (e.getCtrlKey() && newSelection[rowPosition]) {
      delete newSelection[rowPosition];
    }
    else
    {
      newSelection[rowPosition] = true;
      this._lastSelect = rowPosition;
    };
  };


  // SET NEW SELECTION
  // -----------------------------------------------------

  this.setSelection(newSelection, oldSelection);
};



/*
  -------------------------------------------------------------------------------
    CONTEXTMENU
  -------------------------------------------------------------------------------
*/

/* Currently unsupported */
/*
proto._oncontextmenu = function(e)
{
  // PRE-CHECK MENU
  // -----------------------------------------------------

  var menu = this.getContextMenu();

  if (!menu) {
    return;
  };


  // FIND MATCHING ENTRY ROW
  // -----------------------------------------------------

  var r = e.getDomTarget();
  var m = this.getElement();

  while(r != m && (r.nodeType != 1 || r.tagName != "TR")) {
    if (r.tagName == "TH")
      return;

    r = r.parentNode;
  };

  if( r == null || r.tagName != "TR" ) {
    return menu.setVisible(false);
  };


  // SELECTION
  // -----------------------------------------------------

  var rowPosition = r._data.pos;
  var oldSelection = this.getSelection();

  if (!e.getCtrlKey() && !oldSelection[rowPosition])
  {
    var newSelection = {};
    newSelection[rowPosition] = true;

    this.setSelection(newSelection, oldSelection);
  };


  // MENU PLACEMENT
  // -----------------------------------------------------

  this.getTopLevelWidget().getWindow().setCurrentContextMenu(menu);

  menu.setLeft(e.getClientX());
  menu.setTop(e.getClientY());
  menu.setVisible(true);
};
*/




/*
  -------------------------------------------------------------------------------
    WHEEL-HANDLING
  -------------------------------------------------------------------------------
*/
proto._onmousewheel = function(e) {
  if (this.getContextMenu()) {
    this.getContextMenu().setVisible(false);
  };

  this._content.scrollTop += e.getWheelDelta() * -10;
};


/*
  -------------------------------------------------------------------------------
    SCROLL-HANDLING
  -------------------------------------------------------------------------------
*/
proto._lastScrollLeft = 0;

proto._onscroll = function() {
  if (this.getContextMenu()) {
    this.getContextMenu().setVisible(false);
  };

  this._syncScrollLeft();
  this._scrollSmoothTimer.start();
};

proto._onscrollsmooth = function() {
  if (this._content.scrollLeft == this._lastScrollLeft) {
    this._scrollSmoothTimer.stop();
  };

  this._syncScrollLeft();
};

proto._onscrollemu = function() {
  if (this._content.scrollLeft != this._lastScrollLeft) {
    this._syncScrollLeft();
  };
};

proto._syncScrollLeft = function() {
  var s = this._content.scrollLeft;

  this._lastScrollLeft = s;
  this._headerTable.style.left = (-s) + "px";
};






proto._modifyHorizontalDimension = function(propValue, propOldValue, propName, uniqModIds)
{
  QxWidget.prototype._modifyHorizontalDimension.call(this, propValue, propOldValue, propName, uniqModIds);

  if (propName == "width" && this._wasVisible) {
    QxDOM.setWidth(this._header, QxDOM.getComputedInnerWidth(this._content));
  };

  return true;
};

proto._renderTableLayoutInitial = function()
{
  QxDebugTimer("initiallayout");

  var hasScrollRight = QxDOM.getComputedScrollBarVisibleX(this._content);
  var hasScrollBottom = QxDOM.getComputedScrollBarVisibleY(this._content);

  QxDOM.setWidth(this._header, QxDOM.getComputedInnerWidth(this._content));



  var colLength = this._columnsLength;

  var todoValues = new Array(colLength);
  var todoValuesSum = 0;

  var scaleColumns = [];

  var currentCol;
  var currentScaleColumn;
  var currentTodo;


  var firstRow = [];
  for (var i=0; i<this._columns.length; i++) {
    firstRow.push(this._contentBody.firstChild.childNodes[i]);
  };


  var colLoop = colLength;
  do
  {
    currentCol = this._columns[colLoop];

    if (currentCol.hasStaticWidth)
    {
      currentTodo = currentCol.width;
    }
    else
    {
      // Get preferred width
      currentTodo = Math.max(this._nodeHeaderCellCache[colLoop].offsetWidth, firstRow[colLoop].offsetWidth);

      /*
      this.debug("Detect[NATURE][" + currentCol.id + "]: " + currentTodo);
      this.debug(" - Header: " + this._nodeHeaderCellCache[colLoop].offsetWidth);
      this.debug(" - HeaderInner: " + this._nodeHeaderInnerTextBoxCache[colLoop].offsetWidth);
      this.debug(" - Content: " + firstRow[colLoop].offsetWidth);
      this.debug(" - ContentInner: " + firstRow[colLoop].firstChild.offsetWidth);
      */

      if (currentCol.hasMaxWidthLimit && currentTodo > currentCol.maxWidth)
      {
        currentTodo = currentCol.maxWidth;
      }
      else
      {
        if (currentCol.hasMinWidthLimit && currentCol.minWidth > currentTodo)
        {
          currentTodo = currentCol.minWidth;
        };
      };
    };

    todoValues[colLoop] = currentTodo;
    todoValuesSum += currentTodo;
  }
  while(colLoop--);



  // Activate Overflow in Header and Content Cells
  this._header.className = this._header.className.add("QxListViewHeaderOverflow", " ");
  this._content.className = this._content.className.add("QxListViewContentOverflow", " ");



  var innerAvail = QxDOM.getComputedInnerWidth(this._content) - todoValuesSum;

  if (innerAvail > 0)
  {
    var innerCurrentAvail = innerAvail;


    /*
      2. Berechne Pixel Werte fuer Skalierungsfaktoren,
         addiere Ergebnis zum bishereigen Todo-Wert
         der Spalte und ziehe es von der verfuegbaren
         Breite ab.
    */
    var innerAvailToShareCount = 0;
    colLoop = colLength;
    do
    {
      currentCol = this._columns[colLoop];

      if (!currentCol.hasScaleWidth) {
        continue;
      };

      if (currentCol.hasScaleFactor)
      {
        currentTodo = todoValues[colLoop] + Math.floor(innerAvail * currentCol.scaleFactor);

        if (currentCol.hasMaxWidthLimit && currentTodo > currentCol.maxWidth) {
          currentTodo = currentCol.maxWidth;
        };

        /*
        var resRatio = Math.round(((currentTodo - todoValues[colLoop]) / innerAvail) * 100) / 100;
        this.debug("Grow[RATIO]: " + currentCol.id + " = " + currentTodo + " (" + resRatio + ")");
        */

        innerCurrentAvail -= (currentTodo - todoValues[colLoop]);
        todoValues[colLoop] = currentTodo;
      }
      else
      {
        innerAvailToShareCount++;
      };
    }
    while(colLoop--);



    /*
      3. Verteile restlichen Platz auf Spalten, die zwar
         skalieren sollen, aber keinen Faktor angegeben haben.
    */
    var currentAddTodo = 0;

    colLoop = colLength;
    do
    {
      currentCol = this._columns[colLoop];

      if (!currentCol.hasScaleWidth) {
        continue;
      };

      if (!currentCol.hasScaleFactor)
      {
        currentTodo = todoValues[colLoop] + Math.floor(innerCurrentAvail / innerAvailToShareCount);

        if (currentCol.hasMaxWidthLimit && currentTodo > currentCol.maxWidth) {
          currentTodo = currentCol.maxWidth;
        };

        /*
        var resRatio = Math.round(((currentTodo - todoValues[colLoop]) / innerAvail) * 100) / 100;
        this.debug("Grow[SHARE]: " + currentCol.id + " = " + currentTodo + " (" + resRatio + ")");
        */

        todoValues[colLoop] = currentTodo;
      };
    }
    while(colLoop--);
  };


  /*
    4. Set calculated widths
  */
  this._contentTable.removeChild(this._contentColGroup);

  var sum = 0;

  var currentTextWidth, diff, tsize;
  colLoop = colLength;
  do
  {
    currentCol = this._columns[colLoop];
    currentTodo = todoValues[colLoop];

    this._nodeHeaderColsCache[colLoop].width = this._nodeContentColsCache[colLoop].width = currentTodo;
    sum += currentTodo;

    // Calculate and Set Inner Text Box Width
    diff = QxDOM.getComputedBoxWidth(this._nodeHeaderCellCache[colLoop]) - QxDOM.getComputedBoxWidth(this._nodeHeaderInnerTextBoxCache[colLoop]);
    tsize = currentTodo - diff;

    if (tsize < 20)
    {
      this._nodeHeaderInnerSortCellCache[colLoop].style.display = "none";

      diff = QxDOM.getComputedBoxWidth(this._nodeHeaderCellCache[colLoop]) - QxDOM.getComputedBoxWidth(this._nodeHeaderInnerTextBoxCache[colLoop]);
      tsize = currentTodo - diff;
    };

    this._nodeHeaderInnerTextBoxCache[colLoop].style.width = tsize + "px";
  }
  while(colLoop--);


  this._contentTable.insertBefore(this._contentColGroup, this._contentBody);

  // this helps opera 7.6rc3 to apply the table layout
  // is this needed in final version, too?
  this.repaint();

  this._contentTable.style.width = this._headerTable.style.width = sum + "px";
  this._contentTable.style.tableLayout = this._headerTable.style.tableLayout = "fixed";

  this._syncScrollLeft();
  this._header.style.visibility = "visible";

  return true;
};






proto.dispose = function()
{
  if (this._disposed)
    return;

  QxWidget.prototype.dispose.call(this);


  // cleanup internal data
  if (this._columns) {
    for (var i=0; i<this._columnsLength; i++) {
      delete this._columns[i];
    };
  };

  delete this._columns;
  delete this._columnsLength;


  if (this._data) {
    for (var i=0; i<this._data.length; i++) {
      delete this._data[i];
    };
  };

  delete this._data;
  delete this._selection;
  delete this._fragment;

  // remove scroll event listener
  if (this._content) {
    this._content.onscroll = null;
  };




  // remove event listeners
  this.removeEventListener("click", this._onclick);
  this.removeEventListener("mousewheel", this._onmousewheel);

  // clear row queue
  delete this._rowCreateQueue;

  // disable and dispose row create timer
  if (this._rowCreateTimer) {
    this._rowCreateTimer.removeEventListener("interval", this._onrowcreate, this);
    this._rowCreateTimer.dispose();
    delete this._rowCreateTimer;
  };

  delete this._rowAppendQueue;

  // disable and dispose row append timer
  if (this._rowAppendTimer) {
    this._rowAppendTimer.removeEventListener("interval", this._onrowappend, this);
    this._rowAppendTimer.dispose();
    delete this._rowAppendTimer;
  };


  if (this._scrollSmoothTimer) {
    this._scrollSmoothTimer.removeEventListener("interval", this._onscrollsmooth, this);
    this._scrollSmoothTimer.dispose();
    delete this._scrollSmoothTimer;
  };

  if (this._scrollEmuTimer) {
    this._scrollEmuTimer.removeEventListener("interval", this._onscrollemu, this);
    this._scrollEmuTimer.dispose();
    delete this._scrollEmuTimer;
  };


  // clear up node caches
  delete this._nodeRowCache;

  delete this._nodeHeaderColsCache;
  delete this._nodeContentColsCache;

  delete this._nodeHeaderCellCache;
  delete this._nodeContentFirstRowCellCache;

  delete this._nodeHeaderInnerTableCache;
  delete this._nodeHeaderInnerTextCellCache;
  delete this._nodeHeaderInnerTextBoxCache;
  delete this._nodeHeaderInnerSortCellCache;
  delete this._nodeHeaderInnerSortIconCache;
};







/*
  ################################################################################
    Create Clone-able node structure
  ################################################################################
*/

QxListView.init = function()
{
  // HEADER
  // --------------------------------------

  var h1 = document.createElement("div");
  var h2 = document.createElement("table");
  var h3 = document.createElement("colgroup");

  var h4 = document.createElement("thead");
  var h5 = document.createElement("tr");
  var h6 = document.createElement("th");

  var h7 = document.createElement("table");
  var h8 = document.createElement("thead");

  var h9 = document.createElement("tr");
  var h10 = document.createElement("th");
  var h11 = document.createElement("th");
  var h12 = document.createElement("div");
  var h13 = document.createElement("img");

  h1.className = "QxListViewHeader";
  h2.className = "QxListViewHeaderTable";
  h4.className = "QxListViewHeaderBody";
  h5.className = "QxListViewHeaderRow";
  h6.className = "QxListViewHeaderCell";

  h7.className = "QxListViewHeaderInner";
  h8.className = "QxListViewHeaderInnerBody";
  h9.className = "QxListViewHeaderInnerRow";
  h10.className = "QxListViewHeaderInnerText";
  h11.className = "QxListViewHeaderInnerSort";
  h12.className = "QxListViewHeaderInnerTextBox";
  h13.className = "QxListViewHeaderInnerSortImage";

  h13.src = (new QxImageManager).buildURI("widgets/arrows/down.gif");
  h13.style.visibility = "hidden";

  h2.cellSpacing = h2.cellPadding = "0";
  h7.cellSpacing = h7.cellPadding = "0";

  if ((new QxClient).isMshtml()) {
    h1.unselectable = h2.unselectable = h4.unselectable = h5.unselectable = h6.unselectable = h7.unselectable = h8.unselectable = h9.unselectable = h10.unselectable = h11.unselectable = h12.unselectable = h13.unselectable = "on";
  };

  h1.appendChild(h2);
  h2.appendChild(h3);
  h2.appendChild(h4);
  h4.appendChild(h5);

  h6.appendChild(h7);
  h7.appendChild(h8);
  h8.appendChild(h9);
  h9.appendChild(h10);
  h9.appendChild(h11);
  h10.appendChild(h12);
  h11.appendChild(h13);

  QxListView._headerProtoFrame = h1;
  QxListView._headerProtoCell = h6;



  // CONTENT
  // --------------------------------------

  var c1 = document.createElement("div");
  var c2 = document.createElement("table");
  var c3 = document.createElement("colgroup");
  var c4 = document.createElement("tbody");
  var c5 = document.createElement("tr");
  var c6 = document.createElement("td");
  var c7 = document.createElement("div");

  c1.className = "QxListViewContent";
  c2.className = "QxListViewContentTable";
  c4.className = "QxListViewContentBody";
  c5.className = "QxListViewContentRow";
  c6.className = "QxListViewContentCell";
  c7.className = "QxListViewContentBox";

  c2.cellSpacing = c2.cellPadding = "0";

  if ((new QxClient).isMshtml()) {
    c1.unselectable = c2.unselectable = c4.unselectable = c5.unselectable = c6.unselectable = c7.unselectable = "on";
  };

  c1.appendChild(c2);
  c2.appendChild(c3);
  c2.appendChild(c4);

  c6.appendChild(c7);

  QxListView._contentProtoFrame = c1;
  QxListView._contentProtoRow = c5;
  QxListView._contentProtoCell = c6;


  // TYPES
  // --------------------------------------

  QxListView._protoTypeElements = {
    text : document.createTextNode(String.fromCharCode(160)),
    image : new Image()

    // ******************************
    // EXTEND WITH NEW TYPES HERE
    // ******************************
  };

  QxListView._protoTypeElements.image.src = (new QxImageManager).buildURI("core/blank.gif");
};

QxListView.init();
