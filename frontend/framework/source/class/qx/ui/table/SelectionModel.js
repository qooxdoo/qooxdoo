/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2006 by STZ-IDA, Germany, http://www.stz-ida.de

   License:
     LGPL 2.1: http://www.gnu.org/licenses/lgpl.html

   Authors:
     * Til Schneider (til132)

************************************************************************ */

/* ************************************************************************

#module(table)
#require(qx.constant.Type)

************************************************************************ */

/**
 * A selection model.
 */
qx.OO.defineClass("qx.ui.table.SelectionModel", qx.core.Target,
function() {
  qx.core.Target.call(this);

  this._selectedRangeArr = [];
  this._anchorSelectionIndex = -1;
  this._leadSelectionIndex = -1;
});


/** {int} The selection mode "none". Nothing can ever be selected. */
qx.Class.NO_SELECTION = 1;

/** {int} The selection mode "single". This mode only allows one selected item. */
qx.Class.SINGLE_SELECTION = 2;

/**
 * {int} The selection mode "single interval". This mode only allows one
 * continuous interval of selected items.
 */
qx.Class.SINGLE_INTERVAL_SELECTION = 3;

/**
 * {int} The selection mode "multiple interval". This mode only allows any
 * selection.
 */
qx.Class.MULTIPLE_INTERVAL_SELECTION = 4;


/**
 * {int} the selection mode.
 */
qx.OO.addProperty({ name:"selectionMode", type:qx.constant.Type.NUMBER,
  defaultValue:qx.Class.SINGLE_SELECTION,
  possibleValues:[ qx.Class.NO_SELECTION,
           qx.Class.SINGLE_SELECTION,
           qx.Class.SINGLE_INTERVAL_SELECTION,
           qx.Class.MULTIPLE_INTERVAL_SELECTION  ] });


// property modifier
qx.Proto._modifySelectionMode = function(selectionMode) {
  if (selectionMode == qx.ui.table.SelectionModel.NO_SELECTION) {
    this.clearSelection();
  }
  return true;
}


/**
 * Returns the first argument of the last call to {@link #setSelectionInterval()},
 * {@link #addSelectionInterval()} or {@link #removeSelectionInterval()}.
 *
 * @return {int} the ancor selection index.
 */
qx.Proto.getAnchorSelectionIndex = function() {
  return this._anchorSelectionIndex;
}


/**
 * Returns the second argument of the last call to {@link #setSelectionInterval()},
 * {@link #addSelectionInterval()} or {@link #removeSelectionInterval()}.
 *
 * @return {int} the lead selection index.
 */
qx.Proto.getLeadSelectionIndex = function() {
  return this._leadSelectionIndex;
}


/**
 * Clears the selection.
 */
qx.Proto.clearSelection = function() {
  if (! this.isSelectionEmpty()) {
    this._clearSelection();
    this._fireSelectionChanged();
  }
}


/**
 * Returns whether the selection is empty.
 *
 * @return {boolean} whether the selection is empty.
 */
qx.Proto.isSelectionEmpty = function() {
  return this._selectedRangeArr.length == 0;
}


/**
 * Returns the number of selected items.
 *
 * @return {int} the number of selected items.
 */
qx.Proto.getSelectedCount = function() {
  var selectedCount = 0;
  for (var i = 0; i < this._selectedRangeArr.length; i++) {
    var range = this._selectedRangeArr[i];
    selectedCount += range.maxIndex - range.minIndex + 1;
  }

  return selectedCount;
}


/**
 * Returns whether a index is selected.
 *
 * @param index {int} the index to check.
 * @return {boolean} whether the index is selected.
 */
qx.Proto.isSelectedIndex = function(index) {
  for (var i = 0; i < this._selectedRangeArr.length; i++) {
    var range = this._selectedRangeArr[i];

    if (index >= range.minIndex && index <= range.maxIndex) {
      return true;
    }
  }

  return false;
}


/**
 * Sets the selected interval. This will clear the former selection.
 *
 * @param fromIndex {int} the first index of the selection (including).
 * @param toIndex {int} the last index of the selection (including).
 */
qx.Proto.setSelectionInterval = function(fromIndex, toIndex) {
  var SelectionModel = qx.ui.table.SelectionModel;

  switch(this.getSelectionMode()) {
    case SelectionModel.NO_SELECTION:
      return;
    case SelectionModel.SINGLE_SELECTION:
      fromIndex = toIndex;
      break;
  }

  this._clearSelection();
  this._addSelectionInterval(fromIndex, toIndex);

  this._fireSelectionChanged();
}


/**
 * Adds a selection interval to the current selection.
 *
 * @param fromIndex {int} the first index of the selection (including).
 * @param toIndex {int} the last index of the selection (including).
 */
