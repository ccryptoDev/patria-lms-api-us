<template>
    <div>
        <div style="text-align: right;" @click="showPreviewPayment">
            <button class="primary" style="margin-right: 10px;">
                Make Payment
            </button>
        </div>
        <VueFinalModal v-model="modal" classes="share-modal-container" content-class="share-modal-content"
            :clickToClose="false">
            <div v-if="previewPaymentComponent" class="container" style="width: 40vw;height: 600px;overflow:auto;">
                <h3>Make Payment</h3>
                <ValidationObserver v-slot="{ invalid }">
                    <div class="row">
                        <span v-if="paymentManagementData.canRunAutomaticPayment" class="disclaimer"
                            style="margin-bottom:25px">
                            Disclaimer: Please note when AUTOPAY is <b>ON</b>, payments will always be carried out on
                            the scheduled dates.
                            All additional payments will be counted towards the end of the scheduled payments.
                        </span>
                        <span v-else class="disclaimer" style="margin-bottom:25px">
                            Disclaimer: Please note when AUTOPAY is <b>OFF</b>, payments on the scheduled dates can be
                            made starting from 30 days before each scheduled payment.
                            All additional payments outside the 30 day window will be counted towards the end of the
                            scheduled payments.
                        </span>
                        <div @click="setPaymentType('regular')" style="margin-right: 10px;">
                            <div>
                                Weekly Payment
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center; cursor: pointer;"
                                class="make-payment-btn" :class="{ 'make-payment-btn-primary': isMonthlyPayment }"
                                @click="toggleMonthlyPayment">
                                <div>
                                    {{ previewResults.paymentAmount | currency }}
                                </div>
                                <div class="ico">
                                    <i v-show="isMonthlyPayment" class="fa fa-check"
                                        style="vertical-align: middle;"></i>
                                </div>
                            </div>
                        </div>
                        <div @click="setPaymentType('payoff')" style="margin-left: 10px;">
                            <div>Payoff</div>
                            <div style="display: flex; justify-content: space-between; align-items: center; cursor: pointer;"
                                class="make-payment-btn" :class="{ 'make-payment-btn-primary': isPayoff }"
                                @click="togglePayoff">
                                <div>
                                    {{ previewResult.ledger.payoff | currency }}
                                </div>
                                <div class="ico">
                                    <i v-show="isPayoff" class="fa fa-check" style="vertical-align: middle;"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-if="paymentType =='payoff'" class="row">
                        <p>The current payoff amount is calculated as follows:</p>
                        <table>
                            <tbody>
                                <tr>
                                    <td class="text-left">Principal Amount</td>
                                    <td class="text-right" style="width: 120;">
                                        {{
                                        previewResult.ledger.principalBalance +
                                        previewResult.ledger.paidPrincipalBalance | currency
                                        }}
                                    </td>
                                </tr>
                                <tr>
                                    <td class="text-left">Accrued Interest</td>
                                    <td class="text-right" style="width: 120;">
                                        + {{
                                        previewResult.ledger.paidInterestBalance | currency
                                        }}
                                    </td>
                                </tr>
                                <tr>
                                    <td class="text-left">Total Payment Balance</td>
                                    <td class="text-right" style="width: 120;">
                                        - {{
                                        previewResult.ledger.paymentBalance | currency
                                        }}
                                    </td>
                                </tr>
                                <tr>
                                    <td class="text-left">Payoff Amount</td>
                                    <td class="text-right" style="width: 120;">
                                        = {{
                                        previewResult.ledger.payoff | currency
                                        }}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div class="row">
                        <div style="margin-right: 10px; width: 48%;">
                            <label>Payment Date</label>
                            <div>
                                <Datepicker v-model="paymentDate" @selected="onDateSelected"
                                    :disabled-dates="disabledDates" :format="'MM/dd/yyyy'"
                                    :input-class="'w-100 form-control'" />
                            </div>
                        </div>
                        <div style="margin-left: 10px; width: 48%;">
                            <label>Amount</label>
                            <div>
                                <ValidationProvider rules="positive" mode="lazy" v-slot="{ errors }">
                                    <input type="text" v-mask="mask" v-model="amount" :class="{
                                        'text-danger': errors[0],
                                        'amount-input-error': errors[0],
                                        'form-control': true,
                                    }" style="width: 100%;" @blur="onAmountBlur" @keydown="onAmountKeyDown" />
                                    <span class="text-danger amount-error" style="display: block;">{{ errors[0]
                                    }}</span>
                                </ValidationProvider>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div style="width: 100%;">
                            <div v-if="userCards && userCards.length > 0">
                                <label>Select the Payment Method</label>
                                <div>
                                    <select v-model="selectedCard" class="form-control"
                                        @change="onSelectPaymentMethod($event)">
                                        <option v-for=" card in userCards" :key="card._id" :value="card._id">
                                            <span v-if="card.paymentType=='CARD'">{{ `${card.paymentType} ****
                                            ${card.cardNumberLastFour}` }}</span>
                                            <span v-if="card.paymentType=='ACH'">{{ `${card.paymentType} ****
                                            ${card.financialInstitution}` }}</span>
                                        </option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <p>Payments will be applied fully to outstanding amounts</p>
                    </div>
                    <div class="row" style="width: 40vw;overflow:auto;">
                        <table style="margin-bottom: 15px;">
                            <tbody>
                                <tr>
                                    <td class="text-left">Payment</td>
                                    <td style="width: 215px;" class="text-right" colspan="3">
                                        {{
                                        previewResult.paymentAmount | currency
                                        }}
                                    </td>
                                </tr>
                                <tr>
                                    <td></td>
                                    <td style="width: 120px;">Now</td>
                                    <td style="width: 120px;">Payment</td>
                                    <td style="width: 120px;">After</td>
                                </tr>
                                <tr>
                                    <td class="text-left">Accrued Interest</td>
                                    <td colspan="3" style="text-align: right;">
                                        {{
                                        previewResult.preview.accruedInterest
                                        | currency
                                        }}
                                    </td>
                                </tr>
                                <tr v-if="
                                previewResult.preview.accruedBalance
                                    .unpaidInterest > 0
                                ">
                                    <td class="text-left">
                                        Unpaid Interest
                                        <span style="font-size: 0.80rem; color: #888;">({{
                                        previewResult.preview.daysPastDue }}
                                            day(s) past due)
                                        </span>
                                    </td>
                                    <td class="text-right" style="width: 120;">
                                        {{
                                        previewResult.preview.accruedBalance
                                        .unpaidInterest | currency
                                        }}
                                    </td>
                                    <td class="text-right" style="width: 120;">
                                        {{
                                        previewResult.preview.paymentBalance
                                        .unpaidInterest | currency
                                        }}
                                    </td>
                                    <td class="text-right" style="width: 120;">
                                        {{
                                        previewResult.preview.unpaidBalance
                                        .unpaidInterest | currency
                                        }}
                                    </td>
                                </tr>
                                <tr>
                                    <td class="text-left">Interest Balance</td>
                                    <td class="text-right" style="width: 120;">
                                        {{
                                        previewResult.preview.accruedBalance
                                        .interest | currency
                                        }}
                                    </td>
                                    <td class="text-right" style="width: 120;">
                                        {{
                                        previewResult.preview.paymentBalance
                                        .interest | currency
                                        }}
                                    </td>
                                    <td class="text-right" style="width: 120;">
                                        {{
                                        previewResult.preview.unpaidBalance
                                        .interest | currency
                                        }}
                                    </td>
                                </tr>
                                <tr>
                                    <td class="text-left">Principal Balance</td>
                                    <td class="text-right" style="width: 120;">
                                        {{
                                        previewResult.preview.accruedBalance
                                        .principal | currency
                                        }}
                                    </td>
                                    <td class="text-right" style="width: 120;">
                                        {{
                                        previewResult.preview.paymentBalance
                                        .principal | currency
                                        }}
                                    </td>
                                    <td class="text-right" style="width: 120px;">
                                        {{
                                        previewResult.preview.unpaidBalance
                                        .principal | currency
                                        }}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <hr />
                    <div class="row">
                        <button @click="hidePreviewPayment" class="secondary" style="margin-right: 10px;">
                            Cancel
                        </button>
                        <button :disabled="invalid" @click="showDisclaimer" class="primary" style="margin-left: 10px;">
                            Next
                        </button>
                    </div>

                </ValidationObserver>
            </div>
            <div v-if="disclaimerModal">
                <div class="container" style="width: 50vw;overflow:auto;">
                    <h3>Disclaimer</h3>
                    <span v-if="paymentManagementData.canRunAutomaticPayment" class="disclaimer"
                        style="margin-bottom:25px">
                        Please note when AUTOPAY is <b>ON</b>, payments will always be carried out on the scheduled
                        dates.
                        All additional payments will be counted towards the end of the scheduled payments.
                    </span>
                    <span v-else class="disclaimer" style="margin-bottom:25px">
                        Please note when AUTOPAY is <b>OFF</b>, payments on the scheduled dates can be made starting
                        from 30 days before each scheduled payment.
                        All additional payments outside the 30 day window will be counted towards the end of the
                        scheduled payments.
                    </span>
                    <hr />
                    <button @click="goToPreviewPayment" class="secondary" style="margin-right: 10px;">
                        Back
                    </button>
                    <button type="submit" class="primary" style="margin-left: 10px;" @click="onNext">
                        I Acknowledge
                    </button>
                </div>
            </div>
            <div v-if="previewNewScheduleComponent">
                <h3>Confirm Payment</h3>
                <!-- <p>preview of remaining payment schedule</p> -->
                <div style="height: 15vh; overflow: auto;">
                    <!-- <table style="overflow: auto; ">
                        <tbody>
                            <tr>
                                <th class="primary">Date</th>
                                <th class="primary">Balance</th>
                                <th class="primary">Payment</th>
                                <th class="primary">Fees</th>
                                <th class="primary">Interest</th>
                                <th class="primary">Principal</th>
                            </tr>
                            <tr v-for="paymentScheduleItem in paymentScheduleLeft" :key="paymentScheduleItem.month"
                                :class="{
                                paid:
                                    paymentScheduleItem.transactionId ===
                                    newScheduleItemTransactionId,
                                }">
                                <td class="text-left">
                                    {{ paymentScheduleItem.date | date }}
                                </td>
                                <td class="text-left">
                                    {{ paymentScheduleItem.startPrincipal | currency }}
                                </td>
                                <td class="text-left">
                                    {{ paymentScheduleItem.amount | currency }}
                                </td>
                                <td class="text-left">
                                    {{ paymentScheduleItem.fees | currency }}
                                </td>
                                <td class="text-left">
                                    {{
                                    (paymentScheduleItem.interest +
                                    paymentScheduleItem.pastDueInterest)
                                    | currency
                                    }}
                                </td>
                                <td class="text-left">
                                    {{ paymentScheduleItem.principal | currency }}
                                </td>
                            </tr>
                        </tbody>
                    </table> -->
                    <hr />
                    <div style="margin-top: 15px;">
                        <button @click="goToPreviewPayment" class="secondary" style="margin-right: 10px;">
                            Back
                        </button>
                        <button @click="submitPayment" style="margin-left: 10px;" class="primary" :disabled="isLoading">
                            <span v-if="isPaymentToday">Submit Payment</span>
                            <span v-else>Schedule Payment</span>
                            <b-spinner small v-show="isLoading"></b-spinner>
                        </button>
                    </div>
                </div>
            </div>
        </VueFinalModal>
    </div>
