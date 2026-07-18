package com.cj.donationplatform.contribution.infrastructure;

import com.cj.donationplatform.contribution.domain.Contribution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ContributionRepository extends JpaRepository<Contribution, Long> {

    @Query("""
            select c from Contribution c
            join fetch c.donationItem di
            join fetch di.facility
            where c.donor.id = :donorId
            order by c.createdAt desc
            """)
    List<Contribution> findMineWithItemAndFacility(@Param("donorId") Long donorId);

    /** 물품별 기부 원장 — 후원자 정보 포함 (관리자용) */
    @Query("""
            select c from Contribution c
            join fetch c.donor
            where c.donationItem.id = :itemId
            order by c.createdAt desc
            """)
    List<Contribution> findByItemWithDonor(@Param("itemId") Long itemId);

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
