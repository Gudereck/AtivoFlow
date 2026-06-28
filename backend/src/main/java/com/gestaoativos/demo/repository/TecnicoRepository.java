package com.gestaoativos.demo.repository;

import com.gestaoativos.demo.model.Tecnico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TecnicoRepository extends JpaRepository<Tecnico, Long> {
    Optional<Tecnico> findByEmail(String email);
}
