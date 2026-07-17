package com.cj.donationplatform.donation_item.infrastructure;

import com.cj.donationplatform.donation_item.domain.DonationItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DonationItemRepository extends JpaRepository<DonationItem, Long> {
    List<DonationItem> findByFacility_IdOrderByDisplayOrderAscIdAsc(Long facilityId);
    boolean existsByFacility_Id(Long facilityId);
    void deleteByFacility_Id(Long facilityId);
}
