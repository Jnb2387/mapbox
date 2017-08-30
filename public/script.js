mapboxgl.accessToken =
  "pk.eyJ1Ijoiam5iMjM4NyIsImEiOiJjaW8zb2o2bDkwMWJudmJsempjaHBvc2hrIn0.gxSz_BeDIJlbDrKExBPaEQ";
var map = new mapboxgl.Map({
  container: "map", // container id
  style: "mapbox://styles/jnb2387/cj6ku9dfd7hsi2rnzrfsvj1rp", // stylesheet location
  // style: "../style.json",
  center: [-105.0009, 39.7472], //Denver
  zoom: 12 // starting zoom
});
// Create a popup, but don't add it to the map yet.
var popup = new mapboxgl.Popup({
  closeButton: false
});

map.boxZoom.disable();

//do all this stuff when the map loads
map.on("load", function() {
  var canvas = map.getCanvasContainer();

  // Variable to hold the starting xy coordinates
  // when `mousedown` occured.
  var start;

  // Variable to hold the current xy coordinates
  // when `mousemove` or `mouseup` occurs.
  var current;

  // Variable for the draw box element.
  var box;

  //right now this is just for the highlighting of on block click
  map.addSource("denverblocksfill", {
    type: "vector",
    url: "mapbox://jnb2387.2oeib7rz"
  });
  map.addLayer(
    {
      id: "blocks-highlighted",
      type: "fill",
      source: "denverblocksfill",
      "source-layer": "denverblocksgeojson",
      paint: {
        "fill-outline-color": "white",
        "fill-color": "#6e599f",
        "fill-opacity": 0.75
      },
      filter: ["in", "GEOID10", ""]
    },
    "newplantgeojson"
  ); // Place polygon under these labels.

  //add outline layer on for census click.
  map.addLayer({
    id: "block-outline",
    type: "line",
    source: "denverblocksfill",
    "source-layer": "denverblocksgeojson",
    layout: {
      visibility: "visible"
    },
    paint: {
      "line-color": "yellow",
      "line-width": 4
    },
    filter: ["==", "GEOID10", ""] //set the filter to none right now
  });

  //  ###################################  //Time warner census stuff
  map.addSource("twccensus", {
    type: "vector",
    url: "mapbox://jnb2387.ay4zw8b0"
  });

  map.addLayer(
    {
      id: "twc-highlighted",
      type: "fill",
      source: "twccensus",
      "source-layer": "west_east_censusblocks",
      paint: {
        "fill-outline-color": "white",
        "fill-color": "green",
        "fill-opacity": 0.75
      },
      filter: ["in", "CENSUS_BLK", ""]
    },
    "newplantgeojson"
  ); // Place polygon under these labels.
//###################################################################################
  // Set `true` to dispatch the event before other functions
  // call it. This is necessary for disabling the default map
  // dragging behaviour.
  canvas.addEventListener("mousedown", mouseDown, true);

  // Return the xy coordinates of the mouse position
  function mousePos(e) {
    var rect = canvas.getBoundingClientRect();
    return new mapboxgl.Point(
      e.clientX - rect.left - canvas.clientLeft,
      e.clientY - rect.top - canvas.clientTop
    );
  }

  function mouseDown(e) {
    // Continue the rest of the function if the shiftkey is pressed.
    if (!(e.shiftKey && e.button === 0)) return;

    // Disable default drag zooming when the shift key is held down.
    map.dragPan.disable();

    // Call functions for the following events
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("keydown", onKeyDown);

    // Capture the first xy coordinates
    start = mousePos(e);
  }

  function onMouseMove(e) {
    // Capture the ongoing xy coordinates
    current = mousePos(e);

    // Append the box element if it doesnt exist
    if (!box) {
      box = document.createElement("div");
      box.classList.add("boxdraw");
      canvas.appendChild(box);
    }

    var minX = Math.min(start.x, current.x),
      maxX = Math.max(start.x, current.x),
      minY = Math.min(start.y, current.y),
      maxY = Math.max(start.y, current.y);

    // Adjust width and xy position of the box element ongoing
    var pos = "translate(" + minX + "px," + minY + "px)";
    box.style.transform = pos;
    box.style.WebkitTransform = pos;
    box.style.width = maxX - minX + "px";
    box.style.height = maxY - minY + "px";
  }

  function onMouseUp(e) {
    // Capture xy coordinates
    finish([start, mousePos(e)]);
  }

  function onKeyDown(e) {
    // If the ESC key is pressed
    if (e.keyCode === 27) finish();
  }

  function finish(bbox) {
    // Remove these events now that finish has been called.
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("keydown", onKeyDown);
    document.removeEventListener("mouseup", onMouseUp);

    if (box) {
      box.parentNode.removeChild(box);
      box = null;
    }

    // If bbox exists. use this value as the argument for `queryRenderedFeatures`
    if (bbox) {
      var features = map.queryRenderedFeatures(bbox, {
        layers: ["denverblocks", "west-east-censusblocks"]
      });

      // console.log(features);

      if (features.length >= 1000) {
        return window.alert("Select a smaller number of features");
      }
      var poparray = [];




//$$$$$$$$$$$$$$$$$$$$$$$$#####################Time warner stuff
      var twcarray = [];
      for (var i = 0; i < features.length; i++) {
    //     switch(features[i].layer.id){

    // case 1:
    //     dayName = "Monday";
    //     break;
    // case 2:
    //     dayName = "Teusday";
    //     break;
    // case 3:
        if (features[i].layer.id === "west-east-censusblocks") {
          var feature = features[i].properties.CENSUS_BLK;
          twcarray.push(feature);
          // Run through the selected features and set a filter
          // to match features with unique FIPS codes to activate
          // the `counties-highlighted` layer.
          var filter = features.reduce(
            function(memo, feature) {
              memo.push(feature.properties.CENSUS_BLK);
              return memo;
            },
            ["in", "CENSUS_BLK"]
          );


          $("#legend").html(
            "<b>" +
              filter+
              "</b>  Census Blocks"
          );
          // console.log(features.length, "Feature Selected");
          map.setFilter("twc-highlighted", filter);

            map.on("mousemove", function(e) {
    var features = map.queryRenderedFeatures(e.point, {
      layers: ["twc-highlighted"]
    });
    // Change the cursor style as a UI indicator.
    map.getCanvas().style.cursor = features.length ? "pointer" : "";

    if (!features.length) {
      popup.remove();
      return;
    }

    var feature = features[0];

    popup.setLngLat(e.lngLat).setText(feature.properties.CENSUS_BLK).addTo(map);
  });

        }

        
//#################################  end twc  ################
else{




        var feature = features[i].properties.POPULATION;
        poparray.push(feature);
     
      // Run through the selected features and set a filter
      // to match features with unique FIPS codes to activate
      // the `counties-highlighted` layer.
      var filter = features.reduce(
        function(memo, feature) {
          memo.push(feature.properties.GEOID10);
          return memo;
        },
        ["in", "GEOID10"]
      );
      let sum = poparray.reduce((previous, current) => (current += previous));
      // let avg = sum / poparray.length;
      let roundedavg = Math.round(sum);
      // avg = 28
      // console.log(avg);
      $("#legend").html(
        "<h4><strong>" + roundedavg + "</strong></h4>  People in selected Census Blocks"
      );
      // console.log(features.length, "Feature Selected");
      map.setFilter("blocks-highlighted", filter);
    }

    map.dragPan.enable();
  }

  map.on("mousemove", function(e) {
    var features = map.queryRenderedFeatures(e.point, {
      layers: ["blocks-highlighted"]
    });
    // Change the cursor style as a UI indicator.
    map.getCanvas().style.cursor = features.length ? "pointer" : "";

    if (!features.length) {
      popup.remove();
      return;
    }

    var feature = features[0];

    popup.setLngLat(e.lngLat).setText(feature.properties.PCT_WHITE).addTo(map);
  });
   }

$("#highlightbtn").click(function() {
  console.log('should remove highlight')
 map.setFilter("blocks-highlighted", ["in", ""]);
 map.setFilter("twc-highlighted", ["in", ""]);

});



  }// end of else 
  // // add a popup when the census block is clicked.
  map.on("click", "denverblocksfill", function(e) {
    //when a census block is clicked change the filter from the added layer above to be the same as the clicked area
    map.setFilter("block-outline", [
      "==",
      "GEOID10",
      e.features[0].properties.GEOID10
    ]);
    new mapboxgl.Popup()
      .setLngLat(e.lngLat)
      .setHTML(
        "<strong>Population: </strong>" +
          e.features[0].properties.POPULATION +
          " people" +
          "</br>" +
          "<strong>Percent White: </strong>" +
          e.features[0].properties.PCT_WHITE +
          "</br>" +
          "<strong>Percent Hispanic: </strong>" +
          e.features[0].properties.PCT_HISPAN +
          "</br>" +
          "<strong>Percent Asian: </strong>" +
          e.features[0].properties.PCT_ASIAN
      )
      .addTo(map);
  });
  //adding building 3D layer
  map.addLayer(
    {
      id: "3d-buildings",
      source: "composite",
      "source-layer": "building",
      filter: ["==", "extrude", "true"],
      type: "fill-extrusion",
      minzoom: 15,
      paint: {
        "fill-extrusion-color": "#aaa",
        "fill-extrusion-height": {
          type: "identity",
          property: "height"
        },
        "fill-extrusion-base": {
          type: "identity",
          property: "min_height"
        },
        "fill-extrusion-opacity": 0.6
      }
    },
    "denverblocks" // put the layer after the denverblocks layer
  );

  map.on("click", "west-east-censusblocks", function(e) {
    new mapboxgl.Popup()
      .setLngLat(e.lngLat)
      .setHTML(
        "<strong>Census Block: </strong>" + e.features[0].properties.CENSUS_BLK
      )
      .addTo(map);
  });
}); //end on map load

$("#btn").click(function() {
  var visibility = map.getLayoutProperty(
    "west-east-censusblocks",
    "visibility"
  );

  if (visibility === "visible") {
    map.setLayoutProperty("west-east-censusblocks", "visibility", "none");
    console.log("Not displaying");
  } else {
    console.log("displaying");
    map.setLayoutProperty("west-east-censusblocks", "visibility", "visible");
  }
});



