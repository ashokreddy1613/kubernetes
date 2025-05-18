# Kubernetes Interview Questions & Answers (EKS - Managed Node Groups & Fargate)

This document provides detailed answers to common Kubernetes interview questions with a specific focus on Amazon EKS, including both **Managed Node Groups** and **Fargate** use cases.

---


---

### 1. A Deployment is stuck with "ImagePullBackOff" — how do you troubleshoot it?

- "When a pod shows ImagePullBackOff, it means the container image could not be pulled from the container registry.
- Common causes:
  - Incorrect image name or tag
  - Private registry access issues (fix with `imagePullSecrets`)
  - Network issues on the node (DNS, proxy)
- Debug
  - Check pod events: `kubectl describe pod <pod-name>`
  - Check Image name and Tag
  - If image is in private- you need to use ImagePulllSecret in yaml 
    ```bash
    spec:
      containers:
      - name: myapp
        image: <registry>/<repo>:<tag>
      imagePullSecrets:
      - name: my-registry-secret
```
Also, you need to create a secret by providing registry credentials using cmd

---

### 2. How would you recover a Kubernetes cluster if etcd goes down?

- On EKS: In EKS, the etcd control plane is fully managed and backed by AWS. I cannot directly access or restore etcd myself.
- What I do is :
  - Clean up unused workloads (pods, secrets, configmaps)
  - If control plane is unresponsive, contact AWS support
- On self-managed: restore from etcd snapshot, compact and defragment, restart kube-apiserver

---

### 3. How would you manage application secrets securely in Kubernetes?

- I use a layered approach to manage secrets in Kubernetes securely, combining native Secret resources, RBAC controls, encryption at rest, and external secret managers like AWS Secrets Manager or Vault.

- 1. Use Kubernetes Secrets
  I create Secrets to store sensitive values like API keys, DB passwords, or tokens
- 2. Encrypt Secrets at Rest (enabled by default in EKS)
  In EKS, secrets are automatically encrypted at rest using AWS KMS (with AWS-managed or customer-managed keys).
- 3. Control Access via RBAC (Least Privilege)
  I restrict who/what can read Secrets using Kubernetes Roles/RoleBindings.
- 4. Use External Secrets Manager (for Production-grade setups)
  I avoid committing secrets to Git by syncing Kubernetes Secrets from secure external stores like:

    AWS Secrets Manager
    AWS Systems Manager Parameter Store
    HashiCorp Vault

---

### 4. How would you drain a node for maintenance without affecting availability?

- There are two days to do drain a node
1. Manually 
  - Prepare the workload
    Ensure each app has:
    replicas: 2+
    Proper readinessProbe and livenessProbe
    A PodDisruptionBudget (PDB) to avoid full outages

  - Cordon the node
    ```bash
    kubectl cordon <node>
    ```
  - Drain the node
    ```
    kubectl drain <node> --ignore-daemonsets --delete-emptydir-data
    ```
  - Replace or upgrade node
    If updating AMI or patching:
    Use eksctl upgrade nodegroup
    Or update via AWS Console / Terraform
  - Then
    ```
    kubectl uncordon <node-name>  # or delete node if replacing
  ```
2. Use `eksctl upgrade nodegroup` (Recommended for Patching/AMI Updates)
    ```
      eksctl upgrade nodegroup \
      --cluster <cluster-name> \
      --name <nodegroup-name> \
      --approve
    ```
  This performs a rolling drain, cordon, and replacement of nodes one by one.
- Use `eksctl upgrade nodegroup` for routine, full-nodegroup patching or AMI upgrades — it’s safer, automated, and scales well.
- Use `cordon + drain` for targeted, manual intervention — ideal for troubleshooting, testing, or small rolling actions.

---

### 5. A service is not discoverable inside the cluster — where would you start investigating?
- 1. Verify the Service Exists and Is Properly Defined
    ```bash
    kubectl get svc -n <namespace>
    kubectl describe svc <service-name> -n <namespace>
```
    ✅ Check:
    ClusterIP or Headless service exists
    Correct port, targetPort, and protocol
    selector labels match the expected pods

- 2. Check if the Service Has Endpoints

    ```bash
    kubectl get endpoints <service-name> -n <namespace>
```
  If endpoints are empty, the service cannot route traffic because:
  Verify pod labels match service selector

- 3. Inspect CoreDNS logs if DNS fails
- 4. Check Network Policies (if used)
---

