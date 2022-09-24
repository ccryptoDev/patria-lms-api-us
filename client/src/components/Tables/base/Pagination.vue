<template>
  <div
    v-if="totalPages >= 0"
    class="flex align-center space-between"
    style="margin-top: 10px;"
  >
    <div>Page {{ page + 1 }} of {{ totalPages + 1 }}</div>
    <div v-if="totalPages > 0">
      <button class="table-button" @click="firstPage">First</button>
      <button class="table-button" @click="previousPage">Previous</button>
      <button class="table-button" @click="nextPage">Next</button>
      <button class="table-button" @click="lastPage">Last</button>
    </div>
  </div>
</template>
<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  props: {
    perPage: {
      required: false,
      type: Number,
      default: 25,
    },
    total: {
      required: true,
      type: Number,
      default: 0,
    },
    runReset: {
      required: false,
      type: Boolean,
    },
  },
  data() {
    return {
      totalPages: 0,
      page: 0,
      skip: 0,
    };
  },
  watch: {
    runReset(val) {
      if (val === true) {
        this.page = 0;
        this.skip = 0;
        this.setTotalPages(this.total);

        this.$emit("pagination-reset", true);
      }
    },
    total(val, oldVal) {
      if (val !== oldVal) {
        this.setTotalPages(val);
      }
    },
  },
  methods: {
    goToPage(pageNum: number) {
      if (pageNum >= 0 && pageNum <= this.totalPages) {
        this.page = pageNum;
        this.skip = pageNum * this.perPage;

        this.$emit("pagination", {
          page: this.page,
          skip: this.skip,
          perPage: this.perPage,
        });
      }
    },
    firstPage() {
      this.goToPage(0);
    },
    nextPage() {
      this.goToPage(this.page + 1);
    },
    previousPage() {
      this.goToPage(this.page - 1);
    },
    lastPage() {
      this.goToPage(this.totalPages);
    },
    setTotalPages(totalRows: number) {
      this.totalPages = Math.ceil((totalRows - this.perPage) / this.perPage);
    },
  },
});
</script>
<style scoped>
.table-button {
  background-color: #f8f7fb;
  color: #868686;
  border: 0.5px;
  border-radius: 5px;
  padding: 7px 10px;
  margin-left: 5px;
}
</style>
