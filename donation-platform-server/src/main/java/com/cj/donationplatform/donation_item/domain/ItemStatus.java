package com.cj.donationplatform.donation_item.domain;

/**
 * 후원 물품 상태 (이행 흐름 단계 = 후원자 화면 타임라인의 단계).
 * RECRUITING - 모집중
 * LOCKED     - 목표 달성(결제 잠금)
 * BUYING     - 통합구매 진행
 * SHIPPING   - 배송 중
 * RECEIVED   - 시설 수령확인
 * RECEIPTED  - 영수증 발급
 */
public enum ItemStatus {
    RECRUITING,
    LOCKED,
    BUYING,
    SHIPPING,
    RECEIVED,
    RECEIPTED
}
