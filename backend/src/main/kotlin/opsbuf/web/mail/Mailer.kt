package opsbuf.web.mail

import io.ktor.client.HttpClient
import io.ktor.client.request.bearerAuth
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.http.ContentType
import io.ktor.http.contentType
import io.ktor.http.isSuccess
import kotlinx.serialization.Serializable
import org.slf4j.LoggerFactory

data class MailMessage(val to: String, val subject: String, val text: String)

interface Mailer {
    suspend fun send(message: MailMessage)
}

class LogMailer : Mailer {
    private val log = LoggerFactory.getLogger(LogMailer::class.java)

    override suspend fun send(message: MailMessage) {
        log.info("Mail to {} | {}\n{}", message.to, message.subject, message.text)
    }
}

class ResendMailer(
    private val client: HttpClient,
    private val apiKey: String,
    private val from: String,
) : Mailer {
    override suspend fun send(message: MailMessage) {
        val response = client.post("https://api.resend.com/emails") {
            bearerAuth(apiKey)
            contentType(ContentType.Application.Json)
            setBody(ResendEmail(from = from, to = listOf(message.to), subject = message.subject, text = message.text))
        }
        check(response.status.isSuccess()) { "The mail to ${message.to} was not sent: HTTP ${response.status.value}." }
    }

    @Serializable
    private data class ResendEmail(val from: String, val to: List<String>, val subject: String, val text: String)
}
