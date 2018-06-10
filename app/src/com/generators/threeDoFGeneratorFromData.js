"use strict";

define(function (require)
{
  var ThreeDoFGenerator = require("com/generators/threeDoFGenerator");

  var ThreeDoFGeneratorFromData = function ()
  {
    ThreeDoFGenerator.call(this);

    this._captureHistoric = false;

    this._data = [];
    this._dataLength = 0;
    this._dataIndex = 0;
  };

  ThreeDoFGeneratorFromData.prototype = Object.create(ThreeDoFGenerator.prototype);

  ThreeDoFGeneratorFromData.prototype.loadData = function (data)
  {
    JSON.parse(data).forEach(function (entry)
      {
        this._data.push(entry);
      }, this);

    this._dataLength = this._data.length;
    this._dataIndex = 0;
  };

  ThreeDoFGeneratorFromData.prototype._computeNext = function (frame)
  {
    var frameTime = frame * this._updateFrequency;
    var entry = null;
    var previousEntry = {x: 0., y: 0, z: 0};

    for (this._dataIndex; this._dataIndex < this._dataLength; ++this._dataIndex)
    {
      entry = this._data[this._dataIndex];
      if (entry.time >= frameTime)
      {
        this._transformation = new THREE.Vector3(previousEntry.x, previousEntry.y, previousEntry.z);
        break;
      }
      previousEntry = entry;
    }
  };

  return ThreeDoFGeneratorFromData;
});
