package com.cj.donationplatform.config;

import com.cj.donationplatform.contribution.application.ContributionService;
import com.cj.donationplatform.contribution.infrastructure.ContributionRepository;
import com.cj.donationplatform.donation_item.domain.DonationItem;
import com.cj.donationplatform.donation_item.infrastructure.DonationItemRepository;
import com.cj.donationplatform.facility.domain.Facility;
import com.cj.donationplatform.facility.infrastructure.FacilityRepository;
import com.cj.donationplatform.user.domain.User;
import com.cj.donationplatform.user.infrastructure.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 시연용 후원 데이터. 첫 실행(후원 0건)에만 동작한다.
 * 1) 기존 물품의 하드코딩 진행값을 0/RECRUITING 으로 리셋(정합성 정리)
 * 2) 후원자 유저로 몇 건의 실제 Contribution 을 만들어 raisedAmount 를 실데이터로 채움
 * 이미 후원 데이터가 있으면(테스트 시작 후) 절대 건드리지 않는다.
 */
@Slf4j
@Component
@Order(7)
@RequiredArgsConstructor
public class ContributionSeeder implements ApplicationRunner {

    private final ContributionRepository contributionRepository;
    private final DonationItemRepository donationItemRepository;
    private final FacilityRepository facilityRepository;
    private final UserRepository userRepository;
    private final ContributionService contributionService;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (contributionRepository.count() > 0) {
            return; // 이미 후원 데이터 존재 → 리셋/시드 안 함
        }

        // 1) 스테일 진행값 정리
        donationItemRepository.findAll().forEach(DonationItem::resetProgress);
        donationItemRepository.flush();

        // 2) 시연용 후원 (haetsal 시설 물품에)
        Facility haetsal = facilityRepository.findByCode("haetsal").orElse(null);
        User d1 = userRepository.findByEmail(DonorUserSeeder.DEMO_DONOR_1).orElse(null);
        User d2 = userRepository.findByEmail(DonorUserSeeder.DEMO_DONOR_2).orElse(null);
        User d3 = userRepository.findByEmail(DonorUserSeeder.DEMO_DONOR_3).orElse(null);
        if (haetsal == null || d1 == null || d2 == null || d3 == null) {
            log.warn("[ContributionSeeder] 시연 대상(시설/후원자) 부족 — 리셋만 수행");
            return;
        }

        List<DonationItem> items =
                donationItemRepository.findByFacility_IdOrderByDisplayOrderAscIdAsc(haetsal.getId());
        if (items.size() >= 2) {
            // 물품0(초등 학습 문제집, 목표 60만): 42만 → 70% 진행중
            contributionService.create(d1.getId(), items.get(0).getId(), 300_000);
            contributionService.create(d2.getId(), items.get(0).getId(), 120_000);
            // 물품1(겨울 내복, 목표 70만): 70만 → 목표달성(자동 잠금)
            contributionService.create(d3.getId(), items.get(1).getId(), 700_000);
        }

        log.info("[ContributionSeeder] 시연용 후원 시드 완료 (haetsal 물품 2종)");
    }
}