</template>
<script lang="ts">
import Vue from "vue";
import moment from "moment";
import createNumberMask from "text-mask-addons/dist/createNumberMask";
import Datepicker from "vuejs-datepicker";
import { extend } from "vee-validate";

import { getDashboardData, getPaymentPreview, submitPayment } from "@/user-application/dashboard/api";
import { errorHandler } from "@/api/error-handler";
import { isCardExpired } from "@/user-application/helpers/";

extend("positive", (value: any) => {
    if (typeof value === "string") {
        const parsedAmount = value.replace(/[$,]/g, "");
        const isLowerThanOne = parseFloat(parsedAmount) < 5;
        if (isLowerThanOne) {
            return "Amount must be greater than $5.00";
        }
        return true;
    } else {
        if (value < 1) {
            return "Amount must be greater than $5.00";
        }
        return true;
    }
});

const currencyMask = createNumberMask({
    prefix: "$",
    allowDecimal: true,
    includeThousandsSeparator: true,
    allowNegative: false,
    integerLimit: 4,
});

export default Vue.extend({
    components: {
        Datepicker,
    },

    props: {
        screenTrackingId: {
            required: true,
            type: String,
        },
        regularAmount: {
            required: true,
            type: Number,
        },
        promoAmount: {
            required: true,
            type: Number,
        },
        currentAmount: {
            required: true,
            type: Number,
        },
        payoffAmount: {
            required: true,
            type: Number,
        },
    },

    data() {
        return {
            modal: false,
            makePaymentMethodVia: null as null | string,
            disclaimerModal: false,
            previewPaymentComponent: false,
            previewNewScheduleComponent: false,
            isMonthlyPayment: true,
            isPayoff: false,
            isValidAmount: true,
            previewResult: undefined as any,
            previewResults: undefined as any,
            userCards: [] as {
                paymentMethodToken?: string;
                cardNumberLastFour?: string;
                paymentType: string;
                _id: string;
                accountNumber?: string;
                financialInstitution?: string;
            }[],
            selectedCard: "",

            amount: "",
            newScheduleItemTransactionId: "",
            paymentType: "regular",
            paymentDate: new Date(),
            isLoading: false,
            mask: currencyMask,
            paymentManagementData: {},
            disabledDates: {
                to: moment()
                    .startOf("day")
                    .toDate(),
                from: moment()
                    .add(2, "months")
                    .startOf("day")
                    .toDate(),
            },
        };
    },

    computed: {
        amountToNumber(): number {
            if (typeof this.amount === "string") {
                const newAmount = parseFloat(this.amount.replace(/[$,]/g, ""));
                return newAmount;
            }

            return this.amount;
        },
        isPaymentToday(): boolean {
            return moment(this.paymentDate)
                .startOf("day")
                .isSame(moment().startOf("day"));
        },
        parsedPaymentDate(): Date {
            return moment(this.paymentDate)
                .startOf("day")
                .toDate();
        },
        paymentScheduleLeft(): any[] {
            const response = this.previewResult.preview.paymentSchedule.filter(
                (scheduleItem: any) => scheduleItem.status === "opened"
            );
            return response;
        },
    },

    methods: {
        onSelectPaymentMethod(event: any) {
            console.log("=========", event.target.value)
            this.makePaymentMethodVia = event.target?.value;
        },
        showDisclaimer() {
            this.previewPaymentComponent = false;
            this.disclaimerModal = true;
        },
        onNext() {
            this.goToNewSchedule();
        },
        goToPreviewPayment() {
            this.disclaimerModal = false;
            this.previewNewScheduleComponent = false;
            this.previewPaymentComponent = true;
        },
        async onAmountBlur(event: any) {
            let parsedAmount = (event.target.value as string).replace(/[$,]/, "");
            if (parseFloat(parsedAmount) < 1) {
                return;
            }
            if (parseFloat(parsedAmount) < this.regularAmount) {
                parsedAmount = this.regularAmount.toString();
                this.amount = this.regularAmount.toString();
            }
            const requestBody = {
                screenTracking: this.screenTrackingId,
                amount: parseFloat(parsedAmount),
                paymentDate: this.parsedPaymentDate,
            };
            const { data } = await getPaymentPreview(requestBody);
            const { previewResult } = data;

            this.amount = Number(previewResult.paymentAmount).toFixed(
                2
            );
            this.newScheduleItemTransactionId =
                previewResult.preview.newScheduleItemTransactionId;
            this.previewResult = previewResult;
            this.previewResults = previewResult;
        },
        goToNewSchedule() {
            this.disclaimerModal = false;
            this.previewPaymentComponent = false;
            this.previewNewScheduleComponent = true;
        },
        async showPreviewPayment() {
            this.modal = true;
            if (!this.userCards || this.userCards.length <= 0) {
                await this.$swal({
                    title: "Error",
                    text: "User didn't add a card yet",
                    icon: "error",
                });
                this.modal = false;
                return;
            }

            this.previewPaymentComponent = true;
            this.paymentType = "regular";
            const requestBody = {
                screenTracking: this.screenTrackingId,
                paymentDate: this.parsedPaymentDate,
            };
            const { data } = await getPaymentPreview(requestBody);
            const { previewResult } = data;

            this.amount = Number(previewResult.paymentAmount).toFixed(
                2
            );
            this.newScheduleItemTransactionId =
                previewResult.preview.newScheduleItemTransactionId;
            this.previewResult = previewResult;
            this.previewResults = previewResult;
        },
        hidePreviewPayment: async function () {
            this.modal = false;
            this.disclaimerModal = false;
            this.previewPaymentComponent = false;
            this.previewNewScheduleComponent = false;
            this.isMonthlyPayment = true;
            this.isPayoff = false;
            const dashboardDataResponse = await getDashboardData();
            const { userAccountsData } = dashboardDataResponse.data;
            if (userAccountsData && userAccountsData.length > 0) {
                this.selectedCard = userAccountsData.find(
                    (card: any) => card.isDefault
                ).paymentMethodToken;
            }
        },
        async toggleMonthlyPayment() {
            this.isPayoff = false;
            this.isMonthlyPayment = true;

            const requestBody = {
                screenTracking: this.screenTrackingId,
                paymentDate: this.parsedPaymentDate,
            };
            const { data } = await getPaymentPreview(requestBody);
            const { previewResult } = data;

            this.previewResult = previewResult;
            this.amount = Number(previewResult.paymentAmount).toFixed(
                2
            );
            this.newScheduleItemTransactionId =
                previewResult.preview.newScheduleItemTransactionId;
        },
        async togglePayoff() {
            this.isMonthlyPayment = false;
            this.isPayoff = true;

            const requestBody = {
                screenTracking: this.screenTrackingId,
                amount: this.previewResult.ledger.payoff,
                paymentDate: this.parsedPaymentDate,
            };
            const { data } = await getPaymentPreview(requestBody);
            const { previewResult } = data;

            this.previewResult = previewResult;
            this.amount = Number(previewResult.paymentAmount).toFixed(
                2
            );
            this.newScheduleItemTransactionId =
                previewResult.preview.newScheduleItemTransactionId;
        },
        setPaymentType(paymentType: string) {
            this.paymentType = paymentType;
        },
        async onDateSelected(date: Date) {
            const requestBody = {
                screenTracking: this.screenTrackingId,
                amount: this.amountToNumber,
                paymentDate: moment(date)
                    .startOf("day")
                    .toDate(),
            };
            const { data } = await getPaymentPreview(requestBody);
            const { previewResult } = data;

            this.previewResult = previewResult;
            this.amount = Number(previewResult.paymentAmount).toFixed(
                2
            );
            this.newScheduleItemTransactionId =
                previewResult.preview.newScheduleItemTransactionId;
        },
        onAmountKeyDown() {
            this.isPayoff = false;
            this.isMonthlyPayment = false;
        },
        async submitPayment() {
            try {
                this.isLoading = true;
                const requestBody = {
                    screenTracking: this.screenTrackingId,
                    paymentMethodToken: this.selectedCard,
                    amount: this.amountToNumber,
                    paymentDate: this.parsedPaymentDate,
                    paymentVia: this.makePaymentMethodVia,
                };
                console.log("first", requestBody);
                await submitPayment(requestBody);
                this.isLoading = false;
                await this.$swal({
                    title: "Success!",
                    text: this.isPaymentToday
                        ? "Payment successfully submitted."
                        : `Payment sucessfully scheduled to ${moment(this.paymentDate)
                            .startOf("day")
                            .format("MM/DD/YYYY")}`,
                    icon: "success",
                });

                this.modal = false;
                this.previewPaymentComponent = false;
                this.previewNewScheduleComponent = false;
                this.$emit("reloadPage");
            } catch (error) {
                const errorMessage = await errorHandler(error, this.$router);
                if (errorMessage) {
                    await this.$swal({
                        title: "Error",
                        text: `${errorMessage}`,
                        icon: "error",
                    });
                }

                this.isLoading = false;
                this.modal = false;
                this.previewPaymentComponent = false;
                this.previewNewScheduleComponent = false;
            }
        },
    },

    async mounted() {
        const requestBody = {
            screenTracking: this.screenTrackingId,
            paymentDate: this.parsedPaymentDate,
        };
        const {
            data: paymentPreviewData,
        } = await getPaymentPreview(requestBody);
        const { previewResult } = paymentPreviewData;

        this.previewResult = previewResult;
        this.previewResults = previewResult;
        this.amount = Number(previewResult.paymentAmount).toFixed(2);
        this.newScheduleItemTransactionId =
            previewResult.preview.newScheduleItemTransactionId;

        const dashboardDataResponse = await getDashboardData();
        const { userAccountsData, paymentManagementData } = dashboardDataResponse.data;

        this.paymentManagementData = paymentManagementData;
        if (!paymentManagementData.canRunAutomaticPayment) {
            this.disabledDates.from = moment().add(1, 'days')
                .startOf("day")
                .toDate();
        }
        if (userAccountsData && userAccountsData.length > 0) {
            this.userCards = userAccountsData.filter(
                (card: any) => {
                    if (card.paymentType === 'CARD' && !isCardExpired(card.cardExpiration)) {
                        return card;
                    } else if (card.paymentType === 'ACH') return card;
                }
            );
            console.log("-----", this.userCards);
            this.selectedCard = userAccountsData.find(
                (card: any) => card.isDefault
            )._id;
            this.makePaymentMethodVia = this.selectedCard;
        }
    },
});
</script>

