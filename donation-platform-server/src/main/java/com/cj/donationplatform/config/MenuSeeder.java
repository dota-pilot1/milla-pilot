package com.cj.donationplatform.config;

import com.cj.donationplatform.menu.domain.Menu;
import com.cj.donationplatform.menu.infrastructure.MenuRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.List;

@Slf4j
@Component
@Order(4)
@RequiredArgsConstructor
public class MenuSeeder implements ApplicationRunner {

    private final MenuRepository menuRepository;

    private record MenuDef(
            String code, String parentCode, String label, String labelKey,
            String path, String icon, String requiredRole, int displayOrder
    ) {}

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        List<MenuDef> defs = List.of(
                new MenuDef("PROJECT_INTRO",         null,    "프로젝트 소개", "nav.projectIntro",    "/project-intro",    "Info",            null,                    0),
                new MenuDef("DASHBOARD",             null,    "대시보드",      "nav.dashboard",       "/dashboard",        "LayoutDashboard", null,                    1),
                new MenuDef("WEB_DONATION",          null,    "후원",          "nav.donation",         null,                "HandCoins",       null,                    2),
                new MenuDef("WEB_DONATE",            "WEB_DONATION", "후원하기", "nav.donate",          "/donate",           "HandCoins",       null,                    0),
                // 후원 여정 = 후원하기(행동) → 내 후원 내역(내 진행) → 통합구매 현황(전체 투명성) 순서로 한 그룹에 묶는다
                new MenuDef("WEB_MY_DONATIONS",      "WEB_DONATION", "내 후원 내역", "nav.myDonations",  "/my-donations",     "Truck",           null,                    1),
                new MenuDef("WEB_PURCHASE_MONITORING","WEB_DONATION", "통합구매 현황", "nav.purchaseMonitoring", "/purchase-monitoring", "ShoppingCart", null,             2),
                new MenuDef("ADMIN",                 null,    "관리",          "nav.admin",            null,                "Settings",        RoleSeeder.ROLE_PLATFORM_ADMIN,   4),
                new MenuDef("ADMIN_FACILITY",        "ADMIN", "시설 관리",     null,                   null,                "Building2",       RoleSeeder.ROLE_PLATFORM_ADMIN,   0),
                new MenuDef("ADMIN_DONATION",        "ADMIN", "후원 관리",     null,                   null,                "HandCoins",       RoleSeeder.ROLE_PLATFORM_ADMIN,   1),
                new MenuDef("ADMIN_PURCHASE",        "ADMIN", "구매·배송",     null,                   null,                "ShoppingCart",    RoleSeeder.ROLE_PLATFORM_ADMIN,   2),
                new MenuDef("ADMIN_SYSTEM",          "ADMIN", "시스템 관리",   null,                   null,                "Settings",        RoleSeeder.ROLE_PLATFORM_ADMIN,   3),
                new MenuDef("ADMIN_FACILITIES",      "ADMIN_FACILITY", "시설 목록",     "nav.facilities",       "/facilities",       "Building2",       RoleSeeder.ROLE_PLATFORM_ADMIN,   0),
                // ADMIN_DONATION_ITEMS(후원 물품 관리)는 시설 관리 화면 안에서 시설별로 다루므로 독립 메뉴에서 제외.
                new MenuDef("ADMIN_FUNDING_CAMPAIGNS","ADMIN_DONATION","펀딩 캠페인",   "nav.fundingCampaigns", "/funding-campaigns","HandCoins",       RoleSeeder.ROLE_PLATFORM_ADMIN,   2),
                new MenuDef("ADMIN_CONTRIBUTIONS",   "ADMIN_DONATION", "후원 내역",     "nav.contributions",    "/contributions",    "ReceiptText",     RoleSeeder.ROLE_PLATFORM_ADMIN,   0),
                new MenuDef("ADMIN_RECEIPTS",        "ADMIN_DONATION", "증빙 관리",     "nav.receipts",         "/receipts",         "FileText",        RoleSeeder.ROLE_PLATFORM_ADMIN,   1),
                new MenuDef("ADMIN_PURCHASE_ORDERS", "ADMIN_PURCHASE", "통합 구매",     "nav.purchaseOrders",   "/purchase-orders",  "ShoppingCart",    RoleSeeder.ROLE_PLATFORM_ADMIN,   0),
                new MenuDef("ADMIN_DELIVERY_TRACKING","ADMIN_PURCHASE","배송 추적",     "nav.deliveryTracking", "/delivery-tracking","Truck",           RoleSeeder.ROLE_PLATFORM_ADMIN,   1),
                new MenuDef("ADMIN_USERS",           "ADMIN_SYSTEM", "유저 관리",     "nav.users",            "/users",            "Users",           RoleSeeder.ROLE_PLATFORM_ADMIN,   0),
                new MenuDef("ADMIN_ROLES",           "ADMIN_SYSTEM", "롤 관리",       "nav.roleManagement",   "/roles",            "BadgeCheck",      RoleSeeder.ROLE_PLATFORM_ADMIN,   1),
                new MenuDef("ADMIN_PERMISSIONS",     "ADMIN_SYSTEM", "권한 관리",     "nav.permissions",      "/permissions",      "KeyRound",        RoleSeeder.ROLE_PLATFORM_ADMIN,   2),
                new MenuDef("ADMIN_ROLE_PERMISSIONS","ADMIN_SYSTEM", "역할-권한 매핑","nav.rolePermissions",  "/role-permissions", "ShieldCheck",     RoleSeeder.ROLE_PLATFORM_ADMIN,   3),
                new MenuDef("ADMIN_SITE_SETTINGS",   "ADMIN_SYSTEM", "사이트 설정",   "nav.siteSettings",     "/site-settings",    "LayoutDashboard", RoleSeeder.ROLE_PLATFORM_ADMIN,   4),
                new MenuDef("ADMIN_MENU_MANAGEMENT", "ADMIN_SYSTEM", "웹 메뉴 관리",  "nav.menuManagement",   "/menu-management",  "Menu",            RoleSeeder.ROLE_PLATFORM_ADMIN,   5),
                new MenuDef("ADMIN_APP_MENU_MANAGEMENT", "ADMIN_SYSTEM", "앱 메뉴 관리", null,                 "/app-menu-management", "SlidersHorizontal", RoleSeeder.ROLE_PLATFORM_ADMIN, 6)
        );

