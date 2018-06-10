"use strict";

define(function (require)
{
  var ThreeDoFGeneratorFromData = require("com/generators/threeDoFGeneratorFromData");

  var data = require("text!/../resources/data/cameraGyro2.json");

  var CamGyroGeneratorFromData = function ()
  {
    ThreeDoFGeneratorFromData.call(this);

    ThreeDoFGeneratorFromData.prototype.loadData.call(this, data);
  };

  CamGyroGeneratorFromData.prototype = Object.create(ThreeDoFGeneratorFromData.prototype);

  return CamGyroGeneratorFromData;
});
