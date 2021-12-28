<template>
  <v-dialog

    max-width="90%"
    v-model="dialog"
    @keydown.esc="cancel"
  >
    <v-card>
      <v-toolbar color="gray" dark>
        NCNC Help
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
      <v-card-title>Biligram's NCNC Phototherapy guidelines</v-card-title>

      <v-card-text>
                        The <a href="#" @click="go('https://www.ucsfbenioffchildrens.org/neonatal_consortium/')">
                Northern California Neonatal Consortium</a>
                proposes revising the 2004 AAP Clinical Practice Guidelines in light of the following concerns:
                <ul>
                    <li>AAP guidelines are based on limited data, without population-based studies of kernicterus incidence,
                        and no estimates of number needed to treat (NNT)</li>
                    <li>Research subsequent to 2004 suggested the AAP guidelines lead to overtreatment
                        (based on Kaiser Permanente Northern California experience)</li>
                    <li>There is a potential association between phototherapy and childhood cancer and epilepsy</li>
                </ul>

      </v-card-text>
      <v-card-text>
                NCNC thresholds are based on the 2004 AAP thresholds, revised in light of post-2004 evidence that suggests raising thresholds
                because of extremely low rates of kernicterus, lack of evidence of more subtle deficits of hyperbilirubinemia,
                and potential risks of phototherapy.
                <ul>
                    <li>NCNC has "customized" thresholds instead of a sudden change in thresholds at 38 weeks GA</li>
                    <li>NCNC thresholds are based on exact GA, as well as neurotoxicity risk factors and hours of life
                        (10 curves instead of 3 for phototherapy, and 12 instead of 3 for exchange transfusion)</li>
                    <li>For babies without neurotoxicity risk factors at 40 weeks, they added 2 mg/dL to 2004 AAP low risk threshold for phototherapy,
                    and 1 mg/dL to the AAP medium-risk 35 week curve, then adjusted for GA by week.</li>
                    <li>For babies <i>with</i> risk factors they added 1 mg/dL for infants &ge; 38 weeks GA, and 0 mg/dL for babies 35+ weeks.</li>
                    <li>Similar adjustments were made to the exchange transfusion thresholds.</li>
                  <li>See the <a href='#' @click="go(`${urlPrefix}/NCNC-flowsheet.pdf`)">NCNC flowsheet</a> for their algorithm for babies within 2 points of transfusion threshold</li>

                  <v-btn color="primary" small text target="_blank" @click="displayNCNCFlowsheet = !displayNCNCFlowsheet">
                    <v-icon>info</v-icon>
                    {{ !displayNCNCFlowsheet ? "Show article" : "Hide article" }}
                  </v-btn>

                  <v-card height="90vh" style="overflow: auto" v-if="displayNCNCFlowsheet">
                    <iframe style="width:100%; height: 100%"
                            :src="`${publicPath}NCNC-flowsheet/ncnc-flowsheet.jpg`">
                    </iframe>
                  </v-card>


                </ul>
      </v-card-text>
      <v-card-text>
                NCNC recommends consideration of somewhat differently-stated neurotoxicity risk factors than the AAP:
                <ul>
                    <li><b>AAP</b>: Isoimmune disease, G6PD deficiency, asphyxia, lethargy, temp instability, sepsis, albumin &lt; 3.0 g/dL, if measured.</li>
                    <li><b>NCNC</b>: Isoimmune disease, G6PD deficiency or other hemolytic disease, sepsis (or suspicion, sufficient to be on antibiotics),
                        acidosis (BE &lt; -8 mEq/L or pCO2 > 50 mmHg within the last 24 h), albumin &lt; 3 mg/dL, any clinical instability</li>

                </ul>
      </v-card-text>
      <v-card-text>
                NCNC recommends considering phototherapy if TsB within 1-2 mg/dL below threshold, and in the meantime:
                <ul>
                <li>Optimize feeding (breastfeeding support, supplementation);</li>
                <li>Repeat TsB @ 4-24 h (prior to discharge if during birth admission);</li>
                <li>Consider home phototherapy, if available.</li>
                </ul>
      </v-card-text>

      <v-card-text>
        You can review the <b>full NCNC guidelines</b> here:

        <v-btn color="primary" small text target="_blank" @click="displayNCNCGuidelines = !displayNCNCGuidelines">
          <v-icon>info</v-icon>
          {{ !displayNCNCGuidelines ? "Show article" : "Hide article" }}
        </v-btn>

        <v-card height="90vh" style="overflow: auto" v-if="displayNCNCGuidelines">

          <iframe style="width:100%; height: 100%"
                  :src="`${publicPath}NeoHyperbilirubinemiaGuidelineFINAL_2018-0209.htm`">
          </iframe>



        </v-card>


      </v-card-text>
      <v-divider></v-divider>
      <br />
      <v-card-text class="text-caption">
                <b>Disclaimer</b><br/>
                NCNC notes that (like the AAP guidelines) their treatment thresholds are based on the expert opinion of their authors, and do not determine
                a standard of care. Professional judgment should always determine how to best apply these recommendations.

      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn text @click.native="cancel">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>

// import store from '@/store';
import AglService from '@/agl/AglService';

export default {
    name: "NCNCHelp",
    props: {
        aboutProp: Boolean
    },
    data () {
        return {
            dialog: false,
            displayNCNCFlowsheet: false,
            displayNCNCGuidelines: false,
            publicPath: process.env.BASE_URL,
            urlPrefix: window.location.protocol + '//' + window.location.host + process.env.BASE_URL

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
    },
    computed: {
      epicToken: {
        get() {
          return this.$store.getters.epicToken;
        }
      }
    }

}

</script>
