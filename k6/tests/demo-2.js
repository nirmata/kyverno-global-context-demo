import http from "k6/http";
import { check, sleep } from "k6";

import {
  buildKubernetesBaseUrl,
  getParamsWithAuth,
  randomString,
} from "./util.js";

const baseUrl = buildKubernetesBaseUrl();
const params = getParamsWithAuth();
params.headers["Content-Type"] = "application/json";

const namespaceName = "kyverno-gctx-demo";

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

  for (let i = 1; i <= 100; i++) {
    const ingressName = `example-ingress-${i}`;
    const hostname = `example-${i}.com`;
    const serviceName = `example-service-${i}`;
    const ingressDefinition = {
      apiVersion: "networking.k8s.io/v1",
      kind: "Ingress",
      metadata: {
        name: ingressName,
        namespace: namespaceName,
      },
      spec: {
        rules: [
          {
            host: hostname,
            http: {
              paths: [
                {
                  path: `/example-path-${i}`,
                  pathType: "Prefix",
                  backend: {
                    service: {
                      name: serviceName,
                      port: {
                        number: 8080,
                      },
                    },
                  },
                },
              ],
            },
          },
        ],
      },
    };

    const createIngressRes = http.post(
      `${baseUrl}/apis/networking.k8s.io/v1/namespaces/${namespaceName}/ingresses`,
      JSON.stringify(ingressDefinition),
      params
    );

    check(createIngressRes, {
      [`verify ingress ${ingressName} creation is 201`]: (r) =>
        r.status === 201,
    });
  }
  sleep(1);
}

export default function () {
  const blockedIngressDefinition = {
    apiVersion: "networking.k8s.io/v1",
    kind: "Ingress",
    metadata: {
      name: "blocked-ingress",
      namespace: namespaceName,
    },
    spec: {
      rules: [
        {
          host: "example-50.com",
          http: {
            paths: [
              {
                path: "/blocked-path",
                pathType: "Prefix",
                backend: {
                  service: {
                    name: "blocked-service",
                    port: {
                      number: 8080,
                    },
                  },
                },
              },
            ],
          },
        },
      ],
    },
  };

  const createBlockedIngressRes = http.post(
    `${baseUrl}/apis/networking.k8s.io/v1/namespaces/${namespaceName}/ingresses`,
    JSON.stringify(blockedIngressDefinition),
    params
  );

  check(createBlockedIngressRes, {
    "verify blocked ingress creation is not 201": (r) =>
      r.status !== 201 && r.status !== 200,
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
