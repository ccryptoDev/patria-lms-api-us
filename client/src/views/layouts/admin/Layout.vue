<template>
  <div class="admin-layout flex">
    <b-sidebar
      id="sidebar-main"
      :class="{ absolute: isMobile, relative: !isMobile }"
      v-model="showNav"
      header-class="side-nav-display-none"
      body-class="side-nav-transparent"
      width="260px"
      class="shadow"
    >
      <side-bar />
      <div class="background" v-if="isMobile" v-b-toggle.sidebar-main />
    </b-sidebar>
    <div
      :class="{
        'flex column grow': true,
        'nav-opened': !isMobile && showNav,
        'nav-closed': isMobile || !showNav,
      }"
    >
      <div :class="{ 'layout-header': true, 'mobile-layout-header': isMobile }">
        <div v-b-toggle.sidebar-main>
          <i class="material-icons menu-icon">menu</i>
        </div>
        <div class="flex align-center header-buttons">
          <ShareLinkButton />
          <ActiveUserButton />
        </div>
      </div>
      <div
        :class="{
          'layout-content': true,
          'mobile-layout-content': isMobile,
        }"
      >
        <slot />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

import ShareLinkButton from "@/components/buttons/ShareLinkButton.vue";
import ActiveUserButton from "@/components/buttons/ActiveUserButton.vue";
import SideBar from "./SideBar.vue";

export default Vue.extend({
  components: { ShareLinkButton, SideBar, ActiveUserButton },

  data() {
    return {
      showNav: false,
    };
  },

  mounted() {
    this.showNav = !this.isMobile;
  },

  computed: {
    isMobile() {
      // https://stackoverflow.com/a/11381730
      let check = false;
      (function(a) {
        if (
          // eslint-disable-next-line no-useless-escape
          /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
            a
          ) ||
          // eslint-disable-next-line no-useless-escape
          /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
            a.substr(0, 4)
          )
        )
          check = true;
      })(navigator.userAgent || navigator.vendor);
      return check;
    },
  },
});
</script>

<!-- Side Nav styles, cant style bootstrap sidebar with scoped css -->
<style>
.side-nav-display-none {
  display: none;
}
.side-nav-transparent {
  background-color: rgba(0, 0, 0, 0);
  border-top-right-radius: 30px;
  border-bottom-right-radius: 30px;
}
</style>

<style scoped>
.nav-opened {
  /* width of nav */
  max-width: calc(100% - 260px);
}
.nav-closed {
  max-width: 100%;
}
.menu-icon {
  font-size: 48px;
  padding: 15;
}

.background {
  position: absolute;
  height: 100vh;
  width: 100vw;
  background-color: rgba(0, 0, 0, 0.733);
  backdrop-filter: blur(5px);
  top: 0;
  left: 0;
  z-index: 10;
}

.layout-header {
  display: flex;
  align-items: center;
  padding: 0 20px;
  max-width: 100%;
  height: 100px;
  min-height: 100px;
  justify-content: space-between;
}
.mobile-layout-header {
  padding: 0 10px;
}

.admin-layout {
  width: 100vw;
  height: 100vh;
  background-color: #fbfafd;
}
.layout-content {
  padding: 0 20px 20px 20px;
  overflow-y: overlay;
}
.mobile-layout-content {
  padding: 0 10px 10px 10px;
}
.header-buttons > :nth-child(n) {
  margin-left: 10px;
}

.flex {
  display: flex;
}
.column {
  flex-direction: column;
}
.grow {
  flex-grow: 1;
}
.absolute {
  position: absolute;
}
.relative {
  position: relative;
}
.align-center {
  align-items: center;
}
</style>
