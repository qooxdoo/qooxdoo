nitobi = {};
/**
* Allows support for inheritance.
* @param subClass {object} The class that will inherit from the base.
* @param baseClass {object} The class that will be inherited from.
*/
nitobi.extend = function(subClass, baseClass)
{
  // Create a new class that has an empty constructor
  // with the members of the baseClass
  function inheritance() {};
  inheritance.prototype = baseClass.prototype;
  // set prototype to new instance of baseClass
  // _without_ the constructor
  subClass.prototype = new inheritance();
  subClass.prototype.constructor = subClass;
  subClass.baseConstructor = baseClass;
  // enable multiple inheritance
  if (baseClass.base)
  {
    baseClass.prototype.base = baseClass.base;
  }
  subClass.base = baseClass.prototype;
}
