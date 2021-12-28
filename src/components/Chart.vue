<template>
  <div id="chart">
    <v-row>
      <highcharts
          ref="highcharts"
          v-if="Object.keys(chartOptions).length && chartReady"
          :options="chartOptions[thresholdSelection]" :updateArgs="updateArgs">
      </highcharts>



    </v-row>

    <v-row class="my-n8">
      <v-col cols="8">

      </v-col>
      <v-col cols="1">
        <v-btn class="no-uppercase px-2" x-small elevation="0"
               width="90"
               @click="displayLegend = !displayLegend" :color="colors.blueGrey.lighten4">
        <span v-if="displayLegend">
          Hide legend
        </span>
          <span v-else>
          Show legend
        </span>
        </v-btn>
      </v-col>


    </v-row>

    <v-row>
      <warnings-component v-if="dataReady" :warnings="warnings"></warnings-component>
    </v-row>

    <v-row>
      <!-- :resultsSeries="thresholdSelection === 'aap' ? resultsSeriesTermData : thresholdSelection === 'ncnc' ? resultsSeriesNCNCData : []" -->
      <table-component v-if="Object.keys(chartOptions).length && chartReady"
                       :seriesRef="chartOptions[thresholdSelection].series.length - 1"
                       :thresholdSelection="thresholdSelection"
                       :resultsSeries="chartOptions[thresholdSelection].series[chartOptions[thresholdSelection].series.length - 1].data"></table-component>
    </v-row>

  </div>
</template>

<script>
// Constants


import AglService from "@/agl/AglService";
import colors from "vuetify/lib/util/colors";
const curves = ['aap', 'ncnc', 'premie'];

const MARKERS = {
  serum: "circle",
  POC: "diamond",
  TC: "square",
};

const MARKERCOLORS = {
  transfusionHigh: "DarkViolet",
  transfusionMedium: "DarkViolet",
  transfusionLow: "DarkViolet",
  phototherapyHigh: "#1016FF",
  phototherapyMedium: "#1016FF",
  phototherapyLow: "#1016FF",
  riskHigh: "red",
  riskHighIntermediate: "orange",
  riskLowIntermediate: "yellow",
  riskLow: "green",
  riskUndefined: "grey",
};

const BILICURVEPROPS = {
  name:
      "<b>Bilirubin level</b><br/>(serum: \u25cf, POC: \u2666, transcut: \u25A0)<br/><br/>",
  color: "black",
  type: "spline",
  fillOpacity: 0.9,
  lineWidth: 2,
  // animation: true
};

const PHOTOTHERAPYBANDPROPS = {
  name:
      "<b>Phototherapy</b>",
  color: "#1016FF", // "rgba(0, 0, 120, 0.3)", // IE11 doesn't handle alpha channels
  type: "polygon",
  opacity: 0.2,
  lineWidth: 0,
  animation: true,
  marker: {
    enabled: false
  }
};

const RISKZONEPROPS = {
  High: {
    name: "<b>High risk</b> zone",
    abbreviation: "Hi risk",
    color: "rgba(255, 0, 0, 0.4)", // red
  },
  HighIntermediate: {
    name: "<b>High-intermediate risk</b> zone",
    abbreviation: "Hi-int risk",
    color: "rgba(255,140,0, 0.4)", // orange
  },
  LowIntermediate: {
    name: "<b>Low-intermediate risk</b> zone",
    abbreviation: "Lo-int risk",
    color: "rgba(255,255,0,0.3)", // yellow
  },
  Low: {
    name: "<b>Low risk</b> zone",
    abbreviation: "Low risk",
    color: "rgba(0, 128, 0, 0.3)", // green
  },
  Undefined: {
    name: "Undefined",
    abbreviation: "Undefined",
    color: "green",
    nograph: true,
  },
};

const TREATMENTZONEPROPS = {
  phototherapy: {
    High: {
      /* eslint max-len: "off" */
      name:
          "<b>Phototherapy threshold</b><br>\u22ef low risk infants, \u2265 38w \u0026 well<br>" +
          "-- med risk, \u2265 38w \u0026 risk factors<br>\u2003 \u2003 \u2003 \u2003 \u2003 or 35-37w6d \u0026 well<br>" +
          "\u2014 hi risk infants, 35-37w6d \u0026 risk factors<br>(isoimmune dz, G6PD, asphyxia, lethargy,<br>" +
          "temp instability, sepsis, albumin < 3)<br>",
      id: "phototherapyHigh",
      type: "spline",
      lineWidth: 1.5,
      color: MARKERCOLORS.phototherapyHigh,
    },
    Medium: {
      name:
          "Infants at medium risk (38+ weeks and risk factors, or 35-37w6d and well)",
      id: "phototherapyMedium",
      type: "spline",
      lineWidth: 1.5,
      color: MARKERCOLORS.phototherapyMedium,
      dashStyle: "dash",
      linkedTo: "phototherapyHigh",
    },
    Low: {
      name: "Phototherapy threshold",
      id: "phototherapyLow",

      type: "spline",
      lineWidth: 1.5,
      color: MARKERCOLORS.phototherapyLow,
      dashStyle: "dot",
      linkedTo: "phototherapyMedium",
    },
  },
  transfusion: {
    High: {
      name: "<b>Transfusion threshold</b>",
      id: "transfusionHigh",
      type: "spline",
      lineWidth: 1.5,
      color: MARKERCOLORS.transfusionHigh,
    },
    Medium: {
      name:
          "Infants at medium risk (38+ weeks and risk factors, or 35-37w6d and well)",
      id: "transfusionMedium",

      type: "spline",
      lineWidth: 1.5,
      color: MARKERCOLORS.transfusionMedium,
      dashStyle: "dash",
      linkedTo: "transfusionHigh",
    },
    Low: {
      name: "Infants at lower risk (38+ weeks and well)",
      id: "transfusionLow",
      type: "spline",
      lineWidth: 1.5,
      color: MARKERCOLORS.transfusionLow,
      dashStyle: "dot",
      linkedTo: "transfusionMedium",
    },
  },
};


// Bhutani risk zones literal object
// Bhutani risk zones start at 12 hours of life
const riskZone = {
  interval: 4, // How many hours apart is each data point
  startsAt: 12,
  minimumGA: 35 * 7, // Minimal gestational age for which these are valid
  // Each line in the series, followed by literal index identifiers
  // We're using an array rather than an object in order to guarantee order
  series: [
    [
      25,
      25,
      25,
      25,
      25,
      25,
      25,
      25,
      25,
      25,
      25,
      25,
      25,
      25,
      25,
      25,
      25,
      25,
      25,
      25,
      25,
      25,
      25,
      25,
      25,
      25,
      25,
      25,
      25,
      25,
      25,
      25,
      25,
      25,
      25,
    ],
    [
      7.1,
      7.2,
      7.4,
      7.8,
      8.9,
      10.0,
      11.1,
      12.2,
      12.5,
      13.2,
      13.8,
      14.4,
      15.2,
      15.4,
      15.6,
      15.9,
      16.2,
      16.4,
      16.7,
      17.0,
      17.2,
      17.4,
      17.4,
      17.5,
      17.5,
      17.5,
      17.6,
      17.7,
      17.6,
      17.5,
      17.4,
      17.4,
      17.3,
      17.3,
      17.4,
    ],
    [
      5.1,
      5.5,
      5.9,
      6.1,
      7.0,
      8.0,
      8.9,
      9.9,
      10.3,
      10.8,
      11.3,
      12.0,
      12.6,
      12.9,
      13.1,
      13.4,
      13.8,
      14.3,
      14.7,
      14.7,
      15.0,
      15.2,
      15.3,
      15.4,
      15.5,
      15.6,
      15.7,
      15.8,
      15.7,
      15.6,
      15.5,
      15.4,
      15.3,
      15.2,
      15.3,
    ],
    [
      3.9,
      4.3,
      4.7,
      4.9,
      5.5,
      6.3,
      7.0,
      7.8,
      8.1,
      8.6,
      9.0,
      9.3,
      9.6,
      10.2,
      10.7,
      11.2,
      11.3,
      11.4,
      11.6,
      11.8,
      12.2,
      12.3,
      12.5,
      12.7,
      12.8,
      13.0,
      13.1,
      13.2,
      13.2,
      13.2,
      13.2,
      13.2,
      13.2,
      13.2,
      13,
    ],
    [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
    ], // Array.fill not supported in IE11 or below
  ],
  seriesNames: [
    "High",
    "HighIntermediate",
    "LowIntermediate",
    "Low",
    "Undefined",
  ],
  seriesMap: {
    High: 0,
    HighIntermediate: 1,
    LowIntermediate: 2,
    Low: 3,
    Undefined: 4,
  },
  getSeriesByName: function (name) {
    return this.series[this.seriesMap[name]];
  },

  // Given an age in hours, what threshold (if any) is a bilirubin level above?
  exceeds: function (hours, level) {
    var xDistance, y1, y2, x1, x1Index, threshold;
    // Get the nearest (on the left side) x value in hours
    // So if an age is, say, 29 hours, and our interval is 4, we're looking for 28 hours (x1),
    // or position 7 in the array (the x1Index)
    x1Index = Math.floor((hours - this.startsAt) / this.interval);
    x1 = Math.floor(hours / this.interval) * this.interval;

    // If we are looking for a risk level prior to when they're defined, return undefined
    if (hours < this.startsAt) {
      return this.seriesMap.Undefined;
    }
    // If the hour is so late it falls off the right side of the nomogram, we'll use the rightmost data
    // point available, which assumes it more or less goes off forever at the same bilirubin level
    if (x1Index >= this.series[0].length) {
      x1Index = this.series[0].length - 1;
    }
    console.log(`In riskZone.exceeds with hours ${hours}, level ${level}, x1 ${x1}, x1Index ${x1Index}`)

    // Go through each series at the age in hours
    // If we exceed that zones ceiling, we return the next zone "up"
    // We get to skip the high risk zone, since if we exceed high-int risk we're high risk
    // We get to skip the low risk zone, since if it doesn't exceed any of the other zones it's low risk
    for (let i = 1; i < this.series.length - 1; i++) {

      y1 = this.series[i][x1Index];
      if (x1Index + 1 < this.series[0].length) {
        y2 = this.series[i][x1Index + 1];
      } else {
        // We're at the right edge of the series, so assume it's a straight line
        y2 = y1;
      }
      // Rate of y increase between two data points is (y2 - y1)/interval
      // Since that's a linear function, the threshold we're looking for is (y2 - y1)/interval
      // Slope = rise/run; rise is y2-y1; run is always the interval
      // So given a slope and two points, the point slope formula says
      // y2-y1 = slope * (x2-x1), or
      // y2 = y1 + slope * (x2 - x1)
      // xDistance is how far it is from x1 to hours
      xDistance = hours - x1;
      threshold = y1 + xDistance * ((y2 - y1) / this.interval);
      console.log(`Looking at series ${this.seriesNames[i-1]}, threshold ${threshold}, y1 ${y1}, y2 ${y2}, xDistance ${xDistance}, series length ${this.series[i].length}`);
      if (level >= threshold) {
        console.log(`Returning level ${i -1}, ${this.seriesNames[i-1]} from exceeds, threshold ${threshold}, level ${level}`)
        return i - 1; // If we exceeded this zone's ceiling, return the next zone "up"
        // E.g., if we exceeded the ceiling of the low risk zone, return low-intermediate risk
      }
    }
    // If we made it here, we didn't cross a threshold
    return this.seriesMap.Low;
  },
};


const TREATMENTZONEPREMIEPROPS = {
  Transfusion: {
    name: "Transfusion zone, infants with prematurity alone",
    type: "arearange",
    color: "#bc7f7f",
  },
  TransfusionRisk: {
    name:
        "Transfusion zone, for infants with prematurity + neurotoxicity risk factors",
    type: "arearange",
    color: "#f499a3",
    // linkedTo: ':previous',
  },

  Phototherapy: {
    name: "Phototherapy zone, for infants with prematurity alone",
    type: "arearange",
    color: "#96b5ba",
  },
  PhototherapyRisk: {
    name:
        "Phototherapy zone, for infants with prematurity + neurotoxicity risk factors",
    type: "arearange",
    color: "#b5e3e4",
    // linkedTo: ':previous',
  },
};

