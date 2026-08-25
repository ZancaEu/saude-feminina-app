# Documento de Requisitos

## Introdução

Este documento define os requisitos para o recurso de Calendário Menstrual e Rastreamento de Sintomas do aplicativo "Minha Saúde Feminina". O recurso abrange a camada de dados (modelos, migrações e seeders), APIs REST para ciclos e sintomas, predições de ciclo, e a integração no aplicativo mobile Ionic/Angular (Tab1 - Hoje, Tab2 - Ciclo, e botões FAB).

## Glossário

- **Sistema**: O conjunto composto pelo backend Laravel e o aplicativo mobile Ionic/Angular
- **API_Ciclos**: Módulo da API REST responsável pelo CRUD de ciclos menstruais
- **API_Sintomas**: Módulo da API REST responsável pela listagem de sintomas e CRUD de registros de sintomas
- **API_Predicoes**: Módulo da API REST responsável por calcular predições de próximo ciclo e janela fértil
- **Calendario**: Componente visual interativo na Tab2 do aplicativo mobile que exibe ciclos menstruais
- **Tela_Hoje**: Componente visual na Tab1 que exibe informações do dia atual do ciclo
- **FAB**: Floating Action Button central do aplicativo com opções de registro rápido
- **Ciclo_Menstrual**: Registro com user_id, start_date, end_date representando um período menstrual
- **Sintoma**: Entidade fixa com nome e ícone, representando um tipo de sintoma rastreável
- **Registro_Sintoma**: Log diário contendo user_id, symptom_id, log_date, intensidade e notas
- **Intensidade**: Classificação do sintoma em três níveis: leve, moderado, intenso
- **Fase_Ciclo**: Uma das quatro fases do ciclo menstrual: Menstrual, Folicular, Ovulatória, Lútea
- **Janela_Fertil**: Período estimado de aproximadamente 5 dias antes da ovulação
- **Usuario_Mock**: Usuário fictício com user_id = 1 utilizado em substituição à autenticação real

## Requisitos

### Requisito 1: Modelos de Dados para Ciclos e Sintomas

**User Story:** Como desenvolvedora, quero que existam modelos de dados estruturados para ciclos menstruais e sintomas, para que o sistema possa armazenar e recuperar informações de saúde de forma consistente.

#### Critérios de Aceitação

1. THE Sistema SHALL fornecer uma migração que crie a tabela `menstrual_cycles` com as colunas: id, user_id (integer), start_date (date), end_date (date nullable), created_at e updated_at
2. THE Sistema SHALL fornecer uma migração que crie a tabela `symptoms` com as colunas: id, name (string), icon (string), created_at e updated_at
3. THE Sistema SHALL fornecer uma migração que crie a tabela `symptom_logs` com as colunas: id, user_id (integer), symptom_id (foreign key para symptoms), log_date (date), intensity (enum: leve, moderado, intenso), notes (text nullable), created_at e updated_at
4. THE Sistema SHALL fornecer um seeder que popule a tabela `symptoms` com exatamente 10 sintomas fixos: Cólica, Dor de cabeça, Alteração de humor, Inchaço, Acne, Fadiga, Náusea, Dor nas mamas, Insônia, Ansiedade
5. THE Sistema SHALL definir o relacionamento no modelo MenstrualCycle onde cada ciclo pertence a um usuário identificado por user_id
6. THE Sistema SHALL definir o relacionamento no modelo SymptomLog onde cada registro pertence a um Sintoma (symptom_id) e a um usuário (user_id)

---

### Requisito 2: API CRUD para Ciclos Menstruais

**User Story:** Como usuária, quero registrar, visualizar e gerenciar meus ciclos menstruais via API, para que meus dados de ciclo sejam persistidos e recuperáveis.

#### Critérios de Aceitação

