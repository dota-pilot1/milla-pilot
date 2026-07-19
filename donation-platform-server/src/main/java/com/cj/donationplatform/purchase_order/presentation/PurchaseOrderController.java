package com.cj.donationplatform.purchase_order.presentation;

import com.cj.donationplatform.purchase_order.application.PurchaseOrderService;
import com.cj.donationplatform.purchase_order.presentation.dto.AdminPurchaseOrderResponse;
import com.cj.donationplatform.purchase_order.presentation.dto.CreatePurchaseOrderRequest;
import com.cj.donationplatform.purchase_order.presentation.dto.PendingPurchaseItemResponse;
import com.cj.donationplatform.purchase_order.presentation.dto.PublicPurchaseMonitoringResponse;
import com.cj.donationplatform.purchase_order.presentation.dto.PublicPurchaseOrderResponse;
import com.cj.donationplatform.purchase_order.presentation.dto.PurchaseOrderResponse;
import com.cj.donationplatform.purchase_order.presentation.dto.RegisterShipmentRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "PurchaseOrder", description = "통합 구매 — 실행/조회 (실행은 관리자)")
public class PurchaseOrderController {

    private final PurchaseOrderService purchaseOrderService;

    @PostMapping("/donation-items/{itemId}/purchase-order")
    @Operation(summary = "통합구매 실행 (목표달성 물품, 관리자)")
    public ResponseEntity<PurchaseOrderResponse> create(
            @PathVariable Long itemId,
            @Valid @RequestBody CreatePurchaseOrderRequest req
    ) {
        PurchaseOrderResponse created = PurchaseOrderResponse.from(
                purchaseOrderService.create(itemId, req));
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/donation-items/{itemId}/purchase-order")
    @Operation(summary = "물품의 통합구매 조회 (공개 — 없으면 204)")
    public ResponseEntity<PurchaseOrderResponse> byItem(@PathVariable Long itemId) {
        return purchaseOrderService.findByItem(itemId)
                .map(PurchaseOrderResponse::from)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

    @PatchMapping("/purchase-orders/{id}")
    @Operation(summary = "통합구매 수정 (관리자)")
    public PurchaseOrderResponse update(
            @PathVariable Long id,
            @Valid @RequestBody CreatePurchaseOrderRequest req
    ) {
        return PurchaseOrderResponse.from(purchaseOrderService.update(id, req));
    }

    @GetMapping("/purchase-orders")
    @Operation(summary = "전체 통합구매 목록 (관리자)")
    public List<AdminPurchaseOrderResponse> all() {
        return purchaseOrderService.findAll().stream()
                .map(AdminPurchaseOrderResponse::from)
                .toList();
    }

    @GetMapping("/public/purchase-orders")
    @Operation(summary = "공개 통합구매·배송 현황")
    public List<PublicPurchaseOrderResponse> publicAll() {
        return purchaseOrderService.findAll().stream()
                .map(PublicPurchaseOrderResponse::from)
                .toList();
    }

    @GetMapping("/public/purchase-monitoring")
    @Operation(summary = "공개 통합구매·배송 모니터링 — 대기/구매/배송/수령")
    public List<PublicPurchaseMonitoringResponse> publicMonitoring() {
        return purchaseOrderService.findPublicMonitoring();
    }

    @GetMapping("/purchase-orders/pending")
    @Operation(summary = "통합구매 대기 물품(목표달성) 목록 (관리자)")
    public List<PendingPurchaseItemResponse> pending() {
        return purchaseOrderService.findPending().stream()
                .map(PendingPurchaseItemResponse::from)
                .toList();
    }

    @PatchMapping("/purchase-orders/{id}/shipment")
    @Operation(summary = "송장 등록 — 택배사·운송장번호 1회 (관리자, step6)")
    public PurchaseOrderResponse registerShipment(
            @PathVariable Long id,
            @Valid @RequestBody RegisterShipmentRequest req
    ) {
        return PurchaseOrderResponse.from(
                purchaseOrderService.registerShipment(id, req.courier().trim(), req.trackingNo().trim(),
                        req.shipmentImageUrl(), req.expectedDeliveryAt()));
    }

    @PostMapping("/donation-items/{itemId}/receive")
    @Operation(summary = "시설 수령확인 — 사람 1클릭 (관리자, step6 §8)")
    public ResponseEntity<Void> confirmReceived(@PathVariable Long itemId) {
        purchaseOrderService.confirmReceived(itemId);
        return ResponseEntity.ok().build();
    }
}
