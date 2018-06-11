"use strict";

requirejs(["config"], function ()
{
  requirejs(["com/generators/acceleration1Generator", "com/generators/acceleration2Generator", "com/generators/angularSpeed1Generator"
             , "com/generators/angularSpeed2Generator", "com/generators/camAccGeneratorFromData", "com/generators/camCompassGeneratorFromData"
             , "com/generators/camGyroGeneratorFromData", "com/generators/compassGenerator", "com/generators/objAccGeneratorFromData"
             , "com/generators/objCompassGeneratorFromData", "com/generators/objGyroGeneratorFromData", "com/system9DoF"
             , "com/system9DoFPrediction", "com/system9DoFPredictionKalman"
             , "three", "orbitcontrols"]
            , function ()
    {
      var Acceleration1Generator = require("com/generators/acceleration1Generator");
      var Acceleration2Generator = require("com/generators/acceleration2Generator");
      var AngularSpeed1Generator = require("com/generators/angularSpeed1Generator");

      var AngularSpeed2Generator = require("com/generators/angularSpeed2Generator");
      var CamAccGeneratorFromData = require("com/generators/camAccGeneratorFromData");
      var CamCompassGeneratorFromData = require("com/generators/camCompassGeneratorFromData");

      var CamGyroGeneratorFromData = require("com/generators/camGyroGeneratorFromData");
      var CompassGenerator = require("com/generators/compassGenerator");
      var ObjAccGeneratorFromData = require("com/generators/objAccGeneratorFromData");

      var ObjCompassGeneratorFromData = require("com/generators/objCompassGeneratorFromData");
      var ObjGyroGeneratorFromData = require("com/generators/objGyroGeneratorFromData");
      var System9DoF = require("com/system9DoF");

      var System9DoFPrediction = require("com/system9DoFPrediction");
      var System9DoFPredictionKalman = require("com/system9DoFPredictionKalman");

      var SystemVisualRepresentation = function ()
      {
        this.visualRepresentation = null;
      };

      SystemVisualRepresentation.prototype.update = function (system, parentSystem)
      {
        // Apply transformation matrix T*R to visual representation

        this.visualRepresentation.position.copy(system.position);

        if (parentSystem === null)
        {
          this.visualRepresentation.setRotationFromMatrix(system.orientationMatrix);
        }
        else
        {
          // We currently have T_p*R_p * T*R as the active transformation matrix for the object. We don't want the transformation
          // matrix of the object to be affected by the space of the camera so we need to inverse the space change.

          // Compute (T_p*R_p)^-1 * T*R = R_p^T*-T_p * T*R

          this.visualRepresentation.position.add(parentSystem.translation.clone().multiplyScalar(-1.))
                                                 .applyMatrix4(parentSystem.orientationMatrix.clone().transpose());

          this.visualRepresentation.setRotationFromMatrix(parentSystem.orientationMatrix.clone().transpose().multiply(system.orientationMatrix));
        }
      };

      function onWindowResize()
      {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      }

      function createXAxis(length, opacity)
      {
        var geometry = new THREE.CylinderBufferGeometry(length/50., length*2./50., length, 5);
        var material = new THREE.MeshBasicMaterial({color: 0xff0000, transparent: opacity < 0.9999, opacity: opacity});
        var axis = new THREE.Mesh(geometry, material);

        axis.position.x += length/2.;

        axis.rotateZ(-Math.PI / 2.);

        return axis;
      }

      function createYAxis(length, opacity)
      {
        var geometry = new THREE.CylinderBufferGeometry(length/50., length*2./50., length, 5);
        var material = new THREE.MeshBasicMaterial({color: 0x00ff00, transparent: opacity < 0.9999, opacity: opacity});
        var axis = new THREE.Mesh(geometry, material);

        axis.position.y += length/2.;

        return axis;
      }

      function createZAxis(length, opacity)
      {
        var geometry = new THREE.CylinderBufferGeometry(length/50., length*2./50., length, 5);
        var material = new THREE.MeshBasicMaterial({color: 0x0000ff, transparent: opacity < 0.9999, opacity: opacity});
        var axis = new THREE.Mesh(geometry, material);

        axis.rotateX(Math.PI / 2.0);

        axis.position.z += length/2.;

        return axis;
      }

      function createCameraGroupAxes(opacity)
      {
        var cameraAxes = new THREE.Object3D();
        cameraAxes.add(createXAxis(25, opacity));
        cameraAxes.add(createYAxis(25, opacity));
        cameraAxes.add(createZAxis(25, opacity));

        var objectAxes = new THREE.Object3D();
        objectAxes.add(createXAxis(10, opacity));
        objectAxes.add(createYAxis(10, opacity));
        objectAxes.add(createZAxis(10, opacity));

        return {cameraAxes: cameraAxes, objectAxes: objectAxes};
      }

      function init()
      {
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0xcccccc);
        // scene.fog = new THREE.FogExp2(0xcccccc, 0.002);

        renderer = new THREE.WebGLRenderer({antialias: true} );
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);

        camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
        camera.position.set(400, 200, 0);

        // controls
        controls = new THREE.OrbitControls(camera, renderer.domElement);

        //controls.addEventListener("change", render); // call this only in static scenes (i.e., if there is no animation loop)
        controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
        controls.dampingFactor = 0.25;
        controls.screenSpacePanning = false;
        controls.minDistance = 100;
        controls.maxDistance = 1000;
        controls.maxPolarAngle = Math.PI / 2;

        // world
        // var geometry = new THREE.CylinderBufferGeometry(0, 10, 30, 4, 1);
        // var material = new THREE.MeshPhongMaterial({color: 0xffffff, flatShading: true} );
        //
        // for (var i = 0; i < 500; i ++)
        // {
        //   var mesh = new THREE.Mesh(geometry, material);
        //   mesh.position.x = Math.random() * 1600 - 800;
        //   mesh.position.y = 0;
        //   mesh.position.z = Math.random() * 1600 - 800;
        //   mesh.updateMatrix();
        //   mesh.matrixAutoUpdate = false;
        //   scene.add(mesh);
        // }

        var worldAxes = new THREE.Object3D();
        worldAxes.add(createXAxis(50, 0.1));
        worldAxes.add(createYAxis(50, 0.1));
        worldAxes.add(createZAxis(50, 0.1));

        scene.add(worldAxes);
        // scene.add(cameraGroup);

        var cameraGroup = new THREE.Object3D();
        var cameraGroupAxes = createCameraGroupAxes(1.);
        cameraGroup.add(cameraGroupAxes.cameraAxes);
        cameraGroup.add(cameraGroupAxes.objectAxes);

        var cameraGroupPred = new THREE.Object3D();
        var cameraGroupAxesPred = createCameraGroupAxes(0.35);
        cameraGroupPred.add(cameraGroupAxesPred.cameraAxes);
        cameraGroupPred.add(cameraGroupAxesPred.objectAxes);

        scene.add(cameraGroup);
        scene.add(cameraGroupPred);

        // // lights
        // var light = new THREE.DirectionalLight(0xffffff);
        // light.position.set(1, 1, 1);
        // scene.add(light);
        // var light = new THREE.DirectionalLight(0x002288);
        // light.position.set( - 1, - 1, - 1);
        // scene.add(light);
        // var light = new THREE.AmbientLight(0x222222);
        // scene.add(light);
        //
        window.addEventListener("resize", onWindowResize, false);

        cameraSystem = new System9DoF();
        cameraSystem.position = new THREE.Vector3(0., 0., 100.);
        cameraSystem.compassGenerator = new CamCompassGeneratorFromData();//new Acceleration1Generator()//new CamAccGeneratorFromData()
        cameraSystem.accelerationGenerator = new CamAccGeneratorFromData();//new Acceleration1Generator()//new CamAccGeneratorFromData()
        cameraSystem.gyroscopeGenerator = new CamGyroGeneratorFromData();//new AngularSpeed1Generator()//new CamGyroGeneratorFromData()

        objectSystem = new System9DoF();
        objectSystem.compassGenerator = new ObjCompassGeneratorFromData();//new Acceleration1Generator()//new CamAccGeneratorFromData()
        objectSystem.accelerationGenerator = new ObjAccGeneratorFromData();//new Acceleration2Generator()//new ObjAccGeneratorFromData()
        objectSystem.gyroscopeGenerator = new ObjGyroGeneratorFromData();//new AngularSpeed2Generator()//new ObjGyroGeneratorFromData()

        cameraSystemVisualRep = new SystemVisualRepresentation();
        cameraSystemVisualRep.visualRepresentation = cameraGroup;

        objectSystemVisualRep = new SystemVisualRepresentation();
        objectSystemVisualRep.visualRepresentation = cameraGroupAxes.objectAxes;

        // cameraSysPred = new System9DoFPrediction();
        cameraSysPred = new System9DoFPredictionKalman();

        cameraSysPredVisualRep = new SystemVisualRepresentation();
        cameraSysPredVisualRep.visualRepresentation = cameraGroupPred;

        // objectSysPred = new System9DoFPrediction();
        objectSysPred = new System9DoFPredictionKalman();

        objectSysPredVisualRep = new SystemVisualRepresentation();
        objectSysPredVisualRep.visualRepresentation = cameraGroupAxesPred.objectAxes;
      }

      var animationTime = 0.;

      function update(delta, now)
      {
        animationTime += delta;

        // Compute transformation matrix T_c*R_c
        cameraSystem.updateTransformationMatrix(delta, animationTime);
        cameraSystem.updatePosition();
        cameraSystemVisualRep.update(cameraSystem, null);

        // Compute transformation matrix T_o*R_o
        objectSystem.updateTransformationMatrix(delta, animationTime);
        objectSystem.updatePosition();
        objectSystemVisualRep.update(objectSystem, cameraSystem);

        cameraSysPred.updateModel(cameraSystem);
        objectSysPred.updateModel(objectSystem);

        if (cameraSysPred.needUpdate(animationTime))
        {
          // console.log("time:", animationTime, ", x:", cameraSystem.position.x, ", y:", cameraSystem.position.y, ", z:", cameraSystem.position.z);
          // console.log("prediction time:", cameraSysPred.predictionTime, ", x:", cameraSysPred.position.x, ", y:", cameraSysPred.position.y, ", z:", cameraSysPred.position.z);
          // console.log("difference: x:", cameraSystem.position.x - cameraSysPred.position.x, ", y:", cameraSystem.position.y - cameraSysPred.position.y, ", z:", cameraSystem.position.z - cameraSysPred.position.z);

          cameraSysPred.resetToReference(cameraSystem);
          cameraSysPred.updateTransformationMatrix(delta, animationTime);
          cameraSysPred.updatePosition();
          cameraSysPredVisualRep.update(cameraSysPred, null);
        }

        if (objectSysPred.needUpdate(animationTime))
        {
          objectSysPred.resetToReference(objectSystem);
          objectSysPred.updateTransformationMatrix(delta, animationTime);
          objectSysPred.updatePosition();
          objectSysPredVisualRep.update(objectSysPred, cameraSysPred);
        }
      }

      function render()
      {
        renderer.render(scene, camera);
      }

      var lastTimeMsec = 0;

      function firstAnimation(nowMsec)
      {
        function rotateSystemToCompass(system, compassVector)
        {
          var frontVector = new THREE.Vector3(1., 0., 0.);
          var angle = compassVector.angleTo(frontVector);

          var rotationVector = new THREE.Vector3().crossVectors(compassVector, frontVector);

          system.orientationMatrix.makeRotationAxis(rotationVector, angle);
        }

        requestAnimationFrame(animate);

        var delta = 0.1;
        var now = nowMsec / 1000.;
        lastTimeMsec = nowMsec;

        controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true

        animationTime += delta;

        var cameraCompassVector = cameraSystem.readCompass(animationTime);
        var objectCompassVector = objectSystem.readCompass(animationTime);

        rotateSystemToCompass(cameraSystem, cameraCompassVector);
        rotateSystemToCompass(objectSystem, objectCompassVector);

        objectSystem.position = new THREE.Vector3(100., 0., 0.);

        // Compute transformation matrix T_c*R_c
        cameraSystem.updateTransformationMatrix(delta, animationTime);
        cameraSystem.updatePosition();
        cameraSystemVisualRep.update(cameraSystem, null);

        // Compute transformation matrix T_o*R_o
        objectSystem.updateTransformationMatrix(delta, animationTime);
        objectSystem.updatePosition();
        objectSystemVisualRep.update(objectSystem, cameraSystem);

        render();

        cameraSysPred.initializeModel(cameraSystem);
        objectSysPred.initializeModel(objectSystem);
      }

      function animate(nowMsec)
      {
        requestAnimationFrame(animate);

        var delta = (nowMsec - lastTimeMsec) / 1000.;
        var now = nowMsec / 1000.;
        lastTimeMsec = nowMsec;

        controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true
        update(delta, now);
        render();
      }

      var camera, controls, scene, renderer;

      // var cameraGroup, cameraAxes, objectAxes;

      var cameraSystem;
      var objectSystem;
      var cameraSystemVisualRep;
      var objectSystemVisualRep;

      var cameraSysPred;
      var cameraSysPredVisualRep;
      var objectSysPred;
      var objectSysPredVisualRep;

      init();

      requestAnimationFrame(firstAnimation);
    });
});
