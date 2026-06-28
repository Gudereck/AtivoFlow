🛠️ AtivoFlow - Gestão de Ativos e Chamados de TI

O AtivoFlow é uma API RESTful desenvolvida em Java com Spring Boot para gerir o ciclo de vida de equipamentos de informática e o fluxo de suporte técnico (chamados/tickets).

Este projeto foi construído com foco na aplicação de boas práticas de programação, arquitetura em camadas (Controller, Service, Repository), modelagem de banco de dados relacional e conteinerização.

✨ Funcionalidades e Regras de Negócio

Gestão de Equipamentos: Cadastro, listagem e atualização de status de hardwares.

Gestão de Técnicos: Cadastro dos profissionais responsáveis pelo suporte.

Abertura e Conclusão de Chamados:

🔄 Regra 1: Ao abrir um chamado para um equipamento, o status do equipamento muda automaticamente para EM_MANUTENCAO.

✅ Regra 2: Ao concluir um chamado, exige-se um diagnóstico técnico e o status do equipamento retorna para ATIVO automaticamente.

🚀 Tecnologias Utilizadas

Java 21

Spring Boot (Web, Data JPA, Validation)

PostgreSQL (Banco de dados relacional)

Maven (Gerenciador de dependências)

Docker & Docker Compose (Conteinerização)

Hibernate / JPA (Mapeamento Objeto-Relacional)

📦 Como executar o projeto

Pré-requisitos

Git

Docker e Docker Desktop instalados (Opção recomendada)

Ou Java 21 + PostgreSQL instalados localmente.

Opção 1: Rodando com Docker (Mais fácil)

Faça o clone do repositório:

git clone [https://github.com/SEU_USUARIO/AtivoFlow.git](https://github.com/SEU_USUARIO/AtivoFlow.git)


Entre na pasta do projeto:

cd AtivoFlow


Gere o build da aplicação (necessário ter o Maven instalado ou usar o wrapper da IDE):

./mvnw clean package -DskipTests


Suba o banco de dados e a aplicação juntos usando o Docker Compose:

docker-compose up -d


A API estará disponível em http://localhost:8080.

Opção 2: Rodando localmente pela IDE (IntelliJ / Eclipse)

Clone o repositório e abra na sua IDE.

Certifique-se de ter um banco de dados PostgreSQL a rodar localmente na porta 5432.

Crie um banco de dados chamado gestao_ativos no seu pgAdmin.

Ajuste as credenciais (username e password) no ficheiro src/main/resources/application.properties.

Execute a classe principal DemoApplication.java.

📍 Endpoints da API (Exemplos)

Aqui estão alguns dos principais endpoints para testar no Postman ou Insomnia:

Equipamentos

POST /api/equipamentos - Regista um novo equipamento.

GET /api/equipamentos - Lista todos os equipamentos.

GET /api/equipamentos/{id} - Busca equipamento por ID.

PATCH /api/equipamentos/{id}/status?status=NOVO_ESTADO - Altera o status manualmente.

Chamados

POST /api/chamados - Abre um novo chamado (Muda o status do equipamento).

GET /api/chamados - Lista todos os chamados com os seus respectivos equipamentos e técnicos.

PATCH /api/chamados/{id}/concluir?diagnostico=Texto_Aqui - Conclui o chamado (Volta o equipamento a ativo).

👨‍💻 Autor

Desenvolvido como projeto prático para consolidação de conhecimentos em Backend Java. Sinta-se à vontade para fazer um fork e contribuir!
