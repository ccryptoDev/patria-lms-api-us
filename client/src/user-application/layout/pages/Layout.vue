<template>
  <div class="home">
    <Header :login="login" />
    <Steps v-if="steps" />
    <div class="main-content">
      <slot />
    </div>
    <div
      id="preLoader"
      :class="{ active: isLoading === true }"
      class="preLoader"
    >
      <pre>
        <font-awesome-icon icon="circle-notch" spin />
        <strong>Loading results...</strong>
      </pre>
    </div>
    <Footer />
  </div>
</template>
<script lang="ts">
import Vue from "vue";
import { mapState } from "vuex";

import Header from "../components/Header.vue";
import Footer from "../components/Footer.vue";
import Steps from "../components/Steps.vue";

export default Vue.extend({
  components: {
    Header,
    Footer,
    Steps,
  },
  props: {
    steps: {
      required: false,
      type: Boolean,
    },
    login: {
      required: false,
      type: Boolean,
    },
  },
  computed: {
    ...mapState({
      isLoading: (state: any) => state.layout.isLoading,
    }),
  },
});
</script>
