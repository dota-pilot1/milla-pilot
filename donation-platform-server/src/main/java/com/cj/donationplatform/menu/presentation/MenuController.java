package com.cj.donationplatform.menu.presentation;

import com.cj.donationplatform.menu.application.MenuService;
import com.cj.donationplatform.menu.presentation.dto.CreateMenuRequest;
import com.cj.donationplatform.menu.presentation.dto.MenuResponse;
import com.cj.donationplatform.menu.presentation.dto.UpdateMenuRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/menus")
@RequiredArgsConstructor
@Tag(name = "Menu", description = "헤더 메뉴 조회 및 관리")
public class MenuController {

    private final MenuService menuService;

    @GetMapping
    @Operation(summary = "전체 메뉴 플랫 조회 (공개)")
    public List<MenuResponse> getAll() {
        return menuService.getAll();
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PLATFORM_ADMIN')")
    @Operation(summary = "메뉴 생성 (ROLE_PLATFORM_ADMIN)")
    public ResponseEntity<MenuResponse> create(@Valid @RequestBody CreateMenuRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(menuService.create(req));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PLATFORM_ADMIN')")
    @Operation(summary = "메뉴 수정 (ROLE_PLATFORM_ADMIN)")
    public MenuResponse update(@PathVariable Long id, @Valid @RequestBody UpdateMenuRequest req) {
        return menuService.update(id, req);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PLATFORM_ADMIN')")
    @Operation(summary = "메뉴 삭제 (ROLE_PLATFORM_ADMIN)")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        menuService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