// Premie Bilirecs version of treatment zone
// Adapted from Stanford Premie BiliRecs
// eslint-disable-next-line no-unused-vars
const treatmentZonePremie = {
  interval: 1, // ticks are 1 week apart, data points are 1 day apart
  minimumGA: 189, // starts at 189 postmenstrual days
  maximumGA: 245, // ends at 245 postmenstrual days
  minimumAge: 2, // days
  series: [
    [
      20,
      20,
      20,
      20,
      20,
      20,
      20,
      20,
      20,
      20,
      20,
      20,
      20,
      20,
      20,
      20,
      20,
      20,
      20,
      20,
      20,
      20,
      20,
      20,
      20,
      20,
      20,
      20,
      20,
      20,
      20,
      20,
      20,
      20,
      20,
      20,
      20,
      20,
      20,
      20,
      20,
      20,
      20,
      20,
      20,
      20,
      20,
      20,
      20,
      20,
      20,
      20,
      20,
      20,
      20,
      20,
      20,
    ],
    [
      14,
      14,
      14,
      14,
      14,
      14,
      14,
      14,
      14.1,
      14.1,
      14.2,
      14.3,
      14.4,
      14.4,
      14.5,
      14.6,
      14.6,
      14.7,
      14.8,
      14.9,
      14.9,
      15,
      15.1,
      15.3,
      15.4,
      15.6,
      15.7,
      15.9,
      16,
      16.1,
      16.3,
      16.4,
      16.6,
      16.7,
      16.9,
      17,
      17.1,
      17.3,
      17.4,
      17.6,
      17.7,
      17.9,
      18,
      18.1,
      18.1,
      18.2,
      18.3,
      18.4,
      18.4,
      18.5,
      18.6,
      18.6,
      18.7,
      18.8,
      18.9,
      18.9,
      18.9,
    ],
    [
      11,
      11.1,
      11.1,
      11.2,
      11.3,
      11.4,
      11.4,
      11.5,
      11.6,
      11.6,
      11.7,
      11.8,
      11.9,
      11.9,
      12,
      12.1,
      12.1,
      12.2,
      12.3,
      12.4,
      12.4,
      12.5,
      12.6,
      12.6,
      12.7,
      12.8,
      12.9,
      12.9,
      13,
      13.1,
      13.3,
      13.4,
      13.6,
      13.7,
      13.9,
      14,
      14.1,
      14.3,
      14.4,
      14.6,
      14.7,
      14.9,
      15,
      15.1,
      15.3,
      15.4,
      15.6,
      15.7,
      15.9,
      16,
      16.1,
      16.3,
      16.4,
      16.6,
      16.7,
      16.9,
      17.099,
    ],
    [
      6,
      6.1,
      6.3,
      6.4,
      6.6,
      6.7,
      6.9,
      7,
      7.1,
      7.3,
      7.4,
      7.6,
      7.7,
      7.9,
      8,
      8.1,
      8.3,
      8.4,
      8.6,
      8.7,
      8.9,
      9,
      9.1,
      9.3,
      9.4,
      9.6,
      9.7,
      9.9,
      10,
      10.1,
      10.3,
      10.4,
      10.6,
      10.7,
      10.9,
      11,
      11.1,
      11.3,
      11.4,
      11.6,
      11.7,
      11.9,
      12,
      12.1,
      12.3,
      12.4,
      12.6,
      12.7,
      12.9,
      13,
      13.1,
      13.3,
      13.4,
      13.6,
      13.7,
      13.9,
      14.1,
    ],
    [
      5,
      5.1,
      5.1,
      5.2,
      5.3,
      5.4,
      5.4,
      5.5,
      5.6,
      5.6,
      5.7,
      5.8,
      5.9,
      5.9,
      6,
      6.1,
      6.3,
      6.4,
      6.6,
      6.7,
      6.9,
      7,
      7.1,
      7.3,
      7.4,
      7.6,
      7.7,
      7.9,
      8,
      8.1,
      8.3,
      8.4,
      8.6,
      8.7,
      8.9,
      9,
      9.1,
      9.3,
      9.4,
      9.6,
      9.7,
      9.9,
      10,
      10.1,
      10.3,
      10.4,
      10.6,
      10.7,
      10.9,
      11,
      11.1,
      11.3,
      11.4,
      11.6,
      11.7,
      11.9,
      12.1,
    ],
    [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
    ],
  ],

  seriesNames: [
    "Transfusion",
    "TransfusionRisk",
    "Phototherapy",
    "PhototherapyRisk",
    "Low",
  ],
  seriesMap: {
    Transfusion: 0,
    TransfusionRisk: 1,
    Phototherapy: 2,
    PhototherapyRisk: 3,
    Low: 4,
    Undefined: 5,
  },
  /**
   * return the series of the type specified by zone
   * @param {string} type String "phototherapy" or "transfusion"
   * @param {string} name - String "High", "Medium", or "Low"
   * @return {array} series of data points
   */
  getSeriesByName: function (name) {
    return this.series[this.seriesMap[name]];
  },

  // Given an age in postmenstrual days and bilirubin level, is the bilirubin level above
  // a phototherapy or transfusion treatment threshold?
  //
  exceeds: function (age, birthGA, level) {
    var xDistance, y1, y2, x1, x1Index, threshold, i;

    // Get the nearest (on the left side) x value in days (of postmenstrual age)
    // So if an age is, say, 219.3 days, and our interval is 1 day, we're looking for 219 days (x1), or position 30 in the array (the x1Index)
    x1Index = Math.floor((age - this.minimumGA) / this.interval);
    x1 = Math.floor(age / this.interval) * this.interval;
    // console.log(`Checking premie thresholds: age ${age}, level ${level}, x1Index ${x1Index}, x1 ${x1}`);

    // If we are looking for a treatment level prior to when they're defined, return undefined

    if (age < this.minimumGA || age > this.maximumGA) {
      console.log(`Premie tx threshold undefined: ${age} out of range`);
      return this.seriesMap.Undefined;
    }

    // Not defined in kids under 48 h old
    if (age + this.minimumAge < birthGA) {
      console.log(`Premie tx threshold undefined: ${age} too young`);

      return this.seriesMap.Undefined;
    }

    for (i = 1; i < this.series.length - 1; i++) {
      y1 = this.series[i][x1Index];

      if (x1Index + 1 < this.series[0].length) {
        y2 = this.series[i][x1Index + 1];
      } else {
        y2 = y1;
      }
      xDistance = age - x1;
      threshold = y1 + xDistance * ((y2 - y1) / this.interval);
      if (level >= threshold) {
        // console.log(`Returning premie tx threshold ${i -1}`)
        return i - 1;
      }
    }

    // If we made it here, we didn't cross a threshold
    return this.seriesMap.Low;
  },
};

/// Globals (to be gotten rid of)
// Declarations
// The actual array of objects we'll plot on the graph, based on the results
// We need these to be defined and not just returned, so we can modify them later reactively
// resultsSeries is the actual series of results; we swap in the premie and term versions depending on the graph
// displayed. Some kids on the border of 35 weeks might benefit from comparison
// var resultsSeriesTerm; // The results series we plot
// var resultsSeriesNCNC;
// var resultsSeriesPremie;
// var treatmentZoneSeries;
// var treatmentZoneSeriesNCNC;
// var treatmentZonePremieSeries = [];
// var riskZoneSeries = [];

// The data that define the points in the series
// var resultsSeriesTermData = []; // Results of bilirubin series, as interpreted by AAP
// var resultsSeriesNCNCData = []; // And with NCNC data labels and thresholds instead
// var resultsSeriesPremieData = [];

// var results // , thresholdSelection;
// var patient = {
//   rawBirthGA: "",
//   birthWeight: 0,
//   birthDay: "",
//   birthTime: "",
//   birthDateTime: "",
// };


// Incoming raw results
// var results = { };

// Warnings we collect (and hopefully fix) along the way
// var warnings = [];

// Major animation we usually have on, but turn off for copying purposes
// var bilirubinLevelMouseTracking = true;

// Given two arrays of y coordinates (low-end and high-end thresholds), replace it with an array of datapoint objects that includes
// x coordinates at a given interval of hours (and low and high values for the y coordinates for a range plot)
// We use this to make an area plot for each zone of the Bhutani nomogram (low, low-int, high-int and high)
function addXCoordinatesWithRange(
    yCoordinatesLow,
    yCoordinatesHigh,
    interval,
    startsAt) {
  console.log("Chart.vue: addXCoordinatesWithRange");
  var arrayLength = yCoordinatesHigh.length;
  var x = startsAt;
  var returnArray = [];

  for (var i = 0; i < arrayLength; i++) {
    let dataPoint = {
      x: x,
      low: yCoordinatesLow[i],
      high: yCoordinatesHigh[i],
    };

    returnArray.push(dataPoint);
    x += interval;
  }
  return returnArray;
}

// Given an array of y coordinates, replace it with an array of datapoint objects that includes
// x coordinates at a given interval of hours
// We use this to plot the phototherapy and transfusion therapy thresholds
function addXCoordinates(yCoordinates, interval, startsAt) {
  var arrayLength = yCoordinates.length;
  var x = startsAt;
  var returnArray = [];
  console.log("Chart.vue: addXCoordinates");

  for (var i = 0; i < arrayLength; i++) {
    var dataPoint = {x: x, y: yCoordinates[i]};

    returnArray.push(dataPoint);
    x += interval;
  }
  return returnArray;
}

// Native version of JQuery extend
function extend() {
  for (var i = 1; i < arguments.length; i++)
    for (var key in arguments[i])
        // eslint-disable-next-line no-prototype-builtins
      if (arguments[i].hasOwnProperty(key))
        arguments[0][key] = arguments[i][key];
  return arguments[0];
}


// import { defineComponent } from "@vue/composition-api";
import {differenceInHours, isValid} from "date-fns";
import TableComponent from "@/components/Table.vue";
import WarningsComponent from "@/components/Warnings.vue";
// import { mapGetters } from 'vuex';
import {mapState} from 'vuex';
import store from "@/store";

