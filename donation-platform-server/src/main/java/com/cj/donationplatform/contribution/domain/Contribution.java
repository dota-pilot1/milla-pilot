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

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    public static Contribution create(DonationItem donationItem, User donor, long amount) {
        Contribution c = new Contribution();
        c.donationItem = donationItem;
        c.donor = donor;
        c.amount = amount;
        c.status = ContributionStatus.RECORDED;
        return c;
    }
}
