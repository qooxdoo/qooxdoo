/*!
  This event handles all focus events.

  The four supported types are:
  1+2: focus and blur also propagate the target object
  3+4: focusout and focusin are bubbling to the parent objects
*/
function QxFocusEvent(eType, autoDispose)
{
  QxEvent.call(this, eType, autoDispose);

  if(eType == "focusin" || eType == "focusout")
  {
    this._bubbles = true;
    this._propagationStopped = false;
  };
};

QxFocusEvent.extend(QxEvent, "QxFocusEvent");
