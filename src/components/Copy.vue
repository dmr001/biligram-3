<template>
  <v-dialog max-width="60%" v-model="dialog" @keydown.esc="cancel">
    <!-- div v-if="!isIE()" -->
    <v-card color="#385F73"
              dark >
      <v-toolbar color="gray" dark>
        Copy chart
        <v-spacer></v-spacer>
        <v-btn x-small fab depressed dark color="black" @click.native="cancel">
          <v-icon>clear</v-icon>
        </v-btn>

      </v-toolbar>
      <v-card-title color="primary" class="text-caption">
        The graph is on the clipboard; you can close this window and paste it into the EMR.
      </v-card-title>
      <v-card-text>
        <div id="png-container">"Rendering copyable chart here..."</div>
      </v-card-text>
      <v-card-actions class="justify-end">
        <!-- v-btn text @click.native="copy('png-container')">Copy to clipboard</v-btn -->
        <v-btn text @click.native="cancel">Close</v-btn>
      </v-card-actions>
    </v-card>
    <!-- /div -->
    <!-- div v-else>
      <v-card color="#385F73"
              dark >
        <v-card-title color="primary">
          Copying the chart
        </v-card-title>


        <v-card-text>
          First, close this dialog box.<br/>
          Then, right-click on the graph,  select "Copy," and then paste it into a
          progress note.
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn text @click.native="cancel">Close</v-btn>
        </v-card-actions>
      </v-card>
    </div -->
  </v-dialog>
</template>

<script>
import Canvg, { presets } from "canvg";
// import "canvas-toBlob";

// eslint-disable-next-line no-unused-vars
async function render(width, height) {
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext('2d');
  const svg = document.querySelector("#chart svg");
  const v = await Canvg.from(ctx, svg, presets.offscreen());

  // Render only first frame, ignoring animations and mouse.
  await v.render();

  const blob = await canvas.convertToBlob();
  const pngUrl = URL.createObjectURL(blob);
  console.log('PNG', pngUrl);

}

// eslint-disable-next-line no-unused-vars
function copyImage(url){
  console.log("Attempting to get the image at this URL onto the clipboard: ", url);
  var img = document.createElement('img');
  img.src = url;
  document.body.appendChild(img);
  var r = document.createRange();
  r.setStartBefore(img);
  r.setEndAfter(img);
  r.selectNode(img);
  var sel = window.getSelection();
  sel.addRange(r);
  document.execCommand('Copy');
}


async function renderIE(width, height) {
  // currentSvg = svg;


  // const svgElement = document.querySelector("#chart svg");

  const svgElement = document.querySelector("#chart svg");
  const svgString = new XMLSerializer().serializeToString(svgElement);
  let canvas = document.createElement("canvas");
  console.log("SVG: ", svgElement);
  canvas.width = width || 450; // svg.width.baseVal.value;
  canvas.height = height || 200; // svg.height.baseVal.value;
  let ctx = canvas.getContext("2d");
  console.log("Calling Canvg.fromString")
  const v = await Canvg.fromString(ctx, svgString);
  await v.render();
  console.log("Returned with v: ", v);

  // Couldn't get canvas.msToBlob to work in IE11

  let pngContainer = document.querySelector("#png-container");

  pngContainer.setAttribute("contentEditable", true);
  pngContainer.innerHTML = '';
  let img = new Image(); // width=400 was too small
  img.src = canvas.toDataURL();
  console.log("Img: ", img)
  // document.body.appendChild(img);

  pngContainer.appendChild(img)

  // pngContainer.innerHTML =
  //     '<img src="' + URL.createObjectURL(canvasBlob) + '" width=80%/>';  console.log('pngContainer: ', pngContainer)

  console.log("pngContainer: ", pngContainer)


  /// Get the graph on the clipboard
  // document.body.appendChild(img);
  var r = document.createRange();
  r.setStartBefore(img);
  r.setEndAfter(img);
  r.selectNode(img);
  console.log("Range to copy: ", r)
  var sel = window.getSelection();
  sel.addRange(r);
  let success = document.execCommand('Copy');
  console.log("Copy image: ", success)
  // copyImage(img.src);

  // document.body.appendChild(pngContainer);
  // window.getSelection().selectAllChildren(pngContainer);
  // document.execCommand("copy");
  // // document.body.removeChild(aux);
  // console.log("COPY");

}


// eslint-disable-next-line no-unused-vars
function renderChrome(width, height) {
  // Native method. This works fine in Chrome, but not IE11, due to IE11 security error when
  // we try canvas.toDataURL
  // http://bl.ocks.org/biovisualize/8187844
  var DOMURL = self.URL || self.webkitURL || self;
  var svgString = new XMLSerializer().serializeToString(
    document.querySelector("#chart svg")
  );

  console.log("Non-IE render.");
  let canvas = document.createElement("canvas");
  canvas.width = width || 900; // svg.width.baseVal.value;
  canvas.height = height || 400; // svg.height.baseVal.value;
  const ctx = canvas.getContext("2d");

  var svg = new Blob([svgString], {
    type: "image/svg+xml;charset=utf-8",
  });

  var url = DOMURL.createObjectURL(svg); // This is supposed to work down to IE9
  console.log(
    "Entering onload. URL = " + url + "\nctx = " + ctx + "\nsvgBlob =" + svg
  );

  var img = new Image();

  img.onload = function () {
    console.log("Starting onload");
    ctx.drawImage(img, 0, 0);
    // console.log("Drew img");
    var png = canvas.toDataURL("image/png"); // Generates a SecurityError in IE11
    console.log("Non-IE: In onload, png = " + png);

    document.querySelector("#png-container").innerHTML =
      '<img src="' + png + '" width=50%/>';
    // var canvasOutput = document.querySelector("#png-container");
    // canvasOutput.innerHTML = '<img src="' + png + '" width=50%/>';

    DOMURL.revokeObjectURL(png);
    // var image = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    // window.location.href = image;
  };

  img.src = url;
  console.log("Called querySelector");
  // End native method
}

export default {
  name: "Copy",

  data() {
    return {
      dialog: false,
      graphPopup: false,
    };
  },
  methods: {
    open() {
      this.dialog = true;
      this.copyChart();
    },
    cancel() {
      this.dialog = false;
    },
    copy(element_id) {   // Copy the SVG -> PNG render to the clipboard
      var aux = document.createElement("div");
      aux.setAttribute("contentEditable", 'true');
      aux.innerHTML = document.getElementById(element_id).innerHTML;
      console.log("aux: ", aux);
      document.body.appendChild(aux);
      window.getSelection().selectAllChildren(aux);
      document.execCommand("copy");
      document.body.removeChild(aux);
      console.log("COPY");
    },
    isIE() {
      // return (true);
      return (navigator.userAgent.includes("Trident") === true);  // IE doesn't handle the drawer well
    },
    copyChart: function () {
      this.graphPopup = true;

      renderIE(900, 400);

      // var testIE = true;
      //
      // // Copy button was pressed.
      //
      //
      // if (
      //   navigator.userAgent.indexOf("MSIE") > -1 ||
      //   navigator.userAgent.indexOf("rv:") > -1 ||
      //   testIE
      // ) {
      //   renderIE(900, 400); // renderIE
      // } else {
      //   renderChrome(900, 400);
      // }
    },
  },
};
</script>