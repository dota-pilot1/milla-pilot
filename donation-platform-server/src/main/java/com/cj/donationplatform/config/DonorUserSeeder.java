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

    private record DonorDef(String email, String name) {}

    private static final List<DonorDef> DONORS = List.of(
            new DonorDef(DEMO_DONOR_1, "김서연"),
            new DonorDef(DEMO_DONOR_2, "이준호"),
            new DonorDef(DEMO_DONOR_3, "박지우"),
            new DonorDef("minjun.choi@gmail.com", "최민준"),
            new DonorDef("hayoon.jung@naver.com", "정하윤"),
            new DonorDef("doyoon.kang@kakao.com", "강도윤"),
            new DonorDef("seojun.yoon@gmail.com", "윤서준"),
            new DonorDef("jiho.lim@naver.com", "임지호"),
            new DonorDef("yeeun.han@daum.net", "한예은"),
            new DonorDef("siwoo.oh@gmail.com", "오시우")
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
        for (DonorDef donor : DONORS) {
            if (userRepository.existsByEmail(donor.email())) continue;
            userRepository.save(User.createNewUser(
                    donor.email(),
                    passwordEncoder.encode(TEST_PASSWORD),
                    donor.name(),
                    donorRole
            ));
            created++;
        }
        log.info("[DonorUserSeeder] 후원자 유저 {}명 신규 시드 (총 {}명 목표)", created, DONOR_COUNT);
    }
}
