package com.gestaoativos.demo.controller;

import com.gestaoativos.demo.model.Chamado;
import com.gestaoativos.demo.service.ChamadoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin
@RestController
@RequestMapping("/api/chamados")
public class ChamadoController {

    private final ChamadoService chamadoService;

    public ChamadoController(ChamadoService chamadoService){
        this.chamadoService = chamadoService;
    }

    // CORREÇÃO 1: Adicionado o @RequestBody antes do parâmetro 'chamado'
    @PostMapping
    public ResponseEntity<?> abrirChamado(@RequestBody Chamado chamado) {
        try {
            Chamado novoChamado = chamadoService.abrirChamado(chamado);
            return ResponseEntity.status(HttpStatus.CREATED).body(novoChamado);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<Chamado>> listarTodos(){
        return ResponseEntity.ok(chamadoService.listarTodos());
    }

    // CORREÇÃO 2: Adicionado o parênteses ')' em falta no final da linha do orElse
    @GetMapping("/{id}")
    public ResponseEntity<Chamado> buscarPorId(@PathVariable Long id){
        return chamadoService.buscarPorId(id)
                .map(chamado -> ResponseEntity.ok(chamado))
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/concluir")
    public ResponseEntity<?> concluirChamado(
            @PathVariable Long id,
            @RequestParam String diagnostico) {
        try {
            Chamado chamadoConcluido = chamadoService.concluirChamado(id, diagnostico);
            return ResponseEntity.ok(chamadoConcluido);
        } catch (RuntimeException e) {
            // Pode ser o erro de "Já concluído" ou "Diagnóstico vazio"
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}