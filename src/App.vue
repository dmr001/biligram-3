<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated>
      <q-toolbar class="bg-black text-grey-6 q-pa-md-md">
        <q-toolbar-title>
          <q-btn-dropdown size="md" stretch flat no-caps  label="Biligram">
            <q-list>
                <q-item clickable>
                  <q-item-section @click="showAboutDialog()">
                    About
                  </q-item-section>
                </q-item>

                <q-separator></q-separator>

                <q-item clickable>
                  <q-item-section @click="showHelpDialog()">
                    General help
                  </q-item-section>
              </q-item>

            </q-list>
          </q-btn-dropdown>

        </q-toolbar-title>

      </q-toolbar>
    </q-header>

    <q-page-container>
    <div class="q-pa-md">

        <div id="app">

          <keep-alive>
            <div class="row">
              <chart-component></chart-component>
            </div>
          </keep-alive>
        </div>

    </div>

      <conditions :conditions="conditions"></conditions>
    </q-page-container>

  </q-layout>
</template>

<script>

import AboutDialog from './components/About.vue';
import HelpDialog from './components/Help.vue';
import ChartComponent from './components/Chart';
import Conditions from './components/Conditions';
import smartClient from '../public/smartClient';

// import RiskFactorsDialog from "@/components/RiskFactorsDialog";
// import CurvesC

export default {
  name: 'App',
  data () {
    return {
      currentView: 'chart',
      patient: null,
      conditions: null,
      loading: true,
      error: null
    };
  },
  components: {

    ChartComponent,
    Conditions
    // WarningsComponent
  },
  async mounted() {
    try {
      console.log("Starting SMART initialization");
      const smart = await smartClient();
      console.log("1");

      this.patient = await smart.patient.read();
      console.log("2");

      this.conditions = await smart.patient.api.fetchAll( {
        type: 'Condition'
      });
      console.log("3");

      this.loading = false;
      console.log("Patient: " + this.patient.name);
      console.log("Birthdate: " + this.patient.birthDate);

    } catch (resp) {
      this.loading = false;
      console.log("SMART initialization error: " + resp);

      this.error = resp.error || resp;
    }
  },

  methods: {
    activate(elem) {
      this.selected = elem
    },
    handler() {
      var args = arguments
      for (var arg of args) {
        if (arg instanceof Function) {
          arg()
        }
      }
    },

    showHelpDialog: function () {
      this.$q.dialog({
        component: HelpDialog,

        // optional if you want to have access to
        // Router, Vuex store, and so on, in your
        // custom component:
        parent: this, // becomes child of this Vue node
                      // ("this" points to your Vue component)

        // props forwarded to component
        // (everything except "component" and "parent" props above):
        text: 'something',
        // ...more.props...
      }).onOk(() => {
        // console.log('OK')
      }).onCancel(() => {
        // console.log('Cancel')
      }).onDismiss(() => {
        // console.log('Called on OK or Cancel')
      })

    },
    showAboutDialog: function () {
      this.$q.dialog({
        component: AboutDialog,

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

    }
  }
}
</script>

<style>
</style>
