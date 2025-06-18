{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Backend (src/server.ts)",
      "runtimeExecutable": "ts-node-dev",
      "runtimeArgs": [
        "--respawn",
        "--transpile-only",
        "${workspaceFolder}/src/server.ts"
      ],
      "envFile": "${workspaceFolder}/.env",
      "cwd": "${workspaceFolder}",
      "skipFiles": [
        "<node_internals>/**"
      ]
    }
  ]
}