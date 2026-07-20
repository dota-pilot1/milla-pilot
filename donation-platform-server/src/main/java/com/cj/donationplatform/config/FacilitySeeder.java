package com.cj.donationplatform.config;

import com.cj.donationplatform.donation_item.domain.DonationItem;
import com.cj.donationplatform.donation_item.domain.ItemCategory;
import com.cj.donationplatform.donation_item.domain.ItemStatus;
import com.cj.donationplatform.donation_item.infrastructure.DonationItemRepository;
import com.cj.donationplatform.facility.domain.Facility;
import com.cj.donationplatform.facility.domain.FacilityStatus;
import com.cj.donationplatform.facility.domain.FacilityType;
import com.cj.donationplatform.facility.infrastructure.FacilityRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/**
 * 후원하기 페이지용 샘플 시설·물품 시드 (개발/데모).
 * 시설은 code 기준 멱등. 물품은 해당 시설에 물품이 하나도 없을 때만 생성.
 */
@Slf4j
@Component
@Order(5)
@RequiredArgsConstructor
public class FacilitySeeder implements ApplicationRunner {

    private final FacilityRepository facilityRepository;
    private final DonationItemRepository donationItemRepository;

    private record ItemDef(
            String name, ItemCategory category, String note, String reason, String emoji,
            long goalAmount, long raisedAmount, Integer targetQuantity, ItemStatus status,
            LocalDate deadline, int displayOrder
    ) {}

    private record FacilityDef(
            String code, String name, String region, FacilityType type, String description,
            FacilityStatus status, boolean verified, String avatarInitial, int displayOrder,
            List<ItemDef> items
    ) {}

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        LocalDate today = LocalDate.now();

