export let contractUrl = process.env.VUE_APP_BASE_URL || "http://localhost:8080";
if (contractUrl === "http://localhost:8112") {
  contractUrl = "http://localhost:8080"
}
export default contractUrl;
