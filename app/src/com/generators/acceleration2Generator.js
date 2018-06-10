"use strict";

define(function (require)
{
  var ThreeDoFGenerator = require("com/generators/threeDoFGenerator");

  var Acceleration2Generator = function ()
  {
    ThreeDoFGenerator.call(this);
  };

  Acceleration2Generator.prototype = Object.create(ThreeDoFGenerator.prototype);

  Acceleration2Generator.prototype._computeNext = function (frame)
  {
    var mod = (Math.random() - 0.4) * 50.;
    this._transformation = new THREE.Vector3(mod * Math.cos(frame * this._updateFrequency)
                                             , 0.
                                             , mod * Math.sin(frame * this._updateFrequency));
  };

  return Acceleration2Generator;
});
