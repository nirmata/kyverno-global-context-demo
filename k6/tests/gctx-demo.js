import http from "k6/http";
import { check } from "k6";

import {
  buildKubernetesBaseUrl,
  getParamsWithAuth,
  randomString,
} from "./util.js";

const baseUrl = buildKubernetesBaseUrl();
const params = getParamsWithAuth();
params.headers["Content-Type"] = "application/json";

const namespaceName = "nirmata-gctx-demo";

export function setup() {
  const createNamespaceRes = http.post(
    `${baseUrl}/api/v1/namespaces`,
    JSON.stringify({
      apiVersion: "v1",
      kind: "Namespace",
      metadata: {
        name: namespaceName,
        annotations: {
          "nirmata.io/vault-addr": "addr0",
        },
      },
    }),
    params
  );

  check(createNamespaceRes, {
    "verify namespace creation is 201": (r) => r.status === 201,
  });
}

export default function () {
  const podName = `pause-${randomString(8)}`;
  const podDefinition = {
    apiVersion: "v1",
    kind: "Pod",
    metadata: {
      annotations: {
        "nirmata.io.vault/init-container": "true",
      },
      name: podName,
      namespace: namespaceName,
    },
    spec: {
      containers: [
        {
          image: "registry.k8s.io/pause:latest",
          name: "pause",
          resources: {},
        },
      ],
      volumes: [
        {
          name: "vault-token",
          emptyDir: {},
        },
      ],
      terminationGracePeriodSeconds: 0,
    },
  };

  const createPodRes = http.post(
    `${baseUrl}/api/v1/namespaces/${namespaceName}/pods?dryRun=All`,
    JSON.stringify(podDefinition),
    params
  );

  check(createPodRes, {
    "verify pod creation is 201": (r) => r.status === 201,
  });

}

export function teardown() {
  const deleteNamespaceRes = http.del(
    `${baseUrl}/api/v1/namespaces/${namespaceName}`,
    null,
    params
  );

  check(deleteNamespaceRes, {
    "verify namespace deletion is 200": (r) => r.status === 200,
  });
}