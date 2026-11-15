package ptx.web.http

import io.ktor.http.HttpStatusCode
import io.ktor.server.application.ApplicationCall
import io.ktor.server.auth.authenticate
import io.ktor.server.auth.principal
import io.ktor.server.request.receive
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.delete
import io.ktor.server.routing.get
import io.ktor.server.routing.post
import io.ktor.server.routing.route
import ptx.web.auth.AuthService
import ptx.web.auth.CodeRequest
import ptx.web.auth.Verification
import ptx.web.licensing.LicenseOutcome
import ptx.web.licensing.LicenseService
import ptx.web.licensing.Plans
import ptx.web.licensing.PurchaseRequest
import ptx.web.licensing.Refusal
import ptx.web.store.User

const val SESSION_AUTH = "session"

data class SessionPrincipal(val user: User, val token: String)

fun Route.authRoutes(auth: AuthService) = route("/api/auth") {
    post("/code") {
        when (val request = auth.requestCode(call.receive<EmailBody>().email)) {
            is CodeRequest.Sent -> call.respond(CodeSentResponse(request.devCode))
            is CodeRequest.TooSoon -> call.respond(
                HttpStatusCode.TooManyRequests,
                ErrorResponse("Wait ${request.retryInSeconds} s before you ask for a new code.", retryInSeconds = request.retryInSeconds),
            )
            CodeRequest.InvalidEmail -> call.respond(HttpStatusCode.BadRequest, ErrorResponse("This is not a valid email address."))
        }
    }
    post("/verify") {
        val body = call.receive<VerifyBody>()
        when (val verification = auth.verifyCode(body.email, body.code)) {
            is Verification.Verified -> call.respond(SessionResponse(verification.token, verification.user.toView()))
            is Verification.WrongCode -> call.respond(
                HttpStatusCode.Unauthorized,
                ErrorResponse("This code is wrong.", attemptsLeft = verification.attemptsLeft),
            )
            Verification.NoValidCode -> call.respond(
                HttpStatusCode.Unauthorized,
                ErrorResponse("The code has expired or was used up. Ask for a new one."),
            )
        }
    }
    authenticate(SESSION_AUTH) {
        get("/me") { call.respond(call.requireSession().user.toView()) }
        post("/logout") {
            auth.logout(call.requireSession().token)
            call.respond(HttpStatusCode.NoContent)
        }
    }
}

fun Route.planRoutes() = get("/api/plans") { call.respond(Plans.all) }

fun Route.licenseRoutes(licenses: LicenseService) = authenticate(SESSION_AUTH) {
    route("/api/licenses") {
        get {
            val user = call.requireSession().user
            call.respond(licenses.listLicensesOf(user).map { it.toView(user, licenses.calculateDeviceLimit(it)) })
        }
        post {
            val body = call.receive<PurchaseBody>()
            val user = call.requireSession().user
            call.respondOutcome(licenses.purchase(user, PurchaseRequest(body.planId, body.seats, body.billing)), licenses, HttpStatusCode.Created)
        }
        post("/{id}/members") {
            val user = call.requireSession().user
            call.respondOutcome(licenses.addMember(user, call.requireParameter("id"), call.receive<MemberBody>().email), licenses)
        }
        delete("/{id}/members/{email}") {
            val user = call.requireSession().user
            call.respondOutcome(licenses.removeMember(user, call.requireParameter("id"), call.requireParameter("email")), licenses)
        }
        delete("/{id}/activations/{machineId}") {
            val user = call.requireSession().user
            call.respondOutcome(licenses.deactivate(user, call.requireParameter("id"), call.requireParameter("machineId")), licenses)
        }
        post("/{id}/cancel") {
            call.respondOutcome(licenses.cancelRenewal(call.requireSession().user, call.requireParameter("id")), licenses)
        }
        post("/{id}/resume") {
            call.respondOutcome(licenses.resumeRenewal(call.requireSession().user, call.requireParameter("id")), licenses)
        }
    }
    get("/api/orders") { call.respond(licenses.listOrdersOf(call.requireSession().user)) }
}

fun Route.activationRoutes(licenses: LicenseService) = post("/api/activations") {
    val body = call.receive<ActivateBody>()
    when (val outcome = licenses.activate(body.key, body.machineId, body.machineName)) {
        is LicenseOutcome.Done -> call.respond(outcome.license.toActivationResponse())
        is LicenseOutcome.Refused -> call.respond(outcome.reason.toStatus(), ErrorResponse(outcome.message))
    }
}

private suspend fun ApplicationCall.respondOutcome(
    outcome: LicenseOutcome,
    licenses: LicenseService,
    successStatus: HttpStatusCode = HttpStatusCode.OK,
) = when (outcome) {
    is LicenseOutcome.Done -> respond(successStatus, outcome.license.toView(requireSession().user, licenses.calculateDeviceLimit(outcome.license)))
    is LicenseOutcome.Refused -> respond(outcome.reason.toStatus(), ErrorResponse(outcome.message))
}

private fun Refusal.toStatus() = when (this) {
    Refusal.NOT_FOUND -> HttpStatusCode.NotFound
    Refusal.FORBIDDEN -> HttpStatusCode.Forbidden
    Refusal.CONFLICT -> HttpStatusCode.Conflict
    Refusal.INVALID -> HttpStatusCode.BadRequest
}

private fun ApplicationCall.requireSession(): SessionPrincipal =
    principal<SessionPrincipal>() ?: error("The route needs a session but has none.")

private fun ApplicationCall.requireParameter(name: String): String =
    parameters[name] ?: error("The route has no '$name' parameter.")
