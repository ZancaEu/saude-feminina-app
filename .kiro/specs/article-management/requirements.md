# Documento de Requisitos: Gestão de Artigos

## Introdução

Este documento especifica os requisitos para a funcionalidade de Gestão de Artigos do aplicativo "Minha Saúde Feminina". A funcionalidade abrange a criação do backend Laravel como API REST, modelos de dados para o ecossistema de artigos, endpoints CRUD completos, painel administrativo Angular para gerenciamento de conteúdo, e integração com o app mobile Ionic existente (Tab3 - Conteúdos). O objetivo é substituir o conteúdo estático atual por artigos dinâmicos gerenciados via painel administrativo.

## Glossário

- **API_Backend**: Aplicação Laravel localizada em `/backend` que serve como API REST para o sistema de artigos.
- **Painel_Admin**: Aplicação Angular localizada em `/admin` com Angular Material para gerenciamento de conteúdo.
- **App_Mobile**: Aplicação Ionic/Angular existente na raiz do repositório (Tab3 - Conteúdos).
- **Artigo**: Entidade principal contendo título, corpo HTML, imagem de capa, status, categoria, fase de vida e tags.
- **Categoria**: Classificação primária de artigos (ex: Menstruação, Contracepção).
- **Tag**: Rótulo secundário para artigos, com relação muitos-para-muitos.
- **Fase_de_Vida**: Classificação por fase da vida feminina (ex: Adolescência, Gestação, Menopausa).
- **Slug**: Identificador único em formato URL-friendly gerado a partir do nome.
- **Status_Artigo**: Estado de publicação do artigo, podendo ser "published" (publicado) ou "draft" (rascunho).
- **Display_Order**: Campo numérico que define a ordem de exibição dos artigos.
- **Endpoint_Público**: Endpoint da API acessível sem autenticação que retorna apenas artigos publicados.
- **Endpoint_Admin**: Endpoint da API para o painel administrativo que retorna todos os artigos independente do status.
- **Editor_Rich_Text**: Editor de texto rico (Quill ou similar) para edição do corpo do artigo em HTML.
- **Health_Check**: Endpoint de verificação de saúde da API que confirma que o servidor está operacional.
- **CORS**: Cross-Origin Resource Sharing, configuração que permite requisições de origens diferentes (localhost Angular e Ionic).

## Requisitos

### Requisito 1: Scaffold do Backend Laravel

**User Story:** Como desenvolvedor, eu quero um projeto Laravel configurado como API REST em `/backend`, para que eu tenha a infraestrutura base para servir os endpoints de artigos.

#### Critérios de Aceitação

1. WHEN o comando de instalação do Laravel é executado, THE API_Backend SHALL criar um projeto Laravel funcional no diretório `/backend` com configuração para API REST.
2. WHEN a API_Backend é iniciada, THE API_Backend SHALL utilizar SQLite como banco de dados padrão para ambiente de desenvolvimento.
3. WHEN uma requisição é feita de `localhost:4200` ou `localhost:8100`, THE API_Backend SHALL aceitar a requisição via configuração CORS para origens localhost.
4. WHEN uma requisição GET é feita para `/api/health`, THE API_Backend SHALL retornar uma resposta JSON com status 200 contendo `{"status": "ok"}`.
5. WHEN qualquer requisição é feita para a API, THE API_Backend SHALL retornar respostas exclusivamente no formato JSON seguindo convenções REST.

### Requisito 2: Modelos de Dados do Ecossistema de Artigos

**User Story:** Como desenvolvedor, eu quero modelos, migrations e seeders para Categorias, Tags, Fases de Vida e Artigos, para que a estrutura de dados suporte todo o ecossistema de conteúdo.

#### Critérios de Aceitação

1. WHEN a migration de categorias é executada, THE API_Backend SHALL criar a tabela `categories` com campos: id, name (string, obrigatório), slug (string, único), timestamps.
2. WHEN a migration de tags é executada, THE API_Backend SHALL criar a tabela `tags` com campos: id, name (string, obrigatório), slug (string, único), timestamps.
3. WHEN a migration de fases de vida é executada, THE API_Backend SHALL criar a tabela `life_phases` com campos: id, name (string, obrigatório), slug (string, único), timestamps.
4. WHEN a migration de artigos é executada, THE API_Backend SHALL criar a tabela `articles` com campos: id, title (string, obrigatório), body (text, HTML), cover_image (string, nullable), status (enum: published/draft, padrão draft), category_id (FK para categories), life_phase_id (FK para life_phases, nullable), display_order (integer, padrão 0), user_id (integer, padrão 1), timestamps.
5. WHEN a migration da tabela pivot é executada, THE API_Backend SHALL criar a tabela `article_tag` com campos: article_id (FK para articles), tag_id (FK para tags), com índice composto único.
6. WHEN os seeders são executados, THE API_Backend SHALL popular o banco de dados com dados de exemplo em português incluindo pelo menos 3 categorias, 5 tags, 3 fases de vida e 5 artigos.
7. WHEN o modelo Article é consultado, THE API_Backend SHALL disponibilizar os relacionamentos: belongsTo Category, belongsTo LifePhase, belongsToMany Tags.

