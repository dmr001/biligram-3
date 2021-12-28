<template>
  <v-dialog

    max-width="70%"
    v-model="dialog"
    @keydown.esc="cancel"
  >
    <v-card>
      <v-toolbar color="gray" dark>
        General Help
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
      <v-card-title>Using Biligram</v-card-title>

      <v-card-text>
                <ul>
                    <li>Click on legends (like "Low risk zone" or "Transfusion threshold")
                    to make them appear/disappear</li>
                    <li>Click and drag boxes to magnify, then shift-click to pan to get a closer look.</li>
                    <li>Click the Reset Zoom box on the upper right to return to the original view.</li>

                </ul>

      </v-card-text>
      <v-card-text>
        <p><b>Right-side icons</b></p>
        <v-simple-table>
          <thead>
          <tr>
          <th>Icon</th> <th>Description</th>
          </tr>
          </thead>
          <tbody>
          <tr  class="ma-5">
            <td><v-icon>crib</v-icon></td>
            <td>Baby name</td>
          </tr>
          <tr>

            <td><v-icon>area_chart</v-icon></td>
            <td>Selects between standard AAP treatment curves (35+ weeks),
              NCNC curves (35+ weeks) and Stanford Premie BiliRecs (27-35 weeks)</td>
          </tr>

          <tr>
            <td><v-icon>error</v-icon></td>
            <td>Turn this switch on to highlight data points exceeding treatment thresholds
              that are applicable on for infants with neurotoxicity risk factors
              (which vary a bit between AAP and NCNC curves</td>
          </tr>
          <tr>
            <td><v-icon>mdi-image-multiple</v-icon></td>

          <td>
            <b>Copy the graph to the clipboard</b> so you can paste it into a progress note: <br/>
            <ul>
              <li>
                Click on the Copy button (next to the icon)
                on the right. The image is now on the clipboard.
              </li>
              <li>
                Close the copy window, and (when you're ready) Biligram.
                Place the cursor into the note, at the position you want to copy the graph to.
              </li>
              <li>
                Press Control-V (or right-click, Paste) to add the graph to your note.
              </li>
            </ul>
          </td>
          </tr>
          </tbody>
        </v-simple-table>
      </v-card-text>

      <v-divider></v-divider>
      <br />
      <v-card-text>
        <p><b>References</b></p>

        <a href="#" @click="go('https://pediatrics.aappublications.org/content/114/1/297')">
          Management of Hyperbilirubinemia in the Newborn Infant 35 or More Weeks of Gestation</a> &mdash;
        the original article from 2004 describing the use of the Bhutani nomogram

        <br/>

        <a href="#" @click="go('https://pediatrics.aappublications.org/content/124/4/1193')">
          Hyperbilirubinemia in the Newborn Infant &ge;35 Weeks’ Gestation: An Update With Clarifications</a> &mdash;
        adds some management guidelines to the risk stratification
        in the original article



      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn text @click.native="cancel">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import "material-icons";
import AglService from "@/agl/AglService";

export default {
    name: "GeneralHelp",

    data () {
        return {
            dialog: false,
            displayAAPArticle: false,
            displayAAPArticle2: false,
            publicPath: process.env.BASE_URL

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