export default {
  name: "Chart",
  components: {
    TableComponent,
    WarningsComponent,
  },
  // props: {
  //   // legendToggle: Boolean,
  //   // thresholdSelection: Number,
  // },
  methods: {


    // Make the polygon for a single phototherapy treatment plotband
    makePhototherapyBand(band, curve, width) {
      let data = [];
      let dataPremie = [];
      let birthDateTime = this.$store.getters.patient.birthDateTime;
      let ceiling = 25;
      console.log("makePhototherapyBand for ",
          curve)

      let ageHours = differenceInHours(band.startTime, birthDateTime);
      let agePostMenstrualDays = ageHours / 24 + this.$store.getters.patient.birthGA;
      let tooltip = `<b>Phototherapy</b> @ ${curve === 'premie' ?
          (ageHours / 24).toFixed(1) + ' days / ' + ageHours + ' hours of life' :
          ageHours.toFixed(0) + 'h'}<br/>
            <span style="color: ${this.treatmentZone.phototherapylineColor};">
            \u2600 </span> ${band.tooltip}`;
      console.log(`Chart.vue: making phototherapy plotBand, start: ${ageHours}, to ${ageHours + width}; tooltip ${band.tooltip}`);

      // We need unique ID's so transformations between charts work right
      data = [{
        x: ageHours,
        y: 0,
        id: `phototx-${curve}-${ageHours}-1`,
        customTooltip: tooltip
      }, {
        x: ageHours,
        y: ceiling,
        id: `phototx-${curve}-${ageHours}-2`,
        customTooltip: tooltip
      }, {
        x: ageHours + width,
        y: ceiling,
        id: `phototx-${curve}-${ageHours}-3`,
        customTooltip: tooltip
      }, {
        x: ageHours + width,
        y: 0,
        id: `phototx-${curve}-${ageHours}-4`,
        customTooltip: tooltip
      }
      ]

      dataPremie = [{
        x: agePostMenstrualDays,
        y: 0,
        id: `phototx-${curve}-${agePostMenstrualDays}-1`,
        customTooltip: tooltip
      }, {
        x: agePostMenstrualDays,
        y: ceiling,
        id: `phototx-${curve}-${agePostMenstrualDays}-2`,
        customTooltip: tooltip
      }, {
        x: agePostMenstrualDays + width / 24,
        y: ceiling,
        id: `phototx-${curve}-${agePostMenstrualDays}-3`,
        customTooltip: tooltip
      }, {
        x: agePostMenstrualDays + width / 24,
        y: 0,
        id: `phototx-${curve}-${agePostMenstrualDays}-4`,
        customTooltip: tooltip
      }]


      console.log(`Returning plotband data for curve ${curve}: `, data);
      return (curve === 'premie' ? dataPremie : data);
      // return ([
      //   [40, 0],
      //   [40, 25],
      //   [52, 25],
      //     [52, 0],
      //     [40, 0]
      // ]);
      // return ([[24, 5], [48,15], [74, 12], [120,3]])
    },

    getChartOptions(series, title, xAxis) {
      let chartOptions = {
        chart: {
          type: "arearange", //arearange
          zoomType: "xy",
          displayErrors: true,
          panning: true,
          panKey: "shift",
          pinchType: 'x',
          styledMode: false,
          style: {
            fontFamily: "roboto",
            overflow: "none"
          },
          scrollbar: {
            enabled: true,
          },
          width: "900",
          events: {
            load: function (e) {
              console.log("Chart loaded, event:", e);
              // e.target.renderTo.style.overflow = 'none';
              // IE11 doesn't play nicely with Highcharts' default style overflow: hidden
              // (It cuts off the legend.)
            },
          },
        },
        xAxis: xAxis
            ? xAxis
            : [
              {
                title: {
                  text: "Age <i>(hours)</i>",
                },
                tickInterval: 24,
                minorTickInterval: 12,
                softMin: 0,
                softMax: 168,
                labels: {
                  formatter: function () {
                    return this.value;
                  },
                }
              },
              {
                title: {
                  text: "Age <i>(days)</i>",
                },
                labels: {
                  formatter: function () {
                    return this.value / 24;
                  },
                },
                linkedTo: 0, // this secondary axis just re-displays the primary (0) axis in a different format
                opposite: true,
              },
            ],
        yAxis: {
          title: {
            text: "Total serum bilirubin (mg/dL)",
          },
          plotLines: [
            {
              value: 0,
              width: 1,
              color: "gray",
            },
          ],
          floor: 0,
          // max: 25
          // ceiling: 25,
        },
        legend: {
          layout: "vertical",
          align: "right",
          enabled: this.displayLegend,
          verticalAlign: "middle",
          borderWidth: 0,
          useHTML: false,
          itemStyle: {
            fontSize: "11px",
            fontWeight: "medium",
          },
          itemHoverStyle: {
            color: "DarkGray",
          },
        },
        tooltip: {
          useHTML: true,
          // headerFormat:'Header<br/>',
          // pointFormat: '{point.y} @ {point.x}',
          // footerFormat: 'Footer',
          opacity: 0.9,
          crosshairs: true,
          hideDelay: 400, // default is 500 ms until the tooltip fades
          snap: 15, // proximity snap, default 10
          // enabled: enableToolTips,
          formatter: function () {
            // return this.series.name;
            return this.point.customTooltip;
          },
        },

        plotOptions: {
          animation: true,
          series: {
            allowPointSelect: false,
            enableMouseTracking: false,
            fillOpacity: 0.6,
            lineWidth: 0,
            marker: {
              enabled: false,
            },
            stickyTracking: false,
          },
        },
        title: {
          text: title,
        },
        credits: {
          enabled: false,
        },
        series: series,
      };
      console.log("Returning from getChartOptions with ", chartOptions);
      return chartOptions;
    },


    getRiskZoneSeries() {
      const pairs = {
        High: "HighIntermediate",
        HighIntermediate: "LowIntermediate",
        LowIntermediate: "Low",
        Low: "Undefined",
      };
      let riskZoneSeries = [];
      console.log("getRiskZoneSeries")
      for (var zone in RISKZONEPROPS) {
        var props = RISKZONEPROPS[zone];

        if (!props.nograph) {
          riskZoneSeries.push(
              extend({}, props, {
                id: zone,
                animation: false,
                visible: true,
                data: addXCoordinatesWithRange(
                    riskZone.getSeriesByName(pairs[zone]),
                    riskZone.getSeriesByName(zone),
                    riskZone.interval,
                    riskZone.startsAt
                ),
              })
          );
          // console.log(`Pushed ${Object.keys(series[0])}`); // name,,abbreviation,color,id,data
          // console.log(`Zone ${zone} ${riskZone.getSeriesByName(pairs[zone])} || ${riskZone.getSeriesByName(zone)}`); // - Pushed  ${series[zone].name} ${series[zone].abbreviation} ${series[zone].id} ${series[zone].color} ${series[zone].data}`)
        }
      }
      return riskZoneSeries;
    },

    getTreatmentZoneSeriesPremie() {
      const pairs = {
        Transfusion: "TransfusionRisk",
        TransfusionRisk: "Phototherapy",
        Phototherapy: "PhototherapyRisk",
        PhototherapyRisk: "Low",
      };
      console.log("getTreatmentZoneSeries")
      let treatmentZoneSeriesPremie = [];
      for (let zone in TREATMENTZONEPREMIEPROPS) {
        console.log(`getTreatmentZoneSeriesPremie: Handling ${zone}`);
        let props = TREATMENTZONEPREMIEPROPS[zone];

        if (!props.nograph) {
          treatmentZoneSeriesPremie.push(
              extend({}, props, {
                id: zone,
                visible: true, // (txThresholdSelection == 'premie'),
                data: addXCoordinatesWithRange(
                    treatmentZonePremie.getSeriesByName(pairs[zone]),
                    treatmentZonePremie.getSeriesByName(zone),
                    treatmentZonePremie.interval,
                    treatmentZonePremie.minimumGA
                ),
              })
          );
          // console.log(`Pushed ${Object.keys(series[0])}`); // name,,abbreviation,color,id,data
          // console.log(`Zone ${zone} ${riskZone.getSeriesByName(pairs[zone])} || ${riskZone.getSeriesByName(zone)}`); // - Pushed  ${series[zone].name} ${series[zone].abbreviation} ${series[zone].id} ${series[zone].color} ${series[zone].data}`)
        }
      }
      return treatmentZoneSeriesPremie;

    },

    getResultSeriesTerm() {
      return [
        extend({}, BILICURVEPROPS, {
          id: "BiliTerm",
          // name: 'ResultSeriesTerm',
          data: this.makeDataPoints(this.$store.getters.patient, 'aap'), // this.resultsSeriesTermData, // makePoints(infant, getTooltipText),
          marker: {
            enabled: true,
            states: {
              select: {
                enabled: true,
                radius: 5
              }
            }
          },

          allowPointSelect: false,
          enableMouseTracking: true,
        }),
      ];
    },

    getResultSeriesNCNC() {
      return [
        extend({}, BILICURVEPROPS, {
          id: "BiliNCNC",
          // name: 'ResultSeriesTerm',
          data: this.makeDataPoints(this.$store.getters.patient, 'ncnc'), // this.resultsSeriesNCNCData, // makePoints(infant, getTooltipText),
          marker: {
            enabled: true,
          },

          allowPointSelect: false,
          enableMouseTracking: true,
        }),
      ];
    },

    getResultSeriesPremie() {
      return [
        extend({}, BILICURVEPROPS, {
          id: "BiliPremie",
          // name: 'ResultSeriesPremie',

          data: this.makeDataPoints(this.$store.getters.patient, 'premie'), // this.resultsSeriesPremieData, // makePoints(infant, getTooltipText),
          marker: {
            enabled: true,
          },

          allowPointSelect: false,
          enableMouseTracking: true,
        }),
      ];
    },

    // In order to correct overlapping phototherapy plotbands we need to process these in ascending time order
    sortPhototherapy(phototherapy) {

      phototherapy.sort(function (a, b) {
        if (a.startTime < b.startTime) return -1;
        if (a.startTime > b.startTime) return 1;
        return 0;
      });

      return phototherapy;
    },

    // Shows the equivalent of plotbands to illustrate when phototherapy was used
    // We don't use plotbands because those don't allow tooltips (as of Highcharts 9)
    getPhototherapySeries(curve) {
      let series = [];
      let phototherapy = store.getters.patient.phototherapy;
      const birthDateTime = this.$store.getters.patient.birthDateTime;
      let width, ageHours, ageHoursNext;


      if (phototherapy) {
        phototherapy = this.sortPhototherapy(phototherapy); // Sorting to smooth out overlaps
        console.log(`Processsing phototherapy plotband for curve ${curve}:`, phototherapy)
        for (let i = 0; i < phototherapy.length; i++) {
          width = phototherapy[i].duration;

          if (i + 1 < phototherapy.length) {  // If there's a next band avoid overlaps by
                                              // trimming the width of the band to the next start time
            ageHours = differenceInHours(phototherapy[i].startTime, birthDateTime);
            ageHoursNext = differenceInHours(phototherapy[i + 1].startTime, birthDateTime);

            if (ageHours + width > ageHoursNext) {
              width = ageHoursNext - ageHours;
            }
          }
          series.push(
              extend({}, PHOTOTHERAPYBANDPROPS, {
                data: this.makePhototherapyBand(phototherapy[i], curve, width),
                id: `phototherapy-band-${curve}-${i}`,
                linkedTo: i > 0 ? ':previous' : null, //  `phototherapy-band-${i-1}`: '',
                tooltip: {
                  useHTML: false,
                  followPointer: false,
                  opacity: 0.9,
                  hideDelay: 300, // default is 500 ms until the tooltip fades
                  snap: 100, // proximity snap, default 10
                  // enabled: enableToolTips,
                  // pointFormat: '<b>Phototherapy</b> @ {point.x}<br/>' + phototherapy[i].tooltip,

                },
                allowPointSelect: false,
                enableMouseTracking: true,
              })
          )
        }
      }

      console.log(`Returning phototherapySeries for curve ${curve}`, series)
      return series;
    },


    getTreatmentZoneSeries() {
      let series = [];
      const zoneTypes = [
        {
          name: "transfusion",
          inZone: function () {
            // return infant.inTreatmentZoneTransfusion();
            // console.log(`Transfusion zone exceeded: ${treatmentZoneExceeded.transfusion}`);
            return this.transfusiontherapyVisible;
          },
        },
        {
          name: "phototherapy",
          inZone: function () {
            // return infant.inTreatmentZonePhoto();
            console.log(`Photo zone exceeded? ${this.phototherapyVisible}`);

            return this.phototherapyVisible;
          },
        },
      ];

      for (let i = 0; i < zoneTypes.length; i++) {
        const zoneType = zoneTypes[i].name;
        // alert("Zone type: " + zoneTypes[i].name + zoneTypes[i].inZone())
        for (let zone in TREATMENTZONEPROPS[zoneType]) {
          const props = TREATMENTZONEPROPS[zoneType][zone];
          console.log(`Setting up treatmentZone series ${zoneType} ${zone}`);
          series.push(
              extend({}, props, {
                // id: zoneType + zone,
                // visible:zoneTypes[i].inZone(),
                visible: zoneTypes[i].inZone(), // zoneType === 'transfusion' ? this.transfusionTherapyVisible.aap : this.phototherapyVisible.aap,
                // zoneTypes[i].inZone() === true, //  && (txThresholdSelection != 'premie')),

                data: addXCoordinates(
                    this.treatmentZone.getSeriesByName(zoneType, zone),
                    this.treatmentZone.interval,
                    this.treatmentZone.startsAt
                ),
              })
          );
          // console.log(`Zone ${zone} ${treatmentZone.getSeriesByName(zoneType, zone)} `); // - Pushed  ${series[zone].name} ${series[zone].abbreviation} ${series[zone].id} ${series[zone].color} ${series[zone].data}`)
          // console.log(`Props: ${props.color}`);
        }
      }
      console.log(`Set up treatmentZone series:`, series);

      return series;
    },

    getTreatmentZoneSeriesNCNC(birthGA) {
      let series = [];
      const zoneTypes = [
        {
          name: "transfusion",
          inZone: function () {
            // return infant.inTreatmentZoneTransfusion();
            // console.log(`Transfusion zone exceeded: ${treatmentZoneExceeded.transfusion}`);
            return this.transfusiontherapyVisible;
          },
        },
        {
          name: "phototherapy",
          inZone: function () {
            // return infant.inTreatmentZonePhoto();
            // console.log(`Photo zone exceeded: ${treatmentZoneExceeded.transfusion}`);

            return this.phototherapyVisible;
          },
        },
      ];

      // console.log("In getTreamentZoneSeriesNCNC");

      // These series are set up from quadratic equations, not literal data points
      this.treatmentZoneNCNC.setupPhototherapySeriesData();
      this.treatmentZoneNCNC.setupTransfusionSeriesData();

      for (let i = 0; i < zoneTypes.length; i++) {
        let zoneType = zoneTypes[i].name;
        console.log("NCNC zone type: " + zoneType);
        for (let zone in this.TREATMENTZONEPROPSNCNC[zoneType]) {
          // console.log(`NCNC thresholds, type ${zoneType}, zone ${zone}, linkedTo ${props.linkedTo}`)

          let props = this.TREATMENTZONEPROPSNCNC[zoneType][zone];
          let name = props.name + "";
          // var birthGA = patient.rawBirthGA;
          name = name.replace(
              "{birthGA}",
              " @ " + this.gaInWeeks(birthGA)
          );

          series.push(
              extend({}, props, {
                // id: zoneType + zone,
                visible: zoneTypes[i].inZone(),
                // name: props.namePrefix + ' - ' + patient.rawBirthGA + ' GA infants',
                // name: name.replace(/\{rawBirthGA\}/gi, patient.rawBirthGA + ' weeks GA'),
                name: name,
                // visible: zoneType === 'transfusion' ? this.transfusionTherapyVisible.ncnc : this.phototherapyVisible.ncnc,

                // zoneTypes[i].inZone() === true, //  && (txThresholdSelection != 'premie')),

                data: addXCoordinates(
                    this.treatmentZoneNCNC.getSeriesByName(zoneType, zone),
                    this.treatmentZoneNCNC.interval,
                    this.treatmentZoneNCNC.startsAt
                ),
              })
          );
          // console.log(`Zone ${zone} ${treatmentZone.getSeriesByName(zoneType, zone)} `); // - Pushed  ${series[zone].name} ${series[zone].abbreviation} ${series[zone].id} ${series[zone].color} ${series[zone].data}`)
          // console.log(`Props: ${props.color}`);
        }
      }

      return series;
    },


    // Given a threshold (e.g., aap, ncnc, or premie) and a bunch of results, return an array of datapoints with
    // hoverable decorations, for inclusion in a resultsSeries
    //
    // TODO: makeDataPoints is too long and needs to be modularized
    makeDataPoints(patient, thresholdSelection) {

      // const patient = store.getters.patient;
      const birthDateTime = patient.birthDateTime; // Date.parse(patient.birthDay + ' ' + patient.birthTime);
      let results = patient.results;
      // We'll plot an empty graph if there are no data points (we just need the for loop to see results.length === 0)
      if (!results) {
        results = [];
      }

      let ageHours, ageDays, ageWeeks, level, method, drawtime;

      // We handle all cases (treatment zone types, premies) here and display different versions depending on txSelection mode
      // let thresholdExceeded; // Was any threshold for treatment exceeded? If so, show the warning (once)
      let treatmentZoneExceeded; // Which threshold was exceeded?
      let treatmentZoneWithin2; // Are we within 2 mg/dL of a treatment zone?
      // Show the toxicity warning just once
      // the module keeps the state as a private variable
      let riskZonePlacement = ''; // Bhutani risk zone

      let markerShape;
      let youngKidWarning = "";
      if (patient.birthGA < 38 * 7 && thresholdSelection === "aap") {
        youngKidWarning = " infants 35w-37w6d GA";
      }
      const sickKidWarning = this.$store.getters.riskFactorsDescription[thresholdSelection];
          //
          // thresholdSelection === "ncnc" ?
          //     // riskFactorsDescriptionAAP : riskFactorsDescriptionNCNC;
          //     'isoimmune disease, G6PD deficiency or other hemolysis, sepsis/suspected sepsis (on abx),<br/>acidosis (BE ≤ 8 or pCO2 > 50 within last 24h, albumin < 3, any clinical instability)' :
          //     'isoimmune disease, G6PD deficiency,<br/>asphyxia, lethargy, temp instability, sepsis, acidosis, albumin < 3.0 g/dL, if measured'


      let resultsSeriesData = [];
      console.log(`Making data points for threshold ${thresholdSelection} and results`, results);

      // for (var i = results.sortedResults.length - 1; i >= 0; i--) {




      for (let i = 0; i <= results.length - 1; i++) {
        drawtime = results[i].drawtime;

        // Age is in hours for 35 weeks+, but in postmenstrual age in days prior to 35 weeks
        ageHours = ((drawtime - birthDateTime) / 3600000).toFixed(1);
        ageDays = ((drawtime - birthDateTime) / 86400000 + patient.birthGA).toFixed(1); // Postmenstrual age in days, not age in days since birth
        ageWeeks = (drawtime - birthDateTime) / 604800000 + (patient.birthGA / 7); // Postmenstrual age in weeks
        ageWeeks =
            Math.floor(ageWeeks) +
            " " +
            ((ageWeeks - Math.floor(ageWeeks)) * 7).toFixed(0) +
            "/7";

        level = results[i].level;
        method = results[i].method;

        // console.log(`Chart.vue makeDataPoints ageHours${ageHours}, ageDays: ${ageDays}`);

        switch (thresholdSelection) {
          case 'aap':
            treatmentZoneExceeded = this.treatmentZone.exceeds(ageHours, patient.birthGA, level);
            riskZonePlacement = riskZone.exceeds(ageHours, level);
            break;
          case 'ncnc':
            treatmentZoneExceeded = this.treatmentZoneNCNC.exceeds(ageHours, patient.birthGA, level);
            treatmentZoneWithin2 = this.treatmentZoneNCNC.exceeds(ageHours, patient.birthGA, level + 2);
            riskZonePlacement = riskZone.exceeds(ageHours, level);
            break;
          case 'premie':
            treatmentZoneExceeded = treatmentZonePremie.exceeds(ageDays, patient.birthGA, level);
            break;
        }

        // console.log(`Treatment zone exceeded at ${hours} hours: photo ${treatmentZoneExceeded.phototherapy}, transfusion ${treatmentZoneExceeded.transfusion}`);

        // console.log("Neurotox risk factors started with: " + neurotoxRiskFactors)

        switch (method) {
          case "serum":
            markerShape = MARKERS.serum; // "circle";
            break;
          case "POC":
            markerShape = MARKERS.POC; // "diamond";
            break;
          case "transcut":
            markerShape = MARKERS.TC; // "square";
            break;
        }
        // Make a new object for each data point
        // The data labels for each point are hidden to start
        // console.log(`Making data point: ${ageDays} - ${ageHours} - ${ageWeeks}`);
        let dataPoint = {
          x: thresholdSelection === 'premie' ? ageDays : ageHours,
          xWeeks: ageWeeks,
          xHours: ageHours,
          y: level,
          drawtime: drawtime,
          method: method,
          riskZonePlacement: riskZonePlacement,
          treatmentZoneExceeded: [],
          treatmentZoneWithin2: [],
          followup: {
            noRisk: "",
            withRisk: "",
          },
          marker: {
            enabled: true,
            lineWidth: 1,
            lineColor: "black",
            fillColor: "black",
            symbol: markerShape,
          },
          dataLabels: {
            backgroundColor: "green",
            borderColor: "black",
            align: "right",
            x: -5,
            y: -6,
            enabled: false,
            neuroToxOnly: false,
            formatter: function () {
              // if (treatmentZoneExceeded.phototherapy >=0 || treatmentZoneExceeded.transfusion >=0) {
              //     return this.y + " (low risk)"
              // }
            },
          },
        };

        // Default datapoint tooltip which may not be in any risk zone
        decorateDataPoint(dataPoint, ageHours, level, method, MARKERCOLORS.riskUndefined, 'Undefined');

        // Given a Bhutani risk zone placement, decorate the datapoint and tooltip, and add detail to the table row
        // Bhutani risk zones note used for Premie Bilirecs
        if (thresholdSelection !== 'premie') {
          switch (riskZonePlacement) {
            case riskZone.seriesMap.Low:
              decorateDataPoint(dataPoint, ageHours, level, method, MARKERCOLORS.riskLow, "Low");
              dataPoint.followup = followupRecommendation("Low", patient.birthGA);
              break;

            case riskZone.seriesMap.LowIntermediate:
              decorateDataPoint(
                  dataPoint,
                  ageHours,
                  level,
                  method,
                  MARKERCOLORS.riskLowIntermediate,
                  "Low-intermediate"
              );

              dataPoint.followup = followupRecommendation(
                  "Low-intermediate", patient.birthGA
              );
              break;

            case riskZone.seriesMap.HighIntermediate:
              decorateDataPoint(
                  dataPoint,
                  ageHours,
                  level,
                  method,
                  MARKERCOLORS.riskHighIntermediate,
                  "High-intermediate"
              );

              dataPoint.followup = followupRecommendation(
                  "High-intermediate", patient.birthGA
              );
              break;

            case riskZone.seriesMap.High:
              decorateDataPoint(dataPoint, ageHours, level, method, MARKERCOLORS.riskHigh, "High");
              dataPoint.followup = followupRecommendation("High", patient.birthGA);
              break;
          }
        }

        // If GA is 38+ weeks and the baby is well, the treatment threshold is the highest (low risk) line
        // If the GA is 38+ weeks and baby is sick, or 35-37w6d and the baby is well, it's the medium line
        // If the GA is 35-37w6d and sick, it's the low line (high risk)
        // First handle infants exceeding a phototherapy threshold
        // console.log(`Making datapoints with neurotoxRiskfactors ${neurotoxRiskFactors}, youngKidWarning ${youngKidWarning}`);
        // console.log(`Tx threshold selection: ${txThresholdSelection}`);

        // Premies (used when txThresholdSelection == 'premie')

        // console.log(`Premie tooltip, treatment zone: ${treatmentZoneExceeded}`);
        // console.log(`tzPremieSeries.PhototherapyRisk: ${(TREATMENTZONEPREMIEPROPS.PhototherapyRisk.color)}`)

        if (thresholdSelection === 'aap') {
          // AAP (non-premie)
          switch (treatmentZoneExceeded.phototherapy) {
              // Make this blue in all cases of young kids, but it only counts for kids with neurotox risk factors; they
              // will get the label too
            case this.treatmentZone.seriesMap.High:
              //if (youngKidWarning) {
              // If we are 38+ weeks, we should never hit this case
              // redecorateDataPointForTreatment(dataPoint, 5, "phototherapy");
              this.phototherapyVisible.aap = !!youngKidWarning // ? true : false;
              dataPoint.marker.fillColor = this.treatmentZone.phototherapylineColor;
              // dataPoint.marker.radius = 5;

              dataPoint.customTooltip +=
                  '<br><span style="color: ' +
                  this.treatmentZone.phototherapylineColor +
                  ';"> &#9673; </span>Exceeds phototherapy threshold for ' +
                  youngKidWarning +
                  " who also have " +
                  sickKidWarning;
              dataPoint.treatmentZoneExceeded.push({
                message: "Exceeds phototherapy threshold for certain patients: ",
                youngAndSickKids: true,
              });

              dataPoint.dataLabels = makeLabel(
                  "phototherapy",
                  level,
                  this.treatmentZone.phototherapylineColor,
                  false,
                  youngKidWarning
              );
              // }
              break;
            case this.treatmentZone.seriesMap.Medium:
              // Make the marker blue for everyone just in case there are risk facotrs, but enabled the label only if there are risk factors or its a young kid
              // eslint-disable-next-line no-constant-condition
              //if (neurotoxRiskFactors || youngKidWarning || true) {
              this.phototherapyVisible.aap = true;
              dataPoint.marker.fillColor = this.treatmentZone.phototherapylineColor;
              // dataPoint.marker.radius = 5;

              dataPoint.customTooltip +=
                  '<br><span style="color: ' +
                  this.treatmentZone.phototherapylineColor +
                  ';"> &#9673; </span>Exceeds phototherapy threshold for 35-37w6d healthy, or<br/>38w+ GA infants with ' +
                  sickKidWarning;
              dataPoint.treatmentZoneExceeded.push({
                message:
                    "Exceeds phototherapy threshold for patients with either of: ",
                youngKids: true,
                sickKids: true,
              });
              dataPoint.dataLabels = makeLabel(
                  "phototherapy",
                  level,
                  this.treatmentZone.phototherapylineColor,
                  youngKidWarning,
                  !youngKidWarning
              );
              // console.log(`Medium phototherapy zone exceeded, level ${level}, hours ${hours}`)
              // }
              break;
            case this.treatmentZone.seriesMap.Low:
              dataPoint.marker.fillColor = this.treatmentZone.phototherapylineColor;
              this.phototherapyVisible.aap = true;
              // dataPoint.marker.radius = 5;
              dataPoint.customTooltip +=
                  '<br><span style="color: ' +
                  this.treatmentZone.phototherapylineColor +
                  ';"> &#9673; </span>Exceeds phototherapy threshold for 38+ infants who are well';
              dataPoint.treatmentZoneExceeded.push({
                message: "Exceeds phototherapy threshold",
              });
              dataPoint.dataLabels = makeLabel(
                  "phototherapy",
                  level,
                  this.treatmentZone.phototherapylineColor,
                  true,
                  false
              );
              break;
          }

          // Then handle the case of infants exceeding the exchange transfusion threshold (one kid may exceed both)

          switch (treatmentZoneExceeded.transfusion) {
            case this.treatmentZone.seriesMap.High:
              //if (youngKidWarning) {
              this.transfusionTherapyVisible.aap = true;
              dataPoint.marker.fillColor = this.treatmentZone.transfusionLineColor;
              dataPoint.marker.radius = 6;

              dataPoint.customTooltip +=
                  '<br><span style="color: ' +
                  this.treatmentZone.transfusionLineColor +
                  '"> &#9673; </span>Exceeds transfusion threshold ' +
                  youngKidWarning + " who also have " +
                  sickKidWarning;
              dataPoint.treatmentZoneExceeded.push({
                message: "Exceeds transfusion threshold for certain patients",
                youngAndSickKids: true,
              });
              dataPoint.dataLabels = makeLabel(
                  "transfusion",
                  level,
                  this.treatmentZone.transfusionLineColor,
                  false,
                  youngKidWarning
              );
              // }
              break;
            case this.treatmentZone.seriesMap.Medium:
              // eslint-disable-next-line no-constant-condition
              // if (youngKidWarning || neurotoxRiskFactors || true) {
              this.transfusionTherapyVisible.aap = true;
              dataPoint.marker.fillColor = this.treatmentZone.transfusionLineColor;
              dataPoint.marker.radius = 6;

              dataPoint.customTooltip +=
                  '<br><span style="color: ' +
                  this.treatmentZone.transfusionLineColor +
                  '"> &#9673; </span>Exceeds transfusion threshold for 35-37w6d healthy, or 38w+ GA infants with<br/> ' +
                  sickKidWarning;
              dataPoint.treatmentZoneExceeded.push({
                message: "Exceeds transfusion threshold for certain patients",
                youngKids: true,
                sickKids: true,
              });
              dataPoint.dataLabels = makeLabel(
                  "transfusion",
                  level,
                  this.treatmentZone.transfusionLineColor,
                  youngKidWarning,
                  !youngKidWarning
              );
              //}

              break;
            case this.treatmentZone.seriesMap.Low:
              this.transfusionTherapyVisible.aap = true;
              dataPoint.marker.fillColor = this.treatmentZone.transfusionLineColor;
              dataPoint.marker.radius = 6;

              dataPoint.customTooltip +=
                  '<br><span style="color: ' +
                  this.treatmentZone.transfusionLineColor +
                  '"> &#9673; </span>Exceeds transfusion threshold for 38+ GA infants who are well';
              dataPoint.treatmentZoneExceeded.push({
                message: "Exceeds transfusion threshold",
              });
              dataPoint.dataLabels = makeLabel(
                  "transfusion",
                  level,
                  this.treatmentZone.transfusionLineColor,
                  true,
                  false
              );

              break;
          }


        }

        if (thresholdSelection === 'ncnc') {
          // NCNC (non-premie)
          switch (treatmentZoneExceeded.phototherapy) {
              // Make this blue in all cases of young kids, but it only counts for kids with neurotox risk factors; they
              // will get the label too
            case this.treatmentZoneNCNC.seriesMap.Risk:
              this.phototherapyVisible.ncnc = true;
              dataPoint.marker.fillColor = this.treatmentZone.phototherapylineColor;
              // dataPoint.marker.radius = 5;

              dataPoint.customTooltip +=
                  '<br><span style="color: ' +
                  this.treatmentZoneNCNC.phototherapylineColor +
                  ';"> &#9673; </span>Exceeds phototherapy threshold for infants with neurotoxicity risk factors:<br/>'
                  + sickKidWarning;
              dataPoint.treatmentZoneExceeded.push({
                message: "Exceeds phototherapy threshold for certain patients: ",
                sickKids: true,
              });

              dataPoint.dataLabels = makeLabel(
                  "phototherapy",
                  level,
                  this.treatmentZoneNCNC.phototherapylineColor,
                  false,
                  true
              );

              break;

            case this.treatmentZoneNCNC.seriesMap.Well:
              dataPoint.marker.fillColor =
                  this.treatmentZoneNCNC.phototherapylineColor;
              this.phototherapyVisible.ncnc = true;
              // dataPoint.marker.radius = 5;
              dataPoint.customTooltip +=
                  '<br><span style="color: ' +
                  this.treatmentZoneNCNC.phototherapylineColor +
                  ';"> &#9673; </span>Exceeds phototherapy threshold';
              dataPoint.treatmentZoneExceeded.push({
                message: "Exceeds phototherapy threshold",
              });
              dataPoint.dataLabels = makeLabel(
                  "phototherapy",
                  level,
                  this.treatmentZoneNCNC.phototherapylineColor,
                  true,
                  false
              );
              break;
          }

          // Then handle the case of infants exceeding the exchange transfusion threshold (one kid may exceed both)

          switch (treatmentZoneExceeded.transfusion) {
            case this.treatmentZoneNCNC.seriesMap.Risk:
              this.transfusionTherapyVisible.ncnc = true;
              dataPoint.marker.fillColor = this.treatmentZoneNCNC.transfusionLineColor;
              dataPoint.marker.radius = 6;

              dataPoint.customTooltip +=
                  '<br><span style="color: ' +
                  this.treatmentZoneNCNC.transfusionLineColor +
                  '"> &#9673; </span>Exceeds transfusion threshold for infants with neurotoxicity risk factors:<br/>' + sickKidWarning;
              dataPoint.treatmentZoneExceeded.push({
                message: "Exceeds transfusion threshold for certain patients: ",
                sickKids: true,
              });
              dataPoint.dataLabels = makeLabel(
                  "transfusion",
                  level,
                  this.treatmentZone.transfusionLineColor,
                  false,
                  true
              );

              break;

            case this.treatmentZoneNCNC.seriesMap.Well:
              this.transfusionTherapyVisible.ncnc = true;
              dataPoint.marker.fillColor = this.treatmentZone.transfusionLineColor;
              dataPoint.marker.radius = 6;

              dataPoint.customTooltip +=
                  '<br><span style="color: ' +
                  this.treatmentZoneNCNC.transfusionLineColor +
                  '"> &#9673; </span>Exceeds transfusion threshold for 38+ GA infants who are well';
              dataPoint.treatmentZoneExceeded.push({
                message: "Exceeds transfusion threshold",
              });
              dataPoint.dataLabels = makeLabel(
                  "transfusion",
                  level,
                  this.treatmentZoneNCNC.transfusionLineColor,
                  true,
                  false
              );

              break;
          }

          // NCNC suggests:
          // TsB within 1-2 mg below phototherapy threshold:
          //    Optimize feeding, repeat TsB @ 4-24 h, consider phototherapy (including home phototherapy)
          // Initial Bili > 2 mg above threshold = prepare for immediate exchange transfusion
          // Initial Bili 0-2 above threshold = consider exchange transfusion, aggressive medical tx (IV + PO hydration, intensive phototherapy, monitor TsB q2-4h)
          // See flowsheet for any of above - https://phototherapyguidelines.com/flow.jpg

          if (
              treatmentZoneExceeded.transfusion !==
              this.treatmentZoneNCNC.seriesMap.Risk &&
              treatmentZoneExceeded.transfusion !==
              this.treatmentZoneNCNC.seriesMap.Well &&
              (treatmentZoneWithin2.transfusion ===
                  this.treatmentZoneNCNC.seriesMap.Risk ||
                  treatmentZoneWithin2.transfusion ===
                  this.treatmentZoneNCNC.seriesMap.Well)
          ) {
            switch (treatmentZoneWithin2.transfusion) {
              case this.treatmentZoneNCNC.seriesMap.Risk:
                dataPoint.marker.fillColor =
                    this.treatmentZoneNCNC.transfusionLineColorLightened;
                dataPoint.marker.radius = 5;

                dataPoint.customTooltip +=
                    '<br><span style="color: ' +
                    this.treatmentZoneNCNC.transfusionLineColorLightened +
                    '"> &#9673; </span>Within 2 points of transfusion threshold for infants with neurotoxicity risk factors<br/>(See NCNC Help)';
                dataPoint.treatmentZoneExceeded.push({
                  message:
                      "Within 2 points of transfusion threshold (for infant with risk factors; see NCNC Help)",
                });
                dataPoint.dataLabels = makeLabel(
                    "transfusion",
                    level,
                    this.treatmentZoneNCNC.transfusionLineColorLightened,
                    false,
                    true
                );

                break;

              case this.treatmentZoneNCNC.seriesMap.Well:
                dataPoint.marker.fillColor =
                    this.treatmentZoneNCNC.transfusionLineColorLightened;
                dataPoint.marker.radius = 5;

                dataPoint.customTooltip +=
                    '<br><span style="color: ' +
                    this.treatmentZoneNCNC.transfusionLineColorLightened +
                    '"> &#9673; </span>Within 2 points of transfusion threshold for 38+ GA infants who are well (see NCNC Help)';
                dataPoint.treatmentZoneExceeded.push({
                  message: "Within 2 points of transfusion threshold (see NCNC Help)",
                });
                dataPoint.dataLabels = makeLabel(
                    "transfusion",
                    level,
                    this.treatmentZoneNCNC.transfusionLineColorLightened,
                    true,
                    false
                );

                break;
            }
          }

        }


        if (thresholdSelection === 'premie') {
          switch (treatmentZoneExceeded) {
            case treatmentZonePremie.seriesMap.Low:
              // this.phototherapyVisible.premie = false;
              dataPoint.marker.fillColor = "white";
              decorateDataPointPremie(
                  dataPoint,
                  ageHours,
                  ageWeeks,
                  level,
                  method,
                  "black",
                  "Not in treatment zone"
              );

              // console.log("Premie normal tooltip");
              break;
            case treatmentZonePremie.seriesMap.PhototherapyRisk:
              this.phototherapyVisible.premie = true;

              dataPoint.marker.fillColor =
                  TREATMENTZONEPREMIEPROPS.PhototherapyRisk.color;
              dataPoint.dataLabels = makeLabel(
                  "phototherapy",
                  level,
                  this.treatmentZone.phototherapylineColor,
                  true,
                  true
              );
              decorateDataPointPremie(
                  dataPoint,
                  ageHours,
                  ageWeeks,
                  level,
                  method,
                  TREATMENTZONEPREMIEPROPS.PhototherapyRisk.color,
                  "In phototherapy treatment zone for premature newborns with neurotoxicity risk factors:</br>" + sickKidWarning
              );
              dataPoint.treatmentZoneExceeded.push({
                message: 'In phototherapy zone for premature newborns with: ',
                sickKids: true
              })

              break;
            case treatmentZonePremie.seriesMap.Phototherapy:
              this.phototherapyVisible.premie = true;

              dataPoint.marker.fillColor =
                  TREATMENTZONEPREMIEPROPS.Phototherapy.color;
              dataPoint.dataLabels = makeLabel(
                  "phototherapy",
                  level,
                  this.treatmentZone.phototherapylineColor,
                  true,
                  false
              );
              decorateDataPointPremie(
                  dataPoint,
                  ageHours,
                  ageWeeks,
                  level,
                  method,
                  TREATMENTZONEPREMIEPROPS.Phototherapy.color,
                  "In phototherapy zone for all premature newborns 27-35 weeks GAB"
              );
              dataPoint.treatmentZoneExceeded.push({
                message: 'In phototherapy zone for all premature newborns 27-35 weeks GAB'
              })

              break;
            case treatmentZonePremie.seriesMap.TransfusionRisk:
              this.transfusionTherapyVisible.premie = true;

              dataPoint.marker.fillColor =
                  TREATMENTZONEPREMIEPROPS.TransfusionRisk.color;
              dataPoint.dataLabels = makeLabel(
                  "transfusion",
                  level,
                  this.treatmentZone.transfusionLineColor,
                  true,
                  false
              );
              decorateDataPointPremie(
                  dataPoint,
                  ageHours,
                  ageWeeks,
                  level,
                  method,
                  TREATMENTZONEPREMIEPROPS.TransfusionRisk.color,
                  "In exchange transfusion treatment zone for premature newborns with neurotoxicity risk factors:</br>" + sickKidWarning
              );
              dataPoint.treatmentZoneExceeded.push({
                message: 'In exchange transfusion zone for premature newborns with: ',
                sickKids: true
              })
              break;
            case treatmentZonePremie.seriesMap.Transfusion:
              this.transfusionTherapyVisible.premie = true;

              dataPoint.marker.fillColor = TREATMENTZONEPREMIEPROPS.Transfusion.color;
              dataPoint.dataLabels = makeLabel(
                  "transfusion",
                  level,
                  this.treatmentZone.transfusionLineColor,
                  true,
                  false
              );
              decorateDataPointPremie(
                  dataPoint,
                  ageHours,
                  ageWeeks,
                  level,
                  method,
                  TREATMENTZONEPREMIEPROPS.Transfusion.color,
                  "In exchange transfusion treatment zone for all premature newborns 27-35 weeks GAB"
              );
              dataPoint.treatmentZoneExceeded.push({
                message: 'In exchange transfusion zone for all premature newborns 27-35 weeks GAB'
              })
              break;
          }
        }
        // console.log("Leaving makePointsPremie riskZonePlacement with: " + dataPoint.followup.noRisk + ">> " + dataPoint.followup.withRisk);
        // console.log(`Data point ${i}, drawtime ${drawtime} @ age ${ageHours} hours; risk zone ${riskZonePlacement}, method ${method}. Datapoint`, dataPoint)
        dataPoint.customTooltip += '</span>';
        resultsSeriesData.push(dataPoint);
      }
      // console.log(`Made data points for threshold ${thresholdSelection}`, resultsSeriesData);

      console.log("Chart.vue: in makeDataPoints, adding warnings");
      if (thresholdSelection === 'aap' && (patient.birthGA >= this.treatmentZone.minimumGA)
          && (this.phototherapyVisible.aap || this.transfusionTherapyVisible.aap)) {

        if (!this.warnings.find(w => w.id === 'treatmentWarningAAP')) {

          this.warnings.push({
            message: `<strong>This patient may qualify for treatment</strong> <i>(per AAP guidelines)</i>.
                <br/><br/>
                Risk zones and follow-up recommendations are intended for infants who haven't been treated,
                so note the AAP recommendations for infants who receive phototherapy:
                <ul>
                <li>Discontinue phototherapy when serum bilirubin falls below 13-14 mg/dL for infants who are readmitted;</li>
                <li>If phototherapy is used for infants with hemolysis, or discontinued before 3-4 days of age,
                a follow-up bilirubin measurement is recommended within 24 hours after discharge;</li>
                <li>For infants readmitted with hyperbilirubinemia, though rebound is rare, repeat serum bilirubin measurement or clinical
                follow-up 24 hours after discharge is an option.</li>
                </ul>
                <br/>
                <b>Does this patient have any neurotoxicity risk factors?</b>
                    (Includes isoimmune disease, G6PD deficiency, asphyxia, lethargy, temp instability, sepsis, albumin &lt; 3.0 g/dL, if measured.)

`,
            level: "warning",
            textColor: "black",
            dismissable: true,
            thresholdSelection: 'aap',
            id: 'treatmentWarningAAP',
            enterable: "neurotoxRiskFactors",
            viewed: false
          });
        }
      }
      if (thresholdSelection === 'ncnc' && (patient.birthGA >= this.treatmentZoneNCNC.minimumGA)
          && (this.phototherapyVisible.ncnc || this.transfusionTherapyVisible.ncnc)) {
        console.log(`Adding NCNC threshold warning`)

        if (!this.warnings.find(w => w.id === 'treatmentWarningNCNC')) {
          this.warnings.push({
            message: `<strong>This patient may qualify for treatment</strong> <i>(per NCNC guidelines)</i>.
                <br/><br/>
                <ul>
                <li> Discontinue phototherapy when TsB is at least 2-3 mg/dL below the phototherapy initial threshold
                <li> Longer courses of phototherapy may be indicated for ongoing feeding difficulties,
                    &lt; 37 weeks GA, slow rate of decrease while on phototherapy, hemolytic jaundice
                </ul>
                <br/>
                Do they have any neurotoxicity risk factors?
                    (Hover over Neurotoxicity slider to the right to see NCNC neurotoxicity risk factors.)</q-tooltip>`,
            level: "warning",
            textColor: "black",
            enterable: "neurotoxRiskFactors",
            id: "treatmentWarningNCNC",
            thresholdSelection: 'ncnc',
            dismissable: true,
            viewed: false
          });
        }
      }

      if (!this.warnings.find(w => w.id === 'treatmentWarningPremie')) {

        if (
            patient.birthGA <= treatmentZonePremie.maximumGA &&
            patient.birthGA >= treatmentZonePremie.minimumGA &&
            (this.phototherapyVisible.premie || this.transfusionTherapyVisible.premie)) {
            // && thresholdSelection === "premie") {

          this.warnings.push({
            message: `<strong>This premature patient may qualify for treatment.</strong> Do they have any neurotoxicity risk factors?
                    <ul>
                        <li>Albumin < 2.5 g/dL</li>
                        <li>Rapidly rising TSB suggesting hemolytic disease</li>
                        <li>Any of the following signs of clinical instability: </li>
                        <ul>
                            <li>Blood pH < 7.15</li>
                            <li>Blood culture-positive sepsis in the last 24 h</li>
                            <li>Apnea and bradycardia requiring CPR (bagging or intubation) during the previous 24 h</li>
                            <li>Hypotension requiring pressor treatment during the previous 24 h</li>
                            <li>Mechanical ventilation at the time of blood sampling</li>
                        </ul>
                    </ul>`,

            level: "warning",
            id: 'treatmentWarningPremie',
            textColor: "black",
            enterable: "neurotoxRiskFactors",
            dismissable: true,
            thresholdSelection: 'premie', // store.state.thresholdSelection,
            viewed: false
          });
        }
      }
      // console.log("Neurotox risk factors out of for loop with: " + neurotoxRiskFactors + " - type: " + typeof neurotoxRiskFactors)
      sortResults(resultsSeriesData)
      console.log(`Returning from makeDataPoints, threshold ${thresholdSelection} with: `, resultsSeriesData);
      return resultsSeriesData;
    },

    // Open up a URL (Epic Active Guidelines won't let you do this with a regular href)
    go(url) {
      AglService.openWindow(url);
    },


    renderChart() {
      const patient = this.$store.getters.patient;
      let anyExcuses = false; // Looking for any reason not to render the graph yet (such as no birth time)

      // birthTime = patient.birthTime || birthTime;
      // patient.birthDateTime = Date.parse(patient.birthDay + ' ' + birthTime || this.birthTime);

      // if (this.results) {
      //   console.log("Bili results in render: ", this.results);
      // }

      console.log("renderChart: patient ", patient);
      // if (this.$store.getters.patient.results) { // (!store.getters.mock) {
      //   this.results = this.$store.getters.patient.results
      // } else { // This branch is for testing only
      //   this.results = getBiliResultsForTesting(this.$store.getters.patient, this.results);
      // }
      // results = this.biliResults();

      console.log("renderChart: bilis ", this.results);
      // console.log("resultSeriesTerm: ", resultsSeriesTerm)

      const resultSeriesIndex = this.chartOptions[this.thresholdSelection].series.length - 1;
      const lastDataIndex = this.chartOptions[this.thresholdSelection].series[resultSeriesIndex].data.length - 1;
      const maiselsCGA = this.chartOptions[this.thresholdSelection].series[resultSeriesIndex].data[lastDataIndex].xWeeks;
      const maiselsLevel = this.chartOptions[this.thresholdSelection].series[resultSeriesIndex].data[lastDataIndex].y;

      // Set the visibility of the treatment curves (they should show up if any corresponding threshold is crossed)
      // AAP ID's: TransfusionHigh/Medium/Low, PhototherapyHigh/Medium/Low
      // NCNC ID's: TransfusionWellNCNC, TransfusionRiskNCNC, PhototherapyWellNCNC, PhototherapyRiskNCNC
      for (let curve of ['aap', 'ncnc']) {
        for (let series of this.chartOptions[curve].series) {
          // console.log(`Checking series ID ${series.id}`)
          if (series.id.includes('transfusion')) {
            series.visible = this.transfusionTherapyVisible[curve]
          } else if (series.id.includes('phototherapy') && !series.id.includes('band')) {
            console.log(`renderChart: setting ${curve} photoTherapy visibility to: `, this.phototherapyVisible[curve])
            series.visible = this.phototherapyVisible[curve]
          }
        }
      }

      // This starts off as false (no need ot display labels for kids with risk factors) but if we update the birth time it might be true
      this.updateNeurotoxRiskFactorsLabels(this.neurotoxRiskFactors)

      if (patient.birthGA < treatmentZonePremie.maximumGA) {
        store.commit('changeThresholdSelection', "premie");

        if (patient.birthGA < treatmentZonePremie.minimumGA &&
            !this.warnings.find(w => w.id === 'tooYoungforPremie')) {

          this.warnings.push({
            message: `
        The Premie Bilirecs nomogram only defines treatment zones for newborns between
                            ${treatmentZonePremie.minimumGA / 7} and
                            ${treatmentZonePremie.maximumGA / 7} weeks gestational age.

        This patient's gestational age of ${this.gestationalAgeInWeeks()} weeks is younger than what's defined
                    on this nomogram.
                    <br/><br/>
                    Treatment guidelines you see here may not be valid. Consider using the Maisels table (see references, and the button to the right).

                        Or, see ` + "<a href='#' @click='go(https://www.uptodate.com/contents/unconjugated-hyperbilirubinemia-in-the-preterm-infant-less-than-35-weeks-gestation)'>" +
                        "Hyperbilirubinemia in the preterm infant</a> for alternative thresholds and guidelines.",
            textColor: "black",
            level: "warning",
            id: "tooYoungforPremie",
            dismissable: true,
            infoPopup: `
                            <table class="striped">
                            <thead>
                            <tr style="background-color: #ffe4b5;">
                                <th>GA (weeks)</th> <th>Initial phototherapy (TSB mg/dL)</th> <th>Exchange transfusion</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr><td>&lt; 28w0d</td> <td class="center-align">5-6</td> <td class="center-align">11-14</td>   </tr>
                            <tr><td class="right-align">28-29w6d</td> <td class="center-align">6-8</td> <td class="center-align">12-14</td></tr>
                            <tr><td class="right-align">30-31w6d</td> <td class="center-align">8-10</td> <td class="center-align">13-16</td></tr>
                            <tr><td class="right-align">32-33w6d</td> <td class="center-align">10-12</td> <td class="center-align">15-18</td></tr>
                            <tr><td class="right-align">34-34w6d</td> <td class="center-align">12-14</td> <td class="center-align">17-19</td></tr>
                            </tbody>
                            </table>
                            <br/>
                            <hr>
                            Most recent result:<br/>
                            &nbsp;&nbsp;<strong>` + maiselsCGA + '</strong> weeks GA &mdash; <strong>' + maiselsLevel + `</strong> mg/dL.
                            <hr>
                            <br/>
                            Use the lower end of the range for infants at greater risk for toxicity (lower GA, albumin &lt; 2.5,
                            rapidly rising TSB c/w hemolytic disease, clinical instability).

                            `,
            infoTitle: "Maisels table",
            thresholdSelection: store.state.thresholdSelection,
            viewed: false
          });
        }
      } else // Invalid weight at 35-36wGA
        if (patient.birthWeight < 2.5 && (patient.birthGA >= 35 * 7) && (patient.birthGA < 36 * 7) &&
            !this.warnings.find(w => w.id === 'invalidWeight35')) {

          this.warnings.push({
            level: "info",
            dismissable: true, // InvalidWeight35
            message: `This patient's gestational age of ${this.gestationalAgeInWeeks()} weeks and weight of ${this.$store.getters.patient.birthWeight} kg is not defined on the Bhutani nomogram.
                            Risk is only defined for patients in this age range (35-36 weeks) with a birth weight of &ge; 2.5 kg.`,

            textColor: "black",
            viewed: false,
            id: "invalidWeight35",
            thresholdSelection: 'aap'
            // linkButton: {
            //     text: "Hyperbilirubinemia article",
            //     link: 'https://www.uptodate.com/contents/unconjugated-hyperbilirubinemia-in-the-preterm-infant-less-than-35-weeks-gestation'
            // },
          });
        } else if (patient.birthWeight < 2.0 && (patient.birthGA >= 36 * 7) &&
            !this.warnings.find(w => w.id === 'invalidWeight36')) {

          this.warnings.push({
            // Invalid weight at 36 weeks
            message: `The Bhutani nomogram risk zones are valid only for newborns GA 36+ weeks with a birth weight of &ge; 2 kg.
                            <br/><br/>
                            This patient has a gestational age of ${this.gestationalAgeInWeeks()} weeks,
                            but a birth weight of only ${patient.birthWeight} kg.`,
            textColor: "black",
            level: "info",
            id: "invalidWeight36",
            dismissable: true,
            viewed: false,
            thresholdSelect: 'aap'
          });

      }

      if (patient.birthGA < 35 * 7 &&
          !this.warnings.find(w => w.id === 'tooYoungAAP')) {

        this.warnings.push({
          message: `This ${this.gestationalAgeInWeeks()} infant is younger than what is defined
           on the Bhutani nomogram and AAP 2004 thresholds. Consider switching to
           Premie Bilirecs (using the graph icon on the right).`,
          textColor: "black",
          level: "info",
          id: "tooYoungAAP",
          dismissable: true,
          viewed: false,
          thresholdSelection: 'aap'
        });

        this.warnings.push({
          message: `This ${this.gestationalAgeInWeeks()} infant is younger than what is defined
           on the Bhutani nomogram and NCNC thresholds. Consider switching to
           Premie Bilirecs (using the graph icon on the right).`,
          textColor: "black",
          level: "info",
          dismissable: true,
          viewed: false,
          thresholdSelection: 'ncnc'
        });
      }


      if ((patient.birthWeight < 0.5 || !patient.birthWeight) &&
          !this.warnings.find(w => w.id === 'invalidWeight')) {

        this.warnings.push({
          message: `The birth weight, ${patient.birthWeight} kg, doesn't seem valid. That will make it difficult
            to give accurate guidance (such as from the Bhutani nomogram) that depends on birth weight.`,
          level: "warning",
          textColor: "black",
          dismissable: true,
          id: "invalidWeight"
        });
        anyExcuses = true;
      }

      if ((patient.birthGA < 20 || !patient.birthGA) &&
          !this.warnings.find(w => w.id === 'invalidGA')) {

        this.warnings.push({
          message: `This patient doesn't seem to have a valid gestational age at birth (${patient.birthGA}).
            In Epic you can set this under History > Birth > Gestational Age. Please set this up so we can plot your baby correctly.`,
          level: "warning",
          textColor: "black",
          id: "invalidGA",
          dismissable: false,
        });
        anyExcuses = true;
      }



      if (!anyExcuses) {
        this.chartReady = true;

      }
      // this.results = sortResults(this.results);
      // console.log("Making datapoints");
      // resultsSeriesPremieData = makeDataPointsPremie(results, store.state.neurotoxRiskFactors);
      // makeDataPointsTerm(results, store.state.neurotoxRiskFactors);
      // this.resultsSeriesPremieData = this.makeDataPoints(this.results, 'premie');
      // this.resultsSeriesTermData = this.makeDataPoints(this.results, 'aap');
      // this.resultsSeriesNCNCData = this.makeDataPoints(this.results, 'ncnc');
      // console.log("ResultsSeriesTermData: ", this.resultsSeriesTermData);

      // this.resultsSeriesPremie = this.getResultSeriesPremie();
      // this.resultsSeriesTerm = this.getResultSeriesTerm();
      // this.resultsSeriesNCNC = this.getResultSeriesNCNC();
      // this.treatmentZoneSeries = this.getTreatmentZoneSeries();
      // this.treatmentZoneSeriesNCNC = this.getTreatmentZoneSeriesNCNC();

    },

    getChartOptionsObject(birthGA) {
      console.log("Chart.vue: Returning with chartOptionsObject")
      return {
        aap: this.getChartOptions(
            [].concat(
                this.getRiskZoneSeries(),

                this.getTreatmentZoneSeries(),
                this.getPhototherapySeries('aap'),
                this.getResultSeriesTerm() // this.resultsSeriesTerm

            ),
            "Bhutani nomogram with AAP 2004 treatment thresholds"
        ),
        ncnc: this.getChartOptions(
            [].concat(
                this.getRiskZoneSeries(),
                this.getTreatmentZoneSeriesNCNC(birthGA),
                this.getPhototherapySeries('ncnc'),
                this.getResultSeriesNCNC() // this.resultsSeriesNCNC
            ),
            "Bhutani nomogram with NCNC treatment thresholds"
        ),
        premie: this.getChartOptions(
            [].concat(this.getTreatmentZoneSeriesPremie(),
                this.getPhototherapySeries('premie'),
                this.getResultSeriesPremie() // this.resultsSeriesPremie
            ),
            `Stanford Premie Bilirecs`,
            [
              {
                title: {
                  text: "Postmenstrual age <i>(weeks)</i>",
                },
                tickInterval: 7,
                minorTickInterval: 1,
                // min: Math.floor(patient.birthGA) * 7,
                // max: treatmentZonePremie.maximumGA * 7,
                labels: {
                  formatter: function () {
                    return this.value / 7;
                  },
                },
              },
              {
                title: {text: "Age <i>(days of life)</i>"},
                linkedTo: 0,
                opposite: true,
                labels: {
                  formatter: function () {
                    return (this.value - birthGA).toFixed(0);
                  },
                },
              },
            ]
        )
      }
    },


    /// Main execution entry
    // We really need a birthTime; if it doesn't exist, we'll let them give us one
    // thresholdSelection = "aap"; // Set in Vuex Store
    // Called when dataReady is true (i.e., when FHIR returns with data)
    main() {
      // if (!this.$store.getters.patient.name) {
      //   this.$store.getters.patient = getPatientForTesting(patient); // for testing only; TODO look for mock == true
      // }

      // console.log("Returned from getPatient with birthDateTime: " + patient.birthDateTime);
      console.log("Chart.vue: main(); patient: ", this.$store.getters.patient)
      console.log("Do we have a valid birthDateTime? ", isValid(this.$store.getters.patient.birthDateTime))
      if (!isValid(this.$store.getters.patient.birthDateTime)) {
        this.warnings.push({
          message: `Could not determine the birth time. Please enter a value here.
                This won't change what's in the EMR. If the patient was born in this hospital, ask the ward clerk to update the record.`,
          level: "warning",
          textColor: "black",
          dismissable: true,
          enterable: "birthTime",
        });
        console.log("Chart.vue: invalid date");
        // this.$store.commit('changeBirthDateTime',
        //     Date.parse(this.$store.getters.patient.birthDate + 'T23:59'));
        // this.$store.getters.patient.birthTime = "23:59";
        // this.$store.getters.patient.birthDateTime = Date.parse(
        //     patient.birthDay + " " + patient.birthTime);
      }
      console.log("Ready to call renderChart, birthGA", this.$store.getters.patient.birthGA);

      if (!this.$store.getters.patient.results&&
          !this.warnings.find(w => w.id === 'invalidBilirubin')) {
        this.warnings.push({
          message: `This patient doesn't seem to have any bilirubin results.
            This will make for a pretty boring graph.`,
          level: "warning",
          textColor: "black",
          dismissable: true,
          id: "invalidBilirubin"
        });
      }




      // if (!this.$store.getters.patient.birthGA) {
      //   this.warnings.push({
      //     message: `This patient doesn't have a recorded gestational age at birth.
      //       In Epic, you can set this under History > Birth > Gestational Age.
      //       Please set this up so we can plot your baby.`,
      //     level: "warning",
      //     textColor: "black",
      //     dismissable: false,
      //
      //   });
      // } else {

        // console.log("Calling renderChart with results: ", this.results)
        // chartOptions.{aap, ncnc, premie}.series[last].data needs to be filled in from patient.results run through makeDataPoints
        this.chartOptions = this.getChartOptionsObject(this.$store.getters.patient.birthGA);

        // // If the patient had phototherapy, add plot bands
        // Using polygon plots instead (supports tooltips)
        // if (this.$store.getters.patient.phototherapy) {
        //   this.addPlotBands(this.chartOptions, this.$store.getters.patient.phototherapy);
        // }

        // for (let curve of curves) {
        //   this.chartOptions[curves[curve]].series[this.chartOptions[curves[curve]].series.length - 1].data =
        //       this.makeDataPoints(this.$store.getters.patient.results, curves[curve])
        // }
        this.renderChart();

    },


    gestationalAgeInWeeks() {
      let ga = this.$store.getters.patient.birthGA;
      console.log('Chart.vue: gestationalAgeInWeeks, from patient.birthGA: ', ga)

      return (Math.floor(ga / 7) + 'w' + ga % 7 + 'd');
    },

    // We temporarily halt mouse tracking (which results in tooltips) when copying the graph
    stopMouseTracking() {
      this.enableMouseTracking = false;
    },
    startMouseTracking() {
      this.enableMouseTracking = true;
    },
    gaInWeeks: function (ga) {
      return (Math.floor(ga / 7) + 'w' + ga % 7 + 'd');
    },
    updateNeurotoxRiskFactorsLabels(neurotoxRiskFactors) {
      for (let curve of curves) {
        let data = this.chartOptions[curve].series[this.chartOptions[curve].series.length - 1].data
        for (let i = 0; i < data.length; i++) {
          data[i].dataLabels.enabled = neurotoxRiskFactors || !data[i].dataLabels.neuroToxOnly;
        }
      }
    },

  },
  mounted: function () {
    // Get bili results from the store

    // let results = this.store.patient.results;

    // console.log("Chart.vue mounted, results: ", results);
    console.log('Chart.vue mounted')
    // console.log("chartOptions: ", this.chartOptions)
    // console.log(`dataReady: ${this.dataReady}`)

  },
  computed: {

    neurotoxRiskFactors: {
      get() {
        return this.$store.getters.neurotoxRiskFactors;
      },
      set(value) {
        this.$store.commit("changeNeurotoxRiskFactors", value);
      },
    },
    thresholdSelection: {
      get() {
        return this.$store.getters.thresholdSelection;
      },
      set(value) {
        this.$store.commit("changeThresholdSelection", value);
      },
    },
    birthDateTime: {
      get() {
        console.log(`Chart.vue: getter for birthDateTime: ${this.$store.getters.birthDateTime}`)
        return this.$store.getters.birthDateTime;
      },
      set(value) {
        this.$store.commit("changeBirthDateTime", value);
      },
    },
    patient: {
      get() {
        console.log(`Chart.vue: getter for patient: ${this.$store.getters.patient}`)
        return this.$store.getters.patient;
      },
      set(value) {
        this.$store.commit("changePatient", value);
      },
    },
    dataReady: {
      get() {
        return this.$store.getters.dataReady;
      },
      set(value) {
        this.$store.commit("changeDataReady", value);
      },
    },
    mock: {   // For testing
      get() {
        return this.$store.getters.mock;
      },
      set(value) {
        this.$store.commit("changeMock", value);
      },
    },
    ...mapState(["patient", "observation"]),


    riskFactorsDescriptionAAP: function () {
      return this.$store.getters.riskFactorsDescription.aap
    },
    riskFactorsDescriptionNCNC: function () {
      return this.$store.getters.riskFactorsDescription.ncnc
    },
    riskFactorsDescription: function () {
      const thresholdSelection = this.$store.getters.thresholdSelection;
      if (thresholdSelection === 0) {
        return this.$store.getters.riskFactorsDescription.aap;
      } else if (thresholdSelection === 1) {
        return this.$store.getters.riskFactorsDescription.ncnc;
      } else return "";
    },
  },
  watch: {
    displayLegend: function () {
      if (this.displayLegend) {
        console.log("Displaying legend")
      } else {
        console.log("Hiding legend")
      }
      for (let curve of curves) {
        this.chartOptions[curve].legend.enabled = this.displayLegend;
      }
    },
    neurotoxRiskFactors: function () {
      const neurotoxRiskFactors = this.$store.getters.neurotoxRiskFactors;
      // console.log(`Watching neurotoxRiskfactors: ${neurotoxRiskFactors}`);


      // for (let i = 0; i < this.resultsSeriesTermData.length; i++) {
      //   this.resultsSeriesTermData[i].dataLabels.enabled =
      //       neurotoxRiskFactors || !this.resultsSeriesTermData[i].dataLabels.neuroToxOnly;
      //   this.resultsSeriesPremieData[i].dataLabels.enabled =
      //       neurotoxRiskFactors || !this.resultsSeriesPremieData[i].dataLabels.neuroToxOnly;
      //   this.resultsSeriesNCNCData[i].dataLabels.enabled =
      //       neurotoxRiskFactors || !this.resultsSeriesNCNCData[i].dataLabels.neuroToxOnly;
      // }

      // For each results curve, if there is a dataPoint set up to be labeled only if neurotoxRIskFactors is true,
      // light it up if neuroToxRIskFactors is indeed true

      this.updateNeurotoxRiskFactorsLabels(neurotoxRiskFactors);


    },
    dataReady: function () {
      // console.log("Chart.vue: dataReady is ", this.dataReady, this.chartOptions);

      this.main();

    },
    patient: function () {
      console.log(`Watching patient`, this.patient)
    },
    birthDateTime: function () {
      // We keep birthDateTime separate from patient.birthDateTime just so we can watch it
      // It's stored in the patient object at the same time when it's submitted, so this is just a signal
      // to update the chart;
      // let birthDateTime = this.birthDateTime;
      console.log(`Watching birthDateTime ${this.birthDateTime}`);
      if (isValid(this.patient.birthDateTime)) {
        this.main();
      }
    }
  },
  created: () => {
    // store.commit('changeNeurotoxRiskFactors', false);
  },
  data() {
    return {
      // resultsSeriesTermData: [],
      // resultsSeriesPremieData: [],
      // resultsSeriesNCNCData: [],
      //
      // resultsSeriesTerm: [],
      // resultsSeriesPremie: [],
      // resultsSeriesNCNC: [],
      //
      // treatmentZoneSeries: [],
      // treatmentZoneSeriesNCNC: [],
      // treatmentZoneSeriesPremie: [],

      // riskZoneSeries: [],

      publicPath: process.env.BASE_URL,
      displayLegend: true,
      colors,
      // chartObject: null,

      // Defined on Vue instance since we need GA in weeks
      TREATMENTZONEPROPSNCNC: {   // {birthGA} gets subbed out later
        phototherapy: {
          Risk: {
            name: `<b>Phototherapy threshold {birthGA}</b><br/>\u22ef low risk infants<br/>
          \u2014 infants with neurotoxicity risk factors<br/>
          (isoimmune dz, G6PD, or other hemolysis;<br/>
          sepsis/suspected sepsis (on abx),<br/>
          acidosis (BE ≤ 8 or pCO2 > 50 within last 24h,<br/>
          albumin < 3, any clinical instability)`,
            type: "spline",
            id: "phototherapyRiskNCNC",
            lineWidth: 1.5,
            color: MARKERCOLORS.phototherapyHigh,
          },
          Well: {
            namePrefix: "Infants at lower risk",
            type: "spline",
            id: "phototherapyWellNCNC",
            lineWidth: 1.5,
            dashStyle: "dot", // 'dash',
            color: MARKERCOLORS.phototherapyLow,
            linkedTo: "phototherapyRiskNCNC",
          },
        },
        transfusion: {
          Risk: {
            name: '<b>Transfusion threshold {birthGA}</b>',
            type: "spline",
            id: "transfusionRiskNCNC",
            lineWidth: 1.5,
            color: MARKERCOLORS.transfusionHigh,
          },
          Well: {
            name: "Infants at lower risk", // for well babies',
            type: "spline",
            id: "transfusionWellNCNC",
            lineWidth: 1.5,
            dashStyle: "dot", // 'dash',
            color: MARKERCOLORS.transfusionLow,
            linkedTo: "transfusionRiskNCNC",
          },
        },
      },

      //
// // Phototherapy treatment zone thresholds literal object, AAP thresholds
// // For phototherapy, we exceed the treatment threshold for infants at low risk (>= 38 weeks GA and well) at the top line,
// // at medium risk (>= 38 week + risk factors of isoimmune hemolytic disease, G6PD deficiency, asphyxia, significant lethargy,
// // temperature instability, sepsis, acidosis or an albumin level < 3.0 g/dL if measured) or 35-37w6d and well
// // or for high risk infants 35-37w6d + risk factors
// // Phototherapy zones start at 0 hours of life
      treatmentZone: {
        interval: 12,
        startsAt: 0,
        minimumGA: 35 * 7,
        phototherapySeries: [
          [6.7, 9, 11.5, 13.5, 15.2, 16.4, 17.6, 18.8, 19.8, 20.3, 21, 21, 21],
          [5, 7.6, 9.8, 11.7, 13.1, 14.5, 15.4, 16.4, 17.2, 18, 18, 18, 18],
          [3.8, 6.0, 7.8, 9.5, 11.1, 12.4, 13.4, 14, 14.5, 14.9, 15, 15, 15],
        ],
        transfusionSeries: [
          [16, 17.7, 19, 20.8, 22.1, 23, 23.9, 24.4, 24.9, 24.9, 24.9, 24.9, 24.9],
          [
            13.8,
            15.1,
            16.5,
            17.9,
            19.1,
            20.1,
            21.2,
            22,
            22.4,
            22.4,
            22.4,
            22.4,
            22.4,
          ],
          [12, 13.5, 15, 16, 17.1, 18, 18.5, 18.8, 19, 19, 19, 19, 19],
        ],
        phototherapyVisible: false,
        transfusiontherapyVisible: false,
        seriesNames: ["High", "Medium", "Low"],
        seriesMap: {
          High: 2,
          Medium: 1,
          Low: 0,
        },

        /**
         * return the series of the type specified by zone
         * @param {string} type String "phototherapy" or "transfusion"
         * @param {string} name - String "High", "Medium", or "Low"
         * @return {array} series of data points
         */
        getSeriesByName: function (type, name) {
          return this[type + "Series"][this.seriesMap[name]];
        },
        // high: 2,
        // medium: 1,
        // low: 0,
        none: -1,
        // undefined: -2,
        phototherapylineColor: MARKERCOLORS.phototherapyHigh, // #1016FF or 00A8FF is 460 nm blue-indigo, typical phototherapy light
        transfusionLineColor: MARKERCOLORS.transfusionHigh,
        lineWidth: 1.5,

        // Given an age in hours and bilirubin level, for a given gestational age at birth, is the bilirubin level above
        // a phototherapy or transfusion treatment threshold?
        // So long as we know the gestational age of the baby, we can only cross one variety of zone; the low risk (highest)
        // phototherapy line cross the high risk (lowest) transfusion therapy line at the right of the nomogram,
        // but because the high risk lines are for 35-37w6d babies and the low risk lines are only for 38w0d babies, a baby
        // can't exceed both the high risk photoTx line and the low risk transfusionTx line
        // Still, there could be ambiguity where a 38 week sick baby might need transfusion but the same baby who is
        // well only needs phototherapy, so in that case we'd need to report exceeds threshold for phototherapy if well
        // and transfusion if sick
        //
        // Skip checking the low line if GA >= 38:
        // Return undefined if GA < 35 weeks
        // If GA is 38+ weeks and the baby is well, the treatment threshold is the highest line
        // If the GA is 38+ weeks and baby is sick, or 35-37w6d and the baby is well, it's the medium line
        // If the GA is 35-37w6d and sick, it's the low line
        //
        // We'll go through transfusiontherapy first, then phototherapy
        //
        // Returns an object: { exceedsPhoto, exceedsTranfusion }

        exceeds: function (hours, birthGA, level) {
          var xDistance, y1, y2, x1, x1Index, threshold, i;
          var returnValue = {phototherapy: this.none, transfusion: this.none};

          x1Index = Math.floor((hours - this.startsAt) / this.interval);
          x1 = Math.floor(hours / this.interval) * this.interval;

          // if the hours fall off the right edge of the graph, assume for the purposes of treatment levels
          // we're at the rightmost edge
          if (x1Index > this.phototherapySeries[0].length) {
            x1Index = this.phototherapySeries[0].length - 1;
          }

          for (i = 0; i < this.phototherapySeries.length - (birthGA >= (38 * 7)); i++) {
            // started out with 0 + (gaBirth >= 38)
            y1 = this.phototherapySeries[i][x1Index];

            if (x1Index + 1 < this.phototherapySeries[0].length) {
              y2 = this.phototherapySeries[i][x1Index + 1];
            } else {
              y2 = y1;
            }
            xDistance = hours - x1;
            threshold = y1 + xDistance * ((y2 - y1) / this.interval);
            if (level >= threshold) {
              returnValue.phototherapy = i;
              // console.log("Chart.vue: Setting phototherapy lines to visible");
              this.phototherapyVisible = true; // Show the series if we're exceeding it (otherwise it's clutter)
              // console.log(`treatmentZone phototherapyVisiible: ${treatmentZone.phototherapyVisible}`);

              break;
            }
          }

          for (i = 0; i < this.transfusionSeries.length - (birthGA >= (38 * 7)); i++) {
            // also needs to add back 0 + gaBirth >= 38
            y1 = this.transfusionSeries[i][x1Index];
            if (x1Index + 1 < this.transfusionSeries[0].length) {
              y2 = this.transfusionSeries[i][x1Index + 1];
            } else {
              y2 = y1;
            }
            xDistance = hours - x1;
            threshold = y1 + xDistance * ((y2 - y1) / this.interval);
            if (level >= threshold) {
              returnValue.transfusion = i;
              this.transfusiontherapyVisible.aap = true;

              console.log(
                  `Crossed transfusion threshold: ${hours} hours, level ${level}`
              );
              break;
            }
          }
          return returnValue;
        },
      },


      // Treatment zone thresholds literal object, NCNC thresholds
//
// They have 6 phototherapy series for 35, 36, 37, 38, 39, 40+ weeks without neurotoxicity risk factors, another 4 for with risk factors,
// and then 6 corresponding exchange trannsfusion without and 6 with neurotoxicity risk factors series.
//
// The neurotoxicity risk factors are slightly different than those in the AAP guidelines
//
// NCNC appears to have done curve fitting of the AAP curves:
// y = (5.013* x  - 0.43836 * x^2 + 6.73), y =4.53*x - 0.4476* x^2 + 3.7, y = 4.79*x - 0.4444*x^2 + 5.18
//
// NCNC thresholds are based on their quadratic curve fitting estimation of AAP thresholds:
//

// For phototherapy, we exceed the treatment threshold for infants at low risk (>= 38 weeks GA and well) at the top line,
// at medium risk (>= 38 week + risk factors of isoimmune hemolytic disease, G6PD deficiency, asphyxia, significant lethargy,
// temperature instability, sepsis, acidosis or an albumin level < 3.0 g/dL if measured) or 35-37w6d and well
// or for high risk infants 35-37w6d + risk factors
// Phototherapy zones start at 0 hours of life
      treatmentZoneNCNC: {
        interval: 12,
        startsAt: 0,
        maximumAge: 168, // in hours
        minimumGA: 35 * 7,
        phototherapyVisible: false,
        transfusiontherapyVisible: false,

        phototherapySeries: [],
        transfusionSeries: [],
        seriesNames: ["Well", "Risk"],
        seriesMap: {
          Well: 0,
          Risk: 1,
        },
        /**
         * return the series of the type specified by zone
         * @param {string} type String "phototherapy" or "transfusion"
         * @param {string} name - String "High", "Medium", or "Low"
         * @return {array} series of data points
         */
        getSeriesByName: function (type, name) {
          console.log(
              `In NCNC getSeriesByName, type ${type}, name ${name}, series: ${
                  this[type + "Series"][this.seriesMap[name]]
              }`
          );
          return this[type + "Series"][this.seriesMap[name]];
        },
        // Load up the actual series data points by calculating them at the given intervals using the quadratic equations
        setupPhototherapySeriesData: function () {
          var serieses = [],
              series = [];
          console.log("Preparing NCNC phototherapySeries");
          for (var i = 0; i < Object.keys(this.seriesMap).length; i++) {
            series = [];
            for (var j = this.startsAt; j < this.maximumAge; j += this.interval) {
              // console.log(`Threshold for patient at ${patient.birthGA} GA, @ ${j} hours (array ${i}) is ${this.ncncPhoto((patient.birthGA, j, i))}`)

              series.push(this.ncncPhoto(store.getters.patient.birthGA, j, i));
            }
            console.log(`Set up phototherapy series ${i}: ${series}`);

            series.id = "phototherapy" + this.seriesNames[i] + "NCNC";
            serieses.push(series);
          }
          this.phototherapySeries = serieses;
        },
        setupTransfusionSeriesData: function () {
          var serieses = [],
              series = [];
          console.log("Preparing NCNC transfusionSeries " + this.seriesNames);

          for (var i = 0; i < Object.keys(this.seriesMap).length; i++) {
            series = [];
            for (var j = this.startsAt; j < this.maximumAge; j += this.interval) {
              series.push(this.ncncTransfusion(store.getters.patient.birthGA, j, i));
            }
            console.log(`Set up transfusion series ${i}: ${series}`);
            series.id = "transfusion" + this.seriesNames[i] + "NCNC";
            serieses.push(series);
          }
          this.transfusionSeries = serieses;
        },
        // high: 2,
        // medium: 1,
        // low: 0,
        none: -1,
        // undefined: -2,
        phototherapylineColor: MARKERCOLORS.phototherapyHigh, // #1016FF or 00A8FF is 460 nm blue-indigo, typical phototherapy light
        transfusionLineColor: MARKERCOLORS.transfusionHigh,
        transfusionLineColorLightened: "#db8fc9",
        lineWidth: 1.5,

        // Given an age in hours and bilirubin level, for a given gestational age at birth, is the bilirubin level above
        // a phototherapy or transfusion treatment threshold?
        // NCNC thresholds are based on AAP thresholds, but there is a different curve for each gestational age;
        // Their website shows one curve per week from EGA 35 ro EGA 40+ weeks, but their equations are actually continuous,
        // slightly different for each day of gestational age, based on the the equatio:
        // aapMRT + 1 + ((LRT + 2 - MRT + 1) * (7 * birthGA/35)) for phototherapy,
        // and ncnc35well + (ncnc40wel- ncnc35well) * (birthGA - 35/5) for exchange transfusion
        //
        // So long as we know the gestational age of the baby, we can only cross one variety of zone; the low risk (highest)
        // phototherapy line cross the high risk (lowest) transfusion therapy line at the right of the nomogram,
        // but because the high risk lines are for 35-37w6d babies and the low risk lines are only for 38w0d babies, a baby
        // can't exceed both the high risk photoTx line and the low risk transfusionTx line
        // Still, there could be ambiguity where a 38 week sick baby might need transfusion but the same baby who is
        // well only needs phototherapy, so in that case we'd need to report exceeds threshold for phototherapy if well
        // and transfusion if sick
        //
        // Skip checking the low line if GA >= 38:
        // Return undefined if GA < 35 weeks
        // If GA is 38+ weeks and the baby is well, the treatment threshold is the highest line
        // If the GA is 38+ weeks and baby is sick, or 35-37w6d and the baby is well, it's the medium line
        // If the GA is 35-37w6d and sick, it's the low line
        //
        // We'll go through transfusiontherapy first, then phototherapy
        //
        // Returns an object: { exceedsPhoto, exceedsTranfusion }

        aapLRT: function (hours) {
          return hours < 120
              ? (5.013 * hours) / 24 - 0.43836 * Math.pow(hours / 24, 2) + 6.73
              : 21;
        },
        aapMRT: function (hours) {
          return hours < 120
              ? (4.79 * hours) / 24 - 0.4444 * Math.pow(hours / 24, 2) + 5.18
              : 18;
        },
        aapHRT: function (hours) {
          return hours < 107
              ? (4.53 * hours) / 24 - 0.4476 * Math.pow(hours / 24, 2) + 3.7
              : 15;
        },
        ncncPhoto: function (birthGA, hours, neurotoxRiskFactors) {
          // Adapted from https://phototherapyguidelines.com/js/jaundCalc.js
          // eslint-disable-next-line no-unused-vars
          var myAAP, myNCNC;
          var k1, k2, ncncWeeks, myDivisor;

          if (birthGA < (38 * 7) && neurotoxRiskFactors) {
            myAAP = this.aapHRT(hours);
          } else if (birthGA >= (38 * 7) && !neurotoxRiskFactors) {
            myAAP = this.aapLRT(hours);
          } else {
            myAAP = this.aapMRT(hours);
          }
          if (neurotoxRiskFactors) {
            k1 = this.aapHRT(hours);
            k2 = this.aapMRT(hours) + 1;
            ncncWeeks = 38;
            myDivisor = 21;
          } else {
            k1 = this.aapMRT(hours) + 1;
            k2 = this.aapLRT(hours) + 2;

            ncncWeeks = 40;
            myDivisor = 35;
          }
          if ((birthGA / 7) < ncncWeeks) {
            myNCNC = k1 + (k2 - k1) * ((birthGA - 35 * 7) / myDivisor);
          } else {
            myNCNC = k2;
          }

          myNCNC = Math.round(myNCNC * 10) / 10;
          return myNCNC;
        },
        ncncTransfusion: function (birthGA, hours, neurotoxRiskFactors) {
          // Adapted from https://phototherapyguidelines.com/js/jaundCalc.js
          // eslint-disable-next-line no-unused-vars
          var margin = 2;
          var aapETLRA = -0.0006817;
          var aapETLRB = 0.1606223;
          var aapETLRC = 15.89;
          var aapETLRLimit = 25;

          var aapETMRA = -0.0004284;
          var aapETMRB = 0.13356;
          var aapETMRC = 13.71;
          var aapETMRLimit = 22.5;

          var aapETHRA = -0.00068317;
          var aapETHRB = 0.1387284;
          var aapETHRC = 12;
          var aapETHRLimit = 19;

          var aapETTwithoutLimitLR =
              aapETLRA * Math.pow(hours, 2) + aapETLRB * hours + aapETLRC;
          var aapETTwithoutLimitMR =
              aapETMRA * Math.pow(hours, 2) + aapETMRB * hours + aapETMRC;
          var aapETTwithoutLimitHR =
              aapETHRA * Math.pow(hours, 2) + aapETHRB * hours + aapETHRC;

          var aapETTwithLimitLR = hours < 96 ? aapETTwithoutLimitLR : aapETLRLimit;
          var aapETTwithLimitMR = hours < 96 ? aapETTwithoutLimitMR : aapETMRLimit;
          var aapETTwithLimitHR = hours < 96 ? aapETTwithoutLimitHR : aapETHRLimit;

          var ncnc40well =
              hours < 96 ? aapETTwithLimitLR + (5 * hours) / 96 : aapETTwithLimitLR + 5;
          var ncnc35well =
              hours < 96 ? aapETTwithLimitMR + (3 * hours) / 96 : aapETTwithLimitMR + 3;
          // eslint-disable-next-line no-unused-vars
          var ncncWell =
              birthGA >= (40 * 7)
                  ? ncnc40well
                  : ncnc35well + ((ncnc40well - ncnc35well) * (birthGA / 7 - 35)) / 5;
          ncncWell = Math.round(ncncWell * 10) / 10;

          var ncnc40ntrf =
              hours < 96 ? aapETTwithLimitMR + (3 * hours) / 96 : aapETTwithLimitMR + 3;
          var ncnc35ntrf = aapETTwithLimitHR;
          // eslint-disable-next-line no-unused-vars
          var ncncNtrf =
              birthGA >= (40 * 7)
                  ? ncnc40ntrf
                  : ncnc35ntrf + ((ncnc40ntrf - ncnc35ntrf) * (birthGA / 7 - 35)) / 5;
          ncncNtrf = Math.round(ncncNtrf * 10) / 10;
          if (neurotoxRiskFactors) {
            return ncncNtrf;
          } else {
            return ncncWell;
          }
        },
        exceeds: function (hours, birthGA, level) {
          var threshold;
          var returnValue = {phototherapy: this.none, transfusion: this.none};

          threshold = this.ncncPhoto(birthGA, hours, true);
          if (level >= threshold) {
            returnValue.phototherapy = this.seriesMap.Risk;
          }

          threshold = this.ncncPhoto(birthGA, hours, false);
          if (level >= threshold) {
            returnValue.phototherapy = this.seriesMap.Well;
            this.phototherapyVisible = true;
          }

          threshold = this.ncncTransfusion(birthGA, hours, true);
          if (level >= threshold) {
            returnValue.transfusion = this.seriesMap.Risk;
          }

          threshold = this.ncncTransfusion(birthGA, hours, false);
          if (level >= threshold) {
            returnValue.transfusion = this.seriesMap.Well;
            this.transfusiontherapyVisible = true;
          }

          return returnValue;
        }
      },


      chartReady: false,

      phototherapyVisible: {
        aap: false,
        ncnc: false,
        premie: false

      },

      transfusionTherapyVisible: {
        aap: false,
        ncnc: false,
        premie: false
      },

      results: [],
      warnings: [],

      // results,
      // patient,
      // birthTime,
      submittedBirthTime: false,
      bilirubinLevelMouseTracking: false,

      // phototherapyTooltip: '',
      chartOptions: {}, // Fill this in later when we get our results data


      // We maintain 3 separate chartOptions objects. Too bad we can't just turn the series on and off, but
      // Highcharts-vue really doesn't like that:
      // https://github.com/highcharts/highcharts-vue#chart-object-reference
      // You can access the Chart object instance if necessary (e.g when need to get some data or use any of Chart.prototype functions),
      // by calling specific Vue component instance chart field, but it is not supported to update the chart using its built-in functions
      //
      // Updating points is fine, but making series visible/invisible (with show(), hide() or setting the visible Object member)
      // does not seem to work
      //

      updateArgs: [true, true, {duration: 500}],
    };
  }
}

