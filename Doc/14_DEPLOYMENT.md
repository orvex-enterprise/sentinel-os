# Sentinel OS — Enterprise Deployment & Infrastructure Architecture Specification (Engineering Implementation Contract)

> **Document Class:** Definitive Engineering Reference & Implementation Contract  
> **Audience:** Chief Cloud Architects, Principal Platform Engineers, Distinguished Kubernetes Architects, Principal AI Infrastructure Engineers, Enterprise DevOps Leads, and Site Reliability Engineers (SREs)  
> **Status:** Authoritative — Version 2.0 (Exhaustive Enterprise Specification)  
> **Last Updated:** 2026-07-03  
> **Parent Documents:**  
> - [00_MASTER_CONTEXT.md](../architecture/00_MASTER_CONTEXT.md)  
> - [01_PROJECT_VISION.md](../architecture/01_PROJECT_VISION.md)  
> - [02_PRODUCT_REQUIREMENTS.md](../architecture/02_PRODUCT_REQUIREMENTS.md)  
> - [03_ARCHITECTURE.md](../architecture/03_ARCHITECTURE.md)  
> - [04_DATABASE.md](../architecture/04_DATABASE.md)  
> - [05_API_SPEC.md](../architecture/05_API_SPEC.md)  
> - [06_CAPABILITY_SPECIFICATIONS.md](../architecture/06_CAPABILITY_SPECIFICATIONS.md)  
> - [07_WORKFLOW_ENGINE.md](../architecture/07_WORKFLOW_ENGINE.md)  
> - [08_AGENT_SPECIFICATIONS.md](./08_AGENT_SPECIFICATIONS.md)  
> - [09_TOOLING_AND_MCP.md](./09_TOOLING_AND_MCP.md)  
> - [10_PROMPT_ENGINEERING.md](./10_PROMPT_ENGINEERING.md)  
> - [11_KNOWLEDGE_SYSTEM.md](./11_KNOWLEDGE_SYSTEM.md)  
> - [12_SECURITY.md](./12_SECURITY.md)  
> - [13_OBSERVABILITY.md](./13_OBSERVABILITY.md)  
> - [15_ARCHITECTURE_DECISIONS.md](../adr/15_ARCHITECTURE_DECISIONS.md)  
>  
> **Binding Architecture Decisions (ADRs):**  
> ADR-001 (Event-Driven Architecture), ADR-002 (Five-Layer Architecture), ADR-004 (Business Case Core Object), ADR-005 (Execution Orchestrator Pattern), ADR-006 (Single LangGraph Workflow), ADR-007 (Stateless Capabilities), ADR-008 (Human Approval Gateway), ADR-011 (Unified Knowledge Graph & Vector Hybrid Engine), ADR-012 (Shared Schemas Package), ADR-014 (Stateless Tool Sandbox & Model Context Protocol Standard), ADR-016 (Multi-Tier Enterprise Memory Hierarchy), ADR-019 (Enterprise Knowledge Definition Language & Compiler Pipeline)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)  
   1.1 [Definitive Deployment Mandate & Scope](#11-definitive-deployment-mandate--scope)  
   1.2 [Architecture Alignment & Binding ADR Contract](#12-architecture-alignment--binding-adr-contract)  
   1.3 [Deployment Target Taxonomy](#13-deployment-target-taxonomy)  
2. [Deployment Philosophy](#2-deployment-philosophy)  
   2.1 [Treat Deployment as a First-Class Engineering Subsystem](#21-treat-deployment-as-a-first-class-engineering-subsystem)  
   2.2 [Immutable Infrastructure & Ephemeral Compute](#22-immutable-infrastructure--ephemeral-compute)  
   2.3 [GitOps Single Source of Truth](#23-gitops-single-source-of-truth)  
   2.4 [Zero-Trust Network & Compute Isolation](#24-zero-trust-network--compute-isolation)  
   2.5 [Automated Failure Containment & Blast Radius Minimization](#25-automated-failure-containment--blast-radius-minimization)  
3. [Environment Strategy (Local, Dev, QA, Staging, Production, DR)](#3-environment-strategy-local-dev-qa-staging-production-dr)  
   3.1 [Environment Matrix & Progression Topology](#31-environment-matrix--progression-topology)  
   3.2 [Local Development Environment (`docker-compose.yml` & DevContainers)](#32-local-development-environment-docker-composeyml--devcontainers)  
   3.3 [Development & Integration Environment (`dev`)](#33-development--integration-environment-dev)  
   3.4 [Quality Assurance & Chaos Testing Tier (`qa`)](#34-quality-assurance--chaos-testing-tier-qa)  
   3.5 [Staging & Pre-Production Environment (`staging`)](#35-staging--pre-production-environment-staging)  
   3.6 [Production Multi-Region Environment (`prod`)](#36-production-multi-region-environment-prod)  
   3.7 [Cold/Warm Disaster Recovery Environment (`dr`)](#37-coldwarm-disaster-recovery-environment-dr)  
4. [Monorepo Build Architecture](#4-monorepo-build-architecture)  
   4.1 [Workspace Structure & Package Dependency Graph](#41-workspace-structure--package-dependency-graph)  
   4.2 [Polyglot Build Pipeline (TypeScript/Node.js & Python 3.12)](#42-polyglot-build-pipeline-typescriptnodejs--python-312)  
   4.3 [Multi-Stage Container Image Compilation & OCI Packaging](#43-multi-stage-container-image-compilation--oci-packaging)  
   4.4 [Artifact Caching, SBOM Generation & Supply Chain Security](#44-artifact-caching-sbom-generation--supply-chain-security)  
5. [Docker Architecture](#5-docker-architecture)  
   5.1 [Base Image Standardization & Hardening Matrix](#51-base-image-standardization--hardening-matrix)  
   5.2 [Container Runtime Security & Privilege Restrictions](#52-container-runtime-security--privilege-restrictions)  
   5.3 [Local Orchestration with Docker Compose (`docker-compose.yml`)](#53-local-orchestration-with-docker-compose-docker-composeyml)  
   5.4 [Container Resource Limits & Memory Governance](#54-container-resource-limits--memory-governance)  
6. [Kubernetes Architecture](#6-kubernetes-architecture)  
   6.1 [Cluster Topology & Node Pool Taxonomy](#61-cluster-topology--node-pool-taxonomy)  
   6.2 [Namespace Taxonomy & Multitenant Isolation](#62-namespace-taxonomy--multitenant-isolation)  
   6.3 [Workload Management: Deployments, StatefulSets, DaemonSets, Jobs](#63-workload-management-deployments-statefulsets-daemonsets-jobs)  
   6.4 [Helm Chart Hierarchy & Umbrella Chart Design](#64-helm-chart-hierarchy--umbrella-chart-design)  
   6.5 [ArgoCD GitOps Reconciliation Architecture](#65-argocd-gitops-reconciliation-architecture)  
7. [Service Topology](#7-service-topology)  
8. [AI Runtime Deployment](#8-ai-runtime-deployment)  
9. [Data Platform Deployment](#9-data-platform-deployment)  
10. [Event Platform Deployment](#10-event-platform-deployment)  
11. [Networking Architecture](#11-networking-architecture)  
12. [Security & Secrets Deployment](#12-security--secrets-deployment)  
13. [CI/CD Architecture](#13-cicd-architecture)  
14. [Infrastructure as Code (Terraform)](#14-infrastructure-as-code-terraform)  
15. [High Availability & Resilience](#15-high-availability--resilience)  
16. [Autoscaling Strategy](#16-autoscaling-strategy)  
17. [Backup & Disaster Recovery](#17-backup--disaster-recovery)  
18. [Cost Optimization](#18-cost-optimization)  
19. [Operational Runbooks](#19-operational-runbooks)  
20. [Deployment Governance](#20-deployment-governance)  
21. [Future Evolution](#21-future-evolution)  

---

## 1. Executive Summary

### 1.1 Definitive Deployment Mandate & Scope

Sentinel OS is an autonomous enterprise business execution platform engineered to continuously ingest operational telemetry across domains (inventory, sales, logistics, finance), identify anomalies, investigate relational root causes, generate structured remediation plans, and execute state mutations against systems of record after securing explicit human authorization. Because Sentinel OS exercises active, transactional write authority against core mission-critical enterprise systems (such as SAP, Salesforce, Oracle, and custom WMS/ERP databases), **deployment is not merely an operational mechanism for running software—it is an active security, reliability, and governance boundary.**

The deployment specification defined herein establishes the authoritative engineering mandates governing how every subsystem of Sentinel OS is built, packaged, verified, deployed, scaled, isolated, monitored, and restored across its entire lifecycle. Traditional web application deployment paradigms—characterized by shared compute clusters, permissive egress routing, monolithic state storage, and ad-hoc continuous integration scripts—are categorically insufficient for an autonomous multi-agent AI operating system. 

```mermaid
graph TB
    subgraph ControlPlane["GitOps & Infrastructure Control Plane"]
        GitRepo["Git Monorepo (Source of Truth)"]
        ArgoCD["ArgoCD GitOps Controller"]
        TFE["Terraform Cloud / Atlantis IaC Engine"]
        Vault["HashiCorp Vault Secret Cluster"]
    end

    subgraph Cluster["Multi-Region Kubernetes Enterprise Platform"]
        subgraph ComputeTier["Stateless Compute Tier (Ephemeral / Non-Root)"]
            Dashboard["sentinel-dashboard (Next.js SSR)"]
            APIGW["sentinel-api-gateway (Node.js/Fastify)"]
            Orch["sentinel-orchestration-engine (Python 3.12 / LangGraph)"]
            Comp["sentinel-knowledge-compiler (Python 3.12 Batch Workers)"]
        end

        subgraph SandTier["Isolated Tool Execution Tier (Seccomp / gVisor)"]
            Sandbox["sentinel-tool-sandbox (Ephemeral MCP Runtime)"]
        end

        subgraph AITier["Hardware Accelerated AI Inference Tier (GPU Node Pool)"]
            VLLM["sentinel-vllm / Triton Inference Cluster (NVIDIA H100/A100)"]
        end

        subgraph DataTier["Stateful Data & Event Tier (Encrypted / Replicated)"]
            PG["sentinel-postgres (Relational Case & Checkpoint Store)"]
            RD["sentinel-redis (Streaming Event Bus & Pub/Sub)"]
            QD["sentinel-qdrant (Distributed Vector Index Cluster)"]
            NJ["sentinel-neo4j (Causal Knowledge Graph Cluster)"]
        end
    end

    GitRepo -->|Declarative Manifests| ArgoCD
    GitRepo -->|HCL Infrastructure State| TFE
    ArgoCD -->|Reconcile State| Cluster
    TFE -->|Provision Infrastructure| Cluster
    Vault -->|Dynamic mTLS / DB Credentials| Cluster

    APIGW -->|REST / WebSocket| Dashboard
    APIGW -->|Business Events| RD
    RD -->|Stream Consumption| Orch
    Orch -->|State Checkpointing| PG
    Orch -->|Semantic Queries| QD & NJ
    Orch -->|Execute Tools via Isolated mTLS| Sandbox
    Orch -->|LLM Inference Request| VLLM
```

This specification establishes strict engineering requirements across seven dimensions:
1. **Zero-Trust Compute Isolation:** Every autonomous agent processing untrusted data or executing tools must run within ephemeral, hardened container environments enforced by kernel-level Linux Security Modules (Seccomp, AppArmor, SELinux) and microVM sandboxing (gVisor/Kata Containers).
2. **Strict Declarative GitOps Governance:** All infrastructure provisioning, network policy enforcement, and Kubernetes workload definitions must be declared as version-controlled code, reconciled continuously via automated GitOps controllers without human operator intervention in staging or production.
3. **Stateful Data Tier Partitioning:** Complete physical and logical isolation between operational relational transactions (PostgreSQL), high-throughput event streaming (Redis/Kafka), high-dimensional vector embeddings (Qdrant), and complex causal enterprise graphs (Neo4j).
4. **Deterministic AI Runtime Orchestration:** Hardware-aware GPU node scheduling, model weight pre-fetching, dynamic KV-cache management, and multi-tier model routing failover ensuring bounded Time to First Token (TTFT) and Inter-Token Latency (ITL).
5. **High Availability & Blast Radius Containment:** Cell-based multi-region failover architectures, rigorous circuit-breaking matrices, and automated progressive canary deployments guaranteed by automated SLO health verification.
6. **Immutable Audit Provenance:** Cryptographically attested software supply chain artifacts (SLSA Level 3 compliance) ensuring every container running in production traces directly to an immutable Git commit and signed SBOM.
7. **Complete Operational Recovery:** Mathematical modeling of Disaster Recovery targets enforcing Recovery Point Objectives (RPO) < 5 minutes and Recovery Time Objectives (RTO) < 30 minutes under complete regional datacenter loss.

### 1.2 Architecture Alignment & Binding ADR Contract

Every deployment topology and configuration parameter mandated in this specification directly enforces foundational architectural decisions documented across the Sentinel OS master engineering repository. No deployment implementation may deviate from or bypass these binding contracts:

| Binding ADR / Document | Title / Architecture Domain | Deployment Enforcement Mechanism |
| :--- | :--- | :--- |
| **ADR-001** | Event-Driven Architecture | Deployment of high-availability Redis Streams / Apache Kafka clusters with persistent WAL disks, strict consumer group lag monitoring, and automated Dead Letter Queue (DLQ) routing. |
| **ADR-002** | Five-Layer Architecture | Kubernetes NetworkPolicies and eBPF service mesh enforcement forbidding network ingress/egress layer-skipping (e.g., UI layer pods cannot reach Layer 4 Storage pods directly). |
| **ADR-004** | Business Case Core Object | PostgreSQL primary-replica topologies optimized for high-throughput append-only transaction writing with continuous Point-in-Time Recovery (PITR) WAL archiving. |
| **ADR-006** | Single LangGraph Workflow | Stateless Python orchestration worker pods scaling horizontally via KEDA based on active LangGraph thread count and Redis stream depth, backed by PostgreSQL state checkpointers. |
| **ADR-007** | Stateless Capabilities | Mandatory zero-local-storage container policies (`readOnlyRootFilesystem: true`) for all orchestration and capability agent pods; session affinity strictly prohibited. |
| **ADR-008** | Human Approval Gateway | Dedicated immutable audit logging pipelines and network egress controls blocking agent execution tool triggers until cryptographic approval tokens are validated by the API Gateway. |
| **ADR-011** | Unified Knowledge Graph & Vector Engine | Co-deployment of distributed Qdrant HNSW vector clusters and Neo4j Causal Graph clusters with dedicated NVMe storage classes and memory-mapped RAM configurations. |
| **ADR-014** | Stateless Tool Sandbox & MCP Standard | Isolation of `sentinel-tool-sandbox` execution workers inside dedicated Kubernetes node pools running gVisor microVM runtimes with strict egress network policies. |
| **ADR-016** | Multi-Tier Enterprise Memory Hierarchy | Redis cluster caching topologies coupled with background workers executing scheduled consolidation scripts against PostgreSQL and Qdrant storage tiers. |
| **ADR-019** | EKDL & Compiler Pipeline | Dedicated asynchronous batch processing worker pods (`sentinel-knowledge-compiler`) scheduled on high-memory compute nodes with read-write access to Object Storage. |

### 1.3 Deployment Target Taxonomy

To support the diverse lifecycle stages of an enterprise AI operating system, Sentinel OS defines six distinct deployment target topologies. Each target is engineered to balance developer velocity, infrastructure cost, operational fidelity, and security strictness:

```
+------------------------------------------------------------------------------------------------------------------+
|                                      SENTINEL OS DEPLOYMENT TARGET TAXONOMY                                      |
+-----------------------------------+-----------------------------------+------------------------------------------+
| TARGET TIER                       | INFRASTRUCTURE SUBSTRATE          | PRIMARY OPERATIONAL MANDATE              |
+-----------------------------------+-----------------------------------+------------------------------------------+
| 1. Local Development (local)      | Docker Compose / DevContainers    | Single-command developer boot (<90 sec); |
|                                   | on Developer Laptop (Mac/Win/Linux)| local Ollama/Mock LLM endpoints.         |
+-----------------------------------+-----------------------------------+------------------------------------------+
| 2. Development Integration (dev)  | Shared Single-Region K8s Cluster  | Continuous deployment from main branch;  |
|                                   | (AWS EKS / GCP GKE)               | automated end-to-end integration tests.  |
+-----------------------------------+-----------------------------------+------------------------------------------+
| 3. Quality Assurance (qa)         | Isolated K8s Cluster Namespace    | Deterministic replay testing; chaos fault|
|                                   | with Synthetic Data Mirror        | injection; benchmark SLA validation.     |
+-----------------------------------+-----------------------------------+------------------------------------------+
| 4. Staging / Pre-Prod (staging)   | Production-Mirror K8s Cluster     | Production parity verification; dry-run  |
|                                   | with Read-Only ERP Sandbox Hooks  | enterprise integrations; security audit. |
+-----------------------------------+-----------------------------------+------------------------------------------+
| 5. Production Multi-Region (prod) | Multi-Region Active-Active/Passive| Zero-downtime blue/green & canary roll-  |
|                                   | High-Availability K8s Enterprise  | outs; 99.99% uptime SLA; GPU scheduling. |
+-----------------------------------+-----------------------------------+------------------------------------------+
| 6. Disaster Recovery (dr)         | Cross-Cloud / Cross-Region Standby| Cold/Warm replica state synchronization; |
|                                   | K8s Infrastructure Substrate      | automated failover execution (<30 min).  |
+-----------------------------------+-----------------------------------+------------------------------------------+
```

---

## 2. Deployment Philosophy

### 2.1 Treat Deployment as a First-Class Engineering Subsystem

In Sentinel OS, infrastructure is not treated as static operational wiring assembled after software compilation; it is an active, deterministic, and version-controlled engineering subsystem. The deployment pipeline, container specifications, Kubernetes manifests, and infrastructure configuration files are subject to identical rigorous engineering standards as core algorithmic agent code:
* **Peer Review & Static Analysis:** Every infrastructure change requires mandatory multi-party code review, static security linting (via Checkov, Trivy, and Kube-Linter), and dry-run infrastructure execution plans before merge.
* **Hermetic & Reproducible Execution:** A deployment build executed from a specific Git commit SHA must produce identical cryptographic container images, configuration maps, and infrastructure structures regardless of the build environment or execution time.
* **Automated Regression Verification:** Deployment configurations are continuously verified against regression harnesses that simulate network partitions, pod crashes, storage exhaustion, and LLM inference timeouts.

### 2.2 Immutable Infrastructure & Ephemeral Compute

Sentinel OS strictly prohibits in-place server modification, live container patching, or ad-hoc shell execution within runtime environments:
* **Complete Container Immutability:** All container images built by the CI pipeline are tagged with their exact Git commit SHA and an unforgeable cryptographic signature (Sigstore Cosign). The use of mutable tags (`latest`, `staging`, `v1`) is strictly forbidden in Kubernetes workload manifests.
* **Read-Only Root Filesystems:** Every stateless pod running in Sentinel OS enforces `readOnlyRootFilesystem: true` in its container security context. Any runtime write operations required for temporary scratch space must explicitly mount volume-bounded, RAM-backed `emptyDir` mounts (`medium: Memory`) subject to strict disk quotas.
* **Zero Runtime Drift:** Compute instances and Kubernetes pods are treated as disposable compute units. If a container exhibits unexpected behavioral drift or memory anomalies, it is immediately terminated and replaced by the scheduler rather than patched or debugged in place.

### 2.3 GitOps Single Source of Truth

All state mutations applied to staging and production infrastructure must originate from version-controlled Git repositories through automated GitOps reconciliation controllers (ArgoCD):

```mermaid
sequenceDiagram
    autonumber
    actor Dev as Platform Engineer
    participant Git as Git Config Repository
    participant Argo as ArgoCD Controller
    participant K8s as Kubernetes Cluster
    participant OPA as OPA Gatekeeper Policy

    Dev->>Git: Push PR with Helm / Manifest Updates
    Git->>Git: Execute Automated CI Lint & Policy Check
    Dev->>Git: Merge PR to main / staging / prod branch
    Argo->>Git: Poll Commit SHA / Receive Webhook Trigger
    Argo->>Argo: Compare Git Manifests vs. Cluster State
    Argo->>K8s: Submit Reconciled Resources via Kubernetes API
    K8s->>OPA: Intercept Request for Zero-Trust Validation
    alt Policy Violation (e.g. Root User / Missing Limits)
        OPA-->>K8s: Deny Admission Request
        K8s-->>Argo: Report Sync Failure Status
        Argo-->>Dev: Alert Slack / PagerDuty on Sync Error
    else Policy Validated
        OPA->>K8s: Allow Admission Request
        K8s->>K8s: Rolling Update Workload Pods
        K8s-->>Argo: Report Healthy Reconciled Status
    end
```

* **No Direct Cluster Access:** Human operators, CI/CD runners, and developers are forbidden from holding direct write permissions (`kubectl apply`, `helm upgrade`, `edit`, `delete`) against staging and production clusters. Break-glass emergency access requires multi-factor cryptographic authorization, automated session recording, and automatic revocation after 60 minutes.
* **Automated Self-Healing Reconciliations:** ArgoCD operates with automated self-healing enabled (`selfHeal: true`). Any manual configuration drift executed via unauthorized cluster manipulation is automatically reverted within 180 seconds to match the Git repository state.

### 2.4 Zero-Trust Network & Compute Isolation

Because Sentinel OS autonomous agents ingest external unstructured events and construct dynamic tool payloads, the infrastructure assumes that individual application pods could face hostile injection attempts or execution hijacking:
* **MicroVM Tool Sandboxing:** All third-party tools, custom scripts, and external API connectors executed by the `sentinel-tool-sandbox` run within hardened gVisor (`runsc`) or Kata Containers microVM boundaries. This isolates the host kernel from potential escapes or syscall exploits.
* **Default-Deny Network Microsegmentation:** Every namespace enforces a default-deny ingress and egress NetworkPolicy. Communication between microservices requires explicit, directional cryptographic authorization via eBPF service mesh mutual TLS (mTLS), where identity is verified via SPIFFE/SPIRE workload attestation rather than IP addresses.
* **Privilege Drop & Non-Root Enforcement:** All containers run under explicit, non-privileged user accounts (`runAsUser: 10001`, `runAsNonRoot: true`). All Linux capabilities are explicitly dropped (`capabilities: drop: ["ALL"]`), forbidding privilege escalation (`allowPrivilegeEscalation: false`).

### 2.5 Automated Failure Containment & Blast Radius Minimization

The deployment topology enforces structural bulkhead boundaries to ensure that localized resource exhaustion or software faults cannot cascade across the enterprise platform:
* **Domain & Cell Isolation:** Core services are partitioned into isolated Kubernetes namespaces and dedicated node pools. A CPU or memory spike caused by a complex root-cause analysis workflow in `sentinel-orchestration-engine` cannot starve compute resources allocated to real-time event ingestion in `sentinel-api-gateway`.
* **Resource Quotas & Limit Ranges:** Every namespace operates under strict `ResourceQuota` allocations bounding total CPU cores, GPU units, memory gigabytes, and persistent storage volumes. Every pod definition must declare explicit requests and limits (`requests == limits` for guaranteed Quality of Service pods).
* **Multi-Tier Circuit Breaking:** Service mesh sidecars (Cilium/Envoy) continuously monitor HTTP/gRPC error rates and latency histograms. If an upstream service or third-party LLM inference provider exhibits >5% failure rate or latency exceeding 4,000ms over a 10-second window, the circuit breaker opens automatically, immediately shedding traffic and routing to deterministic local fallback handlers.

---

## 3. Environment Strategy (Local, Dev, QA, Staging, Production, DR)

### 3.1 Environment Matrix & Progression Topology

To guarantee software reliability across progressive stages of validation, Sentinel OS defines six standardized operating environments. Code artifacts progress through these environments strictly via immutable container image digests:

| Environment | Deployment Mechanism | Compute Substrate | State Storage Architecture | External Integration Mode | Primary SLA / RTO Target |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Local** | `docker-compose.yml` | Laptop CPU/RAM (Docker Desktop / Colima) | Ephemeral local volume mounts (`./data/pg`) | Mocked API endpoints / Local Ollama LLM | Best effort (Dev boot < 90s) |
| **Dev** | GitHub Actions -> ArgoCD | EKS/GKE Dev Cluster (Shared Node Pools) | Shared Managed RDS / Redis / Qdrant Instances | Dev-Tier Sandbox ERP/WMS Hooks | 99.0% Uptime (Business hours) |
| **QA** | ArgoCD Auto-Sync | EKS/GKE QA Cluster (Isolated Namespaces) | Dedicated QA State Databases with Synthetic Seed | QA-Tier Sandbox API Endpoints | 99.5% Uptime / Automated Replay |
| **Staging** | ArgoCD Manual Promotion | EKS/GKE Pre-Prod Cluster (Exact Prod Mirror) | Staging Databases with Anonymized Prod Snapshot | Read-Only Prod ERP Hooks / Dry-Run | 99.9% Uptime / Pre-Prod Sign-off |
| **Prod** | Argo Rollouts (Canary) | Multi-Region EKS/GKE Dedicated Nodes + GPU | Multi-Region Active Replicated Databases | Live Enterprise Systems of Record | 99.99% Uptime / RTO < 30m |
| **DR** | Automated Failover Engine | Standby Cloud Region EKS/GKE Infrastructure | Continuous Asynchronous Cross-Region Replicas | Live Standby Switchover Hooks | RPO < 5m / RTO < 30m |

### 3.2 Local Development Environment (`docker-compose.yml` & DevContainers)

The local development environment is engineered to provide complete architectural parity with production while running within resource constraints of a standard engineering workstation (32GB RAM, 8 CPU cores). It launches all core microservices, stateful dependencies, and local AI runtimes without requiring external internet connectivity or paid cloud API tokens.

#### Engineering Rationale & Tradeoffs
* **Why Docker Compose Over Local Kubernetes (Minikube/Kind):** Running a 10-pod microservice topology alongside local PostgreSQL, Redis, Qdrant, Neo4j, and Ollama within Minikube incurs massive virtualization overhead (~8GB RAM lost to Kubernetes control plane and virtual network layers). Docker Compose provides direct host kernel container sharing, allowing developers to boot the entire Sentinel OS stack in under 90 seconds while consuming <12GB RAM total.
* **Tradeoff:** Docker Compose does not test Kubernetes RBAC, network policies, or horizontal pod autoscaling. These concerns are explicitly delegated to the `dev` and `qa` cluster environments.

#### Authoritative Local Infrastructure Specification (`infra/docker-compose.yml`)
The local stack architecture defines explicit container ordering, health checks, and resource bounds:

```yaml
version: '3.8'

networks:
  sentinel-local:
    driver: bridge
    ipam:
      config:
        - subnet: 172.28.0.0/16

volumes:
  pg_data:
  redis_data:
  qdrant_data:
  neo4j_data:
  ollama_data:

services:
  postgres:
    image: postgres:16-alpine
    container_name: sentinel-local-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: sentinel_core
      POSTGRES_USER: sentinel
      POSTGRES_PASSWORD: sentinel_dev_password
    ports:
      - "5432:5432"
    volumes:
      - pg_data:/var/lib/postgresql/data
      - ../infra/seed/inventory_seed.sql:/docker-entrypoint-initdb.d/10_seed.sql:ro
    networks:
      - sentinel-local
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U sentinel -d sentinel_core"]
      interval: 5s
      timeout: 5s
      retries: 5
    deploy:
      resources:
        limits:
          cpus: '1.5'
          memory: 2G

  redis:
    image: redis:7-alpine
    container_name: sentinel-local-redis
    restart: unless-stopped
    command: redis-server --appendonly yes --requirepass sentinel_redis_dev
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - sentinel-local
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "sentinel_redis_dev", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G

  qdrant:
    image: qdrant/qdrant:v1.9.0
    container_name: sentinel-local-qdrant
    restart: unless-stopped
    ports:
      - "6333:6333"
      - "6334:6334"
    volumes:
      - qdrant_data:/qdrant/storage
    networks:
      - sentinel-local
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:6333/readyz || exit 1"]
      interval: 5s
      timeout: 3s
      retries: 5
    deploy:
      resources:
        limits:
          cpus: '1.5'
          memory: 2G

  neo4j:
    image: neo4j:5.20-community
    container_name: sentinel-local-neo4j
    restart: unless-stopped
    environment:
      NEO4J_AUTH: neo4j/sentinel_graph_dev
      NEO4J_PLUGINS: '["apoc"]'
    ports:
      - "7474:7474"
      - "7687:7687"
    volumes:
      - neo4j_data:/data
    networks:
      - sentinel-local
    healthcheck:
      test: ["CMD-SHELL", "wget --no-verbose --tries=1 --spider localhost:7474 || exit 1"]
      interval: 10s
      timeout: 5s
      retries: 5
    deploy:
      resources:
        limits:
          cpus: '1.5'
          memory: 2G

  ollama:
    image: ollama/ollama:latest
    container_name: sentinel-local-ollama
    restart: unless-stopped
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama
    networks:
      - sentinel-local
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 4G

  orchestration-service:
    build:
      context: ../
      dockerfile: ai/Dockerfile
      target: development
    container_name: sentinel-local-orchestration
    restart: unless-stopped
    environment:
      ENVIRONMENT: local
      DATABASE_URL: postgresql+asyncpg://sentinel:sentinel_dev_password@postgres:5432/sentinel_core
      REDIS_URL: redis://:sentinel_redis_dev@redis:6379/0
      QDRANT_URL: http://qdrant:6333
      NEO4J_URI: bolt://neo4j:7687
      NEO4J_PASSWORD: sentinel_graph_dev
      OLLAMA_BASE_URL: http://ollama:11434
    ports:
      - "5000:5000"
    volumes:
      - ../ai:/app/ai:ro
      - ../packages:/app/packages:ro
    networks:
      - sentinel-local
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
      qdrant:
        condition: service_healthy
      neo4j:
        condition: service_healthy

  api-gateway:
    build:
      context: ../
      dockerfile: services/api-gateway/Dockerfile
      target: development
    container_name: sentinel-local-api-gateway
    restart: unless-stopped
    environment:
      NODE_ENV: development
      PORT: 4000
      DATABASE_URL: postgresql://sentinel:sentinel_dev_password@postgres:5432/sentinel_core
      REDIS_URL: redis://:sentinel_redis_dev@redis:6379/0
      ORCHESTRATION_SERVICE_URL: http://orchestration-service:5000
    ports:
      - "4000:4000"
    volumes:
      - ../services/api-gateway/src:/app/services/api-gateway/src:ro
      - ../packages/schemas:/app/packages/schemas:ro
    networks:
      - sentinel-local
    depends_on:
      orchestration-service:
        condition: service_started

  dashboard:
    build:
      context: ../
      dockerfile: apps/dashboard/Dockerfile
      target: development
    container_name: sentinel-local-dashboard
    restart: unless-stopped
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:4000
      NEXT_PUBLIC_WS_URL: ws://localhost:4000/ws
    ports:
      - "3000:3000"
    volumes:
      - ../apps/dashboard/src:/app/apps/dashboard/src:ro
    networks:
      - sentinel-local
    depends_on:
      api-gateway:
        condition: service_started
```

### 3.3 Development & Integration Environment (`dev`)

The `dev` environment is a multi-tenant Kubernetes cluster namespace engineered for continuous deployment from the `main` branch. Every commit successfully passing continuous integration unit and schema compilation tests is automatically packaged into OCI container images and synchronized via ArgoCD within 5 minutes.
* **Purpose:** Continuous integration validation, multi-service API contract verification, and developer integration experimentation.
* **Failure Modes & Recovery:** Because `dev` receives continuous, automated deployments from `main`, build instability or transient breaking mutations can occur. Automated synthetic smoke tests run immediately post-sync; if smoke tests fail, ArgoCD triggers an automated notification to the authoring developer while isolating the breaking pod deployment.

### 3.4 Quality Assurance & Chaos Testing Tier (`qa`)

The `qa` environment is a strict, production-mirrored Kubernetes namespace dedicated to deterministic regression testing, end-to-end multi-agent LangGraph workflow validation, and continuous chaos fault injection.
* **Deterministic Replay Harness:** The QA tier runs automated execution verification suites that replay historical production business anomalies against new agent capability builds. It verifies that root-cause analysis hypotheses and plan generation schemas maintain >=90% adherence to established baselines.
* **Chaos Engineering Integration:** The QA environment continuously executes LitmusChaos and Chaos Mesh fault experiments (e.g., terminating 50% of Redis nodes mid-workflow, injecting 3,000ms network jitter between orchestration workers and LLM gateways, or simulating vector database disk exhaustion) to verify LangGraph state checkpointer resilience and automated recovery runbooks.

### 3.5 Staging & Pre-Production Environment (`staging`)

The `staging` environment is an exact hardware, network, and architectural mirror of the production Kubernetes environment, operating in a distinct cloud AWS VPC / GCP VPC.
* **Enterprise ERP Dry-Run Sandbox:** Staging pods connect directly to enterprise read-only sandbox environments (SAP QA, Salesforce Sandbox). All write capabilities executed by `sentinel-orchestration-engine` run in dry-run mode or target isolated test business accounts, verifying end-to-end execution idempotency without polluting live production ledgers.
* **Release Sign-Off Gate:** Promotion to staging requires manual approval from Lead Architecture and Quality Assurance leads. No release candidate can advance to production without completing a 48-hour soak test in staging confirming zero memory leaks, zero unresolved DLQ events, and zero security policy violations.

### 3.6 Production Multi-Region Environment (`prod`)

The production environment operates across two geographically distinct cloud regions (e.g., AWS `us-east-1` Primary and AWS `us-west-2` Secondary) configured in an active-active or hot-standby topology.
* **Zero-Downtime Progressive Delivery:** All production deployments execute via Argo Rollouts using progressive Canary release strategies. Traffic is incrementally shifted (5% -> 20% -> 50% -> 100%) while automated Prometheus analysis templates continuously evaluate service SLIs (error rates, p99 latency, LLM hallucination scores). Any SLI degradation triggers an immediate, automated zero-downtime rollback.

### 3.7 Cold/Warm Disaster Recovery Environment (`dr`)

The disaster recovery environment maintains complete infrastructure readiness in an independent cloud region or secondary cloud provider substrate.
* **State Replication:** PostgreSQL databases maintain continuous cross-region asynchronous WAL replication. Vector indexes (Qdrant) and graph stores (Neo4j) execute continuous snapshot replication to multi-region object storage buckets.
* **RTO/RPO SLA Execution:** In the event of total primary region failure, automated DNS failover (Route 53 / Cloudflare Global Traffic Manager) promotes the DR read replicas to primary write status and scales up standby compute pods within 1800 seconds (RTO < 30m), ensuring zero operational transaction loss beyond the 300-second WAL replication window (RPO < 5m).

---

## 4. Monorepo Build Architecture

### 4.1 Workspace Structure & Package Dependency Graph

Sentinel OS organizes its codebase as a strict, polyglot monorepo governed by `pnpm` workspace rules for TypeScript/Node.js packages and standard module boundaries for Python 3.12 AI services.

```
sentinel-os/
├── ai/                               # Python 3.12 AI Core & LangGraph Workflows
│   ├── agents/                       # Specialized autonomous agent nodes
│   ├── capabilities/                 # Pure deterministic capability functions
│   ├── graph/                        # LangGraph workflow definitions & checkpointers
│   ├── pyproject.toml                # Poetry / UV dependency manifest
│   └── Dockerfile                    # Multi-stage Python AI worker container specification
├── apps/
│   └── dashboard/                    # Next.js 14 Mission Control Frontend Application
│       ├── package.json
│       └── Dockerfile
├── services/
│   └── api-gateway/                  # Node.js / Fastify Enterprise API Gateway
│       ├── package.json
│       └── Dockerfile
├── packages/
│   └── schemas/                      # @sentinel/schemas (Universal Shared Schemas)
│       ├── src/
│       │   ├── events/               # Event envelope & domain payload schemas (Zod)
│       │   └── business-case/        # Core BusinessCase object schemas
│       ├── generated/
│       │   └── json-schema/          # Compiled JSON Schemas exported for Python ingestion
│       └── package.json
├── infra/                            # Infrastructure manifests, Docker Compose & IaC
│   ├── k8s/                          # Helm umbrella charts & ArgoCD applications
│   └── terraform/                    # Modular Terraform infrastructure code
├── pnpm-workspace.yaml               # Package workspace globs: ['apps/*', 'services/*', 'packages/*']
└── package.json                      # Root build orchestration scripts
```

To prevent circular dependencies and architectural degradation, build boundaries strictly enforce that all services depend downward on `@sentinel/schemas`. The schema compilation pipeline acts as the foundational compilation step for both TypeScript microservices and Python AI workers.

### 4.2 Polyglot Build Pipeline (TypeScript/Node.js & Python 3.12)

The monorepo compilation architecture guarantees unified data validation across language boundaries by executing a two-stage polyglot build sequence:

```mermaid
graph LR
    subgraph Stage1["Stage 1: Universal Schema Compilation"]
        Zod["TypeScript Zod Schemas (@sentinel/schemas)"]
        Compile["pnpm run build:schemas"]
        TSDecl["Compiled TypeScript .d.ts Types"]
        JSONSch["Exported W3C JSON Schema Files"]
    end

    subgraph Stage2["Stage 2: Parallel Microservice Compilation"]
        TSBuild["Node.js Services (esbuild / tsc)"]
        PyBuild["Python AI Services (datamodel-codegen / pydantic)"]
    end

    Zod --> Compile
    Compile --> TSDecl --> TSBuild
    Compile --> JSONSch --> PyBuild
```

1. **Schema Generation (`@sentinel/schemas`):** TypeScript developers define all domain event payloads, API request/response structures, and Business Case objects using Zod validation schemas. The build pipeline compiles these into strict TypeScript declaration files (`.d.ts`) and exports language-agnostic W3C JSON Schema specifications into `packages/schemas/generated/json-schema/`.
2. **Python Type Hydration:** During the build process of `ai/` services, automated code generation tools (`datamodel-code-generator`) consume the exported JSON Schemas and generate strict Python Pydantic v2 models. This guarantees that a Python LangGraph worker cannot emit an event payload or write a Business Case state attribute that violates the exact validation rules enforced by the TypeScript API Gateway.

### 4.3 Multi-Stage Container Image Compilation & OCI Packaging

To achieve minimal network transfer latency, zero unnecessary runtime dependencies, and absolute minimization of common vulnerabilities and exposures (CVEs), all container images are engineered using strict multi-stage Dockerfiles compiling down to minimal distroless or Alpine runtimes.

#### Production Python AI Worker Dockerfile (`ai/Dockerfile`)
```dockerfile
# ==============================================================================
# STAGE 1: Dependency Resolution & Wheel Compilation (Builder)
# ==============================================================================
FROM python:3.12-slim AS builder

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=off \
    PIP_DISABLE_PIP_VERSION_CHECK=on

WORKDIR /build

# Install build essential C-compilers required for native extensions (asyncpg, numpy)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install modern Python dependency manager (uv) for high-speed deterministic builds
RUN pip install --no-cache-dir uv==0.2.15

# Copy dependency manifests and shared schema generated artifacts
COPY ai/pyproject.toml ai/uv.lock ./
COPY packages/schemas/generated/json-schema /build/schemas/json-schema

# Compile dependencies into virtual environment
RUN uv venv /build/.venv && \
    uv pip install --no-cache -r <(uv pip compile pyproject.toml)

# Copy application source code and compile bytecodes
COPY ai/ /build/app/
RUN python -m compileall /build/app

# ==============================================================================
# STAGE 2: Minimal Hardened Runtime Container
# ==============================================================================
FROM cgr.dev/chainguard/python:latest AS runtime

# Set security runtime metadata
LABEL org.opencontainers.image.title="sentinel-orchestration-engine" \
      org.opencontainers.image.description="Sentinel OS Autonomous AI Orchestration Worker" \
      org.opencontainers.image.vendor="Sentinel AI Engineering"

ENV PYTHONUNBUFFERED=1 \
    PATH="/app/.venv/bin:$PATH" \
    PYTHONPATH="/app"

WORKDIR /app

# Copy compiled virtual environment and pre-compiled bytecode from builder stage
COPY --from=builder --chown=nonroot:nonroot /build/.venv /app/.venv
COPY --from=builder --chown=nonroot:nonroot /build/app /app
COPY --from=builder --chown=nonroot:nonroot /build/schemas /app/schemas

# Execute strictly under non-privileged nonroot user ID 65532
USER nonroot

EXPOSE 5000

ENTRYPOINT ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "5000", "--workers", "4"]
```

### 4.4 Artifact Caching, SBOM Generation & Supply Chain Security

Every container image produced by the continuous integration engine must undergo automated Software Bill of Materials (SBOM) generation and cryptographic signing before transfer to the OCI container registry:
1. **SBOM Generation:** The CI build runner executes Syft against the compiled container image, extracting an exhaustive inventory of OS packages, Python wheels, and Node modules formatted in SPDX JSON standard.
2. **Vulnerability Attestation:** Grype scans the generated SBOM against real-time CVE vulnerability databases. Any Critical or High severity vulnerability detected with an existing patch immediately breaks the pipeline build.
3. **Cryptographic Signing (Sigstore Cosign):** Verified container images are signed using keyless Cosign attestation tied to the GitHub Actions OIDC identity token. Kubernetes OPA Gatekeeper admission controllers verify this signature before permitting workload scheduling.

---

## 5. Docker Architecture

### 5.1 Base Image Standardization & Hardening Matrix

To prevent supply chain poisoning and eliminate unnecessary OS packages (such as shell binaries, package managers, and networking utilities that attackers could leverage during a runtime exploit), Sentinel OS establishes an explicit, immutable matrix of authorized base container images:

| Microservice / Component | Authorized Base Image Substrate | Rationale & Security Properties | Total Image Footprint |
| :--- | :--- | :--- | :--- |
| **Orchestration / AI Services** | `cgr.dev/chainguard/python:latest` | Zero-CVE distroless Python substrate; no shell (`/bin/sh` or `/bin/bash` removed); daily automated security rebuilds. | ~110 MB |
| **API Gateway / Node Services** | `node:20-alpine3.19` | Minimal Alpine Linux base; strict non-root user isolation; stripped manual development utilities. | ~135 MB |
| **UI Dashboard (SSR)** | `gcr.io/distroless/nodejs20-debian12` | Absolute minimal Google distroless Node runtime; immutable filesystem; zero background daemon packages. | ~120 MB |
| **Tool Sandbox Workers** | `alpine:3.19` (within gVisor microVM) | Minimal hardened environment specifically structured for sandboxed script execution; strict network egress filters. | ~45 MB |

### 5.2 Container Runtime Security & Privilege Restrictions

Every container running within Sentinel OS must adhere to strict runtime privilege boundaries declared in its Kubernetes `securityContext` or Docker Compose specification:

```yaml
securityContext:
  runAsUser: 10001
  runAsGroup: 10001
  runAsNonRoot: true
  readOnlyRootFilesystem: true
  allowPrivilegeEscalation: false
  seccompProfile:
    type: RuntimeDefault
  capabilities:
    drop:
      - ALL
```
* **Privilege Escalation Denial:** Containers are prohibited from gaining new privileges via setuid or setgid binaries (`allowPrivilegeEscalation: false`).
* **Kernel Capability Stripping:** All Linux kernel capabilities (`CAP_SYS_ADMIN`, `CAP_NET_ADMIN`, `CAP_CHOWN`, etc.) are explicitly dropped. Stateless services require zero elevated kernel syscall access.

### 5.3 Local Orchestration with Docker Compose (`docker-compose.yml`)

The local development orchestration configuration (`infra/docker-compose.yml` detailed in Section 3.2) establishes a isolated software bridge network (`172.28.0.0/16`) ensuring predictable IP addressing and DNS resolution across local containers. Service startup dependencies strictly utilize `condition: service_healthy`, preventing application entrypoints from crashing during database initialization sequences.

### 5.4 Container Resource Limits & Memory Governance

To prevent noisy-neighbor degradation and out-of-memory (OOM) kernel panics on shared container hosts, every service must declare explicit compute bounds:
* **Memory Swapping Disabled:** Container runtimes execute with swap disabled (`--memory-swappiness=0`). Any service exceeding its hard memory allocation limit is immediately terminated by the Linux kernel OOM killer (`OOMKilled` exit code 137).
* **AI Worker RAM Sizing:** Python orchestration workers processing complex LangGraph state graphs declare a baseline memory request of `2Gi` and a strict hard limit of `4Gi` per pod replica, ensuring adequate headroom for in-memory JSON payload serialization and Pydantic validation without triggering memory thrashing.

---

## 6. Kubernetes Architecture

### 6.1 Cluster Topology & Node Pool Taxonomy

Production deployments of Sentinel OS run on enterprise managed Kubernetes platforms (AWS EKS or GCP GKE) partitioned into four specialized, autoscaling node pools. Node pools isolate heterogeneous workloads by hardware characteristics and security boundary requirements:

```mermaid
graph TB
    subgraph K8sCluster["Enterprise Multi-Region Kubernetes Platform"]
        subgraph PoolSystem["System & Control Node Pool (t3.xlarge / e2-standard-4)"]
            Ingress["Ingress Controllers / WAF"]
            CoreDNS["CoreDNS / Calico / Cilium eBPF"]
            Argo["ArgoCD / External Secrets Operator"]
        end

        subgraph PoolCompute["Stateless Application Node Pool (c6i.2xlarge / c2-standard-8)"]
            Gateway["sentinel-api-gateway Pods"]
            Orch["sentinel-orchestration Pods"]
            Dash["sentinel-dashboard Pods"]
        end

        subgraph PoolSandbox["Isolated Tool Sandbox Node Pool (m6i.xlarge + gVisor Runtime)"]
            Sandbox["sentinel-tool-sandbox Pods (Seccomp / Kata MicroVMs)"]
        end

        subgraph PoolGPU["Hardware Accelerated AI Inference Node Pool (g5.12xlarge / a2-highgpu-4g)"]
            GPU["sentinel-vllm / Triton Inference Pods (NVIDIA H100 / A100 MIG Slices)"]
        end

        subgraph PoolData["High-IOPS Stateful Node Pool (i3en.2xlarge / n2-standard-16 + NVMe SSD)"]
            Postgres["sentinel-postgres StatefulSet"]
            Redis["sentinel-redis Cluster Pods"]
            Qdrant["sentinel-qdrant Distributed Shards"]
            Neo4j["sentinel-neo4j Graph Replicas"]
        end
    end
```

| Node Pool Identifier | Hardware Specification | Runtime / Engine | Kubernetes Taints & Tolerations | Workload Targets |
| :--- | :--- | :--- | :--- | :--- |
| **`system-pool`** | 4 vCPU / 16 GB RAM (General Purpose) | Standard containerd | None (System default pool) | CoreDNS, Cilium eBPF, Ingress Controllers, ArgoCD, Vault Agent, OPA Gatekeeper |
| **`compute-pool`** | 8 vCPU / 16 GB RAM (Compute Optimized) | Standard containerd | None | `sentinel-api-gateway`, `sentinel-orchestration-engine`, `sentinel-dashboard` |
| **`sandbox-pool`** | 4 vCPU / 16 GB RAM | **gVisor (`runsc`) MicroVM** | `sandbox=true:NoSchedule` | `sentinel-tool-sandbox` execution workers running third-party tool scripts |
| **`gpu-pool`** | 48 vCPU / 192 GB RAM / 4x NVIDIA A100 | Standard + NVIDIA Container Toolkit | `nvidia.com/gpu=true:NoSchedule` | Self-hosted LLM inference runtimes (`sentinel-vllm`, Triton Inference Server) |
| **`storage-pool`** | 16 vCPU / 128 GB RAM + Local NVMe SSD | Standard containerd | `storage=true:NoSchedule` | `sentinel-postgres`, `sentinel-redis`, `sentinel-qdrant`, `sentinel-neo4j` |

### 6.2 Namespace Taxonomy & Multitenant Isolation

The Kubernetes cluster is partitioned logically into strict namespaces enforced by NetworkPolicies and RBAC boundaries:
* **`sentinel-system`**: Cluster controllers, GitOps operators (ArgoCD), certificate managers (cert-manager), and secret sync engines (External Secrets Operator).
* **`sentinel-core`**: Primary stateless application logic: API Gateway, Orchestration Engine, Dashboard UI, and Knowledge Compilers.
* **`sentinel-data`**: All persistent database clusters and event bus brokers (PostgreSQL, Redis, Qdrant, Neo4j, Kafka).
* **`sentinel-ai`**: Dedicated hardware-accelerated model inference serving engines and vector embedding generation endpoints.
* **`sentinel-obs`**: Telemetry collectors, distributed tracing storage, time-series metrics databases, and operational dashboards (OpenTelemetry Collector, Prometheus, Tempo, Grafana).

### 6.3 Workload Management: Deployments, StatefulSets, DaemonSets, Jobs

Workload types are strictly assigned based on state requirements and execution lifecycles:
* **Deployments:** Utilized exclusively for stateless services (`sentinel-api-gateway`, `sentinel-orchestration-engine`). Configured with `RollingUpdate` deployment strategies (`maxSurge: 25%`, `maxUnavailable: 0`) ensuring zero dropped active client connections during rollouts.
* **StatefulSets:** Required for all data store tier workloads (`sentinel-qdrant`, `sentinel-neo4j`, `sentinel-postgres`). Enforces stable network hostnames (`qdrant-0`, `qdrant-1`), ordered initialization, and persistent volume claim templates binding directly to local NVMe storage classes.
* **DaemonSets:** Utilized for node-level telemetry and security collection: Cilium eBPF CNI agents, OpenTelemetry DaemonSet telemetry forwarders, and Falco runtime security monitoring probes.
* **CronJobs:** Used for scheduled background maintenance tasks: daily multi-tier database consolidation scripts, vector index HNSW vacuuming, and nightly orphaned LangGraph checkpointer state garbage collection.

### 6.4 Helm Chart Hierarchy & Umbrella Chart Design

Sentinel OS packages Kubernetes deployment configurations using a modular Helm umbrella chart architecture located in `infra/k8s/sentinel-platform/`. The umbrella chart manages configuration synchronization across microservices via dependency declarations:

```yaml
# infra/k8s/sentinel-platform/Chart.yaml
apiVersion: v2
name: sentinel-platform
description: Authoritative Enterprise Helm Umbrella Chart for Sentinel OS Platform
type: application
version: 2.0.0
appVersion: 2.0.0

dependencies:
  - name: api-gateway
    version: ~2.0.0
    repository: "file://../charts/api-gateway"
    condition: api-gateway.enabled
  - name: orchestration-engine
    version: ~2.0.0
    repository: "file://../charts/orchestration-engine"
    condition: orchestration-engine.enabled
  - name: tool-sandbox
    version: ~2.0.0
    repository: "file://../charts/tool-sandbox"
    condition: tool-sandbox.enabled
  - name: qdrant
    version: ~1.9.0
    repository: "https://qdrant.to/helm"
    condition: qdrant.enabled
  - name: neo4j
    version: ~5.20.0
    repository: "https://helm.neo4j.com/neo4j"
    condition: neo4j.enabled
```

Shared configuration variables (such as global database DNS endpoints, TLS certificate secrets, and environment designations) are declared once within the umbrella `values.yaml` under the `global:` configuration block, automatically propagating to subchart templates.

### 6.5 ArgoCD GitOps Reconciliation Architecture

ArgoCD manages deployment synchronization across all cluster environments using the **ApplicationSet** controller pattern. Instead of maintaining separate manual deployment pipelines per cluster, a single declarative ApplicationSet manifest monitors Git repository branches and dynamically instantiates environment applications:

```yaml
apiVersion: argoproj.io/v1alpha1
kind: ApplicationSet
metadata:
  name: sentinel-platform-environments
  namespace: sentinel-system
spec:
  generators:
    - git:
        repoURL: https://github.com/sentinel-ai/sentinel-os.git
        revision: main
        directories:
          - path: infra/environments/*
  template:
    metadata:
      name: 'sentinel-{{path.basename}}'
    spec:
      project: sentinel-enterprise
      source:
        repoURL: https://github.com/sentinel-ai/sentinel-os.git
        targetRevision: main
        path: infra/k8s/sentinel-platform
        helm:
          valueFiles:
            - '../../environments/{{path.basename}}/values.yaml'
      destination:
        server: 'https://kubernetes.default.svc'
        namespace: 'sentinel-{{path.basename}}'
      syncPolicy:
        automated:
          prune: true
          selfHeal: true
        syncOptions:
          - CreateNamespace=true
          - ApplyOutOfSyncOnly=true
          - ServerSideApply=true
        retry:
          limit: 5
          backoff:
            duration: 5s
            factor: 2
            maxDuration: 3m
```
* **Drift Detection & Alerting:** If an unauthorized out-of-band modification is executed against any Kubernetes resource, ArgoCD detects out-of-sync state within 30 seconds. The controller immediately issues a high-priority PagerDuty operational alert, emits an OpenTelemetry audit event, and automatically overwrites the drifted cluster state back to the Git source of truth.

---

## 7. Service Topology

### 7.1 Frontend & UI Gateway Pods (`sentinel-dashboard`)

The `sentinel-dashboard` microservice serves the interactive Mission Control interface (built on Next.js 14 and React 18) enabling human operators to observe live agent telemetry, inspect Business Case execution traces, and exercise non-bypassable human approval authority over pending execution actions.

```yaml
# Authoritative Production Pod Allocation: sentinel-dashboard
apiVersion: apps/v1
kind: Deployment
metadata:
  name: sentinel-dashboard
  namespace: sentinel-core
  labels:
    app.kubernetes.io/name: sentinel-dashboard
    app.kubernetes.io/component: frontend
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 25%
      maxUnavailable: 0
  selector:
    matchLabels:
      app.kubernetes.io/name: sentinel-dashboard
  template:
    metadata:
      labels:
        app.kubernetes.io/name: sentinel-dashboard
    spec:
      serviceAccountName: sentinel-dashboard-sa
      securityContext:
        runAsNonRoot: true
        runAsUser: 10001
        fsGroup: 10001
        seccompProfile:
          type: RuntimeDefault
      containers:
        - name: dashboard
          image: ghcr.io/sentinel-ai/sentinel-dashboard:v2.0.0@sha256:4a3b8c...
          imagePullPolicy: IfNotPresent
          env:
            - name: NODE_ENV
              value: "production"
            - name: NEXT_PUBLIC_API_URL
              value: "https://api.sentinel.internal"
            - name: NEXT_PUBLIC_WS_URL
              value: "wss://api.sentinel.internal/ws"
          ports:
            - containerPort: 3000
              name: http
              protocol: TCP
          resources:
            requests:
              cpu: "500m"
              memory: "512Mi"
            limits:
              cpu: "1000m"
              memory: "1Gi"
          securityContext:
            readOnlyRootFilesystem: true
            allowPrivilegeEscalation: false
            capabilities:
              drop: ["ALL"]
          volumeMounts:
            - name: tmp-cache
              mountPath: /app/.next/cache
          livenessProbe:
            httpGet:
              path: /api/healthz
              port: 3000
            initialDelaySeconds: 15
            periodSeconds: 10
            timeoutSeconds: 3
            failureThreshold: 3
          readinessProbe:
            httpGet:
              path: /api/readyz
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5
            successThreshold: 1
      volumes:
        - name: tmp-cache
          emptyDir:
            medium: Memory
            sizeLimit: 256Mi
```
* **CDN & Edge Distribution:** Static assets (`/_next/static/*`, images, fonts) are served via Cloudflare Edge CDN or AWS CloudFront distribution layers. The Kubernetes pods execute Server-Side Rendering (SSR) exclusively for authenticated dynamic route pages (`/cases/[id]`, `/approvals`), maintaining zero local browser session state.

### 7.2 API Gateway & Ingress Controllers (`sentinel-api-gateway`)

The `sentinel-api-gateway` operates as the primary ingress boundary for all human operations and external integration webhooks. Engineered on Node.js 20 and Fastify, it handles JWT authentication, cryptographic approval signature validation, token-bucket rate limiting, and persistent WebSocket hub broadcasting.

```yaml
# Authoritative Production Pod Allocation: sentinel-api-gateway
apiVersion: apps/v1
kind: Deployment
metadata:
  name: sentinel-api-gateway
  namespace: sentinel-core
spec:
  replicas: 4
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 50%
      maxUnavailable: 0
  template:
    metadata:
      labels:
        app.kubernetes.io/name: sentinel-api-gateway
    spec:
      serviceAccountName: sentinel-api-gateway-sa
      containers:
        - name: api-gateway
          image: ghcr.io/sentinel-ai/sentinel-api-gateway:v2.0.0
          envFrom:
            - secretRef:
                name: api-gateway-vault-secrets
          ports:
            - containerPort: 4000
              name: http-ws
          resources:
            requests:
              cpu: "1000m"
              memory: "1Gi"
            limits:
              cpu: "2000m"
              memory: "2Gi"
          livenessProbe:
            httpGet:
              path: /health
              port: 4000
            periodSeconds: 5
          readinessProbe:
            httpGet:
              path: /ready
              port: 4000
            periodSeconds: 3
```
* **Persistent WebSocket Scaling:** Because real-time operational feeds push live agent state transitions (`BusinessEvent`) to hundreds of concurrent human operators, the API gateway pods utilize Redis Pub/Sub channels (`sentinel.ws.broadcast`) to synchronize WebSocket message fanout across all replica instances.

### 7.3 Orchestration Engine & LangGraph Workers (`sentinel-orchestration-engine`)

The `sentinel-orchestration-engine` represents the core autonomous reasoning engine. Written in Python 3.12 using FastAPI and LangGraph, these pods execute the deterministic multi-agent workflow state machine (ADR-006).

```yaml
# Authoritative Production Pod Allocation: sentinel-orchestration-engine
apiVersion: apps/v1
kind: Deployment
metadata:
  name: sentinel-orchestration-engine
  namespace: sentinel-core
spec:
  replicas: 6
  template:
    spec:
      serviceAccountName: sentinel-orchestration-sa
      containers:
        - name: orchestration-engine
          image: ghcr.io/sentinel-ai/sentinel-orchestration-engine:v2.0.0
          envFrom:
            - secretRef:
                name: orchestration-vault-secrets
          resources:
            requests:
              cpu: "2000m"
              memory: "2Gi"
            limits:
              cpu: "4000m"
              memory: "4Gi"
          securityContext:
            readOnlyRootFilesystem: true
            allowPrivilegeEscalation: false
            capabilities:
              drop: ["ALL"]
```
* **Stateless Execution & Checkpointing:** As mandated by ADR-007, orchestration workers hold zero local state. Every step of a LangGraph agent loop reads the prior state from the PostgreSQL checkpointer (`checkpoints` table), computes the next agent node transition, executes external capability calls or LLM prompts, and writes the updated checkpoint state back to PostgreSQL inside a serialized atomic database transaction. If a worker pod crashes mid-investigation, a peer worker picks up the exact thread state (`thread_id = case_id`) from the last completed node without duplicate action execution.

### 7.4 Knowledge Compiler & Indexing Workers (`sentinel-knowledge-compiler`)

The `sentinel-knowledge-compiler` executes background batch pipelines responsible for parsing Enterprise Knowledge Definition Language (EKDL) documents, extracting graph entities, and computing dense semantic vector embeddings (ADR-011, ADR-019).
* **Asynchronous Batch Processing:** Configured as Kubernetes `Job` or `KEDA ScaledObject` workers triggered by object storage bucket notifications (`s3:ObjectCreated:Put`).
* **High Memory Allocation:** Workers request `4Gi` RAM and limit at `8Gi` RAM to accommodate large token window document splitting (`RecursiveCharacterTextSplitter`) and local embedding model batch generation (`BAAI/bge-large-en-v1.5`).

### 7.5 Tool Execution Sandbox Pods (`sentinel-tool-sandbox`)

The `sentinel-tool-sandbox` isolates the execution of dynamically configured external system API connectors and custom remediation scripts (ADR-014).
* **gVisor MicroVM Substrate:** Scheduled strictly on the `sandbox-pool` node tier running the gVisor (`runsc`) container runtime.
* **Strict Egress Whitelisting:** Pods execute with zero default network egress. Explicit Kubernetes NetworkPolicies allow outbound HTTPS connections exclusively to pre-verified enterprise API endpoints (e.g., `api.salesforce.com`, `my-instance.sap.com`).

### 7.6 Comprehensive Service Interaction Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    actor User as Human Operator (Dashboard)
    participant GW as API Gateway Pod
    participant RD as Redis Event Bus
    participant Orch as Orchestration Worker Pod
    participant PG as PostgreSQL Checkpoint Store
    participant QD as Qdrant Vector Store
    participant VLLM as AI Inference Pod (GPU)

    Note over RD,Orch: Anomaly Detected via Event Ingestion Loop
    RD->>Orch: Deliver Event stream: sentinel.events.case.detected
    Orch->>PG: BEGIN TX: Insert Case Record & Checkpoint State (Detect)
    PG-->>Orch: TX Committed (case_id: CASE-8842)
    
    Note over Orch,VLLM: Agent Investigation Phase
    Orch->>QD: Hybrid Vector + Graph Context Retrieval Query
    QD-->>Orch: Return Top-5 Similar Historical Cases & SOP Rules
    Orch->>VLLM: POST /v1/chat/completions (Investigate Prompt + Context)
    VLLM-->>Orch: Stream Root Cause Hypothesis & Structured Plan
    
    Orch->>PG: Update Checkpoint State (Status: PENDING_APPROVAL)
    Orch->>RD: Publish Event: sentinel.events.case.pending_approval
    RD->>GW: Subscribe Broadcast -> Push via WebSocket
    GW->>User: Render Interactive Plan Approval Modal
    
    Note over User,Orch: Human Authorization Gateway (ADR-008)
    User->>GW: POST /api/cases/CASE-8842/approve (Signed JWT Payload)
    GW->>GW: Validate Cryptographic Signature & Role Permissions
    GW->>RD: Publish Event: sentinel.events.case.approved
    RD->>Orch: Deliver Event -> Resume LangGraph Thread
    Orch->>PG: Load Checkpoint State -> Execute Action Tool
    Orch->>PG: Finalize Case Record (Status: COMPLETED)
```

---

## 8. AI Runtime Deployment

### 8.1 Inference Serving Topology (Self-Hosted vs. Cloud API Gateways)

Sentinel OS deploys a hybrid AI runtime architecture engineered to optimize throughput, data privacy, and token economics across local open-source weights and frontier proprietary APIs:

```mermaid
graph TB
    subgraph ClientLayer["Orchestration Engine Layer"]
        Agent["LangGraph Agent Worker"]
    end

    subgraph RouterLayer["Model Gateway & Semantic Router Layer"]
        LiteLLM["sentinel-model-gateway (LiteLLM Proxy Pods)"]
        Cache["Semantic Embedding Cache (Redis + Qdrant)"]
    end

    subgraph InternalAITier["Private GPU Node Pool (Kubernetes sentinel-ai Namespace)"]
        VLLM1["sentinel-vllm Pod 1 (Llama-3-70B-Instruct - 2x A100 80GB)"]
        VLLM2["sentinel-vllm Pod 2 (Mistral-Large - 2x A100 80GB)"]
        Embed["sentinel-embed Pod (BGE-Large-En - 1x L40S)"]
    end

    subgraph ExternalTier["External Cloud Frontier APIs"]
        Groq["Groq LPU API Endpoint (Ultra-Low Latency Fallback)"]
        OpenAI["OpenAI GPT-4o Endpoint (Complex Reasoning Fallback)"]
        Anthropic["Anthropic Claude 3.5 Sonnet Endpoint"]
    end

    Agent -->|Inference Request| LiteLLM
    LiteLLM -->|Check Exact & Semantic Match| Cache
    Cache -- Match Found (0ms TTFT) --> LiteLLM
    LiteLLM -->|Route Tier 1 Routine Task| VLLM1 & VLLM2
    LiteLLM -->|Route Vector Ingestion| Embed
    LiteLLM -->|Route Tier 3 Complex / Overload Fallback| Groq & OpenAI & Anthropic
```

* **Self-Hosted Primary Inference:** Routine operational workloads—including anomaly detection scoring, data normalization, log summarization, and initial root-cause hypothesis generation—execute against self-hosted open-source models (`Meta-Llama-3-70B-Instruct`, `Mistral-Large`) served via **vLLM** or **NVIDIA Triton Inference Server** within the private `sentinel-ai` namespace.
* **Frontier Cloud Fallback:** High-complexity strategic planning or edge-case reasoning steps dynamically escalate through the `sentinel-model-gateway` to external proprietary models (`Claude 3.5 Sonnet`, `GPT-4o`). If self-hosted GPU inference pods exceed a queued concurrency threshold or exhibit >2,500ms TTFT, traffic automatically spills over to low-latency cloud endpoints (e.g., Groq LPU inference).

### 8.2 GPU Node Scheduling & Hardware Acceleration

Hardware acceleration nodes (`gpu-pool`) run the NVIDIA Container Toolkit and Kubernetes NVIDIA Device Plugin, enabling fine-grained hardware allocation:
* **Multi-Instance GPU (MIG) Partitioning:** For embedding generation workloads (`sentinel-embed`), physical NVIDIA A100 80GB GPUs are partitioned via hardware MIG profiles into seven independent `1g.10gb` slices. Each slice provides guaranteed, isolated compute and high-bandwidth memory for concurrent embedding generation without starving 70B LLM inference pods.
* **Taints & Tolerations:** GPU nodes enforce strict taints (`nvidia.com/gpu=true:NoSchedule`). AI runtime pods declare exact tolerations and resource limits ensuring non-AI pods never schedule onto expensive GPU instances:
```yaml
resources:
  limits:
    nvidia.com/gpu: "2" # Requires 2 dedicated physical GPUs (NVLink connected)
tolerations:
  - key: "nvidia.com/gpu"
    operator: "Exists"
    effect: "NoSchedule"
```

### 8.3 Model Weight Management & Ephemeral Caching Architecture

Downloading multi-gigabyte model weights (e.g., 140GB for fp16 70B models) over container networks during pod initialization would cause unacceptable 20-minute cold-start delays. Sentinel OS implements a persistent host-mapped model caching architecture:

```mermaid
graph LR
    S3["S3 Bucket (s3://sentinel-models/)"] -->|Nightly Model Sync Job| HostNVMe["Host Node NVMe SSD (/mnt/fast-models)"]
    HostNVMe -->|HostPath Read-Only Volume Mount| VLLMPod1["sentinel-vllm Replica 1"]
    HostNVMe -->|HostPath Read-Only Volume Mount| VLLMPod2["sentinel-vllm Replica 2"]
```

1. **Persistent Host NVMe Volume:** Every physical node in the `gpu-pool` mounts a dedicated 2TB NVMe RAID-0 storage volume at `/mnt/fast-models`.
2. **Automated Model Synchronizer DaemonSet:** A specialized Kubernetes DaemonSet continuously checks Object Storage (`s3://sentinel-models/`) and pre-fetches verified model weights (`.safetensors` format) directly onto host NVMe disks.
3. **Instant Pod Volume Mounting:** Inference worker pods mount `/mnt/fast-models` via read-only `hostPath` volume mounts. When a new inference replica boots, it loads weights directly from local NVMe memory-mapped files into GPU VRAM in under 45 seconds.

### 8.4 Inference Traffic Routing, Fallback Circuits & Latency SLAs

To adhere to enterprise operational SLAs, the `sentinel-model-gateway` executes rigorous latency and error-rate circuit breaking:
* **Time to First Token (TTFT) SLA:** < 1,500 ms (Self-hosted); < 800 ms (Groq fallback).
* **Inter-Token Latency (ITL) SLA:** < 30 ms per token.
* **Automated Circuit Breaker:** If an inference pod returns HTTP 429 (Rate Limit Exceeded), HTTP 503 (Service Unavailable), or fails to emit the first token within 3,000 ms across three consecutive requests, the model gateway trips the circuit breaker for that endpoint for 30 seconds and seamlessly reroutes the prompt payload to the secondary fallback model cluster.

---

## 9. Data Platform Deployment

### 9.1 Relational Store (`sentinel-postgres`)

The operational relational database manages high-frequency transactional writes for Business Case states, audit log ledgers, and LangGraph execution checkpoints (ADR-004, ADR-006).

```mermaid
graph TB
    subgraph PostgresCluster["sentinel-postgres High-Availability Topology"]
        PgBouncer["PgBouncer Connection Pooler Pods (Transaction Pooling Mode)"]
        Primary["PostgreSQL 16 Primary Pod (Read/Write WAL Master)"]
        SyncRep["PostgreSQL 16 Synchronous Replica Pod (Zero Data Loss Tier)"]
        AsyncRep["PostgreSQL 16 Asynchronous Read Replica Pods (Scale-Out Queries)"]
    end

    Orch["sentinel-orchestration Workers"] -->|Write Case & Checkpoints| PgBouncer
    Dashboard["sentinel-dashboard API Gateway"] -->|Read Historical Cases| AsyncRep
    PgBouncer -->|Active TX Connections| Primary
    Primary -->|Synchronous Streaming Replication| SyncRep
    Primary -->|Asynchronous Streaming Replication| AsyncRep
```

#### Engineering Specification
* **Operator Substrate:** Managed via **CloudNativePG (CNPG)** Kubernetes Operator.
* **Connection Pooling:** All service connections route through high-availability **PgBouncer** deployments running in `pool_mode = transaction`. This multiplexes thousands of concurrent agent thread connections down to 100 persistent physical PostgreSQL backend connections, preventing `max_connections` exhaustion.
* **Table Partitioning:** The high-volume `checkpoints` and `audit_records` tables utilize declarative time-based and hash-based PostgreSQL partitioning (`PARTITION BY RANGE (created_at)`), ensuring daily partition dropping and index compaction without locking live transaction tables.

### 9.2 Vector Database (`sentinel-qdrant`)

The vector store manages dense semantic embeddings for enterprise knowledge chunks, historical anomaly resolutions, and system operational rules (ADR-011).
* **Distributed Consensus Cluster:** Deployed as a 3-node StatefulSet running Raft consensus (`qdrant-0`, `qdrant-1`, `qdrant-2`). Collections declare a replication factor of 2 (`replication_factor: 2`), ensuring zero data loss or query downtime during single-node loss.
* **Memory vs. Disk Allocation Formula:** To maintain sub-10ms similarity search latency while managing storage costs, Qdrant collections are configured with **on-disk payload storage** and **in-memory HNSW index allocation**:
$$\text{Required RAM (GB)} = \frac{N_{\text{vectors}} \times \left( D_{\text{dimensions}} \times 4\text{ B} + M_{\text{links}} \times 8\text{ B} \right)}{1024^3} \times 1.25 \text{ (Safety Overhead)}$$
For a baseline enterprise deployment of 50 million 1536-dimensional embeddings (`M=16`), the cluster allocates 384 GB of dedicated RAM across the shard topology exclusively for HNSW graph traversal.

### 9.3 Graph Database (`sentinel-neo4j`)

The graph database stores the enterprise entity ontology, system dependency mappings, and multi-hop causal relationships required for root-cause investigation (ADR-011).
* **Causal Cluster Architecture:** Deployed as a 3-server Core Cluster (`sentinel-neo4j-core`) handling Raft write consensus, augmented by 2 Read Replica servers (`sentinel-neo4j-read`) handling intensive multi-hop Cypher traversal queries initiated by investigative agent capabilities.
* **Pagecache & Heap Sizing:** Pod memory requests are strictly partitioned: 50% allocated to JVM Heap (`dbms.memory.heap.initial_size=32G`, `dbms.memory.heap.max_size=32G`) for query execution scratch space, and 40% allocated to memory-mapped Pagecache (`dbms.memory.pagecache.size=26G`) to hold the entire enterprise graph topology in physical memory.

### 9.4 Object Storage Architecture (`sentinel-object-storage`)

Object storage provides immutable persistence for raw enterprise documents, pre-compiled vector chunk snapshots, model weight archives, and regulatory audit dumps.
* **Bucket Taxonomy:**
  * `sentinel-knowledge-raw`: Raw unstructured enterprise SOPs, PDFs, and database dump files.
  * `sentinel-compiled-vectors`: Serialized Qdrant index snapshots and compiled EKDL artifacts.
  * `sentinel-audit-worm`: Cryptographically signed, append-only operational execution ledgers.
* **WORM Compliance & Lifecycle Governance:** The `sentinel-audit-worm` bucket enforces Object Lock in **Compliance Mode** (`Mode: COMPLIANCE`, `RetentionPeriod: 2555 Days` / 7 Years). No IAM identity, root cloud account, or automated process can delete or modify an audit log object prior to expiration of the 7-year regulatory window.

---

## 10. Event Platform Deployment

### 10.1 Event Bus Topology (Redis Streams & Apache Kafka)

Sentinel OS implements a tiered event broker architecture separating sub-millisecond agent execution signaling from enterprise-wide persistent event streaming:

```mermaid
graph LR
    subgraph HighSpeedTier["Tier 1: High-Speed Agent Execution Bus (Redis 7 Cluster)"]
        Stream["Redis Stream: sentinel.events.case.*"]
    end

    subgraph PersistentTier["Tier 2: Enterprise Persistent Event Bus (Apache Kafka / Strimzi)"]
        Topic["Kafka Topic: sentinel.audit.events (Replication Factor 3)"]
    end

    Ingress["sentinel-api-gateway"] -->|Publish Live Telemetry| Stream
    Orch["sentinel-orchestration Workers"] -->|Consume Consumer Group| Stream
    Orch -->|Emit Immutable Audit Action| Topic
```

* **Tier 1 (Redis Streams):** Powers the low-latency agent orchestration loop (`sentinel.events.case.*`). Deployed as a 6-node Redis Cluster (3 Primary, 3 Replica) utilizing append-only file persistence (`appendonly yes`, `appendfsync everysec`).
* **Tier 2 (Apache Kafka):** Managed via the Strimzi Kubernetes Operator. Powers long-term audit archiving, multi-datacenter replication, and external enterprise system webhook dispatching.

### 10.2 Partitioning Strategy & Ordering Guarantees

To prevent race conditions where a plan execution event arrives before the corresponding anomaly detection state is checkpointed, event streams enforce strict deterministic partitioning:
* **Partition Key Mandate:** All events emitted by any Sentinel OS subsystem must declare `partition_key = case_id`.
* **Ordering Guarantee:** By hashing `case_id` to a static stream shard or Kafka partition, all events belonging to a specific Business Case investigation are guaranteed to deliver sequentially to a single consumer group worker thread.

### 10.3 Consumer Group Scaling & Lag Management

Workload scaling for `sentinel-orchestration-engine` is dynamically driven by consumer group lag metrics managed via **KEDA (Kubernetes Event-driven Autoscaling)**:

```yaml
apiVersion: keda.sh/v1alpha1
kind: ScaledObject
metadata:
  name: orchestration-worker-scaler
  namespace: sentinel-core
spec:
  scaleTargetRef:
    name: sentinel-orchestration-engine
  minReplicaCount: 6
  maxReplicaCount: 40
  pollingInterval: 5
  cooldownPeriod: 60
  triggers:
    - type: redis-streams
      metadata:
        address: sentinel-redis.sentinel-data.svc.cluster.local:6379
        stream: sentinel.events.case.detected
        consumerGroup: orchestration-workers
        pendingEntriesCount: "15" # Scale up +1 pod for every 15 unacknowledged pending events
```

### 10.4 Dead Letter Queue (DLQ) & Poison Pill Isolation Architecture

If an ingested event payload fails schema validation or causes three consecutive unhandled exceptions inside an orchestration worker:
1. **Poison Pill Isolation:** The worker explicitly acknowledges (`XACK`) the corrupted message on the primary stream to unblock partition processing.
2. **DLQ Routing:** The message payload, stack trace, and correlation metadata are atomically wrapped and published to `sentinel.dlq.events`.
3. **Automated Quarantine:** A specialized DLQ monitoring controller intercepts the message, writes an alert entry to the Mission Control dashboard, and stores the raw payload in PostgreSQL for manual replay verification.

---

## 11. Networking Architecture

### 11.1 North-South Traffic Flow (Ingress, WAF, DDoS Mitigation)

All external traffic enters the cluster via edge Cloudflare Enterprise WAF layers terminating external DDoS floods and application-layer injections before routing to AWS Network Load Balancers (NLBs) pushing traffic into ingress controller pods:

```mermaid
graph TB
    Internet["External Internet / Human Operators / Webhooks"] -->|TLS 1.3 / HTTPS| WAF["Cloudflare Enterprise WAF / DDoS Mitigation"]
    WAF -->|Strict mTLS Origin Auth| NLB["Cloud Provider Network Load Balancer (TCP/443)"]
    NLB -->|Proxy Protocol v2| Ingress["Envoy Ingress Gateway Pods (sentinel-system)"]
    Ingress -->|JWT Auth / Rate Limit Check| APIGW["sentinel-api-gateway Pods (sentinel-core)"]
```
* **TLS 1.3 Strict Mandate:** Edge ingress configurations strictly reject TLS 1.0, 1.1, and 1.2 handshakes. Cipher suites are restricted exclusively to AEAD forward-secret ciphers (`TLS_AES_256_GCM_SHA384`, `TLS_CHACHA20_POLY1305_SHA256`).
* **Rate Limiting Buckets:** Ingress gateways enforce IP and API-token rate limits using Redis-backed token bucket algorithms: maximum 100 requests/minute for standard read endpoints; maximum 10 requests/minute for intensive execution action endpoints (`/api/cases/*/execute`).

### 11.2 East-West Traffic Flow & Service Mesh (Cilium eBPF)

Internal service-to-service communication completely bypasses traditional Linux `iptables` rules by deploying **Cilium** as the primary Container Network Interface (CNI) engine leveraging kernel eBPF programs:
* **Zero-Trust mTLS Encryption:** Cilium transparently encrypts all inter-node pod traffic using WireGuard or IPsec mTLS. Workload identity is cryptographically verified via X.509 SVID certificates issued by SPIFFE/SPIRE attestation agents running on every node.
* **Sub-Millisecond Routing:** eBPF socket-layer redirection routes traffic directly between container network namespaces on the same physical host without traversing the TCP/IP stack, reducing inter-service latency by ~40%.

### 11.3 Network Policies & Microsegmentation Matrix

Every Kubernetes namespace implements a default-deny ingress and egress NetworkPolicy. Communication is permitted exclusively through explicit directional matrices:

| Source Workload / Namespace | Allowed Destination Workload | Protocol / Port | Architectural Justification |
| :--- | :--- | :--- | :--- |
| `sentinel-dashboard` (`core`) | `sentinel-api-gateway` (`core`) | TCP / 4000 (HTTPS/WS) | UI rendering requests and WebSocket live updates |
| `sentinel-api-gateway` (`core`) | `sentinel-redis` (`data`) | TCP / 6379 | Event publishing and rate-limit bucket evaluations |
| `sentinel-api-gateway` (`core`) | `sentinel-postgres` (`data`) | TCP / 6432 (PgBouncer) | Read-only historical case queries and user authentication |
| `sentinel-orchestration` (`core`) | `sentinel-postgres` (`data`) | TCP / 6432 | LangGraph state checkpointer read/write transactions |
| `sentinel-orchestration` (`core`) | `sentinel-qdrant` (`data`) | TCP / 6333 (gRPC/HTTP) | Vector semantic similarity queries |
| `sentinel-orchestration` (`core`) | `sentinel-neo4j` (`data`) | TCP / 7687 (Bolt) | Enterprise ontology graph traversals |
| `sentinel-orchestration` (`core`) | `sentinel-vllm` (`ai`) | TCP / 8000 | AI inference and embedding generation requests |
| `sentinel-tool-sandbox` (`core`) | External Enterprise ERPs | TCP / 443 (Strict Egress) | Execution of approved remediation scripts against external systems |

### 11.4 Egress Gateway & External System Firewall Filtering

To prevent exfiltration of sensitive enterprise context data, pods in `sentinel-core` and `sentinel-data` are completely blocked from initiating direct internet egress. Any outbound connection required by `sentinel-tool-sandbox` must pass through dedicated **Envoy Egress Proxy** pods enforcing TLS origination and strict FQDN domain whitelisting (`*.sap.com`, `*.salesforce.com`).

---

## 12. Security & Secrets Deployment

### 12.1 Secrets Management Architecture (HashiCorp Vault & ESO)

Sentinel OS stores zero static credentials, API tokens, or database passwords within Git repositories, environment variable manifests, or Kubernetes `Secret` definitions stored on disk:

```mermaid
graph LR
    Vault["HashiCorp Vault Enterprise Cluster"] -->|Sync Dynamic Credentials| ESO["External Secrets Operator Pod"]
    ESO -->|Inject Ephemeral In-Memory Secret| Pod["sentinel-orchestration Pod"]
    Pod -->|Connect with Short-Lived Lease| PG["sentinel-postgres Database"]
```

1. **Vault Primary Store:** HashiCorp Vault manages all root secrets, master encryption keys, and dynamic database credentials.
2. **External Secrets Operator (ESO):** Reconciles Vault secrets into Kubernetes memory-only secret volumes.
3. **Dynamic Database Leases:** When `sentinel-orchestration-engine` boots, Vault generates a unique, short-lived PostgreSQL database user account with a 12-hour expiration lease. Even if a memory dump exposes the database credential, it expires automatically without operator intervention.

### 12.2 Workload Identity & SPIFFE/SPIRE Attestation

Containers authenticate to Vault and internal service mesh endpoints via automated SPIFFE/SPIRE workload attestation. When a pod initializes, the SPIRE agent inspects the Linux kernel cgroup, verifies the SHA-256 container image digest against signed admission policies, and issues an X.509 SVID document signed by the enterprise internal root CA. Long-lived API keys are permanently eliminated.

### 12.3 Policy as Code Enforcement (OPA Gatekeeper)

Kubernetes admission control is governed by **Open Policy Agent (OPA) Gatekeeper**. Every deployment attempt is intercepted and evaluated against strict Rego constraints before persistence to etcd:

```rego
# Authoritative OPA Gatekeeper Constraint: Enforce Non-Root Execution
package kubernetes.admission

violation[{"msg": msg}] {
  input.request.kind.kind == "Pod"
  container := input.request.object.spec.containers[_]
  not container.securityContext.runAsNonRoot == true
  msg := sprintf("Container '%v' violates security policy: runAsNonRoot must be explicitly set to true", [container.name])
}
```

### 12.4 Runtime Security & Threat Detection (Falco eBPF Probes)

Every node runs **Falco** continuous runtime security probes monitoring low-level Linux kernel syscalls via eBPF. Falco triggers immediate automated pod isolation (via Cilium network policy containment) and PagerDuty P1 alerts upon detecting any of the following runtime violations:
* Spawning a shell binary (`/bin/sh`, `/bin/bash`, `zsh`) inside any running container.
* Modifying binaries or configuration files within a container filesystem.
* Opening unexpected network listening sockets or initiating outbound connections to non-whitelisted IP ranges.

---

## 13. CI/CD Architecture

### 13.1 Continuous Integration Pipeline (GitHub Actions Matrix)

Every pull request submitted to the monorepo triggers an automated, multi-stage Continuous Integration workflow (`.github/workflows/ci.yml`). To ensure high-speed feedback while maintaining zero tolerance for regression or schema drift, the pipeline executes in parallel across polyglot language matrices:

```mermaid
graph TB
    PR["Git Pull Request (main / staging)"] --> Lint["Parallel Static Linting (ESLint / Ruff / MyPy Strict)"]
    PR --> Schema["Build & Validate Shared Schemas (@sentinel/schemas)"]
    
    Schema --> UnitTS["TypeScript Unit & Integration Tests (Vitest)"]
    Schema --> UnitPy["Python LangGraph & Agent Unit Tests (Pytest)"]
    
    Lint & UnitTS & UnitPy --> SecScan["Supply Chain & Code Security Scan (CodeQL / Trivy)"]
    SecScan --> BuildOCI["Multi-Arch OCI Container Build (Docker Buildx AMD64/ARM64)"]
    BuildOCI --> Cosign["Cryptographic Container Signing (Sigstore Cosign OIDC)"]
    Cosign --> PushGHCR["Push Tagged Immutable Artifacts to GHCR"]
```

```yaml
# Authoritative CI Workflow Snippet: .github/workflows/ci.yml
name: Enterprise Continuous Integration Pipeline
on:
  pull_request:
    branches: [main, staging]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  validate-schemas:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with:
          version: 9.0.0
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm --filter @sentinel/schemas run build
      - name: Verify JSON Schema Determinism
        run: git diff --exit-code packages/schemas/generated/json-schema/

  build-and-sign:
    needs: [validate-schemas]
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
      id-token: write # Required for keyless Cosign OIDC attestation
    strategy:
      matrix:
        service: [orchestration-engine, api-gateway, dashboard, tool-sandbox]
    steps:
      - uses: actions/checkout@v4
      - uses: sigstore/cosign-installer@v3.5.0
      - uses: docker/setup-buildx-action@v3
      - name: Build and Export SBOM
        uses: docker/build-push-action@v5
        with:
          context: .
          file: ${{ matrix.service == 'orchestration-engine' && 'ai/Dockerfile' || format('services/{0}/Dockerfile', matrix.service) }}
          push: false
          load: true
          tags: ghcr.io/sentinel-ai/${{ matrix.service }}:${{ github.sha }}
          outputs: type=docker,dest=/tmp/${{ matrix.service }}.tar
      - name: Scan Image Vulnerabilities (Trivy)
        uses: aquasecurity/trivy-action@master
        with:
          input: /tmp/${{ matrix.service }}.tar
          exit-code: '1'
          severity: 'CRITICAL,HIGH'
          ignore-unfixed: true
```

### 13.2 Continuous Delivery Pipeline (Argo Rollouts & Canary Delivery)

Production releases execute exclusively through **Argo Rollouts**, replacing standard Kubernetes rolling deployments with mathematically gated, progressive Canary rollouts. Traffic shifting between the baseline (current release) and canary (new release) pods is managed by Cilium eBPF weighted routing tables:

```yaml
# Authoritative Production Canary Rollout Specification
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: sentinel-orchestration-engine
  namespace: sentinel-core
spec:
  replicas: 10
  strategy:
    canary:
      canaryService: sentinel-orchestration-canary
      stableService: sentinel-orchestration-stable
      trafficRouting:
        cilium:
          ingress: sentinel-api-ingress
      steps:
        - setWeight: 5
        - pause: { duration: 15m }
        - analysis:
            templates:
              - templateName: sentinel-canary-sli-verification
        - setWeight: 20
        - pause: { duration: 30m }
        - analysis:
            templates:
              - templateName: sentinel-canary-sli-verification
        - setWeight: 50
        - pause: { duration: 30m }
        - setWeight: 100
```

### 13.3 Automated Rollback Triggers & Canary Analysis Protocols

During each rollout pause window, an automated **AnalysisTemplate** queries Prometheus telemetry across both stable and canary service meshes. If the canary release breaches any defined SLI threshold, Argo Rollouts immediately aborts the promotion, resets traffic weight to 100% stable, and terminates canary pods within 10 seconds:

```yaml
apiVersion: argoproj.io/v1alpha1
kind: AnalysisTemplate
metadata:
  name: sentinel-canary-sli-verification
  namespace: sentinel-core
spec:
  metrics:
    - name: p99-latency-check
      interval: 1m
      successCondition: result[0] < 0.5 # p99 latency must remain < 500ms
      failureLimit: 2
      provider:
        prometheus:
          address: http://prometheus.sentinel-obs.svc.cluster.local:9090
          query: |
            histogram_quantile(0.99, sum(rate(http_request_duration_seconds_bucket{service="sentinel-orchestration-canary"}[5m])) by (le))
    - name: unhandled-exception-rate
      interval: 1m
      successCondition: result[0] == 0 # Zero unhandled agent loop errors allowed
      failureLimit: 1
      provider:
        prometheus:
          address: http://prometheus.sentinel-obs.svc.cluster.local:9090
          query: |
            sum(rate(sentinel_agent_unhandled_exceptions_total{service="sentinel-orchestration-canary"}[5m]))
```

### 13.4 Ephemeral Preview Environments (Pull Request Sandboxes)

To validate UI/UX interactions and end-to-end multi-agent execution paths before code merge, the CI pipeline supports automated ephemeral environment provisioning:
1. When a pull request is labeled `deploy-preview`, a dedicated ephemeral namespace (`sentinel-pr-<PR_ID>`) is dynamically instantiated.
2. Lightweight, single-replica instances of PostgreSQL, Redis, Qdrant, and local Ollama are provisioned inside the namespace and seeded with standardized test anomalies (`infra/seed/anomaly_scenarios.json`).
3. Upon PR merge or closure, a cleanup GitHub Actions job automatically deletes the namespace, releasing cluster CPU and RAM allocations.

---

## 14. Infrastructure as Code (Terraform)

### 14.1 Module Hierarchy & Remote State Management

All underlying cloud provider hardware (VPCs, subnets, EKS/GKE clusters, IAM roles, KMS keys, managed RDS instances, and S3 buckets) is provisioned declaratively via **Terraform 1.8+**. The Terraform repository is structured into strict, reusable modules governed by semantic versioning:

```
infra/terraform/
├── modules/
│   ├── vpc/                          # Multi-AZ VPC, NAT Gateways, Flow Logs
│   ├── eks/                          # Managed Kubernetes, Karpenter IAM, OIDC Providers
│   ├── rds_postgres/                 # Aurora PostgreSQL / RDS Multi-AZ topology
│   ├── elasticache_redis/            # High-Availability Redis Cluster subnet groups
│   └── s3_storage/                   # WORM Object Lock buckets, KMS encryption
├── environments/
│   ├── dev/
│   │   ├── main.tf                   # Instantiates modules with dev sizing
│   │   ├── variables.tf
│   │   └── backend.tf                # S3 Remote State: sentinel-tf-state-dev
│   ├── staging/
│   └── prod/
│       ├── main.tf                   # Instantiates modules with production multi-AZ parity
│       ├── variables.tf
│       └── backend.tf                # S3 Remote State: sentinel-tf-state-prod
```
* **Remote State Governance:** State files (`terraform.tfstate`) reside strictly in encrypted remote S3 buckets (`sentinel-tf-state-*`) with server-side KMS encryption enabled (`sse_algorithm = "aws:kms"`). Simultaneous state mutations are strictly prevented by DynamoDB state locking tables (`sentinel-tf-locks`).

### 14.2 Environment Workspace Separation & Directory Structure

To eliminate the risk of accidental production destruction caused by misconfigured workspace flags (`terraform workspace select`), Sentinel OS enforces physical directory separation per environment (`infra/terraform/environments/<env>/`). Each environment maintains independent variable files and remote backend state paths.

### 14.3 Drift Detection & Automated Reconciliation Workflows

Every 24 hours, an automated CI cron job runs `terraform plan -detailed-exitcode` against all production environment directories. If unmanaged out-of-band drift is detected (exit code 2), the pipeline creates an automated high-severity Jira tracking ticket, alerts the Platform SRE Slack channel, and generates a diff report for immediate investigation.

### 14.4 Tagging Governance & Resource Allocation Attribution

Every cloud resource provisioned by Terraform must declare an immutable set of resource tags enforced by AWS Service Control Policies (SCPs) and Terraform linting rules:

```hcl
locals {
  mandatory_tags = {
    Project            = "Sentinel-OS"
    Environment        = var.environment
    Owner              = "Platform-Engineering"
    CostCenter         = "CC-8842-AI-Platform"
    ManagedBy          = "Terraform"
    ComplianceScope    = "SOC2-HIPAA"
    DataClassification = "Confidential"
  }
}
```

---

## 15. High Availability & Resilience

### 15.1 Multi-Region Active-Active & Active-Passive Topology

To guarantee continuous operational availability under geographic disaster events, production deployments run across paired multi-region topologies:

```mermaid
graph TB
    GSLB["Cloudflare Global Traffic Manager (DNS Anycast GSLB)"]
    
    subgraph PrimaryRegion["Primary Cloud Region (AWS us-east-1)"]
        Ingress1["Ingress Gateway Pods"]
        Core1["sentinel-core Application Cluster"]
        PG1["PostgreSQL Primary (Read/Write)"]
        QD1["Qdrant Vector Cluster Primary"]
    end

    subgraph SecondaryRegion["Secondary Standby Region (AWS us-west-2)"]
        Ingress2["Ingress Gateway Pods (Hot Standby)"]
        Core2["sentinel-core Application Cluster (Read-Only / Standby)"]
        PG2["PostgreSQL Cross-Region Replica (Read-Only)"]
        QD2["Qdrant Snapshot Mirror"]
    end

    GSLB -->|Primary Traffic (100%)| Ingress1
    GSLB -.->|Failover Traffic (0%)| Ingress2
    Ingress1 --> Core1 --> PG1 & QD1
    PG1 -->|Continuous Asynchronous WAL Replication (<300ms lag)| PG2
    QD1 -->|Hourly Asynchronous Snapshot Sync| QD2
```

### 15.2 Graceful Degradation & Circuit Breaking Matrices

When external systems or internal storage dependencies exhibit catastrophic degradation, Sentinel OS executes deterministic fallback behaviors ensuring the core platform remains available for human oversight:

| Failing Component / Dependency | Impacted Agent / Subsystem | Automated Circuit Breaking & Fallback Behavior | Operational Impact |
| :--- | :--- | :--- | :--- |
| **Primary Relational DB (`sentinel-postgres`)** | `sentinel-orchestration-engine` | PgBouncer routes read queries to read replicas. Write-path LangGraph threads pause gracefully and buffer state transitions in Redis Streams for up to 60 minutes. | New case execution paused; existing case state viewable via read replicas. |
| **Vector Database (`sentinel-qdrant`)** | `agent_investigation` / RAG Layer | Vector similarity retrieval circuit trips open. Agent falls back exclusively to structured SQL/Cypher relational queries and deterministic SOP rule tables. | Root-cause accuracy temporarily degrades; execution remains functional. |
| **Primary LLM Provider (Self-Hosted GPU Cluster)** | AI Reasoning Capabilities | Model Gateway trips circuit after 3 timeouts (>3,000ms TTFT). Instantly shifts 100% of prompt routing to external Groq / OpenAI fallback endpoints. | Zero user-facing downtime; marginal increase in cloud API token costs. |
| **Enterprise System of Record API (e.g. SAP ERP)** | `agent_execution` / Tool Sandbox | Execution tool catches HTTP 5xx or connection timeout. Sets case status to `EXECUTION_FAILED_RETRYING`, enters exponential backoff (up to 24h), and alerts human operator. | Specific remediation action delayed; cluster health unaffected. |

### 15.3 Pod Disruption Budgets (PDBs) & Anti-Affinity Rules

To prevent Kubernetes node upgrades or spot instance terminations from causing cluster-wide outages, every microservice enforces strict **PodDisruptionBudgets** (`minAvailable: 75%` or `maxUnavailable: 1`) and inter-pod **TopologySpreadConstraints**:

```yaml
topologySpreadConstraints:
  - maxSkew: 1
    topologyKey: topology.kubernetes.io/zone
    whenUnsatisfiable: DoNotSchedule
    labelSelector:
      matchLabels:
        app.kubernetes.io/name: sentinel-orchestration-engine
```
This guarantees that orchestration pod replicas are evenly distributed across at least three physical Availability Zones (AZs).

---

## 16. Autoscaling Strategy

### 16.1 Horizontal Pod Autoscaling (HPA & KEDA Custom Metrics)

Standard CPU-based autoscaling is ineffective for autonomous AI workflows where network I/O and LLM streaming dominate pod lifetimes. Sentinel OS scales compute pods using multi-dimensional custom metrics:
* **API Gateway Scaling:** Scaled via standard HPA when average pod CPU utilization exceeds 65% or concurrent active WebSocket connections exceed 500 per pod.
* **Orchestration Worker Scaling:** Scaled via KEDA based on two custom Prometheus metrics:
  1. `redis_stream_pending_messages`: Pending events in `sentinel.events.case.*` > 15 per replica.
  2. `langgraph_active_threads`: Active concurrent investigation state machine threads > 8 per replica.

### 16.2 Vertical Pod Autoscaling (VPA) Recommendation Engine

To prevent manual resource overallocation, **Vertical Pod Autoscalers (VPA)** execute across all application pods in `Initial` or `Off` (recommendation) mode. VPA continuously profiles historical memory and CPU usage over 14-day rolling windows, automatically adjusting pod resource requests during scheduled maintenance rollout windows.

### 16.3 Cluster Autoscaling & Karpenter Node Provisioning

Underlying physical EC2/GCE compute nodes are provisioned dynamically by **Karpenter**. When unschedulable pods appear due to resource exhaustion, Karpenter evaluates pod requests, selects the optimal cloud instance architecture (`c6i.2xlarge` for CPU compute, `m6i.xlarge` for sandboxes), and boots right-sized worker nodes within 45 seconds—bypassing the multi-minute delays of traditional Managed Node Groups.

---

## 17. Backup & Disaster Recovery

### 17.1 Backup Schedule & Data Retention Policy Matrix

All persistent state tiers undergo continuous automated backups to immutable, off-site cloud storage:

| Storage Engine | Backup Methodology & Tooling | Execution Schedule | Retention Window | Regulatory Compliance Attribute |
| :--- | :--- | :--- | :--- | :--- |
| **PostgreSQL (`sentinel-postgres`)** | CloudNativePG Barman Object Store / pgBackRest WAL Archiving | Continuous streaming WAL archiving + Daily full physical base backup | 30 Days (Standard) / 7 Years (Audit Archive) | AES-256 encrypted; WORM Object Lock on S3 destination. |
| **Redis Event Bus (`sentinel-redis`)** | Automated RDB Snapshot Export | Every 6 hours | 7 Days | Ephemeral event bus recovery snapshot. |
| **Qdrant Vector Store (`sentinel-qdrant`)** | Native Qdrant Snapshot API via CronJob | Daily at 02:00 UTC | 14 Days | Compressed `.snapshot` payload synced to S3. |
| **Neo4j Graph Store (`sentinel-neo4j`)** | `neo4j-admin backup` Online Dump | Daily at 03:00 UTC | 30 Days | Full structural ontology graph backup. |

### 17.2 Disaster Recovery Objectives (RTO & RPO Definitions)

* **Recovery Point Objective (RPO) < 5 Minutes:** Guaranteed by continuous cross-region asynchronous WAL replication for PostgreSQL relational state. Even under sudden physical destruction of the primary cloud region, maximum potential transactional data loss is bounded to <300 seconds of in-flight operations.
* **Recovery Time Objective (RTO) < 30 Minutes:** Guaranteed by maintaining pre-provisioned, warmed standby infrastructure in the secondary cloud region. Automated failover runbooks execute DNS promotion, read-replica master election, and compute pod scaling within 1800 seconds.

### 17.3 Split-Brain Prevention & Consensus Election

During network partitions separating primary and secondary regions, split-brain scenarios (where both regions assume write master status) are strictly prevented by **STONITH (Shoot The Other Node In The Head)** fencing and quorum-based consensus (etcd / Raft). If a regional cluster loses quorum connectivity to the global consensus tie-breaker, it immediately downgrades its local database instances to read-only mode.

---

## 18. Cost Optimization

### 18.1 Total Cost of Ownership (TCO) Allocation Model

Sentinel OS establishes continuous financial observability by running **Kubecost / OpenCost** within the `sentinel-obs` namespace. Every pod, volume, and external network transfer dollar is attributed directly to specific architectural subsystems (`CostCenter: AI-Platform`, `Service: Orchestration`), enabling unit economic tracking of "Cost per Resolved Business Case."

### 18.2 Compute Spot Instance Utilization & Interruption Handling

To achieve up to 70% compute cost reductions, stateless background workers (`sentinel-knowledge-compiler`, non-critical `sentinel-orchestration-engine` replicas, and QA environments) run on cloud **Spot / Preemptible Instances**.
* **SIGTERM Interception:** Pods deploy with the AWS Node Termination Handler / GCP Lifecycle Controller. Upon receiving a 2-minute Spot interruption notice (`SIGTERM`), orchestration pods immediately halt polling new events from Redis, finish current step processing, flush existing LangGraph checkpoint states to PostgreSQL, and exit cleanly (`exit code 0`) before host termination.

### 18.3 Storage Lifecycle & Tiered Archival Formulas

Object storage spend is controlled by automated S3 Lifecycle rules:
1. **Days 0–30:** Objects reside in high-speed **S3 Standard** ($0.023 / GB / month) for instant accessibility.
2. **Days 31–90:** Objects transition automatically to **S3 Standard-Infrequent Access (IA)** ($0.0125 / GB / month).
3. **Days 91–2555 (7 Years):** Immutable audit ledgers and old case attachments transition to **S3 Glacier Deep Archive** ($0.00099 / GB / month), yielding a 95% storage cost reduction for long-term compliance retention.

### 18.4 LLM Token Economics & Routing Optimization Strategies

External frontier LLM token costs are bounded by mathematical semantic routing formulas executed inside `sentinel-model-gateway`:
* **Exact & Semantic Caching:** Before forwarding any prompt, the gateway computes an embedding of the input context and queries Qdrant for semantic similarity (`score >= 0.98`). If a cached response exists from an identical historical root-cause analysis, it is returned instantly—reducing token costs to $0.00.
* **Tiered Routing Allocation:** Routine tasks (entity extraction, classification, formatting) are forced to execute on self-hosted open-source models or low-cost cloud tiers ($0.15 / 1M tokens). Expensive frontier models ($15.00 / 1M tokens) are unlocked exclusively for complex P1 investigation cases that fail initial confidence scoring thresholds.

---

## 19. Operational Runbooks

### 19.1 Runbook DEP-001: Multi-Region Cluster Failover Procedure

**Symptom:** Primary Cloud Region (`us-east-1`) experiences total datacenter failure or loss of network ingress.  
**Action Steps:**
1. Verify regional failure via external monitoring triggers (Pingdom / Cloudflare Health Check reporting 100% packet loss for >180 seconds).
2. Execute emergency CLI failover script promoting secondary database replicas to primary master:
```bash
# Promote secondary PostgreSQL replica in us-west-2 to write master
kubectl exec -n sentinel-data -it sentinel-postgres-replica-0 -- cnpg promote sentinel-postgres-cluster

# Verify write-enable status
kubectl exec -n sentinel-data -it sentinel-postgres-replica-0 -- psql -U sentinel -d sentinel_core -c "SELECT pg_is_in_recovery();"
# Expected output: false
```
3. Update Cloudflare Global Traffic Manager DNS routing to shift 100% of ingress weight to secondary region load balancer (`us-west-2.nlb.sentinel.internal`).
4. Scale up standby compute pods in secondary cluster via GitOps override:
```bash
argocd app set sentinel-prod-compute --parameter global.failoverActive=true --sync
```

### 19.2 Runbook DEP-002: LangGraph Checkpoint Corruption Recovery

**Symptom:** Orchestration worker logs loop continuously on `PydanticValidationError` or `CorruptedCheckpointException` for case `CASE-9921`.  
**Action Steps:**
1. Isolate the corrupted workflow thread to prevent worker crash loops:
```bash
# Inspect corrupted checkpoint JSON payload
kubectl exec -n sentinel-data -it sentinel-postgres-primary-0 -- psql -U sentinel -d sentinel_core -c "SELECT thread_id, checkpoint_id, state FROM checkpoints WHERE thread_id = 'CASE-9921' ORDER BY created_at DESC LIMIT 1;"
```
2. Mark the corrupted checkpoint record as quarantined or rollback the thread pointers to the previous valid checkpoint step:
```bash
# Rollback checkpoint pointer to last known healthy step
kubectl exec -n sentinel-data -it sentinel-postgres-primary-0 -- psql -U sentinel -d sentinel_core -c "DELETE FROM checkpoints WHERE thread_id = 'CASE-9921' AND checkpoint_id = '<CORRUPTED_ID>';"
```
3. Publish a thread resumption event to Redis to re-trigger the investigation cleanly:
```bash
kubectl exec -n sentinel-data -it sentinel-redis-0 -- redis-cli -a $REDIS_PASSWORD XADD sentinel.events.case.retry * case_id "CASE-9921" reason "Manual checkpoint rollback"
```

### 19.3 Runbook DEP-003: Emergency Database Schema Rollback Under Load

**Symptom:** A production schema migration introduced backward-incompatible column locks causing API Gateway 500 errors.  
**Action Steps:**
1. Instantly pause new event consumption by disabling KEDA scaling for orchestration workers:
```bash
kubectl patch scaledobject orchestration-worker-scaler -n sentinel-core --type='json' -p='[{"op": "replace", "path": "/spec/maxReplicaCount", "value": 0}]'
```
2. Execute backwards-compatible SQL migration rollback scripts via Liquibase / Alembic runner pod.
3. Verify table lock release and schema parity via database verification checks.
4. Restore KEDA autoscaling to resume processing buffered events from Redis Streams.

### 19.4 Runbook DEP-004: GPU Node Pool Starvation & Model Deadlock Mitigation

**Symptom:** `sentinel-vllm` pods return HTTP 503; GPU memory utilization stuck at 100% with zero token output.  
**Action Steps:**
1. Drain the stalled GPU node and force-terminate hanging inference pods:
```bash
kubectl drain g5-node-8842 --ignore-daemonsets --delete-emptydir-data --force
kubectl delete pod -n sentinel-ai -l app=sentinel-vllm --grace-period=0 --force
```
2. Execute NVIDIA GPU reset on host hardware via daemonset recovery script:
```bash
nvidia-smi --gpu-reset
```
3. Uncordon node and verify clean model weight reloading from NVMe cache (`/mnt/fast-models`).

### 19.5 Runbook DEP-005: Security Incident Emergency Quarantine

**Symptom:** Falco runtime security alerts indicate anomalous `/bin/sh` execution inside `sentinel-tool-sandbox-88b4`.  
**Action Steps:**
1. Apply emergency Cilium network quarantine policy isolating the pod from all east-west network traffic while keeping it running for forensic memory acquisition:
```bash
kubectl label pod sentinel-tool-sandbox-88b4 -n sentinel-core security-quarantine=active
```
2. Execute forensic memory dump via hardened debug sidecar container.
3. Terminate pod and automatically rotate Vault dynamic database credentials cluster-wide.

---

## 20. Deployment Governance

### 20.1 Change Management & Production Release Gates

Production deployments strictly require automated satisfaction of four enterprise release gates:
1. **Zero Open High/Critical CVEs:** Verified by automated CI Grype scans.
2. **100% Schema Validation Pass:** Verified by automated regression testing against `@sentinel/schemas`.
3. **Canary SLI Pass:** Verified by 60 minutes of error-free progressive traffic shifting in production.
4. **Multi-Party Cryptographic Sign-Off:** Required approval from at least two Staff Platform Engineers signed via Git commit GPG keys.

### 20.2 Compliance Attestation (SOC2 Type II, ISO 27001, HIPAA)

To satisfy enterprise regulatory audits, the deployment platform automatically generates and archives compliance evidence:
* **Immutable Audit Trail:** Every infrastructure mutation, Git commit, container signature, and production rollout is logged in WORM object storage (`sentinel-audit-worm`).
* **Separation of Duties:** Developers hold zero production cluster credentials. Deployments execute exclusively via automated service principals operating under role-based access control (RBAC).

### 20.3 Deployment Metric Governance (DORA Metrics Tracking)

Platform engineering continuously tracks standard DORA operational metrics on the Mission Control dashboard:
* **Deployment Frequency:** Target >= 4 deployments per business day.
* **Lead Time for Changes:** Target < 45 minutes from PR merge to production canary initiation.
* **Change Failure Rate (CFR):** Target < 1.5% of deployments requiring automated rollback.
* **Mean Time to Recovery (MTTR):** Target < 10 minutes for automated rollback or self-healing circuit trip.

---

## 21. Future Evolution

### 21.1 Edge AI & Bare-Metal On-Premises Horizons

To support industrial manufacturing and remote logistics operations operating under disconnected network conditions, Sentinel OS will evolve an **Edge Appliance Deployment Target**. Packaged as a self-contained, air-gapped k3s / MicroK8s cluster running on ruggedized bare-metal hardware with local NVIDIA L4 GPUs, edge nodes will execute autonomous monitoring and local anomaly remediation without requiring continuous cloud connectivity.

### 21.2 Autonomous Self-Healing Infrastructure Agents

Future architecture horizons (Horizon 3) will deploy specialized **Sentinel Infrastructure Agents (`agent_infra`)** empowered to monitor the Kubernetes deployment topology itself. When cluster anomalies occur (such as persistent OOM loops, DNS lookup latency spikes, or disk space exhaustion), `agent_infra` will investigate root causes, generate declarative Terraform/Helm remediation patches, and submit self-healing pull requests directly to the GitOps control repository for human approval.

### 21.3 Global Multi-Cloud Mesh Federation

To eliminate single-cloud vendor lock-in, Sentinel OS will expand its Cilium eBPF service mesh across federated multi-cloud substrates (AWS EKS + GCP GKE + Azure AKS). Workload pods will communicate transparently across cloud boundaries over encrypted mTLS tunnels, enabling dynamic AI workload bursting—shifting GPU inference workloads dynamically to whichever cloud provider offers the lowest spot instance pricing at any given moment.


