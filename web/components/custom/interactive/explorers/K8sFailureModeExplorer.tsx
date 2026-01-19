"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  AlertTriangle,
  Server,
  HardDrive,
  Image,
  Settings,
  Wifi,
  Terminal,
  FileText,
  Wrench,
  Play,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

type FailureType = "crashloop" | "oom" | "imagepull" | "config" | "network"

interface FailureMode {
  id: FailureType
  name: string
  icon: typeof AlertTriangle
  color: string
  description: string
  podYaml: string
  kubectlOutput: string
  logs: string
  diagnosis: string
  remediation: string[]
}

const FAILURE_MODES: Record<FailureType, FailureMode> = {
  crashloop: {
    id: "crashloop",
    name: "CrashLoopBackOff",
    icon: AlertTriangle,
    color: "text-red-500",
    description: "Container repeatedly crashes and restarts, entering a backoff loop.",
    podYaml: `apiVersion: v1
kind: Pod
metadata:
  name: crashloop-demo
spec:
  containers:
  - name: app
    image: busybox
    command: ["sh", "-c", "exit 1"]  # Always exits with error`,
    kubectlOutput: `NAME             READY   STATUS             RESTARTS   AGE
crashloop-demo   0/1     CrashLoopBackOff   5          3m

Events:
  Type     Reason     Age                From               Message
  ----     ------     ----               ----               -------
  Normal   Scheduled  3m                 default-scheduler  Successfully assigned
  Normal   Pulled     2m (x5 over 3m)    kubelet            Container image pulled
  Warning  BackOff    30s (x10 over 3m)  kubelet            Back-off restarting failed container`,
    logs: `Error: Application failed to start
Exception: Missing required environment variable DATABASE_URL
Stack trace:
  at Config.validate (config.js:45)
  at main (index.js:12)
Process exited with code 1`,
    diagnosis: "The container is crashing immediately after startup due to a missing DATABASE_URL environment variable. The application's configuration validation fails, causing it to exit with code 1. Kubernetes detects the crash and attempts to restart, but the same error occurs each time.",
    remediation: [
      "Add the missing DATABASE_URL environment variable to the pod spec",
      "Create a ConfigMap or Secret with the database connection string",
      "Update the deployment to reference the ConfigMap/Secret",
      "Verify the database is accessible from the pod's network",
    ],
  },
  oom: {
    id: "oom",
    name: "OOMKilled",
    icon: HardDrive,
    color: "text-orange-500",
    description: "Container exceeds memory limits and is killed by the OOM killer.",
    podYaml: `apiVersion: v1
kind: Pod
metadata:
  name: oom-demo
spec:
  containers:
  - name: memory-hog
    image: polinux/stress
    resources:
      limits:
        memory: "64Mi"
    command: ["stress", "--vm", "1", "--vm-bytes", "128M"]`,
    kubectlOutput: `NAME       READY   STATUS      RESTARTS   AGE
oom-demo   0/1     OOMKilled   3          2m

Events:
  Type     Reason     Age               From               Message
  ----     ------     ----              ----               -------
  Normal   Scheduled  2m                default-scheduler  Successfully assigned
  Normal   Pulled     90s (x3 over 2m)  kubelet            Container image pulled
  Warning  BackOff    60s               kubelet            Back-off restarting failed container
  
Last State: Terminated
  Reason:       OOMKilled
  Exit Code:    137
  Started:      Mon, 01 Jan 2025 10:00:00 +0000
  Finished:     Mon, 01 Jan 2025 10:00:05 +0000`,
    logs: `Starting memory allocation...
Allocated 32MB
Allocated 64MB
Killed`,
    diagnosis: "The container is being terminated by the Linux OOM (Out of Memory) killer because it's trying to allocate 128MB of memory but only has a 64Mi limit. Exit code 137 (128 + 9) indicates the process was killed by SIGKILL from the OOM killer.",
    remediation: [
      "Increase the memory limit in the pod spec to accommodate actual usage",
      "Profile the application to understand memory requirements",
      "Implement memory-efficient algorithms or add pagination",
      "Consider using a HorizontalPodAutoscaler to scale out instead of up",
    ],
  },
  imagepull: {
    id: "imagepull",
    name: "ImagePullBackOff",
    icon: Image,
    color: "text-purple-500",
    description: "Kubernetes cannot pull the container image from the registry.",
    podYaml: `apiVersion: v1
kind: Pod
metadata:
  name: imagepull-demo
spec:
  containers:
  - name: app
    image: private-registry.io/myapp:v1.0.0
    # Missing imagePullSecrets for private registry`,
    kubectlOutput: `NAME              READY   STATUS             RESTARTS   AGE
imagepull-demo    0/1     ImagePullBackOff   0          5m

Events:
  Type     Reason          Age                From               Message
  ----     ------          ----               ----               -------
  Normal   Scheduled       5m                 default-scheduler  Successfully assigned
  Normal   Pulling         4m (x4 over 5m)    kubelet            Pulling image "private-registry.io/myapp:v1.0.0"
  Warning  Failed          4m (x4 over 5m)    kubelet            Failed to pull image: unauthorized
  Warning  Failed          4m (x4 over 5m)    kubelet            Error: ErrImagePull
  Normal   BackOff         3m (x6 over 5m)    kubelet            Back-off pulling image`,
    logs: `No logs available - container never started`,
    diagnosis: "The kubelet cannot pull the image from the private registry because no imagePullSecrets are configured. The registry requires authentication, but the pod doesn't have credentials to access it.",
    remediation: [
      "Create a docker-registry secret with registry credentials",
      "Add imagePullSecrets to the pod spec or service account",
      "Verify the image name and tag are correct",
      "Check if the registry is accessible from the cluster network",
    ],
  },
  config: {
    id: "config",
    name: "ConfigError",
    icon: Settings,
    color: "text-amber-500",
    description: "Pod fails to start due to configuration issues like missing ConfigMaps or Secrets.",
    podYaml: `apiVersion: v1
kind: Pod
metadata:
  name: config-demo
spec:
  containers:
  - name: app
    image: nginx
    envFrom:
    - configMapRef:
        name: app-config  # ConfigMap doesn't exist
    volumeMounts:
    - name: secrets
      mountPath: /etc/secrets
  volumes:
  - name: secrets
    secret:
      secretName: app-secrets  # Secret doesn't exist`,
    kubectlOutput: `NAME          READY   STATUS                       RESTARTS   AGE
config-demo   0/1     CreateContainerConfigError   0          1m

Events:
  Type     Reason       Age               From               Message
  ----     ------       ----              ----               -------
  Normal   Scheduled    1m                default-scheduler  Successfully assigned
  Warning  Failed       1m                kubelet            Error: configmap "app-config" not found
  Warning  Failed       30s               kubelet            Error: secret "app-secrets" not found`,
    logs: `No logs available - container never started`,
    diagnosis: "The pod cannot start because it references a ConfigMap 'app-config' and Secret 'app-secrets' that don't exist in the namespace. Kubernetes cannot create the container without these required configuration resources.",
    remediation: [
      "Create the missing ConfigMap with required configuration",
      "Create the missing Secret with required credentials",
      "Make ConfigMap/Secret references optional if appropriate",
      "Verify resources are in the same namespace as the pod",
    ],
  },
  network: {
    id: "network",
    name: "NetworkIssue",
    icon: Wifi,
    color: "text-blue-500",
    description: "Pod is running but cannot communicate with other services or external endpoints.",
    podYaml: `apiVersion: v1
kind: Pod
metadata:
  name: network-demo
spec:
  containers:
  - name: app
    image: curlimages/curl
    command: ["sleep", "infinity"]
---
apiVersion: v1
kind: NetworkPolicy
metadata:
  name: deny-all
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress`,
    kubectlOutput: `NAME           READY   STATUS    RESTARTS   AGE
network-demo   1/1     Running   0          5m

# But when testing connectivity:
$ kubectl exec network-demo -- curl -s --max-time 5 http://api-service:8080
curl: (28) Connection timed out

$ kubectl exec network-demo -- nslookup api-service
;; connection timed out; no servers could be reached`,
    logs: `Application started successfully
Attempting to connect to database at db-service:5432...
Connection timeout after 30s
Retrying connection (attempt 2/5)...
Connection timeout after 30s
Error: Unable to establish database connection
Service unhealthy - cannot reach dependencies`,
    diagnosis: "The pod is running but a NetworkPolicy is blocking all ingress and egress traffic. The application cannot reach the database service or resolve DNS names. This is a common issue when NetworkPolicies are applied without proper exceptions.",
    remediation: [
      "Review and update NetworkPolicy to allow required traffic",
      "Add egress rules for DNS (port 53) to kube-dns",
      "Add egress rules for required service endpoints",
      "Verify Service and Endpoint objects exist for target services",
    ],
  },
}

