requirejs.config(
  {
    // baseUrl: "src"
    baseUrl: "build"
    , paths:
      {
        "lib": "../lib"

        , "lib/three_raw": "../lib/bower_components/threejs/build/three.min"

        // , "kalman": "../lib/kalman/kalman"
        // , "sylvester": "../lib/bower_components/sylvester/sylvester"
        , "kalman": "../requireWrappers/kalman"
        , "sylvester": "../requireWrappers/sylvester"
        , "text": "../lib/bower_components/text/text"
        , "three": "../requireWrappers/three"
        , "orbitcontrols": "../lib/bower_components/threejs/examples/js/controls/OrbitControls"

        , "resources": "../resources"
      }
    , shim:
      {
        "kalman": ["sylvester"]
        , "orbitcontrols": ["three"]
        , "sylvester":
          {
            exports: function()
            {
              var global = this.Sylvester;
              delete this.Sylvester;

              return global;
            }
          }
      }
  });
