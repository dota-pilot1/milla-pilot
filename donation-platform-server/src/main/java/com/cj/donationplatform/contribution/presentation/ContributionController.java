package com.cj.donationplatform.contribution.presentation;

import com.cj.donationplatform.auth.security.UserPrincipal;
import com.cj.donationplatform.contribution.application.ContributionService;
import com.cj.donationplatform.contribution.presentation.dto.AdminContributionResponse;
import com.cj.donationplatform.contribution.presentation.dto.AdminLedgerResponse;
import com.cj.donationplatform.contribution.presentation.dto.ContributionResponse;
import com.cj.donationplatform.contribution.presentation.dto.CreateContributionRequest;
import com.cj.donationplatform.contribution.presentation.dto.MyContributionResponse;
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

    @PostMapping
    @Operation(summary = "후원 참여 기록 (MVP: 결제 없이 기록)")
    public ResponseEntity<ContributionResponse> create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateContributionRequest req
    ) {
        ContributionResponse created = ContributionResponse.from(
                contributionService.create(principal.getId(), req.donationItemId(), req.amount()));
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/me")
    @Operation(summary = "내 후원 내역 조회")
    public List<MyContributionResponse> mine(@AuthenticationPrincipal UserPrincipal principal) {
        return contributionService.findMine(principal.getId()).stream()
                .map(MyContributionResponse::from)
                .toList();
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
