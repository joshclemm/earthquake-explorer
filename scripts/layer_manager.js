/**
 * Constructs a layer manager for a specified {@link WorldWindow}.
 * @alias LayerManager
 * @constructor
 * @classdesc Provides a layer manager to interactively control layer visibility for a WorldWindow.
 * @param {WorldWindow} worldWindow The WorldWindow to associated this layer manager with.
 */
var LayerManager = function (worldWindow) {
  var thisExplorer = this;

  this.wwd = worldWindow;

  this.roundGlobe = this.wwd.globe;

  this.createProjectionList();

  // $('#projectionDropdown').on('hide.bs.dropdown', ({ clickEvent }) => {
  //   if (clickEvent?.target) {
  //     console.log($(clickEvent.target))
  //   }
  // })

  $("#projectionDropdown").find(" li").on("click", function (e) {
    thisExplorer.onProjectionClick(e);
  });

  $("#dateDropdown").find(" li").on("click", function (e) {
    thisExplorer.onQuakesDate(e);
  });

  $("#magDropdown").find(" li").on("click", function (e) {
    thisExplorer.onQuakesMag(e);
  });

  this.synchronizeLayerList();

  $("#searchBox").find("button").on("click", function (e) {
    thisExplorer.onSearchButton(e);
  });

  this.geocoder = new WorldWind.NominatimGeocoder();
  this.goToAnimator = new WorldWind.GoToAnimator(this.wwd);
  $("#searchText").on("keypress", function (e) {
    thisExplorer.onSearchTextKeyPress($(this), e);
  });

  //
  //this.wwd.redrawCallbacks.push(function (worldWindow, stage) {
  //    if (stage == WorldWind.AFTER_REDRAW) {
  //        thisExplorer.updateVisibilityState(worldWindow);
  //    }
  //});
};

LayerManager.prototype.onQuakesDate = function (event) {
  var selectedDate = event.target.innerText || event.target.innerHTML;
  $("#dateDropdown").find("button").html(selectedDate + ' <span class="caret"></span>');
  var selectedMag = $("#magDropdown").find("button").text().trim();
  this.onQuakesFilter(selectedMag, selectedDate);
}

LayerManager.prototype.onQuakesMag = function (event) {
  var selectedMag = event.target.innerText || event.target.innerHTML;
  $("#magDropdown").find("button").html(selectedMag + ' <span class="caret"></span>');
  var selectedDate = $("#dateDropdown").find("button").text().trim();
  this.onQuakesFilter(selectedMag, selectedDate);
}

LayerManager.prototype.onQuakesFilter = function (magFilterName, dateFilterName) {

  var magFilter = 3;
  if (magFilterName == "Magnitude 7+") {
    magFilter = 7;
  }
  else if (magFilterName == "Magnitude 6+") {
    magFilter = 6;
  }
  else if (magFilterName == "Magnitude 5+") {
    magFilter = 5;
  }
  else if (magFilterName == "Magnitude 4.5+") {
    magFilter = 4.5;
  }
  else if (magFilterName == "Magnitude 4+") {
    magFilter = 4;
  }
  else if (magFilterName == "Magnitude 3.5+") {
    magFilter = 3.5;
  }

  var pastDayTime = 0;

  // The data source is fetching past week, so we only need to filter for past day
  if (dateFilterName == "From last day") {
    pastDayTime = new Date(new Date().getTime() - (24 * 60 * 60 * 1000)).getTime();
  }

  for (var i = 0, len = this.wwd.layers.length; i < len; i++) {
    var layer = this.wwd.layers[i];
    if (layer.displayName === "Earthquakes") {
      var quakesShown = 0;
      for (var j = 0, len = layer.renderables.length; j < len; j++) {
        var quake = layer.renderables[j];
        if (quake.userProperties.mag >= magFilter && quake.userProperties.time >= pastDayTime) {
          quakesShown++;
          quake.enabled = true;
        }
        else {
          quake.enabled = false;
        }
      }
      $("#numQuakes").text("Showing " + quakesShown + " earthquakes");
      this.wwd.redraw();
      break;
    }
  }
}

