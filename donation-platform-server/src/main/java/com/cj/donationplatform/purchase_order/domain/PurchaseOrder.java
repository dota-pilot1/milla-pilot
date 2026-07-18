package com.cj.donationplatform.purchase_order.domain;

import com.cj.donationplatform.donation_item.domain.DonationItem;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.time.LocalDate;

/**
 * 통합 구매 기록 (F-013 · 한 번의 통합구매).
 * 물품당 1건(donation_item_id UNIQUE) — 중복구매 0(§15).
 * MVP: 실결제 없음. 운영자가 외부 구매 후 결과(판매처·실구매액·증빙)를 기록.
 * 송장·배송추적은 step6에서 확장.
 */
@Entity
@Table(name = "purchase_orders", uniqueConstraints = @UniqueConstraint(columnNames = "donation_item_id"))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PurchaseOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 물품당 1건 — UNIQUE 로 중복구매 원천 차단 */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "donation_item_id", nullable = false, unique = true)
    private DonationItem donationItem;

    @Column(nullable = false, length = 200)
    private String vendor;

    /** 판매처 링크(상품 페이지 등) — 선택 */
    @Column(length = 500)
    private String vendorUrl;

    /** 실제 구매액(목표액과 다를 수 있음) */
    @Column(nullable = false)
    private Long purchasedAmount;

    /** 구매 수량 — 선택 */
    private Integer quantity;

    /** 구매증빙(주문번호·영수증 번호 등). 세액공제 영수증 아님(F-015) */
    @Column(length = 200)
    private String evidenceNo;

    /** 영수증/증빙 파일 URL(S3 업로드) */
    @Column(length = 500)
    private String evidenceFileUrl;

    @Column(length = 500)
    private String note;

    private Instant orderedAt;

    /** 택배사 코드(tracker.delivery carrier id, 예: kr.cjlogistics) — 관리자 1회 입력 (step6) */
    @Column(length = 60)
    private String courier;

    /** 운송장번호 — 관리자 1회 입력. 구매증빙(주문번호)과 구분 (step6) */
    @Column(length = 60)
    private String trackingNo;

    /** 송장 이미지 URL(S3) — 선택 */
    @Column(length = 500)
    private String shipmentImageUrl;

    /** 배송 예정일 — 선택 */
    private LocalDate expectedDeliveryAt;

    private Instant shippedAt;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private Instant updatedAt;

    public static PurchaseOrder create(
            DonationItem donationItem, String vendor, String vendorUrl, long purchasedAmount,
            Integer quantity, String evidenceNo, String evidenceFileUrl, String note, Instant orderedAt
    ) {
        PurchaseOrder po = new PurchaseOrder();
        po.donationItem = donationItem;
        po.vendor = vendor;
        po.vendorUrl = vendorUrl;
        po.purchasedAmount = purchasedAmount;
        po.quantity = quantity;
        po.evidenceNo = evidenceNo;
        po.evidenceFileUrl = evidenceFileUrl;
        po.note = note;
        po.orderedAt = orderedAt;
        return po;
    }

    public void update(String vendor, String vendorUrl, long purchasedAmount, Integer quantity,
                       String evidenceNo, String evidenceFileUrl, String note, Instant orderedAt) {
        this.vendor = vendor;
        this.vendorUrl = vendorUrl;
        this.purchasedAmount = purchasedAmount;
        this.quantity = quantity;
        this.evidenceNo = evidenceNo;
        this.evidenceFileUrl = evidenceFileUrl;
        this.note = note;
        this.orderedAt = orderedAt;
    }

    /** 송장 등록 — 택배사·운송장번호·(선택)송장이미지·배송예정일. 배송 단계 자동화는 이후(Phase2). */
    public void registerShipment(String courier, String trackingNo, String shipmentImageUrl,
                                 LocalDate expectedDeliveryAt, Instant shippedAt) {
        this.courier = courier;
        this.trackingNo = trackingNo;
        this.shipmentImageUrl = shipmentImageUrl;
        this.expectedDeliveryAt = expectedDeliveryAt;
        this.shippedAt = shippedAt;
    }
}
