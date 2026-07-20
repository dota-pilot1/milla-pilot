package com.cj.donationplatform.common.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {
    DUPLICATE_EMAIL(HttpStatus.CONFLICT, "AUTH_001", "이미 사용 중인 이메일입니다."),
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "AUTH_002", "사용자를 찾을 수 없습니다."),
    INVALID_CREDENTIALS(HttpStatus.UNAUTHORIZED, "AUTH_003", "이메일 또는 비밀번호가 올바르지 않습니다."),
    ACCOUNT_INACTIVE(HttpStatus.FORBIDDEN, "AUTH_004", "비활성화된 계정입니다."),
    INVALID_TOKEN(HttpStatus.UNAUTHORIZED, "AUTH_005", "유효하지 않은 토큰입니다."),
    INVALID_REFRESH_TOKEN(HttpStatus.UNAUTHORIZED, "AUTH_006", "유효하지 않은 리프레시 토큰입니다."),
    INVALID_PASSWORD_RESET_TOKEN(HttpStatus.BAD_REQUEST, "AUTH_007", "유효하지 않거나 만료된 재설정 링크입니다."),
    ROLE_NOT_FOUND(HttpStatus.NOT_FOUND, "ROLE_001", "롤을 찾을 수 없습니다."),
    ROLE_CODE_DUPLICATE(HttpStatus.CONFLICT, "ROLE_002", "이미 존재하는 롤 코드입니다."),
    ROLE_SYSTEM_READONLY(HttpStatus.BAD_REQUEST, "ROLE_003", "시스템 롤은 수정 또는 삭제할 수 없습니다."),
    ROLE_IN_USE(HttpStatus.CONFLICT, "ROLE_004", "해당 롤을 사용 중인 유저가 있어 삭제할 수 없습니다."),
    PERMISSION_NOT_FOUND(HttpStatus.NOT_FOUND, "PERM_001", "권한을 찾을 수 없습니다."),
    PERMISSION_CODE_DUPLICATE(HttpStatus.CONFLICT, "PERM_002", "이미 존재하는 권한 코드입니다."),
    PERMISSION_CATEGORY_NOT_FOUND(HttpStatus.NOT_FOUND, "PCAT_001", "권한 카테고리를 찾을 수 없습니다."),
    PERMISSION_CATEGORY_CODE_DUPLICATE(HttpStatus.CONFLICT, "PCAT_002", "이미 존재하는 카테고리 코드입니다."),
    PERMISSION_CATEGORY_IN_USE(HttpStatus.CONFLICT, "PCAT_003", "해당 카테고리를 사용 중인 권한이 있어 삭제할 수 없습니다."),
    FORBIDDEN(HttpStatus.FORBIDDEN, "COMMON_002", "접근 권한이 없습니다."),
    VALIDATION_FAILED(HttpStatus.BAD_REQUEST, "COMMON_001", "입력값이 올바르지 않습니다."),
    UPLOAD_NOT_CONFIGURED(HttpStatus.SERVICE_UNAVAILABLE, "UPLOAD_001", "파일 업로드(S3)가 설정되지 않았습니다."),
    UPLOAD_INVALID_CONTENT_TYPE(HttpStatus.BAD_REQUEST, "UPLOAD_002", "허용되지 않은 파일 형식입니다."),
    SITE_SETTING_NOT_FOUND(HttpStatus.NOT_FOUND, "SITE_001", "사이트 설정을 찾을 수 없습니다."),
    MENU_NOT_FOUND(HttpStatus.NOT_FOUND, "MENU_001", "메뉴를 찾을 수 없습니다."),
    MENU_CODE_DUPLICATE(HttpStatus.CONFLICT, "MENU_002", "이미 존재하는 메뉴 코드입니다."),
    MENU_PARENT_NOT_FOUND(HttpStatus.NOT_FOUND, "MENU_003", "부모 메뉴를 찾을 수 없습니다."),
    FACILITY_NOT_FOUND(HttpStatus.NOT_FOUND, "FAC_001", "시설을 찾을 수 없습니다."),
    FACILITY_CODE_DUPLICATE(HttpStatus.CONFLICT, "FAC_002", "이미 존재하는 시설 코드입니다."),
    DONATION_ITEM_NOT_FOUND(HttpStatus.NOT_FOUND, "DITEM_001", "후원 물품을 찾을 수 없습니다."),
    CONTRIBUTION_NOT_ALLOWED(HttpStatus.BAD_REQUEST, "CONTRIB_001", "이 물품은 지금 후원할 수 없습니다(모집중 아님·목표 달성·금액 오류)."),
    CONTRIBUTION_EXCEEDS_REMAINING(HttpStatus.BAD_REQUEST, "CONTRIB_002", "남은 금액을 초과했습니다."),
    CONTRIBUTION_NOT_FOUND(HttpStatus.NOT_FOUND, "CONTRIB_003", "후원 참여 기록을 찾을 수 없습니다."),
    PAYMENT_NOT_CONFIGURED(HttpStatus.SERVICE_UNAVAILABLE, "PAY_001", "결제(포트원)가 설정되지 않았습니다."),
    PAYMENT_VERIFY_FAILED(HttpStatus.BAD_GATEWAY, "PAY_002", "결제 정보를 확인하지 못했습니다."),
    PAYMENT_AMOUNT_MISMATCH(HttpStatus.BAD_REQUEST, "PAY_003", "결제 금액이 후원 신청 금액과 일치하지 않습니다."),
    PAYMENT_NOT_PAID(HttpStatus.BAD_REQUEST, "PAY_004", "결제가 완료되지 않았습니다."),
    PAYMENT_EXPIRED(HttpStatus.BAD_REQUEST, "PAY_005", "결제 시간이 만료되었습니다. 다시 시도해주세요."),
    PURCHASE_NOT_ALLOWED(HttpStatus.BAD_REQUEST, "PO_001", "목표달성(잠금) 물품만 통합구매할 수 있습니다."),
    PURCHASE_ALREADY_DONE(HttpStatus.CONFLICT, "PO_002", "이미 통합구매된 물품입니다."),
    PURCHASE_ORDER_NOT_FOUND(HttpStatus.NOT_FOUND, "PO_003", "통합구매 기록을 찾을 수 없습니다."),
    SHIPMENT_NOT_ALLOWED(HttpStatus.BAD_REQUEST, "PO_004", "통합구매(구매 진행) 이후에만 송장을 등록할 수 있습니다."),
    RECEIVE_NOT_ALLOWED(HttpStatus.BAD_REQUEST, "PO_005", "배송중 물품만 수령확인할 수 있습니다."),
    INTERNAL_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "COMMON_999", "서버 오류가 발생했습니다.");

    private final HttpStatus status;
    private final String code;
    private final String message;
}
