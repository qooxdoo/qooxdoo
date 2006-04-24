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

QxFormUtils = {};

QxFormUtils.ignoreInputTypes = [ "file", "submit", "image", "reset", "button" ];
QxFormUtils.ignoreElementTypes = [ "fieldset" ];
QxFormUtils.checkElementTypes = [ "radio", "checkbox" ];
QxFormUtils.multiSelectType = "select-multiple";

QxFormUtils.inputFilter = function(vNode)
{
  if (vNode.disabled) {
    return false;
  };

  var vTag = (vNode.tagName || qx.Const.CORE_EMPTY).toLowerCase();

  if (qx.lang.Array.contains(QxFormUtils.ignoreElementTypes, vTag)) {
    return false;
  };

  var vType = vNode.type.toLowerCase();

  if (qx.lang.Array.contains(QxFormUtils.ignoreInputTypes, vType)) {
    return false;
  };

  if (!vNode.checked && qx.lang.Array.contains(QxFormUtils.checkElementTypes, vType)) {
    return false;
  };

  return true;
};

QxFormUtils.getFields = function(vForm) {
  return Array.filter(vForm.elements, QxFormUtils.inputFilter);
};

QxFormUtils.encodeField = function(vNode)
{
  var vName = vNode.name || qx.Const.CORE_EMPTY;
  var vType = (vNode.type || qx.Const.CORE_EMPTY).toLowerCase();

  if(vType === QxFormUtils.multiSelectType)
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

QxFormUtils.encodeForm = function(vForm)
{
  var vFields = QxFormUtils.getFields(vForm);
  var vAll = [];

  for (var i=0, l=vFields.length; i<l; i++) {
    vAll.push(QxFormUtils.encodeField(vFields[i]));
  };

  return vAll.join(qx.Const.CORE_AMPERSAND);
};

QxFormUtils.bind = function(vForm, vMethod)
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
