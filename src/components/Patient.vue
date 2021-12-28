<template>
  <div>
    {{ name }}
  </div>
</template>

<script>
import { mapState } from "vuex";

export default {
  computed: {
    ...mapState(["patient"]),
    name() {
      return this.patient && this.patient.name;
    },
    gender() {
      return this.patient.gender
    },
    birthDate() {
      return this.patient.birthDate;
    }
  },
};
</script>

<style>
</style>