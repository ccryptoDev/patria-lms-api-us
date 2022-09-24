<template>
  <section v-if="firstName && referenceNumber" class="main">
    <div id="application">
      <div class="">
        <div
          class="text-center"
          style="height:180px; background: rgb(29,37,128);background: linear-gradient(177deg, rgb(0, 47, 108) 0%, rgba(29,37,128,0.4990371148459384) 100%); clip-path: polygon(100% 84%, 50% 100%, 0 84%, 0 0, 100% 0);"
        >
          <br />
          <p
            style="margin-top:45px;color: #FFF;font-family: Lato,Roboto,Frutiger,'Frutiger Linotype',Univers,Calibri,'Gill Sans','Gill Sans MT','Myriad Pro',Myriad,'DejaVu Sans Condensed','Liberation Sans','Nimbus Sans L',Tahoma,Geneva,'Helvetica Neue',Helvetica,Arial,sans-serif;	font-size: 45px;	font-weight: 700;	line-height: 29px;	text-align: center;text-shadow: 2px 3px 2px #474747;"
          >
            {{ firstName }} &hellip;
          </p>
        </div>
        <div
          style="margin: 12px auto 50px;	color: #3F576C;	width: 70%; font-family: Lato,Roboto,Frutiger,'Frutiger Linotype',Univers,Calibri,'Gill Sans','Gill Sans MT','Myriad Pro',Myriad,'DejaVu Sans Condensed','Liberation Sans','Nimbus Sans L',Tahoma,Geneva,'Helvetica Neue',Helvetica,Arial,sans-serif;	font-weight: 500;	letter-spacing: 0.7px;	text-align: center; margin-top: 30px;"
        >
          <p>
            Unfortunately we were not able to approve your application at this
            time. We will send you a form with the specific reasons for our
            decision at the email address that you provided, and we will also
            make it available in your account portal. For any additional
            questions, please contact us at
            <a
              href="mailto:contact@patria.com"
              style="text-decoration: underline; color: blue;"
              >contact@patria.com</a
            >
          </p>
          <br />
          <br />
          <p>User reference: {{ referenceNumber }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import Vue from "vue";

import { getApplicationData } from "@/user-application/application/api";
import showErrorToast from "@/helpers/errorToast";

export default Vue.extend({
  data() {
    return {
      firstName: null as null | string,
      referenceNumber: null as null | string,
    };
  },

  async created() {
    try {
      const { data } = await getApplicationData();
      const { isCompleted, lastStep, firstName, referenceNumber } = data;

      if (isCompleted) {
        await this.$router.push({ name: "userDashboard" });
      } else if (lastStep !== "denied") {
        await this.$router.push({ name: lastStep });
      } else {
        this.firstName = firstName;
        this.referenceNumber = referenceNumber;
      }
    } catch (error) {
      if (error.response?.status === 401) {
        this.$router.push({ name: "userLogin" });
      } else {
        showErrorToast(this, "error", error.message);
      }
    }
  },
});
</script>

<style scoped>
.dollar-amount {
  color: #363636;
  font-size: 52px;
}

.background-blur {
  height: 100%;
  width: 100%;
  position: absolute;
  background-color: black;
  opacity: 0.3;
  backdrop-filter: blur(10px);
}
.congrats-container {
  width: 8.5in;
  margin-top: 10px;
  height: auto;
}

@media only screen and (min-width: 620px) {
  /* .wrapper h1 {
  } */
  .wrapper h1 {
    font-size: 26px !important;
    line-height: 34px !important;
  }
  /* .wrapper h2 {
  } */
  .wrapper h2 {
    font-size: 20px !important;
    line-height: 28px !important;
  }
  /* .wrapper h3 {
  }
  .column p,
  .column ol,
  .column ul {
  } */
  .wrapper .size-8 {
    font-size: 8px !important;
    line-height: 14px !important;
  }
  .wrapper .size-9 {
    font-size: 9px !important;
    line-height: 16px !important;
  }
  .wrapper .size-10 {
    font-size: 10px !important;
    line-height: 18px !important;
  }
  .wrapper .size-11 {
    font-size: 11px !important;
    line-height: 19px !important;
  }
  .wrapper .size-12 {
    font-size: 12px !important;
    line-height: 19px !important;
  }
  .wrapper .size-13 {
    font-size: 13px !important;
    line-height: 21px !important;
  }
  .wrapper .size-14 {
    font-size: 14px !important;
    line-height: 21px !important;
  }
  .wrapper .size-15 {
    font-size: 15px !important;
    line-height: 23px !important;
  }
  .wrapper .size-16 {
    font-size: 16px !important;
    line-height: 24px !important;
  }
  .wrapper .size-17 {
    font-size: 17px !important;
    line-height: 26px !important;
  }
  .wrapper .size-18 {
    font-size: 18px !important;
    line-height: 26px !important;
  }
  .wrapper .size-20 {
    font-size: 20px !important;
    line-height: 28px !important;
  }
  .wrapper .size-22 {
    font-size: 22px !important;
    line-height: 31px !important;
  }
  .wrapper .size-24 {
    font-size: 24px !important;
    line-height: 32px !important;
  }
  .wrapper .size-26 {
    font-size: 26px !important;
    line-height: 34px !important;
  }
  .wrapper .size-28 {
    font-size: 28px !important;
    line-height: 36px !important;
  }
  .wrapper .size-30 {
    font-size: 30px !important;
    line-height: 38px !important;
  }
  .wrapper .size-32 {
    font-size: 32px !important;
    line-height: 40px !important;
  }
  .wrapper .size-34 {
    font-size: 34px !important;
    line-height: 43px !important;
  }
  .wrapper .size-36 {
    font-size: 36px !important;
    line-height: 43px !important;
  }
  .wrapper .size-40 {
    font-size: 40px !important;
    line-height: 47px !important;
  }
  .wrapper .size-44 {
    font-size: 44px !important;
    line-height: 50px !important;
  }
  .wrapper .size-48 {
    font-size: 48px !important;
    line-height: 54px !important;
  }
  .wrapper .size-56 {
    font-size: 56px !important;
    line-height: 60px !important;
  }
  .wrapper .size-64 {
    font-size: 64px !important;
    line-height: 63px !important;
  }
}

.secureOfferBlock {
  margin-top: 30px;
  margin-left: auto;
  margin-right: auto;
  display: block;
}

.offerOuterRectangle {
  height: 95px;
  width: 499px;
  stroke: rgba(155, 184, 213, 0.37);
  stroke-width: 1px;
  fill: none;
}

.offerInnerRectangle {
  height: 55px;
  width: 450px;
  stroke: rgba(155, 184, 213, 0.37);
  stroke-width: 1px;
  fill: #ffffff;
}

.offerHideBorderBox {
  height: 10px;
  width: 212px;
  fill: #ebf8fd;
}

.offerLinkGreenBox {
  height: 35px;
  width: 128px;
  stroke: #32d6a7;
  stroke-width: 1.5px;
  fill: #e1fff7;
  opacity: 0.5;
}

.offerInvitationBlueBox {
  height: 35px;
  width: 69px;
  stroke: #4cb6ff;
  stroke-width: 1.5px;
  fill: #d9f0ff;
  opacity: 0.5;
}

.button-style {
  height: 40px;
  width: 160px;
  border-radius: 20px;
  background-color: #42b2ff;
  box-shadow: inset 0 -4px 9px 0 rgba(255, 255, 255, 0.6),
    0 1px 16px 0 rgba(78, 167, 228, 0.42);
  color: #ffffff;
  font-family: "Avenir Next", Frutiger, "Frutiger Linotype", Univers, Calibri,
    "Gill Sans", "Gill Sans MT", "Myriad Pro", Myriad, "DejaVu Sans Condensed",
    "Liberation Sans", "Nimbus Sans L", Tahoma, Geneva, "Helvetica Neue",
    Helvetica, Arial, sans-serif;
  font-size: 15px;
  font-weight: 500;
  line-height: 19px;
  text-align: center;
  text-shadow: 0 1px 2px 0 #1990e2;
  border-width: 0;
}

@media only screen and (max-width: 700px) {
  .msgbox {
    width: unset;
    margin: 0 60px 0 60px;
  }
  .dear {
    height: 100%;
  }
  .congratulations {
    height: 100%;
    width: unset;
    padding: 0 40px 0 40px;
  }
  .blank-p {
    padding: 0;
  }
  .optout {
    height: 100%;
    width: unset;
    margin: 0 40px 0 40px;
    padding-bottom: 10px;
  }
  .infobox {
    width: unset;
    border-spacing: 4px;
  }
  .infobox td {
    padding: 0;
  }
  .infobox .first-infobox-col {
    padding-top: 0;
    padding-left: 0;
    vertical-align: top;
  }
  .infobox .second-infobox-col {
    padding: 0;
    vertical-align: top;
  }
  .noticebox {
    height: 100%;
    width: unset;
    margin: 20px 60px;
  }
  .noticetitle,
  .noticebody {
    height: unset;
    width: unset;
  }
  .footnotes {
    width: unset;
    height: 100%;
    margin: 20px 60px;
  }
  .inlinelink.small-text {
    font-size: 11px;
  }
}
</style>
