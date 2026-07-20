package com.cj.donationplatform.payment.infrastructure;

import com.cj.donationplatform.payment.config.PortOneProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;

/**
 * 포트원 웹훅 서명 검증 (Standard Webhooks 규격).
 *
 * <p><b>왜 필요한가</b> — 웹훅 URL 은 외부에 열려 있다. 검증 없이 받으면
 * 누구나 "결제됐다"고 위조해 무료로 후원을 만들 수 있다.
 *
 * <p>테스트·실연동 시크릿이 다르므로 설정에 <b>쉼표로 여러 개</b>를 넣을 수 있다.
 * 하나라도 맞으면 통과한다.
 *
 * <p>서명 대상은 {@code {webhook-id}.{webhook-timestamp}.{본문}} 이고,
 * 시크릿({@code whsec_} 접두사 제거 후 base64 디코드)으로 HMAC-SHA256 한 값을 base64 로 비교한다.
 * {@code webhook-signature} 헤더에는 {@code v1,<서명>} 이 공백으로 여러 개 올 수 있다.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class PortOneWebhookVerifier {

    /** 재전송 공격 방지 — 타임스탬프가 이 범위를 벗어나면 거절 */
    private static final Duration TOLERANCE = Duration.ofMinutes(5);

    private final PortOneProperties props;

    public boolean isConfigured() {
        return props.webhookSecret() != null && !props.webhookSecret().isBlank();
    }

    /**
     * @return 서명이 유효하면 true. 시크릿 미설정·헤더 누락·시각 초과·불일치는 모두 false.
     *         <b>실패 시 거절(fail-closed)</b> — 검증할 수 없으면 받지 않는다.
     */
    public boolean verify(String webhookId, String webhookTimestamp, String webhookSignature, String rawBody) {
        if (!isConfigured()) {
            log.error("[webhook] 웹훅 시크릿이 설정되지 않아 검증할 수 없습니다. 요청을 거절합니다.");
            return false;
        }
        if (webhookId == null || webhookTimestamp == null || webhookSignature == null) {
            log.warn("[webhook] 서명 헤더 누락 id={} ts={} sig={}",
                    webhookId != null, webhookTimestamp != null, webhookSignature != null);
            return false;
        }
        if (!withinTolerance(webhookTimestamp)) {
            log.warn("[webhook] 타임스탬프 허용 범위 초과 ts={}", webhookTimestamp);
            return false;
        }

        String payload = webhookId + "." + webhookTimestamp + "." + rawBody;

        // 테스트·실연동 시크릿이 서로 다르다. 어느 모드에서 온 통보든 받아야 하므로 모두 시도한다.
        for (String secret : props.webhookSecret().split(",")) {
            String expected = sign(payload, secret.trim());
            if (expected == null) continue;
            // "v1,<sig> v1,<sig2>" 형태 — 하나라도 맞으면 통과
            for (String part : webhookSignature.split("\\s+")) {
                int comma = part.indexOf(',');
                String candidate = comma >= 0 ? part.substring(comma + 1) : part;
                if (constantTimeEquals(expected, candidate)) {
                    return true;
                }
            }
        }
        log.warn("[webhook] 서명 불일치 id={} — 등록된 시크릿 {}개 모두 불일치",
                webhookId, props.webhookSecret().split(",").length);
        return false;
    }

    private boolean withinTolerance(String timestamp) {
        try {
            Instant sent = Instant.ofEpochSecond(Long.parseLong(timestamp.trim()));
            return Duration.between(sent, Instant.now()).abs().compareTo(TOLERANCE) <= 0;
        } catch (NumberFormatException e) {
            return false;
        }
    }

    private String sign(String payload, String rawSecret) {
        try {
            String secret = rawSecret;
            if (secret.isBlank()) return null;
            if (secret.startsWith("whsec_")) {
                secret = secret.substring("whsec_".length());
            }
            byte[] key = Base64.getDecoder().decode(secret);
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(key, "HmacSHA256"));
            return Base64.getEncoder()
                    .encodeToString(mac.doFinal(payload.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            log.error("[webhook] 서명 계산 실패 — 시크릿 형식을 확인하세요", e);
            return null;
        }
    }

    /** 타이밍 공격 방지 — 길이가 달라도 끝까지 비교한다 */
    private static boolean constantTimeEquals(String a, String b) {
        byte[] x = a.getBytes(StandardCharsets.UTF_8);
        byte[] y = b.getBytes(StandardCharsets.UTF_8);
        int diff = x.length ^ y.length;
        for (int i = 0; i < x.length && i < y.length; i++) {
            diff |= x[i] ^ y[i];
        }
        return diff == 0;
    }
}
