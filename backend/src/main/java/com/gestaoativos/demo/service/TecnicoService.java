package com.gestaoativos.demo.service;

import com.gestaoativos.demo.model.Tecnico;
import com.gestaoativos.demo.repository.TecnicoRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TecnicoService {

    private final TecnicoRepository tecnicoRepository;

    public TecnicoService(TecnicoRepository tecnicoRepository) {
        this.tecnicoRepository = tecnicoRepository;
    }

    @Transactional
    public Tecnico salvar(Tecnico tecnico) {
        Optional<Tecnico> existente = tecnicoRepository.findByEmail(tecnico.getEmail());

        if (existente.isPresent() && !existente.get().getId().equals(tecnico.getId())) {
            throw new RuntimeException("Já existe um técnico registado com este e-mail.");
        }

        return tecnicoRepository.save(tecnico);
    }

    public List<Tecnico> listarTodos() {
        return tecnicoRepository.findAll();
    }

    public Optional<Tecnico> buscarPorId(Long id) {
        return tecnicoRepository.findById(id);
    }
}
