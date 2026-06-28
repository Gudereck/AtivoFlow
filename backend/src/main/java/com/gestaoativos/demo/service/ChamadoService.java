package com.gestaoativos.demo.service;

import com.gestaoativos.demo.model.Chamado;
import com.gestaoativos.demo.model.Equipamento;
import com.gestaoativos.demo.model.Tecnico;
import com.gestaoativos.demo.model.StatusChamado;
import com.gestaoativos.demo.model.StatusEquipamento;
import com.gestaoativos.demo.repository.ChamadoRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ChamadoService {

    private final ChamadoRepository chamadoRepository;
    private final EquipamentoService equipamentoService;
    private final TecnicoService tecnicoService;

    public ChamadoService(ChamadoRepository chamadoRepository, 
                          EquipamentoService equipamentoService, 
                          TecnicoService tecnicoService) {
        this.chamadoRepository = chamadoRepository;
        this.equipamentoService = equipamentoService;
        this.tecnicoService = tecnicoService;
    }

    @Transactional
    public Chamado abrirChamado(Chamado chamado) {
        // 1. Verificamos se o equipamento associado foi fornecido e existe realmente
        if (chamado.getEquipamento() != null && chamado.getEquipamento().getId() != 0) {
            Long idEquipamento = chamado.getEquipamento().getId();
            Equipamento equipamento = equipamentoService.buscarPorId(idEquipamento)
                    .orElseThrow(() -> new RuntimeException("Equipamento não encontrado no sistema."));

            // 2. Regra de Negócio: Mudamos o estado do equipamento para EM_MANUTENCAO
            equipamentoService.atualizarStatus(idEquipamento, StatusEquipamento.EM_MANUTENCAO);

            // 3. Garantimos que o chamado fica associado ao equipamento recuperado do banco
            chamado.setEquipamento(equipamento);
        } else {
            chamado.setEquipamento(null);
        }

        // 4. Verificar se o técnico associado foi fornecido e existe
        if (chamado.getTecnico() != null && chamado.getTecnico().getId() != null) {
            Long idTecnico = chamado.getTecnico().getId();
            Tecnico tecnico = tecnicoService.buscarPorId(idTecnico)
                    .orElseThrow(() -> new RuntimeException("Técnico não encontrado no sistema."));
            chamado.setTecnico(tecnico);
        } else {
            chamado.setTecnico(null);
        }

        // 5. Guardamos o chamado (A anotação @PrePersist da entidade cuidará da data e do estado inicial)
        return chamadoRepository.save(chamado);
    }

    @Transactional
    public Chamado concluirChamado(Long idChamado, String diagnostico) {
        if (diagnostico == null || diagnostico.trim().isEmpty()) {
            throw new RuntimeException("É obrigatório informar o diagnóstico para concluir um chamado.");
        }

        Chamado chamado = chamadoRepository.findById(idChamado)
                .orElseThrow(() -> new RuntimeException("Chamado não encontrado."));

        if (chamado.getStatus() == StatusChamado.CONCLUIDO) {
            throw new RuntimeException("Este chamado já se encontra concluído.");
        }

        // Atualizamos os dados de encerramento do chamado
        chamado.setDiagnosticoTecnico(diagnostico);
        chamado.setStatus(StatusChamado.CONCLUIDO);
        chamado.setDataFechamento(LocalDateTime.now());

        // Regra de Negócio Bônus: Quando o chamado é concluído, o equipamento volta a ficar ATIVO
        if (chamado.getEquipamento() != null) {
            equipamentoService.atualizarStatus(chamado.getEquipamento().getId(), StatusEquipamento.ATIVO);
        }

        return chamadoRepository.save(chamado);
    }

    public List<Chamado> listarTodos() {
        return chamadoRepository.findAll();
    }

    public Optional<Chamado> buscarPorId(Long id) {
        return chamadoRepository.findById(id);
    }
}