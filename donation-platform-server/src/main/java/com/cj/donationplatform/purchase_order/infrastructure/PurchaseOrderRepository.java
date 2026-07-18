package com.cj.donationplatform.purchase_order.infrastructure;

import com.cj.donationplatform.purchase_order.domain.PurchaseOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {

    Optional<PurchaseOrder> findByDonationItem_Id(Long itemId);

    boolean existsByDonationItem_Id(Long itemId);

    /** 전체 통합구매 — 물품·시설 포함, 최신순 (관리자) */
    @Query("""
            select po from PurchaseOrder po
            join fetch po.donationItem di
            join fetch di.facility
            order by po.createdAt desc
            """)
    List<PurchaseOrder> findAllWithItemAndFacility();
}
