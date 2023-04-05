import type { NextPage } from "next";
import Head from "next/head";
import { titleCase } from "title-case";
// import Image from "next/image";
// import { Dialog, Transition } from "@headlessui/react";
// import { Fragment, createRef } from "react";
// import Slider from "rc-slider";
import { computeclosestcoordsfromevent } from "../components/getclosestcoordsfromevent";
import { CloseButton } from "../components/CloseButton";
import { signintrack, uploadMapboxTrack } from "../components/mapboxtrack";
// import TooltipSlider, { handleRender } from "../components/TooltipSlider";
// import { getAuth, signInWithCustomToken } from "firebase/auth";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import MapboxLanguage from "@mapbox/mapbox-gl-language";
import Nav from "../components/nav";
//import { CloseButton } from "@/components/CloseButton";
import { MantineProvider, Checkbox } from "@mantine/core";
import React, { useEffect, useState, useRef } from "react";
// import { initializeApp } from "firebase/app";

// import Icon from "@mdi/react";
// import { mdiPlay } from "@mdi/js";
// import { mdiPause, mdiSkipNext, mdiSkipPrevious } from "@mdi/js";

import CouncilDist from "./CouncilDistricts.json";
// import { auth, signInWithGoogle, signOutOfApp } from "./../components/firebase";
// import { useAuthState } from "react-firebase-hooks/auth";

const councildistricts = require("./CouncilDistricts.json");
const citybounds = require("./citybounds.json");
// @ts-ignore: Unreachable code error
import * as turf from "@turf/turf";
import { datadogRum } from "@datadog/browser-rum";

// added the following 6 lines.
import mapboxgl from "mapbox-gl";

// import { assertDeclareExportAllDeclaration } from "@babel/types";

// import { GeoJsonProperties, MultiPolygon, Polygon } from "geojson";

function isTouchScreen() {
  return window.matchMedia("(hover: none)").matches;
}

var cacheofcdsfromnames: any = {};

function getLang() {
  if (navigator.languages != undefined) return navigator.languages[0];
  return navigator.language;
}

var councilareasdistrict: any = {
  "1": 39172374.513557486,
  "2": 56028687.75752604,
  "3": 91323827.86998883,
  "4": 127051659.05853269,
  "5": 85492955.75895034,
  "6": 70583244.58359845,
  "7": 140330608.52718654,
  "8": 41642747.81303825,
  "9": 33854278.76005373,
  "10": 38455731.29742687,
  "11": 165241605.83628467,
  "12": 149947134.17462063,
  "13": 42095086.21254906,
  "14": 63974277.0096737,
  "15": 83429528.39743595,
};

var councilpopulations: any = {
  "1": 248124,
  "2": 250535,
  "3": 257098,
  "4": 269290,
  "5": 269182,
  "6": 261114,
  "7": 266276,
  "8": 257597,
  "9": 255988,
  "10": 270703,
  "11": 270691,
  "12": 259564,
  "13": 252909,
  "14": 264741,
  "15": 258310,
};

const councilcount: any = {
  "1": 152,
  "2": 49,
  "3": 35,
  "4": 41,
  "5": 57,
  "6": 84,
  "7": 44,
  "8": 55,
  "9": 60,
  "10": 45,
  "11": 48,
  "12": 28,
  "13": 84,
  "14": 323,
  "15": 62,
};

const filterableYears: any = {
  2018: 39845,
  2019: 49590,
  2020: 12207,
  2021: 41847,
  2022: 31711,
  2023: 2088,
};

const filterableYearsKeys = Object.keys(filterableYears);

