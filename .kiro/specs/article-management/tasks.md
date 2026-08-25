# Implementation Plan: Gestão de Artigos

## Overview

Este plano implementa o sistema completo de Gestão de Artigos composto por: Backend Laravel (API REST), Painel Administrativo (Angular + Angular Material) e integração com o App Mobile (Ionic/Angular). A implementação segue uma abordagem incremental, começando pela infraestrutura do backend, seguido dos endpoints CRUD, painel admin e integração mobile.

## Tasks

- [ ] 1. Scaffold do Backend Laravel
  - [x] 1.1 Criar projeto Laravel no diretório `/backend`
    - Executar criação do projeto Laravel com configuração para API REST
    - Configurar `.env` com SQLite como banco de dados padrão
    - Verificar que o projeto inicia corretamente com `php artisan serve`
    - _Requirements: 1.1, 1.2_

  - [x] 1.2 Configurar CORS e formato de resposta JSON
    - Configurar `config/cors.php` para aceitar requisições de `localhost:4200` e `localhost:8100`
    - Configurar `bootstrap/app.php` para retornar JSON em rotas `/api/*`
    - Garantir que todas as respostas seguem convenções REST em formato JSON
    - _Requirements: 1.3, 1.5_

  - [x] 1.3 Criar endpoint de health check
    - Criar `HealthController` com método que retorna `{"status": "ok"}`
    - Registrar rota GET `/api/health` em `routes/api.php`
    - _Requirements: 1.4_

  - [ ]* 1.4 Escrever teste de feature para o health check
    - Testar GET `/api/health` retorna status 200 com JSON `{"status": "ok"}`
    - _Requirements: 1.4_

- [x] 2. Checkpoint - Verificar scaffold do backend
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 3. Models, Migrations e Seeders
  - [x] 3.1 Criar model Category com migration
    - Criar migration com campos: id, name (string, obrigatório), slug (string, único), timestamps
    - Criar model `Category` com `$fillable`, geração automática de slug via `booted()` e relacionamento `hasMany` com Article
    - _Requirements: 2.1_

  - [x] 3.2 Criar model Tag com migration
    - Criar migration com campos: id, name (string, obrigatório), slug (string, único), timestamps
    - Criar model `Tag` com `$fillable`, geração automática de slug via `booted()` e relacionamento `belongsToMany` com Article
    - _Requirements: 2.2_

  - [x] 3.3 Criar model LifePhase com migration
    - Criar migration com campos: id, name (string, obrigatório), slug (string, único), timestamps
    - Criar model `LifePhase` com `$fillable`, geração automática de slug via `booted()` e relacionamento `hasMany` com Article
    - _Requirements: 2.3_

  - [x] 3.4 Criar model Article com migration e relacionamentos
    - Criar migration com campos: id, title (string, obrigatório), body (text), cover_image (string, nullable), status (enum: published/draft, padrão draft), category_id (FK), life_phase_id (FK, nullable), display_order (integer, padrão 0), user_id (integer, padrão 1), timestamps
    - Criar model `Article` com `$fillable`, `$casts`, relacionamentos (belongsTo Category, belongsTo LifePhase, belongsToMany Tags) e scope `published`
    - _Requirements: 2.4, 2.7_

  - [x] 3.5 Criar migration da tabela pivot article_tag
    - Criar migration com campos: article_id (FK para articles), tag_id (FK para tags), índice composto único
    - _Requirements: 2.5_

  - [x] 3.6 Criar seeders com dados de exemplo em português
    - Criar `CategorySeeder` com pelo menos 3 categorias (Menstruação, Contracepção, Bem-estar)
    - Criar `TagSeeder` com pelo menos 5 tags
    - Criar `LifePhaseSeeder` com pelo menos 3 fases de vida (Adolescência, Gestação, Menopausa)
    - Criar `ArticleSeeder` com pelo menos 5 artigos relacionados
    - Configurar `DatabaseSeeder` para executar todos os seeders
    - _Requirements: 2.6_

  - [ ]* 3.7 Escrever testes de property para geração de slug
    - **Property 1: Geração de slug é determinística e consistente**
    - Testar que para qualquer string de nome válida, o slug gerado contém apenas caracteres minúsculos, hífens e dígitos
    - Testar idempotência: mesma entrada gera mesmo slug
    - Executar 100 iterações com nomes gerados via Faker
    - **Validates: Requirements 2.1, 2.2, 2.3, 3.2, 4.2, 5.2**