### Requisito 3: API CRUD de Categorias

**User Story:** Como administrador do painel, eu quero endpoints CRUD para categorias, para que eu possa gerenciar dinamicamente as classificações de artigos.

#### Critérios de Aceitação

1. WHEN uma requisição GET é feita para `/api/categories`, THE API_Backend SHALL retornar uma lista JSON de todas as categorias ordenadas por nome.
2. WHEN uma requisição POST é feita para `/api/categories` com campo name preenchido, THE API_Backend SHALL criar uma nova categoria gerando o slug automaticamente a partir do name.
3. WHEN uma requisição POST é feita para `/api/categories` sem o campo name, THE API_Backend SHALL retornar status 422 com mensagem de erro específica para o campo name.
4. WHEN uma requisição POST é feita para `/api/categories` com um slug que já existe, THE API_Backend SHALL retornar status 422 com mensagem de erro indicando que o slug já está em uso.
5. WHEN uma requisição PUT é feita para `/api/categories/{id}` com dados válidos, THE API_Backend SHALL atualizar a categoria correspondente e retornar os dados atualizados.
6. WHEN uma requisição DELETE é feita para `/api/categories/{id}`, THE API_Backend SHALL remover a categoria e retornar status 204.
7. WHEN uma requisição GET é feita para `/api/categories/{id}`, THE API_Backend SHALL retornar os dados da categoria específica com status 200.
8. IF uma requisição referencia uma categoria com id inexistente, THEN THE API_Backend SHALL retornar status 404 com mensagem de erro apropriada.

### Requisito 4: API CRUD de Tags

**User Story:** Como administrador do painel, eu quero endpoints CRUD para tags, para que eu possa gerenciar os rótulos disponíveis para artigos.

#### Critérios de Aceitação

1. WHEN uma requisição GET é feita para `/api/tags`, THE API_Backend SHALL retornar uma lista JSON de todas as tags ordenadas por nome.
2. WHEN uma requisição POST é feita para `/api/tags` com campo name preenchido, THE API_Backend SHALL criar uma nova tag gerando o slug automaticamente a partir do name.
3. WHEN uma requisição POST é feita para `/api/tags` sem o campo name, THE API_Backend SHALL retornar status 422 com mensagem de erro específica para o campo name.
4. WHEN uma requisição POST é feita para `/api/tags` com um slug que já existe, THE API_Backend SHALL retornar status 422 com mensagem de erro indicando que o slug já está em uso.
5. WHEN uma requisição PUT é feita para `/api/tags/{id}` com dados válidos, THE API_Backend SHALL atualizar a tag correspondente e retornar os dados atualizados.
6. WHEN uma requisição DELETE é feita para `/api/tags/{id}`, THE API_Backend SHALL remover a tag e retornar status 204.
7. WHEN uma requisição GET é feita para `/api/tags/{id}`, THE API_Backend SHALL retornar os dados da tag específica com status 200.
8. IF uma requisição referencia uma tag com id inexistente, THEN THE API_Backend SHALL retornar status 404 com mensagem de erro apropriada.

### Requisito 5: API CRUD de Fases de Vida

**User Story:** Como administrador do painel, eu quero endpoints CRUD para fases de vida, para que eu possa gerenciar as classificações por fase da vida feminina.

#### Critérios de Aceitação

1. WHEN uma requisição GET é feita para `/api/life-phases`, THE API_Backend SHALL retornar uma lista JSON de todas as fases de vida ordenadas por nome.
2. WHEN uma requisição POST é feita para `/api/life-phases` com campo name preenchido, THE API_Backend SHALL criar uma nova fase de vida gerando o slug automaticamente a partir do name.
3. WHEN uma requisição POST é feita para `/api/life-phases` sem o campo name, THE API_Backend SHALL retornar status 422 com mensagem de erro específica para o campo name.
4. WHEN uma requisição POST é feita para `/api/life-phases` com um slug que já existe, THE API_Backend SHALL retornar status 422 com mensagem de erro indicando que o slug já está em uso.
5. WHEN uma requisição PUT é feita para `/api/life-phases/{id}` com dados válidos, THE API_Backend SHALL atualizar a fase de vida correspondente e retornar os dados atualizados.
6. WHEN uma requisição DELETE é feita para `/api/life-phases/{id}`, THE API_Backend SHALL remover a fase de vida e retornar status 204.
7. WHEN uma requisição GET é feita para `/api/life-phases/{id}`, THE API_Backend SHALL retornar os dados da fase de vida específica com status 200.
8. IF uma requisição referencia uma fase de vida com id inexistente, THEN THE API_Backend SHALL retornar status 404 com mensagem de erro apropriada.

