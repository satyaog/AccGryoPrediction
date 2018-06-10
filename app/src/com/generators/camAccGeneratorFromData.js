"use strict";

define(function (require)
{
  var ThreeDoFGeneratorFromData = require("com/generators/threeDoFGeneratorFromData");

  var data = require("text!/../resources/data/cameraAcc2.json");

  var CamAccGeneratorFromData = function ()
  {
    ThreeDoFGeneratorFromData.call(this);

    ThreeDoFGeneratorFromData.prototype.loadData.call(this, data);
  };

  CamAccGeneratorFromData.prototype = Object.create(ThreeDoFGeneratorFromData.prototype);

  return CamAccGeneratorFromData;
});
