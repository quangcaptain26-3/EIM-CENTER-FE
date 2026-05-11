
```
eim-center-frontend
├─ eslint.config.js
├─ index.html
├─ package-lock.json
├─ package.json
├─ public
│  └─ vite.svg
├─ README.md
├─ scripts
│  └─ check-router-paths.mjs
├─ src
│  ├─ app
│  │  ├─ config
│  │  │  ├─ axios.ts
│  │  │  ├─ constants.ts
│  │  │  ├─ env.ts
│  │  │  └─ query-client.ts
│  │  ├─ providers
│  │  │  ├─ app-provider.tsx
│  │  │  ├─ query-provider.tsx
│  │  │  ├─ router-provider.tsx
│  │  │  ├─ store-provider.tsx
│  │  │  ├─ theme-sync.tsx
│  │  │  └─ toast-provider.tsx
│  │  ├─ router
│  │  │  ├─ default-redirect-page.tsx
│  │  │  ├─ default-redirect.rule.ts
│  │  │  ├─ index.tsx
│  │  │  ├─ lazy-pages.ts
│  │  │  ├─ protected-route.tsx
│  │  │  ├─ role-guard.tsx
│  │  │  ├─ route-meta.ts
│  │  │  ├─ route-paths.ts
│  │  │  └─ user-detail-access.tsx
│  │  └─ store
│  │     ├─ auth.selectors.ts
│  │     ├─ auth.slice.ts
│  │     ├─ hooks.ts
│  │     ├─ index.ts
│  │     ├─ root-reducer.ts
│  │     └─ ui.slice.ts
│  ├─ App.css
│  ├─ App.tsx
│  ├─ application
│  ├─ assets
│  │  └─ react.svg
│  ├─ domain
│  │  └─ auth
│  │     └─ rules
│  │        └─ auth.rule.ts
│  ├─ index.css
│  ├─ infrastructure
│  │  ├─ query
│  │  │  └─ query-keys.ts
│  │  └─ services
│  │     ├─ api-unwrap.util.ts
│  │     ├─ audit-log-parse.util.ts
│  │     ├─ auth.api.ts
│  │     ├─ class-parse.util.ts
│  │     ├─ classes.api.ts
│  │     ├─ dashboard.api.ts
│  │     ├─ finance-parse.util.ts
│  │     ├─ finance.api.ts
│  │     ├─ global-search-parse.util.ts
│  │     ├─ notification-parse.util.ts
│  │     ├─ notifications.api.ts
│  │     ├─ query-params.util.ts
│  │     ├─ refund-parse.util.ts
│  │     ├─ refund.api.ts
│  │     ├─ session-parse.util.ts
│  │     ├─ sessions.api.ts
│  │     ├─ student-parse.util.ts
│  │     ├─ students.api.ts
│  │     ├─ system.api.ts
│  │     ├─ user-detail.util.ts
│  │     ├─ user-list.util.ts
│  │     └─ users.api.ts
│  ├─ main.tsx
│  ├─ presentation
│  │  ├─ components
│  │  │  ├─ classes
│  │  │  │  ├─ attendance-form.tsx
│  │  │  │  ├─ class-attendance-pivot.tsx
│  │  │  │  ├─ class-form.constants.ts
│  │  │  │  ├─ cover-modal.tsx
│  │  │  │  ├─ program-theme.ts
│  │  │  │  ├─ reschedule-modal.tsx
│  │  │  │  └─ session-list.tsx
│  │  │  ├─ common
│  │  │  │  └─ status-badge.tsx
│  │  │  ├─ finance
│  │  │  │  ├─ amount-in-words.tsx
│  │  │  │  ├─ debt-indicator.tsx
│  │  │  │  ├─ finance-dashboard-charts.tsx
│  │  │  │  ├─ payroll-preview-table.tsx
│  │  │  │  ├─ receipt-card.tsx
│  │  │  │  └─ revenue-chart.tsx
│  │  │  ├─ students
│  │  │  │  ├─ drop-modal.tsx
│  │  │  │  ├─ enrollment-card.tsx
│  │  │  │  ├─ makeup-modal.tsx
│  │  │  │  ├─ pause-modal.tsx
│  │  │  │  └─ transfer-class-modal.tsx
│  │  │  └─ system
│  │  │     ├─ create-user-modal.tsx
│  │  │     ├─ role-badge.tsx
│  │  │     ├─ salary-modal.tsx
│  │  │     ├─ user-account-form.tsx
│  │  │     ├─ user-form.tsx
│  │  │     ├─ user-modal.tsx
│  │  │     └─ user-row-actions.tsx
│  │  ├─ hooks
│  │  │  ├─ auth
│  │  │  │  ├─ use-auth.ts
│  │  │  │  ├─ use-init-auth.ts
│  │  │  │  ├─ use-login.ts
│  │  │  │  └─ use-logout.ts
│  │  │  ├─ classes
│  │  │  │  ├─ use-class-mutations.ts
│  │  │  │  └─ use-classes.ts
│  │  │  ├─ finance
│  │  │  │  ├─ use-finance-mutations.ts
│  │  │  │  ├─ use-finance.ts
│  │  │  │  ├─ use-payroll.ts
│  │  │  │  ├─ use-receipts.ts
│  │  │  │  └─ use-refund-requests.ts
│  │  │  ├─ sessions
│  │  │  │  ├─ use-attendance-history.ts
│  │  │  │  ├─ use-session-mutations.ts
│  │  │  │  └─ use-sessions.ts
│  │  │  ├─ students
│  │  │  │  ├─ use-attendance.ts
│  │  │  │  ├─ use-enrollment-mutations.ts
│  │  │  │  ├─ use-makeup-sessions.ts
│  │  │  │  ├─ use-pause-requests.ts
│  │  │  │  ├─ use-student-mutations.ts
│  │  │  │  └─ use-students.ts
│  │  │  ├─ system
│  │  │  │  ├─ use-global-search.ts
│  │  │  │  ├─ use-user-mutations.ts
│  │  │  │  ├─ use-user-role-tab-counts.ts
│  │  │  │  └─ use-users.ts
│  │  │  ├─ toast-api-error.ts
│  │  │  ├─ use-dashboard-stats.ts
│  │  │  ├─ use-global-search.ts
│  │  │  ├─ use-notifications.ts
│  │  │  ├─ use-pause-pending-count.ts
│  │  │  ├─ use-permission.ts
│  │  │  ├─ use-sidebar-menu.ts
│  │  │  └─ users
│  │  │     ├─ use-user-mutations.ts
│  │  │     ├─ use-user.ts
│  │  │     └─ use-users.ts
│  │  ├─ layouts
│  │  │  ├─ auth-layout.tsx
│  │  │  ├─ dashboard-layout.tsx
│  │  │  ├─ page-loader.tsx
│  │  │  ├─ route-error-boundary.tsx
│  │  │  ├─ shell
│  │  │  │  ├─ app-breadcrumb.tsx
│  │  │  │  ├─ header-theme-toggle.tsx
│  │  │  │  ├─ notification-menu.tsx
│  │  │  │  ├─ search-overlay.tsx
│  │  │  │  └─ user-menu.tsx
│  │  │  └─ sidebar-menu.config.ts
│  │  ├─ lib
│  │  │  ├─ attendance-access.ts
│  │  │  └─ class-create-errors.ts
│  │  ├─ pages
│  │  │  ├─ auth
│  │  │  │  └─ login.page.tsx
│  │  │  ├─ classes
│  │  │  │  ├─ class-detail.page.tsx
│  │  │  │  ├─ class-form.page.tsx
│  │  │  │  └─ class-list.page.tsx
│  │  │  ├─ curriculum
│  │  │  │  ├─ program-detail.page.tsx
│  │  │  │  ├─ program-form.page.tsx
│  │  │  │  └─ program-list.page.tsx
│  │  │  ├─ dashboard
│  │  │  │  ├─ accountant-dashboard.tsx
│  │  │  │  ├─ admin-dashboard.tsx
│  │  │  │  ├─ components
│  │  │  │  │  ├─ kpi-card.tsx
│  │  │  │  │  ├─ program-bar-chart.tsx
│  │  │  │  │  └─ revenue-chart.tsx
│  │  │  │  ├─ dashboard.page.tsx
│  │  │  │  └─ teacher-dashboard.tsx
│  │  │  ├─ errors
│  │  │  │  ├─ forbidden.page.tsx
│  │  │  │  └─ not-found.page.tsx
│  │  │  ├─ feedback
│  │  │  │  ├─ session-feedback.page.tsx
│  │  │  │  └─ student-score-history.page.tsx
│  │  │  ├─ finance
│  │  │  │  ├─ fee-plan-list.page.tsx
│  │  │  │  ├─ finance-dashboard.page.tsx
│  │  │  │  ├─ invoice-detail.page.tsx
│  │  │  │  ├─ invoice-list.page.tsx
│  │  │  │  ├─ payment-status.page.tsx
│  │  │  │  ├─ payroll-detail.page.tsx
│  │  │  │  ├─ payroll-form.page.tsx
│  │  │  │  ├─ payroll-list.page.tsx
│  │  │  │  ├─ receipt-detail.page.tsx
│  │  │  │  ├─ receipt-form.page.tsx
│  │  │  │  ├─ receipt-list.page.tsx
│  │  │  │  ├─ refund-requests.page.tsx
│  │  │  │  └─ student-finance.page.tsx
│  │  │  ├─ public
│  │  │  │  └─ upcoming-classes.page.tsx
│  │  │  ├─ sessions
│  │  │  │  ├─ my-sessions.page.tsx
│  │  │  │  ├─ session-detail.page.tsx
│  │  │  │  └─ session-list.page.tsx
│  │  │  ├─ students
│  │  │  │  ├─ makeup-sessions.page.tsx
│  │  │  │  ├─ pause-requests.page.tsx
│  │  │  │  ├─ student-detail.page.tsx
│  │  │  │  ├─ student-form.page.tsx
│  │  │  │  └─ student-list.page.tsx
│  │  │  ├─ system
│  │  │  │  ├─ audit-log.page.tsx
│  │  │  │  ├─ demo-control-center.page.tsx
│  │  │  │  ├─ notifications.page.tsx
│  │  │  │  ├─ search.page.tsx
│  │  │  │  ├─ user-create.page.tsx
│  │  │  │  ├─ user-detail.page.tsx
│  │  │  │  └─ user-management.page.tsx
│  │  │  └─ trials
│  │  │     ├─ trial-detail.page.tsx
│  │  │     ├─ trial-form.page.tsx
│  │  │     └─ trial-list.page.tsx
│  │  └─ utils
│  │     └─ user-api-error.util.ts
│  ├─ shared
│  │  ├─ constants
│  │  │  ├─ config.ts
│  │  │  ├─ roles.ts
│  │  │  ├─ statuses.ts
│  │  │  └─ student-drop.ts
│  │  ├─ hooks
│  │  │  ├─ use-click-outside.ts
│  │  │  ├─ use-debounce.ts
│  │  │  ├─ use-local-storage.ts
│  │  │  └─ use-theme.ts
│  │  ├─ lib
│  │  │  ├─ api-error.ts
│  │  │  ├─ chart-colors.ts
│  │  │  ├─ cn.ts
│  │  │  ├─ currency.ts
│  │  │  ├─ date.ts
│  │  │  ├─ display.ts
│  │  │  ├─ fmt.ts
│  │  │  ├─ map-user-response.ts
│  │  │  └─ seniority.ts
│  │  ├─ types
│  │  │  ├─ api-contract.ts
│  │  │  ├─ api.type.ts
│  │  │  ├─ audit-log.type.ts
│  │  │  ├─ auth.type.ts
│  │  │  ├─ class.type.ts
│  │  │  ├─ dashboard-stats.type.ts
│  │  │  ├─ finance.type.ts
│  │  │  ├─ global-search.type.ts
│  │  │  ├─ notification.type.ts
│  │  │  ├─ session.type.ts
│  │  │  ├─ student.type.ts
│  │  │  └─ user.type.ts
│  │  ├─ ui
│  │  │  ├─ accordion-section.tsx
│  │  │  ├─ avatar.tsx
│  │  │  ├─ badge.tsx
│  │  │  ├─ button.tsx
│  │  │  ├─ circular-progress.tsx
│  │  │  ├─ confirm-dialog.tsx
│  │  │  ├─ data-table.tsx
│  │  │  ├─ empty-state.tsx
│  │  │  ├─ expandable-text.tsx
│  │  │  ├─ feedback
│  │  │  │  ├─ error-boundary.tsx
│  │  │  │  └─ loading.tsx
│  │  │  ├─ form
│  │  │  │  ├─ form-field.tsx
│  │  │  │  ├─ form-input.tsx
│  │  │  │  └─ form-select.tsx
│  │  │  ├─ index.ts
│  │  │  ├─ input.tsx
│  │  │  ├─ modal.tsx
│  │  │  ├─ page-header.tsx
│  │  │  ├─ placeholder-text.tsx
│  │  │  ├─ search-box.tsx
│  │  │  ├─ select.tsx
│  │  │  ├─ session-progress-bar.tsx
│  │  │  ├─ skeleton.tsx
│  │  │  ├─ stats-card.tsx
│  │  │  ├─ tabs.tsx
│  │  │  ├─ textarea.tsx
│  │  │  ├─ toaster.tsx
│  │  │  └─ tooltip.tsx
│  │  └─ utils
│  │     ├─ amount-to-words.ts
│  │     └─ format-vnd.ts
│  └─ styles
│     ├─ index.css
│     ├─ utilities.css
│     └─ variables.css
├─ tsconfig.app.json
├─ tsconfig.json
├─ tsconfig.node.json
└─ vite.config.ts

```