package opsbuf.web

import io.ktor.client.HttpClient
import io.ktor.client.engine.cio.CIO as ClientCIO
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.serialization.kotlinx.json.json
import io.ktor.server.cio.CIO
import io.ktor.server.engine.embeddedServer
import org.kodein.di.DI
import org.kodein.di.bindSingleton
import org.kodein.di.instance
import org.slf4j.LoggerFactory
import opsbuf.web.auth.AuthService
import opsbuf.web.licensing.DemoPaymentGateway
import opsbuf.web.licensing.LicenseService
import opsbuf.web.licensing.PaymentGateway
import opsbuf.web.mail.LogMailer
import opsbuf.web.mail.Mailer
import opsbuf.web.mail.ResendMailer
import opsbuf.web.store.Store
import java.time.Clock

fun main() {
    val config = AppConfig.fromEnvironment()
    val di = createDi(config)
    LoggerFactory.getLogger("opsbuf.web").info("opsbuf web listens on http://localhost:{}", config.port)
    embeddedServer(CIO, port = config.port, host = config.host) { opsbufModule(di) }.start(wait = true)
}

fun createDi(config: AppConfig) = DI {
    bindSingleton { config }
    bindSingleton { Clock.systemUTC() }
    bindSingleton { Store(config.dataFile) }
    bindSingleton { HttpClient(ClientCIO) { install(ContentNegotiation) { json() } } }
    bindSingleton<Mailer> { createMailer(config, instance()) }
    bindSingleton<PaymentGateway> { DemoPaymentGateway() }
    bindSingleton { AuthService(instance(), instance(), instance(), instance()) }
    bindSingleton { LicenseService(instance(), instance(), instance()) }
}

private fun createMailer(config: AppConfig, client: HttpClient): Mailer {
    val apiKey = config.mail.resendApiKey ?: return LogMailer()
    return ResendMailer(client, apiKey, config.mail.from)
}
