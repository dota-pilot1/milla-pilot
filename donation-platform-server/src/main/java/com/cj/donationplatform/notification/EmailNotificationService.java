package com.cj.donationplatform.notification;

import com.cj.donationplatform.user.domain.User;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

/** 트랜잭션 이메일 (step7). SMTP(spring.mail)로 HTML 발송. */
@Slf4j
@Service
@RequiredArgsConstructor
public class EmailNotificationService {

    private final JavaMailSender mailSender;

    @Value("${app.mail-from:}")
    private String mailFrom;

    public void sendPasswordReset(User user, String resetUrl) {
        String html = """
                <div style="font-family:'Apple SD Gothic Neo',Arial,sans-serif;max-width:520px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden">
                  <div style="background:#0f766e;padding:26px 32px">
                    <p style="margin:0;font-size:19px;font-weight:800;color:#fff;letter-spacing:0.03em">DonationPlatform</p>
                    <p style="margin:4px 0 0;font-size:11px;color:#a7f3d0;letter-spacing:0.12em">후원 이행 플랫폼</p>
                  </div>
                  <div style="padding:34px 32px">
                    <h2 style="margin:0 0 8px;font-size:20px;color:#111827">비밀번호 재설정</h2>
                    <p style="margin:0 0 8px;color:#4b5563;font-size:15px;line-height:1.6">안녕하세요, %s님.<br>아래 버튼을 눌러 비밀번호를 재설정하세요.</p>
                    <p style="margin:0 0 22px;color:#9ca3af;font-size:13px">이 링크는 <strong>15분간</strong> 유효합니다.</p>
                    <a href="%s" style="display:inline-block;background:#0f766e;color:#fff;text-decoration:none;padding:13px 30px;border-radius:9px;font-size:15px;font-weight:700">비밀번호 재설정 →</a>
                    <p style="margin:22px 0 0;font-size:13px;color:#9ca3af">본인이 요청하지 않았다면 이 메일을 무시하세요.</p>
                  </div>
                  <div style="padding:18px 32px;background:#f9fafb;border-top:1px solid #e5e7eb">
                    <p style="margin:0;font-size:12px;color:#9ca3af">본 메일은 발신 전용입니다.</p>
                  </div>
                </div>
                """.formatted(user.getUsername(), resetUrl);
        sendHtml(user.getEmail(), "[DonationPlatform] 비밀번호 재설정 안내", html);
    }

    public void sendPasswordChanged(User user) {
        String html = """
                <div style="font-family:'Apple SD Gothic Neo',Arial,sans-serif;max-width:520px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden">
                  <div style="background:#0f766e;padding:26px 32px">
                    <p style="margin:0;font-size:19px;font-weight:800;color:#fff">DonationPlatform</p>
                  </div>
                  <div style="padding:34px 32px">
                    <h2 style="margin:0 0 8px;font-size:19px;color:#111827">비밀번호가 변경되었습니다</h2>
                    <p style="margin:0 0 20px;color:#4b5563;font-size:15px;line-height:1.6">안녕하세요, %s님.<br>방금 비밀번호가 정상적으로 변경되었습니다.</p>
                    <p style="margin:0;padding:13px 15px;background:#fffbeb;border-left:3px solid #f59e0b;border-radius:6px;font-size:14px;color:#555">본인이 변경하지 않았다면 즉시 재설정하고 관리자에게 알리세요.</p>
                  </div>
                  <div style="padding:18px 32px;background:#f9fafb;border-top:1px solid #e5e7eb">
                    <p style="margin:0;font-size:12px;color:#9ca3af">본 메일은 발신 전용입니다.</p>
                  </div>
                </div>
                """.formatted(user.getUsername());
        sendHtml(user.getEmail(), "[DonationPlatform] 비밀번호가 변경되었습니다", html);
    }

    private void sendHtml(String to, String subject, String html) {
        if (to == null || to.isBlank()) {
            log.info("메일 발송 생략 subject={} reason=no-recipient", subject);
            return;
        }
        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, false, "UTF-8");
            if (mailFrom != null && !mailFrom.isBlank()) {
                helper.setFrom(mailFrom);
            }
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);
            mailSender.send(msg);
            log.info("메일 발송 완료 to={} subject={}", to, subject);
        } catch (Exception e) {
            log.error("메일 발송 실패 to={} subject={}", to, subject, e);
            throw new RuntimeException(e);
        }
    }
}
