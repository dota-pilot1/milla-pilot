package com.cj.donationplatform.payment.infrastructure;

import com.cj.donationplatform.common.exception.BusinessException;
import com.cj.donationplatform.common.exception.ErrorCode;
import com.cj.donationplatform.payment.config.PortOneProperties;
import com.cj.donationplatform.payment.domain.PaymentVerification;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.time.Duration;
import java.time.Instant;
import java.time.format.DateTimeParseException;
import java.util.Map;

/**
 * 포트원 V2 REST 클라이언트.
 *
 * <p><b>왜 필요한가</b> — 프론트가 보내는 "결제 성공했어요"는 위조할 수 있다.
 * 서버가 포트원에 직접 조회해 상태와 금액을 확인한 뒤에만 후원을 확정한다.
 *
 * <p>응답은 {@code Map} 으로 느슨하게 읽는다. {@code JsonNode} 를 쓰면 Jackson 메이저 버전
 * (Boot 3 = Jackson 2 / Boot 4 = Jackson 3)에 묶여 업그레이드 때 역직렬화가 깨진다.
 */
@Slf4j
@Component
public class PortOneClient {

    private static final ParameterizedTypeReference<Map<String, Object>> JSON_MAP =
            new ParameterizedTypeReference<>() {};

    /** 토큰 재사용 기간. 실제 유효기간(30분)보다 짧게 둬야 경계에서 만료된 토큰을 쓰지 않는다. */
    private static final Duration TOKEN_TTL = Duration.ofMinutes(25);

    private final PortOneProperties props;
    private final RestClient restClient;

    /** 액세스 토큰 캐시 — 매 조회마다 발급받지 않는다 */
    private volatile String token;
    private volatile Instant tokenExpiresAt;

    /**
     * {@code RestClient.Builder} 빈에 의존하지 않는다 — Spring Boot 4 에서 해당 자동 구성이
     * 별도 모듈로 분리돼 webmvc 스타터만으로는 빈이 등록되지 않는다. 정적 팩토리로 직접 만든다.
     */
    public PortOneClient(PortOneProperties props) {
        this.props = props;
        this.restClient = RestClient.builder().baseUrl(props.apiUrl()).build();
    }

    /**
     * API Secret 을 액세스 토큰으로 교환한다(공식 문서: {@code POST /login/api-secret}).
     * 이 호출이 401 이면 시크릿 자체가 잘못된 것이라 원인 구분이 명확해진다.
     */
    private String accessToken() {
        String cached = this.token;
        if (cached != null && tokenExpiresAt != null && Instant.now().isBefore(tokenExpiresAt)) {
            return cached;
        }
        Map<String, Object> res;
        try {
            res = restClient.post()
                    .uri("/login/api-secret")
                    // 콘솔에서 복사해 붙여넣을 때 앞뒤 공백·개행이 섞이는 일이 잦다
                    .body(Map.of("apiSecret", props.apiSecret().trim()))
                    .retrieve()
                    .body(JSON_MAP);
        } catch (RestClientResponseException e) {
            log.error("[portone] 토큰 발급 실패 — API Secret 을 확인하세요. status={} body={}",
                    e.getStatusCode(), e.getResponseBodyAsString());
            throw new BusinessException(ErrorCode.PAYMENT_VERIFY_FAILED);
        }
        String issued = str(res, "accessToken");
        if (issued == null) {
            log.error("[portone] 토큰 응답에 accessToken 이 없습니다. keys={}",
                    res == null ? null : res.keySet());
            throw new BusinessException(ErrorCode.PAYMENT_VERIFY_FAILED);
        }
        this.token = issued;
        this.tokenExpiresAt = Instant.now().plus(TOKEN_TTL);
        return issued;
    }

    /** 결제 단건 조회 — 검증에 필요한 값만 뽑아 반환 */
    public PaymentVerification getPayment(String paymentId) {
        if (!props.isConfigured()) {
            throw new BusinessException(ErrorCode.PAYMENT_NOT_CONFIGURED);
        }
        Map<String, Object> body;
        try {
            body = restClient.get()
                    .uri("/payments/{paymentId}", paymentId)
                    .header("Authorization", "Bearer " + accessToken())
                    .retrieve()
                    .body(JSON_MAP);
        } catch (RestClientResponseException e) {
            // 인증 실패(401)·없는 결제(404) 등 — 원인 파악에 응답 본문이 결정적이다
            log.error("[portone] 결제 조회 HTTP 오류 paymentId={} status={} body={}",
                    paymentId, e.getStatusCode(), e.getResponseBodyAsString());
            throw new BusinessException(ErrorCode.PAYMENT_VERIFY_FAILED);
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("[portone] 결제 조회 실패 paymentId={}", paymentId, e);
            throw new BusinessException(ErrorCode.PAYMENT_VERIFY_FAILED);
        }
        if (body == null) {
            throw new BusinessException(ErrorCode.PAYMENT_VERIFY_FAILED);
        }

        String status = str(body, "status");
        long amount = num(map(body, "amount"), "total");

        // 필드명이 문서와 다르면 조용히 0원·null 로 흘러가 금액 대조가 엉뚱하게 실패한다.
        // 파싱이 어긋난 정황이면 원문을 남겨 한 번에 진단할 수 있게 한다(응답에 비밀값 없음).
        if (status == null || amount == 0L) {
            log.warn("[portone] 응답 파싱 확인 필요 paymentId={} status={} amount={} body={}",
                    paymentId, status, amount, body);
        }

        return new PaymentVerification(
                str(body, "id"),
                status,
                amount,
                str(map(body, "channel"), "pgProvider"),
                str(map(body, "method"), "type"),
                str(body, "receiptUrl"),
                instant(str(body, "paidAt"))
        );
    }

    @SuppressWarnings("unchecked")
    private static Map<String, Object> map(Map<String, Object> src, String key) {
        if (src == null) return null;
        Object v = src.get(key);
        return v instanceof Map<?, ?> m ? (Map<String, Object>) m : null;
    }

    private static String str(Map<String, Object> src, String key) {
        if (src == null) return null;
        Object v = src.get(key);
        return v == null ? null : String.valueOf(v);
    }

    private static long num(Map<String, Object> src, String key) {
        if (src == null) return 0L;
        Object v = src.get(key);
        return v instanceof Number n ? n.longValue() : 0L;
    }

    private static Instant instant(String value) {
        if (value == null || value.isBlank()) return null;
        try {
            return Instant.parse(value);
        } catch (DateTimeParseException e) {
            log.warn("[portone] 시각 파싱 실패: {}", value);
            return null;
        }
    }
}