- [x] 4. Checkpoint - Verificar models e migrations
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. API CRUD de Categorias, Tags e Fases de Vida
  - [x] 5.1 Criar CategoryController com Form Requests, Resource e rotas
    - Criar `CategoryResource` para transformação de dados JSON
    - Criar `StoreCategoryRequest` com validação (name required, slug unique)
    - Criar `UpdateCategoryRequest` com validação (name required, slug unique exceto self)
    - Criar `CategoryController` com métodos: index, store, show, update, destroy
    - Registrar rotas `apiResource('categories', CategoryController::class)` em `routes/api.php`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_

  - [x] 5.2 Criar TagController com Form Requests, Resource e rotas
    - Criar `TagResource`, `StoreTagRequest`, `UpdateTagRequest`
    - Criar `TagController` com métodos CRUD completos
    - Registrar rotas `apiResource('tags', TagController::class)`
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8_

  - [x] 5.3 Criar LifePhaseController com Form Requests, Resource e rotas
    - Criar `LifePhaseResource`, `StoreLifePhaseRequest`, `UpdateLifePhaseRequest`
    - Criar `LifePhaseController` com métodos CRUD completos
    - Registrar rotas `apiResource('life-phases', LifePhaseController::class)`
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8_

  - [ ]* 5.4 Escrever testes de feature para CRUD de Categorias/Tags/Fases de Vida
    - Testar index retorna lista ordenada por nome
    - Testar store com dados válidos cria recurso e gera slug
    - Testar store sem name retorna 422
    - Testar store com slug duplicado retorna 422
    - Testar show retorna recurso específico
    - Testar update altera dados e retorna 200
    - Testar destroy remove recurso e retorna 204
    - Testar show/update/destroy com id inexistente retorna 404
    - _Requirements: 3.1-3.8, 4.1-4.8, 5.1-5.8_

  - [ ]* 5.5 Escrever teste de property para unicidade de slug
    - **Property 2: Slug único garante unicidade por entidade**
    - Testar que tentativas de criar registros com slug duplicado resultam em erro 422
    - Executar 100 iterações com nomes gerados que podem produzir colisões de slug
    - **Validates: Requirements 3.4, 4.4, 5.4**

- [ ] 6. API CRUD de Artigos
  - [x] 6.1 Criar ArticleController com endpoints admin (CRUD)
    - Criar `ArticleResource` incluindo relacionamentos (category, lifePhase, tags)
    - Criar `StoreArticleRequest` com validação (title required, category_id exists, tag_ids array)
    - Criar `UpdateArticleRequest` com validações equivalentes
    - Criar método `adminIndex` que retorna todos os artigos com relacionamentos, ordenados por display_order
    - Criar métodos `store`, `show`, `update`, `destroy` para admin
    - Registrar rotas admin: `GET/POST /api/admin/articles`, `GET/PUT/DELETE /api/admin/articles/{id}`
    - _Requirements: 6.1, 6.7, 6.10, 6.12, 6.13, 6.14_

  - [x] 6.2 Criar endpoint público de artigos com scope published
    - Criar método `index` que retorna apenas artigos com status "published"
    - Incluir relacionamentos (category, lifePhase, tags) e ordenar por display_order
    - Registrar rota pública: `GET /api/articles`
    - _Requirements: 6.2_

  - [x] 6.3 Implementar filtros de artigos (category_id, tag_id, life_phase_id, status)
    - Adicionar filtro por `category_id` via query parameter
    - Adicionar filtro por `tag_id` via whereHas no relacionamento tags
    - Adicionar filtro por `life_phase_id` via query parameter
    - Adicionar filtro por `status` apenas no endpoint admin
    - _Requirements: 6.3, 6.4, 6.5, 6.6_

  - [x] 6.4 Implementar upload de imagem para cover_image
    - Configurar storage link (`php artisan storage:link`)
    - Implementar upload no método store/update usando disco public
    - Salvar path relativo no campo cover_image
    - _Requirements: 6.8_

  - [x] 6.5 Implementar sincronização de tags (attach/sync)
    - No `store`: attach tag_ids após criação do artigo
    - No `update`: sync tag_ids substituindo associações anteriores
    - No `destroy`: detach todas as tags antes de excluir (ou cascade)
    - _Requirements: 6.9, 6.11, 6.12_

  - [ ]* 6.6 Escrever testes de feature para CRUD de Artigos
    - Testar adminIndex retorna todos os artigos com relacionamentos
    - Testar index público retorna apenas artigos published
    - Testar filtros individualmente e combinados
    - Testar store com dados válidos, upload de imagem e tags
    - Testar update com sincronização de tags
    - Testar destroy remove artigo e associações pivot
    - Testar validações (title required, id inexistente)
    - _Requirements: 6.1-6.14_

  - [ ]* 6.7 Escrever testes de property para artigos
    - **Property 3: Endpoint público retorna apenas artigos publicados**
    - Gerar artigos com status variados, verificar que GET /api/articles nunca retorna drafts
    - **Property 4: Filtros preservam propriedade de subconjunto**
    - Gerar artigos variados, aplicar filtros, verificar que resultados são subconjunto correto
    - **Property 5: Sincronização de tags é idempotente**
    - Aplicar sync com mesmo array repetidamente, verificar estado final idêntico
    - **Property 6: Operações CRUD preservam integridade referencial**
    - Criar artigos com relacionamentos, consultar e verificar integridade
    - Executar 100 iterações por propriedade
    - **Validates: Requirements 6.2, 6.3, 6.4, 6.5, 6.6, 6.9, 6.11, 2.7, 6.7, 6.10**

