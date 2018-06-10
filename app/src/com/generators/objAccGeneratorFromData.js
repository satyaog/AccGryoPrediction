"use strict";

define(function (require)
{
  var ThreeDoFGeneratorFromData = require("com/generators/threeDoFGeneratorFromData");

  var data = require("text!/../resources/data/objectAcc2.json");

  var ObjAccGeneratorFromData = function ()
  {
    ThreeDoFGeneratorFromData.call(this);

    ThreeDoFGeneratorFromData.prototype.loadData.call(this, data);
  };

  ObjAccGeneratorFromData.prototype = Object.create(ThreeDoFGeneratorFromData.prototype);

  return ObjAccGeneratorFromData;
});