export function K8sFailureModeExplorer() {
  const [selectedFailure, setSelectedFailure] = useState<FailureType>("crashloop")
  const [activeTab, setActiveTab] = useState<"yaml" | "kubectl" | "logs" | "diagnosis" | "remediation">("yaml")
  const [showFlow, setShowFlow] = useState(false)
  const [flowStep, setFlowStep] = useState(0)

  const failure = FAILURE_MODES[selectedFailure]
  const Icon = failure.icon

  const runFlow = () => {
    setShowFlow(true)
    setFlowStep(0)
    const steps = ["yaml", "kubectl", "logs", "diagnosis", "remediation"]
    let step = 0
    const interval = setInterval(() => {
      step++
      if (step >= steps.length) {
        clearInterval(interval)
      } else {
        setFlowStep(step)
        setActiveTab(steps[step] as typeof activeTab)
      }
    }, 2000)
  }

  return (
    <Card className="my-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="h-5 w-5 text-primary" />
          K8s Failure Mode Explorer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Failure Type Selector */}
        <div className="flex flex-wrap gap-3 items-center">
          <Select value={selectedFailure} onValueChange={(v) => {
            setSelectedFailure(v as FailureType)
            setShowFlow(false)
          }}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.values(FAILURE_MODES).map((mode) => {
                const ModeIcon = mode.icon
                return (
                  <SelectItem key={mode.id} value={mode.id}>
                    <div className="flex items-center gap-2">
                      <ModeIcon className={cn("h-4 w-4", mode.color)} />
                      {mode.name}
                    </div>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
          <Button onClick={runFlow} variant="outline" className="gap-2">
            <Play className="h-4 w-4" /> Walk Through Flow
          </Button>
        </div>

        {/* Failure Description */}
        <div className={cn("p-4 rounded-lg border", `bg-${failure.color.split("-")[1]}-500/10`)}>
          <div className="flex items-center gap-3">
            <Icon className={cn("h-6 w-6", failure.color)} />
            <div>
              <h3 className="font-semibold">{failure.name}</h3>
              <p className="text-sm text-muted-foreground">{failure.description}</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: "yaml", label: "Pod YAML", icon: FileText },
            { id: "kubectl", label: "kubectl Output", icon: Terminal },
            { id: "logs", label: "Container Logs", icon: FileText },
            { id: "diagnosis", label: "AI Diagnosis", icon: AlertTriangle },
            { id: "remediation", label: "Remediation", icon: Wrench },
          ].map((tab, index) => {
            const TabIcon = tab.icon
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={cn(
                  "gap-2",
                  showFlow && flowStep >= index && "ring-2 ring-primary"
                )}
              >
                <TabIcon className="h-4 w-4" />
                {tab.label}
              </Button>
            )
          })}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {activeTab === "yaml" && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Example Pod YAML</h4>
                <pre className="p-4 rounded-lg bg-muted text-xs font-mono overflow-x-auto">
                  {failure.podYaml}
                </pre>
              </div>
            )}

            {activeTab === "kubectl" && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">kubectl Output</h4>
                <pre className="p-4 rounded-lg bg-zinc-900 text-green-400 text-xs font-mono overflow-x-auto">
                  {failure.kubectlOutput}
                </pre>
              </div>
            )}

            {activeTab === "logs" && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Container Logs</h4>
                <pre className="p-4 rounded-lg bg-zinc-900 text-zinc-300 text-xs font-mono overflow-x-auto">
                  {failure.logs}
                </pre>
              </div>
            )}

            {activeTab === "diagnosis" && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  AI Agent Diagnosis
                </h4>
                <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/5">
                  <p className="text-sm">{failure.diagnosis}</p>
                </div>
              </div>
            )}

            {activeTab === "remediation" && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-green-500" />
                  Remediation Plan
                </h4>
                <div className="p-4 rounded-lg border border-green-500/30 bg-green-500/5">
                  <ol className="space-y-2">
                    {failure.remediation.map((step, i) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <Badge variant="outline" className="shrink-0">{i + 1}</Badge>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