- [x] 7. Checkpoint - Verificar API completa
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Scaffold do Painel Administrativo Angular
  - [x] 8.1 Criar projeto Angular no diretório `/admin` com Angular Material
    - Criar projeto Angular 18+ com Angular Material configurado
    - Configurar tema Material e importar módulos necessários
    - _Requirements: 7.1_

  - [x] 8.2 Criar componente de layout com sidebar de navegação
    - Criar `LayoutComponent` com `mat-sidenav` contendo links para: Artigos, Categorias, Tags, Fases de Vida
    - Garantir labels em português brasileiro
    - _Requirements: 7.2, 7.3, 7.5_

  - [x] 8.3 Configurar routing, HttpClient e environments
    - Configurar rotas conforme design (articles, categories, tags, life-phases)
    - Configurar `HttpClient` com base URL `http://localhost:8000/api`
    - Criar arquivos de environment com `apiUrl`
    - _Requirements: 7.3, 7.4_

  - [x] 8.4 Criar services (CategoryService, TagService, LifePhaseService, ArticleService)
    - Implementar `CategoryService` com métodos: getAll, getById, create, update, delete
    - Implementar `TagService` com métodos equivalentes
    - Implementar `LifePhaseService` com métodos equivalentes
    - Implementar `ArticleService` com métodos: getAll (com filtros), getById, create (FormData), update (FormData), delete
    - _Requirements: 7.4_

  - [x] 8.5 Criar models (interfaces) e ConfirmDialogComponent
    - Criar interfaces TypeScript: Category, Tag, LifePhase, Article, ArticleFilters
    - Criar `ConfirmDialogComponent` com MatDialog para confirmação de exclusão
    - _Requirements: 7.2_

- [x] 9. Telas Admin para Categorias, Tags e Fases de Vida
  - [x] 9.1 Criar CategoryList e CategoryForm (dialog) components
    - Criar `CategoryListComponent` com `mat-table` (colunas: nome, slug, ações)
    - Criar `CategoryFormComponent` como `MatDialog` com campo nome obrigatório
    - Implementar fluxo completo: listar, criar, editar, excluir com confirmação
    - Exibir mensagens de sucesso e erro via `MatSnackBar`
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_

  - [x] 9.2 Criar TagList e TagForm (dialog) components
    - Replicar padrão CRUD de categorias para tags
    - Criar `TagListComponent` e `TagFormComponent`
    - _Requirements: 8.8_

  - [x] 9.3 Criar LifePhaseList e LifePhaseForm (dialog) components
    - Replicar padrão CRUD de categorias para fases de vida
    - Criar `LifePhaseListComponent` e `LifePhaseFormComponent`
    - _Requirements: 8.8_

