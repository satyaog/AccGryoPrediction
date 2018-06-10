"use strict";

define(function (require)
{
  require("three");

  var ThreeDoFGenerator = function ()
  {
    this._updateFrequency = 1./30.;
    this._lastFrame = 0;

    this._transformation = new THREE.Vector3();

    this._captureHistoric = true;
    this._history = [];
  };

  ThreeDoFGenerator.prototype.generate = function (animationTime)
  {
    var frame = Math.floor(animationTime / this._updateFrequency);

    if (frame > this._lastFrame)
    {
      this._computeNext(frame);

      if (this._captureHistoric)
      {
        this._history.push({time: frame * this._updateFrequency, x: this._transformation.x, y: this._transformation.y, z: this._transformation.z});
      }

      this._lastFrame = frame;
    }

    return this._transformation;
  };

  ThreeDoFGenerator.prototype._computeNext = function (frame) { return this._transformation; }

  Object.defineProperty(ThreeDoFGenerator.prototype, "current",
    {
      get: function ()
      {
        return this._transformation;
      }
    });

  return ThreeDoFGenerator;
});
