
#!/usr/bin/env bash

set -euo pipefail

NAMESPACE="load-tests"

cleanup() {
    echo "Performing cleanup..."
    if [[ "$@" =~ "--no-teardown" ]]; then
        echo "No teardown requested"
    else
        kubectl delete ns "$NAMESPACE" || true
        kubectl delete clusterrolebinding load-test || true
    fi
    pkill -f "kubectl proxy" || true
}

# Set trap to call cleanup function on script exit
trap 'cleanup $@' EXIT

TEST="$1"

echo "Deploying namespace..."
kubectl create ns "$NAMESPACE"

echo "Deploying RBAC..."
kubectl apply -n "$NAMESPACE" -f k6/rbac.yaml

echo "Running test..."
export KUBERNETES_HOST=localhost
export KUBERNETES_PORT=8001
export KUBERNETES_TOKEN=$(kubectl -n "$NAMESPACE" get secret load-test-token -o jsonpath='{.data.token}' | base64 -d)
export TEST_NAMESPACE="$NAMESPACE"

kubectl proxy &
sleep 1
k6 run $* | tee test-output.log
