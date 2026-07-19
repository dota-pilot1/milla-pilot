package com.cj.donationplatform.config;

import com.cj.donationplatform.role.domain.Role;
import com.cj.donationplatform.role.infrastructure.RoleRepository;
import com.cj.donationplatform.user.domain.User;
import com.cj.donationplatform.user.infrastructure.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 데모/개발용 운영 계정 시드 — 플랫폼 관리자 / 시설 관리자. 이메일 기준 멱등.
 * 공통 비밀번호 {@link DonorUserSeeder#TEST_PASSWORD}(password123).
 * 운영 계정은 내부 업무 이메일(@milla.im)로 후원자(개인 메일)와 구분한다.
 * User 는 role 을 하나만 가지며 시설 FK 가 없어 시설 관리자는 역할만 부여하고,
 * 담당 시설은 이메일 프리픽스(haetsal/pureunsup/...)로 표기만 한다.
 */
@Slf4j
@Component
@Order(6)
@RequiredArgsConstructor
public class StaffUserSeeder implements ApplicationRunner {

    private record StaffDef(String email, String name, String roleCode) {}

    private static final List<StaffDef> STAFF = List.of(
            // 플랫폼 관리자 — donation-admin-tauri 로그인 대상
            new StaffDef("admin@milla.im", "배준영", RoleSeeder.ROLE_PLATFORM_ADMIN),
            new StaffDef("ops@milla.im", "서민재", RoleSeeder.ROLE_PLATFORM_ADMIN),
            // 시설 관리자 — 시설별 담당 (데이터상 시설 FK 없음, 역할만 부여)
            new StaffDef("haetsal.admin@milla.im", "오은주", RoleSeeder.ROLE_FACILITY_ADMIN),
            new StaffDef("pureunsup.admin@milla.im", "신재훈", RoleSeeder.ROLE_FACILITY_ADMIN),
            new StaffDef("onmaeul.admin@milla.im", "문가영", RoleSeeder.ROLE_FACILITY_ADMIN),
            new StaffDef("saessak.admin@milla.im", "조성민", RoleSeeder.ROLE_FACILITY_ADMIN)
    );

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        int created = 0;
        int synced = 0;
        for (StaffDef staff : STAFF) {
            Role role = roleRepository.findByCode(staff.roleCode()).orElse(null);
            if (role == null) {
                log.warn("[StaffUserSeeder] 역할 {} 없음 — {} 시드 건너뜀", staff.roleCode(), staff.email());
                continue;
            }
            String passwordHash = passwordEncoder.encode(DonorUserSeeder.TEST_PASSWORD);
            User existing = userRepository.findByEmail(staff.email()).orElse(null);
            if (existing != null) {
                existing.changePassword(passwordHash);
                existing.changeRole(role);
                existing.activate();
                synced++;
                continue;
            }
            userRepository.save(User.createNewUser(
                    staff.email(),
                    passwordHash,
                    staff.name(),
                    role
            ));
            created++;
        }
        log.info("[StaffUserSeeder] 운영 계정 {}명 신규 시드, {}명 동기화 (총 {}명 목표)", created, synced, STAFF.size());
    }
}