<style scoped>
button {
    font-weight: bold;
    border: 0;
    min-width: 150px;
    border-radius: 30px;
    padding: 10px;
}

button:focus {
    outline: none;
}

.make-payment-btn {
    font-weight: bold;
    border: 0;
    min-width: 150px;
    border-radius: 30px;
    padding-left: 20px;
    border: 1px solid #000;
}

.make-payment-btn-primary {
    background-color: #ea4c89;
    color: white;
    border: 2px solid #ea4c89;
}

.primary {
    background-color: #ea4c89;
    color: white;
}

.secondary {
    background-color: white;
    color: #ea4c89;
    border: 1px solid #ea4c89;
}

.row {
    display: flex;
    justify-content: center;
    margin-bottom: 10px;
}

.ico {
    display: block;
    height: 32px;
    width: 32px;
    border: 2px solid #fff;
    border-radius: 16px;
    margin: 3px 4px 3px 20px;
}

.text-right {
    text-align: right;
}

.text-left {
    text-align: left;
}

table {
    width: 100%;
    border: 1px solid #000;
}

td {
    border: 1px solid #000;
    padding: 10px;
}

th {
    border: 1px solid #000;
    padding: 10px;
}

tr> :first-child {
    font-weight: bold;
}

.paid {
    background-color: #a1e1e4;
}

.amount-error {
    padding-top: 8px;
    display: block;
    font-size: 0.6rem;
}

.amount-input-error {
    border: 2px solid #dc3545;
}

.disclaimer {
    color: #dc3545;
    font-size: 0.9rem;
    font-weight: bold;
}
</style>
