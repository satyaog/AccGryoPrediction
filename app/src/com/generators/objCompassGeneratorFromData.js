"use strict";

define(function (require)
{
  var ThreeDoFGeneratorFromData = require("com/generators/threeDoFGeneratorFromData");

  var data = require("text!/../resources/data/objectCompass.json");

  var ObjCompassGeneratorFromData = function ()
  {
    ThreeDoFGeneratorFromData.call(this);

    ThreeDoFGeneratorFromData.prototype.loadData.call(this, data);
  };

  ObjCompassGeneratorFromData.prototype = Object.create(ThreeDoFGeneratorFromData.prototype);

  return ObjCompassGeneratorFromData;
});
