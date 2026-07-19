package com.cj.donationplatform.config;

import com.cj.donationplatform.auth.security.CustomUserDetailsService;
import com.cj.donationplatform.auth.security.JwtAuthenticationFilter;
import com.cj.donationplatform.auth.security.RestAuthenticationEntryPoint;
import com.cj.donationplatform.common.exception.ErrorCode;
import com.cj.donationplatform.common.response.ErrorResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            CustomUserDetailsService uds,
            PasswordEncoder encoder) {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(uds);
        provider.setPasswordEncoder(encoder);
        return new ProviderManager(provider);
    }

    @Bean
    public AccessDeniedHandler accessDeniedHandler(@Lazy ObjectMapper objectMapper) {
        return (request, response, ex) -> {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setCharacterEncoding("UTF-8");
            objectMapper.writeValue(response.getWriter(), ErrorResponse.of(ErrorCode.FORBIDDEN));
        };
    }

    @Bean
    public SecurityFilterChain filterChain(
            HttpSecurity http,
            JwtAuthenticationFilter jwtFilter,
            RestAuthenticationEntryPoint entryPoint,
            AccessDeniedHandler accessDeniedHandler) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(eh -> eh
                        .authenticationEntryPoint(entryPoint)
                        .accessDeniedHandler(accessDeniedHandler)
                )
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/api/auth/signup",
                                "/api/auth/login",
                                "/api/auth/refresh",
                                "/api/auth/check-email",
                                "/api/auth/password-reset/request",
                                "/api/auth/password-reset/confirm"
                        ).permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/site-settings").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/menus").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/facilities/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/donation-items/**").permitAll()
                        // 후원 관리(시설·물품 변경, 기부 원장 조회)는 관리자 전용 (ROLE_ADMIN 은 레거시 관리자)
                        .requestMatchers(HttpMethod.POST, "/api/facilities", "/api/facilities/**").hasAnyRole("PLATFORM_ADMIN", "ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/facilities/**").hasAnyRole("PLATFORM_ADMIN", "ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/facilities/**").hasAnyRole("PLATFORM_ADMIN", "ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/donation-items", "/api/donation-items/**").hasAnyRole("PLATFORM_ADMIN", "ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/donation-items/**").hasAnyRole("PLATFORM_ADMIN", "ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/donation-items/**").hasAnyRole("PLATFORM_ADMIN", "ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/contributions/by-item/**").hasAnyRole("PLATFORM_ADMIN", "ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/contributions").hasAnyRole("PLATFORM_ADMIN", "ADMIN")
                        // 통합구매: 전체 목록·수정은 관리자 (실행 POST 는 /api/donation-items/** 규칙, 물품별 조회 GET 은 공개)
                        .requestMatchers(HttpMethod.GET, "/api/public/purchase-orders", "/api/public/purchase-monitoring").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/purchase-orders", "/api/purchase-orders/**").hasAnyRole("PLATFORM_ADMIN", "ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/purchase-orders/**").hasAnyRole("PLATFORM_ADMIN", "ADMIN")
                        .requestMatchers(
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/v3/api-docs/**"
                        ).permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .anyRequest().authenticated()
                )
                .httpBasic(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(
                "http://localhost:4300",
                "http://localhost:1422",
                "tauri://localhost",
                // 운영(MVP 쇼케이스) — english-agent-hub 슬롯 인계
                "https://dxline-tallent.com",
                "https://www.dxline-tallent.com"
        ));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setExposedHeaders(List.of("Authorization"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