/// Utility functions

// Given a birth gestational age like 36 6/7 weeks, convert to 36.85...
// We could use eval, and it seems unlikely that someone would pass us bogus stuff to evaluate,
// But I thought we'd be paranoid
// eslint-disable-next-line no-unused-vars
function convertWholePlusFrac(birthGA) {
  var wholePlusFrac = birthGA.split(" ");
  if (wholePlusFrac.length > 1) {
    var frac = wholePlusFrac[1].split("/");
    var whole = parseInt(wholePlusFrac[0]);
    var result = whole + parseInt(frac[0]) / parseInt(frac[1]);
    return result;
  } else {
    return birthGA;
  }
}

// Convert an array with drawtimes in text ("6/4/16 12:02") to its Javascript equivalent
// eslint-disable-next-line no-unused-vars
function convertDateTime(element) {
  var newElement = {
    drawtime: Date.parse(element.drawtime),
    level: element.level,
    method: element.method
  };
  // console.log('Converted ' + element.drawtime + ' to ' + newElement.drawtime + '\n');
  return newElement;
}

// Put the name of the method (serum, POC, transcut) in the result array of objects
// IE10+ compatible, so re-written as addMethod2 to handle older versions of IE
// eslint-disable-next-line no-unused-vars
function addMethod(method, element) {
  var newElement = {
    drawtime: element.drawtime,
    level: element.level,
    method: method,
  };
  return newElement;
}

