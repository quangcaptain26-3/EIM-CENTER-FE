
```
eim-center-frontend
├─ .env
├─ bash.exe.stackdump
├─ eslint.config.js
├─ final_check.txt
├─ index.html
├─ magic_strings.txt
├─ navigation_matches.txt
├─ package-lock.json
├─ package.json
├─ public
│  └─ vite.svg
├─ README.md
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
│  │  │  └─ toast-provider.tsx
│  │  ├─ router
│  │  │  ├─ index.tsx
│  │  │  ├─ protected-route.tsx
│  │  │  ├─ role-guard.tsx
│  │  │  ├─ route-meta.ts
│  │  │  └─ route-paths.ts
│  │  └─ store
│  │     ├─ hooks.ts
│  │     ├─ index.ts
│  │     └─ root-reducer.ts
│  ├─ App.css
│  ├─ App.tsx
│  ├─ application
│  │  ├─ auth
│  │  │  ├─ dto
│  │  │  │  ├─ auth-user.dto.ts
│  │  │  │  ├─ login.dto.ts
│  │  │  │  └─ refresh-token.dto.ts
│  │  │  ├─ forms
│  │  │  │  └─ login.form.ts
│  │  │  ├─ mappers
│  │  │  │  └─ auth.mapper.ts
│  │  │  └─ use-cases
│  │  │     ├─ get-me.use-case.ts
│  │  │     ├─ login.use-case.ts
│  │  │     ├─ logout.use-case.ts
│  │  │     └─ refresh-token.use-case.ts
│  │  ├─ classes
│  │  │  ├─ dto
│  │  │  │  └─ classes.dto.ts
│  │  │  ├─ forms
│  │  │  ├─ mappers
│  │  │  │  └─ class.mapper.ts
│  │  │  └─ use-cases
│  │  ├─ curriculum
│  │  │  ├─ dto
│  │  │  │  ├─ index.ts
│  │  │  │  ├─ program.dto.ts
│  │  │  │  └─ unit.dto.ts
│  │  │  ├─ forms
│  │  │  │  ├─ program.form.ts
│  │  │  │  └─ unit.form.ts
│  │  │  ├─ mappers
│  │  │  │  └─ curriculum.mapper.ts
│  │  │  └─ use-cases
│  │  │     ├─ create-program.use-case.ts
│  │  │     ├─ create-unit.use-case.ts
│  │  │     ├─ get-program.use-case.ts
│  │  │     ├─ get-unit.use-case.ts
│  │  │     ├─ index.ts
│  │  │     ├─ list-program-units.use-case.ts
│  │  │     ├─ list-programs.use-case.ts
│  │  │     ├─ update-program.use-case.ts
│  │  │     └─ update-unit.use-case.ts
│  │  ├─ feedback
│  │  │  ├─ dto
│  │  │  │  └─ feedback.dto.ts
│  │  │  ├─ forms
│  │  │  ├─ mappers
│  │  │  │  └─ feedback.mapper.ts
│  │  │  └─ use-cases
│  │  ├─ finance
│  │  │  ├─ dto
│  │  │  │  └─ finance.dto.ts
│  │  │  ├─ forms
│  │  │  ├─ mappers
│  │  │  │  └─ finance.mapper.ts
│  │  │  └─ use-cases
│  │  │     ├─ fee-plan.use-case.ts
│  │  │     ├─ index.ts
│  │  │     ├─ invoice.use-case.ts
│  │  │     └─ payment.use-case.ts
│  │  ├─ sessions
│  │  │  ├─ dto
│  │  │  │  └─ sessions.dto.ts
│  │  │  ├─ forms
│  │  │  ├─ mappers
│  │  │  │  └─ sessions.mapper.ts
│  │  │  └─ use-cases
│  │  ├─ students
│  │  │  ├─ dto
│  │  │  │  ├─ enrollment.dto.ts
│  │  │  │  └─ student.dto.ts
│  │  │  ├─ forms
│  │  │  │  ├─ enrollment.form.ts
│  │  │  │  └─ student.form.ts
│  │  │  ├─ mappers
│  │  │  │  └─ students.mapper.ts
│  │  │  └─ use-cases
│  │  │     ├─ create-enrollment.use-case.ts
│  │  │     ├─ create-student.use-case.ts
│  │  │     ├─ get-student.use-case.ts
│  │  │     ├─ index.ts
│  │  │     ├─ list-student-enrollments.use-case.ts
│  │  │     ├─ list-students.use-case.ts
│  │  │     ├─ transfer-enrollment.use-case.ts
│  │  │     ├─ update-enrollment-status.use-case.ts
│  │  │     └─ update-student.use-case.ts
│  │  ├─ system
│  │  │  ├─ dto
│  │  │  │  └─ system.dto.ts
│  │  │  ├─ forms
│  │  │  ├─ mappers
│  │  │  │  └─ system.mapper.ts
│  │  │  └─ use-cases
│  │  └─ trials
│  │     ├─ dto
│  │     │  └─ trials.dto.ts
│  │     ├─ forms
│  │     ├─ mappers
│  │     │  └─ trials.mapper.ts
│  │     └─ use-cases
│  ├─ assets
│  │  └─ react.svg
│  ├─ domain
│  │  ├─ auth
│  │  │  ├─ models
│  │  │  │  ├─ permission.model.ts
│  │  │  │  ├─ role.model.ts
│  │  │  │  └─ user.model.ts
│  │  │  └─ rules
│  │  │     ├─ auth.rule.ts
│  │  │     └─ navigation.rule.ts
│  │  ├─ classes
│  │  │  ├─ models
│  │  │  │  ├─ class-schedule.model.ts
│  │  │  │  ├─ class-staff.model.ts
│  │  │  │  └─ class.model.ts
│  │  │  └─ rules
│  │  │     └─ class.rule.ts
│  │  ├─ curriculum
│  │  │  ├─ models
│  │  │  │  ├─ index.ts
│  │  │  │  ├─ lesson.model.ts
│  │  │  │  ├─ program.model.ts
│  │  │  │  └─ unit.model.ts
│  │  │  └─ rules
│  │  │     └─ curriculum.rule.ts
│  │  ├─ feedback
│  │  │  ├─ models
│  │  │  │  ├─ feedback.model.ts
│  │  │  │  └─ score.model.ts
│  │  │  └─ rules
│  │  │     ├─ feedback-visibility.rule.ts
│  │  │     └─ feedback.rule.ts
│  │  ├─ finance
│  │  │  ├─ models
│  │  │  │  ├─ fee-plan.model.ts
│  │  │  │  ├─ invoice.model.ts
│  │  │  │  └─ payment.model.ts
│  │  │  └─ rules
│  │  │     └─ finance.rule.ts
│  │  ├─ sessions
│  │  │  ├─ models
│  │  │  │  ├─ session-reschedule.model.ts
│  │  │  │  └─ session.model.ts
│  │  │  └─ rules
│  │  │     └─ session.rule.ts
│  │  ├─ students
│  │  │  ├─ models
│  │  │  │  ├─ enrollment-history.model.ts
│  │  │  │  ├─ enrollment.model.ts
│  │  │  │  └─ student.model.ts
│  │  │  └─ rules
│  │  │     └─ enrollment.rule.ts
│  │  ├─ system
│  │  │  ├─ models
│  │  │  │  ├─ audit-log.model.ts
│  │  │  │  └─ notification.model.ts
│  │  │  └─ rules
│  │  │     └─ system.rule.ts
│  │  └─ trials
│  │     ├─ models
│  │     │  ├─ trial-conversion.model.ts
│  │     │  ├─ trial-lead.model.ts
│  │     │  └─ trial-schedule.model.ts
│  │     └─ rules
│  │        └─ trial.rule.ts
│  ├─ index.css
│  ├─ infrastructure
│  │  ├─ adapters
│  │  │  ├─ auth-storage.adapter.ts
│  │  │  └─ toast.adapter.ts
│  │  ├─ http
│  │  │  ├─ api-client.ts
│  │  │  ├─ http-error.mapper.ts
│  │  │  └─ interceptors.ts
│  │  ├─ query
│  │  │  ├─ invalidation.ts
│  │  │  ├─ mutations.ts
│  │  │  └─ query-keys.ts
│  │  ├─ services
│  │  │  ├─ auth.api.ts
│  │  │  ├─ classes.api.ts
│  │  │  ├─ classes.service.ts
│  │  │  ├─ curriculum.api.ts
│  │  │  ├─ enrollments.api.ts
│  │  │  ├─ feedback.api.ts
│  │  │  ├─ finance.api.ts
│  │  │  ├─ sessions.api.ts
│  │  │  ├─ students.api.ts
│  │  │  ├─ system.api.ts
│  │  │  └─ trials.api.ts
│  │  └─ store
│  │     ├─ app.slice.ts
│  │     ├─ auth.slice.ts
│  │     └─ ui.slice.ts
│  ├─ main.tsx
│  ├─ presentation
│  │  ├─ components
│  │  │  ├─ auth
│  │  │  ├─ classes
│  │  │  │  ├─ class-roster-tab.tsx
│  │  │  │  ├─ class-row-actions.tsx
│  │  │  │  ├─ class-schedules-tab.tsx
│  │  │  │  ├─ class-staff-tab.tsx
│  │  │  │  └─ class-table.tsx
│  │  │  ├─ common
│  │  │  │  ├─ confirm-dialog.tsx
│  │  │  │  ├─ data-table.tsx
│  │  │  │  ├─ export-excel-button.tsx
│  │  │  │  ├─ nav-section-title.tsx
│  │  │  │  ├─ page-shell.tsx
│  │  │  │  ├─ page-title.tsx
│  │  │  │  ├─ protected-action.tsx
│  │  │  │  ├─ search-box.tsx
│  │  │  │  └─ status-badge.tsx
│  │  │  ├─ curriculum
│  │  │  │  ├─ create-unit-modal.tsx
│  │  │  │  ├─ program-card.tsx
│  │  │  │  ├─ program-form.tsx
│  │  │  │  ├─ program-summary.tsx
│  │  │  │  ├─ unit-form.tsx
│  │  │  │  └─ unit-list.tsx
│  │  │  ├─ dashboard
│  │  │  │  ├─ dashboard-shortcut-card.tsx
│  │  │  │  └─ dashboard-welcome.tsx
│  │  │  ├─ feedback
│  │  │  │  ├─ attendance-select.tsx
│  │  │  │  ├─ feedback-form-row.tsx
│  │  │  │  ├─ import-feedback-modal.tsx
│  │  │  │  ├─ metric-input.tsx
│  │  │  │  ├─ score-input.tsx
│  │  │  │  └─ session-feedback-toolbar.tsx
│  │  │  ├─ finance
│  │  │  │  ├─ export-finance-modal.tsx
│  │  │  │  ├─ invoice-card.tsx
│  │  │  │  ├─ invoice-status-badge.tsx
│  │  │  │  └─ payment-form.tsx
│  │  │  ├─ layout
│  │  │  │  ├─ app-header.tsx
│  │  │  │  ├─ app-sidebar-item.tsx
│  │  │  │  ├─ app-sidebar.tsx
│  │  │  │  ├─ breadcrumb.config.ts
│  │  │  │  ├─ breadcrumb.tsx
│  │  │  │  ├─ sidebar-menu.config.ts
│  │  │  │  └─ user-menu.tsx
│  │  │  ├─ sessions
│  │  │  │  ├─ cover-teacher-modal.tsx
│  │  │  │  ├─ session-timeline-list.tsx
│  │  │  │  └─ session-type-badge.tsx
│  │  │  ├─ students
│  │  │  │  ├─ create-enrollment-modal.tsx
│  │  │  │  ├─ enrollment-list.tsx
│  │  │  │  ├─ enrollment-status-badge.tsx
│  │  │  │  ├─ student-form.tsx
│  │  │  │  ├─ student-profile-card.tsx
│  │  │  │  ├─ student-row-actions.tsx
│  │  │  │  ├─ student-table.tsx
│  │  │  │  ├─ transfer-enrollment-modal.tsx
│  │  │  │  └─ update-enrollment-status-modal.tsx
│  │  │  ├─ system
│  │  │  │  ├─ audit-log-table.tsx
│  │  │  │  ├─ notification-bell.tsx
│  │  │  │  └─ notification-item.tsx
│  │  │  └─ trials
│  │  │     ├─ convert-trial-modal.tsx
│  │  │     ├─ schedule-trial-modal.tsx
│  │  │     ├─ trial-form.tsx
│  │  │     ├─ trial-status-badge.tsx
│  │  │     └─ trial-table.tsx
│  │  ├─ hooks
│  │  │  ├─ auth
│  │  │  │  ├─ use-auth.ts
│  │  │  │  ├─ use-init-auth.ts
│  │  │  │  ├─ use-login.ts
│  │  │  │  ├─ use-logout.ts
│  │  │  │  └─ use-me.ts
│  │  │  ├─ classes
│  │  │  │  ├─ use-class-mutations.ts
│  │  │  │  └─ use-classes.ts
│  │  │  ├─ curriculum
│  │  │  │  ├─ index.ts
│  │  │  │  ├─ use-program-mutations.ts
│  │  │  │  ├─ use-program-units.ts
│  │  │  │  ├─ use-programs.ts
│  │  │  │  └─ use-unit-mutations.ts
│  │  │  ├─ feedback
│  │  │  │  ├─ index.ts
│  │  │  │  ├─ use-feedback-mutations.ts
│  │  │  │  ├─ use-feedback.ts
│  │  │  │  ├─ use-session-feedback-actions.ts
│  │  │  │  └─ use-session-feedback-page.ts
│  │  │  ├─ finance
│  │  │  │  ├─ index.ts
│  │  │  │  ├─ use-finance-mutations.ts
│  │  │  │  ├─ use-finance-permission.ts
│  │  │  │  └─ use-finance.ts
│  │  │  ├─ sessions
│  │  │  │  ├─ index.ts
│  │  │  │  ├─ use-session-mutations.ts
│  │  │  │  └─ use-sessions.ts
│  │  │  ├─ students
│  │  │  │  ├─ index.ts
│  │  │  │  ├─ use-enrollment-mutations.ts
│  │  │  │  ├─ use-student-enrollments.ts
│  │  │  │  ├─ use-student-mutations.ts
│  │  │  │  ├─ use-students-permission.ts
│  │  │  │  └─ use-students.ts
│  │  │  ├─ system
│  │  │  │  ├─ use-notification-mutations.ts
│  │  │  │  ├─ use-notifications.ts
│  │  │  │  ├─ use-route-meta.ts
│  │  │  │  ├─ use-sidebar-menu.ts
│  │  │  │  ├─ use-user-mutations.ts
│  │  │  │  └─ use-users.ts
│  │  │  └─ trials
│  │  │     ├─ index.ts
│  │  │     ├─ use-trial-mutations.ts
│  │  │     ├─ use-trials-permission.ts
│  │  │     └─ use-trials.ts
│  │  ├─ layouts
│  │  │  ├─ auth-layout.tsx
│  │  │  ├─ dashboard-layout.tsx
│  │  │  └─ page-shell.tsx
│  │  └─ pages
│  │     ├─ auth
│  │     │  └─ login.page.tsx
│  │     ├─ classes
│  │     │  ├─ class-detail.page.tsx
│  │     │  ├─ class-form.page.tsx
│  │     │  └─ class-list.page.tsx
│  │     ├─ curriculum
│  │     │  ├─ program-detail.page.tsx
│  │     │  ├─ program-form.page.tsx
│  │     │  └─ program-list.page.tsx
│  │     ├─ dashboard
│  │     │  └─ dashboard.page.tsx
│  │     ├─ errors
│  │     │  ├─ forbidden.page.tsx
│  │     │  └─ not-found.page.tsx
│  │     ├─ feedback
│  │     │  ├─ session-feedback.page.tsx
│  │     │  └─ student-score-history.page.tsx
│  │     ├─ finance
│  │     │  ├─ fee-plan-list.page.tsx
│  │     │  ├─ invoice-detail.page.tsx
│  │     │  ├─ invoice-list.page.tsx
│  │     │  ├─ student-finance.page.tsx
│  │     │  └─ student-payment-status-list.page.tsx
│  │     ├─ sessions
│  │     │  ├─ my-sessions.page.tsx
│  │     │  ├─ session-detail.page.tsx
│  │     │  └─ session-list.page.tsx
│  │     ├─ students
│  │     │  ├─ student-detail.page.tsx
│  │     │  ├─ student-form.page.tsx
│  │     │  └─ student-list.page.tsx
│  │     ├─ system
│  │     │  ├─ audit-log.page.tsx
│  │     │  ├─ notifications.page.tsx
│  │     │  └─ user-management.page.tsx
│  │     └─ trials
│  │        ├─ trial-detail.page.tsx
│  │        ├─ trial-form.page.tsx
│  │        └─ trial-list.page.tsx
│  ├─ shared
│  │  ├─ constants
│  │  │  ├─ enrollment-status.ts
│  │  │  ├─ invoice-status.ts
│  │  │  ├─ roles.ts
│  │  │  └─ session-type.ts
│  │  ├─ hooks
│  │  │  ├─ use-confirm.ts
│  │  │  ├─ use-debounce.ts
│  │  │  └─ use-pagination.ts
│  │  ├─ lib
│  │  │  ├─ cn.ts
│  │  │  ├─ currency.ts
│  │  │  ├─ date.ts
│  │  │  ├─ excel.ts
│  │  │  ├─ storage.ts
│  │  │  └─ token.ts
│  │  ├─ schemas
│  │  │  └─ common.schema.ts
│  │  ├─ types
│  │  │  ├─ api.type.ts
│  │  │  ├─ auth.type.ts
│  │  │  ├─ common.type.ts
│  │  │  └─ table.type.ts
│  │  └─ ui
│  │     ├─ badge.tsx
│  │     ├─ button.tsx
│  │     ├─ feedback
│  │     │  ├─ empty.tsx
│  │     │  ├─ error-state.tsx
│  │     │  ├─ loading.tsx
│  │     │  └─ page-skeleton.tsx
│  │     ├─ form
│  │     │  ├─ form-date-picker.tsx
│  │     │  ├─ form-field.tsx
│  │     │  ├─ form-input.tsx
│  │     │  └─ form-select.tsx
│  │     ├─ input.tsx
│  │     ├─ modal.tsx
│  │     ├─ select.tsx
│  │     └─ table.tsx
│  └─ styles
│     ├─ index.css
│     ├─ utilities.css
│     └─ variables.css
├─ tsconfig.app.json
├─ tsconfig.json
├─ tsconfig.node.json
└─ vite.config.ts

```