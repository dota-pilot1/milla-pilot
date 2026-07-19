package com.cj.donationplatform.user.domain;

import com.cj.donationplatform.role.domain.Role;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;

@Entity
@Table(name = "users")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Column(nullable = false, length = 100)
    private String passwordHash;

    @Column(nullable = false, length = 50)
    private String username;

    @Column(length = 30)
    private String phoneNumber;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;

    @Column(nullable = false)
    private boolean active;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private Instant updatedAt;

    public static User createNewUser(String email, String passwordHash, String username, Role defaultRole) {
        return createNewUser(email, passwordHash, username, null, defaultRole);
    }

    public static User createNewUser(String email, String passwordHash, String username, String phoneNumber, Role defaultRole) {
        User u = new User();
        u.email = email;
        u.passwordHash = passwordHash;
        u.username = username;
        u.phoneNumber = normalizePhoneNumber(phoneNumber);
        u.role = defaultRole;
        u.active = true;
        return u;
    }

    public void deactivate() { this.active = false; }
    public void activate()   { this.active = true; }
    public void changeRole(Role newRole) { this.role = newRole; }
    public void toggleActive() { this.active = !this.active; }

    public void updateProfile(String email, String username) {
        updateProfile(email, username, this.phoneNumber);
    }

    public void updateProfile(String email, String username, String phoneNumber) {
        this.email = email;
        this.username = username;
        this.phoneNumber = normalizePhoneNumber(phoneNumber);
    }

    /** 비밀번호 재설정 — 이미 인코딩된 해시를 받아 교체 (step7). */
    public void changePassword(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    private static String normalizePhoneNumber(String phoneNumber) {
        return phoneNumber == null || phoneNumber.isBlank() ? null : phoneNumber.trim();
    }
}
