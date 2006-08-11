/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2006 by 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL 2.1: http://www.gnu.org/licenses/lgpl.html

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************

#module(ioremote)

************************************************************************ */

qx.OO.defineClass("qx.io.remote.FormUtils");

qx.io.remote.FormUtils.ignoreInputTypes = [ "file", "submit", "image", "reset", "button" ];
qx.io.remote.FormUtils.ignoreElementTypes = [ "fieldset" ];
qx.io.remote.FormUtils.checkElementTypes = [ "radio", "checkbox" ];
qx.io.remote.FormUtils.multiSelectType = "select-multiple";

qx.io.remote.FormUtils.inputFilter = function(vNode)
{
  if (vNode.disabled) {
    return false;
  }

  var vTag = (vNode.tagName || qx.constant.Core.EMPTY).toLowerCase();

  if (qx.lang.Array.contains(qx.io.remote.FormUtils.ignoreElementTypes, vTag)) {
    return false;
  }

  var vType = vNode.type.toLowerCase();

  if (qx.lang.Array.contains(qx.io.remote.FormUtils.ignoreInputTypes, vType)) {
    return false;
  }

  if (!vNode.checked && qx.lang.Array.contains(qx.io.remote.FormUtils.checkElementTypes, vType)) {
    return false;
  }

  return true;
}

qx.io.remote.FormUtils.getFields = function(vForm) {
  return Array.filter(vForm.elements, qx.io.remote.FormUtils.inputFilter);
}

qx.io.remote.FormUtils.encodeField = function(vNode)
{
  var vName = vNode.name || qx.constant.Core.EMPTY;
  var vType = (vNode.type || qx.constant.Core.EMPTY).toLowerCase();

  if(vType === qx.io.remote.FormUtils.multiSelectType)
  {
    var vValues = [];

    for(var i=0; i<vNode.options.length; i++)
    {
      if(vNode.options[i].selected) {
        vValues.push(vName + qx.constant.Core.EQUAL + vNode.options[i].value);
      }
    }

    return vValues.join(qx.constant.Core.AMPERSAND);
  }
  else
  {
    return vName + qx.constant.Core.EQUAL + vNode.value;
  }
}

qx.io.remote.FormUtils.encodeForm = function(vForm)
{
  var vFields = qx.io.remote.FormUtils.getFields(vForm);
  var vAll = [];

  for (var i=0, l=vFields.length; i<l; i++) {
    vAll.push(qx.io.remote.FormUtils.encodeField(vFields[i]));
  }

  return vAll.join(qx.constant.Core.AMPERSAND);
}

qx.io.remote.FormUtils.bind = function(vForm, vMethod)
{
  qx.dom.DomEventRegistration.addEventListener(vForm, qx.constant.Event.SUBMIT, function(e)
  {
    e.returnValue = false;

    if (typeof e.preventDefault === qx.constant.Type.FUNCTION) {
      e.preventDefault();
    }

    return vMethod(e);
  });
}
