import { createHmac } from 'node:crypto'

// CAWL (Crédit Agricole) hosted checkout — redirect-only integration (PCI
// DSS SAQ A, see payment module notes): we never touch card data, just
// create a checkout session and redirect the employee to CAWL's own hosted
// payment page. CAWL_ENV switches sandbox/prod with a single env var — swap
// CAWL_API_KEY_ID/CAWL_API_SECRET_KEY/CAWL_MERCHANT_ID/CAWL_WEBHOOK_SECRET
// for the real ones when production access lands, nothing else changes.

const HOST =
  process.env.CAWL_ENV === 'production'
    ? 'payment.cawl-solutions.fr'
    : 'payment.preprod.cawl-solutions.fr'

function requiredEnv(name: string) {
  const value = process.env[name]
  if (!value) throw new Error(`${name} is not set`)
  return value
}

// Manual (non-SDK) request signing, per
// docs.ecommerce.cawl-solutions.fr/fr/integration/api-developer-guide/manual-authentication —
// validated against the real sandbox API (see payment module memory notes).
// Authorization: GCS v1HMAC:{apiKeyId}:{signature}, signature = Base64(
// HMAC-SHA256(stringToSign, apiSecret)). stringToSign is METHOD, Content-Type,
// Date, canonical x-gcs-* headers, request-path — each \n-terminated.
function signRequest(method: 'GET' | 'POST', path: string, contentType: string) {
  const apiKeyId = requiredEnv('CAWL_API_KEY_ID')
  const apiSecret = requiredEnv('CAWL_API_SECRET_KEY')
  const date = new Date().toUTCString()

  const stringToSign = [method, contentType, date, `x-gcs-date:${date}`, path].join('\n') + '\n'
  const signature = createHmac('sha256', apiSecret).update(stringToSign, 'utf8').digest('base64')

  return {
    date,
    authorization: `GCS v1HMAC:${apiKeyId}:${signature}`,
  }
}

export type CreateHostedCheckoutInput = {
  amount: number // TTC, euros (converted to minor units here)
  orderNumber: string
  returnUrl: string
}

export type CreateHostedCheckoutResult = {
  redirectUrl: string
  hostedCheckoutId: string
}

export async function createHostedCheckout({
  amount,
  orderNumber,
  returnUrl,
}: CreateHostedCheckoutInput): Promise<CreateHostedCheckoutResult> {
  const merchantId = requiredEnv('CAWL_MERCHANT_ID')
  const path = `/v2/${merchantId}/hostedcheckouts`
  const { date, authorization } = signRequest('POST', path, 'application/json')

  const body = JSON.stringify({
    order: {
      amountOfMoney: {
        amount: Math.round(amount * 100),
        currencyCode: 'EUR',
      },
      customer: {
        billingAddress: { countryCode: 'FR' },
      },
      references: { merchantReference: orderNumber },
    },
    hostedCheckoutSpecificInput: {
      locale: 'fr-FR',
      returnUrl,
    },
  })

  const res = await fetch(`https://${HOST}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Date: date,
      'X-GCS-Date': date,
      Authorization: authorization,
    },
    body,
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`[cawl] createHostedCheckout failed: ${res.status} ${text}`)
  }

  const data = (await res.json()) as { redirectUrl: string; hostedCheckoutId: string }
  return { redirectUrl: data.redirectUrl, hostedCheckoutId: data.hostedCheckoutId }
}

// Matches an incoming webhook event to one of our orders. CAWL's docs
// confirm this path: payment.paymentOutput.references.merchantReference —
// which we set to our own order_number when creating the checkout, so it's
// always under our control (never CAWL's internal payment id).
export type CawlWebhookPaymentEvent = {
  type: string
  payment: {
    id: string
    status: string
    paymentOutput?: {
      references?: { merchantReference?: string }
    }
  }
}

// NOTE: the exact signature header name for incoming webhooks isn't clearly
// documented (CAWL's docs point to their server SDK instead of stating it
// plainly). Until we've observed a real webhook delivery (first live sandbox
// test), this logs every header so we can read the real name from the
// Vercel/dev logs, and does NOT reject the request — do not treat this as
// verified security until locked down. See payment module memory notes.
export function verifyWebhookSignatureUnconfirmed(headers: Headers, rawBody: string): boolean {
  const secret = requiredEnv('CAWL_WEBHOOK_SECRET')
  const candidateHeaderNames = ['x-gcs-signature', 'x-signature', 'x-cawl-signature']
  const received = candidateHeaderNames.map((name) => headers.get(name)).find(Boolean)

  console.log('[cawl webhook] all headers:', JSON.stringify(Object.fromEntries(headers.entries())))

  if (!received) {
    console.warn(
      '[cawl webhook] no recognized signature header found among',
      candidateHeaderNames,
      '— accepting anyway (verification not yet locked down), but check the logged headers above and update lib/cawl.ts'
    )
    return true
  }

  const expected = createHmac('sha256', secret).update(rawBody, 'utf8').digest('base64')
  return received === expected
}
