package com.cj.donationplatform.contribution.application;

import com.cj.donationplatform.common.exception.BusinessException;
import com.cj.donationplatform.common.exception.ErrorCode;
import com.cj.donationplatform.contribution.domain.Contribution;
import com.cj.donationplatform.contribution.infrastructure.ContributionRepository;
import com.cj.donationplatform.donation_item.domain.DonationItem;
import com.cj.donationplatform.donation_item.domain.ItemStatus;
import com.cj.donationplatform.donation_item.infrastructure.DonationItemRepository;
import com.cj.donationplatform.payment.config.PortOneProperties;
import com.cj.donationplatform.payment.domain.PaymentVerification;
import com.cj.donationplatform.payment.infrastructure.PortOneClient;
import com.cj.donationplatform.purchase_order.domain.PurchaseOrder;
import com.cj.donationplatform.purchase_order.infrastructure.PurchaseOrderRepository;
import com.cj.donationplatform.user.domain.User;
import com.cj.donationplatform.user.infrastructure.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ContributionService {

    private final ContributionRepository contributionRepository;
    private final DonationItemRepository donationItemRepository;
    private final UserRepository userRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final PortOneClient portOneClient;
    private final PortOneProperties portOneProperties;

    /**
     * 후원 참여 기록 생성 (결제 없이 기록) — 시더·레거시 전용.
     * 물품 raisedAmount 를 올리고, 목표 도달 시 결제 잠금(LOCKED).
     */
    @Transactional
    public Contribution create(Long donorId, Long donationItemId, long amount) {
        DonationItem item = lockAndValidate(donationItemId, amount);
        User donor = findDonor(donorId);

        Contribution saved = contributionRepository.save(Contribution.create(item, donor, amount));
        applyRaised(item, amount);
        return saved;
    }

    /**
     * 1단계 — 결제 대기 생성. 결제창을 띄우기 직전에 호출한다.
     *
     * <p>이 시점에는 raisedAmount 를 올리지 않는다. 대신 만료시각까지 잔여 금액을
     * "선점"해서, 결제가 진행 중인 금액을 다른 후원자가 다시 쓰지 못하게 한다.
     * 결제하지 않고 이탈하면 {@link #expirePendings()} 가 선점을 해제한다.
     */
    @Transactional
    public Contribution initiate(Long donorId, Long donationItemId, long amount) {
        DonationItem item = lockAndValidate(donationItemId, amount);
        User donor = findDonor(donorId);

        Instant expiresAt = Instant.now().plus(Duration.ofMinutes(portOneProperties.pendingExpireMinutes()));
        String paymentId = "milla_" + UUID.randomUUID().toString().replace("-", "");

        return contributionRepository.save(
                Contribution.pending(item, donor, amount, paymentId, expiresAt));
    }

    /**
     * 2단계 — 결제 확정. 프론트의 "성공했어요"를 믿지 않고 포트원에 직접 조회해
     * 상태와 금액을 대조한 뒤에만 PAID 로 확정하고 모금액에 반영한다.
     *
     * <p>같은 결제가 두 번 확정 요청돼도 이미 PAID 면 그대로 반환한다(멱등).
     */
    @Transactional
    public Contribution confirm(Long donorId, String paymentId) {
        Contribution contribution = contributionRepository.findByPaymentId(paymentId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CONTRIBUTION_NOT_FOUND));

        if (!contribution.getDonor().getId().equals(donorId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }
        return confirmVerified(contribution);
    }

    /**
     * 웹훅으로 들어온 확정. 후원자 본인 확인 단계가 없다 — 요청자가 브라우저가 아니라 포트원이기 때문이다.
     *
     * <p>대신 <b>서명 검증을 통과한 요청만</b> 여기까지 와야 한다(컨트롤러 책임).
     * 결제 자체는 포트원에 다시 조회해 금액까지 대조하므로, 웹훅 본문을 신뢰하지 않는다.
     */
    @Transactional
    public void confirmFromWebhook(String paymentId) {
        contributionRepository.findByPaymentId(paymentId).ifPresentOrElse(
                this::confirmVerified,
                () -> log.warn("[webhook] 알 수 없는 결제 통보 paymentId={}", paymentId));
    }

    private Contribution confirmVerified(Contribution contribution) {
        String paymentId = contribution.getPaymentId();
        // 멱등 — 이미 확정된 건이면 다시 반영하지 않는다
        if (contribution.isPaid()) {
            return contribution;
        }
        if (!contribution.isPending()) {
            throw new BusinessException(ErrorCode.PAYMENT_NOT_PAID);
        }

        PaymentVerification verification = portOneClient.getPayment(paymentId);

        if (!verification.isPaid()) {
            // READY 등 '아직 승인 전'은 실패로 확정하지 않는다 — 그래야 이후 승인을 반영할 수 있다.
            if (verification.isTerminallyFailed()) {
                contribution.markFailed("포트원 상태=" + verification.status());
            }
            throw new BusinessException(ErrorCode.PAYMENT_NOT_PAID);
        }
        // 위변조 방지 — 서버가 만든 금액과 실제 결제 금액이 같아야 한다
        if (verification.amount() != contribution.getAmount()) {
            log.error("[payment] 금액 불일치 paymentId={} 신청={} 결제={}",
                    paymentId, contribution.getAmount(), verification.amount());
            contribution.markFailed("금액 불일치: 결제 " + verification.amount());
            throw new BusinessException(ErrorCode.PAYMENT_AMOUNT_MISMATCH);
        }

        // 물품 행 락 후 모금액 반영 (동시 확정 직렬화)
        DonationItem item = donationItemRepository.findByIdForUpdate(contribution.getDonationItem().getId())
                .orElseThrow(() -> new BusinessException(ErrorCode.DONATION_ITEM_NOT_FOUND));

        contribution.markPaid(
                verification.pgProvider(), verification.payMethod(),
                verification.receiptUrl(), verification.paidAt());
        applyRaised(item, contribution.getAmount());

        return contribution;
    }

    /** 후원자가 결제창을 닫거나 실패한 경우 — 선점을 즉시 해제한다. */
    @Transactional
    public void cancelPending(Long donorId, String paymentId, String reason) {
        contributionRepository.findByPaymentId(paymentId).ifPresent(c -> {
            if (c.getDonor().getId().equals(donorId) && c.isPending()) {
                c.markCanceled(reason);
            }
        });
    }

    /** 만료된 결제 대기 정리 — 스케줄러가 주기적으로 호출. 선점이 풀린다. */
    @Transactional
    public int expirePendings() {
        List<Contribution> expired = contributionRepository.findExpiredPending(Instant.now());
        expired.forEach(Contribution::markExpired);
        if (!expired.isEmpty()) {
            log.info("[payment] 만료된 결제 대기 {}건 정리", expired.size());
        }
        return expired.size();
    }

    /**
     * 물품 행에 쓰기 락을 걸고 후원 가능 여부를 검증한다.
     * 잔여 = 목표 − 모금액 − <b>결제 진행 중 선점액</b>.
     */
    private DonationItem lockAndValidate(Long donationItemId, long amount) {
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
        long held = contributionRepository.sumHeldAmount(donationItemId, Instant.now());
        long remaining = item.getGoalAmount() - item.getRaisedAmount() - held;
        if (remaining <= 0) {
            throw new BusinessException(ErrorCode.CONTRIBUTION_NOT_ALLOWED);
        }
        // 남은 금액 초과 금지 (§15 목표잠금 후 중복구매 0건)
        if (amount > remaining) {
            throw new BusinessException(ErrorCode.CONTRIBUTION_EXCEEDS_REMAINING);
        }
        return item;
    }

    private User findDonor(Long donorId) {
        return userRepository.findById(donorId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
    }

    private void applyRaised(DonationItem item, long amount) {
        item.addRaised(amount);
        if (item.getRaisedAmount() >= item.getGoalAmount()) {
            item.markLocked();
        }
    }

    @Transactional(readOnly = true)
    public List<Contribution> findMine(Long donorId) {
        return contributionRepository.findMineWithItemAndFacility(donorId);
    }

    @Transactional(readOnly = true)
    public List<MineContributionDetails> findMineDetails(Long donorId) {
        List<Contribution> contributions = contributionRepository.findMineWithItemAndFacility(donorId);
        List<Long> itemIds = contributions.stream()
                .map(c -> c.getDonationItem().getId())
                .distinct()
                .toList();
        Map<Long, PurchaseOrder> ordersByItemId = itemIds.isEmpty()
                ? Map.of()
                : purchaseOrderRepository.findByDonationItemIds(itemIds).stream()
                        .collect(Collectors.toMap(po -> po.getDonationItem().getId(), po -> po));

        return contributions.stream()
                .map(c -> new MineContributionDetails(
                        c,
                        ordersByItemId.get(c.getDonationItem().getId())
                ))
                .toList();
    }

    public record MineContributionDetails(Contribution contribution, PurchaseOrder purchaseOrder) {}

    /** 물품별 참여 현황 (후원자 공개용) — 후원자 수 + 최근 참여 */
    @Transactional(readOnly = true)
    public ItemSummary itemSummary(Long itemId, int recentLimit) {
        return new ItemSummary(
                contributionRepository.countDonorsByItem(itemId),
                contributionRepository.findRecentByItem(itemId, PageRequest.of(0, recentLimit)));
    }

    public record ItemSummary(long donorCount, List<Contribution> recent) {}

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
