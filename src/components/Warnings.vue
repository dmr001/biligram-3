<template>
  <v-container v-if="warningsFiltered.length">
    <v-card dense>
      <v-card-title class="text-subtitle-1">
        <v-row dense class="warning lighten-3">
          <v-col cols="1">
            <v-icon color="warning">warning_amber</v-icon>
          </v-col>
          <v-col cols="10">
            {{ warningsFiltered.length - 1 ? "Warnings" : "Warning" }}
          </v-col>
        </v-row>
      </v-card-title>
      <v-slide-y-transition group tag="v-card-text">
        <div
            v-for="(warning, index) in warningsFiltered"
            :key="index"

        > <!-- class="d-flex" too narrow by default in IE11 -->
          <v-banner v-if="!warning.viewed">
            <v-row class="py-2">
              <v-col cols="1">
                <v-badge
                    bordered
                    color="black"
                    icon="clear"
                    overlap
                    @click.native="
                    warning.dismissable ? dismissWarning(index) : ''
                  "
                    v-if="warning.dismissable"
                >
                  <v-btn
                      disable
                      dark
                      depressed
                      small
                      v-if="warningsFiltered.length > 1"
                      color="warnings[index] === warning ? warning : info accent-2"
                  >
                    {{ index + 1 }}
                  </v-btn>
                  <v-btn v-else small depressed disabled></v-btn>
                </v-badge>
                <v-btn
                    v-else-if="warningsFiltered.length > 1"
                    disable
                    dark
                    depressed
                    small
                    color="warnings[index] === warning ? warning : info accent-2"
                >
                  {{ index + 1 }}
                </v-btn>
                <!--
              <v-btn
                v-if="warning.dismissable"
                @click="dismissWarning(index)"
                x-small
                fab
                dark
                color="warning.level"
                ><v-icon>clear</v-icon></v-btn
              >
              -->
              </v-col>

              <v-col style="width: max-content" cols="8">
                <span v-html="warning.message"> </span>
              </v-col>
              <v-col cols="3" v-if="warning.enterable" align-self="end">
                <span v-if="warning.enterable === 'birthTime'">
                <v-text-field v-if="!isIE()"
                    dense
                    filled
                    validate-on-blur
                    label="Birth time"
                    :rules="birthTimeRules"
                    v-model="submittedBirthTime"
                    @blur="submitBirthTime"
                    v-on:keyup.enter="$event.target.blur()"
                >

                </v-text-field>
                <!-- Vuetify's time picker isn't pretty but the text-field doesn't work well with iE11 -->
                <div v-else>

                  <v-menu
                    ref="menu" v-model="timeEntry" :close-on-content-click="false"

                    :nudge-left="190"
                    offset-y
                    max-width="450px" min-width="450px">
                    <template v-slot:activator="{ on, attrs }">
                      <v-text-field
                        v-model="submittedBirthTime"
                        hint="Enter birth time"
                        persistent-hint
                        readonly
                        prepend-icon="mdi-clock-time-four-outline"
                        v-bind="attrs" v-on="on">

                      </v-text-field>
                    </template>
                    <v-time-picker
                        v-if="timeEntry"
                               format="24hr"

                               scrollable landscape
                               v-model="submittedBirthTime"
                        @click:minute="submitBirthTime()"
                    >
                    </v-time-picker>
                  </v-menu>
                </div>
                </span>
                <span v-if="warning.enterable && warning.enterable === 'neurotoxRiskFactors'">
                  <v-btn-toggle v-model="neurotoxRiskFactors">
                    <v-btn small :value="true"
                    ><v-icon color="warning">check_circle</v-icon>Yes</v-btn
                    >
                    <v-btn small :value="false"
                    ><v-icon color="info">highlight_off</v-icon>No</v-btn
                    >
                  </v-btn-toggle>
                </span>
              </v-col>
              <v-col align-self="end">
                <v-row justify="end">
                  <v-btn
                      class="mx-1 my-2"
                      small
                      v-if="warning.infoPopup"
                      @click="infoPopup = true"
                  >{{ warning.infoTitle }}
                  </v-btn>

                  <v-btn
                      class="mx-1 my-2"
                      small
                      icon
                      v-if="warning.dismissable && !warning.enterable"
                      @click.native="
                      warning.dismissable ? dismissWarning(index) : ''
                    "
                  >
                    <v-icon>clear</v-icon>
                  </v-btn
                  >
                </v-row>
              </v-col>
            </v-row>
          </v-banner>
          <v-dialog v-model="infoPopup" max-width="40%" @keydown.esc="infoPopup = false">
            <v-card>
              <v-toolbar color="primary" dark>{{ warning.infoTitle }}
                <v-spacer></v-spacer>
                <v-btn x-small fab depressed dark color="black" @click.native="infoPopup = false">
                  <v-icon>clear</v-icon>
                </v-btn>
              </v-toolbar>
              <v-card-text>
                <span v-html="warning.infoPopup"></span>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn text @click.native="infoPopup = false">Close</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </div>
      </v-slide-y-transition>
    </v-card>
  </v-container>