### 6. How would you control pod-to-pod traffic for enhanced security?
- To secure pod-to-pod communication, I use Kubernetes NetworkPolicies to define which pods are allowed to talk to each other based on labels, namespaces, and ports.
- Use NetworkPolicies:
  - Default deny + allow specific ingress/egress

---

### 7. How would you scale a Kubernetes cluster dynamically based on CPU usage?
1. `Horizontal Pod Autoscaler (HPA)` — Scale pods based on CPU
- To scale a Kubernetes cluster dynamically based on CPU usage, I use Horizontal Pod Autoscaler (HPA) to scale pods, and Cluster Autoscaler or Karpenter to scale the underlying nodes — depending on whether I’m using Managed Node Groups or Fargate in EKS."
2. `EKS with Managed Node Groups`
  - Use Cluster Autoscaler:
  - Automatically adds/removes EC2 nodes based on pending pods 
Integrates with Auto Scaling Groups
3. `EKS with Fargate`
  - Fargate doesn't use Cluster Autoscaler — it auto-scales per pod.
  ✅ When HPA increases pod count:
   -  Fargate launches a new isolated runtime per pod
   -  No need to scale nodes manually

In Fargate, AWS handles node provisioning automatically, so scaling happens per pod without user intervention. 

---

### 8. How would you implement blue-green or canary deployments in Kubernetes?

- Use Argo Rollouts, Ingress routing, or manual Service switching
- Canary: deploy v2 with small replica count, increase gradually
- Blue-Green: deploy both, shift Service selector

---

### 9. How do you troubleshoot a pod that is stuck in "Pending" state?
- A pod stuck in Pending means it hasn't been scheduled to a node. I troubleshoot by checking scheduling constraints, resource availability, volume bindings, and Fargate profile alignment (if applicable).

 1. Describe the Pod to View Events
      `kubectl describe pod` → look at Events
- Common causes:
  - No available nodes (resource constraints)
  - PVC binding issues
  - NetworkPolicy or taints
- Fargate: check Fargate profile matching namespace + labels
- Check Node resource availability
  
---

### 10. How would you back up and restore Kubernetes resource configurations?

1. GitOps as the Primary Backup Source (Recommended)
  All resource manifests (Deployments, Services, ConfigMaps, etc.) are stored and version-controlled in Git.
2. Manual Backup Using `kubectl` (Quick and Scriptable)
3. Secrets & ConfigMaps: Secure Handling
    Use Sealed Secrets or External Secrets Operator
  Integrate with AWS Secrets Manager or SSM Parameter Store
  ✅ Prevents secrets from being stored as plaintext in Git

I use GitOps as the primary strategy to manage and restore Kubernetes resources declaratively. For full backups including volumes, I use Velero with S3 and EBS in EKS Managed Node Groups. For secrets, I integrate AWS Secrets Manager or use Sealed Secrets. This setup provides versioned, auditable, and resilient recovery for both MNG and Fargate workloads.

---

### 11. A pod is stuck in "CrashLoopBackOff" — what will you do?
A pod in CrashLoopBackOff means its container starts, crashes, and Kubernetes is repeatedly trying to restart it. I investigate logs, lifecycle probes, and container configs to determine the root cause, then take corrective action.
1. Describe the Pod and Check Events
  ```bash
  kubectl describe pod <pod-name> -n <namespace>
  ```
  Look at:
  Last State: Terminated (exit code, reason), and Probes (readiness, liveness)
2. View Container Logs
  - Check logs: `kubectl logs <pod>`

- Common causes: app crash, bad config, missing env vars
- Fix root cause and redeploy or restart Deployment

---

### 12. How do you perform a zero-downtime deployment in Kubernetes?

I use rolling updates with readiness probes and PodDisruptionBudgets to ensure Kubernetes only routes traffic to healthy pods and never terminates all instances at once. This works seamlessly in both Managed Node Groups and Fargate, providing truly zero-downtime deployments.
- Use Deployments with rolling updates
- Ensure readiness probes, liveness probes, and minAvailable via PDBs
- ArgoCD or Helm can also manage rollout strategy

---

### 13. How do you design a Kubernetes cluster for high availability?

