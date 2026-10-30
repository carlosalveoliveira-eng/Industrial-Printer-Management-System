# Sistema de Gestão e Inspeção de Impressoras (Arquitetura Custo Zero - Firebase Spark)

Adaptação do sistema para operação 100% gratuita, sem contratação de planos pagos, sem associação de cartão de crédito e sem ativação do plano Firebase Blaze.

## Alinhamento Financeiro e Arquitetural (Custo Zero)

> [!IMPORTANT]
> **Garantia de Gratuidade e Verificação de Restrições:**
> 
> 1. **Plano Firebase Spark (100% Gratuito):**
>    - **Sem Cartão de Crédito:** O plano Spark do Firebase não exige cadastro de cartão de crédito nem ativação de conta de faturamento (Billing).
>    - **Limites da Camada Gratuita do Cloud Firestore:**
>      - **Armazenamento:** 1 GiB total de dados (suficiente para mais de 100.000 laudos de texto).
>      - **Leituras diárias:** 50.000 documentos/dia (muito acima do tráfego de inspeções de uma fábrica).
>      - **Gravações diárias:** 20.000 documentos/dia.
>      - **Exclusões diárias:** 20.000 documentos/dia.
>      - **Usuários de Autenticação:** Até 50.000 usuários ativos mensais gratuitos no Firebase Auth.
> 2. **Sem Serviços Pagos ou Cloud Run Pago:**
>    - O frontend React roda como Single Page Application (SPA). A persistência e o compartilhamento de dados entre celular (iPhone) e computador ocorrem diretamente via SDK cliente do Firebase conectado ao Firestore, eliminando a necessidade de manter um container Cloud Run backend pago rodando 24/7.
> 3. **Preservação Integral do Projeto Existente:**
>    - Toda a interface rica já construída (cartões de impressoras, checklist ergonômico, guia técnico de calibração Zebra/Elgin, simulador de diagnóstico de rede, modal de laudo com compartilhamento via WhatsApp e exportação CSV para Excel) será preservada e conectada aos serviços do Firebase.
> 4. **Carga dos 28 Ativos Reais (PDF):**
>    - As 28 impressoras industriais listadas no documento oficial (ABATE, Desossa, Secundária, Almoxarifado, Tendal, etc.) serão migradas para a coleção `printers` no Firestore no primeiro acesso.

---

