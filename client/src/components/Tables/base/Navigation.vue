<template>
  <div>
    <div class=" table-nav wrap flex align-center space-between">
      <div class="flex align-center wrap grow mb-4" v-if="nav">
        <div
          v-for="entry in nav"
          @click="$emit('navigation', { status: entry.status })"
          :key="entry.status"
          :class="{ 'table-nav-button': true, selected: entry.active }"
          :to="entry.route"
        >
          {{ entry.text }}
        </div>
        <div v-if="title">
          <h3 class="text-bold">{{ title }}</h3>
        </div>
        <div>
          <slot></slot>
        </div>
      </div>
      <div v-if="useSearch">
        <input
          v-bind:value="searchValue"
          v-on:input="$emit('search-input', { query: $event.target.value })"
          v-on:keyup.enter="$emit('search-submit', null)"
          class="table-search"
          type="text"
          placeholder="Search"
        />
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  props: {
    nav: {
      required: false,
      default: null,
      type: Array,
    },
    useSearch: {
      required: false,
      default: true,
      type: Boolean,
    },
    searchValue: {
      required: true,
      type: String,
    },
    title: {
      required: false,
      type: String,
    },
  },
});
</script>
<style scoped>
.table-nav {
  margin-bottom: 20px;
}
.table-nav-button:first-child {
  border-left: 0;
  padding-left: 0;
}
.table-nav-button {
  cursor: pointer;
  user-select: none;
  font-size: 18px;
  color: #444444;
  border-left: 2px solid #c0c0c0;
  padding: 0px 20px;
}
.selected {
  color: #ea4f8b;
}
.table-search {
  border-radius: 25px;
  text-indent: 8px;
  border: 2px solid #d3d7df;
}
.flex {
  display: flex;
}
.wrap {
  flex-wrap: wrap;
}
.grow {
  flex-grow: 1;
}
</style>
