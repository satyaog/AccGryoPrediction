"use strict";

define(function (require)
{
  var Kalman = require("kalman");

  var System9DoFPrediction = require("com/system9DoFPrediction");

  function initializeKalman(kalman, initialVector)
  {
    // https://stackoverflow.com/questions/25744984/implement-a-kalman-filter-to-smooth-data-from-deviceorientation-api

    var x_0 = $V(initialVector); //vector. Initial accelerometer values

    //P prior knowledge of state
    var P_0 = $M([
                  [1,0,0],
                  [0,1,0],
                  [0,0,1]
                ]); //identity matrix. Initial covariance. Set to 1
    var F_k = $M([
                  [1,0,0],
                  [0,1,0],
                  [0,0,1]
                ]); //identity matrix. How change to model is applied. Set to 1
    var Q_k = $M([
                  [0,0,0],
                  [0,0,0],
                  [0,0,0]
                ]); //empty matrix. Noise in system is zero

    var z_k = $V(initialVector); //Updated accelerometer values

    var H_k = $M([
                  [1,0,0],
                  [0,1,0],
                  [0,0,1]
                ]); //identity matrix. Describes relationship between model and observation
    var R_k = $M([
                  [1,0,0],
                  [0,1,0],
                  [0,0,1]
                ]); //1x Scalar matrix. Describes noise from sensor. Set to 1 to begin

    kalman.model = new Kalman.Model(x_0, P_0, F_k, Q_k);
    kalman.observation = new Kalman.Observation(z_k, H_k, R_k);
  }

  function computeStandardDeviation(kalman)
  {
    var n = kalman.history.length;
    var n_1 = kalman.history.length - 1;

    if (n === 0)
    {
      return;
    }

    kalman.mean = [0., 0., 0.];
    kalman.variance = [0., 0., 0.];
    kalman.covariance =
      [
        [0., 0., 0.]
        , [0., 0., 0.]
        , [0., 0., 0.]
      ];
    kalman.stddev2 = [0., 0., 0.];

    // compute mean
    kalman.history.forEach(function(entry)
    {
      kalman.mean[0] += entry.x;
      kalman.mean[1] += entry.y;
      kalman.mean[2] += entry.z;
    });

    kalman.mean[0] /= n;
    kalman.mean[1] /= n;
    kalman.mean[2] /= n;

    // compute variance and covariance
    kalman.history.forEach(function(entry)
    {
      kalman.variance[0] += (entry.x - kalman.mean[0]) * (entry.x - kalman.mean[0]);
      kalman.variance[1] += (entry.y - kalman.mean[1]) * (entry.y - kalman.mean[1]);
      kalman.variance[2] += (entry.z - kalman.mean[2]) * (entry.z - kalman.mean[2]);

      // kalman.covariance[0][1] += (entry.x - kalman.mean[0]) * (entry.y - kalman.mean[1]);
      // kalman.covariance[0][2] += (entry.x - kalman.mean[0]) * (entry.z - kalman.mean[2]);
      // kalman.covariance[1][2] += (entry.y - kalman.mean[1]) * (entry.z - kalman.mean[2]);
    });

    kalman.covariance[0][0] = kalman.stddev2[0] = kalman.variance[0] /= n_1;
    kalman.covariance[1][1] = kalman.stddev2[1] = kalman.variance[1] /= n_1;
    kalman.covariance[2][2] = kalman.stddev2[2] = kalman.variance[2] /= n_1;

    // kalman.covariance[1][0] = kalman.covariance[0][1] /= n_1;
    // kalman.covariance[2][0] = kalman.covariance[0][2] /= n_1;
    // kalman.covariance[2][1] = kalman.covariance[1][2] /= n_1;
  }

  function saveInHistory(kalman, newValue)
  {
    kalman.history.push(newValue);

    if (kalman.history.length > kalman.maxHistory)
    {
      kalman.history.shift();
    }
  }

  var System9DoFPredictionKalman = function ()
  {
    System9DoFPrediction.call(this);

    this._kalmanAcc =
    {
      model: null
      , observation: null
      , history: []
      , maxHistory: 20
      , mean: [0., 0., 0.]
      , variance: [0., 0., 0.]
      , stddev2: [0., 0., 0.]
      , covariance:
        [
          [0., 0., 0.]
          , [0., 0., 0.]
          , [0., 0., 0.]
        ]
    };

    this._kalmanGyro =
    {
      model: null
      , observation: null
      , history: []
      , maxHistory: 20
      , mean: [0., 0., 0.]
      , variance: [0., 0., 0.]
      , stddev2: [0., 0., 0.]
      , covariance:
        [
          [0., 0., 0.]
          , [0., 0., 0.]
          , [0., 0., 0.]
        ]
    };
  };

  System9DoFPredictionKalman.prototype = Object.create(System9DoFPrediction.prototype);

  System9DoFPredictionKalman.prototype.readAccelerometer = function (animationTime)
  {
    var frameCount = Math.floor(animationTime / this._updateFrequency) - this._lastFrame;

    var temporaryModel = new Kalman.Model(this._kalmanAcc.model.x_k, this._kalmanAcc.model.P_k, this._kalmanAcc.model.F_k, this._kalmanAcc.model.Q_k);

    for (var i = frameCount - 1; i >= 0; --i)
    {
      this._kalmanAcc.observation.z_k = $V(temporaryModel.x_k);
      temporaryModel.update(this._kalmanAcc.observation);
    }

    this.predictedAcceleration = new THREE.Vector3(temporaryModel.x_k.elements[0]
                                                   , temporaryModel.x_k.elements[1]
                                                   , temporaryModel.x_k.elements[2]);

    return this.predictedAcceleration;
  };

  System9DoFPredictionKalman.prototype.readGyroscope = function (animationTime)
  {
    var frameCount = Math.floor(animationTime / this._updateFrequency) - this._lastFrame;

    var temporaryModel = new Kalman.Model(this._kalmanGyro.model.x_k, this._kalmanGyro.model.P_k, this._kalmanGyro.model.F_k, this._kalmanGyro.model.Q_k);

    this._kalmanGyro.observation.z_k = $V(this.position.toArray());

    for (var i = frameCount - 1; i >= 0; --i)
    {
      temporaryModel.update(this._kalmanGyro.observation);
      this._kalmanGyro.observation.z_k = $V(temporaryModel.x_k.elements);
    }

    this.predictedGyroscope = new THREE.Vector3(temporaryModel.x_k.elements[0]
                                                , temporaryModel.x_k.elements[1]
                                                , temporaryModel.x_k.elements[2]);

    return this.predictedGyroscope;
  };

  System9DoFPredictionKalman.prototype.resetToReference = function (referenceSystem)
  {
    this.position.copy(referenceSystem.position);
    this.translation.copy(referenceSystem.translation);
    this.movementSpeed.copy(referenceSystem.movementSpeed);

    this.rotationSpeed.copy(referenceSystem.rotationSpeed);

    this.orientationMatrix.copy(referenceSystem.orientationMatrix);

    // this.predictedAcceleration = referenceSystem.accelerationGenerator.current;
    // this.predictedGyroscope = referenceSystem.gyroscopeGenerator.current;
  };

  System9DoFPredictionKalman.prototype.updateModel = function (referenceSystem)
  {
    // https://stackoverflow.com/questions/28105771/using-kalman-filter-with-acceleration-and-position-inputs

    saveInHistory(this._kalmanAcc, referenceSystem.accelerationGenerator.current);
    saveInHistory(this._kalmanGyro, referenceSystem.gyroscopeGenerator.current);

    computeStandardDeviation(this._kalmanAcc);
    computeStandardDeviation(this._kalmanGyro);

    this._kalmanAcc.model.Q_k =
      $M([
          [this._kalmanAcc.stddev2[0],0,0]
          , [0,this._kalmanAcc.stddev2[1],0]
          , [0,0,this._kalmanAcc.stddev2[2]]
        ]);

    this._kalmanGyro.model.Q_k =
      $M([
          [this._kalmanGyro.stddev2[0],0,0]
          , [0,this._kalmanGyro.stddev2[1],0]
          , [0,0,this._kalmanGyro.stddev2[2]]
        ]);

    this._kalmanAcc.observation.R_k =
      $M([
          [Math.sqrt(this._kalmanAcc.stddev2[0]),0,0]
          , [0,Math.sqrt(this._kalmanAcc.stddev2[1]),0]
          , [0,0,Math.sqrt(this._kalmanAcc.stddev2[2])]
        ]);

    this._kalmanGyro.observation.R_k =
      $M([
          [Math.sqrt(this._kalmanGyro.stddev2[0]),0,0]
          , [0,Math.sqrt(this._kalmanGyro.stddev2[1]),0]
          , [0,0,Math.sqrt(this._kalmanGyro.stddev2[2])]
        ]);

    this._kalmanAcc.observation.z_k = $V(referenceSystem.accelerationGenerator.current.toArray());
    this._kalmanAcc.model.update(this._kalmanAcc.observation);

    this._kalmanGyro.observation.z_k = $V(referenceSystem.gyroscopeGenerator.current.toArray());
    this._kalmanGyro.model.update(this._kalmanGyro.observation);
  };

  System9DoFPredictionKalman.prototype.initializeModel = function (referenceSystem)
  {
    initializeKalman(this._kalmanAcc, referenceSystem.accelerationGenerator.current.toArray());
    initializeKalman(this._kalmanGyro, referenceSystem.gyroscopeGenerator.current.toArray());
  };

  return System9DoFPredictionKalman;
});
