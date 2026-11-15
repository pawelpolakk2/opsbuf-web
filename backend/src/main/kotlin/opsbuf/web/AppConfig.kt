package opsbuf.web

import java.nio.file.Path
import kotlin.time.Duration
import kotlin.time.Duration.Companion.days
import kotlin.time.Duration.Companion.minutes
import kotlin.time.Duration.Companion.seconds

data class AppConfig(
    val host: String = "0.0.0.0",
    val port: Int = 8080,
    val dataFile: Path? = Path.of("data/store.json"),
    val webDir: Path? = null,
    val mail: MailConfig = MailConfig(),
    val showDevCodes: Boolean = false,
    val codeTtl: Duration = 10.minutes,
    val codeResendAfter: Duration = 30.seconds,
    val codeAttempts: Int = 5,
    val sessionTtl: Duration = 30.days,
) {
    data class MailConfig(
        val resendApiKey: String? = null,
        val from: String = "opsbuf <no-reply@example.com>",
    )

    companion object {
        fun fromEnvironment(env: Map<String, String> = System.getenv()): AppConfig = AppConfig(
            host = env["OPSBUF_HOST"] ?: "0.0.0.0",
            port = env["OPSBUF_PORT"]?.toInt() ?: 8080,
            dataFile = Path.of(env["OPSBUF_DATA_FILE"] ?: "data/store.json"),
            webDir = env["OPSBUF_WEB_DIR"]?.let(Path::of),
            mail = MailConfig(
                resendApiKey = env["OPSBUF_RESEND_API_KEY"]?.takeIf { it.isNotBlank() },
                from = env["OPSBUF_MAIL_FROM"] ?: "opsbuf <no-reply@example.com>",
            ),
            showDevCodes = env["OPSBUF_DEV_CODES"] == "true",
        )
    }
}