        List<FacilityDef> defs = List.of(
                new FacilityDef("haetsal", "햇살아동양육시설", "서울 성북구", FacilityType.ORPHANAGE,
                        "보호아동 32명이 생활하는 시설입니다. 이번 달 생활·학습 준비물 4종을 함께 채워요.",
                        FacilityStatus.RECRUITING, true, "햇", 0, List.of(
                        new ItemDef("초등 학습 문제집 세트", ItemCategory.LEARNING, "6종 · 30권",
                                "학기 중 방과후 자습에 쓸 과목별 문제집이 부족합니다. 아동 1인당 최소 1권씩 돌아가도록 30권을 채우려 합니다.",
                                "📚", 600000, 420000, 30, ItemStatus.RECRUITING, today.plusDays(12), 0),
                        new ItemDef("겨울 내복·양말 세트", ItemCategory.LIVING, "아동 32명분",
                                "겨울철 실내 난방 절약을 위해 내복이 꼭 필요합니다. 32명 전원분을 한 번에 준비합니다.",
                                "🧦", 700000, 680000, 32, ItemStatus.RECRUITING, today.plusDays(3), 1),
                        new ItemDef("위생용품 키트", ItemCategory.HYGIENE, "칫솔·치약·바디워시",
                                "매월 소모되는 개인 위생용품을 아동별 키트로 정기 보충합니다.",
                                "🪥", 500000, 140000, 32, ItemStatus.RECRUITING, today.plusDays(20), 2),
                        new ItemDef("미술활동 재료", ItemCategory.LEARNING, "학기 방과후용",
                                "방과후 미술 프로그램 재료입니다. 목표가 달성되어 곧 통합구매로 넘어갑니다.",
                                "🎨", 300000, 300000, 1, ItemStatus.LOCKED, null, 3)
                )),
                new FacilityDef("pureunsup", "푸른숲 지역아동센터", "경기 고양시", FacilityType.CHILD_CENTER,
                        "방과후 돌봄 아동 24명. 이번 목표는 달성되어 현재 통합구매를 진행 중입니다.",
                        FacilityStatus.BUYING, true, "푸", 1, List.of(
                        new ItemDef("코딩교육 노트북 (중고)", ItemCategory.LEARNING, "3대",
                                "코딩 방과후 수업용 중고 노트북 3대. 목표 달성 후 위임 구매자가 통합구매를 진행 중입니다.",
                                "💻", 600000, 600000, 3, ItemStatus.BUYING, null, 0),
                        new ItemDef("도서관 신간 도서", ItemCategory.LEARNING, "40권",
                                "센터 작은 도서관의 신간 보충입니다. 아동 추천 도서 위주로 40권을 채웁니다.",
                                "📖", 300000, 290000, 40, ItemStatus.RECRUITING, today.plusDays(5), 1)
                )),
                new FacilityDef("onmaeul", "온마을 그룹홈", "인천 남동구", FacilityType.ORPHANAGE,
                        "소규모 그룹홈. 지난 목표 품목이 판매처에서 시설로 배송 중이며 수령확인을 기다리고 있어요.",
                        FacilityStatus.SHIPPING, true, "온", 2, List.of(
                        new ItemDef("이층침대 매트리스", ItemCategory.LIVING, "4개",
                                "낡은 매트리스 교체분 4개. 목표 달성 후 판매처에서 시설로 직배송 중입니다.",
                                "🛏️", 450000, 450000, 4, ItemStatus.SHIPPING, null, 0),
                        new ItemDef("주식·부식 식자재", ItemCategory.LIVING, "1개월분",
                                "한 달치 주·부식 식자재를 시설 식단표에 맞춰 준비합니다.",
                                "🍚", 800000, 0, 1, ItemStatus.RECRUITING, today.plusDays(25), 1)
                )),
                new FacilityDef("saessak", "새싹키움 지역아동센터", "서울 은평구", FacilityType.CHILD_CENTER,
                        "저학년 돌봄 위주 센터입니다. 겨울 실내활동 준비물을 모으고 있어요.",
                        FacilityStatus.RECRUITING, true, "새", 3, List.of(
                        new ItemDef("보드게임·교구 세트", ItemCategory.LEARNING, "10종",
                                "실내 놀이·교육을 겸한 보드게임 교구 10종을 채웁니다.",
                                "🧩", 400000, 120000, 10, ItemStatus.RECRUITING, today.plusDays(15), 0),
                        new ItemDef("실내 방한 담요", ItemCategory.LIVING, "24장",
                                "난방비 절감을 위한 개인 담요 24장. 목표 달성이 임박했습니다.",
                                "🧥", 350000, 320000, 24, ItemStatus.RECRUITING, today.plusDays(4), 1),
                        new ItemDef("학용품 종합 세트", ItemCategory.LEARNING, "24명분",
                                "신학기 개인 학용품 세트를 아동 24명 전원분으로 준비합니다.",
                                "✏️", 400000, 0, 24, ItemStatus.RECRUITING, today.plusDays(18), 2)
                )),
                // 결제 검증 전용 — 실연동 전환 시 소액으로 전체 흐름을 확인하기 위한 시설.
                // 목표액을 100원 단위로 두어 실제 돈이 나가는 검증을 반복할 수 있게 한다.
                // 운영 공개 시에는 displayOrder 를 뒤로 두거나 이 시설을 제외한다.
                new FacilityDef("verify", "[검증] 결제 테스트", "-", FacilityType.CHILD_CENTER,
                        "실결제 검증용 시설입니다. 후원자에게 노출하지 않습니다.",
                        FacilityStatus.RECRUITING, false, "검", 99, List.of(
                        new ItemDef("결제 검증용 A", ItemCategory.LEARNING, "소액 검증",
                                "실결제 전환 후 결제 → 확정 → 웹훅 → 목표 반영을 확인하기 위한 항목입니다.",
                                "🧪", 1000, 0, 1, ItemStatus.RECRUITING, today.plusDays(365), 0),
                        new ItemDef("결제 검증용 B", ItemCategory.LEARNING, "소액 검증",
                                "목표 달성(LOCKED) 전이를 확인하기 위한 항목입니다.",
                                "🧪", 500, 0, 1, ItemStatus.RECRUITING, today.plusDays(365), 1)
                ))
        );

        for (FacilityDef def : defs) {
            Facility facility = facilityRepository.findByCode(def.code())
                    .orElseGet(() -> facilityRepository.save(Facility.create(
                            def.code(), def.name(), def.region(), def.type(), def.description(),
                            def.status(), def.verified(), def.avatarInitial(), def.displayOrder()
                    )));

            if (!donationItemRepository.existsByFacility_Id(facility.getId())) {
                for (ItemDef it : def.items()) {
                    // 진행 상태는 0/RECRUITING 에서 시작 — raisedAmount 는 실제 Contribution 으로만 쌓인다.
                    // (ItemDef 의 raisedAmount/status 는 참고용, 실제 시드값 아님)
                    donationItemRepository.save(DonationItem.create(
                            facility, it.name(), it.category(), it.note(), it.reason(), it.emoji(),
                            it.goalAmount(), 0L, it.targetQuantity(),
                            ItemStatus.RECRUITING, it.deadline(), it.displayOrder()
                    ));
                }
            }
        }

        log.info("[FacilitySeeder] 시설 {}개 시드 완료", defs.size());
    }
}