// Given a data point, give it its decorations based on risk zone
function decorateDataPoint(
    dataPoint,
    ageHours,
    level,
    method,
    color,
    description
) {

  console.log(`Decorating data point at ${ageHours} h, level ${level}, color ${color}`)
  dataPoint.customTooltip =
      `<span style="font-size: 0.85em"><b>
      ${ageHours} </b> hours of age — <b>
      ${level} </b> mg/dL (${method})</span><br/>
      <span style="color: ${color}"> &#9673; </span>
      ${description} risk zone<span class="hanging-indent">`;
  dataPoint.marker.lineColor = "black";
  dataPoint.marker.lineWidth = 1;
  dataPoint.marker.fillColor = color;
  dataPoint.tableRowColor = color;
  dataPoint.riskDescription = description;
  // dataPoint.dataLabels.formatter = function () {
  //     return this.y + ' (' + description + ' risk)';
  // };
}

// Given a data point, give it its decorations based on risk zone
function decorateDataPointPremie(
    dataPoint,
    ageHours,
    ageWeeks,
    level,
    method,
    color,
    description
) {
  dataPoint.customTooltip =
      '<span style="font-size: 0.85em"><b>' +
      ageWeeks +
      "</b> CGA — " +
      ageHours +
      "</b> hours of age — <b>" +
      level +
      "</b> mg/dL (" +
      method +
      ")</span><br/>" +
      '<span style="color: ' +
      color +
      '"> &#9673; </span>' +
      description;
  dataPoint.marker.lineColor = "black";
  dataPoint.marker.lineWidth = 1;
  dataPoint.marker.fillColor = color;
  dataPoint.tableRowColor = color;
  dataPoint.riskDescription = description;
}

