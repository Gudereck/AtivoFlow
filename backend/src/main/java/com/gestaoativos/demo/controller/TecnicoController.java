package com.gestaoativos.demo.controller;

import com.gestaoativos.demo.model.Tecnico;
import com.gestaoativos.demo.service.TecnicoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin
@RestController
@RequestMapping("/api/tecnicos")
public class TecnicoController {

    private final TecnicoService tecnicoService;

    public TecnicoController(TecnicoService tecnicoService) {
        this.tecnicoService = tecnicoService;
    }

    @PostMapping
    public ResponseEntity<?> criar(@Valid @RequestBody Tecnico tecnico) {
        try {
            Tecnico novoTecnico = tecnicoService.salvar(tecnico);
            return ResponseEntity.status(HttpStatus.CREATED).body(novoTecnico);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<Tecnico>> listarTodos() {
        return ResponseEntity.ok(tecnicoService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Tecnico> buscarPorId(@PathVariable Long id) {
        return tecnicoService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
