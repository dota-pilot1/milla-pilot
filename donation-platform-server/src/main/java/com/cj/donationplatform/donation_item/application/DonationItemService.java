package com.cj.donationplatform.donation_item.application;

import com.cj.donationplatform.common.exception.BusinessException;
import com.cj.donationplatform.common.exception.ErrorCode;
import com.cj.donationplatform.donation_item.domain.DonationItem;
import com.cj.donationplatform.donation_item.domain.ItemStatus;
import com.cj.donationplatform.donation_item.infrastructure.DonationItemRepository;
import com.cj.donationplatform.donation_item.presentation.dto.CreateDonationItemRequest;
import com.cj.donationplatform.donation_item.presentation.dto.UpdateDonationItemRequest;
import com.cj.donationplatform.facility.domain.Facility;
import com.cj.donationplatform.facility.infrastructure.FacilityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DonationItemService {

    private final DonationItemRepository donationItemRepository;
    private final FacilityRepository facilityRepository;

    @Transactional(readOnly = true)
    public List<DonationItem> findByFacility(Long facilityId) {
        // 시설 존재 검증 후 물품 목록 반환
        if (!facilityRepository.existsById(facilityId)) {
            throw new BusinessException(ErrorCode.FACILITY_NOT_FOUND);
        }
        return donationItemRepository.findByFacility_IdOrderByDisplayOrderAscIdAsc(facilityId);
    }

    @Transactional(readOnly = true)
    public DonationItem getById(Long id) {
        return donationItemRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.DONATION_ITEM_NOT_FOUND));
    }

    @Transactional
    public DonationItem create(CreateDonationItemRequest req) {
        Facility facility = facilityRepository.findById(req.facilityId())
                .orElseThrow(() -> new BusinessException(ErrorCode.FACILITY_NOT_FOUND));
        ItemStatus status = req.status() != null ? req.status() : ItemStatus.RECRUITING;
        return donationItemRepository.save(DonationItem.create(
                facility, req.name(), req.category(), req.note(), req.reason(), req.emoji(),
                req.goalAmount(), req.raisedAmount(), req.targetQuantity(),
                status, req.deadline(), req.displayOrder()
        ));
    }

    @Transactional
    public DonationItem update(Long id, UpdateDonationItemRequest req) {
        DonationItem item = getById(id);
        item.update(
                req.name(), req.category(), req.note(), req.reason(), req.emoji(),
                req.goalAmount(), req.raisedAmount(), req.targetQuantity(),
                req.status(), req.deadline(), req.displayOrder()
        );
        return item;
    }

    @Transactional
    public void delete(Long id) {
        DonationItem item = getById(id);
        donationItemRepository.delete(item);
    }
}
