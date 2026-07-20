package com.cj.donationplatform.contribution.infrastructure;

import com.cj.donationplatform.contribution.domain.Contribution;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface ContributionRepository extends JpaRepository<Contribution, Long> {

    @Query("""
            select c from Contribution c
            join fetch c.donationItem di
            join fetch di.facility
            where c.donor.id = :donorId
            order by c.createdAt desc
            """)
    List<Contribution> findMineWithItemAndFacility(@Param("donorId") Long donorId);

    /** 물품별 기부 원장 — 후원자 정보 포함 (관리자용). 결제 완료된 건만. */
    @Query("""
            select c from Contribution c
            join fetch c.donor
            where c.donationItem.id = :itemId
              and c.status in (com.cj.donationplatform.contribution.domain.ContributionStatus.RECORDED,
                               com.cj.donationplatform.contribution.domain.ContributionStatus.PAID)
            order by c.createdAt desc
            """)
    List<Contribution> findByItemWithDonor(@Param("itemId") Long itemId);

    Optional<Contribution> findByPaymentId(String paymentId);

    /** 물품별 후원자 수 (중복 제거) — 후원자 화면의 참여 현황용 */
    @Query("""
            select count(distinct c.donor.id) from Contribution c
            where c.donationItem.id = :itemId
              and c.status in (com.cj.donationplatform.contribution.domain.ContributionStatus.RECORDED,
                               com.cj.donationplatform.contribution.domain.ContributionStatus.PAID)
            """)
    long countDonorsByItem(@Param("itemId") Long itemId);

    /** 물품별 최근 후원 — 후원자 이름은 표시 단계에서 마스킹한다 */
    @Query("""
            select c from Contribution c
            join fetch c.donor
            where c.donationItem.id = :itemId
              and c.status in (com.cj.donationplatform.contribution.domain.ContributionStatus.RECORDED,
                               com.cj.donationplatform.contribution.domain.ContributionStatus.PAID)
            order by c.createdAt desc
            """)
    List<Contribution> findRecentByItem(@Param("itemId") Long itemId, Pageable pageable);

    /**
     * 해당 물품에서 아직 결제되지 않았지만 잔여 금액을 선점 중인 합계.
     * 만료 시각이 지난 건은 제외한다(스케줄러가 정리하기 전이라도 즉시 반영되도록).
     */
    @Query("""
            select coalesce(sum(c.amount), 0) from Contribution c
            where c.donationItem.id = :itemId
              and c.status = com.cj.donationplatform.contribution.domain.ContributionStatus.PENDING
              and (c.expiresAt is null or c.expiresAt > :now)
            """)
    long sumHeldAmount(@Param("itemId") Long itemId, @Param("now") Instant now);

    /** 만료된 결제 대기 건 — 스케줄러가 EXPIRED 로 정리 */
    @Query("""
            select c from Contribution c
            where c.status = com.cj.donationplatform.contribution.domain.ContributionStatus.PENDING
              and c.expiresAt is not null
              and c.expiresAt <= :now
            """)
    List<Contribution> findExpiredPending(@Param("now") Instant now);

    /** 전체 후원 내역 — 후원자·물품·시설 포함, 최신순 (관리자 모니터링) */
    @Query("""
            select c from Contribution c
            join fetch c.donor
            join fetch c.donationItem di
            join fetch di.facility
            order by c.createdAt desc
            """)
    List<Contribution> findAllWithDetails();
}
