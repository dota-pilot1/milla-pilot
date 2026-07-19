package com.cj.donationplatform.purchase_order.application;

import com.cj.donationplatform.common.exception.BusinessException;
import com.cj.donationplatform.common.exception.ErrorCode;
import com.cj.donationplatform.donation_item.domain.DonationItem;
import com.cj.donationplatform.donation_item.domain.ItemStatus;
import com.cj.donationplatform.donation_item.infrastructure.DonationItemRepository;
import com.cj.donationplatform.purchase_order.domain.PurchaseOrder;
import com.cj.donationplatform.purchase_order.infrastructure.PurchaseOrderRepository;
import com.cj.donationplatform.purchase_order.presentation.dto.CreatePurchaseOrderRequest;
import com.cj.donationplatform.purchase_order.presentation.dto.PublicPurchaseMonitoringResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class PurchaseOrderService {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final DonationItemRepository donationItemRepository;

    /**
     * 통합구매 실행 — 목표달성(LOCKED) 물품을 한 번만.
     * 물품 행 락(step3 재사용) + UNIQUE 로 중복구매 0(§15). 성공 시 item.status = BUYING.
     */
    @Transactional
    public PurchaseOrder create(Long itemId, CreatePurchaseOrderRequest req) {
        DonationItem item = donationItemRepository.findByIdForUpdate(itemId)
                .orElseThrow(() -> new BusinessException(ErrorCode.DONATION_ITEM_NOT_FOUND));

        if (item.getStatus() != ItemStatus.LOCKED) {
            throw new BusinessException(ErrorCode.PURCHASE_NOT_ALLOWED);
        }
        if (purchaseOrderRepository.existsByDonationItem_Id(itemId)) {
            throw new BusinessException(ErrorCode.PURCHASE_ALREADY_DONE);
        }

        Instant orderedAt = req.orderedAt() != null ? req.orderedAt() : Instant.now();
        PurchaseOrder saved = purchaseOrderRepository.save(PurchaseOrder.create(
                item, req.vendor(), req.vendorUrl(), req.purchasedAmount(),
                req.quantity(), req.evidenceNo(), req.evidenceFileUrl(), req.note(), orderedAt));

        // 구매 시점에 송장번호가 있으면 바로 배송중으로. 없으면 구매 진행(BUYING) — 이후 별도 '송장 등록'.
        if (req.trackingNo() != null && !req.trackingNo().isBlank()) {
            saved.registerShipment(req.courier(), req.trackingNo(),
                    req.shipmentImageUrl(), req.expectedDeliveryAt(), Instant.now());
            item.markShipping();
        } else {
            item.markBuying();
        }
        return saved;
    }

    @Transactional
    public PurchaseOrder update(Long id, CreatePurchaseOrderRequest req) {
        PurchaseOrder po = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.PURCHASE_ORDER_NOT_FOUND));
        Instant orderedAt = req.orderedAt() != null ? req.orderedAt() : po.getOrderedAt();
        po.update(req.vendor(), req.vendorUrl(), req.purchasedAmount(), req.quantity(),
                req.evidenceNo(), req.evidenceFileUrl(), req.note(), orderedAt);
        return po;
    }

    @Transactional(readOnly = true)
    public Optional<PurchaseOrder> findByItem(Long itemId) {
        return purchaseOrderRepository.findByDonationItem_Id(itemId);
    }

    @Transactional(readOnly = true)
    public List<PurchaseOrder> findAll() {
        return purchaseOrderRepository.findAllWithItemAndFacility();
    }

    @Transactional(readOnly = true)
    public List<PublicPurchaseMonitoringResponse> findPublicMonitoring() {
        List<PublicPurchaseMonitoringResponse> pending = donationItemRepository
                .findByStatusWithFacility(ItemStatus.LOCKED)
                .stream()
                .map(PublicPurchaseMonitoringResponse::pending)
                .toList();
        List<PublicPurchaseMonitoringResponse> ordered = purchaseOrderRepository
                .findAllWithItemAndFacility()
                .stream()
                .map(PublicPurchaseMonitoringResponse::from)
                .toList();

        return Stream.concat(pending.stream(), ordered.stream())
                .sorted(Comparator
                        .comparing(PublicPurchaseMonitoringResponse::orderedAt,
                                Comparator.nullsFirst(Comparator.reverseOrder()))
                        .thenComparing(PublicPurchaseMonitoringResponse::itemId))
                .toList();
    }

    /** 통합구매 대기 물품 — 목표달성(LOCKED). 구매되면 BUYING 으로 빠지므로 자동 제외. */
    @Transactional(readOnly = true)
    public List<DonationItem> findPending() {
        return donationItemRepository.findByStatusWithFacility(ItemStatus.LOCKED);
    }

    /**
     * 송장 등록(step6 Phase1) — 택배사·운송장번호 1회. 성공 시 item.status = SHIPPING.
     * 구매(BUYING) 이후에만 허용. 배송 단계 자동화(Phase2)는 별도.
     */
    @Transactional
    public PurchaseOrder registerShipment(Long id, String courier, String trackingNo,
                                          String shipmentImageUrl, java.time.LocalDate expectedDeliveryAt) {
        PurchaseOrder po = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.PURCHASE_ORDER_NOT_FOUND));
        DonationItem item = po.getDonationItem();
        if (item.getStatus() != ItemStatus.BUYING && item.getStatus() != ItemStatus.SHIPPING) {
            throw new BusinessException(ErrorCode.SHIPMENT_NOT_ALLOWED);
        }
        po.registerShipment(courier, trackingNo, shipmentImageUrl, expectedDeliveryAt, Instant.now());
        item.markShipping();
        return po;
    }

    /**
     * 시설 수령확인(step6 §8) — 사람 1클릭. 배송완료 ≠ 수령확인.
     * 배송중(SHIPPING) 이후에만 허용. 성공 시 item.status = RECEIVED.
     */
    @Transactional
    public DonationItem confirmReceived(Long itemId) {
        DonationItem item = donationItemRepository.findByIdForUpdate(itemId)
                .orElseThrow(() -> new BusinessException(ErrorCode.DONATION_ITEM_NOT_FOUND));
        if (item.getStatus() != ItemStatus.SHIPPING) {
            throw new BusinessException(ErrorCode.RECEIVE_NOT_ALLOWED);
        }
        item.markReceived();
        return item;
    }
}
