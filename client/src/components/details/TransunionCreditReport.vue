<template>
  <div>
    <div class="panel-group" id="clarityreport">
      <div>
        <h3 style="margin: 10px 0 10px 10px; font-weight: bold;">
          Clarity Report
        </h3>
      </div>
    </div>
    <!-- <div v-if="!transData && !clarityClearInquiry">No Data to show.</div> -->
    <div class="tab-pane active">
      <div class="panel-group" id="transunionpanel">
        <div class="panel panel-default panel-faq">
          <!-- User Information-->
          <table v-if="clarityClearInquiry" class=" table table-bordered">
            <tbody>
              <tr>
                <td colspan="2" bgcolor="lightcyan" align="center">
                  <b>Inquiry</b>
                </td>
              </tr>
              <tr>
                <th style="width: 50%">
                  Social Security Valid
                </th>
                <td v-if="
                  clarityClearInquiry && clarityClearInquiry.raw.xml_response
                ">
                  {{
                  clarityClearInquiry.raw.xml_response.inquiry.social_security_valid
                  }}
                </td>
                <td v-else>--</td>
              </tr>
              <tr>
                <th style="width: 50%">
                  Social Security Deceased
                </th>
                <td v-if="
                  clarityClearInquiry && clarityClearInquiry.raw.xml_response
                ">
                  {{
                  clarityClearInquiry.raw.xml_response.inquiry.social_security_deceased
                  }}
                </td>
                <td v-else>--</td>
              </tr>

              <tr>
                <th style="width: 50%">
                  Ofac Score
                </th>
                <td v-if="
                  clarityClearInquiry && clarityClearInquiry.raw.xml_response
                ">
                  {{
                  clarityClearInquiry.raw.xml_response.inquiry.ofac_score
                  }}
                </td>
                <td v-else>--</td>
              </tr>
            </tbody>
          </table>

          <table v-if="
            clarityClearCredit && clarityClearCredit.raw
          " class="table table-bordered">
            <tbody>
              <tr>
                <td colspan="2" bgcolor="lightcyan" align="center">
                  <b>Credit Risk</b>
                </td>
              </tr>
              <tr>
                <th style="width: 50%">
                  Active Duty Status
                </th>
                <td v-if="
                  clarityClearCredit.raw.clear_credit_risk
                ">
                  {{
                  clarityClearCredit && clarityClearCredit.raw.clear_credit_risk.active_duty_status
                  }}
                </td>
                <td v-else>--</td>
              </tr>
              <tr>
                <th style="width: 50%">
                  Number of Loan Past Due
                </th>
                <td v-if="
                  clarityClearCredit.raw.clear_credit_risk
                ">
                  {{
                  clarityClearCredit && clarityClearCredit.raw.clear_credit_risk.number_of_loans_past_due
                  }}
                </td>
                <td v-else>--</td>
              </tr>

              <tr>
                <th style="width: 50%">
                  Credit Score
                </th>
                <td v-if="
                  clarityClearCredit.raw.clear_credit_risk
                ">
                  {{
                  clarityClearCredit && clarityClearCredit.raw.clear_credit_risk.score
                  }}
                </td>
                <td v-else>--</td>
              </tr>
            </tbody>
          </table>

          <table v-if="
            clarityClearInquiry18 && clarityClearInquiry18.raw.inquiry
          " class="table table-bordered">
            <tbody>
              <tr>
                <td colspan="2" bgcolor="lightcyan" align="center">
                  <b>Clear Inquiry</b>
                </td>
              </tr>
              <tr>
                <th style="width: 50%">
                  Number of SSN with Bank Account
                </th>
                <td v-if="
                  clarityClearInquiry18.raw.inquiry.number_of_ssns_with_bank_account
                ">
                  {{
                  clarityClearInquiry18 && clarityClearInquiry18.raw.inquiry.number_of_ssns_with_bank_account
                  }}
                </td>
                <td v-else>--</td>
              </tr>
            </tbody>
          </table>

          <table v-if="
            clarityFraudInsight && clarityFraudInsight.raw.inquiry
          " class="table table-bordered">
            <tbody>
              <tr>
                <td colspan="2" bgcolor="lightcyan" align="center">
                  <b>Clarity Clear Fraud</b>
                </td>
              </tr>
              <tr>
                <th style="width: 50%">
                  Non Reasonable Score Code
                </th>
                <td v-if="
                  clarityFraudInsight.raw.clear_fraud_insight.
                    non_scorable_reason_code
                ">
                  {{
                  clarityFraudInsight && clarityFraudInsight.raw.clear_fraud_insight.non_scorable_reason_code
                  }}
                </td>
                <td v-else>--</td>
              </tr>
              <tr>
                <th style="width: 50%">
                  Fraud Signature Match
                </th>
                <td v-if="
                  clarityFraudInsight.raw.clear_fraud_insight
                ">
                  {{
                  clarityFraudInsight && clarityFraudInsight.raw.clear_fraud_insight.fraud_signature_match
                  }}
                </td>
                <td v-else>--</td>
              </tr>
              <tr>
                <th style="width: 50%">
                  Stability Score
                </th>
                <td v-if="
                  clarityFraudInsight.raw.clear_fraud_insight
                ">
                  {{
                  clarityFraudInsight && clarityFraudInsight.raw.clear_fraud_insight.score
                  }}
                </td>
                <td v-else>--</td>
              </tr>
            </tbody>
          </table>

          <table v-if="
            clarityBankCall && clarityBankCall.raw.inquiry
          " class="table table-bordered">
            <tbody>
              <tr>
                <td colspan="2" bgcolor="lightcyan" align="center">
                  <b>Clarity Clear Bank Call</b>
                </td>
              </tr>
              <tr>
                <th style="width: 50%">
                  CBB Score
                </th>
                <td v-if="
                  clarityBankCall.raw.clear_bank_behavior.
                    cbb_score2
                ">
                  {{
                  clarityBankCall.raw.clear_bank_behavior.cbb_score2
                  }}
                </td>
                <td v-else>--</td>
              </tr>
              <tr>
                <th style="width: 50%">
                  Default Rate 61-365 Days Ago
                </th>
                <td v-if="
                  clarityBankCall.raw.clear_bank_behavior
                ">
                  {{
                  clarityBankCall.raw.clear_bank_behavior.accounts[0].default_rate_61_365_days_ago
                  }}
                </td>
                <td v-else>--</td>
              </tr>
              <tr>
                <th style="width: 50%">
                  Days Since Default History
                </th>
                <td v-if="
                  clarityBankCall.raw.clear_bank_behavior
                ">
                  {{
                  clarityBankCall.raw.clear_bank_behavior.accounts[0].days_since_default_history
                  }}
                </td>
                <td v-else>--</td>
              </tr>
              <tr>
                <th style="width: 50%">
                  Account Index
                </th>
                <td v-if="
                  clarityBankCall.raw.clear_bank_behavior
                ">
                  {{
                  clarityBankCall.raw.clear_bank_behavior.accounts[0].account_index
                  }}
                </td>
                <td v-else>--</td>
              </tr>
              <tr>
                <th style="width: 50%">
                  Number of Inquiries 30 Days Ago
                </th>
                <td v-if="
                  clarityBankCall.raw.clear_bank_behavior
                ">
                  {{
                  clarityBankCall.raw.clear_bank_behavior.fis_chex_advisor.number_of_inquiries.thirty_days_ago
                  }}
                </td>
                <td v-else>--</td>
              </tr>
            </tbody>
          </table>
          <!-- <div>
	<span class="userData-lastname" style="font-weight: bold"></span><span style="font-weight: bold;color:#f39c12;"><i class='fa fa-exclamation-triangle' aria-hidden='true' style="margin-right: 5px;" ></i>This user is in collections.</span>
