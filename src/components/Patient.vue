<template>
    <div class="row text-body2 text-right">
        <span class="text-weigh-thin>">
            GA birth
        </span>
        <span class="text-weight-bold>">
            {{ patient.birthGA }}
        </span>
        <span class="text-weight-medium>">
            {{ patient.birthWeight }}
        </span> kg
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