In EKS, AWS provides a highly available control plane, and I focus on architecting resilient workloads and infrastructure using Managed Node Groups and optionally Fargate."
 1. Control Plane High Availability (EKS)
    In Amazon EKS, the control plane is fully managed and HA by default.
    Spread across multiple Availability Zones (AZs) in the region.
    Comes with automatic failover, leader election, and 99.95% SLA.
 2. Multi-AZ Worker Nodes
    Create node groups across at least 2–3 AZs
    Use auto-scaling groups with health checks
    Fargate:
    AWS automatically places pods in available zones, but lacks fine-grained zone control.
    Use multiple Fargate profiles across namespaces for logical isolation.
 3. 3. Application-Level HA
    Deploy at least replicas: 2 for critical apps
    Use readinessProbes and livenessProbes
    Protect workloads with PodDisruptionBudgets
 4. Highly Available Ingress and Load Balancing
    Use AWS ALB Ingress Controller (or NGINX in HA mode)
    Configure multi-AZ target groups
 5. Storage HA (if using stateful workloads)
    Use EBS with pod-level replication via StatefulSets (single-AZ)
    Or use EFS or FSx for multi-AZ, shared file storage
 6. Observability and Auto-Healing
    Use CloudWatch, Prometheus, Grafana for alerts and dashboards
    Set up Cluster Autoscaler or Karpenter to auto-replace failed nodes

---

### 14. How would you debug a failing service in Kubernetes?

- Check:
  - Pod health (`kubectl get pods`)
  - Service and Endpoints
  - DNS resolution
  - Logs and metrics
  - Ingress/network path

---

### 15. What’s your approach if a node suddenly goes down?

If a node suddenly goes down in Kubernetes, I treat it as an infrastructure-level failure and immediately assess its impact on workloads.
 1. Detect the Failed Node
    `kubectl get nodes`
    ✅ A NotReady or Unknown status indicates a failure or network issue.
  Also:
     `kubectl describe node <node-name>`
     Look for:
      DiskPressure, MemoryPressure, NetworkUnavailable
      Events pointing to kubelet or EC2 issues

 2. Check Impacted Pods
    `kubectl get pods -o wide --all-namespaces | grep <node-name>`
  
  - EKS Managed Node Groups will automatically replace failed nodes using the backing Auto Scaling Group. I just ensure my launch config is valid, IAM roles are correct
  - Fargate has no nodes to monitor directly.

---

### 16. How would you implement autoscaling for your apps in Kubernetes?

- HPA (pods) based on CPU/memory/custom metrics
- MNG:
  - Use Cluster Autoscaler or Karpenter
- Fargate:
  - Only HPA supported; no CA

---

### 17. How do you manage secrets in Kubernetes?

- Kubernetes Secrets + RBAC + KMS
- For EKS: use AWS Secrets Manager + External Secrets Operator
- Use Sealed Secrets/SOPS for GitOps workflows

---

### 18. How would you troubleshoot network issues between pods?

When pods can't communicate, I troubleshoot in layers — from DNS and pod health to NetworkPolicies and CNI plugin behavior. In EKS, I also check AWS-specific configurations like ENIs, security groups, and Fargate profiles when relevant.

 1. Verify Pod Health and Status

    ```bash
      kubectl get pods -o wide -n <namespace>
      kubectl describe pod <pod-name> -n <namespace>
  ```
      Ensure both source and destination pods are:
        In Running state
        Passing readiness and liveness probes
        Scheduled on reachable nodes (same VPC/subnet)

 2. Test Direct Pod-to-Pod Communication

      `kubectl exec -it <pod> -- curl/ping<target-pod>` 
      if this fails:
      Could be a CNI issue Or NetworkPolicy restriction
 3. Inspect NetworkPolicies
 4. Check DNS Resolution
 5. Check aws-node (VPC CNI Plugin)
- Fargate: ENI per pod; ensure IPs are not exhausted

---

### 19. In Amazon EKS, I upgrade the Kubernetes cluster in two stages: first the control plane, then the data plane (nodes or Fargate). I ensure zero downtime by using managed rolling upgrades, readiness probes, and PodDisruptionBudgets to keep services highly available throughout."

1. Upgrade the Control Plane (Managed by AWS)
    `eksctl upgrade cluster --name <cluster-name>`
  ✅ AWS handles the upgrade with no impact on running workloads
  ✅ Compatible API versions must be ensured first
