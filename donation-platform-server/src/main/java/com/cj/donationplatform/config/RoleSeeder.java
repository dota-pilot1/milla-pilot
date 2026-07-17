package com.cj.donationplatform.config;

import com.cj.donationplatform.role.domain.Role;
import com.cj.donationplatform.role.infrastructure.RoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Component
@Order(2)
@RequiredArgsConstructor
public class RoleSeeder implements ApplicationRunner {

    public static final String ROLE_DONOR = "ROLE_DONOR";
    public static final String ROLE_FACILITY_ADMIN = "ROLE_FACILITY_ADMIN";
    public static final String ROLE_PLATFORM_ADMIN = "ROLE_PLATFORM_ADMIN";

    /*
     * Legacy roles are kept so existing local/dev accounts and authorization
     * checks do not break while the donation-domain roles are introduced.
     */
    public static final String ROLE_USER = "ROLE_USER";
    public static final String ROLE_MANAGER = "ROLE_MANAGER";
    public static final String ROLE_ADMIN = "ROLE_ADMIN";

    private final RoleRepository roleRepository;

    private record RoleDef(String code, String name, String description) {}

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        List<RoleDef> defaults = List.of(
                new RoleDef(ROLE_DONOR, "후원자", "웹에서 후원과 후원 내역을 이용하는 사용자"),
                new RoleDef(ROLE_FACILITY_ADMIN, "시설 관리자", "시설 기준 물품 요청과 수령 업무를 처리하는 사용자"),
                new RoleDef(ROLE_PLATFORM_ADMIN, "플랫폼 관리자", "DonationPlatform 전체 운영과 시스템 관리를 담당하는 사용자")
        );

        for (RoleDef def : defaults) {
            if (!roleRepository.existsByCode(def.code())) {
                roleRepository.save(Role.create(def.code(), def.name(), def.description(), true));
                log.info("Seeded role: {} ({})", def.code(), def.name());
            }
        }
    }
}
