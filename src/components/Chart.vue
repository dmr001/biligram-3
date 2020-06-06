<template>
    <div class="chartElement">
        <div id="chart" class="row">
            <highcharts :options="chartOptions" :updateArgs="updateArgs"></highcharts>
        </div>

        <div id="copy" class="row">
            <copy-component>
            </copy-component>
        </div>

        <div id="warnings" class="row">
            <warnings-component v-bind:warnings="warnings"></warnings-component>
            <patient-component v-bind:patient="patient"></patient-component>
        </div>

        <div id="result-table" class="row">
            <table-component v-bind:resultsSeries="resultsSeries"></table-component>
        </div>



    </div>
</template>

<script>

    // import CurvesComponent from 'Curves.vue';
    import { addHours } from 'date-fns';
    import WarningsComponent from "@/components/Warnings";
    import TableComponent from "@/components/Table";
    import PatientComponent from "@/components/Patient";
    import CopyComponent from "@/components/Copy";

    // The actual array of objects we'll plot on the graph, based on the results
    var resultsSeries = [  ];

    // Incoming raw results
    // var results = { };

    // Warnings we collect (and hopefully fix) along the way
    var warnings = [];

    // Information about the patient
    // var patient = { };

    // import CurvesComponent from './components/Curves';

    // import smartClient from './smartClient';


    // Fake data for testing
    function getBiliResultsForTesting(birthDay, birthTime) {

        // var birthDay = "5/24/2020";
        // var birthTime = '00:23';
        var results = { };
        var birthDate = Date.parse(birthDay + ' ' + birthTime);


        // Test results
        patient = {
            birthGA: 35.6,
            birthWeight: 1.830,
            birthDay: birthDay,
            birthTime: birthTime
        };

        results = {
            birthGA: 35.6,
            birthWeight: 1.830,
            birthDay: birthDay,
            // birthDateTime.getMonth() + '/' + birthDateTime.getDate() + '/' + birthDateTime.getFullYear(),
            birthTime: birthTime,
            serum: [{drawtime: addHours(birthDate, 24), level: 4.0}, {drawtime: addHours(birthDate,36), level: 7.1}, {
                drawtime: addHours(birthDate,48), level: 11.1 }, {drawtime: addHours(birthDate,72), level: 16}],
            POC: [{drawtime: addHours(birthDate,26), level: 4.3}, { drawtime: addHours(birthDate, 30), level: 7.5}, {
                drawtime: addHours(birthDate,40),
                level: 10.0 }, {drawtime: addHours(birthDate,78), level: 10}],
            TCLab: [{drawtime: addHours(birthDate,16), level: 7.3}, {drawtime: addHours(birthDate,85), level: 14.5}],
            sortedResults: [],
            photoTx: '',
            mini: false

        };
        return { patient, results };
    }






    // Bhutani risk zones literal object
    // Bhutani risk zones start at 12 hours of life
    var riskZone = {
        interval: 4,	// How many hours apart are each data point
        startsAt: 12,
        // Each line in the series, followed by literal index identifiers
        // We're using an array rather than an object in order to guarantee order
        series: [
            [25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25],
            [7.1, 7.2, 7.4, 7.8, 8.9, 10.0, 11.1, 12.2, 12.5, 13.2, 13.8, 14.4, 15.2, 15.4, 15.6, 15.9, 16.2, 16.4, 16.7, 17.0, 17.2, 17.4, 17.4, 17.5, 17.5, 17.5, 17.6, 17.7, 17.6, 17.5, 17.4, 17.4, 17.3, 17.3, 17.4],
            [5.1, 5.5, 5.9, 6.1, 7.0, 8.0, 8.9, 9.9, 10.3, 10.8, 11.3, 12.0, 12.6, 12.9, 13.1, 13.4, 13.8, 14.3, 14.7, 14.7, 15.0, 15.2, 15.3, 15.4, 15.5, 15.6, 15.7, 15.8, 15.7, 15.6, 15.5, 15.4, 15.3, 15.2, 15.3],
            [3.9, 4.3, 4.7, 4.9, 5.5, 6.3, 7.0, 7.8, 8.1, 8.6, 9.0, 9.3, 9.6, 10.2, 10.7, 11.2, 11.3, 11.4, 11.6, 11.8, 12.2, 12.3, 12.5, 12.7, 12.8, 13.0, 13.1, 13.2, 13.2, 13.2, 13.2, 13.2, 13.2, 13.2, 13],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]   // Array.fill not supported in IE11 or below
        ],
        zero: 4,
        low: 3,
        lowIntermediate: 2,
        highIntermediate: 1,
        high: 0,
        undefined: -2,

        // Given an age in hours, what threshold (if any) is a bilirubin level above?
        exceeds: function (hours, level) {
            var xDistance, y1, y2, x1, x1Index, threshold;
            // Get the nearest (on the left side) x value in hours
            // So if an age is, say, 29 hours, and our interval is 4, we're looking for 28 hours (x1), or position 7 in the array (the x1Index)
            x1Index = Math.floor((hours - this.startsAt)/this.interval);
            x1 = Math.floor(hours/this.interval) * this.interval;

            // If we are looking for a risk level prior to when they're defined, return undefined
            if (hours < this.startsAt) {
                return this.undefined;
            }
            // If the hour is so late it falls off the right side of the nomogram, we'll use the rightmost data
            // point available, which assumes it more or less goes off forever at the same bilirubin level
            if (x1Index >= this.series[0].length) {
                x1Index = this.series[0].length - 1;
            }

            // Go through each series at the age in hours
            // If we exceed that zones ceiling, we return the next zone "up"
            // We get to skip the high risk zone, since if we exceed high-int risk we're high risk
            // We get to skip the low risk zone, since if it doesn't exceed any of the other zones it's low risk
            for (var i = 1; i < this.series.length - 1; i++) {
                y1 = this.series[i][x1Index];
                if (x1Index  < this.series[0].length) {
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
                threshold = y1 + (xDistance * ((y2 - y1)/this.interval));
                if (level >= threshold) {
                    return i - 1;	// If we exceeded this zone's ceiling, return the next zone "up"
                    // E.g., if we exceeded the ceiling of the low risk zone, return low-intermediate risk
                }
            }
            // If we made it here, we didn't cross a threshold
            return this.low;
        }
    };



    // Phototherapy treatment zone thresholds literal object
    // For phototherapy, we exceed the treatment threshold for infants at low risk (>= 38 weeks GA and well) at the top line,
    // at medium risk (>= 38 week + risk factors of isoimmune hemolytic disease, G6PD deficiency, asphyxia, significant lethargy,
    // temperature instability, sepsis, acidosis or an albumin level < 3.0 g/dL if measured) or 35-37w6d and well
    // or for high risk infants 35-37w6d + risk factors
    // Phototherapy zones start at 0 hours of life
    var treatmentZone = {
        interval: 12,
        startsAt: 0,
        phototherapySeries: [
            [6.7, 9, 11.5, 13.5, 15.2, 16.4, 17.6, 18.8, 19.8, 20.3, 21, 21, 21],
            [5, 7.6, 9.8, 11.7, 13.1, 14.5, 15.4, 16.4, 17.2, 18, 18, 18, 18],
            [3.8, 6.0, 7.8, 9.5, 11.1, 12.4, 13.4, 14, 14.5, 14.9, 15, 15, 15]
        ],
        transfusionSeries: [
            [16, 17.7, 19, 20.8, 22.1, 23, 23.9, 24.4, 24.9, 24.9, 24.9, 24.9, 24.9],
            [13.8, 15.1, 16.5, 17.9, 19.1, 20.1, 21.2, 22, 22.4, 22.4, 22.4, 22.4, 22.4],
            [12, 13.5, 15, 16, 17.1, 18, 18.5, 18.8, 19, 19, 19, 19, 19]
        ],
        phototherapyVisible: false,
        transfusiontherapyVisible: false,
        high: 2,
        medium: 1,
        low: 0,
        none: -1,
        undefined: -2,
        phototherapylineColor: '#1016FF',  // #1016FF or 00A8FF is 460 nm blue-indigo, typical phototherapy light
        transfusionLineColor: 'DarkViolet',
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
        exceeds: function (hours, level, gaBirth) {
            var xDistance, y1, y2, x1, x1Index, threshold, i;
            var returnValue = { phototherapy: this.none, transfusion: this.none };

            x1Index = Math.floor((hours - this.startsAt)/this.interval);
            x1 = Math.floor(hours/this.interval) * this.interval;


            // if the hours fall off the right edge of the graph, assume for the purposes of treatment levels
            // we're at the rightmost edge
            if (x1Index > this.phototherapySeries[0].length) {
                x1Index = this.phototherapySeries[0].length - 1;
            }

            for(i = 0; i < this.phototherapySeries.length -  (gaBirth >= 38); i++) {  // started out with 0 + (gaBirth >= 38)
                y1 = this.phototherapySeries[i][x1Index];

                if (x1Index < this.phototherapySeries[0].length) {
                    y2 = this.phototherapySeries[i][x1Index + 1];
                } else {
                    y2 = y1;
                }
                xDistance = hours - x1;
                threshold = y1 + (xDistance * ((y2 - y1)/this.interval));
                if (level >= threshold) {
                    returnValue.phototherapy = i;
                    this.phototherapyVisible = true;		// Show the series if we're exceeding it (otherwise it's clutter)
                    break;
                }
            }

            for(i = 0; i < this.transfusionSeries.length - (gaBirth >= 38); i++) { // also needs to add back 0 + gaBirth >= 38
                y1 = this.transfusionSeries[i][x1Index];
                if (x1Index < this.transfusionSeries[0].length) {
                    y2 = this.transfusionSeries[i][x1Index + 1];
                } else {
                    y2 = y1;
                }
                xDistance = hours - x1;
                threshold = y1 + (xDistance * ((y2 - y1) / this.interval));
                if (level >= threshold) {
                    returnValue.transfusion = i;
                    this.transfusiontherapyVisible = true;
                    break;
                }
            }
            return returnValue;
        }
    };

    // Given an two arrays of y coordinates, replace it with an array of datapoint objects that includes
    // x coordinates at a given interval of hours (and low and high values for the y coordinates for a range plot)
    // We use this to make an area plot for each zone of the Bhutani nomogram (low, low-int, high-int and high)
    function addXCoordinatesWithRange(yCoordinatesLow, yCoordinatesHigh, interval, startsAt)
    {
        var arrayLength = yCoordinatesHigh.length;
        var x = startsAt;
        var returnArray = [];

        for (var i = 0; i < arrayLength; i++) {
            var dataPoint = {x: x, low: yCoordinatesLow[i], high: yCoordinatesHigh[i]};

            returnArray.push(dataPoint);
            x += interval;
        }
        return (returnArray);
    }

    // Given an array of y coordinates, replace it with an array of datapoint objects that includes
    // x coordinates at a given interval of hours
    // We use this to plot the phototherapy and transfusion therapy thresholds
    function addXCoordinates(yCoordinates, interval, startsAt)
    {
        var arrayLength = yCoordinates.length;
        var x = startsAt;
        var returnArray = [];

        for (var i = 0; i < arrayLength; i++) {
            var dataPoint = {x: x, y: yCoordinates[i]};

            returnArray.push(dataPoint);
            x += interval;
        }
        return (returnArray);
    }




    export default {
        name: "ChartComponent",
        components: {
            // RiskFactorsDialog
            // CurvesComponent
            WarningsComponent,
            TableComponent,
            PatientComponent,
            CopyComponent
        },
        props: {
            // warnings: Array
        },
        methods: {

        },
        data () {
            return {

                resultsSeries,
                warnings,
                patient,

                chartOptions: {
                    chart: {
                        // type: 'spline', //arearange
                        zoomType: 'xy',
                        panning: true,
                        panKey: 'shift',
                        animation: false,
                        width: '900'
                    },
                    xAxis: [{
                        title: {
                            text: 'Age <i>(hours)</i>'
                        },
                        tickInterval: 24,
                        minorTickInterval: 12
                    }, {
                        title: {
                            text: 'Age <i>(days)</i>'
                        },
                        labels: {
                            formatter: function () {
                                return this.value / 24;
                            }
                        },
                        linkedTo: 0,	// this secondary access just re-displays the primary (0) axis in a different format
                        opposite: true
                    }],
                    yAxis: {
                        title: {
                            text: 'Total serum bilirubin (mg/dL)'
                        },
                        plotLines: [{
                            value: 0,
                            width: 1,
                            color: 'gray'

                        }],
                        floor: 0
                        // max: 25
                        // ceiling: 25
                    },
                    legend: {
                        layout: 'vertical',
                        align: 'right',
                        verticalAlign: 'middle',
                        borderWidth: 0,
                        useHTML: true,
                        itemHoverStyle: {
                            color: 'DarkGray'
                        }
                    },
                    tooltip: {
                        useHTML: true,
                        opacity: 0.9,
                        formatter: function () {
                            // return this.series.name;
                            return this.point.customTooltip;
                        }

                    },

                    plotOptions: {
                        series: {
                            allowPointSelect: false,
                            enableMouseTracking: false,
                            fillOpacity: 0.6,
                            lineWidth: 0,
                            marker: {
                                enabled: false
                            },
                            animation: false

                        }

                    },
                    title: {
                        text: '',
                    },
                    credits: {
                        enabled: false
                    },
                    series: [{
                        id: 'HRZ',
                        name: 'High risk zone',
                        color: '#ff6060', // red
                        type: 'arearange',
                        data: addXCoordinatesWithRange(riskZone.series[riskZone.highIntermediate], riskZone.series[riskZone.high], riskZone.interval, riskZone.startsAt)
                    }, {
                        id: 'HIRZ',
                        name: 'High-intermediate risk zone',
                        color: '#ffb150', // 'orange'
                        type: 'arearange',
                        data: addXCoordinatesWithRange(riskZone.series[riskZone.lowIntermediate], riskZone.series[riskZone.highIntermediate], riskZone.interval, riskZone.startsAt)
                    }, {
                        id: 'LIRZ',
                        name: 'Low-intermediate risk zone',
                        color: '#ffff50', // 'yellow',
                        type: 'arearange',
                        data: addXCoordinatesWithRange(riskZone.series[riskZone.low], riskZone.series[riskZone.lowIntermediate], riskZone.interval, riskZone.startsAt)
                    }, {
                        id: 'LRZ',
                        name: 'Low risk zone',
                        color: '#8cff4a', // 'green',
                        type: 'arearange',
                        // xAxis: 1,
                        data: addXCoordinatesWithRange(riskZone.series[riskZone.zero], riskZone.series[riskZone.low], riskZone.interval, riskZone.startsAt)
                    }, {
                        id: 'photoHighRisk',
                        name: 'Phototherapy thresholds', // photoTxHighRisk, Infants at higher risk (35-37w6d and risk factors)
                        color: treatmentZone.phototherapylineColor,
                        type: 'spline',
                        lineWidth: treatmentZone.lineWidth,
                        visible: treatmentZone.phototherapyVisible,
                        data: addXCoordinates(treatmentZone.phototherapySeries[treatmentZone.high], treatmentZone.interval, treatmentZone.startsAt)
                    }, {
                        id: 'photoMediumRisk',
                        name: 'Infants at medium risk (38+ weeks and risk factors, or 35-37w6d and well)', // photoTxMediumRisk
                        color: treatmentZone.phototherapylineColor,
                        type: 'spline',
                        dashStyle: 'dash',
                        lineWidth: treatmentZone.lineWidth,
                        visible: treatmentZone.phototherapyVisible,
                        linkedTo: ':previous',
                        data: addXCoordinates(treatmentZone.phototherapySeries[treatmentZone.medium], treatmentZone.interval, treatmentZone.startsAt)
                    }, {
                        id: 'photoLowRisk',
                        name: 'Phototherapy thresholds', // 'Infants at lower risk (38+ weeks and well)', // photoTxLowRisk
                        color: treatmentZone.phototherapylineColor,
                        type: 'spline',
                        dashStyle: 'dot',
                        lineWidth: treatmentZone.lineWidth,
                        visible: treatmentZone.phototherapyVisible,
                        linkedTo: ':previous',
                        data: addXCoordinates(treatmentZone.phototherapySeries[treatmentZone.low], treatmentZone.interval, treatmentZone.startsAt)
                    }, {
                        id: 'transfusionHighRisk',
                        name: 'Transfusion thresholds<br>(low risk &#8943;, medium --, high risk &#8213;)', // 'Infants at higher risk (35-37w6d and risk factors: isoimmune disease, G6PD, asphysxia, lethargy, temp instability, sepis, albumin < 3.0 g/dL if measured)', // transfusionHighRisk
                        color: treatmentZone.transfusionLineColor,
                        type: 'spline',
                        lineWidth: treatmentZone.lineWidth,
                        visible: treatmentZone.transfusiontherapyVisible,
                        data: addXCoordinates(treatmentZone.transfusionSeries[treatmentZone.high], treatmentZone.interval, treatmentZone.startsAt)
                    }, {
                        id: 'transfusionMediumRisk',
                        name: 'Infants at medium risk (38+ weeks and risk factors, or 35-37w6d and well)', // transfusionMediumRisk
                        color: treatmentZone.transfusionLineColor,
                        type: 'spline',
                        dashStyle: 'dash',
                        lineWidth: treatmentZone.lineWidth,
                        visible: treatmentZone.transfusiontherapyVisible,
                        linkedTo: ':previous',
                        data: addXCoordinates(treatmentZone.transfusionSeries[treatmentZone.medium], treatmentZone.interval, treatmentZone.startsAt)
                    }, {
                        id: 'transfusionLowRisk',
                        name: 'Infants at lower risk (38+ weeks and well)', // 'Infants at lower risk (38+ weeks and well)', // transfusionLowRisk
                        color: treatmentZone.transfusionLineColor,
                        type: 'spline',
                        dashStyle: 'dot',
                        lineWidth: treatmentZone.lineWidth,
                        visible: treatmentZone.transfusiontherapyVisible,
                        linkedTo: ':previous',
                        data: addXCoordinates(treatmentZone.transfusionSeries[treatmentZone.low], treatmentZone.interval, treatmentZone.startsAt)
                    }, {
                        name: 'Bilirubin level<br>(serum: &#9679;, POC: &diams;, transcut: &FilledSmallSquare;)',
                        color: 'black',
                        type: 'line',
                        animation: true,
                        allowPointSelect: false,
                        enableMouseTracking: true,
                        fillOpacity: 1,
                        lineWidth: treatmentZone.lineWidth,
                        marker: {
                            enabled: true
                        },
                        data: resultsSeries

                    }

                    ]

                },
                updateArgs: [true, true, {duration: 1000}],





            };

        },
        computed: {}
    }

    // Given a birth gestational age like 36 6/7 weeks, convert to 36.85...
    // We could use eval, and it seems unlikely that someone would pass us bogus stuff to evaluate,
    // But I thought we'd be paranoid

    /*
    function convertWholePlusFrac(birthGA) {
        var wholePlusFrac = birthGA.split(' ');
        if (wholePlusFrac.length > 1) {
            var frac = wholePlusFrac[1].split('/');
            var whole = parseInt(wholePlusFrac[0]);
            var result = whole + (parseInt(frac[0])/parseInt(frac[1]));
            return result;
        } else {
            return birthGA;
        }
    }
    */

    // Convert an array with drawtimes in text ("6/4/16 12:02") to its Javascript equivalent
    function convertDateTime(element) {
        var newElement = {
            drawtime: Date.parse(element.drawtime),
            level: element.level

        };
        // console.log('Converted ' + element.drawtime + ' to ' + newElement.drawtime + '\n');
        return newElement;
    }

    // Put the name of the method (serum, POC, transcut) in the result array of objects
    // IE10+ compatible, so re-written as addMethod2 to handle older versions of IE
    function addMethod(method, element) {
        var newElement = {
            drawtime: element.drawtime,
            level: element.level,
            method: method
        };
        return newElement;
    }

    // Given a data point, give it its decorations based on risk zone
    function decorateDataPoint (dataPoint, hours, level, method, color, description) {
        dataPoint.customTooltip = '<span style="font-size: 0.85em"><b>' + hours + '</b> hours of age — <b>' + level + '</b> mg/dL (' + method + ')</span><br/>' +
            '<span style="color: ' + color + '"> &#9673; </span>' + description + ' risk zone';
        dataPoint.marker.lineColor = color;
        dataPoint.riskDescription = description;
        dataPoint.dataLabels.formatter = function () {
            return this.y + ' (' + description + ' risk)';
        };
    }


    // Given a result and risk zone, add it to the result table, along with corresponding follow-up recommendations
    function followupRecommendation (risk, birthGA) {
        var followupRecommendations = {
            noRisk: "",
            withRisk: "",
        };

        // Follow-up recommendations per 2009 Pediatrics article, stratified according
        // to Bhutani risk, GA and a second set of risk factors which we'll show
        // with a hover div
        const followupDescription = {
            young: {					// 35-37w6d
                noRiskFactors: {
                    highRisk: 'Evaluate for phototherapy, TSB in 4-24 h (inpatient or outpatient)',
                    highIntRisk: 'Evaluate for phototherapy, TcB/TSB within 24 h (inpatient or outpatient)',
                    lowIntRisk: 'If discharging < 72 h of age, follow up within 2 d',
                    lowRisk: 'If discharging in < 72 h of age, follow up within 2-3 d'
                },
                withRiskFactors: {
                    highRisk: 'Evaluate for phototherapy, TSB in 4-8 h (inpatient)',
                    highIntRisk: 'Evaluate for phototherapy, TSB in 4-24 h (inpatient or outpatient)',
                    lowIntRisk: 'If discharging < 72 h of age, follow-up within 2 d, consider TSB/TcB at follow-up',
                    lowRisk: 'If discharging < 72 h of age, follow up within 2 d'
                }
            },							// 38+ weeks
            notYoung: {
                noRiskFactors: {
                    highRisk: 'Evaluate for phototherapy, TSB in 4-24 h (inpatient or outpatient)',
                    highIntRisk: 'Follow up within 2 d, consider TcB/TSB at follow-up',
                    lowIntRisk: 'If discharging < 72 h of age, follow up within 2-3 d',
                    lowRisk: 'If discharging < 72 h of age, time follow-up according to age at discharge or concerns other than jaundice (e.g., breastfeeding)'
                },
                withRiskFactors: {		// Apparently I can't do this: =  this.young.noRiskFactors
                    highRisk: 'Evaluate for phototherapy, TSB in 4-24 h (inpatient or outpatient)',
                    highIntRisk: 'Evaluate for phototherapy, TcB/TSB within 24 h (inpatient or outpatient)',
                    lowIntRisk: 'If discharging < 72 h of age, follow up within 2 d',
                    lowRisk: 'If discharging in < 72 h of age, follow up within 2-3 d'
                }
            }
        }


        switch (risk) {
            case 'Low':
                if (birthGA >= 35 && birthGA < 38) {
                    followupRecommendations.noRisk += followupDescription.young.noRiskFactors.lowRisk;
                    followupRecommendations.withRisk += followupDescription.young.withRiskFactors.lowRisk;
                } else if (birthGA > 38) {
                    followupRecommendations.noRisk += followupDescription.notYoung.noRiskFactors.lowRisk;
                    followupRecommendations.withRisk += followupDescription.notYoung.withRiskFactors.lowRisk;
                } else {
                    followupRecommendations.noRisk += "(Not applicable under 35 weeks)";
                    followupRecommendations.withRisk += "(Not applicable under 35 weeks)";

                }
                break;
            case 'Low-intermediate':
                if (birthGA >= 35 && birthGA < 38) {
                    followupRecommendations.noRisk += followupDescription.young.noRiskFactors.lowIntRisk;
                    followupRecommendations.withRisk += followupDescription.young.withRiskFactors.lowIntRisk;
                } else if (birthGA > 38) {
                    followupRecommendations.noRisk += followupDescription.notYoung.noRiskFactors.lowIntRisk;
                    followupRecommendations.withRisk += followupDescription.notYoung.withRiskFactors.lowIntRisk;
                } else {
                    followupRecommendations.noRisk += "(Not applicable under 35 weeks)";
                    followupRecommendations.withRisk += "(Not applicable under 35 weeks)";
                }
                break;
            case 'High-intermediate':
                if (birthGA >= 35 && birthGA < 38) {
                    followupRecommendations.noRisk += followupDescription.young.noRiskFactors.highIntRisk;
                    followupRecommendations.withRisk += followupDescription.young.withRiskFactors.highIntRisk;
                } else if (birthGA > 38) {
                    followupRecommendations.noRisk += followupDescription.notYoung.noRiskFactors.highIntRisk;
                    followupRecommendations.withRisk += followupDescription.notYoung.withRiskFactors.highIntRisk;
                } else {
                    followupRecommendations.noRisk += "(Not applicable under 35 weeks)";
                    followupRecommendations.withRisk += "(Not applicable under 35 weeks)";
                }
                break;
            case 'High':
                if (birthGA >= 35 && birthGA < 38) {
                    followupRecommendations.noRisk += followupDescription.young.noRiskFactors.highRisk;
                    followupRecommendations.withRisk += followupDescription.young.withRiskFactors.highRisk;
                } else if (birthGA > 38) {
                    followupRecommendations.noRisk += followupDescription.notYoung.noRiskFactors.highRisk;
                    followupRecommendations.withRisk += followupDescription.notYoung.withRiskFactors.highRisk;
                } else {
                    followupRecommendations.noRisk += "(Not applicable under 35 weeks)";
                    followupRecommendations.withRisk += "(Not applicable under 35 weeks)";
                }
                break;
        }
        return (followupRecommendations);

    }



    // Test frame
    var { patient, results } = getBiliResultsForTesting('5/24/2020', '00:43');

    // We really need a birthDateTime; if it doesn't exist, we'll let them give us one
    if (patient.birthTime == null) {
        warnings.push({
            message: "Could not determine the birth time. Please either have the ward clerk enter one into the record, of if you know it, enter it here.",
            level: 'warning',
            textColor: 'black',

            dismissable: false,
            enterable: 'birthTime'
            });
    }

    if (patient.birthWeight < 0.5) {
        warnings.push({
           message: "Could not figure out the birth weight, or it doesn't seem valid: '" + patient.birthWeight + "'",
           level: 'warning',
           textColor: 'black',
           dismissable: true,
          });

    }

    if (!((patient.birthGA >= 36 && patient.birthWeight > 2) || (patient.birthGA >= 35 && patient.birthWeight > 2.5))) {
        warnings.push ({
            message: "The Bhutani risk zones are only valid for birth GA 36+ weeks and birth weight > 2 kg, or 35+ weeks and birth weight > 2.5 kg. " +
                "See the UpToDate article on 'Hyperbilirubinemia in the preterm infant' for alternative thresholds.",
            level: 'warning',
            textColor: 'black',
            linkButton: {
                text: "Hyperbilirubinemia article",
                link: 'https://www.uptodate.com/contents/unconjugated-hyperbilirubinemia-in-the-preterm-infant-less-than-35-weeks-gestation'
            },
            dismissable: true,

        });
        // console.log("Warned about birth weight + GA");

    } else if (patient.birthGA < 35) {
        warnings.push ({
            message: "The kid is too young.", // "The Bhutani nomogram does not define risk for infants with a birth gestational age under 35 weeks. See the UpToDate article on <a href='https://www.uptodate.com/contents/unconjugated-hyperbilirubinemia-in-the-preterm-infant-less-than-35-weeks-gestation'>Hyperbilirubinemia in the preterm infant</a> to see alternative thresholds.";
            level: 'warning',
            textColor: 'black',

            dismissable: false
        });
    }




    /*
    if (birthDateTime == null) {
       $('#resultTable').append('<div class="alert alert-danger"><b>Warning:</b> Could not figure out the birth date/time or it doesn\'t seem valid (' + birthDateTime + '</div>');
    if (results.birthWeight < 0.5) {
        $('#resultTable').append('<div class="alert alert-danger"><b>Warning:</b> Could not figure out the birth weight or it doesn\'t seem valid (' + results.birthWeight + ' kg)</div>');

    }


     */


    // Convert the text date/times (6/4/16 12:02) to their Javascript equivalents
    // May need to switch back to JQuery if we don't have IE 11
    // (Originally switched from JS map method to JQuery for IE compatibility)
    results.serum = results.serum.map(convertDateTime);
    // results.serum = $.map(results.serum, convertDateTime);
    results.POC = results.POC.map(convertDateTime);
    // results.POC = $.map(results.POC, convertDateTime);
    results.TCLab = results.TCLab.map(convertDateTime);
    // results.TCLab = $.map(results.TCLab, convertDateTime);

    // Add the methodology of the bilirubin assay to the array of objects (so, the array of serum levels adds a reference to each
    // object to the method being serum
    // Using the map method for brevity, and the .bind(null... in order to pass in an extra argument (the method),
    // so we don't need 3 different functions
    // Turns out this works in IE10+, but sometimes our EMR seems to insist on IE5 mode, so originally switched to a custom function
    results.serum = results.serum.map(addMethod.bind(null, 'serum'));
    // results.serum = addMethod2(results.serum, 'serum');

    results.POC = results.POC.map(addMethod.bind(null, 'POC'));
    // results.POC = addMethod2(results.POC, 'POC');

    results.TCLab = results.TCLab.map(addMethod.bind(null, 'transcut'));
    // results.TCLab = addMethod2(results.TCLab, 'transcut');

    // Now, merge all the arrays of results (from the different methodologies) into one big sorted array
    results.sortedResults = results.serum.concat(results.POC, results.TCLab).sort(function(a, b) {
        if (a.drawtime < b.drawtime) return -1;
        if (a.drawtime > b.drawtime) return 1;
        return 0;
    });

    const sickKidWarning  = ' with these risk factors: isoimmune disease, G6PD deficiency,<br>\n asphyxia, lethargy, temp instability, sepsis, albumin < 3.0 g/dL (if measured)</span>';
    var youngKidWarning = '';
    if (patient.birthGA < 38) {
        youngKidWarning = 'for infants 35w-37w6d GA';
    }
    var birthDateTime = Date.parse(patient.birthDay + ' ' + patient.birthTime);

    var hours, level, method, drawtime;

    // for (var i = results.sortedResults.length - 1; i >= 0; i--) {
    for (var i = 0; i <= results.sortedResults.length - 1; i++) {

        drawtime = results.sortedResults[i].drawtime;
        hours = ((drawtime - birthDateTime) / 3600000).toFixed(1);
        level = results.sortedResults[i].level;
        method = results.sortedResults[i].method;


        // var drawtime = results.sortedResults[i].drawtime;
        // var drawtimeAbbreviated = (1 + drawtime.getMonth()) + '/' + drawtime.getDate() + ' ' + drawtime.getHours() + ':' +  ('0' + drawtime.getMinutes()).slice(-2);
        var riskZonePlacement = riskZone.exceeds(hours, level);

        var treatmentZoneExceeded = treatmentZone.exceeds(hours, level, patient.birthGA);

        var markerShape;

        switch (method) {
            case 'serum':
                markerShape = 'circle';
                break;
            case 'POC':
                markerShape = 'diamond';
                break;
            case 'transcut':
                markerShape = 'square';
                break;
        }
        // Make a new object for each data point
        // The data labels for each point are hidden to start
        var dataPoint = {
            x: hours,
            y: level,
            drawtime: drawtime,
            method: method,
            riskZonePlacement: riskZonePlacement,
            treatmentZoneExceeded: [],
            followup: '',
            marker: {
                enabled: true,
                lineWidth: 3,
                lineColor: 'black',
                fillColor: 'black',
                symbol: markerShape
            },
            dataLabels: {						// Not actually visible, but considering a button to make them show up
                backgroundColor: 'green',
                borderColor: 'black',
                align: 'right',
                x: -5,
                y: -6,
                enabled: false,
                formatter: function () {
                    return this.y + " (low risk)"
                }
            }
        };



        // Given a risk zone placement, decorate the datapoint and tooltip, and add detail to the table row
        switch (riskZonePlacement) {
            case riskZone.low:
                decorateDataPoint(dataPoint, hours, level, method, 'green', 'Low');
                dataPoint.followup = followupRecommendation('Low', results.birthGA)
                break;

            case riskZone.lowIntermediate:
                decorateDataPoint(dataPoint, hours, level, method, 'yellow', 'Low-intermediate');
                dataPoint.followup = followupRecommendation( 'Low-intermediate', results.birthGA)
                break;

            case riskZone.highIntermediate:
                decorateDataPoint(dataPoint, hours, level, method, 'orange', 'High-intermediate');
                dataPoint.followup = followupRecommendation( 'High-intermediate', results.birthGA)
                break;
            case riskZone.high:
                decorateDataPoint(dataPoint, hours, level, method, 'red', 'High');
                dataPoint.followup = followupRecommendation( 'High', results.birthGA)
                break;

        }

        // If GA is 38+ weeks and the baby is well, the treatment threshold is the highest (low risk) line
        // If the GA is 38+ weeks and baby is sick, or 35-37w6d and the baby is well, it's the medium line
        // If the GA is 35-37w6d and sick, it's the low line (high risk)
        // First handle infants exceeding a phototherapy threshold
        switch (treatmentZoneExceeded.phototherapy) {

            case treatmentZone.high: // If we are 38+ weeks, we should never hit this case
                // redecorateDataPointForTreatment(dataPoint, 5, "phototherapy");
                dataPoint.marker.fillColor = treatmentZone.phototherapylineColor;
                dataPoint.marker.radius = 5;

                dataPoint.customTooltip += '<br><span style="color: ' + treatmentZone.phototherapylineColor + ';"> &#9673; </span>Exceeds phototherapy threshold for ' + youngKidWarning + ' ' + sickKidWarning;
                // dataPoint.treatmentZoneExceeded = "Exceeds phototherapy threshold " + youngKidWarning + sickKidWarning;
                dataPoint.treatmentZoneExceeded.push({message: "Exceeds phototherapy threshold for certain patients", youngAndSickKids: true});
                break;
            case treatmentZone.medium:
                dataPoint.marker.fillColor = treatmentZone.phototherapylineColor;
                dataPoint.marker.radius = 5;
                dataPoint.customTooltip += '<br><span style="color: ' + treatmentZone.phototherapylineColor + ';"> &#9673; </span>Exceeds phototherapy threshold for 35-37w6d healthy, or 38w+ GA infants ' + sickKidWarning;
                // dataPoint.treatmentZoneExceeded += "Exceeds phototherapy threshold for 35-37w6d healthy, or 38w+ GA infants " + sickKidWarning;
                dataPoint.treatmentZoneExceeded.push({message: "Exceeds phototherapy threshold for certain patients", youngKids: true, sickKids: true});
                break;
            case treatmentZone.low:
                dataPoint.marker.fillColor = treatmentZone.phototherapylineColor;
                dataPoint.marker.radius = 5;
                dataPoint.customTooltip += '<br><span style="color: ' + treatmentZone.phototherapylineColor + ';"> &#9673; </span>Exceeds phototherapy threshold for 38+ infants who are well';
                // dataPoint.treatmentZoneExceeded += "Exceeds phototherapy threshold for 38+ infants who are well";
                dataPoint.treatmentZoneExceeded.push({message: "Exceeds phototherapy threshold"});

                break;
        }


        // Then handle the case of infants exceeding the exchange transfusion threshold (one kid may exceed both)
        switch (treatmentZoneExceeded.transfusion) {
            case treatmentZone.high:
                dataPoint.marker.fillColor = treatmentZone.transfusionLineColor;
                dataPoint.marker.radius = 6;

                dataPoint.customTooltip += '<br><span style="color: ' + treatmentZone.transfusionLineColor +
                    '"> &#9673; </span>Exceeds transfusion threshold ' + youngKidWarning + sickKidWarning;
                // dataPoint.treatmentZoneExceeded = "Exceeds transfusion threshold " + youngKidWarning + sickKidWarning;
                dataPoint.treatmentZoneExceeded.push({message: "Exceeds transfusion threshold for certain patients", youngAndSickKids: true});

                break;
            case treatmentZone.medium:
                dataPoint.marker.fillColor = treatmentZone.transfusionLineColor;
                dataPoint.marker.radius = 6;

                dataPoint.customTooltip += '<br><span style="color: ' + treatmentZone.transfusionLineColor +
                    '"> &#9673; </span>Exceeds transfusion threshold for 35-37w6d healthy, or 38w+ GA infants with ' + sickKidWarning;
                // dataPoint.treatmentZoneExceeded += "Exceeds transfusion threshold for 35-37w6d healthy, or 38w+ GA infants " + sickKidWarning;
                dataPoint.treatmentZoneExceeded.push({message: "Exceeds transfusion threshold for certain patients", youngKids: true, sickKids: true});

                break;
            case treatmentZone.low:
                dataPoint.marker.fillColor = treatmentZone.transfusionLineColor;
                dataPoint.marker.radius = 6;

                dataPoint.customTooltip += '<br><span style="color: ' + treatmentZone.transfusionLineColor +
                    '"> &#9673; </span>Exceeds transfusion threshold for 38+ GA infants who are well';
                // dataPoint.treatmentZoneExceeded += "Exceeds transfusion threshold for 38+ infants who are well";
                dataPoint.treatmentZoneExceeded.push({message: "Exceeds transfusion threshold"});

                break;
        }
        resultsSeries.push(dataPoint);
    }

</script>

<style scoped>
    .gentle-transition-enter-active, .gentle-transition-leave-active {
      transition: all 0.3s ease;
    }
    .gentle-transition-enter, .gentle-transition-leave-to {
        opacity: 0;
    }
    .result-table {
        table-layout: auto;
        width: 50%;
    }
    .result-table th {
        color: slategrey;
    }
    .result-table td {
        color: #1D1D1D;
        word-wrap: break-all;
    }
    .result-table-wide-col td {
        width: 100px;
    }
    .result-table-left-align th {
        text-align: left;
    }

</style>
