# Implementation Plan: Calendário Menstrual e Rastreamento de Sintomas

## Overview

Implementação do recurso de calendário menstrual e rastreamento de sintomas para o aplicativo "Minha Saúde Feminina". O backend Laravel já existe (projeto article-management em `/backend`). Esta implementação adiciona modelos, APIs REST (ciclos, predições, sintomas) e refatora o app mobile Ionic/Angular (Tab1, Tab2, FAB) para consumir dados dinâmicos.

## Tasks

- [ ] 1. Models, Migrations e Seeders para Ciclos e Sintomas
  - [x] 1.1 Criar model MenstrualCycle e migração
    - Criar migração com colunas: id, user_id (integer), start_date (date), end_date (date nullable), timestamps
    - Criar model `MenstrualCycle` com `$fillable`, `$casts` para datas e escopo de user_id
    - _Requisitos: 1.1, 1.5_

  - [x] 1.2 Criar model Symptom e migração
    - Criar migração com colunas: id, name (string), icon (string), timestamps
    - Criar model `Symptom` com `$fillable` e relacionamento `logs()` hasMany
    - _Requisitos: 1.2_

  - [x] 1.3 Criar model SymptomLog e migração com relacionamentos
    - Criar migração com colunas: id, user_id (integer), symptom_id (foreign key), log_date (date), intensity (enum: leve, moderado, intenso), notes (text nullable), timestamps
    - Criar model `SymptomLog` com `$fillable`, `$casts`, relacionamento `symptom()` belongsTo
    - _Requisitos: 1.3, 1.6_

  - [x] 1.4 Criar SymptomSeeder com 10 sintomas fixos em português
    - Popular tabela symptoms com: Cólica, Dor de cabeça, Alteração de humor, Inchaço, Acne, Fadiga, Náusea, Dor nas mamas, Insônia, Ansiedade
    - Cada sintoma com ícone Ionicons correspondente
    - _Requisitos: 1.4_

  - [x] 1.5 Executar migrations e verificar seeder
    - Rodar `php artisan migrate` e `php artisan db:seed --class=SymptomSeeder`
    - Verificar que as tabelas foram criadas e os 10 sintomas existem
    - _Requisitos: 1.1, 1.2, 1.3, 1.4_

- [x] 2. API CRUD de Ciclos Menstruais
  - [x] 2.1 Criar regra customizada NoCycleOverlap
    - Implementar `app/Rules/NoCycleOverlap.php` que verifica se novo período não sobrepõe ciclos existentes do user_id = 1
    - Lógica: overlap = (new_start <= existing_end) AND (new_end >= existing_start)
    - Tratar caso onde new_end é null (verificar apenas se start_date está dentro de um ciclo existente)
    - _Requisitos: 2.6_

  - [x] 2.2 Criar StoreCycleRequest e UpdateCycleRequest com validações
    - `StoreCycleRequest`: start_date required|date, end_date nullable|date|after_or_equal:start_date, aplicar NoCycleOverlap
    - `UpdateCycleRequest`: end_date nullable|date|after_or_equal:start_date
    - Mensagens de erro em português
    - _Requisitos: 2.5, 2.6, 2.7_

  - [x] 2.3 Criar MenstrualCycleResource
    - Transformar model em JSON com campos: id, user_id, start_date, end_date, created_at, updated_at
    - _Requisitos: 2.1, 2.2_

  - [x] 2.4 Criar MenstrualCycleController (index, store, update, destroy)
    - `index`: listar ciclos do user_id=1 ordenados por start_date desc
    - `store`: criar ciclo com user_id=1 e start_date, retornar 201
    - `update`: atualizar end_date do ciclo, retornar 200
    - `destroy`: remover ciclo, retornar 200 com mensagem de confirmação
    - _Requisitos: 2.1, 2.2, 2.3, 2.4_

  - [x] 2.5 Registrar rotas de ciclos no api.php
    - Adicionar `Route::apiResource('cycles', MenstrualCycleController::class)->except(['show'])`
    - _Requisitos: 2.1, 2.2, 2.3, 2.4_

  - [ ]* 2.6 Escrever testes de feature para CRUD de ciclos
    - Testar criação com dados válidos (201)
    - Testar rejeição de end_date < start_date (422)
    - Testar rejeição de overlap (422)
    - Testar listagem ordenada
    - Testar atualização e deleção
    - Testar campo obrigatório start_date (422)
    - _Requisitos: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

