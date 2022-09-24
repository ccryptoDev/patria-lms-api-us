<template>
  <div class="steps-section">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-8 col-sm-12">
          <div class="steps-row">
            <div
              v-bind:class="[
                { 'step-active': step === 1 },
                { stepNonActive: step > 1 },
              ]"
              class="single-step"
            >
              <span v-if="step === 1">
                <font-awesome-icon icon="check-circle" />
              </span>
            </div>
            <div
              v-bind:class="[
                { 'step-active': step === 2 },
                { stepNonActive: step > 2 },
              ]"
              class="single-step"
            >
              <span v-if="step === 2"
                ><font-awesome-icon icon="check-circle"
              /></span>
            </div>
            <div
              v-bind:class="[
                { 'step-active': step === 3 },
                { stepNonActive: step > 3 },
              ]"
              class="single-step"
            >
              <span v-if="step === 3"
                ><font-awesome-icon icon="check-circle"
              /></span>
            </div>
            <div
              v-bind:class="[
                { 'step-active': step === 4 },
                { stepNonActive: step > 4 },
              ]"
              class="single-step"
            >
              <span v-if="step === 4"
                ><font-awesome-icon icon="check-circle"
              /></span>
            </div>
            <div
              v-bind:class="[
                { 'step-active': step === 5 },
                { stepNonActive: step > 5 },
              ]"
              class="single-step"
            >
              <span v-if="step === 5"
                ><font-awesome-icon icon="check-circle"
              /></span>
            </div>
            <div
              v-bind:class="[
                { 'step-active': step === 6 },
                { stepNonActive: step > 6 },
              ]"
              class="single-step"
            >
              <span v-if="step === 6"
                ><font-awesome-icon icon="check-circle"
              /></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { mapState } from "vuex";

export default Vue.extend({
  computed: {
    ...mapState({
      step: (state: any) => state.layout.step,
    }),
  },
});
</script>
