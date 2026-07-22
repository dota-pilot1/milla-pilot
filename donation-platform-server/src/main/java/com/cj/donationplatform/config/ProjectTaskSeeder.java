package com.cj.donationplatform.config;

import com.cj.donationplatform.project.domain.ProjectTask;
import com.cj.donationplatform.project.domain.ProjectTaskGroup;
import com.cj.donationplatform.project.infrastructure.ProjectTaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@Order(80)
@RequiredArgsConstructor
public class ProjectTaskSeeder implements CommandLineRunner {

    private final ProjectTaskRepository projectTaskRepository;
    private static final List<String> REMOVED_PAYMENT_TASKS = List.of(
            "정산 대사 배치",
            "취소·환불 정합성"
    );

    @Override
    @Transactional
    public void run(String... args) {
        projectTaskRepository.deleteByTitleIn(REMOVED_PAYMENT_TASKS);
        if (projectTaskRepository.count() > 0) return;

        seed(ProjectTaskGroup.PRE_LAUNCH_REQUIRED, "관리자 구매 실행 화면", "플랫폼 관리자가 구매처, 실구매액, 주문 정보를 기록하는 화면을 확정합니다.", 10);
        seed(ProjectTaskGroup.PRE_LAUNCH_REQUIRED, "구매·배송 증빙 정리", "구매 영수증, 송장, 수령 확인 자료를 후원자 화면에 묶어 보여줍니다.", 20);
        seed(ProjectTaskGroup.PRE_LAUNCH_REQUIRED, "관리자 권한 세분화", "운영 역할별 접근 범위를 나누고 감사 로그를 남깁니다.", 30);
        seed(ProjectTaskGroup.PRE_LAUNCH_REQUIRED, "영수증 발급 단계", "수령확인 이후 구매·배송·수령 증빙을 묶어 후원자 화면에 정리합니다.", 40);
        seed(ProjectTaskGroup.PRE_LAUNCH_REQUIRED, "기부금영수증 처리", "발급 주체와 과세 구분, 현금·현물 평가 기준을 세무 검토 후 확정합니다.", 50);

        seed(ProjectTaskGroup.UNDER_REVIEW, "현물 후원 접수·보관", "후원자가 물품을 직접 보내는 경로와 집하·검수 방식을 검토하고 있습니다.", 10);
        seed(ProjectTaskGroup.UNDER_REVIEW, "차액 처리", "목표금액과 실구매액 차이를 어떻게 정산할지 정해야 합니다.", 20);

        seed(ProjectTaskGroup.AFTER_PILOT, "배송 자동 추적", "현재는 송장 딥링크 중심이며, 택배사 API를 붙여 배송 이벤트를 자동 동기화합니다.", 10);
        seed(ProjectTaskGroup.AFTER_PILOT, "단계 알림", "목표달성·구매·배송·수령 이벤트를 후원자에게 알려주는 기능을 붙입니다.", 20);
        seed(ProjectTaskGroup.AFTER_PILOT, "통계 대시보드 · 펀딩 캠페인", "운영 지표와 캠페인 단위 모금을 확장합니다.", 30);
        seed(ProjectTaskGroup.AFTER_PILOT, "커뮤니티 · 명예 홍보관", "후원자 참여 콘텐츠 영역을 추가합니다.", 40);
    }

    private void seed(ProjectTaskGroup group, String title, String description, int displayOrder) {
        projectTaskRepository.save(ProjectTask.create(group, title, description, displayOrder));
    }
}
