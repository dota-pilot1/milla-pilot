package com.cj.donationplatform.contribution.domain;

/**
 * 후원 참여 상태.
 * RECORDED - 사전등록 기록 (MVP·가상 리허설: 실제 결제 없이 참여를 기록만).
 * (차기: PAID 실결제, REFUNDED 환불 — 전문가 검토 관문 통과 후 확장)
 */
public enum ContributionStatus {
    RECORDED
}
