"use strict";

define(function (require)
{
  var ThreeDoFGenerator = require("com/generators/threeDoFGenerator");

  var AngularSpeed1Generator = function ()
  {
    ThreeDoFGenerator.call(this);
  };

  AngularSpeed1Generator.prototype = Object.create(ThreeDoFGenerator.prototype);

  AngularSpeed1Generator.prototype._computeNext = function (frame)
  {
    var mod = (Math.random() - 0.4) * Math.PI / 32.;
    this._transformation = new THREE.Vector3(0.
                                             , mod * Math.sin(frame * this._updateFrequency)
                                             , mod * Math.cos(frame * this._updateFrequency));
  };

  return AngularSpeed1Generator;
});
