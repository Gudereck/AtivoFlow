package com.gestaoativos.demo.service;

import com.gestaoativos.demo.model.Equipamento;
import com.gestaoativos.demo.model.StatusEquipamento;
import com.gestaoativos.demo.repository.EquipamentoRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;


@Service
public class EquipamentoService{
    private final EquipamentoRepository equipamentoRepository;

    public EquipamentoService(EquipamentoRepository equipamentoRepository){
        this.equipamentoRepository = equipamentoRepository;
    }

    @Transactional
    public Equipamento salvar(Equipamento equipamento){
        if(equipamento .getStatus()==null){
            equipamento.setStatus(StatusEquipamento.ATIVO);
        }
        Optional<Equipamento> existente = equipamentoRepository.findByNomeEmpresa(equipamento.getNomeEmpresa());

// Usamos != em vez de .equals() porque o getId() está retornando um tipo primitivo (long)
        if (existente.isPresent() && existente.get().getId() != equipamento.getId()) {
            throw new RuntimeException("Já existe um equipamento registado com esta empresa.");
        }
        return equipamentoRepository.save(equipamento);

    }
    public List<Equipamento> listarTodos() {
        return equipamentoRepository.findAll();
    }

    public Optional<Equipamento> buscarPorId(Long id) {
        return equipamentoRepository.findById(id);
    }

    @Transactional
    public Equipamento atualizarStatus(Long id, StatusEquipamento novoStatus) {
        // Primeiro buscamos o equipamento. Se não existir, lançamos uma exceção.
        Equipamento equipamento = equipamentoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Equipamento com ID " + id + " não encontrado."));

        // Atualizamos o status e guardamos
        equipamento.setStatus(novoStatus);
        return equipamentoRepository.save(equipamento);
    }
}
