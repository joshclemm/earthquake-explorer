class WWGlobe {

    wwd;

    constructor() {
        // Create a WorldWindow for the canvas.
        var wwd = new WorldWind.WorldWindow("canvasOne");

        wwd.pixelScale = window.devicePixelRatio || 1;
        // wwd.globe = new WorldWind.Globe2D();
        // wwd.globe = new WorldWind.Globe(new WorldWind.EarthElevationModel(), new WorldWind.ProjectionMercator());

        wwd.addLayer(new WorldWind.BMNGOneImageLayer());
        wwd.addLayer(new WorldWind.BMNGLandsatLayer());

        var atmosphere = new WorldWind.AtmosphereLayer();
        atmosphere.enabled = false;
        wwd.addLayer(atmosphere);

        wwd.addLayer(new WorldWind.StarFieldLayer());

        // wwd.addLayer(new WorldWind.CompassLayer());
        // wwd.addLayer(new WorldWind.CoordinatesDisplayLayer(wwd));
        // wwd.addLayer(new WorldWind.ViewControlsLayer(wwd))

        this.wwd = wwd;
    }

    addVolcanoes(enabled = true) {
        // =====    Volcanoes    ======= //

        var addVolcano = function (layer, lat, lon, elevation, label) {

            var canvas = document.createElement("canvas"),
                ctx = canvas.getContext("2d"),
                size = 48;
            canvas.width = size;
            canvas.height = size;

            // let's draw an orange-looking triangle to represent a volcano
            ctx.strokeStyle = "#FF7700FF";
            ctx.fillStyle = "#FF770077";
            ctx.lineWidth = 3;

            ctx.beginPath();
            ctx.moveTo(24, 6);
            ctx.lineTo(48, 42);
            ctx.lineTo(0, 42);
            ctx.lineTo(24, 6);
            ctx.stroke();
            ctx.fill();

            var attributes = new WorldWind.PlacemarkAttributes(null);
            attributes.imageSource = new WorldWind.ImageSource(canvas);
            attributes.imageOffset = new WorldWind.Offset(WorldWind.OFFSET_FRACTION, 0.5, WorldWind.OFFSET_FRACTION, 0.5);
            attributes.imageScale = 1;
            attributes.labelAttributes.scale = 0.8;

            attributes.labelAttributes.offset = new WorldWind.Offset(
                WorldWind.OFFSET_FRACTION, 0.5,
                WorldWind.OFFSET_FRACTION, 0.5);

            var position = new WorldWind.Position(lat, lon, elevation);
            var placemark = new WorldWind.Placemark(position, false, attributes);
            placemark.altitudeMode = WorldWind.RELATIVE_TO_GROUND;
            placemark.label = label;
            layer.addRenderable(placemark);
        }

        var volcanoesLayer = new WorldWind.RenderableLayer("Volcanoes");
        fetch('scripts/worldwind/world_volcanoes.json')
            .then(response => response.json())
            .then(json => {
                for (var i = 0, len = json.length; i < len; i++) {
                    var volcano = json[i];
                    addVolcano(volcanoesLayer, volcano.lat, volcano.lon, volcano.elevation, volcano.name);
                }
            });
        this.wwd.addLayer(volcanoesLayer);
        volcanoesLayer.enabled = enabled;
    }

    addTectonicBoundaries(enabled = true) {
        function boundariesConfigurationCallback(geometry, properties) {
            var configuration = {};
            configuration.attributes = new WorldWind.ShapeAttributes(null);
            configuration.attributes.drawOutline = true;
            configuration.attributes.outlineWidth = 2.0 * (window.devicePixelRatio || 1);
            configuration.attributes.outlineColor = WorldWind.Color.MAGENTA;
            return configuration;
        };

        var boundariesLayer = new WorldWind.RenderableLayer("Tectonic Boundaries");
        var plateBoundariesJSON = new WorldWind.GeoJSONParser("scripts/worldwind/plate_boundaries.json");
        plateBoundariesJSON.load(null, boundariesConfigurationCallback, boundariesLayer);
        boundariesLayer.enabled = enabled;
        this.wwd.addLayer(boundariesLayer);
    }

    addTectonicPlates(enabled = true) {
        // =====    Tectonic Plates    ======= //

        // Tectonic plates metadata. Specifically where on the globe to show the name / label of the plate, the scale of that text, and what to color the plate
        // The actual plate coordinates / polygon are loaded from a geojson file
        var majorPlates = [
            {
                "name": "Africa",
                "color": "DAC1B399",
                "latitude": 0.1035,
                "longitude": 0.7693,
                "scale": 1
            },
            {
                "name": "Antarctica",
                "color": "8ACC3E99",
                "latitude": -70.1035,
                "longitude": -100.7693,
                "scale": 1
            },
            {
                "name": "Somalia",
                "color": "D0377599",
                "latitude": -16.25,
                "longitude": 50.6959,
                "scale": 1
            },
            {
                "name": "India",
                "color": "58C44399",
                "latitude": 14.245,
                "longitude": 77.2929,
                "scale": 1
            },
            {
                "name": "Australia",
                "color": "DCE66599",
                "latitude": -35.6743,
                "longitude": 119.7996,
                "scale": 1
            },
            {
                "name": "Eurasia",
                "color": "EDCB4499",
                "latitude": 49.6743,
                "longitude": 55.7996,
                "scale": 1
            },
            {
                "name": "North America",
                "color": "5A63CA99",
                "latitude": 37.6743,
                "longitude": -73.7996,
                "scale": 1
            },
            {
                "name": "Pacific",
                "color": "D84C7799",
                "latitude": 18.6743,
                "longitude": -154.7996,
                "scale": 1
            },
            {
                "name": "Nazca",
                "color": "1ED08699",
                "latitude": -17.6743,
                "longitude": -93.7996,
                "scale": 1
            },
            {
                "name": "Caribbean",
                "color": "99F58399",
                "latitude": 14.8743,
                "longitude": -77.7996,
                "scale": 1
            },
            {
                "name": "Cocos",
                "color": "E65A1299",
                "latitude": 7.2743,
                "longitude": -95.7996,
                "scale": 1
            },
            {
                "name": "Arabia",
                "color": "70A50199",
                "latitude": 21.8743,
                "longitude": 46.7996,
                "scale": 1
            },
            {
                "name": "South America",
                "color": "8EBB4E99",
                "latitude": -6.25,
                "longitude": -50.6959,
                "scale": 1
            },
            {
                "name": "Philippine Sea",
                "color": "D8D4D599",
                "latitude": 18.2743,
                "longitude": 133.2
            },
            {
                "name": "Scotia",
                "color": "38D45B99",
                "latitude": -60.2743,
                "longitude": -51.2
            },
            {
                "name": "Juan de Fuca",
                "color": "38D45B99",
                "latitude": 46.2743,
                "longitude": -128.2
            },
            {
                "name": "Sunda",
                "latitude": 5.2743,
                "longitude": 112.2
            },
            {
                "name": "Timor",
                "latitude": -9.8,
                "longitude": 125.8
            },
            {
                "name": "Kermadec",
                "latitude": -36,
                "longitude": 178.8
            },
            {
                "name": "Tonga",
                "latitude": -20.5,
                "longitude": -174.8
            },
            {
                "name": "Amur",
                "latitude": 46.5,
                "longitude": 126.8
            },
            {
                "name": "Yangtze",
                "latitude": 26.5,
                "longitude": 116.8
            },
            {
                "name": "Okhotsk",
                "latitude": 51.5,
                "longitude": 150.8
            },
            {
                "name": "Caroline",
                "latitude": 2.5,
                "longitude": 140.8
            }
        ];

        function getRandomColor() {
            var letters = '0123456789ABCDEF';
            var color = '';
            for (var i = 0; i < 6; i++) {
                color += letters[Math.floor(Math.random() * 16)];
            }
            color += '99';
            return color;
        }

        function tectonicConfigurationCallback(geometry, properties) {
            var configuration = {};
            configuration.attributes = new WorldWind.ShapeAttributes(null);
            configuration.attributes.drawOutline = true;
            configuration.attributes.outlineWidth = 2.0 * (window.devicePixelRatio || 1);

            var index = majorPlates.findIndex(plate => plate.name == properties.PlateName);
            if (index >= 0 && majorPlates[index].color) {
                configuration.attributes.interiorColor = WorldWind.Color.colorFromHex(majorPlates[index].color);
            }
            else {
                configuration.attributes.interiorColor = WorldWind.Color.colorFromHex(getRandomColor());
            }
            configuration.attributes.outlineColor = new WorldWind.Color(
                0.5 * configuration.attributes.interiorColor.red,
                0.5 * configuration.attributes.interiorColor.green,
                0.5 * configuration.attributes.interiorColor.blue,
                1.0);
            return configuration;
        };

        var platesLayer = new WorldWind.RenderableLayer("Tectonic Plates");
        var platePolygonsJSON = new WorldWind.GeoJSONParser("scripts/worldwind/plate_polygons.json");
        platePolygonsJSON.load(null, tectonicConfigurationCallback, platesLayer);

        for (var i = 0, len = majorPlates.length; i < len; i++) {
            var plate = majorPlates[i],
                position = new WorldWind.Position(plate.latitude, plate.longitude, 100);
            var text = new WorldWind.GeographicText(position, plate.name);

            text.attributes.color = WorldWind.Color.colorFromHex("9aeeffff");
            text.attributes.scale = (plate.scale ? plate.scale : 0.7);
            platesLayer.addRenderable(text);
        }
        this.wwd.addLayer(platesLayer);
    }

    addRingOfFire(enabled = true) {
        // =====    Ring of Fire    ======= //
        function fireConfigurationCallback(geometry, properties) {
            var configuration = {};
            configuration.attributes = new WorldWind.ShapeAttributes(null);
            configuration.attributes.drawOutline = true;
            configuration.attributes.outlineWidth = 2.0 * (window.devicePixelRatio || 1);

            configuration.attributes.interiorColor = WorldWind.Color.colorFromHex("DC354599");
            configuration.attributes.outlineColor = new WorldWind.Color(
                0.5 * configuration.attributes.interiorColor.red,
                0.5 * configuration.attributes.interiorColor.green,
                0.5 * configuration.attributes.interiorColor.blue,
                1.0);
            return configuration;
        };

        var fireLayer = new WorldWind.RenderableLayer("Ring of Fire");
        var plateBoundariesJSON = new WorldWind.GeoJSONParser("scripts/worldwind/ring_of_fire.json");
        plateBoundariesJSON.load(null, fireConfigurationCallback, fireLayer);
        this.wwd.addLayer(fireLayer);
        fireLayer.enabled = enabled;
    }

    addQuakesLayer(minMag = 4.5) {
        var quakesShown = 0;
        var addQuake = function (placemarkLayer, lat, lon, label, mag, time) {

            if (mag < 3) {
                // don't create renderable for any quake less than a 3.0. There's just too many of those. Save some CPU cycles!
                return;
            }

            var canvas = document.createElement("canvas"),
                ctx = canvas.getContext("2d"),
                size = 84, c = size / 2 - 0.5;
            canvas.width = size;
            canvas.height = size;

            var innerDot = 5;
            var magInt = parseInt(mag);
            var outerRadius = magInt * 5;

            if (mag >= 6) {
                ctx.strokeStyle = "#FF0000";
                ctx.fillStyle = "#FF0000";
            }
            else {
                ctx.strokeStyle = "#00FF00";
                ctx.fillStyle = "#00FF00";
            }

            ctx.lineWidth = 1.5;

            //center dot
            ctx.beginPath();
            ctx.arc(c, c, innerDot, 0, 2 * Math.PI, false);
            ctx.fill();

            for (let index = 0; index < magInt; index++) {
                ctx.beginPath();
                ctx.arc(c, c, outerRadius - (index * 5), 0, 2 * Math.PI, false);
                ctx.stroke();
            }

            var attributes = new WorldWind.PlacemarkAttributes(null);
            // Wrap the canvas created above in an ImageSource object to specify it as the placemarkAttributes image source.
            attributes.imageSource = new WorldWind.ImageSource(canvas);
            // Define the pivot point for the placemark at the center of its image source.
            attributes.imageOffset = new WorldWind.Offset(WorldWind.OFFSET_FRACTION, 0.5, WorldWind.OFFSET_FRACTION, 0.5);
            // attributes.imageScale = 1.0 * (window.devicePixelRatio || 1);
            attributes.imageScale = 1.5;

            // attributes.labelAttributes.font.family = "Rubik";
            // attributes.labelAttributes.font.size = 12;
            attributes.labelAttributes.scale = 0.9;

            attributes.labelAttributes.offset = new WorldWind.Offset(
                WorldWind.OFFSET_FRACTION, 0.5,
                WorldWind.OFFSET_FRACTION, 0.8 + (magInt / 3.5));

            var position = new WorldWind.Position(lat, lon, 4e2);
            var placemark = new WorldWind.Placemark(position, false, attributes);
            // Draw placemark at altitude defined above, relative to the terrain.
            placemark.altitudeMode = WorldWind.RELATIVE_TO_GROUND;

            placemark.label = label.replace(/- [[0-9]+ km [NSEW]+ of/g, "near");
            // placemark.label = label.replace(/[NSWE]+ of/g, "from");
            if (magInt > 6) {
                placemark.alwaysOnTop = true;
            }

            placemark.userProperties = {
                "mag": mag,
                "time": time
            };

            // default to just showing anything over 5 (but smaller ones are still there)
            placemark.enabled = mag >= 5;
            if (placemark.enabled) {
                quakesShown++;
            }

            placemarkLayer.addRenderable(placemark);
        }

        var placemarkLayer = new WorldWind.RenderableLayer("Earthquakes");
        this.wwd.addLayer(placemarkLayer);

        var earthquakeFeed;
        if (minMag == 2.5) {
            earthquakeFeed = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson";
        }
        else {
            earthquakeFeed = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson";
        }

        // https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson
        // https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_day.geojson
        // https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_month.geojson
        $.ajax({
            url: earthquakeFeed, success: function (result) {
                var features = [];
                features = result.features;

                var mostSigQuake = {};
                mostSigQuake.title = "";
                mostSigQuake.mag = 0;
                mostSigQuake.lat;
                mostSigQuake.lon;
                mostSigQuake.sig = 0;

                for (let i = 0; i < features.length; i++) {
                    var quake = features[i];
                    if (quake.properties.sig > mostSigQuake.sig) {
                        mostSigQuake.sig = quake.properties.sig;
                        mostSigQuake.title = quake.properties.title;
                        mostSigQuake.mag = quake.properties.mag;
                        mostSigQuake.lat = quake.geometry.coordinates[1];
                        mostSigQuake.lon = quake.geometry.coordinates[0];
                    }
                    addQuake(placemarkLayer, quake.geometry.coordinates[1], quake.geometry.coordinates[0], quake.properties.title, quake.properties.mag, quake.properties.time);
                }
                $("#numQuakes").text("Showing " + quakesShown + " earthquakes");

                // this.wwd.goToAnimator.travelTime = 3000;
                // this.wwd.goTo(new WorldWind.Position(wwd.navigator.lookAtLocation.latitude, wwd.navigator.lookAtLocation.longitude + 10, 10000000));

                // Simulate a cool looking, slow moving globe spinning.
                // wwd.goToAnimator.travelTime = 10000;
                // wwd.goTo(new WorldWind.Location(15, 0));
                // var startLon = wwd.navigator.lookAtLocation.longitude;
                // wwd.navigator.lookAtLocation.latitude = 15;
                // wwd.goTo(new WorldWind.Location(15, 0), function() {
                //     wwd.goTo(new WorldWind.Location(15, 90), function() {
                //         wwd.goTo(new WorldWind.Location(15, 180), function() {
                //             wwd.goTo(new WorldWind.Location(15, startLon));
                //         });
                //     })
                // });

            }
        });
    }
}