- [x] 3. Checkpoint - Backend Ciclos
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. API de Predições
  - [x] 4.1 Criar PredictionController com lógica de cálculo
    - Endpoint GET /api/predictions
    - Buscar ciclos do user_id=1 ordenados por start_date desc
    - Retornar JSON com: predicted_next_start, fertile_window_start, fertile_window_end, average_cycle_length, current_phase
    - _Requisitos: 3.1_

  - [x] 4.2 Implementar cálculo de comprimento médio de ciclo
    - Se ≥ 3 ciclos completos: média dos últimos 3 a 6 ciclos (distância entre start_dates consecutivos)
    - Se < 3 ciclos completos: usar 28 dias como padrão
    - Se nenhum ciclo: retornar valores nulos + mensagem
    - _Requisitos: 3.2, 3.3, 3.6_

  - [x] 4.3 Implementar determinação de fase atual
    - Calcular dia_atual = (hoje - último start_date) + 1
    - Menstrual (1-5), Folicular (6-13), Ovulatória (14), Lútea (15+)
    - _Requisitos: 3.5_

  - [x] 4.4 Implementar predição de janela fértil e próximo ciclo
    - predicted_next_start = último start_date + average_cycle_length
    - ovulação = predicted_next_start - 14 dias
    - fertile_window_start = ovulação - 5 dias
    - fertile_window_end = ovulação - 1 dia
    - _Requisitos: 3.4_

  - [x] 4.5 Registrar rota de predições no api.php
    - Adicionar `Route::get('predictions', [PredictionController::class, 'index'])`
    - _Requisitos: 3.1_

  - [ ]* 4.6 Escrever testes de feature para predições
    - Testar com 0 ciclos (valores nulos + mensagem)
    - Testar com 1-2 ciclos (usar 28 dias padrão)
    - Testar com 3+ ciclos (média calculada corretamente)
    - Testar fases do ciclo (Menstrual, Folicular, Ovulatória, Lútea)
    - Testar janela fértil calculada corretamente
    - _Requisitos: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [ ] 5. API de Sintomas e Registros de Sintomas
  - [x] 5.1 Criar SymptomController (index - somente leitura)
    - Endpoint GET /api/symptoms retorna todos os 10 sintomas fixos
    - Usar SymptomResource para transformação
    - _Requisitos: 4.1_

  - [x] 5.2 Criar StoreSymptomLogRequest com validação
    - symptom_id required|exists:symptoms,id
    - log_date required|date
    - intensity required|in:leve,moderado,intenso
    - notes nullable|string
    - Mensagens de erro em português
    - _Requisitos: 4.6, 4.7_

  - [x] 5.3 Criar SymptomResource e SymptomLogResource
    - SymptomResource: id, name, icon
    - SymptomLogResource: id, user_id, symptom_id, symptom (nested), log_date, intensity, notes, timestamps
    - _Requisitos: 4.1, 4.2_

  - [x] 5.4 Criar SymptomLogController (index com filtro de data, store, update, destroy)
    - `index`: filtrar por start_date/end_date opcionais, retornar logs do user_id=1
    - `store`: criar log com user_id=1, retornar 201
    - `update`: atualizar log, retornar 200
    - `destroy`: remover log, retornar 200 com mensagem
    - _Requisitos: 4.2, 4.3, 4.4, 4.5_

  - [x] 5.5 Registrar rotas de sintomas no api.php
    - `Route::get('symptoms', [SymptomController::class, 'index'])`
    - `Route::apiResource('symptom-logs', SymptomLogController::class)->except(['show'])`
    - _Requisitos: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [ ]* 5.6 Escrever testes de feature para sintomas e logs
    - Testar listagem de 10 sintomas
    - Testar criação de log com dados válidos (201)
    - Testar rejeição de intensity inválida (422)
    - Testar rejeição de symptom_id inexistente (422)
    - Testar filtro por intervalo de datas
    - Testar update e delete de logs
    - _Requisitos: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