### Requisito 6: API CRUD de Artigos

**User Story:** Como administrador do painel, eu quero endpoints CRUD completos para artigos com filtros, upload de imagem e gestão de tags, para que eu possa gerenciar todo o conteúdo editorial da aplicação.

#### Critérios de Aceitação

1. WHEN uma requisição GET é feita para `/api/admin/articles`, THE API_Backend SHALL retornar todos os artigos independente do status, incluindo relacionamentos com categoria, fase de vida e tags, ordenados por display_order.
2. WHEN uma requisição GET é feita para `/api/articles`, THE API_Backend SHALL retornar apenas artigos com status "published", incluindo relacionamentos, ordenados por display_order.
3. WHEN uma requisição GET para artigos inclui o parâmetro `category_id`, THE API_Backend SHALL filtrar os resultados retornando apenas artigos da categoria especificada.
4. WHEN uma requisição GET para artigos inclui o parâmetro `tag_id`, THE API_Backend SHALL filtrar os resultados retornando apenas artigos que possuam a tag especificada.
5. WHEN uma requisição GET para artigos inclui o parâmetro `life_phase_id`, THE API_Backend SHALL filtrar os resultados retornando apenas artigos da fase de vida especificada.
6. WHEN uma requisição GET para artigos inclui o parâmetro `status`, THE API_Backend SHALL filtrar os resultados retornando apenas artigos com o status especificado (apenas no endpoint admin).
7. WHEN uma requisição POST é feita para `/api/admin/articles` com dados válidos, THE API_Backend SHALL criar um novo artigo com user_id fixo igual a 1 e retornar os dados do artigo criado com status 201.
8. WHEN uma requisição POST para artigos inclui um arquivo de imagem no campo `cover_image`, THE API_Backend SHALL armazenar a imagem no storage público do Laravel (disco local) e salvar o path no campo cover_image.
9. WHEN uma requisição POST para artigos inclui um array de tag_ids, THE API_Backend SHALL associar as tags especificadas ao artigo via tabela pivot article_tag.
10. WHEN uma requisição PUT é feita para `/api/admin/articles/{id}` com dados válidos, THE API_Backend SHALL atualizar o artigo e seus relacionamentos de tags.
11. WHEN uma requisição PUT para artigos inclui um array de tag_ids, THE API_Backend SHALL sincronizar as tags do artigo substituindo associações anteriores pelas novas.
12. WHEN uma requisição DELETE é feita para `/api/admin/articles/{id}`, THE API_Backend SHALL remover o artigo e suas associações na tabela pivot, retornando status 204.
13. WHEN uma requisição POST para artigos é feita sem o campo title, THE API_Backend SHALL retornar status 422 com mensagem de erro específica para o campo title.
14. IF uma requisição referencia um artigo com id inexistente, THEN THE API_Backend SHALL retornar status 404 com mensagem de erro apropriada.

### Requisito 7: Scaffold do Painel Administrativo

**User Story:** Como desenvolvedor, eu quero um projeto Angular com Angular Material em `/admin`, para que eu tenha a infraestrutura base do painel de gerenciamento de conteúdo.

#### Critérios de Aceitação

1. WHEN o projeto admin é criado, THE Painel_Admin SHALL ser um projeto Angular 18+ no diretório `/admin` com Angular Material configurado.
2. WHEN o Painel_Admin é acessado, THE Painel_Admin SHALL exibir um layout com sidebar de navegação contendo links para: Artigos, Categorias, Tags e Fases de Vida.
3. WHEN um link da sidebar é clicado, THE Painel_Admin SHALL navegar para a rota correspondente sem recarregar a página.
4. WHEN o Painel_Admin faz requisições HTTP, THE Painel_Admin SHALL utilizar HttpClient configurado com base URL apontando para a API Laravel em `http://localhost:8000/api`.
5. WHEN o Painel_Admin é carregado, THE Painel_Admin SHALL exibir labels e textos da interface em português brasileiro.

### Requisito 8: Telas Admin para Categorias, Tags e Fases de Vida

**User Story:** Como administrador, eu quero telas de listagem, criação, edição e exclusão para categorias, tags e fases de vida, para que eu possa gerenciar essas entidades sem acesso direto ao banco de dados.

#### Critérios de Aceitação