        for (MenuDef def : defs) {
            Menu parent = def.parentCode() != null
                    ? menuRepository.findByCode(def.parentCode()).orElse(null)
                    : null;
            Menu menu = menuRepository.findByCode(def.code())
                    .orElseGet(() -> Menu.create(
                            def.code(), parent, def.label(), def.labelKey(),
                            def.path(), def.icon(), false,
                            def.requiredRole(), null, true, def.displayOrder()
                    ));
            menu.update(
                    parent, def.label(), def.labelKey(),
                    def.path(), def.icon(), false,
                    def.requiredRole(), null, true, def.displayOrder()
            );
            menuRepository.save(menu);
            log.info("Upserted menu: {}", def.code());
        }

        Set<String> deprecatedWebMenuCodes = Set.of(
                "WEB_FACILITIES",
                "WEB_DONATION_ITEMS",
                "WEB_MY_CONTRIBUTIONS",
                "ADMIN_DONATION_ITEMS",
                // 구매·배송 그룹 = 자식이 모두 후원 그룹으로 이동해 빈 그룹. 숨김(제거 아님)
                "WEB_PURCHASE",
                // 펀딩 캠페인 = 기획 밖(§10 캠페인/확산은 파일럿 이후 후보). 숨김(제거 아님, 되살리기 쉽게)
                "ADMIN_FUNDING_CAMPAIGNS"
        );
        for (String code : deprecatedWebMenuCodes) {
            menuRepository.findByCode(code).ifPresent(menu -> {
                menu.update(
                        menu.getParent(),
                        menu.getLabel(),
                        menu.getLabelKey(),
                        menu.getPath(),
                        menu.getIcon(),
                        menu.isExternal(),
                        menu.getRequiredRole(),
                        menu.getRequiredPermission(),
                        false,
                        menu.getDisplayOrder()
                );
                menuRepository.save(menu);
                log.info("Deprecated menu hidden: {}", code);
            });
        }
    }
}
