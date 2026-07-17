package com.cj.donationplatform.facility.presentation;

import com.cj.donationplatform.donation_item.application.DonationItemService;
import com.cj.donationplatform.donation_item.presentation.dto.DonationItemResponse;
import com.cj.donationplatform.facility.application.FacilityService;
import com.cj.donationplatform.facility.presentation.dto.CreateFacilityRequest;
import com.cj.donationplatform.facility.presentation.dto.FacilityResponse;
import com.cj.donationplatform.facility.presentation.dto.UpdateFacilityRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/facilities")
@RequiredArgsConstructor
@Tag(name = "Facility", description = "시설물 CRUD · 후원 물품 조회 (GET 공개 / 변경 인증)")
public class FacilityController {

    private final FacilityService facilityService;
    private final DonationItemService donationItemService;

    @GetMapping
    @Operation(summary = "시설물 목록 조회 (공개)")
    public List<FacilityResponse> list() {
        return facilityService.findAll().stream().map(FacilityResponse::from).toList();
    }

    @GetMapping("/{id}")
    @Operation(summary = "시설물 상세 조회 (공개)")
    public FacilityResponse get(@PathVariable Long id) {
        return FacilityResponse.from(facilityService.getById(id));
    }

    @GetMapping("/{id}/items")
    @Operation(summary = "특정 시설의 후원 물품 목록 (공개)")
    public List<DonationItemResponse> items(@PathVariable Long id) {
        return donationItemService.findByFacility(id).stream()
                .map(DonationItemResponse::from)
                .toList();
    }

    @PostMapping
    @Operation(summary = "시설물 등록 (관리)")
    public ResponseEntity<FacilityResponse> create(@Valid @RequestBody CreateFacilityRequest req) {
        FacilityResponse created = FacilityResponse.from(facilityService.create(req));
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PatchMapping("/{id}")
    @Operation(summary = "시설물 수정 (관리)")
    public FacilityResponse update(@PathVariable Long id, @Valid @RequestBody UpdateFacilityRequest req) {
        return FacilityResponse.from(facilityService.update(id, req));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "시설물 삭제 (소속 물품 함께 삭제, 관리)")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        facilityService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