1. WHEN o administrador acessa a seção de categorias, THE Painel_Admin SHALL exibir uma tabela listando todas as categorias com colunas: nome, slug e ações (editar, excluir).
2. WHEN o administrador clica no botão "Nova Categoria", THE Painel_Admin SHALL exibir um formulário com campo nome obrigatório.
3. WHEN o administrador submete o formulário de criação com dados válidos, THE Painel_Admin SHALL enviar a requisição para a API, exibir mensagem de sucesso e atualizar a lista.
4. WHEN o administrador clica em editar uma categoria, THE Painel_Admin SHALL exibir o formulário preenchido com os dados atuais da categoria.
5. WHEN o administrador clica em excluir uma categoria, THE Painel_Admin SHALL exibir um diálogo de confirmação antes de realizar a exclusão.
6. WHEN a exclusão é confirmada, THE Painel_Admin SHALL enviar a requisição DELETE para a API, exibir mensagem de sucesso e atualizar a lista.
7. IF uma operação na API retorna erro, THEN THE Painel_Admin SHALL exibir mensagem de erro com detalhes do problema.
8. THE Painel_Admin SHALL replicar o mesmo padrão de telas CRUD (listagem, criação, edição, exclusão com confirmação) para as entidades Tags e Fases de Vida.

### Requisito 9: Tela Admin para Gestão de Artigos

**User Story:** Como administrador, eu quero uma tela completa de gerenciamento de artigos com editor rich-text, upload de imagem e gestão de relacionamentos, para que eu possa criar e manter o conteúdo editorial.

#### Critérios de Aceitação

1. WHEN o administrador acessa a seção de artigos, THE Painel_Admin SHALL exibir uma tabela listando artigos com colunas: título, categoria, status, ordem e ações.
2. WHEN a lista de artigos é exibida, THE Painel_Admin SHALL disponibilizar filtros por categoria, fase de vida e status acima da tabela.
3. WHEN o administrador clica no botão "Novo Artigo", THE Painel_Admin SHALL exibir um formulário contendo: campo título, Editor_Rich_Text para o corpo, upload de imagem de capa, select de categoria, select de fase de vida, multi-select de tags, campo numérico para ordem de exibição e toggle de status (rascunho/publicado).
4. WHEN o administrador edita o corpo do artigo, THE Painel_Admin SHALL fornecer um Editor_Rich_Text (Quill ou similar) que produz conteúdo HTML.
5. WHEN o administrador seleciona uma imagem de capa, THE Painel_Admin SHALL fazer upload do arquivo para a API e exibir preview da imagem.
6. WHEN o administrador submete o formulário de artigo com dados válidos, THE Painel_Admin SHALL enviar os dados para a API incluindo as tags selecionadas e exibir mensagem de sucesso.
7. WHEN o administrador clica em editar um artigo existente, THE Painel_Admin SHALL carregar todos os dados do artigo no formulário incluindo tags pré-selecionadas e corpo HTML no editor.
8. WHEN o administrador clica em excluir um artigo, THE Painel_Admin SHALL exibir um diálogo de confirmação antes de realizar a exclusão.
9. IF o formulário de artigo é submetido sem o campo título preenchido, THEN THE Painel_Admin SHALL exibir validação inline impedindo o envio.
10. IF a API retorna erro de validação (422), THEN THE Painel_Admin SHALL exibir as mensagens de erro específicas por campo.

### Requisito 10: Integração com App Mobile

**User Story:** Como usuária do aplicativo, eu quero visualizar artigos dinâmicos na aba Conteúdos filtrados por categoria, para que eu tenha acesso a informações atualizadas sobre saúde feminina.

#### Critérios de Aceitação

1. WHEN a Tab3 (Conteúdos) é carregada, THE App_Mobile SHALL fazer uma requisição GET para o Endpoint_Público de artigos e exibir os artigos retornados.
2. WHEN a usuária seleciona uma aba de categoria (ex: Menstruação, Contracepção), THE App_Mobile SHALL filtrar os artigos exibidos enviando o parâmetro `category_id` correspondente para a API.
3. WHEN os artigos são exibidos na lista, THE App_Mobile SHALL mostrar para cada artigo: título, trecho do corpo (primeiros 150 caracteres sem tags HTML) e imagem de capa quando disponível.
4. WHEN a usuária toca em um artigo da lista, THE App_Mobile SHALL navegar para uma página de detalhe exibindo o conteúdo HTML completo do artigo renderizado adequadamente.
5. WHEN a página de detalhe do artigo é exibida, THE App_Mobile SHALL renderizar o corpo HTML do artigo preservando formatação, links e imagens inline.
6. WHILE a API está carregando dados, THE App_Mobile SHALL exibir um indicador de carregamento (skeleton ou spinner).
7. IF a requisição para a API falha, THEN THE App_Mobile SHALL exibir uma mensagem de erro amigável com opção de tentar novamente.
8. WHEN a Tab3 é carregada e a API retorna dados com sucesso, THE App_Mobile SHALL substituir o conteúdo estático atual por artigos dinâmicos da API.
