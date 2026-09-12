#!/usr/bin/env bash
# Finish the Baton backend deploy to Cloud Run.
#
# Blocked on one thing only: billing. The ALPHA account 01AAC6-B1804D-A49971 is
# at its project-count quota, so baton-hack-2026 could not be linked to it.
# Pass the billing account you want to use as the first argument, then this
# script does the rest.
#
#   ./scripts/deploy-backend.sh 01B713-83A549-FE1CD7     # BETA - Billing
#   ./scripts/deploy-backend.sh 01AAC6-B1804D-A49971     # ALPHA, once a slot is free
#
# Secrets are piped straight from the local files into Secret Manager and are
# never echoed, never passed as arguments and never baked into the image.
set -euo pipefail

BILLING="${1:?pass the billing account id, e.g. 01B713-83A549-FE1CD7}"
PROJECT="baton-hack-2026"
REGION="europe-west1"
SERVICE="baton"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Pin the configuration for this process only, so the machine-global active
# configuration (ohmlet) is never disturbed. Every command also passes
# --project explicitly, per Faith's conventions.
export CLOUDSDK_ACTIVE_CONFIG_NAME=baton

echo "==> linking billing $BILLING to $PROJECT"
gcloud billing projects link "$PROJECT" --billing-account="$BILLING"

echo "==> enabling APIs"
gcloud services enable \
  run.googleapis.com cloudbuild.googleapis.com \
  artifactregistry.googleapis.com secretmanager.googleapis.com \
  --project="$PROJECT"

PROJECT_NUMBER="$(gcloud projects describe "$PROJECT" --project="$PROJECT" --format='value(projectNumber)')"
RUNTIME_SA="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

echo "==> creating secrets (values are piped, never printed)"
# Ambiguous agent token, from the CLI config the local backend already uses.
if ! gcloud secrets describe baton-ambi-token --project="$PROJECT" >/dev/null 2>&1; then
  python3 -c "import json,sys; sys.stdout.write(json.load(open('$ROOT/.ambi/config.json'))['authToken'])" \
    | gcloud secrets create baton-ambi-token --project="$PROJECT" \
        --replication-policy=automatic --data-file=-
fi
# Webhook signing secret, from server/.env.
if ! gcloud secrets describe baton-webhook-secret --project="$PROJECT" >/dev/null 2>&1; then
  grep -m1 '^AMBI_WEBHOOK_SECRET=' "$ROOT/server/.env" | cut -d= -f2- | tr -d "\"' \n" \
    | gcloud secrets create baton-webhook-secret --project="$PROJECT" \
        --replication-policy=automatic --data-file=-
fi

echo "==> granting the runtime service account read access to both secrets"
for S in baton-ambi-token baton-webhook-secret; do
  gcloud secrets add-iam-policy-binding "$S" --project="$PROJECT" \
    --member="serviceAccount:${RUNTIME_SA}" \
    --role=roles/secretmanager.secretAccessor >/dev/null
done

echo "==> deploying $SERVICE to Cloud Run in $REGION"
# AMBI_BASE_URL is deliberately left unset so ingest.py keeps its default of
# https://app.ambiguous.ai, exactly as the working local backend behaves.
gcloud run deploy "$SERVICE" \
  --project="$PROJECT" \
  --region="$REGION" \
  --source="$ROOT/server" \
  --allow-unauthenticated \
  --port=8080 \
  --memory=1Gi \
  --cpu=1 \
  --timeout=300 \
  --min-instances=1 \
  --max-instances=3 \
  --set-env-vars="AMBI_BASE=https://api.ambiguous.ai,BATON_TEAM=Regulatory affairs,BATON_LEAD=Rachel Foster" \
  --set-secrets="AMBI_TOKEN=baton-ambi-token:latest,AMBI_WEBHOOK_SECRET=baton-webhook-secret:latest"

URL="$(gcloud run services describe "$SERVICE" --project="$PROJECT" --region="$REGION" --format='value(status.url)')"
echo "==> Cloud Run URL: $URL"

echo "==> verifying"
curl -s "$URL/health"; echo
curl -s "$URL/api/state" | head -c 600; echo

# The front end was built against the predicted URL. If Cloud Run handed out a
# different one, rebuild and redeploy Hosting so the deployed app points at it.
PREDICTED="https://baton-104295462760.europe-west1.run.app"
if [ "$URL" != "$PREDICTED" ]; then
  echo "==> URL differs from the predicted one, rebuilding the front end"
  ( cd "$ROOT/web" && VITE_API_BASE="$URL" npx vite build --outDir dist-hosting --emptyOutDir )
  ( cd "$ROOT" && firebase deploy --only hosting --project "$PROJECT" --non-interactive )
  echo "==> NOTE: add $URL's origin to the CORS list in server/main.py if the"
  echo "    Hosting origin ever changes, then redeploy the backend."
fi

echo "==> restoring the machine-global active configuration to ohmlet"
unset CLOUDSDK_ACTIVE_CONFIG_NAME
gcloud config configurations activate ohmlet

echo "done. Hosting: https://baton-hack-2026.web.app/app   Backend: $URL"
