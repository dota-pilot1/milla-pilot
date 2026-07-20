package com.cj.donationplatform.contribution.presentation;

import com.cj.donationplatform.auth.security.UserPrincipal;
import com.cj.donationplatform.contribution.application.ContributionService;
import com.cj.donationplatform.contribution.presentation.dto.AdminContributionResponse;
import com.cj.donationplatform.contribution.presentation.dto.AdminLedgerResponse;
import com.cj.donationplatform.contribution.presentation.dto.CancelPaymentRequest;
import com.cj.donationplatform.contribution.presentation.dto.ConfirmPaymentRequest;
import com.cj.donationplatform.contribution.presentation.dto.ContributionResponse;
import com.cj.donationplatform.contribution.presentation.dto.CreateContributionRequest;
import com.cj.donationplatform.contribution.presentation.dto.InitiatePaymentResponse;
import com.cj.donationplatform.contribution.presentation.dto.ItemContributionSummaryResponse;
import com.cj.donationplatform.contribution.presentation.dto.MyContributionResponse;
import com.cj.donationplatform.payment.config.PortOneProperties;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contributions")
@RequiredArgsConstructor
@Tag(name = "Contribution", description = "후원 참여(기부 원장) — 로그인 필요")
public class ContributionController {

    private final ContributionService contributionService;
    private final PortOneProperties portOneProperties;

    @PostMapping("/payments/initiate")
    @Operation(summary = "결제 대기 생성 — 결제창을 띄우기 직전 호출. 잔여 금액을 선점한다.")
    public ResponseEntity<InitiatePaymentResponse> initiate(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateContributionRequest req
    ) {
        InitiatePaymentResponse res = InitiatePaymentResponse.of(
                contributionService.initiate(principal.getId(), req.donationItemId(), req.amount()),
                portOneProperties);
        return ResponseEntity.status(HttpStatus.CREATED).body(res);
    }

    @PostMapping("/payments/confirm")
    @Operation(summary = "결제 확정 — 서버가 포트원에 조회해 금액을 대조한 뒤 후원을 확정한다.")
    public ContributionResponse confirm(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ConfirmPaymentRequest req
    ) {
        return ContributionResponse.from(
                contributionService.confirm(principal.getId(), req.paymentId()));
    }

    @PostMapping("/payments/cancel")
    @Operation(summary = "결제 취소·이탈 통보 — 선점을 즉시 해제한다.")
    public ResponseEntity<Void> cancel(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CancelPaymentRequest req
    ) {
        contributionService.cancelPending(principal.getId(), req.paymentId(), req.reason());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    @Operation(summary = "내 후원 내역 조회")
    public List<MyContributionResponse> mine(@AuthenticationPrincipal UserPrincipal principal) {
        return contributionService.findMineDetails(principal.getId()).stream()
                .map(row -> MyContributionResponse.from(row.contribution(), row.purchaseOrder()))
                .toList();
    }

    @GetMapping("/by-item/{itemId}/summary")
    @Operation(summary = "물품별 참여 현황 (공개) — 후원자 수·최근 참여. 이름은 마스킹된다.")
    public ItemContributionSummaryResponse summary(@PathVariable Long itemId) {
        ContributionService.ItemSummary s = contributionService.itemSummary(itemId, 5);
        return ItemContributionSummaryResponse.of(s.donorCount(), s.recent());
    }

    @GetMapping("/by-item/{itemId}")
    @Operation(summary = "물품별 기부 원장 조회 (관리자)")
    public List<AdminContributionResponse> byItem(@PathVariable Long itemId) {
        return contributionService.findByItem(itemId).stream()
                .map(AdminContributionResponse::from)
                .toList();
    }

    @GetMapping
    @Operation(summary = "전체 후원 내역 조회 (관리자)")
    public List<AdminLedgerResponse> all() {
        return contributionService.findAllLedger().stream()
                .map(AdminLedgerResponse::from)
                .toList();
    }
}