- [x] 6. Checkpoint - Backend Completo
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Property-Based Tests (Backend)
  - [ ]* 7.1 Escrever PBT para detecção de sobreposição de ciclos
    - **Propriedade 3: Detecção de sobreposição de ciclos**
    - Gerar pares de ciclos com períodos sobrepostos, verificar rejeição 422
    - Gerar pares de ciclos sem sobreposição, verificar aceitação
    - Mínimo 100 iterações
    - **Valida: Requisito 2.6**

  - [ ]* 7.2 Escrever PBT para validação de datas
    - **Propriedade 2: Rejeição de datas inválidas**
    - Gerar pares (start_date, end_date) onde end_date < start_date, verificar rejeição 422
    - Mínimo 100 iterações
    - **Valida: Requisito 2.5**

  - [ ]* 7.3 Escrever PBT para cálculos de predição
    - **Propriedade 4: Consistência da média de ciclos**
    - **Propriedade 5: Corretude do cálculo de fase**
    - **Propriedade 6: Corretude da janela fértil**
    - Gerar históricos de 3-6 ciclos, verificar média calculada corretamente
    - Gerar dias aleatórios 1-35, verificar fase retornada
    - Gerar cycle_lengths aleatórios, verificar datas da janela fértil
    - Mínimo 100 iterações por propriedade
    - **Valida: Requisitos 3.2, 3.4, 3.5**

  - [ ]* 7.4 Escrever PBT para ordenação, filtragem e intensidade
    - **Propriedade 1: Ordenação decrescente de ciclos**
    - **Propriedade 7: Filtragem correta de registros por data**
    - **Propriedade 8: Rejeição de intensidade inválida**
    - Gerar N ciclos aleatórios, verificar ordem decrescente no retorno
    - Gerar logs e ranges de datas, verificar que todos os retornados estão no intervalo
    - Gerar strings aleatórias ≠ "leve"|"moderado"|"intenso", verificar rejeição
    - Mínimo 100 iterações por propriedade
    - **Valida: Requisitos 2.3, 4.3, 4.6**

- [ ] 8. Mobile - Services e Models
  - [x] 8.1 Criar CycleService e interfaces de modelo
    - Criar `src/app/models/cycle.model.ts` com interface MenstrualCycle
    - Criar `src/app/models/prediction.model.ts` com interface CyclePrediction
    - Criar `src/app/services/cycle.service.ts` com métodos: getCycles, createCycle, updateCycle, deleteCycle, getPredictions
    - Configurar baseUrl para apontar ao backend Laravel
    - _Requisitos: 2.1, 2.2, 2.3, 2.4, 3.1_

  - [x] 8.2 Criar SymptomService e interfaces de modelo
    - Criar `src/app/models/symptom.model.ts` com interfaces Symptom, SymptomLog, CreateSymptomLogDto, UpdateSymptomLogDto
    - Criar `src/app/services/symptom.service.ts` com métodos: getSymptoms, getSymptomLogs, createSymptomLog, updateSymptomLog, deleteSymptomLog
    - _Requisitos: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 9. Mobile - Tab2 Calendário Dinâmico
  - [x] 9.1 Refatorar Tab2 para carregar ciclos da API e renderizar calendário
    - Injetar CycleService na Tab2
    - Carregar ciclos do mês atual no `ionViewWillEnter`
    - Implementar grid de calendário com dias do mês
    - _Requisitos: 5.1_

  - [x] 9.2 Implementar navegação de meses (anterior/próximo) com chamadas à API
    - Botões de navegação para mês anterior e próximo
    - Recarregar ciclos ao mudar de mês
    - _Requisitos: 5.2_

  - [x] 9.3 Adicionar marcadores coloridos (rosa=menstruação, laranja=fértil, verde=ovulação)
    - Aplicar classe CSS para dias de menstruação (rosa)
    - Aplicar classe CSS para dias da janela fértil (laranja)
    - Aplicar classe CSS para dia de ovulação (verde)
    - Adicionar legenda com as cores
    - _Requisitos: 5.1, 5.6_

  - [x] 9.4 Adicionar interação de toque para iniciar/encerrar ciclos
    - Toque em dia sem ciclo ativo: criar ciclo com start_date = dia selecionado
    - Toque em dia dentro de ciclo ativo sem end_date: definir end_date = dia selecionado
    - Exibir erro se API falhar, sem alterar estado visual
    - _Requisitos: 5.3, 5.4, 5.5_

