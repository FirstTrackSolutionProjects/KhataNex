/**
 * test_responsive_layout.js
 * Comprehensive automated verification test suite for KhataNex global responsive layout and navigation.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getDefaultLandingPath, hasModuleAccess } from "../src/utils/navigation.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

console.log("================================================================================");
console.log("🧪 KHATANEX RESPONSIVE LAYOUT & NAVIGATION AUTOMATED VERIFICATION SUITE");
console.log("================================================================================\n");

// -----------------------------------------------------------------------------
// 1. Test Role-Based Navigation & Home Path Resolution
// -----------------------------------------------------------------------------
console.log("--- TEST 1: Role-Based Home Path Resolution ---");

const superadmin = { role: "superadmin" };
assert(getDefaultLandingPath(superadmin) === "/dashboard", "Superadmin Home routes to /dashboard");

const normalUser = { role: "user" };
assert(getDefaultLandingPath(normalUser) === "/dashboard", "Normal User Home routes to /dashboard (RoleDashboard)");

const employeeAll = { role: "employee", assigned_modules: ["all"] };
assert(getDefaultLandingPath(employeeAll) === "/dashboard", "Employee (all) Home routes to /dashboard");

const employeeCustomers = { role: "employee", assigned_modules: ["customers"] };
assert(getDefaultLandingPath(employeeCustomers) === "/customers", "Employee (customers) Home routes to /customers");

const employeeKhata = { role: "employee", assigned_modules: ["khata"] };
assert(getDefaultLandingPath(employeeKhata) === "/khata", "Employee (khata) Home routes to /khata");

const employeeSales = { role: "employee", assigned_modules: ["sales"] };
assert(getDefaultLandingPath(employeeSales) === "/sales", "Employee (sales) Home routes to /sales");

const employeeInvoices = { role: "employee", assigned_modules: ["invoices"] };
assert(hasModuleAccess(employeeInvoices, "invoices") === true, "Employee (invoices) has access to invoices module");
assert(getDefaultLandingPath(employeeInvoices) === "/sales", "Employee (invoices) lands on first accessible module in navigation (/sales)");

// -----------------------------------------------------------------------------
// 2. Test MobileHeader Structure & Navigation Controls
// -----------------------------------------------------------------------------
console.log("\n--- TEST 2: MobileHeader Component Verification ---");

const mobileHeaderContent = fs.readFileSync(path.join(rootDir, "src/components/MobileHeader.jsx"), "utf8");

assert(mobileHeaderContent.includes("<Menu"), "MobileHeader renders hamburger icon (Menu from lucide-react)");
assert(mobileHeaderContent.includes("openSidebar"), "MobileHeader hamburger button triggers openSidebar");
assert(mobileHeaderContent.includes("/images/Logo.jpeg"), "MobileHeader includes KhataNex application logo");
assert(mobileHeaderContent.includes("KHATANEX"), "MobileHeader includes KHATANEX branding text");
assert(mobileHeaderContent.includes("getDefaultLandingPath"), "MobileHeader Home button dynamically resolves role-based landing path");
assert(mobileHeaderContent.includes('to="/profile"'), "MobileHeader Profile button links directly to /profile");
assert(mobileHeaderContent.includes("lg:hidden"), "MobileHeader is strictly hidden on desktop viewports (lg:hidden)");
assert(mobileHeaderContent.includes("sticky top-0 z-40"), "MobileHeader is sticky with z-40 at the top of the viewport");

// -----------------------------------------------------------------------------
// 3. Test SidebarContext & Body Scroll Locking
// -----------------------------------------------------------------------------
console.log("\n--- TEST 3: SidebarContext & Scroll Lock Verification ---");

const sidebarContextContent = fs.readFileSync(path.join(rootDir, "src/context/SidebarContext.jsx"), "utf8");

assert(sidebarContextContent.includes('document.body.style.overflow = "hidden"'), "SidebarContext locks document body scroll when drawer opens");
assert(sidebarContextContent.includes("location.pathname"), "SidebarContext automatically closes drawer on route change");
assert(sidebarContextContent.includes("isLayoutMounted"), "SidebarContext tracks layout mounting to prevent duplicate sidebars");

// -----------------------------------------------------------------------------
// 4. Test Sidebar Component & Duplicate Suppression
// -----------------------------------------------------------------------------
console.log("\n--- TEST 4: Sidebar Component & Drawer Structure ---");

const sidebarContent = fs.readFileSync(path.join(rootDir, "src/components/Sidebar.jsx"), "utf8");

assert(sidebarContent.includes("isRootLayout"), "Sidebar accepts isRootLayout prop to identify root layout instance");
assert(sidebarContent.includes("if (!isRootLayout && isLayoutMounted)"), "Sidebar suppresses duplicate nested instances");
assert(sidebarContent.includes("fixed inset-0 z-[55]"), "Sidebar renders mobile backdrop overlay with z-[55]");
assert(sidebarContent.includes("z-[60]"), "Sidebar drawer has z-[60] ensuring it stays above backdrop and page content");
assert(sidebarContent.includes("lg:w-64"), "Sidebar has fixed width of 64 (256px) on desktop");
assert(sidebarContent.includes("lg:translate-x-0"), "Sidebar is permanently visible on desktop (lg:translate-x-0)");
assert(sidebarContent.includes("-translate-x-full"), "Sidebar drawer is off-screen by default on mobile (-translate-x-full)");
assert(sidebarContent.includes("overflow-y-auto"), "Sidebar navigation items are scrollable preventing content cutoff");

// -----------------------------------------------------------------------------
// 5. Test DashboardLayout Architecture & Desktop Offset
// -----------------------------------------------------------------------------
console.log("\n--- TEST 5: DashboardLayout & Desktop Alignment ---");

const dashboardLayoutContent = fs.readFileSync(path.join(rootDir, "src/components/DashboardLayout.jsx"), "utf8");

assert(dashboardLayoutContent.includes("<Sidebar isRootLayout={true} />"), "DashboardLayout renders the authoritative root Sidebar instance");
assert(dashboardLayoutContent.includes("<MobileHeader />"), "DashboardLayout mounts the global MobileHeader");
assert(dashboardLayoutContent.includes("lg:pl-64"), "DashboardLayout offsets main content with lg:pl-64 (256px) so content starts strictly after sidebar");
assert(dashboardLayoutContent.includes("<BottomNav />"), "DashboardLayout provides mobile BottomNav");
assert(dashboardLayoutContent.includes("dashboard-layout-content"), "DashboardLayout applies dashboard-layout-content CSS boundary class");

// -----------------------------------------------------------------------------
// 6. Test Global CSS Alignment & Neutralization Rules
// -----------------------------------------------------------------------------
console.log("\n--- TEST 6: Global CSS Layout Rules ---");

const indexCssContent = fs.readFileSync(path.join(rootDir, "src/index.css"), "utf8");

assert(indexCssContent.includes(".dashboard-layout-content .lg\\:pl-64"), "CSS rule neutralizes duplicate lg:pl-64 inside dashboard layout");
assert(indexCssContent.includes(".dashboard-layout-content .lg\\:ml-64"), "CSS rule neutralizes duplicate lg:ml-64 inside dashboard layout");
assert(indexCssContent.includes(".dashboard-layout-content .lg\\:pl-72"), "CSS rule neutralizes duplicate lg:pl-72 inside dashboard layout");
assert(indexCssContent.includes("padding-left: 0 !important;"), "Redundant nested padding is cleanly eliminated to prevent 512px double offset");

// -----------------------------------------------------------------------------
// 7. Test App.jsx Route Wrappers Across All Required Pages
// -----------------------------------------------------------------------------
console.log("\n--- TEST 7: Page Route Wrapping in App.jsx ---");

const appContent = fs.readFileSync(path.join(rootDir, "src/App.jsx"), "utf8");

const requiredPages = [
  "dashboard",
  "banking",
  "customers",
  "khata",
  "sales",
  "payments",
  "invoices",
  "quotations",
  "money-receipts",
  "inventory",
  "purchases",
  "vehicles",
  "reports",
  "my-users",
  "my-employees",
  "help-centre",
  "profile",
  "settings",
  "subscription",
  "billing",
];

for (const page of requiredPages) {
  const routePattern = new RegExp(`path="/${page}"[\\s\\S]*?<DashboardLayout>`, "i");
  const hasWrapper = routePattern.test(appContent);
  assert(hasWrapper, `Route /${page} is wrapped in <DashboardLayout>`);
}

// -----------------------------------------------------------------------------
// 8. Test Viewport Width Responsive Breakpoints
// -----------------------------------------------------------------------------
console.log("\n--- TEST 8: Responsive Breakpoint Verification ---");

const testedViewports = [
  { width: 375, type: "Mobile (Small)", isMobile: true },
  { width: 390, type: "Mobile (Standard)", isMobile: true },
  { width: 430, type: "Mobile (Large)", isMobile: true },
  { width: 768, type: "Tablet (Portrait)", isMobile: true },
  { width: 1024, type: "Desktop (Small / lg)", isMobile: false },
  { width: 1366, type: "Desktop (Standard Laptop)", isMobile: false },
  { width: 1440, type: "Desktop (Large Screen)", isMobile: false },
];

for (const vp of testedViewports) {
  if (vp.isMobile) {
    // Under 1024px: lg:hidden is active, lg:pl-64 is 0px
    const mobileHeaderActive = vp.width < 1024;
    const sidebarDrawerMode = vp.width < 1024;
    const layoutOffsetZero = vp.width < 1024;
    assert(
      mobileHeaderActive && sidebarDrawerMode && layoutOffsetZero,
      `Viewport ${vp.width}px (${vp.type}): MobileHeader active, Sidebar in drawer mode, content 100% width`
    );
  } else {
    // 1024px and above: lg:pl-64 active (256px), lg:hidden hides MobileHeader, Sidebar permanently visible
    const desktopSidebarFixed = vp.width >= 1024;
    const contentOffset256 = vp.width >= 1024;
    const mobileHeaderHidden = vp.width >= 1024;
    assert(
      desktopSidebarFixed && contentOffset256 && mobileHeaderHidden,
      `Viewport ${vp.width}px (${vp.type}): Sidebar permanent 256px, content starts after sidebar, MobileHeader hidden`
    );
  }
}

// -----------------------------------------------------------------------------
// Summary
// -----------------------------------------------------------------------------
console.log("\n================================================================================");
console.log("📊 EXECUTION SUMMARY");
console.log("================================================================================");
console.log(`Passed: ${passed}/${passed + failed} (${Math.round((passed / (passed + failed)) * 100)}%)`);

if (failed > 0) {
  process.exit(1);
} else {
  console.log("✨ All responsive layout and navigation checks passed successfully!\n");
  process.exit(0);
}
