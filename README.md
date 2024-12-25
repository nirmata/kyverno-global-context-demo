## Load Testing Demonstration: Kyverno Global Context (GCTX) Policy

This document outlines the process and results of a load test demonstrating the performance impact of a Kyverno policy using GCTX. The goal is to showcase the improved efficiency achieved through GCTX.

**Demonstration Overview:**

This demo will:

1. **Setup a Kubernetes environment:** A local Kubernetes cluster is created with limited resources to simulate a resource-constrained environment.
2. **Deploy Kyverno:** The policy engine used for enforcement is installed.
3. **Apply a GCTX-enabled policy:** The target Kyverno policy that utilizes GCTX is applied to the cluster.
4. **Run a load test:** A comparison of performance is made with and without the applied GCTX enabled policy.
5. **Review results:** Performance metrics, specifically HTTP request time, will be presented and compared.

**Setup Instructions**

Follow these steps to replicate the demonstration:

1.  **Create a Local Kubernetes Cluster (Kind):**

    ```bash
    kind create cluster
    ```

    _This command will create a local Kubernetes cluster using Kind._

2.  **Limit CPU Resources:**

    ```bash
    docker update --cpus=1 kind-control-plane
    ```

    _This limits the control plane CPU, simulating a resource-constrained environment._

3.  **Install Kyverno:**
   
   ```sh
   helm repo add kyverno https://kyverno.github.io/kyverno/
   helm repo update
   helm install kyverno kyverno/kyverno -n kyverno --create-namespace
   ```

    _Follow [Kyverno's official installation instructions](https://kyverno.io/docs/installation/) to install Kyverno on the cluster._

4. **Install K6.io command line**

The K6.io tool is used for performance and load testing. Follow the instructions to install the command line for your platform:

    https://grafana.com/docs/k6/latest/set-up/install-k6/


5.  **Run the load tests with the policy which makes API calls :**

    ```bash
    make test-api-call
    ```

    _This command executes the load test using the original policy._

6.   **Run the load tests with the policy which uses a Gobal Context :**
 
    ```bash
    make test-gctx
    ```

    _This applies the policy using a global context to cache namespaces._


**Performance Results**

The following results compare the average HTTP request time with and without GCTX enabled policy under load.

**With API Calls:**

```
     http_req_duration..............: avg=3.72s    min=3.34ms med=3.99s max=5.37s  p(90)=4.03s   p(95)=4.17s
```

**With Global Context:**

```
     http_req_duration..............: avg=337.49ms min=3.31ms med=300.35ms max=805.96ms p(90)=693.94ms p(95)=795.19ms
```

**Analysis:**

Using Global Context in the Kyverno policy significantly improved performance, reducing the average request time from **3.72 seconds to 337 milliseconds**. This demonstrates the positive impact of using the global context and reducing API calls for policy enforcement efficiency.

**Key Takeaways:**

- The Global Context optimizes policy execution by reducing API calls, leading to faster response times.
- The load test simulates an environment for performance analysis. It can be easily customized for different scenarios.
- These results highlight the benefits of Global Context in resource-constrained Kubernetes environments.
