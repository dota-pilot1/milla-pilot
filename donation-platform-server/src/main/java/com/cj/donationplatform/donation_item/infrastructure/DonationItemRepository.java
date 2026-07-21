package com.cj.donationplatform.donation_item.infrastructure;

import com.cj.donationplatform.donation_item.domain.DonationItem;
import com.cj.donationplatform.donation_item.domain.ItemStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface DonationItemRepository extends JpaRepository<DonationItem, Long> {
    List<DonationItem> findByFacility_IdOrderByDisplayOrderAscIdAsc(Long facilityId);
    boolean existsByFacility_Id(Long facilityId);

    /** 시더가 이미 넣은 물품인지 확인 — 시설 단위가 아니라 물품 단위로 봐야 나중에 물품만 추가할 수 있다 */
    boolean existsByFacility_IdAndName(Long facilityId, String name);
    void deleteByFacility_Id(Long facilityId);

    /**
     * 후원 처리용 — 물품 행에 쓰기 락을 걸어 동시 후원을 직렬화한다.
     * 목표 금액 초과(overshoot) 레이스를 막는다. 반드시 트랜잭션 안에서 호출.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select d from DonationItem d where d.id = :id")
    Optional<DonationItem> findByIdForUpdate(@Param("id") Long id);

    /** 특정 단계 물품 — 시설 포함 (통합구매 대기 큐 등) */
    @Query("""
            select d from DonationItem d
            join fetch d.facility
            where d.status = :status
            order by d.facility.id, d.displayOrder, d.id
            """)
    List<DonationItem> findByStatusWithFacility(@Param("status") ItemStatus status);
}
