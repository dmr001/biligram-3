<template>
    <div></div>
</template>

<script>


    // Incoming results from Epic
    var results = {};

    // The actual array of objects we'll plot on the graph, based on the results
    var resultsSeries = [  ];



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
        name: "CurvesComponent",
        props: {

        },
        methods: {

        },
        data () {
            return {

                 series: [{
                        id: 'HRZ',
                        name: 'High risk zone',
                        color: 'red',
                        type: 'arearange',
                        data: addXCoordinatesWithRange(riskZone.series[riskZone.highIntermediate], riskZone.series[riskZone.high], riskZone.interval, riskZone.startsAt)
                    }, {
                        id: 'HIRZ',
                        name: 'High-intermediate risk zone',
                        color: 'orange',
                        type: 'arearange',
                        data: addXCoordinatesWithRange(riskZone.series[riskZone.lowIntermediate], riskZone.series[riskZone.highIntermediate], riskZone.interval, riskZone.startsAt)
                    }, {
                        id: 'LIRZ',
                        name: 'Low-intermediate risk zone',
                        color: 'yellow',
                        type: 'arearange',
                        data: addXCoordinatesWithRange(riskZone.series[riskZone.low], riskZone.series[riskZone.lowIntermediate], riskZone.interval, riskZone.startsAt)
                    }, {
                        id: 'LRZ',
                        name: 'Low risk zone',
                        color: 'green',
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

                    ],


                // Bhutani risk zones
                riskZone: {
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
                },



                // Phototherapy treatment zone thresholds literal object
                // For phototherapy, we exceed the treatment threshold for infants at low risk (>= 38 weeks GA and well) at the top line,
                // at medium risk (>= 38 week + risk factors of isoimmune hemolytic disease, G6PD deficiency, asphyxia, significant lethargy,
                // temperature instability, sepsis, acidosis or an albumin level < 3.0 g/dL if measured) or 35-37w6d and well
                // or for high risk infants 35-37w6d + risk factors
                // Phototherapy zones start at 0 hours of life
                treatmentZone: {
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
                }



            };

        }
    }
</script>

<style scoped>

</style>
