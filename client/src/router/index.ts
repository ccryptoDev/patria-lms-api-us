import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";

import Login from "@/user-application/authentication/pages/Login.vue";
import AdminLogin from "./../views/admin/Login.vue";
import Dashboard from "./../views/admin/Dashboard.vue";
import Opportunities from "./../views/admin/Opportunities.vue";
import LendingCenter from "./../views/admin/LendingCenter.vue";
import Collections from "./../views/admin/Collections.vue";
import ManageAdminUsers from "./../views/admin/ManageAdminUsers.vue";
import ManageLoanSettings from "./../views/admin/LoanSettings.vue";
import NeedsReview from "./../views/admin/NeedsReview.vue"
import ManualReview from "./../views/admin/ManualReview.vue"
import AdminApproval from "./../views/admin/AdminApprovals.vue"
import ActionItems from "./../views/admin/ActionItems.vue"
import ManageUsers from "./../views/admin/ManageUsers.vue";
import ManagePractice from "./../views/admin/ManagePractice.vue";
import LoanDetails from "@/views/admin/LoanDetails.vue";
import AdminResetPassword from "../views/admin/ResetPassword.vue";
import EditAdmin from "@/views/admin/EditAdmin.vue";
import AddAdmin from "@/views/admin/AddAdmin.vue";
import EditPractice from "@/views/admin/EditPractice.vue";
import AddPractice from "@/views/admin/AddPractice.vue";
import ChangePassword from "@/views/admin/ChangePassword.vue";
import applicationRoutes from "@/user-application/application/routes";
import deniedRoutes from "@/user-application/denied/routes";
import offersRoutes from "@/user-application/offers/routes";
import signContractRoutes from "@/user-application/sign-contract/routes";
import repaymentRoutes from "@/user-application/repayment/routes";
import documentUploadRoutes from "@/user-application/document-upload/routes";
import userDashboardRoutes from "@/user-application/dashboard/routes";
import authenticationRoutes from "@/user-application/authentication/routes";
import AuditLog from "@/admin-dashboard/audit-log/pages/AuditLog.vue";
import ViewLogDetails from "@/admin-dashboard/audit-log/pages/ViewActivityLogDetails.vue";

Vue.use(VueRouter);

enum AdminRoles {
  SUPER_ADMIN = 'Super Admin',
  SALES_REP = 'Agent',
}

const adminRoles = [
  AdminRoles.SALES_REP,
  AdminRoles.SUPER_ADMIN,
];
const routes: Array<RouteConfig> = [
  ...applicationRoutes,
  ...deniedRoutes,
  ...offersRoutes,
  ...signContractRoutes,
  ...repaymentRoutes,
  ...documentUploadRoutes,
  ...userDashboardRoutes,
  ...authenticationRoutes,
  {
    path: "/admin/login",
    name: "AdminLogin",
    component: AdminLogin,
  },
  {
    path: "/admin/reset-password",
    name: "AdminResetPassword",
    component: AdminResetPassword,
  },
  {
    path: "/admin/dashboard",
    name: "adminDashboard",
    component: Dashboard,
    meta: { authorize: adminRoles },
  },
  {
    path: "/admin/opportunities",
    name: "Application status",
    component: Opportunities,
    meta: { authorize: adminRoles },
  },
  {
    path: "/admin/manual-review",
    name: "Manual Review",
    component: ManualReview,
    meta: { authorize: adminRoles },
    props: true,
  },
  {
    path: "/admin/approvals",
    name: "Admin Approval",
    component: AdminApproval,
    meta: { authorize: adminRoles },
    props: true,
  },
  {
    path: "/admin/lending-center",
    name: "Lending Center",
    component: LendingCenter,
    meta: { authorize: adminRoles },
  },
  {
    path: "/admin/collections",
    name: "Collections",
    component: Collections,
    meta: { authorize: adminRoles },
  },
  {
    path: "/admin/audit-log",
    name: "Audit Log",
    component: AuditLog,
    meta: { authorize: [AdminRoles.SUPER_ADMIN] },
  },
  {
    path: "/admin/manage-admin-users",
    name: "Manage Admin Users",
    component: ManageAdminUsers,
    meta: { authorize: [AdminRoles.SUPER_ADMIN] },
  },
  {
    path: "/admin/manage-loan-settings",
    name: "Manage Loan Settings",
    component: ManageLoanSettings,
    meta: { authorize: [AdminRoles.SUPER_ADMIN] },
  },
  {
    path: "/admin/needs-review",
    name: "Delinquent Loans",
    component: NeedsReview,
    meta: { authorize: [AdminRoles.SUPER_ADMIN] },
  },
  {
    path: "/admin/action-items",
    name: "Action Items",
    component: ActionItems,
    meta: { authorize: [AdminRoles.SUPER_ADMIN] },
  },
  {
    path: "/admin/manage-users",
    name: "Manage Admin Users",
    component: ManageUsers,
    meta: { authorize: adminRoles },
  },
  {
    path: "/admin/manage-practice",
    name: "Manage Practice",
    component: ManagePractice,
    meta: { authorize: [AdminRoles.SUPER_ADMIN] },
  },
  {
    path: "/admin/loan-details/:screenTrackingId",
    component: LoanDetails,
    meta: { authorize: adminRoles },
  },
  {
    path: "/admin/add-user/",
    component: AddAdmin,
    meta: { authorize: [AdminRoles.SUPER_ADMIN] },
  },
  {
    path: "/admin/edit-user/:id",
    component: EditAdmin,
    meta: { authorize: [AdminRoles.SUPER_ADMIN] },
  },
  {
    path: "/admin/add-practice-management",
    component: AddPractice,
    meta: { authorize: [AdminRoles.SUPER_ADMIN] },
  },
  {
    path: "/admin/edit-practice-management/:id",
    component: EditPractice,
    meta: { authorize: [AdminRoles.SUPER_ADMIN] },
  },
  {
    path: "/admin/change-password",
    component: ChangePassword,
    meta: { authorize: adminRoles },
  },
  {
    path: "/admin/view-log-details/:id",
    component: ViewLogDetails,
    meta: { authorize: [AdminRoles.SUPER_ADMIN] },
  },
  {
    path: "/admin/*",
    redirect: "/admin/login",
    component: AdminLogin,
  },
  {
    path: "*",
    redirect: "/login",
    component: Login,
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});
router.beforeEach((to, from, next) => {
  const adminToken = localStorage.getItem("adminToken");
  // const { authorize } = to.meta;
  const authorize = to?.meta?.authorize;
  // handle admin routes
  if (
    to.fullPath.includes("/admin") &&
    !(
      to.fullPath === "/admin/login" ||
      to.fullPath === "/admin/reset-password" ||
      to.fullPath === "/admin/change-password"
    )
  ) {
    if (!adminToken) {
      next("/admin/login");
    } else {
      // check roles
      const parsedAdminToken = JSON.parse(adminToken || "");
      if (
        authorize &&
        authorize.length > 0 &&
        !authorize.includes(parsedAdminToken.role)
      ) {
        localStorage.clear();
        next("/admin/login");
      }
    }
  } else if (to.fullPath === "/admin/login") {
    if (adminToken) {
      next("/admin/dashboard");
    }
  }

  next();
});
export default router;
