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

    this._previousEntry = null;
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

    if (this._dataLength > 0 && this._data[0].time === 0)
    {
      this._previousEntry = this._data[0];
      this._transformation = new THREE.Vector3(this._previousEntry.x, this._previousEntry.y, this._previousEntry.z);
    }
    else
    {
      this._previousEntry = null;
      this._transformation = new THREE.Vector3();
    }
  };

  ThreeDoFGeneratorFromData.prototype._computeNext = function (frame)
  {
    var frameTime = frame * this._updateFrequency;
    var entry = null;

    for (this._dataIndex; this._dataIndex < this._dataLength; ++this._dataIndex)
    {
      entry = this._data[this._dataIndex];
      if (entry.time > frameTime)
      {
        this._transformation = new THREE.Vector3(this._previousEntry.x, this._previousEntry.y, this._previousEntry.z);
        break;
      }
      this._previousEntry = entry;
    }
  };

  return ThreeDoFGeneratorFromData;
});