</div> -->
          <br />
          <div class="panel-group" id="clarityreport">
            <div>
              <h3 style="margin: 10px 0 10px 10px; font-weight: bold;">
                Flinks Report
              </h3>
            </div>
          </div>

          <table v-if="
            flinksAccountDetail && flinksAccountDetail.raw.Card
          " class="table table-bordered">
            <tbody>
              <tr>
                <td colspan="2" bgcolor="lightcyan" align="center">
                  <b>Request Bank Details</b>
                </td>
              </tr>
              <tr>
                <th style="width: 50%">
                  Count of Stop Payment Fees
                </th>
                <td>
                  {{
                  flinksAccountDetail.raw.Card.count_stop_payment_90_days
                  }}
                </td>
              </tr>
              <tr>
                <th style="width: 50%">
                  Account Age Days
                </th>
                <td>
                  {{
                  flinksAccountDetail.raw.Card.account_age_days
                  }}
                </td>
              </tr>
              <tr>
                <th style="width: 50%">
                  Flinks Total Income
                </th>
                <td>
                  {{
                  getTotalIncome(flinksAccountDetail.raw.Card)
                  }}
                </td>
              </tr>
              <tr>
                <th style="width: 50%">
                  Employer Name
                </th>
                <td v-if="
                  flinksAccountDetail.raw.Card
                ">
                  {{
                  flinksAccountDetail.raw.Card.employer_name
                  }}
                </td>
                <td v-else>--</td>
              </tr>
            </tbody>
          </table>

          <br />
          <div class="panel-group" id="clarityreport">
            <div>
              <h3 style="margin: 10px 0 10px 10px; font-weight: bold;">
                True Validate Report
              </h3>
            </div>
          </div>
          <div v-if="transData" id="drop-down-userinfo" class="panel-collapse subaccount ">
            <div class="panel-body">
              <div class="table-responsive">
                <table class="table table-bordered">
                  <tbody>
                    <tr>
                      <th style="width: 50%">First Name</th>
                      <td>{{ transData.firstName || "--" }}</td>
                    </tr>
                    <tr>
                      <th>Last Name</th>
                      <td>{{ transData.lastName || "--" }}</td>
                    </tr>
                    <tr>
                      <th>Middle Name</th>
                      <td>{{ transData.middleName || "--" }}</td>
                    </tr>
                    <tr>
                      <th>Social Security Number</th>
                      <td>
                        {{ transData.socialSecurity | maskedSSN }}
                      </td>
                    </tr>
                    <tr>
                      <th>Credit score</th>
                      <td>{{ transData.score || "--" }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Credit Information-->
          <div class="panel-heading">
            <a>
              <h4 align="left">
                Credit Information
                <i class="pull-right more-less glyphicon glyphicon-plus"></i>
              </h4>
            </a>
          </div>

          <div id="drop-down-productinfo" class="panel-collapse">
            <div class="panel-body">
              <div class="panel-heading subpanel-heading">
                <a>
                  <h4 align="left">
                    Add on Product
                    <i class="pull-right more-less glyphicon glyphicon-plus"></i>
                  </h4>
                </a>
              </div>

              <div v-if="transData" id="drop-down-addonproduct" class="panel-collapse">
                <div class="panel-body">
                  <div v-if="
                    transData.addOnProduct &&
                    transData.addOnProduct.length > 0
                  ">
                    <table v-for="(productData, index) in transData.addOnProduct" :key="index"
                      class="table table-bordered">
                      <tbody>
                        <!-- <tr>
                          <th align="left" style="width: 50%">code</th>
                          <td v-if="productData && productData.code">
                            {{ productData.code }}
                          </td>
                          <td v-else>--</td>
                        </tr>
                        <tr>
                          <th align="left">status</th>
                          <td v-if="productData && productData.status">
                            {{ productData.status }}
                          </td>
                          <td v-else>--</td>
                        </tr> -->
                        <tr>
                          <td colspan="2" bgcolor="lightcyan" align="center">
                            <b>scoreModel</b>
                          </td>
                        </tr>

                        <tr>
                          <td colspan="2">
                            <table class="table table-bordered">
                              <tbody>
                                <tr>
                                  <td colspan="2" bgcolor="lightcyan" align="center">
                                    <b>score</b>
                                  </td>
                                </tr>
                                <tr>
                                  <td colspan="2">
                                    <table class="table table-bordered">
                                      <tbody>
                                        <tr>
                                          <th align="left" style="width: 50%">
                                            results
                                          </th>
                                          <td>
                                            <div v-if="
                                              productData &&
                                              productData.scoreModel &&
                                              productData.scoreModel.score
                                                .results
                                            ">
                                              {{
                                              productData.scoreModel.score
                                              .results



























































                                              }}
                                            </div>
                                            <div v-else>--</div>
                                          </td>
                                        </tr>
                                        <tr>
                                          <th align="left">derogatoryAlert</th>
                                          <td v-if="
                                            productData &&
                                            productData.scoreModel &&
                                            productData.scoreModel.score &&
                                            productData.scoreModel.score
                                              .derogatoryAlert
                                          ">
                                            {{
                                            productData.scoreModel.score
                                            .derogatoryAlert



























































                                            }}
                                          </td>
                                          <td v-else>--</td>
                                        </tr>
                                        <!-- <tr>
                                          <th align="left">
                                            fileInquiriesImpactedScore
                                          </th>
                                          <td>
                                            <div
                                              v-if="
                                                productData &&
                                                  productData.scoreModel &&
                                                  productData.scoreModel
                                                    .score &&
                                                  productData.scoreModel.score
                                                    .fileInquiriesImpactedScore
                                              "
                                            >
                                              {{
                                                productData.scoreModel.score
                                                  .fileInquiriesImpactedScore
                                              }}
                                            </div>
                                            <div v-else>--</div>
                                          </td>
                                        </tr> -->
                                        <tr>
                                          <td colspan="2" bgcolor="lightcyan" align="center">
                                            <b>factors</b>
                                          </td>
                                        </tr>
                                        <tr>
                                          <td colspan="2">
                                            <table class="table table-bordered">
                                              <tbody>
                                                <tr>
                                                  <td colspan="2" bgcolor="lightcyan" align="center">
                                                    <b>factor</b>
                                                  </td>
                                                </tr>
                                                <tr>
                                                  <td colspan="2">
                                                    <div v-if="
                                                      productData &&
                                                      productData.scoreModel &&
                                                      productData.scoreModel
                                                        .score &&
                                                      productData.scoreModel
                                                        .score.factors &&
                                                      productData.scoreModel
                                                        .score.factors.length > 0
                                                    ">
                                                      <table v-for="(factorData,
                                                      index) in productData
                                                      .scoreModel.score
                                                      .factors" :key="index" class="table table-bordered">
                                                        <tbody>
                                                          <tr>
                                                            <th style="width: 50%">
                                                              Rank
                                                            </th>
                                                            <td v-if="
                                                              factorData &&
                                                              factorData.rank
                                                            ">
                                                              {{
                                                              factorData.rank
                                                              }}
                                                            </td>
                                                            <td v-else>--</td>
                                                          </tr>
                                                          <tr>
                                                            <th>Code</th>
                                                            <td v-if="
                                                              factorData &&
                                                              factorData.code
                                                            ">
                                                              {{
                                                              factorData.code
                                                              }}
                                                            </td>
                                                            <td v-else>--</td>
                                                          </tr>
                                                          <tr>
                                                            <th>Reason Text</th>
                                                            <td v-if="
                                                              factorData &&
                                                              factorData.reason
                                                            ">
                                                              {{
                                                              factorData.reason
                                                              }}
                                                            </td>
                                                            <td v-else>--</td>
                                                          </tr>
                                                        </tbody>
                                                      </table>
                                                    </div>
                                                    <div v-else>
                                                      No Data Received
                                                    </div>
                                                  </td>
                                                </tr>
                                              </tbody>
                                            </table>
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div v-else>No Data Recieved</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Other Information-->
          <div class="panel-heading">
            <a>
              <h4 align="left">
                Other Information
                <i class="pull-right more-less glyphicon glyphicon-plus"></i>
              </h4>
            </a>
          </div>

          <div id="drop-down-otherinfo" class="panel-collapse">
            <div class="panel-body">
              <!-- Address Information -->
              <div class="panel-heading subpanel-heading">
                <a>
                  <h4 align="left">
                    Address Information<i class="pull-right more-less glyphicon glyphicon-plus"></i>
                  </h4>
                </a>
              </div>

              <div id="drop-down-addressinfo" class="panel-collapse">
                <div class="panel-body">
                  <div v-if="
                    transData && transData.houseNumber && transData.employment.length > 0
                  ">
                    <table v-for="(houseData, index) in transData.houseNumber" :key="index"
                      class="table table-bordered">
                      <tbody>
                        <tr>
                          <th style="width: 50%">Status</th>
                          <td v-if="houseData && houseData.status">
                            {{ houseData.status }}
                          </td>
                          <td v-else>--</td>
                        </tr>
                        <tr>
                          <th>Qualifier</th>
                          <td v-if="houseData && houseData.qualifier">
                            {{ houseData.qualifier }}
                          </td>
                          <td v-else>--</td>
                        </tr>
                        <tr>
                          <th>Address</th>
                          <td align="center">
                            <table class="table table-bordered">
                              <tr>
                                <td style="width: 50%">Number</td>
                                <td v-if="
                                  houseData &&
                                  houseData.street &&
                                  houseData.street.number
                                ">
                                  {{ houseData.street.number }}
                                </td>
                                <td v-else>--</td>
                              </tr>
                              <tr>
                                <td>Street Name</td>
                                <td v-if="houseData && houseData.street">
                                  {{ houseData.street }}
                                </td>
                                <td v-else>--</td>
                              </tr>
                              <tr>
                                <td>City</td>
                                <td v-if="houseData && houseData.city">
                                  {{ houseData.city }}
                                </td>
                                <td v-else>--</td>
                              </tr>
                              <tr>
                                <td>State</td>
                                <td v-if="houseData && houseData.state">
                                  {{ houseData.state }}
                                </td>
                                <td v-else>--</td>
                              </tr>
                              <tr>
                                <td>Zip Code</td>
                                <td v-if="houseData && houseData.zipCode">
                                  {{ houseData.zipCode }}
                                </td>
                                <td v-else>--</td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div v-else>
                    No Data Received
                  </div>
                </div>
              </div>

              <!-- Employment Information -->
              <div class="panel-heading subpanel-heading">
                <a>
                  <h4 align="left">
                    Employment Information
                    <i class="pull-right more-less glyphicon glyphicon-plus"></i>
                  </h4>
                </a>
              </div>
              <div id="drop-down-employeeinfo" class="panel-collapse">
                <div class="panel-body">
                  <div v-if="transData && transData.employment">
                    <table v-for="(employeeData, index) of transData.employment" :key="index"
                      class="table table-bordered">
                      <tbody>
                        <tr>
                          <th style="width: 50%">Work Phone</th>
                          <td v-if="
                            employeeData &&
                            employeeData.employer &&
                            employeeData.employer.phoneNumber
                          ">
                            {{ employeeData.employer.phoneNumber }}
                          </td>
                          <td v-else>--</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div v-else>
                    No Data Received
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

