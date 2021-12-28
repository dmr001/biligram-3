<template>
  <v-app>
    <v-app-bar app color="black" dark dense>
      <v-menu :nudge-width="200" offset-y transition="slide-y-transition">
        <template v-slot:activator="{ on, attrs }">
          <v-btn dark icon v-bind="attrs" v-on="on">
            <v-icon small>mdi-dots-vertical</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item link>
            <v-list-item-title @click="$refs.about.open()">
              About
            </v-list-item-title
            >
          </v-list-item>

          <v-divider></v-divider>
          <v-list-item link>
            <v-list-item-title @click="$refs.generalHelp.open()"
            >General help
            </v-list-item-title
            >
          </v-list-item>
          <v-list-item link>
            <v-list-item-title @click="$refs.premieHelp.open()"
            >Premie Bilirecs help
            </v-list-item-title
            >
          </v-list-item>
          <v-list-item link>
            <v-list-item-title @click="$refs.ncncHelp.open()"
            >NCNC thresholds help
            </v-list-item-title
            >
          </v-list-item>
        </v-list>
      </v-menu>

      <v-toolbar-title class="text-subtitle-1">Biligram</v-toolbar-title>
      <v-spacer></v-spacer>

      <!-- Toolbar (in app-bar) -->
      <div v-if="false"> <!-- was if isIE -->>
        <v-menu>
          <template v-slot:activator="{ on, attrs }">
            <v-btn dark icon v-bind="attrs" v-on="on">
              <v-icon
                  :color="
                  patient.gender === 'female'
                    ? 'pink lighten-3'
                    : patient.gender === 'male'
                    ? 'blue'
                    : 'gray'
                "
              >account_circle
              </v-icon>
            </v-btn>
          </template>
          <v-list two-line>
            <!-- <v-subheader inset>Patient information</v-subheader> -->
            <v-list-item>
              <v-list-item-avatar>
                <v-icon>crib</v-icon>
              </v-list-item-avatar>
              <v-list-item-content>

                <v-list-item-title>
                  {{ patient.name }}
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>

            <v-list-item>
              <v-list-item-avatar>
                <v-icon>
                  mdi-calendar-today
                </v-icon>
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-subtitle>
                  GA at birth
                </v-list-item-subtitle>
                <v-list-item-title>
                  {{ gestationalAgeInWeeks(patient.birthGA) }}
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>

            <v-list-item>
              <v-list-item-avatar>
                <v-icon>schedule</v-icon>
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-subtitle>
                  Birth time
                </v-list-item-subtitle>
                <v-list-item-title>
                  {{ birthDateTime() ? format(birthDateTime(), "HH:mm") : '' }}
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>

            <v-list-item>
              <v-list-item-avatar>
                <v-icon>airline_seat_flat</v-icon>
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-subtitle>
                  Birth weight
                </v-list-item-subtitle>
                <v-list-item-title>
                  {{ patient.birthWeight }}
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>

          </v-list>
        </v-menu>

        <v-menu offset-y :close-delay="500" :close-on-content-click="true" transition="slide-y-transition">
          <template v-slot:activator="{ on, attrs }">
            <v-btn dark icon v-bind="attrs" v-on="on">
              <v-icon :color="curve.find(c => c.abbreviation === thresholdSelection).color">area_chart</v-icon>
            </v-btn>
          </template>
          <v-list>
            <v-subheader>Threshold selection</v-subheader>
            <v-list-item>
              <v-list-item-content>
                <v-list-item-action>
                  <v-radio-group v-model="thresholdSelection">
                    <div v-for="item in curve" :key="item.id">
                      <v-radio :label="item.name" :value="item.abbreviation" :name="item.abbreviation">

                      </v-radio>
                    </div>
                  </v-radio-group>
                </v-list-item-action>
                <v-list-item-action-text>
                  Use Premie Bilirecs for infants 27-35 weeks, AAP for newborns
                  35+ weeks, NCNC as alternative (see Help)
                </v-list-item-action-text>

                <!--
                <v-tooltip left>
                  <template v-slot:activator="{ on, attrs }">
                    <div v-bind="attrs" v-on="on">
                      <v-select

                          class="text-subtitle-2"
                          dense
                          filled
                          v-model="thresholdSelection"
                          :menu-props="{ top: true, offsetY: true }"
                          label="Treatment thresholds"
                          :items="curve"
                          item-text="name"
                          item-value="abbreviation"
                          @change="changeThreshold"
                      >
                      </v-select>
                    </div>
                  </template>
                  <span>
                      Use Premie Bilirecs for infants 27-35 weeks, AAP for newborns
                      35+ weeks, NCNC as alternative (see Help)
                    </span>
                </v-tooltip>
                -->

              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-menu>

        <v-menu offset-y :close-delay="500" :close-on-content-click="true" transition="slide-y-transition">
          <template v-slot:activator="{ on, attrs }">
            <v-btn dark icon v-bind="attrs" v-on="on">
              <v-icon :color="neurotoxRiskFactors ? 'accent' : 'gray'">error</v-icon>
            </v-btn>
          </template>
          <v-list>
            <v-subheader></v-subheader>
            <v-list-item>

              <v-list-item-content>
                <v-list-item-subtitle>
                  {{ riskFactorsDescription }}
                </v-list-item-subtitle>
                <v-list-item-action>
                  <v-switch

                      v-model="neurotoxRiskFactors"
                      class="text-caption"
                      color="purple darken-2"
                      messages=""
                      hide-details="auto"
                      :label="'Neurotoxicity risk factors ' +
                        (neurotoxRiskFactors ? 'present' : 'absent')"
                  >
                  </v-switch>
                </v-list-item-action>

              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
      <!-- <v-app-bar-nav-icon @click="drawer = !drawer"> </v-app-bar-nav-icon> -->
    </v-app-bar>

    <about ref="about"></about>
    <general-help ref="generalHelp"></general-help>
    <premie-help ref="premieHelp"></premie-help>
    <NCNCHelp ref="ncncHelp"></NCNCHelp>

    <v-main id="container">
      <!-- Provides the application the proper gutter -->
      <v-container fluid id="container">
        <router-view></router-view>
        <chart></chart>
      </v-container>
    </v-main>

    <!--
    <v-footer app color="white">
      <div class="text-caption">
        &copy;2021 Providence Health &amp; Services. All Rights Reserved.
      </div>
      <v-spacer></v-spacer>
    </v-footer>
    -->

    <v-snackbar
        v-model="show"
        :timeout="snackbar.type == 'error' ? -1 : 5000"
        :color="snackbar.color || snackbar.type || 'success'"
    >
      <v-icon v-if="snackbar.type == 'success'" class="mr-3"
      >mdi-check-circle
      </v-icon
      >
      <pre v-if="snackbar.type == 'error'">{{ snackbar.message }}</pre>
      <span v-else>{{ snackbar.message }}</span>
    </v-snackbar>

    <v-card> <!-- was if !isIE since this has some cruftiness with IE11 -->
      <v-navigation-drawer
          app
          right
          hide-overlay
          permanent
          v-model="drawer"
          :mini-variant.sync="mini"
          expand-on-hover
          width="350"
          mini-variant-width="76"
      >
        <v-list nav class="text-subtitle-2">
          <v-list-item>
            <v-list-item-icon>
              <v-icon
                  :color="
                  patient.gender === 'female'
                    ? 'pink lighten-3'
                    : patient.gender === 'male'
                    ? 'blue'
                    : 'gray'
                "
              >crib
              </v-icon
              >
            </v-list-item-icon>
            <v-list-item-content color="primary">
              {{ patient.name }}
            </v-list-item-content>
          </v-list-item>

          <v-list-item>
            <v-list-item-icon>
              <v-icon :color="curve.find(c => c.abbreviation === thresholdSelection).color">
                area_chart
              </v-icon>
            </v-list-item-icon>

            <!-- Radio button threshold selection - Works better with IE -->
                <v-list-item-content v-if="isIE()">
                  <v-list-item-action>

                    <v-radio-group v-model="thresholdSelection"
                      active-class="font-weight-bold"
                    >

                        <v-radio :value="item.abbreviation"
                                 :name="item.abbreviation" class="text-caption"
                                 v-for="item in curve" :key="item.id">

                        <template v-slot:label>
                          <!-- <div class="font-weight-regular caption">{{item.description}}</div> -->
                          <div class="font-weight-light"> {{ item.name }}</div>
                        </template>
                        </v-radio>
                      <span class="text-caption">
                        {{ curve[curve.find(c => c.abbreviation === thresholdSelection).id].description }}
                      </span>
                    </v-radio-group>

                  </v-list-item-action>
                  <v-list-item-action-text>

                  </v-list-item-action-text>
                </v-list-item-content>



            <!-- Selection box - works fine with Chrome -->
            <v-list-item-content v-if="!isIE()">
              <v-tooltip left>
                <template v-slot:activator="{ on, attrs }">
                  <div v-bind="attrs" v-on="on">
                    <v-select
                        class="text-subtitle-2"
                        dense
                        filled
                        onmouseenter="mini=true"
                        v-model="thresholdSelection"
                        :menu-props="{ top: true, offsetY: true }"
                        label="Treatment thresholds"
                        :items="curve"
                        item-text="name"
                        item-value="abbreviation"
                        @change="changeThreshold"
                    >
                    </v-select>
                  </div>
                </template>
                <span>
                  Use Premie Bilirecs for infants 27-35 weeks, AAP for newborns
                  35+ weeks, NCNC as alternative (see Help)
                </span>
              </v-tooltip>
            </v-list-item-content>
          </v-list-item>

          <!--
          <v-list-item>
            <v-list-item-icon>
              <v-icon :color="legendToggle ? 'accent' : 'gray'"
                >legend_toggle</v-icon
              >
            </v-list-item-icon>


            <v-list-item-content>
              <v-tooltip top>
                <template v-slot:activator="{ on, attrs }">
                  <div v-bind="attrs" v-on="on">
                    <v-switch
                      dense
                      small
                      v-model="legendToggle"
                      color="purple darken-2"
                      :label="'Legend ' + (legendToggle ? 'on' : 'off')"
                    >
                    </v-switch>
                  </div>
                </template>
                <span>Show/hide the graph legend</span>
              </v-tooltip>
            </v-list-item-content>
          </v-list-item>
          -->

          <v-list-item>
            <v-list-item-icon>
              <v-icon :color="neurotoxRiskFactors ? 'accent' : 'gray'">
                error
              </v-icon
              >
            </v-list-item-icon>
            <v-list-item-content>
              <v-tooltip top>
                <template v-slot:activator="{ on, attrs }">
                  <div v-bind="attrs" v-on="on">
                    <v-switch
                        dense
                        v-model="neurotoxRiskFactors"
                        class="text-caption"
                        color="purple darken-2"
                        messages=""
                        hide-details="auto"
                        :label="
                        'Neurotoxicity risk factors ' +
                        (neurotoxRiskFactors ? 'present' : 'absent')
                      "
                    >
                    </v-switch>
                  </div>
                </template>
                <span>
                  {{ riskFactorsDescription }}
                </span>
              </v-tooltip>
            </v-list-item-content>
          </v-list-item>

          <v-list-item>
            <v-list-item-icon class="text-caption">
              <v-row justify="center" class="py-2" color="gray">
                <!-- v-badge v-if="mini" :content="gestationalAgeInWeeks(patient.birthGA)"> -->
                <v-icon color="gray">mdi-calendar-today</v-icon>
              </v-row>

            </v-list-item-icon>
            <v-list-item-content>
              <span style="font-weight: bold">{{ gestationalAgeInWeeks(patient.birthGA) }}</span>
              <span style="font-weight: lighter; color: gray">Gestational age at birth</span>

            </v-list-item-content>
          </v-list-item>

          <v-list-item>
            <v-list-item-icon>
              <v-icon color="gray">schedule</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <span style="font-weight: bold">{{ birthDateTime() ? format(birthDateTime(), "HH:mm") : '' }}</span>
              <span style="font-weight: lighter; color: gray">Birth time</span>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-icon class="text-caption">
              <v-row justify="center">

                <v-icon color="gray">airline_seat_flat</v-icon>

              </v-row>

            </v-list-item-icon>
            <v-list-item-content>
              <span style="font-weight: bold">{{ patient.birthWeight }} kg</span>
              <span style="font-weight: lighter; color: gray">Birth weight</span>

            </v-list-item-content>
          </v-list-item>

          <v-list-item>
            <v-list-item-icon>
              <v-icon @click="$refs.copy.open()" color="gray"
              >mdi-image-multiple
              </v-icon
              >
            </v-list-item-icon>
            <v-list-item-content>
              <v-tooltip top>
                <template v-slot:activator="{ on, attrs }">
                  <div v-bind="attrs" v-on="on">
                    <v-btn small color="gray" @click="$refs.copy.open()"
                    >Copy
                    </v-btn
                    >
                  </div>
                </template>
                <span>Copy graph to clipboard to paste into EMR</span>
              </v-tooltip>
            </v-list-item-content>
          </v-list-item>
        </v-list>

      </v-navigation-drawer>

      <copy ref="copy"></copy>
    </v-card>
  </v-app>
