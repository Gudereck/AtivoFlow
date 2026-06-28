package com.gestaoativos.demo.controller;

import com.gestaoativos.demo.model.Equipamento;
import com.gestaoativos.demo.model.StatusEquipamento;
import com.gestaoativos.demo.service.EquipamentoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// @RestController indica que esta classe vai lidar com requisições web e devolver JSON
@CrossOrigin
@RestController
// @RequestMapping define o caminho base para todos os endpoints desta classe
@RequestMapping("/api/equipamentos")
public class EquipamentoController {

    private final EquipamentoService equipamentoService;

    public EquipamentoController(EquipamentoService equipamentoService) {
        this.equipamentoService = equipamentoService;
    }

    // Endpoint para registar um novo equipamento (POST /api/equipamentos)
    // @RequestBody converte o JSON da requisição num objeto Equipamento
    @PostMapping
    public ResponseEntity<Equipamento> criar(@RequestBody Equipamento equipamento) {
        try {
            Equipamento novoEquipamento = equipamentoService.salvar(equipamento);
            // Devolve HTTP 201 (Created) quando o recurso é criado com sucesso
            return ResponseEntity.status(HttpStatus.CREATED).body(novoEquipamento);
        } catch (RuntimeException e) {
            // Se a regra de negócio do número de série falhar, devolvemos um erro 400
            return ResponseEntity.badRequest().build();
        }
    }

    // Endpoint para listar todos os equipamentos (GET /api/equipamentos)
    @GetMapping
    public ResponseEntity<List<Equipamento>> listarTodos() {
        List<Equipamento> equipamentos = equipamentoService.listarTodos();
        return ResponseEntity.ok(equipamentos); // Devolve HTTP 200 (OK)
    }

    // Endpoint para procurar um equipamento pelo ID (GET /api/equipamentos/{id})
    // @PathVariable extrai o valor do {id} do URL
    @GetMapping("/{id}")
    public ResponseEntity<Equipamento> buscarPorId(@PathVariable Long id) {
        return equipamentoService.buscarPorId(id)
                .map(equipamento -> ResponseEntity.ok(equipamento)) // Se encontrar, devolve 200 OK
                .orElse(ResponseEntity.notFound().build());         // Se não, devolve 404 Not Found
    }

    // Endpoint para atualizar apenas o estado de um equipamento (PATCH /api/equipamentos/{id}/status?status=NOVO_ESTADO)
    // Usamos PATCH em vez de PUT porque estamos a atualizar apenas um campo específico
    @PatchMapping("/{id}/status")
    public ResponseEntity<Equipamento> atualizarStatus(
            @PathVariable Long id,
            @RequestParam StatusEquipamento status) {
        try {
            Equipamento equipamentoAtualizado = equipamentoService.atualizarStatus(id, status);
            return ResponseEntity.ok(equipamentoAtualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}