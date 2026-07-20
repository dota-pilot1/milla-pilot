package com.cj.donationplatform.payment.presentation;

import com.cj.donationplatform.contribution.application.ContributionService;
import com.cj.donationplatform.payment.infrastructure.PortOneWebhookVerifier;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 포트원 결제 웹훅 수신.
 *
 * <p><b>왜 필요한가</b> — 확정을 브라우저가 알려주는 구조는, 결제 직후 브라우저가 닫히면
 * 후원이 확정되지 않는다. 돈은 빠져나갔는데 후원은 실패하는 구멍이다.
 * 웹훅은 포트원이 서버로 직접 통보하므로 브라우저와 무관하게 확정된다.
 *
 * <p><b>규칙</b>
 * <ul>
 *   <li>서명 검증을 통과한 요청만 처리한다. 검증할 수 없으면 거절(fail-closed).</li>
 *   <li>본문을 신뢰하지 않는다 — paymentId 만 꺼내고, 상태·금액은 포트원에 다시 조회해 대조한다.</li>
 *   <li>재전송해도 소용없는 건(알 수 없는 결제 등)은 200 으로 종료하고,
 *       일시적 사유(아직 승인 전·순간 장애)만 비200 으로 재전송을 유도한다.</li>
 * </ul>
 */
@Slf4j
@RestController
@RequestMapping("/api/webhooks")
@RequiredArgsConstructor
@Tag(name = "PaymentWebhook", description = "포트원 결제 웹훅 — 서명 검증 필요")
public class PortOneWebhookController {

    /**
     * 본문에서 paymentId 만 뽑는다.
     * JSON 매퍼를 쓰지 않는 이유 — 서명 검증 때문에 어차피 원문 문자열을 그대로 받아야 하고,
     * 필요한 값이 문자열 한 개뿐이라 Jackson 메이저 버전에 묶일 이유가 없다.
     */
    private static final Pattern PAYMENT_ID =
            Pattern.compile("\"paymentId\"\\s*:\\s*\"([^\"]+)\"");

    private final PortOneWebhookVerifier verifier;
    private final ContributionService contributionService;

    @PostMapping("/portone")
    @Operation(summary = "포트원 결제 알림 수신")
    public ResponseEntity<String> receive(
            @RequestHeader(value = "webhook-id", required = false) String webhookId,
            @RequestHeader(value = "webhook-timestamp", required = false) String webhookTimestamp,
            @RequestHeader(value = "webhook-signature", required = false) String webhookSignature,
            @RequestBody String rawBody
    ) {
        if (!verifier.verify(webhookId, webhookTimestamp, webhookSignature, rawBody)) {
            // 위조 가능성 — 재전송받을 이유가 없으므로 명확히 거절한다
            return ResponseEntity.status(401).body("invalid signature");
        }

        Matcher m = PAYMENT_ID.matcher(rawBody);
        if (!m.find()) {
            // 결제와 무관한 이벤트이거나 스키마가 다름. 재전송해도 같은 본문이라 200 으로 종료.
            log.info("[webhook] paymentId 없는 통보 — 무시. body={}", rawBody);
            return ResponseEntity.ok("no paymentId");
        }
        String paymentId = m.group(1);

        try {
            contributionService.confirmFromWebhook(paymentId);
        } catch (Exception e) {
            // 아직 승인 전(READY)이거나 일시적 장애 — 재전송으로 해결될 수 있다
            log.warn("[webhook] 확정 보류 paymentId={} 사유={}", paymentId, e.toString());
            return ResponseEntity.status(503).body("retry later");
        }
        log.info("[webhook] 확정 처리 paymentId={}", paymentId);
        return ResponseEntity.ok("ok");
    }
}