</template>

<script lang="ts">
import Vue from "vue";

import { adminDashboardRequests } from "@/api/admin-dashboard";

export default Vue.extend({
  props: {
    screenTrackingId: {
      required: true,
      type: String,
    },
  },

  data() {
    return {
      transData: null,
      clarityReportData: [],
      clarityClearInquiry: null,
      clarityClearInquiry18: null,
      clarityClearCredit: null,
      clarityFraudInsight: null,
      clarityBankCall: null,
      flinksAccountDetail: null,
    };
  },

  methods: {
    getTotalIncome(data: any) {
      const { sum_employer_income, account_age_days } = data;
      console.log("sum_employer_income, account_age_days", sum_employer_income, account_age_days)
      const flinksTotalIncome = sum_employer_income * (365 / account_age_days);
      return flinksTotalIncome.toFixed(2);
    }
  },

  async mounted() {
    const { data, status } = await adminDashboardRequests.getCreditReport(
      this.screenTrackingId
    );
    this.transData = data.creditInfo.tradeInfo;

    const clarityResponse = await adminDashboardRequests.getClarityReport(this.screenTrackingId);
    this.clarityReportData = clarityResponse.data;
    this.clarityReportData.filter((item: any, index) => {
      if (item.ruleNumber === 5) this.clarityClearInquiry = item;
      if (item.ruleNumber === 8) this.clarityClearCredit = item;
      if (item.ruleNumber === 18) this.clarityClearInquiry18 = item;
      if (item.ruleNumber === 19) this.clarityFraudInsight = item;
      if (item.ruleNumber === 20) this.clarityBankCall = item;
      if (item.ruleNumber === 17) this.flinksAccountDetail = item;
    })
  },
});
</script>

<style scoped>
#transunionpanel>.panel-default>.panel-heading {
  margin: 10px !important;
}

.panel-group .panel-heading+.panel-collapse>.list-group,
.panel-group .panel-heading+.panel-collapse>.panel-body {
  border: none !important;
}
</style>
