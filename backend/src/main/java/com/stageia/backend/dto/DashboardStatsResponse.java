package com.stageia.backend.dto;

import lombok.Getter;

@Getter
public class DashboardStatsResponse {

    private final long offresActives;
    private final long candidaturesTotal;
    private final long etudiantsPlaces;
    private final long entreprisesPartenaires;

    public DashboardStatsResponse(long offresActives, long candidaturesTotal,
                                   long etudiantsPlaces, long entreprisesPartenaires) {
        this.offresActives = offresActives;
        this.candidaturesTotal = candidaturesTotal;
        this.etudiantsPlaces = etudiantsPlaces;
        this.entreprisesPartenaires = entreprisesPartenaires;
    }
}
