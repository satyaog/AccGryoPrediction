"use strict";

define(function (require)
{
  var ThreeDoFGenerator = require("com/generators/threeDoFGenerator");

  var Acceleration1Generator = function ()
  {
    ThreeDoFGenerator.call(this);
  };

  Acceleration1Generator.prototype = Object.create(ThreeDoFGenerator.prototype);

  Acceleration1Generator.prototype._computeNext = function (frame)
  {
    var mod = (Math.random() - 0.4) * 30.;
    this._transformation = new THREE.Vector3(mod * Math.cos(frame * this._updateFrequency)
                                             , 0.
                                             , mod * Math.sin(frame * this._updateFrequency));
  };

  return Acceleration1Generator;
});
