package com.cj.donationplatform.donation_item.presentation;

import com.cj.donationplatform.donation_item.application.DonationItemService;
import com.cj.donationplatform.donation_item.presentation.dto.CreateDonationItemRequest;
import com.cj.donationplatform.donation_item.presentation.dto.DonationItemResponse;
import com.cj.donationplatform.donation_item.presentation.dto.UpdateDonationItemRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/donation-items")
@RequiredArgsConstructor
@Tag(name = "DonationItem", description = "후원 물품 CRUD (관리)")
public class DonationItemController {

    private final DonationItemService donationItemService;

    @GetMapping("/{id}")
    @Operation(summary = "후원 물품 상세 조회")
    public DonationItemResponse get(@PathVariable Long id) {
        return DonationItemResponse.from(donationItemService.getById(id));
    }

    @PostMapping
    @Operation(summary = "후원 물품 등록 (facilityId 필요)")
    public ResponseEntity<DonationItemResponse> create(@Valid @RequestBody CreateDonationItemRequest req) {
        DonationItemResponse created = DonationItemResponse.from(donationItemService.create(req));
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PatchMapping("/{id}")
    @Operation(summary = "후원 물품 수정")
    public DonationItemResponse update(@PathVariable Long id, @Valid @RequestBody UpdateDonationItemRequest req) {
        return DonationItemResponse.from(donationItemService.update(id, req));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "후원 물품 삭제")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        donationItemService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
