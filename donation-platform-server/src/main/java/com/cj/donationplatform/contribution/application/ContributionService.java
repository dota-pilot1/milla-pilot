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
     * 만료 시각이 지나면 선점은 자동으로 풀리고, {@link #settleExpiredPending(Long)} 이
     * 포트원에 실제 결제 여부를 확인한 뒤 상태를 정리한다.
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

        return applyVerification(contribution, portOneClient.getPayment(paymentId));
    }

    /**
     * 조회해 온 결제 상태를 후원에 반영한다. 조회와 분리한 이유 —
     * 만료 정리도 같은 검증 규칙(상태·금액 대조)을 써야 하는데, 이미 조회한 결과를
     * 다시 조회하게 만들면 호출이 두 배가 되고 그 사이 상태가 바뀔 수 있다.
     */
    private Contribution applyVerification(Contribution contribution, PaymentVerification verification) {
        String paymentId = contribution.getPaymentId();

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

    /** 정리 대상 — 만료 시각이 지난 결제 대기. 건별 트랜잭션으로 처리하려고 id 만 읽는다. */
    @Transactional(readOnly = true)
    public List<Long> findExpiredPendingIds() {
        return contributionRepository.findExpiredPendingIds(Instant.now());
    }

    /**
     * 만료된 결제 대기 <b>1건</b> 정리.
     *
     * <p><b>포트원에 실제로 결제됐는지 확인한 뒤에만</b> 만료시킨다. 그냥 EXPIRED 로 밀면,
     * 승인 직후 브라우저를 닫아 확정이 끊기고 웹훅까지 유실된 건이
     * "돈은 냈는데 결제 안 한 사람"으로 <b>종료 상태에 박제</b>돼 되살릴 근거가 사라진다.
     *
     * <p>원칙은 <b>확실히 아닌 것만 만료시킨다</b>. 판단이 서지 않으면 PENDING 으로 두고
     * 다음 주기에 다시 본다 — 만료 시각이 지난 PENDING 은 이미 잔여 금액을 선점하지
     * 않으므로(§{@code sumHeldAmount}) 남겨둬도 다른 후원자를 막지 않는다.
     */
    @Transactional
    public ExpirySettlement settleExpiredPending(Long contributionId) {
        Contribution contribution = contributionRepository.findById(contributionId).orElse(null);
        // 그 사이 확정·취소됐으면 건드리지 않는다
        if (contribution == null || !contribution.isPending()) {
            return ExpirySettlement.SKIPPED;
        }
        String paymentId = contribution.getPaymentId();
        Instant hardExpireAt = contribution.getExpiresAt()
                .plus(Duration.ofHours(portOneProperties.pendingHardExpireHours()));

        PaymentVerification verification = portOneClient.findPayment(paymentId).orElse(null);

        // 포트원에 기록 자체가 없다 = 결제창까지 가지 않고 이탈했다. 만료시켜도 안전한 유일한 경우
        if (verification == null) {
            contribution.markExpired();
            return ExpirySettlement.EXPIRED;
        }

        if (verification.isPaid()) {
            if (verification.amount() != contribution.getAmount()) {
                // 돈은 실제로 나갔는데 금액이 다르다 — 자동 확정하면 안 되고 사람이 봐야 한다.
                // 예외를 던지면 이 기록마저 롤백되므로 상태만 남기고 정상 종료한다.
                log.error("[payment] 만료 정리 중 금액 불일치 — 수동 확인 필요."
                                + " paymentId={} 신청={} 결제={}",
                        paymentId, contribution.getAmount(), verification.amount());
                contribution.markFailed("금액 불일치: 결제 " + verification.amount());
                return ExpirySettlement.MISMATCHED;
            }
            applyVerification(contribution, verification);
            log.warn("[payment] 만료 직전 결제 확인 — 후원 확정으로 되살림."
                            + " paymentId={} amount={}",
                    paymentId, contribution.getAmount());
            return ExpirySettlement.RESCUED;
        }

        if (verification.isTerminallyFailed()) {
            contribution.markExpired();
            return ExpirySettlement.EXPIRED;
        }

        // READY 등 '아직 승인 전' — 지금 만료시키면 곧 날 승인을 잃는다. 다음 주기에 다시 본다.
        // 다만 영원히 재조회하지 않도록 상한을 둔다. 이 시점까지 미승인이면 결제되지 않은 것이다.
        if (Instant.now().isAfter(hardExpireAt)) {
            log.info("[payment] 장기 미승인 만료 paymentId={} status={}", paymentId, verification.status());
            contribution.markExpired();
            return ExpirySettlement.EXPIRED;
        }
        return ExpirySettlement.DEFERRED;
    }

    /** 만료 정리 1건의 처리 결과 — 스케줄러 요약 로그용 */
    public enum ExpirySettlement {
        /** 결제되지 않은 것이 확인돼 EXPIRED 처리 */
        EXPIRED,
        /** 실제로는 결제된 건이라 후원으로 확정 */
        RESCUED,
        /** 결제됐으나 금액이 달라 FAILED — 수동 확인 필요 */
        MISMATCHED,
        /** 아직 승인 전이라 판단 보류 — 다음 주기에 재확인 */
        DEFERRED,
        /** 그 사이 다른 경로로 처리됨 */
        SKIPPED
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
