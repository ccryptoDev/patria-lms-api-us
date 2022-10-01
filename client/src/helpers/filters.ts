import Vue from "vue";
import moment from "moment";

Vue.filter("phone", function(value: string) {
  if (value) {
    const areaCode = value.slice(0, 3);
    const firstThree = value.slice(3, 6);
    const lastFour = value.slice(6, 10);
    return `(${areaCode}) ${firstThree}-${lastFour}`;
  }
});

Vue.filter("date", (value: string) => {
  if (value) {
    return moment(value).utc().format("MM/DD/YYYY");
  }
});

Vue.filter("timestamp", (value: string) => {
  if (value) {
    return moment(value).format("MM/DD/YYYY HH:mm:ss a");
  }
});

Vue.filter("currencyWithoutSign", (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  })
    .format(value)
    .replace(/[$USD]/g, "");
});

Vue.filter("maskedSSN", (value: string) => {
  if (value) {
    return `XXX-XX-${value.substr(-4)}`;
  }
});
