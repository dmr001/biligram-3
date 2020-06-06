<template>
    <div class="q-pa-md q-gutter-sm">
        <div v-for="(warning, index) in warnings" :key="index" >
            <q-banner dense :class="`text-${warning.textColor} bg-${warning.level}`">

                {{ warning.message }}
                <template v-slot:action>
                    <q-btn v-if="warning.linkButton" size="sm" flat no-caps color="dimgray" text-color="blue" :label="warning.linkButton.text"  @click="openURL(`${warning.linkButton.link}`)"></q-btn>
                    <q-btn v-if="warning.dismissable" size="sm" outline color="black" label="Dismiss"   @click="dismissWarning(index)"></q-btn>
                </template>
            </q-banner>

        </div>
    </div>
</template>


<script>
    // import Chart from "./components/Chart.vue";
    import { openURL } from 'quasar';

    export default {
        name: "Warnings",

        components: {
            // Chart
        },

        props: {
            warnings: Array
        },
        methods: {

            dismissWarning (index) {
                // this.dismiss();
                // console.log("Dismissing " + index);

                this.warnings.splice(index, 1)

            },
            openURL
        }
    }
</script>

<style scoped>

</style>
