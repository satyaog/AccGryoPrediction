"use strict";

define(function (require)
{
  require("three");

  var System9DoF = function ()
  {
    this.position = new THREE.Vector3();
    this.translation = new THREE.Vector3();
    this.movementSpeed = new THREE.Vector3();

    this.rotationSpeed = new THREE.Vector3();

    this.orientationMatrix = new THREE.Matrix4();

    this.compassGenerator = null;
    this.accelerationGenerator = null;
    this.gyroscopeGenerator = null;
  };

  System9DoF.prototype.readCompass = function (animationTime)
  {
    return this.compassGenerator.generate(animationTime);
  };

  System9DoF.prototype.readAccelerometer = function (animationTime)
  {
    return this.accelerationGenerator.generate(animationTime);
  };

  System9DoF.prototype.readGyroscope = function (animationTime)
  {
    return this.gyroscopeGenerator.generate(animationTime);
  };

  System9DoF.prototype.updatePosition = function ()
  {
    this.position.add(this.translation);
  };

  System9DoF.prototype.updateTransformationMatrix = function (delta, animationTime)
  {
    // Compute T*R, the transformation matrix of the camera

    // I believe this should be the way to update the gyro data
    // this.rotationSpeed = this.readGyroscope(animationTime);
    this.rotationSpeed.add(this.readGyroscope(animationTime));
    this.movementSpeed.add(this.readAccelerometer(animationTime).clone().multiplyScalar(delta));
    // console.log(animationTime, ", x:", this.movementSpeed.x, ", y:", this.movementSpeed.y, ", z:", this.movementSpeed.z);

    this.orientationMatrix.multiply(new THREE.Matrix4()
                                    .makeRotationFromEuler(new THREE.Euler(this.rotationSpeed.x * delta
                                                                           , this.rotationSpeed.y * delta
                                                                           , this.rotationSpeed.z * delta)));

    this.translation = this.movementSpeed.clone().multiplyScalar(delta).applyMatrix4(this.orientationMatrix);
  };

  return System9DoF;
});