const Home: NextPage = () => {
  var councilBounds: any = {
    features: CouncilDist.features,
    type: "FeatureCollection",
  };

  const listofcouncildists = Array.from({ length: 15 }, (_, i) => i + 1).map(
    (eachItem) => String(eachItem)
  );

  const [filteredcouncildistricts, setfilteredcouncildistricts] =
    useState<string[]>(listofcouncildists);

  const shouldfilteropeninit =
    typeof window != "undefined" ? window.innerWidth >= 640 : false;
  const [showtotalarea, setshowtotalarea] = useState(false);
  // const touchref = useRef<any>(null);
  // const isLoggedInRef = useRef(false);
  var mapref: any = useRef(null);
  const okaydeletepoints: any = useRef(null);
  // var [metric, setmetric] = useState(false);
  // const [showInitInstructions, setshowInitInstructions] = useState(true);
  const [doneloadingmap, setdoneloadingmap] = useState(false);
  // const lastYear = 8;
  // const [sliderYear, setSliderYearAct] = useState<any>([1, lastYear]);
  const [selectedfilteropened, setselectedfilteropened] = useState("year");

  const [filteredYears, setFilteredYears] = useState<number[]>(
    filterableYearsKeys.map((key) => Number(key))
  );
  // const [deletemaxoccu, setdeletemaxoccu] = useState(false);
  // const refismaploaded = useRef(false);
  const [filterpanelopened, setfilterpanelopened] =
    useState(shouldfilteropeninit);

  //template name, this is used to submit to the map analytics software what the current state of the map is.
  var mapname = "building-safety";

  // const [mapboxloaded, setmapboxloaded] = useState(false);

  const setFilteredYearPre = (input: string[]) => {
    console.log("inputvalidator", input);
    if (input.length === 0) {
      setFilteredYears([99999]);
    } else {
      setFilteredYears(input.map((x)=>Number(x)));
    }
  };

  // const setfilteredcouncildistrictspre = (input: string[]) => {
  //   console.log("inputvalidator", input);
  //   if (input.length === 0) {
  //     setfilteredcouncildistricts(["99999"]);
  //   } else {
  //     setfilteredcouncildistricts(input);
  //   }
  // };

  const datadogconfig: any = {
    applicationId: "54ed9846-68b0-4811-a47a-7330cf1828a0",
    clientToken: "pub428d48e3143310cf6a9dd00003773f12",
    site: "datadoghq.com",
    service: "beds",
    env: "prod",
    // Specify a version number to identify the deployed version of your application in Datadog
    // version: '1.0.0',

    sessionSampleRate: 100,
    sessionReplaySampleRate: 100,
    trackUserInteractions: true,
    trackResources: true,
    trackLongTasks: true,
    defaultPrivacyLevel: "allow",
  };

  datadogRum.init(datadogconfig);

  datadogRum.startSessionReplayRecording();

  function turfify(polygon: any) {
    var turffedpolygon;

    console.log("polygon on line 100", polygon);

    if (polygon.geometry.type == "Polygon") {
      turffedpolygon = turf.polygon(polygon.geometry.coordinates);
    } else {
      turffedpolygon = turf.multiPolygon(polygon.geometry.coordinates);
    }

    return turffedpolygon;
  }

  function polygonInWhichCd(polygon: any) {
    if (typeof polygon.properties.name === "string") {
      if (cacheofcdsfromnames[polygon.properties.name]) {
        return cacheofcdsfromnames[polygon.properties.name];
      } else {
        var turffedpolygon = turfify(polygon);

        const answerToReturn = councildistricts.features.find(
          (eachItem: any) => {
            //turf sucks for not having type checking, bypasses compile error Property 'booleanIntersects' does not exist on type 'TurfStatic'.
            //yes it works!!!! it's just missing types
            // @ts-ignore: Unreachable code error
            return turf.booleanIntersects(turfify(eachItem), turffedpolygon);
          }
        );

        cacheofcdsfromnames[polygon.properties.name] = answerToReturn;

        return answerToReturn;
      }
    }
  }

  var [hasStartedControls, setHasStartedControls] = useState(false);

  function checkHideOrShowTopRightGeocoder() {
    var toprightbox = document.querySelector(".mapboxgl-ctrl-top-right");
    if (toprightbox) {
      var toprightgeocoderbox: any = toprightbox.querySelector(
        ".mapboxgl-ctrl-geocoder"
      );
      if (toprightgeocoderbox) {
        if (typeof window != "undefined") {
          if (window.innerWidth >= 768) {
            console.log("changing to block");
            toprightgeocoderbox.style.display = "block";
          } else {
            toprightgeocoderbox.style.display = "none";
            console.log("hiding");
          }
        } else {
          toprightgeocoderbox.style.display = "none";
        }
      }
    }
  }

  const handleResize = () => {
    checkHideOrShowTopRightGeocoder();
  };

  const divRef: any = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log("map div", divRef);

    if (divRef.current) {
      console.log("app render");
    }

    // mapboxgl.workerClass = require('worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker').default;
    //import locations from './features.geojson'

    mapboxgl.accessToken =
      "pk.eyJ1Ijoia2VubmV0aG1lamlhIiwiYSI6ImNsZG1oYnpxNDA2aTQzb2tkYXU2ZWc1b3UifQ.PxO_XgMo13klJ3mQw1QxlQ";

    const formulaForZoom = () => {
      if (typeof window != "undefined") {
        if (window.innerWidth > 700) {
          return 10;
        } else {
          return 9.1;
        }
      }
    };

    const urlParams = new URLSearchParams(
      typeof window != "undefined" ? window.location.search : ""
    );
    const latParam = urlParams.get("lat");
    const lngParam = urlParams.get("lng");
    const zoomParam = urlParams.get("zoom");
    const debugParam = urlParams.get("debug");

    var mapparams: any = {
      container: divRef.current, // container ID
      //affordablehousing2022-dev-copy
      style: "mapbox://styles/kennethmejia/clg3x9ahb000001mzegwualfn", // style URL (THIS IS STREET VIEW)
      //mapbox://styles/comradekyler/cl5c3eukn00al15qxpq4iugtn
      //affordablehousing2022-dev-copy-copy
      //  style: 'mapbox://styles/comradekyler/cl5c3eukn00al15qxpq4iugtn?optimize=true', // style URL
      center: [-118.41, 34], // starting position [lng, lat]
      zoom: formulaForZoom(), // starting zoom
    };

    const map = new mapboxgl.Map(mapparams);
    mapref.current = map;

    var rtldone = false;

    try {
      if (rtldone === false && hasStartedControls === false) {
        setHasStartedControls(true);
        //multilingual support
        //right to left allows arabic rendering
        mapboxgl.setRTLTextPlugin(
          "https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.10.1/mapbox-gl-rtl-text.js",
          (callbackinfo: any) => {
            console.log(callbackinfo);
            rtldone = true;
          }
        );
      }

      const language = new MapboxLanguage();
      map.addControl(language);
    } catch (error) {
      console.error(error);
    }

    window.addEventListener("resize", handleResize);

    map.on("load", () => {
      setdoneloadingmap(true);
      setshowtotalarea(window.innerWidth > 640 ? true : false);

      okaydeletepoints.current = () => {
        try {
          var affordablepoint: any = map.getSource("selected-home-point");
          affordablepoint.setData(null);
        } catch (err) {
          console.error(err);
        }
      };

      const processgeocodereventresult = (eventmapbox: any) => {
        var singlePointSet: any = map.getSource("single-point");

        singlePointSet.setData({
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              geometry: eventmapbox.result.geometry,
            },
          ],
        });

        console.log("event.result.geometry", eventmapbox.result.geometry);
        console.log("geocoderesult", eventmapbox);
      };

      const processgeocodereventselect = (object: any) => {
        var coord = object.feature.geometry.coordinates;
        var singlePointSet: any = map.getSource("single-point");

        singlePointSet.setData({
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              geometry: object.feature.geometry,
            },
          ],
        });
      };

      const geocoder: any = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: map,
        proximity: {
          longitude: -118.41,
          latitude: 34,
        },
        marker: true,
      });

      var colormarker = new mapboxgl.Marker({
        color: "#41ffca",
      });

      const geocoderopt: any = {
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl,
        marker: {
          color: "#41ffca",
        },
      };

      const geocoder2 = new MapboxGeocoder(geocoderopt);
      const geocoder3 = new MapboxGeocoder(geocoderopt);

      geocoder.on("result", (event: any) => {
        processgeocodereventresult(event);
      });

      geocoder.on("select", function (object: any) {
        processgeocodereventselect(object);
      });

      var geocoderId = document.getElementById("geocoder");

      if (geocoderId) {
        console.log("geocoder div found");

        if (!document.querySelector(".geocoder input")) {
          geocoderId.appendChild(geocoder3.onAdd(map));

          var inputMobile = document.querySelector(".geocoder input");

          try {
            var loadboi = document.querySelector(
              ".mapboxgl-ctrl-geocoder--icon-loading"
            );
            if (loadboi) {
              var brightspin: any = loadboi.firstChild;
              if (brightspin) {
                brightspin.setAttribute("style", "fill: #e2e8f0");
              }
              var darkspin: any = loadboi.lastChild;
              if (darkspin) {
                darkspin.setAttribute("style", "fill: #94a3b8");
              }
            }
          } catch (err) {
            console.error(err);
          }

          if (inputMobile) {
            inputMobile.addEventListener("focus", () => {
              //make the box below go away
            });
          }
        }

        geocoder2.on("result", (event: any) => {
          processgeocodereventresult(event);
        });

        geocoder2.on("select", function (object: any) {
          processgeocodereventselect(object);
        });

        geocoder3.on("result", (event: any) => {
          processgeocodereventresult(event);
        });

        geocoder3.on("select", function (object: any) {
          processgeocodereventselect(object);
        });
      }

      map.addSource("single-point", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
      });

      if (true) {
        map.addLayer({
          id: "point",
          source: "single-point",
          type: "circle",
          paint: {
            "circle-radius": 10,
            "circle-color": "#41ffca",
          },
        });
      }

      if (debugParam) {
        map.showTileBoundaries = true;
        map.showCollisionBoxes = true;
        map.showPadding = true;
      }

      if (urlParams.get("terraindebug")) {
        map.showTerrainWireframe = true;
      }

      //create mousedown trigger
      map.on("mousedown", "building-safety-cases", (e) => {
        console.log("mousedown", e, e.features);
        if (e.features) {
          const closestcoords = computeclosestcoordsfromevent(e);

          const filteredfeatures = e.features.filter((feature: any) => {
            return (
              feature.geometry.coordinates[0] === closestcoords[0] &&
              feature.geometry.coordinates[1] === closestcoords[1]
            );
          });

          if (filteredfeatures.length > 0) {
            console.log("filtered features", filteredfeatures);
          }
        }
      });

      // Create a popup, but don't add it to the map yet.
      const popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
      });

      map.on("mouseenter", "building-safety", (e: any) => {
        console.log("mouseenter", e.features);
      });

      map.addSource("building-safety-point", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
      });

      map.loadImage("/map-marker.png", (error, image: any) => {
        if (error) throw error;

        // Add the image to the map style.
        map.addImage("map-marker", image);

        if (true) {
          // example of how to add a pointer to what is currently selected
          map.addLayer({
            id: "points-selected-shelter-layer",
            type: "symbol",
            source: "building-safety-point",
            paint: {
              "icon-color": "#41ffca",
              "icon-translate": [0, -13],
            },
            layout: {
              "icon-image": "map-marker",
              // get the title name from the source's "title" property
              "text-allow-overlap": true,
              "icon-allow-overlap": true,
              "icon-ignore-placement": true,
              "text-ignore-placement": true,

              "icon-size": 0.4,
              "icon-text-fit": "both",
            },
          });
        }
      });

      if (
        !document.querySelector(
          ".mapboxgl-ctrl-top-right > .mapboxgl-ctrl-geocoder"
        )
      ) {
        map.addControl(geocoder2);
      }

      checkHideOrShowTopRightGeocoder();

      if (true) {
        map.addLayer(
          {
            id: "citybound",
            type: "line",
            source: {
              type: "geojson",
              data: citybounds,
            },
            paint: {
              "line-color": "#dddddd",
              "line-opacity": 1,
              "line-width": 3,
            },
          },
          "road-label-navigation"
        );

        map.addSource("citycouncildist", {
          type: "geojson",
          data: councildistricts,
        });

        map.addLayer(
          {
            id: "councildistrictslayer",
            type: "line",
            source: "citycouncildist",
            paint: {
              "line-color": "#7FE5D4",
              "line-opacity": 1,
              "line-width": 2,
            },
          },
          "road-label-navigation"
        );

        map.addLayer(
          {
            id: "councildistrictsselectlayer",
            type: "fill",
            source: "citycouncildist",
            paint: {
              "fill-color": "#000000",
              "fill-opacity": 0,
            },
          },
          "road-label-navigation"
        );

        map.on("mousedown", "councildistrictsselectlayer", (e: any) => {
          var sourceofcouncildistselect: any = map.getSource(
            "selected-council-dist"
          );

          var clickeddata = e.features[0].properties.district;

          var councildistpolygonfound = councildistricts.features.find(
            (eachDist: any) => eachDist.properties.district === clickeddata
          );

          if (sourceofcouncildistselect) {
            if (councildistpolygonfound) {
              sourceofcouncildistselect.setData(councildistpolygonfound);
            }
          }
        });

        map.addSource("selected-council-dist", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: [],
          },
        });

        map.addLayer(
          {
            id: "selected-council-dist-layer",
            type: "fill",
            source: "selected-council-dist",
            paint: {
              "fill-color": "#002D25",
              "fill-opacity": 0.25,
            },
          },
          "road-label-navigation"
        );
      }

      if (hasStartedControls === false) {
        // Add zoom and rotation controls to the map.
        map.addControl(new mapboxgl.NavigationControl());

        // Add geolocate control to the map.
        map.addControl(
          new mapboxgl.GeolocateControl({
            positionOptions: {
              enableHighAccuracy: true,
            },
            // When active the map will receive updates to the device's location as it changes.
            trackUserLocation: true,
            // Draw an arrow next to the location dot to indicate which direction the device is heading.
            showUserHeading: true,
          })
        );
      }

      checkHideOrShowTopRightGeocoder();

      map.on("dragstart", (e) => {
        uploadMapboxTrack({
          mapname,
          eventtype: "dragstart",
          globallng: map.getCenter().lng,
          globallat: map.getCenter().lat,
          globalzoom: map.getZoom(),
        });
      });

      map.on("dragend", (e) => {
        uploadMapboxTrack({
          mapname,
          eventtype: "dragend",
          globallng: map.getCenter().lng,
          globallat: map.getCenter().lat,
          globalzoom: map.getZoom(),
        });
      });

      map.on("zoomstart", (e) => {
        uploadMapboxTrack({
          mapname,
          eventtype: "dragstart",
          globallng: map.getCenter().lng,
          globallat: map.getCenter().lat,
          globalzoom: map.getZoom(),
        });
      });

      map.on("zoomend", (e) => {
        uploadMapboxTrack({
          mapname,
          eventtype: "zoomend",
          globallng: map.getCenter().lng,
          globallat: map.getCenter().lat,
          globalzoom: map.getZoom(),
        });
      });

      //end of load
    });

    var getmapboxlogo: any = document.querySelector(".mapboxgl-ctrl-logo");

    if (getmapboxlogo) {
      getmapboxlogo.remove();
    }
  }, []);


  useEffect(() => {
    let arrayoffilterables: any = [];

    // arrayoffilterables.push([
    //   "match",
    //   ["get", "CD#"],
    //   filteredcouncildistricts.map((x) => String(x)),
    //   true,
    //   false,
    // ]);

    arrayoffilterables.push([
      "match",
      ["get", "Year Case Created"],
      filteredYears,
      true,
      false,
    ]);

    if (mapref.current) {
      if (doneloadingmap) {
        const filterinput = JSON.parse(
          JSON.stringify(["all", ...arrayoffilterables])
        );

        console.log(filterinput);

        if (doneloadingmap === true) {
          mapref.current.setFilter("building-safety", filterinput);
          // mapref.current.setFilter("deathsdots", filterinput);
        }
      }
    }
  }, [filteredYears]);

  return (
    <div className="flex flex-col h-full w-screen absolute">
      <MantineProvider
        theme={{ colorScheme: "dark" }}
        withGlobalStyles
        withNormalizeCSS
      >
        <Head>
          <link
            rel="icon"
            href="https://mejiaforcontroller.com/wp-content/uploads/2020/12/cropped-favicon-1-32x32.png"
            sizes="32x32"
          />
          <link
            rel="icon"
            href="https://mejiaforcontroller.com/wp-content/uploads/2020/12/cropped-favicon-1-192x192.png"
            sizes="192x192"
          />
          <link
            rel="apple-touch-icon"
            href="https://mejiaforcontroller.com/wp-content/uploads/2020/12/cropped-favicon-1-180x180.png"
          />
          <meta
            name="msapplication-TileImage"
            content="https://mejiaforcontroller.com/wp-content/uploads/2020/12/cropped-favicon-1-270x270.png"
          />

          <meta charSet="utf-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
          />
          <title>Building and Safety Code Enforcement Cases</title>
          <meta property="og:type" content="website" />
          <meta name="twitter:site" content="@lacontroller" />
          <meta name="twitter:creator" content="@lacontroller" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta
            name="twitter:title"
            key="twittertitle"
            content="Twitter Template Map | Map"
          ></meta>
          <meta
            name="twitter:description"
            key="twitterdesc"
            content="This is a template name"
          ></meta>
          <meta
            name="twitter:image"
            key="twitterimg"
            content="https://templatemap.lacontroller.io/thumbnail.png"
          ></meta>
          <meta name="description" content="Search Engine Template name." />

          <meta
            property="og:url"
            content="https://templatemap.lacontroller.io"
          />
          <meta property="og:type" content="website" />
          <meta property="og:title" content="Shelter Beds Occupancy | Map" />
          <meta
            property="og:description"
            content="Search engine template name + facebook/instagram template name."
          />
          <meta
            property="og:image"
            content="https://templatemap.lacontroller.io"
          />
        </Head>

        <div className="flex-none">
          <Nav />
        </div>

        <div className="flex-initial h-content flex-col flex z-50">
          <div className="   max-h-screen flex-col flex z-5">
            <div
              className="absolute mt-[3em] md:mt-[3.7em] md:ml-3 top-0 z-5 titleBox  ml-2 text-base bold md:semi-bold break-words bg-[#212121]"
              style={{
                backgroundColor: "#212121",
                color: "#ffffff",
              }}
            >
              <strong className="">
                Building and Safety Code Enforcement Cases
              </strong>
            </div>

            <div
              className={`geocoder absolute mt-[2.7em] md:mt-[4.1em] ml-1 left-1 md:hidden xs:text-sm sm:text-base md:text-lg`}
              id="geocoder"
            ></div>
            <div className="w-content"></div>

            <div className="fixed mt-[6em] ml-2 sm:hidden flex flex-row">
              {filterpanelopened === false && (
                <button
                  onClick={() => {
                    setfilterpanelopened(true);
                  }}
                  className={` md:hidden mt-2 rounded-full px-3 pb-1.5 pt-0.5 text-sm bold md:text-base 
                  bg-gray-800 bg-opacity-80 text-white border-white border-2`}
                >
                  <svg
                    style={{
                      width: "20px",
                      height: "20px",
                    }}
                    viewBox="0 0 24 24"
                    className="inline align-middle mt-0.5"
                  >
                    <path
                      fill="currentColor"
                      d="M14,12V19.88C14.04,20.18 13.94,20.5 13.71,20.71C13.32,21.1 12.69,21.1 12.3,20.71L10.29,18.7C10.06,18.47 9.96,18.16 10,17.87V12H9.97L4.21,4.62C3.87,4.19 3.95,3.56 4.38,3.22C4.57,3.08 4.78,3 5,3V3H19V3C19.22,3 19.43,3.08 19.62,3.22C20.05,3.56 20.13,4.19 19.79,4.62L14.03,12H14Z"
                    />
                  </svg>
                  <span>Filter</span>
                </button>
              )}
            </div>

            <div
              className="filterandinfobox  fixed
 top-auto bottom-0 left-0 right-0
   sm:max-w-sm sm:absolute sm:mt-[6em] md:mt-[3em] sm:ml-3 
  sm:top-auto sm:bottom-auto sm:left-auto 
  sm:right-auto flex flex-col gap-y-2"
            >
              {filterpanelopened === false && (
                <div className=" flex flex-row">
                  <button
                    onClick={() => {
                      setfilterpanelopened(true);
                    }}
                    className={`hidden md:block mt-2 rounded-full px-3 pb-1.5 pt-0.5 text-sm bold md:text-base 
                  bg-gray-800 bg-opacity-80 text-white border-white border-2`}
                  >
                    <svg
                      style={{
                        width: "20px",
                        height: "20px",
                      }}
                      viewBox="0 0 24 24"
                      className="inline align-middle mt-0.5"
                    >
                      <path
                        fill="currentColor"
                        d="M14,12V19.88C14.04,20.18 13.94,20.5 13.71,20.71C13.32,21.1 12.69,21.1 12.3,20.71L10.29,18.7C10.06,18.47 9.96,18.16 10,17.87V12H9.97L4.21,4.62C3.87,4.19 3.95,3.56 4.38,3.22C4.57,3.08 4.78,3 5,3V3H19V3C19.22,3 19.43,3.08 19.62,3.22C20.05,3.56 20.13,4.19 19.79,4.62L14.03,12H14Z"
                      />
                    </svg>
                    <span>Filter</span>
                  </button>
                </div>
              )}
              <div
                className={`
              ${
                filterpanelopened
                  ? "relative bg-zinc-900 w-content bg-opacity-90 px-2 py-1 mt-1 sm:rounded-lg"
                  : "hidden"
              }
              `}
              >
                <CloseButton
                  onClose={() => {
                    setfilterpanelopened(false);
                  }}
                />
                <div className="gap-x-0 flex flex-row w-full pr-8">
                  <button
                    onClick={() => {
                      setselectedfilteropened("year");
                    }}
                    className={`px-2 border-b-2 py-1  font-semibold ${
                      selectedfilteropened === "year"
                        ? "border-[#41ffca] text-[#41ffca]"
                        : "hover:border-white border-transparent text-gray-50"
                    }`}
                  >
                    Year
                  </button>

                  <button
                    onClick={() => {
                      setselectedfilteropened("area");
                    }}
                    className={`px-2 border-b-2  py-1  font-semibold ${
                      selectedfilteropened === "area"
                        ? "border-[#41ffca] text-[#41ffca]"
                        : "hover:border-white border-transparent text-gray-50"
                    }`}
                  >
                    Area
                  </button>

                  <button
                    onClick={() => {
                      setselectedfilteropened("case");
                    }}
                    className={`px-2 border-b-2  py-1  font-semibold ${
                      selectedfilteropened === "case"
                        ? "border-[#41ffca] text-[#41ffca]"
                        : "hover:border-white border-transparent text-gray-50"
                    }`}
                  >
                    Case
                  </button>
                </div>
                <div className="flex flex-col">
                  {selectedfilteropened === "year" && (
                    <div className="mt-2">
                      <div className="flex flex-row gap-x-1">
                        <button
                          className="align-middle bg-gray-800 rounded-lg px-1  border border-gray-400 text-sm md:text-base"
                          onClick={() => {
                            setFilteredYearPre(filterableYearsKeys);
                          }}
                        >
                          Select All
                        </button>
                        <button
                          className="align-middle bg-gray-800 rounded-lg px-1 text-sm md:text-base border border-gray-400"
                          onClick={() => {
                            setFilteredYearPre([]);
                          }}
                        >
                          Unselect All
                        </button>
                        <button
                          onClick={() => {
                            setFilteredYearPre(
                              filterableYearsKeys.filter(
                                (n) => !filteredYears.includes(Number(n))
                              )
                            );
                          }}
                          className="align-middle bg-gray-800 rounded-lg px-1 text-sm md:text-base  border border-gray-400"
                        >
                          Invert
                        </button>
                      </div>
                      <div className="flex flex-row gap-x-1">
                        <div className="flex items-center">
                          <Checkbox.Group
                            value={filteredYears.map((x)=>String(x))}
                            onChange={setFilteredYearPre}
                          >
                            {" "}
                            <div
                              className={`grid grid-cols-3
                          } gap-x-4 `}
                            >
                              {Object.entries(filterableYears).map(
                                (eachEntry) => (
                                  <Checkbox
                                    value={eachEntry[0]}
                                    label={
                                      <span className="text-nowrap text-xs">
                                        <span className="text-white">
                                          {titleCase(
                                            eachEntry[0].toLowerCase()
                                          )}
                                        </span>{" "}
                                        <span>{eachEntry[1]}</span>
                                      </span>
                                    }
                                    key={eachEntry[0]}
                                  />
                                )
                              )}
                            </div>
                          </Checkbox.Group>
                        </div>{" "}
                      </div>{" "}
                      {/* <p className="text-gray-200 text-xs">
                        Data including categories for race set by L.A. County
                        Medical-Examiner Coroner
                      </p> */}
                    </div>
                  )}
                  {selectedfilteropened === "cd" && (
                    <div className="mt-2">
                      <div className="flex flex-row gap-x-1">
                        <button
                          className="align-middle bg-gray-800 rounded-lg px-1  border border-gray-400 text-sm md:text-base"
                          onClick={() => {
                            setfilteredcouncildistrictspre(listofcouncildists);
                          }}
                        >
                          Select All
                        </button>
                        <button
                          className="align-middle bg-gray-800 rounded-lg px-1 text-sm md:text-base border border-gray-400"
                          onClick={() => {
                            setfilteredcouncildistrictspre([]);
                          }}
                        >
                          Unselect All
                        </button>
                        <button
                          onClick={() => {
                            setfilteredcouncildistrictspre(
                              listofcouncildists.filter(
                                (n) => !filteredcouncildistricts.includes(n)
                              )
                            );
                          }}
                          className="align-middle bg-gray-800 rounded-lg px-1 text-sm md:text-base  border border-gray-400"
                        >
                          Invert
                        </button>
                      </div>
                      <Checkbox.Group
                        value={filteredcouncildistricts}
                        onChange={setfilteredcouncildistrictspre}
                      >
                        {" "}
                        <div
                          className={`grid grid-cols-3
                          } gap-x-4 `}
                        >
                          {listofcouncildists.map((item, key) => (
                            <Checkbox
                              value={item}
                              label={
                                <span className="text-nowrap text-xs">
                                  <span className="text-white">{item}</span>{" "}
                                  <span>{councilcount[String(item)]}</span>
                                </span>
                              }
                              key={key}
                            />
                          ))}
                        </div>
                      </Checkbox.Group>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div ref={divRef} style={{}} className="map-container w-full h-full " />

        {(typeof window !== "undefined" ? window.innerWidth >= 640 : false) && (
          <>
            <div
              className={`absolute md:mx-auto z-9 bottom-2 left-1 md:left-1/2 md:transform md:-translate-x-1/2`}
            >
              <a
                href="https://controller.lacontroller.gov/"
                target="_blank"
                rel="noreferrer"
              >
                <img
                  src="https://controller.lacity.gov/images/KennethMejia-logo-white-elect.png"
                  className="h-9 md:h-10 z-40"
                  alt="Kenneth Mejia LA City Controller Logo"
                />
              </a>
            </div>
          </>
        )}
      </MantineProvider>
    </div>
  );
};

export default Home;
