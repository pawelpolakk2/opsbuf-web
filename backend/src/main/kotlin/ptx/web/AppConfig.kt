package ptx.web

import java.nio.file.Path
import kotlin.time.Duration
import kotlin.time.Duration.Companion.days
import kotlin.time.Duration.Companion.minutes
import kotlin.time.Duration.Companion.seconds

data class AppConfig(
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
        val from: String = "PTX <no-reply@example.com>",
    )

    companion object {
        fun fromEnvironment(env: Map<String, String> = System.getenv()): AppConfig = AppConfig(
            port = env["PTX_PORT"]?.toInt() ?: 8080,
            dataFile = Path.of(env["PTX_DATA_FILE"] ?: "data/store.json"),
            webDir = env["PTX_WEB_DIR"]?.let(Path::of),
            mail = MailConfig(
                resendApiKey = env["PTX_RESEND_API_KEY"]?.takeIf { it.isNotBlank() },
                from = env["PTX_MAIL_FROM"] ?: "PTX <no-reply@example.com>",
            ),
            showDevCodes = env["PTX_DEV_CODES"] == "true",
        )
    }
}
