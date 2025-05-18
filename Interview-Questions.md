# Kubernetes Interview Questions

## Table of Contents
- [Core Architecture & Concepts](#core-architecture--concepts)
- [Services, Networking & Ingress](#services-networking--ingress)
- [State, Storage, Volumes](#state-storage-volumes)
- [Cluster Management & Upgrades](#cluster-management--upgrades)
- [Monitoring & Observability](#monitoring--observability)
- [Security & Access Control](#security--access-control)
- [Scheduling, Taints & Affinity](#scheduling-taints--affinity)
- [Scaling & Auto Scaling](#scaling--auto-scaling)
- [Debugging & Troubleshooting](#debugging--troubleshooting)
- [Commands & Usage](#commands--usage)
- [Miscellaneous Kubernetes Topics](#miscellaneous-kubernetes-topics)

## Core Architecture & Concepts

### 1. Explain Kubernetes Architecture
[Answer needed]

### 2. What is Pod in Kubernetes?
A pod is the smallest deployable unit in Kubernetes. It can contain one or more containers that share storage, network, and specifications. Pods are ephemeral - if they fail, Kubernetes replaces them.

### 3. What is the use of etcd in Kubernetes?
ETCD is the cluster's key-value store. It holds the state and configurations of the cluster, backing all cluster data.

### 4. What is Kubelet?
Kubelet is a component in the worker node that talks to the API server and is responsible for ensuring the pods are always running. If not, it informs the API server to take action. Kubelet is the Kubernetes node agent responsible for maintaining the desired state of Pods on each node. Without kubelet, your nodes won't run or report any workloads.

### 5. What is Kube-proxy?
In Kubernetes, kube-proxy is a networking component that runs on each node in the cluster. It maintains network rules and forwards traffic to the correct pods. It provides networking, IP addresses, and load balancing.

### 6. What is Ingress in Kubernetes?
Ingress is your HTTP/HTTPS gateway into a Kubernetes cluster. It centralizes and controls how external users access internal services using rules defined in an Ingress resource. Think of it as a smart router sitting at the edge of your cluster, routing traffic from the outside world to different services in your cluster based on rules like hostnames and paths.

### 7. What is Ingress Controller?
An Ingress Controller is the traffic cop that reads your Ingress rules and makes the traffic flow correctly into your cluster. The Ingress resource (YAML) file defines routing rules, while the Ingress controller component enforces those rules. For the Ingress resource to work, the cluster must have an ingress controller running.

### 8. What is Service vs Deployment?
- Use Deployment to manage the lifecycle and scaling of your app Pods
- Use Service to expose and load balance access to those Pods

### 9. What are Deployments, DaemonSets, StatefulSets?

#### Deployment
Use when you want to run stateless, scalable applications.

✅ Use Cases:
- Web apps, REST APIs
- Frontend or backend services

🔧 Features:
- Automatically scales Pods up/down
- Handles rolling updates/rollbacks
- Replaces failed Pods
- All Pods are identical and stateless

#### StatefulSet
Use when your application needs persistent identity, storage, and ordering.

✅ Use Cases:
- Databases (e.g., MongoDB, PostgreSQL)
- Zookeeper, Kafka, Elasticsearch

🔧 Features:
- Stable, unique network identity (e.g., pod-0, pod-1)
- Persistent volumes tied to each Pod
- Supports ordered Pod startup/shutdown
- Each Pod can store different data

#### DaemonSet
Use when you need exactly one Pod per node in the cluster.

✅ Use Cases:
- Log collectors (e.g., Fluentd, Filebeat)
- Monitoring agents (e.g., Prometheus Node Exporter)
- Network plugins or security agents

🔧 Features:
- Runs one Pod on every node
- Automatically runs Pod on new nodes when added
- Often used for system-level agents

### 10. Purpose of Scheduler in K8s
It's a Master node component that assigns newly created pods to nodes based on resource availability, affinity rules, etc.

### 11. CoreDNS in K8s
In Kubernetes, CoreDNS is the default DNS server used for service discovery within the cluster. CoreDNS is a flexible, extensible DNS server that runs as a cluster add-on and provides DNS-based service discovery for Pods.

#### Why is CoreDNS Important?
Every time a Pod tries to communicate with a Service (e.g., my-service.default.svc.cluster.local), CoreDNS:
- Resolves the DNS name to a ClusterIP
- Ensures that applications can use hostnames instead of IP addresses
- Automatically updates when Services or Pods change

### 12. Purpose of using CNI in K8s
A CNI plugin is essential in Kubernetes for Pod-level networking, ensuring every Pod gets a routable IP and can communicate securely and reliably across the cluster.

### 13. Explain Terms in deployment.yml File in Kubernetes

1. **apiVersion**
   - Specifies which Kubernetes API version to use
   - Example: apps/v1 is for Deployments

2. **kind**
   - Type of Kubernetes object
   - Example: Deployment (other examples: Pod, Service, etc.)

3. **metadata**
   - Metadata about the object
   - name: Name of the deployment (my-app)
   - labels: Key-value pairs to identify or group objects (e.g., app: my-app)

4. **spec**
   - Desired state specification for the deployment
   
   a. **replicas**
   - Number of desired Pod replicas
   - Kubernetes will ensure this many Pods are running
   
   b. **selector**
   - Tells the Deployment which Pods it manages
   - matchLabels must match the labels under template.metadata
   
   c. **template**
   - Describes the Pod to be created by the Deployment
   
   i. **template.metadata**
   - Labels for the Pod (must match the selector)
   
   ii. **template.spec**
   - Actual Pod specification: what containers to run, how to run them, etc.

### 14. Can we run 1 container with 2 pods?
No, you cannot run 1 container with 2 Pods — because Pods are higher-level objects than containers, and each Pod is an independent unit that can contain one or more containers.

### 15. Design the deployment of the pod with replica set set as 3 and having apache httpd image
[Answer needed]

### 16. What is Rolling Update?
In Kubernetes, a rolling update is the default deployment strategy that allows you to update an application version with zero downtime by incrementally replacing old Pods with new ones. A rolling update in Kubernetes is a controlled way to upgrade your application with minimal disruption, maintaining availability by replacing Pods incrementally.

### 17. What is the deployment strategy you are using?
[Answer needed]

### 18. If we have pods in both deployment and statefulset, how will rolling update work?
If you have Pods managed by both a Deployment and a StatefulSet, each performs rolling updates independently, but with different strategies based on the nature of the workloads they manage.

#### Rolling Update with Deployment
When you change something (like container image):
- Kubernetes may launch a new Pod (e.g., with image: v2)
- Wait for it to become ready
- Then delete an old Pod (e.g., image: v1)

This process is governed by:
```yaml
strategy:
  type: RollingUpdate
  rollingUpdate:
    maxSurge: 1
    maxUnavailable: 1
```

#### Rolling Update with StatefulSet
When updating a StatefulSet:
- Updates happen sequentially and in reverse ordinal order
- Each Pod:
  - Is terminated
  - Gets updated
  - Waits for it to be ready
  - Then proceeds to the next

#### Real-world Scenario
A frontend (Deployment) and a database (StatefulSet):
- During an update:
  - The frontend may update 2-3 Pods at once
  - The DB StatefulSet updates only one Pod at a time, waiting for readiness before proceeding

### 19. Suppose mongo-0 pod dies, what will be new pod name?
- In deployments, pods will be created with new names
- In statefulSet, k8s will create it with the exact same name

## Services, Networking & Ingress

### 20. Types of Service in Kubernetes
1. **ClusterIP (default)** - Exposes the Service internally within the cluster
2. **NodePort** - Exposes the Service on a static port on each Node's IP
3. **LoadBalancer** - Exposing apps publicly on the internet

### 21. How to restrict the communication between pods? → NetworkPolicy
NetworkPolicy is a Kubernetes resource that controls ingress (incoming) and egress (outgoing) traffic between Pods based on labels, namespaces, and ports.

#### Prerequisites
- Pods must be labeled
- A CNI plugin that supports NetworkPolicy must be installed
- Use a "deny all" NetworkPolicy

### 22. What component should be added in NetworkPolicy YAML file?
To build a NetworkPolicy, at minimum, you need:
- apiVersion, kind, metadata
- spec.podSelector
- spec.policyTypes (and optionally ingress or egress rules)

### 23. If 2 pods are in different namespace, how to make them communicate securely?
Approach: NetworkPolicy with Namespace Selector + TLS (Optional)
With NetworkPolicy + namespace/pod labels, you can securely control cross-namespace traffic in Kubernetes. Use a NetworkPolicy that allows only certain Pods in Namespace A to access Pods in Namespace B — based on labels and namespace selectors.

### 24. What happens if Ingress is not routing traffic?
Ingress not routing traffic = app becomes unreachable from outside the cluster, even though the backend might be running fine.

### 25. How is traffic routed inside Kubernetes clusters?
Kubernetes routes internal traffic using Services + DNS + kube-proxy, ensuring stable and load-balanced communication between Pods — even across Nodes.

## State, Storage, Volumes

### 26. Difference between PV and PVC in Kubernetes

#### What is Persistent Volume (PV) and Persistent Volume Claim (PVC)?
- **PV (Persistent Volume)**: The actual disk or storage — like a hard drive or cloud disk
- **PVC (Persistent Volume Claim)**: A user's request to use that disk
- **Pod**: Uses the PVC to get access to the disk and read/write data

#### What's Happening Behind the Scenes
1. Admin or Kubernetes creates a locker (PV) with 5GB
2. Your app (Pod) says: "I need 5GB of space!" → It creates a PVC
3. Kubernetes matches your PVC to a suitable PV
4. Your Pod uses the PVC to mount the storage and write data — even if the Pod restarts, the data stays

### 27. What is the purpose of using StorageClass in Kubernetes?
In Kubernetes, a StorageClass defines how storage is provisioned dynamically — it's like a template or profile for automatically creating Persistent Volumes (PVs) when users create a PersistentVolumeClaim (PVC).

#### Purpose of StorageClass
To automate and customize the provisioning of storage in Kubernetes — so you don't have to pre-create PVs manually.

#### Without StorageClass:
- You must manually create PVs in advance
- PVCs won't bind unless a matching PV already exists

#### With StorageClass:
- Kubernetes will automatically create a PV for your PVC — using the parameters from the StorageClass
- Supports cloud-native, block, and file storage (like AWS EBS, Azure Disk, NFS, etc.)

### 28. What is PDB (Pod Disruption Budget) in Kubernetes?
In Kubernetes, a Pod Disruption Budget (PDB) is used to control how many Pods can be disrupted during voluntary disruptions — like node drain, cluster upgrades, or manual evictions.

#### Purpose of PDB
To ensure high availability of applications during planned disruptions by limiting how many Pods can be unavailable at the same time.

#### What Are Voluntary Disruptions?
These are intentional operations, such as:
- kubectl drain (e.g., during node maintenance)
- Cluster upgrades
- Scaling down replicas manually
- Admin-initiated Pod deletions

## Cluster Management & Upgrades

### 29. Explain the upgrade process for Kubernetes cluster with zero downtime
[Answer needed]

### 30. What key things should be verified post-upgrade?
- Cluster Health
- API Server Accessibility
- Pods and Deployments
- Network and DNS
- Storage and Volumes
- Ingress and External Access
- Logging and Monitoring
- Custom Resources (CRDs)
- Application Functional Testing

## Monitoring & Observability

### 31. How do you monitor the cluster through Prometheus?
[Answer needed]

### 32. Explain installation of Prometheus and Grafana
[Answer needed]

### 33. How do you secure your AKS cluster?
Securing an AKS (Azure Kubernetes Service) cluster involves multiple layers of protection across identity, network, workload, and platform.

- Use Kubernetes RBAC
  - Apply Role and RoleBinding or ClusterRoleBinding to control what users and service accounts can access

- Implement Network Policies
  - Use Kubernetes NetworkPolicies or Azure Network Policies to restrict pod-to-pod communication

- Enable Data Encryption
  - Enable encryption at rest using customer-managed keys (CMK)
  - Enable encryption in transit (TLS)

- Use Readiness/Liveness Probes
  - Ensure pods are only exposed when healthy

- Upgrade Regularly
  - Keep Kubernetes version and node OS patched and up to date

- Keep API Server Private or Use Authorized IP Ranges
  - Restrict kubectl access by whitelisting only trusted IPs

### 34. How do you make your EKS cluster highly available?
1. **Deploy EKS in Multiple Availability Zones (AZs)**
   - EKS supports multi-AZ by default for the control plane and can schedule nodes in multiple zones

2. **Use Multiple Node Groups (Managed or Self-managed)**
   - Split workloads across multiple node groups, potentially in different AZs or with different instance types

3. **Enable Cluster Autoscaler**
   - Dynamically adjusts node group sizes to handle load

4. **Use Horizontal Pod Autoscaler (HPA)**
   - Automatically adjusts Pod replica counts based on CPU/memory usage

5. **Use AWS Load Balancer Controller (ALB/NLB)**
   - Ingress should be redundant and spread across AZs

6. **Use Highly Available Storage**

7. **Control Plane HA (Managed by AWS)**
   - EKS Control Plane is automatically HA — spread across 3 AZs in the region

## Security & Access Control

### 35. What is RBAC?
RBAC lets you define permissions (what actions are allowed) and assign them to users, groups, or service accounts. RBAC = who can do what, where. It enforces access control over Kubernetes resources using Roles and Bindings, and is essential for securing any production-grade cluster.

### 36. Diff between Role and RoleBinding
- **Role**: Defines a set of permissions, and Describes what actions can be taken on which resources
- **RoleBinding**: Grants those permissions to a user/group/service account

### 37. What roles are provided for junior team member in k8s?
When assigning roles to junior team members, you want to follow the principle of least privilege — giving them just enough access to do their job without risking the stability or security of the cluster.

- Start with read-only or namespace-scoped roles
- Gradually allow write access to workloads
- Avoid giving access to secrets, RBAC, or cluster-wide roles

### 38. How do you use secrets in Kubernetes?
A Secret is a Kubernetes object that holds base64-encoded sensitive data, and can be mounted into Pods as files or exposed as environment variables.

1. Create a Secret
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: db-secret
type: Opaque
data:
  username: YWRtaW4=         
  password: czNjcjN0       
```

2. Use secret in a Pod

### 39. What encryption methods are used for secrets?
Kubernetes supports AES-CBC, AES-GCM, Secretbox, and KMS-based encryption methods for protecting Secrets at rest. KMS is the most secure and scalable option, especially for enterprise environments.

Examples:
- AWS KMS
- Azure Key Vault
- Google Cloud KMS
- HashiCorp Vault

The Kubernetes API server uses the KMS plugin to encrypt/decrypt resources

## Scheduling, Taints & Affinity

### 40. Difference between nodeSelector, node affinity vs taint, toleration
[Answer needed]

### 41. If I want to deploy my app on worker node2, what should I do?
- Option 1: Use nodeSelector (Simple & Common)
- Option 2: Use affinity (Advanced, Flexible)
- Option 3: Use Taints & Tolerations (To Limit Pod Placement)

### 42. When pods fail to drain, what do you do?
When Pods fail to drain:

🔍 Check the error and reason
```bash
kubectl drain <node-name> --ignore-daemonsets --delete-emptydir-data
```

Typical reasons:
- PodDisruptionBudget (PDB) violations
- Stuck finalizers
- Non-evictable pods (e.g., DaemonSets, static Pods)
- Volume detach delays

### 43. If I want pod to run on large/medium nodes only, how can I configure?
To ensure a Pod runs only on large or medium nodes in Kubernetes, you should use node labels combined with nodeSelector or nodeAffinity in your Pod or Deployment specification.

## Scaling & Auto Scaling

### 44. How does Kubernetes handle scaling?
Kubernetes handles scaling by dynamically adjusting the number of Pods, resources, or nodes based on the desired state or actual usage. It supports manual, automatic, and event-driven scaling at multiple layers.

#### Types of Scaling in Kubernetes
1. **Manual Scaling (Declarative or CLI)**
   ```yaml
   spec:
     replicas: 5
   ```

2. **Horizontal Pod Autoscaler (HPA)**
   - Auto-scales Pods based on CPU/memory or custom metrics
   
   🔧 How it works:
   - Watches metrics via Metrics Server
   - Adjusts replicas count to maintain target CPU (or memory) utilization

3. **Vertical Pod Autoscaler (VPA)**
   - Automatically adjusts CPU/memory requests and limits for Pods

4. **Cluster Autoscaler**
   - Dynamically scales the number of worker nodes in the cluster
   
   🔧 How it works:
   - Monitors unschedulable Pods
   - Adds new nodes when needed
   - Removes idle nodes when underutilized

### 45. What is HPA? What are all types of triggers used?
HPA (Horizontal Pod Autoscaler) automatically scales the number of Pod replicas for a Deployment, StatefulSet, or ReplicaSet based on observed resource usage (like CPU, memory) or custom/external metrics.

#### Types of HPA Triggers
1. **Resource Metrics (Built-in)**
   - Metrics come from the Kubernetes Metrics API, powered by the metrics-server

2. **Custom Metrics (Application-Level)**
   - Triggered by metrics you define and expose from your app

3. **External Metrics (Outside Cluster)**
   - Metrics from external services like AWS SQS, RabbitMQ, Kafka, etc.

4. **Event-Driven Triggers via KEDA**
   - [KEDA (Kubernetes Event-driven Autoscaler)] extends HPA with pluggable triggers

### 46. Difference between scaling and autoscaling
- **Scaling**: Manually adjusting resources
- **Autoscaling**: Automatically scaling based on system conditions or metrics

### 47. What is cluster autoscaler and horizontal pod autoscaler?
- **HPA**: Scales Pods based on CPU/memory/metrics
- **Cluster Autoscaler**: Scales Nodes based on pending Pods or idle nodes

### 48. How to configure cluster auto-scaling?
Cluster Autoscaler is a Kubernetes component that automatically adjusts the number of nodes in a cluster based on pending or idle pods. If there are pods that can't be scheduled due to insufficient resources, the autoscaler adds nodes. If nodes are underutilized and their pods can be moved to other nodes, it scales down by removing them.

I've configured Cluster Autoscaler in EKS by:
- Enabling auto-scaling on the node group and tagging the Auto Scaling Group (ASG) with the required tags
- Deploying the Cluster Autoscaler using Helm with auto-discovery enabled for my cluster name and region
- Ensuring IAM permissions were granted via an IAM role or service account
- Configuring pods with proper resource requests, which is critical for the autoscaler to work

## Debugging & Troubleshooting

### 49. How to troubleshoot ImagePullBackOff error?
A ImagePullBackOff error in Kubernetes means the Pod failed to pull the container image, and Kubernetes is backing off from trying again after repeated failures.

### 50. If pod is in pending state, how do you troubleshoot?
When a Pod is in the Pending state, it usually indicates a scheduling issue. I follow a step-by-step approach to troubleshoot it:

1. Describe the Pod
   ```bash
   kubectl describe pod <pod-name> -n <namespace>
   ```

2. Check Resource Requests and Limits
   - Verify if the Pod's CPU and memory requests are too high to fit on any node

3. Verify Node Availability
   ```bash
   kubectl get nodes
   ```

4. Check Node Selectors and Affinity
   - Check for node affinity or nodeSelector rules that might limit scheduling

5. Check PVCs (Persistent Volume Claims)
   - If the Pod uses volumes, check if the PersistentVolumeClaim is bound

### 51. If pod is constantly restarting, what steps to follow?
If a Pod is restarting, I first check kubectl describe and logs to determine the root cause — usually a crash, failed health check, or bad config. I inspect probes, environment variables, mounted secrets, volume claims, and validate the app image. Once fixed, I redeploy and monitor the Pod behavior again.

### 52. What happens if pod.yaml failed?
If pod.yaml fails, it could mean either a syntax error in the manifest, a validation error during creation, or a runtime issue after creation. I check the error message during apply, then inspect the Pod state, describe it, and review logs to find and fix the issue.

If a pod.yaml file fails during deployment in Kubernetes, it means the Pod was not created successfully, or it was created but did not reach the Running or Ready state.

### 53. Pod fails to schedule: 0/5 nodes are available: insufficient memory → How to debug?
When I see '0/5 nodes are available: insufficient memory', it means the Kubernetes scheduler couldn't place the Pod because all 5 nodes lack enough free memory to satisfy the Pod's request. I troubleshoot it by checking the Pod's memory requests, the actual node usage, and whether cluster autoscaler is enabled to add more capacity.

## Commands & Usage

### 54. What commands used in Kubernetes?

#### Cluster Info
```bash
kubectl cluster-info
kubectl version
kubectl config current-context
```

#### Pods
| Purpose | Command |
|---------|---------|
| List Pods | `kubectl get pods` |
| List in all namespaces | `kubectl get pods -A` |
| Describe a Pod | `kubectl describe pod <pod-name>` |
| View logs | `kubectl logs <pod-name>` |
| Logs of crashed container | `kubectl logs --previous <pod-name>` |
| Exec into Pod | `kubectl exec -it <pod-name> -- /bin/bash` |

#### Deployments
| Purpose | Command |
|---------|---------|
| List Deployments | `kubectl get deployments` |
| Create from YAML | `kubectl apply -f deployment.yaml` |
| Scale a Deployment | `kubectl scale deployment <name> --replicas=3` |
| Rollout status | `kubectl rollout status deployment <name>` |
| Restart Deployment | `kubectl rollout restart deployment <name>` |
| Delete Deployment | `kubectl delete deployment <name>` |

#### Services
| Purpose | Command |
|---------|---------|
| List Services | `kubectl get svc` |
| Describe Service | `kubectl describe svc <svc-name>` |
| Expose Deployment | `kubectl expose deployment <name> --type=NodePort --port=80` |

#### Nodes
| Purpose | Command |
|---------|---------|
| List Nodes | `kubectl get nodes` |
| Describe Node | `kubectl describe node <name>` |
| Cordon a Node | `kubectl cordon <node-name>` |
| Drain a Node | `kubectl drain <node-name> --ignore-daemonsets --delete-emptydir-data` |
| Uncordon Node | `kubectl uncordon <node-name>` |

#### Other Common Commands
| Purpose | Command |
|---------|---------|
| Apply YAML | `kubectl apply -f <file>.yaml` |
| Delete Resource | `kubectl delete -f <file>.yaml` |
| View Events | `kubectl get events --sort-by=.metadata.creationTimestamp` |
| Namespace-specific | `kubectl get pods -n <namespace>` |
| Switch Namespace | `kubectl config set-context --current --namespace=<ns>` |

### 55. What is the command to add annotation/labels to existing pod?
```bash
kubectl label pod <pod-name> <key>=<value>
kubectl annotate pod <pod-name> <key>=<value>
```

### 56. Write deployment file for Kubernetes
[Answer needed]

### 57. What is inside deployment.yaml or Helm chart?
[Answer needed]

### 58. What is the output of Helm chart?
The output of a Helm chart is a set of Kubernetes manifest files (YAML) that can be applied to your cluster to deploy resources like Deployments, Services, Ingress, ConfigMaps, etc.

## Miscellaneous Kubernetes Topics

### 59. What are namespaces in Kubernetes?
Namespaces in Kubernetes are used to logically separate resources within the same cluster. They help with multi-tenancy, access control, and resource quotas by creating isolated environments for different teams, projects, or environments like dev, test, and prod.

### 60. Difference between stateless and stateful application
Stateless apps treat each request independently and don't rely on stored context, while stateful apps need to remember data between interactions and usually depend on persistent storage or stable network identity.

### 61. How do you manage data of stateless applications?
In stateless applications, we manage data externally — not inside the application itself. This means all user sessions, files, databases, and configuration states are stored in external services like databases, caches, cloud storage, or volume mounts. This ensures that the application can be scaled, restarted, or replaced without any data loss or inconsistency.

### 62. How many containers can run in a pod?
A Kubernetes Pod can run one or more containers, but typically runs one. When multiple containers are used, they share the same network namespace, storage volumes, and IPC space. These multi-container pods are used for tightly coupled components, such as a main app with a sidecar container.

### 63. What is the use case of multi-container pod?
A multi-container Pod is used when multiple tightly coupled containers need to run together and share resources like network, storage, and lifecycle. Common use cases include sidecar patterns, logging agents, data adapters, and proxies that enhance or support the main container without running independently.

### 64. Can we deploy services on master node?
By default, Kubernetes does not schedule Pods—including Services—on master nodes to protect the control plane from user workloads. However, you can deploy services on the master node by removing the taints that prevent scheduling, or by tolerating those taints in your Pod specs.

### 65. Limiting the resource usage not through deployment.yaml but via namespace
[Answer needed]

### 66. What happens if etcd stops working?
If etcd goes down, the Kubernetes control plane becomes non-functional. While running Pods may continue to operate temporarily, no new Pods can be scheduled, configurations can't be updated, and cluster state becomes stale. The API server won't be able to read/write any data, so core operations like deployments, scaling, and service discovery fail until etcd is restored.

### 67. What is the behavior of restartPolicy: Never?
restartPolicy: Never means the Pod will not be restarted automatically by Kubernetes if the container inside it fails or exits, regardless of the exit code. This setting is mostly used for short-lived or one-time jobs like batch processing or debugging. It's ideal for short-lived tasks, not long-running services.

### 68. Custom Resource in Kubernetes
[Answer needed]

### 69. How do you use Custom Resources in Kubernetes?
[Answer needed]

### 70. Design Istio setup for your Kubernetes cluster
[Answer needed]

### 71. What is Calico?
Calico is a networking and network security solution for Kubernetes. It acts as a CNI (Container Network Interface) plugin that provides high-performance networking between Pods, and also supports advanced network policies for secure, fine-grained traffic control. Calico can work with or without an overlay network and supports both Kubernetes-native and Calico-native policies.

### 72. How to take backup of Kubernetes cluster?
To back up a Kubernetes cluster, I focus on two areas:

1. Backing up etcd, which contains all cluster state (Deployments, Services, ConfigMaps, Secrets, etc.)
2. Backing up PersistentVolumes, which store actual application data

For etcd, I use the etcdctl snapshot feature or Velero if I want cluster-wide disaster recovery. For app-level data, I use volume snapshot tools or backup solutions like Velero with CSI plugins, depending on the storage provider.

### 73. What are the layers in Kubernetes architecture?

| Layer | Description |
|-------|-------------|
| Infrastructure Layer | Physical or virtual servers |
| Node Layer | Runs containers in Pods |
| Control Plane Layer | Orchestrates the cluster |
| Abstraction Layer | Defines desired workloads and behavior |
| Interaction Layer | User and automation interfaces |

### 74. Can you write extensions in Grafana?
[Answer needed]

### 75. If control plane goes down what happens to worker nodes?
If the Kubernetes control plane goes down, the worker nodes and the containers running on them will continue to operate, but no new Pods can be scheduled, and no cluster changes (like deployments or scaling) can be made. The cluster becomes static until the control plane is restored.