LayerManager.prototype.onProjectionClick = function (event) {

  // const myDropdown = document.getElementById('myDropdown')
  // myDropdown.addEventListener('show.bs.dropdown', event => {
  //   // do something...
  // })

  var projectionName = event.target.innerText || event.target.innerHTML;
  $("#projectionDropdown").find("button").html(projectionName + ' <span class="caret"></span>');


  if (projectionName === "3D Globe") {
    if (!this.roundGlobe) {
      this.roundGlobe = new WorldWind.Globe(new WorldWind.EarthElevationModel());
    }

    if (this.wwd.globe !== this.roundGlobe) {
      this.wwd.globe = this.roundGlobe;
    }
  } else {
    if (!this.flatGlobe) {
      this.flatGlobe = new WorldWind.Globe2D();
    }

    if (projectionName === "Equirectangular") {
      this.flatGlobe.projection = new WorldWind.ProjectionEquirectangular();
    } else if (projectionName === "Mercator") {
      this.flatGlobe.projection = new WorldWind.ProjectionMercator();
    } else if (projectionName === "North Polar") {
      this.flatGlobe.projection = new WorldWind.ProjectionPolarEquidistant("North");
    } else if (projectionName === "South Polar") {
      this.flatGlobe.projection = new WorldWind.ProjectionPolarEquidistant("South");
    } else if (projectionName === "North UPS") {
      this.flatGlobe.projection = new WorldWind.ProjectionUPS("North");
    } else if (projectionName === "South UPS") {
      this.flatGlobe.projection = new WorldWind.ProjectionUPS("South");
    } else if (projectionName === "North Gnomonic") {
      this.flatGlobe.projection = new WorldWind.ProjectionGnomonic("North");
    } else if (projectionName === "South Gnomonic") {
      this.flatGlobe.projection = new WorldWind.ProjectionGnomonic("South");
    }

    if (this.wwd.globe !== this.flatGlobe) {
      this.wwd.globe = this.flatGlobe;
    }
  }

  this.wwd.redraw();
};

LayerManager.prototype.onLayerClick = function (layerName) {

  // console.log(layerName);
  if (layerName == "Blue Marble") {
    layerName = "Blue Marble Image";
  }
  else if (layerName == "Landsat") {
    layerName = "Blue Marble & Landsat";
  }
  else if (layerName == "Star field") {
    layerName = "StarField";
  }

  // Update the layer state for the selected layer.
  for (var i = 0, len = this.wwd.layers.length; i < len; i++) {
    var layer = this.wwd.layers[i];
    if (layer.hide) {
      continue;
    }
    if (layer.displayName === layerName) {
      layer.enabled = !layer.enabled;

      if (layerName == "Earthquakes") {
        $("#numQuakes").toggle();
        if(layer.enabled) {
          $("#dateDropdown button").removeClass("disabled");
          $("#magDropdown button").removeClass("disabled");
        }
        else {
          $("#dateDropdown button").addClass("disabled");
          $("#magDropdown button").addClass("disabled");
        }
      }
      this.wwd.redraw();
      break;
    }
  }
};

LayerManager.prototype.synchronizeLayerList = function () {

  // $('#switchEarthquakes').click(function () {
  //   var $label = $("label[for='switchEarthquakes']");
  //   onLayerClick($label.text());


  //   // if ($(this).prop('checked') == false) {
  //   //   onLayerClick($label.text());
  //   // }
  //   // else {
  //   //   console.log($label.text());
  //   // }
  // });

  var self = this;
  $('.layerList input').each(function (index, data) {
    var id = $(this).attr("id");
    var label = $("label[for='" + id + "']").text();
    $(this).click(function () {
      self.onLayerClick(label);
    });
  });
}

