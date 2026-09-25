<#
.SYNOPSIS
Deploy MyLinks to a Kubernetes cluster with dynamic image tag selection.
.DESCRIPTION
Supports both Helm (if installed) and native kubectl/Kustomize. Allows deploying any tag (e.g. latest, master, v0.4.0) without modifying files.
.PARAMETER Tag
The container image tag to deploy (default: "latest").
.PARAMETER Namespace
The target Kubernetes namespace (default: "default").
.PARAMETER PreferKubectl
Force using kubectl/Kustomize even if Helm is installed.
.EXAMPLE
.\scripts\deploy-k8s.ps1 -Tag v0.4.0
.\scripts\deploy-k8s.ps1 -Tag master
.\scripts\deploy-k8s.ps1 -Tag latest -Namespace mylinks
#>

param(
  [string]$Tag = "latest",
  [string]$Namespace = "default",
  [switch]$PreferKubectl
)

$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "🚀 Deploying MyLinks to Kubernetes" -ForegroundColor Cyan
Write-Host "   Image Tag : $Tag" -ForegroundColor White
Write-Host "   Namespace : $Namespace" -ForegroundColor White
Write-Host "==========================================================" -ForegroundColor Cyan

$hasHelm = (Get-Command helm -ErrorAction SilentlyContinue) -ne $null

if ($hasHelm -and -not $PreferKubectl) {
  Write-Host "📦 Method: Helm Chart (deploy/helm/mylinks)" -ForegroundColor Green
  helm upgrade --install mylinks ./deploy/helm/mylinks `
    --namespace $Namespace `
    --create-namespace `
    --set image.tag=$Tag
} else {
  Write-Host "📄 Method: kubectl / Kustomize (deploy/k8s)" -ForegroundColor Green
  kubectl apply -k ./deploy/k8s -n $Namespace
  kubectl set image deployment/mylinks mylinks="ghcr.io/arvesv/mylinks:$Tag" -n $Namespace
}

Write-Host "⏳ Waiting for deployment rollout..." -ForegroundColor Yellow
kubectl rollout status deployment/mylinks -n $Namespace --timeout=120s

Write-Host "✨ MyLinks successfully deployed!" -ForegroundColor Green
Write-Host "   Service type : ClusterIP (port 3000)" -ForegroundColor White
Write-Host "   To access locally: kubectl port-forward -n $Namespace svc/mylinks 3000:3000" -ForegroundColor White
Write-Host "==========================================================" -ForegroundColor Cyan
