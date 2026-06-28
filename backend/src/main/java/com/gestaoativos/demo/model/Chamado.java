package com.gestaoativos.demo.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Entity
@Table(name = "tb_chamados")
public class Chamado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "equipamento_id") // Cria a chave estrangeira (Foreign Key) na tabela
    private Equipamento equipamento;

    @ManyToOne
    @JoinColumn(name = "tecnico_id")
    private Tecnico tecnico;

    @NotBlank(message = "A descrição do problema é obrigatória")
    @Column(columnDefinition = "TEXT") // TEXT permite textos maiores do que o padrão de 255 caracteres
    private String descricaoProblema;

    // O diagnóstico começa vazio e só é preenchido quando o técnico atende
    @Column(columnDefinition = "TEXT")
    private String diagnosticoTecnico;

    @Column(updatable = false)
    private LocalDateTime dataAbertura;

    private LocalDateTime dataFechamento;

    @NotNull
    @Enumerated(EnumType.STRING)
    private StatusChamado status;

    // Este método é executado automaticamente pelo Spring/Hibernate ANTES de salvar no banco de dados pela primeira vez
    @PrePersist
    public void antesDeSalvar() {
        this.dataAbertura = LocalDateTime.now(); // Preenche a data de abertura automaticamente com a data/hora atual
        if (this.status == null) {
            this.status = StatusChamado.ABERTO;
        }
    }

    // --- Construtores, Getters e Setters ---

    public Chamado() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Equipamento getEquipamento() {
        return equipamento;
    }

    public void setEquipamento(Equipamento equipamento) {
        this.equipamento = equipamento;
    }

    public String getDescricaoProblema() {
        return descricaoProblema;
    }

    public void setDescricaoProblema(String descricaoProblema) {
        this.descricaoProblema = descricaoProblema;
    }

    public String getDiagnosticoTecnico() {
        return diagnosticoTecnico;
    }

    public void setDiagnosticoTecnico(String diagnosticoTecnico) {
        this.diagnosticoTecnico = diagnosticoTecnico;
    }

    public LocalDateTime getDataAbertura() {
        return dataAbertura;
    }

    public void setDataAbertura(LocalDateTime dataAbertura) {
        this.dataAbertura = dataAbertura;
    }

    public LocalDateTime getDataFechamento() {
        return dataFechamento;
    }

    public void setDataFechamento(LocalDateTime dataFechamento) {
        this.dataFechamento = dataFechamento;
    }

    public StatusChamado getStatus() {
        return status;
    }

    public void setStatus(StatusChamado status) {
        this.status = status;
    }

    public Tecnico getTecnico() {
        return tecnico;
    }

    public void setTecnico(Tecnico tecnico) {
        this.tecnico = tecnico;
    }
}