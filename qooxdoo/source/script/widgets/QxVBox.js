function QxVBox(vBlockAlign, vChildrenAlign) {
  QxBox.call( this, "vertical", vBlockAlign, vChildrenAlign);
};

QxVBox.extend(QxBox, "QxVBox");

proto._checkOrientation = function(propValue, propOldValue, propName, uniqModIds) 
{
  if (propValue != "vertical") {
    throw new Error("Orientation is not configurable in QxVBox!");
  };
  
  return propValue;
};
