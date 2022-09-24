<template>
  <Card>
    <Navigation
      v-if="useNavigation"
      :nav="nav"
      :useSearch="useSearch"
      @search-input="({ query }) => (search = query)"
      @search-submit="this.fetchData"
      :searchValue="search"
      @navigation="handleNavigation"
      :title="title"
    >
      <slot name="action"></slot>
    </Navigation>
    <slot></slot>
    <Pagination
      v-if="usePagination"
      :perPage="perPage"
      :total="totalRows"
      @pagination="handlePagination"
      :runReset="resetPagination"
      @pagination-reset="resetPagination = false"
    />
  </Card>
</template>
<script lang="ts">
import Vue from "vue";

import Card from "../../primitives/Card.vue";
import {
  TableNavigationEvent,
  TablePaginationEvent,
  TableSearchEvent,
} from "../../../types/tables";
import Pagination from "./Pagination.vue";
import Navigation from "./Navigation.vue";

export default Vue.extend({
  components: { Pagination, Navigation, Card },
  props: {
    navConfig: {
      required: false,
      default: () => [],
      type: Array,
    },
    defaultParams: {
      required: true,
      type: Object,
    },
    totalRows: {
      required: false,
      default: 0,
      type: Number,
    },
    useSearch: {
      required: false,
      default: true,
      type: Boolean,
    },
    useNavigation: {
      required: false,
      default: true,
      type: Boolean,
    },
    usePagination: {
      required: false,
      default: true,
      type: Boolean,
    },
    title: {
      required: false,
      type: String,
    },
  },
  data() {
    return {
      nav: [] as { status: string; text: string; active: boolean }[],
      status: "",
      search: "",
      page: 0,
      perPage: 0,
      resetPagination: false,
      totalRowsByStatus: {} as { [status: string]: number },
    };
  },
  mounted() {
    this.page = this.defaultParams.page;
    this.perPage = this.defaultParams.perPage;
    this.handleNavigation({ status: this.defaultParams.status });
  },
  methods: {
    handleNavigation({ status }: TableNavigationEvent) {
      if (this.status !== status) {
        this.status = status;
        this.search = "";
        this.page = 1;
        this.resetPagination = true;

        this.$emit("navigation");
        this.setActiveNav(status);
        this.fetchData();
      }
    },
    handlePagination({ page }: TablePaginationEvent) {
      this.page = page + 1;
      this.fetchData();
    },
    fetchData() {
      const { search, perPage, page, status } = this;
      this.$emit("fetch-data", { search, perPage, page, status });
    },
    setActiveNav(status: string) {
      this.nav = (this.navConfig as { status: string; text: string }[]).map(
        (entry) => {
          return {
            ...entry,
            active: status === entry.status,
          };
        }
      );
    },
  },
});
</script>
<style scoped>
.flex {
  display: flex;
}
.column {
  flex-direction: column;
}
.space-between {
  justify-content: space-between;
}
.justify-end {
  justify-content: flex-end;
}
.align-center {
  align-items: center;
}
.wrap {
  flex-wrap: wrap;
}
</style>
