<template>
    <div class="column items-left q-pa-md q-gutter-y-sm">
        <div class="row q-gutter-sm">
            <q-tooltip self="center right" anchor="center left">Gestational age at birth</q-tooltip>

            <div class="column">
                <q-icon name="mdi-calendar-today" size=xs></q-icon>

            </div>
            <div class="column">
                {{ patient.birthGA }}
            </div>
        </div>
        <div class="row q-gutter-sm">
            <q-tooltip self="center right" anchor="center left">Birth weight</q-tooltip>

            <div class="column">

                <span class="material-icons" size="md">
                    airline_seat_flat
                </span>
            </div>
            <div class="column">
                {{ patient.birthWeight }}kg
            </div>

        </div>
    </div>
</template>

<script>
    export default {
        name: "Patient",
        props: {
            patient: Object
        }
    }
</script>

<style scoped>

</style>