</template>

<script>

import { parseISO, isValid, format } from 'date-fns';

export default {
  name: "Warnings",

  data() {
    return {
      submittedBirthTime: null,
      timeEntry: false,
      infoPopup: false,
      birthTimeRules: [
        (v) => !!v || "Should not be blank",
        (v) => (v && v.length >= 3) || "Not long enough",
        (v) => (v && v.length <= 8) || "Too long",
        (v) =>
            /^([01]?[0-9]|2[0-3])[:]?[0-5][0-9]\s*(?:a\.?m\.?|p\.?m\.?)?$/.test(
                v
            ) || "Doesn't seem to be a time of day",
      ],
    };
  },
  props: {
    warnings: Array,
  },
  computed: {
    neurotoxRiskFactors: {
      get() {
        return this.$store.state.neurotoxRiskFactors;
      },
      set(value) {
        this.$store.commit("changeNeurotoxRiskFactors", value);
      },
    },
    birthTime: {
      get() {
        return this.$store.getters.birthTime;
      },
      set(value) {
        console.log(`Warnings module setting birthTime to ${value}`);
        this.$store.commit("changeBirthDateTime", value);
      },
    },
    warningsFiltered: function () {
      // Takes into account dismissed warnings and warnings germane only to current threshold selection
      return this.warnings
          .filter((w) => !w.viewed)
          .filter((w) => {

            return (
                !w.thresholdSelection ||
                w.thresholdSelection === this.$store.state.thresholdSelection
            );
          });
    },
  },
  methods: {
    dismissWarning(index) {
      this.warnings.viewed = true;
      this.warnings.splice(index, 1);
    },
    submitBirthTime() {
      let submittedTime;

      if (this.isIE()) {    // Since we're using a time picker in IE we don't need to parse it
        this.timeEntry = false;
        submittedTime = this.submittedBirthTime;
      } else {
        console.log(`submitBirthTime; starting with birth date ${this.$store.getters.patient.birthDate}`)
        console.log(`Parsed submitted time to `, parseTime(this.submittedBirthTime))
        submittedTime = format(parseTime(this.submittedBirthTime), "HH:mm");
        console.log("Formatted submitted time to: ", submittedTime)
      }
      let candidate = parseISO(`${this.$store.getters.patient.birthDate}T${submittedTime}`);
      if (isValid(candidate)) {
        let patient = this.$store.getters.patient;
        console.log(`Got ${this.submittedBirthTime}; considering ${candidate}`);
        patient.birthDateTime = candidate;
        this.$store.commit('changeBirthDateTime', candidate);
        this.$store.commit('changePatient', patient);
      }

      // Set off the watcher in CHart.vue
      // this.$store.commit("changeNeurotoxRiskFactors", this.$store.getters.neurotoxRiskFactors);


    },
    isIE() {
      // return (true);
      return (navigator.userAgent.includes("Trident") === true);  // IE doesn't handle the drawer well
    },
  },
};



/**
 * Parse a time in nearly any format
 * @param {string} time - Anything like 1 p, 13, 1:05 p.m., etc.
 * @returns {Date} - Date object for the current date and time set to parsed time
 */
function parseTime(t) {
  let b = t.match(/\d+/g);

  console.log("parseTime: b", b)

  if (!b) {
    return null;
  }


  // If we don't have a colon, put one in

  if (b.join().indexOf(':') === -1 && b.join().length > 2) {
      b = b.join();
      b = b.slice(0, b.length - 2) + ':' + b.slice(b.length - 2, b.length);
      b = b.match(/\d+/g);
  }

  console.log("parseTime input formatted to ", b)

  let d = new Date();
  d.setHours(b[0]>12? b[0] : b[0]%12 + (/p/i.test(t)? 12 : 0), // hours
      /\d/.test(b[1])? b[1] : 0,     // minutes
      /\d/.test(b[2])? b[2] : 0);    // seconds
  return d;
}

</script>
