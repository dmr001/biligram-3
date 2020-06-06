<template>
    <div>
        <q-btn size="sm" color="dark" icon="mdi-image-multiple"  round @click="copyChart()">
            <q-tooltip self="center middle" anchor="top middle">Copy graph to clipboard</q-tooltip>
        </q-btn>




        <div id="copiedImage"></div>

        <q-dialog v-model="graphPopup">
            <q-card>
                <q-card-section class="row items-center q-pb-none">
                    <q-space></q-space>
                    <q-btn icon="close"  flat outline round dense v-close-popup></q-btn>

                        <div id="readyToCopy">
                            Right-click on the graph and select 'Copy image';
                            You can then paste it into a progress note.
                        </div>

                </q-card-section>
                <q-separator></q-separator>
                <q-card-section>
                    <div id="png-container"></div>
                </q-card-section>
                <!---
                <q-card-section>
                    <q-btn v-close-popup flat color="primary" size="md" label="Close"></q-btn>
                </q-card-section>
                --->
            </q-card>
        </q-dialog>
    </div>
</template>

<script>
    /*
     * Convert SVG to canvas using canvg to users can copy graphs from here
     * and paste them into the EMR
     *
     */

    // import canvgv2  from 'canvg';
    // import Canvg from 'canvg';


    export default {
        name: "Copy",
        components: {},
        data () {
          return {
              graphPopup: false
          }
        },
        methods: {
            showCopyDialog () {
                this.$q.dialog({
                    component: null,

                    // optional if you want to have access to
                    // Router, Vuex store, and so on, in your
                    // custom component:
                }).onOk(() => {
                    // console.log('OK')
                }).onCancel(() => {
                    // console.log('Cancel')
                }).onDismiss(() => {
                    // console.log('Called on OK or Cancel')
                })

            },

            copyChart: function() {
                this.graphPopup = true;
                // let v = null;

                    // const canvas = document.querySelector('canvas');
                    var canvas = document.createElement('canvas');
                    canvas.width = 1800;
                    canvas.height = 400;
                    var ctx = canvas.getContext('2d');
                    // console.log("Calling querySelector");
                    var DOMURL = self.URL || self.webkitURL || self;
                    var img = new Image();
                    var svgString = new XMLSerializer().serializeToString(document.querySelector('#chart svg'));


                    var svg = new Blob([svgString], {
                       type: "image/svg+xml;charset=utf-8"
                    });
                    var url = DOMURL.createObjectURL(svg);
                    // console.log("Entering onload. URL = " + url + "\nctx = " + ctx + "\nsvgBlob =" + svg);
                    img.onload = function () {
                        // console.log("Starting onload");
                        ctx.drawImage(img, 0, 0);
                        // console.log("Drew img");
                        var png = canvas.toDataURL("image/png");
                        // console.log("In onload, png = " + png);

                        document.querySelector("#png-container").innerHTML = '<img src="' + png + '" width=50%/>';
                        DOMURL.revokeObjectURL(png);
                        // var image = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
                        // window.location.href = image;
                    }

                    img.src = url;
                    // console.log("Called querySelector");

                    // var svgml = getSvgml(svg);   // Need for IE, not Chrome/Safari
                    // console.log("Called getSvgml");

                    // var width = svg.width();
                    // var height = svg.height();

                    // const ctx = canvas.getContext('2d');
                    // console.log("Calling Canvg");

                    // Canvg uses Promises... which aren't available in IE11, which is what Epic
                    // is using as of Feb 2020. Hopefully Babel will transpile this
                /*
                    window.onload = async () => {

                        v =  await Canvg.from(ctx, svg.outerHTML, {
                            ignoreMouse: true,
                            ignoreAnimation: true,
                        });
                        v.start();

                    }
                */
                    /*
                    canvgv2(canvas, svg.outerHTML, {
                        ignoreMouse: true,
                        ignoreAnimation: true,
                    });
                    */
                    // console.log("Called Canvg; v: " + v);
                    // v.start();

                /*
                document.getElementById('readyToCopy').style.display = 'block'; // show; none would hide
                // re-render the chart, disabling any tooltips, since those
                // don't print correctly in the image
                // // ui.renderChart(infant, 'container', false);
                */

                /*
                setTimeout(function() {
                    // make the png
                    makeImage('#container svg', '#copiedImage');

                    // var html = $('body').html(); // cache the raw body
                    // var html = document.getElementById('body').html();

                    // hide the body, then replace it with the png div only
                    // then delete all other body content so
                    // the right click copy works well in the EMR
                    // $('body').fadeOut(100);

                    // document.getElementById('body').fadeOut(100);

                    // $('body').html($('#copiedImage'));
                    // document.getElementById('body').html(document.getElementById('copiedImage'));

                    // attach handle to the copied image to put
                    // everything "back" when the copy has completed
                    /*
                    $('#copiedImage').contextmenu(function(e) {
                        setTimeout(function() {
                            $('body').html(html);
                            renderData(infant);
                        }, 6000);
                    });



                    document.getElementById('copiedImaged').contextmenu(function(event) {
                        setTimeout(function () {
                            document.getElementById('body').html(html);
                            // renderDate(infant);
                        }, 6000);
                    });



                    // $('body').fadeIn(400);
                    // document.getElementById('body').fadeIn(400);
                }, 1200);
                */

            }
        },
        mounted() {


        }

    }

    /**
     * setupCopyPaste - setup right clicking on the chart popping
     * up a message to instruct them to right-click
     * on the image that will appear,
     *
     * create the image
     *
     * hide the original content of the page and
     * replace with just the image
     *
     * @param  {type} infant description
     */

    /*
    function setupCopyPaste(infant) {
        $('#chart').contextmenu(function(e) {
            // show the warning message
            $('#readyToCopy').show();
            // re-render the chart, disabling any tooltips, since those
            // don't print correctly in the image
            ui.renderChart(infant, 'container', false);

            // give it a little time for the user to
            // see the "readyToCopy" message
            setTimeout(function() {
                // make the png
                copy.makeImage('#container svg', '#copiedImage');

                var html = $('body').html(); // cache the raw body
                // hide the body, then replace it with the png div only
                // then delete all other body content so
                // the right click copy works well in Epic
                $('body').fadeOut(100);
                $('body').html($('#copiedImage'));

                // attach handle to the copied image to put
                // everything "back" when the copy has completed
                $('#copiedImage').contextmenu(function(e) {
                    setTimeout(function() {
                        $('body').html(html);
                        renderData(infant);
                    }, 6000);
                });

                $('body').fadeIn(400);
            }, 1200);

            e.preventDefault();
            e.stopPropagation();
        });
    }
    */


    /**
     * getSvgml -  getting the "html" from the SVG is tricky in IE
     * you can't just get it. so we get the parent of it
     * and change replace all the svg attributes
     * its a hack, but it works and its not too hard.
     * @param  {type} svg description
     * @return {string}  svg content
     */

    /*
    function getSvgml(svg) {
        var s = svg[0].parentNode.innerHTML;
        var svghtml = '<svg></svg>';

        if (s) {
            svghtml = s.replace(/<svg.*?>/g, '<svg>');
            svghtml = svghtml.substring(0, svghtml.indexOf('</svg>')) + '</svg>';
        }

        return svghtml;
    }
    */
    /**
     * makeImage - Convert an SVG to a PNG
     *
     * @param  {type} svgSelector jquery selector for the SVG content
     * @param  {type} destination jqeury selector for placing the new PNG image tag
     *
    function makeImage(svgSelector, destination) {
        // var svg = $(svgSelector);
        var svg = document.querySelector(svgSelector);
        var svgml = getSvgml(svg);
        var width = svg.width();
        var height = svg.height();

        var canvas = document.createElement('canvas');
        canvas.height = height;
        canvas.width = width;
        /*
        canvg(canvas, svgml, {  // canvg(target, s, opts)
            ignoreMouse: true,
            ignoreAnimation: true,
        });
        */

        /*
        canvgv2(canvas, svgml, {  // Canvg(target, s, opts)
            ignoreMouse: true,
            ignoreAnimation: true,
        });

        var png = canvas.toDataURL('image/png');
        /*
        $(destination).append($('<img>', {
            height: height,
            width: width,
            src: png,
        }));

        document.querySelector(destination).appendChild(document.getElementsByTagName('img'), {
            height: height,
            width: width,
            src: png
            });
    } */

</script>

<style scoped>

</style>
