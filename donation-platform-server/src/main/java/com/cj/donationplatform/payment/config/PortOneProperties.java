package com.cj.donationplatform.payment.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * 포트원(PortOne) V2 연동 설정.
 *
 * <p>storeId·channelKey 는 프론트엔드 결제창에 그대로 노출되는 공개 값이다.
 * <b>apiSecret 만 서버 전용 비밀값</b>이며 환경변수(.env)로만 주입한다.
 */
@ConfigurationProperties(prefix = "portone")
public record PortOneProperties(
        String apiUrl,
        String storeId,
        String channelKey,
        String apiSecret,
        /** 웹훅 서명 검증용 시크릿 — 없으면 웹훅을 거절한다 */
        String webhookSecret,
        /** 결제 대기(PENDING)가 잔여 금액을 선점하는 시간(분) */
        int pendingExpireMinutes,
        /**
         * 포트원이 아직 '승인 전'이라고 답하는 결제 대기를 재확인하는 상한(시간).
         * 이 시간이 지나면 결제되지 않은 것으로 보고 만료시킨다 — 무한 재조회 방지.
         */
        int pendingHardExpireHours
) {
    public boolean isConfigured() {
        return apiSecret != null && !apiSecret.isBlank()
                && storeId != null && !storeId.isBlank();
    }
}
