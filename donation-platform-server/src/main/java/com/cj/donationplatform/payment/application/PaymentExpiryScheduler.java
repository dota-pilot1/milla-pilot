package com.cj.donationplatform.payment.application;

import com.cj.donationplatform.contribution.application.ContributionService;
import com.cj.donationplatform.contribution.application.ContributionService.ExpirySettlement;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;

/**
 * 결제창을 띄우고 확정되지 않은 건을 정리한다.
 *
 * <p><b>그냥 만료시키지 않는다.</b> 승인 직후 브라우저를 닫아 확정이 끊기고 웹훅까지
 * 유실된 건이 섞여 있을 수 있어서, 건마다 포트원에 실제 결제 여부를 확인한 뒤에만
 * 만료시킨다. 실제로 결제된 건이면 그 자리에서 후원으로 확정한다.
 *
 * <p>루프를 서비스가 아니라 여기 두는 이유 — 한 건의 포트원 조회 실패가
 * 나머지 건까지 롤백시키면 안 된다. 건별로 {@code @Transactional} 경계를 넘도록
 * 다른 빈에서 호출한다.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class PaymentExpiryScheduler {

    private final ContributionService contributionService;

    /** 1분마다 만료 정리 */
    @Scheduled(fixedDelay = 60_000L, initialDelay = 60_000L)
    public void expire() {
        List<Long> targets = contributionService.findExpiredPendingIds();
        if (targets.isEmpty()) {
            return;
        }

        Map<ExpirySettlement, Integer> tally = new EnumMap<>(ExpirySettlement.class);
        int failed = 0;
        for (Long id : targets) {
            try {
                ExpirySettlement result = contributionService.settleExpiredPending(id);
                tally.merge(result, 1, Integer::sum);
            } catch (Exception e) {
                // 포트원 장애 등 — 만료시키지 않고 PENDING 으로 남겨 다음 주기에 다시 본다.
                // 확실하지 않을 때 만료시키는 것이 이 배치의 유일한 치명적 실패다.
                failed++;
                log.warn("[payment] 만료 정리 실패 — 다음 주기에 재시도. contributionId={} 사유={}",
                        id, e.toString());
            }
        }
        log.info("[payment] 결제 대기 정리 대상={} 결과={} 조회실패={}", targets.size(), tally, failed);
    }
}
