# 🛠️ AtivoFlow - Gestão de Ativos e Chamados de TI

![Java](https://img.shields.io/badge/Java-21-orange.svg)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.x-brightgreen.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue.svg)
![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)

O **AtivoFlow** é uma API RESTful desenvolvida em Java com Spring Boot para gerir o ciclo de vida de equipamentos de informática e o fluxo de suporte técnico (chamados/tickets).

Este projeto foi construído com foco na aplicação de boas práticas de programação, arquitetura em camadas (Controller, Service, Repository), modelagem de banco de dados relacional e conteinerização.

## ✨ Funcionalidades e Regras de Negócio

* **Gestão de Equipamentos**: Cadastro, listagem e atualização de status de hardwares.
* **Gestão de Técnicos**: Cadastro dos profissionais responsáveis pelo suporte.
* **Abertura e Conclusão de Chamados**:
  * 🔄 **Regra 1**: Ao abrir um chamado para um equipamento, o status do equipamento muda automaticamente para `EM_MANUTENCAO`.
  * ✅ **Regra 2**: Ao concluir um chamado, exige-se um diagnóstico técnico e o status do equipamento retorna para `ATIVO` automaticamente.

## 🚀 Tecnologias Utilizadas

* **Java 21**
* **Spring Boot** (Web, Data JPA, Validation)
* **PostgreSQL** (Banco de dados relacional)
* **Maven** (Gerenciador de dependências)
* **Docker & Docker Compose** (Conteinerização)
* **Hibernate / JPA** (Mapeamento Objeto-Relacional)

## 📦 Como executar o projeto

### Pré-requisitos

* Git
* Docker e Docker Desktop instalados (Opção recomendada)
* *Ou* Java 21 + PostgreSQL instalados localmente.

### Opção 1: Rodando com Docker (Mais fácil)

1. Faça o clone do repositório:
   ```bash
   git clone [https://github.com/SEU_USUARIO/AtivoFlow.git](https://github.com/SEU_USUARIO/AtivoFlow.git)
