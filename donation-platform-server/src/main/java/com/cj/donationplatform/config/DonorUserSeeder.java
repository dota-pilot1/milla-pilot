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
 * 데모/개발용 후원자(ROLE_DONOR) 시드. 이메일 기준 멱등.
 * 실감나는 실명 + 개인 이메일 10명 / 공통 비밀번호 password123.
 * 후원자는 개인 메일(gmail/naver/daum/kakao), 운영 계정은 @milla.im 으로 구분한다({@link StaffUserSeeder}).
 */
@Slf4j
@Component
@Order(6)
@RequiredArgsConstructor
public class DonorUserSeeder implements ApplicationRunner {

    public static final String TEST_PASSWORD = "password123";

    /** ContributionSeeder 가 시연 후원 데이터를 붙이는 상위 3명 (DONORS 리스트 순서와 일치). */
    public static final String DEMO_DONOR_1 = "seoyeon.kim@gmail.com";
    public static final String DEMO_DONOR_2 = "junho.lee@naver.com";
    public static final String DEMO_DONOR_3 = "jiwoo.park@daum.net";

    private record DonorDef(String email, String name, String phoneNumber) {}

    private static final List<DonorDef> DONORS = List.of(
            new DonorDef(DEMO_DONOR_1, "김서연", "010-4101-2001"),
            new DonorDef(DEMO_DONOR_2, "이준호", "010-4101-2002"),
            new DonorDef(DEMO_DONOR_3, "박지우", "010-4101-2003"),
            new DonorDef("minjun.choi@gmail.com", "최민준", "010-4101-2004"),
            new DonorDef("hayoon.jung@naver.com", "정하윤", "010-4101-2005"),
            new DonorDef("doyoon.kang@kakao.com", "강도윤", "010-4101-2006"),
            new DonorDef("seojun.yoon@gmail.com", "윤서준", "010-4101-2007"),
            new DonorDef("jiho.lim@naver.com", "임지호", "010-4101-2008"),
            new DonorDef("yeeun.han@daum.net", "한예은", "010-4101-2009"),
            new DonorDef("siwoo.oh@gmail.com", "오시우", "010-4101-2010")
    );

    private static final List<DonorDef> LEGACY_DONORS = List.of(
            new DonorDef("donor01@test.com", "김서연", "010-4201-2001"),
            new DonorDef("donor02@test.com", "이준호", "010-4201-2002"),
            new DonorDef("donor03@test.com", "박지우", "010-4201-2003"),
            new DonorDef("donor04@test.com", "최민준", "010-4201-2004"),
            new DonorDef("donor05@test.com", "정하윤", "010-4201-2005"),
            new DonorDef("donor06@test.com", "강도윤", "010-4201-2006"),
            new DonorDef("donor07@test.com", "윤서준", "010-4201-2007"),
            new DonorDef("donor08@test.com", "임지호", "010-4201-2008"),
            new DonorDef("donor09@test.com", "한예은", "010-4201-2009"),
            new DonorDef("donor10@test.com", "오시우", "010-4201-2010")
    );

    public static final int DONOR_COUNT = DONORS.size();

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        Role donorRole = roleRepository.findByCode(RoleSeeder.ROLE_DONOR).orElse(null);
        if (donorRole == null) {
            log.warn("[DonorUserSeeder] ROLE_DONOR 없음 — 후원자 시드 건너뜀");
            return;
        }

        int created = 0;
        int synced = 0;
        for (DonorDef donor : DONORS) {
            String passwordHash = passwordEncoder.encode(TEST_PASSWORD);
            User existing = userRepository.findByEmail(donor.email()).orElse(null);
            if (existing != null) {
                syncDonor(existing, donor, passwordHash, donorRole);
                synced++;
                continue;
            }
            userRepository.save(User.createNewUser(
                    donor.email(),
                    passwordHash,
                    donor.name(),
                    donor.phoneNumber(),
                    donorRole
            ));
            created++;
        }

        int legacySynced = 0;
        for (DonorDef donor : LEGACY_DONORS) {
            User existing = userRepository.findByEmail(donor.email()).orElse(null);
            if (existing == null) continue;
            syncDonor(existing, donor, passwordEncoder.encode(TEST_PASSWORD), donorRole);
            legacySynced++;
        }

        log.info(
                "[DonorUserSeeder] 후원자 유저 {}명 신규 시드, {}명 동기화, 레거시 {}명 동기화 (총 {}명 목표)",
                created, synced, legacySynced, DONOR_COUNT
        );
    }

    private void syncDonor(User user, DonorDef donor, String passwordHash, Role donorRole) {
        user.updateProfile(user.getEmail(), donor.name(), donor.phoneNumber());
        user.changePassword(passwordHash);
        user.changeRole(donorRole);
        user.activate();
    }
}
