<template>
  <v-dialog

    max-width="60%"
    v-model="dialog"
    @keydown.esc="cancel"
  >
    <v-card>
      <v-toolbar color="gray" dark>
        Biligram Premie Bilirecs Help
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
      <v-card-title>Stanford Premie Bilirecs</v-card-title>

      <v-card-text>
                        <ul>
                    <li>Adapted from <a href="#" @click="go('https://pbr.stanfordchildrens.org/about/')">
                      Stanford Premie BiliRecs</a></li>
                    <li>Which, in turn, is adapted from Maisels, Watchko, Bhutani and Stevenson's
                      <a href="#" @click="go('https://www.nature.com/articles/jp201271')">
                        An Approach to the Management of Hyperbilirubinemia in the Preterm Infant Less Than 35 Weeks of Gestation</a>.</li>

                          <li>These are based on expert recommendations (due to limited prospective evidence).</li>
                    <li>The thresholds are valid only from preterm infants 27w0d through 34w6d who are at least 48 hours old.</li>
                    <li>Bhutani risk zones and AAP treatment thresholds are not valid under 35 weeks.</li>

                </ul>

      </v-card-text>
      <v-card-text>
                        With thanks to Jonathan Palma, MD, MS, Stanford University
      </v-card-text>
      <v-divider></v-divider>
      <br />
      <v-card-text class="text-caption">

                These tools are for reference only; clinicians should use their professional judgment in determining appropriate therapy.
                This software is provided without cost, and without warranties of any kind. Providence disclaims any liability whatsoever
                related to the use of this tool; your use indicates acceptance of these terms. Stanford University similarly disclaims any
                liability.
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
    name: "PremieHelp",
    props: {
        aboutProp: Boolean
    },
    data () {
        return {
            dialog: false,
            displayMaiselsArticle: false,
            // publicPath: process.env.BASE_URL

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