## 1. Visão Geral da Arquitetura Custo Zero

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       ARQUITETURA FIREBASE SPARK (GRÁTIS)                   │
└─────────────────────────────────────────────────────────────────────────────┘

 [ iPhone / Safari ]       [ Android / Chrome ]       [ Computador Windows ]
         │                          │                           │
         └──────────────────────────┼───────────────────────────┘
                                    │ HTTPS (SDK Oficial do Firebase)
                                    ▼
       ┌─────────────────────────────────────────────────────────────┐
       │                   GOOGLE FIREBASE (PLANO SPARK)             │
       ├─────────────────────────────────────────────────────────────┤
       │ 1. Firebase Authentication                                  │
       │    • Login Seguro (Google Login / E-mail e Senha)           │
       │    • Sessão persistente sem expiração acidental             │
       ├─────────────────────────────────────────────────────────────┤
       │ 2. Cloud Firestore (Banco de Dados em Tempo Real)           │
       │    • Coleção: /printers (28 impressoras industriais)        │
       │    • Coleção: /sectors (Setores padronizados da fábrica)    │
       │    • Coleção: /inspections (Histórico imutável de laudos)   │
       │    • Coleção: /users (Perfis: Administrador/Técnico/Consulta│
       │    • Cache offline nativo no navegador do iPhone            │
       ├─────────────────────────────────────────────────────────────┤
       │ 3. Firebase Security Rules (firestore.rules)                │
       │    • Controle de acesso estrito (RBAC) no servidor          │
       │    • Prevenção de escrita não autenticada e adulteração     │
       └─────────────────────────────────────────────────────────────┘
```

---

## 2. Estrutura do Banco de Dados no Cloud Firestore

O Firestore organizará as entidades em coleções globais compartilhadas:

### 2.1. Coleção `printers` (Impressoras)
- `id` (string): Identificador único da impressora.
- `name` (string): Nome da impressora (ex.: `01-PRZEBRA-ABT-RASTRE-CALHA`).
- `sector` (string): Setor fabril (ex.: `ABATE`, `Desossa`, `Secundaria`).
- `model` (string): Modelo (ex.: `ZDesigner ZT230-200dpi ZPL`).
- `ip` (string): Endereço IP (ex.: `172.16.40.32`).
- `serial` (string): Número de série (ex.: `52N221600464`).
- `patrimony` (string): Número de inventário/patrimônio (ex.: `NFBBRPR9311`).
- `connectionType` (string): `'ethernet'`, `'wifi'`, `'usb'`.
- `active` (boolean): Status do cadastro (ativo/inativo).
- `createdAt` (timestamp): Data e hora de criação.
- `updatedAt` (timestamp): Última atualização cadastral.

### 2.2. Coleção `inspections` (Inspeções e Laudos)
- `id` (string): Identificador único do laudo.
- `printerId` (string): Chave de relacionamento com `printers`.
- `date` (string): Data da inspeção (`YYYY-MM-DD`).
- `tech` (string): Nome do técnico responsável.
- `userId` (string): UID do usuário autenticado no Firebase.
- `power` (string): `'Sim'` | `'Não'`.
- `printing` (string): `'Sim'` | `'Não'` | `'Não testado'`.
- `quality` (string): `'Boa'` | `'Regular'` | `'Ruim'`.
- `physical` (string): `'Bom'` | `'Regular'` | `'Ruim'`.
- `problemType` (string): Categoria do problema diagnosticado.
- `errorMessage` (string): Detalhes do defeito/erro observado.
- `actionNeeded` (string): Ação corretiva realizada ou necessária.
- `priority` (string): `'Baixa'` | `'Média'` | `'Alta'` | `'Crítica'`.
- `resultado` (string): `'Funcionando'` | `'Funcionando com ressalva'` | `'Requer manutenção'` | `'Fora de operação'`.
- `observations` (string): Notas adicionais de campo.
- `createdAt` (timestamp): Timestamp oficial do servidor.

### 2.3. Coleção `sectors` (Setores Fabris)
- `id` (string): Identificador do setor.
- `name` (string): Nome padronizado (`ABATE`, `Desossa`, `Secundaria`, `Almoxarifado`, `Tendal`, etc.).
- `active` (boolean): Se o setor está ativo.

### 2.4. Coleção `users` (Perfis e Papéis)
- `id` (string): UID correspondente ao Firebase Auth.
- `name` (string): Nome do usuário.
- `email` (string): E-mail institucional.
- `role` (string): `'admin'` (Administrador), `'tech'` (Técnico), `'viewer'` (Consulta).

---

## 3. Regras de Segurança do Firestore (`firestore.rules`)

As regras garantirão que:
1. **Ninguém sem autenticação consiga ler ou escrever:** Proíbe scraping e acessos não autorizados.
2. **Perfil 'admin':** Permissão total para criar/editar/excluir impressoras, gerenciar setores e excluir laudos.
3. **Perfil 'tech':** Pode registrar novas inspeções e atualizar dados operacionais das impressoras.
4. **Perfil 'viewer' (Consulta):** Pode apenas ler dados e gerar exportações em CSV, com bloqueio estrito de escrita.
5. **Validação de Schema:** Impede envio de campos inválidos ou dados corrompidos.

---

## 4. Hospedagem Gratuita Sem Cartão de Crédito

Para disponibilizar um link permanente acessível pelo iPhone sem nenhum custo:
- **Firebase Hosting (Gratuito no plano Spark):** 10 GB de armazenamento estático e 360 MB/dia de transferência, com certificado SSL/HTTPS automático e domínio gratuito `*.web.app` e `*.firebaseapp.com` sem exigir cartão de crédito.
- **Alternativas Gratuitas Adicionais:**
  - **Vercel Hobby:** Deploy gratuito e instantâneo a partir do GitHub sem cartão de crédito.
  - **GitHub Pages:** Hospedagem estática 100% gratuita para repositórios.
  - **AI Studio Preview Environment:** O endereço de desenvolvimento atual (`ais-dev-...`) fornecido pelo ambiente.

---

## 5. Roteiro de Implementação Após Aprovação

1. **Configuração do Firebase no Plano Spark:**
   - Acionar o assistente de configuração integrado do Firebase (`show_aistudio_ui` / `ProvisionFirebase`).
   - Gerar `firebase-blueprint.json` e as regras de segurança `firestore.rules`.
2. **Camada de Integração Firebase (`src/services/firebase.ts`):**
   - Inicializar Firebase Auth e Cloud Firestore com persistência offline ativa.
   - Migrar leituras e escritas para o Firestore usando `onSnapshot` (sincronização em tempo real entre todos os dispositivos).
   - Inserir a carga inicial automática das 28 impressoras industriais do PDF.
3. **Interface de Autenticação e Perfis:**
   - Adicionar modal de login simples e elegante com indicação do usuário logado e perfil ativo.
   - Ajustar os botões de ação na interface com base no perfil (desabilitar exclusão para quem é 'Consulta').
4. **Exportação Excel (CSV) Direta do Firestore:**
   - Preservar o gerador de CSV com BOM UTF-8 puxando dados atualizados do banco central.
5. **Entrega da Documentação Obrigatória:**
   - Gerar o documento **`ARQUITETURA_DO_PROJETO.md`** detalhando tecnologias, limites gratuitos, regras de segurança, procedimentos de deploy e manual de operação.