- [ ] 10. Tela Admin para Gestão de Artigos
  - [x] 10.1 Criar ArticleListComponent com tabela e filtros
    - Criar tabela com colunas: título, categoria, status, ordem, ações
    - Adicionar filtros por categoria, fase de vida e status acima da tabela
    - Implementar exclusão com diálogo de confirmação
    - _Requirements: 9.1, 9.2, 9.8_

  - [x] 10.2 Criar ArticleFormComponent com editor Quill, upload e selects
    - Criar formulário reativo com: título, editor ngx-quill para corpo HTML, upload de imagem com preview, mat-select para categoria, mat-select para fase de vida, mat-select multiple para tags, campo numérico para display_order, mat-slide-toggle para status
    - Implementar validação inline (título obrigatório)
    - _Requirements: 9.3, 9.4, 9.5, 9.9_

  - [x] 10.3 Integrar formulário de artigos com API (modo criação e edição)
    - Implementar modo criação: enviar FormData para POST /api/admin/articles
    - Implementar modo edição: carregar dados existentes, enviar PUT com FormData
    - Carregar tags pré-selecionadas no modo edição
    - Exibir mensagens de sucesso/erro e tratar erros 422 por campo
    - _Requirements: 9.6, 9.7, 9.10_

- [x] 11. Checkpoint - Verificar painel admin completo
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. Integração com App Mobile
  - [x] 12.1 Criar ArticleService e models no app mobile
    - Criar interface `Article` e `Category` em `src/app/models/`
    - Criar `ArticleService` com métodos: `getPublishedArticles(categoryId?)` e `getArticleById(id)`
    - Configurar base URL para `http://localhost:8000/api`
    - _Requirements: 10.1_

  - [x] 12.2 Refatorar Tab3 para carregar artigos da API com abas de categoria
    - Injetar `ArticleService` na Tab3Page
    - Carregar categorias da API para gerar abas dinâmicas
    - Exibir artigos filtrados por categoria selecionada
    - Exibir cards com: título, trecho (150 chars sem HTML) e imagem de capa
    - Substituir conteúdo estático por artigos dinâmicos
    - _Requirements: 10.1, 10.2, 10.3, 10.8_

  - [x] 12.3 Criar ArticleDetailPage com renderização HTML
    - Criar página de detalhe em `tab3/article-detail/`
    - Configurar rota `article/:id` no tab3-routing
    - Renderizar corpo HTML do artigo usando `DomSanitizer.bypassSecurityTrustHtml`
    - Preservar formatação, links e imagens inline
    - _Requirements: 10.4, 10.5_

  - [x] 12.4 Adicionar estados de loading e tratamento de erros
    - Implementar `ion-skeleton-text` durante carregamento
    - Exibir mensagem de erro amigável com botão "Tentar Novamente" em caso de falha
    - Tratar navegação de volta quando artigo não é encontrado
    - _Requirements: 10.6, 10.7_

- [x] 13. Checkpoint Final - Verificar integração completa
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties (slug generation, published filtering, tag sync, referential integrity)
- Unit/feature tests validate specific examples and edge cases
- The backend (Tasks 1-7) and admin scaffold (Task 8) can be developed in parallel
- The admin CRUD screens (Tasks 9-10) depend on both the API and admin scaffold being ready
- Mobile integration (Task 12) depends on the articles API being complete
- PHP with Laravel is used for backend; Angular 18+ with Angular Material for admin; Ionic/Angular for mobile

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "8.1"] },
    { "id": 1, "tasks": ["1.2", "1.3", "8.2"] },
    { "id": 2, "tasks": ["1.4", "8.3"] },
    { "id": 3, "tasks": ["3.1", "3.2", "3.3", "8.4", "8.5"] },
    { "id": 4, "tasks": ["3.4", "3.5"] },
    { "id": 5, "tasks": ["3.6", "3.7"] },
    { "id": 6, "tasks": ["5.1", "5.2", "5.3"] },
    { "id": 7, "tasks": ["5.4", "5.5"] },
    { "id": 8, "tasks": ["6.1", "6.2"] },
    { "id": 9, "tasks": ["6.3", "6.4", "6.5"] },
    { "id": 10, "tasks": ["6.6", "6.7", "9.1"] },
    { "id": 11, "tasks": ["9.2", "9.3", "12.1"] },
    { "id": 12, "tasks": ["10.1", "12.2"] },
    { "id": 13, "tasks": ["10.2"] },
    { "id": 14, "tasks": ["10.3", "12.3"] },
    { "id": 15, "tasks": ["12.4"] }
  ]
}
```
