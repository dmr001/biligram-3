<template>
    <div class="row">
        <transition name="gentle-transition">
            <q-table hide-pagination hide-bottom dense flat :data="resultsSeries" :columns="resultTableColumns" :visible-columns="visibleColumns" :pagination.sync="resultTableState" row-key="drawtime" table-class="result-table">
                <template v-slot:header="props">
                    <q-tr>

                        <q-th>
                            <q-btn key="0"   color="dark" icon='mdi-chevron-down' no-caps size="sm" no-ripple v-if="resultTableShowLatest" @click="toggleTableRows()">Show all</q-btn>
                            <q-btn key="1"   color="accent" icon='mdi-chevron-up' size="sm" v-else @click="toggleTableRows()"></q-btn>
                        </q-th>

                        <q-th></q-th>
                        <q-th></q-th>

                        <q-th><span style="float: left;">Follow-up recommendations</span>
                        </q-th>

                        <q-th></q-th>

                    </q-tr>
                    <q-tr :props="props">
                        <q-th v-for="col in props.cols" :key="col.name" :props="props">
                            <template v-if="col.name.includes('follow')">
                                <span style="float: left;">Hyperbilirubinemia <a href="#" @click="showRiskFactorsDialog()">risk factors</a>:
                                <q-btn-toggle :options="[{label: 'Absent', value: false, slot: 'absent'}, {label: 'Present', value: true, slot: 'present'}]"
                                              size="sm" no-ripple toggle-color="accent" v-model="resultTableFollowupRisk" @input="toggleTableColumns()">
                                    <template v-slot:absent>
                                        <q-tooltip self="center middle" anchor="top middle">NONE of: hyperbilirubinemia risk factors (see link to left)</q-tooltip>
                                    </template>
                                    <template v-slot:present>
                                        <q-tooltip self="center middle" anchor="top middle">ANY of: hyperbilirubinemia risk factors (see link to left)</q-tooltip>
                                    </template>
                                </q-btn-toggle>
                                </span>
                            </template>
                            <template v-else>
                                {{ col.label }}
                            </template>

                        </q-th>

                    </q-tr>
                </template>
                <template v-slot:body="props">
                    <q-tr :props="props">
                        <template v-for="col in props.cols">
                            <template v-if="col.name == 'drawtime'">
                                <q-td :key="col.name" :props="props">
                                    {{col.value}}<br/><span class="text-right text-small text-caption"><i>{{props.row.x}} h</i></span>
                                </q-td>
                            </template>
                            <template v-else-if="col.name === 'risk' && ((props.row.marker.lineColor === 'yellow') || (props.row.marker.lineColor === 'orange'))">
                                <q-td :key="col.name" :style="`background-color:${props.row.marker.lineColor}; color:black`" :props="props">
                                    <div>
                                        {{col.value}}
                                    </div>
                                </q-td>
                            </template>
                            <template v-else-if="col.name === 'risk' && props.row.marker.lineColor && col.value">
                                <q-td :key="col.name" :style="`background-color:${props.row.marker.lineColor}; color:white`" :props="props">
                                    <div>
                                        {{col.value}}
                                    </div>
                                </q-td>
                            </template>
                            <template v-else-if="col.name === 'txthreshold'">
                                <template v-if="props.row.marker.fillColor != 'black'">
                                    <q-td :key="col.name" :style="`background-color:${props.row.marker.fillColor}; color:white`" :props="props">
                                        <div v-for="treatmentZoneExceeded in col.value" :key="treatmentZoneExceeded.message">
                                            {{treatmentZoneExceeded.message  }}
                                            <q-badge outline color=warning v-if="treatmentZoneExceeded.youngAndSickKids">35w-37w6d GA -<i>and</i>- neurotoxicity risk factors<q-tooltip>isoimmune disease, G6PD deficiency, asphyxia, lethargy, temp instability, sepsis, albumin &lt; 3.0 g/dL (if measured)</q-tooltip></q-badge>
                                            <q-badge outline color=warning v-if="treatmentZoneExceeded.youngKids">35w-37w6d GA</q-badge>
                                            <q-badge outline color=info v-if="treatmentZoneExceeded.sickKids">Neurotoxicity risk factors<q-tooltip>isoimmune disease, G6PD deficiency, asphyxia, lethargy, temp instability, sepsis, albumin &lt; 3.0 g/dL (if measured)</q-tooltip></q-badge>
                                        </div>
                                    </q-td>
                                </template>
                            </template>
                            <template v-else-if="col.value">
                                <q-td :key="col.name" :props="props">

                                    {{col.value}}
                                    <div>
                                        <q-badge v-if = "col.name === 'level'"  align="bottom">{{props.row.method}}</q-badge>
                                    </div>
                                </q-td>

                            </template>

                        </template>
                    </q-tr>
                </template>
            </q-table>
        </transition>


    </div>



