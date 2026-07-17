package com.cj.donationplatform.facility.application;

import com.cj.donationplatform.common.exception.BusinessException;
import com.cj.donationplatform.common.exception.ErrorCode;
import com.cj.donationplatform.donation_item.infrastructure.DonationItemRepository;
import com.cj.donationplatform.facility.domain.Facility;
import com.cj.donationplatform.facility.domain.FacilityStatus;
import com.cj.donationplatform.facility.infrastructure.FacilityRepository;
import com.cj.donationplatform.facility.presentation.dto.CreateFacilityRequest;
import com.cj.donationplatform.facility.presentation.dto.UpdateFacilityRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FacilityService {

    private final FacilityRepository facilityRepository;
    private final DonationItemRepository donationItemRepository;

    @Transactional(readOnly = true)
    public List<Facility> findAll() {
        return facilityRepository.findAllByOrderByDisplayOrderAscIdAsc();
    }

    @Transactional(readOnly = true)
    public Facility getById(Long id) {
        return facilityRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.FACILITY_NOT_FOUND));
    }

    @Transactional
    public Facility create(CreateFacilityRequest req) {
        if (facilityRepository.existsByCode(req.code())) {
            throw new BusinessException(ErrorCode.FACILITY_CODE_DUPLICATE);
        }
        FacilityStatus status = req.status() != null ? req.status() : FacilityStatus.RECRUITING;
        return facilityRepository.save(Facility.create(
                req.code(), req.name(), req.region(), req.type(), req.description(),
                status, req.verified(), req.avatarInitial(), req.displayOrder()
        ));
    }

    @Transactional
    public Facility update(Long id, UpdateFacilityRequest req) {
        Facility facility = getById(id);
        facility.update(
                req.name(), req.region(), req.type(), req.description(),
                req.status(), req.verified(), req.avatarInitial(), req.displayOrder()
        );
        return facility;
    }

    @Transactional
    public void delete(Long id) {
        Facility facility = getById(id);
        // 시설 삭제 시 소속 물품도 함께 제거 (ON DELETE CASCADE 대응)
        donationItemRepository.deleteByFacility_Id(id);
        facilityRepository.delete(facility);
    }
}
