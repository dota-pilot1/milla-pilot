package com.cj.donationplatform.facility.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;

@Entity
@Table(name = "facilities", uniqueConstraints = @UniqueConstraint(columnNames = "code"))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Facility {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** slug · 시더 멱등키 (URL/재실행 대비) */
    @Column(nullable = false, length = 100, unique = true)
    private String code;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 100)
    private String region;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private FacilityType type;

    /** 소개 (아동 개인정보 미포함) */
    @Column(length = 500)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private FacilityStatus status;

    /** 자격확인 여부 */
    @Column(nullable = false)
    private boolean verified = false;

    /** 카드 이니셜 (예: "햇") */
    @Column(length = 4)
    private String avatarInitial;

    @Column(nullable = false)
    private int displayOrder = 0;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private Instant updatedAt;

    public static Facility create(
            String code, String name, String region, FacilityType type,
            String description, FacilityStatus status, boolean verified,
            String avatarInitial, int displayOrder
    ) {
        Facility f = new Facility();
        f.code = code;
        f.name = name;
        f.region = region;
        f.type = type;
        f.description = description;
        f.status = status;
        f.verified = verified;
        f.avatarInitial = avatarInitial;
        f.displayOrder = displayOrder;
        return f;
    }

    public void update(
            String name, String region, FacilityType type, String description,
            FacilityStatus status, boolean verified, String avatarInitial, int displayOrder
    ) {
        this.name = name;
        this.region = region;
        this.type = type;
        this.description = description;
        this.status = status;
        this.verified = verified;
        this.avatarInitial = avatarInitial;
        this.displayOrder = displayOrder;
    }
}
