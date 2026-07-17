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
                new MenuDef("DASHBOARD",             null,    "대시보드",      "nav.dashboard",        "/dashboard",        "LayoutDashboard", null,                    0),
                new MenuDef("WEB_DONATE",            null,    "후원하기",      "nav.donate",           "/donate",           "HandCoins",       null,                    1),
                new MenuDef("WEB_MY_DONATIONS",      null,    "내 후원 내역",  "nav.myDonations",      "/my-donations",     "ReceiptText",     null,                    2),
                new MenuDef("ADMIN",                 null,    "관리",          "nav.admin",            null,                "Settings",        RoleSeeder.ROLE_PLATFORM_ADMIN,   1),
                new MenuDef("ADMIN_DONATION",        "ADMIN", "후원 관리",     null,                   null,                "HandCoins",       RoleSeeder.ROLE_PLATFORM_ADMIN,   0),
                new MenuDef("ADMIN_SYSTEM",          "ADMIN", "시스템 관리",   null,                   null,                "Settings",        RoleSeeder.ROLE_PLATFORM_ADMIN,   1),
                new MenuDef("ADMIN_FACILITIES",      "ADMIN_DONATION", "시설 관리",     "nav.facilities",       "/facilities",       "Building2",       RoleSeeder.ROLE_PLATFORM_ADMIN,   0),
                // ADMIN_DONATION_ITEMS(후원 물품 관리)는 시설 관리 화면 안에서 시설별로 다루므로 독립 메뉴에서 제외.
                new MenuDef("ADMIN_FUNDING_CAMPAIGNS","ADMIN_DONATION","펀딩 캠페인",   "nav.fundingCampaigns", "/funding-campaigns","HandCoins",       RoleSeeder.ROLE_PLATFORM_ADMIN,   1),
                new MenuDef("ADMIN_CONTRIBUTIONS",   "ADMIN_DONATION", "후원 내역",     "nav.contributions",    "/contributions",    "ReceiptText",     RoleSeeder.ROLE_PLATFORM_ADMIN,   2),
                new MenuDef("ADMIN_PURCHASE_ORDERS", "ADMIN_DONATION", "통합 구매",     "nav.purchaseOrders",   "/purchase-orders",  "ShoppingCart",    RoleSeeder.ROLE_PLATFORM_ADMIN,   3),
                new MenuDef("ADMIN_DELIVERY_TRACKING","ADMIN_DONATION","배송 추적",     "nav.deliveryTracking", "/delivery-tracking","Truck",           RoleSeeder.ROLE_PLATFORM_ADMIN,   4),
                new MenuDef("ADMIN_RECEIPTS",        "ADMIN_DONATION", "증빙 관리",     "nav.receipts",         "/receipts",         "FileText",        RoleSeeder.ROLE_PLATFORM_ADMIN,   5),
                new MenuDef("ADMIN_USERS",           "ADMIN_SYSTEM", "유저 관리",     "nav.users",            "/users",            "Users",           RoleSeeder.ROLE_PLATFORM_ADMIN,   0),
                new MenuDef("ADMIN_ROLES",           "ADMIN_SYSTEM", "롤 관리",       "nav.roleManagement",   "/roles",            "BadgeCheck",      RoleSeeder.ROLE_PLATFORM_ADMIN,   1),
                new MenuDef("ADMIN_PERMISSIONS",     "ADMIN_SYSTEM", "권한 관리",     "nav.permissions",      "/permissions",      "KeyRound",        RoleSeeder.ROLE_PLATFORM_ADMIN,   2),
                new MenuDef("ADMIN_ROLE_PERMISSIONS","ADMIN_SYSTEM", "역할-권한 매핑","nav.rolePermissions",  "/role-permissions", "ShieldCheck",     RoleSeeder.ROLE_PLATFORM_ADMIN,   3),
                new MenuDef("ADMIN_SITE_SETTINGS",   "ADMIN_SYSTEM", "사이트 설정",   "nav.siteSettings",     "/site-settings",    "LayoutDashboard", RoleSeeder.ROLE_PLATFORM_ADMIN,   4),
                new MenuDef("ADMIN_MENU_MANAGEMENT", "ADMIN_SYSTEM", "헤더 메뉴 관리","nav.menuManagement",   "/menu-management",  "Menu",            RoleSeeder.ROLE_PLATFORM_ADMIN,   5)
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
                "ADMIN_DONATION_ITEMS"
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