</template>

<script>
    import RiskFactorsDialog from "@/components/RiskFactorsDialog";

    export default {
        name: "Table",
        data () {
            return {
                resultTableShowLatest: 1,
                resultTableFollowupRisk: false,

                // Initial state
                resultTableState: {
                    rowsPerPage: 1,
                    sortBy: 'drawtime',
                    descending: true
                },
                visibleColumns: ['drawtime', 'age', 'level', 'risk', 'followupNoRisk', 'txthreshold'],
                resultTableColumns: [
                    {
                        name: 'drawtime',
                        label: 'Time / age',
                        align: 'left',
                        classes: 'bg-grey-2',
                        field: dataPoint => dataPoint.drawtime,
                        format: val => {
                            var date = new Date(val);
                            return (date.getMonth() + 1 + '/' + date.getDate() + ' ' + (date.getHours() < 10 ? '0' : '' ) + date.getHours() + ':' + (date.getMinutes() < 10 ? '0' : '' ) + date.getMinutes());
                        },

                        sortable: true
                    },
                    {
                        // name: 'age', label: 'Age', field: dataPoint => dataPoint.x, sortable: false
                    },
                    { name: 'level', label: 'Bilirubin', field: dataPoint => dataPoint.y, sortable: false },
                    {
                        name: 'risk', label: 'Risk zone', align: 'center',
                        field: dataPoint => dataPoint.riskDescription
                    },
                    { name: 'followupNoRisk', label: 'Follow-up recommendations (no risk factors)', field: dataPoint => dataPoint.followup.noRisk, align: 'center', sortable: false },
                    { name: 'followupWithRisk', label: 'Follow-up recommendations (with risk factors)', field: dataPoint => dataPoint.followup.withRisk, align: 'center', sortable: false },

                    {
                        name: 'txthreshold',
                        label: '',
                        field: dataPoint => dataPoint.treatmentZoneExceeded,
                        align: 'center',
                        sortable: false,
                        stile: 'max-width: 40em'
                    }
                ]
            }

        },
        props: {
            resultsSeries: Array,
        },
        methods: {
            // Show all of the rows, or just one?
            toggleTableRows: function () {

                if (this.resultTableShowLatest === 0) {
                    this.resultTableShowLatest = 1;
                    this.resultTableState = {rowsPerPage: 1, descending: true, page: 1};
                } else {
                    this.resultTableShowLatest = 0;
                    this.resultTableState = {rowsPerPage: 0, descending: true};
                }
                console.log('Result table rowsPerPage: ' + this.resultTableState.rowsPerPage + ', Descending? ' + this.resultTableState.descending + '\n');
            },
            // Show no risk factors or with risk factors version of Follow-up column?
            toggleTableColumns: function () {

                console.log("Current visible columns: " + this.visibleColumns + "\n");
                if (this.visibleColumns.indexOf('followupWithRisk') >= 0) {
                    console.log("\nFound followupWithRisk at " + this.visibleColumns.indexOf('followupWithRisk') + '\n')
                    this.visibleColumns.splice(this.visibleColumns.indexOf('followupWithRisk'),1, 'followupNoRisk');
                    // this.resultTableFollowupRisk = 1;
                } else if (this.visibleColumns.indexOf('followupNoRisk') >= 0)  {
                    console.log("Found followupNoRisk at " + this.visibleColumns.indexOf('followupNoRisk') + '\n')
                    this.visibleColumns.splice(this.visibleColumns.indexOf('followupNoRisk'),1, 'followupWithRisk');
                    // this.resultTableFollowupRisk = 0;

                }
                console.log("Current visible columns (on exiting): " + this.visibleColumns + "\n");

            },
            showRiskFactorsDialog: function () {
                this.$q.dialog({
                    component: RiskFactorsDialog,

                    // optional if you want to have access to
                    // Router, Vuex store, and so on, in your
                    // custom component:
                    parent: this, // becomes child of this Vue node
                                  // ("this" points to your Vue component)
                                  // (prop was called "root" in < 1.1.0 and
                                  // still works, but recommending to switch
                                  // to the more appropriate "parent" name)

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
