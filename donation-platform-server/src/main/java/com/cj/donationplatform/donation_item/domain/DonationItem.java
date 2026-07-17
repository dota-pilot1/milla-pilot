package com.cj.donationplatform.donation_item.domain;

import com.cj.donationplatform.facility.domain.Facility;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "donation_items")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class DonationItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "facility_id", nullable = false)
    private Facility facility;

    @Column(nullable = false, length = 150)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ItemCategory category;

    /** 수량 메모 (예: 6종·30권) */
    @Column(length = 150)
    private String note;

    /** 필요한 이유 (물품 상세용) */
    @Column(length = 1000)
    private String reason;

    @Column(length = 10)
    private String emoji;

    /** 목표금액(원) — 실제 구매 총액 기준 */
    @Column(nullable = false)
    private Long goalAmount;

    /** 모인금액 — 이번 스텝은 표시용, 차기 Σ Contribution 으로 대체 */
    @Column(nullable = false)
    private Long raisedAmount = 0L;

    private Integer targetQuantity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ItemStatus status;

    private LocalDate deadline;

    @Column(nullable = false)
    private int displayOrder = 0;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private Instant updatedAt;

    public static DonationItem create(
            Facility facility, String name, ItemCategory category, String note, String reason,
            String emoji, Long goalAmount, Long raisedAmount, Integer targetQuantity,
            ItemStatus status, LocalDate deadline, int displayOrder
    ) {
        DonationItem it = new DonationItem();
        it.facility = facility;
        it.name = name;
        it.category = category;
        it.note = note;
        it.reason = reason;
        it.emoji = emoji;
        it.goalAmount = goalAmount;
        it.raisedAmount = raisedAmount != null ? raisedAmount : 0L;
        it.targetQuantity = targetQuantity;
        it.status = status;
        it.deadline = deadline;
        it.displayOrder = displayOrder;
        return it;
    }

    public void update(
            String name, ItemCategory category, String note, String reason, String emoji,
            Long goalAmount, Long raisedAmount, Integer targetQuantity,
            ItemStatus status, LocalDate deadline, int displayOrder
    ) {
        this.name = name;
        this.category = category;
        this.note = note;
        this.reason = reason;
        this.emoji = emoji;
        this.goalAmount = goalAmount;
        this.raisedAmount = raisedAmount != null ? raisedAmount : 0L;
        this.targetQuantity = targetQuantity;
        this.status = status;
        this.deadline = deadline;
        this.displayOrder = displayOrder;
    }
}
