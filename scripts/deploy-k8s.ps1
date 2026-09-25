<#
.SYNOPSIS
Deploy MyLinks to a Kubernetes cluster with dynamic image tag selection and configurable replicas.
.DESCRIPTION
Supports both Helm (if installed) and native kubectl/Kustomize. Allows deploying any tag (e.g. latest, master, v0.4.0) and replica count without modifying files.
.PARAMETER Tag
The container image tag to deploy (default: "latest").
.PARAMETER Namespace
The target Kubernetes namespace (default: "default").
.PARAMETER Replicas
Number of pod replicas to run (default: 1). Note that SQLite embedded storage requires single-writer access.
.PARAMETER PreferKubectl
Force using kubectl/Kustomize even if Helm is installed.
.EXAMPLE
.\scripts\deploy-k8s.ps1 -Tag v0.4.0
.\scripts\deploy-k8s.ps1 -Tag master -Replicas 1
.\scripts\deploy-k8s.ps1 -Tag latest -Namespace mylinks -Replicas 2
#>

param(
  [string]$Tag = "latest",
  [string]$Namespace = "default",
  [int]$Replicas = 1,
  [string]$AdminUsers = "",
  [switch]$PreferKubectl
)

$ErrorActionPreference = "Stop"

if ($Replicas -lt 1) {
  throw "Replicas must be at least 1."
}

if ($Replicas -gt 1) {
  Write-Warning "Running more than 1 replica with embedded SQLite storage and ReadWriteOnce PVC may lead to database lock errors or volume mount conflicts."
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "🚀 Deploying MyLinks to Kubernetes" -ForegroundColor Cyan
Write-Host "   Image Tag : $Tag" -ForegroundColor White
Write-Host "   Replicas  : $Replicas" -ForegroundColor White
Write-Host "   Namespace : $Namespace" -ForegroundColor White
if ($AdminUsers) {
  Write-Host "   Admins    : $AdminUsers" -ForegroundColor White
}
Write-Host "==========================================================" -ForegroundColor Cyan

$hasHelm = (Get-Command helm -ErrorAction SilentlyContinue) -ne $null

if ($hasHelm -and -not $PreferKubectl) {
  Write-Host "📦 Method: Helm Chart (deploy/helm/mylinks)" -ForegroundColor Green
  $helmArgs = @(
    "upgrade", "--install", "mylinks", "./deploy/helm/mylinks",
    "--namespace", $Namespace,
    "--create-namespace",
    "--set", "image.tag=$Tag",
    "--set", "replicaCount=$Replicas"
  )
  if ($AdminUsers) {
    $helmArgs += @("--set", "env.ADMIN_USERS=$AdminUsers")
  }
  helm @helmArgs
} else {
  Write-Host "📄 Method: kubectl / Kustomize (deploy/k8s)" -ForegroundColor Green
  kubectl apply -k ./deploy/k8s -n $Namespace
  kubectl scale deployment/mylinks --replicas=$Replicas -n $Namespace
  kubectl set image deployment/mylinks mylinks="ghcr.io/arvesv/mylinks:$Tag" -n $Namespace
  if ($AdminUsers) {
    kubectl set env deployment/mylinks ADMIN_USERS="$AdminUsers" -n $Namespace
  }
}

Write-Host "⏳ Waiting for deployment rollout..." -ForegroundColor Yellow
kubectl rollout status deployment/mylinks -n $Namespace --timeout=120s

Write-Host "✨ MyLinks successfully deployed!" -ForegroundColor Green
Write-Host "   Service type : ClusterIP (port 3000)" -ForegroundColor White
Write-Host "   Replicas     : $Replicas" -ForegroundColor White
Write-Host "   To access locally: kubectl port-forward -n $Namespace svc/mylinks 3000:3000" -ForegroundColor White
Write-Host "==========================================================" -ForegroundColor Cyan
