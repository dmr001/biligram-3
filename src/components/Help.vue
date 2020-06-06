<template>
    <q-dialog ref="dialog" @hide="onDialogHide()">
        <q-card class="q-dialog-plugin">
            <q-card-section class="q-pt-xs">
                <div class="text-h5 q-mt-sm q-mb-xs">Biligram <strong>General help</strong></div>
                <q-separator></q-separator>
            </q-card-section>

            <q-card-section>
                <ul>
                    <li>Click on legends (like "Low risk zone" or "Transfusion threshold")
                    to make them appear/disappear</li>
                    <li>Click and drag boxes to magnify, then shift-click to pan to get a closer look.</li>
                    <li>Click the Reset Zoom box on the upper right to return to the original view.</li>
                </ul>

            </q-card-section>
            <q-card-section>
            To copy a graph for pasting elsewhere, right click on it. Wait for the image to appear,
            then right-click and select Copy.
            Head back to your EMR, place the cursor in the note where you want it, and right click again and select Paste.
            </q-card-section>

            <q-card-section>
                <br/><a target="_new" href="http://pediatrics.aappublications.org/content/114/1/297">
            Management of Hyperbilirubinemia in the Newborn Infant 35 or More Weeks of Gestation</a>, the original article from 2004 describing the use of the Bhutani nomogram.
                <br/><a target="_new" href="http://pediatrics.aappublications.org/content/124/4/1193">
                Hyperbilirubinemia in the Newborn Infant &ge;35 Weeks’ Gestation: An Update With Clarifications</a>, adds some management guidelines to the risk stratification
                in the original article
            </q-card-section>

        </q-card>
    </q-dialog>

</template>

<script>
    export default {
        name: "help-component",
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
