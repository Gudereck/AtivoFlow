package com.gestaoativos.demo.repository;

import com.gestaoativos.demo.model.Equipamento;
import com.gestaoativos.demo.model.StatusEquipamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EquipamentoRepository extends JpaRepository<Equipamento , Long> {

    Optional<Equipamento> findByNomeEmpresa(String nomeEmpresa);
    List<Equipamento> findByStatus(StatusEquipamento status);

}