// var layerListItem = $("#layerList");

// layerListItem.find("button").off("click");
// layerListItem.find("button").remove();

// // Synchronize the displayed layer list with the WorldWindow's layer list.
// for (var i = 0, len = this.wwd.layers.length; i < len; i++) {
//   var layer = this.wwd.layers[i];

//   if (layer.hide) {
//     continue;
//   }
//   var layerItem = $('<button class="list-group-item btn btn-block">' + layer.displayName + '</button>');
//   layerListItem.append(layerItem);

//   if (layer.showSpinner && Spinner) {
//     var opts = {
//       scale: 0.9,
//     };
//     var spinner = new Spinner(opts).spin();
//     layerItem.append(spinner.el);
//   }

//   if (layer.enabled) {
//     layerItem.addClass("active");
//   } else {
//     layerItem.removeClass("active");
//   }
// }

// var self = this;
// layerListItem.find("button").on("click", function (e) {
//   self.onLayerClick($(this));
// });

//
//LayerManager.prototype.updateVisibilityState = function (worldWindow) {
//    var layerButtons = $("#layerList").find("button"),
//        layers = worldWindow.layers;
//
//    for (var i = 0; i < layers.length; i++) {
//        var layer = layers[i];
//        for (var j = 0; j < layerButtons.length; j++) {
//            var button = layerButtons[j];
//
//            if (layer.displayName === button.innerText) {
//                if (layer.inCurrentFrame) {
//                    button.innerHTML = "<em>" + layer.displayName + "</em>";
//                } else {
//                    button.innerHTML = layer.displayName;
//                }
//            }
//        }
//    }
//};

LayerManager.prototype.createProjectionList = function () {
  var projectionNames = [
    "3D Globe",
    "Equirectangular",
    "Mercator",
    "North Polar",
    "South Polar",
    "North UPS",
    "South UPS"
  ];
  //  "North Gnomonic",
  // "South Gnomonic"
  var projectionDropdown = $("#projectionDropdown");

  var dropdownButton = $('<button class="btn btn-primary btn-block dropdown-toggle" type="button" data-bs-toggle="dropdown">3D Globe<span class="caret"></span></button>');
  projectionDropdown.append(dropdownButton);

  var ulItem = $('<ul class="dropdown-menu">');
  projectionDropdown.append(ulItem);

  for (var i = 0; i < projectionNames.length; i++) {
    var projectionItem = $('<li><a class="dropdown-item" href="#">' + projectionNames[i] + '</a></li>');
    ulItem.append(projectionItem);
  }

  ulItem = $('</ul>');
  projectionDropdown.append(ulItem);
};

LayerManager.prototype.onSearchButton = function (event) {
  this.performSearch($("#searchText")[0].value)
};

LayerManager.prototype.onSearchTextKeyPress = function (searchInput, event) {
  if (event.keyCode === 13) {
    searchInput.blur();
    this.performSearch($("#searchText")[0].value)
  }
};

LayerManager.prototype.performSearch = function (queryString) {
  if (queryString) {
    var thisLayerManager = this,
      latitude, longitude;

    if (queryString.match(WorldWind.WWUtil.latLonRegex)) {
      var tokens = queryString.split(",");
      latitude = parseFloat(tokens[0]);
      longitude = parseFloat(tokens[1]);
      thisLayerManager.goToAnimator.goTo(new WorldWind.Location(latitude, longitude));
    } else {
      this.geocoder.lookup(queryString, function (geocoder, result) {
        if (result.length > 0) {
          latitude = parseFloat(result[0].lat);
          longitude = parseFloat(result[0].lon);

          WorldWind.Logger.log(
            WorldWind.Logger.LEVEL_INFO, queryString + ": " + latitude + ", " + longitude);

          thisLayerManager.goToAnimator.goTo(new WorldWind.Location(latitude, longitude));
        }
      });
    }
  }
};