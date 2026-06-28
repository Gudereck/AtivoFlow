package com.gestaoativos.demo.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name ="tb_equipamentos")

public class Equipamento {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "O nome do equipamento é obrigatorio")
    private String nome;

    @NotBlank(message = "O nome da empresa é obrigatorio")
    private String nomeEmpresa;

    private String especificacoes;

    @NotNull
    @Enumerated(EnumType.STRING)
    private StatusEquipamento status;

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getNomeEmpresa() {
        return nomeEmpresa;
    }

    public void setNomeEmpresa(String nomeEmpresa) {
        this.nomeEmpresa = nomeEmpresa;
    }

    public String getEspecificacoes() {
        return especificacoes;
    }

    public void setEspecificacoes(String especificacoes) {
        this.especificacoes = especificacoes;
    }

    public StatusEquipamento getStatus() {
        return status;
    }

    public void setStatus(StatusEquipamento status) {
        this.status = status;
    }
}

