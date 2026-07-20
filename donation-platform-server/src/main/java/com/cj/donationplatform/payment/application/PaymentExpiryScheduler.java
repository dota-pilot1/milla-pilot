package com.cj.donationplatform.payment.application;

import com.cj.donationplatform.contribution.application.ContributionService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * 결제창을 띄우고 결제하지 않은 건을 정리한다.
 *
 * <p>PENDING 은 잔여 금액을 선점하므로, 방치하면 다른 후원자가 그 금액만큼
 * 후원할 수 없게 된다. 만료된 건을 EXPIRED 로 바꿔 선점을 해제한다.
 */
@Component
@RequiredArgsConstructor
public class PaymentExpiryScheduler {

    private final ContributionService contributionService;

    /** 1분마다 만료 정리 */
    @Scheduled(fixedDelay = 60_000L, initialDelay = 60_000L)
    public void expire() {
        contributionService.expirePendings();
    }
}