// Given a result and risk zone, add it to the result table, along with corresponding follow-up recommendations
// These will end up in the results table
function followupRecommendation(risk, birthGA) {
  var followupRecommendations = {
    noRisk: "",
    withRisk: "",
  };

  // Follow-up recommendations per 2009 Pediatrics article, stratified according
  // to Bhutani risk, GA and a second set of risk factors which we'll show
  // with a hover div
  const followupDescription = {
    young: {
      // 35-37w6d
      noRiskFactors: {
        highRisk:
            "Evaluate for phototherapy;<br/>TSB in 4-24 h (inpatient or outpatient)",
        highIntRisk:
            "Evaluate for phototherapy;<br/>TcB/TSB within 24 h (inpatient or outpatient)",
        lowIntRisk: "If discharging < 72 h of age,<br/>follow up within 2 d",
        lowRisk: "If discharging < 72 h of age,<br/>follow up within 2-3 d",
      },
      withRiskFactors: {
        highRisk: "Evaluate for phototherapy;<br/>TSB in 4-8 h (inpatient)",
        highIntRisk:
            "Evaluate for phototherapy;<br/>TSB in 4-24 h (inpatient or outpatient)",
        lowIntRisk:
            "If discharging < 72 h of age,<br/>follow-up within 2 d;<br/>Consider TSB/TcB at follow-up",
        lowRisk: "If discharging < 72 h of age,<br/>follow up within 2 d",
      },
    },
    notYoung: {
      // 38+ weeks
      noRiskFactors: {
        highRisk:
            "Evaluate for phototherapy;<br/>TSB in 4-24 h (inpatient or outpatient)",
        highIntRisk: "Follow up within 2 d;<br/>consider TcB/TSB at follow-up",
        lowIntRisk: "If discharging < 72 h of age,<br/>follow up within 2-3 d",
        lowRisk:
            "If discharging < 72 h of age,<br/>time follow-up according to<br/>age at discharge or concerns other than jaundice (e.g., breastfeeding)",
      },
      withRiskFactors: {
        // Apparently I can't do this: =  this.young.noRiskFactors
        highRisk:
            "Evaluate for phototherapy;<br/>TSB in 4-24 h (inpatient or outpatient)",
        highIntRisk:
            "Evaluate for phototherapy;<br/>TcB/TSB within 24 h (inpatient or outpatient)",
        lowIntRisk: "If discharging < 72 h of age,<br/>follow up within 2 d",
        lowRisk: "If discharging < 72 h of age,<br/>follow up within 2-3 d",
      },
    },
  };

  // console.log("Interpreting risk: " + risk + ", birthGA: " + birthGA);

  switch (risk) {
    case "Low":
      if (birthGA >= 35 * 7 && birthGA < 38 * 7) {
        followupRecommendations.noRisk +=
            followupDescription.young.noRiskFactors.lowRisk;
        followupRecommendations.withRisk +=
            followupDescription.young.withRiskFactors.lowRisk;
      } else if (birthGA > 38 * 7) {
        followupRecommendations.noRisk +=
            followupDescription.notYoung.noRiskFactors.lowRisk;
        followupRecommendations.withRisk +=
            followupDescription.notYoung.withRiskFactors.lowRisk;
      } else {
        followupRecommendations.noRisk += "(Not applicable under 35 weeks)";
        followupRecommendations.withRisk += "(Not applicable under 35 weeks)";
      }
      break;
    case "Low-intermediate":
      if (birthGA >= 35 * 7 && birthGA < 38 * 7) {
        followupRecommendations.noRisk +=
            followupDescription.young.noRiskFactors.lowIntRisk;
        followupRecommendations.withRisk +=
            followupDescription.young.withRiskFactors.lowIntRisk;
      } else if (birthGA > 38 * 7) {
        followupRecommendations.noRisk +=
            followupDescription.notYoung.noRiskFactors.lowIntRisk;
        followupRecommendations.withRisk +=
            followupDescription.notYoung.withRiskFactors.lowIntRisk;
      } else {
        followupRecommendations.noRisk += "(Not applicable under 35 weeks)";
        followupRecommendations.withRisk += "(Not applicable under 35 weeks)";
      }
      break;
    case "High-intermediate":
      if (birthGA >= 35 * 7 && birthGA < 38 * 7) {
        followupRecommendations.noRisk +=
            followupDescription.young.noRiskFactors.highIntRisk;
        followupRecommendations.withRisk +=
            followupDescription.young.withRiskFactors.highIntRisk;
      } else if (birthGA > 38 * 7) {
        followupRecommendations.noRisk +=
            followupDescription.notYoung.noRiskFactors.highIntRisk;
        followupRecommendations.withRisk +=
            followupDescription.notYoung.withRiskFactors.highIntRisk;
      } else {
        followupRecommendations.noRisk += "(Not applicable under 35 weeks)";
        followupRecommendations.withRisk += "(Not applicable under 35 weeks)";
      }
      break;
    case "High":
      if (birthGA >= 35 * 7 && birthGA < 38 * 7) {
        followupRecommendations.noRisk +=
            followupDescription.young.noRiskFactors.highRisk;
        followupRecommendations.withRisk +=
            followupDescription.young.withRiskFactors.highRisk;
      } else if (birthGA > 38 * 7) {
        followupRecommendations.noRisk +=
            followupDescription.notYoung.noRiskFactors.highRisk;
        followupRecommendations.withRisk +=
            followupDescription.notYoung.withRiskFactors.highRisk;
      } else {
        followupRecommendations.noRisk += "(Not applicable under 35 weeks)";
        followupRecommendations.withRisk += "(Not applicable under 35 weeks)";
      }
      break;
  }
  return followupRecommendations;
}

