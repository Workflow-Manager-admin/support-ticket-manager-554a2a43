#!/bin/bash
cd /home/kavia/workspace/code-generation/support-ticket-manager-554a2a43/ticket_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