1. WHEN uma requisição POST é enviada para `/api/cycles` com start_date válida, THEN THE API_Ciclos SHALL criar um novo Ciclo_Menstrual com user_id = 1 e retornar status 201 com o recurso criado em JSON
2. WHEN uma requisição PUT é enviada para `/api/cycles/{id}` com end_date válida, THEN THE API_Ciclos SHALL atualizar o ciclo correspondente e retornar status 200 com o recurso atualizado em JSON
3. WHEN uma requisição GET é enviada para `/api/cycles`, THEN THE API_Ciclos SHALL retornar status 200 com a lista de todos os ciclos do Usuario_Mock ordenados por start_date decrescente em JSON
4. WHEN uma requisição DELETE é enviada para `/api/cycles/{id}`, THEN THE API_Ciclos SHALL remover o ciclo correspondente e retornar status 200 com mensagem de confirmação
5. WHEN uma requisição tenta criar ou atualizar um ciclo onde end_date é anterior a start_date, THEN THE API_Ciclos SHALL rejeitar a requisição com status 422 e mensagem de erro descritiva em JSON
6. WHEN uma requisição tenta criar um ciclo cujo período (start_date até end_date) sobrepõe um ciclo existente do mesmo usuário, THEN THE API_Ciclos SHALL rejeitar a requisição com status 422 e mensagem indicando sobreposição
7. WHEN uma requisição tenta criar um ciclo sem o campo start_date, THEN THE API_Ciclos SHALL rejeitar a requisição com status 422 e mensagem indicando campo obrigatório

---

### Requisito 3: API de Predições de Ciclo

**User Story:** Como usuária, quero receber predições sobre meu próximo ciclo e janela fértil, para que eu possa me planejar com base no meu histórico.

#### Critérios de Aceitação

1. WHEN uma requisição GET é enviada para `/api/predictions`, THEN THE API_Predicoes SHALL retornar status 200 com JSON contendo: predicted_next_start (data), fertile_window_start (data), fertile_window_end (data), average_cycle_length (inteiro) e current_phase (string)
2. WHILE o Usuario_Mock possui 3 ou mais ciclos completos registrados, THE API_Predicoes SHALL calcular o comprimento médio do ciclo usando os últimos 3 a 6 ciclos completos (com start_date e end_date preenchidos)
3. WHILE o Usuario_Mock possui menos de 3 ciclos completos registrados, THE API_Predicoes SHALL utilizar 28 dias como comprimento padrão do ciclo para todas as predições
4. THE API_Predicoes SHALL estimar a ovulação no dia 14 do ciclo previsto e a Janela_Fertil como os 5 dias imediatamente anteriores à data estimada de ovulação
5. WHEN o cálculo de fase atual é solicitado, THEN THE API_Predicoes SHALL determinar a Fase_Ciclo atual com base na posição do dia corrente dentro do ciclo: Menstrual (dias 1-5), Folicular (dias 6-13), Ovulatória (dia 14), Lútea (dias 15 até fim do ciclo)
6. IF nenhum ciclo está registrado para o Usuario_Mock, THEN THE API_Predicoes SHALL retornar status 200 com valores nulos para as predições e uma mensagem indicando dados insuficientes

---

### Requisito 4: API para Sintomas e Registros de Sintomas

**User Story:** Como usuária, quero consultar a lista de sintomas disponíveis e registrar meus sintomas diários com intensidade e notas, para acompanhar padrões de saúde ao longo do tempo.

#### Critérios de Aceitação

1. WHEN uma requisição GET é enviada para `/api/symptoms`, THEN THE API_Sintomas SHALL retornar status 200 com a lista completa dos 10 sintomas fixos em JSON, cada um contendo id, name e icon
2. WHEN uma requisição POST é enviada para `/api/symptom-logs` com symptom_id, log_date e intensity válidos, THEN THE API_Sintomas SHALL criar um novo Registro_Sintoma com user_id = 1 e retornar status 201 com o recurso criado em JSON
3. WHEN uma requisição GET é enviada para `/api/symptom-logs` com parâmetros opcionais start_date e end_date, THEN THE API_Sintomas SHALL retornar status 200 com os registros de sintomas do Usuario_Mock filtrados pelo intervalo de datas em JSON
4. WHEN uma requisição PUT é enviada para `/api/symptom-logs/{id}` com dados válidos, THEN THE API_Sintomas SHALL atualizar o registro correspondente e retornar status 200 com o recurso atualizado em JSON
5. WHEN uma requisição DELETE é enviada para `/api/symptom-logs/{id}`, THEN THE API_Sintomas SHALL remover o registro correspondente e retornar status 200 com mensagem de confirmação
6. WHEN uma requisição tenta criar um registro de sintoma com intensity diferente de "leve", "moderado" ou "intenso", THEN THE API_Sintomas SHALL rejeitar a requisição com status 422 e mensagem de erro indicando valores permitidos
7. WHEN uma requisição tenta criar um registro de sintoma com symptom_id inexistente, THEN THE API_Sintomas SHALL rejeitar a requisição com status 422 e mensagem de erro indicando sintoma inválido

