#!/usr/bin/env bash
# Deploy MyLinks to a Kubernetes cluster with dynamic image tag selection and replicas.
# Usage:
#   ./scripts/deploy-k8s.sh [TAG] [NAMESPACE] [REPLICAS]
# Example:
#   ./scripts/deploy-k8s.sh v0.4.0
#   ./scripts/deploy-k8s.sh latest default 2
#   ./scripts/deploy-k8s.sh master my-namespace 1

set -euo pipefail

TAG="${1:-latest}"
NAMESPACE="${2:-${NAMESPACE:-default}}"
REPLICAS="${3:-${REPLICAS:-1}}"
USE_HELM="${USE_HELM:-auto}"

if [ "$REPLICAS" -gt 1 ]; then
  echo "⚠️ Warning: Running more than 1 replica with embedded SQLite storage and ReadWriteOnce PVC may cause database locks or mount conflicts."
fi

echo "=========================================================="
echo "🚀 Deploying MyLinks to Kubernetes"
echo "   Image Tag : ${TAG}"
echo "   Replicas  : ${REPLICAS}"
echo "   Namespace : ${NAMESPACE}"
echo "=========================================================="

if [ "$USE_HELM" = "auto" ]; then
  if command -v helm >/dev/null 2>&1; then
    USE_HELM="true"
  else
    USE_HELM="false"
  fi
fi

if [ "$USE_HELM" = "true" ]; then
  echo "📦 Method: Helm Chart (deploy/helm/mylinks)"
  helm upgrade --install mylinks ./deploy/helm/mylinks \
    --namespace "$NAMESPACE" \
    --create-namespace \
    --set image.tag="$TAG" \
    --set replicaCount="$REPLICAS"
else
  echo "📄 Method: kubectl / Kustomize (deploy/k8s)"
  kubectl apply -k ./deploy/k8s -n "$NAMESPACE"
  kubectl scale deployment/mylinks --replicas="$REPLICAS" -n "$NAMESPACE"
  kubectl set image deployment/mylinks mylinks="ghcr.io/arvesv/mylinks:${TAG}" -n "$NAMESPACE"
fi

echo "⏳ Waiting for deployment rollout..."
kubectl rollout status deployment/mylinks -n "$NAMESPACE" --timeout=120s

echo "✨ MyLinks successfully deployed!"
echo "   Service type : ClusterIP (port 3000)"
echo "   Replicas     : ${REPLICAS}"
echo "   To access locally: kubectl port-forward -n ${NAMESPACE} svc/mylinks 3000:3000"
echo "=========================================================="
