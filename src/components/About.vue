<template>
  <v-dialog

    max-width="60%"
    v-model="dialog"
    @keydown.esc="cancel"
  >
    <v-card>
      <v-toolbar color="gray" dark>
        <span style="color: gray">About</span> Biligram
        <v-spacer></v-spacer>
        <v-btn
          x-small
          fab
          depressed
          dark
          color="black"
          @click.native="cancel"
          ><v-icon>clear</v-icon></v-btn
        >
      </v-toolbar>
      <v-card-title>Version 3.0 (Vue.js, 2021)</v-card-title>

      <v-card-text>
        Previous Javascript versions 2.0-2.2 (2016-2019)
        <br/>Previous C# versions 0.1-0.3 (2013-2015)<br/>

            <br/>Calculates newborn bilirubin risk zones and displays treatment thresholds.
            Use of this software does not constitute medical advice; it's merely a tool to help clinicians through the mechanics of plotting data.
            It could even be terribly wrong, so when making treatment decisions with potentially serious consequences
            it's always best to check your work.
            <br/>
            <v-row>
                <v-col>
            <br/><strong>Written and fussed over by</strong>
            <br/><span class="text-bold">Daniel Rosenberg MD</span>
            <br/>Providence Medical Group
            <br/>Portland, Oregon
                </v-col>
                <v-col>

            <br/><strong>Ongoing counsel</strong>
            <br/><span class="text-bold">Maulin Shah MD</span>
            <br/>Providence Health & Services
            <br/>Portland, Oregon
                </v-col>
            </v-row>

      </v-card-text>
      <v-divider></v-divider>
      <br />
      <v-card-text class="text-caption">

            Graph library: <b>Highcharts</b>, with thanks to
            <a href="#" @click="go('https://shop.highsoft.com/faq')">Highsoft</a>, Vik i Sogn, Norway.
              Used here under their non-commercial license. Use is not free for commercial or government entities; such entities should
              purchase a <a href="#" @click="go('https://shop.highsoft.com')">license</a>.
            <br/><br/>
            FHIR client / <a href="#" @click="go('https://smarthealthit.org')">SMART on FHIR</a> API, Boston Children's Hospital, released under the Apache license.
            <br/><br/>
            Copyright &copy; 2021 Providence Health &amp; Services.<br/>
            Released under the <a href="#" @click="go('https://opensource.org/licenses/MIT')">MIT license</a>:
        Permission is hereby granted, free of charge, to any person obtaining a copy of this software
        and associated documentation files (the "Software"), to deal in the Software without restriction,
        including without limitation the rights to use, copy, modify, merge, publish, distribute,
        sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
        furnished to do so, subject to the following conditions:

        The above copyright notice and this permission notice shall
        be included in all copies or substantial portions of the Software.

        THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
        INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE
        AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
        DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
        OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
            <br/><br/>
            <span class="">

            </span>
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn text @click.native="cancel">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>

import AglService from "@/agl/AglService";

export default {
    name: "About",

    data () {
        return {
            dialog: false
        }
    },
    methods: {
        open() {
            this.dialog = true;
        },
        cancel() {
            this.dialog = false;
        },
      go(url) {
        AglService.openWindow(url);
      }
    }

}

</script>
