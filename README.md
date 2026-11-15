# PTX web

The website of PTX (ptx-rust): features, pricing, purchase and license management with email sign-in.

| Part       | Stack                                                                  |
|------------|------------------------------------------------------------------------|
| `frontend` | Angular 22, standalone, zoneless, signals                              |
| `backend`  | Kotlin, Ktor (CIO server and client), Kodein DI, GraalVM native image  |

## Run in development

```bash
cd backend && PTX_PORT=8095 PTX_DEV_CODES=true ./gradlew run
```

```bash
cd frontend && pnpm start
```

Open http://localhost:4200. The dev server proxies `/api` to the backend on port 8095 (`frontend/proxy.conf.json`).
`PTX_DEV_CODES=true` shows the sign-in code on the page, so no mail service is needed. Never set it in production.

## Backend

| Variable             | Default            | Meaning                                                        |
|----------------------|--------------------|----------------------------------------------------------------|
| `PTX_HOST`           | `0.0.0.0`          | Address to listen on; `127.0.0.1` behind a proxy               |
| `PTX_PORT`           | `8080`             | HTTP port                                                      |
| `PTX_DATA_FILE`      | `data/store.json`  | JSON file with users, sessions, licenses and orders            |
| `PTX_WEB_DIR`        | none               | Built frontend to serve as a single-page app                   |
| `PTX_RESEND_API_KEY` | none               | Sends the sign-in codes through Resend; without it they go to the log |
| `PTX_MAIL_FROM`      | `PTX <no-reply@example.com>` | Sender of the sign-in mails                          |
| `PTX_DEV_CODES`      | `false`            | Returns the sign-in code in the API response (dev only)        |

API:

| Method and path                                    | Auth    | Does                                        |
|----------------------------------------------------|---------|---------------------------------------------|
| `POST /api/auth/code` `{email}`                    | none    | Mails a 6-digit code (10 min, 5 attempts, one per 30 s) |
| `POST /api/auth/verify` `{email, code}`            | none    | Returns a session token (30 days)           |
| `GET /api/auth/me`, `POST /api/auth/logout`        | session | Current user, sign out                      |
| `GET /api/plans`                                   | none    | Plans and prices                            |
| `GET /api/licenses`, `POST /api/licenses`          | session | Licenses you own or have a seat on; buy one |
| `POST /api/licenses/{id}/members`, `DELETE …/members/{email}` | owner | Assign or free a seat         |
| `DELETE /api/licenses/{id}/activations/{machineId}` | owner  | Free an activated machine                   |
| `POST /api/licenses/{id}/cancel`, `…/resume`        | owner  | Stop or resume the renewal                  |
| `GET /api/orders`                                  | session | Payments                                    |
| `POST /api/activations` `{key, machineId, machineName}` | none | Called by the PTX app to activate a machine |

The payment is a `DemoPaymentGateway` that always succeeds. A real provider is one class behind `PaymentGateway`.

## Build for production

```bash
cd frontend && pnpm build
```

```bash
cd backend && ./gradlew nativeCompile
```

`nativeCompile` needs a GraalVM JDK 21+ with `native-image` in `GRAALVM_HOME`. Gradle itself runs on `JAVA_HOME`.
The binary lands in `backend/build/native/nativeCompile/ptx-web` (about 46 MB, starts in milliseconds, ~30 MB RSS).
Run it with `PTX_WEB_DIR=frontend/dist/frontend/browser` to serve the site and the API from one process.
`./gradlew installDist` builds a plain JVM version instead.

If the C linker fails with `unknown architecture` in `libSystem.B.tbd`, `xcode-select` points to an Xcode older than
the macOS SDK. Build with the Command Line Tools instead; the build passes `DEVELOPER_DIR` on to `native-image`:

```bash
DEVELOPER_DIR=/Library/Developer/CommandLineTools ./gradlew nativeCompile
```

kotlinx.serialization finds serializers by reflection, so every `@Serializable` class must be listed in
`src/main/resources/META-INF/native-image/ptx.web/ptx-web/reachability-metadata.json`. `NativeMetadataTest` fails
when one is missing.

## Tests

```bash
cd backend && ./gradlew test
```

```bash
cd frontend && pnpm exec ng test --watch=false
```