qx.Proto.addSelectionInterval = function(fromIndex, toIndex) {
  var SelectionModel = qx.ui.table.SelectionModel;

  switch (this.getSelectionMode()) {
    case SelectionModel.NO_SELECTION:
      return;
    case SelectionModel.MULTIPLE_INTERVAL_SELECTION:
      this._addSelectionInterval(fromIndex, toIndex);
      this._fireSelectionChanged();
      break;
    default:
      this.setSelectionInterval(fromIndex, toIndex);
      break;
  }
}


/**
 * Removes a interval from the current selection.
 *
 * @param fromIndex {int} the first index of the interval (including).
 * @param toIndex {int} the last index of the interval (including).
 */
qx.Proto.removeSelectionInterval = function(fromIndex, toIndex) {
  this._anchorSelectionIndex = fromIndex;
  this._leadSelectionIndex = toIndex;

  var minIndex = Math.min(fromIndex, toIndex);
  var maxIndex = Math.max(fromIndex, toIndex);

  // Crop the affected ranges
  for (var i = 0; i < this._selectedRangeArr.length; i++) {
    var range = this._selectedRangeArr[i];

    if (range.minIndex > maxIndex) {
      // We are done
      break;
    } else if (range.maxIndex >= minIndex) {
      // This range is affected
      var minIsIn = (range.minIndex >= minIndex) && (range.minIndex <= maxIndex);
      var maxIsIn = (range.maxIndex >= minIndex) && (range.maxIndex <= maxIndex);

      if (minIsIn && maxIsIn) {
        // This range is removed completely
        this._selectedRangeArr.splice(i, 1);

        // Check this index another time
        i--;
      } else if (minIsIn) {
        // The range is cropped from the left
        range.minIndex = maxIndex + 1;
      } else if (maxIsIn) {
        // The range is cropped from the right
        range.maxIndex = minIndex - 1;
      } else {
        // The range is split
        var newRange = { minIndex:maxIndex + 1, maxIndex:range.maxIndex }
        this._selectedRangeArr.splice(i + 1, 0, newRange);

        range.maxIndex = minIndex - 1;

        // We are done
        break;
      }
    }
  }

  //this._dumpRanges();

  this._fireSelectionChanged();
}


/**
 * Clears the selection, but doesn't inform the listeners.
 */
qx.Proto._clearSelection = function() {
  this._selectedRangeArr = [];
}


/**
 * Adds a selection interval to the current selection, but doesn't inform
 * the listeners.
 *
 * @param fromIndex {int} the first index of the selection (including).
 * @param toIndex {int} the last index of the selection (including).
 */
qx.Proto._addSelectionInterval = function(fromIndex, toIndex) {
  this._anchorSelectionIndex = fromIndex;
  this._leadSelectionIndex = toIndex;

  var minIndex = Math.min(fromIndex, toIndex);
  var maxIndex = Math.max(fromIndex, toIndex);

  // Find the index where the new range should be inserted
  var newRangeIndex = 0;
  for (; newRangeIndex < this._selectedRangeArr.length; newRangeIndex++) {
    var range = this._selectedRangeArr[newRangeIndex];
    if (range.minIndex > minIndex) {
      break;
    }
  }

  // Add the new range
  this._selectedRangeArr.splice(newRangeIndex, 0, { minIndex:minIndex, maxIndex:maxIndex });

  // Merge overlapping ranges
  var lastRange = this._selectedRangeArr[0];
  for (var i = 1; i < this._selectedRangeArr.length; i++) {
    var range = this._selectedRangeArr[i];

    if (lastRange.maxIndex + 1 >= range.minIndex) {
      // The ranges are overlapping -> merge them
      lastRange.maxIndex = Math.max(lastRange.maxIndex, range.maxIndex);

      // Remove the current range
      this._selectedRangeArr.splice(i, 1);

      // Check this index another time
      i--;
    } else {
      lastRange = range;
    }
  }

  //this._dumpRanges();
}


/**
 * Logs the current ranges for debug perposes.
 */
qx.Proto._dumpRanges = function() {
  var text = "Ranges:";
  for (var i = 0; i < this._selectedRangeArr.length; i++) {
    var range = this._selectedRangeArr[i];
    text += " [" + range.minIndex + ".." + range.maxIndex + "]";
  }
  this.debug(text);
}


/**
 * Fires the "selectionChanged" event to all registered listeners.
 */
qx.Proto._fireSelectionChanged = function() {
  if (this.hasEventListeners("selectionChanged")) {
    this.dispatchEvent(new qx.event.type.Event("selectionChanged"), true);
  }
}