// Make label (not tooltips) for each result data point
// zone = whether this point is in the phototherapy or transfusion zone
// level = the bilirubin level
// color = background color of label
// enabled = whether the button is visible
// neuroToxOnly = the button is visible only if the patient has neurotoxicity risk factors
function makeLabel(zone, level, color, enabled, neuroToxOnly) {
  // // Usually not visible, but display if tx indicated
  // var transfusion = bili.getTreatmentZoneTransfusion()
  //     ? 'transfusion' + bili.getTreatmentZoneTransfusion()
  //     : false;
  // var photo = bili.getTreatmentZonePhoto()
  //     ? 'phototherapy' + bili.getTreatmentZonePhoto()
  //     : false;

  // If neuroToxOnly is true, the label is conditionally displayed (if neurotoxRiskFactors is true)
  // eslint-disable-next-line no-constant-condition
  // console.log(`Making a data label at level ${level}, zone ${zone}, color ${color}`);
  if (zone === "phototherapy" || zone === "transfusion") {
    const labelObject = {
      backgroundColor: color,
      color: "white",
      // ? 'white'
      // : 'contrast',
      borderRadius: "3px",
      align: "center",
      style: {
        textShadow: "",
        fontWeight: "regular",
        textOutline: "1 px 1 px contrast",
      },
      x: 0,
      y: -6,
      enabled: enabled,
      neuroToxOnly: neuroToxOnly,
      formatter: function () {
        {
          // photo will look like photoTherapyMedium, phototherapyHigh or false;
          // similarly with transfusion
          // We'll use that to build the data labels
          // console.log(`Displaying a data label at level ${level}, zone ${zone}, color ${color}, neuroToxOnly ${neuroToxOnly}, neurotoxRiskFactors ${neurotoxRiskFactors}`);
          if (zone === "transfusion") {
            return "\u26a0 " + level; // Unicode warning sign
          } else if (zone === "phototherapy") {
            return "\u2600 " + level; //  + ' ' + neurotoxRiskFactors; // + '-' + photo + "-";
          } else {
            return "? " + zone;
          }
        }
      },
    };
    console.log(
        `Made a label object for zone ${zone}, level ${level}, enabled ${enabled}, ntOnly ${neuroToxOnly}`
    );
    return labelObject;
  }
}

// Put together results of different methodologies, and come up with a single array
// of sorted results
function sortResults(results) {

  results.sort(function (a, b) {
    if (a.drawtime < b.drawtime) return -1;
    if (a.drawtime > b.drawtime) return 1;
    return 0;
  });
  // console.log("Fake results: ", results)
  return results;
}


</script>
<style>
.hanging-indent {
  padding-left: 36px;
  text-indent: -36px;
}
.no-uppercase {
  text-transform: none !important;
}
.center-align {
  text-align: center;
}
.right-align {
  text-align: right;
}
.striped
  tbody tr:nth-child(even) { background-color: #f2f2f2; }

</style>