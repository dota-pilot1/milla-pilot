package com.cj.donationplatform.user.application;

import com.cj.donationplatform.common.exception.BusinessException;
import com.cj.donationplatform.common.exception.ErrorCode;
import com.cj.donationplatform.notification.EmailNotificationService;
import com.cj.donationplatform.user.domain.PasswordResetToken;
import com.cj.donationplatform.user.domain.User;
import com.cj.donationplatform.user.infrastructure.PasswordResetTokenRepository;
import com.cj.donationplatform.user.infrastructure.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final EmailNotificationService emailService;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.front-url}")
    private String frontUrl;

    /**
     * 재설정 요청 — 이메일로 재설정 링크 발송.
     * 유저 열거 방지: 가입 안 된 이메일이어도 예외 없이 조용히 반환(응답은 항상 성공).
     */
    @Transactional
    public void requestReset(String email) {
        userRepository.findByEmail(email).ifPresentOrElse(user -> {
            tokenRepository.deleteByUser_Id(user.getId());
            PasswordResetToken token = tokenRepository.save(PasswordResetToken.create(user));
            String resetUrl = frontUrl + "/reset-password?token=" + token.getToken();
            try {
                emailService.sendPasswordReset(user, resetUrl);
            } catch (Exception e) {
                log.warn("비밀번호 재설정 메일 발송 실패 userId={}", user.getId(), e);
            }
        }, () -> log.info("비밀번호 재설정 요청 — 미가입 이메일(무시)"));
    }

    /** 재설정 확정 — 토큰 검증 후 새 비밀번호 반영. */
    @Transactional
    public void confirmReset(String token, String newPassword) {
        PasswordResetToken resetToken = tokenRepository.findByTokenAndUsedFalse(token)
                .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_PASSWORD_RESET_TOKEN));

        if (resetToken.isExpired()) {
            throw new BusinessException(ErrorCode.INVALID_PASSWORD_RESET_TOKEN);
        }

        User user = resetToken.getUser();
        user.changePassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        resetToken.markUsed();
        tokenRepository.save(resetToken);

        try {
            emailService.sendPasswordChanged(user);
        } catch (Exception e) {
            log.warn("비밀번호 변경 알림 메일 발송 실패 userId={}", user.getId(), e);
        }
    }
}
