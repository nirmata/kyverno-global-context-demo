## Load Testing Demonstration: Kyverno GCTX Policy

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
    _Follow Kyverno's official installation instructions to install Kyverno on the cluster._

4.  **Clone the Load Testing Repository:**

    ```bash
    git clone https://github.com/KhaledEmaraDev/load-testing.git
    cd load-testing
    ```

    _This will clone the project containing the load tests._

5.  **Switch to the Correct Branch:**

    ```bash
    git checkout splunk-gctx-demo
    ```

    _This will ensure you are using the branch dedicated to this demonstration._

6.  **Apply the Kyverno Policy:**

    ```bash
    kubectl apply -f gctx-policy.yaml
    ```

    _This applies the policy with GCTX that is under test._

7.  **Run the Load Test**
    ```bash
    make run --  k6/tests/splunk-gctx-demo.js --vus 100 --iterations 1000
    ```
    _This command executes the load test._

**Performance Results**

The following results compare the average HTTP request time with and without GCTX enabled policy under load.

**Without GCTX:**

```
avg=3.71s   min=2.63ms  med=3.94s   max=4.81s   p(90)=4.29s   p(95)=4.39s
```

**With GCTX:**

```
avg=1.19s   min=7.41ms  med=1.2s    max=2.9s     p(90)=1.89s    p(95)=2.09s
```

**Analysis:**

As you can see, using GCTX in the Kyverno policy significantly improved performance, reducing the average request time from **3.71 seconds to 1.19 seconds**. This demonstrates the positive impact of using GCTX for policy enforcement efficiency.

**Key Takeaways:**

- GCTX optimizes policy execution, leading to faster response times.
- The load test simulates a realistic environment for performance analysis.
- These results highlight the benefits of GCTX in resource-constrained Kubernetes environments.
