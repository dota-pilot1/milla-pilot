package com.cj.donationplatform.donation_item.domain;

/**
 * 후원 물품 상태.
 * RECRUITING - 모집중
 * LOCKED     - 목표 달성(결제 잠금)
 * BUYING     - 통합구매 진행
 * SHIPPING   - 배송 중
 */
public enum ItemStatus {
    RECRUITING,
    LOCKED,
    BUYING,
    SHIPPING
}
