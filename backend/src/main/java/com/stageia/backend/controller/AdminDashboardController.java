package com.stageia.backend.controller;

import com.stageia.backend.dto.DashboardStatsResponse;
import com.stageia.backend.dto.EntrepriseAdminResponse;
import com.stageia.backend.dto.EtudiantAdminResponse;
import com.stageia.backend.service.AdminDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMINISTRATEUR')")
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;

    @GetMapping("/stats")
    public DashboardStatsResponse stats() {
        return adminDashboardService.getStats();
    }

    @GetMapping("/entreprises")
    public List<EntrepriseAdminResponse> entreprises() {
        return adminDashboardService.listerEntreprises();
    }

    @GetMapping("/etudiants")
    public List<EtudiantAdminResponse> etudiants() {
        return adminDashboardService.listerEtudiants();
    }
}
