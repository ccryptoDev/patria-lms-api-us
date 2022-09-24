<template>
  <section id="printMe" class="container">
    <div class="contract-container">
      <div class="title">RETAIL INSTALLMENT CONTRACT</div>
      <div class="user-info">
        <div class="info-header">
          <div class="info-header-item">
            <div>Date:</div>
            <div class="info-header-field">{{ selectedOffer.fundingDate }}</div>
          </div>
          <div class="info-header-item">
            <div>No.:</div>
            <div class="info-header-field">
              {{ screenTracking.applicationReference }}
            </div>
          </div>
        </div>

        <br />

        <div class="info-body">
          <div class="info-body-item">
            <div class="info-body-field">
              Buyer Name,<br />
              Address &amp; Phone:
            </div>
            <div class="info-body-value">
              {{ userData.fullName }} - {{ userData.street }}
              {{ userData.city }}, {{ userData.state }},
              {{ userData.zipCode }}. {{ userData.phoneNumber | phone }}
            </div>
          </div>
          <div class="info-body-item">
            <div class="info-body-field">
              Co-Buyer Name,<br />
              Address &amp; Phone:
            </div>
            <div class="info-body-value"></div>
          </div>
          <div class="info-body-item">
            <div class="info-body-field">
              Seller Name,<br />
              Address &amp; Phone:
            </div>
            <div class="info-body-value">
              Patria Lending - {{ provider.practiceName }} - {{ provider.streetAddress }}
              {{ provider.city }}, {{ provider.stateCode }},
              {{ provider.zipCode }}
            </div>
          </div>
        </div>
      </div>

      <br />

      <div class="paragraph">
        The Buyer (and Co-Buyer, if any) is referred to as “you” or “your”. The
        Seller (and after assignment of this Contract, to the assignee, if any)
        is referred to as “we” or “our” or “us”. This Contract may be
        transferred by the Seller. You, the Buyer (and Co-Buyer, if any), may
        buy the services and, if applicable, related goods described below for
        cash or on credit. The cash price is shown below as “Cash Price.” The
        credit price is shown below as “Total Sale Price.” By signing this
        Contract, you choose to buy the services (and related goods, if any) on
        credit as described in this Contract. The Federal Truth in Lending
        Disclosures below are also part of this Contract.
      </div>

      <br />

      <div class="descriptionOfServices">
        <div>
          Description of the services (and related goods, if any) financed
          (collectively, “Services”):
        </div>
        <div>Patria Lending Services</div>
      </div>
      <br />
      <div class="primaryUse">
        Primary Use for Which Purchased: [X] Personal, Family or Household [ ]
        Agricultural [ ] Business
      </div>
      <br />
      <div class="table">
        <div class="table-heading">
          <strong>FEDERAL TRUTH-IN-LENDING DISCLOSURES</strong>
        </div>
        <div class="table-cubes">
          <div class="table-cubes-item">
            <div class="table-cubes-item-content">
              <div>
                <strong>ANNUAL PERCENTAGE RATE</strong><br />The cost of your
                credit as a yearly rate.
              </div>
              <div class="table-cubes-item-unit">{{ selectedOffer.apr }}%</div>
            </div>
          </div>

          <div class="table-cubes-item">
            <div class="table-cubes-item-content">
              <div>
                <strong>FINANCE CHARGE</strong><br />The dollar amount the
                credit will cost you.
              </div>
              <div class="table-cubes-item-unit">
                {{ selectedOffer.financeCharge | currency }}
              </div>
            </div>
          </div>

          <div class="table-cubes-item">
            <div class="table-cubes-item-content">
              <div>
                <strong>Amount Financed</strong><br />The amount of credit
                provided to you or on your behalf.
              </div>
              <div class="table-cubes-item-unit">
                {{ selectedOffer.financedAmount | currency }}
              </div>
            </div>
          </div>

          <div class="table-cubes-item">
            <div class="table-cubes-item-content">
              <div>
                <strong>Total of Payments</strong><br />The amount you will have
                paid after you have made all payments as scheduled.
              </div>
              <div class="table-cubes-item-unit">
                {{ selectedOffer.totalLoanAmount - selectedOffer.downPayment | currency }}
              </div>
            </div>
          </div>

          <div class="table-cubes-item">
            <div class="table-cubes-item-content">
              <div>
                <strong>Total Sale Price</strong><br />The total cost of your
                purchase on credit, including your down payment of:
              </div>
              <div>
                <div class="table-cubes-item-unit">
                  {{ selectedOffer.downPayment | currency }} is
                </div>
                <div class="table-cubes-item-unit">
                  {{
                    (selectedOffer.totalLoanAmount)
                      | currency
                  }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="schedule-table">
          <div class="schedule-heading">
            <strong>Your Payment Schedule Will Be:</strong>
          </div>
          <div class="schedule-body">
            <div class="schedule-item-1">
              <div class="schedule-item-header">
                <strong>Number of Payments</strong>
              </div>
              <div class="schedule-item-row">
                {{ paymentScheduleInfo.regularPayments.numberOfPayments - 1 }}
                payments
              </div>
              <div class="schedule-item-row">
                {{ paymentScheduleInfo.lastPayment.numberOfPayments }} final
                payment
              </div>
            </div>
            <div class="schedule-item-2">
              <div class="schedule-item-header">
                <strong>Amount of Each Payment</strong>
              </div>
              <div class="schedule-item-row">
                {{ paymentScheduleInfo.regularPayments.amount | currency }}
              </div>
              <div class="schedule-item-row">
                {{ paymentScheduleInfo.lastPayment.amount | currency }}
              </div>
            </div>
            <div class="schedule-item-3">
              <div class="schedule-item-header">
                <strong>When Payments Are Due</strong>
              </div>
              <div class="schedule-item-row">
                {{ paymentScheduleInfo.regularPayments.due }}
              </div>
              <div class="schedule-item-row">
                {{ paymentScheduleInfo.lastPayment.due }}
              </div>
            </div>
          </div>
        </div>

        <div class="table-footer-item">
          <strong>Late Payment:</strong>
          You must pay a late charge on any installment not paid in full within
          10 days after the date the payment is due. The charge will be $10.
        </div>
        <div class="table-footer-item">
          <strong>Prepayment:</strong>
          If you pay off your debt early, you will not have to pay a penalty.
        </div>
        <div class="table-footer-item">
          <strong
            >Please read this Contract for additional information on security
            interests, non-payment, default, our right to require repayment of
            your debt in full before the scheduled maturity date, and prepayment
            rebates and penalties.
          </strong>
        </div>
      </div>

      <br />

      <div class="paragraph">
        <strong
          >[<font-awesome-icon icon="check" />]
          {{ selectedOffer.promoTerm }} Month SAME AS CASH PROMOTION. If this
          box is checked, this Contract includes a same as cash feature. </strong
        >Finance charges will accrue on the amount financed from the date of
        this Contract.
        <strong
          >However, if you repay the amount financed in full within
          <span> {{ selectedOffer.promoTerm }} </span> calendar months from the
          date of this Contract (“promotional period”), we will waive and/or
          rebate all finance charges.</strong
        >
        If you do not repay the entire amount financed within the promotional
        period, you are responsible for paying all accrued finance charges.
        During the promotional period, you are required to pay at least the
        amount of the scheduled payments reflected in the payment schedule
        above.
        <strong
          >You must pay more than the scheduled payments during the promotional
          period, however, in order to avoid paying finance charges. Paying only
          the amount of the scheduled payment will not pay the amount financed
          in full before the promotional period expires.</strong
        >
        If you are delinquent in paying any amount of a scheduled payment during
        the promotional period or otherwise fail to meet your obligations under
        this Contract during any promotional period, we may cancel the
        promotion, require you to pay all accrued finance charges, and continue
        to impose finance charges on the outstanding balance pursuant to this
        Contract.
      </div>

      <br />

      <div class="table table-itemization">
        <div class="table-heading">ITEMIZATION OF THE AMOUNT FINANCED</div>
        <div class="table-body">
          <div class="table-row">
            <div class="table-col">
              1. Price of Services (Excluding Sales Tax)
            </div>
            <div class="table-col">
              {{ selectedOffer.loanAmount | currency }}
            </div>
          </div>
          <div class="table-row">
            <div class="table-col">2. Sales Tax</div>
            <div class="table-col">
              {{ selectedOffer.salesTax | currency }}
            </div>
          </div>
          <div class="table-row">
            <div class="table-col"><strong>3. Cash Price (1+2)</strong></div>
            <div class="table-col">
              <strong>{{
                (selectedOffer.loanAmount + selectedOffer.salesTax)
                  | currency
              }}</strong>
            </div>
          </div>
          <div class="table-row">
            <div class="table-col">4. Less: Cash Down Payment</div>
            <div class="table-col">
              {{ selectedOffer.downPayment | currency }}
            </div>
          </div>
          <div class="table-row">
            <div class="table-col">
              <strong
                >5. Unpaid Balance of Cash Price/Amount Financed (3-4)</strong
              >
            </div>
            <div class="table-col">
              <strong>{{
                (selectedOffer.loanAmount +
                  selectedOffer.salesTax -
                  selectedOffer.downPayment)
                  | currency
              }}</strong>
            </div>
          </div>
        </div>
      </div>

      <br />

      <div class="terms">
        <div class="heading"><strong> Additional Terms:</strong></div>
        <div class="terms-body">
          <div class="terms-item">
            <strong>1. Promise to Pay.</strong> You promise to pay us the amount
            financed as disclosed above, together with finance charge and any
            other fees or amounts that may become due under this Contract, in
            accordance with the Payment Schedule in the Truth in Lending
            Disclosures. The amount financed is equal to the cost of the
            Services, less any down payment you have paid. Each Buyer under this
            contract is jointly and severally obligated to keep all promises in
            this Contract, including the promise to pay the full amount owed.
          </div>

          <br />

          <div class="terms-item">
            <strong>2. Finance Charges:</strong> Finance charges will be
            calculated on a simple interest basis at the rate of
            <span class="underline">{{ selectedOffer.interestRate }}%</span> per
            year. The finance charges you pay will depend on how you make the
            payments. Your actual finance charges may be more than the disclosed
            finance charges if you make the payments late or in less than the
            scheduled amount. Finance charges are earned on a daily basis at
            1/365th of the annual contract rate (1/366th in a leap year). This
            daily rate is then applied to the unpaid balance of the Amount
            Financed then outstanding, which does not include late charges, or
            returned check charges.
          </div>

          <br />

          <div class="terms-item">
            <strong>3. Late Charge and Returned Payment Charge:</strong> When we
            accept a late payment, that does not excuse your default or mean
            that you can keep making payments late. You will pay a late charge
            on each late payment as shown in the Truth in Lending Disclosures.
            If any payment you give us is unpaid for any reason, you agree to
            pay a returned payment charge of $15.
          </div>

          <br />

          <div class="terms-item">
            <strong>4. Waivers and Releases:</strong> To the extent permitted by
            applicable law, (i) We can waive or delay enforcing any of our
            rights without losing them; (ii) We can waive or delay enforcing a
            right as to one of you without waiving it as to the other; and (iii)
            We need not give anyone notice of the waiver, delay or release.
          </div>

          <br />

          <div class="terms-item">
            <strong>5. Default:</strong> You will be in default if you do not
            make any payment in full when due. You will be in default if you do
            not keep any other agreement in this Contract. If you are in
            default, subject to any notice and right to cure, we may require you
            to pay at once the unpaid Amount Financed, the earned and unpaid
            part of the Finance Charge and all other amounts due under this
            Contract. You agree to pay reasonable fees of an attorney who is not
            our salaried employee, plus collection costs we incur at any time in
            collecting amounts you owe under this Contract, including during any
            bankruptcy proceedings or upon any appeal, to the extent not
            prohibited by law.
          </div>

          <br />

          <div class="terms-item">
            <strong>6. General:</strong> This Contract contains the entire
            agreement between you and us relating to the sale and financing of
            the Services. Any change in this Contract must be written and signed
            by you and us.
            <div class="terms-item-signatures">
              <div class="terms-item-signature">
                <div>Buyer signs:</div>
                <div class="terms-item-signature-value">
                  <img
                    v-if="signature"
                    class="signature"
                    v-bind:src="signature"
                  /><span v-else></span>
                </div>
              </div>
            </div>
            Federal law and the law of the state of Buyer’s address shown in
            this Contract apply to this Contract. If that law does not allow all
            the agreements in this Contract, the ones that are not allowed will
            be void. The rest of this Contract will still be good.
          </div>

          <br />

          <div class="terms-item">
            <strong
              >7. Seller’s Disclaimer of Warranties: Unless the Seller makes a
              written warranty, or enters into a service contract within 90 days
              from the date of this Contract, the Seller makes no warranties,
              express or implied, on the Services, and there will be no implied
              warranties of merchantability or of fitness for a particular
              purpose. This provision does not affect any warranties covering
              the Services that the manufacturer may provide.</strong
            >
          </div>

          <br />

          <div class="terms-item">
            <strong>8. Telephone and Collection Calls:</strong> By providing us
            your wireless (cell) telephone number, you expressly consent to
            receiving telephone calls from us concerning your contract,
            including calls to collect what you owe. Live calls may be made by
            one of our employees. Calls may also be made by a prerecorded,
            auto-dialed voice or text message as applicable law allows. Your
            consent covers all types of calls related to your contract. We do
            not charge you for such calls. Your wireless carrier will charge you
            for our incoming calls and text messages according to your plan.
          </div>

          <br />

          <div class="terms-item">
            <strong>9. Credit Reports.</strong> We may obtain a credit report on
            you at any time in the future to review your information and
            activity regarding this Contract. We may report information about
            your account to credit bureaus. As required by law, you are hereby
            notified that a negative credit report reflecting on your credit
            record may be submitted to a credit reporting agency if you fail to
            fulfill the terms of your credit obligations.
            <strong
              >Late payments, missed payments, or other defaults on your account
              may be reflected in your credit report.</strong
            >
          </div>

          <br />

          <div class="terms-item">
            <strong>10. Assignment.</strong> You may not assign or transfer your
            rights or obligations under this Contract without our express prior
            written consent. You agree that we may assign its rights under this
            Contract at any time, without notice, and any assignment will be
            binding and inure to the benefit of all of the respective legal
            representatives, successors and assigns.
          </div>

          <br />

          <div class="terms-item">
            <strong
              >11. NOTICE TO ACTIVE DUTY SERVICE MEMBERS AND DEPENDENTS.</strong
            >
            Federal law provides important protections to members of the Armed
            Forces and their dependents relating to extensions of consumer
            credit. In general, the cost of consumer credit to a member of the
            Armed Forces and his or her dependent may not exceed an annual
            percentage rate of 36 percent. This rate must include, as applicable
            to the credit transaction or account: The costs associated with
            credit insurance premiums; fees for ancillary products sold in
            connection with the credit transaction; any application fee charged
            (other than certain application fees for specified credit
            transactions or accounts); and any participation fee charged (other
            than certain participation fees for a credit card account).
          </div>

          <br />

          <div class="terms-item">
            Call us toll free at (insert number) for a disclosure of: (a) a
            statement of the Military Annual Percentage Rate, and (b) your
            payment obligations (payment schedule) applicable to this extension
            of credit.
          </div>

          <br />

          <div class="terms-item">
            <strong>Covered Borrower Savings Clause.</strong> If you are a
            “covered borrower,” as that term is defined by 32 C.F.R. § 232.3(g),
            and if any contract provision not identified herein is contrary to
            the rights and protections afforded to you by the federal Military
            Lending Act, 10 U.S.C. § 987, and its implementing regulations, 32
            C.F.R. Part 232, then the conflicting provisions or proscribed terms
            are inoperative, and will have no force or effect. All remaining
            contract terms and provisions not proscribed will remain in full
            force and effect.
          </div>

          <br />
        </div>
      </div>

      <br />

      <div class="arbitration">
        <p>
          <strong
            >ARBITRATION PROVISION: This Arbitration Provision significantly
            affects your rights in any dispute with us. Please read this
            Arbitration Provision carefully before you sign the
            Contract.</strong
          >
        </p>
        <ul>
          <li>
            <p>
              <strong
                >EITHER YOU OR WE MAY CHOOSE TO HAVE ANY DISPUTE BETWEEN US
                DECIDED BY ARBITRATION AND NOT IN COURT.</strong
              >
            </p>
          </li>
          <li>
            <p>
              <strong
                >IF A DISPUTE IS ARBITRATED, YOU WILL GIVE UP YOUR RIGHT TO
                PARTICIPATE AS A CLASS REPRESENTATIVE OR CLASS MEMBER ON ANY
                CLASS CLAIM YOU MAY HAVE AGAINST US.</strong
              >
            </p>
          </li>
          <li>
            <p>
              <strong
                >THE INFORMATION YOU AND WE MAY OBTAIN IN DISCOVERY FROM EACH
                OTHER IN ARBITRATION IS GENERALLY MORE LIMITED THAN IN A
                LAWSUIT.</strong
              >
            </p>
          </li>
          <li>
            <p>
              <strong
                >OTHER RIGHTS THAT YOU AND WE WOULD HAVE IN COURT MAY NOT BE
                AVAILABLE IN ARBITRATION.</strong
              >
            </p>
          </li>
        </ul>
        <p>
          <strong
            >Any claim or dispute, whether in contract, tort or otherwise
            (including the interpretation and scope of this clause and the
            arbitrability of any issue), between you and us or our employees,
            agents, successors or assigns, which arises out of or relates in any
            manner to this Contract or any resulting relationship (including any
            such relationship with third parties who do not sign this
            Arbitration Provision, such as an assignee of the Contract) shall,
            at your or our election (or the election of any such third party),
            be resolved by neutral, binding arbitration and not by a court
            action. Any claim or dispute is to be arbitrated on an individual
            basis and not as a class action. You expressly waive any right you
            may have to arbitrate a class action. This is called the “class
            action waiver.”</strong
          >
        </p>
        <p>
          <strong
            >You may choose the applicable rules of either the American
            Arbitration Association (“AAA”), JAMS, or another arbitration
            organization, subject to our approval. We waive the right to require
            you to arbitrate an individual claim if the amount you seek to
            recover qualifies as a small claim under applicable law. You may
            obtain a copy of the rules of the AAA by visiting its web site (<a
              href="https://www.adr.org"
              style="color: blue;"
              >www.adr.org</a
            >) or of JAMS by visiting its website (<a
              href="https://www.jamsadr.com"
              style="color: blue;"
              >www.jamsadr.com</a
            >). You can also refer to the websites to learn how to file for
            arbitration.</strong
          >
        </p>
        <p>
          <strong
            >The arbitrators shall be attorneys or retired judges and shall be
            selected in accordance with the applicable rules of the chosen
            arbitration organization. The arbitrator shall apply substantive
            governing law and the applicable statute of limitations. The
            arbitration award shall be in writing. The arbitration hearing shall
            be conducted in the federal court district in which you reside, or
            such other place convenient to you as required by the rules of the
            chosen arbitration organization. If you demand arbitration first,
            you will pay the filing fee if the chosen arbitration organization
            requires it. We will advance and/or pay any other fees and costs
            required by the rules of the chosen arbitration
            organization.</strong
          >
        </p>
        <p>
          <strong
            >The arbitrator’s award shall be final and binding on all parties.
            There shall be a limited right to appeal to the extent allowed by
            the Federal Arbitration Act. The amount we pay may be reimbursed in
            whole or in part by decision of the arbitrator if the arbitrator
            finds that any of your claims is frivolous.</strong
          >
        </p>
        <p>
          <strong
            >This Arbitration Provision relates to an agreement that evidences a
            transaction involving interstate commerce. Any arbitration under
            this Arbitration Provision shall be governed by the Federal
            Arbitration Act (9 U.S.C. § 1 et. seq.).</strong
          >
        </p>
      </div>

      <div class="arbitration" id="waive">
        <p>
          <strong
            >Neither you nor we waive the right to arbitrate by exercising
            self-help remedies, filing suit, or seeking or obtaining provisional
            remedies from a court. Judgment upon the award rendered by the
            arbitrator may be entered in any court having jurisdiction.</strong
          >
        </p>
        <p>
          <strong
            >If any part of this Arbitration Provision other than the Class
            Action Waiver is found by a court or arbitrator to be unenforceable,
            the remainder shall be enforceable. If the Class Action Waiver is
            found by a court or arbitrator to be unenforceable, the remainder of
            this Arbitration Provision shall be unenforceable. This Arbitration
            Provision shall survive the termination of any contractual agreement
            between you and us, whether by default or repayment in full.</strong
          >
        </p>
      </div>

      <br />
      <div class="notice">
        <strong
          >NOTICE: ANY HOLDER OF THIS CONSUMER CREDIT CONTRACT IS SUBJECT TO ALL
          CLAIMS AND DEFENSES WHICH THE DEBTOR COULD ASSERT AGAINST THE SELLER
          OF GOODS OR SERVICES OBTAINED PURSUANT HERETO OR WITH THE PROCEEDS
          HEREOF. RECOVERY HEREUNDER BY THE DEBTOR SHALL NOT EXCEED AMOUNTS PAID
          BY THE DEBTOR HEREUNDER.</strong
        >
      </div>
      <br />
      <br />
      <strong>NOTICE TO BUYER:</strong>
      <div class="notice-to-buyer">
        <div class="list">
          <p>
            <strong
              >(1) Do not sign this agreement before you read it or if contains
              any blank spaces to be filled in.
            </strong>
          </p>
          <p>
            <strong
              >(2) You are entitled to a completely filled-in copy of this
              agreement.</strong
            >
          </p>
          <p>
            <strong
              >(3) You can prepay the full amount due under this agreement at
              any time.</strong
            >
          </p>
          <p>
            <strong
              >(4) If you desire to pay off in advance the full amount due, the
              amount which is outstanding will be furnished upon
              request.</strong
            >
          </p>
        </div>
        <div class="acknowledgement">
          <p>
            <strong
              >CAUTION – IT IS IMPORTANT THAT YOU READ THROUGH THIS CONTRACT
              BEFORE YOU SIGN IT. BY SIGNING, YOU AGREE TO ALL TERMS OF THE
              CONTRACT.</strong
            >
          </p>
          <p>
            <strong
              >BY SIGNING BELOW, YOU ACKNOWLEDGE THAT YOU HAVE READ AND AGREE TO
              THIS ENTIRE CONTRACT, INCLUDING THE ARBITRATION PROVISION ABOVE.
              YOU ALSO ACKNOWLEDGE RECEIPT OF A TRUE AND COMPLETELY FILLED IN
              COPY OF THIS CONTRACT AT THE TIME YOU SIGN IT.</strong
            >
          </p>
        </div>
      </div>

      <div class="signatures">
        <div class="signature-item">
          <div class="signature-field">
            X<img
              class="signature"
              v-if="signature"
              v-bind:src="signature"
            /><span v-else></span>
            <p class="signatureDate">{{ today }}</p>
          </div>
          <div class="signature-labels">
            <div>Buyer Signs</div>
            <div>Date</div>
          </div>
        </div>
      </div>
      <br />
      <div class="signatures-table">
        <p>
          Negotiation and Assignment: For value received the undersigned Seller
          does hereby sell, assign and transfer to
          <span class="signatures-table-underline"
            >___________________________________________________________________</span
          >
          subject to the terms and conditions of the separate agreement between
          the Parties.
        </p>
        <div class="assignment">
          <div>Assignment is made:</div>
          <div><span class="underline"></span> With Recourse</div>
          <div><span class="underline"></span> Without Recourse</div>
          <div><span class="underline"></span> With Limited Recourse</div>
        </div>
        <br />
        <br />
        <div class="signatures">
          <div>Seller</div>
          <div>By</div>
          <div>Title</div>
          <div>Date</div>
        </div>
        <p>IP: {{ userData.ip }}</p>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import Vue from "vue";
import { mapState } from "vuex";

export default Vue.extend({
  data() {
    return {};
  },
  methods: {
    async printSummary() {
      this.$htmlToPaper("printMe");
    },
  },
  computed: {
    ...mapState({
      provider: (state: any) => state.contract.provider,
      paymentScheduleInfo: (state: any) => state.contract.paymentScheduleInfo,
      userData: (state: any) => state.contract.userData,
      selectedOffer: (state: any) => state.contract.selectedOffer,
      screenTracking: (state: any) => state.contract.screenTracking,
      today: (state: any) => state.contract.date,
      signature: (state: any) => state.contract.signature,
    }),
  },
});
</script>

<style scoped src="../../../../public/assets/styles/css/contract.css"></style>
