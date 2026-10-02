package com.stageia.backend.repository;

import com.stageia.backend.model.RecommandationIA;
import com.stageia.backend.model.Stage;
import com.stageia.backend.model.TypeRecommandation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RecommandationIARepository extends JpaRepository<RecommandationIA, Long> {

    List<RecommandationIA> findByStageOrderByDateGenerationDesc(Stage stage);

    List<RecommandationIA> findByStageAndTypeOrderByDateGenerationDesc(Stage stage, TypeRecommandation type);

    Optional<RecommandationIA> findFirstByStageAndTypeOrderByDateGenerationDesc(Stage stage, TypeRecommandation type);
}
