<template>
  <v-container fluid id="container">
    <div>
      <v-simple-table dense v-if="resultsSeries.length">
        <thead>
        <tr>
          <th>
            <v-btn
                outlined
                color="primary"
                icon

                x-small
                @click="toggleTableRows()"
            >
              <v-icon small v-if="resultTableShowLatest"
              >mdi-chevron-down
              </v-icon
              >
              <v-icon small v-else>mdi-chevron-up</v-icon>
            </v-btn>
          </th>

          <th></th>
          <th></th>

          <th v-if="thresholdSelection !== 'premie'"><span style="float: left">Follow-up recommendations</span></th>

          <th></th>
        </tr>
        <tr>
          <th>Time / age</th>
          <th>Bilirubin</th>
          <th v-if="thresholdSelection !== 'premie'">Risk zone</th>
          <th v-if="thresholdSelection !== 'premie'" colspan="2">
              <span style="float: left">Hyperbilirubinemia
                <a href="#" @click.stop="riskFactorsDialog = true"
                >risk factors</a>:
                <v-dialog
                    v-model="riskFactorsDialog"
                    transition="dialog-bottom-transition"
                    scrollable
                    max-width="90%"
                >
                  <v-card>
                    <v-toolbar color="gray" dark>
                      Discharge planning: Hyperbilirubinemia risk factors
                      <v-spacer></v-spacer>
                      <v-btn x-small fab depressed color="black" dark @click="riskFactorsDialog = false">
                        <v-icon>clear</v-icon>
                      </v-btn>

                    </v-toolbar>
                    <v-row>
                    <v-col>
                    <v-card-title>
                      Major risk factors
                    </v-card-title>
                    <v-card-text>
                      <p>
                      <i>In approximate order of importance</i>
                      </p>

                      <ul class="text-body-2">
                        <li>High risk (red zone) predischarge TSB or TcB</li>
                        <li>Jaundice in the first 24 h of life</li>
                        <li>DAT+ ABO incompatibility or other known hemolytic disease (e.g., G6PD deficiency) </li>
                        <li>GA 35-36 weeks</li>
                        <li>Older sibling received phototherapy</li>
                        <li>Cephalohematoma or significant bruising</li>

                        <li>
                          Exclusive breastfeeding, particularly if nursing is
                          not going well and/or weight loss is excessive (8 –
                          10%)
                        </li>

                        <li>East Asian race</li>
                      </ul>
                    </v-card-text>
                      </v-col>
                    <v-col>
                      <v-card-title>Minor risk factors</v-card-title>
                      <v-card-text>
                      <ul class="text-body-2">
                        <li>High-intermediate risk (orange zone) pre-discharge TSB/TcB</li>
                        <li> GA 37--38 weeks</li>
                        <li>Jaundice before discharge</li>
                        <li>Previous sibling with jaundice</li>
                        <li>Macrosomic infant of diabetic mother</li>
                        <li>Maternal age &ge; 25</li>
                        <li>Male gender</li>
                      </ul>
                      </v-card-text>

                      <v-card-title>Decreased risk of jaundice</v-card-title>
                      <v-card-text>
                      <ul class="text-body-2">
                        <li>Low-risk (green zone) TSB/TcB</li>
                        <li>GA &ge; 41 weeks</li>
                        <li>Exclusive bottle-feeding</li>
                        <li>Black race</li>
                        <li>Discharge from hospital after 72 h</li>
                      </ul>
                        </v-card-text>
                    </v-col>
                    </v-row>
                    <v-divider></v-divider>
                    <br/>
                    <v-card-text class="text-caption">
                      <p>See <a href="#" @click="go('https://pediatrics.aappublications.org/content/114/1/297/T4')">Table 2</a> in
                        "Management of hyperbilirubinemia in the newborn infant 35 or more weeks of gestation."
                      </p>
                      <p>
                        <i>GA and predischarge TSB or TcB
                          are the most important factors to
                          predict the risk of hyperbilirubinemia. Risk
                          increases with each decreasing week of gestation from
                          42–35 weeks.</i>
                      </p>
                    </v-card-text>
                    <v-card-actions class="justify-end">
                      <v-btn text @click="riskFactorsDialog = false"
                      >Close</v-btn
                      >
                    </v-card-actions>
                  </v-card>
                </v-dialog>
                <v-btn-toggle
                    v-model="resultTableFollowupRisk"
                    @input="toggleTableColumns()"
                >
                  <v-tooltip top>
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn v-bind="attrs" v-on="on" small>Absent</v-btn>
                    </template>
                    <span>
                      NONE of: hyperbilirubinemia risk factors (click on risk factors link)</span
                    >
                  </v-tooltip>

                  <v-tooltip top>
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn v-bind="attrs" v-on="on" small>Present</v-btn>
                    </template>

                    <span>
                      ANY of: hyperbilirubinemia risk factors click on risk factors link)</span
                    >
                  </v-tooltip>
                </v-btn-toggle>
              </span>
          </th>
          <th v-else>
            Recommendations
          </th>
        </tr>
        </thead>
        <tbody>
        <tr @mouseover="selectRow(rowIndex, true)" @mouseout="selectRow(rowIndex, false)"
            v-for="(row, rowIndex) in resultTableShowLatest
              ? resultsSeries.slice(
                  resultsSeries.length - 1,
                  resultsSeries.length
                )
              : resultsSeries.slice().reverse()"
            :key="rowIndex"
        >
          <td class="text-caption grey lighten-5">
            {{ format(row.drawtime, "M/d HH:mm") }}<br/>
            <span v-if="thresholdSelection === 'premie'">
              <i>{{ (row.xHours / 24).toFixed(1) }} d &ndash; {{ row.xWeeks }} w</i>
            </span>
            <span v-else class="text-right text-small text-caption">
              <i>{{ row.x }} h</i>
            </span>
          </td>

          <td :class="lightenRowColor(row.tableRowColor)">
            <div v-if="row.y">
              {{ row.y }}
            </div>
            <div>
              <v-chip color="accent" x-small>{{ row.method }}</v-chip>
            </div>
          </td>

          <td v-if="thresholdSelection !== 'premie'"
              class="text-caption"
              :style="
                row.tableRowColor === 'yellow' || row.tableRowColor === 'orange'
                  ? `background-color:${row.tableRowColor}; color:black`
                  : `background-color:${row.tableRowColor}; color:white`
              "
          >
              <span v-if="row.y">
                {{ row.riskDescription }}
              </span>
          </td>

          <td class="text-caption" v-if="thresholdSelection !== 'premie'">
              <span v-if="row.y">
                <span v-if="resultTableFollowupRisk" v-html="row.followup.withRisk"></span>
                <span v-else v-html="row.followup.noRisk"></span>

              </span>
          </td>

          <td
              v-if="row.marker.fillColor !== row.tableRowColor ||
                (thresholdSelection === 'premie' && row.marker.fillColor !== 'black')"
              :style="`background-color:${row.marker.fillColor}; color:white`"
          >
            <span>
              <div
                  class="text-caption"
                  v-for="treatmentZoneExceeded in row.treatmentZoneExceeded"
                  :key="treatmentZoneExceeded.message"
              >
                {{ treatmentZoneExceeded.message }}
                <div v-if="treatmentZoneExceeded.youngAndSickKids">
                  <v-tooltip top>
                    <template v-slot:activator="{ on, attrs }">
                      <span v-bind="attrs" v-on="on">
                        <br/>
                        <v-chip
                            small
                            color="warning"

                        >35w-37w6d GA + neurotoxicity risk factors
                        </v-chip>
                      </span>
                    </template>
                    <span>
                      {{ riskFactorsDescription }}
                    </span>
                  </v-tooltip>
                </div>
                <br/>
                <v-chip
                    v-bind="attrs"
                    v-on="on"
                    small
                    color="accent"
                    v-if="treatmentZoneExceeded.youngKids"
                >35w-37w6d GA</v-chip>
                <span v-if="treatmentZoneExceeded.sickKids">
                  <v-tooltip top>
                    <template v-slot:activator="{ on, attrs }">
                      <span v-bind="attrs" v-on="on">
                        <br/>
                        <v-chip
                            color="info"
                            small
                        >Neurotoxicity risk factors
                        </v-chip>
                      </span>
                    </template>
                    <span>
                      {{ riskFactorsDescription }}
                    </span>
                  </v-tooltip>
                </span>
              </div>
            </span>
          </td>
        </tr>
        </tbody>
      </v-simple-table>
    </div>
  </v-container>