- [x] 10. Mobile - Tab1 Hoje Dinâmico
  - [x] 10.1 Refatorar Tab1 para carregar predições da API
    - Injetar CycleService e SymptomService na Tab1
    - Chamar getPredictions no `ionViewWillEnter`
    - _Requisitos: 6.1_

  - [x] 10.2 Exibir dia atual do ciclo, fase e descrição dinamicamente
    - Mostrar dia atual do ciclo (calculado a partir de current_phase e dados)
    - Mostrar nome da fase com descrição explicativa em português
    - _Requisitos: 6.1_

  - [x] 10.3 Exibir cards de predição (próxima menstruação, janela fértil)
    - Card com "Próxima menstruação em X dias"
    - Card com "Janela fértil inicia em X dias"
    - Calcular dias restantes a partir das datas da API
    - _Requisitos: 6.2_

  - [x] 10.4 Exibir registros recentes de sintomas e tratar estados vazios
    - Carregar symptom-logs recentes via SymptomService
    - Exibir lista de sintomas recentes com ícone, nome e intensidade
    - Se API retorna dados insuficientes: exibir mensagem orientativa
    - Todos os textos em português brasileiro
    - _Requisitos: 6.3, 6.4, 6.5_

- [ ] 11. Mobile - Integração FAB
  - [x] 11.1 Conectar FAB "Menstruação" à lógica de iniciar/encerrar ciclo
    - Se não existe ciclo ativo (sem end_date): criar novo ciclo com start_date = hoje
    - Se existe ciclo ativo: encerrar com end_date = hoje
    - Exibir toast de confirmação ou erro
    - _Requisitos: 7.1, 7.2, 7.5_

  - [x] 11.2 Criar SymptomModalComponent com lista de sintomas, seletor de intensidade e notas
    - Criar componente em `src/app/tabs/symptom-modal/`
    - Carregar lista de sintomas da API
    - Formulário reativo com: symptom_id (select), intensity (radio: Leve, Moderado, Intenso), notes (textarea)
    - Todos os rótulos em português brasileiro
    - _Requisitos: 7.3, 7.6_

  - [x] 11.3 Conectar FAB "Sintoma" para abrir modal e submeter à API
    - Abrir modal ao tocar no FAB "Sintoma"
    - Submeter registro via SymptomService com log_date = hoje
    - Fechar modal com confirmação visual ao sucesso
    - _Requisitos: 7.3, 7.4_

  - [x] 11.4 Adicionar estados de loading, tratamento de erros e toasts de confirmação
    - Loading spinner durante requisições
    - Toast de erro se API falhar (manter modal aberto para correção)
    - Toast de sucesso ao registrar menstruação ou sintoma
    - _Requisitos: 7.4, 7.5_

- [x] 12. Checkpoint Final
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tarefas marcadas com `*` são opcionais e podem ser puladas para um MVP mais rápido
- Cada tarefa referencia requisitos específicos para rastreabilidade
- Checkpoints garantem validação incremental
- Testes de propriedade validam propriedades universais de corretude (8 propriedades definidas no design)
- Testes unitários/feature validam exemplos específicos e edge cases
- O backend Laravel já existe em `/backend` — todas as tarefas de backend assumem esse projeto funcional
- O usuário mock usa user_id = 1 em todas as operações (sem autenticação real)
- Todas as mensagens de erro e textos do mobile devem estar em português brasileiro

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3", "8.1", "8.2"] },
    { "id": 1, "tasks": ["1.4", "1.5"] },
    { "id": 2, "tasks": ["2.1", "2.2", "2.3", "5.1", "5.2", "5.3"] },
    { "id": 3, "tasks": ["2.4", "2.5", "5.4", "5.5"] },
    { "id": 4, "tasks": ["2.6", "4.1", "4.2", "4.3", "4.4", "4.5", "5.6"] },
    { "id": 5, "tasks": ["4.6", "7.1", "7.2", "7.3", "7.4"] },
    { "id": 6, "tasks": ["9.1", "10.1"] },
    { "id": 7, "tasks": ["9.2", "9.3", "10.2", "10.3"] },
    { "id": 8, "tasks": ["9.4", "10.4"] },
    { "id": 9, "tasks": ["11.1", "11.2"] },
    { "id": 10, "tasks": ["11.3", "11.4"] }
  ]
}
```
