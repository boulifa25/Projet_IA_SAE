package com.stageia.backend.repository;

import com.stageia.backend.model.Message;
import com.stageia.backend.model.Stage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {

    List<Message> findByStageOrderByDateEnvoiAsc(Stage stage);
}