---

### Requisito 5: Calendário Dinâmico no Mobile (Tab2)

**User Story:** Como usuária, quero visualizar meus ciclos menstruais em um calendário interativo e registrar início/fim de menstruação tocando nos dias, para ter uma visão visual clara do meu histórico.

#### Critérios de Aceitação

1. WHEN a Tab2 é carregada, THEN THE Calendario SHALL buscar os ciclos do mês exibido via API e renderizar os dias de menstruação com marcador rosa, dias da janela fértil com marcador laranja e dia de ovulação com marcador verde
2. WHEN a usuária navega para o mês anterior ou próximo, THEN THE Calendario SHALL carregar os ciclos correspondentes ao novo mês via API e atualizar a visualização
3. WHEN a usuária toca em um dia sem ciclo ativo, THEN THE Calendario SHALL iniciar um novo ciclo com start_date igual ao dia selecionado via chamada à API_Ciclos
4. WHEN a usuária toca em um dia dentro de um ciclo ativo sem end_date, THEN THE Calendario SHALL registrar o end_date do ciclo ativo como o dia selecionado via chamada à API_Ciclos
5. WHEN a API retorna erro ao registrar um ciclo, THEN THE Calendario SHALL exibir uma mensagem de erro ao usuário sem alterar o estado visual do calendário
6. THE Calendario SHALL exibir uma legenda com as cores: rosa para Menstruação, laranja para Fértil, verde para Ovulação

---

### Requisito 6: Tela "Hoje" Dinâmica no Mobile (Tab1)

**User Story:** Como usuária, quero ver informações atualizadas sobre meu ciclo atual ao abrir o aplicativo, para entender rapidamente em que fase estou e o que esperar.

#### Critérios de Aceitação

1. WHEN a Tab1 é carregada, THEN THE Tela_Hoje SHALL buscar os dados de predições via API_Predicoes e exibir o dia atual do ciclo, a fase atual e a descrição da fase
2. WHEN a Tab1 é carregada, THEN THE Tela_Hoje SHALL exibir cards informativos com a previsão de próxima menstruação (em dias) e início da janela fértil (em dias) baseados nos dados da API_Predicoes
3. WHEN a Tab1 é carregada, THEN THE Tela_Hoje SHALL exibir os registros recentes de sintomas do Usuario_Mock obtidos da API_Sintomas
4. IF a API_Predicoes retorna valores nulos por dados insuficientes, THEN THE Tela_Hoje SHALL exibir mensagem orientando a usuária a registrar ciclos para obter predições
5. THE Tela_Hoje SHALL exibir todos os textos e rótulos em português brasileiro

---

### Requisito 7: Integração dos Botões FAB

**User Story:** Como usuária, quero usar os botões de ação rápida para registrar menstruação e sintomas de forma ágil, para manter meus registros atualizados com poucos toques.

#### Critérios de Aceitação

1. WHEN a usuária toca no botão FAB "Menstruação" e não existe ciclo ativo sem end_date, THEN THE FAB SHALL iniciar um novo ciclo com start_date igual à data atual via chamada à API_Ciclos e exibir confirmação visual
2. WHEN a usuária toca no botão FAB "Menstruação" e existe um ciclo ativo sem end_date, THEN THE FAB SHALL encerrar o ciclo ativo com end_date igual à data atual via chamada à API_Ciclos e exibir confirmação visual
3. WHEN a usuária toca no botão FAB "Sintoma", THEN THE FAB SHALL abrir um modal contendo a lista de sintomas disponíveis obtida da API_Sintomas, seletor de Intensidade (leve, moderado, intenso) e campo de notas (texto livre)
4. WHEN a usuária preenche o modal de sintoma e confirma, THEN THE FAB SHALL enviar o registro via API_Sintomas com log_date igual à data atual e fechar o modal com confirmação visual
5. IF a API retorna erro durante o registro via FAB, THEN THE FAB SHALL exibir mensagem de erro descritiva e manter o modal aberto para correção
6. WHEN o modal de sintoma é aberto, THEN THE FAB SHALL exibir todos os rótulos em português brasileiro e a intensidade com as opções "Leve", "Moderado" e "Intenso"
