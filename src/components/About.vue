<template>
    <q-dialog ref="dialog" @hide="onDialogHide()">
        <q-card class="q-dialog-plugin">
            <q-card-section class="q-pt-xs">
                <div class="text-h5 q-mt-sm q-mb-xs">About <strong>Biligram</strong></div>
                <q-separator></q-separator>
            </q-card-section>

            <q-card-section>


        <span class="text-bold">Version 3.0 (Vue.js, 2020)</span>
        <br/>Previous Javascript versions 2.0-2.2 (2016-2019)
        <br/>Previous C# versions 0.1-0.3 (2013-2015)<br/>

            <br/>Calculates newborn bilirubin risk zones and displays treatment thresholds.
            Use of this software does not constitute medical advice; it's merely a tool to help clinicians through the mechanics of plotting data.
            It could even be terribly wrong, so when making treatment decisions with potentially serious consequences
            it's always best to check your work.
            <br/>
            <br/>Original design and ongoing TLC:
            <br/><span class="text-bold">Daniel Rosenberg MD</span>
            <br/>Providence Medical Group
            <br/>Portland, Oregon
            <br/>
            <br/>Ongoing finesse:
            <br/><span class="text-bold">Maulin Shah MD</span>
            <br/>Providence Health & Services
            <br/>Portland, Oregon

            </q-card-section>

            <q-card-section>
            <br/>
            <br/>Highcharts, with thanks to
            <a href="https://shop.highsoft.com/faq">Highsoft</a>, Vik i Sogn, Norway
            <br/>Used here under non-commercial license; use is not free for commercial or government entities.
            </q-card-section>
        </q-card>

    </q-dialog>

</template>

<script>
    export default {
        name: "AboutDialog",

        methods: {
            // following method is REQUIRED
            // (don't change its name --> "show")
            show () {
                this.$refs.dialog.show()
            },

            // following method is REQUIRED
            // (don't change its name --> "hide")
            hide () {
                this.$refs.dialog.hide()
            },

            onDialogHide () {
                // required to be emitted
                // when QDialog emits "hide" event
                this.$emit('hide')
            },

            onOKClick () {
                // on OK, it is REQUIRED to
                // emit "ok" event (with optional payload)
                // before hiding the QDialog
                this.$emit('ok')
                // or with payload: this.$emit('ok', { ... })

                // then hiding dialog
                this.hide()
            },

            onCancelClick () {
                // we just need to hide dialog
                this.hide()
            }
        }

    }
</script>

<style scoped>

</style>