</template>

<script>
// import Patient from "@/components/Patient.vue";
import Chart from "@/components/Chart.vue";
import About from "@/components/About.vue";
import Copy from "./components/Copy.vue";

import GeneralHelp from "@/components/Help.vue";
import PremieHelp from "@/components/PremieHelp.vue";
import NCNCHelp from "@/components/NCNCHelp.vue";

import NProgress from "nprogress";
import "material-icons";
import { format, isValid } from 'date-fns';

// import { mdiChartAreaspline } from "@mdi/js";
import {mapActions, mapState} from "vuex";
// import store from "store";

export default {
  components: {
    Chart,
    // Patient,
    About,
    GeneralHelp,
    PremieHelp,
    NCNCHelp,
    Copy,
  },

  data() {
    return {
      drawer: null,
      mini: null,
      legendToggle: true,
      // chart_areaspline: mdiChartAreaspline,
      // neurotoxRiskFactors: false,

      curve: [
        {
          id: 0, abbreviation: "aap", name: "AAP (35+ weeks)", color: "gray",
          description: "Standard curves for 35+ week infants"
        },
        {
          id: 1,
          abbreviation: "ncnc",
          name: "Northern California Neonatal Consortium",
          color: "accent",
          description: "Likely replacement for AAP 2004 guidelines, 35+ weeks"
        },
        {
          id: 2,
          abbreviation: "premie",
          name: "Premie Bilirecs",
          color: "#f499a3",
          description: 'Commonly used for 27-35 week infants'
        },
      ],
    };
  },
  methods: {
    ...mapActions(["clearStatus"]),
    changeThreshold(event) {
      // console.log(`Changing threshold to ${event}`)
      this.$store.commit("changeThresholdSelection", event);
    },
    gestationalAgeInWeeks(ga) {
      return (Math.floor(ga / 7) + 'w' + ga % 7 + 'd');
    },
    isIE() {
      // return (true);
      return (navigator.userAgent.includes("Trident") === true);  // IE doesn't handle the drawer well
    },
    birthDateTime: function() {
      if (this.patient && isValid(this.patient.birthDateTime)) {
        return (this.patient.birthDateTime);
      } else {
        return '';
      }
    },
    format: format,

  },

  computed: {
    snackbar() {
      return this.status || {};
    },

    ...mapState(["loading", "status"]),
    show: {
      get() {
        return this.status && this.status.message;
      },
      set(val) {
        if (!val) {
          this.clearStatus();
        }
      },
    },
    neurotoxRiskFactors: {
      get() {
        console.log(
            `Got neurotoxRiskFactors: ${this.$store.state.neurotoxRiskFactors}`
        );
        return this.$store.state.neurotoxRiskFactors;
      },
      set(value) {
        console.log(
            `Setting neurotoxRiskFactors: ${this.$store.state.neurotoxRiskFactors} to ${value}`
        );

        this.$store.commit("changeNeurotoxRiskFactors", value);
      },
    },
    thresholdSelection: {
      get() {
        console.log(
            `Got thresholdSelection: ${this.$store.state.thresholdSelection}`
        );
        return this.$store.state.thresholdSelection;
      },
      set(value) {
        console.log(
            `Setting thresholdSelection: ${this.$store.state.thresholdSelection} to ${value}`
        );

        this.$store.commit("changeThresholdSelection", value);
      },
    },

    birthWeight: {
      get() {
        return this.$store.state.birthWeight;
      }
    },
    riskFactorsDescription: function () {
      const thresholdSelection = this.$store.getters.thresholdSelection;
      return this.$store.getters.riskFactorsDescription[thresholdSelection]

    },
    patient: {
      get() {
        return this.$store.getters.patient;
      },
      set(value) {
        this.$store.commit("changePatient", value);
      },
    },
    ...mapState(["patient", "observation"]),
    name() {
      console.log("App.vue patient: ", this.patient)
      return this.patient ? this.patient && this.patient.name : "";
      // console.log("App.vue patient state: ", this.$store.state.patient)
      // return this.$store.state.patient.name;
    },
    gender() {
      return this.patient ? this.patient.gender : "";
    },

    dataReady: {
      get() {
        return this.$store.getters.dataReady;
      },
      set(value) {
        this.$store.commit("changeDataReady", value);
      },
    },
  },

  watch: {
    loading(val) {
      if (val) {
        NProgress.start();
      } else {
        NProgress.stop();
      }
    },
    dataReady: function () {
      // All of the stuff FHIR returns as observations really belong to the patient, like birthGA and birthWeight
      // E.g., observation[0].birthWeight belongs in patient.birthWeight
      console.log("dataReady: watching ", this.dataReady)
      let patient = {};
      Object.assign(patient, this.patient);
      this.observation.forEach(obs => Object.assign(patient, obs));
      console.log("dataReady: patient ", patient);
      // this.patient = patient;
      this.$store.commit("changePatient", patient);

      console.log("dataReady: this.patient ", this.patient);

      // console.log("dataReady: observation ", this.observation)
    }
  },
  created() {
    NProgress.configure({
      parent: "#container",
      showSpinner: false,
    });
    console.log("App.vue: created; navigator: ", navigator.userAgent);
    console.log("isIE: ", this.isIE())
    // this.$router.replace({ name: "Home" });
  },
};
</script>
<style src='@/assets/nprogress.css'>
/* global styles */
.small  {
  font-size: x-small;
}
</style> 
