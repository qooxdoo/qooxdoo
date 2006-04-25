/* ************************************************************************

   qooxdoo - the new era of web interface development

   Copyright:
     (C) 2004-2006 by Schlund + Partner AG, Germany
         All rights reserved

   License:
     LGPL 2.1: http://creativecommons.org/licenses/LGPL/2.1/

   Internet:
     * http://qooxdoo.oss.schlund.de

   Authors:
     * Sebastian Werner (wpbasti)
       <sebastian dot werner at 1und1 dot de>
     * Andreas Ecker (aecker)
       <andreas dot ecker at 1und1 dot de>

************************************************************************ */

/* ************************************************************************

#package(form)

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
  };

  var vTag = (vNode.tagName || qx.Const.CORE_EMPTY).toLowerCase();

  if (qx.lang.Array.contains(qx.io.remote.FormUtils.ignoreElementTypes, vTag)) {
    return false;
  };

  var vType = vNode.type.toLowerCase();

  if (qx.lang.Array.contains(qx.io.remote.FormUtils.ignoreInputTypes, vType)) {
    return false;
  };

  if (!vNode.checked && qx.lang.Array.contains(qx.io.remote.FormUtils.checkElementTypes, vType)) {
    return false;
  };

  return true;
};

qx.io.remote.FormUtils.getFields = function(vForm) {
  return Array.filter(vForm.elements, qx.io.remote.FormUtils.inputFilter);
};

qx.io.remote.FormUtils.encodeField = function(vNode)
{
  var vName = vNode.name || qx.Const.CORE_EMPTY;
  var vType = (vNode.type || qx.Const.CORE_EMPTY).toLowerCase();

  if(vType === qx.io.remote.FormUtils.multiSelectType)
  {
    var vValues = [];

    for(var i=0; i<vNode.options.length; i++)
    {
      if(vNode.options[i].selected) {
        vValues.push(vName + qx.Const.CORE_EQUAL + vNode.options[i].value);
      };
    };

    return vValues.join(qx.Const.CORE_AMPERSAND);
  }
  else
  {
    return vName + qx.Const.CORE_EQUAL + vNode.value;
  };
};

qx.io.remote.FormUtils.encodeForm = function(vForm)
{
  var vFields = qx.io.remote.FormUtils.getFields(vForm);
  var vAll = [];

  for (var i=0, l=vFields.length; i<l; i++) {
    vAll.push(qx.io.remote.FormUtils.encodeField(vFields[i]));
  };

  return vAll.join(qx.Const.CORE_AMPERSAND);
};

qx.io.remote.FormUtils.bind = function(vForm, vMethod)
{
  qx.dom.DomEventRegistration.addEventListener(vForm, qx.Const.EVENT_TYPE_SUBMIT, function(e)
  {
    e.returnValue = false;

    if (typeof e.preventDefault === qx.Const.TYPEOF_FUNCTION) {
      e.preventDefault();
    };

    return vMethod(e);
  });
};
