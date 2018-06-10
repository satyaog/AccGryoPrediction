"use strict";

define(function (require)
{
  var ThreeDoFGeneratorFromData = require("com/generators/threeDoFGeneratorFromData");

  var data = require("text!/../resources/data/cameraCompass.json");

  var CamCompassGeneratorFromData = function ()
  {
    ThreeDoFGeneratorFromData.call(this);

    ThreeDoFGeneratorFromData.prototype.loadData.call(this, data);
  };

  CamCompassGeneratorFromData.prototype = Object.create(ThreeDoFGeneratorFromData.prototype);

  return CamCompassGeneratorFromData;
});