</template>

<script>
// import RiskFactorsDialog from "@/components/RiskFactorsDialog";
import { format } from "date-fns";
import AglService from "@/agl/AglService";
import colors from "vuetify/lib/util/colors";
// import store from "@/store";


export default {
  name: "Table",
  data() {
    return {
      colors,
      resultTableShowLatest: 1,
      resultTableFollowupRisk: 0,
      riskFactorsDialog: false,
      riskFactorsDialogText: `
                

      `,
    };
  },
  created: function () {
    console.log("Table created");
  },
  mounted: function () {
    console.log("Table mounted");

  },
  props: {
    resultsSeries: Array,
    thresholdSelection: String, // aap, ncnc, premie
    seriesRef: Number, // Which item in the array is in this series? Used for gross $parent reference back to Highcharts object
    // chart: Object,
    // patient: Object
  },
  computed: {
    riskFactorsDescription: function () {
      const thresholdSelection = this.$store.getters.thresholdSelection;
      if (thresholdSelection === 'aap') {
        return this.$store.getters.riskFactorsDescription.aap;
      } else if (thresholdSelection === 'ncnc') {
        return this.$store.getters.riskFactorsDescription.ncnc;
      } else if (thresholdSelection === 'premie') {
        return this.$store.getters.riskFactorsDescription.premie;
      } else return "";
    },
  },
  methods: {
    format: format,
    lightenRowColor: function (color) {
      console.log(`Lightening row color ${color}`)
      if (color === 'black') {
        return this.colors.blueGrey.lighten1;
      } else {
        return color + " lighten-5";
      }
    },
    go(url) {
      AglService.openWindow(url);
    },
    selectRow(rowIndex, state) {
      let index;
      // this.chart.tooltip.refresh([this.resultsSeries[rowIndex]]);
      // this.resultsSeries[rowIndex].setState('hover');
      // this.resultsSeries[rowIndex].y++;
      // console.log(`$refs = `, this.$parent.$refs.highcharts.chart.series[this.seriesRef])

      // Ahoy mateys! This $parent reference is used to get access to the original chart object...
      // So we can highlight corresponding points in the plot when hovering over their table
      // rows. Accessing the corresponding Vue data structures doens't work because they don't have setState
      if (state) {
        // console.log(`Entering row `, rowIndex)
        index = this.resultsSeries.length - rowIndex - 1;
        // this.$parent.$refs.highcharts.chart.series[this.seriesRef].points[index].setState('hover');
        this.$parent.$refs.highcharts.chart.tooltip.refresh(this.$parent.$refs.highcharts.chart.series[this.seriesRef].points[index]);
      } else {
        // this.$parent.$refs.highcharts.chart.series[this.seriesRef].points[index].setState('');
        this.$parent.$refs.highcharts.chart.tooltip.hide();
        // console.log(`Leaving row `, rowIndex)

      }
    },
    toggleTableRows: function () {
      if (this.resultTableShowLatest === 0) {
        this.resultTableShowLatest = 1;
      } else {
        this.resultTableShowLatest = 0;
      }
    },
    // Show no risk factors or with risk factors version of Follow-up column?
    toggleTableColumns: function () {
      this.resultTableFollowupRisk = !this.resultTableFollowupRisk;
    },
  },
};
</script>

<style scoped>
.btn {
  text-transform: unset !important;
}
</style>

 