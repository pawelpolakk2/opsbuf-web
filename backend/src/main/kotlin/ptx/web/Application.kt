package ptx.web

import io.ktor.http.HttpStatusCode
import io.ktor.serialization.kotlinx.json.json
import io.ktor.server.application.Application
import io.ktor.server.application.install
import io.ktor.server.auth.Authentication
import io.ktor.server.auth.bearer
import io.ktor.server.http.content.singlePageApplication
import io.ktor.server.plugins.BadRequestException
import io.ktor.server.plugins.contentnegotiation.ContentNegotiation
import io.ktor.server.plugins.statuspages.StatusPages
import io.ktor.server.response.respond
import io.ktor.server.routing.routing
import kotlinx.serialization.json.Json
import org.kodein.di.DI
import org.kodein.di.instance
import org.slf4j.LoggerFactory
import ptx.web.auth.AuthService
import ptx.web.http.ErrorResponse
import ptx.web.http.SESSION_AUTH
import ptx.web.http.SessionPrincipal
import ptx.web.http.activationRoutes
import ptx.web.http.authRoutes
import ptx.web.http.licenseRoutes
import ptx.web.http.planRoutes
import ptx.web.licensing.LicenseService

fun Application.ptxModule(di: DI) {
    val config: AppConfig by di.instance()
    val auth: AuthService by di.instance()
    val licenses: LicenseService by di.instance()

    installJson()
    installErrorPages()
    installSessionAuth(auth)
    routing {
        authRoutes(auth)
        planRoutes()
        licenseRoutes(licenses)
        activationRoutes(licenses)
        config.webDir?.let { webDir ->
            singlePageApplication { filesPath = webDir.toString() }
        }
    }
}

private fun Application.installJson() = install(ContentNegotiation) {
    json(Json {
        explicitNulls = false
        ignoreUnknownKeys = true
    })
}

private fun Application.installErrorPages() = install(StatusPages) {
    val log = LoggerFactory.getLogger("ptx.web.errors")
    exception<BadRequestException> { call, cause ->
        call.respond(HttpStatusCode.BadRequest, ErrorResponse(cause.message ?: "The request is not valid."))
    }
    exception<Throwable> { call, cause ->
        log.error("Request {} failed", call.request.local.uri, cause)
        call.respond(HttpStatusCode.InternalServerError, ErrorResponse("Something went wrong on our side."))
    }
}

private fun Application.installSessionAuth(auth: AuthService) = install(Authentication) {
    bearer(SESSION_AUTH) {
        authenticate { credential -> auth.findUserByToken(credential.token)?.let { SessionPrincipal(it, credential.token) } }
    }
}
