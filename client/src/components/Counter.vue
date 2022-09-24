<template>
  <card class="flex column">
    <router-link
          active-class="selected"
          class="routerlink"
          :to="link"
        >
          <span><h6>{{ status }}</h6></span>
        </router-link>

    <router-link
          active-class="selected"
          class="routerlink"
          :to="link"
        >
          <span><h2>{{ count }}</h2></span>
        </router-link>
  </card>
</template>

<script lang="ts">
import Vue from "vue";

import Card from "./primitives/Card.vue";

export default Vue.extend({
  components: { Card },
  props: {
    status: { required: true, type: String },
    count: { required: true, type: Number },
    link: { required: false, type: String },
  },
  methods: {
  },
});
</script>

<style scoped>
h6 {
  font-weight: bold;
}
h2 {
  font-weight: bold;
  margin-bottom: 0;
}
.routerlink{
  display: block;
  text-decoration: none;
  color: rgb(56, 56, 56);
}
</style>
