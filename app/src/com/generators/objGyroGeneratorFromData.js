"use strict";

define(function (require)
{
  var ThreeDoFGeneratorFromData = require("com/generators/threeDoFGeneratorFromData");

  var data = require("text!/../resources/data/objectGyro2.json");

  var ObjGyroGeneratorFromData = function ()
  {
    ThreeDoFGeneratorFromData.call(this);

    ThreeDoFGeneratorFromData.prototype.loadData.call(this, data);
  };

  ObjGyroGeneratorFromData.prototype = Object.create(ThreeDoFGeneratorFromData.prototype);

  return ObjGyroGeneratorFromData;
});
