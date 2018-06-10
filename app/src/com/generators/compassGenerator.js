"use strict";

define(function (require)
{
  var ThreeDoFGenerator = require("com/generators/threeDoFGenerator");

  var CompassGenerator = function ()
  {
    ThreeDoFGenerator.call(this);

    this._transformation = new THREE.Vector3(1., 0., 0.); //Euler
  };

  CompassGenerator.prototype = Object.create(ThreeDoFGenerator.prototype);

  return CompassGenerator;
});
