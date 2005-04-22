function QxHBox(vBlockAlign, vChildrenAlign) {
  QxBox.call("horizontal", vBlockAlign, vChildrenAlign);
};

QxHBox.extend(QxBox, "QxHBox");

proto._checkOrientation = function(propValue, propOldValue, propName, uniqModIds) 
{
  if (propValue != "horizontal") {
    throw new Error("Orientation is not configurable in QxHBox!");
  };
  
  return propValue;
};