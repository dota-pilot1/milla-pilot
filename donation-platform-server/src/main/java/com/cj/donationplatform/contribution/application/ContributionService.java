package com.cj.donationplatform.contribution.application;

import com.cj.donationplatform.common.exception.BusinessException;
import com.cj.donationplatform.common.exception.ErrorCode;
import com.cj.donationplatform.contribution.domain.Contribution;
import com.cj.donationplatform.contribution.infrastructure.ContributionRepository;
import com.cj.donationplatform.donation_item.domain.DonationItem;
import com.cj.donationplatform.donation_item.domain.ItemStatus;
import com.cj.donationplatform.donation_item.infrastructure.DonationItemRepository;
import com.cj.donationplatform.user.domain.User;
import com.cj.donationplatform.user.infrastructure.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ContributionService {

    private final ContributionRepository contributionRepository;
    private final DonationItemRepository donationItemRepository;
    private final UserRepository userRepository;

    /**
     * 후원 참여 기록 생성 (MVP: 결제 없이 기록).
     * 물품 raisedAmount 를 올리고, 목표 도달 시 결제 잠금(LOCKED).
     */
    @Transactional
    public Contribution create(Long donorId, Long donationItemId, long amount) {
        if (amount <= 0) {
            throw new BusinessException(ErrorCode.CONTRIBUTION_NOT_ALLOWED);
        }
        // 물품 행에 쓰기 락 → 동시 후원을 직렬화(목표 초과 레이스 방지)
        DonationItem item = donationItemRepository.findByIdForUpdate(donationItemId)
                .orElseThrow(() -> new BusinessException(ErrorCode.DONATION_ITEM_NOT_FOUND));

        // 모집중이 아니면 참여 불가 (F-013 결제 잠금)
        if (item.getStatus() != ItemStatus.RECRUITING) {
            throw new BusinessException(ErrorCode.CONTRIBUTION_NOT_ALLOWED);
        }
        long remaining = item.getGoalAmount() - item.getRaisedAmount();
        if (remaining <= 0) {
            throw new BusinessException(ErrorCode.CONTRIBUTION_NOT_ALLOWED);
        }
        // 남은 금액 초과 금지 (§15 목표잠금 후 중복구매 0건)
        if (amount > remaining) {
            throw new BusinessException(ErrorCode.CONTRIBUTION_EXCEEDS_REMAINING);
        }

        User donor = userRepository.findById(donorId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        Contribution saved = contributionRepository.save(Contribution.create(item, donor, amount));

        item.addRaised(amount);
        if (item.getRaisedAmount() >= item.getGoalAmount()) {
            item.markLocked();
        }
        return saved;
    }

    @Transactional(readOnly = true)
    public List<Contribution> findMine(Long donorId) {
        return contributionRepository.findMineWithItemAndFacility(donorId);
    }

    /** 물품별 기부 원장 (관리자) */
    @Transactional(readOnly = true)
    public List<Contribution> findByItem(Long itemId) {
        return contributionRepository.findByItemWithDonor(itemId);
    }

    /** 전체 후원 내역 (관리자 모니터링) */
    @Transactional(readOnly = true)
    public List<Contribution> findAllLedger() {
        return contributionRepository.findAllWithDetails();
    }
}