2. Upgrade Node Groups (Managed Node Groups)
Upgrade worker nodes after the control plane to maintain compatibility.

  Option 1: Rolling upgrade using eksctl
    `eksctl upgrade nodegroup --cluster <name> --name <nodegroup-name> --kubernetes-version <version> --approve`
    - AWS replaces old nodes one by one
    - Uses cordon + drain + replace pattern
  Option 2: Replace with a new node group
      Create a new MNG with updated version/AMI 
      Migrate workloads using labels or taints
      Delete old node group when empty
    ✅ Safer for large or sensitive workloads
- Fargate profiles are automatically upgraded behind the scenes by AWS

---

### 20. How do you implement blue-green deployments in Kubernetes?

- Deploy both versions (`blue` and `green`)
- Point Service selector to the desired version
- Validate green, then switch
- Use Ingress or ALB annotations for advanced routing

---

### 21. The Kubernetes control plane is running out of etcd storage — what’s your recovery plan?

- In EKS:
  - You can’t access etcd; clean up high-volume resources (e.g., old pods, events, secrets)
  - Open AWS support case if needed
- In self-managed: compact, defrag, and snapshot etcd

---

### 22. How would you debug a node that has been marked "NotReady" in a production cluster?

If a node is marked NotReady, I investigate both Kubernetes-level status and underlying infrastructure issues to determine whether it’s a networking, resource, or system failure. In EKS with Managed Node Groups, I also check the EC2 instance health and autoscaling behavior.
- `kubectl describe node`
- Check:
  - Kubelet logs
  - Disk pressure, network status
- Fargate: not applicable

In EKS Managed Node Groups, I debug NotReady nodes by checking their conditions in Kubernetes, then validating EC2 instance health in AWS. If the node is unreachable or fails system checks, I drain and delete it — and the node group will automatically replace it without manual provisioning."

---

### 23. You see "OOMKilled" pods frequently — how do you adjust resource requests/limits?

- Set `resources.requests.memory` and `resources.limits.memory`
- Use `kubectl top pod` or Prometheus to right-size
- Set `limits` to avoid exhausting node memory
See book
---

### 24. How would you securely rotate secrets in Kubernetes without downtime?

1. Store Secrets Securely (Best Practices)
  - Use kubectl create secret or sync secrets from AWS Secrets Manager using:
  - External Secrets Operator (ESO)
  - HashiCorp Vault
  - Use KMS encryption (enabled by default in EKS)

2. Rotation Strategy Options
 ✅ Option A: Manual Rotation (with versioning)
  - Create a new Secret (e.g., my-secret-v2)
  - Update Deployment to reference the new secret:

  ```bash
      envFrom:
      - secretRef:
        name: my-secret-v2
  ```
  - Trigger a rolling update:
    `kubectl rollout restart deployment <app-name>`
   Keeps app running using the old secret until the new one is active.
 Option B: Use External Secrets Operator (ESO)
    Sync secrets from AWS Secrets Manager
    AWS Secrets Manager handles versioning
    Kubernetes Secret is updated automatically
---

### 25. How would you troubleshoot a "502 Bad Gateway" error from an Ingress Controller?

- Check:
  - Backend pod readiness
  - Service target port
  - Ingress rule path
  - NGINX/ALB Ingress logs
- Validate DNS resolution

---

### 26. Your cluster certificates are expiring soon — how would you renew them without downtime?
In EKS, control plane certificates are automatically managed and rotated by AWS — there's no manual renewal process needed."

---

### 27. How would you set up network policies to isolate services in Kubernetes?

- Apply default deny all:
```yaml
policyTypes: [Ingress, Egress]
```
- Allow specific namespace/pod traffic
- Ensure CNI plugin (Calico/Cilium) supports NetworkPolicies

---

### 28. How would you configure PodDisruptionBudgets for high availability during node upgrades?

```yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
spec:
  minAvailable: 2
```

- Ensures at least N pods stay up
- Protects critical workloads during upgrades/drain

---

### 29. How would you implement GitOps (e.g., using ArgoCD) for Kubernetes deployments?

- Store manifests in Git (Helm/Kustomize/raw YAML)
- Install ArgoCD
- Create Applications linked to Git
- Use `automated sync` + `selfHeal`
- Optional: use ApplicationSets for multi-env deployments

---

### 30. How would you design a multi-cluster Kubernetes architecture?

- Use separate clusters per region or team
- Sync with ArgoCD (ApplicationSets)
- Connect via Service Mesh (Istio/Submariner)
- Centralized monitoring/logging (Thanos/Loki/CloudWatch)
- Use Route53 or Global Ingress for cross-cluster traffic

---

