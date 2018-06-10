"use strict";

define(function (require)
{
  var System9DoF = require("com/system9DoF");

  var System9DoFPrediction = function ()
  {
    System9DoF.call(this);

    this.predictedAcceleration =  new THREE.Vector3();
    this.predictedGyroscope =  new THREE.Vector3();

    this._updateFrequency = 0.2;
    this._lastFrame = 0;
    this._predictionTime = 0;
  };

  System9DoFPrediction.prototype = Object.create(System9DoF.prototype);

  System9DoFPrediction.prototype.readAccelerometer = function (animationTime)
  {
    return this.predictedAcceleration;
  };

  System9DoFPrediction.prototype.readGyroscope = function (animationTime)
  {
    return this.predictedGyroscope;
  };

  System9DoFPrediction.prototype.updateTransformationMatrix = function (delta, animationTime)
  {
    var frame = Math.floor(animationTime / this._updateFrequency);

    this._predictionTime = (frame + 1) * this._updateFrequency;

    System9DoF.prototype.updateTransformationMatrix.call(this, this._updateFrequency, (frame + 1) * this._updateFrequency);

    this._lastFrame = frame;
  };

  System9DoFPrediction.prototype.getPredictionTime = function (animationTime)
  {
    return (frame + 1) * this._updateFrequency;
  };

  System9DoFPrediction.prototype.needUpdate = function (animationTime)
  {
    return Math.floor(animationTime / this._updateFrequency) > this._lastFrame;
  };

  System9DoFPrediction.prototype.resetToReference = function (referenceSystem)
  {
    this.position.copy(referenceSystem.position);
    this.translation.copy(referenceSystem.translation);
    this.movementSpeed.copy(referenceSystem.movementSpeed);

    this.rotationSpeed.copy(referenceSystem.rotationSpeed);

    this.orientationMatrix.copy(referenceSystem.orientationMatrix);
  };

  System9DoFPrediction.prototype.updateModel = function (referenceSystem)
  {
    this.predictedAcceleration = referenceSystem.accelerationGenerator.current;
    this.predictedGyroscope = referenceSystem.gyroscopeGenerator.current;
  };

  System9DoFPrediction.prototype.initializeModel = function (referenceSystem)
  {
    this.predictedAcceleration = referenceSystem.accelerationGenerator.current;
    this.predictedGyroscope = referenceSystem.gyroscopeGenerator.current;
  };

  Object.defineProperty(System9DoFPrediction.prototype, "predictionTime",
    {
      get: function ()
      {
        return this._predictionTime;
      }
    });

  return System9DoFPrediction;
});
