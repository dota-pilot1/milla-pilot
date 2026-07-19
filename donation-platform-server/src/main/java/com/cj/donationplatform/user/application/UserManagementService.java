package com.cj.donationplatform.user.application;

import com.cj.donationplatform.auth.infrastructure.RefreshTokenRepository;
import com.cj.donationplatform.common.exception.BusinessException;
import com.cj.donationplatform.common.exception.DuplicateEmailException;
import com.cj.donationplatform.common.exception.ErrorCode;
import com.cj.donationplatform.role.application.RoleService;
import com.cj.donationplatform.role.domain.Role;
import com.cj.donationplatform.user.domain.User;
import com.cj.donationplatform.user.infrastructure.UserRepository;
import com.cj.donationplatform.user.presentation.dto.CreateUserRequest;
import com.cj.donationplatform.user.presentation.dto.UpdateUserRequest;
import com.cj.donationplatform.user.presentation.dto.UserListItemResponse;
import lombok.RequiredArgsConstructor;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserManagementService {

    private final UserRepository userRepository;
    private final RoleService roleService;
    private final PasswordEncoder passwordEncoder;
    private final RefreshTokenRepository refreshTokenRepository;

    @Transactional(readOnly = true)
    public Page<UserListItemResponse> getUsers(String q, Long roleId, Boolean active, Pageable pageable) {
        return userRepository.findAll(matches(q, roleId, active), pageable).map(UserListItemResponse::from);
    }

    private Specification<User> matches(String q, Long roleId, Boolean active) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            String keyword = q == null ? "" : q.trim().toLowerCase();
            if (!keyword.isBlank()) {
                var role = root.join("role");
                String like = "%" + keyword + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("email")), like),
                        cb.like(cb.lower(root.get("username")), like),
                        cb.like(cb.lower(root.get("phoneNumber")), like),
                        cb.like(cb.lower(role.get("name")), like),
                        cb.like(cb.lower(role.get("code")), like)
                ));
            }

            if (roleId != null) {
                predicates.add(cb.equal(root.get("role").get("id"), roleId));
            }

            if (active != null) {
                predicates.add(cb.equal(root.get("active"), active));
            }

            return cb.and(predicates.toArray(Predicate[]::new));
        };
    }

    @Transactional(readOnly = true)
    public UserListItemResponse getUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        return UserListItemResponse.from(user);
    }

    @Transactional
    public UserListItemResponse createUser(CreateUserRequest req) {
        if (userRepository.existsByEmail(req.email())) {
            throw new DuplicateEmailException();
        }
        Role role = roleService.getById(req.roleId());
        String hash = passwordEncoder.encode(req.password());
        User saved = userRepository.save(User.createNewUser(req.email(), hash, req.username(), req.phoneNumber(), role));
        return UserListItemResponse.from(saved);
    }

    @Transactional
    public UserListItemResponse updateProfile(Long userId, UpdateUserRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        if (!user.getEmail().equals(req.email()) && userRepository.existsByEmail(req.email())) {
            throw new DuplicateEmailException();
        }
        user.updateProfile(req.email(), req.username(), req.phoneNumber());
        return UserListItemResponse.from(user);
    }

    @Transactional
    public UserListItemResponse changeRole(Long userId, Long roleId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        Role newRole = roleService.getById(roleId);
        user.changeRole(newRole);
        return UserListItemResponse.from(user);
    }

    @Transactional
    public UserListItemResponse toggleActive(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        user.toggleActive();
        return UserListItemResponse.from(user);
    }

    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        refreshTokenRepository.deleteByUserId(userId);
        userRepository.delete(user);
    }
}
