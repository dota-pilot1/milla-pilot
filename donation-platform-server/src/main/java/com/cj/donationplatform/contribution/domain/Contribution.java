package com.cj.donationplatform.contribution.domain;

import com.cj.donationplatform.donation_item.domain.DonationItem;
import com.cj.donationplatform.user.domain.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

/**
 * 후원 참여 기록 (기부 원장, F-014).
 * 후원자별로 어떤 물품에 얼마를 참여했는지 식별·기록한다. 물품 raisedAmount = Σ Contribution.
 */
@Entity
@Table(name = "contributions")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Contribution {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "donation_item_id", nullable = false)
    private DonationItem donationItem;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "donor_id", nullable = false)
    private User donor;

    @Column(nullable = false)
    private Long amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ContributionStatus status;

    /**
     * 포트원 결제 식별자 (우리가 생성해 결제창에 넘기는 값).
     * UNIQUE — 같은 결제 통보가 두 번 와도 한 번만 반영되도록 하는 멱등성 키.
     */
    @Column(length = 80, unique = true)
    private String paymentId;

    /** 결제대행사 (예: kakaopay) — 포트원 조회 응답에서 채운다 */
    @Column(length = 40)
    private String pgProvider;

    /** 결제 수단 표시용 (예: EASY_PAY) */
    @Column(length = 40)
    private String payMethod;

    private Instant paidAt;

    /** PENDING 만료 시각 — 이 시각까지 결제되지 않으면 선점 해제 */
    private Instant expiresAt;

    /** 포트원 영수증 URL */
    @Column(length = 500)
    private String receiptUrl;

    /** 실패·취소 사유 (운영 확인용) */
    @Column(length = 300)
    private String failReason;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    /**
     * 사전등록 기록 (결제 없이 기록만) — 시더·레거시 전용.
     * 신규 후원은 {@link #pending} 을 사용한다.
     */
    public static Contribution create(DonationItem donationItem, User donor, long amount) {
        Contribution c = new Contribution();
        c.donationItem = donationItem;
        c.donor = donor;
        c.amount = amount;
        c.status = ContributionStatus.RECORDED;
        return c;
    }

    /** 결제 대기 생성 — 결제창을 띄우기 직전. 만료 전까지 잔여 금액을 선점한다. */
    public static Contribution pending(DonationItem donationItem, User donor, long amount,
                                       String paymentId, Instant expiresAt) {
        Contribution c = new Contribution();
        c.donationItem = donationItem;
        c.donor = donor;
        c.amount = amount;
        c.status = ContributionStatus.PENDING;
        c.paymentId = paymentId;
        c.expiresAt = expiresAt;
        return c;
    }

    /** 결제 확정 — 포트원 조회로 금액이 대조된 뒤에만 호출한다. */
    public void markPaid(String pgProvider, String payMethod, String receiptUrl, Instant paidAt) {
        this.status = ContributionStatus.PAID;
        this.pgProvider = pgProvider;
        this.payMethod = payMethod;
        this.receiptUrl = receiptUrl;
        this.paidAt = paidAt != null ? paidAt : Instant.now();
        this.expiresAt = null;
    }

    public void markFailed(String reason) {
        this.status = ContributionStatus.FAILED;
        this.failReason = truncate(reason);
        this.expiresAt = null;
    }

    public void markCanceled(String reason) {
        this.status = ContributionStatus.CANCELED;
        this.failReason = truncate(reason);
        this.expiresAt = null;
    }

    public void markExpired() {
        this.status = ContributionStatus.EXPIRED;
        this.failReason = "결제 시간 만료";
        this.expiresAt = null;
    }

    public void markRefunded(String reason) {
        this.status = ContributionStatus.REFUNDED;
        this.failReason = truncate(reason);
    }

    public boolean isPending() {
        return status == ContributionStatus.PENDING;
    }

    public boolean isPaid() {
        return status == ContributionStatus.PAID;
    }

    private static String truncate(String s) {
        if (s == null) return null;
        return s.length() <= 300 ? s : s.substring(0, 300);
    }
}
