package com.gestaoativos.demo.repository;

import com.gestaoativos.demo.model.Chamado;
import com.gestaoativos.demo.model.StatusChamado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChamadoRepository extends JpaRepository<Chamado , Long> {

    List<Chamado> findByEquipamentoId(Long equipamento);
    List<Chamado> findByStatus(StatusChamado status);

}
