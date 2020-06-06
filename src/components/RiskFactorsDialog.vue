<template>
    <q-dialog ref="dialog" @hide="onDialogHide()">
        <q-card class="q-dialog-plugin">
            <q-card-section class="q-pt-xs">
                <div class="text-overline">Discharge planning</div>
                <div class="text-h5 q-mt-sm q-mb-xs">Hyperbilirubinemia risk factors</div>
                <q-separator></q-separator>

                <div class="col-4">
                    <ul>
                        <li>Exclusive breastfeeding, particularly if nursing is not going well and/or weight loss is excessive (8 – 10%)</li>

                        <li>Isoimmune or other hemolytic disease (eg, G6PD deficiency, hereditary spherocytosis)</li>

                        <li>Previous sibling with jaundice</li>
                        <li>Cephalohematoma or significant bruising</li>

                        <li>East Asian race</li>
                    </ul>
                    <q-separator></q-separator>
                    <i>The gestational age and the predischarge TSB or TcB level are the most important factors that help to predict the risk of hyperbilirubinemia.
                        The risk increases with each decreasing week of gestation from 42–35 weeks.</i>

                </div>
            </q-card-section>

            <q-separator></q-separator>

            <q-card-actions align="right">
                <div>
                (See <a href="#" @click="showHelpDialog()">refs</a>)
                </div>
                <q-btn color="primary" label="OK" @click="onOKClick"></q-btn>
            </q-card-actions>
        </q-card>
    </q-dialog>


</template>

<script>
    import HelpDialog from "@/components/Help";

    export default {
        name: "RiskFactorsDialog",
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

            }
        }
    }
</script>

<style scoped>

</style>
