/*!
  A application like menubar. 
  
  Simply add some instances of QxMenuBarButton to fill.
*/
function QxMenuBar()
{
  QxWidget.call(this);
};

QxMenuBar.extend(QxWidget, "QxMenuBar");



/*
------------------------------------------------------------------------------------
  PROPERTIES
------------------------------------------------------------------------------------
*/

QxMenuBar.addProperty({ name : "menu", type : Object });




/*
------------------------------------------------------------------------------------
  MODIFIER
------------------------------------------------------------------------------------
*/

proto._modifyMenu = function(propValue, propOldValue, propName, uniqModIds)
{
  if (propOldValue)
  {
    propOldValue.getOpener().setState("normal", uniqModIds);
    propOldValue.setVisible(false, uniqModIds);
  };

  if (propValue)
  {
    var vOpener = propValue.getOpener();
    
    propValue.setLeft(vOpener.getComputedPageBoxLeft(), uniqModIds);
    propValue.setTop(vOpener.getComputedPageBoxBottom(), uniqModIds);
    propValue.setVisible(true, uniqModIds);
  };

  return true;
};